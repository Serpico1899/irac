import { ActFn } from "@deps";
import { masterSeeder } from "@lib";

export const seedDataFn: ActFn = async (body) => {
  try {
    const {
      clear_existing = false,
      force_reseed = false,
      test_mode = false,
      include_transactions = true,
      include_scoring = true,
      include_referrals = true,
      include_bookings = true,
      include_products = true,
      seed_scope = "complete",
      user_count = { admin_users: "2", regular_users: "10" },
      content_limits = { courses: "10", articles: "15", products: "50" },
      create_realistic_data = true,
      set_random_timestamps = true,
      generate_sample_relationships = true,
      batch_size = "10",
      delay_between_batches = "100",
      environment_check = true,
      require_confirmation = false,
      custom_seed,
      preserve_existing = false,
      dry_run = false,
      entity_config = {},
      verbose_output = false,
      return_created_ids = false,
      generate_report = true
    } = body.details.set;

    const userId = body.user?._id;
    const userLevel = body.user?.level;

    // Security check: Only managers can seed data
    if (userLevel !== "Manager") {
      return {
        success: false,
        message: "Access denied. Only managers can perform data seeding operations.",
        details: {
          required_level: "Manager",
          user_level: userLevel,
          user_id: userId
        }
      };
    }

    // Environment safety check
    if (environment_check) {
      const nodeEnv = Deno.env.get("NODE_ENV") || "development";
      if (nodeEnv === "production" && !force_reseed) {
        return {
          success: false,
          message: "Seeding in production environment requires force_reseed=true for safety",
          details: {
            environment: nodeEnv,
            safety_warning: "This operation will modify production data",
            required_flag: "force_reseed=true"
          }
        };
      }
    }

    // Dry run mode - preview what would be created
    if (dry_run) {
      const preview = {
        scope: seed_scope,
        estimated_entities: {
          users: parseInt(user_count.admin_users || "2") + parseInt(user_count.regular_users || "10"),
          courses: seed_scope !== "foundation" ? parseInt(content_limits.courses || "10") : 0,
          articles: seed_scope !== "foundation" ? parseInt(content_limits.articles || "15") : 0,
          products: include_products && seed_scope !== "foundation" && seed_scope !== "content" ? parseInt(content_limits.products || "50") : 0,
          categories: 6,
          tags: 10
        },
        operations: {
          clear_existing,
          include_transactions,
          include_scoring,
          include_referrals,
          include_bookings
        },
        warnings: []
      };

      if (clear_existing) {
        preview.warnings.push("⚠️  All existing data will be cleared");
      }
      if (environment_check && Deno.env.get("NODE_ENV") === "production") {
        preview.warnings.push("⚠️  Running in production environment");
      }

      return {
        success: true,
        body: {
          dry_run: true,
          preview,
          message: "Dry run completed. Use dry_run=false to execute seeding."
        }
      };
    }

    console.log(`\n🌱 IRAC Data Seeding Started`);
    console.log(`👤 Initiated by: ${body.user?.email || 'Unknown'} (${userLevel})`);
    console.log(`🎯 Scope: ${seed_scope}`);
    console.log(`⚙️  Options: clear=${clear_existing}, force=${force_reseed}, test=${test_mode}`);
    console.log(`📊 Environment: ${Deno.env.get("NODE_ENV") || "development"}`);

    // Prepare seeding options based on scope
    let seedingOptions = {
      clearExisting: clear_existing,
      includeTransactions: false,
      includeScoring: false,
      includeReferrals: false,
      includeBookings: false
    };

    switch (seed_scope) {
      case "foundation":
        // Only users, categories, tags
        break;
      case "content":
        // Foundation + courses, articles
        break;
      case "commerce":
        // Content + products, orders
        seedingOptions.includeTransactions = include_transactions;
        break;
      case "engagement":
        // Commerce + scoring, referrals
        seedingOptions.includeTransactions = include_transactions;
        seedingOptions.includeScoring = include_scoring;
        seedingOptions.includeReferrals = include_referrals;
        break;
      case "complete":
      case "all":
        // Everything
        seedingOptions.includeTransactions = include_transactions;
        seedingOptions.includeScoring = include_scoring;
        seedingOptions.includeReferrals = include_referrals;
        seedingOptions.includeBookings = include_bookings;
        break;
    }

    // Execute seeding
    const startTime = Date.now();
    console.log(`\n🚀 Executing seeding with scope: ${seed_scope}...`);

    const result = await masterSeeder.seedAll(seedingOptions);

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!result.success) {
      console.error(`❌ Seeding failed:`, result.error);
      return {
        success: false,
        message: "Data seeding failed",
        details: {
          error: result.error,
          scope: seed_scope,
          options: seedingOptions,
          duration_ms: duration,
          user_id: userId
        }
      };
    }

    // Generate comprehensive response
    const response: any = {
      success: true,
      body: {
        seeding_completed: true,
        scope: seed_scope,
        summary: result.data.summary,
        execution_info: {
          initiated_by: {
            user_id: userId,
            email: body.user?.email,
            level: userLevel
          },
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date(endTime).toISOString(),
          duration_ms: duration,
          duration_formatted: `${Math.round(duration / 1000)}s`,
          environment: Deno.env.get("NODE_ENV") || "development"
        },
        options_used: {
          clear_existing,
          force_reseed,
          test_mode,
          seed_scope,
          ...seedingOptions
        }
      },
      message: `Data seeding completed successfully! Created ${result.data.summary.total_entities} entities in ${Math.round(duration / 1000)} seconds.`
    };

    // Add detailed results if requested
    if (generate_report) {
      response.body.detailed_results = {
        users: {
          success: result.data.users?.success || false,
          count: result.data.users?.data?.length || 0,
          details: verbose_output ? result.data.users : undefined
        },
        categories_and_tags: {
          success: result.data.categories?.success || false,
          categories_count: result.data.categories?.data?.categories?.length || 0,
          tags_count: result.data.categories?.data?.tags?.length || 0,
          details: verbose_output ? result.data.categories : undefined
        },
        courses: {
          success: result.data.courses?.success || false,
          count: result.data.courses?.data?.length || 0,
          details: verbose_output ? result.data.courses : undefined
        },
        articles: {
          success: result.data.articles?.success || false,
          count: result.data.articles?.data?.length || 0,
          details: verbose_output ? result.data.articles : undefined
        },
        products: {
          success: result.data.products?.success || false,
          count: result.data.products?.details?.success_count || 0,
          details: verbose_output ? result.data.products : undefined
        },
        transactions: seedingOptions.includeTransactions ? {
          success: result.data.transactions?.success || false,
          orders_count: result.data.transactions?.data?.orders?.length || 0,
          wallet_transactions_count: result.data.transactions?.data?.walletTransactions?.length || 0,
          details: verbose_output ? result.data.transactions : undefined
        } : null,
        scoring: seedingOptions.includeScoring ? {
          success: result.data.scoring?.success || false,
          transactions_count: result.data.scoring?.data?.scoringTransactions?.length || 0,
          user_levels_count: result.data.scoring?.data?.userLevels?.length || 0,
          details: verbose_output ? result.data.scoring : undefined
        } : null,
        referrals: seedingOptions.includeReferrals ? {
          success: result.data.referrals?.success || false,
          count: result.data.referrals?.data?.length || 0,
          details: verbose_output ? result.data.referrals : undefined
        } : null,
        bookings: seedingOptions.includeBookings ? {
          success: result.data.bookings?.success || false,
          count: result.data.bookings?.data?.length || 0,
          details: verbose_output ? result.data.bookings : undefined
        } : null
      };
    }

    // Add performance metrics
    response.body.performance = {
      total_duration_ms: duration,
      entities_per_second: Math.round(result.data.summary.total_entities / (duration / 1000)),
      memory_usage: Deno.memoryUsage ? Deno.memoryUsage() : "unavailable",
      success_rate: Math.round((result.data.summary.success_count / (result.data.summary.success_count + result.data.summary.error_count)) * 100)
    };

    // Add recommendations for next steps
    response.body.recommendations = [];
    if (result.data.summary.error_count > 0) {
      response.body.recommendations.push("Some entities failed to create. Check logs for details.");
    }
    if (seed_scope === "foundation") {
      response.body.recommendations.push("Consider running with scope='complete' to create full dataset including transactions and user engagement data.");
    }
    if (!include_scoring && seed_scope === "complete") {
      response.body.recommendations.push("Enable scoring system to create user levels and achievements for better testing.");
    }

    // Add next actions
    response.body.next_actions = {
      verify_data: "Check admin dashboard to verify created data",
      test_apis: "Test API endpoints with newly created data",
      check_frontend: "Verify frontend displays seeded content correctly",
      monitor_performance: "Monitor system performance with new data volume"
    };

    // Final success log
    console.log(`\n✅ SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`📊 Total entities: ${result.data.summary.total_entities}`);
    console.log(`⏱️  Duration: ${Math.round(duration / 1000)}s`);
    console.log(`🎯 Success rate: ${Math.round((result.data.summary.success_count / (result.data.summary.success_count + result.data.summary.error_count)) * 100)}%`);

    return response;

  } catch (error) {
    console.error("Critical error in seedData function:", error);
    return {
      success: false,
      message: "Critical error during data seeding",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        timestamp: new Date().toISOString(),
        function: "seedDataFn"
      }
    };
  }
};
