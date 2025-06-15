const mongoose = require('mongoose');

const RadioEquipmentSchema = new mongoose.Schema({
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['bbu', 'rru', 'bts', 'nodeb', 'enodeb', 'gnodeb'],
    default: 'bbu'
  },
  technology: {
    type: String,
    required: true,
    enum: ['2G', '3G', '4G', '5G', 'multi'],
    default: 'multi'
  },
  status: {
    type: String,
    required: true,
    enum: ['operational', 'maintenance', 'faulty', 'inactive'],
    default: 'operational'
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
RadioEquipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RadioEquipment', RadioEquipmentSchema); 