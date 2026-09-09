import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canChiOf } from '../src/utils/canChi.ts';

// Safety net for `canChiOf` (Can = (năm−4) mod 10, Chi = (năm−4) mod 12) —
// đây là trường từng bị gõ tay sai 3 lần trong dữ liệu mock (Quý Mão thay vì
// Quý Mùi cho 1463, Kỷ Sửu thay vì Kỷ Mùi cho 1499, Bính Thân thay vì Bính
// Thìn cho 1496). Chạy: `npm test` (dùng `node --experimental-strip-types
// --test`, không cần cài thêm dependency).
const KNOWN_YEARS: Array<[year: number, expected: string]> = [
  [1442, 'Nhâm Tuất'],
  [1463, 'Quý Mùi'],
  [1477, 'Đinh Dậu'],
  [1496, 'Bính Thìn'],
  [1499, 'Kỷ Mùi'],
];

test('canChiOf — 5 mốc đã đối chiếu nguồn sử liệu (redteam.md mục E)', () => {
  for (const [year, expected] of KNOWN_YEARS) {
    assert.equal(canChiOf(year), expected, `canChiOf(${year}) phải là "${expected}"`);
  }
});

test('canChiOf — thêm 3 mốc khoa thi đã xác minh qua tra cứu (Đại Việt lịch triều đăng khoa lục)', () => {
  assert.equal(canChiOf(1656), 'Bính Thân');
  assert.equal(canChiOf(1715), 'Ất Mùi');
  assert.equal(canChiOf(1757), 'Đinh Sửu');
});

test('canChiOf — chu kỳ 60 năm (can chi phải lặp lại đúng sau 60 năm)', () => {
  assert.equal(canChiOf(1442), canChiOf(1442 + 60));
  assert.equal(canChiOf(1499), canChiOf(1499 - 60));
});
