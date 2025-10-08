# 🔧 Backend Subscription Fix Required

## Problem
Frontend and backend use different week calculation logic:

**Frontend (Correct):**
- Week 0: Oct 12-18 (Sunday to Saturday)
- Week 1: Oct 19-25 (Sunday to Saturday)

**Backend (Wrong):**
- Week 0: Oct 8-14 (Wednesday to Tuesday)  
- Week 1: Oct 15-21 (Wednesday to Tuesday)

## Required Changes

### 1. Fix subscriptionMealPlan.controller.js

**Current (Wrong):**
```javascript
const weekStartDate = new Date(today);
weekStartDate.setDate(today.getDate() + (weekIndex * 7));
```

**Should be (Correct):**
```javascript
// Helper function to get next Sunday (same as frontend)
const getNextSunday = (fromDate = new Date()) => {
  const dayOfWeek = fromDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  
  const nextSunday = new Date(fromDate);
  nextSunday.setDate(fromDate.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0);
  return nextSunday;
};

// Use in subscription creation
const nextSunday = getNextSunday(today);
const weekStartDate = new Date(nextSunday);
weekStartDate.setDate(nextSunday.getDate() + (weekIndex * 7));
```

### 2. Fix Order Generation Service

**Current (Wrong):**
```javascript
const todayDay = today.getDay(); // Uses calendar day
const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const todayName = dayNames[todayDay]; // Looks for calendar day in subscription
```

**Should be (Correct):**
```javascript
// Find which subscription day corresponds to today's calendar date
const findSubscriptionDayForDate = (targetDate, subscriptionPlan) => {
  for (const week of subscriptionPlan.weeks) {
    const weekStart = new Date(week.weekStartDate);
    const weekEnd = new Date(week.weekEndDate);
    
    if (targetDate >= weekStart && targetDate <= weekEnd) {
      // Calculate which subscription day this calendar date represents
      const dayIndex = Math.floor((targetDate - weekStart) / (24 * 60 * 60 * 1000));
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return dayNames[dayIndex];
    }
  }
  return null;
};
```

### 3. Update SubscriptionMealPlan.js Model

**Current getTodaysMeals() method needs to be updated to use proper date mapping instead of calendar day matching.**

## Expected Result After Fix

**Today: Oct 8, 2025 (Wednesday)**

**Frontend UI:**
- Shows Week 0: Oct 12-18
- Shows Week 1: Oct 19-25

**Backend Subscription:**
- Creates Week 0: Oct 12-18 ✅ (matches frontend)
- Creates Week 1: Oct 19-25 ✅ (matches frontend)

**Order Generation:**
- Oct 12: Generates orders for "sunday" meals
- Oct 13: Generates orders for "monday" meals
- Oct 14: Generates orders for "tuesday" meals
- etc.

## Files to Modify

1. `src/controllers/subscriptionMealPlan.controller.js` - Fix week calculation
2. `src/services/orderGenerationService.js` - Fix day mapping
3. `src/models/SubscriptionMealPlan.js` - Fix getTodaysMeals method

## Testing

After fix, verify:
1. Frontend shows Oct 12-18 and Oct 19-25
2. Backend creates subscription with same date ranges
3. Orders generate on correct calendar dates
4. No orders appear for Oct 9-10 (they're not in the Sunday-based weeks)
