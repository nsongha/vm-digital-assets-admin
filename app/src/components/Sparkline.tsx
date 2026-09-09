import { sparkPts } from '../theme/color';

interface SparklineProps {
  values: number[];
  stroke: string;
}

/** 64x24 SVG polyline sparkline, ported from the dashboard stat cards in v3.html. */
export default function Sparkline({ values, stroke }: SparklineProps) {
  return (
    <svg width="64" height="24" viewBox="0 0 64 24" style={{ flex: 'none', opacity: 0.55 }}>
      <polyline
        points={sparkPts(values)}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
