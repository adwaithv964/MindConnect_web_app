import React, { useState, useEffect, useCallback, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const PRIMARY = '#4A9B8E';
const TEXT = '#2D3748';
const MUTED = '#718096';
const BORDER = 'rgba(160,174,192,0.25)';
const CARD_BG = '#fff';

const SEVERITY_STYLES = {
    info: { bg: 'rgba(99,179,237,0.12)', color: '#2B6CB0', label: 'Info' },
    warning: { bg: 'rgba(244,162,97,0.12)', color: '#C05621', label: 'Warning' },
    critical: { bg: 'rgba(252,129,129,0.15)', color: '#9B2335', label: 'Critical' },
};

function SeverityBadge({ s }) {
    const c = SEVERITY_STYLES[s] || SEVERITY_STYLES.info;
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>{c.label}</span>;
}

const SEVERITIES = ['', 'info', 'warning', 'critical'];

export default function AdminSecurityLogs() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [severity, setSeverity] = useState('');
    const [successFilter, setSuccessFilter] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const intervalRef = useRef(null);

    const token = localStorage.getItem('adminToken');

    const fetchLogs = useCallback(async () => {
        try {
            const params = new URLSearchParams({ page, limit: 25, ...(severity && { severity }), ...(successFilter !== '' && { success: successFilter }) });
            const res = await fetch(`${API}/api/admin/security-logs?${params}`, { headers: { 'x-admin-token': token } });
            const data = await res.json();
            setLogs(data.logs || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } finally { setLoading(false); }
    }, [page, severity, successFilter, token]);

    useEffect(() => { setLoading(true); fetchLogs(); }, [fetchLogs]);
    useEffect(() => {
        if (autoRefresh) intervalRef.current = setInterval(fetchLogs, 10000);
        else clearInterval(intervalRef.current);
        return () => clearInterval(intervalRef.current);
    }, [autoRefresh, fetchLogs]);

    const criticalCount = logs.filter(l => l.severity === 'critical').length;
    const failCount = logs.filter(l => !l.success).length;

    const inputStyle = { padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#FEFEFE', fontSize: 13, color: TEXT, outline: 'none', fontFamily: 'inherit' };

    const PillBtn = ({ val, current, label, onChange, activeColor }) => (
        <button onClick={() => { onChange(val); setPage(1); }} style={{
            padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${current === val ? (activeColor || PRIMARY) : BORDER}`,
            background: current === val ? (activeColor || PRIMARY) : '#fff', color: current === val ? '#fff' : MUTED,
            fontWeight: 500, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s'
        }}>{label}</button>
    );

    return (
        <div>
            <style>{`.slog-row:hover{background:rgba(74,155,142,0.035)!important}`}</style>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0 }}>Security Logs</h1>
                    <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{total.toLocaleString()} total events</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: MUTED }}>Auto-refresh</span>
                    <button onClick={() => setAutoRefresh(r => !r)} style={{ width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: autoRefresh ? PRIMARY : BORDER, position: 'relative', transition: 'background 0.2s' }}>
                        <span style={{ position: 'absolute', top: 3, left: autoRefresh ? 20 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </button>
                </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                {[
                    { label: 'This Page', value: logs.length, color: PRIMARY, bg: 'rgba(74,155,142,0.08)' },
                    { label: 'Critical', value: criticalCount, color: '#9B2335', bg: 'rgba(252,129,129,0.08)' },
                    { label: 'Failed', value: failCount, color: '#C05621', bg: 'rgba(244,162,97,0.08)' },
                    { label: 'Total', value: total, color: TEXT, bg: '#F8FAFA' },
                ].map(s => (
                    <div key={s.label} style={{ background: CARD_BG, borderRadius: 12, padding: '14px 20px', border: `1px solid ${BORDER}`, flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: 11, color: MUTED, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ background: CARD_BG, borderRadius: 14, padding: '14px 20px', border: `1px solid ${BORDER}`, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>Severity:</span>
                <PillBtn val="" current={severity} label="All" onChange={setSeverity} />
                <PillBtn val="info" current={severity} label="Info" onChange={setSeverity} activeColor="#2B6CB0" />
                <PillBtn val="warning" current={severity} label="Warning" onChange={setSeverity} activeColor="#C05621" />
                <PillBtn val="critical" current={severity} label="Critical" onChange={setSeverity} activeColor="#9B2335" />
                <div style={{ width: 1, height: 20, background: BORDER }} />
                <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>Status:</span>
                <PillBtn val="" current={successFilter} label="All" onChange={setSuccessFilter} />
                <PillBtn val="true" current={successFilter} label="Success" onChange={setSuccessFilter} activeColor="#276749" />
                <PillBtn val="false" current={successFilter} label="Failed" onChange={setSuccessFilter} activeColor="#9B2335" />
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
                                {['Timestamp', 'User', 'Event', 'Severity', 'Status', 'Details'].map(h => (
                                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, i) => (
                                <tr key={log._id} className="slog-row" style={{ borderBottom: i < logs.length - 1 ? `1px solid ${BORDER}` : 'none', background: log.severity === 'critical' ? 'rgba(252,129,129,0.03)' : i % 2 === 0 ? '#fff' : '#FEFEFE' }}>
                                    <td style={{ padding: '10px 18px', color: MUTED, whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '10px 18px' }}>
                                        <div style={{ fontWeight: 500, color: TEXT }}>{log.userName || '—'}</div>
                                        <div style={{ fontSize: 11, color: MUTED }}>{log.userEmail}</div>
                                    </td>
                                    <td style={{ padding: '10px 18px', fontWeight: 500, color: TEXT, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{log.event}</td>
                                    <td style={{ padding: '10px 18px' }}><SeverityBadge s={log.severity} /></td>
                                    <td style={{ padding: '10px 18px' }}>
                                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 600, background: log.success ? 'rgba(104,211,145,0.12)' : 'rgba(252,129,129,0.12)', color: log.success ? '#276749' : '#9B2335' }}>
                                            {log.success ? '✓ Success' : '✗ Failed'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 18px', color: MUTED, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details || '—'}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: MUTED }}>No security events found</td></tr>}
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
