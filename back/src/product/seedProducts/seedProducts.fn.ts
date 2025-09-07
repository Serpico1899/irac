import { ActFn } from "@deps";
import { productSeeder } from "../seedProducts.ts";

export const seedProductsFn: ActFn = async (body) => {
  try {
    const {
      clear_existing = false,
      limit,
      categories,
      set_featured = true,
      set_bestsellers = true,
      force_reseed = false,
      test_mode = false,
    } = body.details.set;

    const userId = body.user?._id;

    // Check if products already exist and force_reseed is false
    const stats = await productSeeder.getStats();
    if (stats.success && stats.data.totals.total > 0 && !force_reseed && !clear_existing) {
      return {
        success: false,
        message: "Products already exist. Use force_reseed=true or clear_existing=true to proceed.",
        details: {
          existing_products: stats.data.totals.total,
          stats: stats.data,
          suggestion: "Set force_reseed=true or clear_existing=true to proceed with seeding",
        },
      };
    }

    const results = {
      seed_result: null,
      featured_result: null,
      bestseller_result: null,
      final_stats: null,
    };

    // Step 1: Seed products
    console.log("🌱 Starting product seeding...");
    results.seed_result = await productSeeder.seedProducts(clear_existing);

    if (!results.seed_result.success) {
      return {
        success: false,
        message: "Failed to seed products",
        details: results.seed_result,
      };
    }

    // Step 2: Set featured products if requested
    if (set_featured) {
      console.log("⭐ Setting featured products...");
      results.featured_result = await productSeeder.seedFeaturedProducts();
    }

    // Step 3: Set bestseller products if requested
    if (set_bestsellers) {
      console.log("🏆 Setting bestseller products...");
      results.bestseller_result = await productSeeder.seedBestsellerProducts();
    }

    // Step 4: Get final statistics
    console.log("📊 Getting final statistics...");
    results.final_stats = await productSeeder.getStats();

    return {
      success: true,
      body: {
        message: "Product seeding completed successfully",
        summary: {
          products_created: results.seed_result.details?.success_count || 0,
          products_failed: results.seed_result.details?.error_count || 0,
          total_processed: results.seed_result.details?.total_processed || 0,
          clear_existing_used: clear_existing,
          featured_products_set: set_featured && results.featured_result?.success,
          bestseller_products_set: set_bestsellers && results.bestseller_result?.success,
        },
        results: {
          seed: results.seed_result,
          featured: results.featured_result,
          bestseller: results.bestseller_result,
          stats: results.final_stats?.data,
        },
        meta: {
          seeded_at: new Date().toISOString(),
          seeded_by: userId,
          test_mode,
          categories_filter: categories,
          limit_applied: limit,
        },
      },
    };
  } catch (error) {
    console.error("Error in seedProducts function:", error);
    return {
      success: false,
      message: "Internal server error while seeding products",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
      },
    };
  }
};
