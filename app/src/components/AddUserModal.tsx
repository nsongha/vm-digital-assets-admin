import { useMemo, useState } from 'react';
import Modal from './Modal';
import PermissionMatrixTable from './PermissionMatrixTable';
import TagChip from './TagChip';
import { COLLECTIONS_META } from '../data/collections';
import {
  PRECINCT_SCOPES,
  ROLE_OPTIONS,
  ROLE_SUMMARY,
  buildMatrix,
  diffFromDefault,
  grantedCount,
  policyViolations,
  toggleCell,
  type ModuleName,
  type PermissionMatrix,
  type PermissionName,
  type RoleName,
} from '../data/permissions';
import styles from './AddUserModal.module.css';

// Hộp thoại tạo tài khoản. Ma trận phân quyền nằm NGAY TRONG biểu mẫu tạo, không
// phải một màn cấu hình riêng sau khi tài khoản đã tồn tại: một tài khoản được tạo
// rồi mới phân quyền sau luôn có một khoảng thời gian tồn tại với quyền chưa xác
// định — với hệ thống dữ liệu di sản quốc gia thì khoảng đó không được phép có.
//
// Tài khoản mới luôn vào trạng thái "Chờ phê duyệt": người tạo không tự kích hoạt
// tài khoản mình vừa cấp quyền (nguyên tắc bốn mắt, ADR-0011).

const DEPARTMENTS = [
  'Phòng Nghiên cứu — Sưu tầm',
  'Phòng Trưng bày — Thuyết minh',
  'Phòng Hành chính — Tổng hợp',
  'Tổ Công nghệ thông tin',
  'Đơn vị tư vấn/nhà thầu (tài khoản có thời hạn)',
] as const;

const SCOPE_HINT: Record<RoleName, string> = {
  'Quản trị': 'Toàn hệ thống',
  'Kỹ thuật số hóa': 'Tải lên, xử lý 3D & splat',
  'Biên tập': 'Metadata, tư liệu Hán Nôm',
  'Phê duyệt': 'Duyệt & xuất bản',
  'Chỉ xem': 'Tra cứu nội bộ',
};

export interface NewUserDraft {
  name: string;
  email: string;
  department: string;
  role: RoleName;
  scope: string;
  matrix: PermissionMatrix;
  dataScopes: string[];
  expiresAt: string;
  mfaRequired: boolean;
  reason: string;
}

interface AddUserModalProps {
  existingEmails: string[];
  onCancel: () => void;
  onCreate: (draft: NewUserDraft) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddUserModal({ existingEmails, onCancel, onCreate }: AddUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [role, setRole] = useState<RoleName>('Biên tập');
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => buildMatrix('Biên tập'));
  const [dataScopes, setDataScopes] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [mfaRequired, setMfaRequired] = useState(true);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const collectionScopes = useMemo(() => COLLECTIONS_META.map((c) => c.name), []);
  const violations = useMemo(() => policyViolations(matrix), [matrix]);
  const diff = useMemo(() => diffFromDefault(role, matrix), [role, matrix]);

  // MFA bắt buộc, không tắt được, với vai trò chạm vào quyền quản trị hoặc quyền
  // công bố ra ngoài — hai nhóm mà một tài khoản bị chiếm gây hậu quả nặng nhất.
  const mfaForced = role === 'Quản trị' || role === 'Phê duyệt';
  const effectiveMfa = mfaForced ? true : mfaRequired;

  const emailTrimmed = email.trim().toLowerCase();
  const duplicateEmail = existingEmails.some((e) => e.toLowerCase() === emailTrimmed);
  const emailValid = EMAIL_RE.test(emailTrimmed);

  const errors: string[] = [];
  if (!name.trim()) errors.push('Chưa nhập họ và tên.');
  if (!emailTrimmed) errors.push('Chưa nhập email công vụ.');
  else if (!emailValid) errors.push('Email không đúng định dạng.');
  else if (duplicateEmail) errors.push('Email này đã có tài khoản trong hệ thống.');
  if (!expiresAt) errors.push('Chưa đặt hạn tài khoản — tài khoản không thời hạn phải chọn mốc "31/12/2099" một cách có chủ ý.');
  if (dataScopes.length === 0) errors.push('Chưa chọn phạm vi dữ liệu: người dùng sẽ đăng nhập được nhưng không thấy bản ghi nào.');
  if (reason.trim().length < 10) errors.push('Chưa ghi lý do cấp tài khoản (tối thiểu 10 ký tự) — trường này đi vào nhật ký phân quyền.');
  violations.forEach((v) => errors.push(v.message));

  const canSubmit = errors.length === 0;

  const pickRole = (next: RoleName) => {
    setRole(next);
    setMatrix(buildMatrix(next));
  };

  const toggleScope = (label: string) => {
    setDataScopes((prev) => (prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]));
  };

  const handleToggleCell = (mod: ModuleName, perm: PermissionName) => {
    setMatrix((prev) => toggleCell(prev, mod, perm));
  };

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onCreate({
      name: name.trim(),
      email: emailTrimmed,
      department,
      role,
      scope: SCOPE_HINT[role],
      matrix,
      dataScopes,
      expiresAt,
      mfaRequired: effectiveMfa,
      reason: reason.trim(),
    });
  };

  return (
    <Modal onClose={onCancel} label="Thêm người dùng" wide>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>Thêm người dùng</h3>
          <p className={styles.sub}>
            Tài khoản được tạo ở trạng thái <strong>Chờ phê duyệt</strong> và chỉ hoạt động sau khi một quản trị viên khác kích hoạt.
          </p>
        </div>
        <button type="button" className={styles.close} onClick={onCancel} aria-label="Đóng hộp thoại">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>1. Danh tính</h4>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Họ và tên</span>
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Email công vụ</span>
            <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="a.nv@vanmieu.vn" />
            {emailTrimmed !== '' && emailValid && !emailTrimmed.endsWith('@vanmieu.vn') && (
              <span className={styles.hintWarn}>Không phải hộp thư công vụ @vanmieu.vn — chỉ dùng cho tài khoản nhà thầu, phải có hạn.</span>
            )}
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Đơn vị công tác</span>
            <select className={styles.input} value={department} onChange={(e) => setDepartment(e.target.value)}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Hạn tài khoản</span>
            <input className={styles.input} type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            <span className={styles.hint}>Tài khoản hết hạn tự khóa; gia hạn là một thao tác có ghi vết.</span>
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>2. Vai trò</h4>
        <div className={styles.chipWrap}>
          {ROLE_OPTIONS.map((r) => (
            <TagChip key={r} label={r} active={role === r} onClick={() => pickRole(r)} />
          ))}
        </div>
        <p className={styles.roleSummary}>{ROLE_SUMMARY[role]}</p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h4 className={styles.sectionTitle}>3. Ma trận phân quyền</h4>
          <div className={styles.sectionMeta}>
            <span>
              {grantedCount(matrix)} quyền · {diff.length === 0 ? 'đúng mặc định vai trò' : `${diff.length} ô khác mặc định`}
            </span>
            {diff.length > 0 && (
              <button type="button" className={styles.linkBtn} onClick={() => setMatrix(buildMatrix(role))}>
                Khôi phục mặc định
              </button>
            )}
          </div>
        </div>
        <PermissionMatrixTable matrix={matrix} role={role} onToggle={handleToggleCell} />
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>4. Phạm vi dữ liệu được phép truy cập</h4>
        <p className={styles.hint}>
          Ma trận trên trả lời “được làm gì”, phần này trả lời “trên dữ liệu nào”. Quyền Xem toàn bộ module vẫn không cho thấy bản ghi
          ngoài phạm vi đã chọn.
        </p>
        <div className={styles.scopeGroup}>
          <span className={styles.scopeGroupLabel}>Phân khu</span>
          <div className={styles.chipWrap}>
            {PRECINCT_SCOPES.map((s) => (
              <TagChip key={s} label={s} active={dataScopes.includes(s)} shadow dense onClick={() => toggleScope(s)} />
            ))}
          </div>
        </div>
        <div className={styles.scopeGroup}>
          <span className={styles.scopeGroupLabel}>Bộ sưu tập</span>
          <div className={styles.chipWrap}>
            {collectionScopes.map((s) => (
              <TagChip key={s} label={s} active={dataScopes.includes(s)} shadow dense onClick={() => toggleScope(s)} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>5. Xác thực và căn cứ cấp quyền</h4>
        <label className={styles.checkRow}>
          <input type="checkbox" checked={effectiveMfa} disabled={mfaForced} onChange={(e) => setMfaRequired(e.target.checked)} />
          <span>
            Bắt buộc xác thực đa yếu tố (MFA)
            {mfaForced && <span className={styles.forced}> — không thể tắt với vai trò {role}</span>}
          </span>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Lý do cấp tài khoản / căn cứ</span>
          <textarea
            className={styles.textarea}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="VD: Quyết định số 45/QĐ-TTVM ngày 10/08/2026 điều động cán bộ về Phòng Nghiên cứu — Sưu tầm."
          />
        </label>
      </section>

      {(touched || violations.length > 0) && errors.length > 0 && (
        <div className={styles.errorBox} role="alert">
          <strong>Chưa thể tạo tài khoản:</strong>
          <ul className={styles.errorList}>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Hủy
        </button>
        {/* Nút KHÔNG bị vô hiệu hóa khi biểu mẫu chưa hợp lệ: một nút xám không nói
            được thiếu gì. Bấm vào sẽ hiện danh sách lý do cụ thể ngay bên trên. */}
        <button type="button" className={styles.confirmBtn} onClick={submit}>
          Tạo tài khoản chờ phê duyệt
        </button>
      </div>
    </Modal>
  );
}
