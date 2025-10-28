# Testing Subscription Notifications

## Issue Found
The notification was not being sent because the function was trying to extract restaurants from `subscriptionMealPlan.restaurants` field, but it should extract from the `generatedOrders` instead.

## Fix Applied
Updated `sendSubscriptionNotificationsToPartners()` function to:
1. Extract unique restaurants from generated orders
2. Count orders per restaurant
3. Calculate total revenue per restaurant
4. Send individual notification to each restaurant owner

## How to Test

### Step 1: Restart Backend
```bash
cd backend
npm run dev
```

### Step 2: Create a New Subscription
1. Go to customer app
2. Select meals from restaurant(s)
3. Complete subscription flow

### Step 3: Check Backend Console Logs

You should see these logs in the backend console:

```
📱 Sending subscription notifications to partner restaurants...
📊 DEBUG: generatedOrders length: 1
📊 DEBUG: subscriptionMealPlan._id: 6900bcf9fbdf0d1775e3cca6
📱 Processing subscription notifications for partners...
📊 Generated orders count: 1
👤 Customer name: jash nani
🔍 Processing generated orders to find restaurants...
📊 Found 1 unique restaurant(s) in subscription
📤 Sending notification to 890 (Owner: 68fdcea98919b04b51d48ffb)
✅ Notification sent to 890 successfully
✅ Completed sending notifications to 1 restaurant(s)
✅ Successfully sent subscription notifications to partners
```

### Step 4: Check Partner Portal

The restaurant owner should receive a notification:

```
┌─────────────────────────────────────────┐
│ 🎉 New Subscription Customer!           │
│ jash nani subscribed for 2 weeks!       │
│ 1 orders scheduled (₹XX.XX)             │
│                                         │
│ [📋 View Subscriptions]  [📊 Dashboard] │
└─────────────────────────────────────────┘
```

## Debugging

If notification is still not received, check:

1. **Backend logs** - Look for the debug logs above
2. **Restaurant has owner** - Check if restaurant has `ownerId` field
3. **Owner has FCM token** - Check if owner has registered for push notifications
4. **Firebase/Web Push** - Check if push service is working

### Check Restaurant Owner
```javascript
// In MongoDB or backend console
const restaurant = await Restaurant.findById('68fdceaa8919b04b51d48ffd').populate('ownerId');
console.log('Restaurant:', restaurant.name);
console.log('Owner:', restaurant.ownerId);
console.log('Owner FCM tokens:', restaurant.ownerId.fcmTokens);
```

### Check Push Service
```javascript
// Test sending a notification manually
const pushNotificationService = require('./src/services/pushNotificationService');

await pushNotificationService.sendToUser(
  'OWNER_USER_ID',
  {
    title: 'Test Notification',
    body: 'This is a test',
    icon: '/icons/test.png'
  },
  {
    type: 'TEST',
    action: 'view_dashboard'
  }
);
```

## Expected Behavior

### Single Restaurant Subscription
- Customer selects meals from **Restaurant A**
- **Restaurant A owner** receives 1 notification

### Two Restaurant Subscription
- Customer selects meals from **Restaurant A** and **Restaurant B**
- **Restaurant A owner** receives 1 notification (with their order count/revenue)
- **Restaurant B owner** receives 1 notification (with their order count/revenue)

## Notification Data Structure

```javascript
{
  type: 'NEW_SUBSCRIPTION',
  subscriptionId: '6900bcf9fbdf0d1775e3cca6',
  customerId: '68fdcea98919b04b51d48ffb',
  customerName: 'jash nani',
  restaurantId: '68fdceaa8919b04b51d48ffd',
  restaurantName: '890',
  orderCount: 1,
  totalAmount: 19.99,
  durationWeeks: 2,
  planType: 'bi-weekly',
  startDate: '2025-11-02T00:00:00.000Z',
  endDate: '2025-11-16T00:00:00.000Z',
  action: 'view_subscriptions'
}
```

## Common Issues

### Issue 1: No logs appear
**Cause:** Function not being called
**Solution:** Check if subscription creation is successful

### Issue 2: "No generated orders found"
**Cause:** Order generation failed
**Solution:** Check order generation service logs

### Issue 3: "Restaurant has no owner"
**Cause:** Restaurant missing ownerId
**Solution:** Update restaurant to have ownerId

### Issue 4: Notification sent but not received
**Cause:** Partner not registered for push notifications
**Solution:** Partner needs to login to portal and allow notifications
