# 0011. Nguyên tắc bốn mắt; tách quyền Phê duyệt khỏi Xuất bản

## Bối cảnh

Báo cáo red-team (Đòn 6–7) phát hiện mock data nguyên trạng không nhất quán về vai trò: người
đóng vai Phê duyệt/Chỉ xem đôi khi lại xuất hiện là "Cán bộ phụ trách" của chính bản ghi họ duyệt.
Nếu người phụ trách một bản ghi cũng có thể tự phê duyệt/xuất bản bản ghi đó, hệ thống mất khả
năng kiểm soát bốn mắt — một yêu cầu tuân thủ cơ bản cho quy trình duyệt xuất bản dữ liệu di sản
công. Đồng thời, "Phê duyệt" (thẩm định nội dung chuyên môn) và "Xuất bản" (công bố ra ngoài) là
hai hành vi có ý nghĩa nghiệp vụ khác nhau — xuất bản còn kéo theo bước "Xin ý kiến Bộ VHTTDL" bắt
buộc riêng với di tích quốc gia đặc biệt (NĐ 308/2025 Điều 87) mà bước phê duyệt nội dung không có.

## Quyết định

Tách pipeline thành các bước riêng biệt: **"Thẩm định nội dung"** (`isApprovalStep`) khác với
**"Đã duyệt" → "Xuất bản"** (`isPublishStep`). Nguyên tắc bốn mắt áp dụng cho **danh tính người
đang đăng nhập**, không riêng vai trò "Phê duyệt": nút Phê duyệt bị khóa nếu người dùng hiện tại
chính là "Cán bộ phụ trách" của bản ghi đó, bất kể vai trò cụ thể của họ là gì. Trong dữ liệu mock,
người có vai trò "Phê duyệt" không bao giờ được gán làm cán bộ phụ trách của bất kỳ tài sản nào
(loại trừ khỏi `OWNER_POOL`).

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Một người không thể tự phê duyệt/xuất bản chính công việc của mình — khắc phục
đúng phát hiện của red-team (Đòn 6–7); tách hai bước pipeline cho phép kiểm soát riêng từng bước
(ví dụ chỉ bước xuất bản mới cần "Xin ý kiến Bộ VHTTDL" với di tích QGĐB).

**Tiêu cực:** Thêm bước vào pipeline (chuỗi 9 trạng thái thay vì gộp ngắn hơn) khiến quy trình dài
hơn, có thể làm chậm tiến độ xuất bản với tài sản đơn giản không thật sự cần thẩm định nội dung
sâu.

**Rủi ro:** Hiện kiểm soát bốn mắt chỉ khóa nút ở tầng UI (mock, chưa có backend thật — xem ADR
0002); nếu triển khai backend mà không enforce lại ở tầng API/service, kiểm soát dễ bị vượt qua
bằng cách gọi thẳng API — bắt buộc phải kiểm tra lại ở server khi có backend thật, không thể chỉ
dựa vào việc ẩn nút trên giao diện.

## Phương án đã cân nhắc và lý do loại

- **Gộp Phê duyệt và Xuất bản thành một bước/một quyền duy nhất**: loại vì hai hành vi có ý nghĩa
  nghiệp vụ khác nhau (thẩm định chuyên môn nội dung vs công bố ra ngoài, kèm nghĩa vụ pháp lý
  riêng của bước xuất bản) — gộp lại làm mất khả năng kiểm soát và truy vết riêng từng bước.
- **Kiểm tra bốn mắt theo vai trò (role-based) thay vì theo danh tính cụ thể**: loại vì không
  chặn được trường hợp một người có vai trò Phê duyệt nhưng đồng thời là cán bộ phụ trách của
  chính bản ghi đó tự duyệt cho mình — đúng lỗi mà red-team phát hiện.
- **Chỉ cảnh báo mềm (soft warning) thay vì khóa cứng nút Phê duyệt**: loại vì nguyên tắc bốn mắt
  là một kiểm soát tuân thủ, cảnh báo có thể bỏ qua không đủ sức ngăn chặn hành vi tự duyệt.

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục A3, C1
- `app/src/data/pipeline.ts` (`isApprovalStep`, `isPublishStep`)
- `app/src/pages/AssetDetailPage.tsx` (dòng 44–47, 332 — kiểm tra bốn mắt theo `currentUser`)
- `app/src/data/users.ts` (`OWNER_POOL` loại trừ vai trò Phê duyệt)
