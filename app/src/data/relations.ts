import type { Asset } from '../services/types';

// 0ter — 3 nhóm quan hệ đối tượng ↔ dữ liệu số:
//   Nhóm 1 (hasRepresentation/hasDrawing/…) — ĐÃ biểu diễn ngầm định trong
//     `assets/generator.ts`: nhiều bản ghi CÙNG `physicalArtifactId` chính
//     là các bản đại diện số của một đối tượng (xem Khuê Văn Các: splat +
//     mesh3d + pointcloud + drawing, và giếng Thiên Quang: splat + pointcloud
//     + drawing, khai báo ở objects/structures.ts và objects/precincts.ts).
//   Nhóm 2 (depictedIn/mentionedIn/subjectOf) — gán tường minh ở file này,
//     làm giàu cho Khuê Văn Các và giếng Thiên Quang theo yêu cầu demo câu
//     hỏi "cho tôi tất cả tư liệu liên quan đến Khuê Văn Các".
//   Nhóm 3 (partOf) — đã có sẵn qua trường `loc` (Khu thứ hai/ba/tư…) trên
//     mọi bản ghi; không cần thêm cấu trúc riêng cho mock hiện tại.

interface RelationRule {
  /** Tên bản ghi CÓ quan hệ (record đóng vai trò tư liệu độc lập). */
  fromName: string;
  /** Tên đối tượng di sản mà bản ghi trên nói về / khắc họa / là chủ đề. */
  toObjectName: string;
  kind: 'depictedIn' | 'mentionedIn' | 'subjectOf';
}

const RULES: RelationRule[] = [
  // Khuê Văn Các — đủ 3 quan hệ nhóm 2, cộng 4 bản đại diện số (nhóm 1, xem generator).
  { fromName: 'Ảnh Khuê Văn Các, thập niên 1940', toObjectName: 'Khuê Văn Các', kind: 'depictedIn' },
  { fromName: 'Văn Miếu bi ký — tập khảo cứu', toObjectName: 'Khuê Văn Các', kind: 'mentionedIn' },
  { fromName: 'Thuyết minh Khuê Văn Các (song ngữ, 12 phút)', toObjectName: 'Khuê Văn Các', kind: 'subjectOf' },
  // Giếng Thiên Quang — 1 quan hệ nhóm 2, cộng 3 bản đại diện số (nhóm 1, xem generator).
  { fromName: 'Ảnh hàng bia Tiến sĩ, thập niên 1900', toObjectName: 'Giếng Thiên Quang & sân bia', kind: 'depictedIn' },
];

/**
 * Gán `relatedObject` cho các bản ghi khớp `RULES`, tra `physicalArtifactId`
 * của đối tượng đích trong chính mảng `assets` đã sinh (không mã hoá tay).
 */
export function applyRelations(assets: Asset[]): Asset[] {
  const objIdByName = new Map<string, string>();
  for (const a of assets) {
    if (!objIdByName.has(a.name) && a.physicalArtifactId) objIdByName.set(a.name, a.physicalArtifactId);
  }

  const byFromName = new Map(RULES.map((r) => [r.fromName, r]));

  return assets.map((a) => {
    const rule = byFromName.get(a.name);
    if (!rule) return a;
    const targetId = objIdByName.get(rule.toObjectName);
    if (!targetId) return a;
    return { ...a, relatedObject: { physicalArtifactId: targetId, kind: rule.kind } };
  });
}

/** Tất cả bản ghi liên quan tới MỘT đối tượng vật lý — gộp cả nhóm 1 (cùng physicalArtifactId) và nhóm 2 (relatedObject trỏ tới). Đây là câu trả lời cho "cho tôi tất cả tư liệu liên quan đến X". */
export function assetsRelatedToObject(assets: Asset[], physicalObjectId: string): Asset[] {
  return assets.filter((a) => a.physicalArtifactId === physicalObjectId || a.relatedObject?.physicalArtifactId === physicalObjectId);
}
