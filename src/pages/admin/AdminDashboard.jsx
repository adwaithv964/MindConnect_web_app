import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const PRIMARY = '#4A9B8E';
const SECONDARY = '#7FB069';
const ACCENT = '#F4A261';
const TEXT = '#2D3748';
const MUTED = '#718096';
const BORDER = 'rgba(160,174,192,0.25)';
const CARD_BG = '#fff';

const PIE_COLORS = ['#4A9B8E', '#7FB069', '#F4A261', '#FC8181', '#9F7AEA', '#63B3ED', '#68D391'];

function StatCard({ label, value, sub, subColor, icon, iconBg }) {
    return (
        <div style={{
            background: CARD_BG, borderRadius: 14, padding: '20px 22px',
            border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'flex-start', gap: 14, flex: '1 1 160px', minWidth: 140
        }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg || `rgba(74,155,142,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, lineHeight: 1.2, marginTop: 2 }}>{value ?? '—'}</div>
                {sub && <div style={{ fontSize: 12, color: subColor || PRIMARY, fontWeight: 500, marginTop: 4 }}>{sub}</div>}
            </div>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div style={{ background: CARD_BG, borderRadius: 14, padding: '20px 22px', border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: TEXT, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIMARY, display: 'inline-block' }} />
                {title}
            </h3>
            {children}
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API}/api/admin/stats`, { headers: { 'x-admin-token': token } });
            if (!res.ok) return;
            const data = await res.json();
            setStats(data);
            setLastUpdated(new Date());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStats(); const id = setInterval(fetchStats, 30000); return () => clearInterval(id); }, [fetchStats]);

    const o = stats?.overview || {};
    const charts = stats?.charts || {};

    const regData = (charts.registrationTrend || []).map(d => ({ date: d._id?.slice(5), count: d.count }));
    const moodData = (charts.moodDistribution || []).map(d => ({ name: d._id || 'Unknown', value: d.count }));
    const aptData = (charts.appointmentsByStatus || []).map(d => ({ name: (d._id || 'unknown').charAt(0).toUpperCase() + (d._id || 'unknown').slice(1), count: d.count }));
    const dailyData = (charts.dailyMoodLogs || []).map(d => ({ date: d._id?.slice(5), count: d.count, avg: parseFloat((d.avgMood || 0).toFixed(1)) }));

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: MUTED, gap: 10 }}>
                <div style={{ width: 20, height: 20, border: `2px solid ${PRIMARY}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Loading dashboard…
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0 }}>Dashboard Overview</h1>
                    <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Real-time platform metrics — auto-refreshes every 30s</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {lastUpdated && <span style={{ fontSize: 12, color: MUTED }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
                    <button onClick={fetchStats} style={{
                        padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${BORDER}`,
                        background: CARD_BG, color: TEXT, fontWeight: 500, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stat cards grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
                <StatCard label="Total Users" value={o.totalUsers} sub={`+${o.newUsersToday ?? 0} today`} icon="👥" iconBg="rgba(74,155,142,0.1)" />
                <StatCard label="Patients" value={o.totalPatients} sub={`+${o.newUsersThisWeek ?? 0} this week`} icon="👤" iconBg="rgba(127,176,105,0.1)" subColor={SECONDARY} />
                <StatCard label="Counsellors" value={o.totalCounsellors} icon="🩺" iconBg="rgba(99,179,237,0.1)" subColor="#3182CE" />
                <StatCard label="Appointments" value={o.totalAppointments} sub={`${o.pendingAppointments ?? 0} pending`} subColor={o.pendingAppointments > 0 ? ACCENT : MUTED} icon="📅" iconBg="rgba(244,162,97,0.1)" />
                <StatCard label="Mood Logs" value={o.totalMoodLogs} sub={`${o.moodLogsToday ?? 0} today`} icon="😊" iconBg="rgba(104,211,145,0.1)" subColor="#38A169" />
                <StatCard label="Journal Entries" value={o.totalJournalEntries} icon="📝" iconBg="rgba(159,122,234,0.1)" subColor="#6B46C1" />
                <StatCard label="Breathing Sessions" value={o.totalBreathingSessions} icon="🌬️" iconBg="rgba(74,155,142,0.08)" />
                <StatCard label="Security Alerts" value={o.securityAlertsCount} sub="last 7 days" subColor={o.securityAlertsCount > 5 ? '#E53E3E' : MUTED} icon="🛡️" iconBg="rgba(252,129,129,0.1)" />
            </div>

            {/* Charts — row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <ChartCard title="New Registrations (Last 30 Days)">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={regData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: MUTED }} />
                            <YAxis tick={{ fontSize: 11, fill: MUTED }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 12 }} />
                            <Line type="monotone" dataKey="count" stroke={PRIMARY} strokeWidth={2.5} dot={{ r: 3 }} name="Registrations" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Appointments by Status">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={aptData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} />
                            <YAxis tick={{ fontSize: 11, fill: MUTED }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 12 }} />
                            <Bar dataKey="count" fill={SECONDARY} radius={[6, 6, 0, 0]} name="Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Charts — row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <ChartCard title="Daily Mood Logs (Last 14 Days)">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: MUTED }} />
                            <YAxis tick={{ fontSize: 11, fill: MUTED }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 12 }} />
                            <Bar dataKey="count" fill={PRIMARY} radius={[6, 6, 0, 0]} name="Entries" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Mood Distribution">
                    {moodData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={moodData} cx="50%" cy="50%" outerRadius={72} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                                    {moodData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 13 }}>No mood data yet</div>
                    )}
                </ChartCard>
            </div>
        </div>
    );
}
