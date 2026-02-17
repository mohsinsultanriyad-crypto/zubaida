
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// POST /api/users (validate workerId, set monthlySalary default)
router.post('/users', async (req, res) => {
  try {
    console.log("==== CREATE USER REQUEST START ====");
    console.log("Incoming body:", JSON.stringify(req.body, null, 2));

    if (!req.body.workerId) {
      return res.status(400).json({ message: "workerId is required" });
    }

    // Set default email if missing or empty
    if (!req.body.email || typeof req.body.email !== 'string' || req.body.email.trim() === '') {
      req.body.email = `${req.body.workerId}@fastep.local`.toLowerCase();
    }

    // Ensure monthlySalary is set to 0 if missing or not a number
    if (req.body.monthlySalary === undefined || req.body.monthlySalary === null || isNaN(Number(req.body.monthlySalary))) {
      req.body.monthlySalary = 0;
    }

    const user = await User.create(req.body);

    console.log("User saved successfully:", user);
    console.log("==== CREATE USER SUCCESS ====");

    res.status(201).json(user);

  } catch (err) {
    console.error("==== CREATE USER ERROR ====");
    console.error(err);
    console.error("==== ERROR END ====");

    res.status(500).json({
      message: "User creation failed",
      error: err.message,
      stack: err.stack
    });
  }
});

// POST /api/login (FASTEP two-tier logic)
router.post('/login', async (req, res) => {
  const { email, password, mode } = req.body;
  const identifier = email;
  const adminEnvId = process.env.ADMIN_ID || 'FSA101';
  const adminEnvPass = process.env.ADMIN_PASSWORD || 'password123';
  try {
    let loginMode = mode;
    if (!loginMode) {
      if (identifier && identifier.startsWith('FSA')) loginMode = 'admin';
      else if (identifier && identifier.startsWith('FS')) loginMode = 'worker';
    }
    if (loginMode === 'admin') {
      // Admin login: check env vars or fallback
      if (identifier === adminEnvId && password === adminEnvPass) {
        return res.json({
          user: { id: identifier, name: 'Admin', role: 'admin' },
          token: 'session-token'
        });
      } else {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
    } else if (loginMode === 'worker') {
      // Worker login: try workerId, id, employeeId, code
      let user = await User.findOne({ workerId: identifier });
      if (!user) user = await User.findOne({ id: identifier });
      if (!user) user = await User.findOne({ employeeId: identifier });
      if (!user) user = await User.findOne({ code: identifier });
      if (!user) return res.status(401).json({ message: 'Invalid worker credentials' });
      // Accept plain or bcrypt password
      let isMatch = false;
      if (user.password) {
        if (user.password === password) isMatch = true;
        else try { isMatch = await require('bcryptjs').compare(password, user.password); } catch {}
      }
      if (!isMatch) return res.status(401).json({ message: 'Invalid worker credentials' });
      return res.json({
        user: { id: user.workerId || user.id, name: user.name, role: 'worker' },
        token: 'session-token'
      });
    } else {
      return res.status(401).json({ message: 'Invalid login mode' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
