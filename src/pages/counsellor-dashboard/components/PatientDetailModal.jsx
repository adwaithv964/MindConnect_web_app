import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const MOOD_COLORS = {
    happy: 'text-success',
    neutral: 'text-muted-foreground',
    sad: 'text-primary',
    anxious: 'text-warning',
    stressed: 'text-error',
    unknown: 'text-muted-foreground'
};

const MOOD_ICONS = {
    happy: 'Smile',
    neutral: 'Meh',
    sad: 'Frown',
    anxious: 'AlertCircle',
    stressed: 'Zap',
    unknown: 'Circle'
};

const RISK_COLORS = {
    low: 'bg-success/10 text-success border-success/30',
    medium: 'bg-warning/10 text-warning border-warning/30',
    high: 'bg-error/10 text-error border-error/30',
    critical: 'bg-destructive/10 text-destructive border-destructive/30'
};

const PatientDetailModal = ({ patient, counsellorId, onClose, onPatientUpdated, onRemovePatient }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [savingNote, setSavingNote] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({
        riskLevel: patient?.riskLevel || 'low',
        progressScore: patient?.progressScore || 0,
        totalSessions: patient?.totalSessions || 0,
        goalsCompleted: patient?.goalsCompleted || 0,
        totalGoals: patient?.totalGoals || 3,
        currentMood: patient?.currentMood || 'unknown',
        recentNotes: patient?.recentNotes || '',
        riskFactors: (patient?.riskFactors || []).join('\n'),
        flaggedBy: patient?.flaggedBy || ''
    });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Shared journals state
    const [sharedJournals, setSharedJournals] = useState([]);
    const [loadingJournals, setLoadingJournals] = useState(true);

    // Breathing exercise state
    const [breathingStats, setBreathingStats] = useState(null);
    const [loadingBreathing, setLoadingBreathing] = useState(true);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (!patient?.patientId) return;
        const pid = patient.patientId;

        // Fetch clinical notes
        const fetchNotes = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/notes/${pid}?counsellorId=${counsellorId}`);
                setNotes(res.data || []);
            } catch (err) {
                console.error('Error loading notes:', err);
            } finally {
                setLoadingNotes(false);
            }
        };

        // Fetch shared journal entries
        const fetchSharedJournals = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/wellness/journal/${pid}/shared`);
                setSharedJournals(res.data || []);
            } catch (err) {
                console.error('Error loading shared journals:', err);
            } finally {
                setLoadingJournals(false);
            }
        };

        // Fetch breathing exercise stats
        const fetchBreathingStats = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/wellness/breathing/${pid}/stats`);
                setBreathingStats(res.data);
            } catch (err) {
                console.error('Error loading breathing stats:', err);
            } finally {
                setLoadingBreathing(false);
            }
        };

        fetchNotes();
        fetchSharedJournals();
        fetchBreathingStats();
    }, [patient?.patientId, counsellorId]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setSavingNote(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/notes`, {
                counsellorId,
                patientId: patient.patientId,
                content: newNote.trim()
            });
            setNotes(prev => [res.data, ...prev]);
            setNewNote('');
            showToast('Note saved successfully!');
        } catch (err) {
            showToast('Failed to save note.', 'error');
        } finally {
            setSavingNote(false);
        }
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const updatePayload = {
                riskLevel: editData.riskLevel,
                progressScore: Number(editData.progressScore),
                totalSessions: Number(editData.totalSessions),
                goalsCompleted: Number(editData.goalsCompleted),
                totalGoals: Number(editData.totalGoals),
                currentMood: editData.currentMood,
                recentNotes: editData.recentNotes,
                riskFactors: editData.riskFactors.split('\n').map(s => s.trim()).filter(Boolean),
                flaggedBy: editData.flaggedBy || null
            };
            await axios.put(
                `${API_BASE_URL}/api/counsellor/${counsellorId}/patients/${patient.patientId}`,
                updatePayload
            );
            onPatientUpdated({ ...patient, ...updatePayload });
            setEditing(false);
            showToast('Patient record updated!');
        } catch (err) {
            showToast('Failed to update record.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        if (!window.confirm(`Remove ${patient.name} from your patient list?`)) return;
        try {
            await axios.delete(
                `${API_BASE_URL}/api/counsellor/${counsellorId}/patients/${patient.patientId}`
            );
            onRemovePatient(patient._id);
            onClose();
        } catch (err) {
            showToast('Failed to remove patient.', 'error');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatShortDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-border">
                {/* Toast */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium
                        ${toast.type === 'error' ? 'bg-error text-white' : 'bg-success text-white'}`}>
                        {toast.msg}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-4">
                        {patient?.avatar ? (
                            <img
                                src={patient.avatar}
                                alt={patient?.name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-border"
                                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                        ) : null}
                        <div
                            className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold"
                            style={{ display: patient?.avatar ? 'none' : 'flex' }}
                        >
                            {patient?.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                            <h2 className="font-heading font-bold text-xl text-foreground">{patient?.name}</h2>
                            <p className="text-sm text-muted-foreground">ID: {patient?.id} • {patient?.email}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${RISK_COLORS[patient?.riskLevel] || ''}`}>
                                {patient?.riskLevel} risk
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!editing ? (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                            >
                                <Icon name="Edit3" size={14} /> Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="px-3 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={saving}
                                    className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {saving ? 'Saving...' : <><Icon name="Check" size={14} /> Save</>}
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                        >
                            <Icon name="X" size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Progress', value: editing ? null : `${patient?.progressScore || 0}%`, icon: 'TrendingUp', field: 'progressScore', type: 'number', color: 'text-primary' },
                            { label: 'Sessions', value: editing ? null : patient?.totalSessions || 0, icon: 'Calendar', field: 'totalSessions', type: 'number', color: 'text-secondary' },
                            { label: 'Goals', value: editing ? null : `${patient?.goalsCompleted || 0}/${patient?.totalGoals || 3}`, icon: 'Target', fields: ['goalsCompleted', 'totalGoals'], color: 'text-accent' },
                            { label: 'Last Session', value: formatDate(patient?.lastSession), icon: 'Clock', color: 'text-warning' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-muted/40 rounded-xl p-3 border border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name={stat.icon} size={14} className={stat.color} />
                                    <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                                </div>
                                {editing && stat.field ? (
                                    <input
                                        type="number"
                                        value={editData[stat.field]}
                                        onChange={e => setEditData(p => ({ ...p, [stat.field]: e.target.value }))}
                                        className="w-full text-sm font-bold text-foreground bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                ) : editing && stat.fields ? (
                                    <div className="flex gap-1 items-center">
                                        <input type="number" value={editData.goalsCompleted}
                                            onChange={e => setEditData(p => ({ ...p, goalsCompleted: e.target.value }))}
                                            className="w-10 text-sm font-bold text-foreground bg-background border border-border rounded px-1 focus:outline-none focus:ring-1 focus:ring-primary" />
                                        <span className="text-foreground">/</span>
                                        <input type="number" value={editData.totalGoals}
                                            onChange={e => setEditData(p => ({ ...p, totalGoals: e.target.value }))}
                                            className="w-10 text-sm font-bold text-foreground bg-background border border-border rounded px-1 focus:outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                ) : (
                                    <p className="text-base font-bold text-foreground">{stat.value}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Mood + Risk */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Icon name="Heart" size={14} className="text-primary" /> Current Mood
                            </h4>
                            {editing ? (
                                <select
                                    value={editData.currentMood}
                                    onChange={e => setEditData(p => ({ ...p, currentMood: e.target.value }))}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    {['happy', 'neutral', 'sad', 'anxious', 'stressed', 'unknown'].map(m => (
                                        <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className={`flex items-center gap-2 ${MOOD_COLORS[patient?.currentMood]}`}>
                                    <Icon name={MOOD_ICONS[patient?.currentMood] || 'Circle'} size={20} />
                                    <span className="font-medium capitalize">{patient?.currentMood || 'Unknown'}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Icon name="AlertTriangle" size={14} className="text-warning" /> Risk Level
                            </h4>
                            {editing ? (
                                <div className="space-y-2">
                                    <select
                                        value={editData.riskLevel}
                                        onChange={e => setEditData(p => ({ ...p, riskLevel: e.target.value }))}
                                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        {['low', 'medium', 'high', 'critical'].map(r => (
                                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        value={editData.flaggedBy}
                                        onChange={e => setEditData(p => ({ ...p, flaggedBy: e.target.value }))}
                                        placeholder="Flagged by (optional)"
                                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border capitalize ${RISK_COLORS[patient?.riskLevel]}`}>
                                        {patient?.riskLevel?.toUpperCase()}
                                    </span>
                                    {patient?.flaggedBy && (
                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                            <Icon name="Flag" size={11} /> Flagged by {patient.flaggedBy}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Breathing Exercise Stats ─── */}
                    <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Icon name="Wind" size={14} className="text-secondary" /> Breathing Exercise Activity
                        </h4>
                        {loadingBreathing ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-muted rounded-lg" />)}
                            </div>
                        ) : breathingStats && breathingStats.totalSessions > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    {[
                                        { label: 'Total Sessions', value: breathingStats.totalSessions, icon: 'Activity', color: 'text-secondary' },
                                        { label: 'Total Minutes', value: `${Math.round((breathingStats.totalBreaths || 0) / 10)} min`, icon: 'Timer', color: 'text-primary' },
                                        { label: "Today's Sessions", value: breathingStats.todaySessions || 0, icon: 'Sun', color: 'text-warning' },
                                        { label: 'Day Streak', value: `${breathingStats.streak || 0} days`, icon: 'Flame', color: 'text-error' }
                                    ].map((s, i) => (
                                        <div key={i} className="bg-background/80 rounded-lg p-3 text-center border border-border/40">
                                            <Icon name={s.icon} size={16} className={`${s.color} mx-auto mb-1`} />
                                            <p className="text-lg font-bold text-foreground">{s.value}</p>
                                            <p className="text-xs text-muted-foreground">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                                {breathingStats.recentSessions?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Recent Sessions</p>
                                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                            {breathingStats.recentSessions.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between bg-background/60 rounded-lg px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Icon name="Wind" size={12} className="text-secondary" />
                                                        <span className="text-xs font-medium text-foreground capitalize">{s.technique}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-muted-foreground">{s.durationMinutes} min</span>
                                                        <span className="text-xs text-muted-foreground">{formatShortDate(s.completedAt)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Icon name="Wind" size={24} className="opacity-40" />
                                <p className="text-sm">No breathing exercises recorded yet.</p>
                            </div>
                        )}
                    </div>

                    {/* ─── Shared Journal Entries ─── */}
                    <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Icon name="BookOpen" size={14} className="text-accent" />
                            Shared Journal Entries
                            {sharedJournals.length > 0 && (
                                <span className="ml-auto bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full font-medium">
                                    {sharedJournals.length} {sharedJournals.length === 1 ? 'entry' : 'entries'}
                                </span>
                            )}
                        </h4>
                        {loadingJournals ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-16 bg-muted rounded-lg" />
                                <div className="h-16 bg-muted rounded-lg" />
                            </div>
                        ) : sharedJournals.length > 0 ? (
                            <div className="space-y-3 max-h-52 overflow-y-auto">
                                {sharedJournals.map(entry => (
                                    <div key={entry._id} className="bg-background/80 rounded-lg p-3 border border-border/40">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <Icon name="FileText" size={13} className="text-accent" />
                                                <span className="text-xs font-semibold text-foreground">{entry.promptTitle || 'Free Writing'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">{entry.wordCount || 0} words</span>
                                                <span className="text-xs text-muted-foreground">{formatShortDate(entry.timestamp)}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground leading-relaxed line-clamp-3">{entry.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Icon name="Lock" size={20} className="opacity-40" />
                                <p className="text-sm">Patient has not shared any journal entries yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Risk Factors */}
                    <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Icon name="AlertCircle" size={14} className="text-error" /> Risk Factors
                        </h4>
                        {editing ? (
                            <textarea
                                value={editData.riskFactors}
                                onChange={e => setEditData(p => ({ ...p, riskFactors: e.target.value }))}
                                placeholder="One risk factor per line..."
                                rows={4}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                        ) : patient?.riskFactors?.length > 0 ? (
                            <ul className="space-y-1.5">
                                {patient.riskFactors.map((factor, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                        <Icon name="AlertCircle" size={13} className="text-error mt-0.5 flex-shrink-0" />
                                        {factor}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No risk factors recorded.</p>
                        )}
                    </div>

                    {/* Treatment Summary Note */}
                    <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Icon name="FileText" size={14} className="text-secondary" /> Treatment Summary Note
                        </h4>
                        {editing ? (
                            <textarea
                                value={editData.recentNotes}
                                onChange={e => setEditData(p => ({ ...p, recentNotes: e.target.value }))}
                                rows={3}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                        ) : (
                            <p className="text-sm text-foreground">{patient?.recentNotes || 'No notes recorded.'}</p>
                        )}
                    </div>

                    {/* Clinical Notes */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Icon name="PenLine" size={14} className="text-primary" /> Clinical Session Notes
                        </h4>
                        <div className="flex gap-2 mb-4">
                            <textarea
                                value={newNote}
                                onChange={e => setNewNote(e.target.value)}
                                placeholder="Write a clinical note for this session..."
                                rows={2}
                                className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={savingNote || !newNote.trim()}
                                className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-1 min-w-[60px]"
                            >
                                <Icon name="Send" size={16} />
                                <span className="text-xs">Save</span>
                            </button>
                        </div>
                        {loadingNotes ? (
                            <div className="animate-pulse space-y-2">
                                {[1, 2].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                                <Icon name="FileText" size={32} className="mx-auto mb-2 opacity-40" />
                                No clinical notes yet.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {notes.map(note => (
                                    <div key={note._id} className="bg-muted/40 rounded-xl p-3 border border-border/50">
                                        <p className="text-sm text-foreground">{note.content}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(note.createdAt).toLocaleString('en-IN', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex-shrink-0 flex justify-between items-center">
                    <button
                        onClick={handleRemove}
                        className="px-4 py-2 text-sm font-medium text-error bg-error/10 hover:bg-error/20 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                        <Icon name="UserMinus" size={14} /> Remove from List
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailModal;
