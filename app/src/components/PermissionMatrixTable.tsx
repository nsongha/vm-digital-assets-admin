import { Fragment } from 'react';
import {
  MODULE_GROUPS,
  MODULE_ROUTES,
  PERMISSIONS,
  PERMISSION_GROUPS,
  diffFromDefault,
  lockReason,
  policyViolations,
  type ModuleName,
  type PermissionMatrix,
  type PermissionName,
} from '../data/permissions';
import styles from './PermissionMatrixTable.module.css';

interface PermissionMatrixTableProps {
  matrix: PermissionMatrix;
  /** Vai trò dùng làm mốc so sánh — ô lệch mặc định được đánh dấu. */
  role: string;
  /** Bỏ trống ⇒ bảng chỉ đọc (bảng tham chiếu theo vai trò). */
  onToggle?: (mod: ModuleName, perm: PermissionName) => void;
  /** Ẩn đường dẫn màn hình dưới tên phân hệ khi không gian hẹp. */
  compact?: boolean;
}

/** Ô cuối cùng của mỗi nhóm cột — nơi vẽ vạch ngăn dọc. */
const GROUP_END = new Set(
  PERMISSION_GROUPS.slice(0, -1).map((g) => g.perms[g.perms.length - 1]),
);

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * Ma trận phân quyền dùng chung cho màn Chi tiết người dùng, hộp thoại Thêm người
 * dùng và bảng tham chiếu ở màn Người dùng — cả ba đọc cùng một chính sách trong
 * `data/permissions.ts`.
 *
 * Hai chế độ, hai bộ điều khiển khác nhau — có chủ ý:
 *  - **chỉ đọc**: KHÔNG dùng checkbox. Checkbox mời người ta bấm; bảng tham chiếu
 *    thì không bấm được, và checkbox vô hiệu hóa lại làm ô "có quyền" nhạt đi đúng
 *    bằng ô "không có quyền" — hỏng chính việc bảng sinh ra để làm. Thay bằng ô
 *    đặc/rỗng: có quyền là khối đặc màu nhấn, không có quyền là dấu chấm mờ.
 *  - **sửa được**: checkbox thật, vì đây là điều khiển thật.
 *
 * Ba trạng thái ngoại lệ đều phân biệt bằng thị giác chứ không chỉ bằng chú thích:
 * ô **khóa cứng** (`lockReason`) hiện ổ khóa, không tương tác được; ô thuộc **xung
 * đột** (`policyViolations`) viền đỏ; ô **lệch mặc định vai trò** có chấm vàng.
 */
export default function PermissionMatrixTable({ matrix, role, onToggle, compact = false }: PermissionMatrixTableProps) {
  const readOnly = !onToggle;
  const diffKeys = new Set(diffFromDefault(role, matrix).map((d) => `${d.mod}|${d.perm}`));
  const conflictKeys = new Set(policyViolations(matrix).flatMap((v) => v.cells.map((c) => `${c.mod}|${c.perm}`)));

  return (
    <div className={styles.wrap}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <colgroup>
            <col />
            {PERMISSIONS.map((p) => (
              <col key={p} className={styles.permCol} />
            ))}
          </colgroup>
          <thead>
            <tr className={styles.groupRow}>
              <th className={styles.modHead} rowSpan={2}>
                Phân hệ
              </th>
              {PERMISSION_GROUPS.map((g) => (
                <th
                  key={g.label}
                  colSpan={g.perms.length}
                  className={[styles.groupHead, GROUP_END.has(g.perms[g.perms.length - 1]) ? styles.groupEnd : ''].join(' ').trim()}
                >
                  {g.label}
                </th>
              ))}
            </tr>
            <tr className={styles.permRow}>
              {PERMISSIONS.map((perm) => (
                <th key={perm} className={[styles.permHead, GROUP_END.has(perm) ? styles.groupEnd : ''].join(' ').trim()}>
                  {perm}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULE_GROUPS.map((group) => (
              <Fragment key={group.label}>
                <tr className={styles.bandRow}>
                  <td colSpan={PERMISSIONS.length + 1} className={styles.band}>
                    {group.label}
                  </td>
                </tr>
                {group.modules.map((mod) => {
                  const granted = PERMISSIONS.filter((p) => matrix[mod][p]).length;
                  return (
                    <tr key={mod} className={granted === 0 ? styles.rowEmpty : undefined}>
                      <th scope="row" className={styles.modCell}>
                        <span className={styles.modName}>{mod}</span>
                        <span className={styles.subLine}>
                          {!compact && <span className={styles.route}>{MODULE_ROUTES[mod]}</span>}
                          {readOnly && granted === 0 && <span className={styles.noneTag}>không có quyền</span>}
                        </span>
                      </th>
                      {PERMISSIONS.map((perm) => {
                        const key = `${mod}|${perm}`;
                        const locked = lockReason(mod, perm);
                        const on = matrix[mod][perm];
                        const cls = [
                          styles.cell,
                          GROUP_END.has(perm) ? styles.groupEnd : '',
                          conflictKeys.has(key) ? styles.conflict : '',
                          diffKeys.has(key) ? styles.diff : '',
                        ]
                          .join(' ')
                          .trim();

                        if (locked) {
                          return (
                            <td key={perm} className={cls}>
                              <span className={styles.locked} title={locked} aria-label={`${perm} — ${mod}: khóa cứng theo chính sách. ${locked}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                  <rect x="5" y="11" width="14" height="9" rx="2" />
                                  <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
                                </svg>
                              </span>
                            </td>
                          );
                        }

                        if (readOnly) {
                          return (
                            <td key={perm} className={cls}>
                              <span className={on ? styles.on : styles.off} role="img" aria-label={`${perm} — ${mod}: ${on ? 'có quyền' : 'không có quyền'}`}>
                                {on && <CheckGlyph />}
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={perm} className={cls}>
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                              checked={on}
                              onChange={() => onToggle?.(mod, perm)}
                              aria-label={`Quyền ${perm} — ${mod}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={styles.legend}>
        {readOnly ? (
          <>
            <li>
              <span className={styles.on}>
                <CheckGlyph />
              </span>
              có quyền
            </li>
            <li>
              <span className={styles.off} />
              không có quyền
            </li>
          </>
        ) : (
          <>
            <li>
              <span className={styles.swatchDiff} />
              khác mặc định của vai trò
            </li>
            <li>
              <span className={styles.swatchConflict} />
              xung đột phân tách nhiệm vụ
            </li>
          </>
        )}
        <li>
          <span className={styles.locked}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
            </svg>
          </span>
          khóa cứng theo chính sách — không vai trò nào cấp được (di chuột để xem lý do)
        </li>
      </ul>
    </div>
  );
}
