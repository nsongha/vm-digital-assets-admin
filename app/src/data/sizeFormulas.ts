// Physical size estimators — every asset's `sizeMB` is computed from these
// functions (never hand-typed) so the displayed size is always derivable
// from the same physical assumption, and dashboard/collection totals that
// sum `sizeMB` across assets stay internally consistent.
//
// Benchmark constants taken from the verified physics in redteam.md mục (c):
//   WAV 48kHz stereo      ≈ 11,5 MB/phút
//   ProRes 422 HQ 4K      ≈ 5,3 GB/phút  (= 5300 MB/phút)
//   TIFF 600dpi A4        ≈ 100 MB/trang
// Mesh/point-cloud/splat/PDF constants below are documented engineering
// estimates (not independently benchmarked in the source report) chosen to
// stay internally consistent across every generated record.

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Photogrammetry / LiDAR mesh exported as GLB (binary, quantized, Draco-friendly). */
export function meshSizeMB(triangleMillions: number, textureRes?: '8K' | '16K' | null): number {
  const texMB = textureRes === '16K' ? 220 : textureRes === '8K' ? 60 : 8;
  return round1(triangleMillions * 28 + texMB);
}

/** Same mesh exported as OBJ (ASCII vertex/face lists, no built-in compression) — ~2.2x a GLB of the same triangle count. */
export function objMeshSizeMB(triangleMillions: number, textureRes?: '8K' | '16K' | null): number {
  return round1(meshSizeMB(triangleMillions, textureRes) * 2.2);
}

/** Raw E57 point cloud — ~24 bytes/point (xyz float32 + rgb + intensity), uncompressed. */
export function pointCloudSizeMB(pointsMillions: number): number {
  return round1(pointsMillions * 24);
}

/** Gaussian splat (.splat/.ply pair) — ~190 bytes/gaussian (position, scale, rotation quaternion, opacity, low-order SH). */
export function splatSizeMB(gaussiansMillions: number): number {
  return round1(gaussiansMillions * 190);
}

/** Vector technical drawing sheet (DWG/PDF, A1/A0), ~6 MB/tờ trung bình. */
export function drawingSizeMB(sheets: number): number {
  return round1(sheets * 6);
}

/** WAV 48kHz stereo audio — 11,5 MB/phút. */
export function wavSizeMB(minutes: number): number {
  return round1(minutes * 11.5);
}

/** ProRes 422 HQ 4K video — 5,3 GB/phút. */
export function proresSizeMB(minutes: number): number {
  return round1(minutes * 5300);
}

/** TIFF 600dpi khổ A4 (hoặc quy đổi tương đương) — 100 MB/trang; 300dpi ước ~28 MB/trang. */
export function tiffA4SizeMB(pages: number, dpi: 300 | 600 = 600): number {
  const perPage = dpi === 600 ? 100 : 28;
  return round1(pages * perPage);
}

/** Scanned PDF/A (raster nén + lớp OCR văn bản) — ~1,1 MB/trang trung bình. */
export function pdfaSizeMB(pages: number): number {
  return round1(pages * 1.1);
}

/** Ảnh tư liệu lịch sử phục chế, lưu JPEG chất lượng cao. */
export function jpegPhotoSizeMB(megapixels: number): number {
  return round1(megapixels * 6);
}

/** Ảnh tư liệu lịch sử phục chế, lưu TIFF không nén (lưu trữ gốc). */
export function tiffPhotoSizeMB(megapixels: number): number {
  return round1(megapixels * 30);
}

/** Formats a raw MB value the way every size field in the app is displayed. */
export function formatSizeMB(mb: number): string {
  if (mb >= 1000) {
    return `${(mb / 1000).toFixed(1).replace('.', ',')} GB`;
  }
  return `${Math.round(mb)} MB`;
}
