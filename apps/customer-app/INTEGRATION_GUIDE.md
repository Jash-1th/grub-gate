# OTP Authentication Integration Guide

## Overview

This guide explains how to integrate the new OTP authentication system into your GrubGate customer app.

## Integration Steps

### 1. Add OTP Modal to Main App Component

Update your main `App.jsx` file to include the OTP authentication modal:

```jsx
// Add import
import OTPAuthModal from './components/auth/OTPAuthModal';

// Inside your App component, add the modal alongside other modals
function App() {
  return (
    <div className="App">
      {/* Your existing app content */}
      
      {/* Authentication Modals */}
      <LoginModal />
      <SignupModal />
      <OTPAuthModal /> {/* Add this line */}
      
      {/* Other modals */}
    </div>
  );
}
```

### 2. Update Authentication Buttons

Replace existing login/signup buttons with OTP authentication:

```jsx
// In your header/navigation component
import { useModal } from '../context/ModalContext';

function Header() {
  const { openOTPAuthModal } = useModal();
  
  return (
    <header>
      {/* Replace existing auth buttons */}
      <button 
        onClick={openOTPAuthModal}
        className="bg-grub-red text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Sign In / Sign Up
      </button>
    </header>
  );
}
```

### 3. Update AuthContext (Optional)

If you want to integrate with your existing AuthContext, add OTP login method:

```jsx
// In AuthContext.jsx
import { requestOTP, verifyOTP } from '../api/otpApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ... existing state

  const otpLogin = async (identifier, otp, userType, firstName, lastName) => {
    try {
      setIsLoading(true);
      const result = await verifyOTP(identifier, otp, userType, firstName, lastName);
      
      if (result.success) {
        // Store auth data
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        setUser(result.data.user);
        setIsAuthenticated(true);
        
        return { success: true, user: result.data.user };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    // ... existing values
    otpLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. Environment Variables

Add the API URL to your frontend environment variables:

```env
# .env.local or .env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

### 5. Install Dependencies (if needed)

The OTP system uses standard React hooks and doesn't require additional dependencies for the frontend.

## Testing the Integration

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

### 2. Start Frontend Server
```bash
cd apps/customer-app
npm run dev
```

### 3. Test OTP Flow

**Login Flow:**
1. Click the "Login" button
2. Enter an email address or phone number
3. Click "Send Login Code"
4. Check console for OTP (in development mode)
5. Enter the 6-digit code
6. Complete authentication

**Signup Flow:**
1. Click the "Sign Up" button
2. Enter an email address or phone number
3. Click "Send Verification Code"
4. Check console for OTP (in development mode)
5. Enter the 6-digit code
6. Provide first and last name (for new accounts)
7. Complete account creation

## Development Mode Features

### Email Service
- Uses Ethereal test accounts
- Preview URLs logged to console
- No real emails sent

### SMS Service
- Logs messages to console
- No real SMS sent
- Still generates secure OTPs

### Console Output Example
```
📧 Email Service (Development Mode):
To: user@example.com
Subject: Your GrubGate Verification Code
Content: Your GrubGate verification code is: 123456...
---

📱 SMS Service (Development Mode):
To: +1234567890
Message: Your GrubGate verification code is: 123456...
---
```

## Production Configuration

### Backend Environment Variables
```env
# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@grubgate.com
EMAIL_FROM_NAME=GrubGate
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=https://your-api-domain.com/api/v1
```

## Migration Strategy

### Gradual Migration
1. **Phase 1**: Deploy OTP system alongside existing auth
2. **Phase 2**: Add "Try OTP Login" option to existing modals
3. **Phase 3**: Make OTP the primary authentication method
4. **Phase 4**: Deprecate password-based authentication

### Backward Compatibility
- Existing users can continue using password authentication
- OTP system works independently
- No breaking changes to existing flows

## Troubleshooting

### Common Issues

#### 1. OTP Not Received
- Check console for development mode messages
- Verify email/phone format
- Check spam folder for emails
- Ensure backend services are configured

#### 2. API Connection Issues
- Verify backend server is running
- Check CORS configuration
- Verify API URL in environment variables
- Check network connectivity

#### 3. Modal Not Opening
- Verify ModalContext is properly wrapped around app
- Check for JavaScript errors in console
- Ensure OTPAuthModal is imported and included

#### 4. Authentication Failures
- Check JWT token format
- Verify user data structure
- Check localStorage for stored tokens
- Verify API endpoint responses

### Debug Mode
Enable debug logging by adding to your component:

```jsx
// Add to OTPAuthModal component for debugging
useEffect(() => {
  console.log('OTP Modal State:', {
    currentStep,
    formData,
    formErrors,
    isLocalLoading
  });
}, [currentStep, formData, formErrors, isLocalLoading]);
```

## Support

### Backend Testing
Use the provided test script:
```bash
cd backend
node scripts/test-otp.js
```

### Frontend Testing
1. Open browser developer tools
2. Monitor console for debug messages
3. Check Network tab for API calls
4. Verify localStorage for auth tokens

### API Documentation
- Request OTP: `POST /api/v1/auth/otp/request`
- Verify OTP: `POST /api/v1/auth/otp/verify`
- Full documentation: `backend/docs/OTP_AUTHENTICATION.md`

## Next Steps

After successful integration:

1. **User Testing**: Test with real users for UX feedback
2. **Analytics**: Add tracking for authentication success rates
3. **Monitoring**: Set up alerts for authentication failures
4. **Security**: Review and enhance rate limiting
5. **Internationalization**: Add multi-language support
6. **Mobile**: Test responsive design on mobile devices

## Contact

For technical support or questions about the OTP authentication system, refer to the comprehensive documentation in `backend/docs/OTP_AUTHENTICATION.md` or contact the development team.
