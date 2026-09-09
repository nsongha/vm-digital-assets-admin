import { LOGS } from '../../data/logs';
import { Store } from '../store';
import { assetService } from './assetService';
import type { Asset, LogEntry } from '../types';

export const logStore = new Store<LogEntry[]>(LOGS);

export interface AuditService {
  list(): LogEntry[];
  /** "Của tôi" recent-activity tab filter — ported from `recentTab === 'mine'` in v3.html. */
  listByUser(userName: string): LogEntry[];
  /**
   * Resolves a log row's `target` (e.g. "VM-3D-004 — Tượng thờ Chu Văn An")
   * back to the matching asset, ported from the `logs[].open` handler.
   */
  resolveTarget(target: string): Asset | undefined;
  /**
   * C1 — ghi nhận một hành động vào nhật ký (tải xuống, trả lại bổ sung, gỡ
   * xuất bản…) ngay khi thực hiện, thay vì để hành động "chết" không có vết.
   * Chèn lên đầu danh sách với nhãn thời gian "vừa xong".
   */
  record(entry: { user: string; action: string; target: string; note: string }): void;
}

export const auditService: AuditService = {
  list() {
    return logStore.getState();
  },
  listByUser(userName) {
    return logStore.getState().filter((r) => r.user === userName);
  },
  resolveTarget(target) {
    const code = (target.split(' — ')[0] || '').trim();
    return assetService.list().find((a) => a.code === code);
  },
  record(entry) {
    logStore.setState((prev) => [{ time: 'Vừa xong', ...entry }, ...prev]);
  },
};
