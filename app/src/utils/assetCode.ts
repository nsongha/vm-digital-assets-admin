import { DIGITAL_FORM_CODE, OBJECT_CLASS_CODE_PREFIX } from '../data/taxonomy';
import type { DigitalForm, ObjectClass } from '../services/types';

// Mã định danh 5 tầng (0quater). Đây là các hàm CẤU TẠO mã — mọi mã trong
// `data/assets.ts` được ghép qua các hàm này, không gõ tay chuỗi mã.
// Tầng 1 (đối tượng di sản) và tầng 2 (bản ghi dữ liệu số) được dùng đầy đủ;
// tầng 3 (phiên bản), tầng 4 (tệp dẫn xuất #role) và tầng 5 (đợt số hóa) là
// phần mở rộng roadmap — chưa có store riêng trong mock hiện tại.

/** Tầng 1 — `VM-<OC>-NNNNN`, ví dụ `VM-CT-00007` (Khuê Văn Các). */
export function physicalObjectId(objectClass: ObjectClass, seq: number): string {
  return `${OBJECT_CLASS_CODE_PREFIX[objectClass]}-${String(seq).padStart(5, '0')}`;
}

/** Tầng 2 — `<physicalObjectId>.<DF><nn>`, ví dụ `VM-CT-00007.SPL01`. */
export function digitalRecordCode(objId: string, digitalForm: DigitalForm, seq = 1): string {
  return `${objId}.${DIGITAL_FORM_CODE[digitalForm]}${String(seq).padStart(2, '0')}`;
}

/** Tầng 4 (hiển thị) — `<code>#<role>`, ví dụ `VM-CT-00007.SPL01.v1#master`. */
export function derivedFileLabel(code: string, role: 'master' | 'web' | 'raw' | 'thumb', version = 1): string {
  return `${code}.v${version}#${role}`;
}

/** Chuẩn hoá mã để so khớp tìm kiếm — bỏ hoa/thường và dấu `-` `.`, chấp nhận mã đầy đủ lẫn rút gọn. */
export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[-.]/g, '');
}
