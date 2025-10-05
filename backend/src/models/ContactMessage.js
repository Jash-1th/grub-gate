// FILE: src/models/ContactMessage.js
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    enum: [
      'general-inquiry',
      'technical-support',
      'billing-question',
      'partnership',
      'feedback',
      'complaint',
      'other'
    ]
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    type: String,
    trim: true,
    maxlength: [5000, 'Response cannot exceed 5000 characters']
  },
  respondedAt: Date,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }],
  internalNotes: [{
    note: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  customerType: {
    type: String,
    enum: ['prospect', 'customer', 'partner'],
    default: 'prospect'
  },
  source: {
    type: String,
    enum: ['website', 'email', 'phone', 'social-media', 'other'],
    default: 'website'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for response time in hours
contactMessageSchema.virtual('responseTimeHours').get(function() {
  if (!this.respondedAt) return null;
  const diffTime = this.respondedAt - this.createdAt;
  return Math.round(diffTime / (1000 * 60 * 60));
});

// Virtual for is overdue (more than 24 hours without response)
contactMessageSchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'closed') return false;
  if (this.respondedAt) return false;
  
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  return this.createdAt < twentyFourHoursAgo;
});

// Virtual for age in days
contactMessageSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = now - this.createdAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted reason
contactMessageSchema.virtual('formattedReason').get(function() {
  const reasonMap = {
    'general-inquiry': 'General Inquiry',
    'technical-support': 'Technical Support',
    'billing-question': 'Billing Question',
    'partnership': 'Partnership',
    'feedback': 'Feedback',
    'complaint': 'Complaint',
    'other': 'Other'
  };
  return reasonMap[this.reason] || this.reason;
});

// Indexes for performance
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ assignedTo: 1, status: 1 });
contactMessageSchema.index({ reason: 1 });
contactMessageSchema.index({ priority: 1, status: 1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ followUpRequired: 1, followUpDate: 1 });

// Text index for search
contactMessageSchema.index({
  name: 'text',
  email: 'text',
  message: 'text',
  response: 'text'
});

// Pre-save middleware to set priority based on reason
contactMessageSchema.pre('save', function(next) {
  if (this.isNew) {
    const urgentReasons = ['technical-support', 'complaint'];
    const highReasons = ['billing-question'];
    
    if (urgentReasons.includes(this.reason)) {
      this.priority = 'urgent';
    } else if (highReasons.includes(this.reason)) {
      this.priority = 'high';
    }
  }
  next();
});

// Pre-save middleware to set customer type based on email
contactMessageSchema.pre('save', async function(next) {
  if (this.isNew && this.customerType === 'prospect') {
    try {
      const User = mongoose.model('User');
      const existingUser = await User.findOne({ email: this.email });
      
      if (existingUser) {
        this.customerType = existingUser.role === 'partner' ? 'partner' : 'customer';
      }
    } catch (error) {
      // Continue without setting customer type if lookup fails
      console.warn('Could not determine customer type:', error.message);
    }
  }
  next();
});

// Instance method to assign to user
contactMessageSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  this.status = 'in-progress';
  return this.save();
};

// Instance method to add response
contactMessageSchema.methods.addResponse = function(response, respondedBy) {
  this.response = response;
  this.respondedAt = new Date();
  this.respondedBy = respondedBy;
  this.status = 'resolved';
  return this.save();
};

// Instance method to add internal note
contactMessageSchema.methods.addInternalNote = function(note, addedBy) {
  this.internalNotes.push({
    note,
    addedBy,
    addedAt: new Date()
  });
  return this.save();
};

// Instance method to set follow-up
contactMessageSchema.methods.setFollowUp = function(followUpDate) {
  this.followUpRequired = true;
  this.followUpDate = followUpDate;
  return this.save();
};

// Instance method to close message
contactMessageSchema.methods.close = function() {
  this.status = 'closed';
  this.followUpRequired = false;
  return this.save();
};

// Instance method to reopen message
contactMessageSchema.methods.reopen = function() {
  this.status = 'in-progress';
  return this.save();
};

// Instance method to add tag
contactMessageSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag.toLowerCase())) {
    this.tags.push(tag.toLowerCase());
  }
  return this.save();
};

// Instance method to remove tag
contactMessageSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag.toLowerCase());
  return this.save();
};

// Static method to get messages by status
contactMessageSchema.statics.getByStatus = function(status, limit = 20, skip = 0) {
  return this.find({ status })
    .populate('assignedTo', 'firstName lastName email')
    .populate('respondedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get overdue messages
contactMessageSchema.statics.getOverdue = function() {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  return this.find({
    status: { $in: ['new', 'in-progress'] },
    respondedAt: { $exists: false },
    createdAt: { $lt: twentyFourHoursAgo }
  })
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: 1 });
};

// Static method to get messages requiring follow-up
contactMessageSchema.statics.getFollowUpRequired = function(date = new Date()) {
  return this.find({
    followUpRequired: true,
    followUpDate: { $lte: date },
    status: { $ne: 'closed' }
  })
    .populate('assignedTo', 'firstName lastName email')
    .sort({ followUpDate: 1 });
};

// Static method to get analytics
contactMessageSchema.statics.getAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status',
            reason: '$reason',
            priority: '$priority'
          }
        },
        averageResponseTime: {
          $avg: {
            $cond: [
              { $ne: ['$respondedAt', null] },
              { $subtract: ['$respondedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        totalMessages: 1,
        averageResponseTimeHours: {
          $divide: ['$averageResponseTime', 1000 * 60 * 60]
        },
        statusBreakdown: {
          $reduce: {
            input: '$byStatus',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    { k: '$$this.status', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.status', input: '$$value' } }, 0] }, 1] } }
                  ]]
                }
              ]
            }
          }
        },
        reasonBreakdown: {
          $reduce: {
            input: '$byStatus',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    { k: '$$this.reason', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.reason', input: '$$value' } }, 0] }, 1] } }
                  ]]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

// Static method to search messages
contactMessageSchema.statics.searchMessages = function(searchTerm, options = {}) {
  const {
    status = null,
    reason = null,
    priority = null,
    assignedTo = null,
    limit = 20,
    skip = 0
  } = options;
  
  const query = {
    $text: { $search: searchTerm }
  };
  
  if (status) query.status = status;
  if (reason) query.reason = reason;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('assignedTo', 'firstName lastName email')
    .populate('respondedBy', 'firstName lastName email')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
