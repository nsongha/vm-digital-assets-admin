import { COLLECTIONS_META } from '../../data/collections';
import { DIGITAL_FORM_LABELS } from '../../data/taxonomy';
import { assetsInCollection, digitalFormsLabel, mostRecentUpdatedShort } from '../../data/selectors';
import { formatSizeMB } from '../../data/sizeFormulas';
import { slugOf } from '../../utils/slug';
import { assetService } from './assetService';
import type { Asset, Collection } from '../types';

// A2 — `count`/`types`/`updated`/`size` derived from `data/assets.ts` on
// every call (never cached/hand-typed), so opening a collection always
// shows exactly the count printed on its card (redteam Đòn 2).
export interface CollectionService {
  list(): Collection[];
  getByName(name: string): Collection | undefined;
  getBySlug(slug: string): Collection | undefined;
  /** Assets in a collection, optionally AND-filtered by tags — ported from `collAssets` in v3.html. */
  assetsIn(collectionName: string | null, tags: string[]): Asset[];
}

function toCollection(meta: (typeof COLLECTIONS_META)[number]): Collection {
  const items = assetsInCollection(assetService.list(), meta.name);
  const sizeMB = items.reduce((s, a) => s + a.sizeMB, 0);
  return {
    name: meta.name,
    desc: meta.desc,
    slug: meta.slug,
    cover: meta.cover,
    count: items.length,
    types: digitalFormsLabel(items, DIGITAL_FORM_LABELS),
    updated: mostRecentUpdatedShort(items),
    size: formatSizeMB(sizeMB),
  };
}

export const collectionService: CollectionService = {
  list() {
    return COLLECTIONS_META.map(toCollection);
  },
  getByName(name) {
    const meta = COLLECTIONS_META.find((c) => c.name === name);
    return meta ? toCollection(meta) : undefined;
  },
  getBySlug(slug) {
    const meta = COLLECTIONS_META.find((c) => c.slug === slug);
    return meta ? toCollection(meta) : undefined;
  },
  assetsIn(collectionName, tags) {
    return assetService
      .list()
      .filter(
        (a) =>
          (!collectionName || a.coll === collectionName) &&
          (tags.length === 0 || tags.every((t) => a.tags.includes(t))),
      );
  },
};

export { slugOf };
