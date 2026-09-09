import type { User } from '../services/types';

// Ported from the `users` array in v3.html (role colors live with the UI —
// see StatusPill / ROLE_PILL mapping). Đỗ Anh Quân / Ngô Bảo Ngọc added
// (A2/A3) to broaden the pool of legitimate asset owners across ~150 mock
// records — người Phê duyệt (Phạm Quốc Đạt) và Chỉ xem (Vũ Minh Châu)
// KHÔNG được là "Cán bộ phụ trách" của bất kỳ dữ liệu số hóa nào (A3);
// xem `services/mock/assetService.ts` — `OWNER_POOL`.
export const USERS: User[] = [
  { name: 'Nguyễn Thị Hạnh', email: 'hanh.nt@vanmieu.vn', role: 'Quản trị', scope: 'Toàn hệ thống', last: 'Hôm nay 09:15' },
  { name: 'Trần Văn Minh', email: 'minh.tv@vanmieu.vn', role: 'Kỹ thuật số hóa', scope: 'Tải lên, xử lý 3D & splat', last: 'Hôm nay 09:42' },
  { name: 'Lê Thu Trang', email: 'trang.lt@vanmieu.vn', role: 'Biên tập', scope: 'Metadata, tư liệu Hán Nôm', last: 'Hôm nay 08:50' },
  { name: 'Đỗ Anh Quân', email: 'quan.da@vanmieu.vn', role: 'Kỹ thuật số hóa', scope: 'Tải lên, xử lý 3D & splat', last: 'Hôm nay 07:30' },
  { name: 'Ngô Bảo Ngọc', email: 'ngoc.nb@vanmieu.vn', role: 'Biên tập', scope: 'Metadata, tư liệu Hán Nôm', last: 'Hôm qua 14:10' },
  { name: 'Phạm Quốc Đạt', email: 'dat.pq@vanmieu.vn', role: 'Phê duyệt', scope: 'Duyệt & xuất bản', last: 'Hôm qua 17:20' },
  { name: 'Vũ Minh Châu', email: 'chau.vm@vanmieu.vn', role: 'Chỉ xem', scope: 'Tra cứu nội bộ', last: '08/08 09:05' },
];
