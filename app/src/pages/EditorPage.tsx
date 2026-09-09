import EmbeddedTool from '../components/EmbeddedTool';
import { GS_EDITOR_URL, GS_START_COMMAND } from '../config/externalTools';

// Nhúng editor của GS Immersive Tour (app ngoài, độc lập) qua iframe — xem
// giải thích chung về cơ chế nhúng trong components/EmbeddedTool.tsx và
// config/externalTools.ts. Trang này KHÔNG chứa logic biên tập nào — mọi
// tính năng (nạp splat, ghi điểm dừng, đặt pin, xuất tour.json) đều thuộc
// app ngoài, đã build sẵn tại route /editor/.
export default function EditorPage() {
  return (
    <EmbeddedTool
      src={GS_EDITOR_URL}
      title="Biên tập không gian số — GS Immersive Tour Editor"
      startCommand={GS_START_COMMAND}
      description="Tạo tour: nạp splat (.ply/.sog/SSOG), ghi điểm dừng camera, đặt pin chú thích, xuất tour.json."
    />
  );
}
