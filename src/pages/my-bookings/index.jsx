import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoleBasedSidebar, { SidebarProvider, useSidebar } from '../../components/ui/RoleBasedSidebar';
import SOSFloatingButton from '../../components/ui/SOSFloatingButton';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'text-warning bg-warning/10 border-warning/20', icon: 'Clock' },
    confirmed: { label: 'Confirmed', color: 'text-success bg-success/10 border-success/20', icon: 'CheckCircle2' },
    declined: { label: 'Declined', color: 'text-error bg-error/10 border-error/20', icon: 'XCircle' },
    cancelled: { label: 'Cancelled', color: 'text-muted-foreground bg-muted border-border', icon: 'Ban' }
};

const SESSION_LABELS = {
    video: '🎥 Video Call',
    phone: '📞 Phone Call',
    inperson: '🏥 In-Person'
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const CancelDialog = ({ appointment, onCancel, onClose }) => (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="glass-card w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Cancel Appointment?</h3>
                    <p className="text-xs text-muted-foreground">This action cannot be undone</p>
                </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 mb-5 text-sm text-foreground/80">
                <p><strong>Counsellor:</strong> {appointment?.counsellor?.name || appointment?.doctor || 'N/A'}</p>
                <p><strong>Date:</strong> {formatDate(appointment?.date)}</p>
                {appointment?.timeSlot && <p><strong>Time:</strong> {appointment.timeSlot}</p>}
            </div>
            <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={onClose}>Keep It</Button>
                <Button
                    variant="default"
                    fullWidth
                    onClick={() => onCancel(appointment._id)}
                    className="bg-error hover:bg-error/90 text-white border-error"
                >
                    Yes, Cancel
                </Button>
            </div>
        </div>
    </div>
);

const AppointmentCard = ({ appointment, onCancel }) => {
    const navigate = useNavigate();
    const status = appointment.status || 'pending';
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const isPast = new Date(appointment.date) < new Date();
    const canCancel = !isPast && ['pending', 'confirmed'].includes(status);

    return (
        <div className="glass-card p-5 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Counsellor Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {appointment.counsellor?.profilePhoto ? (
                            <img
                                src={appointment.counsellor.profilePhoto}
                                alt={appointment.counsellor.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Icon name="User" size={20} color="var(--color-primary)" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-base truncate">
                            {appointment.counsellor?.name || appointment.doctor || 'Unknown Counsellor'}
                        </h3>
                        {appointment.counsellor?.qualifications && (
                            <p className="text-xs text-muted-foreground truncate">{appointment.counsellor.qualifications}</p>
                        )}
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${statusConfig.color}`}>
                    <Icon name={statusConfig.icon} size={12} />
                    {statusConfig.label}
                </div>
            </div>

            {/* Details Grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Icon name="Calendar" size={14} color="var(--color-primary)" />
                    <span>{formatDate(appointment.date)}</span>
                </div>
                {appointment.timeSlot && (
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <Icon name="Clock" size={14} color="var(--color-primary)" />
                        <span>{appointment.timeSlot}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Icon name="Video" size={14} color="var(--color-primary)" />
                    <span>{SESSION_LABELS[appointment.sessionType] || appointment.sessionType || 'Video Call'}</span>
                </div>
            </div>

            {appointment.reason && (
                <div className="mt-3 p-2 bg-muted/40 rounded-lg text-xs text-foreground/70">
                    <span className="font-medium">Reason:</span> {appointment.reason}
                </div>
            )}

            {appointment.confirmationNote && (
                <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                    <span className="font-semibold">📝 Counsellor note: </span>{appointment.confirmationNote}
                </div>
            )}

            {/* Actions */}
            {canCancel && (
                <div className="mt-4 flex gap-2 pt-3 border-t border-border">
                    <Button
                        variant="outline"
                        size="sm"
                        iconName="RefreshCw"
                        iconPosition="left"
                        onClick={() => navigate('/appointment-booking')}
                    >
                        Reschedule
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        iconName="X"
                        iconPosition="left"
                        onClick={() => onCancel(appointment)}
                        className="text-error border-error/20 hover:bg-error/5"
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
};

const MyBookingsContent = () => {
    const navigate = useNavigate();
    const { isCollapsed } = useSidebar();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [newlyConfirmed, setNewlyConfirmed] = useState([]); // ids of appointments just confirmed
    const prevStatusMap = React.useRef({});

    const fetchAppointments = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const userId = storedUser?._id || storedUser?.id;

            if (!userId) {
                setError('Please log in to view your bookings.');
                return;
            }

            const res = await axios.get(`${API_BASE_URL}/api/appointments?userId=${userId}`);
            const data = res.data || [];

            // Detect newly confirmed appointments
            const justConfirmed = data.filter(a =>
                a.status === 'confirmed' && prevStatusMap.current[a._id] === 'pending'
            ).map(a => a._id);
            if (justConfirmed.length > 0) setNewlyConfirmed(prev => [...new Set([...prev, ...justConfirmed])]);

            // Update status tracking map
            data.forEach(a => { prevStatusMap.current[a._id] = a.status; });

            setAppointments(data);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            if (!silent) setError('Failed to load appointments. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Auto-refresh every 30 seconds (silent — no loading spinner)
    useEffect(() => {
        const interval = setInterval(() => fetchAppointments(true), 30000);
        return () => clearInterval(interval);
    }, [fetchAppointments]);

    const handleCancelClick = (appointment) => {
        setCancelTarget(appointment);
    };

    const handleConfirmCancel = async (appointmentId) => {
        try {
            setCancelling(true);
            await axios.delete(`${API_BASE_URL}/api/appointments/${appointmentId}`);
            setAppointments(prev =>
                prev.map(a => a._id === appointmentId ? { ...a, status: 'cancelled' } : a)
            );
            setCancelTarget(null);
        } catch (err) {
            console.error('Cancel failed:', err);
            alert('Failed to cancel appointment. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const now = new Date();

    const upcoming = appointments.filter(
        a => new Date(a.date) >= now && !['cancelled', 'declined'].includes(a.status)
    );
    const past = appointments.filter(
        a => new Date(a.date) < now || ['cancelled', 'declined'].includes(a.status)
    );

    const displayList = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : appointments;

    const TABS = [
        { id: 'upcoming', label: 'Upcoming', count: upcoming.length, icon: 'Calendar' },
        { id: 'past', label: 'Past', count: past.length, icon: 'History' },
        { id: 'all', label: 'All', count: appointments.length, icon: 'List' }
    ];

    const EmptyState = () => (
        <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Icon name="CalendarX2" size={32} color="var(--color-muted-foreground)" />
            </div>
            <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No appointments found'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {activeTab === 'upcoming'
                    ? 'You have no upcoming sessions. Book an appointment with a counsellor to get started.'
                    : 'No appointments in this category yet.'}
            </p>
            {activeTab !== 'past' && (
                <Button
                    variant="default"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => navigate('/appointment-booking')}
                >
                    Book an Appointment
                </Button>
            )}
        </div>
    );

    return (
        <>
            <RoleBasedSidebar userRole="patient" />
            <SOSFloatingButton onEmergency={() => navigate('/emergency-support')} />
            <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <BreadcrumbTrail />

                {/* Confirmation Banner */}
                {newlyConfirmed.length > 0 && (
                    <div className="mb-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800">
                        <span className="text-2xl">🎉</span>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">Appointment Confirmed!</p>
                            <p className="text-xs text-green-600">Your counsellor has accepted your booking. Check the details below.</p>
                        </div>
                        <button onClick={() => setNewlyConfirmed([])} className="text-green-500 hover:text-green-700 text-lg">×</button>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">My Bookings</h1>
                        <p className="text-muted-foreground">Manage all your counselling sessions in one place</p>
                    </div>
                    <Button
                        variant="default"
                        iconName="Plus"
                        iconPosition="left"
                        onClick={() => navigate('/appointment-booking')}
                    >
                        Book New Appointment
                    </Button>
                </div>

                {/* Stats Banner */}
                {!loading && appointments.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: 'Total', value: appointments.length, icon: 'Calendar', color: 'primary' },
                            { label: 'Upcoming', value: upcoming.length, icon: 'Clock', color: 'success' },
                            {
                                label: 'Confirmed',
                                value: appointments.filter(a => a.status === 'confirmed').length,
                                icon: 'CheckCircle2',
                                color: 'success'
                            },
                            {
                                label: 'Pending',
                                value: appointments.filter(a => a.status === 'pending').length,
                                icon: 'Loader',
                                color: 'warning'
                            }
                        ].map(stat => (
                            <div key={stat.label} className="glass-card p-4 text-center">
                                <Icon name={stat.icon} size={20} color={`var(--color-${stat.color})`} className="mx-auto mb-1" />
                                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-6 w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${activeTab === tab.id
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                                }`}
                        >
                            <Icon name={tab.icon} size={14} />
                            {tab.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-card p-5 animate-pulse">
                                <div className="flex gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-muted" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-1/3" />
                                        <div className="h-3 bg-muted rounded w-1/4" />
                                    </div>
                                    <div className="h-6 bg-muted rounded-full w-20" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3].map(j => <div key={j} className="h-4 bg-muted rounded" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="glass-card p-8 text-center">
                        <Icon name="AlertTriangle" size={40} color="var(--color-error)" className="mx-auto mb-3" />
                        <p className="text-foreground font-medium mb-2">{error}</p>
                        <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={fetchAppointments}>
                            Retry
                        </Button>
                    </div>
                ) : displayList.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-4">
                        {displayList
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map(appointment => (
                                <AppointmentCard
                                    key={appointment._id}
                                    appointment={appointment}
                                    onCancel={handleCancelClick}
                                />
                            ))}
                    </div>
                )}
            </main>

            {/* Cancel Dialog */}
            {cancelTarget && (
                <CancelDialog
                    appointment={cancelTarget}
                    onCancel={handleConfirmCancel}
                    onClose={() => setCancelTarget(null)}
                />
            )}
        </>
    );
};

const MyBookings = () => (
    <SidebarProvider>
        <MyBookingsContent />
    </SidebarProvider>
);

export default MyBookings;
