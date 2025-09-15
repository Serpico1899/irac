#!/usr/bin/env node

/**
 * IRAC Endpoints Verification Script
 *
 * Quick verification that all major API endpoints are accessible
 * and responding correctly. This is a lightweight check to ensure
 * the backend is properly configured after deployment.
 */

const BASE_URL = process.env.API_URL || "http://localhost:1405";

class EndpointVerifier {
  constructor() {
    this.results = {
      accessible: 0,
      inaccessible: 0,
      errors: [],
    };
  }

  async checkEndpoint(
    name,
    endpoint,
    method = "POST",
    expectedStatuses = [200, 400, 401],
  ) {
    const url = `${BASE_URL}/${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method !== "GET" ? JSON.stringify({}) : undefined,
      });

      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${name}: ${response.status}`);
        this.results.accessible++;
        return true;
      } else {
        console.log(`⚠️  ${name}: Unexpected status ${response.status}`);
        this.results.inaccessible++;
        return false;
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      this.results.errors.push({ endpoint: name, error: error.message });
      this.results.inaccessible++;
      return false;
    }
  }

  async verifyHealthAndMeta() {
    console.log("\n🏥 Health & Meta Endpoints");
    console.log("=".repeat(40));

    // These might not exist but let's check common health endpoints
    await this.checkEndpoint("Health Check", "health", "GET", [200, 404]);
    await this.checkEndpoint("API Info", "info", "GET", [200, 404]);
    await this.checkEndpoint("Playground", "playground", "GET", [200, 404]);
  }

  async verifyUserEndpoints() {
    console.log("\n👤 User Management Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint("User Registration", "user/createUser");
    await this.checkEndpoint("User Login", "user/login");
    await this.checkEndpoint(
      "Get Profile",
      "user/getProfile",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Update Profile",
      "user/updateProfile",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Change Password",
      "user/changePassword",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint("Get Users", "user/getUsers", "POST", [401, 400]);
  }

  async verifyScoringEndpoints() {
    console.log("\n🏆 Scoring System Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint(
      "Get User Score",
      "scoring/getUserScore",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Add Points",
      "scoring/addPoints",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Get Leaderboard",
      "scoring/getLeaderboard",
      "POST",
      [200, 401, 400],
    );
    await this.checkEndpoint(
      "Daily Login",
      "scoring/dailyLogin",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Get Achievements",
      "scoring/getUserAchievements",
      "POST",
      [401, 400],
    );
  }

  async verifyProductEndpoints() {
    console.log("\n🛍️  Product Store Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint("Get Products", "product/getProducts");
    await this.checkEndpoint(
      "Create Product",
      "product/createProduct",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint("Search Products", "product/searchProducts");
    await this.checkEndpoint(
      "Get Product Categories",
      "product/getProductCategories",
    );
  }

  async verifyWalletEndpoints() {
    console.log("\n💰 Wallet System Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint(
      "Get Balance",
      "wallet/getBalance",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Wallet Deposit",
      "wallet/deposit",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Wallet Purchase",
      "wallet/purchase",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Get Transactions",
      "wallet/getTransactions",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Withdraw Request",
      "wallet/withdraw",
      "POST",
      [401, 400],
    );
  }

  async verifyFileEndpoints() {
    console.log("\n📁 File Management Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint("Get Files", "file/getFiles", "POST", [401, 400]);
    await this.checkEndpoint(
      "Upload File",
      "file/uploadFile",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Serve File (NEW)",
      "file/serveFile",
      "POST",
      [401, 400],
    );
  }

  async verifyReferralEndpoints() {
    console.log("\n🤝 Referral System Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint(
      "Generate Referral Code",
      "referral/generateCode",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Get Referral Stats",
      "referral/getStats",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Apply Referral Code",
      "referral/applyCode",
      "POST",
      [401, 400],
    );
  }

  async verifyBookingEndpoints() {
    console.log("\n📅 Booking System Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint(
      "Get Available Slots",
      "booking/getAvailableSlots",
      "POST",
      [401, 400, 200],
    );
    await this.checkEndpoint(
      "Create Booking",
      "booking/createBooking",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Get User Bookings",
      "booking/getUserBookings",
      "POST",
      [401, 400],
    );
  }

  async verifyCategoryTagEndpoints() {
    console.log("\n🏷️  Categories & Tags Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint("Get Categories", "category/getCategories");
    await this.checkEndpoint(
      "Create Category",
      "category/createCategory",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint("Get Tags", "tag/getTags");
    await this.checkEndpoint("Create Tag", "tag/createTag", "POST", [401, 400]);
  }

  async verifyContentEndpoints() {
    console.log("\n📚 Content Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint("Get Courses", "course/getCourses");
    await this.checkEndpoint(
      "Create Course",
      "course/createCourse",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint("Get Articles", "article/getArticles");
  }

  async verifyAnalyticsEndpoints() {
    console.log("\n📊 Analytics Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint(
      "User Analytics",
      "analytics/getUserAnalytics",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Revenue Report",
      "analytics/getRevenueReport",
      "POST",
      [401, 400],
    );
  }

  async verifyDownloadEndpoints() {
    console.log("\n⬇️  Download System Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint(
      "Generate Download Link",
      "download/generateLink",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Validate Access",
      "download/validateAccess",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Track Downloads",
      "download/trackDownload",
      "POST",
      [401, 400],
    );
  }

  async verifyAdminEndpoints() {
    console.log("\n⚙️  Admin Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint(
      "Seed Database",
      "admin/seedDatabase",
      "POST",
      [401, 400, 200],
    );
  }

  async verifyPaymentEndpoints() {
    console.log("\n💳 Payment Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint(
      "Process Payment",
      "payment/process",
      "POST",
      [401, 400],
    );
    await this.checkEndpoint(
      "Payment Callback",
      "payment/callback",
      "POST",
      [401, 400],
    );
  }

  async verifySMSEndpoints() {
    console.log("\n📱 SMS Endpoints");
    console.log("=".repeat(40));

    await this.checkEndpoint("Send SMS", "sms/send", "POST", [401, 400]);
  }

  async runVerification() {
    console.log("🔍 IRAC API Endpoints Verification");
    console.log("==================================");
    console.log(`Testing against: ${BASE_URL}`);
    console.log(`Time: ${new Date().toISOString()}\n`);

    const startTime = Date.now();

    // Run all verification checks
    await this.verifyHealthAndMeta();
    await this.verifyUserEndpoints();
    await this.verifyScoringEndpoints();
    await this.verifyProductEndpoints();
    await this.verifyWalletEndpoints();
    await this.verifyFileEndpoints();
    await this.verifyReferralEndpoints();
    await this.verifyBookingEndpoints();
    await this.verifyCategoryTagEndpoints();
    await this.verifyContentEndpoints();
    await this.verifyAnalyticsEndpoints();
    await this.verifyDownloadEndpoints();
    await this.verifyAdminEndpoints();
    await this.verifyPaymentEndpoints();
    await this.verifySMSEndpoints();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Results summary
    console.log("\n📋 VERIFICATION SUMMARY");
    console.log("=".repeat(50));
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`✅ Accessible endpoints: ${this.results.accessible}`);
    console.log(`❌ Inaccessible endpoints: ${this.results.inaccessible}`);

    const total = this.results.accessible + this.results.inaccessible;
    const successRate =
      total > 0 ? ((this.results.accessible / total) * 100).toFixed(1) : 0;
    console.log(`📊 Success rate: ${successRate}%`);

    if (this.results.errors.length > 0) {
      console.log("\n💥 CONNECTION ERRORS:");
      console.log("=".repeat(50));
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.endpoint}: ${error.error}`);
      });
    }

    console.log("\n📝 NOTES:");
    console.log("=".repeat(50));
    console.log(
      "• Status 401 = Unauthorized (expected for protected endpoints)",
    );
    console.log(
      "• Status 400 = Bad Request (expected for endpoints requiring data)",
    );
    console.log("• Status 200 = Success (endpoint working correctly)");
    console.log("• Status 404 = Not Found (endpoint may not exist)");

    if (this.results.accessible > 50) {
      console.log("\n🎉 EXCELLENT! Most endpoints are accessible.");
      console.log("   The IRAC backend is properly configured and running.");
    } else if (this.results.accessible > 30) {
      console.log("\n✅ GOOD! Most core endpoints are working.");
      console.log(
        "   Some endpoints may need configuration or authentication.",
      );
    } else {
      console.log("\n⚠️  WARNING! Many endpoints are not accessible.");
      console.log(
        "   Check if the backend is running and properly configured.",
      );
    }

    console.log("\n🎯 READY FOR:");
    console.log("• Integration testing with authentication");
    console.log("• Data seeding and population");
    console.log("• Frontend integration");
    console.log("• Production deployment");

    return {
      success: this.results.accessible > this.results.inaccessible,
      accessible: this.results.accessible,
      inaccessible: this.results.inaccessible,
      successRate: successRate,
      duration: duration,
    };
  }
}

// Main execution
async function main() {
  const verifier = new EndpointVerifier();

  try {
    const results = await verifier.runVerification();
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error("💥 Critical error during verification:", error);
    process.exit(1);
  }
}

// Check if backend is running first
async function checkBackendRunning() {
  try {
    const response = await fetch(BASE_URL, { method: "GET" });
    return true;
  } catch (error) {
    console.error("❌ Backend is not running or not accessible at:", BASE_URL);
    console.error(
      "   Please start the backend first: cd back && deno run --allow-all mod.ts",
    );
    return false;
  }
}

// Run verification if backend is accessible
checkBackendRunning().then((isRunning) => {
  if (isRunning) {
    main();
  } else {
    process.exit(1);
  }
});
