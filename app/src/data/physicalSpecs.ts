// Đặc điểm vật lý của ĐỐI TƯỢNG THẬT (không phải của tệp số hoá).
//
// Mô hình theo CIDOC-CRM E54 Dimension (ISO 21127) và Spectrum 5.0 của Collections Trust:
// kích thước hiện vật KHÔNG phải vài ô cố định mà là **bảng đo lặp lại**, vì:
//   - mỗi loại vật có bộ chiều đo khác nhau (chuông đo đường kính miệng, bia đo trán bia);
//   - "cao 1,6 m" vô nghĩa nếu không biết đo BỘ PHẬN nào (cả bệ hay không bệ);
//   - hiện vật cong vênh/sứt mẻ không có trị số duy nhất → cần tính chất trị số;
//   - trị số suy từ mô hình 3D phải phân biệt được với đo tay tại chỗ.
//
// Module này là NGUỒN DUY NHẤT cho cả màn Chi tiết (hiển thị) lẫn màn Nhập dữ liệu (biểu mẫu)
// — xem được gì thì nhập được nấy, không để hai nơi lệch nhau.

import type { ObjectClass } from '../services/types';
import type { MissingReason } from './missingValues';
import { PHYSICAL_SPECS_DATA } from './physicalSpecsData';

// ---------------------------------------------------------------------------
// Bảng đo (CIDOC-CRM E54)
// ---------------------------------------------------------------------------

export type DimensionType =
  | 'cao'
  | 'rong'
  | 'day'
  | 'duongKinh'
  | 'chuVi'
  | 'khoiLuong'
  | 'dienTich'
  | 'doDayThanh'
  | 'doSau';

export const DIMENSION_LABELS: Record<DimensionType, string> = {
  cao: 'Chiều cao',
  rong: 'Chiều rộng',
  day: 'Chiều dày / sâu',
  duongKinh: 'Đường kính',
  chuVi: 'Chu vi',
  khoiLuong: 'Khối lượng',
  dienTich: 'Diện tích',
  doDayThanh: 'Độ dày thành',
  doSau: 'Độ sâu',
};

/** Đơn vị hợp lệ theo từng chiều đo — chặn nhập "cao 5 kg". */
export const DIMENSION_UNITS: Record<DimensionType, string[]> = {
  cao: ['cm', 'm'],
  rong: ['cm', 'm'],
  day: ['cm', 'm'],
  duongKinh: ['cm', 'm'],
  chuVi: ['cm', 'm'],
  khoiLuong: ['kg', 'tấn'],
  dienTich: ['m²'],
  doDayThanh: ['mm', 'cm'],
  doSau: ['cm', 'm'],
};

/** Tính chất trị số — hiện vật thật hiếm khi có con số tuyệt đối. */
export type DimensionQualifier = 'chinhXac' | 'xapXi' | 'toiDa' | 'uocLuong';

export const QUALIFIER_LABELS: Record<DimensionQualifier, string> = {
  chinhXac: 'Chính xác',
  xapXi: 'Xấp xỉ',
  toiDa: 'Tối đa',
  uocLuong: 'Ước lượng',
};

/**
 * Phương pháp đo. `quet3D` là điểm mạnh nghiệp vụ: đo trên bản số hoá mà không
 * phải chạm vào hiện vật gốc — giảm rủi ro hư hại khi kiểm kê định kỳ.
 */
export type MeasurementMethod = 'thuocDay' | 'thuocKep' | 'quet3D' | 'trichBanVe' | 'canDienTu';

export const METHOD_LABELS: Record<MeasurementMethod, string> = {
  thuocDay: 'Thước dây',
  thuocKep: 'Thước kẹp',
  quet3D: 'Đo trên mô hình 3D',
  trichBanVe: 'Trích từ bản vẽ',
  canDienTu: 'Cân điện tử',
};

export interface Measurement {
  type: DimensionType;
  /** Bộ phận được đo — bắt buộc khi vật có nhiều phần (thân bia / trán bia / rùa đội bia). */
  part: string;
  value: number;
  unit: string;
  qualifier: DimensionQualifier;
  method: MeasurementMethod;
  measuredBy: string;
  measuredAt: string;
  /** Khi method = 'quet3D': mã bản ghi dữ liệu số đã dùng để đo (truy vết được). */
  derivedFrom?: string;
}

// ---------------------------------------------------------------------------
// Trường mô tả vật lý riêng theo loại đối tượng
// ---------------------------------------------------------------------------

export interface SpecField {
  key: string;
  label: string;
  /** Gợi ý nhập; cũng dùng làm ví dụ trong biểu mẫu. */
  placeholder?: string;
  /** Hiện ở nhóm nâng cao (progressive disclosure) thay vì nhóm chính. */
  advanced?: boolean;
}

/** Chiều đo gợi ý sẵn + trường riêng, theo loại đối tượng (mục 0sexies của kế hoạch). */
export interface ObjectClassSpecPreset {
  /** Bộ chiều đo mồi sẵn khi thêm bản ghi đo mới. */
  suggestedDimensions: Array<{ type: DimensionType; part: string }>;
  fields: SpecField[];
}

export const SPEC_PRESETS: Record<ObjectClass, ObjectClassSpecPreset> = {
  artifact: {
    suggestedDimensions: [
      { type: 'cao', part: 'toàn bộ' },
      { type: 'rong', part: 'toàn bộ' },
      { type: 'day', part: 'toàn bộ' },
      { type: 'khoiLuong', part: 'toàn bộ' },
    ],
    fields: [
      { key: 'chatLieu', label: 'Chất liệu', placeholder: 'Đá xanh · đồng · gỗ mít sơn son thếp vàng' },
      { key: 'kyThuatCheTac', label: 'Kỹ thuật chế tác', placeholder: 'Chạm khắc đá · đúc đồng' },
      { key: 'soChuMinhVan', label: 'Số chữ minh văn', placeholder: '1.200', advanced: true },
      { key: 'soDongMinhVan', label: 'Số dòng minh văn', placeholder: '32', advanced: true },
      { key: 'tinhTrangBaoQuan', label: 'Tình trạng bảo quản', placeholder: 'Tốt; phong hoá nhẹ mặt trước' },
      { key: 'huongDat', label: 'Hướng đặt', placeholder: 'Quay hướng Nam', advanced: true },
    ],
  },
  structure: {
    suggestedDimensions: [
      { type: 'dienTich', part: 'mặt bằng xây dựng' },
      { type: 'cao', part: 'từ nền đến bờ nóc' },
      { type: 'rong', part: 'mặt bằng' },
    ],
    fields: [
      { key: 'soGian', label: 'Số gian', placeholder: '3 gian 2 chái' },
      { key: 'soTangMai', label: 'Số tầng mái', placeholder: '2' },
      { key: 'soCot', label: 'Số cột', placeholder: '16', advanced: true },
      { key: 'duongKinhCot', label: 'Đường kính cột (cm)', placeholder: '32', advanced: true },
      { key: 'vatLieuChinh', label: 'Vật liệu chính', placeholder: 'Gỗ lim, gạch Bát Tràng, ngói mũi hài' },
      { key: 'huongCongTrinh', label: 'Hướng công trình', placeholder: 'Nam' },
      { key: 'caoDoNen', label: 'Cao độ nền (m)', placeholder: '+0,45 so với sân', advanced: true },
      { key: 'tinhTrangBaoQuan', label: 'Tình trạng bảo quản', placeholder: 'Đã trùng tu năm 1994' },
    ],
  },
  precinct: {
    suggestedDimensions: [
      { type: 'dienTich', part: 'toàn phân khu' },
      { type: 'chuVi', part: 'ranh giới' },
      { type: 'doSau', part: 'lòng giếng / hồ' },
    ],
    fields: [
      { key: 'lopPhuBeMat', label: 'Lớp phủ bề mặt', placeholder: 'Gạch Bát Tràng · thảm cỏ · mặt nước' },
      { key: 'caoDo', label: 'Cao độ (m)', placeholder: '+7,2 (hệ VN-2000)', advanced: true },
      { key: 'ranhGioi', label: 'Ranh giới (đa giác toạ độ)', placeholder: 'Tệp GeoJSON đính kèm', advanced: true },
    ],
  },
  document: {
    suggestedDimensions: [
      { type: 'cao', part: 'tờ' },
      { type: 'rong', part: 'tờ' },
    ],
    fields: [
      { key: 'chatLieuMangTin', label: 'Chất liệu mang tin', placeholder: 'Giấy dó nhuộm vàng · mộc bản gỗ thị' },
      { key: 'soTo', label: 'Số tờ / trang', placeholder: '12' },
      { key: 'kichThuocKhungChu', label: 'Kích thước khung chữ (cm)', placeholder: '24 × 16', advanced: true },
      { key: 'soDong', label: 'Số dòng mỗi tờ', placeholder: '9', advanced: true },
      { key: 'soChuMoiDong', label: 'Số chữ mỗi dòng', placeholder: '20', advanced: true },
      { key: 'anTrien', label: 'Ấn triện', placeholder: 'Một ấn son hình vuông góc trên bên phải', advanced: true },
      { key: 'tinhTrangBaoQuan', label: 'Tình trạng bảo quản', placeholder: 'Mờ góc phải, nếp gấp giữa' },
    ],
  },
  av: {
    suggestedDimensions: [{ type: 'cao', part: 'vật mang tin' }, { type: 'rong', part: 'vật mang tin' }],
    fields: [
      { key: 'vatMangTinGoc', label: 'Vật mang tin gốc', placeholder: 'Phim kính · băng từ · sinh ra ở dạng số' },
      { key: 'tinhTrangVatMangTin', label: 'Tình trạng vật mang tin', placeholder: 'Xước nhẹ, đã phục chế số', advanced: true },
    ],
  },
};

// ---------------------------------------------------------------------------
// Vị trí có cấu trúc (thay chuỗi tự do `loc`)
// ---------------------------------------------------------------------------

export interface StructuredLocation {
  /** Phân khu: Hồ Văn · Vườn Giám · Nhập Đạo · Thành Đạt · Đại Thành · Thái Học */
  phanKhu: string;
  /** Công trình chứa đối tượng (rỗng nếu chính nó là công trình/khuôn viên). */
  congTrinh?: string;
  /** Vị trí cụ thể: gian giữa · đầu hồi phía Tây · dãy Đông, bệ số 12 */
  viTriCuThe?: string;
  /** Toạ độ WGS84 để hiển thị bản đồ; VN-2000 để khớp hồ sơ địa chính. */
  wgs84?: { lat: number; lng: number };
  vn2000?: { x: number; y: number };
  caoDo?: number;
}

// ---------------------------------------------------------------------------
// Điều kiện bảo quản vật lý (hiện vật + tài liệu)
// ---------------------------------------------------------------------------

export interface ConservationEnvironment {
  nhietDoC?: [number, number];
  doAmPercent?: [number, number];
  anhSangLux?: number;
  yeuCauDacThu?: string;
}

// ---------------------------------------------------------------------------
// Gộp chung
// ---------------------------------------------------------------------------

/** Giá trị một trường riêng: hoặc có nội dung, hoặc mang mã khuyết giá trị (mục 0quinquies). */
export type SpecValue = { text: string } | { missing: MissingReason; note?: string };

export interface PhysicalSpecs {
  measurements: Measurement[];
  /** key trùng `SpecField.key` của preset theo loại đối tượng. */
  fields: Record<string, SpecValue>;
  location?: StructuredLocation;
  conservation?: ConservationEnvironment;
}

/** Bảng tra theo mã đối tượng tầng 1 (`VM-CT-00007`). Đối tượng chưa đo thì không có khoá. */
export const PHYSICAL_SPECS: Record<string, PhysicalSpecs> = PHYSICAL_SPECS_DATA;

export function specsFor(physicalObjectId: string): PhysicalSpecs | undefined {
  return PHYSICAL_SPECS[physicalObjectId];
}

export function presetFor(objectClass: ObjectClass): ObjectClassSpecPreset {
  return SPEC_PRESETS[objectClass];
}

/** Định dạng một dòng đo thành câu đọc được: "Chiều cao (thân bia): 165,5 cm (xấp xỉ)". */
export function formatMeasurement(m: Measurement): string {
  const val = m.value.toLocaleString('vi-VN');
  const qual = m.qualifier === 'chinhXac' ? '' : ` (${QUALIFIER_LABELS[m.qualifier].toLowerCase()})`;
  return `${DIMENSION_LABELS[m.type]} (${m.part}): ${val} ${m.unit}${qual}`;
}
