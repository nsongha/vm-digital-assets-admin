# 0008. Tách `hasPreservationSurrogate` khỏi `derivedFrom`

## Bối cảnh

`derivedFrom` (nhóm quan hệ cấu trúc, 0ter) mô tả một quan hệ kỹ thuật thuần túy: bản tối ưu web
nhẹ sinh ra từ bản gốc (master) để phục vụ truy cập nhanh — mất đi thì tái sinh lại được từ master
bất cứ lúc nào, không có nghĩa vụ bảo quản riêng. Nhưng công nghệ **gaussian splat (.splat/.ply)**
đặt ra một tình huống khác hẳn: `.splat` **chưa có chuẩn hóa ISO/OGC chính thức** (công nghệ 3D
Gaussian Splatting mới công bố năm 2023). Nếu công cụ đọc `.splat` hiện tại ngừng được hỗ trợ, bản
đám mây điểm PLY/E57 đi kèm là dữ liệu **duy nhất** còn phục hồi được nội dung. Gộp chung quan hệ
này với `derivedFrom` sẽ khiến hệ thống đối xử với nó như một bản có thể xóa/tái sinh tự do — sai
hoàn toàn về nghĩa vụ vận hành.

## Quyết định

Tách riêng quan hệ **`hasPreservationSurrogate`** (nhóm 1 — bản đại diện số của chính đối tượng,
0ter) khỏi `derivedFrom` (nhóm 3 — quan hệ cấu trúc kỹ thuật). Mọi tài sản `digitalForm=splat`
bắt buộc giữ kèm một bản dẫn xuất bảo hiểm PLY/E57, lưu ở tầng AIP, tham gia lịch kiểm tra toàn
vẹn (fixity) định kỳ như mọi bản gốc master khác, và **không bao giờ bị xóa** kể cả khi bản splat
gốc còn nguyên vẹn — khác hẳn bản tối ưu web (`derivedFrom`), vốn có thể xóa và tái sinh tự do bất
cứ lúc nào.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Minh bạch hóa rủi ro định dạng `.splat` ngay trong mô hình dữ liệu thay vì che giấu
nó dưới một quan hệ kỹ thuật chung chung — đây là điểm bán hàng đáng nêu trong thuyết minh (chính
sách "bản dẫn xuất bảo hiểm PLY/E57 + lưu ảnh nguồn + tham số huấn luyện" cho một công nghệ chưa
có chuẩn ISO).

**Tiêu cực:** Tăng dung lượng lưu trữ — mỗi tài sản splat giờ giữ thêm một bản PLY/E57 song song,
không phải chỉ một bản gốc duy nhất.

**Rủi ro:** Nếu quy trình thu nhận (ingest) quên tạo bản PLY/E57 kèm splat, tài sản đó mất khả
năng phục hồi khi công cụ đọc `.splat` ngừng được hỗ trợ trong tương lai — quy trình thu nhận
phải enforce việc này, không thể chỉ khuyến nghị.

## Phương án đã cân nhắc và lý do loại

- **Gộp chung vào `derivedFrom`, đánh dấu bằng cờ "immutable"**: loại vì phá vỡ ngữ nghĩa —
  `derivedFrom` vốn nghĩa là "xóa được, tái sinh tự do", gắn cờ ngoại lệ vào đó gây nhầm lẫn khi
  đọc quan hệ trong dữ liệu hoặc trong mã nguồn.
- **Không lưu bản PLY/E57 bảo hiểm, chấp nhận rủi ro `.splat`**: loại vì công nghệ Gaussian
  Splatting mới công bố 2023, chưa có chuẩn ISO, rủi ro lỗi thời cao — không chấp nhận được cho
  dữ liệu số hóa di sản cần lưu trữ dài hạn.
- **Chờ `.splat` có chuẩn ISO chính thức mới xử lý**: loại vì không có mốc thời gian xác định cho
  việc chuẩn hóa, trong khi rủi ro mất khả năng phục hồi dữ liệu là có thật ngay từ bây giờ.

## Liên kết

- `docs/07-mo-hinh-du-lieu.md` mục 5.11, 5.16
- `docs/02-quy-trinh-bao-quan-sao-luu.md` mục 7.2 (rủi ro định dạng chưa chuẩn hóa)
- `docs/00-ke-hoach-nang-cap.md` mục 5 (điểm bán hàng cho thuyết minh)
- `app/src/data/digitization.ts` (nhãn quan hệ `hasPreservationSurrogate`)
- `app/src/pages/ObjectDossierPage.tsx`, `app/src/pages/AssetDetailPage.tsx`
