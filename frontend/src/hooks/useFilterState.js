import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCurrentDay } from '../utils/filteringAlgorithms';

/**
 * Custom hook for managing filter state across restaurant pages
 * Provides consistent state management for meal types, preferences, and UI controls
 * SSR-safe implementation
 */
export const useFilterState = (initialDay = null, initialMeal = 'lunch') => {
  const [searchParams] = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  
  // Get URL parameters with fallbacks
  const dayFromUrl = initialDay || searchParams.get('day') || getCurrentDay();
  const selectedMealFromUrl = searchParams.get('meal') || initialMeal;

  // Core filter state
  const [selectedDay, setSelectedDay] = useState(dayFromUrl);
  const [selectedMealType, setSelectedMealType] = useState(selectedMealFromUrl);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  
  // UI state
  const [showPreferencesFilter, setShowPreferencesFilter] = useState(false);
  const [showDaysFilter, setShowDaysFilter] = useState(false);
  const [showMealDropdown, setShowMealDropdown] = useState(false);
  const [showStickyMealDropdown, setShowStickyMealDropdown] = useState(false);
  const [showStickyFilter, setShowStickyFilter] = useState(false);
  
  // Scroll state
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Refs
  const itemsContainerRef = useRef(null);
  const filterSectionRef = useRef(null);

  // SSR safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-scroll utility
  const scrollToItems = (delay = 100) => {
    setTimeout(() => {
      if (itemsContainerRef.current) {
        itemsContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, delay);
  };

  // Meal type change handlers
  const handleMealTypeChange = (mealType) => {
    setSelectedMealType(mealType);
    setShowMealDropdown(false);
    scrollToItems();
  };

  const handleStickyMealTypeChange = (mealType) => {
    setSelectedMealType(mealType);
    setShowStickyMealDropdown(false);
    scrollToItems();
  };

  const handleCompactMealTypeChange = (mealType) => {
    setSelectedMealType(mealType);
    scrollToItems();
  };

  // Filter handlers
  const handlePreferencesFilterApply = (preferences) => {
    setSelectedPreferences(preferences);
    setShowPreferencesFilter(false);
    scrollToItems(300);
  };

  const handleDaysFilterApply = () => {
    setShowDaysFilter(false);
    scrollToItems(300);
  };

  // Preference selection
  const handlePreferenceClick = (preferenceId) => {
    setSelectedPreferences(prev => {
      return prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId];
    });
  };

  // Dropdown click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMealDropdown && !event.target.closest('.meal-dropdown')) {
        setShowMealDropdown(false);
      }
    };

    if (isClient) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMealDropdown, isClient]);

  // Sticky filter scroll detection
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show sticky filter when scrolled past filter section
      if (filterSectionRef.current) {
        const filterSectionBottom = filterSectionRef.current.offsetTop + filterSectionRef.current.offsetHeight;
        setShowStickyFilter(currentScrollY > filterSectionBottom);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  return {
    // State
    isClient,
    selectedDay,
    selectedMealType,
    selectedPreferences,
    showPreferencesFilter,
    showDaysFilter,
    showMealDropdown,
    showStickyMealDropdown,
    showStickyFilter,
    lastScrollY,
    
    // Refs
    itemsContainerRef,
    filterSectionRef,
    
    // Setters
    setSelectedDay,
    setSelectedMealType,
    setSelectedPreferences,
    setShowPreferencesFilter,
    setShowDaysFilter,
    setShowMealDropdown,
    setShowStickyMealDropdown,
    setShowStickyFilter,
    
    // Handlers
    handleMealTypeChange,
    handleStickyMealTypeChange,
    handleCompactMealTypeChange,
    handlePreferencesFilterApply,
    handleDaysFilterApply,
    handlePreferenceClick,
    scrollToItems
  };
};
