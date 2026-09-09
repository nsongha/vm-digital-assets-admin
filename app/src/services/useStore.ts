import { useSyncExternalStore } from 'react';
import type { Store } from './store';

/** Subscribes a component to a mock-service Store so it re-renders on mutation. */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
