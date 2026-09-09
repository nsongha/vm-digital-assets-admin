# Từ điển thuật ngữ

## Hệ thống quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám

| Trường | Nội dung |
|---|---|
| Mã tài liệu | VM-DOC-TN |
| Phiên bản | 1.0.0 |
| Ngày ban hành | 12/08/2026 |
| Trạng thái | Áp dụng thống nhất cho toàn bộ tài liệu và mã nguồn của dự án — mọi tài liệu mới bắt buộc dùng đúng thuật ngữ tại đây |
| Tài liệu liên quan | [`00-ke-hoach-nang-cap.md`](./00-ke-hoach-nang-cap.md) (mục 0bis–0septies, nguồn gốc phần lớn thuật ngữ) · [`adr/README.md`](./adr/README.md) và 16 ADR · [`01-thuyet-minh-ky-thuat.md`](./01-thuyet-minh-ky-thuat.md) Chương 1 (căn cứ pháp lý), Chương 7 (mô hình dữ liệu) · [`02-quy-trinh-bao-quan-sao-luu.md`](./02-quy-trinh-bao-quan-sao-luu.md) (bảo quản số) · [`04-phu-luc-fact-di-san.md`](./04-phu-luc-fact-di-san.md) · [`07-mo-hinh-du-lieu.md`](./07-mo-hinh-du-lieu.md) |

---

## Vai trò tài liệu

Tài liệu này quy định **cách dùng thống nhất** mọi thuật ngữ nghiệp vụ và kỹ thuật xuất hiện trong bộ hồ sơ và trong giao diện ứng dụng, để tránh tình trạng cùng một khái niệm được gọi bằng nhiều tên khác nhau ở các tài liệu khác nhau (nguồn gốc của nhiều sai sót đã phát hiện, xem `04-phu-luc-fact-di-san.md`). Mỗi mục nêu **thuật ngữ tiếng Việt chính thức**, **tương đương tiếng Anh hoặc mã dùng trong mã nguồn**, **định nghĩa**, và **ghi chú dùng đúng** khi có rủi ro nhầm lẫn. Mục cuối liệt kê các từ **không được dùng** kèm lý do — chủ yếu phát sinh từ đợt rà soát pháp lý 12/08/2026 phát hiện một số căn cứ pháp lý cũ dùng làm nền cho thuật ngữ trước đây đã hết hiệu lực (chi tiết tại mục "Thuật ngữ KHÔNG dùng").

---

## 1. Đối tượng và dữ liệu

| Thuật ngữ tiếng Việt | Tương đương tiếng Anh / mã trong mã nguồn | Định nghĩa | Ghi chú dùng đúng |
|---|---|---|---|
| **Dữ liệu số hóa** | `asset` (mã nguồn/API) | Từ bao trùm cho mọi bản ghi số hóa sinh ra từ hoạt động số hóa một đối tượng di sản: mesh 3D, gaussian splat, đám mây điểm, bản vẽ kỹ thuật, ảnh số, văn bản số, video, âm thanh | **KHÔNG dịch là "tài sản"** — xem mục "Thuật ngữ KHÔNG dùng" cuối tài liệu |
| **Đối tượng di sản** | physical object · `PHYSICAL_OBJECTS` | Đối tượng có thật ngoài đời (khuôn viên, công trình, hiện vật, tài liệu, tư liệu nghe nhìn); tồn tại độc lập với việc đã có bản ghi dữ liệu số hay chưa (ADR 0009) | Không gọi "tài sản vật lý" — dùng "đối tượng di sản" hoặc "đối tượng vật lý" khi cần đối lập với dữ liệu số |
| **Khuôn viên & không gian** | `precinct` (`objectClass`) | Phân khu, sân, vườn, hồ, giếng — 1 trong 5 giá trị của Trục 1 (loại đối tượng) | Ví dụ: Hồ Văn, Vườn Giám, giếng Thiên Quang, sân bia |
| **Công trình kiến trúc** | `structure` (`objectClass`) | Công trình, hạng mục xây dựng | Ví dụ: Khuê Văn Các, Văn Miếu Môn, nhà Thái Học, nhà bia |
| **Hiện vật** | `artifact` (`objectClass`) | Hiện vật theo Luật Di sản văn hóa 45/2024/QH15 (phân loại sâu: di vật / cổ vật / bảo vật quốc gia) | **KHÔNG dùng "vật phẩm"** — "hiện vật" là thuật ngữ pháp lý; xem mục "Thuật ngữ KHÔNG dùng" |
| **Tài liệu & di sản tư liệu** | `document` (`objectClass`) | Di sản tư liệu theo Chương IV Luật Di sản văn hóa 45/2024/QH15 | Ví dụ: sắc phong, bản dập văn bia, *Đại Việt lịch triều đăng khoa lục* |
| **Tư liệu nghe nhìn** | `av` (`objectClass`) | Ảnh, phim, bản thu | Ví dụ: ảnh tư liệu lịch sử, phim tư liệu, thuyết minh audio |
| **Điểm tham quan** | `DT` (tầng 1 mã định danh) | Thực thể riêng ngoài 5 loại đối tượng chính — có tọa độ, loại điểm tham quan/thuyết minh/panorama 360, trạng thái hiển thị (theo wireframe UC-03) | Không gộp vào 5 giá trị `objectClass` — phục vụ trải nghiệm tham quan, không phải phân loại di sản học |
| **Dạng dữ liệu số** (8 giá trị) | `digitalForm` | Sản phẩm số hóa tạo ra: `mesh3d`, `splat`, `pointcloud`, `drawing`, `image`, `text`, `video`, `audio` | Trục 2, độc lập với loại đối tượng — một đối tượng có thể có nhiều dạng dữ liệu số cùng lúc |
| **Bản đại diện số** | `hasRepresentation` (CIDOC-CRM P138 has representation) | Bản ghi dữ liệu số phản ánh trực tiếp hình thức của chính đối tượng vật lý (mesh 3D, splat, đám mây điểm, bản vẽ, ảnh hiện trạng) | Nhóm 1 quan hệ (0ter) — phân biệt với "đối tượng là chủ đề của tư liệu độc lập" (`depictedIn`/`mentionedIn`/`subjectOf`) |
| **Bản dẫn xuất bảo quản** | `hasPreservationSurrogate` (ADR 0008) | Bản PLY/E57 bắt buộc đi kèm mọi bản ghi splat, lưu ở tầng AIP, tham gia lịch kiểm tra fixity, KHÔNG bao giờ bị xóa | Không nhầm với `derivedFrom` (bản dẫn xuất kỹ thuật thuần túy — xóa và tái sinh tự do được từ bản gốc) |

---

## 2. Định danh

| Thuật ngữ tiếng Việt | Tương đương tiếng Anh / mã trong mã nguồn | Định nghĩa | Ghi chú dùng đúng |
|---|---|---|---|
| **Mã đối tượng** | `VM-<OC>-<NNNNN>` (tầng 1) | Mã bền vững của một đối tượng di sản; `OC` = 2 ký tự loại đối tượng (`KV`/`CT`/`HV`/`TL`/`NN`/`DT`) | KHÔNG mã hóa vị trí/trạng thái vào mã (ADR 0004) — sửa vị trí không phá mã |
| **Mã bản ghi dữ liệu số** | `…-<NNNNN>.<DF><nn>` (tầng 2) | Một dạng dữ liệu số cụ thể của đối tượng; `DF` = 3 ký tự dạng dữ liệu, `nn` = lần số hóa thứ mấy cùng dạng | Nhiều bản ghi tầng 2 có thể cùng chung một mã tầng 1 |
| **Phiên bản** | `….v<n>` (tầng 3) | Lần tái xử lý/hiệu đính của một bản ghi dữ liệu số | Bản gốc `v1` bất biến, không ghi đè |
| **Tệp dẫn xuất** | `…#<role>` (tầng 4) | Vai trò cụ thể của một tệp trong một phiên bản | `role`: `master` · `web` · `raw` · `thumb` |
| **Đợt số hóa** | `VM-DS-<YYYY>-<nn>` (tầng 5) | Gắn nhà thầu, thiết bị, hợp đồng, nghiệm thu của một đợt số hóa | |
| **Số kiểm kê hiện vật gốc** | `so_kiem_ke` | Số trong sổ kiểm kê hiện vật của Trung tâm — trường song song, KHÔNG trộn vào mã hệ thống; bắt buộc với `HV`, `TL` | Neo với mã hệ thống theo Điều 23 Luật Di sản văn hóa 45/2024/QH15; hiện khoảng 120 đối tượng còn thiếu (`16-van-de-da-biet.md` mục 5.1) |
| **Mã hồ sơ xếp hạng di tích** | `ma_ho_so_di_tich` | Mã trong hồ sơ khoa học xếp hạng di tích — trường song song, áp dụng với `KV`, `CT` | |

---

## 3. Chất lượng và khuyết giá trị

| Thuật ngữ tiếng Việt | Tương đương tiếng Anh / mã trong mã nguồn | Định nghĩa | Ghi chú dùng đúng |
|---|---|---|---|
| **Chưa xác định** | `CHUA_XAC_DINH` | Giá trị thật tồn tại nhưng chưa nghiên cứu/xác minh được — **là việc cần làm**: vào hàng đợi nghiên cứu/thẩm định, tính là "thiếu" trong % độ đầy đủ hồ sơ | **Khác "Không rõ"**: đây là hồ sơ **chưa** xong — ví dụ niên đại khánh đá mới biết "thời Nguyễn", chưa ra năm |
| **Không rõ / Khuyết danh** | `KHONG_RO` | Đã tra cứu, kết luận không thể biết được — **hồ sơ đã hoàn chỉnh**: không vào hàng đợi, tính là "đã xử lý" | **Khác "Chưa xác định"**: đây là hồ sơ **đã** xong, không bị trừ điểm chất lượng — ví dụ tác giả ảnh tư liệu thời Pháp thuộc |
| **Không áp dụng** | `KHONG_AP_DUNG` | Trường không có nghĩa với loại đối tượng này | Loại khỏi mẫu số của % độ đầy đủ hồ sơ |
| **Chưa nhập liệu** | `CHUA_NHAP` | Có ở hồ sơ giấy, chưa nhập vào hệ thống — là việc cần làm, vào hàng đợi nhập liệu | Mặc định khi nhập lô Excel để trống ô — KHÔNG được nhập thành rỗng |
| **Hạn chế công bố** | `HAN_CHE` | Có giá trị thật nhưng không công bố (bảo mật/dữ liệu cá nhân) | Bỏ phần tử khỏi API công khai, vẫn giữ nguyên trên API nội bộ |
| **Độ đầy đủ hồ sơ** (%) | completeness · `averageCompletenessPct` / `averageCompletenessPctOrNull` | Tỷ lệ % trường đã có giá trị xác định trong tổng số trường tính vào mẫu số (loại trừ `KHONG_AP_DUNG`) | Đối tượng 0 bản ghi số trả `null` ("— Chưa số hóa"), KHÔNG trả 100% (ADR 0016) |
| **Độ tin cậy niên đại** | `era_certainty` | Mức độ chắc chắn của niên đại: chắc chắn / ước tính theo phong cách nghệ thuật–khảo cổ / còn tranh cãi giữa các nguồn sử liệu | Đi kèm `era_display` (nguyên văn can chi/niên hiệu) và `era_from`/`era_to` (chuẩn hóa EDTF) |
| **EDTF** | Extended Date/Time Format — ISO 8601-2 | Chuẩn biểu diễn niên đại không chắc chắn: `1484` chắc chắn · `1484?` nghi vấn · `1484~` xấp xỉ · `18XX` thế kỷ 19 · `1740/1786` khoảng · `unknown` | Dùng cho lớp chuẩn hóa (`era_from`/`era_to`) để lọc/sắp xếp; lớp hiển thị (`era_display`) vẫn giữ nguyên văn Hán Nôm/can chi (ADR 0006) |

---

## 4. Quy trình

| Thuật ngữ tiếng Việt | Tương đương tiếng Anh / mã trong mã nguồn | Định nghĩa | Ghi chú dùng đúng |
|---|---|---|---|
| **Quy trình 9 bước** | `PIPELINE_SEQUENCE` | Trình tự chuẩn duy nhất của một bản ghi dữ liệu số: Chờ xử lý → Đang xử lý → Kiểm định chất lượng → Chờ duyệt → Thẩm định nội dung → Đã duyệt → Xuất bản → Đã lưu trữ – đang giám sát → Đã kiểm kê | Nguồn duy nhất: `app/src/data/pipeline.ts` — không khai báo lại thứ tự này ở nơi khác |
| **Cần số hóa lại** | trạng thái ngoài luồng | Nhánh THẤT BẠI của bước Kiểm định chất lượng (QC); quay lại "Đang xử lý" sau khi số hóa lại | Không tính vào "9 bước" tuần tự |
| **Đã gỡ/thu hồi** | trạng thái ngoài luồng · deaccession | Chỉ tới được từ trạng thái đã xuất bản, qua hành động "Gỡ xuất bản"; giữ nguyên bản ghi, không xóa, mã định danh không cấp lại | Không tính vào "9 bước" tuần tự |
| **Nguyên tắc bốn mắt** | four-eyes principle · `isApprovalStep` | Người đang đăng nhập không được Phê duyệt bản ghi mà chính họ là Cán bộ phụ trách — áp theo **danh tính đang đăng nhập**, không riêng vai trò "Phê duyệt" | ADR 0011; trong dữ liệu mẫu, vai trò Phê duyệt bị loại khỏi `OWNER_POOL` |
| **Song thẩm Hán Nôm** | dual review · CN-05.4 | Người dịch/phiên âm và người thẩm định nội dung Hán Nôm phải là hai tài khoản khác nhau | Bắt buộc trước khi bản ghi qua trạng thái "Đã duyệt" |
| **Trả lại bổ sung** | request revision | Người thẩm định/duyệt trả bản ghi về cho cán bộ phụ trách, bắt buộc kèm lý do | Áp dụng ở các trạng thái `REVIEWABLE_STATUSES` (Kiểm định chất lượng, Chờ duyệt, Thẩm định nội dung, Đã duyệt) |
| **Gỡ xuất bản** | unpublish | Đưa bản ghi đã xuất bản về trạng thái "Đã gỡ/thu hồi", bắt buộc kèm lý do, không xóa bản ghi | Áp dụng từ các trạng thái `PUBLISHED_STATUSES` |
| **Chốt đợt kiểm kê** | inventory batch finalize | Ký biên bản kiểm kê định kỳ — sau khi chốt, thao tác chuyển sang Tầng 2 hoàn tác (không hoàn tác trực tiếp, chỉ điều chỉnh có lý do) | Điều 23 Luật Di sản văn hóa 45/2024/QH15; màn B3 — Kiểm kê định kỳ |
| **Điều chỉnh có lý do** | reasoned amendment (ADR 0010) | Sau khi chốt/ký biên bản: bản ghi gốc **giữ nguyên**, tạo thêm bản điều chỉnh kèm lý do + người thực hiện + thời điểm, cả hai hiển thị song song trong lịch sử | Không hoàn tác ngầm sau khi chốt — khác "Hoàn tác" (Tầng 1, trước khi chốt, cửa sổ ~10 giây) |

---

## 5. Bảo quản

| Thuật ngữ tiếng Việt / viết tắt | Tương đương tiếng Anh / mã trong mã nguồn | Định nghĩa | Ghi chú dùng đúng |
|---|---|---|---|
| **OAIS** | Open Archival Information System — ISO 14721 | Mô hình tham chiếu tách bạch SIP/AIP/DIP; xương sống của quy trình bảo quản số | `02-quy-trinh-bao-quan-sao-luu.md` mục 1.3, 3 |
| **SIP** | Submission Information Package | Gói tin nộp vào hệ thống lúc thu nhận (ingest) | |
| **AIP** | Archival Information Package | Gói tin lưu trữ dài hạn, bất biến — bản gốc master + metadata PREMIS + manifest checksum | |
| **DIP** | Dissemination Information Package | Gói tin phân phối ra ngoài (bản web, bản tối ưu) | |
| **PREMIS** | Preservation Metadata: Implementation Strategies | Chuẩn ghi sự kiện bảo quản (ingest, fixity check, di trú định dạng) gắn Agent + thời gian | Sự kiện PREMIS lưu **vĩnh viễn** cùng AIP — khác nhật ký an toàn thông tin (lưu theo cấp độ ATTT, ADR 0012) |
| **Fixity / kiểm tra toàn vẹn** | fixity check | Tính lại checksum SHA-256 định kỳ, đối chiếu với manifest gốc để phát hiện bit rot/hỏng đĩa/truy cập trái phép | `02-quy-trinh-bao-quan-sao-luu.md` mục 4 |
| **Quy tắc 3-2-1** | 3-2-1 backup rule | Tối thiểu 3 bản dữ liệu, trên 2 loại phương tiện lưu trữ khác nhau, 1 bản đặt tại địa điểm khác | Nền tảng kiến trúc lưu trữ, mục 2 cùng tài liệu |
| **RPO** | Recovery Point Objective | Lượng dữ liệu tối đa có thể mất tính theo thời gian giữa hai lần sao lưu | Cam kết ≤ 24 giờ |
| **RTO** | Recovery Time Objective | Thời gian tối đa để khôi phục dịch vụ kể từ khi sự cố được xác nhận | Cam kết ≤ 4 giờ |
| **Tầng nóng** (Hot) | hot tier | Bản làm việc (proxy/preview) + bản dẫn xuất phân phối web | Có thể tái tạo lại từ AIP nếu mất — **không** tính vào 3 bản của quy tắc 3-2-1 |
| **Tầng lưu trữ AIP** (Archival) | archival tier | Bản gốc master bất biến + metadata PREMIS + manifest checksum | Ghi một lần, chỉ đọc sau khi qua QC; mọi sửa đổi tạo bản ghi phiên bản mới |
| **Tầng lạnh off-site** (Cold) | cold off-site tier | Bản sao đầy đủ của AIP, đặt tại địa điểm địa lý thứ hai, cách ly mạng một phần | Chống ransomware lan từ hệ thống chính |

---

## 6. Chuẩn và pháp lý

### 6.1. Viết tắt các chuẩn kỹ thuật

| Viết tắt | Tên đầy đủ | Vai trò áp dụng | Ghi chú dùng đúng |
|---|---|---|---|
| **CIDOC-CRM** | ISO 21127 — Conceptual Reference Model | Mô hình quan hệ hướng sự kiện giữa đối tượng di sản vật lý và bản đại diện số của nó | Nền tảng cho việc tách hai trục `objectClass`/`digitalForm` (ADR 0003) |
| **LIDO** | Lightweight Information Describing Objects | Chuẩn trao đổi dữ liệu bảo tàng | |
| **Dublin Core / TCVN 7980** | ISO 15836-1/-2 · TCVN 7980-1:2024, TCVN 7980-2:2024 | Bộ yếu tố siêu dữ liệu lõi | Dublin Core **đã là tiêu chuẩn quốc gia Việt Nam** (thay thế TCVN 7980:2015) — không chỉ viện dẫn chuẩn nước ngoài |
| **IIIF** | International Image Interoperability Framework | Phân phối ảnh tư liệu độ phân giải cao, phóng to sâu, nhúng liên thông | Thuộc phạm vi giai đoạn 2 |
| **OAI-PMH** | Open Archives Initiative Protocol for Metadata Harvesting | Giao thức thu hoạch siêu dữ liệu phục vụ liên thông thư viện, viện nghiên cứu | |
| **WCAG** | Web Content Accessibility Guidelines 2.1 mức AA | Cam kết trợ năng của giao diện | |
| **ISO 25010 / ISO 25012** | Systems and software Quality Requirements and Evaluation (SQuaRE) | ISO 25010: mô hình chất lượng phần mềm; ISO 25012: mô hình chất lượng dữ liệu (15 đặc tính), đo bằng ISO/IEC 25024 | `12-chat-luong-du-lieu.md` |

### 6.2. Văn bản pháp lý chủ chốt (đầy đủ số hiệu)

> Danh mục đầy đủ và diễn giải điều khoản ở `01-thuyet-minh-ky-thuat.md` Chương 1. Bảng dưới chỉ nêu tên và số hiệu chính xác để trích dẫn thống nhất — không diễn giải lại nội dung điều khoản.

| Tên gọi ngắn dùng trong tài liệu | Số hiệu đầy đủ, ngày ban hành/hiệu lực |
|---|---|
| Luật Di sản văn hóa | Luật Di sản văn hóa số 45/2024/QH15 (23/11/2024; hiệu lực 01/7/2025) |
| Nghị định 308/2025 | Nghị định 308/2025/NĐ-CP (28/11/2025; hiệu lực 15/01/2026) — Chương VIII chuyển đổi số trong lĩnh vực di sản văn hóa |
| Luật Dữ liệu số | Luật Dữ liệu số 60/2024/QH15 (30/11/2024; hiệu lực 01/7/2025) |
| Nghị định 165/2025 | Nghị định 165/2025/NĐ-CP (30/6/2025; hiệu lực 01/7/2025) |
| Nghị định 278/2025 | Nghị định 278/2025/NĐ-CP (22/10/2025; hiệu lực từ ngày ký) — kết nối, chia sẻ dữ liệu bắt buộc; Điều 23 bãi bỏ văn bản cũ cùng lĩnh vực (xem mục "Thuật ngữ KHÔNG dùng"); Điều 24 mốc hoàn thành kết nối 31/12/2026 |
| Luật Bảo vệ dữ liệu cá nhân (BVDLCN) | Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (26/6/2025; hiệu lực 01/01/2026) |
| Nghị định 356/2025 | Nghị định 356/2025/NĐ-CP (31/12/2025; hiệu lực 01/01/2026) — thay thế toàn bộ nghị định cũ cùng lĩnh vực (xem mục "Thuật ngữ KHÔNG dùng") |
| Luật An ninh mạng | Luật An ninh mạng số 116/2025/QH15 (10/12/2025; hiệu lực 01/7/2026) |
| Luật Giao dịch điện tử (GDĐT) | Luật Giao dịch điện tử số 20/2023/QH15 (hiệu lực 01/7/2024) |
| Nghị định 137/2024 | Nghị định 137/2024/NĐ-CP (23/10/2024) — hướng dẫn chức năng ký số khi chuyển đổi văn bản giấy sang thông điệp dữ liệu |
| Luật Lưu trữ | Luật Lưu trữ số 33/2024/QH15 (21/6/2024; hiệu lực 01/7/2025) |
| Thông tư 05/2025/TT-BNV | Thông tư 05/2025/TT-BNV (14/5/2025; hiệu lực 01/7/2025) — nghiệp vụ lưu trữ tài liệu lưu trữ số, nguồn chuẩn định dạng số hóa |
| TCVN 11930:2017 | Yêu cầu cơ bản về an toàn hệ thống thông tin theo cấp độ — nguồn con số thời hạn lưu nhật ký hệ thống theo cấp độ ATTT |
| Quyết định 548/QĐ-TTg | Quyết định 548/QĐ-TTg (10/5/2012) — xếp hạng Văn Miếu — Quốc Tử Giám là Di tích quốc gia đặc biệt |
| Quyết định 2026/QĐ-TTg | Quyết định 2026/QĐ-TTg (02/12/2021) — Chương trình số hóa Di sản văn hóa Việt Nam 2021–2030 |
| Quyết định 611/QĐ-TTg (2026) | Quyết định 611/QĐ-TTg (04/4/2026) — Đề án chuyển đổi số lĩnh vực văn hóa; **bắt buộc ghi kèm năm** — có một Quyết định 611/QĐ-TTg khác (08/7/2024) thuộc lĩnh vực môi trường |

---

## Thuật ngữ KHÔNG dùng

> Đây là mục duy nhất của tài liệu được phép nhắc tới Nghị định 47/2020/NĐ-CP và Nghị định 13/2023/NĐ-CP — với vai trò đính chính, không phải căn cứ áp dụng. Mọi tài liệu khác của bộ hồ sơ **không** viện dẫn hai văn bản này.

| Từ/căn cứ sai | Thay bằng | Lý do |
|---|---|---|
| **Tài sản** | Dữ liệu số hóa | Dễ nhầm với tài sản công theo nghĩa kế toán/quản lý tài sản nhà nước. Tiếng Anh trong mã nguồn/API vẫn giữ `asset` làm từ bao trùm kỹ thuật, nhưng tiếng Việt **không** dịch là "tài sản" (chốt tại `00-ke-hoach-nang-cap.md` mục 0bis) |
| **Vật phẩm** | Hiện vật | "Hiện vật" là thuật ngữ pháp lý dùng trong Luật Di sản văn hóa 45/2024/QH15 (phân loại di vật/cổ vật/bảo vật quốc gia); "vật phẩm" không có căn cứ pháp lý và không phân loại được theo luật |
| **"Chia sẻ mặc định"** | Phân loại theo Nghị định 278/2025/NĐ-CP: kết nối qua nền tảng tích hợp, chia sẻ dữ liệu / điều phối dữ liệu / công khai dữ liệu mở | Thuật ngữ cũ thuộc Nghị định 47/2020/NĐ-CP — đã bị **bãi bỏ** theo Điều 23 Nghị định 278/2025/NĐ-CP (22/10/2025) |
| **"Theo yêu cầu đặc thù"** | Yêu cầu chia sẻ dữ liệu (quy trình Duyệt / Từ chối / Yêu cầu bổ sung theo Nghị định 278/2025/NĐ-CP) | Như trên — thuật ngữ cũ thuộc Nghị định 47/2020/NĐ-CP đã bị bãi bỏ |
| Viện dẫn **Nghị định 47/2020/NĐ-CP** làm căn cứ chia sẻ dữ liệu | Nghị định 278/2025/NĐ-CP | Nghị định 47/2020/NĐ-CP đã bị bãi bỏ toàn bộ theo Điều 23 Nghị định 278/2025/NĐ-CP — không viện dẫn trong bất kỳ tài liệu nào của hồ sơ |
| Viện dẫn **Nghị định 13/2023/NĐ-CP** làm căn cứ bảo vệ dữ liệu cá nhân | Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 + Nghị định 356/2025/NĐ-CP | Nghị định 13/2023/NĐ-CP hết hiệu lực 01/01/2026, được thay thế toàn bộ bởi Nghị định 356/2025/NĐ-CP |
| Thời hạn lưu nhật ký **"12 tháng"** theo Nghị định 53/2022/NĐ-CP | Thời hạn theo cấp độ an toàn thông tin đã phê duyệt (TCVN 11930:2017: cấp 2 ≥ 1 tháng · cấp 3 ≥ 3 tháng · cấp 4 ≥ 6 tháng · cấp 5 ≥ 12 tháng) | Nghị định 53/2022/NĐ-CP chỉ áp dụng doanh nghiệp viễn thông/Internet, **không** áp dụng đơn vị sự nghiệp công lập như Trung tâm (ADR 0012) |

---

*Hết tài liệu. Thuật ngữ mới phát sinh trong quá trình phát triển phải được bổ sung vào đây trước khi dùng ở tài liệu hoặc giao diện khác, theo quy ước tại `CONTRIBUTING.md`.*
