// FILE: src/models/OTP.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: [true, 'Identifier (email or phone) is required'],
    trim: true,
    lowercase: true
  },
  otpHash: {
    type: String,
    required: [true, 'OTP hash is required']
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5, 'Maximum verification attempts exceeded']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // TTL index - document expires after 5 minutes (300 seconds)
  }
}, {
  timestamps: true
});

// Index for performance and uniqueness
otpSchema.index({ identifier: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 }); // TTL index

// Static method to generate and save OTP
otpSchema.statics.generateOTP = async function(identifier) {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the OTP
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);
  
  // Remove any existing OTP for this identifier
  await this.deleteMany({ identifier });
  
  // Create new OTP record
  const otpRecord = await this.create({
    identifier,
    otpHash
  });
  
  return { otp, otpRecord };
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(identifier, otp) {
  // Find the most recent OTP for this identifier
  const otpRecord = await this.findOne({ identifier }).sort({ createdAt: -1 });
  
  if (!otpRecord) {
    return { success: false, message: 'OTP not found or expired' };
  }
  
  // Check if maximum attempts exceeded
  if (otpRecord.attempts >= 5) {
    await otpRecord.deleteOne();
    return { success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }
  
  // Increment attempts
  otpRecord.attempts += 1;
  await otpRecord.save();
  
  // Verify OTP
  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  
  if (!isMatch) {
    return { 
      success: false, 
      message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`,
      attemptsRemaining: 5 - otpRecord.attempts
    };
  }
  
  // OTP is valid, delete the record
  await otpRecord.deleteOne();
  
  return { success: true, message: 'OTP verified successfully' };
};

// Static method to check if identifier has pending OTP
otpSchema.statics.hasPendingOTP = async function(identifier) {
  const otpRecord = await this.findOne({ identifier });
  return !!otpRecord;
};

// Static method to get remaining attempts
otpSchema.statics.getRemainingAttempts = async function(identifier) {
  const otpRecord = await this.findOne({ identifier });
  if (!otpRecord) return 5;
  return Math.max(0, 5 - otpRecord.attempts);
};

module.exports = mongoose.model('OTP', otpSchema);
