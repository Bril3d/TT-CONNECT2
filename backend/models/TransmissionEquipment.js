const mongoose = require('mongoose');

const TransmissionEquipmentSchema = new mongoose.Schema({
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
    enum: ['microwave', 'fiber', 'satellite', 'ethernet'],
    default: 'microwave'
  },
  capacity: {
    type: String,
    required: true,
    trim: true
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
TransmissionEquipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TransmissionEquipment', TransmissionEquipmentSchema); 