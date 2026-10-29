import { useState, useEffect } from 'react';
import { Trophy, Award, QrCode, X, ExternalLink } from 'lucide-react';

export default function Leaderboard({ token, includeDemo }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/leaderboard?includeDemo=${includeDemo}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, includeDemo]);

  async function showQR(code) {
    try {
      const res = await fetch(`/api/admin/qr/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setQrData(d);
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#94a3b8' }}>Loading campus leaderboard...</span>
      </div>
    );
  }

  const maxReferrals = data.length > 0 ? Math.max(...data.map((d) => d.referrals), 1) : 1;

  return (
    <div className="glass-panel" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.75)' }}>
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Trophy size={18} color="#f59e0b" />
          Campus Ambassador Standings
        </h3>
        <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
          Ranked by verified student registrations
        </p>
      </div>

      {data.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
          No active campus ambassadors found.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.slice(0, 7).map((amb, i) => (
            <div
              key={amb.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: i < 3 ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: i === 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
              }}
            >
              {/* Rank Badge */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: i === 0 ? 'rgba(245, 158, 11, 0.2)' : i === 1 ? 'rgba(148, 163, 184, 0.2)' : i === 2 ? 'rgba(217, 119, 6, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#f59e0b' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.82rem',
                flexShrink: 0,
              }}>
                {i < 3 ? <Award size={16} /> : `#${i + 1}`}
              </div>

              {/* Ambassador Info */}
              <div style={{ flex: '1 1 120px', minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {amb.name}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {amb.college}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ flex: '2 1 100px', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(amb.referrals / maxReferrals) * 100}%`,
                  height: '100%',
                  background: i === 0 ? 'linear-gradient(90deg, #f59e0b, #eab308)' : 'linear-gradient(90deg, #6366f1, #06b6d4)',
                  borderRadius: '9999px',
                }} />
              </div>

              {/* Referral Count */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>
                  {amb.referrals}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>leads</div>
              </div>

              {/* QR Button */}
              <button
                onClick={() => showQR(amb.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title="View Ambassador QR Pass"
              >
                <QrCode size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {qrData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }} onClick={() => setQrData(null)}>
          <div
            className="glass-panel"
            style={{ padding: '28px', maxWidth: '360px', width: '100%', textAlign: 'center', background: '#0b1020' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>Ambassador Referral Pass</h4>
              <button onClick={() => setQrData(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '14px' }}>
              <img src={qrData.qr} alt="Ambassador QR" style={{ width: '180px', height: '180px', display: 'block' }} />
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
              {qrData.url}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
