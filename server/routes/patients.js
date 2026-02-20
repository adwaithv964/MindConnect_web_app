const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('mongoose').model('Appointment');

// Get patients for a counsellor
router.get('/', async (req, res) => {
    try {
        const { counsellorId } = req.query;

        // Find all appointments for this counsellor to identify patients
        // This is a simple way, ideally we have a 'Patient-Counsellor' relationship table
        // Find all appointments for this counsellor to identify patients
        // We use counsellorId (ObjectId) instead of doctor (String name) for accuracy
        const appointments = await Appointment.find({ counsellorId: counsellorId });
        const patientIds = [...new Set(appointments.map(a => a.userId))];

        const patients = await User.find({ _id: { $in: patientIds } }).select('-password');
        res.json(patients);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get specific patient details (including shared mood logs etc)
router.get('/:id', async (req, res) => {
    try {
        const patient = await User.findById(req.params.id).select('-password');
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        // Fetch mood logs (assuming MoodLog model is available globally or need import)
        const MoodLog = require('mongoose').model('MoodLog');
        const moodLogs = await MoodLog.find({ userId: req.params.id }).sort({ timestamp: -1 });

        res.json({ patient, moodLogs });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Update patient profile
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, emergencyContact, profilePhoto } = req.body;

        const userFields = {};
        if (name !== undefined) userFields.name = name;
        if (email !== undefined) userFields.email = email;
        if (phone !== undefined) userFields.phone = phone;
        if (emergencyContact !== undefined) userFields.emergencyContact = emergencyContact;
        if (profilePhoto !== undefined) userFields.profilePhoto = profilePhoto;

        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Role guard: only allow updates for patient accounts
        if (user.role !== 'patient') {
            return res.status(403).json({ message: 'Forbidden: This endpoint is only for patient profiles.' });
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Verify patient
router.patch('/:id/verify', async (req, res) => {
    try {
        const { isPatientVerified } = req.body;
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isPatientVerified = isPatientVerified;
        await user.save();

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
