# 19 — Tài liệu bàn giao kỹ thuật: vận hành, hạ tầng, lộ trình, pháp lý, rủi ro

> **Đối tượng sử dụng:** đơn vị tiếp nhận hệ thống (đội kỹ thuật của Trung tâm), đơn vị bảo trì kế nhiệm, hội đồng nghiệm thu.
> **Ngày cập nhật:** 09/09/2026 · **Phạm vi:** vận hành, hạ tầng, chi phí, bảo quản dài hạn, an toàn thông tin, tuân thủ pháp lý, lộ trình, rủi ro.
> **Tài liệu song hành:** `docs/18-hoi-dap-ban-giao-ky-thuat.md` phủ kiến trúc mã nguồn, mô hình dữ liệu, phân quyền, kiểm thử, hiệu năng frontend. Tài liệu này **không** lặp lại các chủ đề đó.

---

## Phạm vi tài liệu

Tài liệu mô tả các quyết định kỹ thuật, cam kết vận hành và giới hạn đã biết của hệ thống VM Digital Assets Admin tại thời điểm bàn giao. Tài liệu nằm trong repo cùng mã nguồn và là căn cứ tra cứu khi vận hành hệ thống, khi lập dự toán, và khi bàn giao tiếp cho một đơn vị bảo trì khác.

Cấu trúc: phần **Tình trạng và ranh giới của bản bàn giao** xác định giá trị pháp lý và độ tin cậy của mọi con số phía sau, cần đọc trước tiên. Bảy nhóm A–G trình bày từng chủ đề theo cùng một khuôn — đoạn mở đầu nêu kết luận, phần giữa nêu căn cứ và chi tiết triển khai, khối cuối nêu giả định, giới hạn hoặc điểm dễ hiểu nhầm. Phần cuối là bảng tra nhanh các số liệu chính kèm mức tin cậy của từng số.

Mọi dẫn nguồn đều trỏ tới tệp và số mục cụ thể trong repo để người đọc kiểm chứng trực tiếp thay vì phải dựa vào bản tóm tắt.

---

## Tình trạng và ranh giới của bản bàn giao

Ba điều kiện dưới đây quy định cách đọc toàn bộ phần còn lại của tài liệu.

**(1) Mọi con số tiền là giả định kèm phép tính, chưa qua khảo giá.**
Toàn bộ đơn giá trong hồ sơ được trình bày kèm công thức tính, để đơn vị lập dự toán thay báo giá thật vào mà không phải tính lại từ đầu. Bảng đơn giá tại `docs/audit/05-kien-truc-va-production.md` §6.3 ghi **"(cần kiểm chứng)"** ở từng dòng, và tiêu đề bảng ghi **"THAY BÁO GIÁ THẬT VÀO ĐÂY"**. `docs/audit/00-tong-hop-de-xuat-nang-cap.md` §9.1 ghi nhận việc khảo giá phần cứng chưa hoàn thành. Các con số này dùng để so sánh phương án và xác định bậc độ lớn ngân sách; không dùng làm dự toán ký hợp đồng mua sắm.

**(2) Mọi con số dung lượng là mô hình dựng từ tham số vật lý, chưa đo trên dữ liệu thật.**
Khối lượng dữ liệu được suy ra từ chính công thức của hệ thống (`app/src/data/sizeFormulas.ts`), nên truy vết được từng bước tính. Tuy vậy dữ liệu chưa được sao chép từ NAS về, nên chưa có phép đo nào trên tập dữ liệu thật. Các con số phải được đo lại khi dữ liệu thật sẵn sàng.

**(3) Bản hiện tại là MVP chạy hoàn toàn trên lớp dịch vụ giả lập, chưa có backend.**
Đây là quyết định có chủ đích, ghi tại ADR-0002. Phạm vi cam kết ở thời điểm này là kiến trúc đích, lộ trình di trú và cơ cấu chi phí — không phải một hệ thống production đã vận hành.

`docs/audit/00` §3.2 xếp khoảng cách giữa mô tả trong tài liệu và chức năng thực có trong phần mềm là **rủi ro số 1** của hồ sơ. Ba điều kiện trên được đặt ở đầu tài liệu để mọi phát biểu phía sau được đọc đúng phạm vi hiệu lực của nó.

---

## A. Kiến trúc triển khai production

### Lựa chọn nền tảng: Postgres + MinIO + Keycloak rời thay vì nền tảng gộp Supabase

Hệ thống dùng PostgreSQL, kho đối tượng tương thích S3 và Keycloak triển khai rời nhau, không dùng nền tảng gộp kiểu Supabase. Căn cứ là ba ràng buộc của đầu bài: (1) hệ thống phải xử lý tệp tới 50 GB và phân tầng lưu trữ nóng/ấm/lạnh, trong khi Supabase Storage không thiết kế cho khối lượng và mô hình phân tầng đó; (2) kênh kết nối LGSP yêu cầu **OAuth2 client-credentials + mTLS**, Keycloak hỗ trợ nguyên bản còn GoTrue của Supabase thì không; (3) đội IT tiếp nhận mỏng, cần ít lớp trừu tượng khi chẩn đoán sự cố.

**Căn cứ và chi tiết triển khai**
- `docs/audit/05-kien-truc-va-production.md` §5.2, dòng "Nền tảng gộp", khuyến nghị **"Rời — KHÔNG dùng Supabase"** kèm đúng ba lý do trên.
- Yêu cầu mTLS cho kênh LGSP nằm ở `docs/06-dac-ta-api.md:25-26`.
- Một mô hình của Supabase được giữ lại trong thiết kế: **Row-Level Security** của PostgreSQL, dùng để thực thi phân quyền ngay trong CSDL chứ không chỉ ở tầng API.
- Họ công nghệ đã được chốt từ trước tại `docs/08-mo-ta-kien-truc.md:344,:350` — PostgreSQL, kho đối tượng tương thích S3, OpenSearch, hàng đợi tác vụ, máy chủ định danh OIDC. Audit 05 bổ sung sản phẩm cụ thể và phần đánh đổi.

**Giả định và giới hạn**
- Kết luận này là kết luận về **mức độ khớp với ba ràng buộc của dự án**, không phải đánh giá chất lượng chung của Supabase cho các bài toán khác.
- Kiến trúc rời **tốn công vận hành hơn** kiến trúc gộp. Đây là lý do lớp triển khai chọn Docker Compose thay vì Kubernetes (mục kế tiếp), và là lý do dự toán OPEX có sẵn 0,5 FTE vận hành.
- Keycloak chạy trên JVM, cần khoảng 1 GB RAM và có cấu hình rườm rà. Đổi lại, đây là thành phần duy nhất trong nhóm đáp ứng được **cả** kênh người dùng **lẫn** kênh LGSP.

---

### Lớp triển khai: Docker Compose, không dùng Kubernetes

Hệ thống triển khai bằng Docker Compose. Kubernetes giải bài toán nhiều dịch vụ, nhiều máy, tự co giãn và nhiều đội cùng triển khai; dự án này có một hệ thống, một địa điểm, lưu lượng nội bộ dự đoán được và một đội IT mỏng. Yếu tố quyết định: kho 100 TB gắn trực tiếp vào máy chủ nên **dữ liệu không di động**, khả năng co giãn ngang của Kubernetes không sử dụng được — phần lớn giá trị của nó không phát huy trong khi chi phí vận hành vẫn còn nguyên.

**Căn cứ và chi tiết triển khai**
- `docs/audit/05-kien-truc-va-production.md` §5.5 ghi khuyến nghị nguyên văn: **"Docker Compose. Không Kubernetes."**
- Cách làm cụ thể: `compose.yaml` quản lý trong git, một tệp `.env` cho bí mật (hoặc trình quản lý bí mật đơn giản), `restart: unless-stopped`, cập nhật bằng đổi thẻ ảnh rồi `docker compose up -d`, có bước thử ở môi trường staging **giống hệt** production.
- **Ngoại lệ duy nhất:** nếu cơ quan chủ quản đã có sẵn cụm Kubernetes do đội khác vận hành và cam kết hỗ trợ thì dùng cụm đó, vì chi phí vận hành khi ấy do đơn vị khác gánh. Nguyên tắc giữ nguyên: **không dựng cụm Kubernetes mới cho riêng dự án này.**
- Hạng mục nên đầu tư thay cho Kubernetes: quy trình sao lưu **đã được diễn tập thật**, giám sát có cảnh báo tới người trực, và tài liệu vận hành đủ để người thứ hai khôi phục hệ thống ngoài giờ. Nội dung này ở `docs/14-van-hanh-va-ban-giao.md`.

**Điểm dễ hiểu nhầm**
- Tiêu chí lựa chọn ở đây là **năng lực vận hành của bên tiếp nhận**, không phải độ mới của công nghệ.
- Hướng mở rộng của dự án là **thêm ổ đĩa và thêm khay**, không phải thêm pod. Cấu hình đề xuất đã chừa sẵn 4 khay trống mỗi máy (`audit/05` §6.2).
- Việc các thành phần đều được container hoá **không** đồng nghĩa với chuyển sang Kubernetes về sau là dễ. Khả năng chuyển phụ thuộc chủ yếu vào bài toán lưu trữ, không phụ thuộc vào container.

---

### Phạm vi bàn giao khi hệ thống chưa có backend

Bản bàn giao gồm ba hạng mục: (1) ứng dụng quản trị chạy được trên lớp dịch vụ giả lập, đủ để nghiệm thu luồng nghiệp vụ và giao diện; (2) bộ tài liệu thiết kế đã chốt — ERD, đặc tả API OpenAPI, 20 ADR, quy trình bảo quản OAIS; (3) lộ trình di trú từ lớp giả lập sang production theo từng service, kèm ước tính công. Việc chưa có backend là quyết định có chủ đích, ghi tại ADR-0002, không phải phần việc bị bỏ sót.

**Căn cứ và chi tiết triển khai**
- Lộ trình di trú: `docs/audit/05-kien-truc-va-production.md` §7, chia theo từng service, với nguyên tắc đổi *hình dạng hợp đồng* trước, đổi *cài đặt* sau.
- `audit/05` §7.1 ghi nhận **đặc tả API hiện có chưa phủ hết ứng dụng quản trị**: đặc tả được viết cho kênh liên thông, chưa viết cho các màn hình quản trị nội bộ. Đây là hạng mục `ARC-16` trong lộ trình.
- Nút thắt kỹ thuật lớn nhất trước khi lên production: lớp dịch vụ hiện **đồng bộ 100 %** (`ARC-01`), cần bọc `Promise` và tách `contracts.ts`, ước tính 4–6 người-ngày. Thực hiện sớm thì chi phí thấp; thực hiện muộn thì các hạng mục phụ thuộc phải làm lại.

**Lưu ý khi tiếp nhận**
- Thuật ngữ chính xác cho bản hiện tại là **"MVP có lớp dịch vụ giả lập"**, không phải "demo" theo nghĩa trình diễn.
- Tài liệu hiện mô tả một số tính năng mà phần mềm chưa có. Bản audit nội bộ đã tự phát hiện và liệt kê từng chỗ (`audit/00` §3.2). Hạng mục 2 của gói P0 (1–1,5 người-ngày) xử lý việc này: gỡ các chỉ số chưa có thật, gắn nhãn "Giai đoạn 2" cho các nút chưa nối chức năng.

---

### Tải lên tệp lớn: tus.io trên kho nền tương thích S3

Đường tải lên dùng **tus.io (tusd)** với kho nền tương thích S3. Tệp tới 50 GB đi qua đường truyền văn phòng tại Việt Nam có xác suất đứt kết nối cao; giao thức tus nối lại được **kể cả sau khi trình duyệt đã đóng**, còn S3 multipart ký sẵn thì không. Checksum SHA-256 được tính **ngay tại điểm vào**, trước khi tệp được coi là đã nhận.

**Căn cứ và chi tiết triển khai**
- `docs/audit/05-kien-truc-va-production.md` §5.2, dòng "Tải lên tệp lớn"; quy tắc checksum tại điểm vào theo `docs/02-quy-trinh-bao-quan-sao-luu.md` §3.1.
- Luồng thu nhận đầy đủ (`ARC-14`): tệp vào **bucket cách ly** → worker quét **ClamAV** và tính checksum → chỉ khi sạch mới chuyển sang bucket AIP. Worker chạy trong container **không có quyền ghi** lên bucket AIP; đây là điểm siết quan trọng của thiết kế, không phải chi tiết phụ.

**Giả định và giới hạn**
- Byte đi qua tusd thay vì vào thẳng MinIO, tốn thêm một chặng mạng. Ở lưu lượng dự kiến của Trung tâm, mức đánh đổi này chấp nhận được.
- ClamAV bắt được ít mẫu hơn sản phẩm thương mại. Cơ sở chấp nhận: luồng dữ liệu là **nội bộ có kiểm soát**, người nhập liệu là cán bộ đã định danh — khác hẳn một cổng nhận tệp công cộng.
- Bản MVP **chưa** thực hiện kiểm tra định dạng, độ phân giải và checksum; `audit/00` §3.2 đã ghi nhận câu chữ trong `i18n` mô tả sai điều này. Toàn bộ luồng thu nhận nêu trên là **kiến trúc đề xuất**, chưa phải chức năng đang chạy.

---

### Giấy phép MinIO và phương án thay thế kho đối tượng

MinIO đã đổi mô hình giấy phép và cắt tính năng ở bản cộng đồng. Hồ sơ xếp đây là **rủi ro ngân sách lớn nhất chưa xác định**. Hai việc phải hoàn thành trước khi ký hợp đồng: lấy ý kiến pháp lý về nghĩa vụ AGPLv3 đối với hệ thống của cơ quan nhà nước, và lấy báo giá bản thương mại. Ở quy mô ~300 TB thô, khoản license có thể **ngang hoặc vượt toàn bộ CAPEX phần cứng**.

**Căn cứ và chi tiết triển khai**
- `docs/audit/05-kien-truc-va-production.md` §6.6; dòng 12 trong bảng đơn giá §6.3 ghi **"CHƯA XÁC ĐỊNH — (RỦI RO)"**.
- Biện pháp giảm nhẹ đã đưa vào thiết kế: hệ thống **chỉ dùng API S3 chuẩn**, không dùng tính năng riêng của MinIO, nên có thể chuyển sang **Ceph RGW** hoặc **SeaweedFS** mà không sửa mã ứng dụng. Vì vậy bảng công nghệ §5.2 ghi "kho đối tượng **tương thích S3**" chứ không ghi "MinIO".
- Ngưỡng đổi công nghệ đã định sẵn: MinIO cho giai đoạn 1–2; cân nhắc Ceph khi vượt **~500 TB**.

**Điểm dễ hiểu nhầm**
- MinIO **không** miễn phí trong mọi trường hợp sử dụng của dự án này; dự toán không được lập trên giả định đó.
- Ceph mạnh hơn nhưng cần một kỹ sư chuyên trách toàn thời gian — một dòng OPEX thường trực lớn hơn khoản license mà nó tránh được, ở quy mô hiện tại và với năng lực đội IT hiện nay.

---

## B. Sizing dung lượng và chi phí

### Cơ sở tính khối lượng dữ liệu gốc ≈ 105 TB

Khối lượng bản gốc (AIP) được tính từ công thức dung lượng của hệ thống, cộng theo 5 nhóm hiện vật: 82 bia và 82 rùa cho 55 TB; 13 công trình kiến trúc 11,5 TB; tư liệu Hán Nôm 5,7 TB; ảnh tư liệu và kiểm kê 13,5 TB; nghe nhìn 19,2 TB. Tổng ≈ **105 TB bản gốc (AIP)**. Đây là mô hình dựng từ tham số vật lý, chưa đo trên dữ liệu thật vì dữ liệu chưa được sao chép từ NAS về.

**Căn cứ và chi tiết triển khai**
- `docs/audit/05-kien-truc-va-production.md` §6.1, bảng A–E, ghi công thức của từng dòng.
- Ví dụ nhóm A, mỗi đối tượng: mesh 10 triệu tam giác + texture 8K = 340 MB; đám mây điểm 400 triệu điểm = 9.600 MB; splat 5 triệu gaussian = 950 MB; **1.200 ảnh nguồn 45 MP = 324.000 MB**. Tổng ≈ 335 GB/đối tượng × 164 đối tượng = 55 TB.
- Cơ cấu đáng chú ý nhất: **~63 % tổng dung lượng là ảnh nguồn photogrammetry**. Nếu chính sách bảo quản không giữ ảnh nguồn thô mà chỉ giữ sản phẩm đã dựng, tổng giảm từ 105 TB xuống **≈ 21 TB**, kéo theo toàn bộ dự toán phần cứng. Đây là **quyết định chính sách của Trung tâm**, không phải quyết định kỹ thuật của nhà thầu.
- Audit đính chính một hằng số của mã nguồn: dùng **6 MB/megapixel** cho TIFF 16-bit thay cho hằng số 30 MB/MP đang ghi trong `sizeFormulas.ts` (lý do ở `audit/05` §3.11).

**Giả định và giới hạn**
- Con số này **chưa khớp** với con số 127,4 GB hiển thị trên màn Sao lưu. `audit/00` §3.5 ghi nhận: app tính 127,4 GB cho 153 bản ghi, trong khi mô hình dựng từ tham số vật lý cho ra ~7 TB mỗi bản AIP — lệch khoảng **55×**. Đây là mục 5 của gói P0 (1,5–2,5 người-ngày), chưa được xử lý ở bản hiện tại.
- Con số 105 TB chỉ có ý nghĩa khi đi kèm cấu trúc 5 nhóm và công thức từng nhóm; trình bày nó như một ước lượng tròn ("khoảng 100 TB") làm mất khả năng kiểm chứng.

---

### Cấu trúc TCO 5 năm 161.000–256.000 USD và tình trạng khảo giá

Tổng chi phí sở hữu 5 năm ước tính **161.000–256.000 USD**. Toàn bộ đơn giá là **giả định kèm phép tính, chưa qua khảo giá**, ghi rõ "(cần kiểm chứng)" ở từng dòng, và tiêu đề bảng ghi "THAY BÁO GIÁ THẬT VÀO ĐÂY". Con số này là **bậc độ lớn** để so sánh và quyết định phương án, không phải dự toán để ký. Bước lập dự toán chính thức là thay báo giá thật vào đúng bảng đó.

**Căn cứ và chi tiết triển khai**
- `docs/audit/05-kien-truc-va-production.md` §6.3 (bảng đơn giá giả định), §6.4 (CAPEX), §6.5 (OPEX), §6.7 (TCO); `docs/audit/00-tong-hop-de-xuat-nang-cap.md` §9.1 ghi nhận "agent khảo giá phần cứng không trả kết quả".
- **CAPEX ≈ 56.000–89.000 USD**: 2 máy chủ lưu trữ, 20 ổ 22 TB, 1 máy chủ ứng dụng + CSDL, SSD tầng nóng, thư viện băng LTO-9 và 30 cuộn, mạng/UPS/rack, thiết lập điểm off-site, cộng dự phòng 20 %.
- **OPEX ≈ 18.600–29.800 USD/năm**: điện và làm mát, băng bổ sung, thay ổ hỏng, mở rộng theo tăng trưởng, bảo hành ~8 % CAPEX, **0,5 FTE vận hành**, chi phí off-site. Cộng khoản làm mới đĩa năm 4 (12.000–18.000 USD).
- Bốn giả định nhạy nhất: HDD nearline 22 TB ở **15–20 USD/TB**; băng LTO-9 ở **7–9 USD/TB**; giá điện **~1.900 VND/kWh**; tỷ giá **~25.500 VND/USD**; lương kỹ sư vận hành **~35 triệu VND/tháng**. Tất cả đều mang nhãn cần kiểm chứng.
- **Chưa bao gồm:** giấy phép thương mại MinIO (nhóm A) và nhân công phát triển backend (tính riêng theo người-ngày trong lộ trình `ARC`).

**Giả định và giới hạn**
- Không có khảo sát thị trường nào đứng sau các con số này. Phạm vi sử dụng hợp lệ: **so sánh phương án** (tự vận hành / colocation / thuê kho đối tượng) và xác định bậc độ lớn ngân sách.
- OPEX đã bao gồm **0,5 FTE** nhân sự vận hành. Nếu Trung tâm không bố trí được nhân sự này, con số OPEX không còn đúng, và quan trọng hơn là hệ thống không có người trực.

---

### Chi phí thường trực từ năm 3 đến năm 5 sau bàn giao

Sau bàn giao, Trung tâm có ba khoản chi thường trực: **OPEX ≈ 18.600–29.800 USD/năm** cho điện, băng, thay ổ, bảo hành và 0,5 FTE vận hành; **làm mới đĩa vào khoảng năm 4** khoảng 12.000–18.000 USD; và **hợp đồng bảo trì phần mềm**, khoản chưa nằm trong bảng TCO vì bảng đó chỉ tính hạ tầng. Ba năm cuối rơi vào khoảng **68.000–108.000 USD** phần hạ tầng, chưa kể bảo trì phần mềm và phát triển tính năng mới.

**Căn cứ và chi tiết triển khai**
- `docs/audit/05-kien-truc-va-production.md` §6.5 và §6.7.
- Ba khoản dễ bị bỏ sót khi lập dự toán:
  1. **Nhân sự 0,5 FTE** — 8.200–12.000 USD/năm. Nếu Trung tâm dùng người sẵn có thì khoản này chuyển thành chi phí cơ hội chứ không biến mất.
  2. **Tăng trưởng ~15 %/năm** ⇒ khoảng 2 ổ đĩa mỗi năm. Dự toán đã chừa 4 khay trống mỗi máy, đủ cho vài năm đầu.
  3. **Giấy phép MinIO** — chưa xác định, có thể là khoản lớn nhất trong nhóm này (nhóm A).
- Chi phí phần mềm sau bàn giao **không** nằm trong dải 161–256k: hợp đồng bảo trì, các hạng mục lộ trình 18 tháng (OpenSearch, ARK/DOI, OAI-PMH thật, EDM), và **CoreTrustSeal ≈ 1.000 EUR/3 năm** nếu theo đuổi chứng nhận.

**Điểm dễ hiểu nhầm**
- Tỷ trọng OPEX 5 năm (93.000–149.000 USD) **lớn hơn** CAPEX (56.000–89.000 USD). CAPEX một mình không phản ánh chi phí sở hữu hệ thống.
- Với 105 TB và ba bản sao, chi phí vận hành sau bàn giao là khoản thường trực và cần một dòng ngân sách riêng, không tiệm cận không.

---

### So sánh thuê kho đối tượng với tự vận hành: điểm hoà vốn ~10,7 USD/TB/tháng

Có công thức kiểm chứng được cho phép so sánh trực tiếp. Ở quy mô 300 TB, thuê rẻ hơn tự vận hành **chỉ khi** giá dưới **~10,7 USD/TB/tháng** (≈ 273.000 VND/TB/tháng). Giá thị trường trong nước theo quan sát thường cao hơn mốc này, nhưng nhận định đó **chưa được kiểm chứng bằng báo giá**; cách dùng đúng là thay báo giá thật vào công thức.

**Căn cứ và chi tiết triển khai**
- Công thức nguyên văn ở `docs/audit/05-kien-truc-va-production.md` §6.7: `Giá(USD/TB/tháng) × 300 TB × 12 tháng < OPEX/năm + CAPEX/5`. Thay số giữa dải: `Giá × 3.600 < 24.000 + 14.500 = 38.500` ⇒ `Giá < ≈ 10,7 USD/TB/tháng`.
- Ba yếu tố ngoài chi phí nghiêng về tự vận hành, và trong bối cảnh này có trọng số cao hơn tiền:
  1. **Ràng buộc pháp lý** — dữ liệu di sản quốc gia thuộc phạm vi Luật Dữ liệu 60/2024/QH15 và Luật Di sản văn hoá 45/2024/QH15. Tự chủ hạ tầng là ràng buộc đầu bài, không phải bài toán tối ưu chi phí.
  2. **Chi phí rời bỏ** — lấy 105 TB ra khỏi một nhà cung cấp là việc tính bằng tháng và bằng phí truyền dữ liệu ra; đây thường là khoản đắt nhất và ít được dự toán nhất.
  3. **Bản sao thứ 3 off-site vẫn phải có** dù thuê hay tự vận hành, nên thuê không loại bỏ được hạ tầng băng từ.
- Phương án colocation (đặt máy của Trung tâm tại IDC) chưa tính được vì **chưa có giá thuê tủ rack**; bảng §6.7 để trống đúng ô đó thay vì điền số ước.

**Điểm dễ hiểu nhầm**
- Pháp luật hiện hành **không cấm** thuê hạ tầng trong nước. Lập luận ủng hộ tự vận hành ở đây là tổ hợp: yêu cầu tự chủ, chi phí rời bỏ, và bản off-site vẫn cần trong mọi phương án.
- Nếu có báo giá thật thấp hơn 10,7 USD/TB/tháng, kết luận phải được tính lại theo công thức trên; ba yếu tố ngoài chi phí vẫn phải cân nhắc song song.

---

### Các đòn bẩy cắt giảm ngân sách theo thứ tự hiệu quả

Đòn bẩy mạnh nhất không nằm ở việc cắt tính năng mà ở **chính sách lưu ảnh nguồn photogrammetry**. Ảnh nguồn chiếm ~63 % dung lượng nhưng gần như không bao giờ được đọc lại. Đưa chúng xuống băng ngay sau khi dựng xong làm **giảm 40–50 % CAPEX đĩa** mà không mất khả năng phục hồi. Đây là quyết định của Trung tâm về mức độ bảo quản và cần được quyết định có ý thức thay vì để theo mặc định.

**Căn cứ và chi tiết triển khai**
- `docs/audit/05-kien-truc-va-production.md` §6.8, ba đòn bẩy xếp theo hiệu quả:
  1. **Ảnh nguồn xuống băng ngay sau khi dựng** — băng rẻ hơn đĩa khoảng 2 lần trên mỗi TB (7–9 so với 15–20 USD/TB) và không tốn điện khi nằm im. Giảm 40–50 % CAPEX đĩa.
  2. **Nén hình học** (Draco/meshopt) cho bản phân phối, giảm mesh 5–10 lần — giảm tầng nóng, **không** giảm AIP vì bản gốc giữ nguyên.
  3. **Xoá mã hoá EC 8+3 thay vì nhân 3 bản** — 1,375× thay vì 3×. Đòn bẩy này **đã áp dụng sẵn** trong tính toán, không phải khoản tiết kiệm thêm.
- Nếu bỏ hẳn việc lưu ảnh nguồn (khác với chuyển xuống băng): 105 TB → ≈ 21 TB. Hệ quả kèm theo: mất ảnh nguồn là **mất đường phục hồi duy nhất** nếu định dạng splat sau này không đọc được nữa (`audit/00` §3.4).

**Điểm dễ hiểu nhầm**
- Khuyến nghị của hồ sơ là **chuyển tầng lưu trữ** ảnh nguồn, **không** phải xoá. Hai việc này khác nhau về bản chất bảo quản.
- Cắt bản sao thứ 3 hoặc rút xuống 2 bản không nằm trong danh mục đòn bẩy: đó là cắt vào chính cơ chế mà toàn bộ hồ sơ bảo quản đang bảo vệ.

---

## C. Lưu trữ và bảo quản dài hạn

### Chiến lược ba bản sao 3-2-1 và vị trí từng bản

Hệ thống áp dụng quy tắc **3 bản — 2 loại phương tiện — 1 nơi khác**. Bản 1 là AIP trên NAS tại Trung tâm; bản 2 là bản sao tại chỗ trên **công nghệ lưu trữ khác** với bản 1; bản 3 là bản off-site tại **địa điểm địa lý thứ hai**, trên băng LTO hoặc kho đối tượng vùng khác, cách ly mạng một phần để chống ransomware lan từ hệ thống chính. Tầng nóng (bản web, preview) **không tính** vào ba bản vì tái tạo được từ AIP.

**Căn cứ và chi tiết triển khai**
- `docs/02-quy-trinh-bao-quan-sao-luu.md` §2.2–2.3, kiến trúc ba tầng nóng / AIP / lạnh.
- Nguyên tắc nền tảng: bản gốc master **không bao giờ bị ghi đè hoặc xoá trực tiếp**. Mọi lần số hoá lại hay phục chế đều tạo **phiên bản mới** (v1, v2, v3…) lưu song song; phiên bản cũ chuyển trạng thái lưu trữ chứ không xoá. Xoá vĩnh viễn chỉ áp dụng cho trạng thái "đã gỡ/thu hồi" (deaccession) có lý do pháp lý, và vẫn giữ log sự kiện.
- Quy đổi ra dung lượng phải mua (`audit/05` §6.2): 105 TB AIP × 1,375 (xoá mã hoá **EC 8+3**) cho mỗi bản đĩa = 144 TB × 2 bản = 288 TB, cộng 20 % dự phòng tăng trưởng ⇒ **≈ 346 TB đĩa quay**, cộng ~6 TB SSD tầng nóng và **≈ 30 cuộn LTO-9**.
- Cấu hình vật lý đề xuất: **2 máy chủ lưu trữ 2U/12 khay riêng biệt**. Tách bản 1 và bản 2 sang hai thân máy khác nhau là điều kiện để có **2 điểm hỏng độc lập**, khác với hai thư mục trên cùng một máy.
- Xoá mã hoá EC 8+3 tốn 1,375× thay vì nhân 3 bản tốn 3× — đây là lý do 105 TB không trở thành 315 TB.

**Điểm dễ hiểu nhầm**
- Cấu hình hai bản tại chỗ vẫn thoả 3-2-1 theo định nghĩa: 3 bản, 2 loại phương tiện, **1 bản ở nơi khác**. Điều kiện bắt buộc là bản 2 nằm trên **hệ thống lưu trữ khác công nghệ**, không phải bản sao RAID trên cùng máy. RAID không phải sao lưu.
- Khả năng khôi phục từ bản 3 chưa được diễn tập; xem mục "Diễn tập khôi phục" ở nhóm D.

---

### Tách bản gốc bảo quản, bản phân phối và bản làm việc

Hệ thống tách ba tầng định dạng: **bản gốc master bất biến** (TIFF không nén 600 dpi/16-bit, PDF/A, E57 + PLY cho 3D, WAV, ProRes 422 HQ), **bản phân phối** (JPEG2000, glTF/GLB, MP3/AAC, H.264/H.265), và **bản làm việc**. Bản gốc chọn theo tiêu chí chuẩn mở, không phụ thuộc hãng, đọc được sau 20 năm; bản phân phối chọn theo tiêu chí nhẹ và trình duyệt mở được. Gộp hai mục tiêu này vào một tệp là lỗi bảo quản phổ biến.

**Căn cứ và chi tiết triển khai**
- Bảng đầy đủ: `docs/02-quy-trinh-bao-quan-sao-luu.md` §7.1. Chuẩn tham chiếu: FADGI/Metamorfoze 4-star cho ảnh, ISO 19005 (PDF/A), ISO/IEC 15444 (JPEG2000), ASTM E2807 (E57).
- Rà soát định dạng định kỳ **2 năm/lần** (`02` §7.3): kiểm tra từng định dạng còn được phần mềm phổ biến đọc không, ghi nhận rủi ro lỗi thời mới, và khuyến nghị di trú. Mỗi lần di trú tạo **phiên bản mới kèm sự kiện PREMIS**, không thay thế bản gốc.
- Bản gốc không nén vì phải chịu **di trú định dạng nhiều lần trong 20–50 năm**; mỗi lần giải nén và nén lại bằng codec mất dữ liệu là một lần suy giảm tích luỹ. Nén **không mất dữ liệu** được chấp nhận — đây là lý do JPEG2000 lossless nằm ở tầng phân phối.

**Lưu ý khi tiếp nhận**
- Trong bản MVP, mã nguồn cho bản `master` và bản `web` của mesh **dùng chung phần mở rộng**, nên cả hai đều ra `.glb`, và E57 bị gán nhãn "Dữ liệu thô" thay vì nhãn bản bảo quản. Sai lệch này do audit nội bộ phát hiện (`audit/00` §3.4) và nằm trong lộ trình sửa. Tài liệu đúng, phần mềm chưa đuổi kịp tài liệu.
- Mô hình dữ liệu hiện tại là "một tài sản = một tệp", trong khi OBJ luôn cần kèm `.mtl` và texture. Hệ quả: **mất texture mà checksum vẫn khớp** — một dạng mất mát im lặng mà fixity không phát hiện được. Biện pháp là **manifest tệp** (một tài sản nhiều tệp), hạng mục 8 trong gói P0, 5–8 người-ngày.

---

### Gaussian splat: chiến lược bảo quản khi chuẩn chưa được phê chuẩn

Rủi ro lỗi thời của định dạng splat là rủi ro thật. Nguyên tắc xử lý: **không coi `.splat` là bản lưu trữ dài hạn duy nhất**. Mỗi tài sản splat luôn kèm đủ bốn thành phần — bản PLY, **toàn bộ ảnh nguồn**, tham số huấn luyện, và siêu dữ liệu kỹ thuật — để **tái tạo lại được mô hình** nếu công cụ hiện tại ngừng hỗ trợ. Đối tượng được bảo quản ở đây là **khả năng dựng lại**, không phải một tệp cụ thể.

**Căn cứ và chi tiết triển khai**
- `docs/02-quy-trinh-bao-quan-sao-luu.md` §7.2 và `docs/audit/03-media-3d-splat-bao-quan.md`.
- **Trạng thái chuẩn:** phần mở rộng glTF **`KHR_gaussian_splatting`** của Khronos hiện ở trạng thái **Release Candidate, CHƯA được phê chuẩn**. Kiểm chứng lần cuối **12/08/2026** bằng cách đọc trực tiếp đặc tả glTF chính thức. Cách xử lý đã chốt: **sinh bản GLB theo đặc tả RC** để có giá trị kỹ thuật ngay, đồng thời **mọi câu chữ trong hồ sơ ghi "Release Candidate, chưa phê chuẩn"**, không viện dẫn như một chuẩn đã ban hành (`audit/00` §5). Trạng thái này cần được kiểm lại trước mỗi mốc quan trọng.
- **Một đính chính kỹ thuật đã thực hiện:** hồ sơ từng khẳng định point cloud là "dữ liệu duy nhất phục hồi được nội dung" — điều đó **sai về kỹ thuật**. Point cloud chỉ giữ khoảng 6/62 float của mỗi Gaussian (~10 %), mất toàn bộ hệ số cầu bậc cao, độ mờ và ma trận hiệp phương sai. Đường phục hồi thật là **ảnh nguồn photogrammetry**, và đó là lý do ảnh nguồn (63 % dung lượng) được giữ lại.
- Đây cũng là căn cứ để nhóm B khuyến nghị **chuyển ảnh nguồn xuống băng chứ không xoá**.

**Điểm dễ hiểu nhầm**
- Hệ thống **không** tuân theo một chuẩn Khronos đã ban hành cho gaussian splatting; chuẩn đó chưa tồn tại ở dạng phê chuẩn.
- Chiến lược bảo quản không đặt cược vào việc chuẩn được phê chuẩn: ảnh nguồn cộng tham số huấn luyện cho phép dựng lại bằng công cụ bất kỳ trong tương lai.
- Splat và mesh không thay thế nhau — hệ thống lưu **cả hai**, phục vụ hai mục đích khác nhau.

---

### Kiểm tra toàn vẹn định kỳ (fixity) và cơ chế tự phục hồi

Hư hỏng âm thầm được phát hiện bằng **kiểm tra toàn vẹn (fixity check) định kỳ**: hệ thống tính lại checksum của cả ba bản và đối chiếu với manifest gốc. Nhóm 82 bia Tiến sĩ và tư liệu Hán Nôm quý hiếm kiểm **hàng quý**; ảnh tư liệu và media **6 tháng/lần**; toàn kho rà soát **hàng năm**. Khi phát hiện lệch, hệ thống xác định bản còn nguyên vẹn trong ba bản, phục hồi bản hỏng, ghi sự kiện PREMIS, rồi kiểm lại chính bản vừa phục hồi.

**Căn cứ và chi tiết triển khai**
- Quy trình đầy đủ có sơ đồ luồng đủ nhánh lỗi: `docs/02-quy-trinh-bao-quan-sao-luu.md` §4.
- Checksum **SHA-256 tính ngay tại điểm vào** (§3.1), trước khi tệp được coi là đã nhận, không phải tính sau khi tệp đã nằm trong kho.
- Chỉ tiêu giám sát: **≥ 99,5 %** tài sản có checksum hợp lệ; **100 %** sự cố fixity phát hiện trong kỳ phải được khắc phục trong kỳ (`02` §9).
- Ở production, chỉ số này phải trở thành **cảnh báo tự động** chứ không chỉ là con số hiển thị: `audit/05` §5.4(d) đề xuất cảnh báo khi tỷ lệ fixity thất bại khác 0 ở bất kỳ lần chạy nào.
- Phân vai: **Cán bộ bảo quản số** là R/A cho fixity check (bảng RACI `02` §8).

**Giả định và giới hạn**
- Checksum chỉ bảo vệ *tệp đã được đăng ký*. Với mô hình một-tài-sản-một-tệp hiện tại, mất tệp texture đi kèm OBJ thì **checksum vẫn khớp** và fixity không phát hiện được. Đây là lý do manifest tệp là hạng mục bắt buộc, không phải tuỳ chọn.
- Trong bản MVP, fixity **chưa chạy thật**: đây là quy trình đã thiết kế, việc vận hành thật thuộc giai đoạn 6 tháng (`audit/00` §7).

---

## D. Sao lưu, khôi phục và an toàn thông tin

### Mục tiêu RPO ≤ 24 giờ, RTO ≤ 4 giờ và bốn kịch bản khôi phục

Cam kết thiết kế: **RPO ≤ 24 giờ** và **RTO ≤ 4 giờ**. RPO 24 giờ khớp với lịch sao lưu gia tăng chạy tự động lúc 03:00 hàng ngày, cộng sao lưu đầy đủ vào Chủ nhật hàng tuần. RTO 4 giờ là thời gian khôi phục dịch vụ kể từ khi sự cố được xác nhận. Riêng kịch bản xoá nhầm một tài sản, mục tiêu là **≤ 1 giờ** vì khôi phục thẳng từ tầng AIP bất biến.

**Căn cứ và chi tiết triển khai**
- `docs/02-quy-trinh-bao-quan-sao-luu.md` §5 (cam kết dịch vụ) và §6 (bốn kịch bản khôi phục).
- Bốn kịch bản đã phân vai người ra quyết định:
  1. **Xoá nhầm một tài sản** — khôi phục từ AIP, ≤ 1 giờ, Cán bộ bảo quản số quyết định, không kích hoạt DRP.
  2. **Hỏng đĩa hoặc thiết bị** — khôi phục từ AIP hoặc bản sao gần nhất, ≤ 4 giờ, Quản trị hệ thống quyết định.
  3. **Hỏng toàn bộ trung tâm dữ liệu** — khôi phục từ bản off-site tầng lạnh, **Lãnh đạo Trung tâm** kích hoạt DRP, phải dựng hạ tầng thay thế trước, và thông báo Sở Văn hoá và Thể thao Hà Nội.
  4. **Ransomware** — cô lập mạng ngay, **không trả tiền chuộc**, xác định thời điểm nhiễm, khôi phục từ bản off-site cách ly mạng ở thời điểm trước khi nhiễm, quét sạch toàn bộ rồi mới đưa lại vận hành, báo cáo cơ quan chức năng.
- `audit/05` §5.4(d) đề xuất biến RPO/RTO thành **cảnh báo tự động**: cảnh báo khi tuổi bản sao lưu vượt 24 giờ, và cảnh báo khi **diễn tập khôi phục quá hạn trên 6 tháng**.

**Giả định và giới hạn**
- RTO 4 giờ áp dụng cho việc **khôi phục dữ liệu và dịch vụ khi đã có hạ tầng thay thế sẵn sàng**. Ở kịch bản 3, nếu phải mua sắm và dựng máy mới từ đầu thì thời gian thực tế dài hơn đáng kể. Đây là lý do cần **thoả thuận hạ tầng dự phòng** tại điểm off-site; nếu không có thoả thuận đó, con số 4 giờ không áp dụng cho kịch bản 3.
- Các con số này là **cam kết thiết kế**, chưa phải SLA trong hợp đồng dịch vụ đã ký.

---

### Diễn tập khôi phục: tần suất, phân vai và tình trạng hiện tại

Ở bản MVP **chưa có diễn tập khôi phục thật**, vì chưa có hạ tầng production để diễn tập. Quy trình đã thiết kế: diễn tập khôi phục **ít nhất 1 lần/năm có biên bản**, và quy trình vận hành đặt ở mức **hàng quý**. Quản trị hệ thống thực hiện (R), **Cán bộ bảo quản số chịu trách nhiệm cuối (A)**, Lãnh đạo Trung tâm được báo cáo. Kết quả ghi nhận gồm đạt/chưa đạt, **thời gian khôi phục thực đo**, và ngày thực hiện.

**Căn cứ và chi tiết triển khai**
- Bảng RACI tại `docs/02-quy-trinh-bao-quan-sao-luu.md` §8 (dòng "Diễn tập khôi phục hàng quý"), chỉ số giám sát §9, và `docs/15-ho-so-de-xuat-cap-do-attt.md` §12.4 ("diễn tập khôi phục ≥ 1 lần/năm có biên bản").
- Chỉ số hiển thị trên màn "Sao lưu & khôi phục" là **kết quả diễn tập gần nhất** với RTO **thực đo**, không phải RTO cam kết.
- `ARC-18` trong lộ trình là hạng mục diễn tập khôi phục định kỳ. `audit/05` §5.4 ghi nguyên tắc: **"cam kết chưa diễn tập là cam kết chưa có"**.

**Lưu ý khi tiếp nhận**
- Không có biên bản diễn tập nào tồn tại ở thời điểm bàn giao này.
- Hồ sơ đề nghị đưa "diễn tập khôi phục đạt, có biên bản" thành **một điều kiện nghiệm thu bắt buộc** của giai đoạn production. Đây là hạng mục đầu tiên của giai đoạn vận hành.

---

### Cấp độ an toàn thông tin đề xuất và thẩm quyền phê duyệt

Hệ thống được **đề xuất cấp độ 2**. Hồ sơ đề xuất cấp độ đã được lập đủ ba phần bắt buộc theo Nghị định 85/2016/NĐ-CP và Thông tư 12/2022/TT-BTTTT. Đây là hồ sơ **trình cấp có thẩm quyền phê duyệt** trước khi hệ thống vận hành chính thức, không phải tài liệu tự công bố. Kiến trúc an toàn được thiết kế **theo mức cấp độ 3** ở những biện pháp có chi phí biên thấp, để việc nâng cấp độ về sau không kéo theo thiết kế lại hệ thống.

**Căn cứ và chi tiết triển khai**
- `docs/15-ho-so-de-xuat-cap-do-attt.md` §7.
- Bốn tiêu chí đều nhất quán ở mức cấp độ 2: phục vụ **nội bộ một đơn vị sự nghiệp công lập**; dữ liệu di sản phần lớn dự kiến công bố; dữ liệu cá nhân quy mô nhỏ (chủ yếu là cán bộ dùng hệ thống); hậu quả khi bị xâm phạm khoanh trong phạm vi chuyên môn và uy tín, không gián đoạn dịch vụ công thiết yếu.
- Hồ sơ tự nêu **ba điều kiện có thể phải nâng lên cấp độ 3** (§8):
  1. Xử lý **dữ liệu cá nhân diện rộng** (ví dụ công bố khối lượng lớn gia phả dòng họ khoa bảng, hoặc mở đăng ký tài khoản nghiên cứu viên công khai).
  2. **Phục vụ trực tiếp người dân quy mô lớn**, khi mở cổng tham quan số ở Giai đoạn 2.
  3. Chứa dữ liệu thuộc **danh mục bí mật nhà nước ngành văn hoá** — trạng thái hiện tại ghi **"CHƯA đối chiếu"**; hồ sơ khuyến nghị Trung tâm phối hợp cơ quan có thẩm quyền rà soát **trước khi** trình phê duyệt chính thức.
- **Ghi chú pháp lý:** Luật An ninh mạng 116/2025/QH15 (thông qua 10/12/2025, hiệu lực **01/7/2026**) hợp nhất và thay thế Luật ATTT mạng 86/2015 và Luật An ninh mạng 24/2018. Nghị định hướng dẫn phân loại cấp độ thay thế NĐ 85/2016 **chưa được ban hành** tại thời điểm lập hồ sơ, nên hồ sơ áp dụng NĐ 85/2016 + TT 12/2022 + TCVN 11930:2017 làm căn cứ kỹ thuật duy nhất hiện có, **kèm cam kết rà soát lại toàn bộ hồ sơ** — kể cả kết quả đã phê duyệt — ngay khi văn bản mới có hiệu lực.

**Lưu ý khi tiếp nhận**
- Cấp độ 2 đang ở trạng thái **đề xuất: chưa trình, chưa phê duyệt**. Hệ thống không được vận hành chính thức trước khi cấp độ được phê duyệt.
- Đề xuất vượt mức lên cấp độ 3 không được chọn vì cấp độ phải phản ánh đúng bốn tiêu chí; đề xuất vượt mức phát sinh thủ tục và chi phí không tương xứng. Vì kiến trúc đã thiết kế theo mức cấp độ 3, nếu điều kiện thay đổi thì chỉ phải bổ sung thủ tục hành chính và một số biện pháp hạ tầng.

---

### Thời hạn lưu nhật ký kiểm toán và căn cứ pháp lý áp dụng

Chuỗi căn cứ áp dụng cho hệ thống là NĐ 85/2016 → TT 12/2022 Điều 9 khoản 1 → **TCVN 11930:2017**, với mức tối thiểu cho **cấp độ 2 là ≥ 01 tháng**. Hệ thống **cấu hình được** thời hạn và **mặc định đặt 12 tháng**, cao hơn cả mức tối thiểu của cấp độ 3. Con số 12 tháng thường được viện dẫn từ **Nghị định 53/2022/NĐ-CP**, nhưng nghị định đó điều chỉnh **doanh nghiệp cung cấp dịch vụ trên mạng viễn thông/Internet**, không áp dụng cho đơn vị sự nghiệp công lập như Trung tâm.

**Căn cứ và chi tiết triển khai**
- `docs/15-ho-so-de-xuat-cap-do-attt.md` §13.1–13.3. Thang TCVN 11930:2017: cấp 1 không quy định thời hạn; **cấp 2 ≥ 01 tháng**; cấp 3 ≥ 03 tháng; cấp 4 ≥ 06 tháng; cấp 5 ≥ 12 tháng.
- **Hai loại nhật ký được quản lý tách biệt** (§13.4): nhật ký **an toàn thông tin** (đăng nhập, đổi quyền, truy cập, đổi cấu hình) chịu thời hạn theo cấp độ; **sự kiện bảo quản PREMIS** (ingest, kiểm tra toàn vẹn, di trú định dạng) ghi lịch sử vòng đời của chính dữ liệu và **lưu vĩnh viễn cùng gói AIP**, không áp dụng thời hạn tối thiểu theo cấp độ ATTT.
- Một thời hạn riêng: hồ sơ vi phạm dữ liệu cá nhân lưu **tối thiểu 05 năm** kể từ khi khắc phục xong sự cố, theo Nghị định 356/2025/NĐ-CP, độc lập với hai loại trên.
- Tính chất kỹ thuật của nhật ký (ADR-0012 và `15` §12.4): **chỉ ghi thêm (append-only), chuỗi băm liên kết, tách kho khỏi CSDL nghiệp vụ, kể cả tài khoản Quản trị cũng không sửa hoặc xoá được**, ghi tối thiểu 6 trường — thời điểm, người thực hiện, hành động, đối tượng, IP, kết quả.
- Ba chi tiết triển khai bổ sung theo `audit/05` §5.4(c): `REVOKE UPDATE, DELETE` với **mọi** vai trò ứng dụng kể cả vai trò migration; mỗi bản ghi mang `prev_hash` và **phát hành giá trị băm gốc hằng ngày ra kênh độc lập** để phát hiện cắt đuôi; và sửa lỗi hiện có ở lớp mock — trường thời gian đang ghi chuỗi hiển thị `'Vừa xong'`, ở production phải là `timestamptz`.

**Điểm dễ hiểu nhầm**
- Nghị định 53/2022/NĐ-CP **không** phải căn cứ áp dụng cho hệ thống này; hồ sơ chủ động không viện dẫn nó.
- Nhật ký trong bản MVP là mock, **chưa bất biến**. `ARC-15` là hạng mục "nhật ký kiểm toán bất biến đúng nghĩa" trong lộ trình.

---

### Phân vùng mạng, mã hoá dữ liệu và quản lý khoá

Mạng được tách cho ba nhóm: máy chủ ứng dụng và CSDL, máy chủ xử lý 3D có GPU, và kho lưu trữ off-site — trong đó **kho sao lưu tầng lạnh cách ly mạng một phần (gần air-gapped)** để chống ransomware lan từ hệ thống chính. Mọi kết nối ra ngoài đi qua **một điểm trung gian duy nhất là LGSP Thành phố**, không kết nối ngang hàng trực tiếp. Dữ liệu mã hoá **AES-256 khi lưu**, **khoá quản lý tách biệt khỏi hạ tầng lưu trữ**, có quy trình luân chuyển khoá.

**Căn cứ và chi tiết triển khai**
- `docs/15-ho-so-de-xuat-cap-do-attt.md` §12.1 (hạ tầng mạng) và §12.4 (an toàn dữ liệu).
- Mã hoá khi truyền: **TLS 1.2 trở lên** cho mọi kết nối người dùng–hệ thống; **mTLS hoặc tương đương** cho kênh LGSP.
- Xác thực: **hai yếu tố bắt buộc** với vai trò **Quản trị và Phê duyệt**. Ưu tiên đăng nhập một lần bằng OpenID Connect với tài khoản cơ quan.
- Tách môi trường phát triển / kiểm thử / vận hành về hạ tầng, dữ liệu **và thông tin xác thực**; môi trường không phải vận hành hiển thị **dải cảnh báo trên giao diện** để chặn thao tác nhầm môi trường.
- Bảo vệ dữ liệu giá trị cao: đóng dấu chìm động trên bản xem trước công khai, liên kết tải bản gốc **có thời hạn**, nhật ký tải xuống **tách riêng** bản gốc và bản phổ biến.

**Giả định và giới hạn**
- Tài liệu hiện mới nêu **nguyên tắc** quản lý khoá ("quản lý tách biệt, có quy trình luân chuyển") mà **chưa có quy trình chi tiết**: ai giữ khoá, chia thành mấy phần, khôi phục thế nào khi người giữ khoá nghỉ việc. Quy trình quản lý khoá là hạng mục phải hoàn thiện ở giai đoạn triển khai production và phải được bổ sung vào tài liệu vận hành bàn giao.
- Mã hoá khi lưu **chưa được bật** vì chưa có hạ tầng; đây là yêu cầu thiết kế, thực thi ở bước dựng production.

---

## E. Tuân thủ pháp lý Việt Nam

### Khung văn bản pháp luật áp dụng cho hệ thống

Khung pháp lý gồm năm nhóm. **Dữ liệu**: Luật Dữ liệu 60/2024/QH15 + NĐ 165/2025 + NĐ 278/2025. **Di sản**: Luật Di sản văn hoá 45/2024/QH15 + NĐ 308/2025 (Chương VIII chuyển đổi số). **Dữ liệu cá nhân**: Luật BVDLCN 91/2025/QH15 + NĐ 356/2025. **An toàn và an ninh mạng**: Luật An ninh mạng 116/2025 + NĐ 85/2016 + TT 12/2022 + TCVN 11930:2017. **Giao dịch điện tử**: Luật GDĐT 20/2023 + NĐ 137/2024 cho ký số bản số hoá.

**Căn cứ và chi tiết triển khai**
- Bảng căn cứ đầy đủ kèm số điều: `docs/01-thuyet-minh-ky-thuat.md` Chương 2. Ma trận truy vết từng yêu cầu về từng điều luật: `docs/03-ma-tran-truy-vet.md`.
- **Nghị định 47/2020/NĐ-CP đã bị bãi bỏ** bởi Điều 23 NĐ 278/2025/NĐ-CP ngày 22/10/2025. Toàn bộ hồ sơ **không viện dẫn NĐ 47/2020** và **không dùng thuật ngữ phái sinh của nó** ("Chia sẻ mặc định", "Theo yêu cầu đặc thù").
- **Kỷ luật trích dẫn:** ADR-0014 quy định **chỉ trích dẫn văn bản đã xác minh**; trong ma trận truy vết mỗi điều luật đều mang nhãn `[ĐÃ XÁC MINH]` hoặc `[CHƯA XÁC MINH]`. Bản audit độc lập ghi nhận đây là "kỷ luật trích dẫn pháp lý cao bất thường".

**Điểm dễ hiểu nhầm**
- Dải số điều **85–89 tồn tại cả trong Luật 45/2024 lẫn trong NĐ 308/2025** với nội dung khác nhau. Hồ sơ luôn ghi rõ "Điều X **Luật** 45/2024" hoặc "Điều X **NĐ** 308/2025"; khi trích dẫn lại cần giữ nguyên cách ghi này.
- Số điều cụ thể của từng yêu cầu tra được tại `docs/03-ma-tran-truy-vet.md`, là nguồn duy nhất cho ánh xạ yêu cầu ↔ điều luật.

---

### Mốc 31/12/2026 về kết nối trục dữ liệu và đối tượng chịu nghĩa vụ

Mốc 31/12/2026 là **Điều 24 NĐ 278/2025** (điều khoản chuyển tiếp — hoàn thành kết nối, chia sẻ dữ liệu trước 31/12/2026). Trung tâm là **đơn vị sự nghiệp công lập**, **không thuộc trực tiếp đối tượng áp dụng tại Điều 2 NĐ 278/2025**; nghĩa vụ tuân thủ đi qua **Sở Văn hoá và Thể thao / UBND Thành phố**. Về kỹ thuật, hệ thống đã thiết kế sẵn kênh kết nối qua **LGSP Thành phố** đúng theo NĐ 278.

**Căn cứ và chi tiết triển khai**
- `docs/01-thuyet-minh-ky-thuat.md` Chương 2 (NĐ 278/2025 Điều 2, 7, 8, 13, 14, 23, 24) và `docs/00-ke-hoach-nang-cap.md` §0 điểm 3.
- Căn cứ cụ thể nhất cho thiết kế tích hợp là văn bản của Thành phố: **Quyết định 85/2025/QĐ-UBND** của UBND TP Hà Nội (ban hành 27/12/2025, hiệu lực 06/01/2026), Điều 7 khoản 3 yêu cầu các cơ quan, đơn vị kết nối, chia sẻ dữ liệu qua **nền tảng tích hợp, chia sẻ dữ liệu số của Thành phố**, tuân thủ NĐ 278/2025.
- Kênh kết nối trong đặc tả API đã phân loại theo NĐ 278: `ket_noi_truc_tiep_nen_tang`, `dong_bo_dinh_ky`, `tai_len_csdl_tong_hop_quoc_gia` (NĐ 165/2025 Điều 10), `theo_thoa_thuan_chia_se` (`docs/06-dac-ta-api.md:29`).
- Yêu cầu giám sát của Điều 13 NĐ 278 là **"liên tục, công khai và có truy vết"**, đã ánh xạ vào màn "Kết nối & chia sẻ" và màn "Tuân thủ & quản trị dữ liệu". Mốc 31/12/2026 được hiển thị như một deadline tuân thủ trên giao diện, không chỉ nằm trong tài liệu.

**Lưu ý khi tiếp nhận**
- Hệ thống **chưa kết nối** trục dữ liệu; lớp mock chưa có endpoint thật. Đây là hạng mục giai đoạn sau.
- Hồ sơ từng có chỉ số "420 lượt gọi" trên một kênh chưa tồn tại. Con số này **đã được xác định là chỉ số bịa** và nằm trong danh sách phải gỡ (gói P0 mục 2); nó không phản ánh bất kỳ hoạt động thật nào.
- Khả năng đáp ứng mốc thời gian phụ thuộc **quyết định bố trí vốn**, không chỉ phụ thuộc đơn vị thi công.

---

### Nghĩa vụ theo Luật Di sản văn hoá 45/2024 và Nghị định 308/2025

Ba nghĩa vụ chính. **Điều 85 Luật 45/2024** — cơ quan, tổ chức xây dựng CSDL theo phân cấp và phải bảo đảm **tích hợp, kết nối, liên thông** với CSDL quốc gia về di sản văn hoá. **Điều 57 khoản 1 điểm đ** — di sản tư liệu phải được **chuyển dạng số, cập nhật, sao lưu** trên hệ thống CSDL quốc gia. **Điều 23** — kiểm kê di tích và Danh mục kiểm kê. Kiến trúc hệ thống được thiết kế theo ba nghĩa vụ này ngay từ đầu.

**Căn cứ và chi tiết triển khai**
- `docs/01-thuyet-minh-ky-thuat.md` Chương 2 và các dòng tương ứng trong `docs/03-ma-tran-truy-vet.md`, đều mang nhãn `[ĐÃ XÁC MINH]`.
- Luật 45/2024 thông qua 23/11/2024, hiệu lực **01/7/2025**, thay Luật 28/2001 và Luật 32/2009.
- **NĐ 308/2025 Điều 87** quy định việc chuyển đổi văn bản giấy sang thông điệp dữ liệu đối với di sản văn hoá thuộc **danh mục UNESCO / di tích quốc gia đặc biệt / bảo vật quốc gia** **cần ý kiến bằng văn bản của Bộ VHTTDL**. 82 bia Tiến sĩ là Di sản tư liệu thế giới UNESCO nên điều này áp dụng trực tiếp.
- **NĐ 308/2025 Điều 89** yêu cầu **kiểm duyệt nội dung trước khi đưa lên mạng** khi khai thác di sản văn hoá trên môi trường điện tử — đây là căn cứ pháp lý của quy trình duyệt trước khi xuất bản trong hệ thống.
- Điều 86 khoản 4 NĐ 308/2025 (chống sao chép dữ liệu trái phép hoặc bán dữ liệu thô) được đáp ứng bằng tổ hợp: đóng dấu chìm động, liên kết tải có thời hạn, nhật ký tải xuống tách riêng bản gốc và bản phổ biến, và điều khoản trong phát biểu quyền.

**Lưu ý khi tiếp nhận**
- Việc xin ý kiến Bộ VHTTDL về số hoá 82 bia theo Điều 87 NĐ 308/2025 là **thủ tục của chủ đầu tư**. Hồ sơ chỉ ra nghĩa vụ này; thủ tục **chưa được thực hiện** tại thời điểm bàn giao.
- Khi trích dẫn, luôn phân biệt "Luật 45/2024" và "NĐ 308/2025" vì cả hai đều có Điều 85–89 với nội dung khác nhau.

---

### Xử lý dữ liệu cá nhân theo Luật 91/2025 và Nghị định 356/2025

Hệ thống có xử lý dữ liệu cá nhân ở hai dạng: dữ liệu cán bộ dùng hệ thống, và dữ liệu cá nhân **nằm trong tư liệu lịch sử** (gia phả, sắc phong, ảnh chân dung). Ba nghĩa vụ chính: **DPIA gửi cơ quan chuyên trách trong 60 ngày** kể từ ngày đầu xử lý (Điều 21); **thông báo vi phạm chậm nhất 72 giờ** kể từ khi phát hiện (Điều 23); và **chỉ định bộ phận hoặc nhân sự bảo vệ dữ liệu cá nhân** (Điều 33 khoản 2), **không có ngoại lệ cho đơn vị sự nghiệp công lập**.

**Căn cứ và chi tiết triển khai**
- Luật 91/2025/QH15 thông qua 26/6/2025, **hiệu lực 01/01/2026**. Nguồn: `docs/01-thuyet-minh-ky-thuat.md` Chương 2, `docs/03-ma-tran-truy-vet.md` (mục D3, D5).
- **Điều 19 khoản 1 điểm c** cho phép xử lý dữ liệu cá nhân của cán bộ nội bộ phục vụ hoạt động quản lý nhà nước **không cần xin đồng ý riêng**, nhưng vẫn phải thiết lập cơ chế giám sát theo khoản 2.
- **Điều 16** — công khai dữ liệu cá nhân chỉ khi có sự đồng ý hoặc theo quy định pháp luật. Áp dụng trực tiếp khi nội dung thuyết minh nêu tên **người còn sống** trong gia phả hoặc sắc phong.
- Cơ chế kỹ thuật đã thiết kế: cờ `contains_personal_data` trên bản ghi, và **mã khuyết `HAN_CHE`** loại trường nhạy cảm khỏi API công khai. Yêu cầu kèm theo: mã khuyết này **không cho phép suy diễn ngược** thông tin bị hạn chế từ việc trường bị thiếu (`docs/06-dac-ta-api.md:1854`).
- Hồ sơ vi phạm dữ liệu cá nhân lưu **tối thiểu 5 năm** sau khi khắc phục (NĐ 356/2025).

**Lưu ý khi tiếp nhận**
- Việc chỉ định người phụ trách bảo vệ dữ liệu cá nhân theo Điều 33 khoản 2 là **nghĩa vụ của Trung tâm**; hệ thống cung cấp màn hình và quy trình để người được chỉ định làm việc.
- **DPIA tính 60 ngày từ ngày đầu tiên xử lý dữ liệu**, không phải từ ngày nghiệm thu. Đồng hồ bắt đầu chạy khi Trung tâm nhập liệu thật.
- Phát biểu "hệ thống không xử lý dữ liệu cá nhân" là sai; quy mô nhỏ nhưng có, và có cơ chế kiểm soát kèm theo.

---

### Chủ quyền dữ liệu và phụ thuộc dịch vụ nước ngoài

Kiến trúc đích **không** phụ thuộc dịch vụ nước ngoài: toàn bộ thành phần là mã nguồn mở tự vận hành tại Trung tâm, dữ liệu không rời hạ tầng của đơn vị. Bản MVP hiện tại **vẫn còn hai điểm gọi ra ngoài**: Google Fonts và một số ảnh minh hoạ từ Wikimedia. Đây là việc tồn đọng đã được xác định; hạng mục đầu tiên trong lộ trình là gỡ hai phụ thuộc đó, ước tính 0,5–1 người-ngày.

**Căn cứ và chi tiết triển khai**
- `docs/audit/00-tong-hop-de-xuat-nang-cap.md` §3.2 và gói P0 mục 1 (`RT-01`).
- Tính chất của hai phụ thuộc: **tài nguyên hiển thị của giao diện demo** (phông chữ, ảnh minh hoạ), **không phải dữ liệu di sản bị gửi ra ngoài**. Dù vậy vẫn phải gỡ vì chúng phá cam kết vận hành ngắt mạng.
- `docs/05-kich-ban-demo.md` đặt điều kiện tiên quyết rõ ràng cho phát biểu về chủ quyền dữ liệu: chỉ phát biểu sau khi checklist xác nhận đã gỡ Google Fonts và Wikimedia. Bản audit độc lập kết luận đây là **việc tồn đọng, không phải lỗi trung thực**.
- Kiến trúc production: PostgreSQL, MinIO, Keycloak, Cantaloupe, ClamAV, Prometheus/Grafana/Loki — tất cả tự vận hành, không có dịch vụ SaaS nước ngoài trong đường dữ liệu.

**Lưu ý khi tiếp nhận**
- Ở trạng thái chưa gỡ, khi ngắt mạng thì phông chữ toàn giao diện hiển thị sai và ảnh trên màn Tổng quan không tải được.
- Phát biểu "hệ thống hoạt động hoàn toàn độc lập, không gọi ra ngoài" chỉ đúng **sau khi** hoàn thành `RT-01` và checklist ngắt mạng được xác nhận.

---

## F. Lộ trình và vận hành hằng ngày

### Gói công việc P0 trước khi nộp thầu: 31–47 người-ngày

Gói P0 hợp nhất gồm 12 hạng mục, **31–47 người-ngày** ở mức đầy đủ. **Không hạng mục nào cần backend, và hạ tầng tăng thêm bằng 0 USD.** Có ba mức cắt gọt theo quỹ thời gian: mức tối thiểu **4,5–6 người-ngày** chặn các rủi ro vỡ demo; mức khuyến nghị **15–22 người-ngày**; mức đầy đủ **31–47 người-ngày**.

**Căn cứ và chi tiết triển khai**
- `docs/audit/00-tong-hop-de-xuat-nang-cap.md` §6, đã **khử trùng lặp** giữa 6 báo cáo audit trước khi cộng chi phí (§5); cộng thẳng 93 đề xuất sẽ cho tổng đội lên đáng kể.
- Bốn hạng mục quan trọng nhất, theo thứ tự thực hiện:
  1. **Gỡ Google Fonts và ảnh Wikimedia** (0,5–1 ngày) — chi phí thấp nhất, gỡ bỏ phụ thuộc ra ngoài, mở khoá phát biểu về chủ quyền dữ liệu.
  2. **Trung thực hoá nhãn** (1–1,5 ngày) — gỡ chỉ số chưa có thật, gắn nhãn "Giai đoạn 2" cho nút chưa nối chức năng; xử lý **rủi ro uy tín**.
  3. **Bọc lớp dịch vụ trả `Promise` và tách `contracts.ts`** (4–6 ngày) — điều kiện nền; thực hiện muộn thì các hạng mục phụ thuộc phải làm lại.
  4. **Nối dây quyền vào UI và guard vai trò cho route** (2–3 ngày).
- Hai hạng mục tạo khác biệt trước hội đồng có chuyên gia di sản: **IIIF manifest tĩnh + viewer** (5–8 ngày, được đánh giá **ROI cao nhất toàn audit** vì là JSON tĩnh, không cần backend) và **bộ xuất LIDO 1.1 + Dublin Core XML** (8–12 ngày).
- Một hạng mục nền: **đưa mã vào git và dựng CI tối thiểu** (1–2 ngày). Thư mục gốc hiện chưa phải kho git; audit xếp đây là việc nên làm **trước tiên**.

**Lưu ý khi tiếp nhận**
- **Con số P0 thống nhất là 31–47 người-ngày** ở mức đầy đủ, 15–22 ở mức khuyến nghị, 4,5–6 ở mức tối thiểu. Bản tổng hợp `docs/audit/00` trước đây có một dòng kết luận ghi "26–36" lệch với bảng chi tiết; dòng này **đã được cập nhật ngày 08/09/2026** cho khớp với bảng. Bản in trước ngày đó có thể còn chứa con số cũ.
- Khi chọn một mức cắt gọt, cần ghi rõ mức đó chặn được rủi ro nào và chưa chặn được rủi ro nào; các mức thấp hơn không phủ hết 12 hạng mục.

---

### Lộ trình 6 tháng và 18 tháng sau khi trúng thầu

**6 tháng đầu — dựng nền móng production:** Postgres + MinIO + Keycloak rời trên Docker Compose, tus.io cho tải lên tệp lớn, pg-boss cho hàng đợi, nhật ký append-only có hash-chain thật, phiên bản tài sản và lineage, fixity chạy thật, máy chủ ảnh IIIF (Cantaloupe). **18 tháng — trưởng thành:** OpenSearch khi bắt đầu lập chỉ mục Hán Nôm, định danh bền vững ARK/DOI, endpoint OAI-PMH thật, EDM/Europeana, chú giải trên ảnh và mô hình 3D, và lộ trình **CoreTrustSeal**.

**Căn cứ và chi tiết triển khai**
- `docs/audit/00-tong-hop-de-xuat-nang-cap.md` §7.
- **Mốc chuyển sang OpenSearch gắn với loại công việc, không gắn với số bản ghi:** chuyển khi bắt đầu **số hoá toàn văn Hán Nôm**, hoặc khi vượt ~100.000 tài liệu. Lý do kỹ thuật: chữ Hán không có dấu cách, bộ tách từ mặc định của Postgres coi cả dòng chữ Hán là **một token duy nhất**, làm tìm kiếm trong lòng văn bản gần như vô dụng. Với tiếng Việt có dấu, Postgres + `unaccent` giải trọn vẹn, không cần OpenSearch (`audit/05` §5.3).
- **Ngưỡng vỡ đã đo được:** lọc phía client hiện ~5,0 µs/bản ghi → bắt đầu rớt khung hình ở **~3.200 bản ghi**, 49,5 ms ở 10.000, 235 ms ở 50.000. Dự án chạm ngưỡng này **ngay khi số hoá Hán Nôm theo trang ở giai đoạn 2**, không phải giai đoạn 3. Phải chuyển sang phân trang và lọc phía máy chủ trước mốc đó.
- **CoreTrustSeal** (≈ 1.000 EUR/3 năm, 16 yêu cầu): báo cáo chuẩn bảo tàng số khuyến nghị theo đuổi chứng nhận này, và khuyến nghị **không** theo ISO 16363 hay nestor Seal ở giai đoạn hiện tại vì mức yêu cầu nặng hơn nhiều so với năng lực tổ chức.

**Giả định và giới hạn**
- CoreTrustSeal là **lộ trình khuyến nghị**, không phải cam kết có thời hạn; kết quả phụ thuộc mức trưởng thành của quy trình tổ chức chứ không chỉ phụ thuộc phần mềm.
- Việc dựng xong production trong 6 tháng phụ thuộc hai điều kiện ngoài phạm vi đơn vị thi công: **thời điểm có dữ liệu thật từ NAS** và **thời điểm phê duyệt hồ sơ cấp độ ATTT** (hệ thống không được vận hành chính thức trước khi cấp độ được phê duyệt).

---

### Quy trình nhập liệu, kiểm định và phê duyệt

Quy trình xương sống gồm **9 bước tuần tự**: Chờ xử lý → Đang xử lý → Kiểm định chất lượng → Chờ duyệt → Thẩm định nội dung → Đã duyệt → Xuất bản → Đã lưu trữ đang giám sát → Đã kiểm kê. Cộng 2 trạng thái ngoài chuỗi là "Cần số hoá lại" (nhánh trượt QC) và "Đã gỡ/thu hồi" (deaccession), tổng 11 trạng thái. Chuyên viên số hoá nhập liệu, biên tập viên làm siêu dữ liệu, trưởng phòng và Ban Giám đốc phê duyệt; **quyền phê duyệt tách khỏi quyền xuất bản** theo ADR-0011.

**Căn cứ và chi tiết triển khai**
- Nguồn duy nhất của thứ tự trạng thái là `app/src/data/pipeline.ts`; định nghĩa thuật ngữ ở `docs/thuat-ngu.md`; kiểm thử ở `docs/11-ke-hoach-kiem-thu.md` §7.3.
- Hai điểm tách vai quan trọng: **tách Kiểm định chất lượng (kỹ thuật) khỏi Thẩm định nội dung (chuyên môn)**, và **tách Phê duyệt khỏi Xuất bản**. Bản audit đối chiếu với ShotGrid/Frame.io nhận xét đây là "phần hơn nhiều CMS di sản thương mại".
- Trạng thái "Đã gỡ/thu hồi" **giữ nguyên bản ghi, không xoá, và mã định danh không cấp lại**, đúng thực tiễn bảo tàng.
- Đào tạo theo **4 nhóm** (`docs/14` §7): Nhập liệu 2 buổi; Biên tập 3 buổi; Phê duyệt/Lãnh đạo 1 buổi; Quản trị hệ thống 2 buổi cộng 2 chuyên đề (bảo vệ dữ liệu cá nhân, bảo quản số). Mỗi lớp **thực hành trên dữ liệu thật của Trung tâm** và có **bài kiểm tra cuối lớp**; đào tạo lại tối thiểu 1 đợt/năm khi có thay đổi nhân sự.

**Lưu ý khi tiếp nhận**
- **Ba nguồn trong hồ sơ hiện chưa khớp nhau về tập trạng thái**: app khai báo 11 trạng thái; đặc tả API khai báo 11 trạng thái **khác** (không có Kiểm định chất lượng nhưng có `de_xuat`); ma trận truy vết mô tả "pipeline 9 trạng thái". Đây là hạng mục 6 của gói P0 (đồng bộ enum app ↔ đặc tả API, 0,5–1 ngày), chưa được xử lý ở bản hiện tại.
- Nguyên tắc bốn mắt trong bản MVP **mới áp cho 1 trong 9 bước**, và ở tầng giao diện chứ chưa ở tầng dịch vụ; người phụ trách vẫn có thể tự QC và tự xuất bản bản ghi của chính mình. ADR-0011 đã ghi nhận rủi ro này. Ở production, bốn mắt phải là **ràng buộc trong lược đồ CSDL** — `CHECK (approved_by <> submitted_by)` cộng trigger kiểm vai trò — vì một điều kiện `if` ở tầng React không phải là kiểm soát nội bộ và không đáp ứng yêu cầu kiểm toán.
- "Bốn mắt" là **thông lệ kiểm soát nội bộ tốt**, **không phải điều khoản chuẩn hoá**: thuật ngữ này không tồn tại trong OAIS (ISO 14721) hay ISO 16363.

---

### Kiểm kê tài sản số và mối nối với sổ kiểm kê hiện vật gốc

Kiểm kê là **bước cuối** của quy trình 9 bước ("Đã kiểm kê"). Nguyên tắc là **đối chiếu số kiểm kê hiện vật gốc với mã định danh tài sản số**: hai sổ phải nối được với nhau, không vận hành như hai hệ thống song song. Căn cứ là **Điều 23 Luật Di sản văn hoá 45/2024** về kiểm kê di tích và Danh mục kiểm kê. Cán bộ bảo quản số thực hiện, **Lãnh đạo Trung tâm chịu trách nhiệm cuối**, có biên bản và báo cáo Sở.

**Căn cứ và chi tiết triển khai**
- Phân vai theo bảng RACI ở `docs/02-quy-trinh-bao-quan-sao-luu.md` §8, dòng "Kiểm kê định kỳ tài sản số": Cán bộ bảo quản số = R, **Lãnh đạo Trung tâm = A**, Kỹ thuật số hoá = C, Phê duyệt = I.
- Trường `so_kiem_ke` trong đặc tả API dẫn chiếu thẳng Điều 23 Luật 45/2024 (`docs/06-dac-ta-api.md:1491`); mối nối giữa sổ giấy và sổ số nằm trong mô hình dữ liệu, không xử lý thủ công bên ngoài hệ thống.
- Hệ thống định danh 5 tầng (ADR-0004) là cơ sở để mã tài sản số không trùng và không cấp lại sau khi thu hồi.

**Giả định và giới hạn**
- Trách nhiệm cuối về số liệu kiểm kê thuộc **Lãnh đạo Trung tâm** theo bảng RACI. Đơn vị thi công cung cấp công cụ và quy trình; trách nhiệm nghiệp vụ thuộc đơn vị sử dụng.
- Hệ thống **không tự động đối chiếu** với sổ kiểm kê hiện vật gốc. Nếu sổ gốc chưa số hoá thì việc đối chiếu vẫn còn phần thủ công; hệ thống hỗ trợ ghi nhận và truy vết, không thay thế nghiệp vụ kiểm kê.

---

### Cam kết bảo hành và mức dịch vụ (SLA)

Bảo hành **tối thiểu 12 tháng** kể từ ngày ký biên bản nghiệm thu tổng thể, cộng **hỗ trợ tại chỗ trong tháng đầu tiên** — giai đoạn chuyển tiếp khi cán bộ vừa đào tạo xong bắt đầu làm trên dữ liệu thật. SLA bốn mức: sự cố **Nghiêm trọng** tiếp nhận ≤ 1 giờ, khắc phục ≤ 4 giờ; **Cao** ≤ 4 giờ / ≤ 1 ngày làm việc; **Trung bình** ≤ 1 ngày / ≤ 5 ngày làm việc; **Thấp** ≤ 2 ngày / theo đợt cập nhật định kỳ.

**Căn cứ và chi tiết triển khai**
- `docs/14-van-hanh-va-ban-giao.md` §4.1 và §9.
- Ví dụ cụ thể cho mức Nghiêm trọng: không đăng nhập được toàn hệ thống; **phát hiện checksum AIP lệch mà không tự phục hồi được**; nghi vấn rò rỉ dữ liệu cá nhân.
- Phạm vi bảo hành: sửa lỗi phần mềm, hiệu chỉnh sai lệch so với thiết kế đã phê duyệt, xử lý lỗ hổng ATTT phát hiện trong thời gian bảo hành, và **cập nhật khi thành phần nền mã nguồn mở có bản vá bảo mật quan trọng**. **Không** thuộc phạm vi: yêu cầu phát sinh mới ngoài phạm vi đã ký; sự cố do thay đổi hạ tầng hoặc thao tác sai của người vận hành **đã được đào tạo**.
- Sau bảo hành: hợp đồng bảo trì hằng năm, thông lệ **10–15 %/năm** giá trị phần mềm. Phạm vi bảo trì có một cam kết cụ thể: **hỗ trợ điều chỉnh lớp ánh xạ dữ liệu khi Bộ VHTTDL công bố bộ tiêu chuẩn dữ liệu số ngành**.

**Giả định và giới hạn**
- Mệnh đề "người vận hành **đã được đào tạo**" là điều kiện của phần loại trừ. Nếu Trung tâm không cử người đi đào tạo, hoặc thay người mà không đào tạo lại, ranh giới trách nhiệm trở nên khó xác định. Cam kết đào tạo lại tối thiểu 1 đợt/năm tồn tại để xử lý tình huống này.
- Chế độ trực và kênh tiếp nhận sự cố quy định tại `docs/14` §4.3. SLA nêu trên **không** bao gồm cam kết trực 24/7 tại chỗ trừ khi hợp đồng ghi rõ.

---

## G. Rủi ro và phụ thuộc

### Thoát phụ thuộc nhà cung cấp: chuyển giao quyền sở hữu mã nguồn

Hồ sơ có một chương riêng về thoát phụ thuộc nhà cung cấp. Ba điểm cốt lõi: **chuyển giao quyền sở hữu mã nguồn** — chủ đầu tư có **toàn quyền sửa đổi, mở rộng, thuê đơn vị khác bảo trì mà không cần sự đồng ý của nhà thầu**; toàn bộ mã nguồn, kịch bản dựng và kịch bản triển khai được bàn giao đủ để **một đơn vị kế nhiệm bất kỳ build lại hệ thống từ đầu**; và **không có cơ chế khoá dữ liệu** — không mã hoá bằng khoá riêng của nhà thầu, không định dạng đóng gói buộc phải dùng phần mềm của nhà thầu để mở.

**Căn cứ và chi tiết triển khai**
- `docs/14-van-hanh-va-ban-giao.md` §8.4 (danh mục bàn giao — quyền sở hữu) và §10 (kế hoạch thoát phụ thuộc nhà cung cấp), gồm 4 nguyên tắc thiết kế, quy trình xuất dữ liệu, và 5 cam kết đi kèm.
- **Quy trình xuất dữ liệu theo chuẩn mở** là cam kết kiểm chứng được: chạy bằng công cụ chuẩn của PostgreSQL, giao thức OAI-PMH, hoặc thao tác sao chép tệp thông thường trên kho tương thích S3 — **không bước nào cần quyền truy cập độc quyền của nhà thầu**. Gói xuất gồm: siêu dữ liệu mô tả, toàn bộ tệp gốc AIP nguyên định dạng, manifest checksum SHA-256 và sự kiện PREMIS đầy đủ vòng đời, nhật ký hệ thống — kèm tài liệu mô tả cấu trúc thư mục để đọc được **mà không cần phần mềm gốc**.
- Điều kiện xuất: **không giới hạn thời gian**, yêu cầu bất kỳ lúc nào trong và sau bảo hành, **không phát sinh phí** cho thao tác xuất dữ liệu chuẩn, và áp dụng **cả với dữ liệu phát sinh trong quá trình vận hành**, không chỉ dữ liệu tại thời điểm bàn giao.
- Bốn nguyên tắc chống khoá nhà cung cấp: ưu tiên mã nguồn mở (không phí bản quyền); không định dạng độc quyền cho dữ liệu lưu trữ dài hạn; không lược đồ siêu dữ liệu riêng (dùng Dublin Core/TCVN 7980, CIDOC-CRM, PREMIS); cấu hình tách khỏi mã nguồn.

**Ghi chú thuật ngữ và giới hạn**
- Cơ chế của hồ sơ là **chuyển giao quyền sở hữu mã nguồn**, **không** phải **ký quỹ mã nguồn (escrow)**. Hai cơ chế khác nhau về hiệu lực: ký quỹ chỉ mở kho khi nhà thầu phá sản, còn chuyển giao quyền sở hữu cho chủ đầu tư quyền sử dụng và sửa đổi ngay từ đầu. Dùng lẫn hai thuật ngữ này mô tả sai phạm vi quyền mà chủ đầu tư thực có.
- Giới hạn đã biết: hệ thống dùng công nghệ phổ thông (React, TypeScript, PostgreSQL, Docker) nên thị trường nhân lực đọc được mã, và có tài liệu thiết kế đầy đủ (ERD, OpenAPI, 20 ADR); nhưng **không có cộng đồng sản phẩm** như một phần mềm mã nguồn mở quốc tế, nên việc tìm đơn vị bảo trì kế nhiệm phụ thuộc thị trường dịch vụ trong nước. Lá chắn còn lại trong tình huống đó là cam kết xuất dữ liệu chuẩn mở: dữ liệu lấy ra được toàn bộ và chuyển sang hệ khác.

---

### Cơ sở lựa chọn tự phát triển thay vì sản phẩm có sẵn

Các sản phẩm CollectiveAccess, Islandora, Preservica, Archivematica và Axiell/TMS đều được đối chiếu, và các chuẩn của họ — OAIS, PREMIS, CIDOC-CRM — nằm trong thiết kế này. Ba khoảng trống dẫn tới quyết định tự phát triển: **không sản phẩm nào có sẵn nghiệp vụ tuân thủ pháp luật Việt Nam 2025** (DPIA, thông báo sự cố 72 giờ, danh mục dữ liệu mở gửi Bộ Công an, kết nối trục LGSP theo NĐ 278); **không sản phẩm nào có trường Hán Nôm ba lớp** nguyên văn – phiên âm – dịch nghĩa; và giao diện tiếng Việt cho cán bộ nghiệp vụ cần thiết kế theo quy trình làm việc của Trung tâm chứ không phải bản dịch.

**Căn cứ và chi tiết triển khai**
- Bảng so sánh đầy đủ 13 tiêu chí × 6 sản phẩm: `docs/audit/06-red-team-cham-thau.md` §4.1.
- Ưu thế của hồ sơ này theo bảng so sánh: nghiệp vụ tuân thủ pháp luật VN 2025 (không sản phẩm nào trong 5 sản phẩm kia có sẵn), kết nối LGSP/NĐ 278 (tương tự), giao diện tiếng Việt gốc, trường Hán Nôm ba lớp, và **không có phí bản quyền năm 3–5** (Preservica và Axiell/TMS đều có phí định kỳ).
- Một phân biệt nghiệp vụ liên quan: **sao lưu (backup) khác bảo quản số (digital preservation)**. Sao lưu bảo vệ khỏi mất tệp; bảo quản số bảo vệ khỏi **hỏng âm thầm (bit rot)** và **lỗi thời định dạng** — hai nguyên nhân làm mất dữ liệu di sản trong chu kỳ 20 năm.

**Giả định và giới hạn**
- Bốn điểm hồ sơ này kém hơn sản phẩm có sẵn, đã xác định rõ:
  1. **Chín muồi** — các sản phẩm kia đã chạy ở nhiều bảo tàng; bản bàn giao này là MVP chưa có backend.
  2. **Bảo quản số mới ở mức thiết kế, chưa ở mức mã** — hiện **chưa có dòng mã nào tính mã băm** trong app, trong khi đó là nghiệp vụ chính của Archivematica/Preservica. Đây là khoảng cách lớn nhất.
  3. **Không có cộng đồng và không có nhà thầu thứ hai sẵn sàng** — với sản phẩm mã nguồn mở phổ biến, nhà thầu A ngừng hoạt động vẫn thuê được nhà thầu B.
  4. **Chưa có bằng chứng vận hành thật** — chưa có danh sách khách hàng hay thư giới thiệu tương đương.
- Nhận định "làm thêm nghiệp vụ tuân thủ Việt Nam trên phần mềm nước ngoài thường đắt hơn làm mới vì phải sửa lõi và duy trì bản vá riêng qua từng lần nâng cấp" là **đánh giá kỹ thuật, không phải con số đã khảo sát**.
- Hệ thống **thiết kế theo** OAIS/PREMIS và hiện thực **ở mức thiết kế**; chưa hiện thực đầy đủ ở mức mã, nên không phát biểu là đã đạt chuẩn OAIS/PREMIS.

---

### Năng lực vận hành của đội IT tiếp nhận

Quy mô đội IT của Trung tâm là ràng buộc **định hình toàn bộ lựa chọn kỹ thuật** của hồ sơ: Docker Compose thay vì Kubernetes, pg-boss chạy trong Postgres thay vì cụm Redis riêng, Postgres FTS trước rồi mới OpenSearch, MinIO một binary thay vì Ceph. Mỗi lựa chọn đổi năng lực lấy đơn giản. Kèm theo là đào tạo 4 nhóm có bài kiểm tra cuối lớp, hỗ trợ tại chỗ tháng đầu, bảo hành 12 tháng, và **0,5 FTE** vận hành đã tính trong OPEX.

**Căn cứ và chi tiết triển khai**
- `docs/14-van-hanh-va-ban-giao.md` §7 (đào tạo) và §9 (bảo hành, hỗ trợ tháng đầu); `docs/audit/05-kien-truc-va-production.md` §5.2 và §5.5 (lý do chọn công nghệ đều quy về năng lực đội mỏng).
- Nhóm 4 (Quản trị hệ thống) học 2 buổi cộng 2 chuyên đề: bảo vệ dữ liệu cá nhân (DPIA, quy trình 72 giờ, sổ đăng ký tuân thủ) và bảo quản số (kiểm tra toàn vẹn, điểm khôi phục, chỉ số bảo quản, lịch rà soát định dạng). Thực hành trên **môi trường vận hành thử**, có bài kiểm tra cuối lớp.
- **Đào tạo lại tối thiểu 1 đợt/năm** khi có thay đổi nhân sự.
- Hạng mục `audit/05` khuyến nghị đầu tư thay cho công nghệ phức tạp: quy trình sao lưu **đã diễn tập**, giám sát có cảnh báo tới người trực, và **tài liệu vận hành đủ để người thứ hai khôi phục hệ thống ngoài giờ**.

**Giả định và giới hạn**
- Hệ thống **không** thuộc loại dễ vận hành: bốn thành phần rời (Postgres, MinIO, Keycloak, worker) cộng 105 TB dữ liệu và ba bản sao. Phương án đã chọn là phương án ít phức tạp nhất trong các phương án đáp ứng được yêu cầu, và 0,5 FTE đã được tính sẵn trong dự toán vận hành.
- Rủi ro nhân sự nghỉ việc có ba lớp phòng vệ: đào tạo lại 1 đợt/năm; tài liệu vận hành viết cho người thứ hai; và tối thiểu **2 tài khoản quản trị độc lập** trong danh mục bàn giao. Đây vẫn là rủi ro tổ chức mà phần mềm không giải quyết được.

---

### Giới hạn quy mô đã đo và cách xử lý khi mở rộng

Khả năng chịu tải tách làm hai phần. **Số lượng bản ghi mô tả** không phải rủi ro: dữ liệu nhẹ, CSDL quan hệ xử lý hàng triệu bản ghi ở mức bình thường. **Dữ liệu 3D là phần nặng**: tệp gốc nằm trên kho đối tượng chứ không trong CSDL, mở rộng bằng **thêm dung lượng chứ không thay hệ thống**; mỗi tệp gốc luôn có bản tối ưu nhẹ hơn để xem trên web. Các chỉ tiêu tải cụ thể **chưa đo được** vì chưa nối hạ tầng thật; hồ sơ đề xuất đưa kiểm thử tải vào **điều kiện nghiệm thu** với chỉ tiêu do Trung tâm chốt.

**Căn cứ và chi tiết triển khai**
- Ngưỡng vỡ **đã đo được**: lọc phía client hiện ~5,0 µs/bản ghi → bắt đầu rớt khung hình ở **~3.200 bản ghi**, 49,5 ms ở 10.000, 235 ms ở 50.000 (`audit/05` §4). Dự án chạm ngưỡng này **ngay ở giai đoạn 2** khi số hoá Hán Nôm theo trang. Biện pháp đã xác định: phân trang, lọc và tìm kiếm **phía máy chủ** (`ARC-03`) cùng ảo hoá danh sách (`ARC-08`).
- Về tệp 3D: mesh 8–14 triệu tam giác cho tệp GLB **350–620 MB** theo công thức của chính dự án, không thể nạp nguyên khối. Giải pháp là **3D Tiles (chuẩn OGC) cộng nén Draco/meshopt**, phục vụ bằng tệp tĩnh trên MinIO, không cần máy chủ chuyên dụng.
- Hồ sơ ghi nhận giới hạn của bản MVP: "không phản ánh được hiệu năng, độ trễ mạng, hoặc hành vi đồng thời nhiều người dùng thật".

**Điểm dễ hiểu nhầm**
- Phát biểu "kiến trúc không giới hạn số bản ghi" từng xuất hiện trong kịch bản demo và **đã được xác định là nói quá**. Kiến trúc có giới hạn cụ thể, và giới hạn đo được nêu ở trên là con số áp dụng.
- Ở thời điểm này, hồ sơ không đưa ra chỉ tiêu tải cam kết; chỉ tiêu sẽ được xác lập qua kiểm thử tải trong giai đoạn nghiệm thu production.

---

### Danh mục rủi ro chính của dự án

Rủi ro lớn nhất **không phải khối lượng công việc chưa làm, mà là khoảng cách giữa mô tả trong tài liệu và chức năng thực có trong phần mềm**. Bản audit nội bộ độc lập xếp đây là **rủi ro số 1**, đã liệt kê từng chỗ, và hạng mục đầu tiên của gói P0 là **trung thực hoá nhãn**: gỡ chỉ số chưa có thật, gắn nhãn "Giai đoạn 2" cho chức năng chưa nối. Rủi ro thứ hai là **phụ thuộc một nhà thầu duy nhất**, đối trọng là cam kết chuyển giao quyền sở hữu mã nguồn cộng cam kết xuất dữ liệu chuẩn mở.

**Căn cứ và chi tiết triển khai**
- `docs/audit/00-tong-hop-de-xuat-nang-cap.md` §3.2 và `docs/16-van-de-da-biet.md`.
- Quy trình tự kiểm: dự án đã chạy **6 báo cáo audit độc lập** (đối chiếu DAM VFX, chuẩn bảo tàng số, định dạng và bảo quản, quy trình duyệt, kiến trúc và production, và red-team đóng vai hội đồng chấm thầu), tổng 5.782 dòng và 93 đề xuất, sau đó khử trùng lặp và tự đính chính hai chỗ **theo hướng hạ giọng cho đúng sự thật**.
- Bốn khoảng cách nền so với hệ quản lý tài sản chuyên nghiệp: chưa có khái niệm **phiên bản**; mô hình **một tài sản = một tệp** (chưa đủ cho bảo quản); chưa có **quan hệ dẫn xuất (lineage)**; và **quyền hiện là trang trí**, chưa được thực thi.
- Ba việc audit khuyến nghị chốt trước khi sửa mã: chọn mức gói P0; thống nhất **một luồng làm việc** trên mã nguồn; và **đưa dự án vào quản lý phiên bản git** — thư mục gốc hiện chưa phải kho git, và audit xếp đây là việc nên làm trước tiên.
- Các điểm mạnh cần duy trì: độ chính xác di sản (can chi tính bằng thuật toán có test, mốc UNESCO đúng, tự phát hiện lỗi long sàng thuộc di tích khác); kỷ luật trích dẫn pháp lý (ADR-0014); kiến trúc OAIS ba tầng với `PREMIS_EVENT` có `DEACCESSION`; bộ 5 mã khuyết giá trị có ngữ nghĩa phân biệt (ADR-0005), đúng thực tiễn bảo tàng nơi "chưa nhập" khác "không áp dụng" khác "đã mất".
- Nhận định tổng quát của bản audit: nền móng OAIS **tốt hơn mức dự án tự nhận**, còn hồ sơ thì đang trình bày nặng về các tính năng chưa có trong khi các phần thực sự hiếm lại được trình bày nhạt.

**Lưu ý khi tiếp nhận**
- Ba mâu thuẫn nội bộ còn tồn tại ở bản này và đã có hạng mục xử lý tương ứng: dung lượng 127,4 GB trên màn Sao lưu lệch ~55× so với mô hình dựng từ tham số vật lý (nhóm B); ba nguồn app / đặc tả API / ma trận truy vết chưa khớp về tập trạng thái pipeline (nhóm F); và một số nhãn giao diện mô tả chức năng chưa có (mục này).
- Con số gói P0 **đã được thống nhất là 31–47 người-ngày** ở mọi tài liệu sau bản cập nhật ngày 08/09/2026; đây không còn là điểm mâu thuẫn.
- Trạng thái xử lý của từng hạng mục cần được theo dõi riêng: hạng mục nào đã sửa, hạng mục nào trong gói P0, hạng mục nào thuộc giai đoạn sau.

---

## Bảng tra nhanh số liệu chính

| Hạng mục | Con số | Mức tin cậy |
|---|---|---|
| Dung lượng bản gốc (AIP) | **≈ 105 TB** | Suy từ công thức dự án; **chưa đo dữ liệu thật** |
| Đĩa thô cần mua | **≈ 346 TB** + ~6 TB SSD + ~30 cuộn LTO-9 | Tính từ 105 TB, EC 8+3, +20 % dự phòng |
| Tỷ lệ ảnh nguồn photogrammetry | **~63 %** tổng dung lượng | Nếu không giữ: 105 TB → **≈ 21 TB** |
| CAPEX | **≈ 56.000 – 89.000 USD** | **Giả định, CHƯA khảo giá** |
| OPEX | **≈ 18.600 – 29.800 USD/năm** | **Giả định, CHƯA khảo giá**; gồm 0,5 FTE |
| TCO 5 năm | **161.000 – 256.000 USD** | **Giả định, CHƯA khảo giá** |
| Điểm hoà vốn thuê vs. tự vận hành | **~10,7 USD/TB/tháng** | Công thức kiểm chứng được |
| RPO / RTO | **≤ 24 giờ / ≤ 4 giờ** | Cam kết thiết kế, **chưa diễn tập** |
| Fixity | Quý (bia, Hán Nôm) · 6 tháng (còn lại) · năm (toàn kho); chỉ tiêu **≥ 99,5 %** | Quy trình đã thiết kế, chưa chạy thật |
| Cấp độ ATTT | **Đề xuất cấp độ 2**, thiết kế theo mức cấp độ 3 | **Chưa trình, chưa phê duyệt** |
| Lưu nhật ký ATTT | Cấp 2: **≥ 01 tháng** (TCVN 11930:2017); hệ mặc định **12 tháng** | Không áp dụng NĐ 53/2022 |
| Mốc kết nối trục dữ liệu | **31/12/2026** (Điều 24 NĐ 278/2025) | Nghĩa vụ đi qua Sở/UBND TP |
| Gói P0 trước thầu | **31–47 người-ngày** (đầy đủ); khuyến nghị 15–22; tối thiểu 4,5–6 | Đã khử trùng lặp; thống nhất từ 08/09/2026 |
| Bảo hành / bảo trì | **12 tháng**; bảo trì **10–15 %/năm** giá trị phần mềm | Theo `docs/14` §9 |
| Quy trình duyệt | **9 bước** tuần tự + 2 trạng thái ngoài chuỗi = 11 | Ba nguồn hồ sơ **chưa khớp** — xem nhóm F |
| Ngưỡng lọc phía client | Rớt khung hình từ **~3.200 bản ghi**; 235 ms ở 50.000 | Đã đo (`audit/05` §4) |
| `KHR_gaussian_splatting` | **Release Candidate, CHƯA phê chuẩn** | Kiểm chứng 12/08/2026; cần kiểm lại định kỳ |

---

*Tài liệu tổng hợp từ `docs/audit/00`, `docs/audit/05`, `docs/audit/03`, `docs/audit/02`, `docs/audit/06`, `docs/02-quy-trinh-bao-quan-sao-luu.md`, `docs/14-van-hanh-va-ban-giao.md`, `docs/15-ho-so-de-xuat-cap-do-attt.md`, `docs/01-thuyet-minh-ky-thuat.md` và `docs/03-ma-tran-truy-vet.md`. Mọi con số USD là **giả định chưa khảo giá**. Mọi con số dung lượng là **mô hình chưa đo trên dữ liệu thật**. Cập nhật lần cuối: 09/09/2026.*
