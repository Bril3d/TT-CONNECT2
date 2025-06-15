const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

// Public routes - none for tickets

// Protected routes (require authentication)
router.get('/', protect, ticketController.getAllTickets);
router.get('/status/:status', protect, ticketController.getTicketsByStatus);
router.get('/site/:siteId', protect, ticketController.getTicketsBySiteId);
router.get('/my-tickets', protect, ticketController.getTicketsByUser);
router.get('/:id', protect, ticketController.getTicketById);
router.post('/', protect, ticketController.createTicket);
router.put('/:id', protect, ticketController.updateTicket);
router.patch('/:id/update', protect, ticketController.addTicketUpdate);
router.delete('/:id', protect, authorize('Admin', 'Manager'), ticketController.deleteTicket);

module.exports = router; 