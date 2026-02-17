const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'worker'], required: true },
  email: { type: String, unique: true }, // optional
  password: { type: String, required: true },
  workerId: { type: String, required: true, unique: true },
  trade: { type: String, default: "" },
  monthlySalary: { type: Number, default: 0 },
  phone: { type: String, default: "" },
  photoUrl: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  iqamaExpiry: { type: String, default: "" },
  passportExpiry: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);