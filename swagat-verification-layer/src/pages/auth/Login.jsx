import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setTempMobile, setTempUserData, loginSuccess } from '../../store/authSlice';
import { PhoneCall } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const [mainRoleType, setMainRoleType] = useState('citizen'); // 'citizen' or 'government'
  const [govRole, setGovRole] = useState('department');

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(mobile)) {
      setError(t('auth.invalidMobile') || 'Invalid Mobile Number');
      return;
    }

    if (mainRoleType === 'government' && !password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile,
          password: mainRoleType === 'government' ? password : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
      } else {
        if (data.requireOtp) {
          dispatch(setTempMobile(mobile));
          dispatch(setTempUserData(data.user));
          navigate('/verify-otp');
        } else {
          // Direct login for officers
          dispatch(loginSuccess(data.user));
          // Dashboard routing based on role
          switch (data.user.role) {
            case 'department': navigate('/department/dashboard'); break;
            case 'field': navigate('/field/tasks'); break;
            case 'collector': navigate('/collector/dashboard'); break;
            default: navigate('/');
          }
        }
      }
    } catch (err) {
      setError('Cannot connect to server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
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
            Swagat Grievance Resolution System
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-card" style={{ padding: 32 }}>

          {/* Top Toggle: Citizen vs Government */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              onClick={() => { setMainRoleType('citizen'); setError(''); }}
              style={{
                flex: 1,
                padding: '12px 0',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-inter)',
                background: mainRoleType === 'citizen' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                color: mainRoleType === 'citizen' ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              👨‍💼 Citizen
            </button>
            <button
              type="button"
              onClick={() => { setMainRoleType('government'); setError(''); }}
              style={{
                flex: 1,
                padding: '12px 0',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-inter)',
                background: mainRoleType === 'government' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                color: mainRoleType === 'government' ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              🏛️ Government
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

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Conditional Sub-Dropdown if Government side is active */}
            {mainRoleType === 'government' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                  🏢 Specify Department Role
                </label>
                <select
                  value={govRole}
                  onChange={(e) => setGovRole(e.target.value)}
                  className="input-dark"
                  style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                >
                  <option style={{ background: '#1e293b', color: '#f8fafc' }} value="department">🏛️ Department Officer</option>
                  <option style={{ background: '#1e293b', color: '#f8fafc' }} value="field">👨‍🏭 Field Officer</option>
                  <option style={{ background: '#1e293b', color: '#f8fafc' }} value="collector">👑 Collector</option>
                </select>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                📱 Mobile Number
              </label>
              <input
                id="login-mobile"
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

            {/* Password Field for Government Only */}
            {mainRoleType === 'government' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                  🔒 Password
                </label>
                <input
                  type="password"
                  required
                  className="input-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="glow-btn" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: 10 }}>
              {loading ? (mainRoleType === 'citizen' ? 'Sending OTP...' : 'Logging in...') : (mainRoleType === 'citizen' ? 'Get OTP →' : 'Log In →')}
            </button>
          </form>

          {/* Signup Link */}
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Don't have an account? </span>
            <Link to="/signup" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
