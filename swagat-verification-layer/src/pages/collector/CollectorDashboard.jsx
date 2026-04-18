import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { departments } from '../../mockData/departments';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';

export default function CollectorDashboard() {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const grievances = useSelector(state => state.grievances.items);
  const [selectedDept, setSelectedDept] = useState(null);

  const totalDepts = departments.length;
  const avgScore = Math.round(departments.reduce((sum, d) => sum + d.qualityScore, 0) / totalDepts);
  const pendingVerifications = grievances.filter(g => g.status === 'resolved_pending_verification').length;
  const autoReopens = grievances.filter(g => g.status === 'auto_reopened').length;

  const chartData = departments.map(d => ({
    name: d.nameGu,
    score: d.qualityScore,
    autoReopens: d.autoReopens,
    disputes: d.disputedByCitizen,
  })).sort((a, b) => b.score - a.score);

  const getBarColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const failedGrievances = grievances.filter(g => g.status === 'auto_reopened');

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          <span className="gradient-text">{t('collector.dashboard')}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: 4 }}>
          {user.name} | {user.district} જિલ્લો
        </p>
      </div>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: t('collector.totalDepartments'), value: totalDepts, icon: '🏢', colorClass: 'stat-card-blue', color: '#60a5fa' },
          { label: t('collector.avgScore'), value: avgScore, icon: '⭐', colorClass: 'stat-card-green', color: avgScore >= 80 ? '#34d399' : avgScore >= 50 ? '#fbbf24' : '#f87171' },
          { label: t('collector.pendingVerifications'), value: pendingVerifications, icon: '🔍', colorClass: 'stat-card-yellow', color: '#fbbf24' },
          { label: t('collector.autoReopens'), value: autoReopens, icon: '🔄', colorClass: 'stat-card-red', color: '#f87171' },
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

      {/* Quality Score Chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
          📊 {t('collector.leaderboard')} — {t('department.qualityScore')}
        </h2>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                  fontSize: 13,
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }}></span> 80+ (Excellent)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b' }}></span> 50-79 (Average)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#ef4444' }}></span> &lt;50 (Poor)
          </span>
        </div>
      </div>

      {/* Department Details */}
      <div className="glass-card" style={{ overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>
            🏢 {t('collector.departmentScores')}
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['વિભાગ', 'સ્કોર', 'ઉકેલાયેલ', 'ફરી ખુલ્લી', 'વિવાદ', 'સરેરાશ દિવસ', 'ક્રિયા'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => {
                const scoreColor = dept.qualityScore >= 80 ? '#34d399' : dept.qualityScore >= 50 ? '#fbbf24' : '#f87171';
                return (
                  <tr
                    key={dept.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{dept.nameGu}</span>
                      <br />
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{dept.name}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        color: scoreColor,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        fontFamily: 'var(--font-inter)',
                      }}>
                        {dept.qualityScore}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#34d399', fontFamily: 'var(--font-inter)' }}>
                      {dept.totalResolved}/{dept.totalAttempts}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#f87171', fontFamily: 'var(--font-inter)' }}>
                      {dept.autoReopens}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#fbbf24', fontFamily: 'var(--font-inter)' }}>
                      {dept.disputedByCitizen}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>
                      {dept.avgResolutionDays}d
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {dept.qualityScore < 50 && (
                        <button
                          className="glow-btn glow-btn-red"
                          style={{ padding: '4px 12px', fontSize: '0.7rem' }}
                          onClick={() => setSelectedDept(dept)}
                        >
                          {t('collector.escalate')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failed Verifications */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>
            🔴 {t('collector.failedVerifications')}
          </h2>
        </div>
        {failedGrievances.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            ✨ કોઈ નિષ્ફળ ચકાસણી નથી
          </div>
        ) : (
          failedGrievances.map(g => (
            <div key={g.id} style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>{g.id}</span>
                    <span className="badge badge-reopened">🔄 {t('status.auto_reopened')}</span>
                  </div>
                  <p style={{ color: '#e2e8f0', fontSize: '0.85rem', marginBottom: 4 }}>{g.description}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                    🏢 {g.department} | 📍 {g.location.address}
                  </p>
                </div>
                <button
                  className="glow-btn"
                  style={{ padding: '6px 16px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                >
                  📋 {t('collector.auditPacket')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Escalation Modal */}
      {selectedDept && (
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
        onClick={() => setSelectedDept(null)}
        >
          <div
            className="glass-card animate-fadeInUp"
            style={{ maxWidth: 420, width: '100%', padding: 32, textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              margin: '0 auto 20px',
            }}>
              ⚠️
            </div>
            <h3 style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {t('collector.escalate')}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
              {selectedDept.nameGu} ({selectedDept.name})
            </p>
            <p style={{ color: '#f87171', fontSize: 28, fontWeight: 800, marginBottom: 20, fontFamily: 'var(--font-inter)' }}>
              Score: {selectedDept.qualityScore}/100
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 20 }}>
              {selectedDept.autoReopens} ફરી ખુલ્લી | {selectedDept.disputedByCitizen} વિવાદ
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setSelectedDept(null)}
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
                onClick={() => { alert('Escalation sent!'); setSelectedDept(null); }}
                className="glow-btn glow-btn-red"
                style={{ flex: 1, padding: 12 }}
              >
                ⚡ Escalate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
