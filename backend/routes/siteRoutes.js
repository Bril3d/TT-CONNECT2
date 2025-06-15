const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require authentication
// Only Admin and Manager roles can access these routes

// GET /api/sites - Get all sites
router.get('/', protect, authorize(['Admin', 'Manager', 'Technicien']), siteController.getAllSites);

// GET /api/sites/filter - Filter sites
router.get('/filter', protect, authorize(['Admin', 'Manager', 'Technicien']), siteController.filterSites);

// GET /api/sites/:id - Get site by ID
router.get('/:id', protect, authorize(['Admin', 'Manager', 'Technicien']), siteController.getSiteById);

// GET /api/sites/:id/equipment - Get site with all equipment
router.get('/:id/equipment', protect, authorize(['Admin', 'Manager', 'Technicien']), siteController.getSiteWithEquipment);

// POST /api/sites - Create new site
router.post('/', protect, authorize(['Admin', 'Manager']), siteController.createSite);

// PUT /api/sites/:id - Update site
router.put('/:id', protect, authorize(['Admin', 'Manager']), siteController.updateSite);

// PATCH /api/sites/:id/archive - Archive site
router.patch('/:id/archive', protect, authorize(['Admin', 'Manager']), siteController.archiveSite);

// DELETE /api/sites/:id - Delete site
router.delete('/:id', protect, authorize(['Admin', 'Manager']), siteController.deleteSite);

module.exports = router; 