// FILE: src/pages/auth/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faCar,
  faIdCard,
  faFileUpload,
  faCheckCircle,
  faTruck,
  faArrowRight,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { registerDasher } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/auth-pages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, updateUser, updateDasher } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Vehicle Information
    vehicleType: 'car',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    vehicleColor: '',
    
    // Step 3: License & Documents
    licenseNumber: '',
    licenseExpiry: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiry: '',
    
    // Step 4: Service Area & Banking
    serviceCity: '',
    serviceProvince: '',
    serviceRadius: '10',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    driversLicenseFront: null,
    driversLicenseBack: null,
    vehicleRegistration: null,
    insuranceDocument: null,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
      
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number format (use +1234567890)';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date is required';
    if (!files.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
    if (!files.driversLicenseFront) newErrors.driversLicenseFront = 'Driver\'s license front is required';
    if (!files.driversLicenseBack) newErrors.driversLicenseBack = 'Driver\'s license back is required';
    if (!files.vehicleRegistration) newErrors.vehicleRegistration = 'Vehicle registration is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    
    if (!formData.serviceCity.trim()) newErrors.serviceCity = 'Service city is required';
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        
        // Check if email or phone already exists before going to step 2
        if (isValid) {
          setLoading(true);
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/check-user`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: formData.email,
                phoneNumber: formData.phoneNumber
              })
            });
            
            const result = await response.json();
            console.log('Check user response:', result);
            
            // Check if user exists in the response data
            if (result.data && result.data.exists === true) {
              const newErrors = {};
              if (result.data.field === 'email') {
                newErrors.email = 'This email is already registered. Please login instead.';
              } else if (result.data.field === 'phoneNumber') {
                newErrors.phoneNumber = 'This phone number is already registered. Please login instead.';
              }
              setErrors(newErrors);
              isValid = false;
              setLoading(false);
              return; // Stop here, don't proceed to next step
            }
          } catch (error) {
            console.error('Error checking user:', error);
            // Continue anyway if check fails
          } finally {
            setLoading(false);
          }
        }
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }
    
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep4()) return;
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });
      
      const response = await registerDasher(submitData);
      
      if (response.success) {
        // Store tokens and user data in localStorage
        localStorage.setItem('dasher_token', response.data.accessToken);
        localStorage.setItem('dasher_refresh_token', response.data.refreshToken);
        localStorage.setItem('dasher_user', JSON.stringify(response.data.user));
        
        // Update AuthContext state for immediate login
        updateUser(response.data.user);
        updateDasher(response.data.dasher);
        
        // Redirect to dashboard (user is now logged in)
        navigate('/dashboard');
      } else {
        setErrors({ submit: response.message || 'Registration failed' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3>Personal Information</h3>
      <p className="step-description">Let's start with your basic information</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">
            <FontAwesomeIcon icon={faUser} /> First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="John"
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">
            <FontAwesomeIcon icon={faUser} /> Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Doe"
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="email">
          <FontAwesomeIcon icon={faEnvelope} /> Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="john.doe@example.com"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="phoneNumber">
          <FontAwesomeIcon icon={faPhone} /> Phone Number *
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="+1234567890"
          className={errors.phoneNumber ? 'error' : ''}
        />
        {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">
            <FontAwesomeIcon icon={faLock} /> Password *
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Min. 6 characters"
              className={errors.password ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">
            <FontAwesomeIcon icon={faLock} /> Confirm Password *
          </label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>Vehicle Information</h3>
      <p className="step-description">Tell us about your delivery vehicle</p>
      
      <div className="form-group">
        <label htmlFor="vehicleType">
          <FontAwesomeIcon icon={faCar} /> Vehicle Type *
        </label>
        <select
          id="vehicleType"
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleInputChange}
          className={errors.vehicleType ? 'error' : ''}
        >
          <option value="bike">Bike</option>
          <option value="scooter">Scooter</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="car">Car</option>
        </select>
        {errors.vehicleType && <span className="error-text">{errors.vehicleType}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="vehicleMake">Vehicle Make</label>
          <input
            type="text"
            id="vehicleMake"
            name="vehicleMake"
            value={formData.vehicleMake}
            onChange={handleInputChange}
            placeholder="e.g., Honda"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="vehicleModel">Vehicle Model</label>
          <input
            type="text"
            id="vehicleModel"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleInputChange}
            placeholder="e.g., Civic"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="vehicleYear">Vehicle Year</label>
          <input
            type="number"
            id="vehicleYear"
            name="vehicleYear"
            value={formData.vehicleYear}
            onChange={handleInputChange}
            placeholder="2020"
            min="1990"
            max={new Date().getFullYear() + 1}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="vehicleColor">Vehicle Color</label>
          <input
            type="text"
            id="vehicleColor"
            name="vehicleColor"
            value={formData.vehicleColor}
            onChange={handleInputChange}
            placeholder="e.g., Black"
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="licensePlate">
          License Plate Number *
        </label>
        <input
          type="text"
          id="licensePlate"
          name="licensePlate"
          value={formData.licensePlate}
          onChange={handleInputChange}
          placeholder="ABC-1234"
          className={errors.licensePlate ? 'error' : ''}
          style={{ textTransform: 'uppercase' }}
        />
        {errors.licensePlate && <span className="error-text">{errors.licensePlate}</span>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>License & Documents</h3>
      <p className="step-description">Upload your required documents</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="licenseNumber">
            <FontAwesomeIcon icon={faIdCard} /> Driver's License Number *
          </label>
          <input
            type="text"
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            placeholder="DL123456789"
            className={errors.licenseNumber ? 'error' : ''}
          />
          {errors.licenseNumber && <span className="error-text">{errors.licenseNumber}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="licenseExpiry">License Expiry Date *</label>
          <input
            type="date"
            id="licenseExpiry"
            name="licenseExpiry"
            value={formData.licenseExpiry}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className={errors.licenseExpiry ? 'error' : ''}
          />
          {errors.licenseExpiry && <span className="error-text">{errors.licenseExpiry}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="profilePhoto">
          <FontAwesomeIcon icon={faFileUpload} /> Profile Photo *
        </label>
        <input
          type="file"
          id="profilePhoto"
          name="profilePhoto"
          onChange={handleFileChange}
          accept="image/*"
          className={errors.profilePhoto ? 'error' : ''}
        />
        {files.profilePhoto && <span className="file-name">{files.profilePhoto.name}</span>}
        {errors.profilePhoto && <span className="error-text">{errors.profilePhoto}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="driversLicenseFront">
          <FontAwesomeIcon icon={faFileUpload} /> Driver's License (Front) *
        </label>
        <input
          type="file"
          id="driversLicenseFront"
          name="driversLicenseFront"
          onChange={handleFileChange}
          accept="image/*"
          className={errors.driversLicenseFront ? 'error' : ''}
        />
        {files.driversLicenseFront && <span className="file-name">{files.driversLicenseFront.name}</span>}
        {errors.driversLicenseFront && <span className="error-text">{errors.driversLicenseFront}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="driversLicenseBack">
          <FontAwesomeIcon icon={faFileUpload} /> Driver's License (Back) *
        </label>
        <input
          type="file"
          id="driversLicenseBack"
          name="driversLicenseBack"
          onChange={handleFileChange}
          accept="image/*"
          className={errors.driversLicenseBack ? 'error' : ''}
        />
        {files.driversLicenseBack && <span className="file-name">{files.driversLicenseBack.name}</span>}
        {errors.driversLicenseBack && <span className="error-text">{errors.driversLicenseBack}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="vehicleRegistration">
          <FontAwesomeIcon icon={faFileUpload} /> Vehicle Registration *
        </label>
        <input
          type="file"
          id="vehicleRegistration"
          name="vehicleRegistration"
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className={errors.vehicleRegistration ? 'error' : ''}
        />
        {files.vehicleRegistration && <span className="file-name">{files.vehicleRegistration.name}</span>}
        {errors.vehicleRegistration && <span className="error-text">{errors.vehicleRegistration}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="insuranceProvider">Insurance Provider (Optional)</label>
        <input
          type="text"
          id="insuranceProvider"
          name="insuranceProvider"
          value={formData.insuranceProvider}
          onChange={handleInputChange}
          placeholder="e.g., State Farm"
        />
      </div>
      
      {formData.insuranceProvider && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="insurancePolicyNumber">Policy Number</label>
              <input
                type="text"
                id="insurancePolicyNumber"
                name="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={handleInputChange}
                placeholder="Policy number"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="insuranceExpiry">Insurance Expiry</label>
              <input
                type="date"
                id="insuranceExpiry"
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="insuranceDocument">
              <FontAwesomeIcon icon={faFileUpload} /> Insurance Document
            </label>
            <input
              type="file"
              id="insuranceDocument"
              name="insuranceDocument"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
            />
            {files.insuranceDocument && <span className="file-name">{files.insuranceDocument.name}</span>}
          </div>
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h3>Service Area & Emergency Contact</h3>
      <p className="step-description">Final step - almost done!</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="serviceCity">Service City *</label>
          <input
            type="text"
            id="serviceCity"
            name="serviceCity"
            value={formData.serviceCity}
            onChange={handleInputChange}
            placeholder="e.g., Toronto"
            className={errors.serviceCity ? 'error' : ''}
          />
          {errors.serviceCity && <span className="error-text">{errors.serviceCity}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="serviceProvince">Province/State</label>
          <input
            type="text"
            id="serviceProvince"
            name="serviceProvince"
            value={formData.serviceProvince}
            onChange={handleInputChange}
            placeholder="e.g., ON"
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="serviceRadius">Service Radius (km)</label>
        <input
          type="number"
          id="serviceRadius"
          name="serviceRadius"
          value={formData.serviceRadius}
          onChange={handleInputChange}
          min="5"
          max="50"
        />
      </div>
      
      <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Emergency Contact</h4>
      
      <div className="form-group">
        <label htmlFor="emergencyContactName">Contact Name *</label>
        <input
          type="text"
          id="emergencyContactName"
          name="emergencyContactName"
          value={formData.emergencyContactName}
          onChange={handleInputChange}
          placeholder="Full name"
          className={errors.emergencyContactName ? 'error' : ''}
        />
        {errors.emergencyContactName && <span className="error-text">{errors.emergencyContactName}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="emergencyContactPhone">Contact Phone *</label>
          <input
            type="tel"
            id="emergencyContactPhone"
            name="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={handleInputChange}
            placeholder="+1234567890"
            className={errors.emergencyContactPhone ? 'error' : ''}
          />
          {errors.emergencyContactPhone && <span className="error-text">{errors.emergencyContactPhone}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="emergencyContactRelationship">Relationship</label>
          <input
            type="text"
            id="emergencyContactRelationship"
            name="emergencyContactRelationship"
            value={formData.emergencyContactRelationship}
            onChange={handleInputChange}
            placeholder="e.g., Spouse, Parent"
          />
        </div>
      </div>
      
      <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Banking Information (Optional)</h4>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
        Add your banking details to receive payments
      </p>
      
      <div className="form-group">
        <label htmlFor="bankName">Bank Name</label>
        <input
          type="text"
          id="bankName"
          name="bankName"
          value={formData.bankName}
          onChange={handleInputChange}
          placeholder="e.g., TD Bank"
        />
      </div>
      
      {formData.bankName && (
        <>
          <div className="form-group">
            <label htmlFor="accountHolderName">Account Holder Name</label>
            <input
              type="text"
              id="accountHolderName"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleInputChange}
              placeholder="Full name on account"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="accountNumber">Account Number</label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Account number"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="routingNumber">Routing Number</label>
              <input
                type="text"
                id="routingNumber"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleInputChange}
                placeholder="Routing number"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="auth-page register-page">
          <div className="auth-container">
            <div className="auth-form-section full-width">
              <div className="auth-form-wrapper">
                {/* Logo */}
                <div className="auth-logo">
                  <FontAwesomeIcon icon={faTruck} className="logo-icon" />
                  <h1>Become a GrubGate Dasher</h1>
                </div>

            {/* Progress Bar */}
            <div className="progress-bar">
              <div className="progress-steps">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                  >
                    <div className="step-number">
                      {currentStep > step ? (
                        <FontAwesomeIcon icon={faCheckCircle} />
                      ) : (
                        step
                      )}
                    </div>
                    <div className="step-label">
                      {step === 1 && 'Personal'}
                      {step === 2 && 'Vehicle'}
                      {step === 3 && 'Documents'}
                      {step === 4 && 'Details'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="progress-line">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="error-message">
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form multi-step-form">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              {/* Navigation Buttons */}
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="back-button"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="next-button"
                  >
                    Next <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>

              {/* Login Link */}
              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Sign In
                  </Link>
                </p>
              </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
