# Frontend User Model Migration Guide

This guide covers all the frontend changes needed to work with the refactored User model that uses nested schemas and plugins.

## 🎯 Overview

The User model has been refactored from a flat structure to a modular, nested structure:

### Before (Old Structure)
```javascript
{
  email: "partner@example.com",
  roles: ["partner"],
  restaurantId: ObjectId("..."),
  notificationPreferences: {
    orderAlerts: true,
    systemUpdates: true
  },
  billingInfo: {
    paymentMethod: "credit_card",
    taxId: "123456789"
  }
}
```

### After (New Structure)
```javascript
{
  email: "partner@example.com",
  roles: ["partner"],
  addresses: [],
  preferences: {
    dietary: [],
    notifications: { email: true, sms: false },
    language: "en"
  },
  partnerInfo: {
    restaurantId: ObjectId("..."),
    notificationPreferences: {
      orderAlerts: true,
      systemUpdates: true
    },
    billingInfo: {
      paymentMethod: "credit_card",
      taxId: "123456789"
    }
  }
}
```

## 📁 Files to Update

### 1. API Client Files

#### Partner Portal API Client
**File**: `apps/partner-portal/src/api/settingsApi.js`

**Changes Needed**:
- Update API calls to work with nested `partnerInfo` structure
- Modify data extraction to read from `user.partnerInfo.*`
- Update API endpoints to handle nested updates

**Updated Functions**:
```javascript
// Before
export const getNotificationPreferences = async () => {
  const response = await apiClient.get('/partner/users/me/notification-preferences');
  return response.data;
};

// After
export const getNotificationPreferences = async () => {
  const response = await apiClient.get('/partner/users/me');
  const partnerInfo = response.data.user?.partnerInfo;
  return {
    success: true,
    data: {
      preferences: partnerInfo.notificationPreferences || defaultPrefs
    }
  };
};
```

#### Customer App API Client
**File**: `apps/customer-app/src/api/userApi.js`

**Changes Needed**:
- Update user profile API calls to handle new `preferences` structure
- Add address management API calls for new `addresses` array
- Update authentication API calls to handle nested data

### 2. Context Files

#### Partner Portal AuthContext
**File**: `apps/partner-portal/src/contexts/AuthContext.jsx`

**Key Changes**:
- Add `partnerInfo` to state
- Add validation for `partnerInfo` existence
- Add helper functions to access nested data
- Update localStorage handling for nested structure

**New Helper Functions**:
```javascript
const getRestaurantId = () => state.partnerInfo?.restaurantId;
const getNotificationPreferences = () => state.partnerInfo?.notificationPreferences;
const getBillingInfo = () => state.partnerInfo?.billingInfo;
const getPartnerStatus = () => state.partnerInfo?.partnerStatus;
const isApprovedPartner = () => state.partnerInfo?.partnerStatus === 'approved';
```

#### Customer App AuthContext
**File**: `apps/customer-app/src/contexts/AuthContext.jsx`

**Key Changes**:
- Update user data handling for new `preferences` structure
- Add address management functions
- Update profile update functions for nested data

### 3. Component Files

#### Partner Portal Settings Page
**File**: `apps/partner-portal/src/pages/dashboard/SettingsPage.jsx`

**Key Changes**:
- Update form data structure to match nested schema
- Modify API calls to use new nested structure
- Update form field mappings
- Add partner status indicators

**Form Data Mapping**:
```javascript
// Before
emailNotifications: preferences.emailNotifications,
paymentMethod: billingInfo.paymentMethod,

// After
orderAlerts: partnerInfo.notificationPreferences?.orderAlerts,
paymentMethod: partnerInfo.billingInfo?.paymentMethod,
```

#### Customer App Profile Components
**Files**: Various profile and settings components

**Key Changes**:
- Update preference handling for new nested structure
- Add address management UI components
- Update form validation for nested data

### 4. Hook Files

#### useRestaurant Hook
**File**: `apps/partner-portal/src/hooks/useRestaurant.js`

**Key Changes**:
- Update restaurant ID extraction from `partnerInfo.restaurantId`
- Handle cases where `partnerInfo` might not exist

```javascript
// Before
const restaurantId = user?.restaurantId;

// After
const restaurantId = user?.partnerInfo?.restaurantId;
```

## 🔄 Migration Steps

### Step 1: Update API Client Files

1. **Replace API client files** with refactored versions:
   ```bash
   cp apps/partner-portal/src/api/settingsApi.refactored.js apps/partner-portal/src/api/settingsApi.js
   ```

2. **Test API calls** to ensure they work with new structure

### Step 2: Update Context Files

1. **Replace AuthContext files** with refactored versions:
   ```bash
   cp apps/partner-portal/src/contexts/AuthContext.refactored.jsx apps/partner-portal/src/contexts/AuthContext.jsx
   ```

2. **Update any other contexts** that depend on user data structure

### Step 3: Update Component Files

1. **Replace component files** with refactored versions:
   ```bash
   cp apps/partner-portal/src/pages/dashboard/SettingsPage.refactored.jsx apps/partner-portal/src/pages/dashboard/SettingsPage.jsx
   ```

2. **Update other components** that access user data directly

### Step 4: Update Hook Files

1. **Update custom hooks** to use new data structure
2. **Test hook functionality** with new nested data

### Step 5: Test and Validate

1. **Run frontend applications**
2. **Test user authentication**
3. **Test settings pages**
4. **Test profile management**
5. **Verify data persistence**

## 🛠 Code Patterns

### Accessing Nested Data

#### Before (Old Pattern)
```javascript
const restaurantId = user?.restaurantId;
const orderAlerts = user?.notificationPreferences?.orderAlerts;
const paymentMethod = user?.billingInfo?.paymentMethod;
```

#### After (New Pattern)
```javascript
const restaurantId = user?.partnerInfo?.restaurantId;
const orderAlerts = user?.partnerInfo?.notificationPreferences?.orderAlerts;
const paymentMethod = user?.partnerInfo?.billingInfo?.paymentMethod;
```

### Form Data Handling

#### Before (Old Pattern)
```javascript
const [formData, setFormData] = useState({
  orderAlerts: user?.notificationPreferences?.orderAlerts || true,
  paymentMethod: user?.billingInfo?.paymentMethod || ''
});
```

#### After (New Pattern)
```javascript
const [formData, setFormData] = useState({
  orderAlerts: user?.partnerInfo?.notificationPreferences?.orderAlerts || true,
  paymentMethod: user?.partnerInfo?.billingInfo?.paymentMethod || ''
});
```

### API Updates

#### Before (Old Pattern)
```javascript
const updateSettings = async (data) => {
  return await apiClient.patch('/partner/users/me/billing', {
    billingInfo: data
  });
};
```

#### After (New Pattern)
```javascript
const updateSettings = async (data) => {
  return await apiClient.patch('/partner/users/me', {
    partnerInfo: {
      billingInfo: data
    }
  });
};
```

## 🔍 Validation Checklist

### Authentication
- [ ] Partner users can log in successfully
- [ ] User data is properly stored in localStorage
- [ ] AuthContext provides correct user data
- [ ] Partner role validation works
- [ ] `partnerInfo` validation works

### Settings Management
- [ ] Restaurant settings load correctly
- [ ] Notification preferences load and save
- [ ] Billing information loads and saves
- [ ] Form validation works with nested data
- [ ] Success/error messages display correctly

### Data Access
- [ ] Components can access nested user data
- [ ] Hooks return correct data from nested structure
- [ ] API calls use correct endpoints and data format
- [ ] Error handling works for missing nested data

### User Experience
- [ ] No breaking changes in UI/UX
- [ ] Loading states work correctly
- [ ] Error states display appropriately
- [ ] Data persistence works across page refreshes

## ⚠️ Common Issues and Solutions

### Issue 1: Cannot read property of undefined
**Problem**: Trying to access nested properties that don't exist
```javascript
// This will throw error if partnerInfo is undefined
const restaurantId = user.partnerInfo.restaurantId;
```

**Solution**: Use optional chaining
```javascript
const restaurantId = user?.partnerInfo?.restaurantId;
```

### Issue 2: Form data not loading
**Problem**: Form expects old flat structure but gets nested structure

**Solution**: Update form data mapping
```javascript
// Before
setFormData({
  orderAlerts: user.notificationPreferences?.orderAlerts
});

// After
setFormData({
  orderAlerts: user.partnerInfo?.notificationPreferences?.orderAlerts
});
```

### Issue 3: API calls failing
**Problem**: API endpoints expect different data structure

**Solution**: Update API call data format
```javascript
// Before
await updateNotificationPreferences(preferences);

// After
await updatePartnerInfo({
  notificationPreferences: preferences
});
```

### Issue 4: Authentication failing
**Problem**: Partner validation fails due to missing `partnerInfo`

**Solution**: Ensure user has complete `partnerInfo` object
```javascript
const validatePartnerUser = (user) => {
  return user?.roles?.includes('partner') && 
         user?.partnerInfo?.restaurantId;
};
```

## 📋 Testing Strategy

### Unit Tests
- Test individual components with new data structure
- Test API client functions with nested data
- Test helper functions for data access

### Integration Tests
- Test complete user flows (login, settings, etc.)
- Test data persistence across page refreshes
- Test error handling for missing data

### Manual Testing
- Test all user-facing features
- Verify data displays correctly
- Test form submissions and updates
- Verify authentication flows

## 🚀 Deployment Strategy

### Development Environment
1. Deploy backend with new User model
2. Run data migration script
3. Update frontend with new code
4. Test thoroughly

### Staging Environment
1. Deploy backend changes
2. Run migration script
3. Deploy frontend changes
4. Run full test suite

### Production Environment
1. **Backup database** before migration
2. Deploy backend with backward compatibility
3. Run data migration script during maintenance window
4. Deploy frontend changes
5. Monitor for issues
6. Have rollback plan ready

## 📚 Additional Resources

- [Backend User Model Refactoring Guide](./USER_MODEL_REFACTORING.md)
- [Data Migration Script](./backend/scripts/migrateUsers.js)
- [API Documentation](./backend/docs/API.md)
- [Testing Guidelines](./TESTING.md)

## 🎉 Conclusion

This migration updates the frontend to work with the new modular User model structure. The key changes involve:

1. **Nested Data Access**: Using `user.partnerInfo.*` instead of `user.*`
2. **Updated API Calls**: Sending nested data structures
3. **Enhanced Validation**: Checking for required nested objects
4. **Improved Organization**: Better separation of concerns

After completing this migration, the frontend will be more maintainable and aligned with the new backend structure while providing the same user experience.
