// back/setup/create-indexes.ts
import { coreApp } from "../mod.ts";

/**
 * Define all indexes that need to exist in the database.
 * Each entry is an array of MongoDB index specs for a collection.
 *
 * Format: { key: { field: 1 }, unique?: true, ... }
 */
const indexMap: Record<string, any[]> = {
  invoice: [
    { key: { invoice_number: 1 }, unique: true },
    { key: { fiscal_year: 1, sequence_number: 1 }, unique: true },
    { key: { status: 1, due_date: 1 } },
    { key: { "customer.email": 1, issue_date: -1 } },
  ],
  coupon: [
    { key: { code: 1 }, unique: true },
    { key: { status: 1, valid_from: 1, valid_until: 1 } },
    { key: { type: 1, applicable_to: 1 } },
    { key: { created_at: -1 } },
  ],
};

export async function ensureIndexes() {
  for (const [collectionName, indexes] of Object.entries(indexMap)) {
    if (!indexes || indexes.length === 0) continue;
    try {
      await coreApp.odm.db.collection(collectionName).createIndexes(indexes);
      console.log(`✅ Indexes ensured for collection: ${collectionName}`);
    } catch (err) {
      console.error(`❌ Failed to create indexes for ${collectionName}`, err);
    }
  }
}
