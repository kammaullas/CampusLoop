import { useState, useEffect, useCallback } from 'react';
import { Download, Search, Users, ShieldCheck, Sparkles } from 'lucide-react';

export default function RegistrationTable({ token, includeDemo }) {
  const [registrations, setRegistrations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    source: '',
    college: '',
  });

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
      includeDemo: String(includeDemo),
    });
    if (filters.search) params.set('search', filters.search);
    if (filters.source) params.set('source', filters.source);
    if (filters.college) params.set('college', filters.college);

    try {
      const res = await fetch(`/api/admin/registrations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRegistrations(data.registrations || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token, includeDemo, page, filters]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.source, filters.college, includeDemo]);

  function handleExport() {
    const url = `/api/admin/registrations/export?includeDemo=${includeDemo}`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'campusloop_registrations.csv');
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  }

  return (
    <div className="glass-panel" style={{ padding: '28px', background: 'rgba(15, 23, 42, 0.75)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Users size={18} color="#818cf8" />
            Verified Registrations Directory
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            Showing {registrations.length} of {total} records · Page {page} of {totalPages}
          </p>
        </div>

        <button
          onClick={handleExport}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '8px',
            color: '#a5b4fc',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '0.86rem',
            cursor: 'pointer',
          }}
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
          <input
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.86rem',
              outline: 'none',
            }}
            placeholder="Search name, email, college..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>

        <select
          style={{
            padding: '10px 14px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.86rem',
            outline: 'none',
          }}
          value={filters.source}
          onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
        >
          <option value="" style={{ background: '#0b1020' }}>All Channels</option>
          <option value="whatsapp_group" style={{ background: '#0b1020' }}>WhatsApp Groups</option>
          <option value="ambassador_referral" style={{ background: '#0b1020' }}>Ambassador Referrals</option>
          <option value="college_club" style={{ background: '#0b1020' }}>College Clubs</option>
          <option value="instagram" style={{ background: '#0b1020' }}>Instagram</option>
          <option value="direct" style={{ background: '#0b1020' }}>Direct Web</option>
          <option value="share" style={{ background: '#0b1020' }}>Peer Share Links</option>
        </select>

        <input
          style={{
            padding: '10px 14px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.86rem',
            outline: 'none',
          }}
          placeholder="Filter by college name..."
          value={filters.college}
          onChange={(e) => setFilters((f) => ({ ...f, college: e.target.value }))}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '36px 0' }}>
          Loading registrations directory...
        </div>
      ) : registrations.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '36px 0' }}>
          No records match the active criteria.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>NAME</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>EMAIL</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>COLLEGE</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>BATCH</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>SOURCE</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 10px', color: '#fff', fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: '12px 10px', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{r.email}</td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{r.college}</td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{r.graduation_year}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      fontSize: '0.76rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#cbd5e1',
                    }}>
                      {r.source || 'direct'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {r.is_demo ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: '#fbbf24',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                      }}>
                        <Sparkles size={11} /> Demo Record
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#34d399',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                      }}>
                        <ShieldCheck size={11} /> Verified Live
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#94a3b8', fontSize: '0.82rem' }}>
            <span>Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1,
                }}
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
