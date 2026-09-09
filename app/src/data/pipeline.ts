import type { AssetStatus } from '../services/types';

// C3 — Pipeline 5 → 9 trạng thái tuần tự (đọc cùng `00-ke-hoach-nang-cap.md`
// mục C3 và `07-mo-hinh-du-lieu.md` mục 4.1 — enum `asset.status`). Đây là
// NGUỒN DUY NHẤT cho thứ tự quy trình — `assetService.statusSteps()`,
// `data/dashboard.ts` (PIPELINE_STEP_DEFS, đếm ở Tổng quan) và thanh tiến
// trình ở Chi tiết dữ liệu số hóa đều đọc từ đây, không khai báo lại.
//
// 2 trạng thái NGOÀI chuỗi tuần tự (không tính vào "9 bước"):
//   - 'Cần số hóa lại' — nhánh THẤT BẠI của bước Kiểm định chất lượng (QC).
//   - 'Đã gỡ/thu hồi'  — ngoài luồng, chỉ tới được từ các trạng thái đã xuất
//     bản qua hành động "Gỡ xuất bản"; giữ nguyên bản ghi, không xoá.
export const PIPELINE_SEQUENCE: AssetStatus[] = [
  'Chờ xử lý',
  'Đang xử lý',
  'Kiểm định chất lượng',
  'Chờ duyệt',
  'Thẩm định nội dung',
  'Đã duyệt',
  'Xuất bản',
  'Đã lưu trữ — đang giám sát',
  'Đã kiểm kê',
];

/** Trạng thái mà từ đó đã coi là "đã xuất bản" — điều kiện tải bản gốc / hiện badge ký số / cho phép "Gỡ xuất bản". */
export const PUBLISHED_STATUSES: AssetStatus[] = ['Xuất bản', 'Đã lưu trữ — đang giám sát', 'Đã kiểm kê'];

/** Trạng thái có thể "Trả lại bổ sung" (đang trong vòng thẩm định/duyệt). */
export const REVIEWABLE_STATUSES: AssetStatus[] = ['Kiểm định chất lượng', 'Chờ duyệt', 'Thẩm định nội dung', 'Đã duyệt'];

/** Nhãn nút hành động khi bấm để RỜI khỏi trạng thái này (tiến 1 bước trong PIPELINE_SEQUENCE). */
const ADVANCE_LABEL: Partial<Record<AssetStatus, string>> = {
  'Chờ xử lý': 'Bắt đầu xử lý',
  'Đang xử lý': 'Gửi kiểm định chất lượng (QC)',
  'Kiểm định chất lượng': 'QC đạt — Gửi duyệt',
  'Chờ duyệt': 'Gửi thẩm định nội dung',
  'Thẩm định nội dung': 'Phê duyệt',
  'Đã duyệt': 'Xuất bản',
  'Xuất bản': 'Chuyển sang giám sát lưu trữ',
  'Đã lưu trữ — đang giám sát': 'Ghi nhận đã kiểm kê',
  'Đã kiểm kê': 'Đưa trở lại giám sát lưu trữ',
  'Cần số hóa lại': 'Đã số hóa lại — tiếp tục xử lý',
};

/** Trạng thái kế tiếp theo hướng "tiến" — dùng cho nút hành động chính. `null` nếu không có bước tiến (trạng thái cuối/ngoài luồng). */
export function nextStatus(current: AssetStatus): AssetStatus | null {
  if (current === 'Cần số hóa lại') return 'Đang xử lý';
  if (current === 'Đã kiểm kê') return 'Đã lưu trữ — đang giám sát'; // ⇄ theo 07-mo-hinh-du-lieu.md mục 3
  const idx = PIPELINE_SEQUENCE.indexOf(current);
  if (idx === -1 || idx === PIPELINE_SEQUENCE.length - 1) return null;
  return PIPELINE_SEQUENCE[idx + 1];
}

/** Nhãn hiển thị trên nút hành động chính cho trạng thái hiện tại — `null` nếu không có hành động tiến. */
export function advanceActionLabel(current: AssetStatus): string | null {
  return ADVANCE_LABEL[current] ?? null;
}

/** Đây có phải bước PHÊ DUYỆT không — áp dụng nguyên tắc 4 mắt (người duyệt ≠ cán bộ phụ trách). */
export function isApprovalStep(current: AssetStatus): boolean {
  return current === 'Thẩm định nội dung';
}

/** Đây có phải bước XUẤT BẢN không — với di tích quốc gia đặc biệt cần "Xin ý kiến Bộ VHTTDL" trước (NĐ 308/2025 Điều 87). */
export function isPublishStep(current: AssetStatus): boolean {
  return current === 'Đã duyệt';
}
