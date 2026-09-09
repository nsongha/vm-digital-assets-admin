# 0014. Chỉ trích dẫn văn bản pháp lý đã xác minh nguyên văn

## Bối cảnh

Rà soát ban đầu phát hiện thiết kế cũ (v3.html) dùng thuật ngữ phái sinh từ **NĐ 47/2020/NĐ-CP**
("Chia sẻ mặc định", "Theo yêu cầu đặc thù") — nghị định này **đã bị bãi bỏ** bởi Điều 23 NĐ
278/2025/NĐ-CP (22/10/2025). Tương tự, **NĐ 13/2023/NĐ-CP** hết hiệu lực **01/01/2026**, thay bằng
Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 + NĐ 356/2025. Một hồ sơ thầu về lĩnh vực pháp lý-di
sản-dữ liệu trích dẫn nhầm văn bản đã hết hiệu lực là lỗi nghiêm trọng, dễ bị hội đồng chấm thầu
(thường có chuyên gia pháp lý) bắt ngay và ảnh hưởng tới uy tín toàn bộ hồ sơ, không chỉ riêng
phần trích dẫn sai.

## Quyết định

Mọi trích dẫn văn bản pháp lý trong `docs/` và trong UI chỉ dùng văn bản đã **đọc trực tiếp nguyên
văn** từ Công báo/văn bản gốc, hoặc đối chiếu **≥ 2 nguồn độc lập**, gắn nhãn **[ĐÃ XÁC MINH]**.
Mục chưa xác minh được gắn cờ ⚠️/[CHƯA CHẮC]/[KHÔNG XÁC MINH ĐƯỢC] và **không đưa vào** ma trận
truy vết (`docs/03`) hay bản thuyết minh chính thức — giữ lại ở mục "Còn mở" để xác minh sau, chứ
không âm thầm bỏ qua hay đoán liều. Cấm rõ ràng, không dùng làm căn cứ trong bất kỳ tài liệu nào:
**NĐ 47/2020/NĐ-CP** (đã bị bãi bỏ) và **NĐ 13/2023/NĐ-CP** (hết hiệu lực 01/01/2026).

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Loại bỏ rủi ro trích dẫn sai/hết hiệu lực — loại lỗi thường mất điểm nặng và mất uy
tín toàn bộ hồ sơ khi hội đồng có chuyên gia pháp lý rà soát.

**Tiêu cực:** Một số phần thuyết minh phải để ngỏ (mục "Còn mở" của `00-ke-hoach-nang-cap.md`) vì
chưa xác minh được, khiến hồ sơ trông chưa hoàn chỉnh 100% ở vài chỗ thay vì trích dẫn đầy đủ cho
"chắc ăn".

**Rủi ro:** Khung pháp lý quanh mốc 2025–2026 thay đổi liên tục (nhiều luật/nghị định có hiệu lực
01/01/2026, 01/7/2026, 31/12/2026); trạng thái "đã xác minh" tại thời điểm viết tài liệu có thể
lỗi thời vào thời điểm nộp hồ sơ hoặc nghiệm thu — cần rà soát lại gần các mốc đó.

## Phương án đã cân nhắc và lý do loại

- **Giữ nguyên thuật ngữ/trích dẫn cũ trong thiết kế gốc, không rà soát lại**: loại vì đã phát
  hiện trực tiếp NĐ 47/2020 bị bãi bỏ — giữ nguyên là trích dẫn sai sự thật ngay từ bây giờ.
- **Trích dẫn mọi văn bản có thể liên quan kể cả chưa xác minh, ghi chú "cần kiểm tra thêm" chung
  chung**: loại vì không phân biệt rõ mức độ tin cậy giữa các trích dẫn, hội đồng khó biết văn
  bản nào dùng được ngay và văn bản nào còn rủi ro.
- **Không trích dẫn số hiệu văn bản cụ thể, chỉ nói chung chung "theo quy định pháp luật hiện
  hành"**: loại vì hồ sơ thầu về lĩnh vực pháp lý-di sản-dữ liệu cần độ chính xác cao, nói chung
  chung làm giảm sức thuyết phục so với đối thủ có trích dẫn cụ thể và đã xác minh.

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục 0 (điểm 1), mục 6 ("Còn mở")
- `docs/03-ma-tran-truy-vet.md` (ghi chú đọc bảng, điểm 3 — quy ước [ĐÃ XÁC MINH])
- `docs/01-thuyet-minh-ky-thuat.md` chương 1 (căn cứ pháp lý và tiêu chuẩn áp dụng)
