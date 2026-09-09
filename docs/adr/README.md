# Architecture Decision Records (ADR)

## ADR là gì

Một ADR (Architecture Decision Record) ghi lại **một quyết định kiến trúc/thiết kế có ý nghĩa**
tại thời điểm đưa ra: bối cảnh buộc phải quyết định, nội dung quyết định, hệ quả (kể cả mặt tiêu
cực và rủi ro), và các phương án khác đã bị loại kèm lý do. Mục đích không phải ghi lại *mọi*
quyết định, mà ghi lại những quyết định mà nếu không có tài liệu này, người đọc sau (kể cả chính
nhóm dự án sau vài tháng) sẽ phải đoán lại "tại sao lại làm thế này mà không làm thế kia" — đặc
biệt khi lựa chọn đó không hiển nhiên hoặc từng gây tranh cãi.

Bộ 20 ADR dưới đây dùng định dạng Michael Nygard (chuẩn phổ biến nhất): mỗi ADR là một file
Markdown độc lập, gồm Bối cảnh · Quyết định · Trạng thái · Hệ quả · Phương án đã cân nhắc và lý do
loại · Liên kết. Toàn bộ ghi lại các quyết định **có thật** đã được chốt trong quá trình xây dựng
hệ thống quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám, phần lớn chốt ngày 12/08/2026 cùng đợt với
`docs/00-ke-hoach-nang-cap.md`.

## Quy ước đánh số và thay thế

- Đánh số tuần tự 4 chữ số, không tái sử dụng số đã cấp (`0001`, `0002`, …), kể cả khi một ADR bị
  thay thế.
- Tên file: `NNNN-tieu-de-khong-dau.md` — tiêu đề rút gọn, không dấu, cách nhau bằng `-`.
- Khi một quyết định cũ bị thay đổi: **không sửa lại nội dung ADR cũ**. Tạo ADR mới với số tiếp
  theo, trong đó nêu rõ nó thay thế ADR nào; đồng thời cập nhật mục **Trạng thái** của ADR cũ
  thành `Thay thế bởi 00XX` (kèm liên kết) thay vì xóa hoặc sửa nội dung — giữ nguyên lịch sử lập
  luận tại thời điểm quyết định cũ được đưa ra.
- Trạng thái hợp lệ: `Đã chấp nhận`, `Thay thế bởi NNNN`. (Chưa dùng `Đang xem xét`/`Bị từ chối`
  cho bộ 20 ADR này — toàn bộ đã là quyết định đã chốt; 0001–0017 đang áp dụng trong mã nguồn, 0018
  là quyết định về giai đoạn xây dựng dịch vụ thật, chưa có mã tương ứng.)

## Bảng chỉ mục

| # | Tiêu đề | Trạng thái | Ngày | Tài liệu nguồn liên quan |
|---|---|---|---|---|
| [0001](0001-kien-truc-thong-tin-theo-ban-thiet-ke-v3.md) | Kiến trúc thông tin theo bản thiết kế v3, không theo wireframe hồ sơ thầu | Đã chấp nhận | 12/08/2026 | `docs/00`, `docs/03` |
| [0002](0002-react-vite-lop-dich-vu-gia-lap.md) | React + Vite với lớp dịch vụ giả lập tách rời, chưa làm backend | Đã chấp nhận | 12/08/2026 | `docs/01` ch.6 |
| [0003](0003-tach-truc-objectclass-va-digitalform.md) | Tách hai trục `objectClass` × `digitalForm` | Đã chấp nhận | 12/08/2026 | `docs/00`, `docs/07` |
| [0004](0004-he-thong-ma-dinh-danh-5-tang.md) | Hệ thống mã định danh 5 tầng, không mã hóa thuộc tính khả biến | Đã chấp nhận | 12/08/2026 | `docs/00`, `docs/07` |
| [0005](0005-bo-5-ma-khuyet-gia-tri.md) | Bộ 5 mã khuyết giá trị thay ô trống | Đã chấp nhận | 12/08/2026 | `docs/00`, `docs/07` |
| [0006](0006-nien-dai-hai-lop-edtf.md) | Niên đại hai lớp: EDTF + chuỗi hiển thị nguyên văn + độ tin cậy | Đã chấp nhận | 12/08/2026 | `docs/00`, `docs/07` |
| [0007](0007-bang-do-lap-lai-theo-cidoc-crm-e54.md) | Bảng đo lặp lại theo CIDOC-CRM E54 / Spectrum 5.0 | Đã chấp nhận | 12/08/2026 | `docs/00` |
| [0008](0008-tach-haspreservationsurrogate-khoi-derivedfrom.md) | Tách `hasPreservationSurrogate` khỏi `derivedFrom` | Đã chấp nhận | 12/08/2026 | `docs/07`, `docs/02` |
| [0009](0009-danh-sach-doi-tuong-tu-physical-objects.md) | Danh sách đối tượng lấy từ `PHYSICAL_OBJECTS`, không suy từ bản ghi số | Đã chấp nhận | 12/08/2026 | `docs/00` |
| [0010](0010-hoan-tac-hai-tang.md) | Hoàn tác hai tầng: nhanh trước khi chốt, có lý do sau khi chốt | Đã chấp nhận | 12/08/2026 | `docs/00` |
| [0011](0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md) | Nguyên tắc bốn mắt; tách quyền Phê duyệt khỏi Xuất bản | Đã chấp nhận | 12/08/2026 | `docs/00` |
| [0012](0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md) | Nhật ký append-only; thời hạn lưu theo cấp độ ATTT (TCVN 11930:2017) | Đã chấp nhận | 12/08/2026 | `docs/07`, `docs/02` |
| [0013](0013-bien-chu-de-root-modal-qua-portal.md) | Biến chủ đề ở `:root`; modal render qua portal ra `document.body` | Đã chấp nhận | 12/08/2026 | mã nguồn `app/src/` |
| [0014](0014-chi-trich-dan-van-ban-phap-ly-da-xac-minh.md) | Chỉ trích dẫn văn bản pháp lý đã xác minh nguyên văn | Đã chấp nhận | 12/08/2026 | `docs/00`, `docs/03` |
| [0015](0015-i18n-tach-lop.md) | i18n tách lớp: `vi` hoàn chỉnh, `en`/`fr` sinh tự động | Đã chấp nhận | 12/08/2026 | `docs/00`, `docs/01` |
| [0016](0016-averagecompletenesspct-tra-null-cho-tap-rong.md) | `averageCompletenessPctOrNull` trả `null` cho tập rỗng, không phải 100% | Đã chấp nhận | 12/08/2026 | mã nguồn `app/src/` |
| [0017](0017-ma-tran-phan-quyen-mot-nguon-va-quy-tac-phan-tach-nhiem-vu.md) | Ma trận phân quyền một nguồn; quy tắc phân tách nhiệm vụ nằm trong mã | Đã chấp nhận | 12/08/2026 | `docs/07` mục 5.8, `docs/09` YC-PCN-27 |
| [0018](0018-php-laravel-cho-lop-dich-vu-ung-dung.md) | PHP + Laravel cho lớp dịch vụ ứng dụng; lớp trình diễn giữ nguyên React | Đã chấp nhận | 13/08/2026 | `docs/01` mục 6.2, `docs/06`, `docs/08` mục 4.2 và 4.4 |
| [0019](0019-nhung-gs-immersive-tour-qua-iframe.md) | Nhúng ứng dụng GS Immersive Tour qua iframe, không hợp nhất mã nguồn | Đã chấp nhận | 13/08/2026 | `docs/16` mục 3.5 |
| [0020](0020-tro-giup-tra-cuu-thay-bang-tuyen-bo-tuan-thu.md) | Trang Tuân thủ đổi hệ hình: hướng dẫn tra cứu thay cho tuyên bố tuân thủ | Đã chấp nhận | 13/08/2026 | `docs/01` mục pháp lý, `docs/03` |

## Cách đọc bộ ADR này

Các ADR không độc lập hoàn toàn với nhau — một số nhóm quyết định cùng gốc rễ nghiệp vụ:

- **0003, 0004, 0006, 0007, 0008, 0009** đều xuất phát từ mô hình dữ liệu CIDOC-CRM/OAIS trong
  `docs/07-mo-hinh-du-lieu.md` — nên đọc cùng nhau khi cần hiểu tổng thể vì sao mô hình dữ liệu có
  hình dạng như hiện tại.
- **0005, 0006** (khuyết giá trị, niên đại) và **0016** (completeness trả null) cùng phục vụ một
  mục tiêu: chỉ số "% độ đầy đủ hồ sơ" và báo cáo tiến độ số hóa phải trung thực, không đọc ngược.
- **0010, 0011, 0012, 0017** cùng thuộc nhóm kiểm soát tuân thủ/quy trình (hoàn tác có kiểm soát,
  bốn mắt, nhật ký bất biến, phân tách nhiệm vụ trong ma trận phân quyền) — nguồn chung là các phát
  hiện red-team và yêu cầu pháp lý ATTT/DSVH. **0017** biến các quy tắc mà 0011 và 0012 phát biểu
  bằng lời thành ràng buộc chạy được trong mã và có kiểm thử.
- **0001, 0002, 0014, 0015** là các quyết định về phạm vi và ranh giới giai đoạn 1 — nên đọc trước
  tiên khi mới tiếp cận dự án, để hiểu vì sao app hiện tại có hình dạng như vậy so với cả wireframe
  hồ sơ thầu lẫn kiến trúc đích đầy đủ trong thuyết minh kỹ thuật.
- **0002 và 0018** là một cặp đọc liền: 0002 quyết định *giai đoạn demo chưa làm backend và ranh
  giới lớp dịch vụ phải giữ*, 0018 trả lời phần bỏ ngỏ *khi làm backend thật thì làm bằng gì*
  (PHP + Laravel), đồng thời khẳng định lớp trình diễn React không đổi. 0018 **bổ sung** cho 0002,
  không thay thế — đây là ADR đầu tiên nói về giai đoạn sau demo.
- **0013** là quyết định kỹ thuật thuần túy (CSS/DOM), độc lập với các nhóm còn lại.
