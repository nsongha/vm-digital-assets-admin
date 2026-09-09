# 0001. Chọn kiến trúc thông tin theo bản thiết kế v3 thay vì wireframe hồ sơ thầu

## Bối cảnh

Bộ hồ sơ mời thầu có 7 wireframe minh họa (Hình 3.5-1 → 3.5-7, thư mục `mokcup/`) mô tả một tầm
nhìn sản phẩm đầy đủ hai giai đoạn: vừa **cổng khai thác công chúng** (bản đồ 3D toàn khu, hotspot
đa phân khu, điểm tham quan, thuyết minh đa ngữ cho khách) vừa **CMS quản trị nội bộ**. Ứng dụng
admin đang xây dựng ở giai đoạn 1 chỉ thuộc phần quản trị nội bộ. Nếu lấy nguyên kiến trúc thông
tin (IA) của wireframe làm khung thiết kế, ứng dụng sẽ phải dựng cả những màn hình thuộc phạm vi
cổng công chúng — nằm ngoài phạm vi và ngân sách giai đoạn 1 — hoặc phải chắp vá IA nửa vời để né
tránh, gây rối cấu trúc màn hình.

Ngày 12/08/2026, user đã chốt một bản thiết kế IA riêng ("v3") đúng phạm vi CMS quản trị, chia
thành nhóm màn hình A (sửa nền), B (màn hình mới), C (nâng cấp màn sẵn có). Rủi ro của lựa chọn
này: hội đồng chấm thầu thường tra cứu theo đúng use case trong wireframe hồ sơ thầu, và một IA
"khác" với wireframe dễ bị hiểu nhầm là lệch yêu cầu nếu không chứng minh được từng use case đã
đi đâu.

## Quyết định

Thiết kế IA của ứng dụng theo **bản v3** (nhóm A/B/C trong `docs/00-ke-hoach-nang-cap.md`), không
rập khuôn theo cấu trúc màn hình của 7 wireframe hồ sơ thầu. Bù đắp bằng một tài liệu độc lập —
**ma trận truy vết ba chiều** `docs/03-ma-tran-truy-vet.md` — đối chiếu tường minh từng use case
(UC-01…UC-09) của wireframe với: màn hình app đáp ứng (hoặc ghi rõ **"Giai đoạn 2"** kèm giải
thích khi chưa làm), căn cứ pháp lý đã xác minh, và chuẩn quốc tế liên quan.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** IA v3 tối ưu cho đúng phạm vi CMS quản trị, không phải cõng thêm màn hình cổng công
chúng chưa có nghiệp vụ backend hỗ trợ. Ma trận truy vết là công cụ bảo vệ hồ sơ minh bạch hơn
việc chỉ tuyên bố "đã đáp ứng" — mỗi use case chưa làm được ghi rõ lý do thay vì im lặng hoặc gộp
lẫn, giúp nhóm triển khai không nhầm lẫn về ranh giới giai đoạn.

**Tiêu cực:** Phát sinh thêm một tài liệu phải duy trì song song với IA — mỗi khi thêm/đổi màn
hình trong `00-ke-hoach-nang-cap.md` phải cập nhật lại ma trận, nếu không hai tài liệu sẽ lệch
nhau theo thời gian.

**Rủi ro:** Hội đồng có thể vẫn kỳ vọng thấy đúng hình hài 7 wireframe khi lật hồ sơ nhanh; cần
thuyết minh chủ động (không đợi hỏi) về việc nhóm use case nào thuộc Giai đoạn 2, tránh để hội
đồng tự phát hiện và đặt câu hỏi ở thế bị động.

## Phương án đã cân nhắc và lý do loại

- **Bám sát 100% cấu trúc màn hình wireframe**: loại vì kéo theo dựng giao diện công chúng (bản
  đồ 3D toàn khu, hotspot đa phân khu) — ngoài phạm vi và ngân sách giai đoạn 1, làm loãng trọng
  tâm CMS quản trị mà hội đồng cần thấy vận hành được thật.
- **Thiết kế IA v3 nhưng không viết ma trận truy vết**: loại vì không có cách nào chứng minh cho
  hội đồng rằng từng yêu cầu trong wireframe đã được cân nhắc có chủ đích, chứ không phải bỏ sót.
- **Gộp wireframe và v3 thành một IA lai**: loại vì tạo ra cấu trúc màn hình mơ hồ, vừa không
  đúng use case gốc vừa không tối ưu cho nghiệp vụ CMS thật.

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` (dòng 4, nhóm A/B/C)
- `docs/03-ma-tran-truy-vet.md` (toàn bộ, đặc biệt "Vai trò của tài liệu" và UC-01…UC-05)
- `docs/01-thuyet-minh-ky-thuat.md` mục 3.3–3.4 (phạm vi giai đoạn 1 vs giai đoạn 2)
- `app/src/pages/` (các màn hình đã triển khai theo IA v3)
