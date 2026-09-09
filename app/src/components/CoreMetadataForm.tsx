import { useEffect, useState } from 'react';
import MissingValueField, { EMPTY_FIELD, fieldBlocksSubmit } from './MissingValueField';
import type { FieldState } from './MissingValueField';
import { useT } from '../i18n';
import type { TranslationKey } from '../i18n';
import type { ObjectClass } from '../services/types';
import styles from './CoreMetadataForm.module.css';

// C2 — bộ trường metadata lõi (DC rút gọn + niên đại 2 lớp + số kiểm kê +
// mức truy cập + cờ dữ liệu cá nhân), đổi theo `objectClass` thay vì theo
// dạng tệp như bản cũ. Khối Hán Nôm chỉ hiện với `document`. Tự quản lý
// state nội bộ (form mock chưa đấu vào service nào), chỉ báo lên cha có
// đang bị chặn nộp hay không qua `onBlockedChange`.

type EraCertainty = 'certain' | 'uncertain' | 'approximate' | 'century' | 'range' | 'unknown';

const ERA_CERTAINTY: EraCertainty[] = ['certain', 'uncertain', 'approximate', 'century', 'range', 'unknown'];

const ERA_CERTAINTY_KEY: Record<EraCertainty, TranslationKey> = {
  certain: 'upload.eraCertainCertain',
  uncertain: 'upload.eraCertainUncertain',
  approximate: 'upload.eraCertainApprox',
  century: 'upload.eraCertainCentury',
  range: 'upload.eraCertainRange',
  unknown: 'upload.eraCertainUnknown',
};

type AccessLevel = 'public' | 'research' | 'internal';

const ACCESS_LEVELS: AccessLevel[] = ['public', 'research', 'internal'];

const ACCESS_LEVEL_KEY: Record<AccessLevel, TranslationKey> = {
  public: 'upload.accessPublic',
  research: 'upload.accessResearch',
  internal: 'upload.accessInternal',
};

/** Chấp nhận đúng các dạng nêu ở 0quinquies mục 3: 1484 · 1484? · 1484~ · 18XX · 1740/1786 · unknown. */
function isValidEdtf(raw: string): boolean {
  const year = String.raw`\d{1,4}X{0,2}[?~]?`;
  return new RegExp(`^(unknown|${year}|${year}/${year})$`, 'i').test(raw.trim());
}

/** Trường bắt buộc còn trống trắng (không giá trị lẫn mã khuyết) cũng chặn nộp — 0quinquies mục 1. */
function blocks(f: FieldState, required = false): boolean {
  return fieldBlocksSubmit(f) || (required && !f.reason && f.text.trim() === '');
}

interface CoreMetadataFormProps {
  objectClass: ObjectClass;
  showAdvanced: boolean;
  onBlockedChange: (blocked: boolean) => void;
}

export default function CoreMetadataForm({ objectClass, showAdvanced, onBlockedChange }: CoreMetadataFormProps) {
  const { t } = useT();
  const [title, setTitle] = useState<FieldState>(EMPTY_FIELD);
  const [eraEdtf, setEraEdtf] = useState('');
  const [eraDisplay, setEraDisplay] = useState('');
  const [eraCertainty, setEraCertainty] = useState<EraCertainty>('certain');
  const [soKiemKe, setSoKiemKe] = useState<FieldState>(EMPTY_FIELD);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('internal');
  const [license, setLicense] = useState('');
  const [personalData, setPersonalData] = useState(false);
  const [desc, setDesc] = useState<FieldState>(EMPTY_FIELD);
  const [originalText, setOriginalText] = useState<FieldState>(EMPTY_FIELD);
  const [transliteration, setTransliteration] = useState<FieldState>(EMPTY_FIELD);
  const [translation, setTranslation] = useState<FieldState>(EMPTY_FIELD);
  const [translator, setTranslator] = useState<FieldState>(EMPTY_FIELD);
  const [reviewer, setReviewer] = useState<FieldState>(EMPTY_FIELD);
  const [digitizationNote, setDigitizationNote] = useState<FieldState>(EMPTY_FIELD);

  const isDocument = objectClass === 'document';
  const soKiemKeRequired = objectClass === 'artifact' || objectClass === 'document';
  const edtfError = eraEdtf.trim().length > 0 && !isValidEdtf(eraEdtf);
  const reviewerConflict =
    translator.text.trim().length > 0 &&
    reviewer.text.trim().length > 0 &&
    translator.text.trim().toLowerCase() === reviewer.text.trim().toLowerCase();

  const blocked =
    blocks(title, true) ||
    blocks(soKiemKe, soKiemKeRequired) ||
    blocks(desc) ||
    edtfError ||
    blocks(digitizationNote) ||
    (isDocument &&
      (blocks(originalText, true) ||
        blocks(transliteration) ||
        blocks(translation, true) ||
        blocks(translator, true) ||
        blocks(reviewer, true) ||
        reviewerConflict));

  useEffect(() => {
    onBlockedChange(blocked);
  }, [blocked, onBlockedChange]);

  return (
    <div className={styles.wrap}>
      <MissingValueField label={t('upload.titleLabel')} placeholder={t('upload.titlePlaceholder')} required value={title} onChange={setTitle} />

      <div className={styles.eraBlock}>
        <h5 className={styles.eraTitle}>{t('upload.eraSectionTitle')}</h5>
        <div className={styles.eraGrid}>
          <div>
            <label className={styles.fieldLabel}>{t('upload.eraEdtfLabel')}</label>
            <input className={styles.textInput} value={eraEdtf} placeholder={t('upload.eraEdtfPlaceholder')} onChange={(e) => setEraEdtf(e.target.value)} />
            {edtfError && <div className={styles.errorText}>{t('upload.eraEdtfInvalid')}</div>}
          </div>
          <div>
            <label className={styles.fieldLabel}>{t('upload.eraDisplayLabel')}</label>
            <input className={styles.textInput} value={eraDisplay} placeholder={t('upload.eraDisplayPlaceholder')} onChange={(e) => setEraDisplay(e.target.value)} />
          </div>
          <div>
            <label className={styles.fieldLabel}>{t('upload.eraCertaintyLabel')}</label>
            <select className={styles.select} value={eraCertainty} onChange={(e) => setEraCertainty(e.target.value as EraCertainty)}>
              {ERA_CERTAINTY.map((c) => (
                <option key={c} value={c}>
                  {t(ERA_CERTAINTY_KEY[c])}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <MissingValueField
        label={t('upload.soKiemKeLabel')}
        placeholder={t('upload.soKiemKePlaceholder')}
        required={soKiemKeRequired}
        value={soKiemKe}
        onChange={setSoKiemKe}
      />

      <div className={styles.row2}>
        <div>
          <label className={styles.fieldLabel}>{t('upload.accessLevelLabel')}</label>
          <select className={styles.select} value={accessLevel} onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}>
            {ACCESS_LEVELS.map((a) => (
              <option key={a} value={a}>
                {t(ACCESS_LEVEL_KEY[a])}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.fieldLabel}>{t('upload.licenseLabel')}</label>
          <input className={styles.textInput} value={license} placeholder={t('upload.licensePlaceholder')} onChange={(e) => setLicense(e.target.value)} />
        </div>
      </div>

      <label className={styles.checkboxRow}>
        <input type="checkbox" checked={personalData} onChange={(e) => setPersonalData(e.target.checked)} />
        {t('upload.personalDataLabel')}
      </label>

      <MissingValueField label={t('upload.descLabel')} placeholder={t('upload.descPlaceholder')} multiline value={desc} onChange={setDesc} />

      {showAdvanced && (
        <MissingValueField
          label={t('upload.digitizationMethodLabel')}
          placeholder={t('upload.digitizationMethodPlaceholder')}
          value={digitizationNote}
          onChange={setDigitizationNote}
        />
      )}

      {showAdvanced && isDocument && (
        <div className={styles.documentBlock}>
          <h5 className={styles.documentTitle}>{t('upload.documentSectionTitle')}</h5>
          <MissingValueField
            label={t('upload.originalTextLabel')}
            placeholder={t('upload.originalTextPlaceholder')}
            required
            multiline
            value={originalText}
            onChange={setOriginalText}
          />
          <MissingValueField
            label={t('upload.transliterationLabel')}
            placeholder={t('upload.transliterationPlaceholder')}
            multiline
            value={transliteration}
            onChange={setTransliteration}
          />
          <MissingValueField
            label={t('upload.translationLabel')}
            placeholder={t('upload.translationPlaceholder')}
            required
            multiline
            value={translation}
            onChange={setTranslation}
          />
          <MissingValueField
            label={t('upload.translatorLabel')}
            placeholder={t('upload.translatorPlaceholder')}
            required
            value={translator}
            onChange={setTranslator}
          />
          <div>
            <MissingValueField
              label={t('upload.reviewerLabel')}
              placeholder={t('upload.reviewerPlaceholder')}
              required
              value={reviewer}
              onChange={setReviewer}
            />
            {reviewerConflict && <div className={styles.errorText}>{t('upload.reviewerSameAsTranslatorError')}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
