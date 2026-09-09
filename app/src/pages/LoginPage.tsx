import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import StatusPill from '../components/StatusPill';
import { rolePill } from '../components/statusColors';
import { useTheme } from '../theme/ThemeContext';
import styles from './LoginPage.module.css';

// B1 — Đăng nhập. Toàn bộ luồng xác thực là MÔ PHỎNG (không có backend thật):
//   1) tài khoản/mật khẩu HOẶC SSO cơ quan
//   2) OTP 6 số (bỏ qua với SSO — cổng SSO tự xử lý MFA của đơn vị)
//   3) chọn VAI TRÒ DEMO — điểm demo phân quyền quan trọng nhất của màn này.
// Vai trò được chọn + trạng thái "đã đăng nhập" ghi vào localStorage
// (`vmAdmin.demoRole` / `vmAdmin.authed`) để orchestrator đấu nối với một
// AuthContext/route-guard thật sự sau này — trang này không tự tạo context
// mới (ngoài phạm vi cho phép: chỉ tạo file trong src/pages / src/components).

const APP_VERSION = '1.0.0';
const DEMO_OTP = '123456';
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type Step = 'credentials' | 'otp' | 'role';

interface DemoRole {
  role: string;
  scope: string;
}

// Cùng 5 vai trò với `data/users.ts` (USERS[].role) — giữ đúng thứ tự và mô
// tả phạm vi đã dùng ở đó để nhất quán toàn app.
const DEMO_ROLES: DemoRole[] = [
  { role: 'Quản trị', scope: 'Toàn hệ thống — người dùng, phân quyền, cấu hình' },
  { role: 'Kỹ thuật số hóa', scope: 'Tải lên, xử lý mô hình 3D & gaussian splat' },
  { role: 'Biên tập', scope: 'Sửa metadata, thẩm định tư liệu Hán Nôm' },
  { role: 'Phê duyệt', scope: 'Duyệt & xuất bản dữ liệu số hóa' },
  { role: 'Chỉ xem', scope: 'Tra cứu nội bộ — không có quyền chỉnh sửa' },
];

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-3.22 4.44" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { vars } = useTheme();

  const [step, setStep] = useState<Step>('credentials');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credError, setCredError] = useState('');
  const [ssoLoading, setSsoLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resendKey, setResendKey] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Đếm ngược gửi lại mã — chạy lại mỗi khi vào bước OTP hoặc bấm "Gửi lại mã".
  useEffect(() => {
    if (step !== 'otp') return;
    setResendIn(RESEND_SECONDS);
    const timer = window.setInterval(() => {
      setResendIn((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, resendKey]);

  useEffect(() => {
    if (step === 'otp') otpRefs.current[0]?.focus();
  }, [step]);

  const handleCredentialsSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Mô phỏng xác thực: không tiết lộ tài khoản có tồn tại hay không —
    // luôn cùng một thông báo lỗi chung chung khi thiếu thông tin.
    if (!email.trim() || !password.trim()) {
      setCredError('Sai tài khoản hoặc mật khẩu.');
      return;
    }
    setCredError('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    setStep('otp');
  };

  const handleSso = () => {
    setSsoLoading(true);
    window.setTimeout(() => {
      setSsoLoading(false);
      setStep('role');
    }, 900);
  };

  /**
   * Điền mã từ vị trí `idx`. Nhận cả một chữ số (gõ tay) lẫn nhiều chữ số một lúc
   * (dán mã, hoặc trình duyệt/trình tự động hoá gửi nhiều phím liên tiếp) — nếu chỉ
   * xử lý một ký tự thì gõ nhanh sẽ rơi mất số, ô OTP trông như không nhận phím.
   */
  const fillOtpFrom = (idx: number, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    if (!digits) {
      setOtp((prev) => {
        const next = [...prev];
        next[idx] = '';
        return next;
      });
      return;
    }
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < digits.length && idx + i < OTP_LENGTH; i += 1) {
        next[idx + i] = digits[i];
      }
      return next;
    });
    const landed = Math.min(idx + digits.length, OTP_LENGTH - 1);
    otpRefs.current[landed]?.focus();
  };

  const handleOtpChange = (idx: number, value: string) => fillOtpFrom(idx, value);

  /** Điền sẵn mã demo — để buổi trình diễn không phải gõ tay 6 ô. */
  const handleFillDemoOtp = () => {
    setOtp(DEMO_OTP.split(''));
    setOtpError('');
    otpRefs.current[OTP_LENGTH - 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setOtpError('Vui lòng nhập đủ 6 số.');
      return;
    }
    if (code !== DEMO_OTP) {
      setOtpError('Mã xác thực không đúng. Vui lòng thử lại.');
      return;
    }
    setOtpError('');
    setStep('role');
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    setResendKey((k) => k + 1);
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    otpRefs.current[0]?.focus();
  };

  const handleEnterApp = () => {
    if (!selectedRole) return;
    // Gọi signIn() của AuthContext — hàm này vừa ghi localStorage vừa cập nhật state
    // của phiên. Nếu chỉ ghi localStorage rồi navigate thì RequireAuth vẫn thấy chưa
    // đăng nhập và đá ngược lại đây.
    signIn(selectedRole);
    navigate('/', { replace: true });
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
                <div className={styles.brandSub}>Hệ thống quản trị dữ liệu số hóa</div>
              </div>
            </div>

            {step === 'credentials' && (
              <form className={styles.form} onSubmit={handleCredentialsSubmit} noValidate>
                <button type="button" className={styles.ssoBtn} onClick={handleSso} disabled={ssoLoading}>
                  <span className={styles.ssoIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18" />
                      <path d="M5 21V9l7-5 7 5v12" />
                      <path d="M9 21v-6h6v6" />
                    </svg>
                  </span>
                  <span className={styles.ssoText}>
                    <strong>{ssoLoading ? 'Đang chuyển đến cổng đăng nhập cơ quan…' : 'Đăng nhập bằng tài khoản cơ quan (SSO)'}</strong>
                    <span className={styles.ssoSub}>Khuyến nghị — dùng tài khoản LGSP / Cổng dịch vụ công của đơn vị</span>
                  </span>
                </button>

                <div className={styles.divider}>
                  <span>hoặc đăng nhập bằng mật khẩu</span>
                </div>

                <label className={styles.label} htmlFor="login-email">
                  Tài khoản / email cơ quan
                </label>
                <input
                  id="login-email"
                  type="text"
                  autoComplete="username"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten.nguoidung@vanmieu.vn"
                />

                <label className={styles.label} htmlFor="login-password">
                  Mật khẩu
                </label>
                <div className={styles.passwordWrap}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                <div className={styles.rowBetween}>
                  <a className={styles.link} onClick={() => setForgotOpen(true)}>
                    Quên mật khẩu?
                  </a>
                </div>

                {credError && (
                  <div className={styles.errorBanner} role="alert">
                    {credError}
                  </div>
                )}

                <button type="submit" className={styles.submitBtn}>
                  Đăng nhập
                </button>

                <p className={styles.registerHint}>
                  Chưa có tài khoản?{' '}
                  <a className={styles.link} onClick={() => navigate('/register')}>
                    Đăng ký cấp quyền
                  </a>
                </p>
              </form>
            )}

            {step === 'otp' && (
              <form className={styles.form} onSubmit={handleOtpSubmit} noValidate>
                <a className={styles.backLink} onClick={() => setStep('credentials')}>
                  ← Quay lại
                </a>
                <h2 className={styles.stepTitle}>Xác thực hai lớp (OTP)</h2>
                <p className={styles.stepDesc}>
                  Mã xác thực 6 số đã được gửi tới <strong>{email.trim() || 'tài khoản của bạn'}</strong>.
                </p>

                <div className={styles.otpRow}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      className={styles.otpBox}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      aria-label={`Số thứ ${i + 1} trên 6 của mã xác thực`}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        fillOtpFrom(i, e.clipboardData.getData('text'));
                      }}
                    />
                  ))}
                </div>

                {otpError && (
                  <div className={styles.errorBanner} role="alert">
                    {otpError}
                  </div>
                )}

                <div className={styles.resendRow}>
                  {resendIn > 0 ? (
                    <span className={styles.resendMuted}>Gửi lại mã sau {resendIn}s</span>
                  ) : (
                    <a className={styles.link} onClick={handleResend}>
                      Gửi lại mã
                    </a>
                  )}
                </div>

                <p className={styles.demoHint}>
                  Môi trường thử nghiệm — mã xác thực demo: <strong>{DEMO_OTP}</strong>{' '}
                  <button type="button" className={styles.demoFillBtn} onClick={handleFillDemoOtp}>
                    Điền mã demo
                  </button>
                </p>

                <button type="submit" className={styles.submitBtn}>
                  Xác nhận
                </button>
              </form>
            )}

            {step === 'role' && (
              <div className={styles.form}>
                <h2 className={styles.stepTitle}>Chọn vai trò demo</h2>
                <p className={styles.stepDesc}>
                  Chọn một vai trò để xem giao diện và quyền thao tác tương ứng — minh họa phân quyền (RBAC) của hệ thống.
                </p>

                <div className={styles.roleGrid}>
                  {DEMO_ROLES.map((r) => (
                    <button
                      type="button"
                      key={r.role}
                      className={selectedRole === r.role ? `${styles.roleCard} ${styles.roleCardActive}` : styles.roleCard}
                      onClick={() => setSelectedRole(r.role)}
                      aria-pressed={selectedRole === r.role}
                    >
                      <StatusPill label={r.role} colors={rolePill(r.role)} />
                      <span className={styles.roleScope}>{r.scope}</span>
                    </button>
                  ))}
                </div>

                <button type="button" className={styles.submitBtn} disabled={!selectedRole} onClick={handleEnterApp}>
                  Vào hệ thống
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        <footer className={styles.footer}>
          <p>Hệ thống nội bộ — chỉ dành cho cán bộ được cấp quyền.</p>
          <p>Phiên bản {APP_VERSION}</p>
        </footer>
      </div>

      {forgotOpen && (
        <Modal onClose={() => setForgotOpen(false)}>
          <h3 className={styles.modalTitle}>Quên mật khẩu</h3>
          <p className={styles.modalText}>
            Hệ thống nội bộ không hỗ trợ tự đặt lại mật khẩu trực tuyến. Vui lòng liên hệ Quản trị viên hệ thống (qua điện thoại nội bộ
            hoặc email quản trị) để được xác minh danh tính và cấp lại mật khẩu.
          </p>
          <button type="button" className={styles.submitBtn} onClick={() => setForgotOpen(false)}>
            Đã hiểu
          </button>
        </Modal>
      )}
    </div>
  );
}
