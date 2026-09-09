# 0007. Bảng đo lặp lại theo CIDOC-CRM E54/Spectrum 5.0 thay ô kích thước cố định

## Bối cảnh

Hồ sơ nguyên trạng mô tả kích thước hiện vật bằng vài ô cố định (cao/rộng/dày). Cách này không đủ
cho thực tế: mỗi loại vật có bộ chiều đo khác nhau (chuông đo đường kính miệng và độ dày thành,
bia đo riêng thân bia/trán bia/rùa đội bia); "cao 1,6 m" vô nghĩa nếu không biết đo bộ phận nào
(cả bệ hay không bệ); hiện vật cong vênh/sứt mẻ không có trị số duy nhất; và trị số suy ra từ mô
hình 3D cần phân biệt được với đo tay tại chỗ để biết mức độ tin cậy.

## Quyết định

Áp dụng **CIDOC-CRM E54 Dimension (ISO 21127)** và **Spectrum 5.0** (Collections Trust): kích
thước ghi thành **bảng đo lặp lại**, mỗi dòng gồm `dimensionType` (chiều đo: cao/rộng/dày/đường
kính/chu vi/khối lượng/diện tích/độ dày thành…), **`measuredPart`** (bộ phận đo — trường bắt
buộc, ví dụ thân bia/trán bia/rùa đội bia/cả bệ/không bệ/miệng chuông), `value`+`unit`,
`qualifier` (tính chất trị số: chính xác/xấp xỉ/tối đa/ước lượng), `method` (phương pháp đo:
thước dây/thước kẹp/máy quét 3D/trích từ bản vẽ), và `measuredBy`+`measuredAt`. Bộ chiều đo mặc
định gợi ý sẵn theo từng `objectClass`. Trị số suy ra từ mô hình 3D ghi `method = quét 3D` và
`derivedFrom` trỏ đúng bản ghi dữ liệu số đã dùng để đo.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Đo đúng bộ phận, đo lặp lại được nhiều lần theo thời gian (đối chiếu khi kiểm kê),
và đo suy từ mô hình 3D giảm rủi ro hư hại khi phải chạm vào hiện vật gốc — đây là điểm mạnh có
thể nêu trong thuyết minh kỹ thuật.

**Tiêu cực:** Mô hình dữ liệu và UI phức tạp hơn hẳn ô cố định — cần bảng riêng
(`physicalSpecs.ts`, `physicalSpecsData.ts`) và biểu mẫu nhập nhiều dòng
(`PhysicalSpecsForm.tsx`) thay vì vài ô đơn giản, tăng chi phí phát triển và thời gian nhập liệu
cho cán bộ hiện trường.

**Rủi ro:** Nếu không ràng buộc `measuredPart` là bắt buộc ở tầng validate, dữ liệu đo vẫn có thể
vô nghĩa (trị số không biết đo phần nào) — đúng vấn đề mà thiết kế này định giải quyết nhưng có
thể tái diễn nếu implement thiếu.

## Phương án đã cân nhắc và lý do loại

- **Giữ ô cố định cao/rộng/dày (hiện trạng)**: loại vì hiện vật cong vênh, bia có nhiều bộ phận
  không có "chiều cao" duy nhất — không mô tả đúng thực tế đo đạc hiện vật di sản.
- **Ô tự do dạng text cho "kích thước"**: loại vì không lọc/thống kê được, không phân biệt được
  phương pháp đo hay bộ phận đo, dữ liệu không nhất quán giữa các bản ghi.
- **Enum chiều đo cố định theo `objectClass`, không cho lặp lại**: loại vì không ghi được nhiều
  lần đo cùng một chiều (đo tay lẫn đo qua quét 3D, đo lại theo đợt kiểm kê khác nhau).

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục 0sexies
- `docs/07-mo-hinh-du-lieu.md` (mô hình `physical_artifact` — đặc điểm vật lý)
- `app/src/data/physicalSpecs.ts`, `app/src/data/physicalSpecsData.ts`
- `app/src/components/PhysicalSpecsForm.tsx`
