import { type ActFn, ObjectId } from "@deps";
import {  coreApp  } from "@app";
import type { MyContext } from "@lib";

export interface GetArticleInput {
  _id?: string;
  slug?: string;
  increment_views?: boolean;
  admin_view?: boolean;
}

export const getArticleFn: ActFn = async (body) => {
  const {
    _id,
    slug,
    admin_view = false
  }: GetArticleInput = body.details.set;

  try {
    // Get current user context for access control
    const { user }: MyContext = coreApp.contextFns.getContextModel() as MyContext;
    const isAdmin = user?.level === "Admin" || user?.level === "Manager";

    // Build match filter
    const matchFilter: any = {};

    if (_id) {
      matchFilter._id = new ObjectId(_id);
    } else if (slug) {
      matchFilter.slug = slug;
    } else {
      return {
        success: false,
        message: "شناسه یا نام مستعار مقاله الزامی است / Article ID or slug is required"
      };
    }

    // For non-admin users, only show published articles
    if (!isAdmin || !admin_view) {
      matchFilter.status = "Published";
      matchFilter.published_at = { $lte: new Date() };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchFilter }
    ];

    // Lookup author details
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "author._id",
        foreignField: "_id",
        as: "author_details",
        pipeline: [
          {
            $project: {
              _id: 1,
              first_name: 1,
              last_name: 1,
              summary: 1,
              level: 1,
              avatar: 1
            }
          }
        ]
      }
    });

    // Lookup category details
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "category._id",
        foreignField: "_id",
        as: "category_details"
      }
    });

    // Lookup tags details
    pipeline.push({
      $lookup: {
        from: "tags",
        localField: "tags._id",
        foreignField: "_id",
        as: "tags_details"
      }
    });

    // Lookup featured image details
    pipeline.push({
      $lookup: {
        from: "files",
        localField: "featured_image._id",
        foreignField: "_id",
        as: "featured_image_details"
      }
    });

    // Lookup social image details
    pipeline.push({
      $lookup: {
        from: "files",
        localField: "social_image._id",
        foreignField: "_id",
        as: "social_image_details"
      }
    });

    // Lookup gallery details
    pipeline.push({
      $lookup: {
        from: "files",
        localField: "gallery._id",
        foreignField: "_id",
        as: "gallery_details"
      }
    });

    // Lookup editors details
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "editors._id",
        foreignField: "_id",
        as: "editors_details",
        pipeline: [
          {
            $project: {
              _id: 1,
              first_name: 1,
              last_name: 1,
              level: 1
            }
          }
        ]
      }
    });

    // Lookup related articles
    pipeline.push({
      $lookup: {
        from: "articles",
        localField: "related_articles._id",
        foreignField: "_id",
        as: "related_articles_details",
        pipeline: [
          { $match: { status: "Published" } },
          {
            $project: {
              _id: 1,
              title: 1,
              title_en: 1,
              excerpt: 1,
              excerpt_en: 1,
              slug: 1,
              published_at: 1,
              featured_image: 1,
              view_count: 1,
              like_count: 1,
              estimated_reading_time: 1
            }
          }
        ]
      }
    });

    // Lookup related courses
    pipeline.push({
      $lookup: {
        from: "courses",
        localField: "related_courses._id",
        foreignField: "_id",
        as: "related_courses_details",
        pipeline: [
          { $match: { status: "Published" } },
          {
            $project: {
              _id: 1,
              title: 1,
              title_en: 1,
              description: 1,
              description_en: 1,
              slug: 1,
              featured_image: 1,
              price: 1,
              duration: 1
            }
          }
        ]
      }
    });

    // Lookup referenced files
    pipeline.push({
      $lookup: {
        from: "files",
        localField: "referenced_files._id",
        foreignField: "_id",
        as: "referenced_files_details"
      }
    });

    // Add fields to merge lookup results
    pipeline.push({
      $addFields: {
        "author.details": { $arrayElemAt: ["$author_details", 0] },
        "category.details": { $arrayElemAt: ["$category_details", 0] },
        "tags.details": "$tags_details",
        "featured_image.details": { $arrayElemAt: ["$featured_image_details", 0] },
        "social_image.details": { $arrayElemAt: ["$social_image_details", 0] },
        "gallery.details": "$gallery_details",
        "editors.details": "$editors_details",
        "related_articles.details": "$related_articles_details",
        "related_courses.details": "$related_courses_details",
        "referenced_files.details": "$referenced_files_details"
      }
    });

    // Remove temporary lookup fields
    pipeline.push({
      $unset: [
        "author_details",
        "category_details",
        "tags_details",
        "featured_image_details",
        "social_image_details",
        "gallery_details",
        "editors_details",
        "related_articles_details",
        "related_courses_details",
        "referenced_files_details"
      ]
    });

    // Execute query
    const [article] = await coreApp.odm.db
      .collection("articles")
      .aggregate(pipeline)
      .toArray();

    if (!article) {
      return {
        success: false,
        message: "مقاله یافت نشد / Article not found",
        error: "ARTICLE_NOT_FOUND"
      };
    }

    // For admin view, add additional metadata
    if (isAdmin && admin_view) {
      // Get engagement statistics
      const engagementStats = {
        total_interactions: article.view_count + article.like_count + article.comment_count + article.share_count,
        engagement_rate: article.view_count > 0 ?
          ((article.like_count + article.comment_count + article.share_count) / article.view_count * 100).toFixed(2) : 0
      };

      // Get recent activity (if user has liked/bookmarked this article)
      if (user?._id) {
        const userInteraction = await coreApp.odm.db
          .collection("articles")
          .findOne({
            _id: article._id,
            $or: [
              { "liked_by._id": user._id },
              { "bookmarked_by._id": user._id }
            ]
          }, {
            projection: {
              "liked_by.$": 1,
              "bookmarked_by.$": 1
            }
          });

        article.user_interaction = {
          has_liked: !!userInteraction?.liked_by?.length,
          has_bookmarked: !!userInteraction?.bookmarked_by?.length
        };
      }

      article.admin_stats = engagementStats;
    }

    return {
      success: true,
      data: article
    };

  } catch (error) {
    console.error("Error in getArticle:", error);
    return {
      success: false,
      message: "خطا در دریافت مقاله / Error fetching article",
      error: error.message
    };
  }
};
