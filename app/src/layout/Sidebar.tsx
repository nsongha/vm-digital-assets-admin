import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SettingsModal from '../components/SettingsModal';
import { services } from '../services';
import { filterNavByRole, NAV_GROUPS, type NavItem } from './navConfig';
import { useNavCustomization } from './navCustomization';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  open: boolean;
}

function isActive(item: NavItem, pathname: string): boolean {
  return item.activeOn.some((prefix) => (prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)));
}

const ICON_PENCIL = 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z';
const ICON_EYE_OFF =
  'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22';
const ICON_EYE = 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z';

/** Ô sửa tên tại chỗ. Tách thành component riêng để `draft` chết theo mỗi lần mở/đóng. */
function RenameInput({ initial, onCommit, onCancel }: { initial: string; onCommit: (v: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(initial);
  // Escape làm input unmount ngay, nhưng blur vẫn kịp bắn sau đó — cờ này chặn
  // việc blur ghi đè lên thao tác huỷ mà người dùng vừa chọn.
  const doneRef = useRef(false);

  return (
    <input
      className={styles.renameInput}
      value={draft}
      autoFocus
      aria-label="Tên mới cho mục menu"
      maxLength={32}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          doneRef.current = true;
          onCommit(draft);
        } else if (e.key === 'Escape') {
          doneRef.current = true;
          onCancel();
        }
      }}
      onBlur={() => {
        if (!doneRef.current) onCommit(draft);
      }}
    />
  );
}

/** Tiêu đề nhóm (DỮ LIỆU, KHAI THÁC…) — bấm để gập/mở, và cũng đổi tên/ẩn được như mục menu. */
function GroupHeader({
  label,
  sidebarOpen,
  collapsed,
  itemCount,
  renaming,
  onToggle,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onHide,
}: {
  label: string;
  /** Sidebar đang mở rộng hay ở 72px — quyết định hàng này có thể tương tác không. */
  sidebarOpen: boolean;
  collapsed: boolean;
  itemCount: number;
  renaming: boolean;
  onToggle: () => void;
  onStartRename: () => void;
  onCommitRename: (v: string) => void;
  onCancelRename: () => void;
  onHide: () => void;
}) {
  if (renaming) {
    return (
      <div className={`${styles.sectionRow} ${styles.sectionRowEditing}`}>
        <RenameInput initial={label} onCommit={onCommitRename} onCancel={onCancelRename} />
      </div>
    );
  }

  return (
    <div className={styles.sectionRow}>
      <button
        type="button"
        className={styles.sectionToggle}
        aria-expanded={!collapsed}
        // Sidebar ở 72px: hàng này bị CSS co về chiều cao 0. Nó vẫn nằm trong DOM
        // để chuyển động mượt, nên phải rút khỏi thứ tự Tab — nếu không người
        // dùng bàn phím sẽ lạc vào một nút vô hình.
        tabIndex={sidebarOpen ? undefined : -1}
        aria-hidden={sidebarOpen ? undefined : true}
        // Gập rồi thì các mục biến mất khỏi cây a11y — nói luôn số mục đang gập
        // để người dùng đọc màn hình biết bên trong còn gì, không phải mở ra mới biết.
        aria-label={collapsed ? `${label} — đang gọn, ${itemCount} mục. Mở ra` : `${label} — thu gọn`}
        onClick={onToggle}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={collapsed ? styles.sectionChevron : `${styles.sectionChevron} ${styles.sectionChevronOpen}`}
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className={styles.sectionLabel}>{label}</span>
        {collapsed && <span className={styles.sectionCount}>{itemCount}</span>}
      </button>
      <div className={styles.navActions} hidden={!sidebarOpen}>
        <button type="button" className={styles.navActionBtn} title={`Đổi tên nhóm "${label}"`} aria-label={`Đổi tên nhóm ${label}`} onClick={onStartRename}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICON_PENCIL} />
          </svg>
        </button>
        <button type="button" className={styles.navActionBtn} title={`Ẩn cả nhóm "${label}"`} aria-label={`Ẩn nhóm ${label}`} onClick={onHide}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICON_EYE_OFF} />
          </svg>
        </button>
      </div>
    </div>
  );
}

function NavRow({
  item,
  label,
  open,
  active,
  badge,
  renaming,
  onNavigate,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onHide,
}: {
  item: NavItem;
  label: string;
  open: boolean;
  active: boolean;
  badge?: string;
  renaming: boolean;
  onNavigate: () => void;
  onStartRename: () => void;
  onCommitRename: (v: string) => void;
  onCancelRename: () => void;
  onHide: () => void;
}) {
  // Khi đang sửa tên, KHÔNG bọc trong <a>: gõ phím trong input nằm trong thẻ
  // liên kết dễ kích hoạt điều hướng ngoài ý muốn.
  if (renaming) {
    return (
      <div className={`${styles.navRow} ${styles.navRowEditing}`}>
        <div className={styles.navItem}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon} aria-hidden="true">
            <path d={item.icon} />
          </svg>
          <RenameInput initial={label} onCommit={onCommitRename} onCancel={onCancelRename} />
        </div>
      </div>
    );
  }

  return (
    <div className={active ? `${styles.navRow} ${styles.navRowActive}` : styles.navRow}>
      {/* A8: real href so the link is reachable/activatable by keyboard (Tab + Enter)
          like any normal navigation link — preventDefault keeps it client-side (SPA) routed. */}
      <a
        href={item.path}
        onClick={(e) => {
          e.preventDefault();
          onNavigate();
        }}
        // Thu gọn thì badge ẩn (xem dưới) — nêm số vào tooltip để thông tin không mất hẳn.
        title={!open ? (badge ? `${label} (${badge})` : label) : undefined}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={styles.navItem}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon} aria-hidden="true">
          <path d={item.icon} />
        </svg>
        <span className={styles.navLabel}>{label}</span>
        {/* Badge mờ đi khi thu gọn (CSS): ở 72px nó đè lên icon thành một cụm chữ–số dính nhau. */}
        {badge && <span className={styles.navBadge}>{badge}</span>}
      </a>

      {/* Nút sửa tên / ẩn: chỉ khi sidebar mở (ở 72px không còn chỗ), hiện khi rê
          chuột hoặc khi focus bàn phím rơi vào trong hàng — `:focus-within` giữ
          cho người dùng bàn phím vẫn tới được, không chỉ người dùng chuột. */}
      {open && (
        <div className={styles.navActions}>
          <button type="button" className={styles.navActionBtn} title={`Đổi tên "${label}"`} aria-label={`Đổi tên mục ${label}`} onClick={onStartRename}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ICON_PENCIL} />
            </svg>
          </button>
          <button type="button" className={styles.navActionBtn} title={`Ẩn "${label}" khỏi menu`} aria-label={`Ẩn mục ${label}`} onClick={onHide}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ICON_EYE_OFF} />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/** Collapsible sidebar (232px ↔ 72px) — ported from the `<aside>` block in v3.html. */
export default function Sidebar({ open }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Danh tính và vai trò của phiên đang đăng nhập. Mục menu ngoài quyền bị ẨN HẲN
  // (không chỉ vô hiệu hoá) — không để lộ sự tồn tại của chức năng quản trị với
  // người không có quyền, theo khuyến nghị rà soát an toàn thông tin.
  const { user, role, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Tuỳ chỉnh menu của người dùng (đổi tên / ẩn mục) — xem navCustomization.ts.
  const {
    count,
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
  } = useNavCustomization();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  const initials = user.name
    .split(' ')
    .slice(-2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();

  // A2 — badge của mục "Dữ liệu số hóa" derive trực tiếp từ `services.assets`,
  // cùng một nguồn với con số hiển thị trên chính trang đó.
  const libBadge = services.assets.list().length.toLocaleString('vi-VN');

  // Mục/nhóm đã ẩn — chỉ gom trong phạm vi vai trò được thấy, để khối "Tuỳ chỉnh
  // menu" không bao giờ tiết lộ tên chức năng nằm ngoài quyền của người đang
  // đăng nhập. Nhóm không còn mục nào trong quyền cũng bị loại khỏi danh sách.
  const hiddenItems = NAV_GROUPS.flatMap((g) => filterNavByRole(g.items, role)).filter((i) => isHidden(i.id));
  const hiddenGroups = NAV_GROUPS.filter((g) => isGroupHidden(g.id) && filterNavByRole(g.items, role).length > 0);

  return (
    // Nhãn/tiêu đề KHÔNG tháo khỏi DOM khi thu gọn — chúng chỉ mờ đi và co chiều
    // cao bằng CSS. Trước đây tháo hẳn khiến 4 hàng tiêu đề nhóm biến mất tức
    // thì: đo được mục cuối nhảy 124px ngay lập tức trong khi bề rộng vẫn đang
    // trượt 180ms. Bề rộng mượt mà nội dung giật là cảm giác "chưa mượt".
    <aside
      className={open ? `${styles.sidebar} ${styles.sidebarOpen}` : `${styles.sidebar} ${styles.sidebarCollapsed}`}
      style={{ width: open ? '232px' : '72px' }}
    >
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" fill="var(--accent)" />
          </svg>
        </div>
        <div className={styles.brandName}>Văn Miếu số</div>
      </div>

      <nav className={styles.nav}>
        {NAV_GROUPS.map((group) => {
          // Ẩn cả nhóm = ẩn nhãn lẫn toàn bộ mục bên trong. Bỏ qua sớm để không
          // phải lọc từng mục của một nhóm sẽ không hiển thị.
          if (isGroupHidden(group.id)) return null;
          // Hai lớp lọc, thứ tự có ý nghĩa: QUYỀN trước (không được thấy thì
          // không tồn tại), SỞ THÍCH sau (được thấy nhưng tự chọn giấu đi).
          const visible = filterNavByRole(group.items, role).filter((i) => !isHidden(i.id));
          // Ở bề rộng 72px không có nhãn nhóm nên cũng không có nút để mở lại —
          // gập lúc đó chỉ khiến icon biến mất không rõ lý do. Vì vậy trạng thái
          // gập chỉ có hiệu lực khi sidebar đang mở; thu gọn sidebar là hiện đủ.
          const collapsed = open && isGroupCollapsed(group.id);
          // Nhóm rỗng sau khi lọc vai trò (vd KHAI THÁC với vai Phê duyệt chỉ còn
          // 1 mục, HỆ THỐNG với vai Chỉ xem chỉ còn Trợ giúp) vẫn hiện các mục còn
          // lại; nhóm không còn mục nào thì ẩn cả nhãn — nhãn mồ côi gợi ý sự tồn
          // tại của chức năng bị giấu.
          if (visible.length === 0) return null;
          return (
            // `navGroup + navGroup` trong CSS vẽ divider giữa các nhóm — hoạt động
            // ở cả trạng thái thu gọn (nhãn ẩn nhưng vạch phân cách vẫn còn, người
            // dùng vẫn thấy ranh giới nhóm bằng icon).
            <div key={group.id} className={styles.navGroup}>
              {/* Luôn render, kể cả khi sidebar thu gọn: CSS co chiều cao về 0.
                  Tháo khỏi DOM sẽ làm toàn bộ mục bên dưới nhảy vị trí tức thì. */}
              <GroupHeader
                label={groupLabelFor(group)}
                sidebarOpen={open}
                collapsed={collapsed}
                itemCount={visible.length}
                renaming={renamingGroupId === group.id}
                onToggle={() => toggleGroupCollapsed(group.id)}
                onStartRename={() => setRenamingGroupId(group.id)}
                onCommitRename={(v) => {
                  renameGroup(group.id, v);
                  setRenamingGroupId(null);
                }}
                onCancelRename={() => setRenamingGroupId(null)}
                onHide={() => hideGroup(group.id)}
              />
              {!collapsed &&
                visible.map((item) => (
                <NavRow
                  key={item.id}
                  item={item}
                  label={labelFor(item)}
                  open={open}
                  active={isActive(item, pathname)}
                  badge={item.id === 'lib' ? libBadge : undefined}
                  renaming={renamingId === item.id}
                  onNavigate={() => navigate(item.path)}
                  onStartRename={() => setRenamingId(item.id)}
                  onCommitRename={(v) => {
                    rename(item.id, v);
                    setRenamingId(null);
                  }}
                  onCancelRename={() => setRenamingId(null)}
                  onHide={() => hide(item.id)}
                />
              ))}
            </div>
          );
        })}

        {/* Khối tuỳ chỉnh: đường DUY NHẤT để lấy lại mục đã ẩn, nên chỉ hiện khi
            thực sự có tuỳ chỉnh — không có gì tuỳ chỉnh thì đây là rác thị giác. */}
        {open && count > 0 && (
          <div className={styles.customBlock}>
            <button
              type="button"
              className={styles.customToggle}
              aria-expanded={showHidden}
              onClick={() => setShowHidden((v) => !v)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={ICON_EYE} />
              </svg>
              <span className={styles.customToggleLabel}>Tuỳ chỉnh menu</span>
              <span className={styles.customCount}>{count}</span>
            </button>

            {showHidden && (
              <div className={styles.customBody}>
                {hiddenGroups.length + hiddenItems.length > 0 ? (
                  <ul className={styles.hiddenList}>
                    {hiddenGroups.map((group) => (
                      <li key={`g:${group.id}`} className={styles.hiddenRow}>
                        <span className={styles.hiddenLabel}>
                          {groupLabelFor(group)}
                          <span className={styles.hiddenKind}>cả nhóm</span>
                        </span>
                        <button
                          type="button"
                          className={styles.hiddenRestore}
                          aria-label={`Hiện lại nhóm ${groupLabelFor(group)}`}
                          onClick={() => unhideGroup(group.id)}
                        >
                          Hiện lại
                        </button>
                      </li>
                    ))}
                    {hiddenItems.map((item) => (
                      <li key={item.id} className={styles.hiddenRow}>
                        <span className={styles.hiddenLabel}>{labelFor(item)}</span>
                        <button
                          type="button"
                          className={styles.hiddenRestore}
                          aria-label={`Hiện lại mục ${labelFor(item)}`}
                          onClick={() => unhide(item.id)}
                        >
                          Hiện lại
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.customNote}>Không có mục nào đang ẩn — tuỳ chỉnh hiện tại chỉ là đổi tên.</p>
                )}
                <button
                  type="button"
                  className={styles.customReset}
                  onClick={() => {
                    reset();
                    setShowHidden(false);
                  }}
                >
                  Đặt lại menu mặc định
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Khối "Sao lưu định kỳ" đã bỏ theo yêu cầu chủ đầu tư (12/08/2026):
          sidebar là điều hướng, không phải nơi đặt thao tác vận hành — sao lưu
          đã có màn riêng "Sao lưu & khôi phục" trong nhóm HỆ THỐNG. */}

      <div className={styles.footer}>
        {/* Bố cục footer (yêu cầu 12/08/2026): Cài đặt là một DÒNG riêng phía
            trên (trông như mục menu); dưới là thẻ người dùng — avatar viền rõ,
            tên đậm, chức danh ngay dưới tên, icon đăng xuất sát lề phải cùng
            dòng. Email chuyển vào tooltip để thẻ gọn hai dòng chữ. */}
        <button
          type="button"
          title={!open ? 'Cài đặt' : undefined}
          aria-label="Mở cài đặt"
          className={styles.settingsRow}
          onClick={() => setSettingsOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon} aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.35.4.65.74.85.26.15.56.24.86.25H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className={styles.settingsLabel}>Cài đặt</span>
        </button>

        <div
          className={open ? styles.userCard : `${styles.userCard} ${styles.userCardCollapsed}`}
          title={`${user.name} — ${user.email}`}
        >
          <div className={styles.avatar}>{initials}</div>
          {open && (
            <div className={styles.userMeta}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userTitle}>{role}</div>
            </div>
          )}
          <button type="button" title="Đăng xuất" aria-label="Đăng xuất" className={styles.logoutBtn} onClick={signOut}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </aside>
  );
}
