# 0002. React + Vite với lớp dịch vụ giả lập tách rời, chưa làm backend giai đoạn 1

## Bối cảnh

`docs/01-thuyet-minh-ky-thuat.md` chương 6 mô tả kiến trúc đích bốn lớp cho hệ thống hoàn chỉnh:
React SPA ở lớp trình diễn, tám nhóm dịch vụ REST ở lớp nghiệp vụ, PostgreSQL + kho đối tượng S3
ở lớp dữ liệu, cùng định danh OpenID Connect, hàng đợi xử lý, chỉ mục tìm kiếm. Xây dựng toàn bộ
backend thật ngay từ đầu vượt quá những gì cần để chứng minh IA, luồng nghiệp vụ và giao diện
trong giai đoạn thầu/demo, và có rủi ro làm chậm phản hồi khi IA còn đang thay đổi — bằng chứng
là các quyết định 0bis–0septies (mã định danh, hai trục phân loại, khuyết giá trị…) đều chốt sau
khi app đã có hình hài ban đầu. Đồng thời, hồ sơ thầu vẫn cần chứng minh kiến trúc *có khả năng*
thay bằng API thật mà không phải viết lại toàn bộ lớp trình diễn.

## Quyết định

Xây dựng ứng dụng quản trị bằng **React + Vite**; toàn bộ dữ liệu và thao tác đi qua một **lớp
dịch vụ giả lập** (`app/src/services/`) đứng giữa components và dữ liệu mock (`app/src/data/`).
Component không import trực tiếp từ `data/`, luôn qua `services/index.ts` — điểm vào duy nhất
export các service (`assetService`, `auditService`, `collectionService`, `connectionService`,
`uploadService`, `userService`). Hình dạng interface của mỗi service (tham số, kiểu trả về ở
`services/types.ts`) giữ nguyên hình dạng dự kiến của API thật, để khi có backend chỉ cần thay
nội dung file trong `services/mock/*` bằng bản gọi HTTP, không sửa bất kỳ trang nào.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Vòng lặp thiết kế nhanh — mọi thay đổi IA/nghiệp vụ áp dụng ngay trong dữ liệu
mock, không chờ backend. Ranh giới service rõ ràng nghĩa là thay bằng API thật ở giai đoạn 2 chỉ
chạm vào `services/mock/*`, rủi ro hồi quy (regression) ở tầng UI thấp.

**Tiêu cực:** Một số hành vi chỉ có ý nghĩa với backend thật (RBAC thực thi ở server, khóa đồng
thời, hàng đợi xử lý bất đồng bộ) chỉ minh họa được ở tầng UI, chưa kiểm chứng dưới tải thật hay
điều kiện đua (race condition).

**Rủi ro:** Nếu một trang lỡ import thẳng từ `data/` thay vì qua `services/`, ranh giới bị phá và
chi phí chuyển sang API thật ở giai đoạn 2 tăng trở lại — cần rà soát định kỳ (lint rule hoặc
code review) để giữ kỷ luật này.

## Phương án đã cân nhắc và lý do loại

- **Viết backend thật ngay từ giai đoạn 1** (đúng chương 6 thuyết minh): loại vì vượt phạm vi và
  ngân sách cần thiết để chứng minh IA/demo thầu, đồng thời làm chậm tốc độ điều chỉnh IA đang
  trong giai đoạn chốt quyết định.
- **Gọi thẳng `data/` từ component, không qua lớp service**: loại vì xóa mất ranh giới thay thế
  bằng API thật — mọi trang sẽ phải sửa tay khi có backend.
- **Dùng framework SSR (Next.js) thay Vite SPA**: loại vì giai đoạn 1 không cần render phía máy
  chủ hay SEO công khai (cổng công chúng là Giai đoạn 2, xem ADR 0001); Vite SPA đơn giản hơn và
  khớp nguyên tắc "self-host, không phụ thuộc dịch vụ ngoài" của thuyết minh.

## Liên kết

- `docs/01-thuyet-minh-ky-thuat.md` mục 6.1–6.3 (kiến trúc bốn lớp đích)
- `app/src/services/index.ts`, `app/src/services/types.ts`, `app/src/services/mock/`
- `app/src/data/` (nguồn dữ liệu mock hiện tại)
