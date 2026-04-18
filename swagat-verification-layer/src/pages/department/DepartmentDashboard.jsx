import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { updateGrievanceStatus } from '../../store/grievanceSlice';
import { departments } from '../../mockData/departments';

export default function DepartmentDashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const grievances = useSelector(state => state.grievances.items);
  const [filter, setFilter] = useState('all');
  const [resolveModal, setResolveModal] = useState(null);
  const [resolution, setResolution] = useState('');
  const [toast, setToast] = useState(null);

  const deptGrievances = grievances.filter(g => g.department === user.department);
  const dept = departments.find(d => d.name === user.department);

  const filtered = filter === 'all'
    ? deptGrievances
    : deptGrievances.filter(g => g.status === filter);

  const stats = {
    total: deptGrievances.length,
    pending: deptGrievances.filter(g => g.status === 'pending').length,
    verification: deptGrievances.filter(g => g.status === 'resolved_pending_verification').length,
    resolved: deptGrievances.filter(g => g.status === 'verified_resolved').length,
    reopened: deptGrievances.filter(g => g.status === 'auto_reopened').length,
  };

  const handleResolve = (grievanceId) => {
    dispatch(updateGrievanceStatus({
      id: grievanceId,
      status: 'resolved_pending_verification',
      resolution: {
        attemptAt: new Date().toISOString(),
        officerId: user.id,
        photoUrl: null,
        gpsLog: null,
        ivrConfirmed: null,
        ivrTimestamp: null,
        resolution: resolution,
      }
    }));
    setResolveModal(null);
    setResolution('');
    showToast('ફરિયાદ ઉકેલાયેલ તરીકે ચિહ્નિત — ચકાસણી શરૂ');
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const statusConfig = {
    pending: { label: t('status.pending'), class: 'badge-pending', icon: '⏳' },
    verified_resolved: { label: t('status.verified_resolved'), class: 'badge-resolved', icon: '✅' },
    auto_reopened: { label: t('status.auto_reopened'), class: 'badge-reopened', icon: '🔄' },
    resolved_pending_verification: { label: t('status.resolved_pending_verification'), class: 'badge-verification', icon: '🔍' },
  };

  const scoreColor = dept?.qualityScore >= 80 ? '#34d399' : dept?.qualityScore >= 50 ? '#fbbf24' : '#f87171';

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

      {/* Stats & Score */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="stat-card stat-card-blue animate-fadeInUp stagger-1" style={{ opacity: 0 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>📋 {t('common.total')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa' }}>{stats.total}</p>
        </div>
        <div className="stat-card stat-card-yellow animate-fadeInUp stagger-2" style={{ opacity: 0 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>⏳ {t('citizen.pending')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24' }}>{stats.pending}</p>
        </div>
        <div className="stat-card stat-card-green animate-fadeInUp stagger-3" style={{ opacity: 0 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>✅ {t('citizen.resolved')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#34d399' }}>{stats.resolved}</p>
        </div>
        <div className="stat-card animate-fadeInUp stagger-4" style={{
          opacity: 0,
          background: `linear-gradient(135deg, ${scoreColor}15, ${scoreColor}05)`,
          border: `1px solid ${scoreColor}33`,
        }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>⭐ {t('department.qualityScore')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: scoreColor }}>{dept?.qualityScore || 0}</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'બધી' },
          { key: 'pending', label: '⏳ પેન્ડિંગ' },
          { key: 'resolved_pending_verification', label: '🔍 ચકાસણી' },
          { key: 'verified_resolved', label: '✅ ઉકેલાયેલ' },
          { key: 'auto_reopened', label: '🔄 ફરી ખુલ્લી' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: '1px solid',
              borderColor: filter === f.key ? '#3b82f6' : 'rgba(255,255,255,0.1)',
              background: filter === f.key ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: filter === f.key ? '#60a5fa' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-gujarati)',
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

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            📭 {t('common.noData')}
          </div>
        ) : (
          filtered.map(g => (
            <div key={g.id} style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>{g.id}</span>
                  <span className={`badge ${statusConfig[g.status]?.class}`}>
                    {statusConfig[g.status]?.icon} {statusConfig[g.status]?.label}
                  </span>
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 4 }}>{g.description}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                  📍 {g.location.address} | 📞 {g.complainantMobile} | {new Date(g.submittedAt).toLocaleDateString('gu-IN')}
                </p>
              </div>
              {g.status === 'pending' && (
                <button
                  onClick={() => setResolveModal(g)}
                  className="glow-btn glow-btn-green"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {t('department.markResolved')}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}
        onClick={() => setResolveModal(null)}
        >
          <div
            className="glass-card animate-fadeInUp"
            style={{ maxWidth: 480, width: '100%', padding: 32 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
              ✅ {t('department.markResolved')}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 20 }}>
              {resolveModal.id} — {resolveModal.description}
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block' }}>
                {t('department.resolutionNote')} *
              </label>
              <textarea
                className="input-dark"
                rows={3}
                placeholder="ઉકેલ વિગત લખો..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </div>
            <div style={{
              padding: '12px 16px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 10,
              fontSize: '0.8rem',
              color: '#fbbf24',
              marginBottom: 20,
            }}>
              ⚠️ "ઉકેલાયેલ" ચિહ્નિત થવા પર ચકાસણી ફ્લો ટ્રિગર થશે: ફિલ્ડ ઓફિસર + IVR + GPS
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setResolveModal(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-gujarati)',
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleResolve(resolveModal.id)}
                className="glow-btn glow-btn-green"
                style={{ flex: 2, padding: 12, fontSize: '0.95rem' }}
                disabled={!resolution}
              >
                {t('department.triggerVerification')} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast toast-success">
          ✅ {toast}
        </div>
      )}
    </div>
  );
}
