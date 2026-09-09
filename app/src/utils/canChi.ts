// Thiên can / Địa chi calculator — used to derive the "năm âm lịch" label for
// any Gregorian year (e.g. bia Tiến sĩ khoa thi). Computed, never hand-typed,
// so every can-chi label in the app is guaranteed internally consistent.
//
// Công thức chuẩn: Can = (năm − 4) mod 10, Chi = (năm − 4) mod 12.
// Ví dụ kiểm chứng: 1442 → Nhâm Tuất, 1463 → Quý Mùi, 1499 → Kỷ Mùi,
// 1496 → Bính Thìn, 1477 → Đinh Dậu (đối chiếu nguồn sử liệu — xem redteam.md mục E).

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Returns "Can Chi" (e.g. "Nhâm Tuất") for a given Gregorian year. */
export function canChiOf(year: number): string {
  const canIdx = mod(year - 4, 10);
  const chiIdx = mod(year - 4, 12);
  return `${CAN[canIdx]} ${CHI[chiIdx]}`;
}

/** "Khoa <Can Chi> (<năm>)" — the label shape used for bia Tiến sĩ / khoa thi records. */
export function khoaLabel(year: number): string {
  return `khoa ${canChiOf(year)} (${year})`;
}
