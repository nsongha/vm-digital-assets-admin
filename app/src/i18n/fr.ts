// C6 — khung tiếng Pháp. Cùng cơ chế với `en.ts`: rỗng có cấu trúc, TODO
// dịch. Giữ file riêng (thay vì gộp `en`/`fr` chung một helper) để mỗi ngôn
// ngữ có chỗ ghi chú tiến độ dịch riêng khi bắt đầu localize thật.
//
// TODO dịch: điền bản dịch tiếng Pháp vào từng khoá, giữ nguyên cấu trúc
// lồng nhau. `t()` fallback về `vi` cho mọi khoá còn rỗng ở đây.
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

export const fr: Dict = emptyLike(vi);
