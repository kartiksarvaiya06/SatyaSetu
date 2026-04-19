import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categories } from '../../mockData/departments';
import { captureSharedLocation, reverseGeocode } from '../../utils/locationAPI';
import MapPicker from '../../components/common/MapPicker';

export default function GrievanceForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    address: '',
    ivrMobile: user?.mobile || '',
  });
  
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [error, setError] = useState('');

  // Location state
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [locationSource, setLocationSource] = useState(null); // 'gps' | 'ip'

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDetectLocation = async () => {
    setLocationLoading(true);
    setError('');
    setLocationCaptured(false);
    setLocationSource(null);

    try {
      const locationData = await captureSharedLocation();
      setCoords({ lat: locationData.lat, lng: locationData.lng });
      setFormData(prev => ({ ...prev, address: locationData.address }));
      setLocationCaptured(true);
      setLocationSource(locationData.source || 'gps');
    } catch (err) {
      setError('Could not capture location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapChange = async (lat, lng) => {
    setCoords({ lat, lng });
    setLocationCaptured(true);
    // When manually pinning, we treat it as 'gps' for UI color/badges,
    // but we can distinguish it if we want. For now, just 'gps' is fine.
    setLocationSource('gps'); 
    
    try {
      const address = await reverseGeocode(lat, lng);
      setFormData(prev => ({ ...prev, address }));
    } catch (err) {
      console.error('Reverse geocode failed', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!/^\d{10}$/.test(formData.ivrMobile)) {
      setError('IVR mobile number must be 10 digits');
      setLoading(false);
      return;
    }

    const selectedCat = categories.find(c => c.id === formData.category);
    
    const data = new FormData();
    data.append('complainantName', user.name);
    data.append('complainantMobile', user.mobile);
    data.append('ivrMobile', formData.ivrMobile);
    data.append('category', selectedCat?.name || formData.category);
    data.append('description', formData.description);
    data.append('address', formData.address);
    data.append('lat', coords.lat || 23.031875);
    data.append('lng', coords.lng || 72.543775);
    data.append('department', selectedCat?.department || 'General');
    
    if (photo) data.append('photo', photo);

    try {
      const response = await fetch('http://localhost:5000/api/grievances', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setSubmittedId(result.grievance.grievanceId);
        setSubmitted(true);
      } else {
        setError(result.message || 'Submission failed');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: 'calc(100vh - 128px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="glass-card animate-fadeInUp" style={{ maxWidth: 480, width: '100%', padding: 40, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 24px', boxShadow: '0 0 40px rgba(16,185,129,0.3)',
          }}>
            ✓
          </div>
          <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            {t('citizen.grievanceFiled')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            {t('citizen.grievanceNumber')}
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa', marginBottom: 24, fontFamily: 'var(--font-inter)' }}>
            {submittedId}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginBottom: 24 }}>
            {t('citizen.ivrCallInfo')} <strong style={{ color: '#fbbf24' }}>{formData.ivrMobile}</strong> {t('citizen.ivrCallInfo2')}
          </p>
          <button onClick={() => navigate('/citizen/dashboard')} className="glow-btn" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
            {t('citizen.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          <span className="gradient-text">{t('citizen.submitGrievance')}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: 4 }}>
          {t('citizen.fillDetails')}
        </p>
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 10, padding: '10px 16px', color: '#fca5a5',
            fontSize: '0.9rem', marginBottom: 20, textAlign: 'center', fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Category */}
          <div>
            <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>
              📂 {t('citizen.category')} *
            </label>
            <select
              required
              className="select-dark"
              style={{ width: '100%' }}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">{t('citizen.selectCategory')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nameGu} ({cat.name})</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>
              📝 {t('citizen.description')} *
            </label>
            <textarea
              required
              className="input-dark"
              rows={4}
              placeholder={t('citizen.descplaceholder')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Location — Map & Auto Detect */}
          <div>
            <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 12, display: 'block', fontWeight: 700 }}>
              📍 {t('citizen.location')} *
            </label>
            
            {/* Map Picker */}
            <div style={{ marginBottom: 16 }}>
              <MapPicker 
                lat={coords.lat} 
                lng={coords.lng} 
                onChange={handleMapChange} 
                height="420px" 
              />
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 8, fontStyle: 'italic' }}>
                💡 {t('citizen.mapHint') || 'Drag the pin to the exact location of the issue.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input
                required
                className="input-dark"
                placeholder={t('citizen.locationPlaceholder')}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locationLoading}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: `1px solid ${locationCaptured ? 'rgba(16,185,129,0.5)' : 'rgba(59,130,246,0.5)'}`,
                  background: locationCaptured ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                  color: locationCaptured ? '#34d399' : '#60a5fa',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {locationLoading ? t('citizen.detecting') : locationCaptured ? t('citizen.autoLabel') : `📌 ${t('citizen.autoDetect')}`}
              </button>
            </div>

            {/* GPS source warning — shows when IP fallback was used */}
            {locationCaptured && locationSource === 'ip' && (
              <div style={{
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 8,
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.82rem', marginBottom: 2 }}>
                    GPS permission denied — Pin shows your ISP location (Panvel/Mumbai area).
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.76rem', marginBottom: 6 }}>
                    Please <strong>drag the map pin</strong> to your actual location in Ahmedabad before submitting.
                  </p>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    style={{
                      background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)',
                      color: '#fbbf24', padding: '5px 14px', borderRadius: 8,
                      cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                    }}
                  >
                    🔄 Retry Auto-Detect
                  </button>
                </div>
              </div>
            )}

            {/* Coordinates Badge */}
            {locationCaptured && coords.lat && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: locationSource === 'gps' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${locationSource === 'gps' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                borderRadius: 8, padding: '6px 14px',
                fontFamily: 'monospace', fontSize: '0.85rem',
                color: locationSource === 'gps' ? '#6ee7b7' : '#fbbf24',
              }}>
                {locationSource === 'gps' ? '🛰️ GPS Verified' : '🌐 Estimated (IP)'} {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* IVR Mobile Number */}
          <div>
            <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>
              📞 {t('citizen.mobileForIvr')} *
            </label>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              {t('citizen.ivrCallNote')}
            </p>
            <input
              type="tel"
              required
              className="input-dark"
              placeholder="9876543210"
              value={formData.ivrMobile}
              onChange={(e) => setFormData({ ...formData, ivrMobile: e.target.value.replace(/\D/g, '') })}
              maxLength="10"
              style={{ letterSpacing: '0.1em', fontSize: '1.05rem' }}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>
              📸 {t('citizen.photo')}
            </label>
            <div
              onClick={() => fileInputRef.current.click()}
              style={{
                border: `2px dashed ${preview ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 12, padding: preview ? '12px' : '32px',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease',
                background: preview ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = preview ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.2)'}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 8, display: 'block', margin: '0 auto' }}
                />
              ) : (
                <>
                  <p style={{ fontSize: 36, marginBottom: 8 }}>📷</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                    {t('citizen.clickToUpload')}
                  </p>
                </>
              )}
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>

          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => navigate('/citizen/dashboard')}
              style={{
                flex: 1, padding: '14px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.95rem',
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="glow-btn"
              disabled={loading}
              style={{ flex: 2, padding: '14px', fontSize: '1rem', fontWeight: 800 }}
            >
              {loading ? `📤 ${t('common.loading')}` : `🚀 ${t('common.submit')} →`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
