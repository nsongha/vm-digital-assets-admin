import { Fragment, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import StatusPill from '../components/StatusPill';
import { statusPill } from '../components/statusColors';
import { useAppUi } from '../context/AppUiContext';
import { HERITAGE_RANKING, UNESCO_MEMORY_OF_WORLD } from '../data/heritage';
import { formatMissing, isMissingDisplay } from '../data/missingValues';
import { averageCompletenessPctOrNull } from '../data/selectors';
import { DIGITAL_FORM_LABELS, DIGITAL_FORM_ORDER, OBJECT_CLASS_LABELS } from '../data/taxonomy';
import { PHYSICAL_OBJECTS, physicalObjectById } from '../data/assets';
import { services } from '../services';
import { useStore } from '../services/useStore';
import type { Asset, ObjectClass, RelationKind } from '../services/types';
import styles from './ObjectDossierPage.module.css';

// B9 — Hồ sơ đối tượng di sản (0ter). Trang tổng hợp 360° cho MỘT đối tượng
// vật lý (một `physicalObjectId`), gộp:
//   (a) header đối tượng + breadcrumb partOf
//   (b) Bản đại diện số — nhóm quan hệ 1 (0ter): mọi Asset CÙNG physicalObjectId
//   (c) Xuất hiện trong tư liệu khác — nhóm quan hệ 2: Asset khác có
//       relatedObject.physicalArtifactId trỏ tới đối tượng này
//   (d) Bản dẫn xuất bảo quản — suy ra từ dữ liệu có sẵn: đối tượng có CẢ
//       splat lẫn pointcloud thì bản pointcloud đóng vai trò bản dẫn xuất bảo
//       hiểm cho bản splat (xem mô tả gốc ở objects/structures.ts,
//       objects/precincts.ts — "...dùng làm bản dẫn xuất bảo hiểm cho bản
//       splat"; không có field riêng `hasPreservationSurrogate` trong mock).
//   (e) % độ đầy đủ hồ sơ — `averageCompletenessPct` trên các bản đại diện số.
//
// Route dự kiến: `/objects/:id` với `id` = physicalObjectId (VD `VM-CT-00007`).
// Không truyền `id` (hoặc `id` không khớp bản ghi nào) → mặc định Khuê Văn Các.

const DEFAULT_OBJECT_NAME = 'Khuê Văn Các';

const RELATION_LABELS: Record<RelationKind, string> = {
  depictedIn: 'Được khắc họa trong',
  mentionedIn: 'Được nhắc đến trong',
  subjectOf: 'Là chủ đề của',
  hasRubbing: 'Có bản dập',
};

const RELATION_ORDER: RelationKind[] = ['depictedIn', 'mentionedIn', 'subjectOf', 'hasRubbing'];

const ERA_CERTAINTY_LABELS: Record<string, string> = {
  certain: 'Chắc chắn',
  uncertain: 'Nghi vấn',
  approximate: 'Xấp xỉ',
  century: 'Theo thế kỷ',
  range: 'Khoảng thời gian',
  unknown: 'Chưa xác định',
};

/** 0quater — `so_kiem_ke` bắt buộc với HV (artifact) / TL (document); các loại khác không áp dụng. */
function soKiemKeDisplay(objectClass: ObjectClass, value?: string): string {
  if (value) return value;
  return objectClass === 'artifact' || objectClass === 'document' ? formatMissing('CHUA_NHAP') : formatMissing('KHONG_AP_DUNG');
}

/** 0quater — `ma_ho_so_di_tich` áp dụng với KV (precinct) / CT (structure); các loại khác không áp dụng. */
function maHoSoDisplay(objectClass: ObjectClass, value?: string): string {
  if (value) return value;
  return objectClass === 'precinct' || objectClass === 'structure' ? formatMissing('CHUA_NHAP') : formatMissing('KHONG_AP_DUNG');
}

/**
 * Hàng dữ liệu DÙNG CHUNG cho cả 3 khối (Bản đại diện số / Xuất hiện trong
 * tư liệu khác / Bản dẫn xuất bảo quản) — cột cố định: Mã · Tên/định dạng ·
 * Dung lượng · Trạng thái · thao tác, thay vì mỗi khối tự vẽ bảng riêng lệch cột.
 */
function UnifiedAssetRow({ asset, navigate, openLabel }: { asset: Asset; navigate: (path: string) => void; openLabel: string }) {
  return (
    <tr className="clickable" onClick={() => navigate(`/assets/${asset.id}`)}>
      <td className="mono strong nowrap">{asset.code}</td>
      <td>
        <div>{asset.name}</div>
        <div className={styles.rowSub}>{asset.fmt}</div>
      </td>
      <td className="nowrap muted">{asset.size}</td>
      <td>
        <StatusPill label={asset.status} colors={statusPill(asset.status)} />
      </td>
      <td style={{ textAlign: 'right' }}>
        <button
          type="button"
          className={styles.openBtn}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/assets/${asset.id}`);
          }}
        >
          {openLabel}
        </button>
      </td>
    </tr>
  );
}

/** Hàng tiêu đề nhóm (Mô hình 3D / Gaussian splat / …) BÊN TRONG cùng một bảng — thay cho mỗi nhóm một bảng con rời rạc. */
function GroupHeaderRow({ title, count, unit }: { title: string; count: number; unit: string }) {
  return (
    <tr className={styles.groupHeaderRow}>
      <td colSpan={5}>
        <span className={styles.groupHeaderTitle}>{title}</span>
        <span className={styles.groupHeaderCount}>
          {count} {unit}
        </span>
      </td>
    </tr>
  );
}

/** Tiêu đề cột dùng chung cho cả 3 bảng thống nhất. */
function UnifiedTableHead() {
  return (
    <thead>
      <tr>
        <th>Mã</th>
        <th>Tên / định dạng</th>
        <th>Dung lượng</th>
        <th>Trạng thái</th>
        <th aria-hidden="true"></th>
      </tr>
    </thead>
  );
}

export default function ObjectDossierPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { setQuery } = useAppUi();
  const assets = useStore(services.assets.store);

  // Danh tính đối tượng lấy từ PHYSICAL_OBJECTS (hồ sơ hiện vật thật), KHÔNG suy từ
  // bản ghi số. Lý do: đối tượng chưa số hóa không có bản ghi số nào — nếu tra theo
  // assets thì tra không ra và trang sẽ âm thầm hiện nhầm sang đối tượng mặc định,
  // lỗi nguy hiểm hơn cả crash vì người trình bày không nhận ra.
  const object = useMemo(() => {
    if (id) return physicalObjectById(id);
    return PHYSICAL_OBJECTS.find((o) => o.name === DEFAULT_OBJECT_NAME);
  }, [id]);

  const targetId = object?.physicalObjectId;

  const reps = useMemo(() => (targetId ? assets.filter((a) => a.physicalObjectId === targetId) : []), [assets, targetId]);
  const relatedDocs = useMemo(
    () => (targetId ? assets.filter((a) => a.relatedObject?.physicalArtifactId === targetId) : []),
    [assets, targetId],
  );

  if (!object) {
    return (
      <GlassCard style={{ marginTop: 16 }}>
        <p className={styles.emptyState}>
          Không tìm thấy đối tượng di sản có mã <strong>{id}</strong> — kiểm tra lại mã đối tượng.
        </p>
      </GlassCard>
    );
  }

  // Đầu trang dựng từ bản ghi đối tượng; nếu đã có bản số hóa thì mượn thêm vài
  // trường chỉ tồn tại trên bản ghi số (thẻ phân loại, mô tả chi tiết).
  const head = { ...object, ...(reps[0] ?? {}), ...object };

  const repsByForm = DIGITAL_FORM_ORDER.map((form) => ({ form, items: reps.filter((r) => r.digitalForm === form) })).filter(
    (g) => g.items.length > 0,
  );

  const relatedByKind = RELATION_ORDER.map((kind) => ({
    kind,
    items: relatedDocs.filter((r) => r.relatedObject?.kind === kind),
  })).filter((g) => g.items.length > 0);

  const formsPresent = new Set(reps.map((r) => r.digitalForm));
  const hasPreservationSurrogate = formsPresent.has('splat') && formsPresent.has('pointcloud');
  const surrogateReps = reps.filter((r) => r.digitalForm === 'pointcloud');

  const completenessPct = averageCompletenessPctOrNull(reps);
  const soKiemKeText = soKiemKeDisplay(head.objectClass, head.soKiemKe);
  const maHoSoText = maHoSoDisplay(head.objectClass, head.maHoSoDiTich);
  const eraCertaintyLabel = head.eraCertainty ? ERA_CERTAINTY_LABELS[head.eraCertainty] : null;

  const goToLoc = () => {
    setQuery(head.loc);
    navigate('/assets');
  };

  return (
    <>
      <button type="button" onClick={() => navigate('/objects')} className={styles.backLink}>
        ← Đối tượng di sản
      </button>

      <nav className={styles.breadcrumb} aria-label="Đường dẫn phân cấp đối tượng">
        <a onClick={() => navigate('/')} className={styles.crumbLink}>
          Toàn khu — Văn Miếu &amp; Quốc Tử Giám
        </a>
        <span className={styles.crumbSep} aria-hidden="true">
          ›
        </span>
        <a onClick={goToLoc} className={styles.crumbLink}>
          {head.loc}
        </a>
        <span className={styles.crumbSep} aria-hidden="true">
          ›
        </span>
        <span className={styles.crumbCurrent} aria-current="page">
          {head.name}
        </span>
      </nav>

      <div className={styles.headRow}>
        <div className={styles.headMain}>
          <div className={styles.headKicker}>
            {OBJECT_CLASS_LABELS[head.objectClass]} · <span className="mono">{head.physicalObjectId}</span>
          </div>
          <h1 className={styles.headTitle}>{head.name}</h1>
          <p className={styles.subtitle}>
            Hồ sơ tổng hợp của MỘT đối tượng di sản có thật — không phải một tệp số hóa đơn lẻ. Trang này gom mọi bản đại diện số của
            chính đối tượng và mọi tư liệu độc lập liên quan tới nó về một chỗ.
          </p>
          <div className={styles.badgeRow}>
            <span className={styles.heritageBadge}>
              {HERITAGE_RANKING.label} ({HERITAGE_RANKING.decision}, {HERITAGE_RANKING.date})
            </span>
            {head.unesco && (
              <span className={styles.unescoBadge}>
                {UNESCO_MEMORY_OF_WORLD.label} — khu vực {UNESCO_MEMORY_OF_WORLD.regional.year}, toàn cầu {UNESCO_MEMORY_OF_WORLD.global.year}
              </span>
            )}
          </div>
        </div>

        <div className={styles.completenessCard}>
          {completenessPct === null ? (
            <>
              <div className={styles.completenessTop}>
                <span className={styles.completenessPct}>—</span>
                <span className={styles.completenessLabel}>Chưa số hóa</span>
              </div>
              <ProgressBar pct={0} height={8} color="var(--ink)" />
              <div className={styles.completenessSub}>
                Chưa có bản đại diện số nào nên chưa tính được độ đầy đủ hồ sơ. Đối tượng này nằm trong hàng đợi số hóa.
              </div>
            </>
          ) : (
            <>
              <div className={styles.completenessTop}>
                <span className={styles.completenessPct}>{completenessPct}%</span>
                <span className={styles.completenessLabel}>Độ đầy đủ hồ sơ</span>
              </div>
              <ProgressBar pct={completenessPct} height={8} color="var(--ink)" />
              <div className={styles.completenessSub}>Tính trên {reps.length} bản ghi dữ liệu số, loại trừ trường không áp dụng</div>
            </>
          )}
        </div>
      </div>

      <GlassCard style={{ marginTop: 18 }}>
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>Vị trí</span>
            <span className={styles.metaVal}>{head.loc}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>Niên đại</span>
            <span className={isMissingDisplay(head.era) ? `${styles.metaVal} ${styles.missing}` : styles.metaVal}>
              {head.era}
              {eraCertaintyLabel && <span className={styles.certaintyBadge}>{eraCertaintyLabel}</span>}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>Số kiểm kê hiện vật gốc</span>
            <span className={isMissingDisplay(soKiemKeText) ? `${styles.metaVal} ${styles.missing}` : styles.metaVal}>{soKiemKeText}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>Mã hồ sơ xếp hạng di tích</span>
            <span className={isMissingDisplay(maHoSoText) ? `${styles.metaVal} ${styles.missing}` : styles.metaVal}>{maHoSoText}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>Bộ sưu tập</span>
            <span className={styles.metaVal}>{head.coll}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>Số bản đại diện số</span>
            <span className={styles.metaVal}>{reps.length}</span>
          </div>
        </div>
        <p className={styles.desc}>{head.desc}</p>
      </GlassCard>

      <GlassCard dense style={{ marginTop: 22 }}>
        <h4 className={styles.sectionTitle}>Bản đại diện số</h4>
        <p className={styles.sectionHint}>
          Các bản ghi dữ liệu số của chính đối tượng này (P138 has representation), nhóm theo dạng dữ liệu.
        </p>
        <div className={styles.tableWrap}>
          <table className="data-table data-table--tight">
            <UnifiedTableHead />
            <tbody>
              {repsByForm.map((g) => (
                <Fragment key={g.form}>
                  <GroupHeaderRow title={DIGITAL_FORM_LABELS[g.form]} count={g.items.length} unit="bản ghi" />
                  {g.items.map((a) => (
                    <UnifiedAssetRow key={a.id} asset={a} navigate={navigate} openLabel="Mở chi tiết" />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {relatedByKind.length > 0 && (
        <GlassCard dense style={{ marginTop: 22 }}>
          <h4 className={styles.sectionTitle}>Xuất hiện trong tư liệu khác</h4>
          <p className={styles.sectionHint}>
            Đối tượng là chủ đề/được nhắc tới trong các tư liệu ĐỘC LẬP dưới đây — mỗi tư liệu có hồ sơ, niên đại và bản quyền riêng, không
            phải bản đại diện số của chính đối tượng.
          </p>
          <div className={styles.tableWrap}>
            <table className="data-table data-table--tight">
              <UnifiedTableHead />
              <tbody>
                {relatedByKind.map((g) => (
                  <Fragment key={g.kind}>
                    <GroupHeaderRow title={RELATION_LABELS[g.kind]} count={g.items.length} unit="tư liệu" />
                    {g.items.map((a) => (
                      <UnifiedAssetRow key={a.id} asset={a} navigate={navigate} openLabel="Mở hồ sơ tư liệu" />
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {hasPreservationSurrogate && (
        <GlassCard dense style={{ marginTop: 22 }}>
          <h4 className={styles.sectionTitle}>Bản dẫn xuất bảo quản</h4>
          <p className={styles.preservationNote}>
            Định dạng gaussian splat (<code>.splat</code>) hiện CHƯA có chuẩn ISO cho lưu trữ dài hạn — rủi ro không đọc được nếu công cụ
            hoặc engine hiển thị ngừng hỗ trợ. Vì vậy hệ thống bắt buộc giữ song song bản đám mây điểm (PLY/E57) dưới đây làm bản dẫn xuất
            bảo hiểm, cùng ảnh nguồn và tham số huấn luyện.
          </p>
          <div className={styles.tableWrap}>
            <table className="data-table data-table--tight">
              <UnifiedTableHead />
              <tbody>
                {surrogateReps.map((a) => (
                  <UnifiedAssetRow key={a.id} asset={a} navigate={navigate} openLabel="Mở chi tiết" />
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </>
  );
}
