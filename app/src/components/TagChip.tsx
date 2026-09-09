import type { CSSProperties } from 'react';
import styles from './TagChip.module.css';

interface TagChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  activeBg?: string;
  activeFg?: string;
  inactiveBg?: string;
  inactiveFg?: string;
  /** Adds the `box-shadow: 0 3px 10px rgba(20,20,15,.05)` used by filter/tag chips. */
  shadow?: boolean;
  /** Smaller padding variant (upload tag chips: `6px 13px`). */
  dense?: boolean;
  /** Exact per-caller padding override, for the odd one-off (e.g. `6px 14px`). */
  padding?: string;
}

/** Generic pill-shaped toggle chip — ported from the many `{{ x.pick }}` /
 * `{{ x.toggle }}` chip rows in v3.html (library filters, upload type/tags,
 * collection tag filters). */
export default function TagChip({
  label,
  active = false,
  onClick,
  activeBg = 'var(--ink)',
  activeFg = '#ffffff',
  inactiveBg = '#ffffff',
  inactiveFg = '#5f5f54',
  shadow = false,
  dense = false,
  padding,
}: TagChipProps) {
  const style: CSSProperties = {
    background: active ? activeBg : inactiveBg,
    color: active ? activeFg : inactiveFg,
  };
  if (padding) style.padding = padding;
  return (
    // A8: real <button> instead of an <a> with no href — toggle chips aren't
    // navigation, so this is both more correct and keyboard-reachable/activatable
    // for free (no manual onKeyDown needed).
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[styles.chip, dense ? styles.dense : '', shadow ? styles.shadow : ''].join(' ').trim()}
      style={style}
    >
      {label}
    </button>
  );
}
