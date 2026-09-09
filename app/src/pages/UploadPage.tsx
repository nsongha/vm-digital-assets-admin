import { useEffect, useRef, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import CoreMetadataForm from '../components/CoreMetadataForm';
import GlassCard from '../components/GlassCard';
import PhysicalSpecsForm from '../components/PhysicalSpecsForm';
import StatusPill from '../components/StatusPill';
import TagChip from '../components/TagChip';
import { batchRowPill, uploadState } from '../components/statusColors';
import { useT } from '../i18n';
import { DEFAULT_QUOTA_GB } from '../data/dashboard';
import { ACCEPT_FORMATS, ACCEPT_LIMIT, UPLOAD_COLLECTION_OPTIONS, UPLOAD_TAG_OPTIONS, UPLOAD_TYPES } from '../data/metadataFields';
import { MISSING_LABELS } from '../data/missingValues';
import { totalSizeGB } from '../data/selectors';
import { DIGITAL_FORM_LABELS, OBJECT_CLASS_LABELS, OBJECT_CLASS_ORDER } from '../data/taxonomy';
import { assetStore } from '../services/mock/assetService';
import { uploadService, uploadStore } from '../services/mock/uploadService';
import { useStore } from '../services/useStore';
import type { BatchRow, ObjectClass, UploadDataType, UploadItem } from '../services/types';
import styles from './UploadPage.module.css';

// C4 — checksum SHA-256 giả lập (hash thật của chuỗi id:tên:kích thước, vì
// không có nội dung tệp thật trong mock) — đúng định dạng 64 ký tự hex.
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function truncateHash(hex: string): string {
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`;
}

/** "3,1 GB" / "240 MB" / "—" → số GB, để cộng vào dung lượng đang tải cho cảnh báo hạn mức. */
function parseSizeToGB(size: string): number {
  const m = size.trim().match(/^([\d.,]+)\s*(GB|MB)$/i);
  if (!m) return 0;
  const num = parseFloat(m[1].replace(',', '.'));
  if (Number.isNaN(num)) return 0;
  return m[2].toUpperCase() === 'GB' ? num : num / 1024;
}

export default function UploadPage() {
  const { t } = useT();
  const uploads = useStore(uploadStore);
  const assets = useStore(assetStore);

  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [upType, setUpType] = useState<UploadDataType>('Scan 3D');
  const [objectClass, setObjectClass] = useState<ObjectClass>('artifact');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [upColl, setUpColl] = useState('Bia Tiến sĩ');
  const [upTags, setUpTags] = useState<string[]>([]);
  const [coreBlocked, setCoreBlocked] = useState(false);
  const [physicalBlocked, setPhysicalBlocked] = useState(false);

  const [batchFileCount, setBatchFileCount] = useState(0);
  const [batchParsed, setBatchParsed] = useState(false);
  const [batchRows, setBatchRows] = useState<BatchRow[]>([]);
  const [pendingImport, setPendingImport] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<UploadItem | null>(null);

  // C4 — checksum tính bất đồng bộ cho từng tệp mới trong hàng đợi, nhớ id
  // đã yêu cầu để không tính lại khi component re-render.
  const [checksums, setChecksums] = useState<Record<string, string>>({});
  const requestedChecksums = useRef<Set<string>>(new Set());
  useEffect(() => {
    uploads.forEach((u) => {
      const key = String(u.id);
      if (requestedChecksums.current.has(key)) return;
      requestedChecksums.current.add(key);
      sha256Hex(`${u.id}:${u.name}:${u.size}`).then((hex) => {
        setChecksums((prev) => ({ ...prev, [key]: hex }));
      });
    });
  }, [uploads]);

  const toggleUpTag = (tag: string) => setUpTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));

  const addBatchFiles = () => setBatchFileCount((n) => n + 3 + Math.floor(Math.random() * 4));

  const parseBatchExcel = () => {
    setBatchParsed(true);
    setBatchRows(uploadService.parseBatch());
  };

  const resetBatch = () => {
    setBatchFileCount(0);
    setBatchParsed(false);
    setBatchRows([]);
  };

  const confirmBatch = () => {
    uploadService.confirmBatch(batchRows);
    resetBatch();
  };

  const matchedCount = batchRows.filter((r) => r.matched).length;
  const unmatchedCount = batchRows.filter((r) => !r.matched).length;
  // Bảng Excel mock cố định không có ô trống thật — số ô tự gán CHUA_NHAP mô
  // phỏng theo quy mô bảng để minh hoạ hành vi 0quinquies mục 6.
  const autoFilledCells = Math.max(1, Math.floor(batchRows.length / 3));

  // C4 — >20 bản ghi cùng lúc phải xác nhận lại trước khi nhập.
  const requestConfirmBatch = () => {
    if (matchedCount > 20) setPendingImport(true);
    else confirmBatch();
  };

  // C4 — xoá tệp đã tải ≥50% phải xác nhận (sẽ mất phần đã tải).
  const requestRemove = (u: UploadItem) => {
    if (u.pct >= 50 && !u.error) setRemoveTarget(u);
    else uploadService.cancel(u.id);
  };

  // C4 — cảnh báo khi dung lượng đã dùng + đang tải vượt 90% hạn mức (A2:
  // derive từ nguồn ASSETS duy nhất, cùng nguồn với Tổng quan).
  const usedGB = totalSizeGB(assets);
  const queueGB = uploads.reduce((sum, u) => sum + parseSizeToGB(u.size), 0);
  const combinedGB = usedGB + queueGB;
  const quotaPct = Math.round((combinedGB / DEFAULT_QUOTA_GB) * 100);
  const formBlocked = coreBlocked || physicalBlocked;

  const queueSummary = [
    t('upload.queueSummaryFiles', { n: uploads.length }),
    t('upload.queueSummaryUploading', { n: uploads.filter((u) => !u.error && u.pct < 100).length }),
    t('upload.queueSummaryPending', { n: uploads.filter((u) => !u.error && u.pct >= 100).length }),
    t('upload.queueSummaryError', { n: uploads.filter((u) => u.error).length }),
  ].join(' · ');

  return (
    <>
      {quotaPct >= 90 && (
        <div className={styles.quotaWarning}>
          {t('upload.storageWarning', { pct: quotaPct, used: `${combinedGB.toFixed(1)} GB`, quota: `${DEFAULT_QUOTA_GB} GB` })}
        </div>
      )}
      <div className={styles.modeSwitch}>
        <a
          onClick={() => setMode('single')}
          className={styles.modeChip}
          style={{ background: mode === 'single' ? 'var(--ink)' : 'transparent', color: mode === 'single' ? '#ffffff' : 'var(--accent-text)' }}
        >
          {t('upload.modeSingle')}
        </a>
        <a
          onClick={() => setMode('batch')}
          className={styles.modeChip}
          style={{ background: mode === 'batch' ? 'var(--ink)' : 'transparent', color: mode === 'batch' ? '#ffffff' : 'var(--accent-text)' }}
        >
          {t('upload.modeBatch')}
        </a>
      </div>

      {mode === 'single' && (
        <div className={styles.singleGrid}>
          <div className={styles.dropzone} onClick={() => uploadService.addUpload()}>
            <div className={styles.dropIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M8 8l4-4 4 4" />
                <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
              </svg>
            </div>
            <h3 className={styles.dropTitle}>{t('upload.dropzoneTitle')}</h3>
            <p className={styles.dropDesc}>{t('upload.dropzoneDesc')}</p>
            <span className={styles.dropBtn}>{t('upload.browseBtn')}</span>
            <div className={styles.dropFormats}>
              <div className={styles.formatChips}>
                {(ACCEPT_FORMATS[upType] || []).map((f) => (
                  <span key={f} className={styles.formatChip}>
                    {f}
                  </span>
                ))}
              </div>
              <span className={styles.formatLimit}>{ACCEPT_LIMIT[upType] || ''}</span>
            </div>
          </div>

          <GlassCard className={styles.formCard}>
            <div>
              <label className={styles.formLabel}>{t('upload.objectClassLabel')}</label>
              <div className={styles.chipRow}>
                {OBJECT_CLASS_ORDER.map((oc) => (
                  <TagChip key={oc} label={OBJECT_CLASS_LABELS[oc]} active={objectClass === oc} inactiveBg="#f2f1e9" dense padding="7px 14px" onClick={() => setObjectClass(oc)} />
                ))}
              </div>
            </div>
            <div>
              <label className={styles.formLabel}>{t('upload.typeLabel')}</label>
              <div className={styles.chipRow}>
                {UPLOAD_TYPES.map((ut) => (
                  <TagChip key={ut} label={ut} active={upType === ut} inactiveBg="#f2f1e9" dense padding="7px 14px" onClick={() => setUpType(ut)} />
                ))}
              </div>
            </div>
            <div className={styles.sectionHeadRow}>
              <h4 className={styles.formSectionTitle}>{t('upload.metadataSectionTitle', { type: OBJECT_CLASS_LABELS[objectClass] })}</h4>
              <button type="button" className={styles.advancedToggle} onClick={() => setShowAdvanced((v) => !v)}>
                {showAdvanced ? t('upload.hideAdvancedBtn') : t('upload.showAdvancedBtn')}
              </button>
            </div>
            <CoreMetadataForm objectClass={objectClass} showAdvanced={showAdvanced} onBlockedChange={setCoreBlocked} />
            <div>
              <label className={styles.formLabel}>{t('upload.collectionLabel')}</label>
              <div className={styles.chipRow}>
                {UPLOAD_COLLECTION_OPTIONS.map((c) => (
                  <TagChip key={c} label={c} active={upColl === c} inactiveBg="#f2f1e9" dense padding="7px 14px" onClick={() => setUpColl(c)} />
                ))}
              </div>
            </div>
            <div>
              <label className={styles.formLabel}>{t('upload.tagsLabel')}</label>
              <div className={styles.chipRow}>
                {UPLOAD_TAG_OPTIONS.map((tag) => (
                  <TagChip
                    key={tag}
                    label={tag}
                    active={upTags.includes(tag)}
                    activeBg="var(--accent-soft)"
                    activeFg="var(--accent-text)"
                    inactiveBg="#f2f1e9"
                    dense
                    onClick={() => toggleUpTag(tag)}
                  />
                ))}
              </div>
              <p className={styles.tagsNote}>{t('upload.tagsControlledNote')}</p>
            </div>
            <div className={styles.formFooter}>
              <button type="button" className={styles.primaryBtn} disabled={formBlocked} onClick={() => uploadService.addUpload()}>
                {t('upload.addToQueueBtn')}
              </button>
              <span className={formBlocked ? styles.footerHintBlocked : styles.footerHint}>
                {formBlocked ? t('upload.formBlockedHint') : t('upload.footerHint')}
              </span>
            </div>
          </GlassCard>
        </div>
      )}

      {mode === 'single' && (
        <GlassCard className={styles.physicalCard} style={{ marginTop: 22 }}>
          <h4 className={styles.cardTitle}>{t('upload.physical.sectionTitle')}</h4>
          <p className={styles.physicalDesc}>{t('upload.physical.sectionDesc')}</p>
          <PhysicalSpecsForm objectClass={objectClass} showAdvanced={showAdvanced} assets={assets} onBlockedChange={setPhysicalBlocked} />
        </GlassCard>
      )}

      {mode === 'batch' && (
        <>
          <div className={styles.singleGrid}>
            <div className={styles.dropzoneSm} onClick={addBatchFiles}>
              <div className={styles.dropIconSm}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V6z" />
                  <path d="M15 2v4h4" />
                  <path d="M3 8v12a2 2 0 0 0 2 2h10" />
                </svg>
              </div>
              <h3 className={styles.dropTitleSm}>{t('upload.batchFilesTitle')}</h3>
              <p className={styles.dropDescSm}>{t('upload.batchFilesDesc')}</p>
              <span className={styles.dropBtnSm}>{t('upload.batchFilesBtn')}</span>
              {batchFileCount > 0 && <div className={styles.batchFileCount}>{t('upload.batchFileCount', { n: batchFileCount })}</div>}
            </div>
            <div className={styles.dropzoneSm} onClick={parseBatchExcel}>
              <div className={styles.dropIconSm}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
              </div>
              <h3 className={styles.dropTitleSm}>{t('upload.batchExcelTitle')}</h3>
              <p className={styles.dropDescSm}>{t('upload.batchExcelDesc')}</p>
              <span className={styles.dropBtnSm}>{t('upload.batchExcelBtn')}</span>
              <span className={styles.templateLink}>{t('upload.batchTemplateLink')}</span>
            </div>
          </div>

          {batchParsed && (
            <GlassCard dense style={{ marginTop: 22 }}>
              <div className={styles.batchHead}>
                <h4 className={styles.cardTitle}>{t('upload.previewTitle')}</h4>
                <div className={styles.batchCounts}>
                  <span className={styles.batchCountMatched}>{t('upload.previewMatched', { n: matchedCount })}</span>
                  <span className={styles.batchCountUnmatched}>{t('upload.previewUnmatched', { n: unmatchedCount })}</span>
                  <span className={styles.batchCountTotal}>{t('upload.previewTotal', { n: batchRows.length })}</span>
                </div>
              </div>
              <div className={styles.batchSecurityRow}>
                <span className={styles.scanBadge}>{t('upload.malwareScanned')}</span>
                <span className={styles.formulaNote}>{t('upload.formulaDisabled')}</span>
              </div>
              <p className={styles.autoFilledNote}>{t('upload.autoFilledCells', { n: autoFilledCells, label: MISSING_LABELS.CHUA_NHAP })}</p>
              <div className="table-scroll">
                <table className="data-table data-table--tight">
                  <thead>
                    <tr>
                      <th>{t('upload.colCode')}</th>
                      <th>{t('upload.colName')}</th>
                      <th>{t('upload.colForm')}</th>
                      <th>{t('upload.colEra')}</th>
                      <th>{t('upload.colLoc')}</th>
                      <th>{t('upload.colFile')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchRows.map((r) => {
                      const pill = batchRowPill(r.matched);
                      return (
                        <tr key={r.code}>
                          <td className="strong nowrap">{r.code}</td>
                          <td>{r.name}</td>
                          <td className="nowrap">{DIGITAL_FORM_LABELS[r.digitalForm]}</td>
                          <td className="nowrap muted">{r.era}</td>
                          <td className="muted">{r.loc}</td>
                          <td>
                            <StatusPill label={pill.label} colors={[pill.bg, pill.fg]} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className={styles.batchFooter}>
                {unmatchedCount > 0 && <span className={styles.mutedText}>{t('upload.unmatchedHint')}</span>}
                <div className={styles.batchFooterActions}>
                  <button type="button" className={styles.secondaryBtn} onClick={resetBatch}>
                    {t('common.cancel')}
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={requestConfirmBatch}>
                    {t('upload.importBtn', { n: matchedCount })}
                  </button>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      )}

      <GlassCard dense style={{ marginTop: 22 }}>
        <div className={styles.queueHead}>
          <h4 className={styles.cardTitle}>{t('upload.queueTitle')}</h4>
          <span className={styles.mutedText}>{queueSummary}</span>
        </div>
        <div className="table-scroll">
          <table className="data-table data-table--tight">
            <tbody>
              {uploads.map((u) => {
                const st = uploadState(u);
                const hash = checksums[String(u.id)];
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="mono">{u.name}</div>
                      {u.error && <div className={styles.uploadNote}>{u.error}</div>}
                      {hash && (
                        <div className={styles.checksumLine} title={hash}>
                          {t('upload.checksumLabel')}: {truncateHash(hash)}
                        </div>
                      )}
                    </td>
                    <td className="nowrap muted" style={{ width: 90 }}>
                      {u.size}
                    </td>
                    <td style={{ width: 200 }}>
                      <div className={styles.uploadBarTrack}>
                        <div className={styles.uploadBarFill} style={{ width: `${u.pct}%`, background: st.barFg }} />
                      </div>
                    </td>
                    <td className="strong" style={{ width: 52, textAlign: 'right' }}>
                      {u.pct}%
                    </td>
                    <td style={{ width: 110 }}>
                      <StatusPill label={st.state} colors={[st.bg, st.fg]} />
                    </td>
                    <td style={{ width: 44, textAlign: 'right' }}>
                      <button type="button" title={t('upload.removeBtn')} className={styles.cancelBtn} onClick={() => requestRemove(u)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {pendingImport && (
        <ConfirmModal
          title={t('upload.importConfirmTitle', { n: matchedCount })}
          message={t('upload.importConfirmMessage', { n: matchedCount })}
          confirmLabel={t('upload.importBtn', { n: matchedCount })}
          onConfirm={() => {
            confirmBatch();
            setPendingImport(false);
          }}
          onCancel={() => setPendingImport(false)}
        />
      )}

      {removeTarget && (
        <ConfirmModal
          title={t('upload.removeConfirmTitle')}
          tone="danger"
          message={t('upload.removeConfirmMessage', { pct: removeTarget.pct })}
          confirmLabel={t('upload.removeConfirmBtn')}
          onConfirm={() => {
            uploadService.cancel(removeTarget.id);
            setRemoveTarget(null);
          }}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </>
  );
}
