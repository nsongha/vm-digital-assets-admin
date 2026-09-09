import { Fragment, useEffect, useState } from 'react';
import MissingValueField, { EMPTY_FIELD, fieldBlocksSubmit } from './MissingValueField';
import type { FieldState } from './MissingValueField';
import { useT } from '../i18n';
import { DIMENSION_LABELS, DIMENSION_UNITS, METHOD_LABELS, QUALIFIER_LABELS, presetFor } from '../data/physicalSpecs';
import type { DimensionQualifier, DimensionType, MeasurementMethod } from '../data/physicalSpecs';
import type { Asset, ObjectClass } from '../services/types';
import styles from './PhysicalSpecsForm.module.css';

// 0sexies — "Đặc điểm vật lý của đối tượng", đồng bộ schema với
// `data/physicalSpecs.ts` (nguồn dùng chung với màn Chi tiết). Bảng đo là
// bản ghi LẶP LẠI (CIDOC-CRM E54), không phải vài ô cố định — xem comment
// đầu file physicalSpecs.ts. Form mock tự quản lý state, chỉ báo lên cha có
// đang chặn nộp hay không.

const PRECINCT_ZONES = ['Hồ Văn', 'Vườn Giám', 'Nhập Đạo', 'Thành Đạt', 'Đại Thành', 'Thái Học'];

const DIMENSION_TYPES = Object.keys(DIMENSION_LABELS) as DimensionType[];
const QUALIFIERS = Object.keys(QUALIFIER_LABELS) as DimensionQualifier[];
const METHODS = Object.keys(METHOD_LABELS) as MeasurementMethod[];

interface MeasurementRowState {
  id: string;
  type: DimensionType;
  part: string;
  value: string;
  unit: string;
  qualifier: DimensionQualifier;
  method: MeasurementMethod;
  measuredBy: string;
  measuredAt: string;
  derivedFrom: string;
}

let rowSeq = 0;
function nextRowId(): string {
  rowSeq += 1;
  return `mrow-${rowSeq}`;
}

interface PhysicalSpecsFormProps {
  objectClass: ObjectClass;
  showAdvanced: boolean;
  assets: Asset[];
  onBlockedChange: (blocked: boolean) => void;
}

export default function PhysicalSpecsForm({ objectClass, showAdvanced, assets, onBlockedChange }: PhysicalSpecsFormProps) {
  const { t } = useT();
  const preset = presetFor(objectClass);
  const [rows, setRows] = useState<MeasurementRowState[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, FieldState>>({});
  const [zone, setZone] = useState('');
  const [building, setBuilding] = useState('');
  const [specific, setSpecific] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [vnX, setVnX] = useState('');
  const [vnY, setVnY] = useState('');
  const [elevation, setElevation] = useState('');
  const [tempMin, setTempMin] = useState('');
  const [tempMax, setTempMax] = useState('');
  const [humMin, setHumMin] = useState('');
  const [humMax, setHumMax] = useState('');
  const [lux, setLux] = useState('');
  const [special, setSpecial] = useState('');

  const addRow = () => {
    const suggestion = preset.suggestedDimensions[rows.length % preset.suggestedDimensions.length];
    setRows((prev) => [
      ...prev,
      {
        id: nextRowId(),
        type: suggestion.type,
        part: suggestion.part,
        value: '',
        unit: DIMENSION_UNITS[suggestion.type][0],
        qualifier: 'chinhXac',
        method: 'thuocDay',
        measuredBy: '',
        measuredAt: '',
        derivedFrom: '',
      },
    ]);
  };
  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id: string, patch: Partial<MeasurementRowState>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const setRowType = (id: string, type: DimensionType) => updateRow(id, { type, unit: DIMENSION_UNITS[type][0] });

  const fieldVal = (key: string) => fieldValues[key] ?? EMPTY_FIELD;
  const setFieldVal = (key: string, v: FieldState) => setFieldValues((prev) => ({ ...prev, [key]: v }));

  const rowsBlocked = rows.some((r) => r.part.trim() === '');
  const fieldsBlocked = preset.fields.some((f) => fieldBlocksSubmit(fieldVal(f.key)));
  const blocked = rowsBlocked || fieldsBlocked;

  useEffect(() => {
    onBlockedChange(blocked);
  }, [blocked, onBlockedChange]);

  const model3dOptions = assets.filter((a) => a.digitalForm === 'mesh3d' || a.digitalForm === 'pointcloud' || a.digitalForm === 'splat');
  const showConservation = objectClass === 'artifact' || objectClass === 'document';
  const mainFields = preset.fields.filter((f) => !f.advanced);
  const advancedFields = preset.fields.filter((f) => f.advanced);

  return (
    <div className={styles.wrap}>
      <div>
        <div className={styles.subHead}>
          <h5 className={styles.subTitle}>{t('upload.physical.measurementsTitle')}</h5>
          <button type="button" className={styles.addRowBtn} onClick={addRow}>
            {t('upload.physical.addRowBtn')}
          </button>
        </div>
        {rows.length === 0 ? (
          <p className={styles.emptyRows}>{t('upload.physical.emptyRows')}</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table data-table--tight">
              <thead>
                <tr>
                  <th>{t('upload.physical.colType')}</th>
                  <th>{t('upload.physical.colPart')}</th>
                  <th>{t('upload.physical.colValue')}</th>
                  <th>{t('upload.physical.colUnit')}</th>
                  <th>{t('upload.physical.colQualifier')}</th>
                  <th>{t('upload.physical.colMethod')}</th>
                  <th>{t('upload.physical.colMeasuredBy')}</th>
                  <th>{t('upload.physical.colMeasuredAt')}</th>
                  <th aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Fragment key={r.id}>
                    <tr>
                      <td>
                        <select className={styles.cellSelect} value={r.type} onChange={(e) => setRowType(r.id, e.target.value as DimensionType)}>
                          {DIMENSION_TYPES.map((k) => (
                            <option key={k} value={k}>
                              {DIMENSION_LABELS[k]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className={r.part.trim() === '' ? `${styles.cellInput} ${styles.cellInputError}` : styles.cellInput}
                          value={r.part}
                          placeholder={t('upload.physical.partPlaceholder')}
                          onChange={(e) => updateRow(r.id, { part: e.target.value })}
                        />
                      </td>
                      <td>
                        <input className={styles.cellInput} value={r.value} inputMode="decimal" onChange={(e) => updateRow(r.id, { value: e.target.value })} />
                      </td>
                      <td>
                        <select className={styles.cellSelect} value={r.unit} onChange={(e) => updateRow(r.id, { unit: e.target.value })}>
                          {DIMENSION_UNITS[r.type].map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select className={styles.cellSelect} value={r.qualifier} onChange={(e) => updateRow(r.id, { qualifier: e.target.value as DimensionQualifier })}>
                          {QUALIFIERS.map((k) => (
                            <option key={k} value={k}>
                              {QUALIFIER_LABELS[k]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select className={styles.cellSelect} value={r.method} onChange={(e) => updateRow(r.id, { method: e.target.value as MeasurementMethod })}>
                          {METHODS.map((k) => (
                            <option key={k} value={k}>
                              {METHOD_LABELS[k]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input className={styles.cellInput} value={r.measuredBy} onChange={(e) => updateRow(r.id, { measuredBy: e.target.value })} />
                      </td>
                      <td>
                        <input type="date" className={styles.cellInput} value={r.measuredAt} onChange={(e) => updateRow(r.id, { measuredAt: e.target.value })} />
                      </td>
                      <td>
                        <button type="button" aria-label={t('upload.physical.removeRowBtn')} className={styles.rowDeleteBtn} onClick={() => removeRow(r.id)}>
                          ×
                        </button>
                      </td>
                    </tr>
                    {r.method === 'quet3D' && (
                      <tr>
                        <td colSpan={9} className={styles.derivedCell}>
                          <span className={styles.derivedLabel}>{t('upload.physical.derivedFromLabel')}</span>
                          <select className={styles.cellSelect} value={r.derivedFrom} onChange={(e) => updateRow(r.id, { derivedFrom: e.target.value })}>
                            <option value="">—</option>
                            {model3dOptions.map((a) => (
                              <option key={a.id} value={a.code}>
                                {a.code} — {a.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h5 className={styles.subTitle}>{t('upload.physical.fieldsTitle')}</h5>
        <div className={styles.fieldsGrid}>
          {mainFields.map((f) => (
            <MissingValueField key={f.key} label={f.label} placeholder={f.placeholder} value={fieldVal(f.key)} onChange={(v) => setFieldVal(f.key, v)} />
          ))}
          {showAdvanced && advancedFields.map((f) => (
            <MissingValueField key={f.key} label={f.label} placeholder={f.placeholder} value={fieldVal(f.key)} onChange={(v) => setFieldVal(f.key, v)} />
          ))}
        </div>
      </div>

      <div>
        <h5 className={styles.subTitle}>{t('upload.physical.locationTitle')}</h5>
        <div className={styles.locGrid}>
          <div>
            <label className={styles.fieldLabel}>{t('upload.physical.locZone')}</label>
            <select className={styles.select} value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="">—</option>
              {PRECINCT_ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.fieldLabel}>{t('upload.physical.locBuilding')}</label>
            <input className={styles.textInput} value={building} placeholder={t('upload.physical.locBuildingPlaceholder')} onChange={(e) => setBuilding(e.target.value)} />
          </div>
          <div>
            <label className={styles.fieldLabel}>{t('upload.physical.locSpecific')}</label>
            <input className={styles.textInput} value={specific} placeholder={t('upload.physical.locSpecificPlaceholder')} onChange={(e) => setSpecific(e.target.value)} />
          </div>
        </div>
        <div className={styles.coordGrid}>
          <div>
            <label className={styles.fieldLabel}>{t('upload.physical.locWgs84')}</label>
            <div className={styles.coordPair}>
              <input className={styles.textInput} value={lat} placeholder="21.0295" inputMode="decimal" onChange={(e) => setLat(e.target.value)} />
              <input className={styles.textInput} value={lng} placeholder="105.8355" inputMode="decimal" onChange={(e) => setLng(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={styles.fieldLabel}>{t('upload.physical.locVn2000')}</label>
            <div className={styles.coordPair}>
              <input className={styles.textInput} value={vnX} placeholder="X" inputMode="decimal" onChange={(e) => setVnX(e.target.value)} />
              <input className={styles.textInput} value={vnY} placeholder="Y" inputMode="decimal" onChange={(e) => setVnY(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={styles.fieldLabel}>{t('upload.physical.locElevation')}</label>
            <input className={styles.textInput} value={elevation} inputMode="decimal" onChange={(e) => setElevation(e.target.value)} />
          </div>
        </div>
      </div>

      {showConservation && (
        <div>
          <h5 className={styles.subTitle}>{t('upload.physical.conservationTitle')}</h5>
          <div className={styles.locGrid}>
            <div>
              <label className={styles.fieldLabel}>{t('upload.physical.conservationTempLabel')}</label>
              <div className={styles.coordPair}>
                <input className={styles.textInput} value={tempMin} placeholder="min" inputMode="decimal" onChange={(e) => setTempMin(e.target.value)} />
                <input className={styles.textInput} value={tempMax} placeholder="max" inputMode="decimal" onChange={(e) => setTempMax(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={styles.fieldLabel}>{t('upload.physical.conservationHumidityLabel')}</label>
              <div className={styles.coordPair}>
                <input className={styles.textInput} value={humMin} placeholder="min" inputMode="decimal" onChange={(e) => setHumMin(e.target.value)} />
                <input className={styles.textInput} value={humMax} placeholder="max" inputMode="decimal" onChange={(e) => setHumMax(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={styles.fieldLabel}>{t('upload.physical.conservationLightLabel')}</label>
              <input className={styles.textInput} value={lux} inputMode="decimal" onChange={(e) => setLux(e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className={styles.fieldLabel}>{t('upload.physical.conservationSpecialLabel')}</label>
            <input
              className={styles.textInput}
              value={special}
              placeholder={t('upload.physical.conservationSpecialPlaceholder')}
              onChange={(e) => setSpecial(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
