import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AssetTable from '../components/AssetTable';
import GlassCard from '../components/GlassCard';
import Pagination from '../components/Pagination';
import TagChip from '../components/TagChip';
import { useAppUi } from '../context/AppUiContext';
import { DIGITAL_FORM_ORDER, DIGITAL_FORM_LABELS, MEDIA_DIGITAL_FORMS, OBJECT_CLASS_ORDER, OBJECT_CLASS_LABELS } from '../data/taxonomy';
import { services } from '../services';
import { matchesAssetQuery } from '../utils/search';
import type { DigitalFormFilter, ObjectClassFilter } from '../services/types';
import styles from './AssetsPage.module.css';

// (0bis) Bộ lọc tách 2 hàng chip độc lập: Loại đối tượng (objectClass) và
// Dạng dữ liệu (digitalForm) — thay cho 1 hàng trộn lẫn hai khái niệm cũ.
const OBJECT_CLASS_FILTERS: ObjectClassFilter[] = ['Tất cả', ...OBJECT_CLASS_ORDER];
const DIGITAL_FORM_FILTERS: DigitalFormFilter[] = ['Tất cả', ...DIGITAL_FORM_ORDER];
const PAGE_SIZE = 10;

function objectClassLabel(f: ObjectClassFilter): string {
  return f === 'Tất cả' ? 'Tất cả' : OBJECT_CLASS_LABELS[f];
}

function digitalFormLabel(f: DigitalFormFilter): string {
  if (f === 'Tất cả') return 'Tất cả';
  if (f === 'Media') return 'Media (ảnh/video/âm thanh)';
  return DIGITAL_FORM_LABELS[f];
}

export default function AssetsPage() {
  const navigate = useNavigate();
  const {
    query,
    objectClassFilter,
    setObjectClassFilter,
    digitalFormFilter,
    setDigitalFormFilter,
    statusFilter,
    setStatusFilter,
    libPage,
    setLibPage,
  } = useAppUi();

  const allAssets = services.assets.list();

  const filtered = useMemo(() => {
    return allAssets.filter(
      (a) =>
        (objectClassFilter === 'Tất cả' || a.objectClass === objectClassFilter) &&
        (digitalFormFilter === 'Tất cả' ||
          a.digitalForm === digitalFormFilter ||
          (digitalFormFilter === 'Media' && MEDIA_DIGITAL_FORMS.includes(a.digitalForm))) &&
        (!statusFilter || a.status === statusFilter) &&
        matchesAssetQuery(a, query),
    );
  }, [allAssets, query, objectClassFilter, digitalFormFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, libPage), totalPages);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeLabel =
    filtered.length === 0
      ? '0'
      : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)}`;

  return (
    <>
      <div className={styles.topRow}>
        <span className={styles.count}>
          {filtered.length} / {allAssets.length} dữ liệu số hóa
        </span>
        <button type="button" className={styles.uploadBtn} onClick={() => navigate('/upload')}>
          + Nhập dữ liệu
        </button>
      </div>

      <div className={styles.filterRow}>
        {OBJECT_CLASS_FILTERS.map((f) => (
          <TagChip
            key={f}
            label={objectClassLabel(f)}
            active={objectClassFilter === f}
            shadow
            onClick={() => {
              setObjectClassFilter(f);
              setLibPage(1);
            }}
          />
        ))}
      </div>
      <div className={styles.filterRow}>
        {DIGITAL_FORM_FILTERS.map((f) => (
          <TagChip
            key={f}
            label={digitalFormLabel(f)}
            active={digitalFormFilter === f}
            shadow
            dense
            onClick={() => {
              setDigitalFormFilter(f);
              setLibPage(1);
            }}
          />
        ))}
        {statusFilter && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter(null);
              setLibPage(1);
            }}
            className={styles.statusChip}
          >
            Trạng thái: {statusFilter} ✕
          </button>
        )}
      </div>

      <GlassCard dense>
        <AssetTable assets={paged} />
        {filtered.length === 0 && <p className={styles.empty}>Không có dữ liệu số hóa khớp bộ lọc.</p>}
        {filtered.length > 0 && (
          <div className={styles.pagerRow}>
            <span className={styles.pagerLabel}>
              Hiển thị {rangeLabel} / {filtered.length}
            </span>
            <Pagination page={page} totalPages={totalPages} onChange={setLibPage} />
          </div>
        )}
      </GlassCard>
    </>
  );
}
