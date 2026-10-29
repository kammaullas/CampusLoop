import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Share2 } from 'lucide-react';

const CHANNEL_COLORS = {
  whatsapp_group: '#25D366',
  ambassador_referral: '#6366f1',
  college_club: '#06b6d4',
  instagram: '#E1306C',
  direct: '#f59e0b',
  share: '#10b981',
};

const CHANNEL_LABELS = {
  whatsapp_group: 'WhatsApp Groups',
  ambassador_referral: 'Ambassadors (P2P)',
  college_club: 'College Tech Clubs',
  instagram: 'Instagram Stories',
  direct: 'Direct Web Visits',
  share: 'Peer Share Links',
};

export default function ChannelBreakdown({ token, includeDemo }) {
  const [data, setData] = useState({ channels: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/channels?includeDemo=${includeDemo}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, includeDemo]);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#94a3b8' }}>Loading channel performance...</span>
      </div>
    );
  }

  const chartData = data.channels.map((c) => ({
    source: CHANNEL_LABELS[c.source] || c.source,
    count: c.count,
    percent: c.percent,
    rawSource: c.source,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={tooltipStyle}>
        <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{d.source}</p>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          {d.count} registrations ({d.percent}% of total)
        </p>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.75)' }}>
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Share2 size={18} color="#06b6d4" />
          Acquisition by Channel
        </h3>
        <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
          Attributed source distribution · Total: <strong>{data.total}</strong>
        </p>
      </div>

      {chartData.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
          No channel conversions logged yet.
        </p>
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis type="category" dataKey="source" stroke="#94a3b8" fontSize={11} width={130} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                {chartData.map((entry) => (
                  <Cell key={entry.rawSource} fill={CHANNEL_COLORS[entry.rawSource] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const tooltipStyle = {
  background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '10px',
  padding: '10px 14px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
};
