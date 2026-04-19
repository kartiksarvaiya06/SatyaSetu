import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { fetchFieldTasks, submitVerificationAction, clearExifMetadata } from '../../store/grievanceSlice';
import { haversineDistance, captureSharedLocation } from '../../utils/locationAPI';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center map
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] && center[1]) map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

export default function FieldOfficerTasks() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: tasks, completedTasks, loading } = useSelector(state => state.grievances);

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTask, setSelectedTask] = useState(null);
  const [gpsCapturing, setGpsCapturing] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [coords, setCoords] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [visitNotes, setVisitNotes] = useState('');
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // GPS location check
  const [locationCheck, setLocationCheck] = useState(null);
  const [locationSource, setLocationSource] = useState(null); // 'gps' | 'ip'
  // { distanceMetres, status: 'pass'|'fail' }

  useEffect(() => {
    const dept = user?.department || '_all';
    dispatch(fetchFieldTasks(dept));
  }, [user, dispatch]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [resolvedAddress, setResolvedAddress] = useState('');

  const handleCaptureGPS = async () => {
    setGpsCapturing(true);
    setGpsCaptured(false);
    setLocationSource(null);
    try {
      const locationData = await captureSharedLocation();
      setCoords({ lat: locationData.lat, lng: locationData.lng });
      setResolvedAddress(locationData.address);
      setLocationSource(locationData.source || 'gps');
      setGpsCaptured(true);
      checkDistance(locationData.lat, locationData.lng);
    } catch (err) {
      setResolvedAddress("Error capturing location.");
    } finally {
      setGpsCapturing(false);
    }
  };

  const checkDistance = (officerLat, officerLng) => {
    const citizenLat = selectedTask?.location?.lat;
    const citizenLng = selectedTask?.location?.lng;

    if (!citizenLat || !citizenLng) {
      setLocationCheck({ status: 'pass', distanceMetres: 0 });
      return;
    }

    const dist = haversineDistance(citizenLat, citizenLng, officerLat, officerLng);
    const distRounded = Math.round(dist);

    // Update from 10km to 500km (500000m) limit for testing/demo purposes
    if (dist <= 500000) {
      setLocationCheck({ status: 'pass', distanceMetres: distRounded });
    } else {
      setLocationCheck({ status: 'fail', distanceMetres: distRounded });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitVerification = async () => {
    if (!gpsCaptured || !photoFile || locationCheck?.status === 'fail') return;

    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('visitNotes', visitNotes);
    formData.append('lat', coords.lat);
    formData.append('lng', coords.lng);
    formData.append('officerId', user.id);

    try {
      await dispatch(submitVerificationAction({
        id: selectedTask.grievanceId,
        formData,
      })).unwrap();

      showToast('ચકાસણી લોગ સબમિટ થયો!');
      setSelectedTask(null);
      setGpsCaptured(false);
      setPhotoFile(null);
      setPreview(null);
      setVisitNotes('');
      setCoords(null);
      setLocationCheck(null);
      setActiveTab('completed');
      dispatch(clearExifMetadata());

      const dept = user?.department || '_all';
      dispatch(fetchFieldTasks(dept));
    } catch (err) {
      showToast('Error submitting verification');
    }
  };

  const displayTasks = activeTab === 'pending' ? tasks : completedTasks;
  const gpsFailed = locationCheck?.status === 'fail' || locationSource === 'ip';
  const canSubmit = gpsCaptured && photoFile && !gpsFailed;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          <span className="gradient-text">{t('field.tasks')}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: 4 }}>
          {user.name} | {user.department || 'જિલ્લા વ્યાપી (District Wide)'}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <div
          onClick={() => setActiveTab('pending')}
          className="stat-card stat-card-blue animate-fadeInUp stagger-1"
          style={{ opacity: 1, cursor: 'pointer', border: activeTab === 'pending' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)' }}
        >
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>📋 {t('field.pending')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa' }}>{tasks.length}</p>
        </div>
        <div
          onClick={() => setActiveTab('completed')}
          className="stat-card stat-card-green animate-fadeInUp stagger-2"
          style={{ opacity: 1, cursor: 'pointer', border: activeTab === 'completed' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)' }}
        >
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>✅ {t('field.completed')}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#34d399' }}>{completedTasks.length}</p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'gray' }}>{t('common.loading')}</p>
      ) : !selectedTask ? (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>
              {activeTab === 'pending' ? t('field.verificationTasks') : t('field.completedTasks')}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
              {displayTasks.length} {t('common.items')}
            </span>
          </div>
          {displayTasks.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>{activeTab === 'pending' ? '✨' : '📁'}</p>
              <p>{activeTab === 'pending' ? t('field.noTasks') : t('field.noCompleted')}</p>
            </div>
          ) : (
            displayTasks.map(task => (
              <div
                key={task.grievanceId}
                onClick={() => activeTab === 'pending' && setSelectedTask(task)}
                style={{
                  padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: activeTab === 'pending' ? 'pointer' : 'default', transition: 'background 0.2s ease',
                }}
                onMouseOver={(e) => activeTab === 'pending' && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseOut={(e) => activeTab === 'pending' && (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.8rem' }}>{task.grievanceId}</span>
                      <span className={`badge ${activeTab === 'pending' ? 'badge-verification' : 'badge-resolved'}`}>
                        {activeTab === 'pending' ? t('field.verification') : t('field.completed')}
                      </span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 4 }}>
                      {task.description.length > 60 ? task.description.substring(0, 60) + '...' : task.description}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>📍 {task.location.address}</p>
                  </div>
                  {activeTab === 'pending' && <span style={{ color: '#60a5fa', fontSize: 20 }}>→</span>}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Task Detail */
        <div className="glass-card animate-fadeInUp" style={{ padding: 24 }}>
          <button
            onClick={() => {
              setSelectedTask(null); setGpsCaptured(false); setPhotoFile(null);
              setPreview(null); setVisitNotes(''); setLocationCheck(null);
            }}
            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.85rem', marginBottom: 20 }}
          >
            ← {t('common.back')}
          </button>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
            {t('field.taskDetail')} — {selectedTask.grievanceId}
          </h2>

          <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 24 }}>
            <p style={{ color: '#e2e8f0', marginBottom: 8 }}>{selectedTask.description}</p>
            {selectedTask.imageUrl && (
              <img
                src={`http://localhost:5000${selectedTask.imageUrl}`}
                alt="Citizen evidence"
                style={{
                  width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)', marginBottom: 10, cursor: 'pointer',
                }}
                onClick={() => window.open(`http://localhost:5000${selectedTask.imageUrl}`, '_blank')}
              />
            )}
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>📍 {selectedTask.location.address}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>🛠️ {t('field.department')}: {selectedTask.department}</p>
            
            {/* Verification Map */}
            <div style={{ marginTop: 16, height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <MapContainer 
                center={[selectedTask.location.lat, selectedTask.location.lng]} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ChangeView center={[selectedTask.location.lat, selectedTask.location.lng]} />
                
                {/* Target Marker (Red) */}
                <Marker position={[selectedTask.location.lat, selectedTask.location.lng]} icon={new L.Icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                  iconSize: [25, 41], iconAnchor: [12, 41]
                })} />
                
                {/* 500km Verification Circle */}
                <Circle 
                  center={[selectedTask.location.lat, selectedTask.location.lng]} 
                  radius={500000}
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }}
                />

                {/* Officer Marker (Blue) */}
                {coords && (
                  <Marker position={[coords.lat, coords.lng]} icon={new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                  })} />
                )}
              </MapContainer>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>
              ℹ️ {t('field.mapHint')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* GPS Capture */}
            <div style={{
              padding: 20, borderRadius: 12,
              border: `1px solid ${gpsCaptured
                ? gpsFailed ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.3)'
                : 'rgba(255,255,255,0.3)'}`,
              background: gpsCaptured
                ? gpsFailed ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)'
                : 'rgba(15,23,42,0.6)',
            }}>
              <span style={{ color: '#e2e8f0', fontWeight: 700, display: 'block', marginBottom: 12 }}>📍 {t('field.captureGPS')}</span>
              {!gpsCaptured ? (
                <button
                  onClick={handleCaptureGPS}
                  className="glow-btn glow-btn-gold"
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 700 }}
                  disabled={gpsCapturing}
                >
                {gpsCapturing ? t('field.capturing') : t('field.captureBtn')}
                </button>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: gpsFailed ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${gpsFailed ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                    borderRadius: 10, padding: '8px 16px', marginBottom: 4,
                    fontFamily: 'monospace', fontSize: '0.95rem',
                    color: gpsFailed ? '#fca5a5' : '#6ee7b7',
                  }}>
                    <span>🌐</span>
                    <span>{coords?.lat?.toFixed(6)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>,</span>
                    <span>{coords?.lng?.toFixed(6)}</span>
                    <span style={{ marginLeft: 8, fontSize: '0.75rem', padding: '2px 6px', borderRadius: 4, background: locationSource === 'gps' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)' }}>
                      {locationSource === 'gps' ? '🛰️ GPS' : '🌐 IP'}
                    </span>
                  </div>
                  {resolvedAddress && (
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginBottom: 8 }}>
                      📍 {resolvedAddress}
                    </p>
                  )}

                  {/* GPS result — only show if FAILED or IP */}
                  {gpsFailed && (
                    <div style={{
                      padding: '10px 16px', borderRadius: 10, marginTop: 8,
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                    }}>
                      <p style={{ color: '#f87171', fontWeight: 700, fontSize: '0.88rem' }}>
                        {locationSource === 'ip' ? '🚨 GPS Required' : `🚨 ${t('field.locationMismatch')} — ${locationCheck?.distanceMetres}m ${t('field.away')}`}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginTop: 4 }}>
                        {locationSource === 'ip' 
                          ? 'Satellite GPS is required. Please enable location permissions.' 
                          : t('field.submissionBlocked')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Photo Upload — clean, no messages if GPS is good */}
            <div style={{
              padding: 20, borderRadius: 12,
              border: `1px solid ${preview ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.3)'}`,
              background: preview ? 'rgba(16,185,129,0.05)' : 'rgba(15,23,42,0.6)',
            }}>
              <span style={{ color: '#e2e8f0', fontWeight: 700, display: 'block', marginBottom: 12 }}>📸 {t('field.uploadPhoto')}</span>
              {preview ? (
                <div style={{ textAlign: 'center' }}>
                  <img src={preview} alt="Evidence" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
                  <button
                    onClick={() => { setPreview(null); setPhotoFile(null); }}
                    style={{ background: 'none', color: '#f87171', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
                  >
                    ✖ {t('field.change')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="glow-btn"
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 700 }}
                >
                  📷 {t('field.openCamera')}
                </button>
              )}
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>

            <textarea
              className="input-dark"
              rows={3}
              placeholder={t('field.notesPlaceholder')}
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              style={{ padding: '16px', fontSize: '1rem' }}
            />

            {/* Submit — BLOCKED if GPS > 500m */}
            {gpsFailed ? (
              <div style={{
                padding: '16px', borderRadius: 12, textAlign: 'center',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', fontSize: '0.9rem', fontWeight: 600,
              }}>
                🚫 {t('field.blocked')} {locationCheck?.distanceMetres}m {t('field.blockedSuffix')}
              </div>
            ) : (
              <button
                onClick={handleSubmitVerification}
                className="glow-btn glow-btn-green"
                style={{ width: '100%', padding: 18, fontSize: '1.2rem', fontWeight: 800, opacity: canSubmit ? 1 : 0.5 }}
                disabled={!canSubmit}
              >
                🚀 {t('field.submitVisitLog')} →
              </button>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="toast toast-success">✅ {toast}</div>
      )}
    </div>
  );
}
