# 🔔 Push Notifications User Flow

## When Notification Permission Prompts Appear

### ✅ **Customer App**

The notification permission prompt will appear **1.5 seconds AFTER**:

1. **User Logs In** ✅
   - User enters credentials
   - Clicks "Sign In"
   - Login succeeds
   - **→ Permission prompt appears**

2. **User Registers** ✅ (with auto-login)
   - User fills registration form
   - Submits registration
   - Account created + auto-logged in
   - **→ Permission prompt appears**

---

## 📱 **What the User Will See**

### Desktop/Laptop (Chrome, Edge, Firefox)
```
┌─────────────────────────────────────────────┐
│  gg0c1.netlify.app wants to                 │
│                                             │
│  🔔 Show notifications                      │
│                                             │
│  [Block]  [Allow]                           │
└─────────────────────────────────────────────┘
```

### Mobile (Android Chrome)
```
┌─────────────────────────────────────────────┐
│  Allow gg0c1.netlify.app to send you        │
│  notifications?                             │
│                                             │
│  [Don't allow]  [Allow]                     │
└─────────────────────────────────────────────┘
```

---

## 🎯 **User Flow Diagram**

```
User visits gg0c1.netlify.app
        ↓
User clicks "Login" or "Sign Up"
        ↓
Enters credentials / registration info
        ↓
Submits form
        ↓
Backend validates ✅
        ↓
Auth state updated
        ↓
[1.5 second delay]
        ↓
🔔 NOTIFICATION PERMISSION PROMPT APPEARS
        ↓
User clicks "Allow" or "Block"
        ↓
If "Allow":
  ├─ Subscribe to push notifications
  ├─ Save subscription to backend
  └─ Ready to receive notifications! ✅
        
If "Block":
  └─ User won't receive notifications
     (Can enable later in browser settings)
```

---

## ⚙️ **Technical Flow**

### 1. **Login Successful**
```javascript
// AuthContext.jsx - After login
setTimeout(async () => {
  const permission = getNotificationPermissionStatus();
  
  if (permission === 'default') {
    // Show permission prompt
    await requestNotificationPermission();
  }
}, 1500);
```

### 2. **Permission Granted**
```javascript
// pwa.js
1. Request permission from browser
2. Get VAPID public key from env
3. Subscribe to push notifications
4. Save subscription to backend at:
   POST /api/v1/push-notifications/subscribe
5. Done! ✅
```

### 3. **Backend Saves Token**
```javascript
// Backend stores:
{
  userId: "user123",
  token: "subscription-endpoint",
  deviceType: "web",
  deviceInfo: { browser, platform },
  subscription: { endpoint, keys }
}
```

---

## 🔧 **Notification Permission States**

| State | Meaning | What Happens |
|-------|---------|--------------|
| `default` | Not asked yet | Prompt will appear after login ✅ |
| `granted` | User allowed | Notifications enabled, subscription synced |
| `denied` | User blocked | No notifications (must enable in browser settings) |

---

## 🧪 **Testing the Flow**

### Test on Deployed App

1. **Open**: https://gg0c1.netlify.app/
2. **Clear browser data** (to reset permission):
   - Chrome: Settings → Privacy → Clear browsing data → Check "Cookies and site data"
   - Or use Incognito/Private window
3. **Click "Login"** or **"Sign Up"**
4. **Enter credentials** and submit
5. **Wait 1.5 seconds** after login succeeds
6. **🔔 Permission prompt should appear!**
7. **Click "Allow"**
8. **Check console** (F12) for:
   ```
   ✅ Notification permission granted
   ✅ Subscription saved to server
   ```

---

## 🚨 **Troubleshooting**

### Permission Prompt Not Appearing?

**Check these:**

1. ✅ **HTTPS Required**
   - https://gg0c1.netlify.app/ ✅ (Netlify provides HTTPS)
   - http:// won't work ❌

2. ✅ **Browser Support**
   - Chrome ✅
   - Firefox ✅
   - Edge ✅
   - Safari (iOS 16.4+) ⚠️ Limited
   - Safari (Desktop) ⚠️ Limited

3. ✅ **Not in Incognito** (some browsers block in incognito)

4. ✅ **Environment Variables Set in Netlify**
   - `VITE_VAPID_PUBLIC_KEY` must be set
   - All Firebase variables must be set

5. ✅ **Check Console** (F12)
   - Look for errors
   - Should see: "🔔 Requesting notification permission..."

---

## 📊 **Expected Console Output**

After login, you should see:

```
✅ AuthContext: Login successful, user: {...}
✅ AuthContext: Token stored: ***
🔔 Current notification permission: default
🔔 Requesting notification permission...
✓ Browser supports service workers, push messaging, and notifications
Requesting notification permission...
✓ Notification permission granted
✓ Service worker is ready
✓ VAPID public key retrieved
✓ New push subscription created: {...}
📤 Attempting to save subscription to server...
✅ Subscription sent to server successfully: {...}
```

---

## ✅ **Deployment Checklist**

Before testing:

- [x] ✅ Code changes deployed to Netlify
- [ ] ⚠️ Environment variables set in Netlify (9 variables)
- [ ] ⚠️ Backend deployed and accessible
- [ ] ⚠️ `VITE_API_URL` updated to backend URL
- [x] ✅ Firebase Cloud Messaging API enabled
- [x] ✅ Service workers in public folder

---

## 🎉 **Success Criteria**

You'll know it's working when:

1. ✅ User logs in successfully
2. ✅ 1.5 seconds later, permission prompt appears
3. ✅ User clicks "Allow"
4. ✅ Console shows "Subscription saved to server"
5. ✅ Backend has FCM token in database
6. ✅ Partner can send notifications
7. ✅ Customer receives notifications! 🎊

---

## 📱 **Mobile Testing**

### Android Chrome
1. Open https://gg0c1.netlify.app/ on Android phone
2. Log in
3. Permission prompt appears → Tap "Allow"
4. Notifications work! ✅

### iOS (16.4+)
1. Open https://gg0c1.netlify.app/ in Safari
2. Add to Home Screen (required for notifications)
3. Open from Home Screen
4. Log in
5. Permission prompt appears
6. Limited support ⚠️

---

*Last Updated: 2025-01-25*
*Notification permission now triggers automatically after login/registration!*
