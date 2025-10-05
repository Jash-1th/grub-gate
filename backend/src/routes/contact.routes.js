// FILE: src/routes/contact.routes.js
const express = require('express');
const {
  submitContactForm,
  getContactMessages,
  getContactMessage,
  updateMessageStatus,
  respondToMessage,
  addInternalNote,
  setFollowUp,
  closeMessage,
  reopenMessage,
  getOverdueMessages,
  getFollowUpMessages,
  getContactAnalytics,
  searchMessages
} = require('../controllers/contact.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const { contactValidations, commonValidations, queryValidations } = require('../middlewares/validation');

const router = express.Router();

// Public routes
router.post('/', contactValidations.create, submitContactForm);

// Admin routes
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// Contact message management
router.get('/messages', queryValidations.pagination, getContactMessages);
router.get('/messages/overdue', getOverdueMessages);
router.get('/messages/follow-up', getFollowUpMessages);
router.get('/messages/:id', commonValidations.mongoId, getContactMessage);
router.patch('/messages/:id', commonValidations.mongoId, updateMessageStatus);

// Message actions
router.post('/messages/:id/respond', commonValidations.mongoId, respondToMessage);
router.post('/messages/:id/notes', commonValidations.mongoId, addInternalNote);
router.post('/messages/:id/follow-up', commonValidations.mongoId, setFollowUp);
router.post('/messages/:id/close', commonValidations.mongoId, closeMessage);
router.post('/messages/:id/reopen', commonValidations.mongoId, reopenMessage);

// Analytics and search
router.get('/analytics', getContactAnalytics);
router.get('/search', queryValidations.search, searchMessages);

module.exports = router;
