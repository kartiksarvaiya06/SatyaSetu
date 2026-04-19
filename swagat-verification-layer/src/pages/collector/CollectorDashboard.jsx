import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { fetchCollectorStats } from '../../store/grievanceSlice';

export default function CollectorDashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { collectorData, loading } = useSelector(state => state.grievances);
  const [selectedDept, setSelectedDept] = useState(null);
  const [toast, setToast] = useState(null);
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    dispatch(fetchCollectorStats());
  }, [dispatch]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleEscalate = async (dept) => {
    setEscalating(true);
    try {
      const message = `⚠️ Collector notice: ${dept.name} department has a low quality score of ${dept.qualityScore}/100. Immediate action required on pending grievances.`;
      const res = await fetch('http://localhost:5000/api/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: dept.name,
          message,
          sentBy: user.name || 'Collector',
        }),
      });
      if (res.ok) {
        showToast(`📢 Escalation notice sent to ${dept.name} department successfully!`, 'success');
      } else {
        showToast('⚠️ Failed to send escalation. Try again.', 'error');
      }
    } catch (err) {
      showToast('⚠️ Server error. Try again.', 'error');
    } finally {
      setEscalating(false);
      setSelectedDept(null);
    }
  };

  if (loading || !collectorData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <p style={{ color: 'white' }}>લોડ થઈ રહ્યું છે...</p>
      </div>
    );
  }

  const { totalGrievances, pendingVerifications, autoReopens, departments } = collectorData;
  const avgScore = departments.length > 0
    ? Math.round(departments.reduce((sum, d) => sum + d.qualityScore, 0) / departments.length)
    : 0;

  const chartData = departments.map(d => ({
    name: d.name,
    score: d.qualityScore,
    total: d.total,
    reopened: d.reopened
  })).sort((a, b) => b.score - a.score);

  const getBarColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          <span className="gradient-text">{t('collector.dashboard')}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: 4 }}>
          {user.name} | {user.district || 'Gujarat'} જિલ્લો
        </p>
      </div>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: t('collector.totalDepartments'), value: departments.length, icon: '🏢', colorClass: 'stat-card-blue', color: '#60a5fa' },
          { label: t('collector.avgScore'), value: avgScore, icon: '⭐', colorClass: 'stat-card-green', color: avgScore >= 80 ? '#34d399' : avgScore >= 50 ? '#fbbf24' : '#f87171' },
          { label: t('collector.pendingVerifications'), value: pendingVerifications, icon: '🔍', colorClass: 'stat-card-yellow', color: '#fbbf24' },
          { label: t('collector.autoReopens'), value: autoReopens, icon: '🔄', colorClass: 'stat-card-red', color: '#f87171' },
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

      {/* Leaderboard Chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
          📊 {t('collector.leaderboard')}
        </h2>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Scores Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>🏢 {t('collector.departmentScores')}</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['વિભાગ', 'સ્કોર', 'કુલ', 'ઉકેલાયેલ', 'ફરી ખુલ્લી', 'ક્રિયા'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>{dept.name}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: getBarColor(dept.qualityScore) }}>{dept.qualityScore}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{dept.total}</td>
                  <td style={{ padding: '12px 16px', color: '#34d399' }}>{dept.resolved}</td>
                  <td style={{ padding: '12px 16px', color: '#f87171' }}>{dept.reopened}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {dept.qualityScore < 50 && (
                      <button
                        onClick={() => setSelectedDept(dept)}
                        className="glow-btn glow-btn-red"
                        style={{ padding: '4px 12px', fontSize: '0.7rem' }}
                      >
                        ⚠️ Escalate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escalation Confirm Modal */}
      {selectedDept && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="glass-card animate-fadeInUp" style={{ maxWidth: 440, width: '100%', padding: 36, textAlign: 'center' }}>
            
            {/* Warning icon */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 20px',
              boxShadow: '0 0 30px rgba(239,68,68,0.4)',
            }}>⚠️</div>

            <h3 style={{ color: '#f87171', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              Escalation Notice
            </h3>
            <p style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>
              {selectedDept.name} Department
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.7 }}>
              Quality Score <span style={{ color: '#f87171', fontWeight: 700 }}>{selectedDept.qualityScore}/100</span> — Below acceptable threshold.<br />
              A formal escalation notice will be sent to this department.
            </p>

            {/* Message preview */}
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 24,
              fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textAlign: 'left', lineHeight: 1.7,
            }}>
              📢 <strong style={{ color: '#fca5a5' }}>Notice:</strong> {selectedDept.name} department has a low quality score of {selectedDept.qualityScore}/100. Immediate action required on pending grievances.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setSelectedDept(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                }}
              >
                રદ કરો
              </button>
              <button
                onClick={() => handleEscalate(selectedDept)}
                disabled={escalating}
                className="glow-btn glow-btn-red"
                style={{ flex: 2, padding: '12px', fontSize: '0.95rem', opacity: escalating ? 0.6 : 1 }}
              >
                {escalating ? '⏳ Sending...' : '📢 Send Escalation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '14px 22px', borderRadius: 14, maxWidth: 400,
          background: toast.type === 'success'
            ? 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))'
            : 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(185,28,28,0.95))',
          color: 'white', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          animation: 'slideInRight 0.3s ease',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
