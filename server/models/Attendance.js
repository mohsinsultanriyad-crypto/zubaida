const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'leave'], required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);