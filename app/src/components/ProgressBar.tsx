import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  pct: number;
  color?: string;
  /** Track height in px — v3.html uses 12px (quota), 8px (storage rows / uploads). */
  height?: number;
}

export default function ProgressBar({ pct, color = 'var(--ink)', height = 8 }: ProgressBarProps) {
  return (
    <div
      className={styles.track}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
