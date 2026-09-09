// GaussianSplat Immersive Tour là một ứng dụng Vite + PlayCanvas ĐỘC LẬP
// (repo riêng, không phải một phần của admin này) — được nhúng vào admin
// qua <iframe>, không import trực tiếp. Vì vậy admin chỉ cần biết ĐỊA CHỈ
// của app đó, không cần build cùng nó.
//
// Dev: app kia chạy ở port 5174 (npm run dev -- --port 5174), tách biệt với
// admin đang chạy ở 5173, để hai dev server không tranh cổng khi chạy song
// song trên cùng máy.
//
// Production: KHÔNG hard-code localhost — trỏ qua biến môi trường
// `VITE_GS_TOUR_URL` (đặt lúc build/deploy, ví dụ trỏ tới domain nơi app
// GS Tour được host thật). Không set thì rơi về localhost:5174 để dev vẫn
// chạy được ngay không cần cấu hình thêm.
const base = (import.meta.env.VITE_GS_TOUR_URL as string | undefined) ?? 'http://localhost:5174';

/** Gốc địa chỉ app GS Immersive Tour (không có path). */
export const GS_TOUR_BASE = base;

/** Entry biên tập — app yêu cầu bắt buộc có dấu "/" cuối ở route /editor/. */
export const GS_EDITOR_URL = `${base}/editor/`;

// Tour mặc định cho màn Không gian số. CỐ Ý không trỏ vào tour mẫu có sẵn của
// app GS (dữ liệu thử nghiệm không liên quan Văn Miếu — hiện lên trong demo thầu
// còn tệ hơn màn hướng dẫn trống). Khi tour Văn Miếu thật được dựng xong (từ dữ
// liệu NAS: rùa bia, Khuê Văn Các, giếng Thiên Quang), đặt biến môi trường
// `VITE_GS_TOUR_JSON` (vd `/vanmieu.json`) là viewer tự nạp — không sửa code.
const tourJson = import.meta.env.VITE_GS_TOUR_JSON as string | undefined;

/** Entry trình diễn (viewer) — route gốc "/", kèm ?tour= nếu đã cấu hình tour thật. */
export const GS_VIEWER_URL = tourJson ? `${base}/?tour=${encodeURIComponent(tourJson)}` : `${base}/`;

/** Lệnh khởi động app GS Tour ở đúng port dev (5174) — hiển thị cho người
 * vận hành khi iframe chưa kết nối được, để họ biết cần chạy lệnh gì. */
export const GS_START_COMMAND =
  'npm --prefix "/Users/songha/GaussianSplat Imersive Tour" run dev -- --port 5174 --strictPort';
