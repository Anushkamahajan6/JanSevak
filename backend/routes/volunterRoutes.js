const express = require('express');
const router = express.Router();

// Volunteer route
router.get('/', (req, res) => {
  res.send('Volunteer Dashboard');
});

module.exports = router;