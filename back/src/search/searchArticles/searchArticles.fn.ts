import { coreApp } from "../../mod.ts";

const searchArticlesHandler = async (context: any) => {
  const {
    query = "",
    category_id,
    tags = [],
    type,
    author_id,
    language = "both",
    published_from,
    published_to,
    min_reading_time,
    max_reading_time,
    min_view_count,
    min_like_count,
    has_comments,
    featured_only,
    pinned_only,
    sort_by = "relevance",
    page = 1,
    limit = 12,
    include_author = true,
    include_category = true,
    include_tags = true,
    include_image = true,
    include_stats = true,
  } = context.body.details;

  try {
    const skip = (page - 1) * limit;

    // Build match conditions
    const matchConditions: any = {
      status: "Published",
    };

    // Text search conditions
    if (query.trim()) {
      const searchConditions = [];

      if (language === "both" || language === "fa") {
        searchConditions.push(
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { excerpt: { $regex: query, $options: "i" } }
        );
      }

      if (language === "both" || language === "en") {
        searchConditions.push(
          { title_en: { $regex: query, $options: "i" } },
          { content_en: { $regex: query, $options: "i" } },
          { excerpt_en: { $regex: query, $options: "i" } }
        );
      }

      if (searchConditions.length > 0) {
        matchConditions.$or = searchConditions;
      }
    }

    // Category filter
    if (category_id) {
      matchConditions.category = category_id;
    }

    // Tags filter
    if (tags.length > 0) {
      matchConditions.tags = { $in: tags };
    }

    // Type filter
    if (type) {
      matchConditions.type = type;
    }

    // Author filter
    if (author_id) {
      matchConditions.author = author_id;
    }

    // Published date filters
    if (published_from || published_to) {
      const dateFilter: any = {};
      if (published_from) dateFilter.$gte = new Date(published_from);
      if (published_to) dateFilter.$lte = new Date(published_to);
      matchConditions.published_at = dateFilter;
    }

    // Reading time filters
    if (min_reading_time !== undefined || max_reading_time !== undefined) {
      const readingTimeFilter: any = {};
      if (min_reading_time !== undefined) readingTimeFilter.$gte = min_reading_time;
      if (max_reading_time !== undefined) readingTimeFilter.$lte = max_reading_time;
      matchConditions.estimated_reading_time = readingTimeFilter;
    }

    // View count filter
    if (min_view_count !== undefined) {
      matchConditions.view_count = { $gte: min_view_count };
    }

    // Like count filter
    if (min_like_count !== undefined) {
      matchConditions.like_count = { $gte: min_like_count };
    }

    // Comments filter
    if (has_comments !== undefined) {
      if (has_comments) {
        matchConditions.comment_count = { $gt: 0 };
      } else {
        matchConditions.comment_count = { $eq: 0 };
      }
    }

    // Featured filter
    if (featured_only) {
      matchConditions.featured = true;
    }

    // Pinned filter
    if (pinned_only) {
      matchConditions.pinned = true;
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchConditions }
    ];

    // Add lookups based on include flags
    if (include_category) {
      pipeline.push({
        $lookup: {
          from: "category",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                name_en: 1,
                slug: 1,
                color: 1,
                description: 1,
                description_en: 1
              }
            }
          ]
        }
      });
    }

    if (include_tags) {
      pipeline.push({
        $lookup: {
          from: "tag",
          localField: "tags",
          foreignField: "_id",
          as: "tags",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                name_en: 1,
                slug: 1,
                color: 1
              }
            }
          ]
        }
      });
    }

    if (include_author) {
      pipeline.push({
        $lookup: {
          from: "user",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                first_name_en: 1,
                last_name_en: 1,
                email: 1,
                profile_image: 1,
                bio: 1,
                bio_en: 1,
                expertise: 1,
                social_links: 1
              }
            }
          ]
        }
      });
    }

    if (include_image) {
      pipeline.push({
        $lookup: {
          from: "file",
          localField: "featured_image",
          foreignField: "_id",
          as: "featured_image",
          pipeline: [
            {
              $project: {
                _id: 1,
                url: 1,
                alt_text: 1,
                filename: 1,
                width: 1,
                height: 1
              }
            }
          ]
        }
      });
    }

    // Add computed fields
    if (include_stats) {
      pipeline.push({
        $addFields: {
          // Calculate engagement score
          engagement_score: {
            $add: [
              { $multiply: [{ $ifNull: ["$view_count", 0] }, 1] },
              { $multiply: [{ $ifNull: ["$like_count", 0] }, 5] },
              { $multiply: [{ $ifNull: ["$comment_count", 0] }, 10] }
            ]
          },
          // Calculate days since published
          days_since_published: {
            $divide: [
              { $subtract: [new Date(), { $ifNull: ["$published_at", "$created_at"] }] },
              86400000 // milliseconds in a day
            ]
          },
          // Reading time in minutes (rounded)
          reading_time_minutes: {
            $round: [{ $ifNull: ["$estimated_reading_time", 5] }]
          },
          // Popularity indicator
          is_popular: {
            $or: [
              { $gte: ["$view_count", 1000] },
              { $gte: ["$like_count", 50] },
              { $gte: ["$comment_count", 10] }
            ]
          }
        }
      });
    }

    // Add sorting
    const sortStage: any = {};
    switch (sort_by) {
      case "published_at":
        sortStage.published_at = -1;
        break;
      case "created_at":
        sortStage.created_at = -1;
        break;
      case "updated_at":
        sortStage.updated_at = -1;
        break;
      case "view_count":
        sortStage.view_count = -1;
        break;
      case "like_count":
        sortStage.like_count = -1;
        break;
      case "comment_count":
        sortStage.comment_count = -1;
        break;
      case "reading_time":
        sortStage.estimated_reading_time = 1;
        break;
      case "alphabetical":
        if (language === "en") {
          sortStage.title_en = 1;
        } else {
          sortStage.title = 1;
        }
        break;
      case "relevance":
      default:
        if (query.trim()) {
          // Text score for relevance
          pipeline.push({
            $addFields: {
              score: { $meta: "textScore" }
            }
          });
          sortStage.score = { $meta: "textScore" };
        } else {
          // Default to recent articles
          sortStage.published_at = -1;
          sortStage.created_at = -1;
        }
        break;
    }

    // Always prioritize pinned articles
    if (!pinned_only) {
      pipeline.push({
        $addFields: {
          sort_priority: {
            $cond: [{ $eq: ["$pinned", true] }, 1, 0]
          }
        }
      });
      sortStage.sort_priority = -1;
    }

    pipeline.push({ $sort: sortStage });

    // Get total count
    const countPipeline = [
      ...pipeline.slice(0, -2), // Remove addFields and sort stages
      { $count: "total" }
    ];

    const countResult = await coreApp.deps.lesan.features.mongoDB.db
      .collection("article")
      .aggregate(countPipeline)
      .toArray();

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Execute main query
    const articles = await coreApp.deps.lesan.features.mongoDB.db
      .collection("article")
      .aggregate(pipeline)
      .toArray();

    // Format results
    const formattedArticles = articles.map(article => ({
      ...article,
      category: article.category?.[0] || null,
      author: article.author?.[0] || null,
      featured_image: article.featured_image?.[0] || null,
      tags: article.tags || [],
      engagement_score: Math.round(article.engagement_score || 0),
      days_since_published: Math.ceil(article.days_since_published || 0),
      reading_time_minutes: article.reading_time_minutes || 5,
      is_popular: article.is_popular || false,
      // Format display title based on language
      display_title: language === "en" && article.title_en ? article.title_en : article.title,
      display_excerpt: language === "en" && article.excerpt_en ? article.excerpt_en : article.excerpt,
    }));

    // Build pagination info
    const pagination = {
      current_page: page,
      total_pages: Math.ceil(totalCount / limit),
      total_items: totalCount,
      items_per_page: limit,
      has_next: page < Math.ceil(totalCount / limit),
      has_previous: page > 1,
    };

    // Get filter aggregations for faceted search
    const facets: any = {};
    if (totalCount > 0) {
      // Category facets
      const categoryFacets = await coreApp.deps.lesan.features.mongoDB.db
        .collection("article")
        .aggregate([
          { $match: matchConditions },
          {
            $lookup: {
              from: "category",
              localField: "category",
              foreignField: "_id",
              as: "category_info"
            }
          },
          { $unwind: "$category_info" },
          {
            $group: {
              _id: "$category_info._id",
              name: { $first: "$category_info.name" },
              name_en: { $first: "$category_info.name_en" },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ])
        .toArray();

      facets.categories = categoryFacets.reduce((acc: any, item: any) => {
        acc[item._id] = {
          name: item.name,
          name_en: item.name_en,
          count: item.count
        };
        return acc;
      }, {});

      // Type facets
      const typeFacets = await coreApp.deps.lesan.features.mongoDB.db
        .collection("article")
        .aggregate([
          { $match: matchConditions },
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
        .toArray();

      facets.types = typeFacets.reduce((acc: any, item: any) => {
        if (item._id) {
          acc[item._id] = item.count;
        }
        return acc;
      }, {});

      // Author facets
      const authorFacets = await coreApp.deps.lesan.features.mongoDB.db
        .collection("article")
        .aggregate([
          { $match: matchConditions },
          {
            $lookup: {
              from: "user",
              localField: "author",
              foreignField: "_id",
              as: "author_info"
            }
          },
          { $unwind: "$author_info" },
          {
            $group: {
              _id: "$author_info._id",
              name: {
                $first: {
                  $concat: ["$author_info.first_name", " ", "$author_info.last_name"]
                }
              },
              name_en: {
                $first: {
                  $concat: [
                    { $ifNull: ["$author_info.first_name_en", "$author_info.first_name"] },
                    " ",
                    { $ifNull: ["$author_info.last_name_en", "$author_info.last_name"] }
                  ]
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ])
        .toArray();

      facets.authors = authorFacets.reduce((acc: any, item: any) => {
        acc[item._id] = {
          name: item.name,
          name_en: item.name_en,
          count: item.count
        };
        return acc;
      }, {});

      // Reading time ranges
      const readingTimeFacets = await coreApp.deps.lesan.features.mongoDB.db
        .collection("article")
        .aggregate([
          { $match: matchConditions },
          {
            $bucket: {
              groupBy: "$estimated_reading_time",
              boundaries: [0, 5, 10, 20, 30, Infinity],
              default: "other",
              output: { count: { $sum: 1 } }
            }
          }
        ])
        .toArray();

      facets.reading_time_ranges = readingTimeFacets.reduce((acc: any, item: any) => {
        const key = item._id === 0 ? "under_5min" :
          item._id === 5 ? "5_10min" :
            item._id === 10 ? "10_20min" :
              item._id === 20 ? "20_30min" :
                item._id === 30 ? "over_30min" : "other";
        acc[key] = item.count;
        return acc;
      }, {});

      // Popular tags
      const tagFacets = await coreApp.deps.lesan.features.mongoDB.db
        .collection("article")
        .aggregate([
          { $match: matchConditions },
          { $unwind: "$tags" },
          {
            $lookup: {
              from: "tag",
              localField: "tags",
              foreignField: "_id",
              as: "tag_info"
            }
          },
          { $unwind: "$tag_info" },
          {
            $group: {
              _id: "$tag_info._id",
              name: { $first: "$tag_info.name" },
              name_en: { $first: "$tag_info.name_en" },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ])
        .toArray();

      facets.tags = tagFacets.reduce((acc: any, item: any) => {
        acc[item._id] = {
          name: item.name,
          name_en: item.name_en,
          count: item.count
        };
        return acc;
      }, {});
    }

    return {
      success: true,
      data: {
        articles: formattedArticles,
        pagination,
        facets,
        search_info: {
          query: query.trim(),
          total_results: totalCount,
          search_time: Date.now(),
          filters_applied: {
            category: !!category_id,
            tags: tags.length > 0,
            type: !!type,
            author: !!author_id,
            date_range: !!(published_from || published_to),
            reading_time: !!(min_reading_time || max_reading_time),
            min_views: !!min_view_count,
            min_likes: !!min_like_count,
            has_comments: has_comments !== undefined,
            featured_only: !!featured_only,
            pinned_only: !!pinned_only,
          },
          sort_by,
          language,
        },
      },
    };

  } catch (error) {
    console.error("Search articles error:", error);
    return {
      success: false,
      message: "خطا در جستجوی مقالات",
      message_en: "Error searching articles",
      error: error.message,
    };
  }
};

export default searchArticlesHandler;
