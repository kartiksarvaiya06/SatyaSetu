import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/authSlice';
import { useState } from 'react';
import { PhoneCall } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'citizen': return '/citizen/dashboard';
      case 'department': return '/department/dashboard';
      case 'field': return '/field/tasks';
      case 'collector': return '/collector/dashboard';
      default: return '/';
    }
  };

  return (
    <nav style={{
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 64,
      }}>
        {/* Logo */}
        <Link to={isAuthenticated ? getDashboardLink() : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 800,
            color: 'white',
          }}>
            <PhoneCall size={20} />
          </div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#60a5fa' }}>{t('common.appName')}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>{t('common.appSubtitle')}</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="desktop-menu">
          {/* Language Switcher */}
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="select-dark"
            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8 }}
          >
            <option value="gu">ગુજરાતી</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                }}>
                  {user.name.charAt(0)}
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '6px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.25)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="glow-btn"
              style={{ padding: '8px 20px', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              {t('common.login')}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#e2e8f0',
            fontSize: 24,
            cursor: 'pointer',
          }}
          className="mobile-menu-btn"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          padding: 16,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="select-dark"
            style={{ padding: '8px 12px' }}
          >
            <option value="gu">ગુજરાતી</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
          {isAuthenticated ? (
            <>
              <span style={{ color: '#94a3b8' }}>નમસ્તે, {user.name}</span>
              <button onClick={handleLogout} className="glow-btn glow-btn-red" style={{ padding: '8px 16px' }}>
                {t('common.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="glow-btn" style={{ textDecoration: 'none', textAlign: 'center', padding: '8px 16px' }}>
              {t('common.login')}
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
