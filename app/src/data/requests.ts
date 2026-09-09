import type { ShareRequest } from '../services/types';

// Ported from the `reqs` array in v3.html — SPLIT (A5 / redteam mục f): Sở
// Văn hóa & Thể thao Hà Nội là CƠ QUAN CHỦ QUẢN của Trung tâm, không phải
// "cơ quan khác". Xếp chung vào bảng "Yêu cầu chia sẻ từ cơ quan khác" khiến
// đơn vị cấp dưới trông như đang "xét duyệt" yêu cầu của chính cấp trên
// mình — sai sơ đồ tổ chức nhà nước. Nay tách thành nhóm riêng
// "Chỉ đạo/báo cáo cơ quan chủ quản".
//
// C5 — NĐ 47/2020/NĐ-CP đã bị bãi bỏ (Đ.23 NĐ 278/2025/NĐ-CP, 22/10/2025).
// `kind` không còn dùng nhãn "Chia sẻ mặc định" / "Theo yêu cầu đặc thù"
// (thuật ngữ NĐ 47) — thay bằng phương thức chia sẻ theo NĐ 278/2025: "Chia
// sẻ theo yêu cầu", "Đồng bộ dữ liệu", "Chia sẻ dữ liệu đóng gói"; "Dữ liệu
// mở" giữ nguyên vì không phải thuật ngữ NĐ 47.
export interface ShareRequestUI extends ShareRequest {
  /** Số văn bản đề nghị chia sẻ dữ liệu do cơ quan yêu cầu phát hành. */
  docNumber: string;
  /** Hạn xử lý yêu cầu (dd/mm/yyyy). */
  deadline: string;
}

export const SHARE_REQUESTS: ShareRequestUI[] = [
  {
    org: 'TT Bảo tồn di sản Thăng Long',
    what: 'Mô hình splat Khuê Văn Các (bản tối ưu web)',
    kind: 'Chia sẻ dữ liệu đóng gói',
    date: '06/08/2026',
    status: 'Đã chấp thuận',
    docNumber: 'CV-214/TTBTDSTL-KHTH',
    deadline: '13/08/2026',
  },
  {
    org: 'Trường ĐH KHXH&NV',
    what: 'Scan tư liệu Hán Nôm phục vụ nghiên cứu',
    kind: 'Chia sẻ theo yêu cầu',
    date: '01/08/2026',
    status: 'Đã chấp thuận',
    docNumber: 'CV-076/ĐHKHXHNV-QLKH',
    deadline: '08/08/2026',
  },
  {
    org: 'Bảo tàng Mỹ thuật Việt Nam',
    what: 'Ảnh chụp cận cảnh 10 hiện vật gốm phục vụ triển lãm chuyên đề',
    kind: 'Chia sẻ theo yêu cầu',
    date: '28/07/2026',
    status: 'Chờ duyệt',
    docNumber: 'CV-133/BTMTVN-TB',
    deadline: '10/08/2026',
  },
];

/** Chỉ đạo/báo cáo cơ quan chủ quản (Sở VH&TT Hà Nội) — KHÔNG phải "cơ quan khác". */
export const SUPERVISORY_REQUESTS: ShareRequest[] = [
  {
    org: 'Sở Văn hóa & Thể thao Hà Nội',
    what: 'Bộ ảnh + metadata 82 bia Tiến sĩ phục vụ trưng bày số',
    kind: 'Chia sẻ theo yêu cầu',
    date: '09/08/2026',
    status: 'Chờ duyệt',
  },
];
