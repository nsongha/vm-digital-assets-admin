import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import StatusPill from '../components/StatusPill';
import { statePill } from '../components/statusColors';
import { useT } from '../i18n';
import { connectionService, connectionSyncStore } from '../services/mock/connectionService';
import { useStore } from '../services/useStore';
import type { ConnectionSyncState } from '../services/types';
import styles from './SharePage.module.css';

const FREQ_IDS: ConnectionSyncState['freq'][] = ['realtime', 'daily', 'manual'];

export default function SharePage() {
  const { t } = useT();
  const navigate = useNavigate();
  useStore(connectionSyncStore); // re-render on enabled/freq changes
  const [configOpen, setConfigOpen] = useState<string | null>(null);

  const freqLabel = (id: ConnectionSyncState['freq']): string =>
    id === 'realtime' ? t('share.freqRealtime') : id === 'daily' ? t('share.freqDaily') : t('share.freqManual');

  const connections = connectionService.list();
  const apis = connectionService.listApis();
  const reqs = connectionService.listRequests();
  const supervisoryReqs = connectionService.listSupervisoryRequests();
  const compliance = connectionService.listCompliance();
  const configConn = configOpen ? connections.find((c) => c.name === configOpen) : null;

  return (
    <>
      <div style={{ marginTop: 6 }}>
        <h4 className={styles.sectionTitle}>{t('share.connectionsTitle')}</h4>
        <GlassCard flush>
          {connections.map((cn) => (
            <div key={cn.name} className={styles.connRow}>
              <div>
                <div className={styles.connKind}>{cn.kind}</div>
                <StatusPill label={cn.status} colors={statePill(cn.status)} />
              </div>
              <div className={styles.connMain}>
                <div className={styles.connName}>{cn.name}</div>
                <div className={styles.connDesc}>{cn.desc}</div>
              </div>
              <div className={styles.connActions}>
                <div className={styles.connSync}>{cn.sync}</div>
                <div className={styles.connBtns}>
                  <button type="button" title={t('common.viewLog')} className={styles.iconBtn} onClick={() => navigate('/logs')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                  </button>
                  <button type="button" title={t('common.configure')} className={styles.iconBtn} onClick={() => setConfigOpen(cn.name)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.35.4.65.74.85.26.15.56.24.86.25H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      {supervisoryReqs.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <h4 className={styles.sectionTitle}>{t('share.supervisoryTitle')}</h4>
          <GlassCard dense>
            <table className="data-table data-table--tight">
              <tbody>
                {supervisoryReqs.map((rq) => (
                  <tr key={rq.org}>
                    <td style={{ width: 220 }}>
                      <div className="strong">{rq.org}</div>
                      <div className={styles.reqWhat}>{t('share.supervisoryRole')}</div>
                    </td>
                    <td>
                      <div className={styles.reqWhat}>{rq.what}</div>
                    </td>
                    <td className="nowrap muted" style={{ fontSize: 13 }}>
                      {rq.date}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <StatusPill label={rq.status} colors={statePill(rq.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>
      )}

      <div className={styles.twoCol}>
        <GlassCard dense>
          <h4 className={styles.cardTitle}>{t('share.apiTitle')}</h4>
          <table className="data-table data-table--tight">
            <tbody>
              {apis.map((ap) => (
                <tr key={ap.name}>
                  <td className="mono" style={{ fontSize: 13 }}>
                    {ap.name}
                  </td>
                  <td className="nowrap muted" style={{ fontSize: 13 }}>
                    {ap.fmt}
                  </td>
                  <td className="strong" style={{ textAlign: 'right' }}>
                    {ap.calls}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <StatusPill label={ap.status} colors={statePill(ap.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
        <GlassCard dense>
          <h4 className={styles.cardTitle}>{t('share.requestsTitle')}</h4>
          <table className="data-table data-table--tight">
            <tbody>
              {reqs.map((rq) => (
                <tr key={rq.org}>
                  <td>
                    <div className="strong">{rq.org}</div>
                    <div className={styles.reqWhat}>{rq.what}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <StatusPill label={rq.status} colors={statePill(rq.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>

      <div className={styles.twoCol}>
        <GlassCard dark>
          <h4 className={styles.complianceTitle}>{t('share.complianceTitle')}</h4>
          {compliance.map((cp) => (
            <div key={cp.label} className={styles.complianceRow}>
              <span className={styles.complianceLabel}>{cp.label}</span>
              <StatusPill label={cp.state} colors={statePill(cp.state)} />
            </div>
          ))}
        </GlassCard>
        <GlassCard dark>
          <div className={styles.contactKicker}>{t('share.contactKicker')}</div>
          <h4 className={styles.contactName}>Nguyễn Thị Hạnh</h4>
          <p className={styles.contactDesc}>{t('share.contactDesc')}</p>
          <div className={styles.contactInfo}>024 3845 2917 · data@vanmieu.vn</div>
        </GlassCard>
      </div>

      {configConn && (
        <Modal onClose={() => setConfigOpen(null)}>
          <div className={styles.modalHead}>
            <div>
              <div className={styles.modalKind}>{configConn.kind}</div>
              <h3 className={styles.modalName}>{configConn.name}</h3>
            </div>
            <button type="button" className={styles.modalClose} onClick={() => setConfigOpen(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className={styles.modalDesc}>{configConn.desc}</p>

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleTitle}>{t('share.modalToggleTitle')}</div>
              <div className={styles.toggleSub}>{t('share.modalToggleSub')}</div>
            </div>
            <div
              onClick={() => connectionService.toggleEnabled(configConn.name)}
              className={styles.switchTrack}
              style={{ background: configConn.enabled ? 'var(--ink)' : '#dcdcd0' }}
            >
              <div className={styles.switchKnob} style={{ left: configConn.enabled ? '21px' : '3px' }} />
            </div>
          </div>

          <label className={styles.modalLabel}>{t('share.modalEndpointLabel')}</label>
          <div className={styles.endpointBox}>{configConn.endpoint}</div>

          <label className={styles.modalLabel}>{t('share.modalKeyLabel')}</label>
          <div className={styles.keyRow}>
            <div className={styles.keyBox}>••••••••••••••••{configConn.keyTail}</div>
            <button type="button" className={styles.regenBtn}>
              {t('common.regenerate')}
            </button>
          </div>

          <label className={styles.modalLabel}>{t('share.modalFreqLabel')}</label>
          <div className={styles.freqRow}>
            {FREQ_IDS.map((id) => (
              <a
                key={id}
                onClick={() => connectionService.setFreq(configConn.name, id)}
                className={styles.freqChip}
                style={{
                  background: configConn.freq === id ? 'var(--ink)' : '#f2f1e9',
                  color: configConn.freq === id ? '#ffffff' : '#5f5f54',
                }}
              >
                {freqLabel(id)}
              </a>
            ))}
          </div>

          <div className={styles.modalFooter}>
            <span className={styles.modalSync}>{configConn.sync}</span>
            <div className={styles.modalFooterBtns}>
              <button type="button" className={styles.cancelBtn} onClick={() => setConfigOpen(null)}>
                {t('common.cancel')}
              </button>
              <button type="button" className={styles.saveBtn} onClick={() => setConfigOpen(null)}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
