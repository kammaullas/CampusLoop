import {
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Target
} from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const isAhead = stats.status === 'ahead';

  const cards = [
    {
      label: stats.includeDemo ? 'Total Volume (Demo Mode)' : 'Verified Live Registrations',
      value: stats.totalRegistrations,
      sub: `${stats.liveRegistrations} live verified · ${stats.demoRegistrations} demo`,
      color: '#818cf8',
      icon: Users,
    },
    {
      label: 'Campaign Progress',
      value: `${stats.progressPercent}%`,
      sub: `${stats.remaining} spots to goal (${stats.goal})`,
      color: stats.progressPercent >= 80 ? '#10b981' : stats.progressPercent >= 40 ? '#f59e0b' : '#38bdf8',
      icon: TrendingUp,
    },
    {
      label: "Today's Volume",
      value: stats.todayRegistrations,
      sub: `Daily target: ${stats.dailyTarget}`,
      color: stats.todayRegistrations >= stats.dailyTarget ? '#10b981' : '#f59e0b',
      icon: Calendar,
    },
    {
      label: 'Campaign Timeline',
      value: `Day ${stats.campaignDay} / ${stats.campaignDays}`,
      sub: isAhead ? 'Pacing ahead of target' : 'Behind planned pacing',
      color: isAhead ? '#10b981' : '#f43f5e',
      icon: Clock,
    },
    {
      label: 'Colleges Represented',
      value: stats.uniqueColleges,
      sub: `${stats.activeAmbassadors} active / ${stats.totalAmbassadors} ambassadors`,
      color: '#22d3ee',
      icon: Building2,
    },
  ];

  const gap = stats.plannedCumulative - stats.totalRegistrations;

  return (
    <div style={{ marginBottom: '28px' }}>
      
      {/* ── Top Trajectory Status Ribbon ─────────────────────────── */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '20px',
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Target size={18} color="#818cf8" />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Campaign Target Pace · {stats.includeDemo ? 'Simulation + Live' : 'Verified Live Only'}
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                {stats.totalRegistrations} <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem' }}>/ {stats.goal} Target Registrations</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: isAhead ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: isAhead ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(244, 63, 94, 0.35)',
            color: isAhead ? '#34d399' : '#fb7185',
            fontFamily: 'var(--font-display)',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}>
            {isAhead ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {isAhead ? 'Pacing Ahead of Plan' : 'Pacing Behind Target'}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '10px',
        }}>
          <div style={{
            width: `${Math.min(100, Math.max(1, stats.progressPercent))}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)',
            borderRadius: '9999px',
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Trajectory stats footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: '#94a3b8',
          fontFamily: 'var(--font-mono)',
        }}>
          <span>Planned Benchmark: {stats.plannedCumulative}</span>
          <span>Actual Logged: {stats.totalRegistrations}</span>
          <span style={{ color: gap > 0 ? '#fb7185' : '#34d399' }}>
            Delta: {gap > 0 ? `-${gap} deficit` : `+${Math.abs(gap)} surplus`}
          </span>
        </div>
      </div>

      {/* ── 5 Metric KPI Cards ───────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
      }}>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="glass-panel"
              style={{
                padding: '20px',
                background: 'rgba(15, 23, 42, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {c.label}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={16} color={c.color} />
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: c.color,
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.1,
                  marginBottom: '4px',
                }}>
                  {c.value}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {c.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
