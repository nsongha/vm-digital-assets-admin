# Audit 03 — Định dạng, bảo quản & siêu dữ liệu kỹ thuật cho 3D / splat / ảnh / AV

> Người thực hiện: subagent lăng kính media & bảo quản · Ngày: 12/08/2026

**Phạm vi:** báo cáo này KHÔNG lặp lại `docs/02-quy-trinh-bao-quan-sao-luu.md` (OAIS/PREMIS, quy tắc 3-2-1, lịch sao lưu, 4 kịch bản khôi phục, NDSA) và `docs/12-chat-luong-du-lieu.md` (ISO/IEC 25012). Báo cáo bổ sung đúng một lăng kính mà hai tài liệu đó chưa soi tới: **bản thân các tệp media nặng** — chọn định dạng nào làm gì, siêu dữ liệu kỹ thuật nào phải ghi để 20 năm sau còn dùng được, và dung lượng/chi phí thật khi 82 model UNESCO cùng ảnh nguồn đổ vào hệ thống.

**Quy ước dẫn chứng:** mọi khẳng định về hiện trạng phần mềm đều kèm `đường/dẫn:dòng`. Gốc tương đối: `/Users/songha/Documents/Projects/VM_Digital Assests_Admin/`. Số liệu dung lượng của bộ dữ liệu hiện tại được tính bằng cách nạp trực tiếp `app/src/data/assets.ts` và cộng `sizeMB` — không ước lượng bằng mắt.

---

## 1. Tóm tắt điều hành

Nhìn từ lăng kính bảo quản định dạng, hồ sơ này **mạnh bất thường ở phần chính sách và yếu đúng ở phần vật chất**. Tài liệu 02 đã có kiến trúc 3 tầng, PREMIS, fixity, lịch rà soát định dạng 2 năm/lần; ADR 0008 còn tách hẳn `hasPreservationSurrogate` khỏi `derivedFrom` — một mức độ tinh tế hiếm thấy trong hồ sơ thầu Việt Nam. Nhưng khi soi xuống tầng tệp, chín khoảng cách sau đây đủ nghiêm trọng để làm hỏng lời hứa đó.

**1. Không có tầng "bản bảo quản" (archival) — chỉ có master và web, và hai bản đó cùng một đuôi tệp.**
`app/src/data/digitization.ts:330-334` sinh đúng ba vai trò `master` / `web` / `raw`. Vai trò `master` và `web` đều lấy `ext[0]` — nghĩa là bản gốc và bản web của một mesh **đều là `.glb`**, của một splat **đều là `.splat`**. Mô hình bảo quản chuẩn cần **ba** thứ khác nhau: bản gốc bất biến đúng như thiết bị/phần mềm sinh ra, bản bảo quản ở chuẩn mở đã chuẩn hoá, và bản phục vụ web đã nén mạnh. Hiện app chỉ có hai, và cái ở giữa — cái quan trọng nhất cho tuổi thọ 20 năm — đang thiếu.

**2. Sự kiện lớn nhất của năm 2026 trong lĩnh vực này chưa được phản ánh: Gaussian splat đã có chuẩn mở.**
Khronos công bố `KHR_gaussian_splatting` — phần mở rộng glTF 2.0 cho Gaussian splatting — ngày **03/02/2026**. Trạng thái **Release Candidate** — **chưa phê chuẩn**, đã kiểm chứng lại trực tiếp trên kho glTF của Khronos ngày 12/08/2026 (mốc dự kiến phê chuẩn Q2/2026 nêu trong thông cáo đã trôi qua mà chưa thành; xem hộp kiểm chứng ở mục 3.2 để biết câu chữ bắt buộc dùng trong hồ sơ). Trong khi đó `docs/02-quy-trinh-bao-quan-sao-luu.md:265` và ADR `docs/adr/0008-tach-haspreservationsurrogate-khoi-derivedfrom.md:49-50` vẫn viết ".splat chưa có chuẩn hoá ISO/OGC chính thức" và loại bỏ phương án chờ chuẩn vì "không có mốc thời gian xác định cho việc chuẩn hóa". Quyết định của ADR 0008 vẫn đúng, nhưng **căn cứ của nó đã hết hạn** — cần một ADR bổ sung, nếu không hội đồng chấm thầu có thể bắt lỗi tài liệu lạc hậu ngay trong tháng nộp.

**3. Bản point cloud PLY/E57 KHÔNG phải là bản bảo hiểm đầy đủ cho splat — nó chỉ cứu được hình học, không cứu được diện mạo.**
`app/src/data/digitization.ts:390` khẳng định bản đám mây điểm là "dữ liệu DUY NHẤT phục hồi được nội dung". Về mặt toán học điều này không đúng: một Gaussian splat lưu vị trí + hiệp phương sai dị hướng (scale + quaternion) + độ đục + hệ số điều hoà cầu (spherical harmonics) mô tả màu **phụ thuộc góc nhìn**. Ép về point cloud là vứt bỏ toàn bộ SH bậc ≥ 1, độ đục và hình dạng ellipsoid — giữ lại xương, mất da. Đường phục hồi thật sự duy nhất là **ảnh nguồn + tham số camera (pose) + phiên bản phần mềm huấn luyện**. Đây là điểm phải sửa cả trong ADR 0008 lẫn trong văn bản hiển thị trên UI.

**4. Ảnh nguồn photogrammetry — thứ đắt nhất và không tái tạo được — không tồn tại trong mô hình dữ liệu.**
`app/src/services/types.ts:49-99` cho thấy `Asset` có đúng một `fmt: string`, một `size`, một `sizeMB`. Không có mảng `files[]`, không có manifest. Thực tế nhiều tệp bị nhét vào một chuỗi: `fmt: 'GLB + E57'` (`app/src/data/objects/artifacts.ts:35`), `fmt: 'PLY / SPLAT'` (`app/src/data/objects/structures.ts:28`). Ba dòng tệp hiển thị ở màn Chi tiết là **sinh tại chỗ lúc render**, không lưu (`app/src/data/digitization.ts:326-356`), và dòng `raw` được ước lượng chỉ bằng **1,3–2,2 lần** bản master (`app/src/data/digitization.ts:318-321`). Với 320 ảnh RAW 60 MB/ảnh cho một con rùa, tỉ lệ thật là khoảng **70–80 lần**, không phải 2 lần. Mục 6 định lượng hệ quả: sai số dung lượng khoảng **một bậc rưỡi**.

**5. `fmt` là chuỗi tự do — không thể chạy giám sát lỗi thời định dạng.**
`app/src/services/types.ts:63` khai báo `fmt: string`. Bộ dữ liệu hiện có 16 giá trị rời rạc, không nhất quán: `'GLB'` / `'GLB + E57'` / `'GLB · stream'`, `'TIFF'` / `'TIFF 600dpi'`, `'SPLAT'` / `'PLY / SPLAT'`. Tài liệu 02 mục 7.3 hứa rà soát định dạng 2 năm/lần và mục 10 đặt mục tiêu NDSA Level 4 là "công cụ giám sát lỗi thời tự động (dạng PRONOM)". Không thể làm được điều đó trên một trường chuỗi tự do. Cần từ vựng có kiểm soát gắn PUID.

**6. Không có một trường siêu dữ liệu kỹ thuật 3D nào được lưu.**
Thiết bị chụp/quét, độ phân giải hình học (mm), độ chính xác/RMSE, hệ toạ độ và tỉ lệ thực, hiệu chuẩn màu (color chart/ICC), phần mềm + phiên bản — **không trường nào tồn tại** trong `Asset`. Các cột này CÓ trong template CSV (`data/06-metadata/template-3d-mesh.csv`, `template-splat.csv`) và có trong placeholder biểu mẫu (`app/src/data/metadataFields.ts:10-11,18-19`), nhưng không có đích đến trong mô hình dữ liệu. `physicalSpecs.ts:198` khai báo `vn2000` rồi không file dữ liệu nào điền. Đây là khoảng cách so với Smithsonian DPO, CARARE/3D-ICONS và ADS Guides to Good Practice.

**7. Kiểm tra tệp khi tải lên hoàn toàn không tồn tại — nhưng giao diện nói là có.**
`app/src/i18n/vi.ts:41` hiển thị cho người dùng: "Hệ thống kiểm tra định dạng, độ phân giải và checksum trước khi đưa tệp vào hàng đợi xử lý." Thực tế `app/src/services/mock/uploadService.ts:43-50` — hàm `addUpload()` **không nhận tham số nào**, gán cứng tên `vm_3d_0N_scan.glb` và kích thước `'1,1 GB'`. `ACCEPT_FORMATS` và `ACCEPT_LIMIT` (`app/src/data/metadataFields.ts:38-50`) chỉ được vẽ thành chip (`app/src/pages/UploadPage.tsx:169-176`), không có thuộc tính `accept=`, không so sánh MIME, không so với hạn mức. Thông báo lỗi độ phân giải duy nhất trong sản phẩm là một chuỗi tĩnh trong dữ liệu mẫu (`app/src/data/uploads.ts:8`). Với hồ sơ thầu, một câu khẳng định năng lực không có gì đỡ phía sau là rủi ro cần xử lý dứt điểm — hoặc làm, hoặc sửa câu chữ.

**8. Ba công thức dung lượng sai lệch có hệ thống, một trong đó mâu thuẫn với chính app.**
- `splatSizeMB` dùng 190 byte/Gaussian (`app/src/data/sizeFormulas.ts:34-37`); PLY 3DGS chính tắc là **248 byte** (62 × float32) — thiếu **~24%**.
- `wavSizeMB` dùng 11,5 MB/phút = 48 kHz/**16-bit** stereo (`app/src/data/sizeFormulas.ts:44-47`), trong khi template metadata của chính dự án ghi "WAV 48kHz **24-bit**" (`data/06-metadata/template-media.csv`) = 17,3 MB/phút — thiếu **50%**.
- `tiffPhotoSizeMB` dùng 30 MB/megapixel (`app/src/data/sizeFormulas.ts:70-73`), trong khi `tiffA4SizeMB` của cùng file suy ra ~2,9 MB/megapixel (100 MB cho A4 600dpi ≈ 34,8 MP). Hai công thức TIFF trong cùng một file lệch nhau **hơn 10 lần**.

**9. Ước lượng dung lượng toàn hệ thống thấp hơn thực tế khoảng 50 lần.**
Bộ dữ liệu hiện tại tổng **127,4 GB** cho 153 bản ghi; riêng 82 rùa là **22,5 GB** (trung bình 275 MB/con). Mô hình thực tế ở Mục 6 cho ra khoảng **7 TB** cho một bản AIP giai đoạn 1. Con số 275 MB không phải là bản gốc lưu trữ của một hiện vật UNESCO — nó cỡ một bản web. Màn "Sao lưu & khôi phục" đang trình bày dung lượng tầng AIP bằng chính con số này (`app/src/pages/BackupPage.tsx:528`), nên toàn bộ phần trình bày quy mô hạ tầng trước hội đồng đang dựa trên một cơ số sai.

### Xếp hạng rủi ro

| # | Khoảng cách | Mức | Sửa được trong demo thầu? |
|---|---|---|---|
| 3 | Point cloud không cứu được splat; đường phục hồi thật là ảnh nguồn | **Nghiêm trọng** | Có — sửa văn bản + thêm trường |
| 4 | Ảnh nguồn photogrammetry không có trong mô hình dữ liệu | **Nghiêm trọng** | Có — mock được |
| 9 | Cơ số dung lượng sai ~50× → sai toàn bộ quy mô hạ tầng | **Nghiêm trọng** | Có — sửa hằng số |
| 1 | Thiếu tầng bản bảo quản (archival) | **Cao** | Có — mock được |
| 2 | ADR 0008 / doc 02 lạc hậu so với KHR_gaussian_splatting | **Cao** | Có — viết ADR |
| 6 | Không có siêu dữ liệu kỹ thuật 3D | **Cao** | Có — mock được |
| 7 | UI khẳng định có kiểm tra tệp nhưng không có | **Cao** | Có — sửa câu chữ ngay; làm thật cần backend |
| 5 | `fmt` chuỗi tự do, không giám sát lỗi thời được | Trung bình | Có — mock được |
| 8 | Ba công thức dung lượng lệch | Trung bình | Có — sửa hằng số |

**Điểm đáng giữ nguyên và nên khoe:** tách `hasPreservationSurrogate` khỏi `derivedFrom` (ADR 0008) là một quyết định đúng và tinh tế; bảng Tệp tin có checksum + trạng thái fixity + tầng lưu trữ ở mức bản ghi (`app/src/pages/AssetDetailPage.tsx:600-635`) là thứ rất nhiều CMS di sản không có; chặn tải bản gốc trước khi xuất bản (`app/src/data/digitization.ts:358-360`) đúng thực hành. Các đề xuất dưới đây **mở rộng** chứ không thay thế những điều này.

---

## 2. Ma trận định dạng khuyến nghị

Nguyên tắc chi phối toàn bảng: **ba bản sao có ba nghĩa vụ khác nhau, không được gộp.**

- **Master (gốc bất biến)** — đúng như thiết bị/phần mềm sinh ra, không tối ưu, không decimate, không đổi container. Nghĩa vụ: chứng cứ gốc, không bao giờ xoá, không bao giờ ghi đè.
- **Bản bảo quản (archival)** — chuyển sang **chuẩn mở đã được một tổ chức chuẩn hoá phát hành**, không nén mất mát. Nghĩa vụ: là bản còn đọc được sau 20 năm khi phần mềm gốc đã chết. **Đây là tầng app hiện thiếu hoàn toàn.**
- **Bản phục vụ web (derivative)** — nén mạnh, tối ưu tốc độ. Nghĩa vụ: không có — xoá thoải mái, tái sinh từ hai bản trên bất cứ lúc nào.

| Loại dữ liệu | Master (gốc bất biến) | Bản bảo quản (chuẩn mở) | Bản phục vụ/web | App hiện chấp nhận gì | Khoảng cách |
|---|---|---|---|---|---|
| **Mesh 3D** (82 rùa, công trình) | Đầu ra mật độ đầy đủ của phần mềm tái dựng: PLY/OBJ nhị phân + texture 16K (PNG/TIFF). Không decimate | **glTF 2.0 / GLB** — ISO/IEC 12113:2022; texture nhúng không nén mất mát. Kèm **PLY nhị phân** làm bản thứ hai khác container | GLB + `KHR_draco_mesh_compression` + `KHR_texture_basisu` (KTX2/Basis) | `GLB`, `OBJ`, `E57`, `PLY` (`app/src/data/metadataFields.ts:39`); giá trị thật: `GLB`, `OBJ`, `GLB + E57` | Master và web **cùng đuôi `.glb`** (`digitization.ts:331-332`); không có tầng bảo quản riêng; **không có Draco/KTX2 ở bất kỳ đâu** trong mã nguồn; OBJ không tự chứa (xem 2.3) |
| **Point cloud** | E57 gốc từ máy quét — **ASTM E2807-11(2019)** | **E57** (chính nó là chuẩn mở); thêm **LAS/LAZ** khi có toạ độ địa lý | 3D Tiles (OGC) hoặc Potree | `E57`, `PLY` (2 bản ghi `fmt: 'E57'`) | E57 đang bị gán nhãn **"Dữ liệu thô"** ở tầng lạnh (`digitization.ts:333`, `ext[1]` của `mesh3d` = `'e57'`) — **sai vai trò**: E57 là bản bảo quản, không phải dữ liệu thô |
| **Gaussian splat** | **PLY 3DGS full-SH bậc 3, không nén** + data dictionary mô tả thứ tự thuộc tính | **GLB + `KHR_gaussian_splatting`** (Khronos, RC 02/2026 — xem 3.2) | **SPZ** (Niantic Spatial) hoặc **SOG** (PlayCanvas) | `SPLAT`, `PLY`, `ZIP ảnh nguồn` (`metadataFields.ts:40`); giá trị thật: `SPLAT` (12 bản ghi), `PLY / SPLAT` (2) | 12/14 bản ghi coi `.splat` — định dạng **mất SH bậc cao** — là master; chưa có tầng chuẩn mở; xem toàn bộ mục 3 |
| **Ảnh tư liệu** | TIFF không nén (hoặc LZW), 16-bit khi nguồn cho phép, **ICC profile nhúng**, color chart trong khung hình. Chụp lại bằng máy ảnh: RAW gốc + **DNG** | **TIFF** (chính nó là bản bảo quản) | JPEG 2000 (ISO/IEC 15444-1) cho deep zoom IIIF; hoặc JPEG/WebP | `TIFF` (9), `JPEG` (3) | **Không có trường ICC/hiệu chuẩn màu ở bất kỳ đâu**; `tiffPhotoSizeMB` = 30 MB/MP lệch >10× so với chính `tiffA4SizeMB` cùng file (`sizeFormulas.ts:55-73`); seed chỉ 3–8 MP — thấp hơn nhiều mức số hóa bảo quản |
| **Bản dập & tài liệu Hán Nôm** | TIFF 600dpi không nén + thước tỉ lệ + color chart trong khung hình | **TIFF**; thêm **PDF/A-2** hoặc **PDF/A-3** (ISO 19005) cho tài liệu nhiều trang có lớp văn bản | JPEG 2000 / IIIF | `TIFF 600dpi`, `PDF/A`, `JP2` (`metadataFields.ts:41`) | `PDF/A` không ghi rõ **phần mấy** (A-1/A-2/A-3/A-4 khác nhau về khả năng nhúng); không có trường thước tỉ lệ/color chart; chuỗi xuất xứ 3 cấp (bia đá → bản dập giấy → ảnh số) chưa được ghi (xem 2.4) |
| **Bản vẽ kỹ thuật** | DWG gốc từ đơn vị đo vẽ | **PDF/A** + **DXF**; nếu là mô hình BIM thì **IFC** | SVG / PDF | `DWG` (2 bản ghi) | **DWG là định dạng độc quyền Autodesk** — mâu thuẫn trực tiếp với nguyên tắc "ưu tiên định dạng mở" của `docs/02:318`; không có bản DXF/PDF/A kèm |
| **Video** | *Born-digital:* giữ nguyên bản gốc máy quay (ProRes 422 HQ, XAVC…). *Số hóa từ băng/phim analogue:* **FFV1 trong Matroska**, không nén mất mát | **FFV1 (RFC 9043) trong Matroska (RFC 9559)** | H.264/H.265 trong MP4 | `ProRes 4K` (3 bản ghi) | **Không phân biệt born-digital với số hóa analogue** — đây là phân biệt quyết định (xem 2.5); không có FFV1/MKV ở bất kỳ đâu |
| **Audio** | **BWF** (Broadcast Wave, có khối `bext`) 48 kHz/24-bit tối thiểu; số hóa từ băng analogue: 96 kHz/24-bit | **BWF/WAV** (chính nó); FLAC nếu cần nén không mất dữ liệu | MP3 / AAC / Opus | `WAV 48kHz` (3 bản ghi) | Công thức 11,5 MB/phút ứng với **16-bit** (`sizeFormulas.ts:44-47`) trong khi template dự án ghi **24-bit** (`data/06-metadata/template-media.csv`) — thiếu 50%; nên chỉ định **BWF** thay vì WAV trần để có khối metadata |
| **Dữ liệu thô photogrammetry** | **Toàn bộ ảnh nguồn RAW** (CR3/NEF/ARW) + project file (RealityCapture/Postshot) + tham số camera/pose | **DNG** (đặc tả công khai) + sidecar pose/tham số dạng văn bản mở | Không phát hành | Chỉ là một chip chữ `ZIP ảnh nguồn` (`metadataFields.ts:40`) — **không bản ghi nào, không vai trò tệp nào** | **Khoảng cách lớn nhất toàn hệ thống**: nguyên liệu tái tạo duy nhất không tồn tại trong mô hình dữ liệu (xem FMT-02) |

### 2.1. Ba tầng, không phải hai — điều app đang thiếu

`app/src/data/digitization.ts:330-334` sinh đúng ba vai trò `master` / `web` / `raw`, nhưng chúng **không** ánh xạ vào ba tầng bảo quản ở trên:

| Vai trò trong app | Đuôi tệp | Tầng lưu trữ | Vai trò bảo quản đúng phải là |
|---|---|---|---|
| `master` | `ext[0]` (glb / splat / tiff / wav…) | AIP hoặc COLD | ✅ Master — đúng |
| `web` | **`ext[0]` — trùng master** | HOT | ⚠️ Phải là định dạng nén khác hẳn (GLB+Draco+KTX2, SPZ, JPEG2000) |
| `raw` | `ext[1]` (e57 / ply / mp4 / mp3…) | COLD | ❌ Đang trộn lẫn hai thứ khác nhau: E57/PLY là **bản bảo quản**, còn "dữ liệu thô" đúng nghĩa (ảnh nguồn RAW) thì không có |

Nói cách khác: app có ba dòng tệp nhưng **thiếu tầng bảo quản** và **thiếu tầng nguyên liệu**, đồng thời **nhân đôi tầng master** dưới tên "web". Đề xuất FMT-01 sửa đúng chỗ này.

### 2.2. Vì sao loại FBX

FBX là định dạng độc quyền của Autodesk, đặc tả nhị phân không công bố đầy đủ, khả năng đọc phụ thuộc SDK của một hãng. Với dữ liệu di sản quốc gia phải self-host và lưu 20+ năm, FBX không đạt tiêu chí "chuẩn mở" của chính `docs/02:318`. App **không** chấp nhận FBX — đây là một quyết định đúng đã có sẵn, nên **nói rõ ra trong thuyết minh** như một điểm cộng thay vì để nó ngầm định. Tương tự, `DWG` đang có mặt (2 bản ghi) lại là ngoại lệ chưa được biện minh.

### 2.3. Cái bẫy OBJ: định dạng không tự chứa

`fmt: 'OBJ'` xuất hiện ở 5 bản ghi. Một mesh OBJ **không phải một tệp** — nó luôn là một bộ: `.obj` (hình học) + `.mtl` (định nghĩa vật liệu) + N tệp texture (`.png`/`.jpg`/`.tif`). Thiếu `.mtl` thì mô hình mất toàn bộ vật liệu; thiếu texture thì mất bề mặt — **và checksum của `.obj` vẫn khớp hoàn hảo**, nên fixity check không bao giờ báo động.

Mô hình dữ liệu hiện tại (`app/src/services/types.ts:63-66`: một `fmt`, một `size`, một `sizeMB`, không có `files[]`) **về nguyên tắc không biểu diễn được** một tài sản nhiều tệp. Đây là lý do kỹ thuật khiến FMT-03 (manifest tệp) là điều kiện cần cho gần như mọi đề xuất khác.

### 2.4. Bản dập Hán Nôm: chuỗi xuất xứ ba cấp

Bản dập (rubbing) là một trường hợp đặc thù mà chuẩn ảnh thông thường không phủ: **bản thân nó đã là một bản sao của hiện vật**. Chuỗi là *bia đá → bản dập trên giấy dó → ảnh số của bản dập*. Nghĩa là:

- Metadata phải phân biệt **niên đại của bia** với **niên đại của lần dập** với **ngày số hóa** — ba mốc thời gian khác nhau, hiện `Asset.era` chỉ có một (`app/src/services/types.ts:67-68`);
- Phải ghi **kỹ thuật dập** và **tình trạng bản dập** (rách, mất góc, mực loang) tách khỏi tình trạng bia gốc;
- Bắt buộc có **thước tỉ lệ trong khung hình** — vì bản dập giấy co giãn theo độ ẩm, kích thước ảnh không suy ra được kích thước bia.

Điểm tốt: app đã có quan hệ `hasRubbing` (`app/src/services/types.ts:41`, `app/src/data/digitization.ts:400`) — đúng hướng, chỉ còn thiếu các trường kỹ thuật đi kèm.

### 2.5. Video: born-digital và số hóa analogue là hai bài toán khác nhau

Đây là chỗ dễ ra khuyến nghị sai nhất, nên nói rõ:

- **Phim tư liệu quay mới (born-digital)** — máy quay đã xuất ProRes 422 HQ. Giữ **chính tệp đó** làm master là đúng thực hành. Ép sang FFV1 sẽ **làm tệp to lên khoảng 3 lần** (FFV1 nén không mất dữ liệu trên luồng đã giải nén 10-bit 4:2:2, trong khi ProRes đã nén có mất dữ liệu) mà **không phục hồi được thông tin đã mất**. Chuyển đổi này lỗ hoàn toàn.
- **Phim/băng tư liệu cũ đem số hóa** — tín hiệu vào là analogue, phải bắt ở dạng không nén hoặc lossless. Đây mới đúng là chỗ **FFV1 (RFC 9043) trong Matroska (RFC 9559)** được thiết kế cho, và là khuyến nghị chuẩn của giới lưu trữ nghe nhìn.

App hiện chỉ có một nhãn `ProRes 4K` cho cả hai trường hợp, và `physicalSpecs.ts:179` có trường `vatMangTinGoc` ("Phim kính · băng từ · sinh ra ở dạng số") — tức mô hình **đã biết** phân biệt này ở tầng hiện vật nhưng **chưa dùng** nó để quyết định định dạng bảo quản.

---

## 3. Rủi ro riêng của Gaussian splatting — phân tích và phương án phòng vệ

Đây là mục quan trọng nhất của báo cáo. Lý do: 82 model rùa là dữ liệu quý nhất nhưng lại nằm ở định dạng ÍT rủi ro nhất (mesh 3D đã có chuẩn ổn định hơn 10 năm); còn Giếng Thiên Quang và các không gian kiến trúc lại nằm ở định dạng RỦI RO NHẤT. Nghịch lý này cần được quản lý tường minh chứ không bằng một dòng ghi chú.

### 3.1. Bản chất rủi ro: Gaussian splat không phải "một định dạng"

3D Gaussian Splatting công bố năm 2023 (Kerbl et al., SIGGRAPH 2023). Chỉ ba năm sau đã có ít nhất bảy cách đóng gói dữ liệu khác nhau đang lưu hành song song:

| Cách đóng gói | Bản chất | Vai trò thực tế | Rủi ro bảo quản |
|---|---|---|---|
| **PLY "3DGS"** (quy ước INRIA) | Container PLY, thuộc tính `x,y,z`, `nx,ny,nz`, `f_dc_0..2`, `f_rest_0..44`, `opacity`, `scale_0..2`, `rot_0..3` | Đầu ra chuẩn của hầu hết công cụ huấn luyện | **Thấp nhất** trong nhóm splat — PLY là container mở, tự mô tả header, có thể viết lại parser |
| **`.splat`** | Nhị phân đóng gói chặt, ~32 byte/Gaussian, cắt SH về bậc 0 | Xem trên web | **Rất cao** — mất SH bậc cao, không có đặc tả chuẩn hoá |
| **`.ksplat`** | Biến thể nhị phân của một thư viện viewer | Xem trên web | **Rất cao** — gắn chặt một thư viện |
| **SPZ** (Niantic Spatial) | Cột hoá + lượng tử hoá + gzip, ~1/10 kích thước PLY | Trao đổi/phân phối nén | Trung bình — mã nguồn mở, đặc tả công khai |
| **SOG** (PlayCanvas, Spatially Ordered Gaussians) | Sắp thứ tự Morton, "GPU-ready", nén hơn compressed PLY ~2–3× | Streaming web | Trung bình — đặc tả đã mở |
| **Compressed PLY** | PLY lượng tử hoá | Trung gian | Trung bình |
| **L-GSC** (Qualcomm) | Nén, dự kiến làm extension đi kèm chuẩn Khronos | Phân phối | Chưa đánh giá được |

Ba hệ quả vận hành rút ra:

**(a) Chữ ".ply" trong dự án này đang mang hai nghĩa hoàn toàn khác nhau — và đó là một cái bẫy.**
`data/README.md:15` ghi `02-splat/ Gaussian splat (.ply, .splat)`, còn `data/06-metadata/template-splat.csv` ghi tên tệp `gieng_thien_quang.ply` cho bản splat và `gieng_thien_quang_pointcloud.ply` cho bản bảo hiểm. **Hai tệp cùng đuôi `.ply` nhưng là hai loại dữ liệu khác hẳn nhau.** Một cán bộ (hoặc một script) 10 năm sau mở `gieng_thien_quang.ply` bằng CloudCompare/MeshLab sẽ thấy một đám mây điểm **xám hoặc đen** — vì màu nằm trong `f_dc_*`/`f_rest_*` chứ không nằm ở thuộc tính `red/green/blue` mà phần mềm point cloud tìm. Kết luận sai gần như chắc chắn sẽ là "tệp hỏng". Đây là kịch bản mất dữ liệu **do hiểu nhầm**, không phải do bit rot — và fixity check không bao giờ phát hiện được nó vì checksum vẫn khớp.

**(b) Thứ tự hệ số SH là quy ước, không phải chuẩn.** 45 hệ số `f_rest_*` có thể được ghi theo thứ tự channel-major (toàn bộ hệ số của kênh R, rồi G, rồi B) hoặc coefficient-major. Đọc sai quy ước không làm tệp lỗi — nó làm màu loang, và người đọc sẽ tưởng mô hình bị hỏng. Quy ước này **phải được ghi vào metadata**, không thể suy ra từ tệp.

**(c) Không có công cụ đọc splat nào trong ứng dụng hiện tại.** `app/src/components/StelePreview.tsx` dựng hình bằng primitive thủ tục (`BoxGeometry`, `SphereGeometry` — dòng 45–66); không có `GLTFLoader`, `PLYLoader` hay bất kỳ loader nào trong toàn bộ mã nguồn. Splat rơi vào nhánh placeholder chữ (`app/src/pages/AssetDetailPage.tsx:61-65`, `:227-235`). Điều này chấp nhận được cho demo thầu nhưng cần nói rõ là mô phỏng.

### 3.2. Điều đã thay đổi trong năm 2026: Gaussian splat đã bước vào chuẩn mở

Ngày **03/02/2026**, Khronos Group công bố phần mở rộng **`KHR_gaussian_splatting`** cho glTF 2.0. Trạng thái hiện tại: **Release Candidate**; phê chuẩn dự kiến **quý 2/2026**. Đơn vị đóng góp gồm Autodesk, Cesium/Bentley Systems, Esri, Huawei, Niantic Spatial, NVIDIA, XGRIDS; các ứng dụng áp dụng sớm gồm CesiumJS, Esri ArcGIS, Scaniverse (Niantic Spatial) và XGRIDS Lixel Cybercolor.

> **Nguồn của khẳng định này** (truy cập 12/08/2026 — đây là khẳng định then chốt của cả báo cáo nên dẫn nguồn gốc tại chỗ, không chỉ ở mục 9):
> 1. Thông cáo báo chí Khronos, "Khronos Announces glTF Gaussian Splatting Extension", Beaverton OR, 03/02/2026 — <https://www.khronos.org/news/press/gltf-gaussian-splatting-press-release> (nguồn của: ngày công bố, trạng thái Release Candidate, mốc phê chuẩn dự kiến Q2/2026, danh sách đơn vị đóng góp và ứng dụng áp dụng sớm, việc nhắc tới SPZ và L-GSC như hai hướng nén).
> 2. Đặc tả kỹ thuật trong kho glTF chính thức của Khronos — <https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_gaussian_splatting/README.md> (nguồn của: dòng `Status: Release Candidate`, tên đầy đủ các attribute semantic, ràng buộc `mode` = `POINTS` (0), quy tắc SH bậc 0–3).
>
> Nếu tại thời điểm nộp hồ sơ hai nguồn trên đã đổi trạng thái, phải cập nhật câu chữ tương ứng — xem cảnh báo ngay dưới đây.

Nội dung kỹ thuật đáng chú ý cho mục đích bảo quản:

- Splat được lưu như **mesh primitive với `mode` = `POINTS` (0)**;
- Thuộc tính: `POSITION` (của glTF lõi) cộng với `KHR_gaussian_splatting:ROTATION`, `:SCALE`, `:OPACITY`, `:SH_DEGREE_0_COEF_0`, `:SH_DEGREE_1_COEF_[0-2]`, `:SH_DEGREE_2_COEF_[0-4]`, `:SH_DEGREE_3_COEF_[0-6]`;
- Hỗ trợ SH bậc 0–3; bậc 0 bắt buộc, bậc cao hơn tuỳ chọn nhưng phải có đủ các bậc thấp hơn. Tổng cộng 48 hệ số ở bậc 3 — **khớp chính xác với 3 + 45 hệ số của PLY 3DGS chính tắc**, nghĩa là chuyển đổi qua lại không mất mát;
- Đặc tả nêu rõ các extension nén **nên** mở rộng extension gốc này để giữ tương thích; SPZ (Niantic Spatial) và L-GSC (Qualcomm) được nhắc tới như hai hướng nén.

**Vì sao điều này quan trọng với bảo quản, chứ không chỉ với hiển thị:** một định dạng "đọc lại được sau 20 năm" không đòi hỏi phần mềm hôm nay còn sống. Nó đòi hỏi **một đặc tả công khai, đầy đủ ngữ nghĩa từng thuộc tính, do một tổ chức chuẩn hoá phát hành và lưu trữ**, để một lập trình viên tương lai viết lại được bộ đọc. Trước 02/2026, splat không có thứ đó. Từ 02/2026, splat có. Đây là thay đổi định tính, không phải cải tiến dần.

> ✅ **ĐÃ KIỂM CHỨNG LẠI — 12/08/2026, bởi điều phối viên audit.** Cảnh báo ban đầu của mục này (quý 2/2026 đã kết thúc, cần xác nhận trạng thái phê chuẩn) đã được xử lý bằng cách đọc trực tiếp đặc tả trong kho glTF chính thức của Khronos:
>
> - **Trạng thái hiện tại vẫn là `Release Candidate` — CHƯA phê chuẩn (not ratified).** Mốc "dự kiến phê chuẩn Q2/2026" nêu trong thông cáo 03/02/2026 đã trôi qua mà chưa thành hiện thực.
> - Danh sách đơn vị đóng góp xác nhận đúng: Cesium (Jason Sobotka, Renaud Keriven, Adam Morris, Sean Lilley), Niantic Spatial (Projit Bandyopadhyay, Daniel Knoblauch), Esri (Ronald Poirrier, Jean-Philippe Pons), Khronos (Alexey Knyazev), Nvidia (Nathan Morrical), Huawei (Norbert Nopper, Zehui Lin, Chenxi Tu), Autodesk (Michael Nikelsky), cùng hai đóng góp độc lập (Marco Hutter, Arseny Kapoulkine) — 16 người. Bản quyền ghi "Copyright 2026 The Khronos Group Inc."
>
> **Hệ quả bắt buộc với câu chữ trong hồ sơ thầu:** viết **"Release Candidate của Khronos, chưa phê chuẩn"**. TUYỆT ĐỐI không viết "đã là chuẩn Khronos" hay "chuẩn quốc tế đã ban hành" — đó là điểm mà một thành viên hội đồng có nền kỹ thuật tra 30 giây là bắt được, và nó phá hỏng độ tin cậy của toàn bộ phần bảo quản. Lập luận đúng và vẫn rất mạnh là: *đã có đặc tả công khai do tổ chức chuẩn hoá phát hành, đủ để viết lại bộ đọc trong tương lai* — luận điểm ở đoạn trên không phụ thuộc vào việc đã phê chuẩn hay chưa.
>
> Cần kiểm lại lần cuối ngay trước ngày nộp (trạng thái có thể đổi): <https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_gaussian_splatting/README.md>

### 3.3. Vì sao bản point cloud PLY/E57 không phải bản bảo hiểm đầy đủ

Đây là điểm cần sửa cả trong ADR 0008 lẫn trong văn bản hiển thị trên giao diện. Xét cấu trúc một Gaussian trong PLY 3DGS chính tắc:

| Thuộc tính | Số `float32` | Ý nghĩa | Point cloud giữ được? |
|---|---|---|---|
| `x, y, z` | 3 | Vị trí tâm | ✅ Giữ nguyên |
| `nx, ny, nz` | 3 | Pháp tuyến (thường bằng 0 trong 3DGS) | ✅ (không mang thông tin) |
| `f_dc_0..2` | 3 | SH bậc 0 — màu cơ sở, không phụ thuộc góc nhìn | ⚠️ Quy đổi được sang RGB |
| `f_rest_0..44` | 45 | SH bậc 1–3 — **màu thay đổi theo góc nhìn** | ❌ **Mất toàn bộ** |
| `opacity` | 1 | Độ đục | ❌ **Mất** |
| `scale_0..2` | 3 | Bán trục ellipsoid | ❌ **Mất** |
| `rot_0..3` | 4 | Quaternion định hướng ellipsoid | ❌ **Mất** |
| **Tổng** | **62** (= 248 byte) | | **Giữ 6/62 ≈ 10%** |

Nói bằng ngôn ngữ di sản: point cloud giữ được **hình học**, mất **diện mạo**. Cụ thể với Văn Miếu, những thứ bị mất chính là những thứ khiến người ta chọn splat ngay từ đầu:

- **Mặt nước Giếng Thiên Quang** — phản chiếu trời, mái đình, cây; toàn bộ hiệu ứng này nằm ở SH bậc cao. Point cloud sẽ cho một mặt phẳng màu bùn.
- **Sơn son thếp vàng** trên đồ thờ, hoành phi câu đối — độ óng ánh phụ thuộc góc nhìn.
- **Đá đã mài bóng** ở bia và bậc thềm — độ bóng specular.
- **Tán cây, không gian mở** — vốn là thứ mesh làm rất tệ và splat làm rất tốt.

Vì vậy `app/src/data/digitization.ts:390` — "Bản đám mây điểm (PLY/E57) đi kèm là dữ liệu **DUY NHẤT** phục hồi được nội dung nếu công cụ đọc .splat hiện tại ngừng được hỗ trợ" — là một khẳng định **quá mạnh và sai về kỹ thuật**. Nếu bị hội đồng có chuyên môn 3D chất vấn, đây là câu dễ bị bắt lỗi nhất trong toàn hồ sơ.

**Đường phục hồi thật sự duy nhất** khi mọi bộ đọc splat chết là: **ảnh nguồn + tham số camera (pose/sparse reconstruction) + phiên bản phần mềm huấn luyện + tham số huấn luyện**. Từ bộ đó, huấn luyện lại được — thậm chí bằng một thuật toán tốt hơn ra đời sau. Đây chính là nguyên tắc "giữ nguyên liệu, đừng chỉ giữ thành phẩm" mà giới bảo quản số áp dụng cho mọi dữ liệu dẫn xuất tính toán.

### 3.4. Phương án phòng vệ bốn tầng

Đề xuất thay thế mô hình "splat + 1 bản bảo hiểm point cloud" hiện tại bằng bốn tầng, mỗi tầng có nghĩa vụ bảo quản khác nhau:

| Tầng | Nội dung | Tầng lưu trữ | Xoá được? | Vai trò |
|---|---|---|---|---|
| **D1 — Nguyên liệu** | Toàn bộ ảnh nguồn (RAW + JPEG đã hiệu chỉnh), tham số camera/pose, project file (RealityCapture/Postshot), phiên bản phần mềm, tham số huấn luyện | AIP + lạnh | ❌ Không bao giờ | **Bảo hiểm thật** — tái tạo lại được từ số 0 |
| **D2 — Bản chính tắc** | PLY 3DGS full-SH bậc 3, **không nén**, kèm data dictionary mô tả thứ tự thuộc tính | AIP | ❌ Không | Bản gốc bất biến, đúng như phần mềm sinh ra |
| **D3 — Bản bảo quản** | GLB + `KHR_gaussian_splatting` (khi đã phê chuẩn), SH đầy đủ, không nén mất mát | AIP | ⚠️ Chỉ khi di trú sang chuẩn mới | **Bản chuẩn mở** — thứ đang thiếu hoàn toàn hiện nay |
| **D4 — Bản phục vụ** | SPZ hoặc SOG, SH giảm bậc nếu cần | Nóng | ✅ Tự do — tái sinh từ D2/D3 | Xem trên web |

Bản mesh/point cloud dẫn xuất **vẫn nên giữ**, nhưng phải **đổi tên vai trò**: không gọi là "bản dẫn xuất bảo hiểm" nữa mà là "**bản dẫn xuất hình học**" (geometric derivative) — hữu ích cho đo đạc, cho GIS, cho in 3D, nhưng không phải phương án phục hồi.

### 3.5. Phép thử tái tạo định kỳ (re-derivability drill)

Tài liệu 02 mục 5 đã có "diễn tập khôi phục hàng quý" cho **hạ tầng**. Đề xuất bổ sung một diễn tập song song cho **định dạng**, vì hai loại rủi ro này hoàn toàn khác nhau: diễn tập khôi phục chứng minh bản sao còn đọc được từ băng; phép thử tái tạo chứng minh **nội dung còn dựng lại được khi phần mềm chết**.

Nội dung mỗi 2 năm (trùng nhịp rà soát định dạng ở mục 7.3 tài liệu 02):

1. Chọn ngẫu nhiên 1 tài sản splat và 1 tài sản mesh trong nhóm UNESCO.
2. Trên một máy sạch, chỉ dùng gói D1 (ảnh nguồn + pose + tham số), huấn luyện/dựng lại mô hình.
3. So sánh với bản D2 gốc: số lượng Gaussian/số tam giác, sai số hình học, đánh giá thị giác có đối chứng.
4. Kết quả ghi thành **sự kiện PREMIS** gắn vào AIP, và ghi vào biên bản như diễn tập khôi phục.
5. **Không tái tạo được ⇒ gói bảo hiểm hỏng ⇒ mở phiếu việc số hóa bổ sung**, không chờ tới lần rà soát sau.

Đây là loại cam kết mà hội đồng chấm thầu hiếm khi thấy trong hồ sơ Việt Nam, và nó chứng minh đơn vị dự thầu hiểu bảo quản số ở mức vận hành chứ không chỉ mức khẩu hiệu.

### 3.6. Hệ quả với ADR 0008 và tài liệu 02

| Nội dung hiện tại | Đánh giá | Xử lý đề xuất |
|---|---|---|
| Tách `hasPreservationSurrogate` khỏi `derivedFrom` (ADR 0008, quyết định chính) | ✅ **Đúng, giữ nguyên** | Giữ; đây là điểm mạnh |
| "`.splat` chưa có chuẩn hoá ISO/OGC chính thức" (`docs/02:265`, ADR 0008:8-9) | ⚠️ Đúng chữ nhưng gây hiểu nhầm | Bổ sung: đã có chuẩn Khronos `KHR_gaussian_splatting` (RC 02/2026) |
| "Chờ `.splat` có chuẩn ISO chính thức mới xử lý — loại vì không có mốc thời gian xác định" (ADR 0008:49-50) | ❌ **Căn cứ đã hết hạn** | Viết ADR mới ghi nhận mốc 02/2026 và bổ sung tầng D3 |
| "Bản đám mây điểm là dữ liệu DUY NHẤT phục hồi được nội dung" (`digitization.ts:390`) | ❌ **Sai kỹ thuật** | Sửa thành: point cloud giữ hình học; phục hồi nội dung dựa vào ảnh nguồn |
| Bắt buộc giữ ảnh nguồn + tham số huấn luyện (ADR 0008:31) | ✅ Đúng chủ trương | Nhưng **chưa có chỗ lưu trong mô hình dữ liệu** — xem FMT-02 |


---

## 4. Siêu dữ liệu kỹ thuật bắt buộc cho từng loại

Nguyên tắc: siêu dữ liệu mô tả (tên, niên đại, vị trí) trả lời câu hỏi *"đây là cái gì"*; siêu dữ liệu **kỹ thuật/xuất xứ** trả lời câu hỏi *"con số này đáng tin đến đâu, và tôi dựng lại được không"*. Hồ sơ hiện đã rất mạnh ở nhóm thứ nhất (CIDOC-CRM E54, EDTF, mã 5 tầng, bộ mã khuyết giá trị) và gần như trống ở nhóm thứ hai.

Chú giải cột "App đã có chưa": ✅ có trường lưu thật · ⚠️ có một phần hoặc chỉ suy diễn lúc render · ❌ không tồn tại · 📄 có cột trong template CSV nhưng **không có đích đến** trong mô hình dữ liệu.

### 4.1. Nhóm chung — áp dụng cho mọi `digitalForm`

| Trường | Bắt buộc? | Chuẩn tham chiếu | App đã có chưa |
|---|---|---|---|
| Định dạng tệp theo từ vựng có kiểm soát + mã PUID | ✅ | PREMIS `formatDesignation`; PRONOM | ❌ `fmt: string` tự do (`app/src/services/types.ts:63`) |
| Kích thước byte chính xác | ✅ | PREMIS `size` | ⚠️ Chỉ `sizeMB` đã làm tròn (`types.ts:66`) |
| Giá trị checksum | ✅ | PREMIS `messageDigest` | ⚠️ Có, nhưng sinh ngẫu nhiên (`digitization.ts:300-306`) |
| **Tên thuật toán checksum** | ✅ | PREMIS `messageDigestAlgorithm` | ❌ Chỉ ghi "SHA-256" cứng trong tiêu đề bảng (`AssetDetailPage.tsx:609`) |
| Ngày tạo tệp (khác ngày cập nhật bản ghi) | ✅ | PREMIS `dateCreatedByApplication` | ⚠️ Chỉ có `updated` (`types.ts:76`) |
| **Phần mềm + phiên bản đã tạo tệp** | ✅ | PREMIS `creatingApplication` | ❌ |
| Vai trò bản sao (master / archival / web / raw) | ✅ | OAIS | ⚠️ Suy diễn lúc render, không lưu (`digitization.ts:330-334`) |
| Quan hệ dẫn xuất `derivedFrom` | ✅ | PREMIS `relationship` | ✅ Có khái niệm (ADR 0008) |
| Sự kiện bảo quản (ingest, fixity, di trú) | ✅ | PREMIS `Event` + `Agent` | ⚠️ Có trong tài liệu 02, chưa có cấu trúc trong app |

### 4.2. Mesh 3D / photogrammetry (82 rùa, công trình)

| Trường | Bắt buộc? | Chuẩn tham chiếu | App đã có chưa |
|---|---|---|---|
| Phương pháp thu nhận (photogrammetry / LiDAR / structured light) | ✅ | CARARE, 3D-ICONS, ADS Guides to Good Practice | ⚠️ Chỉ là placeholder biểu mẫu (`metadataFields.ts:10`) |
| Thiết bị thu nhận (hãng + model máy ảnh/máy quét) | ✅ | CARARE; Smithsonian DPO | ❌ |
| Ống kính + tiêu cự | ⚪ Nên có | CARARE | ❌ |
| Số ảnh chụp / số điểm quét | ✅ | 3D-ICONS | ⚠️ Placeholder (`metadataFields.ts:11`) · 📄 `template-3d-mesh.csv` |
| Số vị trí trạm quét | ⚪ Nên có | ADS | ❌ |
| **Độ phân giải hình học** (mm giữa hai đỉnh liền kề) | ✅ **Quan trọng nhất** | 3D-ICONS; ADS | ❌ · 📄 cột "Độ phân giải bề mặt (mm)" |
| Số tam giác / số đỉnh | ✅ | Smithsonian DPO | ❌ Chỉ dùng để tính dung lượng rồi bỏ (`objects/types.ts`, `sizeFormulas.ts:19`) |
| Độ phân giải texture (8K/16K) | ✅ | Smithsonian DPO | ❌ Chỉ dùng để tính dung lượng |
| **Độ chính xác / sai số căn chỉnh (RMS)** | ✅ | ADS; ASTM E57 | ❌ · 📄 cột "Sai số căn chỉnh (RMS)" |
| **Hệ toạ độ tham chiếu + tỉ lệ thực + đơn vị** | ✅ | ADS; OGC | ❌ · `physicalSpecs.ts:198` khai báo `vn2000` nhưng **không dữ liệu nào điền** |
| **Hiệu chuẩn màu** (color chart dùng, ICC profile) | ✅ | FADGI; Metamorfoze | ❌ **Không tồn tại ở bất kỳ đâu trong mã nguồn** |
| Phần mềm tái dựng + phiên bản | ✅ | PREMIS; 3D-ICONS | ❌ |
| **Xử lý sau khi tái dựng** (vá lỗ, decimate, làm mịn, tô màu bù) | ✅ | ADS — bắt buộc khai báo can thiệp | ❌ Chỉ nằm rải rác trong `desc` dạng văn xuôi |
| Người thực hiện | ✅ | Dublin Core `creator` | ✅ `owner` (`types.ts:75`) |
| Ngày thu nhận tại hiện trường | ✅ | Dublin Core | ⚠️ Chỉ `updated` |

> **Vì sao "xử lý sau" là bắt buộc, không phải tuỳ chọn:** một mô hình đã vá lỗ và làm mịn **không còn là chứng cứ nguyên trạng** của hiện vật — nó là một bản diễn giải. Với 82 bia Tiến sĩ đã được UNESCO ghi danh, sự khác biệt giữa "đây là bề mặt đá thật" và "đây là bề mặt đá đã được thuật toán nội suy" có ý nghĩa khoa học trực tiếp. `app/src/data/digitization.ts:201` đã có sẵn lý do tạo phiên bản "Vá lỗ hổng lưới (mesh) vùng đế sau kiểm định chất lượng" — tức nghiệp vụ **đã xảy ra** nhưng không được ghi thành trường có cấu trúc.

### 4.3. Gaussian splat — bổ sung trên nền 4.2

| Trường | Bắt buộc? | Chuẩn tham chiếu | App đã có chưa |
|---|---|---|---|
| Số lượng Gaussian | ✅ | — | ❌ Chỉ dùng tính dung lượng (`sizeFormulas.ts:35`) |
| **Bậc SH được lưu (0–3)** | ✅ | `KHR_gaussian_splatting` | ❌ |
| **Thứ tự hệ số SH** (channel-major / coefficient-major) | ✅ **Sống còn** | Quy ước triển khai — xem 3.1(b) | ❌ |
| Phần mềm huấn luyện + phiên bản | ✅ | PREMIS | ❌ · 📄 `template-splat.csv` có cột này |
| Số vòng lặp + tham số huấn luyện | ✅ | — | ❌ |
| **Mã gói ảnh nguồn D1 đi kèm** | ✅ | — | ❌ |
| Tham số camera / pose | ✅ | — | ❌ |
| Đã sinh bản GLB `KHR_gaussian_splatting` chưa | ✅ | Khronos | ❌ |
| Diện tích/thể tích cảnh quét | ⚪ | — | ⚠️ Placeholder (`metadataFields.ts:19`) |

### 4.4. Point cloud

Số điểm · mật độ điểm trung bình (điểm/m²) · có màu RGB không · có intensity không · số trạm quét · sai số ghép trạm · hệ toạ độ + đơn vị · thiết bị + phần mềm. **Hiện app có: 0/8.**

### 4.5. Ảnh tư liệu, bản dập và tài liệu Hán Nôm

| Trường | Bắt buộc? | Chuẩn tham chiếu | App đã có chưa |
|---|---|---|---|
| Độ phân giải quang học thật (ppi trên vật gốc) | ✅ | FADGI; Metamorfoze | ⚠️ Chỉ nằm trong chuỗi `fmt: 'TIFF 600dpi'` |
| Độ sâu bit + số kênh | ✅ | FADGI | ❌ |
| **Không gian màu + ICC profile nhúng** | ✅ | FADGI; Metamorfoze | ❌ |
| **Có color chart trong khung hình không** (và loại nào) | ✅ | FADGI; Metamorfoze | ❌ |
| **Có thước tỉ lệ trong khung hình không** | ✅ | FADGI | ❌ |
| Thiết bị (máy scan/máy ảnh) + phần mềm | ✅ | FADGI | ❌ |
| Mức tuân thủ tự đánh giá (FADGI sao / Metamorfoze) | ✅ | FADGI; Metamorfoze | ⚠️ Nêu trong `docs/02:130` như tiêu chí QC, không thành trường |
| Mặt được chụp (recto/verso) | ✅ | — | ⚠️ Chỉ nằm trong tên tệp (`template-tai-lieu-han-nom.csv`: `..._mat1.tif`) |
| Kỹ thuật dập & tình trạng bản dập (riêng bản dập) | ✅ | — | ❌ — xem 2.4 |
| Niên đại lần dập (khác niên đại bia) | ✅ | EDTF | ❌ `Asset.era` chỉ có một mốc (`types.ts:67`) |

### 4.6. Video & audio

Codec + profile · bitrate · độ phân giải & tỉ lệ khung hình · fps · không gian màu và lấy mẫu chroma · tần số lấy mẫu · độ sâu bit · số kênh · **nguồn born-digital hay số hóa analogue** · thiết bị phát băng gốc (khi số hóa analogue) · thiết bị thu. **Hiện app có: 0/12** — thông tin duy nhất là chuỗi `fmt: 'ProRes 4K'` / `'WAV 48kHz'`.

Điểm cần chú ý: `physicalSpecs.ts:179` đã có trường `vatMangTinGoc` với ví dụ "Phim kính · băng từ · sinh ra ở dạng số" — mô hình **đã phân biệt** born-digital với analogue ở tầng hiện vật, chỉ chưa nối xuống quyết định định dạng bảo quản (xem 2.5).

### 4.7. Tổng kết độ phủ

| Nhóm | Số trường khuyến nghị | App có trường lưu thật | Độ phủ |
|---|---|---|---|
| Chung (mọi loại) | 9 | 1 (+3 một phần) | ~11% |
| Mesh 3D / photogrammetry | 15 | 1 (+2 một phần) | ~7% |
| Gaussian splat (bổ sung) | 9 | 0 (+1 một phần) | ~0% |
| Point cloud | 8 | 0 | 0% |
| Ảnh & tài liệu 2D | 10 | 0 (+3 một phần) | 0% |
| Video & audio | 12 | 0 | 0% |
| **Tổng** | **63** | **2 trường lưu thật** | **~3%** |

Hai điều cần nói rõ về con số này:

1. **Đây không phải lỗi cẩu thả.** Template CSV trong `data/06-metadata/` cho thấy nhóm làm dự án **đã biết** cần những trường nào — `template-3d-mesh.csv` có đủ "Độ phân giải bề mặt (mm)", "Sai số căn chỉnh (RMS)", "Hệ tọa độ tham chiếu"; `template-splat.csv` có "Phần mềm huấn luyện + phiên bản". Vấn đề là **các cột đó không có đích đến**: `Asset` không có trường tương ứng, nên dữ liệu nhập vào sẽ rơi mất khi ingest.
2. **Phần lớn khoảng cách này vá được ngay trong demo thầu.** `app/src/data/digitization.ts` đã chứng minh kỹ thuật: hàng chục trường "làm giàu" (phiên bản, checksum, tầng lưu trữ, rights statement, chữ ký số) được **dẫn xuất tất định** từ `asset.code` bằng RNG có seed cố định, không cần thêm cột vào 153 bản ghi mock. Siêu dữ liệu kỹ thuật hoàn toàn có thể sinh theo đúng cơ chế đó — xem FMT-04.

---

## 5. Toàn vẹn dữ liệu & fixity — thuật toán, tần suất, quy mô tính toán

Tài liệu 02 mục 3–4 đã có quy trình fixity, tần suất theo nhóm và luồng xử lý khi lệch checksum. Mục này **không lặp lại** mà bổ sung ba thứ tài liệu đó chưa có: chọn thuật toán có lý do, **con số thời gian thực tế** để lịch kiểm tra khả thi, và ranh giới những gì fixity không bảo vệ được.

### 5.1. Hiện trạng trong mã nguồn

| Thành phần | Hiện trạng | Bằng chứng |
|---|---|---|
| Checksum ở màn Chi tiết | **Không phải hash** — sinh 64 ký tự hex bằng PRNG có seed | `app/src/data/digitization.ts:300-306` |
| Checksum ở màn Tải lên | SHA-256 **thật** qua `crypto.subtle`, nhưng băm chuỗi `id:tên:kích thước` chứ không băm nội dung tệp | `app/src/pages/UploadPage.tsx:23-28`, `:72` — chú thích dòng 21–22 tự thừa nhận |
| Trạng thái fixity | Gán bằng tung số ngẫu nhiên (5% lệch, 11% chưa kiểm tra) | `app/src/data/digitization.ts:339-343` |
| Tên thuật toán | Ghi cứng trong tiêu đề cột, không phải dữ liệu | `app/src/pages/AssetDetailPage.tsx:609` |
| KPI "% checksum hợp lệ" | Suy từ trạng thái pipeline, không từ kết quả fixity | `app/src/pages/BackupPage.tsx:111-113` |

Tất cả đều **chấp nhận được cho demo thầu** — không có backend thì không có tệp thật để băm. Điều **không** chấp nhận được là để hồ sơ ngầm hiểu đây là hệ thống fixity đang chạy. Cần một dòng ghi chú "mô phỏng" trên giao diện (FMT-09).

### 5.2. Chọn thuật toán

| Thuật toán | Đánh giá | Khuyến nghị |
|---|---|---|
| **MD5** | Đã vỡ về chống va chạm có chủ ý. Vẫn phát hiện được bit rot ngẫu nhiên, nhưng không chống được sửa đổi cố ý | Chỉ dùng để **đối chiếu với hệ cũ**, không bao giờ là giá trị pháp lý duy nhất |
| **SHA-1** | Đã vỡ (va chạm thực tế đã được công bố) | Không dùng cho dữ liệu mới |
| **SHA-256** | Chưa có tấn công thực tiễn; được mọi công cụ bảo quản hỗ trợ; có tăng tốc phần cứng (SHA-NI) trên CPU x86 hiện đại | ✅ **Giá trị chính ghi vào manifest AIP** |
| **SHA-512** | Nhanh hơn SHA-256 trên CPU 64-bit **không** có SHA-NI | Cân nhắc nếu phần cứng không hỗ trợ SHA-NI |
| **BLAKE3** | Rất nhanh, song song hoá tốt, cấu trúc cây cho phép xác minh từng phần tệp lớn. Nhưng hỗ trợ trong công cụ bảo quản chuyên dụng còn mỏng | ⚪ Tuỳ chọn làm "làn nhanh" để quét toàn kho thường xuyên, **không** thay SHA-256 trong manifest |

**Kết luận:** giữ **SHA-256 làm giá trị chuẩn** — đúng như tài liệu 02 đã chọn. Bổ sung hai điều tài liệu 02 chưa nói: (a) **phải lưu tên thuật toán cùng giá trị**, vì 20 năm nữa hệ thống sẽ có nhiều thuật toán song song và một chuỗi hex trần không tự mô tả được; (b) quan trọng hơn cả việc chọn thuật toán là **checksum phải được tính trên nội dung tệp tại nguồn**, ngay khi tệp rời thiết bị — không phải tính lại sau khi tệp đã đi qua vài lần copy.

### 5.3. Quy mô tính toán — nút thắt là I/O, không phải CPU

Tốc độ băm (tham khảo, phần cứng phổ thông 2026):

| Đường | Thông lượng điển hình |
|---|---|
| SHA-256 có SHA-NI, 1 lõi | ~1,5–2 GB/s |
| SHA-256 không SHA-NI, 1 lõi | ~250–400 MB/s |
| BLAKE3 đa lõi | nhiều GB/s |
| HDD đơn, đọc tuần tự | 150–250 MB/s |
| RAID6 8 đĩa HDD, đọc tuần tự | ~0,8–1,2 GB/s |
| **Mạng 1 GbE** | **~125 MB/s** |
| Mạng 10 GbE | ~1,1 GB/s |
| LTO-9, đọc tuần tự | ~400 MB/s |

Thời gian quét fixity **một bản đầy đủ ~7 TB** (mô hình ở mục 6):

| Cách thực hiện | Thời gian |
|---|---|
| Tính **tại node lưu trữ** (RAID6 HDD) | **~2 giờ** |
| Kéo qua mạng 10 GbE rồi tính | ~1,8 giờ |
| Kéo qua **mạng 1 GbE** rồi tính | **~15,6 giờ** |
| Đọc tuần tự từ LTO-9 | ~4,9 giờ/lượt |

**Hệ quả thiết kế bắt buộc:** phải **tính checksum tại chỗ (storage-side)** rồi chỉ đẩy kết quả về hệ quản trị. Nếu hạ tầng chỉ có 1 GbE và làm theo cách kéo tệp về máy chủ ứng dụng, lịch "hàng quý, cả 3 bản" của `docs/02:145` sẽ tốn khoảng **47 giờ đọc liên tục mỗi quý** cho riêng nhóm UNESCO — vẫn làm được nhưng phải xếp lịch ngoài giờ và phải nói rõ trong hồ sơ, không thể để hội đồng tự suy ra.

### 5.4. Tầng lạnh: vì sao lịch fixity của tài liệu 02 cần điều chỉnh

`docs/02:145` quy định mỗi lần fixity là "tính lại checksum từng bản — tầng nóng / AIP / lạnh", với nhóm UNESCO là hàng quý. Áp dụng nguyên văn cho **băng từ** có ba vấn đề:

1. Băng **không truy cập ngẫu nhiên** — kiểm tra một tệp vẫn phải cuốn băng; kiểm tra toàn bộ là đọc hết cuộn.
2. Băng có **số lần chạy hữu hạn** theo công bố của nhà sản xuất *(con số cụ thể phụ thuộc model — cần kiểm chứng theo thông số LTO-9 của thiết bị sẽ mua)*. Đọc toàn bộ 4 lần/năm là tiêu hao không cần thiết.
3. LTO **đã có sẵn** mã sửa lỗi và cơ chế verify-after-write ở tầng phần cứng.

**Đề xuất điều chỉnh** (giữ nguyên tinh thần, đổi cách thực hiện):

| Tầng | Tần suất fixity | Ghi chú |
|---|---|---|
| Nóng (bản web) | Không cần | Tái sinh được từ AIP — kiểm tra là lãng phí |
| AIP bản 1 + bản 2 (đĩa) | **Toàn bộ, hàng quý** cho nhóm UNESCO | Giữ nguyên tài liệu 02; tính tại storage-side |
| Lạnh (LTO) | **Verify-after-write** mỗi lần ghi (bắt buộc) + **mẫu 10%/quý xoay vòng** + **toàn bộ 1 lần/năm** | Phủ hết kho sau ~2,5 năm bằng mẫu, cộng 1 lượt toàn bộ mỗi năm |

### 5.5. Ba lỗi mà fixity không bao giờ phát hiện được

Đây là phần quan trọng nhất của mục 5, vì nó chỉ ra rằng checksum khớp **không** đồng nghĩa dữ liệu còn dùng được:

1. **Tệp nguyên vẹn nhưng không còn bộ đọc.** Đúng từng bit, và vô dụng. Chỉ có giám sát lỗi thời định dạng mới bắt được — cần từ vựng định dạng có kiểm soát (FMT-05).
2. **Tệp nguyên vẹn nhưng bị hiểu sai.** Chính là kịch bản `.ply` splat bị mở như point cloud ở mục 3.1(a). Checksum khớp tuyệt đối, người đọc kết luận "hỏng".
3. **Tệp nguyên vẹn nhưng thiếu tệp đi kèm.** OBJ mất `.mtl`/texture (mục 2.3); splat mất gói ảnh nguồn; video mất tệp phụ đề. Bộ tệp không đầy đủ, mà fixity chỉ soi từng tệp riêng lẻ.

→ Cần bổ sung **hai lớp kiểm tra** bên cạnh fixity: (a) **nhận dạng định dạng định kỳ** (đối chiếu chữ ký tệp với sổ đăng ký định dạng, sinh PUID), (b) **kiểm tra tính đầy đủ của manifest** — mọi tệp khai báo trong manifest đều tồn tại và ngược lại. Cả hai đều cần manifest tệp thật, tức lại quay về FMT-03.

### 5.6. WORM / object lock — cưỡng chế bất biến

`docs/02:58` mô tả tầng AIP là "ghi một lần, chỉ đọc sau khi qua QC" nhưng **không nêu cơ chế cưỡng chế**. Bất biến bằng quy trình (không ai được xoá) khác hẳn bất biến bằng kỹ thuật (hệ thống từ chối lệnh xoá). Với kịch bản ransomware ở `docs/02:231-236`, chỉ cái thứ hai mới có tác dụng — vì kẻ tấn công thường chiếm được quyền quản trị.

Khuyến nghị: bật **object lock ở chế độ tuân thủ** với thời hạn giữ tối thiểu trên bản 2 (object storage), và dùng **băng WORM** cho bản 3. Ở chế độ tuân thủ, ngay cả tài khoản quản trị cấp cao nhất cũng không xoá được đối tượng trước hạn — đó chính là tính chất cần cho dữ liệu di sản quốc gia.

### 5.7. RAID và erasure coding

Ba ghi chú ngắn, vì đây là chỗ hay bị hiểu nhầm trong hồ sơ thầu:

- **RAID không phải sao lưu.** RAID chống hỏng đĩa, không chống xoá nhầm, không chống ransomware, không chống hỏng cả tủ. Tài liệu 02 đã ngầm hiểu đúng (RAID nằm trong bản 1, còn 3-2-1 mới là sao lưu), nhưng nên nói thẳng ra để tránh bị chất vấn.
- **Ở quy mô ~7–20 TB, RAID6 + hai bản độc lập là đủ.** Erasure coding phân tán chỉ bắt đầu có lợi rõ rệt từ khoảng vài trăm TB trở lên, và trả giá bằng độ phức tạp vận hành mà một trung tâm di sản không nên gánh ở giai đoạn 1.
- **Rủi ro thật của RAID6 với đĩa dung lượng lớn là thời gian dựng lại.** Đĩa 8–20 TB có thể mất nhiều giờ đến vài ngày để rebuild, và trong khoảng đó mảng đang ở trạng thái suy giảm. Đây là lý do bản 2 phải là **hệ thống lưu trữ độc lập**, không phải một mảng RAID khác trong cùng khung máy — điều `docs/02:66` đã quy định đúng ("Object Storage, công nghệ khác Bản 1").

---

## 6. Ước tính dung lượng & chi phí lưu trữ

### 6.1. Vì sao mục này không dựa vào `sizeFormulas.ts`

Hai lý do độc lập:

1. **Ba hằng số lệch** đã nêu ở mục 1 (splat 190 vs 248 byte/Gaussian; WAV 16-bit vs 24-bit; TIFF ảnh 30 MB/MP so với 2,9 MB/MP suy từ chính `tiffA4SizeMB`). Các hằng số còn lại (`meshSizeMB` 28 byte/tam giác, `tiffA4SizeMB` 100 MB/trang A4 600dpi 8-bit RGB, `proresSizeMB` 5,3 GB/phút) kiểm tra lại thì **hợp lý** — nên vấn đề là cục bộ chứ không phải toàn bộ mô hình sai.
2. **Quan trọng hơn:** `sizeFormulas.ts` mô hình hoá **dung lượng một tệp hiển thị trên giao diện**, không phải **dung tích lưu trữ của một tài sản đã bảo quản đầy đủ**. Kể cả khi mọi hằng số đều đúng, nó vẫn không cộng ảnh nguồn, không cộng bản bảo quản, không cộng ba bản sao. Đó là lý do chính khiến con số chênh tới hai bậc.

Vì vậy mục này **dựng lại từ đầu theo tham số vật lý của việc số hóa**, và nêu rõ mọi giả định để hội đồng kiểm chứng được.

### 6.2. Giả định (nêu rõ để phản biện được)

| Mã | Giả định | Căn cứ |
|---|---|---|
| G1 | 320 ảnh/rùa, máy full-frame 45–61 MP, RAW 14-bit ≈ 60 MB/tệp → **19,2 GB ảnh nguồn/rùa** | Số 320 ảnh lấy từ `data/06-metadata/template-3d-mesh.csv` (dòng mẫu VM-3D-002) |
| G2 | Mesh gốc mật độ đầy đủ 100–180 triệu tam giác → **~5 GB/rùa** | Suy từ 28 byte/tam giác của `sizeFormulas.ts:19` (đã kiểm tra là hợp lý) cộng texture 16K |
| G3 | Bản bảo quản decimate ~25 triệu tam giác + texture 16K → **~1,5 GB/rùa** | Cùng cách tính |
| G4 | Bản web GLB + Draco + KTX2, ~150k tam giác + texture 2K → **~20 MB/rùa** | Thực hành phổ biến của viewer web |
| G5 | 14 cảnh splat, tổng **94,5 triệu Gaussian** (cộng từ `structures.ts` + `precincts.ts`), PLY 3DGS 248 byte/Gaussian → **23,4 GB** | Số Gaussian đọc trực tiếp từ mã nguồn; 248 byte = 62 × float32 (mục 3.3) |
| G6 | Ảnh nguồn splat: ~1.500 ảnh/cảnh × 60 MB = **90 GB/cảnh**; project/checkpoint **~20 GB/cảnh** | `template-splat.csv` ghi 1.650 ảnh (Giếng Thiên Quang); `structures.ts:33` ghi 1.800 ảnh (Khuê Văn Các) |
| G7 | Hán Nôm giai đoạn 1: **2.000 trang** TIFF 600dpi 8-bit RGB @ 100 MB/trang | Dùng chính hằng số `sizeFormulas.ts:55-58` (đã kiểm tra là hợp lý) |
| G8 | Ảnh tư liệu: **3.300 ảnh**, bản gốc TIFF ~50 MP 8-bit RGB ≈ **150 MB/ảnh** | Mức số hóa bảo quản; **lưu ý** giá trị 3–8 MP trong seed hiện tại thấp hơn mức này nhiều |
| G9 | Video: **5 giờ** master ProRes 422 HQ 4K = **318 GB/giờ** | 5,3 GB/phút (`sizeFormulas.ts:49-52`, đã kiểm tra là hợp lý) |
| G10 | Audio: **100 giờ** BWF 48 kHz/24-bit stereo = **1,04 GB/giờ** | 17,3 MB/phút — theo 24-bit của `template-media.csv`, không theo 11,5 MB/phút của `sizeFormulas.ts:46` |

### 6.3. Bảng ước tính — một bản AIP, giai đoạn 1

| Nhóm | Số lượng | Nguyên liệu (D1) | Master | Bản bảo quản | Web | **Cộng** |
|---|---|---|---|---|---|---|
| Rùa đội bia (UNESCO) | 82 model | 1.574 GB | 410 GB | 123 GB | 1,6 GB | **2.109 GB** |
| Mesh 3D khác (công trình, hiện vật) | 25 model | 625 GB | 125 GB | 38 GB | 0,5 GB | **789 GB** |
| Gaussian splat | 14 cảnh | 1.540 GB | 23 GB | 23 GB | 2,3 GB | **1.589 GB** |
| Point cloud (E57) | ~10 bản | — | 50 GB | (chính nó) | 5 GB | **55 GB** |
| Tài liệu Hán Nôm | 2.000 trang | — | 200 GB | 2,2 GB | 20 GB | **222 GB** |
| Ảnh tư liệu | 3.300 ảnh | — | 495 GB | (chính nó) | 5 GB | **500 GB** |
| Video | 5 giờ | — | 1.590 GB | (born-digital: chính nó) | 5 GB | **1.595 GB** |
| Audio | 100 giờ | — | 104 GB | (chính nó) | 1 GB | **105 GB** |
| **Tổng một bản AIP** | | **3.739 GB** | **2.997 GB** | **186 GB** | **40 GB** | **≈ 6.964 GB ≈ 7,0 TB** |

Hai quan sát đáng chú ý từ bảng này:

- **Nguyên liệu (D1) chiếm 54% tổng dung tích** — nhiều hơn cả master. Đây chính là phần đang **hoàn toàn không có** trong mô hình dữ liệu. Nói cách khác, thành phần lớn nhất của kho lưu trữ tương lai hiện đang vô hình với hệ thống quản lý.
- **Chênh lệch so với mô hình hiện tại:** app tính tổng **127,4 GB** cho 153 bản ghi; mô hình này cho **~6.964 GB** → lệch khoảng **55 lần**. Riêng 82 rùa: app 22,5 GB (275 MB/con) so với 2.109 GB (25,7 GB/con) → lệch **94 lần**.

### 6.4. Nhân lên theo quy tắc 3-2-1

| Bản | Nội dung | Dung tích |
|---|---|---|
| Bản 1 — NAS tại Trung tâm | AIP đầy đủ | 7,0 TB |
| Bản 2 — Object storage tại chỗ | AIP đầy đủ | 7,0 TB |
| Bản 3 — LTO off-site | AIP đầy đủ | 7,0 TB |
| Tầng nóng | Chỉ bản web | 0,04 TB |
| **Tổng cần lưu** | | **≈ 21 TB** |

Dự phòng tăng trưởng 5 năm (hệ số 2) và hao hụt RAID → **cấp phát ~15 TB dung lượng dùng được cho mỗi bản đĩa**. Với LTO-9 (18 TB native/cuộn), 7 TB nằm gọn trong **một cuộn**; thực hành đúng là giữ **hai bộ đầy đủ** cộng cuộn dự phòng.

### 6.5. Chi phí (ước tính, thị trường Việt Nam 2026 — cần báo giá thực tế để chốt)

**Đầu tư ban đầu (capex):**

| Hạng mục | USD |
|---|---|
| NAS 8 khay (khung máy) | 1.500 – 2.500 |
| 8 × HDD enterprise 8 TB (bản 1) | ~1.280 |
| Máy chủ 2U + object storage tự chủ (bản 2) | 2.500 – 3.500 |
| 8 × HDD enterprise 8 TB (bản 2) | ~1.280 |
| Ổ băng LTO-9 gắn ngoài | 4.500 – 6.000 |
| 8 × băng LTO-9 | ~960 |
| UPS + switch 10 GbE + tủ rack | 2.000 – 3.000 |
| **Cộng capex** | **≈ 14.000 – 19.000** |

**Vận hành hằng năm (opex):**

| Hạng mục | USD/năm | Giả định |
|---|---|---|
| Điện | ~400 | 2 node × ~300 W liên tục ≈ 5.256 kWh; giá điện SX ~2.000 đ/kWh |
| Dự phòng thay đĩa | ~260 | 10%/năm trên giá trị đĩa |
| Băng bổ sung + vệ sinh ổ băng | ~400 | |
| Địa điểm off-site | 0 – 3.600 | **0** nếu dùng cơ sở sẵn có của Sở VHTT & Hà Nội; **3.600** nếu thuê tủ rack ngoài |
| **Cộng opex** | **≈ 1.100 – 4.700** | *Chưa gồm nhân công* |

**Nhân công:** fixity, rà soát định dạng, diễn tập khôi phục và phép thử tái tạo ước **~0,2 FTE** cán bộ bảo quản số.

**Số tham chiếu (không phải khuyến nghị):** 21 TB trên object storage lạnh thương mại ≈ 1.260 USD/năm chưa kể phí lấy dữ liệu ra. Tự chủ hạ tầng đắt hơn trong 8–12 năm đầu — nhưng **ràng buộc self-host với dữ liệu di sản quốc gia là ràng buộc cứng**, nên con số này chỉ dùng để chứng minh với hội đồng rằng phương án tự chủ đã được so sánh, không phải để cân nhắc lại.

### 6.6. Độ nhạy — biến nào làm vỡ dự toán

| Biến | Nếu tăng | Tác động lên một bản AIP |
|---|---|---|
| **Số giờ video master** | 5 → 20 giờ | **+4,8 TB** ← nhạy nhất |
| Giữ cả RAW lẫn JPEG đã hiệu chỉnh của ảnh nguồn | +1 bộ | +1,1 TB |
| Số cảnh splat | 14 → 30 | +1,8 TB |
| Số trang Hán Nôm | 2.000 → 10.000 | +0,8 TB |
| Số ảnh tư liệu | 3.300 → 10.000 | +1,0 TB |

**Khuyến nghị chốt số:** trước khi mua sắm, phải xác định dứt điểm **tổng số giờ video master** — đây là biến duy nhất có thể một mình làm dự toán lệch gấp đôi. Giai đoạn 2 (số hóa toàn bộ kho tài liệu và ảnh) ước nhân 3–5 lần, tức **20–35 TB/bản**; đến ngưỡng đó mới đáng cân nhắc erasure coding.


---

## 7. Danh sách đề xuất nâng cấp

Quy ước phân kỳ: **[Demo thầu]** = làm được ngay trên lớp mock, không cần backend · **[6 tháng]** = cần backend thật hoặc quy trình vận hành · **[18 tháng]** = cần hạ tầng đã mua và dữ liệu thật đã về.

Đơn giá nhân công giả định: **1 người-ngày ≈ 120 USD** (lập trình viên/chuyên viên dữ liệu, thị trường Hà Nội 2026). Chi phí hạ tầng nêu riêng, không trùng với capex đã tính ở mục 6.5.

---

### FMT-01 — Tách tầng "Bản bảo quản" thành vai trò tệp thứ tư

- **Vì sao.** `app/src/data/digitization.ts:330-334` sinh ba vai trò `master`/`web`/`raw`, trong đó `master` và `web` **dùng chung `ext[0]`** (dòng 331–332) — nghĩa là bản gốc và bản web của một mesh đều là `.glb`, của một splat đều là `.splat`. Đồng thời `raw` lấy `ext[1]` = `e57` cho mesh3d (dòng 333, bảng `EXT_BY_DIGITAL_FORM` dòng 261-270), tức **E57 — một chuẩn ASTM — đang bị gán nhãn "Dữ liệu thô"**. Kết quả: hệ thống không có chỗ nào biểu diễn "bản đã chuyển sang chuẩn mở để lưu 20 năm".
- **Lợi ích lâu dài.** Tách bạch nghĩa vụ: master không bao giờ đụng tới; bản bảo quản là thứ được di trú khi chuẩn đổi; bản web xoá tự do. Không có tầng giữa thì mỗi lần di trú định dạng buộc phải đụng vào bản gốc — vi phạm chính nguyên tắc bất biến của `docs/02:51`.
- **Ai đang làm.** **Smithsonian Digitization Program Office** phân tách rõ bản thu nhận gốc, bản phân phối chuẩn mở (glTF/GLB) và bản hiển thị trong viewer Voyager mã nguồn mở của họ. **Archaeology Data Service (ADS)** trong *Guides to Good Practice* yêu cầu nộp đồng thời dữ liệu gốc và bản ở định dạng bảo quản, coi đó là hai hạng mục nộp riêng biệt.
- **Cost.** 2–3 người-ngày (sửa `AssetFileRow`, thêm vai trò `archival`, cập nhật bảng ở `AssetDetailPage.tsx:600-635`). ≈ **240–360 USD**. Hạ tầng: 0 (dung lượng bản bảo quản đã tính trong mục 6.3 — 186 GB).
- **Ưu tiên.** **P0** · **[Demo thầu]**
- **Rủi ro nếu không làm.** Hồ sơ tuyên bố chiến lược 3 tầng nhưng sản phẩm chỉ thể hiện 2 — hội đồng có chuyên môn sẽ thấy ngay khoảng cách giữa tài liệu 02 và phần mềm.

---

### FMT-02 — Mô hình hoá gói nguyên liệu (ảnh nguồn + pose + project file) như tài sản có nghĩa vụ bảo quản

- **Vì sao.** ADR 0008 (`docs/adr/0008-...:31`) quy định "lưu ảnh nguồn + tham số huấn luyện", nhưng **không có chỗ nào trong mô hình dữ liệu chứa nó**: `ACCEPT_FORMATS.Splat` chỉ có chuỗi chip `'ZIP ảnh nguồn'` (`app/src/data/metadataFields.ts:40`), không bản ghi nào, không vai trò tệp nào. Dòng `raw` hiện ước lượng chỉ **1,3–2,2 lần** master (`app/src/data/digitization.ts:318-321`) trong khi tỉ lệ thật với photogrammetry là **~70 lần** (19,2 GB ảnh nguồn so với 275 MB mesh). Theo mục 6.3, nguyên liệu chiếm **54% tổng dung tích kho** — tức thành phần lớn nhất của kho đang vô hình.
- **Lợi ích lâu dài.** Đây là **bảo hiểm thật duy nhất** cho cả mesh lẫn splat (mục 3.3): còn ảnh nguồn thì tái dựng được bằng thuật toán tốt hơn trong tương lai; mất ảnh nguồn thì mọi hỏng hóc định dạng đều không cứu vãn được.
- **Ai đang làm.** **CyArk** lưu trữ dữ liệu thu nhận thô song song với sản phẩm đã xử lý, coi dữ liệu thô là hạng mục lưu trữ chính. **Factum Foundation** công bố cả phương pháp lẫn dữ liệu gốc cho các dự án bản sao di sản. **ADS** bắt buộc nộp ảnh gốc và tham số hiệu chuẩn máy ảnh kèm mô hình photogrammetry.
- **Cost.** Mock: 3–4 người-ngày (thêm vai trò tệp `source`, sinh dung lượng theo tham số vật lý thay vì hệ số 1,3–2,2×). ≈ **360–480 USD**. Backend thật: 15–20 người-ngày. Hạ tầng: **~3,7 TB/bản** — đã nằm trong dự toán mục 6.
- **Ưu tiên.** **P0** · **[Demo thầu]** cho phần mô hình hoá, **[18 tháng]** cho việc nạp dữ liệu thật từ NAS.
- **Rủi ro nếu không làm.** Mất khả năng phục hồi vĩnh viễn khi định dạng lỗi thời. Với 82 model UNESCO, đây là rủi ro không thể chấp nhận và không thể sửa về sau — ảnh nguồn không tái tạo được nếu đã bị xoá khỏi NAS.

---

### FMT-03 — Manifest tệp: chuyển `Asset` từ "một tệp" sang "một bộ tệp"

- **Vì sao.** `app/src/services/types.ts:63-66` cho `Asset` đúng một `fmt`, một `size`, một `sizeMB`. Hệ quả trực tiếp: nhiều tệp bị nhét vào chuỗi (`fmt: 'GLB + E57'`, `fmt: 'PLY / SPLAT'`), và **OBJ chắc chắn mất texture** vì OBJ luôn là bộ `.obj` + `.mtl` + N texture (mục 2.3) — 5 bản ghi đang ở `fmt: 'OBJ'`. Bảng Tệp tin hiện có là **sinh lúc render, không lưu** (`app/src/data/digitization.ts:326-356`), nên không thể kiểm tra tính đầy đủ.
- **Lợi ích lâu dài.** Manifest là điều kiện cần cho: kiểm tra đầy đủ bộ tệp (mục 5.5), fixity từng tệp, sinh gói AIP theo chuẩn đóng gói, và mọi đề xuất khác trong danh sách này.
- **Ai đang làm.** Đặc tả đóng gói **BagIt (RFC 8493)** — dùng rộng rãi trong cộng đồng lưu trữ số — chính là "thư mục dữ liệu + tệp kê khai checksum cho từng tệp"; đây là mô hình tối thiểu nên bám theo. **Library of Congress** và nhiều kho lưu trữ quốc gia dùng BagIt làm định dạng chuyển giao.
- **Cost.** 5–8 người-ngày (đổi kiểu dữ liệu, cập nhật generator, sửa các nơi đọc `fmt`/`size`, cập nhật UI). ≈ **600–960 USD**. Hạ tầng: 0.
- **Ưu tiên.** **P0** · **[Demo thầu]**
- **Rủi ro nếu không làm.** Mất texture của mọi mô hình OBJ mà fixity không phát hiện được — checksum của `.obj` vẫn khớp. Đây là mất dữ liệu âm thầm đúng loại mà toàn bộ tài liệu 02 được viết ra để ngăn chặn.

---

### FMT-04 — Bộ trường siêu dữ liệu kỹ thuật theo `digitalForm`

- **Vì sao.** Độ phủ hiện tại ~3% (bảng 4.7): 63 trường khuyến nghị, 2 trường có lưu thật. Thiết bị, độ phân giải hình học, độ chính xác, hệ toạ độ, hiệu chuẩn màu, phần mềm + phiên bản — **không trường nào tồn tại**. Các cột này đã có trong `data/06-metadata/template-3d-mesh.csv` và `template-splat.csv` nhưng **không có đích đến**, nên dữ liệu nhập vào sẽ rơi mất khi ingest. `app/src/data/physicalSpecs.ts:198` khai báo `vn2000` rồi không file dữ liệu nào điền.
- **Lợi ích lâu dài.** Không có các trường này thì mô hình 3D **không dùng được cho nghiên cứu** — không ai trích dẫn được một phép đo mà không biết sai số, không biết hệ quy chiếu, không biết mô hình đã bị vá lỗ ở đâu. Đây là ranh giới giữa "tài sản số" và "chứng cứ khoa học".
- **Ai đang làm.** **Smithsonian DPO** công bố hướng dẫn siêu dữ liệu tối thiểu cho 3D. **3D-ICONS** (dự án EU) và lược đồ **CARARE** định nghĩa bộ trường xuất xứ cho di sản 3D. **ADS Guides to Good Practice** yêu cầu khai báo đầy đủ thiết bị, phương pháp, độ chính xác và mọi can thiệp hậu kỳ. **Historic England** công bố hướng dẫn kỹ thuật cho quét laser và photogrammetry di sản.
- **Cost.** 6–10 người-ngày, dùng lại đúng cơ chế dẫn xuất tất định đã có ở `app/src/data/digitization.ts` (RNG seed theo `asset.code`) nên không phải gõ tay 153 bản ghi. ≈ **720–1.200 USD**. Hạ tầng: 0.
- **Ưu tiên.** **P0** · **[Demo thầu]**
- **Rủi ro nếu không làm.** 82 model UNESCO trở thành dữ liệu không kiểm chứng được; mất giá trị khoa học và mất khả năng chia sẻ với Europeana hay các kho quốc tế vốn yêu cầu siêu dữ liệu xuất xứ.

---

### FMT-05 — Từ vựng định dạng có kiểm soát + mã PUID + bảng theo dõi lỗi thời

- **Vì sao.** `app/src/services/types.ts:63` khai báo `fmt: string` tự do; dữ liệu thật có 13 giá trị rời rạc không nhất quán (`'GLB'` / `'GLB + E57'`, `'TIFF'` / `'TIFF 600dpi'`, `'SPLAT'` / `'PLY / SPLAT'`). `docs/02:269` hứa rà soát định dạng 2 năm/lần và `docs/02:318` đặt mục tiêu "công cụ giám sát lỗi thời tự động (dạng PRONOM)" — **không thực hiện được trên một trường chuỗi tự do**.
- **Lợi ích lâu dài.** Gắn mỗi định dạng một mã định danh bền vững cho phép truy vấn "tài sản nào đang ở định dạng có rủi ro cao" trong một câu lệnh, thay vì rà tay. Đây chính là điều kiện kỹ thuật để đạt NDSA Level 4 mà `docs/02:318` đã cam kết.
- **Ai đang làm.** **The National Archives (Anh)** vận hành sổ đăng ký định dạng **PRONOM** và công cụ nhận dạng **DROID** — hạ tầng nhận dạng định dạng được dùng rộng rãi nhất trong ngành. **Library of Congress** duy trì trang *Sustainability of Digital Formats* mô tả rủi ro từng định dạng (ví dụ mục FFV1 và Matroska+FFV1 đã dẫn ở mục 9). **NARA** công bố *Digital Preservation Framework* với đánh giá rủi ro theo từng định dạng. **DPC** xuất bản *Bit List* — danh sách định dạng "đang nguy cấp".
- **Cost.** Mock: 4–6 người-ngày (kiểu union + bảng tra PUID + panel theo dõi lỗi thời). ≈ **480–720 USD**. Tích hợp nhận dạng tự động thật: thêm 8–12 người-ngày. Hạ tầng: 0 (công cụ mã nguồn mở).
- **Ưu tiên.** **P1** · **[Demo thầu]** cho từ vựng, **[6 tháng]** cho nhận dạng tự động.
- **Rủi ro nếu không làm.** Cam kết rà soát định dạng trong tài liệu 02 trở thành cam kết không thể thực hiện — sẽ lộ ra ở lần kiểm toán vận hành đầu tiên.

---

### FMT-06 — Cập nhật ADR 0008 và văn bản về splat cho đúng thực tế 2026

- **Vì sao.** Hai vấn đề tách biệt. **(a) Lạc hậu:** `docs/adr/0008-...:49-50` loại phương án chờ chuẩn với lý do "không có mốc thời gian xác định cho việc chuẩn hóa" — trong khi Khronos đã công bố `KHR_gaussian_splatting` ngày 03/02/2026, trạng thái Release Candidate, dự kiến phê chuẩn Q2/2026 (nguồn ở mục 3.2). **(b) Sai kỹ thuật:** `app/src/data/digitization.ts:390` và `app/src/pages/BackupPage.tsx:556-559` khẳng định bản point cloud là "dữ liệu **DUY NHẤT** phục hồi được nội dung" — sai, vì point cloud chỉ giữ ~10% thông tin của một Gaussian và mất toàn bộ SH bậc cao, độ đục, hình dạng ellipsoid (bảng 3.3).
- **Lợi ích lâu dài.** Giữ được uy tín kỹ thuật của hồ sơ. Quyết định cốt lõi của ADR 0008 vẫn đúng — chỉ căn cứ cần cập nhật; sửa sớm biến một điểm yếu tiềm tàng thành bằng chứng "đơn vị dự thầu theo sát chuẩn quốc tế".
- **Ai đang làm.** **Khronos Group** với sự tham gia của Autodesk, Cesium/Bentley, Esri, Huawei, Niantic Spatial, NVIDIA, XGRIDS. **DPC** khuyến nghị rà soát lại đánh giá rủi ro định dạng theo chu kỳ chính vì tình huống kiểu này.
- **Cost.** 1–2 người-ngày (viết ADR mới, sửa 2 chuỗi văn bản trong mã, cập nhật `docs/02` mục 7.2). ≈ **120–240 USD**. Hạ tầng: 0.
- **Ưu tiên.** **P0** · **[Demo thầu]**
- **Rủi ro nếu không làm.** Một thành viên hội đồng biết về glTF sẽ phát hiện tài liệu lạc hậu và một khẳng định sai kỹ thuật trong cùng một chủ đề — làm giảm độ tin cậy của toàn bộ phần bảo quản.

---

### FMT-07 — Sinh bản GLB + `KHR_gaussian_splatting` cho mọi tài sản splat

- **Vì sao.** 12/14 bản ghi splat đang lấy `.splat` làm master (`fmt: 'SPLAT'`), mà `.splat` **cắt SH về bậc 0** — mất toàn bộ màu phụ thuộc góc nhìn (bảng 3.1). Không có tầng bản bảo quản chuẩn mở nào cho splat.
- **Lợi ích lâu dài.** Đưa splat từ "định dạng không ai bảo đảm" sang "phần mở rộng của một chuẩn ISO/IEC (glTF 2.0 = ISO/IEC 12113:2022)". Đây là bước nhảy về chất trong hồ sơ rủi ro, và là **điểm bán hàng mạnh nhất** mà hồ sơ này có thể nêu ở chủ đề splat.
- **Ai đang làm.** **CesiumJS**, **Esri ArcGIS**, **Scaniverse (Niantic Spatial)** và **XGRIDS Lixel Cybercolor** là các ứng dụng áp dụng sớm được Khronos nêu tên trong thông cáo 03/02/2026. Công cụ chuyển đổi mã nguồn mở đã có sẵn (ví dụ `splat-transform` của PlayCanvas đọc/ghi PLY, SOG, SPZ, GLB).
- **Cost.** Mock: 2 người-ngày (thêm dòng tệp bản bảo quản cho splat, kèm nhãn chuẩn). ≈ **240 USD**. Pipeline chuyển đổi thật: 10–15 người-ngày. Hạ tầng: **+23 GB/bản** (mục 6.3) — không đáng kể. Phần mềm: 0 (mã nguồn mở).
- **Ưu tiên.** **P1** · **[Demo thầu]** cho phần trình bày, **[6 tháng]** cho pipeline thật (sau khi chuẩn được phê chuẩn chính thức).
- **Rủi ro nếu không làm.** Toàn bộ dữ liệu splat — gồm Giếng Thiên Quang và Khuê Văn Các — chỉ tồn tại ở định dạng không có tổ chức chuẩn hoá nào bảo đảm.

---

### FMT-08 — Sửa ba hằng số dung lượng và hiệu chỉnh cơ số quy mô hạ tầng

- **Vì sao.** `app/src/data/sizeFormulas.ts:35-37` dùng 190 byte/Gaussian (đúng là **248** = 62 × float32); `:44-47` dùng 11,5 MB/phút tức 16-bit trong khi `data/06-metadata/template-media.csv` ghi **24-bit** (17,3 MB/phút); `:70-73` dùng 30 MB/megapixel cho ảnh TIFF trong khi `:55-58` của **cùng file** suy ra ~2,9 MB/megapixel — lệch hơn 10 lần. Hệ quả lan tới `app/src/pages/BackupPage.tsx:528` đang trình bày dung lượng tầng AIP cho hội đồng bằng cơ số này.
- **Lợi ích lâu dài.** Toàn bộ phần trình bày quy mô hạ tầng, dự toán mua sắm và cam kết RPO/RTO đều đứng trên con số dung lượng. Sai cơ số 55 lần (mục 6.3) làm sai mọi thứ phía sau.
- **Ai đang làm.** Đây là kỷ luật nội bộ, không phải chuẩn ngành — nhưng cách làm đúng là gắn mỗi hằng số với một phép tính vật lý kiểm chứng được, đúng như chú thích đầu `sizeFormulas.ts:1-12` đã đặt ra làm nguyên tắc.
- **Cost.** 1 người-ngày sửa hằng số + kiểm thử hồi quy. ≈ **120 USD**. Bổ sung mô hình dung tích thật (mục 6) vào thuyết minh: 1–2 người-ngày.
- **Ưu tiên.** **P0** · **[Demo thầu]**
- **Rủi ro nếu không làm.** Mua thiếu hạ tầng, hoặc bị hội đồng chất vấn "82 model 3D của di sản UNESCO mà chỉ 22 GB?" — một câu hỏi rất dễ đặt ra và hiện chưa có câu trả lời tốt.

---

### FMT-09 — Trung thực hoá phần đang mô phỏng

- **Vì sao.** `app/src/i18n/vi.ts:41` hiển thị cho người dùng: *"Hệ thống kiểm tra định dạng, độ phân giải và checksum trước khi đưa tệp vào hàng đợi xử lý."* Không có mã nào làm việc đó: `app/src/services/mock/uploadService.ts:43-50` gán cứng tên tệp và kích thước, không nhận tham số; `ACCEPT_FORMATS`/`ACCEPT_LIMIT` (`app/src/data/metadataFields.ts:38-50`) chỉ được vẽ thành chip ở `app/src/pages/UploadPage.tsx:169-176`. Checksum ở màn Chi tiết là số ngẫu nhiên (`app/src/data/digitization.ts:300-306`); ở màn Tải lên là SHA-256 thật nhưng băm chuỗi `id:tên:kích thước`, không băm nội dung (`app/src/pages/UploadPage.tsx:23-28`).
- **Lợi ích lâu dài.** Một hồ sơ thầu bị phát hiện tuyên bố năng lực không có thật sẽ mất uy tín ở mọi hạng mục khác, kể cả các hạng mục làm tốt. Ghi rõ "mô phỏng" biến rủi ro này thành điểm cộng về tính minh bạch.
- **Ai đang làm.** Thực hành chuẩn khi trình bày nguyên mẫu: phân biệt rõ chức năng đã hiện thực với chức năng minh hoạ.
- **Cost.** 0,5 người-ngày (sửa chuỗi i18n + thêm nhãn "dữ liệu mô phỏng" trên các bảng liên quan). ≈ **60 USD**.
- **Ưu tiên.** **P0** · **[Demo thầu]** — rẻ nhất và nhanh nhất trong toàn danh sách.
- **Rủi ro nếu không làm.** Rủi ro uy tín trực tiếp trong buổi chấm thầu, và rủi ro pháp lý nếu cam kết này được đưa vào hợp đồng.

---

### FMT-10 — Kiểm tra tệp thật khi tải lên

- **Vì sao.** Là phần "làm thật" của FMT-09. Hiện không có `accept=` trên vùng thả tệp, không đối chiếu MIME/chữ ký tệp, không so với `ACCEPT_LIMIT` (`app/src/data/metadataFields.ts:45-50`). `docs/02:130` quy định QC chặn dữ liệu không đạt "không có ngoại lệ tạm chấp nhận" — nhưng không có cơ chế chặn nào tồn tại.
- **Lợi ích lâu dài.** Chặn dữ liệu kém chất lượng tại cửa vào rẻ hơn nhiều lần so với phát hiện sau khi đã nhân thành 3 bản và ghi lên băng.
- **Ai đang làm.** **FADGI** và **Metamorfoze** định nghĩa ngưỡng kỹ thuật kiểm chứng được cho ảnh số hóa di sản (độ phân giải, độ sâu bit, sai số màu) — đây là bộ tiêu chí nên mã hoá thành luật kiểm tra. **DROID/PRONOM** dùng để nhận dạng định dạng thật thay vì tin vào phần mở rộng tệp.
- **Cost.** Mock (kiểm tra phía trình duyệt: phần mở rộng, kích thước, đọc header ảnh): 2–3 người-ngày ≈ **240–360 USD**. Kiểm tra đầy đủ phía máy chủ: 8–12 người-ngày.
- **Ưu tiên.** **P1** · **[Demo thầu]** cho kiểm tra cơ bản, **[6 tháng]** cho kiểm định đầy đủ.
- **Rủi ro nếu không làm.** Dữ liệu sai định dạng/độ phân giải lọt vào AIP và chỉ bị phát hiện nhiều năm sau, khi hiện vật có thể đã thay đổi tình trạng và không số hóa lại được như cũ.

---

### FMT-11 — Phép thử tái tạo định kỳ + điều chỉnh lịch fixity tầng lạnh

- **Vì sao.** Hai điều chỉnh bổ sung cho `docs/02` mục 4–5. **(a)** Tài liệu 02 có diễn tập khôi phục hạ tầng nhưng **không có phép thử nào chứng minh nội dung dựng lại được khi phần mềm chết** — với splat, đây mới là rủi ro chính (mục 3.5). **(b)** `docs/02:145` yêu cầu tính lại checksum cả ba tầng gồm tầng lạnh mỗi quý; áp dụng nguyên văn cho băng từ là tiêu hao không cần thiết và tốn ~4,9 giờ đọc/lượt (mục 5.4).
- **Lợi ích lâu dài.** Phép thử tái tạo là cách duy nhất phát hiện sớm rằng gói bảo hiểm đã hỏng — trong khi vẫn còn thời gian số hóa lại. Điều chỉnh lịch băng kéo dài tuổi thọ vật tư mà không giảm mức bảo đảm.
- **Ai đang làm.** Nguyên tắc "kiểm tra khả năng dựng lại, không chỉ kiểm tra bit" là thực hành cốt lõi của các kho lưu trữ số theo mô hình OAIS; **DPC** nhấn mạnh rủi ro "định dạng còn nguyên nhưng không còn dựng lại được" trong các báo cáo Technology Watch.
- **Cost.** Viết quy trình + tích hợp vào màn Sao lưu: 2 người-ngày ≈ **240 USD**. Vận hành: 3–5 người-ngày mỗi 2 năm (chủ yếu là thời gian máy huấn luyện lại) ≈ **360–600 USD/2 năm**.
- **Ưu tiên.** **P1** · **[6 tháng]** cho quy trình, **[18 tháng]** cho lần thử đầu tiên trên dữ liệu thật.
- **Rủi ro nếu không làm.** Phát hiện gói bảo hiểm hỏng vào đúng lúc cần dùng nó — tức là quá muộn.

---

### FMT-12 — Cưỡng chế bất biến bằng kỹ thuật và tính checksum tại chỗ

- **Vì sao.** `docs/02:58` mô tả tầng AIP "ghi một lần, chỉ đọc" nhưng không nêu cơ chế cưỡng chế; kịch bản ransomware ở `docs/02:231-236` chỉ được chống đỡ bằng "cách ly mạng một phần" (`docs/02:59`) — không đủ khi kẻ tấn công chiếm được quyền quản trị. Song song, nếu tính checksum bằng cách kéo tệp qua mạng 1 GbE thì một lượt fixity 7 TB mất **~15,6 giờ** thay vì ~2 giờ (bảng 5.3).
- **Lợi ích lâu dài.** Khoá đối tượng ở chế độ tuân thủ khiến ngay cả tài khoản quản trị cao nhất cũng không xoá được trước hạn — đúng tính chất cần cho dữ liệu di sản quốc gia. Tính checksum tại chỗ khiến lịch fixity của tài liệu 02 khả thi thay vì chỉ khả thi trên giấy.
- **Ai đang làm.** Khoá đối tượng chế độ tuân thủ và băng WORM là tính năng tiêu chuẩn của các nền tảng lưu trữ đối tượng và thư viện băng hiện nay; **NDSA Levels of Digital Preservation** (khung mà `docs/02:308-318` đã dùng) xếp việc chống sửa đổi có chủ ý vào các mức cao của khía cạnh Security.
- **Cost.** Cấu hình: 2–3 người-ngày ≈ **240–360 USD**. Hạ tầng: **0 USD tăng thêm** — băng WORM và tính năng khoá đối tượng nằm trong capex đã tính ở mục 6.5; chỉ cần chọn đúng loại vật tư khi mua.
- **Ưu tiên.** **P1** · **[18 tháng]** (cần hạ tầng đã mua)
- **Rủi ro nếu không làm.** Ransomware mã hoá luôn cả bản sao — kịch bản 4 của tài liệu 02 mất chỗ dựa, vì bản "cách ly một phần" vẫn ghi đè được.

---

## 8. Bảng tổng hợp xếp theo ROI

ROI = (mức giảm rủi ro mất dữ liệu vĩnh viễn + trọng lượng trước hội đồng chấm thầu) ÷ chi phí. Sắp giảm dần.

| # | Mã | Đề xuất | Người-ngày | ≈ USD | Ưu tiên | Phân kỳ | Tác động chính |
|---|---|---|---|---|---|---|---|
| 1 | **FMT-09** | Trung thực hoá phần mô phỏng | 0,5 | 60 | P0 | Demo thầu | Xoá rủi ro uy tín với chi phí gần bằng 0 |
| 2 | **FMT-06** | Cập nhật ADR 0008 + sửa khẳng định sai về splat | 1–2 | 120–240 | P0 | Demo thầu | Sửa 1 điểm lạc hậu + 1 lỗi kỹ thuật, biến thành điểm mạnh |
| 3 | **FMT-08** | Sửa 3 hằng số dung lượng + hiệu chỉnh cơ số | 1–2 | 120–240 | P0 | Demo thầu | Sửa cơ số sai 55× cho toàn bộ dự toán hạ tầng |
| 4 | **FMT-01** | Thêm tầng bản bảo quản (vai trò tệp thứ tư) | 2–3 | 240–360 | P0 | Demo thầu | Khớp sản phẩm với chiến lược 3 tầng đã tuyên bố |
| 5 | **FMT-02** | Mô hình hoá gói nguyên liệu (ảnh nguồn) | 3–4 | 360–480 | P0 | Demo thầu + 18 tháng | Bảo hiểm thật duy nhất; 54% dung tích kho |
| 6 | **FMT-03** | Manifest tệp (một tài sản = nhiều tệp) | 5–8 | 600–960 | P0 | Demo thầu | Điều kiện cần cho hầu hết mục còn lại; chặn mất texture OBJ |
| 7 | **FMT-04** | Bộ trường siêu dữ liệu kỹ thuật | 6–10 | 720–1.200 | P0 | Demo thầu | Nâng độ phủ từ ~3%; điều kiện để dữ liệu có giá trị khoa học |
| 8 | **FMT-07** | Bản GLB + `KHR_gaussian_splatting` | 2 (+10–15) | 240 (+1.200–1.800) | P1 | Demo thầu + 6 tháng | Đưa splat vào chuẩn mở — điểm bán hàng mạnh nhất |
| 9 | **FMT-05** | Từ vựng định dạng + PUID + theo dõi lỗi thời | 4–6 (+8–12) | 480–720 (+960–1.440) | P1 | Demo thầu + 6 tháng | Biến cam kết rà soát định dạng thành khả thi |
| 10 | **FMT-11** | Phép thử tái tạo + điều chỉnh lịch fixity băng | 2 (+3–5/2 năm) | 240 (+360–600) | P1 | 6–18 tháng | Phát hiện sớm gói bảo hiểm hỏng |
| 11 | **FMT-10** | Kiểm tra tệp thật khi tải lên | 2–3 (+8–12) | 240–360 (+960–1.440) | P1 | Demo thầu + 6 tháng | Chặn dữ liệu kém tại cửa vào |
| 12 | **FMT-12** | Object lock/WORM + checksum tại chỗ | 2–3 | 240–360 | P1 | 18 tháng | Chống ransomware thật; lịch fixity khả thi |

**Gói tối thiểu nên làm trước buổi chấm thầu** — FMT-09, FMT-06, FMT-08, FMT-01, FMT-02, FMT-03, FMT-04: **19–30 người-ngày ≈ 2.280–3.600 USD**. Gói này xử lý toàn bộ 5 khoảng cách xếp hạng "Nghiêm trọng" và "Cao" ở mục 1, và không mục nào cần backend.

**Toàn bộ 12 đề xuất:** ≈ **31–48 người-ngày cho phần làm ngay** (≈ 3.720–5.760 USD), cộng **29–44 người-ngày cho phần cần backend** (≈ 3.480–5.280 USD). Hạ tầng tăng thêm so với dự toán mục 6.5: **0 USD** — mọi đề xuất đều nằm trong dung tích và thiết bị đã tính.

---

## 9. Nguồn tham chiếu

> **Quy ước tin cậy.** Mục có dấu **✔** đã được truy cập và đối chiếu trực tiếp trong quá trình lập báo cáo, ngày **12/08/2026**. Mục **không** có dấu là tài liệu chuẩn ngành được dẫn theo tên gọi chính thức từ kiến thức chuyên môn — **cần đối chiếu bản mới nhất trước khi trích nguyên văn vào hồ sơ nộp thầu**.

### 9.1. Gaussian splatting và chuẩn 3D

- ✔ Khronos Group, *"Khronos Announces glTF Gaussian Splatting Extension"*, thông cáo báo chí, Beaverton OR, 03/02/2026 — <https://www.khronos.org/news/press/gltf-gaussian-splatting-press-release>
- ✔ Khronos Group, đặc tả `KHR_gaussian_splatting` (trạng thái *Release Candidate*) — <https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_gaussian_splatting/README.md>
- ✔ ISO/IEC 12113:2022, *Information technology — Runtime 3D asset delivery format — Khronos glTF 2.0* — <https://www.iso.org/standard/83990.html>
- ✔ Khronos Group, *"Khronos glTF 2.0 released as an ISO/IEC International Standard"*, 08/2022 — <https://www.khronos.org/news/press/khronos-gltf-2.0-released-as-an-iso-iec-international-standard>
- ✔ PlayCanvas, *Splat File Formats* (tổng quan PLY / Compressed PLY / SOG / SPZ / SPLAT / KSPLAT) — <https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/>
- ✔ PlayCanvas, *"PlayCanvas Open Sources SOG"* — <https://blog.playcanvas.com/playcanvas-open-sources-sog-format-for-gaussian-splatting/>
- ✔ PlayCanvas, `splat-transform` (công cụ chuyển đổi mã nguồn mở) — <https://github.com/playcanvas/splat-transform>
- ✔ Niantic/Scaniverse, công bố mã nguồn mở định dạng nén SPZ — <https://radiancefields.com/scaniverse-open-sources-spz-compression-for-3dgs>
- Kerbl, Kopanas, Leimkühler, Drettakis, *"3D Gaussian Splatting for Real-Time Radiance Field Rendering"*, SIGGRAPH 2023 — bài báo gốc định nghĩa quy ước thuộc tính PLY 3DGS

### 9.2. Định dạng point cloud, ảnh, tài liệu

- ✔ ASTM E2807-11(2019), *Standard Specification for 3D Imaging Data Exchange, Version 1.0* (định dạng E57) — <https://www.astm.org/Standards/E2807.htm>
- ISO/IEC 15444-1 — JPEG 2000, hệ mã hoá lõi
- ISO 19005 (PDF/A), các phần 1–4 — lưu ý chọn đúng phần khi quy định trong hồ sơ
- ASPRS, đặc tả LAS (và LAZ như hiện thực nén mã nguồn mở đi kèm)
- OGC 3D Tiles — Community Standard cho streaming dữ liệu 3D quy mô lớn

### 9.3. Âm thanh và hình ảnh động

- ✔ IETF RFC 9043, *FFV1 Video Coding Format Versions 0, 1, and 3* (Informational, 08/2021, nhóm làm việc CELLAR) — <https://www.rfc-editor.org/info/rfc9043/>
- ✔ IETF RFC 9559, *Matroska Media Container Format Specification* (Proposed Standard, nhóm làm việc CELLAR)
- ✔ Library of Congress, *Sustainability of Digital Formats* — mục FFV1 <https://www.loc.gov/preservation/digital/formats/fdd/fdd000341.shtml> và mục Matroska + FFV1 <https://www.loc.gov/preservation/digital/formats/fdd/fdd000343.shtml>
- IASA TC-04, *Guidelines on the Production and Preservation of Digital Audio Objects* — căn cứ cho mức tối thiểu 48 kHz/24-bit
- AMWA AS-07 — đặc tả ứng dụng MXF cho lưu trữ nghe nhìn dài hạn
- EBU Tech 3285 — Broadcast Wave Format (BWF)

### 9.4. Số hóa 2D và hiệu chuẩn màu

- FADGI (Federal Agencies Digital Guidelines Initiative), *Technical Guidelines for Digitizing Cultural Heritage Materials* — hệ đánh giá theo sao, dùng làm ngưỡng QC
- Metamorfoze, *Preservation Imaging Guidelines* (Hà Lan) — bộ tiêu chí song song với FADGI, nghiêm ngặt hơn ở một số hạng mục

### 9.5. Khung bảo quản, sổ đăng ký định dạng, siêu dữ liệu 3D

- The National Archives (Anh) — sổ đăng ký định dạng **PRONOM** và công cụ nhận dạng **DROID**
- Library of Congress — *Recommended Formats Statement* (cập nhật hằng năm) và chuẩn siêu dữ liệu bảo quản **PREMIS**
- NARA (Hoa Kỳ) — *Digital Preservation Framework*, đánh giá rủi ro theo từng định dạng
- NDSA — *Levels of Digital Preservation* (khung đã dùng ở `docs/02` mục 10)
- IETF RFC 8493 — **BagIt**, đặc tả đóng gói kèm tệp kê khai checksum
- Digital Preservation Coalition (DPC) — *Technology Watch Reports* và *Bit List* (danh mục định dạng nguy cấp)
- Archaeology Data Service (ADS) — *Guides to Good Practice*, phần quét laser và photogrammetry cận cảnh
- Smithsonian Digitization Program Office — hướng dẫn siêu dữ liệu tối thiểu cho 3D và viewer mã nguồn mở **Voyager**
- CARARE — lược đồ siêu dữ liệu di sản kiến trúc/khảo cổ; **3D-ICONS** — hướng dẫn số hóa 3D di tích (dự án EU)
- Europeana — khung xuất bản và hướng dẫn nội dung 3D
- IIIF — nhóm đặc tả kỹ thuật 3D *(trạng thái đặc tả cần kiểm chứng tại thời điểm nộp hồ sơ)*
- Historic England — hướng dẫn kỹ thuật quét laser và photogrammetry cho di sản
- CyArk; Factum Foundation; Getty Conservation Institute — thực hành lưu trữ dữ liệu thu nhận thô song song với sản phẩm đã xử lý

### 9.6. Tài liệu nội bộ đã đối chiếu

- `docs/02-quy-trinh-bao-quan-sao-luu.md` — OAIS/PREMIS, 3-2-1, fixity, chiến lược định dạng mục 7
- `docs/12-chat-luong-du-lieu.md` — ISO/IEC 25012
- `docs/adr/0008-tach-haspreservationsurrogate-khoi-derivedfrom.md`
- `data/README.md`; `data/06-metadata/*.csv` (5 template)
- Mã nguồn: `app/src/services/types.ts`, `app/src/data/digitization.ts`, `app/src/data/sizeFormulas.ts`, `app/src/data/metadataFields.ts`, `app/src/data/physicalSpecs.ts`, `app/src/data/objects/*`, `app/src/pages/UploadPage.tsx`, `app/src/pages/BackupPage.tsx`, `app/src/pages/AssetDetailPage.tsx`, `app/src/services/mock/uploadService.ts`, `app/src/components/StelePreview.tsx`, `app/src/i18n/vi.ts`

---

*Báo cáo lập ngày 12/08/2026 theo lăng kính định dạng gốc/bảo quản/dẫn xuất và siêu dữ liệu kỹ thuật cho media nặng. Số liệu dung lượng bộ dữ liệu hiện tại được tính bằng cách nạp trực tiếp `app/src/data/assets.ts`. Không sửa đổi bất kỳ tệp nào ngoài chính tài liệu này.*
