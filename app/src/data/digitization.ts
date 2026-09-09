import { derivedFileLabel } from '../utils/assetCode';
import { mulberry32, pick, randFloat, randInt } from '../utils/prng';
import type { Asset, DigitalForm } from '../services/types';
import { DIGITAL_FORM_LABELS } from './taxonomy';
import { formatMissing } from './missingValues';
import { PUBLISHED_STATUSES } from './pipeline';
import { formatSizeMB } from './sizeFormulas';

// C1 — mọi trường "làm giàu" màn Chi tiết dữ liệu số hóa (phiên bản, checksum,
// fixity, tầng lưu trữ, rights statement, mức truy cập, dữ liệu cá nhân, chữ
// ký số, song thẩm Hán Nôm) mà `services/types.ts` CHƯA lưu trực tiếp trên
// `Asset` được DẪN XUẤT tất định (deterministic) tại đây, từ chính nội dung
// bản ghi + một RNG có seed cố định theo `asset.code` (cùng kỹ thuật với
// `data/objects/artifactsGenerated.ts` — không Math.random(), không đổi giữa
// các lần tải). Cách này tránh phải thêm hàng chục cột mới vào 150 bản ghi
// mock tay trong khi vẫn cho kết quả ổn định và đúng với 07-mo-hinh-du-lieu.md.

// ---------------------------------------------------------------------------
// RNG tất định theo khoá chuỗi (asset.code + tên trường) — không Math.random().
// ---------------------------------------------------------------------------

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rngFor(...parts: string[]): () => number {
  return mulberry32(seedFromString(parts.join('|')));
}

// ---------------------------------------------------------------------------
// Ngày dd/mm/yyyy — cùng định dạng `Asset.updated` dùng toàn app.
// ---------------------------------------------------------------------------

function parseVnDate(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function formatVnDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** `dateStr` lùi (delta âm) hoặc tiến (delta dương) `deltaDays` ngày — trả lại nguyên văn nếu không parse được. */
function addDays(dateStr: string, deltaDays: number): string {
  const d = parseVnDate(dateStr);
  if (!d) return dateStr;
  d.setDate(d.getDate() + deltaDays);
  return formatVnDate(d);
}

// ---------------------------------------------------------------------------
// Người dùng hiện tại (TẠM) — chưa có auth/context đăng nhập thật (màn Đăng
// nhập B1 do luồng khác phụ trách). Đặt tạm bằng một cán bộ CÓ phụ trách dữ
// liệu số hóa thật để nguyên tắc 4 mắt minh hoạ được cả hai nhánh (khoá nút
// Phê duyệt trên bản ghi do chính người này phụ trách, mở trên bản ghi người
// khác phụ trách). Khi có auth thật: thay bằng user đang đăng nhập lấy từ
// context — nguyên tắc 4 mắt áp dụng cho MỌI vai trò đang đăng nhập, không
// riêng vai trò "Phê duyệt".
// ---------------------------------------------------------------------------
export const CURRENT_USER_NAME = 'Trần Văn Minh';

// ---------------------------------------------------------------------------
// Rights statement + mức truy cập + cờ dữ liệu cá nhân
// ---------------------------------------------------------------------------

export interface RightsStatementInfo {
  code: string;
  labelVi: string;
  note: string;
}

export const RIGHTS_STATEMENTS: Record<'ccBy' | 'inCEdu' | 'und', RightsStatementInfo> = {
  ccBy: {
    code: 'CC-BY-4.0',
    labelVi: 'Ghi công tác giả (CC BY 4.0)',
    note: 'Dữ liệu do Trung tâm tự số hóa — công bố mở, khuyến khích tái sử dụng có ghi công theo Luật Dữ liệu 60/2024 và NĐ 278/2025.',
  },
  inCEdu: {
    code: 'InC-EDU',
    labelVi: 'Có bản quyền — chỉ dùng giáo dục/nghiên cứu',
    note: 'Hạn chế khai thác do nội dung chứa dữ liệu cá nhân/gia hệ — chỉ cấp quyền cho mục đích giáo dục, nghiên cứu, có kiểm soát.',
  },
  und: {
    code: 'UND',
    labelVi: 'Chưa xác định tình trạng bản quyền',
    note: 'Tác giả tư liệu lịch sử không xác định được (đã tra cứu, kết luận Không rõ) — thận trọng khi cấp phép công bố mở.',
  },
};

const PERSONAL_DATA_KEYWORDS = ['gia phả', 'chân dung'];

/** Badge "Chứa dữ liệu cá nhân" — gia phả/ảnh chân dung (Luật BVDLCN 91/2025). Suy ra từ nội dung tên/mô tả, không phải trường nhập tay riêng. */
export function containsPersonalData(asset: Asset): boolean {
  const hay = `${asset.name} ${asset.desc}`.toLowerCase();
  return PERSONAL_DATA_KEYWORDS.some((k) => hay.includes(k));
}

export type AccessLevel = 'CONG_KHAI' | 'NGHIEN_CUU' | 'NOI_BO';

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  CONG_KHAI: 'Công khai',
  NGHIEN_CUU: 'Nghiên cứu',
  NOI_BO: 'Nội bộ',
};

/** Mức truy cập — chưa xuất bản hoặc chứa dữ liệu cá nhân thì không thể Công khai. */
export function getAccessLevel(asset: Asset): AccessLevel {
  if (containsPersonalData(asset)) return 'NOI_BO';
  if (!PUBLISHED_STATUSES.includes(asset.status)) return 'NOI_BO';
  if (/Không rõ/.test(asset.desc) && asset.objectClass === 'av') return 'NGHIEN_CUU';
  return 'CONG_KHAI';
}

/** Rights statement áp dụng — theo RightsStatements.org, khớp danh mục mẫu ở `07-mo-hinh-du-lieu.md`. */
export function getRightsStatement(asset: Asset): RightsStatementInfo {
  if (containsPersonalData(asset)) return RIGHTS_STATEMENTS.inCEdu;
  if (asset.objectClass === 'av' && /Không rõ/.test(asset.desc)) return RIGHTS_STATEMENTS.und;
  return RIGHTS_STATEMENTS.ccBy;
}

// ---------------------------------------------------------------------------
// Chữ ký số khi xuất bản (Luật GDĐT 20/2023 Điều 12–13, NĐ 137/2024)
// ---------------------------------------------------------------------------

export interface SignatureInfo {
  signedBy: string;
  signedAt: string;
  conversionMark: string;
}

const SIGNING_OFFICER = 'Phạm Quốc Đạt — cán bộ Phê duyệt, đại diện cơ quan chuyển đổi';

/** `null` nếu chưa xuất bản — chữ ký số chỉ gắn vào phiên bản ĐÃ chuyển đổi/công bố. */
export function getSignatureInfo(asset: Asset): SignatureInfo | null {
  if (!PUBLISHED_STATUSES.includes(asset.status)) return null;
  return {
    signedBy: SIGNING_OFFICER,
    signedAt: asset.updated,
    conversionMark: `CĐS-${asset.code}`,
  };
}

// ---------------------------------------------------------------------------
// "Xin ý kiến Bộ VHTTDL" trước khi xuất bản — di tích quốc gia đặc biệt
// (NĐ 308/2025/NĐ-CP Điều 87: chuyển đổi văn bản giấy sang thông điệp dữ liệu
// với di tích quốc gia đặc biệt/bảo vật quốc gia cần ý kiến BẰNG VĂN BẢN của
// Bộ VHTTDL). Toàn bộ quần thể Văn Miếu — Quốc Tử Giám là di tích quốc gia
// đặc biệt (HERITAGE_RANKING) nên yêu cầu này áp dụng cho MỌI bản ghi khi
// xuất bản, không riêng bản ghi nào. Suy ra "đã có ý kiến" trực tiếp từ việc
// bản ghi đã qua khỏi 'Đã duyệt' (đã Xuất bản trở lên) — CỐ Ý không thêm một
// trường lưu trữ riêng trên `Asset`/seed data: cổng xác nhận này đã nằm ở
// modal "Xuất bản" (xem AssetDetailPage — publishGateOpen bắt tick xác nhận
// trước khi gọi advanceStatus), nên trạng thái pipeline đã CHÍNH nó là nguồn
// xác thực; thêm cờ riêng sẽ tạo hai nguồn sự thật có thể lệch nhau.
// ---------------------------------------------------------------------------

export interface MinistryApproval {
  obtained: boolean;
  documentNo: string | null;
  date: string | null;
}

export function getMinistryApproval(asset: Asset): MinistryApproval {
  if (!PUBLISHED_STATUSES.includes(asset.status)) return { obtained: false, documentNo: null, date: null };
  const rng = rngFor('moet', asset.code);
  return {
    obtained: true,
    documentNo: `${randInt(rng, 1000, 4999)}/TB-BVHTTDL`,
    date: addDays(asset.updated, -randInt(rng, 3, 12)),
  };
}

// ---------------------------------------------------------------------------
// Phiên bản (asset_version) — v1 bất biến + so sánh +/-
// ---------------------------------------------------------------------------

export interface AssetVersionInfo {
  versionNo: number;
  label: string;
  isOriginal: boolean;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string;
  changeReason: string | null;
  sizeLabel: string;
}

const REDIGITIZE_REASONS = [
  'Số hóa lại theo kết luận Kiểm định chất lượng — độ phân giải chưa đạt',
  'Quét bổ sung góc khuất theo yêu cầu Thẩm định nội dung',
  'Hiệu chỉnh màu sắc/ánh sáng sau đối chiếu hiện vật gốc',
  'Vá lỗ hổng lưới (mesh) vùng đế sau kiểm định chất lượng',
  'Cập nhật theo kết quả phục chế/tu bổ hiện vật gốc',
];

/** Danh sách phiên bản — v1 LUÔN bất biến (immutable master); các v sau (nếu có) là số hóa lại/phục chế. */
export function getVersionHistory(asset: Asset): AssetVersionInfo[] {
  const rng = rngFor('version', asset.code);
  const forcedSingle = asset.status === 'Cần số hóa lại';
  const rollsExtra = !forcedSingle && rng() < 0.32;
  const rollsThird = rollsExtra && rng() < 0.18;
  const count = rollsThird ? 3 : rollsExtra ? 2 : 1;

  const gaps: number[] = [];
  for (let i = 0; i < count - 1; i++) gaps.push(randInt(rng, 4, 18));
  const offsetsFromLatest: number[] = [0];
  let acc = 0;
  for (const g of gaps) {
    acc += g;
    offsetsFromLatest.push(acc);
  }
  offsetsFromLatest.reverse(); // [0] = v1 (xa nhất), [count-1] = v hiện hành (= asset.updated)

  return Array.from({ length: count }, (_, i) => {
    const versionNo = i + 1;
    const isCurrent = versionNo === count;
    return {
      versionNo,
      label: `v${versionNo}`,
      isOriginal: versionNo === 1,
      isCurrent,
      createdBy: versionNo === 1 ? asset.owner : pick(rng, [asset.owner, asset.owner, CURRENT_USER_NAME]),
      createdAt: addDays(asset.updated, -offsetsFromLatest[i]),
      changeReason: versionNo === 1 ? null : pick(rng, REDIGITIZE_REASONS),
      sizeLabel: isCurrent ? asset.size : formatSizeMB(asset.sizeMB * randFloat(rngFor('vsize', asset.code, String(versionNo)), 0.78, 1.22)),
    };
  });
}

export interface VersionDiffLine {
  sign: '+' | '-' | '·';
  label: string;
  value: string;
}

/** So sánh 2 phiên bản — khác biệt metadata dạng danh sách +/− (yêu cầu C1). */
export function compareVersions(asset: Asset, older: AssetVersionInfo, newer: AssetVersionInfo): VersionDiffLine[] {
  return [
    { sign: '-', label: 'Dung lượng', value: older.sizeLabel },
    { sign: '+', label: 'Dung lượng', value: newer.sizeLabel },
    { sign: '·', label: 'Định dạng tệp', value: `${asset.fmt} (không đổi)` },
    { sign: '+', label: 'Lý do tạo phiên bản', value: newer.changeReason ?? '—' },
    { sign: '+', label: 'Người tạo phiên bản', value: newer.createdBy },
    { sign: '+', label: 'Thời điểm tạo', value: newer.createdAt },
  ];
}

// ---------------------------------------------------------------------------
// Tệp tin — checksum SHA-256 (mô phỏng), trạng thái fixity, tầng lưu trữ
// ---------------------------------------------------------------------------

const EXT_BY_DIGITAL_FORM: Record<DigitalForm, [string, string]> = {
  mesh3d: ['glb', 'e57'],
  splat: ['splat', 'ply'],
  pointcloud: ['e57', 'ply'],
  drawing: ['dwg', 'pdf'],
  text: ['tiff', 'pdf'],
  image: ['tiff', 'jpg'],
  video: ['mov', 'mp4'],
  audio: ['wav', 'mp3'],
};

export type FixityStatus = 'DA_XAC_MINH' | 'CHUA_KIEM_TRA' | 'LECH_CHECKSUM';

export const FIXITY_LABELS: Record<FixityStatus, string> = {
  DA_XAC_MINH: '✓ Đã xác minh',
  CHUA_KIEM_TRA: '⚠ Chưa xác minh lần gần nhất',
  LECH_CHECKSUM: '⚠ Lệch checksum — cần kiểm tra lại',
};

export type StorageTier = 'HOT' | 'AIP' | 'COLD';

export const STORAGE_TIER_LABELS: Record<StorageTier, string> = {
  HOT: 'Tầng nóng',
  AIP: 'Tầng lưu trữ AIP',
  COLD: 'Tầng lạnh',
};

export interface AssetFileRow {
  role: 'master' | 'web' | 'raw';
  name: string;
  kindLabel: string;
  size: string;
  checksum: string;
  checksumShort: string;
  fixityStatus: FixityStatus;
  fixityCheckedAt: string | null;
  storageTier: StorageTier;
}

function hexChecksum(seedKey: string): string {
  const rng = rngFor('checksum', seedKey);
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 64; i++) out += chars[Math.floor(rng() * 16)];
  return out;
}

function shortenChecksum(hex: string): string {
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`;
}

function webSizeLabel(asset: Asset): string {
  const rng = rngFor('websize', asset.code);
  return formatSizeMB(Math.max(2, asset.sizeMB * randFloat(rng, 0.05, 0.22)));
}

function rawSizeLabel(asset: Asset): string {
  if (asset.digitalForm === 'mesh3d' || asset.digitalForm === 'splat' || asset.digitalForm === 'pointcloud') {
    const rng = rngFor('rawsize', asset.code);
    return formatSizeMB(asset.sizeMB * randFloat(rng, 1.3, 2.2));
  }
  return formatMissing('KHONG_AP_DUNG');
}

/** Bảng Tệp tin — bản gốc/tối ưu web/thô, mỗi tệp kèm checksum SHA-256, trạng thái fixity, tầng lưu trữ (C1). */
export function getFileList(asset: Asset): AssetFileRow[] {
  const ext = EXT_BY_DIGITAL_FORM[asset.digitalForm] || ['bin', 'zip'];
  const archived = asset.status === 'Đã lưu trữ — đang giám sát' || asset.status === 'Đã kiểm kê';

  const roles: { role: 'master' | 'web' | 'raw'; kindLabel: string; ext: string; size: string; tier: StorageTier }[] = [
    { role: 'master', kindLabel: 'Bản gốc (bất biến)', ext: ext[0], size: asset.size, tier: archived ? 'COLD' : 'AIP' },
    { role: 'web', kindLabel: 'Bản tối ưu web', ext: ext[0], size: webSizeLabel(asset), tier: 'HOT' },
    { role: 'raw', kindLabel: 'Dữ liệu thô', ext: ext[1], size: rawSizeLabel(asset), tier: 'COLD' },
  ];

  return roles.map((r) => {
    const rng = rngFor('fixity', asset.code, r.role);
    const checksum = hexChecksum(`${asset.code}#${r.role}`);
    const roll = rng();
    let fixityStatus: FixityStatus = 'DA_XAC_MINH';
    if (roll < 0.05) fixityStatus = 'LECH_CHECKSUM';
    else if (roll < 0.16) fixityStatus = 'CHUA_KIEM_TRA';
    const fixityCheckedAt = fixityStatus === 'CHUA_KIEM_TRA' ? null : addDays(asset.updated, -randInt(rng, 1, 30));
    return {
      role: r.role,
      name: derivedFileLabel(asset.code, r.role) + '.' + r.ext,
      kindLabel: r.kindLabel,
      size: r.size,
      checksum,
      checksumShort: shortenChecksum(checksum),
      fixityStatus,
      fixityCheckedAt,
      storageTier: r.tier,
    };
  });
}

/** Tải bản gốc bị chặn cho tới khi Xuất bản (C1: "chưa Xuất bản thì chặn tải bản gốc"). */
export function canDownloadMaster(asset: Asset): boolean {
  return PUBLISHED_STATUSES.includes(asset.status);
}

// ---------------------------------------------------------------------------
// Quan hệ — 3 nhóm theo 0ter
// ---------------------------------------------------------------------------

export interface RepresentationRow {
  asset: Asset;
  relationLabel: string;
  isPreservationSurrogate: boolean;
  surrogateNote?: string;
}

/** Nhóm 1 — bản đại diện số CÙNG đối tượng vật lý (hasRepresentation/hasDrawing/hasPreservationSurrogate). */
export function getRepresentationGroup(asset: Asset, allAssets: Asset[]): RepresentationRow[] {
  if (!asset.physicalArtifactId) return [];
  const siblings = allAssets.filter((a) => a.physicalArtifactId === asset.physicalArtifactId && a.id !== asset.id);
  const groupHasSplat = asset.digitalForm === 'splat' || siblings.some((a) => a.digitalForm === 'splat');

  return siblings.map((a) => {
    const isSurrogate = groupHasSplat && a.digitalForm === 'pointcloud';
    let relationLabel = `Bản đại diện số — ${DIGITAL_FORM_LABELS[a.digitalForm]} (hasRepresentation)`;
    if (a.digitalForm === 'drawing') relationLabel = 'Hồ sơ bản vẽ (hasDrawing)';
    if (isSurrogate) relationLabel = 'Bản dẫn xuất bảo hiểm (hasPreservationSurrogate)';
    return {
      asset: a,
      relationLabel,
      isPreservationSurrogate: isSurrogate,
      surrogateNote: isSurrogate
        ? '.splat chưa có chuẩn hoá ISO/OGC chính thức — công nghệ Gaussian Splatting (3DGS) mới công bố năm 2023. Bản đám mây điểm (PLY/E57) đi kèm là dữ liệu DUY NHẤT phục hồi được nội dung nếu công cụ đọc .splat hiện tại ngừng được hỗ trợ. Bản này lưu ở tầng AIP, tham gia lịch kiểm tra toàn vẹn (fixity) định kỳ như mọi bản gốc master khác, và KHÔNG BAO GIỜ bị xoá kể cả khi bản splat gốc còn nguyên vẹn — khác hẳn bản tối ưu web (derivedFrom), vốn có thể xoá và tái sinh tự do bất cứ lúc nào.'
        : undefined,
    };
  });
}

const RELATION_LABELS: Record<string, string> = {
  depictedIn: 'Được khắc họa trong (depictedIn)',
  mentionedIn: 'Được nhắc đến trong (mentionedIn)',
  subjectOf: 'Là chủ đề của (subjectOf)',
  hasRubbing: 'Có bản dập (hasRubbing)',
};

export interface DepictionRow {
  asset: Asset;
  label: string;
}

/** Nhóm 2 — đối tượng này LÀ CHỦ ĐỀ của một tư liệu độc lập khác (depictedIn/mentionedIn/subjectOf). */
export function getDepictionGroup(asset: Asset, allAssets: Asset[]): DepictionRow[] {
  return allAssets
    .filter((a) => a.relatedObject?.physicalArtifactId === asset.physicalArtifactId && a.id !== asset.id)
    .map((a) => ({ asset: a, label: RELATION_LABELS[a.relatedObject?.kind ?? ''] ?? String(a.relatedObject?.kind ?? '') }));
}

/** Nhóm 3 — quan hệ cấu trúc: breadcrumb partOf (Toàn khu → khu → đối tượng), suy ra từ `loc`. `null` nếu không có vị trí không gian (vd media thuyết minh). */
export function getStructuralBreadcrumb(asset: Asset): string[] | null {
  if (!asset.loc || asset.loc === '—') return null;
  const parts = asset.loc
    .split(' — ')
    .map((p) => p.trim())
    .filter(Boolean);
  return ['Văn Miếu — Quốc Tử Giám', ...parts, asset.name];
}

// ---------------------------------------------------------------------------
// Song thẩm Hán Nôm (Thẩm định nội dung — người dịch ≠ người thẩm định)
// ---------------------------------------------------------------------------

export function isHanNomContent(asset: Asset): boolean {
  return asset.coll === 'Tư liệu Hán Nôm' || asset.tags.includes('chữ Hán Nôm');
}

export interface ReviewPairInfo {
  translator: string;
  reviewer: string;
}

const REVIEWER_POOL = ['Ngô Bảo Ngọc', 'Lê Thu Trang', 'Đỗ Anh Quân', 'Trần Văn Minh', 'Nguyễn Thị Hạnh'];

/** Người dịch/phiên âm ≠ người thẩm định (song thẩm) — bắt buộc với tư liệu Hán Nôm khi vào bước Thẩm định nội dung. */
export function getHanNomReviewPair(asset: Asset): ReviewPairInfo | null {
  if (!isHanNomContent(asset)) return null;
  const rng = rngFor('hannom', asset.code);
  const candidates = REVIEWER_POOL.filter((n) => n !== asset.owner);
  return { translator: asset.owner, reviewer: pick(rng, candidates.length ? candidates : REVIEWER_POOL) };
}
