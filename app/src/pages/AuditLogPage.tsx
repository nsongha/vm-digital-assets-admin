import { useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusPill from '../components/StatusPill';
import TagChip from '../components/TagChip';
import type { ColorPair } from '../components/statusColors';
import { actionPill } from '../components/statusColors';
import { normalizeForSearch } from '../utils/search';
import styles from './AuditLogPage.module.css';

// B6 — Nhật ký nâng cao (attt C6 + legal + log-retention). Tự chứa: mở rộng
// cục bộ trên nền các dòng LOGS thật (data/logs.ts) — vài dòng được TÁI SỬ
// DỤNG nguyên văn (cùng actor/target/note/IP) để khớp với lịch sử phân quyền
// hiển thị ở UserDetailPage cho cùng người dùng (Vũ Minh Châu).

type AuditResult = 'Thành công' | 'Thất bại';

const RESULT_COLORS: Record<AuditResult, ColorPair> = {
  'Thành công': ['var(--accent-soft)', 'var(--accent-text)'],
  'Thất bại': ['#ffd9c2', '#9a4a1f'],
};

const TODAY = '2026-08-12';
const YESTERDAY = '2026-08-11';

function dateLabel(dateISO: string, hhmm: string): string {
  if (dateISO === TODAY) return `${hhmm} hôm nay`;
  if (dateISO === YESTERDAY) return `${hhmm} hôm qua`;
  const [, m, d] = dateISO.split('-');
  return `${d}/${m} ${hhmm}`;
}

interface AuditEntry {
  id: string;
  date: string; // YYYY-MM-DD
  hhmm: string; // HH:mm
  user: string;
  action: string;
  target: string;
  note: string;
  ip: string;
  result: AuditResult;
  isSecurity: boolean;
  hash: string;
}

// Ported verbatim from data/logs.ts where noted, extended with IP/kết quả/hash-chain.
const RAW_ENTRIES: AuditEntry[] = [
  { id: 'a1', date: '2026-08-12', hhmm: '09:42', user: 'Trần Văn Minh', action: 'Tải lên', target: 'VM-CT-00003.SPL01 — Điện Đại Thành, nội thất', note: '4 tệp', ip: '10.0.4.18', result: 'Thành công', isSecurity: false, hash: 'b7a1e0c9f34d5261a8b7c0e9d4f21a3c6e0b1d8a2f4c9e7b3a1d0c8e5f2a6b91' },
  { id: 'a2', date: '2026-08-12', hhmm: '09:15', user: 'Nguyễn Thị Hạnh', action: 'Phê duyệt', target: 'VM-HV-00004.M3D01 — Tượng thờ Chu Văn An', note: 'Chờ duyệt → Đã duyệt', ip: '10.0.4.2', result: 'Thành công', isSecurity: false, hash: 'c4f2a8b1d6e39f05c7a2b4d8e1f6a930c5b8d2e7f4a1c9b6d3e0f7a2c8b5d914' },
  { id: 'a3', date: '2026-08-12', hhmm: '08:50', user: 'Lê Thu Trang', action: 'Sửa metadata', target: 'VM-TL-00001.TXT01 — Sắc phong Cảnh Hưng 35', note: 'Bổ sung bản dịch nghĩa', ip: '10.0.4.25', result: 'Thành công', isSecurity: false, hash: 'd1e5f9a3b7c02d64e8a1f5b9d3c7e0a4f8b2d6c9e3a7f1b5d0c8e4a2f6b9d371' },
  { id: 'a4', date: '2026-08-12', hhmm: '08:12', user: 'Nguyễn Thị Hạnh', action: 'Đăng nhập', target: '—', note: 'Đăng nhập thành công', ip: '10.0.4.2', result: 'Thành công', isSecurity: true, hash: 'e2f6a0b4c8d13e75f9a2b6c0d4e8f1a5b9c3d7e1f5a9b2c6d0e4f8a1b5c9d203' },
  { id: 'a5', date: '2026-08-12', hhmm: '07:30', user: 'Đỗ Anh Quân', action: 'Đăng nhập', target: '—', note: 'Đăng nhập thành công', ip: '10.0.4.31', result: 'Thành công', isSecurity: true, hash: 'f3a7b1c5d9e24f86a0b3c7d1e5f9a2b6c0d4e8f2a6b9c3d7e1f5a8b2c6d0e314' },

  { id: 'a6', date: '2026-08-11', hhmm: '23:48', user: 'Ngô Bảo Ngọc', action: 'Đăng nhập', target: '—', note: 'Đăng nhập ngoài giờ hành chính', ip: '113.190.20.44', result: 'Thành công', isSecurity: true, hash: '04b8c2d6e0f35a79b1c4d8e2f6a0b3c7d1e5f9a2b6c0d4e8f1a5b9c2d6e0f437' },
  { id: 'a7', date: '2026-08-11', hhmm: '20:10', user: 'Ngô Bảo Ngọc', action: 'Xuất báo cáo', target: 'Nhật ký hoạt động', note: 'Xuất 128.400 bản ghi nhật ký (4.2 GB) — phạm vi 90 ngày', ip: '113.190.20.44', result: 'Thành công', isSecurity: true, hash: '159c3d7e1f45a80b2c5d9e3f7a1b4c8d2e6f0a3b7c1d5e9f2a6b0c4d8e1f5a52' },
  { id: 'a8', date: '2026-08-11', hhmm: '17:20', user: 'Đỗ Anh Quân', action: 'Xuất bản', target: 'VM-HV-00001.M3D01 — Bia Tiến sĩ khoa Nhâm Tuất', note: 'Công khai trên cổng tham quan số', ip: '10.0.4.31', result: 'Thành công', isSecurity: false, hash: '26ad4e8f2a56b91c3d6e0f4a8b1c5d9e3f7a0b4c8d1e5f9a2b6c0d3e7f1a4b63' },
  { id: 'a9', date: '2026-08-11', hhmm: '15:03', user: 'Đỗ Anh Quân', action: 'Tải lên', target: 'VM-NN-00002.VID01 — Phim lễ khai bút 2026', note: 'ProRes 4K', ip: '10.0.4.31', result: 'Thành công', isSecurity: false, hash: '37be5f9a3b67ca2d4e8f1a5b9c3d7e0f4a8b1c5d9e2f6a0b3c7d1e4f8a2b5c74' },
  { id: 'a10', date: '2026-08-11', hhmm: '11:40', user: 'Lê Thu Trang', action: 'Tạo bộ sưu tập', target: 'Tư liệu Hán Nôm', note: 'Gộp toàn bộ tư liệu Hán Nôm đã số hóa vào một bộ sưu tập', ip: '10.0.4.25', result: 'Thành công', isSecurity: false, hash: '48cf6a0b4c78db3e5f9a2b6c0d4e8f1a5b9c2d6e0f3a7b1c5d8e2f6a0b3c6d85' },

  { id: 'a11', date: '2026-08-10', hhmm: '16:05', user: 'Phạm Quốc Đạt', action: 'Phê duyệt', target: 'VM-HV-00007.IMG02 — Khánh đá', note: 'Chờ duyệt → Đã duyệt', ip: '10.0.4.9', result: 'Thành công', isSecurity: false, hash: '59d07b1c5d89ec4f6a0b3c7d1e5f9a2b6c0d3e7f1a4b8c2d6e0f3a7b1c4d796' },
  { id: 'a12', date: '2026-08-10', hhmm: '14:22', user: 'Trần Văn Minh', action: 'Tải lên', target: 'VM-CT-00007.M3D01 — Khuê Văn Các', note: 'Mesh 3D, 1 tệp', ip: '10.0.4.18', result: 'Thành công', isSecurity: false, hash: '6ae18c2d6e90fd5a7b1c4d8e2f6a0b3c7d1e4f8a2b6c0d3e7f1a5b8c2d6e0a7' },
  { id: 'a13', date: '2026-08-10', hhmm: '10:33', user: 'Ngô Bảo Ngọc', action: 'Sửa metadata', target: 'VM-TL-00003.TXT01 — Đăng khoa lục khoa thi 1442', note: 'Cập nhật niên đại (EDTF)', ip: '10.0.4.25', result: 'Thành công', isSecurity: false, hash: '7bf29d3e7fa1ee6b8c2d5e9f3a7b1c4d8e2f6a0b3c7d1e5f9a2b6c0d3e7f1b8' },
  { id: 'a14', date: '2026-08-10', hhmm: '09:00', user: 'Vũ Minh Châu', action: 'Đặt lại mật khẩu', target: 'Vũ Minh Châu', note: 'Yêu cầu đặt lại mật khẩu qua email — link gửi bởi quản trị', ip: '10.0.4.2', result: 'Thành công', isSecurity: true, hash: '8c03ae4f80b2ff7c9d3e6f0a4b8c2d6e0f3a7b1c5d9e2f6a0b3c7d1e4f8a2c9' },

  { id: 'a15', date: '2026-08-09', hhmm: '22:14', user: 'Vũ Minh Châu', action: 'Đăng nhập thất bại', target: '—', note: 'Sai mật khẩu (lần 1)', ip: '42.118.7.201', result: 'Thất bại', isSecurity: true, hash: '9d14bf5091c300e8d4f7a1b5c9d2e6f0a4b8c1d5e9f2a6b0c3d7e1f4a8b2ca0' },
  { id: 'a16', date: '2026-08-09', hhmm: '22:15', user: 'Vũ Minh Châu', action: 'Đăng nhập thất bại', target: '—', note: 'Sai mật khẩu (lần 2)', ip: '42.118.7.201', result: 'Thất bại', isSecurity: true, hash: 'ae25c06192d411f9e5a8b2c6d0e4f8a1b5c9d2e6f0a3b7c1d5e9f2a6b0c3db1' },
  { id: 'a17', date: '2026-08-09', hhmm: '22:16', user: 'Vũ Minh Châu', action: 'Đăng nhập thất bại', target: '—', note: 'Sai mật khẩu (lần 3) — vượt ngưỡng, tài khoản tạm khóa', ip: '42.118.7.201', result: 'Thất bại', isSecurity: true, hash: 'bf36d17203e522a0f6b9c3d7e1f5a2b6c0d4e8f1a4b8c2d6e0f3a7b1c5d9ec2' },
  { id: 'a18', date: '2026-08-09', hhmm: '22:20', user: 'Nguyễn Thị Hạnh', action: 'Khóa tài khoản', target: 'Vũ Minh Châu', note: 'Khóa tự động do 3 lần đăng nhập sai liên tiếp — quản trị xác nhận giữ khóa', ip: '10.0.4.2', result: 'Thành công', isSecurity: true, hash: 'c047e28314f633b1a7c0d4e8f2a5b9c3d7e1f4a8b2c6d0e3f7a1b5c9d2e6fd3' },
  { id: 'a19', date: '2026-08-09', hhmm: '08:40', user: 'Lê Thu Trang', action: 'Sửa metadata', target: 'VM-HV-00002.IMG01 — Rùa đội bia khoa Quý Mùi', note: 'Hiệu đính mô tả', ip: '10.0.4.25', result: 'Thành công', isSecurity: false, hash: 'd158f39425073c2a8d1e5f9a3b6c0d4e8f2a5b9c3d7e0f4a8b1c5d9e2f6ae4' },

  { id: 'a20', date: '2026-08-08', hhmm: '16:22', user: 'Nguyễn Thị Hạnh', action: 'Phân quyền', target: 'Vũ Minh Châu', note: 'Biên tập → Chỉ xem', ip: '10.0.4.2', result: 'Thành công', isSecurity: true, hash: 'e269045536184d3b9e2f6a0b4c8d1e5f9a3b6c0d4e8f1a5b9c2d6e0f3a7b1f5' },
  { id: 'a21', date: '2026-08-08', hhmm: '09:05', user: 'Vũ Minh Châu', action: 'Đăng nhập', target: '—', note: 'IP nội bộ', ip: '10.0.4.18', result: 'Thành công', isSecurity: true, hash: 'f37a156647295e4c0f3a7b1c5d9e2f6a0b4c8d1e5f9a2b6c0d3e7f1a4b8c2a6' },
  { id: 'a22', date: '2026-08-08', hhmm: '10:15', user: 'Trần Văn Minh', action: 'Tải lên', target: 'VM-KV-00001.PCL01 — Sân bia, đám mây điểm', note: 'Quét LiDAR đợt VM-DS-2026-03', ip: '10.0.4.18', result: 'Thành công', isSecurity: false, hash: '048b267758306f5d1a4b8c2d6e0f3a7b1c5d9e2f6a0b3c7d1e5f9a2b6c0d3b7' },

  { id: 'a23', date: '2026-08-07', hhmm: '15:48', user: 'Phạm Quốc Đạt', action: 'Yêu cầu bổ sung', target: 'VM-TL-00005.TXT02 — Gia phả họ Nguyễn (trích)', note: 'Thiếu thẩm định song ngữ Hán Nôm — trả về biên tập', ip: '10.0.4.9', result: 'Thành công', isSecurity: false, hash: '159c378869417a6e2b5c9d3e7f0a4b8c2d6e0f3a7b1c5d9e2f6a0b3c7d1e4c8' },
  { id: 'a24', date: '2026-08-07', hhmm: '11:02', user: 'Đỗ Anh Quân', action: 'Tải lên', target: 'VM-CT-00004.DWG01 — Đại Trung Môn, mặt cắt B-B', note: '2 tệp bản vẽ CAD', ip: '10.0.4.31', result: 'Thành công', isSecurity: false, hash: '26ad48997528ab7f3c6d0e4f8a1b5c9d2e6f0a3b7c1d5e9f2a6b0c4d8e1f5d9' },
  { id: 'a25', date: '2026-08-07', hhmm: '09:20', user: 'Ngô Bảo Ngọc', action: 'Đăng nhập', target: '—', note: 'Đăng nhập thành công', ip: '10.0.4.25', result: 'Thành công', isSecurity: true, hash: '37be59a0863bcc80d4e8f1a5b9c2d6e0f3a7b1c5d9e2f6a0b3c7d1e4f8a2ce0' },

  { id: 'a26', date: '2026-08-06', hhmm: '17:55', user: 'Nguyễn Thị Hạnh', action: 'Thu hồi API key', target: 'Thử nghiệm OAI-PMH — nhà thầu cũ', note: 'Hết hợp đồng thử nghiệm, không còn nhu cầu truy cập', ip: '10.0.4.2', result: 'Thành công', isSecurity: true, hash: '48cf6ab197ecdd91e5f9a2b6c0d3e7f1a4b8c2d6e0f3a7b1c5d9e2f6a0b3df1' },
  { id: 'a27', date: '2026-08-06', hhmm: '14:30', user: 'Lê Thu Trang', action: 'Xuất bản', target: 'VM-TL-00002.TXT01 — Bản dập bia Tiến sĩ khoa Ất Mùi', note: 'Đã ký số khi xuất bản', ip: '10.0.4.25', result: 'Thành công', isSecurity: false, hash: '59d07bc208fdee02f6a0b3c7d1e5f9a2b6c0d4e8f1a5b9c2d6e0f3a7b1c4e05' },
  { id: 'a28', date: '2026-08-06', hhmm: '09:11', user: 'Trần Văn Minh', action: 'Đăng nhập', target: '—', note: 'Đăng nhập thành công', ip: '10.0.4.18', result: 'Thành công', isSecurity: true, hash: '6ae18cd319ffff13a7b1c4d8e2f6a0b3c7d1e5f9a2b6c0d3e7f1a4b8c2d6f16' },
];

const USER_OPTIONS = Array.from(new Set(RAW_ENTRIES.map((e) => e.user))).sort();
const ACTION_OPTIONS = Array.from(new Set(RAW_ENTRIES.map((e) => e.action))).sort();
const PAGE_SIZE = 10;
const EXPORT_SCOPES = ['Trang hiện tại', 'Toàn bộ kết quả đã lọc', 'Chỉ sự kiện bảo mật', '7 ngày gần nhất'] as const;

function offHours(hhmm: string): boolean {
  const hour = Number(hhmm.split(':')[0]);
  return hour < 7 || hour >= 20;
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState(RAW_ENTRIES);
  const [query, setQuery] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [securityOnly, setSecurityOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [exportOpen, setExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState<(typeof EXPORT_SCOPES)[number]>('Toàn bộ kết quả đã lọc');
  const [exportDone, setExportDone] = useState(false);

  // Cảnh báo bất thường — derive thật từ dữ liệu, không ghi cứng kết luận.
  const anomalies = useMemo(() => {
    const findings: string[] = [];

    const failuresByUser = new Map<string, AuditEntry[]>();
    entries
      .filter((e) => e.result === 'Thất bại')
      .forEach((e) => {
        const list = failuresByUser.get(e.user) ?? [];
        list.push(e);
        failuresByUser.set(e.user, list);
      });
    failuresByUser.forEach((list, user) => {
      if (list.length >= 3) {
        findings.push(`${list.length} lần đăng nhập sai liên tiếp của ${user} (gần nhất ${dateLabel(list[list.length - 1].date, list[list.length - 1].hhmm)}, IP ${list[list.length - 1].ip})`);
      }
    });

    const offHoursByUser = new Map<string, AuditEntry[]>();
    entries
      .filter((e) => e.isSecurity && offHours(e.hhmm))
      .forEach((e) => {
        const list = offHoursByUser.get(e.user) ?? [];
        list.push(e);
        offHoursByUser.set(e.user, list);
      });
    offHoursByUser.forEach((list, user) => {
      const latest = list[list.length - 1];
      const countLabel = list.length > 1 ? `${list.length} lượt truy cập` : 'Truy cập';
      findings.push(`${countLabel} ngoài giờ hành chính của ${user}, gần nhất lúc ${dateLabel(latest.date, latest.hhmm)} từ IP ${latest.ip}`);
    });

    entries
      .filter((e) => /([\d.,]+)\s*GB/.test(e.note) && parseFloat(e.note.match(/([\d.,]+)\s*GB/)?.[1].replace(',', '.') ?? '0') >= 1)
      .forEach((e) => {
        findings.push(`Xuất dữ liệu khối lượng lớn: ${e.user} — ${e.note} (${dateLabel(e.date, e.hhmm)})`);
      });

    return findings;
  }, [entries]);

  const filtered = useMemo(() => {
    const normQ = normalizeForSearch(query);
    return entries.filter((e) => {
      if (userFilter && e.user !== userFilter) return false;
      if (actionFilter && e.action !== actionFilter) return false;
      if (securityOnly && !e.isSecurity) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (!normQ) return true;
      const haystack = [e.user, e.action, e.target, e.note, e.ip].map(normalizeForSearch).join(' ');
      return haystack.includes(normQ);
    });
  }, [entries, query, userFilter, actionFilter, securityOnly, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setQuery('');
    setUserFilter('');
    setActionFilter('');
    setDateFrom('');
    setDateTo('');
    setSecurityOnly(false);
    setPage(1);
  };

  const doExport = () => {
    const now = { date: TODAY, hhmm: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) };
    const scopeCount = exportScope === 'Trang hiện tại' ? paged.length : exportScope === 'Chỉ sự kiện bảo mật' ? entries.filter((e) => e.isSecurity).length : filtered.length;
    const newEntry: AuditEntry = {
      id: `export-${Date.now()}`,
      date: now.date,
      hhmm: now.hhmm,
      user: 'Bạn',
      action: 'Xuất báo cáo',
      target: 'Nhật ký hoạt động',
      note: `Xuất ${scopeCount} bản ghi — phạm vi: ${exportScope}`,
      ip: '10.0.4.2',
      result: 'Thành công',
      isSecurity: true,
      hash: Math.random().toString(16).slice(2).padEnd(48, '0'),
    };
    setEntries((prev) => [newEntry, ...prev]);
    setExportDone(true);
  };

  return (
    <>
      {anomalies.length > 0 && (
        <div className={styles.anomalyBanner} role="alert">
          <div className={styles.anomalyTitle}>⚠ Cảnh báo bất thường</div>
          <ul className={styles.anomalyList}>
            {anomalies.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.toolbar}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm người dùng, hành động, đối tượng, IP…"
          className={styles.searchInput}
          aria-label="Tìm kiếm trong nhật ký"
        />
        <select
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            setPage(1);
          }}
          className={styles.select}
          aria-label="Lọc theo người dùng"
        >
          <option value="">Tất cả người dùng</option>
          {USER_OPTIONS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className={styles.select}
          aria-label="Lọc theo loại hành động"
        >
          <option value="">Tất cả hành động</option>
          {ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <label className={styles.dateField}>
          <span>Từ</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className={styles.dateInput}
            aria-label="Từ ngày"
          />
        </label>
        <label className={styles.dateField}>
          <span>Đến</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className={styles.dateInput}
            aria-label="Đến ngày"
          />
        </label>
        <label className={styles.toggleField}>
          <input
            type="checkbox"
            checked={securityOnly}
            onChange={(e) => {
              setSecurityOnly(e.target.checked);
              setPage(1);
            }}
            className={styles.checkbox}
          />
          Chỉ sự kiện bảo mật
        </label>
        {(query || userFilter || actionFilter || dateFrom || dateTo || securityOnly) && (
          <button type="button" className={styles.clearBtn} onClick={resetFilters}>
            Xóa lọc
          </button>
        )}
        <button type="button" className={styles.exportBtn} onClick={() => { setExportOpen(true); setExportDone(false); }}>
          Xuất báo cáo
        </button>
      </div>

      <GlassCard dense>
        <div className={styles.tableScroll}>
          <table className="data-table data-table--tight">
            <thead>
              <tr>
                <th style={{ width: 110 }}>THỜI GIAN</th>
                <th>NGƯỜI THỰC HIỆN</th>
                <th>HÀNH ĐỘNG</th>
                <th>ĐỐI TƯỢNG</th>
                <th className="nowrap">ĐỊA CHỈ IP</th>
                <th>KẾT QUẢ</th>
                <th>BẢN GHI</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((e) => (
                <tr key={e.id}>
                  <td className="nowrap muted" style={{ fontSize: 13 }}>
                    {dateLabel(e.date, e.hhmm)}
                  </td>
                  <td className="strong nowrap">{e.user}</td>
                  <td>
                    <StatusPill label={e.action} colors={actionPill(e.action)} small />
                  </td>
                  <td>
                    <div>{e.target}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {e.note}
                    </div>
                  </td>
                  <td className="mono nowrap" style={{ fontSize: 12.5 }}>
                    {e.ip}
                  </td>
                  <td>
                    <StatusPill label={e.result} colors={RESULT_COLORS[e.result]} small />
                  </td>
                  <td>
                    <span
                      className={styles.hashBadge}
                      title="Bản ghi đã ký số, không thể sửa/xóa"
                      aria-label={`Bản ghi đã ký số, không thể sửa hoặc xóa. Mã băm ${e.hash}`}
                      tabIndex={0}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="4" y="10" width="16" height="10" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                      #{e.hash.slice(0, 4)}…
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className={styles.empty}>Không có bản ghi khớp bộ lọc.</p>}
        {filtered.length > 0 && (
          <div className={styles.pagerRow}>
            <span className={styles.pagerLabel}>
              Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length}
            </span>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </GlassCard>

      <p className={styles.retentionNote}>
        Thời hạn lưu nhật ký: theo cấp độ an toàn hệ thống thông tin đã được phê duyệt (TCVN 11930:2017).
      </p>

      {exportOpen && (
        <Modal onClose={() => setExportOpen(false)}>
          <h3 className={styles.modalTitle}>Xuất báo cáo nhật ký</h3>
          {!exportDone ? (
            <>
              <p className={styles.modalDesc}>Chọn phạm vi dữ liệu cần xuất. Việc xuất báo cáo cũng sẽ được ghi lại vào chính nhật ký này.</p>
              <div className={styles.chipRow}>
                {EXPORT_SCOPES.map((s) => (
                  <TagChip key={s} label={s} active={exportScope === s} onClick={() => setExportScope(s)} />
                ))}
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setExportOpen(false)}>
                  Hủy
                </button>
                <button type="button" className={styles.saveBtn} onClick={doExport}>
                  Xuất báo cáo
                </button>
              </div>
            </>
          ) : (
            <>
              <p className={styles.modalDesc}>Đã tạo báo cáo — bản ghi "Xuất báo cáo" vừa được thêm vào đầu nhật ký (đây cũng là một hành động được ghi log).</p>
              <div className={styles.modalFooter} style={{ justifyContent: 'flex-end' }}>
                <button type="button" className={styles.saveBtn} onClick={() => setExportOpen(false)}>
                  Đóng
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
