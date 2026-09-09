import type { ComplianceItem } from '../services/types';

// Ported from the `compliance` array in v3.html.
export const COMPLIANCE: ComplianceItem[] = [
  { label: 'Chỉ định cán bộ đầu mối kết nối, chia sẻ dữ liệu; công khai tên, SĐT, email', state: 'Đạt' },
  { label: 'Chuẩn hóa cấu trúc dữ liệu trao đổi, sẵn sàng dịch vụ chia sẻ mặc định', state: 'Đạt' },
  { label: 'Công bố danh mục dữ liệu mở cho tổ chức, cá nhân khai thác', state: 'Đạt' },
  { label: 'Kết nối qua nền tảng tích hợp, chia sẻ dữ liệu của thành phố (LGSP)', state: 'Đạt' },
  { label: 'Không yêu cầu cung cấp lại dữ liệu đã có từ kết nối, chia sẻ', state: 'Đang rà soát' },
  { label: 'Quy trình tiếp nhận, xử lý yêu cầu chia sẻ theo yêu cầu đặc thù', state: 'Đang rà soát' },
];
