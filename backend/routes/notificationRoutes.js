const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Dashboard specific routes
router.get('/security', protect, notificationController.getSecurityAlerts);
router.get('/recent', protect, notificationController.getRecentActivity);
router.get('/alerts/count', protect, notificationController.getAlertsCount);

// Standard notification routes
router.get('/', protect, notificationController.getNotifications);
router.post('/', protect, notificationController.createNotification);
router.patch('/:id/read', protect, notificationController.markAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);
router.patch('/read-all', protect, notificationController.markAllAsRead);

module.exports = router; 