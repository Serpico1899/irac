import { coreApp } from "@app";
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

const directGetCoursesFn = async (body: any) => {
  try {
    const { limit = 10, skip = 0 } = body.details.set || {};
    const result = await DirectQueryService.getCourses(limit, skip);
    return {
      success: result.success,
      body: result.data,
      message: result.success ? "Courses retrieved" : result.error
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

const directGetArticlesFn = async (body: any) => {
  try {
    const { limit = 10, skip = 0 } = body.details.set || {};
    const result = await DirectQueryService.getArticles(limit, skip);
    return {
      success: result.success,
      body: result.data,
      message: result.success ? "Articles retrieved" : result.error
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

const directGetCourseFn = async (body: any) => {
  try {
    const { course_id } = body.details.set;
    if (!course_id) {
      return {
        success: false,
        message: "Course ID required"
      };
    }

    const result = await DirectQueryService.getCourse(course_id);
    return {
      success: result.success,
      body: result.data,
      message: result.success ? "Course retrieved" : result.error
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

const directGetArticleFn = async (body: any) => {
  try {
    const { article_id } = body.details.set;
    if (!article_id) {
      return {
        success: false,
        message: "Article ID required"
      };
    }

    const result = await DirectQueryService.getArticle(article_id);
    return {
      success: result.success,
      body: result.data,
      message: result.success ? "Article retrieved" : result.error
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

const coursesValidator = () => ({
  set: object({
    limit: optional(string()),
    skip: optional(string()),
  }),
  get: object({}),
});

const courseValidator = () => ({
  set: object({
    course_id: string(),
  }),
  get: object({}),
});

const articlesValidator = () => ({
  set: object({
    limit: optional(string()),
    skip: optional(string()),
  }),
  get: object({}),
});

const articleValidator = () => ({
  set: object({
    article_id: string(),
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

  // Course endpoints
  coreApp.acts.setAct({
    schema: "course",
    actName: "directGetCourses",
    validator: coursesValidator(),
    fn: directGetCoursesFn,
  });

  coreApp.acts.setAct({
    schema: "course",
    actName: "directGetCourse",
    validator: courseValidator(),
    fn: directGetCourseFn,
  });

  // Article endpoints
  coreApp.acts.setAct({
    schema: "article",
    actName: "directGetArticles",
    validator: articlesValidator(),
    fn: directGetArticlesFn,
  });

  coreApp.acts.setAct({
    schema: "article",
    actName: "directGetArticle",
    validator: articleValidator(),
    fn: directGetArticleFn,
  });

  console.log("✅ Direct API endpoints registered");
};
