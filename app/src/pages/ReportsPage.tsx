import { useMemo, useState } from 'react';
import BarChart from '../components/BarChart';
import GlassCard from '../components/GlassCard';
import HBarChart from '../components/HBarChart';
import Modal from '../components/Modal';
import TagChip from '../components/TagChip';
import Toast from '../components/Toast';
import { assetsInCollection, averageCompletenessPct, countByStatus, mostRecentUpdated, totalCount } from '../data/selectors';
import { OBJECT_CLASS_LABELS, OBJECT_CLASS_ORDER } from '../data/taxonomy';
import { services } from '../services';
import type { AssetStatus } from '../services/types';
import styles from './ReportsPage.module.css';

// B2 — mọi con số trên màn này derive từ `services.assets.list()` qua các
// selector có sẵn (data/selectors.ts) hoặc phép lọc/gộp thuần tuý trên mảng
// đó — không có số ghi cứng. `updated` (dd/mm/yyyy) là trường ngày duy nhất
// trên Asset nên được dùng làm trục thời gian cho cả bộ lọc khoảng thời gian
// lẫn biểu đồ "tiến độ số hóa theo tháng".

type RangeId = '7d' | '30d' | '90d' | 'all';

const RANGE_OPTIONS: Array<{ id: RangeId; label: string; days: number | null }> = [
  { id: '7d', label: '7 ngày qua', days: 7 },
  { id: '30d', label: '30 ngày qua', days: 30 },
  { id: '90d', label: '90 ngày qua', days: 90 },
  { id: 'all', label: 'Toàn bộ thời gian', days: null },
];

const OBJECT_CLASS_COLORS: Record<string, string> = {
  precinct: 'var(--accent)',
  structure: 'var(--ink)',
  artifact: '#ef8354',
  document: '#7fb5aa',
  av: '#8d7bb0',
};

// Phủ đủ 11 trạng thái của quy trình mở rộng (xem `AssetStatus` trong services/types.ts).
// Thang màu đi từ nhạt → đậm theo mức độ hoàn thiện; hai trạng thái ngoài luồng chính
// ("Cần số hóa lại", "Đã gỡ/thu hồi") dùng tông cảnh báo để tách khỏi dòng chảy bình thường.
const STATUS_COLORS: Record<AssetStatus, string> = {
  'Chờ xử lý': '#6f6f62',
  'Đang xử lý': '#e8b923',
  'Kiểm định chất lượng': '#d9a441',
  'Chờ duyệt': '#e08a5a',
  'Thẩm định nội dung': '#c98b6b',
  'Đã duyệt': 'var(--accent)',
  'Xuất bản': 'var(--ink)',
  'Đã lưu trữ — đang giám sát': '#7fb5aa',
  'Đã kiểm kê': '#5f8f86',
  'Cần số hóa lại': '#c0562a',
  'Đã gỡ/thu hồi': '#5f5f54',
};

type ExportKind = 'excel' | 'pdf';
type ExportScope = 'filtered' | 'all';

/** Parses the app's `dd/mm/yyyy` display date into a `Date` — returns `null` if malformed. */
function parseVnDate(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

const MONTH_LABEL = new Intl.DateTimeFormat('vi-VN', { month: 'short', year: 'numeric' });

export default function ReportsPage() {
  const [range, setRange] = useState<RangeId>('all');
  const [exportModal, setExportModal] = useState<ExportKind | null>(null);
  const [exportScope, setExportScope] = useState<ExportScope>('filtered');
  const [notice, setNotice] = useState<string | null>(null);

  const allAssets = services.assets.list();

  // "Hôm nay" của báo cáo = bản ghi cập nhật gần nhất trong kho — mốc neo
  // hoàn toàn derive được, không phải Date.now() (mock dữ liệu đóng băng ở
  // một mốc cố định) và cũng không phải hằng số gõ tay.
  const refDateStr = mostRecentUpdated(allAssets);
  const refDate = parseVnDate(refDateStr);

  const assets = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.id === range);
    if (!opt?.days || !refDate) return allAssets;
    const cutoff = new Date(refDate);
    cutoff.setDate(cutoff.getDate() - opt.days);
    return allAssets.filter((a) => {
      const d = parseVnDate(a.updated);
      return d ? d >= cutoff : false;
    });
  }, [allAssets, range, refDate]);

  const total = totalCount(assets);
  const published = countByStatus(assets, 'Xuất bản');
  const backlog = total - published;
  const publishedPct = total === 0 ? 0 : Math.round((published / total) * 100);
  const backlogPct = total === 0 ? 0 : 100 - publishedPct;
  const avgCompleteness = averageCompletenessPct(assets);

  // Biểu đồ 1 — tiến độ số hóa theo tháng (nhóm theo tháng của `updated`).
  const monthData = useMemo(() => {
    const buckets = new Map<string, { label: string; value: number }>();
    for (const a of assets) {
      const d = parseVnDate(a.updated);
      if (!d) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = MONTH_LABEL.format(d);
      const cur = buckets.get(key) ?? { label, value: 0 };
      cur.value += 1;
      buckets.set(key, cur);
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [assets]);

  // Biểu đồ 2 — cơ cấu theo loại đối tượng (objectClass).
  const classData = useMemo(
    () =>
      OBJECT_CLASS_ORDER.map((oc) => ({
        label: OBJECT_CLASS_LABELS[oc],
        value: assets.filter((a) => a.objectClass === oc).length,
        color: OBJECT_CLASS_COLORS[oc],
      })),
    [assets],
  );

  // Biểu đồ 3 — tồn đọng theo trạng thái pipeline.
  const statusSteps = services.assets.statusSteps();
  const statusData = useMemo(
    () =>
      statusSteps.map((s) => ({
        label: s,
        value: countByStatus(assets, s),
        color: STATUS_COLORS[s],
      })),
    [assets, statusSteps],
  );

  // Biểu đồ 4 — % độ đầy đủ hồ sơ theo bộ sưu tập (0quinquies: mẫu số loại
  // trừ KHONG_AP_DUNG; KHONG_RO/HAN_CHE tính là đã xử lý — logic nằm sẵn ở
  // `averageCompletenessPct`/`profileCompletenessPct`, dùng lại nguyên vẹn).
  const completenessData = useMemo(() => {
    const names = Array.from(new Set(assets.map((a) => a.coll))).sort((a, b) => a.localeCompare(b, 'vi'));
    return names.map((c) => ({
      label: c,
      value: averageCompletenessPct(assetsInCollection(assets, c)),
    }));
  }, [assets]);

  const rangeLabel = RANGE_OPTIONS.find((r) => r.id === range)?.label ?? '';

  const openExport = (kind: ExportKind) => {
    setExportScope('filtered');
    setExportModal(kind);
  };

  const confirmExport = () => {
    if (!exportModal) return;
    const kindLabel = exportModal === 'excel' ? 'Excel' : 'PDF';
    const scopeCount = exportScope === 'filtered' ? total : totalCount(allAssets);
    const scopeLabel = exportScope === 'filtered' ? `theo bộ lọc "${rangeLabel}"` : 'toàn bộ dữ liệu';
    setExportModal(null);
    setNotice(
      `Đã tạo báo cáo ${kindLabel} — phạm vi ${scopeLabel} (${scopeCount.toLocaleString('vi-VN')} bản ghi), tính đến ${refDateStr}. ` +
        `Thao tác xuất báo cáo đã được ghi vào Nhật ký hệ thống.`,
    );
  };

  const fmtCount = (v: number) => v.toLocaleString('vi-VN');
  const fmtPct = (v: number) => `${v}%`;

  return (
    <>
      <div className={styles.filterRow}>
        {RANGE_OPTIONS.map((r) => (
          <TagChip key={r.id} label={r.label} active={range === r.id} shadow onClick={() => setRange(r.id)} />
        ))}
      </div>
      <p className={styles.rangeCaption}>
        Dữ liệu tính đến {refDateStr || '—'} · {total.toLocaleString('vi-VN')} / {allAssets.length.toLocaleString('vi-VN')} dữ liệu số hóa trong
        phạm vi đã chọn
      </p>

      {notice && <Toast message={notice} onClose={() => setNotice(null)} />}

      <div className={styles.kpiRow}>
        <GlassCard>
          <div className={styles.kpiTile}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Tổng dữ liệu số hóa</span>
              <span className={styles.kpiIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                </svg>
              </span>
            </div>
            <div className={styles.kpiValue}>{total.toLocaleString('vi-VN')}</div>
            <div className={styles.kpiSub}>trong phạm vi đã chọn</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className={styles.kpiTile}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Đã xuất bản</span>
              <span className={styles.kpiIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            </div>
            <div className={styles.kpiValue}>{published.toLocaleString('vi-VN')}</div>
            <div className={styles.kpiSub}>{publishedPct}% phạm vi đã chọn</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className={styles.kpiTile}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Tồn đọng (chưa xuất bản)</span>
              <span className={styles.kpiIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" />
                </svg>
              </span>
            </div>
            <div className={styles.kpiValue}>{backlog.toLocaleString('vi-VN')}</div>
            <div className={styles.kpiSub}>{backlogPct}% phạm vi đã chọn</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className={styles.kpiTile}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>% đầy đủ hồ sơ trung bình</span>
              <span className={styles.kpiIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </span>
            </div>
            <div className={styles.kpiValue}>{avgCompleteness}%</div>
            <div className={styles.kpiSub}>mẫu số đã loại trừ "Không áp dụng"</div>
          </div>
        </GlassCard>
      </div>

      <div className={styles.chartGrid}>
        <GlassCard>
          <div className={styles.chartHead}>
            <h4 className={styles.chartTitle}>Tiến độ số hóa theo tháng</h4>
          </div>
          <p className={styles.chartCaption}>Số dữ liệu số hóa được cập nhật trong từng tháng, theo trường "Cập nhật" của bản ghi.</p>
          <div className={styles.chartWrap}>
            <BarChart data={monthData} valueFormatter={fmtCount} ariaLabel="Biểu đồ cột: tiến độ số hóa theo tháng" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className={styles.chartHead}>
            <h4 className={styles.chartTitle}>Cơ cấu theo loại đối tượng</h4>
          </div>
          <p className={styles.chartCaption}>Phân bố dữ liệu số hóa theo loại đối tượng di sản (khuôn viên, công trình, hiện vật, tài liệu, nghe nhìn).</p>
          <div className={styles.chartWrap}>
            <HBarChart data={classData} valueFormatter={fmtCount} ariaLabel="Biểu đồ cột ngang: cơ cấu theo loại đối tượng" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className={styles.chartHead}>
            <h4 className={styles.chartTitle}>Tồn đọng theo trạng thái pipeline</h4>
          </div>
          <p className={styles.chartCaption}>Số dữ liệu số hóa đang ở mỗi bước quy trình 5 bước — 3 bước đầu là tồn đọng chưa xuất bản.</p>
          <div className={styles.chartWrap}>
            <HBarChart data={statusData} valueFormatter={fmtCount} ariaLabel="Biểu đồ cột ngang: tồn đọng theo trạng thái pipeline" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className={styles.chartHead}>
            <h4 className={styles.chartTitle}>% độ đầy đủ hồ sơ theo bộ sưu tập</h4>
          </div>
          <p className={styles.chartCaption}>
            Mẫu số loại trừ trường "Không áp dụng"; trường "Không rõ / Khuyết danh" và "Hạn chế công bố" tính là đã xử lý (0quinquies).
          </p>
          <div className={styles.chartWrap}>
            <BarChart
              data={completenessData}
              maxValue={100}
              rotateLabels
              height={230}
              valueFormatter={fmtPct}
              ariaLabel="Biểu đồ cột: phần trăm độ đầy đủ hồ sơ theo bộ sưu tập"
            />
          </div>
        </GlassCard>
      </div>

      <div className={styles.exportRow}>
        <button type="button" className={styles.exportBtn} onClick={() => openExport('excel')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M8 8l4-4 4 4" />
            <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
          </svg>
          Xuất Excel
        </button>
        <button type="button" className={`${styles.exportBtn} ${styles.exportBtnPrimary}`} onClick={() => openExport('pdf')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M8 8l4-4 4 4" />
            <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
          </svg>
          Xuất PDF
        </button>
        <span className={styles.exportHint}>Báo cáo mô phỏng — số liệu lấy trực tiếp từ dữ liệu hiện có, không tạo tệp tải xuống thật.</span>
      </div>

      {exportModal && (
        <Modal onClose={() => setExportModal(null)}>
          <h3 className={styles.modalTitle}>Xuất báo cáo {exportModal === 'excel' ? 'Excel' : 'PDF'}</h3>
          <p className={styles.modalDesc}>Chọn phạm vi dữ liệu đưa vào báo cáo Báo cáo — Thống kê.</p>

          <label className={styles.modalLabel}>Phạm vi</label>
          <div className={styles.scopeCol}>
            <div className={styles.scopeOption} data-active={exportScope === 'filtered'} onClick={() => setExportScope('filtered')}>
              <span className={styles.scopeDot} data-active={exportScope === 'filtered'}>
                {exportScope === 'filtered' && <span className={styles.scopeDotInner} />}
              </span>
              <div className={styles.scopeText}>
                <div className={styles.scopeTitle}>Theo bộ lọc hiện tại</div>
                <div className={styles.scopeMeta}>
                  "{rangeLabel}" — {total.toLocaleString('vi-VN')} bản ghi
                </div>
              </div>
            </div>
            <div className={styles.scopeOption} data-active={exportScope === 'all'} onClick={() => setExportScope('all')}>
              <span className={styles.scopeDot} data-active={exportScope === 'all'}>
                {exportScope === 'all' && <span className={styles.scopeDotInner} />}
              </span>
              <div className={styles.scopeText}>
                <div className={styles.scopeTitle}>Toàn bộ dữ liệu</div>
                <div className={styles.scopeMeta}>{allAssets.length.toLocaleString('vi-VN')} bản ghi, không áp bộ lọc</div>
              </div>
            </div>
          </div>

          <div className={styles.logNote}>
            <span>ℹ️</span>
            <span>Mọi lượt xuất báo cáo (Excel/PDF) đều được ghi lại trong Nhật ký hệ thống — gồm người thực hiện, phạm vi và thời điểm xuất.</span>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={() => setExportModal(null)}>
              Hủy
            </button>
            <button type="button" className={styles.confirmBtn} onClick={confirmExport}>
              Xuất báo cáo
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
