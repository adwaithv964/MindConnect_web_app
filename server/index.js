const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path'); // <--- 1. ADD THIS IMPORT

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
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

// Sync endpoint
app.post('/api/sync', async (req, res) => {
    const { moodLogs, appointments } = req.body;

    try {
        let savedMoods = [];
        let savedAppointments = [];

        if (moodLogs && Array.isArray(moodLogs) && moodLogs.length > 0) {
            // Remove local ID before saving if needed, or let MongoDB generate _id
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


// 2. SERVE STATIC REACT FILES
// We point to '../build' because your vite.config.js said "outDir: 'build'"
app.use(express.static(path.join(__dirname, '../build')));


// 3. CATCH-ALL ROUTE (For React Router)
// If the request is not an API call, send them the React App (index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});