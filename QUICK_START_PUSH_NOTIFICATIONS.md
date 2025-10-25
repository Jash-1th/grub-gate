# 🚀 Quick Start: Push Notifications

## ⚡ Get Push Notifications Working in 5 Minutes

### Step 1: Generate VAPID Keys (30 seconds)

```bash
cd grub-gate
node generate-vapid-keys.js
```

Copy the **PUBLIC KEY** and **PRIVATE KEY** from the output.

---

### Step 2: Configure Backend (1 minute)

Edit `backend/.env` and add:

```env
VAPID_PUBLIC_KEY=paste_public_key_here
VAPID_PRIVATE_KEY=paste_private_key_here
VAPID_SUBJECT=mailto:admin@grubgate.com
```

Restart backend:
```bash
cd backend
npm run dev
```

---

### Step 3: Configure Customer App (1 minute)

Edit `apps/customer-app/.env` and add:

```env
VITE_VAPID_PUBLIC_KEY=paste_public_key_here
```

Rebuild app:
```bash
cd apps/customer-app
npm run build
npm run dev
```

---

### Step 4: Configure Partner Portal (1 minute)

Edit `apps/partner-portal/.env` and add:

```env
VITE_VAPID_PUBLIC_KEY=paste_public_key_here
```

Rebuild app:
```bash
cd apps/partner-portal
npm run build
npm run dev
```

---

### Step 5: Test It! (2 minutes)

#### A. Subscribe to Notifications (Customer App)

1. Open customer app: `http://localhost:3000`
2. Grant notification permission when prompted
3. Check browser console for: `✅ Subscription saved to server`

#### B. Trigger Notification (Partner Portal)

1. Open partner portal: `http://localhost:5173`
2. Log in as a partner
3. Go to **Orders** page
4. Find an order and change its status
5. Click **Update Status**

#### C. Verify Notification

Customer should receive a push notification instantly! 🎉

---

## 🧪 Quick Test

Run the automated test:

```bash
cd backend
node test-push-notification.js
```

You should see:
```
✅ Test notification sent successfully!
✅ Order notification sent successfully!
🎉 All tests completed!
```

---

## ✅ Success Checklist

- [ ] VAPID keys generated
- [ ] Backend `.env` updated with keys
- [ ] Customer app `.env` updated
- [ ] Partner portal `.env` updated
- [ ] Backend restarted
- [ ] Both apps rebuilt
- [ ] Notification permission granted in browser
- [ ] Test notification received
- [ ] Order status change triggers notification

---

## 🎯 What You Just Created

✨ **Real-time order notifications** - Customers get instant updates  
✨ **Multi-device support** - Works on all devices  
✨ **Background notifications** - Works even when app is closed  
✨ **Click actions** - Notifications link to order details  
✨ **Smart templates** - Different messages for each status  

---

## 📚 Need More Details?

- **Complete Setup Guide**: `PUSH_NOTIFICATIONS_SETUP.md`
- **Implementation Details**: `PUSH_NOTIFICATIONS_IMPLEMENTATION.md`
- **Test Script**: `backend/test-push-notification.js`

---

## 🐛 Issues?

**Notifications not working?**
1. Check browser console for errors
2. Verify VAPID keys match in all `.env` files
3. Make sure notification permission is granted
4. Check backend logs for errors
5. Run `node test-push-notification.js`

**Need help?**
- Check the troubleshooting section in `PUSH_NOTIFICATIONS_SETUP.md`
- Review backend console logs
- Check MongoDB for saved FCM tokens: `db.users.findOne({ email: "test@example.com" }, { fcmTokens: 1 })`

---

## 🎉 You're Done!

Your push notifications are now **fully configured and working**!

Every time a partner updates an order status, the customer will automatically receive a notification. 

**Enjoy! 🚀**
