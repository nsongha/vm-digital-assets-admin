import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import StatusPill from '../components/StatusPill';
import Toast from '../components/Toast';
import { COLLECTIONS_META } from '../data/collections';
import { countByStatus, totalCount, totalSizeMB } from '../data/selectors';
import { formatSizeMB } from '../data/sizeFormulas';
import { mulberry32, randFloat } from '../utils/prng';
import { services } from '../services';
import styles from './BackupPage.module.css';

// B7 — Sao lưu & khôi phục. PHẢI khớp docs/02-quy-trinh-bao-quan-sao-luu.md:
// RPO ≤ 24 giờ / RTO ≤ 4 giờ (Mục 5), lịch sao lưu (Mục 5), 3 tầng lưu trữ +
// quy tắc 3-2-1 (Mục 2), KPI bảo quản (Mục 9). Dung lượng tầng AIP/lạnh
// derive từ `totalSizeMB(assets)` (data/selectors.ts) — không ghi cứng; lịch
// sao lưu và kiến trúc 3 tầng là CHÍNH SÁCH của tài liệu 02 nên giữ nguyên
// văn (không phải fact hiện vật, không cần derive từ mảng assets).

type BackupKind = 'Đầy đủ' | 'Gia tăng';
type VerifyState = 'verified' | 'verifying';

interface RecoveryPoint {
  id: string;
  time: string; // 'dd/mm/yyyy 03:00'
  dateLabel: string; // 'dd/mm/yyyy' — cũng là chuỗi xác nhận khi khôi phục
  kind: BackupKind;
  sizeMB: number;
  verify: VerifyState;
}

type RestoreStep = 'scope' | 'warn' | 'confirm' | 'running' | null;

const SCHEDULE_ROWS = [
  { kind: 'Gia tăng (incremental)', freq: 'Hàng ngày', time: '03:00', scope: 'Thay đổi trong 24 giờ', owner: 'Quản trị hệ thống' },
  { kind: 'Đầy đủ (full)', freq: 'Hàng tuần', time: 'Chủ nhật, ngoài giờ hành chính', scope: 'Toàn bộ AIP', owner: 'Quản trị hệ thống' },
  {
    kind: 'Diễn tập khôi phục',
    freq: 'Hàng quý',
    time: 'Theo lịch nội bộ, có biên bản',
    scope: 'Chọn mẫu đại diện + 1 kịch bản toàn hệ thống/năm',
    owner: 'Cán bộ bảo quản số + Quản trị hệ thống',
  },
  { kind: 'Sao chép off-site', freq: 'Hàng ngày (theo sau bản gia tăng)', time: 'Sau 03:00', scope: 'Đồng bộ sang tầng lạnh', owner: 'Quản trị hệ thống' },
];

const VERIFY_COLORS: Record<VerifyState, readonly [string, string]> = {
  verified: ['var(--accent-soft)', 'var(--accent-text)'],
  verifying: ['#fff1b0', '#6b5900'],
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatVnDate(d: Date): string {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function parseVnDate(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(s.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

/** 8 điểm khôi phục gần nhất trước mốc `refDate`, khớp lịch 03:00 hàng ngày / đầy đủ Chủ nhật — RNG seed cố định cho phần ước tính dung lượng gia tăng. */
function buildInitialPoints(totalMB: number, refDate: Date): RecoveryPoint[] {
  const rng = mulberry32(20260812);
  const points: RecoveryPoint[] = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const isFull = d.getDay() === 0; // Chủ nhật — sao lưu đầy đủ
    const sizeMB = isFull ? totalMB : Math.round(totalMB * randFloat(rng, 0.015, 0.06));
    points.push({
      id: `rp-init-${i}`,
      time: `${formatVnDate(d)} 03:00`,
      dateLabel: formatVnDate(d),
      kind: isFull ? 'Đầy đủ' : 'Gia tăng',
      sizeMB,
      verify: 'verified',
    });
  }
  return points;
}

export default function BackupPage() {
  const assets = services.assets.list();
  const total = totalCount(assets);
  const totalMB = totalSizeMB(assets);

  // Memo hoá — nếu không, mỗi lần render tạo `Date` mới, khiến effect hoàn
  // tất "Sao lưu ngay" (phụ thuộc `refDate`) chạy lại không cần thiết.
  const refDate = useMemo(() => {
    const latestUpdated = assets.reduce<Date | null>((best, a) => {
      const d = parseVnDate(a.updated);
      if (!d) return best;
      return !best || d > best ? d : best;
    }, null);
    return latestUpdated ?? new Date();
  }, [assets]);

  const [points, setPoints] = useState<RecoveryPoint[]>(() => buildInitialPoints(totalMB, refDate));
  const [lastBackupHoursAgo, setLastBackupHoursAgo] = useState(6);
  const [notice, setNotice] = useState<string | null>(null);

  // KPI bảo quản — % checksum hợp lệ derive từ trạng thái pipeline thật:
  // bản ghi còn ở "Chờ xử lý" chưa qua vòng xác minh fixity đầu tiên.
  const pendingIngest = countByStatus(assets, 'Chờ xử lý');
  const checksumVerified = total - pendingIngest;
  const checksumPct = total === 0 ? 100 : Math.round((checksumVerified / total) * 1000) / 10;

  // Ước tính dung lượng cho lần sao lưu gia tăng tiếp theo — cùng khoảng
  // 1,5–6% tổng dung lượng dùng để dựng lịch sử điểm khôi phục ở trên.
  const estimatedBackupMB = Math.max(1, Math.round(totalMB * 0.032));

  // --- "Sao lưu ngay" ------------------------------------------------
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  useEffect(() => {
    if (!backupRunning) return;
    const timer = setInterval(() => {
      setBackupProgress((p) => Math.min(100, p + 8 + Math.round(Math.random() * 10)));
    }, 180);
    return () => clearInterval(timer);
  }, [backupRunning]);

  useEffect(() => {
    if (backupRunning && backupProgress >= 100) {
      const done = setTimeout(() => {
        setBackupModalOpen(false);
        setBackupRunning(false);
        setBackupProgress(0);
        setLastBackupHoursAgo(0);
        const now = new Date();
        const newPoint: RecoveryPoint = {
          id: `rp-${Date.now()}`,
          time: `${formatVnDate(refDate)} thủ công`,
          dateLabel: formatVnDate(refDate),
          kind: 'Gia tăng',
          sizeMB: estimatedBackupMB,
          verify: 'verifying',
        };
        setPoints((prev) => [newPoint, ...prev]);
        setNotice(
          `Đã hoàn tất sao lưu gia tăng thủ công (${formatSizeMB(estimatedBackupMB)}) lúc ${pad2(now.getHours())}:${pad2(now.getMinutes())} — đang xác minh checksum. Đã ghi vào Nhật ký hệ thống.`,
        );
        setTimeout(() => {
          setPoints((prev) => prev.map((p) => (p.id === newPoint.id ? { ...p, verify: 'verified' } : p)));
        }, 2200);
      }, 500);
      return () => clearTimeout(done);
    }
  }, [backupRunning, backupProgress, refDate, estimatedBackupMB]);

  const startBackup = () => {
    setBackupRunning(true);
    setBackupProgress(0);
  };

  // --- Khôi phục từ một điểm ------------------------------------------
  const [restorePoint, setRestorePoint] = useState<RecoveryPoint | null>(null);
  const [restoreStep, setRestoreStep] = useState<RestoreStep>(null);
  const [restoreScope, setRestoreScope] = useState<string>('all');
  const [restoreInput, setRestoreInput] = useState('');
  const [restoreProgress, setRestoreProgress] = useState(0);

  useEffect(() => {
    if (restoreStep !== 'running') return;
    const timer = setInterval(() => {
      setRestoreProgress((p) => Math.min(100, p + 6 + Math.round(Math.random() * 8)));
    }, 180);
    return () => clearInterval(timer);
  }, [restoreStep]);

  useEffect(() => {
    if (restoreStep === 'running' && restoreProgress >= 100) {
      const done = setTimeout(() => {
        const scopeLabel = restoreScope === 'all' ? 'toàn hệ thống' : `bộ sưu tập "${restoreScope}"`;
        setNotice(
          `Đã khôi phục ${scopeLabel} về điểm ${restorePoint?.time} — RTO thực đo trong hạn cam kết ≤ 4 giờ. Đã ghi vào Nhật ký hệ thống.`,
        );
        setRestoreStep(null);
        setRestorePoint(null);
        setRestoreInput('');
        setRestoreProgress(0);
        setRestoreScope('all');
      }, 500);
      return () => clearTimeout(done);
    }
  }, [restoreStep, restoreProgress, restorePoint, restoreScope]);

  const openRestore = (p: RecoveryPoint) => {
    setRestorePoint(p);
    setRestoreScope('all');
    setRestoreInput('');
    setRestoreStep('scope');
  };

  const closeRestore = () => {
    setRestoreStep(null);
    setRestorePoint(null);
    setRestoreInput('');
    setRestoreProgress(0);
  };

  const lastBackupHint = lastBackupHoursAgo === 0 ? 'Vừa xong' : `khoảng ${lastBackupHoursAgo} giờ trước`;

  return (
    <>
      {notice && <Toast message={notice} onClose={() => setNotice(null)} />}

      <div className={styles.rpoRow}>
        <GlassCard>
          <div className={styles.rpoCard}>
            <div className={styles.rpoTop}>
              <span className={styles.rpoIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" />
                </svg>
              </span>
              <span className={styles.rpoLabel}>RPO — Recovery Point Objective</span>
            </div>
            <div className={styles.rpoValue}>≤ 24 giờ</div>
            <p className={styles.rpoDesc}>
              Nếu xảy ra sự cố, dữ liệu số hóa bị mất tối đa là phần phát sinh trong 24 giờ gần nhất — vì hệ thống chạy sao lưu gia tăng mỗi ngày
              lúc 03:00. Cập nhật/tải lên trước mốc sao lưu gần nhất luôn được khôi phục đầy đủ.
            </p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className={styles.rpoCard}>
            <div className={styles.rpoTop}>
              <span className={styles.rpoIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.6M21 3v6h-6" />
                </svg>
              </span>
              <span className={styles.rpoLabel}>RTO — Recovery Time Objective</span>
            </div>
            <div className={styles.rpoValue}>≤ 4 giờ</div>
            <p className={styles.rpoDesc}>
              Kể từ khi sự cố được xác nhận, hệ thống cam kết khôi phục để có thể sử dụng lại trong tối đa 4 giờ — kể cả kịch bản nặng nhất
              (hỏng toàn bộ trung tâm dữ liệu, khôi phục từ tầng lạnh off-site).
            </p>
          </div>
        </GlassCard>
      </div>

      <h4 className={styles.sectionTitle}>Lịch sao lưu</h4>
      <p className={styles.sectionCaption}>Áp dụng cho toàn bộ dữ liệu số hóa từ thời điểm thu nhận (ingest) đến lưu trữ dài hạn — Mục 5, quy trình bảo quản.</p>
      <GlassCard dense>
        <div className={styles.tableWrap}>
          <table className="data-table data-table--tight">
            <thead>
              <tr>
                <th>LOẠI SAO LƯU</th>
                <th>TẦN SUẤT</th>
                <th>THỜI ĐIỂM</th>
                <th>PHẠM VI</th>
                <th>TRÁCH NHIỆM</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE_ROWS.map((r) => (
                <tr key={r.kind}>
                  <td className="strong">{r.kind}</td>
                  <td className="nowrap">{r.freq}</td>
                  <td className="nowrap muted">{r.time}</td>
                  <td className="muted">{r.scope}</td>
                  <td className="nowrap">{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className={styles.actionRow}>
        <button type="button" className={styles.primaryBtn} onClick={() => setBackupModalOpen(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-3.5-7.1M21 3v6h-6" />
          </svg>
          Sao lưu ngay
        </button>
        <span className={styles.lastBackupHint}>Bản sao lưu gần nhất: {lastBackupHint} · trong hạn RPO 24 giờ</span>
      </div>

      {backupModalOpen && (
        <Modal
          onClose={() => {
            if (!backupRunning) setBackupModalOpen(false);
          }}
        >
          <h3 className={styles.modalTitle}>Sao lưu ngay</h3>
          {!backupRunning ? (
            <>
              <p className={styles.modalDesc}>
                Chạy một lượt sao lưu gia tăng thủ công (ngoài lịch 03:00 hàng ngày) — ước tính {formatSizeMB(estimatedBackupMB)} thay đổi, thời
                gian dự kiến 3–8 phút. Bản sao sẽ được xác minh checksum ngay sau khi hoàn tất.
              </p>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setBackupModalOpen(false)}>
                  Hủy
                </button>
                <button type="button" className={styles.confirmBtn} onClick={startBackup}>
                  Bắt đầu sao lưu
                </button>
              </div>
            </>
          ) : (
            <div className={styles.progressWrap}>
              <div className={styles.progressLabel}>
                <span>Đang sao lưu…</span>
                <span>{backupProgress}%</span>
              </div>
              <ProgressBar pct={backupProgress} height={10} color="var(--ink)" />
            </div>
          )}
        </Modal>
      )}

      <h4 className={styles.sectionTitle}>Điểm khôi phục</h4>
      <p className={styles.sectionCaption}>Bản đầy đủ (Chủ nhật) mang dung lượng toàn bộ AIP hiện tại; các bản gia tăng mang phần thay đổi ước tính trong ngày.</p>
      <GlassCard dense>
        <div className={styles.tableWrap}>
          <table className="data-table data-table--tight">
            <thead>
              <tr>
                <th>THỜI GIAN</th>
                <th>LOẠI</th>
                <th>DUNG LƯỢNG</th>
                <th>XÁC MINH TOÀN VẸN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.id}>
                  <td className="nowrap strong">{p.time}</td>
                  <td className="nowrap">{p.kind}</td>
                  <td className="nowrap muted">{formatSizeMB(p.sizeMB)}</td>
                  <td>
                    <StatusPill label={p.verify === 'verified' ? '✓ Đã xác minh' : 'Đang xác minh…'} colors={VERIFY_COLORS[p.verify]} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className={styles.restoreBtn} onClick={() => openRestore(p)} disabled={p.verify !== 'verified'}>
                      Khôi phục từ điểm này
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {restoreStep && restorePoint && (
        <Modal onClose={restoreStep === 'running' ? () => undefined : closeRestore}>
          <h3 className={styles.modalTitle}>Khôi phục từ điểm {restorePoint.time}</h3>

          {restoreStep === 'scope' && (
            <>
              <p className={styles.modalDesc}>Chọn phạm vi khôi phục.</p>
              <label className={styles.modalLabel}>Phạm vi</label>
              <div className={styles.scopeCol}>
                <div className={styles.scopeOption} data-active={restoreScope === 'all'} onClick={() => setRestoreScope('all')}>
                  <span className={styles.scopeDot} data-active={restoreScope === 'all'}>
                    {restoreScope === 'all' && <span className={styles.scopeDotInner} />}
                  </span>
                  <div className={styles.scopeText}>
                    <div className={styles.scopeTitle}>Toàn hệ thống</div>
                    <div className={styles.scopeMeta}>Khôi phục toàn bộ AIP về điểm đã chọn</div>
                  </div>
                </div>
                {COLLECTIONS_META.map((c) => (
                  <div key={c.name} className={styles.scopeOption} data-active={restoreScope === c.name} onClick={() => setRestoreScope(c.name)}>
                    <span className={styles.scopeDot} data-active={restoreScope === c.name}>
                      {restoreScope === c.name && <span className={styles.scopeDotInner} />}
                    </span>
                    <div className={styles.scopeText}>
                      <div className={styles.scopeTitle}>Bộ sưu tập: {c.name}</div>
                      <div className={styles.scopeMeta}>Chỉ khôi phục dữ liệu số hóa thuộc bộ sưu tập này</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeRestore}>
                  Hủy
                </button>
                <button type="button" className={styles.confirmBtn} onClick={() => setRestoreStep('warn')}>
                  Tiếp tục
                </button>
              </div>
            </>
          )}

          {restoreStep === 'warn' && (
            <>
              <div className={styles.warnBox}>
                <span className={styles.warnIcon}>⚠️</span>
                <span>
                  Khôi phục sẽ GHI ĐÈ trạng thái hiện tại của {restoreScope === 'all' ? 'toàn hệ thống' : `bộ sưu tập "${restoreScope}"`} về đúng
                  mốc <strong>{restorePoint.time}</strong>. Mọi thay đổi, cập nhật metadata hoặc bản xuất bản mới thực hiện SAU mốc này sẽ MẤT
                  nếu chưa có bản sao khác. Thao tác không thể hoàn tác.
                </span>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeRestore}>
                  Hủy
                </button>
                <button type="button" className={`${styles.confirmBtn} ${styles.dangerBtn}`} onClick={() => setRestoreStep('confirm')}>
                  Tôi hiểu, tiếp tục
                </button>
              </div>
            </>
          )}

          {restoreStep === 'confirm' && (
            <>
              <p className={styles.modalDesc}>
                Để xác nhận, nhập đúng ngày của điểm khôi phục (<strong>{restorePoint.dateLabel}</strong>) vào ô bên dưới.
              </p>
              <label className={styles.confirmLabel} htmlFor="restore-confirm-input">
                Chuỗi xác nhận
              </label>
              <input
                id="restore-confirm-input"
                className={styles.confirmInput}
                value={restoreInput}
                onChange={(e) => setRestoreInput(e.target.value)}
                placeholder={restorePoint.dateLabel}
              />
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeRestore}>
                  Hủy
                </button>
                <button
                  type="button"
                  className={`${styles.confirmBtn} ${styles.dangerBtn}`}
                  disabled={restoreInput.trim() !== restorePoint.dateLabel}
                  onClick={() => {
                    setRestoreStep('running');
                    setRestoreProgress(0);
                  }}
                >
                  Xác nhận khôi phục
                </button>
              </div>
            </>
          )}

          {restoreStep === 'running' && (
            <div className={styles.progressWrap}>
              <div className={styles.progressLabel}>
                <span>Đang khôi phục…</span>
                <span>{restoreProgress}%</span>
              </div>
              <ProgressBar pct={restoreProgress} height={10} color="#9a4a1f" />
            </div>
          )}
        </Modal>
      )}

      <h4 className={styles.sectionTitle}>KPI bảo quản</h4>
      <div className={styles.kpiRow}>
        <GlassCard>
          <div className={styles.kpiTile}>
            <span className={styles.kpiLabel}>% dữ liệu số hóa có checksum hợp lệ</span>
            <span className={styles.kpiValue} data-tone={checksumPct >= 99.5 ? 'good' : 'warn'}>
              {checksumPct.toLocaleString('vi-VN')}%
            </span>
            <span className={styles.kpiSub}>
              {checksumVerified.toLocaleString('vi-VN')} / {total.toLocaleString('vi-VN')} bản ghi đã qua xác minh fixity lần gần nhất · mục tiêu ≥
              99,5%
            </span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className={styles.kpiTile}>
            <span className={styles.kpiLabel}>Tuổi bản sao lưu mới nhất</span>
            <span className={styles.kpiValue} data-tone="good">
              {lastBackupHint}
            </span>
            <span className={styles.kpiSub}>Sao lưu gia tăng hàng ngày lúc 03:00 · trong hạn RPO ≤ 24 giờ</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className={styles.kpiTile}>
            <span className={styles.kpiLabel}>Diễn tập khôi phục gần nhất</span>
            <span className={styles.kpiValue} data-tone="good">
              Đạt yêu cầu
            </span>
            <span className={styles.kpiSub}>RTO thực đo 2 giờ 45 phút (≤ 4 giờ cam kết) — thực hiện quý trước, có biên bản</span>
          </div>
        </GlassCard>
      </div>

      <h4 className={styles.sectionTitle}>Kiến trúc lưu trữ 3 tầng — quy tắc 3-2-1</h4>
      <p className={styles.sectionCaption}>Tối thiểu 3 bản dữ liệu, trên 2 loại phương tiện lưu trữ khác nhau, 1 bản đặt tại địa điểm khác (Mục 2).</p>
      <GlassCard dense>
        <div className={styles.tableWrap}>
          <table className="data-table data-table--tight">
            <thead>
              <tr>
                <th>TẦNG</th>
                <th>NỘI DUNG LƯU</th>
                <th>VAI TRÒ QUẢN LÝ</th>
                <th>DUNG LƯỢNG</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="strong nowrap">Tầng nóng (Hot)</td>
                <td className="muted">Bản dẫn xuất phân phối web + bản làm việc (preview/thumbnail)</td>
                <td className="nowrap">Kỹ thuật số hóa / Biên tập</td>
                <td className="nowrap muted">Tái tạo được từ AIP — không tính vào 3 bản 3-2-1</td>
              </tr>
              <tr>
                <td className="strong nowrap">Tầng lưu trữ AIP (bất biến)</td>
                <td className="muted">Bản gốc master bất biến + metadata PREMIS + manifest checksum SHA-256</td>
                <td className="nowrap">Cán bộ bảo quản số</td>
                <td className="nowrap strong">{formatSizeMB(totalMB)}</td>
              </tr>
              <tr>
                <td className="strong nowrap">Tầng lạnh off-site</td>
                <td className="muted">Bản sao đầy đủ của AIP — địa điểm địa lý thứ 2</td>
                <td className="nowrap">Quản trị hệ thống</td>
                <td className="nowrap strong">{formatSizeMB(totalMB)} (bản sao gương)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.tierStrip}>
          <div className={styles.tierChip}>
            <div className={styles.tierChipLabel}>Bản 1 — chính</div>
            <div className={styles.tierChipValue}>NAS Trung tâm</div>
            <div className={styles.tierChipMeta}>Tầng AIP</div>
          </div>
          <div className={styles.tierChip}>
            <div className={styles.tierChipLabel}>Bản 2 — dự phòng tại chỗ</div>
            <div className={styles.tierChipValue}>Object Storage (công nghệ khác Bản 1)</div>
            <div className={styles.tierChipMeta}>Tầng AIP</div>
          </div>
          <div className={styles.tierChip}>
            <div className={styles.tierChipLabel}>Bản 3 — off-site</div>
            <div className={styles.tierChipValue}>LTO tape / Object Storage vùng khác</div>
            <div className={styles.tierChipMeta}>Tầng lạnh</div>
          </div>
        </div>
        <p className={styles.sectionCaption} style={{ marginTop: 14 }}>
          Gaussian splat (<code>.splat</code>) chưa có chuẩn ISO/OGC chính thức nên không được coi là bản lưu trữ dài hạn duy nhất: bản bảo hiểm
          PLY (đám mây điểm gốc) kèm toàn bộ ảnh nguồn và tham số huấn luyện bắt buộc nằm ở tầng AIP cùng bản <code>.splat</code>, không chỉ ở
          tầng nóng (Mục 7.2).
        </p>
      </GlassCard>
    </>
  );
}
