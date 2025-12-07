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


// Update patient profile
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, emergencyContact } = req.body;

        const userFields = {};
        if (name !== undefined) userFields.name = name;
        if (email !== undefined) userFields.email = email;
        // Phone is not in User schema yet, assuming we add it or store in specific profile if we had one.
        // For now, let's look at User schema. It doesn't have phone. Let's add it or ignore it.
        // The user request images showed "Phone Number". I should add 'phone' to User schema.
        if (phone !== undefined) userFields.phone = phone;
        if (emergencyContact !== undefined) userFields.emergencyContact = emergencyContact;

        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

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

module.exports = router;
