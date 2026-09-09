# 0012. Nhật ký append-only; thời hạn lưu theo cấp độ ATTT được phê duyệt

## Bối cảnh

Đơn vị vận hành là **đơn vị sự nghiệp công lập**, không thuộc Điều 2 NĐ 278/2025 (tuân thủ qua Sở
VH&TT/UBND TP), và **không** thuộc phạm vi áp dụng của NĐ 53/2022/NĐ-CP — nghị định này chỉ áp
dụng doanh nghiệp viễn thông/Internet, thời hạn lưu 12/24 tháng của nó không phải căn cứ pháp lý
cho hệ thống này. Căn cứ đúng là **TCVN 11930:2017** (dẫn chiếu bởi TT 12/2022/TT-BTTTT Điều 9
khoản 1): thời hạn lưu nhật ký hệ thống tối thiểu theo cấp độ an toàn thông tin đã được phê duyệt
— cấp độ 2 ≥ 1 tháng, cấp độ 3 ≥ 3 tháng, cấp độ 4 ≥ 6 tháng, cấp độ 5 ≥ 12 tháng — không phải một
con số cố định chung cho mọi hệ thống.

## Quyết định

Nhật ký hệ thống (`audit_log`) **chỉ ghi thêm (append-only)**: tạo chuỗi băm nối tiếp
`prev_hash`/`record_hash` (mỗi bản ghi băm nội dung + hash bản ghi liền trước), không có thao tác
`UPDATE`/`DELETE` ở tầng ứng dụng lẫn quyền cơ sở dữ liệu, kể cả với vai trò Quản trị. Trường
`retention_until` **không dùng con số cố định 12 tháng**, mà tính theo cấp độ an toàn thông tin đã
được phê duyệt chính thức cho hệ thống, theo TCVN 11930:2017. NĐ 53/2022/NĐ-CP được nêu rõ là
**không áp dụng** cho đơn vị sự nghiệp công lập như Trung tâm, không dùng làm căn cứ trong bất kỳ
tài liệu hay UI nào.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Chuỗi băm nối tiếp phát hiện được can thiệp dữ liệu nhật ký mà không cần hạ tầng
blockchain. Thời hạn lưu đúng pháp lý áp dụng cho đơn vị sự nghiệp công lập, tránh trích dẫn sai
NĐ 53/2022 — một lỗi dễ bị hội đồng pháp lý bắt ngay khi rà soát hồ sơ.

**Tiêu cực:** `retention_until` phụ thuộc vào việc cấp độ ATTT của hệ thống đã được phê duyệt
chính thức (qua hồ sơ cấp độ) — nếu cấp độ chưa được phê duyệt, thời hạn lưu cụ thể chưa xác định
được, khác với cách tiếp cận "biết ngay một con số cố định".

**Rủi ro:** Nếu hệ thống sau này được nâng/hạ cấp độ ATTT, cần quy trình cập nhật lại
`retention_until` cho các bản ghi log cũ đã tính theo cấp độ trước đó — hiện chưa có đặc tả cho
tình huống này.

## Phương án đã cân nhắc và lý do loại

- **Dùng con số cố định 12 tháng theo cách hiểu NĐ 53/2022**: loại vì NĐ 53/2022 chỉ áp dụng
  doanh nghiệp viễn thông/Internet, không áp dụng đơn vị sự nghiệp công lập — trích dẫn sai sẽ bị
  hội đồng pháp lý bắt lỗi ngay và làm giảm uy tín toàn bộ phần tuân thủ của hồ sơ.
- **Cho phép sửa/xóa log qua giao diện Quản trị khi cần "dọn dẹp"**: loại vì phá vỡ tính bất biến
  cần thiết để chứng minh khả năng truy vết theo Điều 13 NĐ 278/2025.
- **Dùng chữ ký số thay vì chuỗi băm nối tiếp để bảo đảm toàn vẹn**: loại vì phức tạp hơn, cần hạ
  tầng PKI cho một mục tiêu chỉ cần phát hiện chỉnh sửa (tamper-evidence) — hash-chain đủ nhẹ và
  đủ hiệu quả cho mục tiêu này.

## Liên kết

- `docs/07-mo-hinh-du-lieu.md` mục 4.5 (`audit_log`), 5.9
- `docs/02-quy-trinh-bao-quan-sao-luu.md` mục 1.4 (căn cứ pháp lý, loại trừ NĐ 53/2022)
- `docs/00-ke-hoach-nang-cap.md` mục 0.3, B6
- `docs/01-thuyet-minh-ky-thuat.md` mục 9.6
