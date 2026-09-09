import { USERS } from '../../data/users';
import type { PermissionMatrix } from '../../data/permissions';
import { Store } from '../store';
import type { User } from '../types';

/** Hồ sơ phân quyền đi kèm mỗi tài khoản được tạo qua giao diện. */
export interface UserGrant {
  email: string;
  department: string;
  matrix: PermissionMatrix;
  dataScopes: string[];
  expiresAt: string;
  mfaRequired: boolean;
  /** Căn cứ cấp quyền — đi vào nhật ký phân quyền, không phải ghi chú tự do. */
  reason: string;
  /** Tài khoản mới luôn chờ một người thứ hai kích hoạt (ADR-0011). */
  status: 'Chờ phê duyệt';
  createdAt: string;
}

interface UserState {
  users: User[];
  grants: UserGrant[];
}

export const userStore = new Store<UserState>({ users: USERS, grants: [] });

export interface UserService {
  readonly store: Store<UserState>;
  list(): User[];
  listGrants(): UserGrant[];
  grantFor(email: string): UserGrant | undefined;
  create(user: User, grant: Omit<UserGrant, 'status' | 'createdAt'>): void;
}

export const userService: UserService = {
  store: userStore,
  list() {
    return userStore.getState().users;
  },
  listGrants() {
    return userStore.getState().grants;
  },
  grantFor(email) {
    return userStore.getState().grants.find((g) => g.email === email);
  },
  create(user, grant) {
    const createdAt = new Date().toLocaleDateString('vi-VN');
    userStore.setState((prev) => ({
      users: [...prev.users, user],
      grants: [...prev.grants, { ...grant, status: 'Chờ phê duyệt', createdAt }],
    }));
  },
};
