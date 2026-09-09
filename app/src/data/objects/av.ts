import { formatMissing } from '../missingValues';
import type { PhysicalObjectSeed } from './types';

// `av` — tư liệu nghe nhìn (ảnh, phim, bản thu). Sizes computed via
// sizeFormulas — A2/Đòn (c): WAV 48kHz stereo ≈ 11,5 MB/phút (không phải
// 22MB cho 18 phút), ProRes 422 HQ 4K ≈ 5,3 GB/phút (không phải 2,0GB cho cả
// phóng sự). Tác giả ảnh thời Pháp thuộc phần lớn không xác định được — dùng
// sentinel KHONG_RO (đã tra cứu, kết luận không thể biết) qua trường `desc`.

export const AV: PhysicalObjectSeed[] = [
  {
    objectClass: 'av', seq: 1,
    name: 'Ảnh tư liệu cổng Văn Miếu, thập niên 1920',
    era: 'Thập niên 1920', eraEdtf: '192X', eraCertainty: 'approximate',
    loc: 'Kho lưu trữ', coll: 'Ảnh tư liệu lịch sử', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Ảnh tư liệu cổng Văn Miếu, thập niên 1920. Tác giả ${formatMissing('KHONG_RO')} (ảnh tư liệu thời Pháp thuộc). Scan từ phim kính, đã phục chế xước và cân bằng tông.`,
    reps: [{ digitalForm: 'image', fmt: 'TIFF', size: { kind: 'tiffPhoto', megapixels: 7 }, status: 'Xuất bản', owner: 'Ngô Bảo Ngọc', updated: '01/08/2026', descSuffix: '', tags: ['ảnh lịch sử', 'kiến trúc'] }],
  },
  {
    objectClass: 'av', seq: 2,
    name: 'Phim tư liệu lễ khai bút đầu xuân 2026',
    era: '2026', eraEdtf: '2026', eraCertainty: 'certain',
    loc: '—', coll: 'Media thuyết minh', soKiemKe: formatMissing('KHONG_AP_DUNG'),
    descBase: 'Phim tư liệu lễ khai bút đầu xuân 2026. Đang dựng bản 12 phút và bản rút gọn 3 phút.',
    reps: [{ digitalForm: 'video', fmt: 'ProRes 4K', size: { kind: 'prores', minutes: 3.2 }, status: 'Đang xử lý', owner: 'Đỗ Anh Quân', updated: '10/08/2026', descSuffix: '', tags: ['lễ hội'] }],
  },
  {
    objectClass: 'av', seq: 3,
    name: 'Thuyết minh khu Thái Học (giọng nữ, 24 phút)',
    era: '2026', eraEdtf: '2026', eraCertainty: 'certain',
    loc: '—', coll: 'Media thuyết minh', soKiemKe: formatMissing('KHONG_AP_DUNG'),
    descBase: 'Thuyết minh khu Thái Học (giọng nữ, 24 phút). Bản thu phòng, kèm phụ đề tiếng Việt và tiếng Anh.',
    reps: [{ digitalForm: 'audio', fmt: 'WAV 48kHz', size: { kind: 'wav', minutes: 24 }, status: 'Đã duyệt', owner: 'Ngô Bảo Ngọc', updated: '04/08/2026', descSuffix: '', tags: ['thuyết minh', 'nội thất'] }],
  },
  {
    objectClass: 'av', seq: 4,
    name: 'Ảnh cổng Đại Trung Môn, 1930',
    era: '1930', eraEdtf: '1930', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Ảnh tư liệu lịch sử', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Ảnh cổng Đại Trung Môn, 1930. Tác giả ${formatMissing('KHONG_RO')}. Ảnh tư liệu lịch sử đã phục chế số.`,
    reps: [{ digitalForm: 'image', fmt: 'TIFF', size: { kind: 'tiffPhoto', megapixels: 5 }, status: 'Đang xử lý', owner: 'Lê Thu Trang', updated: '04/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 5,
    name: 'Ảnh sân Nhà Thái Học, 1955',
    era: '1955', eraEdtf: '1955', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Ảnh tư liệu lịch sử', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Ảnh sân Nhà Thái Học, 1955 (trước công trình phục dựng 1999–2000). Tác giả ${formatMissing('KHONG_RO')}.`,
    reps: [{ digitalForm: 'image', fmt: 'JPEG', size: { kind: 'jpegPhoto', megapixels: 4 }, status: 'Chờ duyệt', owner: 'Trần Văn Minh', updated: '07/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 6,
    name: 'Ảnh lễ dâng hương, 1960',
    era: '1960', eraEdtf: '1960', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Ảnh tư liệu lịch sử', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Ảnh lễ dâng hương, 1960. Tác giả ${formatMissing('KHONG_RO')}.`,
    reps: [{ digitalForm: 'image', fmt: 'TIFF', size: { kind: 'tiffPhoto', megapixels: 6 }, status: 'Đã duyệt', owner: 'Đỗ Anh Quân', updated: '10/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 7,
    name: 'Ảnh Khuê Văn Các, thập niên 1940',
    era: 'Thập niên 1940', eraEdtf: '194X', eraCertainty: 'approximate',
    loc: 'Kho lưu trữ', coll: 'Ảnh tư liệu lịch sử', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Ảnh Khuê Văn Các, thập niên 1940. Tác giả ${formatMissing('KHONG_RO')}. Ảnh tư liệu khắc họa Khuê Văn Các trước các đợt trùng tu hiện đại — xem quan hệ "Được khắc họa trong" tại Hồ sơ đối tượng.`,
    reps: [{ digitalForm: 'image', fmt: 'JPEG', size: { kind: 'jpegPhoto', megapixels: 5 }, status: 'Xuất bản', owner: 'Ngô Bảo Ngọc', updated: '02/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 8,
    name: 'Ảnh đoàn khảo cổ Pháp, 1925',
    era: '1925', eraEdtf: '1925', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Ảnh tư liệu lịch sử', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Ảnh đoàn khảo cổ Pháp, 1925. Tác giả ${formatMissing('KHONG_RO')}.`,
    reps: [{ digitalForm: 'image', fmt: 'TIFF', size: { kind: 'tiffPhoto', megapixels: 8 }, status: 'Chờ xử lý', owner: 'Lê Thu Trang', updated: '05/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 9,
    name: 'Ảnh trùng tu Điện Đại Thành, 1990',
    era: '1990', eraEdtf: '1990', eraCertainty: 'certain',
    loc: 'Kho lưu trữ', coll: 'Ảnh tư liệu lịch sử', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Ảnh trùng tu Điện Đại Thành, 1990. Tác giả ${formatMissing('KHONG_RO')}.`,
    reps: [{ digitalForm: 'image', fmt: 'JPEG', size: { kind: 'jpegPhoto', megapixels: 3 }, status: 'Đang xử lý', owner: 'Đỗ Anh Quân', updated: '08/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 10,
    name: 'Ảnh hàng bia Tiến sĩ, thập niên 1900',
    era: 'Thập niên 1900', eraEdtf: '190X', eraCertainty: 'approximate',
    loc: 'Kho lưu trữ', coll: 'Ảnh tư liệu lịch sử', soKiemKe: formatMissing('CHUA_NHAP'),
    descBase: `Ảnh hàng bia Tiến sĩ, thập niên 1900. Tác giả ${formatMissing('KHONG_RO')}.`,
    reps: [{ digitalForm: 'image', fmt: 'TIFF', size: { kind: 'tiffPhoto', megapixels: 6 }, status: 'Chờ duyệt', owner: 'Ngô Bảo Ngọc', updated: '11/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 11,
    name: 'Phim tư liệu lễ vinh danh học sinh giỏi 2025',
    era: '2024–2025', eraEdtf: '2024/2025', eraCertainty: 'range',
    loc: '—', coll: 'Media thuyết minh', soKiemKe: formatMissing('KHONG_AP_DUNG'),
    descBase: 'Phim tư liệu lễ vinh danh học sinh giỏi 2025.',
    reps: [{ digitalForm: 'video', fmt: 'ProRes 4K', size: { kind: 'prores', minutes: 4.5 }, status: 'Xuất bản', owner: 'Trần Văn Minh', updated: '04/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 12,
    name: 'Phóng sự trùng tu vườn bia 2024',
    era: '2024–2025', eraEdtf: '2024/2025', eraCertainty: 'range',
    loc: '—', coll: 'Media thuyết minh', soKiemKe: formatMissing('KHONG_AP_DUNG'),
    descBase: 'Phóng sự trùng tu vườn bia 2024.',
    reps: [{ digitalForm: 'video', fmt: 'ProRes 4K', size: { kind: 'prores', minutes: 6.1 }, status: 'Chờ xử lý', owner: 'Đỗ Anh Quân', updated: '07/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 13,
    name: 'Thuyết minh khu bia Tiến sĩ (giọng nam, 18 phút)',
    era: '2025–2026', eraEdtf: '2025/2026', eraCertainty: 'range',
    loc: '—', coll: 'Media thuyết minh', soKiemKe: formatMissing('KHONG_AP_DUNG'),
    descBase: 'Thuyết minh khu bia Tiến sĩ (giọng nam, 18 phút).',
    reps: [{ digitalForm: 'audio', fmt: 'WAV 48kHz', size: { kind: 'wav', minutes: 18 }, status: 'Chờ xử lý', owner: 'Lê Thu Trang', updated: '04/08/2026', descSuffix: '' }],
  },
  {
    objectClass: 'av', seq: 14,
    name: 'Thuyết minh Khuê Văn Các (song ngữ, 12 phút)',
    era: '2025–2026', eraEdtf: '2025/2026', eraCertainty: 'range',
    loc: '—', coll: 'Media thuyết minh', soKiemKe: formatMissing('KHONG_AP_DUNG'),
    descBase: 'Thuyết minh Khuê Văn Các (song ngữ, 12 phút) — xem quan hệ "Là chủ đề của" tại Hồ sơ đối tượng Khuê Văn Các.',
    reps: [{ digitalForm: 'audio', fmt: 'WAV 48kHz', size: { kind: 'wav', minutes: 12 }, status: 'Đang xử lý', owner: 'Đỗ Anh Quân', updated: '07/08/2026', descSuffix: '' }],
  },
];
