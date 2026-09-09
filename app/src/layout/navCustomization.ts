import { useCallback, useState } from 'react';
import type { NavGroup, NavItem } from './navConfig';

// Tuỳ chỉnh menu của RIÊNG từng người dùng trên MÁY của họ: đổi tên mục và ẩn
// mục không dùng tới. Đây là sở thích hiển thị, KHÔNG phải phân quyền —
// `filterNavByRole` mới là lớp quyết định ai được thấy chức năng gì, và nó chạy
// TRƯỚC lớp này. Ẩn một mục ở đây không hề chặn truy cập: gõ thẳng đường dẫn
// vẫn vào được. Đừng bao giờ dùng cơ chế này để "giấu" chức năng vì lý do an
// toàn thông tin.
//
// Lưu ở localStorage (bản MVP nội bộ). Khi có backend thật, chuyển sang lưu
// theo hồ sơ người dùng để tuỳ chỉnh đi theo tài khoản qua nhiều máy — lúc đó
// chỉ cần thay hai hàm read/write bên dưới, phần còn lại giữ nguyên.

const STORAGE_KEY = 'vmAdmin.navCustom';

/** Chặn nhãn quá dài phá vỡ bề rộng sidebar 232px. */
const MAX_LABEL_LEN = 32;

export interface NavCustomization {
  /** id mục → nhãn người dùng tự đặt. Không có khoá = dùng nhãn mặc định. */
  renamed: Record<string, string>;
  /** id các mục bị ẩn khỏi menu chính. */
  hidden: string[];
  /**
   * Tuỳ chỉnh cho NHÓM (DỮ LIỆU, KHAI THÁC…). Để riêng khỏi `renamed`/`hidden`
   * của mục thay vì trộn chung một không gian khoá: id nhóm và id mục là hai hệ
   * độc lập, trộn chung thì một ngày nào đó thêm mục trùng tên nhóm là hỏng.
   */
  renamedGroups: Record<string, string>;
  /** id các nhóm bị ẩn — ẩn nhóm là ẩn cả nhãn lẫn toàn bộ mục bên trong. */
  hiddenGroups: string[];
  /**
   * id các nhóm đang thu gọn — vẫn thấy nhãn nhóm, chỉ giấu các mục bên trong.
   * Khác hẳn `hiddenGroups`: thu gọn là gấp lại cho đỡ dài, ẩn là bỏ khỏi menu.
   */
  collapsedGroups: string[];
}

const EMPTY: NavCustomization = { renamed: {}, hidden: [], renamedGroups: {}, hiddenGroups: [], collapsedGroups: [] };

/** Lọc bản đồ đổi tên: bỏ mọi giá trị sai kiểu/rỗng do phiên bản cũ hoặc sửa tay. */
function sanitizeRenames(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (raw && typeof raw === 'object') {
    for (const [id, label] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof label === 'string' && label.trim()) out[id] = label.trim().slice(0, MAX_LABEL_LEN);
    }
  }
  return out;
}

function sanitizeIds(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];
}

function read(): NavCustomization {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY;
    const obj = parsed as Partial<NavCustomization>;
    // Lọc lại từng phần tử thay vì tin cả object: dữ liệu localStorage có thể do
    // phiên bản cũ ghi (bản đầu chưa có hai trường nhóm), hoặc bị sửa tay, và
    // một giá trị sai kiểu ở đây sẽ làm hỏng cả sidebar.
    return {
      renamed: sanitizeRenames(obj.renamed),
      hidden: sanitizeIds(obj.hidden),
      renamedGroups: sanitizeRenames(obj.renamedGroups),
      hiddenGroups: sanitizeIds(obj.hiddenGroups),
      collapsedGroups: sanitizeIds(obj.collapsedGroups),
    };
  } catch {
    // localStorage bị chặn (chế độ riêng tư), hoặc JSON hỏng — chạy tiếp với
    // menu mặc định thay vì để trắng sidebar.
    return EMPTY;
  }
}

function write(value: NavCustomization): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Không ghi được thì thôi: tuỳ chỉnh vẫn có hiệu lực trong phiên hiện tại
    // (state React), chỉ là không sống qua lần tải trang sau.
  }
}

export interface NavCustomizationApi {
  custom: NavCustomization;
  /** Số tuỳ chỉnh đang áp dụng — dùng để quyết định có hiện khối "Tuỳ chỉnh menu" không. */
  count: number;
  /** Nhãn hiển thị của một mục: tên tự đặt nếu có, không thì nhãn gốc. */
  labelFor: (item: NavItem) => string;
  isHidden: (id: string) => boolean;
  /** Đặt lại tên. Chuỗi rỗng/toàn khoảng trắng = xoá tên tự đặt, quay về nhãn gốc. */
  rename: (id: string, label: string) => void;
  hide: (id: string) => void;
  unhide: (id: string) => void;

  /** Nhãn hiển thị của một nhóm. */
  groupLabelFor: (group: NavGroup) => string;
  isGroupHidden: (id: string) => boolean;
  renameGroup: (id: string, label: string) => void;
  hideGroup: (id: string) => void;
  unhideGroup: (id: string) => void;

  isGroupCollapsed: (id: string) => boolean;
  toggleGroupCollapsed: (id: string) => void;

  /** Xoá mọi tuỳ chỉnh — tên tự đặt và mục/nhóm đã ẩn. */
  reset: () => void;
}

export function useNavCustomization(): NavCustomizationApi {
  const [custom, setCustom] = useState<NavCustomization>(read);

  const apply = useCallback((next: NavCustomization) => {
    setCustom(next);
    write(next);
  }, []);

  const rename = useCallback(
    (id: string, label: string) => {
      const clean = label.trim().slice(0, MAX_LABEL_LEN);
      const renamed = { ...custom.renamed };
      if (clean) renamed[id] = clean;
      else delete renamed[id];
      apply({ ...custom, renamed });
    },
    [custom, apply],
  );

  const hide = useCallback(
    (id: string) => {
      if (custom.hidden.includes(id)) return;
      apply({ ...custom, hidden: [...custom.hidden, id] });
    },
    [custom, apply],
  );

  const unhide = useCallback(
    (id: string) => {
      apply({ ...custom, hidden: custom.hidden.filter((h) => h !== id) });
    },
    [custom, apply],
  );

  const renameGroup = useCallback(
    (id: string, label: string) => {
      const clean = label.trim().slice(0, MAX_LABEL_LEN);
      const renamedGroups = { ...custom.renamedGroups };
      if (clean) renamedGroups[id] = clean;
      else delete renamedGroups[id];
      apply({ ...custom, renamedGroups });
    },
    [custom, apply],
  );

  const hideGroup = useCallback(
    (id: string) => {
      if (custom.hiddenGroups.includes(id)) return;
      apply({ ...custom, hiddenGroups: [...custom.hiddenGroups, id] });
    },
    [custom, apply],
  );

  const unhideGroup = useCallback(
    (id: string) => {
      apply({ ...custom, hiddenGroups: custom.hiddenGroups.filter((h) => h !== id) });
    },
    [custom, apply],
  );

  const toggleGroupCollapsed = useCallback(
    (id: string) => {
      const collapsedGroups = custom.collapsedGroups.includes(id)
        ? custom.collapsedGroups.filter((g) => g !== id)
        : [...custom.collapsedGroups, id];
      apply({ ...custom, collapsedGroups });
    },
    [custom, apply],
  );

  const reset = useCallback(() => apply(EMPTY), [apply]);

  const labelFor = useCallback((item: NavItem) => custom.renamed[item.id] ?? item.label, [custom.renamed]);
  const isHidden = useCallback((id: string) => custom.hidden.includes(id), [custom.hidden]);
  const groupLabelFor = useCallback((group: NavGroup) => custom.renamedGroups[group.id] ?? group.label, [custom.renamedGroups]);
  const isGroupHidden = useCallback((id: string) => custom.hiddenGroups.includes(id), [custom.hiddenGroups]);
  const isGroupCollapsed = useCallback((id: string) => custom.collapsedGroups.includes(id), [custom.collapsedGroups]);

  return {
    custom,
    // Nhóm THU GỌN cố ý KHÔNG tính vào đây: `count` tồn tại để nhắc người dùng
    // rằng có thứ đang bị giấu mà họ có thể đã quên. Nhóm thu gọn vẫn hiện nhãn
    // ngay trên màn hình, không ai quên được — đưa vào đếm chỉ làm badge nhiễu.
    count:
      custom.hidden.length +
      Object.keys(custom.renamed).length +
      custom.hiddenGroups.length +
      Object.keys(custom.renamedGroups).length,
    labelFor,
    isHidden,
    rename,
    hide,
    unhide,
    groupLabelFor,
    isGroupHidden,
    renameGroup,
    hideGroup,
    unhideGroup,
    isGroupCollapsed,
    toggleGroupCollapsed,
    reset,
  };
}
