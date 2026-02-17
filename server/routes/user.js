
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// POST /api/users (create new worker/user)
router.post('/users', async (req, res) => {
  const { name, workerId, password, role } = req.body;
  if (!name || !workerId || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const created = await require('../models/User').create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err?.message });
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
