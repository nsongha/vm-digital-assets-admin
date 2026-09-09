import { BATCH_PARSE_ROWS } from '../../data/metadataFields';
import { INITIAL_UPLOAD_COUNTER, INITIAL_UPLOADS } from '../../data/uploads';
import { Store } from '../store';
import type { BatchRow, UploadItem } from '../types';

export const uploadStore = new Store<UploadItem[]>(INITIAL_UPLOADS);

let uploadCounter = INITIAL_UPLOAD_COUNTER;

/** Ported from the `addUpload` / `confirmBatch` setInterval progress simulation in v3.html. */
function simulateProgress(id: UploadItem['id'], intervalMs: number, step: () => number): void {
  const timer = setInterval(() => {
    let done = false;
    uploadStore.setState((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const pct = Math.min(100, u.pct + step());
        if (pct >= 100) done = true;
        return { ...u, pct };
      }),
    );
    if (done) clearInterval(timer);
  }, intervalMs);
}

export interface UploadService {
  readonly store: Store<UploadItem[]>;
  list(): UploadItem[];
  /** Ported from `addUpload` in v3.html — single-file "Thêm vào hàng đợi" action. */
  addUpload(): UploadItem;
  cancel(id: UploadItem['id']): void;
  /** Ported from the fixed mock result of `parseBatchExcel` in v3.html. */
  parseBatch(): BatchRow[];
  /** Ported from `confirmBatch` in v3.html — pushes matched rows into the queue with staggered progress sims. */
  confirmBatch(rows: BatchRow[]): UploadItem[];
}

export const uploadService: UploadService = {
  store: uploadStore,
  list() {
    return uploadStore.getState();
  },
  addUpload() {
    const id = Date.now();
    uploadCounter += 1;
    const item: UploadItem = { id, name: 'vm_3d_0' + uploadCounter + '_scan.glb', size: '1,1 GB', pct: 0 };
    uploadStore.setState((prev) => [item, ...prev]);
    simulateProgress(id, 350, () => 4 + Math.round(Math.random() * 6));
    return item;
  },
  cancel(id) {
    uploadStore.setState((prev) => prev.filter((u) => u.id !== id));
  },
  parseBatch() {
    return BATCH_PARSE_ROWS.map((r) => ({ ...r }));
  },
  confirmBatch(rows) {
    const matched = rows.filter((r) => r.matched);
    const items: UploadItem[] = matched.map((r) => ({
      id: Date.now() + Math.random(),
      name: r.code.toLowerCase().replace(/-/g, '_') + '_batch.dat',
      size: '—',
      pct: 0,
    }));
    uploadStore.setState((prev) => [...items, ...prev]);
    items.forEach((it, idx) => {
      simulateProgress(it.id, 300 + idx * 60, () => 5 + Math.round(Math.random() * 8));
    });
    return items;
  },
};
