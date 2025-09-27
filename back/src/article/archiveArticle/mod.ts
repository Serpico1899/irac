import {
  grantAccess,
  type MyContext,
  setTokens,
  setUser,
  throwError,
} from "@lib";
import {  coreApp  } from "@app";
import { archiveArticleFn } from "./archiveArticle.fn.ts";
import { archiveArticleValidator } from "./archiveArticle.val.ts";

// Validate article can be archived
export const validateArticleForArchiving = async () => {
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

  // Check if article is already archived
  if (article.status === "Archived") {
    throwError("این مقاله قبلاً آرشیو شده است / Article is already archived");
  }

  // Store article info for the function
  body.details.set.current_article = article;
};

// Set archive data
export const setArchiveData = () => {
  const { user, body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  // Set archive timestamp
  body.details.set.archive_date = new Date();

  // Set last modified by
  if (user?.first_name && user?.last_name) {
    body.details.set.last_modified_by_name = `${user.first_name} ${user.last_name}`;
  }

  // Set status to archived
  body.details.set.status = "Archived";

  // Clear featured flags when archiving
  body.details.set.featured = false;
  body.details.set.pinned = false;
  body.details.set.featured_on_homepage = false;
};

// Log archive activity
export const logArticleArchive = async () => {
  const { user, body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { _id, current_article } = body?.details.set;

  try {
    await coreApp.odm.db
      .collection("admin_logs")
      .insertOne({
        action: "ARTICLE_ARCHIVED",
        admin_id: user?._id,
        admin_name: `${user?.first_name} ${user?.last_name}`,
        target_id: _id,
        target_info: {
          title: current_article?.title,
          previous_status: current_article?.status,
          author_id: current_article?.author?._id,
          view_count: current_article?.view_count
        },
        timestamp: new Date(),
        ip_address: body.request?.headers?.["x-forwarded-for"] || body.request?.headers?.["x-real-ip"]
      });
  } catch (error) {
    console.warn("Failed to log article archive:", error);
  }
};

export const archiveArticleSetup = () =>
  coreApp.acts.setAct({
    schema: "article",
    actName: "archiveArticle",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Admin", "Manager"],
      }),
      validateArticleForArchiving,
      setArchiveData,
      logArticleArchive,
    ],
    validator: archiveArticleValidator(),
    fn: archiveArticleFn,
  });
