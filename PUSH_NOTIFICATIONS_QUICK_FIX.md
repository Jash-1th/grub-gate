# 🔔 Push Notifications - Quick Fix Guide

## 4 Common Issues - SOLVED ✅

### 1️⃣ Service Worker 404 ❌ → ✅

**Error**: `Failed to register service worker: 404 Not Found`

**Fix**:
```bash
# Install plugin
cd apps/customer-app
npm install vite-plugin-static-copy --save-dev

cd apps/partner-portal  
npm install vite-plugin-static-copy --save-dev

# Rebuild
npm run build
```

**Verify**: Check `dist/` folder contains:
- `service-worker.js` ✅
- `firebase-messaging-sw.js` ✅

---

### 2️⃣ VAPID Key Mismatch ❌ → ✅

**Error**: `VAPID key mismatch` or `Invalid VAPID key`

**Fix**:

1. **Copy `.env.example` to `.env`**:
   ```bash
   cd apps/customer-app
   cp .env.example .env
   ```

2. **Fill in Firebase values**:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_PROJECT_ID=grubgate-xxx
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456...
   VITE_FIREBASE_APP_ID=1:123456...
   VITE_VAPID_PUBLIC_KEY=BNa7... (from Firebase Console)
   ```

3. **Get VAPID key from Firebase**:
   - Firebase Console → Settings → Cloud Messaging
   - Web Push certificates → Generate key pair
   - Copy **Public key**

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

---

### 3️⃣ CORS Errors ❌ → ✅

**Error**: `Access blocked by CORS`

**Fix**:

1. **Backend `.env`** (for deployment):
   ```env
   CORS_ORIGIN=https://your-customer-app.netlify.app,https://your-partner-portal.netlify.app
   ```

2. **Local development** (already works):
   - Customer: `http://localhost:3000` ✅
   - Partner: `http://localhost:5173` ✅

3. **Restart backend**:
   ```bash
   cd backend
   npm start
   ```

4. **Verify in logs**:
   ```
   🔧 CORS: Allowing origins: [...]
   ✅ CORS: Allowing origin: https://your-app.com
   ```

---

### 4️⃣ No Permission Prompt ❌ → ✅

**Problem**: User doesn't see notification permission request

**Causes & Fixes**:

#### A) Permission Already Denied
**Chrome**:
1. Click 🔒 lock icon in address bar
2. Notifications → **Reset**
3. Refresh page → Prompt appears ✅

**Android Chrome**:
1. Settings → Site Settings → Notifications
2. Find your site → **Reset**
3. Reopen app → Prompt appears ✅

#### B) Not Using HTTPS
**Error**: Notifications only work on HTTPS

**Fix**:
- Local: `http://localhost` ✅ (exception)
- Deployed: Must use `https://` ⚠️

#### C) Firebase Not Initialized
**Check console**:
```javascript
// Should see:
✅ ServiceWorker registration successful
✅ FCM token generated
```

**If not**, verify `.env` has correct Firebase config.

---

## ⚡ Quick Test Commands

### Test Service Worker
```javascript
// Browser console
navigator.serviceWorker.ready.then(() => 
  console.log('✅ Service worker active!')
);
```

### Test Notification Permission
```javascript
// Browser console
Notification.requestPermission().then(permission => 
  console.log('Permission:', permission)
);
```

### Test Notification Display
```javascript
// Browser console
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('Test', {
    body: 'If you see this, it works!',
    icon: '/icons/logo192.png'
  });
});
```

### Test Backend API
```bash
curl http://localhost:5000/api/v1/health
# Should return: {"status":"success"}
```

---

## 🎯 Deployment Quick Check

Before deploying, verify:

### Customer App
- [ ] `.env` file exists with correct values
- [ ] `npm run build` completes without errors
- [ ] `dist/service-worker.js` exists
- [ ] `dist/firebase-messaging-sw.js` exists

### Partner Portal
- [ ] `.env` file exists with correct values
- [ ] `npm run build` completes without errors  
- [ ] `dist/service-worker.js` exists
- [ ] `dist/firebase-messaging-sw-partner.js` exists

### Backend
- [ ] `CORS_ORIGIN` set to deployed URLs
- [ ] `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` set
- [ ] Firebase credentials configured

---

## 📱 Mobile Testing

### Android ✅
1. Open https://your-app.com on Chrome
2. Log in
3. Grant notification permission
4. **Works perfectly!** 🎉

### iOS ⚠️
1. iOS < 16.4: **No support**
2. iOS 16.4+: **Limited support**
   - Must add to Home Screen
   - Works only as PWA

**Recommendation**: 
- Use SMS/Email fallback for iOS
- Focus on Android for web push

---

## 🆘 Still Having Issues?

### 1. Check Browser Console (F12)
Look for error messages - they usually tell you exactly what's wrong.

### 2. Check Backend Logs
```bash
# Should see:
🔧 CORS: Allowing origins: [...]
✅ Web push notification sent successfully
```

### 3. Verify Firebase Console
- Cloud Messaging enabled? ✅
- Authorized domains added? ✅
- VAPID keys generated? ✅

### 4. Environment Variables
```bash
# Print to verify
echo $VITE_VAPID_PUBLIC_KEY
echo $VITE_API_URL
```

### 5. Full Documentation
See: `PUSH_NOTIFICATIONS_DEPLOYMENT_GUIDE.md` for complete guide

---

## ✅ Success Indicators

You know it's working when you see:

1. **Console Logs**:
   ```
   ✅ ServiceWorker registration successful
   ✅ FCM token generated: eF3x...
   ✅ Notification displayed successfully
   ```

2. **DevTools → Application → Service Workers**:
   - Status: **activated** (green)

3. **Actual Notification**:
   - Shows on screen ✅
   - Has title, body, icon ✅
   - Clickable ✅

---

## 🎉 All Working? Great!

Your push notifications are now ready for deployment! 🚀

For detailed deployment steps, see:
- **PUSH_NOTIFICATIONS_DEPLOYMENT_GUIDE.md** - Complete guide
- **QUICK_START_PUSH_NOTIFICATIONS.md** - Quick setup

Happy deploying! 🎊
