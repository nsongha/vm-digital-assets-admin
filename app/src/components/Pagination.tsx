import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** Prev/next + numbered pagination — ported from the `libPages` / `libPrev` /
 * `libNext` block in v3.html. */
export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.navBtn}
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        aria-label="Trang trước"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {pages.map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          aria-label={`Trang ${n}`}
          aria-current={n === page ? 'page' : undefined}
          className={styles.pageBtn}
          style={{ background: n === page ? 'var(--ink)' : 'transparent', color: n === page ? '#ffffff' : '#5f5f54' }}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        className={styles.navBtn}
        disabled={page >= totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        aria-label="Trang sau"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
