import { useState, useEffect } from 'react';
import { FlaskConical, Plus, X, ArrowRight, Sparkles } from 'lucide-react';

export default function ExperimentLog({ token }) {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    day: '1',
    hypothesis: '',
    changeMade: '',
    metric: '',
    observation: '',
    nextAction: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExperiments = async () => {
    try {
      const res = await fetch('/api/admin/experiments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExperiments(data.experiments || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchExperiments();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.hypothesis || !form.changeMade || !form.metric) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/experiments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ day: '1', hypothesis: '', changeMade: '', metric: '', observation: '', nextAction: '' });
        setShowForm(false);
        fetchExperiments();
      }
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  }

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '28px', color: '#94a3b8', textAlign: 'center' }}>
        Loading growth experiments...
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '28px', background: 'rgba(15, 23, 42, 0.75)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FlaskConical size={18} color="#818cf8" />
            Growth Experiment & Decision Log
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            Validated A/B hypotheses, message changes, metrics, and data-driven iterations
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: showForm ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            border: showForm ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '8px',
            color: showForm ? '#fca5a5' : '#a5b4fc',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '0.86rem',
            cursor: 'pointer',
          }}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel Entry' : 'Log New Experiment'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Campaign Day</label>
              <select
                style={{ width: '100%', padding: '10px', background: '#0b1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                value={form.day}
                onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>Day {d}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Hypothesis</label>
              <input
                style={{ width: '100%', padding: '10px', background: '#0b1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                placeholder="e.g. Outcome message CTR >= 12%"
                value={form.hypothesis}
                onChange={(e) => setForm((f) => ({ ...f, hypothesis: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Change Made</label>
              <input
                style={{ width: '100%', padding: '10px', background: '#0b1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                placeholder="What was modified or tested?"
                value={form.changeMade}
                onChange={(e) => setForm((f) => ({ ...f, changeMade: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Metric Tracked</label>
              <input
                style={{ width: '100%', padding: '10px', background: '#0b1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                placeholder="e.g. Link CTR, CVR %"
                value={form.metric}
                onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {submitting ? 'Saving...' : 'Save to Growth Log'}
          </button>
        </form>
      )}

      {/* Experiments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {experiments.map((exp) => (
          <div
            key={exp.id}
            style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}>
                  DAY {exp.day}
                </span>
                <h4 style={{ fontSize: '0.98rem', color: '#fff', margin: 0 }}>
                  {exp.hypothesis}
                </h4>
              </div>

              {exp.is_demo ? (
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} /> Seed Simulation
                </span>
              ) : null}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Intervention
                </span>
                <span style={{ color: '#e2e8f0' }}>{exp.change_made}</span>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Metric Tracked
                </span>
                <span style={{ color: '#e2e8f0' }}>{exp.metric}</span>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Observed Outcome
                </span>
                <span style={{ color: '#38bdf8' }}>{exp.observation}</span>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Strategic Decision
                </span>
                <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowRight size={13} /> {exp.next_action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
