# Phần mềm quản lý và lưu trữ dữ liệu số hóa — Di tích quốc gia đặc biệt Văn Miếu – Quốc Tử Giám

**Phiên bản 1.0.0** · Cập nhật 12/08/2026 · Trạng thái: *bản trình duyệt phục vụ hồ sơ dự thầu*

Hệ thống quản trị dữ liệu số hóa di sản cho Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu –
Quốc Tử Giám: quản lý mô hình 3D, gaussian splat, đám mây điểm, bản vẽ kỹ thuật, tư liệu Hán Nôm,
ảnh tư liệu và media thuyết minh — kèm quy trình duyệt, kiểm kê, bảo quản dài hạn và chia sẻ
dữ liệu với cơ quan nhà nước.

Dự án phục vụ trực tiếp chỉ tiêu **Quyết định 2026/QĐ-TTg** (100% di tích quốc gia đặc biệt được
số hóa đến năm 2030) và **Quyết định 611/QĐ-TTg ngày 04/4/2026** (chuẩn hóa dữ liệu theo khung
chuẩn quốc gia, mã định danh số cho di sản văn hóa số công).

---

## 1. Bắt đầu nhanh

```bash
cd app && npm install && npm run dev
```

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy máy chủ phát triển |
| `npm run build` | Đóng gói bản phát hành |
| `npm test` | Chạy bộ kiểm thử (thuật toán can chi; bất biến chính sách phân quyền) |
| `npx tsc --noEmit -p tsconfig.app.json` | Kiểm tra kiểu tĩnh |

Đăng nhập bản trình diễn: mã xác thực **123456**, sau đó **chọn vai trò** để xem phân quyền
thay đổi theo vai (menu quản trị ẩn hẳn với vai *Chỉ xem*).

Hai màn nhóm **KHAI THÁC** (Biên tập, Không gian số) nhúng ứng dụng GaussianSplat Immersive Tour
chạy riêng ([ADR-0019](docs/adr/0019-nhung-gs-immersive-tour-qua-iframe.md)) — khởi động thêm:

```bash
npm --prefix "/Users/songha/GaussianSplat Imersive Tour" run dev -- --port 5174 --strictPort
```

Chưa chạy thì hai màn đó tự hiện hướng dẫn khởi động kèm lệnh, không lỗi trắng trang.

## 2. Cấu trúc kho mã

```
├── README.md              ← bạn đang ở đây; chỉ mục toàn bộ tài liệu ở mục 3
├── CHANGELOG.md           Nhật ký thay đổi theo phiên bản (SemVer)
├── CONTRIBUTING.md        Quy ước phát triển, định nghĩa "Hoàn thành"
├── SECURITY.md            Chính sách bảo mật và quy trình xử lý sự cố dữ liệu
├── app/                   Ứng dụng React + Vite (TypeScript)
├── data/                  Nơi đặt dữ liệu số hóa thật + biểu mẫu metadata (xem data/README.md)
├── docs/                  Toàn bộ tài liệu dự án — xem mục 3
│   ├── adr/               21 file: 20 quyết định kiến trúc + chỉ mục
│   └── audit/             6 báo cáo rà soát nội bộ (mục 3.5) — không nộp kèm hồ sơ
└── mokcup/                Wireframe gốc của hồ sơ thầu (hình 3.5-1 … 3.5-7)
```

Hướng dẫn chạy và cấu trúc riêng của ứng dụng: [app/README.md](app/README.md).

## 3. Chỉ mục tài liệu

> Mọi tài liệu của dự án đều được liệt kê ở đây. Tài liệu mới bắt buộc phải bổ sung vào bảng này
> (quy định tại [CONTRIBUTING.md](CONTRIBUTING.md)).

### 3.1. Hồ sơ nộp thầu — dành cho hội đồng chấm

| Tài liệu | Nội dung | Dành cho |
|---|---|---|
| [01 — Thuyết minh kỹ thuật](docs/01-thuyet-minh-ky-thuat.md) | 18 chương: căn cứ pháp lý, hiện trạng, mục tiêu, yêu cầu chức năng và phi chức năng, kiến trúc, ATTT, hạ tầng, lộ trình, chi phí, rủi ro, cam kết | Toàn hội đồng |
| [03 — Ma trận truy vết](docs/03-ma-tran-truy-vet.md) | Đối chiếu use case của wireframe ↔ màn hình ứng dụng ↔ căn cứ pháp lý ↔ chuẩn quốc tế | Thành viên kỹ thuật |
| [04 — Phụ lục thông tin di sản đã đối chiếu](docs/04-phu-luc-fact-di-san.md) | Thông tin đã xác minh, sai sót đã phát hiện và hiệu đính, nội dung cần Trung tâm xác nhận | Chuyên gia di sản |
| [05 — Kịch bản trình diễn](docs/05-kich-ban-demo.md) | Kịch bản 10 phút theo phút, 8 câu hỏi vặn và câu trả lời, checklist 30 phút trước demo | Người trình bày |
| [06 — Đặc tả API](docs/06-dac-ta-api.md) | OpenAPI 3.0, OAI-PMH theo TCVN 7980-1:2024, quy tắc công bố theo mức truy cập | Thành viên kỹ thuật |
| [07 — Mô hình dữ liệu](docs/07-mo-hinh-du-lieu.md) | ERD 25 bảng, từ điển dữ liệu, ghi chú thiết kế | Thành viên kỹ thuật |
| [15 — Hồ sơ đề xuất cấp độ ATTT](docs/15-ho-so-de-xuat-cap-do-attt.md) | Thuyết minh hệ thống, đề xuất cấp độ, phương án bảo đảm theo TCVN 11930:2017 | Thẩm định ATTT |

### 3.2. Đặc tả và thiết kế

| Tài liệu | Chuẩn áp dụng |
|---|---|
| [08 — Mô tả kiến trúc](docs/08-mo-ta-kien-truc.md) | ISO/IEC/IEEE 42010:2022 |
| [09 — Đặc tả yêu cầu phần mềm (SRS)](docs/09-dac-ta-yeu-cau-srs.md) | ISO/IEC/IEEE 29148:2018; chất lượng theo ISO/IEC 25010:2023 |
| [10 — Yêu cầu sản phẩm (PRD)](docs/10-yeu-cau-san-pham-prd.md) | Tầng sản phẩm: vấn đề, người dùng, phạm vi theo giai đoạn, chỉ số thành công — bổ trợ cho SRS, không trùng lặp |
| [adr/ — Quyết định kiến trúc](docs/adr/README.md) | Michael Nygard ADR — 20 quyết định |
| [12 — Chất lượng dữ liệu](docs/12-chat-luong-du-lieu.md) | ISO/IEC 25012, phép đo theo ISO/IEC 25024 |

### 3.3. Quy trình và vận hành

| Tài liệu | Nội dung |
|---|---|
| [02 — Quy trình bảo quản và sao lưu](docs/02-quy-trinh-bao-quan-sao-luu.md) | OAIS (ISO 14721), PREMIS, quy tắc 3-2-1, kiểm tra toàn vẹn, ứng phó thảm họa — kèm 5 lưu đồ |
| [11 — Kế hoạch kiểm thử](docs/11-ke-hoach-kiem-thu.md) | ISO/IEC/IEEE 29119-3 |
| [13 — Kế hoạch quản lý dự án](docs/13-ke-hoach-quan-ly-du-an.md) | ISO/IEC/IEEE 16326; cổng SRR → PDR → CDR → TRR → UAT |
| [14 — Vận hành và bàn giao](docs/14-van-hanh-va-ban-giao.md) | Sổ tay vận hành, SLA sự cố, đào tạo, danh mục bàn giao, thoát phụ thuộc nhà cung cấp |

### 3.4. Quản trị nội bộ

| Tài liệu | Nội dung |
|---|---|
| [00 — Kế hoạch nâng cấp](docs/00-ke-hoach-nang-cap.md) | Tài liệu làm việc: phạm vi nâng cấp và **các quyết định thiết kế gốc** (mục 0bis → 0septies) — nguồn của phần lớn ADR |
| [16 — Vấn đề đã biết](docs/16-van-de-da-biet.md) | Hạn chế, nợ kỹ thuật, phụ thuộc bên ngoài của bản 1.0.0 |
| [17 — Danh mục kiểm tra trước khi nộp](docs/17-danh-muc-kiem-tra-truoc-nop.md) | Các mục pháp lý cần đối chiếu nguyên văn và việc cần chủ đầu tư xác nhận |
| [Thuật ngữ](docs/thuat-ngu.md) | Từ điển thuật ngữ nghiệp vụ và kỹ thuật dùng thống nhất toàn dự án |
| [CHANGELOG](CHANGELOG.md) | Nhật ký thay đổi theo phiên bản |
| [CONTRIBUTING](CONTRIBUTING.md) | Quy ước phát triển, định nghĩa "Hoàn thành" |
| [SECURITY](SECURITY.md) | Chính sách bảo mật và quy trình xử lý sự cố dữ liệu |
| [data/README](data/README.md) | Quy ước đặt dữ liệu số hóa thật và biểu mẫu metadata |

### 3.5. Báo cáo rà soát nội bộ (`docs/audit/`)

Sáu báo cáo phản biện độc lập thực hiện ngày 12/08/2026, mỗi báo cáo soi hệ thống qua một lăng kính
khác nhau. Đây là **tài liệu nội bộ**, không nộp kèm hồ sơ thầu: chúng ghi cả những điểm yếu chưa
khắc phục. Phần lớn các quyết định trong `docs/adr/` và các mục trong
[16 — Vấn đề đã biết](docs/16-van-de-da-biet.md) bắt nguồn từ đây.

| Báo cáo | Lăng kính |
|---|---|
| [Audit 00](docs/audit/00-tong-hop-de-xuat-nang-cap.md) | Tổng hợp đề xuất nâng cấp — điều phối kết quả của 6 báo cáo bên dưới |
| [Audit 01](docs/audit/01-benchmark-dam-vfx.md) | Đối chiếu hệ quản lý asset của xưởng VFX (ShotGrid, ftrack, Frame.io, Kitsu, Perforce, OpenAssetIO) |
| [Audit 02](docs/audit/02-chuan-bao-tang-so.md) | Chuẩn bảo tàng số quốc tế (CIDOC-CRM, LIDO, Spectrum, IIIF, OAI-PMH) |
| [Audit 03](docs/audit/03-media-3d-splat-bao-quan.md) | Định dạng và bảo quản dài hạn cho 3D, gaussian splat, ảnh, âm thanh–hình ảnh |
| [Audit 04](docs/audit/04-quy-trinh-review-cong-tac.md) | Quy trình duyệt, ghi chú, cộng tác; ma trận RACI theo từng bước |
| [Audit 05](docs/audit/05-kien-truc-va-production.md) | Kiến trúc mã nguồn và khoảng cách tới bản chạy thật |
| [Audit 06](docs/audit/06-red-team-cham-thau.md) | Red-team: hồ sơ này bị đánh trượt ở đâu |

## 4. Nguyên tắc cốt lõi

Năm nguyên tắc chi phối toàn bộ thiết kế; vi phạm bất kỳ nguyên tắc nào đều bị coi là lỗi:

1. **Không có ô trống.** Mọi trường hoặc có giá trị, hoặc mang một trong 5 mã khuyết giá trị tường
   minh — vì "chưa ai nhập" và "đã tra cứu, không thể biết" đòi hỏi hành động trái ngược nhau.
   → [ADR-0005](docs/adr/0005-bo-5-ma-khuyet-gia-tri.md)
2. **Đối tượng thật khác bản số hóa của nó.** Một công trình có nhiều dạng dữ liệu số; danh sách
   đối tượng lấy từ hồ sơ hiện vật, không suy ngược từ tệp đã có — nếu không sẽ không bao giờ đếm
   được cái còn thiếu. → [ADR-0003](docs/adr/0003-tach-truc-objectclass-va-digitalform.md),
   [ADR-0009](docs/adr/0009-danh-sach-doi-tuong-tu-physical-objects.md)
3. **Bản gốc bất biến, mọi thay đổi để lại vết.** Không xóa, không ghi đè — tạo phiên bản hoặc bản
   điều chỉnh có lý do. → [ADR-0010](docs/adr/0010-hoan-tac-hai-tang.md),
   [ADR-0012](docs/adr/0012-nhat-ky-append-only-thoi-han-luu-theo-cap-do-attt.md)
4. **Không trích dẫn văn bản pháp lý chưa xác minh nguyên văn.**
   → [ADR-0014](docs/adr/0014-chi-trich-dan-van-ban-phap-ly-da-xac-minh.md)
5. **Chính sách chỉ có một nguồn, và nằm trong mã.** Quy tắc phân quyền không được phát biểu ở hai
   nơi rồi lệch nhau; quy tắc phân tách nhiệm vụ phải là ràng buộc chạy được, có kiểm thử — không
   chỉ là một câu trong quy chế. → [ADR-0017](docs/adr/0017-ma-tran-phan-quyen-mot-nguon-va-quy-tac-phan-tach-nhiem-vu.md)

## 5. Khung pháp lý áp dụng

Hồ sơ áp dụng khung pháp lý **2024–2026**. Hai văn bản thường bị trích nhầm vì tài liệu cũ còn lưu hành:

> ⚠️ **Nghị định 47/2020/NĐ-CP đã bị bãi bỏ** bởi Điều 23 Nghị định 278/2025/NĐ-CP (22/10/2025).
> **Nghị định 13/2023/NĐ-CP hết hiệu lực từ 01/01/2026**, thay bởi Nghị định 356/2025/NĐ-CP.
> Không viện dẫn hai văn bản này trong bất kỳ tài liệu nào của dự án.

Danh mục đầy đủ ở [Chương 1 — Thuyết minh kỹ thuật](docs/01-thuyet-minh-ky-thuat.md). Các mục
còn phải đối chiếu nguyên văn trước khi nộp được tập hợp tại
[17 — Danh mục kiểm tra trước khi nộp](docs/17-danh-muc-kiem-tra-truoc-nop.md).

## 6. Trạng thái bản 1.0.0

Đây là **bản trình duyệt**: giao diện và luồng nghiệp vụ đầy đủ, dữ liệu là mẫu trình diễn, lớp
dịch vụ giả lập tách rời để thay bằng API thật mà không sửa giao diện. Hạn chế đã biết được liệt
kê trung thực tại [16 — Vấn đề đã biết](docs/16-van-de-da-biet.md).
