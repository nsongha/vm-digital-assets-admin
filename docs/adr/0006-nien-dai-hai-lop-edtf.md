# 0006. Niên đại hai lớp: EDTF để lọc + chuỗi hiển thị nguyên văn + độ tin cậy

## Bối cảnh

Di sản Việt Nam ghi niên đại theo can chi/niên hiệu ("khoa Nhâm Tuất", "niên hiệu Cảnh Hưng 35") —
dạng này không thể sắp xếp hay lọc theo khoảng số học, nhưng vẫn phải giữ nguyên văn vì đó là giá
trị sử học, quy đổi sai lệch là lỗi nghiệp vụ nghiêm trọng. Đồng thời hệ thống cần lọc/sắp xếp tài
sản theo khoảng thời gian (CN-04 — tìm kiếm và khai thác) và biểu diễn được nhiều mức độ chắc chắn
khác nhau: chắc chắn, nghi vấn, xấp xỉ, theo thế kỷ, theo khoảng, hoặc hoàn toàn chưa biết.

## Quyết định

Tách niên đại thành hai lớp độc lập: lớp **chuẩn hóa** dùng **EDTF (ISO 8601-2)** — `era_from`/
`era_to` quy đổi sang lịch dương phục vụ lọc theo khoảng (`/assets?era_from=...&era_to=...`) và
sắp xếp theo thời gian, ví dụ `1484` (chắc chắn), `1484?` (nghi vấn), `1484~` (xấp xỉ), `18XX`
(thế kỷ 19), `1740/1786` (khoảng), `unknown`; và lớp **hiển thị** `era_display` giữ nguyên văn
cách ghi can chi/niên hiệu đúng chuẩn sử học, không quy đổi sai lệch. Trường `era_certainty` ghi
nhận đây là niên đại đã xác định chắc chắn, ước tính theo phong cách nghệ thuật/khảo cổ, hay còn
tranh cãi giữa các nguồn sử liệu.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Lọc và sắp xếp theo khoảng niên đại hoạt động đúng qua API mà không phải phân tích
cú pháp chuỗi tự do lúc truy vấn. Hiển thị vẫn giữ nguyên giá trị sử học của can chi/niên hiệu,
không trình bày một niên đại suy đoán như thể là sự thật đã kiểm chứng — `era_certainty` làm rõ
mức độ tin cậy cho người đọc.

**Tiêu cực:** Cần nhập liệu kép (vừa nhập chuỗi hiển thị nguyên văn, vừa quy đổi sang EDTF chuẩn
hóa) — tăng chi phí nhập liệu và thẩm định so với chỉ ghi một chuỗi tự do như hiện trạng.

**Rủi ro:** Người nhập liệu có thể quy đổi sai từ can chi/niên hiệu sang lịch dương nếu không có
bảng tra chuẩn hoặc quy trình thẩm định đi kèm — sai ở lớp `era_from`/`era_to` sẽ làm lệch kết
quả lọc dù `era_display` vẫn đúng, tạo ra sự bất nhất khó phát hiện giữa hai lớp.

## Phương án đã cân nhắc và lý do loại

- **Chỉ lưu chuỗi tự do (hiện trạng)**: loại vì không lọc/sắp xếp được theo khoảng thời gian, use
  case CN-04 đòi hỏi lọc theo `era_from`/`era_to`.
- **Chỉ lưu năm số nguyên (một trường duy nhất)**: loại vì mất thông tin can chi/niên hiệu là giá
  trị sử học phải giữ nguyên văn, và không biểu diễn được độ bất định (nghi vấn/xấp xỉ/khoảng/
  thế kỷ).
- **Dùng ISO 8601 thường thay vì EDTF (ISO 8601-2)**: loại vì ISO 8601 chuẩn không biểu diễn được
  ngày không chắc chắn/khoảng/thế kỷ mà EDTF hỗ trợ trực tiếp qua cú pháp `?`/`~`/`XX`/`/`.

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục 0quinquies (điểm 3)
- `docs/07-mo-hinh-du-lieu.md` mục 5.3 (`era_display`/`era_from`/`era_to`/`era_certainty`)
- `app/src/data/objects/types.ts` (`eraCertainty` trên seed đối tượng)
