const express = require('express');
const router = express.Router();

// User route
router.get('/', (req, res) => {
  res.send('User Dashboard');
});

module.exports = router;