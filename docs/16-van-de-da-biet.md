# Vấn đề đã biết và hạn chế đã biết — phiên bản 1.0.0

## Hệ thống quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám

| Trường | Nội dung |
|---|---|
| Mã tài liệu | VM-DOC-16 |
| Phiên bản | 1.0.0 |
| Ngày ban hành | 12/08/2026 |
| Trạng thái | Áp dụng cho bản trình diễn/dự thầu 1.0.0 — cập nhật tại mỗi bản phát hành kế tiếp |
| Tài liệu liên quan | [`00-ke-hoach-nang-cap.md`](./00-ke-hoach-nang-cap.md) · [`01-thuyet-minh-ky-thuat.md`](./01-thuyet-minh-ky-thuat.md) (Chương 3.4 phạm vi giai đoạn 2) · [`13-ke-hoach-quan-ly-du-an.md`](./13-ke-hoach-quan-ly-du-an.md) · [`14-van-hanh-va-ban-giao.md`](./14-van-hanh-va-ban-giao.md) · [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |

---

## 1. Vai trò tài liệu

Tài liệu này công bố trung thực **toàn bộ hạn chế đã biết** của bản 1.0.0, để hội đồng chấm thầu, chủ đầu tư và đội ngũ triển khai kế tiếp không phải tự phát hiện qua trải nghiệm thực tế. Nguyên tắc biên soạn: **không có mục nào được che giấu hoặc giảm nhẹ mức độ ảnh hưởng**; mục nào chưa có phương án xử lý tạm thời thì ghi rõ "chưa có", không suy đoán. Đây là tài liệu thể hiện sự chuyên nghiệp của nhà thầu — một hồ sơ dự thầu không có mục "hạn chế đã biết" đáng ngờ hơn một hồ sơ có, vì mọi phần mềm đều có hạn chế.

Bốn nhóm hạn chế được trình bày theo thứ tự: **(1)** hạn chế theo thiết kế của bản trình diễn — có chủ đích, sẽ không còn khi triển khai chính thức; **(2)** hạn chế chức năng — chưa hoàn thiện, có lộ trình khắc phục; **(3)** nợ kỹ thuật — không ảnh hưởng chức năng nhưng cần dọn trước khi mở rộng; **(4)** phụ thuộc bên ngoài — cần chủ đầu tư cung cấp hoặc quyết định, nhà thầu không tự giải quyết được.

---

## 2. Hạn chế theo thiết kế của bản trình diễn

Nhóm này **không phải lỗi** — là lựa chọn thiết kế có chủ đích cho một bản trình diễn trước khi có hợp đồng và hạ tầng thật, được ghi nhận công khai để không ai nhầm bản trình diễn với bản vận hành chính thức.

### 2.1. Chưa có backend thật — lớp dịch vụ giả lập

| Mục | Nội dung |
|---|---|
| Mô tả | Toàn bộ nghiệp vụ (dữ liệu số hóa, bộ sưu tập, người dùng, nhật ký, kết nối, tải lên) chạy trên lớp dịch vụ giả lập trong trình duyệt (`app/src/services/mock/*`, dữ liệu nguồn tại `app/src/data/*`), không có máy chủ API, không có cơ sở dữ liệu thật |
| Ảnh hưởng | Không phản ánh được hiệu năng, độ trễ mạng, hoặc hành vi đồng thời nhiều người dùng thật; dữ liệu không tồn tại lâu dài (mất khi tải lại trang, tùy cơ chế lưu trạng thái) |
| Cách xử lý tạm thời | Kiến trúc lớp dịch vụ (`src/services/index.ts`, `src/services/types.ts`) đã tách theo hợp đồng interface, tách biệt khỏi giao diện — mục đích để khi thay bằng API thật (Đợt 3–5, `13-ke-hoach-quan-ly-du-an.md`) chỉ cần thay tầng triển khai, không sửa giao diện |
| Dự kiến khắc phục | Thay thế bằng dịch vụ API thật theo đặc tả `06-dac-ta-api.md` trong các đợt phát triển chính thức, hiện thực bằng PHP + Laravel theo [ADR-0018](adr/0018-php-laravel-cho-lop-dich-vu-ung-dung.md) |

### 2.2. Dữ liệu là mẫu trình diễn

| Mục | Nội dung |
|---|---|
| Mô tả | Khoảng 150 bản ghi mock, sinh từ danh mục hiện vật thật của Trung tâm nhưng **chưa qua thẩm định chính thức** của cán bộ chuyên môn; một số trường sinh tự động (ví dụ theo công thức khoa thi/can chi) để đủ khối lượng phục vụ phân trang và lọc |
| Ảnh hưởng | Không được dùng làm nguồn tham chiếu chính thức về nội dung di sản; nếu demo trước hội đồng mà không nói rõ, có rủi ro hiểu nhầm là dữ liệu chính thức |
| Cách xử lý tạm thời | Công bố rõ trong kịch bản demo (`05-kich-ban-demo.md`, mục trả lời câu hỏi vặn "Dữ liệu này ở đâu ra?"); nguồn đối chiếu ghi tại `04-phu-luc-fact-di-san.md` |
| Dự kiến khắc phục | Nhập lại và thẩm định lại toàn bộ cùng cán bộ chuyên môn Trung tâm trong Đợt 7 — Chuyển đổi và làm sạch dữ liệu (`13-ke-hoach-quan-ly-du-an.md` mục 3.2) |

### 2.3. Một số màn dùng state cục bộ chưa nối vào lớp service

| Mục | Nội dung |
|---|---|
| Mô tả | Một số tương tác giao diện (ví dụ một số thao tác trong modal cấu hình, một số bộ đếm/nhãn tạm thời) giữ trạng thái trực tiếp trong component React thay vì đi qua lớp `services/`, do được thêm nhanh trong giai đoạn hoàn thiện demo |
| Ảnh hưởng | Thao tác không được ghi nhận nhất quán với phần còn lại của hệ thống (không xuất hiện trong `Store` dùng chung); nếu thao tác đó lẽ ra cần ghi nhật ký thì hiện chưa ghi |
| Cách xử lý tạm thời | Không có — cần rà soát thủ công theo từng màn trước khi coi là hoàn chỉnh |
| Dự kiến khắc phục | Rà soát và nối toàn bộ về lớp `services/` trong giai đoạn phát triển chính thức; đưa vào tiêu chí Definition of Done (`../CONTRIBUTING.md`) để không tái phát |

### 2.4. Tài liệu chứng cứ trong sổ tuân thủ là tài liệu mẫu có dán nhãn

| Mục | Nội dung |
|---|---|
| Mô tả | Cột "Chứng cứ" của Sổ đăng ký tuân thủ (màn Tuân thủ & quản trị dữ liệu) trỏ tới các `EvidenceDoc` mẫu (`app/src/data/complianceEvidence.ts`) — số hiệu văn bản dùng dạng trung tính, không phải số thật; người ký chỉ lấy từ 7 người dùng mẫu, không dùng tên người có thật |
| Ảnh hưởng | Không được dùng làm bằng chứng tuân thủ thật trước cơ quan thanh tra; chỉ minh họa **cơ chế** xem trước chứng cứ (`EvidenceViewer`) hoạt động thế nào |
| Cách xử lý tạm thời | Dải nhãn cảnh báo hiển thị ngay trong `EvidenceViewer` khi mở tài liệu mẫu |
| Dự kiến khắc phục | Thay bằng văn bản, biên bản, quyết định thật của Trung tâm khi vận hành chính thức; cơ chế lưu trữ và xem trước giữ nguyên |

---

## 3. Hạn chế chức năng

Nhóm này là chức năng **có mặt nhưng chưa hoàn chỉnh** — khác nhóm 2 (chưa nối hạ tầng thật), đây là các trường hợp bản thân tính năng còn thiếu.

### 3.1. i18n mới hoàn chỉnh tiếng Việt

| Mục | Nội dung |
|---|---|
| Mô tả | Lớp đa ngữ đã tách file (`app/src/i18n/vi.ts`, `en.ts`, `fr.ts`) đúng kiến trúc dự kiến, nhưng tính đến bản 1.0.0, `vi.ts` có 233 dòng khóa chuỗi trong khi `en.ts` (22 dòng) và `fr.ts` (19 dòng) mới có một phần nhỏ tương ứng — phần lớn giao diện tiếng Anh/Pháp sẽ hiển thị thiếu chuỗi hoặc rơi về mặc định tiếng Việt |
| Ảnh hưởng | Không dùng được giao diện tiếng Anh/Pháp cho vận hành thật ở bản 1.0.0; đúng như đã nêu trong kịch bản demo — tiếng Anh/Pháp thuộc phạm vi giai đoạn 2 |
| Cách xử lý tạm thời | Giữ giao diện demo ở tiếng Việt; trả lời rõ trong vòng hỏi vặn (`05-kich-ban-demo.md`) rằng kiến trúc đã sẵn sàng, chỉ còn công việc dịch |
| Dự kiến khắc phục | Dịch đầy đủ `en.ts`/`fr.ts` là hạng mục G2B của giai đoạn 2 (`00-ke-hoach-nang-cap.md` mục 2) |

### 3.2. Mức độ tự động hóa kiểm thử còn thấp

| Mục | Nội dung |
|---|---|
| Mô tả | Bộ kiểm thử tự động hiện có hai tệp (`app/tests/canChi.test.ts`, `app/tests/permissions.test.ts` — 14 ca), chạy qua `node --experimental-strip-types --test`; chưa có kiểm thử cho phần lớn logic nghiệp vụ còn lại (tìm kiếm, pipeline trạng thái, tính toán dung lượng, mã định danh) |
| Ảnh hưởng | Rủi ro hồi quy (regression) khi sửa mã không được bộ kiểm thử tự động phát hiện sớm; phụ thuộc nhiều vào kiểm thử thủ công trước mỗi bản phát hành |
| Cách xử lý tạm thời | Kiểm thử thủ công theo kịch bản demo và checklist trước mỗi lần trình diễn/bàn giao |
| Dự kiến khắc phục | Bổ sung kiểm thử đơn vị cho các mô-đun `utils/` và `services/mock/` trong Đợt 8 — Kiểm thử (`13-ke-hoach-quan-ly-du-an.md` mục 3.2), là điều kiện để qua cổng TRR |

### 3.3. Viewer 3D/splat chưa đọc dữ liệu thật từ NAS

| Mục | Nội dung |
|---|---|
| Mô tả | Trình xem đã bật cho cả mesh 3D (qua GLTFLoader) và gaussian splat (qua thư viện `gaussian-splats-3d`), nhưng dữ liệu hiển thị vẫn là tệp mẫu đóng gói cùng ứng dụng; đường dẫn đọc `.ply`/`.glb` thật từ NAS của Trung tâm **chờ chủ đầu tư cung cấp** |
| Ảnh hưởng | Không thể minh chứng hiệu năng tải thật của dữ liệu quét 3D khối lượng lớn cho tới khi có mẫu thật; kịch bản demo (`05-kich-ban-demo.md`) đánh dấu đoạn này là tùy chọn, chỉ dùng khi đã xác nhận copy được dữ liệu thật |
| Cách xử lý tạm thời | Dùng dữ liệu mẫu có sẵn trong ứng dụng khi chưa có dữ liệu thật; không trình bày dữ liệu mẫu như dữ liệu thật |
| Dự kiến khắc phục | Kết nối nguồn dữ liệu thật ngay khi chủ đầu tư cấp quyền truy cập NAS/kho lưu trữ hiện có, dự kiến ở Đợt 1 — Khởi động và khảo sát của dự án chính thức |

### 3.4. Phân quyền chưa chặn ở tầng điều hướng

| Mục | Nội dung |
|---|---|
| Mô tả | Mục menu ngoài quyền được **ẩn hẳn** theo vai trò (`layout/navConfig.ts`, `filterNavByRole`), nhưng các route tương ứng chưa có lớp chặn riêng: gõ thẳng URL (ví dụ `/users` bằng tài khoản vai trò *Chỉ xem*) vẫn mở được màn. Quy tắc phân quyền và phân tách nhiệm vụ ([ADR-0017](adr/0017-ma-tran-phan-quyen-mot-nguon-va-quy-tac-phan-tach-nhiem-vu.md)) hiện được biểu diễn và kiểm tra ở tầng giao diện |
| Ảnh hưởng | Ở bản trình diễn không có dữ liệu thật nên rủi ro là rủi ro trình bày, không phải rò rỉ; nhưng nếu bê nguyên cấu trúc này lên bản có backend mà không kiểm quyền ở API thì thành lỗ hổng thật |
| Cách xử lý tạm thời | Không dùng bản trình diễn để chứng minh kiểm soát truy cập; nêu rõ giới hạn này khi trình bày phần phân quyền |
| Dự kiến khắc phục | Bổ sung guard theo `Capabilities` cho từng route, **và** thực thi lại toàn bộ ở tầng dịch vụ theo YC-PCN-27 (`09-dac-ta-yeu-cau-srs.md`) khi có backend thật — ẩn nút trên giao diện không phải là kiểm soát truy cập |

### 3.5. Nhóm Khai thác phụ thuộc ứng dụng GS Immersive Tour chạy riêng

| Mục | Nội dung |
|---|---|
| Mô tả | Hai màn **Biên tập** (`/editor`) và **Không gian số** (`/spatial`) nhúng ứng dụng GaussianSplat Immersive Tour — một ứng dụng web độc lập (PlayCanvas, kho mã riêng) — qua iframe ([ADR-0019](adr/0019-nhung-gs-immersive-tour-qua-iframe.md)). Ứng dụng đó phải đang chạy (mặc định `http://localhost:5174`, đổi qua biến `VITE_GS_TOUR_URL`) thì hai màn mới có nội dung |
| Ảnh hưởng | Nếu ứng dụng kèm theo chưa chạy, hai màn hiển thị bảng hướng dẫn khởi động kèm lệnh chạy và nút thử lại — không lỗi trắng trang, nhưng demo phải nhớ bật cả hai tiến trình |
| Cách xử lý tạm thời | Checklist trước demo bổ sung bước khởi động ứng dụng tour; màn fallback tự hiển thị đúng lệnh cần chạy |
| Dự kiến khắc phục | Khi triển khai thật: build tĩnh ứng dụng tour và phục vụ sau reverse proxy cùng tên miền (vd `/tour/`), khi đó không còn phụ thuộc tiến trình dev riêng và không cần cấu hình cổng |

---

## 4. Nợ kỹ thuật

Nhóm này không ảnh hưởng trực tiếp đến nghiệp vụ đang hoạt động, nhưng cần xử lý trước khi mở rộng quy mô hoặc bước sang giai đoạn 2, để tránh chi phí sửa chữa tăng theo thời gian.

### 4.1. Gói JavaScript vượt 500 kB, chưa tách mã theo tuyến (route)

| Mục | Nội dung |
|---|---|
| Mô tả | Bản dựng production hiện đóng gói vào một tệp JavaScript duy nhất có dung lượng khoảng 1,1 MB (`dist/assets/index-*.js`), vượt ngưỡng cảnh báo mặc định 500 kB của Vite; ứng dụng chưa dùng `React.lazy`/code-splitting theo từng route |
| Ảnh hưởng | Thời gian tải trang đầu (đặc biệt trên mạng chậm hoặc thiết bị cấu hình thấp) lâu hơn mức cần thiết vì người dùng phải tải cả mã của những màn họ chưa mở |
| Cách xử lý tạm thời | Không có — chưa ảnh hưởng nghiêm trọng ở quy mô demo nội bộ |
| Dự kiến khắc phục | Tách mã theo route bằng `React.lazy`/`Suspense` và cấu hình `build.rollupOptions.output.manualChunks` trong `vite.config.ts`, thực hiện trong giai đoạn phát triển chính thức trước khi mở rộng thêm màn hình |

### 4.2. Một số màu cấu trúc còn ghi cứng thay vì dùng biến chủ đề

| Mục | Nội dung |
|---|---|
| Mô tả | Rà soát mã nguồn phát hiện 59 tệp `.ts`/`.tsx`/`.css` còn chứa mã màu hex ghi trực tiếp ngoài `app/src/theme/` (nơi định nghĩa `themes.ts`, `color.ts` cho cơ chế theme sáng/tối) |
| Ảnh hưởng | Đổi theme hoặc điều chỉnh tương phản (ví dụ theo phản hồi kiểm thử trợ năng WCAG 2.1 AA) phải sửa rải rác nhiều tệp thay vì sửa một nơi; rủi ro một số điểm bị bỏ sót khi điều chỉnh màu toàn hệ thống |
| Cách xử lý tạm thời | Không có |
| Dự kiến khắc phục | Rà soát và thay bằng biến chủ đề (`theme/color.ts`, `theme/themes.ts`) trong Đợt 8 — Kiểm thử, đưa vào phạm vi kiểm thử trợ năng; quy tắc "không ghi cứng mã màu" đã đưa vào Definition of Done (`../CONTRIBUTING.md`) để chặn tái phát từ bản kế tiếp |

### 4.3. Cây phân khu ở trang Đối tượng di sản suy từ chuỗi `loc` thay vì trường có cấu trúc

| Mục | Nội dung |
|---|---|
| Mô tả | Hàm `zoneOf()` (`app/src/pages/ObjectsPage.tsx`) suy luận phân khu hiển thị bằng cách so khớp mẫu chuỗi trên trường `loc` (chuỗi tự do) và tên đối tượng, vì trường `StructuredLocation.phanKhu` có trong thiết kế mô hình dữ liệu (mục 0sexies, `00-ke-hoach-nang-cap.md`; `07-mo-hinh-du-lieu.md`) nhưng dữ liệu mock chưa populate trường này |
| Ảnh hưởng | Việc suy luận có thể xếp sai phân khu nếu tên/mô tả đối tượng thay đổi cách viết; đây là giải pháp tạm cho bản trình diễn, không phải mô hình dữ liệu đích |
| Cách xử lý tạm thời | Bộ mẫu so khớp đã ghi rõ căn cứ đối chiếu với `04-phu-luc-fact-di-san.md` (bố cục 5 khu) ngay trong chú thích mã nguồn, để người bảo trì tiếp theo hiểu logic tạm này xuất phát từ đâu |
| Dự kiến khắc phục | Populate `StructuredLocation.phanKhu` có cấu trúc khi chuyển đổi dữ liệu thật (Đợt 7); thay `zoneOf()` bằng truy vấn trực tiếp trường cấu trúc thay vì suy luận theo chuỗi |

---

## 5. Phụ thuộc bên ngoài cần chủ đầu tư xử lý

Nhóm này **nhà thầu không tự giải quyết được** — cần quyết định, xác nhận hoặc tài liệu từ phía chủ đầu tư/cơ quan có thẩm quyền. Đây không phải hạn chế của phần mềm mà là điều kiện tiên quyết để phần mềm phản ánh đúng thực tế.

### 5.1. Số kiểm kê hiện vật gốc còn thiếu

| Mục | Nội dung |
|---|---|
| Mô tả | Trong quá trình rà soát danh mục đối tượng phục vụ xây dựng dữ liệu mẫu, ghi nhận **khoảng 120 đối tượng** chưa xác định được số kiểm kê/số đăng ký hiện vật gốc của Trung tâm để neo vào trường `so_kiem_ke` (mục 0quater, `00-ke-hoach-nang-cap.md`) |
| Ảnh hưởng | Các đối tượng này khi nhập chính thức sẽ mang mã khuyết giá trị `CHUA_NHAP` hoặc `CHUA_XAC_DINH` cho trường số kiểm kê, vào hàng đợi nhập liệu/nghiên cứu thay vì có ngay số liên kết với sổ kiểm kê giấy |
| Cách xử lý tạm thời | Dữ liệu mẫu hiện dùng mã định danh hệ thống độc lập (`VM-<OC>-<NNNNN>`), không suy đoán số kiểm kê |
| Dự kiến khắc phục | Trung tâm cung cấp hoặc hoàn thiện sổ kiểm kê cho các đối tượng còn thiếu trong Đợt 1 (Khởi động và khảo sát) và Đợt 7 (Chuyển đổi và làm sạch dữ liệu) — xem Chương 12.2, `01-thuyet-minh-ky-thuat.md` |

### 5.2. Xác nhận chuyên môn danh mục hiện vật

| Mục | Nội dung |
|---|---|
| Mô tả | Dữ liệu fact di sản trong bản mẫu (niên đại, vị trí, tên gọi, quan hệ hiện vật) đã được nhóm triển khai đối chiếu nguồn công khai (`04-phu-luc-fact-di-san.md`), nhưng **chưa có xác nhận chính thức bằng chữ ký của cán bộ chuyên môn Trung tâm** |
| Ảnh hưởng | Không được dùng làm căn cứ công bố chính thức (rủi ro R-01, `13-ke-hoach-quan-ly-du-an.md` mục 8) |
| Cách xử lý tạm thời | Không có — đây là bước bắt buộc, không có đường tắt kỹ thuật thay thế được xác nhận chuyên môn |
| Dự kiến khắc phục | Trung tâm bố trí tối thiểu một cán bộ chuyên môn di sản làm đầu mối xác nhận theo từng bản ghi, thực hiện tại Đợt 7 trước khi dữ liệu chuyển trạng thái "Đã xuất bản" |

### 5.3. Quyết định cấp độ an toàn thông tin

| Mục | Nội dung |
|---|---|
| Mô tả | Thuyết minh kỹ thuật kiến nghị **cấp độ 2** kèm lập luận (Chương 9.1, `01-thuyet-minh-ky-thuat.md`), nhưng đây là **kiến nghị**, chưa phải quyết định — cấp độ chính thức do cấp có thẩm quyền phê duyệt sau khi nhà thầu nộp hồ sơ đề xuất |
| Ảnh hưởng | Một số tham số vận hành phụ thuộc cấp độ được duyệt (ví dụ thời hạn lưu nhật ký tối thiểu theo TCVN 11930:2017, Mục 9.6 cùng chương) chỉ chốt chính thức sau khi có quyết định phê duyệt |
| Cách xử lý tạm thời | Thiết kế theo mức cấp độ 3 ở các biện pháp chi phí biên thấp, để không phải thiết kế lại nếu cấp độ được duyệt cao hơn cấp độ 2 (nguyên tắc thiết kế, cùng mục) |
| Dự kiến khắc phục | Trung tâm trình hồ sơ đề xuất cấp độ lên cấp có thẩm quyền ngay sau CDR (`13-ke-hoach-quan-ly-du-an.md` mục 4.3); rà soát lại cấu hình khi có quyết định chính thức |

### 5.4. Đặc tả kết nối cơ sở dữ liệu quốc gia về di sản văn hóa

| Mục | Nội dung |
|---|---|
| Mô tả | Tính đến thời điểm lập hồ sơ, **Bộ Văn hóa, Thể thao và Du lịch chưa ban hành thông tư hoặc quyết định riêng về đặc tả kỹ thuật metadata, lược đồ dữ liệu hay định dạng tệp số hóa** cho hiện vật/di tích (Chương 1.2, `01-thuyet-minh-ky-thuat.md`) — Điều 85 Nghị định 308/2025/NĐ-CP mới giao nhiệm vụ xây dựng bộ tiêu chuẩn này |
| Ảnh hưởng | Hệ thống hiện áp dụng chuẩn quốc tế/quốc gia đã có (TCVN 7980-1/2, CIDOC-CRM, PREMIS) làm nền; khi Bộ ban hành đặc tả chính thức, có thể cần điều chỉnh lớp ánh xạ dữ liệu (rủi ro R-06, Chương 17 cùng tài liệu) |
| Cách xử lý tạm thời | Thiết kế sẵn lớp ánh xạ tách biệt khỏi lõi nghiệp vụ (Chương 7.5 cùng tài liệu), để việc điều chỉnh không phải sửa cấu trúc gốc |
| Dự kiến khắc phục | Nằm ngoài phạm vi kiểm soát của dự án — phụ thuộc lịch ban hành của Bộ VHTTDL; cam kết hỗ trợ điều chỉnh trong hợp đồng bảo trì (Mục 9.3, `14-van-hanh-va-ban-giao.md`) |

---

*Hết tài liệu. Danh mục này được cập nhật tại mỗi bản phát hành kế tiếp — mục nào đã khắc phục được chuyển sang nhật ký thay đổi, không xóa khỏi lịch sử.*
