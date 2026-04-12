const express = require('express');
const Issue = require('../models/Issue');

const router = express.Router();

// routes/heatmap.js
router.get('/api/heatmap', async (req, res) => {
    try {
        // Hum volunteers ko bhi populate karenge taaki frontend pe dikha sakein
        const issues = await Issue.find().populate('interestedVolunteers'); 
        const geojson = {
            type: 'FeatureCollection',
            features: issues.map(issue => ({
                type: 'Feature',
                geometry: issue.location,
                properties: { 
                    id: issue._id,
                    title: issue.title,
                    status: issue.status,
                    severity: issue.severity,
                    weight: issue.severity / 5,
                    // Interested volunteers ka data stringify karke bhej rahe hain properties mein
                    volunteers: JSON.stringify(issue.interestedVolunteers || [])
                }
            }))
        };
        res.json(geojson);
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;