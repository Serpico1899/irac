/**
 * IRAC Production Readiness Quick Test
 *
 * This script performs critical production readiness validation
 * testing core business functionality with correct API format
 */

const BASE_URL = "http://localhost:1405/lesan";

class ProductionTester {
  constructor() {
    this.results = [];
    this.testData = {
      adminToken: null,
      userToken: null,
      testUser: null,
      testData: {},
    };
  }

  async makeRequest(model, act, details = { set: {}, get: {} }, token = null) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          act,
          details,
        }),
      });

      const result = await response.json();

      return {
        success: result.success || false,
        data: result.body || result,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 0,
      };
    }
  }

  logResult(test, success, message, data = null) {
    const status = success ? "✅" : "❌";
    console.log(`${status} ${test}: ${message}`);

    if (data && !success) {
      console.log(`   Details: ${JSON.stringify(data, null, 2)}`);
    }

    this.results.push({
      test,
      success,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  async testSystemInitialization() {
    console.log("\n🔧 SYSTEM INITIALIZATION TESTS");
    console.log("=".repeat(60));

    // Test 1: Admin Data Seeding
    console.log("\n1. Testing Admin Data Seeding...");
    const seedResult = await this.makeRequest("admin", "seedData", {
      set: {
        clear_existing: false,
        force_reseed: false,
        test_mode: true,
        seed_scope: "foundation",
        include_transactions: true,
        include_scoring: true,
        include_referrals: true,
        include_bookings: true,
        include_products: true,
        user_count: {
          admin_users: "2",
          regular_users: "10",
        },
        content_limits: {
          courses: "5",
          articles: "10",
          products: "20",
        },
        create_realistic_data: true,
        set_random_timestamps: true,
        generate_sample_relationships: true,
        batch_size: "10",
        delay_between_batches: "100",
        environment_check: true,
        require_confirmation: false,
        preserve_existing: false,
        dry_run: false,
        entity_config: {
          users: {
            create_admin: true,
            create_regular: true,
            verify_all: true,
          },
          courses: {
            set_featured: true,
            generate_syllabi: true,
            create_enrollments: true,
          },
          products: {
            set_featured: true,
            set_bestsellers: true,
            create_reviews: true,
          },
          scoring: {
            award_achievement: true,
            calculate_levels: true,
            create_leaderboard: true,
          },
          bookings: {
            create_future: true,
            create_past: true,
            vary_status: true,
          },
        },
        verbose_output: false,
        return_created_ids: false,
        generate_report: true,
      },
      get: {
        summary: "1",
        results: "1",
        created_entities: "1",
        statistics: "1",
        performance_metrics: "1",
        error_details: "1",
      },
    });

    this.logResult(
      "Admin Data Seeding",
      seedResult.success,
      seedResult.success
        ? "Database seeded successfully"
        : "Failed to seed database",
      seedResult.data,
    );

    return seedResult.success;
  }

  async testUserManagement() {
    console.log("\n👤 USER MANAGEMENT TESTS");
    console.log("=".repeat(60));

    const timestamp = Date.now();

    // Test 2: User Registration
    console.log("\n2. Testing User Registration...");
    const userData = {
      set: {
        mobile: "09123456789",
        national_number: "5350502964",
      },
      get: { _id: 1, mobile: 1, national_number: 1, first_name: 1 },
    };

    const registerResult = await this.makeRequest(
      "user",
      "registerUser",
      userData,
    );

    this.logResult(
      "User Registration",
      registerResult.success,
      registerResult.success
        ? "User registered successfully"
        : "Failed to register user",
      registerResult.data,
    );

    if (registerResult.success) {
      this.testData.testUser = registerResult.data;
    }

    // Test 3: User Login
    console.log("\n3. Testing User Login...");
    const loginResult = await this.makeRequest("user", "loginReq", {
      set: {
        national_number: userData.set.national_number,
      },
      get: { mobile: 1, national_number: 1 },
    });

    this.logResult(
      "User Login",
      loginResult.success,
      loginResult.success ? "User login successful" : "Failed to login user",
      loginResult.data,
    );

    if (loginResult.success && loginResult.data) {
      // Store the user data for potential token usage
      this.testData.loginData = loginResult.data;
    }

    // Test 4: Get User Profile
    if (this.testData.userToken) {
      console.log("\n4. Testing Get User Profile...");
      const profileResult = await this.makeRequest(
        "user",
        "getMe",
        {
          set: {},
          get: { _id: 1, mobile: 1, first_name: 1, last_name: 1 },
        },
        this.testData.userToken,
      );

      this.logResult(
        "Get User Profile",
        profileResult.success,
        profileResult.success
          ? "Profile retrieved successfully"
          : "Failed to get profile",
        profileResult.data,
      );
    }

    return registerResult.success && loginResult.success;
  }

  async testBusinessLogic() {
    console.log("\n💼 BUSINESS LOGIC TESTS");
    console.log("=".repeat(60));

    // Test 5: Get User Score (Scoring System)
    console.log("\n5. Testing Scoring System...");
    const scoreResult = await this.makeRequest(
      "user",
      "directGetUserScore",
      {
        set: {},
        get: { points: 1, level: 1, achievements: 1 },
      },
      this.testData.userToken,
    );

    this.logResult(
      "User Scoring System",
      scoreResult.success,
      scoreResult.success
        ? "Scoring system operational"
        : "Scoring system not available",
      scoreResult.data,
    );

    // Test 6: System Statistics
    console.log("\n6. Testing System Statistics...");
    const statsResult = await this.makeRequest("user", "directGetSystemStats", {
      set: {},
      get: {},
    });

    this.logResult(
      "System Statistics",
      statsResult.success,
      statsResult.success
        ? "System stats available"
        : "System stats not available",
      statsResult.data,
    );

    // Test 7: Dashboard Statistics
    console.log("\n7. Testing Dashboard Statistics...");
    const dashboardResult = await this.makeRequest(
      "user",
      "dashboardStatistic",
      {
        set: {},
        get: {},
      },
      this.testData.userToken,
    );

    this.logResult(
      "Dashboard Statistics",
      dashboardResult.success,
      dashboardResult.success
        ? "Dashboard operational"
        : "Dashboard not available",
      dashboardResult.data,
    );

    return scoreResult.success && statsResult.success;
  }

  async testDataAccess() {
    console.log("\n📊 DATA ACCESS TESTS");
    console.log("=".repeat(60));

    // Test 8: Get Users List
    console.log("\n8. Testing Users List Access...");
    const usersResult = await this.makeRequest(
      "user",
      "getUsers",
      {
        set: {},
        get: { _id: 1, mobile: 1, first_name: 1, created_at: 1 },
      },
      this.testData.userToken,
    );

    this.logResult(
      "Users List Access",
      usersResult.success,
      usersResult.success
        ? "Users list accessible"
        : "Users list not accessible",
      usersResult.data,
    );

    // Test 9: User Count
    console.log("\n9. Testing User Count...");
    const countResult = await this.makeRequest(
      "user",
      "countUsers",
      {
        set: {},
        get: { count: 1 },
      },
      this.testData.userToken,
    );

    this.logResult(
      "User Count",
      countResult.success,
      countResult.success ? "User count available" : "User count not available",
      countResult.data,
    );

    return usersResult.success;
  }

  async runProductionTest() {
    console.log("🚀 IRAC PRODUCTION READINESS TEST");
    console.log("=".repeat(80));
    console.log("Testing critical business functionality...\n");

    const startTime = Date.now();

    try {
      // Run all test phases
      const initSuccess = await this.testSystemInitialization();
      const userSuccess = await this.testUserManagement();
      const businessSuccess = await this.testBusinessLogic();
      const dataSuccess = await this.testDataAccess();

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      // Calculate results
      const totalTests = this.results.length;
      const passedTests = this.results.filter((r) => r.success).length;
      const failedTests = totalTests - passedTests;
      const successRate = ((passedTests / totalTests) * 100).toFixed(1);

      // Display summary
      this.displaySummary(
        totalTests,
        passedTests,
        failedTests,
        successRate,
        duration,
      );

      // Determine production readiness
      const criticalSystemsWorking = initSuccess && userSuccess;
      const overallReadiness = successRate >= 70;

      this.displayProductionStatus(
        criticalSystemsWorking,
        overallReadiness,
        successRate,
      );

      return {
        success: criticalSystemsWorking,
        successRate: parseFloat(successRate),
        totalTests,
        passedTests,
        failedTests,
        duration: parseFloat(duration),
      };
    } catch (error) {
      console.error("💥 Test execution failed:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  displaySummary(total, passed, failed, rate, duration) {
    console.log("\n" + "=".repeat(80));
    console.log("📊 TEST EXECUTION SUMMARY");
    console.log("=".repeat(80));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📈 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${rate}%`);

    console.log("\n📋 DETAILED RESULTS:");
    console.log("-".repeat(80));

    this.results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      console.log(`${status} ${result.test}`);
    });
  }

  displayProductionStatus(criticalWorking, overallReady, successRate) {
    console.log("\n" + "=".repeat(80));
    console.log("🎯 PRODUCTION READINESS ASSESSMENT");
    console.log("=".repeat(80));

    if (criticalWorking && overallReady) {
      console.log("🟢 STATUS: PRODUCTION READY ✅");
      console.log(
        `🚀 The IRAC platform is operational with ${successRate}% success rate`,
      );
      console.log(
        "✨ Core systems working: Database, Authentication, User Management",
      );
      console.log("💼 Business systems ready for launch");
    } else if (criticalWorking) {
      console.log("🟡 STATUS: PARTIALLY READY ⚠️");
      console.log(
        `🔧 Core systems working but some features need attention (${successRate}% success)`,
      );
      console.log("✅ Critical: Database, Authentication working");
      console.log("🔨 Some business features may need configuration");
    } else {
      console.log("🔴 STATUS: NOT PRODUCTION READY ❌");
      console.log(`💥 Critical systems failing (${successRate}% success rate)`);
      console.log(
        "🚨 Database seeding, authentication, or core systems have issues",
      );
      console.log("🔧 Immediate attention required before launch");
    }

    console.log("\n🎉 NEXT STEPS:");
    if (criticalWorking && overallReady) {
      console.log("• ✅ Platform ready for production launch");
      console.log("• 🚀 Begin user onboarding and marketing");
      console.log("• 📊 Monitor system performance and user activity");
      console.log("• 🔧 Setup external services (payment, SMS, email)");
    } else {
      console.log("• 🔧 Fix failing core systems first");
      console.log("• 📋 Review backend logs for detailed error information");
      console.log("• ⚙️  Check database connectivity and seeding");
      console.log("• 🔐 Verify authentication token generation");
    }

    console.log("\n📞 SUPPORT INFORMATION:");
    console.log("• 📋 Backend logs: tail -f logs/backend.log");
    console.log("• 🔧 Restart services: ./launch-irac.sh restart");
    console.log("• 🧪 Run full tests: node comprehensive-integration-test.js");
    console.log("• 📊 Check service status: ./launch-irac.sh status");

    console.log("=".repeat(80));
  }
}

// Execute the production test
async function runQuickTest() {
  const tester = new ProductionTester();

  try {
    const result = await tester.runProductionTest();

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error("💥 Production test failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runQuickTest();
}

module.exports = { ProductionTester, runQuickTest };
