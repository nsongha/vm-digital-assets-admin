// Mô hình phân quyền dùng chung — RBAC (vai trò × module × quyền) + ABAC (phạm vi
// phân khu/bộ sưu tập) + quy tắc phân tách nhiệm vụ (SoD, separation of duties).
//
// ĐÂY LÀ NGUỒN DUY NHẤT. Màn Chi tiết người dùng, hộp thoại Thêm người dùng và
// `context/AuthContext` đều đọc từ file này. Trước đó ma trận nằm cục bộ trong
// `UserDetailPage` còn `AuthContext` giữ một bảng CAPS gõ tay song song — hai bảng
// mô tả cùng một chính sách nhưng có thể lệch nhau mà không có gì báo lỗi. Ma trận
// cũ cấp cho vai trò Quản trị **toàn bộ** quyền kể cả Duyệt/Xuất bản, trong khi
// AuthContext lại ghi `approve: false, publish: false` cho chính vai trò đó.
//
// Quy ước: file này thuần TypeScript (không import React) để `npm test` kiểm chứng
// được chính sách bằng `node --experimental-strip-types`.

export const MODULES = [
  'Dữ liệu số hóa',
  'Nhập dữ liệu',
  'Bộ sưu tập',
  'Kiểm kê',
  'Người dùng',
  'Nhật ký',
  'Kết nối & chia sẻ',
  'Tuân thủ',
] as const;

export const PERMISSIONS = ['Xem', 'Tạo/Sửa', 'Duyệt', 'Xuất bản', 'Xóa', 'Quản trị'] as const;

export const ROLE_OPTIONS = ['Quản trị', 'Kỹ thuật số hóa', 'Biên tập', 'Phê duyệt', 'Chỉ xem'] as const;

export type ModuleName = (typeof MODULES)[number];
export type PermissionName = (typeof PERMISSIONS)[number];
export type RoleName = (typeof ROLE_OPTIONS)[number];
export type PermissionRow = Record<PermissionName, boolean>;
export type PermissionMatrix = Record<ModuleName, PermissionRow>;

/**
 * Nhóm cột. Thứ tự nhóm trùng thứ tự `PERMISSIONS` nên bảng có thể vẽ vạch ngăn
 * giữa các nhóm — và chính vạch ngăn đó làm lộ ra nguyên tắc bốn mắt: vai trò nội
 * dung lấp đầy hai nhóm bên trái, vai trò Phê duyệt lấp nhóm giữa, vai trò Quản trị
 * lấp nhóm bên phải. Ba vùng gần như không chồng lên nhau — đọc bảng là thấy chính
 * sách, không cần đọc chú thích.
 */
export interface PermissionGroup {
  label: string;
  perms: PermissionName[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  { label: 'Đọc', perms: ['Xem'] },
  { label: 'Biên tập', perms: ['Tạo/Sửa'] },
  { label: 'Phê duyệt & công bố', perms: ['Duyệt', 'Xuất bản'] },
  { label: 'Quản trị', perms: ['Xóa', 'Quản trị'] },
];

/** Nhóm hàng — tách phân hệ nghiệp vụ khỏi phân hệ quản trị/tuân thủ. */
export interface ModuleGroup {
  label: string;
  modules: ModuleName[];
}

export const MODULE_GROUPS: ModuleGroup[] = [
  { label: 'Nghiệp vụ', modules: ['Dữ liệu số hóa', 'Nhập dữ liệu', 'Bộ sưu tập', 'Kiểm kê'] },
  { label: 'Quản trị & tuân thủ', modules: ['Người dùng', 'Nhật ký', 'Kết nối & chia sẻ', 'Tuân thủ'] },
];

/** Màn hình tương ứng mỗi module — để ma trận gắn với chức năng thật, không phải nhãn trừu tượng. */
export const MODULE_ROUTES: Record<ModuleName, string> = {
  'Dữ liệu số hóa': '/assets',
  'Nhập dữ liệu': '/upload',
  'Bộ sưu tập': '/collections',
  'Kiểm kê': '/inventory',
  'Người dùng': '/users',
  'Nhật ký': '/logs',
  'Kết nối & chia sẻ': '/share',
  // Trang trình bày đổi từ /compliance (bảng tuyên bố) sang /help (tài liệu hướng
  // dẫn tra cứu); module quyền "Tuân thủ" giữ nguyên — nghiệp vụ quản lý hồ sơ
  // tuân thủ (biểu mẫu, phân công trách nhiệm) vẫn tồn tại, chỉ cách trình bày đổi.
  'Tuân thủ': '/help',
};

export const ROLE_SUMMARY: Record<RoleName, string> = {
  'Quản trị': 'Quản trị tài khoản, khóa API, cấu hình kết nối. KHÔNG tự phê duyệt hay xuất bản nội dung.',
  'Kỹ thuật số hóa': 'Tải lên, xử lý mô hình 3D và gaussian splat, nhập thông số kỹ thuật của tệp.',
  'Biên tập': 'Biên mục metadata, tư liệu Hán Nôm, sắp xếp bộ sưu tập.',
  'Phê duyệt': 'Thẩm định nội dung và quyết định xuất bản. Không tạo/sửa nội dung mình duyệt.',
  'Chỉ xem': 'Tra cứu nội bộ, không thay đổi dữ liệu.',
};

/** Module mang nội dung di sản — nơi áp dụng phân tách "người làm ≠ người duyệt". */
const CONTENT_MODULES: ModuleName[] = ['Dữ liệu số hóa', 'Nhập dữ liệu', 'Bộ sưu tập'];

export function emptyRow(): PermissionRow {
  return { Xem: false, 'Tạo/Sửa': false, Duyệt: false, 'Xuất bản': false, Xóa: false, 'Quản trị': false };
}

export function row(perms: PermissionName[]): PermissionRow {
  const r = emptyRow();
  perms.forEach((p) => {
    r[p] = true;
  });
  return r;
}

// --- Ô khóa cứng theo chính sách ---------------------------------------
// Khác với "xung đột" bên dưới: những ô này KHÔNG vai trò nào tick được, kể cả
// Quản trị. Checkbox bị vô hiệu hóa và nêu lý do — chính sách nằm trong mã, không
// phụ thuộc vào việc người cấu hình có nhớ quy định hay không.

export function lockReason(mod: ModuleName, perm: PermissionName): string | null {
  if (mod === 'Nhật ký' && (perm === 'Tạo/Sửa' || perm === 'Xóa')) {
    return 'Nhật ký hoạt động chỉ ghi thêm (append-only): không vai trò nào được sửa hoặc xóa bản ghi nhật ký — nếu quản trị viên xóa được vết thì nhật ký mất giá trị chứng cứ (ADR-0012).';
  }
  if (mod === 'Tuân thủ' && perm === 'Xóa') {
    return 'Hồ sơ tuân thủ là chứng cứ pháp lý phục vụ thanh tra: chỉ bổ sung phiên bản mới, không xóa bản cũ.';
  }
  if (mod === 'Kiểm kê' && perm === 'Xóa') {
    return 'Biên bản kiểm kê đã chốt đợt chỉ được điều chỉnh có lý do, giữ nguyên bản ghi gốc (ADR-0010).';
  }
  return null;
}

// --- Ma trận mặc định theo vai trò -------------------------------------

export function buildMatrix(role: string): PermissionMatrix {
  if (role === 'Quản trị') {
    // Quản trị hệ thống KHÔNG có Duyệt/Xuất bản trên nội dung: quản trị viên vừa
    // cấp được quyền cho chính mình vừa duyệt được nội dung là đường tự nâng
    // quyền kinh điển. Khớp `capabilities` ở AuthContext (approve/publish = false).
    return {
      'Dữ liệu số hóa': row(['Xem', 'Tạo/Sửa', 'Xóa', 'Quản trị']),
      'Nhập dữ liệu': row(['Xem', 'Tạo/Sửa', 'Xóa', 'Quản trị']),
      'Bộ sưu tập': row(['Xem', 'Tạo/Sửa', 'Xóa', 'Quản trị']),
      'Kiểm kê': row(['Xem', 'Tạo/Sửa', 'Quản trị']),
      'Người dùng': row(['Xem', 'Tạo/Sửa', 'Xóa', 'Quản trị']),
      'Nhật ký': row(['Xem', 'Quản trị']),
      'Kết nối & chia sẻ': row(['Xem', 'Tạo/Sửa', 'Xóa', 'Quản trị']),
      'Tuân thủ': row(['Xem', 'Tạo/Sửa', 'Quản trị']),
    };
  }
  if (role === 'Kỹ thuật số hóa') {
    return {
      'Dữ liệu số hóa': row(['Xem', 'Tạo/Sửa']),
      'Nhập dữ liệu': row(['Xem', 'Tạo/Sửa']),
      'Bộ sưu tập': row(['Xem']),
      'Kiểm kê': row(['Xem']),
      'Người dùng': emptyRow(),
      'Nhật ký': emptyRow(),
      'Kết nối & chia sẻ': emptyRow(),
      'Tuân thủ': emptyRow(),
    };
  }
  if (role === 'Biên tập') {
    return {
      'Dữ liệu số hóa': row(['Xem', 'Tạo/Sửa']),
      'Nhập dữ liệu': row(['Xem', 'Tạo/Sửa']),
      'Bộ sưu tập': row(['Xem', 'Tạo/Sửa']),
      'Kiểm kê': row(['Xem']),
      'Người dùng': emptyRow(),
      'Nhật ký': emptyRow(),
      'Kết nối & chia sẻ': emptyRow(),
      'Tuân thủ': emptyRow(),
    };
  }
  if (role === 'Phê duyệt') {
    return {
      'Dữ liệu số hóa': row(['Xem', 'Duyệt', 'Xuất bản']),
      'Nhập dữ liệu': row(['Xem']),
      'Bộ sưu tập': row(['Xem']),
      'Kiểm kê': row(['Xem']),
      'Người dùng': emptyRow(),
      'Nhật ký': row(['Xem']),
      'Kết nối & chia sẻ': emptyRow(),
      'Tuân thủ': row(['Xem']),
    };
  }
  return {
    'Dữ liệu số hóa': row(['Xem']),
    'Nhập dữ liệu': emptyRow(),
    'Bộ sưu tập': row(['Xem']),
    'Kiểm kê': row(['Xem']),
    'Người dùng': emptyRow(),
    'Nhật ký': row(['Xem']),
    'Kết nối & chia sẻ': emptyRow(),
    'Tuân thủ': emptyRow(),
  };
}

// --- Bật/tắt một ô, có ràng buộc hệ quả --------------------------------

/**
 * Bật/tắt một ô và kéo theo hệ quả logic:
 * - bật bất kỳ quyền nào ⇒ tự bật `Xem` (không thể sửa thứ mình không được xem);
 * - tắt `Xem` ⇒ tắt toàn bộ quyền của module đó.
 * Ô bị khóa cứng trả về ma trận nguyên trạng.
 */
export function toggleCell(matrix: PermissionMatrix, mod: ModuleName, perm: PermissionName): PermissionMatrix {
  if (lockReason(mod, perm)) return matrix;
  const next = !matrix[mod][perm];
  if (!next && perm === 'Xem') return { ...matrix, [mod]: emptyRow() };
  const updated: PermissionRow = { ...matrix[mod], [perm]: next };
  if (next) updated.Xem = true;
  return { ...matrix, [mod]: updated };
}

// --- Xung đột chính sách (SoD) -----------------------------------------
// Khác với ô khóa cứng: từng quyền riêng lẻ đều hợp lệ, nhưng CẶP quyền thì không.
// Không thể chặn bằng cách vô hiệu hóa checkbox nên chặn ở bước lưu, kèm lý do.

export interface PolicyViolation {
  code: 'SOD_TAO_DUYET' | 'XOA_KHONG_QUAN_TRI' | 'TU_NANG_QUYEN';
  message: string;
  cells: Array<{ mod: ModuleName; perm: PermissionName }>;
}

export function policyViolations(matrix: PermissionMatrix): PolicyViolation[] {
  const out: PolicyViolation[] = [];

  for (const mod of CONTENT_MODULES) {
    const r = matrix[mod];
    if (r['Tạo/Sửa'] && (r.Duyệt || r['Xuất bản'])) {
      const conflicting: PermissionName[] = [];
      if (r.Duyệt) conflicting.push('Duyệt');
      if (r['Xuất bản']) conflicting.push('Xuất bản');
      out.push({
        code: 'SOD_TAO_DUYET',
        message: `${mod}: không được vừa "Tạo/Sửa" vừa "${conflicting.join(' / ')}" — người tạo nội dung không tự duyệt hay tự công bố nội dung của mình (nguyên tắc bốn mắt, ADR-0011).`,
        cells: [{ mod, perm: 'Tạo/Sửa' }, ...conflicting.map((p) => ({ mod, perm: p }))],
      });
    }
  }

  for (const mod of MODULES) {
    if (matrix[mod].Xóa && !matrix[mod]['Quản trị']) {
      out.push({
        code: 'XOA_KHONG_QUAN_TRI',
        message: `${mod}: quyền "Xóa" chỉ cấp kèm quyền "Quản trị" của cùng module — xóa là hành vi không hoàn tác được.`,
        cells: [{ mod, perm: 'Xóa' }],
      });
    }
  }

  if (matrix['Người dùng']['Quản trị'] && (matrix['Dữ liệu số hóa'].Duyệt || matrix['Dữ liệu số hóa']['Xuất bản'])) {
    out.push({
      code: 'TU_NANG_QUYEN',
      message:
        'Người quản trị tài khoản không được đồng thời có quyền Duyệt/Xuất bản dữ liệu số hóa — người tự cấp quyền được cho mình mà lại duyệt được nội dung thì mọi kiểm soát còn lại đều vô hiệu.',
      cells: [
        { mod: 'Người dùng', perm: 'Quản trị' },
        { mod: 'Dữ liệu số hóa', perm: 'Duyệt' },
      ],
    });
  }

  return out;
}

/** Các ô đang sai lệch so với mặc định của vai trò — hiển thị dấu "đã tùy chỉnh". */
export function diffFromDefault(role: string, matrix: PermissionMatrix): Array<{ mod: ModuleName; perm: PermissionName; granted: boolean }> {
  const base = buildMatrix(role);
  const out: Array<{ mod: ModuleName; perm: PermissionName; granted: boolean }> = [];
  for (const mod of MODULES) {
    for (const perm of PERMISSIONS) {
      if (matrix[mod][perm] !== base[mod][perm]) out.push({ mod, perm, granted: matrix[mod][perm] });
    }
  }
  return out;
}

export function grantedCount(matrix: PermissionMatrix): number {
  let n = 0;
  for (const mod of MODULES) for (const perm of PERMISSIONS) if (matrix[mod][perm]) n += 1;
  return n;
}

// --- Phạm vi dữ liệu (ABAC) --------------------------------------------

export const PRECINCT_SCOPES = [
  'Hồ Văn',
  'Vườn Giám',
  'Giếng Thiên Quang',
  'Khu Nhập Đạo',
  'Khu Thành Đạt',
  'Khu Đại Thành',
  'Khu Thái Học',
];

// --- Cầu nối sang AuthContext ------------------------------------------

export interface Capabilities {
  read: boolean;
  write: boolean;
  approve: boolean;
  publish: boolean;
  admin: boolean;
}

/**
 * Nhóm quyền thô mà giao diện dùng để ẩn/hiện menu, suy ra TỪ ma trận thay vì
 * khai báo lại — sửa ma trận là menu đổi theo, không có bảng thứ hai để quên.
 */
export function capsFromMatrix(matrix: PermissionMatrix): Capabilities {
  const content = matrix['Dữ liệu số hóa'];
  return {
    read: content.Xem,
    write: content['Tạo/Sửa'],
    approve: content.Duyệt,
    publish: content['Xuất bản'],
    admin: matrix['Người dùng']['Quản trị'],
  };
}

export function capsForRole(role: string): Capabilities {
  return capsFromMatrix(buildMatrix(role));
}
