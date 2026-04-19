import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setTempMobile, setTempUserData, loginSuccess } from '../../store/authSlice';
import { PhoneCall } from 'lucide-react';
import { departments } from '../../mockData/departments';

export default function Signup() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mainRoleType, setMainRoleType] = useState('citizen'); // 'citizen' or 'government'
  const [govRole, setGovRole] = useState('department');
  const [department, setDepartment] = useState('');
  const [customDept, setCustomDept] = useState('');
  
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!/^\d{10}$/.test(mobile)) {
      setError(t('auth.invalidMobile') || 'Invalid Mobile Number');
      return;
    }
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (mainRoleType === 'government') {
      if (!password) {
        setError('Password is required for government roles');
        return;
      }
      if (govRole === 'department') {
        if (!department) {
          setError('Department is required');
          return;
        }
        if (department === 'Other' && !customDept.trim()) {
          setError('Please specify the department name');
          return;
        }
      }
    }

    const finalRole = mainRoleType === 'citizen' ? 'citizen' : govRole;
    const finalDept = department === 'Other' ? customDept : department;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile, 
          name, 
          role: finalRole, 
          department: mainRoleType === 'government' ? finalDept : null,
          password: mainRoleType === 'government' ? password : null 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Signup failed');
      } else {
        if (data.requireOtp) {
          dispatch(setTempMobile(mobile));
          dispatch(setTempUserData(data.user));
          navigate('/verify-otp');
        } else {
          dispatch(loginSuccess(data.user));
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
            Create Account
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            Swagat Grievance Resolution System
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-card" style={{ padding: 32 }}>
          {/* Role Toggle */}
            <div style={{ display: 'flex', marginBottom: 24, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
              <button
                type="button"
                onClick={() => setMainRoleType('citizen')}
                style={{ flex: 1, padding: '14px', border: 'none', cursor: 'pointer', background: mainRoleType === 'citizen' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent', color: mainRoleType === 'citizen' ? 'white' : 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '1rem' }}
              >
                👨‍💼 Citizen
              </button>
              <button
                type="button"
                onClick={() => setMainRoleType('government')}
                style={{ flex: 1, padding: '14px', border: 'none', cursor: 'pointer', background: mainRoleType === 'government' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent', color: mainRoleType === 'government' ? 'white' : 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '1rem' }}
              >
                🏛️ Government
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '2px solid rgba(239, 68, 68, 0.4)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: '0.9rem', marginBottom: 20, textAlign: 'center', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {mainRoleType === 'government' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>🏢 Role Type</label>
                    <select value={govRole} onChange={(e) => setGovRole(e.target.value)} className="select-dark" style={{ width: '100%' }}>
                      <option value="department">Department Officer</option>
                      <option value="field">Field Officer</option>
                      <option value="collector">Collector</option>
                    </select>
                  </div>

                  {govRole === 'department' && (
                    <div>
                      <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>🏛️ Department</label>
                      <select value={department} onChange={(e) => setDepartment(e.target.value)} className="select-dark" style={{ width: '100%' }}>
                        <option value="">-- Select Department --</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                        <option value="Other">Other (Custom)</option>
                      </select>
                    </div>
                  )}

                  {govRole === 'department' && department === 'Other' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>📝 Department Name (English)</label>
                      <input type="text" className="input-dark" placeholder="Enter custom department" value={customDept} onChange={(e) => setCustomDept(e.target.value)} required />
                    </div>
                  )}
                </>
              )}
            
              <div>
                <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>👤 Full Name</label>
                <input type="text" required className="input-dark" placeholder="Ramesh Patel" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>📱 Mobile Number</label>
                <input type="tel" required className="input-dark" placeholder="9876543210" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} maxLength="10" style={{ letterSpacing: '0.1em' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8, display: 'block', fontWeight: 700 }}>🔒 Password</label>
                <input type="password" required className="input-dark" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <button type="submit" disabled={loading} className="glow-btn" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: 10, fontWeight: 800 }}>
                {loading ? 'Creating Account...' : 'Sign Up Now →'}
              </button>
            </form>

            <div style={{ marginTop: 28, textAlign: 'center', fontSize: '1rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Already have an account? </span>
              <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 700, borderBottom: '1px solid #60a5fa' }}>Log In</Link>
            </div>
        </div>
      </div>
    </div>
  );
}
