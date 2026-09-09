import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SmartImage from '../components/SmartImage';
import StatusPill from '../components/StatusPill';
import TagChip from '../components/TagChip';
import { statusPill } from '../components/statusColors';
import { ALL_TAGS } from '../data/tags';
import { DIGITAL_FORM_LABELS } from '../data/taxonomy';
import { services } from '../services';
import styles from './CollectionDetailPage.module.css';

type ViewMode = 'grid' | 'list';

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [viewBySlug, setViewBySlug] = useState<Record<string, ViewMode>>({});
  const [tagSel, setTagSel] = useState<string[]>([]);

  // Ported from `open: () => this.setState({ page: 'collDetail', collSel: c.name, tagSel: [] })`
  // — opening a (new) collection always clears the tag filter.
  useEffect(() => {
    setTagSel([]);
  }, [slug]);

  const collection = slug ? services.collections.getBySlug(slug) : undefined;
  const view = (slug && viewBySlug[slug]) || 'grid';
  const setView = (v: ViewMode) => {
    if (!slug) return;
    setViewBySlug((prev) => ({ ...prev, [slug]: v }));
  };

  const toggleTag = (t: string) => setTagSel((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const assets = services.collections.assetsIn(collection?.name ?? null, tagSel);

  const backLink = (
    <a
      href="/collections"
      onClick={(e) => {
        e.preventDefault();
        navigate('/collections');
      }}
      className={styles.backLink}
    >
      ← Bộ sưu tập
    </a>
  );

  if (!collection) {
    return (
      <>
        {backLink}
        <p className={styles.empty}>Không tìm thấy bộ sưu tập.</p>
      </>
    );
  }

  return (
    <>
      {backLink}
      <div className={styles.headRow}>
        <div className={styles.cover}>
          <SmartImage src={collection.cover} alt={collection.name} placeholder="Ảnh bìa" />
        </div>
        <div className={styles.descWrap}>
          <p className={styles.desc}>{collection.desc}</p>
        </div>
        <div className={styles.viewSwitch} role="group" aria-label="Chế độ xem">
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
            className={styles.viewChip}
            style={{ background: view === 'grid' ? 'var(--ink)' : 'transparent', color: view === 'grid' ? '#ffffff' : 'var(--accent-text)' }}
          >
            Lưới
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            className={styles.viewChip}
            style={{ background: view === 'list' ? 'var(--ink)' : 'transparent', color: view === 'list' ? '#ffffff' : 'var(--accent-text)' }}
          >
            Danh sách
          </button>
        </div>
      </div>

      <div className={styles.tagRow}>
        <span className={styles.tagRowTitle}>Lọc theo thẻ</span>
        {ALL_TAGS.map((t) => (
          <TagChip key={t} label={t} active={tagSel.includes(t)} shadow dense padding="6px 14px" onClick={() => toggleTag(t)} />
        ))}
        <span className={styles.tagRowCount}>{assets.length} dữ liệu số hóa</span>
      </div>

      {assets.length === 0 && <p className={styles.empty}>Không có dữ liệu số hóa khớp thẻ đã chọn — bỏ bớt thẻ để xem thêm.</p>}

      {assets.length > 0 && view === 'grid' && (
        <div className={styles.grid}>
          {assets.map((a) => (
            <GlassCard
              key={a.id}
              flush
              className={styles.card}
              onClick={() => navigate(`/assets/${a.id}`)}
              ariaLabel={`Xem chi tiết ${a.name}`}
            >
              <div className={styles.thumb}>
                <SmartImage alt={a.name} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.cardCode}>{a.code}</span>
                  <StatusPill label={a.status} colors={statusPill(a.status)} small />
                </div>
                <div className={styles.cardName}>{a.name}</div>
                <div className={styles.cardMeta}>
                  {DIGITAL_FORM_LABELS[a.digitalForm]} · {a.size}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {assets.length > 0 && view === 'list' && (
        <GlassCard dense>
          <div className="table-scroll">
            <table className="data-table">
              <tbody>
                {assets.map((a) => (
                  <tr
                    key={a.id}
                    className="clickable"
                    tabIndex={0}
                    role="button"
                    aria-label={`Xem chi tiết ${a.name}`}
                    onClick={() => navigate(`/assets/${a.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/assets/${a.id}`);
                      }
                    }}
                  >
                    <td style={{ width: 52 }}>
                      <div className={styles.listThumb}>
                        <SmartImage alt={a.name} />
                      </div>
                    </td>
                    <td className="strong nowrap">{a.code}</td>
                    <td>{a.name}</td>
                    <td className="faint" style={{ fontSize: 13 }}>
                      {a.tags.join(' · ')}
                    </td>
                    <td className="nowrap">{DIGITAL_FORM_LABELS[a.digitalForm]}</td>
                    <td className="nowrap muted">{a.size}</td>
                    <td>
                      <StatusPill label={a.status} colors={statusPill(a.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </>
  );
}
