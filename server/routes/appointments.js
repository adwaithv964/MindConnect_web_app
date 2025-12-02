const express = require('express');
const router = express.Router();
const Appointment = require('mongoose').model('Appointment'); // Using existing model
const User = require('../models/User');

// Get appointments for logged in user
router.get('/', async (req, res) => {
    try {
        // Assuming auth middleware adds user to req
        // const userId = req.user.id;
        // const role = req.user.role;

        // For now, getting all or filtering by query param if provided
        const { userId, role } = req.query;

        let query = {};
        if (userId) {
            if (role === 'counsellor') {
                query.doctor = userId; // Assuming doctor field stores ID or name (need to align)
            } else {
                query.userId = userId;
            }
        }

        const appointments = await Appointment.find(query).sort({ date: 1 });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create appointment
router.post('/', async (req, res) => {
    try {
        const { title, date, doctor, notes, userId } = req.body;

        const newAppointment = new Appointment({
            title,
            date,
            doctor,
            notes,
            userId
        });

        const appointment = await newAppointment.save();
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update appointment
router.put('/:id', async (req, res) => {
    try {
        const { status, notes } = req.body;
        // Add status field to schema if not exists, for now just notes

        let appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (notes) appointment.notes = notes;
        // if (status) appointment.status = status;

        await appointment.save();
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
