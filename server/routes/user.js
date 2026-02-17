const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, workerId, username, id, adminId, password } = req.body;
  const loginValue = workerId || email || username || id || adminId;
  try {
    let user = null;
    if (loginValue) {
      user = await User.findOne({ workerId: loginValue });
      if (!user) user = await User.findOne({ email: loginValue });
      if (!user) user = await User.findOne({ adminId: loginValue });
    }
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    // Return minimal user info
    res.json({
      token: 'session-token',
      user: {
        id: user.id,
        role: user.role,
        name: user.name
      }
    });
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
