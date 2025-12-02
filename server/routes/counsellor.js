const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CounsellorProfile = require('../models/CounsellorProfile');

// Middleware to verify token (simplified for now)
const auth = (req, res, next) => {
    // Implement actual JWT verification here or import from middleware
    // For now, assuming request is authenticated if it reaches here (we'll add middleware in index.js or here)
    next();
};

// Get all verified counsellors (for patients)
router.get('/', async (req, res) => {
    try {
        const counsellors = await User.find({ role: 'counsellor', isVerified: true }).select('-password');
        // Fetch profiles to get details like specializations
        const counsellorIds = counsellors.map(c => c._id);
        const profiles = await CounsellorProfile.find({ userId: { $in: counsellorIds } });

        const result = counsellors.map(c => {
            const profile = profiles.find(p => p.userId.toString() === c._id.toString());
            return {
                ...c.toObject(),
                profile
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get counsellor profile (protected)
router.get('/profile/:id', async (req, res) => {
    try {
        const profile = await CounsellorProfile.findOne({ userId: req.params.id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update counsellor profile
router.put('/profile/:id', async (req, res) => {
    try {
        const { bio, specializations, availability, experienceYears, languages } = req.body;

        // Build profile object
        const profileFields = {};
        if (bio) profileFields.bio = bio;
        if (specializations) profileFields.specializations = specializations;
        if (availability) profileFields.availability = availability;
        if (experienceYears) profileFields.experienceYears = experienceYears;
        if (languages) profileFields.languages = languages;

        let profile = await CounsellorProfile.findOne({ userId: req.params.id });

        if (profile) {
            // Update
            profile = await CounsellorProfile.findOneAndUpdate(
                { userId: req.params.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profileFields.userId = req.params.id;
        profile = new CounsellorProfile(profileFields);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
