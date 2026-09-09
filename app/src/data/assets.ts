import type { Asset } from '../services/types';
import type { PhysicalObjectSeed } from './objects/types';
import { generateAssets } from './assets/generator';
import { physicalObjectId } from '../utils/assetCode';
import { AV } from './objects/av';
import { ARTIFACTS } from './objects/artifacts';
import { GENERATED_STELES, GENERATED_TURTLES } from './objects/artifactsGenerated';
import { DOCUMENTS } from './objects/documents';
import { PRECINCTS } from './objects/precincts';
import { STRUCTURES } from './objects/structures';
import { applyRelations } from './relations';

// Thin assembly point (A2) — every "dữ liệu số hóa" record in the app comes
// from here, generated from the physical-object seeds in `data/objects/*`
// via `generateAssets` (mã 5 tầng, dung lượng theo công thức vật lý — xem
// `assets/generator.ts` và `sizeFormulas.ts`), then enriched with the 0ter
// relation demo (`relations.ts`). Nothing here is hand-typed data — this
// file only decides seed ORDER (which fixes id assignment).
const SEED_GROUPS = [PRECINCTS, STRUCTURES, ARTIFACTS, GENERATED_TURTLES, GENERATED_STELES, DOCUMENTS, AV];

export const ASSETS: Asset[] = applyRelations(generateAssets(SEED_GROUPS));

/**
 * Danh sách ĐỐI TƯỢNG VẬT LÝ — kể cả đối tượng CHƯA có bản số hóa nào.
 *
 * Vì sao phải có riêng: `ASSETS` chỉ chứa bản ghi số, mà `generateAssets` chỉ sinh
 * bản ghi từ vòng lặp `obj.reps` — nên đối tượng có `reps: []` không xuất hiện ở đâu cả.
 * Nếu trang Đối tượng di sản suy danh sách từ `ASSETS` thì **không bao giờ đếm được cái
 * còn thiếu**, trong khi đó lại chính là con số phải báo cáo theo QĐ 2026/QĐ-TTg
 * (tỷ lệ di tích quốc gia đặc biệt đã số hóa). Danh sách đối tượng phải lấy từ
 * hồ sơ hiện vật thật, rồi mới ghép bản ghi số vào — không làm ngược lại.
 */
export interface PhysicalObjectRow {
  physicalObjectId: string;
  name: string;
  objectClass: PhysicalObjectSeed['objectClass'];
  loc: string;
  coll: string;
  era: string;
  eraCertainty?: PhysicalObjectSeed['eraCertainty'];
  maHoSoDiTich?: string;
  descBase: string;
  soKiemKe?: string;
  unesco?: boolean;
  /** Số bản đại diện số đã có (0 = chưa số hóa). */
  repCount: number;
}

export const PHYSICAL_OBJECTS: PhysicalObjectRow[] = SEED_GROUPS.flat().map((obj) => ({
  physicalObjectId: physicalObjectId(obj.objectClass, obj.seq),
  name: obj.name,
  objectClass: obj.objectClass,
  loc: obj.loc,
  coll: obj.coll,
  era: obj.era,
  eraCertainty: obj.eraCertainty,
  maHoSoDiTich: obj.maHoSoDiTich,
  descBase: obj.descBase,
  soKiemKe: obj.soKiemKe,
  unesco: obj.unesco,
  repCount: obj.reps.length,
}));

export function physicalObjectById(id: string): PhysicalObjectRow | undefined {
  return PHYSICAL_OBJECTS.find((o) => o.physicalObjectId === id);
}
