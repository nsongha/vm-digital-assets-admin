# 0017. Ma trận phân quyền một nguồn; quy tắc phân tách nhiệm vụ nằm trong mã

## Bối cảnh

Ba vấn đề cùng phát hiện ngày 12/08/2026 khi rà lại màn Người dùng & phân quyền.

**Một — ma trận không có lối vào.** Ma trận phân quyền đã được xây ở màn Chi tiết người dùng
(`/users/:email`), nhưng bảng danh sách người dùng không bấm được và không màn nào liên kết tới
route đó. Chức năng tồn tại trong mã nhưng không tồn tại với người dùng — đúng câu hỏi mà chủ đầu
tư đặt ra: "hình như chưa có ma trận phân quyền user?".

**Hai — hai bảng chính sách song song, đã lệch nhau.** `context/AuthContext.tsx` giữ một bảng
`CAPS` gõ tay (`read`/`write`/`approve`/`publish`/`admin` theo vai trò) để ẩn/hiện menu, trong khi
`UserDetailPage.tsx` giữ một `buildMatrix()` riêng cho ma trận vai trò × module × quyền. Hai bảng
mô tả **cùng một chính sách** nhưng độc lập nhau, và đã thực sự mâu thuẫn: ma trận cấp cho vai trò
Quản trị **toàn bộ** quyền kể cả Duyệt và Xuất bản, còn `CAPS` ghi `approve: false, publish: false`
cho chính vai trò đó. Không có gì báo lỗi — cả hai đều biên dịch sạch.

**Ba — chính sách chỉ nằm trong đầu người cấu hình.** Ma trận là 48 ô checkbox tự do. Không có gì
ngăn một người cấp cho cùng một vai trò cả quyền Tạo/Sửa lẫn quyền Duyệt trên cùng module (phá
nguyên tắc bốn mắt của [ADR-0011](0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md)), hay cấp
quyền sửa/xóa nhật ký hoạt động (phá tính bất biến của nhật ký theo
[ADR-0012](0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md)). Các quy định đó có trong
tài liệu nhưng không có trong phần mềm.

## Quyết định

**Gom toàn bộ chính sách phân quyền về một file duy nhất** `app/src/data/permissions.ts`: danh mục
module và quyền, ma trận mặc định theo vai trò, quy tắc khóa ô, quy tắc phân tách nhiệm vụ, phạm vi
ABAC. Ba nơi tiêu thụ — màn Chi tiết người dùng, hộp thoại Thêm người dùng, và `AuthContext` — đều
đọc từ đó. `Capabilities` trong `AuthContext` **không còn được khai báo lại**: nó được suy ra từ
ma trận bằng `capsFromMatrix()`, nên không thể lệch.

**Phân biệt ba hạng ràng buộc**, mỗi hạng có một cách thể hiện riêng trên giao diện:

| Hạng | Nghĩa | Thể hiện | Ví dụ |
|---|---|---|---|
| **Khóa cứng** (`lockReason`) | Không vai trò nào được, kể cả Quản trị | Ô hiển thị ✕, không tick được, di chuột hiện lý do | Sửa/Xóa nhật ký hoạt động |
| **Xung đột** (`policyViolations`) | Từng quyền hợp lệ, nhưng **cặp** quyền thì không | Ô viền đỏ, nêu lý do, **chặn lưu** | Vừa Tạo/Sửa vừa Duyệt cùng một module |
| **Hệ quả** (`toggleCell`) | Ràng buộc logic tự áp dụng | Tự bật/tắt ô liên quan | Bật bất kỳ quyền nào ⇒ tự bật Xem |

**Bốn quy tắc phân tách nhiệm vụ được cài vào mã**, không chỉ ghi trong quy chế:

1. **SOD_TAO_DUYET** — trên module nội dung (Dữ liệu số hóa, Nhập dữ liệu, Bộ sưu tập), một vai
   trò không được vừa có `Tạo/Sửa` vừa có `Duyệt` hoặc `Xuất bản`.
2. **XOA_KHONG_QUAN_TRI** — quyền `Xóa` chỉ cấp kèm quyền `Quản trị` của cùng module.
3. **TU_NANG_QUYEN** — người có `Quản trị` trên module Người dùng không được đồng thời có `Duyệt`
   hoặc `Xuất bản` trên Dữ liệu số hóa. Đây là đường tự nâng quyền kinh điển: người tự cấp được
   quyền cho mình mà lại duyệt được nội dung thì mọi kiểm soát còn lại đều vô hiệu.
4. **Khóa cứng nhật ký** — không vai trò nào sửa hoặc xóa được bản ghi nhật ký hoạt động; tương tự
   với hồ sơ tuân thủ (chứng cứ pháp lý) và biên bản kiểm kê đã chốt (chỉ điều chỉnh có lý do).

**Ma trận nằm ngay trong biểu mẫu tạo tài khoản**, không phải một màn cấu hình riêng sau khi tài
khoản đã tồn tại: tài khoản tạo trước rồi phân quyền sau luôn có một khoảng thời gian sống với
quyền chưa xác định. Tài khoản mới vào trạng thái **Chờ phê duyệt**, cần một quản trị viên khác
kích hoạt — người tạo không tự kích hoạt tài khoản mình vừa cấp quyền.

**Mọi thay đổi phân quyền đi qua bước xác nhận có lý do.** Tick một ô không lập tức thành quyền
thật: bản nháp và bản có hiệu lực tách riêng, thanh "có thay đổi chưa lưu" cho phép hoàn tác, và
bước lưu bắt buộc nhập lý do — lý do đi vào lịch sử phân quyền, không sửa được về sau.

**Bảng được nhóm theo cột và theo hàng để chính sách tự hiện ra khi đọc.** Cột chia bốn nhóm —
*Đọc* · *Biên tập* · *Phê duyệt & công bố* · *Quản trị* — có vạch ngăn dọc; hàng chia hai dải —
*Nghiệp vụ* · *Quản trị & tuân thủ*. Thứ tự nhóm trùng thứ tự khai báo `PERMISSIONS`/`MODULES` nên
vạch ngăn luôn rơi đúng chỗ. Hệ quả: vai trò nội dung lấp đầy hai nhóm cột bên trái, vai trò Phê
duyệt lấp nhóm giữa, vai trò Quản trị lấp nhóm phải — **ba vùng gần như không chồng lên nhau**.
Người chấm nhìn một cái là thấy nguyên tắc bốn mắt, không cần đọc chú thích.

### Ma trận mặc định theo vai trò

`X` = được cấp · `✕` = khóa cứng theo chính sách · ô trống = không cấp.

| Module | Quản trị | Kỹ thuật số hóa | Biên tập | Phê duyệt | Chỉ xem |
|---|---|---|---|---|---|
| Dữ liệu số hóa | Xem, Tạo/Sửa, Xóa, Quản trị | Xem, Tạo/Sửa | Xem, Tạo/Sửa | Xem, Duyệt, Xuất bản | Xem |
| Nhập dữ liệu | Xem, Tạo/Sửa, Xóa, Quản trị | Xem, Tạo/Sửa | Xem, Tạo/Sửa | Xem | — |
| Bộ sưu tập | Xem, Tạo/Sửa, Xóa, Quản trị | Xem | Xem, Tạo/Sửa | Xem | Xem |
| Kiểm kê | Xem, Tạo/Sửa, Quản trị (Xóa ✕) | Xem | Xem | Xem | Xem |
| Người dùng | Xem, Tạo/Sửa, Xóa, Quản trị | — | — | — | — |
| Nhật ký | Xem, Quản trị (Tạo/Sửa ✕, Xóa ✕) | — | — | Xem | Xem |
| Kết nối & chia sẻ | Xem, Tạo/Sửa, Xóa, Quản trị | — | — | — | — |
| Tuân thủ | Xem, Tạo/Sửa, Quản trị (Xóa ✕) | — | — | Xem | — |

Điểm đáng chú ý nhất của bảng này: **vai trò Quản trị không có quyền Duyệt và Xuất bản nội dung.**
Quản trị hệ thống quản lý tài khoản, khóa API, cấu hình kết nối — không thẩm định nội dung chuyên
môn và không quyết định công bố. Đây là chỗ ma trận cũ sai và `CAPS` đúng; bản hợp nhất theo `CAPS`.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Chính sách phân quyền có một nguồn duy nhất, được kiểm chứng bằng `npm test`
(`app/tests/permissions.test.ts`, 11 ca) — sửa một ô trong ma trận mặc định mà vi phạm quy tắc sẽ
làm hỏng bộ kiểm thử thay vì lặng lẽ cấp thêm quyền. Bảng tham chiếu theo vai trò hiện ngay tại màn
Người dùng nên hội đồng chấm thầu và cán bộ thanh tra đọc được chính sách mà không phải mở hồ sơ
một tài khoản cụ thể nào.

**Tiêu cực:** Quy tắc phân tách nhiệm vụ khiến một số cấu hình hợp lý trong đơn vị nhỏ trở nên
không cấu hình được — ví dụ một cơ quan chỉ có hai cán bộ, muốn một người vừa biên mục vừa duyệt.
Hệ thống buộc phải có ít nhất hai người cho luồng xuất bản. Đây là lựa chọn có chủ ý (kiểm soát
tuân thủ quan trọng hơn tiện lợi vận hành), nhưng cần nêu rõ khi đào tạo để không bị hiểu là lỗi.

**Rủi ro:** Toàn bộ kiểm soát này hiện nằm ở tầng giao diện (mock, chưa có backend — xem
[ADR-0002](0002-react-vite-lop-dich-vu-gia-lap.md)). Khi triển khai backend thật, `permissions.ts`
phải trở thành nguồn dùng chung cho cả server, và mọi quy tắc phải được kiểm lại tại API; nếu không,
chúng bị vượt qua bằng cách gọi thẳng API. Yêu cầu này đã ghi tại YC-PCN-27 trong
`docs/09-dac-ta-yeu-cau-srs.md`.

**Rủi ro thứ hai:** route `/users` hiện chưa chặn theo quyền ở tầng điều hướng — mục menu bị ẩn với
vai trò không đủ quyền, nhưng gõ thẳng URL vẫn vào được màn. Đã ghi vào
`docs/16-van-de-da-biet.md`; chỉ khắc phục triệt để được khi có backend thật kiểm quyền.

## Phương án đã cân nhắc và lý do loại

- **Giữ hai bảng (`CAPS` và `buildMatrix`) nhưng thêm một kiểm thử đối chiếu**: loại vì vẫn phải
  duy trì hai nơi cho một chính sách; kiểm thử chỉ phát hiện lệch *sau khi* đã lệch, còn suy ra từ
  một nguồn thì không thể lệch.
- **Cho phép tick tự do, chỉ cảnh báo mềm khi vi phạm phân tách nhiệm vụ**: loại vì cùng lý do đã
  loại cảnh báo mềm ở [ADR-0011](0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md) — kiểm soát
  tuân thủ mà bỏ qua được thì không phải kiểm soát.
- **Vô hiệu hóa checkbox khi phát sinh xung đột thay vì chặn ở bước lưu**: loại vì xung đột là
  quan hệ giữa **hai ô**, không thuộc riêng ô nào — vô hiệu hóa ô thứ hai buộc người dùng phải đoán
  ô nào đang chặn, trong khi thông báo ở bước lưu nêu được cả cặp và lý do.
- **Đặt ma trận ở một bước riêng sau khi tạo tài khoản (wizard nhiều bước)**: loại vì tạo ra khoảng
  thời gian tài khoản tồn tại với quyền chưa xác định, và vì người tạo có thể bỏ dở giữa chừng.
- **Dùng checkbox vô hiệu hóa cho bảng tham chiếu chỉ đọc**: loại. Checkbox mời người ta bấm, trong
  khi bảng tham chiếu không bấm được; tệ hơn, checkbox `disabled` làm ô "có quyền" nhạt đi gần bằng
  ô "không có quyền" — hỏng đúng việc bảng sinh ra để làm. Bảng chỉ đọc dùng khối đặc màu nhấn cho
  "có quyền" và chấm mờ cho "không có quyền"; chỉ chế độ sửa được mới dùng checkbox thật.
- **Cho vai trò Quản trị toàn quyền (kể cả Duyệt/Xuất bản) cho tiện vận hành**: loại vì phá chính
  nguyên tắc bốn mắt mà hệ thống cam kết, và mở đường tự nâng quyền — người quản trị tài khoản tự
  cấp quyền cho mình rồi tự duyệt nội dung.

## Liên kết

- `app/src/data/permissions.ts` (toàn bộ chính sách)
- `app/src/components/PermissionMatrixTable.tsx` (bảng dùng chung ba nơi)
- `app/src/components/AddUserModal.tsx` (ma trận trong biểu mẫu tạo tài khoản)
- `app/src/pages/UsersPage.tsx` (bảng tham chiếu theo vai trò; hàng dẫn sang hồ sơ)
- `app/src/pages/UserDetailPage.tsx` (nháp/lưu có lý do, lịch sử phân quyền)
- `app/src/context/AuthContext.tsx` (`capsForRole`, không còn bảng `CAPS` gõ tay)
- `app/tests/permissions.test.ts` (11 ca khóa bất biến chính sách)
- [ADR-0011](0011-nguyen-tac-bon-mat-tach-phe-duyet-xuat-ban.md) — nguyên tắc bốn mắt theo danh
  tính; ADR này bổ sung tầng thứ hai theo vai trò, không thay thế
- [ADR-0012](0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md) — nhật ký append-only,
  nguồn của quy tắc khóa cứng
- [ADR-0013](0013-bien-chu-de-root-modal-qua-portal.md) — `Modal` nay render qua portal ngay tại
  component thay vì ở từng nơi gọi
- `docs/07-mo-hinh-du-lieu.md` mục 5.8 (`role_permission`, `user_collection_scope`)
- `docs/09-dac-ta-yeu-cau-srs.md` YC-PCN-27 (thực thi lại ở tầng dịch vụ)
