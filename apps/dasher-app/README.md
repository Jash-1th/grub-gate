# GrubGate Dasher App

Delivery driver portal for GrubGate food delivery platform.

## Features

- **Authentication**: Secure login and registration for delivery drivers
- **Multi-step Registration**: Comprehensive onboarding process
- **Document Upload**: Driver's license, vehicle registration, insurance
- **Profile Management**: Update personal and vehicle information
- **Real-time Tracking**: GPS location tracking for deliveries
- **Earnings Dashboard**: Track deliveries and earnings

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5174`

### Build for Production

```bash
npm run build
npm run preview
```

## Registration Fields

### Step 1: Personal Information
- First Name, Last Name
- Email Address
- Phone Number
- Password

### Step 2: Vehicle Information
- Vehicle Type (bike, scooter, motorcycle, car)
- Make, Model, Year
- License Plate
- Color

### Step 3: License & Documents
- Driver's License Number & Expiry
- Profile Photo
- Driver's License (Front & Back)
- Vehicle Registration
- Insurance (Optional)

### Step 4: Service Area & Banking
- Service City & Radius
- Emergency Contact
- Banking Information (Optional)

## API Endpoints

- `POST /api/v1/dasher/auth/register` - Register new dasher
- `POST /api/v1/dasher/auth/login` - Login dasher
- `GET /api/v1/dasher/auth/me` - Get profile
- `PUT /api/v1/dasher/auth/profile` - Update profile
- `POST /api/v1/dasher/auth/toggle-availability` - Toggle availability

## Tech Stack

- React 18
- React Router v6
- Axios for API calls
- FontAwesome icons
- CSS3 with modern features

## Project Structure

```
src/
├── api/           # API service layer
├── contexts/      # React contexts (Auth)
├── pages/         # Page components
│   └── auth/      # Authentication pages
├── styles/        # CSS stylesheets
├── App.jsx        # Main app component
└── main.jsx       # Entry point
```

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## License

Proprietary - GrubGate
