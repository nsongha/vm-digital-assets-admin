import { slugOf } from '../utils/slug';

// Ported from `COVERS` in v3.html — Wikimedia Commons FilePath URLs, kept
// verbatim (including the URL-encoded diacritics).
const COVERS: Record<string, string> = {
  'coll-bia-tien-si':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Las-tortugas-en-templo-literatura-en-hanoi.jpg?width=800',
  'coll-kien-truc-khong-gian':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Khu%C3%AA_v%C4%83n_c%C3%A1c.jpg?width=800',
  'coll-hien-vat-tho-tu':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Lascar_Main_hall_of_The_Temple_of_Literature_(V%C4%83n_Mi%E1%BA%BFu)_(4551001026).jpg?width=800',
  'coll-tu-lieu-han-nom':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Mandarin_in_Van_Mieu1.jpg?width=800',
  'coll-anh-tu-lieu-lich-su':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Hanoi_Temple_of_Literature.jpg?width=800',
  'coll-media-thuyet-minh':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Lascar_Temple_of_Literature_-_Third_courtyard_(4550356693).jpg?width=800',
};

// Ported from `COLLS` in v3.html — count/types/updated/size REMOVED (A2):
// those are now derived from `data/assets.ts` in `collectionService.list()`
// (redteam Đòn 2 — bấm mở một bộ sưu tập phải ra đúng số ghi trên thẻ, nên
// con số không còn được phép sống tách rời khỏi mảng assets).
export interface CollectionMeta {
  name: string;
  desc: string;
  slug: string;
  cover: string;
}

const COLLS_RAW: Array<Omit<CollectionMeta, 'slug' | 'cover'>> = [
  { name: 'Bia Tiến sĩ', desc: '82 bia đá Tiến sĩ và 82 rùa đội bia, kèm bản dập và phiên âm từng khoa thi.' },
  { name: 'Kiến trúc & không gian', desc: 'Gaussian splats, mesh và bản vẽ các công trình: Khuê Văn Các, Đại Thành Môn…' },
  { name: 'Hiện vật thờ tự', desc: 'Tượng thờ, chuông, khánh, đồ tế khí tại Nhà Thái Học, Điện Đại Thành và Nhà Bái Đường.' },
  { name: 'Tư liệu Hán Nôm', desc: 'Sắc phong, sách đăng khoa lục, bản dập văn bia — scan độ phân giải cao.' },
  { name: 'Ảnh tư liệu lịch sử', desc: 'Ảnh phim kính và ảnh giấy từ đầu thế kỷ 20, đã phục chế số.' },
  { name: 'Media thuyết minh', desc: 'Video tư liệu và audio thuyết minh đa ngôn ngữ cho cổng tham quan số.' },
];

export const COLLECTIONS_META: CollectionMeta[] = COLLS_RAW.map((c) => {
  const slug = slugOf(c.name);
  return { ...c, slug, cover: COVERS[slug] || '' };
});

export { COVERS };
