import { useCallback, useEffect, useRef, useState } from 'react';
import GlassCard from './GlassCard';
import styles from './EmbeddedTool.module.css';

type ConnStatus = 'checking' | 'up' | 'down';

interface EmbeddedToolProps {
  /** Địa chỉ app ngoài cần nhúng (đã gồm path, ví dụ .../editor/). */
  src: string;
  /** Tên hiển thị — dùng cho thanh tiêu đề và title của <iframe> (đọc màn hình). */
  title: string;
  /** Lệnh khởi động app ngoài — hiển thị khi chưa kết nối được để người vận hành biết chạy gì. */
  startCommand: string;
  /** Mô tả ngắn chức năng — hiển thị phía trên khung nhúng ở mọi trạng thái. */
  description?: string;
}

/**
 * Khung nhúng dùng chung cho các app ngoài chạy độc lập (hiện là GS Immersive
 * Tour) qua <iframe>. Tự kiểm tra app đích có đang chạy không trước khi nhúng,
 * vì app đó là một dev server riêng (port khác) có thể chưa được khởi động —
 * nhúng thẳng iframe vào một server chết chỉ cho người dùng thấy trang trắng
 * không rõ lý do.
 */
export default function EmbeddedTool({ src, title, startCommand, description }: EmbeddedToolProps) {
  const [status, setStatus] = useState<ConnStatus>('checking');
  const [copied, setCopied] = useState(false);

  // Tránh setState sau khi component đã unmount (probe có thể vẫn đang chờ
  // timeout khi người dùng điều hướng sang trang khác).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const probe = useCallback(() => {
    setStatus('checking');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    // mode:'no-cors' vì src là origin khác (port 5174 so với admin 5173) —
    // trình duyệt sẽ chặn đọc nội dung response (opaque response) do CORS,
    // nhưng ta không cần đọc nội dung, chỉ cần biết server có phản hồi hay
    // không: fetch() resolve (kể cả response opaque) nghĩa là có server đang
    // lắng nghe ở địa chỉ đó; fetch() reject (connection refused) hoặc bị
    // abort do timeout nghĩa là chưa có gì chạy ở đó.
    fetch(src, { mode: 'no-cors', cache: 'no-store', signal: controller.signal })
      .then(() => {
        if (mountedRef.current) setStatus('up');
      })
      .catch(() => {
        if (mountedRef.current) setStatus('down');
      })
      .finally(() => clearTimeout(timeout));
  }, [src]);

  useEffect(() => {
    probe();
  }, [probe]);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(startCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.root}>
      {description && <p className={styles.description}>{description}</p>}

      {status === 'checking' && <div className={styles.checkingRow}>Đang kiểm tra kết nối…</div>}

      {status === 'up' && (
        <>
          <div className={styles.bar}>
            <span className={styles.barTitle}>{title}</span>
            {/* Mở thẻ riêng vì editor dùng nhiều phím tắt/toàn màn hình, phù hợp
                cho phiên làm việc dài hơn là ở trong khung nhúng của admin. */}
            <a href={src} target="_blank" rel="noreferrer" className={styles.openLink}>
              Mở trong thẻ mới
            </a>
          </div>
          <iframe
            src={src}
            title={title}
            allow="fullscreen; xr-spatial-tracking; gamepad; clipboard-write"
            className={styles.iframe}
          />
        </>
      )}

      {status === 'down' && (
        <GlassCard className={styles.downCard}>
          <p className={styles.downText}>
            Đây là ứng dụng <strong>GS Immersive Tour</strong> — chạy độc lập với admin, chưa thấy nó hoạt động tại địa
            chỉ <code className={styles.inlineCode}>{src}</code>. Khởi động bằng lệnh bên dưới rồi thử lại.
          </p>
          <div className={styles.commandRow}>
            <code className={styles.commandCode}>{startCommand}</code>
            <button type="button" className={styles.copyBtn} onClick={copyCommand}>
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>
          <div className={styles.downActions}>
            <button type="button" className={styles.retryBtn} onClick={probe}>
              Thử lại
            </button>
            <a href={src} target="_blank" rel="noreferrer" className={styles.openLink}>
              Mở trong thẻ mới
            </a>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
