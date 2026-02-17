const express = require('express');
const router = express.Router();
const OT = require('../models/OT');

// POST /api/ot/approve
router.post('/ot/approve', async (req, res) => {
  try {
    const ot = new OT(req.body);
    await ot.save();
    res.status(201).json(ot);
  } catch (err) {
    res.status(400).json({ message: 'Error approving OT' });
  }
});

module.exports = router;
