import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  faPlus, 
  faSearch, 
  faFilter, 
  faEdit, 
  faTrash, 
  faEye, 
  faEyeSlash,
  faStar,
  faClock,
  faUsers,
  faUpload,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Modal } from '@grub-gate/ui';
import { useRestaurant } from '../../hooks/useRestaurant';
import { 
  getMenuItems, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  toggleMenuItemStatus,
  updateMenuItemAvailability,
  createMenuItemFormData 
} from '../../api/menuApi';
import { useToast } from '../../contexts/ToastContext';
import { validateFormWithSchema, formatBackendErrors } from '../../utils/validationErrorHandler';

const MenuPage = () => {
  const { t } = useTranslation();
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const { showToast } = useToast();
  
  // State for menu items
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('basics');
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main',
    cuisine: '',
    price: '',
    prepTime: '',
    servings: 1,
    status: 'available',
    spiceLevel: 0,
    dietaryPreferences: [],
    ingredients: [],
    ingredientsText: '', // For display purposes to allow comma input
    allergens: [],
    availability: {
      monday: { lunch: true, dinner: true },
      tuesday: { lunch: true, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: true, dinner: true }
    }
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  
  // Test function to trigger validation errors (for development)
  const testValidation = () => {
    const testErrors = {
      name: 'Menu item name must be at least 2 characters long',
      description: 'Description must be at least 10 characters long',
      price: 'Price must be at least $0.01',
      category: 'Please select a valid category',
      cuisine: 'Cuisine type must be at least 2 characters long',
      ingredients: 'Please add at least one ingredient',
      image: 'Please upload an image for the menu item'
    };
    setFormErrors(testErrors);
    
    // Switch to basics tab since most errors are there
    setActiveTab('basics');
    console.log('🔄 Switched to basics tab for test validation');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('🧪 Test validation errors set:', testErrors);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'appetizer', label: t('menu.categories.appetizer') },
    { value: 'main', label: t('menu.categories.main') },
    { value: 'dessert', label: t('menu.categories.dessert') },
    { value: 'beverage', label: t('menu.categories.beverage') },
    { value: 'salad', label: t('menu.categories.salad') },
    { value: 'soup', label: t('menu.categories.soup') }
  ];

  // Fetch menu items
  const fetchMenuItems = async () => {
    if (!restaurant?.id) return;
    
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category: selectedCategory,
        status: statusFilter,
        sortBy,
        sortOrder
      };
      
      const response = await getMenuItems(restaurant.id, params);
      setMenuItems(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch menu items');
      showToast(t('toasts.menu.fetchFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load menu items when restaurant is available or filters change
  useEffect(() => {
    fetchMenuItems();
  }, [restaurant?.id, searchTerm, selectedCategory, statusFilter, sortBy, sortOrder]);

  // Auto-populate cuisine from restaurant when adding new item
  useEffect(() => {
    if (restaurant?.cuisine && !editingItem) {
      setFormData(prev => ({
        ...prev,
        cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine[0] : restaurant.cuisine
      }));
    }
  }, [restaurant?.cuisine, editingItem]);

  // Scroll to top when modal opens
  useEffect(() => {
    if (showAddModal) {
      setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"]');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
    }
  }, [showAddModal]);

  // Scroll to top when tab changes
  useEffect(() => {
    if (showAddModal) {
      setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"]');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
    }
  }, [activeTab, showAddModal]);

  // Reset form when modal closes
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'main',
      cuisine: Array.isArray(restaurant?.cuisine) ? restaurant.cuisine[0] : restaurant?.cuisine || '',
      price: '',
      prepTime: '',
      servings: 1,
      status: 'available',
      spiceLevel: 0,
      dietaryPreferences: [],
      ingredients: [],
      ingredientsText: '', // For display purposes
      allergens: [],
      availability: ensureAvailabilityStructure(null) // Use helper for consistency
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
    setActiveTab('basics');
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear general error when user makes any change
    if (formErrors.general) {
      setFormErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      
      // Clear image error when user selects a file
      if (formErrors.image) {
        setFormErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  // Handle form submission with comprehensive validation
  const handleSubmit = async () => {
    if (!restaurant?.id) return;
    
    try {
      setSubmitting(true);
      setFormErrors({}); // Clear previous errors
      
      // Prepare form data for validation
      const validationData = { ...formData };
      
      // Convert price to number for validation
      if (validationData.price) {
        validationData.price = parseFloat(validationData.price);
      }
      
      // Convert prepTime to number for validation
      if (validationData.prepTime) {
        validationData.prepTime = parseInt(validationData.prepTime);
      }
      
      // Convert servings to number for validation
      if (validationData.servings) {
        validationData.servings = parseInt(validationData.servings);
      }
      
      // Convert spiceLevel to number for validation
      if (validationData.spiceLevel) {
        validationData.spiceLevel = parseInt(validationData.spiceLevel);
      }
      
      // Parse ingredients from text if provided
      if (validationData.ingredientsText && validationData.ingredientsText.trim()) {
        validationData.ingredients = validationData.ingredientsText
          .split(',')
          .map(ingredient => ingredient.trim())
          .filter(ingredient => ingredient.length > 0);
      }
      
      // Remove display-only field
      delete validationData.ingredientsText;
      
      console.log('🔍 Validating form data:', validationData);
      
      // Frontend validation using Joi schema
      console.log('🔍 About to validate with schema: completeMenuItem');
      const validationErrors = validateFormWithSchema(validationData, 'completeMenuItem');
      console.log('🔍 Validation result:', validationErrors);
      
      // Additional custom validation
      if (!imageFile && !editingItem?.image) {
        validationErrors.image = 'Please upload an image for the menu item';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        console.log('❌ Validation errors:', validationErrors);
        setFormErrors(validationErrors);
        
        // Determine which tab contains the first error and switch to it
        const errorFields = Object.keys(validationErrors);
        const basicsFields = ['name', 'description', 'category', 'cuisine', 'price', 'prepTime', 'servings', 'spiceLevel', 'image'];
        const ingredientsFields = ['dietaryPreferences', 'ingredients', 'allergens'];
        const availabilityFields = ['status', 'availability'];
        
        // Find the first error and switch to appropriate tab
        if (errorFields.some(field => basicsFields.includes(field))) {
          setActiveTab('basics');
          console.log('🔄 Switched to basics tab due to validation errors');
        } else if (errorFields.some(field => ingredientsFields.includes(field))) {
          setActiveTab('ingredients');
          console.log('🔄 Switched to ingredients tab due to validation errors');
        } else if (errorFields.some(field => availabilityFields.includes(field))) {
          setActiveTab('availability');
          console.log('🔄 Switched to availability tab due to validation errors');
        }
        
        // Scroll to top to show validation errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Create clean form data for submission
      const cleanFormData = { ...validationData };
      
      // Create FormData for backend
      const submitData = createMenuItemFormData(cleanFormData, imageFile);
      
      console.log('🚀 Submitting validated form data...');
      
      if (editingItem) {
        // Update existing item
        await updateMenuItem(restaurant.id, editingItem._id || editingItem.id, submitData);
        showToast(t('toasts.menu.updateSuccess'), 'success');
      } else {
        // Create new item
        await createMenuItem(restaurant.id, submitData);
        showToast(t('toasts.menu.createSuccess'), 'success');
      }
      
      // Refresh menu items and close modal
      await fetchMenuItems();
      setShowAddModal(false);
      resetForm();
      
    } catch (err) {
      console.error('Menu item submission error:', err);
      console.error('Error Response Data:', err.response?.data);
      
      // Handle axios error responses with detailed validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        console.log('🔍 Backend validation errors:', err.response.data.errors);
        // Use enhanced error formatting for Joi validation errors
        const formattedErrors = formatBackendErrors(err.response.data.errors);
        console.log('🎨 Formatted errors for display:', formattedErrors);
        setFormErrors(formattedErrors);
        
        // Switch to appropriate tab for backend errors too
        const errorFields = Object.keys(formattedErrors);
        const basicsFields = ['name', 'description', 'category', 'cuisine', 'price', 'prepTime', 'servings', 'spiceLevel', 'image'];
        const ingredientsFields = ['dietaryPreferences', 'ingredients', 'allergens'];
        const availabilityFields = ['status', 'availability'];
        
        if (errorFields.some(field => basicsFields.includes(field))) {
          setActiveTab('basics');
          console.log('🔄 Switched to basics tab due to backend validation errors');
        } else if (errorFields.some(field => ingredientsFields.includes(field))) {
          setActiveTab('ingredients');
          console.log('🔄 Switched to ingredients tab due to backend validation errors');
        } else if (errorFields.some(field => availabilityFields.includes(field))) {
          setActiveTab('availability');
          console.log('🔄 Switched to availability tab due to backend validation errors');
        }
        
        // Scroll to top to show validation errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (err.response?.data?.message) {
        // Show specific backend error message
        console.log('📝 Backend error message:', err.response.data.message);
        setFormErrors({ general: err.response.data.message });
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback to generic message
        const errorMessage = err.message || 'Failed to save menu item. Please try again.';
        setFormErrors({ general: errorMessage });
        showToast(errorMessage || t('toasts.menu.saveFailed'), 'error');
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Action handlers
  const toggleItemStatus = async (itemId, currentStatus) => {
    if (!restaurant?.id) return;
    
    try {
      const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
      await toggleMenuItemStatus(restaurant.id, itemId, newStatus);
      showToast(newStatus === 'available' ? t('toasts.menu.statusEnabled') : t('toasts.menu.statusDisabled'), 'success');
      await fetchMenuItems();
    } catch (err) {
      showToast(err.message || t('toasts.menu.statusUpdateFailed'), 'error');
    }
  };

  // Helper function to ensure availability structure is correct
  const ensureAvailabilityStructure = (availability) => {
    const defaultAvailability = {
      monday: { lunch: true, dinner: true },
      tuesday: { lunch: true, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: true, dinner: true }
    };

    if (!availability || typeof availability !== 'object') {
      console.log('⚠️ No availability data, using defaults');
      return defaultAvailability;
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const correctedAvailability = {};

    days.forEach(day => {
      correctedAvailability[day] = {
        lunch: Boolean(availability[day]?.lunch ?? true),
        dinner: Boolean(availability[day]?.dinner ?? true)
      };
    });

    console.log('✅ Corrected availability structure:', correctedAvailability);
    return correctedAvailability;
  };

  const handleEditItem = (item) => {
    console.log('📝 Editing item:', item.name);
    console.log('📝 Original availability:', item.availability);
    
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'main',
      cuisine: item.cuisine || '',
      price: item.price?.toString() || '',
      prepTime: item.prepTime?.toString() || '',
      servings: item.servings || 1,
      status: item.status || 'available',
      spiceLevel: item.spiceLevel || 0,
      dietaryPreferences: item.dietaryPreferences || [],
      ingredients: item.ingredients || [],
      ingredientsText: (item.ingredients || []).join(', '), // Initialize display text
      allergens: item.allergens || [],
      availability: ensureAvailabilityStructure(item.availability)
    });
    setImagePreview(item.image || null);
    setShowAddModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!restaurant?.id) return;
    
    if (window.confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      try {
        await deleteMenuItem(restaurant.id, itemId);
        showToast(t('toasts.menu.deleteSuccess'), 'success');
        await fetchMenuItems();
      } catch (err) {
        showToast(err.message || t('toasts.menu.deleteFailed'), 'error');
      }
    }
  };

  const handleAddNewItem = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Show loading state
  if (restaurantLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grub-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchMenuItems} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-grub-red to-red-600 text-white p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t('menu.title')}</h1>
            <p className="text-red-100 text-sm">{t('menu.subtitle')}</p>
          </div>
          <div className="flex justify-start">
            <Button
              variant="primary"
              onClick={handleAddNewItem}
              className="w-full sm:w-auto px-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white shadow focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />{t('menu.addItem')}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 text-sm sm:text-base" />
              </div>
            </div>
            
            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red">
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              {/* Status */}
              <div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red">
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              {/* Sort */}
              <div>
                <select 
                  value={`${sortBy}-${sortOrder}`} 
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }} 
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red"
                >
                  <option value="createdAt-desc">Sort: Newest First</option>
                  <option value="createdAt-asc">Sort: Oldest First</option>
                  <option value="name-asc">Sort: Name A-Z</option>
                  <option value="name-desc">Sort: Name Z-A</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {menuItems.length === 0 ? (
          <div className="col-span-full text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <FontAwesomeIcon icon={faPlus} className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Start building your menu by adding your first item.</p>
            <Button onClick={handleAddNewItem} variant="primary" className="w-full sm:w-auto bg-grub-red hover:bg-red-700">
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          menuItems.map((item) => (
          <Card key={item._id || item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image area */}
            <div className="h-32 sm:h-36 lg:h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Fallback placeholder when no image or image fails to load */}
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${item.image ? 'hidden' : 'flex'}`}>
                <div className="text-center text-gray-400">
                  <FontAwesomeIcon icon={faUpload} className="h-6 w-6 sm:h-7 sm:w-7 mb-2" />
                  <p className="text-xs">No Image</p>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.status === 'available' ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
            
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1 min-w-0">{item.name}</h3>
                <span className="text-base sm:text-lg font-extrabold text-grub-red flex-shrink-0">${item.price}</span>
              </div>

              <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{item.description}</p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
                <span className="inline-flex items-center"><FontAwesomeIcon icon={faClock} className="h-3 w-3 mr-1" />{item.prepTime}min</span>
                <span className="inline-flex items-center"><FontAwesomeIcon icon={faUsers} className="h-3 w-3 mr-1" />{item.servings}</span>
                <span className="inline-flex items-center"><FontAwesomeIcon icon={faStar} className="h-3 w-3 mr-1 text-yellow-400" />{item.rating}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {(item.dietaryPreferences || item.dietary || []).slice(0, 2).map((diet) => (
                  <span key={diet} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                    {t(`menu.dietary.${diet}`, diet.replace('-', ' '))}
                  </span>
                ))}
                {(item.dietaryPreferences || item.dietary || []).length > 2 && (
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{(item.dietaryPreferences || item.dietary || []).length - 2}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{item.totalOrders} orders</span>
                <div className="flex space-x-1">
                  <button onClick={() => handleEditItem(item)} className="p-1.5 rounded-md border text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors">
                    <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDeleteItem(item._id || item.id)} className="p-1.5 rounded-md border text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors">
                    <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Mobile floating add button */}
      <Button
        variant="primary"
        aria-label="Add menu item"
        onClick={handleAddNewItem}
        className="sm:hidden fixed bottom-20 right-4 z-20 rounded-full bg-grub-red hover:bg-red-700 text-white shadow-xl w-14 h-14 flex items-center justify-center active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300 transition-transform"
      >
        <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
      </Button>

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
        size="xl"
        className="max-w-3xl"
      >
        <div className="flex flex-col h-full">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-2">
          {/* Progress indicator and tabs - Responsive */}
          <div className="w-full">
            {/* Mobile Progress - Simplified */}
            <div className="block sm:hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === 'basics' ? 'bg-grub-red text-white' : 
                    ['availability', 'details'].includes(activeTab) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {['availability', 'details'].includes(activeTab) ? '✓' : '1'}
                  </div>
                  <div className={`w-4 h-0.5 ${
                    ['availability', 'details'].includes(activeTab) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === 'availability' ? 'bg-grub-red text-white' : 
                    activeTab === 'details' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {activeTab === 'details' ? '✓' : '2'}
                  </div>
                  <div className={`w-4 h-0.5 ${
                    activeTab === 'details' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === 'details' ? 'bg-grub-red text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-grub-red">
                    Step {activeTab === 'basics' ? '1' : activeTab === 'availability' ? '2' : '3'} of 3
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeTab === 'basics' ? 'Basics' : activeTab === 'availability' ? 'Availability' : 'Details'}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Progress - Full */}
            <div className="hidden sm:flex items-center justify-center">
              <div className="flex items-center space-x-1 lg:space-x-2">
                {[
                  { id: 'basics', label: 'Basics', step: 1 },
                  { id: 'availability', label: 'Availability', step: 2 },
                  { id: 'details', label: 'Details', step: 3 },
                ].map((tab, index) => {
                  const isActive = activeTab === tab.id;
                  const isCompleted = ['basics', 'availability', 'details'].indexOf(activeTab) > index;
                  const isClickable = editingItem || index === 0 || isCompleted || 
                    (index === 1 && formData.name && formData.price && formData.prepTime) ||
                    (index === 2 && formData.name && formData.price && formData.prepTime);
                  
                  return (
                    <div key={tab.id} className="flex items-center">
                      <button
                        onClick={() => isClickable && setActiveTab(tab.id)}
                        disabled={!isClickable}
                        className={`flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-full text-xs lg:text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-grub-red text-white' 
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : isClickable
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? '✓' : tab.step}
                      </button>
                      <span className={`ml-1.5 lg:ml-2 text-xs lg:text-sm font-medium hidden md:inline ${
                        isActive ? 'text-grub-red' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {tab.label}
                      </span>
                      {index < 2 && (
                        <div className={`w-4 lg:w-8 h-0.5 mx-2 lg:mx-3 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BASICS TAB */}
          {activeTab === 'basics' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0">1</div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-900">Step 1: Basic Information</h3>
                    <p className="text-xs text-blue-700 hidden sm:block">Enter the essential details about your menu item</p>
                    <p className="text-xs text-blue-700 sm:hidden">Essential details</p>
                  </div>
                </div>
              </div>
              {/* General Error Message */}
              {formErrors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.general}
                  </p>
                </div>
              )}

              {/* Item name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter item name (e.g., Grilled Chicken Caesar Salad)" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm transition-colors ${
                    formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Price + Category (2 cols on mobile, 3 on desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm">$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      max="999.99"
                      value={formData.price}
                      onChange={(e) => {
                        console.log('💰 Price changed to:', e.target.value);
                        const value = e.target.value;
                        // Allow empty string for clearing, otherwise ensure it's a valid number
                        if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                          handleInputChange('price', value);
                        }
                      }}
                      placeholder="0.00" 
                      className={`w-full pl-6 sm:pl-7 pr-2 sm:pr-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm transition-colors ${
                        formErrors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {formErrors.price && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.price}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm transition-colors ${
                      formErrors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.category}
                    </p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              {/* Prep time + Servings (2 cols on mobile, 2 on desktop) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Prep Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="5"
                      max="180"
                      placeholder="30" 
                      value={formData.prepTime}
                      onChange={(e) => {
                        console.log('⏱️ Prep time changed to:', e.target.value);
                        const value = e.target.value;
                        // Allow empty string for clearing, otherwise ensure it's a valid number
                        if (value === '' || (!isNaN(value) && parseInt(value) >= 1 && parseInt(value) <= 180)) {
                          handleInputChange('prepTime', value);
                        }
                      }}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm transition-colors ${
                        formErrors.prepTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">min</span>
                  </div>
                  {formErrors.prepTime && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.prepTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Servings</label>
                  <input 
                    type="number" 
                    min="1"
                    max="20"
                    placeholder="1" 
                    value={formData.servings}
                    onChange={(e) => {
                      console.log('🍽️ Servings changed to:', e.target.value);
                      const value = e.target.value;
                      // Allow empty string for clearing, otherwise ensure it's a valid number
                      if (value === '') {
                        handleInputChange('servings', 1); // Default to 1 if empty
                      } else {
                        const numValue = parseInt(value);
                        if (!isNaN(numValue) && numValue >= 1 && numValue <= 20) {
                          handleInputChange('servings', numValue);
                        }
                      }
                    }}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm"
                  />
                </div>
              </div>

              {/* Cuisine Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Cuisine <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.cuisine}
                  onChange={(e) => handleInputChange('cuisine', e.target.value)}
                  placeholder="e.g., French, Italian, American" 
                  className={`w-full px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm transition-colors ${
                    formErrors.cuisine ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.cuisine && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.cuisine}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Auto-filled from your restaurant profile, but you can customize it
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Item Image <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`w-full px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm transition-colors ${
                      formErrors.image ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.image && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.image}
                    </p>
                  )}
                  {imagePreview && (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Upload a high-quality image of your menu item (JPG, PNG, WebP)
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  rows={3} 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your menu item in detail (e.g., Fresh grilled chicken breast served with crispy romaine lettuce, parmesan cheese, and our signature Caesar dressing)" 
                  className={`w-full px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm resize-none transition-colors ${
                    formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/500 characters (minimum 10 required)
                </p>
              </div>
            </div>
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === 'availability' && (
            <div className="space-y-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-center">
                  <div className="bg-orange-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0">2</div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-orange-900">Step 2: Availability Schedule</h3>
                    <p className="text-xs text-orange-700 hidden sm:block">Set when this item is available for customers to order</p>
                    <p className="text-xs text-orange-700 sm:hidden">Set availability times</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Choose when this item is available for customers to add to their weekly plan.</p>
              <div className="overflow-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2">Day</th>
                      <th className="text-center px-3 py-2">Lunch</th>
                      <th className="text-center px-3 py-2">Dinner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                      <tr key={d} className="border-t">
                        <td className="px-3 py-2 capitalize">{d}</td>
                        <td className="px-3 py-2 text-center">
                          <input 
                            type="checkbox" 
                            checked={formData.availability[d]?.lunch ?? true}
                            onChange={(e) => {
                              console.log(`🔄 Updating ${d}.lunch to:`, e.target.checked);
                              const newAvailability = {
                                ...formData.availability,
                                [d]: {
                                  ...formData.availability[d],
                                  lunch: Boolean(e.target.checked) // Ensure boolean type
                                }
                              };
                              console.log('🔄 New availability state:', newAvailability);
                              handleInputChange('availability', newAvailability);
                            }}
                            className="h-4 w-4 text-grub-red" 
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input 
                            type="checkbox" 
                            checked={formData.availability[d]?.dinner ?? true}
                            onChange={(e) => {
                              console.log(`🔄 Updating ${d}.dinner to:`, e.target.checked);
                              const newAvailability = {
                                ...formData.availability,
                                [d]: {
                                  ...formData.availability[d],
                                  dinner: Boolean(e.target.checked) // Ensure boolean type
                                }
                              };
                              console.log('🔄 New availability state:', newAvailability);
                              handleInputChange('availability', newAvailability);
                            }}
                            className="h-4 w-4 text-grub-red" 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-center">
                  <div className="bg-green-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0">3</div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-green-900">Step 3: Additional Details</h3>
                    <p className="text-xs text-green-700 hidden sm:block">Add dietary preferences, allergens, and ingredients</p>
                    <p className="text-xs text-green-700 sm:hidden">Extra details & preferences</p>
                  </div>
                </div>
              </div>
              
              {/* Compact Mobile Layout */}
              <div className="block sm:hidden space-y-3">
                {/* Dietary Preferences - Compact */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🌱 Dietary Preferences</label>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {['vegetarian','vegan','gluten-free','dairy-free','keto','low-carb','non-veg'].map(opt => (
                      <label key={opt} className="flex items-start space-x-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.dietaryPreferences.includes(opt)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('dietaryPreferences', [...formData.dietaryPreferences, opt]);
                            } else {
                              handleInputChange('dietaryPreferences', formData.dietaryPreferences.filter(pref => pref !== opt));
                            }
                          }}
                          className="h-4 w-4 text-grub-red flex-shrink-0 rounded mt-0.5" 
                        />
                        <span className="capitalize text-xs leading-relaxed flex-1 min-w-0">{opt.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  {/* Show more options in collapsed state */}
                  <div className="mt-2">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {['halal','kosher','spicy'].map(opt => (
                        <label key={opt} className="flex items-start space-x-2 text-xs cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.dietaryPreferences.includes(opt)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('dietaryPreferences', [...formData.dietaryPreferences, opt]);
                              } else {
                                handleInputChange('dietaryPreferences', formData.dietaryPreferences.filter(pref => pref !== opt));
                              }
                            }}
                            className="h-4 w-4 text-grub-red flex-shrink-0 rounded mt-0.5" 
                          />
                          <span className="capitalize text-xs leading-relaxed flex-1 min-w-0">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Allergens - Compact */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">⚠️ Common Allergens</label>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {['gluten', 'dairy', 'eggs', 'nuts', 'shellfish', 'soy'].map(allergen => (
                      <label key={allergen} className="flex items-start space-x-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.allergens.includes(allergen)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('allergens', [...formData.allergens, allergen]);
                            } else {
                              handleInputChange('allergens', formData.allergens.filter(a => a !== allergen));
                            }
                          }}
                          className="h-4 w-4 text-grub-red flex-shrink-0 rounded mt-0.5" 
                        />
                        <span className="capitalize text-xs leading-relaxed flex-1 min-w-0">{allergen}</span>
                      </label>
                    ))}
                  </div>
                  {/* Additional allergens in smaller grid */}
                  <div className="mt-2">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {['fish', 'peanuts', 'sesame', 'alcohol', 'sulfites'].map(allergen => (
                        <label key={allergen} className="flex items-start space-x-2 text-xs cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.allergens.includes(allergen)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('allergens', [...formData.allergens, allergen]);
                              } else {
                                handleInputChange('allergens', formData.allergens.filter(a => a !== allergen));
                              }
                            }}
                            className="h-4 w-4 text-grub-red flex-shrink-0 rounded mt-0.5" 
                          />
                          <span className="capitalize text-xs leading-relaxed flex-1 min-w-0">{allergen}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ingredients - Compact */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🥘 Ingredients</label>
                  <textarea
                    placeholder="chicken, rice, spices..."
                    value={formData.ingredientsText || formData.ingredients.join(', ')}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('ingredientsText', value);
                      
                      if (value === '') {
                        handleInputChange('ingredients', []);
                      } else {
                        const ingredients = value
                          .split(',')
                          .map(item => item.trim())
                          .filter(item => item.length > 0);
                        handleInputChange('ingredients', ingredients);
                      }
                    }}
                    onBlur={(e) => {
                      const cleanText = formData.ingredients.join(', ');
                      if (e.target.value !== cleanText) {
                        handleInputChange('ingredientsText', cleanText);
                      }
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                </div>
              </div>

              {/* Desktop Layout - Full */}
              <div className="hidden sm:block space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {['vegetarian','vegan','gluten-free','dairy-free','keto','low-carb','non-veg','halal','kosher','spicy'].map(opt => (
                      <label key={opt} className="inline-flex items-center space-x-2 text-sm py-1">
                        <input 
                          type="checkbox" 
                          checked={formData.dietaryPreferences.includes(opt)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('dietaryPreferences', [...formData.dietaryPreferences, opt]);
                            } else {
                              handleInputChange('dietaryPreferences', formData.dietaryPreferences.filter(pref => pref !== opt));
                            }
                          }}
                          className="h-4 w-4 text-grub-red flex-shrink-0" 
                        />
                        <span className="capitalize">{opt.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {['gluten', 'dairy', 'eggs', 'fish', 'shellfish', 'nuts', 'peanuts', 'soy', 'sesame', 'alcohol', 'sulfites'].map(allergen => (
                      <label key={allergen} className="inline-flex items-center space-x-2 text-sm py-1">
                        <input 
                          type="checkbox" 
                          checked={formData.allergens.includes(allergen)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('allergens', [...formData.allergens, allergen]);
                            } else {
                              handleInputChange('allergens', formData.allergens.filter(a => a !== allergen));
                            }
                          }}
                          className="h-4 w-4 text-grub-red flex-shrink-0" 
                        />
                        <span className="capitalize">{allergen}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                  <textarea
                    placeholder="Enter ingredients separated by commas (e.g., chicken breast, mushrooms, olive oil, garlic)"
                    value={formData.ingredientsText || formData.ingredients.join(', ')}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('ingredientsText', value);
                      
                      if (value === '') {
                        handleInputChange('ingredients', []);
                      } else {
                        const ingredients = value
                          .split(',')
                          .map(item => item.trim())
                          .filter(item => item.length > 0);
                        handleInputChange('ingredients', ingredients);
                      }
                    }}
                    onBlur={(e) => {
                      const cleanText = formData.ingredients.join(', ');
                      if (e.target.value !== cleanText) {
                        handleInputChange('ingredientsText', cleanText);
                      }
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-sm resize-vertical"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate ingredients with commas</p>
                </div>
              </div>
            </div>
          )}
          </div>
          
          {/* Footer actions - Outside scrollable area - Responsive */}
          <div className="border-t bg-white px-0 py-3 sm:py-4 mt-4 flex-shrink-0 pb-20 sm:pb-3">
            {/* Mobile Layout - Stacked */}
            <div className="block sm:hidden space-y-3">
              {/* Top row - Cancel and Back */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 border-gray-300 hover:bg-gray-50 text-sm py-2"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                
                {/* Back button - only show if not on first tab */}
                {activeTab !== 'basics' && (
                  <Button
                    variant="secondary"
                    className="flex-1 border-gray-300 hover:bg-gray-50 text-sm py-2"
                    onClick={() => {
                      const tabs = ['basics', 'availability', 'details'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                    disabled={submitting}
                  >
                    ← Back
                  </Button>
                )}
              </div>
              
              {/* Bottom row - Primary action */}
              <div>
                {/* Next button for basics and availability tabs */}
                {activeTab === 'basics' && (
                  <Button
                    variant="primary"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5"
                    onClick={() => setActiveTab('availability')}
                    disabled={submitting || !formData.name || !formData.price || !formData.prepTime}
                  >
                    Next: Availability →
                  </Button>
                )}
                
                {activeTab === 'availability' && (
                  <Button
                    variant="primary"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5"
                    onClick={() => setActiveTab('details')}
                    disabled={submitting}
                  >
                    Next: Details →
                  </Button>
                )}
                
                {/* Add/Save button only on details tab */}
                {activeTab === 'details' && (
                  <Button
                    variant="primary"
                    className="w-full bg-grub-red hover:bg-red-700 text-white text-sm py-2.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingItem ? 'Saving...' : 'Creating...'}
                      </div>
                    ) : (
                      <>
                        {editingItem ? '💾 Save Changes' : '✨ Add Menu Item'}
                      </>
                    )}
                  </Button>
                )}
                
                {/* Test Validation Button (Development Only) */}
                {/* {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="secondary"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2.5 mt-2"
                    onClick={testValidation}
                  >
                    🧪 Test Validation Errors
                  </Button>
                )} */}
              </div>
            </div>

            {/* Desktop Layout - Side by side */}
            <div className="hidden sm:flex sm:justify-between gap-3">
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                
                {/* Back button - only show if not on first tab */}
                {activeTab !== 'basics' && (
                  <Button
                    variant="secondary"
                    className="border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      const tabs = ['basics', 'availability', 'details'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                    disabled={submitting}
                  >
                    ← Back
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                {/* Next button for basics and availability tabs */}
                {activeTab === 'basics' && (
                  <Button
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setActiveTab('availability')}
                    disabled={submitting || !formData.name || !formData.price || !formData.prepTime}
                  >
                    Next: Availability →
                  </Button>
                )}
                
                {activeTab === 'availability' && (
                  <Button
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setActiveTab('details')}
                    disabled={submitting}
                  >
                    Next: Details →
                  </Button>
                )}
                
                {/* Add/Save button only on details tab */}
                {activeTab === 'details' && (
                  <Button
                    variant="primary"
                    className="bg-grub-red hover:bg-red-700 text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingItem ? 'Saving...' : 'Creating...'}
                      </div>
                    ) : (
                      <>
                        {editingItem ? '💾 Save Changes' : '✨ Add Menu Item'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuPage;







