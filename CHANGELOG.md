# Nhật ký thay đổi

Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/); đánh số phiên bản theo
[Semantic Versioning](https://semver.org/lang/vi/).

Quy ước nhóm mục: **Thêm mới** · **Thay đổi** · **Không dùng nữa** · **Gỡ bỏ** · **Sửa lỗi** · **Bảo mật**.

---

## [1.0.0] — 12/08/2026

Bản trình duyệt đầu tiên phục vụ hồ sơ dự thầu. Chuyển từ bản thiết kế tĩnh `Van Mieu Admin v3.dc.html`
thành ứng dụng React chạy được, kèm bộ tài liệu dự án đầy đủ.

### Thêm mới — Ứng dụng

- **Chín màn gốc** chuyển từ bản thiết kế v3: Tổng quan · Dữ liệu số hóa · Chi tiết · Nhập dữ liệu ·
  Bộ sưu tập · Chi tiết bộ sưu tập · Người dùng · Nhật ký · Kết nối & chia sẻ.
- **Đăng nhập và đăng ký**: SSO cơ quan (mô phỏng), xác thực hai lớp, **chọn vai trò trình diễn** để
  thấy phân quyền thay đổi theo vai; đăng ký mới vào trạng thái *Chờ phê duyệt*.
- **Hồ sơ đối tượng di sản** — trang tổng hợp 360° cho một đối tượng thật: bản đại diện số nhóm theo
  dạng dữ liệu, tư liệu độc lập có liên quan, bản dẫn xuất bảo quản, độ đầy đủ hồ sơ.
- **Danh sách đối tượng di sản** với cây phân khu và **chỉ số độ phủ số hóa** (đã số hóa / chưa số hóa /
  thiếu số kiểm kê) — căn cứ báo cáo theo QĐ 2026/QĐ-TTg.
- **Đặc điểm vật lý của đối tượng**: bảng đo lặp lại theo CIDOC-CRM E54 / Spectrum 5.0 (chiều đo · bộ
  phận đo · trị số · tính chất · phương pháp · người đo), trường riêng theo từng loại đối tượng, vị trí
  có cấu trúc, điều kiện bảo quản. Đồng bộ giữa màn xem và màn nhập liệu.
- **Báo cáo – Thống kê** (4 biểu đồ, xuất Excel/PDF mô phỏng) · **Kiểm kê định kỳ** · **Sao lưu &
  khôi phục** (RPO/RTO, điểm khôi phục, KPI bảo quản) · **Chi tiết người dùng và ma trận phân quyền** ·
  **Quản lý khóa API** · **Nhật ký nâng cao** · **Tuân thủ & quản trị dữ liệu** (9 tab).
- **Tài liệu chứng cứ mở xem được** trong sổ đăng ký tuân thủ, có dán nhãn *tài liệu mẫu*.
- **Hộp thoại Thêm người dùng có ma trận phân quyền ngay trong biểu mẫu tạo**: danh tính, vai trò,
  ma trận vai trò × phân hệ × quyền (điền sẵn theo vai trò, sửa được, đánh dấu ô khác mặc định),
  phạm vi dữ liệu ABAC, hạn tài khoản, MFA bắt buộc với vai trò Quản trị/Phê duyệt, và lý do cấp
  quyền. Tài khoản mới vào trạng thái *Chờ phê duyệt*.
- **Bảng tham chiếu ma trận phân quyền theo vai trò** ngay tại màn Người dùng — đọc được chính sách
  mà không phải mở hồ sơ một tài khoản cụ thể. Bảng nhóm cột theo *Đọc · Biên tập · Phê duyệt &
  công bố · Quản trị* và nhóm hàng theo *Nghiệp vụ · Quản trị & tuân thủ*, nên nguyên tắc bốn mắt
  hiện ra thành ba vùng quyền gần như không chồng lên nhau.
- **Quy tắc phân tách nhiệm vụ chạy được trong mã**: ô khóa cứng (không ai sửa/xóa được nhật ký),
  xung đột chặn lưu (vừa Tạo/Sửa vừa Duyệt; Xóa không kèm Quản trị; quản trị tài khoản kiêm duyệt
  nội dung), ràng buộc hệ quả (bật quyền bất kỳ ⇒ tự bật Xem). 11 ca kiểm thử tự động khóa các bất
  biến này.
- **Lưu phân quyền phải có lý do**: bản nháp tách khỏi bản có hiệu lực, có thanh hoàn tác, lý do đi
  vào lịch sử phân quyền.
- **Hộp thoại Cài đặt**: 7 chủ đề màu (bổ sung Indigo và Cyan), hạn mức lưu trữ, ngôn ngữ giao diện.
- **Khung đa ngữ**: tiếng Việt hoàn chỉnh; `en`/`fr` sinh cấu trúc tự động từ `vi` nên không lệch khóa.
- **Quy trình số hóa 9 bước + 2 trạng thái ngoài luồng**, nguyên tắc bốn mắt, *Trả lại bổ sung* và
  *Gỡ xuất bản* bắt buộc nhập lý do, bước xin ý kiến Bộ VHTTDL trước khi xuất bản.
- **Hoàn tác hai tầng** ở màn Kiểm kê: hoàn tác nhanh khi chưa chốt đợt; sau khi chốt chỉ *điều chỉnh
  có lý do*, giữ nguyên bản ghi gốc.

### Thêm mới — Tài liệu

- README gốc làm chỉ mục toàn bộ tài liệu; CHANGELOG; CONTRIBUTING; SECURITY.
- Thuyết minh kỹ thuật 18 chương · Đặc tả API · Mô hình dữ liệu · Ma trận truy vết · Quy trình bảo quản
  và sao lưu (5 lưu đồ) · Phụ lục thông tin di sản · Kịch bản trình diễn.
- Mô tả kiến trúc (ISO/IEC/IEEE 42010:2022) · SRS (29148:2018) · Kế hoạch kiểm thử (29119-3) ·
  Chất lượng dữ liệu (ISO/IEC 25012) · Kế hoạch quản lý dự án (16326) · Vận hành và bàn giao ·
  Hồ sơ đề xuất cấp độ ATTT · Vấn đề đã biết · Danh mục kiểm tra trước khi nộp · Thuật ngữ.
- **17 quyết định kiến trúc (ADR)** theo định dạng Michael Nygard, có phần *phương án đã cân nhắc và
  lý do loại*.

### Thay đổi

- **Thuật ngữ**: tiếng Việt dùng thống nhất **"dữ liệu số hóa"** thay cho "tài sản" (tránh nhầm với
  tài sản công theo nghĩa quản lý tài sản nhà nước). Tiếng Anh giữ `asset` trong mã nguồn và API.
- **Phân loại tách hai trục** `objectClass` × `digitalForm` thay cho một trường `type` trộn lẫn loại
  đối tượng với dạng dữ liệu.
- **Mã định danh 5 tầng** (`VM-CT-00007.SPL01.v2#master`); mã không chứa thuộc tính khả biến như vị trí.
- **Niên đại hai lớp**: chuỗi EDTF (ISO 8601-2) để lọc, song song chuỗi hiển thị nguyên văn can chi và
  niên hiệu, kèm độ tin cậy.
- **Quan hệ tài sản** chia ba nhóm theo CIDOC-CRM; tách riêng `hasPreservationSurrogate` khỏi
  `derivedFrom` vì bản PLY bảo hiểm của gaussian splat có nghĩa vụ bảo quản khác bản web tối ưu.
- **Chính sách phân quyền gom về một nguồn** `data/permissions.ts`. `Capabilities` trong
  `AuthContext` không còn là bảng gõ tay mà **suy ra từ ma trận** — trước đó hai bảng mô tả cùng một
  chính sách và đã lệch nhau. Vai trò Quản trị **không có** quyền Duyệt/Xuất bản nội dung.
- Chủ đề mặc định chuyển sang **xanh rêu – vàng kim**; biến chủ đề gắn ở `:root` để áp cho cả màn
  ngoài khung ứng dụng.
- `Modal` render qua portal **ngay tại component** thay vì ở từng nơi gọi, để lỗi hộp thoại bị nhốt
  trong thẻ có `backdrop-filter` không tái diễn khi thêm hộp thoại mới.
- Nâng bộ trường metadata theo chuẩn Dublin Core (TCVN 7980-1:2024) mở rộng LIDO/CIDOC-CRM/PREMIS.

### Sửa lỗi

- **14 sai sót thông tin di sản** trong dữ liệu mẫu, phát hiện qua rà soát nội bộ và hiệu đính có đối
  chiếu nguồn (chi tiết tại [docs/04](docs/04-phu-luc-fact-di-san.md)) — trong đó loại bỏ một hiện vật
  không thuộc di tích và sửa ba lỗi can chi. Nhãn can chi nay **tính bằng hàm có kiểm thử tự động**,
  không gõ tay.
- **Số liệu tự mâu thuẫn**: mọi chỉ số nay tính từ một nguồn dữ liệu duy nhất; dung lượng tính theo
  công thức vật lý thật thay vì gõ tay.
- **Độ đầy đủ hồ sơ trả 100% cho tập rỗng** — đối tượng chưa số hóa từng hiện "hồ sơ đầy đủ 100%",
  làm báo cáo tiến độ bị đọc ngược. Nay trả `null` và hiển thị *Chưa số hóa*.
- **Hồ sơ đối tượng chưa số hóa hiện nhầm sang đối tượng khác** do tra cứu theo bản ghi số thay vì
  theo hồ sơ hiện vật.
- Đăng nhập không vào được ứng dụng do trạng thái phiên chỉ ghi `localStorage` mà không cập nhật
  trạng thái React.
- Chữ trắng trên nền sáng ở màn đăng nhập và mất nhãn thẻ vai trò, do biến chủ đề chỉ gắn trên khung
  ứng dụng nên không áp cho màn nằm ngoài khung.
- Hộp thoại bị nhốt trong thanh bên do `backdrop-filter` biến phần tử cha thành khối chứa của
  `position: fixed`; chuyển sang render qua portal.
- Ô nhập mã xác thực không nhận số khi gõ nhanh; bổ sung dán mã và nút điền mã trình diễn.
- Bình luận nội bộ về quá trình sửa lỗi rò vào chuỗi hiển thị cho người dùng.
- **Ma trận phân quyền không có lối vào**: màn Chi tiết người dùng đã có ma trận nhưng bảng danh
  sách người dùng không bấm được và không màn nào liên kết tới `/users/:email` — chức năng tồn tại
  trong mã nhưng không tồn tại với người dùng. Nút *Thêm người dùng* cũng chưa gắn hành động nào.
- **Ma trận cấp quyền Duyệt/Xuất bản cho vai trò Quản trị**, mâu thuẫn với bảng quyền dùng để ẩn
  hiện menu và với chính nguyên tắc bốn mắt mà hệ thống cam kết.
- Bảng màu chữ phụ không đạt tương phản WCAG 2.1 AA (54 vị trí).

### Bảo mật

- Phân quyền theo vai trò: mục ngoài quyền **ẩn hẳn** khỏi menu, không chỉ vô hiệu hóa.
- Nguyên tắc bốn mắt: người phụ trách bản ghi không thể tự phê duyệt bản ghi của mình.
- **Chặn đường tự nâng quyền**: không cấu hình được một vai trò vừa quản trị tài khoản vừa duyệt/
  xuất bản dữ liệu số hóa; không cấu hình được quyền sửa hoặc xóa nhật ký hoạt động cho bất kỳ vai
  trò nào, kể cả Quản trị.
- Tài khoản tạo mới không tự kích hoạt: vào trạng thái *Chờ phê duyệt*, cần quản trị viên khác duyệt.
- Nhật ký hoạt động append-only; **thời hạn lưu theo cấp độ an toàn hệ thống thông tin được phê duyệt
  (TCVN 11930:2017)**, không dùng con số cố định.
- Khóa API có phạm vi, hạn dùng và giới hạn tốc độ; giá trị khóa chỉ hiển thị một lần khi tạo.
- Chống chèn công thức khi nhập lô từ tệp bảng tính.
- Cờ *chứa dữ liệu cá nhân* ở mức từng bản ghi, kèm quy tắc lược bỏ khi công bố qua API công khai.

### Ghi chú pháp lý

- Toàn bộ tài liệu chuyển sang khung pháp lý 2024–2026. **Nghị định 47/2020/NĐ-CP đã bị bãi bỏ** bởi
  Điều 23 Nghị định 278/2025/NĐ-CP; **Nghị định 13/2023/NĐ-CP hết hiệu lực từ 01/01/2026**. Hai văn bản
  này chỉ còn xuất hiện trong tài liệu ở dạng ghi chú đính chính.

---

## Chưa phát hành

### Thêm mới — Ứng dụng

- **Nhóm KHAI THÁC trên thanh điều hướng** với hai màn nhúng ứng dụng GaussianSplat Immersive Tour
  (ứng dụng độc lập, nhúng qua iframe — [ADR-0019](docs/adr/0019-nhung-gs-immersive-tour-qua-iframe.md)):
  **Biên tập** (`/editor`, trình tạo tour: nạp splat, ghi điểm dừng camera, đặt pin, xuất tour.json;
  chỉ vai trò có quyền Tạo/Sửa) và **Không gian số** (`/spatial`, trình diễn tour; mọi vai trò).
  Khung nhúng tự kiểm tra ứng dụng ngoài có đang chạy không — chưa chạy thì hiện hướng dẫn khởi
  động kèm đúng lệnh và nút thử lại, không để iframe trắng.

### Thay đổi — Ứng dụng

- **Thanh điều hướng tái cấu trúc thành 4 nhóm**: DỮ LIỆU (kho số hóa) · KHAI THÁC (dùng dữ liệu:
  biên tập tour, không gian số) · QUẢN TRỊ (con người, quy trình) · HỆ THỐNG (sao lưu, khóa API,
  trợ giúp). Nhóm rỗng sau khi lọc vai trò ẩn cả nhãn.
- **Trang "Tuân thủ & quản trị dữ liệu" đổi hệ hình thành "Trợ giúp & tra cứu"** (`/help`,
  [ADR-0020](docs/adr/0020-tro-giup-tra-cuu-thay-bang-tuyen-bo-tuan-thu.md)): không còn trạng thái
  "Đạt ✓" do phần mềm tự gán — mỗi mục pháp lý nêu *văn bản yêu cầu gì → hệ thống hỗ trợ bằng chức
  năng nào → đơn vị vận hành tự làm gì → chức danh nào chịu trách nhiệm xác nhận*; tra cứu theo từ
  khóa/số hiệu văn bản; mở cho mọi vai trò (trước giới hạn Quản trị/Phê duyệt). Đường dẫn cũ
  `/compliance` chuyển hướng sang `/help`.

### Thay đổi — Tài liệu

- **Chốt công nghệ lớp dịch vụ ứng dụng: PHP + Laravel** — [ADR-0018](docs/adr/0018-php-laravel-cho-lop-dich-vu-ung-dung.md)
  (13/08/2026). Trước đó hồ sơ để lớp này ở mức trung lập công nghệ ("API dạng REST, kiến trúc
  mô-đun theo miền nghiệp vụ"). Quyết định **bổ sung, không thay thế** ADR-0002; lớp trình diễn
  React + three.js giữ nguyên. Kèm bốn ranh giới: không dùng khuôn mẫu phía máy chủ, không phát tệp
  nhị phân lớn qua tiến trình PHP, tác vụ nặng chạy ở worker qua hàng đợi, không tự viết phần định
  danh/xác thực. Đặc tả OpenAPI, mô hình dữ liệu và sáu khung nhìn kiến trúc **không phải sửa** —
  vốn đã trung lập ngôn ngữ.
- `01-thuyet-minh-ky-thuat.md` mục 6.2: nêu tên công nghệ lớp dịch vụ kèm lý do chọn; bổ sung dòng
  "Xử lý tệp nặng và bảo quản" cho tiến trình worker tách rời.
- `08-mo-ta-kien-truc.md`: sơ đồ triển khai 4.4 tách nút tiến trình xử lý nền khỏi nút dịch vụ API
  kèm diễn giải ràng buộc; bảng ADR mục 6 bổ sung 0017 và 0018 (0017 trước đó thiếu trong bảng);
  mục 9 nêu công nghệ lớp nghiệp vụ mục tiêu.

### Cần làm trước khi nộp

- **Rà hồ sơ mời thầu xem có ràng buộc ngôn ngữ hoặc nền tảng cụ thể hay không** — ADR-0018 được
  lập khi chưa đối chiếu HSMT; nếu HSMT có ràng buộc thì quyết định phải rà lại.

Xem [docs/16 — Vấn đề đã biết](docs/16-van-de-da-biet.md) để biết hạn chế hiện tại và hướng khắc phục
dự kiến ở các bản sau.
