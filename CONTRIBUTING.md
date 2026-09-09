# Quy ước phát triển

Hướng dẫn này áp dụng cho toàn bộ mã nguồn ứng dụng quản lý dữ liệu số hóa Văn Miếu — Quốc Tử Giám (thư mục `app/`). Mọi đóng góp — của nhà thầu, đội ngũ kế nhiệm, hoặc bên bảo trì sau bảo hành — tuân theo quy ước này để giữ mã nguồn đồng nhất và dễ bàn giao, đúng cam kết chống khóa nhà cung cấp tại [`docs/14-van-hanh-va-ban-giao.md`](docs/14-van-hanh-va-ban-giao.md) mục 10.

---

## 1. Cấu trúc thư mục

```
app/
  src/
    components/     Thành phần giao diện dùng lại được (PascalCase.tsx + PascalCase.module.css)
    pages/           Một trang ứng với một route (PascalCase + "Page" hậu tố, ví dụ AssetsPage.tsx)
    layout/          Khung ứng dụng dùng chung (AppShell, Header, Sidebar, navConfig)
    context/         React context (AuthContext, AppUiContext)
    services/        Lớp dịch vụ nghiệp vụ — tách interface (types.ts) khỏi triển khai (mock/)
      mock/          Triển khai giả lập hiện tại — sẽ thay bằng lớp gọi API thật, không đổi interface
    data/            Nguồn dữ liệu mẫu (mock) theo từng miền nghiệp vụ; data/objects, data/assets là dữ liệu sinh
    utils/           Hàm tiện ích thuần (không phụ thuộc React), ví dụ assetCode.ts, search.ts, canChi.ts
    theme/           Biến chủ đề (màu, ThemeContext) — MỌI màu sắc phải khai báo hoặc dẫn xuất từ đây
    i18n/             Chuỗi hiển thị theo ngôn ngữ (vi.ts, en.ts, fr.ts) + index.ts điều phối
  tests/             Kiểm thử tự động, chạy bằng `node --experimental-strip-types --test`
  public/            Tài nguyên tĩnh phục vụ nguyên trạng (không qua bundler)
docs/                Bộ hồ sơ kỹ thuật và quản trị dự án (numbered `NN-ten-tai-lieu.md`)
```

Khi thêm một miền nghiệp vụ mới, tạo đủ ba lớp tương ứng: `data/` (nguồn mẫu) → `services/` (interface + triển khai) → `pages/`/`components/` (giao diện) — không để giao diện đọc thẳng từ `data/`, phải luôn đi qua `services/` (xem hạn chế đã ghi nhận ở `docs/16-van-de-da-biet.md` mục 2.3 về các trường hợp còn vi phạm quy tắc này, cần dọn dần).

---

## 2. Quy ước đặt tên

| Loại tệp | Quy ước | Ví dụ |
|---|---|---|
| Component / Page (React) | `PascalCase.tsx`, kèm `PascalCase.module.css` nếu có style riêng | `AssetDetailPage.tsx`, `AssetDetailPage.module.css` |
| Service, util, data module | `camelCase.ts` | `assetService.ts`, `assetCode.ts` |
| Kiểu dữ liệu dùng chung | Khai báo trong `services/types.ts` hoặc file cùng miền, tên kiểu `PascalCase` | `Asset`, `AssetStatus` |
| Trường dữ liệu / cột / khóa API | Tiếng Anh, `snake_case`, khớp 1-1 với `docs/07-mo-hinh-du-lieu.md` khi là dữ liệu nghiệp vụ trao đổi qua API | `object_class`, `digital_form` |
| Biến, hàm, prop trong TypeScript/React | `camelCase` | `zoneOf()`, `onClick` |
| Test | `<tênMôĐun>.test.ts`, đặt trong `app/tests/` | `canChi.test.ts` |
| Tài liệu trong `docs/` | `NN-ten-khong-dau-cach.md`, số hai chữ số tăng dần theo thứ tự tạo | `13-ke-hoach-quan-ly-du-an.md` |

Thuật ngữ song ngữ: mã nguồn/API giữ nguyên **`asset`** làm từ bao trùm kỹ thuật; văn bản tiếng Việt hiển thị cho người dùng gọi chung là **"dữ liệu số hóa"** — không dùng "tài sản" (dễ nhầm với tài sản công theo nghĩa kế toán), đúng quy ước đã chốt tại `docs/00-ke-hoach-nang-cap.md` mục 0bis.

---

## 3. Quy ước commit (Conventional Commits)

Định dạng: `<type>(<phạm-vi-tùy-chọn>): <mô tả ngắn, thì hiện tại, không viết hoa đầu câu>`

| `type` | Dùng khi |
|---|---|
| `feat` | Thêm chức năng hoặc màn hình mới |
| `fix` | Sửa lỗi |
| `docs` | Chỉ thay đổi tài liệu (`docs/`, `README.md`, các tệp `.md` gốc) |
| `refactor` | Tái cấu trúc mã, không đổi hành vi quan sát được |
| `perf` | Cải thiện hiệu năng |
| `test` | Thêm hoặc sửa kiểm thử |
| `chore` | Việc bảo trì không ảnh hưởng mã nguồn ứng dụng (cấu hình build, phụ thuộc) |
| `style` | Định dạng mã (không ảnh hưởng logic) — không dùng cho thay đổi màu giao diện, việc đó là `fix`/`feat` |

Ví dụ: `feat(inventory): thêm màn kiểm kê định kỳ CN-09`, `fix(search): bỏ dấu hai chiều khi tìm theo mô tả`, `docs(14): bổ sung SLA sự cố theo mức độ`.

Commit gắn với một yêu cầu chức năng (CN-xx) hoặc mã rủi ro (R-xx) nên ghi mã đó trong phần mô tả dài để truy vết ngược lại `docs/03-ma-tran-truy-vet.md` và `docs/13-ke-hoach-quan-ly-du-an.md`.

---

## 4. Quy trình nhánh và review

Quy ước nhánh đầy đủ (`main`, `develop`, `feature/<mã-CN>-<mô-tả>`, `fix/<mô-tả>`, `release/<version>`) đã định nghĩa tại `docs/13-ke-hoach-quan-ly-du-an.md` mục 6.2 — đây là bản áp dụng thực tế cho quy trình hằng ngày:

1. Nhánh làm việc tách từ `develop` (hoặc `main` nếu là bản vá khẩn cấp trong bảo hành).
2. Không commit thẳng vào `main`/`develop` — mọi thay đổi qua pull request.
3. Pull request phải mô tả: **thay đổi gì**, **vì sao** (liên kết CN-xx/R-xx/mã lỗi nếu có), **đã kiểm tra Definition of Done chưa** (Mục 5).
4. Review tối thiểu một người khác đọc và duyệt trước khi merge — với thay đổi ảnh hưởng nội dung di sản (fact, niên đại, vị trí), người duyệt phải bao gồm hoặc tham vấn đầu mối chuyên môn di sản, đúng nguyên tắc chống rủi ro R-01.
5. Merge vào `develop` bằng squash hoặc merge commit thống nhất trong nhóm; merge `release/*` vào `main` chỉ sau khi qua cổng rà soát tương ứng (`docs/13-ke-hoach-quan-ly-du-an.md` mục 4).
6. Xung đột giữa nhánh phải giải quyết bởi người tạo pull request, không phải người review.

---

## 5. Định nghĩa "Hoàn thành" (Definition of Done)

Một thay đổi chỉ được coi là **Hoàn thành** khi thỏa **toàn bộ** điều kiện dưới đây — thiếu một điều kiện nghĩa là chưa xong, không có "gần xong":

### 5.1. Kiểm tra tự động chạy sạch

Chạy từ thư mục `app/`:

```
npx tsc --noEmit -p tsconfig.app.json   # không còn lỗi kiểu
npm run build                            # tsc -b && vite build — build production không lỗi
npm test                                 # node --experimental-strip-types --test tests/**/*.test.ts — không có test thất bại
```

Ba lệnh trên tương ứng trực tiếp tiêu chí kiểm thử tại `docs/13-ke-hoach-quan-ly-du-an.md` mục 9.1 (lớp mã nguồn) và là điều kiện tối thiểu để một pull request được xem xét merge — không phải điều kiện đủ để coi là đã kiểm thử đầy đủ (kiểm thử tích hợp, hiệu năng, an toàn xem Chương 12.3, `docs/01-thuyet-minh-ky-thuat.md`).

### 5.2. Không ghi cứng mã màu ngoài biến chủ đề

Mọi màu sắc lấy từ `src/theme/` (biến CSS hoặc `theme/color.ts`), không viết mã hex/rgb trực tiếp trong component hoặc CSS module. Đây là quy tắc đang có ngoại lệ tồn đọng (`docs/16-van-de-da-biet.md` mục 4.2) — thay đổi **mới** không được thêm ngoại lệ mới, kể cả khi khu vực xung quanh đã vi phạm.

### 5.3. Không để ô trống — phải dùng mã khuyết giá trị

Trường dữ liệu thiếu thông tin phải gán một trong các mã khuyết giá trị đã chuẩn hóa (`KHONG_AP_DUNG`, `CHUA_XAC_DINH`, `KHONG_RO`, `CHUA_NHAP`, `HAN_CHE` — định nghĩa đầy đủ tại `docs/00-ke-hoach-nang-cap.md` mục 0quinquies), không để chuỗi rỗng, `null` không giải thích, hoặc bỏ qua trường. Giao diện nhập liệu mới phải có lối chọn nhanh mã khuyết giá trị, không bắt gõ tay.

### 5.4. Không viện dẫn văn bản pháp lý chưa xác minh

Chuỗi hiển thị, chú thích mã nguồn, hoặc tài liệu không được trích dẫn số hiệu văn bản pháp luật mà chưa đối chiếu nguyên văn — đặc biệt: **không dùng Nghị định 47/2020/NĐ-CP hoặc Nghị định 13/2023/NĐ-CP** (cả hai đã hết hiệu lực; dùng Nghị định 278/2025/NĐ-CP và Nghị định 356/2025/NĐ-CP thay thế). Nội dung chưa chắc chắn ghi kèm "(cần đối chiếu nguyên văn trước khi nộp)" thay vì khẳng định.

### 5.5. Chuỗi hiển thị phải qua i18n

Không viết chuỗi tiếng Việt/Anh trực tiếp trong JSX — thêm khóa vào `src/i18n/vi.ts` (và `en.ts`/`fr.ts` nếu đã có bản dịch) rồi gọi qua cơ chế của `src/i18n/index.ts`. Đây là điều kiện để không lặp lại tình trạng đã ghi nhận tại `docs/16-van-de-da-biet.md` mục 3.1.

---

## 6. Quy tắc viết tài liệu

- Tài liệu kỹ thuật/quản trị dự án đặt trong `docs/`, đánh số hai chữ số tăng dần; tài liệu quản trị chung của kho mã (như tệp này) đặt tại gốc dự án.
- **Mọi tài liệu mới phải được liệt kê trong `README.md` gốc** ngay trong cùng pull request tạo ra nó — không tạo tài liệu "mồ côi" mà README chưa trỏ tới.
- Mỗi tài liệu trong `docs/` mở đầu bằng bảng thông tin tài liệu (mã, phiên bản theo SemVer, ngày ban hành, trạng thái, tài liệu liên quan kèm đường dẫn tương đối) — theo mẫu đã áp dụng tại `docs/13-ke-hoach-quan-ly-du-an.md`, `docs/14-van-hanh-va-ban-giao.md`, `docs/16-van-de-da-biet.md`.
- Khi sửa mã nguồn làm tài liệu liên quan lạc hậu (ví dụ đổi hành vi mà `docs/16-van-de-da-biet.md` đang mô tả là hạn chế), cập nhật tài liệu trong cùng pull request, không tách việc "dọn tài liệu" ra làm sau.

---

