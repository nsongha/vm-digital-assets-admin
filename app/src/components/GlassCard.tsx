import type { CSSProperties, ReactNode } from 'react';
import styles from './GlassCard.module.css';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Denser padding variant used by table-hosting cards (`padding:10px 22px`). */
  dense?: boolean;
  /** Dark/tinted variant used for the assistant + pipeline dashboard cards. */
  dark?: boolean;
  /** Zero padding + clipped overflow — used by cover-image cards (collection grid). */
  flush?: boolean;
  onClick?: () => void;
  /** Accessible name for clickable cards (e.g. asset/collection name) — used with onClick. */
  ariaLabel?: string;
}

/** A8: when `onClick` is set, the card behaves like a real button for keyboard
 * users too (tabIndex + role="button" + Enter/Space) — it was a plain <div onClick>
 * before, unreachable without a mouse. */
export default function GlassCard({ children, className, style, dense, dark, flush, onClick, ariaLabel }: GlassCardProps) {
  const classes = [styles.card, dense ? styles.dense : '', dark ? styles.dark : '', className || ''].join(' ').trim();
  const mergedStyle: CSSProperties = flush
    ? { padding: 0, overflow: 'hidden', cursor: onClick ? 'pointer' : undefined, ...style }
    : { cursor: onClick ? 'pointer' : undefined, ...style };
  return (
    <div
      className={classes}
      style={mergedStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? ariaLabel : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
