# 0020. Trang Tuân thủ đổi hệ hình: hướng dẫn tra cứu thay cho tuyên bố tuân thủ

## Bối cảnh

Trang "Tuân thủ & quản trị dữ liệu" (bản 1.0.0) trình bày theo lối **tự tuyên bố**: mỗi nghĩa vụ
pháp lý kèm trạng thái "Đạt ✓ / Đang rà soát" do phần mềm hiển thị sẵn. Chủ đầu tư chỉ ra đúng chỗ
yếu của lối này (13/08/2026): tuyên bố tuân thủ do máy sinh **khó kiểm chứng và không có ai chịu
trách nhiệm** — nếu hội đồng chấm hoặc đoàn thanh tra hỏi "ai xác nhận mục này Đạt, căn cứ đâu?",
câu trả lời trung thực là "không ai cả, giao diện ghi sẵn thế". Với hồ sơ nộp cơ quan nhà nước, một
trang claim không người ký còn nguy hiểm hơn không có trang nào: nó tạo cảm giác đã tuân thủ và làm
đơn vị vận hành bỏ qua việc tự kiểm thật.

Tuân thủ pháp lý về bản chất là **trạng thái của tổ chức vận hành**, không phải thuộc tính của phần
mềm — phần mềm chỉ có thể *hỗ trợ* nghĩa vụ và *hướng dẫn* cách thực hiện.

## Quyết định

Thay trang Tuân thủ bằng **Trợ giúp & tra cứu** (`/help`, nhóm HỆ THỐNG, mở cho mọi vai trò):

1. **Không còn trạng thái tuân thủ nào do phần mềm tự gán.** Mỗi mục pháp lý trình bày 4 phần:
   *văn bản yêu cầu gì* (chỉ dùng trích dẫn đã xác minh — [ADR-0014](0014-chi-trich-dan-van-ban-phap-ly-da-xac-minh.md))
   → *hệ thống hỗ trợ bằng chức năng nào* (kèm liên kết màn hình) → *đơn vị vận hành phải tự làm gì*
   (checklist hành động) → **trách nhiệm xác nhận thuộc chức danh nào** (Giám đốc Trung tâm, cán bộ
   chuyên trách ATTT, cán bộ bảo vệ dữ liệu cá nhân…).
2. **Tra cứu được**: tìm theo từ khóa/số hiệu văn bản, lọc theo nhóm; bổ sung nhóm hướng dẫn sử
   dụng theo màn hình. Cảnh báo hai văn bản hết hiệu lực (NĐ 47/2020, NĐ 13/2023) giữ dạng mục
   đính chính nổi bật.
3. Biểu mẫu đính kèm giữ cơ chế xem trước (`EvidenceViewer`) nhưng dán nhãn lại **"biểu mẫu tham
   khảo"** — không phải "chứng cứ tuân thủ".
4. Module quyền **"Tuân thủ" trong ma trận phân quyền giữ nguyên** ([ADR-0017](0017-ma-tran-phan-quyen-mot-nguon-va-quy-tac-phan-tach-nhiem-vu.md)):
   nghiệp vụ quản lý hồ sơ/biểu mẫu vẫn tồn tại, chỉ cách trình bày đổi; `MODULE_ROUTES` trỏ sang
   `/help`. Đường dẫn cũ `/compliance` chuyển hướng sang `/help` để tài liệu/bookmark cũ không gãy.

## Trạng thái

Đã chấp nhận — 13/08/2026.

## Hệ quả

**Tích cực:** Mọi khẳng định tuân thủ trong hệ thống đều có người chịu trách nhiệm bằng chức danh —
khớp nguyên tắc xuyên suốt của hồ sơ (bốn mắt, vết không xóa được: trách nhiệm luôn quy về con
người, không về phần mềm). Trước hội đồng, "hệ thống hướng dẫn đơn vị thực hiện và ghi ai xác nhận"
là câu trả lời đứng vững hơn "hệ thống báo Đạt". Trang mở cho mọi vai trò nên tài liệu hướng dẫn
đến được cả người vận hành không có quyền quản trị.

**Tiêu cực:** Mất bảng tổng hợp "nhìn một phát biết đạt bao nhiêu mục" — thứ trực quan khi trình
chiếu. Đây là mất mát có chủ ý: con số đó không có thật. Khi cần dashboard tuân thủ thật, nó phải
đọc từ bản ghi xác nhận *có người ký* (giai đoạn backend), không từ hằng số giao diện.

**Rủi ro:** Thẻ "Tuân thủ chia sẻ dữ liệu" ở màn Kết nối & chia sẻ vẫn hiển thị danh sách
`COMPLIANCE` kiểu "Đạt / Đang rà soát" (`data/compliance.ts`) — một tàn dư cùng bệnh, ngoài phạm vi
lần đổi này. Đã ghi nhận; hoặc chuyển thành "bảng tự đánh giá của đơn vị (mẫu)" hoặc gỡ ở lần dọn
tiếp theo. Ngoài ra nội dung hướng dẫn là dữ liệu tĩnh trong mã — sửa nội dung cần build lại; chấp
nhận ở bản trình diễn.

## Phương án đã cân nhắc và lý do loại

- **Giữ bảng claim, thêm cột "người xác nhận"**: loại — cột đó cũng là chuỗi gõ sẵn, tức là claim
  chồng lên claim; vấn đề gốc (máy tuyên bố thay người) không đổi.
- **Xóa hẳn trang, chỉ để tài liệu Markdown trong repo**: loại — người vận hành dùng giao diện,
  không đọc kho mã; nhu cầu tra cứu tại chỗ ("điều này yêu cầu gì, tôi phải làm gì") là có thật.
- **Làm workflow xác nhận tuân thủ ngay trong bản demo** (mục ký, lưu người xác nhận): loại — cần
  backend thật để chữ ký có giá trị vết; làm giả trên mock lại rơi đúng vào bệnh cũ ở dạng tinh
  vi hơn.

## Liên kết

- `app/src/pages/HelpPage.tsx` · `app/src/data/helpContent.ts` (thay `pages/CompliancePage.tsx` đã gỡ)
- `app/src/layout/navConfig.ts` (mục Trợ giúp & tra cứu, nhóm HỆ THỐNG)
- `app/src/App.tsx` (chuyển hướng `/compliance` → `/help`)
- `app/src/data/permissions.ts` (`MODULE_ROUTES['Tuân thủ'] = '/help'`)
- [ADR-0014](0014-chi-trich-dan-van-ban-phap-ly-da-xac-minh.md) — ràng buộc trích dẫn áp dụng
  nguyên vẹn cho nội dung hướng dẫn
