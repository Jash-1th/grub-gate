# 🧪 Live Test Instructions - Partner Orders Integration

This guide will help you test the complete flow from customer meal planning to partner order management.

## 🎯 Test Scenario

**Customer**: Mamilla Jaswanth (2022cse.r234@svce.edu.in)  
**Restaurant**: ASS (owned by the same user acting as partner)  
**Flow**: Subscription meal plan → Order generation → Partner orders page

## 🚀 Quick Start

### 1. Run Complete Test Setup
```bash
cd backend
npm run test:live
```

This single command will:
- ✅ Add menu items to the restaurant
- ✅ Create subscription meal plan for the customer  
- ✅ Generate orders from the meal plan
- ✅ Verify all data is correctly set up

### 2. Login to Partner Portal
- **URL**: http://localhost:3001/dashboard/orders
- **Email**: 2022cse.r234@svce.edu.in
- **Password**: [Use existing password]
- **Role**: Partner (Restaurant Owner)

### 3. Expected Results
You should see:
- 📦 **Real orders** generated from subscription meal plans
- 👤 **Customer details**: Mamilla Jaswanth with phone and email
- 🍽️ **Meal types**: LUNCH and DINNER orders
- 📋 **Order items**: Chicken Biryani, Paneer Butter Masala, Dal Tadka
- 💰 **Pricing**: Proper subtotal, delivery fee, tax, and total
- 📱 **Mobile responsive** design
- ⚡ **Status updates**: Can change from pending → confirmed → preparing → ready

## 📋 Test Menu Items Added

| Item | Price | Category | Available |
|------|-------|----------|-----------|
| Chicken Biryani Special | ₹299 | Main Course | All days, L+D |
| Paneer Butter Masala | ₹249 | Main Course | All days, L+D |
| Dal Tadka Premium | ₹179 | Main Course | All days, L+D |

## 📅 Subscription Meal Plan Created

**Week Schedule**:
- **Monday**: Lunch (Chicken Biryani) + Dinner (Paneer Butter Masala)
- **Tuesday**: Lunch (Dal Tadka) + Dinner (Chicken Biryani)  
- **Wednesday**: Lunch (Paneer Butter Masala)

**Delivery Address**: 123 Test Street, Chennai 600001  
**Special Instructions**: Various notes for each meal

## 🔧 Manual Commands (if needed)

### Setup Test Data Only
```bash
npm run setup:test-data
```

### Generate Orders Only  
```bash
npm run test:orders
```

### Check Order Generation Status
```bash
# Via API
curl http://localhost:5000/api/v1/orders/generate/status
```

## 🧪 Testing Checklist

### ✅ Partner Orders Page
- [ ] Orders are displayed in table/card format
- [ ] Customer information shows correctly
- [ ] Order items and prices are accurate
- [ ] Meal type badges (LUNCH/DINNER) appear
- [ ] Order status can be updated
- [ ] Order details modal works
- [ ] Mobile responsive design works
- [ ] Loading states work properly
- [ ] Error handling works

### ✅ Order Management
- [ ] Can update status: pending → confirmed
- [ ] Can update status: confirmed → preparing  
- [ ] Can update status: preparing → ready
- [ ] Status updates reflect immediately
- [ ] Loading spinners show during updates
- [ ] Success/error messages appear

### ✅ Data Accuracy
- [ ] Customer name: "Mamilla Jaswanth"
- [ ] Customer email: "2022cse.r234@svce.edu.in"
- [ ] Restaurant: "ASS"
- [ ] Order type: "weekly-plan"
- [ ] Subscription order flag: true
- [ ] Delivery address populated
- [ ] Special instructions visible

## 🔍 Troubleshooting

### No Orders Showing?
```bash
# Check if orders were generated
npm run test:orders

# Check database directly
mongo
use grubgate
db.orders.find({type: "weekly-plan"}).pretty()
```

### API Errors?
- Ensure backend server is running on port 5000
- Check MongoDB connection
- Verify user has partner role
- Check browser console for errors

### Frontend Issues?
- Ensure partner portal is running on port 3001
- Check network requests in browser dev tools
- Verify API response format matches frontend expectations

## 📊 Expected API Response Format

```json
{
  "status": "success",
  "message": "Orders retrieved successfully",
  "data": [
    {
      "_id": "...",
      "orderNumber": "GG20241008001",
      "customerId": {
        "firstName": "Mamilla",
        "lastName": "Jaswanth", 
        "email": "2022cse.r234@svce.edu.in",
        "phone": "8125744390"
      },
      "restaurantId": {
        "name": "ASS"
      },
      "type": "weekly-plan",
      "mealType": "lunch",
      "isSubscriptionOrder": true,
      "items": [...],
      "total": 299,
      "status": "pending",
      "createdAt": "2024-10-08T..."
    }
  ]
}
```

## 🎉 Success Criteria

The test is successful when:
1. ✅ Partner can login and see orders page
2. ✅ Orders from subscription meal plans are visible
3. ✅ All order details are accurate and complete
4. ✅ Order status updates work properly
5. ✅ Mobile and desktop views work correctly
6. ✅ No console errors or API failures

---

**🚀 Ready to test? Run `npm run test:live` and open the partner portal!**
