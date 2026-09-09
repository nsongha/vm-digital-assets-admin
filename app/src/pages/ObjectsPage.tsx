import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Pagination from '../components/Pagination';
import TagChip from '../components/TagChip';
import { PHYSICAL_OBJECTS, type PhysicalObjectRow } from '../data/assets';
import { formatMissing, isMissingDisplay } from '../data/missingValues';
import { averageCompletenessPct } from '../data/selectors';
import { DIGITAL_FORM_LABELS, DIGITAL_FORM_ORDER, OBJECT_CLASS_LABELS, OBJECT_CLASS_ORDER } from '../data/taxonomy';
import { services } from '../services';
import type { Asset, DigitalForm, ObjectClass, ObjectClassFilter } from '../services/types';
import { normalizeCode } from '../utils/assetCode';
import { normalizeForSearch } from '../utils/search';
import styles from './ObjectsPage.module.css';

// B10 — Danh sách đối tượng di sản (0bis/0ter). Khác "Dữ liệu số hóa" (mỗi
// dòng MỘT bản ghi số, xem AssetsPage): trang này liệt kê MỘT dòng cho MỖI
// đối tượng vật lý thật (công trình/hiện vật/khuôn viên/tài liệu), để đo ĐỘ
// PHỦ số hóa — công trình nào chưa có bản 3D nào, hiện vật nào chưa có số
// kiểm kê (chỉ số báo cáo theo QĐ 2026/QĐ-TTg: 100% di tích quốc gia đặc biệt
// được số hóa đến 2030).
//
// Nguồn danh sách PHẢI là `PHYSICAL_OBJECTS` (data/assets.ts) — danh sách mọi
// đối tượng vật lý lấy thẳng từ seed, KỂ CẢ đối tượng `reps: []` (chưa số hóa)
// — rồi mới GHÉP (left join) các bản ghi số từ `services.assets.list()` vào
// theo `physicalObjectId`. Không được suy ngược từ `ASSETS`/`services.assets`:
// `generateAssets` (assets/generator.ts) chỉ sinh Asset từ vòng lặp `obj.reps`,
// nên một đối tượng `reps: []` sẽ không có Asset nào và do đó không thể đếm
// được nếu danh sách gốc là các bản ghi số.

const PAGE_SIZE = 10;

const ZONE_ORDER = ['Hồ Văn', 'Vườn Giám', 'Nhập Đạo', 'Thành Đạt', 'Đại Thành', 'Thái Học'] as const;
type NamedZone = (typeof ZONE_ORDER)[number];
const UNZONED_ZONE = 'Ngoài phân khu (lưu trữ)';
type Zone = NamedZone | typeof UNZONED_ZONE;
const ZONE_DISPLAY_ORDER: Zone[] = [...ZONE_ORDER, UNZONED_ZONE];

/**
 * Suy ra phân khu từ `loc` (chuỗi tự do — mock chưa populate
 * `StructuredLocation.phanKhu`, xem physicalSpecs.ts) + tên đối tượng. Khớp
 * mô tả "Bố cục 5 khu" ở docs/04-phu-luc-fact-di-san.md (Khu 2 = Khuê Văn
 * Các, Khu 3 = Giếng Thiên Quang/vườn bia, Khu 4 = Đại Thành Môn/Điện Đại
 * Thành); Khu 1 = Nhập Đạo và Khu 5 = Thái Học suy theo Tứ trụ/Văn Miếu Môn và
 * Nhà Thái Học. Khu 3 gộp vào "Đại Thành" vì wireframe UC-03 chỉ đặt tên 6
 * phân khu, không có tên riêng cho khu 3. Tài liệu/tư liệu nghe nhìn lưu kho
 * (`loc` = "Kho lưu trữ"/"—") không đứng ở một điểm vật lý trong khuôn viên
 * nên xếp riêng, không gán bừa vào một phân khu.
 */
function zoneOf(name: string, loc: string): Zone {
  if (name === 'Hồ Văn') return 'Hồ Văn';
  if (name === 'Vườn Giám') return 'Vườn Giám';
  if (/cổng chính|ngoài Hồ Văn/.test(loc)) return 'Nhập Đạo';
  if (/Khu thứ hai/.test(loc)) return 'Thành Đạt';
  if (/Khu thứ ba|Khu thứ tư|Vườn bia Tiến sĩ|Nhà Bái Đường|Đại Thành Môn|Điện Đại Thành/.test(loc)) return 'Đại Thành';
  if (/Khu thứ năm|Thái Học/.test(loc)) return 'Thái Học';
  return UNZONED_ZONE;
}

/** 0quater — `so_kiem_ke` bắt buộc với HV (artifact) / TL (document); các loại khác không áp dụng. Bản sao cục bộ của cùng quy tắc ở ObjectDossierPage.tsx (không import chéo giữa 2 trang — mỗi trang chỉ export component mặc định của nó). */
function soKiemKeDisplay(objectClass: ObjectClass, value?: string): string {
  if (value) return value;
  return objectClass === 'artifact' || objectClass === 'document' ? formatMissing('CHUA_NHAP') : formatMissing('KHONG_AP_DUNG');
}

interface ObjectRow {
  physicalObjectId: string;
  name: string;
  objectClass: ObjectClass;
  loc: string;
  zone: Zone;
  reps: Asset[];
  forms: DigitalForm[];
  completenessPct: number;
  soKiemKeApplicable: boolean;
  soKiemKeText: string;
}

/**
 * Ghép `PhysicalObjectRow[]` (đối tượng vật lý — nguồn gốc, kể cả chưa số
 * hóa) với `Asset[]` (bản ghi số hiện có) theo `physicalObjectId` — LEFT JOIN
 * từ đối tượng vật lý, không phải ngược lại: mỗi đối tượng luôn có đúng 1
 * dòng ở đầu ra dù `reps` rỗng hay không, giữ nguyên thứ tự của `PHYSICAL_OBJECTS`.
 */
function buildObjectRows(physicalObjects: PhysicalObjectRow[], assets: Asset[]): ObjectRow[] {
  const repsById = new Map<string, Asset[]>();
  for (const a of assets) {
    if (!repsById.has(a.physicalObjectId)) repsById.set(a.physicalObjectId, []);
    repsById.get(a.physicalObjectId)!.push(a);
  }
  return physicalObjects.map((po) => {
    const reps = repsById.get(po.physicalObjectId) ?? [];
    const forms = DIGITAL_FORM_ORDER.filter((f) => reps.some((r) => r.digitalForm === f));
    return {
      physicalObjectId: po.physicalObjectId,
      name: po.name,
      objectClass: po.objectClass,
      loc: po.loc,
      zone: zoneOf(po.name, po.loc),
      reps,
      forms,
      completenessPct: averageCompletenessPct(reps),
      soKiemKeApplicable: po.objectClass === 'artifact' || po.objectClass === 'document',
      soKiemKeText: soKiemKeDisplay(po.objectClass, po.soKiemKe),
    };
  });
}

/** Tìm kiếm bỏ dấu, chấp nhận mã đầy đủ/rút gọn — cùng cơ chế `matchesAssetQuery` (utils/search.ts) nhưng quét trường của ObjectRow. */
function matchesObjectQuery(row: ObjectRow, rawQuery: string): boolean {
  const q = rawQuery.trim();
  if (!q) return true;
  const codeQ = normalizeCode(q);
  if (codeQ && normalizeCode(row.physicalObjectId).includes(codeQ)) return true;
  const normQ = normalizeForSearch(q);
  const haystacks = [row.name, row.loc, row.zone, OBJECT_CLASS_LABELS[row.objectClass]];
  return haystacks.some((f) => normalizeForSearch(f).includes(normQ));
}

const CLASS_FILTERS: ObjectClassFilter[] = ['Tất cả', ...OBJECT_CLASS_ORDER];

function classLabel(f: ObjectClassFilter): string {
  return f === 'Tất cả' ? 'Tất cả' : OBJECT_CLASS_LABELS[f];
}

export default function ObjectsPage() {
  const navigate = useNavigate();
  const assets = services.assets.list();
  const rows = useMemo(() => buildObjectRows(PHYSICAL_OBJECTS, assets), [assets]);

  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState<ObjectClassFilter>('Tất cả');
  const [zoneFilter, setZoneFilter] = useState<Zone | null>(null);
  const [onlyUndigitized, setOnlyUndigitized] = useState(false);
  const [page, setPage] = useState(1);

  // Dải chỉ số độ phủ — mọi con số derive từ `rows` (nguồn `PHYSICAL_OBJECTS`
  // đã ghép `reps`), không ghi cứng. "Chưa số hóa" giờ phản ánh đúng đối
  // tượng có `repCount === 0` — đây là căn cứ báo cáo tiến độ số hóa.
  const totalObjects = rows.length;
  const digitizedCount = rows.filter((r) => r.reps.length > 0).length;
  const digitizedPct = totalObjects === 0 ? 0 : Math.round((digitizedCount / totalObjects) * 100);
  const undigitizedCount = totalObjects - digitizedCount;
  const missingInventoryCount = rows.filter((r) => r.soKiemKeApplicable && isMissingDisplay(r.soKiemKeText)).length;

  const zoneCounts = useMemo(() => {
    const m = new Map<Zone, number>();
    for (const r of rows) m.set(r.zone, (m.get(r.zone) ?? 0) + 1);
    return m;
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (classFilter === 'Tất cả' || r.objectClass === classFilter) &&
          (!zoneFilter || r.zone === zoneFilter) &&
          (!onlyUndigitized || r.reps.length === 0) &&
          matchesObjectQuery(r, query),
      ),
    [rows, classFilter, zoneFilter, onlyUndigitized, query],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(Math.max(1, page), totalPages);
  const paged = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);
  const rangeLabel =
    filtered.length === 0 ? '0' : `${(curPage - 1) * PAGE_SIZE + 1}–${Math.min(curPage * PAGE_SIZE, filtered.length)}`;

  const resetToPage1 = () => setPage(1);

  return (
    <>
      <div className={styles.statStrip}>
        <div className={styles.statTile}>
          <span className={styles.statV}>{totalObjects}</span>
          <span className={styles.statK}>Tổng số đối tượng di sản</span>
        </div>
        <div className={styles.statTile}>
          <span className={styles.statV}>
            {digitizedCount} <span className={styles.statPct}>({digitizedPct}%)</span>
          </span>
          <span className={styles.statK}>Đã có ≥1 bản đại diện số</span>
        </div>
        <div
          className={
            undigitizedCount > 0
              ? `${styles.statTile} ${styles.statWarn} ${styles.statUrgent}`
              : `${styles.statTile} ${styles.statWarn}`
          }
        >
          {undigitizedCount > 0 && <span className={styles.statQueueBadge}>Hàng đợi việc</span>}
          <span className={styles.statV}>{undigitizedCount}</span>
          <span className={styles.statK}>Chưa số hóa</span>
          {undigitizedCount > 0 && (
            <span className={styles.statHint}>Căn cứ báo cáo tỷ lệ di tích đã số hóa theo QĐ 2026/QĐ-TTg.</span>
          )}
        </div>
        <div className={`${styles.statTile} ${styles.statWarn}`}>
          <span className={styles.statV}>{missingInventoryCount}</span>
          <span className={styles.statK}>Thiếu số kiểm kê hiện vật gốc</span>
        </div>
      </div>

      <div className={styles.layout}>
        <nav className={styles.tree} aria-label="Cây phân cấp phân khu">
          <button
            type="button"
            aria-pressed={zoneFilter === null}
            className={zoneFilter === null ? `${styles.treeNode} ${styles.treeNodeActive}` : styles.treeNode}
            onClick={() => {
              setZoneFilter(null);
              resetToPage1();
            }}
          >
            <span>Toàn khu — Văn Miếu &amp; Quốc Tử Giám</span>
            <span className={styles.treeCount}>{totalObjects}</span>
          </button>
          {ZONE_DISPLAY_ORDER.filter((z) => (zoneCounts.get(z) ?? 0) > 0).map((z) => (
            <button
              type="button"
              key={z}
              aria-pressed={zoneFilter === z}
              className={
                zoneFilter === z
                  ? `${styles.treeNode} ${styles.treeNodeChild} ${styles.treeNodeActive}`
                  : `${styles.treeNode} ${styles.treeNodeChild}`
              }
              onClick={() => {
                setZoneFilter(z);
                resetToPage1();
              }}
            >
              <span>{z}</span>
              <span className={styles.treeCount}>{zoneCounts.get(z) ?? 0}</span>
            </button>
          ))}
        </nav>

        <div className={styles.main}>
          <div className={styles.topRow}>
            <span className={styles.count}>
              {filtered.length} / {totalObjects} đối tượng di sản
            </span>
            <label className={styles.searchWrap}>
              <span className="visually-hidden">Tìm mã, tên đối tượng di sản</span>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Tìm mã, tên đối tượng…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetToPage1();
                }}
              />
            </label>
          </div>

          <div className={styles.filterRow}>
            {CLASS_FILTERS.map((f) => (
              <TagChip
                key={f}
                label={classLabel(f)}
                active={classFilter === f}
                shadow
                onClick={() => {
                  setClassFilter(f);
                  resetToPage1();
                }}
              />
            ))}
            <TagChip
              label={`Chưa số hóa (${undigitizedCount})`}
              active={onlyUndigitized}
              shadow
              activeBg="#f7cfc7"
              activeFg="#8a271a"
              onClick={() => {
                setOnlyUndigitized((v) => !v);
                resetToPage1();
              }}
            />
          </div>

          <GlassCard dense>
            <div className="table-scroll">
              <table className="data-table data-table--tight">
                <thead>
                  <tr>
                    <th>Mã đối tượng</th>
                    <th>Tên</th>
                    <th>Loại đối tượng</th>
                    <th>Vị trí</th>
                    <th>Dạng dữ liệu đã có</th>
                    <th>Số bản ghi số</th>
                    <th>% đầy đủ hồ sơ</th>
                    <th>Số kiểm kê</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r) => (
                    <tr
                      key={r.physicalObjectId}
                      className="clickable"
                      tabIndex={0}
                      role="button"
                      aria-label={`Xem hồ sơ ${r.name}`}
                      onClick={() => navigate(`/objects/${r.physicalObjectId}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/objects/${r.physicalObjectId}`);
                        }
                      }}
                    >
                      <td className="mono strong nowrap">{r.physicalObjectId}</td>
                      <td>{r.name}</td>
                      <td className="nowrap">{OBJECT_CLASS_LABELS[r.objectClass]}</td>
                      <td className="nowrap muted">{r.loc}</td>
                      <td>
                        <div className={styles.formChips}>
                          {r.forms.length === 0 ? (
                            <span className={styles.formChipWarn}>Chưa số hóa</span>
                          ) : (
                            r.forms.map((f) => (
                              <span key={f} className={styles.formChip}>
                                {DIGITAL_FORM_LABELS[f]}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="nowrap">{r.reps.length}</td>
                      <td className="nowrap">{r.completenessPct}%</td>
                      <td className={isMissingDisplay(r.soKiemKeText) ? styles.missing : 'nowrap'}>{r.soKiemKeText}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className={styles.empty}>Không có đối tượng di sản khớp bộ lọc.</p>}
            {filtered.length > 0 && (
              <div className={styles.pagerRow}>
                <span className={styles.pagerLabel}>
                  Hiển thị {rangeLabel} / {filtered.length}
                </span>
                <Pagination page={curPage} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </>
  );
}
