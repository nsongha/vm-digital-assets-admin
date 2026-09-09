import { ASSETS } from '../../data/assets';
import { nextStatus, PIPELINE_SEQUENCE } from '../../data/pipeline';
import { matchesAssetQuery } from '../../utils/search';
import { Store } from '../store';
import type { Asset, AssetStatus } from '../types';

export const assetStore = new Store<Asset[]>(ASSETS);

function updateAsset(id: number, mutate: (a: Asset) => Asset): Asset | undefined {
  let updated: Asset | undefined;
  assetStore.setState((prev) =>
    prev.map((a) => {
      if (a.id !== id) return a;
      updated = mutate(a);
      return updated;
    }),
  );
  return updated;
}

export interface AssetService {
  readonly store: Store<Asset[]>;
  list(): Asset[];
  get(id: number): Asset | undefined;
  /** Tiến 1 bước theo `PIPELINE_SEQUENCE` (C3, 9 trạng thái) — không làm gì nếu đã ở bước cuối. */
  advanceStatus(id: number): Asset | undefined;
  /** Nhánh THẤT BẠI của Kiểm định chất lượng (QC) — chuyển sang 'Cần số hóa lại'. */
  markNeedsRedigitization(id: number): Asset | undefined;
  /** "Trả lại bổ sung" — lý do BẮT BUỘC, đưa bản ghi về 'Đang xử lý' để bổ sung/chỉnh sửa. */
  requestRevision(id: number, reason: string): Asset | undefined;
  /** "Gỡ xuất bản" — lý do BẮT BUỘC, chuyển sang 'Đã gỡ/thu hồi'; bản ghi được GIỮ LẠI, không xoá. */
  unpublish(id: number, reason: string): Asset | undefined;
  statusSteps(): AssetStatus[];
  /** A4 — tìm kiếm bỏ dấu 2 chiều, quét name/code/desc/coll/loc/owner/era/fmt (không chỉ name+code). */
  search(query: string): Asset[];
  /** Tất cả bản ghi chia sẻ CÙNG physicalArtifactId với `id` (0ter nhóm 1 — hasRepresentation), kể cả chính nó. */
  representationsOf(id: number): Asset[];
}

export const assetService: AssetService = {
  store: assetStore,
  list() {
    return assetStore.getState();
  },
  get(id) {
    return assetStore.getState().find((a) => a.id === id);
  },
  advanceStatus(id) {
    return updateAsset(id, (a) => {
      const next = nextStatus(a.status);
      return next ? { ...a, status: next } : a;
    });
  },
  markNeedsRedigitization(id) {
    return updateAsset(id, (a) => ({ ...a, status: 'Cần số hóa lại' }));
  },
  requestRevision(id, reason) {
    if (!reason.trim()) throw new Error('Lý do trả lại bổ sung là bắt buộc.');
    return updateAsset(id, (a) => ({ ...a, status: 'Đang xử lý' }));
  },
  unpublish(id, reason) {
    if (!reason.trim()) throw new Error('Lý do gỡ xuất bản là bắt buộc.');
    return updateAsset(id, (a) => ({ ...a, status: 'Đã gỡ/thu hồi' }));
  },
  statusSteps() {
    return PIPELINE_SEQUENCE;
  },
  search(query) {
    const all = assetStore.getState();
    if (!query.trim()) return all;
    return all.filter((a) => matchesAssetQuery(a, query));
  },
  representationsOf(id) {
    const all = assetStore.getState();
    const sel = all.find((a) => a.id === id);
    if (!sel?.physicalArtifactId) return sel ? [sel] : [];
    return all.filter((a) => a.physicalArtifactId === sel.physicalArtifactId);
  },
};
