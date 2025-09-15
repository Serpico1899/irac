import { coreApp } from "../../../mod.ts";
import { DirectQueryService } from "../directQueries.ts";
import { object, string, optional } from "@deps";

// Direct API functions that bypass model registration issues

const directGetUserScoreFn = async (body: any) => {
  try {
    const { user_id } = body.details.set;
    const userId = user_id || body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User ID required"
      };
    }

    const result = await DirectQueryService.getUserScore(userId.toString());
    return {
      success: result.success,
      body: result.data,
      message: result.success ? "User score retrieved" : result.error
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

const directGetSystemStatsFn = async (body: any) => {
  try {
    const result = await DirectQueryService.getSystemStats();
    return {
      success: result.success,
      body: result.data,
      message: "System stats retrieved"
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

const simpleValidator = () => ({
  set: object({
    user_id: optional(string()),
  }),
  get: object({}),
});

export const directApiSetup = () => {
  // Use "user" schema which we know works
  coreApp.acts.setAct({
    schema: "user",
    actName: "directGetUserScore",
    validator: simpleValidator(),
    fn: directGetUserScoreFn,
  });

  coreApp.acts.setAct({
    schema: "user",
    actName: "directGetSystemStats",
    validator: simpleValidator(),
    fn: directGetSystemStatsFn,
  });

  console.log("✅ Direct API endpoints registered");
};
