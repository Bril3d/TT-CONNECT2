const Intervention = require('../models/Intervention');
const Site = require('../models/Site');

// Get all interventions
exports.getAllInterventions = async (req, res) => {
  try {
    console.log('Fetching all interventions');
    const interventions = await Intervention.find();
    res.status(200).json(interventions);
  } catch (error) {
    console.error('Error fetching interventions:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des interventions' });
  }
};

// Get intervention by ID
exports.getInterventionById = async (req, res) => {
  try {
    console.log(`Fetching intervention with ID: ${req.params.id}`);
    const intervention = await Intervention.findOne({ id: req.params.id });
    
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention non trouvée' });
    }
    
    res.status(200).json(intervention);
  } catch (error) {
    console.error('Error fetching intervention:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'intervention' });
  }
};

// Create new intervention
exports.createIntervention = async (req, res) => {
  try {
    console.log('Creating intervention with data:', JSON.stringify(req.body, null, 2));
    
    // Verify site exists
    const site = await Site.findOne({ id: req.body.siteId });
    if (!site) {
      return res.status(404).json({ message: 'Site non trouvé' });
    }
    
    // Create new intervention
    const interventionData = {
      ...req.body,
      siteName: site.name, // Ensure we have the correct site name
      createdBy: req.user.id // This assumes the user ID is available in the request after authentication
    };
    
    // If ID is provided, check if it already exists
    if (interventionData.id) {
      const existingIntervention = await Intervention.findOne({ id: interventionData.id });
      if (existingIntervention) {
        return res.status(400).json({ message: 'Une intervention avec cet ID existe déjà' });
      }
    } else {
      // Generate ID manually if not provided
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Find the latest intervention for this year
      const latestIntervention = await Intervention.findOne(
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
      interventionData.id = `INT-${currentYear}-${newNumber.toString().padStart(3, '0')}`;
    }
    
    const newIntervention = new Intervention(interventionData);
    
    // Validate intervention data
    try {
      await newIntervention.validateSync();
      console.log('Intervention validation passed');
    } catch (validationError) {
      console.error('Intervention validation error:', validationError);
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: validationError.errors 
      });
    }
    
    const savedIntervention = await newIntervention.save();
    console.log('Intervention saved successfully with ID:', savedIntervention.id);
    
    res.status(201).json(savedIntervention);
  } catch (error) {
    console.error('Error creating intervention:', error);
    
    let errorMessage = 'Erreur lors de la création de l\'intervention';
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

// Update intervention
exports.updateIntervention = async (req, res) => {
  try {
    console.log(`Updating intervention with ID: ${req.params.id}`);
    console.log('Update data:', JSON.stringify(req.body, null, 2));
    
    // Find intervention by ID
    const intervention = await Intervention.findOne({ id: req.params.id });
    
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention non trouvée' });
    }
    
    // If siteId is changing, verify the new site exists
    if (req.body.siteId && req.body.siteId !== intervention.siteId) {
      const site = await Site.findOne({ id: req.body.siteId });
      if (!site) {
        return res.status(404).json({ message: 'Site non trouvé' });
      }
      req.body.siteName = site.name; // Update site name if site is changing
    }
    
    // Update intervention
    const updatedIntervention = await Intervention.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    console.log('Intervention updated successfully');
    res.status(200).json(updatedIntervention);
  } catch (error) {
    console.error('Error updating intervention:', error);
    
    let errorMessage = 'Erreur lors de la mise à jour de l\'intervention';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Erreur de validation';
      statusCode = 400;
      console.error('Validation error details:', error.errors);
    }
    
    res.status(statusCode).json({ message: errorMessage });
  }
};

// Update intervention status
exports.updateInterventionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Le statut est requis' });
    }
    
    // Valid status values
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    console.log(`Updating intervention ${req.params.id} status to ${status}`);
    
    const updatedIntervention = await Intervention.findOneAndUpdate(
      { id: req.params.id },
      { status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedIntervention) {
      return res.status(404).json({ message: 'Intervention non trouvée' });
    }
    
    console.log('Intervention status updated successfully');
    res.status(200).json(updatedIntervention);
  } catch (error) {
    console.error('Error updating intervention status:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
  }
};

// Delete intervention
exports.deleteIntervention = async (req, res) => {
  try {
    console.log(`Deleting intervention with ID: ${req.params.id}`);
    
    const intervention = await Intervention.findOneAndDelete({ id: req.params.id });
    
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention non trouvée' });
    }
    
    console.log('Intervention deleted successfully');
    res.status(200).json({ message: 'Intervention supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting intervention:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'intervention' });
  }
};

// Filter interventions
exports.filterInterventions = async (req, res) => {
  try {
    const { status, type, priority, siteId, search } = req.query;
    const query = {};
    
    console.log('Filtering interventions with query:', req.query);
    
    // Add filters to query
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    if (siteId && siteId !== 'all') {
      query.siteId = siteId;
    }
    
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { siteName: { $regex: search, $options: 'i' } },
        { siteId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const interventions = await Intervention.find(query);
    console.log(`Found ${interventions.length} interventions matching filters`);
    
    res.status(200).json(interventions);
  } catch (error) {
    console.error('Error filtering interventions:', error);
    res.status(500).json({ message: 'Erreur lors du filtrage des interventions' });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId, completed } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ message: 'L\'ID de la tâche est requis' });
    }
    
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Le statut de la tâche doit être un booléen' });
    }
    
    console.log(`Updating task ${taskId} status to ${completed ? 'completed' : 'not completed'}`);
    
    // Find intervention
    const intervention = await Intervention.findOne({ id: req.params.id });
    
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention non trouvée' });
    }
    
    // Find and update the task
    const taskIndex = intervention.tasks.findIndex(task => task._id.toString() === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    
    // Update task status
    intervention.tasks[taskIndex].completed = completed;
    intervention.updatedAt = Date.now();
    
    await intervention.save();
    
    console.log('Task status updated successfully');
    res.status(200).json(intervention);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de la tâche' });
  }
};

// Get interventions by site ID
exports.getInterventionsBySiteId = async (req, res) => {
  try {
    const { siteId } = req.params;
    console.log(`Fetching interventions for site: ${siteId}`);
    
    const interventions = await Intervention.find({ siteId });
    
    console.log(`Found ${interventions.length} interventions for site ${siteId}`);
    res.status(200).json(interventions);
  } catch (error) {
    console.error('Error fetching site interventions:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des interventions du site' });
  }
};

// Get interventions assigned to a technician
exports.getInterventionsByTechnician = async (req, res) => {
  try {
    const technicianId = req.user.id;
    console.log(`Fetching interventions for technician: ${technicianId}`);
    
    const interventions = await Intervention.find({ 
      assignedTechnicians: technicianId 
    });
    
    console.log(`Found ${interventions.length} interventions assigned to technician ${technicianId}`);
    res.status(200).json(interventions);
  } catch (error) {
    console.error('Error fetching technician interventions:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des interventions du technicien' });
  }
};

// Get intervention statistics
exports.getInterventionStats = async (req, res) => {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of current month
    currentMonth.setHours(0, 0, 0, 0);
    
    // Count interventions by status
    const pending = await Intervention.countDocuments({ status: 'pending' });
    const inProgress = await Intervention.countDocuments({ status: 'in-progress' });
    const completed = await Intervention.countDocuments({ 
      status: 'completed',
      completedAt: { $gte: currentMonth } // Completed this month
    });
    const cancelled = await Intervention.countDocuments({ status: 'cancelled' });
    
    // Count total interventions
    const total = await Intervention.countDocuments();
    
    // Count interventions by priority
    const highPriority = await Intervention.countDocuments({ priority: 'high' });
    const mediumPriority = await Intervention.countDocuments({ priority: 'medium' });
    const lowPriority = await Intervention.countDocuments({ priority: 'low' });
    
    res.json({
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      highPriority,
      mediumPriority,
      lowPriority
    });
  } catch (error) {
    console.error('Error fetching intervention statistics:', error);
    res.status(500).json({ message: 'Error fetching intervention statistics', error: error.message });
  }
}; 