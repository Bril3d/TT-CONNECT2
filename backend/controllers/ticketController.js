const Ticket = require('../models/Ticket');
const Site = require('../models/Site');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    console.log('Fetching all tickets');
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    console.log(`Fetching ticket with ID: ${req.params.id}`);
    const ticket = await Ticket.findOne({ id: req.params.id });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du ticket' });
  }
};

// Create new ticket
exports.createTicket = async (req, res) => {
  try {
    console.log('Creating ticket with data:', JSON.stringify(req.body, null, 2));
    
    // Verify site exists
    const site = await Site.findOne({ id: req.body.site });
    if (!site) {
      return res.status(404).json({ message: 'Site non trouvé' });
    }
    
    // Format current date
    const now = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Create new ticket
    const ticketData = {
      ...req.body,
      siteName: site.name, // Ensure we have the correct site name
      createdAt: now,
      createdBy: req.user.id, // This assumes the user ID is available in the request after authentication
      updates: []
    };
    
    // If ID is provided, check if it already exists
    if (ticketData.id) {
      const existingTicket = await Ticket.findOne({ id: ticketData.id });
      if (existingTicket) {
        return res.status(400).json({ message: 'Un ticket avec cet ID existe déjà' });
      }
    }
    
    const newTicket = new Ticket(ticketData);
    
    // Validate ticket data
    try {
      await newTicket.validateSync();
      console.log('Ticket validation passed');
    } catch (validationError) {
      console.error('Ticket validation error:', validationError);
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: validationError.errors 
      });
    }
    
    const savedTicket = await newTicket.save();
    console.log('Ticket saved successfully with ID:', savedTicket.id);
    
    // Create notification for managers
    const urgencyLabels = {
      high: "Élevée",
      medium: "Moyenne",
      low: "Faible"
    };
    
    const notification = new Notification({
      title: `Nouveau ticket: ${savedTicket.id}`,
      message: `Un nouveau ticket a été créé pour le site ${site.name} avec une urgence ${urgencyLabels[req.body.urgency] || req.body.urgency}: "${savedTicket.title}"`,
      role: 'Manager'
    });
    
    await notification.save();
    console.log('Notification created for managers');
    
    res.status(201).json(savedTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    
    let errorMessage = 'Erreur lors de la création du ticket';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Erreur de validation';
      statusCode = 400;
      console.error('Validation error details:', error.errors);
    } else if (error.code === 11000) {
      errorMessage = 'Erreur de duplication';
      statusCode = 400;
      console.error('Duplicate key details:', error.keyValue);
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update ticket
exports.updateTicket = async (req, res) => {
  try {
    console.log(`Updating ticket with ID: ${req.params.id}`);
    console.log('Update data:', JSON.stringify(req.body, null, 2));
    
    // Find ticket by ID
    const ticket = await Ticket.findOne({ id: req.params.id });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // If site is changing, verify the new site exists
    if (req.body.site && req.body.site !== ticket.site) {
      const site = await Site.findOne({ id: req.body.site });
      if (!site) {
        return res.status(404).json({ message: 'Site non trouvé' });
      }
      req.body.siteName = site.name; // Update site name if site is changing
    }
    
    // Update ticket
    const updatedTicket = await Ticket.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    console.log('Ticket updated successfully');
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    
    let errorMessage = 'Erreur lors de la mise à jour du ticket';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Erreur de validation';
      statusCode = 400;
      console.error('Validation error details:', error.errors);
    }
    
    res.status(statusCode).json({ message: errorMessage });
  }
};

// Add update to ticket
exports.addTicketUpdate = async (req, res) => {
  try {
    const { text, status } = req.body;
    
    if (!text && !status) {
      return res.status(400).json({ message: 'Texte de mise à jour ou statut requis' });
    }
    
    // Find ticket by ID
    const ticket = await Ticket.findOne({ id: req.params.id });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // Format current date
    const now = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const updateData = {};
    
    // Add update if text is provided
    if (text) {
      updateData.$push = { 
        updates: { 
          date: now, 
          text 
        } 
      };
    }
    
    // Update status if provided
    if (status) {
      updateData.$set = { status };
    }
    
    // Update ticket
    const updatedTicket = await Ticket.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true }
    );
    
    // Create notification for managers about the update
    const statusLabels = {
      open: "Ouvert",
      in_progress: "En cours",
      resolved: "Résolu"
    };
    
    let notificationMessage = "";
    
    if (text && status) {
      notificationMessage = `Mise à jour du ticket ${ticket.id}: "${text}" - Statut changé en "${statusLabels[status] || status}"`;
    } else if (text) {
      notificationMessage = `Mise à jour du ticket ${ticket.id}: "${text}"`;
    } else if (status) {
      notificationMessage = `Statut du ticket ${ticket.id} changé en "${statusLabels[status] || status}"`;
    }
    
    const notification = new Notification({
      title: `Mise à jour: Ticket ${ticket.id}`,
      message: notificationMessage,
      role: 'Manager'
    });
    
    await notification.save();
    console.log('Notification created for managers about ticket update');
    
    console.log('Ticket update added successfully');
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error adding ticket update:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la mise à jour' });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    console.log(`Deleting ticket with ID: ${req.params.id}`);
    
    const ticket = await Ticket.findOneAndDelete({ id: req.params.id });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    console.log('Ticket deleted successfully');
    res.status(200).json({ message: 'Ticket supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du ticket' });
  }
};

// Get tickets by site ID
exports.getTicketsBySiteId = async (req, res) => {
  try {
    const { siteId } = req.params;
    console.log(`Fetching tickets for site: ${siteId}`);
    
    const tickets = await Ticket.find({ site: siteId });
    
    console.log(`Found ${tickets.length} tickets for site ${siteId}`);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching site tickets:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets du site' });
  }
};

// Get tickets by status
exports.getTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    console.log(`Fetching tickets with status: ${status}`);
    
    const tickets = await Ticket.find({ status });
    
    console.log(`Found ${tickets.length} tickets with status ${status}`);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets by status:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets par statut' });
  }
};

// Get tickets by user
exports.getTicketsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching tickets created by user: ${userId}`);
    
    const tickets = await Ticket.find({ createdBy: userId });
    
    console.log(`Found ${tickets.length} tickets created by user ${userId}`);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets de l\'utilisateur' });
  }
}; 