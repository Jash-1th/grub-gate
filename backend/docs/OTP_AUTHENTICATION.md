# OTP-Based Authentication System

## Overview

This document describes the comprehensive OTP (One-Time Password) authentication system implemented for GrubGate. The system replaces traditional password-based authentication with a more secure and user-friendly OTP-based approach.

## System Architecture

### Backend Components

#### 1. Updated User Model (`src/models/User.js`)
- **New Fields:**
  - `phoneNumber`: String, unique, sparse (allows null values)
  - `roles`: Array of strings (replaces single `role` field)
  - `phoneVerified`: Boolean, default false
- **Enhanced Validation:**
  - At least one identifier (email or phoneNumber) required
  - Supports both email and phone-based authentication
- **Backward Compatibility:**
  - Legacy `role` field maintained for compatibility
  - Automatic sync between `roles` array and legacy `role` field

#### 2. OTP Model (`src/models/OTP.js`)
- **Purpose:** Temporary storage of verification codes
- **Features:**
  - Automatic expiration after 5 minutes (TTL index)
  - Hashed OTP storage for security
  - Attempt limiting (max 5 attempts)
  - Automatic cleanup of expired records
- **Methods:**
  - `generateOTP(identifier)`: Creates and stores hashed OTP
  - `verifyOTP(identifier, otp)`: Validates OTP and manages attempts
  - `hasPendingOTP(identifier)`: Checks for existing OTP
  - `getRemainingAttempts(identifier)`: Returns remaining verification attempts

#### 3. Service Layer
- **SMS Service (`src/services/smsService.js`):**
  - Twilio integration for SMS delivery
  - Development mode with console logging
  - Phone number validation and formatting
  - E.164 format support
- **Email Service (`src/services/emailService.js`):**
  - Multiple provider support (SendGrid, SMTP, Ethereal for dev)
  - HTML and plain text email templates
  - Development mode with preview URLs

#### 4. Authentication Controllers (`src/controllers/auth.controller.js`)
- **New Endpoints:**
  - `POST /api/v1/auth/otp/request`: Request OTP
  - `POST /api/v1/auth/otp/verify`: Verify OTP and authenticate
- **Enhanced JWT Generation:**
  - Supports roles array in JWT payload
  - Backward compatible with legacy role field

#### 5. Enhanced JWT Utilities (`src/utils/jwt.js`)
- **Multi-Role Support:**
  - JWT contains both `roles` array and legacy `role` field
  - Flexible role-based authorization
- **Token Structure:**
  ```json
  {
    "id": "user_id",
    "roles": ["customer", "partner"],
    "role": "customer"
  }
  ```

### Frontend Components

#### 1. OTP Authentication Modal (`src/components/auth/OTPAuthModal.jsx`)
- **Multi-Step Flow:**
  1. Identifier input (email/phone + user type selection)
  2. OTP verification with timer and resend functionality
  3. User info collection (for new users only)
- **Features:**
  - Auto-detection of email vs phone number
  - Real-time validation and error handling
  - Countdown timer for OTP expiration
  - Resend functionality with rate limiting
  - Responsive design with GrubGate branding

#### 2. API Client (`src/api/otpApi.js`)
- **Functions:**
  - `requestOTP(identifier, channel)`: Request verification code
  - `verifyOTP(identifier, otp, userType, firstName, lastName)`: Verify and authenticate
  - `isValidEmail(identifier)`: Email validation
  - `isValidPhone(identifier)`: Phone number validation
  - `formatPhoneNumber(phoneNumber)`: E.164 formatting

#### 3. Enhanced Modal Context (`src/context/ModalContext.jsx`)
- **New Modal State:**
  - `isOTPAuthModalOpen`: OTP modal state
  - `openOTPAuthModal()`: Open OTP modal
  - `closeOTPAuthModal()`: Close OTP modal
  - `switchToOTPAuth()`: Switch from other modals to OTP

## API Endpoints

### Request OTP
```http
POST /api/v1/auth/otp/request
Content-Type: application/json

{
  "identifier": "user@example.com" | "+1234567890",
  "channel": "email" | "sms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "identifier": "user@example.com",
    "channel": "email",
    "expiresIn": 300
  }
}
```

### Verify OTP
```http
POST /api/v1/auth/otp/verify
Content-Type: application/json

{
  "identifier": "user@example.com",
  "otp": "123456",
  "userType": "customer" | "partner",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (Login):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["customer"],
      "emailVerified": true
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": "7d"
  }
}
```

**Response (Signup):**
```json
{
  "success": true,
  "message": "Account created and login successful",
  "data": {
    "user": { /* user object */ },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": "7d"
  }
}
```

## Environment Variables

### Required for Production
```env
# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@grubgate.com
EMAIL_FROM_NAME=GrubGate

# Alternative: SMTP Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### Development Mode
- **SMS Service:** Logs messages to console if Twilio not configured
- **Email Service:** Uses Ethereal test accounts with preview URLs
- **OTP Generation:** Still generates secure 6-digit codes

## Security Features

### OTP Security
- **Hashed Storage:** OTPs are bcrypt-hashed before database storage
- **Short Expiration:** 5-minute TTL with automatic cleanup
- **Attempt Limiting:** Maximum 5 verification attempts per OTP
- **Rate Limiting:** Backend rate limiting prevents spam requests

### User Security
- **Unique Identifiers:** Email and phone numbers are unique across users
- **Verification Status:** Separate tracking for email and phone verification
- **Role Management:** Flexible role system supports multiple user types
- **JWT Security:** Standard JWT implementation with refresh tokens

## User Flows

### New User Registration
1. User enters email/phone and selects user type
2. System sends OTP via chosen channel
3. User enters OTP and provides name information
4. System creates account and issues JWT
5. User is logged in automatically

### Existing User Login
1. User enters email/phone and selects user type
2. System sends OTP via chosen channel
3. User enters OTP (no additional info required)
4. System validates and issues JWT
5. User is logged in automatically

### Partner Role Addition
1. Existing customer enters phone/email with "partner" type
2. System detects existing user
3. Adds "partner" role to existing roles array
4. User gains access to both customer and partner features

## Error Handling

### Common Error Scenarios
- **Invalid Identifier:** Email/phone format validation
- **Channel Mismatch:** Email requires email channel, phone requires SMS
- **OTP Expired:** 5-minute expiration with clear error message
- **Invalid OTP:** Attempt tracking with remaining attempts shown
- **Max Attempts:** Automatic OTP deletion after 5 failed attempts
- **Service Unavailable:** Graceful fallback to development mode

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "otp",
      "message": "Invalid OTP. 3 attempts remaining."
    }
  ]
}
```

## Testing

### Manual Testing
1. **Request OTP:** Test both email and SMS channels
2. **Verify OTP:** Test valid/invalid codes
3. **New User Flow:** Complete registration process
4. **Existing User Flow:** Login with existing account
5. **Error Scenarios:** Test validation and error handling

### Development Testing
- Use console logs for SMS messages
- Use Ethereal preview URLs for emails
- Test with both valid and invalid identifiers
- Verify JWT token generation and validation

## Migration Strategy

### Backward Compatibility
- Existing password-based authentication remains functional
- Legacy `role` field maintained alongside new `roles` array
- Existing JWT tokens continue to work
- Gradual migration path available

### Database Migration
- New fields added with appropriate defaults
- Existing users can be migrated to OTP system
- No breaking changes to existing data structure

## Deployment Checklist

### Backend Deployment
- [ ] Install Twilio dependency: `npm install twilio`
- [ ] Configure environment variables
- [ ] Test SMS and email services
- [ ] Verify database indexes are created
- [ ] Test API endpoints

### Frontend Deployment
- [ ] Add OTP modal to main app component
- [ ] Update authentication buttons to use OTP flow
- [ ] Test responsive design on mobile devices
- [ ] Verify error handling and user feedback
- [ ] Test complete authentication flow

## Future Enhancements

### Potential Improvements
- **Biometric Authentication:** Face ID, Touch ID integration
- **Social Login:** Google, Facebook, Apple Sign-In
- **Multi-Factor Authentication:** Additional security layers
- **SMS Templates:** Customizable message templates
- **Analytics:** Authentication success/failure tracking
- **Internationalization:** Multi-language support for messages

### Scalability Considerations
- **Rate Limiting:** Enhanced rate limiting per user/IP
- **OTP Delivery:** Multiple SMS/email providers for redundancy
- **Caching:** Redis integration for OTP storage
- **Monitoring:** Authentication metrics and alerting
- **Audit Logging:** Comprehensive authentication logs

## Support and Maintenance

### Monitoring
- Track OTP delivery success rates
- Monitor authentication failure patterns
- Alert on service provider issues
- Track user adoption of OTP authentication

### Maintenance Tasks
- Regular cleanup of expired OTP records (automatic)
- Monitor and rotate API keys for external services
- Update dependencies and security patches
- Review and update rate limiting policies

---

This OTP authentication system provides a secure, user-friendly, and scalable solution for GrubGate's authentication needs while maintaining backward compatibility and supporting future enhancements.
