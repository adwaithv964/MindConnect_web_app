import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// ─── Small helpers ──────────────────────────────────────────────────
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtDuration = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${s}s`;
};
const initials = (name) => (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const Avatar = ({ name, photo, size = 10, ring = false }) => {
    const cls = `w-${size} h-${size} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${ring ? 'ring-2 ring-primary ring-offset-1' : ''}`;
    if (photo) return <img src={photo} alt={name} className={`${cls} object-cover`} />;
    return <div className={cls} style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>{initials(name)}</div>;
};

// ─── Main component ─────────────────────────────────────────────────
export default function CounsellorConsultationRoom() {
    const location = useLocation();
    const incomingPatientId = location.state?.patientId;

    const [counsellorId, setCounsellorId] = useState(null);
    const [counsellorName, setCounsellorName] = useState('');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionNotes, setSessionNotes] = useState('');
    const [notesSaved, setNotesSaved] = useState(false);
    const [sending, setSending] = useState(false);
    const [starting, setStarting] = useState(false);

    const [showEndModal, setShowEndModal] = useState(false);
    const [summary, setSummary] = useState('');
    const [ending, setEnding] = useState(false);

    const [videoOn, setVideoOn] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [timer, setTimer] = useState(0);

    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'notes' | 'history'
    const [toast, setToast] = useState(null);
    const [loadingPatients, setLoadingPatients] = useState(true);

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
        document.title = 'Consultation Room - MindConnect';
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        const uid = stored?._id || stored?.id;
        const name = stored?.name || 'Counsellor';
        setCounsellorId(uid);
        setCounsellorName(name);
        if (uid) {
            fetchPatients(uid);
            fetchHistory(uid);
        }
        return () => stopPolling();
    }, []);

    // Auto-select incoming patient from route state
    useEffect(() => {
        if (incomingPatientId && patients.length > 0) {
            const p = patients.find(pt => pt.patientId === incomingPatientId || pt._id === incomingPatientId);
            if (p) setSelectedPatient(p);
        }
    }, [incomingPatientId, patients]);

    // Timer tick while session is active
    useEffect(() => {
        if (session && session.status === 'active') {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            clearInterval(timerRef.current);
            setTimer(0);
        }
        return () => clearInterval(timerRef.current);
    }, [session?._id, session?.status]);

    // Scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchPatients = async (uid) => {
        setLoadingPatients(true);
        try {
            const res = await axios.get(`${API}/api/counsellor/${uid}/patients`);
            setPatients(res.data || []);
        } catch { }
        finally { setLoadingPatients(false); }
    };

    const fetchHistory = async (uid) => {
        try {
            const res = await axios.get(`${API}/api/consultation/counsellor/${uid}/history`);
            setHistory(res.data || []);
        } catch { }
    };

    // ── Polling ───────────────────────────────────────────────────────
    const pollMessages = useCallback(async (sessionId) => {
        try {
            const res = await axios.get(`${API}/api/consultation/${sessionId}`);
            const msgs = res.data?.messages || [];
            if (msgs.length !== lastMsgCount.current) {
                lastMsgCount.current = msgs.length;
                setMessages(msgs);
            }
        } catch { }
    }, []);

    const startPolling = useCallback((sessionId) => {
        stopPolling();
        pollRef.current = setInterval(() => pollMessages(sessionId), 3000);
    }, [pollMessages]);

    const stopPolling = () => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };

    // ── Session management ────────────────────────────────────────────
    const handleStartSession = async () => {
        if (!selectedPatient || !counsellorId) return;
        setStarting(true);
        try {
            const res = await axios.post(`${API}/api/consultation`, {
                counsellorId,
                patientId: selectedPatient.patientId
            });
            const { session: s, counsellorName: cn } = res.data;
            setSession(s);
            setMessages(s.messages || []);
            setSessionNotes(s.sessionNotes || '');
            lastMsgCount.current = (s.messages || []).length;
            startPolling(s._id);
            showToast(`Session started with ${selectedPatient.name}`);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to start session', 'error');
        } finally { setStarting(false); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !session || sending) return;
        setSending(true);
        const text = input.trim();
        setInput('');
        try {
            const res = await axios.post(`${API}/api/consultation/${session._id}/messages`, {
                sender: 'counsellor',
                senderId: counsellorId,
                senderName: counsellorName,
                text
            });
            setMessages(prev => [...prev, res.data]);
            lastMsgCount.current += 1;
        } catch { showToast('Failed to send message', 'error'); }
        finally { setSending(false); }
    };

    const handleSaveNotes = async () => {
        if (!session) return;
        try {
            await axios.put(`${API}/api/consultation/${session._id}/notes`, { sessionNotes });
            setNotesSaved(true);
            setTimeout(() => setNotesSaved(false), 2000);
            showToast('Notes saved!');
        } catch { showToast('Failed to save notes', 'error'); }
    };

    const handleEndSession = async () => {
        if (!session || ending) return;
        setEnding(true);
        try {
            await axios.put(`${API}/api/consultation/${session._id}/end`, { sessionSummary: summary, sessionNotes });
            stopPolling();
            setSession(prev => ({ ...prev, status: 'ended' }));
            setShowEndModal(false);
            showToast('Session ended and saved.');
            fetchHistory(counsellorId);
        } catch { showToast('Failed to end session', 'error'); }
        finally { setEnding(false); }
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

    useEffect(() => {
        return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
    }, []);

    // ─────────────────────────────────────────────────────────────────
    const sessionActive = session?.status === 'active';
    const timerStr = `${String(Math.floor(timer / 3600)).padStart(2, '0')}:${String(Math.floor((timer % 3600) / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in
                    ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {toast.msg}
                </div>
            )}

            {/* End Session Modal */}
            {showEndModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">End Session</h2>
                        <p className="text-sm text-gray-500 mb-4">Add an optional session summary before closing.</p>
                        <textarea
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={4}
                            placeholder="Session summary (outcomes, next steps, observations)…"
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setShowEndModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleEndSession} disabled={ending} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60">
                                {ending ? 'Ending…' : 'End Session'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BreadcrumbTrail />
            <h1 className="font-heading font-bold text-3xl text-foreground mb-6">Consultation Room</h1>

            {/* Patient Selector (shown when no active session) */}
            {!session && (
                <div className="glass-card p-6 mb-6">
                    <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </span>
                        Select Patient
                    </h2>
                    {loadingPatients ? (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {[1, 2, 3].map(i => <div key={i} className="flex-shrink-0 w-48 h-20 rounded-xl bg-muted animate-pulse" />)}
                        </div>
                    ) : patients.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No patients yet. Confirm an appointment request first.</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {patients.map(p => (
                                <button
                                    key={p.patientId || p._id}
                                    onClick={() => setSelectedPatient(p)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${selectedPatient?.patientId === p.patientId
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                        }`}
                                >
                                    <Avatar name={p.name} photo={p.avatar} size={10} ring={selectedPatient?.patientId === p.patientId} />
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{p.name}</p>
                                        <p className="text-xs text-gray-400">{p.id}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedPatient && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar name={selectedPatient.name} photo={selectedPatient.avatar} size={12} />
                                <div>
                                    <p className="font-semibold text-gray-900">{selectedPatient.name}</p>
                                    <p className="text-xs text-gray-400">{selectedPatient.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleStartSession}
                                disabled={starting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-md disabled:opacity-60"
                            >
                                {starting ? (
                                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Starting…</>
                                ) : (
                                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Start Session</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Active / Ended Session View */}
            {session && (
                <>
                    {/* Session Header */}
                    <div className="glass-card p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar name={selectedPatient?.name || 'Patient'} photo={selectedPatient?.avatar} size={12} ring />
                            <div>
                                <p className="font-semibold text-gray-900">{selectedPatient?.name}</p>
                                <p className="text-xs text-gray-400">{selectedPatient?.email}</p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sessionActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${sessionActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                {sessionActive ? `Live • ${timerStr}` : 'Ended'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {sessionActive && (
                                <button onClick={() => setShowEndModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    End Session
                                </button>
                            )}
                            {!sessionActive && (
                                <button onClick={() => { setSession(null); setSelectedPatient(null); setSummary(''); }}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                                    Start New Session
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {/* Left: Video */}
                        <div className="xl:col-span-2 space-y-4">
                            {/* Video feed */}
                            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center shadow-lg">
                                <video ref={videoRef} autoPlay muted className={`absolute inset-0 w-full h-full object-cover ${videoOn ? 'block' : 'hidden'}`} />
                                {!videoOn && (
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        </div>
                                        <p className="text-gray-400 text-sm font-medium">{videoOn ? 'Camera Active' : 'Camera Off'}</p>
                                        <p className="text-gray-600 text-xs mt-1">Click the camera button to start your feed</p>
                                    </div>
                                )}
                                {/* Video controls */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                                    <button onClick={toggleMic}
                                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${micOn ? 'bg-white text-gray-800 hover:bg-gray-100' : 'bg-red-500 text-white hover:bg-red-600'}`}
                                        title={micOn ? 'Mute mic' : 'Unmute mic'}>
                                        {micOn
                                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" /></svg>
                                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                        }
                                    </button>
                                    <button onClick={toggleVideo}
                                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${videoOn ? 'bg-white text-gray-800 hover:bg-gray-100' : 'bg-red-500 text-white hover:bg-red-600'}`}
                                        title={videoOn ? 'Turn off camera' : 'Turn on camera'}>
                                        {videoOn
                                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zM3 3l18 18" /></svg>
                                        }
                                    </button>
                                </div>
                                {/* Patient mini-feed placeholder */}
                                <div className="absolute top-3 right-3 w-28 h-20 rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center">
                                    <Avatar name={selectedPatient?.name || 'Patient'} photo={selectedPatient?.avatar} size={9} />
                                </div>
                            </div>
                        </div>

                        {/* Right: Tabs → Chat / Notes / History */}
                        <div className="glass-card flex flex-col overflow-hidden" style={{ minHeight: '520px' }}>
                            {/* Tabs */}
                            <div className="flex border-b border-gray-100">
                                {['chat', 'notes', 'history'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                                        {tab === 'chat' ? '💬 Chat' : tab === 'notes' ? '📝 Notes' : '📋 History'}
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
                                            const isMe = msg.sender === 'counsellor';
                                            return (
                                                <div key={i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <Avatar name={msg.senderName} size={8} />
                                                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
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

                            {/* Notes Tab */}
                            {activeTab === 'notes' && (
                                <div className="flex-1 flex flex-col p-4 gap-3">
                                    <p className="text-xs text-gray-400">Private session notes (only visible to you). Auto-saved on End Session.</p>
                                    <textarea
                                        className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        placeholder="Clinical observations, treatment notes, action items…"
                                        value={sessionNotes}
                                        onChange={e => setSessionNotes(e.target.value)}
                                        disabled={!sessionActive}
                                    />
                                    {sessionActive && (
                                        <button onClick={handleSaveNotes}
                                            className={`py-2 rounded-xl text-sm font-medium transition-colors ${notesSaved ? 'bg-emerald-100 text-emerald-700' : 'bg-primary text-white hover:bg-primary/90'}`}>
                                            {notesSaved ? '✓ Saved!' : 'Save Notes'}
                                        </button>
                                    )}
                                    {session?.sessionSummary && (
                                        <div className="p-3 bg-gray-50 rounded-xl mt-2">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">SESSION SUMMARY</p>
                                            <p className="text-sm text-gray-700">{session.sessionSummary}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* History Tab */}
                            {activeTab === 'history' && (
                                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                                    {history.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center mt-8">No past sessions yet.</p>
                                    ) : history.map((h, i) => (
                                        <div key={i} className="p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Avatar name={h.patientName} photo={h.patientAvatar} size={8} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{h.patientName}</p>
                                                    <p className="text-xs text-gray-400">{fmtDate(h.endedAt)} · {h.durationMinutes}m · {h.messageCount} messages</p>
                                                </div>
                                            </div>
                                            {h.sessionSummary && (
                                                <p className="text-xs text-gray-500 line-clamp-2 ml-10">{h.sessionSummary}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Session History (shown when no active session) */}
            {!session && history.length > 0 && (
                <div className="glass-card p-6 mt-4">
                    <h2 className="font-semibold text-lg text-foreground mb-4">Past Sessions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {history.map((h, i) => (
                            <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <Avatar name={h.patientName} photo={h.patientAvatar} size={10} />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">{h.patientName}</p>
                                        <p className="text-xs text-gray-400">{fmtDate(h.endedAt)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">🕐 {h.durationMinutes}min</span>
                                    <span className="flex items-center gap-1">💬 {h.messageCount} msgs</span>
                                </div>
                                {h.sessionSummary && (
                                    <p className="mt-2 text-xs text-gray-600 line-clamp-2 border-t border-gray-100 pt-2">{h.sessionSummary}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
