// Color-pair lookup tables ported from v3.html (`PILL`, `ACT`, `sPill`, plus
// the per-row literal colors used for user roles / upload state / batch rows).

export type ColorPair = readonly [bg: string, fg: string];

const FALLBACK: ColorPair = ['#eeeee6', '#5f5f54'];

/** Asset status pill — `PILL` in v3.html. C3 — mở rộng 5 → 9 trạng thái pipeline + 2 trạng thái ngoài luồng. */
const PILL: Record<string, ColorPair> = {
  'Chờ xử lý': ['#eeeee6', '#5f5f54'],
  'Đang xử lý': ['#fff1b0', '#6b5900'],
  'Kiểm định chất lượng': ['#ffe9b3', '#7a5b00'],
  'Chờ duyệt': ['#ffd9c2', '#9a4a1f'],
  'Thẩm định nội dung': ['#ffd9c2', '#8a3f18'],
  'Đã duyệt': ['var(--accent-soft)', 'var(--accent-text)'],
  'Xuất bản': ['var(--ink)', 'var(--accent)'],
  'Đã lưu trữ — đang giám sát': ['#dfe6da', '#3f4a3a'],
  'Đã kiểm kê': ['#c9d6c2', '#2f3a2a'],
  'Cần số hóa lại': ['#f7cfc7', '#8a271a'],
  'Đã gỡ/thu hồi': ['#eeeee6', '#5f5f54'],
};

export function statusPill(status: string): ColorPair {
  return PILL[status] || FALLBACK;
}

/** Audit-log action pill — `ACT` in v3.html. */
const ACT: Record<string, ColorPair> = {
  'Tải lên': ['#fff1b0', '#6b5900'],
  'Phê duyệt': ['var(--accent-soft)', 'var(--accent-text)'],
  'Xuất bản': ['var(--ink)', 'var(--accent)'],
  'Sửa metadata': ['#eeeee6', '#5f5f54'],
  'Tạo bộ sưu tập': ['#ffd9c2', '#9a4a1f'],
  'Phân quyền': ['#eeeee6', '#5f5f54'],
  'Đăng nhập': ['#eeeee6', '#5f5f54'],
};

export function actionPill(action: string): ColorPair {
  return ACT[action] || FALLBACK;
}

/** Generic status-word pill (connections / apis / requests / compliance) — `sPill` in v3.html. */
const S_PILL: Record<string, ColorPair> = {
  'Đang hoạt động': ['var(--accent-soft)', 'var(--accent-text)'],
  'Hoạt động': ['var(--accent-soft)', 'var(--accent-text)'],
  Đạt: ['var(--accent-soft)', 'var(--accent-text)'],
  'Đã chấp thuận': ['var(--accent-soft)', 'var(--accent-text)'],
  'Chờ duyệt': ['#ffd9c2', '#9a4a1f'],
  'Đang rà soát': ['#fff1b0', '#6b5900'],
  'Thử nghiệm': ['#fff1b0', '#6b5900'],
  'Chờ ký kết': ['#eeeee6', '#5f5f54'],
  'Qua LGSP': ['#eeeee6', '#5f5f54'],
  '3 bộ dữ liệu đã công bố': ['#fff1b0', '#6b5900'],
};

export function statePill(state: string): ColorPair {
  return S_PILL[state] || FALLBACK;
}

/** User role pill — literal per-row colors from the `users` array in v3.html. */
const ROLE_PILL: Record<string, ColorPair> = {
  'Quản trị': ['var(--ink)', '#ffffff'],
  'Kỹ thuật số hóa': ['#fff1b0', '#6b5900'],
  'Biên tập': ['var(--accent-soft)', 'var(--accent-text)'],
  'Phê duyệt': ['#ffd9c2', '#9a4a1f'],
  'Chỉ xem': ['#eeeee6', '#5f5f54'],
};

export function rolePill(role: string): ColorPair {
  return ROLE_PILL[role] || FALLBACK;
}

/** Upload-queue row state — ported from the `uploads.map(...)` block in v3.html. */
export function uploadState(item: { pct: number; error?: string }): {
  state: string;
  bg: string;
  fg: string;
  barFg: string;
} {
  if (item.error) return { state: 'Lỗi', bg: '#ffd9c2', fg: '#9a4a1f', barFg: '#e08a5a' };
  if (item.pct >= 100) return { state: 'Chờ xử lý', bg: 'var(--accent-soft)', fg: 'var(--accent-text)', barFg: '#e8b923' };
  return { state: 'Đang tải lên', bg: '#fff1b0', fg: '#6b5900', barFg: '#e8b923' };
}

/** Batch-parse row match pill — ported from the `batchRows.map(...)` block in v3.html. */
export function batchRowPill(matched: boolean): { bg: string; fg: string; label: string } {
  return matched
    ? { bg: 'var(--accent-soft)', fg: 'var(--accent-text)', label: '✓ Khớp tệp' }
    : { bg: '#ffd9c2', fg: '#9a4a1f', label: '⚠ Thiếu tệp' };
}
