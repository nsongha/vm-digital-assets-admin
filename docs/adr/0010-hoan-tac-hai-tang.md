# 0010. Hoàn tác hai tầng: nhanh trước khi chốt, có lý do sau khi chốt

## Bối cảnh

Rà soát màn Kiểm kê định kỳ phát hiện thao tác xác nhận không có cách hoàn tác — lỗi nghiệp vụ vì
bắt người dùng trả giá cho một cú bấm nhầm khi đối chiếu kiểm kê, đánh dấu khớp/lệch, gán trạng
thái. Nhưng giải pháp không thể là "hoàn tác được mọi thứ, mọi lúc": một khi biên bản kiểm kê đã
chốt/ký, nó là **chứng cứ pháp lý** (Điều 23 Luật Di sản văn hóa 45/2024 — nghĩa vụ kiểm kê định
kỳ); cho phép xóa/sửa ngầm sau khi chốt sẽ phá giá trị pháp lý của biên bản đó.

## Quyết định

Tách hai tầng, áp dụng cho toàn app: **Tầng 1 — thao tác nhập liệu, chưa chốt**: hoàn tác nhanh,
mỗi thao tác hiện thông báo kèm nút "Hoàn tác" (cửa sổ ~10 giây), và trong đợt chưa chốt luôn sửa
lại được trực tiếp. **Tầng 2 — sau khi chốt/ký biên bản**: không hoàn tác, chỉ "điều chỉnh có lý
do" — bản ghi gốc giữ nguyên, tạo thêm bản điều chỉnh có lý do + người thực hiện + thời điểm, cả
hai cùng hiển thị trong lịch sử. Quy tắc chung cho nút xác nhận: nhập liệu đảo ngược được → làm
ngay + hoàn tác; ảnh hưởng nhiều bản ghi (nhập lô, chốt đợt) → modal xác nhận nêu rõ số lượng ảnh
hưởng; có giá trị pháp lý/đã công bố → không hoàn tác, bắt nhập lý do, tạo bản điều chỉnh, ghi
nhật ký.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Không phạt người dùng vì bấm nhầm ở thao tác nhập liệu thường, đồng thời giữ nguyên
giá trị pháp lý của biên bản kiểm kê đã chốt — cùng nguyên tắc bản ghi bất biến/append-only đã áp
dụng ở nơi khác trong app (Gỡ xuất bản, Trả lại bổ sung đều bắt nhập lý do).

**Tiêu cực:** Hai cơ chế khác nhau cần cả UI lẫn dữ liệu hỗ trợ riêng (toast + API hoàn tác cho
tầng 1, mô hình bản-ghi-điều-chỉnh cho tầng 2) — tăng độ phức tạp cài đặt so với một cơ chế hoàn
tác chung duy nhất.

**Rủi ro:** Nếu ranh giới "đã chốt" không thể hiện đủ rõ ở UI, người dùng có thể nhầm tưởng vẫn
sửa trực tiếp được sau khi chốt, dẫn tới thao tác thất bại hoặc khiếu nại về trải nghiệm.

## Phương án đã cân nhắc và lý do loại

- **Một cơ chế hoàn tác chung cho mọi thao tác, kể cả sau khi chốt**: loại vì phá giá trị pháp lý
  của biên bản kiểm kê đã ký — cho phép xóa/sửa ngầm sau chốt là rủi ro tuân thủ trực tiếp.
- **Không hoàn tác gì cả, mọi thao tác đều qua modal xác nhận trước**: loại vì bắt người dùng trả
  giá cho thao tác nhập liệu thường/đảo ngược được — trải nghiệm nặng nề không cần thiết, đây
  chính là vấn đề bị phát hiện ban đầu.
- **Cho sửa trực tiếp bản ghi đã chốt kèm log riêng, không tạo bản điều chỉnh tách biệt**: loại
  vì không giữ được bản gốc nguyên vẹn hiển thị song song bản điều chỉnh — yếu hơn về mặt chứng
  cứ so với nguyên tắc bản ghi bất biến đã áp dụng nhất quán ở các nơi khác trong app.

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục 0septies
- `docs/00-ke-hoach-nang-cap.md` mục B3 (Kiểm kê định kỳ), C1 (Gỡ xuất bản/Trả lại bổ sung)
- Luật Di sản văn hóa 45/2024/QH15 Điều 23 (kiểm kê định kỳ)
