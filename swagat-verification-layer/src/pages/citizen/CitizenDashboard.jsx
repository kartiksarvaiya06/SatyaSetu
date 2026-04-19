import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { fetchUserGrievances } from '../../store/grievanceSlice';

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: grievances, loading } = useSelector(state => state.grievances);

  useEffect(() => {
    if (user?.mobile) {
      dispatch(fetchUserGrievances(user.mobile));
    }
  }, [user, dispatch]);

  const stats = {
    total: grievances.length,
    resolved: grievances.filter(g => g.status === 'verified_resolved').length,
    pending: grievances.filter(g => g.status === 'pending').length,
    reopened: grievances.filter(g => g.status === 'auto_reopened').length,
  };

  const statusConfig = {
    pending: { label: 'પ્રક્રિયામાં', class: 'badge-pending', icon: '⏳' },
    verified_resolved: { label: 'ઉકેલાઈ ગઈ', class: 'badge-resolved', icon: '✅' },
    auto_reopened: { label: 'ફરી ખુલ્લી', class: 'badge-reopened', icon: '🔄' },
    resolved_pending_verification: { label: 'ફિલ્ડ ચકાસણી', class: 'badge-verification', icon: '🔍' },
    field_verified: { label: 'IVR પ્રતીક્ષા', class: 'badge-pending', icon: '📞' },
  };

  if (loading && grievances.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <p style={{ color: 'white' }}>લોડ થઈ રહ્યું છે...</p>
      </div>
    );
  }

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
          <div key={i} className={`stat-card ${stat.colorClass} animate-fadeInUp stagger-${i + 1}`} style={{ opacity: 1 }}>
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

        {grievances.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>📭</p>
            <p>{t('common.noData')}</p>
          </div>
        ) : (
          <div>
            {grievances.map((g) => (
              <div
                key={g.grievanceId}
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
                      {g.grievanceId}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{g.category}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: 4 }}>
                    {g.description.length > 80 ? g.description.substring(0, 80) + '...' : g.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                      📍 {g.location?.address}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
                      {new Date(g.createdAt).toLocaleDateString('gu-IN')}
                    </span>
                  </div>
                </div>
                <span className={`badge ${statusConfig[g.status]?.class || 'badge-pending'}`}>
                  {statusConfig[g.status]?.icon} {statusConfig[g.status]?.label || g.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
