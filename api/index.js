const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection (Cached for serverless)
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is missing in environment variables');
    }

    const client = await mongoose.connect(process.env.MONGODB_URI);
    cachedDb = client;
    return client;
}

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

// Use existing models or create new ones to avoid overwriting in serverless hot-reload
const MoodLog = mongoose.models.MoodLog || mongoose.model('MoodLog', MoodLogSchema);
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

app.get('/', (req, res) => {
    res.send('MindConnect API is running (Vercel + MongoDB)');
});

app.get('/api', (req, res) => {
    res.send('MindConnect API is running (Vercel + MongoDB)');
});

app.post('/api/sync', async (req, res) => {
    await connectToDatabase();
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
    await connectToDatabase();
    try {
        const moodLogs = await MoodLog.find().sort({ timestamp: -1 });
        const appointments = await Appointment.find().sort({ date: 1 });
        res.json({ moodLogs, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching data', error: error.message });
    }
});

module.exports = app;
