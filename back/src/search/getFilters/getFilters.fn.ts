import { coreApp } from "../../mod.ts";

const getFiltersHandler = async (context: any) => {
  const {
    content_types = ["Course", "Article", "Workshop", "Product"],
    category_id,
    include_counts = true,
    language = "both",
  } = context.body.details;

  try {
    const filters: any = {
      content_types: {},
      categories: {},
      levels: {},
      price_ranges: {},
      languages: {},
      instructors: {},
      authors: {},
      tags: {},
      durations: {},
      ratings: {},
    };

    // Get categories
    const categoryMatch: any = { status: "Active" };
    if (category_id) {
      categoryMatch.parent_category = category_id;
    } else {
      categoryMatch.parent_category = { $exists: false };
    }

    const categories = await coreApp.deps.lesan.features.mongoDB.db
      .collection("category")
      .find(categoryMatch)
      .toArray();

    for (const category of categories) {
      let count = 0;
      if (include_counts) {
        // Count content in this category across all content types
        const categoryCountPromises = content_types.map(async (type) => {
          const collection = type.toLowerCase();
          if (collection === "workshop") {
            return await coreApp.deps.lesan.features.mongoDB.db
              .collection("course")
              .countDocuments({
                "category.details._id": category._id,
                type: "Workshop",
                status: "Active"
              });
          } else {
            const statusField = collection === "article" ? "Published" : "Active";
            return await coreApp.deps.lesan.features.mongoDB.db
              .collection(collection)
              .countDocuments({
                "category.details._id": category._id,
                status: statusField
              });
          }
        });
        const counts = await Promise.all(categoryCountPromises);
        count = counts.reduce((sum, c) => sum + c, 0);
      }

      filters.categories[category._id] = {
        name: category.name,
        name_en: category.name_en,
        slug: category.slug,
        count,
      };
    }

    // Get content type counts
    if (include_counts) {
      for (const type of content_types) {
        let count = 0;
        const collection = type.toLowerCase();

        if (collection === "workshop") {
          count = await coreApp.deps.lesan.features.mongoDB.db
            .collection("course")
            .countDocuments({
              type: "Workshop",
              status: "Active"
            });
        } else {
          const statusField = collection === "article" ? "Published" : "Active";
          count = await coreApp.deps.lesan.features.mongoDB.db
            .collection(collection)
            .countDocuments({ status: statusField });
        }

        filters.content_types[type] = count;
      }
    }

    // Get level distribution
    const levels = ["Beginner", "Intermediate", "Advanced"];
    for (const level of levels) {
      let count = 0;
      if (include_counts) {
        const levelCountPromises = content_types.filter(type =>
          type === "Course" || type === "Workshop"
        ).map(async (type) => {
          if (type === "Workshop") {
            return await coreApp.deps.lesan.features.mongoDB.db
              .collection("course")
              .countDocuments({
                level,
                type: "Workshop",
                status: "Active"
              });
          } else {
            return await coreApp.deps.lesan.features.mongoDB.db
              .collection("course")
              .countDocuments({
                level,
                status: "Active"
              });
          }
        });
        const counts = await Promise.all(levelCountPromises);
        count = counts.reduce((sum, c) => sum + c, 0);
      }

      filters.levels[level] = {
        label: level === "Beginner" ? "مبتدی" :
          level === "Intermediate" ? "متوسط" : "پیشرفته",
        label_en: level,
        count,
      };
    }

    // Get price ranges
    const priceRanges = [
      { key: "free", min: 0, max: 0, label: "رایگان", label_en: "Free" },
      { key: "under_1m", min: 1, max: 999999, label: "زیر ۱ میلیون", label_en: "Under 1M" },
      { key: "1m_3m", min: 1000000, max: 2999999, label: "۱ تا ۳ میلیون", label_en: "1M-3M" },
      { key: "3m_5m", min: 3000000, max: 4999999, label: "۳ تا ۵ میلیون", label_en: "3M-5M" },
      { key: "5m_plus", min: 5000000, max: null, label: "بالای ۵ میلیون", label_en: "5M+" },
    ];

    for (const range of priceRanges) {
      let count = 0;
      if (include_counts) {
        const priceCountPromises = content_types.filter(type =>
          type === "Course" || type === "Workshop" || type === "Product"
        ).map(async (type) => {
          let priceFilter: any = {};

          if (range.key === "free") {
            priceFilter = {
              $or: [
                { is_free: true },
                { price: 0 },
                { discounted_price: 0 }
              ]
            };
          } else {
            priceFilter.price = {};
            if (range.min !== null) priceFilter.price.$gte = range.min;
            if (range.max !== null) priceFilter.price.$lte = range.max;
          }

          const collection = type.toLowerCase();
          if (collection === "workshop") {
            return await coreApp.deps.lesan.features.mongoDB.db
              .collection("course")
              .countDocuments({
                ...priceFilter,
                type: "Workshop",
                status: "Active"
              });
          } else {
            return await coreApp.deps.lesan.features.mongoDB.db
              .collection(collection)
              .countDocuments({
                ...priceFilter,
                status: "Active"
              });
          }
        });
        const counts = await Promise.all(priceCountPromises);
        count = counts.reduce((sum, c) => sum + c, 0);
      }

      filters.price_ranges[range.key] = {
        min: range.min,
        max: range.max,
        label: range.label,
        label_en: range.label_en,
        count,
      };
    }

    // Get instructors (for courses and workshops)
    if (content_types.includes("Course") || content_types.includes("Workshop")) {
      const instructorPipeline = [
        {
          $match: {
            status: "Active",
            instructor: { $exists: true }
          }
        },
        {
          $lookup: {
            from: "user",
            localField: "instructor",
            foreignField: "_id",
            as: "instructor_details"
          }
        },
        {
          $unwind: "$instructor_details"
        },
        {
          $group: {
            _id: "$instructor_details._id",
            name: { $first: "$instructor_details.first_name" },
            last_name: { $first: "$instructor_details.last_name" },
            name_en: { $first: "$instructor_details.first_name_en" },
            last_name_en: { $first: "$instructor_details.last_name_en" },
            course_count: { $sum: 1 }
          }
        },
        { $sort: { course_count: -1 } },
        { $limit: 50 }
      ];

      const instructors = await coreApp.deps.lesan.features.mongoDB.db
        .collection("course")
        .aggregate(instructorPipeline)
        .toArray();

      for (const instructor of instructors) {
        filters.instructors[instructor._id] = {
          name: `${instructor.name} ${instructor.last_name || ''}`.trim(),
          name_en: `${instructor.name_en || instructor.name} ${instructor.last_name_en || instructor.last_name || ''}`.trim(),
          count: instructor.course_count,
        };
      }
    }

    // Get authors (for articles)
    if (content_types.includes("Article")) {
      const authorPipeline = [
        {
          $match: {
            status: "Published",
            author: { $exists: true }
          }
        },
        {
          $lookup: {
            from: "user",
            localField: "author",
            foreignField: "_id",
            as: "author_details"
          }
        },
        {
          $unwind: "$author_details"
        },
        {
          $group: {
            _id: "$author_details._id",
            name: { $first: "$author_details.first_name" },
            last_name: { $first: "$author_details.last_name" },
            name_en: { $first: "$author_details.first_name_en" },
            last_name_en: { $first: "$author_details.last_name_en" },
            article_count: { $sum: 1 }
          }
        },
        { $sort: { article_count: -1 } },
        { $limit: 50 }
      ];

      const authors = await coreApp.deps.lesan.features.mongoDB.db
        .collection("article")
        .aggregate(authorPipeline)
        .toArray();

      for (const author of authors) {
        filters.authors[author._id] = {
          name: `${author.name} ${author.last_name || ''}`.trim(),
          name_en: `${author.name_en || author.name} ${author.last_name_en || author.last_name || ''}`.trim(),
          count: author.article_count,
        };
      }
    }

    // Get popular tags
    const tagPipeline = [
      {
        $match: {
          status: { $in: ["Active", "Published"] },
          tags: { $exists: true, $not: { $size: 0 } }
        }
      },
      {
        $lookup: {
          from: "tag",
          localField: "tags",
          foreignField: "_id",
          as: "tag_details"
        }
      },
      {
        $unwind: "$tag_details"
      },
      {
        $group: {
          _id: "$tag_details._id",
          name: { $first: "$tag_details.name" },
          name_en: { $first: "$tag_details.name_en" },
          usage_count: { $sum: 1 }
        }
      },
      { $sort: { usage_count: -1 } },
      { $limit: 100 }
    ];

    // Aggregate tags from all content types
    const tagPromises = content_types.map(async (type) => {
      const collection = type.toLowerCase();
      if (collection === "workshop") {
        return await coreApp.deps.lesan.features.mongoDB.db
          .collection("course")
          .aggregate([
            { $match: { type: "Workshop" } },
            ...tagPipeline.slice(1)
          ])
          .toArray();
      } else {
        return await coreApp.deps.lesan.features.mongoDB.db
          .collection(collection)
          .aggregate(tagPipeline)
          .toArray();
      }
    });

    const tagResults = await Promise.all(tagPromises);
    const allTags = tagResults.flat();

    // Merge duplicate tags
    const tagMap = new Map();
    for (const tag of allTags) {
      if (tagMap.has(tag._id)) {
        tagMap.get(tag._id).usage_count += tag.usage_count;
      } else {
        tagMap.set(tag._id, tag);
      }
    }

    // Convert to filters format
    Array.from(tagMap.values())
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 50)
      .forEach(tag => {
        filters.tags[tag._id] = {
          name: tag.name,
          name_en: tag.name_en,
          count: tag.usage_count,
        };
      });

    // Duration ranges
    const durationRanges = [
      { key: "short", min: 0, max: 4, label: "کوتاه (تا ۴ هفته)", label_en: "Short (up to 4 weeks)" },
      { key: "medium", min: 5, max: 12, label: "متوسط (۱-۳ ماه)", label_en: "Medium (1-3 months)" },
      { key: "long", min: 13, max: null, label: "طولانی (بیش از ۳ ماه)", label_en: "Long (3+ months)" },
    ];

    for (const range of durationRanges) {
      filters.durations[range.key] = {
        min_weeks: range.min,
        max_weeks: range.max,
        label: range.label,
        label_en: range.label_en,
        count: 0, // Would need complex calculation
      };
    }

    // Rating ranges
    const ratingRanges = [
      { key: "4_plus", min: 4.0, label: "۴ ستاره و بالاتر", label_en: "4+ Stars" },
      { key: "4_5_plus", min: 4.5, label: "۴.۵ ستاره و بالاتر", label_en: "4.5+ Stars" },
      { key: "5_star", min: 5.0, label: "۵ ستاره", label_en: "5 Stars" },
    ];

    for (const range of ratingRanges) {
      filters.ratings[range.key] = {
        min_rating: range.min,
        label: range.label,
        label_en: range.label_en,
        count: 0, // Would need rating calculation
      };
    }

    // Language options
    filters.languages = {
      fa: { label: "فارسی", label_en: "Persian", count: 0 },
      en: { label: "انگلیسی", label_en: "English", count: 0 },
      both: { label: "دوزبانه", label_en: "Bilingual", count: 0 },
    };

    return {
      success: true,
      data: {
        filters,
        metadata: {
          generated_at: new Date().toISOString(),
          content_types: content_types,
          include_counts: include_counts,
          language: language,
        },
      },
    };

  } catch (error) {
    console.error("Get filters error:", error);
    return {
      success: false,
      message: "خطا در دریافت فیلترها",
      message_en: "Error getting filters",
    };
  }
};

export default getFiltersHandler;
