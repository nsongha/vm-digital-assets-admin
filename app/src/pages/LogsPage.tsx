import GlassCard from '../components/GlassCard';
import StatusPill from '../components/StatusPill';
import { actionPill } from '../components/statusColors';
import { services } from '../services';

export default function LogsPage() {
  const logs = services.audit.list();

  return (
    <GlassCard dense style={{ marginTop: 6 }}>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 120 }}>THỜI GIAN</th>
              <th>NGƯỜI THỰC HIỆN</th>
              <th>HÀNH ĐỘNG</th>
              <th>ĐỐI TƯỢNG</th>
              <th>GHI CHÚ</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((r, i) => (
              <tr key={i}>
                <td className="nowrap muted" style={{ width: 120, fontSize: 13 }}>
                  {r.time}
                </td>
                <td className="strong nowrap">{r.user}</td>
                <td>
                  <StatusPill label={r.action} colors={actionPill(r.action)} />
                </td>
                <td>{r.target}</td>
                <td className="muted" style={{ fontSize: 13 }}>
                  {r.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
