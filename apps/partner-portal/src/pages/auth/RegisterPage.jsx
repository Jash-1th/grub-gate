import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEyeSlash, 
  faBuilding, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faLock, 
  faCheckCircle, 
  faStar, 
  faAward, 
  faClock,
  faKey,
  faPaperPlane,
  faMapMarkerAlt,
  faUtensils,
  faGlobe,
  faUpload,
  faImage,
  faFileAlt,
  faDollarSign,
  faRoute,
  faBusinessTime
} from '@fortawesome/free-solid-svg-icons';
import { Button, Logo } from '@grub-gate/ui';
import { useModal } from '../../contexts/ModalContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import PartnerOTPAuthModal from '../../components/auth/PartnerOTPAuthModal.jsx';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { isOTPAuthModalOpen, openOTPAuthModal, closeOTPAuthModal } = useModal();
  
  // Redirect authenticated users to appropriate page
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 RegisterPage: User already authenticated, redirecting...');
      // Redirect to onboarding or dashboard based on registration status
      if (user.registrationComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding/welcome');
      }
      return;
    }
    
    // Only open OTP modal if user is not authenticated
    if (!isAuthenticated) {
      console.log('🔑 RegisterPage: Opening OTP modal for unauthenticated user');
      openOTPAuthModal();
    }
  }, [isAuthenticated, user, navigate, openOTPAuthModal]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState({
    logo: null,
    images: [],
    businessLicense: null
  });
  
  const [formData, setFormData] = useState({
    // User details
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    
    // Restaurant details
    restaurantName: '',
    description: '',
    cuisine: '',
    businessType: 'restaurant',
    cuisineType: [],
    
    // Address
    street: '',
    city: '',
    province: '',
    postalCode: '',
    
    // Contact details
    businessPhone: '',
    businessEmail: '',
    website: '',
    
    // Operating hours
    operatingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: false }
    },
    
    // Delivery settings
    deliveryRadius: 5,
    deliveryFee: 0,
    minOrderAmount: 0,
    avgDeliveryTime: 30,
    
    // Business info
    businessLicense: '',
    taxId: '',
    
    agreeTerms: false
  });

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'food_truck', label: 'Food Truck' },
    { value: 'catering', label: 'Catering' },
    { value: 'other', label: 'Other' }
  ];

  const cuisineOptions = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'French', 'Japanese', 
    'Thai', 'Mediterranean', 'American', 'Greek', 'Lebanese', 'Vietnamese',
    'Korean', 'Spanish', 'Turkish', 'Moroccan', 'Ethiopian', 'Other'
  ];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested objects (like operatingHours)
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subChild ? {
            ...prev[parent][child],
            [subChild]: type === 'checkbox' ? checked : value
          } : (type === 'checkbox' ? checked : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCuisineTypeChange = (cuisine) => {
    setFormData(prev => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(cuisine)
        ? prev.cuisineType.filter(c => c !== cuisine)
        : [...prev.cuisineType, cuisine]
    }));
  };

  const handleFileChange = (e, fileType) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (fileType === 'images') {
      // Multiple images allowed (max 5)
      if (selectedFiles.length > 5) {
        showToast('Maximum 5 images allowed', 'error');
        return;
      }
      setFiles(prev => ({ ...prev, images: selectedFiles }));
    } else {
      // Single file for logo and business license
      setFiles(prev => ({ ...prev, [fileType]: selectedFiles[0] }));
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      // Personal Information
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (currentStep === 2) {
      // Restaurant Information
      if (!formData.restaurantName.trim()) newErrors.restaurantName = 'Restaurant name is required';
      if (!formData.cuisine.trim()) newErrors.cuisine = 'Cuisine type is required';
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
      if (formData.cuisineType.length === 0) newErrors.cuisineType = 'Select at least one cuisine type';
    } else if (currentStep === 3) {
      // Address & Contact
      if (!formData.street.trim()) newErrors.street = 'Street address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.province.trim()) newErrors.province = 'Province is required';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
      if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required';
    } else if (currentStep === 4) {
      // Terms agreement
      if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'operatingHours') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'cuisineType') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'confirmPassword') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append files
      if (files.logo) submitData.append('logo', files.logo);
      if (files.businessLicense) submitData.append('businessLicense', files.businessLicense);
      files.images.forEach((image, index) => {
        submitData.append('images', image);
      });
      
      // Make API call to register partner
      const response = await fetch('/api/v1/auth/register-partner', {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showToast('Registration successful! Your restaurant is pending approval.', 'success');
        navigate('/login');
      } else {
        showToast(result.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast('Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: faStar,
      title: 'Premium Features',
      description: 'Access advanced analytics and customer insights'
    },
    {
      icon: faAward,
      title: 'Verified Partner',
      description: 'Get verified badge and priority listing'
    },
    {
      icon: faClock,
      title: 'Quick Setup',
      description: 'Get started in less than 5 minutes'
    },
    {
      icon: faCheckCircle,
      title: 'No Setup Fees',
      description: 'Join for free with no hidden costs'
    }
  ];

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-grub-gray-50 via-white to-red-50 flex">
      {/* Left Side - Benefits (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-16">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <Logo size="xl" className="mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join GrubGate Partner Network
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Start growing your restaurant business with Montreal's leading food delivery platform.
            </p>
          </div>
          
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4 group">
                <div className="flex-shrink-0 w-12 h-12 bg-grub-red/10 rounded-xl flex items-center justify-center group-hover:bg-grub-red/20 transition-colors">
                  <FontAwesomeIcon icon={benefit.icon} className="w-6 h-6 text-grub-red" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 lg:max-w-2xl xl:max-w-3xl">
        <div className="w-full max-w-md">
          {!isOTPAuthModalOpen && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <Logo className="mx-auto mb-4" size="lg" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Join as Partner</h1>
                <p className="text-gray-600">Create your partner account to manage your restaurant</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Header - Desktop Only */}
              <div className="hidden lg:block pb-6 border-b border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Restaurant Information
                </h3>
                <p className="text-gray-600">
                  Please provide your restaurant and contact details to get started.
                </p>
              </div>

              {/* Restaurant Name */}
              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faBuilding} className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    placeholder="Your Restaurant Name"
                    className={`block w-full pl-10 pr-3 py-3 lg:py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-base lg:text-lg ${
                      errors.restaurantName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-grub-red focus:ring-grub-red hover:border-gray-400'
                    }`}
                  />
                </div>
                {errors.restaurantName && (
                  <p className="mt-2 text-sm text-red-600">{errors.restaurantName}</p>
                )}
              </div>

              {/* Owner Name */}
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Your Full Name"
                    className={`block w-full pl-10 pr-3 py-3 lg:py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-base lg:text-lg ${
                      errors.ownerName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-grub-red focus:ring-grub-red hover:border-gray-400'
                    }`}
                  />
                </div>
                {errors.ownerName && (
                  <p className="mt-2 text-sm text-red-600">{errors.ownerName}</p>
                )}
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={`block w-full pl-10 pr-3 py-3 lg:py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-base lg:text-lg ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-grub-red focus:ring-grub-red hover:border-gray-400'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faPhone} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className={`block w-full pl-10 pr-3 py-3 lg:py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-base lg:text-lg ${
                        errors.phone 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-grub-red focus:ring-grub-red hover:border-gray-400'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create password"
                      className={`block w-full pl-10 pr-12 py-3 lg:py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-base lg:text-lg ${
                        errors.password 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-grub-red focus:ring-grub-red hover:border-gray-400'
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FontAwesomeIcon icon={faEyeSlash} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FontAwesomeIcon icon={faEye} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className={`block w-full pl-10 pr-12 py-3 lg:py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-base lg:text-lg ${
                        errors.confirmPassword 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-grub-red focus:ring-grub-red hover:border-gray-400'
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <FontAwesomeIcon icon={faEyeSlash} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FontAwesomeIcon icon={faEye} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-grub-red focus:ring-grub-red border-gray-300 rounded transition-colors"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-grub-red hover:text-grub-red-light font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-grub-red hover:text-grub-red-light font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-sm text-red-600">{errors.agreeTerms}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full py-3 text-base font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Sign In Link */}
              <div className="text-center pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-grub-red hover:text-grub-red-light transition-colors"
                  >
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          </div>
          )}

          {/* Mobile Benefits */}
          <div className="lg:hidden mt-8 space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              Why join GrubGate?
            </div>
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-xl shadow-soft border border-gray-100">
                  <FontAwesomeIcon icon={benefit.icon} className="w-6 h-6 text-grub-red mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{benefit.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* OTP Authentication Modal */}
    <PartnerOTPAuthModal 
      isOpen={isOTPAuthModalOpen} 
      onClose={() => {
        closeOTPAuthModal();
        navigate('/'); // Navigate back to landing page if modal is closed
      }} 
    />
    </>
  );
};

export default RegisterPage;
