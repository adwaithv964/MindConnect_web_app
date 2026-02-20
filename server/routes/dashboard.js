const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const CounsellorProfile = require('../models/CounsellorProfile');

const MoodLog = mongoose.model('MoodLog');
const Appointment = mongoose.model('Appointment');
const JournalEntry = mongoose.model('JournalEntry');
const WellnessGoal = mongoose.model('WellnessGoal');
const BreathingSession = mongoose.model('BreathingSession');

// Mood label → numeric mapping (matches existing moodId scheme)
const MOOD_ID = { excellent: 5, good: 4, okay: 3, low: 2, poor: 1 };
const MOOD_LABEL_FOR = { 5: 'excellent', 4: 'good', 3: 'okay', 2: 'low', 1: 'poor' };

const dateStr = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// GET /api/dashboard/:userId
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const now = Date.now();

    try {
        // Run all DB queries in parallel
        const [moodLogs, allGoals, journalEntries, breathingSessions, appointments] = await Promise.all([
            MoodLog.find({ userId }).sort({ timestamp: -1 }).limit(14).lean(),
            WellnessGoal.find({ userId, isActive: true }).sort({ createdAt: -1 }).lean(),
            JournalEntry.find({ userId }).sort({ timestamp: -1 }).limit(3).lean(),
            BreathingSession.find({ userId }).sort({ completedAt: -1 }).lean(),
            Appointment.find({
                userId: (() => { try { return new mongoose.Types.ObjectId(userId); } catch { return userId; } })(),
                status: { $in: ['pending', 'confirmed'] },
                date: { $gte: new Date() }
            }).sort({ date: 1 }).limit(1).lean()
        ]);

        // ── TODAY'S MOOD ──────────────────────────────────────
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayLog = moodLogs.find(l => new Date(l.timestamp) >= todayStart);
        const todayMood = todayLog ? {
            mood: (todayLog.moodLabel || MOOD_LABEL_FOR[todayLog.moodId] || 'okay').toLowerCase(),
            moodLabel: todayLog.moodLabel || '',
            timestamp: new Date(todayLog.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            notes: todayLog.notes || ''
        } : null;

        // ── 7-DAY MOOD TREND ──────────────────────────────────
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
            const next = new Date(d); next.setDate(d.getDate() + 1);
            const log = moodLogs.find(l => {
                const t = new Date(l.timestamp);
                return t >= d && t < next;
            });
            last7Days.push({
                date: dateStr(d),
                mood: log ? (log.moodLabel || MOOD_LABEL_FOR[log.moodId] || 'okay').toLowerCase() : null
            });
        }

        // ── MOOD STATS ────────────────────────────────────────
        const last7Logs = moodLogs.filter(l => now - new Date(l.timestamp).getTime() <= 7 * 86400000);
        const prev7Logs = moodLogs.filter(l => {
            const age = now - new Date(l.timestamp).getTime();
            return age > 7 * 86400000 && age <= 14 * 86400000;
        });

        const avgMood = last7Logs.length
            ? parseFloat((last7Logs.reduce((s, l) => s + l.moodId, 0) / last7Logs.length).toFixed(1))
            : 0;
        const prevAvg = prev7Logs.length
            ? prev7Logs.reduce((s, l) => s + l.moodId, 0) / prev7Logs.length
            : avgMood;
        const improvementPct = prevAvg > 0 ? Math.round(((avgMood - prevAvg) / prevAvg) * 100) : 0;
        const lowDays = last7Logs.filter(l => l.moodId <= 2).length;

        // Streak — consecutive days with a log
        const loggedDates = new Set(moodLogs.map(l => {
            const d = new Date(l.timestamp);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }));
        let moodStreak = 0;
        const check = new Date(); check.setHours(0, 0, 0, 0);
        for (let i = 0; i < 365; i++) {
            const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
            if (loggedDates.has(key)) { moodStreak++; check.setDate(check.getDate() - 1); }
            else break;
        }

        // ── WELLNESS SCORE ────────────────────────────────────
        const positiveDaysPct = last7Logs.length
            ? Math.round((last7Logs.filter(l => l.moodId >= 4).length / Math.max(last7Logs.length, 7)) * 100)
            : 0;
        const moodStability = Math.min(100, Math.round(positiveDaysPct * 0.9 + 10));

        // Breathing activity score: sessions in last 7 days / 7 * 100
        const recentBreathing = breathingSessions.filter(
            s => now - new Date(s.completedAt).getTime() <= 7 * 86400000
        ).length;
        const activityLevel = Math.min(100, Math.round((recentBreathing / 7) * 100) + 30);

        const sleepQuality = 72; // placeholder
        const socialConnection = 78; // placeholder
        const overallScore = Math.round((moodStability + activityLevel + sleepQuality + socialConnection) / 4);

        // Trend vs last week's score
        const prevMoodStability = prev7Logs.length
            ? Math.min(100, Math.round((prev7Logs.filter(l => l.moodId >= 4).length / Math.max(prev7Logs.length, 7)) * 100 * 0.9 + 10))
            : moodStability;
        const prevScore = Math.round((prevMoodStability + activityLevel + sleepQuality + socialConnection) / 4);
        const scoreTrend = overallScore - prevScore;

        const wellnessScore = {
            score: overallScore,
            trend: scoreTrend,
            factors: [
                { name: 'Mood Stability', value: moodStability, icon: 'Heart' },
                { name: 'Sleep Quality', value: sleepQuality, icon: 'Moon' },
                { name: 'Activity Level', value: activityLevel, icon: 'Activity' },
                { name: 'Social Connection', value: socialConnection, icon: 'Users' }
            ]
        };

        // ── UPCOMING APPOINTMENT ──────────────────────────────
        let upcomingAppointment = null;
        if (appointments.length > 0) {
            const appt = appointments[0];
            let counsellor = { name: appt.doctor || 'Your Counsellor', specialization: '', profilePhoto: null };
            if (appt.counsellorId) {
                const [cUser, cProfile] = await Promise.all([
                    User.findById(appt.counsellorId).select('name').lean(),
                    CounsellorProfile.findOne({ userId: appt.counsellorId }).lean()
                ]);
                if (cUser) counsellor = {
                    name: cUser.name,
                    specialization: cProfile?.qualifications || (cProfile?.specializations?.[0]) || 'Licensed Counsellor',
                    profilePhoto: cProfile?.profilePhoto || null
                };
            }
            const apptDate = new Date(appt.date);
            upcomingAppointment = {
                _id: appt._id,
                counsellorName: counsellor.name,
                counsellorImage: counsellor.profilePhoto || '',
                specialization: counsellor.specialization,
                date: apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: appt.timeSlot || 'TBD',
                status: appt.status,
                sessionType: appt.sessionType || 'video'
            };
        }

        // ── JOURNAL ENTRIES ───────────────────────────────────
        const journalData = journalEntries.map(e => ({
            id: e._id,
            title: e.promptTitle || 'Journal Entry',
            date: dateStr(e.timestamp),
            preview: e.content?.slice(0, 140) + (e.content?.length > 140 ? '...' : ''),
            mood: 'neutral' // journal entries don't store mood separately
        }));

        // ── GOALS ─────────────────────────────────────────────
        const goalsData = allGoals.slice(0, 3).map(g => ({
            id: g._id,
            title: g.title,
            progress: g.progress || 0,
            completed: g.milestones?.filter(m => m.completed).length || 0,
            total: g.milestones?.length || 0,
            daysLeft: g.targetDate
                ? Math.max(0, Math.ceil((new Date(g.targetDate) - new Date()) / 86400000))
                : null,
            streak: g.streak || 0
        }));

        // ── BREATHING STATS ───────────────────────────────────
        const todayBreathing = breathingSessions.filter(
            s => new Date(s.completedAt) >= todayStart
        ).length;
        const breathingLoggedDates = new Set(breathingSessions.map(s => {
            const d = new Date(s.completedAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }));
        let breathingStreak = 0;
        const bc = new Date(); bc.setHours(0, 0, 0, 0);
        for (let i = 0; i < 365; i++) {
            const key = `${bc.getFullYear()}-${bc.getMonth()}-${bc.getDate()}`;
            if (breathingLoggedDates.has(key)) { breathingStreak++; bc.setDate(bc.getDate() - 1); }
            else break;
        }
        const breathingStats = {
            totalSessions: breathingSessions.length,
            todaySessions: todayBreathing,
            streak: breathingStreak
        };

        res.json({
            todayMood,
            moodTrend: last7Days,
            moodStats: { averageMood: avgMood, improvementPct, lowDays, streak: moodStreak },
            wellnessScore,
            upcomingAppointment,
            journalEntries: journalData,
            goals: goalsData,
            breathingStats
        });

    } catch (err) {
        console.error('[Dashboard] Error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
