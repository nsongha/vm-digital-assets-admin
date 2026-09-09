import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import PermissionMatrixTable from '../components/PermissionMatrixTable';
import StatusPill from '../components/StatusPill';
import TagChip from '../components/TagChip';
import { actionPill, rolePill, type ColorPair } from '../components/statusColors';
import { COLLECTIONS_META } from '../data/collections';
import { LOGS } from '../data/logs';
import {
  PRECINCT_SCOPES,
  ROLE_OPTIONS,
  ROLE_SUMMARY,
  buildMatrix,
  diffFromDefault,
  policyViolations,
  toggleCell,
  type ModuleName,
  type PermissionMatrix,
  type PermissionName,
} from '../data/permissions';
import { USERS } from '../data/users';
import type { User } from '../services/types';
import styles from './UserDetailPage.module.css';

// B4 — Chi tiết người dùng + ma trận phân quyền (RBAC vai trò × module × quyền,
// kết hợp ABAC phạm vi phân khu/bộ sưu tập multi-select) + vòng đời tài khoản.
//
// Ma trận, quy tắc khóa ô và quy tắc phân tách nhiệm vụ nằm ở `data/permissions.ts`
// — dùng chung với hộp thoại Thêm người dùng và với `AuthContext`.
//
// `data/users.ts` chỉ giữ 5 trường dùng chung cho bảng danh sách (UsersPage).
// Các trường riêng của màn chi tiết (trạng thái tài khoản, MFA, ngày tạo/hạn,
// đăng nhập gần nhất, ma trận quyền mặc định, phạm vi ABAC) được mở rộng cục
// bộ trong trang này, khoá theo email — không sửa data/users.ts hay
// services/types.ts (đấu nối/di chuyển sang services là việc của orchestrator).

type AccountStatus = 'Hoạt động' | 'Khóa' | 'Chờ phê duyệt';

const ACCOUNT_STATUS_COLORS: Record<AccountStatus, ColorPair> = {
  'Hoạt động': ['var(--accent-soft)', 'var(--accent-text)'],
  Khóa: ['#ffd9c2', '#9a4a1f'],
  'Chờ phê duyệt': ['#fff1b0', '#6b5900'],
};

const MFA_COLORS: Record<'on' | 'off', ColorPair> = {
  on: ['var(--accent-soft)', 'var(--accent-text)'],
  off: ['#eeeee6', '#5f5f54'],
};

const COLLECTION_SCOPES = COLLECTIONS_META.map((c) => c.name);

interface UserExtra {
  status: AccountStatus;
  mfaEnabled: boolean;
  createdAt: string;
  expiresAt: string;
  lastLogin: string;
  lastLoginIp: string;
  scopeChips: string[];
}

// Mở rộng cục bộ theo email — demo, khớp phong cách "Hôm nay/Hôm qua/dd-mm" của data/logs.ts.
const USER_EXTRA: Record<string, UserExtra> = {
  'hanh.nt@vanmieu.vn': {
    status: 'Hoạt động',
    mfaEnabled: true,
    createdAt: '12/01/2024',
    expiresAt: 'Không giới hạn',
    lastLogin: 'Hôm nay 09:15',
    lastLoginIp: '10.0.4.2 (mạng nội bộ)',
    scopeChips: [...PRECINCT_SCOPES, ...COLLECTION_SCOPES],
  },
  'minh.tv@vanmieu.vn': {
    status: 'Hoạt động',
    mfaEnabled: true,
    createdAt: '03/03/2024',
    expiresAt: '03/03/2027',
    lastLogin: 'Hôm nay 09:42',
    lastLoginIp: '10.0.4.18 (mạng nội bộ)',
    scopeChips: ['Khu Đại Thành', 'Khu Thái Học', 'Kiến trúc & không gian', 'Hiện vật thờ tự'],
  },
  'trang.lt@vanmieu.vn': {
    status: 'Hoạt động',
    mfaEnabled: false,
    createdAt: '18/05/2024',
    expiresAt: '18/05/2027',
    lastLogin: 'Hôm nay 08:50',
    lastLoginIp: '10.0.4.25 (mạng nội bộ)',
    scopeChips: ['Bia Tiến sĩ', 'Tư liệu Hán Nôm'],
  },
  'quan.da@vanmieu.vn': {
    status: 'Hoạt động',
    mfaEnabled: true,
    createdAt: '02/09/2024',
    expiresAt: '02/09/2027',
    lastLogin: 'Hôm nay 07:30',
    lastLoginIp: '10.0.4.31 (mạng nội bộ)',
    scopeChips: ['Khu Nhập Đạo', 'Khu Thành Đạt', 'Kiến trúc & không gian'],
  },
  'ngoc.nb@vanmieu.vn': {
    status: 'Hoạt động',
    mfaEnabled: false,
    createdAt: '14/11/2024',
    expiresAt: '14/11/2027',
    lastLogin: 'Hôm qua 14:10',
    lastLoginIp: '113.190.20.44',
    scopeChips: ['Tư liệu Hán Nôm', 'Ảnh tư liệu lịch sử'],
  },
  'dat.pq@vanmieu.vn': {
    status: 'Hoạt động',
    mfaEnabled: true,
    createdAt: '20/01/2025',
    expiresAt: '20/01/2028',
    lastLogin: 'Hôm qua 17:20',
    lastLoginIp: '10.0.4.9 (mạng nội bộ)',
    scopeChips: [...PRECINCT_SCOPES],
  },
  'chau.vm@vanmieu.vn': {
    status: 'Khóa',
    mfaEnabled: false,
    createdAt: '08/02/2025',
    expiresAt: '08/02/2026',
    lastLogin: '08/08 09:05',
    lastLoginIp: '10.0.4.18 (mạng nội bộ)',
    scopeChips: ['Bia Tiến sĩ'],
  },
};

const DEFAULT_EXTRA: UserExtra = {
  status: 'Chờ phê duyệt',
  mfaEnabled: false,
  createdAt: '— Chưa nhập liệu',
  expiresAt: '— Chưa nhập liệu',
  lastLogin: '— Chưa nhập liệu',
  lastLoginIp: '— Chưa nhập liệu',
  scopeChips: [],
};

interface HistoryEntry {
  time: string;
  actor: string;
  note: string;
}

function buildHistory(user: User, extra: UserExtra): HistoryEntry[] {
  const entries: HistoryEntry[] = [{ time: extra.createdAt, actor: 'Hệ thống', note: `Tạo tài khoản với vai trò ${user.role}` }];
  LOGS.filter((l) => l.action === 'Phân quyền' && l.target === user.name).forEach((l) => {
    entries.push({ time: l.time, actor: l.user, note: l.note });
  });
  return entries;
}

export default function UserDetailPage() {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();

  const decoded = email ? decodeURIComponent(email) : undefined;
  const user = useMemo(() => USERS.find((u) => u.email === decoded) ?? USERS[0], [decoded]);
  const extra = USER_EXTRA[user.email] ?? DEFAULT_EXTRA;

  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState<AccountStatus>(extra.status);
  const mfaEnabled = extra.mfaEnabled;
  // Hai bản: `savedMatrix`/`savedScopes` là quyền đang có hiệu lực, `matrix`/`scopeChips`
  // là bản nháp đang sửa. Tách ra để việc tick một ô không lập tức thành quyền thật —
  // thay đổi phân quyền phải qua bước xác nhận có lý do và để lại vết (ADR-0012).
  const [savedMatrix, setSavedMatrix] = useState<PermissionMatrix>(() => buildMatrix(user.role));
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => buildMatrix(user.role));
  const [savedScopes, setSavedScopes] = useState<string[]>(extra.scopeChips);
  const [scopeChips, setScopeChips] = useState<string[]>(extra.scopeChips);
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantReason, setGrantReason] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>(() => buildHistory(user, extra));

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [draftRole, setDraftRole] = useState(user.role);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetSentAt, setResetSentAt] = useState<string | null>(null);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaRequestedAt, setMfaRequestedAt] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deleteTyped, setDeleteTyped] = useState('');

  const now = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay';

  const handleToggleCell = (mod: ModuleName, perm: PermissionName) => {
    setMatrix((prev) => toggleCell(prev, mod, perm));
  };

  const toggleScope = (label: string) => {
    setScopeChips((prev) => (prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]));
  };

  const violations = policyViolations(matrix);
  const customCells = diffFromDefault(role, matrix);
  const matrixDirty = JSON.stringify(matrix) !== JSON.stringify(savedMatrix);
  const scopesDirty = JSON.stringify([...scopeChips].sort()) !== JSON.stringify([...savedScopes].sort());
  const dirty = matrixDirty || scopesDirty;

  const discardChanges = () => {
    setMatrix(savedMatrix);
    setScopeChips(savedScopes);
  };

  const confirmGrant = () => {
    const parts: string[] = [];
    if (matrixDirty) parts.push('ma trận phân quyền');
    if (scopesDirty) parts.push(`phạm vi dữ liệu (${scopeChips.length} mục)`);
    setHistory((h) => [
      { time: now(), actor: 'Bạn', note: `Cập nhật ${parts.join(' và ')} — lý do: ${grantReason.trim()}` },
      ...h,
    ]);
    setSavedMatrix(matrix);
    setSavedScopes(scopeChips);
    setGrantReason('');
    setGrantModalOpen(false);
  };

  const saveRole = () => {
    setHistory((h) => [{ time: now(), actor: 'Bạn', note: `Đổi vai trò ${role} → ${draftRole}` }, ...h]);
    setRole(draftRole);
    setMatrix(buildMatrix(draftRole));
    setSavedMatrix(buildMatrix(draftRole));
    setRoleModalOpen(false);
  };

  const confirmLock = () => {
    const next: AccountStatus = status === 'Khóa' ? 'Hoạt động' : 'Khóa';
    setHistory((h) => [{ time: now(), actor: 'Bạn', note: next === 'Khóa' ? 'Khóa tài khoản' : 'Mở khóa tài khoản' }, ...h]);
    setStatus(next);
    setLockModalOpen(false);
  };

  const confirmReset = () => {
    setResetSentAt(now());
    setHistory((h) => [{ time: now(), actor: 'Bạn', note: 'Gửi email đặt lại mật khẩu' }, ...h]);
    setResetModalOpen(false);
  };

  const confirmMfaRequest = () => {
    setMfaRequestedAt(now());
    setHistory((h) => [{ time: now(), actor: 'Bạn', note: 'Yêu cầu người dùng bật lại MFA' }, ...h]);
    setMfaModalOpen(false);
  };

  const confirmDelete = () => {
    setDeleteStep(0);
    setDeleteTyped('');
    navigate('/users');
  };

  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <>
      <a onClick={() => navigate('/users')} className={styles.backLink}>
        ← Người dùng
      </a>

      <div className={styles.headRow}>
        <div className={styles.avatar} aria-hidden="true">
          {initial}
        </div>
        <div className={styles.headTitleWrap}>
          <h2 className={styles.headTitle}>{user.name}</h2>
          <div className={styles.headMeta}>{user.email}</div>
          <div className={styles.badgeRow}>
            <StatusPill label={role} colors={rolePill(role)} />
            <StatusPill label={status} colors={ACCOUNT_STATUS_COLORS[status]} />
            <StatusPill label={mfaEnabled ? 'MFA bật' : 'MFA tắt'} colors={MFA_COLORS[mfaEnabled ? 'on' : 'off']} />
          </div>
        </div>
      </div>

      <GlassCard style={{ marginBottom: 18 }}>
        <div className={styles.metaGrid}>
          <div className={styles.metaCell}>
            <span className={styles.metaKey}>Ngày tạo tài khoản</span>
            <span>{extra.createdAt}</span>
          </div>
          <div className={styles.metaCell}>
            <span className={styles.metaKey}>Hạn tài khoản</span>
            <span>{extra.expiresAt}</span>
          </div>
          <div className={styles.metaCell}>
            <span className={styles.metaKey}>Lần đăng nhập gần nhất</span>
            <span>
              {extra.lastLogin} · <span className="mono muted" style={{ fontSize: 12.5 }}>{extra.lastLoginIp}</span>
            </span>
          </div>
        </div>
      </GlassCard>

      <div className={styles.btnRow}>
        <button type="button" className={styles.secondaryBtn} onClick={() => { setDraftRole(role); setRoleModalOpen(true); }}>
          Sửa vai trò
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={() => setLockModalOpen(true)}>
          {status === 'Khóa' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={() => setResetModalOpen(true)}>
          Đặt lại mật khẩu
        </button>
        <button type="button" className={styles.secondaryBtn} disabled={mfaEnabled} onClick={() => setMfaModalOpen(true)}>
          Yêu cầu bật lại MFA
        </button>
        <button type="button" className={styles.dangerLink} onClick={() => setDeleteStep(1)}>
          Xóa tài khoản
        </button>
      </div>
      {resetSentAt && <p className={styles.inlineNote}>Đã gửi email đặt lại mật khẩu tới {user.email} lúc {resetSentAt}.</p>}
      {mfaRequestedAt && <p className={styles.inlineNote}>Đã gửi yêu cầu bật lại MFA lúc {mfaRequestedAt}.</p>}

      <div className={styles.sectionHead}>
        <h4 className={styles.sectionTitle}>Ma trận phân quyền</h4>
        <span className={styles.sectionMeta}>
          {customCells.length === 0 ? `Đúng mặc định vai trò ${role}` : `${customCells.length} ô khác mặc định vai trò ${role}`}
        </span>
      </div>
      <p className={styles.sectionNote}>{ROLE_SUMMARY[role as keyof typeof ROLE_SUMMARY] ?? ''}</p>
      <GlassCard dense>
        <PermissionMatrixTable matrix={matrix} role={role} onToggle={handleToggleCell} />
      </GlassCard>

      <h4 className={styles.sectionTitle}>Phạm vi dữ liệu theo phân khu &amp; bộ sưu tập</h4>
      <GlassCard style={{ marginBottom: 18 }}>
        <div className={styles.scopeGroup}>
          <span className={styles.scopeGroupLabel}>Phân khu</span>
          <div className={styles.chipWrap}>
            {PRECINCT_SCOPES.map((s) => (
              <TagChip key={s} label={s} active={scopeChips.includes(s)} shadow dense onClick={() => toggleScope(s)} />
            ))}
          </div>
        </div>
        <div className={styles.scopeGroup} style={{ marginTop: 14 }}>
          <span className={styles.scopeGroupLabel}>Bộ sưu tập</span>
          <div className={styles.chipWrap}>
            {COLLECTION_SCOPES.map((s) => (
              <TagChip key={s} label={s} active={scopeChips.includes(s)} shadow dense onClick={() => toggleScope(s)} />
            ))}
          </div>
        </div>
        {scopeChips.length === 0 && <p className={styles.emptyScope}>Chưa chọn phạm vi nào — người dùng sẽ không thấy dữ liệu số hóa nào theo ABAC.</p>}
      </GlassCard>

      {violations.length > 0 && (
        <div className={styles.violationBox} role="alert">
          <strong>Xung đột phân tách nhiệm vụ — không lưu được:</strong>
          <ul className={styles.violationList}>
            {violations.map((v) => (
              <li key={v.code + v.message}>{v.message}</li>
            ))}
          </ul>
        </div>
      )}

      {dirty && (
        <div className={styles.saveBar}>
          <span className={styles.saveBarText}>
            Có thay đổi phân quyền chưa lưu{matrixDirty && scopesDirty ? ' (ma trận và phạm vi dữ liệu)' : matrixDirty ? ' (ma trận)' : ' (phạm vi dữ liệu)'}.
          </span>
          <button type="button" className={styles.secondaryBtn} onClick={discardChanges}>
            Hoàn tác
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={violations.length > 0}
            onClick={() => setGrantModalOpen(true)}
          >
            Lưu phân quyền
          </button>
        </div>
      )}

      <h4 className={styles.sectionTitle}>Lịch sử phân quyền</h4>
      <GlassCard dense>
        <table className="data-table data-table--tight">
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td className="nowrap muted" style={{ width: 130, fontSize: 13 }}>
                  {h.time}
                </td>
                <td className="strong nowrap" style={{ width: 160 }}>
                  {h.actor}
                </td>
                <td>
                  <StatusPill label="Phân quyền" colors={actionPill('Phân quyền')} small />
                  <span style={{ marginLeft: 8 }}>{h.note}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {roleModalOpen && (
        <ConfirmModal
          title="Sửa vai trò"
          message="Đổi vai trò sẽ đặt lại ma trận phân quyền về mặc định của vai trò mới. Bạn có thể tinh chỉnh lại sau khi lưu."
          confirmLabel="Lưu vai trò mới"
          onConfirm={saveRole}
          onCancel={() => setRoleModalOpen(false)}
        >
          <div className={styles.chipWrap} style={{ marginTop: 4 }}>
            {ROLE_OPTIONS.map((r) => (
              <TagChip key={r} label={r} active={draftRole === r} onClick={() => setDraftRole(r)} />
            ))}
          </div>
        </ConfirmModal>
      )}

      {grantModalOpen && (
        <ConfirmModal
          title="Lưu thay đổi phân quyền"
          message={`Thay đổi có hiệu lực ngay với ${user.name}. Lý do bên dưới được ghi vào lịch sử phân quyền và nhật ký hoạt động — không sửa được về sau.`}
          confirmLabel="Lưu và ghi nhật ký"
          confirmDisabled={grantReason.trim().length < 10}
          onConfirm={confirmGrant}
          onCancel={() => setGrantModalOpen(false)}
        >
          <textarea
            className={styles.reasonInput}
            rows={3}
            value={grantReason}
            onChange={(e) => setGrantReason(e.target.value)}
            placeholder="VD: Bổ sung quyền biên mục khu Thái Học theo phân công tại cuộc họp ngày 10/08/2026."
            aria-label="Lý do thay đổi phân quyền"
          />
        </ConfirmModal>
      )}

      {lockModalOpen && (
        <ConfirmModal
          title={status === 'Khóa' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
          tone={status === 'Khóa' ? 'default' : 'danger'}
          message={
            status === 'Khóa'
              ? `${user.name} sẽ có thể đăng nhập lại ngay sau khi mở khóa.`
              : `${user.name} sẽ không thể đăng nhập cho đến khi tài khoản được mở khóa lại.`
          }
          confirmLabel={status === 'Khóa' ? 'Mở khóa' : 'Khóa tài khoản'}
          onConfirm={confirmLock}
          onCancel={() => setLockModalOpen(false)}
        />
      )}

      {resetModalOpen && (
        <ConfirmModal
          title="Đặt lại mật khẩu"
          message={`Hệ thống sẽ gửi một liên kết đặt lại mật khẩu tới ${user.email}. Mật khẩu mới KHÔNG được hiển thị trên màn hình này — người dùng tự đặt qua liên kết.`}
          confirmLabel="Gửi liên kết"
          onConfirm={confirmReset}
          onCancel={() => setResetModalOpen(false)}
        />
      )}

      {mfaModalOpen && (
        <ConfirmModal
          title="Yêu cầu bật lại MFA"
          message={`Gửi thông báo yêu cầu ${user.name} bật lại xác thực đa yếu tố trong lần đăng nhập kế tiếp.`}
          confirmLabel="Gửi yêu cầu"
          onConfirm={confirmMfaRequest}
          onCancel={() => setMfaModalOpen(false)}
        />
      )}

      {deleteStep === 1 && (
        <ConfirmModal
          title="Xóa tài khoản"
          tone="danger"
          message={`Bạn sắp xóa tài khoản của ${user.name}. Hành động này không thể hoàn tác. Bước tiếp theo yêu cầu xác nhận lần hai.`}
          confirmLabel="Tiếp tục"
          onConfirm={() => setDeleteStep(2)}
          onCancel={() => setDeleteStep(0)}
        />
      )}

      {deleteStep === 2 && (
        <Modal onClose={() => { setDeleteStep(0); setDeleteTyped(''); }}>
          <h3 className={styles.deleteTitle}>Xác nhận xóa vĩnh viễn</h3>
          <p className={styles.inlineNote} style={{ margin: '8px 0 14px' }}>
            Nhập chính xác địa chỉ email <strong>{user.email}</strong> để xác nhận xóa.
          </p>
          <input
            type="text"
            value={deleteTyped}
            onChange={(e) => setDeleteTyped(e.target.value)}
            className={styles.deleteInput}
            placeholder={user.email}
            aria-label="Nhập email để xác nhận xóa"
          />
          <div className={styles.deleteFooter}>
            <button type="button" className={styles.secondaryBtn} onClick={() => { setDeleteStep(0); setDeleteTyped(''); }}>
              Hủy
            </button>
            <button type="button" className={styles.dangerBtn} disabled={deleteTyped !== user.email} onClick={confirmDelete}>
              Xóa vĩnh viễn
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
