# Thư mục dữ liệu thực tế — Văn Miếu Quốc Tử Giám

Nơi đặt dữ liệu số hóa thật copy từ NAS. App admin sẽ đọc/ingest từ đây.

## Cấu trúc

```
data/
├── 01-3d-mesh/            Scan 3D dạng lưới (GLB, OBJ, E57, PLY mesh)
│   ├── rua-bia/           82 mô hình rùa đội bia
│   ├── khue-van-cac/      Cổng Khuê Văn Các
│   └── khac/              Hiện vật 3D khác
├── 02-splat/              Gaussian splat (.ply, .splat)
│   ├── gieng-thien-quang/ Không gian giếng Thiên Quang
│   └── khac/
├── 03-tai-lieu-han-nom/   Sắc phong, bản dập, sách cổ (TIFF, PDF/A)
├── 04-anh-tu-lieu/        Ảnh tư liệu lịch sử (TIFF, JPEG)
├── 05-media/
│   ├── video/             Phim tư liệu (ProRes, MP4)
│   └── audio/             Thuyết minh (WAV, MP3)
├── 06-metadata/           Bảng metadata (điền theo template CSV có sẵn)
└── 99-du-lieu-tho/        Dữ liệu thô: ảnh nguồn photogrammetry, project file
                           (RealityCapture/Postshot...), dữ liệu chưa xử lý
```

## Quy ước đặt tên (khớp với mã tài sản trong app)

- Mỗi tài sản một thư mục con đặt theo **mã tài sản**: `VM-3D-001/`, `VM-SP-001/`, `VM-DOC-001/`…
  - `VM-3D-xxx` — scan 3D mesh · `VM-SP-xxx` — splat · `VM-DOC-xxx` — tài liệu
  - `VM-IMG-xxx` — ảnh · `VM-VID-xxx` — video · `VM-AUD-xxx` — audio
- Ví dụ rùa bia: `01-3d-mesh/rua-bia/VM-3D-002/` chứa `vm_3d_002_master.glb`,
  `vm_3d_002_web.glb` (nếu có bản tối ưu), `vm_3d_002_raw.e57`…
- **KHÔNG đổi tên file gốc từ NAS nếu ngại mất thời gian** — có thể copy nguyên trạng vào đúng
  thư mục con của tài sản; việc ghép file ↔ tài sản làm qua bảng metadata
  (cột "Tên tệp") giống luồng "Tải lên theo lô (Excel)" trong app.
- Chưa có mã tài sản? Cứ copy vào thư mục loại tương ứng, đặt tên thư mục con
  theo tên hiện vật không dấu (vd. `rua-bia-so-05/`) — sẽ gán mã sau khi ingest.

## Bảng metadata (06-metadata/)

5 template CSV (UTF-8, mở được bằng Excel), mỗi loại tài sản một file — cột theo
chuẩn Dublin Core + LIDO/CIDOC-CRM + PREMIS (xem chú thích trong từng file):

- `template-3d-mesh.csv` · `template-splat.csv` · `template-tai-lieu-han-nom.csv`
- `template-anh.csv` · `template-media.csv`

Cột có dấu `*` là bắt buộc. Mỗi dòng = 1 tài sản. Điền được đến đâu tốt đến đó —
thiếu thì app sẽ báo khi ingest, không chặn copy.

## Checklist ngày copy

1. Copy dữ liệu vào đúng thư mục loại (ưu tiên bản master/gốc trước, bản dẫn xuất sau)
2. Dữ liệu thô (ảnh nguồn, project file) → `99-du-lieu-tho/` (đừng trộn vào thư mục tài sản)
3. Điền metadata vào CSV trong `06-metadata/` (copy template ra file mới, vd. `rua-bia.csv`)
4. Không xóa/sửa file sau khi copy — mọi chỉnh sửa làm trong app để giữ nguyên tắc bản gốc bất biến
