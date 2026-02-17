const express = require('express');
const router = express.Router();
const Advance = require('../models/Advance');

// POST /api/advance
router.post('/advance', async (req, res) => {
  try {
    const advance = new Advance(req.body);
    await advance.save();
    res.status(201).json(advance);
  } catch (err) {
    res.status(400).json({ message: 'Error saving advance' });
  }
});

module.exports = router;
