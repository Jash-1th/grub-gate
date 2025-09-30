import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { unifiedRestaurants } from '../data/unifiedRestaurants';
import { DAYS_OF_WEEK } from '../utils/filteringAlgorithms';
import { applyPreferenceFilter } from '../utils/filteringHelpers';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';
import { usePlanning } from '../contexts/PlanningContext';

// Import new components
import RestaurantHero from '../components/restaurant/RestaurantHero';
import UserTypeToggle from '../components/restaurant/UserTypeToggle';
import FloatingNavbar from '../components/restaurant/FloatingNavbar';
import PreferencesSelector from '../components/restaurant/PreferencesSelector';
import MenuItemsGrid from '../components/restaurant/MenuItemsGrid';
import ItemDetailsModal from '../components/restaurant/ItemDetailsModal';
import ProUserFeatures from '../components/restaurant/ProUserFeatures';
import FloatingPreferencesButton from '../components/restaurant/FloatingPreferencesButton';
import NextStepButton from '../components/restaurant/NextStepButton';
import UserTypeSelectionModal from '../components/shared/UserTypeSelectionModal';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if coming from MenuSelectionStep with context
  const contextDay = searchParams.get('day');
  const contextSlot = searchParams.get('slot');
  const contextUserType = searchParams.get('userType');
  const contextPreferences = searchParams.get('preferences');
  const isFromMenuSelection = !!(contextDay && contextSlot);
  
  // State for active day tab - initialize from context if available
  const [activeDay, setActiveDay] = useState(contextDay || 'monday');
  
  // State for user type toggle - initialize from context if available
  const [userType, setUserType] = useState(contextUserType || 'normal'); // 'normal' or 'pro'
  
  // State for meal type selection - initialize from context if available
  const [selectedMealType, setSelectedMealType] = useState(contextSlot || 'lunch'); // 'lunch' or 'dinner'
  
  // State for preferences selection - initialize from context if available
  const [selectedPreferences, setSelectedPreferences] = useState(
    contextPreferences ? contextPreferences.split(',') : []
  ); // array of preference IDs
  const [showPreferences, setShowPreferences] = useState(false); // toggle preferences visibility
  
  // State for floating selector
  const [showFloatingSelector, setShowFloatingSelector] = useState(false);
  
  // State for navbar indicator
  const [showNavbarIndicator, setShowNavbarIndicator] = useState(false);
  
  // State for day/meal selector (shown when normal user clicks "Add to Plan")
  const [showDayMealSelector, setShowDayMealSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // State for detailed item view
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [showItemDetails, setShowItemDetails] = useState(false);

  // Meal plan context
  const { addItemToPlan, removeItemFromPlan, getMealItems, mealPlan } = useMealPlan();
  
  // Toast context
  const { showMealPlanSuccess } = useToast();
  
  // Planning context (only get postal code)
  const { postalCode } = usePlanning();

  // State for user type selection (show modal on first visit)
  const [showUserTypeModal, setShowUserTypeModal] = useState(true);
  const [hasSelectedUserType, setHasSelectedUserType] = useState(false);

  // Get restaurant data from unified source
  const restaurant = useMemo(() => {
    return unifiedRestaurants.find(r => r.id === parseInt(id));
  }, [id]);

  // Get all food items for this restaurant
  const allFoodItems = useMemo(() => {
    if (!restaurant || !restaurant.foodItems) return { lunch: [], dinner: [] };
    
    // Filter items based on availability for the active day
    const lunchItems = restaurant.foodItems.filter(item => 
      item.availability[activeDay]?.lunch
    );
    const dinnerItems = restaurant.foodItems.filter(item => 
      item.availability[activeDay]?.dinner
    );
    
    return { lunch: lunchItems, dinner: dinnerItems };
  }, [restaurant, activeDay]);

  // Organize items by day and meal type based on user type
  const weeklyMenuData = useMemo(() => {
    if (!restaurant || !restaurant.foodItems) return {};
    
    const weekData = {};
    
    DAYS_OF_WEEK.forEach(day => {
      weekData[day.id] = {
        lunch: [],
        dinner: []
      };
    });

    if (userType === 'normal') {
      // For normal users: Show all items that are available for the selected day/meal
      const filteredItems = applyPreferenceFilter(restaurant.foodItems, selectedPreferences);
      
      DAYS_OF_WEEK.forEach(day => {
        // Filter items based on their availability for this specific day
        const lunchItems = filteredItems.filter(item => 
          item.availability[day.id]?.lunch
        );
        const dinnerItems = filteredItems.filter(item => 
          item.availability[day.id]?.dinner
        );
        
        weekData[day.id] = {
          lunch: lunchItems,
          dinner: dinnerItems
        };
      });
    } else {
      // For pro users: Same logic but with more detailed availability checking
      const filteredItems = applyPreferenceFilter(restaurant.foodItems, selectedPreferences);
      
      DAYS_OF_WEEK.forEach(day => {
        const lunchItems = filteredItems.filter(item => 
          item.availability[day.id]?.lunch
        );
        const dinnerItems = filteredItems.filter(item => 
          item.availability[day.id]?.dinner
        );
        
        weekData[day.id] = {
          lunch: lunchItems,
          dinner: dinnerItems
        };
      });
    }

    return weekData;
  }, [restaurant, userType, selectedPreferences]);

  // Handle add to plan for weekly builder
  const handleAddToPlan = (item, day, mealType) => {
    // For pro users, add directly using current day/meal selection
    if (userType === 'pro') {
      addItemToPlan(item, day, mealType, restaurant.name);
      showMealPlanSuccess(item.name, day, mealType, restaurant.name, item.price);
    }
    // For normal users, this function won't be called directly from cards
    // They will use handleAddToPlanFromDetails instead
  };

  // Handle final add to plan from day/meal selector
  const handleConfirmAddToPlan = () => {
    if (selectedItem) {
      addItemToPlan(selectedItem, activeDay, selectedMealType, restaurant.name);
      showMealPlanSuccess(selectedItem.name, activeDay, selectedMealType, restaurant.name, selectedItem.price);
      setShowDayMealSelector(false);
      setSelectedItem(null);
      // Removed automatic scrolling to prevent unwanted scroll behavior
    }
  };

  // Handle cancel add to plan
  const handleCancelAddToPlan = () => {
    setShowDayMealSelector(false);
    setSelectedItem(null);
  };

  // Handle item click to show details
  const handleItemClick = (item) => {
    setSelectedDetailItem(item);
    setShowItemDetails(true);
  };

  // Handle remove from plan
  const handleRemoveFromPlan = (item) => {
    // Find the meal plan item with matching item id
    const mealItems = getMealItems(activeDay, selectedMealType);
    const mealPlanItem = mealItems.find(mealItem => mealItem.id === item.id);
    
    if (mealPlanItem && mealPlanItem.planId) {
      removeItemFromPlan(mealPlanItem.planId, activeDay, selectedMealType);
    } else {
      console.warn('Could not find meal plan item to remove:', item.id);
    }
  };

  // Handle close item details
  const handleCloseItemDetails = () => {
    setShowItemDetails(false);
    setSelectedDetailItem(null);
  };

  // Handle add to plan from item details
  const handleAddToPlanFromDetails = (item) => {
    // Add item directly to plan with selected day and meal
    addItemToPlan(item, activeDay, selectedMealType, restaurant.name);
    showMealPlanSuccess(item.name, activeDay, selectedMealType, restaurant.name, item.price);
    
    // Close the item details modal
    setShowItemDetails(false);
    setSelectedDetailItem(null);
    
    // Removed automatic scrolling to prevent unwanted scroll behavior
  };

  // Handle user type selection
  const handleUserTypeSelection = (selectedUserType) => {
    setUserType(selectedUserType);
    setShowUserTypeModal(false);
    setHasSelectedUserType(true);
  };

  // Handle preference selection after user type is chosen
  const handlePreferenceSelection = (preferences) => {
    setSelectedPreferences(preferences);
    setShowPreferences(false);
  };

  // Check if an item is already in the meal plan
  const isItemInPlan = (itemId) => {
    if (!mealPlan || !Array.isArray(mealPlan)) return false;
    return mealPlan.some(planItem => planItem.item.id === itemId);
  };


  // Get meal plan entries for a specific item
  const getItemPlanEntries = (itemId) => {
    if (!mealPlan || !Array.isArray(mealPlan)) return [];
    return mealPlan.filter(planItem => planItem.item.id === itemId);
  };

  // Helper functions
  const getPageTitle = () => {
    if (isFromMenuSelection) {
      const dayName = DAYS_OF_WEEK.find(d => d.id === contextDay)?.name || contextDay;
      const slotName = contextSlot.charAt(0).toUpperCase() + contextSlot.slice(1);
      
      if (contextUserType === 'normal') {
        return `Build Your ${dayName} ${slotName} Plan`;
      } else {
        return `Build Your ${dayName} Plan`;
      }
    }
    return restaurant.name;
  };

  const getPageDescription = () => {
    if (isFromMenuSelection) {
      return `Choose from ${restaurant.name}'s delicious menu items for your meal plan`;
    }
    return restaurant.description;
  };

  // Scroll detection for navbar indicator
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (userType !== 'pro') {
            setShowNavbarIndicator(false);
            ticking = false;
            return;
          }

          const menuItemsSection = document.querySelector(`[data-menu-items-section="${userType}"]`);
          
          if (menuItemsSection) {
            const rect = menuItemsSection.getBoundingClientRect();
            const shouldShowNavbar = rect.top <= 150;
            setShowNavbarIndicator(shouldShowNavbar);
          } else {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const shouldShowNavbar = scrollY > 600;
            setShowNavbarIndicator(shouldShowNavbar);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [userType]);

  // Scroll helper functions
  const scrollToPreferences = () => {
    const element = document.querySelector('[data-preferences-section]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToMenuItems = () => {
    const element = document.querySelector(`[data-menu-items-section="${userType}"]`);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const offset = 150;
      
      window.scrollTo({
        top: absoluteElementTop - offset,
        behavior: 'smooth'
      });
    }
  };

  // Restaurant not found
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <button
            onClick={() => navigate('/plan')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <RestaurantHero 
        restaurant={restaurant}
        pageTitle={getPageTitle()}
        pageDescription={getPageDescription()}
      />


      {/* Floating Preferences Filter Button */}
      <FloatingPreferencesButton 
        selectedPreferences={selectedPreferences}
        onPreferencesClick={setShowPreferences}
        scrollToPreferences={scrollToPreferences}
      />

      {/* User Type Toggle */}
      <UserTypeToggle 
        userType={userType}
        onUserTypeChange={setUserType}
      />

      {/* Floating Navbar */}
      <FloatingNavbar 
        showNavbarIndicator={showNavbarIndicator}
        userType={userType}
        selectedMealType={selectedMealType}
        activeDay={activeDay}
        selectedPreferences={selectedPreferences}
        isFromMenuSelection={isFromMenuSelection}
        onMealTypeChange={setSelectedMealType}
        onDayChange={setActiveDay}
        onPreferencesClick={() => {
          setShowPreferences(true);
          scrollToPreferences();
        }}
        scrollToMenuItems={scrollToMenuItems}
      />

      {/* Content Based on User Type */}
      {userType === 'normal' ? (
        // Normal User Experience
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Weekly Menu Builder - Main Content */}
            <div>
              {/* Preferences Selector */}
              {hasSelectedUserType && (
                <div className="mb-6" data-preferences-section>
                  <PreferencesSelector 
                    selectedPreferences={selectedPreferences}
                    onPreferencesChange={setSelectedPreferences}
                    showPreferences={showPreferences}
                    onTogglePreferences={setShowPreferences}
                    userType={userType}
                  />
                </div>
              )}

              {/* Menu Items Grid */}
              {hasSelectedUserType && (
                <MenuItemsGrid 
                  items={restaurant?.foodItems?.filter(item => {
                    if (selectedPreferences.length === 0) return true;
                    return selectedPreferences.some(pref => 
                      item.dietaryPreferences?.includes(pref)
                    );
                  }) || []}
                  userType={userType}
                  selectedDay={activeDay}
                  selectedMealType={selectedMealType}
                  restaurantName={restaurant.name}
                  onItemClick={handleItemClick}
                  onRemoveFromPlan={handleRemoveFromPlan}
                  isItemInPlan={isItemInPlan}
                  getItemPlanEntries={getItemPlanEntries}
                  title="Menu Items"
                  subtitle="Click any item to view details"
                  emptyStateMessage="No menu items available"
                  isFromMenuSelection={isFromMenuSelection}
                />
              )}
          </div>
        </div>
        </div>
      ) : (
        // Pro User Experience
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            {/* Enhanced Menu Builder - Main Content */}
            <div>
              {/* Pro Header */}

              {/* Preferences Selector for Pro Users */}
              <div className="mb-6" data-preferences-section>
                <PreferencesSelector 
                  selectedPreferences={selectedPreferences}
                  onPreferencesChange={setSelectedPreferences}
                  showPreferences={showPreferences}
                  onTogglePreferences={setShowPreferences}
                  userType={userType}
                />
              </div>

              {/* Pro User Features */}
              <ProUserFeatures 
                activeDay={activeDay}
                selectedMealType={selectedMealType}
                isFromMenuSelection={isFromMenuSelection}
                onDayChange={setActiveDay}
                onMealTypeChange={setSelectedMealType}
              />

              {/* Pro Menu Items Grid */}
              <MenuItemsGrid 
                items={weeklyMenuData[activeDay]?.[selectedMealType] || []}
                userType={userType}
                selectedDay={activeDay}
                selectedMealType={selectedMealType}
                restaurantName={restaurant.name}
                onItemClick={handleItemClick}
                onRemoveFromPlan={handleRemoveFromPlan}
                isItemInPlan={isItemInPlan}
                getItemPlanEntries={getItemPlanEntries}
                title={`${selectedMealType === 'lunch' ? 'Lunch' : 'Dinner'} Planning`}
                subtitle={`Planning for ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name}`}
                emptyStateMessage={`No ${selectedMealType} items available for ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name}`}
                showProBadges={true}
              />
            </div>
          </div>
        </div>
      )}


      {/* Next Step Button */}
      <NextStepButton />

      {/* Item Details Modal */}
      <ItemDetailsModal 
        isOpen={showItemDetails}
        item={selectedDetailItem}
        userType={userType}
        activeDay={activeDay}
        selectedMealType={selectedMealType}
        isFromMenuSelection={isFromMenuSelection}
        onClose={handleCloseItemDetails}
        onAddToPlan={handleAddToPlanFromDetails}
        onDayChange={setActiveDay}
        onMealTypeChange={setSelectedMealType}
      />

      {/* User Type Selection Modal */}
      <UserTypeSelectionModal
        isOpen={showUserTypeModal}
        onClose={() => setShowUserTypeModal(false)}
        onConfirm={handleUserTypeSelection}
        restaurantName={restaurant?.name || 'this restaurant'}
      />
    </div>
  );
};

export default RestaurantDetailPage;
