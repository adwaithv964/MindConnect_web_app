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
    }]
});

module.exports = mongoose.model('CounsellorProfile', CounsellorProfileSchema);
