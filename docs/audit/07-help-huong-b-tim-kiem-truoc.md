# Hướng B — Tìm-kiếm-trước, tổ chức theo câu hỏi/công việc

> Phạm vi: trang `Trợ giúp & tra cứu` (`/help`). Tệp liên quan: `app/src/pages/HelpPage.tsx`, `app/src/pages/HelpPage.module.css`, `app/src/data/helpContent.ts`.
> Giai đoạn CHỌN HƯỚNG — tài liệu này không kèm thay đổi mã nguồn.

---

## 1. Tóm tắt hướng

Trang hiện tại được tổ chức theo **cấu trúc của văn bản pháp luật** (nhóm = tên luật/nghị định). Đó là cấu trúc của *nguồn tài liệu*, không phải cấu trúc của *nhu cầu người đọc*.

Không cán bộ nào mở trang này để đọc Luật Dữ liệu 60/2024/QH15 từ đầu đến cuối. Họ mở nó khi đang kẹt giữa một công việc cụ thể: *"Mai nhập lô ảnh scan bia Tiến sĩ, cần chuẩn bị gì?"* — *"Có người đòi xoá tên khỏi bản số hoá gia phả, làm sao và trong bao lâu?"* — *"Ai ký trước khi công bố?"*

Hướng B đảo trục: **câu hỏi/công việc là trục chính, văn bản pháp luật trở thành siêu dữ liệu đính kèm mỗi mục** — vẫn hiển thị đầy đủ, vẫn tra được theo số hiệu (mục 6).

Ba thay đổi cốt lõi:

1. **Ô tìm kiếm trở thành nhân vật chính** của trang, kèm một hàng câu hỏi phổ biến bấm được — người không biết gõ gì vẫn có đường vào.
2. **Danh sách phẳng 22 mục → 6 nhóm tình huống** ("Nhập & mô tả dữ liệu", "Duyệt & công bố", "Dữ liệu cá nhân & quyền của người dân"…), đặt trong rail dính bên trái để luôn thấy mình đang ở đâu.
3. **Thân mục pháp lý đổi thứ tự và đổi ngữ pháp thị giác**: việc-người-phải-làm và người-ký-xác-nhận lên trên, công cụ phần mềm ở giữa, trích dẫn pháp lý làm căn cứ ở dưới (mục 5 — phần khó nhất, và cũng là phần giữ triết lý).

**Điều KHÔNG đổi:** mô hình nội dung 4 phần (`yeuCau` → `heThongHoTro` → `donViTuLam` → `trachNhiemXacNhan`), ràng buộc nguyên văn của ADR-0014, và nguyên tắc phần mềm không tự tuyên bố "Đạt". Hướng B chỉ đổi **thứ tự đọc và trọng số thị giác**, không đổi dữ liệu pháp lý.

---

## 2. Chẩn đoán trang hiện tại

Tôi mở `http://localhost:5173/help` bằng trình duyệt và đo trực tiếp trên DOM. Số liệu dưới đây là đo được, không ước lượng.

### 2.1 Trang dài hơn cảm giác — và dài ngay cả khi đóng hết

| Đo tại 1280×720 (vùng nội dung 605px) | Giá trị |
|---|---|
| Chiều cao nội dung khi **đóng hết** accordion | **2 670 px ≈ 4,4 màn** |
| Chiều cao một thẻ khi **mở một mục** (`pl-metadata-qc`) | **515 px** = 85% khung nhìn |
| Chiều cao nội dung sau khi mở đúng **một** mục | 3 116 px |

Mở **một** mục đã chiếm gần trọn màn hình. Không thể so sánh hai mục cạnh nhau, và khi cuộn xuống đọc phần "Đơn vị vận hành tự làm" thì **tiêu đề của chính mục đó đã trôi khỏi màn hình** — mất ngữ cảnh giữa lúc đọc (quan sát trực tiếp trên ảnh chụp: phần thân hiện đầy đủ nhưng không còn thấy đang đọc mục nào).

### 2.2 Nhóm không nhóm được gì — 12 nhóm cho 22 mục

Đếm theo `LEGAL_GROUP_ORDER` (`helpContent.ts:75-81`) và `group` của `HOWTO_ENTRIES`:

| Nhóm | Số mục |
|---|---|
| Luật Dữ liệu 60/2024 + NĐ 165/2025 | 7 |
| Luật BVDLCN 91/2025 + NĐ 356/2025 | 4 |
| Luật Di sản văn hoá 45/2024 + NĐ 308/2025 | 2 |
| Luật Giao dịch điện tử 20/2023 + NĐ 137/2024 | 1 |
| Luật An ninh mạng 116/2025 | 1 |
| Nhập dữ liệu · Quy trình duyệt & xuất bản · Kiểm kê · Phân quyền · Sao lưu & khôi phục · Biên tập tour · Nhật ký hệ thống | 1 mỗi nhóm |

**9 trong 12 nhóm chỉ có đúng 1 mục.** Trung bình 1,8 mục/nhóm. Tiêu đề nhóm (`.groupHeader`, `HelpPage.module.css:85-94`) tiêu tốn 12 dòng và 12 khoảng cách 14px để "nhóm" những tập hợp một phần tử. Nửa dưới trang là chuỗi *header — một thẻ — header — một thẻ*, nhìn như lỗi hiển thị hơn là phân loại.

### 2.3 Thứ tự nhóm hướng dẫn bị bảng chữ cái phá

`groupOrderIndex()` (`HelpPage.tsx:36-43`) trả **cùng một giá trị** cho mọi mục `huong-dan`, nên tie-break rơi vào `a.group.localeCompare(b.group, 'vi')` (`HelpPage.tsx:56`). Kết quả trên màn hình, đúng thứ tự:

> Biên tập tour → Kiểm kê → **Nhập dữ liệu** → Nhật ký → Phân quyền → Quy trình duyệt → Sao lưu

"Nhập dữ liệu" — việc **đầu tiên** trong vòng đời một bản ghi — nằm thứ ba, sau "Kiểm kê" là việc **cuối cùng**. Quy trình nghiệp vụ bị sắp lại theo bảng chữ cái.

### 2.4 Mọi hàng trông giống hệt nhau, và mép trái tiêu đề bị răng cưa

Thẻ đóng chỉ có: pill `Điều XX` + tiêu đề + chevron. Không có gì phân biệt mục pháp lý nặng (5 việc phải làm, 4 công cụ) với mục nhẹ (2 việc). Tệ hơn, pill `Điều XX` có **độ rộng thay đổi** (`Điều 12` vs `Điều 21 (Luật Dữ liệu) + NĐ 165 Điều 10`), mà tiêu đề lại xếp sau pill trong cùng flexbox (`.entryHeaderMain`, `HelpPage.module.css:116-122`).

Đo mép trái tiêu đề của 7 thẻ đầu: **365, 524, 368, 408, 361, 409, 368 px** — biên độ **163px**. Không có đường dóng dọc để mắt quét. Đây là lỗi quét đo được, không phải cảm tính.

### 2.5 Ô tìm kiếm nằm sai chỗ — và trên màn hẹp thì biến mất

| Vị trí ô tìm của trang (`HelpPage.tsx:95-101`) | Toạ độ Y |
|---|---|
| Desktop 1280×720 | 349 px (sau đoạn dẫn 5 dòng + banner cảnh báo) |
| Hẹp 375×812 | **797 px** — trong khung nhìn cao 812px |

Ở màn hẹp, ô tìm kiếm của một trang **tra cứu** nằm dưới nếp gấp. Toàn trang khi đó dài **3 739px ≈ 5,5 màn**; riêng đoạn dẫn + banner cảnh báo chiếm **hai màn đầu tiên**.

Nghiêm trọng hơn: ở đúng y=73 vẫn có một ô tìm kiếm khác — ô tìm toàn cục trên thanh đầu (`app/src/layout/Header.tsx:37-49`) — nhưng nó **chỉ tìm dữ liệu số hoá** và **điều hướng sang `/assets`** ngay khi gõ (`Header.tsx:42-46`). Người dùng đang ở trang Trợ giúp, muốn tìm trợ giúp, nhìn thấy một ô tìm kiếm, gõ vào — và bị đá sang trang khác.

### 2.6 Bên trong thân mục: 4 phần cùng một trọng số

Bốn nhãn `.sectionLabel` (`HelpPage.module.css:163-170`) dùng **y hệt** một kiểu: 11px, in hoa, `#6f6f62`. "Văn bản yêu cầu gì", "Hệ thống hỗ trợ", "Đơn vị vận hành tự làm / tự kiểm", "Biểu mẫu tham khảo" — không phân biệt được đâu là *việc phần mềm làm* và đâu là *việc anh phải làm*. Chỉ "Trách nhiệm xác nhận" có khung riêng (`.responsibleBox:228-236`) — đúng hướng, nhưng bị đặt **sau** cả ba phần kia, tức người đọc lướt gặp nó cuối cùng hoặc không gặp.

Một lỗi nhỏ đi kèm: `.supportItem` đặt `display: flex` (`HelpPage.module.css:200-207`), ghi đè `display: list-item`, nên **danh sách "Hệ thống hỗ trợ" mất hoàn toàn dấu đầu dòng** trong khi danh sách "Đơn vị vận hành tự làm" ngay bên dưới vẫn có. Trên ảnh chụp, hai danh sách cùng cấp trông như hai cấp khác nhau. Nút `Mở màn này →` lại nằm *bên trong* `<li>` và xuống dòng riêng, cắt nhịp danh sách.

### 2.7 Số mục thực tế, và một lỗ hổng tìm kiếm

Đếm lại từ dữ liệu: **15 mục pháp lý** (7+4+2+1+1) + **7 mục hướng dẫn** + **1 mục đính chính** = **23 mục**. Bộ đếm giao diện hiển thị "22 mục" vì `SEARCHABLE_ENTRIES` (`HelpPage.tsx:34`) cố tình loại nhóm `canh-bao` khỏi tập tìm/lọc.

Đây là quyết định đúng về an toàn (không để ai lướt qua mất cảnh báo) nhưng có tác dụng phụ: **không tìm được mục cảnh báo bằng ô tìm kiếm**. Gõ "13/2023" hay "47/2020" ra 0 kết quả, dù nội dung đính chính hai nghị định đó đang nằm ngay đầu trang.

---

## 3. Ai dùng trang này và tới với câu hỏi gì

Vai trò lấy từ `ROLE_OPTIONS` (`app/src/data/permissions.ts:27`): **`Quản trị`, `Kỹ thuật số hóa`, `Biên tập`, `Phê duyệt`, `Chỉ xem`**. (Lưu ý: không có vai trò tên "Biên mục" — công việc biên mục thuộc vai trò `Biên tập`, xem `ROLE_SUMMARY:83`.)

Mười câu hỏi thật, suy từ nghiệp vụ đã có trong ứng dụng:

| # | Câu hỏi | Vai trò hay hỏi | Trả lời bằng mục |
|---|---|---|---|
| 1 | "Mai nhập một lô ảnh scan — cần chuẩn bị metadata gì?" | Kỹ thuật số hóa, Biên tập | `hd-nhap-du-lieu`, `pl-chuan-ky-thuat`, `pl-metadata-qc` |
| 2 | "Bản ghi này đủ điều kiện xuất bản chưa? Ai ký?" | Phê duyệt | `hd-quy-trinh-9-buoc`, `pl-ky-so-giao-dich-dt`, `hd-phan-quyen-bon-mat` |
| 3 | "Có người đòi xoá tên khỏi bản số hoá gia phả — làm gì, trong bao lâu?" | Biên tập, Quản trị | `pl-yeu-cau-chu-the` |
| 4 | "Vừa phát hiện lộ dữ liệu — báo ai, hạn bao lâu?" | Quản trị | `pl-su-co-72h` |
| 5 | "Sắp số hoá 82 bia Tiến sĩ — có phải xin phép ai không?" | Biên tập, Phê duyệt | `pl-xin-y-kien-bo-vhttdl` |
| 6 | "Thanh tra hỏi 'căn cứ Điều 21 Luật Dữ liệu, đơn vị làm gì?' — trả lời ở đâu?" | Quản trị | `pl-danhmuc-mo` (→ mục 6) |
| 7 | "Tôi mới được giao vai trò Phê duyệt — việc của tôi gồm những gì?" | Phê duyệt (mới) | lọc theo vai trò |
| 8 | "Cuối năm rồi, có việc định kỳ nào bắt buộc không?" | Quản trị | `pl-danhgia-rui-ro`, `pl-vong-doi-luu-tru`, `pl-cap-do-attt` |
| 9 | "Xoá nhầm dữ liệu — khôi phục thế nào, mất bao lâu?" | Kỹ thuật số hóa | `hd-sao-luu-khoi-phuc` |
| 10 | "Tôi định trích Nghị định 13/2023 vào báo cáo — còn dùng được không?" | mọi vai trò | `canh-bao-van-ban-het-hieu-luc` |

Hai quan sát rút ra. **Câu 8 hiện không trả lời được**: không có cách nào nhìn ra "việc định kỳ hằng năm" — nó nằm rải trong `donViTuLam` của 3 mục thuộc 2 luật khác nhau. Trục tình huống làm lộ chiều thông tin mà trục văn bản che mất. **Câu 10 hiện trả về 0 kết quả** (mục 2.7); Hướng B phải sửa việc này.

### Ánh xạ 22 mục → 6 tình huống

| Tình huống | Mục |
|---|---|
| **Nhập & mô tả dữ liệu** (3) | `hd-nhap-du-lieu`, `pl-chuan-ky-thuat`, `pl-metadata-qc` |
| **Duyệt & công bố** (5) | `hd-quy-trinh-9-buoc`, `hd-phan-quyen-bon-mat`, `pl-xin-y-kien-bo-vhttdl`, `pl-ky-so-giao-dich-dt`, `pl-danhmuc-mo` |
| **Dữ liệu cá nhân & quyền của người dân** (3) | `pl-dpia`, `pl-yeu-cau-chu-the`, `pl-dau-moi-bvdlcn` |
| **Sự cố, an toàn & sao lưu** (5) | `pl-su-co-72h`, `pl-cap-do-attt`, `pl-danhgia-rui-ro`, `pl-vong-doi-luu-tru`, `hd-sao-luu-khoi-phuc` |
| **Kết nối & báo cáo cấp trên** (3) | `pl-ket-noi-truc-quoc-gia`, `pl-kiem-toan-doi-chieu`, `pl-chuyen-dang-so-disan` |
| **Kiểm kê & nhật ký** (3) | `hd-kiem-ke-hoan-tac`, `hd-nhat-ky-he-thong`, `hd-bien-tap-tour-khong-gian-so` |

Trung bình **3,7 mục/tình huống** so với 1,8 mục/nhóm hiện tại — nhóm bắt đầu có nghĩa. Cần thêm 2 trường vào `HelpEntry`: `situation: SituationId` và `roles: RoleName[]`. Không đụng 4 trường pháp lý, không đụng ADR-0014.

---

## 4. Bố cục đề xuất

### 4.1 Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Trợ giúp & tra cứu                            [ô tìm toàn cục] [🔔]     │ ← Header có sẵn
├──────────────────────────────────────────────────────────────────────────┤
│  ⚠ Hai văn bản đã hết hiệu lực — 47/2020 · 13/2023      [Xem chi tiết ▾] │ ← banner GỌN còn 1 dòng
├──────────────────────────────────────────────────────────────────────────┤
│   Bạn đang cần làm gì?                                                   │
│   ┌────────────────────────────────────────────────────────────┐         │
│   │ 🔍  Tìm trong Trợ giúp: từ khoá, số hiệu văn bản, mô tả…   │         │ ← cao 48px
│   └────────────────────────────────────────────────────────────┘         │
│   Câu hỏi thường gặp:                                                    │
│   (Sắp nhập một lô dữ liệu) (Bị yêu cầu xoá dữ liệu cá nhân)             │ ← bấm → nạp truy vấn
│   (Ai ký trước khi công bố) (Vừa xảy ra sự cố) (Việc định kỳ hằng năm)   │
│                                                                          │
│   ⓘ Bạn đang đăng nhập vai trò Phê duyệt — xem 5 mục liên quan →         │ ← gợi ý, KHÔNG tự lọc
├──────────────────┬───────────────────────────────────────────────────────┤
│ THEO TÌNH HUỐNG  │   Duyệt & công bố                          5 mục      │
│ ● Tất cả    22   │   ┌─────────────────────────────────────────────┐     │
│ ○ Nhập & mô tả 3 │   │ Quy trình duyệt & xuất bản 9 bước           │     │
│ ○ Duyệt & c.bố 5 │   │ Hướng dẫn · Phê duyệt, Biên tập             │     │
│ ○ Dữ liệu cá.n 3 │   └─────────────────────────────────────────────┘     │
│ ○ Sự cố & an t 5 │   ┌─────────────────────────────────────────────┐     │
│ ○ Kết nối      3 │   │ Xin ý kiến Bộ VHTTDL khi số hoá bảo vật QG  │     │
│ ○ Kiểm kê & nk 3 │   │ Pháp lý · NĐ 308/2025 Điều 87 · Phê duyệt   │     │
│                  │   └─────────────────────────────────────────────┘     │
│ THEO VAI TRÒ     │   …                                                   │
│ (Quản trị) …     │                                                       │
│ ─────────────    │                                                       │
│ TRA THEO VĂN BẢN │                                                       │
│ → Danh mục 5 VB  │                                                       │
│   + 2 hết h.lực  │                                                       │
│ (position:sticky)│                                                       │
└──────────────────┴───────────────────────────────────────────────────────┘
```

Rail trái dùng đúng kỹ thuật đã có trong `ObjectsPage.module.css:78-95`:

```css
.layout {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  gap: 22px;
  align-items: start;      /* bắt buộc — thiếu thì sticky trong grid không chạy */
}
.rail { position: sticky; top: 16px; }
```

Thay đổi so với hiện tại: **đoạn dẫn 5 dòng cắt xuống 1 dòng** (hoặc thành nút "Trang này là gì? ▾") — nội dung triết lý không mất mà chuyển vào **khung "Ai xác nhận"** trong từng mục (mục 5), nơi nó có tác dụng thật thay vì làm rào chắn đầu trang. **Banner cảnh báo gọn còn 1 dòng**, mở rộng được, và **được đưa vào tập tìm kiếm** để sửa lỗi ở mục 2.7 — vẫn giữ vị trí cố định trên đầu. **Thẻ kết quả có dòng meta** (`Pháp lý · NĐ 308/2025 Điều 87 · Phê duyệt`), và tiêu đề luôn bắt đầu ở **cùng một mép trái** — sửa lỗi răng cưa 163px ở mục 2.4 vì pill xuống dòng dưới.

### 4.2 Màn hẹp (<1024px)

Lưu ý trung thực: ứng dụng **chưa thực sự đáp ứng điện thoại** — ở 375px thanh bên vẫn là dải biểu tượng và bảng dữ liệu tràn ngang. Mục tiêu thực tế của Hướng B là **máy tính bảng và cửa sổ hẹp (768–1024px)**, đúng tầm ngắt 1024px đã có ở `HelpPage.module.css:320`.

```
┌────────────────────────────────────┐
│ ⚠ 2 văn bản hết hiệu lực      [▾] │
├────────────────────────────────────┤
│  Bạn đang cần làm gì?              │
│  ┌──────────────────────────────┐  │
│  │ 🔍 Từ khoá, số hiệu, mô tả…  │  │ ← vẫn TRONG màn đầu
│  └──────────────────────────────┘  │
│  (Sắp nhập lô) (Xoá DLCN)       →  │ ← chip cuộn ngang 1 hàng
│  [Tình huống ▾]  [Vai trò ▾]       │ ← rail → 2 nút mở tấm chọn
│                                    │
│  Duyệt & công bố            5 mục  │
│  ┌──────────────────────────────┐  │
│  │ Quy trình duyệt 9 bước       │  │
│  │ Hướng dẫn · Phê duyệt        │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

Rail sticky **không** chuyển thành hàng chip ngang như `ObjectsPage.module.css:235-254`: 6 tình huống + 5 vai trò = 11 chip sẽ chiếm 3 hàng. Thay bằng **2 nút mở tấm chọn** (dùng lại `Modal.tsx`), hiển thị nhãn đang bật ngay trên nút. Ngân sách bắt buộc: ô tìm kiếm nằm trong **500px đầu tiên** ở mọi bề rộng (hiện tại 797px).

### 4.3 Trạng thái rỗng

Không dùng câu cụt "Không tìm thấy mục nào khớp — thử từ khoá khác." (`HelpPage.tsx:112`). Trạng thái rỗng phải **đưa người dùng đi tiếp**:

```
   Không tìm thấy mục nào cho «xoá vĩnh viễn».

   Thử một trong các cách sau:
   (Bị yêu cầu xoá dữ liệu cá nhân)  (Chính sách thời hạn lưu trữ)
   → Xem toàn bộ 23 mục
   → Tra theo số hiệu văn bản

   Câu hỏi pháp lý chưa có trong tài liệu này không được phần mềm trả lời.
   Đầu mối: cán bộ chuyên trách an toàn thông tin của Trung tâm.
```

Dòng cuối không phải câu xã giao — nó **lặp lại triết lý ngay tại điểm hệ thống bó tay**: phần mềm không biết thì nói không biết, và chỉ sang một con người.

---

## 5. Cách trình bày 4 phần của mục pháp lý

Đây là phần khó nhất, vì mọi thay đổi ở đây đều có nguy cơ làm sống lại cảm giác "hệ thống tự tuyên bố đã đạt" mà chủ đầu tư đã bác.

### 5.1 Nguyên tắc: ba ngữ pháp thị giác, không phải bốn nhãn giống nhau

Vấn đề của bản hiện tại không phải thiếu thông tin — mà là **bốn phần dùng chung một kiểu chữ** (mục 2.6), nên mắt không phân được *"phần mềm đưa anh cái này"* với *"anh phải tự làm cái kia"*. Quy ước cứng, áp cho mọi mục pháp lý:

| Chủ thể | Ngữ pháp thị giác | Áp cho |
|---|---|---|
| **Con người phải làm** | chữ `--ink` đậm nhất, gạch đầu dòng vuông, động từ mệnh lệnh | `donViTuLam` |
| **Con người xác nhận** | khung `--accent-soft`, nhãn chức danh | `trachNhiemXacNhan` |
| **Phần mềm hỗ trợ** | ô xám nhạt, thấp hơn một bậc, có mũi tên điều hướng | `heThongHoTro` |
| **Căn cứ pháp lý** | khối trích dẫn, gạch dọc trái, mã văn bản đơn sắc | `yeuCau` + `soHieuVanBan` + `dieuKhoan` |

### 5.2 Thứ tự mới, và vì sao

```
┌───────────────────────────────────────────────────────────────┐
│  Thông báo sự cố dữ liệu cá nhân trong 72 giờ                 │
│  Pháp lý · Sự cố, an toàn & sao lưu                           │
├───────────────────────────────────────────────────────────────┤
│  VIỆC ĐƠN VỊ PHẢI TỰ LÀM                                      │ ← (1) LÊN ĐẦU
│   ▪ Ghi nhận chính xác thời điểm PHÁT HIỆN sự cố…             │
│   ▪ Thông báo Bộ Công an (A05) trong hạn…                     │
│   ▪ Lưu hồ sơ vi phạm tối thiểu 5 năm…                        │
│                                                               │
│  ╭─────────────────────────────────────────────────────────╮  │
│  │ NGƯỜI CHỊU TRÁCH NHIỆM XÁC NHẬN                         │  │ ← (2) NGAY DƯỚI
│  │ Cán bộ chuyên trách ATTT (đầu mối thông báo A05);       │  │
│  │ Giám đốc Trung tâm được báo cáo song song.              │  │
│  │ Phần mềm không xác nhận thay được việc này.             │  │ ← câu CỐ ĐỊNH
│  ╰─────────────────────────────────────────────────────────╯  │
│                                                               │
│  ┌ CÔNG CỤ TRONG PHẦN MỀM ─────────────────────────────────┐  │ ← (3) hạ một bậc
│  │ Bảng sự cố & vi phạm dữ liệu với đồng hồ 72 giờ…        │  │
│  │ Đây là công cụ để làm, không phải xác nhận đã làm.      │  │ ← câu CỐ ĐỊNH
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  │ CĂN CỨ  Luật BVDLCN 91/2025/QH15 · Điều 23               │ ← (4) trích dẫn
│  │ "Thông báo sự cố/vi phạm dữ liệu cá nhân trong 72 giờ    │
│  │  (A05); lưu hồ sơ tối thiểu 5 năm."                      │
│                                                               │
│  Biểu mẫu tham khảo: [Quy trình 72h]                          │
└───────────────────────────────────────────────────────────────┘
```

Lý do đảo thứ tự: người mở mục này đang có một **việc phải làm gấp**. Đặt trích dẫn pháp lý lên đầu buộc họ đọc qua một câu luật mới tới được câu trả lời. Đặt việc-phải-làm lên đầu thì trả lời ngay, còn trích dẫn nằm dưới đúng vai trò của nó — **căn cứ**, thứ người ta xem khi cần chứng minh, không phải thứ đọc trước.

### 5.3 Bốn điều CẤM — hàng rào giữ triết lý

Đây là phần quan trọng nhất của mục 5. Đảo thứ tự làm tăng nguy cơ trang trông như bảng chấm điểm, nên kèm bốn ràng buộc cứng:

1. **Không ô đánh dấu tương tác.** `donViTuLam` hiển thị bằng dấu `▪` in sẵn, **không phải `<input type="checkbox">`**. Checkbox có trạng thái; trạng thái được lưu; lưu rồi thì hệ thống đang ghi nhận "đã đạt" — đúng thứ đã bị bác. Đây là danh sách **in ra để làm**, không phải danh sách để tích.
2. **Không đếm, không phần trăm, không thanh tiến độ.** Không bao giờ có "3/5 việc đã làm" hay "Tình huống này: 80%". Con số duy nhất được phép là **số mục** (22 mục, 5 mục).
3. **Không màu xanh lá, không dấu ✓, không nhãn "Đạt".** Bảng màu 7 chủ đề không có màu "thành công" và sẽ không thêm.
4. **Hai câu cố định phải luôn hiển thị**, không được gập vào "xem thêm": *"Phần mềm không xác nhận thay được việc này."* trong khung người ký, và *"Đây là công cụ để làm, không phải xác nhận đã làm."* trong khối công cụ. Chúng là bản dịch của đoạn dẫn 5 dòng hiện tại (`HelpPage.tsx:74-79`) từ **một cảnh báo đọc một lần ở đầu trang** thành **một nhắc nhở đọc mọi lần, tại đúng chỗ dễ hiểu nhầm**.

### 5.4 Khối "công cụ" — sửa lỗi danh sách mất dấu đầu dòng

Thay `<li display:flex>` (nguồn lỗi ở mục 2.6) bằng lưới các ô điều hướng:

```jsx
<div className={styles.toolGrid}>
  {support.map((item, i) => (
    item.href ? (
      <button key={i} className={styles.toolTile} onClick={() => navigate(item.href)}>
        <span className={styles.toolText}>{item.label}</span>
        <span className={styles.toolGo} aria-hidden="true">→</span>
      </button>
    ) : (
      <div key={i} className={styles.toolTileStatic}>{item.label}</div>
    )
  ))}
</div>
```

Ô **có** `href` là nút bấm được; ô **không** có `href` là khối tĩnh không giả vờ bấm được — phân biệt này quan trọng vì có mục nói thẳng "hiện chưa có màn cấu hình riêng" (`pl-dau-moi-bvdlcn`, `helpContent.ts:253`). Ô tĩnh phải trông đúng là ô tĩnh.

### 5.5 Mục hướng dẫn dùng cùng khung

Mục `huong-dan` không có 4 phần, chỉ có `steps` + `relatedRoute`. Vẫn dùng chung vỏ thẻ, chỉ đổi ruột: `steps` thành danh sách đánh số, `relatedRoute` thành **một** ô điều hướng — nhất quán về hình dạng, khác nhau về nội dung. Người dùng không cần biết trước mục nào thuộc loại nào.

---

## 6. Vẫn phải tra được theo số hiệu điều khoản

Đây là phản biện mạnh nhất chống Hướng B: *"Thanh tra hỏi Điều 21, anh tổ chức theo câu hỏi thì tra kiểu gì?"* Năm lớp trả lời, từ rẻ tới đắt:

**Lớp 1 — Tìm kiếm đã sẵn sàng, chỉ cần không phá.** `matchesHelpQuery` (`helpContent.ts:66-72`) đã quét `soHieuVanBan` và `dieuKhoan`, đi qua `normalizeForSearch` (`utils/search.ts:11-18`: bỏ dấu, hạ hoa thường, `đ→d`). Gõ `dieu 21`, `Điều 21`, `60/2024`, `356/2025` đều trúng ngay hôm nay. Hướng B **giữ nguyên hàm này**.

**Lớp 2 — Số hiệu luôn hiện trên thẻ kết quả.** Dòng meta mỗi thẻ (`Pháp lý · NĐ 308/2025 Điều 87 · Phê duyệt`) đảm bảo tìm theo số hiệu thì thấy số hiệu ở kết quả — không phải mở ra mới biết đúng mục chưa.

**Lớp 3 — Chế độ "Tra theo văn bản".** Một nút chuyển ngay cạnh ô tìm: `[ Theo tình huống ] [ Theo văn bản ]`. Bật "Theo văn bản" → danh sách nhóm lại **đúng như hiện tại**, theo `LEGAL_GROUP_ORDER` (`helpContent.ts:75-81`), thứ tự sổ đăng ký cũ. Hướng B **không xoá trục pháp lý, chỉ hạ nó xuống chế độ thứ hai**. Cán bộ tiếp thanh tra bật một nút là về đúng dạng sổ đăng ký quen thuộc.

**Lớp 4 — Danh mục văn bản ở chân rail trái.** Bảng liệt kê 5 văn bản đang áp dụng + 2 văn bản hết hiệu lực, mỗi dòng là liên kết lọc. Đây chính là *table of authorities* mà người thanh tra mong thấy, và nó **bao gồm cả 2 văn bản hết hiệu lực** — sửa lỗi ở mục 2.7.

**Lớp 5 — Đường dẫn chia sẻ được.** Đồng bộ truy vấn vào URL: `/help?q=Điều%2021`, `/help?vb=278-2025`, `/help?tinhhuong=su-co`. Có việc này thì một báo cáo hoặc email nội bộ dẫn được **thẳng tới đúng mục**, thay vì viết "vào trang Trợ giúp rồi cuộn tìm". Chi phí thấp (`useSearchParams` đã có sẵn), giá trị trình bày thầu cao.

---

## 7. Khả năng tiếp cận

### 7.1 Không làm tệ thêm vấn đề tương phản đã biết

Đã tính lại từ `deriveVars` (`ThemeContext.tsx:23-37`) và xác nhận con số 1,81:1 của chủ đề `crimson` đến từ **chữ `--ink` trên nền `--accent`**: `#151312` trên `#7a1f22` = **1,805:1** (ngưỡng AA là 4,5:1). Đây là hệ quả của việc `crimson` chọn `accent` **tối** (`#7a1f22`), vi phạm chính ràng buộc ghi ở `themes.ts:6-8` ("`accent` phải đủ SÁNG để chữ `ink` đọc được khi nằm trên nền accent").

Ràng buộc thi công rút ra cho Hướng B:

- **Mọi chip mới phải dùng mặc định của `TagChip`**: `activeBg = var(--ink)`, `activeFg = #ffffff` (`TagChip.tsx:27-28`) — an toàn ở cả 7 chủ đề vì `ink` luôn tối theo thiết kế. **Tuyệt đối không truyền `activeBg="var(--accent)"`.** Hướng B thêm khoảng 11 chip mới (6 tình huống + 5 vai trò), nên đây là rủi ro thật nếu không ghi rõ.
- **Cặp `--accent-text` trên `--accent-soft` là an toàn** — tôi tính hai chủ đề rủi ro nhất: `gold` **7,44:1**, `crimson` **11,59:1**. Đây là cặp dùng cho khung "Người chịu trách nhiệm xác nhận" và pill mã văn bản.
- **Banner cảnh báo giữ nguyên màu cố định** `#7a2f0f` trên `#ffd9c2` = **7,12:1** — không phụ thuộc chủ đề, không cần đổi.

### 7.2 Các điểm còn lại

- **Vùng thông báo động.** Bộ đếm kết quả hiện là `<span>` trơ (`HelpPage.tsx:103`). Bọc `aria-live="polite"` để người dùng trình đọc màn hình nghe được "5 mục" sau khi lọc — hiện tại họ lọc xong mà không biết gì đã đổi.
- **Chip câu hỏi ≠ chip lọc.** Chip câu hỏi *nạp truy vấn rồi biến mất*, không phải trạng thái bật/tắt. Vì vậy **không dùng `TagChip`** cho chúng — `TagChip` bắt buộc gắn `aria-pressed` (`TagChip.tsx:45`), gây hiểu nhầm là công tắc. Dùng `<button>` riêng, không `aria-pressed`.
- **Accordion.** Giữ `aria-expanded` (`HelpPage.tsx:123`) và **bổ sung `aria-controls`** trỏ tới `id` phần thân — hiện thiếu. Mở/đóng không được cướp tiêu điểm.
- **Nhãn ô tìm.** Giữ `<label>` ẩn thị giác đang có (`HelpPage.tsx:93-94` + `.visually-hidden` ở `global.css:63-73`). Ô tìm lớn hơn không có nghĩa bỏ nhãn.
- **Không dùng phím tắt `/`.** Bộ gõ tiếng Việt làm phím tắt một ký tự thành bẫy. Nếu cần thì `Alt+/`, và **phải gắn trình xử lý thật** — không lặp lại lỗi huy hiệu `⌘F` ở `Header.tsx:49` vốn chỉ là trang trí, không có bộ lắng nghe nào.
- **Không phân biệt bằng màu đơn thuần.** Ba "ngữ pháp thị giác" ở mục 5.1 phân biệt bằng **nhãn chữ + bố cục + dấu đầu dòng**, màu chỉ là lớp gia cố — bắt buộc, vì 7 chủ đề đổi sắc độ hoàn toàn.
- **Vùng chạm ≥44px** cho chip và ô điều hướng ở màn hẹp (chip hiện `padding: 8px`).

---

## 8. Chi phí thi công + rủi ro

| Hạng mục | Người-ngày |
|---|---|
| Thêm `situation` + `roles` vào 23 mục; viết 8–10 câu hỏi gợi ý | 1,0 |
| Logic nhóm theo tình huống, lọc vai trò, đồng bộ URL (`useSearchParams`) | 0,5 |
| Bố cục mới: rail dính, ô tìm lớn, thẻ kết quả, banner gọn | 1,0 |
| Thiết kế lại thân mục pháp lý (mục 5) + sửa lỗi `.supportItem` | 1,0 |
| Chế độ "Theo văn bản" + danh mục văn bản + đưa mục cảnh báo vào tìm kiếm | 0,5 |
| Trạng thái rỗng + đường phục hồi | 0,25 |
| Rà tiếp cận: 7 chủ đề, `aria-live`, `aria-controls`, màn hẹp | 0,75 |
| Sửa theo góp ý vòng 1 | 0,5 |
| **Tổng** | **≈ 5,5 người-ngày** |

Chưa tính thời gian **chủ đầu tư duyệt nội dung** (bảng ánh xạ 22 mục → 6 tình huống và văn phong 10 câu hỏi). Đây là việc của họ, nhưng nằm trên đường găng — xem R1.

| # | Rủi ro | Mức | Giảm thiểu |
|---|---|---|---|
| R1 | Bảng ánh xạ tình huống là quyết định **nội dung**, không phải kỹ thuật. Chủ đầu tư không duyệt → làm lại phần lớn | **Cao** | Duyệt bảng ở mục 3 **trên giấy trước khi viết dòng mã nào**. Bảng đó chính là hợp đồng. |
| R2 | Hai ô tìm kiếm trên cùng màn hình, hành vi khác hẳn nhau (mục 2.5) | **Cao** | Đổi placeholder ô của trang thành *"Tìm trong Trợ giúp…"*; đặt trong khối có tiêu đề "Bạn đang cần làm gì?". Giải pháp gốc — cho ô toàn cục tìm cả trợ giúp — nằm ngoài phạm vi. |
| R3 | 11 chip mới có thể vô tình dùng nền `--accent` → 1,81:1 ở chủ đề `crimson` | Trung bình | Chỉ dùng mặc định `TagChip`; thêm mục kiểm tra bắt buộc "duyệt qua cả 7 chủ đề" trước bàn giao. |
| R4 | Văn phong 10 câu hỏi nghe như quảng cáo, lạc tông cơ quan nhà nước | Trung bình | Dùng đúng động từ nghiệp vụ đã có trong ứng dụng; chủ đầu tư duyệt từng câu cùng R1. |
| R5 | Hồi quy dữ liệu pháp lý | **Thấp** | Không đụng `yeuCau`/`soHieuVanBan`/`dieuKhoan`/`trachNhiemXacNhan`. Chỉ **thêm** trường. ADR-0014 nguyên vẹn. |
| R6 | Không có kiểm thử tự động cho trang này | Trung bình | Thêm test cho `matchesHelpQuery` với truy vấn số hiệu (`dieu 21`, `60/2024`, `13/2023`) — rẻ và chặn đúng lỗi ở mục 2.7. |

---

## 9. Hướng này THUA ở đâu

Bốn điểm yếu thật. Nếu bị phản biện, tôi sẽ không cãi những điểm này.

### 9.1 Với 23 mục, tìm-kiếm-trước là dùng dao mổ trâu giết gà

Đây là điểm yếu nghiêm trọng nhất. Ô tìm lớn + hàng câu hỏi gợi ý + rail lọc chiếm khoảng **200–260px đầu trang** để phục vụ một tập nội dung mà **cuộn hai vòng là hết**. Tìm-kiếm-trước là mẫu thiết kế sinh ra cho kho tài liệu hàng trăm–hàng nghìn mục (Stripe Docs, NHS.uk), nơi duyệt-bằng-mắt bất khả thi. Ở n=23, duyệt-bằng-mắt **hoàn toàn khả thi**.

Một hướng đối lập — bảng chỉ mục 2 cột, mọi tiêu đề nhìn thấy ngay, không accordion, không ô tìm nổi bật — nhiều khả năng cho **tốc độ tìm tương đương** với **ít mã hơn hẳn** và ít rủi ro phân loại sai hơn. Hướng B chỉ thắng rõ rệt khi nội dung lớn lên 50–100 mục, mà **không có cam kết nào** cho thấy điều đó sẽ xảy ra trong phạm vi thầu.

Phản biện của tôi chỉ đúng một phần: vấn đề thật của trang hiện tại không phải "quá nhiều mục" mà là "mỗi mục quá cao" (515px/mục, mục 2.1) và "nhóm vô nghĩa" (mục 2.2) — cả hai **có thể sửa mà không cần tìm-kiếm-trước**. Phần thực sự cần Hướng B chỉ là câu hỏi số 8 ("việc định kỳ hằng năm"): một trường hợp, không phải mười.

### 9.2 Trục "tình huống" là phỏng đoán, và nó đánh đổi mất tính khách quan

6 nhóm tình huống và 10 câu hỏi ở mục 3 do tôi suy ra **từ đọc mã nguồn**, không phải từ phỏng vấn cán bộ Trung tâm. Không có dữ liệu người dùng nào chống lưng.

Nguy hiểm hơn: trục văn bản pháp luật tuy khô khan nhưng **khách quan tuyệt đối** — không ai tranh cãi được mục "Điều 21 Luật Dữ liệu" nằm ở nhóm nào. Trục tình huống thì **chủ quan**: `pl-danhmuc-mo` (công khai danh mục dữ liệu mở) tôi xếp vào "Duyệt & công bố", nhưng xếp vào "Kết nối & báo cáo cấp trên" cũng hợp lý ngang. Nếu người dùng đoán khác tôi, họ mở nhóm sai, không thấy, và **kết luận tài liệu không có nội dung đó** — hỏng nặng hơn hiện trạng, vì hiện trạng ít nhất còn cho cuộn hết 22 mục và tự thấy.

Ô tìm kiếm là lưới an toàn cho việc này, nhưng lưới chỉ cứu được người **nghĩ tới việc gõ tìm**. Người quen duyệt danh mục sẽ rơi thẳng qua lưới.

### 9.3 Chất lượng tìm kiếm phụ thuộc hoàn toàn vào mảng `keywords` viết tay

`matchesHelpQuery` là so khớp chuỗi con thuần tuý trên `title`, `group`, `soHieuVanBan`, `dieuKhoan`, `yeuCau` và `keywords` (`helpContent.ts:70-71`). **Không có từ đồng nghĩa, không tách từ, không sửa lỗi gõ, không xếp hạng liên quan.**

Hệ quả cụ thể: gõ `"bảo mật"` ra **0 kết quả** vì toàn bộ nội dung dùng từ "an toàn thông tin". Gõ `"xoá vĩnh viễn"` ra 0. Gõ `"GDPR"` ra 0. Người dùng gõ đúng thuật ngữ trong `keywords` (`helpContent.ts:41`) thì trúng, gõ từ đời thường thì trượt.

Một hướng đặt tìm kiếm làm trục chính mà tìm kiếm lại giòn như vậy là **đặt cược vào chi tiết yếu nhất của hệ thống**. Trang hiện tại giấu ô tìm ở y=349 nên khiếm khuyết này ít lộ; Hướng B đưa nó ra giữa màn hình, mọi lần trượt đều thành thất bại nhìn thấy được. Sửa đúng nghĩa cần một lớp từ đồng nghĩa viết tay — thêm chi phí, **không nằm trong 5,5 người-ngày ở mục 8**.

### 9.4 Người chấm thầu không phải người dùng cuối

Hướng B tối ưu cho **cán bộ vận hành đang kẹt giữa một công việc**. Nhưng tài liệu này nằm trong hồ sơ chấm thầu, và hội đồng chấm thường quét theo một câu hỏi khác: *"có đủ căn cứ pháp lý không?"*

Một trang mở ra bằng ô tìm kiếm lớn và các câu hỏi đời thường ("Sắp nhập một lô dữ liệu") trông **ít giống hồ sơ pháp lý** hơn một bảng liệt kê văn bản theo số hiệu. Mục 6 (chế độ "Theo văn bản" + danh mục văn bản) sinh ra để bù đúng điểm này — nhưng nó là **bù, không phải hoà**: chế độ mặc định vẫn là trục tình huống, và ấn tượng đầu tiên vẫn là ô tìm kiếm. Nếu ưu tiên là ghi điểm với hội đồng chấm chứ không phải phục vụ người vận hành, Hướng B là lựa chọn sai và tôi sẽ nói thẳng như vậy.

---

## 10. Tham chiếu

**Cơ quan quản lý tự tổ chức luật theo câu hỏi — tham chiếu sát nhất.** ICO (cơ quan bảo vệ dữ liệu Anh) trình bày "Guide to the UK GDPR" theo câu hỏi ("What is personal data?", "How do we respond to a request?"), giữ số hiệu điều khoản làm siêu dữ liệu trong từng trang. Đây là bằng chứng mạnh nhất chống lại phản biện *"tài liệu pháp lý thì phải sắp theo văn bản"*: chính cơ quan ban hành hướng dẫn cũng không sắp theo số điều. Đối chiếu với gdpr-info.eu — vẫn điều hướng theo số điều — cho thấy hai trục phục vụ hai đối tượng khác nhau và **cả hai tồn tại song song**, đúng mô hình hai chế độ ở mục 6.

**GOV.UK — tiêu đề là việc người dùng cần làm, không phải tên văn bản.** Nguyên tắc content design của GOV.UK ("start with user needs") tạo ra các trang tên kiểu "Check if you need a visa" thay vì tên đạo luật. GOV.UK Design System còn có mẫu *task list* gần với khối `donViTuLam` ở mục 5 — đáng chú ý là mẫu đó dùng **nhãn trạng thái do con người đặt**, không tự động tính, cùng tinh thần với điều cấm 1 và 2 ở mục 5.3.

**NHS.uk — tìm-kiếm-trước cho tra cứu áp lực cao.** Người truy cập đến với một triệu chứng cụ thể, không đọc từ đầu; ô tìm là trung tâm và nội dung tổ chức theo tình huống. Chính là kịch bản câu hỏi 3 và 4 ở mục 3.

**Stripe Docs / Microsoft Learn — lọc theo vai trò.** Cả hai cho lọc nội dung theo vai trò người đọc, và quan trọng là **hiển thị bộ lọc đang bật một cách hiển ngôn**, không lọc ngầm. Đây là lý do mục 4.1 đề xuất gợi ý *"Bạn đang đăng nhập vai trò Phê duyệt — xem 5 mục liên quan →"* thay vì tự động lọc theo `useAuth()` (`AuthContext.tsx:82-86`): trang này mở cho **mọi** vai trò kể cả `Chỉ xem` (`HelpPage.tsx:21-22`), nên lọc ngầm sẽ giấu nội dung một cách khó hiểu.

**Đối chiếu trong nước.** thuvienphapluat.vn tổ chức theo số hiệu văn bản — đúng mô hình trang hiện tại, phục vụ người đã biết mình cần văn bản nào. Cổng Dịch vụ công Quốc gia tổ chức theo **thủ tục** ("Cấp đổi giấy phép lái xe") — đúng mô hình Hướng B, phục vụ người biết việc mình cần làm nhưng không biết văn bản nào điều chỉnh. Cán bộ Trung tâm thuộc nhóm thứ hai.

**Nền tảng lý thuyết.** Nielsen Norman Group phân biệt "search-dominant" và "link-dominant users" và khuyến nghị phục vụ cả hai — cơ sở cho việc Hướng B **không xoá** trục văn bản mà giữ nó làm chế độ thứ hai (mục 6, lớp 3), thay vì thay thế hoàn toàn.
