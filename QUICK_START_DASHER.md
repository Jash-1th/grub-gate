# 🚀 Quick Start Guide - Dasher App

## Installation & Setup

### 1. Install Dependencies
```bash
# From the root directory
cd c:\gg\grub-gate
npm install
```

### 2. Setup Environment Variables

Create `.env` file in `apps/dasher-app/`:
```bash
cd apps/dasher-app
copy .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Start the Backend
```bash
# From backend directory
cd backend
npm start
```
Backend will run on: **http://localhost:5000**

### 4. Start the Dasher App
```bash
# From root directory
npm run dev:dasher
```
Dasher App will run on: **http://localhost:5174**

---

## 🎯 Testing the Application

### Test Registration Flow

1. **Navigate to**: http://localhost:5174/register

2. **Step 1 - Personal Information:**
   - First Name: John
   - Last Name: Doe
   - Email: john.dasher@example.com
   - Phone: +15551234567
   - Password: password123
   - Confirm Password: password123

3. **Step 2 - Vehicle Information:**
   - Vehicle Type: Car
   - Make: Honda
   - Model: Civic
   - Year: 2020
   - License Plate: ABC1234
   - Color: Black

4. **Step 3 - License & Documents:**
   - License Number: DL123456789
   - License Expiry: (select future date)
   - Upload: Profile Photo
   - Upload: Driver's License Front
   - Upload: Driver's License Back
   - Upload: Vehicle Registration

5. **Step 4 - Service Area:**
   - Service City: Toronto
   - Province: ON
   - Emergency Contact Name: Jane Doe
   - Emergency Contact Phone: +15559876543

6. **Submit** - You should see success message!

### Test Login Flow

1. **Navigate to**: http://localhost:5174/login

2. **Login with:**
   - Email/Phone: john.dasher@example.com
   - Password: password123

3. **Note**: If status is "pending", you'll see a message that your application is under review.

---

## 📁 Project Structure

```
grub-gate/
├── backend/
│   └── src/
│       ├── models/
│       │   ├── User.js (✅ Updated - added 'dasher' role)
│       │   ├── Dasher.js (✅ New)
│       │   └── Order.js (✅ Updated - added dasher fields)
│       ├── controllers/
│       │   └── dasher.auth.controller.js (✅ New)
│       └── routes/
│           └── dasher.auth.routes.js (✅ New)
│
└── apps/
    └── dasher-app/ (✅ New)
        ├── src/
        │   ├── api/
        │   │   └── authApi.js
        │   ├── contexts/
        │   │   └── AuthContext.jsx
        │   ├── pages/
        │   │   └── auth/
        │   │       ├── LoginPage.jsx
        │   │       └── RegisterPage.jsx
        │   └── styles/
        │       └── auth-pages.css
        └── package.json
```

---

## 🔑 API Endpoints

### Public Endpoints
```
POST /api/v1/dasher/auth/register  - Register new dasher
POST /api/v1/dasher/auth/login     - Login dasher
POST /api/v1/dasher/auth/refresh   - Refresh token
```

### Protected Endpoints (Requires Authentication)
```
GET  /api/v1/dasher/auth/me                    - Get profile
PUT  /api/v1/dasher/auth/profile               - Update profile
POST /api/v1/dasher/auth/toggle-availability   - Toggle online/offline
```

---

## 🧪 Test with Postman/cURL

### Register Dasher
```bash
curl -X POST http://localhost:5000/api/v1/dasher/auth/register \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john@example.com" \
  -F "phoneNumber=+15551234567" \
  -F "password=password123" \
  -F "vehicleType=car" \
  -F "licensePlate=ABC1234" \
  -F "licenseNumber=DL123456" \
  -F "licenseExpiry=2025-12-31" \
  -F "serviceCity=Toronto" \
  -F "emergencyContactName=Jane Doe" \
  -F "emergencyContactPhone=+15559876543" \
  -F "profilePhoto=@/path/to/photo.jpg" \
  -F "driversLicenseFront=@/path/to/license_front.jpg" \
  -F "driversLicenseBack=@/path/to/license_back.jpg" \
  -F "vehicleRegistration=@/path/to/registration.pdf"
```

### Login Dasher
```bash
curl -X POST http://localhost:5000/api/v1/dasher/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "password123"
  }'
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5174
netstat -ano | findstr :5174
taskkill /PID <PID> /F
```

### CORS Errors
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Verify `http://localhost:5174` is in allowed origins

### File Upload Issues
- Check Cloudinary credentials in backend `.env`
- Ensure multer middleware is configured
- Verify file size limits

### Database Connection
- Ensure MongoDB is running
- Check `MONGODB_URI` in backend `.env`
- Verify network connectivity

---

## 📊 Database Collections

After registration, check MongoDB:

### Users Collection
```javascript
{
  _id: ObjectId,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phoneNumber: "+15551234567",
  roles: ["dasher"],
  status: "active",
  // ... other fields
}
```

### Dashers Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref to User),
  vehicle: {
    type: "car",
    make: "Honda",
    model: "Civic",
    licensePlate: "ABC1234"
  },
  status: "pending",
  // ... other fields
}
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Dasher app running on port 5174
- [ ] MongoDB connected
- [ ] Can access login page
- [ ] Can access register page
- [ ] Registration form validates correctly
- [ ] File uploads work
- [ ] Login works with email
- [ ] Login works with phone
- [ ] JWT tokens stored in localStorage
- [ ] Protected routes require authentication

---

## 🎉 Success!

If everything works, you should be able to:
1. ✅ Register a new dasher with documents
2. ✅ Login with email or phone
3. ✅ See authentication state persist on refresh
4. ✅ Access protected endpoints with JWT token

---

## 📞 Support

For issues or questions:
1. Check `DASHER_IMPLEMENTATION_SUMMARY.md` for detailed documentation
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

Happy coding! 🚀
