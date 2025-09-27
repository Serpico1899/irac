import { type ActFn, ObjectId, type TInsertRelations } from "@deps";
import {  article  } from "@app";
import type { article_relations } from "@model";

export const createArticleFn: ActFn = async (body) => {
  const { set, get } = body.details;

  const {
    featured_image,
    gallery,
    social_image,
    category,
    tags,
    author,
    editors,
    related_articles,
    related_courses,
    referenced_files,
    ...rest
  } = set;

  const relations: TInsertRelations<typeof article_relations> = {};

  // Required relation - Author
  if (author) {
    relations.author = {
      _ids: new ObjectId(author as string),
    };
  }

  // Single file relations
  if (featured_image) {
    relations.featured_image = {
      _ids: new ObjectId(featured_image as string),
    };
  }

  if (social_image) {
    relations.social_image = {
      _ids: new ObjectId(social_image as string),
    };
  }

  // Single category relation
  if (category) {
    relations.category = {
      _ids: new ObjectId(category as string),
    };
  }

  // Multiple relations
  if (gallery && Array.isArray(gallery) && gallery.length > 0) {
    relations.gallery = {
      _ids: gallery.map((id: string) => new ObjectId(id)),
    };
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    relations.tags = {
      _ids: tags.map((id: string) => new ObjectId(id)),
    };
  }

  if (editors && Array.isArray(editors) && editors.length > 0) {
    relations.editors = {
      _ids: editors.map((id: string) => new ObjectId(id)),
    };
  }

  if (related_articles && Array.isArray(related_articles) && related_articles.length > 0) {
    relations.related_articles = {
      _ids: related_articles.map((id: string) => new ObjectId(id)),
    };
  }

  if (related_courses && Array.isArray(related_courses) && related_courses.length > 0) {
    relations.related_courses = {
      _ids: related_courses.map((id: string) => new ObjectId(id)),
    };
  }

  if (referenced_files && Array.isArray(referenced_files) && referenced_files.length > 0) {
    relations.referenced_files = {
      _ids: referenced_files.map((id: string) => new ObjectId(id)),
    };
  }

  // Set published_at if status is Published and not already set
  if (rest.status === "Published" && !rest.published_at) {
    rest.published_at = new Date();
  }

  // Calculate estimated reading time if not provided
  if (!rest.estimated_reading_time && rest.content) {
    const wordCount = rest.content.split(/\s+/).length;
    const averageWPM = 200; // Average words per minute reading speed
    rest.estimated_reading_time = Math.ceil(wordCount / averageWPM);
  }

  // Set gallery flag based on gallery presence
  if (gallery && Array.isArray(gallery) && gallery.length > 0) {
    rest.has_gallery = true;
  }

  const createdArticle = await article.insertOne({
    doc: {
      ...rest,
    },
    relations,
    projection: get,
  });

  return createdArticle;
};
