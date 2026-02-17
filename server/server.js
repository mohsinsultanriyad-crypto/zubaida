// Entry point for FASTEP WORK backend
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: '*', // For Render public access, restrict in production if needed
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Routes
app.use('/api', require('./routes'));

// --- MISSING GET ROUTES FOR FRONTEND ---
const Attendance = require('./models/Attendance');
const Advance = require('./models/Advance');
const Leave = require('./models/Leave');
const SiteFeed = require('./models/SiteFeed');

app.get('/api/attendance', async (req, res) => {
  try {
    const data = await Attendance.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance' });
  }
});

app.get('/api/advance', async (req, res) => {
  try {
    const data = await Advance.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching advances' });
  }
});

app.get('/api/leave', async (req, res) => {
  try {
    const data = await Leave.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaves' });
  }
});

app.get('/api/sitefeed', async (req, res) => {
  try {
    const data = await SiteFeed.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sitefeed' });
  }
});

app.get('/api/reports/monthly', async (req, res) => {
  try {
    // Example: aggregate monthly data (customize as needed)
    const attendance = await Attendance.find();
    const advances = await Advance.find();
    const leaves = await Leave.find();
    res.json({ attendance, advances, leaves });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching report' });
  }
});

// Server listen
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
