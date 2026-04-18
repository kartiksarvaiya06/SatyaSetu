import { useTranslation } from 'react-i18next';
import { PhoneCall } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{
      background: 'rgba(15, 23, 42, 0.9)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '48px 24px 24px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 32,
          marginBottom: 32,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
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
              <span className="gradient-text" style={{ fontSize: 18, fontWeight: 700 }}>
                {t('common.appName')}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Gujarat Grievance Resolution Verification System — Making "resolved" actually mean resolved.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              સંપર્ક કરો
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>📞 હેલ્પલાઈન: 1800-XXX-XXXX</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>📧 swagat-ai@gujarat.gov.in</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>🏛️ ગાંધીનગર, ગુજરાત</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              મહત્વપૂર્ણ લિંક્સ
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['ગુજરાત સરકાર', 'સ્વાગત પોર્ટલ', 'ગોપનીયતા નીતિ', 'FAQ'].map((link) => (
                <a key={link} href="#" style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseOver={(e) => e.target.style.color = '#60a5fa'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ફોલો કરો
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              {['𝕏', 'f', 'in'].map((icon) => (
                <a key={icon} href="#" style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(59,130,246,0.2)';
                  e.target.style.borderColor = 'rgba(59,130,246,0.4)';
                  e.target.style.color = '#60a5fa';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.color = 'rgba(255,255,255,0.5)';
                }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 20,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.8rem',
        }}>
          © 2025 Swagat IVR Resolution ચકાસણી સ્તર. સર્વાધિકાર સુરક્ષિત. | Gujarat Government Initiative
        </div>
      </div>
    </footer>
  );
}
