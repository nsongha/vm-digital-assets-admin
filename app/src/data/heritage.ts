// System-wide heritage recognition constants — verified against redteam.md
// mục E (không gán bịa; đây là hằng số hiển thị ở Tổng quan/Chi tiết, không
// phải trường tự nhập tự do trên từng tài sản).

/** Xếp hạng di tích — áp dụng cho toàn bộ quần thể Văn Miếu — Quốc Tử Giám. */
export const HERITAGE_RANKING = {
  label: 'Di tích quốc gia đặc biệt',
  decision: 'QĐ 548/QĐ-TTg',
  date: '10/5/2012',
  full: 'Di tích quốc gia đặc biệt theo Quyết định số 548/QĐ-TTg ngày 10/5/2012 của Thủ tướng Chính phủ',
};

/** Di sản tư liệu thế giới UNESCO — áp dụng cho nhóm hiện vật 82 bia Tiến sĩ (kể cả rùa đội bia). */
export const UNESCO_MEMORY_OF_WORLD = {
  label: 'Di sản tư liệu thế giới UNESCO',
  regional: { year: 2010, scope: 'khu vực châu Á – Thái Bình Dương' },
  global: { year: 2011, scope: 'toàn cầu' },
  full: 'Di sản tư liệu thế giới UNESCO — Chương trình Ký ức thế giới khu vực châu Á – Thái Bình Dương (3/2010), công nhận toàn cầu (7/2011)',
  /** Only assets belonging to this bộ sưu tập carry the UNESCO badge. */
  collectionName: 'Bia Tiến sĩ',
};
