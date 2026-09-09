# Đặc tả API — Hệ thống quản trị dữ liệu số hóa Văn Miếu — Quốc Tử Giám

**Hệ thống quản lý dữ liệu số Văn Miếu — Quốc Tử Giám** · Tài liệu số hiệu `06` · Phụ lục kỹ thuật hồ sơ dự thầu · đọc cùng `07-mo-hinh-du-lieu.md`

*Quy ước thuật ngữ: tiếng Anh giữ `asset` làm từ bao trùm kỹ thuật (khớp tên tài nguyên REST, schema, tên trường); tiếng Việt gọi chung là "dữ liệu số hóa" (không dùng "tài sản"). Tên trường trong toàn bộ schema dùng tiếng Anh `snake_case`, khớp 1-1 với tên cột trong `07-mo-hinh-du-lieu.md`.*

---

## 1. Tổng quan kiến trúc API

### 1.1. Ba lớp giao tiếp

| Lớp | Giao thức | Mục đích | Đối tượng dùng |
|---|---|---|---|
| **REST nghiệp vụ** | JSON qua HTTPS, `/api/v1` | Quản trị, tra cứu, tích hợp hệ thống trong nước (LGSP/NDXP, CSDL Bộ VHTTDL) | Nội bộ, hệ thống chính phủ, đối tác được cấp API key |
| **OAI-PMH** | XML qua HTTP GET, `/oai` | Gặt (harvest) siêu dữ liệu mô tả hàng loạt cho thư viện số/cổng dữ liệu bên ngoài | Máy gặt (harvester) của bên thứ ba — Thư viện Quốc gia, Europeana-style aggregator |
| **Stream nhị phân** | HTTP Range/byte-stream | Phát trực tiếp mô hình 3D (GLB) và không gian lớn (3D Tiles) không tải nguyên khối | Trình xem web (viewer), ứng dụng đối tác |

`/api/v1` phục vụ cả liệt kê/lấy chi tiết siêu dữ liệu lẫn điều phối quy trình (yêu cầu chia sẻ, nhật ký); `/oai` chỉ phục vụ gặt siêu dữ liệu mô tả dạng `oai_dc`, tương ứng trực tiếp **TCVN 7980-1:2024** (ISO 15836-1:2017 — Bộ yếu tố siêu dữ liệu Dublin Core, đã là tiêu chuẩn quốc gia Việt Nam) và **TCVN 7980-2:2024** (thuộc tính và phân lớp DCMI); tệp nhị phân lớn không đi qua `/api/v1` mà qua endpoint stream riêng có hỗ trợ `Range` để trình xem tải theo từng phần (tile hoá).

### 1.2. Xác thực & bảo mật

| Kênh | Cơ chế | Áp dụng cho | Ghi chú |
|---|---|---|---|
| Hệ thống chính phủ (LGSP TP Hà Nội, NDXP, CSDL Bộ VHTTDL) | **OAuth2 client-credentials** (token JWT ngắn hạn) | Toàn bộ endpoint `/api/v1/*` theo phạm vi (`scope`) được cấp | Token lấy từ `POST /oauth2/token`; hạn dùng token đề xuất ≤ 1 giờ |
| Kênh LGSP thành phố | **mTLS** (chứng thư số hai chiều ở tầng gateway) | Mọi request có nguồn gốc từ LGSP, kể cả webhook đồng bộ | Bổ sung — không thay thế — OAuth2; đánh dấu `x-mtls-required: true` trên các endpoint liên quan trong đặc tả OpenAPI dưới đây, vì OpenAPI 3.0 chưa có kiểu `securityScheme` mTLS gốc (chỉ có từ 3.1) |
| Đối tác ngoài (viện nghiên cứu, bảo tàng, nhà thầu số hóa) | **API key có phạm vi (scope) và hạn dùng** | Endpoint đọc công khai/theo thỏa thuận (`/assets`, `/open-data/datasets`) | Khoá hiện đầy đủ **một lần duy nhất** khi tạo; luôn có `expires_at`, mặc định gợi ý 90 ngày, không cho phép "không giới hạn" trừ khi Quản trị xác nhận rõ ràng |

Không dùng lại nhãn phân loại kết nối cũ "Chia sẻ mặc định" / "Theo yêu cầu đặc thù" (thuật ngữ của Nghị định 47/2020/NĐ-CP, đã bị bãi bỏ theo Điều 23 Nghị định 278/2025/NĐ-CP). Kênh kết nối trong toàn bộ đặc tả này phân loại theo Nghị định 278/2025/NĐ-CP: `ket_noi_truc_tiep_nen_tang` (kết nối trực tiếp qua Nền tảng tích hợp, chia sẻ dữ liệu), `dong_bo_dinh_ky` (đồng bộ theo lịch), `tai_len_csdl_tong_hop_quoc_gia` (tải lên CSDL tổng hợp quốc gia — Nghị định 165/2025/NĐ-CP Điều 10), `theo_thoa_thuan_chia_se` (thoả thuận chia sẻ riêng, đi kèm một `share_request` cụ thể).

### 1.3. Giới hạn tốc độ (rate limit)

Áp dụng ở tầng API gateway, theo từng consumer (client OAuth2 hoặc API key), trả về qua header chuẩn `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset` (giây Unix epoch reset); vượt hạn mức trả `429` (xem mục 4).

| Nhóm consumer | Mặc định | Có thể nâng theo thoả thuận |
|---|---|---|
| Hệ thống chính phủ (OAuth2, LGSP/NDXP/CSDL Bộ VHTTDL) | 1.200 request/phút | Có, theo văn bản kết nối |
| Đối tác có API key | 60 request/phút | Có, ghi trong `api_key.scope` |
| Endpoint stream nhị phân | 30 phiên đồng thời/consumer | Theo băng thông thực tế |
| `/oai` (OAI-PMH) | 30 request/phút mỗi IP nguồn | Theo hành vi harvester chuẩn (resumption token, không crawl dồn dập) |

### 1.4. Phiên bản hóa

Đường dẫn mang số phiên bản chính: `/api/v1`. Thay đổi phá vỡ tương thích (breaking change) phát hành ở `/api/v2` song song tối thiểu 12 tháng trước khi ngừng `/v1`, thông báo qua header `Deprecation`/`Sunset` (RFC 8594) trên các response của phiên bản sắp ngừng. `/oai` không đánh số theo `/api/vN` vì bản thân giao thức OAI-PMH 2.0 đã tự quản lý phiên bản qua tham số `metadataPrefix`.

### 1.5. Quy ước mã định danh

Mã nghiệp vụ (`code`) theo hệ 5 tầng của `07-mo-hinh-du-lieu.md` mục 2.4: đối tượng `VM-<OC>-<NNNNN>` → bản ghi dữ liệu số `.{DF}{nn}` → phiên bản `.v<n>` → tệp dẫn xuất `#master|web|raw|thumb`; đợt số hóa dùng chuỗi riêng `VM-DS-<YYYY>-<nn>`. Ví dụ đầy đủ một tệp: `VM-CT-00007.SPL01.v2#master`.

Tham số đường dẫn `{assetId}`/`{physicalArtifactId}` chấp nhận **UUID nội bộ HOẶC mã nghiệp vụ** ở granularity tương ứng (asset: tầng 1+2, vd `VM-CT-00007.SPL01`; đối tượng di sản gốc: tầng 1, vd `VM-CT-00007`), so khớp không phân biệt hoa/thường và bỏ qua dấu `-`/`.`. Nếu client truyền mã đủ điều kiện tới tầng 3/4 (kèm `.v<n>` hoặc `#kind`), server bỏ phần hậu tố và phân giải về asset tương ứng ở phiên bản hiện hành.

Tra cứu đối tượng theo số kiểm kê chính thức (`so_kiem_ke`, khác mã hệ thống) dùng tham số cùng tên trên `GET /physical-artifacts` (mục 2, nhóm `PhysicalArtifacts`) — phục vụ cán bộ kiểm kê đối chiếu bằng sổ giấy.

---

## 2. Đặc tả OpenAPI 3.0

```yaml
openapi: 3.0.3
info:
  title: API Dữ liệu số hóa Văn Miếu — Quốc Tử Giám
  version: 1.0.0
  description: |
    API nghiệp vụ cho hệ thống quản trị dữ liệu số hóa Văn Miếu - Quốc Tử Giám.
    Bao gồm tra cứu du lieu so hoa (asset), bo suu tap, du lieu mo, yeu cau chia se
    lien co quan va nhat ky truy vet. Xem 07-mo-hinh-du-lieu.md cho mo hinh du lieu day du.
  contact:
    name: Quan tri he thong - Trung tam Hoat dong VHKH Van Mieu - Quoc Tu Giam
    email: quantri@vanmieu.gov.vn
  license:
    name: Noi bo - Chinh phu Viet Nam
servers:
  - url: https://api.dsvanmieu.gov.vn/api/v1
    description: Production
  - url: https://api-staging.dsvanmieu.gov.vn/api/v1
    description: Staging - khong dung du lieu that
tags:
  - name: Assets
    description: Du lieu so hoa - tra cuu, tep tin, quan he, phien ban
  - name: PhysicalArtifacts
    description: Doi tuong di san goc (hien vat/cong trinh/khuon vien/tai lieu vat ly)
  - name: Collections
    description: Bo suu tap chuyen de
  - name: OpenData
    description: Danh muc du lieu mo cong bo theo NĐ 165/2025/NĐ-CP Dieu 10
  - name: ShareRequests
    description: Yeu cau chia se du lieu lien co quan
  - name: AuditLogs
    description: Nhat ky truy vet, chi doc
  - name: Webhooks
    description: Dang ky nhan dong bo tu LGSP
paths:
  /assets:
    get:
      tags: [Assets]
      summary: Liet ke du lieu so hoa
      description: |
        Loc doc lap theo hai truc phan loai object_class (loai doi tuong di san that)
        va digital_form (dang du lieu so), cong voi trang thai, bo suu tap, khoang nien dai
        va tim kiem tu do bo dau hai chieu.
      parameters:
        - name: object_class
          in: query
          description: Loc theo loai doi tuong di san. Co the lap lai tham so de loc nhieu gia tri.
          schema:
            type: array
            items:
              $ref: '#/components/schemas/ObjectClass'
          style: form
          explode: true
        - name: digital_form
          in: query
          description: Loc theo dang du lieu so. Co the lap lai tham so de loc nhieu gia tri.
          schema:
            type: array
            items:
              $ref: '#/components/schemas/DigitalForm'
          style: form
          explode: true
        - name: status
          in: query
          schema:
            $ref: '#/components/schemas/AssetStatus'
        - name: collection_id
          in: query
          schema:
            type: string
            format: uuid
        - name: era_from
          in: query
          description: Nam bat dau khoang loc (so am = truoc Cong nguyen)
          schema:
            type: integer
        - name: era_to
          in: query
          description: Nam ket thuc khoang loc
          schema:
            type: integer
        - name: q
          in: query
          description: Tim kiem tu do, bo dau hai chieu (nguoi dung go co dau hoac khong dau deu khop)
          schema:
            type: string
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/PageSizeParam'
        - $ref: '#/components/parameters/SortParam'
      responses:
        '200':
          description: Danh sach du lieu so hoa
          headers:
            X-RateLimit-Limit:
              $ref: '#/components/headers/RateLimitLimit'
            X-RateLimit-Remaining:
              $ref: '#/components/headers/RateLimitRemaining'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetListResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'
  /assets/{assetId}:
    get:
      tags: [Assets]
      summary: Chi tiet mot du lieu so hoa
      parameters:
        - $ref: '#/components/parameters/AssetIdPath'
      responses:
        '200':
          description: Chi tiet du lieu so hoa
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Asset'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
  /assets/{assetId}/files:
    get:
      tags: [Assets]
      summary: Danh sach tep tin cua mot phien ban dang hien hanh
      description: Moi tep kem checksum SHA-256 va thoi diem kiem tra toan ven gan nhat (fixity_checked_at).
      parameters:
        - $ref: '#/components/parameters/AssetIdPath'
      responses:
        '200':
          description: Danh sach tep
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetFileListResponse'
        '404':
          $ref: '#/components/responses/NotFound'
  /assets/{assetId}/files/{fileId}/stream:
    get:
      tags: [Assets]
      summary: Phat truc tiep noi dung tep (GLB / 3D Tiles / video)
      description: |
        Ho tro header Range (RFC 7233) de trinh xem tai theo tung phan, khong tai
        nguyen khoi tep lon (mo hinh 3D, khong gian splat dang 3D Tiles, video).
      parameters:
        - $ref: '#/components/parameters/AssetIdPath'
        - name: fileId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Toan bo noi dung tep
        '206':
          description: Mot phan noi dung tep, tra ve khi request co header Range
        '404':
          $ref: '#/components/responses/NotFound'
  /assets/{assetId}/relations:
    get:
      tags: [Assets]
      summary: Danh sach quan he voi du lieu so hoa khac
      parameters:
        - $ref: '#/components/parameters/AssetIdPath'
      responses:
        '200':
          description: Danh sach quan he
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetRelationListResponse'
        '404':
          $ref: '#/components/responses/NotFound'
    post:
      tags: [Assets]
      summary: Tao quan he moi giua hai du lieu so hoa
      parameters:
        - $ref: '#/components/parameters/AssetIdPath'
        - $ref: '#/components/parameters/IdempotencyKeyHeader'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AssetRelationCreateRequest'
      responses:
        '201':
          description: Da tao quan he
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetRelation'
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'
        '422':
          $ref: '#/components/responses/UnprocessableEntity'
  /assets/{assetId}/versions:
    get:
      tags: [Assets]
      summary: Lich su phien ban (bao gom ban da bi thay the)
      description: Cac phien ban la ban ghi bat bien theo nguyen tac OAIS - xem 07-mo-hinh-du-lieu.md muc 5.1.
      parameters:
        - $ref: '#/components/parameters/AssetIdPath'
      responses:
        '200':
          description: Danh sach phien ban
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetVersionListResponse'
        '404':
          $ref: '#/components/responses/NotFound'
  /physical-artifacts:
    get:
      tags: [PhysicalArtifacts]
      summary: Liet ke doi tuong di san goc
      parameters:
        - name: object_class
          in: query
          schema:
            $ref: '#/components/schemas/PhysicalObjectClass'
        - name: so_kiem_ke
          in: query
          description: Tra theo so kiem ke chinh thuc, khop chinh xac
          schema:
            type: string
        - name: q
          in: query
          schema:
            type: string
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/PageSizeParam'
      responses:
        '200':
          description: Danh sach doi tuong di san goc
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PhysicalArtifactListResponse'
  /physical-artifacts/{physicalArtifactId}:
    get:
      tags: [PhysicalArtifacts]
      summary: Chi tiet mot doi tuong di san goc
      parameters:
        - name: physicalArtifactId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Chi tiet doi tuong di san goc
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PhysicalArtifact'
        '404':
          $ref: '#/components/responses/NotFound'
  /physical-artifacts/{physicalArtifactId}/assets:
    get:
      tags: [PhysicalArtifacts]
      summary: Tat ca du lieu so hoa (moi digital_form) cua mot doi tuong di san goc
      description: |
        Vi du Khue Van Cac (mot physical_artifact, object_class=structure) co the tra ve
        dong thoi cac ban ghi asset o digital_form khac nhau: mesh3d, splat, pointcloud,
        drawing, image - moi ban ghi la mot quan he CIDOC-CRM P138 has representation
        toi cung mot E22 Man-Made Object. Xem 07-mo-hinh-du-lieu.md muc 2.3.
      parameters:
        - name: physicalArtifactId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: digital_form
          in: query
          schema:
            $ref: '#/components/schemas/DigitalForm'
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/PageSizeParam'
      responses:
        '200':
          description: Danh sach du lieu so hoa cua doi tuong nay
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetListResponse'
        '404':
          $ref: '#/components/responses/NotFound'
  /physical-artifacts/{physicalArtifactId}/dossier:
    get:
      tags: [PhysicalArtifacts]
      summary: Ho so 360 do cua mot doi tuong di san goc (man Ho so doi tuong di san)
      description: |
        Doi tuong + toan bo du lieu so lien quan, nhom theo relation_type ba nhom
        (07-mo-hinh-du-lieu.md muc 5.11) thay vi mot danh sach phang - phan biet ro
        "ban dai dien so cua chinh doi tuong" voi "tu lieu doc lap chi nhac/chup toi doi tuong".
      parameters:
        - name: physicalArtifactId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Ho so doi tuong
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PhysicalArtifactDossier'
        '404':
          $ref: '#/components/responses/NotFound'
  /collections:
    get:
      tags: [Collections]
      summary: Liet ke bo suu tap
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/PageSizeParam'
      responses:
        '200':
          description: Danh sach bo suu tap
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CollectionListResponse'
  /collections/{collectionId}:
    get:
      tags: [Collections]
      summary: Chi tiet bo suu tap
      parameters:
        - name: collectionId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Chi tiet bo suu tap
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Collection'
        '404':
          $ref: '#/components/responses/NotFound'
  /open-data/datasets:
    get:
      tags: [OpenData]
      summary: Danh muc du lieu mo da cong bo
      description: Tuong ung Nghi dinh 165/2025/NĐ-CP Dieu 10 - cong khai du lieu mo, gui Bo Cong an tong hop.
      parameters:
        - name: classification
          in: query
          schema:
            type: string
            enum: [cong_khai, co_dieu_kien, khong_cong_khai]
        - name: publish_status
          in: query
          schema:
            type: string
            enum: [cho_duyet, da_cong_bo, da_thu_hoi]
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/PageSizeParam'
      responses:
        '200':
          description: Danh sach bo du lieu mo
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DatasetListResponse'
  /open-data/datasets/{datasetId}:
    get:
      tags: [OpenData]
      summary: Chi tiet mot bo du lieu mo
      parameters:
        - name: datasetId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Chi tiet bo du lieu mo
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Dataset'
        '404':
          $ref: '#/components/responses/NotFound'
  /share-requests:
    get:
      tags: [ShareRequests]
      summary: Liet ke yeu cau chia se du lieu lien co quan
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [cho_duyet, da_chap_thuan, tu_choi, da_thu_hoi]
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/PageSizeParam'
      responses:
        '200':
          description: Danh sach yeu cau chia se
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ShareRequestListResponse'
    post:
      tags: [ShareRequests]
      summary: Tao yeu cau chia se moi
      parameters:
        - $ref: '#/components/parameters/IdempotencyKeyHeader'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ShareRequestCreateRequest'
      responses:
        '201':
          description: Da tao yeu cau
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ShareRequest'
        '400':
          $ref: '#/components/responses/BadRequest'
  /share-requests/{shareRequestId}/approve:
    post:
      tags: [ShareRequests]
      summary: Duyet yeu cau chia se
      parameters:
        - name: shareRequestId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [decision_note]
              properties:
                decision_note:
                  type: string
                  description: Ghi chu/can cu phe duyet - bat buoc, khong cho "Dat" tran
                expires_at:
                  type: string
                  format: date-time
                  description: Han hieu luc quyen truy cap da cap
      responses:
        '200':
          description: Da duyet
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ShareRequest'
        '404':
          $ref: '#/components/responses/NotFound'
        '409':
          $ref: '#/components/responses/Conflict'
  /share-requests/{shareRequestId}/reject:
    post:
      tags: [ShareRequests]
      summary: Tu choi yeu cau chia se
      parameters:
        - name: shareRequestId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [decision_note]
              properties:
                decision_note:
                  type: string
      responses:
        '200':
          description: Da tu choi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ShareRequest'
        '404':
          $ref: '#/components/responses/NotFound'
  /share-requests/{shareRequestId}/revoke:
    post:
      tags: [ShareRequests]
      summary: Thu hoi quyen truy cap da cap truoc do
      parameters:
        - name: shareRequestId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [revoke_reason]
              properties:
                revoke_reason:
                  type: string
      responses:
        '200':
          description: Da thu hoi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ShareRequest'
        '404':
          $ref: '#/components/responses/NotFound'
        '409':
          $ref: '#/components/responses/Conflict'
  /audit-logs:
    get:
      tags: [AuditLogs]
      summary: Tra cuu nhat ky he thong (chi doc, append-only)
      parameters:
        - name: actor_user_id
          in: query
          schema:
            type: string
            format: uuid
        - name: action
          in: query
          schema:
            type: string
        - name: from
          in: query
          description: Thoi diem bat dau (ISO 8601)
          schema:
            type: string
            format: date-time
        - name: to
          in: query
          description: Thoi diem ket thuc (ISO 8601)
          schema:
            type: string
            format: date-time
        - name: result
          in: query
          schema:
            type: string
            enum: [thanh_cong, that_bai]
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/PageSizeParam'
      responses:
        '200':
          description: Danh sach ban ghi nhat ky
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuditLogListResponse'
        '403':
          $ref: '#/components/responses/Forbidden'
  /integrations/lgsp/webhook-subscriptions:
    get:
      tags: [Webhooks]
      summary: Liet ke dang ky webhook dong bo LGSP
      x-mtls-required: true
      responses:
        '200':
          description: Danh sach dang ky webhook
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/WebhookSubscription'
    post:
      tags: [Webhooks]
      summary: Dang ky mot webhook nhan su kien dong bo (asset xuat ban, dataset cong bo...)
      description: |
        Yeu cau ca OAuth2 client-credentials (scope webhooks:manage) va mTLS o tang
        gateway - xem muc 1.2. Callback URL phai la HTTPS, xac thuc bang chu ky HMAC-SHA256
        dinh kem trong header X-Webhook-Signature cho moi lan goi.
      x-mtls-required: true
      parameters:
        - $ref: '#/components/parameters/IdempotencyKeyHeader'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [callback_url, event_types]
              properties:
                callback_url:
                  type: string
                  format: uri
                event_types:
                  type: array
                  items:
                    type: string
                    enum: [asset_published, asset_updated, dataset_published, asset_relation_changed]
      responses:
        '201':
          description: Da dang ky - secret chi hien thi mot lan duy nhat trong response nay
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebhookSubscription'
        '400':
          $ref: '#/components/responses/BadRequest'
security:
  - OAuth2ClientCredentials: []
  - ApiKeyAuth: []
components:
  securitySchemes:
    OAuth2ClientCredentials:
      type: oauth2
      description: Dung cho he thong chinh phu (LGSP, NDXP, CSDL Bo VHTTDL) va nghiep vu noi bo.
      flows:
        clientCredentials:
          tokenUrl: https://auth.dsvanmieu.gov.vn/oauth2/token
          scopes:
            assets:read: Doc du lieu so hoa
            assets:write: Tao/sua quan he du lieu so hoa
            collections:read: Doc bo suu tap
            open-data:read: Doc danh muc du lieu mo
            share-requests:read: Doc yeu cau chia se
            share-requests:write: Tao/duyet/tu choi/thu hoi yeu cau chia se
            audit-logs:read: Doc nhat ky he thong
            webhooks:manage: Dang ky/quan ly webhook dong bo
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: Khoa co pham vi (scope) va han dung, cap cho doi tac ngoai - xem muc 1.2.
  parameters:
    AssetIdPath:
      name: assetId
      in: path
      required: true
      description: UUID noi bo HOAC ma nghiep vu (vd VM-CT-00007.SPL01) - xem muc 1.5
      schema:
        type: string
    PageParam:
      name: page
      in: query
      description: So trang, bat dau tu 1
      schema:
        type: integer
        minimum: 1
        default: 1
    PageSizeParam:
      name: page_size
      in: query
      description: So ban ghi moi trang
      schema:
        type: integer
        minimum: 1
        maximum: 200
        default: 20
    SortParam:
      name: sort
      in: query
      description: 'Sap xep, dinh dang truong:huong, phan cach boi dau phay. Vi du updated_at:desc,title:asc'
      schema:
        type: string
        default: 'updated_at:desc'
    IdempotencyKeyHeader:
      name: Idempotency-Key
      in: header
      description: Khoa duy nhat do client sinh, chong tao trung khi goi lai do timeout/retry - xem muc 5.
      required: false
      schema:
        type: string
  headers:
    RateLimitLimit:
      description: Han muc request toi da trong chu ky hien tai
      schema:
        type: integer
    RateLimitRemaining:
      description: So request con lai trong chu ky hien tai
      schema:
        type: integer
  responses:
    BadRequest:
      description: Tham so khong hop le
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Chua xac thuc hoac token/khoa khong hop le
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Forbidden:
      description: Da xac thuc nhung khong du pham vi/quyen
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: Khong tim thay tai nguyen
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Conflict:
      description: Xung dot trang thai (vi du duyet mot yeu cau da bi thu hoi)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    UnprocessableEntity:
      description: Du lieu hop le cu phap nhung vi pham rang buoc nghiep vu
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    RateLimited:
      description: Vuot han muc goi trong chu ky
      headers:
        X-RateLimit-Reset:
          description: Thoi diem reset han muc (Unix epoch giay)
          schema:
            type: integer
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
  schemas:
    ObjectClass:
      type: string
      description: Loai doi tuong di san that - xem 07-mo-hinh-du-lieu.md muc 2.1
      enum: [precinct, structure, artifact, document, av]
    PhysicalObjectClass:
      type: string
      description: Nhu ObjectClass nhung khong bao gom av - physical_artifact khong bao gio la tu lieu nghe nhin
      enum: [precinct, structure, artifact, document]
    DigitalForm:
      type: string
      description: Dang du lieu so - quyet dinh khoi truong mo rong type_specific
      enum: [mesh3d, splat, pointcloud, drawing, image, text, video, audio]
    AssetStatus:
      type: string
      enum:
        - de_xuat
        - cho_xu_ly
        - dang_xu_ly
        - can_so_hoa_lai
        - cho_duyet
        - cho_tham_dinh
        - da_duyet
        - xuat_ban
        - da_luu_tru
        - da_kiem_ke
        - da_go_xuat_ban
    AccessLevel:
      type: string
      enum: [cong_khai, nghien_cuu, noi_bo]
    MissingValue:
      type: object
      description: |
        Ma khuyet gia tri tuong minh thay cho truong rong - xem 07-mo-hinh-du-lieu.md muc 5.15
        va quy tac cong bo o muc 2.2 duoi day.
      required: [missing]
      properties:
        missing:
          type: string
          enum: [khong_ap_dung, chua_xac_dinh, khong_ro, chua_nhap, han_che]
        note:
          type: string
          description: Bat buoc khi missing la khong_ro hoac chua_xac_dinh (ghi chu nguon da tra cuu)
    EraInfo:
      type: object
      description: Nien dai hai lop - xem 07-mo-hinh-du-lieu.md muc 5.3, chuan EDTF o truong edtf
      properties:
        display:
          type: string
          example: '1484 (dung bia)'
        edtf:
          type: string
          description: Chuan EDTF (ISO 8601-2) - vd 1484 / 1484? / 1484~ / 18XX / 1740/1786 / unknown
          example: '1484'
        from:
          type: integer
          nullable: true
          description: Dan xuat tu edtf luc ghi, phuc vu loc/sap xep - khong nhap tay truc tiep
        to:
          type: integer
          nullable: true
          description: Dan xuat tu edtf luc ghi, phuc vu loc/sap xep - khong nhap tay truc tiep
        certainty:
          type: string
          enum: [chinh_xac, uoc_tinh, tranh_cai]
    ControlledVocabularyRef:
      type: object
      properties:
        vocabulary_id:
          type: string
          format: uuid
        source:
          type: string
          enum: [getty_aat, iconclass, tgn, iso_639, iso_3166]
        source_id:
          type: string
          example: 'aat:300010331'
        label_vi:
          type: string
        label_en:
          type: string
    RightsRef:
      type: object
      properties:
        rights_statement_id:
          type: string
          format: uuid
        code:
          type: string
          example: InC-EDU
        label_vi:
          type: string
        label_en:
          type: string
        access_level:
          $ref: '#/components/schemas/AccessLevel'
    RetentionRef:
      type: object
      description: 'Thoi han bao quan - ND 165/2025/ND-CP Dieu 5; truong bat buoc theo TT 05/2025/TT-BNV'
      properties:
        retention_policy_id:
          type: string
          format: uuid
        retention_period:
          type: string
          example: Vinh vien
        next_review_at:
          type: string
          format: date
    SignatureInfo:
      type: object
      description: Ky so ban chuyen doi - Luat GDDT 20/2023/QH15 Dieu 12-13, ND 137/2024/NĐ-CP
      properties:
        signed_at:
          type: string
          format: date-time
          nullable: true
        signed_by:
          type: string
          format: uuid
          nullable: true
        signature_ref:
          type: string
          nullable: true
        conversion_mark:
          type: string
          nullable: true
    AssetVersionSummary:
      type: object
      properties:
        asset_version_id:
          type: string
          format: uuid
        version_no:
          type: integer
        status:
          type: string
          enum: [dang_luu_tru, da_thay_the]
        created_at:
          type: string
          format: date-time
        signature:
          $ref: '#/components/schemas/SignatureInfo'
    PhysicalArtifactRef:
      type: object
      nullable: true
      properties:
        physical_artifact_id:
          type: string
          format: uuid
        so_kiem_ke:
          type: string
        name:
          type: string
    Mesh3dFields:
      type: object
      required: [digital_form]
      properties:
        digital_form:
          type: string
          enum: [mesh3d]
        scan_method:
          type: string
          example: Photogrammetry
        source_image_count:
          type: integer
        mesh_resolution_mm:
          type: number
        triangle_count:
          type: integer
        texture_resolution:
          type: string
          example: '8192x8192'
        registration_rms_error_mm:
          type: number
        reference_coordinate_system:
          type: string
        source_format:
          type: string
        distribution_format:
          type: string
    SplatFields:
      type: object
      required: [digital_form, training_software]
      properties:
        digital_form:
          type: string
          enum: [splat]
        gaussian_count:
          type: integer
        training_software:
          type: string
          example: Postshot 1.2
        training_algorithm_version:
          type: string
        point_cloud_accuracy_mm:
          type: number
        bounding_box:
          type: object
          description: GeoJSON Polygon xap xi pham vi khong gian
        web_distribution_format:
          type: string
          example: 3D Tiles
    PointcloudFields:
      type: object
      required: [digital_form]
      properties:
        digital_form:
          type: string
          enum: [pointcloud]
        capture_method:
          type: string
        point_count:
          type: integer
        point_density:
          type: string
        accuracy_mm:
          type: number
        source_format:
          type: string
          example: E57
        reference_coordinate_system:
          type: string
    DrawingFields:
      type: object
      required: [digital_form]
      properties:
        digital_form:
          type: string
          enum: [drawing]
        drawing_type:
          type: string
          example: Mat cat
        scale:
          type: string
          example: '1:50'
        software:
          type: string
        source_format:
          type: string
          example: DWG
        distribution_format:
          type: string
          example: PDF
        surveyed_by:
          type: string
    ImageFields:
      type: object
      required: [digital_form]
      properties:
        digital_form:
          type: string
          enum: [image]
        photographer:
          type: string
        original_medium:
          type: string
        depicts_physical_artifact_id:
          type: string
          format: uuid
          nullable: true
        digital_restoration_note:
          type: string
        original_copyright_status:
          type: string
        scan_resolution_dpi:
          type: integer
        color_bit_depth:
          type: integer
    TextFields:
      type: object
      required: [digital_form]
      properties:
        digital_form:
          type: string
          enum: [text]
        document_type:
          type: string
          example: Sac phong
        original_script:
          type: string
          example: Hani
        era_name:
          type: string
          example: Canh Hung 35
        transcription_han_nom:
          type: string
        transliteration_han_viet:
          type: string
        translation_vi:
          type: string
        translation_en:
          type: string
        translator_user_id:
          type: string
          format: uuid
        reviewer_user_id:
          type: string
          format: uuid
        material_tech:
          type: string
        physical_condition:
          type: string
        bibliographic_source:
          type: string
        ocr_htr_status:
          type: string
        ocr_confidence:
          type: number
    MediaFields:
      type: object
      required: [digital_form]
      properties:
        digital_form:
          type: string
          enum: [video, audio]
        narration_language:
          type: string
        performer:
          type: string
        codec:
          type: string
        subtitle_asset_ids:
          type: array
          items:
            type: string
            format: uuid
        related_asset_ids:
          type: array
          items:
            type: string
            format: uuid
        person_consent_ref:
          type: string
          nullable: true
    AssetTypeSpecific:
      oneOf:
        - $ref: '#/components/schemas/Mesh3dFields'
        - $ref: '#/components/schemas/SplatFields'
        - $ref: '#/components/schemas/PointcloudFields'
        - $ref: '#/components/schemas/DrawingFields'
        - $ref: '#/components/schemas/ImageFields'
        - $ref: '#/components/schemas/TextFields'
        - $ref: '#/components/schemas/MediaFields'
      discriminator:
        propertyName: digital_form
        mapping:
          mesh3d: '#/components/schemas/Mesh3dFields'
          splat: '#/components/schemas/SplatFields'
          pointcloud: '#/components/schemas/PointcloudFields'
          drawing: '#/components/schemas/DrawingFields'
          image: '#/components/schemas/ImageFields'
          text: '#/components/schemas/TextFields'
          video: '#/components/schemas/MediaFields'
          audio: '#/components/schemas/MediaFields'
    PremisEvent:
      type: object
      properties:
        premis_event_id:
          type: string
          format: uuid
        asset_version_id:
          type: string
          format: uuid
        asset_file_id:
          type: string
          format: uuid
          nullable: true
        event_type:
          type: string
          enum:
            - ingest
            - kiem_dinh_chat_luong
            - sinh_ban_dan_xuat
            - fixity_check
            - di_tru_dinh_dang
            - phuc_che
            - tham_dinh_noi_dung
            - ky_so_xuat_ban
            - luu_tru_dai_han
            - kiem_ke_dinh_ky
            - deaccession
        event_datetime:
          type: string
          format: date-time
        event_detail:
          type: string
        event_outcome:
          type: string
          enum: [thanh_cong, that_bai, canh_bao]
        agent_user_id:
          type: string
          format: uuid
          nullable: true
        agent_software:
          type: string
          nullable: true
    AssetListItem:
      type: object
      properties:
        asset_id:
          type: string
          format: uuid
        code:
          type: string
          example: VM-HV-001
        object_class:
          $ref: '#/components/schemas/ObjectClass'
        digital_form:
          $ref: '#/components/schemas/DigitalForm'
        title:
          type: string
        era:
          $ref: '#/components/schemas/EraInfo'
        current_location:
          type: string
        status:
          $ref: '#/components/schemas/AssetStatus'
        access_level:
          $ref: '#/components/schemas/AccessLevel'
        collection_ids:
          type: array
          items:
            type: string
            format: uuid
        thumbnail_url:
          type: string
          format: uri
          nullable: true
        updated_at:
          type: string
          format: date-time
    Asset:
      type: object
      description: |
        Ban ghi day du mot du lieu so hoa - gom khoi loi anh xa Dublin Core (TCVN 7980-1:2024),
        khoi truong rieng theo digital_form (type_specific), rights, phien ban hien hanh
        (kem chu ky so) va lich su su kien PREMIS.
      required:
        - asset_id
        - code
        - object_class
        - digital_form
        - title
        - status
        - access_level
        - language
      properties:
        asset_id:
          type: string
          format: uuid
        code:
          type: string
          description: 'Ma nghiep vu - DC:identifier; tien to theo object_class: VM-KV/CT/HV/TL/NN-xxx'
          example: VM-HV-001
        object_class:
          $ref: '#/components/schemas/ObjectClass'
        digital_form:
          $ref: '#/components/schemas/DigitalForm'
        title:
          type: string
        description:
          description: Ap dung quy tac khuyet gia tri - xem muc 2.2
          oneOf:
            - type: string
            - $ref: '#/components/schemas/MissingValue'
        era:
          oneOf:
            - $ref: '#/components/schemas/EraInfo'
            - $ref: '#/components/schemas/MissingValue'
        current_location:
          oneOf:
            - type: string
            - $ref: '#/components/schemas/MissingValue'
        custodian_unit:
          oneOf:
            - type: string
            - $ref: '#/components/schemas/MissingValue'
        language:
          type: string
          example: vi
        status:
          $ref: '#/components/schemas/AssetStatus'
        access_level:
          $ref: '#/components/schemas/AccessLevel'
        contains_personal_data:
          type: boolean
        subjects:
          type: array
          items:
            $ref: '#/components/schemas/ControlledVocabularyRef'
        physical_artifact:
          $ref: '#/components/schemas/PhysicalArtifactRef'
        rights:
          $ref: '#/components/schemas/RightsRef'
        retention:
          $ref: '#/components/schemas/RetentionRef'
        current_version:
          $ref: '#/components/schemas/AssetVersionSummary'
        type_specific:
          $ref: '#/components/schemas/AssetTypeSpecific'
        premis_events:
          type: array
          items:
            $ref: '#/components/schemas/PremisEvent'
        collection_ids:
          type: array
          items:
            type: string
            format: uuid
        owner_user_id:
          type: string
          format: uuid
        digitization_batch_id:
          type: string
          format: uuid
          nullable: true
        completeness:
          type: number
          description: |
            Phan tram do day du ho so (0-100). Mau so loai tru truong khong_ap_dung;
            chua_xac_dinh/chua_nhap tinh la thieu; khong_ro/han_che tinh la da xu ly.
            Xem 00-ke-hoach-nang-cap.md muc 0quinquies.
          example: 87.5
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
    AssetFile:
      type: object
      properties:
        asset_file_id:
          type: string
          format: uuid
        asset_version_id:
          type: string
          format: uuid
        kind:
          type: string
          enum: [master, web, raw, thumbnail, preview]
        file_name:
          type: string
        format_puid:
          type: string
          description: Ma dinh danh dinh dang PRONOM
        size_bytes:
          type: integer
          format: int64
        storage_tier:
          type: string
          enum: [hot, aip, cold]
        checksum_sha256:
          type: string
          description: Gia tri bam SHA-256, tinh ngay khi ingest - PREMIS fixity
          example: 8f14e45fceea167a5a36dedd4bea2543
        fixity_checked_at:
          type: string
          format: date-time
          nullable: true
          description: Lan kiem tra toan ven gan nhat
        fixity_status:
          type: string
          enum: [da_xac_minh, lech_checksum, chua_kiem_tra]
        download_url:
          type: string
          format: uri
          nullable: true
          description: NULL neu chua Xuat ban va nguoi goi khong co quyen tai ban goc - xem muc 4
    AssetVersion:
      type: object
      properties:
        asset_version_id:
          type: string
          format: uuid
        asset_id:
          type: string
          format: uuid
        version_no:
          type: integer
        status:
          type: string
          enum: [dang_luu_tru, da_thay_the]
        change_reason:
          type: string
          nullable: true
        created_by:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        superseded_at:
          type: string
          format: date-time
          nullable: true
        signature:
          $ref: '#/components/schemas/SignatureInfo'
    AssetRelation:
      type: object
      properties:
        asset_relation_id:
          type: string
          format: uuid
        from_asset_id:
          type: string
          format: uuid
        to_asset_id:
          type: string
          format: uuid
          nullable: true
          description: Dung khi muc tieu la mot asset khac (nhom 3) - chinh xac 1 trong 2 truong to_* khac null
        to_physical_artifact_id:
          type: string
          format: uuid
          nullable: true
          description: Dung khi muc tieu la doi tuong di san goc (nhom 1, nhom 2, hoac nhom 3) - xem relation_type
        relation_type:
          type: string
          description: |
            Nhom 1 - ban dai dien so cua doi tuong (CIDOC-CRM P138, target to_physical_artifact_id):
            hasRepresentation, hasDrawing, hasConditionPhoto, hasRubbing, hasPreservationSurrogate
            (ban dan xuat bao hiem dinh dang - vd PLY/E57 cho splat, xem 07-mo-hinh-du-lieu.md muc 5.16;
            KHAC voi derivedFrom o nhom 3 vi day la nghia vu bao quan, khong phai dan xuat tien dung).
            Nhom 2 - doi tuong la chu de cua tu lieu DOC LAP co nien dai/ban quyen rieng
            (CIDOC-CRM P62/P67/P129, target to_physical_artifact_id): depictedIn, mentionedIn, subjectOf.
            Nhom 3 - quan he cau truc (target to_asset_id hoac to_physical_artifact_id):
            partOf (CIDOC-CRM P46), derivedFrom (ky thuat thuan tuy, xoa/tai sinh tu do).
            Xem 07-mo-hinh-du-lieu.md muc 5.11 - KHONG duoc gop nhom 1 va nhom 2, se dem sai
            so ban so hoa va gan sai chu the quyen.
          enum:
            - hasRepresentation
            - hasDrawing
            - hasConditionPhoto
            - hasRubbing
            - hasPreservationSurrogate
            - depictedIn
            - mentionedIn
            - subjectOf
            - partOf
            - derivedFrom
        note:
          type: string
          nullable: true
        created_at:
          type: string
          format: date-time
    AssetRelationCreateRequest:
      type: object
      required: [relation_type]
      description: Bat buoc dung dung 1 trong 2 truong to_asset_id / to_physical_artifact_id
      properties:
        to_asset_id:
          type: string
          format: uuid
        to_physical_artifact_id:
          type: string
          format: uuid
        relation_type:
          type: string
          enum:
            - hasRepresentation
            - hasDrawing
            - hasConditionPhoto
            - hasRubbing
            - hasPreservationSurrogate
            - depictedIn
            - mentionedIn
            - subjectOf
            - partOf
            - derivedFrom
        note:
          type: string
    PhysicalArtifact:
      type: object
      properties:
        physical_artifact_id:
          type: string
          format: uuid
        so_kiem_ke:
          type: string
          description: So kiem ke - Dieu 23 Luat Di san van hoa 45/2024/QH15
        name:
          type: string
        object_class:
          $ref: '#/components/schemas/PhysicalObjectClass'
        artifact_type:
          $ref: '#/components/schemas/ControlledVocabularyRef'
        condition_note:
          oneOf:
            - type: string
            - $ref: '#/components/schemas/MissingValue'
        current_location:
          type: string
        managing_unit:
          type: string
        last_inventory_date:
          type: string
          format: date
        next_inventory_due:
          type: string
          format: date
    PhysicalArtifactDossier:
      type: object
      description: Tra ve tu GET /physical-artifacts/{id}/dossier - phuc vu man Ho so doi tuong di san
      properties:
        physical_artifact:
          $ref: '#/components/schemas/PhysicalArtifact'
        representations:
          type: object
          description: Nhom 1 - ban dai dien so cua chinh doi tuong, theo tung relation_type
          properties:
            hasRepresentation:
              type: array
              items: { $ref: '#/components/schemas/AssetListItem' }
            hasDrawing:
              type: array
              items: { $ref: '#/components/schemas/AssetListItem' }
            hasConditionPhoto:
              type: array
              items: { $ref: '#/components/schemas/AssetListItem' }
            hasRubbing:
              type: array
              items: { $ref: '#/components/schemas/AssetListItem' }
        referenced_by:
          type: object
          description: Nhom 2 - tu lieu DOC LAP co noi dung nhac/chup toi doi tuong, KHONG tinh la ban dai dien
          properties:
            depictedIn:
              type: array
              items: { $ref: '#/components/schemas/AssetListItem' }
            mentionedIn:
              type: array
              items: { $ref: '#/components/schemas/AssetListItem' }
            subjectOf:
              type: array
              items: { $ref: '#/components/schemas/AssetListItem' }
        structure:
          type: object
          description: Nhom 3 - quan he cau truc (cay Toan khu - phan khu - cong trinh, UC-03)
          properties:
            part_of_parent:
              $ref: '#/components/schemas/PhysicalArtifactRef'
            has_parts:
              type: array
              items: { $ref: '#/components/schemas/PhysicalArtifactRef' }
    Collection:
      type: object
      properties:
        collection_id:
          type: string
          format: uuid
        slug:
          type: string
        name:
          type: string
        description:
          type: string
        cover_image_url:
          type: string
          format: uri
        asset_count:
          type: integer
        completeness:
          type: number
          description: Trung binh % do day du ho so cua cac du lieu so hoa trong bo suu tap
          example: 81.2
        updated_at:
          type: string
          format: date-time
    Dataset:
      type: object
      properties:
        dataset_id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        license:
          type: string
          example: CC-BY-4.0
        classification:
          type: string
          enum: [cong_khai, co_dieu_kien, khong_cong_khai]
        publish_status:
          type: string
          enum: [cho_duyet, da_cong_bo, da_thu_hoi]
        publish_channels:
          type: array
          items:
            type: string
            enum: [cong_du_lieu_quoc_gia, cong_du_lieu_tp_ha_noi, bo_cong_an_tong_hop]
        dataset_url:
          type: string
          format: uri
        formats:
          type: array
          items:
            type: string
        record_count:
          type: integer
        submitted_to_mps_at:
          type: string
          format: date-time
          nullable: true
          description: Ngay gui Bo Cong an tong hop - ND 165/2025/NĐ-CP Dieu 10
        updated_at:
          type: string
          format: date-time
    ShareRequest:
      type: object
      properties:
        share_request_id:
          type: string
          format: uuid
        org_name:
          type: string
        requested_scope:
          type: string
        purpose:
          type: string
        reference_doc_no:
          type: string
          nullable: true
        status:
          type: string
          enum: [cho_duyet, da_chap_thuan, tu_choi, da_thu_hoi]
        requested_at:
          type: string
          format: date-time
        decision_deadline:
          type: string
          format: date-time
        decided_at:
          type: string
          format: date-time
          nullable: true
        decided_by:
          type: string
          format: uuid
          nullable: true
        expires_at:
          type: string
          format: date-time
          nullable: true
        revoked_at:
          type: string
          format: date-time
          nullable: true
        revoke_reason:
          type: string
          nullable: true
    ShareRequestCreateRequest:
      type: object
      required: [org_name, requested_scope, purpose, reference_doc_no]
      properties:
        org_name:
          type: string
        requested_scope:
          type: string
          description: Mo ta pham vi du lieu de nghi (bo suu tap/du lieu so hoa cu the)
        purpose:
          type: string
        reference_doc_no:
          type: string
          description: So van ban de nghi chinh thuc - bat buoc, khong nhan yeu cau khong co can cu van ban
    AuditEntry:
      type: object
      properties:
        audit_log_id:
          type: string
          format: uuid
        occurred_at:
          type: string
          format: date-time
        actor_user_id:
          type: string
          format: uuid
          nullable: true
        actor_ip:
          type: string
          nullable: true
        action:
          type: string
        target_type:
          type: string
        target_id:
          type: string
        detail:
          type: object
        result:
          type: string
          enum: [thanh_cong, that_bai]
        record_hash:
          type: string
          description: Hash chuoi noi tiep (hash chain) - khong the sua/xoa
        prev_hash:
          type: string
    WebhookSubscription:
      type: object
      properties:
        webhook_subscription_id:
          type: string
          format: uuid
        callback_url:
          type: string
          format: uri
        event_types:
          type: array
          items:
            type: string
        secret:
          type: string
          nullable: true
          description: Chi tra ve day du dung MOT LAN trong response tao moi
        status:
          type: string
          enum: [active, revoked]
        created_at:
          type: string
          format: date-time
    PageInfo:
      type: object
      properties:
        page:
          type: integer
        page_size:
          type: integer
        total_items:
          type: integer
        total_pages:
          type: integer
    Error:
      type: object
      properties:
        code:
          type: string
          example: VALIDATION_ERROR
        message:
          type: string
        details:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              issue:
                type: string
        trace_id:
          type: string
    AssetListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/AssetListItem'
        pagination:
          $ref: '#/components/schemas/PageInfo'
    AssetFileListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/AssetFile'
    AssetRelationListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/AssetRelation'
    AssetVersionListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/AssetVersion'
    PhysicalArtifactListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/PhysicalArtifact'
        pagination:
          $ref: '#/components/schemas/PageInfo'
    CollectionListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Collection'
        pagination:
          $ref: '#/components/schemas/PageInfo'
    DatasetListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Dataset'
        pagination:
          $ref: '#/components/schemas/PageInfo'
    ShareRequestListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/ShareRequest'
        pagination:
          $ref: '#/components/schemas/PageInfo'
    AuditLogListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/AuditEntry'
        pagination:
          $ref: '#/components/schemas/PageInfo'
```

### 2.1. Ánh xạ 7 trường siêu dữ liệu bắt buộc theo TT 05/2025/TT-BNV vào schema `Asset`

| # | Trường theo TT 05/2025/TT-BNV | Trường trong schema `Asset` |
|---|---|---|
| 1 | Mã định danh | `code` |
| 2 | Thời hạn bảo quản | `retention.retention_period` |
| 3 | Tiêu đề | `title` |
| 4 | Ngôn ngữ | `language` |
| 5 | Từ khóa | `subjects[]` |
| 6 | Mức độ tiếp cận | `access_level` |
| 7 | Chữ ký số | `current_version.signature.*` |

### 2.2. Quy tắc công bố trường khuyết giá trị

Áp dụng cho mọi trường dùng `MissingValue` (mục trên) — vừa là yêu cầu bảo mật, vừa là tuân thủ Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 (không suy diễn ngược thông tin hạn chế công bố từ việc "trường bị thiếu"):

| Mã | API công khai (`assets:read` qua API key/OAuth2 phạm vi công khai, và `/oai`) | API nội bộ |
|---|---|---|
| `khong_ap_dung` | **Bỏ hẳn phần tử** khỏi response | Trả đầy đủ đối tượng `MissingValue` |
| `chua_nhap` | **Bỏ hẳn phần tử** | Trả đầy đủ |
| `han_che` | **Bỏ hẳn phần tử** — đây là trường hợp nhạy cảm nhất, không được để lộ cả sự tồn tại của giá trị | Trả **đầy đủ giá trị thật**, không chỉ đối tượng `MissingValue` |
| `khong_ro` | **Xuất giá trị chuẩn hoá** (đối tượng `MissingValue` với `missing: khong_ro`) | Trả đầy đủ |
| `chua_xac_dinh` | **Xuất giá trị chuẩn hoá** (đối tượng `MissingValue` với `missing: chua_xac_dinh`) | Trả đầy đủ |

Nguyên tắc phân biệt: `khong_ro`/`chua_xac_dinh` là kết luận đã xử lý (dù chưa biết đáp án), công bố minh bạch giúp tăng độ tin cậy hồ sơ khoa học; `khong_ap_dung`/`chua_nhap`/`han_che` không mang thông tin nghiệp vụ nào đáng công bố hoặc bị hạn chế có chủ đích, nên client công khai không nhận được phần tử đó thay vì nhận một giá trị rỗng gây hiểu nhầm.

### 2.3. Ví dụ `hasPreservationSurrogate`

Splat toàn cảnh Giếng Thiên Quang `VM-KV-00003.SPL01` có một quan hệ `hasPreservationSurrogate` trỏ tới đám mây điểm bảo hiểm `VM-KV-00003.PCL01` — khác `hasRepresentation` (cả hai `asset` đều đại diện cho cùng một đối tượng `VM-KV-00003`, nhưng chỉ bản PCL mới mang nghĩa vụ bảo quản bắt buộc vì `.splat` chưa chuẩn hoá):

```json
{
  "from_asset_id": "a1b2c3d4-...  // VM-KV-00003.SPL01",
  "to_physical_artifact_id": "e5f6...  // VM-KV-00003 (Giếng Thiên Quang)",
  "relation_type": "hasPreservationSurrogate",
  "note": "Ban PLY dam may diem do dac goc, doi chieu voi asset VM-KV-00003.PCL01"
}
```

Ngoài bản PLY/E57, chính sách bảo quản splat còn yêu cầu giữ lại **ảnh nguồn và tham số huấn luyện** để có thể tái tạo lại mô hình nếu công cụ hiện tại ngừng được hỗ trợ (`02-quy-trinh-bao-quan-sao-luu.md` mục 7.2). Trong mô hình dữ liệu, phần này không cần thêm quan hệ mới: ảnh nguồn lưu như `asset_file` với `kind = raw` thuộc `asset_version` của chính `asset` splat, còn phần mềm huấn luyện + phiên bản thuật toán đã có sẵn ở `type_specific.training_software`/`training_algorithm_version` (schema `SplatFields`, mục 2) — đủ để phục dựng quy trình mà không cần mô hình hoá thêm.

---

## 3. Mẫu bản ghi OAI-PMH (`oai_dc`)

Ví dụ phản hồi `GetRecord` cho một bia Tiến sĩ, đúng dữ kiện lịch sử: **khoa thi tổ chức năm Nhâm Tuất 1442** (niên hiệu Đại Bảo 3, triều Lê Thái Tông); **bia dựng năm 1484** (niên hiệu Hồng Đức 15, triều Lê Thánh Tông, theo lệnh dựng bia ghi danh các khoa thi từ 1442). Trường `dc:date` giữ giá trị chuẩn hoá theo thời điểm dựng bia (mốc tạo tác của hiện vật); niên đại khoa thi được ghi rõ trong `dc:description` để không nhầm hai mốc thời gian khác nhau.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/
                              http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>2026-08-12T02:00:00Z</responseDate>
  <request verb="GetRecord" identifier="oai:dsvanmieu.gov.vn:VM-HV-001"
           metadataPrefix="oai_dc">https://api.dsvanmieu.gov.vn/oai</request>
  <GetRecord>
    <record>
      <header>
        <identifier>oai:dsvanmieu.gov.vn:VM-HV-001</identifier>
        <datestamp>2026-08-08T09:12:00Z</datestamp>
        <setSpec>bia-tien-si</setSpec>
      </header>
      <metadata>
        <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
                    xmlns:dc="http://purl.org/dc/elements/1.1/"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/
                                        http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
          <!-- Anh xa truc tiep TCVN 7980-1:2024 (ISO 15836-1:2017) - Bo yeu to sieu du lieu Dublin Core -->
          <dc:identifier>VM-HV-001</dc:identifier>
          <dc:title>Bia Tiến sĩ khoa Nhâm Tuất (1442)</dc:title>
          <dc:title xml:lang="en">Doctoral Stele of the Nham Tuat Examination Course (1442)</dc:title>
          <dc:creator>Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám</dc:creator>
          <dc:subject>Bia Tiến sĩ</dc:subject>
          <dc:subject>Khoa cử</dc:subject>
          <dc:subject>Nho giáo</dc:subject>
          <dc:subject xsi:type="dcterms:URI">http://vocab.getty.edu/aat/300010331</dc:subject>
          <dc:description xml:lang="vi">
            Bia đá ghi danh 33 vị đỗ khoa thi Hội năm Nhâm Tuất, niên hiệu Đại Bảo thứ 3
            (1442), triều Lê Thái Tông. Bia được dựng năm 1484, niên hiệu Hồng Đức thứ 15,
            triều Lê Thánh Tông, cùng đợt dựng bia ghi danh các khoa thi tổ chức từ năm 1442.
            Bản ghi số hóa: scan photogrammetry, độ phân giải bề mặt 0,2 mm.
          </dc:description>
          <dc:publisher>Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám</dc:publisher>
          <dc:date>1484</dc:date>
          <dc:type>Hiện vật — bia đá khắc chữ Hán</dc:type>
          <dc:type xsi:type="dcterms:URI">http://vocab.getty.edu/aat/300010331</dc:type>
          <dc:format>model/gltf-binary</dc:format>
          <dc:identifier xsi:type="dcterms:URI">https://api.dsvanmieu.gov.vn/api/v1/assets/VM-HV-001</dc:identifier>
          <dc:source>Đại Việt lịch triều đăng khoa lục</dc:source>
          <dc:language>vi</dc:language>
          <dc:relation>Vườn bia Tiến sĩ — dãy Đông, Văn Miếu — Quốc Tử Giám</dc:relation>
          <dc:coverage>Hà Nội, Việt Nam</dc:coverage>
          <dc:rights>In Copyright — Educational Use Permitted (InC-EDU)</dc:rights>
        </oai_dc:dc>
      </metadata>
    </record>
  </GetRecord>
</OAI-PMH>
```

**Áp dụng quy tắc mục 2.2 cho `oai_dc`** (kênh `/oai` luôn là công khai): nếu `dc:creator` của một ảnh tư liệu có `missing: khong_ro` (đã tra cứu, không xác định được tác giả), phần tử vẫn xuất hiện với giá trị chuẩn hoá thay vì mất tích khó hiểu:

```xml
<dc:creator>Không rõ tác giả (đã tra cứu, chưa xác định được nguồn)</dc:creator>
```

Ngược lại, nếu một trường của bản ghi có `missing: han_che` (vd toạ độ chi tiết của hiện vật quý dễ bị xâm hại), phần tử `dc:coverage` tương ứng **bị lược bỏ hoàn toàn** khỏi XML — không xuất placeholder, không xuất giá trị rỗng — đúng nguyên tắc "không để lộ cả sự tồn tại của giá trị hạn chế".

---

## 4. Bảng mã lỗi

| HTTP | `code` | Ý nghĩa | Ghi chú |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Tham số/nội dung request không hợp lệ cú pháp hoặc thiếu trường bắt buộc | `details[]` liệt kê từng trường lỗi |
| 401 | `UNAUTHORIZED` | Thiếu hoặc sai token OAuth2 / API key | |
| 401 | `TOKEN_EXPIRED` | Token OAuth2 hết hạn | Client tự làm mới qua `tokenUrl` |
| 403 | `FORBIDDEN_SCOPE` | Token/khoá hợp lệ nhưng không đủ `scope` cho endpoint | |
| 403 | `FORBIDDEN_MTLS_REQUIRED` | Endpoint yêu cầu kênh mTLS (`x-mtls-required: true`) nhưng request đến ngoài kênh này | Áp dụng nhóm `/integrations/lgsp/*` |
| 404 | `NOT_FOUND` | Không tìm thấy tài nguyên theo id | |
| 409 | `CONFLICT_STATE` | Hành động xung đột với trạng thái hiện tại (vd duyệt yêu cầu đã bị thu hồi) | |
| 422 | `UNPROCESSABLE_RELATION` | Vi phạm ràng buộc nghiệp vụ (vd tạo quan hệ tới chính nó, `relation_type` không hợp với `digital_form` liên quan) | |
| 429 | `RATE_LIMITED` | Vượt hạn mức request theo consumer | Header `X-RateLimit-Reset` |
| 500 | `INTERNAL_ERROR` | Lỗi hệ thống không xác định | `trace_id` dùng để tra cứu log |
| 503 | `UPSTREAM_UNAVAILABLE` | Hệ thống phụ thuộc tạm thời không phản hồi (vd LGSP, kho lưu trữ) | Client nên thử lại có backoff |

---

## 5. Quy ước phân trang, sắp xếp, idempotency

**Phân trang** — tham số `page` (bắt đầu từ 1) và `page_size` (mặc định 20, tối đa 200). Mọi response danh sách trả về bọc trong `{ data: [...], pagination: { page, page_size, total_items, total_pages } }`. Không hỗ trợ offset thô để tránh nhầm lẫn giữa các phiên bản client.

**Sắp xếp** — tham số `sort` dạng `truong:huong`, có thể nối nhiều tiêu chí bằng dấu phẩy, ví dụ `sort=updated_at:desc,title:asc`. Trường không hợp lệ trả `400 VALIDATION_ERROR`. Mặc định `updated_at:desc`.

**Idempotency** — mọi request `POST` tạo mới hoặc gây hiệu ứng phụ (`/assets/{id}/relations`, `/share-requests`, `/integrations/lgsp/webhook-subscriptions`) chấp nhận header `Idempotency-Key` do client tự sinh (khuyến nghị UUID v4). Server lưu kết quả response gắn với khoá này trong **24 giờ**; nếu nhận lại đúng khoá trong cửa sổ đó, trả về **response đã lưu trước đó** (không tạo bản ghi trùng) kèm header `Idempotency-Replayed: true`. Dùng khi client gặp timeout mạng và cần thử lại an toàn, đặc biệt quan trọng cho `/share-requests` (tránh nhân bản yêu cầu chia sẻ) và các thao tác qua kênh LGSP (mạng liên cơ quan có độ trễ/rớt gói cao hơn nội bộ).

---

*Tài liệu này đọc cùng `07-mo-hinh-du-lieu.md` (mô hình dữ liệu đầy đủ phía sau các schema trên) và `02-quy-trinh-bao-quan-sao-luu.md` (vòng đời lưu trữ vật lý của tệp tin sau `asset_file`).*
