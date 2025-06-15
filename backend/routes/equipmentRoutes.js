const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require authentication

// BULK OPERATIONS
// POST /api/equipment/bulk - Add multiple equipment items at once
router.post('/bulk', protect, authorize(['Admin', 'Manager']), equipmentController.addBulkEquipment);

// GET /api/equipment/site/:siteId - Get all equipment for a site
router.get('/site/:siteId', protect, authorize(['Admin', 'Manager', 'Technicien']), equipmentController.getAllSiteEquipment);

// ANTENNA ROUTES
// GET /api/equipment/antennas/:siteId - Get all antennas for a site
router.get('/antennas/:siteId', protect, authorize(['Admin', 'Manager', 'Technicien']), equipmentController.getSiteAntennas);

// POST /api/equipment/antennas/:siteId - Add antenna to site
router.post('/antennas/:siteId', protect, authorize(['Admin', 'Manager']), equipmentController.addAntenna);

// PUT /api/equipment/antennas/:antennaId - Update antenna
router.put('/antennas/:antennaId', protect, authorize(['Admin', 'Manager']), equipmentController.updateAntenna);

// DELETE /api/equipment/antennas/:antennaId - Delete antenna
router.delete('/antennas/:antennaId', protect, authorize(['Admin', 'Manager']), equipmentController.deleteAntenna);

// TRANSMISSION EQUIPMENT ROUTES
// GET /api/equipment/transmission/:siteId - Get all transmission equipment for a site
router.get('/transmission/:siteId', protect, authorize(['Admin', 'Manager', 'Technicien']), equipmentController.getSiteTransmissionEquipment);

// POST /api/equipment/transmission/:siteId - Add transmission equipment to site
router.post('/transmission/:siteId', protect, authorize(['Admin', 'Manager']), equipmentController.addTransmissionEquipment);

// PUT /api/equipment/transmission/:equipmentId - Update transmission equipment
router.put('/transmission/:equipmentId', protect, authorize(['Admin', 'Manager']), equipmentController.updateTransmissionEquipment);

// DELETE /api/equipment/transmission/:equipmentId - Delete transmission equipment
router.delete('/transmission/:equipmentId', protect, authorize(['Admin', 'Manager']), equipmentController.deleteTransmissionEquipment);

// RADIO EQUIPMENT ROUTES
// GET /api/equipment/radio/:siteId - Get all radio equipment for a site
router.get('/radio/:siteId', protect, authorize(['Admin', 'Manager', 'Technicien']), equipmentController.getSiteRadioEquipment);

// POST /api/equipment/radio/:siteId - Add radio equipment to site
router.post('/radio/:siteId', protect, authorize(['Admin', 'Manager']), equipmentController.addRadioEquipment);

// PUT /api/equipment/radio/:equipmentId - Update radio equipment
router.put('/radio/:equipmentId', protect, authorize(['Admin', 'Manager']), equipmentController.updateRadioEquipment);

// DELETE /api/equipment/radio/:equipmentId - Delete radio equipment
router.delete('/radio/:equipmentId', protect, authorize(['Admin', 'Manager']), equipmentController.deleteRadioEquipment);

module.exports = router; 