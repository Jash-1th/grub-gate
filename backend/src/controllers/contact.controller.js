// FILE: src/controllers/contact.controller.js
const ContactMessage = require('../models/ContactMessage');
const { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Submit contact form
 * @route   POST /api/v1/contact
 * @access  Public
 */
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, reason, message } = req.body;

  const contactMessage = await ContactMessage.create({
    name,
    email,
    phone,
    reason,
    message,
    source: 'website'
  });

  // TODO: Send notification email to admin
  // TODO: Send confirmation email to user

  createdResponse(res, { contactMessage }, 'Contact message submitted successfully');
});

/**
 * @desc    Get contact messages (Admin)
 * @route   GET /api/v1/contact/messages
 * @access  Private (Admin)
 */
const getContactMessages = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    reason,
    priority,
    assignedTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search
  } = req.query;

  // Build query
  const query = {};
  
  if (status) {
    query.status = status;
  }

  if (reason) {
    query.reason = reason;
  }

  if (priority) {
    query.priority = priority;
  }

  if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Build sort object
  const sort = {};
  if (search) {
    sort.score = { $meta: 'textScore' };
  } else {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const messages = await ContactMessage.find(query, search ? { score: { $meta: 'textScore' } } : {})
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('assignedTo', 'firstName lastName email')
    .populate('respondedBy', 'firstName lastName email');

  const total = await ContactMessage.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, messages, pagination, 'Contact messages retrieved successfully');
});

/**
 * @desc    Get single contact message
 * @route   GET /api/v1/contact/messages/:id
 * @access  Private (Admin)
 */
const getContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id)
    .populate('assignedTo', 'firstName lastName email')
    .populate('respondedBy', 'firstName lastName email')
    .populate('internalNotes.addedBy', 'firstName lastName email');

  if (!message) {
    return notFoundResponse(res, 'Contact message not found');
  }

  successResponse(res, { message }, 'Contact message retrieved successfully');
});

/**
 * @desc    Update contact message status
 * @route   PATCH /api/v1/contact/messages/:id
 * @access  Private (Admin)
 */
const updateMessageStatus = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo } = req.body;

  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    return notFoundResponse(res, 'Contact message not found');
  }

  // Update fields
  if (status) message.status = status;
  if (priority) message.priority = priority;
  if (assignedTo) {
    await message.assignTo(assignedTo);
  } else {
    await message.save();
  }

  // Populate for response
  await message.populate([
    { path: 'assignedTo', select: 'firstName lastName email' },
    { path: 'respondedBy', select: 'firstName lastName email' }
  ]);

  successResponse(res, { message }, 'Contact message updated successfully');
});

/**
 * @desc    Respond to contact message
 * @route   POST /api/v1/contact/messages/:id/respond
 * @access  Private (Admin)
 */
const respondToMessage = asyncHandler(async (req, res) => {
  const { response } = req.body;

  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    return notFoundResponse(res, 'Contact message not found');
  }

  await message.addResponse(response, req.user._id);

  // TODO: Send response email to customer

  successResponse(res, { message }, 'Response sent successfully');
});

/**
 * @desc    Add internal note to contact message
 * @route   POST /api/v1/contact/messages/:id/notes
 * @access  Private (Admin)
 */
const addInternalNote = asyncHandler(async (req, res) => {
  const { note } = req.body;

  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    return notFoundResponse(res, 'Contact message not found');
  }

  await message.addInternalNote(note, req.user._id);

  // Populate for response
  await message.populate('internalNotes.addedBy', 'firstName lastName email');

  successResponse(res, { message }, 'Internal note added successfully');
});

/**
 * @desc    Set follow-up for contact message
 * @route   POST /api/v1/contact/messages/:id/follow-up
 * @access  Private (Admin)
 */
const setFollowUp = asyncHandler(async (req, res) => {
  const { followUpDate } = req.body;

  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    return notFoundResponse(res, 'Contact message not found');
  }

  await message.setFollowUp(new Date(followUpDate));

  successResponse(res, { message }, 'Follow-up date set successfully');
});

/**
 * @desc    Close contact message
 * @route   POST /api/v1/contact/messages/:id/close
 * @access  Private (Admin)
 */
const closeMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    return notFoundResponse(res, 'Contact message not found');
  }

  await message.close();

  successResponse(res, { message }, 'Contact message closed successfully');
});

/**
 * @desc    Reopen contact message
 * @route   POST /api/v1/contact/messages/:id/reopen
 * @access  Private (Admin)
 */
const reopenMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    return notFoundResponse(res, 'Contact message not found');
  }

  await message.reopen();

  successResponse(res, { message }, 'Contact message reopened successfully');
});

/**
 * @desc    Get overdue messages
 * @route   GET /api/v1/contact/messages/overdue
 * @access  Private (Admin)
 */
const getOverdueMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.getOverdue();

  successResponse(res, { messages }, 'Overdue messages retrieved successfully');
});

/**
 * @desc    Get messages requiring follow-up
 * @route   GET /api/v1/contact/messages/follow-up
 * @access  Private (Admin)
 */
const getFollowUpMessages = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const followUpDate = date ? new Date(date) : new Date();

  const messages = await ContactMessage.getFollowUpRequired(followUpDate);

  successResponse(res, { messages }, 'Follow-up messages retrieved successfully');
});

/**
 * @desc    Get contact analytics
 * @route   GET /api/v1/contact/analytics
 * @access  Private (Admin)
 */
const getContactAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Default to last 30 days if no dates provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const analytics = await ContactMessage.getAnalytics(start, end);

  // Get current status counts
  const statusCounts = await ContactMessage.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get overdue count
  const overdueCount = await ContactMessage.getOverdue();

  // Get follow-up required count
  const followUpCount = await ContactMessage.getFollowUpRequired();

  successResponse(res, {
    analytics: analytics[0] || {},
    statusCounts,
    overdueCount: overdueCount.length,
    followUpCount: followUpCount.length
  }, 'Contact analytics retrieved successfully');
});

/**
 * @desc    Search contact messages
 * @route   GET /api/v1/contact/search
 * @access  Private (Admin)
 */
const searchMessages = asyncHandler(async (req, res) => {
  const {
    q: searchTerm,
    status,
    reason,
    priority,
    assignedTo,
    limit = 20,
    skip = 0
  } = req.query;

  if (!searchTerm) {
    return errorResponse(res, 'Search term is required', 400);
  }

  const options = {
    status,
    reason,
    priority,
    assignedTo,
    limit: parseInt(limit),
    skip: parseInt(skip)
  };

  const messages = await ContactMessage.searchMessages(searchTerm, options);

  successResponse(res, { messages }, 'Search results retrieved successfully');
});

module.exports = {
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
};
