import EmbeddedTool from '../components/EmbeddedTool';
import { GS_VIEWER_URL, GS_START_COMMAND } from '../config/externalTools';

// Nhúng viewer của GS Immersive Tour (app ngoài, độc lập) qua iframe — cùng
// cơ chế với EditorPage.tsx nhưng trỏ route gốc "/" (trình diễn) thay vì
// "/editor/" (biên tập). Xem components/EmbeddedTool.tsx và
// config/externalTools.ts để biết cách kiểm tra kết nối và fallback khi
// app ngoài chưa chạy.
export default function SpatialPage() {
  return (
    <EmbeddedTool
      src={GS_VIEWER_URL}
      title="Không gian số — trình diễn tour"
      startCommand={GS_START_COMMAND}
      description="Trình diễn tour đã xuất: đi qua các điểm dừng camera, xem pin chú thích 3D, chọn chất lượng hiển thị — dynamic resolution tự điều chỉnh để giữ khoảng 60fps."
    />
  );
}
