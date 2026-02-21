const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ConsultationSession = require('../models/ConsultationSession');
const PatientRecord = require('../models/PatientRecord');
const User = require('../models/User');

const toObjectId = (id) => {
    try { return new mongoose.Types.ObjectId(id); } catch { return null; }
};

// ─── POST /api/consultation ─────────────────────────────────────────
// Start a new consultation session (or resume existing active one)
router.post('/', async (req, res) => {
    try {
        const { counsellorId, patientId, appointmentId } = req.body;

        if (!counsellorId || !patientId) {
            return res.status(400).json({ message: 'counsellorId and patientId are required' });
        }

        // Check for an existing active session between this pair
        let session = await ConsultationSession.findOne({
            counsellorId: toObjectId(counsellorId),
            patientId: toObjectId(patientId),
            status: 'active'
        });

        if (!session) {
            session = new ConsultationSession({
                counsellorId: toObjectId(counsellorId),
                patientId: toObjectId(patientId),
                appointmentId: appointmentId ? toObjectId(appointmentId) : null,
                status: 'active',
                messages: [{
                    sender: 'system',
                    senderId: 'system',
                    senderName: 'System',
                    text: 'Session started. Welcome to your consultation.',
                    timestamp: new Date()
                }]
            });
            await session.save();
            console.log(`[POST /consultation] New session ${session._id} created`);
        } else {
            console.log(`[POST /consultation] Resumed existing session ${session._id}`);
        }

        // Populate names
        const counsellor = await User.findById(counsellorId).select('name').lean();
        const patient = await User.findById(patientId).select('name').lean();

        res.status(201).json({
            session,
            counsellorName: counsellor?.name || 'Counsellor',
            patientName: patient?.name || 'Patient'
        });
    } catch (err) {
        console.error('POST /consultation error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ─── GET /api/consultation/counsellor/:counsellorId/active ───────────
// Get counsellor's active sessions (for today's active list)
router.get('/counsellor/:counsellorId/active', async (req, res) => {
    try {
        const sessions = await ConsultationSession.find({
            counsellorId: toObjectId(req.params.counsellorId),
            status: 'active'
        }).sort({ startedAt: -1 }).lean();

        const enriched = await Promise.all(sessions.map(async (s) => {
            const patient = await User.findById(s.patientId).select('name email profilePhoto').lean();
            return { ...s, patientName: patient?.name || 'Unknown', patientEmail: patient?.email || '', patientAvatar: patient?.profilePhoto || null };
        }));

        res.json(enriched);
    } catch (err) {
        console.error('GET /consultation/counsellor active error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ─── GET /api/consultation/counsellor/:counsellorId/history ─────────
// Counsellor's ended session history
router.get('/counsellor/:counsellorId/history', async (req, res) => {
    try {
        const sessions = await ConsultationSession.find({
            counsellorId: toObjectId(req.params.counsellorId),
            status: 'ended'
        }).sort({ endedAt: -1 }).limit(20).lean();

        const enriched = await Promise.all(sessions.map(async (s) => {
            const patient = await User.findById(s.patientId).select('name email profilePhoto').lean();
            const durationMs = s.endedAt && s.startedAt ? new Date(s.endedAt) - new Date(s.startedAt) : 0;
            const durationMin = Math.max(1, Math.round(durationMs / 60000));
            return {
                ...s,
                patientName: patient?.name || 'Unknown',
                patientEmail: patient?.email || '',
                patientAvatar: patient?.profilePhoto || null,
                durationMinutes: durationMin,
                messageCount: s.messages?.length || 0
            };
        }));

        res.json(enriched);
    } catch (err) {
        console.error('GET /consultation/counsellor history error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ─── GET /api/consultation/patient/:patientId/active ────────────────
// Patient's active consultation session
router.get('/patient/:patientId/active', async (req, res) => {
    try {
        const session = await ConsultationSession.findOne({
            patientId: toObjectId(req.params.patientId),
            status: 'active'
        }).sort({ startedAt: -1 }).lean();

        if (!session) return res.json(null);

        const counsellor = await User.findById(session.counsellorId).select('name email profilePhoto').lean();
        res.json({ ...session, counsellorName: counsellor?.name || 'Unknown', counsellorEmail: counsellor?.email || '', counsellorAvatar: counsellor?.profilePhoto || null });
    } catch (err) {
        console.error('GET /consultation/patient active error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ─── GET /api/consultation/patient/:patientId/history ───────────────
// Patient's session history
router.get('/patient/:patientId/history', async (req, res) => {
    try {
        const sessions = await ConsultationSession.find({
            patientId: toObjectId(req.params.patientId),
            status: 'ended'
        }).sort({ endedAt: -1 }).limit(20).lean();

        const enriched = await Promise.all(sessions.map(async (s) => {
            const counsellor = await User.findById(s.counsellorId).select('name email profilePhoto').lean();
            const durationMs = s.endedAt && s.startedAt ? new Date(s.endedAt) - new Date(s.startedAt) : 0;
            const durationMin = Math.max(1, Math.round(durationMs / 60000));
            return {
                ...s,
                counsellorName: counsellor?.name || 'Unknown',
                counsellorAvatar: counsellor?.profilePhoto || null,
                durationMinutes: durationMin,
                messageCount: s.messages?.length || 0
            };
        }));

        res.json(enriched);
    } catch (err) {
        console.error('GET /consultation/patient history error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ─── GET /api/consultation/appointment/:appointmentId ───────────────
// Find session by appointment
router.get('/appointment/:appointmentId', async (req, res) => {
    try {
        const session = await ConsultationSession.findOne({
            appointmentId: toObjectId(req.params.appointmentId)
        }).lean();
        if (!session) return res.json(null);
        res.json(session);
    } catch (err) {
        console.error('GET /consultation/appointment error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ─── GET /api/consultation/:sessionId ───────────────────────────────
// Get session by ID (full data incl. messages)
router.get('/:sessionId', async (req, res) => {
    try {
        const session = await ConsultationSession.findById(req.params.sessionId).lean();
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const counsellor = await User.findById(session.counsellorId).select('name profilePhoto').lean();
        const patient = await User.findById(session.patientId).select('name profilePhoto').lean();

        res.json({
            ...session,
            counsellorName: counsellor?.name || 'Counsellor',
            patientName: patient?.name || 'Patient',
            counsellorAvatar: counsellor?.profilePhoto || null,
            patientAvatar: patient?.profilePhoto || null
        });
    } catch (err) {
        console.error('GET /consultation/:sessionId error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ─── POST /api/consultation/:sessionId/messages ─────────────────────
// Send a message
router.post('/:sessionId/messages', async (req, res) => {
    try {
        const { sender, senderId, senderName, text } = req.body;

        if (!text?.trim()) return res.status(400).json({ message: 'text is required' });
        if (!sender || !senderId) return res.status(400).json({ message: 'sender and senderId are required' });

        const session = await ConsultationSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.status === 'ended') return res.status(400).json({ message: 'Session has ended' });

        const message = { sender, senderId, senderName: senderName || sender, text: text.trim(), timestamp: new Date() };
        session.messages.push(message);
        await session.save();

        const newMsg = session.messages[session.messages.length - 1];
        res.status(201).json(newMsg);
    } catch (err) {
        console.error('POST /consultation/:sessionId/messages error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ─── PUT /api/consultation/:sessionId/notes ─────────────────────────
// Save session notes (counsellor only)
router.put('/:sessionId/notes', async (req, res) => {
    try {
        const { sessionNotes } = req.body;
        const session = await ConsultationSession.findByIdAndUpdate(
            req.params.sessionId,
            { $set: { sessionNotes: sessionNotes || '' } },
            { new: true }
        );
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json({ success: true, sessionNotes: session.sessionNotes });
    } catch (err) {
        console.error('PUT /consultation/:sessionId/notes error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ─── PUT /api/consultation/:sessionId/end ───────────────────────────
// End session + save optional summary; update PatientRecord.lastSessionDate
router.put('/:sessionId/end', async (req, res) => {
    try {
        const { sessionSummary, sessionNotes } = req.body;

        const session = await ConsultationSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        session.status = 'ended';
        session.endedAt = new Date();
        if (sessionSummary !== undefined) session.sessionSummary = sessionSummary;
        if (sessionNotes !== undefined) session.sessionNotes = sessionNotes;

        // Add system end message
        session.messages.push({
            sender: 'system',
            senderId: 'system',
            senderName: 'System',
            text: 'Session ended by counsellor.',
            timestamp: new Date()
        });

        await session.save();

        // Update PatientRecord
        try {
            await PatientRecord.findOneAndUpdate(
                { counsellorId: session.counsellorId, patientId: session.patientId },
                {
                    $set: { lastSessionDate: session.endedAt, updatedAt: new Date() },
                    $inc: { totalSessions: 1 }
                },
                { upsert: false }
            );
        } catch (prErr) {
            console.error('[PatientRecord update during session end]', prErr.message);
        }

        console.log(`[PUT /consultation/${req.params.sessionId}/end] Session ended`);
        res.json({ success: true, session });
    } catch (err) {
        console.error('PUT /consultation/:sessionId/end error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
