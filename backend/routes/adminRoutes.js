const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
router.get('/', (req, res) => {
  res.send('Admin Dashboard');
});
// Admin: Get all issues
router.get("/issues", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;