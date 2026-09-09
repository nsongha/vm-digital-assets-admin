# Kịch bản demo 10 phút

*Cập nhật 12/08/2026. Kế thừa khung phút-by-phút từ báo cáo phản biện nội bộ (red-team, mục D), cập nhật khớp với ứng dụng thực tế theo `00-ke-hoach-nang-cap.md` (nhóm màn hình A/B/C) và tên màn hình thống nhất với `03-ma-tran-truy-vet.md`.*

## Vai trò của tài liệu

Tài liệu này là kịch bản trình diễn dùng khi bảo vệ hồ sơ trước hội đồng chấm thầu. Nó không lặp lại phần thuyết minh kỹ thuật, mà quy định **chính xác từng phút nên làm gì, nói gì, và tuyệt đối tránh thao tác nào** — vì trong 10 phút demo, một cú bấm sai vào đúng chỗ chưa hoàn thiện có thể làm mất toàn bộ ấn tượng đã xây dựng ở phần thuyết minh giấy. Kịch bản này giả định các hạng mục P0 trong kế hoạch nâng cấp (nhóm A: sửa nền; các màn B2 Báo cáo–Thống kê, B1 Đăng nhập, nút "Trả lại bổ sung" ở C1) **đã hoàn thành** — người trình diễn cần xác nhận lại bằng checklist ở cuối tài liệu trước khi bước vào phòng bảo vệ.

**Nguyên tắc số 1:** chỉ đi những con đường đã được kiểm tra trước — nếu một hạng mục trong checklist chưa đạt, bỏ hẳn đoạn kịch bản tương ứng thay vì ứng biến tại chỗ.
**Nguyên tắc số 2:** kể một câu chuyện nghiệp vụ có nhân vật, không đi lần lượt từng menu. Hội đồng chán menu, nhớ câu chuyện.
**Nguyên tắc số 3:** chuẩn bị sẵn 2 tab dự phòng (trình xem splat mở sẵn, file Excel báo cáo mẫu) để không bao giờ phải nói "cái này chưa có".

**Câu chuyện xuyên suốt:** *"Hôm nay là ngày 12/8. Tổ số hóa vừa quét xong nội thất điện Đại Thành. Xin mời hội đồng theo dõi tài sản này đi từ lúc cán bộ đăng nhập vào hệ thống, đến khi phục vụ được công chúng và cơ quan bạn."*

---

## Bảng phút-by-phút

> **Lưu ý điều phối thời gian đoạn Đăng nhập (0:20–1:00):** 40 giây chỉ đủ cho **một** lần đăng nhập với thông tin đã điền sẵn. **Không đăng xuất rồi đăng nhập lại vai thứ hai trên sân khấu** — sẽ vỡ nhịp. Nếu muốn cho hội đồng thấy phân quyền đổi theo vai, hãy mở sẵn **tab thứ hai đã đăng nhập bằng vai trò hạn chế hơn** (ví dụ Chỉ xem) trước khi vào phòng, và chỉ cần chuyển tab: *"Cùng hệ thống, nhưng đăng nhập bằng vai Chỉ xem thì ba mục Quản trị này biến mất."* Thao tác chuyển tab mất 5 giây thay vì 40 giây.

| Phút | Nội dung | Điều phải nói | Bẫy phải né |
|---|---|---|---|
| **0:00–0:20** | **Mở đầu** — chưa mở phần mềm | *"Trung tâm đang quản lý di tích quốc gia đặc biệt theo Quyết định 548/QĐ-TTg, trong đó 82 bia Tiến sĩ là Di sản tư liệu thế giới được UNESCO ghi danh năm 2010 và 2011."* | Nói được **548/QĐ-TTg** và **UNESCO 2010/2011** ngay câu đầu, không cần mở máy — 20 giây đắt giá nhất buổi demo |
| **0:20–1:00** | **Đăng nhập** — màn khởi đầu thật sự của app | Đăng nhập bằng tài khoản demo, **chọn vai trò** (ví dụ: Trưởng phòng số hóa) → *"Menu bên trái đổi theo vai trò đăng nhập — chuyên viên không thấy mục Người dùng, không thấy nút Xuất bản."* Đăng xuất, đăng nhập lại nhanh với vai **Chỉ xem** để đối chiếu ngay trước mắt hội đồng: menu thu gọn lại | Chọn hai vai trò có **khác biệt rõ ràng** về quyền, đừng chọn hai vai gần giống nhau. Không bấm nút Quên mật khẩu/SSO nếu luồng đó chưa nối |
| **1:00–1:45** | **Tổng quan** | Chỉ vào 4 ô chỉ số và quy trình số hóa 5 bước, đọc số công khai, rồi **chủ động mời hội đồng**: *"Xin mời một thầy/cô bấm thử vào bất kỳ ô nào — pipeline, bộ sưu tập, dung lượng — mọi con số ở đây tính trực tiếp từ cùng một kho dữ liệu, không có số ghi cứng."* | Đây là chỗ **biến điểm yếu cũ (số liệu tự mâu thuẫn) thành điểm mạnh chủ động** — mời trước khi bị hỏi. Chỉ làm khi đã xác nhận ở checklist rằng mọi con số đã nhất quán |
| **1:45–3:15** | **Nhập dữ liệu theo lô** — điểm mạnh thật của sản phẩm | Chọn 6 tệp + bảng Excel → phân tích → *"Hệ thống tự ghép tệp với dòng metadata theo mã tài sản, phát hiện 2 dòng thiếu tệp và 1 tệp sai độ phân giải: yêu cầu TIFF 600dpi. Nó không cho dữ liệu kém chất lượng lọt vào kho."* → bấm Nhập, cho chạy thanh tiến trình | **Đòn phủ đầu:** tự nói ra tệp lỗi. Chủ động chỉ ra lỗi = hệ thống nghiêm ngặt; bị hội đồng chỉ ra = hệ thống lỗi |
| **3:15–4:45** | **Chi tiết tài sản + xem 3D/splat** — cao trào | Mở tài sản Bia Tiến sĩ khoa Nhâm Tuất 1442, **xoay mô hình 3D**: *"Bia dựng năm 1484 đợt đầu tiên thời Lê Thánh Tông. Scan 0,2mm, bản gốc giữ nguyên, bản tối ưu để phục vụ web, kèm mã kiểm tra toàn vẹn SHA-256 để 10 năm sau vẫn biết tệp còn nguyên vẹn hay đã hỏng."* Sau đó, **nếu dữ liệu thật đã copy từ NAS**, mở thêm tài sản Giếng Thiên Quang: *"Đây là dữ liệu Gaussian splat quét thật, trình xem đã nối trực tiếp — không còn là ảnh xem trước."* | **Đây là 90 giây ăn điểm cao nhất — kéo dài nó.** Chỉ mở Giếng Thiên Quang nếu checklist xác nhận đã copy `.ply` từ NAS về máy trình diễn; nếu chưa, dùng dữ liệu mẫu sẵn có trong app và không nhắc đến "dữ liệu thật" |
| **4:45–5:45** | **Duyệt & xuất bản** — luồng trả lại | *"Chuyên viên trình → trưởng phòng thẩm định nội dung → lãnh đạo duyệt xuất bản. Người tải lên không được tự duyệt."* Bấm nút **"Trả lại bổ sung"**, gõ lý do *"Đề nghị bổ sung phiên âm và dịch nghĩa minh văn"* → mở lại ở vai phụ trách, bổ sung → duyệt → xuất bản | Ưu tiên bấm **Trả lại** trước, không bấm Duyệt ngay. Hội đồng nhà nước quan tâm luồng trả lại hơn luồng thuận, vì đó là thực tế công việc của họ |
| **5:45–6:45** | **Tìm kiếm** — mời hội đồng tự gõ | *"Xin mời một thầy/cô gõ thử."* Nếu không ai gõ, tự gõ **"khue van cac" không dấu** → ra kết quả → *"Hệ thống tìm được cả khi gõ không dấu, và tìm trong cả mô tả, bộ sưu tập, người phụ trách — không chỉ tên tài sản."* | Chỉ mời hội đồng gõ sau khi checklist xác nhận tìm kiếm đã bỏ dấu hai chiều; nếu chưa chắc, tự gõ đúng một từ khóa an toàn có dấu |
| **6:45–7:45** | **Báo cáo – Thống kê** | Mở màn **Báo cáo – Thống kê**: *"Đây là thứ Ban Giám đốc cần: tiến độ số hóa theo tháng, cơ cấu theo loại hình, tồn đọng theo phòng, lượt khai thác API."* → bấm **Xuất Excel** → mở file thật → *"Báo cáo gửi Sở lấy trực tiếp ở đây, không phải tổng hợp tay."* | Màn này đã hoàn thành và số liệu khớp với Tổng quan (cùng một nguồn dữ liệu) — trình bày dứt khoát, không cần rào trước đón sau |
| **7:45–8:45** | **Kết nối & chia sẻ** | *"Kết nối ra ngoài đi qua trục LGSP của Thành phố, tuân thủ Nghị định 278/2025/NĐ-CP về kết nối, chia sẻ dữ liệu số của cơ quan nhà nước. Bảng phía trên là chỉ đạo/báo cáo cơ quan chủ quản — Sở Văn hóa & Thể thao Hà Nội; bảng phía dưới là yêu cầu chia sẻ từ cơ quan, tổ chức ngoài."* Mở modal cấu hình một kết nối → *"Bật/tắt, tần suất đồng bộ, khóa xác thực — cán bộ tự quản lý được, không cần gọi nhà thầu."* | Dùng đúng căn cứ pháp lý hiện hành (NĐ 278/2025), **không nhắc đến Nghị định 47/2020** — văn bản này đã bị bãi bỏ. Nhấn mạnh "không cần gọi nhà thầu" — đơn vị sự nghiệp sợ nhất là bị phụ thuộc |
| **8:45–9:30** | **An toàn & liên tục** — chủ động đánh phủ đầu | Mở **Nhật ký nâng cao**: *"Mọi thao tác đều lưu vết, không sửa được, xuất ra được để phục vụ thanh tra."* Chỉ vào thẻ sao lưu → bấm **Sao lưu ngay** → *"Sao lưu tự động hằng ngày, bản sao lưu ở vị trí thứ hai. Cam kết mất tối đa 24 giờ dữ liệu và khôi phục trong 4 giờ. Hằng năm diễn tập phục hồi và có biên bản."* | Đây là câu trả lời cho "mất điện thì sao" — **nói trước khi bị hỏi**. Trả lời trước = chuyên nghiệp; trả lời sau = chống chế |
| **9:30–10:00** | **Chốt** | *"Giai đoạn 1 giải quyết việc giữ, tra cứu và chia sẻ có kiểm soát dữ liệu, nghiệm thu trong X tháng. Giai đoạn 2 mở ra công chúng: cổng tham quan số, song ngữ Việt–Anh–Pháp, nhận dạng chữ Hán Nôm. Giai đoạn 1 dùng được độc lập kể cả khi giai đoạn 2 chưa bố trí vốn. Xin cảm ơn hội đồng."* | Câu **"giai đoạn 1 dùng được độc lập"** rất được lòng chủ đầu tư nhà nước, vì họ luôn lo vốn giai đoạn 2 không về |

---

## Chuẩn bị cho vòng hỏi vặn — 8 câu chắc chắn bị hỏi

| Câu hỏi | Trả lời trong 20 giây |
|---|---|
| *"Bấm vào cái này thì sao?"* (chỉ nút bất kỳ) | Người demo phải thuộc lòng danh sách nút gắn nhãn "Giai đoạn 2" và trả lời thẳng: *"Chức năng này thuộc giai đoạn 2, thưa hội đồng"* — **không bấm liều**. Bấm liều vào nút chưa nối làm mất điểm gấp đôi so với thừa nhận |
| *"Dữ liệu này ở đâu ra?"* | *"Đây là bộ dữ liệu trình diễn khoảng 150 tài sản, sinh từ danh mục hiện vật thật của Trung tâm và đã được nhóm triển khai đối chiếu nguồn — chi tiết tại Phụ lục danh mục fact di sản đã đối chiếu. Toàn bộ sẽ được nhập lại và thẩm định lại cùng cán bộ chuyên môn của Trung tâm trước khi vận hành chính thức."* |
| *"Mất điện thì sao?"* | Đã trả lời ở phút 8:45. Nếu vẫn hỏi: *"RPO 24 giờ, RTO 4 giờ, sao lưu 3-2-1, bản sao ngoài site, diễn tập phục hồi hằng năm có biên bản."* |
| *"Ai trực hệ thống?"* | *"Đề xuất 1 quản trị hệ thống kiêm nhiệm của Trung tâm và 1 cán bộ đầu mối dữ liệu. Nhà thầu trực hỗ trợ theo SLA: sự cố nghiêm trọng tiếp nhận trong 1 giờ, khắc phục trong 4 giờ, trong suốt 12 tháng bảo hành."* |
| *"Sao chỉ có khoảng 150 dòng, không phải toàn bộ kho di sản?"* | *"Đây là bộ dữ liệu trình diễn đủ lớn để phân trang, lọc, và mọi con số thống kê đều tự tính đúng — hội đồng vừa tự kiểm chứng ở màn Tổng quan. Bản triển khai nạp toàn bộ số lượng thực tế theo sổ kiểm kê hiện hành của Trung tâm; kiến trúc hệ thống không giới hạn số bản ghi."* |
| *"Có tiếng Anh không?"* | *"Giao diện đã tách lớp đa ngữ ngay từ giai đoạn 1 — toàn bộ chuỗi hiển thị nằm trong một tệp cấu hình riêng, tiếng Việt đã hoàn chỉnh. Tiếng Anh và tiếng Pháp thuộc giai đoạn 2, chỉ cần dịch nội dung vào đúng chỗ đã chừa sẵn, không phải làm lại kiến trúc."* |
| *"Chi phí vận hành mỗi năm bao nhiêu?"* | Mở thẳng bảng Chương 16 (thuyết minh kỹ thuật). Nhà thầu nào không trả lời được câu này thường bị loại |
| *"Dữ liệu có ra nước ngoài không?"* | *"Không. Hệ thống đặt tại hạ tầng trong nước, toàn bộ tài nguyên tĩnh (font, ảnh) đóng gói nội bộ, không gọi dịch vụ ngoài lãnh thổ."* — chỉ nói được câu này sau khi checklist xác nhận đã gỡ Google Fonts và Wikimedia |

---

## Checklist 30 phút trước demo

**Tab và cửa sổ mở sẵn**
- [ ] Tab 1 (chính): app ở màn **Đăng nhập**, đã đăng xuất sạch, chưa có phiên nào còn hiệu lực
- [ ] Tab 2 (dự phòng): trình xem splat Giếng Thiên Quang mở sẵn, đã load xong một lần (tránh chờ dựng lại giữa demo)
- [ ] Tab 3 (dự phòng): file Excel báo cáo mẫu đã xuất trước, mở sẵn trong Excel/LibreOffice cục bộ — phòng khi nút Xuất Excel không phản hồi kịp lúc demo
- [ ] Đóng mọi tab/ứng dụng không liên quan, tắt thông báo hệ thống, tắt trình cập nhật tự động

**Ứng dụng kèm theo (nhóm KHAI THÁC)**
- [ ] Ứng dụng GS Immersive Tour đã khởi động ở cổng 5174 (lệnh in sẵn ngay trong màn Biên tập khi
  chưa kết nối được) — mở thử `/editor` và `/spatial`, xác nhận không hiện bảng "chưa thấy ứng dụng"
- [ ] Nếu không demo phần tour 3D: vẫn phải mở thử một lần — mục Khai thác nằm trên thanh điều
  hướng, hội đồng có thể tự bấm vào

**Dữ liệu phải nạp**
- [ ] Xác nhận mock data đã ở mức ~150 bản ghi và tổng các ô thống kê (pipeline, bộ sưu tập, dung lượng) khớp nhau khi bấm thử
- [ ] Xác nhận đã copy dữ liệu thật giếng Thiên Quang (`.ply`) từ NAS vào máy trình diễn; nếu **chưa** copy được, gạch bỏ đoạn "dữ liệu thật" ở phút 3:15–4:45 và dùng dữ liệu mẫu có sẵn
- [ ] Tài khoản demo cho từng vai trò (Chuyên viên, Trưởng phòng, Chỉ xem, Quản trị) đăng nhập thử thành công, mật khẩu ghi sẵn ở nơi chỉ người trình diễn thấy được
- [ ] Tài sản dùng trong câu chuyện demo (Bia Tiến sĩ khoa Nhâm Tuất, Giếng Thiên Quang) đã kiểm tra mở được, không lỗi tải

**Kiểm tra không phụ thuộc Internet**
- [ ] Ngắt Wi-Fi/mạng, tải lại toàn bộ app từ đầu — xác nhận font hiển thị đúng, ảnh bìa bộ sưu tập hiển thị đầy đủ (không phải ảnh vỡ do gọi `fonts.googleapis.com` hoặc `commons.wikimedia.org`)
- [ ] Kiểm tra console trình duyệt không còn request ra ngoài miền nội bộ khi mạng đã ngắt
- [ ] Bật lại mạng sau khi kiểm tra xong

**Nút tuyệt đối không bấm nếu chưa nối**
- [ ] Rà lại danh sách nút còn gắn nhãn "Giai đoạn 2" tại thời điểm demo (tuỳ tiến độ sửa, có thể còn: Tạo lại API key, Chuông thông báo, Cài đặt, Tải mẫu Excel, ô chat "Hỏi trợ lý", + Tạo bộ sưu tập) — người trình diễn đọc lại danh sách này ngay trước khi vào phòng
- [ ] Không mở thẻ bộ sưu tập hoặc bấm sâu vào bất kỳ số liệu nào chưa tự kiểm tra lại trong ngày demo, kể cả khi đã sửa trước đó — dữ liệu có thể bị ghi đè trong lúc phát triển

**Phương án dự phòng khi mất mạng tại phòng bảo vệ**
- [ ] App chạy hoàn toàn cục bộ (không cần Internet) — nếu mạng phòng họp chập chờn, vẫn demo bình thường trên máy đã kiểm tra ở bước "không phụ thuộc Internet" bên trên
- [ ] Nếu máy trình diễn gặp sự cố phần cứng: mang theo máy dự phòng thứ hai đã cài sẵn và kiểm tra tương đương
- [ ] Nếu cả hai máy đều gặp sự cố: dùng video quay màn hình đã dựng sẵn (độ dài 10 phút, đúng kịch bản) làm phương án cuối cùng, kèm bản in màu các màn hình chính để minh họa khi trình chiếu video
