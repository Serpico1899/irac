import type { Infer } from "@deps";
import {
  grantAccess,
  type MyContext,
  setTokens,
  setUser,
  throwError,
} from "@lib";
import { coreApp } from "../../../mod.ts";
import { updateArticleFn } from "./updateArticle.fn.ts";
import { updateArticleValidator } from "./updateArticle.val.ts";

// Update slug if title has changed
export const updateArticleSlug = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { title, _id, update_slug } = body?.details.set;

  // Only update slug if explicitly requested or title changed
  if (!title || !update_slug) {
    return;
  }

  // Generate new slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '') // Keep Persian, English, numbers, spaces, hyphens
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Check if slug exists (excluding current article)
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingArticle = await coreApp.odm.db
      .collection("articles")
      .findOne({
        slug,
        _id: { $ne: new coreApp.odm.ObjectId(_id) }
      });

    if (!existingArticle) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Update slug in the body
  body.details.set.slug = slug;
};

// Handle status changes
export const handleStatusChange = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { status, _id } = body?.details.set;

  if (!status || !_id) {
    return;
  }

  // Get current article to check previous status
  const currentArticle = await coreApp.odm.db
    .collection("articles")
    .findOne({ _id: new coreApp.odm.ObjectId(_id) });

  if (!currentArticle) {
    throwError("مقاله یافت نشد / Article not found");
  }

  // If changing to Published and not previously published
  if (status === "Published" && currentArticle.status !== "Published") {
    body.details.set.published_at = new Date();
  }

  // If changing to Archived
  if (status === "Archived" && currentArticle.status !== "Archived") {
    body.details.set.archive_date = new Date();
  }

  // If changing from Archived back to another status, clear archive_date
  if (status !== "Archived" && currentArticle.status === "Archived") {
    body.details.set.archive_date = null;
  }
};

// Set last modified by
export const setLastModifiedBy = () => {
  const { user, body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  if (user?.first_name && user?.last_name) {
    body.details.set.last_modified_by_name = `${user.first_name} ${user.last_name}`;
  }
};

// Validate article exists and user has permission
export const validateArticleAccess = async () => {
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

  // Admin/Manager can edit any article, others can only edit their own
  if (user?.level !== "Admin" && user?.level !== "Manager") {
    if (article.author._id.toString() !== user?._id.toString()) {
      throwError("شما مجاز به ویرایش این مقاله نیستید / You are not authorized to edit this article");
    }
  }
};

export const updateArticleSetup = () =>
  coreApp.acts.setAct({
    schema: "article",
    actName: "updateArticle",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
        users: "me", // Allow authors to edit their own articles
      }),
      validateArticleAccess,
      setLastModifiedBy,
      handleStatusChange,
      updateArticleSlug,
    ],
    validator: updateArticleValidator(),
    fn: updateArticleFn,
  });
