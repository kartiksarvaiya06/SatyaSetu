import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginSuccess, clearTemp } from '../../store/authSlice';

export default function OtpVerification() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tempMobile = useSelector(state => state.auth.tempMobile);
  const tempUserData = useSelector(state => state.auth.tempUserData);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tempMobile) navigate('/login');
  }, [tempMobile, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: tempMobile, otp: otpValue })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Verification failed');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      } else {
        setSuccess(true);
        setTimeout(() => {
          dispatch(loginSuccess(data.user));
          switch (data.user.role) {
            case 'citizen': navigate('/citizen/dashboard'); break;
            case 'department': navigate('/department/dashboard'); break;
            case 'field': navigate('/field/tasks'); break;
            case 'collector': navigate('/collector/dashboard'); break;
            default: navigate('/');
          }
        }, 800);
      }
    } catch (err) {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: tempMobile })
      });
      setTimer(30);
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  if (!tempMobile) return null;

  return (
    <div style={{
      minHeight: 'calc(100vh - 128px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          {/* Icon */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: success ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 20px',
            boxShadow: success ? '0 0 40px rgba(16,185,129,0.3)' : '0 0 40px rgba(59,130,246,0.3)',
            transition: 'all 0.5s ease',
          }}>
            {success ? '✓' : '🔐'}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
            OTP Verification
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 28 }}>
            OTP Sent to <span style={{ color: '#60a5fa' }}>+91 {tempMobile}</span>
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              padding: '10px 16px',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: 20,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleVerify}>
            {/* OTP Inputs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: 52,
                    height: 56,
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                    background: digit ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${digit ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: 12,
                    color: '#e2e8f0',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => { if (!digit) e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                />
              ))}
            </div>

            <button
              type="submit"
              className={`glow-btn ${success ? 'glow-btn-green' : ''}`}
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              disabled={otp.join('').length < 6 || loading}
            >
              {loading ? 'Verifying...' : success ? '✓ Verified!' : 'Verify OTP'}
            </button>
          </form>

          {/* Resend */}
          <div style={{ marginTop: 20 }}>
            {timer > 0 ? (
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                Resend in ({timer}s)
              </span>
            ) : (
              <button
                onClick={handleResend}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-gujarati)',
                }}
              >
                🔄 Resend OTP
              </button>
            )}
          </div>

           {/* Back */}
          <button
            onClick={() => {
              dispatch(clearTemp());
              navigate('/login');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              marginTop: 16,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-gujarati)',
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
