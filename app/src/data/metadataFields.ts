import type { MetadataField, UploadDataType } from '../services/types';

// Ported from `METADATA_FIELDS` in v3.html.
export const METADATA_FIELDS: Record<UploadDataType, MetadataField[]> = {
  'Scan 3D': [
    { label: 'Mã tài sản', placeholder: 'VM-3D-018', span: 1, req: true },
    { label: 'Niên đại', placeholder: '1442', span: 1 },
    { label: 'Tên tài sản', placeholder: 'Rùa đá đội bia số 14', span: 2, req: true },
    { label: 'Vị trí', placeholder: 'Vườn bia Tiến sĩ — dãy Đông', span: 2 },
    { label: 'Phương pháp scan', placeholder: 'Photogrammetry / LiDAR / Structured light', span: 1 },
    { label: 'Số ảnh / điểm quét', placeholder: '320 ảnh', span: 1 },
  ],
  Splat: [
    { label: 'Mã tài sản', placeholder: 'VM-SP-011', span: 1, req: true },
    { label: 'Niên đại', placeholder: '—', span: 1 },
    { label: 'Tên tài sản', placeholder: 'Sân trước nhà Bái Đường', span: 2, req: true },
    { label: 'Vị trí', placeholder: 'Khu thứ ba', span: 2 },
    { label: 'Số ảnh nguồn', placeholder: '1.200 ảnh', span: 1 },
    { label: 'Diện tích quét (m²)', placeholder: '180', span: 1 },
  ],
  'Tài liệu': [
    { label: 'Mã tài sản', placeholder: 'VM-DOC-015', span: 1, req: true },
    { label: 'Niên đại', placeholder: '1824', span: 1 },
    { label: 'Tên tài sản', placeholder: 'Sắc phong niên hiệu Minh Mệnh 5', span: 2, req: true },
    { label: 'Ngôn ngữ gốc', placeholder: 'Hán Nôm', span: 1 },
    { label: 'Số trang', placeholder: '12', span: 1 },
  ],
  Media: [
    { label: 'Mã tài sản', placeholder: 'VM-VID-004', span: 1, req: true },
    { label: 'Ngày ghi hình / ghi âm', placeholder: '10/08/2026', span: 1 },
    { label: 'Tên tài sản', placeholder: 'Phóng sự lễ khai bút xuân 2026', span: 2, req: true },
    { label: 'Thời lượng', placeholder: '00:12:30', span: 1 },
    { label: 'Người thực hiện', placeholder: 'Phạm Quốc Đạt', span: 1 },
  ],
};

// Ported from the inline `acceptFormats` / `acceptLimit` maps in v3.html.
export const ACCEPT_FORMATS: Record<UploadDataType, string[]> = {
  'Scan 3D': ['GLB', 'OBJ', 'E57', 'PLY'],
  Splat: ['SPLAT', 'PLY', 'ZIP ảnh nguồn'],
  'Tài liệu': ['TIFF 600dpi', 'PDF/A', 'JP2'],
  Media: ['ProRes', 'MP4', 'WAV', 'TIFF'],
};

export const ACCEPT_LIMIT: Record<UploadDataType, string> = {
  'Scan 3D': 'Tối đa 50 GB mỗi tệp',
  Splat: 'Tối đa 50 GB mỗi tệp',
  'Tài liệu': 'Tối đa 2 GB mỗi tệp',
  Media: 'Tối đa 50 GB mỗi tệp',
};

// Ported from the `upCollOptions` source list in v3.html.
export const UPLOAD_COLLECTION_OPTIONS: string[] = [
  'Bia Tiến sĩ',
  'Kiến trúc & không gian',
  'Hiện vật thờ tự',
  'Tư liệu Hán Nôm',
  'Ảnh tư liệu lịch sử',
  'Media thuyết minh',
];

// Ported from the `upTagChips` source list in v3.html.
export const UPLOAD_TAG_OPTIONS: string[] = [
  'bia đá',
  'rùa đá',
  'chữ Hán Nôm',
  'đồ thờ',
  'điêu khắc',
  'kiến trúc',
  'ngoài trời',
  'nội thất',
];

export const UPLOAD_TYPES: UploadDataType[] = ['Scan 3D', 'Splat', 'Tài liệu', 'Media'];

// Ported from the fixed `parseBatchExcel` result rows in v3.html — `type`
// (old AssetType) replaced by `digitalForm` (0bis two-axis split); era for
// the "Sân trước nhà Bái Đường" precinct row no longer left as bare "—".
export const BATCH_PARSE_ROWS = [
  { code: 'VM-HV-00013.M3D01', name: 'Bia Tiến sĩ khoa Đinh Dậu (1477)', digitalForm: 'mesh3d' as const, era: '1477', loc: 'Vườn bia Tiến sĩ', matched: true },
  { code: 'VM-KV-00004.SPL01', name: 'Sân trước nhà Bái Đường', digitalForm: 'splat' as const, era: '1070 (khởi dựng cùng Văn Miếu)', loc: 'Khu thứ tư', matched: true },
  { code: 'VM-TL-00015.TXT01', name: 'Sắc phong niên hiệu Minh Mệnh 5', digitalForm: 'text' as const, era: '1824', loc: 'Kho lưu trữ', matched: false },
  { code: 'VM-NN-00015.IMG01', name: 'Ảnh lễ khai giảng, 1965', digitalForm: 'image' as const, era: '1965', loc: 'Kho lưu trữ', matched: true },
  { code: 'VM-HV-00014.M3D01', name: 'Rùa đá đội bia số 31', digitalForm: 'mesh3d' as const, era: 'Thời Lê — Mạc (1442–1789)', loc: 'Vườn bia Tiến sĩ', matched: true },
  { code: 'VM-TL-00016.TXT01', name: 'Bản dập văn bia khoa thi 1511', digitalForm: 'text' as const, era: '1511', loc: 'Kho lưu trữ', matched: false },
];
