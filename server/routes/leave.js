const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');

// POST /api/leave
router.post('/leave', async (req, res) => {
  try {
    const leave = new Leave(req.body);
    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ message: 'Error saving leave' });
  }
});

module.exports = router;
