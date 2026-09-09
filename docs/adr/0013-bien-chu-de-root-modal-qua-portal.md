# 0013. Biến chủ đề gắn ở `:root`; modal render qua portal ra `document.body`

## Bối cảnh

Hai lỗi thật đã xảy ra trong quá trình phát triển, cùng gốc rễ kỹ thuật: `backdrop-filter` biến
phần tử cha thành **khối chứa (containing block)** cho con `position: fixed`. Lỗi 1 — màn Đăng
nhập: biến chủ đề (`--ink`, `--accent`…) ban đầu chỉ gắn ở thẻ bọc `AppShell`, nhưng màn Đăng nhập
và Đăng ký nằm **ngoài** `AppShell` (không có thanh điều hướng) — nên `var(--ink)` không có giá
trị ở hai màn đó, khiến nút nền tối hóa trong suốt trong khi chữ vẫn trắng, thành chữ trắng trên
nền sáng. Lỗi 2 — hộp thoại Cài đặt: Thanh bên (`Sidebar`) có `backdrop-filter`; modal Cài đặt
render tại chỗ bên trong cây DOM đó bị lớp phủ nhốt trong bề rộng 232px của thanh bên thay vì phủ
toàn màn hình.

## Quyết định

Gắn biến CSS chủ đề lên **`document.documentElement` (`:root`)** thay vì chỉ lên thẻ bọc của
`AppShell`, để mọi màn hình — kể cả những màn nằm ngoài `AppShell` như Đăng nhập/Đăng ký — đều đọc
được giá trị biến. Mọi modal có tổ tiên (ancestor) mang `backdrop-filter` trong cây DOM (Sidebar,
AppShell) phải render qua **`createPortal`** ra `document.body` thay vì tại chỗ — áp dụng cho
`SettingsModal` và `EvidenceViewer`.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Khắc phục cả hai lỗi thật đã ghi nhận; thiết lập một mẫu (pattern) nhất quán, có ghi
chú kỹ thuật ngay trong mã nguồn, cho mọi modal thêm mới sau này.

**Tiêu cực:** Cần nhớ áp dụng portal cho **mọi** modal mới nếu cây tổ tiên có `backdrop-filter` —
đây không phải cơ chế tự động của framework, dễ quên khi thêm modal mới mà không qua review kỹ
lưỡng.

**Rủi ro:** Nếu một modal mới không dùng portal và một tổ tiên của nó sau này thêm
`backdrop-filter` (thường xảy ra khi style card/panel được cập nhật), bug tái diễn âm thầm — chỉ
phát hiện được khi kiểm tra trực quan (visual QA), không phải lỗi biên dịch hay lỗi runtime rõ
ràng.

## Phương án đã cân nhắc và lý do loại

- **Gắn biến chủ đề ở thẻ bọc `AppShell` thay vì `:root`**: loại — đây chính là nguyên nhân của
  lỗi 1 (Đăng nhập/Đăng ký nằm ngoài `AppShell` không đọc được biến).
- **Bỏ `backdrop-filter` khỏi Sidebar/AppShell để né vấn đề containing block**: loại vì
  `backdrop-filter` là hiệu ứng kính mờ (glass-morphism) cốt lõi của bản thiết kế đã duyệt, bỏ đi
  làm sai lệch giao diện đã chốt với chủ đầu tư.
- **Render modal tại chỗ nhưng dùng `z-index` rất cao thay vì portal**: loại vì `z-index` không
  giải quyết được vấn đề containing block của `position: fixed` — modal vẫn bị giới hạn trong
  khối chứa của phần tử cha có `backdrop-filter` bất kể `z-index` bao nhiêu.

## Liên kết

- `app/src/theme/ThemeContext.tsx` (gắn biến chủ đề lên `document.documentElement`)
- `app/src/components/SettingsModal.tsx` (dòng 1–9, ghi chú kỹ thuật về portal)
- `app/src/components/EvidenceViewer.tsx`
- `app/src/layout/Sidebar.module.css`, `app/src/layout/AppShell.module.css` (`backdrop-filter`)
