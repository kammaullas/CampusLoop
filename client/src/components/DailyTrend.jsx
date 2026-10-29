import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart, Area,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function DailyTrend({ token, includeDemo }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/daily-trend?includeDemo=${includeDemo}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d.trend || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, includeDemo]);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#94a3b8' }}>Loading trajectory trends...</span>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    day: d.day.slice(5), // MM-DD format
    planned: d.planned,
    actual: d.actual,
    plannedCumulative: d.plannedCumulative,
    actualCumulative: d.actualCumulative,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={tooltipStyle}>
        <p style={{ fontWeight: 700, marginBottom: '6px', color: '#fff', fontSize: '0.88rem' }}>Date: {label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ fontSize: '0.82rem', color: p.color, margin: '3px 0' }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', background: 'rgba(15, 23, 42, 0.75)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <TrendingUp size={18} color="#818cf8" />
            7-Day Acquisition Trajectory
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            Planned cumulative benchmarks vs. actual verified student registrations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#6366f1' }} /> Daily Additions
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#06b6d4' }} /> Cumulative Total
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '0px', borderTop: '2px dashed #94a3b8' }} /> Target Benchmark
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="actual" name="Daily Registrations" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="plannedCumulative"
              name="Target Benchmark"
              stroke="#94a3b8"
              strokeDasharray="6 4"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="actualCumulative"
              name="Cumulative Total"
              stroke="#06b6d4"
              fill="rgba(6,182,212,0.12)"
              strokeWidth={2.5}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '10px',
  padding: '12px 16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
};
