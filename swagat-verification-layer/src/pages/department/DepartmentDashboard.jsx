import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { fetchDeptGrievances, updateGrievanceAction } from '../../store/grievanceSlice';

export default function DepartmentDashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: grievances, loading } = useSelector(state => state.grievances);
  
  const [filter, setFilter] = useState('all');
  const [resolveModal, setResolveModal] = useState(null);
  const [ivrModal, setIvrModal] = useState(null);
  const [ivrCalling, setIvrCalling] = useState(false);
  const [ivrCallSid, setIvrCallSid] = useState(null);
  const [resolution, setResolution] = useState('');
  const [toast, setToast] = useState(null);
  const [escalationAlert, setEscalationAlert] = useState(null);

  useEffect(() => {
    if (user?.department) {
      dispatch(fetchDeptGrievances(user.department));
      fetch(`http://localhost:5000/api/escalations/dept/${encodeURIComponent(user.department)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setEscalationAlert(data[0]);
          }
        })
        .catch(() => {});
    }
  }, [user, dispatch]);

  const filtered = filter === 'all'
    ? grievances
    : grievances.filter(g => g.status === filter);

  const stats = {
    total: grievances.length,
    pending: grievances.filter(g => g.status === 'pending' || g.status === 'auto_reopened').length,
    awaiting: grievances.filter(g => g.status === 'field_verified').length,
    resolved: grievances.filter(g => g.status === 'verified_resolved').length,
  };

  const handleResolve = async (grievanceId) => {
    await dispatch(updateGrievanceAction({
      id: grievanceId,
      status: 'resolved_pending_verification',
      resolutionNote: resolution,
      officerId: user.id
    }));
    setResolveModal(null);
    setResolution('');
    showToast(t('department.successMsg'));
  };

  const handleOpenIvr = async (grievance) => {
    setIvrModal(grievance);
    setIvrCalling(true);
    try {
      const res = await fetch(`http://localhost:5000/api/ivr/call/${grievance.grievanceId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setIvrCallSid(data.callSid);
        showToast(`📞 IVR call initiated to ${data.to}`);
      } else {
        showToast(`⚠️ ${data.message}`);
      }
    } catch (err) {
      showToast('⚠️ Could not connect to server');
    } finally {
      setIvrCalling(false);
    }
  };

  const handleIvrResult = async (grievanceId, key) => {
    const status = key === 1 ? 'verified_resolved' : 'auto_reopened';
    const note = key === 1 ? 'IVR: Citizen confirmed resolution' : 'IVR: Citizen not satisfied — reopened';
    await dispatch(updateGrievanceAction({ id: grievanceId, status, resolutionNote: note }));
    setIvrModal(null);
    setIvrCallSid(null);
    showToast(key === 1 ? t('department.resolvedMsg') : t('department.reopenedMsg'));
    dispatch(fetchDeptGrievances(user.department));
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const statusConfig = {
    pending:                      { label: t('status.pending'),                       class: 'badge-pending',      icon: '⏳' },
    verified_resolved:            { label: t('status.verified_resolved'),              class: 'badge-resolved',     icon: '✅' },
    auto_reopened:                { label: t('status.auto_reopened'),                  class: 'badge-reopened',     icon: '🔄' },
    resolved_pending_verification:{ label: t('status.resolved_pending_verification'),  class: 'badge-verification', icon: '🔍' },
    field_verified:               { label: t('status.field_verified'),                 class: 'badge-pending',      icon: '📞' },
  };

  const filters = [
    { key: 'all',                          label: t('common.filter') + ': ' + t('dept.all') },
    { key: 'pending',                      label: `⏳ ${t('status.pending')}` },
    { key: 'auto_reopened',               label: `🔄 ${t('status.auto_reopened')}` },
    { key: 'resolved_pending_verification',label: `🔍 ${t('status.resolved_pending_verification')}` },
    { key: 'field_verified',              label: `📞 ${t('status.field_verified')}` },
    { key: 'verified_resolved',           label: `✅ ${t('status.verified_resolved')}` },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          <span className="gradient-text">{t('department.dashboard')}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: 4 }}>
          {user.department} — {user.name}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="stat-card stat-card-blue animate-fadeInUp stagger-1" style={{ opacity: 1 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>📋 {t('common.total')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa' }}>{stats.total}</p>
        </div>
        <div className="stat-card stat-card-yellow animate-fadeInUp stagger-2" style={{ opacity: 1 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>⏳ {t('dept.pendingAction')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24' }}>{stats.pending}</p>
        </div>
        <div className="stat-card stat-card-blue animate-fadeInUp stagger-3" style={{ opacity: 1, border: '1px solid rgba(245,158,11,0.4)' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>📞 {t('dept.ivrWaiting')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24' }}>{stats.awaiting}</p>
        </div>
        <div className="stat-card stat-card-green animate-fadeInUp stagger-4" style={{ opacity: 1 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>✅ {t('citizen.resolved')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#34d399' }}>{stats.resolved}</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: '1px solid',
              borderColor: filter === f.key ? '#3b82f6' : 'rgba(255,255,255,0.1)',
              background: filter === f.key ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: filter === f.key ? '#60a5fa' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grievance List */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>
            {t('department.assignedGrievances')} ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'gray' }}>{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            📭 {t('common.noData')}
          </div>
        ) : (
          filtered.map(g => (
            <div key={g.grievanceId} style={{
              padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>{g.grievanceId}</span>
                  <span className={`badge ${statusConfig[g.status]?.class}`}>
                    {statusConfig[g.status]?.icon} {statusConfig[g.status]?.label}
                  </span>
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 4 }}>{g.description}</p>
                {g.imageUrl && (
                  <img
                    src={`http://localhost:5000${g.imageUrl}`}
                    alt="Citizen evidence"
                    style={{
                      width: 120, height: 80, objectFit: 'cover', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)', marginBottom: 6, cursor: 'pointer',
                    }}
                    onClick={(e) => { e.stopPropagation(); window.open(`http://localhost:5000${g.imageUrl}`, '_blank'); }}
                  />
                )}
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                  📍 {g.location?.address} | 📞 {g.complainantMobile?.substring(0, 2)}******{g.complainantMobile?.substring(8)} | {new Date(g.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {(g.status === 'pending' || g.status === 'auto_reopened') && (
                  <button
                    onClick={() => setResolveModal(g)}
                    className="glow-btn glow-btn-green"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    ✅ {t('department.resolve')}
                  </button>
                )}

                {g.status === 'field_verified' && (
                  <button
                    onClick={() => handleOpenIvr(g)}
                    className="glow-btn glow-btn-green"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    ✅ {t('dept.ivrCallBtn')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
        }}
        onClick={() => setResolveModal(null)}
        >
          <div className="glass-card animate-fadeInUp" style={{ maxWidth: 480, width: '100%', padding: 32 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>✅ {t('department.resolveModal')}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 20 }}>
              {resolveModal.grievanceId} — {resolveModal.description}
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>
                {t('department.resolutionDetails')} *
              </label>
              <textarea
                className="input-dark" rows={3} placeholder={t('department.resolutionPlaceholder')}
                value={resolution} onChange={(e) => setResolution(e.target.value)}
              />
            </div>
            <div style={{
              padding: '12px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 10, fontSize: '0.85rem', color: '#fbbf24', marginBottom: 20,
            }}>
              ⚠️ {t('dept.fieldOfficerNote')}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setResolveModal(null)} style={{
                flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              }}>
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleResolve(resolveModal.grievanceId)}
                className="glow-btn glow-btn-green"
                style={{ flex: 2, padding: 12, fontSize: '0.95rem' }}
                disabled={!resolution}
              >
                ✅ {t('department.submitResolution')} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IVR Modal */}
      {ivrModal && (
        <IvrModal 
          grievance={ivrModal} 
          onClose={() => { setIvrModal(null); setIvrCallSid(null); }} 
          ivrCalling={ivrCalling}
          callSid={ivrCallSid}
        />
      )}

      {toast && (
        <div className="toast toast-success">✅ {toast}</div>
      )}

      {/* Escalation Alert Popup */}
      {escalationAlert && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="glass-card animate-fadeInUp" style={{
            maxWidth: 460, width: '100%', padding: 40, textAlign: 'center',
            border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 0 60px rgba(239,68,68,0.2)',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #991b1b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, margin: '0 auto 20px', boxShadow: '0 0 40px rgba(239,68,68,0.5)',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }}>⚠️</div>

            <h3 style={{ color: '#f87171', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
              {t('dept.escalationTitle')}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: 20 }}>
              {t('dept.receivedFrom')} {escalationAlert.sentBy} • {new Date(escalationAlert.createdAt).toLocaleString()}
            </p>

            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 12, padding: '16px 20px', marginBottom: 28,
              fontSize: '0.9rem', color: '#fca5a5', lineHeight: 1.8, textAlign: 'left',
            }}>
              {escalationAlert.message}
            </div>

            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: 20 }}>
              {t('dept.escalationNote')}
            </p>

            <button
              onClick={async () => {
                await fetch(`http://localhost:5000/api/escalations/${escalationAlert._id}/read`, {
                  method: 'PATCH',
                });
                setEscalationAlert(null);
              }}
              className="glow-btn glow-btn-red"
              style={{ padding: '12px 40px', fontSize: '0.95rem', fontWeight: 800 }}
            >
              ✅ {t('dept.acknowledge')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IvrModal({ grievance, onClose, ivrCalling, callSid }) {
  const { t } = useTranslation();
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20,
    }} onClick={onClose}>
      <div className="glass-card animate-fadeInUp" style={{ maxWidth: 380, width: '100%', padding: 36, textAlign: 'center' }} onClick={e => e.stopPropagation()}>

        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: ivrCalling
            ? 'linear-gradient(135deg, #6b7280, #4b5563)'
            : callSid
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 20px',
          boxShadow: ivrCalling ? 'none' : '0 0 30px rgba(245,158,11,0.5)',
          animation: ivrCalling ? 'pulse-glow 1s ease-in-out infinite' : 'none',
        }}>
          {ivrCalling ? '⏳' : callSid ? '✅' : '📞'}
        </div>

        <h3 style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
          {ivrCalling ? t('dept.ivrInitiating') : callSid ? t('dept.ivrConnected') : t('dept.ivrCall')}
        </h3>

        <div style={{
          display: 'inline-block',
          background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)',
          borderRadius: 10, padding: '10px 20px', marginBottom: 20,
        }}>
          <span style={{ color: '#60a5fa', fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {grievance.grievanceId}
          </span>
        </div>

        {ivrCalling && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            {t('dept.ivrWaitMsg')}
          </p>
        )}

        {callSid && !ivrCalling && (
          <p style={{ color: '#34d399', fontSize: '0.85rem' }}>
            {t('dept.ivrConnectedMsg')}
          </p>
        )}

        <button onClick={onClose} style={{
          marginTop: 24, padding: '10px 28px', borderRadius: 10,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem',
        }}>
          ✕ {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
