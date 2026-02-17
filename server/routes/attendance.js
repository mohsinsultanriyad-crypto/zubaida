const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// POST /api/attendance
router.post('/attendance', async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ message: 'Error saving attendance' });
  }
});

module.exports = router;
