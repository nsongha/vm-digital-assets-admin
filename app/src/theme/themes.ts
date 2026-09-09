// Bảng màu chủ đề. Mỗi chủ đề chỉ cần 2 màu gốc — `ink` (tông tối: chữ, nút chính,
// thanh bên) và `accent` (tông nhấn: nhãn, nút phụ, nền gradient). Các biến còn lại
// (inkHover, accentSoft, accentText, pageGrad) đều suy ra từ 2 màu này trong
// `ThemeContext.deriveVars` — nên thêm chủ đề mới chỉ việc thêm một cặp.
//
// Ràng buộc khi chọn cặp màu: `accent` phải đủ SÁNG để chữ `ink` đọc được khi nằm
// trên nền accent (nút "Sao lưu ngay", nhãn trạng thái), còn `ink` phải đủ TỐI để
// chữ trắng đọc được trên nền ink.

export type ThemePair = readonly [ink: string, accent: string];

export interface ThemeOption {
  id: string;
  /** Tên hiển thị trong hộp thoại Cài đặt. */
  label: string;
  /** Mô tả ngắn — giúp người dùng chọn đúng bối cảnh sử dụng. */
  hint: string;
  pair: ThemePair;
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  // 5 cặp gốc từ bản thiết kế v3
  { id: 'lime', label: 'Vàng chanh', hint: 'Bản thiết kế gốc v3 — tương phản mạnh', pair: ['#14140f', '#d7ff3f'] },
  { id: 'gold', label: 'Xanh rêu – vàng kim', hint: 'Tông trầm, gần sắc thái kiến trúc di tích', pair: ['#0b3d34', '#d4af37'] },
  { id: 'terracotta', label: 'Nâu đất – cam đất', hint: 'Tông ấm, gợi gạch ngói cổ', pair: ['#3b1410', '#e0a458'] },
  { id: 'olive', label: 'Xanh ô liu', hint: 'Trung tính, dịu mắt khi làm việc lâu', pair: ['#26301f', '#b7a15c'] },
  { id: 'crimson', label: 'Đỏ son', hint: 'Tông nghi lễ, dùng cho bản trình chiếu', pair: ['#151312', '#7a1f22'] },

  // Hai chủ đề bổ sung — hướng hiện đại, trẻ trung, sạch sẽ.
  // Indigo: nền tối xanh tím đậm + nhấn periwinkle. Tông "phần mềm công nghệ",
  // hợp khi trình bày phần kiến trúc hệ thống và tích hợp.
  { id: 'indigo', label: 'Indigo', hint: 'Hiện đại, tông công nghệ — hợp phần kiến trúc & tích hợp', pair: ['#1e1b4b', '#818cf8'] },
  // Cyan: nền xanh mực đậm + nhấn cyan tươi. Sáng, sạch, độ tương phản cao —
  // dễ đọc nhất trong 7 chủ đề khi chiếu máy chiếu phòng sáng.
  { id: 'cyan', label: 'Cyan', hint: 'Tươi sáng, tương phản cao — dễ đọc khi chiếu máy chiếu', pair: ['#083344', '#22d3ee'] },
] as const;

export const THEME_PAIRS: readonly ThemePair[] = THEME_OPTIONS.map((o) => o.pair);

/**
 * Chủ đề mặc định: xanh rêu đậm `#0b3d34` + vàng kim `#d4af37`.
 * Chủ đầu tư chọn bộ màu này cho bản trình duyệt: tông trầm, gần với sắc thái
 * kiến trúc và hoành phi câu đối của di tích, phù hợp bối cảnh cơ quan nhà nước
 * hơn cặp vàng chanh mặc định của bản thiết kế v3.
 */
export const DEFAULT_THEME: ThemePair = THEME_OPTIONS[1].pair;

export function themeOptionOf(pair: ThemePair): ThemeOption | undefined {
  return THEME_OPTIONS.find((o) => o.pair[0] === pair[0] && o.pair[1] === pair[1]);
}
