import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import StatusPill from '../components/StatusPill';
import TagChip from '../components/TagChip';
import { statePill } from '../components/statusColors';
import { useTheme } from '../theme/ThemeContext';
import styles from './RegisterPage.module.css';

// B1 — Đăng ký tài khoản mới. MÔ PHỎNG: không có backend thật, "gửi yêu cầu"
// chỉ chuyển sang màn xác nhận "Chờ phê duyệt". Tài khoản không thể đăng
// nhập cho tới khi quản trị viên duyệt (xem UsersPage/UserDetailPage — vòng
// đời tài khoản thuộc phạm vi B4, không tạo lại ở đây).
//
// Cùng 5 vai trò với `data/users.ts` (USERS[].role).
const ROLE_OPTIONS = ['Quản trị', 'Kỹ thuật số hóa', 'Biên tập', 'Phê duyệt', 'Chỉ xem'] as const;

interface FormErrors {
  hoTen?: string;
  email?: string;
  donVi?: string;
  soDienThoai?: string;
  vaiTro?: string;
  lyDo?: string;
  consent?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\-.\s]{8,15}$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { vars } = useTheme();

  const [step, setStep] = useState<'form' | 'submitted'>('form');

  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [donVi, setDonVi] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [vaiTro, setVaiTro] = useState<(typeof ROLE_OPTIONS)[number] | null>(null);
  const [lyDo, setLyDo] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!hoTen.trim()) next.hoTen = 'Vui lòng nhập họ tên.';
    if (!email.trim()) next.email = 'Vui lòng nhập email cơ quan.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Email không đúng định dạng.';
    if (!donVi.trim()) next.donVi = 'Vui lòng nhập đơn vị / phòng ban.';
    if (!soDienThoai.trim()) next.soDienThoai = 'Vui lòng nhập số điện thoại.';
    else if (!PHONE_RE.test(soDienThoai.trim())) next.soDienThoai = 'Số điện thoại không hợp lệ.';
    if (!vaiTro) next.vaiTro = 'Vui lòng chọn vai trò đề nghị.';
    if (!lyDo.trim()) next.lyDo = 'Vui lòng nêu lý do đề nghị cấp quyền.';
    if (!consent) next.consent = 'Cần đồng ý với nội dung thu thập dữ liệu cá nhân để tiếp tục.';
    return next;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStep('submitted');
  };

  return (
    <div className={styles.page} style={{ background: vars.pageGrad }}>
      <div className={styles.cardWrap}>
        <GlassCard className={styles.card} style={{ padding: 0 }}>
          <div className={styles.cardInner}>
            <div className={styles.brand}>
              <div className={styles.brandMark}>VM</div>
              <div>
                <div className={styles.brandTitle}>Văn Miếu — Quốc Tử Giám</div>
                <div className={styles.brandSub}>Đăng ký tài khoản truy cập hệ thống nội bộ</div>
              </div>
            </div>

            {step === 'form' && (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.grid2}>
                  <div>
                    <label className={styles.label} htmlFor="reg-hoten">
                      Họ tên<span className={styles.reqMark}>*</span>
                    </label>
                    <input
                      id="reg-hoten"
                      className={styles.input}
                      value={hoTen}
                      onChange={(e) => setHoTen(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      autoComplete="name"
                    />
                    {errors.hoTen && (
                      <div className={styles.fieldError} role="alert">
                        {errors.hoTen}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="reg-email">
                      Email cơ quan<span className={styles.reqMark}>*</span>
                    </label>
                    <input
                      id="reg-email"
                      className={styles.input}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ten.nguoidung@vanmieu.vn"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <div className={styles.fieldError} role="alert">
                        {errors.email}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="reg-donvi">
                      Đơn vị / phòng ban<span className={styles.reqMark}>*</span>
                    </label>
                    <input
                      id="reg-donvi"
                      className={styles.input}
                      value={donVi}
                      onChange={(e) => setDonVi(e.target.value)}
                      placeholder="Phòng Bảo tồn — Trung tâm HĐVHKH Văn Miếu — Quốc Tử Giám"
                      autoComplete="organization"
                    />
                    {errors.donVi && (
                      <div className={styles.fieldError} role="alert">
                        {errors.donVi}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="reg-phone">
                      Số điện thoại<span className={styles.reqMark}>*</span>
                    </label>
                    <input
                      id="reg-phone"
                      className={styles.input}
                      value={soDienThoai}
                      onChange={(e) => setSoDienThoai(e.target.value)}
                      placeholder="024 3845 xxxx"
                      autoComplete="tel"
                    />
                    {errors.soDienThoai && (
                      <div className={styles.fieldError} role="alert">
                        {errors.soDienThoai}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={styles.label}>
                    Vai trò đề nghị<span className={styles.reqMark}>*</span>
                  </label>
                  <div className={styles.chipRow}>
                    {ROLE_OPTIONS.map((r) => (
                      <TagChip key={r} label={r} active={vaiTro === r} inactiveBg="#f2f1e9" dense padding="7px 14px" onClick={() => setVaiTro(r)} />
                    ))}
                  </div>
                  {errors.vaiTro && (
                    <div className={styles.fieldError} role="alert">
                      {errors.vaiTro}
                    </div>
                  )}
                </div>

                <div>
                  <label className={styles.label} htmlFor="reg-lydo">
                    Lý do đề nghị cấp quyền<span className={styles.reqMark}>*</span>
                  </label>
                  <textarea
                    id="reg-lydo"
                    className={styles.textArea}
                    value={lyDo}
                    onChange={(e) => setLyDo(e.target.value)}
                    placeholder="Mô tả công việc cần dùng hệ thống, phạm vi bộ sưu tập/công trình liên quan…"
                  />
                  {errors.lyDo && (
                    <div className={styles.fieldError} role="alert">
                      {errors.lyDo}
                    </div>
                  )}
                </div>

                <div className={styles.pdplNote}>
                  <h4 className={styles.pdplTitle}>Thông báo thu thập dữ liệu cá nhân</h4>
                  <div className={styles.pdplRow}>
                    <span className={styles.pdplKey}>Mục đích</span>
                    <span>
                      Xác minh danh tính và thẩm quyền của người đề nghị để xét cấp tài khoản truy cập Hệ thống quản trị dữ liệu số hóa;
                      không sử dụng cho mục đích khác.
                    </span>
                  </div>
                  <div className={styles.pdplRow}>
                    <span className={styles.pdplKey}>Thời hạn lưu</span>
                    <span>
                      Trong thời gian tài khoản còn hiệu lực; sau khi khóa/thu hồi, thông tin được lưu theo thời hạn quy định tại chính
                      sách vòng đời &amp; lưu trữ dữ liệu nội bộ để phục vụ truy vết trách nhiệm và kiểm toán.
                    </span>
                  </div>
                  <div className={styles.pdplRow}>
                    <span className={styles.pdplKey}>Quyền của bạn</span>
                    <span>
                      Được biết, truy cập, yêu cầu chỉnh sửa, hạn chế xử lý, rút lại sự đồng ý và yêu cầu xóa dữ liệu cá nhân của mình
                      theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP.
                    </span>
                  </div>
                  <label className={styles.consentRow}>
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className={styles.checkbox} />
                    <span>Tôi đã đọc và đồng ý với nội dung thu thập, xử lý thông tin cá nhân nêu trên.</span>
                  </label>
                  {errors.consent && (
                    <div className={styles.fieldError} role="alert">
                      {errors.consent}
                    </div>
                  )}
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Gửi yêu cầu cấp tài khoản
                </button>

                <p className={styles.loginHint}>
                  Đã có tài khoản?{' '}
                  <a className={styles.link} onClick={() => navigate('/login')}>
                    Quay lại đăng nhập
                  </a>
                </p>
              </form>
            )}

            {step === 'submitted' && (
              <div className={styles.submitted}>
                <div className={styles.submittedIcon}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v6l3 2" />
                  </svg>
                </div>
                <h2 className={styles.stepTitle}>Yêu cầu đã được gửi</h2>
                <StatusPill label="Chờ phê duyệt" colors={statePill('Chờ duyệt')} />
                <p className={styles.stepDesc} style={{ marginTop: 14 }}>
                  Tài khoản của <strong>{hoTen.trim()}</strong> ({email.trim()}) hiện ở trạng thái <strong>Chờ phê duyệt</strong>, đề nghị
                  vai trò <strong>{vaiTro}</strong> tại <strong>{donVi.trim()}</strong>.
                </p>
                <ul className={styles.submittedList}>
                  <li>Quản trị viên hệ thống sẽ xem xét và phê duyệt yêu cầu.</li>
                  <li>Bạn sẽ không thể đăng nhập cho tới khi tài khoản được duyệt.</li>
                  <li>Thời gian xử lý tùy thuộc khối lượng công việc của quản trị viên tại thời điểm gửi yêu cầu.</li>
                </ul>
                <button type="button" className={styles.submitBtn} onClick={() => navigate('/login')}>
                  Quay lại đăng nhập
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        <footer className={styles.footer}>
          <p>Hệ thống nội bộ — chỉ dành cho cán bộ được cấp quyền.</p>
        </footer>
      </div>
    </div>
  );
}
