const mongoose = require('mongoose');

const CounsellorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String
    },
    specializations: [{
        type: String
    }],
    availability: [{
        day: String, // e.g., "Monday"
        slots: [{
            startTime: String, // e.g., "09:00"
            endTime: String    // e.g., "10:00"
        }]
    }],
    credentials: {
        type: String // URL or path to uploaded document
    },
    profilePhoto: {
        type: String
    },
    experienceYears: {
        type: Number
    },
    languages: [{
        type: String
    }],
    qualifications: {
        type: String // e.g., "LCSW, Licensed Clinical Social Worker"
    },
    patientCount: {
        type: Number
    },
    // NMC Verification Details
    registrationNumber: { type: String },
    registrationYear: { type: String },
    stateMedicalCouncil: { type: String },
    nmcVerificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed', 'unverified'],
        default: 'unverified'
    },
    verifiedName: { type: String } // Stores the name as it appears in the NMC registry
});

module.exports = mongoose.model('CounsellorProfile', CounsellorProfileSchema);
