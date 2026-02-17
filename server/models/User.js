const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'worker'], required: true },
  // email is now optional (remove required)
  email: { type: String, unique: true },
  password: { type: String, required: true },
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);