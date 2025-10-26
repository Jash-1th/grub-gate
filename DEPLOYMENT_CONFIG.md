# 🚀 GrubGate Deployment Configuration

## 📍 Deployed URLs

- **Customer App**: https://gg0c1.netlify.app/
- **Partner Portal**: https://gg0b1.netlify.app/
- **Backend**: (Add your backend URL when deployed)

---

## ✅ Firebase Console Setup - COMPLETE THIS

### 1. Enable Cloud Messaging API ⚡

#### Step 1: Enable Cloud Messaging API (V1)
1. Go to: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=messagegg-39a44
2. Click **"Enable"** button
3. Wait for confirmation (takes a few seconds)

#### Step 2: Verify It's Enabled
1. Firebase Console → Settings → Cloud Messaging
2. You should see "Cloud Messaging API (V1): Enabled" ✅

---

### 2. Add Authorized Domains 🌐

1. **Firebase Console**: https://console.firebase.google.com/project/messagegg-39a44/settings/general
2. Scroll to **"Authorized domains"** section
3. Add these domains:

   - [ ] `gg0c1.netlify.app` (Customer App)
   - [ ] `gg0b1.netlify.app` (Partner Portal)
   - [ ] `localhost` (should already exist)

4. Click **"Add domain"** for each

---

## 🔧 Netlify Environment Variables Setup

### Customer App (https://gg0c1.netlify.app/)

**Netlify Dashboard** → Your Site → Site settings → Environment variables → Add variables

Add these **exactly as shown**:

```env
VITE_API_URL=https://your-backend-url.com/api/v1
VITE_FIREBASE_API_KEY=AIzaSyAMLs_SO_LBTWvPcKLyr7fO2tuw7xn2DbM
VITE_FIREBASE_AUTH_DOMAIN=messagegg-39a44.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=messagegg-39a44
VITE_FIREBASE_STORAGE_BUCKET=messagegg-39a44.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=357081663277
VITE_FIREBASE_APP_ID=1:357081663277:web:c787254ff6f8a76ad5b5a4
VITE_FIREBASE_MEASUREMENT_ID=G-H8SSXVS813
VITE_VAPID_PUBLIC_KEY=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElmN6pnm9OqGL3Ha-i_SAY15nd7Cyo7ia-k9WJ324u1gRVEIbhzz21BvmS6mZb8l_CAwzZocqZp1jmtAfUgIQUw
```

**Important**: Replace `https://your-backend-url.com/api/v1` with your actual backend URL when deployed.

---

### Partner Portal (https://gg0b1.netlify.app/)

**Netlify Dashboard** → Your Site → Site settings → Environment variables → Add variables

Add **the same variables as Customer App**:

```env
VITE_API_URL=https://your-backend-url.com/api/v1
VITE_FIREBASE_API_KEY=AIzaSyAMLs_SO_LBTWvPcKLyr7fO2tuw7xn2DbM
VITE_FIREBASE_AUTH_DOMAIN=messagegg-39a44.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=messagegg-39a44
VITE_FIREBASE_STORAGE_BUCKET=messagegg-39a44.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=357081663277
VITE_FIREBASE_APP_ID=1:357081663277:web:c787254ff6f8a76ad5b5a4
VITE_FIREBASE_MEASUREMENT_ID=G-H8SSXVS813
VITE_VAPID_PUBLIC_KEY=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElmN6pnm9OqGL3Ha-i_SAY15nd7Cyo7ia-k9WJ324u1gRVEIbhzz21BvmS6mZb8l_CAwzZocqZp1jmtAfUgIQUw
```

---

## 🖥️ Backend Deployment (When Ready)

### Environment Variables for Backend

Set these in your backend deployment platform (Netlify/Render/Railway):

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://jaswanth:1qazxsw2QAZXSW@cluster0.gthunlu.mongodb.net/grubgate?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET=aK!h/v#'KG,BH|nuT|.4qIvJ[qw+.
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=?vm[2&@7^S,p<$bXa`5`=D_iN{#(]%
JWT_REFRESH_EXPIRE=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=jaswanthmamilla@gmail.com
EMAIL_PASS=xavw bakr leto fsyk
EMAIL_FROM=noreply@grubgate.com

# CORS (IMPORTANT - includes your deployed URLs)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://gg0c1.netlify.app,https://gg0b1.netlify.app

# Firebase Admin SDK
FIREBASE_PROJECT_ID=messagegg-39a44
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@messagegg-39a44.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8GJ5JPjzFKqeE\nfffxVgUWp3elNWkx4MHwRp+0pXFY0A/JCPHmwpnJ4yTp2cfW61JbX0P5RqUwCFLJ\nHICJ2x6JVGZcQVuXin1KyxdSexkHfZaqFw51TLv4P+C//UzZcGXNgWy4qsRu3mW3\nojWrsQhdf2+MhbPYZP0R9jLLTjAzlYnfC+ZRoYCrwxcPVXwE01kPlbyEYiJBUZ0L\n2Bkc87Wve0s0srEzkOyVBoAKhfmlk0gO9X2vrke8pqnQe+++9f1dcONQe3oz+lab\nJaZ3bthZH9CI1aSC7M+jPqv+14Z5TKXe6FZqIHoutgiSWkQGZIApR1ppeT8qjIsl\nqtlqWNIRAgMBAAECggEAHAkeVKPsamXqbJbbBTNxVDhXXr5IhOjvdzkLlmEfdSGj\n7K7C4YaJZhxPVPTDMs9F6f0X1FiZiACBmFzBcurAUS9Nh3wtYve/J44AVqim6SUo\ntwbzPnwWu1CIFw2x7enxHpGnKxo256CJ8DZDAimDqe3z6jHGhd89kjcMSJ3JlPJ3\noTLlbyznpUco7mIaeRx6nCDYOwUujmAe1ddIPlT9+osp4niGa8zcLtyEcpp0xwxD\nWcv9pppKShxR1FfyfUFKAdJzK5TA+Q4U/wqLfXGXTZHXGccH5XMGWqrzgJVCuKyS\nnDIaVlsZpcmtiHMnWpx63hFrVRE4aYr4/8JePmtvnQKBgQD+45cdiwGvXdsMOGjC\n0S8ZPnCTMwst681mu22xX99QDibkQxSnku23rZDRPZq4Cnw5uqZVP/AtIbwJbp9X\nvmmpHEWNuh2lCWU/DdwYaeckltVsbYX80WJ/DSKsvR2X+lRahsV1kmLpE5JXear5\n1WNDFjpA8Jn2gEcp+SzGK4FqxQKBgQC86n/VcE7aywuKkQdd8toKZ1CDFohcHscb\ngvXCuJKICh23PwXrewJueCbc1kpmDbhP/zEegF9pu/sUaTtYItVL7/eHdYs3QkkW\n3gZJTgEuDtNOkVUgueVdQlYKvBMy8drw8QfqpuRBXdQf2GmwLvpmJYocd3msAqOA\nkGsFuLNu3QKBgQD2ubs3X60b4Y/9fkT5/57Fosk503kI1G4Y+Wiu/4ycY3aGEeDW\nbMUqvRmnUSiI6a1h/Cix8Jg+N59ayff36VtB1RoGnJfBfxzAMlxQTYLuygqBUGsY\nVF4xebeM2erhh/FLR5Wvvyl7T/SiNCWqfEH/WG6/GacPExDPsmEC2m4FuQKBgB/x\nImYrVBnoZO4r8WvwKO/DYjiX8bxps86yCO3AmX4I/9dA/7Y+GT4mcKO8U94Hidd0\n1ZBLslZFY4Gi/Va8pQXu8BJmTICuY39LURLJ7qcj+JR7PEKJS//FvJiaDkD55cQB\nbQ4+468ttzUfOVeByfLFfCGuDdOIqq6NPJs+DJC9AoGAN7y2v5W1H11TEBQ8fOhP\ny0wl8M51Zfu5Z+z+L8TelmzHad2fMrXLmPVkZJAyk4W37fSINtJo72MrPTufia1j\npnO90REXLgQwWM8s9G4a2sJ5UmDTKgVlfYEigNc2GDQCJ1Yyz9cijCMoyTSroP0h\niDyRlpOqpmeRWqGME7TrqFE=\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://messagegg-39a44-default-rtdb.firebaseio.com/

# VAPID Keys
VAPID_PUBLIC_KEY=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElmN6pnm9OqGL3Ha-i_SAY15nd7Cyo7ia-k9WJ324u1gRVEIbhzz21BvmS6mZb8l_CAwzZocqZp1jmtAfUgIQUw
VAPID_PRIVATE_KEY=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgAN5r4nEUdDZAQRRuZyfUG76LZf1mc1mfKVe9kyvCPaChRANCAASWY3qmeb06oYvcdr6L9IBjXmd3sLKjuJr6T1Ynfbi7WBFUQhuHPPbUG-ZLqZlvyX8IDDNmhypmnWOa0B9SAhBT
VAPID_SUBJECT=mailto:admin@grubgate.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=dfzzgzew9
CLOUDINARY_API_KEY=179417938392265
CLOUDINARY_API_SECRET=Gg56zSFS2dannjF2H_pG6ZUmKe0

# Mapbox
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiamFzaC0xdGgiLCJhIjoiY202ZXcwbWd1MTJkeTJpc2Y0NW55a3owMiJ9.7ulwBfnnUofFduNWr6u5rg
```

**IMPORTANT**: When deploying backend, update `VITE_API_URL` in both frontend apps to your backend URL.

---

## 📋 Deployment Checklist

### Before Deploying

- [x] ✅ Firebase Cloud Messaging API enabled
- [ ] ⚠️ Authorized domains added to Firebase (do this now)
- [x] ✅ Backend CORS updated with deployed URLs
- [ ] ⚠️ Environment variables set in Netlify (do this now)

### After Deploying

- [ ] Test on deployed customer app (https://gg0c1.netlify.app/)
- [ ] Test on deployed partner portal (https://gg0b1.netlify.app/)
- [ ] Verify service workers load (no 404 errors)
- [ ] Test push notification permission prompt
- [ ] Test notification delivery

---

## 🧪 Testing Deployed Apps

### 1. Check Service Worker
1. Open: https://gg0c1.netlify.app/
2. Press F12 → Application tab → Service Workers
3. Should see: **service-worker.js** (activated ✅)

### 2. Test Notification Permission
1. Log in to deployed app
2. Should see permission prompt
3. Grant permission
4. Check console for: `✅ FCM token generated`

### 3. Test Notification Delivery
1. Partner changes order status on https://gg0b1.netlify.app/
2. Customer should receive notification on https://gg0c1.netlify.app/

---

## 🔧 Troubleshooting

### Issue: Service Worker 404
**Solution**: Verify build includes service workers
```bash
cd apps/customer-app
npm run build
ls dist/ | grep service-worker
# Should show: service-worker.js, firebase-messaging-sw.js
```

### Issue: CORS Error
**Solution**: 
1. Verify backend has correct CORS_ORIGIN
2. Restart backend after changing environment variables

### Issue: No Notification Prompt
**Solution**:
1. Verify HTTPS (Netlify provides this automatically ✅)
2. Check browser console for errors
3. Verify Firebase authorized domains include your Netlify domains

---

## 📱 Mobile Testing

Once deployed:

### Android Chrome
1. Open https://gg0c1.netlify.app/ on mobile
2. Log in
3. Accept notification permission
4. Test delivery → Should work! ✅

### iOS
- iOS < 16.4: No support ❌
- iOS 16.4+: Limited support (PWA only)

---

## 🎯 Next Steps

1. **NOW**: Enable Cloud Messaging API in Firebase Console (Step 1)
2. **NOW**: Add authorized domains to Firebase (Step 2)
3. **NOW**: Set environment variables in Netlify (Step 3)
4. **THEN**: Redeploy both apps
5. **FINALLY**: Test on deployed URLs

---

## 🆘 Need Help?

If you encounter issues:
1. Check Firebase Console → Cloud Messaging → Should be enabled
2. Check Netlify Deploy Logs for build errors
3. Check browser console (F12) for errors
4. Verify environment variables are set correctly

---

*Last Updated: 2025-01-25*
*Deployed URLs configured and ready for testing!*
