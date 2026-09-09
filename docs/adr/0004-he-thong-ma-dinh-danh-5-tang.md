# 0004. Mã định danh 5 tầng, không mã hóa thuộc tính khả biến vào mã

## Bối cảnh

Hệ thống cần một mã định danh bền vững cho cả đối tượng di sản lẫn từng bản ghi dữ liệu số, các
phiên bản và tệp dẫn xuất của nó. Chính đợt rà soát dẫn tới quyết định này đã phát hiện và phải
hiệu đính **4 bản ghi sai vị trí** (tượng Khổng Tử, tượng Chu Văn An, chuông Bích Ung, khánh đá) —
bằng chứng thực chứng cho thấy nếu vị trí/trạng thái từng được mã hóa vào định danh, sửa vị trí sẽ
đồng nghĩa đổi mã, phá vỡ mọi liên kết và trích dẫn đã phát hành. Đồng thời, QĐ 611/QĐ-TTg
(04/4/2026) đặt chỉ tiêu "80% di sản văn hóa số công có mã định danh số để xác lập quyền sở hữu,
kiểm soát khai thác", và TT 05/2025/TT-BNV yêu cầu "mã định danh" trong metadata gói SIP/AIP/DIP.

## Quyết định

Áp dụng bốn nguyên tắc bắt buộc: (1) mã bền vững, không tái sử dụng kể cả khi bản ghi bị thu hồi;
(2) **không mã hóa thuộc tính khả biến** (vị trí, phân khu, trạng thái, người phụ trách) vào mã —
vị trí là metadata, không phải khóa; (3) tách định danh nội bộ khỏi số kiểm kê/đăng ký gốc của
Trung tâm (hai trường riêng, neo với nhau theo Điều 23 Luật DSVH); (4) độ dài cố định, chữ hoa,
sắp xếp đúng thứ tự tự nhiên, phân tách bằng `-` (cấp) và `.` (nhánh).

Cấu trúc 5 tầng: (1) đối tượng di sản `VM-<OC>-NNNNN`; (2) bản ghi dữ liệu số
`…-NNNNN.<DF><nn>`; (3) phiên bản `….v<n>`; (4) tệp dẫn xuất `…#<role>`; (5) đợt số hóa
`VM-DS-<YYYY>-<nn>`. `OC` (2 ký tự) và `DF` (3 ký tự) là bảng mã cố định theo hai trục ADR 0003.
Trường song song `so_kiem_ke`/`so_dang_ky`/`ma_ho_so_di_tich`/`pid_quoc_gia` không trộn vào mã hệ
thống. Tìm kiếm chấp nhận cả mã đầy đủ lẫn rút gọn, không phân biệt hoa/thường, bỏ qua `-`/`.`.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Sửa vị trí/trạng thái không bao giờ phá mã hay liên kết đã phát hành ra ngoài; đáp
ứng trực tiếp chỉ tiêu mã định danh số của QĐ 611/QĐ-TTg. Mã có cấu trúc đọc được (human-readable)
giúp cán bộ nhận diện nhanh loại đối tượng/dạng dữ liệu chỉ qua chuỗi mã.

**Tiêu cực:** Mã dài và nhiều tầng hơn một UUID đơn giản; người dùng cần học cấu trúc 5 tầng và ý
nghĩa từng phần trước khi đọc thành thạo.

**Rủi ro:** Hiện mock mới hiện thực đầy đủ tầng 1–2 (`app/src/utils/assetCode.ts`); tầng 3 (phiên
bản), tầng 4 (tệp dẫn xuất `#role`) và tầng 5 (đợt số hóa) là phần mở rộng roadmap, chưa có store
riêng — nếu triển khai muộn, một số nghiệp vụ (versioning, quản lý đợt số hóa/nhà thầu) phải chắp
vá tạm thời cho tới khi có đủ ba tầng còn lại.

## Phương án đã cân nhắc và lý do loại

- **Mã hóa vị trí/phân khu vào mã (cách làm cũ)**: loại — đã gây đúng lỗi thật (4 bản ghi sai vị
  trí phải hiệu đính) là bằng chứng trực tiếp cho quyết định ngược lại.
- **Dùng UUID ngẫu nhiên không cấu trúc**: loại vì mất khả năng đọc/sắp xếp tự nhiên, và không
  đáp ứng yêu cầu "mã định danh số" có cấu trúc mà QĐ 611/QĐ-TTg hướng tới.
- **Tái sử dụng số kiểm kê hiện vật gốc làm mã hệ thống**: loại vì hai mã có nguồn gốc và mục
  đích khác nhau — mã hệ thống do phần mềm tự sinh để định danh kỹ thuật, số kiểm kê do quy trình
  kiểm kê bảo tàng học cấp và tồn tại độc lập với việc đối tượng đã được số hóa hay chưa.

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục 0quater
- `docs/07-mo-hinh-du-lieu.md` mục 2.4, 5.13
- `app/src/utils/assetCode.ts` (hàm cấu tạo mã tầng 1/2/4)
- `app/src/data/taxonomy.ts` (`OBJECT_CLASS_CODE_PREFIX`, `DIGITAL_FORM_CODE`)
