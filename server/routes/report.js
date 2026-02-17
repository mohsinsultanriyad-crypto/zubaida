const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const OT = require('../models/OT');
const Advance = require('../models/Advance');
const Leave = require('../models/Leave');

// GET /api/reports/monthly
router.get('/reports/monthly', async (req, res) => {
  try {
    // Example: aggregate monthly data (customize as needed)
    const attendance = await Attendance.find();
    const ot = await OT.find();
    const advances = await Advance.find();
    const leaves = await Leave.find();
    res.json({ attendance, ot, advances, leaves });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching report' });
  }
});

module.exports = router;
