# 🔔 Push Notifications - Complete Setup Guide

## Overview
This guide will help you set up push notifications so that **customers automatically receive notifications when partners change order status**.

---

## 📋 Prerequisites

- Node.js installed
- Backend server running
- Customer app and Partner portal deployed
- Firebase project created (optional, for FCM)

---

## 🔧 Setup Steps

### Step 1: Generate VAPID Keys

Run the VAPID key generation script from the project root:

```bash
cd grub-gate
node generate-vapid-keys.js
```

This will generate a **public key** and a **private key**. Copy both keys for the next steps.

---

### Step 2: Configure Backend

#### A. Update `.env` file

Add the following to `backend/.env`:

```env
# Push Notification Configuration
VAPID_PUBLIC_KEY=your_generated_public_key_here
VAPID_PRIVATE_KEY=your_generated_private_key_here
VAPID_SUBJECT=mailto:admin@grubgate.com

# Firebase Configuration (if using Firebase)
FIREBASE_PROJECT_ID=grubgate-514cf
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Firebase_Private_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@grubgate-514cf.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://grubgate-514cf.firebaseio.com
```

#### B. Restart Backend Server

```bash
cd backend
npm run dev
```

---

### Step 3: Configure Customer App

#### A. Update `.env` file

Create or update `apps/customer-app/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_VAPID_PUBLIC_KEY=your_generated_public_key_here
```

#### B. Update `pwa.js` (Alternative Method)

If not using `.env`, update the placeholder key in `apps/customer-app/src/pwa.js`:

```javascript
const placeholderKey = 'YOUR_GENERATED_PUBLIC_KEY_HERE';
```

#### C. Rebuild App

```bash
cd apps/customer-app
npm run build
```

---

### Step 4: Configure Partner Portal

#### A. Update `.env` file

Create or update `apps/partner-portal/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_VAPID_PUBLIC_KEY=your_generated_public_key_here
```

#### B. Rebuild App

```bash
cd apps/partner-portal
npm run build
```

---

## 🧪 Testing the Setup

### Test 1: Subscribe to Notifications (Customer App)

1. Open the **Customer App** in a browser
2. Open browser console (F12)
3. Grant notification permission when prompted
4. Look for the `PushNotificationTester` component (if available)
5. Click "Request Permission" and "Test Notification"
6. You should see a test notification

**Console logs to look for:**
```
✅ Push subscription created
✅ Subscription saved to server successfully
```

---

### Test 2: Create and Update Order (Partner Portal)

1. **Customer Action:**
   - Log in to Customer App
   - Create an order or view existing orders
   - Make sure notifications are enabled

2. **Partner Action:**
   - Log in to Partner Portal
   - Go to Orders page
   - Find a customer order
   - Change the order status (e.g., from "pending" to "confirmed")
   - Click "Update Status"

3. **Expected Result:**
   - Customer should receive a push notification immediately
   - Notification should show the new order status

**Backend console logs to look for:**
```
📤 Sending notification for order ABC123: pending → confirmed
✅ Notification sent successfully to customer John Doe
📊 Success: 1, Failed: 0
```

---

## 📱 Notification Flow

### When Partner Updates Order Status:

```
Partner Portal                  Backend API                 Customer App
     │                              │                            │
     ├─── PUT /orders/:id/status ──>│                            │
     │                              │                            │
     │                              ├─── Update order in DB      │
     │                              │                            │
     │                              ├─── Get customer FCM tokens │
     │                              │                            │
     │                              ├─── Send push notification ─>│
     │                              │                            │
     │                              │                            ├─── Show notification
     │                              │                            │
     │<────── Success response ─────┤                            │
     │                              │                            │
```

---

## 🎯 Order Status → Notification Mapping

| Order Status | Notification Template | Icon | Actions |
|--------------|----------------------|------|---------|
| `confirmed` | ✅ Order Confirmed! | order-confirmed.png | View Order |
| `preparing` | 🍳 Order Being Prepared | cooking.png | Track Order |
| `ready` | 📦 Order Ready! | order-ready.png | View Order |
| `out-for-delivery` | 🚗 Order On The Way! | delivery.png | Track Order |
| `delivered` | 🎉 Order Delivered! | delivered.png | Rate Order |
| `cancelled` | ❌ Order Cancelled | cancelled.png | View Order |

---

## 🔍 Troubleshooting

### Problem 1: No Notification Received

**Check:**
1. ✅ Customer has granted notification permission
2. ✅ Customer is logged in
3. ✅ FCM token is saved in database
4. ✅ Backend has valid VAPID keys
5. ✅ Service worker is registered

**Debug:**
```bash
# Check user's FCM tokens in database
mongosh
use grubgate
db.users.findOne({ email: "customer@example.com" }, { fcmTokens: 1 })
```

---

### Problem 2: "Subscription failed" Error

**Solution:**
- Ensure VAPID public key is correctly set
- Check browser console for detailed errors
- Verify service worker is registered: `navigator.serviceWorker.ready`

---

### Problem 3: Notifications Work in Dev but Not Production

**Check:**
1. ✅ HTTPS is enabled (required for service workers)
2. ✅ Environment variables are set in production
3. ✅ Service worker is properly built and deployed
4. ✅ CORS is configured for production domain

---

## 📊 API Endpoints

### Push Notification Endpoints

```
POST   /api/v1/push-notifications/subscribe          Subscribe to notifications
POST   /api/v1/push-notifications/unsubscribe        Unsubscribe from notifications
GET    /api/v1/push-notifications/subscriptions      Get user's subscriptions
POST   /api/v1/push-notifications/test               Send test notification
PATCH  /api/v1/push-notifications/preferences        Update notification preferences
```

### Example: Subscribe to Notifications

```javascript
const response = await fetch('http://localhost:5000/api/v1/push-notifications/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    token: 'fcm_token_here',
    deviceType: 'web',
    deviceInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      browser: 'Chrome'
    }
  })
});
```

---

## 🎨 Customizing Notifications

### Add New Notification Type

Edit `backend/src/services/pushNotificationService.js`:

```javascript
getNotificationTemplate(type, data = {}) {
  const templates = {
    // ... existing templates ...
    
    // Add your custom template
    ORDER_PICKED_UP: {
      title: '📍 Order Picked Up',
      body: `Your order has been picked up and is being delivered.`,
      icon: '/icons/pickup.png',
      data: { type: 'ORDER_UPDATE', orderId: data.orderId, action: 'track_order' }
    }
  };
  
  return templates[type] || null;
}
```

### Trigger Custom Notification

In `backend/src/controllers/partner/orders.controller.js`:

```javascript
case 'picked-up':
  notificationType = 'ORDER_PICKED_UP';
  break;
```

---

## 🔒 Security Best Practices

1. **Never commit VAPID private key** to version control
2. **Use environment variables** for all sensitive keys
3. **Validate user authentication** before sending notifications
4. **Rate limit** notification endpoints
5. **Sanitize user data** in notification messages
6. **Use HTTPS** in production (required for service workers)

---

## 📈 Monitoring & Analytics

### Track Notification Success Rate

```javascript
// In backend logs, monitor:
✅ Success rate: successCount / (successCount + failureCount)
📊 Total notifications sent per day
⏱️ Average delivery time
```

### Database Query for Metrics

```javascript
// Count active subscriptions
db.users.aggregate([
  { $match: { 'fcmTokens.isActive': true } },
  { $project: { tokenCount: { $size: '$fcmTokens' } } },
  { $group: { _id: null, total: { $sum: '$tokenCount' } } }
])
```

---

## ✅ Checklist

Before going to production, verify:

- [ ] VAPID keys generated and configured
- [ ] Backend `.env` has VAPID keys
- [ ] Customer app `.env` has public VAPID key
- [ ] Partner portal `.env` has public VAPID key
- [ ] Service workers registered in both apps
- [ ] Firebase Admin SDK configured (if using)
- [ ] HTTPS enabled in production
- [ ] CORS configured for production domains
- [ ] Notification icons exist in `/public/icons/`
- [ ] Test notifications working
- [ ] Order status change triggers notifications
- [ ] Error logging and monitoring in place

---

## 🎉 Success!

Your push notifications are now fully configured! 

**What happens now:**
1. ✅ Customers receive instant notifications when order status changes
2. ✅ Partners can update order status from the dashboard
3. ✅ Notifications work even when browser is in background
4. ✅ Users can manage notification preferences
5. ✅ All notification history is tracked in database

---

## 📞 Support

If you encounter issues:
1. Check backend logs for errors
2. Check browser console for client-side errors
3. Verify MongoDB has user FCM tokens
4. Test with the `/test` endpoint first
5. Review this guide's troubleshooting section

---

**Last Updated:** 2025-01-20
**Version:** 1.0.0
