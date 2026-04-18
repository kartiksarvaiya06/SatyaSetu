import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setTempMobile, setTempUserData } from '../../store/authSlice';
import { users } from '../../mockData/users';
import { PhoneCall } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const [role, setRole] = useState('citizen');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'citizen': navigate('/citizen/dashboard', { replace: true }); break;
        case 'department': navigate('/department/dashboard', { replace: true }); break;
        case 'field': navigate('/field/tasks', { replace: true }); break;
        case 'collector': navigate('/collector/dashboard', { replace: true }); break;
        default: break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleCitizenLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(mobile)) {
      setError(t('auth.invalidMobile'));
      return;
    }
    const user = users.find(u => u.mobile === mobile && u.role === 'citizen');
    if (!user) {
      setError(t('auth.userNotFound'));
      return;
    }
    dispatch(setTempMobile(mobile));
    dispatch(setTempUserData(user));
    navigate('/verify-otp', { state: { role: 'citizen' } });
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');
    const user = users.find(u =>
      u.username === username &&
      u.password === password &&
      ['department', 'field', 'collector'].includes(u.role)
    );
    if (!user) {
      setError(t('auth.wrongCredentials'));
      return;
    }
    dispatch(setTempUserData(user));
    navigate('/verify-otp', { state: { role: user.role } });
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 128px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 800,
            color: 'white',
            margin: '0 auto 20px',
            boxShadow: '0 0 40px rgba(59,130,246,0.3)',
          }}>
            <PhoneCall size={36} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            {t('common.welcome')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            Gujarat Grievance Resolution Verification System
          </p>
        </div>

        {/* Role Tabs */}
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => { setRole('citizen'); setError(''); }}
              style={{
                flex: 1,
                padding: '12px 0',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-gujarati)',
                background: role === 'citizen' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                color: role === 'citizen' ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              👤 {t('auth.citizenTab')}
            </button>
            <button
              onClick={() => { setRole('admin'); setError(''); }}
              style={{
                flex: 1,
                padding: '12px 0',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-gujarati)',
                background: role === 'admin' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                color: role === 'admin' ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              🏛️ {t('auth.adminTab')}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              padding: '10px 16px',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: 20,
              textAlign: 'center',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Forms */}
          {role === 'citizen' ? (
            <form onSubmit={handleCitizenLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                  📱 {t('auth.mobileNumber')}
                </label>
                <input
                  id="citizen-mobile"
                  type="tel"
                  required
                  className="input-dark"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  maxLength="10"
                  style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}
                />
              </div>
              <button type="submit" className="glow-btn" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                {t('auth.getOtp')} →
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                  👤 {t('auth.username')}
                </label>
                <input
                  id="admin-username"
                  type="text"
                  required
                  className="input-dark"
                  placeholder="rbd_officer / collector_ahm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                  🔒 {t('auth.password')}
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  className="input-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="glow-btn" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                {t('auth.loginBtn')} →
              </button>
            </form>
          )}

          {/* Mock OTP info */}
          <div style={{
            marginTop: 20,
            padding: '10px 16px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 10,
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#60a5fa',
          }}>
            💡 {t('auth.mockOtp')}
          </div>

          {/* Demo Credentials */}
          <div style={{
            marginTop: 16,
            padding: 16,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.35)',
          }}>
            <p style={{ fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.5)' }}>Demo Credentials:</p>
            <p>Citizen: <span style={{ color: '#60a5fa' }}>9876543210</span></p>
            <p>Dept Officer: <span style={{ color: '#60a5fa' }}>rbd_officer / password123</span></p>
            <p>Field Officer: <span style={{ color: '#60a5fa' }}>field_officer1 / field123</span></p>
            <p>Collector: <span style={{ color: '#60a5fa' }}>collector_ahm / collector123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
