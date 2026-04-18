import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addGrievance } from '../../store/grievanceSlice';
import { categories } from '../../mockData/departments';

export default function GrievanceForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    address: '',
    mobile: user?.mobile || '',
    photo: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `GRV${String(Date.now()).slice(-3)}`;
    const selectedCat = categories.find(c => c.id === formData.category);

    const newGrievance = {
      id,
      complainantName: user.name,
      complainantMobile: user.mobile,
      category: selectedCat?.name || formData.category,
      description: formData.description,
      location: {
        address: formData.address,
        lat: 23.0225 + (Math.random() * 0.05),
        lng: 72.5714 + (Math.random() * 0.05),
      },
      status: 'pending',
      department: selectedCat?.department || 'General',
      submittedAt: new Date().toISOString(),
      priority: 'medium',
      resolutionAttempts: [],
    };

    dispatch(addGrievance(newGrievance));
    setSubmittedId(id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 128px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div className="glass-card animate-fadeInUp" style={{ maxWidth: 480, width: '100%', padding: 40, textAlign: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(16,185,129,0.3)',
          }}>
            ✓
          </div>
          <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            ફરિયાદ સફળતાપૂર્વક નોંધાઈ!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            તમારો ફરિયાદ નંબર:
          </p>
          <p style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#60a5fa',
            marginBottom: 24,
            fontFamily: 'var(--font-inter)',
          }}>
            {submittedId}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginBottom: 24 }}>
            વિભાગ તમારી ફરિયાદની સમીક્ષા કરશે. ઉકેલ પછી IVR કૉલ દ્વારા ચકાસણી થશે.
          </p>
          <button
            onClick={() => navigate('/citizen/dashboard')}
            className="glow-btn"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            ← ડેશબોર્ડ પર પાછા જાઓ
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
          તમારી ફરિયાદની વિગતો ભરો
        </p>
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Category */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
              📂 {t('citizen.category')} *
            </label>
            <select
              required
              className="select-dark"
              style={{ width: '100%' }}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">-- કેટેગરી પસંદ કરો --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nameGu} ({cat.name})</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
              📝 {t('citizen.description')} *
            </label>
            <textarea
              required
              className="input-dark"
              rows={4}
              placeholder="તમારી સમસ્યાનું વર્ણન કરો..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
              📍 {t('citizen.location')} *
            </label>
            <input
              required
              className="input-dark"
              placeholder="સ્થાનનો ચોક્કસ સરનામું"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <div style={{
              marginTop: 8,
              padding: '12px 16px',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 10,
              fontSize: '0.8rem',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              📌 GPS: 23.0225° N, 72.5714° E (Auto-detected — Mock)
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
              📱 {t('citizen.mobileForIvr')}
            </label>
            <input
              className="input-dark"
              type="tel"
              placeholder="IVR કૉલ માટે મોબાઈલ"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              style={{ fontFamily: 'var(--font-inter)', letterSpacing: '0.1em' }}
            />
          </div>

          {/* Photo */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
              📸 {t('citizen.photo')} (optional)
            </label>
            <div style={{
              border: '2px dashed rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: 32,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
            >
              <p style={{ fontSize: 32, marginBottom: 8 }}>📷</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                ફાઈલ અહીં ડ્રેગ કરો અથવા ક્લિક કરો
              </p>
              <input type="file" accept="image/*" style={{ display: 'none' }} />
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => navigate('/citizen/dashboard')}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-gujarati)',
              }}
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="glow-btn" style={{ flex: 2, padding: '14px', fontSize: '0.95rem' }}>
              {t('common.submit')} →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
