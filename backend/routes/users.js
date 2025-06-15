const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize, admin } = require('../middleware/auth');

// Routes for /api/users
// Public routes
router.get('/', userController.getAllUsers);
router.get('/role/:role', userController.getUsersByRole);
router.get('/stats', protect, admin, userController.getUserStats);
router.get('/:id', userController.getUserById);

// Protected routes (require authentication)
router.post('/', userController.createUser);
router.put('/:id', protect, admin, userController.updateUser);
router.delete('/:id', protect, admin, userController.deleteUser);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router; 