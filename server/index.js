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
  'http://localhost:5173',                  // Vite Localhost
  'http://localhost:3000',                  // Standard React Localhost (just in case)
  'https://mind-connect-web-app.vercel.app' // YOUR VERCEL FRONTEND URL
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

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const MoodLogSchema = new mongoose.Schema({
    mood: String,
    note: String,
    timestamp: { type: Date, default: Date.now },
    userId: String
});

const AppointmentSchema = new mongoose.Schema({
    title: String,
    date: Date,
    doctor: String,
    notes: String,
    userId: String
});

const MoodLog = mongoose.model('MoodLog', MoodLogSchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);

// --- API ROUTES START HERE ---

// Auth Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/counsellor', require('./routes/counsellor'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/notes', require('./routes/notes'));

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