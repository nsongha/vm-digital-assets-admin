import { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import StatusPill from '../components/StatusPill';
import TagChip from '../components/TagChip';
import type { ColorPair } from '../components/statusColors';
import { APIS } from '../data/apis';
import { CONNECTIONS } from '../data/connections';
import { COLLECTIONS_META } from '../data/collections';
import styles from './ApiKeysPage.module.css';

// B5 — Quản lý API key (attt C5). Tự chứa: dữ liệu mẫu + state cục bộ trong
// trang, không đấu vào services/ (đấu nối là việc của orchestrator).

type ApiKeyStatus = 'Hoạt động' | 'Đã thu hồi' | 'Hết hạn';

const STATUS_COLORS: Record<ApiKeyStatus, ColorPair> = {
  'Hoạt động': ['var(--accent-soft)', 'var(--accent-text)'],
  'Đã thu hồi': ['#eeeee6', '#5f5f54'],
  'Hết hạn': ['#ffd9c2', '#9a4a1f'],
};

const EXPIRY_OPTIONS = ['30 ngày', '90 ngày', '180 ngày', '365 ngày', 'Không giới hạn'] as const;
const DEFAULT_EXPIRY = '90 ngày';

const SCOPE_OPTIONS = [...APIS.map((a) => a.name), ...COLLECTIONS_META.map((c) => c.name)];
const CONNECTION_OPTIONS = CONNECTIONS.map((c) => c.name);

interface ApiKey {
  id: string;
  name: string;
  connection: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  lastUsed: string;
  status: ApiKeyStatus;
  rateLimit: number;
  keyTail: string;
  revokedReason?: string;
}

function randomKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `vm_live_${out}`;
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'k1',
    name: 'Cổng tham quan số — đọc dữ liệu công khai',
    connection: 'Cổng tham quan số Văn Miếu',
    scopes: ['GET /api/v1/assets', 'GET /api/v1/collections', 'GET /api/v1/models/{id}'],
    createdAt: '02/03/2026',
    expiresAt: '02/06/2026',
    lastUsed: 'Hôm nay 08:12',
    status: 'Hoạt động',
    rateLimit: 120,
    keyTail: 'k9x2',
  },
  {
    id: 'k2',
    name: 'Đồng bộ LGSP Thành phố Hà Nội',
    connection: 'LGSP Thành phố Hà Nội',
    scopes: ['GET /api/v1/assets', 'GET /api/v1/collections'],
    createdAt: '15/01/2026',
    expiresAt: 'Không giới hạn',
    lastUsed: 'Hôm nay 09:30',
    status: 'Hoạt động',
    rateLimit: 300,
    keyTail: 'a41f',
  },
  {
    id: 'k3',
    name: 'Nghiên cứu — ĐH KHXH&NV (scan Hán Nôm)',
    connection: 'Cổng dữ liệu mở Thành phố',
    scopes: ['Tư liệu Hán Nôm', 'OAI-PMH /oai'],
    createdAt: '01/08/2025',
    expiresAt: '30/10/2025',
    lastUsed: '28/10/2025 16:40',
    status: 'Hết hạn',
    rateLimit: 30,
    keyTail: '7be0',
  },
  {
    id: 'k4',
    name: 'Thử nghiệm OAI-PMH — nhà thầu cũ',
    connection: 'NDXP — nền tảng quốc gia',
    scopes: ['OAI-PMH /oai'],
    createdAt: '20/05/2025',
    expiresAt: '20/08/2025',
    lastUsed: '19/08/2025 11:05',
    status: 'Đã thu hồi',
    rateLimit: 30,
    keyTail: 'c02d',
    revokedReason: 'Hết hợp đồng thử nghiệm, nhà thầu không còn nhu cầu truy cập.',
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);

  const [createOpen, setCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftConnection, setDraftConnection] = useState(CONNECTION_OPTIONS[0]);
  const [draftScopes, setDraftScopes] = useState<string[]>([]);
  const [draftExpiry, setDraftExpiry] = useState<(typeof EXPIRY_OPTIONS)[number]>(DEFAULT_EXPIRY);
  const [draftRateLimit, setDraftRateLimit] = useState(60);

  const [revealKey, setRevealKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [regenId, setRegenId] = useState<string | null>(null);

  const toggleDraftScope = (label: string) =>
    setDraftScopes((prev) => (prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]));

  const resetDraft = () => {
    setDraftName('');
    setDraftConnection(CONNECTION_OPTIONS[0]);
    setDraftScopes([]);
    setDraftExpiry(DEFAULT_EXPIRY);
    setDraftRateLimit(60);
  };

  const createKey = () => {
    const full = randomKey();
    const newKey: ApiKey = {
      id: `k${Date.now()}`,
      name: draftName || 'API key chưa đặt tên',
      connection: draftConnection,
      scopes: draftScopes,
      createdAt: 'Hôm nay',
      expiresAt: draftExpiry,
      lastUsed: '— Chưa dùng lần nào',
      status: 'Hoạt động',
      rateLimit: draftRateLimit,
      keyTail: full.slice(-4),
    };
    setKeys((prev) => [newKey, ...prev]);
    setCreateOpen(false);
    resetDraft();
    setCopied(false);
    setRevealKey(full);
  };

  const doRevoke = () => {
    if (!revokeId) return;
    setKeys((prev) => prev.map((k) => (k.id === revokeId ? { ...k, status: 'Đã thu hồi', revokedReason: revokeReason } : k)));
    setRevokeId(null);
    setRevokeReason('');
  };

  const doRegenerate = () => {
    if (!regenId) return;
    const full = randomKey();
    setKeys((prev) =>
      prev.map((k) =>
        k.id === regenId ? { ...k, keyTail: full.slice(-4), createdAt: 'Hôm nay', lastUsed: '— Chưa dùng lần nào', status: 'Hoạt động' } : k,
      ),
    );
    setRegenId(null);
    setCopied(false);
    setRevealKey(full);
  };

  const copyKey = async () => {
    if (!revealKey) return;
    try {
      await navigator.clipboard.writeText(revealKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const revokeTarget = keys.find((k) => k.id === revokeId);
  const regenTarget = keys.find((k) => k.id === regenId);

  return (
    <>
      <div className={styles.topRow}>
        <span className={styles.count}>{keys.length} API key</span>
        <button type="button" className={styles.addBtn} onClick={() => setCreateOpen(true)}>
          + Tạo API key mới
        </button>
      </div>

      <GlassCard dense>
        <div className={styles.tableScroll}>
          <table className="data-table data-table--tight">
            <thead>
              <tr>
                <th style={{ minWidth: 200 }}>TÊN / MỤC ĐÍCH</th>
                <th>KẾT NỐI LIÊN KẾT</th>
                <th style={{ minWidth: 220 }}>PHẠM VI</th>
                <th className="nowrap">NGÀY TẠO</th>
                <th className="nowrap">HẠN DÙNG</th>
                <th className="nowrap">LẦN DÙNG GẦN NHẤT</th>
                <th className="nowrap">GIỚI HẠN TỐC ĐỘ</th>
                <th>TRẠNG THÁI</th>
                <th aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td>
                    <div className="strong">{k.name}</div>
                    <div className="mono muted" style={{ fontSize: 12, marginTop: 2 }}>
                      ••••••••••••{k.keyTail}
                    </div>
                    {k.revokedReason && (
                      <div className={styles.revokedNote}>Lý do thu hồi: {k.revokedReason}</div>
                    )}
                  </td>
                  <td className="nowrap" style={{ fontSize: 13 }}>
                    {k.connection}
                  </td>
                  <td>
                    <div className={styles.scopeChips}>
                      {k.scopes.map((s) => (
                        <span key={s} className={styles.scopeChip}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="nowrap muted" style={{ fontSize: 13 }}>
                    {k.createdAt}
                  </td>
                  <td className="nowrap" style={{ fontSize: 13 }}>
                    {k.expiresAt}
                    {k.expiresAt === 'Không giới hạn' && <div className={styles.unlimitedWarn}>⚠ không giới hạn</div>}
                  </td>
                  <td className="nowrap muted" style={{ fontSize: 13 }}>
                    {k.lastUsed}
                  </td>
                  <td className="nowrap" style={{ fontSize: 13 }}>
                    {k.rateLimit} req/phút
                  </td>
                  <td>
                    <StatusPill label={k.status} colors={STATUS_COLORS[k.status]} />
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.rowBtn}
                        disabled={k.status !== 'Hoạt động'}
                        onClick={() => {
                          setRevokeId(k.id);
                          setRevokeReason('');
                        }}
                      >
                        Thu hồi
                      </button>
                      <button
                        type="button"
                        className={styles.rowBtn}
                        disabled={k.status === 'Đã thu hồi'}
                        onClick={() => setRegenId(k.id)}
                      >
                        Tạo lại
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {createOpen && (
        <Modal
          onClose={() => {
            setCreateOpen(false);
            resetDraft();
          }}
        >
          <div className={styles.modalHead}>
            <h3 className={styles.modalTitle}>Tạo API key mới</h3>
            <button
              type="button"
              className={styles.modalClose}
              aria-label="Đóng"
              onClick={() => {
                setCreateOpen(false);
                resetDraft();
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <label className={styles.formLabel} htmlFor="apikey-name">
            Tên / mục đích
          </label>
          <input
            id="apikey-name"
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Ví dụ: Đồng bộ Cổng dữ liệu mở Thành phố"
            className={styles.textInput}
          />

          <label className={styles.formLabel}>Kết nối liên kết</label>
          <div className={styles.chipRow}>
            {CONNECTION_OPTIONS.map((c) => (
              <TagChip key={c} label={c} active={draftConnection === c} dense inactiveBg="#f2f1e9" onClick={() => setDraftConnection(c)} />
            ))}
          </div>

          <label className={styles.formLabel}>Phạm vi (endpoint / bộ sưu tập được phép)</label>
          <div className={styles.chipRow}>
            {SCOPE_OPTIONS.map((s) => (
              <TagChip
                key={s}
                label={s}
                active={draftScopes.includes(s)}
                dense
                activeBg="var(--accent-soft)"
                activeFg="var(--accent-text)"
                inactiveBg="#f2f1e9"
                onClick={() => toggleDraftScope(s)}
              />
            ))}
          </div>

          <label className={styles.formLabel}>Hạn dùng</label>
          <div className={styles.chipRow}>
            {EXPIRY_OPTIONS.map((e) => (
              <TagChip key={e} label={e} active={draftExpiry === e} dense inactiveBg="#f2f1e9" onClick={() => setDraftExpiry(e)} />
            ))}
          </div>
          {draftExpiry === 'Không giới hạn' && (
            <p className={styles.warnText}>
              Cảnh báo: khóa không giới hạn thời hạn làm tăng rủi ro bảo mật — chỉ tạo khi thực sự cần thiết, và cân nhắc rà soát định kỳ.
            </p>
          )}
          <p className={styles.hintText}>Gợi ý mặc định: 90 ngày.</p>

          <label className={styles.formLabel} htmlFor="apikey-rate-limit">
            Giới hạn tốc độ (request / phút)
          </label>
          <input
            id="apikey-rate-limit"
            type="number"
            min={1}
            value={draftRateLimit}
            onChange={(e) => setDraftRateLimit(Number(e.target.value) || 0)}
            className={styles.textInput}
            style={{ maxWidth: 140 }}
          />

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={() => { setCreateOpen(false); resetDraft(); }}>
              Hủy
            </button>
            <button type="button" className={styles.saveBtn} disabled={!draftName.trim() || draftScopes.length === 0} onClick={createKey}>
              Tạo API key
            </button>
          </div>
        </Modal>
      )}

      {revealKey && (
        <Modal onClose={() => setRevealKey(null)}>
          <h3 className={styles.modalTitle}>API key đã tạo</h3>
          <p className={styles.revealWarn}>Sao chép ngay — sẽ không hiển thị lại.</p>
          <div className={styles.revealBox}>
            <span className={styles.revealValue}>{revealKey}</span>
            <button type="button" className={styles.copyBtn} onClick={copyKey}>
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>
          <div className={styles.modalFooter} style={{ justifyContent: 'flex-end' }}>
            <button type="button" className={styles.saveBtn} onClick={() => setRevealKey(null)}>
              Tôi đã sao chép — đóng
            </button>
          </div>
        </Modal>
      )}

      {revokeTarget && (
        <ConfirmModal
          title="Thu hồi API key"
          tone="danger"
          message={`Thu hồi "${revokeTarget.name}" sẽ khiến mọi yêu cầu dùng khóa này bị từ chối ngay lập tức. Vui lòng nhập lý do thu hồi.`}
          confirmLabel="Thu hồi"
          confirmDisabled={!revokeReason.trim()}
          onConfirm={doRevoke}
          onCancel={() => {
            setRevokeId(null);
            setRevokeReason('');
          }}
        >
          <label className={styles.formLabel} htmlFor="apikey-revoke-reason">
            Lý do thu hồi (bắt buộc)
          </label>
          <textarea
            id="apikey-revoke-reason"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            className={styles.textArea}
            placeholder="Ví dụ: hết hợp đồng, nghi lộ khóa, đổi sang khóa mới…"
          />
        </ConfirmModal>
      )}

      {regenTarget && (
        <ConfirmModal
          title="Tạo lại API key"
          tone="danger"
          message={`Tạo lại "${regenTarget.name}" sẽ VÔ HIỆU HÓA khóa hiện tại ngay lập tức — mọi hệ thống đang dùng khóa cũ sẽ ngừng hoạt động cho đến khi được cập nhật khóa mới.`}
          confirmLabel="Tạo lại API key"
          onConfirm={doRegenerate}
          onCancel={() => setRegenId(null)}
        />
      )}
    </>
  );
}
