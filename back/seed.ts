#!/usr/bin/env deno run --allow-all

/**
 * IRAC Database Seeding Script
 *
 * Standalone script to seed the database with comprehensive demo data
 * Can be run directly or via deno task seed
 *
 * Usage:
 *   deno run --allow-all seed.ts
 *   deno task seed
 *
 * Docker usage:
 *   docker compose exec backend deno run --allow-all seed.ts
 */

import { MongoClient } from "@deps";
import { MasterDataSeeder } from "./utils/seedData.ts";

// Configuration
const MONGO_URI = Deno.env.get("MONGO_URI") || "mongodb://127.0.0.1:27017/";
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

// Logging functions
function log(message: string, color = colors.green) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function error(message: string) {
  log(`❌ ERROR: ${message}`, colors.red);
}

function success(message: string) {
  log(`✅ ${message}`, colors.green);
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Banner
function printBanner() {
  console.clear();
  console.log(colors.magenta + `
██╗██████╗  █████╗  ██████╗    ███████╗███████╗███████╗██████╗ ███████╗██████╗
██║██╔══██╗██╔══██╗██╔════╝    ██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗
██║██████╔╝███████║██║         ███████╗█████╗  █████╗  ██║  ██║█████╗  ██████╔╝
██║██╔══██╗██╔══██║██║         ╚════██║██╔══╝  ██╔══╝  ██║  ██║██╔══╝  ██╔══██╗
██║██║  ██║██║  ██║╚██████╗    ███████║███████╗███████╗██████╔╝███████╗██║  ██║
╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚══════╝╚══════╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝
` + colors.reset);

  console.log(colors.cyan + "IRAC Platform Database Seeder" + colors.reset);
  console.log(colors.cyan + "Comprehensive demo data setup for development and testing" + colors.reset);
  console.log("");
}

// Database connection test
async function testConnection() {
  info("Testing database connection...");

  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    await client.db(DB_NAME).admin().ping();
    await client.close();
    success("Database connection successful!");
    return true;
  } catch (err) {
    error(`Database connection failed: ${err.message}`);
    return false;
  }
}

// Check if database already has data
async function checkExistingData() {
  info("Checking for existing data...");

  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    const collections = ['users', 'products', 'courses', 'articles', 'categories'];
    const counts: { [key: string]: number } = {};

    for (const collection of collections) {
      counts[collection] = await db.collection(collection).countDocuments();
    }

    await client.close();

    const totalDocuments = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (totalDocuments > 0) {
      warning("Database already contains data:");
      for (const [collection, count] of Object.entries(counts)) {
        if (count > 0) {
          console.log(`  - ${collection}: ${count} documents`);
        }
      }
      console.log("");

      const proceed = confirm("Do you want to proceed with seeding? (This may create duplicates)");
      return proceed;
    } else {
      success("Database is empty - ready for seeding");
      return true;
    }
  } catch (err) {
    warning(`Could not check existing data: ${err.message}`);
    return true; // Proceed anyway
  }
}

// Main seeding function
async function seedDatabase() {
  const startTime = Date.now();

  info("Starting comprehensive database seeding...");
  console.log("");

  try {
    // Initialize database connection for seeder
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    // Use the comprehensive seeding function
    info("🌱 Starting comprehensive database seeding...");
    const seedResults = await MasterDataSeeder.seedAll();

    if (seedResults.success) {
      success("🎉 Database seeding completed successfully!");
      const duration = (Date.now() - startTime) / 1000;
      info(`Total duration: ${duration.toFixed(2)} seconds`);

      console.log("");
      console.log(colors.cyan + "📊 SEEDING SUMMARY:" + colors.reset);
      console.log(`  📊 Total entities: ${seedResults.created} created`);
      console.log(`  ❌ Total errors: ${seedResults.errors}`);

      if (seedResults.data) {
        const results = seedResults.data as any;
        console.log(`  👥 Users: ${results.users.created} created, ${results.users.errors} errors`);
        console.log(`  🏷️  Categories & Tags: ${results.categories.created} created, ${results.categories.errors} errors`);
        console.log(`  📚 Courses: ${results.courses.created} created, ${results.courses.errors} errors`);
        console.log(`  📰 Articles: ${results.articles.created} created, ${results.articles.errors} errors`);
        console.log(`  💰 Transactions: ${results.transactions.created} created, ${results.transactions.errors} errors`);
        console.log(`  🏆 Scoring Data: ${results.scoring.created} created, ${results.scoring.errors} errors`);
        console.log(`  🤝 Referrals: ${results.referrals.created} created, ${results.referrals.errors} errors`);
        console.log(`  📅 Bookings: ${results.bookings.created} created, ${results.bookings.errors} errors`);
      }
      console.log("");
    } else {
      error(`Database seeding failed: ${seedResults.error}`);
      console.log("");
      Deno.exit(1);
    }

    // Next steps
    console.log(colors.yellow + "🚀 NEXT STEPS:" + colors.reset);
    console.log("  • Frontend: http://localhost:3000");
    console.log("  • Backend API: http://localhost:1405");
    console.log("  • API Playground: http://localhost:1405/playground");
    console.log("  • Check the admin user credentials in the seeding output above");
    console.log("");

  } catch (err) {
    error(`Seeding failed: ${err.message}`);
    console.error(err.stack);
    Deno.exit(1);
  }
}

// Cleanup function for interrupted seeding
async function cleanup() {
  info("Cleaning up...");
  // Add any cleanup logic here if needed
}

// Handle interruption (Ctrl+C)
Deno.addSignalListener("SIGINT", () => {
  console.log("");
  warning("Seeding interrupted by user");
  cleanup().finally(() => {
    Deno.exit(0);
  });
});

// Alternative seeding function for specific components
async function seedSpecific(component: string) {
  info(`Seeding specific component: ${component}`);

  switch (component.toLowerCase()) {
    case 'users':
      const userResults = await MasterDataSeeder.seedUsers();
      if (userResults.success) {
        success(`Users seeded: ${userResults.created} created, ${userResults.errors} errors`);
      } else {
        error(`Users seeding failed: ${userResults.error}`);
      }
      break;

    case 'categories':
    case 'tags':
      const categoryResults = await MasterDataSeeder.seedCategoriesAndTags();
      if (categoryResults.success) {
        success(`Categories & Tags seeded: ${categoryResults.created} created, ${categoryResults.errors} errors`);
      } else {
        error(`Categories & Tags seeding failed: ${categoryResults.error}`);
      }
      break;

    case 'courses':
      const courseResults = await MasterDataSeeder.seedCourses();
      if (courseResults.success) {
        success(`Courses seeded: ${courseResults.created} created, ${courseResults.errors} errors`);
      } else {
        error(`Courses seeding failed: ${courseResults.error}`);
      }
      break;

    case 'articles':
      const articleResults = await MasterDataSeeder.seedArticles();
      if (articleResults.success) {
        success(`Articles seeded: ${articleResults.created} created, ${articleResults.errors} errors`);
      } else {
        error(`Articles seeding failed: ${articleResults.error}`);
      }
      break;

    case 'bookings':
      const bookingResults = await MasterDataSeeder.seedBookings();
      if (bookingResults.success) {
        success(`Bookings seeded: ${bookingResults.created} created, ${bookingResults.errors} errors`);
      } else {
        error(`Bookings seeding failed: ${bookingResults.error}`);
      }
      break;

    case 'all':
      await seedDatabase();
      return;

    default:
      error(`Unknown component: ${component}`);
      console.log("Available components: users, categories, tags, courses, articles, bookings, all");
      Deno.exit(1);
  }
}

// Main execution
async function main() {
  printBanner();

  // Parse command line arguments
  const args = Deno.args;
  const specificComponent = args[0];

  // Test database connection
  if (!(await testConnection())) {
    error("Cannot proceed without database connection");
    console.log("");
    console.log("🔧 TROUBLESHOOTING:");
    console.log("  1. Ensure MongoDB is running");
    console.log("  2. Check MONGO_URI environment variable");
    console.log("  3. For Docker: ensure containers are running");
    console.log("");
    Deno.exit(1);
  }

  // Check for existing data
  if (!(await checkExistingData())) {
    info("Seeding cancelled by user");
    Deno.exit(0);
  }

  // Execute seeding
  if (specificComponent) {
    await seedSpecific(specificComponent);
  } else {
    await seedDatabase();
  }

  success("Seeding process completed! 🎉");
}

// Run main function
if (import.meta.main) {
  main().catch((err) => {
    error(`Fatal error: ${err.message}`);
    console.error(err.stack);
    Deno.exit(1);
  });
}
