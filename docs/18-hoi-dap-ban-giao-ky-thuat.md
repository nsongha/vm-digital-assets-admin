# 18 — Bàn giao kỹ thuật: kiến trúc & mã nguồn

> **Đối tượng đọc:** kỹ sư tiếp nhận, bảo trì và phát triển tiếp hệ thống *VM Digital Assets Admin*.
> **Ngày cập nhật:** 09/09/2026 · **Ảnh chụp mã nguồn:** `app/` — 110 tệp TS/TSX, **16.787 dòng**, 42 tệp `.module.css`, 4 dependency runtime.
> **Về các trích dẫn `file:dòng`:** mọi trích dẫn dạng `duong/dan.ts:12-18` trong tài liệu này là **ảnh chụp mã nguồn tại ngày 09/09/2026**. Số dòng sẽ trôi khi mã thay đổi; hãy kiểm lại vị trí trước khi dựa vào một trích dẫn cụ thể.

---

## Phạm vi tài liệu

**Tài liệu này phủ:** lựa chọn công nghệ nền và lý do; cấu trúc mã nguồn và quy ước; lớp dịch vụ giả lập cùng đường di trú lên API thật; mô hình dữ liệu và hệ mã định danh; mô hình phân quyền và mức độ thực thi; quản lý trạng thái, hiệu năng ở quy mô lớn, kiểm thử; quy trình build và cách chạy dự án; các điểm tích hợp ra ngoài.

**Tài liệu này không phủ:** vận hành và hạ tầng triển khai; lộ trình sản phẩm và dự toán tài chính; khung pháp lý, tuân thủ và hồ sơ thầu; quy trình nghiệp vụ của đơn vị sử dụng. Bốn mảng đó nằm ở các tài liệu bàn giao khác trong `docs/`.

**Đọc cùng:**

- `docs/07-mo-hinh-du-lieu.md` — đặc tả mô hình dữ liệu đầy đủ.
- `docs/adr/` — 16 ADR ghi lại các quyết định kiến trúc. Tài liệu này dẫn chiếu ADR-0002, 0003, 0004, 0005, 0010, 0011, 0012, 0013, 0014, 0016.
- `docs/audit/` — 6 báo cáo audit độc lập, mỗi báo cáo một lăng kính, viết mà không đọc kết quả của nhau. Phần lớn số liệu định lượng trong tài liệu này trích từ `docs/audit/05-kien-truc-va-production.md`.
- `.claude/launch.json` — cấu hình chạy hai dev server (xem mục 29).

**Cách tổ chức mỗi mục:** phần đầu nêu kết luận về hiện trạng; phần giữa trình bày chi tiết triển khai kèm trích dẫn mã nguồn; phần cuối là một khối nhãn **Hạn chế đã biết**, **Lưu ý khi tiếp nhận** hoặc **Điểm dễ hiểu nhầm** — mô tả chỗ hệ thống chưa hoàn chỉnh, chỗ dễ đọc sai, và chi phí khắc phục tính bằng người-ngày. Các khối đó là một phần của bàn giao, không phải phụ chú.

---

## Hiện trạng hệ thống tại thời điểm bàn giao

Bản bàn giao này là một **MVP chạy hoàn toàn trên lớp dịch vụ giả lập (mock), chưa có backend**. Đây là trạng thái **có chủ đích** theo ADR-0002: mục tiêu của giai đoạn vừa qua là phủ nghiệp vụ (20+ màn, pipeline 11 trạng thái, kiểm kê, tuân thủ, nhật ký) trên một lớp dữ liệu suy diễn được, chứ không phải dựng hạ tầng production. Hệ quả của lựa chọn đó — và chi phí gỡ ra — được trình bày đầy đủ ở nhóm B.

Các chỉ số đo được tại thời điểm chụp:

| Chỉ số | Giá trị |
|---|---|
| Mã nguồn ứng dụng | **16.787 dòng** TS/TSX trong 110 tệp |
| Tệp CSS Module | 42 tệp `.module.css` |
| Dependency runtime | **4 gói**: `react`, `react-dom`, `react-router-dom`, `three` |
| Kiểm thử | **16 test, đạt 16/16**; 154 dòng test = 0,92% dòng mã |
| Lớp dịch vụ | **đồng bộ 100%** — `grep "Promise\|async\|await"` trong `app/src/services/` trả về 0 kết quả |
| Typecheck | `npx tsc -b --noEmit` → **exit 0** |
| Lint | `npm run lint` (oxlint) → **exit 0**, 6 cảnh báo mỹ phẩm |
| Dùng `any` | **0 lần** trong toàn repo; 4 lần khẳng định non-null `!` |
| Gói build | một chunk **1,14 MB** (302 KB sau gzip) |
| Quản lý mã nguồn | **chưa có Git, chưa có CI** |

Điểm kiến trúc của audit nội bộ là **2,05/5 theo thước "sẵn sàng chạy production"** (≈ 41% chặng đường), và **4/5 theo thước "chất lượng thủ công của phần đã viết"**. Hai thước đo hai thứ khác nhau; khoảng cách giữa chúng chính là danh sách việc còn lại, đã được lượng hoá ở mức **163–243 người-ngày** cho toàn bộ nền móng production.

**Bảy hạn chế nền của bản bàn giao** — trình bày chi tiết ở các mục tương ứng:

1. Lớp dịch vụ đồng bộ 100%, không có `Promise` (mục 7) — nợ kỹ thuật lớn nhất.
2. `RequireAuth` chỉ kiểm tra đã đăng nhập, **không kiểm tra vai trò** (mục 18).
3. Đối tượng quyền `can` được tính đầy đủ nhưng **không component nào tiêu thụ** (mục 18).
4. Không có viewer 3D thật — chỉ có hình khối dựng thủ tục, không có `GLTFLoader` (mục 4).
5. Hai ứng dụng (admin và GS Immersive Tour) **không trao đổi dữ liệu** (mục 35).
6. Chưa có Git và chưa có CI (mục 30).
7. Ứng dụng còn gọi ra internet: Google Fonts và 6 ảnh Wikimedia (mục 28).

---

## Mục lục

| Nhóm | Chủ đề | Mục |
|---|---|---|
| **A** | Công nghệ nền: React + Vite + CSS Modules, không thư viện UI | 1–5 |
| **B** | Lớp dịch vụ giả lập và đường lên API thật | 6–11 |
| **C** | Mô hình dữ liệu hai trục và mã định danh hai tầng | 12–16 |
| **D** | Phân quyền: thiết kế chính sách và mức độ thực thi | 17–21 |
| **E** | Quản lý trạng thái, hiệu năng ở quy mô thật, kiểm thử | 22–28 |
| **F** | Build, CI, quy ước mã nguồn, cách chạy dự án | 29–32 |
| **G** | Tuỳ chỉnh sidebar, nhúng GS Immersive Tour, trang Trợ giúp | 33–37 |

---

## Nhóm A — Công nghệ nền

### 1. Lựa chọn nền tảng: React + Vite thay vì Next.js, Angular hoặc Vue

Sản phẩm là một **admin nội bộ sau đăng nhập** — không có yêu cầu SEO, không cần render phía máy chủ, không có trang tĩnh công khai. Next.js sẽ đòi hỏi vận hành một máy chủ Node trong khi lợi ích đặc trưng của nó (SSR, SEO) bằng 0 trong bối cảnh này. React + Vite tạo ra một bó tệp tĩnh, đặt sau Nginx là chạy — phù hợp với năng lực đội IT của Trung tâm. React được chọn vì đây là hệ sinh thái phổ biến nhất tại Việt Nam, tức rủi ro bàn giao thấp nhất.

**Chi tiết triển khai:**

- Toàn bộ runtime dependency chỉ có **4 gói**: `react`, `react-dom`, `react-router-dom`, `three` (`app/package.json:14-19`). Ít phụ thuộc đồng nghĩa với ít bề mặt bảo mật, ít việc nâng cấp, ít rủi ro một gói bị bỏ rơi.
- Vite 8 + `@vitejs/plugin-react`: dev server khởi động dưới 1 giây, HMR gần như tức thì. `npm run build` = `tsc -b && vite build` (`package.json:9`) — **typecheck chặn build**, mã sai kiểu không build ra được.
- Định tuyến phía client bằng `react-router-dom` v6, không có route động sinh từ hệ tệp. Toàn bộ bản đồ route nằm trong một tệp duy nhất (`app/src/App.tsx`), dễ đọc và dễ audit.
- Angular bị loại vì nặng và nguồn nhân lực tiếp nhận trong nước hiếm; Vue bị loại vì lợi thế kỹ thuật không bù được việc thu hẹp nguồn nhân lực tuyển được.
- Phiên bản: TypeScript `~6.0.2`, React `^19.2.8` — đều là bản mới, đánh đổi có chủ đích lấy vòng đời hỗ trợ dài hơn.

**Điểm dễ hiểu nhầm:** lý do chọn React **không phải hiệu năng**. Ở tải công việc của ứng dụng này React không nhanh hơn Angular hay Vue; căn cứ lựa chọn là **rủi ro bàn giao và độ phù hợp với mô hình triển khai tĩnh**. Nếu về sau xuất hiện yêu cầu SEO cho một cổng tra cứu công khai, cổng đó là **một ứng dụng khác**, không phải app admin này; khi đó mới cân nhắc SSR/SSG, và vì mô hình dữ liệu đã tách sẵn nên hai ứng dụng dùng chung API được.

### 2. Lựa chọn giao diện: tự viết CSS Modules thay vì thư viện UI

Hệ thống không dùng MUI, Ant Design hay shadcn. Ba căn cứ, theo thứ tự quan trọng. Một, **chủ quyền dữ liệu và khả năng chạy khi ngắt mạng**: thư viện UI kéo theo font, icon, đôi khi cả CDN, trong khi sản phẩm phải chạy được trong mạng nội bộ không internet. Hai, **ngôn ngữ thị giác di sản**: giao diện cần chất Văn Miếu chứ không phải Material Design; ép một design system nước ngoài rồi override lại tốn công hơn tự viết. Ba, **kích thước gói**: MUI + emotion thêm khoảng 300–400 KB gzip vào một ứng dụng hiện chỉ 302 KB gzip. Cái giá phải trả là dự án tự chịu trách nhiệm về khả năng tiếp cận (a11y).

**Chi tiết triển khai:**

- 42 tệp `.module.css`, phạm vi CSS được cô lập theo component ở mức trình build (không rò rỉ tên lớp), không cần quy ước BEM, không có runtime CSS-in-JS.
- Hệ chủ đề bằng biến CSS ở `:root` — 7 chủ đề định nghĩa ở `app/src/theme/themes.ts`. Đổi chủ đề là đổi biến chứ không đổi lớp.
- Mức đầu tư a11y ở thành phần cốt lõi là nghiêm túc: `app/src/components/Modal.tsx:19-50` lưu tiêu điểm trước khi mở (`:20`), chuyển tiêu điểm vào trong (`:23`), **bẫy Tab hai chiều** (`:36-42`), đóng bằng Escape (`:26-29`), **hoàn trả tiêu điểm khi đóng** (`:48`), đặt `role="dialog"` + `aria-modal` (`:57-58`). Audit ghi nhận mức này cao hơn nhiều sản phẩm thương mại.

**Hạn chế đã biết** — ba lỗi a11y đã xác định và chưa sửa, tổng chi phí **0,5–1 người-ngày**, đã nằm trong gói P0:

- `ConfirmModal.tsx:34` gọi `<Modal>` mà không truyền `label`, nên hộp thoại xác nhận **không có tên với trình đọc màn hình**.
- `Modal` **không dùng portal**, trái với mô tả trong ADR-0013.
- Chủ đề `crimson` (`theme/themes.ts:31`) có tương phản **1,81:1**, trượt WCAG AA.

**Lưu ý khi tiếp nhận:** 42 tệp CSS được đặt cạnh component và đặt tên theo component; không có CSS toàn cục ngoài thư mục `theme/`. Sửa một màn hình chỉ cần mở đúng một tệp. Quyết định này được ghi lại ở ADR-0013. Việc chuyển sang Tailwind ở thời điểm hiện tại đồng nghĩa với viết lại toàn bộ 42 tệp mà không thêm tính năng nào cho người dùng; khuyến nghị giữ nguyên đến khi có backend rồi đánh giá lại.

### 3. Các thành phần giao diện tự viết: bảng, phân trang, hộp thoại, biểu đồ

Toàn bộ thành phần phức tạp được tự viết và nằm gọn trong `app/src/components/`: bảng là `AssetTable.tsx`, phân trang là `Pagination.tsx`, hộp thoại là `Modal.tsx` + `ConfirmModal.tsx`, biểu đồ là SVG dựng tay. Ưu điểm là không có hành vi nào nằm ngoài tầm kiểm soát của dự án. Hạn chế là **chưa có ảo hoá danh sách, và phân trang hiện vẽ toàn bộ số trang** — ở 150 bản ghi không lộ, ở 10.000 bản ghi thì vỡ.

**Chi tiết triển khai:**

- `app/src/components/Pagination.tsx:12` — `Array.from({ length: totalPages }, ...)` sinh **toàn bộ** nút số trang. Với `PAGE_SIZE = 10` (`pages/AssetsPage.tsx:18`), 10.000 bản ghi ⇒ **1.000 nút DOM**, mỗi nút mang `style` nội tuyến (`:34`) nên React so lại thuộc tính từng nút mỗi lần render.
- `app/src/components/AssetTable.tsx:29` vẽ `assets.map(...)` không ảo hoá. Ở trang thư viện điều này an toàn vì đầu vào đã cắt trang xuống 10 dòng (`AssetsPage.tsx:60`); nhưng `pages/InventoryPage.tsx:319` và `:389` vẽ **toàn bộ** phạm vi đợt kiểm kê.
- Biểu đồ (sparkline, vòng tròn tiến độ) là SVG viết tay, không nạp Chart.js hay D3 — nhất quán với chủ trương ít phụ thuộc.

**Hạn chế đã biết:** ngưỡng vỡ hiệu năng của cách dựng hiện tại là khoảng **3.200 bản ghi** (số liệu và cơ chế ở mục 24). Hai việc khắc phục: phân trang cửa sổ trượt — chỉ vẽ 7 nút quanh trang hiện tại — dưới **nửa người-ngày**; ảo hoá bảng bằng `react-window` hoặc tự viết — **1–2 người-ngày**. Đã nằm trong `ARC-03` và `ARC-07`.

### 4. Vai trò của Three.js và ảnh hưởng tới kích thước gói

Three.js dựng khối xem trước bia đá ở màn chi tiết tài sản. **Đây là hình khối dựng thủ tục, không phải mô hình 3D thật được nạp từ tệp** — trong mã nguồn không có `GLTFLoader` và không có tệp `.glb` nào. Về kích thước gói, three.js hiện được nạp ngay từ màn đăng nhập dù chỉ dùng ở một màn; đây là thiếu sót tách gói, khắc phục bằng `React.lazy` mất khoảng nửa người-ngày.

**Chi tiết triển khai:**

- `app/src/components/StelePreview.tsx:23-75` — bia và rùa dựng bằng `BoxGeometry`, `SphereGeometry` co giãn, `CylinderGeometry`. Chú thích ở `:10-15` ghi rõ khối này được chuyển 1:1 từ `viewer.js` của bản mockup. **Mọi bia hiện trông giống hệt nhau.**
- Gói build hiện là **một chunk duy nhất 1,14 MB** (302 KB sau gzip) — `app/dist/assets/index-*.js`. Tách `three` ra chunk riêng kèm `React.lazy` cho màn chi tiết là hạng mục `ARC-07`, **0,5 người-ngày**.
- Phần dọn dẹp tài nguyên được làm khá kỹ (`StelePreview.tsx:129-147`): huỷ vòng lặp `requestAnimationFrame`, ngắt `ResizeObserver`, gỡ 4 trình nghe, `dispose()` renderer cùng vật liệu và hình học.

**Hạn chế đã biết:**

- **Thiếu `renderer.forceContextLoss()`** trong đường dọn dẹp. Vào ra màn chi tiết nhiều lần có thể rò ngữ cảnh WebGL; trình duyệt giới hạn khoảng 16 ngữ cảnh đồng thời.
- Khoảng cách tới dữ liệu 3D thật rất lớn: rùa bia quét ở độ phân giải bảo quản là **8–14 triệu tam giác** theo chính tham số dự án (`data/objects/artifactsGenerated.ts:68-69`), cho ra tệp GLB **350–620 MB**. Nạp thẳng vào trình duyệt là không khả thi; cần nén Draco/meshopt, LOD và 3D Tiles (`ARC-13`).

**Điểm dễ hiểu nhầm:** tài liệu `docs/03:25` và `docs/16:91` mô tả ứng dụng "tải GLB qua `GLTFLoader` và `.ply`/`.sog` qua `gaussian-splats-3d`". **Mô tả đó không khớp với mã nguồn hiện tại** — `package.json` chỉ có `three`. Sai lệch này đã được ghi nhận qua audit nội bộ và nằm trong danh sách sửa câu chữ tài liệu. Khi đối chiếu năng lực 3D, hãy lấy mã nguồn làm chuẩn, không lấy `docs/03` và `docs/16`.

### 5. Chất lượng mã nguồn: hai thước đo và kết quả

Chất lượng mã nguồn cho hai kết quả rất khác nhau tuỳ thước đo. Theo thước **"sẵn sàng chạy production"**: **2,05/5**, tương đương khoảng 41% chặng đường — đúng kỳ vọng cho một bản chưa có backend. Theo thước **"chất lượng thủ công của phần đã viết"**: **4/5** — `tsc` sạch, `lint` sạch, **0 lần dùng `any`** trong toàn repo, không có con số nào ghi cứng ở tầng hiển thị (trừ ngoại lệ nêu ở mục 10). Khoảng cách giữa hai con số là danh sách việc còn lại, lượng hoá ở mức **163–243 người-ngày**.

**Chi tiết triển khai:**

- `npx tsc -b --noEmit` → **exit 0**. `npm run lint` (oxlint) → **exit 0** với 6 cảnh báo đều thuộc loại mỹ phẩm (`react/only-export-components`).
- `tsconfig.app.json` bật `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`. **0 lần `any`**, chỉ 4 lần khẳng định non-null `!`.
- Hai hạng mục đạt **5/5** trong audit: (1) **suy diễn dữ liệu** — mọi dung lượng tính từ công thức vật lý ở `data/sizeFormulas.ts`, mọi bản ghi sinh từ hạt giống có seed cố định (`data/assets/generator.ts:55-99`), nên không tồn tại nhóm lỗi "số trên thẻ khác số trong trang"; (2) **tài liệu trong mã** — chú thích giải thích *vì sao* chứ không phải *cái gì*, ví dụ `data/assets.ts:22-30` giải thích vì sao danh sách đối tượng không được suy ngược từ `ASSETS`.
- Ba hạng mục thấp nhất: ranh giới bất đồng bộ **1/5**, phân quyền phía client **1/5**, xử lý lỗi **1/5**.

**Lưu ý khi tiếp nhận:** con số 2,05/5 là **điểm sẵn sàng production**, không phải điểm chất lượng mã. Nguồn chấm là 6 báo cáo audit độc lập trong `docs/audit/`, mỗi báo cáo một lăng kính, viết mà không đọc kết quả của nhau; những phát hiện được nhiều lăng kính độc lập cùng chỉ ra có độ tin cậy cao hơn. Toàn bộ báo cáo đã bàn giao kèm.

---

## Nhóm B — Lớp dịch vụ giả lập và đường lên API thật

> Đây là nhóm quan trọng nhất của tài liệu. Nợ kỹ thuật lớn nhất của dự án — **lớp dịch vụ đồng bộ 100%** — nằm ở mục 7, và nó chặn phần lớn các hạng mục còn lại.

### 6. Cấu trúc lớp dịch vụ và mức độ tách khỏi giao diện

Hệ thống có một cổng vào dữ liệu duy nhất là `app/src/services/index.ts`, xuất ra đối tượng `services` gồm 6 dịch vụ: assets, collections, users, audit, connections, uploads. Component gọi `services.assets.list()` chứ không truy cập dữ liệu trực tiếp. Chú thích tại `services/index.ts:8-9` ghi rõ mục tiêu thiết kế là "đổi mock sang API thật mà không phải sửa điểm gọi". **Ở trạng thái hiện tại mục tiêu đó chưa đạt**, vì bốn chỗ hở mô tả dưới đây.

**Chi tiết triển khai:**

- Cấu trúc: `services/index.ts` (cổng vào), `services/types.ts` (kiểu miền), `services/store.ts` (store quan sát được, 24 dòng), `services/useStore.ts` (cầu nối `useSyncExternalStore`), `services/mock/` (6 cài đặt).
- Mỗi service là một `interface` cộng một object literal cài đặt nó. Ví dụ `mock/assetService.ts:21-38` khai báo `AssetService`, `:40` cài đặt. Các phương thức nghiệp vụ có chú thích tiếng Việt gắn với ADR: `advanceStatus` đi theo `PIPELINE_SEQUENCE`, `requestRevision` bắt buộc lý do, `unpublish` giữ lại bản ghi chứ không xoá (`:25-37`).

**Hạn chế đã biết — bốn chỗ hở** (audit 05 mục 3.1):

- **(a) Toàn bộ hợp đồng là đồng bộ.** Chi tiết ở mục 7.
- **(b) `readonly store: Store<Asset[]>` nằm bên trong interface** (`assetService.ts:22`, tương tự `uploadService.ts:27`, `connectionService.ts:18`, `userService.ts:29`). Hợp đồng công khai vì thế khẳng định sự tồn tại của một mảng dữ liệu nằm sẵn trong bộ nhớ trình duyệt.
- **(c) Interface được định nghĩa bên trong tệp mock rồi re-export** (`services/index.ts:19-24`), nên cài đặt thật sẽ phải import kiểu từ cài đặt giả — phụ thuộc ngược chiều.
- **(d) Cổng vào không được thực thi bằng máy.** Có 7 điểm import thẳng `services/mock/*`, và nặng hơn là **50 câu lệnh import trực tiếp từ `data/` nằm trong 18 tệp** thuộc `pages/` và `components/` — trái với cam kết viết ngay tại `services/types.ts:1-3` ("Components only ever import these — never `src/data` directly").

18 tệp vi phạm gồm `ObjectsPage`, `DashboardPage`, `BackupPage`, `ReportsPage`, `CompliancePage`, `InventoryPage` và các tệp khác. Một phần vô hại — `data/taxonomy.ts` chỉ chứa nhãn hiển thị và đúng ra nên nằm ở `i18n/`. Nhưng `data/dashboard.ts`, `data/compliance.ts`, `data/metadataFields.ts` là **dữ liệu nghiệp vụ mà backend sẽ phải cung cấp**; những trang tiêu thụ chúng hiện **chưa có đường di trú**.

**Lưu ý khi tiếp nhận:** việc tách giao diện khỏi dữ liệu là **tách theo thiết kế, chưa được thực thi bằng máy**. Cách khoá lại rẻ nhất là một quy tắc lint `no-restricted-imports` cấm `pages/**` và `components/**` import `data/**` (`ARC-09`) — **dưới 1 người-ngày**, và nên hoàn thành trước khi bắt đầu thi công backend.

### 7. Hợp đồng dịch vụ đồng bộ 100% — nợ kỹ thuật lớn nhất

Lớp dịch vụ **đồng bộ hoàn toàn**: `grep "Promise|async|await"` trong `app/src/services/` trả về **0 kết quả**. Đây là nợ kỹ thuật lớn nhất của dự án. Hệ quả là việc nối API thật **không phải** thao tác "thay implementation sau interface" như ADR-0002 dự kiến, mà là **viết lại tầng gọi ở mọi component**, vì hiện không có chỗ nào xử lý trạng thái tải, lỗi, hay điều kiện tranh chấp. Chi phí xử lý ước **4–6 người-ngày** và phải làm **trước tiên** — làm sau thì các hạng mục khác phải làm hai lần.

**Chi tiết triển khai:**

- Chữ ký hiện tại (`mock/assetService.ts:23-35`): `list(): Asset[]`, `get(id): Asset | undefined`, `search(query): Asset[]` — 8/8 phương thức trả giá trị trực tiếp. Toàn repo có **24 điểm gọi `services.*`**.
- Bốn hệ quả cụ thể khi nối API thật:
  1. `list(): Asset[]` phải trở thành `list(params): Promise<Page<Asset>>` — mọi điểm gọi chuyển từ **biểu thức** sang **hiệu ứng**, tức đổi cả cấu trúc component.
  2. `get(id): Asset | undefined` — hiện `undefined` chỉ mang nghĩa "không tìm thấy". Với mạng thật, giá trị đó còn có thể là "chưa tải xong", "hết thời gian chờ", hoặc "403". **Ba trạng thái khác nhau bị nén vào một giá trị.**
  3. `advanceStatus(id)` trả `Asset` mới **ngay lập tức** (`:48-53`). Với API thật, giữa thời điểm bấm nút và thời điểm máy chủ xác nhận có một khoảng mà giao diện phải biểu diễn — bằng cập nhật lạc quan có đường lùi, hoặc bằng trạng thái chờ. Cấu trúc hiện tại **không có chỗ cho cả hai**.
  4. `requestRevision` và `unpublish` **ném `Error` đồng bộ** khi thiếu lý do (`assetService.ts:58`, `:62`). Với API thật, lỗi nghiệp vụ đến bất đồng bộ dưới dạng 4xx và phải kết xuất ra giao diện, không phải ném vào ngăn xếp render của React.
- **Không có `try/catch` nào bao quanh các lời gọi này ở tầng trang**, và cũng không có `ErrorBoundary`: grep `ErrorBoundary|componentDidCatch|Suspense|React.lazy|skeleton` trả về **0 kết quả**. Vì vậy một `Error` ném ra từ `requestRevision` hiện leo thẳng lên và **làm trắng toàn bộ ứng dụng**.

**Điểm dễ hiểu nhầm:** việc chuyển đổi **không phải là thêm từ khoá `async`**. Đổi chữ ký kéo theo mọi điểm gọi phải đổi cấu trúc — đó là nguồn gốc của con số 4–6 người-ngày. ADR-0002 đặt mục tiêu đúng nhưng phần thực thi chưa tới đích; sai lệch này do audit nội bộ phát hiện và hiện đứng số 1 trong danh sách việc.

### 8. Lộ trình chuyển sang API thật và cơ sở của ước lượng

Việc chuyển đổi tách thành hai phần độc lập. **Phần một — bọc lớp dịch vụ trả `Promise` và tách hợp đồng ra `services/contracts.ts`: 4–6 người-ngày, làm được ngay trên mock, không cần backend.** **Phần hai — nối vào API thật và xử lý trạng thái mạng**: nằm trong gói 6 tháng đầu, khoảng **105–153 người-ngày** cho toàn bộ nền móng production. Con số đến từ audit 05, dựa trên số điểm gọi đã đếm thực tế trong mã nguồn.

**Chi tiết triển khai — phần một, bốn bước theo đúng thứ tự:**

1. Tạo `services/contracts.ts` chứa các interface, để mock `implements` chúng — gỡ phụ thuộc ngược "thật phụ thuộc giả" ở `services/index.ts:19-24`.
2. Đổi mọi phương thức thành `Promise`; mock chỉ cần `Promise.resolve(...)` nên **hành vi không đổi và bản demo không vỡ**.
3. Bỏ `store` khỏi interface và viết lại 5 điểm `useStore`: `pages/UploadPage.tsx:45` và `:46`, `pages/ObjectDossierPage.tsx:132`, `pages/AssetDetailPage.tsx:43`, `pages/SharePage.tsx:18`.
4. Thêm `ErrorBoundary` và trạng thái tải để tầng gọi mới có chỗ biểu diễn.

**Vì sao `store` phải rời khỏi interface:** `readonly store: Store<Asset[]>` ngầm khẳng định *"tồn tại một mảng chứa toàn bộ asset trong bộ nhớ trình duyệt"*. Ở quy mô 100.000 bản ghi (≈ 69 MB JSON, audit đo ở mục 4) tiền đề đó sai. Chính đây là "touching call sites" mà `services/index.ts:8-9` đặt mục tiêu tránh.

**Phần hai bao gồm:** `ARC-16` đặc tả API nội bộ, `ARC-03` phân trang phía máy chủ, `ARC-02` TanStack Query, `ARC-14` thu nhận OAIS, `ARC-15` nhật ký bất biến.

**Lưu ý khi tiếp nhận:** hai phần không được gộp thành một con số ước lượng, vì phần một đo được và không phụ thuộc bên nào, còn phần hai phụ thuộc kiến trúc backend chưa chốt đặc tả. Phần một nên làm ngay: nó rẻ ở thời điểm hiện tại và đắt hơn nhiều lần sau khi đã có backend.

### 9. Bối cảnh của quyết định chọn hợp đồng đồng bộ

Việc chọn hợp đồng đồng bộ là quyết định có chủ đích ở giai đoạn dựng bản trình diễn: mã ngắn hơn, không có trạng thái trung gian, dựng 20 màn nhanh hơn đáng kể. Quyết định đó **hợp lý ở giai đoạn đó và hết hợp lý từ thời điểm mục tiêu chuyển từ "trình diễn" sang "nối backend"**. Vấn đề tốn kém thực sự không nằm ở tính đồng bộ, mà ở việc **`store` rò rỉ vào hợp đồng công khai** — đó là nguyên nhân khiến việc gỡ ra tốn 4–6 người-ngày thay vì 1.

**Chi tiết triển khai:**

- Nếu ngay từ đầu các phương thức chỉ trả `Promise` và `store` không nằm trong interface, việc chuyển đổi sẽ chỉ là đổi cài đặt bên trong — đúng như ADR-0002 dự kiến. Chi phí thật nằm ở chỗ hở (b) và (d) của mục 6, không nằm ở từ khoá `async`.
- Bối cảnh: bản này được dựng để chấm thầu, ưu tiên phủ nghiệp vụ (20+ màn, pipeline 11 trạng thái, kiểm kê, tuân thủ, nhật ký) hơn là phủ hạ tầng. Đánh đổi đó cho kết quả đo được: hạng mục "suy diễn dữ liệu và nhất quán" đạt 5/5, không có số ghi cứng ở tầng hiển thị ngoài ngoại lệ ở mục 10.

**Hạn chế đã biết — một trường hợp cùng loại:** `pages/InventoryPage.tsx:63` gọi `services.users.list()` ở **cấp module**, tức chạy đúng một lần lúc nạp bundle rồi **đóng băng vĩnh viễn**. Với mock (mảng hằng) việc này vô hại; với API thật đây là **một lời gọi mạng phát sinh lúc import** — lỗi nghiêm trọng, phải sửa cùng đợt bọc `Promise`.

### 10. Nguồn gốc dữ liệu giả lập và nguyên tắc suy diễn

Dữ liệu giả lập **sinh từ hạt giống là các đối tượng di sản có thật**, qua bộ sinh có seed cố định nên tập dữ liệu ổn định qua mỗi lần tải. Mọi dung lượng đều **tính từ công thức vật lý** trong `data/sizeFormulas.ts`. Nhờ đó nhóm lỗi "số trên thẻ khác số trong trang" bị loại bỏ về mặt cấu trúc chứ không phải bằng rà soát thủ công.

**Chi tiết triển khai:**

- `data/objects/artifactsGenerated.ts:13` — RNG có seed cố định. `data/assets/generator.ts:55-99` — sinh bản ghi số từ hạt giống đối tượng vật lý.
- `data/assets.ts:22-30` có chú thích giải thích **vì sao danh sách đối tượng không được suy ngược từ `ASSETS`**: đối tượng di sản tồn tại độc lập với việc đã số hoá hay chưa. `pages/ObjectsPage.tsx:85-107` thực hiện LEFT JOIN bản ghi số vào danh sách đối tượng. Đây là cách một hệ kiểm kê di sản phải làm, và là điểm phân biệt sản phẩm này với một CMS ảnh thông thường.
- Badge thanh bên tính từ chính nguồn của trang (`layout/Sidebar.tsx:65`); bộ sưu tập tính lại mỗi lần gọi (`mock/collectionService.ts:20-33`).

**Hạn chế đã biết:**

- **4 badge phần trăm và 4 sparkline trên màn Tổng quan là hằng số viết tay** (`data/dashboard.ts:71,84,96,108`). Đây là ngoại lệ duy nhất của nguyên tắc "không có số ghi cứng ở tầng hiển thị", và nó nhạy cảm vì `docs/05:25` mời người đọc kiểm chứng đúng nguyên tắc đó. Chi phí sửa **1,5–2,5 người-ngày**, đã nằm trong P0.
- **Ba hằng số dung lượng lệch nội bộ**: splat ghi 190 byte/Gaussian ở chỗ này và 248 byte ở chỗ khác; WAV khai 16-bit trong khi template ghi 24-bit; `tiffPhotoSizeMB` lệch trên 10 lần so với `tiffA4SizeMB` trong cùng tệp. Ngoài ra cơ số dung lượng tổng lệch khoảng **55 lần** so với kết quả dựng lại từ tham số vật lý. Đã nằm trong danh sách sửa.

### 11. Kiến trúc backend dự kiến và cách gọi API

Kiến trúc backend đã chốt ở mức nguyên tắc và thành phần: **Postgres + MinIO + Keycloak rời, chạy trên Docker Compose, không Kubernetes** — vì đội IT của Trung tâm mỏng, đồng thời yêu cầu tệp 50 GB và mTLS của trục liên thông LGSP loại bỏ các phương án managed. Phía client, khuyến nghị chuyển sang **TanStack Query** thay cho store thủ công ngay khi có mạng thật. Đặc tả API nội bộ (`ARC-16`) là hạng mục đầu tiên của giai đoạn 6 tháng; bản OpenAPI đã có sẵn trong bộ tài liệu để làm điểm xuất phát.

**Chi tiết triển khai:**

- Thành phần đã chọn: `tus.io` cho tải lên tệp lớn (nối lại được sau đứt mạng), `pg-boss` cho hàng đợi công việc, nhật ký append-only có hash-chain thật, Cantaloupe làm máy chủ ảnh IIIF.
- **Không dùng Supabase**: yêu cầu tệp 50 GB và mTLS của LGSP không đáp ứng được bằng nền tảng managed; yêu cầu chủ quyền dữ liệu buộc mọi thành phần chạy trong hạ tầng của Trung tâm.
- **Lý do chọn TanStack Query**: store thủ công hiện thiếu `isLoading`/`isError`, thử lại có lùi theo cấp số nhân, khử trùng lặp yêu cầu, vô hiệu hoá bộ đệm sau khi ghi, cập nhật lạc quan có đường lùi, huỷ yêu cầu khi component tháo, và chống tranh chấp khi hai lần gõ phím trả về sai thứ tự. Audit ước lượng tự viết lại toàn bộ các cơ chế này bằng tay là **20–30 người-ngày và sẽ phát sinh lỗi** (`ARC-02`).
- Ràng buộc bốn mắt của ADR-0011 phải được cài đặt như **ràng buộc trong cơ sở dữ liệu** — một `CHECK` hoặc trigger bảo đảm `approved_by <> submitted_by` — chứ không phải một câu lệnh `if` trong React.

**Lưu ý khi tiếp nhận:** backend hiện **đã chốt nguyên tắc và thành phần, chưa có đặc tả API chi tiết**; đó là việc đầu tiên sau bàn giao. Về khả năng thay thế bằng một DAM thương mại có sẵn (ShotGrid, Preservica), phần kiến trúc chỉ ghi nhận một điểm: **mô hình dữ liệu hai trục ObjectClass × DigitalForm không có sẵn trong các sản phẩm đó** vì chúng phục vụ pipeline sản xuất chứ không phải kiểm kê di sản. Các khía cạnh vận hành và thương mại của lựa chọn này thuộc tài liệu khác.

---

## Nhóm C — Mô hình dữ liệu và mã định danh

> Audit độc lập đánh giá hướng mô hình hoá ở nhóm này là điểm mạnh thật của sản phẩm: "chính xác là cách một hệ thống kiểm kê di sản phải làm".

### 12. Mô hình dữ liệu hai trục: ObjectClass × DigitalForm

Mô hình tách **đối tượng di sản** khỏi **sản phẩm số hoá** vì đó là hai thực thể khác nhau; trộn chúng lại là sai lầm nền tảng của các CMS ảnh. Khuê Văn Các là **một** công trình nhưng có 4 bản ghi số: mesh 3D, splat, point cloud và bản vẽ. Trục thứ nhất `ObjectClass` trả lời "hiện vật này **là gì**" — khuôn viên, công trình, hiện vật, tài liệu, nghe nhìn. Trục thứ hai `DigitalForm` trả lời "bản ghi này **chụp bằng cách nào**" — 8 giá trị. Nhờ tách hai trục, đếm hiện vật và đếm tệp là hai con số độc lập, đúng nghiệp vụ kiểm kê.

**Chi tiết triển khai:**

- `app/src/services/types.ts:29` — `ObjectClass = 'precinct' | 'structure' | 'artifact' | 'document' | 'av'`, với chú thích ở `:26-27` ghi rõ trục này **độc lập** với `DigitalForm`.
- `types.ts:32` — `DigitalForm = 'mesh3d' | 'splat' | 'pointcloud' | 'drawing' | 'image' | 'text' | 'video' | 'audio'`.
- **Hệ quả kiến trúc quan trọng nhất:** danh sách đối tượng **không được suy ngược từ danh sách asset**. `data/assets.ts:22-30` chú thích thẳng lý do — một hiện vật chưa số hoá vẫn phải tồn tại trong hệ kiểm kê. `pages/ObjectsPage.tsx:85-107` dựng Map đối tượng rồi **LEFT JOIN** bản ghi số vào. Nếu làm ngược lại, hiện vật chưa số hoá sẽ biến mất khỏi hệ thống.
- Trục lọc trong giao diện phản ánh đúng hai trục: `ObjectClassFilter` và `DigitalFormFilter` (`types.ts:35-38`), trong đó giá trị `'Media'` gộp image/video/audio cho thuận tay người dùng.
- Tham chiếu: `docs/07-mo-hinh-du-lieu.md`, ADR-0003 (nhóm quan hệ), ADR-0004 (mã định danh).

**Điểm dễ hiểu nhầm:** `DigitalForm` **không phải định dạng tệp**. Định dạng tệp là trường `fmt` riêng biệt (`types.ts:63`). `DigitalForm` là *loại hình số hoá*; một `mesh3d` có thể được lưu dưới dạng GLB hoặc OBJ.

**Lưu ý khi tiếp nhận:** nhiều bản ghi số của cùng một hiện vật được nối với nhau bằng `physicalArtifactId` dùng chung (`types.ts:88`). Đây là quan hệ nhóm 1 (`hasRepresentation`) và nó được biểu diễn **ngầm định** bằng việc trùng giá trị, **không có bảng quan hệ riêng** — một đánh đổi có chủ đích, cần biết khi thiết kế lược đồ backend.

### 13. Mã định danh hai tầng và giới hạn về tính bền vững

Tầng 1 là mã đối tượng di sản: `VM-<OC>-NNNNN`, ví dụ `VM-CT-00007` cho Khuê Văn Các. Tầng 2 là mã bản ghi số ghép lên tầng 1: `VM-CT-00007.SPL01`, đọc là "bản splat số 01 của Khuê Văn Các". **Mọi mã đều được ghép bằng hàm, không gõ tay chuỗi**, nên không có mã sai định dạng lọt vào dữ liệu. Thiết kế tổng thể gồm 5 tầng; tầng 1 và 2 đã dùng đầy đủ, tầng 3 đến 5 là phần mở rộng theo roadmap.

**Chi tiết triển khai:**

- `app/src/utils/assetCode.ts:11-13` — `physicalObjectId(objectClass, seq)` sinh mã tầng 1, số thứ tự `padStart(5, '0')`.
- `assetCode.ts:16-18` — `digitalRecordCode(objId, digitalForm, seq)` sinh mã tầng 2, `padStart(2, '0')`.
- `assetCode.ts:21-23` — `derivedFileLabel(code, role, version)` sinh nhãn tầng 4 dạng `VM-CT-00007.SPL01.v1#master`, với `role` thuộc `master | web | raw | thumb`. Hàm này **hiện chỉ sinh nhãn hiển thị; chưa có store phiên bản hay tệp dẫn xuất phía sau** — chú thích ở `:6-8` ghi rõ điều đó.
- `assetCode.ts:26-28` — `normalizeCode` bỏ phân biệt hoa/thường và các ký tự `-` `.` để người dùng gõ mã rút gọn vẫn tìm ra.
- Các trường mã song song **không trộn vào mã hệ thống** (theo ADR-0004): `soKiemKe` (số kiểm kê gốc của Trung tâm), `soDangKy` (bảo vật quốc gia), `maHoSoDiTich` (hồ sơ xếp hạng di tích) — `types.ts:93-98`. Mã nội bộ của hệ thống không đè lên mã nghiệp vụ đã tồn tại.

**Hạn chế đã biết:**

- Hệ mã hiện tại là **mã nội bộ có cấu trúc**, chưa phải **định danh bền vững** theo nghĩa chuẩn bảo tàng số. Định danh bền vững đòi hỏi ARK hoặc DOI, một dịch vụ phân giải, và cam kết tổ chức duy trì; cả ba nằm ở giai đoạn 18 tháng.
- **`utils/assetCode.ts` hiện chưa có test nào**, dù sai mã định danh là loại lỗi không sửa lại được sau khi công bố. Đây là mô-đun đứng đầu danh sách cần bổ sung test (mục 25).
- Tầng 3 của sơ đồ mã là phiên bản, nhưng hệ thống **chưa quản lý phiên bản** — xem mục 14.

### 14. Phiên bản tài sản: khái niệm chưa có trong mô hình

**Mô hình dữ liệu hiện tại không có khái niệm phiên bản. Sửa một tài sản là ghi đè.** Đây là một trong bốn khái niệm nền mà các hệ quản lý asset chuyên nghiệp coi là bắt buộc, và bản bàn giao thiếu cả bốn: phiên bản, một-tài-sản-nhiều-tệp, quan hệ dẫn xuất, và quyền được thực thi. Chi phí bổ sung phiên bản ước **4–6 người-ngày**; đây là điều kiện cần cho một luồng duyệt nghiêm túc.

**Chi tiết triển khai:**

- Trong `Asset` (`types.ts:49-99`) không có trường `version` và không có bảng lịch sử. `mock/assetService.ts:9-19` — `updateAsset` thay thế phần tử trong mảng, **không giữ bản cũ**.
- Tầng 3 (phiên bản) và tầng 4 (tệp dẫn xuất) đã được **thiết kế trong sơ đồ mã định danh** (`assetCode.ts:6-8`) nhưng chưa có cấu trúc lưu trữ: mô hình đã chừa chỗ, chỉ chưa xây.
- Hệ quả nghiệp vụ: nhật ký kiểm toán ghi được "ai đổi trạng thái lúc nào", nhưng **không khôi phục được nội dung trước khi đổi**. Với một hệ bảo quản di sản, đây là khoảng trống thật.

**Hạn chế đã biết — ba khái niệm nền còn thiếu:**

- **(a) Một tài sản = một tệp.** Vì `.mtl` và texture không tồn tại trong mô hình, một tệp OBJ có thể mất texture mà checksum vẫn khớp.
- **(b) Không có lineage.** Không truy được bản web sinh ra từ bản gốc nào.
- **(c) Quyền chưa được thực thi.** Xem nhóm D.

**Điểm dễ hiểu nhầm:** nhật ký kiểm toán **không thay thế được phiên bản**. Nhật ký ghi *sự kiện*; phiên bản giữ *nội dung*. Tương tự, `unpublish` giữ lại bản ghi (`assetService.ts:61-64`, trạng thái `'Đã gỡ/thu hồi'`) đúng nguyên tắc deaccession của PREMIS — nhưng đó là "không xoá bản ghi", **không phải** "giữ được các phiên bản nội dung".

### 15. Mô hình quan hệ giữa các đối tượng và hai lỗi đã biết

Hệ thống có ba nhóm quan hệ theo ADR-0003. Nhóm 1 — nhiều bản ghi số của cùng một hiện vật — biểu diễn ngầm bằng `physicalArtifactId` dùng chung. Nhóm 2 — một tư liệu **nói về** một hiện vật khác — khai báo tường minh. Nhóm 3 — quan hệ bộ phận — hiện dùng trường `loc`. Chú thích ở `data/relations.ts:3-13` giải thích đầy đủ ba nhóm và lý do nhóm 3 chưa cần cấu trúc riêng.

**Chi tiết triển khai:**

- `types.ts:41` — `RelationKind = 'depictedIn' | 'mentionedIn' | 'subjectOf' | 'hasRubbing'` (4 giá trị).
- `data/relations.ts:20` — `kind: 'depictedIn' | 'mentionedIn' | 'subjectOf'` (**3 giá trị**). Danh sách `RULES` (`:23-30`) hiện chỉ có 5 quan hệ mẫu cho Khuê Văn Các và giếng Thiên Quang.

**Hạn chế đã biết — hai lỗi phát tác ngay ngày đầu nhập dữ liệu thật:**

- **Mất `hasRubbing` ở tầng sinh quan hệ.** Kiểu `RelationKind` khai báo 4 giá trị **có** `hasRubbing`, nhưng bộ quy tắc sinh quan hệ tại `relations.ts:20` thu hẹp còn 3 và **loại mất `hasRubbing`** — trong khi bản dập là loại tư liệu trung tâm của di sản Hán Nôm.
- **Template nhập liệu ngược chiều với mã.** Template CSV dùng `depicts`, mã dùng `depictedIn`. Nhập lô theo template hiện tại sẽ ghi quan hệ ngược chiều.

Chi phí sửa cả hai: **1–2 người-ngày**, đã nằm trong P0 mục 7.

**Điểm dễ hiểu nhầm:** đọc riêng `types.ts:41` sẽ thấy `hasRubbing` tồn tại và kết luận nhầm rằng quan hệ này đã được hỗ trợ. Chỗ thu hẹp nằm ở `relations.ts:20`, không nằm ở tệp kiểu.

**Hai khoảng trống liên quan:**

- **Dữ liệu Hán Nôm.** Toàn bộ mã nguồn hiện chỉ chứa **4 ký tự Hán**, đều nằm trong một placeholder (`i18n/vi.ts:105`); chưa có dòng minh văn nào trong dữ liệu. Cấu trúc 3 lớp (nguyên văn / phiên âm / dịch nghĩa) đã thiết kế nhưng chưa có dữ liệu vào, đang chờ dữ liệu thật từ NAS.
- **IIIF: bằng 0 tuyệt đối trong mã nguồn.** Với 82 bia là hiện vật **văn bản**, công sức phiên âm và dịch hiện bị nhốt trong `textarea`, không neo vào toạ độ trên ảnh. Audit xếp đây là lỗ hổng chuẩn nghiêm trọng nhất, đồng thời là hạng mục **ROI cao nhất** vì manifest IIIF là JSON tĩnh, không cần backend.

### 16. Độ chặt của hệ kiểu: chỗ chặt và bảy trường lỏng

Hệ kiểu chặt ở những chỗ khó và lỏng ở những chỗ dễ. Phía chặt: `AssetStatus` là union 11 giá trị có chú thích cho hai trạng thái ngoài luồng; `ObjectClass`, `DigitalForm`, `RelationKind` đều là union thật; toàn repo **0 lần dùng `any`**. Phía lỏng: bảy trường lẽ ra dễ mô hình hoá lại để `string` tự do — trong đó `User.role: string` gây hậu quả dây chuyền nghiêm trọng nhất (mục 21).

**Chi tiết triển khai:**

- Bảy trường nên là union nhưng đang là `string`: `User.role` (`types.ts:123`), `Connection.status` (`:136`), `ApiEndpoint.status` (`:148`), `ShareRequest.status` (`:156`), `ComplianceItem.state` (`:161`), cộng `UploadItem.id: number | string` (`:165`); và `Connection.sync` (`:137`) trùng khái niệm với `ConnectionSyncState.freq` (`:130`) — hai nguồn sự thật cho cùng một khái niệm.
- `ShareRequest.status` đang được **so khớp bằng chuỗi** ở `pages/DashboardPage.tsx:39-40` (`r.status === 'Chờ duyệt'`). Gõ sai một dấu sẽ đếm ra 0 mà không phát sinh lỗi biên dịch.

**Hạn chế đã biết:**

- **Ngày tháng đang là chuỗi hiển thị** — vấn đề mô hình hoá nghiêm trọng nhất sau `role`. `Asset.updated` ở dạng `'dd/mm/yyyy'` (`types.ts:76`), nên `data/selectors.ts:59-68` phải tách chuỗi ra để so sánh ngày. Nặng hơn, `mock/auditService.ts:37` ghi `time: 'Vừa xong'` — một **nhãn hiển thị** đặt vào chỗ đáng lẽ là dấu thời gian; và mẫu sai này **tái xuất hiện trong mã mới** ở `mock/userService.ts:48` (`new Date().toLocaleDateString('vi-VN')`). Với ADR-0012 (nhật ký append-only có chuỗi băm), một bản ghi không có dấu thời gian máy đọc được **không dùng được làm bằng chứng**. Tầng dữ liệu phải là ISO 8601 có múi giờ, việc định dạng thuộc tầng hiển thị.
- **Dung lượng lưu hai lần**: `Asset.size: string` (đã định dạng) và `Asset.sizeMB: number` (`types.ts:63-66`). Chú thích nêu `sizeMB` là nguồn sự thật duy nhất — và `generator.ts:76-77` làm đúng như vậy — nhưng **kiểu không ép được điều đó**, nên hai giá trị mâu thuẫn vẫn đặt được. Khuyến nghị bỏ `size` khỏi mô hình.
- Chi phí: đổi 7 trường thành union là **dưới 1 người-ngày** và compiler sẽ tự chỉ ra mọi chỗ hỏng. Chuyển ngày sang ISO 8601 tốn hơn, khoảng **1–2 người-ngày** vì chạm tầng hiển thị.

**Điểm dễ hiểu nhầm:** chỉ số "0 lần `any`" không đồng nghĩa với hệ kiểu chặt. Khi `role: string`, phần lớn lợi ích của hệ kiểu đã mất ở đúng chỗ quan trọng nhất. Việc mẫu sai về ngày tháng **tái xuất hiện trong mã mới** cho thấy đây không phải lỗi lẻ mà là một thói quen mô hình hoá, cần chặn bằng kiểu chứ không bằng lời nhắc (`ARC-19`).

---

## Nhóm D — Phân quyền: thiết kế chính sách và mức độ thực thi

> Thiết kế chính sách ở nhóm này tốt hơn mức thực thi. Mục 17 mô tả chính sách; mục 18 mô tả khoảng cách giữa chính sách và thực thi, và khoảng cách đó kiểm chứng được trong khoảng 20 giây.

### 17. Mô hình phân quyền: RBAC + ABAC + phân tách nhiệm vụ

Mô hình kết hợp ba lớp: **RBAC** (vai trò × module × quyền), **ABAC** (phạm vi theo phân khu di tích), và **quy tắc phân tách nhiệm vụ (SoD)**. Ma trận là 5 vai trò × 8 module × 6 quyền, với **một nguồn sự thật duy nhất** là `app/src/data/permissions.ts`. Chính sách nằm trong mã và kiểm chứng được bằng test: tệp này thuần TypeScript, không import React, chính là để `npm test` chạy được trên nó.

**Chi tiết triển khai:**

- 5 vai trò (`permissions.ts:27`): Quản trị, Kỹ thuật số hóa, Biên tập, Phê duyệt, Chỉ xem. 8 module (`:14-23`), 6 quyền (`:25`).
- **Quyết định chính sách đáng chú ý nhất** (`permissions.ts:124-127`): vai trò **Quản trị không có quyền Duyệt/Xuất bản nội dung**. Chú thích ghi rõ lý do: "quản trị viên vừa cấp được quyền cho chính mình vừa duyệt được nội dung là đường tự nâng quyền kinh điển".
- **Ô khoá cứng theo chính sách** (`permissions.ts:108-119`) — những ô **không vai trò nào tick được, kể cả Quản trị**, kèm lý do hiển thị ra giao diện: nhật ký không ai sửa hay xoá được (append-only, ADR-0012); hồ sơ tuân thủ không xoá được (chứng cứ thanh tra); biên bản kiểm kê đã chốt không xoá được (ADR-0010).
- **Ba loại xung đột SoD chặn ở bước lưu** (`permissions.ts:214-254`): `SOD_TAO_DUYET` (không được vừa Tạo/Sửa vừa Duyệt trên module nội dung — nguyên tắc bốn mắt, ADR-0011); `XOA_KHONG_QUAN_TRI` (quyền Xoá chỉ cấp kèm Quản trị cùng module); `TU_NANG_QUYEN` (quản trị tài khoản không được đồng thời Duyệt/Xuất bản dữ liệu).
- **Ràng buộc hệ quả tự động** (`permissions.ts:195-202`): bật bất kỳ quyền nào sẽ tự bật `Xem`; tắt `Xem` sẽ tắt toàn bộ quyền của module đó. Người cấu hình không tạo ra được trạng thái vô nghĩa.
- Kiểm thử: `app/tests/permissions.test.ts` — 121 dòng, phủ ma trận khớp tài liệu, nguyên tắc bốn mắt, tính append-only, và phát hiện đường tự nâng quyền.
- Lịch sử đáng lưu ý: trước đây tồn tại **hai bảng chính sách song song** — ma trận trong `UserDetailPage` và bảng `CAPS` gõ tay trong `AuthContext` — và chúng **đã thực sự lệch nhau** (`permissions.ts:5-9`). Nay đã gộp về một nguồn.

**Lưu ý khi tiếp nhận:** phần trên mô tả **chính sách**, không mô tả mức thực thi. Chính sách đã có và đã có test; việc nối chính sách vào giao diện chưa hoàn thành — xem mục 18.

### 18. Mức độ thực thi phân quyền trong ứng dụng hiện tại

**Phân quyền hiện chưa được thực thi; nó mới dừng ở mức giao diện.** Đối tượng `can` chứa 5 nhóm quyền được tính đầy đủ, nhưng **không component nào đọc nó** — grep trả về 0 kết quả. Và `RequireAuth` **chỉ kiểm tra đã đăng nhập, không kiểm tra vai trò**, nên một tài khoản vai trò "Chỉ xem" gõ thẳng `/users` vào thanh địa chỉ là vào được màn quản trị người dùng. Chi phí nối dây: **2–3 người-ngày**, đã nằm trong gói P0.

**Chi tiết triển khai:**

- `context/AuthContext.tsx:76` cấp `can: capsForRole(role)`. Grep `can.read|can.write|can.approve|can.publish|can.admin` trên toàn `app/src/` → **0 kết quả**. Sáu chỗ gọi `useAuth()` (`Sidebar.tsx:230`, `EvidenceViewer.tsx:25`, `LoginPage.tsx:64`, `InventoryPage.tsx:148`, `AssetDetailPage.tsx:47`, và chính `RequireAuth`) **không chỗ nào lấy `can`** — chỉ lấy `authed`/`user`/`role`/`signOut`.
- `AuthContext.tsx:89-93` — `RequireAuth` chỉ gồm `const { authed } = useAuth()` rồi `if (!authed) return <Navigate to="/login">`. **Không có tham số vai trò.** `App.tsx:41-43` bọc toàn bộ AppShell trong một `RequireAuth` duy nhất, không có guard riêng cho route quản trị.
- `layout/navConfig.ts:36-38` — `filterNavByRole` là `items.filter((item) => !item.roles || item.roles.includes(role))`. Nó **chỉ lọc mảng menu**, tức là che hiển thị chứ không kiểm soát truy cập. Bốn mục có khai báo `roles` (`navConfig.ts:99, 127, 155, 163`) bị ẩn khỏi menu nhưng route vẫn mở.

**Hạn chế đã biết — hai hệ quả kiểm chứng được ngay:**

- Vai trò "Chỉ xem" bấm được nút Phê duyệt/Xuất bản trên màn chi tiết tài sản.
- Gõ trực tiếp `/users`, `/api-keys`, `/backup` vào thanh địa chỉ là vào được đầy đủ.

**Cách khắc phục (2–3 người-ngày):** thêm `RequireRole` bọc các route quản trị; tiêu thụ `can` ở các nút hành động (`disabled={!can.approve}` kèm tooltip nêu lý do); thực thi nguyên tắc bốn mắt tại điểm duyệt bằng cách so `user.id` với người tạo bản ghi.

**Điểm dễ hiểu nhầm:** ẩn mục menu **không phải** kiểm soát truy cập. Trong bản demo không chứa dữ liệu thật, khoảng cách này chưa gây thiệt hại; nhưng về nguyên tắc nó là lỗ hổng, và rủi ro lớn hơn là nó tạo ấn tượng sai rằng phân quyền "đã xong", dẫn tới bỏ qua ở giai đoạn backend. Bối cảnh: đợt refactor gần nhất đã gom chính sách về một nguồn và bổ sung test, nhưng chưa nối vào giao diện — đây là bước tiếp theo đã lên lịch.

### 19. Vai trò của lớp phân quyền client khi có backend

Phân quyền phía client **không phải là phân quyền**, kể cả sau khi nối dây xong. Nó là một lớp trải nghiệm người dùng: giấu những gì người dùng không thao tác được, và giải thích lý do. **Mọi quy tắc phải được thực thi lại ở máy chủ**, và riêng nguyên tắc bốn mắt phải là **ràng buộc trong cơ sở dữ liệu** — một `CHECK` hoặc trigger bảo đảm `approved_by <> submitted_by`. Giá trị thật của lớp client là nó **đã định nghĩa sẵn chính sách bằng mã có test**, nên backend chỉ việc cài lại đúng ma trận đó.

**Chi tiết triển khai:**

- `data/permissions.ts` thuần TypeScript, không import React (`:11-12` ghi rõ chủ đích này). Nghĩa là **cùng một tệp chính sách chạy được ở phía máy chủ Node**, không phải viết lại.
- Ba tầng thực thi ở bản production: (1) Keycloak/OIDC cấp token mang vai trò; (2) API kiểm quyền trên từng endpoint theo đúng ma trận `buildMatrix`; (3) ràng buộc cơ sở dữ liệu cho các bất biến không được phép vi phạm ngay cả khi API có lỗi — bốn mắt, và append-only cho nhật ký.
- Chú thích ở `AuthContext.tsx:6-7` ghi sẵn đường đi: "bản triển khai thay bằng SSO/OIDC của cơ quan, giữ nguyên hình dạng interface bên dưới nên không phải sửa component".
- `tests/permissions.test.ts` là bộ test chính sách độc lập với UI; khi có backend, chính bộ test đó chạy được trên tầng API để đối chứng ma trận.

### 20. Cơ chế đăng nhập hiện tại và đường đi lên SSO

Cơ chế hiện tại là **phiên đăng nhập giả lập cho bản trình diễn**: người dùng chọn vai trò ở màn đăng nhập, hệ thống ghi vào `localStorage` rồi đọc ra. **Không có mật khẩu, không có token, không có máy chủ xác thực.** Mức an toàn bằng 0, và đó là trạng thái có chủ đích cho một bản demo không chứa dữ liệu thật. Bản triển khai sẽ thay bằng SSO/OIDC của cơ quan qua Keycloak; hình dạng interface đã được giữ nguyên để không phải sửa component.

**Chi tiết triển khai:**

- `context/AuthContext.tsx:13-14` — hai khoá `vmAdmin.demoRole` và `vmAdmin.authed`. `signIn` (`:56-65`) ghi cả hai rồi đặt state React.
- Chú thích ở `:31-34` nêu một ràng buộc kỹ thuật đúng: **phải gọi `signIn()` chứ không chỉ ghi `localStorage`**, vì trạng thái phiên nằm trong React state; ghi thẳng localStorage rồi điều hướng thì `RequireAuth` vẫn thấy chưa đăng nhập và đưa ngược về trang đăng nhập.
- `:57-62` có `try/catch` quanh `localStorage` kèm chú thích "chế độ duyệt riêng tư có thể chặn localStorage — phiên vẫn chạy trong bộ nhớ".
- Đường đi production: Keycloak rời (không managed), do yêu cầu chủ quyền dữ liệu và mTLS của LGSP.

**Điểm dễ hiểu nhầm:** cơ chế hiện tại là **chọn vai trò**, không phải **xác thực**. Trong bản demo, mọi người đều vào được — đúng chủ đích vì không có dữ liệu thật. Khi có dữ liệu thật, SSO là điều kiện tiên quyết chứ không phải tuỳ chọn.

### 21. Kiểu `Role` bị suy biến thành `string`

`Role` được suy ra từ `USERS[number]['role']`, nhưng `USERS` được chú kiểu tường minh là `User[]` và `User.role` là `string` — nên **`Role` trên thực tế chính là `string`**, không phải union 5 vai trò như tên gọi gợi ý. Hệ quả: thêm một vai trò mới thì TypeScript **không báo gì**, và vai trò đó rơi vào nhánh mặc định chỉ-đọc. Chế độ hỏng an toàn nhưng âm thầm. Chi phí sửa **dưới 1 người-ngày**.

**Chi tiết triển khai:**

- `AuthContext.tsx:16` — `export type Role = (typeof USERS)[number]['role'];`. `USERS` chú kiểu `User[]` ở `data/users.ts:9`, và `User.role: string` ở `services/types.ts:123`. Chuỗi suy diễn kết thúc ở `string`.
- Ba hệ quả cụ thể: (1) `capsForRole(role)` nhận `string` chứ không phải union nên **không được kiểm tra vét cạn** — `permissions.ts:123-185` dùng chuỗi `if (role === '...')` và rơi vào `return` mặc định ở `:175`; (2) hai lần ép kiểu `as Role` (`AuthContext.tsx:45`, `:71`) là **thao tác rỗng**, ép `string` thành `string`; (3) `filterNavByRole(items, role: string)` (`navConfig.ts:36`) so khớp **chuỗi tự do** — viết `'Quản Trị'` sai hoa/thường sẽ làm mục menu biến mất vĩnh viễn mà **không có lỗi biên dịch**.
- Union đúng **đã tồn tại** trong repo: `permissions.ts:31` có `RoleName` là union thật (`typeof ROLE_OPTIONS[number]`). `AuthContext` và `navConfig` chưa dùng nó.
- Cách sửa (`ARC-06`): khai báo `USERS` bằng `as const satisfies readonly User[]`, đặt `Role = RoleName`, và đổi `filterNavByRole(items, role: RoleName)`. Compiler sẽ tự chỉ ra mọi chỗ so khớp chuỗi lỏng lẻo.

**Điểm dễ hiểu nhầm:** `tsc` sạch chứng minh **không có mâu thuẫn kiểu**; nó không chứng minh **kiểu được mô hình hoá đúng**. Và chế độ hỏng an toàn chỉ đúng ở cấu hình hôm nay: khi thêm vai trò thứ 6, người mang vai trò đó sẽ mất quyền một cách im lặng và không có tín hiệu nào chỉ ra nguyên nhân.

---

## Nhóm E — Quản lý trạng thái, hiệu năng, kiểm thử

### 22. Store tự viết: lý do, giới hạn, mốc chuyển đổi

Ở phạm vi mock, phần trạng thái dùng chung chỉ gồm ba mẩu — trạng thái tài sản, hàng đợi tải lên, cấu hình kết nối — và **không có mạng**. Store tự viết dài **24 dòng**, ghép với `useSyncExternalStore` của React, không thêm phụ thuộc nào. Đây là lựa chọn đúng phạm vi hiện tại; nó **hết đúng ngay khi có backend**, và mốc chuyển đổi đã xác định: chuyển sang TanStack Query cùng đợt bọc `Promise` (mục 8).

**Chi tiết triển khai:**

- `app/src/services/store.ts` — 24 dòng: `getState`, `setState`, `subscribe` trên một `Set` listener. `services/useStore.ts:5-7` nối vào React bằng `useSyncExternalStore` — API chính thức của React cho store ngoài.
- Redux bị loại vì quá nặng cho 3 mẩu trạng thái, và phần lớn giá trị của Redux (devtools, middleware, time-travel) không được dùng tới ở đây.
- TanStack Query là lựa chọn khi có backend vì nó cung cấp sẵn `isLoading`/`isError`, thử lại có lùi theo cấp số nhân, khử trùng lặp yêu cầu, vô hiệu hoá bộ đệm sau khi ghi, cập nhật lạc quan có đường lùi, huỷ yêu cầu khi component tháo, và chống tranh chấp khi hai lần gõ phím trả về sai thứ tự. Audit ước tự viết lại toàn bộ bằng tay là **20–30 người-ngày và sẽ phát sinh lỗi** (`ARC-02`).

**Hạn chế đã biết — ba giới hạn của store hiện tại:**

- **Không so sánh trước khi thông báo** (`store.ts:14-18`): mọi `setState` đánh thức mọi listener kể cả khi trạng thái không đổi.
- **Không cách ly lỗi** (`store.ts:17`): `listeners.forEach((l) => l())` — một listener ném lỗi thì các listener sau **không bao giờ được gọi**, dẫn tới các phần giao diện lệch nhau âm thầm.
- **Không có khái niệm "đang tải" và "lỗi"** — store chỉ mang dữ liệu.

Thêm một điểm cần biết khi nối mạng: `collectionService.list()` hiện **tính lại toàn bộ mỗi lần gọi** (`mock/collectionService.ts:36-38`); với API thật đây sẽ là mẫu **N+1 lời gọi mạng**.

### 23. Cơ chế cập nhật giao diện và sự đúng đắn tình cờ

Tỷ lệ hiện tại là **5 điểm đăng ký store so với hơn 20 điểm đọc dữ liệu**. Giao diện vẫn hiển thị đúng vì react-router **tháo và gắn lại component mỗi lần điều hướng**, nên số liệu được đọc lại từ đầu. Báo cáo audit gọi đây là sự đúng đắn *tình cờ* chứ không phải *thiết kế*: khi không có mạng thì khoảng cách này không lộ ra; khi có mạng thì nó lộ toàn bộ.

**Chi tiết triển khai:**

- 5 điểm đăng ký `useStore`: `UploadPage.tsx:45` và `:46`, `ObjectDossierPage.tsx:132`, `AssetDetailPage.tsx:43`, `SharePage.tsx:18`.
- Hơn 20 điểm đọc **không** đăng ký, gồm `AssetsPage.tsx:44`, `DashboardPage.tsx:23-24`, `ReportsPage.tsx:73`, `InventoryPage.tsx:149`, `BackupPage.tsx:90`, `ObjectsPage.tsx:128`, `CollectionsPage.tsx:9`, `LogsPage.tsx:7`, `UsersPage.tsx:8`, `Sidebar.tsx:65`, `Header.tsx:17` và các tệp khác.

**Hạn chế đã biết — hai điểm đã lộ ngay ở bản mock:**

- `layout/Sidebar.tsx:65` vẽ badge số lượng asset, nhưng thanh bên **không tháo và gắn lại** khi điều hướng trong cùng AppShell. Badge chỉ được cập nhật nhờ AppShell render lại theo route — tức phụ thuộc vào một hiệu ứng phụ, không phải vào đăng ký store.
- `pages/InventoryPage.tsx:63` gọi `services.users.list()` ở **cấp module**: chạy đúng một lần lúc nạp bundle rồi **đóng băng vĩnh viễn**. Với mock (mảng hằng) vô hại; với API thật đây là một lời gọi mạng phát sinh lúc import.

### 24. Hiệu năng ở danh sách lớn: số đo và ngưỡng vỡ

Các số liệu dưới đây được đo trên chính hàm `matchesAssetQuery` của dự án, không phải ước lượng. Lọc phía client chạy **khoảng 5,0 µs mỗi bản ghi mỗi lần gõ phím**. Với ngân sách một khung hình là 16 ms, **ngưỡng vỡ là khoảng 3.200 bản ghi**; từ đó trở đi mỗi lần gõ phím là một khung hình bị rớt. Ở 10.000 bản ghi thời gian lọc là **49,5 ms**, ở 50.000 bản ghi là **235 ms**. Dự án chạm ngưỡng này **ngay ở giai đoạn 2 khi số hoá Hán Nôm theo trang**, không phải giai đoạn 3.

**Chi tiết ba nút thắt:**

- **Nút thắt 1 — lọc tuyến tính không chỉ mục, chạy mỗi lần gõ phím.** `layout/Header.tsx:37-47` đặt `setQuery(e.target.value)` thẳng trong `onChange`, **không debounce**. Giá trị chảy qua `context/AppUiContext.tsx:35` xuống `pages/AssetsPage.tsx:46-56`, nơi `useMemo` lọc **toàn bộ mảng**. Với mỗi asset, `matchesAssetQuery` (`utils/search.ts:21-34`) gọi `normalizeForSearch` trên **7 trường**, mỗi lời gọi thực hiện `.toLowerCase().normalize('NFD').replace().replace()` — cấp phát 4 chuỗi trung gian. Tổng cộng là **28 phép chuẩn hoá chuỗi × số bản ghi × mỗi lần gõ phím**, không có chỉ mục dựng sẵn và không có bộ nhớ đệm.
- **Nút thắt 2 — phân trang vẽ toàn bộ số trang.** `components/Pagination.tsx:12` sinh mảng đủ `totalPages`; 10.000 bản ghi với `PAGE_SIZE = 10` cho **1.000 nút DOM**, mỗi nút mang `style` nội tuyến (`:34`).
- **Nút thắt 3 — không ảo hoá ở bất kỳ đâu.** `InventoryPage.tsx:319` và `:389` vẽ toàn bộ phạm vi đợt kiểm kê; `ObjectsPage.tsx:85-107` dựng lại `Map` và LEFT JOIN toàn bộ 150 đối tượng mỗi lần render.
- Ở 100.000 bản ghi, riêng dữ liệu chiếm **khoảng 69 MB JSON** trong bộ nhớ trình duyệt — đây là căn cứ cho việc `store` phải rời khỏi hợp đồng dịch vụ (mục 8).

**Ba việc khắc phục theo thứ tự ROI:** debounce ô tìm kiếm (**nửa người-ngày**, đẩy ngưỡng lên vài lần); phân trang cửa sổ trượt (**nửa người-ngày**); **phân trang phía máy chủ** (`ARC-03`) — đây là lời giải thật, vì việc lọc thuộc về cơ sở dữ liệu chứ không thuộc về trình duyệt.

**Điểm dễ hiểu nhầm:** debounce chỉ giảm **số lần** chạy, không giảm **chi phí mỗi lần**. Ở 50.000 bản ghi, một lần lọc vẫn tốn 235 ms dù đã debounce. Tương tự, số đo "hiện chạy nhanh" không có giá trị tham chiếu vì tập dữ liệu hiện chỉ có 153 bản ghi; đại lượng cần theo dõi là ngưỡng vỡ và mốc thời gian chạm ngưỡng. Nguồn số: `docs/audit/05-kien-truc-va-production.md` mục 4.

### 25. Hiện trạng kiểm thử: 16 test và vùng chưa phủ

Hệ thống có **16 test, đạt 16/16, tổng 154 dòng test trên 16.787 dòng mã — tương đương 0,92%**. Độ phủ thấp. Điểm đáng ghi nhận nằm ở **cách chọn**: 16 test phủ đúng hai vùng rủi ro cao nhất — ma trận phân quyền với nguyên tắc bốn mắt, và thuật toán can chi. Hạn chế thật không nằm ở con số 16 mà ở chỗ **chưa có khung thử component**, nên không có test component và không có test đầu-cuối nào.

**Chi tiết triển khai:**

- `app/tests/permissions.test.ts` — 121 dòng, 13 test. Phủ: ma trận khớp tài liệu, ô khoá cứng, tính append-only của nhật ký, quy tắc Quản trị không tự duyệt, hàm `toggleCell` cùng các ràng buộc hệ quả, và phát hiện đường tự nâng quyền (vừa quản trị tài khoản vừa duyệt nội dung).
- `app/tests/canChi.test.ts` — 33 dòng, 3 test. Kiểm 5 mốc đã đối chiếu sử liệu, 3 mốc tra cứu thêm, và **tính chất chu kỳ 60 năm**. Chú thích ở `:5-9` ghi rõ tệp test này ra đời vì trường can chi **từng bị gõ sai 3 lần** — test viết ra từ lỗi thật chứ không từ chỉ tiêu độ phủ.
- Chạy bằng `node --experimental-strip-types --test` (`package.json:10`). `package.json` không có Vitest, Testing Library hay Playwright — đó là lý do chưa test được component.

**Hạn chế đã biết — sáu mô-đun thuần tuý, dễ test, có hậu quả nếu sai, hiện chưa có dòng test nào:**

| Mô-đun | Rủi ro nếu sai |
|---|---|
| `utils/assetCode.ts` | Sinh mã định danh — sai là **mã bền vững sai, không sửa lại được sau khi công bố** |
| `utils/search.ts:11-18` `normalizeForSearch` | Bỏ dấu tiếng Việt và gập `đ→d` — sai là **không tìm thấy hiện vật**; chưa xử lý ký tự Hán Nôm |
| `data/pipeline.ts` `nextStatus` | Máy trạng thái duyệt/xuất bản — sai là **quy trình bốn mắt bị vượt mặt** |
| `data/sizeFormulas.ts` (11 hàm) | Toàn bộ số liệu dung lượng, và gián tiếp là **dự toán hạ tầng** |
| `data/selectors.ts:112-146` | ADR-0016 quy định tập rỗng phải trả `null`; hiện tồn tại **cả hai biến thể** (`:136` và `:142`) |
| `data/missingValues.ts` | Bộ 5 mã khuyết giá trị (ADR-0005) — ảnh hưởng mẫu số của chỉ số đầy đủ hồ sơ |

**Lưu ý khi tiếp nhận:** `node --test` đủ cho logic thuần nhưng **không đủ cho component**; ngoài ra `--experimental-strip-types` là cờ thử nghiệm. Bổ sung Vitest + Testing Library mất khoảng **1 người-ngày** dựng khung.

### 26. Kế hoạch kiểm thử tiếp theo

Kế hoạch gồm bốn bước theo thứ tự. **Một:** dựng khung Vitest + Testing Library (**1 người-ngày**). **Hai:** phủ nốt 6 mô-đun thuần tuý trong bảng rủi ro ở mục 25, bắt đầu từ mã định danh vì sai là không sửa lại được. **Ba:** test component cho các luồng có hậu quả — duyệt, xuất bản, gỡ xuất bản. **Bốn:** Playwright cho 3–4 kịch bản đầu-cuối, trong đó **bắt buộc có kịch bản kiểm tra chặn truy cập theo vai trò** — chính là khoảng trống ở mục 18; biến nó thành một test đỏ là cách chắc chắn nhất để nó không tái diễn.

**Chi tiết triển khai:**

- Nguyên tắc chọn: ưu tiên theo **hậu quả nếu sai**, không theo độ phủ dòng. Đây là cách hai tệp test hiện có đã được chọn và nên tiếp tục. Cam kết nên đặt theo **danh sách mô-đun** thay vì theo một tỷ lệ phần trăm độ phủ.
- Kịch bản đầu-cuối tối thiểu: (1) đăng nhập vai trò "Chỉ xem" rồi gõ `/users` → **phải bị chặn**; (2) tạo bản ghi rồi dùng chính tài khoản đó duyệt bản ghi của mình → **phải bị chặn** (bốn mắt); (3) gỡ xuất bản không nhập lý do → **phải bị chặn**; (4) tìm kiếm bỏ dấu phải ra đúng hiện vật.
- Gắn với CI: mọi test chạy trong `ARC-10` (git + CI tối thiểu gồm typecheck, lint, test). Không có cổng tự động thì test sẽ mục dần.
- Chi phí: bước 1–2 là **3–5 người-ngày**, làm được ngay trên mock. Bước 3–4 nằm trong `ARC-04` thuộc gói 6 tháng.

### 27. Xử lý lỗi: chế độ hỏng mặc định hiện tại

Ứng dụng **chưa có cơ chế xử lý lỗi ở tầng render**: grep `ErrorBoundary`, `componentDidCatch`, `Suspense`, `React.lazy`, `skeleton` trên toàn repo trả về **0 kết quả**. Chế độ hỏng mặc định hiện tại là **trang trắng**. Ở bản mock điều này ít lộ vì không có mạng và dữ liệu tĩnh; với backend thật, mỗi lỗi mạng sẽ là một trang trắng. Bổ sung `ErrorBoundary` và trạng thái tải là việc bắt buộc, làm cùng đợt bọc `Promise`.

**Chi tiết triển khai:**

- Trạng thái rỗng thì **có** (`pages/AssetsPage.tsx:121`). Trạng thái tải chỉ tồn tại ở đúng **một** chỗ trong toàn ứng dụng (`pages/LoginPage.tsx:73`).
- Việc cần làm (`ARC-05`): `ErrorBoundary` ở cấp AppShell để một trang lỗi không kéo cả ứng dụng; skeleton cho danh sách; toast cho lỗi nghiệp vụ 4xx. Chi phí **1–2 người-ngày**.

**Hạn chế đã biết — lỗi tái hiện được ngay hôm nay, không cần đợi backend:** `requestRevision` và `unpublish` **ném `Error` đồng bộ** khi thiếu lý do (`mock/assetService.ts:58`, `:62`), và **không có `try/catch` nào ở tầng trang**. Thao tác "Trả lại bổ sung" mà không nhập lý do vì thế có thể làm trắng toàn bộ ứng dụng. Đây là lý do `ARC-05` được xếp vào nhóm phải làm trước.

### 28. Phụ thuộc mạng ngoài và khả năng chạy trong mạng nội bộ

**Ứng dụng hiện còn hai điểm gọi ra internet**: Google Fonts trong `index.html`, và 6 ảnh lấy từ Wikimedia. Khi ngắt mạng, hệ quả là **vỡ font toàn giao diện và mất ảnh hero ở màn Tổng quan** — đúng hai màn đầu tiên người dùng nhìn thấy. Chi phí khắc phục là **nửa đến một người-ngày**: đóng gói font và ảnh vào trong dự án. Đây là hạng mục ưu tiên số 1 vì rẻ nhất và chặn rủi ro lớn nhất.

**Chi tiết triển khai:**

- `app/index.html:7-10` — thẻ link tới Google Fonts. `app/src/data/collections.ts:7-17` — 6 URL ảnh Wikimedia.
- Ngoài hai điểm đó, ứng dụng **không gọi API nào**: không backend, không telemetry, không analytics. Sau khi gỡ hai điểm này, ứng dụng chạy hoàn toàn ngoại tuyến — và đó là điều kiện để phát biểu về chủ quyền dữ liệu.

**Lưu ý khi tiếp nhận:** `docs/05:48` đã soạn sẵn phần trả lời về chủ quyền dữ liệu, nhưng kèm điều kiện rõ ràng: phần đó chỉ dùng được sau khi checklist ngắt mạng ở `docs/05:66-69` được tick. **Checklist đó hiện chưa tick.** Cho tới khi hai điểm gọi ra ngoài được gỡ, phát biểu "ứng dụng chạy hoàn toàn trong mạng nội bộ" là chưa đúng với hiện trạng — mở DevTools tab Network sẽ thấy request đi tới fonts.googleapis.com.

---

## Nhóm F — Build, CI, quy ước mã nguồn, cách chạy dự án

### 29. Cách chạy dự án và các lệnh có sẵn

Chạy `npm install` rồi `npm run dev` trong thư mục `app/`; admin phục vụ ở cổng **5173**. **Dự án cần hai dev server**: ứng dụng GS Immersive Tour là một app **độc lập** chạy ở cổng **5174**. Cấu hình cả hai đã có sẵn trong `.claude/launch.json`. Nếu chỉ chạy admin, màn Không gian số sẽ hiện hướng dẫn khởi động app kia kèm nút sao chép lệnh, chứ không phải trang trắng.

**Chi tiết triển khai:**

- Lệnh: `npm run dev` (Vite, cổng 5173); `npm run build` (`tsc -b && vite build` — **typecheck chặn build**); `npm run lint` (oxlint); `npm test` (`node --experimental-strip-types --test tests/**/*.test.ts`); `npm run preview`.
- `.claude/launch.json` khai báo hai cấu hình: `vm-app` (`npm run dev --prefix app`, cổng 5173) và `gs-tour` (chạy từ repo GS Tour riêng, `--port 5174 --strictPort`).
- Yêu cầu môi trường: Node đủ mới để hỗ trợ `--experimental-strip-types` (chạy TypeScript trực tiếp không cần biên dịch). Đây là cờ **thử nghiệm** — thêm một lý do nên chuyển sang Vitest.
- Triển khai production: `npm run build` cho ra thư mục tĩnh, đặt sau Nginx. Cần đặt biến môi trường `VITE_GS_TOUR_URL` trỏ tới nơi host GS Tour thật (xem mục 34).

**Hạn chế đã biết:** `package.json` **không có script `typecheck` và không có `format`**. Nên bổ sung cả hai cùng lúc dựng CI.

### 30. Quản lý mã nguồn: chưa có Git và chưa có CI

**Dự án chưa có kho git và chưa có CI.** Thư mục gốc không phải kho git, và không có `.github/workflows`. Hệ quả là kết quả `tsc` sạch ở thời điểm bàn giao đến từ kỷ luật cá nhân, **không có cơ chế nào bảo đảm cho các thay đổi sau đó**. Với khối lượng công việc sắp tới và nhiều người cùng làm, đây là rủi ro độc lập với mọi vấn đề kỹ thuật khác. Chi phí dựng: **1–2 người-ngày**.

**Chi tiết triển khai:**

- `git status` → *not a git repository*. Không có thư mục `.github/workflows`.
- CI tối thiểu cần ba cổng: `tsc -b --noEmit`, `oxlint`, `npm test`. Cả ba hiện đều **exit 0**, nên dựng CI ở thời điểm này là dựng trên nền xanh — chi phí thấp nhất.
- Hạng mục này là `ARC-10`, và audit xếp nó là việc **nên làm trước tiên** trong toàn bộ 93 đề xuất.

**Lưu ý khi tiếp nhận — rủi ro đã thực sự xảy ra:** trong lúc audit chạy, mã nguồn **đang được sửa song song bởi một phiên làm việc khác**, khiến các trích dẫn `file:dòng` trong báo cáo bị trôi. Không có git thì không có cách nào lần lại thay đổi nào đến từ đâu. Đây cũng là lý do tài liệu này ghi rõ ngày chụp mã nguồn ở phần đầu.

### 31. Quy ước mã nguồn và cấu trúc thư mục

Quy ước trung tâm của dự án là **chú thích giải thích "vì sao", không phải "cái gì"**. Audit chấm hạng mục "tài liệu trong mã" là **5/5** kèm nhận xét "hiếm". Ví dụ, `data/assets.ts:22-30` không mô tả mã làm gì mà giải thích **vì sao** danh sách đối tượng không được suy ngược từ danh sách asset. Người tiếp nhận đọc mã là nắm được ý đồ thiết kế chứ không phải suy đoán.

**Chi tiết triển khai:**

- Các ví dụ tiêu biểu: `data/selectors.ts:130-135` giải thích vì sao tập rỗng phải trả `null` chứ không phải 100%; `layout/navConfig.ts:1-7` giải thích vì sao nhóm "Khai thác" tách khỏi nhóm "Dữ liệu" (hai nhóm người dùng khác nhau); `navConfig.ts:26-29` giải thích vì sao **không dùng `label` làm khoá nhóm** (người dùng đổi tên được, nhãn đổi thì tuỳ chỉnh mồ côi); `permissions.ts:124-127` giải thích vì sao vai trò Quản trị không có quyền duyệt.
- Quy ước kỹ thuật: TypeScript `strict` đầy đủ, **0 lần `any`**, CSS Module đặt cạnh component, kiểu miền tập trung ở `services/types.ts`, chính sách tập trung ở `data/permissions.ts`, chú thích viết bằng **tiếng Việt** theo đúng đối tượng bàn giao.
- Cấu trúc thư mục: `pages/` (20+ trang), `components/` (thành phần dùng lại), `layout/` (AppShell, Sidebar, Header), `services/` (cổng dữ liệu), `data/` (nguồn và công thức), `utils/`, `theme/`, `i18n/`, `context/`, `config/`.
- Chú thích **gắn với ADR**: nhiều chỗ dẫn thẳng ADR-0003/0004/0005/0010/0011/0012/0016, nên đọc mã là lần ra được quyết định kiến trúc tương ứng. Bộ tài liệu đi kèm gồm 17 tài liệu và 16 ADR; giá trị của lớp chú thích là **nối mã với ADR**.

**Hạn chế đã biết:** cam kết viết tại `services/types.ts:1-3` ("Components only ever import these — never `src/data` directly") đang **bị vi phạm ở 50 chỗ trong 18 tệp** (mục 6). Một quy ước không được thực thi bằng máy sẽ bị vi phạm; đó là căn cứ cho việc bổ sung quy tắc lint `no-restricted-imports` (`ARC-09`).

### 32. Gói build và cơ hội tách chunk

Gói build hiện là **một chunk duy nhất 1,14 MB, tức 302 KB sau gzip**. Con số này chấp nhận được với một admin nội bộ, nhưng có một lãng phí rõ: **three.js được nạp ngay từ màn đăng nhập** dù chỉ dùng ở một màn chi tiết. Tách chunk bằng `React.lazy` tốn **nửa người-ngày** và cắt được phần lớn tải trọng ban đầu. Việc này chưa làm vì chưa phải nút thắt ở quy mô hiện tại.

**Chi tiết triển khai:**

- `app/dist/assets/index-*.js` — một chunk, không code-splitting, không `React.lazy` (grep trả về 0).
- Việc tách gồm hai phần: cấu hình `manualChunks` trong Vite cho `three` và `react-vendor`; `React.lazy` cho màn chi tiết tài sản. Hạng mục `ARC-07`.
- Lợi ích phụ: sau khi tách, màn đăng nhập và màn Tổng quan — hai màn đầu tiên người dùng thấy — tải nhanh hơn đáng kể.

**Lưu ý khi tiếp nhận:** kết luận "302 KB là đủ nhỏ" chỉ đúng trong bối cảnh mạng nội bộ; nếu phát sinh yêu cầu truy cập từ xa thì ngưỡng chấp nhận sẽ khác. Ngoài ra, **dự án chưa chạy đo Lighthouse**. Audit ghi rõ giới hạn phương pháp của mình: **chưa chạy thử ứng dụng trong trình duyệt** — mọi kết luận rút từ mã nguồn và từ các lệnh `tsc`, `lint`, `test`.

---

## Nhóm G — Tuỳ chỉnh sidebar, nhúng GS Tour, trang Trợ giúp

### 33. Tuỳ chỉnh sidebar và cơ chế lưu localStorage

Người dùng có thể đổi tên mục và nhóm, ẩn mục không dùng, và gập nhóm cho gọn; toàn bộ lưu ở `localStorage` trên máy của họ. Lựa chọn localStorage là vì đây là **sở thích hiển thị của từng người trên từng máy**, không phải dữ liệu nghiệp vụ, và hiện chưa có backend để lưu theo tài khoản. Khi có backend, chuyển sang lưu theo hồ sơ người dùng chỉ cần **thay hai hàm đọc/ghi**; phần còn lại giữ nguyên.

**Chi tiết triển khai:**

- `app/src/layout/navCustomization.ts` — khoá `vmAdmin.navCustom` (`:15`). Năm loại tuỳ chỉnh (`:20-38`): `renamed`, `hidden`, `renamedGroups`, `hiddenGroups`, `collapsedGroups`.
- **Tuỳ chỉnh của nhóm để riêng khỏi tuỳ chỉnh của mục** thay vì trộn chung một không gian khoá. Chú thích ở `:25-29` giải thích lý do: "id nhóm và id mục là hai hệ độc lập, trộn chung thì một ngày nào đó thêm mục trùng tên nhóm là hỏng".
- **Phân biệt "ẩn" và "thu gọn"** (`:31-37`): ẩn nhóm là bỏ khỏi menu; thu gọn là vẫn thấy nhãn, chỉ gấp các mục lại. Hai khái niệm khác nhau và không trộn.
- **Chống dữ liệu hỏng:** `read()` (`:57-79`) không tin cả object mà **lọc lại từng phần tử** (`sanitizeRenames`, `sanitizeIds`), vì localStorage có thể do phiên bản cũ ghi (bản đầu chưa có hai trường nhóm) hoặc bị sửa tay, và một giá trị sai kiểu sẽ làm hỏng cả sidebar. Có `try/catch` cho chế độ duyệt riêng tư, rơi về menu mặc định thay vì sidebar trắng.
- Nhãn bị giới hạn 32 ký tự (`:18`) để không phá vỡ bề rộng sidebar 232px.
- `count` (`:196-203`) **cố ý không đếm nhóm thu gọn**; chú thích giải thích: `count` tồn tại để nhắc người dùng có thứ đang bị giấu mà họ có thể đã quên, trong khi nhóm thu gọn vẫn hiện nhãn nên không ai quên được — đưa vào đếm chỉ làm badge nhiễu.

**Điểm dễ hiểu nhầm:** **ẩn mục menu không phải là phân quyền.** Chính tệp mã cảnh báo điều này ở `navCustomization.ts:4-9`: "Đây là sở thích hiển thị, KHÔNG phải phân quyền… Ẩn một mục ở đây không hề chặn truy cập: gõ thẳng đường dẫn vẫn vào được. Đừng bao giờ dùng cơ chế này để 'giấu' chức năng vì lý do an toàn thông tin." Thứ tự hai lớp cũng cần nắm rõ: `filterNavByRole` chạy **trước**, tuỳ chỉnh người dùng chạy **sau** — người dùng không thể hiện lại một mục mà vai trò của họ không được thấy.

### 34. Nhúng GS Immersive Tour bằng iframe

GS Immersive Tour được nhúng qua iframe vì đó là **một ứng dụng độc lập, repo riêng, nền tảng khác**: nó dùng PlayCanvas trong khi admin dùng three.js. Gộp hai engine 3D vào một bundle sẽ kéo theo xung đột phụ thuộc và một gói rất lớn, đổi lấy lợi ích gần bằng 0 ở giai đoạn này. iframe cho phép hai ứng dụng phát triển và triển khai độc lập; admin **chỉ cần biết địa chỉ** chứ không cần build cùng. Hạn chế của cách nhúng này nằm ở mục 35.

**Chi tiết triển khai:**

- `app/src/config/externalTools.ts:1-4` ghi rõ bản chất: "ứng dụng Vite + PlayCanvas ĐỘC LẬP (repo riêng, không phải một phần của admin này)".
- Cấu hình theo môi trường (`:10-14`): production dùng biến `VITE_GS_TOUR_URL`, **không hard-code localhost**; nếu không set thì rơi về `localhost:5174` để môi trường dev chạy được ngay.
- Hai entry: `GS_EDITOR_URL` = `${base}/editor/` (chú thích `:19` lưu ý ứng dụng đích **bắt buộc có dấu `/` cuối**), và `GS_VIEWER_URL` = `${base}/` kèm tham số `?tour=` nếu đã cấu hình.
- **Quyết định sản phẩm có chủ đích** (`:22-26`): cố ý **không trỏ vào tour mẫu có sẵn** của ứng dụng GS, vì đó là dữ liệu thử nghiệm không liên quan Văn Miếu. Khi tour Văn Miếu thật được dựng từ dữ liệu NAS, chỉ cần đặt biến `VITE_GS_TOUR_JSON`, **không phải sửa mã**.
- `components/EmbeddedTool.tsx` **tự kiểm tra ứng dụng đích có đang chạy không trước khi nhúng** (`:39-58`), dùng `fetch` với `mode:'no-cors'` và timeout 2,5 giây; chú thích `:44-49` giải thích vì sao một response opaque vẫn đủ để biết có server đang lắng nghe. Nếu không chạy thì hiện hướng dẫn kèm **nút sao chép lệnh khởi động** (`:99-120`) thay vì trang trắng. Có `mountedRef` (`:29-37`) chống setState sau khi component tháo.

**Hạn chế đã biết:** nếu môi trường production **không đặt biến `VITE_GS_TOUR_URL`**, ứng dụng rơi về `localhost:5174` và người dùng cuối sẽ thấy màn "chưa kết nối được". Đây là rủi ro triển khai thật; việc kiểm biến môi trường cần nằm trong checklist deploy.

### 35. Ranh giới dữ liệu giữa hai ứng dụng

**Hai ứng dụng không trao đổi dữ liệu với nhau.** Không có `postMessage` và không có kênh dữ liệu nào — grep toàn repo trả về 0 kết quả. Đây là hạn chế lớn nhất của cách nhúng hiện tại: một tour do người dùng dựng ra **xuất thành tệp rời và không trở thành một tài sản trong hệ thống** — không có mã định danh, không có phiên bản, không đi qua luồng duyệt, không vào nhật ký kiểm toán. Về mặt nghiệp vụ, sản phẩm của khâu "Khai thác" hiện nằm ngoài toàn bộ quy trình quản lý đã xây cho khâu "Dữ liệu".

**Chi tiết triển khai:**

- Grep `postMessage` trong `app/src/` → **0 kết quả**. `EmbeddedTool.tsx:90-95` chỉ đặt thẻ `<iframe src title allow>`, không gắn trình nghe `message`.
- Thuộc tính `allow="fullscreen; xr-spatial-tracking; gamepad; clipboard-write"` (`:93`) cấp năng lực trình duyệt cho ứng dụng nhúng, nhưng **đó không phải kênh dữ liệu**.
- Hệ quả nghiệp vụ cụ thể: một tour Văn Miếu dựng xong hiện **không** có mã tầng 2, **không** vào được pipeline 11 trạng thái, **không** có ai duyệt trước khi công bố, và **không** để lại vết trong nhật ký. Nếu tour đó được đem trình chiếu cho công chúng thì không có cơ chế nào bảo đảm nội dung đã qua thẩm định.
- Đường đi khi cần đóng kênh: `postMessage` hai chiều với kiểm tra `origin` chặt (bắt buộc, vì iframe khác origin); định nghĩa một giao thức tối thiểu gồm "tour đã lưu" và "yêu cầu danh sách tài sản"; rồi đăng ký tour như một `Asset` với `digitalForm` riêng để nó đi vào đúng luồng duyệt. Việc này thuộc giai đoạn sau và **chưa được lượng hoá chi tiết**.

**Điểm dễ hiểu nhầm:** iframe ở đây là **phép ghép hình ảnh, không phải ghép dữ liệu**; gọi nó là "tích hợp" sẽ mô tả sai năng lực hiện có. Giao diện có thể gây hiểu nhầm theo hướng ngược lại: nhóm "Khai thác" được tách thành một nhóm menu riêng ngang hàng với "Dữ liệu" (`navConfig.ts:1-7`), tức **hứa hẹn một năng lực ngang tầm**, trong khi thực tế là một khung nhúng không kết nối. Ngoài ra, `postMessage` chỉ là cơ chế truyền tin; điều kiện thật để tour trở thành tài sản được quản lý là **hệ thống phải có phiên bản trước đã** — mà phiên bản hiện chưa có (mục 14). Giá trị thật của cách nhúng hiện tại là trình diễn được năng lực khai thác dữ liệu 3D trong cùng một giao diện, và cho phép hai đội làm việc song song không chặn nhau.

### 36. Trang Trợ giúp & tra cứu: cấu trúc và nguyên tắc trình bày

Trang này trước đây tên là "Tuân thủ & quản trị dữ liệu" và trình bày các mục pháp lý dưới dạng **tuyên bố tự chấm — "Đạt ✓"**. Cách trình bày đó đã bị bỏ theo yêu cầu của chủ đầu tư, với lý do: **không ai kiểm chứng được, và phần mềm không phải chủ thể có thể "tuân thủ" hay "vi phạm" một văn bản pháp luật — chỉ con người mới chịu trách nhiệm được.** Trang mới là tài liệu 2 cột có deep-link; mỗi mục pháp lý tách thành 4 phần rạch ròi, và phần cuối luôn là **một chức danh con người xác nhận**, không phải hệ thống.

**Chi tiết triển khai:**

- `app/src/data/helpContent.ts:3-11` ghi lại đầy đủ lý do thay đổi. Bốn phần của mỗi mục: `yeuCau` (văn bản yêu cầu gì) → `heThongHoTro` (hệ thống hỗ trợ **công cụ** gì, không phải "đã làm xong") → `donViTuLam` (đơn vị vận hành phải tự làm và tự kiểm gì) → `trachNhiemXacNhan` (**chức danh nào xác nhận — luôn là con người**).
- Kỷ luật trích dẫn theo **ADR-0014** (`helpContent.ts:13-17`): chỉ tái sử dụng các trích dẫn pháp lý đã có sẵn ở trang cũ, **giữ nguyên văn, không bịa thêm** số hiệu, điều khoản hay nội dung pháp lý mới. Phần diễn giải nghiệp vụ không bị ràng buộc nguyên văn, và ranh giới đó được ghi rõ trong mã.
- Ba nhóm nội dung (`:20-26`): `phap-ly` (Pháp lý), `huong-dan` (Hướng dẫn sử dụng), `canh-bao` (**Đính chính văn bản** — nhóm ghi nhận những chỗ tài liệu dự án nói sai và đã sửa).
- Quy mô: `data/helpContent.ts` **728 dòng**, `pages/HelpPage.tsx` **382 dòng** — nội dung tách hoàn toàn khỏi UI.
- **Deep-link** bằng route param `/help/:entryId` (`HelpPage.tsx:63`), không dùng hash. Mục lục đánh dấu mục đang xem bằng `aria-current="page"` (`:138-139`) và cuộn về đầu khi đổi mục (`:97-98`). Id sai thì hiện trang tổng quan kèm thông báo (`:181`) chứ không lỗi.
- `HelpSupportItem` có `href` tuỳ chọn (`:29-33`) để điều hướng thẳng tới màn liên quan, nối tài liệu vào chức năng thật.

**Điểm dễ hiểu nhầm:** việc đổi cách trình bày **không đồng nghĩa với việc bỏ theo dõi tuân thủ**. Module quyền "Tuân thủ" giữ nguyên; chỉ cách trình bày đổi. `permissions.ts:74-77` có chú thích ghi rõ điều này: route đổi từ `/compliance` sang `/help`, nhưng nghiệp vụ quản lý hồ sơ tuân thủ vẫn tồn tại.

### 37. Thứ tự ưu tiên năm hạng mục trước khi lên production

Nếu chỉ thực hiện được năm hạng mục trước khi lên production, thứ tự khuyến nghị như sau — thứ tự này dựa trên quan hệ phụ thuộc giữa các hạng mục, không phải mức độ dễ làm.

| # | Hạng mục | Chi phí | Lý do xếp thứ tự |
|---|---|---|---|
| 1 | Dựng Git + CI (`ARC-10`) | 1–2 người-ngày | Không có nó thì mọi việc sau không kiểm soát được |
| 2 | Gỡ Google Fonts và ảnh Wikimedia | 0,5 người-ngày | Rẻ nhất, chặn rủi ro ngắt mạng lớn nhất |
| 3 | Bọc lớp dịch vụ trả `Promise` + tách `contracts.ts` | 4–6 người-ngày | **Nút thắt chặn gần như mọi đề xuất khác**; làm sau thì các việc khác phải làm hai lần |
| 4 | Nối dây phân quyền vào UI + guard route theo vai trò | 2–3 người-ngày | Biến kiểm soát hình thức thành kiểm soát thật |
| 5 | `ErrorBoundary` + trạng thái tải (`ARC-05`) | 1–2 người-ngày | Ngăn mọi lỗi trở thành trang trắng khi có mạng |

Tổng: **khoảng 9–14 người-ngày**. Cả năm hạng mục **làm được trên mock, không cần backend, không phát sinh chi phí hạ tầng**.

**Chi tiết bối cảnh:**

- Audit gọi hạng mục số 3 là "hạng mục khuyến nghị mạnh nhất trong toàn bộ 93 đề xuất". Nếu chỉ chọn được duy nhất một việc, đó là việc nên chọn, vì nó là việc duy nhất mà làm muộn sẽ khiến mọi việc khác phải làm lại.
- Gói P0 đầy đủ của audit là **31–47 người-ngày cho 12 mục**, với ba mức cắt gọt: tối thiểu 4,5–6 ngày, khuyến nghị 15–22 ngày, đầy đủ 31–47 ngày.
- Hai hạng mục ngoài danh sách 5 nhưng ROI rất cao nếu quỹ thời gian cho phép: **IIIF manifest tĩnh + viewer** (**5–8 người-ngày**, JSON tĩnh không cần backend, audit xếp **ROI cao nhất toàn bộ**), và **manifest tệp cho mô hình một tài sản = nhiều tệp** (**5–8 người-ngày**, chặn tình huống mất texture của tệp OBJ).

**Lưu ý khi tiếp nhận:** mọi tính năng mới thêm vào **trước** khi bọc `Promise` sẽ phải viết lại sau khi bọc, tức trả chi phí hai lần. IIIF không nằm trong danh sách 5 vì nó là giá trị cộng thêm chứ không chặn hạng mục nào khác; nếu có thêm quỹ thời gian thì đây là hạng mục thứ 6 được khuyến nghị mạnh.

---

## Phụ lục — Bảng tóm tắt hiện trạng

| Hạng mục | Hiện trạng | Việc còn lại (người-ngày) |
|---|---|---|
| Ranh giới bất đồng bộ của lớp dịch vụ | Đồng bộ 100%; grep `Promise` = 0 | Bọc `Promise` + tách `contracts.ts`: **4–6** |
| Thực thi phân quyền | Chính sách đầy đủ và có test; **chưa nối vào UI** | Nối `can` + `RequireRole`: **2–3** |
| `RequireAuth` | Chỉ kiểm `authed`, **không kiểm vai trò** | Nằm trong hạng mục trên |
| Tiêu thụ đối tượng `can` | **0 điểm tiêu thụ** trong toàn `app/src/` | Nằm trong hạng mục trên |
| Kiểu `Role` | Suy biến thành `string`; union `RoleName` đã có nhưng chưa dùng | `ARC-06`: **< 1** |
| Viewer 3D | Hình khối dựng thủ tục; **không có `GLTFLoader`**, không tệp `.glb` | Pipeline 3D thật (`ARC-13`): chưa lượng hoá; `docs/03`/`docs/16` cần sửa câu chữ |
| Hiệu năng danh sách | Ngưỡng vỡ ~3.200 bản ghi; 49,5 ms ở 10.000; 235 ms ở 50.000 | Debounce **0,5**; phân trang cửa sổ trượt **0,5**; phân trang máy chủ `ARC-03` |
| Ảo hoá danh sách | Chưa có ở bất kỳ đâu | **1–2** |
| Kiểm thử | 16 test, đạt 16/16, 0,92% dòng; chưa có khung test component | Khung Vitest **1**; phủ 6 mô-đun rủi ro **3–5** |
| Phiên bản tài sản | **Không có**; sửa là ghi đè | **4–6** |
| Một tài sản = nhiều tệp | Chưa có; OBJ mất texture vẫn khớp checksum | **5–8** |
| Xử lý lỗi | Không `ErrorBoundary`, không skeleton; lỗi = trang trắng | `ARC-05`: **1–2** |
| Trao đổi dữ liệu giữa hai app | **Không có** `postMessage`; tour xuất tệp rời | Phụ thuộc hạng mục phiên bản; chưa lượng hoá |
| Tuỳ chỉnh sidebar | Hoạt động đầy đủ, lưu `localStorage`; **không phải cơ chế phân quyền** | Chuyển sang hồ sơ người dùng khi có backend: thay 2 hàm |
| Git và CI | **Chưa có cả hai** | `ARC-10`: **1–2** |
| Gọi ra internet | 2 điểm: Google Fonts + 6 ảnh Wikimedia | Đóng gói nội bộ: **0,5–1** |
| Tách chunk build | Một chunk 1,14 MB / 302 KB gzip; `three` nạp từ màn đăng nhập | `ARC-07`: **0,5** |
| Nhập lô quan hệ | Template CSV dùng `depicts`, mã dùng `depictedIn`; mất `hasRubbing` | **1–2** |
| Số liệu màn Tổng quan | 4 badge + 4 sparkline là hằng số viết tay | **1,5–2,5** |
| a11y | `Modal` đạt chuẩn; `ConfirmModal` thiếu `label`, chủ đề `crimson` 1,81:1 | **0,5–1** |
| Hệ kiểu | 0 lần `any`; 7 trường nên là union đang để `string`; ngày là chuỗi hiển thị | Union **< 1**; ISO 8601 **1–2** |
| IIIF | **Bằng 0** trong mã nguồn | Manifest tĩnh + viewer: **5–8** (ROI cao nhất) |
| Điểm kiến trúc | 2,05/5 theo thước sẵn sàng production; 4/5 theo thước chất lượng phần đã viết | Toàn bộ nền móng production: **163–243** |

---

*Tài liệu này chỉ phủ lăng kính kiến trúc và mã nguồn. Vận hành, hạ tầng, lộ trình và pháp lý nằm ở các tài liệu bàn giao khác trong `docs/`. Mọi trích dẫn `file:dòng` là ảnh chụp mã nguồn ngày **09/09/2026**; hãy kiểm lại vị trí nếu mã đã thay đổi.*
