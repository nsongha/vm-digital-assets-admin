# Audit 00 — Tổng hợp đề xuất nâng cấp

> **Điều phối:** agent chính (orchestrator) · **Ngày lập:** 12/08/2026
> **Phạm vi:** toàn bộ app `app/`, bộ tài liệu thầu `docs/` (17 tài liệu + 16 ADR), cấu trúc dữ liệu `data/`
> **Câu hỏi được giao:** app này còn cách bao xa so với (a) hệ quản lý asset của VFX studio (ShotGrid, Frame.io…) và (b) tiêu chuẩn bảo tàng số quốc tế — và phải làm gì, tốn bao nhiêu, ai đang làm như vậy.

---

## 0. Đọc tài liệu này thế nào

Đây là bản tổng hợp của **6 báo cáo audit độc lập**, mỗi báo cáo do một agent chuyên trách một lăng kính viết, không đọc kết quả của nhau. Việc chúng **không** trao đổi với nhau là có chủ đích: khi sáu lăng kính độc lập cùng chỉ vào một chỗ, đó là tín hiệu mạnh hơn nhiều so với một báo cáo dài nói mọi thứ.

- Cần **quyết định nhanh** → đọc §1 và §6.
- Cần **hiểu vì sao** → đọc §3 (đây là phần có giá trị nhất của bản tổng hợp).
- Cần **chi tiết kỹ thuật + chi phí từng việc** → mở báo cáo con tương ứng ở §2.
- Cần biết **tin được đến đâu** → đọc §4 và §9.

Toàn bộ chi phí trong tài liệu này tính bằng **người-ngày**. Quy đổi tiền chỉ xuất hiện khi báo cáo con có nêu, và **mọi đơn giá đều là giả định chưa kiểm chứng** — xem §9.

---

## 1. Kết luận một trang

**Về câu hỏi "đã tốt như ShotGrid/Frame.io chưa":** chưa, và khoảng cách nằm ở chỗ khác với dự đoán thông thường. App không thiếu tính năng bề mặt — nó có 20 màn, pipeline 11 trạng thái, kiểm kê, tuân thủ, nhật ký. Cái nó thiếu là **bốn khái niệm nền** mà mọi hệ quản lý asset chuyên nghiệp đều coi là bắt buộc:

1. **Phiên bản (version)** — không có khái niệm này trong mô hình dữ liệu. Sửa một tài sản là ghi đè.
2. **Một tài sản = nhiều tệp** — mô hình hiện tại là một tài sản một tệp, nên OBJ mất texture mà checksum vẫn khớp.
3. **Quan hệ dẫn xuất (lineage)** — không truy được bản web sinh từ bản gốc nào.
4. **Quyền được thực thi** — quyền hiện là trang trí (xem §3.1).

**Về câu hỏi "đã đạt chuẩn bảo tàng số quốc tế chưa":** chưa, và bảng chấm 36 chuẩn cho ra một hình dạng rất rõ: **5 Đạt / 16 Một phần / 15 Chưa**, trong đó **cả 5 chuẩn "Đạt" đều là chuẩn định dạng tệp** (PDF/A, JPEG2000, E57, NDSA, WCAG). Không một chuẩn **mô tả, liên thông hay định danh** nào đạt. IIIF bằng 0 tuyệt đối trong mã nguồn. Đây là hình dạng đặc trưng của một dự án được dẫn dắt bởi **tư duy kỹ thuật số hoá**, chưa được dẫn dắt bởi **tư duy bảo tàng số**.

**Nhưng — và điều này quan trọng với hồ sơ thầu:** phần lớn khoảng cách trên **không đắt để thu hẹp ở mức đủ thuyết phục hội đồng**, vì nền móng tài liệu đã tốt bất thường. ERD, OpenAPI, 16 ADR, quy trình bảo quản OAIS, kỷ luật trích dẫn pháp lý — đều đã có và đều trên mặt bằng. Vấn đề là **app chưa đuổi kịp tài liệu của chính nó**, chứ không phải tài liệu nông.

Hệ quả trực tiếp: **rủi ro lớn nhất của hồ sơ này không phải "làm chưa đủ", mà là "tài liệu mô tả những thứ app chưa làm"** — và hội đồng chỉ cần bấm thử là thấy. Xem §3.2.

> **Nếu chỉ đọc một dòng:** gói **P0 hợp nhất ≈ 31–47 người-ngày** (§6) xử lý toàn bộ rủi ro vỡ demo và phần lớn khoảng cách chuẩn có thể trình diễn được, **không cần backend, không tốn thêm USD hạ tầng**. Cắt gọt được xuống **15–22** (mức khuyến nghị) hoặc **4,5–6** (tối thiểu chặn vỡ demo) — ba mức nêu ở cuối §6.

---

## 2. Bản đồ 6 báo cáo

| # | Báo cáo | Lăng kính | Dòng | Đề xuất |
|---|---|---|---|---|
| 01 | [Đối chiếu hệ quản lý asset VFX studio](01-benchmark-dam-vfx.md) | ShotGrid/Flow, ftrack, Frame.io, Perforce, Kitsu | 602 | `DAM-01`…`DAM-12` |
| 02 | [Tiêu chuẩn bảo tàng số quốc tế](02-chuan-bao-tang-so.md) | OAIS, PREMIS, LIDO/CIDOC-CRM, IIIF, EDM, Getty, Spectrum, CoreTrustSeal | 1.237 | `STD-01`…`STD-20` |
| 03 | [Định dạng, bảo quản & siêu dữ liệu kỹ thuật](03-media-3d-splat-bao-quan.md) | mesh/point cloud/**Gaussian splat**/ảnh/AV, fixity, dung lượng | 772 | `FMT-01`…`FMT-12` |
| 04 | [Quy trình duyệt, ghi chú & cộng tác](04-quy-trinh-review-cong-tac.md) | Frame.io/ShotGrid Review + Spectrum 5.1, RACI, bốn mắt | 968 | `WF-00`…`WF-14` |
| 05 | [Kiến trúc code & khả năng lên production](05-kien-truc-va-production.md) | nợ kỹ thuật, ngưỡng vỡ, Postgres+MinIO+Keycloak, TCO | 1.351 | `ARC-01`…`ARC-19` |
| 06 | [Red-team hội đồng chấm thầu](06-red-team-cham-thau.md) | khoảng cách docs↔app, câu hỏi sát thủ, đối thủ, vỡ demo | 852 | `RT-01`…`RT-15` |
| | **Tổng** | | **5.782** | **93 đề xuất** |

---

## 3. Sáu chủ đề xuyên suốt

Đây là phần có giá trị nhất: những gì **nhiều lăng kính độc lập cùng phát hiện**. Khi ba agent không biết nhau cùng chỉ vào một dòng mã, đó không còn là ý kiến — đó là kết luận.

### 3.1. Quyền là trang trí — *3 lăng kính độc lập cùng phát hiện*

Phát hiện bởi **01** (`DAM-05`), **04** (`WF-06`), **05** (mục phân quyền). Điều phối viên đã tự kiểm chứng lại bằng mã nguồn:

- `Capabilities {read, write, approve, publish, admin}` được khai báo và cấp phát qua `can` trong `AuthContext.tsx` — nhưng **không một component nào đọc `can`**. Cả 6 chỗ gọi `useAuth()` chỉ lấy `authed`/`user`/`role`/`signIn`.
- `RequireAuth` **chỉ kiểm `authed`, không kiểm vai trò**. Các route `/users`, `/api-keys`, `/backup` không có guard riêng.
- `filterNavByRole` chỉ **ẩn mục menu** — che mắt, không phải kiểm soát.

**Hệ quả demo:** vai trò "Chỉ xem" bấm được nút Phê duyệt/Xuất bản; và gõ thẳng `/users` vào thanh địa chỉ là vào được màn quản trị người dùng. Cả hai đều là thao tác hội đồng có thể tự làm.

**Lưu ý về tính thời sự:** trong lúc audit chạy, một phiên làm việc song song đã refactor vùng này (gom chính sách về `data/permissions.ts`, thêm `tests/permissions.test.ts`). Việc đó **đã sửa được** chuyện hai nguồn quyền mâu thuẫn, nhưng **chưa** nối quyền vào UI — điều phối viên đã kiểm lại sau refactor lúc 17:36 và phát hiện vẫn còn nguyên.

### 3.2. Tài liệu mô tả năng lực app không có — *đây là rủi ro số 1 của hồ sơ*

Phát hiện bởi **06** (G1–G6), **03** (`FMT-09`), **02** (`STD-17a`). Ba trường hợp nặng nhất, đã kiểm chứng bằng mã nguồn:

| Tài liệu nói | Thực tế | Mức |
|---|---|---|
| `docs/03:25` + `docs/16:91`: "tải GLB qua `GLTFLoader` và `.ply`/`.sog` qua `gaussian-splats-3d`" | **Không có loader nào** trong `app/src/`; `package.json` chỉ có `three`; `StelePreview.tsx` dựng bia bằng `BoxGeometry`+`SphereGeometry`, **giống hệt nhau cho mọi bia** | **Rất cao** |
| `apis.ts:8`: kênh `OAI-PMH /oai`, **"420 lượt gọi"**, dùng làm bằng chứng tuân thủ ở `complianceEvidence.ts:190` | Endpoint không tồn tại | **Rất cao** |
| `i18n/vi.ts:41`: "Hệ thống kiểm tra định dạng, độ phân giải và checksum" | `uploadService.ts:46` gán cứng tên tệp và `'1,1 GB'`, không nhận tham số | **Cao** |

**Phân biệt quan trọng mà điều phối viên đã đính chính vào báo cáo 06:** không phải mọi khoảng cách docs↔app đều là lỗi trung thực.

- **Lỗi trung thực thật:** `docs/16` là tài liệu *tự nhận hạn chế* mà lại tự nhận sai **theo hướng có lợi cho nhà thầu**. Nếu hội đồng bắt được điều này, giá trị làm chứng của cả tài liệu đó sụp, kéo theo uy tín toàn bộ hồ sơ. Và con số **"420 lượt gọi"** trên một kênh chưa tồn tại là **chỉ số bịa** — khác hẳn "tính năng chưa làm".
- **Việc tồn đọng, không phải nói dối:** `docs/05:48` soạn sẵn câu trả lời chủ quyền dữ liệu nhưng **kèm điều kiện rõ ràng** "chỉ nói được câu này sau khi checklist xác nhận đã gỡ Google Fonts và Wikimedia", và checklist ngắt mạng có sẵn ở `docs/05:66-69` chưa tick. Tài liệu đã tự rào đúng chỗ. **Không cần sửa `docs/05`** — cần làm nốt việc gỡ.

Nhưng rủi ro vẫn ở mức Rất cao, vì app **thật sự** vẫn gọi ra ngoài: Google Fonts (`index.html:7-10`) và 6 ảnh Wikimedia (`collections.ts:7-17`). Ngắt mạng là vỡ font toàn giao diện + ảnh hero màn Tổng quan — đúng hai màn đầu tiên hội đồng nhìn thấy.

### 3.3. Lớp dịch vụ đồng bộ 100% — nút thắt chặn gần như mọi đề xuất khác

Phát hiện bởi **05** (`ARC-01`) và **01** (`DAM-11`). Điều phối viên đã kiểm chứng: grep `Promise|async` trong `app/src/services/` cho **0 kết quả**.

Đây là nợ kỹ thuật đắt nhất theo nghĩa *lãi kép*: nối API thật không phải "thay implementation sau interface" như ADR-0002 hứa, mà là **viết lại toàn bộ tầng gọi** ở mọi component — vì không có chỗ nào xử lý loading/error/race. Kho `store` còn rò rỉ vào chính interface ở 4 service.

Đề xuất `ARC-01`/`DAM-11` (bọc dịch vụ trả `Promise` + tách `contracts.ts`, 4–6 người-ngày) là **điều kiện nền**: làm sớm thì rẻ, làm sau thì mọi việc khác phải làm hai lần. Đây là hạng mục tôi khuyến nghị mạnh nhất trong toàn bộ 93 đề xuất.

### 3.4. Mô hình "một tài sản = một tệp" không đủ để bảo quản

Phát hiện bởi **03** (`FMT-01`, `FMT-02`, `FMT-03`) và **01** (`DAM-01`, lineage). Bốn hệ quả cụ thể:

- **Thiếu hẳn tầng "bản bảo quản"**: `digitization.ts:331-332` cho `master` và `web` dùng chung `ext[0]`, nên bản gốc và bản web của mesh **đều là `.glb`**. E57 (chuẩn ASTM) bị gán nhãn "Dữ liệu thô".
- **Bẫy OBJ**: 5 bản ghi `fmt: 'OBJ'`, mà OBJ luôn cần `.mtl` + texture. Mô hình một-tệp không biểu diễn được → **mất texture mà checksum vẫn khớp**. Đây là kiểu mất mát im lặng mà fixity không bắt được.
- **Ảnh nguồn photogrammetry không tồn tại trong mô hình dữ liệu** — chỉ là một chip chữ `'ZIP ảnh nguồn'` ở `metadataFields.ts:40`. Trong khi đó nó chiếm ~54% dung tích kho và là **đường phục hồi duy nhất** nếu splat mất khả năng đọc.
- **Point cloud KHÔNG cứu được splat**: `digitization.ts:390` khẳng định nó là "dữ liệu DUY NHẤT phục hồi được nội dung". Sai kỹ thuật — point cloud giữ 6/62 float (~10%), mất toàn bộ SH bậc cao, opacity, covariance.

### 3.5. Số liệu chưa tự nhất quán — ở đúng chỗ hồ sơ mời kiểm chứng

Phát hiện bởi **06** (đòn 4), **03** (`FMT-08`), **05** (`sizeFormulas`). Đây là chủ đề nhạy cảm vì `docs/05:25` **chủ động mời hội đồng kiểm chứng** rằng "không có số ghi cứng" — trong khi 4 badge % và 4 sparkline trên màn Tổng quan là hằng số viết tay (`dashboard.ts:71,84,96,108`), nằm **đúng trên 4 ô được mời bấm**.

Lời mời đó là một nước đi mạnh nếu đúng, và là một cái bẫy tự đặt nếu sai. Chi phí sửa thấp (`RT-04`, `FMT-08`), nên đây là hạng mục ROI rất cao.

Ngoài ra: cơ số dung lượng lệch ~55× (app tính 127,4 GB/153 bản ghi; dựng lại từ tham số vật lý ra ~7 TB/bản AIP), và `BackupPage.tsx:528` đang trình bày chính con số này cho hội đồng. Ba hằng số lệch nội bộ: splat 190 vs 248 byte/Gaussian; WAV 16-bit vs template ghi 24-bit; `tiffPhotoSizeMB` lệch >10× so với chính `tiffA4SizeMB` cùng file.

### 3.6. Dữ liệu Hán Nôm — khoảng trống ở đúng chỗ hồ sơ bán năng lực mạnh nhất

Phát hiện bởi **06** và **02**. Toàn bộ mã nguồn chỉ có **4 ký tự Hán**, đều nằm trong một placeholder (`i18n/vi.ts:105`) — không một dòng minh văn nào trong dữ liệu, dù hồ sơ bán năng lực Hán Nôm 3 lớp (nguyên văn/phiên âm/dịch nghĩa).

Cộng thêm hai lỗi sẽ phát tác **ngay ngày đầu nhập liệu thật** — điều phối viên đã kiểm chứng:

- Template CSV dùng `depicts`, code dùng `depictedIn` — **ngược chiều nhau**. Nhập lô sẽ ghi quan hệ ngược.
- `relations.ts:20` thu hẹp `kind` còn 3 giá trị, **loại `hasRubbing`** — trong khi CSV có 5 chỗ dùng nó. **Bản dập là loại tư liệu trung tâm của di sản Hán Nôm** mà hệ không sinh được quan hệ.

Đây cũng là lý do **02** xếp IIIF là lỗ hổng nghiêm trọng nhất: 82 bia là hiện vật **văn bản**, và công sức phiên âm/dịch/song thẩm — phần đắt nhất của cả dự án — hiện đang bị nhốt trong `textarea`, **không neo vào toạ độ trên ảnh**. Không có IIIF thì công sức đó không tái sử dụng được, không trích dẫn được, không liên thông được.

---

## 4. Nhật ký kiểm chứng của điều phối viên

Tôi không nhận báo cáo của agent ở giá trị bề mặt. Những gì đã tự kiểm bằng mã nguồn hoặc nguồn gốc:

| # | Khẳng định | Kết quả | Xử lý |
|---|---|---|---|
| 1 | `docs/03:25` mô tả viewer 3D không tồn tại | ✅ Đúng — 0 loader, `package.json` chỉ có `three` | Giữ, nâng lên §3.2 |
| 2 | `can` không được component nào đọc | ✅ Đúng, **và vẫn đúng sau refactor 17:31** | Giữ, nâng lên §3.1 |
| 3 | `RequireAuth` không kiểm vai trò | ✅ Đúng — chỉ kiểm `authed`; 3 route quản trị không có guard | Giữ |
| 4 | Lớp dịch vụ đồng bộ 100% | ✅ Đúng — grep `Promise\|async` = 0 | Giữ, nâng lên §3.3 |
| 5 | CSV `depicts` vs code `depictedIn` ngược chiều; `hasRubbing` bị loại | ✅ Đúng — CSV 3 `depicts` + 5 `hasRubbing`; `relations.ts:20` chỉ có 3 kind | Giữ, nâng lên §3.6 |
| 6 | IIIF = 0 trong `app/src/` | ✅ Đúng — 0 kết quả | Giữ |
| 7 | Khronos `KHR_gaussian_splatting` tồn tại, RC 02/2026 | ✅ Đúng — đọc trực tiếp đặc tả glTF chính thức | **Đã sửa báo cáo 03**: trạng thái hiện **vẫn là Release Candidate, CHƯA phê chuẩn** dù đã qua Q2/2026 |
| 8 | OAI-PMH `/oai` không tồn tại | ✅ Đúng | **Đã tách mức độ**: mock chưa có endpoint là bình thường; **"420 lượt gọi"** mới là chỉ số bịa |
| 9 | `docs/05:48` hứa sai về chủ quyền dữ liệu | ⚠️ **Diễn giải quá tay** | **Đã đính chính báo cáo 06**: `docs/05:48` có kèm điều kiện tiên quyết; đây là việc tồn đọng, không phải lỗi trung thực |

**Hai sửa đổi tôi đã ghi vào báo cáo con** (mục 7 và 9 ở trên) đều theo hướng **hạ giọng cho đúng sự thật**, vì một cáo buộc quá tay trong hồ sơ thầu gây hại đúng bằng một khẳng định quá lời.

---

## 5. Trùng lặp giữa các báo cáo — đã khử trước khi cộng chi phí

Sáu agent làm việc độc lập nên **cộng thẳng chi phí của 93 đề xuất sẽ đội lên đáng kể**. Các cặp/nhóm trùng tôi đã hợp nhất:

| Nhóm | Các đề xuất trùng | Xử lý |
|---|---|---|
| Nối dây quyền | `DAM-05` · `WF-06` · phần phân quyền của `ARC` | Gộp thành **một** việc ≈ 2–3 người-ngày |
| Bọc lớp dịch vụ | `DAM-11` · `ARC-01` | Gộp ≈ 4–6 người-ngày |
| Trung thực hoá nhãn/mô phỏng | `FMT-09` · `STD-17a` · `RT-03` | Gộp ≈ 1–1,5 người-ngày |
| Sửa số ghi cứng | `RT-04` · `FMT-08` | Gộp ≈ 1,5–2,5 người-ngày |
| Phiên bản tài sản | `DAM-01` · phần version của `WF` · PREMIS trong `STD` | Gộp ≈ 4–6 người-ngày |

**Một điểm căng thẳng giữa hai báo cáo, tôi giữ cả hai và nêu rõ:** báo cáo **03** khuyến nghị dùng `KHR_gaussian_splatting` làm tầng bản bảo quản cho splat; báo cáo **02** thì nhấn mạnh rằng chuẩn *chưa phê chuẩn* không nên được viện dẫn như chuẩn đã ban hành. Cả hai đều đúng và không loại trừ nhau — **hành động** là sinh bản GLB theo đặc tả RC (giá trị kỹ thuật có thật ngay), nhưng **câu chữ trong hồ sơ** phải ghi "Release Candidate, chưa phê chuẩn". Đã ghi rõ vào báo cáo 03.

---

## 6. Gói P0 hợp nhất — làm trước buổi bảo vệ

Đã khử trùng lặp. **Không hạng mục nào cần backend. Hạ tầng tăng thêm: 0 USD.**

| # | Việc | Nguồn | Người-ngày | Vì sao ưu tiên |
|---|---|---|---|---|
| 1 | Gỡ Google Fonts + ảnh Wikimedia, đóng gói nội bộ | `RT-01` | 0,5–1 | Chặn đòn nguy hiểm nhất; mở khoá câu trả lời chủ quyền dữ liệu; rẻ nhất |
| 2 | Trung thực hoá nhãn: bỏ "420 lượt gọi", sửa `docs/16` về viewer 3D, gắn nhãn "Giai đoạn 2" cho nút chưa nối | `RT-03`+`FMT-09`+`STD-17a`+`WF-14a` | 1–1,5 | Xoá rủi ro uy tín — loại rủi ro không mua lại được bằng tiền |
| 3 | Bọc lớp dịch vụ trả `Promise` + tách `contracts.ts` | `ARC-01`+`DAM-11` | 4–6 | **Điều kiện nền** — làm sau thì mọi việc khác phải làm hai lần |
| 4 | Nối dây quyền vào UI + bốn mắt + guard vai trò cho route | `WF-06`+`DAM-05` | 2–3 | Chặn rủi ro demo lớn nhất; biến kiểm soát hình thức thành thật |
| 5 | Sửa số ghi cứng trên Tổng quan + 3 hằng số dung lượng + cơ số | `RT-04`+`FMT-08` | 1,5–2,5 | Bảo vệ chính lời mời kiểm chứng ở `docs/05:25` |
| 6 | Đồng bộ enum trạng thái app ↔ đặc tả API | `WF-00` | 0,5–1 | Gốc phụ thuộc; sửa sau đắt gấp nhiều lần |
| 7 | Sửa `depicts`/`depictedIn` + bổ sung `hasRubbing` + 5 template CSV | `STD` nhóm quan hệ | 1–2 | Template là tài liệu bàn giao — sai ở đây sinh dữ liệu sai từ ngày đầu |
| 8 | Manifest tệp: một tài sản = nhiều tệp | `FMT-03` | 5–8 | Điều kiện cần cho hầu hết mục còn lại; chặn mất texture OBJ |
| 9 | **IIIF manifest tĩnh + viewer** | `STD-09a` | 5–8 | **ROI cao nhất toàn audit** — JSON tĩnh, không cần backend, lấp lỗ hổng chuẩn nghiêm trọng nhất |
| 10 | Bộ xuất LIDO 1.1 + Dublin Core XML | `STD-06` | 8–12 | Dữ liệu đã gần đủ; xuất được LIDO XML hợp lệ là màn trình diễn rất thuyết phục |
| 11 | Sửa tương phản chủ đề `crimson` (1,81:1 — trượt WCAG AA) | `ARC-12` | 0,5 | Hai giờ công; bị bắt ngay nếu hội đồng kiểm tiếp cận hoặc chọn nhầm chủ đề |
| 12 | Git + CI tối thiểu (typecheck/lint/test) | `ARC-10` | 1–2 | Phải có trước mọi việc sửa mã khác |
| | **Tổng** | | **31–47** | |

**Ba mức cắt gọt, nếu quỹ thời gian hẹp:**

- **Tối thiểu tuyệt đối — 4,5–6 người-ngày** (mục 1, 2, 5, 11 + phần lời thoại): chặn đủ 5 đòn vỡ demo. Nếu chỉ còn một tuần, làm đúng gói này.
- **Khuyến nghị — ~15–22 người-ngày** (mục 1–8, 11, 12): chặn hết rủi ro demo **và** xử lý các nút thắt kiến trúc. Đây là điểm cân bằng tôi đề xuất.
- **Đầy đủ — 31–47 người-ngày** (cả 12 mục): thêm IIIF + LIDO, tức chuyển hồ sơ từ "làm tốt về kỹ thuật" sang **"nói được ngôn ngữ của bảo tàng số quốc tế"**. Hai mục 9 và 10 là thứ khiến hồ sơ khác biệt trước một hội đồng có chuyên gia di sản.

---

## 7. Lộ trình sau thầu

**Giai đoạn 6 tháng** — nền móng production (theo `ARC`, `DAM`, `WF`):
Postgres + MinIO + Keycloak **rời, không Supabase** (do yêu cầu tệp 50 GB và mTLS của LGSP) · **Docker Compose, không Kubernetes** (đội IT của Trung tâm mỏng) · tus.io cho tải lên tệp lớn · pg-boss cho hàng đợi · nhật ký append-only có hash-chain thật · phiên bản tài sản + lineage · fixity định kỳ chạy thật · máy chủ ảnh IIIF (Cantaloupe).

**Giai đoạn 18 tháng** — trưởng thành:
OpenSearch khi bắt đầu lập chỉ mục Hán Nôm (Postgres FTS sẽ không đủ) · định danh bền vững ARK/DOI · endpoint OAI-PMH thật · EDM/Europeana · annotation trên ảnh và mô hình 3D · **lộ trình CoreTrustSeal** (€1.000/3 năm, 16 yêu cầu — báo cáo 02 khuyến nghị **có** theo đuổi, và khuyến nghị **không** theo ISO 16363 / nestor Seal ở giai đoạn này).

**Ngưỡng vỡ cần biết trước:** lọc phía client đo được ~5,0 µs/bản ghi → rớt khung hình ở **~3.200 bản ghi**, 49,5 ms ở 10.000, 235 ms ở 50.000. Dự án chạm ngưỡng này **ngay khi số hoá Hán Nôm theo trang ở giai đoạn 2**, không phải giai đoạn 3.

**Sizing & TCO (giả định, xem §9):** ≈105 TB bản gốc → ~346 TB đĩa thô; TCO 5 năm **161.000–256.000 USD**.

---

## 8. Những gì đang làm tốt — đừng đánh mất khi sửa

Red-team được yêu cầu tàn nhẫn nhưng công bằng, và nó ghi nhận những điểm sau. Tôi giữ nguyên vì chúng là **vốn liếng thật** của hồ sơ:

- **Độ chính xác di sản trên mặt bằng rõ rệt.** Can chi tính bằng thuật toán có test thật, không tra bảng. Mốc UNESCO 2010/2011 và QĐ 548 đúng. Dự án **tự bắt được** lỗi long sàng thuộc di tích khác. Red-team đi tìm sai sót lịch sử và chủ yếu tìm thấy bằng chứng của một quy trình thẩm định đang chạy thật.
- **Kỷ luật trích dẫn pháp lý cao bất thường** — ADR 0014 quy định chỉ trích dẫn văn bản đã xác minh, và nó được tuân thủ.
- **Kiến trúc OAIS 3 tầng, `PREMIS_EVENT` có `DEACCESSION`** nối đúng nghiệp vụ — hiếm gặp ở hồ sơ trong nước.
- **Bộ 5 mã khuyết giá trị có ngữ nghĩa phân biệt** (ADR 0005) — đúng thực tiễn bảo tàng, nơi "chưa nhập" khác "không áp dụng" khác "đã mất".
- **`docs/11:537` không tô hồng mức độ tự động hoá** — trung thực ở chỗ dễ nói quá nhất.
- **Tách `hasPreservationSurrogate` khỏi `derivedFrom`** (ADR 0008) — quyết định đúng, chỉ có *căn cứ* đã lạc hậu (§5).

Báo cáo 02 nói thẳng: nền móng OAIS **tốt hơn chính dự án tự nhận**. Vấn đề là hồ sơ đang **khoe sai chỗ** — khoe tính năng chưa có, trong khi những thứ thật sự hiếm thì trình bày nhạt.

---

## 9. Bản audit này chưa kiểm chứng được gì

Nói rõ để không ai dùng nhầm:

1. **Toàn bộ đơn giá là giả định.** Agent khảo giá phần cứng không trả kết quả. Mọi con số USD (TCO 161–256k, giá đĩa, điện, lương, tỷ giá) là **giả định kèm phép tính** để thay báo giá thật vào — không phải khảo giá. Báo cáo 05 mục 6.3 và 10.5 liệt kê đủ.
2. **Giá license sản phẩm thương mại** (Autodesk Flow, Preservica, Signiant/Aspera) chưa tra cứu — báo cáo 01 và 04 đánh dấu `(cần kiểm chứng)`.
3. **Ước tính ~7 TB/bản AIP** là mô hình dựng từ tham số vật lý, **không phải đo trên dữ liệu thật**. Dữ liệu thật chưa copy từ NAS về. Phải đo lại khi có dữ liệu.
4. **Trạng thái `KHR_gaussian_splatting` có thể đổi.** Kiểm lần cuối ngay trước ngày nộp.
5. **Trích dẫn `file:dòng` là ảnh chụp 12/08/2026.** Mã nguồn **đang được sửa song song** bởi một phiên làm việc khác (`AuthContext`, `permissions`, `UsersPage`, `UserDetailPage` đổi lúc 17:29–17:32 giữa lúc audit chạy). Các đề xuất P0 ở §6 đã được tôi kiểm lại sau đợt sửa đó; **các đề xuất P1/P2 thì chưa** — kiểm lại trước khi thi công.
6. **Chưa chạy thử app trong trình duyệt.** Toàn bộ kết luận rút từ mã nguồn, tài liệu, và `npm test`/`tsc`/`lint` (đều exit 0; 14/14 test đạt). Rủi ro vỡ demo ở §3.2 là **suy luận từ mã**, nên chạy thử thật một lần trước khi tin hoàn toàn.

---

## 10. Đề nghị quyết định

Ba việc cần anh chốt trước khi tôi (hoặc bất kỳ ai) đụng vào mã:

1. **Chọn mức gói P0** — tối thiểu 4,5–6, khuyến nghị 15–22, hay đầy đủ 31–47 người-ngày (§6). Tôi khuyến nghị mức giữa, và nếu quỹ thời gian cho phép thì thêm mục 9 (IIIF manifest) vì đó là ROI cao nhất toàn audit.
2. **Xử lý phiên làm việc song song.** Hiện có ít nhất hai luồng cùng sửa `app/`. Trước khi thi công theo audit này, nên thống nhất một luồng, nếu không các trích dẫn `file:dòng` sẽ tiếp tục trôi và hai luồng sẽ giẫm chân nhau ở đúng vùng phân quyền.
3. **Dự án chưa đặt dưới quản lý phiên bản.** Thư mục gốc không phải kho git. Với khối lượng sắp sửa và nhiều luồng cùng làm, đây là rủi ro độc lập với mọi thứ trong audit — `ARC-10` đã nêu, và tôi xếp nó là việc nên làm **trước tiên**.

---

*Sáu báo cáo con nằm cùng thư mục `docs/audit/`. Mỗi đề xuất trong đó đều có đủ: vì sao (kèm bằng chứng `file:dòng`), lợi ích lâu dài, tổ chức uy tín đang làm tương tự, chi phí người-ngày và USD, mức ưu tiên, phân kỳ, và rủi ro nếu không làm.*
