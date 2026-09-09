# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## Hệ thống quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám

**Hệ thống quản lý dữ liệu số Văn Miếu — Quốc Tử Giám** · Tài liệu số hiệu `09` · Phụ lục kỹ thuật hồ sơ dự thầu · đọc cùng `08-mo-ta-kien-truc.md`, `01-thuyet-minh-ky-thuat.md`

| Trường | Nội dung |
|---|---|
| Mã tài liệu | VMQTG-DS-09 |
| Tên tài liệu | Đặc tả yêu cầu phần mềm (Software Requirements Specification) |
| Chuẩn áp dụng | ISO/IEC/IEEE 29148:2018 — Systems and software engineering — Life cycle processes — Requirements engineering |
| Phiên bản | 1.0.0 |
| Ngày ban hành | 12/08/2026 |
| Người lập | Nhóm tư vấn/nhà thầu lập hồ sơ dự thầu *(tên đơn vị và cá nhân chịu trách nhiệm: cần điền trước khi nộp)* |
| Trạng thái | Dự thảo trình chủ đầu tư |
| Phạm vi đặc tả | Yêu cầu phần mềm **Giai đoạn 1** (theo `01-thuyet-minh-ky-thuat.md` mục 3.3); yêu cầu Giai đoạn 2 chỉ liệt kê ở mức định hướng, đánh dấu ưu tiên tương ứng |

**Tài liệu liên quan (đường dẫn tương đối từ `docs/`):**

| Tài liệu | Vai trò đối với tài liệu này |
|---|---|
| `./00-ke-hoach-nang-cap.md` | Nguồn các quyết định thiết kế gốc, dùng để xác định nguồn gốc (traceability) của một số yêu cầu |
| `./01-thuyet-minh-ky-thuat.md` | Nguồn chính của yêu cầu chức năng CN-01…CN-15 (Chương 4) và phi chức năng PCN-01…15 (Chương 5) — tài liệu này **nâng cấp** các yêu cầu đó lên định dạng chuẩn 29148 (mã, ưu tiên, tiêu chí nghiệm thu, nguồn gốc), không mâu thuẫn với nội dung gốc |
| `./03-ma-tran-truy-vet.md` | Ma trận truy vết chi tiết ở mức use case (wireframe × màn hình × pháp lý × chuẩn quốc tế) — bổ sung cho ma trận tổng hợp tại mục 4 tài liệu này |
| `./06-dac-ta-api.md` | Chi tiết kỹ thuật của các yêu cầu giao diện ngoài tại mục 3.2 |
| `./07-mo-hinh-du-lieu.md` | Chi tiết mô hình dữ liệu hỗ trợ các yêu cầu chức năng nhóm dữ liệu |
| `./08-mo-ta-kien-truc.md` | Mô tả kiến trúc theo ISO/IEC/IEEE 42010:2022 — cung cấp bối cảnh sản phẩm (mục 2.1) và một phần ràng buộc thiết kế (mục 3.5) của tài liệu này |
| `./adr/0001-…` đến `./adr/0016-…` | Nguồn gốc của các ràng buộc thiết kế và một số yêu cầu phi chức năng |

---

## 1. Giới thiệu

### 1.1. Mục đích

Tài liệu đặc tả đầy đủ, có thể kiểm chứng, các yêu cầu của phần mềm quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám theo cấu trúc của **ISO/IEC/IEEE 29148:2018**, phục vụ ba mục đích: **(một)** làm cơ sở ký kết và nghiệm thu hợp đồng giữa chủ đầu tư và nhà thầu; **(hai)** làm cơ sở thiết kế chi tiết và kiểm thử cho đội triển khai; **(ba)** làm tài liệu đối chiếu độc lập cho hội đồng thẩm định. Mỗi yêu cầu trong tài liệu này có mã định danh duy nhất, phát biểu ở dạng bắt buộc ("Hệ thống PHẢI…"), mức ưu tiên, tiêu chí nghiệm thu kiểm chứng được, và nguồn gốc — bốn thuộc tính tối thiểu theo khuyến nghị của tiêu chuẩn.

### 1.2. Phạm vi

Phần mềm quản lý và lưu trữ dữ liệu số của Di tích quốc gia đặc biệt Văn Miếu — Quốc Tử Giám, phục vụ toàn bộ vòng đời dữ liệu số hóa — từ tạo lập, biên tập, thẩm định, xuất bản, bảo quản dài hạn đến chia sẻ dữ liệu — cho năm loại đối tượng di sản và tám dạng dữ liệu số (định nghĩa tại mục 1.3). Phạm vi Giai đoạn 1 và ranh giới không thuộc Giai đoạn 1 giữ nguyên như đã chốt tại `01-thuyet-minh-ky-thuat.md` mục 3.3–3.4; tài liệu này không mở rộng hay thu hẹp phạm vi đó, chỉ đặc tả chi tiết hơn từng yêu cầu bên trong phạm vi đã chốt.

### 1.3. Định nghĩa, từ viết tắt và quy ước mã hoá

**Quy ước mã yêu cầu của tài liệu này.** Mỗi yêu cầu chức năng gốc `CN-nn.m` tại `01-thuyet-minh-ky-thuat.md` Chương 4 được nâng cấp thành `YC-CN-nn.m` (giữ nguyên số nhóm và số thứ tự để truy vết 1–1, không đánh số lại); tương tự mỗi chỉ tiêu phi chức năng `PCN-nn` thành `YC-PCN-nn`. Yêu cầu chất lượng bổ sung để đủ tám đặc tính ISO/IEC 25010:2023 (mục 3.4) được đánh số tiếp `YC-PCN-16` trở đi, có ghi rõ nguồn gốc dẫn xuất.

| Thuật ngữ / viết tắt | Giải nghĩa |
|---|---|
| **Dữ liệu số hóa** | Thuật ngữ dùng thống nhất trong toàn bộ tài liệu này thay cho "tài sản"; chỉ bản ghi dữ liệu số (`digital_record`) sinh ra từ việc số hóa một đối tượng di sản |
| **CN-nn.m / YC-CN-nn.m** | Mã yêu cầu chức năng gốc (tài liệu 01) / mã yêu cầu chức năng chuẩn hoá 29148 (tài liệu này) |
| **PCN-nn / YC-PCN-nn** | Mã chỉ tiêu phi chức năng gốc / mã yêu cầu phi chức năng chuẩn hoá 29148 |
| **MT-nn** | Mục tiêu cụ thể có chỉ tiêu đo được, `01-thuyet-minh-ky-thuat.md` mục 3.2 |
| **GĐ** | Giai đoạn triển khai — 1 (bắt buộc, nghiệm thu ngay) hoặc 2 (định hướng, không thuộc phạm vi nghiệm thu Giai đoạn 1) |
| **`objectClass` / `digitalForm`** | Hai trục phân loại độc lập: loại đối tượng di sản có thật (precinct, structure, artifact, document, av) và dạng dữ liệu số (mesh3d, splat, pointcloud, drawing, image, text, video, audio) — xem [ADR-0003](adr/0003-tach-truc-objectclass-va-digitalform.md) |
| **Mã khuyết giá trị** | Bộ năm mã tường minh thay cho ô trống: `KHONG_AP_DUNG`, `CHUA_XAC_DINH`, `KHONG_RO`, `CHUA_NHAP`, `HAN_CHE` — xem [ADR-0005](adr/0005-bo-5-ma-khuyet-gia-tri.md), [ADR-0016](adr/0016-averagecompletenesspct-tra-null-cho-tap-rong.md) |
| **RBAC / ABAC** | Phân quyền theo vai trò (Role-Based Access Control) kết hợp phân quyền theo thuộc tính/phạm vi dữ liệu (Attribute-Based Access Control) |
| **2FA** | Xác thực hai yếu tố (Two-Factor Authentication) |
| **OAIS / SIP / AIP / DIP** | Mô hình tham chiếu lưu trữ số mở (ISO 14721) và ba gói tin: tiếp nhận (Submission), lưu trữ (Archival), phân phối (Dissemination) |
| **PREMIS** | Chuẩn siêu dữ liệu bảo quản số (sự kiện, tác nhân, đối tượng, quyền) |
| **CIDOC-CRM** | Mô hình tham chiếu khái niệm cho di sản văn hóa (ISO 21127) |
| **Dublin Core / TCVN 7980** | Bộ yếu tố siêu dữ liệu lõi (ISO 15836), đã là tiêu chuẩn quốc gia Việt Nam TCVN 7980-1:2024 và TCVN 7980-2:2024 |
| **EDTF** | Extended Date/Time Format (ISO 8601-2) — chuẩn biểu diễn niên đại có độ bất định |
| **RPO / RTO** | Mục tiêu điểm khôi phục / mục tiêu thời gian khôi phục sau sự cố |
| **LGSP** | Nền tảng tích hợp, chia sẻ dữ liệu số của Thành phố Hà Nội |
| **NDXP** | Nền tảng tích hợp, chia sẻ dữ liệu quốc gia |
| **DPO / DPIA** | Nhân sự bảo vệ dữ liệu cá nhân / Hồ sơ đánh giá tác động xử lý dữ liệu cá nhân |
| **WCAG 2.1 AA** | Bộ tiêu chuẩn trợ năng nội dung web, mức tuân thủ AA |
| **OAI-PMH** | Giao thức thu hoạch siêu dữ liệu (Open Archives Initiative Protocol for Metadata Harvesting) |
| **API / OIDC / TLS** | Giao diện lập trình ứng dụng / OpenID Connect (đăng nhập một lần) / Transport Layer Security |
| **ISO/IEC 25010:2023** | Mô hình chất lượng sản phẩm phần mềm, tám đặc tính (mục 3.4) |

### 1.4. Tài liệu tham chiếu

Xem bảng "Tài liệu liên quan" ở trang đầu. Toàn bộ căn cứ pháp lý (Luật, Nghị định, Thông tư, Quyết định) viện dẫn trong cột "Nguồn gốc" của các yêu cầu tại mục 3 giữ nguyên bộ đã xác minh tại `01-thuyet-minh-ky-thuat.md` Chương 1 — tài liệu này không viện dẫn thêm văn bản pháp luật nào ngoài bộ đó.

---

## 2. Mô tả tổng thể

### 2.1. Bối cảnh sản phẩm

Hệ thống là một sản phẩm mới, thay thế cách quản lý dữ liệu số hóa phân tán hiện nay của Trung tâm (mô tả hiện trạng tại `01-thuyet-minh-ky-thuat.md` Chương 2), không phải bản nâng cấp của một hệ thống lõi sẵn có. Hệ thống vận hành như một khối dịch vụ độc lập, kết nối ra bên ngoài duy nhất qua Sở Văn hóa và Thể thao Hà Nội và nền tảng tích hợp, chia sẻ dữ liệu số của Thành phố — không kết nối ngang hàng với bất kỳ hệ thống cấp Thành phố hay cấp quốc gia nào khác. Kiến trúc bốn lớp (trình diễn — nghiệp vụ — dữ liệu — hạ tầng), sáu khung nhìn kiến trúc và mười sáu quyết định kiến trúc làm nền cho các yêu cầu tại mục 3 được mô tả đầy đủ tại `08-mo-ta-kien-truc.md`; tài liệu này chỉ tham chiếu, không lặp lại.

### 2.2. Các nhóm chức năng chính

Mười lăm nhóm chức năng, ánh xạ trực tiếp sang tám nhóm dịch vụ nghiệp vụ tại `08-mo-ta-kien-truc.md` mục 4.2:

| Nhóm | Tên | Số yêu cầu |
|---|---|---|
| YC-CN-01 | Danh mục và sổ đăng ký dữ liệu số hóa | 6 |
| YC-CN-02 | Siêu dữ liệu | 8 |
| YC-CN-03 | Nhập dữ liệu và kiểm soát chất lượng đầu vào | 8 |
| YC-CN-04 | Tìm kiếm và khai thác | 9 |
| YC-CN-05 | Quy trình duyệt và xuất bản | 8 |
| YC-CN-06 | Phiên bản và toàn vẹn dữ liệu | 6 |
| YC-CN-07 | Bộ sưu tập, phân loại, quyền sử dụng và mức truy cập | 6 |
| YC-CN-08 | Báo cáo và thống kê | 6 |
| YC-CN-09 | Kiểm kê định kỳ | 4 |
| YC-CN-10 | Quản lý đợt số hóa, nhà thầu và thiết bị | 5 |
| YC-CN-11 | Kết nối và chia sẻ dữ liệu | 10 |
| YC-CN-12 | Người dùng, phân quyền và nhật ký | 12 |
| YC-CN-13 | Đa ngữ | 4 |
| YC-CN-14 | Sao lưu, phục hồi và quản trị hệ thống | 5 |
| YC-CN-15 | Tuân thủ và quản trị dữ liệu | 9 |
| **Tổng** | | **106** |

### 2.3. Đặc điểm người dùng

| Nhóm người dùng | Vai trò hệ thống | Đặc điểm liên quan tới thiết kế yêu cầu |
|---|---|---|
| Chuyên viên số hóa | Kỹ thuật số hóa | Thao tác với tệp lớn, hiện trường có thể mất kết nối mạng tạm thời; cần giao diện tải lên chịu lỗi |
| Biên tập viên tư liệu | Biên tập | Có chuyên môn Hán Nôm hoặc lịch sử, không phải chuyên gia công nghệ thông tin; cần biểu mẫu có kiểm soát, không cần huấn luyện kỹ thuật sâu |
| Chuyên gia thẩm định | Thẩm định (song thẩm Hán Nôm) | Thao tác chính là xét duyệt nội dung, không nhập liệu số lượng lớn |
| Trưởng phòng chuyên môn, Ban Giám đốc | Phê duyệt | Ưu tiên tổng quan, báo cáo; thao tác trên thiết bị có thể là máy tính bảng trong cuộc họp |
| Cán bộ bảo quản số | Bảo quản số *(vai trò mới)* | Cần chỉ số kỹ thuật (checksum, tỷ lệ toàn vẹn) hiển thị trực quan cho người không chuyên sâu công nghệ thông tin |
| Cán bộ đầu mối dữ liệu | Đầu mối chia sẻ | Làm việc với văn bản hành chính đến/đi song song với hệ thống; cần đồng hồ đếm hạn xử lý rõ ràng |
| Quản trị hệ thống | Quản trị | Có kiến thức công nghệ thông tin; là người duy nhất cấu hình hệ thống, không phải nhà thầu |
| Nhân sự bảo vệ dữ liệu cá nhân | DPO | Kiêm nhiệm, cần quy trình được hệ thống nhắc việc chủ động (đồng hồ đếm ngược) thay vì phải tự theo dõi |
| Sở VH&TT, cơ quan nhà nước khác | Bên khai thác qua kết nối | Không thao tác trực tiếp trên giao diện; tương tác qua API hoặc báo cáo xuất |
| Tổ chức nghiên cứu, công chúng | Bên khai thác dữ liệu mở | Không thao tác trực tiếp; tương tác qua Cổng dữ liệu quốc gia hoặc API dữ liệu mở |

Số lượng người dùng dự kiến theo từng nhóm để đơn vị điền cụ thể khi ký hợp đồng — xem bảng đầy đủ tại `01-thuyet-minh-ky-thuat.md` mục 3.5.

### 2.4. Ràng buộc

Bảy nguyên lý kiến trúc và tám nhóm ràng buộc kỹ thuật/pháp lý đã lập bảng đầy đủ tại `08-mo-ta-kien-truc.md` mục 7–8 chi phối trực tiếp việc hiện thực các yêu cầu tại mục 3 của tài liệu này; quan trọng nhất với người đọc SRS: **(một)** không phụ thuộc dịch vụ đám mây nước ngoài, không truyền dữ liệu di sản ra khỏi lãnh thổ Việt Nam; **(hai)** kết nối ra ngoài bắt buộc qua nền tảng tích hợp của Thành phố, không kết nối ngang hàng; **(ba)** ưu tiên mã nguồn mở, không khóa dữ liệu vào định dạng độc quyền; **(bốn)** tuân thủ Khung kiến trúc số Thành phố Hà Nội 1.0, chịu thẩm định của Sở Khoa học và Công nghệ.

### 2.5. Giả định và phụ thuộc

| # | Giả định / phụ thuộc | Ảnh hưởng nếu không đúng như giả định |
|---|---|---|
| GĐ-PT-01 | Bộ VHTTDL sẽ công bố đặc tả kỹ thuật kết nối Cơ sở dữ liệu quốc gia về di sản văn hóa trong tương lai gần | Yêu cầu YC-CN-11.2 (mục 3.1) chỉ ở trạng thái "sẵn sàng"; nếu đặc tả thay đổi lớn so với giả định, lớp ánh xạ (mục 6, ADR liên quan) có thể cần điều chỉnh nhưng không phải thiết kế lại lõi hệ thống |
| GĐ-PT-02 | Trung tâm cung cấp được dữ liệu hiện trạng (số kiểm kê, hồ sơ hiện vật gốc) để đối chiếu khi nhập liệu ban đầu | Nếu dữ liệu nguồn không đầy đủ, tỷ lệ trường phải gán mã khuyết giá trị `CHUA_NHAP`/`CHUA_XAC_DINH` ở đợt nhập đầu tăng cao, ảnh hưởng chỉ số MT-02 |
| GĐ-PT-03 | Cơ quan có thẩm quyền phê duyệt hồ sơ đề xuất cấp độ an toàn hệ thống thông tin ở mức cấp độ 2 như kiến nghị tại `01-thuyet-minh-ky-thuat.md` mục 9.1 | Nếu phê duyệt ở cấp độ 3, các yêu cầu phi chức năng nhóm an toàn thông tin (mục 3.4) cần rà soát bổ sung thủ tục — kiến trúc đã thiết kế theo mức cấp độ 3 nên không phát sinh thay đổi kỹ thuật lớn |
| GĐ-PT-04 | Hạ tầng mạng nội bộ/mạng chuyên dùng đáp ứng băng thông tối thiểu để phục vụ ≥ 50 người dùng đồng thời (YC-PCN-05) | Nếu hạ tầng mạng không đáp ứng, chỉ tiêu hiệu năng YC-PCN-01…03 có thể không đạt dù phần mềm đúng thiết kế — trách nhiệm hạ tầng mạng thuộc bên vận hành, xem `01-thuyet-minh-ky-thuat.md` Chương 10 |
| GĐ-PT-05 | Luật An ninh mạng số 116/2025/QH15 có hiệu lực 01/7/2026 sẽ có văn bản hướng dẫn thay thế Nghị định 85/2016/NĐ-CP và Thông tư 12/2022/TT-BTTTT trước hoặc trong quá trình triển khai | Yêu cầu về hồ sơ đề xuất cấp độ an toàn (YC-PCN-24, mục 3.4) cần cập nhật theo văn bản hướng dẫn mới khi được ban hành — *(cần đối chiếu nguyên văn trước khi nộp, đã nêu tại `01-thuyet-minh-ky-thuat.md` mục 9.1)* |

---

## 3. Yêu cầu cụ thể

### 3.1. Yêu cầu chức năng

Quy ước đọc bảng: **Ưu tiên** dùng ba mức theo yêu cầu của chủ đầu tư — **Bắt buộc** (nghiệm thu Giai đoạn 1, tương ứng GĐ = 1 ở tài liệu 01), **Nên có** (đã cam kết trong lộ trình nhưng thuộc Giai đoạn 2 hoặc thành phần nội dung của một yêu cầu hỗn hợp), **Có thì tốt** (không nằm trong cam kết lộ trình, chỉ nêu định hướng). **Nguồn gốc** trích mã yêu cầu gốc tại `01-thuyet-minh-ky-thuat.md` Chương 4, cộng căn cứ pháp lý hoặc số hiệu ADR khi áp dụng trực tiếp.

#### 3.1.1. YC-CN-01 — Danh mục và sổ đăng ký dữ liệu số hóa

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-01.1 | Hệ thống PHẢI cho phép lập và quản lý sổ đăng ký đối tượng di sản theo năm loại: khuôn viên và không gian, công trình kiến trúc, hiện vật, tài liệu và di sản tư liệu, tư liệu nghe nhìn | Bắt buộc | Tạo được bản ghi ở cả 5 loại; mỗi bản ghi được cấp mã định danh bền vững tầng 1 dạng `VM-<OC>-<NNNNN>`; mã không bao giờ được cấp lại kể cả khi bản ghi bị thu hồi | CN-01.1; [ADR-0004](adr/0004-he-thong-ma-dinh-danh-5-tang.md), [ADR-0009](adr/0009-danh-sach-doi-tuong-tu-physical-objects.md) |
| YC-CN-01.2 | Hệ thống PHẢI cho phép lập và quản lý sổ đăng ký bản ghi dữ liệu số theo tám dạng: mô hình 3D, gaussian splat, đám mây điểm, bản vẽ kỹ thuật, ảnh số, văn bản số, video, âm thanh | Bắt buộc | Một đối tượng có thể có nhiều bản ghi dữ liệu số thuộc nhiều dạng khác nhau; mã tầng 2 dạng `…-<NNNNN>.<DF><nn>` phân biệt được các đợt số hóa cùng dạng | CN-01.2; [ADR-0003](adr/0003-tach-truc-objectclass-va-digitalform.md), [ADR-0004](adr/0004-he-thong-ma-dinh-danh-5-tang.md) |
| YC-CN-01.3 | Hệ thống PHẢI neo bản ghi số với hồ sơ hiện vật gốc qua các trường riêng `so_kiem_ke`, `so_dang_ky`, `ma_ho_so_di_tich`, `pid_quoc_gia`, không trộn vào mã hệ thống | Bắt buộc | Bắt buộc có giá trị hoặc mã khuyết giá trị kèm lý do với nhóm hiện vật và tài liệu; xuất được báo cáo đối chiếu mã số nội bộ ↔ số kiểm kê | CN-01.3; Điều 23 Luật Di sản văn hóa 45/2024/QH15 |
| YC-CN-01.4 | Hệ thống PHẢI hiển thị hồ sơ đối tượng di sản 360° gom toàn bộ bản đại diện số, tư liệu liên quan, lịch sử can thiệp, thuyết minh về một trang duy nhất | Bắt buộc | Mở hồ sơ Khuê Văn Các thấy đủ mô hình 3D, gaussian splat, đám mây điểm, bản vẽ, ảnh tư liệu và các tư liệu nhắc tới công trình, phân nhóm theo quan hệ | CN-01.4; [ADR-0001](adr/0001-kien-truc-thong-tin-theo-ban-thiet-ke-v3.md) |
| YC-CN-01.5 | Hệ thống PHẢI ghi nhận xếp hạng và danh hiệu của đối tượng (di tích quốc gia đặc biệt, bảo vật quốc gia, ghi danh UNESCO) như trường có cấu trúc | Bắt buộc | Trường xếp hạng có nguồn dẫn là số hiệu và ngày văn bản; bộ lọc theo danh hiệu hoạt động | CN-01.5 |
| YC-CN-01.6 | Hệ thống PHẢI dùng trạng thái "đã gỡ, thu hồi" thay cho xóa vĩnh viễn | Bắt buộc | Bản ghi bị gỡ vẫn giữ mã, giữ lịch sử, có lý do gỡ; không xuất hiện trên kênh công khai | CN-01.6; [ADR-0004](adr/0004-he-thong-ma-dinh-danh-5-tang.md) |

#### 3.1.2. YC-CN-02 — Siêu dữ liệu

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-02.1 | Hệ thống PHẢI dùng bộ trường lõi ánh xạ được sang Dublin Core theo TCVN 7980-1:2024 | Bắt buộc | Xuất một bản ghi ra định dạng Dublin Core hợp lệ; bảng ánh xạ đầy đủ tại Phụ lục PL3 tài liệu 01 | CN-02.1; TCVN 7980-1:2024 |
| YC-CN-02.2 | Hệ thống PHẢI có bộ trường mở rộng riêng theo từng dạng dữ liệu số (tham số quét 3D, tham số huấn luyện splat, thông số quét ảnh, mã hóa video, âm thanh) | Bắt buộc | Form nhập đổi trường theo dạng dữ liệu; trường bắt buộc của từng dạng được kiểm tra khi lưu | CN-02.2 |
| YC-CN-02.3 | Hệ thống PHẢI hỗ trợ tư liệu Hán Nôm ba lớp: nguyên văn chữ Hán/Nôm dạng Unicode, phiên âm Hán Việt, dịch nghĩa tiếng Việt, ghi rõ người dịch và người thẩm định | Bắt buộc | Nhập và hiển thị được cả ba lớp; không cho phép chuyển sang bước duyệt nếu thiếu lớp bắt buộc; hiển thị đúng chữ Hán Nôm trên trình duyệt chuẩn | CN-02.3 |
| YC-CN-02.4 | Hệ thống PHẢI lưu niên đại hai lớp: giá trị chuẩn hóa theo EDTF dùng để lọc và sắp xếp, cộng chuỗi hiển thị giữ nguyên can chi, niên hiệu, cộng mức độ tin cậy | Bắt buộc | Lọc theo khoảng năm cho kết quả đúng với các giá trị `1484`, `1484?`, `1484~`, `18XX`, `1740/1786`; chuỗi hiển thị không bị hệ thống tự sửa | CN-02.4; [ADR-0006](adr/0006-nien-dai-hai-lop-edtf.md) |
| YC-CN-02.5 | Hệ thống PHẢI dùng bộ từ vựng kiểm soát thay cho thẻ tự do, ánh xạ tới Getty AAT, TGN và Iconclass | Bắt buộc | Không cho nhập giá trị ngoài từ vựng ở các trường có kiểm soát; quản trị thêm mới có kiểm duyệt | CN-02.5 |
| YC-CN-02.6 | Hệ thống PHẢI dùng bộ mã khuyết giá trị `KHONG_AP_DUNG`, `CHUA_XAC_DINH`, `KHONG_RO`, `CHUA_NHAP`, `HAN_CHE`; mỗi lần dùng `CHUA_XAC_DINH` hoặc `KHONG_RO` PHẢI kèm ghi chú nguồn tra cứu | Bắt buộc | Không lưu được bản ghi có trường bắt buộc bỏ trống; giao diện hiển thị "— Chưa xác định" thay vì ô trắng; nhập lô tự gán ô trống thành `CHUA_NHAP` và báo cáo số ô đã gán | CN-02.6; [ADR-0005](adr/0005-bo-5-ma-khuyet-gia-tri.md) |
| YC-CN-02.7 | Hệ thống PHẢI tính chỉ số phần trăm độ đầy đủ hồ sơ đúng: loại `KHONG_AP_DUNG` khỏi mẫu số, tính `KHONG_RO` và `HAN_CHE` là đã xử lý, tính `CHUA_XAC_DINH` và `CHUA_NHAP` là còn thiếu | Bắt buộc | Chỉ số hiển thị trên màn Báo cáo và màn Kiểm kê; kiểm chứng bằng một bộ mẫu tính tay | CN-02.7; [ADR-0016](adr/0016-averagecompletenesspct-tra-null-cho-tap-rong.md) |
| YC-CN-02.8 | Hệ thống PHẢI có cấu trúc dữ liệu đa ngữ ở tầng dữ liệu cho tiêu đề, mô tả, thuyết minh | Bắt buộc (khung dữ liệu); Nên có (nội dung tiếng Anh đầy đủ — Giai đoạn 2) | Cấu trúc dữ liệu có sẵn khóa ngôn ngữ; nhập tiếng Anh không phải đổi lược đồ | CN-02.8; [ADR-0015](adr/0015-i18n-tach-lop.md) |

#### 3.1.3. YC-CN-03 — Nhập dữ liệu và kiểm soát chất lượng đầu vào

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-03.1 | Hệ thống PHẢI hỗ trợ tải lên đơn lẻ, kéo thả nhiều tệp, hiển thị tiến trình từng tệp, tiếp tục được khi mạng gián đoạn | Bắt buộc | Tải tệp ≥ 5 GB thành công; ngắt mạng giữa chừng và tiếp tục không phải tải lại từ đầu | CN-03.1 |
| YC-CN-03.2 | Hệ thống PHẢI hỗ trợ nhập theo lô bằng tệp Excel kèm mẫu tải về, ghép tệp với dòng siêu dữ liệu theo mã bản ghi | Bắt buộc | Xem trước hiển thị đúng số dòng hợp lệ, số dòng lỗi, số ô tự gán mã khuyết; số tệp đã chọn khớp số dòng báo cáo | CN-03.2 |
| YC-CN-03.3 | Hệ thống PHẢI kiểm tra chất lượng tự động tại điểm vào: định dạng, độ phân giải, độ sâu màu, kích thước tối thiểu theo từng dạng dữ liệu | Bắt buộc | Tệp không đạt bị chặn kèm thông báo nêu rõ tiêu chí không đạt; ví dụ ảnh tư liệu dưới ngưỡng dpi bị từ chối | CN-03.3 |
| YC-CN-03.4 | Hệ thống PHẢI tính checksum SHA-256 ngay khi nhận tệp, lưu cùng thời điểm, thiết bị và người thực hiện thành một sự kiện PREMIS | Bắt buộc | Mỗi tệp có giá trị SHA-256 hiển thị trên hồ sơ; tải lại tệp và đối chiếu cho kết quả trùng khớp | CN-03.4 |
| YC-CN-03.5 | Hệ thống PHẢI chuyển bản ghi sang trạng thái "cần số hóa lại" khi không đạt kiểm tra chất lượng, đưa lại vào hàng đợi kèm lý do | Bắt buộc | Chuyển trạng thái và hiển thị trong hàng đợi việc cần làm | CN-03.5 |
| YC-CN-03.6 | Hệ thống PHẢI vô hiệu hóa công thức động và liên kết ngoài trong tệp Excel nhập vào, quét mã độc trước khi đưa vào kho | Bắt buộc | Bảng xem trước hiển thị dòng trạng thái đã quét; tệp Excel có công thức chỉ nhập giá trị tĩnh | CN-03.6 |
| YC-CN-03.7 | Hệ thống PHẢI cảnh báo khi tổng dung lượng hàng đợi cộng dung lượng đã dùng vượt ngưỡng cấu hình | Bắt buộc | Hiện cảnh báo tại ngưỡng cấu hình được, mặc định 90% hạn mức | CN-03.7 |
| YC-CN-03.8 | Hệ thống PHẢI yêu cầu xác nhận trước khi xóa khỏi hàng đợi với tệp đã xử lý một phần | Bắt buộc | Hộp thoại xác nhận xuất hiện đúng điều kiện; tệp lỗi xóa thẳng không cần xác nhận | CN-03.8 |

#### 3.1.4. YC-CN-04 — Tìm kiếm và khai thác

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-04.1 | Hệ thống PHẢI hỗ trợ tìm kiếm cơ bản không phân biệt dấu theo cả hai chiều và không phân biệt hoa thường | Bắt buộc | Gõ `khue van cac` và gõ `Khuê Văn Các` đều trả về cùng tập kết quả | CN-04.1 |
| YC-CN-04.2 | Hệ thống PHẢI tìm trên tối thiểu tám trường: tên, mã, mô tả, bộ sưu tập, vị trí, người phụ trách, niên đại, định dạng | Bắt buộc | Gõ "Hán Nôm", "Vườn bia", tên cán bộ đều ra kết quả | CN-04.2 |
| YC-CN-04.3 | Hệ thống PHẢI chấp nhận ở ô tìm kiếm cả mã đầy đủ lẫn mã rút gọn, bỏ qua dấu `-` và `.` | Bắt buộc | Gõ `vmct00007` tìm được `VM-CT-00007` | CN-04.3; [ADR-0004](adr/0004-he-thong-ma-dinh-danh-5-tang.md) |
| YC-CN-04.4 | Hệ thống PHẢI hỗ trợ tìm kiếm nâng cao: lọc kết hợp theo loại đối tượng, dạng dữ liệu, trạng thái, bộ sưu tập, khoảng niên đại, mức truy cập, người phụ trách | Bắt buộc | Áp đồng thời ≥ 4 điều kiện cho kết quả đúng; hiển thị chip điều kiện đang áp dụng và nút xóa từng chip | CN-04.4; [ADR-0003](adr/0003-tach-truc-objectclass-va-digitalform.md) |
| YC-CN-04.5 | Hệ thống PHẢI cho phép lưu bộ lọc thành truy vấn dùng lại và chia sẻ được trong nội bộ | Bắt buộc | Lưu, đặt tên, mở lại cho kết quả nhất quán | CN-04.5 |
| YC-CN-04.6 | Hệ thống PHẢI hỗ trợ tìm theo can chi ↔ dương lịch: nhập "Nhâm Tuất" tìm được các bản ghi năm tương ứng và ngược lại | Bắt buộc | Bảng quy đổi can chi tích hợp; kiểm chứng bằng ≥ 5 khoa thi có bia | CN-04.6 |
| YC-CN-04.7 | Hệ thống PHẢI hỗ trợ tìm toàn văn nội dung tư liệu đã nhập ba lớp Hán Nôm | Bắt buộc | Tìm được cụm từ trong phần dịch nghĩa và phần phiên âm | CN-04.7 |
| YC-CN-04.8 | Hệ thống NÊN hỗ trợ tìm toàn văn trên kết quả nhận dạng ký tự Hán Nôm (OCR/HTR) | Nên có (Giai đoạn 2) | Không quy định ở Giai đoạn 1 | CN-04.8 |
| YC-CN-04.9 | Hệ thống PHẢI cho phép xuất kết quả tìm kiếm ra Excel kèm cột siêu dữ liệu đã chọn | Bắt buộc | Tệp xuất mở được, số dòng khớp số kết quả | CN-04.9 |

#### 3.1.5. YC-CN-05 — Quy trình duyệt và xuất bản

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-05.1 | Hệ thống PHẢI thực hiện quy trình ba cấp: chuyên viên trình → thẩm định nội dung chuyên môn → lãnh đạo duyệt xuất bản | Bắt buộc | Chuyển trạng thái đúng thứ tự; không bỏ qua bước | CN-05.1 |
| YC-CN-05.2 | Hệ thống PHẢI áp dụng nguyên tắc bốn mắt: chặn khi người duyệt trùng người phụ trách hoặc người tải lên bản ghi | Bắt buộc | Nút duyệt bị vô hiệu hóa kèm giải thích khi trùng người; thử nghiệm với tài khoản cụ thể | CN-05.2; [ADR-0011](adr/0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md) |
| YC-CN-05.3 | Hệ thống PHẢI cung cấp đầy đủ các hành động Duyệt, Trả lại bổ sung, Từ chối, Gỡ xuất bản; trả lại và từ chối bắt buộc nhập lý do | Bắt buộc | Bấm Trả lại bổ sung phải nhập lý do mới lưu được; bản ghi quay về đúng người phụ trách kèm thông báo | CN-05.3 |
| YC-CN-05.4 | Hệ thống PHẢI thực hiện song thẩm với tư liệu Hán Nôm: người dịch và người thẩm định phải là hai tài khoản khác nhau | Bắt buộc | Không cho phép cùng một tài khoản đảm nhiệm cả hai vai trên một bản ghi | CN-05.4 |
| YC-CN-05.5 | Hệ thống PHẢI ký số khi xuất bản, gắn với người xuất bản và thời điểm | Bắt buộc | Bản ghi đã xuất bản hiển thị dấu hiệu đã ký số kèm tên và thời điểm; kiểm tra được tính toàn vẹn | CN-05.5; Điều 12 Luật Giao dịch điện tử 20/2023/QH15; Chương II Nghị định 137/2024/NĐ-CP |
| YC-CN-05.6 | Hệ thống PHẢI có bước xin ý kiến bằng văn bản của Bộ VHTTDL trong quy trình chuyển đổi văn bản giấy sang thông điệp dữ liệu đối với di tích quốc gia đặc biệt | Bắt buộc | Quy trình có bước riêng ghi nhận số văn bản, ngày, nội dung ý kiến; bản ghi không xuất bản được khi bước này chưa hoàn thành và thuộc diện bắt buộc | CN-05.6; Điều 87 Nghị định 308/2025/NĐ-CP |
| YC-CN-05.7 | Hệ thống PHẢI hỗ trợ kiểm duyệt nội dung trước khi đưa lên môi trường mạng, có lưu vết người kiểm duyệt | Bắt buộc | Nhật ký ghi rõ ai kiểm duyệt, thời điểm, kết quả | CN-05.7; Điều 89 Nghị định 308/2025/NĐ-CP |
| YC-CN-05.8 | Hệ thống PHẢI có hàng đợi việc cần làm theo vai trò, có hạn xử lý và cảnh báo quá hạn | Bắt buộc | Hiển thị số việc chờ và số việc quá hạn đúng thực tế dữ liệu | CN-05.8 |

#### 3.1.6. YC-CN-06 — Phiên bản và toàn vẹn dữ liệu

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-06.1 | Hệ thống PHẢI giữ bản gốc bất biến: không cho phép ghi đè hoặc xóa bản gốc đã qua kiểm tra chất lượng | Bắt buộc | Thử ghi đè bị từ chối; mọi lần số hóa lại hoặc hiệu đính sinh phiên bản mới `….v<n>` | CN-06.1; nguyên tắc kiến trúc #4 (`08-mo-ta-kien-truc.md` mục 7) |
| YC-CN-06.2 | Hệ thống PHẢI lưu lịch sử phiên bản đầy đủ: ai sửa, khi nào, vì sao; so sánh hai phiên bản; khôi phục về phiên bản trước | Bắt buộc | Mở tab phiên bản thấy đủ lịch sử; khôi phục tạo phiên bản mới chứ không xóa lịch sử | CN-06.2; [ADR-0010](adr/0010-hoan-tac-hai-tang.md) |
| YC-CN-06.3 | Hệ thống PHẢI kiểm tra toàn vẹn định kỳ, đối chiếu lại SHA-256, ghi kết quả thành sự kiện PREMIS, cảnh báo khi phát hiện sai khác | Bắt buộc | Chạy được theo lịch và chạy được theo yêu cầu; báo cáo tỷ lệ tệp hợp lệ; mô phỏng một tệp hỏng thì hệ thống phát hiện và cảnh báo | CN-06.3 |
| YC-CN-06.4 | Hệ thống PHẢI ghi nhận ký hiệu riêng xác nhận đã chuyển đổi và chữ ký số của cơ quan chuyển đổi đối với bản số hóa từ văn bản giấy | Bắt buộc | Bản số hóa hiển thị đủ hai dấu hiệu theo Điều 12 Luật 20/2023/QH15 | CN-06.4; Điều 12 Luật Giao dịch điện tử 20/2023/QH15 |
| YC-CN-06.5 | Hệ thống PHẢI quản lý bốn vai trò tệp dẫn xuất `master`, `web`, `raw`, `thumb` theo mã tầng 4 | Bắt buộc | Bảng tệp phân biệt rõ vai trò; tải xuống chọn được bản gốc hoặc bản phổ biến theo quyền | CN-06.5; [ADR-0004](adr/0004-he-thong-ma-dinh-danh-5-tang.md), [ADR-0008](adr/0008-tach-haspreservationsurrogate-khoi-derivedfrom.md) |
| YC-CN-06.6 | Hệ thống PHẢI ghi nhật ký ở mức trường: trường nào bị sửa, giá trị cũ và mới | Bắt buộc | Xem được lịch sử thay đổi của một trường siêu dữ liệu cụ thể | CN-06.6; [ADR-0012](adr/0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md) |

#### 3.1.7. YC-CN-07 — Bộ sưu tập, phân loại, quyền sử dụng và mức truy cập

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-07.1 | Hệ thống PHẢI cho phép tạo, sửa bộ sưu tập; một bản ghi thuộc nhiều bộ sưu tập; bộ sưu tập có người phụ trách | Bắt buộc | Số lượng và dung lượng hiển thị trên thẻ bộ sưu tập bằng đúng số bản ghi mở ra bên trong | CN-07.1 |
| YC-CN-07.2 | Hệ thống PHẢI có phát biểu quyền theo từng bản ghi dựa trên khung RightsStatements.org, kèm ghi chú nguồn gốc pháp lý | Bắt buộc | Trường bắt buộc; không xuất bản được nếu chưa có phát biểu quyền | CN-07.2 |
| YC-CN-07.3 | Hệ thống PHẢI phân loại mức truy cập ba bậc: công khai, phục vụ nghiên cứu có điều kiện, nội bộ | Bắt buộc | Bản ghi mức nội bộ không xuất hiện trên kênh công khai và trên API dữ liệu mở | CN-07.3 |
| YC-CN-07.4 | Hệ thống PHẢI đánh dấu dữ liệu hạn chế công bố bằng mã khuyết giá trị `HAN_CHE` cho từng trường | Bắt buộc | Trường gắn `HAN_CHE` bị loại khỏi phản hồi API công khai nhưng vẫn trả về trên API nội bộ | CN-07.4; Điều 88 Luật Di sản văn hóa 45/2024/QH15; [ADR-0005](adr/0005-bo-5-ma-khuyet-gia-tri.md) |
| YC-CN-07.5 | Hệ thống PHẢI cho phép đánh dấu bản ghi có chứa dữ liệu cá nhân (ảnh chân dung, gia phả, tài liệu nêu tên người còn sống) | Bắt buộc | Bản ghi có dấu hiệu này phải qua bước rà soát che thông tin trước khi công khai | CN-07.5; Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 |
| YC-CN-07.6 | Hệ thống PHẢI chống tải xuống trái phép dữ liệu 3D giá trị cao: bản xem trước có đóng dấu chìm động, liên kết tải có thời hạn, ghi nhật ký từng lượt tải bản gốc | Bắt buộc | Liên kết hết hạn không dùng lại được; nhật ký ghi rõ người tải, bản tải, thời điểm | CN-07.6; Điều 86 khoản 4 Nghị định 308/2025/NĐ-CP |

#### 3.1.8. YC-CN-08 — Báo cáo và thống kê

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-08.1 | Hệ thống PHẢI cung cấp bộ báo cáo định kỳ: tiến độ số hóa theo tháng, cơ cấu theo loại đối tượng và dạng dữ liệu, tồn đọng theo phòng và theo người, lượt khai thác qua API | Bắt buộc | Bốn biểu đồ hiển thị đúng dữ liệu; đổi khoảng thời gian thì số liệu đổi theo | CN-08.1 |
| YC-CN-08.2 | Hệ thống PHẢI cung cấp báo cáo độ đầy đủ hồ sơ và chất lượng dữ liệu theo bộ mã khuyết giá trị | Bắt buộc | Hiển thị tỷ lệ phần trăm và danh sách bản ghi cần bổ sung, tách riêng "chưa nhập" với "chưa xác định" | CN-08.2; [ADR-0016](adr/0016-averagecompletenesspct-tra-null-cho-tap-rong.md) |
| YC-CN-08.3 | Hệ thống PHẢI cung cấp báo cáo bảo quản số: tỷ lệ tệp có checksum hợp lệ, tuổi bản sao lưu mới nhất, lần diễn tập phục hồi gần nhất | Bắt buộc | Ba chỉ số hiển thị trên màn báo cáo và khớp với dữ liệu vận hành | CN-08.3 |
| YC-CN-08.4 | Hệ thống PHẢI xuất báo cáo ra Excel và PDF có logo, tiêu đề đơn vị, kỳ báo cáo, chỗ ký của lãnh đạo | Bắt buộc | Tệp xuất mở được, định dạng đúng mẫu, số liệu khớp màn hình | CN-08.4 |
| YC-CN-08.5 | Hệ thống PHẢI hỗ trợ báo cáo động: người dùng tự chọn trường, điều kiện lọc và cách nhóm | Bắt buộc | Tạo được một báo cáo mới không cần can thiệp của nhà thầu | CN-08.5 |
| YC-CN-08.6 | Hệ thống PHẢI xuất được bộ số liệu phục vụ chế độ thông tin báo cáo lên Sở Văn hóa và Thể thao theo biểu mẫu do Trung tâm cung cấp | Bắt buộc | Xuất được bộ số liệu theo biểu mẫu do Trung tâm cung cấp | CN-08.6; Điều 33 Luật Di sản văn hóa 45/2024/QH15 |

#### 3.1.9. YC-CN-09 — Kiểm kê định kỳ

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-09.1 | Hệ thống PHẢI cho phép lập đợt kiểm kê có kỳ hạn, phạm vi, danh sách phân công | Bắt buộc | Tạo đợt, gán người, theo dõi tiến độ theo phần trăm | CN-09.1 |
| YC-CN-09.2 | Hệ thống PHẢI đối chiếu số kiểm kê hiện vật gốc với bản ghi dữ liệu số, phát hiện ba loại lệch: hiện vật chưa có dữ liệu số, dữ liệu số chưa neo hiện vật, sai lệch thông tin | Bắt buộc | Xuất được danh sách ba loại lệch | CN-09.2; Điều 23 Luật Di sản văn hóa 45/2024/QH15 |
| YC-CN-09.3 | Hệ thống PHẢI ghi nhận kết quả kiểm kê, lập biên bản và xuất báo cáo gửi cơ quan chủ quản | Bắt buộc | Biên bản xuất ra PDF có đủ thành phần ký | CN-09.3 |
| YC-CN-09.4 | Hệ thống PHẢI cho phép đánh dấu bản ghi cần số hóa lại khi hiện vật đã trùng tu hoặc thay đổi hiện trạng | Bắt buộc | Chuyển trạng thái và đưa vào kế hoạch đợt số hóa kế tiếp | CN-09.4; [ADR-0010](adr/0010-hoan-tac-hai-tang.md) |

#### 3.1.10. YC-CN-10 — Quản lý đợt số hóa, nhà thầu và thiết bị

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-10.1 | Hệ thống PHẢI quản lý đợt số hóa theo mã tầng 5 `VM-DS-<YYYY>-<nn>`: phạm vi, khối lượng cam kết, tiến độ, nghiệm thu | Bắt buộc | Mở một đợt thấy toàn bộ bản ghi sinh ra từ đợt đó và tiến độ theo phần trăm | CN-10.1; [ADR-0004](adr/0004-he-thong-ma-dinh-danh-5-tang.md) |
| YC-CN-10.2 | Hệ thống PHẢI gắn đợt số hóa với nhà thầu, hợp đồng, phụ lục nghiệm thu | Bắt buộc | Truy được từ một bản ghi dữ liệu số ngược về hợp đồng và biên bản nghiệm thu | CN-10.2 |
| YC-CN-10.3 | Hệ thống PHẢI quản lý thiết bị quét và lịch hiệu chuẩn: chủng loại, số hiệu, ngày hiệu chuẩn gần nhất, hạn hiệu chuẩn | Bắt buộc | Cảnh báo khi thiết bị quá hạn hiệu chuẩn được dùng để tạo dữ liệu mới | CN-10.3 |
| YC-CN-10.4 | Hệ thống PHẢI lưu tham số kỹ thuật của đợt quét làm bằng chứng chất lượng: độ phân giải bề mặt, sai số căn chỉnh, số ảnh đầu vào, phần mềm và phiên bản thuật toán | Bắt buộc | Các trường này hiển thị trên hồ sơ bản ghi và xuất được trong báo cáo nghiệm thu | CN-10.4 |
| YC-CN-10.5 | Hệ thống PHẢI hỗ trợ nghiệm thu theo đợt: đối chiếu khối lượng cam kết với khối lượng đạt kiểm tra chất lượng | Bắt buộc | Báo cáo nghiệm thu tự sinh, nêu rõ số bản ghi đạt, không đạt và lý do | CN-10.5 |

#### 3.1.11. YC-CN-11 — Kết nối và chia sẻ dữ liệu

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-11.1 | Hệ thống PHẢI cung cấp dịch vụ chia sẻ dữ liệu dạng API để đăng ký kết nối qua nền tảng tích hợp, chia sẻ dữ liệu số của Thành phố Hà Nội | Bắt buộc | Có tài liệu mô tả API; gọi thử thành công từ môi trường kiểm thử; hồ sơ đăng ký dịch vụ đủ điều kiện nộp Sở KH&CN | CN-11.1; Điều 7 khoản 3 Quyết định 85/2025/QĐ-UBND; Điều 7 Nghị định 278/2025/NĐ-CP |
| YC-CN-11.2 | Hệ thống PHẢI sẵn sàng tích hợp, kết nối, liên thông với Cơ sở dữ liệu quốc gia về di sản văn hóa khi Bộ VHTTDL công bố đặc tả kết nối | Bắt buộc (sẵn sàng) | Lớp ánh xạ dữ liệu tách riêng, thay đổi đặc tả không phải sửa lõi hệ thống | CN-11.2; Điều 85 khoản 4 Luật 45/2024; Điều 86 khoản 4 Nghị định 308/2025/NĐ-CP |
| YC-CN-11.3 | Hệ thống PHẢI công khai dữ liệu mở: lập danh mục dữ liệu mở, gắn giấy phép sử dụng, công bố và gửi danh mục để tổng hợp, đăng trên Cổng dữ liệu quốc gia | Bắt buộc | Màn danh mục dữ liệu mở có đủ trường: bộ dữ liệu, phân loại công khai/có điều kiện/không công khai, giấy phép, kênh công bố, ngày gửi | CN-11.3; Điều 10 Nghị định 165/2025/NĐ-CP |
| YC-CN-11.4 | Hệ thống PHẢI quản lý yêu cầu chia sẻ dữ liệu của cơ quan, tổ chức: tiếp nhận, số văn bản đề nghị, người được giao, hạn xử lý, cảnh báo quá hạn, hành động Duyệt — Từ chối — Yêu cầu bổ sung, phạm vi và thời hạn hiệu lực, thu hồi quyền truy cập | Bắt buộc | Mỗi yêu cầu có hạn xử lý và trạng thái; thao tác duyệt, từ chối, thu hồi đều ghi nhật ký kèm lý do | CN-11.4 |
| YC-CN-11.5 | Hệ thống PHẢI phân tách đúng quan hệ hành chính: mục quan hệ với cơ quan chủ quản tách khỏi mục yêu cầu chia sẻ từ cơ quan, tổ chức ngoài | Bắt buộc | Giao diện không xếp cơ quan chủ quản vào nhóm "cơ quan khác" | CN-11.5 |
| YC-CN-11.6 | Hệ thống PHẢI quản lý khóa xác thực API: tên, phạm vi, ngày tạo, hạn dùng, lần dùng gần nhất, thu hồi có lý do; khóa mới hiển thị đầy đủ đúng một lần | Bắt buộc | Tạo, xem, thu hồi khóa; khóa hết hạn bị từ chối truy cập | CN-11.6 |
| YC-CN-11.7 | Hệ thống PHẢI giới hạn tốc độ gọi API theo đầu mối tiêu thụ; hiển thị danh sách bên tiêu thụ và lưu lượng | Bắt buộc | Vượt ngưỡng bị chặn và ghi nhật ký; xem được biểu đồ lưu lượng theo bên tiêu thụ | CN-11.7 |
| YC-CN-11.8 | Hệ thống PHẢI cam kết mức độ dịch vụ xử lý yêu cầu chia sẻ: tiếp nhận trong 01 ngày làm việc, phản hồi trong 05 ngày làm việc, dữ liệu mở phục vụ tự động ngay | Bắt buộc | Hệ thống đếm ngược và cảnh báo theo đúng ngưỡng cấu hình | CN-11.8 |
| YC-CN-11.9 | Hệ thống NÊN cung cấp giao thức OAI-PMH phục vụ thu hoạch siêu dữ liệu của thư viện, viện nghiên cứu | Nên có (Giai đoạn 2) | Bản ghi OAI-PMH mẫu hợp lệ (Phụ lục PL4 tài liệu 01) | CN-11.9 |
| YC-CN-11.10 | Hệ thống PHẢI yêu cầu xác nhận có nhập lý do và ghi nhật ký riêng khi tắt một kênh kết nối | Bắt buộc | Không tắt được chỉ bằng một thao tác; nhật ký ghi lý do và người thực hiện | CN-11.10; [ADR-0013](adr/0013-bien-chu-de-root-modal-qua-portal.md) |

#### 3.1.12. YC-CN-12 — Người dùng, phân quyền và nhật ký

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-12.1 | Hệ thống PHẢI bắt buộc màn đăng nhập, ưu tiên đăng nhập một lần bằng tài khoản cơ quan; xác thực hai yếu tố bắt buộc với vai trò Quản trị và Phê duyệt | Bắt buộc | Không truy cập được bất kỳ màn nghiệp vụ nào khi chưa có phiên hợp lệ | CN-12.1 |
| YC-CN-12.2 | Hệ thống PHẢI hỗ trợ vòng đời tài khoản đầy đủ: mời qua thư điện tử công vụ, kích hoạt có thời hạn, khóa, mở khóa, đặt lại mật khẩu, thu hồi quyền, hết hạn tài khoản | Bắt buộc | Thực hiện đủ các thao tác trên một tài khoản thử nghiệm | CN-12.2 |
| YC-CN-12.3 | Hệ thống PHẢI phân quyền theo vai trò kết hợp phạm vi dữ liệu: ma trận vai trò × phân hệ × quyền, cộng phạm vi bộ sưu tập hoặc khu vực | Bắt buộc | Người vai trò Chỉ xem không thấy nút thao tác; người có phạm vi giới hạn chỉ thấy dữ liệu trong phạm vi | CN-12.3 |
| YC-CN-12.4 | Hệ thống PHẢI hỗ trợ ủy quyền khi vắng mặt có thời hạn và ghi nhật ký | Bắt buộc | Ủy quyền tự hết hiệu lực đúng hạn | CN-12.4 |
| YC-CN-12.5 | Hệ thống PHẢI quản lý phiên đăng nhập: xem thiết bị đang đăng nhập, buộc đăng xuất; quản trị buộc đăng xuất phiên người khác kèm lý do | Bắt buộc | Buộc đăng xuất làm mất hiệu lực phiên ngay lập tức | CN-12.5 |
| YC-CN-12.6 | Hệ thống PHẢI cấu hình được chính sách mật khẩu và khóa tài khoản: độ dài, thành phần ký tự, thời hạn đổi, số lần sai trước khi khóa | Bắt buộc | Cấu hình có hiệu lực ngay với lần đăng nhập kế tiếp | CN-12.6 |
| YC-CN-12.7 | Hệ thống PHẢI ghi nhật ký chỉ ghi thêm, không sửa, không xóa, có chuỗi băm liên kết để phát hiện can thiệp; kể cả tài khoản quản trị cũng không xóa được | Bắt buộc | Thử sửa hoặc xóa một dòng nhật ký bị từ chối; kiểm tra chuỗi băm phát hiện được thay đổi | CN-12.7; Điều 13 Nghị định 278/2025/NĐ-CP; [ADR-0012](adr/0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md) |
| YC-CN-12.8 | Hệ thống PHẢI ghi nhật ký tối thiểu sáu trường: thời điểm, người thực hiện, hành động, đối tượng, địa chỉ IP, kết quả thành công hoặc thất bại | Bắt buộc | Đủ sáu trường; lọc theo từng trường | CN-12.8 |
| YC-CN-12.9 | Hệ thống PHẢI lọc nhật ký theo người, hành động, khoảng thời gian; tách riêng sự kiện an toàn thông tin; cảnh báo bất thường | Bắt buộc | Bộ lọc và cảnh báo hoạt động đúng trên dữ liệu thử | CN-12.9 |
| YC-CN-12.10 | Hệ thống PHẢI cho phép xuất nhật ký phục vụ thanh tra, kiểm tra; bản thân việc xuất cũng được ghi nhật ký | Bắt buộc | Tệp xuất hợp lệ; xuất hiện dòng nhật ký mới ghi nhận hành vi xuất | CN-12.10 |
| YC-CN-12.11 | Hệ thống PHẢI hiển thị chính sách thời hạn lưu nhật ký ngay trên giao diện, gắn với cấp độ an toàn hệ thống thông tin được phê duyệt | Bắt buộc | Nhãn chính sách khớp với hồ sơ cấp độ | CN-12.11; TCVN 11930:2017 |
| YC-CN-12.12 | Hệ thống PHẢI phân biệt rõ "người thực hiện" trên nhật ký với "cán bộ phụ trách" trên hồ sơ bản ghi | Bắt buộc | Hai nhãn khác nhau trên giao diện; ngày cập nhật của bản ghi khớp dòng nhật ký gần nhất | CN-12.12 |

#### 3.1.13. YC-CN-13 — Đa ngữ

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-13.1 | Hệ thống PHẢI tách toàn bộ chuỗi giao diện khỏi mã nguồn thành tệp tài nguyên ngôn ngữ | Bắt buộc | Thêm một ngôn ngữ mới không phải sửa mã giao diện | CN-13.1; [ADR-0015](adr/0015-i18n-tach-lop.md) |
| YC-CN-13.2 | Hệ thống PHẢI lưu siêu dữ liệu theo khóa ngôn ngữ, ghi nhận ngôn ngữ của từng giá trị theo ISO 639 | Bắt buộc (cấu trúc); Nên có (nội dung song ngữ đầy đủ — Giai đoạn 2) | Một bản ghi có tiêu đề tiếng Việt và tiếng Anh song song | CN-13.2; [ADR-0015](adr/0015-i18n-tach-lop.md) |
| YC-CN-13.3 | Hệ thống NÊN cung cấp giao diện tiếng Anh đầy đủ và nút chuyển ngôn ngữ | Nên có (Giai đoạn 2) | Không quy định ở Giai đoạn 1 | CN-13.3 |
| YC-CN-13.4 | Hệ thống NÊN có bản dịch tiếng Anh cho mô tả và thuyết minh của bản ghi công khai | Nên có (Giai đoạn 2) | Không quy định ở Giai đoạn 1 | CN-13.4 |

#### 3.1.14. YC-CN-14 — Sao lưu, phục hồi và quản trị hệ thống

*Chi tiết chính sách và quy trình vận hành nằm ở `02-quy-trinh-bao-quan-sao-luu.md`; bảng dưới đây chỉ đặc tả yêu cầu phần mềm.*

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-14.1 | Hệ thống PHẢI hỗ trợ sao lưu tự động theo lịch, sao lưu thủ công có hiển thị tiến trình và kết quả | Bắt buộc | Bấm sao lưu thủ công thấy tiến trình và thời điểm sao lưu gần nhất | CN-14.1 |
| YC-CN-14.2 | Hệ thống PHẢI hiển thị danh sách điểm khôi phục kèm trạng thái kiểm tra toàn vẹn | Bắt buộc | Mỗi điểm khôi phục có dung lượng, loại, trạng thái đã xác minh | CN-14.2 |
| YC-CN-14.3 | Hệ thống PHẢI có quy trình khôi phục nhiều bước, cảnh báo mất dữ liệu sau mốc thời gian và yêu cầu nhập chuỗi xác nhận | Bắt buộc | Không khôi phục được chỉ bằng một thao tác | CN-14.3 |
| YC-CN-14.4 | Hệ thống PHẢI có nhật ký riêng cho sao lưu và khôi phục, ghi cả lần chạy thất bại | Bắt buộc | Hiển thị lịch sử đầy đủ | CN-14.4 |
| YC-CN-14.5 | Hệ thống PHẢI cho phép cấu hình hệ thống: hạn mức dung lượng, ngưỡng cảnh báo, tham số kiểm tra chất lượng đầu vào, tần suất kiểm tra toàn vẹn | Bắt buộc | Đổi tham số có hiệu lực không cần can thiệp của nhà thầu | CN-14.5; PCN-15 |

#### 3.1.15. YC-CN-15 — Tuân thủ và quản trị dữ liệu

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-CN-15.1 | Hệ thống PHẢI có sổ đăng ký tuân thủ tám trường: văn bản, điều khoản, yêu cầu, trạng thái, chứng cứ, người chịu trách nhiệm, ngày rà soát, ngày rà soát kế tiếp | Bắt buộc | Không lưu được trạng thái "Đạt" khi ô chứng cứ trống — hệ thống tự hạ xuống "Chưa đối chiếu"; có trạng thái "Chờ văn bản hướng dẫn"; cảnh báo đỏ khi quá hạn rà soát; xuất PDF và Excel | CN-15.1 |
| YC-CN-15.2 | Hệ thống PHẢI có hồ sơ cấp độ an toàn hệ thống thông tin: cấp độ đề xuất, cấp phê duyệt, ngày phê duyệt, phương án bảo đảm, ngày rà soát lại | Bắt buộc | Hiển thị đủ trường; gắn với chính sách thời hạn lưu nhật ký | CN-15.2; Nghị định 85/2016/NĐ-CP; Thông tư 12/2022/TT-BTTTT |
| YC-CN-15.3 | Hệ thống PHẢI có hồ sơ đánh giá tác động xử lý dữ liệu cá nhân: trạng thái, mốc 60 ngày kể từ ngày đầu tiên xử lý, ngày gửi cơ quan chuyên trách, tệp đính kèm theo Mẫu số 10, nhắc cập nhật định kỳ | Bắt buộc | Đồng hồ đếm ngược tới mốc 60 ngày; cảnh báo khi còn dưới 15 ngày | CN-15.3; Điều 21 Luật 91/2025/QH15; Nghị định 356/2025/NĐ-CP |
| YC-CN-15.4 | Hệ thống PHẢI xử lý yêu cầu của chủ thể dữ liệu: tiếp nhận, đồng hồ 02 ngày làm việc để phản hồi và 10/15/20 ngày để thực hiện tùy loại yêu cầu, ghi nhận gia hạn | Bắt buộc | Bốn loại yêu cầu có ngưỡng thời gian khác nhau, cảnh báo trước hạn | CN-15.4; Nghị định 356/2025/NĐ-CP |
| YC-CN-15.5 | Hệ thống PHẢI quản lý sự cố và vi phạm dữ liệu: mốc 72 giờ kể từ khi phát hiện để thông báo cơ quan chuyên trách; lưu hồ sơ vi phạm tối thiểu 05 năm sau khi khắc phục | Bắt buộc | Đồng hồ 72 giờ chạy từ thời điểm phát hiện; hồ sơ không bị xóa trước hạn 05 năm | CN-15.5; Điều 23 Luật 91/2025/QH15 |
| YC-CN-15.6 | Hệ thống PHẢI hỗ trợ đánh giá rủi ro dữ liệu hằng năm | Bắt buộc | Có kỳ đánh giá, loại rủi ro, biện pháp, người ký | CN-15.6; Điều 15, Điều 17 Nghị định 165/2025/NĐ-CP |
| YC-CN-15.7 | Hệ thống PHẢI hỗ trợ kiểm toán và giám sát dữ liệu: đối chiếu tính đầy đủ, chính xác, kịp thời; lưu kết quả kiểm toán | Bắt buộc | Xuất được báo cáo kiểm toán kỳ | CN-15.7; Điều 13, Điều 14 Nghị định 278/2025/NĐ-CP |
| YC-CN-15.8 | Hệ thống PHẢI quản lý vòng đời và thời hạn lưu trữ theo loại dữ liệu | Bắt buộc | Mỗi loại dữ liệu có thời hạn lưu và lịch rà soát | CN-15.8; Điều 5 Nghị định 165/2025/NĐ-CP |
| YC-CN-15.9 | Hệ thống PHẢI hiển thị mốc tuân thủ 31/12/2026 như một hạn chót có đếm ngược | Bắt buộc | Mốc hiển thị trên màn tuân thủ | CN-15.9; Điều 24 Nghị định 278/2025/NĐ-CP |

### 3.2. Yêu cầu giao diện ngoài

Chi tiết kỹ thuật đầy đủ (schema, mã lỗi, ví dụ payload) nằm tại `06-dac-ta-api.md`; bảng dưới đây đặc tả ở mức yêu cầu, đủ để kiểm chứng khi nghiệm thu.

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-GD-01 | Giao diện người dùng PHẢI chạy đúng trên hai phiên bản mới nhất của Chrome, Edge, Firefox, Safari, không yêu cầu cài đặt phần mềm bổ trợ hay trình cắm | Bắt buộc | Kiểm thử thủ công trên bốn trình duyệt cho cùng kết quả hiển thị và thao tác | `01-thuyet-minh-ky-thuat.md` mục 5.4 |
| YC-GD-02 | Giao diện người dùng PHẢI hoạt động đúng bố cục từ độ rộng màn hình 1024 px trở lên, có điểm ngắt tại 1280 px và 1024 px | Bắt buộc | Máy chiếu hội trường ở độ phân giải 1024 px hiển thị đủ nội dung, không khóa cuộn trang | `01-thuyet-minh-ky-thuat.md` mục 5.4 |
| YC-GD-03 | Giao diện người dùng PHẢI đạt WCAG 2.1 mức AA: tương phản chữ thường tối thiểu 4,5:1, mọi chức năng thao tác được bằng bàn phím, hộp thoại có bẫy tiêu điểm và đóng bằng phím Esc, nút chỉ có biểu tượng có nhãn cho trình đọc màn hình | Bắt buộc | Kiểm thử trợ năng tự động và thủ công đạt tiêu chí AA; kế hoạch kiểm thử tại `01-thuyet-minh-ky-thuat.md` Chương 12 | `01-thuyet-minh-ky-thuat.md` mục 5.4 |
| YC-GD-04 | Giao diện người dùng PHẢI hiển thị đúng chữ Hán Nôm bằng phông chữ hỗ trợ khối Unicode mở rộng, nhúng cục bộ | Bắt buộc | Mở một tư liệu Hán Nôm trên máy trạm không cài phông bổ sung vẫn hiển thị đúng | `01-thuyet-minh-ky-thuat.md` mục 5.4 |
| YC-GD-05 | Hệ thống PHẢI cung cấp API REST nghiệp vụ dưới tiền tố `/api/v1`, định dạng JSON qua HTTPS, có đặc tả OpenAPI | Bắt buộc | Đặc tả OpenAPI hợp lệ; gọi thử endpoint mẫu thành công từ môi trường kiểm thử | `06-dac-ta-api.md` mục 1.1 |
| YC-GD-06 | Hệ thống NÊN cung cấp giao thức OAI-PMH tại `/oai` phục vụ gặt siêu dữ liệu mô tả dạng `oai_dc`, ánh xạ TCVN 7980-1:2024 | Nên có (Giai đoạn 2, tương ứng YC-CN-11.9) | Bản ghi OAI-PMH mẫu hợp lệ | `06-dac-ta-api.md` mục 1.1; CN-11.9 |
| YC-GD-07 | Hệ thống PHẢI cung cấp endpoint truyền tải nhị phân hỗ trợ HTTP Range để phát trực tiếp mô hình 3D (GLB) và dữ liệu không gian lớn theo mảnh, không tải nguyên khối | Bắt buộc | Trình xem tải được mô hình lớn theo từng phần; đo lưu lượng xác nhận không tải nguyên khối | `06-dac-ta-api.md` mục 1.1; PCN-04 |
| YC-GD-08 | Hệ thống PHẢI xác thực kết nối hệ thống chính phủ (LGSP, NDXP, CSDL Bộ VHTTDL) bằng OAuth2 client-credentials với token JWT ngắn hạn | Bắt buộc | Gọi API không token bị từ chối; token hết hạn (đề xuất ≤ 1 giờ) không dùng lại được | `06-dac-ta-api.md` mục 1.2 |
| YC-GD-09 | Hệ thống PHẢI hỗ trợ mTLS (chứng thư số hai chiều ở tầng gateway) cho toàn bộ request có nguồn gốc từ LGSP Thành phố | Bắt buộc | Request không có chứng thư hợp lệ bị từ chối ở tầng gateway | `06-dac-ta-api.md` mục 1.2; Điều 7 khoản 3 Quyết định 85/2025/QĐ-UBND |
| YC-GD-10 | Hệ thống PHẢI cấp API key có phạm vi (scope) và hạn dùng cho đối tác ngoài, hiển thị đầy đủ giá trị khóa đúng một lần khi tạo | Bắt buộc | Khóa hết hạn bị từ chối truy cập; không truy xuất lại được giá trị đầy đủ sau lần hiển thị đầu | `06-dac-ta-api.md` mục 1.2; CN-11.6 |
| YC-GD-11 | Hệ thống PHẢI ghi nhận, không tích hợp điều khiển trực tiếp, thông tin thiết bị quét (chủng loại, số hiệu, lịch hiệu chuẩn) do cán bộ nhập thủ công | Bắt buộc | Không có driver hay kết nối trực tiếp phần cứng máy quét; toàn bộ dữ liệu thiết bị nhập qua giao diện quản lý | CN-10.3 |
| YC-GD-12 | Hệ thống PHẢI xác thực người dùng nội bộ qua giao thức OpenID Connect, ưu tiên kết nối hệ thống định danh của cơ quan | Bắt buộc | Đăng nhập một lần thành công với tài khoản cơ quan thử nghiệm | `01-thuyet-minh-ky-thuat.md` mục 6.2, 9.2 |

### 3.3. Yêu cầu hiệu năng

Mười một chỉ tiêu dưới đây giữ nguyên chín mã gốc PCN-01…06 và bổ sung ba mã PCN-07…09 — vốn để trống ở tài liệu 01 (khoảng cách đánh số giữa PCN-06 và PCN-10) — để đưa các cam kết về tính sẵn sàng tại mục 5.3 tài liệu 01 vào đúng định dạng yêu cầu có mã, không còn là bảng rời không mã hoá.

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-PCN-01 | Hệ thống PHẢI phản hồi tra cứu, lọc danh sách trong ≤ 2 giây với kho 50.000 bản ghi ở mức 50 người dùng đồng thời | Bắt buộc | Kịch bản kiểm thử tải, báo cáo phân vị 95 | PCN-01 |
| YC-PCN-02 | Hệ thống PHẢI mở hồ sơ chi tiết một bản ghi trong ≤ 1,5 giây (chưa tính tải mô hình 3D) | Bắt buộc | Đo trên máy trạm nghiệm thu | PCN-02 |
| YC-PCN-03 | Hệ thống PHẢI hiển thị khung hình đầu tiên của mô hình 3D bản phổ biến web trong ≤ 5 giây trên đường truyền 20 Mbps | Bắt buộc | Đo trên máy trạm nghiệm thu | PCN-03 |
| YC-PCN-04 | Hệ thống PHẢI tải dữ liệu không gian lớn (gaussian splat, đám mây điểm) theo phân mảnh mức chi tiết, tải lũy tiến, không tải nguyên khối | Bắt buộc | Quan sát lưu lượng khi mở một cảnh lớn | PCN-04 |
| YC-PCN-05 | Hệ thống PHẢI phục vụ tối thiểu 50 người dùng nghiệp vụ đồng thời, thiết kế mở rộng tới 200 | Bắt buộc | Kiểm thử tải | PCN-05 |
| YC-PCN-06 | Hệ thống PHẢI hỗ trợ tải lên tệp đơn ≥ 5 GB, tải nhiều phần, tiếp tục được sau gián đoạn | Bắt buộc | Kiểm thử trực tiếp | PCN-06 |
| YC-PCN-07 | Hệ thống PHẢI đạt thời gian hoạt động ≥ 99,5% theo tháng trong giờ hành chính, không tính thời gian bảo trì đã thông báo trước tối thiểu 03 ngày làm việc | Bắt buộc | Đo bằng công cụ giám sát trong ≥ 1 tháng vận hành thử; báo cáo uptime | `01-thuyet-minh-ky-thuat.md` mục 5.3 |
| YC-PCN-08 | Hệ thống PHẢI đạt mục tiêu điểm khôi phục (RPO) ≤ 24 giờ | Bắt buộc | Diễn tập phục hồi đo được khoảng cách dữ liệu mất tối đa ≤ 24 giờ | `01-thuyet-minh-ky-thuat.md` mục 5.3 |
| YC-PCN-09 | Hệ thống PHẢI đạt mục tiêu thời gian khôi phục (RTO) ≤ 4 giờ, với diễn tập phục hồi tối thiểu 01 lần/năm có biên bản | Bắt buộc | Diễn tập đo thời gian khôi phục thực tế ≤ 4 giờ; có biên bản diễn tập | `01-thuyet-minh-ky-thuat.md` mục 5.3 |
| YC-PCN-16 | Hệ thống PHẢI thiết kế cho quy mô mục tiêu 50.000 bản ghi dữ liệu số và 20 TB dung lượng trong vòng đời 5 năm, mở rộng độc lập giữa lưu trữ tệp, cơ sở dữ liệu và chỉ mục tìm kiếm | Bắt buộc | Dự báo tăng trưởng dung lượng theo năm tính bằng công thức vật lý cho từng loại tệp (Phụ lục PL5 tài liệu 01), không ước lượng cảm tính | `01-thuyet-minh-ky-thuat.md` mục 5.2 |

### 3.4. Thuộc tính chất lượng theo ISO/IEC 25010:2023

Tám đặc tính chất lượng sản phẩm phần mềm theo ISO/IEC 25010:2023 đều có ít nhất một yêu cầu đo được. Đặc tính **hiệu năng (performance efficiency)** không lặp lại bảng — toàn bộ 10 yêu cầu tại mục 3.3 (YC-PCN-01…09, YC-PCN-16) chính là các yêu cầu đo được của đặc tính này.

**3.4.1. Tính phù hợp chức năng (functional suitability)**

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-PCN-17 | Hệ thống PHẢI hiện thực đầy đủ (tính đầy đủ chức năng) 100% yêu cầu mức Bắt buộc tại mục 3.1 (YC-CN-01…YC-CN-15) | Bắt buộc | Toàn bộ tiêu chí nghiệm thu tương ứng tại mục 3.1 đạt trong kiểm thử chấp nhận (UAT) | Tổng hợp YC-CN-01…15 |
| YC-PCN-18 | Hệ thống PHẢI tính đúng (tính chính xác chức năng) chỉ số phần trăm độ đầy đủ hồ sơ theo đúng công thức mẫu số đã loại trừ `KHONG_AP_DUNG` | Bắt buộc | Đối chiếu kết quả hệ thống với một bộ mẫu tính tay cho kết quả trùng khớp tuyệt đối | CN-02.7; `01-thuyet-minh-ky-thuat.md` mục 7.7 |
| YC-PCN-19 | Hệ thống KHÔNG ĐƯỢC tự động gán giá trị mặc định hoặc suy đoán cho trường thiếu thông tin (tính phù hợp chức năng — đúng bản chất nghiệp vụ di sản) | Bắt buộc | Rà soát mã nguồn và kiểm thử xác nhận không có giá trị mặc định theo bộ sưu tập gán tự động cho trường nghiệp vụ; mọi trường thiếu đều dừng ở mã khuyết giá trị tường minh | `01-thuyet-minh-ky-thuat.md` mục 5.7, quy tắc 3; [ADR-0016](adr/0016-averagecompletenesspct-tra-null-cho-tap-rong.md) |

**3.4.2. Hiệu năng (performance efficiency)** — xem mục 3.3.

**3.4.3. Tính tương thích (compatibility)**

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-PCN-20 | Hệ thống PHẢI trao đổi dữ liệu không mất mát với hệ thống bên ngoài qua ánh xạ chuẩn mở: Dublin Core/TCVN 7980, CIDOC-CRM, PREMIS | Bắt buộc | Xuất và nhập lại một bản ghi qua định dạng Dublin Core không mất trường bắt buộc | `01-thuyet-minh-ky-thuat.md` mục 7.5 |
| YC-PCN-21 | Hệ thống PHẢI cùng tồn tại (co-existence) trong hạ tầng dùng chung của Thành phố mà không xung đột tài nguyên hoặc định danh với hệ thống khác đã đăng ký qua LGSP | Bắt buộc | Đăng ký thành công dịch vụ chia sẻ trên môi trường kiểm thử của LGSP Thành phố, không phát sinh xung đột định danh dịch vụ | CN-11.1; Điều 7 khoản 3 Quyết định 85/2025/QĐ-UBND |

**3.4.4. Khả năng tương tác (interaction capability)**

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-PCN-22 | Hệ thống PHẢI bảo vệ người dùng khỏi thao tác sai (user error protection): xác nhận trước hành động không thể hoàn tác (xóa khỏi hàng đợi, khôi phục sao lưu, tắt kênh kết nối) | Bắt buộc | Không thao tác hủy hay khôi phục nào thực hiện được chỉ bằng một cú bấm; có bước xác nhận thứ hai | CN-03.8, CN-14.3, CN-11.10 |
| YC-PCN-23 | Hệ thống PHẢI dễ học (learnability): cán bộ nghiệp vụ hoàn thành được thao tác cốt lõi của vai trò sau khóa đào tạo theo kế hoạch chuyển giao | Bắt buộc | Bài kiểm tra thực hành sau đào tạo đạt ở mức đơn vị điền cụ thể theo Chương 13 tài liệu 01 | `01-thuyet-minh-ky-thuat.md` Chương 13 |
| — | *(Khả năng tiếp cận — accessibility, một tiểu đặc tính của interaction capability trong 25010:2023)* | — | — | Xem YC-GD-03 (WCAG 2.1 AA), mục 3.2 |

**3.4.5. Độ tin cậy (reliability)**

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-PCN-24 | Hệ thống PHẢI đạt tỷ lệ tệp có checksum hợp lệ ≥ 99,9% qua các lần kiểm tra toàn vẹn định kỳ (độ trưởng thành — maturity) | Bắt buộc | Báo cáo kiểm tra toàn vẹn định kỳ đạt ngưỡng ≥ 99,9% trong ba kỳ liên tiếp | MT-06; CN-06.3 |
| — | *(Tính sẵn sàng, khả năng chịu lỗi, khả năng phục hồi — availability, fault tolerance, recoverability)* | — | — | Xem YC-PCN-07…09 (mục 3.3) và YC-CN-03.1 (tải lên chịu lỗi mạng) |

**3.4.6. An toàn thông tin (security)**

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-PCN-25 | Hệ thống PHẢI mã hóa toàn bộ tệp gốc và cơ sở dữ liệu siêu dữ liệu khi lưu, thuật toán AES-256, khóa mã hóa quản lý tách biệt khỏi hạ tầng lưu trữ | Bắt buộc | Kiểm tra cấu hình xác nhận mã hóa tại chỗ (at rest) đang bật; quy trình luân chuyển khóa có tài liệu | `01-thuyet-minh-ky-thuat.md` mục 9.3 |
| YC-PCN-26 | Hệ thống PHẢI mã hóa mọi kết nối khi truyền bằng TLS phiên bản 1.2 trở lên; kênh tới LGSP dùng mTLS | Bắt buộc | Quét cấu hình TLS xác nhận không chấp nhận phiên bản dưới 1.2 | `01-thuyet-minh-ky-thuat.md` mục 9.3; YC-GD-09 |
| YC-PCN-27 | Hệ thống PHẢI kiểm soát truy cập ở tầng dịch vụ (không chỉ ẩn phần tử giao diện): RBAC kết hợp ABAC và nguyên tắc bốn mắt được thực thi tại API | Bắt buộc | Gọi trực tiếp API bằng tài khoản không đủ quyền hoặc vi phạm bốn mắt bị từ chối, kể cả khi không qua giao diện | CN-05.2, CN-12.3; [ADR-0011](adr/0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md) |
| YC-PCN-27.1 | Hệ thống PHẢI từ chối mọi cấu hình phân quyền vi phạm quy tắc phân tách nhiệm vụ, và PHẢI không cho phép cấp quyền sửa/xóa nhật ký hoạt động cho bất kỳ vai trò nào | Bắt buộc | Thử lưu một vai trò vừa có Tạo/Sửa vừa có Duyệt trên cùng phân hệ nội dung bị từ chối kèm lý do; không tồn tại đường cấu hình nào bật được quyền sửa/xóa nhật ký | [ADR-0017](adr/0017-ma-tran-phan-quyen-mot-nguon-va-quy-tac-phan-tach-nhiem-vu.md), [ADR-0012](adr/0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md) |
| YC-PCN-27.2 | Tài khoản tạo mới PHẢI ở trạng thái chờ phê duyệt và chỉ hoạt động sau khi một người dùng khác kích hoạt; mọi thay đổi phân quyền PHẢI ghi lý do vào lịch sử phân quyền | Bắt buộc | Tạo tài khoản không đăng nhập được cho tới khi được người thứ hai kích hoạt; lưu thay đổi ma trận không có lý do bị từ chối | [ADR-0017](adr/0017-ma-tran-phan-quyen-mot-nguon-va-quy-tac-phan-tach-nhiem-vu.md) |
| YC-PCN-28 | Hệ thống PHẢI được quét lỗ hổng và kiểm thử xâm nhập trước khi nghiệm thu, có báo cáo phát hiện và biên bản khắc phục | Bắt buộc | Báo cáo kiểm thử xâm nhập không còn lỗ hổng mức nghiêm trọng chưa khắc phục tại thời điểm nghiệm thu | `01-thuyet-minh-ky-thuat.md` mục 9.8 |
| YC-PCN-29 | Hệ thống PHẢI có hồ sơ đề xuất cấp độ an toàn hệ thống thông tin được cấp có thẩm quyền phê duyệt trước khi vận hành chính thức | Bắt buộc | Hồ sơ đề xuất cấp độ (kiến nghị cấp độ 2) được trình và có kết quả phê duyệt trước ngày vận hành chính thức | CN-15.2; `01-thuyet-minh-ky-thuat.md` mục 9.1 |

**3.4.7. Khả năng bảo trì (maintainability)**

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-PCN-10 | Mã nguồn PHẢI có tài liệu, tuân thủ quy ước đặt tên thống nhất, có kiểm thử tự động cho các luồng nghiệp vụ trọng yếu | Bắt buộc | Rà soát mã nguồn xác nhận có tài liệu và bộ kiểm thử tự động chạy được cho luồng duyệt xuất bản, tải lên, tìm kiếm | PCN-10 |
| YC-PCN-14 | Nhà thầu PHẢI bàn giao đầy đủ mã nguồn, kịch bản triển khai, tài liệu kiến trúc; chủ đầu tư có toàn quyền sửa đổi và thuê đơn vị khác bảo trì | Bắt buộc | Biên bản bàn giao liệt kê đủ mã nguồn, kịch bản triển khai (deployment script), tài liệu kiến trúc; không có điều khoản hạn chế quyền sửa đổi | PCN-14 |

**3.4.8. Tính linh hoạt (flexibility)**

| Mã | Phát biểu | Ưu tiên | Tiêu chí nghiệm thu | Nguồn gốc |
|---|---|---|---|---|
| YC-PCN-11 | Hệ thống PHẢI ưu tiên thành phần mã nguồn mở và phần mềm trong nước; mọi thành phần có phí bản quyền PHẢI được kê khai rõ | Bắt buộc | Danh mục thành phần phần mềm kèm giấy phép sử dụng, không có thành phần phí bản quyền chưa kê khai | PCN-11; Điều 85 Nghị định 308/2025/NĐ-CP |
| YC-PCN-12 | Hệ thống PHẢI xuất toàn bộ dữ liệu và siêu dữ liệu theo chuẩn mở bất kỳ lúc nào: siêu dữ liệu theo Dublin Core và JSON, tệp gốc theo cấu trúc thư mục kèm bảng kê checksum, nhật ký theo định dạng văn bản thuần | Bắt buộc | Thực hiện xuất toàn bộ, kiểm tra tệp xuất mở được bằng công cụ độc lập, không phụ thuộc phần mềm của nhà thầu | PCN-12 |
| YC-PCN-13 | Hệ thống KHÔNG ĐƯỢC dùng định dạng lưu trữ độc quyền cho bản gốc; KHÔNG ĐƯỢC khóa dữ liệu trong cơ sở dữ liệu độc quyền | Bắt buộc | Rà soát định dạng bản gốc toàn bộ tám dạng dữ liệu số xác nhận dùng định dạng mở hoặc có đặc tả công khai | PCN-13 |
| YC-PCN-15 | Hệ thống PHẢI tách cấu hình vận hành khỏi mã nguồn; nâng cấp KHÔNG ĐƯỢC làm mất cấu hình và dữ liệu | Bắt buộc | Thực hiện một lần nâng cấp thử trên môi trường kiểm thử, xác nhận cấu hình và dữ liệu giữ nguyên | PCN-15 |
| — | *(Khả năng mở rộng theo tải và dung lượng — scalability)* | — | — | Xem YC-PCN-16 (mục 3.3) |

### 3.5. Ràng buộc thiết kế

Khác với mục 2.4 (ràng buộc ở mức tổng thể dự án), bảng dưới đây liệt kê ràng buộc **áp đặt trực tiếp lên phương án thiết kế** — không phải lựa chọn tự do của nhà thầu — bắt nguồn từ các quyết định kiến trúc đã chốt tại `08-mo-ta-kien-truc.md` mục 6.

| Mã | Ràng buộc thiết kế | Diễn giải | Nguồn gốc |
|---|---|---|---|
| RB-01 | Cơ sở dữ liệu quan hệ PHẢI dùng PostgreSQL | Bảo đảm mã nguồn mở, hỗ trợ tìm kiếm toàn văn và kiểu dữ liệu JSON cho siêu dữ liệu mở rộng | `08-mo-ta-kien-truc.md` mục 6, [ADR-0002](adr/0002-react-vite-lop-dich-vu-gia-lap.md); `01-thuyet-minh-ky-thuat.md` mục 6.2 |
| RB-02 | Kho tệp PHẢI dùng giao thức tương thích S3, triển khai tại chỗ | Cho phép đổi nhà cung cấp mà không sửa mã; hỗ trợ chế độ chỉ ghi một lần cho bản gốc | `01-thuyet-minh-ky-thuat.md` mục 6.2 |
| RB-03 | Mô hình dữ liệu PHẢI tách hai trục phân loại độc lập — loại đối tượng di sản (`objectClass`) và dạng dữ liệu số (`digitalForm`) — không được gộp vào một trường duy nhất | Đúng mô hình CIDOC-CRM (ISO 21127); trả lời được câu hỏi nghiệp vụ "một đối tượng có mấy dạng dữ liệu số" | [ADR-0003](adr/0003-tach-truc-objectclass-va-digitalform.md) |
| RB-04 | Mã định danh PHẢI theo cấu trúc năm tầng, không được mã hóa thuộc tính khả biến (vị trí, trạng thái, người phụ trách) vào mã | Số đã cấp không bao giờ cấp lại; sửa vị trí không được phép làm đổi mã và phá vỡ liên kết đã phát hành | [ADR-0004](adr/0004-he-thong-ma-dinh-danh-5-tang.md) |
| RB-05 | Mọi trường dữ liệu PHẢI hoặc có giá trị xác định, hoặc mang một trong năm mã khuyết giá trị quy định — không được để trống | Phân biệt "chưa ai nhập" với "đã xác minh không thể biết" | [ADR-0005](adr/0005-bo-5-ma-khuyet-gia-tri.md), [ADR-0016](adr/0016-averagecompletenesspct-tra-null-cho-tap-rong.md) |
| RB-06 | Vòng đời dữ liệu PHẢI theo mô hình OAIS, tách ba gói tin SIP — AIP — DIP; bản gốc (AIP) bất biến | Bảo đảm thao tác biên tập, nén, tối ưu web không bao giờ chạm bản gốc | `01-thuyet-minh-ky-thuat.md` mục 7.9 |
| RB-07 | Kết nối ra ngoài hệ thống PHẢI đi qua nền tảng tích hợp, chia sẻ dữ liệu của Thành phố; KHÔNG ĐƯỢC kết nối ngang hàng trực tiếp tới hệ thống cấp Thành phố hay cấp quốc gia | Đúng vai trò đơn vị trực thuộc của chủ đầu tư | Điều 7 khoản 3 Quyết định 85/2025/QĐ-UBND; [ADR-0013](adr/0013-bien-chu-de-root-modal-qua-portal.md) |
| RB-08 | Kiểm soát truy cập PHẢI thực thi tại tầng dịch vụ (API), giao diện chỉ là một lớp thể hiện lại cùng quy tắc, không phải nơi duy nhất kiểm soát | Ngăn vượt quyền qua gọi API trực tiếp | [ADR-0011](adr/0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md); nguyên tắc kiến trúc #5, `08-mo-ta-kien-truc.md` mục 7 |
| RB-09 | Kho nhật ký PHẢI tách vật lý khỏi cơ sở dữ liệu nghiệp vụ, chỉ hỗ trợ ghi thêm | Bảo đảm chuỗi băm liên kết không bị vô hiệu hóa dù cơ sở dữ liệu nghiệp vụ bị can thiệp | [ADR-0012](adr/0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md) |
| RB-10 | Toàn bộ tài nguyên tĩnh (phông chữ, biểu tượng, thư viện giao diện, thư viện hiển thị 3D) PHẢI được đóng gói và phục vụ từ chính hệ thống | Hệ thống chạy được hoàn toàn trong mạng nội bộ hoặc mạng chuyên dùng, không gọi dịch vụ Internet khi vận hành | `01-thuyet-minh-ky-thuat.md` mục 5.5 |

---

## 4. Ma trận truy vết

Ma trận dưới đây tổng hợp truy vết **ở mức nhóm yêu cầu**, đối chiếu sang khung nhìn kiến trúc chịu trách nhiệm hiện thực (`08-mo-ta-kien-truc.md` mục 4) và nguồn pháp lý chi phối chính. Truy vết **ở mức từng yêu cầu đơn lẻ** đã có sẵn tại cột "Nguồn gốc" của mỗi bảng ở mục 3 — không lặp lại ở đây để tránh một bảng trùng lặp hàng trăm dòng. Truy vết **ở mức use case cụ thể** (wireframe → màn hình ứng dụng → điều khoản pháp lý → chuẩn quốc tế) nằm tại `03-ma-tran-truy-vet.md`.

| Nhóm yêu cầu | Số lượng | Khung nhìn kiến trúc chịu trách nhiệm (`08`, mục 4) | Nguồn pháp lý chính |
|---|---|---|---|
| YC-CN-01 Danh mục và sổ đăng ký | 6 | 4.2 Chức năng/logic, 4.3 Dữ liệu | Điều 23 Luật 45/2024/QH15; Quyết định 611/QĐ-TTg |
| YC-CN-02 Siêu dữ liệu | 8 | 4.3 Dữ liệu | TCVN 7980-1:2024, TCVN 7980-2:2024 |
| YC-CN-03 Nhập dữ liệu, kiểm soát chất lượng | 8 | 4.2 Chức năng/logic | Điều 12 Luật Dữ liệu số 60/2024/QH15 |
| YC-CN-04 Tìm kiếm và khai thác | 9 | 4.2 Chức năng/logic | Điều 16 Luật Dữ liệu số 60/2024/QH15 |
| YC-CN-05 Quy trình duyệt và xuất bản | 8 | 4.2 Chức năng/logic, 4.5 An toàn TT | Điều 12 Luật GDĐT 20/2023/QH15; Điều 87, 89 NĐ 308/2025/NĐ-CP |
| YC-CN-06 Phiên bản và toàn vẹn | 6 | 4.3 Dữ liệu, 4.6 Vận hành | Điều 12 Luật GDĐT 20/2023/QH15; OAIS ISO 14721 |
| YC-CN-07 Bộ sưu tập, quyền, mức truy cập | 6 | 4.3 Dữ liệu, 4.5 An toàn TT | Điều 88 Luật 45/2024/QH15; Điều 86 khoản 4 NĐ 308/2025/NĐ-CP |
| YC-CN-08 Báo cáo và thống kê | 6 | 4.2 Chức năng/logic | Điều 33 Luật 45/2024/QH15 |
| YC-CN-09 Kiểm kê định kỳ | 4 | 4.2 Chức năng/logic, 4.3 Dữ liệu | Điều 23 Luật 45/2024/QH15 |
| YC-CN-10 Đợt số hóa, nhà thầu, thiết bị | 5 | 4.2 Chức năng/logic | Điều 85 NĐ 308/2025/NĐ-CP |
| YC-CN-11 Kết nối và chia sẻ dữ liệu | 10 | 4.1 Ngữ cảnh & tích hợp | Điều 7 QĐ 85/2025/QĐ-UBND; NĐ 278/2025/NĐ-CP; NĐ 165/2025/NĐ-CP |
| YC-CN-12 Người dùng, phân quyền, nhật ký | 12 | 4.5 An toàn thông tin | Điều 13 NĐ 278/2025/NĐ-CP; TCVN 11930:2017 |
| YC-CN-13 Đa ngữ | 4 | 4.2 Chức năng/logic, 4.3 Dữ liệu | — (yêu cầu chủ đầu tư, [ADR-0015](adr/0015-i18n-tach-lop.md)) |
| YC-CN-14 Sao lưu, phục hồi, quản trị | 5 | 4.4 Triển khai, 4.6 Vận hành | `02-quy-trinh-bao-quan-sao-luu.md` |
| YC-CN-15 Tuân thủ và quản trị dữ liệu | 9 | 4.5 An toàn thông tin | Luật 91/2025/QH15; NĐ 356/2025/NĐ-CP; NĐ 165/2025/NĐ-CP; NĐ 278/2025/NĐ-CP |
| YC-GD Giao diện ngoài | 12 | 4.1 Ngữ cảnh & tích hợp, 4.4 Triển khai | `06-dac-ta-api.md` |
| YC-PCN-01…09, 16 Hiệu năng | 10 | 4.4 Triển khai | `01-thuyet-minh-ky-thuat.md` mục 5.1–5.3 |
| YC-PCN-17…29, 10–15 Thuộc tính chất lượng | 19 | 4.5 An toàn thông tin, 4.6 Vận hành | ISO/IEC 25010:2023; `01-thuyet-minh-ky-thuat.md` Chương 9 |
| RB-01…10 Ràng buộc thiết kế | 10 | Toàn bộ mục 4 (`08-mo-ta-kien-truc.md`) | 16 ADR tại `docs/adr/` |

---

## Phụ lục

### Phụ lục A — Thống kê yêu cầu theo mức ưu tiên

| Nhóm | Bắt buộc | Hỗn hợp (khung Bắt buộc + nội dung Nên có) | Nên có (Giai đoạn 2) | Tổng |
|---|---|---|---|---|
| Yêu cầu chức năng (YC-CN-01…15) | 100 | 2 | 4 | 106 |
| Yêu cầu giao diện ngoài (YC-GD) | 11 | 0 | 1 | 12 |
| Yêu cầu hiệu năng (YC-PCN-01…09, 16) | 10 | 0 | 0 | 10 |
| Thuộc tính chất lượng (YC-PCN-10…15, 17…29) | 19 | 0 | 0 | 19 |
| **Tổng yêu cầu** | **140** | **2** | **5** | **147** |
| Ràng buộc thiết kế (RB-01…10) *(không xếp mức ưu tiên — là ràng buộc bắt buộc tuân thủ theo định nghĩa)* | | | | 10 |

**Kết luận thống kê:** 140/147 yêu cầu (95%) ở mức Bắt buộc, nghiệm thu ngay ở Giai đoạn 1 — phản ánh đúng chủ trương "Giai đoạn 1 vận hành và nghiệm thu độc lập" tại `01-thuyet-minh-ky-thuat.md` mục 3.4. Năm yêu cầu mức Nên có (YC-CN-04.8, YC-CN-11.9, YC-CN-13.3, YC-CN-13.4, YC-GD-06) và hai yêu cầu hỗn hợp (YC-CN-02.8, YC-CN-13.2 — phần nội dung) đều thuộc nhóm đã nêu rõ tại `01-thuyet-minh-ky-thuat.md` mục 3.4 là "phạm vi Giai đoạn 2 — cái gì KHÔNG làm ở Giai đoạn 1", không phải yêu cầu bị bỏ sót.

### Phụ lục B — Quy ước mã hoá và truy vết ngược

Mọi mã `YC-CN-nn.m` và `YC-PCN-nn` trong tài liệu này ánh xạ 1–1 về mã gốc `CN-nn.m`/`PCN-nn` tại `01-thuyet-minh-ky-thuat.md` (xem quy ước tại mục 1.3). Người đọc cần tra ngược từ mã gốc sang mã chuẩn hoá chỉ cần thêm tiền tố `YC-`; không có phép đổi số thứ tự nào khác. Các mã mới hoàn toàn của tài liệu này — không có mã gốc tương ứng ở tài liệu 01 — là: `YC-PCN-07` đến `YC-PCN-09` (lấp khoảng trống đánh số hiệu năng/sẵn sàng), `YC-PCN-17` đến `YC-PCN-29` (thuộc tính chất lượng bổ sung theo ISO/IEC 25010:2023), toàn bộ nhóm `YC-GD` (giao diện ngoài) và toàn bộ nhóm `RB` (ràng buộc thiết kế).

---

## Kết luận

Tài liệu đã đặc tả 147 yêu cầu phần mềm (106 chức năng, 12 giao diện ngoài, 10 hiệu năng, 19 thuộc tính chất lượng theo tám đặc tính ISO/IEC 25010:2023) cộng 10 ràng buộc thiết kế, mỗi yêu cầu có mã, phát biểu dạng bắt buộc, mức ưu tiên, tiêu chí nghiệm thu kiểm chứng được và nguồn gốc — đúng bốn thuộc tính tối thiểu theo ISO/IEC/IEEE 29148:2018. Toàn bộ nội dung bám sát và không mâu thuẫn với `01-thuyet-minh-ky-thuat.md` Chương 4–5; phần mở rộng duy nhất là các yêu cầu thuộc tính chất lượng bổ sung (mục 3.4) để bảo đảm đủ tám đặc tính theo mô hình chất lượng hiện hành, và các yêu cầu giao diện ngoài/ràng buộc thiết kế tách riêng để phù hợp cấu trúc 29148. Tài liệu này cùng `08-mo-ta-kien-truc.md` tạo thành cặp tài liệu kiến trúc — yêu cầu hoàn chỉnh của bộ hồ sơ.

---

## Báo cáo rà soát và danh mục cần đối chiếu trước khi nộp

Tài liệu được biên soạn bằng cách chuyển đổi định dạng toàn bộ 106 yêu cầu chức năng (CN-01…CN-15) và 15 chỉ tiêu phi chức năng (PCN-01…15) đã có tại `01-thuyet-minh-ky-thuat.md` sang khung ISO/IEC/IEEE 29148:2018, bổ sung mức ưu tiên, phát biểu dạng bắt buộc, và 19 yêu cầu thuộc tính chất lượng mới để đủ tám đặc tính ISO/IEC 25010:2023 — không phát sinh căn cứ pháp lý mới ngoài bộ đã xác minh tại tài liệu 01.

**Danh mục "(cần đối chiếu trước khi nộp)":**

1. **Người lập tài liệu** — tên đơn vị tư vấn/nhà thầu và cá nhân chịu trách nhiệm chưa được điền ở bảng thông tin đầu tài liệu.
2. **Số lượng người dùng dự kiến theo vai trò** tại mục 2.3 — để đơn vị điền cụ thể khi ký hợp đồng, như đã ghi chú tại `01-thuyet-minh-ky-thuat.md` mục 3.5.
3. **Bài kiểm tra thực hành sau đào tạo (YC-PCN-23)** — ngưỡng đạt cụ thể chưa được ấn định, cần đối chiếu với kế hoạch đào tạo chi tiết tại `01-thuyet-minh-ky-thuat.md` Chương 13.
4. Mọi nội dung gắn nhãn *"(cần đối chiếu nguyên văn trước khi nộp)"* trong `01-thuyet-minh-ky-thuat.md` mà tài liệu này tham chiếu ở cột "Nguồn gốc" — đặc biệt hiệu lực Nghị định 85/2016/NĐ-CP và Thông tư 12/2022/TT-BTTTT sau ngày 01/7/2026 (ảnh hưởng YC-PCN-29, YC-CN-15.2), và khả năng miễn trừ DPIA cho cơ quan nhà nước (ảnh hưởng YC-CN-15.3) — áp dụng nguyên trạng cho tài liệu này.
5. **Tên tệp chính xác của 16 ADR** trong `docs/adr/` — cột "Nguồn gốc" tại mục 3 tra cứu theo số hiệu, cần đối chiếu đường dẫn tệp khi thư mục ADR hoàn tất.