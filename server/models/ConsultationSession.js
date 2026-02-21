const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // 'counsellor' | 'patient'
    senderId: { type: String, required: true },
    senderName: { type: String, default: '' },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ConsultationSessionSchema = new mongoose.Schema({
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
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'ended'],
        default: 'active'
    },
    messages: [MessageSchema],
    sessionNotes: {
        type: String,
        default: ''
    },
    sessionSummary: {
        type: String,
        default: ''
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('ConsultationSession', ConsultationSessionSchema);
