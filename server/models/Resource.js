const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    contentType: {
        type: String,
        enum: ['article', 'video', 'podcast', 'worksheet'],
        required: true
    },
    thumbnail: { type: String, default: '' },
    thumbnailAlt: { type: String, default: '' },
    author: { type: String, default: '' },
    duration: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    topics: [{ type: String }],
    preview: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);
