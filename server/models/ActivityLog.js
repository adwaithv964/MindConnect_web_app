const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    userId: {
        type: String, // Firebase UID or MongoDB ObjectId as string
        required: false,
        default: 'anonymous'
    },
    userRole: {
        type: String,
        enum: ['patient', 'counsellor', 'admin', 'anonymous'],
        default: 'anonymous'
    },
    userName: { type: String, default: 'Unknown' },
    userEmail: { type: String, default: '' },
    action: {
        type: String,
        required: true,
        // e.g., 'LOGIN', 'LOGOUT', 'MOOD_LOG', 'APPOINTMENT_BOOKED', 'JOURNAL_ENTRY', etc.
    },
    category: {
        type: String,
        enum: ['auth', 'mood', 'appointment', 'journal', 'wellness', 'profile', 'admin', 'resource'],
        default: 'auth'
    },
    details: {
        type: String,
        default: ''
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
});

ActivityLogSchema.index({ timestamp: -1 });
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ userRole: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
