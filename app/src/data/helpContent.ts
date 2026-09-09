// Trợ giúp & tra cứu — dữ liệu nội dung tách khỏi UI (HelpPage.tsx).
//
// NGUỒN GỐC: thay thế trang "Tuân thủ & quản trị dữ liệu" cũ (CompliancePage.tsx,
// đã xóa). Trang cũ trình bày các mục dưới dạng TUYÊN BỐ tuân thủ do chính phần
// mềm tự chấm ("Đạt ✓") — chủ đầu tư yêu cầu bỏ cách trình bày này vì không ai
// kiểm chứng được, và phần mềm không phải chủ thể có thể "tuân thủ" hay "vi
// phạm" một văn bản pháp luật — chỉ con người mới chịu trách nhiệm được. Ở đây
// mỗi mục pháp lý tách thành 4 phần: văn bản yêu cầu gì (yeuCau) → hệ thống hỗ
// trợ chức năng gì (heThongHoTro — mô tả CÔNG CỤ, không phải "đã làm xong") →
// đơn vị vận hành phải tự làm/tự kiểm gì (donViTuLam) → chức danh nào xác nhận
// đã tuân thủ (trachNhiemXacNhan — luôn là con người, không phải hệ thống).
//
// ADR-0014: CHỈ tái sử dụng trích dẫn pháp lý đã có sẵn trong CompliancePage.tsx
// (số hiệu văn bản, điều khoản, nội dung yêu cầu) — giữ NGUYÊN VĂN, không bịa
// thêm điều khoản/số hiệu/nội dung pháp lý mới. Phần "heThongHoTro"/"donViTuLam"
// là diễn giải nghiệp vụ dựa trên các màn hình đã có trong ứng dụng, không phải
// trích dẫn pháp lý nên không bị ràng buộc "nguyên văn".
import { normalizeForSearch } from '../utils/search';

export type HelpCategory = 'phap-ly' | 'huong-dan' | 'canh-bao';

export const HELP_CATEGORY_LABELS: Record<HelpCategory, string> = {
  'phap-ly': 'Pháp lý',
  'huong-dan': 'Hướng dẫn sử dụng',
  'canh-bao': 'Đính chính văn bản',
};

/** Một chức năng/màn hình cụ thể hỗ trợ việc tuân thủ — KHÔNG phải một tuyên bố "đã tuân thủ". */
export interface HelpSupportItem {
  label: string;
  /** Route nội bộ nếu có thể điều hướng thẳng tới màn liên quan. */
  href?: string;
}

export interface HelpEntry {
  id: string;
  category: HelpCategory;
  /** Nhóm hiển thị: tên văn bản pháp lý (nhóm pháp lý) hoặc chủ đề thao tác (nhóm hướng dẫn). */
  group: string;
  title: string;
  keywords: string[];

  /**
   * Diễn giải dạng VĂN BẢN — đoạn văn xuôi mở đầu phần chi tiết, đọc được như
   * một trang tài liệu chứ không phải danh sách gạch đầu dòng.
   *
   * Phạm vi cho phép: giải thích NGHIỆP VỤ — vì sao yêu cầu này tồn tại, nó
   * chạm vào công việc hằng ngày ở chỗ nào, làm sai thì hậu quả ra sao, và
   * ranh giới giữa việc phần mềm làm được và việc con người phải làm.
   *
   * RÀNG BUỘC (ADR-0014): TUYỆT ĐỐI không thêm số hiệu văn bản, điều khoản hay
   * nội dung pháp lý mới ở đây. Mọi căn cứ pháp lý chỉ được nhắc lại từ
   * `soHieuVanBan` / `dieuKhoan` / `yeuCau` của chính mục đó — vốn đã trích
   * nguyên văn từ sổ đăng ký tuân thủ cũ. Chỗ nào cần diễn giải pháp lý sâu hơn
   * thì để `cangBoSung` đánh dấu, KHÔNG tự viết thay người phụ trách pháp chế.
   */
  dienGiai?: string[];

  /**
   * Đánh dấu nội dung còn thiếu mà chỉ người có thẩm quyền chuyên môn mới bổ
   * sung được (thường là pháp chế). Hiển thị thành khối nhắc việc trong trang,
   * cố ý để lộ ra thay vì giấu đi — người đọc phải biết chỗ nào tài liệu này
   * chưa đủ, hơn là tưởng đã đủ.
   */
  canBoSung?: string;

  // --- Nhóm 'phap-ly' — 4 phần theo yêu cầu chủ đầu tư -----------------
  soHieuVanBan?: string;
  dieuKhoan?: string;
  /** Văn bản yêu cầu gì — trích dẫn NGUYÊN VĂN từ trang tuân thủ cũ. */
  yeuCau?: string;
  /** Hệ thống hỗ trợ chức năng gì — không phải "đã đạt". */
  heThongHoTro?: HelpSupportItem[];
  /** Việc đơn vị vận hành phải tự làm/tự kiểm — hành động, không phải câu tường thuật. */
  donViTuLam?: string[];
  /** Chức danh chịu trách nhiệm XÁC NHẬN đã tuân thủ — luôn là con người. */
  trachNhiemXacNhan?: string;
  /** Biểu mẫu tham khảo đính kèm (KHÔNG phải chứng cứ tuân thủ) — id tra trong EVIDENCE_BY_ID. */
  evidenceIds?: string[];

  // --- Nhóm 'huong-dan' -------------------------------------------------
  steps?: string[];
  relatedRoute?: string;

  /** Ghi chú bổ sung — cảnh báo/lưu ý, dùng ở cả 3 nhóm. */
  note?: string;
}

/** Tìm theo tiêu đề + từ khóa + số hiệu văn bản + điều khoản — bỏ dấu 2 chiều như ô tìm dữ liệu số hóa. */
export function matchesHelpQuery(entry: HelpEntry, rawQuery: string): boolean {
  const q = rawQuery.trim();
  if (!q) return true;
  const normQ = normalizeForSearch(q);
  const haystacks = [
    entry.title,
    entry.group,
    entry.soHieuVanBan,
    entry.dieuKhoan,
    entry.yeuCau,
    // Phần văn xuôi cũng phải tìm được: nó là nơi chứa từ ngữ đời thường mà
    // người dùng thật sẽ gõ ("mất file", "ai ký duyệt"), trong khi tiêu đề và
    // trích dẫn pháp lý dùng ngôn ngữ văn bản.
    ...(entry.dienGiai ?? []),
    ...entry.keywords,
  ];
  return haystacks.some((f) => normalizeForSearch(f).includes(normQ));
}

/** Thứ tự nhóm văn bản pháp lý — giữ đúng thứ tự sổ đăng ký tuân thủ cũ. */
export const LEGAL_GROUP_ORDER: string[] = [
  // CẢNH BÁO khi sửa: chuỗi nhãn nhóm dưới đây phải TRÙNG KHỚP TUYỆT ĐỐI với
  // các hằng LEGAL_GROUP_1/2/3 và với giá trị `group` gõ thẳng trong entry.
  // `groupOrderIndex()` (HelpPage.tsx) so khớp bằng indexOf trên chuỗi — sửa
  // một nơi mà quên nơi kia thì nhóm đó lặng lẽ rơi xuống cuối trang, không
  // có lỗi biên dịch nào báo. Sửa nhãn nào thì grep nguyên chuỗi cũ trước.
  'Luật Dữ liệu 60/2024/QH15 + Nghị định 165/2025/NĐ-CP + Nghị định 278/2025/NĐ-CP',
  'Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 + Nghị định 356/2025/NĐ-CP',
  'Luật Di sản văn hóa 45/2024/QH15 + Nghị định 308/2025/NĐ-CP',
  'Luật Giao dịch điện tử 20/2023/QH15 + Nghị định 137/2024/NĐ-CP',
  'Luật An ninh mạng 116/2025/QH15 (hiệu lực 01/7/2026)',
];

// ---------------------------------------------------------------------------
// Nhóm PHÁP LÝ — mỗi entry ứng với đúng một dòng trong sổ đăng ký tuân thủ cũ,
// gộp thêm nội dung vận hành từ tab chuyên đề tương ứng của trang cũ (không
// thêm căn cứ pháp lý mới — chỉ diễn giải lại nội dung đã có).
// ---------------------------------------------------------------------------

// Nhãn nhóm nêu ĐỦ ba văn bản mà các mục bên trong viện dẫn: Luật Dữ liệu
// 60/2024/QH15 (mục pl-chuan-ky-thuat), Nghị định 165/2025/NĐ-CP (3 mục) và
// Nghị định 278/2025/NĐ-CP (pl-kiem-toan-doi-chieu Điều 13–14, pl-ket-noi-truc
// -quoc-gia Điều 24). Trước đây nhãn bỏ sót NĐ 278/2025 nên hai mục đó hiển thị
// dưới tiêu đề mang tên nghị định KHÁC với nghị định chúng trích — lỗi trình bày
// trích dẫn, trái tinh thần ADR-0014. Cách gọi tên khung ba văn bản này lấy
// nguyên theo docs/00-ke-hoach-nang-cap.md:11; NĐ 278/2025 đã xác minh tại
// docs/thuat-ngu.md:127. KHÔNG thêm căn cứ pháp lý mới, chỉ sửa nhãn cho khớp.
const LEGAL_GROUP_1 = 'Luật Dữ liệu 60/2024/QH15 + Nghị định 165/2025/NĐ-CP + Nghị định 278/2025/NĐ-CP';

export const LEGAL_ENTRIES: HelpEntry[] = [
  {
    id: 'pl-metadata-qc',
    dienGiai: [
      'Metadata sai thì tài sản số coi như mất: tệp vẫn nằm trên đĩa nhưng không ai tìm ra nó, và không ai chứng minh được nó là hiện vật nào. Với kho di sản, đây là rủi ro lớn hơn hỏng tệp — hỏng tệp thì phát hiện được ngay bằng kiểm tra toàn vẹn, còn mô tả sai thì âm thầm tồn tại cho tới lúc có người cần dùng đúng bản ghi đó.',
      'Kiểm soát chất lượng phải xảy ra TRƯỚC khi công bố, vì sau khi công bố thì bản ghi đã đi vào trích dẫn, liên kết ngoài và các bản sao lưu. Sửa về sau không thu hồi được những gì đã lan ra. Trong quy trình 9 bước của hệ thống, đây là lý do bước kiểm định chất lượng đứng trước bước phê duyệt chứ không đi sau.',
      'Điều phần mềm làm được là chặn cơ học: bắt buộc nhập trường thiết yếu, cảnh báo trường khuyết, và không cho chuyển trạng thái khi hồ sơ chưa đủ. Điều phần mềm không làm được là thẩm định NỘI DUNG — niên đại ghi đúng chưa, phiên âm Hán Nôm chuẩn chưa, hiện vật gán đúng công trình chưa. Phần đó là chuyên môn của cán bộ biên mục.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_1,
    title: 'Kiểm soát chất lượng metadata trước khi công bố',
    keywords: ['metadata', 'chat luong', 'QC', 'B.0', 'B.5', 'dublin core', 'duyet xuat ban'],
    soHieuVanBan: 'Luật Dữ liệu 60/2024/QH15 + NĐ 165/2025/NĐ-CP',
    dieuKhoan: 'Điều 12',
    yeuCau: 'Kiểm soát chất lượng metadata trước khi công bố.',
    heThongHoTro: [
      { label: 'Quy trình QC chuẩn DAM 6 bước B.0–B.5 (khởi tạo, mô tả cốt lõi, xác minh niên đại/nguồn gốc, rà soát dữ liệu cá nhân, thẩm định nội dung, duyệt xuất bản) gắn với từng bản ghi.', href: '/assets' },
      { label: 'Pipeline 9 trạng thái duyệt hiển thị tiến độ từng bước tại Chi tiết dữ liệu số hóa.' },
    ],
    donViTuLam: [
      'Định kỳ lấy mẫu ngẫu nhiên các bản ghi đã "Xuất bản", đối chiếu đã đi đủ 6 bước B.0–B.5 hay chưa, lập biên bản rà soát.',
      'Khi phát hiện bản ghi bỏ bước, dùng thao tác "Trả lại bổ sung" đưa về đúng bước còn thiếu — không chỉnh sửa tắt trạng thái.',
      'Cập nhật Quy chế quản lý dữ liệu số hóa khi quy trình B.0–B.5 thay đổi, không để hệ thống và văn bản lệch nhau.',
    ],
    trachNhiemXacNhan: 'Cán bộ chuyên trách nghiệp vụ số hóa (thực hiện rà soát); Giám đốc Trung tâm (phê duyệt kết luận rà soát).',
    evidenceIds: ['ev-quyche-01'],
  },
  {
    id: 'pl-danhmuc-mo',
    dienGiai: [
      'Công khai danh mục dữ liệu mở không chỉ là đưa tệp lên mạng. Nếu không kèm giấy phép sử dụng rõ ràng, người khai thác không biết được phép làm gì với dữ liệu: dùng cho nghiên cứu thì được, nhưng in thành sách bán có được không, đưa vào sản phẩm thương mại có được không, có phải ghi nguồn không. Thiếu giấy phép, phần lớn đơn vị nghiêm túc sẽ không dám dùng — nghĩa là công khai mà vẫn không ai khai thác được.',
      'Với di sản, chọn giấy phép còn là quyết định về quyền: ảnh chụp hiện vật, bản dập, bản scan 3D có thể phát sinh quyền của người thực hiện bên cạnh quyền của đơn vị quản lý hiện vật. Danh mục nên tách rõ nhóm nào mở hoàn toàn, nhóm nào mở có điều kiện, nhóm nào không mở.',
      'Hệ thống hỗ trợ lập và trình bày danh mục; việc quyết định tài sản nào được đưa vào danh mục mở và gắn giấy phép nào là quyết định quản lý, phải có người ký.',
    ],
    canBoSung: 'Danh mục giấy phép cụ thể áp dụng cho từng nhóm tài sản (mở hoàn toàn / mở có điều kiện / không mở) cần người phụ trách pháp chế và chủ sở hữu quyền xác định, không suy ra được từ phần mềm.',
    category: 'phap-ly',
    group: LEGAL_GROUP_1,
    title: 'Công khai danh mục dữ liệu mở kèm giấy phép sử dụng',
    keywords: ['du lieu mo', 'open data', 'giay phep', 'creative commons', 'CC BY', 'bo cong an'],
    soHieuVanBan: 'NĐ 165/2025/NĐ-CP',
    dieuKhoan: 'Điều 21 (Luật Dữ liệu) + NĐ 165 Điều 10',
    yeuCau: 'Công khai danh mục dữ liệu mở kèm giấy phép sử dụng.',
    heThongHoTro: [
      { label: 'Danh mục dữ liệu mở lưu tên bộ dữ liệu, giấy phép (CC BY / CC BY-NC), kênh công bố và trạng thái gửi Bộ Công an cho từng bộ dữ liệu.' },
    ],
    donViTuLam: [
      'Trước khi thêm một bộ dữ liệu vào danh mục mở: xác nhận đã gỡ/che các trường đánh dấu hạn chế công bố, chọn giấy phép CC phù hợp nội dung.',
      'Gửi danh mục cập nhật tới Bộ Công an theo quy định, ghi ngày gửi.',
      'Rà soát danh mục định kỳ, gỡ khỏi danh mục mở ngay khi phát sinh yêu cầu hạn chế công bố (ví dụ: yêu cầu rút lại đồng ý từ chủ thể dữ liệu).',
    ],
    trachNhiemXacNhan: 'Cán bộ quản trị dữ liệu (chuẩn bị danh mục); Giám đốc Trung tâm (phê duyệt trước khi công bố).',
    evidenceIds: ['ev-baocao-opendata'],
  },
  {
    id: 'pl-chuan-ky-thuat',
    dienGiai: [
      'Ba chuẩn nêu trong yêu cầu giải quyết ba việc khác nhau, không thay thế nhau. Dublin Core trả lời câu hỏi mô tả tối thiểu — tên gì, ai tạo, khi nào, định dạng gì — và là mẫu số chung để trao đổi dữ liệu với hệ thống khác. CIDOC-CRM mô tả QUAN HỆ giữa các thực thể: hiện vật này thuộc công trình nào, bản dập này lấy từ bia nào, tài liệu này nói về ai. OAIS là kiến trúc lưu trữ dài hạn, tách gói nộp vào, gói lưu trữ và gói phân phối thành ba thứ khác nhau.',
      'Lý do phải theo chuẩn thay vì tự nghĩ ra lược đồ riêng rất thực dụng: dữ liệu di sản có tuổi thọ dài hơn phần mềm quản lý nó. Hệ thống hôm nay rồi sẽ được thay, và khi đó dữ liệu phải chuyển sang được hệ mới mà không mất ngữ nghĩa. Lược đồ tự chế thì mọi thông tin về quan hệ và ngữ cảnh sẽ mất trong lần di trú đầu tiên.',
      'Áp dụng chuẩn cũng là điều kiện để liên thông: muốn dữ liệu Văn Miếu xuất hiện được trên cổng dữ liệu quốc gia hay các nền tảng di sản quốc tế thì phải nói cùng ngôn ngữ mô tả với họ.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_1,
    title: 'Áp dụng chuẩn kỹ thuật dữ liệu (Dublin Core, CIDOC-CRM, OAIS)',
    keywords: ['dublin core', 'cidoc-crm', 'oais', 'chuan ky thuat', 'sip', 'aip', 'dip'],
    soHieuVanBan: 'Luật Dữ liệu 60/2024/QH15',
    dieuKhoan: 'Điều 28',
    yeuCau: 'Áp dụng chuẩn kỹ thuật dữ liệu (Dublin Core, CIDOC-CRM, OAIS).',
    heThongHoTro: [
      { label: 'Biểu mẫu metadata chuẩn DAM B.0–B.5 dùng lõi Dublin Core cho mô tả thư mục.', href: '/upload' },
      { label: 'Kiến trúc lưu trữ theo OAIS (SIP/AIP/DIP) tại Sao lưu & khôi phục.', href: '/backup' },
    ],
    donViTuLam: [
      'Kiểm tra định kỳ biểu mẫu nhập liệu vẫn khớp cấu trúc Dublin Core/CIDOC-CRM đã ban hành trong quy chế.',
      'Khi bổ sung trường metadata mới, đối chiếu với chuẩn kỹ thuật trước khi đưa vào biểu mẫu chính thức.',
    ],
    trachNhiemXacNhan: 'Cán bộ chuyên trách nghiệp vụ bảo tàng (chuẩn mô tả); cán bộ kỹ thuật số hóa (chuẩn lưu trữ OAIS).',
    evidenceIds: ['ev-quyche-01'],
  },
  {
    id: 'pl-danhgia-rui-ro',
    dienGiai: [
      'Đánh giá rủi ro hằng năm khác với xử lý sự cố. Xử lý sự cố là phản ứng sau khi hỏng; đánh giá rủi ro là ngồi lại định kỳ để hỏi những chuyện chưa xảy ra: nếu ổ lưu trữ chính hỏng thì mất bao nhiêu, nếu người giữ khóa nghỉ việc thì ai mở được dữ liệu, nếu định dạng đang dùng không còn phần mềm đọc thì làm gì.',
      'Với kho số hóa di sản, ba nhóm rủi ro thường bị bỏ sót: định dạng lỗi thời (nhất là các định dạng 3D và splat còn mới, chưa ổn định), phụ thuộc một nhà cung cấp duy nhất, và mất tri thức vận hành khi nhân sự thay đổi mà quy trình chỉ nằm trong đầu người cũ.',
      'Kết quả đánh giá phải ra được danh sách việc làm có người chịu trách nhiệm và thời hạn, nếu không thì nó chỉ là một biên bản để trong tủ.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_1,
    title: 'Thực hiện đánh giá rủi ro dữ liệu hằng năm',
    keywords: ['danh gia rui ro', 'risk assessment', 'hang nam', 'bien phap'],
    soHieuVanBan: 'NĐ 165/2025/NĐ-CP',
    dieuKhoan: 'Điều 15, Điều 17',
    yeuCau: 'Thực hiện đánh giá rủi ro dữ liệu hằng năm.',
    heThongHoTro: [
      { label: 'Bảng đánh giá rủi ro dữ liệu hằng năm lưu kỳ đánh giá, loại rủi ro, biện pháp, người ký và ngày ký cho từng kỳ.' },
    ],
    donViTuLam: [
      'Tổ chức đánh giá rủi ro dữ liệu ít nhất 1 lần/năm, lập biên bản nêu rõ loại rủi ro và biện pháp giảm thiểu.',
      'Trình người có thẩm quyền ký xác nhận, lưu hồ sơ.',
      'Theo dõi việc triển khai biện pháp đã cam kết ở kỳ trước — không chỉ ghi nhận rồi bỏ qua.',
    ],
    trachNhiemXacNhan: 'Cán bộ chuyên trách an toàn thông tin (chủ trì đánh giá); Giám đốc Trung tâm (ký phê duyệt).',
  },
  {
    id: 'pl-vong-doi-luu-tru',
    dienGiai: [
      'Chính sách vòng đời trả lời một câu hỏi mà mọi kho dữ liệu sớm muộn phải trả lời: cái gì giữ vĩnh viễn, cái gì giữ có thời hạn, và hết hạn thì xử lý ra sao. Không có chính sách thì mặc định thành giữ tất cả mãi mãi — nghe thì an toàn nhưng thực tế là chi phí lưu trữ tăng không kiểm soát, và khối dữ liệu rác lẫn vào làm việc tìm kiếm và kiểm kê ngày càng khó.',
      'Với dữ liệu số hóa di sản, cần tách ít nhất ba loại có vòng đời khác nhau. Bản gốc và bản bảo quản thì giữ vĩnh viễn, không được xóa. Bản dẫn xuất phục vụ web có thể sinh lại từ bản gốc nên không cần giữ mãi. Dữ liệu thô trung gian (ảnh nguồn photogrammetry, tệp dự án) thì phải cân nhắc: nó rất nặng, nhưng với gaussian splat lại là nguyên liệu duy nhất để dựng lại nếu định dạng hiện tại không còn đọc được.',
      'Chính sách này phải được BAN HÀNH thành văn bản của đơn vị, không phải cấu hình trong phần mềm. Phần mềm chỉ thi hành, còn quyết định giữ gì bao lâu là trách nhiệm quản lý.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_1,
    title: 'Ban hành chính sách vòng đời & thời hạn lưu trữ theo loại dữ liệu số hóa',
    keywords: ['vong doi', 'thoi han luu tru', 'chinh sach luu tru', '3-2-1', 'fixity'],
    soHieuVanBan: 'NĐ 165/2025/NĐ-CP',
    dieuKhoan: 'Điều 5',
    yeuCau: 'Ban hành chính sách vòng đời & thời hạn lưu trữ theo loại dữ liệu số hóa.',
    heThongHoTro: [
      { label: 'Bảng thời hạn lưu theo từng loại đối tượng di sản (không gian di tích, kiến trúc, hiện vật, tư liệu văn bản, media nghe nhìn) gắn quy trình kỹ thuật tương ứng.', href: '/objects' },
      { label: 'Quy trình bảo quản & sao lưu 3-2-1, kiểm tra fixity định kỳ.', href: '/backup' },
    ],
    donViTuLam: [
      'Ban hành/rà soát chính sách vòng đời & thời hạn lưu trữ định kỳ 12 tháng/lần.',
      'Đối chiếu thời hạn lưu áp dụng thực tế trên từng loại dữ liệu với chính sách đã ban hành.',
      'Với dữ liệu media nghe nhìn (thời hạn lưu tối thiểu, không phải vĩnh viễn): lập kế hoạch rà soát gia hạn trước khi hết hạn.',
    ],
    trachNhiemXacNhan: 'Giám đốc Trung tâm (ban hành chính sách); cán bộ chuyên trách ATTT (thực hiện quy trình bảo quản & sao lưu).',
    evidenceIds: ['ev-quytrinh-backup', 'ev-bienban-drill'],
  },
  {
    id: 'pl-kiem-toan-doi-chieu',
    dienGiai: [
      'Ba tiêu chí đầy đủ, chính xác và kịp thời là ba lỗi khác nhau của cùng một đường kết nối. Đầy đủ là gửi thiếu bản ghi. Chính xác là gửi sai nội dung. Kịp thời là gửi đúng nhưng muộn. Một đường đồng bộ có thể chạy xanh mà vẫn sai cả ba, vì trạng thái kết nối chỉ nói ống dẫn còn thông, không nói dữ liệu bên trong có đúng không.',
      'Vì vậy kiểm toán phải là đối chiếu hai đầu: đếm và so nội dung ở nguồn với ở đích, chứ không phải đọc log của chính mình. Kỳ đối chiếu nên cố định và có biên bản, vì khi thanh tra hỏi thì thứ chứng minh được là biên bản có ngày tháng và người ký, không phải ảnh chụp màn hình một bảng trạng thái.',
      'Riêng tiêu chí kịp thời cần định nghĩa trước cửa sổ chấp nhận được — bao lâu là muộn. Không có ngưỡng thì không ai kết luận được là đạt hay không, và tiêu chí đó trở thành vô nghĩa.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_1,
    title: 'Kiểm toán, đối chiếu đầy đủ/chính xác/kịp thời dữ liệu kết nối',
    keywords: ['kiem toan', 'doi chieu', 'lgsp', 'ndxp', 'giam sat ket noi'],
    soHieuVanBan: 'NĐ 278/2025/NĐ-CP',
    dieuKhoan: 'Điều 13, Điều 14',
    yeuCau: 'Kiểm toán, đối chiếu đầy đủ/chính xác/kịp thời dữ liệu kết nối.',
    heThongHoTro: [
      { label: 'Trạng thái đối chiếu theo 3 tiêu chí (đầy đủ/chính xác/kịp thời) cho dữ liệu trao đổi qua LGSP/NDXP.', href: '/share' },
    ],
    donViTuLam: [
      'Thực hiện kiểm toán định kỳ đối chiếu dữ liệu trao đổi qua kết nối, lập báo cáo.',
      'Với tiêu chí "kịp thời": theo dõi cửa sổ đồng bộ, xử lý và ghi nhận nguyên nhân khi vượt cửa sổ khuyến nghị.',
      'Lưu báo cáo kiểm toán làm căn cứ khi có thanh tra/kiểm tra.',
    ],
    trachNhiemXacNhan: 'Cán bộ chuyên trách ATTT/quản trị hệ thống (thực hiện kiểm toán); Giám đốc Trung tâm (phê duyệt báo cáo).',
    evidenceIds: ['ev-baocao-audit'],
  },
  {
    id: 'pl-ket-noi-truc-quoc-gia',
    dienGiai: [
      'Đây là mốc thời gian cứng, khác về bản chất với các yêu cầu còn lại trong tài liệu này. Phần lớn yêu cầu khác là làm liên tục và làm tốt dần; mốc này thì đến ngày là đến, và tình trạng chỉ có hai khả năng là đã kết nối hoặc chưa.',
      'Hệ quả cho kế hoạch: công việc kết nối phải tính ngược từ hạn chứ không xếp vào phần việc làm khi rảnh. Kết nối liên thông thường không tốn nhiều công lập trình bằng công thủ tục — đăng ký, cấp chứng thư, kiểm thử với đầu mối kỹ thuật bên kia, khắc phục sai khác về mô hình dữ liệu. Phần thủ tục này phụ thuộc lịch của đơn vị khác nên không nén lại được bằng cách tăng người.',
      'Rủi ro thực tế lớn nhất là để đến gần hạn mới bắt đầu, rồi phát hiện mô hình dữ liệu hai bên lệch nhau và phải sửa cả phần đã làm xong.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_1,
    title: 'Hoàn thành kết nối trục dữ liệu quốc gia trước 31/12/2026',
    keywords: ['truc du lieu quoc gia', 'lgsp', 'ndxp', 'csdl di san', 'ket noi', 'han 31/12/2026'],
    // Mốc 31/12/2026 nằm ở Điều 24 (điều khoản chuyển tiếp) — Điều 13 của cùng
    // nghị định là GIÁM SÁT dữ liệu, không phải mốc hạn; đối chiếu docs/01 dòng
    // NĐ 278/2025 và docs/10 mục mốc pháp lý.
    soHieuVanBan: 'NĐ 278/2025/NĐ-CP',
    dieuKhoan: 'Điều 24',
    yeuCau: 'Hoàn thành kết nối, chia sẻ dữ liệu bắt buộc trước 31/12/2026 (điều khoản chuyển tiếp).',
    heThongHoTro: [
      { label: 'Trạng thái từng kết nối (LGSP Thành phố, NDXP, CSDL di sản Bộ VHTTDL) tại Kết nối & chia sẻ dữ liệu.', href: '/share' },
    ],
    donViTuLam: [
      'Theo dõi tiến độ ký kết kết nối còn thiếu (CSDL di sản Bộ VHTTDL), đôn đốc trước hạn 31/12/2026.',
      'Khi hoàn tất một kết nối, cập nhật trạng thái và lưu công văn xác nhận.',
      'Báo cáo tiến độ định kỳ cho cấp có thẩm quyền, không chờ tới sát hạn mới rà soát.',
    ],
    trachNhiemXacNhan: 'Cán bộ chuyên trách ATTT (theo dõi kỹ thuật); Giám đốc Trung tâm (đôn đốc, báo cáo cấp trên).',
    evidenceIds: ['ev-congvan-lgsp', 'ev-lienket-share'],
  },
];

// Nhóm 2 — Luật Bảo vệ dữ liệu cá nhân. Dùng `.push` (không mở lại literal array)
// để mỗi nhóm văn bản là một khối Edit độc lập, dễ đối chiếu khi rà soát diff.
const LEGAL_GROUP_2 = 'Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 + Nghị định 356/2025/NĐ-CP';

LEGAL_ENTRIES.push(
  {
    id: 'pl-dau-moi-bvdlcn',
    dienGiai: [
      'Yêu cầu này nhìn thì hành chính nhưng lại là điều kiện để mọi nghĩa vụ khác về dữ liệu cá nhân vận hành được. Khi có sự cố hoặc có người yêu cầu về dữ liệu của họ, việc đầu tiên cần là biết gửi cho ai. Không có đầu mối công khai thì yêu cầu rơi vào hộp thư chung, không ai nhận trách nhiệm, và đồng hồ đếm thời hạn vẫn chạy.',
      'Công khai ở đây có nghĩa là người ngoài đơn vị tìm được, không phải chỉ nội bộ biết. Thông tin đầu mối nên đặt ở nơi người dùng dịch vụ gặp tự nhiên, kèm cách liên hệ còn hiệu lực.',
      'Cần lưu ý phạm vi: kho số hóa di sản tưởng như không xử lý dữ liệu cá nhân, nhưng tài khoản người dùng hệ thống, nhật ký thao tác, thông tin người thực hiện số hóa và thông tin liên hệ trong các yêu cầu chia sẻ đều là dữ liệu cá nhân.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_2,
    title: 'Chỉ định bộ phận/nhân sự bảo vệ dữ liệu cá nhân, công khai đầu mối',
    keywords: ['dau moi', 'bao ve du lieu ca nhan', 'DPO', 'chi dinh can bo'],
    soHieuVanBan: 'Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15',
    dieuKhoan: 'Điều 33 khoản 2',
    yeuCau: 'Chỉ định bộ phận/nhân sự bảo vệ dữ liệu cá nhân, công khai đầu mối.',
    heThongHoTro: [
      { label: 'Hiện chưa có màn cấu hình riêng cho đầu mối bảo vệ dữ liệu cá nhân — Sở Văn hóa & Thể thao chưa có văn bản hướng dẫn mô hình tổ chức áp dụng.' },
    ],
    donViTuLam: [
      'Theo dõi văn bản hướng dẫn mô hình tổ chức từ Sở Văn hóa & Thể thao.',
      'Khi có hướng dẫn: ra quyết định chỉ định bộ phận/nhân sự phụ trách và công khai đầu mối (tên, điện thoại, email) tới cán bộ, viên chức và người dân.',
    ],
    trachNhiemXacNhan: 'Giám đốc Trung tâm (ra quyết định chỉ định khi có văn bản hướng dẫn).',
    note: 'Mục này đang ở trạng thái chờ văn bản hướng dẫn — chưa có cơ sở để chỉ định, không phải "chưa làm".',
  },
  {
    id: 'pl-dpia',
    dienGiai: [
      'Hồ sơ đánh giá tác động là bản mô tả trung thực: đơn vị đang xử lý dữ liệu cá nhân nào, để làm gì, lưu ở đâu, ai truy cập được, giữ bao lâu, và rủi ro với người có dữ liệu là gì. Giá trị thật của nó không nằm ở tờ giấy nộp, mà ở chỗ làm xong thì đơn vị mới biết chính xác mình đang giữ những gì — phần lớn tổ chức đều đánh giá thấp con số này.',
      'Thời hạn tính từ khi bắt đầu xử lý, nghĩa là không chờ hệ thống chạy ổn định rồi mới làm. Với dự án số hóa, mốc bắt đầu thường sớm hơn ta tưởng: ngay khi tạo tài khoản người dùng đầu tiên và bật ghi nhật ký thao tác thì đã là xử lý dữ liệu cá nhân.',
      'Hồ sơ này phải cập nhật khi phạm vi xử lý thay đổi — thêm loại dữ liệu mới, thêm bên thứ ba được truy cập, hoặc mở kết nối chia sẻ mới. Đây là tài liệu sống, không phải làm một lần.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_2,
    title: 'Lập hồ sơ đánh giá tác động (DPIA) trong 60 ngày kể từ khi xử lý dữ liệu cá nhân',
    keywords: ['DPIA', 'danh gia tac dong', '60 ngay', 'mau so 10', 'du lieu ca nhan'],
    soHieuVanBan: 'Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 + NĐ 356/2025/NĐ-CP (Mẫu số 10)',
    dieuKhoan: 'Điều 21',
    yeuCau: 'Lập hồ sơ đánh giá tác động (DPIA) trong 60 ngày kể từ khi xử lý dữ liệu cá nhân.',
    heThongHoTro: [
      { label: 'Bảng theo dõi DPIA với đồng hồ đếm hạn 60 ngày cho từng nội dung xử lý dữ liệu cá nhân (ngày bắt đầu, hạn hoàn thành, số ngày còn lại, trạng thái).' },
    ],
    donViTuLam: [
      'Khi phát sinh xử lý dữ liệu cá nhân mới (ví dụ: số hóa gia phả, sắc phong có tên người còn sống), lập hồ sơ DPIA theo Mẫu số 10 trong 60 ngày.',
      'Với hồ sơ "Quá hạn" trên bảng theo dõi, xử lý ngay và ghi rõ lý do chậm.',
      'Lưu hồ sơ DPIA đã hoàn thành làm căn cứ khi có yêu cầu thanh tra.',
    ],
    trachNhiemXacNhan: 'Cán bộ bảo vệ dữ liệu cá nhân khi đã được chỉ định (Điều 33 khoản 2) — trước mắt do cán bộ chuyên trách ATTT kiêm nhiệm; Giám đốc Trung tâm phê duyệt hồ sơ.',
    evidenceIds: ['ev-baocao-dpia'],
  },
  {
    id: 'pl-su-co-72h',
    dienGiai: [
      'Bảy mươi hai giờ là khoảng thời gian rất ngắn nếu chưa chuẩn bị trước, vì đồng hồ bắt đầu chạy từ lúc PHÁT HIỆN chứ không phải từ lúc điều tra xong. Trên thực tế phần lớn thời gian bị tiêu vào việc xác định phạm vi: dữ liệu nào bị lộ, của bao nhiêu người, từ lúc nào. Nếu nhật ký không đủ chi tiết hoặc bị ghi đè, câu hỏi này không trả lời được và thông báo sẽ trễ hạn dù đội ngũ làm việc liên tục.',
      'Vì vậy chuẩn bị thật cho yêu cầu này là chuẩn bị TRƯỚC sự cố: nhật ký giữ đủ lâu và không sửa được, có mẫu thông báo soạn sẵn, có danh sách người phải huy động, và đã diễn tập ít nhất một lần. Đợi đến khi có sự cố mới soạn quy trình là muộn.',
      'Yêu cầu lưu hồ sơ tối thiểu 5 năm có nghĩa là hồ sơ sự cố phải nằm ngoài chu kỳ dọn dẹp thông thường của hệ thống — cần kiểm tra chính sách xóa nhật ký để không vô tình xóa mất bằng chứng.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_2,
    title: 'Thông báo sự cố/vi phạm dữ liệu cá nhân trong 72 giờ; lưu hồ sơ tối thiểu 5 năm',
    keywords: ['su co', 'vi pham du lieu', '72 gio', 'A05', 'bo cong an', 'luu ho so 5 nam'],
    soHieuVanBan: 'Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15',
    dieuKhoan: 'Điều 23',
    yeuCau: 'Thông báo sự cố/vi phạm dữ liệu cá nhân trong 72 giờ (A05); lưu hồ sơ tối thiểu 5 năm.',
    heThongHoTro: [
      { label: 'Bảng sự cố & vi phạm dữ liệu với đồng hồ 72 giờ tính từ lúc phát hiện, và mốc lưu hồ sơ tối thiểu 5 năm.' },
    ],
    donViTuLam: [
      'Ghi nhận chính xác thời điểm PHÁT HIỆN sự cố (mốc bắt đầu tính 72 giờ) — không lấy thời điểm sự cố xảy ra nếu phát hiện muộn hơn.',
      'Thông báo Bộ Công an (A05) trong hạn, kèm hồ sơ mô tả sự cố.',
      'Lưu hồ sơ vi phạm tối thiểu 5 năm kể từ ngày khắc phục xong, không xóa sớm.',
    ],
    trachNhiemXacNhan: 'Cán bộ chuyên trách ATTT (đầu mối thông báo A05); Giám đốc Trung tâm được báo cáo song song.',
    evidenceIds: ['ev-quytrinh-72h'],
  },
  {
    id: 'pl-yeu-cau-chu-the',
    dienGiai: [
      'Hai mốc thời gian trong yêu cầu này phục vụ hai việc khác nhau. Hai ngày làm việc là để PHẢN HỒI — xác nhận đã nhận được yêu cầu và cho biết sẽ xử lý thế nào; đây là việc hành chính, không cần điều tra. Mười đến hai mươi ngày là để THỰC HIỆN, tùy loại yêu cầu.',
      'Nhầm lẫn phổ biến là gộp hai mốc làm một, để yêu cầu nằm im chờ xử lý xong mới trả lời. Cách đó vi phạm mốc thứ nhất ngay cả khi mốc thứ hai vẫn kịp.',
      'Về vận hành, cần một sổ theo dõi ghi ngày nhận, loại yêu cầu, hạn phản hồi, hạn thực hiện và trạng thái. Không có sổ thì không chứng minh được là đã đúng hạn, mà nghĩa vụ chứng minh thuộc về đơn vị chứ không thuộc về người yêu cầu.',
    ],
    canBoSung: 'Bảng phân loại chi tiết loại yêu cầu nào ứng với thời hạn 10 ngày, loại nào 20 ngày, cần người phụ trách pháp chế đối chiếu văn bản và xác nhận trước khi dùng làm căn cứ vận hành.',
    category: 'phap-ly',
    group: LEGAL_GROUP_2,
    title: 'Phản hồi yêu cầu chủ thể dữ liệu trong 2 ngày làm việc; thực hiện trong 10–20 ngày tùy loại',
    keywords: ['chu the du lieu', 'yeu cau xem sua xoa', '2 ngay', '10 20 ngay', 'rut lai dong y'],
    soHieuVanBan: 'NĐ 356/2025/NĐ-CP',
    dieuKhoan: '—',
    yeuCau: 'Phản hồi yêu cầu chủ thể dữ liệu trong 2 ngày làm việc; thực hiện trong 10–20 ngày tùy loại yêu cầu.',
    heThongHoTro: [
      { label: 'Bảng yêu cầu chủ thể dữ liệu với đồng hồ hạn phản hồi (2 ngày làm việc) và hạn thực hiện (10–20 ngày theo loại yêu cầu: xem/sửa/xóa/rút đồng ý).' },
    ],
    donViTuLam: [
      'Bộ phận Biên tập (đầu mối tiếp nhận theo quy chế) ghi nhận ngày nhận yêu cầu ngay khi tiếp nhận.',
      'Phản hồi người yêu cầu trong 2 ngày làm việc, kể cả khi chưa xử lý xong.',
      'Hoàn tất xử lý trong hạn theo loại yêu cầu; với yêu cầu "Xóa dữ liệu", đối chiếu quy định lưu trữ bắt buộc trước khi xóa.',
    ],
    trachNhiemXacNhan: 'Cán bộ nghiệp vụ bảo tàng / bộ phận Biên tập (đầu mối tiếp nhận); cán bộ bảo vệ dữ liệu cá nhân xác nhận kết quả xử lý.',
    evidenceIds: ['ev-quyche-01', 'ev-anhcauhinh'],
  },
);

// Nhóm 3 — Luật Di sản văn hóa.
const LEGAL_GROUP_3 = 'Luật Di sản văn hóa 45/2024/QH15 + Nghị định 308/2025/NĐ-CP';

LEGAL_ENTRIES.push(
  {
    id: 'pl-chuyen-dang-so-disan',
    dienGiai: [
      'Ba động từ trong yêu cầu là ba nghĩa vụ nối tiếp nhau, không phải một. Chuyển dạng số là làm ra bản số. Cập nhật là giữ cho bản số phản ánh đúng hiện trạng khi hiện vật hoặc hồ sơ thay đổi. Sao lưu là bảo đảm bản số không mất. Làm xong việc thứ nhất mà bỏ hai việc sau là tình trạng phổ biến nhất: kho số hóa xong rồi đóng băng, vài năm sau lệch hẳn với hồ sơ giấy.',
      'Nghĩa vụ cập nhật có hệ quả trực tiếp lên cách tổ chức dữ liệu: phải phân biệt được bản số hóa lần đầu với các lần số hóa lại, và phải biết bản nào đang là bản hiện hành. Nếu mô hình dữ liệu không có khái niệm phiên bản thì mỗi lần cập nhật là một lần ghi đè, và lịch sử biến đổi của hiện vật biến mất.',
      'Với di sản tư liệu Hán Nôm, cập nhật còn bao gồm cả phần diễn giải: phiên âm và dịch nghĩa có thể được hiệu đính về sau khi có nghiên cứu mới, và bản ghi cần giữ được cả hai phiên bản cùng lý do thay đổi.',
    ],
    category: 'phap-ly',
    group: LEGAL_GROUP_3,
    title: 'Chuyển dạng số, cập nhật, sao lưu di sản tư liệu trên CSDL quốc gia về di sản văn hóa',
    keywords: ['csdl quoc gia', 'di san van hoa', 'chuyen dang so', 'bo vhttdl'],
    soHieuVanBan: 'Luật Di sản văn hóa 45/2024/QH15',
    dieuKhoan: 'Điều 57 khoản 1đ',
    yeuCau: 'Chuyển dạng số, cập nhật, sao lưu di sản tư liệu trên CSDL quốc gia về di sản văn hóa.',
    heThongHoTro: [
      { label: 'Dữ liệu số hóa nội bộ đã sẵn sàng chuyển dạng (mô hình 3D, Gaussian splat, tư liệu Hán Nôm, ảnh tư liệu…).', href: '/assets' },
      { label: 'Trạng thái kết nối tới CSDL quốc gia về di sản văn hóa (Bộ VHTTDL).', href: '/share' },
    ],
    donViTuLam: [
      'Theo dõi tiến độ ký kết kết nối CSDL quốc gia về di sản văn hóa với Bộ VHTTDL, đôn đốc khi cần.',
      'Khi kết nối sẵn sàng, lập kế hoạch đẩy dữ liệu đã số hóa lên CSDL quốc gia theo đúng cấu trúc yêu cầu.',
    ],
    trachNhiemXacNhan: 'Cán bộ nghiệp vụ bảo tàng (chuẩn bị dữ liệu); Giám đốc Trung tâm (đôn đốc kết nối với Bộ VHTTDL).',
  },
  {
    id: 'pl-xin-y-kien-bo-vhttdl',
    dienGiai: [
      'Đây là bước thủ tục dễ bị bỏ sót nhất trong cả quy trình, vì nó không nằm trong phần mềm và không ai nhắc. Nhưng hệ quả của việc bỏ sót thì nặng: bản chuyển đổi làm ra có thể không được công nhận giá trị pháp lý, và toàn bộ công sức số hóa phần đó phải làm lại đúng trình tự.',
      'Điểm cần chú ý là phạm vi áp dụng gắn với cấp độ xếp hạng của đối tượng, nên việc đầu tiên phải làm là xác định rõ hiện vật hoặc di tích đang xử lý thuộc nhóm nào. Với Văn Miếu, nhóm bia Tiến sĩ cần được rà riêng vì đây là nhóm hiện vật có vị thế đặc biệt.',
      'Về mặt kế hoạch, thời gian chờ ý kiến bằng văn bản phải được tính vào tiến độ ngay từ đầu, không phải chèn vào lúc sắp công bố.',
    ],
    canBoSung: 'Danh sách cụ thể hiện vật và hạng mục nào tại Văn Miếu thuộc diện phải xin ý kiến, cùng đầu mối và trình tự gửi văn bản, cần người phụ trách pháp chế phối hợp cơ quan quản lý xác định.',
    category: 'phap-ly',
    group: LEGAL_GROUP_3,
    title: 'Xin ý kiến bằng văn bản của Bộ VHTTDL khi chuyển đổi số di tích quốc gia đặc biệt/bảo vật quốc gia',
    keywords: ['xin y kien', 'bo vhttdl', 'di tich quoc gia dac biet', 'bao vat quoc gia', '82 bia tien si'],
    // Điều 87 thuộc NĐ 308/2025 (chương Chuyển đổi số), KHÔNG phải Điều 87 của
    // Luật DSVH — hai văn bản đều có "Điều 87" nên rất dễ gán nhầm; đã đối chiếu
    // docs/01 mục căn cứ pháp lý và ADR-0011.
    soHieuVanBan: 'Nghị định 308/2025/NĐ-CP',
    dieuKhoan: 'Điều 87',
    yeuCau: 'Xin ý kiến bằng văn bản của Bộ VHTTDL khi chuyển đổi văn bản giấy sang thông điệp dữ liệu đối với di tích quốc gia đặc biệt/bảo vật quốc gia.',
    heThongHoTro: [
      { label: 'Bước "Xin ý kiến Bộ VHTTDL" gắn trong quy trình duyệt & xuất bản 9 bước — áp dụng khi đối tượng thuộc di tích quốc gia đặc biệt/bảo vật quốc gia (ví dụ: 82 bia Tiến sĩ).', href: '/assets' },
    ],
    donViTuLam: [
      'Khi tiếp nhận hồ sơ số hóa liên quan di tích quốc gia đặc biệt/bảo vật quốc gia, kiểm tra đã có văn bản xin ý kiến Bộ VHTTDL trước bước xuất bản.',
      'Lưu văn bản phản hồi của Bộ VHTTDL kèm hồ sơ, không xuất bản khi chưa có phản hồi.',
    ],
    trachNhiemXacNhan: 'Cán bộ nghiệp vụ bảo tàng (chuẩn bị hồ sơ xin ý kiến); Giám đốc Trung tâm (ký văn bản gửi Bộ VHTTDL).',
    evidenceIds: ['ev-trichnhatky'],
  },
);

// Nhóm 4 — Luật Giao dịch điện tử.
LEGAL_ENTRIES.push({
  id: 'pl-ky-so-giao-dich-dt',
  dienGiai: [
    'Ký số ở đây không nhằm bảo mật mà nhằm chứng minh: chữ ký số gắn bản chuyển đổi với một chủ thể chịu trách nhiệm và một thời điểm, đồng thời cho phép phát hiện nếu tệp bị sửa sau khi ký. Đó là thứ biến một tệp bất kỳ thành bản có giá trị viện dẫn được.',
    'Yêu cầu nói tới cả hạ tầng lẫn quy trình, và trong thực tế phần quy trình mới là chỗ hay hỏng. Hạ tầng thì mua và cài được; quy trình thì phải trả lời những câu như ai được ký, ký ở bước nào của luồng duyệt, khóa ký lưu ở đâu, làm gì khi người có thẩm quyền vắng mặt, và xử lý ra sao khi cần thu hồi một bản đã ký.',
    'Cần lưu ý thời hạn hiệu lực của chứng thư số: bản ký hôm nay vẫn phải kiểm tra được sau nhiều năm, nên phải tính trước cách lưu bằng chứng thời điểm ký.',
  ],
  category: 'phap-ly',
  group: 'Luật Giao dịch điện tử 20/2023/QH15 + Nghị định 137/2024/NĐ-CP',
  title: 'Bảo đảm hạ tầng và quy trình ký số cho bản chuyển đổi khi công bố chính thức',
  keywords: ['ky so', 'chu ky dien tu', 'ban chuyen doi', 'chung thu so'],
  soHieuVanBan: 'Luật Giao dịch điện tử 20/2023/QH15 + NĐ 137/2024/NĐ-CP',
  dieuKhoan: 'Điều 12–13 (Luật) + NĐ 137 Chương II',
  yeuCau: 'Bảo đảm hạ tầng và quy trình ký số cho bản chuyển đổi khi công bố chính thức.',
  heThongHoTro: [
    { label: 'Badge ký số hiển thị khi dữ liệu số hóa được xuất bản chính thức, tại Chi tiết dữ liệu số hóa.', href: '/assets' },
  ],
  donViTuLam: [
    'Kiểm tra hạ tầng ký số (chứng thư số, thiết bị ký…) còn hiệu lực trước mỗi đợt xuất bản lớn.',
    'Đối chiếu ngẫu nhiên một số bản ghi đã xuất bản để xác nhận badge ký số hiển thị đúng và khớp hồ sơ chữ ký.',
  ],
  trachNhiemXacNhan: 'Cán bộ kỹ thuật số hóa (vận hành hạ tầng ký số); cán bộ chuyên trách ATTT xác nhận định kỳ.',
});

// Nhóm 5 — Luật An ninh mạng. Gộp nội dung "Hồ sơ cấp độ ATTT" (tab riêng ở
// trang cũ) vào đúng mục này vì cùng một căn cứ pháp lý. Trang cũ để trạng
// thái dòng sổ đăng ký này là "Chưa đối chiếu" vì SỐ ĐIỀU áp dụng chưa xác
// minh — giữ nguyên sự thận trọng đó ở `note`, không nâng thành "đã xong".
LEGAL_ENTRIES.push({
  id: 'pl-cap-do-attt',
  dienGiai: [
    'Xác định cấp độ an toàn thông tin là bước đứng trước mọi biện pháp kỹ thuật khác, vì cấp độ quyết định mức yêu cầu phải đáp ứng. Làm ngược lại — mua thiết bị và dựng biện pháp trước rồi mới xác định cấp độ — thường dẫn tới vừa thừa ở chỗ không cần vừa thiếu ở chỗ bắt buộc.',
    'Với hệ thống quản lý dữ liệu di sản, các yếu tố thường đẩy cấp độ lên là quy mô dữ liệu không tái tạo được, kết nối ra hệ thống bên ngoài, và việc có xử lý dữ liệu cá nhân. Cần đánh giá trên hệ thống thật sẽ vận hành, không đánh giá trên bản trình diễn.',
    'Phương án bảo đảm phải được PHÊ DUYỆT, nghĩa là có người ký chịu trách nhiệm, và phải được rà soát lại khi hệ thống thay đổi đáng kể — thêm kết nối mới, mở rộng phạm vi dữ liệu, hoặc đổi mô hình triển khai.',
  ],
  canBoSung: 'Số điều khoản áp dụng cụ thể của Luật An ninh mạng 116/2025/QH15 cho trường hợp này hiện chưa được xác minh (xem trường điều khoản đang để trống có chú thích). Người phụ trách pháp chế cần đối chiếu văn bản gốc và điền chính xác trước khi dùng làm căn cứ trong hồ sơ.',
  category: 'phap-ly',
  group: 'Luật An ninh mạng 116/2025/QH15 (hiệu lực 01/7/2026)',
  title: 'Xác định cấp độ an toàn thông tin, phê duyệt phương án bảo đảm',
  keywords: ['an toan thong tin', 'cap do ATTT', 'TCVN 11930', 'phuong an bao dam', 'phan vung mang'],
  soHieuVanBan: 'Luật An ninh mạng 116/2025/QH15',
  dieuKhoan: '— (số điều áp dụng chưa xác minh)',
  yeuCau: 'Xác định cấp độ an toàn thông tin, phê duyệt phương án bảo đảm (theo TCVN 11930:2017).',
  heThongHoTro: [
    { label: 'Hồ sơ cấp độ ATTT lưu cấp độ đề xuất, ngày phê duyệt phương án và ngày rà soát lại — dữ liệu mẫu cho bản trình diễn.' },
    { label: 'Phân vùng mạng nội bộ/DMZ, kiểm soát truy cập RBAC/ABAC.', href: '/users' },
    { label: 'Sao lưu 3-2-1, kiểm tra fixity định kỳ.', href: '/backup' },
    { label: 'Nhật ký bất biến hash-chain.', href: '/logs' },
  ],
  donViTuLam: [
    'Rà soát và xác minh chính xác điều khoản áp dụng của Luật An ninh mạng 116/2025/QH15 (hiệu lực 01/7/2026) liên quan xác định cấp độ ATTT — chưa xác minh nên chưa đối chiếu được đầy đủ.',
    'Lập/rà soát hồ sơ cấp độ an toàn hệ thống thông tin theo TCVN 11930:2017, trình cấp có thẩm quyền phê duyệt phương án bảo đảm.',
    'Rà soát lại hồ sơ cấp độ định kỳ (tối thiểu 12 tháng/lần) hoặc khi hệ thống có thay đổi lớn.',
    'Áp dụng thời hạn lưu nhật ký hệ thống theo đúng cấp độ đã phê duyệt (TCVN 11930:2017: cấp độ càng cao, thời hạn lưu tối thiểu càng dài) — không áp một con số cố định chung cho mọi hệ thống.',
    'Tổ chức diễn tập ứng phó sự cố định kỳ hằng năm.',
  ],
  trachNhiemXacNhan: 'Cán bộ chuyên trách an toàn thông tin (lập hồ sơ cấp độ); Giám đốc Trung tâm (phê duyệt phương án bảo đảm).',
  note: 'Số điều áp dụng của Luật An ninh mạng 116/2025/QH15 cho mục này chưa được xác minh — cần đối chiếu văn bản chính thức khi luật có hiệu lực (01/7/2026).',
});

// ---------------------------------------------------------------------------
// Nhóm HƯỚNG DẪN SỬ DỤNG — how-to ngắn cho các màn chính, không phải trích
// dẫn pháp lý nên không chịu ràng buộc "nguyên văn" của ADR-0014.
// ---------------------------------------------------------------------------

export const HOWTO_ENTRIES: HelpEntry[] = [
  {
    id: 'hd-nhap-du-lieu',
    dienGiai: [
      'Nhập dữ liệu là điểm mà chất lượng của cả kho được quyết định. Mọi lỗi bỏ qua ở bước này sẽ nhân lên theo thời gian: một quy ước đặt mã sai hôm nay sẽ kéo theo hàng trăm bản ghi sai trong vài tháng, và sửa về sau tốn gấp nhiều lần so với làm đúng ngay từ đầu.',
      'Hai đường nhập phục vụ hai tình huống khác nhau. Tải lên đơn lẻ hợp với bản ghi cần chăm chút từng trường, thường là hiện vật quan trọng hoặc tư liệu cần biên mục kỹ. Nhập theo lô kèm bảng mô tả hợp với khối lượng lớn cùng loại, ví dụ một đợt scan nhiều hiện vật cùng nhóm — nhưng bù lại phải chuẩn bị bảng mô tả cẩn thận, vì sai một cột là sai cả lô.',
      'Nguyên tắc quan trọng nhất về trường khuyết: không bỏ trống tùy tiện mà phải chọn đúng mã khuyết giá trị. Lý do là chưa nhập, không áp dụng và đã mất là ba tình huống khác nhau, và gộp chung thành ô trống thì về sau không phân biệt được đâu là việc còn phải làm, đâu là việc vốn không cần làm.',
    ],
    category: 'huong-dan',
    group: 'Nhập dữ liệu',
    title: 'Nhập dữ liệu số hóa (tải lên đơn lẻ hoặc theo lô)',
    keywords: ['nhap du lieu', 'upload', 'tai len', 'theo lo', 'excel'],
    relatedRoute: '/upload',
    steps: [
      'Vào "Nhập dữ liệu", chọn loại đối tượng di sản (không gian di tích, kiến trúc, hiện vật, tư liệu văn bản, media nghe nhìn) — biểu mẫu metadata sẽ đổi theo đúng loại.',
      'Điền metadata theo biểu mẫu chuẩn DAM (lõi Dublin Core); trường chưa xác định phải chọn đúng mã khuyết giá trị, không bỏ trống tùy tiện.',
      'Với dữ liệu đơn lẻ: kéo-thả hoặc chọn tệp trực tiếp. Với dữ liệu theo lô: tải nhiều tệp kèm bảng Excel mô tả, xem trước trước khi xác nhận.',
      'Theo dõi hàng đợi xử lý — mỗi tệp sau khi nhận sẽ vào bước "Chờ xử lý" của quy trình 9 bước.',
    ],
  },
];

HOWTO_ENTRIES.push(
  {
    id: 'hd-quy-trinh-9-buoc',
    dienGiai: [
      'Chín bước không phải để làm cho quy trình dài ra, mà để tách bạch trách nhiệm. Mỗi lần chuyển bước là một lần đổi người chịu trách nhiệm, và đó chính là thứ giúp truy được về sau: khi một bản ghi bị phát hiện sai, câu hỏi không phải ai làm hỏng mà là sai lọt qua bước nào.',
      'Hai bước hay bị gộp nhầm là kiểm định chất lượng và thẩm định nội dung. Kiểm định chất lượng là việc kỹ thuật — tệp có đọc được không, độ phân giải có đạt không, siêu dữ liệu có đủ trường bắt buộc không. Thẩm định nội dung là việc chuyên môn di sản — thông tin ghi có đúng không. Người làm hai việc này thường không phải một, và gộp lại thì mất lớp kiểm tra chuyên môn.',
      'Nhánh cần số hóa lại nằm ngoài chuỗi tuần tự là có chủ đích: một bản ghi trượt kiểm định không đi tiếp mà quay lại xử lý, và lần quay lại đó phải để lại dấu vết chứ không im lặng làm lại từ đầu.',
    ],
    category: 'huong-dan',
    group: 'Quy trình duyệt & xuất bản',
    title: 'Quy trình duyệt & xuất bản 9 bước',
    keywords: ['quy trinh 9 buoc', 'duyet', 'xuat ban', 'kiem dinh chat luong', 'QC', 'tham dinh noi dung'],
    relatedRoute: '/assets',
    steps: [
      '1. Chờ xử lý → 2. Đang xử lý → 3. Kiểm định chất lượng (QC) → 4. Chờ duyệt → 5. Thẩm định nội dung → 6. Đã duyệt → 7. Xuất bản → 8. Đã lưu trữ – đang giám sát → 9. Đã kiểm kê.',
      'Nếu QC không đạt ở bước 3, bản ghi rẽ sang trạng thái ngoài luồng "Cần số hóa lại" rồi quay lại bước 2 khi số hóa lại xong — không tính là một trong 9 bước.',
      'Bước 5 (Thẩm định nội dung) là bước phê duyệt — áp dụng nguyên tắc bốn mắt: người tạo/sửa nội dung không được tự thẩm định.',
      'Với di tích quốc gia đặc biệt/bảo vật quốc gia, trước bước 7 (Xuất bản) phải có "Xin ý kiến Bộ VHTTDL" (Luật Di sản văn hóa Điều 87).',
      'Sau khi xuất bản có thể dùng thao tác "Gỡ xuất bản" nếu cần — bản ghi vẫn được giữ nguyên, không xóa.',
    ],
  },
  {
    id: 'hd-kiem-ke-hoan-tac',
    dienGiai: [
      'Kiểm kê là đối chiếu giữa những gì hệ thống ghi và những gì thực tế có. Giá trị của nó nằm ở chỗ phát hiện lệch, nên thao tác kiểm kê phải ghi lại được cả kết quả khớp lẫn kết quả không khớp — nếu chỉ ghi phần khớp thì kiểm kê trở thành thủ tục hình thức.',
      'Chức năng hoàn tác tồn tại vì kiểm kê là việc làm nhiều thao tác lặp lại trong thời gian dài, và bấm nhầm là chuyện bình thường. Điều quan trọng là hoàn tác không xóa dấu vết: bản ghi quay lại trạng thái cũ nhưng nhật ký vẫn giữ cả thao tác nhầm lẫn thao tác hoàn tác. Ai đó cố tình sửa số liệu rồi hoàn tác để xóa vết thì vẫn nhìn ra được.',
      'Nên kiểm kê theo lô có phạm vi rõ ràng và chốt từng lô, thay vì mở một đợt kiểm kê kéo dài không có điểm kết thúc.',
    ],
    category: 'huong-dan',
    group: 'Kiểm kê',
    title: 'Kiểm kê định kỳ và hoàn tác thao tác đối chiếu',
    keywords: ['kiem ke', 'hoan tac', 'undo', 'chot dot', 'bien ban kiem ke'],
    relatedRoute: '/inventory',
    steps: [
      'Trong một đợt kiểm kê đang mở, mỗi thao tác đối chiếu (kể cả thao tác hàng loạt) có thể hoàn tác trong khoảng 10 giây ngay sau khi thực hiện.',
      'Sau khi chốt đợt kiểm kê (ký biên bản), các dòng chuyển sang chỉ đọc — không hoàn tác trực tiếp được nữa.',
      'Muốn sửa dữ liệu đã chốt: dùng "điều chỉnh có lý do" — ghi rõ nguyên nhân, giữ nguyên bản ghi gốc để đối chiếu sau này.',
    ],
  },
  {
    id: 'hd-phan-quyen-bon-mat',
    dienGiai: [
      'Nguyên tắc bốn mắt nghĩa là không một người nào tự mình đưa được nội dung từ lúc tạo tới lúc công bố. Mục đích không phải nghi ngờ cán bộ, mà là để một sai sót đơn lẻ luôn có cơ hội bị chặn lại trước khi ra ngoài.',
      'Áp dụng cho luồng số hóa, ranh giới tối thiểu cần giữ là người thực hiện số hóa không đồng thời là người kiểm định, và người phê duyệt nội dung không đồng thời là người bấm xuất bản. Khi nhân sự mỏng và một người kiêm nhiều vai, nguyên tắc này bị vô hiệu trên thực tế dù phần mềm vẫn cấu hình đúng — nên việc rà soát định kỳ danh sách ai đang giữ vai gì là việc quản lý, không phải việc kỹ thuật.',
      'Cần phân biệt hai lớp kiểm soát: ẩn một mục khỏi menu chỉ là giao diện, còn chặn thật phải nằm ở tầng dữ liệu. Kiểm tra quyền cần được đánh giá bằng câu hỏi người dùng gõ thẳng địa chỉ thì có vào được không, chứ không phải bằng việc menu có hiện hay không.',
    ],
    category: 'huong-dan',
    group: 'Phân quyền',
    title: 'Phân quyền người dùng và nguyên tắc bốn mắt',
    keywords: ['phan quyen', 'RBAC', 'ABAC', 'bon mat', 'four eyes', 'vai tro'],
    relatedRoute: '/users',
    steps: [
      'Ma trận phân quyền tổ chức theo vai trò × module × quyền (Xem, Tạo/Sửa, Duyệt, Xuất bản, Xóa, Quản trị). Bật một quyền bất kỳ sẽ tự bật kèm "Xem"; tắt "Xem" sẽ tắt toàn bộ quyền của module đó.',
      'Một số ô bị khóa cứng theo chính sách, không vai trò nào bật được: Nhật ký không ai được Tạo/Sửa/Xóa (append-only); Tuân thủ không ai được Xóa; Kiểm kê không được Xóa sau khi đã chốt đợt.',
      'Nguyên tắc bốn mắt: với các module nội dung (Dữ liệu số hóa, Nhập dữ liệu, Bộ sưu tập), không được vừa có "Tạo/Sửa" vừa có "Duyệt"/"Xuất bản" — người làm nội dung không tự duyệt/tự công bố nội dung của mình.',
      'Quyền "Xóa" luôn phải đi kèm "Quản trị" của cùng module. Người quản trị tài khoản (Quản trị → Người dùng) không được đồng thời có quyền Duyệt/Xuất bản dữ liệu số hóa — tránh tự nâng quyền cho chính mình.',
    ],
  },
);

HOWTO_ENTRIES.push(
  {
    id: 'hd-sao-luu-khoi-phuc',
    dienGiai: [
      'Nguyên tắc phải nhớ là không có bản sao lưu nào được coi là tồn tại cho tới khi đã khôi phục thử thành công. Sao lưu chạy xanh hằng đêm mà chưa ai phục hồi thử lần nào là tình trạng rất phổ biến, và nó chỉ lộ ra đúng vào lúc tệ nhất.',
      'Với kho số hóa di sản, khối lượng làm mọi việc khó hơn kho dữ liệu hành chính: một mô hình 3D hay một cảnh splat nặng gấp hàng nghìn lần một bản ghi văn bản, nên thời gian khôi phục là con số phải đo thật chứ không ước lượng. Cần biết trước khôi phục toàn bộ mất bao lâu, vì đó là khoảng thời gian đơn vị ngừng hoạt động khi có sự cố.',
      'Ba câu hỏi nên trả lời được bằng số: mất tối đa bao nhiêu dữ liệu nếu hỏng ngay bây giờ, khôi phục mất bao lâu, và lần diễn tập khôi phục gần nhất là khi nào.',
    ],
    category: 'huong-dan',
    group: 'Sao lưu & khôi phục',
    title: 'Sao lưu & khôi phục dữ liệu',
    keywords: ['sao luu', 'khoi phuc', 'backup', 'restore', '3-2-1', 'RTO', 'diem khoi phuc'],
    relatedRoute: '/backup',
    steps: [
      'Kiến trúc lưu trữ 3 tầng theo quy tắc 3-2-1: tầng nóng (bản làm việc, tái tạo được), tầng lưu trữ AIP (bản gốc bất biến), tầng lạnh off-site (bản sao đầy đủ tại địa điểm địa lý khác).',
      'Sao lưu tự động chạy hằng ngày lúc 03:00; cập nhật/tải lên trước mốc sao lưu gần nhất luôn được khôi phục đầy đủ.',
      'Để khôi phục: chọn một điểm khôi phục trong lịch sử, chọn phạm vi (toàn bộ hệ thống hoặc theo một bộ sưu tập), rồi nhập đúng ngày của điểm khôi phục để xác nhận — thao tác này GHI ĐÈ trạng thái hiện tại.',
      'Mục tiêu thời gian khôi phục (RTO) cam kết tối đa 4 giờ kể từ khi sự cố được xác nhận, kể cả kịch bản hỏng toàn bộ trung tâm dữ liệu.',
    ],
  },
  {
    id: 'hd-bien-tap-tour-khong-gian-so',
    dienGiai: [
      'Trình biên tập tour là ứng dụng độc lập, chạy riêng và được nhúng vào màn Biên tập qua khung nhúng. Cách tách như vậy có lý do kỹ thuật: nó dùng bộ dựng hình ba chiều riêng, nâng cấp theo nhịp riêng, và không nên ràng buộc vào vòng đời của hệ quản trị.',
      'Hệ quả cần biết khi vận hành: nếu ứng dụng đó chưa chạy thì màn Biên tập không có nội dung, và đây không phải lỗi của hệ quản trị. Ở môi trường phát triển, ứng dụng phải được khởi động riêng trước khi mở màn này. Ở môi trường thật, địa chỉ của nó do người quản trị hạ tầng cấu hình.',
      'Cần lưu ý một giới hạn hiện tại: tệp tour xuất ra từ trình biên tập là tệp rời, chưa được đưa trở lại thành tài sản có mã và có phiên bản trong hệ quản trị. Nghĩa là tour dựng xong chưa đi qua luồng duyệt như các tài sản khác, và việc quản lý các bản tour tạm thời vẫn phải làm thủ công.',
    ],
    canBoSung: 'Quy trình đưa tệp tour xuất ra trở lại hệ quản trị thành tài sản có mã, có phiên bản và đi qua luồng phê duyệt hiện chưa có. Cần quyết định về mặt nghiệp vụ trước khi triển khai kỹ thuật.',
    category: 'huong-dan',
    group: 'Biên tập tour không gian số',
    title: 'Biên tập tour không gian số (cần chạy kèm ứng dụng GS Immersive Tour)',
    keywords: ['bien tap', 'tour khong gian so', 'gaussian splat', 'GS immersive tour', 'editor', 'playcanvas'],
    relatedRoute: '/editor',
    steps: [
      'Màn Biên tập nhúng ứng dụng GS Immersive Tour (Vite + PlayCanvas) qua iframe — đây là ứng dụng ĐỘC LẬP, repo riêng, không phải một phần của hệ thống quản trị này.',
      'Ở môi trường phát triển, ứng dụng GS Immersive Tour phải được khởi động riêng ở cổng 5174 (song song với admin ở 5173) trước khi mở màn Biên tập; nếu iframe báo chưa kết nối được, kiểm tra ứng dụng đó đã chạy hay chưa.',
      'Ở môi trường vận hành thật, địa chỉ ứng dụng GS Immersive Tour trỏ qua cấu hình môi trường (không hard-code localhost) — cần được người quản trị hạ tầng cấu hình đúng domain trước khi bàn giao.',
      'Trang Biên tập trong ứng dụng này chỉ là điểm vào; toàn bộ thao tác chỉnh sửa nội dung tour diễn ra trong chính ứng dụng GS Immersive Tour.',
    ],
    note: 'Nếu chưa cài đặt/khởi động ứng dụng GS Immersive Tour kèm theo, màn Biên tập sẽ không hiển thị được nội dung.',
  },
);

HOWTO_ENTRIES.push({
  id: 'hd-nhat-ky-he-thong',
  dienGiai: [
    'Nhật ký chỉ có giá trị khi thỏa hai điều kiện: ghi đủ để dựng lại được chuyện đã xảy ra, và không sửa được bởi chính người bị ghi. Thiếu điều kiện thứ hai thì nhật ký không dùng làm bằng chứng được, vì người có quyền cao nhất cũng là người xóa được dấu vết của mình.',
    'Khi tra cứu, nên đi từ câu hỏi cụ thể thay vì đọc tuần tự: bản ghi này ai sửa lần cuối, ai đã phê duyệt lô này, tài khoản này đã làm gì trong khoảng thời gian nào. Nhật ký dài hàng chục nghìn dòng nên đọc xuôi từ đầu là cách chắc chắn không tìm ra gì.',
    'Thời hạn lưu nhật ký cần đặt theo mục đích sử dụng chứ không theo dung lượng còn trống. Có loại nghĩa vụ đòi giữ hồ sơ nhiều năm, và nếu chu kỳ dọn dẹp ngắn hơn thời hạn đó thì bằng chứng bị xóa trước khi cần đến.',
  ],
  category: 'huong-dan',
  group: 'Nhật ký hệ thống',
  title: 'Tra cứu nhật ký hệ thống',
  keywords: ['nhat ky', 'audit log', 'hash-chain', 'bat bien', 'trich nhat ky'],
  relatedRoute: '/logs',
  steps: [
    'Nhật ký ghi thêm (append-only): không vai trò nào — kể cả Quản trị — được sửa hoặc xóa bản ghi đã ghi.',
    'Mỗi dòng nhật ký kèm mã băm của dòng liền trước (hash-chain) — giúp phát hiện nếu có dòng bị chèn/sửa sai thứ tự.',
    'Dùng bộ lọc theo người dùng/hành động/đối tượng để tra cứu khi cần đối chiếu một thao tác cụ thể (ví dụ: ai đã chuyển bước "Xin ý kiến Bộ VHTTDL" cho một hồ sơ, lúc nào).',
    'Thời hạn lưu nhật ký áp dụng theo cấp độ an toàn thông tin đã phê duyệt (xem mục pháp lý "Xác định cấp độ an toàn thông tin").',
  ],
});

// ---------------------------------------------------------------------------
// Nhóm CẢNH BÁO — đính chính 2 văn bản đã hết hiệu lực, làm nổi bật riêng để
// không ai còn dẫn chiếu nhầm trong hồ sơ hoặc trao đổi với đơn vị thanh tra.
// NĐ 47/2020 bị bãi bỏ theo Điều 23 NĐ 278/2025 — sự kiện này đã có sẵn trong
// comment đầu CompliancePage.tsx cũ (lý do trang tuân thủ B8 ra đời thay cho
// khối "Tuân thủ NĐ 47/2020" trước đó). NĐ 13/2023 hết hiệu lực 01/01/2026,
// được thay bằng NĐ 356/2025 — chính là nghị định hiện hành đã dẫn xuyên suốt
// nhóm pháp lý "Bảo vệ dữ liệu cá nhân" ở trên, nên việc đính chính này nhất
// quán với toàn bộ nội dung đã có, không phải thêm căn cứ pháp lý mới.
// ---------------------------------------------------------------------------

export const WARNING_ENTRIES: HelpEntry[] = [
  {
    id: 'canh-bao-van-ban-het-hieu-luc',
    category: 'canh-bao',
    group: 'Đính chính văn bản pháp luật',
    title: 'Hai văn bản đã hết hiệu lực — không còn căn cứ áp dụng',
    keywords: ['het hieu luc', 'bai bo', 'nghi dinh 47/2020', 'nghi dinh 13/2023', 'nghi dinh 278/2025', 'nghi dinh 356/2025'],
    yeuCau: 'Không dẫn chiếu văn bản đã hết hiệu lực làm căn cứ tuân thủ trong hồ sơ, báo cáo hay trao đổi với cơ quan thanh tra.',
    donViTuLam: [
      'Nghị định 47/2020/NĐ-CP: đã bị BÃI BỎ theo Điều 23 Nghị định 278/2025/NĐ-CP — không dẫn chiếu văn bản này trong hồ sơ mới.',
      'Nghị định 13/2023/NĐ-CP: HẾT HIỆU LỰC từ 01/01/2026, được thay thế bởi Nghị định 356/2025/NĐ-CP (căn cứ hiện hành, đã dùng xuyên suốt nhóm pháp lý "Bảo vệ dữ liệu cá nhân" ở trên).',
      'Nếu gặp tài liệu nội bộ cũ còn trích dẫn 1 trong 2 nghị định trên, cập nhật lại theo văn bản hiện hành trước khi sử dụng.',
    ],
    trachNhiemXacNhan: 'Cán bộ chuyên trách ATTT / cán bộ bảo vệ dữ liệu cá nhân — rà soát tài liệu nội bộ còn dẫn chiếu văn bản cũ.',
  },
];

/** Toàn bộ nội dung trang Trợ giúp & tra cứu — HelpPage lọc/nhóm trên mảng này. */
export const HELP_ENTRIES: HelpEntry[] = [...WARNING_ENTRIES, ...LEGAL_ENTRIES, ...HOWTO_ENTRIES];

