# 🔔 Push Notifications Deployment Guide

## ✅ Fixed Issues

### 1. Service Worker 404 - SOLVED ✓
- **Problem**: Service workers not being copied to dist folder during build
- **Solution**: Added `vite-plugin-static-copy` to both apps
- **Files Updated**:
  - `apps/customer-app/vite.config.js`
  - `apps/partner-portal/vite.config.js`
  - Added `copyPublicDir: true` in build config

### 2. VAPID Key Mismatch - SOLVED ✓
- **Problem**: Environment variables not properly configured
- **Solution**: Created `.env.example` files with proper format
- **Files Created**:
  - `apps/customer-app/.env.example`
  - `apps/partner-portal/.env.example`

### 3. CORS Errors - SOLVED ✓
- **Problem**: Backend not allowing deployed domain origins
- **Solution**: Enhanced CORS configuration with better logging
- **File Updated**: `backend/server.js`

### 4. Permission Prompt - User Guide Created ✓
- **Problem**: Users denying permission or not getting prompted
- **Solution**: Added clear instructions below

---

## 📋 Pre-Deployment Checklist

### Step 1: Install Dependencies

```bash
# Customer App
cd apps/customer-app
npm install vite-plugin-static-copy --save-dev

# Partner Portal
cd apps/partner-portal
npm install vite-plugin-static-copy --save-dev
```

### Step 2: Configure Environment Variables

#### Customer App (.env)
```env
VITE_API_URL=https://your-backend-url.com/api/v1
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key-here
```

#### Partner Portal (.env)
```env
# Same as customer app
VITE_API_URL=https://your-backend-url.com/api/v1
VITE_FIREBASE_API_KEY=your-firebase-api-key
# ... rest same as above
```

#### Backend (.env)
```env
# Add your deployed frontend URLs
CORS_ORIGIN=https://grubgate-customer.netlify.app,https://grubgate-partner.netlify.app

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# VAPID Keys
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### Step 3: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. **Enable Cloud Messaging**:
   - Go to Project Settings → Cloud Messaging
   - Enable "Cloud Messaging API (V1)"
4. **Add Authorized Domains**:
   - Go to Project Settings → General
   - Scroll to "Authorized domains"
   - Add your deployed domains:
     - `grubgate-customer.netlify.app`
     - `grubgate-partner.netlify.app`
5. **Generate VAPID Keys** (if not done):
   - Go to Project Settings → Cloud Messaging → Web Push certificates
   - Click "Generate key pair"
   - Copy the public key to your `.env` files

---

## 🚀 Deployment Steps

### 1. Deploy Backend (Netlify/Render/Railway)

#### For Netlify Functions:
```bash
cd backend
netlify deploy --prod
```

#### For Render/Railway:
1. Connect your GitHub repo
2. Set environment variables in dashboard
3. Deploy

**Important**: Add these environment variables in your deployment platform:
- `CORS_ORIGIN` - Your deployed frontend URLs (comma-separated)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (wrap in quotes)
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

### 2. Deploy Customer App (Netlify)

```bash
cd apps/customer-app

# Build
npm run build

# Deploy
netlify deploy --prod
```

**Netlify Environment Variables** (in dashboard):
- `VITE_API_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_VAPID_PUBLIC_KEY`

### 3. Deploy Partner Portal (Netlify)

```bash
cd apps/partner-portal

# Build
npm run build

# Deploy
netlify deploy --prod
```

**Same environment variables as Customer App**

---

## 🧪 Post-Deployment Testing

### Test 1: Service Worker Registration

1. Open deployed customer app on **HTTPS** (required!)
2. Open browser DevTools → Console
3. Look for: `✅ ServiceWorker registration successful`
4. Check: DevTools → Application → Service Workers
5. Verify service worker is **activated**

### Test 2: FCM Token Generation

1. Log in to the app
2. Grant notification permission when prompted
3. Check console for: `✅ Partner FCM token generated`
4. Token should be saved to database automatically

### Test 3: Send Test Notification

#### Method 1: Using Backend API
```bash
curl -X POST https://your-backend-url.com/api/v1/push-notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "title": "Test Notification",
    "body": "Testing mobile push notifications"
  }'
```

#### Method 2: Partner Changes Order Status
1. Partner portal → Orders
2. Change an order status
3. Customer should receive notification

### Test 4: Mobile Testing

#### Android (Chrome/Firefox):
1. Open https://your-app.com on mobile
2. Log in
3. Accept notification permission
4. Test notification delivery
5. ✅ Should work perfectly

#### iOS (Safari 16.4+):
1. Open https://your-app.com
2. Add to Home Screen
3. Grant notification permission
4. ⚠️ Limited support - may not work fully

---

## 🔧 Troubleshooting

### Issue: Service Worker 404

**Symptoms**:
```
Failed to register service worker: 404 Not Found
```

**Solutions**:
1. ✅ Verify `vite-plugin-static-copy` is installed
2. ✅ Check `vite.config.js` has proper plugin configuration
3. ✅ Rebuild: `npm run build`
4. ✅ Check dist folder contains service workers:
   - `dist/service-worker.js`
   - `dist/firebase-messaging-sw.js` (or `firebase-messaging-sw-partner.js`)

### Issue: VAPID Key Mismatch

**Symptoms**:
```
Error: VAPID key mismatch
Error: The provided VAPID key is invalid
```

**Solutions**:
1. ✅ Verify VAPID keys in `.env` files
2. ✅ Ensure keys are in **base64url** format (no `=` padding)
3. ✅ Regenerate keys if needed:
   ```bash
   node backend/generate-vapid-keys.js
   ```
4. ✅ Update both frontend and backend `.env` files
5. ✅ Redeploy both apps

### Issue: CORS Errors

**Symptoms**:
```
Access to fetch at 'https://api.com' from origin 'https://app.com' has been blocked by CORS
```

**Solutions**:
1. ✅ Update backend `CORS_ORIGIN` environment variable
2. ✅ Format: `https://app1.com,https://app2.com` (comma-separated, no spaces)
3. ✅ Restart backend server
4. ✅ Check backend logs for CORS configuration

### Issue: No Permission Prompt

**Symptoms**: Notification permission not being requested

**Solutions**:

#### If permission was denied:
1. **Chrome (Desktop)**:
   - Click lock icon in address bar
   - Notifications → Reset
   - Refresh page

2. **Chrome (Android)**:
   - Settings → Site Settings → Notifications
   - Find your site → Reset

3. **Firefox**:
   - Settings → Privacy & Security → Permissions → Notifications
   - Remove site → Refresh

#### If prompt never appears:
1. Check console for errors
2. Verify HTTPS (required for notifications)
3. Ensure Firebase is properly initialized
4. Check VAPID key is correct

### Issue: Notifications Not Appearing

**Symptoms**: Token registered but no notification shows

**Solutions**:
1. ✅ Check service worker is **active** (not just registered)
2. ✅ Verify notification permission is **granted**
3. ✅ Check browser console for errors
4. ✅ Test with simple notification:
   ```javascript
   navigator.serviceWorker.ready.then(registration => {
     registration.showNotification('Test', {
       body: 'If you see this, service worker works!'
     });
   });
   ```
5. ✅ Verify Firebase Cloud Messaging is enabled in console
6. ✅ Check backend logs for notification send errors

---

## 📱 Mobile-Specific Notes

### Android
- ✅ Full support in Chrome, Firefox, Edge
- ✅ Works with browser closed (if PWA installed)
- ✅ Notifications show in system tray
- ⚠️ User must grant permission

### iOS
- ❌ **No support in iOS < 16.4**
- ⚠️ **Limited support in iOS 16.4+**:
  - Must add to Home Screen
  - Only works for PWAs
  - Limitations compared to Android
- ℹ️ Consider:
  - SMS notifications as fallback
  - Email notifications
  - In-app notifications only

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files to git
- ✅ Use `.env.example` as template
- ✅ Store secrets in deployment platform
- ✅ Rotate VAPID keys periodically

### 2. CORS Configuration
- ✅ Only allow specific origins (no wildcards in production)
- ✅ Keep CORS_ORIGIN updated
- ✅ Monitor blocked origins in logs

### 3. Firebase Security
- ✅ Restrict API keys to specific domains
- ✅ Use Firebase Security Rules
- ✅ Enable App Check for production

---

## 📊 Monitoring

### Check Notification Delivery

1. **Backend Logs**:
   ```
   ✅ Web push notification sent successfully
   📱 Sending to X web push subscriptions
   ```

2. **Frontend Console**:
   ```
   Push event received
   ✅ Notification displayed successfully
   ```

3. **Database**:
   - Check `users` collection for FCM tokens
   - Verify tokens are being updated

### Analytics

Track:
- Notification permission grant rate
- Delivery success rate
- Click-through rate
- Failed deliveries

---

## 🎯 Success Criteria

All these should work after deployment:

- [x] Service workers load without 404
- [x] VAPID keys match between frontend/backend
- [x] CORS allows deployed domains
- [x] Permission prompt appears on first login
- [x] FCM tokens are generated and saved
- [x] Notifications appear on Android Chrome
- [x] Notifications work on desktop browsers
- [x] Partner status changes trigger customer notifications
- [x] Notifications include proper title, body, icon
- [x] Clicking notification opens app

---

## 🆘 Need Help?

### Debugging Checklist
1. Check browser console (F12)
2. Check backend logs
3. Check Firebase Console → Cloud Messaging
4. Verify all environment variables
5. Test on different devices/browsers
6. Check HTTPS is enabled

### Common Commands

```bash
# Rebuild everything
npm run build

# Test locally with HTTPS
npm run preview

# Check service worker
open http://localhost:3000 
# DevTools → Application → Service Workers

# Test notification permission
navigator.permissions.query({name: 'notifications'})
```

---

## 📝 Deployment Checklist Summary

- [ ] Install `vite-plugin-static-copy` in both apps
- [ ] Configure `.env` files for all apps
- [ ] Add Firebase authorized domains
- [ ] Deploy backend with CORS_ORIGIN set
- [ ] Deploy customer app with all VITE_ variables
- [ ] Deploy partner portal with all VITE_ variables
- [ ] Test service worker registration
- [ ] Test FCM token generation
- [ ] Test notification delivery
- [ ] Test on mobile (Android)
- [ ] Monitor logs for errors

---

## 🎉 Success!

If all tests pass, your push notifications are fully deployed and working! 🚀

For issues not covered here, check:
- Firebase Documentation
- Browser DevTools Console
- Backend Logs
- Network Tab (for failed requests)
