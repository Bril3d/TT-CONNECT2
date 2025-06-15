const mongoose = require('mongoose');

const UpdateSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const TicketSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    trim: true
  },
  site: {
    type: String,
    required: true,
    trim: true
  },
  siteName: {
    type: String,
    required: true,
    trim: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'in_progress', 'resolved'],
    default: 'open'
  },
  createdAt: {
    type: String,
    required: true
  },
  updates: [UpdateSchema],
  location: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Auto-generate ticket ID if not provided
TicketSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Find the latest ticket
    const latestTicket = await this.constructor.findOne(
      {},
      {},
      { sort: { 'id': -1 } }
    );
    
    let newNumber = 1000;
    
    // If we found a ticket, extract the number and increment
    if (latestTicket && latestTicket.id) {
      const parts = latestTicket.id.split('-');
      if (parts.length === 2) {
        newNumber = parseInt(parts[1], 10) + 1;
      }
    }
    
    // Format the new ID: TKT-XXXX
    this.id = `TKT-${newNumber}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Ticket', TicketSchema); 