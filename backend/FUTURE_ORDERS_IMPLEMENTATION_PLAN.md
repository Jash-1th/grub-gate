# 🚀 Future & Historical Orders Implementation Plan

## 🎯 **Goal**: Enable partners to see future scheduled orders and historical orders

---

## 📊 **Current State Analysis**

### **✅ What We Have:**
- Date picker in partner portal (can select any date)
- Sunday-based subscription system
- Order generation for current date
- Database indexes for date-based queries
- Subscription meal plans with scheduled meals

### **❌ What's Missing:**
- Future orders visibility (scheduled but not yet active)
- Historical orders beyond current test data
- Order status progression (scheduled → active → completed)

---

## 🛠️ **Implementation Strategy**

### **Option 1: Enhanced Order Generation (Recommended)**

**Concept**: Generate all subscription orders upfront with different statuses

**Order Status Flow:**
```
scheduled → active → preparing → ready → delivered → completed
```

**Implementation Steps:**

#### **1. Enhance Order Model**
```javascript
// Add new status values to Order schema
status: {
  type: String,
  enum: [
    'scheduled',    // Future orders (not yet active)
    'pending',      // Today's orders (active)
    'preparing',    // Kitchen is preparing
    'ready',        // Ready for pickup/delivery
    'delivered',    // Out for delivery
    'completed'     // Successfully delivered
  ],
  default: 'scheduled'
}

// Add scheduling fields
scheduledDate: {
  type: Date,
  required: true,
  index: true
},
activationDate: {
  type: Date,
  required: true,
  index: true
}
```

#### **2. Enhanced Order Generation Service**
```javascript
// Generate ALL subscription orders upfront
const generateSubscriptionOrders = async (subscriptionPlan) => {
  const orders = [];
  
  // Loop through all weeks in subscription
  for (const week of subscriptionPlan.weeks) {
    const weekStart = new Date(week.weekStartDate);
    
    // Generate orders for each day with meals
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const orderDate = new Date(weekStart);
      orderDate.setDate(weekStart.getDate() + dayIndex);
      
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayIndex];
      const dayMeals = week.meals[dayName];
      
      if (dayMeals) {
        // Generate lunch order
        if (dayMeals.lunch && dayMeals.lunch.length > 0) {
          orders.push(createScheduledOrder(subscriptionPlan, orderDate, 'lunch', dayMeals.lunch));
        }
        
        // Generate dinner order
        if (dayMeals.dinner && dayMeals.dinner.length > 0) {
          orders.push(createScheduledOrder(subscriptionPlan, orderDate, 'dinner', dayMeals.dinner));
        }
      }
    }
  }
  
  return orders;
};

const createScheduledOrder = (subscriptionPlan, orderDate, mealType, meals) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const orderDateOnly = new Date(orderDate);
  orderDateOnly.setHours(0, 0, 0, 0);
  
  // Determine initial status
  let status = 'scheduled';
  if (orderDateOnly.getTime() === today.getTime()) {
    status = 'pending'; // Today's orders are active
  } else if (orderDateOnly < today) {
    status = 'completed'; // Past orders are completed
  }
  
  return {
    // ... order details
    scheduledDate: orderDate,
    activationDate: orderDate,
    status: status,
    isScheduledOrder: true
  };
};
```

#### **3. Daily Status Update Service**
```javascript
// Run daily to activate scheduled orders
const activateScheduledOrders = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Activate orders scheduled for today
  await Order.updateMany(
    {
      status: 'scheduled',
      activationDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    {
      status: 'pending',
      updatedAt: new Date()
    }
  );
  
  console.log('✅ Activated scheduled orders for today');
};
```

#### **4. Enhanced Partner Portal API**
```javascript
// Enhanced orders endpoint
const getPartnerOrders = async (req, res) => {
  const { date, status, includeScheduled = 'true' } = req.query;
  const partnerId = req.user.id;
  
  // Build query
  let query = { restaurantId: { $in: partnerRestaurantIds } };
  
  if (date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.scheduledDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }
  
  if (status) {
    query.status = status;
  } else if (includeScheduled === 'true') {
    // Include all statuses by default
    query.status = { $in: ['scheduled', 'pending', 'preparing', 'ready', 'delivered', 'completed'] };
  }
  
  const orders = await Order.find(query)
    .populate('customerId', 'firstName lastName email')
    .sort({ scheduledDate: -1, createdAt: -1 });
  
  res.json({
    success: true,
    data: orders,
    meta: {
      total: orders.length,
      date: date || 'all',
      includeScheduled: includeScheduled === 'true'
    }
  });
};
```

#### **5. Enhanced Partner Portal UI**
```javascript
// Add status filtering and future/past toggle
const OrdersPage = () => {
  const [showScheduled, setShowScheduled] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  return (
    <div>
      {/* Enhanced Date Picker with Status Filters */}
      <div className="filters">
        <DatePicker 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          // No maxDate restriction - allow future dates
        />
        
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="scheduled">Scheduled (Future)</option>
          <option value="pending">Active (Today)</option>
          <option value="completed">Completed (Past)</option>
        </select>
        
        <label>
          <input 
            type="checkbox" 
            checked={showScheduled}
            onChange={(e) => setShowScheduled(e.target.checked)}
          />
          Show Future Orders
        </label>
      </div>
      
      {/* Orders Display with Status Indicators */}
      {orders.map(order => (
        <OrderCard 
          key={order._id}
          order={order}
          showStatusBadge={true}
        />
      ))}
    </div>
  );
};
```

---

## 🎯 **Alternative Options**

### **Option 2: Virtual Order Generation**
- Generate orders on-demand when partner selects future dates
- Lighter database footprint
- More complex query logic

### **Option 3: Hybrid Approach**
- Generate orders 1 week in advance
- Show virtual orders for further future dates
- Balance between performance and storage

---

## 📊 **Recommended Implementation: Option 1**

### **Why Option 1 is Best:**
- ✅ **Simple Queries**: Easy date-based filtering
- ✅ **Consistent Data**: All orders exist in database
- ✅ **Performance**: Indexed queries are fast
- ✅ **Partner UX**: Clear status progression
- ✅ **Reporting**: Easy analytics and reporting

### **Implementation Priority:**
1. **Phase 1**: Enhance Order model with scheduling fields
2. **Phase 2**: Create enhanced order generation service
3. **Phase 3**: Add daily activation service
4. **Phase 4**: Update partner portal API
5. **Phase 5**: Enhance partner portal UI

---

## 🚀 **Expected Partner Experience**

### **Future Orders (Scheduled)**
```
Partner selects Oct 15, 2025:
- Shows: "2 Scheduled Orders for Oct 15"
- Status: "Scheduled" (gray badge)
- Details: Full meal information
- Actions: View details, modify (if allowed)
```

### **Current Orders (Active)**
```
Partner selects Oct 12, 2025 (when it arrives):
- Shows: "2 Active Orders for Oct 12"
- Status: "Pending" → "Preparing" → "Ready"
- Actions: Update status, view customer details
```

### **Past Orders (Historical)**
```
Partner selects Oct 5, 2025:
- Shows: "3 Completed Orders for Oct 5"
- Status: "Completed" (green badge)
- Actions: View details, reorder, analytics
```

---

## 📈 **Business Benefits**

- ✅ **Planning**: Partners can see upcoming workload
- ✅ **Preparation**: Advance notice for ingredient ordering
- ✅ **Analytics**: Historical data for business insights
- ✅ **Customer Service**: Better delivery time estimates
- ✅ **Inventory**: Better stock management

---

## 🛠️ **Next Steps**

1. **Approve Approach**: Confirm Option 1 is preferred
2. **Database Migration**: Add new fields to Order schema
3. **Service Enhancement**: Implement enhanced order generation
4. **API Updates**: Modify partner orders endpoint
5. **UI Enhancement**: Add status filters and future date support
6. **Testing**: Comprehensive testing with future/past dates

**This approach leverages your existing code structure while providing comprehensive future and historical order visibility!** 🎯
