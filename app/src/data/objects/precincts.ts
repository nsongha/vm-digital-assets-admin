import type { PhysicalObjectSeed } from './types';

// `precinct` — khuôn viên & không gian (phân khu, sân, vườn, hồ, giếng).
// Niên đại: toàn quần thể khởi dựng năm 1070 đời Lý Thánh Tông (xác minh —
// xem redteam.md mục E "Hồ Văn, Vườn Giám là bộ phận của quần thể ✅ Đúng").
// Splat kiến trúc PHẢI có niên đại — không để "—" (A1 mục niên đại Splat).

export const PRECINCTS: PhysicalObjectSeed[] = [
  {
    objectClass: 'precinct',
    seq: 1,
    name: 'Giếng Thiên Quang & sân bia',
    era: '1070 (khởi dựng cùng Văn Miếu)',
    eraEdtf: '1070',
    eraCertainty: 'certain',
    loc: 'Khu thứ ba',
    coll: 'Kiến trúc & không gian',
    maHoSoDiTich: 'HSDT-VM-KV-03',
    descBase:
      'Giếng Thiên Quang hình vuông (biểu tượng đất), nằm giữa Vườn bia Tiến sĩ, phối cùng cửa tròn gác Khuê Văn (biểu tượng trời).',
    reps: [
      {
        digitalForm: 'splat',
        fmt: 'PLY / SPLAT',
        size: { kind: 'splat', gaussiansMillions: 9.4 },
        status: 'Đang xử lý',
        owner: 'Trần Văn Minh',
        updated: '10/08/2026',
        descSuffix: ' Gaussian splatting từ 1.800 ảnh; đang huấn luyện lại vùng mặt nước bị nhiễu phản chiếu.',
        tags: ['kiến trúc', 'bia đá', 'ngoài trời'],
      },
      {
        digitalForm: 'pointcloud',
        fmt: 'E57',
        size: { kind: 'pointcloud', pointsMillions: 22 },
        status: 'Đã duyệt',
        owner: 'Trần Văn Minh',
        updated: '06/08/2026',
        descSuffix: ' Đám mây điểm scan LiDAR mặt bằng sân bia, dùng làm bản dẫn xuất bảo hiểm cho bản splat.',
        tags: ['kiến trúc', 'ngoài trời'],
      },
      {
        digitalForm: 'drawing',
        fmt: 'DWG',
        size: { kind: 'drawing', sheets: 2 },
        status: 'Xuất bản',
        owner: 'Lê Thu Trang',
        updated: '02/08/2026',
        descSuffix: ' Bản vẽ mặt bằng giếng Thiên Quang và sân bia, tỷ lệ 1:100, phục vụ hồ sơ bảo quản.',
        tags: ['kiến trúc'],
      },
    ],
  },
  {
    objectClass: 'precinct',
    seq: 2,
    name: 'Hồ Văn',
    era: '1070 (khởi dựng cùng Văn Miếu)',
    eraEdtf: '1070',
    eraCertainty: 'certain',
    loc: 'Khuôn viên Văn Miếu',
    coll: 'Kiến trúc & không gian',
    maHoSoDiTich: 'HSDT-VM-KV-01',
    descBase: 'Hồ Văn (trước đây gọi Hồ Giám), một trong ba bộ phận cấu thành quần thể di tích Văn Miếu — Quốc Tử Giám.',
    reps: [
      {
        digitalForm: 'splat',
        fmt: 'SPLAT',
        size: { kind: 'splat', gaussiansMillions: 5.6 },
        status: 'Đang xử lý',
        owner: 'Trần Văn Minh',
        updated: '02/08/2026',
        descSuffix: ' Gaussian splat quét toàn cảnh khu vực Hồ Văn.',
      },
    ],
  },
  {
    objectClass: 'precinct',
    seq: 3,
    name: 'Vườn Giám',
    era: '1070 (khởi dựng cùng Văn Miếu)',
    eraEdtf: '1070',
    eraCertainty: 'certain',
    loc: 'Khuôn viên Văn Miếu',
    coll: 'Kiến trúc & không gian',
    maHoSoDiTich: 'HSDT-VM-KV-02',
    descBase: 'Vườn Giám, một trong ba bộ phận cấu thành quần thể di tích Văn Miếu — Quốc Tử Giám.',
    reps: [
      {
        digitalForm: 'splat',
        fmt: 'SPLAT',
        size: { kind: 'splat', gaussiansMillions: 6.8 },
        status: 'Chờ duyệt',
        owner: 'Lê Thu Trang',
        updated: '05/08/2026',
        descSuffix: ' Gaussian splat quét toàn cảnh khu vực Vườn Giám.',
      },
    ],
  },
  {
    objectClass: 'precinct',
    seq: 4,
    name: 'Sân trước nhà Bái Đường',
    era: '1070 (khởi dựng cùng Văn Miếu)',
    eraEdtf: '1070',
    eraCertainty: 'certain',
    loc: 'Khu thứ tư',
    coll: 'Kiến trúc & không gian',
    maHoSoDiTich: 'HSDT-VM-KV-04',
    descBase: 'Sân trước nhà Bái Đường, không gian hành lễ chính giữa Đại Trung Môn và Đại Thành Môn.',
    reps: [
      {
        digitalForm: 'splat',
        fmt: 'SPLAT',
        size: { kind: 'splat', gaussiansMillions: 4.1 },
        status: 'Chờ xử lý',
        owner: 'Lê Thu Trang',
        updated: '11/08/2026',
        descSuffix: ' Dữ liệu ảnh đã tải lên, chưa bắt đầu huấn luyện splat.',
      },
    ],
  },
];
