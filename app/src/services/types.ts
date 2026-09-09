// Domain types shared by the mock services (and, later, real API-backed
// implementations). Components only ever import these — never `src/data`
// directly.

// C3 — pipeline 5 → 9 trạng thái chính (tuần tự, xem `data/pipeline.ts` —
// `PIPELINE_SEQUENCE`) + 2 trạng thái NGOÀI chuỗi tuần tự:
//   'Cần số hóa lại'  — nhánh THẤT BẠI của bước Kiểm định chất lượng (QC),
//                         vòng lại 'Đang xử lý' sau khi số hóa lại.
//   'Đã gỡ/thu hồi'   — ngoài luồng, đạt được từ các trạng thái đã xuất bản
//                         qua hành động "Gỡ xuất bản"; bản ghi được GIỮ LẠI,
//                         không xoá vĩnh viễn (deaccession, PREMIS DEACCESSION).
export type AssetStatus =
  | 'Chờ xử lý'
  | 'Đang xử lý'
  | 'Kiểm định chất lượng'
  | 'Chờ duyệt'
  | 'Thẩm định nội dung'
  | 'Đã duyệt'
  | 'Xuất bản'
  | 'Đã lưu trữ — đang giám sát'
  | 'Đã kiểm kê'
  | 'Cần số hóa lại'
  | 'Đã gỡ/thu hồi';

/**
 * What the real heritage object IS (đối tượng di sản có thật). Independent
 * from `DigitalForm` — one physical object can have several digital forms.
 */
export type ObjectClass = 'precinct' | 'structure' | 'artifact' | 'document' | 'av';

/** What KIND of digital capture a given record is (sản phẩm số hóa). */
export type DigitalForm = 'mesh3d' | 'splat' | 'pointcloud' | 'drawing' | 'image' | 'text' | 'video' | 'audio';

/** Library filter chip values for the `objectClass` axis. */
export type ObjectClassFilter = 'Tất cả' | ObjectClass;

/** Library filter chip values for the `digitalForm` axis — 'Media' groups image/video/audio. */
export type DigitalFormFilter = 'Tất cả' | DigitalForm | 'Media';

/** Nhóm quan hệ 2 (0ter) — đối tượng di sản là CHỦ ĐỀ của một tư liệu độc lập, không phải bản đại diện số của chính nó. */
export type RelationKind = 'depictedIn' | 'mentionedIn' | 'subjectOf' | 'hasRubbing';

export interface RelatedObjectLink {
  /** physicalArtifactId của đối tượng di sản mà bản ghi này nói về / khắc họa / nhắc tới. */
  physicalArtifactId: string;
  kind: RelationKind;
}

export interface Asset {
  id: number;
  /**
   * Mã tầng 2 (bản ghi dữ liệu số) — `<physicalObjectId>.<DF><nn>`, ví dụ
   * `VM-CT-00007.SPL01`. Đây là mã hiển thị/định danh chính của bản ghi.
   */
  code: string;
  /** Mã tầng 1 (đối tượng di sản, bền vững) — `VM-<OC>-NNNNN`, ví dụ `VM-CT-00007`. */
  physicalObjectId: string;
  name: string;
  /** Loại đối tượng di sản (khuôn viên / công trình / hiện vật / tài liệu / nghe nhìn). */
  objectClass: ObjectClass;
  /** Dạng dữ liệu số của riêng bản ghi này (mô hình 3D / splat / ảnh / văn bản…). */
  digitalForm: DigitalForm;
  fmt: string;
  size: string;
  /** Numeric size in MB — single source of truth `size` is formatted from. */
  sizeMB: number;
  /** Niên đại hiển thị (can chi/niên hiệu nguyên văn), hoặc nhãn khuyết giá trị đã format — xem `data/missingValues.ts`. Không bao giờ để chuỗi rỗng hay "—" tự do. Tương đương `era_display` ở 0quinquies. */
  era: string;
  /** Niên đại chuẩn hoá dạng EDTF (ISO 8601-2) — ví dụ '1484', '1484?', '1484~', '18XX', '1740/1786', 'unknown'. Optional: chỉ điền khi cần phân biệt độ chắc chắn (0quinquies mục 3); phần lớn bản ghi mock chỉ cần `era`. */
  eraEdtf?: string;
  /** Độ chắc chắn của niên đại — đi kèm `eraEdtf`. */
  eraCertainty?: 'certain' | 'uncertain' | 'approximate' | 'century' | 'range' | 'unknown';
  loc: string;
  coll: string;
  owner: string;
  updated: string;
  status: AssetStatus;
  desc: string;
  /** Classification tags — only a subset of mock assets carry any, ported as-is from v3. */
  tags: string[];
  /**
   * Groups multiple digitalForm records that represent the SAME physical
   * object (e.g. Khuê Văn Các has a mesh3d + splat + pointcloud + drawing
   * record, all sharing one physicalArtifactId — cùng `physicalObjectId`).
   * Quan hệ nhóm 1 (hasRepresentation/hasDrawing/hasConditionPhoto) của
   * 0ter được biểu diễn ngầm định bằng việc CÙNG giá trị này.
   */
  physicalArtifactId?: string;
  /** Quan hệ nhóm 2 (0ter) — bản ghi này (thường là document/av) nói về một đối tượng di sản khác. */
  relatedObject?: RelatedObjectLink;
  /** True for assets in the 82-bia-Tiến-sĩ UNESCO Memory of the World group. */
  unesco?: boolean;
  /** Số kiểm kê hiện vật gốc của Trung tâm — trường song song, KHÔNG trộn vào mã hệ thống (0quater). Bắt buộc với HV/TL: dùng sentinel CHUA_NHAP khi chưa có. */
  soKiemKe?: string;
  /** Số đăng ký di vật/cổ vật/bảo vật quốc gia — khi áp dụng. */
  soDangKy?: string;
  /** Mã hồ sơ khoa học xếp hạng di tích — với KV/CT. */
  maHoSoDiTich?: string;
}

export interface Collection {
  name: string;
  count: number;
  desc: string;
  types: string;
  updated: string;
  size: string;
  slug: string;
  cover: string;
}

export interface LogEntry {
  time: string;
  user: string;
  action: string;
  target: string;
  note: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
  scope: string;
  last: string;
}

export interface ConnectionSyncState {
  enabled: boolean;
  freq: 'realtime' | 'daily' | 'manual';
}

export interface Connection {
  kind: string;
  name: string;
  desc: string;
  status: string;
  sync: string;
  endpoint: string;
  keyTail: string;
}

export interface ApiEndpoint {
  name: string;
  kind: string;
  fmt: string;
  calls: string;
  status: string;
}

export interface ShareRequest {
  org: string;
  what: string;
  kind: string;
  date: string;
  status: string;
}

export interface ComplianceItem {
  label: string;
  state: string;
}

export interface UploadItem {
  id: number | string;
  name: string;
  size: string;
  pct: number;
  error?: string;
}

export interface MetadataField {
  label: string;
  placeholder: string;
  span: number;
  req?: boolean;
}

export type UploadDataType = 'Scan 3D' | 'Splat' | 'Tài liệu' | 'Media';

export interface BatchRow {
  code: string;
  name: string;
  digitalForm: DigitalForm;
  era: string;
  loc: string;
  matched: boolean;
}

export interface DashboardStat {
  k: string;
  v: string;
  sub: string;
  icon: string;
  trend: string;
  trendUp: boolean;
  spark: string;
  variant: 'neutral' | 'accent' | 'ink';
}

export interface StorageBreakdownItem {
  label: string;
  size: string;
  pct: number;
  dot: string;
}

export interface PipelineStep {
  num: string;
  label: AssetStatus;
  n: number;
}
