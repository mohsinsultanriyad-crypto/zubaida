const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helpers
function normId(v) {
  return String(v || '').trim().toUpperCase();
}

// POST /api/users (create user)
router.post('/users', async (req, res) => {
  try {
    console.log("==== CREATE USER REQUEST START ====");
    console.log("Incoming body:", JSON.stringify(req.body, null, 2));

    // Validate workerId
    if (!req.body.workerId) {
      return res.status(400).json({ message: "workerId is required" });
    }

    // Normalize workerId
    req.body.workerId = normId(req.body.workerId);

    // Default role
    if (!req.body.role) req.body.role = 'worker';

    // Default email if missing/empty (prevents email_1 unique null issue)
    if (!req.body.email || typeof req.body.email !== 'string' || req.body.email.trim() === '') {
      req.body.email = `${req.body.workerId}@fastep.local`.toLowerCase();
    }

    // Ensure monthlySalary is a number
    if (req.body.monthlySalary === undefined || req.body.monthlySalary === null || isNaN(Number(req.body.monthlySalary))) {
      req.body.monthlySalary = 0;
    } else {
      req.body.monthlySalary = Number(req.body.monthlySalary);
    }

    // Optional: prevent duplicate workerId early
    const exists = await User.findOne({ workerId: req.body.workerId });
    if (exists) {
      return res.status(400).json({ message: "workerId already exists" });
    }

    const user = await User.create(req.body);

    console.log("User saved successfully:", user);
    console.log("==== CREATE USER SUCCESS ====");

    // Return without password
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json(safeUser);

  } catch (err) {
    console.error("==== CREATE USER ERROR ====");
    console.error(err);

    // Duplicate key handler
    if (err && err.code === 11000) {
      const key = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
      return res.status(400).json({ message: `Duplicate ${key}` });
    }

    return res.status(500).json({
      message: "User creation failed",
      error: err.message
    });
  } finally {
    console.log("==== ERROR/END ====");
  }
});


// POST /api/login (FASTEP two-tier logic)
router.post('/login', async (req, res) => {
  const { email, password, mode } = req.body;

  // IMPORTANT: frontend ID ko email field me bhej raha hai
  const identifier = normId(email);

  const adminEnvId = normId(process.env.ADMIN_ID || 'FSA101');
  const adminEnvPass = String(process.env.ADMIN_PASSWORD || 'password123');

  try {
    let loginMode = mode;

    // auto infer mode if missing
    if (!loginMode) {
      if (identifier.startsWith('FSA')) loginMode = 'admin';
      else if (identifier.startsWith('FS')) loginMode = 'worker';
      else loginMode = 'worker';
    }

    if (loginMode === 'admin') {
      if (identifier === adminEnvId && String(password) === adminEnvPass) {
        return res.json({
          user: { id: adminEnvId, name: 'Admin', role: 'admin' },
          token: 'session-token'
        });
      }
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // WORKER / SUPERVISOR LOGIN
    let user = await User.findOne({ workerId: identifier });
    if (!user) user = await User.findOne({ id: identifier });
    if (!user) user = await User.findOne({ employeeId: identifier });
    if (!user) user = await User.findOne({ code: identifier });

    if (!user) return res.status(401).json({ message: 'Invalid worker credentials' });

    // Password check (plain OR bcrypt)
    let isMatch = false;
    if (user.password) {
      if (user.password === password) {
        isMatch = true;
      } else {
        try {
          isMatch = await bcrypt.compare(String(password), String(user.password));
        } catch (_) {}
      }
    }

    if (!isMatch) return res.status(401).json({ message: 'Invalid worker credentials' });

    return res.json({
      user: {
        id: normId(user.workerId || user.id),
        name: user.name,
        role: user.role // <-- IMPORTANT: return DB role (worker/supervisor)
      },
      token: 'session-token'
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// DELETE /api/users/:id (delete ONE user only)
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// PATCH /api/users/:id (update ONE user only - role etc)
router.patch('/users/:id', async (req, res) => {
  try {
    const allowed = {};

    // allow specific fields only
    if (req.body.role) allowed.role = req.body.role;
    if (req.body.name !== undefined) allowed.name = req.body.name;
    if (req.body.trade !== undefined) allowed.trade = req.body.trade;
    if (req.body.phone !== undefined) allowed.phone = req.body.phone;
    if (req.body.photoUrl !== undefined) allowed.photoUrl = req.body.photoUrl;
    if (req.body.isActive !== undefined) allowed.isActive = !!req.body.isActive;
    if (req.body.iqamaExpiry !== undefined) allowed.iqamaExpiry = req.body.iqamaExpiry;
    if (req.body.passportExpiry !== undefined) allowed.passportExpiry = req.body.passportExpiry;

    if (req.body.monthlySalary !== undefined) {
      allowed.monthlySalary = isNaN(Number(req.body.monthlySalary)) ? 0 : Number(req.body.monthlySalary);
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: allowed },
      { new: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });
    return res.json(updated);

  } catch (err) {
    console.error("PATCH USER ERROR:", err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;