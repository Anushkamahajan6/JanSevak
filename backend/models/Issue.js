// models/Issue.js
const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    category: { type: String, required: true },
    severity: { type: Number, min: 1, max: 5, default: 3 }, // Used for heatmap weight
    status: { type: String, default: 'open' },
    location: {
        type: {
            type: String, 
            enum: ['Point'], 
            default: 'Point' 
        },
        coordinates: {
            type: [Number], // Must be [lng, lat]
            required: true
        }
    }
}, { timestamps: true });

// This index is MANDATORY for the heatmap and proximity searches
IssueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Issue', IssueSchema);