import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const TABS = ['pending', 'confirmed', 'declined', 'all'];

const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    declined: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const sessionIcons = { video: '🎥', phone: '📞', inperson: '🏥' };

const AppointmentRequests = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [actionModal, setActionModal] = useState(null); // { apt, type: 'confirm'|'decline' }
    const [actionNote, setActionNote] = useState('');
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState(null);
    const [counsellorId, setCounsellorId] = useState(null);
    const [addingToDashboard, setAddingToDashboard] = useState({});

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAppointments = useCallback(async (id) => {
        const queryId = id || counsellorId;
        if (!queryId) return;
        try {
            const params = { counsellorId: queryId };
            if (activeTab !== 'all') params.status = activeTab;

            console.log('[AppointmentRequests] Fetching with params:', params);
            const res = await axios.get(`${API_BASE_URL}/api/appointments`, { params });
            console.log('[AppointmentRequests] Got', res.data.length, 'appointments');
            setAppointments(res.data);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            showToast('Failed to load requests', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeTab, counsellorId]);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const uid = storedUser?._id || storedUser?.id;
        console.log('[AppointmentRequests] Counsellor ID from localStorage:', uid, '| Full stored user:', storedUser);
        setCounsellorId(uid);
        if (uid) fetchAppointments(uid);
    }, []);

    useEffect(() => {
        if (counsellorId) fetchAppointments();
    }, [activeTab, counsellorId]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (counsellorId) fetchAppointments();
        }, 30000);
        return () => clearInterval(interval);
    }, [counsellorId, fetchAppointments]);

    const handleAction = async () => {
        if (!actionModal) return;
        setProcessing(true);
        const { apt, type } = actionModal;
        const newStatus = type === 'confirm' ? 'confirmed' : 'declined';
        try {
            await axios.put(`${API_BASE_URL}/api/appointments/${apt._id}`, {
                status: newStatus,
                confirmationNote: actionNote.trim() || undefined
            });
            showToast(`Appointment ${newStatus} successfully! ✅`);
            setActionModal(null);
            setActionNote('');
            fetchAppointments();
        } catch (err) {
            console.error('Error updating appointment:', err);
            showToast('Failed to update. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Add confirmed patient to dashboard manually
    const addToDashboard = async (apt) => {
        if (!counsellorId || !apt.userId?._id) return;
        setAddingToDashboard(prev => ({ ...prev, [apt._id]: true }));
        try {
            await axios.post(`${API_BASE_URL}/api/counsellor/${counsellorId}/patients`, {
                patientId: apt.userId._id
            });
            showToast(`${apt.userId?.name || 'Patient'} added to your dashboard!`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add patient';
            if (msg.toLowerCase().includes('already')) {
                showToast('Patient is already on your dashboard', 'info');
            } else {
                showToast(msg, 'error');
            }
        } finally {
            setAddingToDashboard(prev => ({ ...prev, [apt._id]: false }));
        }
    };

    const tabCounts = TABS.reduce((acc, tab) => {
        if (tab === 'all') {
            acc[tab] = appointments.length;
        } else {
            // We refetch per tab, so just show the count of what arrived
            acc[tab] = tab === activeTab ? appointments.length : '?';
        }
        return acc;
    }, {});

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <BreadcrumbTrail />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
                    ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Appointment Requests</h1>
                    <p className="text-gray-500 mt-1 text-sm">Review and respond to patient booking requests</p>
                </div>
                <button
                    onClick={() => fetchAppointments()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors text-sm font-medium"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setLoading(true); }}
                        className={`px-4 py-2.5 text-sm font-medium capitalize rounded-t-lg border-b-2 transition-colors
                            ${activeTab === tab
                                ? 'border-teal-500 text-teal-700 bg-teal-50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && !loading && (
                            <span className="ml-2 bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full">
                                {appointments.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                            <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No {activeTab === 'all' ? '' : activeTab} appointment requests
                    </h3>
                    <p className="text-gray-400 text-sm">
                        {activeTab === 'pending'
                            ? 'New patient booking requests will appear here.'
                            : `No ${activeTab} appointments found.`}
                    </p>
                    {activeTab === 'pending' && counsellorId && (
                        <p className="text-xs text-gray-300 mt-4">Counsellor ID: {counsellorId}</p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map(apt => (
                        <div
                            key={apt._id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                            {/* Card top bar */}
                            <div className={`h-1 ${apt.status === 'pending' ? 'bg-amber-400' : apt.status === 'confirmed' ? 'bg-green-400' : 'bg-red-400'}`} />

                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Patient Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            {apt.userId?.profilePhoto ? (
                                                <img
                                                    src={apt.userId.profilePhoto}
                                                    alt={apt.userId?.name || 'Patient'}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                                                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : null}
                                            <div
                                                className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg"
                                                style={{ display: apt.userId?.profilePhoto ? 'none' : 'flex' }}
                                            >
                                                {(apt.userId?.name || 'P')[0].toUpperCase()}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-base">
                                                {apt.userId?.name || 'Unknown Patient'}
                                            </h3>
                                            <p className="text-sm text-gray-500">{apt.userId?.email || '—'}</p>
                                            {apt.isFirstSession && (
                                                <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                                    🌟 First Session
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusColors[apt.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                        {apt.status}
                                    </span>
                                </div>

                                {/* Details grid */}
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-1">📅 Date</p>
                                        <p className="text-sm font-medium text-gray-700">{formatDate(apt.date)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-1">⏰ Time</p>
                                        <p className="text-sm font-medium text-gray-700">{apt.timeSlot || '—'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-1">Session</p>
                                        <p className="text-sm font-medium text-gray-700 capitalize">
                                            {sessionIcons[apt.sessionType] || '🎥'} {apt.sessionType || 'video'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-1">Reason</p>
                                        <p className="text-sm font-medium text-gray-700 truncate">{apt.reason || apt.title || '—'}</p>
                                    </div>
                                </div>

                                {apt.notes && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                                        <span className="font-medium">Patient notes: </span>{apt.notes}
                                    </div>
                                )}

                                {apt.confirmationNote && (
                                    <div className="mt-3 p-3 bg-green-50 rounded-xl text-sm text-green-700">
                                        <span className="font-medium">Your note: </span>{apt.confirmationNote}
                                    </div>
                                )}

                                {/* Action buttons — pending = confirm/decline, confirmed = add to dashboard */}
                                {apt.status === 'pending' && (
                                    <div className="mt-4 flex gap-3 justify-end">
                                        <button
                                            onClick={() => { setActionModal({ apt, type: 'decline' }); setActionNote(''); }}
                                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                                        >
                                            ✕ Decline
                                        </button>
                                        <button
                                            onClick={() => { setActionModal({ apt, type: 'confirm' }); setActionNote(''); }}
                                            className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
                                        >
                                            ✓ Confirm Appointment
                                        </button>
                                    </div>
                                )}
                                {apt.status === 'confirmed' && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => addToDashboard(apt)}
                                            disabled={addingToDashboard[apt._id]}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors disabled:opacity-50"
                                        >
                                            {addingToDashboard[apt._id] ? (
                                                <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                            ) : '➕'}
                                            Add to Dashboard
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm/Decline Modal */}
            {actionModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {actionModal.type === 'confirm' ? '✅ Confirm Appointment' : '❌ Decline Request'}
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            {actionModal.type === 'confirm'
                                ? `Confirming appointment for ${actionModal.apt.userId?.name || 'patient'} on ${formatDate(actionModal.apt.date)} at ${actionModal.apt.timeSlot}.`
                                : `Declining request from ${actionModal.apt.userId?.name || 'patient'}.`}
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {actionModal.type === 'confirm'
                                    ? 'Add a note for the patient (optional)'
                                    : 'Reason for declining (optional)'}
                            </label>
                            <textarea
                                value={actionNote}
                                onChange={e => setActionNote(e.target.value)}
                                placeholder={actionModal.type === 'confirm'
                                    ? 'e.g. Please join 5 minutes early via the link sent to your email.'
                                    : 'e.g. I am not available on this day, please reschedule.'}
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setActionModal(null)}
                                disabled={processing}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={processing}
                                className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl transition-colors
                                    ${actionModal.type === 'confirm'
                                        ? 'bg-teal-600 hover:bg-teal-700'
                                        : 'bg-red-500 hover:bg-red-600'}
                                    ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {processing ? 'Processing...' : actionModal.type === 'confirm' ? 'Yes, Confirm' : 'Yes, Decline'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentRequests;
