import React, { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const PRIMARY = '#4A9B8E';
const SECONDARY = '#7FB069';
const ACCENT = '#F4A261';
const TEXT = '#2D3748';
const MUTED = '#718096';
const BORDER = 'rgba(160,174,192,0.25)';
const CARD_BG = '#fff';

const STATUS_STYLES = {
    pending: { bg: 'rgba(244,162,97,0.12)', color: '#C05621' },
    confirmed: { bg: 'rgba(127,176,105,0.12)', color: '#276749' },
    completed: { bg: 'rgba(74,155,142,0.12)', color: '#2C7A7B' },
    cancelled: { bg: 'rgba(252,129,129,0.12)', color: '#9B2335' },
};

function StatusBadge({ status }) {
    const c = STATUS_STYLES[status] || { bg: 'rgba(113,128,150,0.12)', color: '#4A5568' };
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, textTransform: 'capitalize' }}>{status || '—'}</span>;
}

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');

    const token = localStorage.getItem('adminToken');

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20, ...(status !== 'all' && { status }), ...(search && { search }) });
            const res = await fetch(`${API}/api/admin/appointments?${params}`, { headers: { 'x-admin-token': token } });
            const data = await res.json();
            setAppointments(data.appointments || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } finally { setLoading(false); }
    }, [page, status, search, token]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const statusCounts = STATUSES.slice(1).reduce((acc, s) => ({ ...acc, [s]: appointments.filter(a => a.status === s).length }), {});

    return (
        <div>
            <style>{`.apt-row:hover{background:rgba(74,155,142,0.035)!important}`}</style>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0 }}>Appointments</h1>
                    <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{total} total appointments across all users</p>
                </div>
                <button onClick={fetchAppointments} style={{ padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: CARD_BG, color: TEXT, fontWeight: 500, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                    Refresh
                </button>
            </div>

            {/* Status card tabs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {[{ k: 'all', label: 'All', value: total }, ...STATUSES.slice(1).map(s => ({ k: s, label: s.charAt(0).toUpperCase() + s.slice(1), value: statusCounts[s] || 0 }))].map(({ k, label, value }) => {
                    const c = STATUS_STYLES[k] || { bg: 'rgba(74,155,142,0.08)', color: PRIMARY };
                    const active = status === k;
                    return (
                        <button key={k} onClick={() => { setStatus(k); setPage(1); }} style={{
                            padding: '12px 18px', borderRadius: 12, border: `1.5px solid ${active ? (k === 'all' ? PRIMARY : c.color) : BORDER}`,
                            background: active ? (k === 'all' ? `rgba(74,155,142,0.08)` : c.bg) : CARD_BG,
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', flex: '1 1 100px', minWidth: 100
                        }}>
                            <div style={{ fontSize: 11, color: MUTED, fontWeight: 500, marginBottom: 2 }}>{label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: active ? (k === 'all' ? PRIMARY : c.color) : TEXT }}>{value}</div>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div style={{ background: CARD_BG, borderRadius: 14, padding: '14px 20px', border: `1px solid ${BORDER}`, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <input style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#FEFEFE', fontSize: 13, color: TEXT, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    placeholder="Search by patient name, email, or counsellor…" value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            {/* Table */}
            <div style={{ background: CARD_BG, borderRadius: 14, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: MUTED, gap: 10 }}>
                        <div style={{ width: 18, height: 18, border: `2px solid ${PRIMARY}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Loading…<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#F8FAFA', borderBottom: `1px solid ${BORDER}` }}>
                                {['Patient', 'Counsellor', 'Type', 'Date', 'Status', 'Notes'].map(h => (
                                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((apt, i) => (
                                <tr key={apt._id} className="apt-row" style={{ borderBottom: i < appointments.length - 1 ? `1px solid ${BORDER}` : 'none', background: i % 2 === 0 ? '#fff' : '#FEFEFE' }}>
                                    <td style={{ padding: '12px 18px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                                                {(apt.userId?.name || '?')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: TEXT }}>{apt.userId?.name || '—'}</div>
                                                <div style={{ fontSize: 11, color: MUTED }}>{apt.userId?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 18px' }}>
                                        <div style={{ fontWeight: 500, color: TEXT }}>{apt.counsellorId?.name || '—'}</div>
                                        <div style={{ fontSize: 11, color: MUTED }}>{apt.counsellorId?.email}</div>
                                    </td>
                                    <td style={{ padding: '12px 18px', color: MUTED, textTransform: 'capitalize' }}>{apt.sessionType || apt.type || '—'}</td>
                                    <td style={{ padding: '12px 18px', color: MUTED, fontSize: 12, whiteSpace: 'nowrap' }}>
                                        {apt.scheduledDate ? new Date(apt.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : apt.date ? new Date(apt.date).toLocaleDateString() : '—'}
                                        {apt.time && <div style={{ fontSize: 11 }}>{apt.time}</div>}
                                    </td>
                                    <td style={{ padding: '12px 18px' }}><StatusBadge status={apt.status} /></td>
                                    <td style={{ padding: '12px 18px', color: MUTED, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{apt.notes || apt.reason || '—'}</td>
                                </tr>
                            ))}
                            {appointments.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: MUTED }}>No appointments found</td></tr>}
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
