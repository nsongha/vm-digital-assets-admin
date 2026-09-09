import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import StatusPill from '../components/StatusPill';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { COLLECTIONS_META } from '../data/collections';
import { formatMissing, isMissingDisplay } from '../data/missingValues';
import { services } from '../services';
import { auditService } from '../services/mock/auditService';
import { mulberry32 } from '../utils/prng';
import type { Asset } from '../services/types';
import styles from './InventoryPage.module.css';

// B3 — Kiểm kê định kỳ (Luật DSVH 45/2024 Đ.23). Phạm vi mỗi đợt kiểm kê là
// MỘT bộ sưu tập hiện vật/tư liệu (`coll`), đối chiếu từng ĐỐI TƯỢNG VẬT LÝ
// (dedupe theo `physicalObjectId`, không phải từng bản ghi dữ liệu số) —
// một hiện vật có thể có nhiều bản ghi số (mesh/splat/ảnh…) nhưng chỉ MỘT
// số kiểm kê hiện vật gốc.
//
// `soKiemKe` hiện tại là CHUA_NHAP ở gần như 100% hiện vật/tài liệu trong
// dữ liệu mẫu (xác minh trong data/objects/*.ts) — đây CHÍNH LÀ số liệu thật
// cần hiển thị nổi bật (0quinquies), không phải điều cần che giấu. "Khớp" /
// "Lệch" xuất hiện khi cán bộ ghi nhận số kiểm kê tìm thấy tại hiện trường
// qua thao tác trong bảng dưới đây (state cục bộ của phiên làm việc — mô
// phỏng biên bản kiểm kê, chưa ghi ngược vào kho dữ liệu chính).

type CampaignStatus = 'Lên kế hoạch' | 'Đang diễn ra' | 'Hoàn tất';
type ReconcileStatus = 'Khớp' | 'Lệch' | 'Chưa đối chiếu' | 'Thiếu số kiểm kê';

interface Campaign {
  id: string;
  period: string;
  name: string;
  coll: string;
  owner: string;
  status: CampaignStatus;
  /** Xác suất một đối tượng trong phạm vi đã được đối chiếu hiện trường tính đến thời điểm mở đợt này (seed cố định — không phải fact hiện vật). */
  targetProgress: number;
  seed: number;
  /** Tầng 2 — đã chốt đợt / ký biên bản: các dòng chuyển chỉ đọc, không hoàn tác trực tiếp nữa. */
  locked?: boolean;
  lockedAt?: string;
  lockedBy?: string;
}

const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, readonly [string, string]> = {
  'Lên kế hoạch': ['#eeeee6', '#5f5f54'],
  'Đang diễn ra': ['#fff1b0', '#6b5900'],
  'Hoàn tất': ['var(--accent-soft)', 'var(--accent-text)'],
};

const RECONCILE_COLORS: Record<ReconcileStatus, readonly [string, string]> = {
  Khớp: ['var(--accent-soft)', 'var(--accent-text)'],
  Lệch: ['#ffd9c2', '#9a4a1f'],
  'Chưa đối chiếu': ['#eeeee6', '#5f5f54'],
  'Thiếu số kiểm kê': ['#fff1b0', '#6b5900'],
};

const OWNER_OPTIONS = services.users.list().map((u) => u.name);
const CHUA_NHAP = formatMissing('CHUA_NHAP');

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'kk-2026-q3-bia',
    period: 'Quý 3/2026',
    name: 'Kiểm kê Bia Tiến sĩ & rùa đội bia',
    coll: 'Bia Tiến sĩ',
    owner: 'Trần Văn Minh',
    status: 'Đang diễn ra',
    targetProgress: 0.55,
    seed: 20260301,
  },
  {
    id: 'kk-2026-q3-honuong',
    period: 'Quý 3/2026',
    name: 'Kiểm kê hiện vật thờ tự',
    coll: 'Hiện vật thờ tự',
    owner: 'Lê Thu Trang',
    status: 'Đang diễn ra',
    targetProgress: 0.8,
    seed: 20260302,
  },
  {
    id: 'kk-2026-q4-hannom',
    period: 'Quý 4/2026',
    name: 'Kiểm kê tư liệu Hán Nôm',
    coll: 'Tư liệu Hán Nôm',
    owner: 'Ngô Bảo Ngọc',
    status: 'Lên kế hoạch',
    targetProgress: 0,
    seed: 20260303,
  },
];

interface RowOverride {
  visited?: boolean;
  recordedValue?: string;
  mismatchWith?: string;
}

/** Tầng 1 — snapshot trạng thái override của một dòng TRƯỚC một thao tác, để Hoàn tác trả về đúng giá trị cũ (kể cả xóa hẳn nếu trước đó chưa có override). */
interface UndoSnapshot {
  key: string;
  prev: RowOverride | undefined;
}

interface PendingUndo {
  message: string;
  snapshots: UndoSnapshot[];
}

/** Tầng 2 — bản điều chỉnh sau khi chốt đợt: KHÔNG ghi đè, chỉ nối thêm; bản gốc (override tại thời điểm chốt) luôn được giữ nguyên để hiển thị song song. */
interface Adjustment {
  id: string;
  value: string;
  reason: string;
  user: string;
  time: string;
}

/** Một dòng = MỘT đối tượng vật lý trong phạm vi (`coll`) — dedupe theo `physicalObjectId`, sắp xếp ổn định theo mã. */
function scopeObjects(assets: Asset[], coll: string): Asset[] {
  const seen = new Set<string>();
  const out: Asset[] = [];
  for (const a of assets) {
    if (a.coll !== coll || (a.objectClass !== 'artifact' && a.objectClass !== 'document')) continue;
    if (seen.has(a.physicalObjectId)) continue;
    seen.add(a.physicalObjectId);
    out.push(a);
  }
  return out.sort((x, y) => x.physicalObjectId.localeCompare(y.physicalObjectId));
}

/** Con trỏ "đã đối chiếu hiện trường đến đâu" — RNG có seed cố định theo từng đợt (mulberry32), không phải Math.random(). */
function cursorVisitedMap(scope: Asset[], seed: number, targetProgress: number): Record<string, boolean> {
  const rng = mulberry32(seed);
  const map: Record<string, boolean> = {};
  for (const a of scope) map[a.physicalObjectId] = rng() < targetProgress;
  return map;
}

export default function InventoryPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const allAssets = services.assets.list();

  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, RowOverride>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [minutesModalOpen, setMinutesModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Tầng 1 — hoàn tác nhanh (~10s) sau mỗi thao tác đối chiếu, kể cả thao tác hàng loạt.
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Tầng 2 — chốt đợt kiểm kê (không hoàn tác) + điều chỉnh có lý do sau chốt.
  const [confirmLockOpen, setConfirmLockOpen] = useState(false);
  const [adjustCtx, setAdjustCtx] = useState<{ key: string; code: string; name: string; currentValue: string } | null>(null);
  const [adjustValue, setAdjustValue] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustments, setAdjustments] = useState<Record<string, Adjustment[]>>({});

  useEffect(() => {
    // Rời khỏi/đổi đợt kiểm kê: bỏ chọn hàng loạt và huỷ Hoàn tác đang chờ — Toast của nó
    // chỉ hiện trong màn chi tiết, giữ lại state cũ không hiển thị chỉ gây nhầm lẫn.
    setSelectedKeys(new Set());
    setPendingUndo(null);
  }, [activeCampaignId]);

  // Hàng đợi toàn hệ thống — 0quinquies: nổi bật số đối tượng CHUA_NHAP.
  const allHienVatTaiLieu = useMemo(() => {
    const seen = new Set<string>();
    const out: Asset[] = [];
    for (const a of allAssets) {
      if (a.objectClass !== 'artifact' && a.objectClass !== 'document') continue;
      if (seen.has(a.physicalObjectId)) continue;
      seen.add(a.physicalObjectId);
      out.push(a);
    }
    return out;
  }, [allAssets]);
  const missingSoKiemKeCount = allHienVatTaiLieu.filter((a) => a.soKiemKe === CHUA_NHAP).length;
  const missingSoKiemKePct = allHienVatTaiLieu.length === 0 ? 0 : Math.round((missingSoKiemKeCount / allHienVatTaiLieu.length) * 100);

  const campaignScopes = useMemo(
    () => campaigns.map((c) => ({ campaign: c, scope: scopeObjects(allAssets, c.coll) })),
    [campaigns, allAssets],
  );

  const rowKey = (campaignId: string, physicalObjectId: string) => `${campaignId}::${physicalObjectId}`;

  function rowStatus(campaign: Campaign, asset: Asset, visitedByCursor: boolean) {
    const key = rowKey(campaign.id, asset.physicalObjectId);
    const ov = overrides[key];
    const visited = visitedByCursor || Boolean(ov?.visited);
    const baseValue = asset.soKiemKe ?? CHUA_NHAP;
    const displayValue = ov?.recordedValue ?? baseValue;
    let status: ReconcileStatus;
    if (!visited) status = 'Chưa đối chiếu';
    else if (ov?.mismatchWith) status = 'Lệch';
    else if (ov?.recordedValue) status = 'Khớp';
    else if (!isMissingDisplay(baseValue)) status = 'Khớp';
    else status = 'Thiếu số kiểm kê';
    return { key, status, displayValue, priorValue: ov?.mismatchWith };
  }

  // Tầng 1 — mọi thao tác đối chiếu đơn dòng hay hàng loạt đều chụp lại override CŨ
  // (kể cả "chưa có gì" = undefined) trước khi ghi đè, để nút Hoàn tác trả về đúng y hệt.
  const pushUndo = (message: string, snapshots: UndoSnapshot[]) => setPendingUndo({ message, snapshots });

  const applyUndo = () => {
    if (!pendingUndo) return;
    setOverrides((prev) => {
      const next = { ...prev };
      for (const { key, prev: prevOv } of pendingUndo.snapshots) {
        if (prevOv === undefined) delete next[key];
        else next[key] = prevOv;
      }
      return next;
    });
    setPendingUndo(null);
    setNotice('Đã hoàn tác thao tác đối chiếu.');
  };

  const markVisited = (key: string, assetName: string) => {
    pushUndo(`Đã xác nhận kiểm tra hiện trường cho "${assetName}".`, [{ key, prev: overrides[key] }]);
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], visited: true } }));
  };

  const startEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setDrafts((prev) => ({ ...prev, [key]: isMissingDisplay(currentValue) ? '' : currentValue }));
  };

  const saveRecorded = (key: string, currentDisplay: string, assetName: string) => {
    const draft = (drafts[key] ?? '').trim();
    if (!draft) return;
    pushUndo(`Đã ghi số kiểm kê "${draft}" cho "${assetName}".`, [{ key, prev: overrides[key] }]);
    setOverrides((prev) => {
      const existing = prev[key];
      const priorRecorded = existing?.recordedValue ?? (isMissingDisplay(currentDisplay) ? undefined : currentDisplay);
      const mismatch = priorRecorded && priorRecorded !== draft ? priorRecorded : undefined;
      return { ...prev, [key]: { visited: true, recordedValue: draft, mismatchWith: mismatch } };
    });
    setEditingKey(null);
  };

  const resolveMismatch = (key: string, assetName: string) => {
    const existing = overrides[key];
    if (!existing) return;
    pushUndo(`Đã chấp nhận giá trị hiện trường mới cho "${assetName}".`, [{ key, prev: existing }]);
    setOverrides((prev) => ({ ...prev, [key]: { visited: true, recordedValue: existing.recordedValue, mismatchWith: undefined } }));
  };

  // Chọn dòng để thao tác hàng loạt (chỉ khi đợt chưa chốt).
  const toggleSelectRow = (key: string) =>
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleSelectAll = (keys: string[]) =>
    setSelectedKeys((prev) => (keys.every((k) => prev.has(k)) ? new Set() : new Set(keys)));

  const bulkMarkVisited = () => {
    const keys = Array.from(selectedKeys);
    if (keys.length === 0) return;
    const snapshots: UndoSnapshot[] = keys.map((key) => ({ key, prev: overrides[key] }));
    setOverrides((prev) => {
      const next = { ...prev };
      for (const key of keys) next[key] = { ...next[key], visited: true };
      return next;
    });
    setSelectedKeys(new Set());
    pushUndo(`Đã đánh dấu ${keys.length} dòng là đã kiểm tra hiện trường.`, snapshots);
  };

  const activeEntry = activeCampaignId ? campaignScopes.find((c) => c.campaign.id === activeCampaignId) : null;

  // Form đợt kiểm kê mới
  const [formPeriod, setFormPeriod] = useState('');
  const [formName, setFormName] = useState('');
  const [formColl, setFormColl] = useState(COLLECTIONS_META[0]?.name ?? '');
  const [formOwner, setFormOwner] = useState(OWNER_OPTIONS[0] ?? '');

  const resetForm = () => {
    setFormPeriod('');
    setFormName('');
    setFormColl(COLLECTIONS_META[0]?.name ?? '');
    setFormOwner(OWNER_OPTIONS[0] ?? '');
  };

  const createCampaign = () => {
    if (!formPeriod.trim() || !formName.trim()) return;
    const id = `kk-${Date.now()}`;
    setCampaigns((prev) => [
      ...prev,
      { id, period: formPeriod.trim(), name: formName.trim(), coll: formColl, owner: formOwner, status: 'Lên kế hoạch', targetProgress: 0, seed: prev.length + 1 },
    ]);
    setNewCampaignOpen(false);
    resetForm();
    setNotice(`Đã tạo đợt kiểm kê mới "${formName.trim()}" (${formPeriod.trim()}) — đã ghi vào Nhật ký hệ thống.`);
  };

  const exportMinutes = () => {
    if (!activeEntry) return;
    const { campaign, scope } = activeEntry;
    const cursor = cursorVisitedMap(scope, campaign.seed, campaign.targetProgress);
    const rows = scope.map((a) => rowStatus(campaign, a, cursor[a.physicalObjectId]));
    const missing = rows.filter((r) => r.status === 'Thiếu số kiểm kê').length;
    const done = rows.filter((r) => r.status !== 'Chưa đối chiếu').length;
    const pct = scope.length === 0 ? 0 : Math.round((done / scope.length) * 100);
    setMinutesModalOpen(false);
    setNotice(
      `Đã tạo biên bản kiểm kê "${campaign.name}" — ${pct}% đối tượng đã đối chiếu, ${missing} đối tượng thiếu số kiểm kê. ` +
        `Đã ghi vào Nhật ký hệ thống; biên bản sẽ kèm báo cáo gửi Sở Văn hóa và Thể thao Hà Nội theo quy định.`,
    );
  };

  // Tầng 2 — chốt đợt: KHÔNG hoàn tác được. Từ đây các dòng chuyển chỉ đọc, mọi
  // thay đổi tiếp theo phải qua "Điều chỉnh" (bắt buộc lý do), ghi nhật ký.
  const handleLockCampaign = () => {
    if (!activeEntry) return;
    const { campaign, scope } = activeEntry;
    const cursor = cursorVisitedMap(scope, campaign.seed, campaign.targetProgress);
    const rows = scope.map((a) => rowStatus(campaign, a, cursor[a.physicalObjectId]));
    const done = rows.filter((r) => r.status !== 'Chưa đối chiếu').length;
    const missing = rows.filter((r) => r.status === 'Thiếu số kiểm kê').length;
    const stamp = 'Vừa xong';
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaign.id ? { ...c, locked: true, lockedAt: stamp, lockedBy: currentUser.name, status: 'Hoàn tất' } : c)),
    );
    auditService.record({
      user: currentUser.name,
      action: 'Chốt đợt kiểm kê',
      target: campaign.name,
      note: `${done}/${scope.length} đối tượng đã đối chiếu, ${missing} đối tượng thiếu số kiểm kê — biên bản có giá trị pháp lý, từ nay chỉ điều chỉnh có lý do.`,
    });
    setConfirmLockOpen(false);
    setNotice(`Đã chốt đợt kiểm kê "${campaign.name}". Các dòng chuyển chỉ đọc — thay đổi tiếp theo phải qua "Điều chỉnh" kèm lý do.`);
  };

  const openAdjust = (key: string, code: string, name: string, currentValue: string) => {
    setAdjustCtx({ key, code, name, currentValue });
    setAdjustValue(isMissingDisplay(currentValue) ? '' : currentValue);
    setAdjustReason('');
  };

  const closeAdjust = () => {
    setAdjustCtx(null);
    setAdjustValue('');
    setAdjustReason('');
  };

  const confirmAdjust = () => {
    if (!adjustCtx || !activeEntry || !adjustValue.trim() || !adjustReason.trim()) return;
    const { campaign } = activeEntry;
    const entry: Adjustment = {
      id: `${adjustCtx.key}-${Date.now()}`,
      value: adjustValue.trim(),
      reason: adjustReason.trim(),
      user: currentUser.name,
      time: 'Vừa xong',
    };
    setAdjustments((prev) => ({ ...prev, [adjustCtx.key]: [...(prev[adjustCtx.key] ?? []), entry] }));
    auditService.record({
      user: currentUser.name,
      action: 'Điều chỉnh sau chốt kiểm kê',
      target: `${adjustCtx.code} — ${adjustCtx.name} (${campaign.name})`,
      note: `${entry.reason} — giá trị điều chỉnh: "${entry.value}" (bản gốc giữ nguyên: "${adjustCtx.currentValue}")`,
    });
    setNotice(`Đã ghi nhận điều chỉnh cho "${adjustCtx.name}" — bản ghi gốc được giữ nguyên trong lịch sử.`);
    closeAdjust();
  };

  if (activeEntry) {
    const { campaign, scope } = activeEntry;
    const cursor = cursorVisitedMap(scope, campaign.seed, campaign.targetProgress);
    const rows = scope.map((a) => ({ asset: a, ...rowStatus(campaign, a, cursor[a.physicalObjectId]) }));
    const doneCount = rows.filter((r) => r.status !== 'Chưa đối chiếu').length;
    const missingCount = rows.filter((r) => r.status === 'Thiếu số kiểm kê').length;
    const matchedCount = rows.filter((r) => r.status === 'Khớp').length;
    const mismatchCount = rows.filter((r) => r.status === 'Lệch').length;
    const progressPct = scope.length === 0 ? 0 : Math.round((doneCount / scope.length) * 100);

    // Khối "Lịch sử điều chỉnh" cấp đợt — gộp mọi bản điều chỉnh của các dòng trong phạm vi, mới nhất trước.
    const campaignAdjustmentList = rows
      .flatMap((r) => (adjustments[r.key] ?? []).map((adj) => ({ ...adj, code: r.asset.physicalObjectId, assetName: r.asset.name, original: r.displayValue })))
      .reverse();

    return (
      <>
        <a
          onClick={() => {
            setActiveCampaignId(null);
            setEditingKey(null);
          }}
          className={styles.backLink}
        >
          ← Kiểm kê định kỳ
        </a>

        {notice && <Toast message={notice} onClose={() => setNotice(null)} />}
        {pendingUndo && (
          <Toast
            message={pendingUndo.message}
            onClose={() => setPendingUndo(null)}
            actionLabel="Hoàn tác"
            onAction={applyUndo}
            actionAriaLabel={`Hoàn tác: ${pendingUndo.message}`}
            durationMs={10000}
          />
        )}

        <div className={styles.detailHead}>
          <div className={styles.detailTitleWrap}>
            <div className={styles.detailKicker}>
              {campaign.period} · {campaign.coll}
            </div>
            <h2 className={styles.detailTitle}>{campaign.name}</h2>
          </div>
          <div className={styles.detailActions}>
            <StatusPill label={campaign.status} colors={CAMPAIGN_STATUS_COLORS[campaign.status]} />
            {campaign.locked ? (
              <span className={styles.lockedBadge}>
                Đã chốt đợt · {campaign.lockedBy} · {campaign.lockedAt}
              </span>
            ) : (
              <button type="button" className={styles.secondaryBtn} onClick={() => setConfirmLockOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                Chốt đợt kiểm kê
              </button>
            )}
            <button type="button" className={styles.secondaryBtn} onClick={() => setMinutesModalOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V6z" />
                <path d="M15 2v4h4M9 13h6M9 17h4" />
              </svg>
              Xuất biên bản
            </button>
          </div>
        </div>

        <div className={styles.summaryRow}>
          <GlassCard>
            <div className={styles.summaryTile}>
              <div className={styles.summaryLabel}>Phạm vi đợt</div>
              <div className={styles.summaryValue}>{scope.length}</div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className={styles.summaryTile}>
              <div className={styles.summaryLabel}>Đã đối chiếu</div>
              <div className={styles.summaryValue} data-tone="good">
                {doneCount} ({progressPct}%)
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className={styles.summaryTile}>
              <div className={styles.summaryLabel}>Thiếu số kiểm kê</div>
              <div className={styles.summaryValue} data-tone="warn">
                {missingCount}
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className={styles.summaryTile}>
              <div className={styles.summaryLabel}>Khớp / Lệch</div>
              <div className={styles.summaryValue}>
                {matchedCount} / {mismatchCount}
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard dense>
          {!campaign.locked && selectedKeys.size > 0 && (
            <div className={styles.bulkBar}>
              <span>{selectedKeys.size} dòng đã chọn</span>
              <button type="button" className={styles.checkBtn} onClick={bulkMarkVisited}>
                Đánh dấu đã kiểm tra hiện trường ({selectedKeys.size})
              </button>
              <button type="button" className={styles.cancelBtn} onClick={() => setSelectedKeys(new Set())}>
                Bỏ chọn
              </button>
            </div>
          )}
          <div className={styles.tableWrap}>
            <table className="data-table data-table--tight">
              <thead>
                <tr>
                  {!campaign.locked && (
                    <th className={styles.checkboxCol}>
                      <input
                        type="checkbox"
                        checked={rows.length > 0 && rows.every((r) => selectedKeys.has(r.key))}
                        onChange={() => toggleSelectAll(rows.map((r) => r.key))}
                        aria-label="Chọn tất cả các dòng"
                      />
                    </th>
                  )}
                  <th>ĐỐI TƯỢNG</th>
                  <th>MÃ ĐỊNH DANH HỆ THỐNG</th>
                  <th>SỐ KIỂM KÊ HIỆN VẬT GỐC</th>
                  <th>KẾT QUẢ ĐỐI CHIẾU</th>
                  <th>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const rowAdjustments = adjustments[r.key] ?? [];
                  return (
                    <tr key={r.key}>
                      {!campaign.locked && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedKeys.has(r.key)}
                            onChange={() => toggleSelectRow(r.key)}
                            aria-label={`Chọn dòng ${r.asset.name}`}
                          />
                        </td>
                      )}
                      <td>
                        <div className="strong">{r.asset.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {r.asset.loc}
                        </div>
                      </td>
                      <td className="mono nowrap">{r.asset.physicalObjectId}</td>
                      <td style={{ maxWidth: 220 }}>
                        {r.status === 'Lệch' && (
                          <div className={styles.mismatchNote}>
                            hiện trường mới: <strong>{r.displayValue}</strong> ≠ đã ghi nhận: <strong>{r.priorValue}</strong>
                          </div>
                        )}
                        {r.status !== 'Lệch' && (isMissingDisplay(r.displayValue) ? <em>{r.displayValue}</em> : r.displayValue)}
                        {campaign.locked && rowAdjustments.length > 0 && (
                          <div className={styles.adjustHistory}>
                            <div className={styles.adjustOriginal}>
                              Bản gốc: <s>{r.displayValue}</s>
                            </div>
                            {rowAdjustments.map((adj) => (
                              <div key={adj.id} className={styles.adjustEntry}>
                                → <strong>{adj.value}</strong> — {adj.reason}
                                <div className={styles.adjustMeta}>
                                  {adj.user} · {adj.time}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <StatusPill label={r.status} colors={RECONCILE_COLORS[r.status]} />
                      </td>
                      <td style={{ minWidth: 168 }}>
                        {campaign.locked ? (
                          <button
                            type="button"
                            className={styles.checkBtn}
                            onClick={() => openAdjust(r.key, r.asset.physicalObjectId, r.asset.name, r.displayValue)}
                          >
                            Điều chỉnh
                          </button>
                        ) : editingKey === r.key ? (
                          <div className={styles.inlineEdit}>
                            <input
                              className={styles.inlineInput}
                              value={drafts[r.key] ?? ''}
                              onChange={(e) => setDrafts((prev) => ({ ...prev, [r.key]: e.target.value }))}
                              placeholder="VD: HV-2026-0138"
                              aria-label={`Số kiểm kê hiện trường cho ${r.asset.name}`}
                            />
                            <button type="button" className={styles.checkBtn} onClick={() => saveRecorded(r.key, r.displayValue, r.asset.name)}>
                              Lưu
                            </button>
                          </div>
                        ) : r.status === 'Chưa đối chiếu' ? (
                          <button type="button" className={styles.checkBtn} onClick={() => markVisited(r.key, r.asset.name)}>
                            Xác nhận đã kiểm tra hiện trường
                          </button>
                        ) : r.status === 'Lệch' ? (
                          <button type="button" className={styles.checkBtn} onClick={() => resolveMismatch(r.key, r.asset.name)}>
                            Chấp nhận giá trị hiện trường mới
                          </button>
                        ) : (
                          <button type="button" className={styles.checkBtn} onClick={() => startEdit(r.key, r.displayValue)}>
                            {r.status === 'Khớp' ? 'Sửa số kiểm kê' : 'Nhập số kiểm kê tìm được'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className={styles.reconcileNote}>
            <span>ℹ️</span>
            <span>
              "Khớp"/"Lệch" ghi nhận trong phiên làm việc hiện tại (mô phỏng biên bản hiện trường). "Thiếu số kiểm kê" phản ánh đúng dữ liệu đang
              lưu trong hệ thống — trường <code>số kiểm kê hiện vật gốc</code> hiện là "Chưa nhập liệu" ở phần lớn hiện vật/tư liệu, xem hàng đợi
              nhập liệu ở đầu trang.
            </span>
          </div>
        </GlassCard>

        {campaign.locked && (
          <GlassCard dense className={styles.historyCard}>
            <h4 className={styles.historyTitle}>Lịch sử điều chỉnh sau chốt</h4>
            {campaignAdjustmentList.length === 0 ? (
              <div className={styles.historyEmpty}>Chưa có điều chỉnh nào sau khi chốt đợt này.</div>
            ) : (
              <ul className={styles.historyList}>
                {campaignAdjustmentList.map((item) => (
                  <li key={item.id} className={styles.historyItem}>
                    <span className="mono">{item.code}</span> {item.assetName}: <s>{item.original}</s> → <strong>{item.value}</strong> —{' '}
                    {item.reason}
                    <span className={styles.adjustMeta}> ({item.user}, {item.time})</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        )}

        {minutesModalOpen && (
          <Modal onClose={() => setMinutesModalOpen(false)}>
            <h3 className={styles.modalTitle}>Xuất biên bản kiểm kê</h3>
            <p className={styles.modalDesc}>
              Biên bản đợt "{campaign.name}" ({campaign.period}) — {doneCount}/{scope.length} đối tượng đã đối chiếu ({progressPct}%),{' '}
              {missingCount} đối tượng thiếu số kiểm kê, {mismatchCount} đối tượng lệch cần xử lý.
            </p>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => setMinutesModalOpen(false)}>
                Hủy
              </button>
              <button type="button" className={styles.confirmBtn} onClick={exportMinutes}>
                Xuất biên bản
              </button>
            </div>
          </Modal>
        )}

        {confirmLockOpen && (
          <ConfirmModal
            title="Chốt đợt kiểm kê"
            tone="danger"
            message={
              <>
                Đợt "{campaign.name}" ({campaign.period}) — <strong>{doneCount}/{scope.length}</strong> đối tượng đã đối chiếu ({progressPct}%),{' '}
                <strong>{missingCount}</strong> đối tượng còn thiếu số kiểm kê.
                <br />
                <br />
                Sau khi chốt, các dòng sẽ chuyển sang <strong>chỉ đọc</strong> — không thể sửa trực tiếp kết quả đối chiếu nữa. Mọi thay đổi tiếp
                theo phải qua "Điều chỉnh" kèm lý do bắt buộc, giữ nguyên bản ghi gốc trong lịch sử.
              </>
            }
            confirmLabel="Chốt đợt kiểm kê"
            onConfirm={handleLockCampaign}
            onCancel={() => setConfirmLockOpen(false)}
          />
        )}

        {adjustCtx && (
          <ConfirmModal
            title="Điều chỉnh sau chốt"
            message={`"${adjustCtx.name}" (${adjustCtx.code}) — bản ghi gốc "${adjustCtx.currentValue}" sẽ được GIỮ NGUYÊN trong lịch sử; đây là bản điều chỉnh mới, kèm lý do bắt buộc.`}
            confirmLabel="Ghi nhận điều chỉnh"
            confirmDisabled={!adjustValue.trim() || !adjustReason.trim()}
            onConfirm={confirmAdjust}
            onCancel={closeAdjust}
          >
            <label className={styles.modalLabel}>Số kiểm kê điều chỉnh</label>
            <input
              className={styles.textInput}
              value={adjustValue}
              onChange={(e) => setAdjustValue(e.target.value)}
              placeholder="VD: HV-2026-0138"
              aria-label="Số kiểm kê điều chỉnh"
            />
            <label className={styles.modalLabel} style={{ marginTop: 12 }}>
              Lý do điều chỉnh (bắt buộc)
            </label>
            <textarea
              className={styles.textArea}
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Ví dụ: phát hiện sai lệch khi rà soát lại biên bản giấy…"
              aria-label="Lý do điều chỉnh"
            />
          </ConfirmModal>
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.topRow}>
        <div className={styles.topStats}>
          <span className={styles.statChip}>
            <span className={styles.statChipNum}>{campaigns.length}</span> đợt kiểm kê
          </span>
          <span className={styles.statChip} data-tone="warn">
            <span className={styles.statChipNum}>{missingSoKiemKeCount}</span> đối tượng thiếu số kiểm kê
          </span>
        </div>
        <button type="button" className={styles.addBtn} onClick={() => setNewCampaignOpen(true)}>
          + Tạo đợt kiểm kê
        </button>
      </div>

      {notice && <Toast message={notice} onClose={() => setNotice(null)} />}

      <div className={styles.backlogBanner}>
        <span className={styles.backlogIcon}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </span>
        <div className={styles.backlogText}>
          <div className={styles.backlogTitle}>
            {missingSoKiemKeCount} / {allHienVatTaiLieu.length} hiện vật & tư liệu ({missingSoKiemKePct}%) chưa có số kiểm kê hiện vật gốc trong
            hệ thống
          </div>
          <div className={styles.backlogDesc}>
            Đây là hàng đợi nhập liệu ưu tiên (mã khuyết giá trị "Chưa nhập liệu" — 0quinquies): số kiểm kê hiện vật gốc do Trung tâm quản lý
            riêng, chưa được nhập vào hệ thống số. Mã định danh hệ thống (VM-HV-…/VM-TL-…) vẫn neo đầy đủ hồ sơ số hóa vào từng hiện vật, không
            phụ thuộc số kiểm kê giấy.
          </div>
        </div>
        <button type="button" className={styles.backlogBtn} onClick={() => navigate('/assets')}>
          Xem trong Dữ liệu số hóa
        </button>
      </div>

      <div className={styles.campaignGrid}>
        {campaignScopes.map(({ campaign, scope }) => {
          const cursor = cursorVisitedMap(scope, campaign.seed, campaign.targetProgress);
          const visitedCount = scope.filter((a) => cursor[a.physicalObjectId]).length;
          const progressPct = scope.length === 0 ? 0 : Math.round((visitedCount / scope.length) * 100);
          return (
            <GlassCard key={campaign.id} className={styles.campaignCard} onClick={() => setActiveCampaignId(campaign.id)}>
              <div className={styles.campaignHead}>
                <div>
                  <div className={styles.campaignPeriod}>{campaign.period}</div>
                  <h4 className={styles.campaignName}>{campaign.name}</h4>
                </div>
                <StatusPill label={campaign.status} colors={CAMPAIGN_STATUS_COLORS[campaign.status]} />
              </div>
              <div className={styles.campaignMeta}>
                <div className={styles.campaignMetaRow}>
                  <span className={styles.campaignMetaLabel}>Phạm vi:</span>
                  <span>
                    {campaign.coll} · {scope.length} đối tượng
                  </span>
                </div>
                <div className={styles.campaignMetaRow}>
                  <span className={styles.campaignMetaLabel}>Người phụ trách:</span>
                  <span>{campaign.owner}</span>
                </div>
              </div>
              <div className={styles.campaignProgressRow}>
                <ProgressBar pct={progressPct} height={8} color="var(--ink)" />
                <span className={styles.campaignProgressLabel}>{progressPct}%</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {newCampaignOpen && (
        <Modal
          onClose={() => {
            setNewCampaignOpen(false);
            resetForm();
          }}
        >
          <h3 className={styles.modalTitle}>Tạo đợt kiểm kê mới</h3>
          <p className={styles.modalDesc}>Theo Luật Di sản văn hóa 45/2024 Đ.23 — kiểm kê định kỳ hiện vật và tư liệu di sản.</p>

          <div className={styles.formField}>
            <label className={styles.modalLabel}>Kỳ kiểm kê</label>
            <input className={styles.textInput} placeholder="VD: Quý 1/2027" value={formPeriod} onChange={(e) => setFormPeriod(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.modalLabel}>Tên đợt kiểm kê</label>
            <input className={styles.textInput} placeholder="VD: Kiểm kê ảnh tư liệu lịch sử" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label className={styles.modalLabel}>Phạm vi (bộ sưu tập)</label>
            <select className={styles.selectInput} value={formColl} onChange={(e) => setFormColl(e.target.value)}>
              {COLLECTIONS_META.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.modalLabel}>Người phụ trách</label>
            <select className={styles.selectInput} value={formOwner} onChange={(e) => setFormOwner(e.target.value)}>
              {OWNER_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                setNewCampaignOpen(false);
                resetForm();
              }}
            >
              Hủy
            </button>
            <button type="button" className={styles.confirmBtn} onClick={createCampaign} disabled={!formPeriod.trim() || !formName.trim()}>
              Tạo đợt kiểm kê
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
