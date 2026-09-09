import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  /** Accessible name for the dialog — read by screen readers on open. */
  label?: string;
  /** Panel rộng cho nội dung dạng bảng (ma trận phân quyền) thay vì 520px mặc định. */
  wide?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Backdrop + panel — ported from the connection config modal (`configOpen`) in v3.html.
 * A8: traps focus inside the panel, closes on Escape, and exposes dialog semantics.
 *
 * Render qua `createPortal` ra `document.body` (ADR-0013): `backdrop-filter` trên
 * `GlassCard`/`Sidebar`/`AppShell` biến phần tử cha thành khối chứa cho con
 * `position: fixed`, nên một modal đặt trong thẻ có hiệu ứng kính mờ sẽ bị nhốt
 * trong bề rộng thẻ đó. Đặt portal ngay tại đây thay vì ở từng nơi gọi để lỗi
 * không tái diễn khi ai đó thêm modal mới bên trong một `GlassCard`. */
export default function Modal({ onClose, children, label, wide = false }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable && focusable.length > 0 ? focusable[0] : panel)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={panelRef}
        className={[styles.panel, wide ? styles.wide : ''].join(' ').trim()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
