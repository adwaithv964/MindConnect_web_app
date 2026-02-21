const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
    userId: { type: String, default: null },
    userName: { type: String, default: 'Unknown' },
    userEmail: { type: String, default: '' },
    event: {
        type: String,
        required: true,
        // e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'REGISTER', 'PASSWORD_CHANGE',
        // 'ROLE_CHANGE', 'ACCOUNT_DELETED', 'ADMIN_ACTION', 'UNAUTHORIZED_ACCESS'
    },
    success: { type: Boolean, default: true },
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info'
    },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
});

SecurityLogSchema.index({ timestamp: -1 });
SecurityLogSchema.index({ event: 1, timestamp: -1 });
SecurityLogSchema.index({ success: 1, timestamp: -1 });

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);
