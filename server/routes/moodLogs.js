const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const MoodLog = mongoose.model('MoodLog');

// POST /api/mood — save a new mood entry
router.post('/', async (req, res) => {
    try {
        const { userId, moodId, moodLabel, moodEmoji, intensity, notes, factors, shareWithCounsellor } = req.body;

        if (!userId || !moodId) {
            return res.status(400).json({ message: 'userId and moodId are required.' });
        }

        const entry = new MoodLog({
            userId,
            moodId,
            moodLabel,
            moodEmoji,
            intensity: intensity ?? 50,
            notes: notes || '',
            factors: factors || [],
            shareWithCounsellor: shareWithCounsellor || false,
            timestamp: new Date()
        });

        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        console.error('Mood save error:', err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/mood/:userId — fetch all mood entries for a user
router.get('/:userId', async (req, res) => {
    try {
        const logs = await MoodLog.find({ userId: req.params.userId }).sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        console.error('Mood fetch error:', err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/mood/:userId/stats — computed analytics
router.get('/:userId/stats', async (req, res) => {
    try {
        const logs = await MoodLog.find({ userId: req.params.userId }).sort({ timestamp: 1 });

        if (logs.length === 0) {
            return res.json({
                averageMood: 0,
                positiveDaysPercent: 0,
                streak: 0,
                topFactors: [],
                weekdayAverages: {},
                trend: 'neutral'
            });
        }

        // Average mood
        const averageMood = (logs.reduce((sum, l) => sum + l.moodId, 0) / logs.length).toFixed(1);

        // Positive days (mood >= 4)
        const positiveDays = logs.filter(l => l.moodId >= 4).length;
        const positiveDaysPercent = Math.round((positiveDays / logs.length) * 100);

        // Streak — consecutive days up to today with at least one log
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Build a Set of logged dates (yyyy-mm-dd)
        const loggedDates = new Set(
            logs.map(l => {
                const d = new Date(l.timestamp);
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            })
        );

        let streak = 0;
        let checkDate = new Date(today);
        while (true) {
            const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
            if (loggedDates.has(key)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Top contributing factors
        const factorCount = {};
        logs.forEach(l => {
            (l.factors || []).forEach(f => {
                factorCount[f] = (factorCount[f] || 0) + 1;
            });
        });
        const topFactors = Object.entries(factorCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([factor, count]) => ({ factor, count }));

        // Average mood per weekday (0=Sun...6=Sat)
        const weekdayData = {};
        logs.forEach(l => {
            const day = new Date(l.timestamp).getDay();
            if (!weekdayData[day]) weekdayData[day] = { sum: 0, count: 0 };
            weekdayData[day].sum += l.moodId;
            weekdayData[day].count += 1;
        });
        const weekdayAverages = {};
        Object.entries(weekdayData).forEach(([day, d]) => {
            weekdayAverages[day] = parseFloat((d.sum / d.count).toFixed(2));
        });

        // Trend: compare last 7 days avg vs previous 7 days avg
        const now = Date.now();
        const last7 = logs.filter(l => now - new Date(l.timestamp).getTime() <= 7 * 86400000);
        const prev7 = logs.filter(l => {
            const age = now - new Date(l.timestamp).getTime();
            return age > 7 * 86400000 && age <= 14 * 86400000;
        });

        let trend = 'neutral';
        if (last7.length > 0 && prev7.length > 0) {
            const last7Avg = last7.reduce((s, l) => s + l.moodId, 0) / last7.length;
            const prev7Avg = prev7.reduce((s, l) => s + l.moodId, 0) / prev7.length;
            const diff = last7Avg - prev7Avg;
            if (diff >= 0.5) trend = 'improving';
            else if (diff <= -0.5) trend = 'declining';
        }

        // Time-of-day breakdown
        const timeSlots = { Morning: { sum: 0, count: 0 }, Afternoon: { sum: 0, count: 0 }, Evening: { sum: 0, count: 0 }, Night: { sum: 0, count: 0 } };
        logs.forEach(l => {
            const h = new Date(l.timestamp).getHours();
            const slot = h >= 5 && h < 12 ? 'Morning' : h >= 12 && h < 17 ? 'Afternoon' : h >= 17 && h < 21 ? 'Evening' : 'Night';
            timeSlots[slot].sum += l.moodId;
            timeSlots[slot].count++;
        });
        const timeOfDay = {};
        Object.entries(timeSlots).forEach(([slot, d]) => {
            if (d.count > 0) timeOfDay[slot] = { avg: parseFloat((d.sum / d.count).toFixed(2)), count: d.count };
        });

        res.json({ averageMood, positiveDaysPercent, streak, topFactors, weekdayAverages, trend, timeOfDay });
    } catch (err) {
        console.error('Stats error:', err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/mood/:id — delete a single entry
router.delete('/:id', async (req, res) => {
    try {
        await MoodLog.findByIdAndDelete(req.params.id);
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        console.error('Delete error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
