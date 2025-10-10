# Joi Validation System for Partner Portal

This comprehensive validation system provides user-friendly error messages and consistent form validation across the Partner Portal application.

## 🎯 Features

- **Comprehensive Schema Coverage**: Validation for all backend models (User, Restaurant, MenuItem, etc.)
- **User-Friendly Error Messages**: Clear, actionable error messages instead of technical jargon
- **Real-time Validation**: Validate fields as users type with debouncing
- **React Hook Integration**: Easy-to-use `useFormValidation` hook
- **Enhanced Input Components**: `ValidatedInput` component with built-in error display
- **Pattern Matching**: Smart validation for emails, phone numbers, postal codes, etc.
- **Internationalization Ready**: Support for multiple locales and formats

## 📁 File Structure

```
src/utils/validation/
├── schemas.js          # Joi validation schemas
├── validator.js        # Validation utility class
└── README.md          # This documentation

src/hooks/
└── useFormValidation.js # React hook for form validation

src/components/common/
└── ValidatedInput.jsx  # Enhanced input component

src/examples/
├── MenuFormExample.jsx # Complete menu form example
└── BusinessDetailsStep.enhanced.jsx # Enhanced registration form
```

## 🚀 Quick Start

### 1. Basic Form Validation

```jsx
import useFormValidation from '../hooks/useFormValidation';
import ValidatedInput from '../components/common/ValidatedInput';
import schemas from '../utils/validation/schemas';

const MyForm = () => {
  const {
    formData,
    handleSubmit,
    getFieldProps,
    isValid,
    errors
  } = useFormValidation(
    { name: '', email: '' }, // Initial data
    schemas.userSchemas.personalInfo // Validation schema
  );

  const onSubmit = handleSubmit(async (validatedData) => {
    // Form is guaranteed to be valid here
    console.log('Validated data:', validatedData);
  });

  return (
    <form onSubmit={onSubmit}>
      <ValidatedInput
        label="Full Name"
        name="name"
        required
        {...getFieldProps('name')}
      />
      
      <ValidatedInput
        label="Email Address"
        name="email"
        type="email"
        required
        {...getFieldProps('email')}
      />
      
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
};
```

### 2. Menu Item Form

```jsx
import useFormValidation from '../hooks/useFormValidation';
import schemas from '../utils/validation/schemas';

const MenuItemForm = () => {
  const {
    formData,
    handleSubmit,
    getFieldProps,
    setFieldValue,
    isValid
  } = useFormValidation(
    {
      name: '',
      description: '',
      price: '',
      category: '',
      dietaryPreferences: []
    },
    schemas.menuItemSchemas.basicInfo
  );

  // Handle checkbox arrays
  const handleDietaryChange = (value, checked) => {
    const current = formData.dietaryPreferences || [];
    const updated = checked 
      ? [...current, value]
      : current.filter(item => item !== value);
    setFieldValue('dietaryPreferences', updated);
  };

  return (
    <form onSubmit={handleSubmit(async (data) => {
      await saveMenuItem(data);
    })}>
      <ValidatedInput
        label="Item Name"
        name="name"
        required
        {...getFieldProps('name')}
      />
      
      <ValidatedInput
        label="Price"
        name="price"
        type="number"
        min="0"
        step="0.01"
        required
        {...getFieldProps('price')}
      />
      
      {/* Dietary preferences checkboxes */}
      <div>
        <label>Dietary Preferences</label>
        {['vegetarian', 'vegan', 'gluten-free'].map(option => (
          <label key={option}>
            <input
              type="checkbox"
              checked={formData.dietaryPreferences?.includes(option)}
              onChange={(e) => handleDietaryChange(option, e.target.checked)}
            />
            {option}
          </label>
        ))}
      </div>
      
      <button type="submit" disabled={!isValid}>
        Save Menu Item
      </button>
    </form>
  );
};
```

## 📋 Available Schemas

### User Schemas
- `userSchemas.personalInfo` - First name, last name, email, phone
- `userSchemas.password` - Password with confirmation
- `userSchemas.address` - Complete address validation

### Restaurant Schemas
- `restaurantSchemas.basicInfo` - Name, description, cuisine, contact
- `restaurantSchemas.operatingHours` - Weekly operating hours
- `restaurantSchemas.deliverySettings` - Delivery radius, fees, timing
- `restaurantSchemas.billingInfo` - Complete billing information

### Menu Item Schemas
- `menuItemSchemas.basicInfo` - Name, description, price, category
- `menuItemSchemas.dietaryInfo` - Dietary preferences, allergens
- `menuItemSchemas.nutritionInfo` - Calories, protein, carbs, fat
- `menuItemSchemas.availability` - Status and weekly availability

### Authentication Schemas
- `authSchemas.otpRequest` - OTP request validation
- `authSchemas.otpVerification` - OTP verification
- `authSchemas.login` - Login form validation

### Registration Schemas
- `registrationSchemas.businessDetails` - Complete business registration
- `registrationSchemas.billingDetails` - Billing and payment info

## 🎨 ValidatedInput Component

The `ValidatedInput` component provides consistent styling and error handling:

```jsx
<ValidatedInput
  label="Restaurant Name"
  name="restaurantName"
  type="text"                    // text, email, password, number, select, textarea, etc.
  required={true}
  disabled={false}
  placeholder="Enter restaurant name"
  helperText="This will be displayed publicly"
  showValidIcon={true}           // Show green checkmark when valid
  showPasswordToggle={true}      // For password fields
  options={[]}                   // For select/radio inputs
  min={0}                        // For number inputs
  max={100}
  step={0.01}
  rows={3}                       // For textarea
  accept="image/*"               // For file inputs
  multiple={false}
  {...getFieldProps('restaurantName')}
/>
```

## 🔧 Advanced Usage

### Custom Validation

```jsx
import validator from '../utils/validation/validator';

// Validate single field
const result = validator.validateField('email', 'user@example.com', schemas.userSchemas.personalInfo);
if (!result.isValid) {
  console.log('Error:', result.error);
}

// Custom validation logic
const customValidation = (data) => {
  const result = validator.validate(data, schemas.menuItemSchemas.basicInfo);
  
  // Add custom business logic
  if (data.price > 100) {
    result.errors.price = 'Price seems too high. Please verify.';
    result.isValid = false;
  }
  
  return result;
};
```

### Real-time Field Validation

```jsx
const {
  validateSingleField,
  setFieldError,
  clearFieldError
} = useFormValidation(initialData, schema);

// Validate field on custom event
const handleCustomValidation = async (fieldName, value) => {
  // Clear previous errors
  clearFieldError(fieldName);
  
  // Custom async validation (e.g., check if username exists)
  try {
    const exists = await checkUsernameExists(value);
    if (exists) {
      setFieldError(fieldName, 'Username already taken');
    }
  } catch (error) {
    setFieldError(fieldName, 'Unable to verify username');
  }
};
```

### Form Sections

```jsx
// Validate different sections of a large form
const personalInfoResult = validator.validatePersonalInfo(formData);
const addressResult = validator.validateAddress(formData);
const restaurantResult = validator.validateRestaurantBasicInfo(formData);

// Show section-specific errors
if (!personalInfoResult.isValid) {
  console.log('Personal info errors:', personalInfoResult.errors);
}
```

## 🌍 Internationalization

The validation system supports multiple formats:

```jsx
// Canadian postal codes: M5V 3A8
// Indian postal codes: 515671
// Phone numbers: +1-234-567-8900, (555) 123-4567
// Business numbers: 123456789RP0001 (Canadian)
// GST/HST numbers: 123456789RT0001
```

## 🎯 Error Message Examples

Instead of technical Joi errors, users see friendly messages:

- ❌ `"firstName" is required` 
- ✅ `First name is required`

- ❌ `"email" must be a valid email`
- ✅ `Please enter a valid email address (e.g., user@example.com)`

- ❌ `"phoneNumber" with value "+1234" fails to match the required pattern`
- ✅ `Please enter a valid phone number (e.g., +1-234-567-8900)`

- ❌ `"price" must be greater than or equal to 0`
- ✅ `Price cannot be negative`

## 🐛 Debugging

Enable development mode validation summary:

```jsx
{process.env.NODE_ENV === 'development' && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
    <p className="text-sm text-blue-800">{validationSummary}</p>
    {hasErrors && (
      <details className="mt-2">
        <summary className="text-xs text-blue-600 cursor-pointer">
          View validation errors
        </summary>
        <pre className="text-xs mt-1 text-blue-700">
          {JSON.stringify(validationErrors, null, 2)}
        </pre>
      </details>
    )}
  </div>
)}
```

## 📈 Performance Tips

1. **Debouncing**: The validation hook includes built-in debouncing (default 300ms)
2. **Conditional Validation**: Only validate fields that have been touched
3. **Schema Caching**: Schemas are cached and reused across components
4. **Lazy Loading**: Import only the schemas you need

## 🔒 Security Considerations

- All validation happens on both client and server
- Client-side validation is for UX only
- Server-side validation is the source of truth
- Sensitive data (passwords) are handled securely
- File uploads are validated for type and size

## 🚀 Migration Guide

To migrate existing forms:

1. **Replace manual validation** with `useFormValidation` hook
2. **Replace input components** with `ValidatedInput`
3. **Update error handling** to use validation errors
4. **Add appropriate schemas** from the schemas file
5. **Test thoroughly** with various input combinations

## 📝 Best Practices

1. **Always validate on both client and server**
2. **Use appropriate input types** (email, tel, number, etc.)
3. **Provide helpful placeholder text and examples**
4. **Show validation errors only after user interaction**
5. **Disable submit buttons when form is invalid**
6. **Use loading states during validation**
7. **Test with edge cases and invalid data**

This validation system ensures consistent, user-friendly form validation across the entire Partner Portal application while maintaining type safety and comprehensive error handling.
