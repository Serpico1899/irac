import {  coreApp  } from "@app";

const searchCoursesHandler = async (context: any) => {
  const {
    query = "",
    category_id,
    tags = [],
    level,
    type,
    instructor_id,
    language = "both",
    min_price,
    max_price,
    is_free,
    duration_min,
    duration_max,
    start_date_from,
    start_date_to,
    enrollment_status,
    has_certificate,
    min_rating,
    featured_only,
    sort_by = "relevance",
    page = 1,
    limit = 12,
    include_instructor = true,
    include_category = true,
    include_tags = true,
    include_image = true,
  } = context.body.details;

  try {
    const skip = (page - 1) * limit;

    // Build match conditions
    const matchConditions: any = {
      status: "Active",
    };

    // Text search conditions
    if (query.trim()) {
      const searchConditions = [];

      if (language === "both" || language === "fa") {
        searchConditions.push(
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { summary: { $regex: query, $options: "i" } }
        );
      }

      if (language === "both" || language === "en") {
        searchConditions.push(
          { name_en: { $regex: query, $options: "i" } },
          { description_en: { $regex: query, $options: "i" } },
          { summary_en: { $regex: query, $options: "i" } }
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

    // Level filter
    if (level) {
      matchConditions.level = level;
    }

    // Type filter
    if (type) {
      matchConditions.type = type;
    }

    // Instructor filter
    if (instructor_id) {
      matchConditions.instructor = instructor_id;
    }

    // Price filters
    if (is_free === true) {
      matchConditions.$or = [
        { is_free: true },
        { price: 0 },
        { discounted_price: 0 }
      ];
    } else if (is_free === false) {
      matchConditions.is_free = { $ne: true };
      matchConditions.price = { $gt: 0 };
    }

    if (min_price !== undefined || max_price !== undefined) {
      const priceFilter: any = {};
      if (min_price !== undefined) priceFilter.$gte = min_price;
      if (max_price !== undefined) priceFilter.$lte = max_price;

      if (matchConditions.price) {
        matchConditions.price = { ...matchConditions.price, ...priceFilter };
      } else {
        matchConditions.price = priceFilter;
      }
    }

    // Duration filters
    if (duration_min !== undefined || duration_max !== undefined) {
      const durationFilter: any = {};
      if (duration_min !== undefined) durationFilter.$gte = duration_min;
      if (duration_max !== undefined) durationFilter.$lte = duration_max;
      matchConditions.duration_hours = durationFilter;
    }

    // Date filters
    if (start_date_from || start_date_to) {
      const dateFilter: any = {};
      if (start_date_from) dateFilter.$gte = new Date(start_date_from);
      if (start_date_to) dateFilter.$lte = new Date(start_date_to);
      matchConditions.start_date = dateFilter;
    }

    // Enrollment status filter
    if (enrollment_status) {
      const now = new Date();
      switch (enrollment_status) {
        case "open":
          matchConditions.enrollment_end_date = { $gte: now };
          matchConditions.max_students = { $gt: 0 };
          matchConditions.$expr = {
            $lt: [{ $ifNull: ["$current_students", 0] }, "$max_students"]
          };
          break;
        case "closed":
          matchConditions.enrollment_end_date = { $lt: now };
          break;
        case "full":
          matchConditions.$expr = {
            $gte: [{ $ifNull: ["$current_students", 0] }, "$max_students"]
          };
          break;
        case "upcoming":
          matchConditions.start_date = { $gt: now };
          break;
      }
    }

    // Certificate filter
    if (has_certificate !== undefined) {
      matchConditions.has_certificate = has_certificate;
    }

    // Rating filter
    if (min_rating !== undefined) {
      matchConditions.average_rating = { $gte: min_rating };
    }

    // Featured filter
    if (featured_only) {
      matchConditions.featured = true;
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
                color: 1
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

    if (include_instructor) {
      pipeline.push({
        $lookup: {
          from: "user",
          localField: "instructor",
          foreignField: "_id",
          as: "instructor",
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
                expertise: 1
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
                filename: 1
              }
            }
          ]
        }
      });
    }

    // Add computed fields
    pipeline.push({
      $addFields: {
        // Calculate enrollment availability
        enrollment_available: {
          $and: [
            { $gte: ["$enrollment_end_date", new Date()] },
            { $lt: [{ $ifNull: ["$current_students", 0] }, "$max_students"] }
          ]
        },
        // Calculate progress percentage
        enrollment_progress: {
          $cond: [
            { $gt: ["$max_students", 0] },
            {
              $multiply: [
                { $divide: [{ $ifNull: ["$current_students", 0] }, "$max_students"] },
                100
              ]
            },
            0
          ]
        },
        // Calculate days until start
        days_until_start: {
          $cond: [
            { $gte: ["$start_date", new Date()] },
            {
              $divide: [
                { $subtract: ["$start_date", new Date()] },
                86400000 // milliseconds in a day
              ]
            },
            -1
          ]
        },
        // Price after discount
        final_price: {
          $cond: [
            { $gt: ["$discounted_price", 0] },
            "$discounted_price",
            "$price"
          ]
        },
        // Discount percentage
        discount_percentage: {
          $cond: [
            { $and: [{ $gt: ["$price", 0] }, { $gt: ["$discounted_price", 0] }] },
            {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ["$price", "$discounted_price"] },
                    "$price"
                  ]
                },
                100
              ]
            },
            0
          ]
        }
      }
    });

    // Add sorting
    const sortStage: any = {};
    switch (sort_by) {
      case "created_at":
        sortStage.created_at = -1;
        break;
      case "start_date":
        sortStage.start_date = 1;
        break;
      case "price_asc":
        sortStage.final_price = 1;
        break;
      case "price_desc":
        sortStage.final_price = -1;
        break;
      case "rating":
        sortStage.average_rating = -1;
        sortStage.rating_count = -1;
        break;
      case "popularity":
        sortStage.enrollment_count = -1;
        sortStage.view_count = -1;
        break;
      case "enrollment_count":
        sortStage.current_students = -1;
        break;
      case "alphabetical":
        if (language === "en") {
          sortStage.name_en = 1;
        } else {
          sortStage.name = 1;
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
          sortStage.created_at = -1;
        }
        break;
    }

    pipeline.push({ $sort: sortStage });

    // Get total count
    const countPipeline = [
      ...pipeline.slice(0, -1), // Remove sort stage
      { $count: "total" }
    ];

    const countResult = await coreApp.deps.lesan.features.mongoDB.db
      .collection("course")
      .aggregate(countPipeline)
      .toArray();

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Execute main query
    const courses = await coreApp.deps.lesan.features.mongoDB.db
      .collection("course")
      .aggregate(pipeline)
      .toArray();

    // Format results
    const formattedCourses = courses.map(course => ({
      ...course,
      category: course.category?.[0] || null,
      instructor: course.instructor?.[0] || null,
      featured_image: course.featured_image?.[0] || null,
      tags: course.tags || [],
      enrollment_available: course.enrollment_available || false,
      enrollment_progress: Math.round(course.enrollment_progress || 0),
      days_until_start: Math.ceil(course.days_until_start || -1),
      final_price: course.final_price || 0,
      discount_percentage: Math.round(course.discount_percentage || 0),
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
        .collection("course")
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

      // Level facets
      const levelFacets = await coreApp.deps.lesan.features.mongoDB.db
        .collection("course")
        .aggregate([
          { $match: matchConditions },
          { $group: { _id: "$level", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
        .toArray();

      facets.levels = levelFacets.reduce((acc: any, item: any) => {
        if (item._id) {
          acc[item._id] = item.count;
        }
        return acc;
      }, {});

      // Price range facets
      const priceFacets = await coreApp.deps.lesan.features.mongoDB.db
        .collection("course")
        .aggregate([
          { $match: matchConditions },
          {
            $bucket: {
              groupBy: "$price",
              boundaries: [0, 1, 1000000, 3000000, 5000000, Infinity],
              default: "other",
              output: { count: { $sum: 1 } }
            }
          }
        ])
        .toArray();

      facets.price_ranges = priceFacets.reduce((acc: any, item: any) => {
        const key = item._id === 0 ? "free" :
          item._id === 1 ? "under_1m" :
            item._id === 1000000 ? "1m_3m" :
              item._id === 3000000 ? "3m_5m" :
                item._id === 5000000 ? "5m_plus" : "other";
        acc[key] = item.count;
        return acc;
      }, {});
    }

    return {
      success: true,
      data: {
        courses: formattedCourses,
        pagination,
        facets,
        search_info: {
          query: query.trim(),
          total_results: totalCount,
          search_time: Date.now(),
          filters_applied: {
            category: !!category_id,
            tags: tags.length > 0,
            level: !!level,
            type: !!type,
            instructor: !!instructor_id,
            price_range: !!(min_price || max_price || is_free !== undefined),
            duration: !!(duration_min || duration_max),
            date_range: !!(start_date_from || start_date_to),
            enrollment_status: !!enrollment_status,
            has_certificate: has_certificate !== undefined,
            rating: !!min_rating,
            featured_only: !!featured_only,
          },
          sort_by,
          language,
        },
      },
    };

  } catch (error) {
    console.error("Search courses error:", error);
    return {
      success: false,
      message: "خطا در جستجوی دوره‌ها",
      message_en: "Error searching courses",
      error: error.message,
    };
  }
};

export default searchCoursesHandler;
