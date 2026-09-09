import type { Connection, ConnectionSyncState } from '../services/types';
import { slugify } from '../utils/slug';

interface ConnectionSeed {
  kind: string;
  name: string;
  desc: string;
  status: string;
  sync: string;
}

// Ported from the `CONNS` source array in v3.html (before the per-connection
// enabled/freq UI state is layered on — see ConnectionService).
const CONNS_RAW: ConnectionSeed[] = [
  { kind: 'TRỤC TÍCH HỢP', name: 'LGSP Thành phố Hà Nội', desc: 'Trục tích hợp, chia sẻ dữ liệu cấp thành phố — kênh kết nối bắt buộc với các hệ thống bên ngoài.', status: 'Đang hoạt động', sync: 'Đồng bộ 09:30 hôm nay' },
  { kind: 'DỮ LIỆU MỞ', name: 'Cổng dữ liệu mở Thành phố', desc: 'Công bố dữ liệu mở: danh mục 82 bia Tiến sĩ, metadata hiện vật đã xuất bản.', status: '3 bộ dữ liệu đã công bố', sync: 'Cập nhật 05/08' },
  { kind: 'NỀN TẢNG QUỐC GIA', name: 'NDXP — nền tảng quốc gia', desc: 'Khai thác các CSDL quốc gia thông qua trục LGSP thành phố.', status: 'Qua LGSP', sync: '—' },
  { kind: 'CSDL CHUYÊN NGÀNH', name: 'CSDL di sản — Bộ VHTTDL', desc: 'Đồng bộ hồ sơ di tích quốc gia đặc biệt và hiện vật đã kiểm kê.', status: 'Chờ ký kết', sync: '—' },
  { kind: 'CỔNG CÔNG KHAI', name: 'Cổng tham quan số Văn Miếu', desc: 'Xuất bản mô hình 3D, splat và thuyết minh cho công chúng.', status: 'Đang hoạt động', sync: 'Đồng bộ thời gian thực' },
];

export const CONNECTIONS: Connection[] = CONNS_RAW.map((cn) => {
  const slug = slugify(cn.name);
  return {
    ...cn,
    endpoint: 'https://api.dsvanmieu.gov.vn/connect/' + slug,
    keyTail: slug.slice(-4).toUpperCase().padStart(4, '0'),
  };
});

/** Default enabled/freq per connection, matching v3.html's fallback logic. */
export function defaultSyncState(cn: Connection): ConnectionSyncState {
  const enabled = cn.status === 'Đang hoạt động' || cn.status.includes('công bố');
  const freq: ConnectionSyncState['freq'] = cn.sync.includes('thời gian thực')
    ? 'realtime'
    : cn.sync === '—'
      ? 'manual'
      : 'daily';
  return { enabled, freq };
}
