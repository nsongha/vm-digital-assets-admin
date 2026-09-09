# 0018. PHP + Laravel cho lớp dịch vụ ứng dụng; lớp trình diễn giữ nguyên React

## Bối cảnh

`docs/01-thuyet-minh-ky-thuat.md` mục 6.2 mô tả lớp dịch vụ ứng dụng ở mức trung lập công nghệ —
"API dạng REST, kiến trúc mô-đun theo miền nghiệp vụ" — mà không nêu ngôn ngữ hay khung nền
(framework). Mức trung lập đó là có chủ đích ở thời điểm lập hồ sơ: [ADR-0002](0002-react-vite-lop-dich-vu-gia-lap.md)
hoãn toàn bộ backend sang giai đoạn sau, nên chưa có gì buộc phải chốt. Toàn bộ "dịch vụ" hiện có
là lớp giả lập chạy trong bộ nhớ trình duyệt (`app/src/services/mock/`, 634 dòng TypeScript), không
phải mã máy chủ.

Khi chuẩn bị bước sang xây dựng dịch vụ thật theo `06-dac-ta-api.md` (20 nhóm đường dẫn REST trên
`/api/v1`, cộng giao thức gặt `/oai` và endpoint phát trực tiếp tệp nhị phân), câu hỏi ngôn ngữ
không trì hoãn thêm được nữa: nó chi phối ước lượng nhân sự và chi phí (Chương 10 và Chương 16 tài
liệu 01), kế hoạch chuyển giao vận hành cho Trung tâm (`14-van-hanh-va-ban-giao.md`), và danh mục
thành phần phần mềm phải khai trong hồ sơ đề xuất cấp độ an toàn thông tin
(`15-ho-so-de-xuat-cap-do-attt.md`).

Đây cũng là thời điểm quyết định rẻ nhất mà dự án còn có: **chưa tồn tại một dòng mã máy chủ nào**,
và đặc tả OpenAPI (`06`), mô hình dữ liệu (`07`), mô tả kiến trúc (`08`) đều trung lập ngôn ngữ nên
tái dùng nguyên vẹn với bất kỳ lựa chọn nào. Mỗi tuần chậm lại sau khi bắt đầu viết dịch vụ thật,
chi phí đảo quyết định chỉ tăng.

Ràng buộc chi phối lựa chọn: nguyên tắc kiến trúc #1 **tự chủ hạ tầng, self-host** và #2 **ưu tiên
mã nguồn mở** (Điều 85 Nghị định 308/2025/NĐ-CP); nguyên tắc #5 **mọi chức năng nghiệp vụ đều qua
API**, giao diện web chỉ là một bên tiêu thụ; và điều kiện thực tế của bên tiếp nhận — Trung tâm là
đơn vị sự nghiệp công lập với nhân sự công nghệ thông tin mỏng, nên khả năng tuyển và giữ người vận
hành sau bàn giao là một tiêu chí kỹ thuật thật, không phải yếu tố phụ.

## Quyết định

Lớp dịch vụ ứng dụng (8 nhóm dịch vụ B1–B8 tại `08-mo-ta-kien-truc.md` mục 4.2) xây dựng bằng
**PHP** trên khung nền **Laravel**.

Bốn ranh giới đi kèm quyết định, có hiệu lực ngang với chính lựa chọn ngôn ngữ:

1. **Không đụng lớp trình diễn.** Ứng dụng quản trị vẫn là React SPA + three.js theo ADR-0002,
   [ADR-0013](0013-bien-chu-de-root-modal-qua-portal.md), [ADR-0015](0015-i18n-tach-lop.md). Không
   thay bằng khuôn mẫu phía máy chủ (Blade/Livewire). PHP chỉ phục vụ `/api/v1` và `/oai`.
2. **Không xử lý luồng nhị phân lớn trong tiến trình PHP.** Endpoint phát trực tiếp có hỗ trợ
   `Range` (mục 1.1 tài liệu 06) do máy chủ web đảm nhiệm qua cơ chế uỷ quyền nội bộ; PHP chỉ kiểm
   quyền rồi trả chỉ dẫn, không đọc tệp qua tiến trình ứng dụng.
3. **Không tự viết khâu xử lý tệp nặng.** Sinh bản dẫn xuất, đóng gói AIP, kiểm tra toàn vẹn định
   kỳ (`02-quy-trinh-bao-quan-sao-luu.md`) chạy ở tiến trình worker qua hàng đợi, gọi công cụ dòng
   lệnh chuyên dụng cho ảnh, video và mô hình 3D. Ngôn ngữ của worker **không bị ràng buộc bởi ADR
   này** — chọn theo công cụ sẵn có của từng khâu.
4. **Không tự viết phần định danh và xác thực.** Giữ nguyên máy chủ định danh mã nguồn mở hỗ trợ
   OpenID Connect như mục 6.2 tài liệu 01; mTLS chấm dứt ở cổng kết nối, không ở tầng ứng dụng.

**Phiên bản không ghim cứng trong hồ sơ.** Hồ sơ cam kết dùng phiên bản PHP và Laravel **còn trong
thời hạn được hỗ trợ chính thức tại thời điểm triển khai**, chốt số hiệu cụ thể ở biên bản khởi
động dự án. Ghim một số hiệu minor vào tài liệu thầu lập giữa năm 2026 gần như chắc chắn tạo ra một
cam kết lỗi thời trước ngày triển khai.

ADR này **bổ sung, không thay thế** ADR-0002: ADR-0002 quyết định *giai đoạn demo chưa làm backend
và ranh giới lớp dịch vụ phải giữ*, vẫn còn hiệu lực nguyên vẹn; ADR-0018 trả lời phần bỏ ngỏ *khi
làm backend thật thì làm bằng gì*.

## Trạng thái

Đã chấp nhận — 13/08/2026.

## Hệ quả

**Tích cực:** Chi phí đổi phương án tại thời điểm chốt gần bằng không — không có mã máy chủ để viết
lại, và đặc tả OpenAPI 20 nhóm đường dẫn, sơ đồ thực thể — quan hệ, sáu khung nhìn kiến trúc đều
không phải sửa. Nhân lực PHP trong nước dồi dào, đặc biệt ở mảng hệ thống thông tin khu vực hành
chính sự nghiệp, nên rủi ro chuyển giao vận hành sau bàn giao thấp — đúng lập luận hồ sơ đã dùng để
chọn React tại mục 6.2 tài liệu 01. Lựa chọn có tiền lệ trực tiếp trong miền ứng dụng: hai nền tảng
quản trị và xuất bản dữ liệu di sản được dùng rộng rãi ở bảo tàng, thư viện quốc tế — Omeka S và
Drupal — đều viết bằng PHP, nên luận điểm "công nghệ phù hợp miền ứng dụng" có dẫn chứng thay vì
suy diễn. Giấy phép tự do, self-host được trên đúng cấu hình hạ tầng tối thiểu tại Chương 10 tài
liệu 01, khớp nguyên tắc kiến trúc #1 và #2. Hệ sinh thái khung nền có sẵn hàng đợi tác vụ, bộ lập
lịch, công cụ dịch chuyển lược đồ cơ sở dữ liệu và bộ kiểm thử — bốn thứ dự án cần và không phải tự
dựng.

**Tiêu cực:** PHP xử lý đồng bộ theo vòng đời request, nên mọi tác vụ dài — sinh bản dẫn xuất 3D,
kiểm tra toàn vẹn hàng loạt, gặt siêu dữ liệu khối lớn — **bắt buộc** đẩy ra worker, không có lựa
chọn chạy trong request như một số nền tảng bất đồng bộ; đây là ràng buộc thiết kế cứng, không phải
khuyến nghị. Thư viện cho bảo quản số (đóng gói BagIt, siêu dữ liệu PREMIS, gói tin OAIS) và cho xử
lý mô hình 3D trưởng thành hơn ở hệ sinh thái Python và Java, nên khâu pipeline phải gọi công cụ
ngoài — phát sinh phụ thuộc nhị phân phải khai báo trong tài liệu vận hành và trong danh mục phần
mềm bên thứ ba của hồ sơ ATTT. Ngôn ngữ lớp trình diễn (TypeScript) khác ngôn ngữ lớp dịch vụ
(PHP), nên hai bên không dùng chung định nghĩa kiểu dữ liệu: hợp đồng dữ liệu chỉ được bảo đảm bằng
đặc tả OpenAPI cộng bộ kiểm thử hợp đồng, và client TypeScript phải **sinh tự động từ tài liệu 06**
thay vì gõ tay, nếu không sẽ lệch dần.

**Rủi ro:** Một bộ phận người chấm có thể mang định kiến "PHP là công nghệ cũ"; giảm thiểu bằng
cách nêu rõ trong thuyết minh phiên bản còn trong thời hạn hỗ trợ, tuân thủ chuẩn PSR, và dẫn tiền
lệ Omeka S/Drupal trong ngành di sản — không tranh luận cảm tính. **Rủi ro chưa khép:** tại thời
điểm lập ADR này, dự án **chưa đối chiếu hồ sơ mời thầu xem có ràng buộc ngôn ngữ hay nền tảng cụ
thể hay không**; nếu HSMT có ràng buộc như vậy thì quyết định này phải rà lại trước khi nộp. Cuối
cùng, nếu về sau chọn triển khai trên một nền tảng DAM có sẵn thay vì tự phát triển, đó là quyết
định khác về bản chất — mua/tái sử dụng phần mềm, không phải chọn ngôn ngữ — và cần một ADR riêng.

## Phương án đã cân nhắc và lý do loại

- **Node.js/TypeScript, dùng chung ngôn ngữ với lớp trình diễn:** phương án cạnh tranh sát nhất —
  chia sẻ được định nghĩa kiểu dữ liệu với `app/src/services/types.ts`, một đội ngũ làm được cả hai
  đầu, và mô hình bất đồng bộ hợp với khâu phát tệp lớn. Loại vì lợi thế đó tập trung ở giai đoạn
  xây dựng, trong khi tiêu chí nặng hơn của dự án nằm ở giai đoạn sau bàn giao: khả năng đơn vị sự
  nghiệp công lập tuyển và giữ người vận hành, cùng mặt bằng nhân lực sẵn có trong nước cho hệ
  thống thông tin khu vực hành chính. Thiệt hại do không dùng chung kiểu dữ liệu được bù bằng sinh
  client tự động từ OpenAPI (xem mục Hệ quả).
- **Java/Spring:** mạnh nhất về hệ thống quy mô lớn, và có tiền lệ ngành đáng kể (Fedora Commons,
  DSpace đều là Java). Loại vì chi phí nhân lực, tài nguyên máy chủ và thời gian khởi động dự án
  cao hơn rõ rệt so với quy mô giai đoạn 1 — cấu hình tối thiểu tại Chương 10 tài liệu 01 là 8
  vCPU/16 GB cho máy chủ ứng dụng, và phạm vi là 15 nhóm chức năng cho một đơn vị, không phải hệ
  thống liên ngành.
- **Python (Django hoặc FastAPI):** hệ sinh thái tốt nhất cho xử lý dữ liệu, mô hình 3D và bảo quản
  số. Loại **làm ngôn ngữ chính** vì toàn bộ lợi thế đó nằm ở khâu xử lý tệp, mà khâu đó dù chọn
  ngôn ngữ nào cũng đã chạy ngoài tiến trình web theo ranh giới #3 ở trên — nên vẫn dùng được Python
  cho worker mà không cần Python cho lớp API. Phương án lai này được giữ mở một cách có chủ đích.
- **Symfony thay Laravel (cùng PHP):** hai khung nền đều đủ trưởng thành và cùng nền PSR. Chọn
  Laravel vì hàng đợi, bộ lập lịch, dịch chuyển lược đồ và tầng lưu trữ tương thích S3 có sẵn ngay
  trong khung nền — đúng bốn thứ đặc tả 06 và quy trình bảo quản 02 cần — trong khi Symfony cần lắp
  ghép thêm; đồng thời mặt bằng nhân lực Laravel trong nước rộng hơn. Không loại vì lý do kỹ thuật:
  nếu đội triển khai mạnh Symfony hơn, đảo lại lựa chọn này chỉ cần một ADR mới, không ảnh hưởng
  đặc tả.
- **PHP cho cả lớp trình diễn (Blade/Livewire, bỏ React SPA):** loại dứt khoát. Phải viết lại
  khoảng 23.500 dòng mã đang chạy được tại `app/src`, huỷ ADR-0002, 0013, 0015, trong khi three.js
  vẫn buộc chạy trong trình duyệt nên phần khó nhất không hề biến mất — đổi lại không thu được lợi
  ích kỹ thuật hay điểm chấm thầu nào.
- **Giữ nguyên mức trung lập công nghệ, chốt sau:** loại vì các tài liệu ước lượng nhân sự
  (Chương 16 tài liệu 01), vận hành (`14`) và ATTT (`15`) cần một phương án cụ thể mới lập được số,
  và vì chi phí đảo quyết định chỉ tăng theo thời gian kể từ dòng mã máy chủ đầu tiên.

## Liên kết

- [ADR-0002](0002-react-vite-lop-dich-vu-gia-lap.md) — quyết định được bổ sung (không thay thế)
- `docs/01-thuyet-minh-ky-thuat.md` mục 6.1 (nguyên tắc kiến trúc), mục 6.2 (bảng công nghệ),
  Chương 10 (hạ tầng tối thiểu)
- `docs/06-dac-ta-api.md` — hợp đồng mà lớp dịch vụ phải hiện thực hóa
- `docs/08-mo-ta-kien-truc.md` mục 4.2 (8 nhóm dịch vụ), mục 4.4 (triển khai), mục 9 (trạng thái
  hiện thực hóa)
- `docs/16-van-de-da-biet.md` mục 2.1 — "chưa có backend thật"
