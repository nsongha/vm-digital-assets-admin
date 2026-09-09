import type { ReactNode } from 'react';
import Modal from './Modal';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  title: string;
  message?: ReactNode;
  /** 'danger' renders the confirm button in the destructive (red) style. */
  tone?: 'default' | 'danger';
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  /** Extra form content between the message and the footer (reason textarea, typed-confirmation input…). */
  children?: ReactNode;
}

/** Shared confirm/warn dialog — used across the admin screens for destructive
 * or hard-to-undo actions (khóa tài khoản, xóa, thu hồi API key, tạo lại API
 * key, gửi link đặt lại mật khẩu…). Wraps the existing `Modal` backdrop/panel. */
export default function ConfirmModal({
  title,
  message,
  tone = 'default',
  confirmLabel,
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
  confirmDisabled,
  children,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel}>
      <div className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        <button type="button" className={styles.close} onClick={onCancel} aria-label="Đóng hộp thoại">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {message && <div className={styles.message}>{message}</div>}
      {children}
      <div className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={tone === 'danger' ? styles.dangerBtn : styles.confirmBtn}
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
