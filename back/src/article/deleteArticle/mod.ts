import {
  grantAccess,
  type MyContext,
  setTokens,
  setUser,
  throwError,
} from "@lib";
import { coreApp } from "../../../mod.ts";
import { deleteArticleFn } from "./deleteArticle.fn.ts";
import { deleteArticleValidator } from "./deleteArticle.val.ts";

// Validate article exists and user has permission to delete
export const validateArticleDelete = async () => {
  const { user, body }: MyContext = coreApp.contextFns
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

  // Only Admin/Manager can delete articles
  // Additional check: prevent deletion of published articles with high engagement
  if (article.status === "Published" && article.view_count > 1000) {
    if (user?.level !== "Admin") {
      throwError("حذف مقالات با بازدید بالا فقط توسط ادمین مجاز است / Only admins can delete high-traffic articles");
    }
  }

  // Store article info in context for logging
  body.details.set.article_info = {
    title: article.title,
    status: article.status,
    author_id: article.author._id,
    view_count: article.view_count
  };
};

// Log deletion activity
export const logArticleDeletion = async () => {
  const { user, body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { _id, article_info } = body?.details.set;

  // Log the deletion for audit purposes
  try {
    await coreApp.odm.db
      .collection("admin_logs")
      .insertOne({
        action: "ARTICLE_DELETED",
        admin_id: user?._id,
        admin_name: `${user?.first_name} ${user?.last_name}`,
        target_id: _id,
        target_info: article_info,
        timestamp: new Date(),
        ip_address: body.request?.headers?.["x-forwarded-for"] || body.request?.headers?.["x-real-ip"]
      });
  } catch (error) {
    console.warn("Failed to log article deletion:", error);
  }
};

export const deleteArticleSetup = () =>
  coreApp.acts.setAct({
    schema: "article",
    actName: "deleteArticle",
    validationRunType: "delete",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Admin", "Manager"],
      }),
      validateArticleDelete,
      logArticleDeletion,
    ],
    validator: deleteArticleValidator(),
    fn: deleteArticleFn,
  });
