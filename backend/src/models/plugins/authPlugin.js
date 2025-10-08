const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Authentication Plugin for Mongoose User Schema
 * Adds authentication fields, password hashing, and auth methods
 */
function authPlugin(schema) {
  // Add authentication fields
  schema.add({
    passwordHash: { 
      type: String, 
      select: false 
    },
    emailVerified: { 
      type: Boolean, 
      default: false 
    },
    phoneVerified: { 
      type: Boolean, 
      default: false 
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLoginAt: Date
  });

  // Pre-save hook for password hashing
  schema.pre('save', async function(next) {
    // Only hash password if it has been modified and exists
    if (!this.isModified('passwordHash') || !this.passwordHash) {
      return next();
    }
    
    try {
      const salt = await bcrypt.genSalt(12);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

  // Instance method to compare passwords
  schema.methods.matchPassword = async function(enteredPassword) {
    if (!this.passwordHash) {
      return false;
    }
    return await bcrypt.compare(enteredPassword, this.passwordHash);
  };

  // Instance method to generate password reset token
  schema.methods.getResetPasswordToken = function() {
    // Generate random token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash and set to passwordResetToken field
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire time (10 minutes)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    // Return unhashed token
    return resetToken;
  };

  // Instance method to generate email verification token
  schema.methods.getEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    this.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    return verificationToken;
  };

  // Static method to hash token for comparison
  schema.statics.hashToken = function(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  };
}

module.exports = authPlugin;
