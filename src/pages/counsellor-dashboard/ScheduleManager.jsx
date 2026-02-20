import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Generate slots from 9am to 7pm in 1-hour blocks
const ALL_SLOTS = Array.from({ length: 10 }, (_, i) => {
    const h = i + 9;
    const start = `${String(h).padStart(2, '0')}:00`;
    const end = `${String(h + 1).padStart(2, '0')}:00`;
    const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
    return { startTime: start, endTime: end, label };
});

const ScheduleManager = () => {
    const [counsellorId, setCounsellorId] = useState(null);
    // availability: { [day]: [{ startTime, endTime, label }] }
    const [availability, setAvailability] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Load profile + availability from backend
    const fetchProfile = useCallback(async (id) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/counsellor/profile/${id}`);
            const profileData = res.data;

            // Convert array format to map: { day: [slots] }
            const map = {};
            if (profileData.availability && Array.isArray(profileData.availability)) {
                profileData.availability.forEach(({ day, slots }) => {
                    map[day] = slots || [];
                });
            }
            setAvailability(map);
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUpcoming = useCallback(async (id) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/appointments`, {
                params: { counsellorId: id, status: 'confirmed' }
            });
            setUpcomingAppointments(res.data.slice(0, 5));
        } catch (err) {
            console.error('Error loading upcoming:', err);
        }
    }, []);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const uid = storedUser?._id || storedUser?.id;
        setCounsellorId(uid);
        if (uid) {
            fetchProfile(uid);
            fetchUpcoming(uid);
        }
    }, [fetchProfile, fetchUpcoming]);

    const isSlotEnabled = (day, slot) => {
        const daySlots = availability[day] || [];
        return daySlots.some(s => s.startTime === slot.startTime);
    };

    const toggleSlot = (day, slot) => {
        setAvailability(prev => {
            const daySlots = prev[day] || [];
            const exists = daySlots.some(s => s.startTime === slot.startTime);
            let updated;
            if (exists) {
                updated = daySlots.filter(s => s.startTime !== slot.startTime);
            } else {
                updated = [...daySlots, { startTime: slot.startTime, endTime: slot.endTime }]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));
            }
            return { ...prev, [day]: updated };
        });
    };

    const toggleDay = (day) => {
        setAvailability(prev => {
            const currentSlots = prev[day] || [];
            // If all slots active → clear; else → fill all
            const allActive = ALL_SLOTS.every(s => currentSlots.some(cs => cs.startTime === s.startTime));
            return {
                ...prev,
                [day]: allActive ? [] : ALL_SLOTS.map(s => ({ startTime: s.startTime, endTime: s.endTime }))
            };
        });
    };

    const handleSave = async () => {
        if (!counsellorId) return;
        setSaving(true);
        try {
            // Convert map → array format for backend
            const availabilityArray = DAYS
                .filter(day => (availability[day] || []).length > 0)
                .map(day => ({
                    day,
                    slots: availability[day]
                }));

            await axios.put(`${API_BASE_URL}/api/counsellor/${counsellorId}/availability`, {
                availability: availabilityArray
            });
            showToast('Availability saved! Patients can now see your slots. ✅');
        } catch (err) {
            console.error('Error saving availability:', err);
            showToast('Failed to save. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const totalSlots = Object.values(availability).reduce((acc, slots) => acc + (slots?.length || 0), 0);
    const activeDays = DAYS.filter(d => (availability[d] || []).length > 0);

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short'
    });

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
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Schedule Manager</h1>
                    <p className="text-gray-500 mt-1 text-sm">Set your weekly availability — patients will only book during these hours</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2.5 rounded-xl font-medium text-sm text-white shadow-sm transition-all
                        ${saving ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
                >
                    {saving ? 'Saving...' : '💾 Save Availability'}
                </button>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-bold text-teal-600">{activeDays.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Active Days</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-bold text-blue-600">{totalSlots}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Slots/Week</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-bold text-purple-600">{upcomingAppointments.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Confirmed Upcoming</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Availability Grid */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">Weekly Availability</h2>
                            <p className="text-xs text-gray-400">Click slots to toggle • Click day to toggle all</p>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-400 animate-pulse">Loading your schedule...</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {DAYS.map(day => {
                                    const daySlots = availability[day] || [];
                                    const allActive = ALL_SLOTS.every(s => daySlots.some(cs => cs.startTime === s.startTime));
                                    const isActive = daySlots.length > 0;

                                    return (
                                        <div key={day} className={`p-4 ${isActive ? 'bg-white' : 'bg-gray-50/50'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <button
                                                    onClick={() => toggleDay(day)}
                                                    className={`flex items-center gap-2 font-semibold text-sm transition-colors
                                                        ${isActive ? 'text-teal-700' : 'text-gray-400'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                                                        ${allActive
                                                            ? 'bg-teal-500 border-teal-500'
                                                            : isActive
                                                                ? 'bg-teal-200 border-teal-400'
                                                                : 'border-gray-300'}`}>
                                                        {(isActive) && <span className="text-white text-[10px]">✓</span>}
                                                    </div>
                                                    {day}
                                                </button>
                                                <span className="text-xs text-gray-400">
                                                    {daySlots.length > 0 ? `${daySlots.length} slot${daySlots.length !== 1 ? 's' : ''} selected` : 'Unavailable'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {ALL_SLOTS.map(slot => {
                                                    const enabled = isSlotEnabled(day, slot);
                                                    return (
                                                        <button
                                                            key={slot.startTime}
                                                            onClick={() => toggleSlot(day, slot)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                                                ${enabled
                                                                    ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-600'}`}
                                                        >
                                                            {slot.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Upcoming Confirmed Appointments */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-800">Confirmed Appointments</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Your upcoming sessions</p>
                        </div>

                        {upcomingAppointments.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-4xl mb-3">📅</p>
                                <p className="text-sm text-gray-400">No upcoming confirmed sessions</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {upcomingAppointments.map(apt => (
                                    <div key={apt._id} className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {(apt.userId?.name || 'P')[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {apt.userId?.name || 'Patient'}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(apt.date)} · {apt.timeSlot}
                                                </p>
                                                <span className="text-xs capitalize text-teal-600 font-medium">
                                                    {apt.sessionType || 'video'} session
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Legend */}
                        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                            <p className="text-xs font-medium text-gray-500 mb-2">How it works:</p>
                            <ul className="space-y-1 text-xs text-gray-400">
                                <li>🟢 Green = you're available to accept bookings</li>
                                <li>⬜ White = unavailable, patients can't book</li>
                                <li>💾 Remember to Save after changes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleManager;
