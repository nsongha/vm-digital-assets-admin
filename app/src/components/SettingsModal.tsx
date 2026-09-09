// Hộp thoại Cài đặt — mở từ nút "Cài đặt" ở chân thanh bên.
//
// LƯU Ý KỸ THUẬT: phải render qua portal ra document.body. Thanh bên có
// `backdrop-filter`, mà thuộc tính này biến phần tử thành *khối chứa* cho con
// `position: fixed` — nếu render tại chỗ, lớp phủ bị nhốt trong bề rộng 232px
// của thanh bên thay vì phủ toàn màn hình.
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../theme/ThemeContext';
import { DEFAULT_THEME, THEME_OPTIONS } from '../theme/themes';
import { useAppUi } from '../context/AppUiContext';
import { DEFAULT_QUOTA_GB } from '../data/dashboard';
import { getLocale, LOCALES, setLocale, type Locale } from '../i18n';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { quotaGB, setQuotaGB } = useAppUi();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Đóng bằng Esc, đưa tiêu điểm vào hộp thoại, khoá cuộn nền (trợ năng WCAG).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const activeLocale = getLocale();

  const resetAll = () => {
    setTheme(DEFAULT_THEME);
    setQuotaGB(DEFAULT_QUOTA_GB);
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.head}>
          <div>
            <h3 id="settings-title" className={styles.title}>
              Cài đặt
            </h3>
            <p className={styles.subtitle}>Áp dụng cho trình duyệt trên máy này — không ảnh hưởng người dùng khác.</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng hộp thoại cài đặt">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Chủ đề màu</h4>
          <p className={styles.sectionHint}>
            Đổi là thấy ngay. Lựa chọn được ghi nhớ — chuẩn bị trước buổi trình diễn, đến lúc trình bày không phải thao tác lại.
          </p>
          <div className={styles.themeGrid} role="radiogroup" aria-label="Chọn chủ đề màu">
            {THEME_OPTIONS.map((opt) => {
              const active = theme[0] === opt.pair[0] && theme[1] === opt.pair[1];
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={active ? `${styles.themeCard} ${styles.themeCardActive}` : styles.themeCard}
                  onClick={() => setTheme(opt.pair)}
                >
                  {/* Ô màu mô phỏng thu nhỏ giao diện: dải tối bên trái là thanh bên,
                      nền nhạt là vùng nội dung, chấm nhấn là nút/nhãn trạng thái. */}
                  <span className={styles.swatch} aria-hidden="true" style={{ background: `linear-gradient(135deg, ${opt.pair[1]}22, ${opt.pair[1]}55)` }}>
                    <span className={styles.swatchBar} style={{ background: opt.pair[0] }} />
                    <span className={styles.swatchDot} style={{ background: opt.pair[1] }} />
                  </span>
                  <span className={styles.themeText}>
                    <strong className={styles.themeLabel}>{opt.label}</strong>
                    <span className={styles.themeHint}>{opt.hint}</span>
                  </span>
                  {active && (
                    <svg className={styles.check} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <div className={styles.twoCol}>
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Hạn mức lưu trữ</h4>
            <p className={styles.sectionHint}>Dùng để tính tỷ lệ đã sử dụng ở trang Tổng quan và cảnh báo khi hàng đợi nhập liệu vượt ngưỡng.</p>
            <div className={styles.quotaRow}>
              <input
                id="quota-input"
                type="range"
                min={100}
                max={2000}
                step={50}
                value={quotaGB}
                onChange={(e) => setQuotaGB(Number(e.target.value))}
                className={styles.quotaRange}
                aria-label="Hạn mức lưu trữ tính bằng GB"
              />
              <output className={styles.quotaValue} htmlFor="quota-input">
                {quotaGB.toLocaleString('vi-VN')} GB
              </output>
            </div>
          </section>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Ngôn ngữ giao diện</h4>
            <p className={styles.sectionHint}>Giai đoạn 1 hoàn chỉnh tiếng Việt; kiến trúc đã tách lớp sẵn cho tiếng Anh và tiếng Pháp.</p>
            <div className={styles.localeRow}>
              {LOCALES.map((l) => {
                const ready = l.code === 'vi';
                return (
                  <button
                    key={l.code}
                    type="button"
                    className={activeLocale === l.code ? `${styles.localeChip} ${styles.localeChipActive}` : styles.localeChip}
                    onClick={() => ready && setLocale(l.code as Locale)}
                    disabled={!ready}
                    title={ready ? undefined : 'Bản dịch thuộc giai đoạn 2'}
                  >
                    {l.label}
                    {!ready && <span className={styles.localeTag}>GĐ2</span>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className={styles.foot}>
          <button type="button" className={styles.resetBtn} onClick={resetAll}>
            Khôi phục mặc định
          </button>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
