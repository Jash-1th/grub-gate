# ⚡ Push Notifications - 5-Minute Deployment Checklist

## Pre-Flight Check ✈️

### 1. Install Dependencies (30 seconds)
```bash
cd apps/customer-app
npm install vite-plugin-static-copy --save-dev

cd ../partner-portal  
npm install vite-plugin-static-copy --save-dev
```

### 2. Configure Environment (2 minutes)

**Customer App** (`apps/customer-app/.env`):
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

**Partner Portal** (`apps/partner-portal/.env`):
```bash
cp .env.example .env
# Edit .env with your Firebase credentials  
```

**Backend** (`backend/.env`):
```env
# Add this line:
CORS_ORIGIN=https://your-customer-app.netlify.app,https://your-partner-portal.netlify.app
```

### 3. Verify Build (1 minute)
```bash
cd apps/customer-app
npm run build
# Check: dist/service-worker.js exists ✅
# Check: dist/firebase-messaging-sw.js exists ✅
```

### 4. Deploy (1 minute per app)

**Customer App**:
```bash
cd apps/customer-app
netlify deploy --prod
```

**Partner Portal**:
```bash
cd apps/partner-portal
netlify deploy --prod
```

**Backend** (if needed):
```bash
cd backend
# Deploy to your platform (Netlify/Render/Railway)
```

### 5. Test (1 minute)
1. Open deployed app on mobile (Android Chrome)
2. Log in
3. Grant permission ✅
4. Partner changes order status
5. Notification appears! 🎉

---

## Environment Variables Checklist

### Deployment Platform (Netlify/Vercel)

Set these for **Customer App** and **Partner Portal**:

- [ ] `VITE_API_URL` = `https://your-backend.com/api/v1`
- [ ] `VITE_FIREBASE_API_KEY` = (from Firebase Console)
- [ ] `VITE_FIREBASE_PROJECT_ID` = (from Firebase Console)
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = (from Firebase Console)
- [ ] `VITE_FIREBASE_APP_ID` = (from Firebase Console)
- [ ] `VITE_VAPID_PUBLIC_KEY` = (from Firebase Console → Cloud Messaging)

Set these for **Backend**:

- [ ] `CORS_ORIGIN` = `https://app1.com,https://app2.com`
- [ ] `VAPID_PUBLIC_KEY` = (same as frontend)
- [ ] `VAPID_PRIVATE_KEY` = (from generate-vapid-keys.js)
- [ ] `FIREBASE_PROJECT_ID` = (from Firebase Console)
- [ ] `FIREBASE_CLIENT_EMAIL` = (from service account)
- [ ] `FIREBASE_PRIVATE_KEY` = (from service account)

---

## Firebase Console Checklist

- [ ] Cloud Messaging API enabled
- [ ] Web Push certificates generated (VAPID keys)
- [ ] Authorized domains added:
  - [ ] `your-customer-app.netlify.app`
  - [ ] `your-partner-portal.netlify.app`

---

## Troubleshooting

### If notifications don't work:

1. **Check browser console** - Look for errors
2. **Check service worker** - DevTools → Application → Service Workers (should be "activated")
3. **Check permission** - Should be "granted"
4. **Check HTTPS** - Must use https:// (not http://)
5. **Check backend logs** - Look for CORS errors

### Quick Fixes:

| Issue | Fix |
|-------|-----|
| 404 on service worker | Rebuild: `npm run build` |
| VAPID key mismatch | Check `.env` has correct key |
| CORS error | Check backend `CORS_ORIGIN` |
| No prompt | Reset browser permissions |

---

## Success Indicators ✅

You'll know it's working when you see:

### In Browser Console:
```
✅ ServiceWorker registration successful
✅ FCM token generated: eF3x...
✅ Notification displayed successfully
```

### In DevTools → Application:
- Service Worker status: **activated** (green dot)
- Notification permission: **granted**

### Actual Notification:
- Appears on screen
- Has title, body, icon
- Clickable

---

## Done! 🎉

If all checks pass, your push notifications are live!

**Need more help?** See full guides:
- `PUSH_NOTIFICATIONS_DEPLOYMENT_GUIDE.md` - Complete guide
- `PUSH_NOTIFICATIONS_QUICK_FIX.md` - Quick reference
- `PUSH_NOTIFICATIONS_FIXES_SUMMARY.md` - What was fixed

---

*Time to deploy: ~5 minutes*  
*Difficulty: Easy* ⭐⭐☆☆☆
