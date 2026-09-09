# 0009. Danh sách đối tượng lấy từ `PHYSICAL_OBJECTS`, không suy từ bản ghi số

## Bối cảnh

Nếu danh sách đối tượng di sản được suy ra bằng cách nhóm các bản ghi dữ liệu số (`ASSETS`) theo
`physicalArtifactId`, hệ thống sẽ **không bao giờ liệt kê được đối tượng có 0 bản ghi số** — vì
nhóm rỗng thì không có gì để nhóm. Đây chính là con số bắt buộc phải báo cáo theo **QĐ 2026/QĐ-TTg**
(tỷ lệ di tích quốc gia đặc biệt đã số hóa): tử số (đã số hóa) suy từ `ASSETS` được, nhưng mẫu số
(tổng số đối tượng, kể cả chưa số hóa) thì không thể suy ngược từ chính tập dữ liệu đang thiếu.

## Quyết định

Nguồn danh sách đối tượng di sản (màn Đối tượng, màn Hồ sơ đối tượng B9) **phải lấy từ
`PHYSICAL_OBJECTS`** (`app/src/data/assets.ts`), được dựng từ các seed đối tượng vật lý
(`data/objects/precincts.ts`, `structures.ts`, `artifacts.ts`, `documents.ts`, `av.ts`) — độc lập
với `ASSETS` (bản ghi dữ liệu số, chỉ sinh ra từ vòng lặp `obj.reps`). Mỗi dòng `PHYSICAL_OBJECTS`
có `repCount` (số bản đại diện số đã có, 0 nếu chưa số hóa) để phân biệt rõ đối tượng chưa số hóa
với đối tượng đã có dữ liệu số.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Đếm được chính xác đối tượng chưa số hóa (`repCount = 0`), đúng số liệu báo cáo tỷ
lệ số hóa theo QĐ 2026/QĐ-TTg — một chỉ số mà cách làm cũ (suy từ bản ghi số) không thể tạo ra
được về mặt cấu trúc, không phải chỉ là thiếu sót cài đặt.

**Tiêu cực:** Phải duy trì đồng bộ hai nguồn seed song song — danh sách đối tượng vật lý
(`objects/*`) và trình sinh bản ghi số (`assets/generator.ts`) — nếu thêm đối tượng mới mà quên
cập nhật đúng chỗ, hai nguồn có thể lệch nhau (tên/vị trí khác nhau giữa `PHYSICAL_OBJECTS` và
`ASSETS`).

**Rủi ro:** Nếu một trang mới lỡ suy danh sách đối tượng từ `ASSETS` thay vì `PHYSICAL_OBJECTS`
(như comment cảnh báo trong mã nguồn), bug "không đếm được cái chưa số hóa" tái diễn — cần rà
soát khi thêm màn hình mới liên quan tới đối tượng di sản.

## Phương án đã cân nhắc và lý do loại

- **Suy danh sách đối tượng từ `ASSETS`, nhóm theo `physicalArtifactId`**: loại — đây chính là
  cách làm sai đã bị phát hiện, không bao giờ liệt kê được đối tượng có 0 bản ghi số.
- **Duy trì hai danh sách độc lập, không cùng nguồn seed**: loại vì dễ lệch dữ liệu (tên/vị trí
  khác nhau giữa hai nơi) khi cập nhật một bên mà quên bên kia.
- **Chỉ liệt kê đối tượng đã số hóa, đếm "chưa số hóa" bằng phương pháp thủ công riêng (đối
  chiếu ngoài hệ thống)**: loại vì không tự động, dễ sai số ở quy mô ~150+ bản ghi và không thể
  audit lại được nguồn số liệu khi báo cáo.

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục 0ter (màn B9 — Hồ sơ đối tượng di sản)
- `app/src/data/assets.ts` (`PHYSICAL_OBJECTS`, `PhysicalObjectRow`, dòng 21–65)
- `app/src/pages/ObjectsPage.tsx` (dòng 23, 83, 129)
- `app/src/pages/ObjectDossierPage.tsx` (dòng 134–140)
