const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;