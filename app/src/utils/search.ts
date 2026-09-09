import { normalizeCode } from './assetCode';
import type { Asset } from '../services/types';

// A4 — tìm kiếm bỏ dấu 2 chiều, quét đủ trường (không chỉ name+code), và
// (0quater) chấp nhận mã đầy đủ lẫn mã rút gọn, không phân biệt hoa/thường,
// bỏ qua dấu `-`/`.`.

const COMBINING_MARKS = /[̀-ͯ]/g;

/** Lowercase, decompose diacritics, strip combining marks, fold đ→d. Bỏ dấu 2 chiều: cả dữ liệu lẫn truy vấn đi qua cùng hàm này. */
export function normalizeForSearch(s: string | null | undefined): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/g, 'd')
    .trim();
}

/** Fields scanned by the library search box — name/code first (most relevant), then desc/coll/loc/owner/era/fmt. */
export function matchesAssetQuery(asset: Asset, rawQuery: string): boolean {
  const q = rawQuery.trim();
  if (!q) return true;

  const normQ = normalizeForSearch(q);
  const codeQ = normalizeCode(q);

  if (codeQ && (normalizeCode(asset.code).includes(codeQ) || normalizeCode(asset.physicalObjectId).includes(codeQ))) {
    return true;
  }

  const haystacks = [asset.name, asset.desc, asset.coll, asset.loc, asset.owner, asset.era, asset.fmt];
  return haystacks.some((field) => normalizeForSearch(field).includes(normQ));
}
