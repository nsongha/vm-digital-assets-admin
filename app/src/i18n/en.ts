// C6 — khung tiếng Anh. Cố tình để RỖNG (TODO dịch): mục tiêu của bước này
// là chứng minh kiến trúc đa ngữ chạy được (đấu đủ khoá, đấu đủ `t()`), CHƯA
// phải dịch xong. `emptyLike` tự nhân bản đúng cấu trúc khoá của `vi.ts` —
// nếu `vi.ts` thêm khoá mới, file này tự động có khoá đó (rỗng) mà không cần
// sửa tay, tránh lệch cấu trúc giữa các ngôn ngữ.
//
// TODO dịch: điền bản dịch tiếng Anh vào từng khoá, giữ nguyên cấu trúc lồng
// nhau. Cho đến khi đó, `t()` (xem `src/i18n/index.ts`) tự động fallback về
// `vi` cho mọi khoá còn rỗng ở đây — không có chuỗi trống nào lộ ra UI.
import { vi } from './vi';
import type { Dict } from './vi';

function emptyLike<T>(node: T): T {
  if (typeof node === 'string') return '' as unknown as T;
  const out = {} as T;
  for (const key of Object.keys(node as object) as Array<keyof T>) {
    out[key] = emptyLike(node[key]);
  }
  return out;
}

export const en: Dict = emptyLike(vi);
