# 🤖 AI AGENT COMPLETION PROMPT - IRAC PROJECT

## 📋 **PROJECT CONTEXT & CURRENT STATE**

You are an expert full-stack developer tasked with completing the **IRAC Website Project** - an advanced architectural education platform. The project is **58% complete** with excellent frontend implementation but missing critical backend business logic.

### **Technology Stack**:
- **Backend**: Deno + Lesan Framework + MongoDB + Redis
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + next-intl
- **Architecture**: Microservices with RPC APIs, mobile-first design
- **Location**: `/home/serpico/Work/Projects/irac/`

### **What's Already Done** ✅:
- Complete frontend UI components (73 static pages generated)
- Database models and API endpoint structure  
- Authentication system and user management
- Payment integration (ZarinPal)
- Admin interface and basic CRUD operations
- Mobile-responsive design with Persian/English support
- Docker deployment configuration

### **What's Missing** ❌:
- Backend business logic for scoring, referrals, bookings
- Analytics data processing and reporting
- Digital download system
- Real-time features and notifications
- Comprehensive testing and error handling

---

## 🎯 **YOUR MISSION: COMPLETE REMAINING BACKEND BUSINESS LOGIC**

You must implement the missing backend functionality that connects existing frontend UIs to working business logic. Focus on **high-impact, revenue-generating features**.

---

## 📊 **PHASE 1: SCORING SYSTEM BACKEND (HIGHEST PRIORITY)**

### **Context**: 
Frontend scoring UI is complete (`user/scoring` page, `scoringApi.ts`) but entirely mock data. Users need real points for purchases, course completions, and activities.

### **Required Implementation**:

1. **Create Scoring Models** in `back/models/`:
```typescript
// scoring_transaction.ts
export interface ScoringTransaction {
  _id: ObjectId;
  user_id: ObjectId;
  points: number;
  action: 'purchase' | 'course_complete' | 'referral' | 'daily_login';
  description: string;
  metadata: Record<string, any>;
  created_at: Date;
}

// user_level.ts  
export interface UserLevel {
  user_id: ObjectId;
  current_points: number;
  total_lifetime_points: number;
  level: number;
  achievements: string[];
  updated_at: Date;
}
```

2. **Implement Scoring APIs** in `back/src/scoring/`:
```
- addPoints/mod.ts - Award points for actions
- getUserScore/mod.ts - Get current user score and level
- getLeaderboard/mod.ts - Top users by points
- getUserAchievements/mod.ts - User achievements
- calculateLevel/mod.ts - Level progression logic
```

3. **Business Rules to Implement**:
- **Course Purchase**: +50 points per course
- **Course Completion**: +100 points per course
- **Product Purchase**: +10 points per $10 spent  
- **Daily Login**: +5 points (max once per day)
- **Referral Success**: +200 points per successful referral
- **Level System**: Level = Math.floor(total_points / 500) + 1

4. **Integration Points**:
- Hook into existing `purchaseProduct` API
- Connect to course completion workflow
- Link to referral system (Phase 2)
- Update frontend `scoringApi.ts` to use real endpoints

### **Expected Outcome**: Users earn real points, see accurate levels, compete on leaderboards

---

## 🔗 **PHASE 2: REFERRAL SYSTEM BACKEND (HIGH PRIORITY)**

### **Context**: 
Complete referral UI exists (`user/referrals` page, `referralApi.ts`) but no backend logic. Critical for user acquisition and growth.

### **Required Implementation**:

1. **Create Referral Models** in `back/models/`:
```typescript
// referral.ts
export interface Referral {
  _id: ObjectId;
  referrer_id: ObjectId;
  referee_id?: ObjectId; // null until signup
  referral_code: string;
  status: 'pending' | 'completed' | 'rewarded';
  commission_earned: number;
  created_at: Date;
  completed_at?: Date;
}
```

2. **Implement Referral APIs** in `back/src/referral/`:
```
- generateReferralCode/mod.ts - Create unique codes
- applyReferralCode/mod.ts - Apply code during signup
- getReferralStats/mod.ts - User referral statistics  
- processReferralReward/mod.ts - Award commissions
- getReferralHistory/mod.ts - Referral transaction history
```

3. **Business Rules**:
- **Referral Code Format**: `ARCH-{USER_ID}-{RANDOM_4_DIGITS}`
- **Commission**: 20% of referred user's first purchase
- **Bonus Points**: +200 points for successful referral
- **Group Discount**: 10% discount when 3+ users use same code

4. **Integration Points**:
- Connect to user registration in `back/src/user/register/`
- Hook into purchase system for commission calculation
- Link to scoring system for bonus points
- Update frontend `referralApi.ts`

### **Expected Outcome**: Functional referral system with real tracking and rewards

---

## 📅 **PHASE 3: BOOKING SYSTEM BACKEND (BUSINESS CRITICAL)**

### **Context**: 
Workshop reservation UI exists (`workshops/[slug]/reserve`, `user/reservations`) but no backend. Core business functionality for coworking space.

### **Required Implementation**:

1. **Create Booking Models** in `back/models/`:
```typescript
// booking.ts
export interface Booking {
  _id: ObjectId;
  user_id: ObjectId;
  workshop_id: ObjectId;
  space_type: 'private_office' | 'shared_desk' | 'meeting_room';
  date: Date;
  start_time: string; // "09:00"
  end_time: string;   // "17:00"
  capacity_used: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  total_price: number;
  created_at: Date;
}

// space_availability.ts
export interface SpaceAvailability {
  date: Date;
  space_type: string;
  total_capacity: number;
  booked_capacity: number;
  available_slots: TimeSlot[];
}
```

2. **Implement Booking APIs** in `back/src/booking/`:
```
- checkAvailability/mod.ts - Real-time availability checking
- createBooking/mod.ts - Make reservation
- confirmBooking/mod.ts - Confirm after payment
- cancelBooking/mod.ts - Handle cancellations
- getUserBookings/mod.ts - User booking history
- getSpaceCalendar/mod.ts - Calendar view data
```

3. **Business Rules**:
- **Capacity Limits**: Private office (1), Shared desk (10), Meeting room (8)
- **Booking Hours**: 8:00 AM - 8:00 PM, Monday-Saturday
- **Pricing**: Private office ($50/day), Shared desk ($20/day), Meeting room ($30/hour)
- **Cancellation**: Free cancellation 24h before, 50% refund otherwise

4. **Integration Points**:
- Connect to payment system for booking fees
- Link to user authentication for booking ownership
- Hook into notification system for confirmations
- Update workshop pages with real availability

### **Expected Outcome**: Functional online reservation system with real-time availability

---

## 📈 **PHASE 4: ANALYTICS & REPORTING BACKEND (BUSINESS INTELLIGENCE)**

### **Context**: 
Complete admin dashboard UI exists (`admin/dashboard`, `admin/analytics`) but shows no real data. Critical for business management.

### **Required Implementation**:

1. **Create Analytics APIs** in `back/src/analytics/`:
```
- getRevenueReport/mod.ts - Financial reporting
- getUserStatistics/mod.ts - User behavior analytics
- getPopularProducts/mod.ts - Product performance
- getBookingAnalytics/mod.ts - Space utilization
- exportDataReport/mod.ts - Data export functionality
```

2. **Key Metrics to Track**:
- **Revenue**: Daily/weekly/monthly totals by source
- **Users**: New registrations, active users, retention rates  
- **Products**: Best-selling items, category performance
- **Bookings**: Space utilization, peak hours, revenue
- **Engagement**: Course completions, scoring activity

3. **Data Processing Logic**:
```typescript
// Example revenue calculation
const calculateMonthlyRevenue = async (year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const productRevenue = await getProductSales(startDate, endDate);
  const bookingRevenue = await getBookingRevenue(startDate, endDate);
  const courseRevenue = await getCourseRevenue(startDate, endDate);
  
  return {
    total: productRevenue + bookingRevenue + courseRevenue,
    breakdown: { products: productRevenue, bookings: bookingRevenue, courses: courseRevenue },
    growth: calculateGrowthRate(previousMonth)
  };
};
```

### **Expected Outcome**: Real-time business intelligence dashboard with actionable insights

---

## 📁 **PHASE 5: DIGITAL DOWNLOAD SYSTEM (E-COMMERCE COMPLETION)**

### **Context**: 
Product store exists but digital products can't be delivered. Critical for revenue from digital content sales.

### **Required Implementation**:

1. **File Delivery System** in `back/src/download/`:
```
- generateDownloadLink/mod.ts - Secure download URLs
- validateAccess/mod.ts - Verify purchase rights
- trackDownloads/mod.ts - Download analytics
- handleExpiredLinks/mod.ts - Link expiration logic
```

2. **Security Features**:
- **Time-limited URLs**: Expire after 24 hours
- **Access Control**: Verify user purchased the product
- **Download Limits**: Max 5 downloads per purchase
- **File Protection**: Secure file storage, no direct access

3. **Integration Points**:
- Connect to existing `purchaseProduct` API
- Link to user authentication for access control
- Hook into email system for delivery notifications
- Update product pages with download buttons

### **Expected Outcome**: Secure digital product delivery system

---

## 🔧 **TECHNICAL IMPLEMENTATION GUIDELINES**

### **Code Quality Standards**:
1. **Follow Existing Patterns**: Study existing APIs like `back/src/user/` for structure
2. **Error Handling**: Comprehensive try-catch blocks with meaningful errors
3. **Input Validation**: Validate all inputs using Lesan validation patterns
4. **Type Safety**: Full TypeScript implementation with proper interfaces
5. **Database Queries**: Efficient MongoDB queries with proper indexing
6. **Testing**: Add basic API endpoint tests

### **Lesan Framework Patterns**:
```typescript
// Example API structure to follow
export const exampleSetup = () => {
  setAct({
    schema: {
      details: {
        field1: string(),
        field2: number(),
      }
    },
    validator: (details) => {
      // Input validation
      return details;
    },
    fn: async ({ details }) => {
      // Business logic implementation
      const result = await performOperation(details);
      return { success: true, data: result };
    }
  });
};
```

### **Database Integration**:
- Use existing MongoDB connection patterns from `mod.ts`
- Follow model structure from `models/` directory
- Implement proper relationships using Lesan embedded patterns
- Add appropriate indexes for performance

### **API Response Format**:
```typescript
// Standard success response
{ success: true, data: { ... }, message: "Operation completed" }

// Standard error response  
{ success: false, error: "Error description", code: "ERROR_CODE" }
```

---

## 📋 **STEP-BY-STEP EXECUTION PLAN**

### **Day 1-3: Scoring System**
1. Create scoring models in `back/models/`
2. Implement 5 scoring APIs in `back/src/scoring/`
3. Integrate with existing purchase/course systems
4. Update frontend API connections
5. Test points earning and level progression

### **Day 4-6: Referral System** 
1. Create referral models and APIs
2. Implement referral code generation and tracking
3. Connect to user registration and purchase flows
4. Test end-to-end referral workflow

### **Day 7-10: Booking System**
1. Create booking and availability models
2. Implement booking APIs with calendar logic
3. Connect to payment system for booking fees
4. Test reservation workflow and availability checking

### **Day 11-13: Analytics System**
1. Implement analytics APIs for admin dashboard
2. Create data aggregation and reporting logic
3. Connect to real business data sources
4. Test dashboard functionality

### **Day 14-15: Digital Downloads**
1. Implement secure file delivery system
2. Connect to product purchase workflow
3. Test digital product delivery

### **Day 16-18: Integration & Testing**
1. End-to-end testing of all new features
2. Performance optimization and error handling
3. Documentation and code cleanup

---

## ⚡ **SUCCESS CRITERIA**

Your implementation is successful when:

1. **Scoring System**: Users earn real points, accurate levels, working leaderboards
2. **Referral System**: Functional referral codes, commission tracking, rewards
3. **Booking System**: Real-time availability, working reservations, payment integration
4. **Analytics**: Live business data in admin dashboard, accurate reporting
5. **Downloads**: Secure delivery of digital products after purchase
6. **Integration**: All frontend UIs connected to working backend logic
7. **Performance**: APIs respond in <200ms, error handling works
8. **Testing**: Core user workflows function end-to-end

---

## 🎯 **FINAL DELIVERABLES EXPECTED**

1. **Working Backend APIs** for all missing business logic
2. **Database Models** properly structured and indexed  
3. **Frontend Integration** - all mock data replaced with real APIs
4. **Basic Testing** - API endpoints tested and working
5. **Documentation** - Brief API documentation for each endpoint
6. **Error Handling** - Graceful error handling throughout
7. **Performance** - Optimized queries and efficient operations

**Timeline**: 15-18 days for complete implementation  
**Priority Order**: Scoring → Referrals → Bookings → Analytics → Downloads

**Remember**: You have excellent existing infrastructure. Focus on implementing the business logic that makes the beautiful UI functional. The project is much closer to completion than initially estimated - your work will bring it across the finish line.

**Start with Phase 1 (Scoring System) as it has the highest user engagement impact and connects to multiple other systems.**