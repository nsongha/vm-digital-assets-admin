// Trình xem biểu mẫu tham khảo — mở từ các mục pháp lý ở trang Trợ giúp & tra
// cứu (HelpPage). BẮT BUỘC render qua portal ra `document.body`: vùng
// nội dung chính lẫn thanh bên đều có `backdrop-filter` (xem AppShell.module.css
// / Sidebar.module.css), thuộc tính này biến phần tử thành *khối chứa* cho con
// `position: fixed` — cùng lỗi vừa sửa ở SettingsModal.tsx (đọc file đó để bắt
// cách), nếu render tại chỗ lớp phủ sẽ bị nhốt trong vùng nội dung thay vì phủ
// toàn màn hình.
//
// TÍNH TRUNG THỰC: đây là tài liệu MẪU cho bản trình diễn — dải nhãn cảnh báo
// luôn hiển thị đầu modal để không ai nhầm là văn bản thật đã ký.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { EVIDENCE_KIND_LABELS, type EvidenceDoc } from '../data/complianceEvidence';
import { auditService } from '../services/mock/auditService';
import Toast from './Toast';
import styles from './EvidenceViewer.module.css';

interface EvidenceViewerProps {
  doc: EvidenceDoc;
  onClose: () => void;
}

export default function EvidenceViewer({ doc, onClose }: EvidenceViewerProps) {
  const { user: currentUser } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const meta: Array<[string, string]> = [['Loại tài liệu', EVIDENCE_KIND_LABELS[doc.kind]]];
  if (doc.soVanBan) meta.push(['Số hiệu', doc.soVanBan]);
  if (doc.ngayBanHanh) meta.push(['Ngày ban hành', doc.ngayBanHanh]);
  if (doc.nguoiKy) meta.push(['Người ký', doc.nguoiKy]);
  if (doc.pages) meta.push(['Số trang', `${doc.pages} trang`]);

  const handleDownload = () => {
    auditService.record({
      user: currentUser.name,
      action: 'Tải xuống',
      target: doc.title,
      note: `Chứng cứ tuân thủ${doc.soVanBan ? ` — ${doc.soVanBan}` : ''} (bản mô phỏng)`,
    });
    setDownloadMsg('Đã ghi nhận tải xuống vào Nhật ký hệ thống (bản mô phỏng — không có tệp thật được tải).');
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-title"
        tabIndex={-1}
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.sampleBanner}>TÀI LIỆU MẪU — DỮ LIỆU TRÌNH DIỄN</div>

        <div className={styles.head}>
          <div>
            <span className={styles.kindTag}>{EVIDENCE_KIND_LABELS[doc.kind]}</span>
            <h3 id="evidence-title" className={styles.title}>
              {doc.title}
            </h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng trình xem chứng cứ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.metaGrid}>
          {meta.map(([k, v]) => (
            <div key={k} className={styles.metaCell}>
              <span className={styles.metaKey}>{k}</span>
              <span className={styles.metaVal}>{v}</span>
            </div>
          ))}
        </div>

        <div className={styles.previewArea}>
          <h4 className={styles.previewTitle}>Nội dung xem trước</h4>
          {doc.preview.map((para, i) => (
            <p key={i} className={styles.previewPara}>
              {para}
            </p>
          ))}
        </div>

        {downloadMsg && <Toast message={downloadMsg} onClose={() => setDownloadMsg(null)} durationMs={6000} />}

        <div className={styles.foot}>
          <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
            Tải xuống (mô phỏng)
          </button>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
