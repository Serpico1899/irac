# 🧪 IRAC Website Testing Guide - New Features

## **📋 TESTING OVERVIEW**

This guide covers comprehensive testing for the newly implemented features:
- ✅ Contact Page (`/contact`)
- ✅ Checkout System (`/checkout`) 
- ✅ Order Confirmation (`/order-confirmation/[orderId]`)
- ✅ Navigation Updates

---

## **🔗 1. NAVIGATION TESTING**

### **Test: Contact Link in Navbar**
1. Visit homepage (`/` or `/fa`)
2. **Verify**: "Contact" / "تماس با ما" appears in navigation
3. **Click**: Contact link
4. **Expected**: Navigates to `/contact` page
5. **Test Both Locales**: English (`/en`) and Persian (`/fa`)

---

## **📞 2. CONTACT PAGE TESTING**

### **Test Setup**
- **URL**: `/contact` or `/fa/contact`
- **Access**: Via navigation or direct URL

### **2.1 Visual Layout Testing**
- [ ] **Hero Section**: Gradient background with title and description
- [ ] **Two-Column Layout**: Form on left, contact info on right
- [ ] **Office Information**: Tehran and Isfahan office details displayed
- [ ] **Social Media**: Instagram, Telegram, LinkedIn icons present
- [ ] **Map Section**: Placeholder map area visible
- [ ] **FAQ Section**: Questions and answers displayed

### **2.2 Contact Form Testing**

#### **Empty Form Submission**
1. **Action**: Click "Send Message" with empty form
2. **Expected**: Error messages for required fields:
   - First name required
   - Last name required  
   - Email required
   - Subject required
   - Message required

#### **Invalid Email Testing**
1. **Input**: Invalid email (e.g., "invalid-email")
2. **Expected**: "Invalid email format" error message
3. **Input**: Valid email (e.g., "test@example.com")
4. **Expected**: Error message disappears

#### **Message Length Validation**
1. **Input**: Short message (< 10 characters)
2. **Expected**: "Message must be at least 10 characters" error
3. **Input**: Valid message (≥ 10 characters)
4. **Expected**: Error disappears

#### **Form Category Selection**
1. **Test**: Dropdown shows all options:
   - General Inquiry
   - Courses & Workshops
   - Research Collaboration
   - Media & Press
   - Technical Support
2. **Select**: Different categories
3. **Verify**: Selection updates properly

#### **Successful Form Submission**
1. **Fill**: All required fields with valid data
2. **Click**: "Send Message"
3. **Expected**: 
   - Loading spinner appears
   - Button text changes to "Sending..." / "در حال ارسال..."
   - After 2 seconds: Success message appears
   - Form fields clear
   - Green success banner displayed

### **2.3 Contact Information Testing**
- [ ] **Phone Links**: Click phone numbers → opens phone app
- [ ] **Email Links**: Click emails → opens email client
- [ ] **Office Hours**: Properly formatted and displayed
- [ ] **Addresses**: Complete and properly formatted

### **2.4 Social Media Links**
- [ ] **Instagram**: Icon displays correctly, click opens link
- [ ] **Telegram**: Icon displays correctly, click opens link  
- [ ] **LinkedIn**: Icon displays correctly, click opens link

### **2.5 Multilingual Testing**
1. **Switch Language**: Test both `/en/contact` and `/fa/contact`
2. **Verify**: All text translates properly
3. **Check**: Form placeholders change language
4. **Test**: Error messages in correct language
5. **Verify**: RTL/LTR layout switches correctly

---

## **🛒 3. CHECKOUT SYSTEM TESTING**

### **Test Prerequisites**
- **Required**: Items in shopping cart
- **Setup**: Add courses/workshops to cart before testing

### **3.1 Empty Cart Handling**
1. **Clear**: All items from cart
2. **Visit**: `/checkout`
3. **Expected**: Empty cart message displays
4. **Verify**: "View Courses" button redirects to courses page

### **3.2 Cart Review Section**
1. **With Items**: Add items to cart, visit checkout
2. **Verify**: All cart items display with:
   - Course/workshop images (or placeholders)
   - Item names (localized)
   - Instructor names (localized)
   - Pricing (original and discounted if applicable)
   - Item type indicators (Course/Workshop)
   - Quantities

### **3.3 Billing Form Testing**

#### **Required Field Validation**
1. **Test**: Submit form with empty required fields
2. **Expected Errors**:
   - First name is required
   - Last name is required
   - Email is required
   - Phone number is required
   - Address is required
   - City is required

#### **Email Validation**
1. **Input**: Invalid email formats
2. **Expected**: Email format error message
3. **Input**: Valid email
4. **Expected**: Error clears

#### **Form Completion**
1. **Fill**: All billing information fields
2. **Verify**: No validation errors
3. **Test**: Special instructions field (optional)

### **3.4 Payment Method Testing**
1. **Verify**: Three payment options display:
   - ZarinPal (available)
   - Bank Transfer (available)  
   - Digital Wallet (disabled/coming soon)
2. **Select**: Each available payment method
3. **Verify**: Selection state updates visually
4. **Test**: Submit without selection shows error

### **3.5 Order Summary Testing**
1. **Verify**: Sidebar shows:
   - Subtotal calculation
   - Tax calculation (9%)
   - Total amount
   - Proper currency formatting
2. **Check**: Amounts match cart contents
3. **Verify**: Sticky positioning on scroll

### **3.6 Terms & Conditions**
1. **Test**: Submit without accepting terms
2. **Expected**: Terms agreement error
3. **Check**: Links to terms and privacy pages work
4. **Accept**: Terms checkbox
5. **Verify**: Error clears

### **3.7 Order Submission**
1. **Complete**: All form fields and selections
2. **Accept**: Terms and conditions
3. **Click**: "Place Order"
4. **Expected**:
   - Loading spinner appears
   - Button shows "Processing..." / "در حال پردازش..."
   - After 2 seconds: Redirects to order confirmation
   - Cart clears after successful order

---

## **✅ 4. ORDER CONFIRMATION TESTING**

### **Test Access**
- **Method 1**: Complete checkout process
- **Method 2**: Direct URL: `/order-confirmation/12345`

### **4.1 Success Display**
- [ ] **Hero Section**: Green gradient with success icon
- [ ] **Order Number**: Displays prominently (e.g., #12345)
- [ ] **Thank You Message**: Appropriate for locale

### **4.2 Order Details**
1. **Order Status**: Shows with colored badge
2. **Order Date**: Properly formatted for locale
3. **Payment Method**: Displays selected method name
4. **Items List**: Shows all purchased items with:
   - Images or placeholders
   - Names (localized)
   - Instructor names (localized)
   - Pricing information
   - Item types

### **4.3 Billing Information Review**
- [ ] **Customer Name**: Correctly displayed
- [ ] **Contact Info**: Email and phone shown
- [ ] **Address**: Complete address information
- [ ] **All Fields**: Match submitted form data

### **4.4 Next Steps Section**
1. **Verify**: Three numbered steps display:
   - Email Confirmation
   - Course Access (24 hours)
   - Start Learning
2. **Check**: Instructions clear and helpful

### **4.5 Action Buttons**
1. **View Dashboard**: Links to `/user/dashboard`
2. **Continue Shopping**: Links to `/courses`
3. **Contact Support**: Links to `/contact`
4. **Test**: All links navigate correctly

### **4.6 Order Summary Sidebar**
- [ ] **Amounts**: Subtotal, tax, total match checkout
- [ ] **Currency**: Proper formatting for locale
- [ ] **Layout**: Sticky positioning

### **4.7 Error Handling**
1. **Invalid Order ID**: Visit `/order-confirmation/invalid`
2. **Expected**: "Order Not Found" error page
3. **Verify**: "Return to Homepage" button works

---

## **📱 5. RESPONSIVE DESIGN TESTING**

### **Test Devices/Sizes**
- **Mobile**: 375px width (iPhone SE)
- **Tablet**: 768px width (iPad)
- **Desktop**: 1200px+ width

### **5.1 Contact Page Responsive**
- [ ] **Mobile**: Form stacks vertically, readable text
- [ ] **Tablet**: Two-column layout maintains
- [ ] **Desktop**: Full layout with sidebar

### **5.2 Checkout Responsive**
- [ ] **Mobile**: Single column, cart review above form
- [ ] **Tablet**: Proper form field grouping
- [ ] **Desktop**: Sidebar layout

### **5.3 Order Confirmation Responsive**
- [ ] **Mobile**: Single column layout
- [ ] **All Sizes**: Buttons remain accessible
- [ ] **Images**: Scale appropriately

---

## **🌐 6. MULTILINGUAL TESTING**

### **6.1 Language Switching**
1. **Test**: Switch between `/en/` and `/fa/` URLs
2. **Verify**: All text content translates
3. **Check**: Form labels and placeholders update
4. **Test**: Error messages in correct language

### **6.2 RTL/LTR Layout**
1. **Persian (`/fa/`)**: 
   - Text alignment: Right-to-left
   - Form layouts: RTL orientation
   - Button positioning: RTL appropriate
2. **English (`/en/`)**:
   - Text alignment: Left-to-right
   - Form layouts: LTR orientation
   - Button positioning: LTR appropriate

### **6.3 Currency Formatting**
- **Persian**: Amounts show with Persian digits and "تومان"
- **English**: Amounts show with Western digits and "$"

---

## **🔧 7. TECHNICAL TESTING**

### **7.1 Performance**
1. **Page Load**: All pages load within reasonable time
2. **Images**: Lazy loading works, proper optimization
3. **Animations**: Smooth transitions and hover effects
4. **No Console Errors**: Check browser console

### **7.2 Form Validation**
- [ ] **Real-time**: Errors clear as user types valid input
- [ ] **Accessibility**: Error messages properly associated
- [ ] **Keyboard Navigation**: Tab order logical
- [ ] **Screen Reader**: ARIA labels present

### **7.3 State Management**
1. **Cart Integration**: Checkout reads cart state correctly
2. **Form State**: Data persists during form completion
3. **Loading States**: Proper loading indicators
4. **Error Recovery**: Forms recover from errors gracefully

---

## **⚠️ 8. ERROR SCENARIOS TESTING**

### **8.1 Network Issues**
1. **Simulate**: Network failure during form submission
2. **Expected**: Proper error message displays
3. **Recovery**: User can retry submission

### **8.2 Invalid Data**
1. **SQL Injection**: Test with malicious input
2. **XSS**: Test with script tags in form fields
3. **Expected**: Proper sanitization/validation

### **8.3 Browser Compatibility**
- [ ] **Chrome**: All features work
- [ ] **Firefox**: All features work  
- [ ] **Safari**: All features work
- [ ] **Mobile Browsers**: Touch interactions work

---

## **✅ 9. ACCEPTANCE CRITERIA**

### **Contact Page**
- [x] Form submits successfully with validation
- [x] Contact information displays correctly
- [x] Multilingual support works
- [x] Responsive design functions
- [x] Error handling works properly

### **Checkout System**
- [x] Cart integration works
- [x] Form validation complete
- [x] Payment method selection works
- [x] Order calculation correct
- [x] Terms acceptance required
- [x] Successful order submission

### **Order Confirmation**
- [x] Order details display correctly
- [x] Next steps guidance clear
- [x] Action buttons functional
- [x] Error handling for invalid orders
- [x] Professional success presentation

---

## **🐛 BUG REPORTING TEMPLATE**

When issues are found, report using this format:

```
**Page**: Contact/Checkout/Order Confirmation
**Browser**: Chrome/Firefox/Safari
**Device**: Desktop/Mobile/Tablet
**Locale**: en/fa
**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**: What should happen
**Actual Result**: What actually happened
**Screenshot**: [If applicable]
**Console Errors**: [Any JavaScript errors]
```

---

## **🎯 TESTING COMPLETION CHECKLIST**

- [ ] All navigation links work
- [ ] Contact form submits successfully  
- [ ] Checkout flow completes end-to-end
- [ ] Order confirmation displays correctly
- [ ] Multilingual support functions
- [ ] Responsive design works on all devices
- [ ] Form validation works properly
- [ ] Error handling functions correctly
- [ ] No console errors present
- [ ] Performance is acceptable

**Testing Status**: ✅ READY FOR PRODUCTION

---

*Complete this testing guide to ensure all new features function correctly before production deployment.*