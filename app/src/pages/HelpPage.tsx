import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EvidenceViewer from '../components/EvidenceViewer';
import TagChip from '../components/TagChip';
import { EVIDENCE_BY_ID, EVIDENCE_KIND_LABELS, type EvidenceDoc } from '../data/complianceEvidence';
import {
  HELP_CATEGORY_LABELS,
  HOWTO_ENTRIES,
  LEGAL_ENTRIES,
  LEGAL_GROUP_ORDER,
  WARNING_ENTRIES,
  matchesHelpQuery,
  type HelpCategory,
  type HelpEntry,
} from '../data/helpContent';
import styles from './HelpPage.module.css';

// Trợ giúp & tra cứu — thay trang "Tuân thủ & quản trị dữ liệu" cũ (đã xóa).
// Lý do đổi cách trình bày: xem comment đầu `data/helpContent.ts`. Trang này
// CHỈ tra cứu — không tự chấm "Đạt/Không đạt", không kiểm tra quyền (mở cho
// mọi vai trò đăng nhập, kể cả "Chỉ xem").
//
// BỐ CỤC (đổi 12/08/2026): từ danh sách accordion một cột sang HAI CỘT kiểu
// tài liệu tra cứu — cột trái là mục lục bền vững + ô tìm, cột phải là nội
// dung một mục đọc như văn bản. Lý do đo được trên bản cũ: nội dung đóng hết
// đã dài hơn 2 màn hình, và mở MỘT mục pháp lý đẩy trang thêm ~465–625px, tức
// cao hơn cả khung nhìn — người đọc mất mục lục ngay khi bắt đầu đọc. Ở bố cục
// mới, mục lục không bao giờ cuộn đi mất.

type CategoryFilter = 'Tất cả' | HelpCategory;

const CATEGORY_FILTERS: CategoryFilter[] = ['Tất cả', 'phap-ly', 'huong-dan'];

function categoryFilterLabel(f: CategoryFilter): string {
  return f === 'Tất cả' ? 'Tất cả' : HELP_CATEGORY_LABELS[f];
}

// Mục 'canh-bao' (WARNING_ENTRIES) hiển thị riêng, luôn nổi bật ở đầu cột nội
// dung — không đưa vào danh sách tìm/lọc chung để không ai lướt qua mất.
const SEARCHABLE_ENTRIES: HelpEntry[] = [...LEGAL_ENTRIES, ...HOWTO_ENTRIES];

/** Thứ tự hiển thị nhóm: pháp lý theo đúng thứ tự sổ đăng ký cũ, hướng dẫn xếp sau. */
function groupOrderIndex(entry: HelpEntry): number {
  if (entry.category === 'phap-ly') {
    const idx = LEGAL_GROUP_ORDER.indexOf(entry.group);
    return idx === -1 ? LEGAL_GROUP_ORDER.length : idx;
  }
  return LEGAL_GROUP_ORDER.length + 1;
}

/** Gom danh sách phẳng thành các khối [tên nhóm, mục…] giữ nguyên thứ tự đã sắp. */
function groupEntries(entries: HelpEntry[]): { group: string; items: HelpEntry[] }[] {
  const out: { group: string; items: HelpEntry[] }[] = [];
  for (const e of entries) {
    const last = out[out.length - 1];
    if (last && last.group === e.group) last.items.push(e);
    else out.push({ group: e.group, items: [e] });
  }
  return out;
}

export default function HelpPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('Tất cả');
  const [openDoc, setOpenDoc] = useState<EvidenceDoc | null>(null);

  const filtered = useMemo(() => {
    return SEARCHABLE_ENTRIES.filter(
      (e) => (category === 'Tất cả' || e.category === category) && matchesHelpQuery(e, query),
    ).sort((a, b) => {
      const gi = groupOrderIndex(a) - groupOrderIndex(b);
      if (gi !== 0) return gi;
      return a.group === b.group ? 0 : a.group.localeCompare(b.group, 'vi');
    });
  }, [query, category]);

  const grouped = useMemo(() => groupEntries(filtered), [filtered]);

  // Mục 'canh-bao' CỐ Ý không thuộc SEARCHABLE_ENTRIES (xem ghi chú ở trên).
  // Hệ quả không mong muốn: gõ đúng từ khóa của nó — ví dụ số hiệu một văn bản
  // đã bị bãi bỏ — thì mục lục báo "không có mục nào khớp", trong khi câu trả
  // lời đang hiện ngay ở cột bên. Dò riêng để nói đúng chỗ cần nhìn.
  const warningMatches = useMemo(
    () => (query.trim() ? WARNING_ENTRIES.filter((w) => matchesHelpQuery(w, query)) : []),
    [query],
  );

  const selected = entryId ? SEARCHABLE_ENTRIES.find((e) => e.id === entryId) : undefined;

  // Đổi mục thì đưa cột nội dung về đầu. Không đụng tới cuộn của cột mục lục —
  // người dùng vừa tìm thấy mục ở giữa danh sách, kéo họ về đầu danh sách là
  // làm mất chỗ họ đang đứng.
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [entryId]);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="Mục lục trợ giúp">
        <div className={styles.sidebarHead}>
          <label className={styles.searchWrap}>
            <span className="visually-hidden">Tìm theo tiêu đề, từ khóa hoặc số hiệu văn bản</span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Tìm trong tài liệu…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <div className={styles.filterRow}>
            {CATEGORY_FILTERS.map((f) => (
              <TagChip
                key={f}
                label={categoryFilterLabel(f)}
                active={category === f}
                shadow
                onClick={() => setCategory(f)}
              />
            ))}
          </div>
          <div className={styles.count}>{filtered.length} mục</div>
        </div>

        <nav className={styles.toc}>
          {grouped.map((block) => (
            <div key={block.group} className={styles.tocGroup}>
              <div className={styles.tocGroupTitle}>{block.group}</div>
              <ul className={styles.tocList}>
                {block.items.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className={e.id === entryId ? `${styles.tocItem} ${styles.tocItemActive}` : styles.tocItem}
                      aria-current={e.id === entryId ? 'page' : undefined}
                      onClick={() => navigate(`/help/${e.id}`)}
                    >
                      {e.dieuKhoan && <span className={styles.tocArticle}>{e.dieuKhoan}</span>}
                      <span className={styles.tocTitle}>{e.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className={styles.emptyState}>
              {warningMatches.length > 0 ? (
                <>
                  Không có mục nào trong mục lục khớp — nhưng từ khóa này trùng với{' '}
                  <strong>{warningMatches.map((w) => w.title).join('; ')}</strong>, đang hiển thị ở đầu cột bên phải.
                </>
              ) : (
                <>Không tìm thấy mục nào khớp — thử từ khóa khác.</>
              )}
            </p>
          )}
        </nav>
      </aside>

      <div className={styles.content} ref={contentRef}>
        {WARNING_ENTRIES.map((w) => (
          <div key={w.id} className={styles.warningBanner}>
            <div className={styles.warningTitle}>{w.title}</div>
            <ul className={styles.warningList}>
              {(w.donViTuLam ?? []).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ))}

        {selected ? (
          <EntryDocument entry={selected} onOpenDoc={setOpenDoc} />
        ) : (
          <HelpOverview invalidId={entryId && !selected ? entryId : undefined} />
        )}
      </div>

      {openDoc && <EvidenceViewer doc={openDoc} onClose={() => setOpenDoc(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trang chủ của tài liệu — hiện khi chưa chọn mục nào. Đây là chỗ đặt lời dẫn
// về BẢN CHẤT của tài liệu (không phải bảng tự chấm tuân thủ). Ở bố cục cũ lời
// dẫn này nằm trên đầu danh sách nên bị cuộn qua ngay; ở đây nó là mặt trước
// của tài liệu, người đọc gặp trước khi vào bất kỳ mục nào.
// ---------------------------------------------------------------------------

function HelpOverview({ invalidId }: { invalidId?: string }) {
  return (
    <article className={styles.doc}>
      {invalidId && (
        <p className={styles.invalidNotice}>
          Không có mục nào mang mã <code className={styles.inlineCode}>{invalidId}</code> — có thể đường dẫn đã cũ. Chọn
          một mục trong mục lục bên trái.
        </p>
      )}

      <h2 className={styles.docTitle}>Trợ giúp &amp; tra cứu</h2>

      <p className={styles.docLede}>
        Đây là tài liệu <strong>hướng dẫn để tra cứu</strong>: văn bản pháp luật yêu cầu gì, hệ thống hỗ trợ những chức
        năng nào, và đơn vị vận hành phải tự làm/tự kiểm những gì trước khi coi là đã đáp ứng.
      </p>

      <div className={styles.docCallout}>
        <strong>Đây không phải bảng tự chấm tuân thủ.</strong> Phần mềm không thể tự xác nhận đã tuân thủ một văn bản
        pháp luật thay cho con người. Vì vậy mỗi mục pháp lý trong tài liệu này tách bạch bốn phần — văn bản yêu cầu gì,
        hệ thống hỗ trợ công cụ gì, đơn vị vận hành phải tự làm gì, và <em>chức danh nào ký xác nhận</em> — thay vì một
        cột trạng thái “Đạt”. Không có mục nào trong đây do hệ thống tự đánh dấu là đã hoàn thành.
      </div>

      <h3 className={styles.docH3}>Cách dùng tài liệu này</h3>
      <ul className={styles.docList}>
        <li>
          <strong>Tra theo số hiệu văn bản hoặc điều khoản</strong> — gõ vào ô tìm bên trái, ví dụ “Điều 24” hay
          “356/2025”. Ô tìm bỏ dấu hai chiều nên gõ không dấu vẫn ra.
        </li>
        <li>
          <strong>Tra theo việc đang làm</strong> — lọc nhóm “Hướng dẫn sử dụng” để xem các thao tác theo từng màn hình
          nghiệp vụ.
        </li>
        <li>
          <strong>Gửi cho người khác</strong> — mỗi mục có địa chỉ riêng, sao chép thanh địa chỉ là chia sẻ được đúng
          mục đó.
        </li>
      </ul>

      <h3 className={styles.docH3}>Đọc một mục pháp lý thế nào</h3>
      <p className={styles.docP}>
        Bốn phần của mỗi mục xếp theo thứ tự trách nhiệm dịch chuyển dần từ văn bản sang con người. Phần “Hệ thống hỗ
        trợ” mô tả <em>công cụ có sẵn</em> — có công cụ không có nghĩa là đã làm. Phần “Đơn vị vận hành tự làm/tự kiểm”
        mới là việc phải có người thực hiện, và phần cuối ghi chức danh chịu trách nhiệm ký xác nhận. Khi thanh tra hỏi
        “ai chịu trách nhiệm việc này”, câu trả lời nằm ở phần cuối, không nằm ở phần mềm.
      </p>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Một mục trình bày dạng văn bản. Phần văn xuôi `dienGiai` đứng TRƯỚC các khối
// gạch đầu dòng: người đọc cần hiểu vì sao có yêu cầu này trước khi đọc danh
// sách việc phải làm. Khối "Trách nhiệm xác nhận" giữ khung riêng, tách khỏi
// phần mô tả chức năng hệ thống — để không ai đọc lướt rồi hiểu nhầm hệ thống
// đang tự xác nhận.
// ---------------------------------------------------------------------------

function EntryDocument({ entry, onOpenDoc }: { entry: HelpEntry; onOpenDoc: (doc: EvidenceDoc) => void }) {
  const navigate = useNavigate();
  const support = entry.heThongHoTro ?? [];
  const checklist = entry.donViTuLam ?? [];
  const evidenceIds = entry.evidenceIds ?? [];
  const steps = entry.steps ?? [];
  const dienGiai = entry.dienGiai ?? [];
  const isLegal = entry.category === 'phap-ly';

  return (
    <article className={styles.doc}>
      <div className={styles.docBreadcrumb}>{entry.group}</div>
      <h2 className={styles.docTitle}>{entry.title}</h2>

      {isLegal && (entry.soHieuVanBan || entry.dieuKhoan) && (
        <div className={styles.docCitation}>
          {entry.soHieuVanBan && <span className={styles.lawCode}>{entry.soHieuVanBan}</span>}
          {entry.dieuKhoan && <span className={styles.lawArticle}>{entry.dieuKhoan}</span>}
        </div>
      )}

      {dienGiai.map((para, i) => (
        <p key={i} className={styles.docP}>
          {para}
        </p>
      ))}

      {isLegal && entry.yeuCau && (
        <>
          <h3 className={styles.docH3}>Văn bản yêu cầu gì</h3>
          <blockquote className={styles.docQuote}>{entry.yeuCau}</blockquote>
        </>
      )}

      {support.length > 0 && (
        <>
          <h3 className={styles.docH3}>Hệ thống hỗ trợ</h3>
          <p className={styles.docHint}>
            Đây là <strong>công cụ có sẵn</strong> trong phần mềm, không phải xác nhận rằng công việc đã hoàn thành.
          </p>
          <ul className={styles.supportList}>
            {support.map((item, i) => (
              <li key={i} className={styles.supportItem}>
                <span>{item.label}</span>
                {item.href && (
                  <button type="button" className={styles.gotoBtn} onClick={() => navigate(item.href as string)}>
                    Mở màn này →
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {steps.length > 0 && (
        <>
          <h3 className={styles.docH3}>Các bước thực hiện</h3>
          <ol className={styles.stepsList}>
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </>
      )}

      {checklist.length > 0 && (
        <>
          <h3 className={styles.docH3}>{isLegal ? 'Đơn vị vận hành tự làm / tự kiểm' : 'Lưu ý khi vận hành'}</h3>
          <ul className={styles.checklist}>
            {checklist.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </>
      )}

      {entry.trachNhiemXacNhan && (
        <div className={styles.responsibleBox}>
          <span className={styles.responsibleLabel}>Trách nhiệm xác nhận</span>
          <span className={styles.responsibleValue}>{entry.trachNhiemXacNhan}</span>
          <span className={styles.responsibleFoot}>Hệ thống không ghi nhận và không xác nhận việc này.</span>
        </div>
      )}

      {evidenceIds.length > 0 && (
        <>
          <h3 className={styles.docH3}>Biểu mẫu tham khảo</h3>
          <div className={styles.evidenceChips}>
            {evidenceIds.map((id) => {
              const doc = EVIDENCE_BY_ID[id];
              if (!doc) return null;
              const isLink = doc.kind === 'lienKetNoiBo';
              return (
                <button
                  key={id}
                  type="button"
                  className={isLink ? `${styles.evidenceChip} ${styles.evidenceChipLink}` : styles.evidenceChip}
                  onClick={() => (isLink && doc.internalHref ? navigate(doc.internalHref) : onOpenDoc(doc))}
                  title={isLink ? 'Điều hướng nội bộ trong ứng dụng' : `${EVIDENCE_KIND_LABELS[doc.kind]} — bấm để xem trước`}
                >
                  <span className={styles.evidenceChipKind}>{EVIDENCE_KIND_LABELS[doc.kind]}</span>
                  <span className={styles.evidenceChipTitle}>{doc.title}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {entry.relatedRoute && (
        <button type="button" className={styles.gotoBtn} onClick={() => navigate(entry.relatedRoute as string)}>
          Mở màn liên quan →
        </button>
      )}

      {entry.note && <p className={styles.noteText}>{entry.note}</p>}

      {entry.canBoSung && (
        <div className={styles.gapBox}>
          <span className={styles.gapLabel}>Nội dung còn thiếu</span>
          <span className={styles.gapValue}>{entry.canBoSung}</span>
        </div>
      )}
    </article>
  );
}
