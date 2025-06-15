const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Technicien'], default: 'Technicien' },
  site: { type: String, default: '-' },
  status: { type: String, enum: ['actif', 'inactif', 'verrouillé'], default: 'actif' },
  phone: { type: String },
  bio: { type: String },
  lastLogin: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);