import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppUi } from '../context/AppUiContext';
import { services } from '../services';
import { pageTitleFor } from './navConfig';
import styles from './Header.module.css';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { query, setQuery, setLibPage } = useAppUi();
  const params = useParams<{ slug?: string }>();

  const collDetailName = params.slug ? services.collections.getBySlug(params.slug)?.name : undefined;
  const title = pageTitleFor(pathname, collDetailName);

  return (
    <header className={styles.header}>
      <button type="button" onClick={onToggleSidebar} title="Thu gọn / mở menu" aria-label="Thu gọn / mở menu" className={styles.iconBtn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.actions}>
        <div className={styles.searchWrap}>
          <label htmlFor="header-search" className="visually-hidden">
            Tìm mã, tên dữ liệu số hóa
          </label>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6f6f62" strokeWidth="1.8" strokeLinecap="round" className={styles.searchIcon} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="header-search"
            type="search"
            placeholder="Tìm mã, tên dữ liệu số hóa…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLibPage(1);
              if (!pathname.startsWith('/assets')) navigate('/assets');
            }}
            className={styles.searchInput}
          />
          <span className={styles.searchBadge} aria-hidden="true">⌘F</span>
        </div>
        <button type="button" title="Thông báo" aria-label="Thông báo" className={styles.bellBtn}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}
