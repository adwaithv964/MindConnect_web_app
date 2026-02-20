const mongoose = require('mongoose');

const AiDiscoveryCacheSchema = new mongoose.Schema({
    query: { type: String, required: true, unique: true, lowercase: true, trim: true },
    results: [{ type: mongoose.Schema.Types.Mixed }],
    createdAt: { type: Date, default: Date.now, expires: 86400 } // TTL: 24 hours
});

module.exports = mongoose.model('AiDiscoveryCache', AiDiscoveryCacheSchema);
