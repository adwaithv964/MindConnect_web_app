import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const PRIMARY = '#4A9B8E';
const SECONDARY = '#7FB069';
const TEXT = '#2D3748';
const MUTED = '#718096';
const BORDER = 'rgba(160,174,192,0.25)';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Invalid credentials'); return; }
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            navigate('/admin/dashboard');
        } catch {
            setError('Cannot connect to server. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '11px 14px', borderRadius: 10,
        border: `1.5px solid ${BORDER}`, background: '#FEFEFE',
        fontSize: 14, color: TEXT, outline: 'none', transition: 'border 0.15s',
        fontFamily: "'Inter', sans-serif", boxSizing: 'border-box'
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf9 0%, #f8fffe 50%, #f0f7ff 100%)', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .admin-input:focus { border-color: ${PRIMARY} !important; box-shadow: 0 0 0 3px rgba(74,155,142,0.12) !important; }
        .admin-btn:hover:not(:disabled) { background: #3d8a7e !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,155,142,0.35) !important; }
        .admin-btn:active { transform: translateY(0); }
      `}</style>

            {/* Decorative circles */}
            <div style={{ position: 'fixed', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(${PRIMARY}22, transparent)`, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(${SECONDARY}18, transparent)`, pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
                <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '40px 36px', border: `1px solid ${BORDER}` }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{
                            width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
                            background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 6px 20px rgba(74,155,142,0.3)`
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>Admin Portal</h1>
                        <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>MindConnect Developer Access</p>
                    </div>

                    {error && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.3)', color: '#C53030', fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: TEXT, display: 'block', marginBottom: 6 }}>Email Address</label>
                            <input
                                className="admin-input"
                                type="email" required placeholder="admin@mindconnect.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: TEXT, display: 'block', marginBottom: 6 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="admin-input"
                                    type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    style={{ ...inputStyle, paddingRight: 42 }}
                                />
                                <button type="button" onClick={() => setShowPass(s => !s)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: 4, display: 'flex' }}>
                                    {showPass
                                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                        </div>
                        <button className="admin-btn" type="submit" disabled={loading} style={{
                            width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                            background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                            color: '#fff', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s', boxShadow: `0 4px 14px rgba(74,155,142,0.25)`,
                            opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Signing in…' : 'Sign In to Admin Panel'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <Link to="/login" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>
                            ← Back to regular login
                        </Link>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 14, padding: '8px 12px', borderRadius: 8, background: '#F8FAFA', fontSize: 11, color: MUTED }}>
                        🔒 Restricted access — Admin credentials only
                    </div>
                </div>
            </div>
        </div>
    );
}
