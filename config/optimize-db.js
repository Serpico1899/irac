// IRAC Database Optimization Script
print("Starting IRAC database optimization...");

// Switch to IRAC database
use irac_production;

// Create indexes for better query performance
print("Creating database indexes...");

// User collection indexes
try {
    db.users.createIndex({ "set.mobile": 1 }, { unique: true, sparse: true });
    db.users.createIndex({ "set.nationalNumber": 1 }, { unique: true, sparse: true });
    db.users.createIndex({ "set.email": 1 }, { sparse: true });
    db.users.createIndex({ "set.createdAt": -1 });
    db.users.createIndex({ "set.level": 1 });
    print("✅ User indexes created");
} catch(e) {
    print("⚠️ User indexes: " + e.message);
}

// Course collection indexes
try {
    db.courses.createIndex({ "set.title": "text", "set.description": "text" });
    db.courses.createIndex({ "set.category": 1 });
    db.courses.createIndex({ "set.price": 1 });
    db.courses.createIndex({ "set.createdAt": -1 });
    db.courses.createIndex({ "set.isActive": 1 });
    print("✅ Course indexes created");
} catch(e) {
    print("⚠️ Course indexes: " + e.message);
}

// Article collection indexes
try {
    db.articles.createIndex({ "set.title": "text", "set.content": "text" });
    db.articles.createIndex({ "set.category": 1 });
    db.articles.createIndex({ "set.tags": 1 });
    db.articles.createIndex({ "set.createdAt": -1 });
    db.articles.createIndex({ "set.isPublished": 1 });
    print("✅ Article indexes created");
} catch(e) {
    print("⚠️ Article indexes: " + e.message);
}

// Product collection indexes
try {
    db.products.createIndex({ "set.name": "text", "set.description": "text" });
    db.products.createIndex({ "set.category": 1 });
    db.products.createIndex({ "set.price": 1 });
    db.products.createIndex({ "set.isActive": 1 });
    db.products.createIndex({ "set.createdAt": -1 });
    print("✅ Product indexes created");
} catch(e) {
    print("⚠️ Product indexes: " + e.message);
}

// Payment collection indexes
try {
    db.payments.createIndex({ "set.userId": 1 });
    db.payments.createIndex({ "set.status": 1 });
    db.payments.createIndex({ "set.createdAt": -1 });
    db.payments.createIndex({ "set.transactionId": 1 }, { unique: true, sparse: true });
    print("✅ Payment indexes created");
} catch(e) {
    print("⚠️ Payment indexes: " + e.message);
}

// Booking collection indexes
try {
    db.bookings.createIndex({ "set.userId": 1 });
    db.bookings.createIndex({ "set.date": 1 });
    db.bookings.createIndex({ "set.status": 1 });
    db.bookings.createIndex({ "set.createdAt": -1 });
    print("✅ Booking indexes created");
} catch(e) {
    print("⚠️ Booking indexes: " + e.message);
}

// Scoring transaction indexes
try {
    db.scoring_transactions.createIndex({ "set.userId": 1 });
    db.scoring_transactions.createIndex({ "set.type": 1 });
    db.scoring_transactions.createIndex({ "set.createdAt": -1 });
    print("✅ Scoring transaction indexes created");
} catch(e) {
    print("⚠️ Scoring transaction indexes: " + e.message);
}

// Wallet collection indexes
try {
    db.wallets.createIndex({ "set.userId": 1 }, { unique: true });
    db.wallets.createIndex({ "set.balance": 1 });
    print("✅ Wallet indexes created");
} catch(e) {
    print("⚠️ Wallet indexes: " + e.message);
}

// File collection indexes
try {
    db.files.createIndex({ "set.filename": 1 });
    db.files.createIndex({ "set.type": 1 });
    db.files.createIndex({ "set.createdAt": -1 });
    db.files.createIndex({ "set.size": 1 });
    print("✅ File indexes created");
} catch(e) {
    print("⚠️ File indexes: " + e.message);
}

// Referral collection indexes
try {
    db.referrals.createIndex({ "set.referrerUserId": 1 });
    db.referrals.createIndex({ "set.referredUserId": 1 });
    db.referrals.createIndex({ "set.code": 1 }, { unique: true });
    db.referrals.createIndex({ "set.createdAt": -1 });
    print("✅ Referral indexes created");
} catch(e) {
    print("⚠️ Referral indexes: " + e.message);
}

// Database statistics and optimization
print("\nDatabase Statistics:");
var stats = db.stats();
print("Collections: " + stats.collections);
print("Data size: " + Math.round(stats.dataSize / 1024 / 1024 * 100) / 100 + " MB");
print("Index size: " + Math.round(stats.indexSize / 1024 / 1024 * 100) / 100 + " MB");

// List all indexes created
print("\nIndexes created:");
var collections = db.getCollectionNames();
collections.forEach(function(collection) {
    var indexes = db.getCollection(collection).getIndexes();
    if (indexes.length > 1) { // More than just the default _id index
        print(collection + ": " + (indexes.length - 1) + " custom indexes");
    }
});

print("\n✅ Database optimization completed successfully!");
