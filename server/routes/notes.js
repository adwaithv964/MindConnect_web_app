const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define Schema locally for now or move to models
const ClinicalNoteSchema = new mongoose.Schema({
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ClinicalNote = mongoose.models.ClinicalNote || mongoose.model('ClinicalNote', ClinicalNoteSchema);

// Get notes for a patient (only for the counsellor)
router.get('/:patientId', async (req, res) => {
    try {
        const { counsellorId } = req.query;
        const notes = await ClinicalNote.find({
            patientId: req.params.patientId,
            counsellorId: counsellorId
        }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create note
router.post('/', async (req, res) => {
    try {
        const { counsellorId, patientId, content } = req.body;
        const note = new ClinicalNote({
            counsellorId,
            patientId,
            content
        });
        await note.save();
        res.json(note);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
