import { canChiOf } from '../../utils/canChi';
import { formatMissing } from '../missingValues';
import type { PhysicalObjectSeed } from './types';

// `document` — tài liệu & di sản tư liệu (sắc phong, bản dập, đăng khoa lục,
// chiếu dụ, gia phả). A1: niên đại dùng đúng năm đã có sẵn trong tên (Cảnh
// Hưng 12 = 1751, Tự Đức 3 = 1850, khoa thi 1493/1502/1475), KHÔNG gán
// "Thế kỷ 15–19" theo bộ sưu tập; mô tả viết hoa đúng tên riêng; can chi
// "Bính Thân 1496" sai → sửa "Bính Thìn 1496" (canChiOf(1496) = Bính Thìn).

export const DOCUMENTS: PhysicalObjectSeed[] = [
  {
    objectClass: 'document', seq: 1,
    name: 'Sắc phong niên hiệu Cảnh Hưng 35 (1774)',
    era: 'Cảnh Hưng 35 (1774)', eraEdtf: '1774', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: 'Sắc phong niên hiệu Cảnh Hưng 35 (1774). Scan 2 mặt, kèm bản phiên âm và dịch nghĩa.',
    reps: [{ digitalForm: 'text', fmt: 'TIFF 600dpi', size: { kind: 'tiff', pages: 5 }, status: 'Đã duyệt', owner: 'Lê Thu Trang', updated: '11/08/2026', descSuffix: '', tags: ['sắc phong', 'chữ Hán Nôm'] }],
  },
  {
    objectClass: 'document', seq: 2,
    name: 'Bản dập văn bia khoa thi Giáp Thìn (1484)',
    era: 'Giáp Thìn (1484)', eraEdtf: '1484', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Bản dập văn bia khoa thi Giáp Thìn (1484) — can chi ${canChiOf(1484)} khớp năm dựng bia đợt đầu. Bản dập giấy dó, scan phẳng khổ A0 ghép 4 lần chụp.`,
    reps: [{ digitalForm: 'text', fmt: 'TIFF', size: { kind: 'tiff', pages: 3, dpi: 300 }, status: 'Xuất bản', owner: 'Lê Thu Trang', updated: '02/08/2026', descSuffix: '', tags: ['bia đá', 'chữ Hán Nôm'] }],
  },
  {
    objectClass: 'document', seq: 3,
    name: 'Đại Việt lịch triều đăng khoa lục — quyển 1',
    era: '1779 (Cảnh Hưng 40)', eraEdtf: '1779', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: 'Đại Việt lịch triều đăng khoa lục — quyển 1 (biên soạn 1779, ghi khoa thi 1075–1779). 186 trang, chờ OCR chữ Hán và đối chiếu.',
    reps: [{ digitalForm: 'text', fmt: 'PDF/A', size: { kind: 'pdfa', pages: 186 }, status: 'Chờ xử lý', owner: 'Lê Thu Trang', updated: '11/08/2026', descSuffix: '', tags: ['sách cổ', 'chữ Hán Nôm'] }],
  },
  {
    objectClass: 'document', seq: 4,
    name: 'Sắc phong niên hiệu Cảnh Hưng 12 (1751)',
    era: 'Cảnh Hưng 12 (1751)', eraEdtf: '1751', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: 'Sắc phong niên hiệu Cảnh Hưng 12 (1751). Scan tư liệu Hán Nôm, kèm bản phiên âm.',
    reps: [{ digitalForm: 'text', fmt: 'TIFF 600dpi', size: { kind: 'tiff', pages: 2 }, status: 'Chờ duyệt', owner: 'Lê Thu Trang', updated: '04/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 5,
    name: 'Sắc phong niên hiệu Tự Đức 3 (1850)',
    era: 'Tự Đức 3 (1850)', eraEdtf: '1850', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: 'Sắc phong niên hiệu Tự Đức 3 (1850). Scan tư liệu Hán Nôm, kèm bản phiên âm.',
    reps: [{ digitalForm: 'text', fmt: 'TIFF 600dpi', size: { kind: 'tiff', pages: 2 }, status: 'Đã duyệt', owner: 'Đỗ Anh Quân', updated: '07/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 6,
    name: `Bản dập văn bia khoa thi ${canChiOf(1493)} (1493)`,
    era: `${canChiOf(1493)} (1493)`, eraEdtf: '1493', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Bản dập văn bia khoa thi ${canChiOf(1493)} (1493).`,
    reps: [{ digitalForm: 'text', fmt: 'TIFF', size: { kind: 'tiff', pages: 2, dpi: 300 }, status: 'Xuất bản', owner: 'Ngô Bảo Ngọc', updated: '10/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 7,
    name: `Bản dập văn bia khoa thi ${canChiOf(1502)} (1502)`,
    era: `${canChiOf(1502)} (1502)`, eraEdtf: '1502', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Bản dập văn bia khoa thi ${canChiOf(1502)} (1502).`,
    reps: [{ digitalForm: 'text', fmt: 'TIFF', size: { kind: 'tiff', pages: 2, dpi: 300 }, status: 'Chờ xử lý', owner: 'Trần Văn Minh', updated: '02/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 8,
    name: 'Đại Việt lịch triều đăng khoa lục — quyển 2',
    era: '1779 (Cảnh Hưng 40)', eraEdtf: '1779', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: 'Đại Việt lịch triều đăng khoa lục — quyển 2.',
    reps: [{ digitalForm: 'text', fmt: 'PDF/A', size: { kind: 'pdfa', pages: 24 }, status: 'Đang xử lý', owner: 'Lê Thu Trang', updated: '05/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 9,
    name: 'Đại Việt lịch triều đăng khoa lục — quyển 3',
    era: '1779 (Cảnh Hưng 40)', eraEdtf: '1779', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: 'Đại Việt lịch triều đăng khoa lục — quyển 3.',
    reps: [{ digitalForm: 'text', fmt: 'PDF/A', size: { kind: 'pdfa', pages: 27 }, status: 'Chờ duyệt', owner: 'Đỗ Anh Quân', updated: '08/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 10,
    name: 'Văn Miếu bi ký — tập khảo cứu',
    era: eraChuaXacDinhDoc(), eraEdtf: 'unknown', eraCertainty: 'unknown',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: 'Văn Miếu bi ký — tập khảo cứu.',
    reps: [{ digitalForm: 'text', fmt: 'PDF/A', size: { kind: 'pdfa', pages: 34 }, status: 'Đã duyệt', owner: 'Ngô Bảo Ngọc', updated: '11/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 11,
    name: `Sổ ghi công đức trùng tu ${canChiOf(1805)} (1805)`,
    era: `${canChiOf(1805)} (1805)`, eraEdtf: '1805', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Sổ ghi công đức đợt trùng tu năm ${canChiOf(1805)} (1805).`,
    reps: [{ digitalForm: 'text', fmt: 'TIFF', size: { kind: 'tiff', pages: 1, dpi: 300 }, status: 'Xuất bản', owner: 'Trần Văn Minh', updated: '03/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 12,
    name: `Chiếu dụ mở khoa thi Hội ${canChiOf(1475)} (1475)`,
    era: `${canChiOf(1475)} (1475)`, eraEdtf: '1475', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Chiếu dụ mở khoa thi Hội năm ${canChiOf(1475)} (1475).`,
    reps: [{ digitalForm: 'text', fmt: 'TIFF 600dpi', size: { kind: 'tiff', pages: 1 }, status: 'Chờ xử lý', owner: 'Lê Thu Trang', updated: '06/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 13,
    name: 'Gia phả dòng họ khoa bảng — trích lục',
    era: eraChuaXacDinhDoc(), eraEdtf: 'unknown', eraCertainty: 'unknown',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: 'Gia phả dòng họ khoa bảng — trích lục. Chứa thông tin cá nhân/gia hệ hậu duệ — công bố hạn chế.',
    reps: [{ digitalForm: 'text', fmt: 'PDF/A', size: { kind: 'pdfa', pages: 40 }, status: 'Đang xử lý', owner: 'Đỗ Anh Quân', updated: '09/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'document', seq: 14,
    name: `Danh sách tiến sĩ khoa ${canChiOf(1496)} (1496)`,
    era: `${canChiOf(1496)} (1496)`, eraEdtf: '1496', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Tư liệu Hán Nôm', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Danh sách tiến sĩ khoa ${canChiOf(1496)} (1496) — trích lục từ đăng khoa lục.`,
    reps: [{ digitalForm: 'text', fmt: 'PDF/A', size: { kind: 'pdfa', pages: 45 }, status: 'Chờ duyệt', owner: 'Ngô Bảo Ngọc', updated: '01/08/2026', descSuffix: '' }],
  },
];

function eraChuaXacDinhDoc(): string {
  return formatMissing('CHUA_XAC_DINH', 'đã tra hồ sơ Trung tâm, chưa xác định niên đại biên soạn/sao chép cụ thể');
}
