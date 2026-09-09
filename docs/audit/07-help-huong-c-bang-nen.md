# Hướng C — Bảng tra cứu nén, lọc nhiều chiều

> Phạm vi: trang `Trợ giúp & tra cứu` (`app/src/pages/HelpPage.tsx`, route `/help` tại `app/src/App.tsx:67`).
> ĐỀ XUẤT HƯỚNG — chưa sửa dòng mã nào trong `app/`. Mọi số đo do tôi tự mở `http://localhost:5173`
> đo trực tiếp trên DOM ở viewport 1440×900 (vùng cuộn nội dung thật `1151 × 785`), không phải ước lượng.

## 1. Tóm tắt hướng

Trang Trợ giúp không có vấn đề về khối lượng: **22 mục hiển thị** (15 pháp lý + 7 hướng dẫn — xem
`helpContent.ts:91`, `:426`; mục đính chính `WARNING_ENTRIES` tách riêng nên bộ đếm trên trang ghi đúng
"22 mục"). Vấn đề là **mật độ thông tin trên mỗi đơn vị chiều cao**. Đo được:

| Chỉ số (1440×900) | Trợ giúp hiện tại | Dữ liệu số hóa (`/assets`) |
|---|---|---|
| Chiều cao một hàng | 49–50 px (pitch 58 px kể cả khe) | 48 px |
| Số trường trên hàng đó | **1** (tiêu đề + huy hiệu điều khoản) | **7** (mã, tên, dạng, định dạng, dung lượng, trạng thái, cập nhật) |
| Mục thấy trong màn đầu | **7 / 22** | 10 / 10 của trang |
| Tổng chiều cao khi đóng hết | 2 074 px = **2,64 màn** | 785 px = **1,00 màn, không cuộn** |

Cùng một chi phí chiều cao (≈48 px), bảng của app chở gấp 7 lần thông tin so với thẻ accordion của trang
Trợ giúp. Hướng C lấy lại đúng khoảng chênh đó: thay danh sách accordion bằng **một bảng `<table>` nén
5 cột**, dùng lại `theme/tables.css` và đúng bố cục thanh lọc `/logs` đã dùng
(`pages/AuditLogPage.tsx:222-296`), mở rộng hàng tại chỗ
để đọc đủ 4 phần nội dung. Ba chiều lọc: **văn bản/chủ đề · chức danh xác nhận · có mốc thời hạn**,
cộng ô tìm sẵn có. Kết quả dự kiến: **13 mục/màn đầu** (từ 7), **toàn bộ 22 mục trong 1,46 màn**
(từ 2,64 màn) — tính toán ở mục 2.

Rủi ro lớn nhất của chính hướng này: bảng có cột thì rất dễ mọc ra cột "Trạng thái". Mục 4 nói rõ cách
chặn — tóm tắt: **ô mà mắt người quen nhìn thấy trạng thái sẽ bị chiếm chỗ bởi tên chức danh con người**,
và có một lint rule chặn `StatusPill` lọt vào file bảng này.

## 2. Chẩn đoán trang hiện tại

### 2.1 Những gì tôi thấy trên màn hình thật (mở `/help` ở 1440×900, cuộn về đầu trang)

- Nửa trên màn hình **không có mục nào**: đoạn dẫn 4 dòng (`HelpPage.tsx:74-79`) + khối cảnh báo cam
  3 gạch đầu dòng (`:81-90`) + ô tìm (`:92-104`) + hàng chip lọc (`:106-110`).
  Đo được: **335 px chrome trước mục đầu tiên = 43% màn đầu**.
- Nửa dưới: 7 thẻ trắng bo tròn, **giống hệt nhau** — chỉ khác chuỗi chữ. Khác biệt thị giác duy nhất
  là huy hiệu điều khoản (`.entryArticle`, `HelpPage.module.css:124`), mà nó dài ngắn tuỳ tiện: "Điều 12"
  (7 ký tự) cạnh "Điều 21 (Luật Dữ liệu) + NĐ 165 Điều 10" (37 ký tự). Ở 768 px, huy hiệu dài đó đẩy
  tiêu đề xuống dòng 2, thẻ cao 76 px thay vì 50 px — hàng mất luôn tính đều nhau.

### 2.2 Ba con số giải thích vì sao "phải cuộn nhiều"

**(a) Tiêu đề nhóm ăn 17,8% chiều cao trang.** 12 tiêu đề nhóm cho 22 mục; mỗi cái cao 16 px chữ nhưng
chiếm 32 px kể cả lề (`margin: 14px 2px 2px`). Tổng **370 px / 2 074 px = 17,8%** là dải phân cách thuần tuý.
Tệ hơn: **7 trong 12 nhóm chỉ có đúng 1 mục** — toàn bộ `HOWTO_ENTRIES` (`helpContent.ts:426-533`) có
`group` riêng cho từng entry ("Nhập dữ liệu", "Kiểm kê", "Phân quyền"…), tỷ lệ nhãn/nội dung 1:1.
Trong bảng, `group` là **một cột**, chi phí chiều cao bằng 0.

**(b) Mở một mục pháp lý đẩy trang thêm 465 px.** Đo `.entryBody` của mục "Kiểm soát chất lượng metadata":
**465 px ở 1440 px, 571 px ở 768 px** — 0,59 / 0,61 màn cho MỘT mục. Người so sánh hai mục cùng một văn
bản ("DPIA 60 ngày" và "Sự cố 72 giờ", cách nhau 1 hàng) mất hoàn toàn hàng kia ngay khi mở hàng này.

**(c) Bộ lọc hiện tại chỉ có 1 chiều.** `CATEGORY_FILTERS` (`HelpPage.tsx:26`) đúng 3 chip: Tất cả /
Pháp lý / Hướng dẫn. Chọn "Pháp lý" còn 15 mục — vẫn 2 màn. Ô tìm `matchesHelpQuery` (`helpContent.ts:66-72`)
rất tốt (bỏ dấu 2 chiều, có `keywords`, `soHieuVanBan`, `dieuKhoan`) nhưng chỉ dùng được khi người ta
**đã biết phải gõ gì** — cán bộ mở trang 1 lần/quý thì không thuộc số hiệu nghị định.

### 2.3 Mật độ sau khi thiết kế lại — tính toán, kèm giả định (chiều cao khả dụng 785 px)

| Thành phần | Hiện tại | Hướng C | Ghi chú |
|---|---|---|---|
| Đoạn dẫn triết lý | 100 px (4 dòng) | 56 px (2 dòng + liên kết "vì sao") | giữ nguyên câu "không phải bảng tự chấm" |
| Cảnh báo văn bản hết hiệu lực | 150 px | 64 px (1 dòng tóm + mở rộng) | vẫn nền cam, vẫn ghim trên cùng |
| Thanh lọc | 85 px (2 hàng) | 56 px (1 hàng, xuống 2 hàng < 900 px) | theo mẫu `AuditLogPage.module.css:22` |
| Đầu bảng `<thead>` | — | 34 px (dính, `sticky`) | |
| **Tổng chrome** | **335 px** | **≈ 220 px** | |
| Còn lại cho nội dung | 450 px | 565 px | |
| Chi phí một mục | 58 px (pitch thẻ) | 42 px (`padding: 9px 8px`, font 13,5) | dựa trên `tables.css:28` nới nhẹ |
| **Mục thấy trong màn đầu** | **7** | **13** | +86% |
| Tổng chiều cao 22 mục | 2 074 px = 2,64 màn | 220 + 22×42 = 1 144 px = **1,46 màn** | −45% |

Cộng hiệu ứng lọc nhiều chiều: lọc "chức danh = Giám đốc Trung tâm" còn ~10 mục → **trọn một màn, không
cuộn**; lọc "có mốc thời hạn" còn 5 mục → nửa màn. Nói cho công bằng: cải thiện **khoảng 1,8 lần**,
không phải 10 lần — ai hứa 10 lần trên 22 mục là đang nói dối.

## 3. Thiết kế bảng: cột nào, vì sao, cái gì bị loại

### 3.1 Năm cột (≥ 1200 px)

| # | Tiêu đề cột | Nguồn dữ liệu | Rộng | Vì sao có mặt |
|---|---|---|---|---|
| 1 | **VĂN BẢN** | `group` rút gọn (`vanBanNgan`) | 150 px, `nowrap` | Thay 12 dòng tiêu đề nhóm bằng 1 cột; sắp xếp được → dựng lại đúng thứ tự sổ đăng ký cũ |
| 2 | **ĐIỀU KHOẢN** | `entry.dieuKhoan` | 130 px, `.mono` | Thứ người ta trích vào công văn. Đang bị chôn trong huy hiệu co giãn; thành cột thì thẳng hàng, đọc dọc được |
| 3 | **VĂN BẢN YÊU CẦU GÌ** | `entry.title` | co giãn, clamp 2 dòng | Cột chính. Nhãn cột là câu hỏi, không phải danh từ đánh giá |
| 4 | **MỐC NÊU TRONG VĂN BẢN** | trích **nguyên văn** từ `yeuCau` | 150 px | 5/15 mục pháp lý có mốc: 72 giờ, 60 ngày, 2 ngày làm việc + 10–20 ngày, 31/12/2026, hằng năm — chiều lọc giá trị vận hành cao nhất |
| 5 | **AI XÁC NHẬN** | `vaiTroXacNhan[]` (chức danh rút gọn) | 190 px | Cột phòng thủ — xem mục 4 |

Hàng nhóm `huong-dan`: cột 1 = chủ đề ("Phân quyền"), cột 2 và 4 trống, cột 5 = **"Không phải yêu cầu
pháp lý"** (chữ mờ) — không để trống, để không ai đọc thành "thiếu người chịu trách nhiệm".

### 3.2 Cái gì bị loại — và loại có chủ đích

- **Loại: tiêu đề nhóm dạng dòng riêng.** Chuyển thành cột 1. Thu 370 px.
- **Loại: huy hiệu `.entryArticle` co giãn.** Thành cột `.mono` cố định — hết cảnh hàng 50 px cạnh hàng 76 px.
- **Loại: chip lọc `TagChip` 2 hàng.** Thành 1 hàng ô tìm + 2 `<select>` + 1 hộp kiểm như `/logs`:
  thu ~30 px mà thêm được 2 chiều lọc.
- **KHÔNG đụng vào: cấu trúc 4 phần** `yeuCau → heThongHoTro → donViTuLam → trachNhiemXacNhan`. Toàn bộ
  `LegalEntryBody` (`HelpPage.tsx:155-235`) bê nguyên vào hàng mở rộng, kể cả `.responsibleBox` và
  `.noteText`. Bảng chỉ là **công cụ tìm**; bản ghi vẫn là 4 phần văn bản.
- **KHÔNG đưa `WARNING_ENTRIES` thành hàng trong bảng.** Đính chính "2 văn bản đã hết hiệu lực" mà thành
  một hàng như mọi hàng khác thì mất hẳn trọng lượng. Giữ dải cam ghim trên cùng, chỉ nén lại.

### 3.3 Ba trường dữ liệu mới phải thêm — và luật để thêm cho an toàn

`HelpEntry` (`helpContent.ts:35-63`) chưa có gì để đổ vào cột 4 và cột 5. Cần thêm:

```ts
vaiTroXacNhan?: VaiTroId[];  // mã chức danh để LỌC; câu đầy đủ vẫn ở `trachNhiemXacNhan`
mocNeuTrongVanBan?: string;  // 'trong 72 giờ' — CHỈ trích nguyên văn từ chính câu `yeuCau`
vanBanNgan?: string;         // 'Luật DL 60/2024' — rút gọn tên `group`, không đổi nghĩa
```

Luật tự đặt để không vi phạm ADR-0014 (`helpContent.ts:13-17`):

1. `mocNeuTrongVanBan` **chỉ lấy từ `yeuCau`**. Mục vòng đời lưu trữ (`helpContent.ts:173`) có "định kỳ
   12 tháng/lần" nhưng nằm ở `donViTuLam` — kỳ hạn **đơn vị tự đặt**, không phải mốc luật định → cột 4
   để trống. Thà mất thông tin còn hơn gán nhầm nghĩa pháp lý.
2. `vaiTroXacNhan` là **chỉ mục để lọc**, không phải bản rút gọn có thẩm quyền — hàng mở rộng luôn hiện
   nguyên văn `trachNhiemXacNhan` với đủ chú thích "(thực hiện)" / "(phê duyệt)".
3. Cả ba trường phải qua một lượt rà của người phụ trách nội dung pháp lý trước khi lên bản thầu (mục 9).

## 4. Làm sao KHÔNG trượt thành ma trận "Đạt/Chưa đạt"

Nguy cơ ở đây **có thật và có tính hệ thống**: chính app này, ở `/logs`, đã có một bảng cấu trúc y hệt
cái tôi đang đề xuất — và cột cuối của nó là **"KẾT QUẢ" với `StatusPill` xanh/đỏ**
(`pages/AuditLogPage.tsx:326`). Đưa `/help` về dạng bảng là đặt nó cạnh một khuôn mẫu mà cột trạng thái
là mặc định. Sáu tháng nữa, một PR "cho đồng bộ với các bảng khác" là đủ để trang tự chấm sống lại.
Nên chống bằng thiết kế, không chống bằng lời hứa.

### Rào 1 — Chiếm chỗ: ô mà mắt tìm trạng thái phải là một CON NGƯỜI

Người đọc bảng quét cột phải cùng để tìm phán quyết. Ở đây cột phải cùng là **AI XÁC NHẬN** với giá trị
"Giám đốc Trung tâm", "CB chuyên trách ATTT", "CB nghiệp vụ bảo tàng".

Không phải mẹo trình bày, mà đúng luận điểm chủ đầu tư đã bác trang cũ để bảo vệ: chủ thể chịu trách
nhiệm là con người. Bảng nói câu đó **ở vị trí đắt nhất của bố cục**, trên mọi hàng, không cần mở ra
mới thấy — accordion hiện tại giấu nó sau một cú bấm. Phụ phẩm: bảng trả lời được câu hỏi accordion
không trả lời được — *"những việc nào Giám đốc phải ký?"* Lọc cột 5 → ~10 hàng.

### Rào 2 — Không cột nào được có thứ tự tốt/xấu

Quy tắc viết vào đầu file component: *mọi cột trong bảng Trợ giúp phải là **danh định** (nominal) hoặc
**văn bản**; cấm cột thứ tự (ordinal).* Kiểm tra từng cột: văn bản (danh định), điều khoản (định danh), tiêu đề (văn bản), mốc (thuộc tính của
*yêu cầu pháp luật*, không phải của bản ghi), chức danh (danh định). Không cột nào sắp được thành
"tốt → xấu", nên **không phép sắp xếp nào sinh ra bảng xếp hạng**.

Hệ quả: **cấm cột đếm.** Đã cân nhắc và loại "Số việc đơn vị phải tự làm: 3", "Hệ thống hỗ trợ: 2 màn".
Lý do cụ thể: mục `pl-dau-moi-bvdlcn` (`helpContent.ts:244`) có `heThongHoTro` là *"Hiện chưa có màn cấu
hình riêng… Sở Văn hóa & Thể thao chưa có văn bản hướng dẫn"* — cột đếm sẽ hiện **0**, và "0" cạnh "2",
"4" đọc thành *chưa đạt*, đúng cái mà `note` của mục đó phải viết hẳn một câu để cải chính: *"đang chờ
văn bản hướng dẫn — chưa có cơ sở để chỉ định, không phải 'chưa làm'"*. Con số nén mất sắc thái đó.

### Rào 3 — Cột "mốc" phải đọc thành QUY ĐỊNH, không thành ĐỒNG HỒ

Rủi ro: "72 giờ" trong một ô bảng trông như thời gian còn lại. Ba quy tắc dựng:

- Luôn kèm giới từ trích từ văn bản: **"trong 72 giờ"**, **"trước 31/12/2026"**, **"mỗi năm 1 lần"** —
  không bao giờ để trơ con số.
- **Không** đếm ngược, không "còn N ngày", không so với `Date.now()`. Trang này không có bản ghi nghiệp
  vụ nào để đếm; đồng hồ 60 ngày/72 giờ thật nằm ở bảng DPIA và bảng sự cố, là màn khác.
- Ô trống dùng chữ mờ **"văn bản không nêu mốc"**, không dùng "—" (dấu gạch đọc thành thiếu sót).

### Rào 4 — Không màu ngữ nghĩa, không biểu tượng phán quyết

Thân bảng dùng đúng **một họ màu**: chữ `--ink` trên nền trắng, chip cột 1 `--accent-text` trên
`--accent-soft`. Không xanh lá / đỏ / hổ phách, không ✓ ✗ ● ⚠ trong ô — chỉ có chevron mở/đóng. Khối
màu duy nhất trên trang vẫn là dải cam đính chính, và nó nói về **tình trạng hiệu lực của văn bản**,
không nói về đơn vị vận hành. Khác biệt này nên ghi thẳng vào comment đầu file.

### Rào 5 — `<caption>` nói thẳng bảng này không phải cái gì

```tsx
<caption className={styles.caption}>
  Mỗi dòng là một yêu cầu nêu trong văn bản pháp luật và chức danh chịu trách nhiệm xác nhận.
  Bảng này <strong>không ghi nhận tình trạng tuân thủ</strong> — hệ thống không tự đánh giá đạt / không đạt.
</caption>
```

`<caption>` là phần tử duy nhất được trình đọc màn hình đọc như **tên của bảng**: NVDA/VoiceOver đọc câu
cải chính này *trước* hàng đầu tiên. Một phần tử làm cả hai việc — tiếp cận và triết lý — và cũng là thứ
đập vào mắt đầu tiên khi ai đó mở diff định thêm cột trạng thái.

### Rào 6 — Chặn bằng máy, không bằng thiện chí

Thêm vào `eslint.config.js`:

```js
// eslint.config.js — chặn ngay tại tầng import
{ files: ['src/components/HelpLookupTable.tsx', 'src/pages/HelpPage.tsx'],
  rules: { 'no-restricted-imports': ['error', { paths: [
    { name: './StatusPill',   message: 'Bảng Trợ giúp không được có cột trạng thái — docs/audit/07 mục 4.' },
    { name: './statusColors', message: 'Bảng Trợ giúp không dùng màu ngữ nghĩa — docs/audit/07 mục 4.' },
  ]}]}}
```

```ts
it('bảng Trợ giúp không có cột trạng thái', () => {
  const h = HELP_TABLE_COLUMNS.map((c) => c.label.toLowerCase());
  for (const cam of ['trạng thái', 'tình trạng', 'kết quả', 'mức độ', 'đánh giá', 'đạt'])
    expect(h.some((x) => x.includes(cam))).toBe(false);
});
```

Chi phí ~0,25 người-ngày. Đổi lại, cái bẫy lớn nhất của hướng này trở thành lỗi CI đỏ, không còn phụ
thuộc trí nhớ người review.

## 5. Lọc & sắp xếp nhiều chiều

### 5.1 Thanh lọc — một hàng, theo đúng mẫu đã có ở `/logs`

```
[ Tìm theo tiêu đề, từ khóa, số hiệu…    ] [ Mọi văn bản / chủ đề ▾ ] [ Mọi chức danh ▾ ] [☐ Chỉ mục có mốc thời hạn]   22 mục  [Xóa lọc]
```

Bốn chiều, giao nhau bằng AND:

1. **Tìm chữ** — dùng lại `matchesHelpQuery` (`helpContent.ts:66`) nguyên vẹn, chỉ nối thêm
   `mocNeuTrongVanBan` vào haystack.
2. **Văn bản / chủ đề** — `<select>` có `<optgroup>`: "Văn bản pháp luật" (5 mục theo đúng
   `LEGAL_GROUP_ORDER`, `helpContent.ts:75`) và "Chủ đề thao tác" (7 mục). Thay hẳn 3 chip
   Tất cả/Pháp lý/Hướng dẫn — chọn một văn bản đã hàm ý category.
3. **Chức danh xác nhận** — `<select>` dựng từ `vaiTroXacNhan`. Nhãn *"Lọc theo chức danh có liên quan"*,
   không phải "người chịu trách nhiệm duy nhất" — nhiều mục có 2 chức danh, một thực hiện một phê duyệt.
4. **Có mốc thời hạn** — hộp kiểm, còn 5 mục.

Dùng `<select>` chứ không phải chip vì mỗi chiều 6–12 giá trị (chip sẽ thành 3 hàng, xoá sạch mật độ
vừa giành được), và app đã có `.select` sẵn (`AuditLogPage.module.css:42`). Bộ lọc đang bật hiện thành
chip nhỏ có nút ✕ ngay dưới thanh, kèm nút "Xóa lọc" theo mẫu `AuditLogPage.tsx:294-296`.

### 5.2 Sắp xếp

Bấm tiêu đề cột 1, 2, 5 để sắp; mặc định = **thứ tự sổ đăng ký cũ** (`groupOrderIndex`,
`HelpPage.tsx:37-43`), giữ nguyên hành vi hiện tại. Cột 1: thứ tự sổ đăng ký ↔ A→Z. Cột 2: số điều tăng
dần trong cùng văn bản. Cột 5: A→Z, gom việc theo người, dùng khi họp giao ban. Cột 3 và 4 **không sắp
xếp** — tiêu đề dài A→Z vô nghĩa, còn sắp theo mốc sẽ đẻ ra cảm giác "gấp → không gấp", đúng cái mục 4 cấm.

Trạng thái lọc/sắp đồng bộ vào URL (`?vb=…&cd=…&moc=1&sx=dieu`), cộng `?muc=pl-dpia` để mở sẵn một hàng.
Với hồ sơ thầu, đây là thứ có giá thật: **trích được đường dẫn tới đúng một mục pháp lý** trong công văn.

### 5.3 Không có gì trong danh sách

Thông báo rỗng phải nêu chiều nào đang chặn: *"Không có mục nào vừa thuộc Luật Di sản văn hóa vừa do
CB chuyên trách ATTT xác nhận. [Bỏ lọc chức danh]"* — gỡ đúng một chiều, không bắt xoá hết làm lại.

## 6. Đọc chi tiết: mở rộng hàng hay panel bên

**Chọn: mở rộng hàng tại chỗ, mỗi lần một hàng.**

```tsx
<Fragment key={e.id}>
  <tr className={open === e.id ? styles.rowOpen : undefined}>
    <td className="nowrap"><span className={styles.docChip}>{e.vanBanNgan}</span></td>
    <td className="nowrap mono">{e.dieuKhoan ?? ''}</td>
    <td><button type="button" className={styles.titleBtn}
                aria-expanded={open === e.id} aria-controls={`ct-${e.id}`}>{e.title}</button></td>
    <td className={e.mocNeuTrongVanBan ? 'nowrap' : 'faint'}>
      {e.mocNeuTrongVanBan ?? 'văn bản không nêu mốc'}</td>
    <td>{e.vaiTroXacNhan?.map(nhanVaiTro).join(' · ')}</td>
  </tr>
  {open === e.id && (
    <tr id={`ct-${e.id}`} className={styles.detailRow}><td colSpan={5}>
      <div role="region" aria-label={`Chi tiết: ${e.title}`}>
        {/* LegalEntryBody / HowToEntryBody — bê nguyên từ HelpPage.tsx:155 và :241 */}
      </div>
    </td></tr>
  )}
</Fragment>
```

**Vì sao không phải panel bên:**

1. **Không đủ chiều rộng.** Vùng nội dung 1 151 px; panel 420 px để lại 730 px cho 5 cột — cột tiêu đề
   tụt xuống ~220 px, gãy 3 dòng. Bảng mất đúng thứ vừa xây được.
2. **Mất ngữ cảnh hàng xóm.** Việc dùng thật hay gặp là đối chiếu hai mục cùng một văn bản (DPIA 60 ngày
   ↔ sự cố 72 giờ, cùng `LEGAL_GROUP_2`). Mở tại chỗ giữ hàng liền kề trong tầm mắt.
3. **Rủi ro tiếp cận cao hơn.** Panel cần quản lý tiêu điểm, Escape, trả tiêu điểm. Báo cáo `05` đã ghi
   `Modal` của app **không dùng portal** trái ADR-0013 và `ConfirmModal.tsx:34` thiếu `label` — thêm một
   mẫu overlay mới lúc này là mua thêm đúng loại lỗi đang có. Mở tại chỗ thì **tiêu điểm chưa từng rời
   nút bấm**, không có gì phải khôi phục.
4. **Nội dung là 465 px văn bản, không phải form.** Panel hợp với sửa/nhập; đây là đọc.

**Vì sao mỗi lần một hàng:** mở nhiều hàng cùng lúc → bảng cao 22×465 px, tức quay về đúng trang cũ mà
lại mất tiêu đề nhóm. Mở hàng mới thì hàng cũ đóng; hàng đang mở có viền trái đậm `--ink` để không lạc.

**Đổi lại — nói thẳng:** không so được hai chi tiết cạnh nhau. Giảm nhẹ bằng (a) `<thead>` dính nên luôn
biết đang ở cột nào, (b) `?muc=` mở 2 tab để so, (c) trên màn ≥1200 px, `Hệ thống hỗ trợ` và `Biểu mẫu
tham khảo` xếp 2 cột trong hàng mở rộng, kéo 465 px xuống ước ~330 px.

## 7. Màn hẹp — xử lý thật

Bảng luôn thua ở đây. Ba ngưỡng — ở ngưỡng thấp nhất tôi **bỏ bảng**, không cố cứu.

**≥ 1200 px — 5 cột đầy đủ.** `<thead>` dính: `position: sticky; top: 0` bám vùng cuộn `.content` (cùng
cơ chế ở `ObjectsPage.module.css:93`). Lưu ý thi công: đầu bảng nằm trong `GlassCard` nền
`rgba(255,255,255,0.34)` + `backdrop-filter` (`GlassCard.module.css:2-4`) — nền trong suốt sẽ để chữ
hàng dưới xuyên qua khi cuộn, nên đầu bảng dính **phải có nền đục**.

**900–1199 px — 4 cột.** Cột 1 (văn bản) rời hàng cột, nhập vào ô tiêu đề thành dòng phụ nhỏ. Giữ nguyên
cột 2–5; **cột 5 không bao giờ bị bỏ**, bỏ nó là bỏ luận điểm chính của trang.

**< 900 px — không còn là bảng.** `.table-scroll` (`tables.css:9`) là quy ước của app cho bảng dữ liệu,
nhưng ở đây nó **sai**: cuộn ngang đẩy cột "Ai xác nhận" ra khỏi màn hình — người dùng điện thoại vĩnh
viễn không thấy nó. Vậy:

```ts
const isWide = useMediaQuery('(min-width: 900px)');   // matchMedia + useSyncExternalStore
return isWide ? <HelpLookupTable … /> : <HelpCompactList … />;
```

`HelpCompactList` = thẻ 3 dòng, **cùng dữ liệu, cùng bộ lọc, cùng trạng thái URL**:

```
│ Lập hồ sơ đánh giá tác động (DPIA)…       ▾  │  tiêu đề, clamp 2 dòng
│ Điều 21 · Luật BVDLCN 91/2025 · trong 60 ngày│  3 dữ kiện, chữ 12px mờ
│ Xác nhận: CB bảo vệ DLCN · Giám đốc TT       │  chức danh
```

Trung thực về được/mất: đây **là** accordion trở lại. Nhưng mỗi thẻ chở **5 dữ kiện thay vì 1** và không
còn 12 dòng tiêu đề nhóm — ước ~92 px/thẻ ở 375 px so với 50–76 px mà chỉ có tiêu đề. Mật độ thông
tin/px vẫn hơn hiện tại, dù số mục thấy được ít hơn.

Thanh lọc < 900 px thu thành nút **"Bộ lọc (2)"** mở ra khối dọc (số = số chiều đang bật); ô tìm luôn
hiện. Chi phí thật của đoạn này: **hai đường render phải bảo trì** — tính ở mục 9, nêu lại ở mục 10.

## 8. Khả năng tiếp cận

Bảng + trình đọc màn hình là chỗ dễ sai nhất, và báo cáo `05` đã chỉ ra app **đang sai đúng kiểu đó**:
`AssetTable.tsx:30-42` gắn `role="button"` + `tabIndex` lên `<tr>`, phá ngữ nghĩa hàng bảng. Không lặp lại.

| Hạng mục | Cách làm | Vì sao |
|---|---|---|
| Ngữ nghĩa bảng | `<table>` thật, `<caption>` **hiện hữu** (không chỉ SR), `<th scope="col">` | `<caption>` là tên bảng cho SR — chở luôn câu cải chính "không ghi nhận tình trạng tuân thủ" |
| Sắp xếp | `<th aria-sort="ascending\|descending\|none">` bọc `<button>` bên trong | `aria-sort` là cách duy nhất SR thông báo hướng sắp; toàn app hiện **chưa dùng ở đâu** |
| Mở chi tiết | `<button aria-expanded aria-controls="ct-{id}">` **bên trong ô tiêu đề** | Không `role="button"` trên `<tr>`. Bấm cả hàng vẫn chạy như tiện ích chuột, nhưng phần tử có thể lấy tiêu điểm là nút |
| Hàng chi tiết | `<tr><td colSpan={5}><div role="region" aria-label="Chi tiết: {tiêu đề}">` | SR đọc thành một vùng có tên; `aria-controls` trỏ đúng `id` |
| Đếm kết quả | `<p aria-live="polite">Còn 5 mục</p>` | Hiện `.count` (`HelpPage.tsx:103`) đổi số **im lặng** — người mù lọc xong không biết còn bao nhiêu. Toàn app chưa có `aria-live` nào |
| Bàn phím | Tab: ô tìm → 2 select → hộp kiểm → nút sắp cột → nút tiêu đề từng hàng. Enter/Space mở, Escape đóng và **giữ tiêu điểm tại nút** | Không bẫy tiêu điểm vì không có overlay |
| Đầu bảng dính | `top: 0` + nền đục | Đầu bảng trong suốt che chữ = lỗi đọc, không chỉ lỗi thẩm mỹ |
| Nhãn cho `<select>` | `aria-label` như `AuditLogPage.tsx:231` | Đã có tiền lệ đúng trong app |
| Chạm | Nút tiêu đề cao tối thiểu 44 px ở < 900 px | Thẻ nén 92 px thoả sẵn |

**Tương phản — không làm tệ thêm chủ đề `crimson`.**
Báo cáo `05` (mục 3.9) đo cặp `ink #151312` trên `accent #7a1f22` = **1,81:1**, trượt WCAG AA.
Quy tắc cho bảng này: **không bề mặt nào dùng chữ `--ink` trên nền `--accent`.** Bảng chỉ dùng hai cặp:
chữ `--ink` trên nền trắng/`#f2f1e9` (an toàn ở cả 7 chủ đề), và chip cột 1 `--accent-text` trên
`--accent-soft`. Cặp thứ hai an toàn **theo cấu tạo**, không phải may mắn: `deriveVars`
(`ThemeContext.tsx:26-27`) đặt `accentSoft = mix(accent, #fff, 0.78)` và `accentText = mix(accent, #000, 0.58)`
— luôn là chữ rất tối trên nền rất nhạt, bất kể `accent` là màu gì; với `crimson` ra `#330d0e` trên
`#e2cece`, ước **≈10:1** (ước tính thủ công, cần hàm tương phản của `ARC-12` để chốt).

Nói cách khác: bảng **không thêm bề mặt mới nào có nguy cơ**, và chính vì bỏ hết màu ngữ nghĩa (rào 4)
mà nó tránh luôn nhóm lỗi "chỉ dùng màu để truyền đạt thông tin".

## 9. Chi phí thi công + rủi ro

| Hạng mục | Người-ngày |
|---|---|
| Bổ sung `vaiTroXacNhan` / `mocNeuTrongVanBan` / `vanBanNgan` cho 22 mục + **một lượt rà nội dung pháp lý** | 1,0 |
| `HelpLookupTable.tsx`: bảng, sắp xếp, mở rộng hàng, đầu bảng dính, `<caption>` | 1,5 |
| Thanh lọc 4 chiều + chip lọc đang bật + `aria-live` + trạng thái rỗng theo chiều | 0,75 |
| `HelpCompactList` < 900 px + `useMediaQuery` | 0,75 |
| CSS module (dùng lại `tables.css`, nới `padding` 9 px, dính, viền hàng mở) | 0,5 |
| Đồng bộ URL `?vb/cd/moc/sx/muc` + mở sẵn hàng theo neo | 0,5 |
| Rà tiếp cận: bàn phím, VoiceOver, `aria-sort`, 375/768/1440 | 0,5 |
| Lint rule + test chặn cột trạng thái | 0,25 |
| **Tổng** | **≈ 5,75 → dự trù 5,5–6,5** |

Không phát sinh hạ tầng, không thư viện mới (0 USD/năm).

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Rút gọn chức danh sai — sai ở đúng chỗ nhạy cảm nhất | **Cao** | Chip chỉ để lọc; hàng mở rộng luôn hiện nguyên văn; bắt buộc một lượt rà của người phụ trách nội dung pháp lý |
| Trôi ngược thành cột trạng thái sau vài sprint | **Cao** | Lint + test (rào 6), `<caption>` nằm ngay đầu diff, ghi chú ở đầu file |
| Đầu bảng dính trong `GlassCard` trong suốt → chữ chồng chữ | Trung bình | Nền đục cho `thead`; kiểm ở 3 viewport |
| Hai đường render (bảng / thẻ) lệch nhau khi sửa về sau | Trung bình | Chung `useHelpFilters()`; chung dữ liệu; test cùng bộ lọc cho ra cùng danh sách id |
| Chữ 13,5 px trong ô nén khó đọc với người lớn tuổi | Trung bình | Không xuống dưới 13,5 px; `line-height` 1,45; clamp 2 dòng chứ không 1 |
| `mocNeuTrongVanBan` bị người sau "bổ sung cho đủ" từ `donViTuLam` | Thấp–TB | Ghi luật trích dẫn ngay trên khai báo trường trong `helpContent.ts` |

## 10. Hướng này THUA ở đâu

Ba điểm yếu thật, không giấu.

**1. Hướng C tối ưu cho người ĐÃ biết mình tìm gì — mà phần lớn người dùng trang này thì không.**
Trang Trợ giúp không phải màn hình làm việc hằng ngày; cán bộ mở nó vài lần một quý, khi có đoàn kiểm tra
hoặc gặp tình huống lạ. Với người vào lần đầu, bảng 22 hàng × 5 cột chữ 13,5 px **khó tiếp cận hơn** danh
sách tiêu đề 14,5 px in đậm: tiêu đề bị clamp 2 dòng, mắt phải học bố cục cột trước khi đọc được nội dung.
Accordion hiện tại dở về mật độ nhưng **dễ vào** — mỗi hàng là một câu tiếng Việt hoàn chỉnh. Hướng C
thắng từ lần tra cứu thứ hai; thua ở lần đầu. Nếu chủ đầu tư đo bằng "người mới mở lần đầu có hiểu ngay
không", đây không phải hướng mạnh nhất.

**2. Cột 4 và cột 5 đòi dữ liệu diễn giải mới đặt lên nội dung pháp lý — đúng chỗ ADR-0014 dựng rào.**
Accordion hiện tại có một ưu thế phải thừa nhận: nó **không diễn giải gì cả**, luôn in nguyên văn câu
`trachNhiemXacNhan`. Hướng C bắt buộc nén *"Cán bộ chuyên trách nghiệp vụ số hóa (thực hiện rà soát);
Giám đốc Trung tâm (phê duyệt kết luận rà soát)"* thành hai chip `CB nghiệp vụ · Giám đốc TT`, làm mất
phần trong ngoặc — mất phân biệt **ai làm** với **ai ký**, đúng phân biệt mà cả trang này sinh ra để bảo
vệ. Giữ nguyên văn ở hàng mở rộng chỉ giảm nhẹ; người quét bảng mà không mở hàng vẫn đọc bản đã mất sắc
thái. Đây là **chi phí có thật của việc nén**, không phải chi tiết thi công.

**3. Dưới 900 px, toàn bộ luận điểm mật độ biến mất — và phải trả tiền cho hai đường render.**
Mục 7 nói thẳng: dưới 900 px hướng C thoái hoá thành danh sách thẻ, tức **lại là accordion**, chỉ dày dữ
liệu hơn. Nếu hội đồng chấm mở bản trình diễn trên iPad dựng đứng (768 px) hoặc điện thoại, thứ họ thấy
gần như không khác hiện trạng, trong khi dự án đã trả 0,75 người-ngày cho đường render thứ hai cộng rủi
ro hai nhánh lệch nhau về sau — với hướng dựa trên bố cục thẻ, con số đó bằng 0. **Hướng C mua mật độ
bằng tiền, và chỉ được hàng ở màn rộng.**

*(Ghi thêm, đã có biện pháp ở mục 4 nên không tính là điểm yếu thứ tư: bảng tự nó tạo động lực so sánh
hàng với hàng — chính động lực đã đẻ ra trang "Đạt ✓" cũ. Lint rule và `<caption>` chặn được biểu hiện
nhưng không dập được nhu cầu; sẽ còn người đề nghị thêm cột trạng thái, và phải nói không mỗi lần.)*

## 11. Tham chiếu

**Trong chính ứng dụng này** (mạnh nhất cho hồ sơ thầu — không phải mẫu ngoại nhập):

- `pages/AuditLogPage.tsx:222-296` — dải cảnh báo cam + thanh lọc một hàng (ô tìm + 2 `<select>` + hộp
  kiểm + nút xóa lọc) + `data-table` + phân trang. Hướng C là **đúng bố cục đó**, khác một điểm: cột cuối
  của `/logs` là "KẾT QUẢ" với `StatusPill` (`:326`), cột cuối của `/help` là "AI XÁC NHẬN" với chức danh
  con người — khác biệt đó là toàn bộ mục 4.
- `theme/tables.css` + `components/AssetTable.tsx` — quy ước `.data-table`, `.nowrap`, `.mono`, `.muted`
  dùng lại nguyên vẹn, không đẻ thêm hệ thống bảng thứ hai.

**Bên ngoài** (mô tả khái quát, nên kiểm chứng lại trước khi trích vào hồ sơ):

- **W3C — "How to Meet WCAG (Quick Reference)"**: danh mục tiêu chí thành công, lọc theo mức (A/AA/AAA)
  và theo công nghệ, mỗi dòng mở ra tài liệu "Understanding". Tương tự nhất về **thái độ**: một danh mục
  *yêu cầu* tra cứu được, cố ý **không** kèm chấm điểm đạt/không đạt cho tổ chức nào.
- **EUR-Lex** (cổng pháp luật EU) và **legislation.gov.uk**: kết quả tra cứu là bảng nén (số hiệu, ngày,
  loại văn bản) với bộ lọc theo loại, cơ quan ban hành, khoảng thời gian — đúng mô hình "văn bản pháp
  luật + lọc nhiều chiều" đang bàn.
- **GOV.UK Design System — mẫu Table**: khuyến nghị bảng cho dữ liệu so sánh được, kèm nguyên tắc *không
  dùng riêng màu sắc để truyền đạt thông tin* — chính nguyên tắc chống ma trận đỏ/xanh ở mục 4.
- **Cơ sở dữ liệu quốc gia về văn bản pháp luật (vbpl.vn)**: bảng kết quả gồm số hiệu, ngày ban hành,
  cơ quan, tình trạng hiệu lực. Đáng chú ý: cột "tình trạng" ở đó là trạng thái **của văn bản**, không
  phải của đơn vị áp dụng — đúng ranh giới dải cam đính chính của ta đang giữ, và là lý lẽ tốt để giải
  thích với hội đồng vì sao `/help` không có cột trạng thái.
