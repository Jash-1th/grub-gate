# GrubGate Backend API

A comprehensive Node.js/Express.js backend API for the GrubGate food delivery platform with MongoDB integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Restaurant Management**: Complete restaurant and menu item management
- **Order Processing**: Order creation, tracking, and status management
- **Weekly Meal Planning**: Subscription-based meal planning system
- **Review System**: Customer reviews and ratings
- **Analytics**: Comprehensive analytics for restaurants and admin
- **File Upload**: Image upload support for restaurants and menu items
- **Search**: Advanced search functionality for restaurants and menu items
- **Notifications**: Email notifications and contact form handling

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grub-gate/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/grubgate

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d

   # Email (Optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@grubgate.com

   # Stripe (Optional)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

   # CORS
   CORS_ORIGIN=http://localhost:3000,http://localhost:3001
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📁 Project Structure

```
src/
├── config/           # Database and configuration files
├── controllers/      # Request handlers and business logic
├── middlewares/      # Authentication, validation, and error handling
├── models/          # Mongoose schemas and models
├── routes/          # API route definitions
├── services/        # Business services (email, notifications)
├── utils/           # Utility functions and helpers
└── server.js        # Application entry point
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Customer**: Can place orders, manage meal plans, write reviews
- **Partner**: Can manage restaurants, menu items, view analytics
- **Admin**: Full system access, user management, analytics

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token

#### Users
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile
- `GET /users/addresses` - Get user addresses
- `POST /users/addresses` - Add new address

#### Restaurants
- `GET /restaurants` - Get all restaurants (with filters)
- `GET /restaurants/:id` - Get restaurant details
- `POST /restaurants` - Create restaurant (Partner)
- `PATCH /restaurants/:id` - Update restaurant (Partner)
- `GET /restaurants/:id/menu` - Get restaurant menu

#### Menu Items
- `GET /restaurants/:restaurantId/menu-items` - Get menu items
- `POST /restaurants/:restaurantId/menu-items` - Create menu item (Partner)
- `PATCH /restaurants/:restaurantId/menu-items/:id` - Update menu item (Partner)

#### Orders
- `GET /orders` - Get orders (filtered by user role)
- `POST /orders` - Create order (Customer)
- `PATCH /orders/:id/status` - Update order status (Partner)
- `GET /orders/:id/tracking` - Get order tracking (Customer)

#### Weekly Plans
- `GET /weekly-plans` - Get weekly plans
- `POST /weekly-plans` - Create weekly plan (Customer)
- `PATCH /weekly-plans/:id` - Update weekly plan (Customer)
- `POST /weekly-plans/:id/generate-orders` - Generate orders from plan

#### Reviews
- `GET /reviews` - Get reviews (with filters)
- `POST /reviews` - Create review (Customer)
- `GET /restaurants/:restaurantId/reviews` - Get restaurant reviews

#### Analytics
- `GET /analytics/dashboard` - Get dashboard analytics (Partner/Admin)
- `GET /analytics/restaurant/:restaurantId` - Get restaurant analytics (Partner)
- `GET /analytics/orders` - Get order analytics (Partner/Admin)

### Query Parameters

Most GET endpoints support pagination and filtering:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Field to sort by
- `sortOrder` - Sort direction (asc/desc)

Example:
```
GET /restaurants?page=1&limit=10&cuisine=Italian&rating=4.5&sortBy=rating&sortOrder=desc
```

## 🔍 Search API

### Restaurant Search
```
GET /search/restaurants?q=pizza&cuisine=Italian&location=Montreal
```

### Menu Item Search
```
GET /search/menu-items?q=burger&category=main&dietary=vegetarian
```

### Global Search
```
GET /search/global?q=sushi&type=all&limit=10
```

## 📊 Data Models

### Key Models
- **User**: Customer/Partner/Admin accounts
- **Restaurant**: Restaurant profiles and settings
- **MenuItem**: Menu items with availability and pricing
- **Order**: Individual orders with items and delivery info
- **WeeklyPlan**: Subscription-based meal planning
- **Review**: Customer reviews and ratings
- **ContactMessage**: Customer support messages

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Different permissions for different user types
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Cross-origin request handling
- **Helmet**: Security headers for Express apps

## 🚨 Error Handling

The API returns standardized error responses:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "errors": [] // Optional validation errors
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📧 Email Integration

The system supports email notifications for:
- Account verification
- Password reset
- Order confirmations
- Order status updates
- Weekly plan reminders
- Contact form responses

Configure email settings in your `.env` file to enable email functionality.

## 🔧 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when implemented)

### Code Style
- Use ES6+ features
- Follow RESTful API conventions
- Implement proper error handling
- Add JSDoc comments for functions
- Use async/await for asynchronous operations

## 🚀 Deployment

### Environment Variables for Production
Ensure all required environment variables are set:
- `NODE_ENV=production`
- `MONGO_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong, unique secret key
- Email and payment gateway credentials (if using)

### Health Check
The API includes a health check endpoint:
```
GET /health
```

Returns server status and environment information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**GrubGate Backend API** - Built with ❤️ using Node.js, Express.js, and MongoDB
