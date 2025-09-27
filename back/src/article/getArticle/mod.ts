import {
  grantAccess,
  type MyContext,
  setTokens,
  setUser,
} from "@lib";
import {  coreApp  } from "@app";
import { getArticleFn } from "./getArticle.fn.ts";
import { getArticleValidator } from "./getArticle.val.ts";

// Increment view count when article is accessed
export const incrementViewCount = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { _id, slug, increment_views = true } = body?.details.set;

  if (!increment_views) {
    return;
  }

  try {
    // Find article by ID or slug
    const filter: any = {};
    if (_id) {
      filter._id = _id;
    } else if (slug) {
      filter.slug = slug;
    } else {
      return;
    }

    // Only increment for published articles
    filter.status = "Published";

    // Increment view count
    await coreApp.odm.db
      .collection("articles")
      .updateOne(filter, {
        $inc: { view_count: 1 }
      });

  } catch (error) {
    // Don't fail the request if view count update fails
    console.warn("Failed to increment article view count:", error);
  }
};

export const getArticleSetup = () =>
  coreApp.acts.setAct({
    schema: "article",
    actName: "getArticle",
    validationRunType: "read",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Ghost", "User", "Manager", "Admin"],
      }),
      incrementViewCount,
    ],
    validator: getArticleValidator(),
    fn: getArticleFn,
  });
