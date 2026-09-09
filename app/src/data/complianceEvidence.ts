// D8 — Chứng cứ tuân thủ MỞ XEM ĐƯỢC cho trang Tuân thủ & quản trị dữ liệu.
// Trước đây cột "Chứng cứ" của Sổ đăng ký tuân thủ chỉ là một câu mô tả —
// hội đồng chấm thầu không kiểm chứng được. Ở đây mỗi dòng có thể trỏ tới
// một hoặc nhiều `EvidenceDoc` — mở bằng `EvidenceViewer` (modal xem trước).
//
// TÍNH TRUNG THỰC: đây là tài liệu MẪU cho bản trình diễn — dải nhãn cảnh
// báo hiển thị trong chính EvidenceViewer (không lặp lại ở đây). Số hiệu
// văn bản dùng dạng trung tính (không kèm số thật); người ký chỉ lấy trong
// 7 người dùng mẫu ở `src/data/users.ts` — không dùng tên người có thật.

export type EvidenceKind =
  | 'quyChe'
  | 'quyTrinh'
  | 'quyetDinh'
  | 'bienBan'
  | 'baoCao'
  | 'congVan'
  | 'anhCauHinh'
  | 'trichNhatKy'
  | 'lienKetNoiBo';

export const EVIDENCE_KIND_LABELS: Record<EvidenceKind, string> = {
  quyChe: 'Quy chế',
  quyTrinh: 'Quy trình',
  quyetDinh: 'Quyết định',
  bienBan: 'Biên bản',
  baoCao: 'Báo cáo',
  congVan: 'Công văn',
  anhCauHinh: 'Ảnh chụp cấu hình',
  trichNhatKy: 'Trích nhật ký hệ thống',
  lienKetNoiBo: 'Liên kết nội bộ',
};

export interface EvidenceDoc {
  id: string;
  kind: EvidenceKind;
  title: string;
  soVanBan?: string; // số hiệu văn bản
  ngayBanHanh?: string;
  nguoiKy?: string;
  pages?: number;
  /** Nội dung xem trước — đoạn trích hoặc mô tả cấu trúc tài liệu. */
  preview: string[];
  /** Với `lienKetNoiBo`: đường dẫn trong app (vd. '/backup', '/compliance?tab=dpia'). */
  internalHref?: string;
}

export const EVIDENCE_DOCS: EvidenceDoc[] = [
  {
    id: 'ev-quyche-01',
    kind: 'quyChe',
    title: 'Quy chế quản lý dữ liệu số hóa di sản Văn Miếu – Quốc Tử Giám',
    soVanBan: '.../QĐ-VMQTG',
    ngayBanHanh: '02/01/2026',
    nguoiKy: 'Nguyễn Thị Hạnh',
    pages: 18,
    preview: [
      'Điều 1. Phạm vi điều chỉnh — áp dụng cho toàn bộ dữ liệu số hóa di sản phát sinh từ pipeline số hóa: mô hình 3D, Gaussian splat, tư liệu Hán Nôm, ảnh tư liệu và media nghe nhìn.',
      'Điều 4. Chuẩn kỹ thuật dữ liệu bắt buộc — lõi Dublin Core cho mô tả thư mục, CIDOC-CRM cho quan hệ ngữ nghĩa giữa đối tượng di sản, OAIS (ISO 14721) cho kiến trúc lưu trữ dài hạn (SIP/AIP/DIP).',
      'Điều 6. Kiểm soát chất lượng metadata — mọi bản ghi phải qua đủ 6 bước B.0–B.5 (khởi tạo, mô tả cốt lõi, xác minh niên đại/nguồn gốc, rà soát dữ liệu cá nhân, thẩm định nội dung, duyệt xuất bản) trước khi công bố.',
      'Điều 9. Tiếp nhận yêu cầu chủ thể dữ liệu — bộ phận Biên tập là đầu mối tiếp nhận, có trách nhiệm phản hồi trong 2 ngày làm việc và bàn giao cho cán bộ phụ trách theo loại yêu cầu.',
      'Điều 12. Hiệu lực thi hành — Quy chế có hiệu lực kể từ ngày ký, thay thế các quy định nội bộ trước đây về quản lý dữ liệu số hóa.',
    ],
  },
  {
    id: 'ev-quytrinh-backup',
    kind: 'quyTrinh',
    title: 'Quy trình bảo quản & sao lưu dữ liệu số hóa',
    soVanBan: '.../QT-VMQTG-02',
    ngayBanHanh: '15/01/2026',
    nguoiKy: 'Nguyễn Thị Hạnh',
    pages: 24,
    preview: [
      'Mục 1 — Ba mục tiêu không thể thỏa hiệp: không mất dữ liệu, không mất toàn vẹn dữ liệu, khôi phục được trong thời gian cam kết.',
      'Mục 2 — Kiến trúc lưu trữ "3 bản — 2 loại phương tiện — 1 nơi khác": tầng nóng (bản làm việc, tái tạo được), tầng lưu trữ AIP (bản gốc bất biến + metadata PREMIS), tầng lạnh off-site (bản sao đầy đủ tại địa điểm địa lý thứ hai).',
      'Mục 3 — Vận dụng chuẩn OAIS (ISO 14721): tách bạch gói tin SIP (nhận vào) / AIP (lưu trữ dài hạn) / DIP (phân phối); ghi sự kiện bảo quản theo PREMIS xuyên suốt vòng đời.',
      'Mục 10 — Khung tự đánh giá NDSA 4 mức theo 5 khía cạnh: Storage, Integrity, Security, Metadata, Content — làm thước đo mục tiêu bảo quản.',
      'Căn cứ: Luật Di sản văn hóa số 45/2024/QH15, Luật Dữ liệu số 60/2024/QH15, TCVN 11930:2017 (dẫn chiếu qua Thông tư 12/2022/TT-BTTTT).',
    ],
  },
  {
    id: 'ev-bienban-drill',
    kind: 'bienBan',
    title: 'Biên bản diễn tập khôi phục dữ liệu sau sự cố',
    soVanBan: '.../BB-VMQTG',
    ngayBanHanh: '10/06/2026',
    nguoiKy: 'Trần Văn Minh',
    pages: 6,
    preview: [
      'Kịch bản diễn tập: giả lập mất toàn bộ tầng nóng (bản làm việc + bản dẫn xuất web) của nhóm dữ liệu Gaussian splat khu Khuê Văn Các.',
      'Quy trình khôi phục: tái tạo bản làm việc từ tầng AIP (bản gốc bất biến), đối chiếu checksum, kiểm tra fixity sau khôi phục.',
      'Kết quả: khôi phục hoàn tất trong thời gian trong hạn cam kết; không phát hiện sai lệch checksum. Kết luận: đạt.',
      'Kiến nghị: bổ sung diễn tập cho nhóm dữ liệu tài liệu Hán Nôm trong kỳ diễn tập kế tiếp.',
    ],
  },
  {
    id: 'ev-baocao-audit',
    kind: 'baoCao',
    title: 'Báo cáo kiểm toán dữ liệu quý II/2026',
    soVanBan: '.../BC-VMQTG-KT',
    ngayBanHanh: '05/07/2026',
    nguoiKy: 'Nguyễn Thị Hạnh',
    pages: 12,
    preview: [
      'Phạm vi: đối chiếu đầy đủ, chính xác và kịp thời của dữ liệu trao đổi qua kết nối LGSP Thành phố và NDXP trong quý II/2026.',
      'Kết quả đối chiếu đầy đủ: đạt — 100% bản ghi gửi đi có xác nhận nhận tại đầu cuối.',
      'Kết quả đối chiếu chính xác: đạt — không phát hiện sai lệch trường dữ liệu bắt buộc.',
      'Kết quả đối chiếu kịp thời: đang rà soát — một số lô dữ liệu vượt cửa sổ đồng bộ khuyến nghị vào giữa tháng 5/2026, đã lập biện pháp khắc phục.',
    ],
  },
  {
    id: 'ev-congvan-lgsp',
    kind: 'congVan',
    title: 'Công văn xác nhận kết nối trục dữ liệu quốc gia qua LGSP',
    soVanBan: '.../CV-VMQTG-LGSP',
    ngayBanHanh: '20/05/2026',
    nguoiKy: 'Nguyễn Thị Hạnh',
    pages: 3,
    preview: [
      'Kính gửi: Đơn vị vận hành Nền tảng tích hợp, chia sẻ dữ liệu Thành phố (LGSP).',
      'Nội dung: xác nhận hoàn tất kết nối trao đổi dữ liệu số hóa di sản qua LGSP Thành phố và Nền tảng trao đổi định danh (NDXP).',
      'Ghi chú tiến độ: kết nối tới CSDL di sản của Bộ Văn hóa, Thể thao và Du lịch hiện ở trạng thái "Chờ ký kết" — dự kiến hoàn thành trước hạn 31/12/2026 theo Nghị định 278/2025/NĐ-CP.',
    ],
  },
  {
    id: 'ev-anhcauhinh',
    kind: 'anhCauHinh',
    title: 'Ảnh chụp cấu hình phân quyền hệ thống (RBAC/ABAC)',
    ngayBanHanh: '01/07/2026',
    pages: 1,
    preview: [
      'Mô tả cấu hình vai trò: Quản trị (toàn hệ thống), Kỹ thuật số hóa (tải lên/xử lý 3D & splat), Biên tập (metadata, tư liệu Hán Nôm), Phê duyệt (duyệt & xuất bản), Chỉ xem (tra cứu nội bộ).',
      'Kiểm soát truy cập thuộc tính (ABAC): trường đánh dấu HAN_CHE giới hạn hiển thị dữ liệu cá nhân trong tư liệu Hán Nôm (gia phả, sắc phong) theo vai trò truy vấn.',
      'Ảnh chụp minh họa màn hình cấu hình quyền — không chứa dữ liệu cá nhân của người dùng thật.',
    ],
  },
  {
    id: 'ev-trichnhatky',
    kind: 'trichNhatKy',
    title: 'Trích nhật ký hệ thống — bước "Xin ý kiến Bộ VHTTDL" trong pipeline duyệt xuất bản',
    ngayBanHanh: '20/06/2026',
    pages: 2,
    preview: [
      '20/06/2026 09:12 — user: pham.qd — action: Chuyển bước "Xin ý kiến Bộ VHTTDL" — target: VM-3D-014 — 82 bia Tiến sĩ (nhóm bia số 07).',
      '24/06/2026 14:05 — user: pham.qd — action: Ghi nhận phản hồi Bộ VHTTDL — target: VM-3D-014 — 82 bia Tiến sĩ (nhóm bia số 07).',
      'Nhật ký áp dụng cơ chế hash-chain bất biến — mỗi dòng ghi kèm mã băm của dòng liền trước, không thể sửa/xóa ngược.',
    ],
  },
  {
    id: 'ev-baocao-dpia',
    kind: 'baoCao',
    title: 'Hồ sơ đánh giá tác động xử lý dữ liệu cá nhân (DPIA)',
    soVanBan: '.../HS-VMQTG-DPIA (Mẫu số 10)',
    ngayBanHanh: '10/07/2026',
    nguoiKy: 'Nguyễn Thị Hạnh',
    pages: 9,
    preview: [
      'Mục 1 — Mô tả hoạt động xử lý: phạm vi dữ liệu cá nhân xuất hiện trong tư liệu số hóa (gia phả, sắc phong, hồ sơ hiến tặng hiện vật).',
      'Mục 3 — Đánh giá rủi ro: khả năng nhận diện danh tính người còn sống qua tư liệu lịch sử, mức độ ảnh hưởng nếu công bố không kiểm soát.',
      'Mục 5 — Biện pháp giảm thiểu: gắn trường HAN_CHE, giới hạn công bố ảnh gốc độ phân giải cao, chỉ công bố bản đã che/ẩn danh khi cần.',
      'Lập theo Mẫu số 10 — Nghị định 356/2025/NĐ-CP, trong hạn 60 ngày kể từ ngày bắt đầu xử lý dữ liệu cá nhân.',
    ],
  },
  {
    id: 'ev-quytrinh-72h',
    kind: 'quyTrinh',
    title: 'Quy trình tiếp nhận & thông báo sự cố dữ liệu cá nhân trong 72 giờ',
    soVanBan: '.../QT-VMQTG-05',
    ngayBanHanh: '05/07/2026',
    nguoiKy: 'Lê Thu Trang',
    pages: 8,
    preview: [
      'Bước 1 — Phát hiện & ghi nhận thời điểm phát hiện (mốc bắt đầu tính 72 giờ).',
      'Bước 2 — Xác minh sơ bộ: phạm vi dữ liệu, số chủ thể bị ảnh hưởng, khả năng gây thiệt hại.',
      'Bước 3 — Thông báo Bộ Công an (A05) trong vòng 72 giờ kể từ khi phát hiện, kèm hồ sơ mô tả sự cố.',
      'Bước 4 — Lưu hồ sơ vi phạm tối thiểu 5 năm kể từ ngày khắc phục xong.',
    ],
  },
  {
    id: 'ev-baocao-opendata',
    kind: 'baoCao',
    title: 'Danh mục dữ liệu mở đã công bố trên Cổng dữ liệu mở Thành phố',
    soVanBan: '.../DM-VMQTG-OD',
    ngayBanHanh: '15/06/2026',
    nguoiKy: 'Nguyễn Thị Hạnh',
    pages: 4,
    preview: [
      '1. Danh mục 82 bia Tiến sĩ (metadata + ảnh tối ưu web) — giấy phép CC BY-NC 4.0.',
      '2. Metadata dữ liệu số hóa đã xuất bản, không kèm ảnh độ phân giải gốc — giấy phép CC BY 4.0.',
      '3. Bản ghi OAI-PMH (Dublin Core) phục vụ các bên nghiên cứu — giấy phép CC BY-NC 4.0, kênh /oai.',
    ],
  },
  {
    id: 'ev-lienket-lifecycle',
    kind: 'lienKetNoiBo',
    title: 'Xem tab Vòng đời & thời hạn lưu trữ',
    internalHref: '/compliance?tab=lifecycle',
    preview: ['Điều hướng nội bộ trong ứng dụng — mở tab "Vòng đời & thời hạn lưu trữ" ngay trong trang Tuân thủ & quản trị dữ liệu.'],
  },
  {
    id: 'ev-lienket-share',
    kind: 'lienKetNoiBo',
    title: 'Xem trang Kết nối & chia sẻ dữ liệu',
    internalHref: '/share',
    preview: ['Điều hướng nội bộ — mở trang "Kết nối & chia sẻ dữ liệu" để xem chi tiết trạng thái kết nối LGSP/NDXP/CSDL di sản.'],
  },
];

export const EVIDENCE_BY_ID: Record<string, EvidenceDoc> = Object.fromEntries(EVIDENCE_DOCS.map((d) => [d.id, d]));

