import { useState } from 'react';
import type { MissingReason } from '../data/missingValues';
import { MISSING_LABELS, formatMissing } from '../data/missingValues';
import { useT } from '../i18n';
import styles from './MissingValueField.module.css';

export interface FieldState {
  text: string;
  reason: MissingReason | null;
  note: string;
}

export const EMPTY_FIELD: FieldState = { text: '', reason: null, note: '' };

/** Quick-pick codes offered on every field (0quinquies) — `CHUA_NHAP` is an
 * automatic sentinel (batch blank-cell auto-fill), never a manual choice here. */
const QUICK_REASONS: MissingReason[] = ['CHUA_XAC_DINH', 'KHONG_RO', 'KHONG_AP_DUNG', 'HAN_CHE'];

const QUICK_SHORT: Record<MissingReason, string> = {
  CHUA_XAC_DINH: 'Chưa XĐ',
  KHONG_RO: 'Không rõ',
  KHONG_AP_DUNG: 'N/A',
  HAN_CHE: 'Hạn chế',
  CHUA_NHAP: 'Chưa nhập',
};

/** True when this reason legally requires a "ghi chú nguồn" (source note) before the record can queue. */
function reasonNeedsNote(reason: MissingReason | null): boolean {
  return reason === 'CHUA_XAC_DINH' || reason === 'KHONG_RO';
}

/** Used by the parent form to gate "Thêm vào hàng đợi" / "Nhập N bản ghi". */
export function fieldBlocksSubmit(f: FieldState): boolean {
  return reasonNeedsNote(f.reason) && f.note.trim().length === 0;
}

interface MissingValueFieldProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  value: FieldState;
  onChange: (next: FieldState) => void;
}

/** C2 — every metadata field carries an explicit missing-value code instead
 * of being left blank. Picking Chưa xác định/Không rõ requires a source note
 * (`ghi chú nguồn`) before the record is allowed into the queue. */
export default function MissingValueField({ label, placeholder, required, multiline, value, onChange }: MissingValueFieldProps) {
  const { t } = useT();
  const [touched, setTouched] = useState(false);
  const blocked = fieldBlocksSubmit(value);

  const setReason = (reason: MissingReason) => onChange({ ...value, reason: value.reason === reason ? null : reason, text: '' });

  return (
    <div>
      <div className={styles.headRow}>
        <label className={styles.label}>
          {label}
          {required && <span className={styles.req}>*</span>}
        </label>
        <div className={styles.quickRow}>
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              title={MISSING_LABELS[r]}
              aria-label={`${t('upload.missing.quickLabel')} — ${MISSING_LABELS[r]}`}
              aria-pressed={value.reason === r}
              className={value.reason === r ? `${styles.quickBtn} ${styles.quickBtnActive}` : styles.quickBtn}
              onClick={() => setReason(r)}
            >
              {QUICK_SHORT[r]}
            </button>
          ))}
        </div>
      </div>

      {value.reason ? (
        <div className={styles.missingValue}>{formatMissing(value.reason)}</div>
      ) : multiline ? (
        <textarea
          placeholder={placeholder}
          className={styles.textArea}
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
        />
      ) : (
        <input
          placeholder={placeholder}
          className={styles.textInput}
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
        />
      )}

      {reasonNeedsNote(value.reason) && (
        <div className={styles.noteWrap}>
          <input
            placeholder={t('upload.missing.notePlaceholder')}
            aria-label={t('upload.missing.noteLabel')}
            className={blocked && touched ? `${styles.noteInput} ${styles.noteInputError}` : styles.noteInput}
            value={value.note}
            onBlur={() => setTouched(true)}
            onChange={(e) => onChange({ ...value, note: e.target.value })}
          />
          {blocked && touched && <div className={styles.noteError}>{t('upload.missing.noteRequired')}</div>}
        </div>
      )}
    </div>
  );
}
