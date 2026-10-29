import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  LogOut,
  Database,
  Trash2,
  RotateCcw,
  BarChart3,
  Users,
  FlaskConical,
  AlertCircle,
  ShieldCheck,
  Check,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import StatsCards from '../components/StatsCards';
import DailyTrend from '../components/DailyTrend';
import ChannelBreakdown from '../components/ChannelBreakdown';
import Leaderboard from '../components/Leaderboard';
import RegistrationTable from '../components/RegistrationTable';
import ExperimentLog from '../components/ExperimentLog';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('adminToken');

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [includeDemo, setIncludeDemo] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/admin', { replace: true });
    }
  }, [token, navigate]);

  const apiHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/stats?includeDemo=${includeDemo}`, { headers: apiHeaders });
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('adminToken');
        navigate('/admin', { replace: true });
        return;
      }
      const data = await res.json();
      setStats(data);
      setError('');
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  }, [token, includeDemo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function handleSeedDemo() {
    try {
      const res = await fetch('/api/admin/seed-demo', {
        method: 'POST',
        headers: apiHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Seeded ${data.counts.registrations} records and ${data.counts.ambassadors} ambassadors`);
        fetchStats();
      } else {
        showToast(data.message || data.error, 'error');
      }
    } catch {
      showToast('Failed to seed demo data.', 'error');
    }
  }

  async function handleReset(demoOnly) {
    const label = demoOnly ? 'demo records' : 'ALL registrations';
    if (!window.confirm(`Are you sure you want to clear ${label}? This cannot be undone.`)) return;

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ demoOnly }),
      });
      if (res.ok) {
        showToast(`${demoOnly ? 'Demo data' : 'All data'} successfully cleared.`);
        fetchStats();
      }
    } catch {
      showToast('Failed to reset data.', 'error');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('adminToken');
    navigate('/admin', { replace: true });
  }

  if (!token) return null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={28} className="spin-icon" color="#818cf8" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading Growth Operations Console...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', maxWidth: '420px' }}>
          <AlertCircle size={36} color="#f43f5e" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ color: '#fca5a5', marginBottom: '16px' }}>{error}</p>
          <button className="btn-cta-glow" onClick={fetchStats}>Retry Connection</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Growth Overview', icon: BarChart3 },
    { id: 'registrations', label: 'Registrations Directory', icon: Users },
    { id: 'experiments', label: 'A/B Experiment Log', icon: FlaskConical },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px 60px 20px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* ── Top Header ─────────────────────────────────────────── */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Layers size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                CampusLoop <span style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.82rem' }}>GROWTH OPS</span>
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                NxtWave Workshop Acquisition Control Center (Goal: {stats?.goal || 500} Students)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={fetchStats}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        {/* ── Demo Controls Bar ──────────────────────────────────── */}
        <div className="glass-panel" style={{
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'rgba(15, 23, 42, 0.55)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {stats?.demoRegistrations > 0 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fcd34d',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}>
                <Sparkles size={14} />
                {stats.demoRegistrations} Synthetic Demo Records Active
              </div>
            )}

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              color: '#94a3b8',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={includeDemo}
                onChange={(e) => setIncludeDemo(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              Show synthetic demo records in charts
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleSeedDemo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                color: '#6ee7b7',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Database size={14} /> Seed 250 Demo Records
            </button>

            <button
              onClick={() => handleReset(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#94a3b8',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} /> Purge Demo Data
            </button>

            <button
              onClick={() => handleReset(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} /> Wipe All Records
            </button>
          </div>
        </div>

        {/* ── Metric KPI Cards ───────────────────────────────────── */}
        <StatsCards stats={stats} />

        {/* ── Tab Switcher ───────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '24px',
          paddingBottom: '2px',
        }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                  fontFamily: 'var(--font-display)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} color={isActive ? '#818cf8' : '#64748b'} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Views ──────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <DailyTrend token={token} includeDemo={includeDemo} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '24px',
            }}>
              <ChannelBreakdown token={token} includeDemo={includeDemo} />
              <Leaderboard token={token} includeDemo={includeDemo} />
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <RegistrationTable token={token} includeDemo={includeDemo} />
        )}

        {activeTab === 'experiments' && (
          <ExperimentLog token={token} />
        )}

      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '14px 20px',
          borderRadius: '12px',
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '0.9rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
