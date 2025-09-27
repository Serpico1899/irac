import {  coreApp  } from "@app";

const getRecommendationsHandler = async (context: any) => {
  const {
    user_id,
    content_id,
    content_type,
    content_types = ["Course", "Article", "Workshop", "Product"],
    category_id,
    recommendation_type = "popular",
    exclude_ids = [],
    language = "both",
    limit = 10,
    min_rating,
    include_metadata = true,
    include_reasons = false,
    diversify = true,
    time_range = "month",
  } = context.body.details;

  try {
    let recommendations: any[] = [];
    const reasons: any[] = [];

    // Helper function to get time range date
    const getTimeRangeDate = (range: string) => {
      const now = new Date();
      switch (range) {
        case "day":
          return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case "week":
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "month":
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "quarter":
          return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case "year":
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return new Date(0);
      }
    };

    // Helper function to build common lookups
    const buildCommonLookups = () => [
      {
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
                color: 1
              }
            }
          ]
        }
      },
      {
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
                slug: 1
              }
            }
          ]
        }
      },
      {
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
                filename: 1
              }
            }
          ]
        }
      }
    ];

    // Helper function to build base filters
    const buildBaseFilters = (contentType: string) => {
      const filters: any = {};

      if (contentType === "Article") {
        filters.status = "Published";
      } else {
        filters.status = "Active";
      }

      if (contentType === "Workshop") {
        filters.type = "Workshop";
      }

      if (category_id) {
        filters.category = category_id;
      }

      if (exclude_ids.length > 0) {
        filters._id = { $nin: exclude_ids };
      }

      if (min_rating !== undefined) {
        filters.average_rating = { $gte: min_rating };
      }

      return filters;
    };

    // Similar Content Recommendations
    if (recommendation_type === "similar" && content_id) {
      try {
        // First, get the content details
        const sourceContent = await coreApp.deps.lesan.features.mongoDB.db
          .collection(content_type?.toLowerCase() || "course")
          .findOne({ _id: content_id });

        if (sourceContent) {
          const similarityPipeline = [
            {
              $match: {
                ...buildBaseFilters(content_type || "Course"),
                _id: { $ne: content_id }
              }
            },
            ...buildCommonLookups(),
            {
              $addFields: {
                similarity_score: {
                  $add: [
                    // Category similarity (highest weight)
                    {
                      $cond: [
                        { $eq: ["$category", sourceContent.category] },
                        50,
                        0
                      ]
                    },
                    // Tag similarity
                    {
                      $multiply: [
                        {
                          $size: {
                            $setIntersection: [
                              { $ifNull: ["$tags", []] },
                              sourceContent.tags || []
                            ]
                          }
                        },
                        10
                      ]
                    },
                    // Level similarity (for courses)
                    {
                      $cond: [
                        { $eq: ["$level", sourceContent.level] },
                        20,
                        0
                      ]
                    },
                    // Price range similarity
                    {
                      $cond: [
                        {
                          $and: [
                            { $gte: ["$price", sourceContent.price * 0.7] },
                            { $lte: ["$price", sourceContent.price * 1.3] }
                          ]
                        },
                        15,
                        0
                      ]
                    },
                    // Rating bonus
                    { $multiply: [{ $ifNull: ["$average_rating", 0] }, 2] }
                  ]
                }
              }
            },
            { $match: { similarity_score: { $gt: 10 } } },
            { $sort: { similarity_score: -1, created_at: -1 } },
            { $limit: limit }
          ];

          const collection = content_type?.toLowerCase() === "workshop" ? "course" :
            (content_type?.toLowerCase() || "course");

          recommendations = await coreApp.deps.lesan.features.mongoDB.db
            .collection(collection)
            .aggregate(similarityPipeline)
            .toArray();

          if (include_reasons) {
            reasons.push({
              type: "similar_content",
              message: `مشابه ${sourceContent.name || sourceContent.title}`,
              message_en: `Similar to ${sourceContent.name_en || sourceContent.title_en || sourceContent.name || sourceContent.title}`
            });
          }
        }
      } catch (error) {
        console.log("Similar content error:", error);
      }
    }

    // Popular Content Recommendations
    else if (recommendation_type === "popular") {
      const timeFilter = getTimeRangeDate(time_range);

      for (const contentType of content_types) {
        const popularityPipeline = [
          {
            $match: {
              ...buildBaseFilters(contentType),
              created_at: { $gte: timeFilter }
            }
          },
          ...buildCommonLookups(),
          {
            $addFields: {
              popularity_score: {
                $add: [
                  { $multiply: [{ $ifNull: ["$view_count", 0] }, 1] },
                  { $multiply: [{ $ifNull: ["$like_count", 0] }, 3] },
                  { $multiply: [{ $ifNull: ["$enrollment_count", 0] }, 5] },
                  { $multiply: [{ $ifNull: ["$comment_count", 0] }, 2] },
                  { $multiply: [{ $ifNull: ["$average_rating", 0] }, 10] },
                  { $cond: [{ $eq: ["$featured", true] }, 20, 0] }
                ]
              }
            }
          },
          { $sort: { popularity_score: -1, created_at: -1 } },
          { $limit: Math.ceil(limit / content_types.length) }
        ];

        const collection = contentType.toLowerCase() === "workshop" ? "course" :
          contentType.toLowerCase();

        const popular = await coreApp.deps.lesan.features.mongoDB.db
          .collection(collection)
          .aggregate(popularityPipeline)
          .toArray();

        recommendations.push(...popular.map(item => ({
          ...item,
          content_type: contentType,
          recommendation_reason: "popular"
        })));
      }

      if (include_reasons) {
        reasons.push({
          type: "popular_content",
          message: `محبوب‌ترین محتوا در ${time_range === "day" ? "روز" : time_range === "week" ? "هفته" : time_range === "month" ? "ماه" : "سال"} گذشته`,
          message_en: `Most popular content in the last ${time_range}`
        });
      }
    }

    // Trending Content Recommendations
    else if (recommendation_type === "trending") {
      const trendingTimeFilter = getTimeRangeDate("week"); // Last week for trending
      const comparisonTimeFilter = getTimeRangeDate("month"); // Compare with last month

      for (const contentType of content_types) {
        const trendingPipeline = [
          {
            $match: {
              ...buildBaseFilters(contentType),
              created_at: { $gte: comparisonTimeFilter }
            }
          },
          ...buildCommonLookups(),
          {
            $addFields: {
              recent_engagement: {
                $cond: [
                  { $gte: ["$updated_at", trendingTimeFilter] },
                  {
                    $add: [
                      { $ifNull: ["$view_count", 0] },
                      { $multiply: [{ $ifNull: ["$like_count", 0] }, 2] },
                      { $multiply: [{ $ifNull: ["$enrollment_count", 0] }, 3] }
                    ]
                  },
                  0
                ]
              },
              trending_score: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $add: [
                          { $ifNull: ["$view_count", 0] },
                          { $multiply: [{ $ifNull: ["$like_count", 0] }, 2] }
                        ]
                      },
                      {
                        $add: [
                          {
                            $divide: [
                              { $subtract: [new Date(), "$created_at"] },
                              86400000 // days since creation
                            ]
                          },
                          1
                        ]
                      }
                    ]
                  },
                  100
                ]
              }
            }
          },
          { $match: { recent_engagement: { $gt: 0 } } },
          { $sort: { trending_score: -1, recent_engagement: -1 } },
          { $limit: Math.ceil(limit / content_types.length) }
        ];

        const collection = contentType.toLowerCase() === "workshop" ? "course" :
          contentType.toLowerCase();

        const trending = await coreApp.deps.lesan.features.mongoDB.db
          .collection(collection)
          .aggregate(trendingPipeline)
          .toArray();

        recommendations.push(...trending.map(item => ({
          ...item,
          content_type: contentType,
          recommendation_reason: "trending"
        })));
      }

      if (include_reasons) {
        reasons.push({
          type: "trending_content",
          message: "محتوای پرطرفدار و داغ",
          message_en: "Hot and trending content"
        });
      }
    }

    // Personalized Recommendations (based on user history)
    else if (recommendation_type === "personalized" && user_id) {
      try {
        // Get user's interaction history
        const userInteractions = await coreApp.deps.lesan.features.mongoDB.db
          .collection("user_interaction")
          .find({
            user_id: user_id,
            created_at: { $gte: getTimeRangeDate("month") }
          })
          .sort({ created_at: -1 })
          .limit(50)
          .toArray();

        // Get user's enrolled courses
        const userEnrollments = await coreApp.deps.lesan.features.mongoDB.db
          .collection("enrollment")
          .find({
            user_id: user_id,
            status: { $in: ["Active", "Completed"] }
          })
          .toArray();

        // Extract categories and tags from user history
        const userCategories = new Set();
        const userTags = new Set();
        const viewedContent = new Set();

        userInteractions.forEach(interaction => {
          if (interaction.category) userCategories.add(interaction.category);
          if (interaction.tags) interaction.tags.forEach((tag: string) => userTags.add(tag));
          if (interaction.content_id) viewedContent.add(interaction.content_id);
        });

        userEnrollments.forEach(enrollment => {
          viewedContent.add(enrollment.course_id);
        });

        // Build personalized recommendations
        for (const contentType of content_types) {
          const personalizedPipeline = [
            {
              $match: {
                ...buildBaseFilters(contentType),
                _id: { $nin: Array.from(viewedContent) },
                $or: [
                  { category: { $in: Array.from(userCategories) } },
                  { tags: { $in: Array.from(userTags) } }
                ]
              }
            },
            ...buildCommonLookups(),
            {
              $addFields: {
                personalization_score: {
                  $add: [
                    // Category match
                    {
                      $cond: [
                        { $in: ["$category", Array.from(userCategories)] },
                        40,
                        0
                      ]
                    },
                    // Tag matches
                    {
                      $multiply: [
                        {
                          $size: {
                            $setIntersection: [
                              { $ifNull: ["$tags", []] },
                              Array.from(userTags)
                            ]
                          }
                        },
                        15
                      ]
                    },
                    // Quality bonus
                    { $multiply: [{ $ifNull: ["$average_rating", 0] }, 8] },
                    // Popularity bonus
                    { $multiply: [{ $ifNull: ["$enrollment_count", 0] }, 0.1] }
                  ]
                }
              }
            },
            { $match: { personalization_score: { $gt: 10 } } },
            { $sort: { personalization_score: -1, created_at: -1 } },
            { $limit: Math.ceil(limit / content_types.length) }
          ];

          const collection = contentType.toLowerCase() === "workshop" ? "course" :
            contentType.toLowerCase();

          const personalized = await coreApp.deps.lesan.features.mongoDB.db
            .collection(collection)
            .aggregate(personalizedPipeline)
            .toArray();

          recommendations.push(...personalized.map(item => ({
            ...item,
            content_type: contentType,
            recommendation_reason: "personalized"
          })));
        }

        if (include_reasons) {
          reasons.push({
            type: "personalized_content",
            message: "براساس علایق شما",
            message_en: "Based on your interests"
          });
        }
      } catch (error) {
        console.log("Personalized recommendations error:", error);
      }
    }

    // Category-based Recommendations
    else if (recommendation_type === "category_based" && category_id) {
      for (const contentType of content_types) {
        const categoryPipeline = [
          {
            $match: {
              ...buildBaseFilters(contentType),
              category: category_id
            }
          },
          ...buildCommonLookups(),
          {
            $addFields: {
              category_score: {
                $add: [
                  { $multiply: [{ $ifNull: ["$average_rating", 0] }, 10] },
                  { $multiply: [{ $ifNull: ["$enrollment_count", 0] }, 0.5] },
                  { $multiply: [{ $ifNull: ["$view_count", 0] }, 0.1] },
                  { $cond: [{ $eq: ["$featured", true] }, 20, 0] }
                ]
              }
            }
          },
          { $sort: { category_score: -1, created_at: -1 } },
          { $limit: Math.ceil(limit / content_types.length) }
        ];

        const collection = contentType.toLowerCase() === "workshop" ? "course" :
          contentType.toLowerCase();

        const categoryBased = await coreApp.deps.lesan.features.mongoDB.db
          .collection(collection)
          .aggregate(categoryPipeline)
          .toArray();

        recommendations.push(...categoryBased.map(item => ({
          ...item,
          content_type: contentType,
          recommendation_reason: "category_based"
        })));
      }

      if (include_reasons) {
        reasons.push({
          type: "category_based",
          message: "محتوای مرتبط در همین دسته‌بندی",
          message_en: "Related content in this category"
        });
      }
    }

    // Recently Viewed Follow-up
    else if (recommendation_type === "recently_viewed" && user_id) {
      try {
        const recentViews = await coreApp.deps.lesan.features.mongoDB.db
          .collection("user_interaction")
          .find({
            user_id: user_id,
            action: "view",
            created_at: { $gte: getTimeRangeDate("week") }
          })
          .sort({ created_at: -1 })
          .limit(10)
          .toArray();

        // Get follow-up content for recently viewed items
        for (const view of recentViews.slice(0, 3)) {
          const followUpPipeline = [
            {
              $match: {
                ...buildBaseFilters(view.content_type),
                _id: { $ne: view.content_id },
                $or: [
                  { category: view.category },
                  { tags: { $in: view.tags || [] } },
                  { instructor: view.instructor_id }
                ]
              }
            },
            ...buildCommonLookups(),
            {
              $addFields: {
                follow_up_score: {
                  $add: [
                    { $cond: [{ $eq: ["$category", view.category] }, 30, 0] },
                    { $cond: [{ $eq: ["$instructor", view.instructor_id] }, 25, 0] },
                    { $multiply: [{ $ifNull: ["$average_rating", 0] }, 5] }
                  ]
                }
              }
            },
            { $sort: { follow_up_score: -1, created_at: -1 } },
            { $limit: 2 }
          ];

          const collection = view.content_type?.toLowerCase() === "workshop" ? "course" :
            (view.content_type?.toLowerCase() || "course");

          const followUp = await coreApp.deps.lesan.features.mongoDB.db
            .collection(collection)
            .aggregate(followUpPipeline)
            .toArray();

          recommendations.push(...followUp.map(item => ({
            ...item,
            content_type: view.content_type,
            recommendation_reason: "recently_viewed"
          })));
        }

        if (include_reasons) {
          reasons.push({
            type: "recently_viewed",
            message: "ادامه محتوای مشاهده شده",
            message_en: "Follow-up to recently viewed content"
          });
        }
      } catch (error) {
        console.log("Recently viewed error:", error);
      }
    }

    // Diversify results if requested
    if (diversify && recommendations.length > 0) {
      const diversified: any[] = [];
      const usedCategories = new Set();
      const usedContentTypes = new Set();

      // First pass: one item per category/content type
      recommendations.forEach(item => {
        const categoryKey = `${item.content_type}-${item.category?.[0]?._id}`;
        if (!usedCategories.has(categoryKey) && diversified.length < limit) {
          diversified.push(item);
          usedCategories.add(categoryKey);
          usedContentTypes.add(item.content_type);
        }
      });

      // Second pass: fill remaining slots
      recommendations.forEach(item => {
        if (diversified.length >= limit) return;
        if (!diversified.find(d => d._id === item._id)) {
          diversified.push(item);
        }
      });

      recommendations = diversified.slice(0, limit);
    } else {
      recommendations = recommendations.slice(0, limit);
    }

    // Format final results
    const formattedRecommendations = recommendations.map(item => ({
      ...item,
      category: item.category?.[0] || null,
      featured_image: item.featured_image?.[0] || null,
      tags: item.tags || [],
      display_title: language === "en" && item.name_en ? item.name_en :
        (item.name || item.title),
      display_description: language === "en" && item.description_en ? item.description_en :
        (item.description || item.excerpt),
      final_price: item.discounted_price && item.discounted_price > 0 ?
        item.discounted_price : (item.price || 0),
      recommendation_score: item.similarity_score || item.popularity_score ||
        item.trending_score || item.personalization_score ||
        item.category_score || item.follow_up_score || 0,
    }));

    // Metadata
    const metadata: any = {
      recommendation_type,
      total_recommendations: formattedRecommendations.length,
      content_types_included: [...new Set(formattedRecommendations.map(r => r.content_type))],
      generated_at: new Date().toISOString(),
      language,
      diversified: diversify,
    };

    if (user_id) metadata.user_id = user_id;
    if (content_id) metadata.source_content_id = content_id;
    if (category_id) metadata.category_id = category_id;

    return {
      success: true,
      data: {
        recommendations: formattedRecommendations,
        reasons: include_reasons ? reasons : undefined,
        metadata: include_metadata ? metadata : undefined,
      },
    };

  } catch (error) {
    console.error("Get recommendations error:", error);
    return {
      success: false,
      message: "خطا در دریافت پیشنهادات",
      message_en: "Error getting recommendations",
      error: error.message,
    };
  }
};

export default getRecommendationsHandler;
