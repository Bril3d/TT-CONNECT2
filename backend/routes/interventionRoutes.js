const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require authentication

// GET /api/interventions - Get all interventions
router.get('/', protect, authorize(['Admin', 'Manager', 'Technicien']), interventionController.getAllInterventions);

// GET /api/interventions/stats - Get intervention statistics
router.get('/stats', protect, authorize(['Admin']), interventionController.getInterventionStats);

// GET /api/interventions/filter - Filter interventions
router.get('/filter', protect, authorize(['Admin', 'Manager', 'Technicien']), interventionController.filterInterventions);

// GET /api/interventions/site/:siteId - Get interventions by site ID
router.get('/site/:siteId', protect, authorize(['Admin', 'Manager', 'Technicien']), interventionController.getInterventionsBySiteId);

// GET /api/interventions/my-interventions - Get interventions assigned to the logged-in technician
router.get('/my-interventions', protect, authorize(['Technicien']), interventionController.getInterventionsByTechnician);

// GET /api/interventions/:id - Get intervention by ID
router.get('/:id', protect, authorize(['Admin', 'Manager', 'Technicien']), interventionController.getInterventionById);

// POST /api/interventions - Create new intervention
router.post('/', protect, authorize(['Admin', 'Manager']), interventionController.createIntervention);

// PUT /api/interventions/:id - Update intervention
router.put('/:id', protect, authorize(['Admin', 'Manager']), interventionController.updateIntervention);

// PATCH /api/interventions/:id/status - Update intervention status
router.patch('/:id/status', protect, authorize(['Admin', 'Manager', 'Technicien']), interventionController.updateInterventionStatus);

// PATCH /api/interventions/:id/task - Update task status
router.patch('/:id/task', protect, authorize(['Admin', 'Manager', 'Technicien']), interventionController.updateTaskStatus);

// DELETE /api/interventions/:id - Delete intervention
router.delete('/:id', protect, authorize(['Admin', 'Manager']), interventionController.deleteIntervention);

module.exports = router; 