import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import Sparkline from '../components/Sparkline';
import { useAppUi } from '../context/AppUiContext';
import { COVERS } from '../data/collections';
import { DASHBOARD_STAT_DEFS, PIPELINE_STEP_DEFS } from '../data/dashboard';
import { HERITAGE_RANKING, UNESCO_MEMORY_OF_WORLD } from '../data/heritage';
import { countByStatus, storageBreakdown, totalCount, totalSizeGB } from '../data/selectors';
import { services } from '../services';
import type { AssetStatus } from '../services/types';
import styles from './DashboardPage.module.css';

const HERO_IMG = 'https://commons.wikimedia.org/wiki/Special:FilePath/Khu%C3%AA_v%C4%83n_c%C3%A1c.jpg?width=1400';
const HERO_THUMBS = Object.values(COVERS).slice(0, 3);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setObjectClassFilter, setDigitalFormFilter, setStatusFilter, setLibPage } = useAppUi();
  const [recentTab, setRecentTab] = useState<'all' | 'mine'>('all');

  const assets = services.assets.list();
  const logs = services.audit.list();
  const recent = useMemo(
    () => (recentTab === 'mine' ? services.audit.listByUser('Nguyễn Thị Hạnh') : logs).slice(0, 5),
    [recentTab, logs],
  );

  // A2 — mọi con số dưới đây derive từ `assets` (mảng duy nhất), không có số ghi cứng.
  const total = totalCount(assets);
  const pendingCount = countByStatus(assets, 'Chờ duyệt');
  const publishedCount = countByStatus(assets, 'Xuất bản');
  const publishedPct = total === 0 ? 0 : Math.round((publishedCount / total) * 100);
  const storageGB = totalSizeGB(assets);
  const storageRows = storageBreakdown(assets);

  const pendingShareCount =
    services.connections.listRequests().filter((r) => r.status === 'Chờ duyệt').length +
    services.connections.listSupervisoryRequests().filter((r) => r.status === 'Chờ duyệt').length;

  // Hạn mức lấy từ Cài đặt (AppUiContext) thay vì hằng số cứng.
  const { quotaGB } = useAppUi();
  const quotaPct = Math.min(100, Math.round((storageGB / quotaGB) * 100));

  const statValue: Record<(typeof DASHBOARD_STAT_DEFS)[number]['kind'], { v: string; sub: string }> = {
    total: { v: total.toLocaleString('vi-VN'), sub: `${quotaPct}% hạn mức` },
    pending: { v: String(pendingCount), sub: 'cần thẩm định' },
    published: { v: String(publishedCount), sub: `${publishedPct}% toàn kho` },
    storage: { v: `${storageGB.toFixed(1).replace('.', ',')} GB`, sub: `${quotaPct}% hạn mức` },
  };

  const goToPipelineStep = (label: AssetStatus) => {
    setObjectClassFilter('Tất cả');
    setDigitalFormFilter('Tất cả');
    setStatusFilter(label);
    setLibPage(1);
    navigate('/assets');
  };

  const openLogTarget = (target: string) => {
    const asset = services.audit.resolveTarget(target);
    if (asset) navigate(`/assets/${asset.id}`);
  };

  return (
    <>
      <div className={styles.hero} style={{ backgroundImage: `url('${HERO_IMG}')` }}>
        <div className={styles.heroShade} />
        <div className={styles.heroLoc}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" aria-hidden="true">
            <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span className={styles.heroLocText}>Hà Nội, Việt Nam</span>
        </div>
        <div className={styles.heroThumbs}>
          {HERO_THUMBS.map((src, i) => (
            <div key={i} className={styles.heroThumb}>
              <img src={src} alt="" />
            </div>
          ))}
          <div className={styles.heroThumbMore}>+6</div>
        </div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Văn Miếu — Quốc Tử Giám</h1>
          <p className={styles.heroDesc}>
            Kho dữ liệu số hóa: mô hình 3D, gaussian splat, tư liệu Hán Nôm và ảnh lịch sử của khu di tích.
          </p>
          <p className={styles.heroDesc} style={{ marginTop: 4, fontSize: 12, opacity: 0.85 }}>
            {HERITAGE_RANKING.label} ({HERITAGE_RANKING.decision}, {HERITAGE_RANKING.date}) · {UNESCO_MEMORY_OF_WORLD.label} — 82 bia
            Tiến sĩ (khu vực {UNESCO_MEMORY_OF_WORLD.regional.year}, toàn cầu {UNESCO_MEMORY_OF_WORLD.global.year})
          </p>
        </div>
      </div>

      <div className={styles.dateRow}>
        <span className={styles.dateText}>Thứ Ba, 11/08/2026</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <div className={styles.statsGrid}>
            {DASHBOARD_STAT_DEFS.map((st) => {
              const { v, sub } = statValue[st.kind];
              return (
                <div key={st.k} className={styles.statCard} style={{ background: st.bg, color: st.fg }}>
                  <div className={styles.statTop}>
                    <div className={styles.statBadge} style={{ background: st.badgeBg }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={st.badgeFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={st.icon} />
                      </svg>
                    </div>
                    <span className={styles.statTrend}>{st.trend}</span>
                  </div>
                  <div className={styles.statK}>{st.k}</div>
                  <div className={styles.statBottom}>
                    <div>
                      <div className={styles.statV}>{v}</div>
                      <div className={styles.statSub}>{sub}</div>
                    </div>
                    <Sparkline values={st.vals} stroke={st.fg} />
                  </div>
                </div>
              );
            })}
          </div>

          <GlassCard>
            <div className={styles.storageHead}>
              <h4 className={styles.cardTitle}>Dung lượng lưu trữ</h4>
              <span className={styles.mutedSmall}>
                {storageGB.toFixed(1).replace('.', ',')} GB / hạn mức {quotaGB} GB
              </span>
            </div>
            <div className={styles.quotaBar}>
              <ProgressBar pct={quotaPct} height={12} color="var(--ink)" />
            </div>
            <div className={styles.storageList}>
              {storageRows.map((s) => (
                <div key={s.label} className={styles.storageRow}>
                  <span className={styles.storageDot} style={{ background: s.dot }} />
                  <span className={styles.storageLabel}>{s.label}</span>
                  <div className={styles.storageBarTrack}>
                    <ProgressBar pct={s.pct} height={8} color={s.dot} />
                  </div>
                  <span className={styles.storageMeta}>
                    {s.size} · {s.pct}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className={styles.recentHead}>
              <h4 className={styles.cardTitle}>Hoạt động gần đây</h4>
              <div className={styles.recentControls}>
                <div className={styles.recentTabs}>
                  {(['all', 'mine'] as const).map((id) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setRecentTab(id)}
                      aria-pressed={recentTab === id}
                      className={styles.recentTab}
                      style={{
                        background: recentTab === id ? 'var(--ink)' : 'transparent',
                        color: recentTab === id ? '#ffffff' : '#5f5f54',
                      }}
                    >
                      {id === 'all' ? 'Tất cả' : 'Của tôi'}
                    </button>
                  ))}
                </div>
                <a
                  href="/logs"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/logs');
                  }}
                  className={styles.recentLink}
                >
                  Xem nhật ký →
                </a>
              </div>
            </div>
            {recent.map((r, i) => (
              <div
                key={i}
                className={styles.recentRow}
                role="button"
                tabIndex={0}
                aria-label={`Xem ${r.target}`}
                onClick={() => openLogTarget(r.target)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLogTarget(r.target);
                  }
                }}
              >
                <span className={styles.recentTime}>{r.time}</span>
                <strong className={styles.recentUser}>{r.user}</strong>
                <span className={styles.recentAction}>{r.action}</span>
                <span className={styles.recentTarget}>{r.target}</span>
              </div>
            ))}
          </GlassCard>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.assistant}>
            <div className={styles.assistantHead}>
              <div className={styles.assistantIcon}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--accent)" stroke="none" aria-hidden="true">
                  <path d="M13 2 3 14h7l-1 8 11-14h-7z" />
                </svg>
              </div>
              <span className={styles.assistantLabel}>Trợ lý</span>
              <button type="button" className={styles.assistantExpand} aria-label="Mở rộng trợ lý">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </div>
            <p className={styles.assistantMsg}>
              Có <strong>{pendingCount} dữ liệu số hóa</strong> đang chờ duyệt và <strong>{pendingShareCount} yêu cầu chia sẻ</strong> đang chờ xử
              lý.
            </p>
            <div className={styles.assistantActions}>
              <a
                href="/assets"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/assets');
                }}
                className={styles.assistantChip}
              >
                Duyệt dữ liệu số hóa
              </a>
              <a
                href="/logs"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/logs');
                }}
                className={styles.assistantChip}
              >
                Nhật ký
              </a>
              <a
                href="/share"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/share');
                }}
                className={styles.assistantChip}
              >
                Chia sẻ dữ liệu
              </a>
            </div>
            <div className={styles.assistantInputRow}>
              <span className={styles.assistantInputPlaceholder}>Hỏi trợ lý…</span>
              <button type="button" className={styles.assistantSend} aria-label="Gửi câu hỏi cho trợ lý">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.pipeline}>
            <h4 className={styles.pipelineTitle}>Quy trình số hóa</h4>
            {PIPELINE_STEP_DEFS.map((p) => (
              <div
                key={p.num}
                className={styles.pipelineRow}
                role="button"
                tabIndex={0}
                aria-label={`Xem dữ liệu số hóa ở bước ${p.label}`}
                onClick={() => goToPipelineStep(p.label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goToPipelineStep(p.label);
                  }
                }}
              >
                <span className={styles.pipelineNum}>{p.num}</span>
                <span className={styles.pipelineLabel}>{p.label}</span>
                <span className={styles.pipelineChip} style={{ background: p.chip, color: p.chipFg }}>
                  {countByStatus(assets, p.label)}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
