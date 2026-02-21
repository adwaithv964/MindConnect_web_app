import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// ─── Helpers ────────────────────────────────────────────────────────
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const initials = (name) => (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const Avatar = ({ name, photo, size = 10, ring = false }) => {
    const cls = `w-${size} h-${size} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${ring ? 'ring-2 ring-primary ring-offset-1' : ''}`;
    if (photo) return <img src={photo} alt={name} className={`${cls} object-cover`} />;
    return <div className={cls} style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>{initials(name)}</div>;
};

export default function PatientConsultationRoom() {
    const [patientId, setPatientId] = useState(null);
    const [patientName, setPatientName] = useState('');

    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [joining, setJoining] = useState(false);

    const [videoOn, setVideoOn] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [timer, setTimer] = useState(0);

    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'history'
    const [toast, setToast] = useState(null);
    const [loadingAppts, setLoadingAppts] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const chatEndRef = useRef(null);
    const pollRef = useRef(null);
    const timerRef = useRef(null);
    const lastMsgCount = useRef(0);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Init ──────────────────────────────────────────────────────────
    useEffect(() => {
        document.title = 'Consultation - MindConnect';
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        const uid = stored?._id || stored?.id;
        const name = stored?.name || 'Patient';
        setPatientId(uid);
        setPatientName(name);
        if (uid) {
            fetchUpcomingAppointments(uid);
            fetchHistory(uid);
            checkActiveSession(uid);
        }
        return () => { stopPolling(); streamRef.current?.getTracks().forEach(t => t.stop()); };
    }, []);

    // Timer while session active
    useEffect(() => {
        if (session?.status === 'active') {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            clearInterval(timerRef.current);
            setTimer(0);
        }
        return () => clearInterval(timerRef.current);
    }, [session?._id, session?.status]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchUpcomingAppointments = async (uid) => {
        setLoadingAppts(true);
        try {
            const res = await axios.get(`${API}/api/appointments?userId=${uid}&status=confirmed`);
            const now = new Date();
            // Only future confirmed appointments
            const upcoming = (res.data || []).filter(a => new Date(a.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
            setUpcomingAppointments(upcoming);
        } catch (e) {
            console.error('Failed to fetch appointments:', e);
        } finally { setLoadingAppts(false); }
    };

    const fetchHistory = async (uid) => {
        setLoadingHistory(true);
        try {
            const res = await axios.get(`${API}/api/consultation/patient/${uid}/history`);
            setHistory(res.data || []);
        } catch { } finally { setLoadingHistory(false); }
    };

    const checkActiveSession = async (uid) => {
        try {
            const res = await axios.get(`${API}/api/consultation/patient/${uid}/active`);
            if (res.data) {
                setSession(res.data);
                setMessages(res.data.messages || []);
                lastMsgCount.current = (res.data.messages || []).length;
                startPolling(res.data._id);
            }
        } catch { }
    };

    // ── Polling ───────────────────────────────────────────────────────
    const pollMessages = useCallback(async (sessionId) => {
        try {
            const res = await axios.get(`${API}/api/consultation/${sessionId}`);
            const msgs = res.data?.messages || [];
            const sessionStatus = res.data?.status;
            if (msgs.length !== lastMsgCount.current) {
                lastMsgCount.current = msgs.length;
                setMessages(msgs);
            }
            if (sessionStatus === 'ended') {
                setSession(prev => prev ? { ...prev, status: 'ended', sessionSummary: res.data?.sessionSummary } : prev);
                stopPolling();
                fetchHistory(patientId);
            }
        } catch { }
    }, [patientId]);

    const startPolling = useCallback((sessionId) => {
        stopPolling();
        pollRef.current = setInterval(() => pollMessages(sessionId), 3000);
    }, [pollMessages]);

    const stopPolling = () => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };

    // ── Join Session ──────────────────────────────────────────────────
    const handleJoinSession = async (appointment) => {
        if (!patientId || joining) return;
        setSelectedAppointment(appointment);
        setJoining(true);
        try {
            const res = await axios.post(`${API}/api/consultation`, {
                counsellorId: appointment.counsellorId,
                patientId,
                appointmentId: appointment._id
            });
            const { session: s } = res.data;
            setSession(s);
            setMessages(s.messages || []);
            lastMsgCount.current = (s.messages || []).length;
            startPolling(s._id);
            showToast('Joined consultation session!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to join session', 'error');
        } finally { setJoining(false); }
    };

    // ── Send Message ──────────────────────────────────────────────────
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !session || sending || session.status === 'ended') return;
        setSending(true);
        const text = input.trim();
        setInput('');
        try {
            const res = await axios.post(`${API}/api/consultation/${session._id}/messages`, {
                sender: 'patient',
                senderId: patientId,
                senderName: patientName,
                text
            });
            setMessages(prev => [...prev, res.data]);
            lastMsgCount.current += 1;
        } catch { showToast('Failed to send message', 'error'); }
        finally { setSending(false); }
    };

    // ── Camera ────────────────────────────────────────────────────────
    const toggleVideo = async () => {
        if (!videoOn) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micOn });
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
                setVideoOn(true);
            } catch { showToast('Camera access denied or unavailable', 'error'); }
        } else {
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
            if (videoRef.current) videoRef.current.srcObject = null;
            setVideoOn(false);
        }
    };

    const toggleMic = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(t => { t.enabled = micOn; });
        }
        setMicOn(v => !v);
    };

    // ─────────────────────────────────────────────────────────────────
    const sessionActive = session?.status === 'active';
    const timerStr = `${String(Math.floor(timer / 3600)).padStart(2, '0')}:${String(Math.floor((timer % 3600) / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

    const counsellorName = session?.counsellorName || selectedAppointment?.counsellor?.name || 'Your Counsellor';
    const counsellorAvatar = session?.counsellorAvatar || selectedAppointment?.counsellor?.profilePhoto || null;

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium
                    ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {toast.msg}
                </div>
            )}

            <BreadcrumbTrail />
            <h1 className="font-heading font-bold text-3xl text-foreground mb-6">Consultation Room</h1>

            {/* Upcoming Sessions — shown when no active session */}
            {!session && (
                <div className="space-y-4 mb-6">
                    <div className="glass-card p-6">
                        <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </span>
                            Confirmed Appointments
                        </h2>

                        {loadingAppts ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
                            </div>
                        ) : upcomingAppointments.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-base text-gray-700 mb-1">No Upcoming Sessions</h3>
                                <p className="text-sm text-gray-400">You don't have any confirmed appointments yet. Book one from the Appointments page.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingAppointments.map(apt => (
                                    <div key={apt._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all">
                                        <div className="flex items-center gap-4">
                                            <Avatar name={apt.counsellor?.name || apt.doctor || 'Counsellor'} photo={apt.counsellor?.profilePhoto} size={12} />
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">
                                                    {apt.counsellor?.name || apt.doctor || 'Your Counsellor'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {apt.counsellor?.qualifications || 'Licensed Counsellor'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        {fmtDate(apt.date)}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        {apt.timeSlot || fmtTime(apt.date)}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize`}>
                                                        {apt.sessionType || 'video'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleJoinSession(apt)}
                                            disabled={joining}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-md disabled:opacity-60 flex-shrink-0"
                                        >
                                            {joining ? (
                                                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Joining…</>
                                            ) : (
                                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Join Session</>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Active / Ended Session */}
            {session && (
                <>
                    {/* Session Header */}
                    <div className="glass-card p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar name={counsellorName} photo={counsellorAvatar} size={12} ring />
                            <div>
                                <p className="font-semibold text-gray-900">{counsellorName}</p>
                                <p className="text-xs text-gray-400">Your Counsellor</p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sessionActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${sessionActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                {sessionActive ? `Live · ${timerStr}` : 'Session Ended'}
                            </div>
                        </div>
                        {!sessionActive && (
                            <button onClick={() => { setSession(null); setSelectedAppointment(null); fetchHistory(patientId); }}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                                Back to Appointments
                            </button>
                        )}
                    </div>

                    {/* Main grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {/* Video */}
                        <div className="xl:col-span-2">
                            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center shadow-lg">
                                <video ref={videoRef} autoPlay muted className={`absolute inset-0 w-full h-full object-cover ${videoOn ? 'block' : 'hidden'}`} />
                                {!videoOn && (
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-400 text-sm font-medium">Camera Off</p>
                                        <p className="text-gray-600 text-xs mt-1">Click the camera button to show your feed</p>
                                    </div>
                                )}
                                {/* Controls */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                                    <button onClick={toggleMic}
                                        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${micOn ? 'bg-white text-gray-800 hover:bg-gray-100' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                        {micOn
                                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" /></svg>
                                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                        }
                                    </button>
                                    <button onClick={toggleVideo}
                                        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${videoOn ? 'bg-white text-gray-800 hover:bg-gray-100' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                        {videoOn
                                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zM3 3l18 18" /></svg>
                                        }
                                    </button>
                                </div>
                                {/* Counsellor mini-feed */}
                                <div className="absolute top-3 right-3 w-28 h-20 rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center">
                                    <Avatar name={counsellorName} photo={counsellorAvatar} size={9} />
                                </div>
                            </div>

                            {/* Session ended summary */}
                            {!sessionActive && session.sessionSummary && (
                                <div className="mt-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                    <p className="text-xs font-semibold text-primary mb-1">SESSION SUMMARY FROM YOUR COUNSELLOR</p>
                                    <p className="text-sm text-gray-700">{session.sessionSummary}</p>
                                </div>
                            )}
                        </div>

                        {/* Chat + History */}
                        <div className="glass-card flex flex-col overflow-hidden" style={{ minHeight: '520px' }}>
                            {/* Tab headers */}
                            <div className="flex border-b border-gray-100">
                                {['chat', 'history'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                                        {tab === 'chat' ? '💬 Chat' : '📋 History'}
                                    </button>
                                ))}
                            </div>

                            {/* Chat Tab */}
                            {activeTab === 'chat' && (
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                                        {messages.map((msg, i) => {
                                            if (msg.sender === 'system') {
                                                return (
                                                    <div key={i} className="text-center">
                                                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{msg.text}</span>
                                                    </div>
                                                );
                                            }
                                            const isMe = msg.sender === 'patient';
                                            return (
                                                <div key={i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <Avatar name={msg.senderName} size={8} />
                                                    <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-xs text-gray-400">{msg.senderName} · {fmtTime(msg.timestamp)}</span>
                                                        <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex gap-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            disabled={!sessionActive || sending}
                                            placeholder={sessionActive ? 'Type a message…' : 'Session has ended'}
                                            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
                                        />
                                        <button type="submit" disabled={!sessionActive || sending || !input.trim()}
                                            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 flex-shrink-0">
                                            <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* History Tab */}
                            {activeTab === 'history' && (
                                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                                    {loadingHistory ? (
                                        <div className="h-24 rounded-xl bg-muted animate-pulse mt-2" />
                                    ) : history.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center mt-8">No past sessions yet.</p>
                                    ) : history.map((h, i) => (
                                        <div key={i} className="p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Avatar name={h.counsellorName} photo={h.counsellorAvatar} size={8} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{h.counsellorName}</p>
                                                    <p className="text-xs text-gray-400">{fmtDate(h.endedAt)} · {h.durationMinutes}m · {h.messageCount} messages</p>
                                                </div>
                                            </div>
                                            {h.sessionSummary && (
                                                <p className="text-xs text-gray-500 line-clamp-2 ml-10 border-t border-gray-100 pt-1 mt-1">{h.sessionSummary}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* History section — shown when no active session */}
            {!session && (
                <div className="glass-card p-6">
                    <h2 className="font-semibold text-lg text-foreground mb-4">Past Sessions</h2>
                    {loadingHistory ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-sm text-gray-400">No past sessions. Your consultation history will appear here after your first session.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {history.map((h, i) => (
                                <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Avatar name={h.counsellorName} photo={h.counsellorAvatar} size={10} />
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{h.counsellorName}</p>
                                            <p className="text-xs text-gray-400">{fmtDate(h.endedAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 text-xs text-gray-500">
                                        <span>🕐 {h.durationMinutes}min</span>
                                        <span>💬 {h.messageCount} msgs</span>
                                    </div>
                                    {h.sessionSummary && (
                                        <p className="mt-2 text-xs text-gray-600 line-clamp-2 border-t border-gray-100 pt-2">{h.sessionSummary}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
