const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PatientRecord = require('../models/PatientRecord');
const User = require('../models/User');
const CounsellorProfile = require('../models/CounsellorProfile');

const Appointment = mongoose.model('Appointment');

// Helper: safely cast to ObjectId
const toObjectId = (id) => {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
};

// GET /api/appointments?userId=...&counsellorId=...&status=...
router.get('/', async (req, res) => {
    try {
        const { userId, counsellorId, status } = req.query;

        let query = {};

        if (userId) {
            const oid = toObjectId(userId);
            query.userId = oid || userId;
        }
        if (counsellorId) {
            const oid = toObjectId(counsellorId);
            query.counsellorId = oid || counsellorId;
        }
        if (status) query.status = status;

        console.log('[GET /appointments] query:', JSON.stringify(query));

        const appointments = await Appointment.find(query)
            .sort({ date: 1 })
            .populate('userId', 'name email phone profilePhoto')
            .lean();

        console.log(`[GET /appointments] found ${appointments.length} appointments`);

        // Enrich with counsellor info
        const counsellorIds = [...new Set(appointments.map(a => a.counsellorId?.toString()).filter(Boolean))];
        let counsellorMap = {};

        if (counsellorIds.length > 0) {
            const counsellors = await User.find({ _id: { $in: counsellorIds } }).select('name email').lean();
            const profiles = await CounsellorProfile.find({ userId: { $in: counsellorIds } }).lean();

            counsellors.forEach(c => {
                const profile = profiles.find(p => p.userId.toString() === c._id.toString());
                counsellorMap[c._id.toString()] = {
                    name: c.name,
                    email: c.email,
                    profilePhoto: profile?.profilePhoto || null,
                    qualifications: profile?.qualifications || 'Licensed Counsellor',
                    specializations: profile?.specializations || []
                };
            });
        }

        const enriched = appointments.map(a => ({
            ...a,
            counsellor: counsellorMap[a.counsellorId?.toString()] || { name: a.doctor || 'Unknown' }
        }));

        res.json(enriched);
    } catch (err) {
        console.error('GET /appointments error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('userId', 'name email phone')
            .lean();

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Enrich counsellor
        let counsellor = { name: appointment.doctor || 'Unknown' };
        if (appointment.counsellorId) {
            const cUser = await User.findById(appointment.counsellorId).select('name email').lean();
            const cProfile = await CounsellorProfile.findOne({ userId: appointment.counsellorId }).lean();
            if (cUser) {
                counsellor = {
                    name: cUser.name,
                    email: cUser.email,
                    profilePhoto: cProfile?.profilePhoto || null,
                    qualifications: cProfile?.qualifications || 'Licensed Counsellor',
                    specializations: cProfile?.specializations || []
                };
            }
        }

        res.json({ ...appointment, counsellor });
    } catch (err) {
        console.error('GET /appointments/:id error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// POST /api/appointments
router.post('/', async (req, res) => {
    try {
        const {
            title, date, timeSlot, doctor, notes, userId, counsellorId,
            sessionType, insuranceProvider, policyNumber, reason, isFirstSession
        } = req.body;

        if (!userId) return res.status(400).json({ message: 'userId is required' });
        if (!date) return res.status(400).json({ message: 'date is required' });

        const userOid = toObjectId(userId);
        const counsellorOid = counsellorId ? toObjectId(counsellorId) : null;

        const newAppointment = new Appointment({
            title: title || reason || 'Consultation',
            date: new Date(date),
            timeSlot,
            doctor,
            notes,
            userId: userOid || userId,
            counsellorId: counsellorOid || counsellorId,
            status: 'pending',
            sessionType: sessionType || 'video',
            insuranceProvider,
            policyNumber,
            reason,
            isFirstSession
        });

        const appointment = await newAppointment.save();
        console.log(`[POST /appointments] Created appointment ${appointment._id} for counsellor ${counsellorId}`);
        res.status(201).json(appointment);
    } catch (err) {
        console.error('POST /appointments error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// PUT /api/appointments/:id — update status, notes, reschedule, confirmationNote
router.put('/:id', async (req, res) => {
    try {
        const { status, notes, date, timeSlot, sessionType, confirmationNote } = req.body;

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (notes !== undefined) appointment.notes = notes;
        if (status) appointment.status = status;
        if (date) appointment.date = new Date(date);
        if (timeSlot) appointment.timeSlot = timeSlot;
        if (sessionType) appointment.sessionType = sessionType;
        if (confirmationNote !== undefined) appointment.confirmationNote = confirmationNote;

        await appointment.save();

        // Auto-create PatientRecord when appointment is confirmed
        if (status === 'confirmed' && appointment.counsellorId && appointment.userId) {
            try {
                await PatientRecord.findOneAndUpdate(
                    {
                        counsellorId: appointment.counsellorId,
                        patientId: appointment.userId
                    },
                    {
                        $setOnInsert: {
                            counsellorId: appointment.counsellorId,
                            patientId: appointment.userId,
                            riskLevel: 'low',
                            progressScore: 0,
                            goalsCompleted: 0,
                            totalGoals: 3,
                            currentMood: 'unknown',
                            isActive: true,
                            createdAt: new Date()
                        },
                        $set: { isActive: true, updatedAt: new Date() },
                        $inc: { totalSessions: 1 }
                    },
                    { upsert: true, new: true }
                );
                console.log(`[Appointment confirmed] Auto-created/updated PatientRecord for patient ${appointment.userId}`);
            } catch (prErr) {
                // Non-fatal — log but don't fail the appointment update
                console.error('[PatientRecord upsert error]', prErr.message);
            }
        }

        // Populate patient info for response
        await appointment.populate('userId', 'name email phone');

        console.log(`[PUT /appointments/${req.params.id}] Status updated to ${status}`);
        res.json(appointment);
    } catch (err) {
        console.error('PUT /appointments/:id error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// DELETE /api/appointments/:id — cancel appointment
router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (err) {
        console.error('DELETE /appointments/:id error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
