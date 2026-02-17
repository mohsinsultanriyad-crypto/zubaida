const mongoose = require('mongoose');

const OTSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
  approved: { type: Boolean, default: false },
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('OT', OTSchema);