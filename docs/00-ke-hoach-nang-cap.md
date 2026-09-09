# Kế hoạch nâng cấp — Admin CMS dữ liệu số hóa Văn Miếu — Quốc Tử Giám

*Tổng hợp từ 7 báo cáo phản biện (pháp lý ×4, ATTT, DAM/di sản, red-team chấm thầu) — 12/08/2026.*
*USER ĐÃ DUYỆT 12/08: phạm vi đủ A+B+C; mock mở rộng ~150 bản ghi sinh từ danh mục hiện vật thật (82 rùa + bia theo khoa thi đúng can chi).*
*Nguồn chi tiết: scratchpad `reports/` (legal-main, pdpl-verify, heritage-law, log-retention, attt, dam, redteam).*

## 0. Ba phát hiện chi phối toàn bộ kế hoạch

1. **NĐ 47/2020/NĐ-CP đã bị bãi bỏ** (Điều 23 NĐ 278/2025/NĐ-CP, 22/10/2025). Mọi thuật ngữ
   phái sinh trong design ("Chia sẻ mặc định", "Theo yêu cầu đặc thù", checklist 6 dòng) phải viết lại.
   Khung mới: Luật Dữ liệu 60/2024 + NĐ 165/2025 + NĐ 278/2025 (mốc kết nối **31/12/2026**),
   Luật BVDLCN 91/2025 + NĐ 356/2025, Luật An ninh mạng 116/2025 (01/7/2026),
   Luật DSVH 45/2024 + NĐ 308/2025 (Chương VIII chuyển đổi số), Luật GDĐT 20/2023 + NĐ 137/2024 (ký số bản số hóa).
2. **Mock data chứa 14 lỗi fact di sản đã xác minh** + số liệu tự mâu thuẫn ở mức bấm-một-lần-là-lộ.
   User đã duyệt: giữ cấu trúc + khối lượng, sửa fact, mọi con số tính từ một nguồn.
3. **Đơn vị vận hành là đơn vị sự nghiệp công lập** → không thuộc Điều 2 NĐ 278/2025 (tuân thủ
   qua Sở VH&TT/UBND TP), KHÔNG được miễn trừ DPO/DPIA của Luật BVDLCN, thời hạn lưu log theo
   cấp độ ATTT được phê duyệt (TCVN 11930:2017: cấp 2 ≥1 tháng → cấp 5 ≥12 tháng), không có con số 12 tháng chung.

## 0bis. THUẬT NGỮ & PHÂN LOẠI (user chốt 12/08 — áp dụng toàn bộ app + docs)

Tiếng Anh giữ **`asset`** làm từ bao trùm trong mã nguồn/API. Tiếng Việt KHÔNG dịch là "tài sản"
(dễ nhầm với tài sản công theo nghĩa kế toán) mà dùng **"dữ liệu số hóa"** làm từ bao trùm,
và phân loại theo **hai trục độc lập**:

**Trục 1 — Loại đối tượng** (`objectClass`): đối tượng di sản có thật được số hóa

| Mã | Nhãn tiếng Việt | Phạm vi | Ví dụ tại Văn Miếu |
|---|---|---|---|
| `precinct` | **Khuôn viên & không gian** | phân khu, sân, vườn, hồ, giếng | Hồ Văn, Vườn Giám, giếng Thiên Quang, sân bia, khu Nhập Đạo/Thành Đạt/Đại Thành/Thái Học |
| `structure` | **Công trình kiến trúc** | công trình, hạng mục xây dựng | Khuê Văn Các, Văn Miếu Môn, Đại Trung Môn, Đại Thành Môn, nhà Thái Học, nhà Bái Đường, nhà bia |
| `artifact` | **Hiện vật** | hiện vật theo Luật DSVH (phân loại sâu: di vật / cổ vật / bảo vật quốc gia) | bia Tiến sĩ, rùa đá đội bia, tượng thờ, chuông Bích Ung, khánh đá, đồ tế khí |
| `document` | **Tài liệu & di sản tư liệu** | di sản tư liệu (Chương IV Luật DSVH 45/2024) | sắc phong, bản dập văn bia, đăng khoa lục, chiếu dụ, gia phả |
| `av` | **Tư liệu nghe nhìn** | ảnh, phim, bản thu | ảnh tư liệu lịch sử, phim tư liệu, thuyết minh audio |

**Trục 2 — Dạng dữ liệu số** (`digitalForm`): sản phẩm số hóa tạo ra

`mesh3d` Mô hình 3D (GLB/OBJ) · `splat` Gaussian splat (.splat/.ply) · `pointcloud` Đám mây điểm (E57/PLY)
· `drawing` Bản vẽ kỹ thuật (DWG/PDF) · `image` Ảnh số (TIFF/JPEG) · `text` Văn bản số (PDF/A, TIFF đa trang)
· `video` Video (ProRes/MP4) · `audio` Âm thanh (WAV/MP3)

**Vì sao tách hai trục — lập luận đưa vào thuyết minh:**
- Trường `type` cũ trộn lẫn hai khái niệm (`3D`/`Splat` là *dạng dữ liệu*, `Tài liệu`/`Ảnh` là *loại đối tượng*),
  khiến không trả lời được câu hỏi nghiệp vụ cơ bản: *"một công trình có mấy dạng dữ liệu?"* — Khuê Văn Các
  vừa có mesh 3D, vừa có splat, vừa có point cloud, vừa có bản vẽ, vừa có ảnh tư liệu.
- Tách hai trục là cách mô hình hóa đúng theo **CIDOC-CRM** (ISO 21127): đối tượng vật lý (E22 Man-Made Object)
  khác với bản đại diện số của nó (P138 has representation) — khớp với bảng `physical_artifact` trong ERD.
- Khớp trực tiếp với IA của wireframe hồ sơ thầu: "Không gian 3D" (khuôn viên), "Dữ liệu kỹ thuật công trình"
  (công trình), "Nội dung di sản" (hiện vật + tài liệu).

**Hệ quả UI:** bộ lọc ở màn Dữ liệu số hóa tách thành 2 hàng chip (Loại đối tượng / Dạng dữ liệu) thay vì
một hàng trộn lẫn; một đối tượng có thể có nhiều bản ghi dữ liệu số ở các dạng khác nhau, liên kết qua
`physical_artifact`.

## 0quater. HỆ THỐNG MÃ ĐỊNH DANH (user yêu cầu chuẩn hóa 12/08)

### Bốn nguyên tắc bắt buộc

1. **Bền vững, không tái sử dụng.** Số đã cấp không bao giờ cấp lại, kể cả khi bản ghi bị gỡ/thu hồi
   (deaccession). Bản ghi gỡ giữ nguyên mã ở trạng thái "đã thu hồi".
2. **Không mã hóa thuộc tính hay thay đổi vào mã.** Tuyệt đối KHÔNG nhét vị trí, phân khu, trạng thái,
   người phụ trách vào mã định danh. *Lý do thực chứng: chính đợt rà soát này đã phải hiệu đính 4 bản ghi
   sai vị trí (tượng Khổng Tử, tượng Chu Văn An, chuông Bích Ung, khánh đá). Nếu vị trí nằm trong mã thì
   sửa vị trí đồng nghĩa đổi mã — phá vỡ mọi liên kết và trích dẫn đã phát hành.* Vị trí là **metadata**,
   không phải khóa.
3. **Tách định danh nội bộ khỏi số kiểm kê gốc.** Mã hệ thống KHÔNG thay thế **số kiểm kê / số đăng ký
   hiện vật** của Trung tâm — hai trường riêng, neo với nhau (Luật DSVH Đ.23 kiểm kê).
4. **Độ dài cố định, chữ hoa, sắp xếp đúng thứ tự tự nhiên.** Phân tách bằng `-` (cấp) và `.` (nhánh).

### Cấu trúc 5 tầng

| Tầng | Cú pháp | Ví dụ | Ghi chú |
|---|---|---|---|
| 1. **Đối tượng di sản** | `VM-<OC>-<NNNNN>` | `VM-CT-00007` (Khuê Văn Các) | PID bền vững; `OC` = loại đối tượng; số 5 chữ số cấp tự động |
| 2. **Bản ghi dữ liệu số** | `…-<NNNNN>.<DF><nn>` | `VM-CT-00007.SPL01` | `DF` = dạng dữ liệu; `nn` = lần số hóa thứ mấy cùng dạng (đợt quét khác nhau) |
| 3. **Phiên bản** | `….v<n>` | `VM-CT-00007.SPL01.v2` | tái xử lý/hiệu đính; bản gốc v1 bất biến, không ghi đè |
| 4. **Tệp dẫn xuất** | `…#<role>` | `VM-CT-00007.SPL01.v2#master` | role: `master` · `web` · `raw` · `thumb` |
| 5. **Đợt số hóa** | `VM-DS-<YYYY>-<nn>` | `VM-DS-2026-03` | gắn nhà thầu, thiết bị, hợp đồng, nghiệm thu |

**`OC` — loại đối tượng (2 ký tự):** `KV` khuôn viên & không gian · `CT` công trình kiến trúc ·
`HV` hiện vật · `TL` tài liệu & di sản tư liệu · `NN` tư liệu nghe nhìn · `DT` điểm tham quan
(thực thể riêng theo wireframe UC-03: có tọa độ, loại điểm tham quan/thuyết minh/panorama 360, trạng thái hiển thị).

**`DF` — dạng dữ liệu số (3 ký tự):** `M3D` mô hình 3D mesh · `SPL` gaussian splat · `PCL` đám mây điểm ·
`DWG` bản vẽ kỹ thuật · `IMG` ảnh số · `TXT` văn bản số · `VID` video · `AUD` âm thanh.

### Trường định danh song song (không trộn vào mã hệ thống)

| Trường | Nguồn | Bắt buộc |
|---|---|---|
| `so_kiem_ke` | Sổ kiểm kê hiện vật của Trung tâm | Bắt buộc với `HV`, `TL` |
| `so_dang_ky` | Số đăng ký di vật/cổ vật/bảo vật quốc gia (nếu có) | Khi áp dụng |
| `ma_ho_so_di_tich` | Mã trong hồ sơ khoa học xếp hạng di tích | Với `KV`, `CT` |
| `pid_quoc_gia` | Mã định danh số quốc gia khi CSDL quốc gia về DSVH cấp | Roadmap |

> **Móc pháp lý — nên nêu trong thuyết minh:** QĐ 611/QĐ-TTg (04/4/2026) đặt chỉ tiêu *"80% di sản văn hóa
> số công có **mã định danh số** để xác lập quyền sở hữu, kiểm soát khai thác"*. Hệ thống mã định danh 5 tầng
> này là phương án đáp ứng trực tiếp chỉ tiêu đó. TT 05/2025/TT-BNV cũng yêu cầu "mã định danh" trong
> metadata gói SIP/AIP/DIP. Trên lộ trình: đăng ký định danh bền vững quốc tế (ARK/Handle) để trích dẫn học thuật.

**Hiển thị trên UI:** mã đầy đủ ở chi tiết; danh sách rút gọn còn `VM-CT-00007` + nhãn dạng dữ liệu.
Ô tìm kiếm chấp nhận cả mã đầy đủ lẫn mã rút gọn, không phân biệt hoa/thường, bỏ qua dấu `-`/`.`.

## 0ter. QUAN HỆ ĐỐI TƯỢNG ↔ DỮ LIỆU SỐ (user chốt 12/08)

Một đối tượng di sản tồn tại đồng thời trong nhiều dạng dữ liệu VÀ được nhắc tới trong nhiều tư liệu khác.
Phải phân biệt **hai nhóm quan hệ** — gộp chung sẽ đếm sai và sai bản quyền:

**Nhóm 1 — Bản đại diện số của chính đối tượng** (CIDOC-CRM P138 has representation)

| Mã quan hệ | Nhãn tiếng Việt | Ví dụ với Khuê Văn Các |
|---|---|---|
| `hasRepresentation` | Bản đại diện số | mesh 3D, gaussian splat, đám mây điểm E57 |
| `hasDrawing` | Hồ sơ bản vẽ | mặt bằng, mặt đứng trục A–A, mặt cắt B–B (.dwg) |
| `hasConditionPhoto` | Ảnh hiện trạng | ảnh khảo sát phục vụ bảo quản |
| `hasRubbing` | Bản dập | bản dập văn bia (với hiện vật bia) |

**Nhóm 2 — Đối tượng là chủ đề của một tư liệu độc lập** (tư liệu có hồ sơ, niên đại, bản quyền RIÊNG)

| Mã quan hệ | Nhãn tiếng Việt | CIDOC-CRM | Ví dụ |
|---|---|---|---|
| `depictedIn` | Được khắc họa trong | P62 depicts | ảnh tư liệu thập niên 1940 chụp Khuê Văn Các |
| `mentionedIn` | Được nhắc đến trong | P67 refers to | văn bia, đăng khoa lục có nội dung nhắc tới |
| `subjectOf` | Là chủ đề của | P129 is about | audio thuyết minh, phim tư liệu về công trình |

**Nhóm 3 — Quan hệ cấu trúc**

`partOf` **Thuộc về** (P46 is composed of): Khuê Văn Các → khu thứ hai; giếng Thiên Quang → khu thứ ba.
Đây chính là **cây phân cấp Toàn khu → phân khu → công trình/điểm** của wireframe UC-03 — có `partOf` là dựng được cây đó.
`derivedFrom` **Dẫn xuất từ**: bản tối ưu web ← bản master (không phải quan hệ di sản, là quan hệ kỹ thuật).

### Màn bổ sung B9 — **Hồ sơ đối tượng di sản**
Trang tổng hợp 360° cho MỘT đối tượng vật lý (một bản ghi `physical_artifact`), gồm:
thông tin đối tượng (tên, loại, vị trí, niên đại, **số kiểm kê hiện vật gốc**, xếp hạng/UNESCO) ·
**Bản đại diện số** nhóm theo dạng dữ liệu · **Xuất hiện trong tư liệu khác** nhóm theo quan hệ ·
lịch sử can thiệp/trùng tu · nội dung thuyết minh đa ngữ · nút mở từng bản ghi dữ liệu số.

> Đây là câu trả lời trực tiếp cho câu hỏi nghiệp vụ mà báo cáo DAM nêu là *không thể trả lời* với cấu trúc phẳng:
> **"Cho tôi tất cả tư liệu liên quan đến Khuê Văn Các."** Nên đưa vào kịch bản demo thay cho đoạn mở
> chi tiết tài sản đơn lẻ — sức thuyết phục cao hơn hẳn.

## 0quinquies. XỬ LÝ TRƯỜNG THIẾU THÔNG TIN (user chốt 12/08)

**Nguyên tắc: không có ô trống.** Mọi trường trong hồ sơ hoặc có giá trị xác định, hoặc mang một
**mã khuyết giá trị** tường minh. Ô trống là mơ hồ — không phân biệt được "chưa ai nhập" với
"đã nghiên cứu và kết luận không thể biết", trong khi hai tình huống đó đòi hỏi hành động trái ngược nhau.

### Bộ từ vựng khuyết giá trị (controlled vocabulary)

| Mã | Nhãn hiển thị | Ngữ nghĩa | Ví dụ tại Văn Miếu |
|---|---|---|---|
| `KHONG_AP_DUNG` | **Không áp dụng** | Trường không có nghĩa với loại đối tượng này | "Số trang" của mô hình 3D; "niên đại tạo tác" của một khuôn viên |
| `CHUA_XAC_DINH` | **Chưa xác định** | Có tồn tại giá trị thật, chưa nghiên cứu/xác minh được — **là việc cần làm** | Niên đại khánh đá (mới biết "thời Nguyễn", chưa ra năm) |
| `KHONG_RO` | **Không rõ / Khuyết danh** | Đã tra cứu, kết luận không thể biết được — **hồ sơ đã hoàn chỉnh** | Tác giả ảnh tư liệu thời Pháp thuộc |
| `CHUA_NHAP` | **Chưa nhập liệu** | Có ở hồ sơ giấy, chưa nhập vào hệ thống — **là việc cần làm** | Trong đợt chuyển đổi dữ liệu ban đầu |
| `HAN_CHE` | **Hạn chế công bố** | Có giá trị nhưng không công bố (bảo mật / dữ liệu cá nhân) | Vị trí chi tiết hiện vật quý; thông tin cá nhân trong gia phả |

### Vì sao phải tách — mỗi mã kéo theo hành vi hệ thống khác nhau

| Mã | Hàng đợi công việc | Tính vào % đầy đủ hồ sơ | API công khai |
|---|---|---|---|
| `KHONG_AP_DUNG` | không | **loại khỏi mẫu số** | bỏ phần tử |
| `CHUA_XAC_DINH` | → hàng đợi **nghiên cứu/thẩm định** | tính là **thiếu** | xuất giá trị chuẩn hóa |
| `KHONG_RO` | không | tính là **đã xử lý** | xuất giá trị chuẩn hóa |
| `CHUA_NHAP` | → hàng đợi **nhập liệu** | tính là **thiếu** | bỏ phần tử |
| `HAN_CHE` | không | tính là **đã xử lý** | **bỏ phần tử** (API nội bộ vẫn trả giá trị) |

> Nhờ tách như vậy, chỉ số **"% độ đầy đủ hồ sơ"** mới trung thực: mẫu số loại trừ trường không áp dụng,
> và một hồ sơ ghi "Không rõ" đúng cách KHÔNG bị trừ điểm chất lượng. Đây là chỉ số đưa lên màn
> Báo cáo–Thống kê và màn Kiểm kê.

### Quy tắc bắt buộc kèm theo

1. **Trường bắt buộc**: phải có giá trị HOẶC mã khuyết giá trị + lý do. Không cho lưu khi bỏ trống.
2. **Ghi chú nguồn**: mỗi lần dùng `KHONG_RO` hoặc `CHUA_XAC_DINH` phải kèm `ghiChuKhuyet`
   (đã tra cứu nguồn nào, kết luận ra sao) — phục vụ thẩm định và tránh tra lại nhiều lần.
3. **Niên đại dùng chuẩn EDTF (ISO 8601-2)** thay vì chuỗi tự do, kết hợp trường `era_certainty`:
   `1484` chắc chắn · `1484?` nghi vấn · `1484~` xấp xỉ · `18XX` thế kỷ 19 · `1740/1786` khoảng ·
   `unknown`. Trường hiển thị (`era_display`) vẫn giữ nguyên văn can chi/niên hiệu cho người đọc.
4. **Hiển thị UI**: không để ô trắng — in nghiêng, màu nhạt: *"— Chưa xác định"*. Người xem phải phân biệt
   được "đã xử lý, không rõ" với "quên nhập".
5. **Nhập liệu UI**: cạnh mỗi ô có nút chọn nhanh trạng thái khuyết (Chưa xác định / Không rõ /
   Không áp dụng / Hạn chế công bố) thay vì bắt gõ tay.
6. **Nhập theo lô (Excel)**: ô trống trong file Excel KHÔNG được nhập thành rỗng — mặc định thành
   `CHUA_NHAP` và đưa vào hàng đợi nhập liệu; báo cáo rõ số ô đã tự gán khi xem trước.

## 0sexies. ĐẶC ĐIỂM VẬT LÝ CỦA ĐỐI TƯỢNG (user yêu cầu 12/08)

Hồ sơ hiện mới mô tả **tệp tin số**, chưa mô tả **vật thể thật**. Bổ sung nhóm trường đặc điểm
vật lý, tuỳ biến theo loại đối tượng.

### Nguyên tắc: bảng đo lặp lại, không phải ô cố định

Theo **CIDOC-CRM E54 Dimension** (ISO 21127) và **Spectrum 5.0** (Collections Trust), kích thước
hiện vật phải ghi thành **bản ghi đo** lặp lại được, mỗi dòng gồm:

| Trường | Ví dụ | Vì sao cần |
|---|---|---|
| `dimensionType` **Chiều đo** | cao · rộng · dày/sâu · đường kính · chu vi · khối lượng · diện tích · độ dày thành | mỗi loại vật có bộ chiều đo khác nhau |
| `measuredPart` **Bộ phận đo** | thân bia · trán bia · rùa đội bia · cả bệ · không bệ · miệng chuông | *"cao 1,6 m"* vô nghĩa nếu không biết đo phần nào |
| `value` + `unit` | 165,5 · cm / kg / m² | |
| `qualifier` **Tính chất trị số** | chính xác · xấp xỉ · tối đa · ước lượng | hiện vật cong vênh không có trị số duy nhất |
| `method` **Phương pháp đo** | thước dây · thước kẹp · máy quét 3D · trích từ bản vẽ | trị số suy từ mô hình 3D phải phân biệt với đo tay |
| `measuredBy` + `measuredAt` | cán bộ, ngày | truy vết, đối chiếu khi kiểm kê |

> Trị số **suy ra từ mô hình 3D** phải ghi `method = máy quét 3D` và liên kết tới bản ghi dữ liệu số
> đã dùng — đây là điểm mạnh nên nêu trong thuyết minh: hệ thống đo được trên bản số mà không
> phải chạm vào hiện vật gốc, giảm rủi ro hư hại khi kiểm kê.

### Bộ chiều đo mặc định theo loại đối tượng

| Loại | Chiều đo gợi ý sẵn | Trường riêng kèm theo |
|---|---|---|
| **Hiện vật** `artifact` | cao, rộng, dày, khối lượng; bia đá thêm: kích thước thân bia / trán bia / rùa đội bia, diện tích mặt khắc; chuông thêm: đường kính miệng, độ dày thành; tượng thêm: cao cả bệ / không bệ | chất liệu · kỹ thuật chế tác · **số chữ, số dòng minh văn** (bia, chuông, khánh) · tình trạng bảo quản |
| **Công trình** `structure` | diện tích xây dựng, chiều cao, chiều dài × rộng mặt bằng | số gian · số tầng mái · số cột · đường kính cột · vật liệu chính (gỗ, gạch, ngói mũi hài) · hướng công trình · cao độ nền |
| **Khuôn viên** `precinct` | diện tích, chu vi, dài × rộng, độ sâu (giếng/hồ) | cao độ · ranh giới (đa giác toạ độ) · lớp phủ bề mặt |
| **Tài liệu** `document` | cao × rộng tờ, số tờ/trang, kích thước khung chữ | chất liệu (giấy dó, mộc bản…) · số dòng, số chữ mỗi dòng · ấn triện · tình trạng (rách, mối mọt, ố) |
| **Tư liệu nghe nhìn** `av` | kích thước vật mang tin nếu có (phim kính, băng từ) | vật mang tin gốc · nếu sinh ra đã ở dạng số thì ghi `KHONG_AP_DUNG` |

### Vị trí — nâng từ chuỗi tự do thành cấu trúc

Hiện `loc` chỉ là một chuỗi. Tách thành: **phân khu** → **công trình** → **vị trí cụ thể trong công trình**
(gian, hồi, bệ số mấy) + **toạ độ** (VN-2000 và WGS84, kèm cao độ) + **hướng đặt**.
Lý do nghiệp vụ: kiểm kê định kỳ cần chỉ đúng chỗ, và di dời hiện vật phải ghi được lịch sử vị trí
(gắn với sự kiện, không ghi đè — chính 4 bản ghi sai vị trí đã hiệu đính cho thấy rủi ro này).

### Điều kiện bảo quản (áp cho hiện vật + tài liệu)
Nhiệt độ và độ ẩm khuyến nghị · mức chiếu sáng tối đa (lux) · yêu cầu đặc thù (tránh nắng trực tiếp,
kê cao khỏi nền). Gắn với `02-quy-trinh-bao-quan-sao-luu.md` — bảo quản vật lý song song bảo quản số.

**Mọi trường trên tuân thủ mục 0quinquies:** thiếu thì mang mã khuyết giá trị, không để trống.
Với đối tượng chưa đo, `CHUA_XAC_DINH` sẽ tự sinh việc vào hàng đợi cần đo — dùng luôn cho màn Kiểm kê.

## 0septies. HOÀN TÁC & SỬA SAI (user phát hiện 12/08 — thiếu ở màn Kiểm kê)

Thao tác xác nhận không hoàn tác được là lỗi nghiệp vụ, nhưng **không phải mọi thứ đều nên
hoàn tác im lặng**. Tách hai tầng, áp cho toàn app:

**Tầng 1 — Thao tác nhập liệu, CHƯA chốt: hoàn tác nhanh.**
Đối chiếu kiểm kê, đánh dấu khớp/lệch, gán trạng thái… là nhập liệu. Sau mỗi thao tác hiện
thông báo kèm nút **"Hoàn tác"** (cửa sổ ~10 giây), và trong đợt chưa chốt thì luôn sửa lại được
trực tiếp. Không bắt người dùng trả giá vì một cú bấm nhầm.

**Tầng 2 — Sau khi CHỐT / ký biên bản: không hoàn tác, chỉ "điều chỉnh có lý do".**
Biên bản kiểm kê đã chốt là chứng cứ. Cho phép xoá/sửa ngầm là phá giá trị pháp lý của nó.
Thay bằng: bản ghi gốc **giữ nguyên**, tạo thêm **bản điều chỉnh** có lý do + người thực hiện +
thời điểm, cả hai cùng hiển thị trong lịch sử. Đây đúng nguyên tắc bản ghi bất biến và nhật ký
append-only đã áp ở chỗ khác trong app (Gỡ xuất bản, Trả lại bổ sung đều bắt nhập lý do).

**Quy tắc chung khi thiết kế nút xác nhận:**
| Loại thao tác | Cách xử lý |
|---|---|
| Nhập liệu thường, đảo ngược được | Làm ngay + nút Hoàn tác trong thông báo |
| Ảnh hưởng nhiều bản ghi (nhập lô, chốt đợt) | Modal xác nhận nêu rõ số lượng ảnh hưởng, rồi mới làm |
| Có giá trị pháp lý / đã công bố ra ngoài | Không hoàn tác — bắt nhập lý do, tạo bản điều chỉnh, ghi nhật ký |

## 1. Phạm vi APP — nhóm A: sửa nền (bắt buộc, từ red-team P0 + user đã duyệt)

| # | Việc | Nguồn |
|---|------|-------|
| A1 | Sửa 14 lỗi fact di sản; giữ 15 fact đã xác minh đúng; mô tả viết hoa tên riêng; niên đại đúng cấp hiện vật; thêm nhãn UNESCO 2010/2011 + QĐ 548/QĐ-TTg | redteam E |
| A2 | Mọi con số (dashboard, pipeline, BST, dung lượng) **derive từ mảng assets duy nhất**; mở rộng mock lên ~150 bản ghi để phân trang/filter có ý nghĩa; dung lượng theo công thức vật lý (WAV 11,5MB/phút, ProRes 4K ≈5,3GB/phút, TIFF 600dpi ≈100MB/trang) | redteam Đòn 1–3, c |
| A3 | Vai trò nhất quán: người Phê duyệt/Chỉ xem không phụ trách tài sản; nhãn "Người thực hiện" vs "Cán bộ phụ trách"; ngày cập nhật khớp log | redteam Đòn 6–7 |
| A4 | Tìm kiếm bỏ dấu 2 chiều + quét name/code/desc/coll/loc/owner/era/fmt | redteam Đòn 9 |
| A5 | Tách "Sở VH&TT Hà Nội" (cơ quan chủ quan) khỏi bảng "cơ quan khác" | redteam f |
| A6 | Gỡ Google Fonts + ảnh Wikimedia → font tự host, ảnh local (chờ ảnh thật từ user); endpoint đổi về tên miền con vanmieu.gov.vn | redteam b |
| A7 | Nút chết: nối Tải xuống (modal chọn bản + điều kiện sử dụng + ghi log), Sao lưu ngay (tiến trình), Thêm người dùng (luồng mời); nút chưa làm gắn nhãn "Giai đoạn 2" | redteam Đòn 8 |
| A8 | Responsive ≤1280/≤1024 + `lang="vi"` + aria-label + tabindex cho row + tương phản (#b9b9ac→#6f6f62, #8a8a7c→#5f5f54) | redteam a |
| A9 | Viewer: bật viewer cho cả Splat; khi có dữ liệu thật trong `data/` → GLB qua GLTFLoader, .ply splat qua lib gaussian-splats-3d | redteam Đòn 5, user |

## 2. Phạm vi APP — nhóm B: màn hình mới

| # | Màn | Nội dung chính | Nguồn |
|---|-----|----------------|-------|
| B1 | **Đăng nhập + Đăng ký** | SSO ưu tiên + mật khẩu + bước OTP; đăng ký → "Chờ phê duyệt"; chọn vai trò demo để thấy phân quyền đổi theo vai | user + attt C1 |
| B2 | **Báo cáo – Thống kê** | 4 biểu đồ (tiến độ số hóa theo tháng, cơ cấu loại hình, tồn đọng theo phòng, lượt khai thác API) + nút Xuất Excel/PDF | redteam Đòn 10 |
| B3 | **Kiểm kê định kỳ** | Đợt kiểm kê, phân công, đối chiếu số kiểm kê hiện vật gốc ↔ mã tài sản số, biên bản, báo cáo Sở | redteam + dam C bước 9 + Luật DSVH Đ.23 |
| B4 | **Chi tiết người dùng + ma trận phân quyền** | RBAC (vai trò × module × quyền) + ABAC (phạm vi bộ sưu tập multi-select); vòng đời tài khoản (mời/khóa/reset/MFA); lịch sử phân quyền | attt C3, mokcup UC-06 |
| B5 | **Quản lý API key** | Tên/phạm vi/hạn dùng/lần dùng cuối; tạo → hiện 1 lần duy nhất; thu hồi có lý do | attt C5 |
| B6 | **Nhật ký nâng cao** | Lọc người/hành động/thời gian + IP + kết quả; tab sự kiện bảo mật; hash-chain badge; xuất có ghi log việc xuất; banner chính sách thời hạn lưu "theo cấp độ ATTT (TCVN 11930:2017)" | attt C6 + legal + log-retention |
| B7 | **Sao lưu & khôi phục** | RPO/RTO card, lịch, điểm khôi phục có trạng thái fixity, luồng khôi phục nhiều bước, KPI bảo quản (% checksum hợp lệ, tuổi bản sao mới nhất, diễn tập gần nhất) | attt C7 + doc bảo quản |
| B8 | **Tuân thủ & quản trị dữ liệu** (hub thay khối cũ) | Sổ đăng ký tuân thủ 8 trường (văn bản/điều khoản/yêu cầu/trạng thái/chứng cứ/người/ngày rà soát/rà soát kế tiếp; không có "Đạt" trần; trạng thái "Chờ văn bản hướng dẫn"; nhóm theo văn bản có bộ đếm; xuất PDF) + **9 tab**: Hồ sơ cấp độ ATTT · DPIA (mốc 60 ngày, Mẫu số 10) · Yêu cầu chủ thể dữ liệu (đồng hồ 2 ngày phản hồi/10-15-20 ngày thực hiện) · Sự cố 72h · Danh mục dữ liệu mở (giấy phép + kênh công bố + gửi Bộ Công an) · Đánh giá rủi ro hằng năm (NĐ 165 Đ.15/17) · Kiểm toán dữ liệu (NĐ 278 Đ.13/14) · **Vòng đời & thời hạn lưu trữ** (xem quyết định dưới) | legal C+D |

> **Hai quyết định chốt sau review ma trận truy vết (doc 03):**
> - **D9 — Ký số & chứng thực bản số hóa** (Luật GDĐT Đ.12–13, NĐ 137/2024): thuộc **C1 (Chi tiết tài sản — badge ký số khi xuất bản)**, KHÔNG làm tab trong B8. Tránh trùng lặp 2 nơi.
> - **D10 — Vòng đời & thời hạn lưu trữ** (NĐ 165/2025 Đ.5): là **khoảng trống thật**, bổ sung thành **tab thứ 9 của B8**. Nội dung: bảng thời hạn lưu trữ theo từng loại tài sản + quy trình kỹ thuật lưu trữ đã ban hành + lịch rà soát; liên kết sang `02-quy-trinh-bao-quan-sao-luu.md`. Lý do đặt ở B8 chứ không phải B7: đây là **chính sách vòng đời dữ liệu** (nghĩa vụ pháp lý của chủ sở hữu dữ liệu), khác với B7 là **vận hành sao lưu kỹ thuật**.

## 3. Phạm vi APP — nhóm C: nâng cấp màn sẵn có

| # | Việc | Nguồn |
|---|------|-------|
| C1 | Chi tiết tài sản: tab Phiên bản (v1/v2, so sánh, "bản gốc bất biến"); checksum SHA-256 + trạng thái fixity ở bảng Tệp; **Quan hệ tài sản** (isRepresentationOf/hasRubbing/depicts); Rights statement + mức truy cập (Công khai/Nghiên cứu/Nội bộ); badge "chứa dữ liệu cá nhân" (gia phả/ảnh chân dung); badge ký số khi xuất bản (Luật GDĐT Đ.12, NĐ 137/2024); nút **Trả lại bổ sung** (lý do bắt buộc) + **Gỡ xuất bản**; 4-eyes: disable duyệt nếu người duyệt = người phụ trách; bước "Xin ý kiến Bộ VHTTDL" trong pipeline với di tích QGĐB (NĐ 308 Đ.87) | dam + attt + legal |
| C2 | Form metadata theo chuẩn DAM B.0–B.5: lõi DC + trường riêng từng loại; progressive disclosure; niên đại 2 lớp (chuẩn hóa + hiển thị + độ tin cậy); controlled vocabulary thay tag tự do; Hán Nôm: nguyên văn/phiên âm/dịch nghĩa/người thẩm định | dam B + redteam e |
| C3 | Pipeline 5 → 9 trạng thái: thêm QC ("Cần số hóa lại"), thẩm định nội dung (song thẩm Hán Nôm), lưu trữ-giám sát, kiểm kê; trạng thái "Đã gỡ/thu hồi" | dam C |
| C4 | Upload: checksum ngay khi nhận; cảnh báo Excel injection ("đã vô hiệu công thức động"); xác nhận xóa hàng đợi; cảnh báo vượt hạn mức | attt B8–10 |
| C5 | Share: viết lại theo NĐ 278/2025 (bỏ nhãn NĐ 47); thêm nhánh Cổng dữ liệu quốc gia/Bộ Công an (NĐ 165 Đ.10); yêu cầu chia sẻ: nút Duyệt/Từ chối/Yêu cầu bổ sung + hạn xử lý + thu hồi + số văn bản đề nghị; modal kết nối: tắt kênh bắt buộc phải nhập lý do; mốc 31/12/2026 hiển thị như deadline tuân thủ | legal + attt B16–18 |
| C6 | i18n scaffold: chuỗi tách file vi.ts, sẵn chỗ en/fr (chưa dịch) | user |

## 4. DOCS (bộ hồ sơ thầu)

| # | Tài liệu | Trạng thái |
|---|----------|-----------|
| D1 | `02-quy-trinh-bao-quan-sao-luu.md` — OAIS/PREMIS/3-2-1/fixity/DR + flowcharts mermaid | **đang viết** (agent) |
| D2 | Thuyết minh kỹ thuật theo outline 18 chương của red-team (căn cứ pháp lý dùng danh mục ĐÃ XÁC MINH; chỗ chưa xác minh giữ cờ ⚠️) | chờ |
| D3 | Ma trận truy vết UC-01…09 (mokcup/) ↔ màn hình app ↔ văn bản pháp lý | chờ |
| D4 | OpenAPI dịch vụ chia sẻ (REST + OAI-PMH) + ERD (kèm quan hệ tài sản, phiên bản, PREMIS events) | chờ |
| D5 | Phụ lục fact di sản đã đối chiếu nguồn (từ redteam E — cả phần đúng lẫn phần đã sửa) | chờ |
| D6 | Kịch bản demo 10 phút + 8 câu hỏi vặn (từ redteam D) | chờ |

## 5. Điểm bán hàng cho thuyết minh (đã có căn cứ xác minh)

- Dự án phục vụ trực tiếp **QĐ 2026/QĐ-TTg**: "100% di tích quốc gia đặc biệt được số hóa đến 2030" + **QĐ 611/QĐ-TTg (04/4/2026)**: chuẩn hóa dữ liệu theo khung chuẩn quốc gia, mã định danh số.
- Kiến trúc self-host + open-source khớp nguyên tắc **NĐ 308/2025 Đ.85**: "ưu tiên mã nguồn mở, phần mềm trong nước"; không phụ thuộc dịch vụ nước ngoài.
- Chuẩn quốc tế: OAIS ISO 14721, PREMIS, Dublin Core ISO 15836, CIDOC-CRM ISO 21127, LIDO, IIIF, RightsStatements.org — 8 đoạn lập luận viết sẵn trong reports/dam.md mục E.
- .splat chưa có chuẩn ISO → chính sách "bản dẫn xuất bảo hiểm PLY/E57 + lưu ảnh nguồn + tham số huấn luyện" — minh bạch rủi ro, ghi điểm.

## 6. Còn mở (⚠️ không trích dẫn khi chưa xác minh)

Số điều Luật ANM 116/2025; NĐ 85/2016+TT 12/2022 sau 01/7/2026 (dự thảo NĐ thay thế của BCA chưa ban hành); nghị định xử phạt BVDLCN (mới là dự thảo 03/2026); TT 39/2017 còn hiệu lực?; Luật Lưu trữ 33/2024 (chưa đối chiếu); Điều 21.6 Luật BVDLCN có miễn DPIA cho đơn vị sự nghiệp không (điểm mờ — hồ sơ nên ghi "thực hiện DPIA để an toàn"); quan hệ QĐ 611 (2026) vs QĐ 2026 (2021). WebSearch của phiên đã cạn — các mục này xác minh ở phiên sau hoặc user tra tay.
