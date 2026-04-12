// models/Issue.js
const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    category: { type: String, required: true },
    severity: { type: Number, min: 1, max: 5, default: 3 },
    status: { type: String, default: 'open', enum: ['open', 'pending', 'in-progress', 'resolved'] },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        },
        address: { type: String }
    },
    title: { type: String },
    description: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],

    // ✅ NEW: Volunteers who clicked "I want to help" — pending admin approval
    interestedVolunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    }],

    // ✅ NEW: The one volunteer admin approved for this issue
    assignedVolunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        default: null
    }

}, { timestamps: true });

IssueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Issue', IssueSchema);