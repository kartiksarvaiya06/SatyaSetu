import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { updateGrievanceStatus } from '../../store/grievanceSlice';

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const grievances = useSelector(state => state.grievances.items);
  const [showIvrModal, setShowIvrModal] = useState(false);
  const [ivrGrievance, setIvrGrievance] = useState(null);

  const myGrievances = grievances.filter(g => g.complainantMobile === user.mobile);

  const stats = {
    total: myGrievances.length,
    resolved: myGrievances.filter(g => g.status === 'verified_resolved').length,
    pending: myGrievances.filter(g => g.status === 'pending').length,
    reopened: myGrievances.filter(g => g.status === 'auto_reopened').length,
    verification: myGrievances.filter(g => g.status === 'resolved_pending_verification').length,
  };

  const statusConfig = {
    pending: { label: t('status.pending'), class: 'badge-pending', icon: '⏳' },
    verified_resolved: { label: t('status.verified_resolved'), class: 'badge-resolved', icon: '✅' },
    auto_reopened: { label: t('status.auto_reopened'), class: 'badge-reopened', icon: '🔄' },
    resolved_pending_verification: { label: t('status.resolved_pending_verification'), class: 'badge-verification', icon: '🔍' },
  };

  const handleIvrSimulate = (grievance) => {
    setIvrGrievance(grievance);
    setShowIvrModal(true);
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>
            <span className="gradient-text">{t('citizen.dashboard')}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: 4 }}>
            નમસ્તે, {user.name} 👋
          </p>
        </div>
        <Link to="/citizen/submit" className="glow-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          ✚ {t('citizen.newGrievance')}
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: t('citizen.totalGrievances'), value: stats.total, icon: '📋', colorClass: 'stat-card-blue', color: '#60a5fa' },
          { label: t('citizen.resolved'), value: stats.resolved, icon: '✅', colorClass: 'stat-card-green', color: '#34d399' },
          { label: t('citizen.pending'), value: stats.pending, icon: '⏳', colorClass: 'stat-card-yellow', color: '#fbbf24' },
          { label: t('citizen.reopened'), value: stats.reopened, icon: '🔄', colorClass: 'stat-card-red', color: '#f87171' },
        ].map((stat, i) => (
          <div key={i} className={`stat-card ${stat.colorClass} animate-fadeInUp stagger-${i + 1}`} style={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>{stat.icon}</span>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{stat.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grievance List */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{t('citizen.myGrievances')}</h2>
        </div>

        {myGrievances.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>📭</p>
            <p>{t('common.noData')}</p>
          </div>
        ) : (
          <div>
            {myGrievances.map((g, i) => (
              <div
                key={g.id}
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  flexWrap: 'wrap',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
                      {g.id}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{g.category}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: 4 }}>
                    {g.description.length > 80 ? g.description.substring(0, 80) + '...' : g.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                      📍 {g.location.address}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
                      {new Date(g.submittedAt).toLocaleDateString('gu-IN')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${statusConfig[g.status]?.class || ''}`}>
                    {statusConfig[g.status]?.icon} {statusConfig[g.status]?.label || g.status}
                  </span>
                  {g.status === 'resolved_pending_verification' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleIvrSimulate(g); }}
                      className="glow-btn-gold"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      📞 IVR
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IVR Modal */}
      {showIvrModal && ivrGrievance && (
        <IvrModal
          grievance={ivrGrievance}
          onClose={() => setShowIvrModal(false)}
        />
      )}
    </div>
  );
}

function IvrModal({ grievance, onClose }) {
  const [phase, setPhase] = useState('ringing');
  const reduxDispatch = useDispatch();

  useState(() => {
    setTimeout(() => setPhase('speaking'), 2000);
  }, []);

  const handlePress = (key) => {
    if (key === 1) {
      reduxDispatch(updateGrievanceStatus({
        id: grievance.id,
        status: 'verified_resolved'
      }));
    } else {
      reduxDispatch(updateGrievanceStatus({
        id: grievance.id,
        status: 'auto_reopened'
      }));
    }
    setPhase('done');
    setTimeout(onClose, 1500);
  };

  return (
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
    onClick={onClose}
    >
      <div
        className="glass-card animate-fadeInUp"
        style={{ maxWidth: 380, width: '100%', padding: 32, textAlign: 'center' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: phase === 'done'
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          margin: '0 auto 20px',
        }}
        className={phase === 'ringing' ? 'animate-pulse-glow' : ''}
        >
          {phase === 'ringing' ? '📞' : phase === 'done' ? '✓' : '🎤'}
        </div>

        <h3 style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          {phase === 'ringing' ? 'IVR કૉલ...' : phase === 'done' ? 'આભાર!' : 'સ્વાગત પોર્ટલ'}
        </h3>

        {phase === 'speaking' && (
          <>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.8 }}>
              "નમસ્તે, સ્વાગત પોર્ટલ તરફથી ફોન છે. તમારી ફરિયાદ નંબર <span style={{ color: '#60a5fa', fontWeight: 600 }}>{grievance.id}</span> ઉકેલાયેલી જાહેર કરવામાં આવી છે."
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => handlePress(1)}
                className="glow-btn glow-btn-green"
                style={{ padding: '12px 24px', fontSize: '0.9rem' }}
              >
                1️⃣ હા, ઉકેલાઈ ગઈ
              </button>
              <button
                onClick={() => handlePress(2)}
                className="glow-btn glow-btn-red"
                style={{ padding: '12px 24px', fontSize: '0.9rem' }}
              >
                2️⃣ ના, હજી છે
              </button>
            </div>
          </>
        )}

        {phase === 'ringing' && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            કૉલ કનેક્ટ થઈ રહ્યો છે...
          </p>
        )}

        {phase === 'done' && (
          <p style={{ color: '#34d399', fontSize: '0.9rem' }}>
            તમારો પ્રતિસાદ નોંધાય ગયો છે.
          </p>
        )}
      </div>
    </div>
  );
}
