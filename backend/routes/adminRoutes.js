const express = require('express');
const router = express.Router();

// Admin route
router.get('/', (req, res) => {
  res.send('Admin Dashboard');
});

module.exports = router;