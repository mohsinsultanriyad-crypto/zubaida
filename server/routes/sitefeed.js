const express = require('express');
const router = express.Router();
const SiteFeed = require('../models/SiteFeed');

// Example: GET all site feeds
router.get('/sitefeed', async (req, res) => {
  try {
    const feeds = await SiteFeed.find().sort({ createdAt: -1 });
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching site feeds' });
  }
});

module.exports = router;
