import styles from './HBarChart.module.css';

export interface HBarDatum {
  label: string;
  value: number;
  color?: string;
}

interface HBarChartProps {
  data: HBarDatum[];
  color?: string;
  maxValue?: number;
  valueFormatter?: (v: number) => string;
  rowHeight?: number;
  ariaLabel: string;
}

const VIEW_W = 640;
const LABEL_W = 176;
const VALUE_W = 56;

/** Self-drawn SVG horizontal bar chart — used for categorical breakdowns with longer Vietnamese labels. */
export default function HBarChart({
  data,
  color = 'var(--ink)',
  maxValue,
  valueFormatter,
  rowHeight = 32,
  ariaLabel,
}: HBarChartProps) {
  const fmt = valueFormatter ?? ((v: number) => String(v));
  const H = Math.max(rowHeight, data.length * rowHeight) + 8;
  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value));
  const barAreaW = VIEW_W - LABEL_W - VALUE_W - 12;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${VIEW_W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>
      {data.length === 0 && (
        <text x={VIEW_W / 2} y={H / 2} textAnchor="middle" className={styles.empty}>
          Không có dữ liệu trong khoảng thời gian đã chọn
        </text>
      )}
      {data.map((d, i) => {
        const rowY = i * rowHeight + 4;
        const midY = rowY + rowHeight / 2;
        const barW = max <= 0 ? 0 : (d.value / max) * barAreaW;
        const barY = midY - 8;
        return (
          <g key={d.label}>
            <text x={0} y={midY + 4} className={styles.label}>
              {d.label}
            </text>
            <rect x={LABEL_W} y={barY} width={barAreaW} height={16} rx={8} className={styles.track} />
            <rect x={LABEL_W} y={barY} width={Math.max(barW, 2)} height={16} rx={8} fill={d.color || color} />
            <text x={LABEL_W + barAreaW + 10} y={midY + 4} className={styles.value}>
              {fmt(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
