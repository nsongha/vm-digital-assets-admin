# Kế hoạch kiểm thử

**Hệ thống quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám**

| Trường | Nội dung |
|---|---|
| Mã tài liệu | 11 |
| Tên tài liệu | Kế hoạch kiểm thử (Test Plan) |
| Chuẩn áp dụng | ISO/IEC/IEEE 29119-3:2021 — Software testing, Part 3: Test documentation (cấu trúc Test Plan, Test Case Specification rút gọn) |
| Phiên bản | 1.0.0 |
| Ngày ban hành | 12/08/2026 |
| Trạng thái | Dự thảo — phục vụ hồ sơ dự thầu, chờ Trung tâm phê duyệt trước khi đưa vào hợp đồng |
| Đơn vị lập | Nhà thầu, phối hợp Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám |
| Tài liệu liên quan | `00-ke-hoach-nang-cap.md` (mã khuyết giá trị, mã định danh, quyết định thiết kế) · `01-thuyet-minh-ky-thuat.md` (Chương 4 yêu cầu chức năng CN-xx, Chương 5 phi chức năng PCN-xx, Chương 9 an toàn thông tin) · `02-quy-trinh-bao-quan-sao-luu.md` (quy trình sao lưu, kiểm tra toàn vẹn) · `03-ma-tran-truy-vet.md` (đối chiếu wireframe ↔ màn hình ↔ pháp lý) · `07-mo-hinh-du-lieu.md` (ERD, từ điển dữ liệu) · `09-dac-ta-yeu-cau-srs.md` (mã yêu cầu chuẩn hoá `YC-CN-xx.y`/`YC-PCN-xx` dùng làm cột Truy vết ở mục 7) · `adr/` (16 quyết định kiến trúc/thiết kế, mã `ADR-00NN`, dùng làm cột Truy vết khi phù hợp) · `12-chat-luong-du-lieu.md` (đo lường chất lượng dữ liệu) · `15-ho-so-de-xuat-cap-do-attt.md` (yêu cầu an toàn theo cấp độ) |

---

## Mục lục

1. Giới thiệu
2. Chiến lược kiểm thử tổng thể
3. Ma trận rủi ro → mức độ kiểm thử
4. Phạm vi trong / ngoài phạm vi
5. Môi trường kiểm thử
6. Tiêu chí vào / ra
7. Bộ ca kiểm thử `TC-nnn`
8. Kiểm thử phi chức năng
9. Kiểm thử hồi quy và tự động hoá
10. Báo cáo lỗi và tiêu chí nghiệm thu
11. Phụ lục — ma trận truy vết `TC-nnn` ↔ yêu cầu

---

## 1. Giới thiệu

### 1.1. Mục đích

Tài liệu quy định cách thức kiểm thử **Hệ thống quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám** trước khi đưa vào vận hành chính thức, theo cấu trúc tài liệu kiểm thử của **ISO/IEC/IEEE 29119-3:2021**. Tài liệu gộp hai vai trò để tránh phân mảnh hồ sơ dự thầu: *(một)* **Kế hoạch kiểm thử** ở cấp tổ chức — chiến lược, mức độ, môi trường, tiêu chí vào/ra (tương ứng Test Plan của 29119-3, Điều khoản 8); *(hai)* **Bộ đặc tả ca kiểm thử rút gọn** cho các luồng nghiệp vụ then chốt (tương ứng Test Case Specification, Điều khoản 10), đủ chi tiết để kiểm thử viên thực hiện trực tiếp mà không cần tài liệu con.

### 1.2. Phạm vi tài liệu

Áp dụng cho toàn bộ Giai đoạn 1 của hệ thống (xem `00-ke-hoach-nang-cap.md` mục 1–3): kho dữ liệu số tập trung, hệ thống mã định danh 5 tầng, nhập liệu đơn/lô, siêu dữ liệu và mã khuyết giá trị, quy trình duyệt 9 trạng thái, kiểm kê định kỳ, sao lưu và bảo quản số, kết nối chia sẻ dữ liệu, phân hệ tuân thủ. Chức năng Giai đoạn 2 (cổng công chúng, bản đồ số 3D toàn khu, đa ngữ đầy đủ) **không** thuộc phạm vi kiểm thử của tài liệu này.

### 1.3. Đối tượng đọc

Tổ kiểm thử của nhà thầu, cán bộ nghiệp vụ Trung tâm tham gia kiểm thử chấp nhận (UAT), Ban Giám đốc Trung tâm (phê duyệt tiêu chí nghiệm thu), đơn vị thẩm định an toàn thông tin khi kiểm thử xâm nhập trước nghiệm thu (xem `01-thuyet-minh-ky-thuat.md` mục 9.8).

### 1.4. Nguồn tham chiếu bám sát mã nguồn

Ca kiểm thử ở mục 7 được đối chiếu trực tiếp với các tệp mã nguồn sau, không viết theo suy đoán lý thuyết:

| Vùng nghiệp vụ | Tệp mã nguồn tham chiếu |
|---|---|
| Mã khuyết giá trị (0quinquies) | `app/src/data/missingValues.ts` |
| % độ đầy đủ hồ sơ, tổng hợp số liệu | `app/src/data/selectors.ts` |
| Quy trình 9 trạng thái, nhánh "Cần số hóa lại"/"Đã gỡ/thu hồi" | `app/src/data/pipeline.ts` |
| Nguyên tắc bốn mắt | `app/src/data/pipeline.ts` (`isApprovalStep`), `app/src/pages/AssetDetailPage.tsx` |
| Tìm kiếm bỏ dấu hai chiều | `app/src/utils/search.ts`, `app/src/services/mock/assetService.ts` |
| Kiểm kê định kỳ, hoàn tác hai tầng | `app/src/pages/InventoryPage.tsx` |
| Đợt số hóa, đối tượng chưa số hóa | `app/src/data/digitization.ts`, `app/src/data/objects/*.ts` |
| Kiểm chứng can chi (đã tự động hoá) | `app/tests/canChi.test.ts`, `app/src/utils/canChi.ts` |

---

## 2. Chiến lược kiểm thử tổng thể

### 2.1. Các mức kiểm thử

| Mức | Mục tiêu | Ai thực hiện | Kỹ thuật chính |
|---|---|---|---|
| **Đơn vị (unit)** | Kiểm chứng hàm thuần túy có quy tắc nghiệp vụ dễ sai: quy đổi can chi, tính % đầy đủ hồ sơ, chuẩn hoá chuỗi tìm kiếm, chuyển trạng thái pipeline | Lập trình viên, chạy trong quá trình phát triển | Kiểm thử hộp trắng, bảng giá trị đã đối chiếu nguồn sử liệu (`KNOWN_YEARS` trong `canChi.test.ts` là ví dụ mẫu) |
| **Tích hợp** | Kiểm chứng luồng dữ liệu giữa các dịch vụ mock (asset ↔ pipeline ↔ audit log ↔ compliance) và, khi có API thật, giữa dịch vụ ứng dụng với PostgreSQL/kho đối tượng/chỉ mục tìm kiếm | Tổ kiểm thử nhà thầu | Kiểm thử hộp xám theo kịch bản nghiệp vụ nối tiếp nhiều bước |
| **Hệ thống** | Kiểm chứng toàn bộ luồng đầu-cuối qua giao diện, gồm cả yêu cầu phi chức năng (hiệu năng, trợ năng, tương thích trình duyệt) | Tổ kiểm thử nhà thầu | Kiểm thử hộp đen theo kịch bản người dùng, kiểm thử thăm dò có ghi biên bản |
| **Chấp nhận (UAT)** | Xác nhận hệ thống đáp ứng đúng nghiệp vụ thật của Trung tâm, đặc biệt các quy tắc đặc thù di sản (mã khuyết giá trị, song thẩm Hán Nôm, bốn mắt) | Cán bộ nghiệp vụ Trung tâm, có nhà thầu hỗ trợ | Kịch bản UAT theo vai trò, ký biên bản nghiệm thu từng nhóm chức năng |

### 2.2. Nguyên tắc thiết kế ca kiểm thử

1. **Ưu tiên rủi ro nghiệp vụ di sản**, không chỉ rủi ro kỹ thuật thông thường — sai niên đại, sai vị trí hiện vật hay lộ dữ liệu cá nhân trong gia phả có hậu quả uy tín và pháp lý cao hơn một lỗi giao diện thông thường (xem mục 3).
2. **Mỗi mã khuyết giá trị là một nhánh kiểm thử độc lập** — `KHONG_AP_DUNG`, `CHUA_XAC_DINH`, `KHONG_RO`, `CHUA_NHAP`, `HAN_CHE` kéo theo hành vi hệ thống khác nhau (xem `00-ke-hoach-nang-cap.md` mục 0quinquies), nên không được gộp thành một ca kiểm thử chung "trường trống".
3. **Kiểm thử cả hai tầng của một quy tắc hai tầng** — ví dụ hoàn tác kiểm kê (0septies): phải kiểm thử cả trạng thái "chưa chốt" (hoàn tác được) và "đã chốt" (không hoàn tác trực tiếp, chỉ điều chỉnh có lý do).
4. **Ca kiểm thử phủ định (negative test) là bắt buộc**, không chỉ kiểm thử đường thành công — đặc biệt với các chặn nghiệp vụ (bốn mắt, lý do bắt buộc khi trả lại/gỡ xuất bản, không cho lưu trường bắt buộc bỏ trống).

---

## 3. Ma trận rủi ro → mức độ kiểm thử

Theo cách tiếp cận kiểm thử dựa trên rủi ro của ISO/IEC/IEEE 29119: mức độ nghiêm trọng × khả năng xảy ra quyết định độ sâu kiểm thử (số ca, số mức tham gia, có bắt buộc UAT hay không).

| # | Rủi ro | Mức nghiêm trọng | Khả năng | Mức kiểm thử áp dụng | Ghi chú |
|---|---|---|---|---|---|
| R1 | Xuất bản sai niên đại/vị trí/danh tính hiện vật ra công khai | Rất cao — tổn hại uy tín chuyên môn với di sản UNESCO | Trung bình (dữ liệu nhập tay) | Đơn vị + Hệ thống + **UAT bắt buộc** | Ca TC nhóm "nhập liệu + mã khuyết giá trị", "trả lại bổ sung/gỡ xuất bản" |
| R2 | Người phụ trách tự duyệt bản ghi của chính mình | Cao — phá nguyên tắc bốn mắt, mất giá trị kiểm soát nội bộ | Cao nếu không chặn ở tầng dịch vụ | Đơn vị + Hệ thống, kiểm thử cả chặn ở API lẫn ở giao diện | Ca TC nhóm "bốn mắt" |
| R3 | Biên bản kiểm kê đã chốt bị sửa/xoá ngầm | Rất cao — phá giá trị chứng cứ pháp lý của biên bản | Thấp nếu có chặn đúng thiết kế | Hệ thống + UAT | Ca TC nhóm "hoàn tác kiểm kê hai tầng" |
| R4 | Mất dữ liệu số hoặc không khôi phục được trong RTO cam kết | Rất cao — không thể phục hồi tư liệu di sản gốc | Thấp (có kiến trúc 3-2-1) nhưng hậu quả cực lớn | Tích hợp + Hệ thống + diễn tập thực tế | Ca TC nhóm "sao lưu & khôi phục", đối chiếu `02-quy-trinh-bao-quan-sao-luu.md` |
| R5 | Lộ dữ liệu cá nhân trong tư liệu Hán Nôm (gia phả, ảnh chân dung) qua API công khai | Cao — vi phạm Luật BVDLCN 91/2025/QH15 | Trung bình | Hệ thống + UAT với DPO | Ca TC nhóm "sổ tuân thủ", trường `HAN_CHE` |
| R6 | Chia sẻ dữ liệu ra ngoài không đúng thẩm quyền hoặc không lưu vết | Cao — vi phạm Nghị định 278/2025/NĐ-CP Điều 13 | Trung bình | Hệ thống + UAT | Ca TC nhóm "chia sẻ dữ liệu" |
| R7 | Tìm kiếm bỏ sót kết quả do không xử lý dấu tiếng Việt | Trung bình — giảm giá trị sử dụng, không gây sai lệch dữ liệu | Cao nếu không kiểm thử kỹ | Đơn vị + Hệ thống | Ca TC nhóm "tìm kiếm bỏ dấu"; đã có `normalizeForSearch` |
| R8 | % độ đầy đủ hồ sơ hoặc số liệu Tổng quan hiển thị sai (kể cả cho tập rỗng) | Trung bình — báo cáo sai gây quyết định quản lý sai | Trung bình, dễ sai ở điều kiện biên (tập rỗng) | Đơn vị + Hệ thống | Ca TC nhóm "đối tượng chưa số hóa"; xem `averageCompletenessPctOrNull` |
| R9 | Nhật ký bị sửa/xoá hoặc không đủ trường bắt buộc | Cao — mất giá trị chứng cứ, vi phạm Điều 13 NĐ 278/2025 | Thấp nếu chặn đúng ở tầng ứng dụng | Hệ thống + kiểm thử an toàn | Kiểm thử an toàn (mục 8.4) |
| R10 | Tệp Excel nhập lô chứa công thức động gây thực thi ngoài ý muốn | Trung bình — rủi ro an toàn đầu vào | Thấp | Đơn vị + Hệ thống | Ca TC nhóm "nhập liệu lô" |

**Quy tắc áp dụng:** rủi ro **Rất cao** hoặc **Cao** bắt buộc có ca kiểm thử ở cả mức Hệ thống và tham gia của cán bộ nghiệp vụ Trung tâm ở UAT; không cho phép chỉ dừng ở kiểm thử đơn vị dù đã có kiểm thử tự động.

---

## 4. Phạm vi trong / ngoài phạm vi

### 4.1. Trong phạm vi kiểm thử

- Toàn bộ 15 nhóm yêu cầu chức năng YC-CN-01 đến YC-CN-15 thuộc Giai đoạn 1 (`01-thuyet-minh-ky-thuat.md` Chương 4).
- Yêu cầu phi chức năng YC-PCN-01 đến YC-PCN-15 (Chương 5): hiệu năng, khả năng mở rộng, sẵn sàng, tương thích/trợ năng, không phụ thuộc dịch vụ ngoài lãnh thổ, khả năng bảo trì.
- An toàn thông tin và bảo vệ dữ liệu cá nhân (Chương 9): xác thực, phân quyền, mã hoá, nhật ký, DPIA, quy trình 72 giờ — ở mức kiểm thử chức năng và cấu hình; kiểm thử xâm nhập chuyên sâu do đơn vị chuyên trách thực hiện riêng (mục 8.4).
- Quy trình sao lưu, kiểm tra toàn vẹn, khôi phục theo `02-quy-trinh-bao-quan-sao-luu.md`.
- Đối chiếu số liệu hiển thị với dữ liệu nguồn (nguyên tắc "một nguồn số liệu duy nhất", Chương 8 mục 8.1).

### 4.2. Ngoài phạm vi kiểm thử của tài liệu này

| Ngoài phạm vi | Lý do |
|---|---|
| Cổng thông tin phục vụ công chúng, bản đồ số 3D toàn khu, đa ngữ đầy đủ | Thuộc Giai đoạn 2, chưa xây dựng |
| Kết nối thật tới CSDL quốc gia về di sản văn hoá, LGSP thành phố | Bộ VHTTDL/Sở KH&CN chưa công bố đặc tả kết nối chính thức tại thời điểm lập tài liệu; kiểm thử tích hợp thật thực hiện khi có môi trường đối tác |
| Kiểm thử xâm nhập (penetration test) chi tiết | Thực hiện bởi đơn vị chuyên trách an toàn thông tin độc lập trước nghiệm thu, có báo cáo riêng (Chương 9 mục 9.8, Chương 16 chi phí) |
| Nội dung khoa học của dữ liệu di sản (niên đại, danh tính, quan hệ hiện vật) | Thuộc thẩm quyền chuyên môn của Trung tâm; kiểm thử chỉ xác nhận **hệ thống buộc** mọi bản ghi qua bước xác nhận chuyên môn, không tự thẩm định đúng/sai nội dung |
| Hiệu năng ở quy mô vượt 50.000 bản ghi / 200 người dùng đồng thời | Vượt mục tiêu thiết kế 5 năm đầu (Chương 5 mục 5.2); kiểm thử tải chỉ tới ngưỡng cam kết |

---

## 5. Môi trường kiểm thử

### 5.1. Nguyên tắc tách môi trường

Theo `01-thuyet-minh-ky-thuat.md` mục 9.3: môi trường phát triển, kiểm thử và vận hành **tách biệt về hạ tầng, dữ liệu và thông tin xác thực**; **không dùng dữ liệu thật cho môi trường kiểm thử**; môi trường không phải vận hành hiển thị dải cảnh báo trên giao diện.

| Môi trường | Mục đích | Dữ liệu | Ghi chú |
|---|---|---|---|
| **Phát triển** | Lập trình viên tự kiểm thử đơn vị | Dữ liệu mẫu tối thiểu | Chạy `npm test` tại mỗi lần commit thay đổi vùng logic nghiệp vụ (mục 9) |
| **Kiểm thử (staging)** | Kiểm thử tích hợp, hệ thống, phi chức năng, an toàn thông tin | **Bộ dữ liệu trình diễn ~150 bản ghi** hiện có trong `app/src/data` (mock service layer), mở rộng thêm dữ liệu biên khi cần (trường trống hợp lệ, tệp vượt hạn mức, tài khoản hết hạn) | Không dùng dữ liệu cá nhân thật của cán bộ; tên/vai trò dùng bộ 7 người dùng mẫu tại `app/src/data/users.ts` |
| **UAT** | Cán bộ nghiệp vụ Trung tâm thao tác trực tiếp | Sao chép từ môi trường kiểm thử, có thể bổ sung một số bản ghi thật đã được Trung tâm đồng ý dùng làm mẫu | Cần tài khoản demo đủ 6 vai trò (Quản trị, Kỹ thuật số hóa, Biên tập, Phê duyệt, Chỉ xem, Cán bộ bảo quản số) |
| **Vận hành** | Không kiểm thử trực tiếp trên môi trường này, trừ kiểm thử khói (smoke test) sau triển khai | Dữ liệu thật | Kiểm thử khói giới hạn ở luồng đăng nhập và tra cứu, không thao tác ghi |

### 5.2. Thiết bị và trình duyệt kiểm thử tương thích

Theo PCN của mục 5.4 (Chương 5 tài liệu 01): kiểm thử trên **hai phiên bản mới nhất** của Chrome, Edge, Firefox, Safari; độ phân giải màn hình **1024 px** (máy chiếu hội trường) và **1280 px**; ít nhất một máy trạm cấu hình tối thiểu theo Chương 10 mục 10.1 để kiểm thử hiển thị 3D/gaussian splat thực tế, không chỉ mô phỏng.

### 5.3. Công cụ kiểm thử

| Loại | Công cụ dự kiến | Ghi chú |
|---|---|---|
| Kiểm thử đơn vị | `node --experimental-strip-types --test` (Node.js test runner có sẵn, không cần cài thêm dependency) | Đã dùng cho `app/tests/canChi.test.ts`; script `npm test` trong `app/package.json` |
| Kiểm thử tải/hiệu năng | Công cụ mã nguồn mở (ví dụ k6, Locust hoặc tương đương) | Lựa chọn cụ thể chốt ở giai đoạn triển khai, ưu tiên mã nguồn mở theo YC-PCN-11 |
| Kiểm thử trợ năng | Công cụ quét tự động (axe-core hoặc tương đương) kết hợp kiểm thử thủ công bằng bàn phím và trình đọc màn hình | Quét tự động không thay thế được kiểm thử thủ công cho bẫy tiêu điểm, thứ tự Tab |
| Kiểm thử xâm nhập | Đơn vị chuyên trách an toàn thông tin độc lập | Ngoài phạm vi thực hiện của tổ kiểm thử chức năng (mục 4.2, mục 8.4) |
| Quản lý ca kiểm thử và lỗi | Công cụ theo dõi lỗi nội bộ của nhà thầu (bàn giao danh mục lỗi cho Trung tâm ở định dạng mở — YC-PCN-12) | |

---

## 6. Tiêu chí vào / ra

### 6.1. Tiêu chí vào (entry criteria) theo mức

| Mức | Điều kiện để bắt đầu |
|---|---|
| Đơn vị | Mã nguồn đã build không lỗi; hàm cần kiểm thử đã có chữ ký ổn định |
| Tích hợp | Toàn bộ ca kiểm thử đơn vị liên quan đã đạt; môi trường kiểm thử đã có dữ liệu mẫu |
| Hệ thống | Bản dựng (build) triển khai được lên môi trường kiểm thử; danh sách CN-xx dự kiến kiểm thử trong đợt đã hoàn thiện chức năng, không còn placeholder |
| UAT | Kiểm thử hệ thống đạt tỷ lệ ≥ 95% ca **Phải đạt** (mục 6.3); danh sách lỗi mở không còn lỗi mức Nghiêm trọng/Cao (mục 10.1) |

### 6.2. Tiêu chí ra (exit criteria) theo mức

| Mức | Điều kiện để kết thúc |
|---|---|
| Đơn vị | 100% ca kiểm thử đơn vị đã viết đều đạt; không hạ tỷ lệ đạt của lần chạy trước (không có hồi quy) |
| Tích hợp | 100% luồng tích hợp trong phạm vi đợt kiểm thử đạt; không còn lỗi chặn (blocker) |
| Hệ thống | 100% ca **Phải đạt** đạt; ≥ 90% ca còn lại đạt; toàn bộ lỗi mức Nghiêm trọng đã khắc phục và kiểm thử lại |
| UAT | Cán bộ nghiệp vụ từng vai trò ký biên bản chấp nhận theo nhóm chức năng đã kiểm thử; không còn lỗi ảnh hưởng nghiệp vụ cốt lõi (mục 10.2 định nghĩa "nghiệp vụ cốt lõi") |

### 6.3. Phân loại mức độ bắt buộc của ca kiểm thử

| Mức | Định nghĩa | Ví dụ |
|---|---|---|
| **Phải đạt** | Ảnh hưởng trực tiếp tới toàn vẹn dữ liệu di sản, nguyên tắc bốn mắt, bảo vệ dữ liệu cá nhân, hoặc an toàn thông tin | TC nhóm bốn mắt, mã khuyết giá trị, hoàn tác kiểm kê, sao lưu/khôi phục |
| **Nên đạt** | Ảnh hưởng trải nghiệm hoặc hiệu năng nhưng không gây sai lệch dữ liệu | TC hiệu năng tra cứu, TC xuất Excel/PDF đúng định dạng |
| **Tham khảo** | Kiểm thử thăm dò, chưa có tiêu chí đạt/không đạt cứng | Kiểm thử thăm dò giao diện khi có thay đổi thiết kế nhỏ |

---

## 7. Bộ ca kiểm thử `TC-nnn`

Mã ca kiểm thử có tiền tố `TC-` theo số thứ tự ba chữ số, nhóm theo 11 luồng nghiệp vụ then chốt. Cột **Truy vết** dùng đúng hai quy ước mã đã chốt ở nơi khác trong bộ hồ sơ, không tự đặt quy ước mới: **`YC-CN-xx.y`/`YC-PCN-xx`** là mã yêu cầu đã chuẩn hoá theo `09-dac-ta-yeu-cau-srs.md` (nâng cấp trực tiếp từ `CN-xx.y`/`PCN-xx` gốc ở `01-thuyet-minh-ky-thuat.md` Chương 4–5, giữ nguyên số để truy vết 1–1); **`ADR-00NN`** trỏ tới quyết định kiến trúc/thiết kế tương ứng trong `docs/adr/00NN-*.md` khi ca kiểm thử xác nhận đúng nội dung một ADR cụ thể. Mục tiêu `MT-xx` (Chương 3 tài liệu 01) và tham chiếu trực tiếp tới `00-ke-hoach-nang-cap.md`/`07-mo-hinh-du-lieu.md` được giữ thêm ở những ca chưa có mã `YC-`/`ADR-` tương ứng.

### 7.1. Đăng nhập và phân quyền theo vai

**TC-001 — Đăng nhập vai trò Quản trị bắt buộc xác thực hai yếu tố**
- Tiền điều kiện: tài khoản Quản trị hợp lệ, chưa đăng nhập.
- Các bước: 1) Vào màn Đăng nhập; 2) Nhập đúng tài khoản/mật khẩu Quản trị; 3) Quan sát bước tiếp theo.
- Kết quả mong đợi: hệ thống bắt buộc bước mã xác thực một lần (OTP) trước khi cấp phiên; không có cách bỏ qua bước này với vai trò Quản trị.
- Mức: Phải đạt.
- Truy vết: YC-CN-12.1; `01-thuyet-minh-ky-thuat.md` mục 9.2.

**TC-002 — Vai trò Chỉ xem không thấy nút thao tác ghi**
- Tiền điều kiện: đăng nhập bằng tài khoản vai trò Chỉ xem (Vũ Minh Châu, xem `app/src/data/users.ts`).
- Các bước: 1) Mở màn Dữ liệu số hóa; 2) Mở một bản ghi bất kỳ; 3) Quan sát các nút Duyệt/Sửa/Xoá/Trả lại bổ sung/Gỡ xuất bản.
- Kết quả mong đợi: không nút thao tác ghi nào hiển thị; mục điều hướng ngoài quyền **bị ẩn hẳn**, không chỉ vô hiệu hoá (đối chiếu Chương 8 mục 8.3).
- Mức: Phải đạt.
- Truy vết: YC-CN-12.3.

**TC-003 — Đăng ký tài khoản mới chuyển trạng thái chờ phê duyệt**
- Tiền điều kiện: chưa có tài khoản trong hệ thống.
- Các bước: 1) Vào màn Đăng ký; 2) Điền đủ thông tin hợp lệ; 3) Gửi đăng ký.
- Kết quả mong đợi: tài khoản chuyển trạng thái "Chờ phê duyệt", không đăng nhập được cho tới khi Quản trị kích hoạt.
- Mức: Phải đạt.
- Truy vết: YC-CN-12.2; màn M-09.

**TC-004 — Chọn vai trò demo đổi đúng bộ quyền hiển thị**
- Tiền điều kiện: màn Đăng nhập có lựa chọn vai trò demo.
- Các bước: 1) Đăng nhập lần lượt với 6 vai trò demo; 2) Với mỗi vai trò, ghi nhận danh sách mục điều hướng hiển thị.
- Kết quả mong đợi: danh sách mục điều hướng khớp đúng ma trận vai trò × phân hệ × quyền đã cấu hình cho từng vai trò; không có mục thừa hoặc thiếu so với thiết kế.
- Mức: Phải đạt.
- Truy vết: YC-CN-12.3; Chương 8 mục 8.3.

### 7.2. Nhập liệu đơn / lô và mã khuyết giá trị

**TC-005 — Chặn lưu khi trường bắt buộc bỏ trống không kèm mã khuyết**
- Tiền điều kiện: đăng nhập vai trò Biên tập; đang tạo bản ghi mới.
- Các bước: 1) Điền các trường khác đầy đủ, để trống trường bắt buộc (ví dụ niên đại); 2) Bấm Lưu.
- Kết quả mong đợi: hệ thống từ chối lưu, yêu cầu chọn giá trị thật hoặc một trong năm mã khuyết giá trị; không cho lưu ô trắng trần.
- Mức: Phải đạt.
- Truy vết: YC-CN-02.6; `00-ke-hoach-nang-cap.md` mục 0quinquies quy tắc 1; `app/src/data/missingValues.ts`.

**TC-006 — `CHUA_XAC_DINH`/`KHONG_RO` bắt buộc kèm ghi chú khuyết**
- Tiền điều kiện: đang nhập một trường có thể mang mã khuyết giá trị.
- Các bước: 1) Chọn mã `CHUA_XAC_DINH`; 2) Để trống ô ghi chú khuyết (`ghiChuKhuyet`); 3) Bấm Lưu; 4) Lặp lại với `KHONG_RO`.
- Kết quả mong đợi: cả hai trường hợp đều bị chặn lưu cho tới khi nhập ghi chú đã tra cứu nguồn nào, kết luận ra sao.
- Mức: Phải đạt.
- Truy vết: [ADR-0005](adr/0005-bo-5-ma-khuyet-gia-tri.md) (`docs/adr/0005-bo-5-ma-khuyet-gia-tri.md`); `07-mo-hinh-du-lieu.md` mục 5.15 (`field_missing_status.ghi_chu_khuyet`).

**TC-007 — Hiển thị "— Chưa xác định" thay ô trắng**
- Tiền điều kiện: có bản ghi mang mã khuyết giá trị bất kỳ trong năm mã.
- Các bước: 1) Mở hồ sơ bản ghi ở chế độ xem; 2) Quan sát ô mang mã khuyết.
- Kết quả mong đợi: hiển thị nhãn in nghiêng, màu nhạt dạng `"— <Nhãn mã khuyết>"`, không phải ô trắng hay dấu gạch ngang trần.
- Mức: Nên đạt.
- Truy vết: YC-CN-02.6; Chương 8 mục 8.1; `formatMissing()` trong `app/src/data/missingValues.ts`.

**TC-008 — Nhập lô Excel: ô trống tự gán `CHUA_NHAP` và báo cáo số ô đã gán**
- Tiền điều kiện: có tệp Excel mẫu với một số ô dữ liệu để trống.
- Các bước: 1) Tải tệp lên màn Nhập dữ liệu; 2) Xem bảng xem trước.
- Kết quả mong đợi: các ô trống trong tệp được tự động gán `CHUA_NHAP` (không nhập thành chuỗi rỗng), đưa vào hàng đợi nhập liệu; bảng xem trước hiển thị rõ số ô đã tự gán.
- Mức: Phải đạt.
- Truy vết: YC-CN-03.2, YC-CN-02.6 (dòng `CHUA_NHAP` trong `00-ke-hoach-nang-cap.md` mục 0quinquies).

**TC-009 — Vô hiệu hoá công thức động trong tệp Excel nhập vào**
- Tiền điều kiện: tệp Excel mẫu chứa ô công thức tham chiếu ngoài (ví dụ `=HYPERLINK(...)` hoặc liên kết ngoài).
- Các bước: 1) Tải tệp lên; 2) Xem bảng xem trước và trạng thái quét.
- Kết quả mong đợi: công thức bị vô hiệu hoá, chỉ nhập giá trị tĩnh; bảng xem trước hiển thị dòng trạng thái "đã quét/đã vô hiệu hoá công thức động".
- Mức: Phải đạt.
- Truy vết: YC-CN-03.6.

### 7.3. Quy trình 11 trạng thái

Pipeline gồm 9 trạng thái tuần tự (`Chờ xử lý` → … → `Đã kiểm kê`) cộng 2 trạng thái ngoài chuỗi (`Cần số hóa lại`, `Đã gỡ/thu hồi`) — tổng 11 trạng thái, đúng `PIPELINE_SEQUENCE` và các hằng số liên quan trong `app/src/data/pipeline.ts`.

**TC-010 — Đi hết chuỗi 9 trạng thái tuần tự đúng thứ tự**
- Tiền điều kiện: bản ghi mới ở trạng thái `Chờ xử lý`; người dùng đủ quyền tác nghiệp từng bước.
- Các bước: bấm hành động tiến (mục 2.2 tài liệu này liệt kê nhãn từng bước) tuần tự 8 lần cho tới `Đã kiểm kê`.
- Kết quả mong đợi: trạng thái đổi đúng thứ tự `Chờ xử lý → Đang xử lý → Kiểm định chất lượng → Chờ duyệt → Thẩm định nội dung → Đã duyệt → Xuất bản → Đã lưu trữ — đang giám sát → Đã kiểm kê`; không thể nhảy cóc bỏ qua bước bằng thao tác giao diện thông thường.
- Mức: Phải đạt.
- Truy vết: YC-CN-05.1; `07-mo-hinh-du-lieu.md` mục 4.1 (`asset.status`).

**TC-011 — Nhánh QC thất bại chuyển "Cần số hóa lại" rồi quay lại "Đang xử lý"**
- Tiền điều kiện: bản ghi ở trạng thái `Kiểm định chất lượng`.
- Các bước: 1) Đánh dấu QC không đạt; 2) Quan sát trạng thái; 3) Đánh dấu "đã số hóa lại".
- Kết quả mong đợi: trạng thái chuyển `Cần số hóa lại`, xuất hiện trong hàng đợi việc cần làm; sau khi số hóa lại, trạng thái quay về `Đang xử lý`, không tự nhảy thẳng lên `Chờ duyệt`.
- Mức: Phải đạt.
- Truy vết: YC-CN-03.5.

**TC-012 — `Đã kiểm kê` chỉ dao động với `Đã lưu trữ — đang giám sát`**
- Tiền điều kiện: bản ghi ở trạng thái `Đã kiểm kê`.
- Các bước: bấm hành động "Đưa trở lại giám sát lưu trữ", sau đó "Ghi nhận đã kiểm kê" lại.
- Kết quả mong đợi: hai trạng thái này dao động qua lại đúng thiết kế (`⇄`), không rơi vào trạng thái khác ngoài dự kiến.
- Mức: Nên đạt.
- Truy vết: `07-mo-hinh-du-lieu.md` mục 4.1, dòng `status` bảng `asset`; `nextStatus()` trong `pipeline.ts`.

**TC-013 — `Đã gỡ/thu hồi` chỉ đạt được từ trạng thái đã xuất bản, giữ nguyên bản ghi**
- Tiền điều kiện: (a) bản ghi ở trạng thái `Chờ xử lý` (chưa xuất bản); (b) bản ghi ở trạng thái `Xuất bản`.
- Các bước: 1) Với bản ghi (a), tìm nút "Gỡ xuất bản" — xác nhận không có/không dùng được; 2) Với bản ghi (b), thực hiện gỡ xuất bản có lý do.
- Kết quả mong đợi: (a) không gỡ xuất bản được vì chưa từng xuất bản; (b) chuyển đúng `Đã gỡ/thu hồi`, mã định danh giữ nguyên, bản ghi không bị xoá, không còn hiển thị trên kênh công khai.
- Mức: Phải đạt.
- Truy vết: YC-CN-01.6; `PUBLISHED_STATUSES` trong `pipeline.ts`.

### 7.4. Nguyên tắc bốn mắt

**TC-014 — Chặn tự duyệt khi người duyệt trùng cán bộ phụ trách**
- Tiền điều kiện: đăng nhập bằng chính tài khoản đang là "Cán bộ phụ trách" của bản ghi ở trạng thái `Thẩm định nội dung`.
- Các bước: 1) Mở hồ sơ bản ghi; 2) Tìm nút Duyệt.
- Kết quả mong đợi: nút Duyệt bị vô hiệu hoá kèm giải thích "bạn là cán bộ phụ trách bản ghi này — không thể tự phê duyệt"; việc chặn thực hiện ở tầng dịch vụ, không chỉ ẩn nút giao diện (thử gọi thao tác duyệt trực tiếp vẫn bị từ chối).
- Mức: Phải đạt.
- Truy vết: YC-CN-05.2; [ADR-0011](adr/0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md) (`docs/adr/0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md`); `isApprovalStep()` trong `pipeline.ts`; `AssetDetailPage.tsx`.

**TC-015 — Người có vai trò Phê duyệt không phải người phụ trách duyệt được bình thường**
- Tiền điều kiện: đăng nhập bằng tài khoản vai trò Phê duyệt (Phạm Quốc Đạt), không phải cán bộ phụ trách bản ghi.
- Các bước: 1) Mở hồ sơ bản ghi ở trạng thái `Thẩm định nội dung`; 2) Bấm Duyệt.
- Kết quả mong đợi: duyệt thành công, trạng thái chuyển `Đã duyệt`; đối chiếu ghi chú trong `app/src/data/users.ts` — Phạm Quốc Đạt/Vũ Minh Châu không phải chủ sở hữu bất kỳ bản ghi nào, dùng đúng làm tài khoản kiểm thử "người duyệt hợp lệ".
- Mức: Phải đạt.
- Truy vết: YC-CN-05.2; [ADR-0011](adr/0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md).

### 7.5. Trả lại bổ sung và gỡ xuất bản

**TC-016 — Trả lại bổ sung bắt buộc lý do**
- Tiền điều kiện: bản ghi ở trạng thái nằm trong `REVIEWABLE_STATUSES` (`Kiểm định chất lượng`, `Chờ duyệt`, `Thẩm định nội dung`, `Đã duyệt`); người dùng vai trò Phê duyệt, không phải cán bộ phụ trách.
- Các bước: 1) Bấm "Trả lại bổ sung"; 2) Để trống ô lý do, bấm Xác nhận; 3) Nhập lý do, bấm Xác nhận lại.
- Kết quả mong đợi: bước 2 bị chặn, không lưu được; bước 3 thành công, trạng thái chuyển `Đang xử lý`, cán bộ phụ trách nhận thông báo kèm lý do.
- Mức: Phải đạt.
- Truy vết: YC-CN-05.3; `requestRevision()` trong `assetService.ts`.

**TC-017 — Gỡ xuất bản bắt buộc lý do, giữ lại bản ghi**
- Tiền điều kiện: bản ghi ở một trong `PUBLISHED_STATUSES`.
- Các bước: 1) Bấm "Gỡ xuất bản"; 2) Để trống lý do, xác nhận — quan sát; 3) Nhập lý do, xác nhận.
- Kết quả mong đợi: bước 2 bị chặn; bước 3 chuyển trạng thái `Đã gỡ/thu hồi`, ghi sự kiện nhật ký kèm lý do và người thực hiện, bản ghi vẫn truy cập được ở chế độ nội bộ.
- Mức: Phải đạt.
- Truy vết: YC-CN-01.6; `unpublish()` trong `assetService.ts`.

### 7.6. Hoàn tác kiểm kê hai tầng

**TC-018 — Tầng 1: hoàn tác nhanh trong đợt chưa chốt**
- Tiền điều kiện: đợt kiểm kê ở trạng thái chưa `locked`; đang đối chiếu một đối tượng.
- Các bước: 1) Đánh dấu đối chiếu "Khớp"/"Lệch" cho một đối tượng; 2) Quan sát thông báo xuất hiện; 3) Bấm nút "Hoàn tác" trong cửa sổ khoảng 10 giây.
- Kết quả mong đợi: thao tác hoàn tác thành công, đối tượng quay về trạng thái "Chưa đối chiếu" trước đó; ngoài cửa sổ 10 giây, dòng vẫn sửa lại được trực tiếp vì đợt chưa chốt (không bắt phải qua bước "điều chỉnh có lý do").
- Mức: Phải đạt.
- Truy vết: [ADR-0010](adr/0010-hoan-tac-hai-tang.md) (`docs/adr/0010-hoan-tac-hai-tang.md`); `InventoryPage.tsx`, `Toast.tsx`.

**TC-019 — Tầng 2: đợt đã chốt không cho hoàn tác trực tiếp**
- Tiền điều kiện: đợt kiểm kê đã chuyển `locked = true` (đã ký biên bản).
- Các bước: 1) Mở đợt đã chốt; 2) Thử sửa trực tiếp một dòng đối chiếu.
- Kết quả mong đợi: dòng hiển thị chỉ đọc, không sửa/xoá trực tiếp được; hệ thống chỉ cho tạo "bản điều chỉnh" mới kèm lý do, người thực hiện, thời điểm — bản ghi gốc trong biên bản **giữ nguyên**, cả hai cùng hiển thị trong lịch sử.
- Mức: Phải đạt.
- Truy vết: [ADR-0010](adr/0010-hoan-tac-hai-tang.md).

**TC-020 — Đối chiếu ba loại lệch khi kiểm kê**
- Tiền điều kiện: đợt kiểm kê có phạm vi là một bộ sưu tập trộn cả đối tượng có và chưa neo `so_kiem_ke`.
- Các bước: 1) Chạy đối chiếu số kiểm kê hiện vật gốc với bản ghi dữ liệu số cho toàn bộ phạm vi; 2) Xuất danh sách lệch.
- Kết quả mong đợi: danh sách phân biệt đúng ba loại lệch — hiện vật chưa có dữ liệu số, dữ liệu số chưa neo hiện vật (thiếu `so_kiem_ke`), sai lệch thông tin giữa hai nguồn.
- Mức: Phải đạt.
- Truy vết: YC-CN-09.2; Luật Di sản văn hóa 45/2024/QH15 Điều 23.

### 7.7. Sao lưu và khôi phục

**TC-021 — Sao lưu gia tăng hằng ngày tạo điểm khôi phục mới**
- Tiền điều kiện: cấu hình lịch sao lưu gia tăng 03:00 hằng ngày (môi trường kiểm thử có thể kích hoạt thủ công để không chờ qua đêm).
- Các bước: 1) Kích hoạt tác vụ sao lưu gia tăng; 2) Theo dõi tới khi hoàn tất; 3) Kiểm tra danh sách điểm khôi phục.
- Kết quả mong đợi: xuất hiện điểm khôi phục mới, "tuổi bản sao lưu gần nhất" cập nhật về gần 0; nếu tác vụ thất bại, cảnh báo tự động gửi tới Quản trị hệ thống.
- Mức: Phải đạt.
- Truy vết: YC-CN-14.1, YC-CN-14.2; `02-quy-trinh-bao-quan-sao-luu.md` mục 5.

**TC-022 — Khôi phục yêu cầu quy trình nhiều bước, không khôi phục bằng một thao tác**
- Tiền điều kiện: có ít nhất một điểm khôi phục đã xác minh fixity.
- Các bước: 1) Bấm "Khôi phục" trên một điểm khôi phục; 2) Quan sát các bước xác nhận.
- Kết quả mong đợi: hệ thống yêu cầu cảnh báo rõ dữ liệu sẽ mất sau mốc thời gian khôi phục và bắt nhập chuỗi xác nhận trước khi thực thi; không có đường tắt khôi phục chỉ bằng một cú bấm.
- Mức: Phải đạt.
- Truy vết: YC-CN-14.3.

**TC-023 — Kiểm tra toàn vẹn phát hiện lệch checksum và tự phục hồi**
- Tiền điều kiện: môi trường kiểm thử có khả năng mô phỏng một tệp bị lệch checksum so với manifest gốc.
- Các bước: 1) Mô phỏng lệch checksum trên một bản sao (tầng nóng hoặc AIP); 2) Chạy kiểm tra toàn vẹn định kỳ (thủ công, không chờ lịch).
- Kết quả mong đợi: hệ thống phát hiện lệch, xác định bản còn nguyên vẹn trong ba bản, tự phục hồi bản hỏng, ghi sự kiện PREMIS "fixity check — lỗi và đã khắc phục", cảnh báo Cán bộ bảo quản số.
- Mức: Phải đạt.
- Truy vết: YC-CN-06.3; `02-quy-trinh-bao-quan-sao-luu.md` mục 4.

**TC-024 — Diễn tập khôi phục đạt RTO cam kết**
- Tiền điều kiện: lịch diễn tập khôi phục hàng quý tới hạn (mô phỏng trong môi trường kiểm thử).
- Các bước: 1) Thực hiện diễn tập khôi phục trên môi trường thử nghiệm; 2) Đo thời gian từ lúc bắt đầu tới lúc dịch vụ khôi phục xong.
- Kết quả mong đợi: thời gian đo được ≤ 4 giờ (RTO); lập được biên bản diễn tập với kết luận Đạt/Chưa đạt theo đúng mẫu.
- Mức: Nên đạt (bắt buộc trước nghiệm thu theo Chương 11 tài liệu 01, nhưng không chặn từng đợt kiểm thử chức năng).
- Truy vết: `01-thuyet-minh-ky-thuat.md` mục 5.3, 11.1; `02-quy-trinh-bao-quan-sao-luu.md` mục 5.

### 7.8. Chia sẻ dữ liệu

**TC-025 — Yêu cầu chia sẻ mới có hạn xử lý và bốn hành động**
- Tiền điều kiện: đăng nhập vai trò Đầu mối chia sẻ/Phê duyệt; có yêu cầu chia sẻ mới từ một tổ chức ngoài.
- Các bước: 1) Mở yêu cầu; 2) Quan sát hạn xử lý; 3) Thử lần lượt Duyệt, Từ chối, Yêu cầu bổ sung, Thu hồi (trên các yêu cầu khác nhau ở trạng thái phù hợp).
- Kết quả mong đợi: mỗi yêu cầu hiển thị hạn xử lý theo số văn bản đề nghị; cả bốn hành động thực hiện được đúng điều kiện trạng thái và đều ghi nhật ký kèm lý do (với Từ chối/Thu hồi).
- Mức: Phải đạt.
- Truy vết: YC-CN-11.4; `app/src/data/requests.ts` (`ShareRequestUI`).

**TC-026 — Tách quan hệ cơ quan chủ quản khỏi yêu cầu bên ngoài**
- Tiền điều kiện: có ít nhất một mục "chỉ đạo/báo cáo cơ quan chủ quản" (Sở Văn hóa & Thể thao Hà Nội) và một yêu cầu từ tổ chức ngoài.
- Các bước: mở màn Kết nối và chia sẻ, quan sát cách phân nhóm hai loại mục.
- Kết quả mong đợi: Sở Văn hóa & Thể thao Hà Nội xuất hiện ở nhóm riêng "chỉ đạo/báo cáo cơ quan chủ quản", **không** nằm trong bảng "yêu cầu chia sẻ từ cơ quan khác".
- Mức: Phải đạt.
- Truy vết: YC-CN-11.5; `00-ke-hoach-nang-cap.md` mục A5; `app/src/data/requests.ts` (`SUPERVISORY_REQUESTS`).

**TC-027 — Tắt kênh kết nối bắt buộc nhập lý do**
- Tiền điều kiện: đăng nhập vai trò Quản trị; có kênh kết nối đang "Đang hoạt động" (ví dụ LGSP Thành phố Hà Nội).
- Các bước: 1) Bấm tắt kênh; 2) Để trống lý do, xác nhận; 3) Nhập lý do, xác nhận.
- Kết quả mong đợi: bước 2 bị chặn; bước 3 thành công và ghi nhật ký riêng cho việc tắt kênh, kèm lý do và người thực hiện.
- Mức: Phải đạt.
- Truy vết: YC-CN-11.10; `app/src/data/connections.ts`.

### 7.9. Sổ tuân thủ

**TC-028 — Không lưu được trạng thái "Đạt" khi chứng cứ trống**
- Tiền điều kiện: đăng nhập vai trò DPO/Quản trị; đang sửa một mục sổ đăng ký tuân thủ.
- Các bước: 1) Chọn trạng thái "Đạt"; 2) Để trống ô chứng cứ; 3) Lưu.
- Kết quả mong đợi: hệ thống từ chối lưu ở trạng thái "Đạt" khi chứng cứ trống, tự hạ về "Chưa đối chiếu" hoặc yêu cầu bổ sung chứng cứ trước khi lưu.
- Mức: Phải đạt.
- Truy vết: YC-CN-15.1; `app/src/data/complianceEvidence.ts`.

**TC-029 — Đồng hồ DPIA đếm ngược mốc 60 ngày, cảnh báo dưới 15 ngày**
- Tiền điều kiện: có hồ sơ DPIA với ngày bắt đầu xử lý dữ liệu cá nhân đã thiết lập.
- Các bước: 1) Mở tab DPIA; 2) Với một hồ sơ còn dưới 15 ngày tới hạn 60 ngày, quan sát mức cảnh báo.
- Kết quả mong đợi: đồng hồ đếm đúng số ngày còn lại tính từ ngày đầu xử lý; hồ sơ dưới 15 ngày hiển thị cảnh báo nổi bật (khác màu/nhãn) so với hồ sơ còn nhiều thời gian.
- Mức: Phải đạt.
- Truy vết: YC-CN-15.3; Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 Điều 21; Mẫu số 10 Nghị định 356/2025/NĐ-CP.

**TC-030 — Đồng hồ sự cố 72 giờ tính từ thời điểm phát hiện**
- Tiền điều kiện: tạo một bản ghi sự cố dữ liệu cá nhân mới trong tab Sự cố.
- Các bước: 1) Ghi nhận thời điểm phát hiện; 2) Quan sát đồng hồ đếm ngược 72 giờ; 3) Xác nhận đã thông báo cơ quan chuyên trách trước hoặc sau mốc.
- Kết quả mong đợi: đồng hồ tính đúng từ thời điểm **phát hiện**, không phải thời điểm xảy ra sự cố; hồ sơ sự cố không xoá được trước hạn lưu tối thiểu 5 năm kể từ khi khắc phục.
- Mức: Phải đạt.
- Truy vết: YC-CN-15.5; Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 Điều 23; Nghị định 356/2025/NĐ-CP.

### 7.10. Tìm kiếm bỏ dấu

**TC-031 — Không dấu và có dấu trả cùng tập kết quả**
- Tiền điều kiện: kho có bản ghi tên "Khuê Văn Các".
- Các bước: 1) Gõ `khue van cac` vào ô tìm kiếm; 2) Ghi nhận kết quả; 3) Gõ lại `Khuê Văn Các` có dấu, hoa/thường hỗn hợp; 4) So sánh hai tập kết quả.
- Kết quả mong đợi: hai lần tìm trả về cùng một tập kết quả, kể cả khi dữ liệu nguồn có dấu và truy vấn không dấu (bỏ dấu hai chiều).
- Mức: Phải đạt.
- Truy vết: YC-CN-04.1; `normalizeForSearch()` trong `app/src/utils/search.ts`.

**TC-032 — Chấp nhận mã đầy đủ lẫn mã rút gọn, bỏ qua `-`/`.`**
- Tiền điều kiện: có bản ghi mã `VM-CT-00007.SPL01`.
- Các bước: gõ lần lượt `vmct00007`, `VM-CT-00007`, `vm.ct.00007spl01`.
- Kết quả mong đợi: cả ba truy vấn đều tìm ra đúng bản ghi/đối tượng liên quan, không phân biệt hoa thường, không phân biệt có/không có `-` và `.`.
- Mức: Phải đạt.
- Truy vết: YC-CN-04.3; `normalizeCode()` (`assetCode.ts`) dùng trong `matchesAssetQuery()`.

**TC-033 — Tìm theo tối thiểu tám trường nội dung**
- Tiền điều kiện: kho có bản ghi với dữ liệu phân biệt ở các trường tên, mô tả, bộ sưu tập, vị trí, người phụ trách, niên đại, định dạng.
- Các bước: lần lượt gõ một từ khoá đặc trưng của mỗi trường, quan sát kết quả.
- Kết quả mong đợi: mỗi truy vấn trả về đúng bản ghi tương ứng, xác nhận tìm kiếm quét đủ các trường `name/desc/coll/loc/owner/era/fmt` cộng mã.
- Mức: Nên đạt.
- Truy vết: YC-CN-04.2; `matchesAssetQuery()`.

### 7.11. Đối tượng chưa số hóa

**TC-034 — % độ đầy đủ hồ sơ của tập rỗng trả `null`, không hiển thị 100%**
- Tiền điều kiện: chọn một bộ sưu tập/phân khu chưa có bản ghi dữ liệu số nào.
- Các bước: 1) Mở màn Báo cáo hoặc Kiểm kê, lọc theo phạm vi rỗng đó; 2) Quan sát chỉ số % độ đầy đủ hồ sơ hiển thị.
- Kết quả mong đợi: giao diện hiển thị trạng thái "chưa số hóa"/"chưa có dữ liệu" tường minh, **không** hiển thị "100% đầy đủ" — đây là lỗi nghiệp vụ nghiêm trọng vì đọc ngược tiến độ số hóa.
- Mức: Phải đạt.
- Truy vết: [ADR-0016](adr/0016-averagecompletenesspct-tra-null-cho-tap-rong.md) (`docs/adr/0016-averagecompletenesspct-tra-null-cho-tap-rong.md`); `averageCompletenessPctOrNull()` trong `app/src/data/selectors.ts` (trả `null` cho mảng rỗng, buộc nơi gọi tự quyết cách hiển thị).

**TC-035 — Hồ sơ đối tượng di sản hiển thị đúng khi đối tượng chưa có bản đại diện số**
- Tiền điều kiện: có một `physical_artifact` đã đăng ký (có mã `VM-<OC>-<NNNNN>`) nhưng chưa có bất kỳ bản ghi `asset` nào liên kết.
- Các bước: mở màn Hồ sơ đối tượng di sản (M-17) của đối tượng đó.
- Kết quả mong đợi: trang mở được, không lỗi; khối "Bản đại diện số" hiển thị trạng thái rỗng tường minh (ví dụ "Chưa có bản đại diện số"), không phải màn trắng hay lỗi runtime.
- Mức: Phải đạt.
- Truy vết: YC-CN-01.4; `07-mo-hinh-du-lieu.md` mục 3 (`PHYSICAL_ARTIFACT ||--o{ ASSET`, quan hệ tùy chọn).

**TC-036 — Đối tượng thiếu `so_kiem_ke` xuất hiện đúng trong hàng đợi kiểm kê**
- Tiền điều kiện: đối tượng loại `artifact`/`document` chưa có giá trị `so_kiem_ke` (mang mã khuyết `CHUA_NHAP`, đúng thực trạng dữ liệu mẫu hiện tại — xem ghi chú trong `InventoryPage.tsx`).
- Các bước: mở đợt kiểm kê có phạm vi chứa đối tượng này, quan sát trạng thái đối chiếu.
- Kết quả mong đợi: hiển thị đúng trạng thái "Thiếu số kiểm kê", không nhầm với "Khớp" hay để trống; đối tượng được đưa vào phạm vi cần xử lý của đợt.
- Mức: Phải đạt.
- Truy vết: YC-CN-01.3, YC-CN-09.2; [ADR-0005](adr/0005-bo-5-ma-khuyet-gia-tri.md).

### 7.12. Tổng hợp số lượng ca kiểm thử theo nhóm

| Nhóm luồng nghiệp vụ | Mã ca | Số ca |
|---|---|---|
| Đăng nhập & phân quyền theo vai | TC-001–004 | 4 |
| Nhập liệu đơn/lô + mã khuyết giá trị | TC-005–009 | 5 |
| Quy trình 11 trạng thái | TC-010–013 | 4 |
| Nguyên tắc bốn mắt | TC-014–015 | 2 |
| Trả lại bổ sung & gỡ xuất bản | TC-016–017 | 2 |
| Hoàn tác kiểm kê hai tầng | TC-018–020 | 3 |
| Sao lưu & khôi phục | TC-021–024 | 4 |
| Chia sẻ dữ liệu | TC-025–027 | 3 |
| Sổ tuân thủ | TC-028–030 | 3 |
| Tìm kiếm bỏ dấu | TC-031–033 | 3 |
| Đối tượng chưa số hóa | TC-034–036 | 3 |
| **Tổng** | | **36** |

Đây là bộ ca kiểm thử **tối thiểu bắt buộc** cho các luồng then chốt; tổ kiểm thử bổ sung thêm ca chi tiết hơn cho từng nhóm CN-xx khi lập kế hoạch kiểm thử chi tiết theo đợt (test cycle), theo đúng khuôn mẫu ở mục 7.1–7.11.

---

## 8. Kiểm thử phi chức năng

### 8.1. Kiểm thử hiệu năng

| Ca | Chỉ tiêu | Cách kiểm chứng | Truy vết |
|---|---|---|---|
| Tra cứu, lọc danh sách | ≤ 2 giây với kho 50.000 bản ghi, 50 người dùng đồng thời | Kiểm thử tải, đo phân vị 95, tăng dần số người dùng ảo tới ngưỡng | YC-PCN-01 |
| Mở hồ sơ chi tiết một bản ghi | ≤ 1,5 giây (chưa tính tải mô hình 3D) | Đo trên máy trạm cấu hình khuyến nghị (Chương 10 mục 10.1) | YC-PCN-02 |
| Khung hình đầu tiên của mô hình 3D bản web | ≤ 5 giây trên đường truyền 20 Mbps | Giới hạn băng thông mô phỏng, đo trên trình duyệt thật | YC-PCN-03 |
| Tải dữ liệu không gian lớn (splat, đám mây điểm) | Tải lũy tiến theo mức chi tiết, không tải nguyên khối | Quan sát lưu lượng mạng khi mở cảnh lớn, xác nhận nhiều yêu cầu nhỏ thay vì một tệp khổng lồ | YC-PCN-04 |
| Tải lên tệp lớn | Tệp đơn ≥ 5 GB, tải nhiều phần, tiếp tục sau gián đoạn | Ngắt kết nối giữa chừng, xác nhận tiếp tục từ điểm dừng | YC-PCN-06, YC-CN-03.1 |
| 200 người dùng đồng thời (dự phòng mở rộng) | Hệ thống không sập, thời gian phản hồi suy giảm có kiểm soát | Kiểm thử tải theo bậc thang (ramp-up), ghi nhận điểm suy giảm | YC-PCN-05 |

### 8.2. Kiểm thử trợ năng WCAG 2.1 mức AA

| Ca | Tiêu chí | Cách kiểm chứng |
|---|---|---|
| Tương phản màu | Chữ thường/chữ phụ ≥ 4,5:1; chữ lớn/thành phần giao diện ≥ 3:1 | Công cụ quét tự động trên toàn bộ trang, đối chiếu bảng màu đã hiệu chỉnh (`#b9b9ac→#6f6f62`, `#8a8a7c→#5f5f54` — mục A8 `00-ke-hoach-nang-cap.md`) |
| Điều hướng bàn phím | Mọi chức năng thao tác được không cần chuột; thứ tự Tab hợp lý | Kiểm thử thủ công: rút chuột, đi hết luồng nghiệp vụ chính chỉ bằng bàn phím |
| Bẫy tiêu điểm hộp thoại | Mở hộp thoại giữ tiêu điểm bên trong; Esc đóng và trả tiêu điểm đúng vị trí | Kiểm thử thủ công trên từng modal (Trả lại bổ sung, Gỡ xuất bản, Khôi phục…) |
| Nhãn cho trình đọc màn hình | Nút chỉ có biểu tượng có `aria-label`; hàng bảng có `tabindex` | Quét tự động + xác minh bằng trình đọc màn hình thật (ví dụ NVDA) trên luồng đăng nhập và tra cứu |
| Khai báo ngôn ngữ trang | `lang="vi"` ở gốc tài liệu | Kiểm tra mã nguồn kết xuất |
| Không dùng màu làm phương tiện duy nhất | Trạng thái luôn kèm chữ, không chỉ chấm màu | Kiểm thử thủ công trên StatusPill và các nhãn trạng thái |

### 8.3. Kiểm thử tương thích trình duyệt và thiết bị

| Ca | Phạm vi |
|---|---|
| Ma trận trình duyệt | Hai phiên bản mới nhất của Chrome, Edge, Firefox, Safari — chạy đủ bộ ca "Phải đạt" trên từng trình duyệt |
| Điểm ngắt bố cục | 1024 px và 1280 px; xác nhận không khóa cuộn trang, nội dung không bị cắt trên máy chiếu hội trường 1024 px |
| Không phụ thuộc dịch vụ ngoài lãnh thổ | Ngắt kết nối Internet của máy trạm kiểm thử, xác nhận hệ thống vẫn tải được phông chữ, biểu tượng, thư viện hiển thị 3D từ chính hệ thống | YC-PCN-05 (mục 5.5, Chương 5 tài liệu 01) |

### 8.4. Kiểm thử an toàn thông tin

Theo `01-thuyet-minh-ky-thuat.md` mục 9.8, phần kiểm thử an toàn tách làm hai lớp:

| Lớp | Nội dung | Ai thực hiện |
|---|---|---|
| **Kiểm thử chức năng an toàn** (trong phạm vi tổ kiểm thử) | Chính sách mật khẩu, khoá tài khoản sau số lần sai cấu hình, xác thực hai yếu tố bắt buộc với Quản trị/Phê duyệt, phân quyền RBAC+ABAC không vượt quyền, nhật ký không sửa/xoá được kể cả bằng tài khoản Quản trị, liên kết tải bản gốc hết hạn không dùng lại được, giới hạn tốc độ gọi API | Tổ kiểm thử nhà thầu |
| **Kiểm thử xâm nhập** (rà soát cấu hình, quét lỗ hổng, kiểm thử xâm nhập ứng dụng) | Ngoài phạm vi năng lực và công cụ của tổ kiểm thử chức năng | Đơn vị chuyên trách an toàn thông tin độc lập, có báo cáo phát hiện và biên bản khắc phục riêng, thực hiện trước nghiệm thu |

Ca kiểm thử tiêu biểu cho lớp chức năng: thử sửa/xoá một dòng nhật ký bằng tài khoản Quản trị (kỳ vọng bị từ chối, xem YC-CN-12.7; [ADR-0012](adr/0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md) `docs/adr/0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md`); thử đăng nhập sai liên tiếp vượt ngưỡng cấu hình (kỳ vọng khoá tạm, không tiết lộ tài khoản có tồn tại hay không, xem `01-thuyet-minh-ky-thuat.md` mục 9.2); thử truy cập trực tiếp một tài nguyên ngoài phạm vi bộ sưu tập được cấp (ABAC) bằng cách sửa tham số trên trình duyệt (kỳ vọng bị chặn ở tầng dịch vụ).

---

## 9. Kiểm thử hồi quy và tự động hoá

### 9.1. Hiện trạng — nói thẳng mức độ tự động hoá còn thấp

Tại thời điểm lập tài liệu này, **mức độ tự động hoá kiểm thử của dự án còn thấp**. Toàn bộ bộ kiểm thử tự động hiện có là **một tệp duy nhất**: `app/tests/canChi.test.ts`, kiểm chứng hàm quy đổi can chi ↔ dương lịch (`app/src/utils/canChi.ts`) bằng ba nhóm kiểm thử — 5 mốc đã đối chiếu nguồn sử liệu, 3 mốc khoa thi xác minh bổ sung, và tính chất chu kỳ 60 năm. Chạy bằng lệnh `npm test` trong thư mục `app/`, dùng thẳng bộ chạy kiểm thử có sẵn của Node.js (`node --experimental-strip-types --test`), không cần cài thêm thư viện kiểm thử ngoài.

**Toàn bộ 36 ca kiểm thử ở mục 7, cùng toàn bộ kiểm thử phi chức năng ở mục 8, hiện là kiểm thử thủ công theo kịch bản** — chưa có kịch bản kiểm thử hệ thống hay kiểm thử giao diện tự động hoá nào trong mã nguồn tại thời điểm lập tài liệu. Đây là hiện trạng thật của dự án, không phải mục tiêu thiết kế; tài liệu này không tô hồng mức độ tự động hoá để hồ sơ trông đầy đủ hơn thực tế.

### 9.2. Vì sao can chi là hàm đầu tiên được tự động hoá

Hàm `canChiOf()` là **ứng viên đúng đắn nhất** để tự động hoá đầu tiên: nó thuần túy (không phụ thuộc trạng thái/giao diện), có công thức toán học rõ ràng (`Can = (năm−4) mod 10`, `Chi = (năm−4) mod 12`), và **từng bị gõ tay sai ba lần trong dữ liệu mock** (Quý Mão thay vì Quý Mùi cho 1463, Kỷ Sửu thay vì Kỷ Mùi cho 1499, Bính Thân thay vì Bính Thìn cho 1496 — xem `04-phu-luc-fact-di-san.md` Bảng B). Đây là ví dụ cụ thể cho thấy kiểm thử tự động hoá **ngăn được đúng loại lỗi đã từng xảy ra thật**, không phải một bài tập lý thuyết.

### 9.3. Lộ trình mở rộng tự động hoá

Thứ tự ưu tiên đề xuất — mỗi hàm được chọn vì cùng đặc điểm với `canChiOf()`: thuần túy, có quy tắc nghiệp vụ rõ ràng, rủi ro cao nếu sai:

| Thứ tự | Hàm/luồng cần tự động hoá | Lý do ưu tiên | Tương ứng ca thủ công |
|---|---|---|---|
| 1 | `profileCompletenessPct()` / `averageCompletenessPctOrNull()` (`selectors.ts`) | Quy tắc năm nhánh theo mã khuyết giá trị dễ lẫn lộn; đã có bug tiềm ẩn kiểu "tập rỗng trả 100%" cần khoá lại bằng kiểm thử | TC-034 |
| 2 | `normalizeForSearch()` / `matchesAssetQuery()` (`utils/search.ts`) | Chuẩn hoá Unicode dễ vỡ khi thêm ký tự đặc biệt mới, cần bộ kiểm thử hồi quy giữ đúng hành vi bỏ dấu hai chiều | TC-031, TC-032, TC-033 |
| 3 | `nextStatus()` / `advanceActionLabel()` / `isApprovalStep()` (`pipeline.ts`) | Bảo đảm 11 trạng thái không bao giờ cho phép một đường chuyển trạng thái ngoài thiết kế | TC-010–013 |
| 4 | Hàm dẫn xuất tất định trong `digitization.ts` (checksum giả lập, fixity, rights statement) | Dùng RNG có seed cố định — thích hợp kiểm thử snapshot vì kết quả phải ổn định giữa các lần chạy | — |
| 5 | Kiểm thử tích hợp cho luồng bốn mắt và hoàn tác kiểm kê hai tầng | Rủi ro cao nhất theo ma trận mục 3 (R2, R3) nhưng cần môi trường mô phỏng nhiều vai trò — độ phức tạp kỹ thuật cao hơn, nên làm sau khi có nền kiểm thử đơn vị vững |

### 9.4. Kiểm thử hồi quy

Cho tới khi lộ trình mục 9.3 hoàn thành, kiểm thử hồi quy dựa trên **bộ ca thủ công mục 7**, chạy lại toàn bộ ca mức "Phải đạt" trước mỗi đợt phát hành lên môi trường kiểm thử, và chạy lại các ca liên quan trực tiếp tới vùng mã nguồn vừa thay đổi. Khi một hàm được tự động hoá theo lộ trình mục 9.3, ca thủ công tương ứng **không bị xoá** mà chuyển vai trò sang kiểm thử hệ thống/UAT (xác nhận hành vi đúng ở tầng giao diện), còn kiểm thử đơn vị đảm nhiệm phần hồi quy logic — tránh khoảng trống khi chuyển đổi.

---

## 10. Báo cáo lỗi và tiêu chí nghiệm thu

### 10.1. Phân loại mức độ nghiêm trọng của lỗi

| Mức | Định nghĩa | Ví dụ | Hạn khắc phục khuyến nghị |
|---|---|---|---|
| **Nghiêm trọng (Blocker)** | Sai lệch hoặc mất dữ liệu di sản; phá nguyên tắc bốn mắt; lộ dữ liệu cá nhân ra kênh công khai; mất khả năng khôi phục | Duyệt được bản ghi của chính mình; trường `HAN_CHE` vẫn lộ trên API công khai | Trước khi tiếp tục kiểm thử vùng liên quan |
| **Cao** | Sai chức năng cốt lõi nhưng có cách né tạm thời; ảnh hưởng một luồng nghiệp vụ chính | Nhập lô không tự gán `CHUA_NHAP` cho ô trống | Trong đợt kiểm thử hiện tại |
| **Trung bình** | Sai lệch không ảnh hưởng toàn vẹn dữ liệu hay an toàn, có ảnh hưởng trải nghiệm | Chỉ số hiệu năng vượt ngưỡng nhẹ, không đạt WCAG ở một thành phần phụ | Trước khi ra bản UAT |
| **Thấp** | Lỗi hiển thị nhỏ, không ảnh hưởng nghiệp vụ | Sai chính tả nhãn, lệch khoảng cách giao diện 1–2 px | Theo kế hoạch phát hành kế tiếp |

### 10.2. Mẫu báo cáo lỗi

Mỗi lỗi ghi tối thiểu: mã lỗi, mã ca kiểm thử liên quan (`TC-nnn`), mức độ nghiêm trọng, môi trường phát hiện, các bước tái hiện, kết quả thực tế so với kết quả mong đợi, ảnh chụp màn hình/video khi cần, vai trò tài khoản dùng để phát hiện, trạng thái xử lý (Mới/Đang xử lý/Chờ kiểm thử lại/Đã đóng/Từ chối). **"Nghiệp vụ cốt lõi"** (dùng ở mục 6.2) được định nghĩa là: toàn bộ luồng ở mục 7.3–7.6 (pipeline, bốn mắt, trả lại/gỡ xuất bản, hoàn tác kiểm kê) cộng luồng mã khuyết giá trị (mục 7.2) và bảo vệ dữ liệu cá nhân (mục 7.9) — lỗi Nghiêm trọng/Cao ở các luồng này chặn nghiệm thu, lỗi cùng mức ở luồng khác không chặn nhưng phải có kế hoạch khắc phục kèm mốc thời gian.

### 10.3. Tiêu chí nghiệm thu tổng thể

Hệ thống được coi là **đủ điều kiện nghiệm thu Giai đoạn 1** khi đồng thời đạt:

1. 100% ca kiểm thử mức **Phải đạt** trong bộ 36 ca ở mục 7 đạt kết quả đúng như mong đợi, có biên bản UAT ký bởi cán bộ nghiệp vụ tương ứng vai trò.
2. Không còn lỗi mức Nghiêm trọng nào đang mở; lỗi mức Cao đang mở có kế hoạch khắc phục được Trung tâm chấp thuận bằng văn bản.
3. Đạt các chỉ tiêu hiệu năng YC-PCN-01 đến YC-PCN-06 (mục 8.1) trên môi trường kiểm thử có cấu hình tối thiểu theo Chương 10 tài liệu 01.
4. Đạt WCAG 2.1 mức AA trên các luồng nghiệp vụ chính (mục 8.2), xác nhận bằng cả công cụ quét tự động lẫn kiểm thử thủ công bàn phím/trình đọc màn hình.
5. Đã có báo cáo kiểm thử xâm nhập từ đơn vị chuyên trách độc lập, không còn lỗ hổng mức nghiêm trọng đang mở (mục 8.4).
6. Diễn tập khôi phục đạt RTO ≤ 4 giờ, có biên bản (TC-024).
7. Toàn bộ 14 sai sót fact di sản đã hiệu đính (`04-phu-luc-fact-di-san.md` Bảng B) được xác nhận đúng trong dữ liệu trình diễn/UAT, và ba nội dung ở Bảng C đã có ý kiến chính thức của Trung tâm hoặc được gắn mã khuyết giá trị đúng quy tắc.

---

## 11. Phụ lục — ma trận truy vết `TC-nnn` ↔ yêu cầu

Bảng dưới tổng hợp ngược: mỗi nhóm yêu cầu chức năng chính được ít nhất một ca kiểm thử ở mục 7 phủ tới — dùng để kiểm tra nhanh không nhóm yêu cầu trọng yếu nào bị bỏ sót khi lập kế hoạch kiểm thử chi tiết theo đợt.

| Nhóm yêu cầu | Ca kiểm thử phủ tới | Còn thiếu (bổ sung ở kế hoạch kiểm thử chi tiết) |
|---|---|---|
| YC-CN-01 Danh mục, sổ đăng ký | TC-013, TC-035, TC-036 | YC-CN-01.5 (xếp hạng/danh hiệu) |
| YC-CN-02 Siêu dữ liệu | TC-005–008 | YC-CN-02.3 (song thẩm Hán Nôm ba lớp — bổ sung ca riêng khi có giao diện nhập Hán Nôm đầy đủ) |
| YC-CN-03 Nhập liệu, QC đầu vào | TC-008, TC-009, TC-011 | YC-CN-03.7 (cảnh báo hạn mức dung lượng) |
| YC-CN-04 Tìm kiếm | TC-031–033 | YC-CN-04.4 (lọc kết hợp nâng cao), YC-CN-04.6 (tìm can chi hai chiều — mở rộng từ TC-031) |
| YC-CN-05 Duyệt, xuất bản | TC-010, TC-014–017 | YC-CN-05.5 (ký số khi xuất bản), YC-CN-05.6 (xin ý kiến Bộ VHTTDL) |
| YC-CN-06 Phiên bản, toàn vẹn | TC-023 | YC-CN-06.1 (chặn ghi đè bản gốc), YC-CN-06.2 (so sánh phiên bản) |
| YC-CN-07 Bộ sưu tập, quyền, mức truy cập | — | Toàn bộ nhóm — bổ sung ở kế hoạch kiểm thử chi tiết (rights statement, mức truy cập ba bậc, đóng dấu chìm động) |
| YC-CN-08 Báo cáo, thống kê | TC-034 | YC-CN-08.1, YC-CN-08.4 (bốn biểu đồ, xuất Excel/PDF) |
| YC-CN-09 Kiểm kê định kỳ | TC-018–020, TC-036 | YC-CN-09.3 (biên bản), YC-CN-09.4 (đánh dấu cần số hóa lại) |
| YC-CN-11 Kết nối, chia sẻ | TC-025–027 | YC-CN-11.6 (quản lý khóa API), YC-CN-11.7 (giới hạn tốc độ) |
| YC-CN-12 Người dùng, phân quyền, nhật ký | TC-001–004, TC-014–015 | YC-CN-12.7–12.10 (nhật ký hash-chain, xuất nhật ký) |
| YC-CN-14 Sao lưu, phục hồi | TC-021–024 | YC-CN-14.5 (cấu hình hệ thống) |
| YC-CN-15 Tuân thủ | TC-028–030 | YC-CN-15.2 (hồ sơ cấp độ ATTT), YC-CN-15.6–15.9 (đánh giá rủi ro, kiểm toán, vòng đời lưu trữ, mốc 31/12/2026) |

**Kết luận đọc bảng:** cột "Còn thiếu" không phải khoảng trống bị bỏ sót ngẫu nhiên — đây là ranh giới có chủ đích giữa **bộ ca tối thiểu bắt buộc** của tài liệu này (36 ca, tập trung vào rủi ro cao nhất theo mục 3) và **kế hoạch kiểm thử chi tiết theo từng đợt phát triển**, nơi từng yêu cầu `YC-CN-xx.y` còn lại được viết thành ca kiểm thử đầy đủ theo đúng khuôn mẫu ở mục 7.1–7.11 khi chức năng tương ứng hoàn thiện.

---

*Tài liệu này đọc cùng `01-thuyet-minh-ky-thuat.md` (Chương 4, 5, 9), `02-quy-trinh-bao-quan-sao-luu.md`, `07-mo-hinh-du-lieu.md` và `12-chat-luong-du-lieu.md`. Cập nhật kế hoạch kiểm thử chi tiết theo từng đợt phát triển là trách nhiệm của tổ kiểm thử nhà thầu, không thuộc phạm vi sửa đổi tài liệu cấp độ tổ chức này.*
