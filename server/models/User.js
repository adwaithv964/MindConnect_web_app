const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false // Password optional for Firebase users
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        enum: ['patient', 'counsellor', 'admin'],
        default: 'patient'
    },
    isVerified: {
        type: Boolean,
        default: false // Only relevant for counsellors
    },
    emergencyContact: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
