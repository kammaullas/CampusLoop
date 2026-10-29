import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Please provide the campaign operator token.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });

      if (res.ok) {
        sessionStorage.setItem('adminToken', token.trim());
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin token. Access denied.');
      }
    } catch {
      setError('Cannot connect to backend API server at localhost:3001.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px 32px',
        background: 'linear-gradient(180deg, rgba(22, 33, 62, 0.85) 0%, rgba(12, 16, 32, 0.95) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px auto',
        }}>
          <Lock size={26} color="#818cf8" />
        </div>

        <h1 style={{ fontSize: '1.65rem', color: '#fff', marginBottom: '8px' }}>
          CampusLoop Operator Auth
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.5 }}>
          Access the 7-day acquisition control center and ambassador attribution telemetry.
        </p>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '12px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            fontSize: '0.84rem',
            textAlign: 'left',
            marginBottom: '20px',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>
              Security Token
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '14px', color: '#64748b' }} />
              <input
                type="password"
                placeholder="Enter ADMIN_TOKEN"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>
            <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '6px' }}>
              Requires server-side administrative token. Check server environment configuration.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cta-glow"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" /> Authenticating...
              </>
            ) : (
              <>
                Authenticate Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <a href="/" style={{ color: '#818cf8', fontSize: '0.84rem', textDecoration: 'none' }}>
            ← Back to Student Registration Page
          </a>
        </div>
      </div>
    </div>
  );
}
