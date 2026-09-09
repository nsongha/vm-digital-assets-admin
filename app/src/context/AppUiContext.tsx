import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AssetStatus, DigitalFormFilter, ObjectClassFilter } from '../services/types';
import { DEFAULT_QUOTA_GB } from '../data/dashboard';

// Cross-page UI state ported from the top-level v3.html Component state:
// `query`, `filter`, `statusFilter`, `libPage`, `sbOpen`. These need to be
// shared because the header search box and the dashboard's pipeline widget
// both drive the library page's filters/pagination from outside it.
// (0bis) `filter` split into two independent axes — objectClassFilter
// (Loại đối tượng) and digitalFormFilter (Dạng dữ liệu) — rendered as two
// separate chip rows on the Dữ liệu số hóa page.
export interface AppUiContextValue {
  query: string;
  setQuery: (q: string) => void;
  objectClassFilter: ObjectClassFilter;
  setObjectClassFilter: (f: ObjectClassFilter) => void;
  digitalFormFilter: DigitalFormFilter;
  setDigitalFormFilter: (f: DigitalFormFilter) => void;
  statusFilter: AssetStatus | null;
  setStatusFilter: (s: AssetStatus | null) => void;
  libPage: number;
  setLibPage: (p: number) => void;
  sbOpen: boolean;
  toggleSidebar: () => void;
  /** Hạn mức lưu trữ (GB) — chỉnh trong hộp thoại Cài đặt, dùng để tính % đã dùng. */
  quotaGB: number;
  setQuotaGB: (gb: number) => void;
  /** Resets both filter axes/status/page to defaults but keeps `query` (used by nav-to-lib). */
  resetLibraryFilters: () => void;
}

const AppUiContext = createContext<AppUiContextValue | null>(null);

export function AppUiProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [objectClassFilter, setObjectClassFilter] = useState<ObjectClassFilter>('Tất cả');
  const [digitalFormFilter, setDigitalFormFilter] = useState<DigitalFormFilter>('Tất cả');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | null>(null);
  const [libPage, setLibPage] = useState(1);
  const [sbOpen, setSbOpen] = useState(true);
  const [quotaGB, setQuotaGBState] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('vmAdmin.quotaGB');
      const n = raw ? Number(raw) : NaN;
      return Number.isFinite(n) && n >= 100 ? n : DEFAULT_QUOTA_GB;
    } catch {
      return DEFAULT_QUOTA_GB;
    }
  });
  const setQuotaGB = (gb: number) => {
    setQuotaGBState(gb);
    try {
      localStorage.setItem('vmAdmin.quotaGB', String(gb));
    } catch {
      // localStorage bị chặn — vẫn đổi trong phiên.
    }
  };

  const value = useMemo<AppUiContextValue>(
    () => ({
      query,
      quotaGB,
      setQuotaGB,
      setQuery,
      objectClassFilter,
      setObjectClassFilter,
      digitalFormFilter,
      setDigitalFormFilter,
      statusFilter,
      setStatusFilter,
      libPage,
      setLibPage,
      sbOpen,
      toggleSidebar: () => setSbOpen((v) => !v),
      resetLibraryFilters: () => {
        setObjectClassFilter('Tất cả');
        setDigitalFormFilter('Tất cả');
        setStatusFilter(null);
        setLibPage(1);
      },
    }),
    [query, objectClassFilter, digitalFormFilter, statusFilter, libPage, sbOpen, quotaGB],
  );

  return <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>;
}

export function useAppUi(): AppUiContextValue {
  const ctx = useContext(AppUiContext);
  if (!ctx) throw new Error('useAppUi must be used within an AppUiProvider');
  return ctx;
}
