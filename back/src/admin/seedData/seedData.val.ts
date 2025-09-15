import {
  boolean,
  defaulted,
  enums,
  object,
  optional,
  string,
} from "@deps";

export const seedDataValidator = () => {
  return object({
    set: object({
      // Core seeding options
      clear_existing: defaulted(boolean(), false),
      force_reseed: defaulted(boolean(), false),
      test_mode: defaulted(boolean(), false),

      // Data type inclusion flags
      include_transactions: defaulted(boolean(), true),
      include_scoring: defaulted(boolean(), true),
      include_referrals: defaulted(boolean(), true),
      include_bookings: defaulted(boolean(), true),
      include_products: defaulted(boolean(), true),

      // Seeding scope options
      seed_scope: defaulted(
        enums([
          "all",           // Seed everything
          "foundation",    // Only users, categories, tags
          "content",       // Foundation + courses, articles
          "commerce",      // Content + products, orders
          "engagement",    // Commerce + scoring, referrals
          "complete"       // Everything including bookings
        ]),
        "complete"
      ),

      // Data volume controls
      user_count: defaulted(object({
        admin_users: defaulted(string(), "2"),
        regular_users: defaulted(string(), "10")
      }), {}),

      content_limits: defaulted(object({
        courses: defaulted(string(), "10"),
        articles: defaulted(string(), "15"),
        products: defaulted(string(), "50")
      }), {}),

      // Quality controls
      create_realistic_data: defaulted(boolean(), true),
      set_random_timestamps: defaulted(boolean(), true),
      generate_sample_relationships: defaulted(boolean(), true),

      // Performance options
      batch_size: defaulted(string(), "10"),
      delay_between_batches: defaulted(string(), "100"), // ms

      // Environment safety
      environment_check: defaulted(boolean(), true),
      require_confirmation: defaulted(boolean(), false),

      // Advanced options
      custom_seed: optional(string()), // JSON string for custom seed data
      preserve_existing: defaulted(boolean(), false), // Don't overwrite existing data
      dry_run: defaulted(boolean(), false), // Preview what would be created

      // Specific entity controls
      entity_config: defaulted(object({
        users: defaulted(object({
          create_admin: defaulted(boolean(), true),
          create_regular: defaulted(boolean(), true),
          verify_all: defaulted(boolean(), true)
        }), {}),

        courses: defaulted(object({
          set_featured: defaulted(boolean(), true),
          generate_syllabi: defaulted(boolean(), true),
          create_enrollments: defaulted(boolean(), true)
        }), {}),

        products: defaulted(object({
          set_featured: defaulted(boolean(), true),
          set_bestsellers: defaulted(boolean(), true),
          create_reviews: defaulted(boolean(), true)
        }), {}),

        scoring: defaulted(object({
          award_achievement: defaulted(boolean(), true),
          calculate_levels: defaulted(boolean(), true),
          create_leaderboard: defaulted(boolean(), true)
        }), {}),

        bookings: defaulted(object({
          create_future: defaulted(boolean(), true),
          create_past: defaulted(boolean(), true),
          vary_status: defaulted(boolean(), true)
        }), {})
      }), {}),

      // Output options
      verbose_output: defaulted(boolean(), false),
      return_created_ids: defaulted(boolean(), false),
      generate_report: defaulted(boolean(), true)
    }),

    get: defaulted(object({
      // Standard fields that might be requested in response
      summary: defaulted(string(), "1"),
      results: defaulted(string(), "1"),
      created_entities: defaulted(string(), "1"),
      statistics: defaulted(string(), "1"),
      performance_metrics: defaulted(string(), "1"),
      error_details: defaulted(string(), "1")
    }), {})
  });
};
