import { Fragment, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import StatusPill from '../components/StatusPill';
import StelePreview from '../components/StelePreview';
import Toast from '../components/Toast';
import { statusPill } from '../components/statusColors';
import {
  ACCESS_LEVEL_LABELS,
  canDownloadMaster,
  compareVersions,
  containsPersonalData,
  FIXITY_LABELS,
  getAccessLevel,
  getDepictionGroup,
  getFileList,
  getHanNomReviewPair,
  getMinistryApproval,
  getRepresentationGroup,
  getRightsStatement,
  getSignatureInfo,
  getStructuralBreadcrumb,
  getVersionHistory,
  STORAGE_TIER_LABELS,
} from '../data/digitization';
import { HERITAGE_RANKING, UNESCO_MEMORY_OF_WORLD } from '../data/heritage';
import { formatMissing, isMissingDisplay } from '../data/missingValues';
import { advanceActionLabel, isApprovalStep, isPublishStep, PIPELINE_SEQUENCE, PUBLISHED_STATUSES, REVIEWABLE_STATUSES } from '../data/pipeline';
import { DIMENSION_LABELS, METHOD_LABELS, presetFor, QUALIFIER_LABELS, specsFor } from '../data/physicalSpecs';
import { DIGITAL_FORM_LABELS, OBJECT_CLASS_LABELS } from '../data/taxonomy';
import { assetStore, assetService } from '../services/mock/assetService';
import { auditService } from '../services/mock/auditService';
import { useStore } from '../services/useStore';
import { useAuth } from '../context/AuthContext';
import styles from './AssetDetailPage.module.css';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assets = useStore(assetStore);
  // Người dùng hiện tại — từ AuthContext (phiên đăng nhập demo, vai trò chọn
  // ở LoginPage). Nguyên tắc 4 mắt áp dụng cho danh tính đang đăng nhập, bất
  // kể vai trò cụ thể là gì (không riêng vai trò "Phê duyệt").
  const { user: currentUser } = useAuth();

  const numId = Number(id);
  const sel = assets.find((a) => a.id === numId) || assets[0];

  const [publishGateOpen, setPublishGateOpen] = useState(false);
  const [ministryAck, setMinistryAck] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadChoice, setDownloadChoice] = useState<'master' | 'web'>('web');
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAdvancedSpecs, setShowAdvancedSpecs] = useState(false);

  const isThreeD = sel.digitalForm === 'mesh3d';
  const digitalFormLabel = DIGITAL_FORM_LABELS[sel.digitalForm];
  const previewLabel =
    sel.digitalForm === 'splat'
      ? '[ xem trước gaussian splat — mở trong trình xem không gian ]'
      : `[ xem trước ${digitalFormLabel.toLowerCase()} — thả bản scan đại diện vào đây ]`;

  // --- C1: dẫn xuất tất định từ nội dung bản ghi (data/digitization.ts) ---
  const files = getFileList(sel);
  const versions = getVersionHistory(sel);
  const originalVersion = versions[0];
  const currentVersion = versions[versions.length - 1];
  const accessLevel = getAccessLevel(sel);
  const rights = getRightsStatement(sel);
  const hasPersonalData = containsPersonalData(sel);
  const signature = getSignatureInfo(sel);
  const reviewPair = getHanNomReviewPair(sel);
  const otherReps = getRepresentationGroup(sel, assets);
  const surrogates = otherReps.filter((r) => r.isPreservationSurrogate);
  const depictions = getDepictionGroup(sel, assets);
  const breadcrumb = getStructuralBreadcrumb(sel);
  const ministryApproval = getMinistryApproval(sel);

  // --- 0sexies: đặc điểm vật lý của đối tượng thật (data/physicalSpecs.ts) ---
  const physSpecs = specsFor(sel.physicalObjectId);
  const specPreset = presetFor(sel.objectClass);
  const specFieldRows = physSpecs
    ? specPreset.fields
        .map((f) => ({ field: f, value: physSpecs.fields[f.key] }))
        .filter((row): row is { field: (typeof specPreset.fields)[number]; value: NonNullable<typeof row.value> } => Boolean(row.value))
    : [];
  const specFieldsMain = specFieldRows.filter((row) => !row.field.advanced);
  const specFieldsAdvanced = specFieldRows.filter((row) => row.field.advanced);
  const specLocationSegments = physSpecs?.location
    ? [physSpecs.location.phanKhu, physSpecs.location.congTrinh, physSpecs.location.viTriCuThe].filter((s): s is string => Boolean(s))
    : [];

  function findAssetByCode(code: string) {
    return assets.find((a) => a.code === code);
  }

  // --- C3: quy trình 9 bước + 2 trạng thái ngoài luồng ---
  const curIdx = PIPELINE_SEQUENCE.indexOf(sel.status);
  const displayIdx = curIdx >= 0 ? curIdx : sel.status === 'Cần số hóa lại' ? PIPELINE_SEQUENCE.indexOf('Đang xử lý') : PIPELINE_SEQUENCE.length - 1;
  const pipelinePct = Math.round(((displayIdx + 1) / PIPELINE_SEQUENCE.length) * 100);
  const actionLabel = advanceActionLabel(sel.status);
  const approvalGateBlocked = isApprovalStep(sel.status) && sel.owner === currentUser.name;

  const meta = [
    { k: 'Mã đối tượng di sản', v: sel.physicalObjectId },
    { k: 'Loại đối tượng', v: OBJECT_CLASS_LABELS[sel.objectClass] },
    { k: 'Dạng dữ liệu', v: digitalFormLabel },
    { k: 'Niên đại', v: sel.era },
    { k: 'Vị trí', v: sel.loc },
    { k: 'Bộ sưu tập', v: sel.coll },
    { k: 'Định dạng', v: sel.fmt },
    { k: 'Dung lượng', v: sel.size },
    { k: 'Cán bộ phụ trách', v: sel.owner },
    { k: 'Cập nhật', v: sel.updated },
    { k: 'Mức truy cập', v: ACCESS_LEVEL_LABELS[accessLevel] },
    { k: 'Giấy phép / quyền', v: `${rights.labelVi} (${rights.code})` },
    { k: 'Số kiểm kê hiện vật gốc', v: sel.soKiemKe ?? formatMissing('KHONG_AP_DUNG') },
    { k: 'Thẻ', v: sel.tags.join(', ') || formatMissing('KHONG_AP_DUNG') },
  ];

  function logAction(action: string, note: string) {
    auditService.record({ user: currentUser.name, action, target: `${sel.code} — ${sel.name}`, note });
  }

  function handlePrimaryAction() {
    if (approvalGateBlocked || !actionLabel) return;
    if (isPublishStep(sel.status)) {
      setPublishGateOpen(true);
      return;
    }
    assetService.advanceStatus(sel.id);
    logAction(actionLabel, `${sel.status} → bước kế tiếp`);
  }

  function handleConfirmPublish() {
    assetService.advanceStatus(sel.id);
    logAction('Xuất bản', 'Đã xác nhận văn bản ý kiến Bộ VHTTDL (NĐ 308/2025/NĐ-CP Điều 87) — Đã duyệt → Xuất bản');
    setPublishGateOpen(false);
    setMinistryAck(false);
  }

  function handleQcFail() {
    assetService.markNeedsRedigitization(sel.id);
    logAction('Kiểm định chất lượng', 'QC không đạt — chuyển "Cần số hóa lại"');
  }

  function handleRevisionConfirm() {
    if (!revisionReason.trim()) return;
    assetService.requestRevision(sel.id, revisionReason);
    logAction('Trả lại bổ sung', revisionReason);
    setRevisionOpen(false);
    setRevisionReason('');
  }

  function handleUnpublishConfirm() {
    if (!unpublishReason.trim()) return;
    assetService.unpublish(sel.id, unpublishReason);
    logAction('Gỡ xuất bản', unpublishReason);
    setUnpublishOpen(false);
    setUnpublishReason('');
  }

  function handleDownloadConfirm() {
    const label = downloadChoice === 'master' ? 'bản gốc' : 'bản tối ưu web';
    logAction('Tải xuống', `Đã tải ${label} — điều kiện sử dụng: ${rights.labelVi} (${rights.code})`);
    setToast(`Đã ghi nhận tải xuống ${label}.`);
    setDownloadOpen(false);
  }

  return (
    <>
      <a onClick={() => navigate('/assets')} className={styles.backLink}>
        ← Dữ liệu số hóa
      </a>
      <div className={styles.headRow}>
        <div className={styles.headTitleWrap}>
          <div className={styles.headMeta}>
            {sel.code} · {digitalFormLabel}
          </div>
          <h2 className={styles.headTitle}>{sel.name}</h2>
          <div className={styles.headMeta} style={{ marginTop: 4 }}>
            {HERITAGE_RANKING.label} ({HERITAGE_RANKING.decision}, {HERITAGE_RANKING.date})
            {sel.unesco && (
              <>
                {' '}
                · {UNESCO_MEMORY_OF_WORLD.label} (khu vực {UNESCO_MEMORY_OF_WORLD.regional.year}, toàn cầu {UNESCO_MEMORY_OF_WORLD.global.year})
              </>
            )}
          </div>
          {(hasPersonalData || signature) && (
            <div className={styles.badgeRow}>
              {hasPersonalData && (
                <span
                  className={styles.badgePersonal}
                  title="Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 — chứa thông tin cá nhân/gia hệ, cần đánh giá nghĩa vụ xử lý dữ liệu cá nhân trước khi công bố/chia sẻ."
                >
                  ⚠ Chứa dữ liệu cá nhân
                </span>
              )}
              {signature && (
                <span
                  className={styles.badgeSigned}
                  title="Luật Giao dịch điện tử 20/2023/QH15 Điều 12–13; NĐ 137/2024/NĐ-CP — chuyển đổi văn bản giấy sang điện tử phải có chữ ký số của cơ quan chuyển đổi."
                >
                  Đã ký số ✓ — {signature.signedBy}, {signature.signedAt}
                </span>
              )}
            </div>
          )}
        </div>
        <StatusPill label={sel.status} colors={statusPill(sel.status)} />
        <button type="button" className={styles.downloadBtn} onClick={() => setDownloadOpen(true)}>
          Tải xuống
        </button>
      </div>

      <div className={styles.mainGrid}>
        <GlassCard style={{ padding: 16 }}>
          {isThreeD ? (
            <>
              <div className={styles.viewerWrap}>
                <StelePreview bg="#f0f5e6" />
              </div>
              <div className={styles.viewerHint}>Bản xem trước rút gọn — mở bản gốc để xem đầy đủ độ phân giải</div>
            </>
          ) : (
            <div className={styles.placeholderPreview}>
              <span className={styles.placeholderLabel}>{previewLabel}</span>
            </div>
          )}
        </GlassCard>

        <div className={styles.sideCol}>
          <GlassCard>
            <h4 className={styles.cardTitle}>Thông tin</h4>
            {meta.map((m) => (
              <div key={m.k} className={styles.metaRow}>
                <span className={styles.metaKey}>{m.k}</span>
                <span className={isMissingDisplay(m.v) ? styles.missing : undefined}>{m.v}</span>
              </div>
            ))}
            <p className={styles.desc}>{sel.desc}</p>
          </GlassCard>

          <GlassCard>
            <h4 className={styles.cardTitle} style={{ marginBottom: 10 }}>
              Quy trình
            </h4>
            <ProgressBar pct={pipelinePct} height={8} color="var(--accent)" />
            <div className={styles.pipelinePct}>{pipelinePct}% quy trình 9 bước</div>

            {PIPELINE_SEQUENCE.map((label, i) => (
              <Fragment key={label}>
                <div
                  className={styles.stepRow}
                  style={{
                    color: i <= displayIdx ? 'var(--ink)' : '#6f6f62',
                    fontWeight: i === displayIdx && curIdx >= 0 ? 700 : 400,
                  }}
                >
                  <span
                    className={styles.stepDot}
                    style={{ background: i < displayIdx ? 'var(--ink)' : i === displayIdx ? 'var(--accent)' : '#e7e7dc' }}
                  />
                  <span>{label}</span>
                </div>
                {label === 'Đã duyệt' && (
                  <div className={styles.gateStepRow}>
                    <span className={styles.gateStepDot}>{ministryApproval.obtained ? '✓' : '⏳'}</span>
                    <span>
                      Xin ý kiến Bộ VHTTDL (NĐ 308/2025/NĐ-CP Điều 87)
                      {ministryApproval.obtained ? (
                        <>
                          {' '}
                          — đã có văn bản số <strong>{ministryApproval.documentNo}</strong>, {ministryApproval.date}
                        </>
                      ) : (
                        <> — chưa có văn bản; bắt buộc trước khi Xuất bản (di tích quốc gia đặc biệt)</>
                      )}
                    </span>
                  </div>
                )}
              </Fragment>
            ))}

            {sel.status === 'Cần số hóa lại' && (
              <div className={styles.branchNote}>⤷ Nhánh Kiểm định chất lượng (QC) không đạt — cần số hóa lại trước khi tiếp tục quy trình.</div>
            )}
            {sel.status === 'Đã gỡ/thu hồi' && (
              <div className={styles.offFlowNote}>Bản ghi đã gỡ khỏi xuất bản/thu hồi — vẫn giữ nguyên trong hệ thống, KHÔNG xoá vĩnh viễn.</div>
            )}
            {reviewPair && (
              <p className={styles.pipelineHint}>
                Song thẩm tư liệu Hán Nôm: người dịch/phiên âm <strong>{reviewPair.translator}</strong> — người thẩm định{' '}
                <strong>{reviewPair.reviewer}</strong> (khác người, theo yêu cầu song thẩm).
              </p>
            )}

            <div className={styles.pipelineActions}>
              {actionLabel && (
                <button type="button" className={styles.actionBtn} disabled={approvalGateBlocked} onClick={handlePrimaryAction}>
                  {actionLabel}
                </button>
              )}
              {sel.status === 'Kiểm định chất lượng' && (
                <button type="button" className={styles.linkBtnDanger} onClick={handleQcFail}>
                  Đánh dấu: Cần số hóa lại
                </button>
              )}
              {REVIEWABLE_STATUSES.includes(sel.status) && (
                <button type="button" className={styles.linkBtn} onClick={() => setRevisionOpen(true)}>
                  Trả lại bổ sung
                </button>
              )}
              {PUBLISHED_STATUSES.includes(sel.status) && (
                <button type="button" className={styles.linkBtnDanger} onClick={() => setUnpublishOpen(true)}>
                  Gỡ xuất bản
                </button>
              )}
            </div>

            {approvalGateBlocked && (
              <p className={styles.gateExplain}>
                Nguyên tắc 4 mắt: bạn (<strong>{currentUser.name}</strong>) là cán bộ phụ trách bản ghi này — không thể tự phê duyệt bản ghi do
                chính mình phụ trách. Cần một người khác thực hiện bước Phê duyệt.
              </p>
            )}
          </GlassCard>
        </div>
      </div>

      <GlassCard dense style={{ marginTop: 22 }}>
        <h4 className={styles.filesTitle}>Đặc điểm vật lý của đối tượng</h4>

        {!physSpecs ? (
          <div className={styles.specEmptyState}>
            <p>Chưa ghi nhận số đo / đặc điểm vật lý cho đối tượng thật (mã {sel.physicalObjectId}).</p>
            <button type="button" className={styles.linkBtn} onClick={() => navigate('/upload')}>
              Ghi nhận số đo
            </button>
          </div>
        ) : (
          <>
            <div className={styles.relationGroupTitle}>Bảng đo</div>
            {physSpecs.measurements.length === 0 ? (
              <p className={styles.pipelineHint}>Chưa có bản ghi đo.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table data-table--tight">
                  <thead>
                    <tr>
                      <th>Chiều đo</th>
                      <th>Bộ phận</th>
                      <th>Trị số</th>
                      <th>Tính chất</th>
                      <th>Phương pháp</th>
                      <th>Nguồn đo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {physSpecs.measurements.map((m, i) => {
                      const src = m.derivedFrom ? findAssetByCode(m.derivedFrom) : undefined;
                      return (
                        <tr key={i}>
                          <td className="nowrap">{DIMENSION_LABELS[m.type]}</td>
                          <td className="muted">{m.part}</td>
                          <td className="strong nowrap">
                            {m.value.toLocaleString('vi-VN')} {m.unit}
                          </td>
                          <td className="nowrap">
                            <span className={m.qualifier === 'chinhXac' ? styles.qualifierChipExact : styles.qualifierChipApprox}>
                              {QUALIFIER_LABELS[m.qualifier]}
                            </span>
                          </td>
                          <td className="nowrap muted">{METHOD_LABELS[m.method]}</td>
                          <td className="nowrap">
                            {m.method === 'quet3D' && m.derivedFrom ? (
                              src ? (
                                <a onClick={() => navigate(`/assets/${src.id}`)} className={styles.surrogateLink}>
                                  {m.derivedFrom}
                                </a>
                              ) : (
                                <span className="mono">{m.derivedFrom}</span>
                              )
                            ) : (
                              <span className={styles.missing}>{formatMissing('KHONG_AP_DUNG')}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {specFieldRows.length > 0 && (
              <div className={styles.relationGroup}>
                <div className={styles.relationGroupTitle}>Trường mô tả riêng ({OBJECT_CLASS_LABELS[sel.objectClass]})</div>
                {specFieldsMain.map(({ field, value }) => (
                  <div key={field.key} className={styles.metaRow}>
                    <span className={styles.metaKey}>{field.label}</span>
                    <span className={'missing' in value ? styles.missing : undefined}>
                      {'missing' in value ? formatMissing(value.missing, value.note) : value.text}
                    </span>
                  </div>
                ))}
                {specFieldsAdvanced.length > 0 && (
                  <>
                    {showAdvancedSpecs &&
                      specFieldsAdvanced.map(({ field, value }) => (
                        <div key={field.key} className={styles.metaRow}>
                          <span className={styles.metaKey}>{field.label}</span>
                          <span className={'missing' in value ? styles.missing : undefined}>
                            {'missing' in value ? formatMissing(value.missing, value.note) : value.text}
                          </span>
                        </div>
                      ))}
                    <button type="button" className={styles.linkBtn} style={{ marginTop: 10 }} onClick={() => setShowAdvancedSpecs((v) => !v)}>
                      {showAdvancedSpecs ? 'Thu gọn' : `Hiện đầy đủ (+${specFieldsAdvanced.length})`}
                    </button>
                  </>
                )}
              </div>
            )}

            {physSpecs.location && (
              <div className={styles.relationGroup}>
                <div className={styles.relationGroupTitle}>Vị trí</div>
                <div className={styles.breadcrumb}>
                  {specLocationSegments.map((seg, i) => (
                    <span key={i}>
                      {i > 0 && <span className={styles.breadcrumbSep}>›</span>}
                      <span className={i === specLocationSegments.length - 1 ? styles.breadcrumbCurrent : undefined}>{seg}</span>
                    </span>
                  ))}
                </div>
                {(physSpecs.location.wgs84 || physSpecs.location.vn2000 || physSpecs.location.caoDo != null) && (
                  <p className={styles.derivedFromNote}>
                    {physSpecs.location.wgs84 && (
                      <>
                        WGS84: {physSpecs.location.wgs84.lat.toFixed(4)}, {physSpecs.location.wgs84.lng.toFixed(4)}
                      </>
                    )}
                    {physSpecs.location.vn2000 && (
                      <> · VN-2000: {physSpecs.location.vn2000.x}, {physSpecs.location.vn2000.y}</>
                    )}
                    {physSpecs.location.caoDo != null && <> · Cao độ {physSpecs.location.caoDo} m</>}
                  </p>
                )}
              </div>
            )}

            {physSpecs.conservation && (
              <div className={styles.relationGroup}>
                <div className={styles.relationGroupTitle}>Điều kiện bảo quản</div>
                <div className={styles.conservationGrid}>
                  {physSpecs.conservation.nhietDoC && (
                    <span>
                      Nhiệt độ {physSpecs.conservation.nhietDoC[0]}–{physSpecs.conservation.nhietDoC[1]}°C
                    </span>
                  )}
                  {physSpecs.conservation.doAmPercent && (
                    <span>
                      Độ ẩm {physSpecs.conservation.doAmPercent[0]}–{physSpecs.conservation.doAmPercent[1]}%
                    </span>
                  )}
                  {physSpecs.conservation.anhSangLux != null && <span>Ánh sáng tối đa {physSpecs.conservation.anhSangLux} lux</span>}
                </div>
                {physSpecs.conservation.yeuCauDacThu && <p className={styles.derivedFromNote}>{physSpecs.conservation.yeuCauDacThu}</p>}
              </div>
            )}
          </>
        )}
      </GlassCard>

      <GlassCard dense style={{ marginTop: 22 }}>
        <div className={styles.sectionHeadRow}>
          <h4 className={styles.filesTitle}>Phiên bản</h4>
          {versions.length > 1 && (
            <button type="button" className={styles.compareBtn} onClick={() => setCompareOpen(true)}>
              So sánh {originalVersion.label} ↔ {currentVersion.label}
            </button>
          )}
        </div>
        <div className="table-scroll">
          <table className="data-table data-table--tight">
            <thead>
              <tr>
                <th>Phiên bản</th>
                <th>Người tạo</th>
                <th>Thời điểm</th>
                <th>Lý do</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.versionNo}>
                  <td className="strong nowrap">
                    {v.label}
                    {v.isOriginal && <span className={styles.originalBadge}>Bản gốc — bất biến, không ghi đè</span>}
                    {v.isCurrent && !v.isOriginal && <span className={styles.currentBadge}>Hiện hành</span>}
                  </td>
                  <td className="nowrap">{v.createdBy}</td>
                  <td className="nowrap muted">{v.createdAt}</td>
                  <td className={v.changeReason ? undefined : styles.missing}>{v.changeReason ?? formatMissing('KHONG_AP_DUNG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {(otherReps.length > 0 || depictions.length > 0 || breadcrumb) && (
        <GlassCard dense style={{ marginTop: 22 }}>
          <h4 className={styles.filesTitle}>Quan hệ</h4>

          {otherReps.length > 0 && (
            <div className={styles.relationGroup}>
              <div className={styles.relationGroupTitle}>Bản đại diện số của cùng đối tượng ({sel.physicalObjectId})</div>
              <div className="table-scroll">
                <table className="data-table data-table--tight">
                  <tbody>
                    {otherReps.map((r) => (
                      <tr key={r.asset.id} className="clickable" onClick={() => navigate(`/assets/${r.asset.id}`)}>
                        <td className="strong nowrap">{r.asset.code}</td>
                        <td>{r.asset.name}</td>
                        <td className="nowrap muted">{r.relationLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {surrogates.length > 0 && (
            <div className={styles.relationGroup}>
              <div className={styles.relationGroupTitle}>Bản dẫn xuất bảo quản (hasPreservationSurrogate)</div>
              <div className={styles.surrogateBox}>
                {surrogates.map((r) => (
                  <p key={r.asset.id} className={styles.surrogateEntry}>
                    <a onClick={() => navigate(`/assets/${r.asset.id}`)} className={styles.surrogateLink}>
                      {r.asset.code} — {r.asset.name}
                    </a>
                    {' — '}
                    {r.surrogateNote}
                  </p>
                ))}
              </div>
            </div>
          )}

          {depictions.length > 0 && (
            <div className={styles.relationGroup}>
              <div className={styles.relationGroupTitle}>Xuất hiện trong tư liệu khác</div>
              <div className="table-scroll">
                <table className="data-table data-table--tight">
                  <tbody>
                    {depictions.map((d) => (
                      <tr key={d.asset.id} className="clickable" onClick={() => navigate(`/assets/${d.asset.id}`)}>
                        <td className="strong nowrap">{d.asset.code}</td>
                        <td>{d.asset.name}</td>
                        <td className="nowrap muted">{d.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {breadcrumb && (
            <div className={styles.relationGroup}>
              <div className={styles.relationGroupTitle}>Cấu trúc (partOf)</div>
              <div className={styles.breadcrumb}>
                {breadcrumb.map((b, i) => (
                  <span key={i}>
                    {i > 0 && <span className={styles.breadcrumbSep}>›</span>}
                    <span className={i === breadcrumb.length - 1 ? styles.breadcrumbCurrent : undefined}>{b}</span>
                  </span>
                ))}
              </div>
              <p className={styles.derivedFromNote}>
                Bản tối ưu web (#web) dẫn xuất kỹ thuật từ bản gốc (#master — derivedFrom) — có thể xoá và tái tạo tự do, xem bảng Tệp tin bên dưới.
              </p>
            </div>
          )}
        </GlassCard>
      )}

      <GlassCard dense style={{ marginTop: 22 }}>
        <h4 className={styles.filesTitle}>Tệp tin</h4>
        <div className="table-scroll">
          <table className="data-table data-table--tight">
            <thead>
              <tr>
                <th>Tệp</th>
                <th>Loại</th>
                <th>Dung lượng</th>
                <th>Checksum SHA-256</th>
                <th>Toàn vẹn</th>
                <th>Kiểm tra gần nhất</th>
                <th>Tầng lưu trữ</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.name}>
                  <td className="mono">{f.name}</td>
                  <td className="nowrap muted">{f.kindLabel}</td>
                  <td className={isMissingDisplay(f.size) ? `nowrap strong ${styles.missing}` : 'nowrap strong'}>{f.size}</td>
                  <td className="mono nowrap" title={f.checksum}>
                    {f.checksumShort}
                  </td>
                  <td className={f.fixityStatus === 'DA_XAC_MINH' ? `nowrap ${styles.fixityOk}` : `nowrap ${styles.fixityWarn}`}>
                    {FIXITY_LABELS[f.fixityStatus]}
                  </td>
                  <td className={f.fixityCheckedAt ? 'nowrap muted' : `nowrap ${styles.missing}`}>
                    {f.fixityCheckedAt ?? formatMissing('CHUA_XAC_DINH')}
                  </td>
                  <td className="nowrap muted">{STORAGE_TIER_LABELS[f.storageTier]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {downloadOpen && (
        <Modal onClose={() => setDownloadOpen(false)}>
          <h3 className={styles.modalTitle}>Tải xuống — {sel.code}</h3>
          <p className={styles.modalSub}>{sel.name}</p>

          <label className={styles.downloadOption}>
            <input type="radio" name="dl-choice" checked={downloadChoice === 'web'} onChange={() => setDownloadChoice('web')} />
            Bản tối ưu web ({files.find((f) => f.role === 'web')?.size})
          </label>
          <label className={styles.downloadOption} style={canDownloadMaster(sel) ? undefined : { opacity: 0.5 }}>
            <input
              type="radio"
              name="dl-choice"
              disabled={!canDownloadMaster(sel)}
              checked={downloadChoice === 'master'}
              onChange={() => setDownloadChoice('master')}
            />
            Bản gốc — bất biến ({files.find((f) => f.role === 'master')?.size})
          </label>
          {!canDownloadMaster(sel) && (
            <p className={styles.gateExplain}>Bản gốc chỉ được tải sau khi Xuất bản — bản ghi này hiện ở trạng thái "{sel.status}".</p>
          )}

          <div className={styles.usageBox}>
            <strong>
              {rights.labelVi} ({rights.code})
            </strong>{' '}
            · Mức truy cập: {ACCESS_LEVEL_LABELS[accessLevel]}
            <p>{rights.note}</p>
          </div>

          <div className={styles.modalFooterRight}>
            <button type="button" className={styles.downloadBtn} onClick={() => setDownloadOpen(false)}>
              Hủy
            </button>
            <button type="button" className={styles.actionBtn} onClick={handleDownloadConfirm}>
              Tải xuống
            </button>
          </div>
        </Modal>
      )}

      {compareOpen && (
        <Modal onClose={() => setCompareOpen(false)}>
          <h3 className={styles.modalTitle}>
            So sánh {originalVersion.label} ↔ {currentVersion.label}
          </h3>
          <p className={styles.modalSub}>
            {sel.code} — {sel.name}
          </p>
          <ul className={styles.diffList}>
            {compareVersions(sel, originalVersion, currentVersion).map((line, i) => (
              <li key={i} className={line.sign === '+' ? styles.diffPlus : line.sign === '-' ? styles.diffMinus : styles.diffNeutral}>
                <span className={styles.diffSign}>{line.sign}</span> {line.label}: <strong>{line.value}</strong>
              </li>
            ))}
          </ul>
          <div className={styles.modalFooterRight}>
            <button type="button" className={styles.actionBtn} onClick={() => setCompareOpen(false)}>
              Đóng
            </button>
          </div>
        </Modal>
      )}

      {revisionOpen && (
        <ConfirmModal
          title="Trả lại bổ sung"
          message={`Trả lại "${sel.code} — ${sel.name}" để bổ sung/chỉnh sửa. Vui lòng nhập lý do — bắt buộc.`}
          confirmLabel="Trả lại bổ sung"
          confirmDisabled={!revisionReason.trim()}
          onConfirm={handleRevisionConfirm}
          onCancel={() => {
            setRevisionOpen(false);
            setRevisionReason('');
          }}
        >
          <label className={styles.formLabel}>Lý do trả lại (bắt buộc)</label>
          <textarea
            value={revisionReason}
            onChange={(e) => setRevisionReason(e.target.value)}
            className={styles.textArea}
            placeholder="Ví dụ: thiếu bản dịch nghĩa, ảnh mờ vùng minh văn…"
          />
        </ConfirmModal>
      )}

      {unpublishOpen && (
        <ConfirmModal
          title="Gỡ xuất bản"
          tone="danger"
          message={`Gỡ xuất bản "${sel.code} — ${sel.name}" sẽ ẩn khỏi công bố ngay lập tức. Bản ghi VẪN ĐƯỢC GIỮ trong hệ thống, không xoá vĩnh viễn. Vui lòng nhập lý do — bắt buộc.`}
          confirmLabel="Gỡ xuất bản"
          confirmDisabled={!unpublishReason.trim()}
          onConfirm={handleUnpublishConfirm}
          onCancel={() => {
            setUnpublishOpen(false);
            setUnpublishReason('');
          }}
        >
          <label className={styles.formLabel}>Lý do gỡ xuất bản (bắt buộc)</label>
          <textarea
            value={unpublishReason}
            onChange={(e) => setUnpublishReason(e.target.value)}
            className={styles.textArea}
            placeholder="Ví dụ: phát hiện sai lệch nội dung, yêu cầu thu hồi từ Trung tâm…"
          />
        </ConfirmModal>
      )}

      {publishGateOpen && (
        <ConfirmModal
          title="Xuất bản — di tích quốc gia đặc biệt"
          message={`${HERITAGE_RANKING.label} (${HERITAGE_RANKING.decision}) — theo NĐ 308/2025/NĐ-CP Điều 87, chuyển đổi văn bản giấy sang điện tử với di tích quốc gia đặc biệt cần ý kiến bằng văn bản của Bộ Văn hóa, Thể thao và Du lịch trước khi xuất bản.`}
          confirmLabel="Xác nhận — Xuất bản"
          confirmDisabled={!ministryAck}
          onConfirm={handleConfirmPublish}
          onCancel={() => {
            setPublishGateOpen(false);
            setMinistryAck(false);
          }}
        >
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={ministryAck} onChange={(e) => setMinistryAck(e.target.checked)} />
            Đã có văn bản ý kiến của Bộ VHTTDL cho bản ghi này
          </label>
        </ConfirmModal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
