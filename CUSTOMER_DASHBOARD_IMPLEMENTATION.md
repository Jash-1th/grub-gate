# Restaurant-Specific Customer Dashboard Implementation

## Overview

This implementation provides a complete restaurant-specific customer analytics dashboard that shows customers who have ordered from a specific restaurant, along with their order history and spending analytics.

## Key Features

### ✅ **Restaurant-Specific Analytics**
- Customer data is filtered by restaurant
- `totalOrders` and `totalSpent` are calculated per restaurant
- Each restaurant partner sees only their customers

### ✅ **SSR-Safe Frontend**
- Proper client-side rendering checks
- Loading states for hydration safety
- Error handling and retry functionality

### ✅ **Real-Time Data**
- MongoDB aggregation for live analytics
- No cached data dependencies
- Accurate customer metrics

### ✅ **Responsive Design**
- Desktop table view with detailed information
- Mobile card view for smaller screens
- Modern UI with Tailwind CSS

## Backend Implementation

### API Endpoints

```javascript
// Get customers for a specific restaurant
GET /api/v1/admin/restaurants/:restaurantId/customers
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Search by name or email
- status: Filter by customer status

// Get detailed customer analytics
GET /api/v1/admin/restaurants/:restaurantId/customers/:customerId

// Get all customers (admin only)
GET /api/v1/admin/customers
```

### Database Schema Used

**User Model Fields:**
- `firstName`, `lastName` - Customer name
- `email`, `phoneNumber` - Contact information
- `status` - Account status (active/inactive/suspended)
- `createdAt` - Registration date
- `roles` - User roles array

**Order Model Fields:**
- `customerId` - Reference to User
- `restaurantId` - Reference to Restaurant
- `total` - Order total amount
- `paymentStatus` - Payment status
- `createdAt` - Order date

### Analytics Calculation

The system uses MongoDB aggregation to calculate:

```javascript
// Real-time aggregation
{
  totalOrders: { $size: '$restaurantOrders' },
  totalSpent: { $sum: '$restaurantOrders.total' },
  averageOrderValue: { $avg: '$restaurantOrders.total' },
  lastOrderDate: { $max: '$restaurantOrders.createdAt' },
  firstOrderDate: { $min: '$restaurantOrders.createdAt' }
}
```

## Frontend Implementation

### SSR Safety Features

```javascript
// Client-side rendering check
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

// SSR loading state
if (!isClient) {
  return <LoadingSpinner />;
}
```

### Key Components

1. **Header with Restaurant Name**
   - Dynamic restaurant name display
   - Customer count indicator
   - Loading states

2. **Summary Cards**
   - Total customers
   - Total revenue
   - Total orders
   - Average customer value

3. **Search and Filtering**
   - Real-time search by name/email
   - Debounced API calls
   - Loading indicators

4. **Customer Table (Desktop)**
   - Customer information
   - Contact details
   - Restaurant-specific metrics
   - Status indicators

5. **Customer Cards (Mobile)**
   - Responsive card layout
   - Essential information display
   - Touch-friendly interface

6. **Pagination**
   - Server-side pagination
   - Navigation controls
   - Page indicators

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── admin.controller.js          # Customer analytics endpoints
│   ├── routes/
│   │   └── admin.routes.js              # Admin routes
│   └── models/
│       ├── User.js                      # Existing user model
│       └── Order.js                     # Existing order model
└── scripts/
    └── test-customer-analytics.js       # Testing script

frontend/
├── src/
│   ├── pages/dashboard/
│   │   └── CustomersPage.jsx            # Enhanced customer dashboard
│   └── utils/
│       └── ssrSafeStorage.js            # SSR-safe utilities
```

## Usage

### For Restaurant Partners

1. **Login** to the partner portal
2. **Navigate** to the customers page
3. **View** customers who have ordered from your restaurant
4. **Search** and filter customers
5. **Analyze** customer spending patterns

### For Admins

1. **Access** all customer data across restaurants
2. **View** restaurant-specific customer analytics
3. **Monitor** customer engagement metrics

## Testing

Run the test script to verify the implementation:

```bash
cd backend
node scripts/test-customer-analytics.js
```

This will:
- Test database connectivity
- Verify aggregation queries
- Display sample customer analytics
- Show summary statistics

## Security Features

- **Authentication** required for all endpoints
- **Authorization** checks (admin/partner roles)
- **Restaurant filtering** ensures partners see only their data
- **Input validation** and sanitization
- **Error handling** with appropriate status codes

## Performance Considerations

- **MongoDB indexes** on key fields:
  - `orders.customerId`
  - `orders.restaurantId`
  - `orders.paymentStatus`
  - `users.roles`

- **Pagination** to handle large datasets
- **Efficient aggregation** queries
- **Client-side debouncing** for search

## Future Enhancements

1. **Export functionality** (CSV/PDF)
2. **Advanced filtering** (date ranges, order amounts)
3. **Customer communication** tools
4. **Loyalty program** integration
5. **Customer segmentation** features

## API Response Examples

### Customer List Response

```json
{
  "status": "success",
  "data": {
    "restaurant": {
      "id": "64f1234567890abcdef12345",
      "name": "Chez Laurent Premium"
    },
    "customers": [
      {
        "_id": "64f1234567890abcdef12346",
        "fullName": "John Doe",
        "email": "john.doe@email.com",
        "phoneNumber": "+1234567890",
        "status": "active",
        "totalOrders": 5,
        "totalSpent": 234.50,
        "averageOrderValue": 46.90,
        "lastOrderDate": "2024-01-15T18:30:00Z",
        "createdAt": "2023-08-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "totalCustomers": 25,
      "totalRevenue": 5847.50,
      "totalOrders": 125,
      "averageCustomerValue": 233.90
    }
  }
}
```

## Conclusion

This implementation provides a complete, production-ready customer dashboard that:

- ✅ Uses existing User and Order schemas
- ✅ Provides restaurant-specific analytics
- ✅ Is SSR-safe and responsive
- ✅ Includes proper authentication and authorization
- ✅ Offers real-time data with efficient queries
- ✅ Supports search, filtering, and pagination

The system is ready for deployment and can handle the future enhancement of Pro users selecting multiple restaurants.
