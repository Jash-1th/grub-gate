# GrubGate API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "status": "success|error",
  "message": "Response message",
  "data": {}, // Only present on success
  "error": {} // Only present on error
}
```

## Endpoints

### Authentication Routes (`/auth`)

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "role": "customer", // customer, partner, admin
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/auth/logout`
Logout current user (requires authentication).

#### POST `/auth/forgot-password`
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST `/auth/reset-password/:token`
Reset password with token from email.

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

#### POST `/auth/refresh-token`
Refresh JWT token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### User Routes (`/users`)

#### GET `/users/profile`
Get current user profile (requires authentication).

#### PUT `/users/profile`
Update current user profile (requires authentication).

#### DELETE `/users/profile`
Delete current user account (requires authentication).

#### POST `/users/addresses`
Add new address to user profile (requires authentication).

#### PUT `/users/addresses/:addressId`
Update specific address (requires authentication).

#### DELETE `/users/addresses/:addressId`
Delete specific address (requires authentication).

### Restaurant Routes (`/restaurants`)

#### GET `/restaurants`
Get all restaurants with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `city`: Filter by city
- `cuisineType`: Filter by cuisine type
- `isActive`: Filter by active status
- `minRating`: Minimum rating filter

#### GET `/restaurants/:id`
Get restaurant details by ID.

#### POST `/restaurants`
Create new restaurant (requires partner/admin role).

#### PUT `/restaurants/:id`
Update restaurant (requires ownership or admin role).

#### DELETE `/restaurants/:id`
Delete restaurant (requires ownership or admin role).

#### GET `/restaurants/:id/menu`
Get restaurant's menu items.

#### GET `/restaurants/:id/reviews`
Get restaurant reviews.

### Menu Item Routes (`/menu-items`)

#### GET `/menu-items`
Get menu items with filtering.

#### GET `/menu-items/:id`
Get specific menu item.

#### POST `/menu-items`
Create new menu item (requires restaurant ownership).

#### PUT `/menu-items/:id`
Update menu item (requires ownership).

#### DELETE `/menu-items/:id`
Delete menu item (requires ownership).

### Order Routes (`/orders`)

#### GET `/orders`
Get user's orders (customers) or restaurant's orders (partners).

#### GET `/orders/:id`
Get specific order details.

#### POST `/orders`
Create new order (requires customer role).

#### PUT `/orders/:id/status`
Update order status (requires restaurant ownership or admin).

#### DELETE `/orders/:id`
Cancel order (specific conditions apply).

### Weekly Plan Routes (`/weekly-plans`)

#### GET `/weekly-plans`
Get user's weekly plans.

#### GET `/weekly-plans/:id`
Get specific weekly plan.

#### POST `/weekly-plans`
Create new weekly plan.

#### PUT `/weekly-plans/:id`
Update weekly plan.

#### DELETE `/weekly-plans/:id`
Delete weekly plan.

#### POST `/weekly-plans/:id/generate-orders`
Generate orders from weekly plan.

### Subscription Routes (`/subscriptions`)

#### GET `/subscriptions`
Get user's subscriptions.

#### GET `/subscriptions/:id`
Get specific subscription.

#### POST `/subscriptions`
Create new subscription.

#### PUT `/subscriptions/:id`
Update subscription.

#### DELETE `/subscriptions/:id`
Cancel subscription.

### Review Routes (`/reviews`)

#### GET `/reviews`
Get reviews with filtering.

#### GET `/reviews/:id`
Get specific review.

#### POST `/reviews`
Create new review (requires customer role).

#### PUT `/reviews/:id`
Update review (requires ownership).

#### DELETE `/reviews/:id`
Delete review (requires ownership or admin).

#### POST `/reviews/:id/helpful`
Mark review as helpful.

#### POST `/reviews/:id/report`
Report inappropriate review.

### Payment Routes (`/payments`)

#### POST `/payments/create-intent`
Create Stripe payment intent.

#### POST `/payments/confirm`
Confirm payment.

#### GET `/payments/history`
Get payment history.

#### POST `/payments/refund`
Process refund (admin only).

### Search Routes (`/search`)

#### GET `/search/restaurants`
Search restaurants by name, cuisine, location.

#### GET `/search/menu-items`
Search menu items by name, ingredients, category.

#### GET `/search/suggestions`
Get search suggestions.

### Upload Routes (`/upload`)

#### POST `/upload/image`
Upload single image file.

#### POST `/upload/images`
Upload multiple image files.

#### DELETE `/upload/:publicId`
Delete uploaded image.

### Analytics Routes (`/analytics`)

#### GET `/analytics/dashboard`
Get dashboard analytics (admin/partner only).

#### GET `/analytics/orders`
Get order analytics.

#### GET `/analytics/revenue`
Get revenue analytics.

#### GET `/analytics/customers`
Get customer analytics.

### Contact Routes (`/contact`)

#### POST `/contact`
Submit contact form.

#### GET `/contact`
Get contact submissions (admin only).

#### PUT `/contact/:id`
Update contact submission status (admin only).

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

## File Upload

- Maximum file size: 5MB
- Supported formats: JPEG, PNG, WebP
- Files are uploaded to Cloudinary (or configured storage provider)

## Pagination

List endpoints support pagination:
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```
