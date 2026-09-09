// Color helpers ported 1:1 from the v3 mockup's Component class
// (hexToRgb / rgbToHex / mix / sparkPts).

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(rgb: RGB | number[]): string {
  return (
    '#' +
    rgb
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function mix(hexA: string, hexB: string, w: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.map((c, i) => c * (1 - w) + b[i] * w));
}

/** Builds an SVG <polyline points="…"> string for a 64x24 sparkline. */
export function sparkPts(vals: number[]): string {
  const w = 64;
  const h = 24;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  return vals
    .map((v, i) => {
      const x = ((i / (vals.length - 1)) * w).toFixed(1);
      const y = (h - ((v - min) / range) * h).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
}
