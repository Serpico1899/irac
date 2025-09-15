// Model Registration Fix for Lesan Framework
import { lesan, MongoClient } from "./deps.ts";

// Import all models properly
import {
  articles,
  bookings,
  categories,
  courses,
  files,
  order_models,
  product_models,
  referrals,
  scoring_transactions,
  space_availabilities,
  tags,
  user_levels,
  users,
  wallets,
  wallet_transactions,
} from "./models/mod.ts";

export async function validateModels() {
  console.log("🔍 Validating Model Registration...");

  const coreApp = lesan();
  const MONGO_URI = Deno.env.get("MONGO_URI") || "mongodb://127.0.0.1:27017/";

  try {
    const client = await new MongoClient(MONGO_URI).connect();
    const db = client.db("nejat");
    coreApp.odm.setDb(db);

    // Initialize all models
    const modelInstances = {
      user: users(),
      file: files(),
      tag: tags(),
      category: categories(),
      article: articles(),
      course: courses(),
      wallet: wallets(),
      wallet_transaction: wallet_transactions(),
      order: order_models(),
      product: product_models(),
      scoring_transaction: scoring_transactions(),
      user_level: user_levels(),
      referral: referrals(),
      booking: bookings(),
      space_availability: space_availabilities(),
    };

    console.log("✅ All models registered successfully:");
    Object.keys(modelInstances).forEach(key => {
      console.log(`   • ${key}: ✓`);
    });

    return { success: true, models: modelInstances };
  } catch (error) {
    console.error("❌ Model validation failed:", error);
    return { success: false, error: error.message };
  }
}

if (import.meta.main) {
  validateModels();
}
