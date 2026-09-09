# Hướng A — Hai cột master–detail

> Đề xuất bố cục lại trang `/help` ("Trợ giúp & tra cứu"). Giai đoạn CHỌN HƯỚNG — chưa thi công, chưa sửa file nào trong `app/`.
> Đã đọc: `app/src/pages/HelpPage.tsx`, `app/src/pages/HelpPage.module.css`, `app/src/data/helpContent.ts`, `app/src/theme/*`, `app/src/App.tsx:67`.
> Đã xem trang thật ở `http://localhost:5173/help` (desktop 1280×720 và 768×1024), số đo trong §2 lấy từ DOM của bản đang chạy.

## 1. Tóm tắt hướng

Thay danh sách accordion 22 hàng bằng **mục lục cố định bên trái + một mục nội dung bên phải**, mỗi mục có URL riêng (`/help/pl-su-co-72h`).

- **Giải quyết**: hết cuộn 3,5 màn để tìm một mục; hết cảnh "mọi hàng trông giống hệt nhau" vì cấu trúc văn bản pháp lý (5 nhóm) trở thành xương sống điều hướng luôn nhìn thấy; hết chuyện mở một mục làm đẩy toàn bộ mục dưới xuống; và lần đầu tiên một mục pháp lý có thể **dán link vào công văn/email** thay vì bảo nhau "cuộn xuống gần cuối".
- **Đánh đổi**: mất khả năng liếc nhiều mục cùng lúc và mất khả năng in cả tài liệu thành một trang (§8) — đây là hai điểm accordion đang làm tốt hơn. Trên màn hẹp hướng này thoái hoá thành 2 màn nối tiếp, tốn thêm một cú chạm.
- **Không đụng vào triết lý**: 4 phần của mục pháp lý được giữ nguyên thứ tự và tách bạch hơn hiện tại, và phần "Trách nhiệm xác nhận" được nâng thành khối kết luận có viền `--ink`, kèm một câu cố định: *"Hệ thống không ghi nhận và không xác nhận việc này."*
- **Không cần đổi dữ liệu**: `helpContent.ts` đã có sẵn `group` cho cả hai nhóm — đúng bằng cây điều hướng cần vẽ. Không phải viết lại nội dung.

---

## 2. Chẩn đoán trang hiện tại

Quan sát trực tiếp trên bản đang chạy (không chỉ đọc code).

**Ảnh 1 — desktop 1280×720, trạng thái mặc định.** Nhìn thấy: đoạn mở đầu 4 dòng → banner cam "Hai văn bản đã hết hiệu lực" 5 dòng → ô tìm → 3 chip lọc → nhãn nhóm → 4 thẻ trắng đầu tiên. Bốn thẻ đó giống hệt nhau: nền trắng bo 16px, chip điều khoản màu accent, tiêu đề đậm, chevron ▾ bên phải.

**Ảnh 2 — desktop, mở mục "Xác định cấp độ an toàn thông tin".** Nội dung mở ra chiếm trọn khung nhìn, tiêu đề mục bị đẩy sát mép trên, không còn thấy mục nào khác.

**Ảnh 3 — 768×1024.** Toàn bộ khung nhìn đầu tiên là chữ: đoạn mở đầu + banner cam. Ô tìm và chip lọc nằm gần cuối màn đầu.

Số đo thật (đo trên `.content` của `AppShell.module.css:35` — đây mới là vùng cuộn, không phải `window`):

| Chỉ số | Giá trị đo được | Ý nghĩa |
|---|---|---|
| Chiều cao vùng cuộn (1280×720) | **605px** | khung nhìn thực rất thấp vì AppShell chừa 22px + header |
| Chiều cao nội dung, **đóng hết** | **2 095px** | **3,46 màn** chỉ để lướt qua danh sách tiêu đề |
| Chiều cao 1 mục khi mở (`pl-cap-do-attt`) | **625px** | **> khung nhìn** — không bao giờ thấy trọn một mục |
| Chiều cao nội dung khi mở 1 mục | 2 670px | mở thêm mục nữa là 3 000px+ |
| Khoảng cách từ đầu trang tới thẻ đầu tiên | **383px** | ~63% màn đầu là lời dẫn, chưa phải nội dung tra cứu |
| Số mục | 15 pháp lý + 7 hướng dẫn + 1 đính chính = **23** (bộ đếm hiện 22 vì cảnh báo tách riêng) | |

Nguyên nhân trong code:

1. **Không có tầng điều hướng.** `HelpPage.tsx:114-142` đổ phẳng `SEARCHABLE_ENTRIES` thành một danh sách; `groupHeader` (`HelpPage.tsx:121`) chỉ là một dòng chữ 12,5px chèn giữa dòng chảy (`HelpPage.module.css:85-91`) — nó **cuộn đi mất** cùng nội dung, nên khi đọc mục thứ 12 không ai còn biết mình đang ở văn bản luật nào. Đây chính là cảm giác "mọi hàng giống nhau": cấu trúc 5 nhóm văn bản có tồn tại trong dữ liệu nhưng bị bố cục làm cho vô hình.
2. **Trạng thái mở là cục bộ và không chia sẻ được.** `openIds` là `useState<Set<string>>` (`HelpPage.tsx:48`); toàn repo **không có** chỗ nào dùng `useSearchParams`/`location.hash`. Hệ quả trực tiếp: không dán được link tới "mục DPIA" cho đồng nghiệp, không đặt được liên kết từ màn khác vào đúng mục trợ giúp.
3. **Chi phí một lần đọc quá cao.** Mở mục = 625px chèn vào giữa dòng chảy, mọi mục phía dưới bị đẩy xuống; đóng lại thì vị trí cuộn nhảy. Đọc so sánh 2 mục pháp lý gần như bất khả.
4. **Lỗi trình bày thật trong phần "Hệ thống hỗ trợ".** `.supportItem` dùng `display:flex; justify-content:space-between` (`HelpPage.module.css:200-207`) nên nút "Mở màn này →" bị ném sang mép phải cách chữ ~800px — thấy rõ ở ảnh 2. `display:flex` trên `<li>` cũng **xoá luôn dấu đầu dòng**, nên phần "Hệ thống hỗ trợ" không có bullet còn "Đơn vị vận hành tự làm" thì có: hai danh sách cạnh nhau, hai kiểu khác nhau, không do chủ ý.
5. **`note` bị chôn ở cuối** (`HelpPage.tsx:232`). Với `pl-cap-do-attt`, `note` là cảnh báo "số điều áp dụng chưa xác minh" — tức là một điều kiện áp dụng của **phần 1**, nhưng người đọc chỉ gặp nó sau khi đã đọc hết 625px.
6. **Khối "Trách nhiệm xác nhận" đang dùng nền `--accent-soft`** (`HelpPage.module.css:228-236`). Trên chủ đề mặc định (vàng kim) đó là một mảng vàng nhạt — về thị giác rất gần với một huy hiệu "đạt". Đúng là chưa ai gọi nó là "đạt", nhưng đây là chi tiết dễ bị hiểu sai nhất còn sót lại của trang cũ.

**Một phát hiện nội dung, không phải bố cục** (cần chủ sở hữu quyết, hướng A chỉ làm nó lộ ra rõ hơn): 2 trong 7 mục thuộc nhóm `LEGAL_GROUP_1` — `pl-kiem-toan-doi-chieu` (`helpContent.ts:196`) và `pl-ket-noi-truc-quoc-gia` (`helpContent.ts:216`) — có `soHieuVanBan: 'NĐ 278/2025/NĐ-CP'`, trong khi nhãn nhóm là "Luật Dữ liệu 60/2024/QH15 + Nghị định 165/2025/NĐ-CP". Ở accordion, nhãn nhóm chỉ hiện thoáng qua nên không ai để ý. Ở hướng A nhãn nhóm là **nhãn điều hướng thường trực**, sai lệch này sẽ bị nhìn thấy mỗi lần mở trang. Nên hoặc tách nhóm thứ 6 cho NĐ 278/2025, hoặc mở rộng nhãn nhóm.

---

## 3. Bố cục đề xuất

### 3.1 Desktop ≥ 1281px

```
┌─ AppShell .content (vùng cuộn duy nhất, padding 0 26px 26px) ───────────────────┐
│ ⚠ 2 văn bản đã hết hiệu lực — không dẫn chiếu trong hồ sơ.   [Xem đính chính →] │ ← strip 1 dòng, LUÔN hiện
├──────────────────────────────┬──────────────────────────────────────────────────┤
│ ┌ MỤC LỤC — sticky top:16px ┐│ ┌ <article> CHI TIẾT ──────────────────────────┐ │
│ │ ⌕ Tìm trong 23 mục…       ││ │ Pháp lý · Luật Dữ liệu 60/2024 + NĐ 165      │ │ ← eyebrow
│ │ 23/23 mục                 ││ │ ── Kiểm soát chất lượng metadata           ── │ │ ← h2
│ │                           ││ │    trước khi công bố                         │ │
│ │ ĐÍNH CHÍNH VĂN BẢN     1  ││ │ [Điều 12]  [Luật Dữ liệu 60/2024/QH15]       │ │
│ │  ⚠ Hai văn bản hết h.lực  ││ │                                              │ │
│ │                           ││ │ ① VĂN BẢN  · Văn bản yêu cầu gì              │ │
│ │ PHÁP LÝ               15  ││ │ │ ▏"Kiểm soát chất lượng metadata trước…"    │ │
│ │  ▾ Luật Dữ liệu 60…    7  ││ │ │                                            │ │
│ │    ▸ Đ.12 Kiểm soát ◀━━━━━╋━╋─┤ ② HỆ THỐNG · Công cụ hệ thống cung cấp      │ │
│ │    ▸ Đ.21 Công khai…      ││ │ │  (mô tả công cụ — không phải xác nhận)     │ │
│ │    ▸ Đ.28 Chuẩn kỹ th…    ││ │ │  · Quy trình QC B.0–B.5   [Mở màn ↗]       │ │
│ │    …                      ││ │ │  · Pipeline 9 trạng thái                   │ │
│ │  ▸ Luật BVDLCN 91…     4  ││ │ │                                            │ │
│ │  ▸ Luật DSVH 45…       2  ││ │ │ ③ ĐƠN VỊ VẬN HÀNH · Phải tự làm / tự kiểm  │ │
│ │  ▸ Luật GDĐT 20…       1  ││ │ │  ▸ Lấy mẫu ngẫu nhiên bản ghi đã xuất bản  │ │
│ │  ▸ Luật ANM 116…       1  ││ │ │  ▸ …                                       │ │
│ │                           ││ │ └────────────────────────────────────────┐   │ │
│ │ HƯỚNG DẪN SỬ DỤNG      7  ││ │ ┏━ ④ NGƯỜI XÁC NHẬN ━━━━━━━━━━━━━━━━━━━━━┓   │ │
│ │  ▸ Nhập dữ liệu           ││ │ ┃ Cán bộ chuyên trách nghiệp vụ số hóa;  ┃   │ │
│ │  ▸ Quy trình duyệt & XB   ││ │ ┃ Giám đốc Trung tâm (phê duyệt).        ┃   │ │
│ │  ▸ Kiểm kê                ││ │ ┃ Hệ thống không ghi nhận và không       ┃   │ │
│ │  ▸ Phân quyền             ││ │ ┃ xác nhận việc này.                     ┃   │ │
│ │  ▸ Sao lưu & khôi phục    ││ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │ │
│ │  ▸ Biên tập tour số       ││ │                                              │ │
│ │  ▸ Nhật ký hệ thống       ││ │ Phụ lục · Biểu mẫu tham khảo  [chip] [chip]  │ │
│ └───────────────────────────┘│ └──────────────────────────────────────────────┘ │
│      300px                   │            minmax(0, 1fr)                        │
└──────────────────────────────┴──────────────────────────────────────────────────┘
```

- Grid `300px minmax(0,1fr)`, `gap:22px`, `align-items:start` — **cùng công thức `ObjectsPage.module.css:78-83`** (`240px minmax(0,1fr)`), chỉ nới 240→300px vì tiêu đề mục pháp lý dài tới ~90 ký tự.
- `1025–1280px`: cột trái co về **260px** (dùng breakpoint `max-width:1280px` đã có 14 chỗ trong repo).
- Cột trái `position:sticky; top:16px` + `max-height:calc(100% - 32px); overflow-y:auto` — **bắt buộc**, vì mở hết 3 nhóm là ~23 hàng ≈ 800px > 605px khung nhìn. Mặc định **chỉ nhóm đang chọn được mở**, các nhóm khác gập lại → cây thường trực ~10–12 hàng, vừa một màn.
- Nhóm hướng dẫn hiển thị theo `entry.group` ("Nhập dữ liệu", "Kiểm kê", "Phân quyền"…) chứ không phải `title`: mỗi group ở nhóm này chỉ có đúng 1 mục, nên nhãn ngắn gọn dùng làm nav rất tốt và **không phải thêm trường dữ liệu nào**.

### 3.2 Màn hẹp ≤ 1024px — hai màn nối tiếp, không phải hai cột ép nhỏ

```
   /help  (danh sách)                        /help/pl-metadata-qc  (chi tiết)
┌──────────────────────────────┐          ┌──────────────────────────────┐
│ ⚠ 2 văn bản hết hiệu lực  →  │          │ ← Danh sách mục              │ ← quay lại
├──────────────────────────────┤          ├──────────────────────────────┤
│ ⌕ Tìm trong 23 mục…          │  chọn    │ Pháp lý · Luật Dữ liệu 60…   │
│ 23/23 mục                    │  ─────►  │ Kiểm soát chất lượng         │
│                              │          │ metadata trước khi công bố   │
│ ĐÍNH CHÍNH VĂN BẢN        1  │  ◄─────  │ [Điều 12]                    │
│  ⚠ Hai văn bản hết hiệu lực  │  Back    │                              │
│                              │  (trình  │ ① Văn bản yêu cầu gì         │
│ PHÁP LÝ                  15  │  duyệt   │ ② Công cụ hệ thống cung cấp  │
│  ▾ Luật Dữ liệu 60…       7  │  cũng    │ ③ Đơn vị vận hành tự làm     │
│    Đ.12 Kiểm soát chất…      │  chạy)   │ ┏ ④ Người xác nhận ━━━━━━━┓  │
│    Đ.21 Công khai danh mục   │          │ ┗━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  ▸ Luật BVDLCN 91…        4  │          │                              │
│  …                           │          │ Phụ lục · Biểu mẫu tham khảo │
└──────────────────────────────┘          └──────────────────────────────┘
```

Lý do **không** bắt chước cách gập của `ObjectsPage.module.css:239-243` (sidebar → hàng chip cuộn ngang): ObjectsPage chỉ có 8 phân khu, còn ở đây là 23 mục tiêu đề dài — cuốn thành hàng chip sẽ tệ hơn accordion hiện tại. Vì URL đã mang mã mục nên "hai màn" gần như miễn phí: một biến `isNarrow` quyết định render cột nào, nút "← Danh sách mục" chỉ là `navigate('/help')`, và **nút Back của trình duyệt hoạt động đúng** mà không phải viết gì thêm.

---

## 4. Cách trình bày 4 phần của mục pháp lý

Đây là phần quyết định hướng này sống hay chết. Nguyên tắc: **bố cục phải tự nó nói ra rằng trách nhiệm đi từ văn bản → công cụ → việc người phải làm → người ký**, và điểm nhấn thị giác mạnh nhất trên trang phải rơi vào **con người**, không phải hệ thống.

### 4.1 "Thang trách nhiệm" — 4 bước có chủ ngữ

Không phải 4 hộp ngang hàng. Là **một cột dọc có số thứ tự và đường nối**, mỗi bước ghi rõ **CHỦ NGỮ** — đây chính là thiết bị chống hiểu nhầm:

| # | Chủ ngữ (nhãn nhỏ, in hoa) | Tiêu đề phần | Nguồn dữ liệu | Xử lý thị giác |
|---|---|---|---|---|
| ① | `VĂN BẢN` | Văn bản yêu cầu gì | `yeuCau` + `soHieuVanBan` + `dieuKhoan` | khối trích dẫn: viền trái 3px `--ink` 25%, nền `#f6f5ef`, kèm nhãn "trích nguyên văn" |
| ② | `HỆ THỐNG` | **Công cụ hệ thống cung cấp** | `heThongHoTro[]` | danh sách công cụ, nền trắng, mỗi dòng có link "Mở màn ↗" nếu có `href` |
| ③ | `ĐƠN VỊ VẬN HÀNH` | Phải tự làm / tự kiểm | `donViTuLam[]` | danh sách hành động, marker `▸` màu `--accent-text` |
| ④ | `NGƯỜI XÁC NHẬN` | Ai xác nhận đã tuân thủ | `trachNhiemXacNhan` | **khối kết luận**: viền 1.5px `--ink`, nền trắng, chữ 15px/700 |

Bốn quyết định cụ thể, mỗi cái nhằm một rủi ro:

**(a) Đổi tiêu đề phần ② từ "Hệ thống hỗ trợ" thành "Công cụ hệ thống cung cấp"**, và thêm một dòng phụ đề **cố định, luôn hiện**:
> *Đây là mô tả công cụ sẵn có trong phần mềm — không phải xác nhận đã đáp ứng yêu cầu ở trên.*

Chữ "hỗ trợ" đứng một mình vẫn có thể đọc thành "đã lo xong". "Công cụ … cung cấp" thì không. Một dòng phụ đề, 0 chi phí, đóng đúng lỗ hổng chủ đầu tư đã bác.

**(b) Phần ③ KHÔNG dùng ô tick.** Nhìn thì "checklist" gợi ngay checkbox, nhưng checkbox tạo ra **trạng thái**, mà trạng thái trong phần mềm thì lại thành tự chấm — đúng thứ vừa bị bác. Dùng bullet `▸` + câu bắt đầu bằng động từ. Nếu sau này chủ đầu tư muốn theo dõi tiến độ, đó phải là một sổ công việc có người ký, không phải mấy ô tick trong trang tra cứu.

**(c) Phần ④ bỏ nền `--accent-soft`, chuyển sang viền `--ink`.** Hai cái lợi cùng lúc: (i) hết mảng màu dễ đọc thành huy hiệu "đạt"; (ii) hết phụ thuộc màu chủ đề — khối này trông y hệt trên cả 7 chủ đề, kể cả `crimson`. Thêm một dòng cố định cuối khối:
> *Hệ thống không ghi nhận và không xác nhận việc này.*

Đây là câu quan trọng nhất của cả trang, nên nó phải nằm ở **vị trí kết luận** — thứ cuối cùng người đọc thấy trước phụ lục.

**(d) `note` chuyển lên đầu, ngay dưới tiêu đề**, dạng dải cảnh báo có nhãn "Điều kiện áp dụng". Cả 3 `note` hiện có đều là caveat về phạm vi áp dụng (`helpContent.ts:260`, `:418`, `:516`) — đọc sau 625px là quá muộn. Với `pl-cap-do-attt`, dải này nói thẳng "số điều áp dụng chưa xác minh" trước khi người ta kịp trích dẫn nhầm.

Phụ lục `evidenceIds` **nằm ngoài thang**, phía dưới, giữ nguyên tên "Biểu mẫu tham khảo" (`HelpPage.module.css:252` đã chú thích rõ vì sao không gọi là "chứng cứ") — vì đó là tệp đính kèm, không phải một bước trách nhiệm.

### 4.2 Minh hoạ ngắn

```tsx
// Một bước của thang — chủ ngữ là prop bắt buộc, không có giá trị mặc định:
// người viết code không thể "quên" nói ai chịu trách nhiệm ở bước này.
function Rung({ n, actor, title, hint, children }: RungProps) {
  return (
    <section className={styles.rung} aria-labelledby={`rung-${n}`}>
      <div className={styles.rungGutter} aria-hidden="true">{n}</div>
      <div className={styles.rungBody}>
        <p className={styles.rungActor}>{actor}</p>
        <h3 id={`rung-${n}`} className={styles.rungTitle}>{title}</h3>
        {hint && <p className={styles.rungHint}>{hint}</p>}
        {children}
      </div>
    </section>
  );
}
```

```css
/* Đường nối dọc = "chuỗi trách nhiệm", cắt ở bước cuối để ④ đứng riêng. */
.rung { display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 12px; }
.rungGutter {
  width: 22px; height: 22px; border-radius: 999px;
  background: var(--accent-soft); color: var(--accent-text);   /* 7,5:1 — xem §6 */
  font-size: 11px; font-weight: 800; display: grid; place-items: center;
}
.rung:not(:last-child) .rungGutter { box-shadow: 0 26px 0 -10px #e7e7dc; } /* nối xuống bước sau */
.rungActor { font-size: 10.5px; font-weight: 800; letter-spacing: .06em;
             text-transform: uppercase; color: #6f6f62; margin: 0 0 2px; }
.rungHint  { font-size: 12px; font-style: italic; color: #6f6f62; margin: 2px 0 8px; }

/* ④ — khối kết luận. KHÔNG nền màu: không phụ thuộc chủ đề, không đọc thành "đạt". */
.confirm { border: 1.5px solid var(--ink); border-radius: 14px;
           background: #fff; padding: 14px 16px; margin-top: 4px; }
.confirmDisclaimer { font-size: 12px; color: #5f5f54; margin: 8px 0 0;
                     padding-top: 8px; border-top: 1px solid #e7e7dc; }

/* Sửa lỗi §2.4: chữ và nút không còn bị đẩy xa nhau, và <li> giữ được bullet. */
.toolItem { display: list-item; margin-bottom: 8px; max-width: 72ch; }
.toolItem .openLink { display: inline-flex; margin-left: 8px; vertical-align: baseline; }
```

### 4.3 Phân biệt 3 category mà không dùng màu "đạt/không đạt"

Bốn tín hiệu, **không cái nào là màu xanh/đỏ**:

1. **Vị trí** — 3 mục lớn tách bạch trong mục lục, luôn nhìn thấy. Đây là tín hiệu chính.
2. **Hình dạng nội dung** — pháp lý = thang 4 bước; hướng dẫn = `<ol>` các bước thao tác + nút "Mở màn này"; đính chính = dải cảnh báo. Nhìn hình là biết đang ở đâu, không cần đọc màu.
3. **Eyebrow chữ** — dòng nhỏ trên tiêu đề: `Pháp lý · <tên văn bản>` / `Hướng dẫn sử dụng · <chủ đề>`.
4. **Màu chỉ dùng cho đúng 1 category**: "Đính chính" giữ nguyên cặp cam `#ffd9c2 / #7a2f0f` đã có (`HelpPage.module.css:10-16`). Pháp lý và hướng dẫn **cố ý không màu**. Tô màu cho chúng là mở lại cánh cửa đọc thành "đạt/chưa đạt".

---

## 5. Tìm kiếm, lọc, deep-link, trạng thái rỗng

**Tìm kiếm** đặt trên đầu cột trái, lọc **cây**, không lọc nội dung bên phải:
- dùng lại `matchesHelpQuery` (`helpContent.ts:66`) nguyên vẹn — không đổi hàm, không đổi dữ liệu;
- nhóm không có kết quả thì ẩn; nhóm có kết quả thì **tự mở**;
- bộ đếm đổi từ "22 mục" thành **"12/23 mục"** — thấy ngay bộ lọc đang cắt mất bao nhiêu;
- mục đang xem **không bị mất** khi lọc lệch: cột phải giữ nguyên, cây hiện dòng "Mục đang xem không khớp từ khoá — [Bỏ lọc]";
- `Esc` xoá từ khoá; `/` focus vào ô tìm.

**Bỏ 3 chip lọc category** (`HelpPage.tsx:106-110`). Ba mục lớn của cây đã làm đúng việc đó, có kèm số đếm, và luôn hiện. Giữ cả hai là hai bộ điều khiển chồng nhau — bớt một control là bớt thật.

*(Tuỳ chọn, +0,5 ngày)*: thêm `donViTuLam` và `heThongHoTro[].label` vào `haystacks` của `matchesHelpQuery` (`helpContent.ts:70`) để tìm được toàn văn, kèm hiển thị đoạn khớp trong hàng cây. Hiện `keywords` viết khá kỹ nên chưa cấp bách.

**Deep-link** — `/help/:entryId`, dùng lại đúng idiom `assets/:id` đã có, không cần `useSearchParams` (repo chưa dùng bao giờ):

```tsx
<Route path="help" element={<HelpPage />} />
<Route path="help/:entryId" element={<HelpPage />} />
{/* /compliance → /help giữ nguyên (App.tsx:69) */}
```

`navConfig.ts:187` đã dùng `pathname.startsWith('/help')` nên tiêu đề header vẫn đúng với link sâu — **không phải sửa gì**. Lợi ích kéo theo: các màn khác có thể trỏ thẳng `/help/hd-phan-quyen-bon-mat` từ chỗ cần giải thích, thay vì đẩy người dùng vào một trang 2 000px rồi bảo tự tìm.

**Ba trạng thái rỗng, khác nhau:**

1. **`/help` không chọn mục** (màn hạ cánh, desktop): đặt **đoạn triết lý đầy đủ** ở đây (đoạn `HelpPage.tsx:74-79`), cùng "23 mục: 15 pháp lý · 7 hướng dẫn · 1 đính chính" và 3 lối vào nhanh ("Chuẩn bị hồ sơ thanh tra", "Người dùng mới", "Đính chính văn bản"). Đây là trang có nội dung, không phải khoảng trắng.
2. **Tìm không ra**: "Không có mục nào khớp «xyz»" + 4 chip từ khoá gợi ý lấy từ `keywords` + nút "Xoá bộ lọc".
3. **Mã mục sai** (link cũ dán trong công văn): "Không tìm thấy mục «xyz» — mã có thể đã thay đổi. Chọn một mục ở cột trái." Không được trắng màn, không được crash. Bắt buộc, vì các mã này sẽ đi vào giấy tờ.

---

## 6. Khả năng tiếp cận

**Bàn phím**
- Hàng trong cây là `<Link>` thật (không phải `<button aria-pressed>` như `ObjectsPage.tsx:207`) — vì chúng **đổi URL**. Trạng thái chọn dùng `aria-current="page"`, đúng ngữ nghĩa hơn `aria-pressed`. Đây là chỗ tôi cố ý lệch khỏi tiền lệ trong repo, và lý do là ngữ nghĩa chứ không phải thẩm mỹ.
- Cây có tới 23 điểm dừng Tab → thêm liên kết đầu tiên `Bỏ qua mục lục` dùng class `.visually-hidden` đã có sẵn (`global.css:63`), nhảy tới `#help-detail`.
- Nút gập nhóm là `<button aria-expanded aria-controls>`.
- Khi chọn một mục: chuyển focus tới `<h2 tabIndex={-1}>` của cột phải rồi `.focus()` — người dùng bàn phím và trình đọc màn hình được đưa tới nội dung mới thay vì bị bỏ lại ở cây.

**Trình đọc màn hình**
- `<nav aria-label="Mục lục trợ giúp">` chứa `<ul>` lồng theo nhóm; `<article aria-labelledby="help-detail-title">` cho cột phải.
- 4 phần là `<section aria-labelledby>` với `<h3>` thật; số ① ② ③ ④ là trang trí → `aria-hidden="true"`. Nhãn chủ ngữ (`VĂN BẢN`, `HỆ THỐNG`, `ĐƠN VỊ VẬN HÀNH`, `NGƯỜI XÁC NHẬN`) là **văn bản thật**, được đọc lên — thông điệp trách nhiệm không phụ thuộc vào việc nhìn thấy màu hay bố cục.
- Dải strip cảnh báo hết hiệu lực: `role="note"` (không dùng `role="alert"` — nó tồn tại thường trực, không phải sự kiện).
- Lỗi có sẵn cần biết: `Header.tsx` render tiêu đề trang bằng `<h3>`, nên trang không có `<h1>`. Tôi để tiêu đề chi tiết là `<h2>` và **không** tự ý sửa Header (ngoài phạm vi) — nhưng nên ghi vào việc riêng: `<h3>` → `<h1>`, sửa 1 dòng.

**Tương phản** — cam kết không làm xấu thêm tình trạng `crimson`:
- Nguyên nhân trượt 1,81:1 là cặp **`--ink` trên nền `--accent`** (crimson: `#151312` trên `#7a1f22` — hai màu cùng tối). **Hướng A không dùng cặp này ở bất kỳ đâu.**
- Cặp duy nhất phụ thuộc chủ đề mà tôi dùng là `--accent-text` trên `--accent-soft` (số thứ tự trong thang, chip điều khoản). Tính theo `deriveVars` (`ThemeContext.tsx:26-27`): vàng kim → `#594917` trên `#f6edd3` = **7,50:1**; crimson → `#330d0e` trên `#e2cdce` = **≈11,6:1**. Cả hai đạt AA và cả AAA cho chữ lớn.
- Khối ④ và dải cảnh báo dùng màu **cố định**, không theo chủ đề: `--ink` trên trắng (thấp nhất trong 7 chủ đề là vàng kim `#0b3d34` = **12,1:1**), và `#7a2f0f` trên `#ffd9c2` = **≈7,1:1**.
- Chữ phụ `#6f6f62` trên nền trắng = **5,1:1** — đạt AA. Giữ nguyên, không hạ thêm.

---

## 7. Chi phí thi công + rủi ro

Một lập trình viên quen repo. `HelpPage.tsx` (262 dòng) và `HelpPage.module.css` (334 dòng) coi như **viết lại**; nội dung trong `helpContent.ts` **không đụng tới**.

| Hạng mục | Người-ngày |
|---|---|
| Cột trái: cây 3 mục lớn, gập nhóm, sticky + cuộn riêng, số đếm | 1,0 |
| Định tuyến `/help/:entryId`, chọn mục, đồng bộ URL ↔ cây, xử lý mã sai | 0,5 |
| Cột phải: thang 4 bước (pháp lý) + thân hướng dẫn + thân đính chính | 1,5 |
| Tìm kiếm trong cây, 3 trạng thái rỗng, màn hạ cánh | 0,5 |
| Màn hẹp ≤1024 (2 màn nối tiếp) + 1280 | 0,5 |
| A11y: focus, skip-link, aria, kiểm tra 7 chủ đề × 3 khổ màn | 0,5 |
| **Tổng** | **4,5** (gọn: 3,5 · chỉn chu: 5) |

Sửa ngoài `HelpPage.*`: `App.tsx` thêm 1 route. Tuỳ chọn: `helpContent.ts` +2 dòng cho tìm toàn văn.

**Rủi ro**

| Rủi ro | Mức | Xử lý |
|---|---|---|
| Mã mục (`pl-*`, `hd-*`) thành hợp đồng công khai: đã dán vào công văn rồi đổi mã là link chết | Trung bình | Chốt mã ngay từ bây giờ; luôn có trạng thái rỗng #3; không bao giờ đổi `id` cũ |
| Cột trái vẫn dài hơn khung nhìn nếu mở hết nhóm | Cao nếu quên | Bắt buộc gập nhóm + `overflow-y:auto` — không phải tuỳ chọn |
| Sticky hỏng nếu ai đó đổi `.outer` từ `height:100vh` sang `min-height` | Thấp | `AppShell.module.css:1-13` đã có comment cảnh báo sẵn; ghi thêm trong CSS mới |
| Đoạn triết lý chuyển vào màn hạ cánh → người vào bằng link sâu không đọc | **Cao** | Giữ một dòng cố định dưới tiêu đề trang; và mỗi mục pháp lý đều kết bằng khối ④ mang đúng thông điệp đó |
| Bản trình diễn chấm thầu chạy trên máy chiếu khổ hẹp → rơi vào bố cục 2 màn | Trung bình | Diễn tập trước ở đúng độ phân giải; ngưỡng gập là 1024px nên máy chiếu 1280 vẫn đủ 2 cột |

---

## 8. Hướng này THUA ở đâu

Ba điểm yếu thật. Điểm 1 là điểm có thể giết hướng này nếu không xử lý.

**1. Không đọc tuần tự và không in được cả tài liệu — nghiêm trọng nhất trong bối cảnh hồ sơ thầu.**
Master–detail chỉ render đúng một mục. Accordion hiện tại, mở hết ra rồi Ctrl+P, cho ra một tài liệu liền mạch 23 mục — đúng thứ người ta cần khi in kèm hồ sơ hoặc gửi PDF cho đơn vị thanh tra. Hướng A **mất năng lực đó**, và nó là năng lực thật, không phải giả định. Phải bù bằng một chế độ "Xem toàn bộ dạng một trang / In" (~0,5 người-ngày nữa), mà bản thân việc phải có chế độ đó lại tự thú rằng bố cục một-mục-một-lần không bao trùm hết cách trang này được dùng. Nếu chủ đầu tư nói việc in là thiết yếu, cần cân nhắc lại hướng.

**2. Với 23 mục, master–detail hơi quá tay — và cái accordion không biến mất, nó chỉ dời sang trái.**
Stripe Docs hay MDN dùng bố cục này cho hàng trăm tới hàng nghìn trang. Ở đây có 23 mục, trong đó 15 mục dồn vào 5 nhóm pháp lý. Cây vẫn dài hơn khung nhìn nên vẫn phải gập nhóm — tức là vẫn còn accordion, chỉ là accordion nhỏ hơn ở cột trái. Lợi ích thật (mục lục thường trực + deep-link) là có, nhưng đừng hứa "hết cuộn": không hết, chỉ là cuộn trong một cột hẹp thay vì cuộn cả trang. Một hướng đơn giản hơn — giữ danh sách một cột nhưng thêm thanh nhóm dính ở đầu và chuyển 4 phần thành lưới — có thể đạt 70% lợi ích với 40% chi phí.

**3. Màn hẹp tốn thêm một cú chạm, và triết lý bị đẩy khỏi tầm mắt mặc định.**
Dưới 1024px, hướng A thành hai màn: xem danh sách → chọn → đọc → quay lại. Accordion mở tại chỗ, không mất ngữ cảnh. Nặng hơn: hiện tại đoạn "đây không phải bảng tự chấm tuân thủ" và toàn văn cảnh báo hết hiệu lực **luôn nằm ngay trên đầu**, ai mở trang cũng đọc. Hướng A rút chúng thành một dòng strip + một màn hạ cánh — gọn hơn thật, nhưng làm **giảm sức nặng của đúng thông điệp mà chủ đầu tư quan tâm nhất**, và người vào bằng link sâu sẽ không gặp đoạn đó chút nào. Tôi đã bù bằng khối ④ ở mỗi mục và một dòng cố định dưới tiêu đề, nhưng đây là đánh đổi thật, không phải đã hoá giải xong. Điểm này nên hỏi ý chủ đầu tư trước khi thi công.

---

## 9. Tham chiếu

| Nơi dùng bố cục này | Vì sao hợp với trang này |
|---|---|
| **thuvienphapluat.vn / vbpl.vn** — panel "Mục lục văn bản" bên trái, nội dung điều khoản bên phải | Cán bộ nhà nước Việt Nam **đã đọc văn bản pháp luật theo đúng hình này hằng ngày**. Chọn hướng A là chọn thói quen sẵn có của chính người dùng cuối, không phải dạy họ một kiểu mới. Đây là lập luận mạnh nhất trong bảng này. |
| **legislation.gov.uk** — Table of Contents bên trái, mỗi điều/khoản có URL riêng | Cùng bài toán: một tập văn bản có thứ bậc, cần trích dẫn chính xác tới từng điều. Chứng minh việc "mỗi mục một URL" là chuẩn mực của tra cứu pháp luật, không phải tính năng thừa. |
| **GOV.UK Design System / Service Manual** — điều hướng theo mục ở cột trái | Tiền lệ của một hệ thống **do nhà nước vận hành**, đặt nặng rõ ràng và tiếp cận hơn là bắt mắt — cùng ràng buộc với hồ sơ chấm thầu này. |
| **MDN Web Docs, Stripe Docs, Microsoft Learn** | Chuẩn mực cho tài liệu tra cứu lặp đi lặp lại: mục lục dính, nội dung một trang một chủ đề, link sâu. Xác nhận hình thức đủ quen để không ai phải học cách dùng. |
| **Nội bộ dự án: `ObjectsPage`** (`ObjectsPage.module.css:78-95`, `ObjectsPage.tsx:205-238`) | Quan trọng không kém: bố cục này **đã tồn tại trong chính ứng dụng** — cây 240px dính bên trái, nội dung bên phải, quy tắc gập ở 1024px đã viết sẵn. Hướng A vì thế là *mở rộng ngôn ngữ thị giác đang có*, không phải vẽ lại từ đầu, và đó là lý do 4,5 người-ngày là con số thực tế. |
