# Ma trận truy vết ba chiều — Wireframe × Màn hình ứng dụng × Căn cứ pháp lý × Chuẩn quốc tế

*Cập nhật 11/08/2026. Nguồn: 7 wireframe hồ sơ thầu (`mokcup/Hinh 3.5-1` → `3.5-7`), Kế hoạch nâng cấp IA v3 (`docs/00-ke-hoach-nang-cap.md`), báo cáo pháp lý đã xác minh (`legal-main.md`, `heritage-law.md`, `pdpl-verify.md`).*

## Vai trò của tài liệu

Tài liệu này là cầu nối chứng minh mức độ phủ yêu cầu giữa ba lớp của bộ hồ sơ: (1) **7 hình vẽ minh họa giao diện** (Hình 3.5-1 đến 3.5-7) trong thuyết minh giải pháp, thể hiện tầm nhìn sản phẩm đầy đủ qua hai giai đoạn; (2) **ứng dụng admin đang được xây dựng** theo Kế hoạch nâng cấp IA v3, với các nhóm màn hình A (sửa nền), B (màn hình mới), C (nâng cấp màn sẵn có); và (3) **căn cứ pháp lý đã xác minh trực tiếp từ văn bản gốc** trong quá trình rà soát hồ sơ. Hội đồng chấm thầu thường tra cứu bảng đối chiếu yêu cầu ↔ trang thuyết minh đầu tiên (xem PL1 trong outline thuyết minh kỹ thuật); ma trận này là dữ liệu nền cho bảng đó, đồng thời là công cụ nội bộ để nhóm triển khai biết chính xác từng use case trong wireframe đã được hiện thực ở đâu.

**Ghi chú đọc bảng — bắt buộc đọc trước khi dùng:**

1. **Wireframe** = hình minh họa trong hồ sơ thầu (Hình 3.5-x), mô tả tầm nhìn sản phẩm đầy đủ, gồm cả phần **cổng khai thác** (không gian 3D toàn khu, dữ liệu kỹ thuật công trình, điểm tham quan công chúng) lẫn phần **quản trị nội bộ** (CMS nội dung, duyệt xuất bản, tài khoản phân quyền). Hai nhóm này không cùng một ứng dụng.
2. **App demo** = ứng dụng admin đang xây dựng, phạm vi **Giai đoạn 1**, theo đúng tên màn hình trong `00-ke-hoach-nang-cap.md`. Khi wireframe mô tả tính năng mà app demo giai đoạn 1 chưa có, cột "Màn hình app đáp ứng" ghi trung thực **"Giai đoạn 2"** kèm giải thích — không gộp lẫn để tránh hội đồng hiểu nhầm là đã có sẵn.
3. Cột **"Văn bản pháp lý"** chỉ liệt kê điều khoản mang nhãn **[ĐÃ XÁC MINH]** (đọc trực tiếp từ Công báo/văn bản gốc hoặc đối chiếu ≥ 2 nguồn độc lập) trong ba báo cáo pháp lý nguồn. Điều khoản còn cờ ⚠️/[CHƯA CHẮC]/[KHÔNG XÁC MINH ĐƯỢC] trong các báo cáo đó **không được đưa vào bảng này** — xem báo cáo gốc nếu cần đối chiếu thêm trước khi đưa vào bản thuyết minh chính thức.
4. Cột **"Chuẩn quốc tế"** dùng đúng danh mục đã nêu trong outline thuyết minh kỹ thuật (Dublin Core/ISO 15836, CIDOC-CRM/ISO 21127, OAIS/ISO 14721, PREMIS, METS/MODS, IIIF, OAI-PMH, WCAG 2.1 AA). Nơi không xác định được chuẩn phù hợp, bảng ghi rõ "chưa xác định trong nguồn đã kiểm chứng" thay vì suy đoán.

---

## Phần 1 — Ma trận theo Use Case (wireframe → màn hình → pháp lý → chuẩn)

### UC-01 · Hình 3.5-1 — Bản đồ số 3D / Không gian 3D thế hệ mới

| | |
|---|---|
| **Tên (theo wireframe)** | Không gian 3D toàn khu — viewer Gaussian Splatting đa phân khu (Hồ Văn, Vườn Giám, Nhập Đạo, Thành Đạt, Đại Thành, Thái Học), hotspot điểm tương tác, panorama 360°, chuyển đổi ngôn ngữ VI/EN/FR |
| **Màn hình app đáp ứng** | **Giai đoạn 2.** Đây là nghiệp vụ của **cổng khai thác** (công chúng/nghiên cứu), không thuộc phạm vi app admin giai đoạn 1. App admin hiện tại chỉ có **viewer đơn tài sản** trong màn "Chi tiết tài sản" (mục A9: bật trình xem cho cả tài sản Splat, tải GLB qua GLTFLoader và `.ply`/`.sog` qua thư viện `gaussian-splats-3d`) — xem được **một** tài sản 3D tại một thời điểm, không có bản đồ toàn khu, không có hotspot liên phân khu, không có chuyển ngôn ngữ hiển thị nội dung |
| **Văn bản pháp lý** | Luật Di sản văn hóa 45/2024/QH15 **Điều 85** (CSDL quốc gia về DSVH và chuyển đổi số, khoản 1/3/4/6) [heritage-law.md, ĐÃ XÁC MINH]; Nghị định 308/2025/NĐ-CP **Điều 89** (khai thác, phát huy giá trị DSVH trên môi trường điện tử — nền tảng số tích hợp đa phương tiện, kiểm duyệt nội dung trước khi đưa lên mạng) [ĐÃ XÁC MINH]; Quyết định 2026/QĐ-TTg 02/12/2021 — nội dung & số hiệu [ĐÃ XÁC MINH], chỉ tiêu "100% di tích quốc gia đặc biệt được số hóa và ứng dụng trên nền tảng số đến 2030" *(lưu ý: tình trạng hiệu lực hiện hành của quyết định này [CHƯA XÁC MINH được nhãn chính thức] — đối chiếu lại trước khi đưa vào thuyết minh chính thức)* |
| **Chuẩn quốc tế** | IIIF (trình chiếu ảnh/khung nhìn tương tác đa độ phân giải — áp dụng được cho panorama); CIDOC-CRM/ISO 21127 (mô hình hóa quan hệ không gian giữa các phân khu). Gaussian Splatting (`.splat`/`.sog`) **chưa có chuẩn ISO ban hành riêng** — cần nêu rõ trong thuyết minh (xem mục 5 của `00-ke-hoach-nang-cap.md`: chính sách "bản dẫn xuất bảo hiểm PLY/E57 + lưu ảnh nguồn + tham số huấn luyện") |

### UC-02 · Hình 3.5-2 — Khai thác dữ liệu kỹ thuật công trình

| | |
|---|---|
| **Tên (theo wireframe)** | Lớp dữ liệu Point Cloud/Mesh/Texture bật-tắt được, công cụ đo đạc (khoảng cách/diện tích/cao độ/lát cắt), hồ sơ bản vẽ CAD liên kết (`.dwg`/`.pdf`) |
| **Màn hình app đáp ứng** | **Giai đoạn 2.** Thuộc cổng khai thác kỹ thuật, không nằm trong nhóm A/B/C hiện tại. App admin giai đoạn 1 chỉ **lưu trữ** tệp kỹ thuật (point cloud `.e57`, bản vẽ) kèm metadata và checksum SHA-256 (mục C1: tab Phiên bản + trạng thái fixity) — **không có** công cụ đo đạc, không có bật/tắt lớp dữ liệu trên trình xem |
| **Văn bản pháp lý** | Luật Di sản văn hóa 45/2024/QH15 **Điều 33** (nhiệm vụ tổ chức được giao quản lý di tích — nhóm nhiệm vụ "ứng dụng khoa học công nghệ", "nghiên cứu, sưu tầm tư liệu, hiện vật") [heritage-law.md, ĐÃ XÁC MINH]; Nghị định 308/2025/NĐ-CP **Điều 87** (ứng dụng KHCN, đổi mới sáng tạo, chuyển đổi số — xây dựng bộ tiêu chuẩn kỹ thuật) [ĐÃ XÁC MINH]; Luật Dữ liệu 60/2024/QH15 **Điều 28** (tiêu chuẩn kỹ thuật dữ liệu) [legal-main.md, mức Bắt buộc] |
| **Chuẩn quốc tế** | CIDOC-CRM/ISO 21127 (quan hệ không gian – cấu kiện kiến trúc); OAIS/ISO 14721 (lưu trữ dài hạn dữ liệu đo đạc gốc). Chuẩn ISO riêng cho định dạng point cloud `.e57` **chưa được xác định trong các nguồn đã kiểm chứng** — cần bổ sung khi có quy chuẩn ngành chính thức, không tự trích dẫn số hiệu chưa kiểm chứng |

### UC-03 · Hình 3.5-3 — Quản lý điểm tham quan & phân khu

| | |
|---|---|
| **Tên (theo wireframe)** | Cây phân cấp phân khu → điểm tham quan, gán tọa độ trên bản đồ (kéo-thả marker), trạng thái hiển thị Đang hiển thị/Tạm ẩn/Lưu trữ |
| **Màn hình app đáp ứng** | **Giai đoạn 2.** Quản lý điểm tham quan công chúng (tọa độ địa lý + trạng thái hiển thị cho khách) gắn với cổng tham quan số, **không có trong nhóm A/B/C** của kế hoạch hiện tại. Màn "Bộ sưu tập" (hiện có, không thuộc diện nâng cấp nhóm C) chỉ gom nhóm tài sản số theo chủ đề — không quản lý điểm có tọa độ và trạng thái hiển thị cho khách tham quan |
| **Văn bản pháp lý** | Luật Di sản văn hóa 45/2024/QH15 **Điều 33** (nhiệm vụ "tổ chức đón tiếp, hướng dẫn tham quan" trong 13 nhóm nhiệm vụ của tổ chức quản lý di tích) [ĐÃ XÁC MINH]; Nghị định 308/2025/NĐ-CP **Điều 89** (kiểm duyệt nội dung trước khi đưa lên mạng khi khai thác DSVH trên môi trường điện tử) [ĐÃ XÁC MINH] |
| **Chuẩn quốc tế** | CIDOC-CRM/ISO 21127 (thực thể không gian loại E53 Place, dùng để mô hình hóa điểm tham quan). Không xác định chuẩn địa lý chuyên ngành riêng (kiểu GeoJSON/OSM) trong nguồn đã kiểm chứng |

### UC-04 · Hình 3.5-4 — Quản lý nội dung di sản (CMS)

| | |
|---|---|
| **Tên (theo wireframe)** | Soạn nội dung thuyết minh đa ngôn ngữ (rich text: B/I/H2/Danh sách/Liên kết/Chèn media, tự lưu nháp), metadata chuẩn hóa liên kết dữ liệu 3D, trạng thái Nháp/Chờ duyệt/Đã xuất bản/Bị trả về |
| **Màn hình app đáp ứng** | **Đáp ứng một phần.** Phần *metadata + mô tả + liên kết dữ liệu 3D + trạng thái duyệt* được đáp ứng qua: C1 (Chi tiết tài sản — tab Phiên bản, Rights statement, checksum), C2 (Form metadata chuẩn DAM B.0–B.5, trường Hán Nôm 3 lớp: nguyên văn/phiên âm/dịch nghĩa), C3 (pipeline duyệt mở rộng 9 trạng thái, gồm "Đã gỡ/thu hồi") trong màn "Dữ liệu số hóa"/"Nhập dữ liệu". Phần *soạn thảo nội dung thuyết minh rich-text đa ngôn ngữ song song, phục vụ công chúng* thuộc **Giai đoạn 2** — C6 (giai đoạn 1) mới có khung i18n cho **chuỗi giao diện** (`vi.ts`, chỗ trống `en`/`fr` chưa dịch), chưa có trình soạn thảo nội dung thuyết minh đa ngữ đầy đủ như wireframe mô tả |
| **Văn bản pháp lý** | Luật Giao dịch điện tử 20/2023/QH15 **Điều 12** (chuyển đổi văn bản giấy sang thông điệp dữ liệu — bảo đảm toàn vẹn, ký hiệu riêng, chữ ký số của cơ quan chuyển đổi) [legal-main.md, Bắt buộc]; Nghị định 137/2024/NĐ-CP Chương II (hệ thống chuyển đổi phải có chức năng ký số, hướng dẫn Điều 12) [Bắt buộc]; Nghị định 308/2025/NĐ-CP **Điều 87** (chuyển đổi văn bản giấy sang thông điệp dữ liệu đối với DSVH thuộc danh mục UNESCO/di tích quốc gia đặc biệt/bảo vật quốc gia **cần ý kiến bằng văn bản của Bộ VHTTDL** — áp dụng trực tiếp cho 82 bia Tiến sĩ) [heritage-law.md, ĐÃ XÁC MINH]; Luật Di sản văn hóa 45/2024 **Điều 57 khoản 1đ** (di sản tư liệu phải chuyển dạng số, cập nhật, sao lưu trên CSDL quốc gia) [ĐÃ XÁC MINH]; Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 **Điều 16** (công khai dữ liệu cá nhân chỉ khi có sự đồng ý hoặc theo quy định pháp luật — áp dụng khi nội dung thuyết minh nêu tên người còn sống trong gia phả/sắc phong) [pdpl-verify.md, ĐÃ XÁC MINH] |
| **Chuẩn quốc tế** | Dublin Core/ISO 15836 (lõi metadata); CIDOC-CRM/ISO 21127 (quan hệ hiện vật – sự kiện – con người trong nội dung Hán Nôm); IIIF (thư viện media đa ngôn ngữ) |

### UC-05 · Hình 3.5-6 — Duyệt & xuất bản nội dung

| | |
|---|---|
| **Tên (theo wireframe)** | Hàng chờ duyệt lọc theo phạm vi phân quyền, xem trước đa ngôn ngữ, lịch sử phiên bản kèm so sánh (diff), nút Trả về/Phê duyệt/Xuất bản |
| **Màn hình app đáp ứng** | **Đáp ứng.** Màn "Duyệt & xuất bản" (đã có trong 7 màn hiện hữu), nâng cấp theo: C1 — nút **"Trả lại bổ sung"** (lý do bắt buộc) + nút **"Gỡ xuất bản"**; nguyên tắc 4-mắt (khóa nút Duyệt nếu người duyệt = người phụ trách tài sản); tab **Phiên bản** để so sánh v1/v2 — và C3 (pipeline 9 trạng thái). Hàng chờ duyệt lọc theo phạm vi phân quyền khớp với B4 (ma trận phân quyền theo phân khu) |
| **Văn bản pháp lý** | Nghị định 308/2025/NĐ-CP **Điều 89** (kiểm duyệt nội dung trước khi đưa lên mạng) [ĐÃ XÁC MINH]; Luật Giao dịch điện tử 20/2023 **Điều 12** (giá trị pháp lý của bản chuyển đổi khi công bố chính thức) [Bắt buộc]; Luật Dữ liệu 60/2024 **Điều 12** (chất lượng dữ liệu — kiểm soát trước khi công bố) [Bắt buộc]. *Lưu ý: nguyên tắc phân tách trách nhiệm (người phụ trách ≠ người duyệt) là thông lệ quản trị nội bộ tốt, không có văn bản pháp luật Việt Nam nào quy định trực tiếp — không gán nhầm cho một điều luật cụ thể khi thuyết minh* |
| **Chuẩn quốc tế** | PREMIS (ghi nhận sự kiện bảo quản — phê duyệt/xuất bản là các "preservation event" có actor + timestamp); OAIS/ISO 14721 (luồng SIP → AIP → DIP tương ứng Nháp → Đã duyệt → Xuất bản) |

### UC-06 · Hình 3.5-7 — Quản lý tài khoản, vai trò & phân quyền

| | |
|---|---|
| **Tên (theo wireframe)** | Danh sách tài khoản kèm vai trò/phạm vi dữ liệu/trạng thái, biểu mẫu gán vai trò + nhóm quyền chức năng, phạm vi dữ liệu theo phân khu (multi-select), lịch sử phân quyền |
| **Màn hình app đáp ứng** | **Đáp ứng.** B4 (Chi tiết người dùng + ma trận phân quyền: RBAC vai trò × module × quyền, kết hợp ABAC phạm vi bộ sưu tập/phân khu multi-select; vòng đời tài khoản mời/khóa/reset mật khẩu/MFA; lịch sử phân quyền) + B1 (Đăng nhập + Đăng ký, chọn vai trò demo để thấy phân quyền đổi theo vai) |
| **Văn bản pháp lý** | Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 **Điều 33 khoản 2** ("Cơ quan, tổ chức có trách nhiệm chỉ định bộ phận, nhân sự đủ điều kiện năng lực bảo vệ dữ liệu cá nhân hoặc thuê tổ chức, cá nhân cung cấp dịch vụ" — áp dụng mọi cơ quan, tổ chức, **không có ngoại lệ cho đơn vị sự nghiệp công lập**) [pdpl-verify.md, ĐÃ XÁC MINH]; **Điều 19 khoản 1 điểm c, d** (căn cứ xử lý dữ liệu cá nhân cán bộ nội bộ — phục vụ hoạt động quản lý nhà nước / thực hiện thỏa thuận lao động, thường không cần xin đồng ý riêng nhưng vẫn phải thiết lập cơ chế giám sát theo khoản 2) [ĐÃ XÁC MINH]; Nghị định 53/2022/NĐ-CP **Điều 27 khoản 3** (nhật ký hệ thống lưu trữ tối thiểu **12 tháng** — áp dụng cho lịch sử phân quyền/đăng nhập) [ĐÃ XÁC MINH — 2 nguồn độc lập] |
| **Chuẩn quốc tế** | Không có chuẩn ISO chuyên ngành cho RBAC/ABAC được liệt kê trong các nguồn đã kiểm chứng. TCVN 11930:2017 (an toàn thông tin theo cấp độ) có liên quan đến hồ sơ cấp độ ATTT nhưng nội dung chi tiết của tiêu chuẩn này mới ở mức [CHƯA CHẮC] trong `pdpl-verify.md` — chỉ nêu tên, không trích điều khoản cụ thể |

### Dashboard · Hình 3.5-5 — Trang chủ quản trị

| | |
|---|---|
| **Tên (theo wireframe)** | 4 ô chỉ số (công trình đã số hóa, điểm tham quan, nội dung chờ duyệt, dung lượng đã dùng), biểu đồ hoạt động 30 ngày, trạng thái kết nối API/LGSP, cảnh báo hệ thống |
| **Màn hình app đáp ứng** | **Đáp ứng một phần.** Màn "Tổng quan" (hiện có), nâng cấp theo A2 (mọi con số **derive từ mảng `assets` duy nhất** — chặn Đòn 1–3 của red-team). "Trạng thái kết nối" ↔ C5 (viết lại "Kết nối & chia sẻ" theo Nghị định 278/2025/NĐ-CP). "Cảnh báo hệ thống" (tác vụ nén 3D thất bại, sao lưu hoàn tất) ↔ B7 (Sao lưu & khôi phục — KPI bảo quản) + B6 (Nhật ký nâng cao — tab sự kiện bảo mật). *Lưu ý cần thống nhất khi triển khai:* biểu đồ "Hoạt động gần đây" trên Dashboard trùng lặp một phần với B2 (Báo cáo — Thống kê) — hai màn phải dùng chung một nguồn tính toán để không tái lặp lỗi "số tự mâu thuẫn" (Đòn 2 trong báo cáo red-team) |
| **Văn bản pháp lý** | Nghị định 278/2025/NĐ-CP **Điều 13** (giám sát kết nối "liên tục, công khai và có truy vết") [legal-main.md, Bắt buộc]; Nghị định 165/2025/NĐ-CP **Điều 15, Điều 17** (đánh giá rủi ro dữ liệu hằng năm — cảnh báo hệ thống là một phần bằng chứng giám sát) [Bắt buộc] |
| **Chuẩn quốc tế** | Không áp dụng trực tiếp — đây là màn vận hành nội bộ, không phải màn trình bày dữ liệu di sản theo chuẩn mô tả metadata |

---

## Phần 2 — Ma trận ngược: nghĩa vụ pháp lý → tính năng đáp ứng

Theo `legal-main.md` mục (D), 10 nghĩa vụ pháp lý mới (2025–2026) đòi hỏi màn hình riêng mà hệ thống ban đầu chưa có. Bảng dưới đối chiếu từng nghĩa vụ với màn hình thực tế trong kế hoạch IA v3.

> **Cập nhật 13/08/2026 — [ADR-0020](adr/0020-tro-giup-tra-cuu-thay-bang-tuyen-bo-tuan-thu.md):**
> hub "B8 — Tuân thủ & quản trị dữ liệu" nêu ở cột *Màn hình đáp ứng* dưới đây đã **đổi hệ hình**
> thành màn **Trợ giúp & tra cứu** (`/help`). Nghĩa vụ pháp lý và căn cứ ở từng hàng **giữ nguyên
> giá trị**; thay đổi nằm ở cách phần mềm đáp ứng: không còn tab trạng thái do phần mềm tự gán
> ("Đạt ✓") — mỗi nghĩa vụ nay là một mục hướng dẫn gồm *yêu cầu → chức năng hỗ trợ → việc đơn vị
> tự làm → chức danh chịu trách nhiệm xác nhận*. Việc **ghi nhận số liệu thật** (hồ sơ cấp độ đã
> phê duyệt, DPIA đã nộp, sự cố đã báo) thuộc đơn vị vận hành và giai đoạn có backend, khi bản ghi
> xác nhận có người ký và để lại vết. Kết luận của D9 (thuộc C1) và D10 (khoảng trống) không đổi.

| Mã | Nghĩa vụ pháp lý | Căn cứ [ĐÃ XÁC MINH ở mức Bắt buộc] | Màn hình đáp ứng | Ghi chú |
|---|---|---|---|---|
| D1 | Sổ đăng ký tuân thủ (thay khối "Tuân thủ NĐ 47/2020" cũ — văn bản đã bị bãi bỏ) | Toàn bộ khung pháp lý 2025–2026 (Luật Dữ liệu 60/2024, NĐ 165/2025, NĐ 278/2025, Luật BVDLCN 91/2025, Luật ANM 116/2025) | **B8** — Tuân thủ & quản trị dữ liệu (hub), bảng chính 8 trường: văn bản/điều khoản/yêu cầu/trạng thái/chứng cứ/người chịu trách nhiệm/ngày rà soát/ngày rà soát kế tiếp | Nguyên tắc: không có trạng thái "Đạt" trần — mọi "Đạt" phải kèm ô chứng cứ khác rỗng |
| D2 | Hồ sơ cấp độ an toàn hệ thống thông tin | Nghị định 85/2016/NĐ-CP + Luật An ninh mạng 116/2025/QH15 *(số điều Luật ANM 116/2025 chưa xác minh — chỉ trích tên văn bản, ngày hiệu lực 01/7/2026)* | **B8** — tab "Hồ sơ cấp độ ATTT" | Cấp độ đề xuất, ngày phê duyệt, phương án bảo đảm, ngày rà soát lại |
| D3 | Đánh giá tác động xử lý dữ liệu cá nhân (DPIA) | Luật BVDLCN 91/2025 **Điều 21** (mốc 60 ngày) + NĐ 356/2025/NĐ-CP (Mẫu số 10, cơ chế tiền kiểm A05) [ĐÃ XÁC MINH] | **B8** — tab "DPIA" | Đồng hồ đếm mốc 60 ngày kể từ ngày đầu xử lý DLCN |
| D4 | Yêu cầu của chủ thể dữ liệu | NĐ 356/2025/NĐ-CP — phản hồi **2 ngày làm việc**, thực hiện **10/15/20 ngày** tùy loại yêu cầu [ĐÃ XÁC MINH — EY Legal Alert] | **B8** — tab "Yêu cầu chủ thể dữ liệu" | Đồng hồ đếm ngược theo loại yêu cầu (xem/sửa/xóa/rút đồng ý) |
| D5 | Sự cố & vi phạm dữ liệu | Luật BVDLCN 91/2025 **Điều 23** (thông báo A05 trong **72 giờ** kể từ khi phát hiện) [ĐÃ XÁC MINH] | **B8** — tab "Sự cố 72h" | Hồ sơ vi phạm phải lưu tối thiểu 5 năm sau khắc phục [ĐÃ XÁC MINH — EY] |
| D6 | Danh mục dữ liệu mở + phát hành | NĐ 165/2025 **Điều 10** (công khai dữ liệu mở, gửi Bộ Công an) + Luật Dữ liệu 60/2024 **Điều 21** [Bắt buộc] | **B8** — tab "Danh mục dữ liệu mở" | Giấy phép sử dụng + kênh công bố (Cổng dữ liệu quốc gia / cổng TP) |
| D7 | Đánh giá rủi ro dữ liệu hằng năm | NĐ 165/2025 **Điều 15, Điều 17** [Bắt buộc] | **B8** — tab "Đánh giá rủi ro hằng năm" | Kỳ đánh giá, loại rủi ro, biện pháp, người ký |
| D8 | Kiểm toán & giám sát dữ liệu | NĐ 278/2025 **Điều 13, Điều 14** [Bắt buộc] | **B8** — tab "Kiểm toán dữ liệu" | Đối chiếu đầy đủ/chính xác/kịp thời, xếp hạng CSDL |
| D9 | Ký số & chứng thực bản số hóa | Luật GDĐT 20/2023 **Điều 12–13** + NĐ 137/2024/NĐ-CP [Bắt buộc] | **KHÔNG nằm trong B8** — thực ra thuộc **C1** (Chi tiết tài sản: badge ký số khi xuất bản) | **Lệch so với giả định "D1–D10 → B8" ban đầu** — D9 là nghiệp vụ gắn với từng tài sản khi xuất bản, không phải một hồ sơ tuân thủ tổng hợp. Cần review để tránh làm trùng 2 nơi |
| D10 | Vòng đời & thời hạn lưu trữ | NĐ 165/2025 **Điều 5** [Bắt buộc] | **CHƯA CÓ màn tương ứng rõ ràng trong A/B/C** | **Khoảng trống thực sự.** B8 (8 tab hiện tại) không có tab "Vòng đời & lưu trữ"; C1 (Rights statement/mức truy cập) chỉ nói về quyền truy cập, không nói thời hạn lưu; B7 (Sao lưu & khôi phục) nói về sao lưu kỹ thuật, không phải chính sách vòng đời theo loại tài sản. **Cần quyết định: thêm tab thứ 9 vào B8, hay gắn vào C1/B7** |

---

*Ma trận này nên được cập nhật mỗi khi `00-ke-hoach-nang-cap.md` thay đổi phạm vi A/B/C, và đối chiếu lại toàn bộ cột pháp lý nếu có văn bản hướng dẫn mới ban hành (đặc biệt: nghị định thay thế NĐ 85/2016 sau 01/7/2026, nghị định xử phạt BVDLCN, số điều chính thức của Luật An ninh mạng 116/2025 — xem mục "Còn mở" trong `00-ke-hoach-nang-cap.md`).*
