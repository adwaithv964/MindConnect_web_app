const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CounsellorProfile = require('../models/CounsellorProfile');

// Register
router.post('/register', async (req, res) => {
    try {
        let { name, email, password, role, registrationNumber, stateMedicalCouncil, registrationYear } = req.body;

        // Sanitize role
        role = role ? role.trim().toLowerCase() : 'patient';

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let isVerified = true; // Default for non-counsellors
        let nmcStatus = 'unverified';

        // --- VERIFICATION LOGIC FOR COUNSELLORS ---
        if (role === 'counsellor') {
            if (!registrationNumber || !stateMedicalCouncil || !registrationYear) {
                return res.status(400).json({ message: 'Registration Number, Year, and Council are required for Doctors.' });
            }

            // Load Registry Model (lazy load or move to top)
            const DoctorRegistry = require('../models/DoctorRegistry');

            // Trim inputs for query stability
            const qRegNo = String(registrationNumber).trim();
            const qCouncil = String(stateMedicalCouncil).trim();

            const matchedRecord = await DoctorRegistry.findOne({
                registrationNumber: qRegNo,
                stateMedicalCouncil: qCouncil
            });

            if (!matchedRecord) {
                return res.status(400).json({ message: 'Verification Failed. Registration Number not found in registry.' });
            }

            // Validate Name — at least one word in common (case-insensitive, strips Dr.)
            const normalizeWords = (n) => n
                .replace(/^dr\.\s*/i, '')
                .toLowerCase()
                .replace(/[^a-z\s]/g, '')
                .split(/\s+/)
                .filter(Boolean);

            const dbWords = normalizeWords(matchedRecord.name || '');
            const inputWords = normalizeWords(name);
            const nameOverlap = inputWords.some(w => w.length > 2 && dbWords.includes(w));

            // Validate Year (optional if DB has no year)
            const dbYear = String(matchedRecord.yearOfInfo || '').trim();
            const inputYear = String(registrationYear || '').trim();
            const yearMatches = !dbYear || dbYear === inputYear;

            if (nameOverlap && yearMatches) {
                isVerified = true;
                nmcStatus = 'verified';
            } else {
                const issues = [];
                if (!nameOverlap) issues.push(`name mismatch — registry has "${matchedRecord.name}"`);
                if (!yearMatches) issues.push(`year mismatch — registry shows "${dbYear}"`);
                return res.status(400).json({ message: `Verification Failed: ${issues.join('; ')}. Please check your details.` });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            firebaseUid: req.body.firebaseUid, // Save Firebase UID
            isVerified: isVerified
        });

        await user.save();

        // If counsellor, create profile with verification details
        if (role === 'counsellor') {
            const profile = new CounsellorProfile({
                userId: user._id,
                registrationNumber,
                stateMedicalCouncil,
                registrationYear,
                nmcVerificationStatus: nmcStatus,
                verifiedName: isVerified ? name : undefined // Save the verified name
            });
            await profile.save();
        }

        // Create token
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret', // Fallback for dev
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified } });
            }
        );
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Firebase Login
router.post('/firebase-login', async (req, res) => {
    try {
        const { email, firebaseUid } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found. Please register first.' });
        }

        // Update firebaseUid if not present (for legacy users or first time sync)
        if (!user.firebaseUid && firebaseUid) {
            user.firebaseUid = firebaseUid;
            await user.save();
        }

        // Create token
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Verify NMC Registration Public (Pre-check)
router.post('/verify-nmc-public', async (req, res) => {
    try {
        const { name, registrationNumber, stateMedicalCouncil, registrationYear } = req.body;

        console.log('[verify-nmc-public] Incoming:', { name, registrationNumber, stateMedicalCouncil, registrationYear });

        if (!registrationNumber || !stateMedicalCouncil || !registrationYear || !name) {
            const missing = [];
            if (!name) missing.push('name');
            if (!registrationNumber) missing.push('registrationNumber');
            if (!stateMedicalCouncil) missing.push('stateMedicalCouncil');
            if (!registrationYear) missing.push('registrationYear');
            return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
        }

        const DoctorRegistry = require('../models/DoctorRegistry');

        const qRegNo = String(registrationNumber).trim();
        const qCouncil = String(stateMedicalCouncil).trim();

        // First try exact match, then fall back to case-insensitive
        let matchedRecord = await DoctorRegistry.findOne({
            registrationNumber: qRegNo,
            stateMedicalCouncil: qCouncil
        });

        if (!matchedRecord) {
            // Try case-insensitive council match (in case of slight variation)
            matchedRecord = await DoctorRegistry.findOne({
                registrationNumber: qRegNo,
                stateMedicalCouncil: { $regex: new RegExp('^' + qCouncil.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
            });
        }

        if (!matchedRecord) {
            console.log(`[verify-nmc-public] No record for Reg="${qRegNo}" Council="${qCouncil}"`);
            return res.status(400).json({
                message: `Verification Failed. Registration number "${qRegNo}" not found in the ${qCouncil} registry. Please double-check the number and council.`
            });
        }

        console.log('[verify-nmc-public] Found record:', { name: matchedRecord.name, yearOfInfo: matchedRecord.yearOfInfo });

        // --- Fuzzy Name Matching ---
        const normalizeWords = (n) => n
            .replace(/^dr\.\s*/i, '')
            .toLowerCase()
            .replace(/[^a-z\s]/g, '')
            .split(/\s+/)
            .filter(Boolean);

        const dbWords = normalizeWords(matchedRecord.name || '');
        const inputWords = normalizeWords(name);

        // At least ONE word from the input must appear in the DB name
        const nameOverlap = inputWords.some(w => w.length > 2 && dbWords.includes(w));

        // --- Year Matching ---
        const dbYear = String(matchedRecord.yearOfInfo || '').trim();
        const inputYear = String(registrationYear || '').trim();

        // Year passes if: DB has no year stored, OR years match
        const yearMatches = !dbYear || dbYear === inputYear;

        if (nameOverlap && yearMatches) {
            return res.json({ success: true, message: 'Verification Successful' });
        }

        // Give helpful feedback about what failed
        const issues = [];
        if (!nameOverlap) {
            issues.push(`name mismatch — registry has "${matchedRecord.name}"`);
        }
        if (!yearMatches) {
            issues.push(`year mismatch — registry shows "${dbYear}"`);
        }
        console.log('[verify-nmc-public] Mismatch:', issues.join('; '));
        return res.status(400).json({
            message: `Verification Failed: ${issues.join('; ')}. Please check your details.`
        });

    } catch (err) {
        console.error('Verification Error:', err.message);
        res.status(500).send('Server Error');
    }
});


// Delete Account
router.delete('/delete-account', async (req, res) => {
    try {
        // Simple Token Verification Middleware Logic
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const userId = decoded.user.id;

        // Delete Profile if exists (Counsellor)
        await CounsellorProfile.findOneAndDelete({ userId: userId });

        // Delete User
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete Account Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
