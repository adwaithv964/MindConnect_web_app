const mongoose = require('mongoose');

const DoctorRegistrySchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: true,
        index: true // Indexed for fast lookup
    },
    stateMedicalCouncil: {
        type: String,
        required: true,
        index: true // Indexed for fast lookup
    },
    name: {
        type: String,
        required: true
    },
    fatherName: {
        type: String
    },
    yearOfInfo: {
        type: String // Using String to handle potential varied formats like "1990" or "1990-91"
    },
    originalData: {
        type: mongoose.Schema.Types.Mixed // Store any extra fields from the raw data here
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness and fast lookup by Pair
DoctorRegistrySchema.index({ registrationNumber: 1, stateMedicalCouncil: 1 });

module.exports = mongoose.model('DoctorRegistry', DoctorRegistrySchema);
