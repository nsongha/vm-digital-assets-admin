import styles from './BarChart.module.css';

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDatum[];
  /** Default bar fill when a datum doesn't specify its own `color`. */
  color?: string;
  /** Fixed pixel height of the chart (width always stretches to the container). */
  height?: number;
  /** Fixed max for the value scale (e.g. 100 for a percentage chart) — default is the data max. */
  maxValue?: number;
  valueFormatter?: (v: number) => string;
  /** Rotates category labels -38° — for longer labels (e.g. bộ sưu tập names) that don't fit horizontally. */
  rotateLabels?: boolean;
  ariaLabel: string;
}

const VIEW_W = 640;

/** Self-drawn SVG vertical column chart — no charting dependency, ported in the spirit of `Sparkline.tsx`. */
export default function BarChart({
  data,
  color = 'var(--ink)',
  height = 200,
  maxValue,
  valueFormatter,
  rotateLabels = false,
  ariaLabel,
}: BarChartProps) {
  const fmt = valueFormatter ?? ((v: number) => String(v));
  const labelH = rotateLabels ? 58 : 24;
  const valueH = 18;
  const topPad = 10;
  const plotH = Math.max(1, height - labelH - valueH - topPad);
  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value));
  const n = Math.max(1, data.length);
  const sidePad = 18;
  const slot = (VIEW_W - sidePad * 2) / n;
  const barW = Math.min(56, slot * 0.5);
  const baseY = topPad + plotH;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${VIEW_W} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>
      <line x1={sidePad} y1={baseY} x2={VIEW_W - sidePad} y2={baseY} className={styles.baseline} />
      {data.length === 0 && (
        <text x={VIEW_W / 2} y={baseY - plotH / 2} textAnchor="middle" className={styles.empty}>
          Không có dữ liệu trong khoảng thời gian đã chọn
        </text>
      )}
      {data.map((d, i) => {
        const cx = sidePad + slot * i + slot / 2;
        const barH = max <= 0 ? 0 : (d.value / max) * plotH;
        const y = baseY - barH;
        const labelY = rotateLabels ? baseY + 14 : baseY + 16;
        return (
          <g key={d.label}>
            <text x={cx} y={y - 6} textAnchor="middle" className={styles.value}>
              {fmt(d.value)}
            </text>
            <rect x={cx - barW / 2} y={y} width={barW} height={Math.max(barH, 1)} rx={6} fill={d.color || color} />
            <text
              x={cx}
              y={labelY}
              textAnchor={rotateLabels ? 'end' : 'middle'}
              transform={rotateLabels ? `rotate(-38 ${cx} ${labelY})` : undefined}
              className={styles.label}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
