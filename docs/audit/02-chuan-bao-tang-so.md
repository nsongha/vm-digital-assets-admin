# Audit 02 — Đối chiếu tiêu chuẩn bảo tàng số quốc tế

> Người thực hiện: subagent lăng kính chuẩn di sản số · Ngày: 12/08/2026
> Phạm vi soi: `app/` (React 19 + Vite, ~14.5k LOC, lớp mock service), `docs/` (17 tài liệu + 16 ADR), `data/06-metadata/` (5 template CSV).
> Nguyên tắc: mọi khẳng định về hiện trạng app đều kèm `đường/dẫn:dòng`. Chuẩn nào không chắc phiên bản/năm đều ghi `(cần kiểm chứng)`.

---

## 1. Tóm tắt điều hành

### 1.1. Kết luận một câu

Hồ sơ này **đã ở nhóm trên so với mặt bằng dự án số hóa di sản Việt Nam** — có OAIS, PREMIS, fixity, rights statement, EDTF, Getty AAT trong mô hình dữ liệu, điều mà phần lớn hồ sơ thầu cùng loại không có. Nhưng đối chiếu với chuẩn quốc tế ở mức "đứng cạnh Rijksmuseum / Yale LUX / Gallica" thì khoảng cách nằm ở **chỗ khác với chỗ đội dự án đang nghĩ**: không phải thiếu tên chuẩn, mà là **các chuẩn đã nêu tên chưa được thực thi tới mức máy đọc được** — và có ba lỗ hổng cấu trúc thực sự nghiêm trọng: **không có IIIF, không có định danh bền vững phân giải được (ARK/DOI/Handle), và không có đường xuất bản LIDO/EDM ra ngoài**.

### 1.2. Bức tranh chia ba

**(a) Đã làm tốt hơn kỳ vọng — cần giữ và khoe đúng cách**

Đội dự án đã đưa vào những thứ mà hồ sơ thầu Việt Nam gần như không bao giờ có:

- **Kiến trúc OAIS 3 tầng thật sự**, không phải khẩu hiệu: `StorageTier` `HOT | AIP | COLD` (`app/src/data/digitization.ts:280-286`), gắn vào từng tệp qua `AssetFileRow.storageTier` (`digitization.ts:288-298`), và bản gốc bất biến nằm ở AIP/COLD chứ không phải HOT (`digitization.ts:331`).
- **Fixity là công dân hạng nhất trong UI**, có cả trạng thái "lệch checksum" chứ không chỉ trạng thái đẹp: `FixityStatus = 'DA_XAC_MINH' | 'CHUA_KIEM_TRA' | 'LECH_CHECKSUM'` (`digitization.ts:272-278`).
- **Bảng `PREMIS_EVENT` với 11 loại sự kiện** trong mô hình dữ liệu (`docs/07-mo-hinh-du-lieu.md:238`), bao gồm cả `DEACCESSION` — và `DEACCESSION` được nối đúng vào trạng thái "Đã gỡ/thu hồi" giữ bản ghi thay vì xoá (`app/src/services/types.ts:9-11,23`). Đây là tư duy bảo quản chín, không phải tư duy CMS.
- **Bộ 5 mã khuyết giá trị có ngữ nghĩa khác nhau** (`app/src/data/missingValues.ts:7-32`) — phân biệt "Không áp dụng" (ra khỏi mẫu số) với "Chưa nhập liệu" (vào hàng đợi) với "Không rõ/Khuyết danh" (đã tra cứu, kết luận không rõ, KHÔNG trừ điểm). Rất nhiều bảo tàng châu Âu vẫn để trống ô và không phân biệt được ba trường hợp này.
- **Bản dẫn xuất bảo hiểm cho Gaussian splat** — nhận ra `.splat` chưa có chuẩn ISO/OGC và bắt buộc giữ point cloud PLY/E57 ở AIP, không bao giờ xoá (`digitization.ts:390`, `docs/02-quy-trinh-bao-quan-sao-luu.md:257`). Đây là lập luận bảo quản đúng và **hiếm** — công nghệ 3DGS mới từ 2023, phần lớn dự án đang lưu `.splat` như thể nó là định dạng vĩnh cửu.
- **Song thẩm Hán Nôm** (người dịch ≠ người thẩm định) cưỡng chế ở tầng form (`app/src/components/CoreMetadataForm.tsx:76-79,210`) và ở tầng dữ liệu (`digitization.ts:441-446`).

**(b) Có tên chuẩn nhưng chưa thực thi tới mức máy đọc được — đây là rủi ro lớn nhất cho hồ sơ thầu**

Đây là nhóm nguy hiểm vì **trông như đã đạt**. Hội đồng chấm thầu có chuyên gia sẽ hỏi đúng vào đây:

| Chuẩn được nêu tên | Nêu ở đâu | Thực tế thực thi |
|---|---|---|
| Getty AAT / TGN / Iconclass | `docs/07-mo-hinh-du-lieu.md:209`, `app/src/i18n/vi.ts:115` ("ánh xạ Getty AAT") | `app/src/data/taxonomy.ts` **không có một URI từ vựng nào**; thẻ vẫn là chuỗi tiếng Việt tự do (`app/src/data/metadataFields.ts:63-72`) |
| CIDOC-CRM | `app/src/data/taxonomy.ts:3-9`, `app/src/components/PhysicalSpecsForm.tsx:12`, `docs/adr/0007` | Dùng ở mức **tách lớp khái niệm** (vật lý ≠ số) và **một lớp E54 Dimension**. Chưa có một property CRM nào (`P62`, `P138`, `P108`…) |
| RightsStatements.org | `digitization.ts:123` ("theo RightsStatements.org") | `RIGHTS_STATEMENTS` (`digitization.ts:81-97`) lưu **mã trần không URI**, và **trộn lẫn** giấy phép CC với rights statement — xem §3.5.1 |
| Dublin Core | `app/src/i18n/vi.ts:51`, `CoreMetadataForm.tsx:9` ("DC rút gọn") | Không có bảng ánh xạ DC nào trong `app/`; chỉ tồn tại ở tài liệu |
| OAI-PMH | `app/src/data/complianceEvidence.ts:190`, `app/src/pages/CompliancePage.tsx:544` ("kênh /oai") | **Không có endpoint, không có schema, không có code**. Đang được trưng ra như đã có |
| Spectrum | `app/src/i18n/vi.ts:140`, `docs/adr/0007:13` — ghi **"Spectrum 5.0"** | Phiên bản hiện hành là **Spectrum 5.1 (9/2022)**. Viện dẫn sai phiên bản |

**(c) Lỗ hổng cấu trúc thật — không có gì để chỉ vào**

- **IIIF: gần như bằng không.** Toàn bộ `app/src/` không có một dòng nào liên quan IIIF (grep toàn thư mục: 0 kết quả). Trong tài liệu, IIIF xuất hiện đúng **hai lần**, cả hai đều đẩy sang tương lai: `docs/thuat-ngu.md:112` ("Thuộc phạm vi giai đoạn 2") và `docs/02-quy-trinh-bao-quan-sao-luu.md:256` (nhắc JPEG2000 "hỗ trợ deep zoom qua IIIF"). Với một kho có **82 bia Tiến sĩ UNESCO** — vốn là hiện vật văn bản, chữ Hán dày đặc, nhu cầu zoom sâu + so sánh bản dập là nhu cầu nghiên cứu số một — đây là lỗ hổng nghiêm trọng nhất của toàn hồ sơ.
- **Định danh bền vững: không có.** Mã `VM-<OC>-NNNNN.<DF><nn>` (`app/src/services/types.ts:52-57`) là **mã nội bộ, không phân giải được, không có cam kết thể chế**. `pid_quoc_gia` để trạng thái "Roadmap — chưa bắt buộc" (`docs/07-mo-hinh-du-lieu.md:66`) và ARK/Handle bị đẩy xuống "Lộ trình xa hơn" (`07-mo-hinh-du-lieu.md:68`).
- **LIDO: chỉ có trong bảng thuật ngữ.** `docs/thuat-ngu.md:110` định nghĩa LIDO một dòng; `docs/12-chat-luong-du-lieu.md:108` nhắc "bảng ánh xạ … LIDO". Không có schema, không có bộ xuất, không có hồ sơ trường bắt buộc LIDO nào trong `app/`.
- **METS: bị đẩy xuống "Level 4 — Giai đoạn 2"** (`docs/02-quy-trinh-bao-quan-sao-luu.md:317`). Nhưng tài liệu Hán Nôm nhiều trang **đã tồn tại ngay bây giờ** trong template (`data/06-metadata/template-tai-lieu-han-nom.csv` — cột "Số trang", dòng mẫu có `vm_doc_020_mat1.tif;vm_doc_020_mat2.tif`). Không có cấu trúc trang thì không thể IIIF, không thể trích dẫn trang, không thể OCR/phiên âm theo vùng.
- **Europeana / EDM / Linked Art: không xuất hiện ở bất kỳ đâu** trong cả `app/` lẫn `docs/`.
- **ULAN, VIAF, Wikidata: không có.** Từ vựng kiểm soát dừng ở `GETTY_AAT|ICONCLASS|TGN|ISO_639|ISO_3166` (`docs/07-mo-hinh-du-lieu.md:209`) — **thiếu trục nhân danh hoàn toàn**. Với 82 bia Tiến sĩ, thứ có giá trị nghiên cứu cao nhất chính là **danh sách ~1.300 tiến sĩ khắc trên bia** — tức là dữ liệu nhân danh.

### 1.3. Ba việc đắt nhất nếu không làm bây giờ

1. **Không có định danh bền vững** → mọi trích dẫn học thuật quốc tế tới dữ liệu Văn Miếu sẽ trỏ vào URL sẽ chết. Sửa sau khi đã công bố là **không sửa được** (link đã phát tán). Đây là quyết định một chiều.
2. **Không có IIIF** → 82 bia Tiến sĩ không thể tham gia hệ sinh thái nghiên cứu văn bản quốc tế. Các nhóm Hán Nôm học ở NDL Nhật Bản, Academia Sinica, National Palace Museum Đài Bắc đều làm việc qua IIIF; không có manifest thì dữ liệu Văn Miếu **không tồn tại** với họ.
3. **Không có bộ xuất LIDO/EDM** → hồ sơ UNESCO Ký ức Thế giới của 82 bia là hồ sơ **quốc tế**; khi UNESCO hoặc đối tác quốc tế hỏi "dữ liệu số của các ông theo chuẩn nào, lấy về thế nào", câu trả lời hiện tại là "CSV tiếng Việt và một cổng dữ liệu mở cấp Thành phố".

### 1.4. Đánh giá tổng thể

| Trục | Điểm | Nhận định |
|---|---|---|
| **Bảo quản dài hạn (OAIS/PREMIS)** | 7/10 | Nền tảng tốt bất thường. Thiếu: SIP tường minh, PREMIS entity đầy đủ, cập nhật ISO 14721:2025 |
| **Mô tả & ngữ nghĩa (LIDO/CRM/CCO)** | 4/10 | Tách trục đúng, nhưng chưa có property CRM, chưa có LIDO, chưa ràng buộc từ vựng |
| **Truy cập & liên thông (IIIF/EDM/OAI-PMH)** | 1.5/10 | Lỗ hổng lớn nhất. IIIF = 0. OAI-PMH được trưng ra nhưng chưa tồn tại |
| **Quyền (RightsStatements/CC)** | 5/10 | Có tư duy đúng, sai kỹ thuật (không URI, trộn vocabulary) |
| **Định danh bền vững (ARK/DOI)** | 2/10 | Mã nội bộ có kỷ luật, nhưng không phân giải được, không cam kết |
| **Từ vựng chuẩn (Getty/Iconclass/VIAF)** | 3/10 | Có khung bảng, chưa có dữ liệu, thiếu trục nhân danh |
| **Chứng nhận kho tin cậy** | 3/10 | NDSA self-assessment tốt; chưa nhắm CoreTrustSeal/ISO 16363 |
| **Đa ngữ & Hán Nôm** | 4/10 | Có trường phiên âm/dịch + song thẩm; thiếu BCP 47, thiếu cam kết CJK Ext |

**Tổng: ~3.7/10 so với chuẩn quốc tế hàng đầu — nhưng ~7/10 so với mặt bằng dự án di sản số Việt Nam.**

Điểm mấu chốt cho hồ sơ thầu: **phần lớn khoảng cách có thể thu hẹp bằng công việc metadata và tài liệu, không cần backend.** 6/18 đề xuất dưới đây làm được **ngay trong bản demo mock**.

---

## 2. Bảng chấm điểm theo chuẩn

Thang: **Chưa** (không có dấu vết) · **Một phần** (có tên/khung nhưng chưa thực thi được) · **Đạt** (thực thi tới mức kiểm chứng được).

### 2.1. Khối bảo quản dài hạn

| Chuẩn | Yêu cầu cốt lõi | Mức đạt | Bằng chứng | Việc cần làm |
|---|---|---|---|---|
| **OAIS ISO 14721:2025** (3rd ed, = CCSDS 650.0-M-3, 12/2024; thay ISO 14721:2012) | Tách SIP/AIP/DIP; 6 chức năng: Ingest, Archival Storage, Data Management, Administration, Preservation Planning, Access | **Một phần** | Tầng lưu trữ `HOT/AIP/COLD` có thật (`digitization.ts:280-286`); bảng định dạng AIP vs DIP (`docs/02:254-259`); tài liệu viện dẫn OAIS (`complianceEvidence.ts:59,76`) | Viện dẫn đang là **ISO 14721:2012 ngầm định** — cập nhật lên **:2025**. **SIP chưa tồn tại tường minh** (không có manifest gói nộp). "AIP" đang bị dùng như *tầng lưu trữ*, không phải *gói tin* — sai khái niệm OAIS. → **STD-01, STD-02** |
| **OAIS — PDI** (Provenance, Context, Reference, Fixity, Access Rights) | 5 thành phần PDI phải gắn với Content Information | **Một phần** | Fixity ✓ (`digitization.ts:293-296`); Access Rights ✓ (`digitization.ts:107-121`); Provenance một phần qua version (`digitization.ts:206-237`) | **Reference** yếu (không PID bền vững); **Context** chưa có cấu trúc (breadcrumb suy ra từ chuỗi `loc`, `digitization.ts:415-423`) → **STD-12** |
| **PREMIS 3.0** (LoC, 10/6/2015) | 4 thực thể: Object · Event · Agent · Rights; fixity; significant properties | **Một phần** | `PREMIS_EVENT` 11 loại (`docs/07:238`); `DEACCESSION` nối đúng nghiệp vụ (`types.ts:9-11`) | Chỉ có **Event**. Thiếu **Object** (không `objectCharacteristics`, không format registry), thiếu **Agent** tường minh, thiếu **Rights** như PREMIS entity. `eventType` là enum tiếng Việt tự chế, không phải từ vựng LoC → **STD-03** |
| **PREMIS — fixity** | `messageDigestAlgorithm` + `messageDigest` + lịch sử kiểm tra | **Một phần** | `checksum` + `fixityStatus` + `fixityCheckedAt` (`digitization.ts:293-296`) | **Không lưu tên thuật toán** (SHA-256 chỉ nằm ở nhãn UI `i18n/vi.ts:127`); chỉ lưu **một mốc** kiểm tra gần nhất, **không có lịch sử** → không chứng minh được chuỗi toàn vẹn liên tục → **STD-04** |
| **PREMIS — significant properties / format** | Ghi thuộc tính phải bảo toàn qua di trú; định danh định dạng (PRONOM PUID) | **Chưa** | `Asset.fmt` là chuỗi tự do (`types.ts:63`); `EXT_BY_DIGITAL_FORM` chỉ là đuôi tệp (`digitization.ts:261-270`) | Không có PUID, không có significant properties. Kế hoạch nhắc PRONOM nhưng ở "Level 4 — Giai đoạn 2" (`docs/02:318`) → **STD-05** |
| **METS** | Gói cấu trúc: `structMap` cho tài liệu nhiều phần | **Chưa** | Đẩy sang Giai đoạn 2 (`docs/02:317`) | Tài liệu Hán Nôm nhiều trang **đã có ngay** (`data/06-metadata/template-tai-lieu-han-nom.csv` cột "Số trang" + 2 tệp mặt) mà không có structMap → **STD-02** |
| **NDSA Levels of Preservation** (v2.0, 2019 — *cần kiểm chứng phiên bản đang dùng*) | Tự đánh giá 5 khía cạnh × 4 mức | **Đạt** | Bảng đầy đủ 5 khía cạnh, có mức hiện tại/mục tiêu/lộ trình (`docs/02:308-318`) | Giữ nguyên. Đây là điểm mạnh nên nêu bật trong hồ sơ thầu |

### 2.2. Khối mô tả & ngữ nghĩa

| Chuẩn | Yêu cầu cốt lõi | Mức đạt | Bằng chứng | Việc cần làm |
|---|---|---|---|---|
| **CIDOC-CRM** (ISO 21127:2023 = community v7.1.3) | Mô hình sự kiện; tách E22 vật thể ↔ E36 hình ảnh; dùng property (P62, P108, P138…) | **Một phần** | Tách 2 trục `ObjectClass` × `DigitalForm` theo tinh thần CRM (`taxonomy.ts:3-9`, `docs/adr/0003`); E54 Dimension cho kích thước lặp lại (`PhysicalSpecsForm.tsx:12`, `docs/adr/0007`) | Dùng ở mức **cảm hứng khái niệm**, chưa mức mô hình. Không một property CRM nào trong code. Quan hệ là nhãn tiếng Anh tự chế (`digitization.ts:396-401`) chứ không phải CRM/LIDO term → **STD-07** |
| **LIDO 1.1** (ICOM-CIDOC, 12/2021) | Schema XML trao đổi; nhóm bắt buộc: descriptiveMetadata + administrativeMetadata; `lido:lidoRecID` | **Chưa** | Chỉ 1 dòng thuật ngữ (`docs/thuat-ngu.md:110`) + 1 nhắc trong bảng ánh xạ (`docs/12:108`) | Không schema, không bộ xuất, không hồ sơ trường bắt buộc → **STD-06** |
| **Dublin Core** (ISO 15836-1:2017 / -2:2019; VN: TCVN 7980-1:2024) | 15 yếu tố lõi; DCMI Terms | **Một phần** | Nhãn UI khẳng định "DC rút gọn" (`i18n/vi.ts:51`, `CoreMetadataForm.tsx:9`); chỉ số chất lượng đo tỷ lệ ánh xạ DC (`docs/12:106`) | **Trong `app/` không có một bảng ánh xạ DC nào.** Form lõi thiếu hẳn `dc:creator`, `dc:publisher`, `dc:language`, `dc:source` (`CoreMetadataForm.tsx:57-71`) → **STD-06** |
| **CCO** (Cataloging Cultural Objects, 2006) | Quy tắc biên mục: Work ↔ Image; ưu tiên nguồn; tên ưu tiên/thay thế | **Một phần** | Tách Work/Image đúng qua `physicalObjectId` ↔ `code` (`types.ts:52-57`) — đây chính là nguyên tắc Work/Image của CCO | Không có tên thay thế (chữ Hán / phiên âm / tên Pháp thuộc) như trường có cấu trúc; `Asset.name` là một chuỗi (`types.ts:58`) → **STD-15** |
| **Spectrum 5.1** (Collections Trust, 9/2022) — 21 quy trình | Object entry, Acquisition, Location & movement, Cataloguing, Inventory, Condition checking, Loans in/out, Deaccession… | **Một phần** | Kiểm kê định kỳ có thật và làm đúng cấp đối tượng vật lý (`InventoryPage.tsx:18-29`); `DEACCESSION` có trong PREMIS event (`docs/07:238`) | **Viện dẫn sai phiên bản: "Spectrum 5.0"** ở `i18n/vi.ts:140` và `docs/adr/0007:13`. Thiếu Loans in/out, Condition checking, Object entry như quy trình → **STD-08** |
| **EDTF / ISO 8601-2:2019** | Level 0/1/2; `?` `~` `%` `X`; khoảng mở `..` | **Một phần** | Có trường `eraEdtf` + `eraCertainty` (`types.ts:69-72`), có validate (`CoreMetadataForm.tsx:39-42`), có ADR riêng (`docs/adr/0006`) | **Regex sai chuẩn**: chấp nhận từ khoá `unknown` (đã bị EDTF loại bỏ, thay bằng `..`/rỗng); **từ chối `1XXX`** (hợp lệ EDTF); **từ chối ngày đầy đủ `1928-06-15`**; thiếu `%`. Sai lan sang `docs/07:119` và `i18n/vi.ts:83-84` → **STD-16** |

### 2.3. Khối truy cập & liên thông

| Chuẩn | Yêu cầu cốt lõi | Mức đạt | Bằng chứng | Việc cần làm |
|---|---|---|---|---|
| **IIIF Image API 3.0** (4/6/2020) | Endpoint `{scheme}://{server}/{prefix}/{identifier}/{region}/{size}/{rotation}/{quality}.{format}` + `info.json` | **Chưa** | grep toàn `app/src/`: **0 kết quả**. Tài liệu chỉ nhắc gián tiếp (`docs/02:256`) và hoãn (`docs/thuat-ngu.md:112`) | Lỗ hổng nghiêm trọng nhất với 82 bia UNESCO → **STD-09** |
| **IIIF Presentation API 3.0** (4/6/2020) | Manifest JSON-LD: Canvas, AnnotationPage, `rights`, `requiredStatement`, `metadata`, `provider` | **Chưa** | Không có | Manifest tĩnh làm được **ngay trong mock**, không cần backend → **STD-09** |
| **IIIF Content Search 2.0** (2022) | Tìm trong nội dung văn bản của manifest | **Chưa** | Không có | Đúng nhu cầu Hán Nôm: tìm chữ trong bia → **STD-10** |
| **IIIF Change Discovery 1.0** (2021 — *ngày chính xác cần kiểm chứng*) | ActivityStreams cho harvest gia tăng | **Chưa** | Không có | Thay thế hiện đại cho OAI-PMH → **STD-10** |
| **IIIF Authorization Flow 2.0** (10/7/2023) | Kiểm soát truy cập ảnh phân giải cao theo tầng | **Chưa** | Có mức truy cập 3 tầng (`digitization.ts:107-113`) nhưng không nối IIIF | Khớp trực tiếp với `HAN_CHE`/`NOI_BO` → **STD-10** |
| **OAI-PMH 2.0** | Verb `Identify`, `ListRecords`, `GetRecord`; `oai_dc` bắt buộc | **Chưa (nhưng đang được trưng ra là có)** | `complianceEvidence.ts:190` và `CompliancePage.tsx:544` liệt kê "kênh /oai" như một kênh công bố đang hoạt động | **Rủi ro trung thực hồ sơ thầu.** Hoặc dựng, hoặc gắn nhãn "kế hoạch" → **STD-17** |
| **Europeana EDM + Publishing Framework** (content tier 1–4, metadata tier A–C) | Rights là **URI**; tier 4 cần CC BY / CC BY-SA / CC0 / PDM | **Chưa** | Không xuất hiện trong `app/` lẫn `docs/` | Đường ra quốc tế tự nhiên nhất cho 82 bia → **STD-17** |
| **Linked Art** (LOUD, trên CIDOC-CRM — *phiên bản chính xác cần kiểm chứng*) | JSON-LD, mô hình dùng được, không cần đọc CRM gốc | **Chưa** | Không xuất hiện | P2 — chỉ đáng làm sau khi có CRM property → **STD-07** |

### 2.4. Khối quyền, định danh, từ vựng

| Chuẩn | Yêu cầu cốt lõi | Mức đạt | Bằng chứng | Việc cần làm |
|---|---|---|---|---|
| **RightsStatements.org** (12 statement, URI `http://rightsstatements.org/vocab/{code}/1.0/`) | Rights statement là **URI**, tách khỏi giấy phép | **Một phần** | `RIGHTS_STATEMENTS` có `InC-EDU`, `UND` — **mã đúng** (`digitization.ts:81-97`); mô hình dữ liệu có `RIGHTS_STATEMENT.url` (`docs/07:245-253`) | **Không có URI trong code**; **trộn `CC-BY-4.0` (giấy phép CC) vào cùng enum với statement RightsStatements.org** — hai vocabulary khác nhau. Ô nhập giấy phép là text tự do (`CoreMetadataForm.tsx:148-150`) → **STD-11** |
| **Creative Commons 4.0** | URI `https://creativecommons.org/licenses/by/4.0/` | **Một phần** | `CC BY 4.0`/`CC BY-NC 4.0` xuất hiện dạng chuỗi (`CompliancePage.tsx:542-544`, `complianceEvidence.ts:188-190`) | Chuỗi hiển thị, không URI. **CC BY-NC không đạt Europeana content tier 4** → **STD-11, STD-17** |
| **Traditional Knowledge Labels** (Local Contexts) | Nhãn TK/BC cho tri thức cộng đồng | **Chưa** | Không có | P2 — cân nhắc cho nghi lễ/thực hành sống → §3.5.4 |
| **ARK** (ARK Alliance; NAAN) | Định danh phân giải được, cam kết thể chế, `?`/`??` metadata | **Chưa** | ARK/Handle ở "Lộ trình xa hơn" (`docs/07:68`); `pid_quoc_gia` "chưa bắt buộc" (`docs/07:66`) | Mã `VM-...` (`types.ts:52-57`) không phân giải được → **STD-12** |
| **DOI** (ISO 26324) | DOI cho tập dữ liệu có thể trích dẫn | **Chưa** | Không có | P2, cho bộ dữ liệu công bố → **STD-13** |
| **Handle System** | Hạ tầng phân giải | **Chưa** | Chỉ nhắc tên (`docs/07:68`) | Cân nhắc thay thế ARK → **STD-12** |
| **Getty AAT** | Ràng buộc loại hình vào `aat:` URI | **Một phần** | Bảng `CONTROLLED_VOCABULARY` có `GETTY_AAT`, ví dụ `aat:300010331` (`docs/07:207-213`); `artifact_type_vocab_id` (`docs/07:225`); nhãn UI hứa ánh xạ AAT (`i18n/vi.ts:115`) | **`app/src/data/taxonomy.ts` không có URI nào**; thẻ vẫn tự do (`metadataFields.ts:63-72`) → **STD-14** |
| **Getty TGN** | Địa danh chuẩn | **Một phần** | Có trong enum (`docs/07:209`) | `Asset.loc` là chuỗi tự do (`types.ts:73`), breadcrumb tách bằng `' — '` (`digitization.ts:415-423`) → **STD-14** |
| **Getty ULAN** | Nhân danh nghệ sĩ/tác giả | **Chưa** | **Không có trong enum** (`docs/07:209`) | Thiếu trục nhân danh hoàn toàn → **STD-14** |
| **Iconclass** | Phân loại chủ đề hình ảnh | **Một phần** | Có trong enum (`docs/07:209`, `docs/12:143`) | Chưa gán thực tế → **STD-14** |
| **VIAF / Wikidata** | Định danh nhân danh quốc tế, đặc biệt cho Hán Nôm | **Chưa** | Không xuất hiện | ~1.300 tiến sĩ trên 82 bia là tài sản dữ liệu lớn nhất chưa khai thác → **STD-15** |
| **Unicode CJK (Ext A–I)** | Mã hoá chữ Hán Nôm hiếm; IDS cho chữ chưa mã hoá | **Một phần** | Có trường "Nguyên văn Hán/Nôm" (`data/06-metadata/template-tai-lieu-han-nom.csv`), có ô nhập (`CoreMetadataForm.tsx:172-179`) | Không cam kết mặt phẳng CJK Ext nào, không quy trình cho chữ chưa mã hoá → **STD-15** |
| **IETF BCP 47** | Thẻ ngôn ngữ có script: `vi`, `lzh`, `vi-Hani`, `vi-Latn` | **Chưa** | `language` chỉ "ISO 639-1, mặc định vi" (`docs/07:125`) — ISO 639-1 **không biểu diễn được** Hán văn cổ (`lzh` là 639-3) | Ba lớp văn bản Hán Nôm cần ba thẻ khác nhau → **STD-15** |

### 2.5. Khối chuẩn số hóa & chứng nhận

| Chuẩn | Yêu cầu cốt lõi | Mức đạt | Bằng chứng | Việc cần làm |
|---|---|---|---|---|
| **FADGI Technical Guidelines for Digitizing Cultural Heritage Materials, 3rd ed.** (5/2023) | Sao ngôi (star) theo chỉ tiêu đo được: SFR/MTF, sai màu ΔE, nhiễu, độ đồng đều | **Một phần** | Viện dẫn "chuẩn FADGI/Metamorfoze 4-star" (`docs/02:130,255`); template ghi "600dpi 16-bit" (`data/06-metadata/template-anh.csv`) | **Không nêu edition** (2nd ed 2016 vs 3rd ed 5/2023). Không có **chỉ tiêu đo được** nào — chỉ có dpi/bit depth, vốn *không đủ* để tuyên bố sao FADGI. Không có target/thẻ màu trong quy trình → **STD-18** |
| **Metamorfoze** (NL) | Ba mức: Full / Light / Extra Light | **Một phần** | Nhắc kèm FADGI (`docs/02:130,255`) | Không nêu mức nào → **STD-18** |
| **ISO 19005 (PDF/A)** | Định dạng văn bản lưu trữ | **Đạt** | Nêu đích danh có số hiệu (`docs/02:256`); có trong định dạng nhận (`metadataFields.ts:41`) | Nêu rõ phần (PDF/A-2b hay -3b) |
| **ISO/IEC 15444 (JPEG2000)** | Ảnh nén không mất dữ liệu, deep zoom | **Đạt** | Nêu đích danh (`docs/02:256`); `JP2` trong định dạng nhận (`metadataFields.ts:41`) | Giữ nguyên |
| **ASTM E2807 (E57)** | Trao đổi đám mây điểm | **Đạt** | Nêu đích danh (`docs/02:257`); có trong định dạng (`metadataFields.ts:39`, `digitization.ts:262-264`) | Giữ nguyên — đây là chi tiết chuyên môn tốt |
| **ISO 16363:2025** (Audit and certification of trustworthy digital repositories — bản 2025 thay :2012) | 3 nhóm: Organizational infrastructure, Digital object management, Infrastructure & security risk | **Chưa** | Không xuất hiện | Là đích dài hạn; CoreTrustSeal là bước đệm → **STD-19** |
| **CoreTrustSeal** (Requirements **V04.00**, hiệu lực 1/1/2026–2028; 16 yêu cầu R01–R16; phí quản trị €1.000/chu kỳ 3 năm) | Tự đánh giá + bình duyệt đồng nghiệp | **Chưa** | Không xuất hiện | Khả thi trong 18 tháng — xem §5 → **STD-19** |
| **nestor Seal / DIN 31644** (DIN 31644:2012 — *năm cần kiểm chứng*) | Chứng nhận kho tin cậy (Đức) | **Chưa** | Không xuất hiện | Không khuyến nghị theo đuổi — xem §5.4 |
| **WCAG 2.1 AA** | Trợ năng giao diện | **Đạt (cam kết)** | Có trong thuật ngữ (`docs/thuat-ngu.md:113`) | Ngoài phạm vi audit này |

### 2.6. Tổng hợp đếm

| Mức | Số chuẩn | Ghi chú |
|---|---|---|
| **Đạt** | 5 | PDF/A, JPEG2000, E57, NDSA, WCAG — đều là chuẩn *kỹ thuật định dạng*, không phải chuẩn *mô tả/liên thông* |
| **Một phần** | 16 | Nhóm nguy hiểm — trông như đã đạt |
| **Chưa** | 15 | Trong đó IIIF (5 API) và định danh bền vững (3) là hai cụm nghiêm trọng nhất |

**Quan sát then chốt:** toàn bộ 5 chuẩn "Đạt" đều thuộc nhóm *định dạng tệp*. **Không một chuẩn mô tả, liên thông, hay định danh nào đạt mức "Đạt".** Đây chính là hình dạng của một dự án được dẫn dắt bởi tư duy kỹ thuật số hoá, chưa được dẫn dắt bởi tư duy **thư viện/bảo tàng số**.

---

## 3. Phân tích theo từng khối chuẩn

Mục này giải thích *tại sao* mỗi khối lại được chấm như trên, và chỉ ra chỗ sai khái niệm — thứ mà bảng chấm điểm không diễn đạt hết.

### 3.1. OAIS (ISO 14721:2025)

#### 3.1.1. Điều đã làm đúng

Dự án hiểu OAIS ở mức **kiến trúc**, không phải mức khẩu hiệu. Bằng chứng thuyết phục nhất là bảng định dạng lưu trữ vs. phân phối (`docs/02-quy-trinh-bao-quan-sao-luu.md:254-259`): mỗi loại tài sản có một định dạng AIP (bất biến, mở, không phụ thuộc hãng) và một định dạng DIP (tối ưu phân phối) **khác nhau**. Đây đúng là tinh thần OAIS. Việc chọn E57 (ASTM E2807) + PLY cho AIP scan 3D trong khi dùng glTF/GLB cho DIP là lựa chọn của người biết việc.

Tầng lưu trữ được hiện thực hoá trong code chứ không chỉ nằm trên giấy: `StorageTier = 'HOT' | 'AIP' | 'COLD'` (`app/src/data/digitization.ts:280-286`), và quy tắc gán tầng phản ánh đúng vòng đời — bản gốc nằm ở `AIP`, chuyển sang `COLD` khi bản ghi vào trạng thái lưu trữ dài hạn; bản tối ưu web luôn ở `HOT`; dữ liệu thô ở `COLD` (`digitization.ts:330-334`).

#### 3.1.2. Sai khái niệm cần sửa: "AIP" không phải một tầng lưu trữ

Đây là lỗi tinh vi nhưng chuyên gia OAIS sẽ nhận ra ngay. Trong ISO 14721, **AIP là một *gói tin* (Information Package)** — gồm Content Information + Preservation Description Information — chứ **không phải một *nơi cất*.** Hiện tại `STORAGE_TIER_LABELS.AIP = 'Tầng lưu trữ AIP'` (`digitization.ts:284`) đặt AIP ngang hàng với `HOT`/`COLD`, tức là đang dùng AIP như một địa điểm.

Hệ quả thực tế: khi hội đồng hỏi "cho tôi xem một AIP", hệ thống không có gì để đưa ra. Không có manifest, không có danh mục nội dung gói, không có PDI đóng kèm. Chỉ có một tệp nằm trên một tầng đĩa được đặt tên là "AIP".

Cách sửa đúng đắn nhất là giữ ba tầng lưu trữ nhưng **đổi tên tầng giữa** (ví dụ `ARCHIVE`/`Tầng lưu trữ bảo quản`) và tách khái niệm gói tin ra thành một thực thể riêng có manifest.

#### 3.1.3. SIP chưa tồn tại — mắt xích yếu nhất của chuỗi OAIS

OAIS bắt đầu bằng Ingest, và Ingest bắt đầu bằng **SIP**. Hiện tại luồng nhận dữ liệu là: chọn loại dữ liệu → điền form metadata (`app/src/data/metadataFields.ts:4-35`) → tải tệp lên. Không có bước nào tạo ra một **gói nộp có ranh giới, có manifest, có checksum tại nguồn**.

Điều này quan trọng hơn nó có vẻ. Toàn bộ giá trị pháp lý của fixity nằm ở chỗ **checksum được tính tại thời điểm nào**. Nếu checksum chỉ được tính *sau khi* tệp đã vào hệ thống, nó chứng minh được "tệp không đổi từ lúc vào kho" nhưng **không** chứng minh được "tệp không đổi từ lúc rời khỏi máy số hoá". Với dữ liệu di sản quốc gia và đặc biệt với 82 bia UNESCO, khoảng trống đó chính là khoảng trống trách nhiệm.

Chuẩn thực hành phổ biến là **BagIt** (RFC 8493) — thư mục có `bagit.txt`, `manifest-sha256.txt`, `bag-info.txt`. Đơn giản, không license, đã là mặc định của Library of Congress và Archivematica.

Đáng chú ý: tài liệu **đã biết** yêu cầu này — `docs/07-mo-hinh-du-lieu.md:68` dẫn TT 05/2025/TT-BNV liệt kê "mã định danh" là một trong bảy trường siêu dữ liệu bắt buộc của **gói SIP/AIP/DIP** (mục 5.7). Tức là nghĩa vụ pháp lý Việt Nam đã yêu cầu gói tin tường minh, nhưng hệ thống chưa có.

#### 3.1.4. Viện dẫn đã lỗi phiên bản

Tài liệu viện dẫn "OAIS (ISO 14721)" (`app/src/data/complianceEvidence.ts:59,76`) mà không nêu năm. Phiên bản hiện hành là **ISO 14721:2025** (ấn bản thứ ba, tương đương CCSDS 650.0-M-3 công bố 12/2024), thay thế ISO 14721:2012. Ấn bản 2025 làm rõ quan hệ giữa PDI và Content Data Object. Hồ sơ thầu nêu đúng năm sẽ tạo khác biệt rõ rệt về độ tin cậy chuyên môn.

Tương tự, **ISO 16363:2025** cũng đã thay thế ISO 16363:2012.

#### 3.1.5. Sáu chức năng OAIS — đối chiếu nhanh

| Chức năng OAIS | Hiện trạng | Bằng chứng |
|---|---|---|
| Ingest | **Yếu** — có form nhận nhưng không có SIP | `metadataFields.ts:4-35` |
| Archival Storage | **Tốt** — 3 tầng + 3-2-1 | `digitization.ts:280-286`, `complianceEvidence.ts:75` |
| Data Management | **Tốt** — mô hình dữ liệu chi tiết | `docs/07-mo-hinh-du-lieu.md` |
| Administration | **Tốt** — pipeline 11 trạng thái, 4 mắt, nhật ký hash-chain | `types.ts:12-23`, `complianceEvidence.ts:146` |
| Preservation Planning | **Trung bình** — có rà soát định dạng 2 năm/lần nhưng chưa có công cụ | `docs/02:318` |
| Access | **Yếu nhất** — không IIIF, không OAI-PMH thật, không API công khai theo chuẩn | §3.4 |

Hình dạng này rất đặc trưng: **mạnh ở giữa chuỗi, yếu ở hai đầu (Ingest và Access)**.

### 3.2. PREMIS 3.0

#### 3.2.1. Chỉ có một trong bốn thực thể

PREMIS 3.0 (LoC, 10/6/2015) định nghĩa bốn thực thể: **Object, Event, Agent, Rights**. Dự án hiện có **Event** khá tốt, ba thực thể còn lại thiếu hoặc rải rác.

**Event — có, và có điểm sáng.** Bảng `PREMIS_EVENT` liệt kê 11 loại (`docs/07-mo-hinh-du-lieu.md:238`):
`INGEST | KIEM_DINH_CHAT_LUONG | SINH_BAN_DAN_XUAT | FIXITY_CHECK | DI_TRU_DINH_DANG | PHUC_CHE | THAM_DINH_NOI_DUNG | KY_SO_XUAT_BAN | LUU_TRU_DAI_HAN | KIEM_KE_DINH_KY | DEACCESSION`

Điểm sáng thật sự là `DEACCESSION` được nối vào nghiệp vụ chứ không phải trang trí: trạng thái "Đã gỡ/thu hồi" giữ lại bản ghi, không xoá vĩnh viễn, và comment code ghi rõ ý đồ PREMIS (`app/src/services/types.ts:9-11`). Nhiều hệ thống thương mại làm sai chỗ này (xoá cứng).

Điểm yếu: đây là **enum tự chế bằng tiếng Việt**, không phải từ vựng `eventType` của LoC. Hệ quả là không một hệ thống nào bên ngoài đọc được. Cách sửa rẻ: giữ nguyên enum nội bộ nhưng thêm cột ánh xạ sang từ vựng LoC (`ingestion`, `fixity check`, `migration`, `deaccession`…).

**Object — thiếu.** PREMIS Object cần `objectCharacteristics`: format (có định danh registry), size, `objectCharacteristicsExtension` cho metadata kỹ thuật. Hiện `Asset.fmt` là chuỗi tự do (`types.ts:63`), `EXT_BY_DIGITAL_FORM` chỉ ánh xạ sang đuôi tệp (`digitization.ts:261-270`). Không có PUID PRONOM, không có phiên bản định dạng.

**Agent — rải rác, không có cấu trúc.** Người thực hiện xuất hiện dưới dạng tên chuỗi ở nhiều nơi: `Asset.owner` (`types.ts:75`), `createdBy` trong version (`digitization.ts:231`), `translator`/`reviewer` (`digitization.ts:441-446`), `signedBy` (`digitization.ts:140`). Không có thực thể Agent thống nhất, không có định danh agent, không phân biệt agent là người / tổ chức / phần mềm. PREMIS đặc biệt quan tâm **agent phần mềm** (phiên bản công cụ nào tạo ra bản dẫn xuất) — thông tin này có trong template CSV ("Phần mềm huấn luyện + phiên bản", `data/06-metadata/template-splat.csv`) nhưng không được mô hình hoá.

**Rights — có nhưng không phải PREMIS Rights.** Có `RIGHTS_STATEMENT` (`docs/07:245-253`) và `RIGHTS_STATEMENTS` trong code (`digitization.ts:81-97`), nhưng đó là *rights statement mô tả*, không phải *PREMIS rightsStatement* với `rightsBasis` (copyright/license/statute/donor agreement) và `actGranted`. Khác biệt quan trọng: PREMIS Rights trả lời "hệ thống được phép **làm gì** với đối tượng này" (di trú? tạo bản dẫn xuất? xoá?), không phải "người dùng được xem gì".

#### 3.2.2. Fixity: đúng hướng, thiếu hai thứ khiến nó không chứng minh được gì

Fixity hiện có: `checksum` (64 ký tự hex), `checksumShort`, `fixityStatus`, `fixityCheckedAt` (`digitization.ts:288-298`).

**Thiếu thứ nhất — tên thuật toán.** Chuỗi 64 hex *gợi ý* SHA-256, và nhãn UI nói SHA-256 (`app/src/i18n/vi.ts:127`), nhưng **trường dữ liệu không lưu `messageDigestAlgorithm`**. PREMIS bắt buộc trường này vì thuật toán sẽ đổi — SHA-256 rồi sẽ đến lượt bị thay như MD5 và SHA-1 đã bị thay. Kho lưu 50 năm chắc chắn sẽ có nhiều thuật toán cùng tồn tại. Không lưu tên thuật toán là tự khoá mình.

**Thiếu thứ hai — lịch sử.** `fixityCheckedAt` là **một mốc thời gian duy nhất** (`digitization.ts:296`), ghi đè mỗi lần kiểm tra. Nhưng giá trị pháp lý của fixity nằm ở **chuỗi liên tục các lần kiểm tra đều đạt**. Một mốc "đã kiểm tra hôm qua" không chứng minh gì về 5 năm trước. Đây là điều kiểm toán viên ISO 16363 và CoreTrustSeal sẽ hỏi đầu tiên.

Cần một bảng `fixity_check` (nhiều dòng trên mỗi tệp), và mỗi dòng chính là một PREMIS Event `FIXITY_CHECK` — bảng `PREMIS_EVENT` đã có sẵn loại này (`docs/07:238`), chỉ chưa nối vào.

**Lưu ý về bản demo:** checksum hiện là **mô phỏng bằng PRNG có seed**, không phải hash thật (`digitization.ts:300-310`). Comment code ghi rõ điều này (`digitization.ts:9-16,258`) — trung thực, tốt. Nhưng cần đảm bảo khi trình bày trước hội đồng, điều này được nói rõ, tránh bị hiểu là đã có fixity thật.

#### 3.2.3. Significant properties — chưa có, và với 3D thì đây là vấn đề lớn

PREMIS `significantProperties` ghi lại "thuộc tính nào phải được bảo toàn qua di trú". Với ảnh 2D điều này tương đối rõ. Với **mô hình 3D và Gaussian splat thì đây là câu hỏi mở của cả ngành** — và dự án này đang nắm giữ đúng loại dữ liệu đó.

Ví dụ cụ thể: khi di trú một mesh từ GLB sang định dạng tương lai, cái gì bắt buộc phải giữ? Hình học? Texture ở độ phân giải nào? Hệ toạ độ tham chiếu? Sai số căn chỉnh? Template CSV **đã thu thập đúng những trường này** ("Độ phân giải bề mặt (mm)", "Số tam giác", "Sai số căn chỉnh (RMS)", "Hệ tọa độ tham chiếu" — `data/06-metadata/template-3d-mesh.csv`), nhưng chúng chỉ là metadata mô tả, chưa được tuyên bố là **significant properties phải bảo toàn**.

Đây là cơ hội để dự án **đóng góp ngược cho cộng đồng quốc tế** thay vì chỉ đi theo — xem STD-05.

### 3.3. LIDO 1.1 / CIDOC-CRM (ISO 21127:2023) / CCO / Spectrum 5.1

#### 3.3.1. CIDOC-CRM: dùng đúng tinh thần, chưa dùng đúng mô hình

Quyết định nền tảng của dự án — **tách `ObjectClass` (đối tượng di sản thật) khỏi `DigitalForm` (sản phẩm số hoá)** (`app/src/data/taxonomy.ts:3-9`, `app/src/services/types.ts:29-32`, `docs/adr/0003`) — là quyết định **đúng và quan trọng**. Nó phản ánh phân biệt cốt lõi của CRM giữa E22 Human-Made Object và các biểu diễn số của nó, và nó tránh được cái bẫy mà rất nhiều CMS bảo tàng rơi vào: coi "ảnh của hiện vật" và "hiện vật" là cùng một bản ghi.

Việc một đối tượng vật lý có nhiều bản ghi số cùng `physicalArtifactId` (`types.ts:81-88`) là hiện thực hoá đúng đắn của quan hệ đó.

Tương tự, việc dùng **E54 Dimension làm bảng lặp lại** thay vì vài ô cố định (`app/src/components/PhysicalSpecsForm.tsx:12`, `docs/adr/0007`) là lựa chọn chín — kích thước hiện vật di sản vốn không vừa vào "dài × rộng × cao".

**Nhưng đến đó là hết.** Không có một property CRM nào được dùng. Quan hệ giữa các bản ghi là **nhãn tiếng Anh tự chế**: `depictedIn`, `mentionedIn`, `subjectOf`, `hasRubbing` (`types.ts:41`, `digitization.ts:396-401`), cộng thêm `hasRepresentation`, `hasDrawing`, `hasPreservationSurrogate` (`digitization.ts:382-384`).

Những nhãn này **đọc rất giống chuẩn nhưng không thuộc chuẩn nào**. CRM có sẵn property cho phần lớn: `P138 represents`, `P62 depicts`, `P67 refers to`, `P128 carries`. LIDO có sẵn `lido:relatedWorkRelType`. Việc tự chế nhãn khiến dữ liệu **không thể xuất ra ngoài mà không mất nghĩa**.

Vấn đề nhất quán nội bộ đáng lưu ý: **template CSV dùng bộ nhãn quan hệ khác hẳn code**. CSV dùng `isRepresentationOf`, `hasRubbing`, `depicts`, `describes` (`data/06-metadata/template-3d-mesh.csv`, `template-anh.csv`, `template-media.csv`, `template-splat.csv`), trong khi code dùng `depictedIn`, `mentionedIn`, `subjectOf`, `hasRubbing` (`types.ts:41`). Lưu ý `depicts` và `depictedIn` là **hai chiều ngược nhau** — nhập từ CSV vào theo nghĩa đen sẽ đảo ngược quan hệ.

Cũng lưu ý: `RelationRule.kind` trong `app/src/data/relations.ts:20` chỉ khai báo 3 giá trị (`depictedIn | mentionedIn | subjectOf`), **thiếu `hasRubbing`** vốn có trong `RelationKind` (`types.ts:41`) — nên hiện không có luật nào sinh ra quan hệ bản dập, dù bản dập văn bia là loại tư liệu trung tâm của kho này (có xuất hiện ở `metadataFields.ts:85`).

#### 3.3.2. Phiên bản CRM cần cập nhật

Nên viện dẫn **ISO 21127:2023**, tương ứng CIDOC CRM community version **7.1.3**. Hiện tài liệu chỉ nói "CIDOC-CRM" chung chung (`complianceEvidence.ts:59`, `docs/12:106`).

#### 3.3.3. LIDO 1.1: khoảng trống lớn nhất của khối mô tả

LIDO (Lightweight Information Describing Objects) **v1.1 do ICOM-CIDOC công bố 12/2021** là *lingua franca* để bảo tàng trao đổi dữ liệu. Nó là thứ Europeana nhận, thứ các cổng tổng hợp châu Âu harvest.

Hiện tại LIDO chỉ tồn tại như một dòng định nghĩa (`docs/thuat-ngu.md:110`) và một lần nhắc trong mô tả bảng ánh xạ (`docs/12-chat-luong-du-lieu.md:108`). **Không có schema, không có bộ xuất, không có danh sách trường bắt buộc LIDO.**

Điều đáng nói: dữ liệu **đã gần đủ** để xuất LIDO. Có tên, loại hình, niên đại (kể cả EDTF), vị trí, mô tả, quan hệ, quyền, đơn vị quản lý. Cái thiếu là **lớp ánh xạ**, không phải dữ liệu. Đây là lý do STD-06 có ROI rất cao.

#### 3.3.4. CCO: nguyên tắc Work/Image đã đúng, thiếu lớp tên

CCO (Cataloging Cultural Objects, 2006) phân biệt **Work** (tác phẩm/hiện vật) với **Image** (hình ảnh về nó). Dự án đã làm đúng qua hai tầng mã (`types.ts:52-57`).

Cái thiếu là **quy tắc về tên**. CCO yêu cầu phân biệt tên ưu tiên và tên thay thế. Một tấm bia Tiến sĩ có thể có: tên tiếng Việt hiện đại, tên chữ Hán nguyên văn, phiên âm Hán Việt, tên khoa thi, tên trong hồ sơ Pháp thuộc, số hiệu trong các công trình khảo cứu trước. Hiện tại `Asset.name` là **một chuỗi duy nhất** (`types.ts:58`).

Đây không phải chuyện học thuật suông: người nghiên cứu tìm bia theo tên khoa thi, khách tham quan tìm theo tên tiếng Việt, học giả quốc tế tìm theo phiên âm. Một trường tên = mất hai đường tìm.

#### 3.3.5. Spectrum 5.1: sai phiên bản, và thiếu vài quy trình quan trọng

**Lỗi cần sửa ngay:** hai chỗ viện dẫn **"Spectrum 5.0"** — `app/src/i18n/vi.ts:140` và `docs/adr/0007:13`. Phiên bản hiện hành là **Spectrum 5.1, Collections Trust công bố 9/2022** (cập nhật một phần của 5.0/2017), gồm **21 quy trình**. Đây là loại lỗi rẻ tiền nhưng gây mất điểm nặng trước hội đồng có chuyên gia bảo tàng.

Đối chiếu nhanh 21 quy trình với hiện trạng:

| Quy trình Spectrum 5.1 | Hiện trạng | Bằng chứng |
|---|---|---|
| Inventory (Kiểm kê) | **Có, làm tốt** — đúng cấp đối tượng vật lý, có chốt đợt, có lịch sử điều chỉnh | `app/src/pages/InventoryPage.tsx:18-29,330-396` |
| Cataloguing (Biên mục) | **Có** | `CoreMetadataForm.tsx` |
| Deaccession and disposal | **Một phần** — có trạng thái + PREMIS event, chưa có quy trình | `types.ts:9-11,23`, `docs/07:238` |
| Object entry (Tiếp nhận hiện vật) | **Chưa** | — |
| Acquisition and accessioning | **Một phần** — có `soDangKy`, chưa có quy trình | `types.ts:96` |
| Location and movement control | **Chưa** — `loc` là chuỗi tự do, không có lịch sử di chuyển | `types.ts:73` |
| Condition checking and technical assessment | **Chưa** — có `condition_note` tĩnh, không có đợt kiểm tra tình trạng | `docs/07:226` |
| Loans in / Loans out | **Chưa** | — |
| Rights management | **Một phần** | `digitization.ts:81-128` |
| Audit (Kiểm toán) | **Có** | `CompliancePage.tsx:655` |

Với một hệ thống quản lý **tài sản số** (không phải quản lý hiện vật vật lý toàn diện), việc thiếu Loans và Object entry là **chấp nhận được và nên nói rõ là chấp nhận được**. Nhưng **Condition checking** và **Location and movement** thì đáng bổ sung, vì chúng ảnh hưởng trực tiếp tới quyết định số hoá lại.

### 3.4. IIIF — lỗ hổng nghiêm trọng nhất

#### 3.4.1. Quy mô khoảng trống

grep toàn bộ `app/src/`: **không một dòng nào** liên quan IIIF. Trong `docs/`, IIIF xuất hiện **hai lần**, cả hai đều hoãn hoặc gián tiếp:
- `docs/thuat-ngu.md:112` — định nghĩa, kèm ghi chú "**Thuộc phạm vi giai đoạn 2**".
- `docs/02-quy-trinh-bao-quan-sao-luu.md:256` — nhắc JPEG2000 "hỗ trợ deep zoom qua IIIF".

#### 3.4.2. Vì sao đây là vấn đề *đặc biệt* nghiêm trọng với kho này

IIIF không phải "tính năng zoom ảnh cho đẹp". Nó là **giao thức mà cộng đồng nghiên cứu văn bản quốc tế dùng để làm việc**. Và kho này có đúng loại tài sản mà IIIF sinh ra để phục vụ:

**82 bia Tiến sĩ** là hiện vật **văn bản** — mặt bia dày đặc chữ Hán. Nhu cầu nghiên cứu thực tế là:
- Zoom sâu tới từng chữ để đọc nét khắc mòn (Image API 3.0).
- Đặt ảnh bia cạnh **bản dập** của chính nó để đối chiếu — bản dập là loại tư liệu trung tâm của kho (`RelationKind.hasRubbing`, `types.ts:41`). Đây chính là kịch bản so sánh nhiều nguồn mà Presentation API 3.0 phục vụ.
- Chú giải theo vùng: gắn phiên âm và bản dịch vào **đúng vị trí chữ trên mặt bia** (Web Annotation trong Presentation API 3.0). Hiện tại phiên âm/dịch là **một khối văn bản rời** không neo vào ảnh (`CoreMetadataForm.tsx:172-201`).
- Tìm chữ trong nội dung (Content Search 2.0).

Không có IIIF thì toàn bộ công sức phiên âm/dịch/song thẩm — vốn là phần **đắt nhất và trí tuệ nhất** của dự án (`digitization.ts:441-446`, `CoreMetadataForm.tsx:169-212`) — bị nhốt trong một ô textarea, không ai ngoài hệ thống này dùng được.

#### 3.4.3. Nghịch lý: hạ tầng đã sẵn sàng, chỉ thiếu lớp phủ

Dự án **đã chọn JPEG2000 làm định dạng phân phối** cho tư liệu 2D và đã ghi rõ lý do là deep zoom qua IIIF (`docs/02:256`). Định dạng đã đúng. Chỉ thiếu lớp phục vụ.

Và quan trọng cho hồ sơ thầu: **manifest IIIF Presentation 3.0 là JSON tĩnh.** Sinh manifest cho vài chục bản ghi mẫu **không cần backend**, làm được ngay trong lớp mock. Đây là một trong những đề xuất có tỷ lệ ấn tượng/chi phí cao nhất toàn báo cáo.

#### 3.4.4. Auth Flow 2.0 khớp sẵn với mô hình quyền đã có

App đã có 3 mức truy cập `CONG_KHAI | NGHIEN_CUU | NOI_BO` (`digitization.ts:107-113`) và mã khuyết `HAN_CHE` cho nội dung hạn chế công bố (`app/src/data/missingValues.ts:14`). IIIF **Authorization Flow 2.0 (10/7/2023)** được thiết kế đúng cho tình huống này: ảnh phân giải thấp mở công khai, phân giải gốc yêu cầu xác thực. Nghĩa là mô hình quyền hiện tại **đã tương thích khái niệm**, chỉ cần nối.

Điều này đặc biệt hợp với ràng buộc pháp lý VN về dữ liệu cá nhân trong tư liệu Hán Nôm (gia phả, sắc phong) mà DPIA đã nêu (`complianceEvidence.ts:158-161`).

### 3.5. Quyền và định danh bền vững

#### 3.5.1. Rights: đúng ý định, sai kỹ thuật ở hai điểm

`RIGHTS_STATEMENTS` (`digitization.ts:81-97`) chứa ba mục với mã `CC-BY-4.0`, `InC-EDU`, `UND`.

**Lỗi thứ nhất — trộn hai vocabulary khác nhau vào một enum.** `InC-EDU` và `UND` là mã của **RightsStatements.org** (12 statement, do DPLA + Europeana + Creative Commons lập). `CC-BY-4.0` là **giấy phép Creative Commons**. Đây là hai thứ khác loại:
- **Rights statement** mô tả *tình trạng bản quyền* (kể cả khi không rõ, kể cả khi có bản quyền của người khác).
- **License** là *sự cấp phép* của người có quyền.

Một đối tượng có thể vừa có statement vừa có license. Gộp vào một trường buộc phải chọn một, và sẽ mất thông tin. Mô hình dữ liệu ở `docs/07-mo-hinh-du-lieu.md:249` cũng lặp lại lỗi này: `code UK "vd InC, InC-EDU, NoC-US, CC-BY-4.0"`.

**Lỗi thứ hai — không có URI.** RightsStatements.org được thiết kế là **linked data vocabulary**; định danh chuẩn của "In Copyright – Educational Use Permitted" là:

```
http://rightsstatements.org/vocab/InC-EDU/1.0/
```

Hiện code chỉ lưu chuỗi `'InC-EDU'` (`digitization.ts:88`). Mô hình dữ liệu **có** cột `url` (`docs/07:252`) — tốt — nhưng code chưa dùng. **Europeana yêu cầu rights phải là URI trong EDM**; không có URI thì không thể publish, chấm hết.

Thêm nữa, ô nhập giấy phép trong form là **text tự do** (`CoreMetadataForm.tsx:63,148-150`) với placeholder gợi ý `'vd. CC BY-NC 4.0 / Theo yêu cầu / Nội bộ VM'` (`i18n/vi.ts:101`) — cho phép nhập bất kỳ chuỗi nào. Đây là nguồn dữ liệu bẩn kinh điển.

**Lưu ý chiến lược về CC BY-NC:** danh mục dữ liệu mở hiện gán **CC BY-NC 4.0** cho bộ "82 bia Tiến sĩ" (`CompliancePage.tsx:542`, `complianceEvidence.ts:188`). Cần biết rằng **Europeana content tier 4 chỉ chấp nhận CC BY, CC BY-SA, CC0 hoặc PDM** — NC bị loại. Ngoài ra, với văn bia thế kỷ 15–18, **bản thân văn bia đã thuộc phạm vi công cộng**; quyền duy nhất có thể phát sinh là quyền với *bản ghi số*, và ở nhiều khung pháp lý quốc tế, bản sao trung thực 2D của tác phẩm phạm vi công cộng **không phát sinh quyền mới**. Smithsonian và Rijksmuseum đã đi đến kết luận đó và chọn CC0/Public Domain.

Đây là **quyết định chính sách, không phải quyết định kỹ thuật** — cần nêu lên cho lãnh đạo Trung tâm, không nên để lập trình viên quyết ngầm.

#### 3.5.2. Định danh: có kỷ luật nội bộ, không có tính bền vững

Hệ mã hai tầng (`app/src/services/types.ts:52-57`) — `VM-<OC>-NNNNN` cho đối tượng vật lý, `<physicalObjectId>.<DF><nn>` cho bản ghi số — là thiết kế **tốt và có kỷ luật**. Việc mã tầng 1 gắn với *đối tượng vật lý* chứ không phải tệp là đúng nguyên tắc: đối tượng vật lý tồn tại lâu hơn mọi bản số hoá của nó.

Nhưng "bền vững" trong nghĩa của ngành có ba điều kiện, và hệ mã này **không đạt cả ba**:

1. **Phân giải được toàn cầu** — gõ định danh vào trình duyệt phải ra đối tượng. `VM-HV-00013.M3D01` không phải URL.
2. **Cam kết thể chế công khai** — tổ chức tuyên bố sẽ duy trì định danh kể cả khi đổi hệ thống, đổi tên miền, đổi nhà thầu.
3. **Độc lập với công nghệ** — không nhúng thông tin sẽ thay đổi.

Điểm 3 có một rủi ro cụ thể đáng nêu: mã tầng 2 **nhúng `DigitalForm`** (`M3D`, `SPL`, `PCL`…, `app/src/data/taxonomy.ts:31-40`). Nếu một bản ghi được phân loại lại — ví dụ pointcloud được xác định lại là mesh, hoặc xuất hiện dạng số mới — thì mã **hoặc phải đổi (phá vỡ tính bền vững), hoặc trở thành sai nghĩa**. Đây là bài học kinh điển: **định danh bền vững phải vô nghĩa (opaque)**. `docs/adr/0004` chọn mã có nghĩa vì lý do vận hành hợp lý (cán bộ đọc được mã), nhưng đánh đổi này cần được ghi nhận tường minh.

Cách giải phổ biến: **giữ mã có nghĩa cho vận hành nội bộ, cấp thêm một định danh vô nghĩa, phân giải được cho thế giới bên ngoài.** Gallica/BnF làm đúng vậy — bên trong có hệ mã riêng, bên ngoài là `ark:/12148/btv1b8449691v`.

Tài liệu đã nhận ra vấn đề nhưng xếp sai độ ưu tiên: `pid_quoc_gia` ở trạng thái "Roadmap — chưa bắt buộc" (`docs/07:66`) và ARK/Handle nằm ở "**Lộ trình xa hơn**" (`docs/07:68`).

**Vì sao thứ tự này nguy hiểm:** định danh là quyết định **một chiều**. Ngày dữ liệu được công bố và người ngoài bắt đầu trích dẫn nó, mọi định danh đã phát tán trở thành nghĩa vụ vĩnh viễn. Sửa "sau" nghĩa là hoặc phá vỡ mọi liên kết đã có, hoặc duy trì bảng ánh xạ mãi mãi. Đây là việc **rẻ khi làm trước, rất đắt khi làm sau** — ngược hoàn toàn với thứ tự ưu tiên hiện tại.

Với 82 bia UNESCO, hệ quả còn nặng hơn: hồ sơ Ký ức Thế giới là hồ sơ **quốc tế và vĩnh viễn**. Trích dẫn học thuật tới các bia này sẽ tồn tại hàng chục năm.

#### 3.5.3. Bất nhất nội bộ về mã cần sửa trước khi nộp thầu

Hệ mã hai tầng (`types.ts:52-57`) **không được dùng nhất quán**:

- **Template CSV dùng hệ mã cũ, khác hẳn:** `VM-3D-002` (`template-3d-mesh.csv`), `VM-IMG-010` (`template-anh.csv`), `VM-DOC-020` (`template-tai-lieu-han-nom.csv`), `VM-SP-012` (`template-splat.csv`), `VM-AUD-010` (`template-media.csv`). Đây là dạng **một tầng theo loại tệp**, tức hệ cũ trước ADR 0003/0004.
- **Placeholder trong form cũng dùng hệ cũ:** `VM-3D-018`, `VM-SP-011`, `VM-DOC-015`, `VM-VID-004` (`app/src/data/metadataFields.ts:6,14,22,29`).
- **Chứng cứ tuân thủ cũng dùng hệ cũ:** `VM-3D-014` (`app/src/data/complianceEvidence.ts:144-145`).
- Trong khi dữ liệu batch lại dùng hệ mới đúng: `VM-HV-00013.M3D01` (`metadataFields.ts:80-85`).

Đây là loại bất nhất mà hội đồng chấm thầu kỹ tính **sẽ** phát hiện, và nó làm suy yếu chính ADR 0004 mà dự án đang lấy làm điểm mạnh. Chi phí sửa rất thấp.

#### 3.5.4. Traditional Knowledge Labels — cân nhắc, chưa cấp thiết

Local Contexts TK Labels dùng cho tri thức bản địa/cộng đồng. Với Văn Miếu, phần lớn nội dung là **văn bản chính thống triều đình**, nơi TK Labels ít phù hợp. Tuy nhiên nếu kho mở rộng sang **nghi lễ đang thực hành, tri thức dòng họ, gia phả** (mà `containsPersonalData` đã nhận diện — `digitization.ts:99-105`), thì nên xem lại. **Không khuyến nghị làm trong 18 tháng đầu.**

### 3.6. Từ vựng chuẩn và đa ngữ Hán Nôm

#### 3.6.1. Khung có, dữ liệu không

Mô hình dữ liệu có bảng `CONTROLLED_VOCABULARY` với `source` là enum `GETTY_AAT | ICONCLASS | TGN | ISO_639 | ISO_3166`, có `source_id` (ví dụ `aat:300010331`), `label_vi`, `label_en`, và `broader_id` tự tham chiếu để dựng cây phân cấp (`docs/07-mo-hinh-du-lieu.md:207-213`). Thiết kế này **đúng**.

Nhưng trong `app/`:
- `app/src/data/taxonomy.ts` — toàn bộ nhãn là **chuỗi tiếng Việt cứng**, không một URI (`taxonomy.ts:11-17,42-51`).
- Thẻ vẫn là danh sách tự do: `'bia đá'`, `'rùa đá'`, `'chữ Hán Nôm'`, `'đồ thờ'`, `'điêu khắc'`, `'kiến trúc'`, `'ngoài trời'`, `'nội thất'` (`app/src/data/metadataFields.ts:63-72`).
- Nhãn UI **hứa** điều chưa có: "Danh sách từ vựng kiểm soát — ánh xạ Getty AAT (Art & Architecture Thesaurus)" (`app/src/i18n/vi.ts:115`).

Khoảng cách giữa lời hứa ở UI và hiện thực ở dữ liệu là rủi ro trình diễn: nếu hội đồng bấm vào và hỏi "cho xem mã AAT của 'rùa đá'", không có câu trả lời.

Tin tốt: **8 thẻ thì việc ánh xạ tay là chuyện của một buổi chiều.** Getty AAT có sẵn khái niệm cho stelae, tortoise/turtle (biểu tượng), stone carving, architecture. Chi phí gần như bằng không, hiệu quả trình diễn rất cao.

#### 3.6.2. Thiếu hoàn toàn trục nhân danh — và đây là tài sản lớn nhất bị bỏ quên

Enum từ vựng (`docs/07:209`) có AAT (loại hình), TGN (địa danh), Iconclass (chủ đề), ISO 639 (ngôn ngữ), ISO 3166 (quốc gia). **Không có ULAN, không có VIAF, không có Wikidata** — tức là **không có trục nhân danh nào**.

Với kho này, đó là bỏ sót lớn nhất. **82 bia Tiến sĩ khắc tên khoảng 1.300 vị tiến sĩ** qua gần ba thế kỷ khoa cử, kèm khoa thi, quê quán, chức vụ. Đây là:
- Tài sản dữ liệu **có giá trị nghiên cứu cao nhất** trong toàn kho.
- Thứ khiến dữ liệu Văn Miếu **liên kết được với phần còn lại của thế giới** — một tiến sĩ có mặt trong VIAF/Wikidata lập tức nối vào thư mục học thuật toàn cầu.
- Chính là lý do UNESCO ghi danh: **giá trị tư liệu về giáo dục khoa cử**, không phải giá trị điêu khắc.

Hiện tại thông tin này không có chỗ đứng trong mô hình dữ liệu. Người thực hiện số hoá có trường (`Asset.owner`, `types.ts:75`), nhưng **người được khắc trên bia thì không**.

#### 3.6.3. Ngôn ngữ: ISO 639-1 không đủ cho Hán Nôm

`docs/07-mo-hinh-du-lieu.md:125` quy định `language` theo "**ISO 639-1**, mặc định `vi`". ISO 639-1 là bộ mã **hai chữ cái**, và nó **không biểu diễn được Hán văn cổ** — mã của Literary Chinese là `lzh`, thuộc ISO 639-3 (ba chữ cái).

Chuẩn đúng là **IETF BCP 47**, cho phép kết hợp ngôn ngữ + hệ chữ viết. Một tấm bia Tiến sĩ có **ba lớp văn bản cần ba thẻ khác nhau**:

| Lớp | Thẻ BCP 47 | Trường hiện có |
|---|---|---|
| Nguyên văn Hán/Nôm | `lzh` (Hán văn cổ) hoặc `vi-Hani` (Nôm) | `originalText` (`CoreMetadataForm.tsx:172-179`) |
| Phiên âm Hán Việt | `vi-Latn` | `transliteration` (`CoreMetadataForm.tsx:180-186`) |
| Dịch nghĩa tiếng Việt | `vi` | `translation` (`CoreMetadataForm.tsx:187-194`) |

Ba trường **đã tồn tại** và được cưỡng chế đúng (nguyên văn và bản dịch là bắt buộc, có song thẩm — `CoreMetadataForm.tsx:87-93`). Chỉ thiếu **thẻ ngôn ngữ gắn kèm**. Đây là sửa chữa rẻ với giá trị liên thông lớn: không có thẻ ngôn ngữ, hệ thống bên ngoài không biết `originalText` là chữ Hán hay chữ Nôm — mà **phân biệt Hán/Nôm là phân biệt học thuật cốt lõi** của ngành.

Template CSV có cột "Văn tự gốc" với giá trị mẫu "Hán văn" (`data/06-metadata/template-tai-lieu-han-nom.csv`) — đúng ý niệm, nhưng là **nhãn tiếng Việt tự do**, không phải mã chuẩn.

#### 3.6.4. Unicode CJK: chưa có cam kết, và chữ Nôm sẽ chạm trần

Việc nhập nguyên văn Hán Nôm được hỗ trợ (`CoreMetadataForm.tsx:172-179`), nhưng **không có tuyên bố nào về phạm vi Unicode được hỗ trợ**.

Đây không phải chuyện lý thuyết. **Chữ Nôm là một trong những hệ chữ có nhiều ký tự hiếm nhất trong Unicode** — nhiều chữ Nôm nằm ở các mặt phẳng CJK Extension B trở lên (ngoài BMP, cần 4 byte UTF-8), và **một số chữ Nôm vẫn chưa được mã hoá**. Các vấn đề sẽ gặp:
- Font hiển thị: font hệ thống thông thường không phủ CJK Ext B+.
- Sắp xếp và tìm kiếm: hàm chuẩn hoá tìm kiếm hiện tại (`app/src/utils/search.ts:8-15`) xử lý dấu tiếng Việt (tách tổ hợp, `đ→d`) nhưng **không có xử lý nào cho CJK**.
- Chữ chưa mã hoá: cần quy trình dự phòng (mô tả IDS — Ideographic Description Sequence, hoặc ảnh cắt kèm ghi chú).

Cần một tuyên bố tường minh trong hồ sơ thầu: hỗ trợ tới CJK Extension nào, font nào, quy trình nào cho chữ ngoài bảng mã.

#### 3.6.5. EDTF: lỗi cụ thể trong code cần sửa

Hàm kiểm tra EDTF (`app/src/components/CoreMetadataForm.tsx:39-42`):

```ts
function isValidEdtf(raw: string): boolean {
  const year = String.raw`\d{1,4}X{0,2}[?~]?`;
  return new RegExp(`^(unknown|${year}|${year}/${year})$`, 'i').test(raw.trim());
}
```

Đối chiếu với EDTF (Library of Congress; hợp nhất vào **ISO 8601-2:2019**), có bốn vấn đề:

1. **Chấp nhận từ khoá `unknown` — không còn thuộc chuẩn.** EDTF đã **bỏ** hai từ khoá `unknown` và `open` cho đầu mút khoảng, thay bằng ký hiệu **hai chấm `..`** (và đầu mút rỗng). Lỗi này lan sang cả tài liệu (`docs/07-mo-hinh-du-lieu.md:119`) và chuỗi giao diện (`app/src/i18n/vi.ts:83-84`), nên phải sửa cả ba nơi.
2. **Từ chối `1XXX`** — hợp lệ trong EDTF (chữ số chưa xác định). Regex chỉ cho tối đa **hai** chữ `X` (`X{0,2}`), nên `18XX` qua được nhưng `1XXX` bị chặn. Với niên đại di sản, "thế kỷ nào đó trong thiên niên kỷ thứ 2" là trường hợp có thật.
3. **Từ chối ngày đầy đủ `1928-06-15`** — đây là EDTF Level 0 hợp lệ và là dạng cơ bản nhất. Hệ quả nghiêm trọng: **ảnh tư liệu có ngày chụp chính xác không thể ghi vào trường chuẩn hoá.** Kho có ảnh lịch sử với ngày cụ thể (`metadataFields.ts:83` — "Ảnh lễ khai giảng, 1965"; `template-anh.csv` có cột "Ngày/thời kỳ chụp"), và media có "Ngày ghi hình" (`metadataFields.ts:30`).
4. **Thiếu `%`** (vừa không chắc vừa ước chừng) và **chấp nhận năm 1–3 chữ số** (`\d{1,4}`) vốn không hợp lệ ở dạng thường.

Ngoài ra có bất nhất nhỏ về `eraCertainty`: code dùng 6 giá trị `'certain' | 'uncertain' | 'approximate' | 'century' | 'range' | 'unknown'` (`types.ts:72`, `CoreMetadataForm.tsx:15-17`), còn mô hình dữ liệu dùng 3 giá trị `CHINH_XAC | UOC_TINH | TRANH_CAI` (`docs/07:121`). Cần thống nhất.

Điểm tích cực đáng ghi nhận: **thiết kế hai lớp niên đại là đúng chuẩn quốc tế** — `era` giữ nguyên văn can chi/niên hiệu cho người đọc, `eraEdtf` chuẩn hoá cho máy (`types.ts:67-70`, `docs/adr/0006`). Đây chính là cách các bảo tàng hàng đầu làm, và cần giữ. Vấn đề chỉ nằm ở lớp kiểm tra.

### 3.7. Chứng nhận kho tin cậy

#### 3.7.1. Nền móng tốt hơn dự án tự nhận

`docs/02-quy-trinh-bao-quan-sao-luu.md:308-318` có bảng **NDSA Levels of Digital Preservation** đầy đủ 5 khía cạnh (Storage, Integrity, Security, Metadata, Content) × mức hiện tại / mức mục tiêu Giai đoạn 1 / lộ trình Giai đoạn 2. Bảng này **trung thực** — thừa nhận mức xuất phát là Level 1 ở cả 5 khía cạnh.

Đây là tài sản lớn hơn dự án đang nhận ra: **tự đánh giá trung thực có ghi chép chính là bằng chứng cốt lõi mà CoreTrustSeal yêu cầu.** Phần lớn kho lưu trữ trượt CoreTrustSeal vì không có bằng chứng, không phải vì thực hành kém.

Cộng thêm các mảnh đã có:
- Quy chế quản lý dữ liệu có số hiệu, người ký (`complianceEvidence.ts:52-63`).
- Biên bản **diễn tập khôi phục thảm hoạ** có kết quả đối chiếu checksum (`complianceEvidence.ts:82-95`) — đây đúng là bằng chứng CoreTrustSeal muốn thấy.
- Báo cáo kiểm toán dữ liệu định kỳ (`complianceEvidence.ts:97-110`).
- Nhật ký bất biến hash-chain (`complianceEvidence.ts:146`).
- Sổ đăng ký tuân thủ không cho lưu "Đạt" khi ô chứng cứ trống (`docs/12-chat-luong-du-lieu.md:108`) — kỷ luật bằng chứng tốt.

#### 3.7.2. Khoảng trống thật so với CoreTrustSeal

Yêu cầu hiện hành là **CoreTrustSeal Requirements V04.00, hiệu lực 1/1/2026 đến 2028**, gồm **16 yêu cầu R01–R16** cộng phần bối cảnh R0 không tính điểm, chia ba nhóm. Phí quản trị **€1.000 cho chu kỳ 3 năm**.

Ba khoảng trống lớn nhất:

1. **Tính bền vững của tổ chức và kế hoạch kế thừa.** CoreTrustSeal hỏi: nếu tổ chức ngừng hoạt động, dữ liệu đi đâu? Hiện chưa có kho kế thừa được chỉ định.
2. **Sự tham gia của cộng đồng người dùng được ghi chép.** Cần bằng chứng có tương tác với cộng đồng nghiên cứu — hiện chỉ có bên tiếp nhận dữ liệu hành chính (LGSP, NDXP, Bộ VHTTDL: `complianceEvidence.ts:112-123`), **không phải cộng đồng học thuật**.
3. **Định danh bền vững và điều kiện tái sử dụng máy đọc được** — đúng những gì §3.5 đã nêu.

#### 3.7.3. Vì sao ISO 16363 chưa nên là đích trước mắt

**ISO 16363:2025** (thay :2012) là chuẩn kiểm toán nghiêm ngặt hơn nhiều, với hơn 100 tiêu chí và cần kiểm toán viên bên thứ ba được công nhận. Rất ít kho trên thế giới đạt được. Với một trung tâm di sản đang xây hệ thống đầu tiên, nhắm ISO 16363 ngay là **phân bổ nguồn lực sai**.

Thứ tự đúng: **NDSA (đã có) → CoreTrustSeal (18 tháng) → cân nhắc ISO 16363 sau 5 năm nếu có nhu cầu thật.**

**nestor Seal (DIN 31644 — năm ban hành *cần kiểm chứng*)** là chứng nhận trong hệ sinh thái Đức, tài liệu chủ yếu tiếng Đức, **không khuyến nghị** cho dự án này.

---

## 4. Danh sách đề xuất nâng cấp

### 4.0. Giả định dùng để ước tính chi phí

Mọi con số dưới đây dựa trên các giả định sau, nêu rõ để người đọc điều chỉnh:

- **1 người-ngày** = 1 ngày công của một nhân sự phù hợp (lập trình viên, cán bộ biên mục, hoặc chuyên gia Hán Nôm tuỳ việc). Báo cáo **không quy ra tiền công** vì đơn giá nội bộ của Trung tâm và của nhà thầu khác nhau.
- **Chi phí hạ tầng USD/năm** giả định **self-host trên hạ tầng của Trung tâm** (bắt buộc theo ràng buộc dữ liệu di sản quốc gia), nên phần lớn là **điện toán và lưu trữ tăng thêm**, không phải phí đám mây công cộng.
- Ước tính giả định **quy mô kho giai đoạn đầu: ~150–500 bản ghi số**, tăng dần. Nhiều hạng mục có chi phí gần như không đổi theo quy mô ở dải này.
- Hạng mục ghi **"[Demo thầu]"** nghĩa là **làm được hoàn toàn trong lớp mock hiện tại, không cần backend**.
- Phần mềm nêu tên đều là **mã nguồn mở, license 0 USD**; chi phí nếu có là vận hành.

### 4.1. Khối OAIS

---

#### `STD-01` — Cập nhật viện dẫn OAIS lên ISO 14721:2025 và tách khái niệm "AIP" khỏi "tầng lưu trữ"

**Vì sao.** Hai vấn đề tách biệt, cùng thuộc một chỗ sửa.

*Thứ nhất, viện dẫn lỗi phiên bản.* Tài liệu nêu "OAIS (ISO 14721)" không kèm năm (`app/src/data/complianceEvidence.ts:59,76`). Phiên bản hiện hành là **ISO 14721:2025** (ấn bản thứ ba, tương đương CCSDS 650.0-M-3 công bố 12/2024), thay thế ISO 14721:2012. Tương tự **ISO 16363:2025** đã thay ISO 16363:2012.

*Thứ hai, sai khái niệm.* `STORAGE_TIER_LABELS.AIP = 'Tầng lưu trữ AIP'` (`app/src/data/digitization.ts:284`) đặt AIP ngang hàng `HOT`/`COLD`, tức dùng AIP như một *địa điểm*. Trong ISO 14721, AIP là một **gói tin** (Content Information + PDI), không phải nơi cất. Hội đồng có chuyên gia OAIS sẽ hỏi "cho tôi xem một AIP" và hệ thống không có gì để đưa ra.

**Lợi ích lâu dài.** Viện dẫn đúng phiên bản là tín hiệu năng lực chuyên môn rẻ nhất có thể mua. Tách đúng khái niệm gói tin là điều kiện tiên quyết để sau này đóng gói AIP thật, xuất DIP thật, và vượt qua kiểm toán CoreTrustSeal — nếu để sai khái niệm ăn sâu vào mã nguồn và tài liệu, chi phí sửa sẽ nhân lên.

**Ai đang làm (uy tín).** **Archivematica** (Artefactual Systems) — hệ thống bảo quản số mã nguồn mở được dùng rộng rãi trong lưu trữ quốc gia — tách rất rõ Transfer → SIP → AIP → DIP, mỗi cái là một gói có ranh giới, và lưu AIP vào các không gian lưu trữ (storage space) khác nhau qua Archivematica Storage Service. Đó chính là mô hình phân biệt "gói tin" với "nơi cất". **Preservica** và **Ex Libris Rosetta** (thương mại) cũng theo cấu trúc này.

**Cost.** **2–3 người-ngày.** Gồm: rà soát và cập nhật viện dẫn trong tài liệu (~1 ngày), đổi tên nhãn tầng lưu trữ và thêm ghi chú khái niệm trong tài liệu kiến trúc (~1–2 ngày). **Hạ tầng: 0 USD/năm.**

**Ưu tiên.** **P0 · [Demo thầu]** — thuần tài liệu và đổi nhãn, không rủi ro kỹ thuật.

**Rủi ro nếu KHÔNG làm.** Mất điểm trực tiếp trong chấm thầu ở hạng mục dễ ghi điểm nhất. Chuyên gia OAIS phát hiện sai khái niệm sẽ đặt dấu hỏi lên toàn bộ phần bảo quản — vốn đang là **điểm mạnh nhất** của hồ sơ. Với hồ sơ UNESCO: khi báo cáo định kỳ về điều kiện bảo quản 82 bia cho Chương trình Ký ức Thế giới, viện dẫn chuẩn lỗi thời làm suy giảm độ tin cậy của toàn bộ báo cáo.

---

#### `STD-02` — Dựng SIP tường minh (BagIt) và METS structMap cho tài liệu nhiều trang

**Vì sao.** Chuỗi OAIS hiện bắt đầu ở giữa. Luồng nhận dữ liệu là chọn loại → điền form (`app/src/data/metadataFields.ts:4-35`) → tải tệp, **không có bước nào tạo ra gói nộp có ranh giới, có manifest, có checksum tại nguồn**. Hệ quả: fixity hiện tại chứng minh được "tệp không đổi từ khi vào kho" nhưng **không** chứng minh được "tệp không đổi từ khi rời máy số hoá" — đúng khoảng trống trách nhiệm nguy hiểm nhất.

Nghĩa vụ này **đã tồn tại về mặt pháp lý**: `docs/07-mo-hinh-du-lieu.md:68` dẫn TT 05/2025/TT-BNV yêu cầu "mã định danh" là một trong bảy trường siêu dữ liệu bắt buộc của **gói SIP/AIP/DIP** (mục 5.7). Tức chuẩn VN đã đòi gói tin tường minh.

Song song, **METS bị đẩy xuống "Level 4 — Giai đoạn 2"** (`docs/02-quy-trinh-bao-quan-sao-luu.md:317`) trong khi **nhu cầu đã có ngay**: template tài liệu Hán Nôm có cột "Số trang" và dòng mẫu liệt kê hai tệp mặt (`vm_doc_020_mat1.tif;vm_doc_020_mat2.tif`, `data/06-metadata/template-tai-lieu-han-nom.csv`). Không có structMap thì không thể trích dẫn theo trang, không thể dựng manifest IIIF, không thể neo phiên âm vào trang.

**Lợi ích lâu dài.** BagIt là định dạng đơn giản nhất có thể (`bagit.txt`, `manifest-sha256.txt`, `bag-info.txt`), không license, đọc được bằng công cụ phổ thông sau 30 năm. Nó biến việc bàn giao dữ liệu từ nhà thầu số hoá thành một hành vi **kiểm chứng được**: bên giao ký manifest, bên nhận verify. Riêng điều này đã đáng làm ngay cả khi bỏ hết phần còn lại. METS structMap là điều kiện cần cho IIIF (STD-09).

**Ai đang làm (uy tín).** **Library of Congress** là nơi khai sinh BagIt và dùng nó cho toàn bộ luồng nhận dữ liệu. **Archivematica** dùng BagIt làm định dạng AIP mặc định. **Bibliothèque nationale de France** dùng METS cho toàn bộ tài liệu số nhiều trang trong Gallica, kết hợp ALTO cho lớp văn bản OCR — đúng mô hình cần cho văn bia Hán Nôm.

**Cost.** **8–14 người-ngày.** Gồm: đặc tả hồ sơ SIP cho 5 loại dữ liệu (~3 ngày); công cụ dòng lệnh đóng gói/verify BagIt (~3–5 ngày); hồ sơ METS structMap cho tài liệu nhiều trang + sinh mẫu (~3–5 ngày). **Hạ tầng: 0 USD/năm** (BagIt là quy ước thư mục; thư viện `bagit-python` của LoC là mã nguồn mở).

**Ưu tiên.** **P1 · [6 tháng]** — phần đặc tả và mẫu METS làm được trong demo; phần công cụ verify cần chạy thật.

**Rủi ro nếu KHÔNG làm.** Không chứng minh được tính toàn vẹn của dữ liệu **tại thời điểm bàn giao** — nếu sau này phát hiện tệp hỏng, không có cách phân định trách nhiệm giữa đơn vị số hoá và đơn vị lưu trữ. Đây là rủi ro hợp đồng thật, không chỉ rủi ro kỹ thuật. Với 82 bia UNESCO: Ký ức Thế giới đặt trọng tâm vào **tính xác thực (authenticity)** của tư liệu; không có chuỗi toàn vẹn từ nguồn thì tuyên bố xác thực của bản số hoá bị suy yếu — và bản số hoá chính là thứ sẽ được dùng khi bia gốc tiếp tục phong hoá.

---

### 4.2. Khối PREMIS

---

#### `STD-03` — Nâng PREMIS từ một thực thể lên đủ bốn, và ánh xạ `eventType` sang từ vựng Library of Congress

**Vì sao.** PREMIS 3.0 (LoC, 10/6/2015) có bốn thực thể: Object, Event, Agent, Rights. Dự án hiện chỉ có **Event** (`docs/07-mo-hinh-du-lieu.md:236-240`).

- **Object** thiếu `objectCharacteristics`: `Asset.fmt` là chuỗi tự do (`app/src/services/types.ts:63`), `EXT_BY_DIGITAL_FORM` chỉ là đuôi tệp (`app/src/data/digitization.ts:261-270`).
- **Agent** rải rác thành các chuỗi tên không cấu trúc: `Asset.owner` (`types.ts:75`), `createdBy` (`digitization.ts:231`), `translator`/`reviewer` (`digitization.ts:441-446`), `signedBy` (`digitization.ts:140`). Không phân biệt agent là người / tổ chức / **phần mềm** — trong khi thông tin phần mềm **đã được thu thập** ("Phần mềm huấn luyện + phiên bản", `data/06-metadata/template-splat.csv`).
- **Rights** hiện là rights statement mô tả (`digitization.ts:81-97`), không phải PREMIS Rights với `rightsBasis` và `actGranted` — tức chưa trả lời được "hệ thống **được phép làm gì** với đối tượng này" (di trú? sinh bản dẫn xuất?).
- **`eventType` là enum tiếng Việt tự chế** (`docs/07:238`), không hệ thống bên ngoài nào đọc được.

**Lợi ích lâu dài.** Bốn thực thể PREMIS là ngôn ngữ chung của toàn ngành bảo quản số. Có đủ bốn nghĩa là siêu dữ liệu bảo quản **di chuyển được sang hệ thống khác** — điều tối quan trọng khi hệ thống này rồi sẽ được thay sau 10–15 năm, trong khi dữ liệu phải sống hàng thế kỷ. Ánh xạ `eventType` sang từ vựng LoC cho phép giữ nguyên nhãn tiếng Việt cho cán bộ **và** xuất được ra ngoài.

**Ai đang làm (uy tín).** **Archivematica** ghi PREMIS Event cho mọi thao tác tự động, kèm PREMIS Agent cho **từng công cụ và phiên bản** đã chạy — đây là cách làm chuẩn mực và là mô hình nên sao chép trực tiếp. **Ex Libris Rosetta** (dùng tại nhiều thư viện quốc gia, trong đó có Thư viện Quốc gia New Zealand) triển khai đủ bốn thực thể PREMIS.

**Cost.** **10–16 người-ngày.** Gồm: mở rộng mô hình dữ liệu cho Object/Agent/Rights (~4 ngày); bảng ánh xạ `eventType` nội bộ ↔ từ vựng LoC (~2 ngày); cập nhật tài liệu và bổ sung dữ liệu mẫu minh hoạ (~4–6 ngày); màn hình hiển thị lịch sử sự kiện bảo quản (~2–4 ngày). **Hạ tầng: 0 USD/năm.**

**Ưu tiên.** **P1 · [6 tháng]** — bảng ánh xạ và mô hình làm được trong demo; ghi sự kiện tự động cần backend.

**Rủi ro nếu KHÔNG làm.** Khoá cứng vào hệ thống hiện tại: khi thay hệ thống, siêu dữ liệu bảo quản phải nhập tay lại hoặc mất. Với 82 bia UNESCO: không có PREMIS Agent cho phần mềm nghĩa là **không tái lập được** quy trình tạo ra mô hình 3D — sau 10 năm, khi phần mềm 3DGS hiện tại đã biến mất, không ai biết mô hình được sinh ra thế nào, và tính khoa học của bản ghi số bị đặt dấu hỏi.

---

#### `STD-04` — Fixity: lưu tên thuật toán và toàn bộ lịch sử kiểm tra, không chỉ một mốc

**Vì sao.** Fixity hiện có `checksum`, `checksumShort`, `fixityStatus`, `fixityCheckedAt` (`app/src/data/digitization.ts:288-298`) — hướng đúng, nhưng thiếu hai thứ khiến nó **không chứng minh được điều nó định chứng minh**:

1. **Không lưu `messageDigestAlgorithm`.** Chuỗi 64 hex gợi ý SHA-256 và nhãn UI nói SHA-256 (`app/src/i18n/vi.ts:127`), nhưng trường dữ liệu không ghi thuật toán. Thuật toán băm sẽ đổi — MD5 và SHA-1 đều đã bị loại. Kho lưu 50 năm chắc chắn sẽ có nhiều thuật toán cùng tồn tại.
2. **`fixityCheckedAt` chỉ là MỘT mốc** (`digitization.ts:296`), bị ghi đè mỗi lần kiểm tra. Giá trị pháp lý của fixity nằm ở **chuỗi liên tục các lần kiểm tra đều đạt**; "đã kiểm tra hôm qua" không nói gì về 5 năm trước.

Bảng `PREMIS_EVENT` **đã có sẵn loại `FIXITY_CHECK`** (`docs/07-mo-hinh-du-lieu.md:238`) — chỉ chưa nối vào.

**Lợi ích lâu dài.** Lịch sử fixity là **bằng chứng cốt lõi** kiểm toán viên CoreTrustSeal và ISO 16363 hỏi đầu tiên. Có nó thì trả lời được câu hỏi quan trọng nhất của bảo quản số: "làm sao ông biết tệp này vẫn là tệp gốc?" — bằng một chuỗi kiểm chứng liên tục thay vì một lời khẳng định.

**Ai đang làm (uy tín).** **Chronopolis** và **APTrust** (liên minh bảo quản số của các đại học Mỹ) công bố lịch sử fixity như báo cáo định kỳ cho đơn vị gửi dữ liệu. **Archivematica** ghi mỗi lần kiểm tra fixity thành một PREMIS Event riêng, đúng mô hình cần.

**Cost.** **4–7 người-ngày.** Gồm: thêm trường thuật toán + bảng lịch sử kiểm tra (~2 ngày); màn hình hiển thị chuỗi kiểm tra (~2–3 ngày); cập nhật tài liệu (~1–2 ngày). **Hạ tầng: 0 USD/năm** cho phần mô hình; khi chạy thật, chi phí là **thời gian CPU quét định kỳ** — với kho vài TB, không đáng kể trên hạ tầng self-host.

**Ưu tiên.** **P1 · [6 tháng]** — mô hình và màn hình làm được trong demo (dữ liệu lịch sử mô phỏng); quét thật cần backend.

**Rủi ro nếu KHÔNG làm.** Trượt CoreTrustSeal ở đúng yêu cầu về toàn vẹn dữ liệu. Nghiêm trọng hơn: nếu một tệp hỏng âm thầm (bit rot), không có lịch sử thì **không xác định được hỏng từ bao giờ**, do đó không biết bản sao lưu nào còn sạch để khôi phục — biến một sự cố nhỏ thành mất dữ liệu vĩnh viễn. Với 82 bia UNESCO, mất một bản ghi số gốc là mất một trạng thái bề mặt bia **không tái tạo được**, vì bia thật tiếp tục phong hoá từng năm.

---

#### `STD-05` — Tuyên bố significant properties và gắn định danh định dạng (PRONOM PUID)

**Vì sao.** PREMIS `significantProperties` ghi "thuộc tính nào phải được bảo toàn qua di trú". Hiện không có, và `Asset.fmt` chỉ là chuỗi tự do (`app/src/services/types.ts:63`). Kế hoạch có nhắc PRONOM nhưng ở "Level 4 — Giai đoạn 2" (`docs/02-quy-trinh-bao-quan-sao-luu.md:318`).

Điểm đặc biệt: **với mô hình 3D và Gaussian splat, significant properties vẫn là câu hỏi mở của cả ngành quốc tế** — và dự án này đang nắm giữ đúng loại dữ liệu đó. Khi di trú một mesh khỏi GLB, cái gì bắt buộc phải giữ? Hình học? Texture ở độ phân giải nào? Hệ toạ độ? Sai số căn chỉnh?

Điều đáng chú ý: **template CSV đã thu thập đúng những trường này** — "Độ phân giải bề mặt (mm)", "Số tam giác", "Độ phân giải texture", "Sai số căn chỉnh (RMS)", "Hệ tọa độ tham chiếu" (`data/06-metadata/template-3d-mesh.csv`) và "Số lượng Gaussian/điểm", "Phần mềm huấn luyện + phiên bản", "Độ chính xác (RMSE)" (`data/06-metadata/template-splat.csv`). Dữ liệu đã có; thiếu là **tuyên bố chúng là thuộc tính phải bảo toàn**.

**Lợi ích lâu dài.** Đây là hạng mục hiếm hoi mà dự án có thể **đóng góp ngược cho cộng đồng quốc tế** thay vì chỉ đi theo. Một bộ significant properties cho 3D/3DGS di sản, công bố công khai, sẽ được trích dẫn — và đó là loại uy tín không mua được bằng tiền. Về mặt thực dụng, nó là điều kiện để sau này quyết định di trú định dạng một cách có cơ sở thay vì đoán.

**Ai đang làm (uy tín).** **The National Archives (UK)** duy trì **PRONOM**, cơ sở dữ liệu định dạng tệp chuẩn của ngành, và công cụ nhận dạng **DROID** — cả hai miễn phí. **Smithsonian Institution** đã công bố nhiều tài liệu về bảo quản mô hình 3D từ chương trình Smithsonian Open Access. Với 3DGS, đây là lĩnh vực **chưa ai giải xong**, nên vị thế đóng góp đang bỏ ngỏ.

**Cost.** **6–10 người-ngày.** Gồm: gắn PUID cho các định dạng đang dùng (~2 ngày — số định dạng ít, `digitization.ts:261-270` chỉ có 8 dạng); soạn bộ significant properties cho 5 loại dữ liệu, riêng 3D/splat cần tham vấn chuyên gia (~4–6 ngày); tài liệu hoá (~1–2 ngày). **Hạ tầng: 0 USD/năm** (PRONOM và DROID miễn phí).

**Ưu tiên.** **P2 · [18 tháng]** — trừ phần gắn PUID (rẻ, nên gộp vào STD-03).

**Rủi ro nếu KHÔNG làm.** Khi định dạng lỗi thời (chắc chắn xảy ra với `.splat`, vốn công bố năm 2023 và chưa có chuẩn ISO/OGC — dự án đã nhận ra điều này, `digitization.ts:390`), việc di trú sẽ diễn ra **mà không có tiêu chí nghiệm thu**. Kết quả điển hình: di trú xong mới phát hiện mất thông tin không phục hồi được. Với 82 bia UNESCO, mất độ chính xác hình học nghĩa là mất khả năng đo đạc khảo cổ trên bản số — chính là công dụng khoa học chính của mô hình 3D.

---

### 4.3. Khối LIDO / CIDOC-CRM / Spectrum

---

#### `STD-06` — Xây bảng ánh xạ LIDO 1.1 + Dublin Core và bộ xuất bản ghi

**Vì sao.** LIDO là *lingua franca* trao đổi dữ liệu bảo tàng, phiên bản hiện hành **v1.1 do ICOM-CIDOC công bố 12/2021**. Hiện LIDO chỉ tồn tại như một dòng thuật ngữ (`docs/thuat-ngu.md:110`) và một lần nhắc trong mô tả (`docs/12-chat-luong-du-lieu.md:108`). **Không schema, không bộ xuất, không danh sách trường bắt buộc.**

Dublin Core cũng vậy: giao diện khẳng định "chuẩn Dublin Core rút gọn" (`app/src/i18n/vi.ts:51`) và comment code nói "DC rút gọn" (`app/src/components/CoreMetadataForm.tsx:9`), chỉ số chất lượng đo "tỷ lệ ánh xạ Dublin Core hợp lệ" với ngưỡng 100% (`docs/12-chat-luong-du-lieu.md:106`) — **nhưng trong `app/` không có bảng ánh xạ DC nào để mà đo.** Form lõi còn thiếu hẳn `dc:creator`, `dc:publisher`, `dc:language`, `dc:source` (`CoreMetadataForm.tsx:57-71`).

Điểm mấu chốt: **dữ liệu đã gần đủ để xuất LIDO.** Đã có tên, loại hình, niên đại (kể cả EDTF), vị trí, mô tả, quan hệ, quyền, đơn vị quản lý. Thiếu là **lớp ánh xạ**, không phải dữ liệu.

**Lợi ích lâu dài.** Đây là **cánh cửa duy nhất** để dữ liệu Văn Miếu đi ra ngoài mà không mất nghĩa. Có LIDO là có đường vào Europeana, vào các cổng tổng hợp, vào bất kỳ hệ thống bảo tàng nào. Không có LIDO thì mọi hợp tác quốc tế đều phải làm lại từ đầu, mỗi lần một kiểu.

**Ai đang làm (uy tín).** **Deutsche Digitale Bibliothek** nhận dữ liệu từ hàng nghìn bảo tàng Đức qua LIDO. **Europeana** dùng EDM nhưng LIDO là đường vào chuẩn cho dữ liệu bảo tàng. **Rijksmuseum** công bố dữ liệu bộ sưu tập qua API mở với ánh xạ chuẩn hoá và là hình mẫu được trích dẫn nhiều nhất về mở dữ liệu bảo tàng.

**Cost.** **8–12 người-ngày.** Gồm: bảng ánh xạ trường nội bộ ↔ LIDO 1.1 ↔ DC/DCMI Terms (~4 ngày); bổ sung các trường DC còn thiếu vào form lõi (~2 ngày); bộ xuất LIDO XML cho dữ liệu mẫu (~3–5 ngày). **Hạ tầng: 0 USD/năm** (LIDO là schema XML mở).

**Ưu tiên.** **P0 · [Demo thầu]** — **toàn bộ làm được trong lớp mock.** Xuất một tệp LIDO XML hợp lệ từ dữ liệu mẫu là màn trình diễn có sức thuyết phục rất cao trước hội đồng, chi phí thấp.

**Rủi ro nếu KHÔNG làm.** Giao diện đang **hứa** Dublin Core mà không có ánh xạ — nếu hội đồng hỏi, đây là điểm yếu bị lộ. Về dài hạn, dữ liệu bị cô lập. Với 82 bia UNESCO: hồ sơ Ký ức Thế giới là hồ sơ quốc tế; khi UNESCO hoặc đối tác nghiên cứu hỏi "dữ liệu số theo chuẩn nào, lấy về ra sao", câu trả lời hiện tại là "CSV tiếng Việt và một cổng dữ liệu mở cấp Thành phố" — không đủ tầm với vị thế Ký ức Thế giới.

---

#### `STD-07` — Nâng CIDOC-CRM từ mức khái niệm lên mức property, viện dẫn ISO 21127:2023

**Vì sao.** Việc tách hai trục `ObjectClass` × `DigitalForm` (`app/src/data/taxonomy.ts:3-9`, `docs/adr/0003`) và dùng E54 Dimension làm bảng lặp lại (`app/src/components/PhysicalSpecsForm.tsx:12`, `docs/adr/0007`) là **đúng và đáng khen**. Nhưng đến đó là hết: **không một property CRM nào được dùng.**

Quan hệ hiện là **nhãn tiếng Anh tự chế**: `depictedIn`, `mentionedIn`, `subjectOf`, `hasRubbing` (`app/src/services/types.ts:41`, `app/src/data/digitization.ts:396-401`), `hasRepresentation`, `hasDrawing`, `hasPreservationSurrogate` (`digitization.ts:382-384`). Chúng **đọc giống chuẩn nhưng không thuộc chuẩn nào**. CRM có sẵn `P138 represents`, `P62 depicts`, `P67 refers to`, `P128 carries`.

Kèm theo hai lỗi nhất quán cần sửa cùng lúc:
- **Template CSV dùng bộ nhãn ngược chiều với code**: CSV dùng `depicts`, `isRepresentationOf`, `describes` (`data/06-metadata/template-3d-mesh.csv`, `template-anh.csv`, `template-media.csv`), code dùng `depictedIn`, `mentionedIn`, `subjectOf` (`types.ts:41`). `depicts` và `depictedIn` là **hai chiều ngược nhau** — nhập theo nghĩa đen sẽ đảo ngược quan hệ.
- **`RelationRule.kind` thiếu `hasRubbing`** (`app/src/data/relations.ts:20` chỉ có 3 giá trị), nên **không luật nào sinh ra quan hệ bản dập** — dù bản dập văn bia là loại tư liệu trung tâm của kho (có xuất hiện ở `app/src/data/metadataFields.ts:85`).

Viện dẫn cũng cần nêu phiên bản: **ISO 21127:2023**, tương ứng CIDOC CRM community version **7.1.3**.

**Lợi ích lâu dài.** Property CRM là thứ biến dữ liệu thành **đồ thị tri thức truy vấn được**: "cho tôi mọi tư liệu nhắc đến Khuê Văn Các" — câu hỏi mà dự án đã tự đặt ra (`app/src/data/relations.ts:10-11,53`) — trở thành truy vấn chuẩn thay vì hàm lọc riêng (`relations.ts:54-56`). Đây cũng là nền cho Linked Art về sau.

**Ai đang làm (uy tín).** **Yale LUX** (ra mắt cuối tháng 5/2023) hợp nhất thư viện, bảo tàng nghệ thuật, trung tâm nghệ thuật Anh và bảo tàng lịch sử tự nhiên của Yale — hơn **50 triệu bản ghi**, hơn 17 triệu hiện vật — trên nền **CIDOC-CRM + Linked Art (LOUD)**. Đây là minh chứng thuyết phục nhất hiện có rằng mô hình này chạy được ở quy mô thật. **British Museum** là một trong những đơn vị công bố dữ liệu theo CIDOC-CRM sớm nhất. **Getty** duy trì Linked Art cùng cộng đồng.

**Cost.** **10–15 người-ngày** cho lớp CRM property (bảng ánh xạ nhãn nội bộ → property CRM, sửa nhất quán CSV/code, bổ sung `hasRubbing`). **Cộng thêm 12–20 người-ngày** nếu làm tiếp lớp xuất Linked Art JSON-LD (khuyến nghị hoãn). **Hạ tầng: 0 USD/năm** cho ánh xạ; nếu dựng triple store về sau, ước tính **500–2.000 USD/năm** cho máy chủ self-host bổ sung.

**Ưu tiên.** **P1 · [6 tháng]** cho ánh xạ property và sửa nhất quán. **P2 · [18 tháng]** cho Linked Art.

**Rủi ro nếu KHÔNG làm.** Lỗi đảo chiều quan hệ giữa CSV và code là **lỗi dữ liệu thật sẽ xảy ra khi nhập liệu hàng loạt** — và quan hệ sai chiều rất khó phát hiện sau khi đã nhập hàng nghìn bản ghi. Với 82 bia UNESCO: mạng quan hệ bia ↔ bản dập ↔ ảnh tư liệu ↔ khảo cứu chính là **giá trị nghiên cứu cốt lõi**; nếu quan hệ không chuẩn hoá, mạng này không chia sẻ được và mỗi nhà nghiên cứu quốc tế phải dựng lại từ đầu.

---

#### `STD-08` — Sửa viện dẫn "Spectrum 5.0" → **Spectrum 5.1**, và ánh xạ tường minh 21 quy trình

**Vì sao.** Hai chỗ viện dẫn sai phiên bản: `app/src/i18n/vi.ts:140` ("theo CIDOC-CRM E54 Dimension và **Spectrum 5.0**") và `docs/adr/0007:13`. Phiên bản hiện hành là **Spectrum 5.1, Collections Trust công bố 9/2022** (cập nhật một phần của Spectrum 5.0/2017), gồm **21 quy trình quản lý bộ sưu tập**.

Ngoài lỗi phiên bản, cần một bảng đối chiếu tường minh 21 quy trình — nêu rõ quy trình nào hệ thống phục vụ, quy trình nào **cố ý nằm ngoài phạm vi** (đây là hệ quản lý *tài sản số*, không phải hệ quản lý hiện vật vật lý toàn diện). Hiện có: Inventory làm tốt (`app/src/pages/InventoryPage.tsx:18-29,330-396`), Cataloguing có (`CoreMetadataForm.tsx`), Deaccession một phần (`types.ts:9-11,23`). Thiếu đáng kể: **Condition checking** và **Location and movement control** — hai quy trình ảnh hưởng trực tiếp tới quyết định số hoá lại.

**Lợi ích lâu dài.** Bảng đối chiếu tường minh biến một điểm yếu tiềm tàng ("hệ thống của các ông thiếu quản lý cho mượn hiện vật") thành một tuyên bố phạm vi có chủ đích — điều mà hội đồng chấm thầu đánh giá cao hơn nhiều so với im lặng. Về nghiệp vụ, Condition checking gắn với chu kỳ số hoá lại: bia phong hoá thêm thì cần scan lại.

**Ai đang làm (uy tín).** **Collections Trust (Anh)** duy trì Spectrum; đây là chuẩn quản lý bộ sưu tập được áp dụng rộng nhất trên thế giới, bắt buộc trong chương trình công nhận bảo tàng ở Anh. Các hệ **Axiell Adlib/EMu** và **TMS (Gallery Systems)** đều tự mô tả mức tuân thủ Spectrum theo từng quy trình — chính là mô hình bảng đối chiếu nên làm.

**Cost.** **3–5 người-ngày.** Gồm: sửa viện dẫn (~0.5 ngày); soạn bảng đối chiếu 21 quy trình có ghi rõ trong/ngoài phạm vi (~2–3 ngày); phác thảo quy trình Condition checking (~1–2 ngày). **Hạ tầng: 0 USD/năm.**

**Ưu tiên.** **P0 · [Demo thầu]** cho việc sửa viện dẫn và bảng đối chiếu (thuần tài liệu, rẻ, hiệu quả cao). **P2 · [18 tháng]** cho việc hiện thực Condition checking.

**Rủi ro nếu KHÔNG làm.** Viện dẫn sai phiên bản là lỗi rẻ tiền gây mất điểm nặng — hội đồng có chuyên gia bảo tàng sẽ nhận ra ngay, và nó gieo nghi ngờ rằng các viện dẫn chuẩn khác cũng chỉ là trang trí. Với 82 bia UNESCO: không có quy trình kiểm tra tình trạng nghĩa là không có cơ sở dữ liệu về **tốc độ phong hoá** — trong khi đó chính là thông tin quan trọng nhất để lập kế hoạch số hoá lại và để báo cáo tình trạng bảo tồn cho UNESCO.

---

### 4.4. Khối IIIF

---

#### `STD-09` — Triển khai IIIF Image API 3.0 và Presentation API 3.0

**Vì sao.** Đây là **lỗ hổng nghiêm trọng nhất toàn hồ sơ**. grep toàn bộ `app/src/`: **0 kết quả** liên quan IIIF. Trong tài liệu, IIIF xuất hiện đúng hai lần, đều hoãn: `docs/thuat-ngu.md:112` ("Thuộc phạm vi giai đoạn 2") và `docs/02-quy-trinh-bao-quan-sao-luu.md:256` (nhắc gián tiếp qua JPEG2000).

IIIF không phải "zoom ảnh cho đẹp" — nó là **giao thức mà cộng đồng nghiên cứu văn bản quốc tế dùng để làm việc**. Và kho này có đúng loại tài sản IIIF sinh ra để phục vụ: 82 bia Tiến sĩ là hiện vật **văn bản**, mặt bia dày đặc chữ Hán. Nhu cầu thật gồm: zoom tới từng nét khắc mòn; đặt ảnh bia cạnh **bản dập** để đối chiếu (`RelationKind.hasRubbing`, `types.ts:41`); **neo phiên âm và bản dịch vào đúng vị trí chữ trên mặt bia** qua Web Annotation.

Điểm cuối cùng đặc biệt quan trọng: công sức phiên âm/dịch/song thẩm là phần **đắt nhất và trí tuệ nhất** của dự án (`app/src/data/digitization.ts:441-446`, `app/src/components/CoreMetadataForm.tsx:169-212`), nhưng hiện bị nhốt trong một ô textarea rời, **không neo vào ảnh**, không ai ngoài hệ thống này dùng được.

Nghịch lý đáng nói: **hạ tầng đã sẵn sàng.** Dự án đã chọn JPEG2000 làm định dạng phân phối và đã ghi rõ lý do là deep zoom qua IIIF (`docs/02:256`). Định dạng đúng rồi, chỉ thiếu lớp phục vụ.

**Lợi ích lâu dài.** IIIF là thứ đưa 82 bia vào hệ sinh thái nghiên cứu toàn cầu mà không cần đàm phán song phương với từng đối tác. Manifest IIIF hoạt động trong Mirador, Universal Viewer, và mọi công cụ nghiên cứu khác — dữ liệu Văn Miếu đặt cạnh dữ liệu từ Gallica, NDL, Đài Bắc trong cùng một cửa sổ so sánh.

**Ai đang làm (uy tín).** **Bibliothèque nationale de France / Gallica** phục vụ hơn 7 triệu tài liệu và trên 100 triệu ảnh qua IIIF API, định danh dạng `ark:/12148/...`. **Vatican Library**, **British Library**, **Bodleian** đều dùng IIIF cho bản thảo. Ở châu Á: **National Diet Library (Nhật Bản)** và **National Palace Museum (Đài Bắc)** đều triển khai IIIF — tức là **đúng nhóm đối tác nghiên cứu Hán Nôm mà Văn Miếu cần kết nối**. Máy chủ ảnh mã nguồn mở phổ biến: **Cantaloupe** (miễn phí, self-host, hợp ràng buộc dữ liệu quốc gia) và **IIPImage**.

**Cost.** Chia hai giai đoạn:
- **[Demo thầu] 5–8 người-ngày** — sinh **manifest IIIF Presentation 3.0 tĩnh** cho ~20–30 bản ghi mẫu, nhúng viewer Mirador hoặc Universal Viewer vào trang chi tiết. **Không cần backend**, vì manifest là JSON tĩnh.
- **[6 tháng] 12–20 người-ngày** — dựng Cantaloupe self-host, sinh manifest động, nối vào kho ảnh thật.
- **Hạ tầng: ~1.000–3.000 USD/năm** cho một máy chủ ảnh self-host (CPU + RAM + đĩa đệm ảnh phái sinh), giả định lưu lượng nghiên cứu vừa phải. **License phần mềm: 0 USD** (Cantaloupe là mã nguồn mở).

**Ưu tiên.** **P0 · [Demo thầu]** cho manifest tĩnh + viewer. **P1 · [6 tháng]** cho máy chủ ảnh thật.

**Rủi ro nếu KHÔNG làm.** Đây là rủi ro lớn nhất trong toàn báo cáo. **82 bia Tiến sĩ không thể tham gia hệ sinh thái nghiên cứu văn bản quốc tế.** Các nhóm Hán Nôm học ở NDL, Academia Sinica, National Palace Museum đều làm việc qua IIIF — không có manifest thì dữ liệu Văn Miếu **không tồn tại** với họ, bất kể chất lượng số hoá cao đến đâu. Với hồ sơ Ký ức Thế giới, mục tiêu tự thân của chương trình là **khả năng tiếp cận tư liệu**; một kho số hoá công phu nhưng không tiếp cận được theo chuẩn quốc tế là mâu thuẫn trực tiếp với tinh thần ghi danh. Đây cũng là hạng mục có **tỷ lệ ấn tượng/chi phí cao nhất** cho bản demo thầu.

---

#### `STD-10` — IIIF Content Search 2.0, Authorization Flow 2.0 và Change Discovery 1.0

**Vì sao.** Ba API bổ trợ, mỗi cái khớp trực tiếp với một nhu cầu đã tồn tại trong hệ thống:

- **Content Search 2.0 (2022)** — tìm chữ trong nội dung văn bản của manifest. Đúng nhu cầu Hán Nôm: tìm một chữ, một tên người, một niên hiệu **xuyên qua 82 mặt bia**. Dữ liệu nguồn đã có (`originalText`, `transliteration`, `translation` — `CoreMetadataForm.tsx:172-194`).
- **Authorization Flow 2.0 (10/7/2023)** — kiểm soát truy cập ảnh theo tầng. App **đã có sẵn mô hình quyền tương thích**: 3 mức `CONG_KHAI | NGHIEN_CUU | NOI_BO` (`app/src/data/digitization.ts:107-113`) và mã khuyết `HAN_CHE` cho nội dung hạn chế công bố (`app/src/data/missingValues.ts:14`). Cho phép công bố ảnh phân giải thấp rộng rãi trong khi ảnh gốc yêu cầu xác thực — khớp với ràng buộc DPIA về dữ liệu cá nhân trong gia phả, sắc phong (`app/src/data/complianceEvidence.ts:158-161`).
- **Change Discovery 1.0 (2021 — *ngày chính xác cần kiểm chứng*)** — dòng hoạt động ActivityStreams cho phép đối tác harvest gia tăng. Đây là **thay thế hiện đại cho OAI-PMH**, và liên quan trực tiếp tới STD-17.

**Lợi ích lâu dài.** Content Search biến kho từ "xem được" thành "nghiên cứu được" — khác biệt về chất. Auth Flow giải bài toán khó nhất của di sản số: **mở tối đa mà vẫn tuân thủ**, thay vì đóng tất cả cho an toàn. Change Discovery giúp đối tác đồng bộ mà không cần gọi lại toàn bộ kho.

**Ai đang làm (uy tín).** **Gallica/BnF** và **National Diet Library (Nhật Bản)** triển khai tìm kiếm nội dung trên tài liệu số hoá qua IIIF. Auth Flow được các thư viện có tài liệu bản quyền hạn chế dùng phổ biến để phân tầng độ phân giải.

**Cost.** **10–16 người-ngày**, giả định **STD-09 đã xong** (phụ thuộc cứng). Gồm: Content Search trên dữ liệu phiên âm/dịch (~5–7 ngày); nối Auth Flow vào 3 mức truy cập sẵn có (~3–5 ngày); dòng Change Discovery (~2–4 ngày). **Hạ tầng: bao gồm trong chi phí máy chủ IIIF của STD-09**; nếu dùng chỉ mục tìm kiếm riêng, cộng thêm **~500–1.500 USD/năm** self-host.

**Ưu tiên.** **P1 · [18 tháng]** — sau STD-09. Không nên làm trước vì phụ thuộc manifest.

**Rủi ro nếu KHÔNG làm.** Không phải rủi ro mất mát mà là **rủi ro lãng phí**: đầu tư lớn nhất của dự án — phiên âm và dịch Hán Nôm có song thẩm — không sinh ra giá trị tìm kiếm tương xứng. Với 82 bia UNESCO: giá trị Ký ức Thế giới nằm ở **nội dung văn bản** (danh sách tiến sĩ, chế độ khoa cử), không phải ở khối đá; không tìm kiếm được nội dung thì giá trị được ghi danh không được số hoá phục vụ đúng nghĩa.

---

### 4.5. Khối quyền và định danh bền vững

---

#### `STD-11` — Chuẩn hoá quyền: tách rights statement khỏi license, dùng URI thay vì chuỗi

**Vì sao.** Hai lỗi kỹ thuật cụ thể trong `RIGHTS_STATEMENTS` (`app/src/data/digitization.ts:81-97`):

1. **Trộn hai vocabulary khác loại vào một enum.** `InC-EDU` và `UND` là mã **RightsStatements.org** (bộ 12 statement do DPLA + Europeana + Creative Commons lập); `CC-BY-4.0` là **giấy phép Creative Commons**. Rights statement mô tả *tình trạng bản quyền*; license là *sự cấp phép*. Một đối tượng có thể có cả hai. Gộp làm một buộc phải chọn một và mất thông tin. Mô hình dữ liệu lặp lại lỗi này (`docs/07-mo-hinh-du-lieu.md:249`).
2. **Không có URI.** RightsStatements.org là linked data vocabulary; định danh chuẩn là `http://rightsstatements.org/vocab/InC-EDU/1.0/`. Code chỉ lưu chuỗi `'InC-EDU'` (`digitization.ts:88`). Mô hình dữ liệu **có** cột `url` (`docs/07:252`) nhưng code chưa dùng. **Europeana bắt buộc rights phải là URI trong EDM** — không URI thì không publish được.

Thêm nữa, ô nhập giấy phép là **text tự do** (`app/src/components/CoreMetadataForm.tsx:63,148-150`) với placeholder `'vd. CC BY-NC 4.0 / Theo yêu cầu / Nội bộ VM'` (`app/src/i18n/vi.ts:101`) — nguồn dữ liệu bẩn kinh điển. Cần đổi thành danh sách chọn ràng buộc.

**Kèm một quyết định chính sách cần đưa lên lãnh đạo.** Danh mục dữ liệu mở đang gán **CC BY-NC 4.0** cho bộ 82 bia (`app/src/pages/CompliancePage.tsx:542`, `app/src/data/complianceEvidence.ts:188`). Cần biết: **Europeana content tier 4 chỉ chấp nhận CC BY, CC BY-SA, CC0 hoặc PDM** — NC bị loại. Ngoài ra, văn bia thế kỷ 15–18 **đã thuộc phạm vi công cộng**; ở nhiều khung pháp lý quốc tế, bản sao trung thực 2D của tác phẩm phạm vi công cộng **không phát sinh quyền mới**. Đây là quyết định chính sách, **không nên để lập trình viên quyết ngầm qua một hằng số**.

**Lợi ích lâu dài.** Quyền máy đọc được là điều kiện bắt buộc để tham gia bất kỳ hạ tầng chia sẻ quốc tế nào. Tách statement/license giữ được cả tình trạng pháp lý lẫn điều kiện sử dụng — cần thiết cho tư liệu có nguồn gốc hỗn hợp (ảnh Pháp thuộc, tư liệu hiến tặng).

**Ai đang làm (uy tín).** **Europeana** và **DPLA** đồng sáng lập RightsStatements.org và bắt buộc dùng URI. **Rijksmuseum** công bố hàng trăm nghìn ảnh phân giải cao ở phạm vi công cộng và trở thành hình mẫu được trích dẫn nhiều nhất về mở dữ liệu bảo tàng. **Smithsonian Open Access** (ra mắt 2/2020) công bố hàng triệu tư liệu theo **CC0** — mô hình đáng tham khảo cho quyết định chính sách nêu trên.

**Cost.** **4–6 người-ngày.** Gồm: tách hai trường statement/license và gắn URI (~2 ngày); đổi ô nhập tự do thành danh sách chọn (~1 ngày); tài liệu chính sách quyền để lãnh đạo quyết (~1–2 ngày). **Hạ tầng: 0 USD/năm** (RightsStatements.org và CC đều miễn phí).

**Ưu tiên.** **P0 · [Demo thầu]** — rẻ, làm hoàn toàn trong mock, và là **điều kiện cần** cho STD-17.

**Rủi ro nếu KHÔNG làm.** Không publish được sang Europeana hay bất kỳ cổng tổng hợp quốc tế nào. Dữ liệu quyền dạng chuỗi tự do sẽ tích tụ biến thể không thể làm sạch về sau. Với 82 bia UNESCO: nếu giữ CC BY-NC, bộ dữ liệu **tự loại mình khỏi tier cao nhất của Europeana** — một hạn chế tự áp đặt lên chính tư liệu mà UNESCO ghi danh nhằm **thúc đẩy tiếp cận**, và khó biện minh khi bản thân văn bia đã thuộc phạm vi công cộng từ lâu.

---

#### `STD-12` — Cấp định danh bền vững phân giải được (ARK), kèm cam kết thể chế

**Vì sao.** Hệ mã hai tầng (`app/src/services/types.ts:52-57`) là thiết kế **tốt và có kỷ luật** — mã tầng 1 gắn với *đối tượng vật lý*, đúng nguyên tắc. Nhưng "bền vững" theo nghĩa của ngành có ba điều kiện, và hệ mã này **không đạt cả ba**: không phân giải được toàn cầu (`VM-HV-00013.M3D01` không phải URL); không có cam kết thể chế công khai; không độc lập với công nghệ.

Điều kiện thứ ba có rủi ro cụ thể: mã tầng 2 **nhúng `DigitalForm`** (`M3D`, `SPL`, `PCL`…, `app/src/data/taxonomy.ts:31-40`). Nếu một bản ghi được phân loại lại, mã **hoặc phải đổi (phá vỡ tính bền vững), hoặc trở thành sai nghĩa**. Bài học kinh điển của ngành: **định danh bền vững phải vô nghĩa (opaque)**. `docs/adr/0004` chọn mã có nghĩa vì lý do vận hành hợp lý, nhưng đánh đổi cần được ghi nhận tường minh.

Giải pháp không phải bỏ mã hiện tại mà **giữ mã có nghĩa cho vận hành nội bộ, cấp thêm một định danh vô nghĩa phân giải được cho bên ngoài** — đúng cách Gallica làm.

Tài liệu đã nhận ra vấn đề nhưng **xếp sai độ ưu tiên**: `pid_quoc_gia` ở trạng thái "Roadmap — chưa bắt buộc" (`docs/07-mo-hinh-du-lieu.md:66`), ARK/Handle ở "**Lộ trình xa hơn**" (`docs/07:68`).

**Vì sao thứ tự này nguy hiểm:** định danh là quyết định **một chiều**. Ngày dữ liệu được công bố và người ngoài bắt đầu trích dẫn, mọi định danh đã phát tán trở thành nghĩa vụ vĩnh viễn. Sửa "sau" nghĩa là hoặc phá vỡ mọi liên kết đã có, hoặc duy trì bảng ánh xạ mãi mãi. **Rẻ khi làm trước, rất đắt khi làm sau** — ngược hoàn toàn với thứ tự hiện tại.

**Lợi ích lâu dài.** Trích dẫn học thuật tới dữ liệu Văn Miếu sẽ còn hoạt động sau khi hệ thống này đã được thay hai lần. Đây chính là định nghĩa của hạ tầng di sản.

**Ai đang làm (uy tín).** **Bibliothèque nationale de France** dùng ARK với NAAN **12148** cho toàn bộ Gallica — định danh dạng `ark:/12148/btv1b8449691v`, phân giải qua `https://gallica.bnf.fr/`, và tích hợp thẳng vào đường dẫn IIIF. Đây là mô hình gần nhất với nhu cầu của Văn Miếu: **một định danh phục vụ cả trích dẫn lẫn truy cập ảnh**. **California Digital Library** khởi xướng ARK; **ARK Alliance** cấp NAAN **miễn phí**. Lựa chọn thay thế là **Handle** (hạ tầng của DONA Foundation, có phí thành viên) — ARK phù hợp hơn vì miễn phí và không ràng buộc.

**Cost.** **6–10 người-ngày.** Gồm: đăng ký NAAN với ARK Alliance (~0.5 ngày, **miễn phí**); thiết kế lược đồ định danh vô nghĩa và bảng ánh xạ sang mã nội bộ (~2 ngày); dựng resolver (~3–5 ngày); soạn **văn bản cam kết duy trì định danh** ký cấp lãnh đạo Trung tâm (~1–2 ngày — đây là phần quan trọng nhất và thường bị bỏ qua). **Hạ tầng: ~200–800 USD/năm** cho tên miền phân giải ổn định và phần dịch vụ resolver, giả định chạy ghép trên hạ tầng sẵn có. **Phí NAAN: 0 USD.**

**Ưu tiên.** **P0 · [6 tháng]** — nhưng **quyết định lược đồ phải chốt TRƯỚC khi công bố dữ liệu ra ngoài**. Nếu bản demo thầu có công bố công khai bất kỳ dữ liệu nào, cần chốt sớm hơn.

**Rủi ro nếu KHÔNG làm.** Mọi trích dẫn học thuật quốc tế tới dữ liệu Văn Miếu sẽ trỏ vào URL sẽ chết. Đây là hỏng hóc **không sửa được sau khi đã phát tán**. Với 82 bia UNESCO, hệ quả nặng hơn hẳn: hồ sơ Ký ức Thế giới là hồ sơ **quốc tế và vĩnh viễn**; các trích dẫn học thuật tới tư liệu này sẽ tồn tại hàng chục năm và xuất hiện trong công trình nghiên cứu, giáo trình, hồ sơ UNESCO. Định danh chết biến di sản tư liệu được ghi danh toàn cầu thành một mớ liên kết hỏng — đúng điều Ký ức Thế giới tồn tại để ngăn chặn.

---

#### `STD-13` — Cấp DOI cho các tập dữ liệu công bố có thể trích dẫn

**Vì sao.** ARK (STD-12) giải bài toán định danh **từng đối tượng**. DOI giải bài toán khác: **tập dữ liệu như một ấn phẩm có thể trích dẫn**, kèm siêu dữ liệu trích dẫn chuẩn và số liệu trích dẫn đo được. Hai thứ bổ sung nhau, không thay thế nhau.

Hiện danh mục dữ liệu mở liệt kê ba bộ dữ liệu (`app/src/pages/CompliancePage.tsx:541-545`) nhưng **không bộ nào có định danh trích dẫn được**.

**Lợi ích lâu dài.** DOI biến việc công bố dữ liệu thành **thành tích học thuật đo đếm được** cho Trung tâm — quan trọng cho uy tín, cho hợp tác nghiên cứu, và cho việc xin ngân sách các kỳ sau. Nó cũng tạo động lực đúng: nhà nghiên cứu trích dẫn tập dữ liệu thay vì tải về rồi tái phát tán bản sao không nguồn gốc.

**Ai đang làm (uy tín).** **DataCite** là cơ quan cấp DOI cho dữ liệu nghiên cứu, thành viên gồm phần lớn thư viện quốc gia và đại học lớn. Nhiều bảo tàng và thư viện công bố tập dữ liệu bộ sưu tập kèm DOI để phục vụ trích dẫn học thuật.

**Cost.** **3–5 người-ngày** cho thiết lập ban đầu và siêu dữ liệu trích dẫn. **Hạ tầng/phí: ~500–2.000 USD/năm** cho phí thành viên tổ chức cấp DOI — *(mức phí cụ thể theo hạng thành viên và khu vực, **cần kiểm chứng** với DataCite hoặc đơn vị trung gian trong nước)*. Có thể giảm bằng cách đi qua một đơn vị trung gian đã là thành viên (ví dụ một thư viện đại học đối tác) thay vì tự đăng ký.

**Ưu tiên.** **P2 · [18 tháng]** — chỉ đáng làm sau khi đã có ARK và đã có dữ liệu ổn định để đóng gói thành bộ công bố.

**Rủi ro nếu KHÔNG làm.** Rủi ro thấp — đây là hạng mục "nên có". Chi phí chính là **cơ hội bị bỏ lỡ**: công sức số hoá không chuyển hoá thành uy tín học thuật đo được. Với 82 bia UNESCO, một tập dữ liệu có DOI kèm mô tả chuẩn sẽ là cách tự nhiên nhất để giới nghiên cứu quốc tế phát hiện và trích dẫn, thay vì phải biết trước về sự tồn tại của nó.

---

### 4.6. Khối từ vựng chuẩn và đa ngữ Hán Nôm

---

#### `STD-14` — Ràng buộc từ vựng thật vào Getty AAT / TGN / ULAN và Iconclass

**Vì sao.** Mô hình dữ liệu có bảng `CONTROLLED_VOCABULARY` thiết kế **đúng** — có `source`, `source_id` (ví dụ `aat:300010331`), `label_vi`, `label_en`, `broader_id` để dựng cây (`docs/07-mo-hinh-du-lieu.md:207-213`). Nhưng trong `app/`:

- `app/src/data/taxonomy.ts` — **không một URI từ vựng nào**; toàn bộ là chuỗi tiếng Việt cứng (`taxonomy.ts:11-17,42-51`).
- Thẻ vẫn tự do: `'bia đá'`, `'rùa đá'`, `'chữ Hán Nôm'`, `'đồ thờ'`, `'điêu khắc'`, `'kiến trúc'`, `'ngoài trời'`, `'nội thất'` (`app/src/data/metadataFields.ts:63-72`).
- Giao diện **hứa điều chưa có**: "Danh sách từ vựng kiểm soát — ánh xạ Getty AAT (Art & Architecture Thesaurus)" (`app/src/i18n/vi.ts:115`).
- `Asset.loc` là chuỗi tự do (`app/src/services/types.ts:73`), breadcrumb suy ra bằng cách tách chuỗi them `' — '` (`app/src/data/digitization.ts:415-423`) — không phải cấu trúc địa danh.
- **Enum thiếu ULAN hoàn toàn** (`docs/07:209` chỉ có `GETTY_AAT|ICONCLASS|TGN|ISO_639|ISO_3166`).

Khoảng cách giữa lời hứa ở giao diện và hiện thực ở dữ liệu là **rủi ro trình diễn trực tiếp**: hội đồng bấm vào và hỏi "mã AAT của 'rùa đá' là gì" thì không có câu trả lời.

Tin tốt: **chỉ có 8 thẻ** — ánh xạ tay là việc của một buổi chiều.

**Lợi ích lâu dài.** Từ vựng chuẩn là thứ cho phép người không nói tiếng Việt tìm thấy hiện vật Văn Miếu. Getty AAT có nhãn đa ngữ; gắn được `aat:` nghĩa là một nhà nghiên cứu tra bằng tiếng Anh, Pháp, Đức vẫn ra kết quả. Đây là đòn bẩy lớn với chi phí rất nhỏ.

**Ai đang làm (uy tín).** **Getty Research Institute** công bố AAT, TGN, ULAN dưới dạng Linked Open Data dùng miễn phí. **Rijksmuseum** và **Victoria and Albert Museum** đều gắn từ vựng Getty vào bản ghi bộ sưu tập. **Yale LUX** dùng từ vựng chuẩn làm trục liên kết chính giữa các bộ sưu tập khác loại.

**Cost.** **5–8 người-ngày.** Gồm: ánh xạ 8 thẻ hiện có + các loại hình đối tượng sang `aat:` (~2 ngày); ánh xạ địa danh trong khuôn viên sang TGN, phần chưa có trong TGN thì lập từ vựng địa phương có cấu trúc (~2 ngày); bổ sung **ULAN vào enum** và thiết kế trục nhân danh (~1–2 ngày); gắn Iconclass cho chủ đề hình ảnh tiêu biểu (~1–2 ngày). **Hạ tầng: 0 USD/năm** (từ vựng Getty miễn phí).

**Ưu tiên.** **P0 · [Demo thầu]** — chi phí gần bằng không, hiệu quả trình diễn cao, và **sửa được một lời hứa hiện đang trống** ở giao diện.

**Rủi ro nếu KHÔNG làm.** Lộ điểm yếu ngay trong buổi demo nếu bị hỏi. Về dài hạn, thẻ tự do tích tụ biến thể (`'bia đá'` vs `'Bia đá'` vs `'bia'`) và sau vài nghìn bản ghi thì không làm sạch nổi. Với 82 bia UNESCO: không có từ vựng chuẩn thì bia Tiến sĩ **không xuất hiện** trong các tìm kiếm liên bảo tàng quốc tế về văn bia, khoa cử, hay bia đá Đông Á — dữ liệu tồn tại nhưng không ai tìm ra.

---

#### `STD-15` — Hạ tầng Hán Nôm: thẻ ngôn ngữ BCP 47, nhân danh VIAF/Wikidata, cam kết Unicode CJK

**Vì sao.** Ba vấn đề liên quan, nên làm cùng nhau.

*(a) Thẻ ngôn ngữ sai chuẩn.* `docs/07-mo-hinh-du-lieu.md:125` quy định `language` theo "**ISO 639-1**, mặc định `vi`". ISO 639-1 là bộ mã hai chữ cái và **không biểu diễn được Hán văn cổ** (mã `lzh` thuộc ISO 639-3). Chuẩn đúng là **IETF BCP 47**. Một tấm bia có **ba lớp văn bản cần ba thẻ khác nhau** — và ba trường **đã tồn tại**, được cưỡng chế đúng với song thẩm (`app/src/components/CoreMetadataForm.tsx:87-93,172-201`):

| Lớp | Thẻ BCP 47 | Trường hiện có |
|---|---|---|
| Nguyên văn Hán/Nôm | `lzh` hoặc `vi-Hani` | `originalText` (`CoreMetadataForm.tsx:172-179`) |
| Phiên âm Hán Việt | `vi-Latn` | `transliteration` (`CoreMetadataForm.tsx:180-186`) |
| Dịch nghĩa tiếng Việt | `vi` | `translation` (`CoreMetadataForm.tsx:187-194`) |

Không có thẻ ngôn ngữ, hệ thống bên ngoài **không biết `originalText` là chữ Hán hay chữ Nôm** — mà đó là phân biệt học thuật cốt lõi của ngành. Template CSV có cột "Văn tự gốc" với giá trị "Hán văn" (`data/06-metadata/template-tai-lieu-han-nom.csv`) — đúng ý niệm nhưng là nhãn tiếng Việt tự do.

*(b) Thiếu trục nhân danh — tài sản lớn nhất bị bỏ quên.* **82 bia khắc tên khoảng 1.300 tiến sĩ** qua gần ba thế kỷ, kèm khoa thi, quê quán, chức vụ. Đây là tài sản dữ liệu có giá trị nghiên cứu cao nhất trong kho, và **chính là lý do UNESCO ghi danh** — giá trị tư liệu về giáo dục khoa cử, không phải giá trị điêu khắc. Hiện mô hình dữ liệu **không có chỗ cho nó**: có trường cho người *thực hiện số hoá* (`Asset.owner`, `app/src/services/types.ts:75`) nhưng không có cho người *được khắc trên bia*.

*(c) Unicode CJK chưa có cam kết.* Chữ Nôm là một trong những hệ chữ có nhiều ký tự hiếm nhất trong Unicode; nhiều chữ nằm ngoài BMP (CJK Extension B trở lên) và **một số chữ Nôm vẫn chưa được mã hoá**. Hàm chuẩn hoá tìm kiếm hiện tại xử lý dấu tiếng Việt (`app/src/utils/search.ts:8-15`) nhưng **không có xử lý nào cho CJK**. Cần tuyên bố: hỗ trợ tới Extension nào, font nào, quy trình nào cho chữ ngoài bảng mã (mô tả IDS hoặc ảnh cắt kèm ghi chú).

**Lợi ích lâu dài.** Gắn tiến sĩ vào VIAF/Wikidata nối dữ liệu Văn Miếu vào **mạng tri thức toàn cầu**: một nhân vật có mặt trong Wikidata lập tức liên kết tới mọi công trình nghiên cứu, thư mục, và hồ sơ lưu trữ khác trên thế giới nhắc tới ông. Đây là bước biến kho số hoá thành **nguồn dữ liệu nghiên cứu**, không chỉ là kho ảnh.

**Ai đang làm (uy tín).** **VIAF** (do OCLC vận hành) hợp nhất hồ sơ nhân danh từ hàng chục thư viện quốc gia. **Academia Sinica (Đài Loan)** xây dựng cơ sở dữ liệu nhân danh lịch sử Trung Hoa quy mô lớn — tham chiếu gần nhất về phương pháp cho nhân danh Hán văn. **National Palace Museum (Đài Bắc)** và **National Diet Library (Nhật Bản)** đều xử lý bài toán chữ Hán hiếm trong hệ thống số hoá của họ. Cộng đồng **Wikidata** có sẵn hạ tầng cho nhân vật lịch sử Việt Nam và cho phép đóng góp ngược.

**Cost.** Chia ba phần:
- **Thẻ BCP 47: 2–3 người-ngày** — sửa mô hình dữ liệu, gắn thẻ vào ba trường, cập nhật tài liệu.
- **Cam kết Unicode CJK: 2–4 người-ngày** — tuyên bố phạm vi, chọn font, quy trình chữ chưa mã hoá.
- **Trục nhân danh: 15–30 người-ngày** cho hạ tầng dữ liệu (thực thể Person, ánh xạ VIAF/Wikidata, giao diện). **Việc nhập ~1.300 tiến sĩ là công việc chuyên môn Hán Nôm riêng**, ước tính **40–80 người-ngày chuyên gia** — nên tách thành một hạng mục/gói thầu độc lập, không gộp vào phần mềm.
- **Hạ tầng: 0 USD/năm** (VIAF và Wikidata miễn phí). Font Hán Nôm phủ CJK Ext: có bộ mã nguồn mở, **0 USD**.

**Ưu tiên.** **P0 · [Demo thầu]** cho thẻ BCP 47 (rẻ, nhanh). **P1 · [6 tháng]** cho cam kết Unicode. **P1 · [18 tháng]** cho hạ tầng nhân danh; phần nhập liệu chuyên gia là dự án riêng nhiều năm.

**Rủi ro nếu KHÔNG làm.** Không có thẻ ngôn ngữ thì công sức phiên âm/dịch không liên thông được — bên ngoài nhận về ba khối chữ không rõ khối nào là gì. Không xử lý CJK thì sẽ có chữ hiển thị thành ô vuông trong chính buổi demo. Nhưng rủi ro lớn nhất là (b): **không có trục nhân danh nghĩa là chính giá trị được UNESCO ghi danh không được số hoá.** Ký ức Thế giới ghi danh 82 bia vì chúng là **hồ sơ khoa cử** — tức là dữ liệu về con người. Số hoá hình khối đá mà bỏ dữ liệu con người là số hoá cái vỏ, giữ lại phần ít giá trị nhất về mặt tư liệu.

---

#### `STD-16` — Sửa lỗi tuân thủ EDTF trong bộ kiểm tra và tài liệu

**Vì sao.** Hàm kiểm tra (`app/src/components/CoreMetadataForm.tsx:39-42`):

```ts
const year = String.raw`\d{1,4}X{0,2}[?~]?`;
return new RegExp(`^(unknown|${year}|${year}/${year})$`, 'i').test(raw.trim());
```

Bốn vấn đề đối chiếu EDTF (Library of Congress; hợp nhất vào **ISO 8601-2:2019**):

1. **Chấp nhận từ khoá `unknown` — không còn thuộc chuẩn.** EDTF đã bỏ `unknown` và `open` cho đầu mút khoảng, thay bằng ký hiệu **hai chấm `..`** và đầu mút rỗng. Lỗi lan sang tài liệu (`docs/07-mo-hinh-du-lieu.md:119`) và chuỗi giao diện (`app/src/i18n/vi.ts:83-84`) — phải sửa cả ba nơi.
2. **Từ chối `1XXX`** (hợp lệ — chữ số chưa xác định). Regex chỉ cho tối đa hai chữ `X`, nên `18XX` qua nhưng `1XXX` bị chặn.
3. **Từ chối ngày đầy đủ `1928-06-15`** — EDTF Level 0 hợp lệ, dạng cơ bản nhất. Hệ quả nghiêm trọng: **ảnh tư liệu có ngày chụp chính xác không ghi được vào trường chuẩn hoá.** Kho có ảnh lịch sử ngày cụ thể (`app/src/data/metadataFields.ts:83`; `data/06-metadata/template-anh.csv` cột "Ngày/thời kỳ chụp") và media có "Ngày ghi hình" (`metadataFields.ts:30`).
4. **Thiếu `%`** (vừa không chắc vừa ước chừng) và chấp nhận năm 1–3 chữ số vốn không hợp lệ.

Kèm bất nhất về `eraCertainty`: code dùng 6 giá trị (`types.ts:72`, `CoreMetadataForm.tsx:15-17`), mô hình dữ liệu dùng 3 (`docs/07:121`).

**Cần ghi nhận:** thiết kế **hai lớp niên đại** — `era` giữ nguyên văn can chi/niên hiệu cho người đọc, `eraEdtf` chuẩn hoá cho máy (`types.ts:67-70`, `docs/adr/0006`) — là **đúng chuẩn quốc tế và nên giữ nguyên**. Vấn đề chỉ ở lớp kiểm tra.

**Lợi ích lâu dài.** EDTF hợp lệ cho phép lọc, sắp xếp, và dựng dòng thời gian chính xác kể cả với niên đại mơ hồ — đúng đặc thù di sản. Nó cũng là thứ Europeana và các cổng tổng hợp dùng để chuẩn hoá thời gian.

**Ai đang làm (uy tín).** **Library of Congress** duy trì EDTF. **Europeana** dùng EDTF để chuẩn hoá niên đại từ hàng nghìn nguồn khác nhau. Có sẵn thư viện kiểm tra mã nguồn mở cho nhiều ngôn ngữ, nên **không cần tự viết regex** — đây chính là gốc của lỗi hiện tại.

**Cost.** **2–4 người-ngày.** Gồm: thay regex tự viết bằng thư viện EDTF mã nguồn mở (~1 ngày); sửa chuỗi giao diện và tài liệu ở ba nơi (~1 ngày); thống nhất `eraCertainty` giữa code và mô hình dữ liệu (~1–2 ngày). **Hạ tầng: 0 USD/năm.**

**Ưu tiên.** **P0 · [Demo thầu]** — rẻ nhất trong toàn bộ danh sách, và sửa một lỗi **có thể bị phát hiện ngay trong buổi demo** nếu ai đó gõ thử một ngày đầy đủ.

**Rủi ro nếu KHÔNG làm.** Lỗi hiển nhiên nếu hội đồng thử nhập `1928-06-15` và bị báo không hợp lệ — mất uy tín cho toàn bộ tuyên bố về chuẩn. Về dữ liệu, cán bộ sẽ nhập niên đại vào trường hiển thị tự do thay vì trường chuẩn hoá, và sau vài nghìn bản ghi thì lớp chuẩn hoá coi như bỏ. Với 82 bia UNESCO: niên đại khoa thi là **trục tổ chức chính** của toàn bộ nhóm bia; niên đại không chuẩn hoá đúng thì không dựng được dòng thời gian khoa cử — một trong những cách trình bày có giá trị nhất của bộ tư liệu này.

---

### 4.7. Khối xuất bản quốc tế

---

#### `STD-17` — Dựng OAI-PMH thật và ánh xạ EDM cho Europeana

**Vì sao.** **Vấn đề trung thực hồ sơ trước:** danh mục dữ liệu mở liệt kê "Bản ghi OAI-PMH (Dublin Core)" với kênh công bố "**OAI-PMH /oai**" (`app/src/pages/CompliancePage.tsx:544`) và chứng cứ tuân thủ nhắc lại điều đó (`app/src/data/complianceEvidence.ts:190`) — **nhưng không có endpoint, không có schema, không có code.** Đang trưng ra một kênh chưa tồn tại như thể đang hoạt động. Việc này cần xử lý **ngay**, bằng một trong hai cách: dựng thật, hoặc gắn nhãn "kế hoạch" rõ ràng.

Tiếp đó là cơ hội: **EDM và Europeana không xuất hiện ở bất kỳ đâu** trong `app/` lẫn `docs/`. Europeana Publishing Framework có **content tier 1–4** và **metadata tier A–C**; rights phải là **URI** trong EDM (do đó STD-11 là điều kiện cần); tier 4 yêu cầu **CC BY, CC BY-SA, CC0 hoặc PDM**.

**Lợi ích lâu dài.** Đây là đường ra quốc tế **có sẵn hạ tầng, không cần đàm phán riêng**. Có OAI-PMH (hoặc IIIF Change Discovery, STD-10) là bất kỳ cổng tổng hợp nào cũng harvest được. EDM tier cao đưa 82 bia vào tầm nhìn của hàng triệu người dùng Europeana.

**Ai đang làm (uy tín).** **Europeana** tổng hợp dữ liệu từ hàng nghìn tổ chức di sản châu Âu qua EDM. **Deutsche Digitale Bibliothek** và các cổng quốc gia khác dùng cùng mô hình. OAI-PMH là giao thức harvest lâu đời nhất và vẫn phổ biến nhất trong thư viện; **IIIF Change Discovery 1.0** là thay thế hiện đại và nên cân nhắc làm cùng lúc.

**Cost.** **10–16 người-ngày.** Gồm: endpoint OAI-PMH với `oai_dc` bắt buộc (~5–7 ngày, **cần backend**); ánh xạ EDM và xác định tier mục tiêu (~4–6 ngày); tài liệu hoá cho bên harvest (~1–3 ngày). **Hạ tầng: ~300–1.000 USD/năm** cho phần dịch vụ chạy ghép trên hạ tầng sẵn có. *(Lưu ý: Văn Miếu không thuộc phạm vi địa lý Europeana; việc tham gia cần qua thoả thuận hợp tác hoặc một cổng tổng hợp trung gian — **cần kiểm chứng** điều kiện tham gia cụ thể với Europeana Foundation.)*

**Ưu tiên.** **P0 · [Demo thầu]** cho việc **sửa nhãn trung thực** (nửa ngày, bắt buộc). **P1 · [6 tháng]** cho endpoint OAI-PMH. **P2 · [18 tháng]** cho EDM/Europeana.

**Rủi ro nếu KHÔNG làm.** Rủi ro **trước mắt và nghiêm trọng nhất là về trung thực hồ sơ**: nếu hội đồng thử gọi `/oai` và không có gì, thiệt hại uy tín vượt xa lợi ích của việc liệt kê nó. Về dài hạn, dữ liệu không được phát hiện ngoài phạm vi quốc gia. Với 82 bia UNESCO: Ký ức Thế giới là chương trình **toàn cầu**; tư liệu được ghi danh mà không harvest được bởi bất kỳ cổng tổng hợp quốc tế nào là mâu thuẫn với chính mục tiêu ghi danh.

---

### 4.8. Khối chuẩn số hoá và chứng nhận

---

#### `STD-18` — Nêu rõ phiên bản FADGI/Metamorfoze và chuyển từ tuyên bố sang đo được

**Vì sao.** Tài liệu viện dẫn "chuẩn FADGI/Metamorfoze 4-star" (`docs/02-quy-trinh-bao-quan-sao-luu.md:130,255`) — đúng hướng nhưng có hai vấn đề:

1. **Không nêu ấn bản.** Phiên bản hiện hành là **FADGI Technical Guidelines for Digitizing Cultural Heritage Materials, ấn bản thứ ba, 5/2023** (thay ấn bản thứ hai 2016). Metamorfoze cũng cần nêu mức (Full / Light / Extra Light).
2. **Không có chỉ tiêu đo được.** Tiêu chí QC hiện chỉ có **dpi và độ sâu bit** ("TIFF ≥ 600dpi/16-bit", `docs/02:130`; "600dpi 16-bit grayscale" trong `data/06-metadata/template-anh.csv`). **Điều này không đủ để tuyên bố sao FADGI.** Hệ sao FADGI dựa trên các chỉ tiêu đo bằng thiết bị: độ phân giải thực đo (SFR/MTF), sai lệch màu, nhiễu, độ đồng đều chiếu sáng — đo qua **target/thẻ chuẩn chụp kèm**. Quy trình hiện không nhắc target nào.

Nói cách khác: đang **tuyên bố** 4 sao mà không có phương tiện **chứng minh** 4 sao.

**Lợi ích lâu dài.** Chỉ tiêu đo được biến QC từ đánh giá cảm tính thành nghiệm thu khách quan — đặc biệt quan trọng khi thuê ngoài số hoá, vì nó cho phép **từ chối nghiệm thu có căn cứ**. Nó cũng là điều kiện để so sánh chất lượng với các kho quốc tế.

**Ai đang làm (uy tín).** **FADGI** là sáng kiến liên cơ quan liên bang Hoa Kỳ do **Library of Congress** dẫn dắt; hướng dẫn miễn phí. **Metamorfoze** là chương trình bảo quản quốc gia Hà Lan (Koninklijke Bibliotheek + Nationaal Archief). Cả hai được dùng làm điều khoản hợp đồng số hoá trên toàn thế giới.

**Cost.** **4–8 người-ngày** cho phần tài liệu và quy trình (nêu ấn bản, xác định chỉ tiêu đo, viết quy trình chụp target và nghiệm thu). **Thiết bị: ~500–2.500 USD một lần** cho bộ target chuẩn và thẻ màu — *(mức giá tuỳ loại target, **cần kiểm chứng** báo giá thực tế)*. **Phần mềm phân tích: 0 USD** nếu dùng công cụ mã nguồn mở; bản thương mại có phí. **Hạ tầng định kỳ: ~0 USD/năm.**

**Ưu tiên.** **P1 · [6 tháng]** — phần nêu ấn bản làm được ngay trong demo (nửa ngày); phần đo đạc cần thiết bị và quy trình thật.

**Rủi ro nếu KHÔNG làm.** Tuyên bố "4-star" không chứng minh được là điểm dễ bị chất vấn. Về vận hành, không có chỉ tiêu đo thì **không từ chối nghiệm thu được** khi nhà thầu giao ảnh kém — chỉ còn tranh cãi cảm tính. Với 82 bia UNESCO: bia đá phong hoá liên tục, nên **mỗi lần chụp là một trạng thái không lặp lại được**; chụp không đạt chuẩn đo được nghĩa là mất vĩnh viễn cơ hội ghi lại trạng thái bề mặt năm đó với chất lượng cần thiết cho nghiên cứu so sánh về sau.

---

#### `STD-19` — Đặt CoreTrustSeal làm đích chứng nhận 18 tháng

**Vì sao.** Nền móng **tốt hơn dự án tự nhận**. Bảng tự đánh giá **NDSA Levels** đầy đủ 5 khía cạnh × mức hiện tại/mục tiêu/lộ trình (`docs/02-quy-trinh-bao-quan-sao-luu.md:308-318`) là **trung thực** — thừa nhận xuất phát điểm Level 1 ở cả 5 khía cạnh. Đây chính là loại bằng chứng CoreTrustSeal yêu cầu; phần lớn kho trượt vì **thiếu bằng chứng**, không phải vì thực hành kém.

Cộng thêm các mảnh đã có: quy chế có số hiệu và người ký (`app/src/data/complianceEvidence.ts:52-63`); **biên bản diễn tập khôi phục thảm hoạ có kết quả đối chiếu checksum** (`complianceEvidence.ts:82-95`); báo cáo kiểm toán định kỳ (`complianceEvidence.ts:97-110`); nhật ký bất biến hash-chain (`complianceEvidence.ts:146`); kỷ luật "không có chứng cứ thì không được ghi Đạt" (`docs/12-chat-luong-du-lieu.md:108`).

Yêu cầu hiện hành: **CoreTrustSeal Requirements V04.00, hiệu lực 1/1/2026–2028**, gồm **16 yêu cầu R01–R16** cộng phần bối cảnh R0 không tính điểm.

**Lợi ích lâu dài.** CoreTrustSeal là **chứng nhận kho tin cậy được công nhận quốc tế mà một tổ chức quy mô này thực sự đạt được**. Nó biến các tuyên bố trong hồ sơ thầu thành sự thật đã được bên thứ ba kiểm chứng, và là lợi thế cạnh tranh bền vững cho các gói thầu về sau.

**Ai đang làm (uy tín).** **CoreTrustSeal** do cộng đồng Research Data Alliance và World Data System phát triển, kế thừa Data Seal of Approval. **DANS (Hà Lan)** là một trong những tổ chức dẫn dắt. Hàng trăm kho lưu trữ trên thế giới đã được chứng nhận, gồm nhiều kho quy mô tương đương hoặc nhỏ hơn Trung tâm Văn Miếu.

**Cost.** **20–35 người-ngày** trải trong 18 tháng cho việc chuẩn bị hồ sơ tự đánh giá 16 yêu cầu, thu thập bằng chứng, và phản hồi bình duyệt. **Phí quản trị: €1.000 cho chu kỳ 3 năm** (~333 €/năm). Có **miễn giảm và chiết khấu theo số lượng** cho một số trường hợp. **Hạ tầng bổ sung: 0 USD/năm** — CoreTrustSeal đánh giá thực hành, không đòi công nghệ mới.

**Ưu tiên.** **P1 · [18 tháng]** — xem lộ trình chi tiết ở §5.

**Rủi ro nếu KHÔNG làm.** Không có rủi ro mất mát trực tiếp; đây là hạng mục **cơ hội**. Nhưng: các tuyên bố về bảo quản trong hồ sơ thầu mãi ở dạng tự khai. Với 82 bia UNESCO: Chương trình Ký ức Thế giới ngày càng quan tâm tới **điều kiện bảo quản dài hạn của bản số hoá**; một chứng nhận kho tin cậy được công nhận quốc tế là câu trả lời gọn gàng nhất cho câu hỏi "ai bảo đảm dữ liệu này còn sau 50 năm", và là thứ khó thay thế bằng lời cam kết.

---

#### `STD-20` — Sửa bất nhất hệ mã định danh giữa template CSV, placeholder và dữ liệu

**Vì sao.** Hệ mã hai tầng theo ADR 0004 (`app/src/services/types.ts:52-57`) **không được dùng nhất quán** — đây là lỗi rẻ nhưng làm suy yếu chính ADR mà dự án đang lấy làm điểm mạnh:

- **Template CSV dùng hệ mã cũ một tầng theo loại tệp:** `VM-3D-002` (`data/06-metadata/template-3d-mesh.csv`), `VM-IMG-010` (`template-anh.csv`), `VM-DOC-020` (`template-tai-lieu-han-nom.csv`), `VM-SP-012` (`template-splat.csv`), `VM-AUD-010` (`template-media.csv`).
- **Placeholder trong form cũng hệ cũ:** `VM-3D-018`, `VM-SP-011`, `VM-DOC-015`, `VM-VID-004` (`app/src/data/metadataFields.ts:6,14,22,29`).
- **Chứng cứ tuân thủ cũng hệ cũ:** `VM-3D-014` (`app/src/data/complianceEvidence.ts:144-145`).
- **Trong khi dữ liệu batch dùng hệ mới đúng:** `VM-HV-00013.M3D01`, `VM-KV-00004.SPL01` (`metadataFields.ts:80-85`).

Kèm theo, **quan hệ trong CSV cũng dùng bộ nhãn khác code** (`isRepresentationOf`, `depicts`, `describes` vs `depictedIn`, `mentionedIn`, `subjectOf`) — đã nêu ở STD-07, cần sửa cùng lượt.

**Lợi ích lâu dài.** Nhất quán định danh là điều kiện tiên quyết cho mọi thứ khác: nhập liệu hàng loạt, ánh xạ LIDO, cấp ARK. Sửa bây giờ khi kho còn nhỏ tốn vài ngày; sửa sau khi đã nhập hàng nghìn bản ghi tốn hàng tháng.

**Ai đang làm (uy tín).** Đây là vệ sinh dữ liệu cơ bản, không cần dẫn chứng tổ chức — nhưng đáng nói rằng **mọi hệ quản lý bộ sưu tập nghiêm túc (TMS, Axiell, CollectiveAccess) đều cưỡng chế một lược đồ định danh duy nhất** ở tầng nhập liệu, chính vì lý do này.

**Cost.** **2–3 người-ngày.** Gồm: cập nhật 5 template CSV (~1 ngày); sửa placeholder và chứng cứ mẫu (~0.5 ngày); thống nhất bộ nhãn quan hệ giữa CSV và code (~1 ngày, làm cùng STD-07). **Hạ tầng: 0 USD/năm.**

**Ưu tiên.** **P0 · [Demo thầu]** — rẻ, và **template CSV là tài liệu bàn giao cho cán bộ nhập liệu**, nên sai ở đây sẽ sinh ra dữ liệu sai ngay từ ngày đầu vận hành.

**Rủi ro nếu KHÔNG làm.** Hội đồng chấm thầu kỹ tính **sẽ** phát hiện — và nó làm suy yếu ADR 0004, vốn là một trong những quyết định thiết kế tốt nhất của dự án. Nghiêm trọng hơn về vận hành: cán bộ nhập liệu theo template sẽ tạo mã sai hệ ngay từ lô dữ liệu đầu tiên từ NAS, và lỗi đảo chiều quan hệ (`depicts` vs `depictedIn`) sẽ tạo ra mạng quan hệ ngược mà rất khó phát hiện sau hàng nghìn bản ghi. Với 82 bia UNESCO: mã định danh sai hệ ngay từ đầu nghĩa là phải đổi mã sau khi đã nhập — đúng điều mà nguyên tắc định danh bền vững (STD-12) tồn tại để ngăn chặn.

---

## 5. Lộ trình đạt chứng nhận CoreTrustSeal

### 5.1. Khuyến nghị: **CÓ, nên theo đuổi** — và khả thi hơn dự án tưởng

Đây là khuyến nghị có điều kiện, không phải mặc định. Lý do ủng hộ:

1. **Nền móng đã có và tốt hơn dự án tự nhận.** Bảng tự đánh giá NDSA đầy đủ 5 khía cạnh với mức hiện tại/mục tiêu/lộ trình (`docs/02-quy-trinh-bao-quan-sao-luu.md:308-318`) — và quan trọng là nó **trung thực**, thừa nhận xuất phát điểm Level 1 ở cả 5 khía cạnh. CoreTrustSeal đánh giá **bằng chứng và tính trung thực**, không đánh giá độ hào nhoáng. Phần lớn kho trượt vì không chứng minh được điều mình làm, chứ không phải vì làm kém.

2. **Nhiều bằng chứng CoreTrustSeal yêu cầu đã tồn tại sẵn.** Quy chế quản lý dữ liệu có số hiệu và người ký (`app/src/data/complianceEvidence.ts:52-63`); **biên bản diễn tập khôi phục thảm hoạ có đối chiếu checksum** (`complianceEvidence.ts:82-95`) — đây đúng là loại bằng chứng khó kiếm nhất; báo cáo kiểm toán định kỳ (`complianceEvidence.ts:97-110`); nhật ký bất biến hash-chain (`complianceEvidence.ts:146`); và kỷ luật "không có chứng cứ thì không ghi Đạt" (`docs/12-chat-luong-du-lieu.md:108`).

3. **Chi phí thấp bất thường so với giá trị.** Phí quản trị **€1.000 cho chu kỳ 3 năm** (~333 €/năm). Không đòi hạ tầng mới. Chi phí chủ yếu là **công viết hồ sơ**, mà phần lớn nội dung đã có sẵn trong 17 tài liệu hiện tại.

4. **Nó biến hồ sơ thầu từ tự khai thành đã kiểm chứng.** Đây là lợi thế cạnh tranh bền vững cho các gói thầu về sau, và là câu trả lời gọn cho câu hỏi "ai bảo đảm dữ liệu này còn sau 50 năm".

**Điều kiện tiên quyết cần nói thẳng:** CoreTrustSeal đánh giá một **kho đang vận hành thật**, không đánh giá một bản demo. Vì vậy lộ trình dưới đây **chỉ khởi động sau khi hệ thống đã lên production và có dữ liệu thật từ NAS**. Nêu CoreTrustSeal trong hồ sơ thầu như một **cam kết lộ trình** là hợp lý và có sức nặng; nêu như một thứ sắp có là không trung thực.

### 5.2. Bộ yêu cầu áp dụng

**CoreTrustSeal Requirements V04.00**, hiệu lực **1/1/2026 đến 2028** — tức là bộ yêu cầu áp dụng cho dự án này. Gồm **16 yêu cầu R01–R16**, tất cả bắt buộc và có trọng số ngang nhau, cộng phần bối cảnh **R0** không tính điểm. Chia ba nhóm (tổ chức; quản lý đối tượng số; hạ tầng và bảo mật).

Quy trình: **tự đánh giá có bằng chứng → bình duyệt đồng nghiệp → phản hồi → cấp chứng nhận, hiệu lực 3 năm.**

### 5.3. Lộ trình 18 tháng, ba giai đoạn

#### Giai đoạn 1 (tháng 1–6) — Lấp ba khoảng trống lớn nhất

Ba khoảng trống được xác định ở §3.7.2, xử lý theo thứ tự khó dần:

| Khoảng trống | Việc cần làm | Gắn với đề xuất |
|---|---|---|
| **Định danh bền vững & điều kiện tái sử dụng máy đọc được** | Cấp ARK, cam kết thể chế; rights dạng URI | **STD-12, STD-11** |
| **Tính bền vững tổ chức & kế hoạch kế thừa** | Văn bản trả lời: nếu Trung tâm ngừng vận hành hệ thống, dữ liệu chuyển về đâu? Cần **chỉ định kho kế thừa** (ứng viên tự nhiên: Cục Di sản văn hoá / Thư viện Quốc gia / một CSDL quốc gia về DSVH) và có văn bản ghi nhận | Mới — không có đề xuất STD tương ứng vì đây là việc **thể chế, không phải kỹ thuật** |
| **Sự tham gia của cộng đồng người dùng có ghi chép** | Hiện chỉ có bên tiếp nhận hành chính — LGSP, NDXP, Bộ VHTTDL (`complianceEvidence.ts:112-123`) — **không phải cộng đồng học thuật**. Cần bằng chứng tương tác thật với giới nghiên cứu Hán Nôm | Hỗ trợ bởi **STD-09, STD-17** (có IIIF và OAI-PMH thì mới có người dùng nghiên cứu để mà tương tác) |

**Đây là giai đoạn quyết định.** Khoảng trống thứ hai (kế thừa) là thứ nhiều kho **không vượt qua được**, và nó hoàn toàn nằm ngoài tầm kiểm soát của đội kỹ thuật — cần lãnh đạo Trung tâm làm việc với cơ quan chủ quản. **Nên khởi động ngay từ tháng 1**, vì thời gian chờ văn bản hành chính khó dự đoán.

#### Giai đoạn 2 (tháng 7–12) — Tích luỹ bằng chứng vận hành

CoreTrustSeal muốn thấy thực hành **đã chạy**, không phải quy trình trên giấy. Cần tích luỹ trong ít nhất 2–3 chu kỳ:

- **Lịch sử fixity liên tục** (**STD-04**) — đây là bằng chứng số một. Cần chuỗi kiểm tra định kỳ có kết quả ghi lại, không phải một lần chạy.
- **Nhật ký PREMIS Event thật** (**STD-03**) từ hoạt động vận hành thực.
- **Ít nhất một chu kỳ diễn tập khôi phục nữa** — mẫu đã có (`complianceEvidence.ts:82-95`), và biên bản đó còn tự nêu kiến nghị mở rộng diễn tập sang nhóm tài liệu Hán Nôm (`complianceEvidence.ts:93`); thực hiện đúng kiến nghị đó là bằng chứng rất tốt về vòng cải tiến khép kín.
- **Một chu kỳ kiểm toán dữ liệu** với phát hiện và biện pháp khắc phục có ghi chép — mẫu hiện tại đã có phần "đang rà soát" trung thực (`complianceEvidence.ts:108`), đúng tinh thần.
- **Rà soát định dạng lần đầu** theo cam kết 2 năm/lần (`docs/02:318`), kèm PUID nếu đã làm **STD-05**.

#### Giai đoạn 3 (tháng 13–18) — Viết hồ sơ và nộp

- Tháng 13–15: viết tự đánh giá 16 yêu cầu, mỗi yêu cầu trỏ tới bằng chứng cụ thể. **Tận dụng tối đa 17 tài liệu sẵn có** — phần lớn nội dung đã tồn tại, chỉ cần tổ chức lại theo khung R01–R16 và **dịch sang tiếng Anh**.
- Tháng 16: rà soát nội bộ, tốt nhất do người ngoài đội phát triển thực hiện.
- Tháng 17: nộp và trả phí €1.000.
- Tháng 18: phản hồi bình duyệt.

**Lưu ý về ngôn ngữ:** hồ sơ nộp bằng tiếng Anh. Toàn bộ 17 tài liệu hiện là tiếng Việt. Cần tính **thêm 5–8 người-ngày dịch thuật chuyên ngành** — không nên dùng dịch máy cho hồ sơ chứng nhận.

### 5.4. Tổng chi phí và các chứng nhận KHÔNG nên theo đuổi

**Tổng CoreTrustSeal:** **25–43 người-ngày** trải 18 tháng (20–35 cho hồ sơ theo STD-19, cộng 5–8 dịch thuật) + **€1.000 phí chu kỳ 3 năm**. Không cần hạ tầng bổ sung.

**KHÔNG khuyến nghị theo đuổi trong 18 tháng:**

- **ISO 16363:2025** (bản 2025 thay :2012) — hơn 100 tiêu chí, cần kiểm toán viên bên thứ ba được công nhận, rất ít kho trên thế giới đạt. Với một trung tâm đang xây hệ thống đầu tiên, đây là **phân bổ nguồn lực sai**. Thứ tự đúng: **NDSA (đã có) → CoreTrustSeal (18 tháng) → cân nhắc ISO 16363 sau 5 năm nếu có nhu cầu thật.**
- **nestor Seal / DIN 31644** (*năm ban hành cần kiểm chứng*) — chứng nhận trong hệ sinh thái Đức, tài liệu chủ yếu tiếng Đức, giá trị nhận diện thấp ngoài khu vực nói tiếng Đức. Không phù hợp.

---

## 6. Bảng tổng hợp xếp theo ROI

ROI ước lượng định tính theo ba yếu tố: **giá trị chuẩn hoá đạt được ÷ chi phí người-ngày**, có điều chỉnh theo **mức độ không thể đảo ngược** (việc càng khó sửa về sau thì ROI làm sớm càng cao).

### 6.1. Nhóm A — ROI rất cao, làm ngay trong demo thầu

Toàn bộ nhóm này **không cần backend**, tổng **20–34 người-ngày**, **0 USD/năm hạ tầng**.

| Mã | Đề xuất | Người-ngày | USD/năm | Ưu tiên | Vì sao ROI cao |
|---|---|---|---|---|---|
| **STD-16** | Sửa lỗi tuân thủ EDTF | 2–4 | 0 | P0 | Rẻ nhất toàn bộ; sửa lỗi **có thể lộ ngay trong buổi demo** nếu ai gõ thử ngày đầy đủ |
| **STD-20** | Sửa bất nhất hệ mã định danh | 2–3 | 0 | P0 | Template CSV là tài liệu bàn giao cho cán bộ nhập liệu — sai ở đây sinh dữ liệu sai từ ngày đầu |
| **STD-01** | Cập nhật OAIS :2025 + tách khái niệm AIP | 2–3 | 0 | P0 | Tín hiệu năng lực chuyên môn rẻ nhất có thể mua |
| **STD-08** | Sửa "Spectrum 5.0"→**5.1** + bảng 21 quy trình | 3–5 | 0 | P0 | Biến điểm yếu tiềm tàng thành tuyên bố phạm vi có chủ đích |
| **STD-11** | Rights URI + tách statement/license | 4–6 | 0 | P0 | **Điều kiện cần** cho STD-17; kèm quyết định chính sách CC BY-NC cần đưa lên lãnh đạo |
| **STD-14** | Ràng buộc từ vựng Getty/Iconclass thật | 5–8 | 0 | P0 | Chỉ 8 thẻ cần ánh xạ; **sửa một lời hứa hiện đang trống** ở giao diện (`i18n/vi.ts:115`) |
| **STD-15a** | Thẻ ngôn ngữ BCP 47 cho 3 lớp Hán Nôm | 2–3 | 0 | P0 | Ba trường đã tồn tại, chỉ thiếu thẻ |

### 6.2. Nhóm B — ROI cao, đầu tư có trọng lượng

| Mã | Đề xuất | Người-ngày | USD/năm | Ưu tiên · Phân kỳ | Ghi chú ROI |
|---|---|---|---|---|---|
| **STD-09a** | **IIIF manifest tĩnh + viewer** | 5–8 | 0 | **P0 · [Demo thầu]** | **ROI cao nhất toàn báo cáo.** Manifest là JSON tĩnh, không cần backend. Lấp lỗ hổng nghiêm trọng nhất bằng chi phí nhóm A |
| **STD-06** | Ánh xạ LIDO 1.1 + DC, bộ xuất XML | 8–12 | 0 | **P0 · [Demo thầu]** | Dữ liệu **đã gần đủ**; chỉ thiếu lớp ánh xạ. Xuất được LIDO XML hợp lệ là màn trình diễn rất thuyết phục |
| **STD-17a** | **Sửa nhãn trung thực kênh OAI-PMH** | 0.5 | 0 | **P0 · [Demo thầu]** | Nửa ngày, **bắt buộc** — đang trưng ra kênh chưa tồn tại (`CompliancePage.tsx:544`) |
| **STD-12** | ARK + cam kết thể chế | 6–10 | 200–800 | **P0 · [6 tháng]** | Quyết định **một chiều**: rẻ khi làm trước, không sửa được sau khi phát tán |
| **STD-04** | Fixity: thuật toán + lịch sử | 4–7 | 0 | P1 · [6 tháng] | Bằng chứng số một của CoreTrustSeal; `PREMIS_EVENT.FIXITY_CHECK` đã có sẵn, chỉ chưa nối |
| **STD-09b** | Máy chủ ảnh IIIF thật (Cantaloupe) | 12–20 | 1.000–3.000 | P1 · [6 tháng] | JPEG2000 đã chọn đúng từ đầu (`docs/02:256`) — chỉ thiếu lớp phục vụ |
| **STD-03** | PREMIS đủ 4 thực thể + ánh xạ LoC | 10–16 | 0 | P1 · [6 tháng] | Điều kiện để siêu dữ liệu bảo quản **di chuyển được** sang hệ thống kế tiếp |
| **STD-07a** | CRM property + sửa nhất quán quan hệ | 10–15 | 0 | P1 · [6 tháng] | Sửa lỗi **đảo chiều quan hệ** CSV↔code trước khi nhập hàng loạt |

### 6.3. Nhóm C — ROI trung bình, cần nền tảng trước

| Mã | Đề xuất | Người-ngày | USD/năm | Ưu tiên · Phân kỳ | Phụ thuộc |
|---|---|---|---|---|---|
| **STD-02** | SIP BagIt + METS structMap | 8–14 | 0 | P1 · [6 tháng] | Nền cho STD-09 (structMap → manifest) |
| **STD-18** | FADGI ấn bản 3 + chỉ tiêu đo được | 4–8 | ~0/năm (+500–2.500 thiết bị một lần) | P1 · [6 tháng] | Cần thiết bị target chuẩn |
| **STD-15b** | Cam kết Unicode CJK + font | 2–4 | 0 | P1 · [6 tháng] | — |
| **STD-17b** | Endpoint OAI-PMH thật | 10–16 | 300–1.000 | P1 · [6 tháng] | **Cần backend** |
| **STD-19** | Hồ sơ CoreTrustSeal | 25–43 | ~350 (€1.000/3 năm) | P1 · [18 tháng] | Cần production + dữ liệu thật + STD-04, STD-11, STD-12 |
| **STD-10** | IIIF Content Search + Auth + Discovery | 10–16 | 500–1.500 | P1 · [18 tháng] | **Phụ thuộc cứng STD-09** |
| **STD-15c** | Hạ tầng nhân danh VIAF/Wikidata | 15–30 | 0 | P1 · [18 tháng] | Nhập ~1.300 tiến sĩ là **dự án chuyên môn riêng, 40–80 người-ngày chuyên gia** |

### 6.4. Nhóm D — ROI thấp trước mắt, hoãn có chủ đích

| Mã | Đề xuất | Người-ngày | USD/năm | Ưu tiên | Lý do hoãn |
|---|---|---|---|---|---|
| **STD-05** | Significant properties + PRONOM | 6–10 | 0 | P2 · [18 tháng] | Trừ phần gắn PUID (rẻ, nên gộp vào STD-03). Phần 3D/3DGS là **đóng góp ngược cho ngành**, giá trị cao nhưng không cấp bách |
| **STD-07b** | Xuất Linked Art JSON-LD | 12–20 | 500–2.000 (nếu dựng triple store) | P2 · [18 tháng] | Chỉ đáng làm **sau khi** đã có property CRM |
| **STD-13** | DOI cho tập dữ liệu | 3–5 | 500–2.000 *(cần kiểm chứng)* | P2 · [18 tháng] | Cần ARK và dữ liệu ổn định trước |
| **STD-17c** | EDM / Europeana tier | (trong STD-17) | — | P2 · [18 tháng] | Văn Miếu ngoài phạm vi địa lý Europeana — **cần kiểm chứng** điều kiện tham gia |
| — | Traditional Knowledge Labels | — | — | **Không khuyến nghị 18 tháng đầu** | Nội dung chủ yếu là văn bản chính thống triều đình; xem lại nếu mở rộng sang nghi lễ/gia phả |
| — | ISO 16363 / nestor Seal | — | — | **Không khuyến nghị** | Phân bổ nguồn lực sai ở giai đoạn này — xem §5.4 |

### 6.5. Tổng hợp theo phân kỳ

| Phân kỳ | Các đề xuất | Tổng người-ngày | Hạ tầng USD/năm |
|---|---|---|---|
| **[Demo thầu]** — làm được trong mock | STD-01, 06, 08, 09a, 11, 14, 15a, 16, 17a, 20 | **34–53** | **0** |
| **[6 tháng]** — cần backend | STD-02, 03, 04, 07a, 09b, 12, 15b, 17b, 18 | **58–101** | **~1.500–4.800** |
| **[18 tháng]** — nền tảng đã ổn | STD-05, 07b, 10, 13, 15c, 19 | **71–124** (chưa kể 40–80 chuyên gia Hán Nôm) | **~1.850–5.850** |

**Kết luận về phân bổ nguồn lực:** khoảng **1/3 tổng khối lượng nằm ở nhóm [Demo thầu] với 0 USD hạ tầng** — và nhóm đó bao gồm cả hai hạng mục có ROI cao nhất (**STD-09a** IIIF manifest tĩnh và **STD-06** ánh xạ LIDO). Nói cách khác: **phần lớn khoảng cách so với chuẩn quốc tế có thể thu hẹp bằng công việc metadata và tài liệu, trước khi viết một dòng backend nào.** Đây là tin tốt nhất của toàn bộ báo cáo này.

---

## 7. Nguồn tham chiếu

Ghi rõ phiên bản và năm. Mục nào không xác minh được chắc chắn đều đánh dấu `(cần kiểm chứng)`.

### 7.1. Bảo quản dài hạn

| Chuẩn | Phiên bản / Năm | Cơ quan ban hành | Ghi chú |
|---|---|---|---|
| **OAIS — Reference Model for an Open Archival Information System** | **ISO 14721:2025** (ấn bản 3) = **CCSDS 650.0-M-3** (12/2024) | ISO / CCSDS | Thay thế ISO 14721:2012. Làm rõ quan hệ PDI ↔ Content Data Object |
| **Audit and certification of trustworthy digital repositories** | **ISO 16363:2025** | ISO / CCSDS | Thay thế ISO 16363:2012 |
| **PREMIS Data Dictionary for Preservation Metadata** | **Version 3.0**, công bố **10/6/2015** | Library of Congress (PREMIS Editorial Committee) | 4 thực thể: Object · Event · Agent · Rights. Có bản PREMIS 3 OWL Ontology |
| **METS** — Metadata Encoding and Transmission Standard | *(phiên bản hiện hành cần kiểm chứng)* | Library of Congress | Dùng cho structMap tài liệu nhiều phần |
| **MODS** — Metadata Object Description Schema | *(phiên bản hiện hành cần kiểm chứng)* | Library of Congress | Không dùng trong đề xuất — DC + LIDO đã đủ cho phạm vi này |
| **EAD** — Encoded Archival Description | *(phiên bản hiện hành cần kiểm chứng)* | Society of American Archivists / LoC | Chỉ cần nếu kho mở rộng sang phông lưu trữ có phân cấp |
| **BagIt File Packaging Format** | **RFC 8493** *(năm ban hành cần kiểm chứng)* | IETF (gốc từ Library of Congress) | Định dạng SIP đề xuất ở STD-02 |
| **PRONOM / DROID** | Cơ sở dữ liệu định dạng, cập nhật liên tục | The National Archives (UK) | Miễn phí; nguồn PUID cho STD-05 |
| **NDSA Levels of Digital Preservation** | **v2.0 (2019)** *(phiên bản dự án đang dùng cần kiểm chứng)* | National Digital Stewardship Alliance | Đã áp dụng tại `docs/02:308-318` |

### 7.2. Mô tả và ngữ nghĩa

| Chuẩn | Phiên bản / Năm | Cơ quan ban hành | Ghi chú |
|---|---|---|---|
| **CIDOC Conceptual Reference Model** | **ISO 21127:2023** = community version **7.1.3** | ISO / ICOM-CIDOC | Dự án hiện dùng ở mức khái niệm (E54), chưa dùng property |
| **LIDO — Lightweight Information Describing Objects** | **v1.1**, công bố **12/2021** (thay v1.0/11-2010) | ICOM-CIDOC LIDO Working Group | Có LIDO Primer làm tài liệu hướng dẫn |
| **Dublin Core** | **ISO 15836-1:2017** và **ISO 15836-2:2019**; DCMI Metadata Terms | ISO / DCMI | VN: **TCVN 7980-1:2024, TCVN 7980-2:2024** — đã dẫn tại `docs/thuat-ngu.md:111` |
| **CCO — Cataloging Cultural Objects** | **2006** | Visual Resources Association / ALA | Nguyên tắc Work ↔ Image |
| **Spectrum — UK Museum Collections Management Standard** | **5.1**, công bố **9/2022** (cập nhật một phần của 5.0/2017); **21 quy trình** | Collections Trust (UK) | **Dự án đang viện dẫn sai là "5.0"** — xem STD-08 |
| **EDTF — Extended Date/Time Format** | Hợp nhất vào **ISO 8601-2:2019**; Level 0/1/2 | Library of Congress / ISO | Từ khoá `unknown`/`open` **đã bị thay** bằng `..` và đầu mút rỗng |
| **Linked Art** | Mô hình LOUD trên CIDOC-CRM — *(phiên bản chính xác cần kiểm chứng)* | Cộng đồng Linked Art (Getty tham gia duy trì) | Nền của Yale LUX |
| **Europeana Data Model (EDM)** + **Europeana Publishing Framework** | Content tier **1–4**, metadata tier **A–C** | Europeana Foundation | Tier 4 yêu cầu **CC BY / CC BY-SA / CC0 / PDM**; rights phải là **URI** |

### 7.3. Truy cập và liên thông

| Chuẩn | Phiên bản / Năm | Cơ quan ban hành |
|---|---|---|
| **IIIF Image API** | **3.0**, công bố **4/6/2020** | IIIF Consortium |
| **IIIF Presentation API** | **3.0**, công bố **4/6/2020** | IIIF Consortium |
| **IIIF Content Search API** | **2.0**, công bố **2022** | IIIF Consortium |
| **IIIF Authorization Flow API** | **2.0**, công bố **10/7/2023** | IIIF Consortium |
| **IIIF Change Discovery API** | **1.0**, **2021** *(ngày chính xác cần kiểm chứng)* | IIIF Consortium |
| **OAI-PMH** | **2.0** *(năm ban hành cần kiểm chứng)* | Open Archives Initiative |

### 7.4. Quyền và định danh

| Chuẩn | Phiên bản / Năm | Cơ quan ban hành | Ghi chú |
|---|---|---|---|
| **RightsStatements.org** | **12 statement**, vocabulary **1.0** | DPLA + Europeana + Creative Commons + Kennisland | URI dạng `http://rightsstatements.org/vocab/InC-EDU/1.0/` |
| **Creative Commons** | **4.0** | Creative Commons | URI dạng `https://creativecommons.org/licenses/by/4.0/` |
| **ARK — Archival Resource Key** | *(phiên bản đặc tả hiện hành cần kiểm chứng)* | ARK Alliance (khởi xướng bởi California Digital Library) | **NAAN cấp miễn phí**. BnF dùng NAAN **12148** |
| **DOI** | **ISO 26324** *(năm ấn bản cần kiểm chứng)* | ISO / DOI Foundation; DataCite cho dữ liệu nghiên cứu | Phí thành viên **cần kiểm chứng** |
| **Handle System** | *(phiên bản cần kiểm chứng)* | DONA Foundation | Có phí thành viên — ARK phù hợp hơn với dự án này |
| **Traditional Knowledge Labels** | — | Local Contexts | Không khuyến nghị trong 18 tháng đầu |

### 7.5. Từ vựng, số hoá, đa ngữ

| Chuẩn | Phiên bản / Năm | Cơ quan ban hành | Ghi chú |
|---|---|---|---|
| **Getty AAT / TGN / ULAN** | Cập nhật liên tục; công bố dạng Linked Open Data | Getty Research Institute | Miễn phí. **ULAN hiện thiếu hoàn toàn** trong mô hình dữ liệu |
| **Iconclass** | *(phiên bản hiện hành cần kiểm chứng)* | Henri van de Waal Foundation / RKD | Có trong enum `docs/07:209` nhưng chưa gán thực tế |
| **VIAF** | Cập nhật liên tục | OCLC | Nhân danh hợp nhất từ nhiều thư viện quốc gia |
| **Wikidata** | Cập nhật liên tục | Wikimedia Foundation | Cho phép đóng góp ngược |
| **FADGI — Technical Guidelines for Digitizing Cultural Heritage Materials** | **Ấn bản thứ ba, 5/2023** (thay ấn bản 2/2016) | Federal Agencies Digital Guidelines Initiative (LoC dẫn dắt) | Hệ sao (star) vẫn được dùng trong ấn bản 3 |
| **Metamorfoze Preservation Imaging Guidelines** | *(ấn bản hiện hành cần kiểm chứng)*; ba mức Full / Light / Extra Light | Koninklijke Bibliotheek + Nationaal Archief (Hà Lan) | Dự án đang viện dẫn không nêu mức |
| **PDF/A** | **ISO 19005** — *(cần nêu rõ phần: -2b hay -3b)* | ISO | Đã dẫn đúng tại `docs/02:256` |
| **JPEG 2000** | **ISO/IEC 15444** | ISO/IEC | Đã dẫn đúng tại `docs/02:256` |
| **E57** | **ASTM E2807** | ASTM International | Đã dẫn đúng tại `docs/02:257` |
| **Unicode — CJK Unified Ideographs Extensions** | *(phiên bản Unicode mục tiêu cần dự án tự chọn và tuyên bố)* | Unicode Consortium | Chữ Nôm nhiều ký tự ngoài BMP; một số chưa được mã hoá |
| **BCP 47** — Tags for Identifying Languages | IETF Best Current Practice | IETF | Thay cho ISO 639-1 đang dùng tại `docs/07:125` |
| **ISO 639-3** | — | SIL International (cơ quan đăng ký) | Mã `lzh` cho Hán văn cổ |

### 7.6. Chứng nhận kho tin cậy

| Chương trình | Phiên bản / Năm | Cơ quan | Chi phí |
|---|---|---|---|
| **CoreTrustSeal** | **Requirements V04.00**, hiệu lực **1/1/2026–2028**; **16 yêu cầu R01–R16** + R0 không tính điểm | CoreTrustSeal (kế thừa Data Seal of Approval; RDA + World Data System) | **€1.000/chu kỳ 3 năm**; có miễn giảm và chiết khấu theo số lượng |
| **ISO 16363** | **:2025** | ISO / CCSDS | Cần kiểm toán viên bên thứ ba — **không khuyến nghị giai đoạn này** |
| **nestor Seal** | **DIN 31644** *(năm ban hành cần kiểm chứng)* | nestor (Đức) | **Không khuyến nghị** — giá trị nhận diện thấp ngoài khu vực nói tiếng Đức |

### 7.7. Tổ chức được dẫn làm tham chiếu thực hành

| Tổ chức | Thực hành được dẫn | Liên quan đề xuất |
|---|---|---|
| **Bibliothèque nationale de France / Gallica** | ARK NAAN **12148** (`ark:/12148/...`) tích hợp thẳng vào đường dẫn IIIF; hơn 7 triệu tài liệu, trên 100 triệu ảnh; METS + ALTO cho tài liệu nhiều trang | STD-02, STD-09, STD-12 |
| **Yale LUX: Yale Collections Discovery** | Ra mắt cuối **5/2023**; hơn **50 triệu bản ghi**, hơn 17 triệu hiện vật trên nền **CIDOC-CRM + Linked Art (LOUD)**; mã nguồn được chia sẻ mở | STD-07 |
| **Archivematica** (Artefactual Systems) | Tách rõ Transfer → SIP → AIP → DIP; BagIt làm định dạng AIP; PREMIS Event + Agent cho **từng công cụ và phiên bản** | STD-01, STD-02, STD-03, STD-04 |
| **Library of Congress** | Khai sinh BagIt; duy trì PREMIS, METS, EDTF; dẫn dắt FADGI | STD-02, STD-03, STD-16, STD-18 |
| **Rijksmuseum** | Công bố ảnh phân giải cao phạm vi công cộng; API mở; gắn từ vựng Getty | STD-11, STD-14 |
| **Smithsonian Open Access** | Ra mắt **2/2020**; công bố hàng triệu tư liệu theo **CC0**; tài liệu về bảo quản mô hình 3D | STD-05, STD-11 |
| **Europeana** | EDM + Publishing Framework; đồng sáng lập RightsStatements.org | STD-11, STD-17 |
| **The National Archives (UK)** | PRONOM + DROID (miễn phí) | STD-05 |
| **Collections Trust (UK)** | Duy trì Spectrum 5.1 | STD-08 |
| **Getty Research Institute** | AAT / TGN / ULAN dạng Linked Open Data, miễn phí | STD-14 |
| **National Diet Library (Nhật Bản)**, **National Palace Museum (Đài Bắc)** | Triển khai IIIF; xử lý chữ Hán hiếm trong hệ thống số hoá | STD-09, STD-15 |
| **Academia Sinica (Đài Loan)** | Cơ sở dữ liệu nhân danh lịch sử Trung Hoa quy mô lớn | STD-15 |
| **DANS (Hà Lan)** | Dẫn dắt CoreTrustSeal | STD-19 |
| **Cantaloupe**, **IIPImage** | Máy chủ ảnh IIIF mã nguồn mở, self-host | STD-09 |
| **APTrust**, **Chronopolis** | Công bố lịch sử fixity như báo cáo định kỳ cho đơn vị gửi dữ liệu | STD-04 |

### 7.8. Ghi chú về phương pháp và giới hạn

- Toàn bộ khẳng định về hiện trạng ứng dụng đều dẫn `đường/dẫn:dòng` tại thời điểm **12/08/2026**. Mã nguồn thay đổi sẽ làm lệch số dòng.
- Việc chấm mức **Chưa / Một phần / Đạt** dựa trên **bằng chứng kiểm chứng được trong mã nguồn và tài liệu**, không dựa trên ý định đã tuyên bố. Một chuẩn được nêu tên nhưng không thực thi được chấm **"Một phần"**, không phải "Đạt".
- Ước tính chi phí là **bậc độ lớn**, dùng để xếp ưu tiên, không phải để lập dự toán. Giả định đã nêu tại §4.0.
- Báo cáo **chỉ đọc**, không sửa bất kỳ tệp nào ngoài chính tệp này.
- Các chuẩn có phiên bản/năm không xác minh được chắc chắn đều đã đánh dấu `(cần kiểm chứng)` thay vì phỏng đoán.
