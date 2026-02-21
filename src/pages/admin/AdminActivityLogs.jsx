import React, { useState, useEffect, useCallback, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const PRIMARY = '#4A9B8E';
const SECONDARY = '#7FB069';
const TEXT = '#2D3748';
const MUTED = '#718096';
const BORDER = 'rgba(160,174,192,0.25)';
const CARD_BG = '#fff';

const CATEGORY_COLORS = {
    auth: { bg: 'rgba(74,155,142,0.12)', color: '#2C7A7B' },
    mood: { bg: 'rgba(104,211,145,0.12)', color: '#276749' },
    appointment: { bg: 'rgba(244,162,97,0.12)', color: '#C05621' },
    journal: { bg: 'rgba(159,122,234,0.12)', color: '#553C9A' },
    admin: { bg: 'rgba(252,129,129,0.12)', color: '#9B2335' },
    wellness: { bg: 'rgba(99,179,237,0.12)', color: '#2B6CB0' },
};

function CategoryBadge({ cat }) {
    const c = CATEGORY_COLORS[cat] || { bg: 'rgba(113,128,150,0.12)', color: '#4A5568' };
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, textTransform: 'capitalize' }}>{cat || '—'}</span>;
}

const ROLES = ['all', 'patient', 'counsellor', 'admin'];

export default function AdminActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [role, setRole] = useState('all');
    const [search, setSearch] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const intervalRef = useRef(null);

    const token = localStorage.getItem('adminToken');

    const fetchLogs = useCallback(async () => {
        try {
            const params = new URLSearchParams({ page, limit: 25, ...(role !== 'all' && { role }), ...(search && { action: search }) });
            const res = await fetch(`${API}/api/admin/activity-logs?${params}`, { headers: { 'x-admin-token': token } });
            const data = await res.json();
            setLogs(data.logs || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } finally { setLoading(false); }
    }, [page, role, search, token]);

    useEffect(() => { setLoading(true); fetchLogs(); }, [fetchLogs]);

    useEffect(() => {
        if (autoRefresh) { intervalRef.current = setInterval(fetchLogs, 10000); }
        else clearInterval(intervalRef.current);
        return () => clearInterval(intervalRef.current);
    }, [autoRefresh, fetchLogs]);

    const inputStyle = { padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#FEFEFE', fontSize: 13, color: TEXT, outline: 'none', fontFamily: 'inherit' };

    return (
        <div>
            <style>{`.alog-row:hover{background:rgba(74,155,142,0.035)!important}`}</style>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0 }}>Activity Logs</h1>
                    <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{total.toLocaleString()} total entries</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: MUTED }}>Auto-refresh</span>
                    <button onClick={() => setAutoRefresh(r => !r)} style={{
                        width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: autoRefresh ? PRIMARY : BORDER, position: 'relative', transition: 'background 0.2s'
                    }}>
                        <span style={{ position: 'absolute', top: 3, left: autoRefresh ? 20 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ background: CARD_BG, borderRadius: 14, padding: '16px 20px', border: `1px solid ${BORDER}`, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <input style={{ ...inputStyle, minWidth: 220, flex: 1 }} placeholder="Filter by action…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ROLES.map(r => (
                        <button key={r} onClick={() => { setRole(r); setPage(1); }} style={{
                            padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${role === r ? PRIMARY : BORDER}`,
                            background: role === r ? PRIMARY : '#fff', color: role === r ? '#fff' : MUTED,
                            fontWeight: 500, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s'
                        }}>{r === 'all' ? 'All Roles' : r}</button>
                    ))}
                </div>
                <button onClick={() => fetchLogs()} style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#fff', color: TEXT, cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div style={{ background: CARD_BG, borderRadius: 14, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: MUTED, gap: 10 }}>
                        <div style={{ width: 18, height: 18, border: `2px solid ${PRIMARY}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Loading logs…<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#F8FAFA', borderBottom: `1px solid ${BORDER}` }}>
                                {['Timestamp', 'User', 'Role', 'Action', 'Category', 'Details'].map(h => (
                                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, i) => (
                                <tr key={log._id} className="alog-row" style={{ borderBottom: i < logs.length - 1 ? `1px solid ${BORDER}` : 'none', background: i % 2 === 0 ? '#fff' : '#FEFEFE' }}>
                                    <td style={{ padding: '10px 18px', color: MUTED, whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '10px 18px' }}>
                                        <div style={{ fontWeight: 500, color: TEXT }}>{log.userName || '—'}</div>
                                        <div style={{ fontSize: 11, color: MUTED }}>{log.userEmail}</div>
                                    </td>
                                    <td style={{ padding: '10px 18px' }}>
                                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'rgba(74,155,142,0.1)', color: '#2C7A7B', fontWeight: 600, textTransform: 'capitalize' }}>{log.userRole || '—'}</span>
                                    </td>
                                    <td style={{ padding: '10px 18px', fontWeight: 500, color: TEXT, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{log.action}</td>
                                    <td style={{ padding: '10px 18px' }}><CategoryBadge cat={log.category} /></td>
                                    <td style={{ padding: '10px 18px', color: MUTED, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details || '—'}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: MUTED }}>No logs found</td></tr>}
                        </tbody>
                    </table>
                )}
                {totalPages > 1 && (
                    <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: MUTED }}>
                        <span>Page {page} of {totalPages}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${BORDER}`, background: page === 1 ? '#F8FAFA' : '#fff', color: page === 1 ? MUTED : TEXT, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>← Prev</button>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${BORDER}`, background: page === totalPages ? '#F8FAFA' : '#fff', color: page === totalPages ? MUTED : TEXT, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 12 }}>Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
