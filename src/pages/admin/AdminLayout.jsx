import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// MindConnect design tokens
const PRIMARY = '#4A9B8E';
const SECONDARY = '#7FB069';
const BG = '#FEFEFE';
const CARD = '#F8FAFA';
const BORDER = 'rgba(160,174,192,0.25)';
const TEXT = '#2D3748';
const MUTED = '#718096';

const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: GridIcon },
    { path: '/admin/users', label: 'Users', icon: UsersIcon },
    { path: '/admin/appointments', label: 'Appointments', icon: CalendarIcon },
    { path: '/admin/activity-logs', label: 'Activity Logs', icon: ListIcon },
    { path: '/admin/security-logs', label: 'Security Logs', icon: ShieldIcon },
];

function GridIcon({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
}
function UsersIcon({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function CalendarIcon({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
function ListIcon({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
}
function ShieldIcon({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function BrainIcon() {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>;
}

export default function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState(null);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) { navigate('/admin'); return; }
        const u = localStorage.getItem('adminUser');
        if (u) setAdminUser(JSON.parse(u));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin');
    };

    const sidebarW = collapsed ? 64 : 240;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: "'Inter', 'Source Sans 3', system-ui, sans-serif", color: TEXT }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #F8FAFA; }
        ::-webkit-scrollbar-thumb { background: rgba(74,155,142,0.25); border-radius: 3px; }
        .admin-nav-item { transition: all 0.15s ease; }
        .admin-nav-item:hover { background: rgba(74,155,142,0.08) !important; color: ${PRIMARY} !important; transform: scale(1.01); }
        .admin-logout:hover { background: rgba(252,129,129,0.1) !important; color: #E53E3E !important; }
        .admin-collapse:hover { background: rgba(74,155,142,0.08) !important; }
      `}</style>

            {/* Sidebar */}
            <aside style={{
                width: sidebarW, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100,
                background: CARD, borderRight: `1px solid ${BORDER}`,
                display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden',
                boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
            }}>
                {/* Logo header */}
                <div style={{
                    margin: '8px 8px 16px 8px', borderRadius: 10, overflow: 'hidden',
                    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
                    padding: collapsed ? '12px 8px' : '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0
                }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BrainIcon />
                    </div>
                    {!collapsed && (
                        <div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, color: '#fff', whiteSpace: 'nowrap' }}>Mind Connect</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Admin Panel</div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
                    {navItems.map(({ path, label, icon: Icon }) => {
                        const active = location.pathname === path;
                        return (
                            <Link key={path} to={path} className="admin-nav-item" style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: collapsed ? '12px 8px' : '12px 14px',
                                borderRadius: 10, textDecoration: 'none',
                                background: active ? PRIMARY : 'transparent',
                                color: active ? '#fff' : MUTED,
                                fontWeight: active ? 600 : 400, fontSize: 14,
                                whiteSpace: 'nowrap', justifyContent: collapsed ? 'center' : 'flex-start',
                                minHeight: 48
                            }}>
                                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }}><Icon size={20} /></span>
                                {!collapsed && label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{ padding: '12px', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
                    {!collapsed && adminUser && (
                        <div style={{ padding: '8px 10px', marginBottom: 8, borderRadius: 8, background: `rgba(74,155,142,0.06)` }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminUser.name}</div>
                            <div style={{ fontSize: 11, color: MUTED, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminUser.email}</div>
                        </div>
                    )}
                    <button className="admin-logout" onClick={handleLogout} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: collapsed ? '10px 8px' : '10px 14px', borderRadius: 10, border: 'none',
                        background: 'rgba(252,129,129,0.08)', color: '#E53E3E',
                        fontWeight: 500, fontSize: 13, cursor: 'pointer',
                        justifyContent: collapsed ? 'center' : 'flex-start', transition: 'all 0.15s'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        {!collapsed && 'Sign Out'}
                    </button>
                    <button className="admin-collapse" onClick={() => setCollapsed(c => !c)} style={{
                        width: '100%', marginTop: 6, padding: '8px', borderRadius: 10, border: 'none',
                        background: 'transparent', color: MUTED, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                    }}>
                        {collapsed
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                        }
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div style={{ marginLeft: sidebarW, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease', minWidth: 0 }}>
                {/* Top bar */}
                <div style={{
                    height: 56, padding: '0 24px', background: CARD, borderBottom: `1px solid ${BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: MUTED }}>
                        <span>Admin</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        <span style={{ color: TEXT, fontWeight: 500 }}>
                            {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
                        </span>
                    </div>
                    {/* Live badge + date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(74,155,142,0.1)', border: `1px solid rgba(74,155,142,0.25)` }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY, display: 'inline-block', animation: 'livePulse 2s ease infinite' }} />
                            <span style={{ fontSize: 12, color: PRIMARY, fontWeight: 600 }}>Live</span>
                        </div>
                        <span style={{ fontSize: 12, color: MUTED }}>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Page */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: BG }}>
                    {children}
                </div>
            </div>
            <style>{`@keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
}
