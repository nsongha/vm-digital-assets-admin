// Bộ từ vựng khuyết giá trị (0quinquies) — mọi trường hoặc có giá trị xác
// định, hoặc mang một mã khuyết giá trị tường minh. Không dùng chuỗi rỗng
// hay "—" tự do: mỗi mã kéo theo hành vi khác nhau (có tính vào hàng đợi
// công việc không, có tính vào % đầy đủ hồ sơ không, có xuất ra API công
// khai không).

export type MissingReason = 'KHONG_AP_DUNG' | 'CHUA_XAC_DINH' | 'KHONG_RO' | 'CHUA_NHAP' | 'HAN_CHE';

export const MISSING_LABELS: Record<MissingReason, string> = {
  KHONG_AP_DUNG: 'Không áp dụng',
  CHUA_XAC_DINH: 'Chưa xác định',
  KHONG_RO: 'Không rõ / Khuyết danh',
  CHUA_NHAP: 'Chưa nhập liệu',
  HAN_CHE: 'Hạn chế công bố',
};

/** Có tính trường này vào MẪU SỐ của "% độ đầy đủ hồ sơ" không. */
export function countsTowardCompletenessDenominator(reason: MissingReason): boolean {
  return reason !== 'KHONG_AP_DUNG';
}

/** Trong số các trường được tính vào mẫu số, trường này có được coi là "đã xử lý" (không trừ điểm) không. */
export function isCompletenessSatisfied(reason: MissingReason): boolean {
  return reason === 'KHONG_RO' || reason === 'HAN_CHE';
}

/** Trường này có nên vào hàng đợi công việc (nghiên cứu/thẩm định hoặc nhập liệu) không. */
export function queueFor(reason: MissingReason): 'nghiên cứu/thẩm định' | 'nhập liệu' | null {
  if (reason === 'CHUA_XAC_DINH') return 'nghiên cứu/thẩm định';
  if (reason === 'CHUA_NHAP') return 'nhập liệu';
  return null;
}

export interface MissingValue {
  kind: 'missing';
  reason: MissingReason;
  /** Bắt buộc kèm theo với CHUA_XAC_DINH/KHONG_RO — đã tra cứu nguồn nào, kết luận ra sao. */
  ghiChuKhuyet?: string;
}

/** Formats a missing-value sentinel the way every "trống" field is displayed — never a bare "—". */
export function formatMissing(reason: MissingReason, ghiChuKhuyet?: string): string {
  const label = `— ${MISSING_LABELS[reason]}`;
  return ghiChuKhuyet ? `${label} (${ghiChuKhuyet})` : label;
}

/** True if a display string was produced by `formatMissing` (used by completeness selectors). */
export function isMissingDisplay(value: string): boolean {
  return value.startsWith('— ');
}

/** Convenience builders for the two era cases named in 0quinquies. */
export const ERA_KHONG_AP_DUNG = formatMissing('KHONG_AP_DUNG');
export function eraChuaXacDinh(ghiChuKhuyet: string): string {
  return formatMissing('CHUA_XAC_DINH', ghiChuKhuyet);
}
