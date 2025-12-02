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
        const appointments = await Appointment.find({ doctor: counsellorId });
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

module.exports = router;
