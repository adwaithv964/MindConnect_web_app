const mongoose = require('mongoose');

const PatientRecordSchema = new mongoose.Schema({
    counsellorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Clinical tracking data
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    progressScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    goalsCompleted: {
        type: Number,
        default: 0
    },
    totalGoals: {
        type: Number,
        default: 3
    },
    currentMood: {
        type: String,
        enum: ['happy', 'neutral', 'sad', 'anxious', 'stressed', 'unknown'],
        default: 'unknown'
    },
    recentNotes: {
        type: String,
        default: ''
    },
    riskFactors: [{
        type: String
    }],
    flaggedBy: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastSessionDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a patient can only be linked once per counsellor
PatientRecordSchema.index({ counsellorId: 1, patientId: 1 }, { unique: true });

// Auto-update updatedAt on save
PatientRecordSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('PatientRecord', PatientRecordSchema);
