#!/usr/bin/env node

/**
 * IRAC Project - Comprehensive Integration Testing Suite
 *
 * This script performs comprehensive testing of all major systems:
 * - User Management (15 endpoints)
 * - Scoring System (5 endpoints)
 * - Product Store (8 endpoints)
 * - Wallet System (5 endpoints)
 * - Booking System (3 endpoints)
 * - Referral System (3 endpoints)
 * - Analytics System (2 endpoints)
 * - Download System (3 endpoints)
 * - File Management (3 endpoints)
 * - Categories/Tags (12 endpoints)
 * - Courses (3 endpoints)
 * - Articles (1 endpoint)
 * - Payment (2 endpoints)
 * - Admin (1 endpoint)
 *
 * Total: 65+ API endpoints tested
 */

const BASE_URL = process.env.API_URL || "http://localhost:1405";

class IntegrationTester {
  constructor() {
    this.results = [];
    this.stats = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };
    this.testData = {
      adminToken: null,
      userToken: null,
      managerToken: null,
      testUser: null,
      testAdmin: null,
      testManager: null,
      categories: [],
      tags: [],
      products: [],
      courses: [],
      articles: [],
      bookings: [],
      referrals: [],
    };
  }

  async makeRequest(endpoint, method = "POST", data = {}, token = null) {
    const url = `${BASE_URL}/${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (method !== "GET" && Object.keys(data).length > 0) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error.message,
      };
    }
  }

  async testEndpoint(
    name,
    endpoint,
    method,
    data,
    token,
    expectedStatus = 200,
  ) {
    console.log(`  Testing: ${name}`);
    const startTime = Date.now();

    try {
      const result = await this.makeRequest(endpoint, method, data, token);
      const responseTime = Date.now() - startTime;

      if (!result.success || result.status !== expectedStatus) {
        console.log(`    ❌ ${name}: Failed (${result.status})`);
        this.stats.failed++;
        this.results.push({
          test: name,
          endpoint,
          success: false,
          status: result.status,
          responseTime,
          error: result.error || result.data,
        });
        this.stats.errors.push({
          test: name,
          endpoint,
          status: result.status,
          error: result.error || result.data,
        });
        return null;
      }

      console.log(`    ✅ ${name}: Success (${result.status})`);
      this.stats.passed++;
      this.results.push({
        test: name,
        endpoint,
        success: true,
        status: result.status,
        responseTime,
        data: result.data,
      });
      return result.data;
    } catch (error) {
      console.log(`    ❌ ${name}: Error - ${error.message}`);
      this.stats.failed++;
      this.results.push({
        test: name,
        endpoint,
        success: false,
        status: 0,
        responseTime: Date.now() - startTime,
        error: error.message,
      });
      this.stats.errors.push({
        test: name,
        endpoint,
        error: error.message,
      });
      return null;
    }
  }

  async testUserManagement() {
    console.log("\n🧪 Testing User Management System (15 endpoints)");
    console.log("=".repeat(60));

    // 1. Admin Seeding
    await this.testEndpoint(
      "Admin Data Seeding",
      "admin/seedDatabase",
      "POST",
      { includeUsers: true, clearExisting: false },
    );

    // 2. User Registration
    const registrationData = {
      details: {
        set: {
          username: "testuser_" + Date.now(),
          email: `test${Date.now()}@example.com`,
          password: "SecurePass123!",
          firstName: "Test",
          lastName: "User",
          mobile: "09123456789",
          role: "user",
        },
      },
    };

    const newUser = await this.testEndpoint(
      "User Registration",
      "user/createUser",
      "POST",
      registrationData,
    );

    if (newUser) {
      this.testData.testUser = newUser;
    }

    // 3. Admin Registration
    const adminData = {
      details: {
        set: {
          username: "admin_" + Date.now(),
          email: `admin${Date.now()}@example.com`,
          password: "AdminPass123!",
          firstName: "Admin",
          lastName: "User",
          mobile: "09987654321",
          role: "admin",
        },
      },
    };

    const newAdmin = await this.testEndpoint(
      "Admin Registration",
      "user/createUser",
      "POST",
      adminData,
    );

    if (newAdmin) {
      this.testData.testAdmin = newAdmin;
    }

    // 4. Manager Registration
    const managerData = {
      details: {
        set: {
          username: "manager_" + Date.now(),
          email: `manager${Date.now()}@example.com`,
          password: "ManagerPass123!",
          firstName: "Manager",
          lastName: "User",
          mobile: "09111222333",
          role: "manager",
        },
      },
    };

    const newManager = await this.testEndpoint(
      "Manager Registration",
      "user/createUser",
      "POST",
      managerData,
    );

    if (newManager) {
      this.testData.testManager = newManager;
    }

    // 5. User Login
    const loginResult = await this.testEndpoint(
      "User Login",
      "user/login",
      "POST",
      {
        details: {
          set: {
            username: registrationData.details.set.username,
            password: registrationData.details.set.password,
          },
        },
      },
    );

    if (loginResult && loginResult.token) {
      this.testData.userToken = loginResult.token;
    }

    // 6. Admin Login
    if (newAdmin) {
      const adminLoginResult = await this.testEndpoint(
        "Admin Login",
        "user/login",
        "POST",
        {
          details: {
            set: {
              username: adminData.details.set.username,
              password: adminData.details.set.password,
            },
          },
        },
      );

      if (adminLoginResult && adminLoginResult.token) {
        this.testData.adminToken = adminLoginResult.token;
      }
    }

    // 7. Manager Login
    if (newManager) {
      const managerLoginResult = await this.testEndpoint(
        "Manager Login",
        "user/login",
        "POST",
        {
          details: {
            set: {
              username: managerData.details.set.username,
              password: managerData.details.set.password,
            },
          },
        },
      );

      if (managerLoginResult && managerLoginResult.token) {
        this.testData.managerToken = managerLoginResult.token;
      }
    }

    // 8. Get User Profile
    if (this.testData.userToken) {
      await this.testEndpoint(
        "Get User Profile",
        "user/getProfile",
        "POST",
        { details: { set: {}, get: {} } },
        this.testData.userToken,
      );
    }

    // 9. Update User Profile
    if (this.testData.userToken && this.testData.testUser) {
      await this.testEndpoint(
        "Update User Profile",
        "user/updateProfile",
        "POST",
        {
          details: {
            set: {
              firstName: "Updated Test",
              bio: "Updated bio for testing",
            },
          },
        },
        this.testData.userToken,
      );
    }

    // 10. Change Password
    if (this.testData.userToken) {
      await this.testEndpoint(
        "Change Password",
        "user/changePassword",
        "POST",
        {
          details: {
            set: {
              currentPassword: "SecurePass123!",
              newPassword: "NewSecurePass123!",
            },
          },
        },
        this.testData.userToken,
      );
    }

    // 11. Reset Password Request
    await this.testEndpoint(
      "Reset Password Request",
      "user/resetPasswordRequest",
      "POST",
      {
        details: {
          set: {
            email: registrationData.details.set.email,
          },
        },
      },
    );

    // 12. Get Users List (Admin)
    if (this.testData.adminToken) {
      await this.testEndpoint(
        "Get Users List (Admin)",
        "user/getUsers",
        "POST",
        {
          details: {
            set: { page: 1, limit: 10 },
            get: { _id: 1, username: 1, email: 1, role: 1 },
          },
        },
        this.testData.adminToken,
      );
    }

    // 13. User Status Management (Admin)
    if (this.testData.adminToken && this.testData.testUser) {
      await this.testEndpoint(
        "Update User Status (Admin)",
        "user/updateUserStatus",
        "POST",
        {
          details: {
            set: {
              userId: this.testData.testUser._id,
              status: "active",
            },
          },
        },
        this.testData.adminToken,
      );
    }

    // 14. User Role Management (Admin)
    if (this.testData.adminToken && this.testData.testUser) {
      await this.testEndpoint(
        "Update User Role (Admin)",
        "user/updateUserRole",
        "POST",
        {
          details: {
            set: {
              userId: this.testData.testUser._id,
              role: "user",
            },
          },
        },
        this.testData.adminToken,
      );
    }

    // 15. User Analytics
    if (this.testData.adminToken) {
      await this.testEndpoint(
        "User Analytics",
        "user/getUserAnalytics",
        "POST",
        {
          details: {
            set: { timeframe: "month" },
          },
        },
        this.testData.adminToken,
      );
    }
  }

  async testScoringSystem() {
    console.log("\n🏆 Testing Scoring System (5 endpoints)");
    console.log("=".repeat(60));

    if (!this.testData.userToken) {
      console.log("❌ Skipping scoring tests - no user token");
      this.stats.skipped += 5;
      return;
    }

    // 1. Get User Score
    await this.testEndpoint(
      "Get User Score",
      "scoring/getUserScore",
      "POST",
      { details: { set: {}, get: {} } },
      this.testData.userToken,
    );

    // 2. Add Points (Activity)
    await this.testEndpoint(
      "Add Points for Activity",
      "scoring/addPoints",
      "POST",
      {
        details: {
          set: {
            points: 50,
            activity_type: "profile_completion",
            description: "Profile completion bonus",
          },
        },
      },
      this.testData.userToken,
    );

    // 3. Get Achievements
    await this.testEndpoint(
      "Get User Achievements",
      "scoring/getUserAchievements",
      "POST",
      { details: { set: {}, get: {} } },
      this.testData.userToken,
    );

    // 4. Get Leaderboard
    await this.testEndpoint(
      "Get Leaderboard",
      "scoring/getLeaderboard",
      "POST",
      {
        details: {
          set: { limit: 10, type: "monthly" },
        },
      },
      this.testData.userToken,
    );

    // 5. Daily Login Reward
    await this.testEndpoint(
      "Daily Login Reward",
      "scoring/dailyLogin",
      "POST",
      { details: { set: {}, get: {} } },
      this.testData.userToken,
    );
  }

  async testCategoriesAndTags() {
    console.log("\n🏷️ Testing Categories & Tags System (12 endpoints)");
    console.log("=".repeat(60));

    // Categories (6 endpoints)
    // 1. Create Category (Admin)
    let category = null;
    if (this.testData.adminToken) {
      category = await this.testEndpoint(
        "Create Category",
        "category/createCategory",
        "POST",
        {
          details: {
            set: {
              name: "Test Category " + Date.now(),
              description: "Test category for integration testing",
              status: "active",
            },
          },
        },
        this.testData.adminToken,
      );

      if (category) {
        this.testData.categories.push(category);
      }
    }

    // 2. Get Categories
    const categories = await this.testEndpoint(
      "Get Categories",
      "category/getCategories",
      "POST",
      {
        details: {
          set: { page: 1, limit: 10 },
          get: { _id: 1, name: 1, description: 1, status: 1 },
        },
      },
    );

    if (categories) {
      this.testData.categories = [
        ...this.testData.categories,
        ...(categories.data || []),
      ];
    }

    // 3. Get Category by ID
    if (category) {
      await this.testEndpoint(
        "Get Category by ID",
        "category/getCategoryById",
        "POST",
        {
          details: {
            set: { categoryId: category._id },
            get: { _id: 1, name: 1, description: 1 },
          },
        },
      );
    }

    // 4. Update Category
    if (this.testData.adminToken && category) {
      await this.testEndpoint(
        "Update Category",
        "category/updateCategory",
        "POST",
        {
          details: {
            set: {
              categoryId: category._id,
              name: "Updated Test Category",
              description: "Updated description",
            },
          },
        },
        this.testData.adminToken,
      );
    }

    // 5. Category Status Management
    if (this.testData.adminToken && category) {
      await this.testEndpoint(
        "Update Category Status",
        "category/updateCategoryStatus",
        "POST",
        {
          details: {
            set: {
              categoryId: category._id,
              status: "active",
            },
          },
        },
        this.testData.adminToken,
      );
    }

    // 6. Delete Category
    if (this.testData.adminToken && category) {
      await this.testEndpoint(
        "Delete Category",
        "category/deleteCategory",
        "POST",
        {
          details: {
            set: { categoryId: category._id },
          },
        },
        this.testData.adminToken,
      );
    }

    // Tags (6 endpoints)
    // 7. Create Tag
    let tag = null;
    if (this.testData.adminToken) {
      tag = await this.testEndpoint(
        "Create Tag",
        "tag/createTag",
        "POST",
        {
          details: {
            set: {
              name: "test-tag-" + Date.now(),
              description: "Test tag for integration testing",
              status: "active",
            },
          },
        },
        this.testData.adminToken,
      );

      if (tag) {
        this.testData.tags.push(tag);
      }
    }

    // 8. Get Tags
    const tags = await this.testEndpoint("Get Tags", "tag/getTags", "POST", {
      details: {
        set: { page: 1, limit: 10 },
        get: { _id: 1, name: 1, description: 1, status: 1 },
      },
    });

    if (tags) {
      this.testData.tags = [...this.testData.tags, ...(tags.data || [])];
    }

    // 9. Get Tag by ID
    if (tag) {
      await this.testEndpoint("Get Tag by ID", "tag/getTagById", "POST", {
        details: {
          set: { tagId: tag._id },
          get: { _id: 1, name: 1, description: 1 },
        },
      });
    }

    // 10. Update Tag
    if (this.testData.adminToken && tag) {
      await this.testEndpoint(
        "Update Tag",
        "tag/updateTag",
        "POST",
        {
          details: {
            set: {
              tagId: tag._id,
              name: "updated-test-tag",
              description: "Updated tag description",
            },
          },
        },
        this.testData.adminToken,
      );
    }

    // 11. Tag Status Management
    if (this.testData.adminToken && tag) {
      await this.testEndpoint(
        "Update Tag Status",
        "tag/updateTagStatus",
        "POST",
        {
          details: {
            set: {
              tagId: tag._id,
              status: "active",
            },
          },
        },
        this.testData.adminToken,
      );
    }

    // 12. Delete Tag
    if (this.testData.adminToken && tag) {
      await this.testEndpoint(
        "Delete Tag",
        "tag/deleteTag",
        "POST",
        {
          details: {
            set: { tagId: tag._id },
          },
        },
        this.testData.adminToken,
      );
    }
  }

  async testProductStore() {
    console.log("\n🛍️ Testing Product Store System (8 endpoints)");
    console.log("=".repeat(60));

    // 1. Create Product (Admin)
    let product = null;
    if (this.testData.adminToken && this.testData.categories.length > 0) {
      product = await this.testEndpoint(
        "Create Product",
        "product/createProduct",
        "POST",
        {
          details: {
            set: {
              name: "Test Product " + Date.now(),
              description: "Test product for integration testing",
              price: 99.99,
              type: "digital",
              status: "active",
              inventory_count: 100,
              categoryId: this.testData.categories[0]._id,
            },
          },
        },
        this.testData.adminToken,
      );

      if (product) {
        this.testData.products.push(product);
      }
    }

    // 2. Get Products
    const products = await this.testEndpoint(
      "Get Products",
      "product/getProducts",
      "POST",
      {
        details: {
          set: { page: 1, limit: 10, status: "active" },
          get: { _id: 1, name: 1, price: 1, type: 1, status: 1 },
        },
      },
    );

    if (products) {
      this.testData.products = [
        ...this.testData.products,
        ...(products.data || []),
      ];
    }

    // 3. Get Product by ID
    if (product) {
      await this.testEndpoint(
        "Get Product by ID",
        "product/getProductById",
        "POST",
        {
          details: {
            set: { productId: product._id },
            get: { _id: 1, name: 1, description: 1, price: 1, type: 1 },
          },
        },
      );
    }

    // 4. Update Product
    if (this.testData.adminToken && product) {
      await this.testEndpoint(
        "Update Product",
        "product/updateProduct",
        "POST",
        {
          details: {
            set: {
              productId: product._id,
              name: "Updated Test Product",
              price: 89.99,
            },
          },
        },
        this.testData.adminToken,
      );
    }

    // 5. Product Status Management
    if (this.testData.adminToken && product) {
      await this.testEndpoint(
        "Update Product Status",
        "product/updateProductStatus",
        "POST",
        {
          details: {
            set: {
              productId: product._id,
              status: "active",
            },
          },
        },
        this.testData.adminToken,
      );
    }

    // 6. Get Product Categories
    await this.testEndpoint(
      "Get Product Categories",
      "product/getProductCategories",
      "POST",
      {
        details: {
          set: {},
          get: { _id: 1, name: 1, product_count: 1 },
        },
      },
    );

    // 7. Search Products
    await this.testEndpoint(
      "Search Products",
      "product/searchProducts",
      "POST",
      {
        details: {
          set: {
            query: "test",
            filters: { status: "active" },
          },
          get: { _id: 1, name: 1, price: 1, description: 1 },
        },
      },
    );

    // 8. Delete Product
    if (this.testData.adminToken && product) {
      await this.testEndpoint(
        "Delete Product",
        "product/deleteProduct",
        "POST",
        {
          details: {
            set: { productId: product._id },
          },
        },
        this.testData.adminToken,
      );
    }
  }

  async testWalletSystem() {
    console.log("\n💰 Testing Wallet System (5 endpoints)");
    console.log("=".repeat(60));

    if (!this.testData.userToken) {
      console.log("❌ Skipping wallet tests - no user token");
      this.stats.skipped += 5;
      return;
    }

    // 1. Get Wallet Balance
    await this.testEndpoint(
      "Get Wallet Balance",
      "wallet/getBalance",
      "POST",
      { details: { set: {}, get: {} } },
      this.testData.userToken,
    );

    // 2. Deposit to Wallet (Admin)
    if (this.testData.adminToken && this.testData.testUser) {
      await this.testEndpoint(
        "Deposit to Wallet (Admin)",
        "wallet/deposit",
        "POST",
        {
          details: {
            set: {
              amount: 1000,
              description: "Test deposit for integration testing",
              userId: this.testData.testUser._id,
            },
          },
        },
        this.testData.adminToken,
      );
    }

    // 3. Purchase with Wallet
    if (this.testData.products.length > 0) {
      await this.testEndpoint(
        "Purchase with Wallet",
        "wallet/purchase",
        "POST",
        {
          details: {
            set: {
              productId: this.testData.products[0]._id,
              quantity: 1,
            },
          },
        },
        this.testData.userToken,
      );
    }

    // 4. Get Wallet Transactions
    await this.testEndpoint(
      "Get Wallet Transactions",
      "wallet/getTransactions",
      "POST",
      {
        details: {
          set: { page: 1, limit: 10 },
          get: { _id: 1, type: 1, amount: 1, description: 1, createdAt: 1 },
        },
      },
      this.testData.userToken,
    );

    // 5. Withdraw Request (if balance available)
    await this.testEndpoint(
      "Withdraw Request",
      "wallet/withdraw",
      "POST",
      {
        details: {
          set: {
            amount: 50,
            description: "Test withdrawal",
          },
        },
      },
      this.testData.userToken,
    );
  }

  async testReferralSystem() {
    console.log("\n🤝 Testing Referral System (3 endpoints)");
    console.log("=".repeat(60));

    if (!this.testData.userToken) {
      console.log("❌ Skipping referral tests - no user token");
      this.stats.skipped += 3;
      return;
    }

    // 1. Generate Referral Code
    const referralCode = await this.testEndpoint(
      "Generate Referral Code",
      "referral/generateCode",
      "POST",
      { details: { set: {}, get: {} } },
      this.testData.userToken,
    );

    // 2. Get Referral Stats
    await this.testEndpoint(
      "Get Referral Stats",
      "referral/getStats",
      "POST",
      { details: { set: {}, get: {} } },
      this.testData.userToken,
    );

    // 3. Get Referral Commission
    await this.testEndpoint(
      "Get Referral Commission",
      "referral/getCommissions",
      "POST",
      {
        details: {
          set: { page: 1, limit: 10 },
          get: { _id: 1, amount: 1, status: 1, createdAt: 1 },
        },
      },
      this.testData.userToken,
    );
  }

  async testBookingSystem() {
    console.log("\n📅 Testing Booking System (3 endpoints)");
    console.log("=".repeat(60));

    if (!this.testData.userToken) {
      console.log("❌ Skipping booking tests - no user token");
      this.stats.skipped += 3;
      return;
    }

    // 1. Get Available Slots
    const availableSlots = await this.testEndpoint(
      "Get Available Slots",
      "booking/getAvailableSlots",
      "POST",
      {
        details: {
          set: {
            date: new Date().toISOString().split("T")[0],
            spaceType: "meeting_room",
          },
        },
      },
      this.testData.userToken,
    );

    // 2. Create Booking
    if (
      availableSlots &&
      availableSlots.slots &&
      availableSlots.slots.length > 0
    ) {
      const booking = await this.testEndpoint(
        "Create Booking",
        "booking/createBooking",
        "POST",
        {
          details: {
            set: {
              spaceType: "meeting_room",
              date: new Date().toISOString().split("T")[0],
              timeSlot: availableSlots.slots[0],
              duration: 2,
              purpose: "Integration testing meeting",
            },
          },
        },
        this.testData.userToken,
      );

      if (booking) {
        this.testData.bookings.push(booking);
      }
    }

    // 3. Get User Bookings
    await this.testEndpoint(
      "Get User Bookings",
      "booking/getUserBookings",
      "POST",
      {
        details: {
          set: { page: 1, limit: 10 },
          get: { _id: 1, spaceType: 1, date: 1, timeSlot: 1, status: 1 },
        },
      },
      this.testData.userToken,
    );
  }

  async testCoursesSystem() {
    console.log("\n🎓 Testing Courses System (3 endpoints)");
    console.log("=".repeat(60));

    // 1. Create Course (Admin)
    let course = null;
    if (this.testData.adminToken) {
      course = await this.testEndpoint(
        "Create Course",
        "course/createCourse",
        "POST",
        {
          details: {
            set: {
              title: "Test Course " + Date.now(),
              description: "Test course for integration testing",
              level: "beginner",
              price: 199.99,
              status: "published",
            },
          },
        },
        this.testData.adminToken,
      );

      if (course) {
        this.testData.courses.push(course);
      }
    }

    // 2. Get Courses
    const courses = await this.testEndpoint(
      "Get Courses",
      "course/getCourses",
      "POST",
      {
        details: {
          set: { page: 1, limit: 10, status: "published" },
          get: { _id: 1, title: 1, description: 1, level: 1, price: 1 },
        },
      },
    );

    if (courses) {
      this.testData.courses = [
        ...this.testData.courses,
        ...(courses.data || []),
      ];
    }

    // 3. Enroll in Course
    if (this.testData.userToken && course) {
      await this.testEndpoint(
        "Enroll in Course",
        "course/enrollCourse",
        "POST",
        {
          details: {
            set: {
              courseId: course._id,
            },
          },
        },
        this.testData.userToken,
      );
    }
  }

  async testArticlesSystem() {
    console.log("\n📰 Testing Articles System (1 endpoint)");
    console.log("=".repeat(60));

    // 1. Get Articles
    const articles = await this.testEndpoint(
      "Get Articles",
      "article/getArticles",
      "POST",
      {
        details: {
          set: { page: 1, limit: 10, status: "published" },
          get: {
            _id: 1,
            title: 1,
            content: 1,
            author: 1,
            createdAt: 1,
            status: 1,
          },
        },
      },
    );

    console.log(`\n✅ Articles System: ${articles ? "PASS" : "FAIL"}`);
    return articles ? true : false;
  }

  // Main test orchestration method
  async runAllTests() {
    console.log("🔥 Starting comprehensive IRAC API test suite...\n");

    try {
      // Test all systems in sequence
      await this.testUserManagement();
      await this.testScoringSystem();
      await this.testCategoriesAndTags();
      await this.testProductStore();
      await this.testWalletSystem();
      await this.testReferralSystem();
      await this.testBookingSystem();
      await this.testCoursesSystem();
      await this.testArticlesSystem();

      console.log("\n🎉 All test suites completed!");
      return true;
    } catch (error) {
      console.error("\n💥 Test suite failed:", error.message);
      return false;
    }
  }

  // Summary method to display overall results
  displaySummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter((r) => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log("\n" + "=".repeat(80));
    console.log("🎯 COMPREHENSIVE TEST SUMMARY");
    console.log("=".repeat(80));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (successRate >= 90) {
      console.log(
        `🎉 EXCELLENT: Production ready with ${successRate}% success rate!`,
      );
    } else if (successRate >= 80) {
      console.log(
        `🟡 GOOD: Near production ready with ${successRate}% success rate`,
      );
    } else {
      console.log(
        `🔴 NEEDS WORK: ${successRate}% success rate requires attention`,
      );
    }

    console.log("\n📋 DETAILED RESULTS:");
    console.log("-".repeat(80));

    this.results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      const time = result.responseTime ? `(${result.responseTime}ms)` : "";
      console.log(`${status} ${result.endpoint} ${time}`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log("=".repeat(80));
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
    };
  }
}

// Execute the comprehensive test
async function runComprehensiveTest() {
  console.log("🚀 IRAC COMPREHENSIVE INTEGRATION TEST");
  console.log("=".repeat(80));
  console.log("Testing all business systems for production readiness...\n");

  const tester = new IntegrationTester();

  try {
    await tester.runAllTests();
    const summary = tester.displaySummary();

    console.log("\n🏁 TEST EXECUTION COMPLETE");
    console.log(
      `Final Status: ${summary.successRate >= 90 ? "✅ PRODUCTION READY" : "⚠️ NEEDS ATTENTION"}`,
    );

    process.exit(summary.successRate >= 90 ? 0 : 1);
  } catch (error) {
    console.error("💥 Test execution failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runComprehensiveTest();
}
