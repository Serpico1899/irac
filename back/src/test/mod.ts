import { coreApp } from "../../mod.ts";
import { object, string, optional } from "@deps";

// Simple test function to check what models are available
const testModelsFn = async (body: any) => {
  try {
    // Get all available models
    const models = Object.keys(coreApp.acts.getAtcsWithServices());

    // Get database collections
    const collections = await coreApp.odm.db.listCollections().toArray();

    // Test direct database access
    const userLevelCollection = coreApp.odm.db.collection("user_level");
    const userLevels = await userLevelCollection.find({}).limit(5).toArray();

    const scoringTransactionCollection = coreApp.odm.db.collection("scoring_transaction");
    const scoringTransactions = await scoringTransactionCollection.find({}).limit(5).toArray();

    return {
      success: true,
      body: {
        available_models: models,
        database_collections: collections.map(col => col.name),
        test_data: {
          user_levels_count: userLevels.length,
          scoring_transactions_count: scoringTransactions.length,
          sample_user_level: userLevels[0] || null,
          sample_scoring_transaction: scoringTransactions[0] || null
        }
      },
      message: "Model test completed successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: "Error testing models",
      error: error.message,
      stack: error.stack
    };
  }
};

// Direct scoring test without schema validation
const testScoringDirectFn = async (body: any) => {
  try {
    const { user_id } = body.details.set;
    const testUserId = user_id || "test_user_123";

    // Direct database access to test scoring
    const userLevelCollection = coreApp.odm.db.collection("user_level");

    // Try to find or create a test user level
    let userLevel = await userLevelCollection.findOne({
      "user._id": coreApp.odm.ObjectId(testUserId)
    });

    if (!userLevel) {
      // Create a test user level
      const newUserLevel = {
        _id: coreApp.odm.ObjectId(),
        user: { _id: coreApp.odm.ObjectId(testUserId) },
        current_points: 100,
        total_lifetime_points: 100,
        level: 1,
        status: "active",
        achievements: ["first_test"],
        achievement_count: 1,
        points_to_next_level: 400,
        level_progress_percentage: 20,
        total_purchases: 0,
        total_courses_completed: 0,
        total_referrals: 0,
        total_logins: 1,
        daily_login_streak: 1,
        max_daily_login_streak: 1,
        points_from_purchases: 0,
        points_from_courses: 0,
        points_from_referrals: 0,
        points_from_activities: 100,
        points_from_bonuses: 0,
        total_penalties: 0,
        points_lost_penalties: 0,
        current_multiplier: 1.0,
        is_frozen: false,
        manual_adjustments: 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      await userLevelCollection.insertOne(newUserLevel);
      userLevel = newUserLevel;
    }

    return {
      success: true,
      body: {
        user_score: {
          user_id: testUserId,
          current_points: userLevel.current_points,
          total_lifetime_points: userLevel.total_lifetime_points,
          level: userLevel.level,
          status: userLevel.status
        },
        level_progress: {
          points_to_next_level: userLevel.points_to_next_level,
          progress_percentage: userLevel.level_progress_percentage,
          current_level: userLevel.level,
          next_level: userLevel.level + 1
        },
        achievements: {
          earned: userLevel.achievements,
          count: userLevel.achievement_count
        }
      },
      message: "Direct scoring test completed successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: "Error in direct scoring test",
      error: error.message,
      stack: error.stack
    };
  }
};

// Simple validator for test endpoints
const testValidator = () => {
  return {
    set: object({
      user_id: optional(string()),
    }),
    get: object({}),
  };
};

export const testSetup = () => {
  // Test models availability
  coreApp.acts.setAct({
    schema: "user", // Use user schema since we know it works
    actName: "testModels",
    validator: testValidator(),
    fn: testModelsFn,
  });

  // Test scoring directly
  coreApp.acts.setAct({
    schema: "user", // Use user schema since we know it works
    actName: "testScoringDirect",
    validator: testValidator(),
    fn: testScoringDirectFn,
  });
};
