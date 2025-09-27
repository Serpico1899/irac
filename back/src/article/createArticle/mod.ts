import type { Infer } from "@deps";
import {
  grantAccess,
  type MyContext,
  setTokens,
  setUser,
  throwError,
} from "@lib";
import {  coreApp  } from "@app";
import { createArticleFn } from "./createArticle.fn.ts";
import { createArticleValidator } from "./createArticle.val.ts";

// Generate unique slug from title
export const generateArticleSlug = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { title } = body?.details.set;

  if (!title) {
    return;
  }

  // Generate slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '') // Keep Persian, English, numbers, spaces, hyphens
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Check if slug exists
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingArticle = await coreApp.odm.db
      .collection("articles")
      .findOne({ slug });

    if (!existingArticle) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Add slug to the body
  body.details.set.slug = slug;
};

// Set author automatically from current user
export const setArticleAuthor = () => {
  const { user, body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  if (!body?.details.set.author && user?._id) {
    body.details.set.author = user._id.toString();
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

export const createArticleSetup = () =>
  coreApp.acts.setAct({
    schema: "article",
    actName: "createArticle",
    validationRunType: "create",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
      }),
      setArticleAuthor,
      setLastModifiedBy,
      generateArticleSlug,
    ],
    validator: createArticleValidator(),
    fn: createArticleFn,
  });
