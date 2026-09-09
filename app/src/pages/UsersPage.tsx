import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddUserModal, { type NewUserDraft } from '../components/AddUserModal';
import GlassCard from '../components/GlassCard';
import PermissionMatrixTable from '../components/PermissionMatrixTable';
import StatusPill from '../components/StatusPill';
import TagChip from '../components/TagChip';
import Toast from '../components/Toast';
import { rolePill } from '../components/statusColors';
import { ROLE_OPTIONS, ROLE_SUMMARY, buildMatrix, type RoleName } from '../data/permissions';
import { services } from '../services';
import { userStore } from '../services/mock/userService';
import { useStore } from '../services/useStore';
import styles from './UsersPage.module.css';

// Bảng tham chiếu "ma trận theo vai trò" nằm ngay tại màn danh sách, không chỉ trong
// hồ sơ từng người: hội đồng chấm thầu và cán bộ thanh tra cần đọc được chính sách
// phân quyền mà không phải mở hồ sơ một tài khoản cụ thể nào.

export default function UsersPage() {
  const navigate = useNavigate();
  useStore(userStore); // đăng ký re-render khi có tài khoản mới được tạo
  const users = services.users.list();
  const grants = services.users.listGrants();

  const [addOpen, setAddOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [refRole, setRefRole] = useState<RoleName>('Biên tập');

  const pendingEmails = useMemo(() => new Set(grants.map((g) => g.email)), [grants]);
  const refMatrix = useMemo(() => buildMatrix(refRole), [refRole]);

  const handleCreate = (draft: NewUserDraft) => {
    services.users.create(
      { name: draft.name, email: draft.email, role: draft.role, scope: draft.scope, last: '— Chưa đăng nhập lần nào' },
      {
        email: draft.email,
        department: draft.department,
        matrix: draft.matrix,
        dataScopes: draft.dataScopes,
        expiresAt: draft.expiresAt,
        mfaRequired: draft.mfaRequired,
        reason: draft.reason,
      },
    );
    setAddOpen(false);
    setNotice(`Đã tạo tài khoản ${draft.name} (${draft.email}) ở trạng thái Chờ phê duyệt — cần một quản trị viên khác kích hoạt.`);
  };

  return (
    <>
      <div className={styles.topRow}>
        <button type="button" className={styles.addBtn} onClick={() => setAddOpen(true)}>
          + Thêm người dùng
        </button>
      </div>

      {notice && <Toast message={notice} onClose={() => setNotice(null)} />}

      <GlassCard dense>
        <div className="table-scroll">
          <table className="data-table">
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.email}
                  className={styles.rowLink}
                  onClick={() => navigate(`/users/${encodeURIComponent(u.email)}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/users/${encodeURIComponent(u.email)}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`Mở hồ sơ phân quyền của ${u.name}`}
                >
                  <td className="strong nowrap">{u.name}</td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <StatusPill label={u.role} colors={rolePill(u.role)} />
                  </td>
                  <td style={{ fontSize: 13 }}>{u.scope}</td>
                  <td className="nowrap muted">
                    {pendingEmails.has(u.email) ? <StatusPill label="Chờ phê duyệt" colors={['#fff1b0', '#6b5900']} small /> : u.last}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <h4 className={styles.sectionTitle}>Ma trận phân quyền theo vai trò</h4>
      <p className={styles.sectionNote}>
        Quyền mặc định của từng vai trò. Mở hồ sơ một người dùng để xem và tinh chỉnh ma trận riêng của tài khoản đó — mọi thay đổi
        đều ghi vào lịch sử phân quyền.
      </p>
      <div className={styles.chipWrap}>
        {ROLE_OPTIONS.map((r) => (
          <TagChip key={r} label={r} active={refRole === r} onClick={() => setRefRole(r)} />
        ))}
      </div>
      <p className={styles.roleSummary}>{ROLE_SUMMARY[refRole]}</p>
      <GlassCard dense>
        <PermissionMatrixTable matrix={refMatrix} role={refRole} />
      </GlassCard>

      {addOpen && <AddUserModal existingEmails={users.map((u) => u.email)} onCancel={() => setAddOpen(false)} onCreate={handleCreate} />}
    </>
  );
}
