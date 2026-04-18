import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { updateGrievanceStatus } from '../../store/grievanceSlice';

export default function FieldOfficerTasks() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const grievances = useSelector(state => state.grievances.items);
  const [selectedTask, setSelectedTask] = useState(null);
  const [gpsCapturing, setGpsCapturing] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [visitNotes, setVisitNotes] = useState('');
  const [toast, setToast] = useState(null);

  // Tasks are grievances that need field verification
  const tasks = grievances.filter(g => g.status === 'resolved_pending_verification');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCaptureGPS = () => {
    setGpsCapturing(true);
    setTimeout(() => {
      setGpsCapturing(false);
      setGpsCaptured(true);
    }, 2000);
  };

  const handleSubmitVerification = () => {
    if (!gpsCaptured || !photoUploaded) return;
    
    dispatch(updateGrievanceStatus({
      id: selectedTask.id,
      status: 'verified_resolved',
      resolution: {
        attemptAt: new Date().toISOString(),
        officerId: user.id,
        photoUrl: 'mock_photo_url.jpg',
        gpsLog: { lat: 23.0226, lng: 72.5715 },
        visitNotes: visitNotes
      }
    }));

    showToast('ચકાસણી લોગ સબમિટ થયો!');
    setSelectedTask(null);
    setGpsCaptured(false);
    setPhotoUploaded(false);
    setVisitNotes('');
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          <span className="gradient-text">{t('field.tasks')}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: 4 }}>
          {user.name} | {user.department}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="stat-card stat-card-blue animate-fadeInUp stagger-1" style={{ opacity: 0 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>📋 બાકી ટાસ્ક</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa' }}>{tasks.length}</p>
        </div>
        <div className="stat-card stat-card-green animate-fadeInUp stagger-2" style={{ opacity: 0 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>✅ પૂર્ણ</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#34d399' }}>
            {grievances.filter(g => g.status === 'verified_resolved').length}
          </p>
        </div>
      </div>

      {!selectedTask ? (
        /* Task List */
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>
              {t('field.verificationTasks')}
            </h2>
          </div>
          {tasks.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>✨</p>
              <p>કોઈ ટાસ્ક બાકી નથી!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>{task.id}</span>
                      <span className="badge badge-verification">🔍 ચકાસણી</span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 4 }}>
                      {task.description.length > 60 ? task.description.substring(0, 60) + '...' : task.description}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                      📍 {task.location.address}
                    </p>
                  </div>
                  <span style={{ color: '#60a5fa', fontSize: 20 }}>→</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Task Detail - Mobile-first */
        <div className="glass-card animate-fadeInUp" style={{ padding: 24 }}>
          <button
            onClick={() => {
              setSelectedTask(null);
              setGpsCaptured(false);
              setPhotoUploaded(false);
              setVisitNotes('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginBottom: 20,
              fontFamily: 'var(--font-gujarati)',
            }}
          >
            ← {t('common.back')}
          </button>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
            {t('field.taskDetail')} — {selectedTask.id}
          </h2>

          {/* Grievance Info */}
          <div style={{
            padding: 16,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            marginBottom: 24,
          }}>
            <p style={{ color: '#e2e8f0', marginBottom: 8 }}>{selectedTask.description}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
              📍 {selectedTask.location.address}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
              📞 {selectedTask.complainantMobile}
            </p>
          </div>

          {/* Action Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Photo Upload */}
            <div style={{
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${photoUploaded ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
              background: photoUploaded ? 'rgba(16,185,129,0.05)' : 'transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>📸 {t('field.uploadPhoto')}</span>
                {photoUploaded && <span style={{ color: '#34d399', fontSize: '0.8rem' }}>✅ Done</span>}
              </div>
              {!photoUploaded ? (
                <button
                  onClick={() => setPhotoUploaded(true)}
                  className="glow-btn"
                  style={{ width: '100%', padding: 12 }}
                >
                  📷 ફોટો કેપ્ચર / અપલોડ
                </button>
              ) : (
                <div style={{
                  padding: 12,
                  background: 'rgba(16,185,129,0.1)',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  color: '#34d399',
                  textAlign: 'center'
                }}>
                  photo_evidence_001.jpg uploaded ✓
                </div>
              )}
            </div>

            {/* GPS Capture */}
            <div style={{
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${gpsCaptured ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
              background: gpsCaptured ? 'rgba(16,185,129,0.05)' : 'transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>📍 {t('field.captureGPS')}</span>
                {gpsCaptured && <span style={{ color: '#34d399', fontSize: '0.8rem' }}>✅ Done</span>}
              </div>
              {!gpsCaptured ? (
                <button
                  onClick={handleCaptureGPS}
                  className="glow-btn glow-btn-gold"
                  style={{ width: '100%', padding: 12 }}
                  disabled={gpsCapturing}
                >
                  {gpsCapturing ? '📡 GPS કેપ્ચર થઈ રહ્યું છે...' : '📌 GPS કેપ્ચર કરો'}
                </button>
              ) : (
                <div style={{
                  padding: 12,
                  background: 'rgba(16,185,129,0.1)',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  color: '#34d399',
                  fontFamily: 'var(--font-inter)',
                }}>
                  📍 23.0226° N, 72.5715° E (within 50m of address ✓)
                </div>
              )}
            </div>

            {/* Visit Notes */}
            <div>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block' }}>
                📝 મુલાકાત નોંધ
              </label>
              <textarea
                className="input-dark"
                rows={3}
                placeholder="મુલાકાત વિશે નોંધ..."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitVerification}
              className="glow-btn glow-btn-green"
              style={{
                width: '100%',
                padding: 14,
                fontSize: '1rem',
                opacity: (gpsCaptured && photoUploaded) ? 1 : 0.5,
              }}
              disabled={!gpsCaptured || !photoUploaded}
            >
              {t('field.submitVisitLog')} →
            </button>
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
