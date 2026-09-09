# 0016. `averageCompletenessPctOrNull` trả `null` cho tập rỗng, không phải 100%

## Bối cảnh

Hành vi gốc của phép tính "% độ đầy đủ hồ sơ trung bình" trả về **100%** khi tập bản ghi rỗng (một
lựa chọn lập trình thường gặp: trung bình của tập rỗng "an toàn" là mặc định về giá trị cao nhất).
Với một đối tượng di sản **chưa được số hóa** (0 bản đại diện số), điều này khiến màn Hồ sơ đối
tượng hiện "hồ sơ đầy đủ 100%" — làm báo cáo tiến độ số hóa **bị đọc ngược**: đối tượng thiếu dữ
liệu nhất lại trông như hoàn chỉnh nhất.

## Quyết định

Tách hai hàm: **`averageCompletenessPctOrNull(assets)`** trả **`null`** khi `assets.length === 0`,
buộc bên gọi phải tự quyết cách hiển thị (ví dụ "— Chưa số hóa") thay vì ngầm định 100% — dùng ở
`ObjectDossierPage` (bối cảnh một đối tượng đơn lẻ, nơi 0 bản ghi là tình huống thường xuyên và có
ý nghĩa rõ ràng cần diễn giải riêng). **`averageCompletenessPct(assets)`** giữ trả về `0` cho tập
rỗng — dùng ở các bối cảnh tổng hợp nhiều dòng (`ReportsPage`, `ObjectsPage`) nơi một con số 0%
trong danh sách nhiều dòng không có rủi ro bị đọc nhầm thành "100% hoàn chỉnh" như ở trang chi
tiết một đối tượng.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Khắc phục đúng lỗi thật đã phát hiện — đối tượng chưa số hóa không còn hiện "100%
đầy đủ". Kiểu `number | null` của TypeScript buộc mọi lời gọi `averageCompletenessPctOrNull` phải
xử lý nhánh `null` tường minh, không thể vô tình bỏ sót.

**Tiêu cực:** Hai hàm gần giống nhau tồn tại song song trong `selectors.ts` — rủi ro chọn nhầm hàm
ở màn hình mới nếu không đọc kỹ docstring giải thích khác biệt giữa hai hàm.

**Rủi ro:** Nếu một trang mới dùng nhầm `averageCompletenessPct` (trả `0`) cho ngữ cảnh "đối tượng
đơn lẻ chưa số hóa" thay vì bản `OrNull`, vẫn tái diễn một dạng đọc sai khác — 0% thay vì "chưa số
hóa" — tuy nhẹ hơn 100% nhưng chưa phải là cách diễn giải lý tưởng cho người xem báo cáo.

## Phương án đã cân nhắc và lý do loại

- **Giữ một hàm duy nhất trả về 100 cho tập rỗng (hành vi gốc)**: loại — đây chính là lỗi đã phát
  hiện: đối tượng chưa số hóa hiện "hồ sơ đầy đủ 100%", đọc ngược hoàn toàn ý nghĩa báo cáo tiến
  độ.
- **Giữ một hàm duy nhất luôn trả về 0 cho tập rỗng ở mọi bối cảnh**: loại vì tại màn Hồ sơ đối
  tượng, "0%" và "chưa số hóa" là hai thông điệp khác nhau về mặt hiển thị (0% gợi ý "đã có hồ sơ
  nhưng trống", còn "chưa số hóa" đúng bản chất hơn) — cần phân biệt được ngay ở tầng gọi bằng
  kiểu dữ liệu, không chỉ bằng quy ước ngầm.
- **Bắt buộc bên gọi luôn truyền mảng khác rỗng, validate ở tầng trên**: loại vì không thực tế —
  đối tượng chưa số hóa (0 bản ghi) là trạng thái hợp lệ và thường xuyên xảy ra trong dữ liệu thật,
  hàm phải xử lý được, không phải là lỗi đầu vào cần ngăn chặn.

## Liên kết

- `app/src/data/selectors.ts` (dòng 129–146 — `averageCompletenessPctOrNull`,
  `averageCompletenessPct`)
- `app/src/pages/ObjectDossierPage.tsx` (dòng 29, 178)
- `app/src/pages/ObjectsPage.tsx` (dòng 102)
- `app/src/pages/ReportsPage.tsx` (dòng 97, 146)
