const express = require('express');
const Issue = require('../models/Issue');

const router = express.Router();

router.get('/heatmap', async (req, res) => {
    try {
        // ✅ FIX: Removed .populate('interestedVolunteers') — that field does not
        //         exist in the Issue schema and was causing a Mongoose error/warning
        const issues = await Issue.find();

        const geojson = {
            type: 'FeatureCollection',
            features: issues.map(issue => ({
                type: 'Feature',
                geometry: issue.location,
                properties: {
                    id: issue._id,
                    title: issue.title || issue.category,
                    status: issue.status,
                    severity: issue.severity,
                    weight: issue.severity / 5,
                    category: issue.category,
                }
            }))
        };

        res.json(geojson);
    } catch (err) {
        console.error('Heatmap error:', err);
        res.status(500).json({ error: 'Failed to fetch heatmap data' });
    }
});

module.exports = router;