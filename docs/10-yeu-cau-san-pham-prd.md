# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD)
## Phần mềm quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám

| Trường | Nội dung |
|---|---|
| Mã tài liệu | VMQTG-DS-10 |
| Tên tài liệu | Tài liệu Yêu cầu Sản phẩm (Product Requirements Document — PRD) |
| Phiên bản | 1.0.0 |
| Ngày ban hành | 12/08/2026 |
| Trạng thái | Dự thảo trình chủ đầu tư — phục vụ hồ sơ dự thầu |
| Phạm vi | Trọng tâm là Giai đoạn 1; Giai đoạn 2 chỉ nêu ở mức định hướng để làm rõ ranh giới, không đặc tả chi tiết |

**Tài liệu liên quan (đường dẫn tương đối từ `docs/`):**

| Tài liệu | Vai trò đối với tài liệu này |
|---|---|
| `./09-dac-ta-yeu-cau-srs.md` | Đặc tả kỹ thuật theo ISO/IEC/IEEE 29148 — hệ thống PHẢI làm gì, tiêu chí nghiệm thu. PRD không lặp lại, chỉ trỏ sang bằng mã yêu cầu (YC-CN-xx.y) khi cần chi tiết |
| `./01-thuyet-minh-ky-thuat.md` | Thuyết minh đầy đủ cho hồ sơ thầu: căn cứ pháp lý, kiến trúc, hạ tầng, chi phí, lộ trình 18 chương |
| `./03-ma-tran-truy-vet.md` | Đối chiếu wireframe hồ sơ thầu ↔ màn hình ứng dụng ↔ căn cứ pháp lý ↔ chuẩn quốc tế |
| `./16-van-de-da-biet.md` | Hạn chế, nợ kỹ thuật, phụ thuộc bên ngoài đã biết của bản 1.0.0 |
| `./00-ke-hoach-nang-cap.md` | Nguồn các quyết định thiết kế gốc (thuật ngữ, mã định danh, mã khuyết giá trị...) |
| `./13-ke-hoach-quan-ly-du-an.md` | Rủi ro dự án, tổ chức, lịch trình — khác với rủi ro sản phẩm ở mục 9 tài liệu này |
| `./adr/README.md` | 16 quyết định kiến trúc (ADR) — vì sao thiết kế như vậy |

---

> **Vai trò của tài liệu này.** Tài liệu trả lời ba câu hỏi mà đặc tả kỹ thuật không trả lời: **vì sao** làm sản phẩm này, **cho ai**, và **thành công nghĩa là gì**. Nó cũng nói rõ **cái gì cố tình không làm** ở giai đoạn 1, để hội đồng và đội triển khai không phải suy đoán. Tài liệu viết ở tầng sản phẩm và nghiệp vụ — nơi nào cần chi tiết "hệ thống phải làm gì" và "nghiệm thu bằng cách nào," tài liệu trỏ sang `09-dac-ta-yeu-cau-srs.md` hoặc `01-thuyet-minh-ky-thuat.md` bằng mã yêu cầu hoặc số chương, không chép lại.

---

## 1. Bối cảnh và vấn đề

### 1.1. Hiện trạng

Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám đã thực hiện nhiều đợt số hóa (quét 3D, gaussian splat, ảnh tư liệu, bản dập văn bia...) qua nhiều năm, do nhiều đơn vị thi công khác nhau thực hiện. Kết quả số hóa hiện nằm rải rác trên ổ cứng rời và máy trạm cá nhân của cán bộ phụ trách từng đợt; Trung tâm chưa có một kho dữ liệu số tập trung, chưa có công cụ quản lý xuyên suốt vòng đời dữ liệu. Mô tả đầy đủ hiện trạng theo từng loại đối tượng di sản xem `01-thuyet-minh-ky-thuat.md` mục 2.1.

### 1.2. Sáu vấn đề cụ thể và hệ quả thực tế

| # | Vấn đề | Hệ quả thực tế |
|---|---|---|
| 1 | Dữ liệu số hóa phân tán theo đợt, theo người, theo phương tiện lưu trữ — không có kho tập trung, không có danh mục thống nhất | Khi cán bộ phụ trách một đợt số hóa nghỉ việc hoặc chuyển công tác, không ai biết kết quả quét 3D của công trình đó đang nằm ở đâu; nhiều trường hợp phải số hóa lại một đối tượng đã từng được số hóa vì không tìm lại được kết quả cũ |
| 2 | Không có công cụ tra cứu theo tên, niên đại, khu vực, loại tư liệu; không tìm được toàn văn nội dung Hán Nôm | Một câu hỏi nghiệp vụ đơn giản như "còn ảnh tư liệu nào chụp Khuê Văn Các trước năm 2000 không" không trả lời được trong một buổi làm việc — phải dò từng thư mục hoặc hỏi trực tiếp đồng nghiệp |
| 3 | Không biết công trình, hiện vật nào đã số hóa và nào chưa — không có sổ đăng ký đối tượng di sản độc lập với các tệp đã có | Không lập được báo cáo tiến độ số hóa theo chỉ tiêu Quyết định 2026/QĐ-TTg vì không có mẫu số đáng tin cậy (tổng số đối tượng cần số hóa); kế hoạch đợt số hóa tiếp theo dựa trên trí nhớ cá nhân thay vì danh sách còn thiếu |
| 4 | Tư liệu Hán Nôm (sắc phong, bản dập văn bia, đăng khoa lục) không có bản phiên âm — dịch nghĩa đi kèm | Mỗi lần cần khai thác nội dung một văn bia phải mời lại chuyên gia Hán Nôm đọc từ đầu; không tra cứu được nội dung qua tìm kiếm; tư liệu gốc phải mang ra đọc lại nhiều lần, làm tăng rủi ro hư hại vật lý |
| 5 | Dữ liệu số không neo được với số kiểm kê hiện vật gốc trong sổ giấy của Trung tâm | Đợt kiểm kê định kỳ theo Điều 23 Luật Di sản văn hóa 45/2024/QH15 phải đối chiếu thủ công giữa sổ giấy và các thư mục tệp; không phát hiện được trường hợp hiện vật có số kiểm kê nhưng chưa số hóa, hoặc có dữ liệu số nhưng chưa xác định thuộc hiện vật nào |
| 6 | Không có quy trình phê duyệt, kiểm tra toàn vẹn hay sao lưu có hệ thống trước khi công bố nội dung ra ngoài | Nội dung về một di tích quốc gia đặc biệt có thể được đưa lên môi trường mạng mà không qua bước kiểm duyệt có lưu vết; một tệp hỏng có thể nằm im nhiều năm không ai phát hiện, cho tới khi cần dùng thì không còn cách khôi phục |

> Sáu vấn đề trên là góc nhìn *sản phẩm — vì sao cần làm*; phân tích kỹ thuật đầy đủ (khối lượng tư liệu, đặc điểm từng loại đối tượng) xem `01-thuyet-minh-ky-thuat.md` mục 2.1–2.2.

---

## 2. Cơ hội và căn cứ chính sách

Văn Miếu — Quốc Tử Giám là Di tích quốc gia đặc biệt (Quyết định 548/QĐ-TTg, 10/5/2012) và có 82 bia Tiến sĩ được UNESCO ghi danh Di sản tư liệu thế giới (khu vực châu Á — Thái Bình Dương 2010, toàn cầu 2011) — thuộc nhóm ưu tiên cao nhất của các chương trình số hóa quốc gia. Bốn văn bản dưới đây là căn cứ trực tiếp trả lời câu hỏi "vì sao làm sản phẩm này vào lúc này," không phải danh mục pháp lý đầy đủ của dự án (toàn bộ tám nhóm văn bản đã đối chiếu xem `01-thuyet-minh-ky-thuat.md` Chương 1).

| Văn bản | Nội dung cốt lõi | Ý nghĩa đối với sản phẩm |
|---|---|---|
| **Quyết định 2026/QĐ-TTg** (02/12/2021) | "100% các di tích quốc gia đặc biệt được số hóa và ứng dụng trên các nền tảng số" đến năm 2030 *(tình trạng hiệu lực hiện hành: cần đối chiếu nguyên văn trước khi nộp)* | Sản phẩm là công cụ để đo và đạt chỉ tiêu này — không có sổ đăng ký đối tượng và kho dữ liệu tập trung thì không đo được "đã số hóa bao nhiêu phần trăm" (xem vấn đề #3, mục 1.2) |
| **Quyết định 611/QĐ-TTg** (04/4/2026) | "80% di sản văn hóa số công có mã định danh số để xác lập quyền sở hữu, kiểm soát khai thác"; chuẩn hóa dữ liệu theo khung chuẩn quốc gia | Lý do trực tiếp cho hệ thống mã định danh 5 tầng và bộ siêu dữ liệu chuẩn hóa của sản phẩm (chi tiết kỹ thuật: `00-ke-hoach-nang-cap.md` mục 0quater) |
| **Nghị định 278/2025/NĐ-CP** (22/10/2025), Điều 24 | Hoàn thành kết nối, chia sẻ dữ liệu bắt buộc giữa các cơ quan thuộc hệ thống chính trị trước **31/12/2026** | Mốc cứng cho phân hệ kết nối và chia sẻ dữ liệu — đây là hạng mục "phải xong trước một ngày cụ thể," không phải việc làm khi có thời gian rảnh |
| **Luật Di sản văn hóa 45/2024/QH15** + **Nghị định 308/2025/NĐ-CP** | Điều 23 Luật (kiểm kê di tích); Điều 85 Luật (tích hợp, liên thông CSDL quốc gia về di sản văn hóa); Chương VIII NĐ 308/2025 — Điều 85–89 (chuyển đổi số trong lĩnh vực di sản văn hóa) | Căn cứ trực tiếp cho phân hệ kiểm kê định kỳ có đối chiếu số kiểm kê hiện vật gốc (giải quyết vấn đề #5), và cho quy trình kiểm duyệt trước khi công bố (giải quyết vấn đề #6) |

Điểm cần nêu trong hồ sơ: dự án không phải một sáng kiến tự phát mà là bước triển khai cụ thể các chỉ tiêu đã được Thủ tướng Chính phủ giao và nghĩa vụ pháp lý đã có hiệu lực — cơ hội ở đây không chỉ là "làm cho tốt hơn" mà là điều kiện để Trung tâm hoàn thành đúng hạn các nghĩa vụ báo cáo, kết nối và kiểm kê đã có mốc thời gian cụ thể.

---

## 3. Người dùng mục tiêu

Năm chân dung dưới đây là các vai trò trực tiếp thao tác trên sản phẩm ở giai đoạn 1 (danh sách đầy đủ hơn, gồm cả vai trò khai thác gián tiếp qua kết nối, xem `01-thuyet-minh-ky-thuat.md` mục 3.5).

### 3.1. Cán bộ kỹ thuật số hóa

- **Công việc hằng ngày:** vận hành thiết bị quét 3D/máy quét, chụp ảnh tư liệu tại hiện trường, chuyển tệp về kho, kiểm tra sơ bộ chất lượng tệp thô trước khi bàn giao cho biên tập.
- **Khó khăn hiện tại:** tải tệp dung lượng lớn (nhiều GB) qua mạng không ổn định phải làm lại từ đầu khi mất kết nối giữa chừng; không biết chắc một tệp đã "vào hệ thống" thành công hay chưa; không có tiêu chí chất lượng thống nhất nên mỗi người tự đánh giá theo kinh nghiệm riêng.
- **Điều họ cần từ sản phẩm:** tải lên chịu lỗi (tiếp tục được khi mạng gián đoạn, không phải tải lại từ đầu); kiểm tra chất lượng tự động ngay khi nhận tệp; biết ngay kết quả đạt/không đạt và lý do nếu không đạt.
- **Tiêu chí đánh giá sản phẩm tốt:** tải một tệp vài GB không phải lo mất giữa chừng; biết rõ khi nào "xong phần việc của mình" để bản ghi tự động chuyển sang bước biên tập.

### 3.2. Biên tập viên / chuyên gia thẩm định Hán Nôm

- **Công việc hằng ngày:** nhập siêu dữ liệu cho bản ghi dữ liệu số; với tư liệu Hán Nôm, nhập nguyên văn — phiên âm — dịch nghĩa; thẩm định song song bản dịch của đồng nghiệp trước khi trình duyệt.
- **Khó khăn hiện tại:** không có biểu mẫu chuẩn cho tư liệu Hán Nôm nên mỗi người ghi một kiểu khác nhau; niên đại ghi tự do (lẫn chữ số, can chi, niên hiệu) không lọc và sắp xếp được; phải tự nhớ hoặc tra tay bảng quy đổi can chi sang dương lịch.
- **Điều họ cần từ sản phẩm:** biểu mẫu ba lớp nguyên văn/phiên âm/dịch nghĩa có kiểm soát chất lượng nhập liệu; niên đại nhập theo can chi và tự động quy đổi hai chiều; phân vai rõ ràng ai đã dịch, ai đã thẩm định, không thể nhầm lẫn.
- **Tiêu chí đánh giá sản phẩm tốt:** gõ "Nhâm Tuất" ra đúng các khoa thi liên quan; hệ thống tự chặn khi một người cố thẩm định chính bản dịch của mình.

### 3.3. Cán bộ phê duyệt

- **Công việc hằng ngày:** xét duyệt nội dung trước khi xuất bản, trả lại yêu cầu bổ sung kèm lý do, ký duyệt kết quả các đợt kiểm kê định kỳ.
- **Khó khăn hiện tại:** không có hàng đợi việc cần duyệt tập trung nên không biết còn bao nhiêu hồ sơ đang chờ mình xử lý; việc trả lại không có chỗ ghi lý do rõ ràng nên biên tập không biết cần sửa gì; có nguy cơ vô tình duyệt một hồ sơ do chính mình phụ trách.
- **Điều họ cần từ sản phẩm:** hàng đợi duyệt theo đúng phạm vi phụ trách, có hạn xử lý và cảnh báo quá hạn; bắt buộc nhập lý do khi trả lại hoặc từ chối; hệ thống tự động chặn khi người duyệt trùng người phụ trách bản ghi.
- **Tiêu chí đánh giá sản phẩm tốt:** mở hệ thống một lần là biết ngay có bao nhiêu việc đang chờ và việc nào đã quá hạn; không phải tự nhớ nguyên tắc "không tự duyệt bài của mình" vì hệ thống đã chặn hộ.

### 3.4. Lãnh đạo Trung tâm

- **Công việc hằng ngày:** theo dõi tiến độ số hóa tổng thể, báo cáo lên Sở Văn hóa và Thể thao Hà Nội, ký duyệt xuất bản/chia sẻ ở cấp cao, trả lời chất vấn của hội đồng hoặc đoàn kiểm tra.
- **Khó khăn hiện tại:** không có số liệu tổng hợp đáng tin cậy — mỗi lần cần báo cáo phải yêu cầu tổng hợp thủ công từ nhiều người; không chắc số liệu báo cáo tháng này có nhất quán với số liệu đã báo cáo tháng trước hay không.
- **Điều họ cần từ sản phẩm:** báo cáo — thống kê xuất được Excel/PDF theo mẫu, mọi con số tính từ một nguồn dữ liệu duy nhất, xem được tiến độ theo tháng và tồn đọng theo phòng/người.
- **Tiêu chí đánh giá sản phẩm tốt:** khi hội đồng hỏi "bao nhiêu phần trăm hiện vật đã số hóa," trả lời được ngay bằng một con số có thể giải trình nguồn gốc, không cần hỏi lại cấp dưới.

### 3.5. Quản trị hệ thống

- **Công việc hằng ngày:** quản lý tài khoản và phân quyền, quản lý khóa API, theo dõi tình trạng sao lưu, xử lý sự cố kỹ thuật; thường kiêm nhiệm thêm vai trò bảo vệ dữ liệu cá nhân và bảo quản số.
- **Khó khăn hiện tại:** là người kiêm nhiệm nhiều việc khác, không có thời gian kiểm tra thủ công tình trạng sao lưu và toàn vẹn dữ liệu hằng ngày; không có cảnh báo chủ động khi phát sinh bất thường.
- **Điều họ cần từ sản phẩm:** chỉ số bảo quản số hiển thị trực quan cho người không chuyên sâu công nghệ thông tin (tỷ lệ checksum hợp lệ, tuổi bản sao lưu mới nhất); cảnh báo tự động thay vì phải tự kiểm tra; quy trình khôi phục có hướng dẫn từng bước.
- **Tiêu chí đánh giá sản phẩm tốt:** không phải tự nhớ lịch kiểm tra thủ công vì hệ thống tự nhắc; một người kiêm nhiệm vẫn xử lý được sự cố thông thường mà không phải gọi nhà thầu.

---

## 4. Tuyên bố sản phẩm

Phần mềm quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám là một **hệ thống quản trị dữ liệu số hóa di sản** cho một đơn vị quản lý di tích quốc gia đặc biệt — không phải một phần mềm quản lý tệp thông thường. Ba khác biệt cốt lõi làm nên sản phẩm: **(một)** tách bạch đối tượng di sản có thật khỏi bản số hóa của nó — hệ thống biết Khuê Văn Các là một công trình mang số kiểm kê, có thể có nhiều dạng dữ liệu số khác nhau, chứ không coi nó là một thư mục chứa tệp; **(hai)** quản trị tuân thủ được tích hợp sẵn trong luồng nghiệp vụ — quy trình duyệt bốn mắt, ký số khi xuất bản, sổ đăng ký tuân thủ theo khung pháp lý dữ liệu 2024–2026 là một phần của việc xuất bản một bản ghi, không phải giấy tờ làm thêm sau khi xong việc; **(ba)** bảo quản dài hạn theo chuẩn lưu trữ số quốc tế (OAIS, PREMIS, checksum, phiên bản bất biến) — dữ liệu số hóa được coi là tri thức cần giữ trong hàng chục năm, không phải tệp làm việc có thể ghi đè hay xóa khi hết chỗ.

---

## 5. Phạm vi theo giai đoạn

| Tính năng | Giai đoạn 1 | Giai đoạn 2 | Lý do xếp giai đoạn |
|---|---|---|---|
| Kho dữ liệu số tập trung + sổ đăng ký đối tượng di sản (5 loại) | Có | — | Nền tảng của mọi tính năng khác; không có thì không giải quyết được vấn đề #1–#3 (mục 1.2) |
| Mã định danh 5 tầng, neo với số kiểm kê hiện vật gốc | Có | — | Đáp ứng trực tiếp Quyết định 611/QĐ-TTg; điều kiện để đợt kiểm kê định kỳ đối chiếu được |
| Siêu dữ liệu chuẩn hóa + Hán Nôm ba lớp (nguyên văn/phiên âm/dịch nghĩa) | Có | Mở rộng nội dung đa ngữ | Giải quyết vấn đề #4 ngay; dịch nội dung sang ngôn ngữ khác không phải điều kiện tiên quyết để khai thác nội bộ |
| Tìm kiếm không dấu, tìm nâng cao, tìm toàn văn trên nội dung Hán Nôm đã nhập tay | Có | Tìm trên kết quả nhận dạng ký tự tự động | OCR/HTR Hán Nôm cổ chưa đủ tin cậy để thay thế nội dung do người nhập |
| Quy trình duyệt ba cấp, nguyên tắc bốn mắt, ký số khi xuất bản | Có | — | Điều kiện pháp lý để công bố nội dung (Điều 89 Nghị định 308/2025/NĐ-CP), không thể trì hoãn |
| Phiên bản hóa, kiểm tra toàn vẹn định kỳ, sao lưu | Có | — | Bảo quản dài hạn phải có từ ngày vận hành đầu tiên, không phải hạng mục "thêm sau" |
| Báo cáo — thống kê, xuất Excel/PDF | Có | Báo cáo động, phân tích nâng cao | Là chỉ tiêu nghiệm thu MT-04/MT-08 của giai đoạn 1 |
| Kiểm kê định kỳ, đối chiếu số kiểm kê hiện vật gốc | Có | — | Nghĩa vụ Điều 23 Luật Di sản văn hóa 45/2024/QH15 áp dụng ngay khi vận hành |
| Kết nối, chia sẻ dữ liệu qua nền tảng Thành phố; công bố dữ liệu mở | Có | Mở API cho cộng đồng nghiên cứu ngoài khu vực nhà nước | Mốc cứng 31/12/2026 (Điều 24 Nghị định 278/2025/NĐ-CP); mở rộng ra ngoài nhà nước cần chính sách cấp phép riêng, chưa xây dựng |
| Trợ giúp & tra cứu nghĩa vụ pháp lý (hồ sơ cấp độ ATTT, DPIA, sự cố 72 giờ, đánh giá rủi ro hằng năm...) — hướng dẫn thực hiện kèm chức danh chịu trách nhiệm, không phải bảng tự tuyên bố ([ADR-0020](adr/0020-tro-giup-tra-cuu-thay-bang-tuyen-bo-tuan-thu.md)) | Có | Ghi nhận xác nhận có người ký (cần backend) | Nghĩa vụ pháp lý phát sinh ngay khi hệ thống có tài khoản người dùng và xử lý dữ liệu cá nhân |
| Người dùng, phân quyền RBAC kết hợp ABAC, xác thực hai yếu tố | Có | — | Điều kiện an toàn tối thiểu để vận hành, không thể thêm sau |
| Cổng tham quan số phục vụ công chúng (bản đồ 3D toàn khu, thuyết minh đa phương tiện) | — | Có | Phục vụ nhóm người dùng khác (khách tham quan) với nhóm người dùng giai đoạn 1 (cán bộ nội bộ); phụ thuộc giai đoạn 1 vận hành ổn định trước |
| Đa ngữ đầy đủ (dịch toàn bộ giao diện và nội dung sang tiếng Anh/Pháp) | Chỉ khung dữ liệu (đã có khóa ngôn ngữ) | Nội dung dịch đầy đủ | Dịch nội dung là khối lượng công việc biên tập lớn, ưu tiên sau khi nội dung tiếng Việt đạt chuẩn |
| Nhận dạng ký tự Hán Nôm tự động (OCR/HTR) và công cụ hiệu đính | — | Có | Xem lý do tại mục "Cố tình không làm" bên dưới |
| Trợ lý hỏi đáp dựa trên trí tuệ nhân tạo phục vụ tra cứu nội bộ | — | Có | Cần một khối lượng dữ liệu đã chuẩn hóa và đáng tin cậy làm nền trước |
| IIIF, thực tế ảo/thực tế tăng cường, mở API cho nghiên cứu ngoài nhà nước | — | Có | Phục vụ khai thác mở rộng, không phải hạ tầng lõi giữ — tra cứu — chia sẻ dữ liệu |
| Ứng dụng di động riêng | — | Chưa có trong cam kết lộ trình | Không phải kênh làm việc chính của người dùng nội bộ; nêu rõ để không suy đoán, không đưa vào giai đoạn 2 mặc định |

### 5.1. Cố tình KHÔNG làm ở giai đoạn 1

Năm ranh giới dưới đây được quyết định chủ động, không phải bị bỏ sót — mỗi mục nêu kèm lý do để hội đồng không phải suy đoán "vì sao chưa có":

- **Cổng tham quan số phục vụ công chúng.** Nguyên tắc thiết kế của dự án là "giữ được dữ liệu — tra cứu được dữ liệu — chia sẻ được dữ liệu đúng quy định" trước, "phục vụ công chúng và thông minh hóa" sau (xem `01-thuyet-minh-ky-thuat.md` mục 2.4). Người dùng giai đoạn 1 là cán bộ nội bộ và cơ quan nhà nước khai thác qua kết nối, không phải khách tham quan — xây cổng công chúng trước khi có dữ liệu đã chuẩn hóa đáng tin cậy là làm ngược thứ tự.
- **Nhận dạng ký tự Hán Nôm tự động (OCR/HTR).** Chữ Hán Nôm cổ, viết tay, nhiều trường hợp mờ hỏng theo thời gian — độ chính xác của công nghệ nhận dạng hiện tại không đủ tin cậy để thay thế người dịch mà không tạo rủi ro nội dung sai bị công bố (liên hệ trực tiếp tới rủi ro R-01 dự án, `13-ke-hoach-quan-ly-du-an.md` mục 8). Giai đoạn 1 vẫn thiết kế sẵn trường lưu kết quả nhận dạng trong lược đồ tư liệu Hán Nôm để giai đoạn 2 không phải chuyển đổi lại dữ liệu.
- **Trợ lý hỏi đáp dựa trên trí tuệ nhân tạo.** Một trợ lý tra cứu chỉ hữu ích khi có khối lượng dữ liệu đã chuẩn hóa và đáng tin cậy làm nền; xây dựng trước khi có nền dữ liệu vững là đầu tư vào một tính năng không có gì đáng tin để trả lời.
- **Đa ngữ đầy đủ.** Kiến trúc dữ liệu giai đoạn 1 đã có khóa ngôn ngữ sẵn sàng cho tiếng Anh/Pháp, nhưng dịch toàn bộ nội dung là khối lượng công việc biên tập lớn — ưu tiên hoàn thiện và thẩm định nội dung tiếng Việt trước, tránh vừa dịch vừa sửa lại bản gốc nhiều lần.
- **Ứng dụng di động.** Người dùng chính của giai đoạn 1 (cán bộ số hóa, biên tập, phê duyệt) thao tác với tệp lớn và biểu mẫu chi tiết trên máy trạm, không phải kênh làm việc phù hợp cho di động; chưa có nhu cầu nghiệp vụ xác định để đưa vào lộ trình.

---

## 6. Chỉ số thành công

> Sản phẩm hiện ở bản trình duyệt phục vụ hồ sơ dự thầu (xem `16-van-de-da-biet.md`), chưa vận hành với dữ liệu và người dùng thật — phần lớn cột "mốc hiện tại" vì vậy ghi **"chưa đo"** thay vì suy đoán một con số. Mục tiêu 6/12 tháng chỉ điền khi có căn cứ nguồn (chỉ tiêu đã cam kết trong thuyết minh kỹ thuật) hoặc để trống với ghi chú lý do.

| Chỉ số | Cách đo | Mốc hiện tại | Mục tiêu 6 tháng | Mục tiêu 12 tháng |
|---|---|---|---|---|
| Tỷ lệ đối tượng di sản đã số hóa | Số đối tượng có ≥ 1 bản ghi dữ liệu số ÷ tổng số đối tượng trong sổ đăng ký | Chưa đo | Chưa đo — chỉ đặt được sau khi có sổ đăng ký đầy đủ ở đợt chuyển đổi dữ liệu (Đợt 7, `13-ke-hoach-quan-ly-du-an.md`) | Chưa đo |
| % độ đầy đủ hồ sơ | Theo công thức mã khuyết giá trị (loại `KHONG_AP_DUNG` khỏi mẫu số; tính `CHUA_XAC_DINH`/`CHUA_NHAP` là thiếu) — xem `00-ke-hoach-nang-cap.md` mục 0quinquies | Chưa đo | Chưa đo | Chưa đo |
| Số đối tượng thiếu số kiểm kê hiện vật gốc | Đếm bản ghi có trường `so_kiem_ke` mang mã `CHUA_NHAP`/`CHUA_XAC_DINH` | Khoảng 120 đối tượng ghi nhận tại rà soát danh mục mẫu (`16-van-de-da-biet.md` mục 5.1) — phụ thuộc dữ liệu Trung tâm cung cấp | Chưa đặt mốc — phụ thuộc tiến độ Trung tâm hoàn thiện sổ kiểm kê giấy, ngoài kiểm soát của sản phẩm | Chưa đặt mốc; mục tiêu định hướng là giảm về 0, không cam kết thời điểm cụ thể |
| Thời gian trung bình từ tải lên đến xuất bản | (Thời điểm xuất bản − thời điểm tải lên) trung bình theo tháng | Chưa đo — chưa vận hành thật | Chưa đo | Chưa đo |
| Tỷ lệ tệp có checksum hợp lệ | Số tệp checksum khớp lần kiểm tra gần nhất ÷ tổng số tệp đang lưu | Chưa đo | Chưa đo — chưa có hạ tầng vận hành thật để tính | ≥ 99,9% (chỉ tiêu nghiệm thu MT-06, `01-thuyet-minh-ky-thuat.md` mục 3.2 — không gắn mốc tháng cụ thể trong nguồn, dùng làm tham chiếu nghiệm thu giai đoạn 1) |
| Số yêu cầu chia sẻ dữ liệu xử lý đúng hạn | Số yêu cầu Duyệt/Từ chối/Yêu cầu bổ sung trong hạn cấu hình ÷ tổng số yêu cầu nhận được | Chưa đo — chưa có yêu cầu chia sẻ thật | Chưa đo | Chưa đo |
| Tỷ lệ mục tuân thủ có chứng cứ | Số dòng Sổ đăng ký tuân thủ có ô "Chứng cứ" khác rỗng ÷ tổng số dòng | Chưa đo | Chưa đo | Chưa đo |

---

## 7. Trải nghiệm chủ đạo

Bốn luồng dưới đây là cách nhanh nhất để hiểu sản phẩm làm được gì trong thực tế — mỗi luồng trỏ tới màn hình tương ứng trong ứng dụng (`app/src/pages/`); tiêu chí nghiệm thu chi tiết từng bước xem mã yêu cầu tương ứng tại `09-dac-ta-yeu-cau-srs.md`.

### 7.1. Số hóa một hiện vật, từ lúc quét đến khi xuất bản

Cán bộ kỹ thuật số hóa tải kết quả quét lên qua màn **Tải lên dữ liệu** (`UploadPage`) — hệ thống tính checksum và kiểm tra chất lượng ngay khi nhận tệp. Biên tập viên mở bản ghi tại **Dữ liệu số hóa / Chi tiết dữ liệu số hóa** (`AssetsPage` / `AssetDetailPage`) để nhập siêu dữ liệu; với tư liệu Hán Nôm, nhập đủ ba lớp nguyên văn — phiên âm — dịch nghĩa và một chuyên gia thứ hai thẩm định song song. Bản ghi được trình qua hàng đợi **Duyệt & xuất bản**, nơi cán bộ phê duyệt Duyệt/Trả lại bổ sung/Từ chối. Khi xuất bản, hệ thống ký số và gắn nhãn, bản ghi xuất hiện trong **Hồ sơ đối tượng di sản** (`ObjectDossierPage`) của đối tượng liên quan.

### 7.2. Tra cứu toàn bộ tư liệu về một công trình

Người dùng tìm công trình (ví dụ Khuê Văn Các) tại màn **Đối tượng di sản** (`ObjectsPage`), mở **Hồ sơ đối tượng di sản** (`ObjectDossierPage`) — trang tổng hợp 360° gom toàn bộ bản đại diện số (mô hình 3D, gaussian splat, đám mây điểm, bản vẽ kỹ thuật) và các tư liệu khác có nhắc tới công trình (ảnh tư liệu lịch sử, văn bia), phân nhóm rõ theo loại quan hệ để không nhầm "bản đại diện của chính nó" với "tư liệu nói về nó" (xem `00-ke-hoach-nang-cap.md` mục 0ter). Từ đó mở tiếp **Chi tiết dữ liệu số hóa** (`AssetDetailPage`) cho từng bản ghi cụ thể nếu cần xem hoặc tải xuống.

### 7.3. Chạy một đợt kiểm kê định kỳ

Cán bộ phụ trách tạo đợt kiểm kê tại màn **Kiểm kê định kỳ** (`InventoryPage`), xác định phạm vi và phân công người thực hiện. Hệ thống tự động đối chiếu số kiểm kê hiện vật gốc với mã dữ liệu số, liệt kê ba loại lệch (hiện vật chưa có dữ liệu số, dữ liệu số chưa neo hiện vật, sai lệch thông tin). Cán bộ đối chiếu thực địa và đánh dấu khớp/lệch — trong khi đợt chưa chốt, mọi thao tác đều hoàn tác được trong ít giây (xem `00-ke-hoach-nang-cap.md` mục 0septies). Khi chốt đợt, hệ thống xuất biên bản và báo cáo gửi cơ quan chủ quản; sau khi chốt, sửa sai chỉ thực hiện được bằng bản điều chỉnh có lý do, không xóa hay ghi đè bản gốc.

### 7.4. Xử lý một yêu cầu chia sẻ từ cơ quan bạn

Cán bộ đầu mối dữ liệu mở màn **Kết nối & chia sẻ** (`SharePage`), thấy yêu cầu mới kèm số văn bản đề nghị và hạn xử lý. Cán bộ chọn Duyệt/Từ chối/Yêu cầu bổ sung; nếu duyệt, cấu hình phạm vi dữ liệu được chia sẻ theo bộ sưu tập và mức truy cập, sau đó theo dõi trạng thái kết nối và có thể thu hồi về sau kèm lý do bắt buộc. Toàn bộ thao tác được ghi vào nhật ký để phục vụ yêu cầu giám sát "liên tục, công khai và có truy vết" của Điều 13 Nghị định 278/2025/NĐ-CP.

---

## 8. Ràng buộc và giả định

**Hạ tầng.** Dữ liệu di sản không được truyền ra khỏi lãnh thổ Việt Nam; kết nối ra ngoài chỉ thực hiện qua nền tảng tích hợp, chia sẻ dữ liệu của Thành phố Hà Nội, không kết nối ngang hàng với hệ thống cấp Thành phố hay cấp quốc gia nào khác (chi tiết kiến trúc: `08-mo-ta-kien-truc.md`). Hạ tầng mạng nội bộ phải đáp ứng băng thông tối thiểu cho số người dùng đồng thời dự kiến — nếu không đáp ứng, chỉ tiêu hiệu năng có thể không đạt dù phần mềm đúng thiết kế, trách nhiệm hạ tầng thuộc bên vận hành.

**Pháp lý.** Khung pháp lý về dữ liệu, bảo vệ dữ liệu cá nhân và an toàn thông tin đang trong giai đoạn ban hành dày đặc (2024–2026); một số nội dung viện dẫn trong các tài liệu của dự án còn đánh dấu "(cần đối chiếu nguyên văn trước khi nộp)" — xem danh mục đầy đủ tại `01-thuyet-minh-ky-thuat.md` Chương 1 và mục 6 "Còn mở" của `00-ke-hoach-nang-cap.md`. Sản phẩm không dựa vào các điều khoản chưa xác minh để đưa ra cam kết chức năng.

**Nhân sự vận hành.** Sản phẩm giả định mức tối thiểu là một quản trị hệ thống kiêm nhiệm cộng một cán bộ đầu mối dữ liệu, cả hai kiêm nhiệm thêm vai trò bảo vệ dữ liệu cá nhân và bảo quản số (xem persona quản trị hệ thống, mục 3.5) — thiết kế phải cho phép một người kiêm nhiều vai trò vẫn vận hành được, không giả định có đội ngũ chuyên trách riêng cho từng nghiệp vụ.

**Phụ thuộc vào chủ đầu tư.** Ba phụ thuộc cụ thể, nhà thầu không tự giải quyết được:
- **Số kiểm kê hiện vật gốc:** khoảng 120 đối tượng chưa xác định được số kiểm kê để neo vào hệ thống (`16-van-de-da-biet.md` mục 5.1) — cần Trung tâm cung cấp hoặc hoàn thiện sổ kiểm kê giấy.
- **Xác nhận chuyên môn:** dữ liệu fact di sản (niên đại, vị trí, tên gọi, quan hệ hiện vật) cần cán bộ chuyên môn của Trung tâm xác nhận bằng chữ ký trước khi công bố chính thức — nhà thầu không tự quyết định nội dung di sản (`16-van-de-da-biet.md` mục 5.2).
- **Quyết định cấp độ an toàn thông tin:** thuyết minh kỹ thuật kiến nghị cấp độ 2 kèm lập luận, nhưng cấp độ chính thức do cấp có thẩm quyền phê duyệt sau khi nộp hồ sơ đề xuất — một số tham số vận hành (ví dụ thời hạn lưu nhật ký) chỉ chốt sau quyết định đó (`16-van-de-da-biet.md` mục 5.3).

---

## 9. Rủi ro sản phẩm

Mục này khác với bảng rủi ro *dự án* tại `13-ke-hoach-quan-ly-du-an.md` mục 8 (tiến độ, phê duyệt liên thông, thay đổi văn bản pháp lý, nhân sự triển khai) — đây là rủi ro về **sản phẩm có được dùng đúng như thiết kế hay không sau khi đã bàn giao và vận hành lâu dài**.

**Rủi ro mức độ sử dụng thật.** Bộ mã khuyết giá trị (mục 0quinquies, `00-ke-hoach-nang-cap.md`) chặn được ô trống, nhưng không chặn được việc cán bộ chọn `CHUA_XAC_DINH` cho mọi trường khó thay vì tra cứu nghiêm túc, đặc biệt dưới áp lực khối lượng công việc. Hậu quả là chỉ số "% độ đầy đủ hồ sơ" (mục 6) đẹp về hình thức nhưng không phản ánh chất lượng thật. Giảm thiểu ở tầng sản phẩm: đưa số lượng và tỷ lệ dùng mã khuyết giá trị vào báo cáo định kỳ cho lãnh đạo (mục 3.4), tạo áp lực minh bạch thay vì chỉ dựa vào ràng buộc nhập liệu.

**Rủi ro dữ liệu sai làm mất niềm tin.** Khác rủi ro dự án R-01 (kiểm soát nội dung *trước khi* xuất bản lần đầu, thuộc trách nhiệm quy trình duyệt) — đây là rủi ro *sau khi* vận hành lâu dài: nếu một sai sót lọt qua quy trình bốn mắt và bị hội đồng hoặc công chúng phát hiện, uy tín của toàn bộ hệ thống dữ liệu bị nghi ngờ, cán bộ có xu hướng quay lại xác minh thủ công các con số hệ thống đã tính — đúng bằng việc đánh mất lợi ích cốt lõi mà sản phẩm mang lại (tra cứu được, không cần hỏi lại người). Không có biện pháp kỹ thuật thuần túy loại trừ hoàn toàn rủi ro này; sản phẩm giảm thiểu bằng cách giữ toàn bộ lịch sử sửa đổi có thể truy vết (mục 4, nguyên tắc "mọi thay đổi để lại vết") để khi phát hiện sai sót, xử lý được minh bạch thay vì che giấu.

**Rủi ro phụ thuộc một người vận hành.** Vai trò quản trị hệ thống, bảo vệ dữ liệu cá nhân và bảo quản số thường dồn vào một người kiêm nhiệm (mục 3.5, mục 8). Khác rủi ro dự án R-12 (thiếu đầu mối *trong quá trình triển khai*), đây là rủi ro *sau khi bàn giao*: nếu người đó nghỉ việc hoặc chuyển công tác đột ngột mà không có tài liệu hoặc cơ chế nhắc việc chủ động, không ai biết vận hành sao lưu, xử lý sự cố hay quy trình đánh giá tác động xử lý dữ liệu cá nhân đúng hạn. Sản phẩm giảm thiểu bằng cảnh báo tự động và hướng dẫn từng bước ngay trong giao diện thay vì phụ thuộc trí nhớ cá nhân (mục 3.5) — nhưng đây là giảm thiểu, không loại trừ rủi ro tổ chức.

---

## 10. Liên kết tài liệu

| Cần tra cứu thêm về... | Xem tài liệu | Đường dẫn |
|---|---|---|
| Yêu cầu kỹ thuật chi tiết và tiêu chí nghiệm thu từng chức năng | Đặc tả yêu cầu phần mềm (SRS) | `./09-dac-ta-yeu-cau-srs.md` |
| Căn cứ pháp lý đầy đủ, kiến trúc giải pháp, hạ tầng, chi phí, lộ trình | Thuyết minh kỹ thuật | `./01-thuyet-minh-ky-thuat.md` |
| Vì sao thiết kế theo cách này (quyết định kiến trúc) | Chỉ mục ADR | `./adr/README.md` |
| Đối chiếu wireframe hồ sơ thầu ↔ màn hình ứng dụng ↔ pháp lý ↔ chuẩn quốc tế | Ma trận truy vết | `./03-ma-tran-truy-vet.md` |
| Hạn chế, nợ kỹ thuật, phụ thuộc bên ngoài đã biết của bản 1.0.0 | Vấn đề đã biết | `./16-van-de-da-biet.md` |
| Rủi ro dự án, tổ chức, lịch trình, các cổng rà soát kỹ thuật | Kế hoạch quản lý dự án | `./13-ke-hoach-quan-ly-du-an.md` |
| Các quyết định thiết kế gốc (thuật ngữ, mã định danh, mã khuyết giá trị, quan hệ đối tượng ↔ dữ liệu số) | Kế hoạch nâng cấp | `./00-ke-hoach-nang-cap.md` |
| Mô hình dữ liệu, ERD, từ điển dữ liệu | Mô hình dữ liệu | `./07-mo-hinh-du-lieu.md` |

---

*Hết tài liệu. Phiên bản 1.0.0 — 12/08/2026. Cập nhật khi phạm vi giai đoạn 1/2 hoặc căn cứ chính sách tại `00-ke-hoach-nang-cap.md`/`01-thuyet-minh-ky-thuat.md` thay đổi.*
