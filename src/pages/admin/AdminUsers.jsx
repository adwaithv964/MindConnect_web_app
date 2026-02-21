import React, { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const PRIMARY = '#4A9B8E';
const SECONDARY = '#7FB069';
const TEXT = '#2D3748';
const MUTED = '#718096';
const BORDER = 'rgba(160,174,192,0.25)';
const CARD_BG = '#fff';
const DANGER = '#E53E3E';

const ROLES = ['all', 'patient', 'counsellor', 'admin'];
const ROLE_COLORS = { patient: { bg: 'rgba(127,176,105,0.12)', color: '#276749' }, counsellor: { bg: 'rgba(74,155,142,0.12)', color: '#2C7A7B' }, admin: { bg: 'rgba(159,122,234,0.12)', color: '#553C9A' } };

function RoleBadge({ role }) {
    const c = ROLE_COLORS[role] || { bg: 'rgba(113,128,150,0.12)', color: '#4A5568' };
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, textTransform: 'capitalize' }}>{role}</span>;
}

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const [page, setPage] = useState(1);
    const [editUser, setEditUser] = useState(null);
    const [editRole, setEditRole] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('adminToken');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 15, ...(role !== 'all' && { role }), ...(search && { search }) });
            const res = await fetch(`${API}/api/admin/users?${params}`, { headers: { 'x-admin-token': token } });
            const data = await res.json();
            setUsers(data.users || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } finally { setLoading(false); }
    }, [page, role, search, token]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSaveRole = async () => {
        setSaving(true); setError('');
        try {
            const res = await fetch(`${API}/api/admin/users/${editUser._id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                body: JSON.stringify({ role: editRole })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            setEditUser(null); fetchUsers();
        } catch (e) { setError(e.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await fetch(`${API}/api/admin/users/${deleteTarget._id}`, { method: 'DELETE', headers: { 'x-admin-token': token } });
            setDeleteTarget(null); fetchUsers();
        } finally { setSaving(false); }
    };

    const inputStyle = { padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#FEFEFE', fontSize: 13, color: TEXT, outline: 'none', fontFamily: 'inherit' };

    return (
        <div>
            <style>{`.admin-row:hover{background:rgba(74,155,142,0.035)!important} .admin-btn-sm:hover{opacity:0.8}`}</style>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0 }}>User Management</h1>
                    <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{total} total users</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ background: CARD_BG, borderRadius: 14, padding: '16px 20px', border: `1px solid ${BORDER}`, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <input style={{ ...inputStyle, minWidth: 240, flex: 1 }} placeholder="Search by name or email…" value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }} />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ROLES.map(r => (
                        <button key={r} onClick={() => { setRole(r); setPage(1); }} style={{
                            padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${role === r ? PRIMARY : BORDER}`,
                            background: role === r ? PRIMARY : '#fff', color: role === r ? '#fff' : MUTED,
                            fontWeight: 500, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s'
                        }}>{r === 'all' ? 'All Roles' : r}</button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ background: CARD_BG, borderRadius: 14, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: MUTED, gap: 10 }}>
                        <div style={{ width: 18, height: 18, border: `2px solid ${PRIMARY}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Loading users…
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#F8FAFA', borderBottom: `1px solid ${BORDER}` }}>
                                {['User', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={u._id} className="admin-row" style={{ borderBottom: i < users.length - 1 ? `1px solid ${BORDER}` : 'none', background: i % 2 === 0 ? '#fff' : '#FEFEFE' }}>
                                    <td style={{ padding: '13px 18px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: `2px solid rgba(74,155,142,0.2)`, position: 'relative' }}>
                                                {u.profilePhoto ? (
                                                    <img
                                                        src={u.profilePhoto}
                                                        alt={u.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`, display: u.profilePhoto ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                                                    {(u.name || u.email || '?')[0].toUpperCase()}
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: 500, color: TEXT }}>{u.name || '—'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 18px', color: MUTED }}>{u.email}</td>
                                    <td style={{ padding: '13px 18px' }}><RoleBadge role={u.role} /></td>
                                    <td style={{ padding: '13px 18px' }}>
                                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: u.isVerified ? 'rgba(104,211,145,0.15)' : 'rgba(252,129,129,0.15)', color: u.isVerified ? '#276749' : '#9B2335', fontWeight: 600 }}>
                                            {u.isVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 18px', color: MUTED, fontSize: 12 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                                    <td style={{ padding: '13px 18px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="admin-btn-sm" onClick={() => { setEditUser(u); setEditRole(u.role); }} style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${BORDER}`, background: '#fff', color: TEXT, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                                            <button className="admin-btn-sm" onClick={() => setDeleteTarget(u)} style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid rgba(229,62,62,0.25)', background: 'rgba(252,129,129,0.06)', color: DANGER, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: MUTED }}>No users found</td></tr>}
                        </tbody>
                    </table>
                )}
                {/* Pagination */}
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

            {/* Edit Modal */}
            {editUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(3px)' }}>
                    <div style={{ background: CARD_BG, borderRadius: 18, padding: 32, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: `1px solid ${BORDER}` }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: TEXT }}>Edit User</h3>
                        <p style={{ margin: '0 0 20px', fontSize: 13, color: MUTED }}>{editUser.email}</p>
                        {error && <div style={{ padding: '8px 12px', background: 'rgba(252,129,129,0.1)', borderRadius: 8, color: DANGER, fontSize: 13, marginBottom: 16 }}>{error}</div>}
                        <label style={{ fontSize: 13, fontWeight: 500, color: TEXT, display: 'block', marginBottom: 6 }}>Role</label>
                        <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 20, cursor: 'pointer' }}>
                            {['patient', 'counsellor', 'admin'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditUser(null)} style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#fff', color: MUTED, cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>Cancel</button>
                            <button onClick={handleSaveRole} disabled={saving} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>{saving ? 'Saving…' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(3px)' }}>
                    <div style={{ background: CARD_BG, borderRadius: 18, padding: 32, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: `1px solid ${BORDER}` }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: TEXT }}>Delete User?</h3>
                        <p style={{ margin: '0 0 20px', fontSize: 13, color: MUTED }}>This will permanently delete <strong>{deleteTarget.name || deleteTarget.email}</strong> and all their data (appointments, logs, entries).</p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setDeleteTarget(null)} style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#fff', color: MUTED, cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>Cancel</button>
                            <button onClick={handleDelete} disabled={saving} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: DANGER, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>{saving ? 'Deleting…' : 'Delete User'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
