import { PIPELINE_SEQUENCE } from './pipeline';
import type { AssetStatus } from '../services/types';

// A2 — numeric values (`n`/`v`/`sub`/storage GB) are NEVER stored here
// anymore; they're derived at render time from `data/selectors.ts` (which
// reads the single `ASSETS` array). This module only keeps the PURELY
// decorative per-card config (colors/icons/sparkline shape) that has no
// factual claim attached to it.

// Tổng dung lượng thật (đã derive, xem `data/selectors.ts` → `totalSizeGB`)
// hiện ở khoảng 127 GB. Hạn mức mặc định đặt cao hơn có biên độ hợp lý
// (không vượt/hụt vô lý — A2) thay vì một con số tách rời như trước.
export const DEFAULT_QUOTA_GB = 220;

export interface PipelineStepDef {
  num: string;
  label: AssetStatus;
  chip: string;
  chipFg: string;
}

// Ported from the `pipeline` array in v3.html (per-row chip colors are
// literal in the source, not a formula, so kept literal here too) — `n` is
// no longer stored: DashboardPage derives it via `countByStatus`. C3 — mở
// rộng 5 → 9 bước, đọc thứ tự từ `PIPELINE_SEQUENCE` (nguồn duy nhất, dùng
// chung với `assetService.statusSteps()` và thanh tiến trình ở Chi tiết dữ
// liệu số hóa) để KHÔNG khai báo lại danh sách trạng thái ở nơi thứ ba.
// Chỉ 9 bước TUẦN TỰ hiện ở đây — 2 trạng thái ngoài luồng ('Cần số hóa lại',
// 'Đã gỡ/thu hồi') không phải một "bước" trong phễu pipeline này.
const CHIP_BY_LABEL: Partial<Record<AssetStatus, { chip: string; chipFg: string }>> = {
  'Chờ duyệt': { chip: 'var(--accent)', chipFg: 'var(--ink)' },
  'Xuất bản': { chip: '#ffffff', chipFg: 'var(--ink)' },
};
const DEFAULT_CHIP = { chip: 'rgba(255,255,255,.14)', chipFg: '#ffffff' };

export const PIPELINE_STEP_DEFS: PipelineStepDef[] = PIPELINE_SEQUENCE.map((label, i) => ({
  num: String(i + 1),
  label,
  ...(CHIP_BY_LABEL[label] ?? DEFAULT_CHIP),
}));

export type DashboardStatKind = 'total' | 'pending' | 'published' | 'storage';

export interface DashboardStatDef {
  kind: DashboardStatKind;
  k: string;
  bg: string;
  fg: string;
  badgeBg: string;
  badgeFg: string;
  icon: string;
  trend: string;
  trendUp: boolean;
  vals: number[];
}

// Ported from the `stats` array in v3.html (colors/icons/trend/sparkline
// literal per card — decorative, not a factual claim) — `v`/`sub` are no
// longer stored: DashboardPage derives them via `data/selectors.ts`.
export const DASHBOARD_STAT_DEFS: DashboardStatDef[] = [
  {
    kind: 'total',
    k: 'Tổng dữ liệu số hóa',
    bg: 'rgba(255,255,255,.32)',
    fg: 'var(--ink)',
    badgeBg: 'var(--ink)',
    badgeFg: '#ffffff',
    icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    trend: '+3,1%',
    trendUp: true,
    vals: [40, 52, 48, 60, 68, 74],
  },
  {
    kind: 'pending',
    k: 'Chờ duyệt',
    bg: 'color-mix(in srgb, var(--accent) 45%, transparent)',
    fg: 'var(--ink)',
    badgeBg: 'var(--ink)',
    badgeFg: 'var(--accent)',
    icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
    trend: '−12%',
    trendUp: false,
    vals: [70, 65, 72, 60, 50, 42],
  },
  {
    kind: 'published',
    k: 'Đã xuất bản',
    bg: 'color-mix(in srgb, var(--ink) 55%, transparent)',
    fg: '#ffffff',
    badgeBg: 'rgba(255,255,255,.15)',
    badgeFg: '#ffffff',
    icon: 'M20 6 9 17l-5-5',
    trend: '+6,4%',
    trendUp: true,
    vals: [30, 38, 44, 55, 62, 70],
  },
  {
    kind: 'storage',
    k: 'Dung lượng',
    bg: 'rgba(255,255,255,.32)',
    fg: 'var(--ink)',
    badgeBg: 'var(--ink)',
    badgeFg: '#ffffff',
    icon: 'M4 5a8 3 0 1 0 16 0 8 3 0 1 0-16 0zM4 5v14a8 3 0 0 0 16 0V5',
    trend: '+4%',
    trendUp: true,
    vals: [50, 55, 58, 62, 66, 70],
  },
];
