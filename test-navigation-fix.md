# Navigation Fix Test

## Problem Fixed:
When navigating from Daily Meal Plan Page → Restaurant Selection → Restaurant Detail Page, the button was showing "Back to Weekly Planning" instead of "Select This Restaurant".

## Changes Made:

### 1. DayMealPlanPage.jsx
- Changed all `source=weekly-menu` to `source=daily-meal-plan`
- This distinguishes Daily Meal Plan navigation from Weekly Menu navigation

### 2. RestaurantDetailPage.jsx
- Updated `handleSelectRestaurant` function to check `contextSource`
- When `contextSource === 'daily-meal-plan'`:
  - Shows "Select This Restaurant" button (not meal planning mode)
  - Navigates back to `/meal-plan/${contextDay}?week=${contextWeek}` after selection
- When `contextSource === 'weekly-menu'`:
  - Shows "Back to Weekly Planning" button (meal planning mode)
  - Navigates back to `/weekly-menu?week=${contextWeek}` after selection

## Expected Flow After Fix:

### From Daily Meal Plan Page:
1. `/meal-plan/sunday?week=0` → Click "Add More Items" → Modal ✅
2. Modal → Click "Add Second Restaurant" → `/plan/restaurants?source=daily-meal-plan&...` ✅
3. Restaurant Selection → Click restaurant → `/restaurant/ID?source=daily-meal-plan&...` ✅
4. Restaurant Detail → Shows **"Select This Restaurant"** button ✅
5. Click button → Navigates back to `/meal-plan/sunday?week=0` ✅

### From Weekly Menu Page (unchanged):
1. `/weekly-menu?week=0` → Click restaurant → `/restaurant/ID?source=weekly-menu&...` ✅
2. Restaurant Detail → Shows **"Back to Weekly Planning"** button ✅
3. Click button → Navigates back to `/weekly-menu?week=0` ✅

## Test Instructions:
1. Go to `http://localhost:3000/meal-plan/sunday?week=0`
2. Click "Add More Lunch Items"
3. Click "Add Second Restaurant" in modal
4. Click on any unselected restaurant
5. Verify button shows "Select This Restaurant" (not "Back to Weekly Planning")
6. Click the button and verify it returns to the daily meal plan page
