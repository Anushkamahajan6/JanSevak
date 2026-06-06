const express = require('express');
const Issue = require('../models/Issue');
const router = express.Router();

router.get('/heatmap', async (req, res) => {
    try {
        const issues = await Issue.find().lean();
        const geojson = {
            type: 'FeatureCollection',
            features: issues.map(issue => ({
                type: 'Feature',
                geometry: issue.location,
                properties: {
                    id: issue._id,
                    title: issue.title || issue.category,
                    category: issue.category,
                    description: issue.description || '',
                    status: issue.status,
                    severity: issue.severity,
                    weight: issue.severity / 5,
                    requiresAuthority: issue.requiresAuthority || false,
                    address: issue.location?.address || '',
                    createdAt: issue.createdAt,
                    upvotes: issue.upvotes || 0,
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