import { useEffect, useRef } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  onClose: () => void;
  /** Nhãn nút hành động phụ (vd: "Hoàn tác"). Không truyền = không hiện nút — các màn hình cũ không đổi hành vi. */
  actionLabel?: string;
  onAction?: () => void;
  /** aria-label riêng cho nút hành động; mặc định dùng actionLabel. */
  actionAriaLabel?: string;
  /** Tự đóng sau N mili-giây (vd: cửa sổ hoàn tác ~10s). Không truyền = giữ đến khi người dùng tự đóng (hành vi cũ). */
  durationMs?: number;
}

/** Dismissible inline confirmation banner — used after simulated export/backup/restore actions,
 * và (kể từ B3 hoàn tác) sau các thao tác đối chiếu kiểm kê có thể hoàn tác trong khoảng 10 giây. */
export default function Toast({ message, onClose, actionLabel, onAction, actionAriaLabel, durationMs }: ToastProps) {
  // Ref giữ bản mới nhất của onClose — tránh việc onClose đổi identity mỗi lần cha
  // re-render làm timer bị đặt lại liên tục (chỉ đặt lại khi durationMs/message đổi thật sự).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!durationMs) return;
    const timer = setTimeout(() => onCloseRef.current(), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, message]);

  return (
    <div className={styles.toast} role="status">
      <span className={styles.icon}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <span className={styles.msg}>{message}</span>
      {actionLabel && onAction && (
        <button type="button" className={styles.actionBtn} onClick={onAction} aria-label={actionAriaLabel ?? actionLabel}>
          {actionLabel}
        </button>
      )}
      <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng thông báo">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
