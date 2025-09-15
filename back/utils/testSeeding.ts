// Test script for data seeding functionality
// Usage: deno run --allow-all testSeeding.ts

import { masterSeeder } from "./seedData.ts";

async function testSeeding() {
  console.log("🧪 Testing IRAC Data Seeding System");
  console.log("=====================================\n");

  try {
    // Test 1: Foundation data only (minimal test)
    console.log("📋 Test 1: Foundation data seeding");
    const foundationResult = await masterSeeder.seedAll({
      clearExisting: true,
      includeTransactions: false,
      includeScoring: false,
      includeReferrals: false,
      includeBookings: false
    });

    if (foundationResult.success) {
      console.log("✅ Foundation seeding completed successfully");
      console.log(`   Created entities: ${foundationResult.data.summary.total_entities}`);
    } else {
      console.error("❌ Foundation seeding failed:", foundationResult.error);
      return false;
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Complete data seeding
    console.log("📋 Test 2: Complete data seeding");
    const completeResult = await masterSeeder.seedAll({
      clearExisting: false, // Don't clear foundation data
      includeTransactions: true,
      includeScoring: true,
      includeReferrals: true,
      includeBookings: true
    });

    if (completeResult.success) {
      console.log("✅ Complete seeding finished successfully");
      console.log(`   Total entities: ${completeResult.data.summary.total_entities}`);
      console.log(`   Success operations: ${completeResult.data.summary.success_count}`);
      console.log(`   Failed operations: ${completeResult.data.summary.error_count}`);
      console.log(`   Duration: ${Math.round(completeResult.data.summary.duration_ms / 1000)}s`);

      // Display detailed results
      console.log("\n📊 Detailed Results:");
      console.log("===================");

      if (completeResult.data.users) {
        console.log(`👥 Users: ${completeResult.data.users.data?.length || 0}`);
      }

      if (completeResult.data.categories) {
        const cats = completeResult.data.categories.data?.categories?.length || 0;
        const tags = completeResult.data.categories.data?.tags?.length || 0;
        console.log(`🏷️  Categories: ${cats}, Tags: ${tags}`);
      }

      if (completeResult.data.courses) {
        console.log(`🎓 Courses: ${completeResult.data.courses.data?.length || 0}`);
      }

      if (completeResult.data.articles) {
        console.log(`📰 Articles: ${completeResult.data.articles.data?.length || 0}`);
      }

      if (completeResult.data.products) {
        console.log(`🛍️  Products: ${completeResult.data.products.details?.success_count || 0}`);
      }

      if (completeResult.data.transactions) {
        const orders = completeResult.data.transactions.data?.orders?.length || 0;
        const walletTx = completeResult.data.transactions.data?.walletTransactions?.length || 0;
        console.log(`💰 Orders: ${orders}, Wallet Transactions: ${walletTx}`);
      }

      if (completeResult.data.scoring) {
        const scoringTx = completeResult.data.scoring.data?.scoringTransactions?.length || 0;
        const userLevels = completeResult.data.scoring.data?.userLevels?.length || 0;
        console.log(`🏆 Scoring Transactions: ${scoringTx}, User Levels: ${userLevels}`);
      }

      if (completeResult.data.referrals) {
        console.log(`🤝 Referrals: ${completeResult.data.referrals.data?.length || 0}`);
      }

      if (completeResult.data.bookings) {
        console.log(`📅 Bookings: ${completeResult.data.bookings.data?.length || 0}`);
      }

      console.log("\n✨ All seeding tests completed successfully!");
      console.log("\n🎯 Next Steps:");
      console.log("1. Check admin dashboard for seeded data");
      console.log("2. Test API endpoints with new data");
      console.log("3. Verify frontend displays content correctly");
      console.log("4. Test user flows (login, purchase, scoring, etc.)");

      return true;
    } else {
      console.error("❌ Complete seeding failed:", completeResult.error);
      return false;
    }

  } catch (error) {
    console.error("💥 Critical error in seeding test:", error);
    return false;
  }
}

// Run the test if this file is executed directly
if (import.meta.main) {
  console.log("🚀 Starting seeding test...\n");
  const success = await testSeeding();

  if (success) {
    console.log("\n🎉 Seeding test completed successfully!");
    Deno.exit(0);
  } else {
    console.log("\n❌ Seeding test failed!");
    Deno.exit(1);
  }
}

export { testSeeding };
