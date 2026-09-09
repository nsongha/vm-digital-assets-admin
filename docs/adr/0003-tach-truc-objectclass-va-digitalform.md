# 0003. Tách hai trục phân loại `objectClass` × `digitalForm` thay cho một trường `type`

## Bối cảnh

Thiết kế cũ dùng một trường `type` duy nhất trộn lẫn hai khái niệm khác nhau: `3D`/`Splat` là
**dạng dữ liệu số** được tạo ra, còn `Tài liệu`/`Ảnh` là **loại đối tượng di sản** thật. Trộn lẫn
khiến hệ thống không trả lời được câu hỏi nghiệp vụ cơ bản: *"một công trình có mấy dạng dữ liệu
số?"* — Khuê Văn Các vừa có mesh 3D, vừa có gaussian splat, vừa có đám mây điểm, vừa có bản vẽ,
vừa có ảnh tư liệu, không thể gán một `type` duy nhất mà không mất thông tin.

Theo **CIDOC-CRM (ISO 21127)**, đối tượng vật lý (E22 Man-Made Object) khác hẳn với bản đại diện
số của nó (quan hệ P138 has representation) — đây là cơ sở lý luận chuẩn quốc tế cho việc tách
bảng, không phải chỉ là chọn tùy ý.

## Quyết định

Tách hai trục độc lập: **`objectClass`** (5 giá trị: `precinct`, `structure`, `artifact`,
`document`, `av` — đối tượng di sản có thật) và **`digitalForm`** (8 giá trị: `mesh3d`, `splat`,
`pointcloud`, `drawing`, `image`, `text`, `video`, `audio` — sản phẩm số hóa tạo ra). Một đối
tượng di sản (`physical_artifact`/`PHYSICAL_OBJECTS`) có thể có nhiều bản ghi dữ liệu số ở nhiều
`digitalForm` khác nhau, liên kết qua `physicalArtifactId`. Ở UI, bộ lọc màn Dữ liệu số hóa tách
thành 2 hàng chip (Loại đối tượng / Dạng dữ liệu) thay vì một hàng trộn lẫn.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Trả lời được câu hỏi nghiệp vụ "đối tượng này có mấy dạng dữ liệu" bằng một truy
vấn lọc theo `physicalArtifactId`, thay vì suy luận qua tên/từ khóa. Đúng mô hình CIDOC-CRM, khớp
trực tiếp với IA của wireframe hồ sơ thầu (UC-01/UC-02: "Không gian 3D", "Dữ liệu kỹ thuật công
trình", "Nội dung di sản").

**Tiêu cực:** Cần thêm bảng/thực thể trung gian (`physical_artifact`) neo hai trục lại với nhau,
tăng độ phức tạp mô hình dữ liệu so với một trường `type` phẳng. UI lọc cần thiết kế lại thành
hai hàng chip, người dùng quen giao diện cũ cần làm quen lại.

**Rủi ro:** Nếu một màn hình mới chỉ implement lọc theo một trục mà quên trục còn lại, quay lại
đúng hạn chế mà thiết kế này định giải quyết. Dữ liệu nhập liệu sai trục (gán nhầm `objectClass`
vào ô `digitalForm`) khó phát hiện nếu không có validate rõ ràng ở form.

## Phương án đã cân nhắc và lý do loại

- **Giữ một trường `type` gộp (thiết kế cũ)**: loại vì không trả lời được câu hỏi nghiệp vụ nêu
  trên, và không đúng mô hình CIDOC-CRM — đây chính là vấn đề bị phát hiện dẫn tới quyết định này.
- **Thêm tag tự do thay vì trục thứ hai có kiểm soát (controlled vocabulary)**: loại vì mất khả
  năng lọc/thống kê chuẩn hóa — tag tự do không đảm bảo tính nhất quán khi nhiều người nhập liệu.
- **Mô hình hóa `objectClass` như subtype/cha của `digitalForm`**: loại vì một đối tượng vật lý
  có nhiều dạng dữ liệu số đồng thời — đây là quan hệ một-nhiều giữa hai trục độc lập, không phải
  quan hệ cha-con lồng nhau.

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục 0bis
- `docs/07-mo-hinh-du-lieu.md` mục 2.1–2.3, 5.2 (CIDOC-CRM E22/P138)
- `app/src/services/types.ts` (`ObjectClass`, `DigitalForm`)
- `app/src/data/taxonomy.ts` (nhãn và mã hai trục)
