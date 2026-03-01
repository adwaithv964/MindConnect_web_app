const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
    'http://localhost:5001',
    'http://localhost:3000',
    'http://localhost:4028',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://mind-connect-web-app.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        // Allow exact matches
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Allow any Vercel preview URL
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        return callback(new Error('CORS policy: origin not allowed: ' + origin), false);
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// ─── Inline Schemas ──────────────────────────────────────────────────────────
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
    timeSlot: String,
    doctor: String,
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'confirmed', 'declined', 'cancelled'], default: 'pending' },
    notes: String,
    confirmationNote: String,
    sessionType: { type: String, enum: ['video', 'phone', 'inperson'], default: 'video' },
    insuranceProvider: String,
    policyNumber: String,
    reason: String,
    isFirstSession: Boolean,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

require('./models/ActivityLog');
require('./models/SecurityLog');

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/counsellor', require('./routes/counsellor'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/mood', require('./routes/moodLogs'));
app.use('/api/wellness', require('./routes/wellness'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/consultation', require('./routes/consultation'));

app.post('/api/sync', async (req, res) => {
    const { moodLogs, appointments } = req.body;
    try {
        let savedMoods = [], savedAppointments = [];
        if (moodLogs?.length) {
            savedMoods = await MoodLog.insertMany(moodLogs.map(({ id, ...r }) => r));
        }
        if (appointments?.length) {
            savedAppointments = await Appointment.insertMany(appointments.map(({ id, ...r }) => r));
        }
        res.json({ success: true, savedMoods, savedAppointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error syncing data', error: error.message });
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const moodLogs = await MoodLog.find().sort({ timestamp: -1 });
        const appointments = await Appointment.find().sort({ date: 1 });
        res.json({ moodLogs, appointments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Socket.io — WebRTC Signaling ────────────────────────────────────────────
// Each active consultation session gets its own socket.io room (keyed by sessionId).
// The server only RELAYS signaling messages; actual media goes peer-to-peer via WebRTC.
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
            if (origin.endsWith('.vercel.app')) return callback(null, true);
            return callback(new Error('CORS policy: origin not allowed: ' + origin), false);
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// roomId (sessionId) → Set of socket IDs currently in the room
const rooms = {};

io.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);

    // ── join-room ─────────────────────────────────────────────────────────────
    // Both the counsellor and patient call this with the shared sessionId.
    // When the SECOND person joins, the first person is notified so they can
    // initiate the WebRTC offer.
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        if (!rooms[roomId]) rooms[roomId] = new Set();
        rooms[roomId].add(socket.id);
        console.log(`[WS] ${userId} joined room ${roomId} (${rooms[roomId].size} peers)`);
        // Tell existing peers someone new has joined → they should create an offer
        socket.to(roomId).emit('user-joined', { socketId: socket.id, userId });
    });

    // ── SDP Offer (caller → callee) ──────────────────────────────────────────
    socket.on('offer', (roomId, offer) => {
        socket.to(roomId).emit('offer', offer, socket.id);
    });

    // ── SDP Answer (callee → caller) ─────────────────────────────────────────
    socket.on('answer', (roomId, answer) => {
        socket.to(roomId).emit('answer', answer);
    });

    // ── ICE Candidates (bidirectional) ───────────────────────────────────────
    socket.on('ice-candidate', (roomId, candidate) => {
        socket.to(roomId).emit('ice-candidate', candidate);
    });

    // ── Hang-up Signal ───────────────────────────────────────────────────────
    socket.on('hang-up', (roomId) => {
        socket.to(roomId).emit('hang-up');
    });

    // ── Disconnect cleanup ───────────────────────────────────────────────────
    socket.on('disconnect', () => {
        console.log(`[WS] Disconnected: ${socket.id}`);
        for (const [roomId, members] of Object.entries(rooms)) {
            if (members.has(socket.id)) {
                members.delete(socket.id);
                io.to(roomId).emit('peer-disconnected', socket.id);
                if (members.size === 0) delete rooms[roomId];
            }
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});