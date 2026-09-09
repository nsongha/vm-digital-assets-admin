import type { Asset, AssetStatus, DigitalForm } from '../services/types';
import { countsTowardCompletenessDenominator, isCompletenessSatisfied, isMissingDisplay, type MissingReason } from './missingValues';
import { formatSizeMB } from './sizeFormulas';

// A2 — mọi con số Tổng quan/pipeline/bộ sưu tập/dung lượng PHẢI derive từ
// mảng `ASSETS` duy nhất qua các hàm ở đây, không có số ghi cứng ở nơi khác.

export function totalCount(assets: Asset[]): number {
  return assets.length;
}

export function countByStatus(assets: Asset[], status: AssetStatus): number {
  return assets.filter((a) => a.status === status).length;
}

export function totalSizeMB(assets: Asset[]): number {
  return assets.reduce((s, a) => s + a.sizeMB, 0);
}

export function totalSizeGB(assets: Asset[]): number {
  return totalSizeMB(assets) / 1000;
}

export interface StorageBucket {
  label: string;
  forms: DigitalForm[];
  dot: string;
}

/** Bucket definitions the storage-breakdown card renders — sizes/percents below are always derived, never literal. */
export const STORAGE_BUCKETS: StorageBucket[] = [
  { label: 'Gaussian splat', forms: ['splat'], dot: 'var(--ink)' },
  { label: 'Mô hình 3D & đám mây điểm', forms: ['mesh3d', 'pointcloud'], dot: 'var(--accent)' },
  { label: 'Media (ảnh, video, âm thanh)', forms: ['image', 'video', 'audio'], dot: '#ef8354' },
  { label: 'Tài liệu & bản vẽ kỹ thuật', forms: ['text', 'drawing'], dot: '#7fb5aa' },
];

export interface StorageBreakdownRow {
  label: string;
  sizeMB: number;
  size: string;
  pct: number;
  dot: string;
}

export function storageBreakdown(assets: Asset[]): StorageBreakdownRow[] {
  const total = totalSizeMB(assets) || 1;
  return STORAGE_BUCKETS.map((b) => {
    const mb = assets.filter((a) => b.forms.includes(a.digitalForm)).reduce((s, a) => s + a.sizeMB, 0);
    return { label: b.label, sizeMB: mb, size: formatSizeMB(mb), pct: Math.round((mb / total) * 100), dot: b.dot };
  });
}

export function assetsInCollection(assets: Asset[], collName: string): Asset[] {
  return assets.filter((a) => a.coll === collName);
}

/** Most recent `updated` (dd/mm/yyyy) among a set of assets — used to derive Collection.updated. */
export function mostRecentUpdated(assets: Asset[]): string {
  let best: { d: Date; raw: string } | null = null;
  for (const a of assets) {
    const [dd, mm, yyyy] = a.updated.split('/').map(Number);
    if (!dd || !mm || !yyyy) continue;
    const d = new Date(yyyy, mm - 1, dd);
    if (!best || d > best.d) best = { d, raw: a.updated };
  }
  return best?.raw ?? '—';
}

/** "dd/mm" short form (as the original Collection.updated used) from a set of assets. */
export function mostRecentUpdatedShort(assets: Asset[]): string {
  const full = mostRecentUpdated(assets);
  const parts = full.split('/');
  return parts.length === 3 ? `${parts[0]}/${parts[1]}` : full;
}

/** Distinct digitalForm labels present, "·"-joined — derives Collection.types. */
export function digitalFormsLabel(assets: Asset[], labels: Record<DigitalForm, string>): string {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const a of assets) {
    const label = labels[a.digitalForm];
    if (!seen.has(label)) {
      seen.add(label);
      order.push(label);
    }
  }
  return order.join(' · ');
}

// --- 0quinquies — % độ đầy đủ hồ sơ -----------------------------------

/** Trường nào của Asset được tính vào chỉ số đầy đủ hồ sơ, và mã khuyết giá trị hiện tại của nó (nếu có). */
function fieldMissingReasons(asset: Asset): (MissingReason | null)[] {
  // `era` là trường duy nhất trong mock hiện tại dùng sentinel tường minh
  // (0quinquies) — các trường khác (soKiemKe…) dùng chuỗi đã format tương tự
  // và có thể mở rộng vào mảng này khi cần.
  const eraMissing = isMissingDisplay(asset.era) ? parseMissingReason(asset.era) : null;
  return [eraMissing];
}

function parseMissingReason(display: string): MissingReason | null {
  if (display.includes('Không áp dụng')) return 'KHONG_AP_DUNG';
  if (display.includes('Chưa xác định')) return 'CHUA_XAC_DINH';
  if (display.includes('Không rõ')) return 'KHONG_RO';
  if (display.includes('Chưa nhập liệu')) return 'CHUA_NHAP';
  if (display.includes('Hạn chế công bố')) return 'HAN_CHE';
  return null;
}

/** % độ đầy đủ hồ sơ cho MỘT bản ghi — mẫu số loại trừ KHONG_AP_DUNG; KHONG_RO/HAN_CHE tính là đã xử lý (0quinquies). */
export function profileCompletenessPct(asset: Asset): number {
  const reasons = fieldMissingReasons(asset);
  let denom = 0;
  let satisfied = 0;
  for (const r of reasons) {
    if (r === null) {
      denom += 1;
      satisfied += 1;
      continue;
    }
    if (!countsTowardCompletenessDenominator(r)) continue; // KHONG_AP_DUNG — loại khỏi mẫu số
    denom += 1;
    if (isCompletenessSatisfied(r)) satisfied += 1;
  }
  return denom === 0 ? 100 : Math.round((satisfied / denom) * 100);
}

/** % độ đầy đủ hồ sơ trung bình toàn kho — cho màn Báo cáo–Thống kê/Kiểm kê. */
/**
 * Độ đầy đủ hồ sơ trung bình. Trả về `null` khi KHÔNG có bản ghi nào để tính —
 * gọi bên nhận phải tự quyết cách hiển thị ("chưa số hóa"), thay vì mặc định 100%.
 * Trả 100% cho tập rỗng là sai nghiệp vụ nghiêm trọng: một công trình chưa số hóa
 * sẽ hiện "hồ sơ đầy đủ 100%", khiến báo cáo tiến độ số hóa bị đọc ngược.
 */
export function averageCompletenessPctOrNull(assets: Asset[]): number | null {
  if (assets.length === 0) return null;
  const sum = assets.reduce((s, a) => s + profileCompletenessPct(a), 0);
  return Math.round(sum / assets.length);
}

export function averageCompletenessPct(assets: Asset[]): number {
  if (assets.length === 0) return 0;
  const sum = assets.reduce((s, a) => s + profileCompletenessPct(a), 0);
  return Math.round(sum / assets.length);
}
