const mongoose = require('mongoose');

const UserResourceProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    isBookmarked: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date }
}, {
    // One record per user+resource pair
    indexes: [{ unique: true, fields: ['userId', 'resourceId'] }]
});

UserResourceProgressSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

module.exports = mongoose.model('UserResourceProgress', UserResourceProgressSchema);
