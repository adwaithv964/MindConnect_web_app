const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CounsellorProfile = require('../models/CounsellorProfile');
const DoctorRegistry = require('../models/DoctorRegistry');
const PatientRecord = require('../models/PatientRecord');

// Middleware to verify token (simplified for now)
const auth = (req, res, next) => {
    // Implement actual JWT verification here or import from middleware
    // For now, assuming request is authenticated if it reaches here (we'll add middleware in index.js or here)
    next();
};

// Get all verified counsellors (for patients)
router.get('/', async (req, res) => {
    try {
        // For development/demo purposes, we're fetching ALL counsellors regardless of verification status
        // In production, you should revert this to: { role: 'counsellor', isVerified: true }
        const counsellors = await User.find({ role: 'counsellor' }).select('-password');
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
// Get counsellor profile (protected)
router.get('/profile/:id', async (req, res) => {
    try {
        let profile = await CounsellorProfile.findOne({ userId: req.params.id }).populate('userId', 'name email emergencyContact');

        if (!profile) {
            // Check if user exists even if profile doesn't
            const user = await User.findById(req.params.id).select('name email emergencyContact');
            if (user) {
                return res.json({
                    userId: user,
                    verifiedName: user.name || '',
                    bio: '',
                    specializations: [],
                    experienceYears: '',
                    languages: [],
                    availability: []
                });
            }
            return res.status(404).json({ message: 'Profile not found' });
        }

        // --- SELF-HEALING: If verifiedName is missing but status is verified, fetch it ---
        if (profile.nmcVerificationStatus === 'verified' && !profile.verifiedName) {
            try {
                const DoctorRegistry = require('../models/DoctorRegistry');
                const registryRecord = await DoctorRegistry.findOne({
                    registrationNumber: profile.registrationNumber,
                    stateMedicalCouncil: profile.stateMedicalCouncil
                });

                if (registryRecord) {
                    profile.verifiedName = registryRecord.name;
                    await profile.save();
                    console.log(`Self-healed verifiedName for user ${profile.userId._id}`);
                }
            } catch (err) {
                console.error("Self-healing error:", err);
            }
        }
        // ---------------------------------------------------------------------------------

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update counsellor profile
// Update counsellor profile
router.put('/profile/:id', async (req, res) => {
    try {
        const {
            bio, specializations, availability, experienceYears, languages,
            name, email, emergencyContact, qualifications, patientCount
        } = req.body;

        // Role guard: only allow updates for counsellor accounts
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            // Fallback: check if a CounsellorProfile exists for this ID
            const profileExists = await CounsellorProfile.findOne({ userId: req.params.id });
            if (!profileExists) {
                return res.status(404).json({ message: 'User not found' });
            }
        } else if (targetUser.role && targetUser.role.toLowerCase() !== 'counsellor') {
            // Case-insensitive check; also allow if a CounsellorProfile exists (handles edge cases)
            const profileExists = await CounsellorProfile.findOne({ userId: req.params.id });
            if (!profileExists) {
                return res.status(403).json({ message: 'Forbidden: This endpoint is only for counsellor profiles.' });
            }
        }

        // Update User Table Fields — name and email are NMC-locked and cannot be changed
        const userFields = {};
        if (emergencyContact !== undefined) userFields.emergencyContact = emergencyContact;

        if (Object.keys(userFields).length > 0) {
            await User.findByIdAndUpdate(req.params.id, { $set: userFields });
        }

        // Build profile object
        const profileFields = {};
        if (bio) profileFields.bio = bio;
        if (specializations) profileFields.specializations = specializations;
        if (availability) profileFields.availability = availability;
        if (experienceYears) profileFields.experienceYears = experienceYears;
        if (languages) profileFields.languages = languages;
        if (qualifications) profileFields.qualifications = qualifications;
        if (patientCount) profileFields.patientCount = patientCount;
        if (req.body.profilePhoto) profileFields.profilePhoto = req.body.profilePhoto;

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

// Verify NMC Registration (Mock/Simulated)
router.post('/verify-nmc', async (req, res) => {
    try {
        const { userId, registrationNumber, stateMedicalCouncil, registrationYear } = req.body;

        if (!registrationNumber || !stateMedicalCouncil) {
            return res.status(400).json({ message: 'Registration number and council are required' });
        }

        // --- DATABASE VERIFICATION LOGIC ---
        let isValid = false;
        let matchedRecord = null;
        let verificationMessage = 'Verification Failed. Details not found in registry.';

        try {
            matchedRecord = await DoctorRegistry.findOne({
                registrationNumber: registrationNumber,
                stateMedicalCouncil: stateMedicalCouncil
            });

            if (matchedRecord) {
                // Validate Name (Case-insensitive, trim whitespace)
                // Remove "Dr." prefix for comparison if present in either
                const normalizeName = (n) => n.replace(/^dr\.\s*/i, '').trim().toLowerCase();
                const dbName = normalizeName(matchedRecord.name);
                const inputName = normalizeName(req.body.name || '');

                // Validate Year
                const dbYear = String(matchedRecord.yearOfInfo || '').trim();
                const inputYear = String(registrationYear || '').trim();

                if (dbName === inputName && dbYear === inputYear) {
                    isValid = true;
                    verificationMessage = 'NMC Registration Verified Successfully';
                } else {
                    isValid = false;
                    verificationMessage = 'Verification Failed. Details (Name or Year) do not match our records.';
                    if (dbName !== inputName) matchedRecord = null; // Clear if mismatch to treat as failed
                }
            }
        } catch (dbError) {
            console.error("Registry Lookup Error:", dbError);
            matchedRecord = null;
        }

        const status = isValid ? 'verified' : 'failed';

        // Update Profile
        let profile = await CounsellorProfile.findOne({ userId });
        if (!profile) {
            profile = new CounsellorProfile({ userId });
        }

        profile.registrationNumber = registrationNumber;
        profile.stateMedicalCouncil = stateMedicalCouncil;
        profile.registrationYear = registrationYear;
        profile.nmcVerificationStatus = status;
        await profile.save();

        // Update Main User Verification Status if NMC verified
        if (isValid) {
            await User.findByIdAndUpdate(userId, { isVerified: true });
        }

        res.json({
            success: true,
            status: status,
            message: verificationMessage
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/counsellor/:id/slots?date=YYYY-MM-DD
// Returns available time slots for a counsellor on a given date
router.get('/:id/slots', async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'date query param required (YYYY-MM-DD)' });
        }

        const profile = await CounsellorProfile.findOne({ userId: req.params.id });

        const dateObj = new Date(date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dateObj.getDay()];

        // Default slots (fallback)
        const defaultSlots = [
            { id: 1, time: '9:00 AM', available: true },
            { id: 2, time: '10:00 AM', available: true },
            { id: 3, time: '11:00 AM', available: true },
            { id: 4, time: '1:00 PM', available: true },
            { id: 5, time: '2:00 PM', available: true },
            { id: 6, time: '3:00 PM', available: true },
            { id: 7, time: '4:00 PM', available: true },
            { id: 8, time: '5:00 PM', available: true },
            { id: 9, time: '6:00 PM', available: true }
        ];

        if (!profile || !profile.availability || profile.availability.length === 0) {
            // No availability configured — return default slots
            return res.json({ slots: defaultSlots, day: dayName });
        }

        // Find availability for matching day
        const dayAvailability = profile.availability.find(
            a => a.day.toLowerCase() === dayName.toLowerCase()
        );

        if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
            // Counsellor not available on this day
            return res.json({ slots: [], day: dayName, message: `Not available on ${dayName}` });
        }

        // Convert HH:MM slots to human-readable 12h format
        const convertTo12h = (time24) => {
            const [h, m] = time24.split(':').map(Number);
            const period = h >= 12 ? 'PM' : 'AM';
            const hour = h % 12 || 12;
            const min = m === 0 ? '00' : m;
            return `${hour}:${min} ${period}`;
        };

        // Fetch existing appointments on this date to mark booked slots
        const Appointment = require('mongoose').model('Appointment');
        const dayStart = new Date(dateObj);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dateObj);
        dayEnd.setHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            counsellorId: req.params.id,
            date: { $gte: dayStart, $lte: dayEnd },
            status: { $nin: ['cancelled', 'declined'] }
        }).select('timeSlot');

        const bookedSlots = new Set(bookedAppointments.map(a => a.timeSlot).filter(Boolean));

        const slots = dayAvailability.slots.map((slot, index) => {
            const timeLabel = convertTo12h(slot.startTime);
            return {
                id: index + 1,
                time: timeLabel,
                startTime: slot.startTime,
                endTime: slot.endTime,
                available: !bookedSlots.has(timeLabel)
            };
        });

        res.json({ slots, day: dayName });
    } catch (err) {
        console.error('GET /counsellor/:id/slots error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// PUT /api/counsellor/:id/availability — dedicated availability update
router.put('/:id/availability', async (req, res) => {
    try {
        const { availability } = req.body;
        if (!Array.isArray(availability)) {
            return res.status(400).json({ message: 'availability must be an array' });
        }

        let profile = await CounsellorProfile.findOneAndUpdate(
            { userId: req.params.id },
            { $set: { availability } },
            { new: true, upsert: true }
        );

        console.log(`[PUT /counsellor/${req.params.id}/availability] Saved ${availability.length} days`);
        res.json({ success: true, availability: profile.availability });
    } catch (err) {
        console.error('PUT /counsellor/:id/availability error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ===== DASHBOARD ENDPOINTS =====

// GET /api/counsellor/:id/dashboard-stats
// Returns aggregate stats for the dashboard summary cards
router.get('/:id/dashboard-stats', async (req, res) => {
    try {
        const counsellorId = req.params.id;
        const Appointment = require('mongoose').model('Appointment');

        const patientRecords = await PatientRecord.find({ counsellorId, isActive: true });

        const totalPatients = patientRecords.length;
        const highRisk = patientRecords.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
        const avgProgress = totalPatients > 0
            ? Math.round(patientRecords.reduce((sum, p) => sum + (p.progressScore || 0), 0) / totalPatients)
            : 0;

        // Today's confirmed sessions
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const mongoose = require('mongoose');
        const oid = (id) => { try { return new mongoose.Types.ObjectId(id); } catch { return id; } };

        const todaysSessions = await Appointment.countDocuments({
            counsellorId: oid(counsellorId),
            date: { $gte: todayStart, $lte: todayEnd },
            status: 'confirmed'
        });

        res.json({ totalPatients, highRisk, todaysSessions, avgProgress });
    } catch (err) {
        console.error('GET /counsellor/:id/dashboard-stats error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// GET /api/counsellor/:id/patients — enriched patient list derived from confirmed appointments
router.get('/:id/patients', async (req, res) => {
    try {
        const counsellorId = req.params.id;
        const mongoose = require('mongoose');
        const Appointment = mongoose.model('Appointment');
        const oid = (id) => { try { return new mongoose.Types.ObjectId(id); } catch { return id; } };

        // Step 1: Get all confirmed appointments for this counsellor
        const confirmedAppointments = await Appointment.find({
            counsellorId: oid(counsellorId),
            status: 'confirmed'
        })
            .populate('userId', 'name email phone profilePhoto createdAt')
            .sort({ date: -1 })
            .lean();

        // Step 2: Deduplicate by patient userId (keep latest appointment per patient)
        const patientMap = new Map();
        for (const apt of confirmedAppointments) {
            if (!apt.userId || !apt.userId._id) continue;
            const pid = apt.userId._id.toString();
            if (!patientMap.has(pid)) {
                patientMap.set(pid, { user: apt.userId, aptCount: 1, latestDate: apt.date });
            } else {
                patientMap.get(pid).aptCount += 1;
            }
        }

        if (patientMap.size === 0) {
            return res.json([]);
        }

        // Step 3: Get existing PatientRecords for active patients
        const patientIds = Array.from(patientMap.keys());
        const existingRecords = await PatientRecord.find({
            counsellorId,
            patientId: { $in: patientIds },
            isActive: true
        }).lean();
        const recordMap = new Map(existingRecords.map(r => [r.patientId.toString(), r]));

        // Step 4: Auto-upsert missing PatientRecords (backfill for historical confirmations)
        const missingIds = patientIds.filter(pid => !recordMap.has(pid));
        if (missingIds.length > 0) {
            const bulkOps = missingIds.map(pid => ({
                updateOne: {
                    filter: { counsellorId, patientId: oid(pid) },
                    update: {
                        $setOnInsert: {
                            counsellorId,
                            patientId: oid(pid),
                            riskLevel: 'low',
                            progressScore: 0,
                            totalSessions: patientMap.get(pid)?.aptCount || 1,
                            goalsCompleted: 0,
                            totalGoals: 3,
                            currentMood: 'unknown',
                            isActive: true,
                            createdAt: new Date()
                        },
                        $set: { updatedAt: new Date() }
                    },
                    upsert: true
                }
            }));
            await PatientRecord.bulkWrite(bulkOps);

            // Re-fetch the newly created records
            const newRecords = await PatientRecord.find({
                counsellorId,
                patientId: { $in: missingIds }
            }).lean();
            newRecords.forEach(r => recordMap.set(r.patientId.toString(), r));
        }

        // Step 4b: Enrich currentMood from latest MoodLog for each patient
        const MoodLog = mongoose.model('MoodLog');
        const moodMap = new Map();
        if (patientIds.length > 0) {
            const latestMoods = await MoodLog.aggregate([
                { $match: { userId: { $in: patientIds } } },
                { $sort: { timestamp: -1 } },
                { $group: { _id: '$userId', moodLabel: { $first: '$moodLabel' }, moodId: { $first: '$moodId' } } }
            ]);
            const moodLabelMap = {
                'happy': 'happy', 'joy': 'happy', 'great': 'happy', 'excited': 'happy',
                'neutral': 'neutral', 'okay': 'neutral', 'ok': 'neutral', 'fine': 'neutral', 'calm': 'neutral',
                'sad': 'sad', 'depressed': 'sad', 'unhappy': 'sad', 'down': 'sad',
                'anxious': 'anxious', 'worried': 'anxious', 'nervous': 'anxious',
                'stressed': 'stressed', 'overwhelmed': 'stressed', 'frustrated': 'stressed', 'angry': 'stressed'
            };
            latestMoods.forEach(m => {
                const label = (m.moodLabel || '').toLowerCase().trim();
                const normalized = moodLabelMap[label] || (m.moodId >= 4 ? 'happy' : m.moodId >= 3 ? 'neutral' : m.moodId >= 2 ? 'sad' : 'anxious');
                moodMap.set(String(m._id), normalized);
            });
        }

        // Step 4c: Enrich progressScore + goals from WellnessGoal collection
        // WellnessGoal.userId is stored as a String, so convert ObjectIds to strings
        const WellnessGoal = mongoose.model('WellnessGoal');
        const goalProgressMap = new Map(); // pid -> { progressScore, totalGoals, goalsCompleted }
        if (patientIds.length > 0) {
            const patientIdStrings = patientIds.map(String);
            const goalAgg = await WellnessGoal.aggregate([
                { $match: { userId: { $in: patientIdStrings }, isActive: true } },
                {
                    $group: {
                        _id: '$userId',
                        avgProgress: { $avg: '$progress' },
                        totalGoals: { $sum: 1 },
                        goalsCompleted: {
                            $sum: { $cond: [{ $gte: ['$progress', 100] }, 1, 0] }
                        }
                    }
                }
            ]);
            goalAgg.forEach(g => {
                goalProgressMap.set(g._id, {
                    progressScore: Math.round(g.avgProgress || 0),
                    totalGoals: g.totalGoals || 0,
                    goalsCompleted: g.goalsCompleted || 0
                });
            });
        }

        // Step 5: Build enriched response
        const enriched = patientIds.map(pid => {
            const { user, aptCount } = patientMap.get(pid);
            const rec = recordMap.get(pid) || {};
            const realMood = moodMap.get(pid) || rec.currentMood || 'unknown';
            const goalData = goalProgressMap.get(String(pid));
            // Use live WellnessGoal data if available, else fall back to PatientRecord
            const progressScore = goalData ? goalData.progressScore : (rec.progressScore || 0);
            const totalGoals = goalData ? goalData.totalGoals : (rec.totalGoals || 3);
            const goalsCompleted = goalData ? goalData.goalsCompleted : (rec.goalsCompleted || 0);
            return {
                _id: rec._id || pid,
                patientId: pid,
                id: `PT-${String(pid).slice(-6).toUpperCase()}`,
                name: user.name || 'Unknown',
                email: user.email || '',
                phone: user.phone || '',
                avatar: user.profilePhoto || null,
                avatarAlt: `${user.name || 'Patient'} photo`,
                isOnline: false,
                currentMood: realMood,
                riskLevel: rec.riskLevel || 'low',
                progressScore,
                totalSessions: rec.totalSessions || aptCount || 1,
                goalsCompleted,
                totalGoals,
                lastSession: rec.lastSessionDate || rec.updatedAt,
                recentNotes: rec.recentNotes || '',
                riskFactors: rec.riskFactors || [],
                flaggedBy: rec.flaggedBy || null,
                createdAt: rec.createdAt || new Date()
            };
        });

        console.log(`[GET /counsellor/${counsellorId}/patients] Returning ${enriched.length} patients`);
        res.json(enriched);
    } catch (err) {
        console.error('GET /counsellor/:id/patients error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});


// POST /api/counsellor/:id/patients — add a patient to counsellor's list
router.post('/:id/patients', async (req, res) => {
    try {
        const counsellorId = req.params.id;
        const { email, patientId: directPatientId } = req.body;

        let patient;
        if (directPatientId) {
            patient = await User.findById(directPatientId).select('-password');
        } else if (email) {
            patient = await User.findOne({ email: email.toLowerCase().trim() }).select('-password');
        }

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found. Make sure they have registered an account.' });
        }

        if (patient.role === 'counsellor') {
            return res.status(400).json({ message: 'Cannot add a counsellor as a patient.' });
        }

        // Check if already linked
        const existing = await PatientRecord.findOne({ counsellorId, patientId: patient._id });
        if (existing) {
            if (!existing.isActive) {
                existing.isActive = true;
                await existing.save();
                return res.status(200).json({ message: 'Patient re-activated in your list.', record: existing });
            }
            return res.status(409).json({ message: 'Patient is already in your list.' });
        }

        const record = new PatientRecord({
            counsellorId,
            patientId: patient._id,
            riskLevel: 'low',
            progressScore: 0,
            totalSessions: 0,
            goalsCompleted: 0,
            totalGoals: 3
        });
        await record.save();

        res.status(201).json({
            _id: record._id,
            patientId: patient._id,
            id: `PT-${String(patient._id).slice(-6).toUpperCase()}`,
            name: patient.name,
            email: patient.email,
            phone: patient.phone || '',
            currentMood: 'unknown',
            riskLevel: 'low',
            progressScore: 0,
            totalSessions: 0,
            goalsCompleted: 0,
            totalGoals: 3,
            recentNotes: '',
            riskFactors: [],
            flaggedBy: null,
            lastSession: null,
            createdAt: record.createdAt
        });
    } catch (err) {
        console.error('POST /counsellor/:id/patients error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// PUT /api/counsellor/:id/patients/:patientId — update patient clinical record
router.put('/:id/patients/:patientId', async (req, res) => {
    try {
        const { counsellorId: _c, ...updateData } = req.body;
        const allowedFields = ['riskLevel', 'progressScore', 'totalSessions', 'goalsCompleted',
            'totalGoals', 'currentMood', 'recentNotes', 'riskFactors', 'flaggedBy', 'lastSessionDate'];

        const update = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) update[field] = updateData[field];
        });
        update.updatedAt = Date.now();

        const record = await PatientRecord.findOneAndUpdate(
            { counsellorId: req.params.id, patientId: req.params.patientId },
            { $set: update },
            { new: true }
        ).populate('patientId', 'name email phone');

        if (!record) return res.status(404).json({ message: 'Patient record not found' });

        res.json(record);
    } catch (err) {
        console.error('PUT /counsellor/:id/patients/:patientId error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// DELETE /api/counsellor/:id/patients/:patientId — remove patient from list
router.delete('/:id/patients/:patientId', async (req, res) => {
    try {
        const record = await PatientRecord.findOneAndUpdate(
            { counsellorId: req.params.id, patientId: req.params.patientId },
            { $set: { isActive: false, updatedAt: Date.now() } },
            { new: true }
        );
        if (!record) return res.status(404).json({ message: 'Patient record not found' });
        res.json({ message: 'Patient removed from your list', record });
    } catch (err) {
        console.error('DELETE /counsellor/:id/patients/:patientId error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// GET /api/counsellor/:id/risk-patients — get at-risk patients with factors
router.get('/:id/risk-patients', async (req, res) => {
    try {
        const counsellorId = req.params.id;
        const records = await PatientRecord.find({
            counsellorId,
            isActive: true,
            riskLevel: { $in: ['medium', 'high', 'critical'] }
        })
            .populate('patientId', 'name email profilePhoto')
            .sort({ updatedAt: -1 });

        const result = records.map(rec => ({
            _id: rec._id,
            patientId: rec.patientId?._id,
            id: `PT-${String(rec.patientId?._id).slice(-6).toUpperCase()}`,
            name: rec.patientId?.name || 'Unknown',
            avatar: rec.patientId?.profilePhoto || null,
            avatarAlt: `${rec.patientId?.name || 'Patient'} photo`,
            riskLevel: rec.riskLevel,
            riskFactors: rec.riskFactors || [],
            flaggedBy: rec.flaggedBy || null,
            lastContact: rec.updatedAt
        }));

        res.json(result);
    } catch (err) {
        console.error('GET /counsellor/:id/risk-patients error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// GET /api/counsellor/:id/upcoming — confirmed appointments for next 7 days
router.get('/:id/upcoming', async (req, res) => {
    try {
        const Appointment = require('mongoose').model('Appointment');
        const mongoose = require('mongoose');

        const oid = (id) => { try { return new mongoose.Types.ObjectId(id); } catch { return id; } };

        const now = new Date();
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const appointments = await Appointment.find({
            counsellorId: oid(req.params.id),
            status: 'confirmed',
            date: { $gte: now, $lte: next7Days }
        })
            .populate('userId', 'name email phone profilePhoto')
            .sort({ date: 1 })
            .limit(10)
            .lean();

        const enriched = appointments.map(apt => ({
            ...apt,
            id: apt._id,
            patientName: apt.userId?.name || 'Unknown',
            patientAvatar: apt.userId?.profilePhoto || null,
            patientAvatarAlt: `${apt.userId?.name || 'Patient'} photo`,
            patientId: apt.userId?._id,
            dateTime: apt.date,
            duration: 60,
            sessionType: apt.sessionType || 'video',
            notes: apt.notes || apt.reason || ''
        }));

        res.json(enriched);
    } catch (err) {
        console.error('GET /counsellor/:id/upcoming error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// GET /api/counsellor/:id/mood-trends/:patientId — mood log data for chart
router.get('/:id/mood-trends/:patientId', async (req, res) => {
    try {
        const MoodLog = require('mongoose').model('MoodLog');

        const logs = await MoodLog.find({ userId: req.params.patientId })
            .sort({ timestamp: 1 })
            .limit(30);

        // Transform to chart-friendly format
        const chartData = logs.map(log => ({
            date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            moodScore: ((log.moodId / 5) * 10).toFixed(1) * 1,
            anxietyLevel: null, // Not tracked separately yet
            stressLevel: null,
            moodLabel: log.moodLabel,
            intensity: log.intensity,
            timestamp: log.timestamp
        }));

        res.json(chartData);
    } catch (err) {
        console.error('GET /counsellor/:id/mood-trends/:patientId error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;

