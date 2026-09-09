# 0005. Bộ 5 mã khuyết giá trị thay ô trống

## Bối cảnh

Nguyên trạng cho phép trường trống hoặc ghi "—" tự do khi chưa có dữ liệu. Ô trống là mơ hồ: không
phân biệt được "chưa ai nhập" với "đã nghiên cứu và kết luận không thể biết" — trong khi hai tình
huống đó đòi hỏi hành động trái ngược nhau (một cần đưa vào hàng đợi nhập liệu, một đã là hồ sơ
hoàn chỉnh không cần làm gì thêm). Nhu cầu tính chỉ số **"% độ đầy đủ hồ sơ"** trung thực (dùng ở
màn Báo cáo–Thống kê và Kiểm kê) càng đòi hỏi phân biệt rõ ràng, vì gộp lẫn sẽ làm chỉ số vừa trừ
điểm oan những hồ sơ đã xử lý đúng cách, vừa không tạo được việc cho những hồ sơ thực sự còn thiếu.

## Quyết định

Thay ô trống bằng một **bộ từ vựng khuyết giá trị (controlled vocabulary)** gồm 5 mã:
`KHONG_AP_DUNG` (trường không có nghĩa với loại đối tượng này), `CHUA_XAC_DINH` (giá trị thật tồn
tại, chưa nghiên cứu/xác minh được — là việc cần làm), `KHONG_RO` (đã tra cứu, kết luận không thể
biết — hồ sơ đã hoàn chỉnh), `CHUA_NHAP` (có ở hồ sơ giấy, chưa nhập vào hệ thống — là việc cần
làm), `HAN_CHE` (có giá trị nhưng không công bố vì bảo mật/dữ liệu cá nhân). Mỗi mã kéo theo hành
vi hệ thống khác nhau: có/không vào hàng đợi công việc (nghiên cứu/thẩm định hoặc nhập liệu), có/
không tính vào mẫu số của "% độ đầy đủ hồ sơ", có/không xuất ra API công khai. Trường bắt buộc
phải có giá trị hoặc mã khuyết giá trị + lý do (`ghiChuKhuyet`); không cho lưu khi bỏ trống. Nhập
lô Excel: ô trống mặc định thành `CHUA_NHAP`, không nhập thành rỗng.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Chỉ số "% độ đầy đủ hồ sơ" trở nên trung thực — mẫu số loại trừ trường không áp
dụng, và một hồ sơ ghi "Không rõ" đúng cách không bị trừ điểm chất lượng. UI phân biệt rõ "đã xử
lý, không rõ" với "quên nhập" bằng nhãn hiển thị khác nhau, không còn ô trắng mơ hồ.

**Tiêu cực:** Form nhập liệu phức tạp hơn — mỗi trường có thể trống cần thêm nút chọn nhanh trạng
thái khuyết (4 lựa chọn) thay vì để trống đơn giản; tăng chi phí phát triển UI và đào tạo người
dùng nhận biết khi nào dùng mã nào.

**Rủi ro:** Nhập lô Excel nếu xử lý sai quy tắc mặc định `CHUA_NHAP` sẽ làm sai lệch hàng đợi
nhập liệu hoặc chỉ số đầy đủ hồ sơ. `CHUA_XAC_DINH`/`KHONG_RO` bắt buộc kèm `ghiChuKhuyet` nhưng
không có gì ngăn người dùng nhập ghi chú vô nghĩa để qua ràng buộc — kiểm soát chất lượng ghi chú
vẫn phụ thuộc thẩm định thủ công.

## Phương án đã cân nhắc và lý do loại

- **Giữ ô trống tự do hoặc "N/A" tự do**: loại vì không phân biệt được các trường hợp đòi hỏi
  hành động khác nhau — đây chính là vấn đề bị phát hiện dẫn tới quyết định này.
- **Boolean "đã đầy đủ" theo từng bản ghi thay vì theo từng trường**: loại vì độ chi tiết không
  đủ để sinh đúng hàng đợi công việc theo từng trường thiếu cụ thể.
- **Gộp `KHONG_RO` và `CHUA_XAC_DINH` thành một mã "không biết"**: loại vì một cái là việc đã
  xong (không tính nợ), một cái là việc chưa làm (vào hàng đợi nghiên cứu) — gộp lại sẽ làm sai
  cả hàng đợi công việc lẫn "% độ đầy đủ hồ sơ".

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục 0quinquies
- `docs/07-mo-hinh-du-lieu.md` mục 5.14–5.15 (`field_missing_status`)
- `app/src/data/missingValues.ts`
