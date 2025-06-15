const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['macro', 'micro'],
    default: 'macro'
  },
  type: {
    type: String,
    required: true,
    enum: ['indoor', 'outdoor'],
    default: 'outdoor'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'maintenance', 'inactive', 'archived'],
    default: 'active'
  },
  technologies: {
    type: [String],
    required: true,
    default: ['2G', '3G']
  },
  lastMaintenance: {
    type: String,
    default: null
  },
  equipmentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
SiteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Site', SiteSchema);