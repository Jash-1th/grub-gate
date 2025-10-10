# Integration Guide: Joi Validation System

This guide shows how to integrate the new Joi validation system into your existing Partner Portal forms.

## 🚀 Quick Migration Steps

### 1. Update Package.json Dependencies

Ensure Joi is installed:
```bash
npm install joi
```

### 2. Replace Existing Form Validation

#### Before (Manual Validation):
```jsx
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // Clear field-specific errors
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Manual validation
  const validationErrors = {};
  if (!formData.firstName?.trim()) {
    validationErrors.firstName = 'First name is required';
  }
  if (!formData.email?.includes('@')) {
    validationErrors.email = 'Invalid email';
  }
  
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  // Submit logic...
};
```

#### After (Joi Validation):
```jsx
import useFormValidation from '../hooks/useFormValidation';
import ValidatedInput from '../components/common/ValidatedInput';
import schemas from '../utils/validation/schemas';

const {
  formData,
  handleSubmit,
  getFieldProps,
  isValid,
  errors
} = useFormValidation(
  { firstName: '', email: '' },
  schemas.userSchemas.personalInfo
);

const onSubmit = handleSubmit(async (validatedData) => {
  // Data is guaranteed to be valid here
  // Submit logic...
});
```

### 3. Replace Input Components

#### Before (Manual Input):
```jsx
<div>
  <label>First Name *</label>
  <input
    type="text"
    name="firstName"
    value={formData.firstName || ''}
    onChange={handleInputChange}
    className={errors.firstName ? 'border-red-300' : 'border-gray-300'}
  />
  {errors.firstName && (
    <p className="text-red-600">{errors.firstName}</p>
  )}
</div>
```

#### After (ValidatedInput):
```jsx
<ValidatedInput
  label="First Name"
  name="firstName"
  required
  {...getFieldProps('firstName')}
/>
```

## 📋 Form-Specific Integration Examples

### MenuPage Integration

```jsx
// Replace the existing MenuPage form section with:
import useFormValidation from '../../hooks/useFormValidation';
import ValidatedInput from '../../components/common/ValidatedInput';
import schemas from '../../utils/validation/schemas';

const MenuPage = () => {
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
      prepTime: 30,
      dietaryPreferences: [],
      ingredients: []
    },
    schemas.menuItemSchemas.basicInfo
  );

  // Handle ingredients text conversion
  const handleIngredientsChange = (e) => {
    const value = e.target.value;
    const ingredientsArray = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    setFieldValue('ingredients', ingredientsArray);
  };

  const onSubmit = handleSubmit(async (validatedData) => {
    try {
      await saveMenuItem(validatedData);
      // Success handling
    } catch (error) {
      // Error handling
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <ValidatedInput
        label="Menu Item Name"
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
      
      <ValidatedInput
        label="Category"
        name="category"
        type="select"
        required
        options={categoryOptions}
        {...getFieldProps('category')}
      />
      
      <button type="submit" disabled={!isValid}>
        Save Menu Item
      </button>
    </form>
  );
};
```

### SettingsPage Integration

```jsx
// For restaurant settings form:
const {
  formData,
  handleSubmit,
  getFieldProps,
  isValid
} = useFormValidation(
  restaurantData,
  schemas.restaurantSchemas.basicInfo
);

const onSubmit = handleSubmit(async (validatedData) => {
  await updateRestaurantSettings(validatedData);
});

return (
  <form onSubmit={onSubmit}>
    <ValidatedInput
      label="Restaurant Name"
      name="name"
      required
      {...getFieldProps('name')}
    />
    
    <ValidatedInput
      label="Phone Number"
      name="phone"
      type="tel"
      required
      {...getFieldProps('phone')}
    />
    
    <ValidatedInput
      label="Website"
      name="website"
      type="url"
      {...getFieldProps('website')}
    />
  </form>
);
```

### Login/Registration Forms

```jsx
// OTP Request Form
const {
  formData,
  handleSubmit,
  getFieldProps,
  isValid
} = useFormValidation(
  { identifier: '', channel: 'email' },
  schemas.authSchemas.otpRequest
);

// OTP Verification Form
const {
  formData: otpData,
  handleSubmit: handleOtpSubmit,
  getFieldProps: getOtpFieldProps,
  isValid: isOtpValid
} = useFormValidation(
  { identifier: '', otp: '' },
  schemas.authSchemas.otpVerification
);
```

## 🔧 Advanced Integration Patterns

### Complex Form Sections

```jsx
// For forms with multiple validation schemas
const personalInfoValidation = useFormValidation(
  personalData,
  schemas.userSchemas.personalInfo
);

const addressValidation = useFormValidation(
  addressData,
  schemas.userSchemas.address
);

const restaurantValidation = useFormValidation(
  restaurantData,
  schemas.restaurantSchemas.basicInfo
);

// Check if all sections are valid
const isFormValid = personalInfoValidation.isValid && 
                   addressValidation.isValid && 
                   restaurantValidation.isValid;
```

### Custom Validation Logic

```jsx
const {
  formData,
  handleSubmit,
  setFieldError,
  clearFieldError
} = useFormValidation(initialData, schema);

// Add custom validation
const handleCustomValidation = async (fieldName, value) => {
  clearFieldError(fieldName);
  
  try {
    // Custom async validation
    const exists = await checkIfExists(value);
    if (exists) {
      setFieldError(fieldName, 'This value already exists');
    }
  } catch (error) {
    setFieldError(fieldName, 'Unable to verify');
  }
};
```

### File Upload Integration

```jsx
// For forms with file uploads
const [files, setFiles] = useState({ logo: null, images: [] });

const handleFileChange = (e, fileType) => {
  const selectedFiles = Array.from(e.target.files);
  
  // Validate file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const invalidFiles = selectedFiles.filter(file => 
    !allowedTypes.includes(file.type)
  );
  
  if (invalidFiles.length > 0) {
    setFieldError(fileType, 'Please upload only JPEG, PNG, or WebP images');
    return;
  }
  
  setFiles(prev => ({ ...prev, [fileType]: selectedFiles[0] }));
  clearFieldError(fileType);
};

// In form submission
const onSubmit = handleSubmit(async (validatedData) => {
  const formData = new FormData();
  
  // Append validated form data
  Object.keys(validatedData).forEach(key => {
    formData.append(key, validatedData[key]);
  });
  
  // Append files
  if (files.logo) formData.append('logo', files.logo);
  
  await submitForm(formData);
});
```

## 🎨 Styling Integration

### Custom Input Styling

```jsx
// Override ValidatedInput styles
<ValidatedInput
  label="Custom Styled Input"
  name="customField"
  className="mb-6"
  inputClassName="border-2 border-blue-300 focus:border-blue-500"
  labelClassName="text-blue-700 font-semibold"
  errorClassName="text-red-500 text-xs"
  {...getFieldProps('customField')}
/>
```

### Conditional Styling

```jsx
// Style based on validation state
<ValidatedInput
  label="Restaurant Name"
  name="restaurantName"
  className={`transition-all duration-200 ${
    errors.restaurantName ? 'shake-animation' : ''
  }`}
  showValidIcon={true}
  {...getFieldProps('restaurantName')}
/>
```

## 🐛 Debugging Integration Issues

### Common Issues and Solutions

1. **Schema Not Found Error**:
```jsx
// Make sure to import the correct schema
import schemas from '../utils/validation/schemas';

// Use the correct schema path
schemas.menuItemSchemas.basicInfo // ✅ Correct
schemas.menuItem.basic // ❌ Incorrect
```

2. **Field Props Not Working**:
```jsx
// Make sure to spread getFieldProps correctly
<ValidatedInput
  {...getFieldProps('fieldName')} // ✅ Correct
  fieldProps={getFieldProps('fieldName')} // ❌ Incorrect
/>
```

3. **Validation Not Triggering**:
```jsx
// Check if schema is passed correctly
useFormValidation(
  initialData,
  schemas.userSchemas.personalInfo // ✅ Schema provided
);

useFormValidation(initialData); // ❌ No schema
```

### Debug Mode

```jsx
// Enable debug mode in development
{process.env.NODE_ENV === 'development' && (
  <div className="bg-blue-50 p-3 rounded">
    <p>Form Valid: {isValid ? '✅' : '❌'}</p>
    <p>Errors: {JSON.stringify(errors, null, 2)}</p>
    <p>Form Data: {JSON.stringify(formData, null, 2)}</p>
  </div>
)}
```

## 📝 Migration Checklist

- [ ] Install Joi dependency
- [ ] Import validation hooks and components
- [ ] Replace manual validation with useFormValidation
- [ ] Replace input components with ValidatedInput
- [ ] Update form submission handlers
- [ ] Test all form fields and validation messages
- [ ] Update error handling logic
- [ ] Test file upload forms (if applicable)
- [ ] Verify accessibility features
- [ ] Test on mobile devices
- [ ] Update any custom styling
- [ ] Remove old validation code

## 🚀 Next Steps

1. **Start with one form** (e.g., MenuPage) to test the integration
2. **Gradually migrate other forms** using the patterns above
3. **Customize error messages** if needed in schemas.js
4. **Add custom validation logic** for business-specific rules
5. **Test thoroughly** with various input combinations
6. **Update documentation** for your team

The validation system is now ready to provide a consistent, user-friendly experience across all Partner Portal forms!
