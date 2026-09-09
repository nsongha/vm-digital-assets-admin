import type { LogEntry } from '../services/types';

// Ported from the `logs` source array in v3.html (before the ACT color
// mapping / `open` handler are attached — those live in the service/UI layer),
// then updated (A3) so every asset-referencing entry's timestamp matches
// that asset's current `updated` field exactly (auditService.resolveTarget
// resolves `target` by the tier-2 `code` — see data/assets.ts for the
// generated codes) and every actor/action here is the "Người thực hiện"
// (an action performer, independent from the asset's "Cán bộ phụ trách").
export const LOGS: LogEntry[] = [
  { time: '09:42 hôm nay', user: 'Trần Văn Minh', action: 'Tải lên', target: 'VM-CT-00003.SPL01 — Điện Đại Thành, nội thất', note: '4 tệp' },
  { time: '09:15 hôm nay', user: 'Nguyễn Thị Hạnh', action: 'Phê duyệt', target: 'VM-HV-00004.M3D01 — Tượng thờ Chu Văn An', note: 'Chờ duyệt → Đã duyệt' },
  { time: '08:50 hôm nay', user: 'Lê Thu Trang', action: 'Sửa metadata', target: 'VM-TL-00001.TXT01 — Sắc phong Cảnh Hưng 35', note: 'Bổ sung bản dịch nghĩa' },
  { time: 'Hôm qua 17:20', user: 'Đỗ Anh Quân', action: 'Xuất bản', target: 'VM-HV-00001.M3D01 — Bia Tiến sĩ khoa Nhâm Tuất', note: 'Công khai trên cổng tham quan số' },
  { time: 'Hôm qua 15:03', user: 'Đỗ Anh Quân', action: 'Tải lên', target: 'VM-NN-00002.VID01 — Phim lễ khai bút 2026', note: 'ProRes 4K' },
  { time: 'Hôm qua 11:40', user: 'Lê Thu Trang', action: 'Tạo bộ sưu tập', target: 'Tư liệu Hán Nôm', note: 'Gộp toàn bộ tư liệu Hán Nôm đã số hóa vào một bộ sưu tập' },
  { time: '08/08 16:22', user: 'Nguyễn Thị Hạnh', action: 'Phân quyền', target: 'Vũ Minh Châu', note: 'Biên tập → Chỉ xem' },
  { time: '08/08 09:05', user: 'Vũ Minh Châu', action: 'Đăng nhập', target: '—', note: 'IP nội bộ 10.0.4.18' },
];
