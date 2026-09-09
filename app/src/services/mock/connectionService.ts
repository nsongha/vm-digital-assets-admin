import { APIS } from '../../data/apis';
import { COMPLIANCE } from '../../data/compliance';
import { CONNECTIONS, defaultSyncState } from '../../data/connections';
import { SHARE_REQUESTS, SUPERVISORY_REQUESTS } from '../../data/requests';
import { Store } from '../store';
import type { ApiEndpoint, ComplianceItem, Connection, ConnectionSyncState, ShareRequest } from '../types';

export type ConnectionWithState = Connection & ConnectionSyncState;

const initialSyncState: Record<string, ConnectionSyncState> = {};
for (const cn of CONNECTIONS) {
  initialSyncState[cn.name] = defaultSyncState(cn);
}

export const connectionSyncStore = new Store<Record<string, ConnectionSyncState>>(initialSyncState);

export interface ConnectionService {
  readonly store: Store<Record<string, ConnectionSyncState>>;
  list(): ConnectionWithState[];
  setEnabled(name: string, enabled: boolean): void;
  toggleEnabled(name: string): void;
  setFreq(name: string, freq: ConnectionSyncState['freq']): void;
  listApis(): ApiEndpoint[];
  /** Yêu cầu chia sẻ từ CƠ QUAN KHÁC — không gồm cơ quan chủ quản (A5). */
  listRequests(): ShareRequest[];
  /** Chỉ đạo/báo cáo CƠ QUAN CHỦ QUẢN (Sở VH&TT Hà Nội) — nhóm riêng, tách khỏi listRequests() (A5). */
  listSupervisoryRequests(): ShareRequest[];
  listCompliance(): ComplianceItem[];
}

export const connectionService: ConnectionService = {
  store: connectionSyncStore,
  list() {
    const state = connectionSyncStore.getState();
    return CONNECTIONS.map((cn) => ({ ...cn, ...(state[cn.name] || defaultSyncState(cn)) }));
  },
  setEnabled(name, enabled) {
    connectionSyncStore.setState((prev) => ({
      ...prev,
      [name]: { ...(prev[name] || defaultSyncState(CONNECTIONS.find((c) => c.name === name)!)), enabled },
    }));
  },
  toggleEnabled(name) {
    const current = connectionSyncStore.getState()[name];
    this.setEnabled(name, !current?.enabled);
  },
  setFreq(name, freq) {
    connectionSyncStore.setState((prev) => ({
      ...prev,
      [name]: { ...(prev[name] || defaultSyncState(CONNECTIONS.find((c) => c.name === name)!)), freq },
    }));
  },
  listApis() {
    return APIS;
  },
  listRequests() {
    return SHARE_REQUESTS;
  },
  listSupervisoryRequests() {
    return SUPERVISORY_REQUESTS;
  },
  listCompliance() {
    return COMPLIANCE;
  },
};
