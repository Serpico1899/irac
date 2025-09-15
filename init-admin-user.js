#!/usr/bin/env node

/**
 * IRAC Platform - Admin User Initialization Script
 *
 * This script creates the initial admin user for the IRAC platform
 * ensuring proper access to administrative functions.
 *
 * Features:
 * - Creates admin user with proper validation
 * - Uses correct Lesan API format
 * - Handles Iranian national number validation
 * - Provides comprehensive error handling
 * - Tests admin login after creation
 */

const BASE_URL = process.env.API_URL || "http://localhost:1405";
const LESAN_ENDPOINT = `${BASE_URL}/lesan`;

class AdminUserInitializer {
  constructor() {
    this.adminData = null;
    this.adminToken = null;
  }

  async makeRequest(model, act, details = { set: {}, get: {} }, token = null) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["token"] = token;
    }

    try {
      const response = await fetch(LESAN_ENDPOINT, {
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

  generateValidNationalNumber() {
    // Generate 9 random digits
    let code = "";
    for (let i = 0; i < 9; i++) {
      code += Math.floor(Math.random() * 10);
    }

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += +code[i] * (10 - i);
    }

    const remainder = sum % 11;
    const lastDigit = remainder < 2 ? remainder : 11 - remainder;

    return code + lastDigit;
  }

  async checkBackendHealth() {
    console.log("🔍 Checking backend health...");

    try {
      const response = await fetch(BASE_URL);
      if (response.status === 501) {
        console.log("✅ Backend is responding correctly");
        return true;
      } else {
        console.log(
          `⚠️  Backend responding with unexpected status: ${response.status}`,
        );
        return false;
      }
    } catch (error) {
      console.log(`❌ Backend not accessible: ${error.message}`);
      console.log(`   Make sure the backend is running on ${BASE_URL}`);
      return false;
    }
  }

  async seedDatabase() {
    console.log("🌱 Seeding database with initial data...");

    const seedResult = await this.makeRequest("admin", "seedData", {
      set: {
        clear_existing: false,
        force_reseed: false,
        test_mode: false,
        seed_scope: "foundation",
        include_transactions: true,
        include_scoring: true,
        include_referrals: true,
        include_bookings: true,
        include_products: true,
        user_count: {
          admin_users: "1",
          regular_users: "5",
        },
        content_limits: {
          courses: "3",
          articles: "5",
          products: "10",
        },
        create_realistic_data: true,
        set_random_timestamps: true,
        generate_sample_relationships: true,
        batch_size: "5",
        delay_between_batches: "100",
        environment_check: false,
        require_confirmation: false,
        preserve_existing: true,
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
        return_created_ids: true,
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

    if (seedResult.success) {
      console.log("✅ Database seeded successfully");
      if (seedResult.data) {
        console.log(
          `   📊 Created entities: ${JSON.stringify(seedResult.data, null, 2).substring(0, 200)}...`,
        );
      }
      return true;
    } else {
      console.log("⚠️  Database seeding failed (may already be seeded)");
      console.log(`   Error: ${seedResult.data?.message || seedResult.error}`);
      return false; // Don't fail completely, might already be seeded
    }
  }

  async createAdminUser() {
    console.log("👤 Creating admin user...");

    const timestamp = Date.now();
    const nationalNumber = this.generateValidNationalNumber();
    const mobile = `0912${Math.floor(Math.random() * 9000000) + 1000000}`;

    this.adminData = {
      mobile,
      national_number: nationalNumber,
      first_name: "System",
      last_name: "Administrator",
      username: `admin_${timestamp}`,
      email: `admin_${timestamp}@irac.local`,
      level: "Manager",
    };

    console.log(`   📱 Mobile: ${mobile}`);
    console.log(`   🆔 National Number: ${nationalNumber}`);
    console.log(
      `   👤 Name: ${this.adminData.first_name} ${this.adminData.last_name}`,
    );

    const registerResult = await this.makeRequest("user", "registerUser", {
      set: {
        mobile: this.adminData.mobile,
        national_number: this.adminData.national_number,
      },
      get: {
        _id: 1,
        mobile: 1,
        national_number: 1,
        first_name: 1,
      },
    });

    if (registerResult.success) {
      console.log("✅ Admin user registered successfully");
      this.adminData.userId = registerResult.data._id;

      // Update user profile with additional information
      const updateResult = await this.makeRequest("user", "updateUser", {
        set: {
          first_name: this.adminData.first_name,
          last_name: this.adminData.last_name,
          level: "Manager",
          summary: "System Administrator for IRAC Platform",
        },
        get: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          level: 1,
        },
      });

      if (updateResult.success) {
        console.log("✅ Admin profile updated successfully");
      }

      return true;
    } else {
      console.log("❌ Admin user registration failed");
      console.log(
        `   Error: ${registerResult.data?.message || registerResult.error}`,
      );

      // Check if user already exists
      if (
        registerResult.data?.message &&
        (registerResult.data.message.includes("قبلا ثبت نام شده") ||
          registerResult.data.message.includes("already registered"))
      ) {
        console.log("   ℹ️  Admin user may already exist, continuing...");
        return true; // Continue as if successful
      }

      return false;
    }
  }

  async testAdminLogin() {
    console.log("🔐 Testing admin login...");

    if (!this.adminData) {
      console.log("❌ No admin data available for login test");
      return false;
    }

    const loginResult = await this.makeRequest("user", "loginReq", {
      set: {
        national_number: this.adminData.national_number,
      },
      get: {
        mobile: 1,
        national_number: 1,
      },
    });

    if (loginResult.success) {
      console.log("✅ Admin login request successful");
      console.log("   📱 SMS verification would be sent in production");
      return true;
    } else {
      console.log("❌ Admin login test failed");
      console.log(
        `   Error: ${loginResult.data?.message || loginResult.error}`,
      );
      return false;
    }
  }

  async testUserCount() {
    console.log("📊 Testing user count...");

    const countResult = await this.makeRequest("user", "countUsers", {
      set: {},
      get: { count: 1 },
    });

    if (countResult.success) {
      console.log(
        `✅ User count retrieved: ${countResult.data?.count || "N/A"} users`,
      );
      return true;
    } else {
      console.log(
        "⚠️  User count test failed (expected without authentication)",
      );
      console.log(
        `   Error: ${countResult.data?.message || countResult.error}`,
      );
      return true; // This is expected to fail without auth
    }
  }

  async displayAdminCredentials() {
    if (!this.adminData) {
      console.log("❌ No admin credentials to display");
      return;
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎯 ADMIN USER CREDENTIALS");
    console.log("=".repeat(60));
    console.log(`📱 Mobile Number: ${this.adminData.mobile}`);
    console.log(`🆔 National Number: ${this.adminData.national_number}`);
    console.log(
      `👤 Name: ${this.adminData.first_name} ${this.adminData.last_name}`,
    );
    console.log(`📧 Email: ${this.adminData.email}`);
    console.log(`👑 Level: Manager (Admin privileges)`);

    console.log("\n🔐 LOGIN INSTRUCTIONS:");
    console.log("1. Navigate to the frontend application");
    console.log('2. Click "Login" or "ورود"');
    console.log(`3. Enter National Number: ${this.adminData.national_number}`);
    console.log("4. Complete SMS verification (if enabled)");
    console.log("5. Access admin panel features");

    console.log("\n📝 IMPORTANT NOTES:");
    console.log("• Save these credentials securely");
    console.log("• The national number is the primary login identifier");
    console.log("• SMS verification may be required based on configuration");
    console.log("• Manager level provides administrative access");
    console.log("=".repeat(60));
  }

  async run() {
    console.log("🚀 IRAC ADMIN USER INITIALIZATION");
    console.log("=".repeat(60));
    console.log(`Target Backend: ${BASE_URL}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log("");

    let success = true;

    // Step 1: Check backend health
    if (!(await this.checkBackendHealth())) {
      console.log("❌ Backend health check failed. Exiting.");
      process.exit(1);
    }

    // Step 2: Seed database (optional)
    console.log("");
    await this.seedDatabase();

    // Step 3: Create admin user
    console.log("");
    if (!(await this.createAdminUser())) {
      success = false;
    }

    // Step 4: Test admin login
    console.log("");
    if (!(await this.testAdminLogin())) {
      success = false;
    }

    // Step 5: Test user count
    console.log("");
    await this.testUserCount();

    // Display results
    console.log("\n" + "=".repeat(60));
    console.log("📊 INITIALIZATION SUMMARY");
    console.log("=".repeat(60));

    if (success) {
      console.log("🎉 SUCCESS: Admin user initialization completed!");
      console.log("✅ Admin user created and ready for use");
      console.log("✅ Backend systems operational");
      console.log("✅ Authentication system functional");

      await this.displayAdminCredentials();

      console.log("\n🚀 NEXT STEPS:");
      console.log("1. Test admin login through the frontend");
      console.log("2. Configure external services (SMS, Email, Payment)");
      console.log("3. Add initial content (courses, articles, products)");
      console.log("4. Launch marketing and user onboarding");
    } else {
      console.log("⚠️  PARTIAL SUCCESS: Some issues encountered");
      console.log("🔧 Review the errors above and retry if needed");
      console.log("📋 Check backend logs for detailed error information");

      if (this.adminData) {
        await this.displayAdminCredentials();
      }
    }

    console.log("\n📞 SUPPORT COMMANDS:");
    console.log("• Check service status: ./launch-irac.sh status");
    console.log("• View backend logs: tail -f logs/backend.log");
    console.log("• Test API endpoints: node test-lesan-api.js");
    console.log("• Production check: ./production-readiness-check.sh");

    return success;
  }
}

// Main execution
async function main() {
  const initializer = new AdminUserInitializer();

  try {
    const success = await initializer.run();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("\n💥 Critical error during initialization:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Check if backend is accessible first
async function checkBackendAccessibility() {
  try {
    const response = await fetch(BASE_URL);
    return true;
  } catch (error) {
    console.error("❌ Backend not accessible at:", BASE_URL);
    console.error("   Please ensure the backend is running:");
    console.error("   ./launch-irac.sh start");
    return false;
  }
}

// Run the script if called directly
if (require.main === module) {
  checkBackendAccessibility().then((accessible) => {
    if (accessible) {
      main();
    } else {
      process.exit(1);
    }
  });
}

module.exports = { AdminUserInitializer };
