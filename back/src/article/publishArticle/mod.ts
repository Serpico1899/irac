import {
  grantAccess,
  type MyContext,
  setTokens,
  setUser,
  throwError,
} from "@lib";
import {  coreApp  } from "@app";
import { publishArticleFn } from "./publishArticle.fn.ts";
import { publishArticleValidator } from "./publishArticle.val.ts";

// Validate article can be published
export const validateArticleForPublishing = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { _id } = body?.details.set;

  if (!_id) {
    throwError("شناسه مقاله الزامی است / Article ID is required");
  }

  const article = await coreApp.odm.db
    .collection("articles")
    .findOne({ _id: new coreApp.odm.ObjectId(_id) });

  if (!article) {
    throwError("مقاله یافت نشد / Article not found");
  }

  // Check if article is already published
  if (article.status === "Published") {
    throwError("این مقاله قبلاً منتشر شده است / Article is already published");
  }

  // Validate article has minimum required content
  if (!article.title || article.title.trim().length < 3) {
    throwError("مقاله باید عنوان معتبری داشته باشد / Article must have a valid title");
  }

  if (!article.content || article.content.trim().length < 50) {
    throwError("مقاله باید محتوای کافی داشته باشد / Article must have sufficient content");
  }

  // Check if article has required relations
  if (!article.author || !article.author._id) {
    throwError("مقاله باید نویسنده داشته باشد / Article must have an author");
  }

  // Validate slug exists (required for SEO)
  if (!article.slug) {
    throwError("مقاله باید نام مستعار (slug) داشته باشد / Article must have a slug");
  }

  // Store article info for the function
  body.details.set.current_article = article;
};

// Set published timestamp and last modified by
export const setPublishData = () => {
  const { user, body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  // Set published timestamp
  body.details.set.published_at = new Date();

  // Set last modified by
  if (user?.first_name && user?.last_name) {
    body.details.set.last_modified_by_name = `${user.first_name} ${user.last_name}`;
  }

  // Set status to published
  body.details.set.status = "Published";

  // Clear any scheduled publishing date
  body.details.set.scheduled_at = null;
};

// Log publish activity
export const logArticlePublish = async () => {
  const { user, body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { _id, current_article } = body?.details.set;

  try {
    await coreApp.odm.db
      .collection("admin_logs")
      .insertOne({
        action: "ARTICLE_PUBLISHED",
        admin_id: user?._id,
        admin_name: `${user?.first_name} ${user?.last_name}`,
        target_id: _id,
        target_info: {
          title: current_article?.title,
          previous_status: current_article?.status,
          author_id: current_article?.author?._id
        },
        timestamp: new Date(),
        ip_address: body.request?.headers?.["x-forwarded-for"] || body.request?.headers?.["x-real-ip"]
      });
  } catch (error) {
    console.warn("Failed to log article publish:", error);
  }
};

export const publishArticleSetup = () =>
  coreApp.acts.setAct({
    schema: "article",
    actName: "publishArticle",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Admin", "Manager"],
      }),
      validateArticleForPublishing,
      setPublishData,
      logArticlePublish,
    ],
    validator: publishArticleValidator(),
    fn: publishArticleFn,
  });
