import type { UploadItem } from '../services/types';

// Ported from the initial `uploads` state array in v3.html.
export const INITIAL_UPLOADS: UploadItem[] = [
  { id: 1, name: 'khuevancac_block2.splat', size: '3,1 GB', pct: 62 },
  { id: 2, name: 'sacphong_1774_mat2.tiff', size: '240 MB', pct: 31 },
  { id: 3, name: 'VM-3D-016_ruada.glb', size: '1,4 GB', pct: 100 },
  { id: 4, name: 'bia_ts_khoa1502_raw.tif', size: '180 MB', pct: 0, error: 'Sai độ phân giải — yêu cầu TIFF 600dpi' },
];

// Starting counter for auto-generated `vm_3d_0{n}_scan.glb` uploads —
// ported from the `upCounter: 17` initial state.
export const INITIAL_UPLOAD_COUNTER = 17;
