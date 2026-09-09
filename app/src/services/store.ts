// Tiny observable store used by the mock services that need to hold mutable
// state shared across pages (asset status, upload queue, connection config).
// Pairs with React's `useSyncExternalStore` in `useStore.ts`.
export class Store<T> {
  private state: T;
  private listeners = new Set<() => void>();

  constructor(initial: T) {
    this.state = initial;
  }

  getState = (): T => this.state;

  setState = (updater: T | ((prev: T) => T)): void => {
    const next = typeof updater === 'function' ? (updater as (prev: T) => T)(this.state) : updater;
    this.state = next;
    this.listeners.forEach((l) => l());
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}
