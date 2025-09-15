// IRAC Database Optimization Script - MongoDB Shell Compatible
// Version: 2.0 - Direct Execution
// Purpose: Create indexes and optimize database performance
// Compatible with: mongosh (MongoDB Shell)

console.log("🚀 IRAC Database Optimization Starting...");
console.log("Database: irac_production");
console.log("Generated:", new Date().toISOString());
console.log("=" .repeat(50));

// Connect to the database
db = db.getSiblingDB('irac_production');

let indexesCreated = 0;
let indexesFailed = 0;
let totalCollections = 0;

// Function to create index with error handling
function createIndexSafe(collection, indexSpec, options = {}) {
    try {
        const result = db[collection].createIndex(indexSpec, options);
        console.log(`✅ ${collection}: Index created -`, JSON.stringify(indexSpec));
        indexesCreated++;
        return true;
    } catch (error) {
        console.log(`⚠️  ${collection}: Index failed -`, error.message);
        indexesFailed++;
        return false;
    }
}

console.log("\n📊 Creating Performance Indexes...\n");

// User collection indexes
console.log("👥 Optimizing Users Collection:");
totalCollections++;
createIndexSafe('users', { "set.mobile": 1 }, { unique: true, sparse: true });
createIndexSafe('users', { "set.nationalNumber": 1 }, { unique: true, sparse: true });
createIndexSafe('users', { "set.email": 1 }, { sparse: true });
createIndexSafe('users', { "set.createdAt": -1 });
createIndexSafe('users', { "set.level": 1 });
createIndexSafe('users', { "set.isActive": 1 });
createIndexSafe('users', { "set.mobile": 1, "set.isActive": 1 });

// Course collection indexes
console.log("\n📚 Optimizing Courses Collection:");
totalCollections++;
createIndexSafe('courses', { "set.title": "text", "set.description": "text" });
createIndexSafe('courses', { "set.category": 1 });
createIndexSafe('courses', { "set.price": 1 });
createIndexSafe('courses', { "set.createdAt": -1 });
createIndexSafe('courses', { "set.isActive": 1 });
createIndexSafe('courses', { "set.category": 1, "set.isActive": 1 });
createIndexSafe('courses', { "set.price": 1, "set.isActive": 1 });

// Article collection indexes
console.log("\n📝 Optimizing Articles Collection:");
totalCollections++;
createIndexSafe('articles', { "set.title": "text", "set.content": "text" });
createIndexSafe('articles', { "set.category": 1 });
createIndexSafe('articles', { "set.tags": 1 });
createIndexSafe('articles', { "set.createdAt": -1 });
createIndexSafe('articles', { "set.isPublished": 1 });
createIndexSafe('articles', { "set.category": 1, "set.isPublished": 1 });

// Product collection indexes
console.log("\n🛒 Optimizing Products Collection:");
totalCollections++;
createIndexSafe('products', { "set.name": "text", "set.description": "text" });
createIndexSafe('products', { "set.category": 1 });
createIndexSafe('products', { "set.price": 1 });
createIndexSafe('products', { "set.isActive": 1 });
createIndexSafe('products', { "set.createdAt": -1 });
createIndexSafe('products', { "set.category": 1, "set.isActive": 1 });

// Payment collection indexes
console.log("\n💳 Optimizing Payments Collection:");
totalCollections++;
createIndexSafe('payments', { "set.userId": 1 });
createIndexSafe('payments', { "set.status": 1 });
createIndexSafe('payments', { "set.createdAt": -1 });
createIndexSafe('payments', { "set.transactionId": 1 }, { unique: true, sparse: true });
createIndexSafe('payments', { "set.userId": 1, "set.status": 1 });
createIndexSafe('payments', { "set.userId": 1, "set.createdAt": -1 });

// Booking collection indexes
console.log("\n📅 Optimizing Bookings Collection:");
totalCollections++;
createIndexSafe('bookings', { "set.userId": 1 });
createIndexSafe('bookings', { "set.date": 1 });
createIndexSafe('bookings', { "set.status": 1 });
createIndexSafe('bookings', { "set.createdAt": -1 });
createIndexSafe('bookings', { "set.userId": 1, "set.status": 1 });
createIndexSafe('bookings', { "set.date": 1, "set.status": 1 });

// Scoring transaction indexes
console.log("\n🏆 Optimizing Scoring Transactions Collection:");
totalCollections++;
createIndexSafe('scoring_transactions', { "set.userId": 1 });
createIndexSafe('scoring_transactions', { "set.type": 1 });
createIndexSafe('scoring_transactions', { "set.createdAt": -1 });
createIndexSafe('scoring_transactions', { "set.userId": 1, "set.createdAt": -1 });

// Wallet collection indexes
console.log("\n💰 Optimizing Wallets Collection:");
totalCollections++;
createIndexSafe('wallets', { "set.userId": 1 }, { unique: true });
createIndexSafe('wallets', { "set.balance": 1 });

// File collection indexes
console.log("\n📁 Optimizing Files Collection:");
totalCollections++;
createIndexSafe('files', { "set.filename": 1 });
createIndexSafe('files', { "set.type": 1 });
createIndexSafe('files', { "set.createdAt": -1 });
createIndexSafe('files', { "set.size": 1 });
createIndexSafe('files', { "set.type": 1, "set.createdAt": -1 });

// Referral collection indexes
console.log("\n🤝 Optimizing Referrals Collection:");
totalCollections++;
createIndexSafe('referrals', { "set.referrerUserId": 1 });
createIndexSafe('referrals', { "set.referredUserId": 1 });
createIndexSafe('referrals', { "set.code": 1 }, { unique: true });
createIndexSafe('referrals', { "set.createdAt": -1 });

// Category collection indexes
console.log("\n📂 Optimizing Categories Collection:");
totalCollections++;
createIndexSafe('categories', { "set.name": 1 }, { unique: true });
createIndexSafe('categories', { "set.type": 1 });
createIndexSafe('categories', { "set.isActive": 1 });

// Tag collection indexes
console.log("\n🏷️  Optimizing Tags Collection:");
totalCollections++;
createIndexSafe('tags', { "set.name": 1 }, { unique: true });
createIndexSafe('tags', { "set.category": 1 });
createIndexSafe('tags', { "set.usageCount": -1 });

// User Level collection indexes
console.log("\n📊 Optimizing User Levels Collection:");
totalCollections++;
createIndexSafe('user_levels', { "set.level": 1 }, { unique: true });
createIndexSafe('user_levels', { "set.minPoints": 1 });

// Admin collection indexes
console.log("\n👑 Optimizing Admin Collection:");
totalCollections++;
createIndexSafe('admin', { "set.userId": 1 }, { unique: true });
createIndexSafe('admin', { "set.role": 1 });
createIndexSafe('admin', { "set.isActive": 1 });

// Database statistics
console.log("\n" + "=" .repeat(50));
console.log("📊 DATABASE STATISTICS:");

try {
    const stats = db.stats();
    console.log(`Collections: ${stats.collections}`);
    console.log(`Data Size: ${Math.round(stats.dataSize / 1024 / 1024 * 100) / 100} MB`);
    console.log(`Index Size: ${Math.round(stats.indexSize / 1024 / 1024 * 100) / 100} MB`);
    console.log(`Storage Size: ${Math.round(stats.storageSize / 1024 / 1024 * 100) / 100} MB`);
} catch (e) {
    console.log("Database statistics unavailable:", e.message);
}

// Collection-specific statistics
console.log("\n📋 COLLECTION INDEX SUMMARY:");
const collections = ['users', 'courses', 'articles', 'products', 'payments', 'bookings', 'scoring_transactions', 'wallets', 'files', 'referrals', 'categories', 'tags', 'user_levels', 'admin'];

collections.forEach(collName => {
    try {
        const indexes = db[collName].getIndexes();
        const customIndexes = indexes.filter(idx => idx.name !== '_id_').length;
        if (customIndexes > 0) {
            console.log(`  ${collName}: ${customIndexes} custom indexes`);
        }
    } catch (e) {
        console.log(`  ${collName}: Collection not found or error`);
    }
});

// Performance test
console.log("\n⚡ PERFORMANCE VALIDATION:");

try {
    // Test user query performance
    const userQueryStart = Date.now();
    const userCount = db.users.countDocuments();
    const userQueryTime = Date.now() - userQueryStart;
    console.log(`User count query: ${userQueryTime}ms (${userCount} users)`);

    // Test indexed query performance
    if (userCount > 0) {
        const indexedQueryStart = Date.now();
        const activeUsers = db.users.countDocuments({"set.isActive": true});
        const indexedQueryTime = Date.now() - indexedQueryStart;
        console.log(`Indexed active users query: ${indexedQueryTime}ms (${activeUsers} active users)`);
    }

    // Test course query performance
    const courseQueryStart = Date.now();
    const courseCount = db.courses.countDocuments();
    const courseQueryTime = Date.now() - courseQueryStart;
    console.log(`Course count query: ${courseQueryTime}ms (${courseCount} courses)`);

} catch (e) {
    console.log("Performance tests failed:", e.message);
}

// Final summary
console.log("\n" + "=" .repeat(50));
console.log("🎯 OPTIMIZATION SUMMARY:");
console.log(`✅ Indexes Created: ${indexesCreated}`);
console.log(`⚠️  Indexes Failed: ${indexesFailed}`);
console.log(`📊 Collections Optimized: ${totalCollections}`);

const successRate = Math.round((indexesCreated / (indexesCreated + indexesFailed)) * 100);
console.log(`📈 Success Rate: ${successRate}%`);

if (indexesCreated > 0) {
    console.log("\n🚀 Database optimization completed successfully!");
    console.log("💡 Your queries should now be significantly faster!");
} else {
    console.log("\n⚠️  No indexes were created. Database may already be optimized or needs manual review.");
}

console.log("\n🎉 IRAC Database Optimization Complete!");
console.log("Generated:", new Date().toISOString());
