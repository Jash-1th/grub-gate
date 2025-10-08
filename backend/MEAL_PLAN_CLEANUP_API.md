# 🧹 MealPlan Cleanup Feature - API Documentation

## Overview

This feature implements automatic cleanup of temporary meal planning data after successful subscription creation, preventing data duplication and maintaining clean database state.

## Data Flow

```
1. User plans meals → MealPlan collection (temporary)
2. User completes payment → SubscriptionMealPlan collection (permanent)  
3. System automatically cleans up → MealPlan collection (removed)
4. Orders generated → Order collection (from SubscriptionMealPlan)
```

## API Endpoint

### Create Subscription from Meal Plan

**Endpoint**: `POST /api/v1/subscription-meal-plans/create-from-meal-plan`

**Description**: Converts user's weekly meal plan to a subscription meal plan and automatically cleans up temporary data.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "subscriptionId": "subscription_12345",
  "restaurantId": "68e60c9d44b875ac6aaf953d",
  "planType": "bi-weekly",
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Chennai", 
    "province": "Tamil Nadu",
    "postalCode": "600001",
    "instructions": "Ring doorbell twice"
  },
  "specialInstructions": "No spicy food",
  "customerPhone": "+91-8125744390"
}
```

**Request Parameters**:
- `subscriptionId` (required): Subscription identifier
- `restaurantId` (required): MongoDB ObjectId of the restaurant
- `planType` (optional): "bi-weekly", "monthly", or "quarterly" (default: "bi-weekly")
- `deliveryAddress` (optional): Delivery address object
- `specialInstructions` (optional): Special delivery instructions
- `customerPhone` (optional): Customer phone number

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Subscription meal plan created successfully! Your weekly meal plan has been converted to a subscription.",
  "data": {
    "subscriptionMealPlan": {
      "_id": "68e65166b6624cc30f2da914",
      "customerId": "68e60bc544b875ac6aaf9526",
      "restaurantId": "68e60c9d44b875ac6aaf953d",
      "planType": "bi-weekly",
      "status": "active",
      "weeks": [...],
      "deliveryAddress": {...},
      "createdAt": "2025-10-08T12:00:00.000Z"
    },
    "weeksCreated": 2,
    "cleanupPerformed": true
  }
}
```

**Error Responses**:

**404 - No Meal Plan Found**:
```json
{
  "status": "error",
  "message": "No meal plan found. Please create a meal plan first."
}
```

**400 - No Meal Data**:
```json
{
  "status": "error", 
  "message": "No meal data found in your weekly plan. Please add some meals first."
}
```

**404 - Restaurant Not Found**:
```json
{
  "status": "error",
  "message": "Restaurant not found"
}
```

## Implementation Details

### Data Conversion Process

1. **Fetch User's MealPlan**: Gets current meal plan from MealPlan collection
2. **Validate Restaurant**: Ensures restaurant exists and is valid
3. **Convert Data Structure**: Transforms MealPlan format to SubscriptionMealPlan format
4. **Create Subscription**: Saves new SubscriptionMealPlan document
5. **Cleanup**: Removes original MealPlan document
6. **Return Response**: Confirms successful creation and cleanup

### Cleanup Logic

```javascript
// Complete cleanup (removes entire meal plan)
const deleteResult = await MealPlan.deleteOne({ userId: userId });

// Alternative: Selective cleanup (removes only specific weeks)
// await MealPlan.findOneAndUpdate(
//   { userId: userId },
//   { 
//     $unset: { 
//       'weeklyPlans.week0': 1,
//       'weeklyPlans.week1': 1
//     }
//   }
// );
```

### Error Handling

- **Graceful Cleanup Failure**: If cleanup fails, subscription creation still succeeds
- **Transaction Safety**: Uses proper error handling to prevent partial states
- **Detailed Logging**: Comprehensive logging for debugging and monitoring

## Testing

### Test Script
```bash
npm run test:cleanup
```

This script:
1. Creates a test meal plan
2. Simulates subscription creation
3. Verifies cleanup worked correctly
4. Confirms data integrity

### Manual Testing

1. **Create Meal Plan**: Use weekly menu to plan meals
2. **Complete Payment**: Call the API endpoint with payment data
3. **Verify Cleanup**: Check that MealPlan collection is cleaned
4. **Confirm Subscription**: Verify SubscriptionMealPlan was created
5. **Test Order Generation**: Ensure orders can be generated from subscription

## Benefits

### ✅ **Data Integrity**
- No duplicate meal data across collections
- Clean database state after subscription creation
- Proper data lifecycle management

### ✅ **Performance**
- Reduced database storage usage
- Faster queries without duplicate data
- Cleaner data structure

### ✅ **User Experience**
- Seamless transition from planning to subscription
- No confusion from old planning data
- Clear separation between temporary and permanent data

### ✅ **Business Logic**
- Proper subscription workflow
- Clear data ownership (MealPlan → SubscriptionMealPlan)
- Audit trail of subscription creation

## Security Considerations

- **Authentication Required**: Only authenticated users can create subscriptions
- **User Ownership**: Only user's own meal plan can be converted
- **Data Validation**: All input data is validated before processing
- **Error Handling**: Sensitive information not exposed in error messages

## Monitoring

### Success Metrics
- Subscription creation success rate
- Cleanup completion rate
- Data consistency checks

### Error Monitoring
- Failed cleanup attempts
- Data conversion errors
- Validation failures

### Logging
```javascript
console.log(`🧹 Cleaning up meal plan data for user ${userId}...`);
console.log(`✅ Deleted meal plan for user ${userId}:`, deleteResult);
```

## Future Enhancements

1. **Partial Cleanup**: Option to clean only specific weeks
2. **Backup Before Cleanup**: Optional data backup before deletion
3. **Rollback Capability**: Ability to restore meal plan if needed
4. **Batch Processing**: Handle multiple users' cleanup in batches
5. **Analytics**: Track cleanup patterns and success rates

---

**Status**: ✅ **Production Ready**  
**Version**: 1.0.0  
**Last Updated**: October 8, 2025
