# 0019. Nhúng ứng dụng GS Immersive Tour qua iframe, không hợp nhất mã nguồn

## Bối cảnh

Chủ đầu tư yêu cầu (13/08/2026) bổ sung nhóm **Khai thác** vào admin với hai màn: **Biên tập**
(mở trình tạo tour 3D) và **Không gian số** (trình diễn tour) — "bấm vào Biên tập sẽ ra view của
editor đó". Trình biên tập được chỉ định là ứng dụng **GaussianSplat Immersive Tour** đã có sẵn
(kho mã riêng tại `~/GaussianSplat Imersive Tour`): ứng dụng Vite + PlayCanvas thuần JavaScript,
hai entry (`/` viewer, `/editor/` editor), render toàn màn hình bằng canvas WebGPU/WebGL2, có vòng
đời phát hành riêng (đang ở v0.3.3, có CHANGELOG riêng).

Admin là ứng dụng React 19 + TypeScript. Hai hệ hoàn toàn khác nhau về khung nền, cách quản lý
trạng thái, cách render và nhịp phát hành.

## Quyết định

**Nhúng qua `<iframe>`, giữ hai ứng dụng độc lập tuyệt đối** — admin chỉ biết *địa chỉ* của ứng
dụng tour, không import một dòng mã nào của nó:

- `app/src/config/externalTools.ts` là nơi duy nhất giữ cấu hình địa chỉ: dev mặc định
  `http://localhost:5174` (admin chạy 5173); production trỏ qua biến `VITE_GS_TOUR_URL`; tour
  mặc định của màn Không gian số đặt qua `VITE_GS_TOUR_JSON` — cố ý **không** trỏ vào tour mẫu
  có sẵn của ứng dụng kia vì đó là dữ liệu thử nghiệm không liên quan Văn Miếu.
- `components/EmbeddedTool.tsx` là khung nhúng dùng chung: **probe trước khi nhúng** bằng
  `fetch(src, { mode: 'no-cors' })` + timeout — server ngoài chưa chạy thì hiện bảng hướng dẫn kèm
  đúng lệnh khởi động và nút thử lại, thay vì iframe trắng không rõ lý do. Luôn có nút *Mở trong
  thẻ mới* vì phiên biên tập dài dùng nhiều phím tắt/toàn màn hình.
- Vai trò thấy màn Biên tập giới hạn theo nhóm quyền Tạo/Sửa nội dung (Quản trị, Kỹ thuật số hóa,
  Biên tập); màn Không gian số mở cho mọi vai trò.

Khi triển khai thật: build tĩnh ứng dụng tour, phục vụ **cùng tên miền sau reverse proxy** (vd
`/tour/`) — hết phụ thuộc tiến trình dev thứ hai, đồng thời né mọi vấn đề khung nhúng chéo nguồn
(X-Frame-Options/CSP).

## Trạng thái

Đã chấp nhận — 13/08/2026.

## Hệ quả

**Tích cực:** Không có rủi ro trộn mã giữa hai stack không tương thích; ứng dụng tour tiếp tục
phát triển độc lập và admin tự nhận bản mới không cần build lại; nhúng iframe là *cơ chế được chính
ứng dụng tour hỗ trợ chính thức* (nó có sẵn tính năng "trình tạo mã nhúng" sinh iframe); mọi cấu
hình môi trường gom một file.

**Tiêu cực:** Ranh giới iframe chặn tích hợp sâu — chưa có đăng nhập một lần xuyên khung, chưa chọn
được dữ liệu số hóa từ kho admin đưa thẳng vào editor (người dùng nạp file thủ công). Muốn có thì
cần cầu `postMessage` hai chiều, là việc của giai đoạn sau và cần ứng dụng tour hợp tác.

**Rủi ro:** Dev cần chạy hai tiến trình — đã giảm nhẹ bằng màn fallback tự hiện lệnh khởi động,
mục `gs-tour` trong cấu hình chạy, và mục 3.5 của `16-van-de-da-biet.md`. Thao tác của người dùng
bên trong iframe không đi qua nhật ký hoạt động của admin (xuất tour.json không để lại vết) — chấp
nhận ở bản trình diễn, phải giải quyết khi tích hợp sâu.

## Phương án đã cân nhắc và lý do loại

- **Port editor sang React vào admin**: loại — viết lại một ứng dụng PlayCanvas imperative đang
  hoạt động tốt sang stack khác là rủi ro khổng lồ không đổi lấy giá trị nào; mọi bản vá của ứng
  dụng gốc sau đó phải port lại bằng tay, hai bản trôi khỏi nhau ngay lập tức.
- **Monorepo / gói npm chung**: loại — ràng buộc vòng đời build của hai sản phẩm có nhịp phát hành
  khác nhau; ứng dụng tour vốn tự đóng gói hai entry HTML hoàn chỉnh, ép nó thành thư viện là dùng
  sai hình dạng của nó.
- **Chỉ đặt liên kết mở thẻ mới, không nhúng**: loại — trái yêu cầu tường minh của chủ đầu tư
  ("bấm vào Biên tập sẽ ra view của editor đó" trong admin); nút mở thẻ mới được giữ như lối
  thoát cho phiên làm việc dài, không phải thay thế.
- **Nhúng thẳng không probe**: loại — server ngoài chưa chạy thì người dùng nhìn iframe trắng
  không lời giải thích; với demo thầu, một màn trắng câm là cách thuyết trình tự sát.

## Liên kết

- `app/src/config/externalTools.ts` · `app/src/components/EmbeddedTool.tsx`
- `app/src/pages/EditorPage.tsx` · `app/src/pages/SpatialPage.tsx`
- `app/src/layout/navConfig.ts` (nhóm KHAI THÁC, giới hạn vai trò mục Biên tập)
- `docs/16-van-de-da-biet.md` mục 3.5 (phụ thuộc tiến trình thứ hai)
- [ADR-0001](0001-kien-truc-thong-tin-theo-ban-thiet-ke-v3.md) — cấu trúc điều hướng 4 nhóm là
  lần điều chỉnh IA có chủ đích đầu tiên sau quyết định giữ IA theo v3
