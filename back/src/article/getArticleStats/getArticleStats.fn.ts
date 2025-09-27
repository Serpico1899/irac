import { type ActFn } from "@deps";
import {  coreApp  } from "@app";

export interface GetArticleStatsInput {
  period?: "week" | "month" | "quarter" | "year" | "all";
  author_id?: string;
  category_id?: string;
  include_detailed?: boolean;
}

export const getArticleStatsFn: ActFn = async (body) => {
  const {
    period = "month",
    author_id,
    category_id,
    include_detailed = false
  }: GetArticleStatsInput = body.details.set || {};

  try {
    // Calculate date range based on period
    const now = new Date();
    let dateFilter: any = {};

    if (period !== "all") {
      const startDate = new Date(now);
      switch (period) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      dateFilter = { created_at: { $gte: startDate } };
    }

    // Build base match filter
    const baseMatch: any = { ...dateFilter };
    if (author_id) {
      baseMatch["author._id"] = new coreApp.odm.ObjectId(author_id);
    }
    if (category_id) {
      baseMatch["category._id"] = new coreApp.odm.ObjectId(category_id);
    }

    // Execute multiple aggregations in parallel
    const [
      statusCounts,
      typeCounts,
      engagementStats,
      topArticles,
      authorStats,
      categoryStats,
      publishingTrends,
      recentActivity
    ] = await Promise.all([
      // 1. Article counts by status
      coreApp.odm.db.collection("articles").aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total_views: { $sum: "$view_count" },
            total_likes: { $sum: "$like_count" }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),

      // 2. Article counts by type
      coreApp.odm.db.collection("articles").aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            avg_reading_time: { $avg: "$estimated_reading_time" }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),

      // 3. Overall engagement statistics
      coreApp.odm.db.collection("articles").aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            total_articles: { $sum: 1 },
            total_views: { $sum: "$view_count" },
            total_likes: { $sum: "$like_count" },
            total_comments: { $sum: "$comment_count" },
            total_shares: { $sum: "$share_count" },
            avg_reading_time: { $avg: "$estimated_reading_time" },
            avg_views_per_article: { $avg: "$view_count" },
            avg_engagement_rate: {
              $avg: {
                $cond: [
                  { $gt: ["$view_count", 0] },
                  {
                    $divide: [
                      { $add: ["$like_count", "$comment_count", "$share_count"] },
                      "$view_count"
                    ]
                  },
                  0
                ]
              }
            }
          }
        }
      ]).toArray(),

      // 4. Top performing articles
      coreApp.odm.db.collection("articles").aggregate([
        { $match: { ...baseMatch, status: "Published" } },
        {
          $addFields: {
            engagement_score: {
              $add: [
                "$view_count",
                { $multiply: ["$like_count", 5] },
                { $multiply: ["$comment_count", 10] },
                { $multiply: ["$share_count", 15] }
              ]
            }
          }
        },
        { $sort: { engagement_score: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "author._id",
            foreignField: "_id",
            as: "author_details",
            pipeline: [{ $project: { first_name: 1, last_name: 1 } }]
          }
        },
        {
          $project: {
            title: 1,
            slug: 1,
            published_at: 1,
            view_count: 1,
            like_count: 1,
            comment_count: 1,
            share_count: 1,
            engagement_score: 1,
            type: 1,
            author: { $arrayElemAt: ["$author_details", 0] },
            estimated_reading_time: 1
          }
        }
      ]).toArray(),

      // 5. Author performance statistics
      coreApp.odm.db.collection("articles").aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: "$author._id",
            articles_count: { $sum: 1 },
            published_count: {
              $sum: { $cond: [{ $eq: ["$status", "Published"] }, 1, 0] }
            },
            total_views: { $sum: "$view_count" },
            total_engagement: {
              $sum: { $add: ["$like_count", "$comment_count", "$share_count"] }
            },
            avg_reading_time: { $avg: "$estimated_reading_time" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "author_details",
            pipeline: [{ $project: { first_name: 1, last_name: 1, level: 1 } }]
          }
        },
        {
          $addFields: {
            author: { $arrayElemAt: ["$author_details", 0] },
            avg_views_per_article: {
              $cond: [
                { $gt: ["$articles_count", 0] },
                { $divide: ["$total_views", "$articles_count"] },
                0
              ]
            }
          }
        },
        { $sort: { total_views: -1 } },
        { $limit: 10 },
        { $unset: ["author_details"] }
      ]).toArray(),

      // 6. Category performance statistics
      coreApp.odm.db.collection("articles").aggregate([
        { $match: { ...baseMatch, "category._id": { $exists: true } } },
        {
          $group: {
            _id: "$category._id",
            articles_count: { $sum: 1 },
            published_count: {
              $sum: { $cond: [{ $eq: ["$status", "Published"] }, 1, 0] }
            },
            total_views: { $sum: "$view_count" },
            total_engagement: {
              $sum: { $add: ["$like_count", "$comment_count", "$share_count"] }
            }
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category_details",
            pipeline: [{ $project: { title: 1, title_en: 1 } }]
          }
        },
        {
          $addFields: {
            category: { $arrayElemAt: ["$category_details", 0] },
            avg_views_per_article: {
              $cond: [
                { $gt: ["$articles_count", 0] },
                { $divide: ["$total_views", "$articles_count"] },
                0
              ]
            }
          }
        },
        { $sort: { total_views: -1 } },
        { $limit: 10 },
        { $unset: ["category_details"] }
      ]).toArray(),

      // 7. Publishing trends over time
      coreApp.odm.db.collection("articles").aggregate([
        {
          $match: {
            ...baseMatch,
            published_at: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$published_at" },
              month: { $month: "$published_at" },
              week: { $week: "$published_at" }
            },
            articles_published: { $sum: 1 },
            total_views: { $sum: "$view_count" },
            avg_engagement: {
              $avg: { $add: ["$like_count", "$comment_count", "$share_count"] }
            }
          }
        },
        {
          $sort: {
            "_id.year": -1,
            "_id.month": -1,
            "_id.week": -1
          }
        },
        { $limit: 12 } // Last 12 periods
      ]).toArray(),

      // 8. Recent activity (last 10 articles)
      coreApp.odm.db.collection("articles").aggregate([
        { $match: baseMatch },
        { $sort: { updated_at: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "author._id",
            foreignField: "_id",
            as: "author_details",
            pipeline: [{ $project: { first_name: 1, last_name: 1 } }]
          }
        },
        {
          $project: {
            title: 1,
            status: 1,
            updated_at: 1,
            created_at: 1,
            published_at: 1,
            view_count: 1,
            type: 1,
            author: { $arrayElemAt: ["$author_details", 0] },
            last_modified_by_name: 1
          }
        }
      ]).toArray()
    ]);

    // Calculate additional metrics
    const overallStats = engagementStats[0] || {};
    const totalEngagementInteractions = overallStats.total_likes + overallStats.total_comments + overallStats.total_shares;

    // Build comprehensive response
    const stats = {
      overview: {
        period,
        total_articles: overallStats.total_articles || 0,
        total_views: overallStats.total_views || 0,
        total_engagement_interactions: totalEngagementInteractions || 0,
        average_reading_time: Math.round(overallStats.avg_reading_time || 0),
        average_views_per_article: Math.round(overallStats.avg_views_per_article || 0),
        average_engagement_rate: parseFloat((overallStats.avg_engagement_rate * 100 || 0).toFixed(2)),
        filters_applied: {
          author_id: author_id || null,
          category_id: category_id || null
        }
      },

      status_breakdown: statusCounts.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          total_views: item.total_views,
          total_likes: item.total_likes
        };
        return acc;
      }, {}),

      type_breakdown: typeCounts.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          avg_reading_time: Math.round(item.avg_reading_time || 0)
        };
        return acc;
      }, {}),

      top_articles: topArticles,

      author_performance: authorStats,

      category_performance: categoryStats,

      publishing_trends: publishingTrends,

      recent_activity: recentActivity
    };

    // Add detailed analytics if requested
    if (include_detailed) {
      // Additional detailed queries can be added here
      const [seoStats, contentStats] = await Promise.all([
        // SEO completeness statistics
        coreApp.odm.db.collection("articles").aggregate([
          { $match: baseMatch },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              with_meta_title: {
                $sum: { $cond: [{ $ne: ["$meta_title", null] }, 1, 0] }
              },
              with_meta_description: {
                $sum: { $cond: [{ $ne: ["$meta_description", null] }, 1, 0] }
              },
              with_featured_image: {
                $sum: { $cond: [{ $ne: ["$featured_image", null] }, 1, 0] }
              },
              with_excerpt: {
                $sum: { $cond: [{ $ne: ["$excerpt", null] }, 1, 0] }
              }
            }
          }
        ]).toArray(),

        // Content quality statistics
        coreApp.odm.db.collection("articles").aggregate([
          { $match: baseMatch },
          {
            $group: {
              _id: null,
              avg_content_length: {
                $avg: { $strLenCP: { $ifNull: ["$content", ""] } }
              },
              avg_title_length: {
                $avg: { $strLenCP: { $ifNull: ["$title", ""] } }
              },
              with_multilingual: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$title_en", null] },
                        { $ne: ["$content_en", null] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]).toArray()
      ]);

      stats.detailed_analytics = {
        seo_completeness: {
          meta_title_completion: seoStats[0] ?
            Math.round((seoStats[0].with_meta_title / seoStats[0].total) * 100) : 0,
          meta_description_completion: seoStats[0] ?
            Math.round((seoStats[0].with_meta_description / seoStats[0].total) * 100) : 0,
          featured_image_completion: seoStats[0] ?
            Math.round((seoStats[0].with_featured_image / seoStats[0].total) * 100) : 0,
          excerpt_completion: seoStats[0] ?
            Math.round((seoStats[0].with_excerpt / seoStats[0].total) * 100) : 0
        },
        content_quality: {
          average_content_length: Math.round(contentStats[0]?.avg_content_length || 0),
          average_title_length: Math.round(contentStats[0]?.avg_title_length || 0),
          multilingual_completion: contentStats[0] && seoStats[0] ?
            Math.round((contentStats[0].with_multilingual / seoStats[0].total) * 100) : 0
        }
      };
    }

    return {
      success: true,
      data: stats
    };

  } catch (error) {
    console.error("Error in getArticleStats:", error);
    return {
      success: false,
      message: "خطا در دریافت آمار مقالات / Error fetching article statistics",
      error: error.message
    };
  }
};
