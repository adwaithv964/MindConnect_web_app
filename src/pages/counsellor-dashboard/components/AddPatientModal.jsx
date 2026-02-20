import React, { useState } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const AddPatientModal = ({ counsellorId, onClose, onPatientAdded }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Please enter a patient email address.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/counsellor/${counsellorId}/patients`,
                { email: email.trim() }
            );
            onPatientAdded(res.data);
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add patient.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md border border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name="UserPlus" size={20} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="font-heading font-semibold text-lg text-foreground">Add Patient</h2>
                            <p className="text-sm text-muted-foreground">Link a patient to your care list</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Patient Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            placeholder="patient@example.com"
                            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-error flex items-center gap-1.5">
                                <Icon name="AlertCircle" size={14} />
                                {error}
                            </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                            The patient must already have a MindConnect account. Their email must match exactly.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2.5 text-sm font-medium text-muted-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Icon name="UserPlus" size={16} />
                                    Add Patient
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientModal;
