# Audit 01 — Đối chiếu với hệ quản lý asset của VFX studio

> Người thực hiện: subagent lăng kính DAM/VFX · Ngày: 12/08/2026 · Phạm vi: toàn bộ `app/src` (mô hình dữ liệu, lớp dịch vụ mock, các trang Dữ liệu số hóa / Chi tiết / Nhập dữ liệu), đối chiếu với `docs/07-mo-hinh-du-lieu.md`, `docs/06-dac-ta-api.md`, `docs/02-quy-trinh-bao-quan-sao-luu.md`, `docs/09-dac-ta-yeu-cau-srs.md` và 16 ADR. Hệ tham chiếu: Autodesk Flow Production Tracking (ShotGrid), ftrack Studio, Frame.io, Kitsu (CGWire), Perforce P4/Helix Core, OpenAssetIO (ASWF).

---

## 1. Tóm tắt điều hành

- **Phát hiện quan trọng nhất, và nó không phải là điều tôi được giao đi tìm: tài liệu ĐI TRƯỚC mã nguồn rất xa.** `docs/07-mo-hinh-du-lieu.md:139-165` đã đặc tả đầy đủ thực thể `ASSET_VERSION` (khóa chính, `version_no` tăng đơn điệu không tái sử dụng, `change_reason` bắt buộc khi `version_no > 1`, `superseded_at`), `07:445-462` đã quy định bất biến ở mức cột, `07:174-175` đã có `derivedFrom`, `07:476-478` đã có `checksum_sha256` + `fixity_status`. Đề bài giao cho tôi giả định "app KHÔNG có khái niệm version" — **giả định đó đúng với MÃ NGUỒN nhưng sai với TÀI LIỆU**. Vấn đề của dự án này không phải là thiếu tư duy thiết kế; là **khoảng cách đặc tả → hiện thực**.

- **Lỗ hổng chết người số 1 — phiên bản là một thứ được VẼ RA, không phải một thứ được GHI LẠI.** `Asset` (`app/src/services/types.ts:49-99`) không có trường version nào. Bảng "Phiên bản" trên màn chi tiết được sinh bởi một bộ số giả ngẫu nhiên gieo hạt từ chính mã bản ghi: `getVersionHistory` (`app/src/data/digitization.ts:206-237`) quyết định asset có 1, 2 hay 3 phiên bản bằng `rng() < 0.32` và `rng() < 0.18` (dòng 209-211). Không có bất kỳ hàm dịch vụ nào tạo ra phiên bản mới. Hệ quả trực tiếp và có thể quan sát được ngay trong demo: bấm **"Trả lại bổ sung"** → trạng thái đổi, **bảng phiên bản không đổi một dòng nào**, dù `docs/07:517-519` nói rõ mỗi lần số hóa lại BẮT BUỘC sinh `asset_version` mới.

- **Lỗ hổng chết người số 2 — checksum không phải là checksum.** `hexChecksum` (`app/src/data/digitization.ts:300-306`) sinh 64 ký tự hex ngẫu nhiên, **không băm bất cứ thứ gì**. Trạng thái toàn vẹn là một cú tung xúc xắc: `roll < 0.05` → `LECH_CHECKSUM` (`digitization.ts:339-342`). Nghĩa là ~5% số tệp trên toàn hệ thống hiển thị vĩnh viễn cảnh báo "⚠ Lệch checksum — cần kiểm tra lại" mà **không tồn tại bất kỳ nút nào để kiểm tra lại, sửa, hay bỏ qua**. Đây là loại chi tiết mà một giám khảo kỹ thuật bấm hai bản ghi là thấy.

- **Lỗ hổng chết người số 3 — toàn bộ ma trận phân quyền là mã chết.** `Capabilities` và bảng `CAPS` (`app/src/context/AuthContext.tsx:18-39`) định nghĩa 5 vai trò × 5 quyền (`read/write/approve/publish/admin`). Tôi đã grep toàn bộ `app/src`: **`can.approve`, `can.publish`, `can.write`, `can.admin` không được đọc ở BẤT KỲ đâu.** Không một lần. Menu lọc bằng so khớp chuỗi vai trò thô (`app/src/layout/navConfig.ts:19-20`), không qua `Capabilities`. Nguyên tắc bốn mắt của ADR-0011 được thực thi bằng **so sánh chuỗi tên hiển thị** trong component (`app/src/pages/AssetDetailPage.tsx:110`: `sel.owner === currentUser.name`) — trùng tên là thủng, đổi tên là thủng.

- **Cổng kiểm soát nằm sai lớp.** `assetService.advanceStatus` (`app/src/services/mock/assetService.ts:48-53`) không kiểm tra quyền, không kiểm tra tiền điều kiện — nó chỉ là `index + 1` trên một mảng (`app/src/data/pipeline.ts:46-52`). Mọi cổng (bốn mắt, xác nhận ý kiến Bộ VHTTDL) sống trong `AssetDetailPage.tsx:133-141`. Khi thay mock bằng API thật, các cổng này **không đi theo** — chúng ở lại trong React. Đây là khác biệt giữa một *chốt kiểm soát* và một *hình vẽ cái chốt*.

- **Không có đồ thị phụ thuộc, nên không trả lời được câu hỏi sống còn "xóa tệp này thì hỏng cái gì".** Quan hệ master → web → raw được sinh cứng 3 dòng cho mọi asset (`digitization.ts:326-356`), không phải cạnh dữ liệu. `derivedFrom` chỉ tồn tại dưới dạng **một câu văn xuôi** trong giao diện (`AssetDetailPage.tsx:592-594`). Trớ trêu: chỗ DUY NHẤT trong app có liên kết dẫn xuất thật, truy vết được, bấm được là **bảng đo đặc điểm vật lý** (`AssetDetailPage.tsx:370, 385-392` — số đo nào lấy từ bản scan nào). Tiền lệ đúng đã có sẵn trong nhà, chỉ chưa áp cho tệp.

- **Không có thực thể Công việc (Task) — và đây là khoảng trống thật, tài liệu cũng chưa quyết.** Toàn bộ khái niệm "ai làm gì" gói trong một trường `owner: string` (`types.ts:75`) — một cái tên, không phải khóa ngoại tới người dùng. Không hạn hoàn thành, không ước lượng, không hàng đợi theo người, không năng lực. Với 82 bia Tiến sĩ + Khuê Văn Các + splat giếng Thiên Quang + kho Hán Nôm trải nhiều năm, đây là thứ quyết định dự án chạy được hay không, chứ không phải màn hình đẹp.

- **Không có lớp ghi chú/đánh dấu trên media — nghiêm trọng đặc thù với di sản Hán Nôm.** Toàn bộ "phản hồi" là một ô textarea tự do (`AssetDetailPage.tsx:716-721`) ghi thẳng vào nhật ký. Một chuyên gia Hán Nôm cần chỉ vào **đúng chữ thứ 47 trên bản dập** và nói "chữ này là 銘 không phải 名". App hiện không có chỗ nào để làm việc đó. Cặp song thẩm còn đang được **bốc ngẫu nhiên** (`digitization.ts:441-446`).

- **Ứng dụng dưới chuẩn chính SRS của mình ở khâu lọc.** `docs/09-dac-ta-yeu-cau-srs.md:188` (CN-04.4) yêu cầu kết hợp ≥4 điều kiện lọc gồm khoảng niên đại, mức truy cập, cán bộ phụ trách. Mã hiện tại lọc đúng 3 trục + ô tìm kiếm (`app/src/pages/AssetsPage.tsx:46-56`). Không có bộ lọc lưu được, không có trường tùy biến, và bảng dữ liệu số hóa **không có cột chọn** nên không thao tác hàng loạt được (`app/src/components/AssetTable.tsx`) — dù mẫu chọn hàng loạt đã có sẵn trong `InventoryPage.tsx:263-274`.

- **Rò rỉ kiến trúc phá vỡ chính lời hứa "thay mock bằng API thật".** `types.ts:2-3` tuyên bố: *"Components only ever import these — never `src/data` directly"*. Thực tế **18 tệp** trong `pages/` và `components/` import trực tiếp từ `../data/` — bao gồm chính `AssetDetailPage.tsx:11-33` kéo thẳng `getVersionHistory`, `getFileList`, `getSignatureInfo` từ `data/digitization`. Khi có backend, những màn này không có đường nối: **không tồn tại phương thức dịch vụ nào để thay thế**.

- **Điểm cần ghi nhận công bằng:** hai trục `ObjectClass × DigitalForm` (ADR-0003), hệ mã 5 tầng (ADR-0004), tách `hasPreservationSurrogate` khỏi `derivedFrom` (ADR-0008), nhật ký append-only (ADR-0012), bộ 5 mã khuyết giá trị (ADR-0005), tìm kiếm bỏ dấu hai chiều (`app/src/utils/search.ts:11-18`) — đây là những quyết định **chín hơn mức trung bình của ngành DAM di sản**, và một số điểm (tách bản dẫn xuất bảo hiểm khỏi bản dẫn xuất kỹ thuật) là thứ ShotGrid/ftrack **không có** vì chúng không phục vụ bảo tồn dài hạn.

---

## 2. Bảng đối chiếu năng lực

| Năng lực | ShotGrid / ftrack / Frame.io làm gì | App VM hiện tại | Bằng chứng | Khoảng cách |
|---|---|---|---|---|
| **Version & bất biến** | `PublishedFile` với `version_number` tăng dần; publish là hành động sinh bản ghi mới, không ghi đè; "latest" là con trỏ truy vấn | Không có trường version trên domain model; bảng phiên bản sinh từ PRNG gieo hạt theo `asset.code`; không có hành động tạo phiên bản | `types.ts:49-99`; `digitization.ts:206-237`, đặc biệt `209-211`; `assetService.ts:21-38` | **Rất lớn.** Tài liệu đã đặc tả đủ (`07:139-165`); mã chưa có gì. Trạng thái tiến, phiên bản đứng yên |
| **Đồ thị phụ thuộc / lineage** | Upstream/downstream tường minh; xóa file cảnh báo tác động; ShotGrid có `PublishedFileDependency` | Quan hệ master/web/raw sinh cứng 3 dòng/asset; `derivedFrom` là văn xuôi trong UI | `digitization.ts:326-356`; `AssetDetailPage.tsx:592-594` | **Lớn.** Không truy vấn được downstream. Tiền lệ đúng đã có ở bảng đo (`AssetDetailPage.tsx:370`) |
| **Publish + path template** | Đường dẫn do hệ thống sinh từ template (`tk-core` schema); người dùng không bao giờ gõ đường dẫn | Tên tệp là nhãn hiển thị ghép chuỗi, không phải đường dẫn thật; không có `storage_path` trên `Asset` | `digitization.ts:346`; `assetCode.ts:20-23`; `types.ts:49-99` | **Lớn.** Tài liệu cũng để `storage_path` là varchar tự do (`07:474-475`) — chưa ai quyết template |
| **Task & phân công** | Task là xương sống: assignee, status riêng, bid vs actual, start/due, biểu đồ năng lực | Một trường `owner: string` (tên hiển thị). Không hạn, không ước lượng, không hàng đợi | `types.ts:75`; `AssetDetailPage.tsx:110` | **Rất lớn.** Tài liệu cũng chưa có (`07:440` chỉ có `owner_user_id`) |
| **Máy trạng thái có ràng buộc** | Chuyển trạng thái có điều kiện + quyền; không nhảy cóc | `nextStatus` = `index + 1` trên mảng; `advanceStatus` không kiểm tra quyền/tiền điều kiện; cổng nằm trong component | `pipeline.ts:46-52`; `assetService.ts:48-53`; `AssetDetailPage.tsx:133-141` | **Lớn.** Chuỗi trạng thái đúng và có tài liệu (`07:433`), nhưng thực thi sai lớp |
| **Review / ghi chú trên media** | Frame.io: comment gắn timecode, vẽ đè khung hình, gắn vào đúng version; ftrack có review session | Một ô textarea tự do → nhật ký. Không tọa độ, không luồng, không gắn version | `AssetDetailPage.tsx:716-721`; `auditService.ts:36-38` | **Rất lớn** với ngữ cảnh Hán Nôm. Tài liệu cũng chưa có |
| **Proxy / chuyển mã tự động** | Sinh proxy/thumbnail tự động khi ingest; có trạng thái job, làm lại được | Luôn hiển thị đúng 3 dòng master/web/raw dù chưa sinh gì; không có job, không có "tạo lại" | `digitization.ts:326-334`; `rawSizeLabel` trả `KHONG_AP_DUNG` cho tài liệu (`317-323`) | **Trung bình-lớn.** Tài liệu ĐÃ đặc tả (`02:79,92,113`; `07:470` có cả `THUMB`) — mã chỉ render 3/4 loại (`digitization.ts:289`) |
| **Checksum / toàn vẹn** | Hash khi ingest, xác minh định kỳ, cảnh báo có hành động khắc phục | Hex ngẫu nhiên, không băm gì; fixity là xúc xắc; không có hành động khắc phục | `digitization.ts:300-306`, `339-342`; `UploadPage.tsx:21-28, 72` | **Rất lớn.** Tài liệu rất chắc (`02:124-159`; `07:476-478`) — mã là sân khấu |
| **API-first + webhook** | REST/GraphQL đầy đủ + event daemon; tích hợp DCC (Maya/Nuke/Houdini) | Không có lời gọi mạng nào trong toàn app; 6 dịch vụ in-memory | `services/index.ts:10-17`; grep `fetch(`/`axios`/`WebSocket` = 0 kết quả | **Chấp nhận được cho demo.** Tài liệu API rất đầy đủ (`06:11-16`, webhook `06:654-707`) |
| **Phân quyền theo phạm vi/trường** | Theo project, theo step, theo trường; permission group | Bảng `CAPS` tồn tại nhưng **không được đọc ở đâu cả**; menu lọc bằng chuỗi vai trò | `AuthContext.tsx:18-39` + grep `can.*` = 0 kết quả; `navConfig.ts:19-20` | **Rất lớn.** Tài liệu có RBAC+ABAC theo bộ sưu tập (`07:553-559`) — mã không có |
| **Tìm kiếm / bộ lọc lưu / trường tùy biến** | Bộ lọc tổ hợp, lưu và chia sẻ được; studio tự thêm trường/thực thể | 3 trục chip + ô tìm kiếm; không lưu bộ lọc; trường cố định theo `digitalForm` | `AssetsPage.tsx:46-56`; `search.ts:21-34` | **Trung bình.** Dưới chuẩn chính SRS của mình (`09:188` đòi ≥4 điều kiện) |
| **Thao tác hàng loạt / nhập CSV-Excel** | Sửa hàng loạt trên lưới, nhập có validate, xem trước lỗi | Nhập lô Excel có xem trước tốt; **nhưng bảng asset không có cột chọn** → không sửa hàng loạt | `UploadPage.tsx:279-337`; `AssetTable.tsx` (không có checkbox); mẫu đã có ở `InventoryPage.tsx:263-274` | **Trung bình.** Nhập lô đạt; sửa hàng loạt thiếu |
| **Tầng lưu trữ / "tệp thật nằm đâu"** | Local cache / nearline / archive, có thao tác khôi phục, biết độ trễ | `storageTier` gán theo quy tắc cứng; không có đường dẫn thật, không có hành động khôi phục từ tầng lạnh | `digitization.ts:330-334`; `types.ts:49-99` (không có `storagePath`) | **Trung bình-lớn.** Mô hình 3 tầng có tài liệu tốt (`02:55-59`) — mã chỉ có nhãn |

---

## 3. Phân tích chi tiết từng khoảng trống

### 3.1. Phiên bản: bảng đang hiển thị một câu chuyện, không phải một sự thật

`app/src/data/digitization.ts:9-16` mở đầu bằng một lời thú nhận rất trung thực, và tôi muốn ghi nhận sự trung thực đó trước khi phê bình: mọi trường "làm giàu" của màn chi tiết được **dẫn xuất tất định** từ nội dung bản ghi cộng một RNG gieo hạt cố định, để tránh phải thêm hàng chục cột vào 150 bản ghi mock. Với mục tiêu *dựng nhanh một demo nhìn đầy đặn*, đây là một đánh đổi hợp lý và được ghi chú đàng hoàng.

Vấn đề là đánh đổi đó **đã vượt quá vùng an toàn của nó** ở đúng ba chỗ.

Thứ nhất, số lượng phiên bản là ngẫu nhiên (`digitization.ts:209-211`):

```
const rollsExtra = !forcedSingle && rng() < 0.32;
const rollsThird = rollsExtra && rng() < 0.18;
```

Nghĩa là khoảng 32% bản ghi có 2 phiên bản, ~6% có 3, còn lại có 1 — theo xác suất, không theo lịch sử. Một bản ghi bia Tiến sĩ quét lại ba lần vì lỗi lưới sẽ hiển thị 1 phiên bản nếu xúc xắc nói thế.

Thứ hai, và nghiêm trọng hơn, `forcedSingle` (`digitization.ts:208`) ép **đúng 1 phiên bản** cho bản ghi ở trạng thái `'Cần số hóa lại'`. Điều này ngược hoàn toàn với thực tế: bản ghi đang phải số hóa lại chính là bản ghi có nhiều khả năng đã có nhiều phiên bản nhất. Một giám khảo lọc theo trạng thái "Cần số hóa lại" rồi mở vài bản ghi sẽ thấy 100% trong số đó có đúng một phiên bản — một quy luật không thể là ngẫu nhiên tự nhiên.

Thứ ba, và đây là chỗ demo có thể vỡ ngay trên màn hình: **hành động của người dùng không sinh phiên bản**. `assetService.requestRevision` (`app/src/services/mock/assetService.ts:57-60`) chỉ đưa trạng thái về `'Đang xử lý'`:

```
requestRevision(id, reason) {
  if (!reason.trim()) throw new Error('Lý do trả lại bổ sung là bắt buộc.');
  return updateAsset(id, (a) => ({ ...a, status: 'Đang xử lý' }));
},
```

`reason` được kiểm tra rỗng rồi **bị vứt đi** — không lưu vào đâu trong asset. Nó chỉ tồn tại trong nhật ký nhờ component gọi thêm `logAction` (`AssetDetailPage.tsx:158`). Trong khi đó `docs/07-mo-hinh-du-lieu.md:445-462` quy định `change_reason` là cột **bắt buộc** của `asset_version` khi `version_no > 1`. Chỗ để lưu đã được thiết kế; đường dẫn tới nó chưa được nối.

Kịch bản demo hỏng, rất dễ xảy ra: giám khảo mở một bản ghi có 2 phiên bản → bấm "Trả lại bổ sung" → nhập lý do → xác nhận → trạng thái đổi sang "Đang xử lý", **bảng Phiên bản vẫn y nguyên 2 dòng, thời điểm không đổi, lý do vừa nhập không xuất hiện ở đâu ngoài nhật ký**. Câu hỏi tiếp theo của giám khảo gần như chắc chắn là "vậy phiên bản mới nằm ở đâu?".

**Đối chiếu ngành:** trong ShotGrid, publish là hành động **sinh** `PublishedFile` với `version_number`, và nguyên tắc bất biến được giữ bằng cách không bao giờ ghi đè. `docs/07:517-519` đã viện dẫn đúng nguyên tắc này qua OAIS/ISO 14721. Khoảng cách ở đây thuần túy là hiện thực, không phải nhận thức.

### 3.2. Toàn vẹn dữ liệu: con số 64 ký tự không phải là bằng chứng

Có hai cơ chế checksum riêng biệt trong app, và cả hai đều không băm nội dung tệp.

Ở màn chi tiết, `hexChecksum` (`app/src/data/digitization.ts:300-306`) sinh chuỗi hex bằng cách rút ngẫu nhiên 64 lần từ bảng `'0123456789abcdef'`. Không có phép băm nào. Chuỗi này tất định theo `asset.code` nên nó *ổn định giữa các lần tải*, tạo cảm giác thật, nhưng nó không liên quan gì tới nội dung.

Ở màn nhập dữ liệu, `UploadPage.tsx:21-28` dùng **Web Crypto thật** — `crypto.subtle.digest('SHA-256', ...)` — nhưng băm chuỗi `${u.id}:${u.name}:${u.size}` (`UploadPage.tsx:72`), không phải byte của tệp. Phần chú thích ở dòng 21-22 nói thẳng điều này. Lại một lần nữa: trung thực trong mã, nhưng người xem giao diện không đọc mã.

Nghiêm trọng nhất là trạng thái toàn vẹn (`digitization.ts:337-343`):

```
const roll = rng();
let fixityStatus: FixityStatus = 'DA_XAC_MINH';
if (roll < 0.05) fixityStatus = 'LECH_CHECKSUM';
else if (roll < 0.16) fixityStatus = 'CHUA_KIEM_TRA';
```

Khoảng 5% số dòng tệp hiển thị **"⚠ Lệch checksum — cần kiểm tra lại"** (`digitization.ts:277`). Với 3 dòng tệp mỗi asset và khoảng 150 asset, đó là hơn 20 cảnh báo lệch checksum thường trực trên toàn hệ thống. Và trong `AssetDetailPage.tsx:600-636`, bảng Tệp tin **chỉ có 7 cột hiển thị, không có cột hành động**: không "Kiểm tra lại", không "Khôi phục từ bản sao", không "Ghi nhận đã xử lý".

Đây là kiểu lỗi tệ hơn cả việc không có tính năng: hệ thống **báo động rồi bỏ mặc**. `docs/02-quy-trinh-bao-quan-sao-luu.md:124-159` đã đặc tả quy trình kiểm tra fixity định kỳ có tần suất theo nhóm dữ liệu, và `02:299-302` đặt chỉ tiêu ≥99,5% checksum hợp lệ. Với tỷ lệ mô phỏng 5% lệch, app đang **tự trưng ra bằng chứng nó trượt chính KPI của mình** — 95% so với chỉ tiêu 99,5%. Nếu một giám khảo đối chiếu hai tài liệu này, đó là một câu hỏi rất khó đỡ.

### 3.3. Đồ thị phụ thuộc: câu hỏi "xóa cái này thì hỏng cái gì" chưa có đường trả lời

`getFileList` (`digitization.ts:326-356`) sinh **cố định 3 vai trò** cho mọi asset:

```
{ role: 'master', ..., tier: archived ? 'COLD' : 'AIP' },
{ role: 'web',    ..., tier: 'HOT' },
{ role: 'raw',    ..., tier: 'COLD' },
```

Đây là template hiển thị, không phải cạnh dữ liệu. Không có bảng quan hệ, nên không có truy vấn ngược. Hai hệ quả cụ thể:

Một là **không phát hiện được chỗ thiếu**: nếu một bản splat thật sự chưa có bản đám mây điểm đi kèm, hệ thống vẫn vẽ ra đủ 3 dòng. Trong khi đó `digitization.ts:390` có một đoạn ghi chú xuất sắc về lý do bản point cloud là dữ liệu DUY NHẤT phục hồi được nội dung nếu công cụ đọc `.splat` ngừng hỗ trợ — một nhận định bảo tồn rất sắc — nhưng **không có cơ chế nào kiểm tra bản đó có tồn tại thật hay không**.

Hai là **không đánh giá được tác động xóa**. `AssetDetailPage.tsx:592-594` nói bản tối ưu web "có thể xoá và tái tạo tự do" — đúng về nguyên tắc, nhưng đó là một câu chữ tĩnh, không phải kết luận rút từ đồ thị. Nếu ngày mai có một bản ghi thứ ba dẫn xuất từ bản web đó, câu văn kia vẫn hiển thị y nguyên.

Điều đáng nói là **mã nguồn này đã biết cách làm đúng, ở chỗ khác**. Bảng đo đặc điểm vật lý lưu `derivedFrom` là mã asset thật, và giao diện biến nó thành liên kết bấm được (`AssetDetailPage.tsx:370, 385-392`):

```
const src = m.derivedFrom ? findAssetByCode(m.derivedFrom) : undefined;
...
<a onClick={() => navigate(`/assets/${src.id}`)}>{m.derivedFrom}</a>
```

Một số đo "cao 1,42 m" biết nó đến từ bản scan nào và cho bấm sang đó. Đây chính xác là mô hình lineage cần áp cho tệp. Tiền lệ đã có trong nhà; chỉ cần mở rộng phạm vi.

`docs/07:174-175` đã liệt `derivedFrom` trong `asset_relation.relation_type`, và ADR-0008 đã làm việc khó nhất là **tách `hasPreservationSurrogate` khỏi `derivedFrom`** vì hai loại có nghĩa vụ lưu trữ khác nhau. Đó là một phân biệt tinh tế mà ShotGrid và ftrack không có, vì chúng không phục vụ bảo tồn vĩnh viễn. Tài liệu đã thắng phần khó; mã chưa thu hoạch.

### 3.4. Máy trạng thái: đúng hình dạng, sai vị trí thực thi

Chuỗi 9 trạng thái tuần tự + 2 ngoài luồng (`app/src/data/pipeline.ts:13-23`, `types.ts:12-23`) là một mô hình quy trình **tốt** — nó phản ánh thực tế cơ quan nhà nước với bước thẩm định nội dung tách khỏi phê duyệt, và ADR-0011 tách quyền Phê duyệt khỏi quyền Xuất bản. Về mặt thiết kế, đây không phải dropdown tự do; nó có chuỗi.

Vấn đề nằm ở nơi ràng buộc được kiểm tra. `nextStatus` (`pipeline.ts:46-52`) là phép cộng chỉ số:

```
const idx = PIPELINE_SEQUENCE.indexOf(current);
if (idx === -1 || idx === PIPELINE_SEQUENCE.length - 1) return null;
return PIPELINE_SEQUENCE[idx + 1];
```

Và `advanceStatus` (`assetService.ts:48-53`) gọi thẳng nó, **không tham số người dùng, không kiểm tra quyền, không kiểm tra tiền điều kiện**. Toàn bộ ràng buộc thực chất nằm trong `AssetDetailPage.tsx:133-141`:

```
function handlePrimaryAction() {
  if (approvalGateBlocked || !actionLabel) return;
  if (isPublishStep(sel.status)) { setPublishGateOpen(true); return; }
  assetService.advanceStatus(sel.id);
  ...
}
```

Ba điều này đều là kiểm soát nghiệp vụ thật: cổng bốn mắt, cổng xin ý kiến Bộ VHTTDL theo NĐ 308/2025 Điều 87, và điều kiện có hành động tiến. Cả ba đều sống trong tầng giao diện. Bất kỳ đường gọi nào khác tới `assetService.advanceStatus(id)` — một nút ở trang khác, một thao tác hàng loạt tương lai, một lần gọi API — đều **đi vòng qua toàn bộ**.

Cổng bốn mắt còn có một lỗ hổng riêng: nó so sánh **chuỗi tên hiển thị** (`AssetDetailPage.tsx:110`):

```
const approvalGateBlocked = isApprovalStep(sel.status) && sel.owner === currentUser.name;
```

`Asset.owner` là `string` (`types.ts:75`), không phải khóa ngoại. Hai cán bộ trùng tên → một người bị chặn oan, hoặc tệ hơn, một người lọt qua. Một lần đổi tên hiển thị trong `data/users.ts` → toàn bộ cổng bốn mắt của người đó im lặng ngừng hoạt động. ADR-0011 là một quyết định quản trị đúng đắn; hiện thực của nó đang treo trên một phép so sánh chuỗi.

Và như đã nêu ở phần tóm tắt: `Capabilities` (`AuthContext.tsx:18-39`) — đúng 5 quyền, đúng 5 vai trò, chú thích cẩn thận, khớp ma trận phân quyền ở màn Chi tiết người dùng — **chưa từng được đọc một lần nào** trong toàn bộ mã nguồn. Vai trò `'Phê duyệt'` được cấp `approve: true, publish: true` (`AuthContext.tsx:35`), nhưng không có dòng mã nào hỏi tới nó trước khi cho phép tiến trạng thái. Menu ẩn/hiện dùng so khớp chuỗi vai trò trực tiếp (`navConfig.ts:19-20`), bỏ qua `Capabilities` hoàn toàn.

### 3.5. Task và phân công: khoảng trống thật, chưa ai quyết

Đây là mục duy nhất trong bản audit này mà **cả tài liệu lẫn mã đều trống** — subagent rà `docs/` xác nhận chỉ có `owner_user_id` trên `asset` (`07:440`), không có thực thể Task, không có hạn, không có năng lực.

Trong ShotGrid và ftrack, Task là xương sống chứ không phải phụ kiện: mỗi asset/shot có nhiều Task (model, texture, rig...), mỗi Task có người nhận, trạng thái riêng biệt với trạng thái asset, ước lượng (bid) đối chiếu thực tế (actual), ngày bắt đầu/hạn. Từ đó mới ra được biểu đồ năng lực, cảnh báo trễ, và câu trả lời cho "tuần này ai đang quá tải".

Ngữ cảnh Văn Miếu làm khoảng trống này đắt hơn bình thường. 82 rùa đội bia không phải 82 thao tác giống nhau: mỗi bia cần quét, làm sạch lưới, dựng texture, phiên âm Hán Nôm, dịch nghĩa, thẩm định song thẩm, duyệt, xuất bản — bởi những người khác nhau, năng lực khác nhau, và bước Hán Nôm thì phụ thuộc số lượng chuyên gia rất hạn chế. Trạng thái hiện tại của app cho biết bản ghi đang ở bước nào, nhưng **không cho biết ai đang cầm nó, từ bao giờ, và còn bao lâu**. Với dự án kéo dài nhiều năm, đó là thứ quyết định hoàn thành đúng hạn hay không.

Một tín hiệu cụ thể của khoảng trống này: `getHanNomReviewPair` (`digitization.ts:441-446`) **bốc ngẫu nhiên** người thẩm định từ một danh sách 5 tên, chỉ đảm bảo khác `asset.owner`. Yêu cầu song thẩm là đúng và quan trọng; nhưng việc phân công đang là hiệu ứng hiển thị chứ không phải một quyết định được ghi lại và chịu trách nhiệm.

### 3.6. Review và ghi chú: chỗ đau nhất về mặt chuyên môn di sản

Toàn bộ khả năng phản hồi của app là các ô textarea trong modal — trả lại bổ sung (`AssetDetailPage.tsx:716-721`), gỡ xuất bản (`739-744`). Nội dung đi vào `auditService.record` (`auditService.ts:36-38`) và trở thành một dòng nhật ký phẳng. Không tọa độ, không timecode, không luồng trả lời, không trạng thái đã-xử-lý, và **không gắn vào phiên bản nào**.

Frame.io tồn tại được như một sản phẩm riêng biệt chính vì giải đúng bài toán này: bình luận neo vào khung hình cụ thể và vẽ đè lên hình. ftrack có review session tương tự.

Với Văn Miếu, nhu cầu này **không phải copy ngành VFX** — nó là nhu cầu bản địa và cấp thiết hơn:

- Một chuyên gia Hán Nôm đọc bản dập bia cần chỉ vào **đúng một chữ** và ghi "tự dạng này là 銘, bản phiên âm đang chép nhầm thành 名". Ghi chú "có lỗi phiên âm ở dòng 12" trong một ô text tự do là thứ không truy vết được và không kiểm chứng lại được sau 5 năm.
- Một cán bộ bảo quản xem mô hình 3D rùa đội bia cần đánh dấu **vùng chân đế bị vỡ lưới** để yêu cầu quét lại đúng chỗ đó — chứ không phải trả cả bản ghi về "Đang xử lý" với lời nhắn chung chung.
- Song thẩm Hán Nôm mà `digitization.ts:441-446` đang mô phỏng chỉ có ý nghĩa **nếu người thẩm định để lại dấu vết ở đúng vị trí mình phản đối**. Không có lớp annotation, "song thẩm" chỉ là hai cái tên hiển thị cạnh nhau.

Đây cũng là hạng mục có **tỷ lệ ấn tượng-trên-công-sức cao nhất** cho hồ sơ thầu: một màn hình cho phép bấm lên ảnh bản dập, thả một ghim, gõ ghi chú, và thấy ghim đó gắn vào phiên bản v2 — là thứ không hệ DAM di sản nội địa nào demo được, và nó nói thẳng với hội đồng rằng đơn vị hiểu công việc chuyên môn của Trung tâm chứ không chỉ hiểu phần mềm.

### 3.7. Bản dẫn xuất: khẳng định có, cơ chế không

`docs/02-quy-trinh-bao-quan-sao-luu.md:79,92,113` đặc tả rõ: sau khi QC đạt, **hệ thống sinh bản dẫn xuất — web, preview, thumbnail**. `docs/07:470` định nghĩa `asset_file.kind` gồm 4 giá trị `MASTER|WEB|RAW|THUMB`.

Mã nguồn lệch ở hai điểm. Thứ nhất, `AssetFileRow.role` (`digitization.ts:289`) chỉ có 3 giá trị `'master' | 'web' | 'raw'` — **thiếu `thumb`**, dù `derivedFileLabel` trong `assetCode.ts:21` đã chấp nhận `'thumb'` trong kiểu tham số. Một mâu thuẫn nhỏ nhưng cho thấy hai tệp được viết ở hai thời điểm không đồng bộ với tài liệu.

Thứ hai, và quan trọng hơn: **không có gì sinh ra chúng**. Không có thực thể job, không có trạng thái "đang chuyển mã", không có nút "tạo lại bản web", không có bản ghi lỗi khi chuyển mã thất bại. `rawSizeLabel` (`digitization.ts:317-323`) trả `KHONG_AP_DUNG` cho tài liệu và ảnh, nên bảng vẫn hiện dòng "Dữ liệu thô" với ô dung lượng trống — một dòng tồn tại chỉ để giữ bố cục.

Với dữ liệu thật sắp về từ NAS — 82 mesh 3D, splat, point cloud, ảnh TIFF 600dpi — đây là hạng mục **bắt buộc phải có backend thật**, và cũng là hạng mục sinh ra phần lớn chi phí hạ tầng. Không thể mô phỏng thêm.

### 3.8. Tìm kiếm, lọc, thao tác hàng loạt: dưới chuẩn chính mình đặt ra

`docs/09-dac-ta-yeu-cau-srs.md:188` (CN-04.4) yêu cầu kết hợp **≥4 điều kiện lọc**, liệt kê cụ thể: loại đối tượng, dạng dữ liệu, trạng thái, bộ sưu tập, **khoảng niên đại, mức truy cập, cán bộ phụ trách**.

`AssetsPage.tsx:46-56` hiện thực đúng 3 trục + ô tìm kiếm toàn văn:

```
(objectClassFilter === 'Tất cả' || a.objectClass === objectClassFilter) &&
(digitalFormFilter === 'Tất cả' || ... ) &&
(!statusFilter || a.status === statusFilter) &&
matchesAssetQuery(a, query)
```

Thiếu khoảng niên đại (dù `Asset.eraEdtf` đã có sẵn ở `types.ts:70` — chuẩn EDTF, đúng thứ cần để lọc khoảng), thiếu mức truy cập, thiếu cán bộ phụ trách, thiếu bộ sưu tập như một trục lọc độc lập.

Cần ghi nhận: `matchesAssetQuery` (`search.ts:21-34`) **làm tốt hơn kỳ vọng** ở phần tìm kiếm văn bản — bỏ dấu hai chiều, chuẩn hóa `đ→d`, chấp nhận mã đầy đủ lẫn rút gọn không phân biệt `-`/`.`. Đây là chất lượng cao và rất đúng ngữ cảnh tiếng Việt.

Ba thứ còn thiếu quanh đó:

- **Bộ lọc lưu được.** Trạng thái lọc nằm trong `AppUiContext`, không đặt tên được, không lưu, không chia sẻ được. Trong ShotGrid/ftrack đây là công cụ hằng ngày: "bia Tiến sĩ chưa phiên âm xong", "mọi bản ghi Hán Nôm đang chờ thẩm định" — lưu một lần, dùng mỗi sáng.
- **Trường tùy biến.** Trường mở rộng cố định theo `digitalForm` trong mã (`docs/07:35,423`), quản trị viên không thêm được. Với di sản, nhu cầu thêm trường phát sinh liên tục theo từng đợt nghiên cứu.
- **Thao tác hàng loạt.** `AssetTable.tsx` không có cột chọn — chỉ có hàng bấm để điều hướng. Không gán hàng loạt, không đổi trạng thái hàng loạt, không gắn thẻ hàng loạt. Đáng chú ý: **mẫu chọn hàng loạt đã tồn tại và chạy tốt** ở `InventoryPage.tsx:263-274` (`toggleSelectRow`, `toggleSelectAll`, `bulkMarkVisited`), kể cả hoàn tác hai tầng theo ADR-0010. Chỉ là chưa mang sang bảng dữ liệu số hóa.

### 3.9. Tầng lưu trữ: nhãn đúng, không có địa chỉ

Mô hình 3 tầng HOT/AIP/COLD (`digitization.ts:280-286`) khớp `docs/02:55-59` và bám khung OAIS. Về mặt khái niệm đây là điểm mạnh — nhiều DAM thương mại không phân biệt nổi bản làm việc với bản lưu trữ dài hạn.

Nhưng gán tầng là quy tắc cứng (`digitization.ts:330-334`): master → `AIP`, hoặc `COLD` nếu đã lưu trữ; web → luôn `HOT`; raw → luôn `COLD`. Và **không có đường dẫn thật ở đâu cả**. `Asset` không có trường `storagePath` (`types.ts:49-99`). Tên tệp hiển thị là nhãn ghép chuỗi (`digitization.ts:346`):

```
name: derivedFileLabel(asset.code, r.role) + '.' + r.ext,
```

Nên câu hỏi vận hành cơ bản nhất — *"tệp gốc của bia số 14 thật sự đang nằm ở đâu, trên NAS nào, thư mục nào, băng LTO số mấy"* — app không trả lời được. Không có hành động khôi phục từ tầng lạnh, không có ước lượng độ trễ, không có trạng thái "đang lấy về".

Tài liệu cũng chưa chốt phần này: `07:474-475` để `storage_path` là `varchar(1000)` tự do, không có template. Đây là điểm **nên quyết sớm**, vì mọi thứ khác (dẫn xuất, kiểm tra fixity, sao lưu) đều treo vào nó, và sửa quy ước đường dẫn sau khi đã có 50 TB dữ liệu là việc rất đắt.

### 3.10. Rò rỉ kiến trúc: lời hứa "thay mock bằng API thật" đang có lỗ

`app/src/services/types.ts:2-3` phát biểu quy tắc kiến trúc trung tâm của dự án:

> *"Components only ever import these — never `src/data` directly."*

`services/index.ts:8-9` nhắc lại: điểm vào duy nhất, để sau này thay bất kỳ hiện thực `mock/*` nào bằng bản gọi API mà không phải đụng nơi gọi.

Đây là quy tắc đúng, và ADR-0002 dựng cả kiến trúc quanh nó. Nhưng grep cho thấy **18 tệp** trong `pages/` và `components/` import trực tiếp từ `../data/`. Trong đó nghiêm trọng nhất là `AssetDetailPage.tsx:11-33` — màn hình quan trọng nhất của sản phẩm — kéo thẳng 15 hàm từ `data/digitization`:

```
import {
  ACCESS_LEVEL_LABELS, canDownloadMaster, compareVersions, containsPersonalData,
  FIXITY_LABELS, getAccessLevel, getDepictionGroup, getFileList, getHanNomReviewPair,
  getMinistryApproval, getRepresentationGroup, getRightsStatement, getSignatureInfo,
  getStructuralBreadcrumb, getVersionHistory, STORAGE_TIER_LABELS,
} from '../data/digitization';
```

Hệ quả rất cụ thể và rất đắt: khi backend thật xuất hiện, phiên bản/tệp/checksum/chữ ký số **không có chỗ để thay**. `AssetService` (`assetService.ts:21-38`) không hề khai báo `getVersions`, `getFiles`, `verifyFixity`. Người lập trình sẽ phải sửa trực tiếp trong component, đúng thứ mà ADR-0002 dựng lên để tránh.

Cần phân biệt: một phần trong 18 tệp kia import các hằng số hiển thị thuần túy (`data/taxonomy` — nhãn tiếng Việt, `data/missingValues` — mã khuyết giá trị). Đó là tra cứu tĩnh, chấp nhận được, và có thể coi là ngoại lệ hợp lý. Vấn đề nằm ở nhóm còn lại: `data/digitization` chứa **logic nghiệp vụ và dữ liệu thực thể** (phiên bản, tệp, quyền truy cập, chữ ký số) — thứ chắc chắn sẽ đến từ API. Nhóm này phải đi qua lớp dịch vụ.

Sửa việc này **rẻ, nhanh, và làm được ngay trong bản demo**: bọc các hàm hiện có vào `AssetService` mà không đổi hành vi. Nó đồng thời tạo sẵn chỗ neo cho mọi đề xuất khác trong báo cáo này.

---

## 4. Danh sách đề xuất nâng cấp

> **Giả định quy đổi chi phí** (áp dụng cho toàn bộ mục 4, ghi rõ để người đọc thay số theo đơn giá thực tế):
> - 1 người-ngày = 1 lập trình viên trung cấp làm việc 8 giờ.
> - Đơn giá tham chiếu ≈ 2.400.000 VND/người-ngày ≈ **92 USD/người-ngày** ở tỷ giá 26.000 VND/USD *(cần kiểm chứng theo bảng giá thực tế của đơn vị và tỷ giá tại thời điểm ký hợp đồng)*.
> - Chi phí hạ tầng tính theo năm, cho phương án **tự vận hành (self-host)** đúng ràng buộc dự án, không dùng dịch vụ đám mây nước ngoài.
> - Nhãn **[Mock]** = làm được ngay trong bản demo thầu, không cần backend. **[Backend]** = bắt buộc có backend thật.

---

### DAM-01 — Đưa phiên bản vào mô hình dữ liệu và lớp dịch vụ

**Tên đề xuất:** Thực thể `AssetVersion` thật, thay cho bảng phiên bản sinh từ PRNG. **[Mock cho phần khung — Backend cho phần lưu trữ]**

**Vì sao.** `Asset` không có trường phiên bản nào (`app/src/services/types.ts:49-99`). Bảng hiển thị được sinh ngẫu nhiên: số phiên bản do `rng() < 0.32` / `rng() < 0.18` quyết định (`app/src/data/digitization.ts:209-211`), và bản ghi ở trạng thái `'Cần số hóa lại'` bị ép chỉ có 1 phiên bản (`digitization.ts:208`) — ngược với thực tế. `assetService.requestRevision` (`app/src/services/mock/assetService.ts:57-60`) nhận `reason`, kiểm tra rỗng, rồi **vứt đi**, dù `docs/07-mo-hinh-du-lieu.md:445-462` quy định `change_reason` là cột bắt buộc của `asset_version`. Toàn bộ đặc tả đã có ở `docs/07:139-165`; chỉ thiếu hiện thực.

**Lợi ích lâu dài.** Sau 3–10 năm, đây là ranh giới giữa một kho dữ liệu **kiểm toán được** và một kho **chỉ biết hiện trạng**. Khi một bia Tiến sĩ được quét lại năm 2031 vì công nghệ tốt hơn, hệ thống phải trả lời được: bản 2026 khác bản 2031 ở đâu, ai quyết định thay, vì lý do gì, và bản 2026 có còn nguyên vẹn không. Đây cũng là điều kiện cần để đối chiếu với ấn phẩm nghiên cứu đã trích dẫn bản cũ — nếu bản cũ bị ghi đè, mọi trích dẫn học thuật trỏ vào dữ liệu này trở thành trích dẫn treo. Với UNESCO Memory of the World, khả năng chứng minh chuỗi phiên bản liên tục là yêu cầu thực chất, không phải hình thức.

**Ai đang làm (uy tín).** Autodesk Flow Production Tracking (ShotGrid) dựng toàn bộ pipeline quanh `PublishedFile` có `version_number`, publish là hành động **sinh bản ghi mới** chứ không ghi đè. ftrack Studio ($25/người/tháng trả theo năm, $30 trả theo tháng) có `AssetVersion` là thực thể hạng nhất. Trong khối bảo tồn di sản, Archivematica (Artefactual Systems, mã nguồn mở AGPL) hiện thực đúng nguyên tắc OAIS mà `docs/07:517-519` đang viện dẫn *(mức độ chi tiết cần kiểm chứng thêm nếu chọn tích hợp)*.

**Cost.**
- Bước 1 — thêm `AssetVersionInfo` vào `services/types.ts`, mở rộng `AssetService` với `listVersions/createVersion`, nối `requestRevision` và `markNeedsRedigitization` để sinh phiên bản, lưu trong `Store`: **4–6 người-ngày** (~370–550 USD). Làm được hoàn toàn trong mock.
- Bước 2 — bảng `asset_version` trên Postgres, ràng buộc bất biến (trigger chặn UPDATE sau khi chốt), API CRUD: **8–12 người-ngày** (~740–1.100 USD).
- Hạ tầng: **0 USD/năm** thêm (dùng chung Postgres đã có trong kiến trúc self-host).

**Ưu tiên.** **P0** · **[Demo thầu]** cho bước 1 — đây là lỗ hổng dễ bị phát hiện nhất trong buổi chấm. **[6 tháng]** cho bước 2.

**Rủi ro nếu KHÔNG làm.** Ngắn hạn: giám khảo bấm "Trả lại bổ sung" và thấy bảng phiên bản bất động — mất điểm ở đúng hạng mục app đang tự quảng cáo là thế mạnh. Dài hạn: không có bất biến thật thì mọi cam kết bảo tồn trong `docs/02` là lời nói suông, và một lần ghi đè nhầm là mất vĩnh viễn bản gốc số hóa của hiện vật quốc gia — thiệt hại không thể khôi phục bằng tiền.

---

### DAM-02 — Checksum thật và hàng đợi kiểm tra toàn vẹn có hành động

**Tên đề xuất:** Băm nội dung tệp thật khi nhập, lịch kiểm tra fixity, và **nút xử lý** cho mọi cảnh báo. **[Mock cho phần hành động — Backend cho phần băm thật]**

**Vì sao.** `hexChecksum` (`app/src/data/digitization.ts:300-306`) sinh 64 ký tự hex ngẫu nhiên, không băm gì. `UploadPage.tsx:21-28` dùng SHA-256 thật nhưng băm chuỗi `id:tên:kích thước` (`UploadPage.tsx:72`), không phải byte tệp. Nghiêm trọng nhất: `digitization.ts:339-342` cho ~5% tệp trạng thái `LECH_CHECKSUM` vĩnh viễn, và bảng Tệp tin (`AssetDetailPage.tsx:600-636`) **không có cột hành động** — hệ thống báo động rồi bỏ mặc. Đối chiếu `docs/02-quy-trinh-bao-quan-sao-luu.md:299-302` đặt chỉ tiêu ≥99,5% checksum hợp lệ: app đang tự trưng bằng chứng nó ở mức ~95%.

**Lợi ích lâu dài.** Hỏng bit âm thầm (bit rot) là cách dữ liệu số chết thật sự — không ồn ào, phát hiện sau 7 năm khi bản sao lưu cũng đã nhiễm. Với 82 mô hình 3D dung lượng lớn lưu chục năm, kiểm tra fixity định kỳ có khắc phục là **cơ chế duy nhất** biến "chúng tôi có sao lưu" thành "chúng tôi chứng minh được dữ liệu còn nguyên vẹn". Đây cũng là bằng chứng kiểm toán trực tiếp cho `docs/15-ho-so-de-xuat-cap-do-attt.md`.

**Ai đang làm (uy tín).** BagIt (Thư viện Quốc hội Hoa Kỳ) là chuẩn đóng gói kèm manifest checksum, dùng rộng rãi trong lưu trữ số. Chuẩn siêu dữ liệu bảo quản PREMIS — mà `docs/07:238,488` đã có thực thể `PREMIS_EVENT` — định nghĩa sự kiện `fixity check` như một loại sự kiện bắt buộc ghi nhận. Perforce P4 (Helix Core), tiêu chuẩn thực tế cho tệp nhị phân lớn trong VFX và game, lưu và đối chiếu digest cho mọi revision; miễn phí tới 5 người dùng và 20 workspace.

**Cost.**
- Bước 1 [Mock] — thêm hành động "Kiểm tra lại" / "Ghi nhận đã xử lý" vào bảng Tệp tin, hạ tỷ lệ lệch mô phỏng xuống mức thực tế (~0,5%), ghi sự kiện vào nhật ký: **2–3 người-ngày** (~185–275 USD).
- Bước 2 [Backend] — băm SHA-256 theo luồng khi nhập, lưu digest, job định kỳ đối chiếu, cảnh báo khi lệch: **10–15 người-ngày** (~920–1.380 USD).
- Hạ tầng: chi phí chủ yếu là **thời gian CPU và đọc đĩa** khi quét định kỳ. Với ~50 TB quét mỗi quý trên phần cứng tự vận hành: **0 USD phí license**; cần dự phòng cửa sổ bảo trì. Nếu dùng máy chủ riêng cho job: **~600–1.200 USD/năm** khấu hao *(cần kiểm chứng theo cấu hình thực tế)*.

**Ưu tiên.** **P0** · **[Demo thầu]** cho bước 1 (rẻ, và bịt một lỗ hổng rất dễ bị soi). **[6 tháng]** cho bước 2.

**Rủi ro nếu KHÔNG làm.** Ngắn hạn: giám khảo mở 2–3 bản ghi, thấy cảnh báo lệch checksum không bấm được gì, kết luận tính năng là trang trí — và nghi ngờ lan sang các hạng mục khác. Dài hạn: mất dữ liệu âm thầm không ai biết cho đến khi cần dùng, đúng lúc bản gốc vật lý có thể đã xuống cấp thêm.

---

### DAM-03 — Bảng quan hệ dẫn xuất và truy vấn tác động xóa

**Tên đề xuất:** Cạnh `derivedFrom` là dữ liệu thật; trả lời được "xóa cái này thì hỏng cái gì". **[Mock]**

**Vì sao.** Quan hệ master/web/raw đang là template sinh cứng 3 dòng cho mọi asset (`digitization.ts:326-356`), không phải cạnh dữ liệu. `derivedFrom` chỉ tồn tại dưới dạng câu văn xuôi trong giao diện (`AssetDetailPage.tsx:592-594`). Không truy vấn ngược được. Trong khi đó `docs/07:174-175` đã liệt `derivedFrom` trong `asset_relation.relation_type` và ADR-0008 đã làm phần khó nhất — tách `hasPreservationSurrogate` khỏi `derivedFrom` vì hai loại có nghĩa vụ lưu trữ khác nhau. **Tiền lệ hiện thực đúng đã có sẵn trong app**: bảng đo lưu `derivedFrom` là mã asset thật và biến nó thành liên kết bấm được (`AssetDetailPage.tsx:370, 385-392`).

**Lợi ích lâu dài.** Sau vài năm, mỗi hiện vật sẽ có hàng chục tệp dẫn xuất qua nhiều thế hệ công cụ. Không có đồ thị, việc dọn dẹp trở nên bất khả thi một cách an toàn: không ai dám xóa gì vì không ai biết cái gì phụ thuộc cái gì, dung lượng phình vô hạn — hoặc tệ hơn, ai đó xóa nhầm bản đám mây điểm mà `digitization.ts:390` mô tả là **dữ liệu duy nhất phục hồi được nội dung** nếu công cụ đọc `.splat` ngừng hỗ trợ. Có đồ thị, việc dọn dẹp trở thành thao tác thường quy có kiểm soát, và câu hỏi "bản này còn nguyên chuỗi dẫn xuất không" trả lời được bằng một truy vấn.

**Ai đang làm (uy tín).** ShotGrid có `PublishedFileDependency` để lần ngược chuỗi. OpenAssetIO — dự án của Academy Software Foundation ở giai đoạn sandbox, có đóng góp thiết kế từ DNEG, Pixar, Blizzard Entertainment và Blender Foundation — chuẩn hóa đúng lớp trao đổi này giữa ứng dụng sáng tạo và hệ quản lý asset. Pixar USD dùng cơ chế phân giải asset (Asset Resolver) để trỏ tới bản đúng theo ngữ cảnh. Trong bảo tồn, PREMIS mô hình hóa quan hệ dẫn xuất như quan hệ hạng nhất giữa các đối tượng.

**Cost.** Thêm `AssetRelation[]` vào store với các loại `derivedFrom` / `hasPreservationSurrogate`, thay `getFileList` bằng truy vấn cạnh thật, thêm panel "Ảnh hưởng khi xóa" liệt kê downstream: **5–7 người-ngày** (~460–645 USD). Hạ tầng: **0 USD/năm**.

**Ưu tiên.** **P1** · **[Demo thầu]** — hoàn toàn khả thi trong mock, và panel "xóa cái này thì hỏng cái gì" là một khoảnh khắc demo mạnh.

**Rủi ro nếu KHÔNG làm.** Kho dữ liệu đóng băng vì sợ: không ai dám xóa bản dẫn xuất nào, chi phí lưu trữ tăng tuyến tính theo thời gian mà không có cơ chế thu hồi. Rủi ro ngược lại nguy hiểm hơn: một đợt dọn dẹp thủ công xóa nhầm bản dẫn xuất bảo hiểm, và ADR-0008 — quyết định tinh tế nhất trong bộ ADR — trở thành vô nghĩa vì không có gì thực thi nó.

---

### DAM-04 — Thực thể Công việc (Task) và hàng đợi theo người

**Tên đề xuất:** Tách "công việc" khỏi "trạng thái bản ghi"; có người nhận, hạn, và hàng đợi cá nhân. **[Mock cho khung — Backend cho vận hành thật]**

**Vì sao.** Toàn bộ khái niệm phân công gói trong `owner: string` (`app/src/services/types.ts:75`) — một tên hiển thị, không phải khóa ngoại. Không hạn hoàn thành, không ước lượng, không hàng đợi. Cổng bốn mắt phải so sánh chuỗi tên vì thiếu định danh (`AssetDetailPage.tsx:110`). Cặp song thẩm Hán Nôm đang được bốc ngẫu nhiên (`digitization.ts:441-446`) thay vì phân công có chủ đích. Rà `docs/` xác nhận đây là khoảng trống thật: chỉ có `owner_user_id` (`07:440`), không có thực thể Task.

**Lợi ích lâu dài.** Đây là hạ tầng để dự án **chạy được**, tách khỏi việc trông đẹp. Với 82 bia + kiến trúc + kho Hán Nôm trải nhiều năm, mỗi hiện vật đi qua 6–8 công đoạn do những người khác nhau đảm nhiệm, và công đoạn Hán Nôm bị chặn bởi số chuyên gia rất hạn chế. Có Task, lãnh đạo Trung tâm trả lời được "tháng này ai quá tải, khâu nào là nút cổ chai, tiến độ so kế hoạch thế nào" — bằng dữ liệu thay vì bằng họp. Sau 3 năm, dữ liệu bid-vs-actual cho phép **ước lượng đợt số hóa tiếp theo dựa trên số liệu lịch sử thật**, thứ có giá trị trực tiếp khi lập dự toán ngân sách nhà nước.

**Ai đang làm (uy tín).** Đây chính là xương sống của ShotGrid và ftrack Studio — Task với assignee, trạng thái riêng, bid vs actual, start/due, và biểu đồ năng lực là lý do các studio trả tiền. Kitsu (CGWire, Paris, mã nguồn mở AGPL-3.0, khoảng 200 studio tự vận hành) hiện thực cùng mô hình và **tự vận hành được miễn phí** — rất đáng tham khảo vì khớp ràng buộc self-host của dự án này.

**Cost.**
- Bước 1 [Mock] — kiểu `Task` (assignee là id người dùng, bước, hạn, trạng thái), màn "Việc của tôi", đổi cổng bốn mắt sang so sánh id: **6–9 người-ngày** (~550–830 USD).
- Bước 2 [Backend] — bảng `task`, thông báo, báo cáo năng lực và tiến độ: **12–18 người-ngày** (~1.100–1.660 USD).
- Hạ tầng: **0 USD/năm** thêm. Nếu chọn tích hợp Kitsu thay vì tự viết: license **0 USD/năm** (AGPL, tự vận hành), đổi lại chi phí tích hợp và vận hành thêm một hệ thống.

**Ưu tiên.** **P1** · **[6 tháng]**. Có thể đưa màn "Việc của tôi" tối giản vào **[Demo thầu]** nếu còn thời gian — nó thể hiện hiểu biết vận hành, không chỉ hiểu biết dữ liệu.

**Rủi ro nếu KHÔNG làm.** Dự án tiếp tục được điều hành bằng bảng tính và tin nhắn bên ngoài hệ thống, khiến chính hệ thống mất vai trò nguồn sự thật. Trượt tiến độ chỉ lộ ra khi đã trễ. Và cổng bốn mắt — một cam kết quản trị trong ADR-0011 — vẫn treo trên phép so sánh chuỗi tên, tức là **có thể thủng mà không ai biết**.

---

### DAM-05 — Chuyển cổng kiểm soát từ component xuống lớp dịch vụ

**Tên đề xuất:** Máy trạng thái có bảo vệ (guard) thật, thực thi ở `AssetService`, không ở React. **[Mock]**

**Vì sao.** `assetService.advanceStatus` (`app/src/services/mock/assetService.ts:48-53`) không nhận tham số người dùng, không kiểm tra quyền, không kiểm tra tiền điều kiện — chỉ `index + 1` (`pipeline.ts:46-52`). Ba cổng kiểm soát thật (bốn mắt, xác nhận ý kiến Bộ VHTTDL theo NĐ 308/2025 Điều 87, điều kiện có hành động tiến) đều sống trong `AssetDetailPage.tsx:133-141`. Và bảng `CAPS` (`app/src/context/AuthContext.tsx:31-37`) định nghĩa đủ 5 quyền × 5 vai trò nhưng **không được đọc ở bất kỳ đâu trong toàn bộ mã nguồn** — grep `can.approve|can.publish|can.write|can.admin` trả về 0 kết quả; menu lọc bằng so khớp chuỗi vai trò thô (`navConfig.ts:19-20`).

**Lợi ích lâu dài.** Đây là khác biệt giữa một chốt kiểm soát và một hình vẽ cái chốt. Khi có API thật, cổng nằm ở lớp dịch vụ **đi theo** sang backend; cổng nằm trong React **ở lại** và biến mất. Với dữ liệu di sản quốc gia có nghĩa vụ pháp lý cụ thể — chữ ký số theo Luật GDĐT 20/2023, ý kiến Bộ VHTTDL theo NĐ 308/2025 — chỗ thực thi kiểm soát chính là chỗ chịu trách nhiệm pháp lý. Sau 5 năm và nhiều lượt thay người phát triển, chỉ những ràng buộc nằm trong lớp dịch vụ mới còn sống.

**Ai đang làm (uy tín).** ftrack và ShotGrid đều thực thi chuyển trạng thái ở phía máy chủ với điều kiện theo vai trò và theo bước; giao diện chỉ **phản ánh** cái server cho phép, không phải nơi quyết định. Đây cũng là nguyên tắc cơ bản của mọi hệ có kiểm toán — và `docs/07:433` đã đặc tả đúng chuỗi chuyển trạng thái cần thực thi, `docs/11-ke-hoach-kiem-thu.md:258-268` đã có ca kiểm thử TC-010/011 chống nhảy cóc trạng thái. Ca kiểm thử đã viết cho một ràng buộc chưa được đặt đúng chỗ.

**Cost.** Đổi chữ ký thành `advanceStatus(id, actor)`, đưa kiểm tra `can.approve`/`can.publish` và cổng bốn mắt vào trong dịch vụ, ném lỗi có mã rõ ràng, để component chỉ hiển thị lỗi: **3–4 người-ngày** (~275–370 USD). Hạ tầng: **0 USD/năm**.

**Ưu tiên.** **P0** · **[Demo thầu]** — rẻ nhất trong toàn bộ danh sách, và là điều kiện nền cho DAM-01, DAM-04, DAM-10.

**Rủi ro nếu KHÔNG làm.** Mọi cam kết quản trị trong ADR-0011 và ADR-0012 là hình thức: bất kỳ đường gọi nào khác — thao tác hàng loạt tương lai, một nút ở trang khác, một lần gọi API — đều đi vòng qua toàn bộ cổng kiểm soát. Trong một hệ thống bị thanh tra, "chúng tôi có kiểm soát nhưng chỉ ở giao diện" tương đương với không có kiểm soát.

---

### DAM-06 — Lớp ghi chú và đánh dấu trên media

**Tên đề xuất:** Ghim ghi chú vào tọa độ cụ thể trên ảnh/mô hình 3D, gắn vào phiên bản, có luồng trả lời và trạng thái xử lý. **[Mock cho ảnh 2D — Backend cho 3D và quy mô thật]**

**Vì sao.** Toàn bộ phản hồi hiện là textarea tự do (`AssetDetailPage.tsx:716-721`, `739-744`) ghi vào nhật ký phẳng qua `auditService.record` (`auditService.ts:36-38`). Không tọa độ, không luồng, không trạng thái đã-xử-lý, **không gắn phiên bản**. Cặp song thẩm Hán Nôm được bốc ngẫu nhiên (`digitization.ts:441-446`) và không có nơi để người thẩm định để lại dấu vết ở đúng chỗ mình phản đối.

**Lợi ích lâu dài.** Với di sản Hán Nôm đây không phải tiện nghi mà là **công cụ chuyên môn cốt lõi**. Bản phiên âm một tấm bia Tiến sĩ có thể chứa hàng nghìn ký tự; phản hồi "có lỗi ở dòng 12" là thứ không kiểm chứng lại được sau 5 năm, khi người viết ghi chú đã nghỉ hưu. Ghi chú neo vào tọa độ, gắn vào phiên bản, có người trả lời và trạng thái đóng — đó là cách tri thức chuyên gia **tích lũy** thay vì bay hơi. Sau 10 năm, tập ghi chú này tự nó trở thành một tài sản nghiên cứu có giá trị độc lập với dữ liệu số hóa.

**Ai đang làm (uy tín).** Frame.io (Adobe) xây cả sản phẩm quanh đúng bài toán này — bình luận neo khung hình, vẽ đè lên hình, gắn version; gói Pro $15/người/tháng tới 5 người, Team $25/người/tháng tới 15 người, gói miễn phí 2 người. ftrack Studio có review session tương đương. Trong giới di sản, mô hình W3C Web Annotation Data Model là chuẩn mở cho ghi chú neo tọa độ, và Mirador — trình xem IIIF dùng bởi nhiều thư viện số lớn — hiện thực đúng mô hình đó cho thủ bản *(danh sách tổ chức cụ thể cần kiểm chứng trước khi trích dẫn trong hồ sơ)*. Đáng chú ý: `docs/01-thuyet-minh-ky-thuat.md:140,241` đã xếp IIIF vào Giai đoạn 2 — đề xuất này **khớp với lộ trình đã có**, không mâu thuẫn.

**Cost.**
- Bước 1 [Mock] — ghim tọa độ trên ảnh 2D (bản dập, ảnh tư liệu), lưu `{x, y, versionNo, tác giả, nội dung, trạng thái}`, hiển thị danh sách bên cạnh: **6–8 người-ngày** (~550–735 USD).
- Bước 2 [Backend] — lưu trữ thật, luồng trả lời, thông báo, mở rộng sang mô hình 3D: **14–20 người-ngày** (~1.290–1.840 USD).
- Hạ tầng: **0 USD/năm** nếu tự viết trên nền có sẵn. Nếu mua Frame.io cho 15 người: **~4.500 USD/năm** — nhưng **không dùng được** do ràng buộc self-host của dự án, nêu ra chỉ để so sánh giá trị.

**Ưu tiên.** **P1** · **[Demo thầu]** cho bước 1 nếu còn ngân sách thời gian — đây là hạng mục có tỷ lệ ấn tượng-trên-công-sức cao nhất trong toàn bộ danh sách. **[18 tháng]** cho bước 2.

**Rủi ro nếu KHÔNG làm.** Tri thức Hán Nôm — thứ khan hiếm nhất và khó thay thế nhất trong toàn dự án — tiếp tục trao đổi qua email và văn bản giấy, không vào hệ thống, và mất đi khi chuyên gia nghỉ. Song thẩm vẫn là hai cái tên cạnh nhau thay vì một quy trình kiểm chứng thật.

---

### DAM-07 — Sinh bản dẫn xuất tự động, có trạng thái job

**Tên đề xuất:** Chuyển mã và sinh proxy/thumbnail tự động sau QC, theo dõi được, làm lại được. **[Backend]**

**Vì sao.** `getFileList` (`digitization.ts:326-334`) luôn hiển thị đúng 3 dòng master/web/raw dù chưa có gì được sinh; `rawSizeLabel` (`317-323`) trả `KHONG_AP_DUNG` cho tài liệu nên có dòng tồn tại chỉ để giữ bố cục. Không có thực thể job, không trạng thái chuyển mã, không nút tạo lại, không ghi nhận lỗi. Lệch tài liệu: `docs/07:470` định nghĩa `asset_file.kind` gồm **4** giá trị `MASTER|WEB|RAW|THUMB`, nhưng `AssetFileRow.role` (`digitization.ts:289`) chỉ có 3 — thiếu `thumb`, dù `derivedFileLabel` (`assetCode.ts:21`) đã chấp nhận tham số `'thumb'`. `docs/02:79,92,113` đã đặc tả quy trình sinh tự động sau QC.

**Lợi ích lâu dài.** Đây là hạng mục quyết định hệ thống có **dùng được hằng ngày** hay không khi dữ liệu thật về. Một mesh 3D vài GB không thể mở trực tiếp trên trình duyệt của cán bộ; nếu không có bản nhẹ sinh tự động, mọi thao tác duyệt và tra cứu đều phải tải bản gốc — nhanh chóng bóp nghẹt cả băng thông lẫn kiên nhẫn người dùng, và tăng rủi ro bản gốc bị sao chép lung tung ra máy cá nhân. Về bảo tồn, việc dẫn xuất được sinh **tự động từ master theo công thức ghi lại được** nghĩa là chúng luôn tái tạo được, nên có thể xóa tự do để thu hồi dung lượng — đúng nguyên tắc mà ADR-0008 đã đặt ra.

**Ai đang làm (uy tín).** FFmpeg là nền tảng thực tế cho chuyển mã video/âm thanh trong hầu hết pipeline studio. Với 3D, glTF/GLB kèm nén Draco hoặc meshopt là con đường tiêu chuẩn để đưa mô hình nặng lên web. Trong thư viện số, máy chủ ảnh IIIF như Cantaloupe sinh mức phân giải theo yêu cầu từ TIFF gốc, tránh phải lưu sẵn nhiều bản *(phù hợp lộ trình IIIF Giai đoạn 2 tại `docs/01:140,241`)*. ShotGrid và ftrack đều sinh proxy tự động khi ingest và hiển thị trạng thái job.

**Cost.** Hàng đợi job (Celery/RQ trên Python hoặc tương đương), worker FFmpeg cho media, worker gltf-transform cho 3D, worker sinh thumbnail, bảng trạng thái job trong giao diện, hành động "tạo lại": **18–25 người-ngày** (~1.660–2.300 USD). Bổ sung `thumb` vào kiểu `role` để khớp `docs/07:470`: **0,5 người-ngày**.

Hạ tầng: một máy chủ worker có GPU cho xử lý 3D và video. Tự vận hành, khấu hao phần cứng: **~2.000–4.000 USD/năm** *(cần kiểm chứng theo cấu hình và giá thiết bị thực tế; giả định một máy trạm GPU tầm trung khấu hao 3 năm cộng điện năng)*. License phần mềm: **0 USD/năm** (FFmpeg LGPL/GPL, gltf-transform MIT).

**Ưu tiên.** **P1** · **[6 tháng]** — không thể mô phỏng thêm, và là điều kiện cần trước khi dữ liệu thật từ NAS đổ vào.

**Rủi ro nếu KHÔNG làm.** Khi 82 mesh 3D thật về, hệ thống không dùng được trên thực tế: mỗi lần xem là mỗi lần tải vài GB. Cán bộ sẽ quay lại làm việc trực tiếp trên ổ đĩa mạng và hệ thống trở thành một danh mục tra cứu chết, không phải công cụ vận hành.

---

### DAM-08 — Mẫu đường dẫn lưu trữ do hệ thống sinh

**Tên đề xuất:** Template đường dẫn suy ra từ mã 5 tầng; người dùng không bao giờ gõ đường dẫn. **[Mock cho quy ước — Backend cho hiện thực]**

**Vì sao.** `Asset` không có trường đường dẫn (`types.ts:49-99`). Tên tệp hiển thị là nhãn ghép chuỗi (`digitization.ts:346`: `derivedFileLabel(asset.code, r.role) + '.' + r.ext`), không phải địa chỉ thật. `assetCode.ts:6-8` tự thừa nhận tầng 3 (phiên bản) và tầng 5 (đợt số hóa) **chưa có store riêng**. Tài liệu cũng chưa chốt: `docs/07:474-475` để `storage_path` là `varchar(1000)` tự do, không template. Câu hỏi vận hành cơ bản nhất — *"tệp gốc bia số 14 đang nằm ở NAS nào, thư mục nào, băng LTO số mấy"* — hệ thống không trả lời được.

**Lợi ích lâu dài.** Quy ước đường dẫn là **quyết định một chiều**: sửa sau khi đã có 50 TB dữ liệu là việc rất đắt và rủi ro. Đường dẫn sinh từ mã định danh bền vững nghĩa là: di chuyển giữa các tầng lưu trữ không phá liên kết; khôi phục từ băng có địa chỉ xác định; kiểm kê đối chiếu được giữa cơ sở dữ liệu và hệ thống tệp; và người mới vào hiểu cấu trúc kho trong 10 phút thay vì hỏi người cũ. Sau 10 năm và vài lần thay hệ thống lưu trữ, đây là thứ giữ cho dữ liệu **tìm lại được**.

**Ai đang làm (uy tín).** Shotgun Toolkit (`tk-core`) của Autodesk dựng cả một hệ thống schema thư mục và path template — đường dẫn do template sinh, nghệ sĩ không bao giờ tự chọn nơi lưu; đây là một trong những cơ chế được sao chép nhiều nhất sang các pipeline tự viết. Prism Pipeline (mã nguồn mở) áp dụng cùng ý tưởng cho studio nhỏ *(chi tiết cần kiểm chứng)*. Trong lưu trữ số, cấu trúc BagIt cùng chuẩn đặt tên nhất quán phục vụ đúng mục đích này. Bản thân ADR-0004 đã dựng hệ mã 5 tầng — **phần khó đã xong**, chỉ còn nối mã sang đường dẫn.

**Cost.** Định nghĩa template (ví dụ `/{tier}/{objectClass}/{physicalObjectId}/{code}/v{n}/{role}/{filename}`), hàm sinh và hàm phân tích ngược, thêm `storagePath` vào mô hình, hiển thị đường dẫn thật trên bảng Tệp tin, kiểm tra tính duy nhất: **4–6 người-ngày** (~370–550 USD). Hạ tầng: **0 USD/năm**.

**Ưu tiên.** **P1** · **[Demo thầu]** cho phần quy ước và hiển thị — rẻ, và trả lời trực tiếp câu hỏi mà hội đồng kỹ thuật hay hỏi. **[6 tháng]** cho hiện thực đầy đủ. **Nên quyết trước DAM-07**, vì bản dẫn xuất cần biết ghi vào đâu.

**Rủi ro nếu KHÔNG làm.** Đường dẫn do người gõ tay dẫn tới cấu trúc kho không nhất quán ngay từ đợt nhập đầu tiên; sau đó mọi tự động hóa (dẫn xuất, kiểm tra fixity, sao lưu, khôi phục) đều phải xử lý ngoại lệ. Đây là loại nợ kỹ thuật **tăng theo dung lượng dữ liệu**, nên càng để lâu càng không trả nổi.

---

### DAM-09 — Bộ lọc lưu được, trường tùy biến, thao tác hàng loạt

**Tên đề xuất:** Đưa khâu tra cứu và sửa hàng loạt lên đúng mức SRS đã cam kết. **[Mock]**

**Vì sao.** `docs/09-dac-ta-yeu-cau-srs.md:188` (CN-04.4) yêu cầu ≥4 điều kiện lọc gồm khoảng niên đại, mức truy cập, cán bộ phụ trách. `AssetsPage.tsx:46-56` hiện thực 3 trục + ô tìm kiếm — **dưới chuẩn chính SRS của mình**. Trường `eraEdtf` chuẩn EDTF đã có sẵn (`types.ts:70`) nhưng không được dùng để lọc khoảng. Không có bộ lọc lưu được. `AssetTable.tsx` không có cột chọn nên không thao tác hàng loạt — **dù mẫu chọn hàng loạt đã chạy tốt ở `InventoryPage.tsx:263-274`** (`toggleSelectRow`, `toggleSelectAll`, `bulkMarkVisited`) kèm hoàn tác hai tầng theo ADR-0010.

**Lợi ích lâu dài.** Khi kho vượt vài nghìn bản ghi, tra cứu chuyển từ "duyệt danh sách" sang "truy vấn" — và bộ lọc lưu được trở thành công cụ hằng ngày: *"bia Tiến sĩ chưa phiên âm xong"*, *"mọi bản ghi Hán Nôm đang chờ thẩm định"*, *"tài sản chưa kiểm tra fixity quá 6 tháng"*. Mỗi bộ lọc được lưu là một quy trình công tác được mã hóa lại, không phải nhớ trong đầu ai đó. Thao tác hàng loạt là khác biệt giữa gắn thẻ 200 bản ghi trong 2 phút và trong 2 ngày — với 82 bia nhân nhiều dạng dữ liệu, đó là chênh lệch tính bằng tuần công mỗi năm.

**Ai đang làm (uy tín).** ShotGrid và ftrack đều cho lưu và chia sẻ bộ lọc trong nhóm, và cho studio tự định nghĩa trường lẫn thực thể tùy biến — đây là một trong những lý do chính chúng bám trụ được ở nhiều studio với quy trình rất khác nhau. Kitsu (AGPL, tự vận hành miễn phí) cũng có bộ lọc lưu được. Với trường tùy biến trong bối cảnh di sản, mô hình mở rộng theo bộ sưu tập là cách các hệ thư viện số xử lý nhu cầu phát sinh theo từng đợt nghiên cứu.

**Cost.**
- Bổ sung 3 trục lọc còn thiếu (khoảng niên đại dùng `eraEdtf`, mức truy cập, cán bộ phụ trách) để đạt CN-04.4: **3–4 người-ngày** (~275–370 USD).
- Bộ lọc lưu được (đặt tên, lưu localStorage ở bản mock): **2–3 người-ngày** (~185–275 USD).
- Cột chọn + thanh hành động hàng loạt trên `AssetTable`, tái dùng mẫu `InventoryPage`: **3–5 người-ngày** (~275–460 USD).
- Trường tùy biến do quản trị định nghĩa: **8–12 người-ngày** (~735–1.100 USD) — nên để giai đoạn sau.
- Hạ tầng: **0 USD/năm**.

**Ưu tiên.** **P1** · **[Demo thầu]** cho ba mục đầu (tổng ~8–12 người-ngày, tái dùng mã đã có nên rủi ro thấp). **[18 tháng]** cho trường tùy biến.

**Rủi ro nếu KHÔNG làm.** Rủi ro trước mắt rất cụ thể: `docs/03-ma-tran-truy-vet.md` là ma trận truy vết yêu cầu, và nếu hội đồng đối chiếu CN-04.4 với sản phẩm thật, **đây là một mục truy vết không đạt** — loại phát hiện gây thiệt hại điểm lớn hơn nhiều so với công sức để sửa. Dài hạn: cán bộ xuất Excel ra sửa ngoài rồi nhập lại, tạo vòng lặp mất kiểm soát phiên bản.

---

### DAM-10 — Phân quyền theo phạm vi bộ sưu tập, thực thi ở lớp dịch vụ

**Tên đề xuất:** Kích hoạt ma trận quyền đang nằm chết, và bổ sung phạm vi theo bộ sưu tập. **[Mock]**

**Vì sao.** `Capabilities` và `CAPS` (`app/src/context/AuthContext.tsx:18-39`) định nghĩa 5 vai trò × 5 quyền với chú thích cẩn thận, khớp ma trận phân quyền ở màn Chi tiết người dùng — nhưng grep toàn bộ `app/src` cho `can.approve|can.publish|can.write|can.admin|can.read` trả về **0 kết quả**. Không một lần được đọc. Menu ẩn/hiện dùng so khớp chuỗi vai trò thô (`navConfig.ts:19-20`), bỏ qua `Capabilities` hoàn toàn. `docs/07:553-559` đặc tả mô hình hai lớp RBAC + ABAC theo phạm vi bộ sưu tập (`user_collection_scope`) — chưa hiện thực; `docs/07:283-292` đã có sẵn enum module × action.

**Lợi ích lâu dài.** Khi số người dùng vượt quá một nhóm nhỏ tin nhau, phân quyền chuyển từ hình thức sang cần thiết. Phạm vi theo bộ sưu tập là mấu chốt trong ngữ cảnh này: cộng tác viên phiên âm Hán Nôm bên ngoài cần sửa được bộ *Tư liệu Hán Nôm* nhưng **không được** chạm vào *Bia Tiến sĩ* thuộc UNESCO Memory of the World; sinh viên thực tập cần xem mà không sửa. Không có phạm vi, lựa chọn chỉ còn "cấp quyền toàn kho" hoặc "không cho vào" — và trong thực tế cơ quan, phương án được chọn luôn là cấp quá tay. Sau vài năm, đó là cách một sự cố dữ liệu xảy ra.

**Ai đang làm (uy tín).** ShotGrid có permission group theo project và tới mức trường dữ liệu; ftrack Studio có mô hình tương tự. Trong hệ tự vận hành, Keycloak — đã nằm sẵn trong phương án hạ tầng của dự án — hiện thực RBAC kèm thuộc tính đủ để phục vụ mô hình hai lớp mà `docs/07:553-559` mô tả, nên chi phí thêm chủ yếu là tích hợp chứ không phải xây mới.

**Cost.** Đọc `can` trong các hành động của `AssetService` (đi kèm DAM-05), thêm `collectionScope` vào người dùng, lọc danh sách và chặn hành động theo phạm vi, đổi lọc menu sang dùng `Capabilities` thay chuỗi vai trò: **5–7 người-ngày** (~460–645 USD). Hạ tầng: **0 USD/năm** thêm (Keycloak mã nguồn mở, đã có trong phương án).

**Ưu tiên.** **P1** · **[Demo thầu]** — chi phí thấp vì cấu trúc đã có sẵn, chỉ chưa nối dây. Phụ thuộc DAM-05.

**Rủi ro nếu KHÔNG làm.** Ma trận phân quyền hiển thị trên màn Chi tiết người dùng **mô tả một thứ không tồn tại** — nếu giám khảo hỏi "vai trò Chỉ xem có sửa được không" và người demo phải trả lời trung thực, đó là mất điểm ở hạng mục an toàn thông tin, đúng nơi `docs/15-ho-so-de-xuat-cap-do-attt.md` đang cam kết. Dài hạn: không thể mở hệ thống cho cộng tác viên bên ngoài, làm mất chính lợi ích hợp tác nghiên cứu mà dự án hướng tới.

---

### DAM-11 — Hợp đồng API và webhook: chốt hình dạng ngay, hiện thực sau

**Tên đề xuất:** Đóng băng interface lớp dịch vụ theo `docs/06`, để việc thay mock bằng API là thao tác cơ học. **[Mock cho hợp đồng — Backend cho hiện thực]**

**Vì sao.** Không có lời gọi mạng nào trong toàn app (grep `fetch(`, `axios`, `WebSocket`, `EventSource` = 0 kết quả); 6 dịch vụ in-memory (`services/index.ts:10-17`) trên một `Store` đơn giản (`store.ts:4-24`). Điều đó **hoàn toàn hợp lý cho bản demo** và đúng ADR-0002. Vấn đề là rò rỉ kiến trúc: `types.ts:2-3` quy định *"Components only ever import these — never `src/data` directly"*, nhưng 18 tệp trong `pages/` và `components/` import trực tiếp từ `../data/`, trong đó `AssetDetailPage.tsx:11-33` kéo 15 hàm từ `data/digitization` — tức phiên bản, tệp, checksum, chữ ký số **không có phương thức dịch vụ nào để thay thế**. Trong khi đó `docs/06-dac-ta-api.md:11-16` đã đặc tả 3 lớp API và `06:654-707` đã có schema webhook kèm `event_types` và chữ ký HMAC.

**Lợi ích lâu dài.** Với dữ liệu di sản, giá trị thật xuất hiện khi dữ liệu **đi ra ngoài**: cổng tra cứu công chúng, kết nối LGSP/NDXP theo NĐ 278/2025, thu hoạch OAI-PMH cho các cổng di sản, và về sau là IIIF. Mỗi kênh đó là một khách hàng của cùng một API. Nếu logic nghiệp vụ nằm rải trong component React, mỗi kênh mới là một lần viết lại. Nếu nó nằm sau một hợp đồng dịch vụ ổn định, mỗi kênh mới là một lớp adapter mỏng. Đây là quyết định định hình chi phí phát triển của **cả thập kỷ tới**, và nó gần như miễn phí nếu làm bây giờ.

**Ai đang làm (uy tín).** ShotGrid có REST API kèm event daemon để studio tự động hóa và tích hợp Maya/Nuke/Houdini — phần lớn giá trị thực tế của nó đến từ đây chứ không từ giao diện web. ftrack có API và event hub tương đương. OpenAssetIO (dự án sandbox của Academy Software Foundation, có đóng góp thiết kế từ DNEG, Pixar, Blizzard Entertainment và Blender Foundation) đang chuẩn hóa đúng lớp trao đổi này để giảm chi phí tích hợp — đáng theo dõi cho giai đoạn sau, dù chưa nên phụ thuộc vào khi dự án còn ở giai đoạn sandbox.

**Cost.**
- Bọc `data/digitization` vào `AssetService` (`getVersions`, `getFiles`, `getRights`, `getSignature`...), sửa `AssetDetailPage` chỉ gọi qua `services`: **3–5 người-ngày** (~275–460 USD). **Đây là hạng mục ROI cao nhất trong toàn bộ báo cáo.**
- Đối chiếu toàn bộ chữ ký dịch vụ với `docs/06`, ghi rõ dạng lỗi và phân trang: **3–4 người-ngày** (~275–370 USD).
- Hiện thực backend + webhook daemon: **25–40 người-ngày** (~2.300–3.680 USD) — giai đoạn sau.
- Hạ tầng: **0 USD/năm** cho phần hợp đồng. Backend chạy chung Postgres/MinIO/Keycloak đã có trong phương án self-host.

**Ưu tiên.** **P0** cho phần bọc dịch vụ · **[Demo thầu]**. **P2** cho hiện thực backend · **[18 tháng]**.

**Rủi ro nếu KHÔNG làm.** Lời hứa trung tâm của ADR-0002 — thay mock bằng API mà không đụng nơi gọi — **không giữ được**, và điều đó chỉ lộ ra khi bắt đầu làm backend, tức lúc sửa đắt nhất. Rủi ro trước mắt nhỏ hơn nhưng có thật: nếu hội đồng hỏi "làm sao chuyển sang API thật" và người demo mở `AssetDetailPage.tsx` ra, các import trực tiếp từ `data/` sẽ tự nói lên câu trả lời.

---

### DAM-12 — Truyền tải và nhập tệp dung lượng lớn có điểm dừng

**Tên đề xuất:** Nhập tệp hàng chục GB có thể tạm dừng, tiếp tục, và xác minh sau khi truyền. **[Backend]**

**Vì sao.** `uploadService.addUpload` (`app/src/services/mock/uploadService.ts:43-50`) tạo một mục hàng đợi với tên tệp bịa (`'vm_3d_0' + uploadCounter + '_scan.glb'`) và mô phỏng tiến độ bằng `setInterval` (`uploadService.ts:11-24`). Không có tệp thật, không tạm dừng, không tiếp tục sau gián đoạn, không xác minh sau truyền. `docs/09:173` (CN-03.2) đã đặc tả nhập lô Excel có validate — phần đó hiện thực khá tốt trong `UploadPage.tsx:279-337`, kèm quét mã độc và vô hiệu hóa công thức động (`09:177`). Phần thiếu là **truyền tệp lớn thật**. `ACCEPT_LIMIT` (`app/src/data/metadataFields.ts`) tự đặt mức tối đa 50 GB mỗi tệp cho Scan 3D, Splat và Media.

**Lợi ích lâu dài.** Một tệp 50 GB truyền qua mạng cơ quan sẽ đứt. Không có khả năng tiếp tục, mỗi lần đứt là truyền lại từ đầu — và với dữ liệu từ NAS gồm 82 mesh 3D cộng splat cộng point cloud, đó là khác biệt giữa nhập kho xong trong một tuần và không bao giờ nhập xong. Xác minh sau truyền (đối chiếu digest hai đầu) là chốt chặn cuối để một tệp hỏng đường truyền không lặng lẽ trở thành bản gốc bảo quản vĩnh viễn.

**Ai đang làm (uy tín).** Signiant và IBM Aspera là hai giải pháp thương mại tiêu chuẩn cho truyền tệp lớn trong ngành media, dùng giao thức tăng tốc trên UDP thay vì TCP thuần *(giá license theo thỏa thuận, cần kiểm chứng; và cả hai đều cần cân nhắc kỹ với ràng buộc self-host của dự án)*. Phương án mã nguồn mở phù hợp hơn với ràng buộc dự án: giao thức tải lên nhiều phần của S3 — mà **MinIO đã có sẵn trong phương án hạ tầng** — hỗ trợ chia mảnh, tiếp tục sau gián đoạn và ETag để đối chiếu; kết hợp tus.io (giao thức tải lên tiếp tục được, mã nguồn mở) cho phía trình duyệt. Perforce P4 giải cùng bài toán ở góc quản lý phiên bản tệp nhị phân lớn, miễn phí tới 5 người dùng và 20 workspace.

**Cost.** Tải lên nhiều phần qua MinIO, tiếp tục sau gián đoạn, băm theo luồng trong lúc truyền, đối chiếu digest sau khi hoàn tất, hiển thị tiến độ thật thay `setInterval`: **12–18 người-ngày** (~1.100–1.660 USD). Hạ tầng: **0 USD/năm** license (MinIO và tus.io mã nguồn mở); chi phí nằm ở dung lượng đĩa đã tính trong phương án lưu trữ.

**Ưu tiên.** **P2** · **[6 tháng]** — phải xong **trước** khi dữ liệu thật từ NAS bắt đầu đổ vào, nhưng không cần cho buổi chấm thầu.

**Rủi ro nếu KHÔNG làm.** Khâu nhập dữ liệu thật trở thành nút thắt vận hành ngay tuần đầu tiên. Trong thực tế, cán bộ sẽ chép tay qua ổ cứng rời và cập nhật cơ sở dữ liệu thủ công — đúng kịch bản khiến metadata lệch khỏi tệp thật, và là nguyên nhân phổ biến nhất khiến một hệ DAM bị bỏ rơi sau 6 tháng.

---

## 5. Bảng tổng hợp xếp theo ROI

ROI ước lượng theo tỷ lệ **giá trị thu được (điểm thầu + giá trị vận hành dài hạn) trên công sức bỏ ra**. Cột "Người-ngày" lấy cận dưới–cận trên của giai đoạn ưu tiên gần nhất.

| Hạng | Mã | Đề xuất | Người-ngày (giai đoạn gần nhất) | Ưu tiên | Phân kỳ | Mock/Backend | ROI |
|---|---|---|---|---|---|---|---|
| 1 | **DAM-11** | Bọc `data/digitization` vào lớp dịch vụ (phần hợp đồng) | 3–5 | P0 | Demo thầu | Mock | **Rất cao** — rẻ nhất, gỡ rào cho gần như mọi đề xuất khác, cứu lời hứa ADR-0002 |
| 2 | **DAM-05** | Cổng kiểm soát xuống lớp dịch vụ + kích hoạt `CAPS` | 3–4 | P0 | Demo thầu | Mock | **Rất cao** — biến kiểm soát hình thức thành kiểm soát thật |
| 3 | **DAM-02** (b1) | Hành động xử lý cảnh báo fixity + chỉnh tỷ lệ mô phỏng | 2–3 | P0 | Demo thầu | Mock | **Rất cao** — bịt lỗ hổng dễ bị soi nhất với công sức tối thiểu |
| 4 | **DAM-01** (b1) | `AssetVersion` trong domain model + sinh phiên bản khi trả lại | 4–6 | P0 | Demo thầu | Mock | **Rất cao** — lỗ hổng nghiêm trọng nhất; tài liệu đã đặc tả sẵn |
| 5 | **DAM-09** (b1-3) | Đủ 4 trục lọc theo CN-04.4 + lọc lưu được + chọn hàng loạt | 8–12 | P1 | Demo thầu | Mock | **Cao** — sửa một mục truy vết không đạt; tái dùng mẫu `InventoryPage` |
| 6 | **DAM-03** | Cạnh `derivedFrom` thật + panel tác động xóa | 5–7 | P1 | Demo thầu | Mock | **Cao** — thu hoạch ADR-0008; khoảnh khắc demo mạnh |
| 7 | **DAM-10** | Phân quyền theo phạm vi bộ sưu tập, thực thi ở dịch vụ | 5–7 | P1 | Demo thầu | Mock | **Cao** — cấu trúc đã có, chỉ chưa nối dây |
| 8 | **DAM-08** | Mẫu đường dẫn lưu trữ sinh từ mã 5 tầng | 4–6 | P1 | Demo thầu | Mock | **Cao** — quyết định một chiều, càng để lâu càng đắt |
| 9 | **DAM-06** (b1) | Ghim ghi chú tọa độ trên ảnh 2D, gắn phiên bản | 6–8 | P1 | Demo thầu | Mock | **Cao** — ấn tượng chuyên môn cao nhất; đúng nhu cầu Hán Nôm |
| 10 | **DAM-04** (b1) | Thực thể Task + màn "Việc của tôi" | 6–9 | P1 | 6 tháng | Mock | **Trung bình-cao** — quyết định dự án chạy được hay không |
| 11 | **DAM-02** (b2) | Băm SHA-256 thật khi nhập + job kiểm tra định kỳ | 10–15 | P0 | 6 tháng | Backend | **Trung bình-cao** — nghĩa vụ bảo tồn cốt lõi |
| 12 | **DAM-01** (b2) | Bảng `asset_version` + ràng buộc bất biến ở CSDL | 8–12 | P0 | 6 tháng | Backend | **Trung bình-cao** — hoàn tất cam kết OAIS |
| 13 | **DAM-07** | Sinh bản dẫn xuất tự động + trạng thái job | 18–25 | P1 | 6 tháng | Backend | **Trung bình** — bắt buộc trước khi dữ liệu thật về; chi phí hạ tầng thật |
| 14 | **DAM-12** | Tải lên nhiều phần, tiếp tục được, xác minh sau truyền | 12–18 | P2 | 6 tháng | Backend | **Trung bình** — điều kiện cần để nhập kho thật |
| 15 | **DAM-04** (b2) | Task đầy đủ: thông báo, báo cáo năng lực, tiến độ | 12–18 | P1 | 18 tháng | Backend | **Trung bình** |
| 16 | **DAM-06** (b2) | Annotation đầy đủ: luồng trả lời, mở rộng 3D | 14–20 | P1 | 18 tháng | Backend | **Trung bình** |
| 17 | **DAM-11** (b2) | Backend REST + webhook daemon theo `docs/06` | 25–40 | P2 | 18 tháng | Backend | **Trung bình** — giá trị lớn nhưng chi phí lớn |
| 18 | **DAM-09** (b4) | Trường tùy biến do quản trị định nghĩa | 8–12 | P1 | 18 tháng | Mock | **Thấp-trung bình** — hoãn được |

**Tổng công sức gói [Demo thầu]** (hạng 1–9): **40–58 người-ngày** ≈ **3.680–5.340 USD** theo giả định quy đổi ở đầu mục 4. Toàn bộ chạy được trong lớp mock, không cần backend, không phát sinh chi phí hạ tầng.

**Tổng công sức gói [6 tháng]** (hạng 10–14): **54–79 người-ngày** ≈ **4.970–7.270 USD**, cộng hạ tầng **~2.600–5.200 USD/năm** *(chủ yếu máy chủ worker GPU cho DAM-07 và máy chạy job fixity cho DAM-02; cần kiểm chứng theo giá thiết bị thực tế)*.

**Ba việc nên làm trước tiên nếu chỉ có một tuần:** DAM-11 bước 1, DAM-05, DAM-02 bước 1. Tổng **8–12 người-ngày**, và chúng bịt đúng ba lỗ hổng dễ bị phát hiện nhất trong buổi chấm: không có đường thay API, kiểm soát chỉ nằm ở giao diện, và cảnh báo toàn vẹn không xử lý được.

---

## 6. Nguồn tham chiếu

### Mã nguồn ứng dụng (đọc trực tiếp, không sửa)

| Tệp | Vai trò trong báo cáo |
|---|---|
| `app/src/services/types.ts` | Domain model; thiếu version/checksum/path/task (`49-99`); quy tắc kiến trúc bị vi phạm (`2-3`) |
| `app/src/services/mock/assetService.ts` | Interface dịch vụ (`21-38`); `advanceStatus` không guard (`48-53`); `requestRevision` bỏ lý do (`57-60`) |
| `app/src/services/mock/uploadService.ts` | Mô phỏng tiến độ tải lên (`11-24`, `43-50`) |
| `app/src/services/mock/auditService.ts` | Nhật ký append-only (`36-38`) |
| `app/src/services/store.ts` | Store in-memory (`4-24`) |
| `app/src/services/index.ts` | Điểm vào lớp dịch vụ (`10-17`) |
| `app/src/data/digitization.ts` | Trung tâm của báo cáo: version PRNG (`206-237`), checksum ngẫu nhiên (`300-306`), fixity xúc xắc (`337-343`), file list cứng (`326-356`), song thẩm ngẫu nhiên (`441-446`) |
| `app/src/data/pipeline.ts` | Chuỗi trạng thái (`13-23`), `nextStatus` (`46-52`), cổng phê duyệt/xuất bản (`59-67`) |
| `app/src/data/relations.ts` | Quan hệ nhóm 2, 4 quy tắc cứng (`23-30`, `54-56`) |
| `app/src/data/metadataFields.ts` | Định dạng chấp nhận và hạn mức 50 GB; hàng nhập lô mẫu |
| `app/src/utils/assetCode.ts` | Hệ mã 5 tầng; thừa nhận tầng 3/5 chưa có store (`6-8`); `derivedFileLabel` (`20-23`) |
| `app/src/utils/search.ts` | Tìm kiếm bỏ dấu hai chiều (`11-18`, `21-34`) — điểm mạnh |
| `app/src/context/AuthContext.tsx` | `Capabilities` và `CAPS` — định nghĩa nhưng không được đọc ở đâu (`18-39`) |
| `app/src/layout/navConfig.ts` | Lọc menu bằng chuỗi vai trò (`19-20`) |
| `app/src/pages/AssetDetailPage.tsx` | Import trực tiếp `data/` (`11-33`); cổng bốn mắt so chuỗi (`110`); hành động chính (`133-141`); bảng phiên bản (`485-520`); bảng tệp không có cột hành động (`600-636`); lineage đúng ở bảng đo (`370`, `385-392`) |
| `app/src/pages/AssetsPage.tsx` | Lọc 3 trục (`46-56`) — dưới chuẩn CN-04.4 |
| `app/src/pages/UploadPage.tsx` | SHA-256 thật nhưng băm chuỗi metadata (`21-28`, `67-76`); nhập lô có xem trước (`279-337`) |
| `app/src/pages/InventoryPage.tsx` | Mẫu chọn hàng loạt đã chạy tốt (`263-274`) — nên tái dùng |
| `app/src/components/AssetTable.tsx` | Không có cột chọn → không thao tác hàng loạt |

### Tài liệu dự án

- `docs/07-mo-hinh-du-lieu.md` — `ASSET_VERSION` (`139-165`, `445-462`), bất biến OAIS (`517-519`), `derivedFrom` (`174-175`, `575`, `605-612`), checksum/fixity (`163-165`, `476-478`), `asset_file.kind` 4 giá trị (`470`), `storage_path` chưa template (`474-475`), `owner_user_id` (`440`), RBAC+ABAC (`553-559`), enum quyền (`283-292`), chuỗi chuyển trạng thái (`433`), `PREMIS_EVENT` (`238`, `488`)
- `docs/02-quy-trinh-bao-quan-sao-luu.md` — 3 tầng lưu trữ (`55-59`), luồng AIP→PROXY→WEB (`75-92`), sinh dẫn xuất sau QC (`79`, `92`, `113`), quy trình fixity (`124-159`), KPI ≥99,5% checksum hợp lệ (`299-302`), METS ở mức trưởng thành 4 (`317`)
- `docs/06-dac-ta-api.md` — 3 lớp API (`11-16`), schema webhook + HMAC (`654-707`), idempotency key (`1976`)
- `docs/09-dac-ta-yeu-cau-srs.md` — CN-03.2 nhập lô Excel (`173`), CN-03.6 quét mã độc (`177`), CN-04.4 ≥4 điều kiện lọc (`188`), CN-04.9 xuất Excel (`193`)
- `docs/01-thuyet-minh-ky-thuat.md` — IIIF thuộc Giai đoạn 2 (`140`, `241`)
- `docs/11-ke-hoach-kiem-thu.md` — TC-010/011 chống nhảy cóc trạng thái (`258-268`)
- ADR liên quan: **0002** (React + lớp dịch vụ giả lập), **0003** (tách 2 trục), **0004** (mã 5 tầng), **0008** (tách `hasPreservationSurrogate` khỏi `derivedFrom`), **0010** (hoàn tác hai tầng), **0011** (bốn mắt, tách duyệt/xuất bản), **0012** (nhật ký append-only)

### Nguồn ngoài (đã kiểm chứng qua tra cứu web, 12/08/2026)

- **ftrack Studio** — $25/người/tháng trả theo năm, $30/người/tháng trả theo tháng; là sản phẩm của Backlight. [g2.com/products/ftrack/pricing](https://www.g2.com/products/ftrack/pricing) · [ftrack.com/en/pricing](https://www.ftrack.com/en/pricing)
- **Frame.io** — gói Free 2 thành viên; Pro $15/thành viên/tháng tới 5 người; Team $25/thành viên/tháng tới 15 người; có comment và annotate, quản lý phiên bản. [g2.com/products/frame-io/pricing](https://www.g2.com/products/frame-io/pricing) · [frame.io/pricing](https://frame.io/pricing)
- **Kitsu / CGWire** — mã nguồn mở AGPL-3.0, tự vận hành miễn phí, khoảng 200 studio đang tự vận hành; CGWire là công ty độc lập 5 người tại Paris. [cg-wire.com](https://www.cg-wire.com/) · [cg-wire.com/self-hosted](https://www.cg-wire.com/self-hosted/) · [kitsu.cg-wire.com/installation](https://kitsu.cg-wire.com/installation/)
- **OpenAssetIO** — dự án của Academy Software Foundation ở giai đoạn sandbox; chuẩn liên thông giữa ứng dụng DCC và hệ quản lý asset; có đóng góp thiết kế từ DNEG, Pixar, Blizzard Entertainment, Blender Foundation. [aswf.io](https://www.aswf.io/news/openassetio-forms-as-sandbox-project-at-academy-software-foundation/) · [foundry.com](https://www.foundry.com/news-and-awards/openassetio-accepted-in-aswf-new-project-framework)
- **Perforce P4 / Helix Core** — miễn phí tới 5 người dùng và 20 workspace; khóa tệp độc quyền và nén theo phiên bản cho tệp nhị phân lớn. [perforce.com/products/helix-core/free-version-control](https://www.perforce.com/products/helix-core/free-version-control)
- **Autodesk Flow Production Tracking (ShotGrid)** — đổi tên từ ShotGrid tháng 3/2024; **Autodesk không công bố giá theo người/tháng**, bán theo báo giá riêng. [autodesk.com/products/flow-production-tracking](https://www.autodesk.com/products/flow-production-tracking/overview)

### Cần kiểm chứng thêm trước khi trích dẫn trong hồ sơ thầu

- Giá và điều kiện license của **Signiant** / **IBM Aspera** (DAM-12) — chưa tra cứu.
- Chi tiết tính năng của **Prism Pipeline** (DAM-08) và mức độ chi tiết của **Archivematica** về phiên bản (DAM-01).
- Danh sách cụ thể các thư viện/bảo tàng dùng **Mirador** và **IIIF** (DAM-06) — nêu chung chung trong báo cáo này, cần dẫn nguồn đích danh nếu đưa vào hồ sơ.
- Đơn giá người-ngày thực tế của đơn vị và tỷ giá VND/USD tại thời điểm ký hợp đồng.
- Giá thiết bị máy chủ worker GPU (DAM-07) và máy chạy job kiểm tra fixity (DAM-02) theo cấu hình thực tế.
