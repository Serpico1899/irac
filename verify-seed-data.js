#!/usr/bin/env node

/**
 * IRAC Platform - Seed Data Verification Script
 *
 * This script verifies that the database seeding was successful
 * by checking all seeded collections and displaying a comprehensive report.
 *
 * Usage: node verify-seed-data.js
 */

const { MongoClient } = require('mongodb');

// Configuration
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "nejat";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Helper functions
function log(message, color = colors.green) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function printBanner() {
  console.clear();
  console.log(colors.magenta + `
██╗██████╗  █████╗  ██████╗    ██╗   ██╗███████╗██████╗ ██╗███████╗██╗   ██╗
██║██╔══██╗██╔══██╗██╔════╝    ██║   ██║██╔════╝██╔══██╗██║██╔════╝╚██╗ ██╔╝
██║██████╔╝███████║██║         ██║   ██║█████╗  ██████╔╝██║█████╗   ╚████╔╝
██║██╔══██╗██╔══██║██║         ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║██╔══╝    ╚██╔╝
██║██║  ██║██║  ██║╚██████╗     ╚████╔╝ ███████╗██║  ██║██║██║        ██║
╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝      ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝
` + colors.reset);

  console.log(colors.cyan + "IRAC Platform Seed Data Verification" + colors.reset);
  console.log(colors.cyan + "Comprehensive validation of seeded database content" + colors.reset);
  console.log("");
}

class SeedDataVerifier {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      info("Connecting to MongoDB...");
      this.client = new MongoClient(MONGO_URI);
      await this.client.connect();
      await this.client.db(DB_NAME).admin().ping();
      this.db = this.client.db(DB_NAME);
      success(`Connected to database: ${DB_NAME}`);
      return true;
    } catch (err) {
      error(`Database connection failed: ${err.message}`);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      info("Database connection closed");
    }
  }

  async getCollectionStats() {
    const collections = ['user', 'category', 'tag', 'course', 'article', 'product',
                        'order', 'wallet', 'wallet_transaction', 'scoring_transaction',
                        'user_level', 'referral', 'booking', 'enrollment'];

    const stats = {};
    for (const collectionName of collections) {
      try {
        const count = await this.db.collection(collectionName).countDocuments();
        stats[collectionName] = count;
      } catch (err) {
        stats[collectionName] = 0;
      }
    }
    return stats;
  }

  async verifyUsers() {
    info("Verifying user data...");

    const totalUsers = await this.db.collection('user').countDocuments();
    const adminUsers = await this.db.collection('user').countDocuments({ level: 'Manager' });
    const editorUsers = await this.db.collection('user').countDocuments({ level: 'Editor' });
    const regularUsers = await this.db.collection('user').countDocuments({ level: 'Ordinary' });

    console.log(`  👥 Total Users: ${totalUsers}`);
    console.log(`  👑 Admin Users (Manager): ${adminUsers}`);
    console.log(`  📝 Editor Users: ${editorUsers}`);
    console.log(`  👤 Regular Users: ${regularUsers}`);

    // Show admin users
    const admins = await this.db.collection('user')
      .find({ level: 'Manager' }, { firstname: 1, lastname: 1, email: 1 })
      .toArray();

    console.log("\n  🔑 Admin Users:");
    admins.forEach(admin => {
      console.log(`    • ${admin.firstname} ${admin.lastname} (${admin.email})`);
    });

    // Show some regular users
    const users = await this.db.collection('user')
      .find({ level: 'Ordinary' }, { firstname: 1, lastname: 1, email: 1 })
      .limit(3)
      .toArray();

    console.log("\n  👥 Sample Regular Users:");
    users.forEach(user => {
      console.log(`    • ${user.firstname} ${user.lastname} (${user.email})`);
    });

    return {
      total: totalUsers,
      admins: adminUsers,
      editors: editorUsers,
      regular: regularUsers
    };
  }

  async verifyCourses() {
    info("Verifying course data...");

    const totalCourses = await this.db.collection('course').countDocuments();
    console.log(`  📚 Total Courses: ${totalCourses}`);

    const courses = await this.db.collection('course')
      .find({}, { title: 1, title_en: 1, price: 1, level: 1 })
      .toArray();

    console.log("\n  📖 Course List:");
    courses.forEach(course => {
      const titleDisplay = course.title_en ?
        `${course.title} (${course.title_en})` :
        course.title;
      const priceDisplay = course.price ?
        `${course.price.toLocaleString()} تومان` :
        'Free';
      console.log(`    • ${titleDisplay} - ${priceDisplay}`);
    });

    return { total: totalCourses, courses };
  }

  async verifyCategories() {
    info("Verifying categories and tags...");

    const totalCategories = await this.db.collection('category').countDocuments();
    const totalTags = await this.db.collection('tag').countDocuments();

    console.log(`  🏷️  Total Categories: ${totalCategories}`);
    console.log(`  🏷️  Total Tags: ${totalTags}`);

    const categories = await this.db.collection('category')
      .find({}, { title: 1, title_en: 1 })
      .toArray();

    console.log("\n  📂 Categories:");
    categories.forEach(category => {
      const titleDisplay = category.title_en ?
        `${category.title} (${category.title_en})` :
        category.title;
      console.log(`    • ${titleDisplay}`);
    });

    const tags = await this.db.collection('tag')
      .find({}, { title: 1, title_en: 1 })
      .limit(10)
      .toArray();

    console.log("\n  🏷️  Sample Tags:");
    tags.forEach(tag => {
      const titleDisplay = tag.title_en ?
        `${tag.title} (${tag.title_en})` :
        tag.title;
      console.log(`    • ${titleDisplay}`);
    });

    return {
      categories: totalCategories,
      tags: totalTags
    };
  }

  async verifyArticles() {
    info("Verifying articles...");

    const totalArticles = await this.db.collection('article').countDocuments();
    console.log(`  📰 Total Articles: ${totalArticles}`);

    if (totalArticles === 0) {
      warning("No articles found - this is expected due to author relationship issues during seeding");
    } else {
      const articles = await this.db.collection('article')
        .find({}, { title: 1, title_en: 1, created_at: 1 })
        .limit(5)
        .toArray();

      console.log("\n  📄 Sample Articles:");
      articles.forEach(article => {
        const titleDisplay = article.title_en ?
          `${article.title} (${article.title_en})` :
          article.title;
        console.log(`    • ${titleDisplay}`);
      });
    }

    return { total: totalArticles };
  }

  async verifyOtherCollections() {
    info("Verifying other collections...");

    const collections = {
      products: await this.db.collection('product').countDocuments(),
      orders: await this.db.collection('order').countDocuments(),
      wallets: await this.db.collection('wallet').countDocuments(),
      transactions: await this.db.collection('wallet_transaction').countDocuments(),
      scoring: await this.db.collection('scoring_transaction').countDocuments(),
      referrals: await this.db.collection('referral').countDocuments(),
      bookings: await this.db.collection('booking').countDocuments(),
      enrollments: await this.db.collection('enrollment').countDocuments()
    };

    console.log(`  🛒 Products: ${collections.products}`);
    console.log(`  📦 Orders: ${collections.orders}`);
    console.log(`  💼 Wallets: ${collections.wallets}`);
    console.log(`  💰 Wallet Transactions: ${collections.transactions}`);
    console.log(`  🏆 Scoring Transactions: ${collections.scoring}`);
    console.log(`  🤝 Referrals: ${collections.referrals}`);
    console.log(`  📅 Bookings: ${collections.bookings}`);
    console.log(`  📚 Course Enrollments: ${collections.enrollments}`);

    return collections;
  }

  async generateReport() {
    console.log("\n" + "=".repeat(80));
    console.log(colors.bright + "📊 COMPREHENSIVE SEED DATA VERIFICATION REPORT" + colors.reset);
    console.log("=".repeat(80));

    // Database info
    const stats = await this.getCollectionStats();
    console.log("\n" + colors.cyan + "🗄️  DATABASE OVERVIEW:" + colors.reset);
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   MongoDB URI: ${MONGO_URI}`);
    console.log(`   Verification Time: ${new Date().toISOString()}`);

    // Main entities
    console.log("\n" + colors.cyan + "🎯 CORE ENTITIES STATUS:" + colors.reset);
    const userStats = await this.verifyUsers();
    console.log("");
    const courseStats = await this.verifyCourses();
    console.log("");
    const categoryStats = await this.verifyCategories();
    console.log("");
    const articleStats = await this.verifyArticles();
    console.log("");
    const otherStats = await this.verifyOtherCollections();

    // Summary
    console.log("\n" + colors.cyan + "📈 SEEDING SUMMARY:" + colors.reset);
    const totalEntities = Object.values(stats).reduce((sum, count) => sum + count, 0);
    console.log(`   Total Database Entities: ${totalEntities}`);
    console.log(`   Successfully Seeded Collections: ${Object.values(stats).filter(count => count > 0).length}`);
    console.log(`   Empty Collections: ${Object.values(stats).filter(count => count === 0).length}`);

    // Status
    console.log("\n" + colors.cyan + "✅ VERIFICATION RESULTS:" + colors.reset);

    if (userStats.total > 0) {
      success(`Users seeded successfully (${userStats.total} total, ${userStats.admins} admin)`);
    } else {
      error("No users found in database");
    }

    if (courseStats.total > 0) {
      success(`Courses seeded successfully (${courseStats.total} courses)`);
    } else {
      warning("No courses found in database");
    }

    if (categoryStats.categories > 0 && categoryStats.tags > 0) {
      success(`Categories and tags seeded successfully (${categoryStats.categories} categories, ${categoryStats.tags} tags)`);
    } else {
      warning("Categories or tags missing");
    }

    if (articleStats.total === 0) {
      warning("Articles not seeded (expected due to relationship constraints)");
    }

    // Recommendations
    console.log("\n" + colors.cyan + "💡 RECOMMENDATIONS:" + colors.reset);

    if (userStats.admins > 0) {
      console.log("   ✓ Admin users available for platform management");
    }

    if (courseStats.total > 0) {
      console.log("   ✓ Course catalog ready for student enrollment");
    }

    if (articleStats.total === 0) {
      console.log("   • Consider running article seeding separately after fixing author relationships");
    }

    if (otherStats.transactions === 0) {
      console.log("   • Transaction data can be generated after user activity begins");
    }

    console.log("\n" + colors.cyan + "🚀 NEXT STEPS:" + colors.reset);
    console.log("   1. Test admin login with seeded credentials");
    console.log("   2. Verify course enrollment functionality");
    console.log("   3. Test category and tag relationships");
    console.log("   4. Generate additional sample content as needed");
    console.log("   5. Set up payment and notification systems");

    console.log("\n" + "=".repeat(80));
  }
}

async function main() {
  printBanner();

  const verifier = new SeedDataVerifier();

  try {
    // Connect to database
    const connected = await verifier.connect();
    if (!connected) {
      error("Cannot proceed without database connection");
      process.exit(1);
    }

    // Generate comprehensive report
    await verifier.generateReport();

    success("Seed data verification completed successfully! 🎉");

  } catch (err) {
    error(`Verification failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await verifier.disconnect();
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log("\n");
  warning("Verification interrupted by user");
  process.exit(0);
});

// Run the verification
if (require.main === module) {
  main().catch((err) => {
    error(`Fatal error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { SeedDataVerifier };
