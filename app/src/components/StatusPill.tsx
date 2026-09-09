import type { ColorPair } from './statusColors';
import styles from './StatusPill.module.css';

interface StatusPillProps {
  label: string;
  colors: ColorPair;
  small?: boolean;
}

/** Renders a `[bg, fg]` color-pair pill — shared by asset status, log action,
 * connection/api/request/compliance state, and user-role pills. */
export default function StatusPill({ label, colors, small }: StatusPillProps) {
  const [bg, fg] = colors;
  return (
    <span
      className={small ? `${styles.pill} ${styles.small}` : styles.pill}
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
}
