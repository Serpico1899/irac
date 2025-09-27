import { type ActFn, ObjectId, type TInsertRelations } from "@deps";
import {  article  } from "@app";
import type { article_relations } from "@model";

export const updateArticleFn: ActFn = async (body) => {
  const { set, get } = body.details;

  const {
    _id,
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
    update_slug,
    ...rest
  } = set;

  const relations: TInsertRelations<typeof article_relations> = {};

  // Handle single file relations
  if (featured_image !== undefined) {
    if (featured_image) {
      relations.featured_image = {
        _ids: new ObjectId(featured_image as string),
      };
    } else {
      // Remove relation if set to null/empty
      relations.featured_image = {
        _ids: [],
      };
    }
  }

  if (social_image !== undefined) {
    if (social_image) {
      relations.social_image = {
        _ids: new ObjectId(social_image as string),
      };
    } else {
      relations.social_image = {
        _ids: [],
      };
    }
  }

  // Handle category relation
  if (category !== undefined) {
    if (category) {
      relations.category = {
        _ids: new ObjectId(category as string),
      };
    } else {
      relations.category = {
        _ids: [],
      };
    }
  }

  // Handle author relation
  if (author !== undefined) {
    relations.author = {
      _ids: new ObjectId(author as string),
    };
  }

  // Handle multiple relations
  if (gallery !== undefined) {
    if (Array.isArray(gallery) && gallery.length > 0) {
      relations.gallery = {
        _ids: gallery.map((id: string) => new ObjectId(id)),
      };
      // Set gallery flag
      rest.has_gallery = true;
    } else {
      relations.gallery = {
        _ids: [],
      };
      rest.has_gallery = false;
    }
  }

  if (tags !== undefined) {
    if (Array.isArray(tags) && tags.length > 0) {
      relations.tags = {
        _ids: tags.map((id: string) => new ObjectId(id)),
      };
    } else {
      relations.tags = {
        _ids: [],
      };
    }
  }

  if (editors !== undefined) {
    if (Array.isArray(editors) && editors.length > 0) {
      relations.editors = {
        _ids: editors.map((id: string) => new ObjectId(id)),
      };
    } else {
      relations.editors = {
        _ids: [],
      };
    }
  }

  if (related_articles !== undefined) {
    if (Array.isArray(related_articles) && related_articles.length > 0) {
      relations.related_articles = {
        _ids: related_articles.map((id: string) => new ObjectId(id)),
      };
    } else {
      relations.related_articles = {
        _ids: [],
      };
    }
  }

  if (related_courses !== undefined) {
    if (Array.isArray(related_courses) && related_courses.length > 0) {
      relations.related_courses = {
        _ids: related_courses.map((id: string) => new ObjectId(id)),
      };
    } else {
      relations.related_courses = {
        _ids: [],
      };
    }
  }

  if (referenced_files !== undefined) {
    if (Array.isArray(referenced_files) && referenced_files.length > 0) {
      relations.referenced_files = {
        _ids: referenced_files.map((id: string) => new ObjectId(id)),
      };
    } else {
      relations.referenced_files = {
        _ids: [],
      };
    }
  }

  // Calculate estimated reading time if content was updated
  if (rest.content && !rest.estimated_reading_time) {
    const wordCount = rest.content.split(/\s+/).length;
    const averageWPM = 200; // Average words per minute reading speed
    rest.estimated_reading_time = Math.ceil(wordCount / averageWPM);
  }

  // Remove non-updatable fields
  delete rest.view_count;
  delete rest.like_count;
  delete rest.comment_count;
  delete rest.share_count;

  // Always update the updated_at timestamp
  rest.updated_at = new Date();

  const updatedArticle = await article.updateOne({
    filter: { _id: new ObjectId(_id) },
    update: {
      $set: {
        ...rest,
      },
    },
    relations: Object.keys(relations).length > 0 ? relations : undefined,
    projection: get,
  });

  return updatedArticle;
};
