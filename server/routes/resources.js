const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const UserResourceProgress = require('../models/UserResourceProgress');

// GET /api/resources?userId=xxx  — all resources with per-user status merged
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const resources = await Resource.find({ isActive: true }).sort({ createdAt: -1 });

        if (!userId) return res.json(resources);

        // Merge bookmark/completed status for this user
        const progresses = await UserResourceProgress.find({ userId });
        const progressMap = {};
        progresses.forEach(p => {
            progressMap[p.resourceId.toString()] = p;
        });

        const enriched = resources.map(r => {
            const prog = progressMap[r._id.toString()];
            return {
                ...r.toObject(),
                isBookmarked: prog?.isBookmarked || false,
                isCompleted: prog?.isCompleted || false
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/resources/progress/:userId — completed count, total, certificates
router.get('/progress/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const totalCount = await Resource.countDocuments({ isActive: true });
        const completedRecords = await UserResourceProgress.find({ userId, isCompleted: true }).populate('resourceId');

        const completedCount = completedRecords.length;

        // Compute certificates: topics where user has completed >= 3 resources
        const topicCounts = {};
        completedRecords.forEach(record => {
            const topics = record.resourceId?.topics || [];
            topics.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });

        const certificates = Object.entries(topicCounts)
            .filter(([, count]) => count >= 3)
            .map(([topic]) => topic);

        res.json({ completedCount, totalCount, certificates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/resources/bookmarks/:userId — bookmarked resources
router.get('/bookmarks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const bookmarked = await UserResourceProgress.find({ userId, isBookmarked: true }).populate('resourceId');
        const resources = bookmarked
            .filter(p => p.resourceId && p.resourceId.isActive)
            .map(p => ({ ...p.resourceId.toObject(), isBookmarked: true, isCompleted: p.isCompleted }));
        res.json(resources);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/resources/:id/bookmark — toggle bookmark
router.post('/:id/bookmark', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId is required' });

        let progress = await UserResourceProgress.findOne({ userId, resourceId: req.params.id });

        if (progress) {
            progress.isBookmarked = !progress.isBookmarked;
            await progress.save();
        } else {
            progress = await UserResourceProgress.create({
                userId,
                resourceId: req.params.id,
                isBookmarked: true,
                isCompleted: false
            });
        }

        res.json({ isBookmarked: progress.isBookmarked });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/resources/:id/complete — mark resource as completed
router.post('/:id/complete', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId is required' });

        const progress = await UserResourceProgress.findOneAndUpdate(
            { userId, resourceId: req.params.id },
            { $set: { isCompleted: true, completedAt: new Date() } },
            { upsert: true, new: true }
        );

        res.json({ isCompleted: progress.isCompleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
