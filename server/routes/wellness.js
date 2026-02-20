const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const JournalEntry = mongoose.model('JournalEntry');
const WellnessGoal = mongoose.model('WellnessGoal');
const BreathingSession = mongoose.model('BreathingSession');

// ─────────────────────────────────────────────
//  JOURNAL ENTRIES
// ─────────────────────────────────────────────

// POST /api/wellness/journal — save entry
router.post('/journal', async (req, res) => {
    try {
        const { userId, content, promptTitle, promptText, wordCount, shareWithCounsellor } = req.body;
        if (!userId || !content) return res.status(400).json({ message: 'userId and content required.' });

        const entry = new JournalEntry({ userId, content, promptTitle, promptText, wordCount, shareWithCounsellor });
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        console.error('Journal save error:', err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/wellness/journal/:userId — fetch all entries
router.get('/journal/:userId', async (req, res) => {
    try {
        const entries = await JournalEntry.find({ userId: req.params.userId }).sort({ timestamp: -1 });
        res.json(entries);
    } catch (err) {
        console.error('Journal fetch error:', err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/wellness/journal/:userId/shared — fetch entries shared with counsellor
router.get('/journal/:userId/shared', async (req, res) => {
    try {
        const entries = await JournalEntry.find({
            userId: req.params.userId,
            shareWithCounsellor: true
        }).sort({ timestamp: -1 });
        res.json(entries);
    } catch (err) {
        console.error('Journal shared fetch error:', err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/wellness/journal/:id
router.delete('/journal/:id', async (req, res) => {
    try {
        await JournalEntry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ─────────────────────────────────────────────
//  WELLNESS GOALS
// ─────────────────────────────────────────────

// POST /api/wellness/goals
router.post('/goals', async (req, res) => {
    try {
        const { userId, title, description, category, targetDate, milestones } = req.body;
        if (!userId || !title || !category) return res.status(400).json({ message: 'userId, title and category required.' });

        const goal = new WellnessGoal({ userId, title, description, category, targetDate, milestones: milestones || [] });
        await goal.save();
        res.status(201).json(goal);
    } catch (err) {
        console.error('Goal create error:', err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/wellness/goals/:userId
router.get('/goals/:userId', async (req, res) => {
    try {
        const goals = await WellnessGoal.find({ userId: req.params.userId, isActive: true }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// PUT /api/wellness/goals/:id — update progress, milestones, etc.
router.put('/goals/:id', async (req, res) => {
    try {
        const { progress, milestones, title, description, targetDate, streak } = req.body;
        const update = {};
        if (progress !== undefined) update.progress = Math.max(0, Math.min(100, progress));
        if (milestones) update.milestones = milestones;
        if (title) update.title = title;
        if (description !== undefined) update.description = description;
        if (targetDate) update.targetDate = targetDate;
        if (streak !== undefined) update.streak = streak;

        const goal = await WellnessGoal.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json(goal);
    } catch (err) {
        console.error('Goal update error:', err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/wellness/goals/:id — soft delete
router.delete('/goals/:id', async (req, res) => {
    try {
        await WellnessGoal.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ message: 'Goal deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST /api/wellness/goals/:id/milestone — add a milestone to a goal
router.post('/goals/:id/milestone', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: 'Milestone title required.' });
        const goal = await WellnessGoal.findByIdAndUpdate(
            req.params.id,
            { $push: { milestones: { title, completed: false } } },
            { new: true }
        );
        res.json(goal);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ─────────────────────────────────────────────
//  BREATHING SESSIONS
// ─────────────────────────────────────────────

// POST /api/wellness/breathing — log completed session
router.post('/breathing', async (req, res) => {
    try {
        const { userId, technique, durationMinutes, totalBreaths } = req.body;
        if (!userId || !technique) return res.status(400).json({ message: 'userId and technique required.' });

        const session = new BreathingSession({ userId, technique, durationMinutes, totalBreaths });
        await session.save();
        res.status(201).json(session);
    } catch (err) {
        console.error('Breathing save error:', err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/wellness/breathing/:userId/stats — aggregate stats
router.get('/breathing/:userId/stats', async (req, res) => {
    try {
        const sessions = await BreathingSession.find({ userId: req.params.userId }).sort({ completedAt: 1 });

        if (sessions.length === 0) {
            return res.json({ totalSessions: 0, totalBreaths: 0, streak: 0, todaySessions: 0, recentSessions: [] });
        }

        const totalSessions = sessions.length;
        const totalBreaths = sessions.reduce((s, sess) => s + (sess.totalBreaths || 0), 0);

        // Today's sessions
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todaySessions = sessions.filter(s => new Date(s.completedAt) >= todayStart).length;

        // Streak — consecutive calendar days with at least one session
        const loggedDates = new Set(sessions.map(s => {
            const d = new Date(s.completedAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }));

        let streak = 0;
        const checkDate = new Date(); checkDate.setHours(0, 0, 0, 0);
        while (true) {
            const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
            if (loggedDates.has(key)) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
            else break;
        }

        const recentSessions = sessions.slice(-5).reverse().map(s => ({
            id: s._id, technique: s.technique, durationMinutes: s.durationMinutes,
            totalBreaths: s.totalBreaths, completedAt: s.completedAt
        }));

        res.json({ totalSessions, totalBreaths, streak, todaySessions, recentSessions });
    } catch (err) {
        console.error('Breathing stats error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
