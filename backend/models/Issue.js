const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    category: { type: String, required: true },
    severity: { type: Number, min: 1, max: 5, default: 3 },
    status: { type: String, default: 'pending', enum: ['pending', 'in-progress', 'resolved', 'open'] },
    title: { type: String },
    description: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    requiresAuthority: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
        address: { type: String }
    },
    requestedVolunteers: [{
        volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
        respondedAt: { type: Date, default: Date.now },
        approved: { type: Boolean, default: null }
    }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', default: null },
    proofUpdates: [{
        note: { type: String },
        imageUrl: { type: String },
        submittedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

IssueSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Issue', IssueSchema);