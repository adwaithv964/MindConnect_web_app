const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
// const path = require('path'); // <--- REMOVE THIS (Not needed for API-only backend)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- 1. UPDATE CORS CONFIGURATION HERE ---
const allowedOrigins = [
    'http://localhost:5001',                  // Backend
    'http://localhost:3000',                  // React default
    'http://localhost:4028',
    'http://localhost:5173',                  // Vite Dev
    'http://localhost:4173',                  // Vite Preview
    'https://mind-connect-web-app.vercel.app' // Vercel Frontend
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const MoodLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    moodId: { type: Number, required: true, min: 1, max: 5 },
    moodLabel: { type: String },
    moodEmoji: { type: String },
    intensity: { type: Number, default: 50, min: 0, max: 100 },
    notes: { type: String, default: '' },
    factors: [{ type: String }],
    shareWithCounsellor: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const AppointmentSchema = new mongoose.Schema({
    title: String,
    date: Date,
    timeSlot: String, // e.g., "9:00 AM"
    doctor: String, // Keep for backward compatibility or display name
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'confirmed', 'declined', 'cancelled'], default: 'pending' },
    notes: String,
    confirmationNote: String, // Counsellor's note when accepting/declining
    sessionType: { type: String, enum: ['video', 'phone', 'inperson'], default: 'video' },
    insuranceProvider: String,
    policyNumber: String,
    reason: String,
    isFirstSession: Boolean,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Patient ID
    createdAt: { type: Date, default: Date.now }
});

const JournalEntrySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    content: { type: String, required: true },
    promptTitle: { type: String, default: 'Free Writing' },
    promptText: { type: String, default: '' },
    wordCount: { type: Number, default: 0 },
    shareWithCounsellor: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const WellnessGoalSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    targetDate: { type: String },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    streak: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    milestones: [{
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date }
    }],
    createdAt: { type: Date, default: Date.now }
});

const BreathingSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    technique: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    totalBreaths: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now }
});

const MoodLog = mongoose.model('MoodLog', MoodLogSchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);
mongoose.model('JournalEntry', JournalEntrySchema);
mongoose.model('WellnessGoal', WellnessGoalSchema);
mongoose.model('BreathingSession', BreathingSessionSchema);

// --- API ROUTES START HERE ---

// Auth Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/counsellor', require('./routes/counsellor'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/mood', require('./routes/moodLogs'));
app.use('/api/wellness', require('./routes/wellness'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Sync endpoint
app.post('/api/sync', async (req, res) => {
    const { moodLogs, appointments } = req.body;

    try {
        let savedMoods = [];
        let savedAppointments = [];

        if (moodLogs && Array.isArray(moodLogs) && moodLogs.length > 0) {
            const moodsToInsert = moodLogs.map(({ id, ...rest }) => rest);
            savedMoods = await MoodLog.insertMany(moodsToInsert);
        }

        if (appointments && Array.isArray(appointments) && appointments.length > 0) {
            const appointmentsToInsert = appointments.map(({ id, ...rest }) => rest);
            savedAppointments = await Appointment.insertMany(appointmentsToInsert);
        }

        console.log(`Synced ${savedMoods.length} moods and ${savedAppointments.length} appointments.`);

        res.json({
            success: true,
            message: 'Data synced successfully',
            savedMoods,
            savedAppointments
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ success: false, message: 'Error syncing data', error: error.message });
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const moodLogs = await MoodLog.find().sort({ timestamp: -1 });
        const appointments = await Appointment.find().sort({ date: 1 });
        res.json({ moodLogs, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching data', error: error.message });
    }
});

// --- API ROUTES END HERE ---

// --- REMOVED STATIC FILE SERVING ---
// Since you are using Vercel (Frontend) + Render (Backend), 
// this server does NOT need to serve the React build files.
// It is purely an API now.

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});