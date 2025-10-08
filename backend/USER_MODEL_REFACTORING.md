# User Model Refactoring

This document describes the refactoring of the User model into a more organized and maintainable structure using sub-schemas and Mongoose plugins.

## 🎯 Objectives

- **Modularity**: Split large User model into smaller, focused sub-schemas
- **Reusability**: Create reusable authentication plugin
- **Maintainability**: Easier to modify and extend individual components
- **Organization**: Clear separation of concerns

## 📁 New File Structure

```
src/
└── models/
    ├── User.js                     # Original model (backup)
    ├── User.refactored.js          # New refactored model
    ├── schemas/
    │   ├── addressSchema.js        # Address management
    │   ├── partnerInfoSchema.js    # Partner-specific data
    │   └── preferencesSchema.js    # User preferences
    ├── plugins/
    │   └── authPlugin.js           # Authentication logic
    └── scripts/
        └── migrateUsers.js         # Data migration script
```

## 🔧 Components

### 1. Authentication Plugin (`plugins/authPlugin.js`)

Contains all authentication-related functionality:
- **Fields**: `passwordHash`, `emailVerified`, `phoneVerified`, tokens, etc.
- **Methods**: `matchPassword()`, `getResetPasswordToken()`, `hashToken()`
- **Hooks**: Password hashing pre-save middleware

```javascript
// Usage
userSchema.plugin(authPlugin);
```

### 2. Address Schema (`schemas/addressSchema.js`)

Manages user addresses:
- **Fields**: `street`, `city`, `postalCode`, `country`, `isDefault`, etc.
- **Features**: Validation, indexing, virtual for full address
- **Types**: home, work, other

### 3. Partner Info Schema (`schemas/partnerInfoSchema.js`)

Partner-specific data (only for users with 'partner' role):
- **Restaurant Reference**: `restaurantId`
- **Notification Preferences**: Order alerts, system updates, etc.
- **Billing Information**: Payment methods, tax ID, bank details
- **Partner Status**: pending, approved, suspended, rejected
- **Methods**: `approve()`, `suspend()`

### 4. Preferences Schema (`schemas/preferencesSchema.js`)

User preferences and settings:
- **Dietary Preferences**: vegetarian, vegan, gluten-free, etc.
- **Notifications**: email, SMS, push notifications
- **Localization**: language, currency, timezone
- **Delivery**: default tip, preferred delivery time
- **Methods**: `addDietaryPreference()`, `updateNotifications()`

## 🚀 Migration Process

### Step 1: Deploy New Model Structure

1. **Backup current User.js**:
   ```bash
   cp src/models/User.js src/models/User.backup.js
   ```

2. **Replace with refactored version**:
   ```bash
   cp src/models/User.refactored.js src/models/User.js
   ```

3. **Test the new model** with your application

### Step 2: Run Data Migration

The migration script will:
- Move partner-specific fields into `partnerInfo` nested object
- Update preferences structure to match new schema
- Add missing `addresses` array field
- Validate the migration

```bash
# Run migration
node scripts/migrateUsers.js

# Dry run (check what would be migrated)
node scripts/migrateUsers.js --dry-run
```

### Step 3: Verify Migration

The script includes validation to ensure:
- All partner users have `partnerInfo` object
- Old top-level fields are removed
- All users have `addresses` array
- Preferences are updated to new structure

## 📊 Data Structure Changes

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
  },
  preferences: {
    dietary: ["vegetarian"],
    notifications: {
      email: true,
      sms: false
    }
  }
  // Missing addresses array
}
```

### After (New Structure)
```javascript
{
  email: "partner@example.com",
  roles: ["partner"],
  addresses: [],
  preferences: {
    dietary: ["vegetarian"],
    notifications: {
      email: true,
      sms: false,
      push: true,
      orderUpdates: true,
      promotions: false,
      newsletter: false
    },
    language: "en",
    currency: "CAD",
    timezone: "America/Toronto",
    theme: "auto",
    deliveryPreferences: {
      defaultTip: 15,
      preferredDeliveryTime: "asap"
    }
  },
  partnerInfo: {
    restaurantId: ObjectId("..."),
    notificationPreferences: {
      orderAlerts: true,
      systemUpdates: true,
      promotionalEmails: false,
      weeklyReports: true
    },
    billingInfo: {
      paymentMethod: "credit_card",
      taxId: "123456789"
    },
    partnerStatus: "approved",
    partnerSince: ISODate("..."),
    approvedAt: ISODate("..."),
    commissionRate: 15
  }
}
```

## 🔍 Key Benefits

### 1. **Modularity**
- Each schema focuses on specific functionality
- Easy to modify individual components
- Reusable across different models if needed

### 2. **Type Safety**
- Better validation with focused schemas
- Clear data structure definitions
- Reduced risk of data inconsistencies

### 3. **Performance**
- Targeted indexes on sub-schema fields
- Efficient queries for specific data types
- Reduced document size for non-partner users

### 4. **Maintainability**
- Clear separation of concerns
- Easier testing of individual components
- Simplified debugging and development

## 🛠 Usage Examples

### Creating a New User
```javascript
const user = new User({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  roles: ['customer'],
  preferences: {
    dietary: ['vegetarian'],
    language: 'en'
  },
  addresses: [{
    type: 'home',
    street: '123 Main St',
    city: 'Toronto',
    postalCode: 'M5V 3A8',
    country: 'Canada',
    isDefault: true
  }]
});
```

### Creating a Partner User
```javascript
const partner = new User({
  email: 'partner@restaurant.com',
  firstName: 'Jane',
  lastName: 'Smith',
  roles: ['partner'],
  partnerInfo: {
    restaurantId: restaurantId,
    partnerStatus: 'pending',
    notificationPreferences: {
      orderAlerts: true,
      systemUpdates: true
    },
    billingInfo: {
      taxId: '123456789'
    }
  }
});
```

### Using Authentication Methods
```javascript
// Set password
user.passwordHash = 'plainTextPassword';
await user.save(); // Automatically hashed by plugin

// Check password
const isMatch = await user.matchPassword('plainTextPassword');

// Generate reset token
const resetToken = user.getResetPasswordToken();
await user.save();
```

### Managing Addresses
```javascript
// Add address
await user.addAddress({
  type: 'work',
  street: '456 Business Ave',
  city: 'Toronto',
  postalCode: 'M5H 2N2',
  country: 'Canada'
});

// Get default address
const defaultAddress = user.getDefaultAddress();
```

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Test Thoroughly**: Test the new model structure in a development environment
3. **Monitor Performance**: Check query performance after migration
4. **Update Controllers**: Update any controllers that reference old field names
5. **API Compatibility**: Ensure API responses are updated for new structure

## 🔄 Rollback Plan

If issues arise, you can rollback by:
1. Restoring the original User.js model
2. Running a reverse migration script (would need to be created)
3. Restoring from database backup

## 📝 Testing

After migration, test:
- User creation and authentication
- Partner user functionality
- Address management
- Preference updates
- API endpoints that use User model
- Database queries and performance

## 🎉 Conclusion

This refactoring provides a solid foundation for future development with improved organization, maintainability, and extensibility. The modular approach makes it easier to add new features and modify existing functionality without affecting the entire User model.
