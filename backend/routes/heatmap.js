const express = require('express');
const Issue = require('../models/Issue');

const router = express.Router();

router.get('/api/heatmap', async (req, res) => {
    try {
        const issues = await Issue.find();
        const geojson = {
            type: 'FeatureCollection',
            features: issues.map(issue => ({
                type: 'Feature',
                geometry: issue.location,
                properties: { weight: issue.severity / 5 }
            }))
        };
        res.json(geojson);
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;