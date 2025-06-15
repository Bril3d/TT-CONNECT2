const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const EquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const InterventionSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  siteId: {
    type: String,
    required: true,
    trim: true
  },
  siteName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['installation', 'maintenance', 'repair', 'upgrade', 'inspection'],
    default: 'maintenance'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'archived'],
    default: 'scheduled'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  scheduledDate: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: String,
    default: '1'
  },
  assignedTechnicians: [{
    type: String,
    required: true
  }],
  observations: [{
    type: String,
    required: true
  }],
  requiredEquipment: [EquipmentSchema],
  tasks: [TaskSchema],
  createdBy: {
    type: String,
    required: true
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
InterventionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Auto-generate intervention ID if not provided
InterventionSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Find the latest intervention for this year
    const latestIntervention = await this.constructor.findOne(
      { id: new RegExp(`^INT-${currentYear}-`) },
      {},
      { sort: { 'id': -1 } }
    );
    
    let newNumber = 1;
    
    // If we found an intervention, extract the number and increment
    if (latestIntervention) {
      const parts = latestIntervention.id.split('-');
      if (parts.length === 3) {
        newNumber = parseInt(parts[2], 10) + 1;
      }
    }
    
    // Format the new ID: INT-YYYY-XXX (padded with leading zeros)
    this.id = `INT-${currentYear}-${newNumber.toString().padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Intervention', InterventionSchema); 