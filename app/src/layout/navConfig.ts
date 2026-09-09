// Ported from the `NAV` array in v3.html; tái cấu trúc thành 4 nhóm theo yêu cầu
// chủ đầu tư (12/08/2026): DỮ LIỆU (kho số hóa) · KHAI THÁC (dùng dữ liệu đã số
// hóa: biên tập tour, trình diễn không gian số) · QUẢN TRỊ (con người, quy trình)
// · HỆ THỐNG (hạ tầng, tra cứu). "Khai thác" tách khỏi "Dữ liệu" có chủ ý: nhập
// liệu/kiểm kê là nghiệp vụ kho, còn dựng tour là nghiệp vụ phát huy giá trị —
// hai nhóm người dùng khác nhau, trộn chung menu là người này lạc trong việc của
// người kia.
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  /** Route prefixes that should also highlight this nav item (detail/sub pages). */
  activeOn: string[];
  badge?: string;
  /**
   * Vai trò được nhìn thấy mục này. Bỏ trống = mọi vai trò.
   * Mục ngoài quyền bị ẨN HẲN chứ không chỉ vô hiệu hoá — theo khuyến nghị rà soát an toàn
   * thông tin: không để lộ sự tồn tại của chức năng quản trị với người không có quyền.
   */
  roles?: string[];
}

export interface NavGroup {
  /**
   * Khoá bền vững của nhóm. KHÔNG dùng `label` làm khoá: người dùng đổi tên nhóm
   * được (xem navCustomization.ts), nhãn đổi thì mọi tuỳ chỉnh gắn theo nhãn sẽ
   * mồ côi.
   */
  id: string;
  label: string;
  items: NavItem[];
}

/** Lọc menu theo vai trò đang đăng nhập. */
export function filterNavByRole(items: NavItem[], role: string): NavItem[] {
  return items.filter((item) => !item.roles || item.roles.includes(role));
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'data',
    label: 'DỮ LIỆU',
    items: [
      { id: 'dash', label: 'Tổng quan', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', path: '/', activeOn: ['/'] },
      {
        // A2 — badge KHÔNG còn ghi cứng ('1.284' trước đây); Sidebar tự tính
        // `services.assets.list().length` để badge và trang Dữ liệu số hóa
        // luôn cùng một nguồn số liệu.
        id: 'lib',
        label: 'Dữ liệu số hóa',
        icon: 'M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z',
        path: '/assets',
        activeOn: ['/assets'],
      },
      {
        id: 'upload',
        label: 'Nhập dữ liệu',
        icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
        path: '/upload',
        activeOn: ['/upload'],
      },
      {
        id: 'obj',
        label: 'Đối tượng di sản',
        icon: 'M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
        path: '/objects',
        activeOn: ['/objects'],
      },
      {
        id: 'coll',
        label: 'Bộ sưu tập',
        icon: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
        path: '/collections',
        activeOn: ['/collections'],
      },
      {
        id: 'inventory',
        label: 'Kiểm kê',
        icon: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
        path: '/inventory',
        activeOn: ['/inventory'],
      },
    ],
  },
  {
    id: 'exploit',
    label: 'KHAI THÁC',
    items: [
      {
        // Nhúng editor của ứng dụng GaussianSplat Immersive Tour (app độc lập,
        // xem config/externalTools.ts). Chỉ vai trò có quyền Tạo/Sửa nội dung
        // mới thấy — khớp capsForRole (write) trong data/permissions.ts.
        id: 'editor',
        label: 'Biên tập',
        icon: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z',
        path: '/editor',
        activeOn: ['/editor'],
        roles: ['Quản trị', 'Kỹ thuật số hóa', 'Biên tập'],
      },
      {
        id: 'spatial',
        label: 'Không gian số',
        icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z',
        path: '/spatial',
        activeOn: ['/spatial'],
      },
    ],
  },
  {
    id: 'admin',
    label: 'QUẢN TRỊ',
    items: [
      {
        id: 'reports',
        label: 'Báo cáo – Thống kê',
        icon: 'M3 3v18h18M7 15l4-4 3 3 5-6',
        path: '/reports',
        activeOn: ['/reports'],
      },
      {
        id: 'users',
        label: 'Người dùng',
        icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87',
        path: '/users',
        activeOn: ['/users'],
        roles: ['Quản trị'],
      },
      {
        id: 'log',
        label: 'Nhật ký',
        icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
        path: '/logs',
        activeOn: ['/logs'],
      },
      {
        id: 'share',
        label: 'Kết nối & chia sẻ',
        icon: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
        path: '/share',
        activeOn: ['/share'],
      },
    ],
  },
  {
    id: 'system',
    label: 'HỆ THỐNG',
    items: [
      {
        id: 'backup',
        label: 'Sao lưu & khôi phục',
        icon: 'M21 12a9 9 0 1 1-3-6.7M21 3v6h-6',
        path: '/backup',
        activeOn: ['/backup'],
        roles: ['Quản trị'],
      },
      {
        id: 'apikeys',
        label: 'Khóa API',
        icon: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3',
        path: '/api-keys',
        activeOn: ['/api-keys'],
        roles: ['Quản trị'],
      },
      {
        // Thay trang "Tuân thủ & quản trị dữ liệu" cũ (dạng tuyên bố "Đạt ✓" —
        // khó kiểm chứng, không ai chịu trách nhiệm nếu phần mềm tự claim).
        // Nay là tài liệu hướng dẫn tra cứu, mở cho MỌI vai trò.
        id: 'help',
        label: 'Trợ giúp & tra cứu',
        icon: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01',
        path: '/help',
        activeOn: ['/help'],
      },
    ],
  },
];

/** Page title per route prefix — ported from the `pageTitle` map in v3.html. */
export function pageTitleFor(pathname: string, collDetailName?: string): string {
  if (pathname === '/') return 'Tổng quan';
  if (pathname.startsWith('/assets/')) return 'Chi tiết dữ liệu số hóa';
  if (pathname.startsWith('/assets')) return 'Dữ liệu số hóa';
  if (pathname.startsWith('/upload')) return 'Nhập dữ liệu';
  if (pathname.startsWith('/collections/')) return collDetailName || 'Bộ sưu tập';
  if (pathname.startsWith('/collections')) return 'Bộ sưu tập';
  if (pathname.startsWith('/objects')) return 'Hồ sơ đối tượng di sản';
  if (pathname.startsWith('/inventory')) return 'Kiểm kê định kỳ';
  if (pathname.startsWith('/editor')) return 'Biên tập không gian số';
  if (pathname.startsWith('/spatial')) return 'Không gian số';
  if (pathname.startsWith('/reports')) return 'Báo cáo – Thống kê';
  if (pathname.startsWith('/users/')) return 'Chi tiết người dùng & phân quyền';
  if (pathname.startsWith('/users')) return 'Người dùng & phân quyền';
  if (pathname.startsWith('/api-keys')) return 'Quản lý khóa API';
  if (pathname.startsWith('/logs')) return 'Nhật ký hoạt động';
  if (pathname.startsWith('/share')) return 'Kết nối & chia sẻ dữ liệu';
  if (pathname.startsWith('/help')) return 'Trợ giúp & tra cứu';
  if (pathname.startsWith('/backup')) return 'Sao lưu & khôi phục';
  return '';
}
