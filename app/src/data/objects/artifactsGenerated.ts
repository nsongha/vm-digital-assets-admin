import { canChiOf } from '../../utils/canChi';
import { mulberry32, pick, pickWeighted, randFloat } from '../../utils/prng';
import type { AssetStatus } from '../../services/types';
import { formatMissing } from '../missingValues';
import type { PhysicalObjectSeed } from './types';

// A2 — "82 rùa đội bia (mỗi bia một rùa — đặt mã và tên hệ thống)" + bia Tiến
// sĩ theo các khoa thi CÓ THẬT trong 1442–1779, can chi TÍNH BẰNG HÀM (không
// gõ tay). 3 rùa (số 12/18/25) và 3 khoa (1442/1463/1499) đã có ở artifacts.ts
// (hand-fixed cùng 14 lỗi fact) — file này sinh phần CÒN LẠI bằng vòng lặp,
// dùng RNG có seed cố định (không Math.random()) để dataset ổn định qua mỗi lần tải.

const rng = mulberry32(20260812);

const OWNERS = ['Trần Văn Minh', 'Lê Thu Trang', 'Đỗ Anh Quân', 'Ngô Bảo Ngọc', 'Nguyễn Thị Hạnh'] as const;
// C3 — pipeline 5 → 9 trạng thái tuần tự + 2 trạng thái ngoài luồng (Cần số
// hóa lại / Đã gỡ/thu hồi). Trọng số dạng phễu: đông nhất ở "Xuất bản", hiếm
// ở hai trạng thái ngoài luồng — vẫn đủ để mọi bước có ít nhất vài bản ghi
// (selector đếm pipeline ở Tổng quan/Báo cáo không hiện 0 giả tạo).
const STATUSES: AssetStatus[] = [
  'Chờ xử lý',
  'Đang xử lý',
  'Kiểm định chất lượng',
  'Chờ duyệt',
  'Thẩm định nội dung',
  'Đã duyệt',
  'Xuất bản',
  'Đã lưu trữ — đang giám sát',
  'Đã kiểm kê',
  'Cần số hóa lại',
  'Đã gỡ/thu hồi',
];
const STATUS_WEIGHTS = [0.1, 0.12, 0.07, 0.1, 0.06, 0.14, 0.22, 0.09, 0.05, 0.03, 0.02];
const DATE_POOL = [
  '01/08/2026', '02/08/2026', '03/08/2026', '04/08/2026', '05/08/2026', '06/08/2026',
  '07/08/2026', '08/08/2026', '09/08/2026', '10/08/2026', '11/08/2026', '28/07/2026',
  '25/07/2026', '22/07/2026', '18/07/2026', '15/07/2026', '30/07/2026',
];

const EXISTING_TURTLE_NOS = new Set([12, 18, 25]);
const TURTLE_ROWS = [1, 5, 6, 7, 8];

/** 79 rùa còn lại (số 1–82, trừ 12/18/25 đã có ở artifacts.ts) — mã/tên hệ thống, `objMesh`/`mesh` size từ RNG trong khoảng thực tế. */
export const GENERATED_TURTLES: PhysicalObjectSeed[] = [];
let turtleSeq = 13; // tiếp theo sau artifacts.ts (seq 1–12)
for (let no = 1; no <= 82; no++) {
  if (EXISTING_TURTLE_NOS.has(no)) continue;
  const useObj = rng() < 0.4;
  const dãy = no <= 41 ? 'dãy Đông' : 'dãy Tây';
  const nhaBia = TURTLE_ROWS[Math.min(TURTLE_ROWS.length - 1, Math.floor(((no - 1) % 41) / 8))];
  GENERATED_TURTLES.push({
    objectClass: 'artifact',
    seq: turtleSeq++,
    name: `Rùa đá đội bia số ${String(no).padStart(2, '0')}`,
    era: 'Thời Lê — Mạc (1442–1789), cùng đợt dựng bia',
    eraEdtf: 'unknown',
    eraCertainty: 'approximate',
    loc: `Vườn bia Tiến sĩ — Nhà bia ${nhaBia}, ${dãy}`,
    coll: 'Bia Tiến sĩ',
    soKiemKe: formatMissing('CHUA_NHAP'),
    unesco: true,
    descBase: `Rùa đá đội bia số ${no}, một trong 82 rùa đá đội bia Tiến sĩ tại Vườn bia — Di sản tư liệu thế giới UNESCO.`,
    reps: [
      {
        digitalForm: 'mesh3d',
        fmt: useObj ? 'OBJ' : 'GLB + E57',
        size: useObj
          ? { kind: 'objMesh', triangleMillions: Math.round(randFloat(rng, 3.2, 7.5) * 10) / 10 }
          : { kind: 'mesh', triangleMillions: Math.round(randFloat(rng, 4.5, 9.5) * 10) / 10, textureRes: rng() < 0.3 ? '8K' : null },
        status: pickWeighted(rng, STATUSES, STATUS_WEIGHTS),
        owner: pick(rng, OWNERS),
        updated: pick(rng, DATE_POOL),
        descSuffix: '',
      },
    ],
  });
}

/** Khoa thi Tiến sĩ có thật 1442–1779 (đã đối chiếu nguồn — không gồm 1442/1463/1499 đã có ở artifacts.ts). Can chi TÍNH bằng `canChiOf`. */
const VERIFIED_EXAM_YEARS = [1448, 1475, 1477, 1493, 1496, 1502, 1511, 1514, 1529, 1554, 1652, 1656, 1715, 1757, 1779];

export const GENERATED_STELES: PhysicalObjectSeed[] = VERIFIED_EXAM_YEARS.map((year, i) => {
  const useObj = rng() < 0.4;
  return {
    objectClass: 'artifact',
    seq: 92 + i,
    name: `Bia Tiến sĩ khoa ${canChiOf(year)} (${year})`,
    era: '1484–1780 (dựng bia theo từng đợt, thời Lê)',
    eraEdtf: '1484/1780',
    eraCertainty: 'range',
    loc: year <= 1600 ? 'Vườn bia Tiến sĩ — dãy Đông' : 'Vườn bia Tiến sĩ — dãy Tây',
    coll: 'Bia Tiến sĩ',
    soKiemKe: formatMissing('CHUA_NHAP'),
    unesco: true,
    descBase: `Bia Tiến sĩ khoa ${canChiOf(year)} (${year}), một trong 82 bia đá — Di sản tư liệu thế giới UNESCO.`,
    reps: [
      {
        digitalForm: 'mesh3d',
        fmt: useObj ? 'OBJ' : 'GLB + E57',
        size: useObj
          ? { kind: 'objMesh', triangleMillions: Math.round(randFloat(rng, 6, 13) * 10) / 10 }
          : { kind: 'mesh', triangleMillions: Math.round(randFloat(rng, 8, 14) * 10) / 10, textureRes: rng() < 0.5 ? '8K' : null },
        status: pickWeighted(rng, STATUSES, STATUS_WEIGHTS),
        owner: pick(rng, OWNERS),
        updated: pick(rng, DATE_POOL),
        descSuffix: '',
      },
    ],
  };
});
