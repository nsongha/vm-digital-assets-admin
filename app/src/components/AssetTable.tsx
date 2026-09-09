import { useNavigate } from 'react-router-dom';
import { DIGITAL_FORM_LABELS } from '../data/taxonomy';
import type { Asset } from '../services/types';
import StatusPill from './StatusPill';
import { statusPill } from './statusColors';

interface AssetTableProps {
  assets: Asset[];
}

/** Library table — ported from the `isLib` table in v3.html. */
export default function AssetTable({ assets }: AssetTableProps) {
  const navigate = useNavigate();
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>MÃ</th>
            <th>TÊN DỮ LIỆU SỐ HÓA</th>
            <th>DẠNG DỮ LIỆU</th>
            <th>ĐỊNH DẠNG</th>
            <th>DUNG LƯỢNG</th>
            <th>TRẠNG THÁI</th>
            <th>CẬP NHẬT</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr
              key={a.id}
              className="clickable"
              tabIndex={0}
              role="button"
              aria-label={`Xem chi tiết ${a.name}`}
              onClick={() => navigate(`/assets/${a.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/assets/${a.id}`);
                }
              }}
            >
              <td className="strong nowrap">{a.code}</td>
              <td>{a.name}</td>
              <td className="nowrap">{DIGITAL_FORM_LABELS[a.digitalForm]}</td>
              <td className="nowrap muted">{a.fmt}</td>
              <td className="nowrap">{a.size}</td>
              <td>
                <StatusPill label={a.status} colors={statusPill(a.status)} />
              </td>
              <td className="nowrap muted">{a.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
