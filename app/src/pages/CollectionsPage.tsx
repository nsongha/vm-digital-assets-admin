import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SmartImage from '../components/SmartImage';
import { services } from '../services';
import styles from './CollectionsPage.module.css';

export default function CollectionsPage() {
  const navigate = useNavigate();
  const collections = services.collections.list();

  return (
    <>
      <div className={styles.topRow}>
        <button type="button" className={styles.createBtn}>
          + Tạo bộ sưu tập
        </button>
      </div>
      <div className={styles.grid}>
        {collections.map((c) => (
          <GlassCard
            key={c.slug}
            flush
            className={styles.card}
            onClick={() => navigate(`/collections/${c.slug}`)}
            ariaLabel={`Mở bộ sưu tập ${c.name}`}
          >
            <div className={styles.cover}>
              <SmartImage src={c.cover} alt={c.name} placeholder="Ảnh bìa — thả ảnh Văn Miếu vào đây" />
            </div>
            <div className={styles.body}>
              <div className={styles.bodyTop}>
                <span className={styles.countChip}>{c.count} dữ liệu số hóa</span>
                <span className={styles.updated}>cập nhật {c.updated}</span>
              </div>
              <h4 className={styles.name}>{c.name}</h4>
              <p className={styles.desc}>{c.desc}</p>
              <div className={styles.foot}>
                <span>{c.types}</span>
                <span>{c.size}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </>
  );
}
