// Phiên đăng nhập demo. LoginPage ghi vai trò đã chọn vào localStorage; ở đây đọc ra
// để toàn app biết "ai đang đăng nhập" — phục vụ 3 việc: ẩn/hiện mục menu theo vai trò,
// áp nguyên tắc bốn mắt (người phụ trách không tự duyệt bản ghi của mình), và hiển thị
// đúng danh tính ở thanh bên thay vì tên cố định.
//
// Đây là lớp giả lập cho bản trình diễn — bản triển khai thay bằng SSO/OIDC của cơ quan,
// giữ nguyên hình dạng interface bên dưới nên không phải sửa component.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { capsForRole, type Capabilities } from '../data/permissions';
import { USERS } from '../data/users';

const ROLE_KEY = 'vmAdmin.demoRole';
const AUTH_KEY = 'vmAdmin.authed';

export type Role = (typeof USERS)[number]['role'];

// Nhóm quyền chức năng (`Capabilities`) không còn khai báo lại ở đây: nó được SUY RA
// từ ma trận phân quyền trong `data/permissions.ts` qua `capsForRole()`. Trước đó file
// này giữ một bảng CAPS gõ tay song song với ma trận ở màn Chi tiết người dùng — hai
// bảng mô tả cùng một chính sách và đã thực sự lệch nhau (ma trận cấp Duyệt/Xuất bản
// cho vai trò Quản trị, bảng CAPS thì không).
export type { Capabilities };

interface AuthValue {
  authed: boolean;
  role: Role;
  /** Bản ghi người dùng tương ứng vai trò đang chọn (dùng cho nguyên tắc bốn mắt). */
  user: (typeof USERS)[number];
  can: Capabilities;
  /**
   * Đăng nhập bằng vai trò đã chọn. PHẢI gọi hàm này thay vì chỉ ghi localStorage:
   * trạng thái phiên nằm trong React state, nếu chỉ ghi localStorage rồi điều hướng
   * thì `RequireAuth` vẫn thấy chưa đăng nhập và đá ngược về trang đăng nhập.
   */
  signIn: (role: Role) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function readRole(): Role {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(ROLE_KEY) : null;
  const match = USERS.find((u) => u.role === stored);
  return (match?.role ?? USERS[0].role) as Role;
}

function readAuthed(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(AUTH_KEY) === '1';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(readRole);
  const [authed, setAuthed] = useState<boolean>(readAuthed);

  const signIn = useCallback((next: Role) => {
    try {
      localStorage.setItem(ROLE_KEY, next);
      localStorage.setItem(AUTH_KEY, '1');
    } catch {
      // Chế độ duyệt riêng tư có thể chặn localStorage — phiên vẫn chạy trong bộ nhớ.
    }
    setRole(next);
    setAuthed(true);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ROLE_KEY);
    setAuthed(false);
    setRole(USERS[0].role as Role);
  }, []);

  const value = useMemo<AuthValue>(() => {
    const user = USERS.find((u) => u.role === role) ?? USERS[0];
    return { authed, role, user, can: capsForRole(role), signIn, signOut };
  }, [authed, role, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}

/** Chặn truy cập khi chưa đăng nhập; ghi nhớ trang định vào để quay lại sau khi đăng nhập. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const location = useLocation();
  if (!authed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
