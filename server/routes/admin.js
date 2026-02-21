const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/User');
const CounsellorProfile = require('../models/CounsellorProfile');
const PatientRecord = require('../models/PatientRecord');
const ActivityLog = require('../models/ActivityLog');
const SecurityLog = require('../models/SecurityLog');

// ─── Admin Auth Middleware ────────────────────────────────────────────────────
const adminAuth = (req, res, next) => {
    const token = req.header('x-admin-token') || req.header('authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No admin token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        if (decoded.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        req.adminUser = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// ─── Helper: Get IP & UA ─────────────────────────────────────────────────────
const getClientInfo = (req) => ({
    ipAddress: req.ip || req.connection?.remoteAddress || '',
    userAgent: req.headers['user-agent'] || ''
});

// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { ipAddress, userAgent } = getClientInfo(req);

        const user = await User.findOne({ email: email?.toLowerCase().trim() });

        if (!user || user.role !== 'admin') {
            await SecurityLog.create({
                userEmail: email || '',
                event: 'ADMIN_LOGIN_FAILED',
                success: false,
                severity: 'warning',
                details: user ? 'User is not an admin' : 'User not found',
                ipAddress,
                userAgent
            });
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await SecurityLog.create({
                userId: user._id.toString(),
                userName: user.name,
                userEmail: user.email,
                event: 'ADMIN_LOGIN_FAILED',
                success: false,
                severity: 'warning',
                details: 'Incorrect password',
                ipAddress,
                userAgent
            });
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const payload = { user: { id: user._id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

        // Log successful admin login
        await SecurityLog.create({
            userId: user._id.toString(),
            userName: user.name,
            userEmail: user.email,
            event: 'ADMIN_LOGIN_SUCCESS',
            success: true,
            severity: 'info',
            details: 'Admin logged in',
            ipAddress,
            userAgent
        });

        await ActivityLog.create({
            userId: user._id.toString(),
            userRole: 'admin',
            userName: user.name,
            userEmail: user.email,
            action: 'ADMIN_LOGIN',
            category: 'auth',
            details: 'Admin panel login',
            ipAddress,
            userAgent
        });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Admin login error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const Appointment = mongoose.model('Appointment');
        const MoodLog = mongoose.model('MoodLog');
        const JournalEntry = mongoose.model('JournalEntry');
        const BreathingSession = mongoose.model('BreathingSession');

        const now = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalUsers, totalPatients, totalCounsellors, totalAdmins,
            totalAppointments, pendingAppointments, confirmedAppointments,
            totalMoodLogs, moodLogsToday, totalJournalEntries,
            totalBreathingSessions, newUsersToday, newUsersThisWeek,
            activityLogsTotal, securityAlertsCount
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'patient' }),
            User.countDocuments({ role: 'counsellor' }),
            User.countDocuments({ role: 'admin' }),
            Appointment.countDocuments(),
            Appointment.countDocuments({ status: 'pending' }),
            Appointment.countDocuments({ status: 'confirmed' }),
            MoodLog.countDocuments(),
            MoodLog.countDocuments({ timestamp: { $gte: todayStart, $lte: todayEnd } }),
            JournalEntry.countDocuments(),
            BreathingSession.countDocuments(),
            User.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            ActivityLog.countDocuments(),
            SecurityLog.countDocuments({ success: false, timestamp: { $gte: weekAgo } })
        ]);

        // Registration trend (last 30 days)
        const registrationTrend = await User.aggregate([
            { $match: { createdAt: { $gte: monthAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Appointments by status
        const appointmentsByStatus = await Appointment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Mood distribution (last 30 days)
        const moodDistribution = await MoodLog.aggregate([
            { $match: { timestamp: { $gte: monthAgo } } },
            { $group: { _id: '$moodLabel', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Daily mood logs (last 14 days)
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const dailyMoodLogs = await MoodLog.aggregate([
            { $match: { timestamp: { $gte: twoWeeksAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    count: { $sum: 1 },
                    avgMood: { $avg: '$moodId' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            overview: {
                totalUsers, totalPatients, totalCounsellors, totalAdmins,
                totalAppointments, pendingAppointments, confirmedAppointments,
                totalMoodLogs, moodLogsToday, totalJournalEntries,
                totalBreathingSessions, newUsersToday, newUsersThisWeek,
                activityLogsTotal, securityAlertsCount
            },
            charts: {
                registrationTrend,
                appointmentsByStatus,
                moodDistribution,
                dailyMoodLogs
            }
        });
    } catch (err) {
        console.error('Admin stats error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { search, role, page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;

        const query = {};
        if (role && role !== 'all') query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        // Enrich with counsellor profiles
        const counsellorIds = users.filter(u => u.role === 'counsellor').map(u => u._id);
        const profiles = counsellorIds.length > 0
            ? await CounsellorProfile.find({ userId: { $in: counsellorIds } }).lean()
            : [];
        const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

        // Enrich with activity stats — last activity per user
        const Appointment = mongoose.model('Appointment');
        const MoodLog = mongoose.model('MoodLog');

        const userIds = users.map(u => u._id.toString());

        const [lastMoods, aptCounts] = await Promise.all([
            MoodLog.aggregate([
                { $match: { userId: { $in: userIds } } },
                { $sort: { timestamp: -1 } },
                { $group: { _id: '$userId', lastMood: { $first: '$moodLabel' }, lastActivity: { $first: '$timestamp' }, moodCount: { $sum: 1 } } }
            ]),
            Appointment.aggregate([
                { $match: { $or: [{ userId: { $in: users.map(u => u._id) } }, { counsellorId: { $in: users.map(u => u._id) } }] } },
                { $group: { _id: '$userId', count: { $sum: 1 } } }
            ])
        ]);

        const moodMap = new Map(lastMoods.map(m => [m._id, m]));
        const aptMap = new Map(aptCounts.map(a => [a._id?.toString(), a.count]));

        const enriched = users.map(u => ({
            ...u,
            profile: profileMap.get(u._id.toString()) || null,
            moodStats: moodMap.get(u._id.toString()) || null,
            appointmentCount: aptMap.get(u._id.toString()) || 0
        }));

        res.json({ users: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        console.error('Admin get users error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── PUT /api/admin/users/:id ─────────────────────────────────────────────────
router.put('/users/:id', adminAuth, async (req, res) => {
    try {
        const { role, isVerified, isPatientVerified, name, phone } = req.body;
        const { ipAddress, userAgent } = getClientInfo(req);

        const existing = await User.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'User not found' });

        const updateFields = {};
        if (role) updateFields.role = role;
        if (isVerified !== undefined) updateFields.isVerified = isVerified;
        if (isPatientVerified !== undefined) updateFields.isPatientVerified = isPatientVerified;
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        // Log the admin action
        const changes = Object.entries(updateFields).map(([k, v]) => `${k}: ${existing[k]} → ${v}`).join(', ');
        await ActivityLog.create({
            userId: req.adminUser.id,
            userRole: 'admin',
            action: 'ADMIN_USER_UPDATE',
            category: 'admin',
            details: `Updated user ${existing.email}: ${changes}`,
            metadata: { targetUserId: req.params.id, changes: updateFields },
            ipAddress,
            userAgent
        });

        if (role && role !== existing.role) {
            await SecurityLog.create({
                userId: req.adminUser.id,
                event: 'ROLE_CHANGE',
                success: true,
                severity: 'warning',
                details: `Role changed for ${existing.email}: ${existing.role} → ${role}`,
                ipAddress,
                userAgent
            });
        }

        res.json(updated);
    } catch (err) {
        console.error('Admin update user error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const { ipAddress, userAgent } = getClientInfo(req);
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const Appointment = mongoose.model('Appointment');
        const MoodLog = mongoose.model('MoodLog');
        const JournalEntry = mongoose.model('JournalEntry');
        const WellnessGoal = mongoose.model('WellnessGoal');
        const BreathingSession = mongoose.model('BreathingSession');

        // Cascade delete
        await Promise.all([
            CounsellorProfile.deleteMany({ userId: req.params.id }),
            PatientRecord.deleteMany({ $or: [{ patientId: req.params.id }, { counsellorId: req.params.id }] }),
            Appointment.deleteMany({ $or: [{ userId: user._id }, { counsellorId: user._id }] }),
            MoodLog.deleteMany({ userId: req.params.id }),
            JournalEntry.deleteMany({ userId: req.params.id }),
            WellnessGoal.deleteMany({ userId: req.params.id }),
            BreathingSession.deleteMany({ userId: req.params.id }),
        ]);

        await User.findByIdAndDelete(req.params.id);

        await SecurityLog.create({
            userId: req.adminUser.id,
            event: 'ACCOUNT_DELETED',
            success: true,
            severity: 'critical',
            details: `Admin deleted user: ${user.email} (${user.role})`,
            ipAddress,
            userAgent
        });

        await ActivityLog.create({
            userId: req.adminUser.id,
            userRole: 'admin',
            action: 'ADMIN_USER_DELETE',
            category: 'admin',
            details: `Deleted user ${user.name} (${user.email}, ${user.role})`,
            metadata: { deletedUserId: req.params.id, deletedEmail: user.email },
            ipAddress,
            userAgent
        });

        res.json({ message: `User ${user.email} deleted successfully with all associated data` });
    } catch (err) {
        console.error('Admin delete user error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── GET /api/admin/activity-logs ─────────────────────────────────────────────
router.get('/activity-logs', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50, role, action, userId, from, to } = req.query;
        const query = {};

        if (role && role !== 'all') query.userRole = role;
        if (action) query.action = { $regex: action, $options: 'i' };
        if (userId) query.userId = userId;
        if (from || to) {
            query.timestamp = {};
            if (from) query.timestamp.$gte = new Date(from);
            if (to) query.timestamp.$lte = new Date(to);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            ActivityLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)).lean(),
            ActivityLog.countDocuments(query)
        ]);

        res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        console.error('Admin activity logs error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── GET /api/admin/security-logs ────────────────────────────────────────────
router.get('/security-logs', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50, event, success, severity, from, to } = req.query;
        const query = {};

        if (event) query.event = { $regex: event, $options: 'i' };
        if (success !== undefined && success !== '') query.success = success === 'true';
        if (severity) query.severity = severity;
        if (from || to) {
            query.timestamp = {};
            if (from) query.timestamp.$gte = new Date(from);
            if (to) query.timestamp.$lte = new Date(to);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            SecurityLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)).lean(),
            SecurityLog.countDocuments(query)
        ]);

        res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        console.error('Admin security logs error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── GET /api/admin/appointments ──────────────────────────────────────────────
router.get('/appointments', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 30, status, search } = req.query;
        const Appointment = mongoose.model('Appointment');

        const query = {};
        if (status && status !== 'all') query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .populate('userId', 'name email phone profilePhoto')
                .populate('counsellorId', 'name email profilePhoto')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Appointment.countDocuments(query)
        ]);

        // Filter by search (patient name) after populate
        let filtered = appointments;
        if (search) {
            const s = search.toLowerCase();
            filtered = appointments.filter(a =>
                a.userId?.name?.toLowerCase().includes(s) ||
                a.userId?.email?.toLowerCase().includes(s) ||
                a.counsellorId?.name?.toLowerCase().includes(s)
            );
        }

        res.json({ appointments: filtered, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        console.error('Admin appointments error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── GET /api/admin/mood-stats ────────────────────────────────────────────────
router.get('/mood-stats', adminAuth, async (req, res) => {
    try {
        const MoodLog = mongoose.model('MoodLog');
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalMoods,
            moodByLabel,
            moodAvgByDay,
            moodIntensityDist,
            topFactors
        ] = await Promise.all([
            MoodLog.countDocuments(),
            MoodLog.aggregate([
                { $group: { _id: '$moodLabel', count: { $sum: 1 }, avgIntensity: { $avg: '$intensity' } } },
                { $sort: { count: -1 } }
            ]),
            MoodLog.aggregate([
                { $match: { timestamp: { $gte: monthAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                        avgMoodId: { $avg: '$moodId' },
                        count: { $sum: 1 },
                        avgIntensity: { $avg: '$intensity' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            MoodLog.aggregate([
                { $bucket: { groupBy: '$intensity', boundaries: [0, 20, 40, 60, 80, 100, 101], default: 'other', output: { count: { $sum: 1 } } } }
            ]),
            MoodLog.aggregate([
                { $unwind: '$factors' },
                { $group: { _id: '$factors', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        res.json({ totalMoods, moodByLabel, moodAvgByDay, moodIntensityDist, topFactors });
    } catch (err) {
        console.error('Admin mood stats error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── POST /api/admin/log-activity ─────────────────────────────────────────────
// Called by frontend actions to log user activities
router.post('/log-activity', async (req, res) => {
    try {
        const { userId, userRole, userName, userEmail, action, category, details, metadata } = req.body;
        const { ipAddress, userAgent } = getClientInfo(req);

        await ActivityLog.create({
            userId: userId || 'anonymous',
            userRole: userRole || 'anonymous',
            userName: userName || 'Unknown',
            userEmail: userEmail || '',
            action,
            category: category || 'auth',
            details: details || '',
            metadata: metadata || {},
            ipAddress,
            userAgent
        });

        res.json({ success: true });
    } catch (err) {
        // Don't fail the calling operation if logging fails
        console.error('Activity log error:', err.message);
        res.json({ success: false });
    }
});

// ─── GET /api/admin/make-admin (TEMPORARY — delete after use) ─────────────────
// Visit: http://localhost:5001/api/admin/make-admin?secret=mindconnect-setup-2025
router.get('/make-admin', async (req, res) => {
    const { secret, email } = req.query;
    if (secret !== 'mindconnect-setup-2025') {
        return res.status(403).send('❌ Wrong secret. Add ?secret=mindconnect-setup-2025 to the URL.');
    }
    try {
        const targetEmail = (email || 'admin@mindconnect.com').toLowerCase().trim();
        const defaultPassword = 'Admin@1234';

        let user = await User.findOne({ email: targetEmail });

        if (!user) {
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            user = await User.create({
                name: 'Admin',
                email: targetEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
            });
            return res.send(`
                <h2>✅ Admin user CREATED!</h2>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Password:</strong> ${defaultPassword}</p>
                <p>Go to <a href="http://localhost:4028/admin">localhost:4028/admin</a> and log in.</p>
            `);
        }

        // Promote existing user to admin
        await User.findOneAndUpdate({ email: targetEmail }, { $set: { role: 'admin' } });
        return res.send(`
            <h2>✅ ${user.name} (${user.email}) is now an admin!</h2>
            <p>Use your existing password to log in at <a href="http://localhost:4028/admin">localhost:4028/admin</a>.</p>
        `);
    } catch (err) {
        res.status(500).send(`❌ Error: ${err.message}`);
    }
});

module.exports = router;
