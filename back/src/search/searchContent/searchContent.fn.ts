import { coreApp } from "../../mod.ts";

const searchContentHandler = async (context: any) => {
  const {
    query = "",
    content_types = ["Course", "Article", "Workshop", "Product"],
    category_id,
    tags = [],
    level,
    language = "both",
    min_price,
    max_price,
    is_free,
    date_from,
    date_to,
    duration_min,
    duration_max,
    min_rating,
    instructor_id,
    author_id,
    featured_only,
    sort_by = "relevance",
    page = 1,
    limit = 12,
    include_facets = true,
  } = context.body.details;

  try {
    const skip = (page - 1) * limit;
    const results: any[] = [];
    let totalCount = 0;
    const facets: any = {
      content_types: {},
      categories: {},
      levels: {},
      price_ranges: {},
      languages: {},
      tags: {},
    };

    // Build common aggregation stages
    const buildTextSearchStage = () => {
      if (!query.trim()) return {};

      const searchConditions = [];

      // Persian and English text search
      if (language === "both" || language === "fa") {
        searchConditions.push(
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { summary: { $regex: query, $options: "i" } }
        );
      }

      if (language === "both" || language === "en") {
        searchConditions.push(
          { name_en: { $regex: query, $options: "i" } },
          { description_en: { $regex: query, $options: "i" } },
          { content_en: { $regex: query, $options: "i" } },
          { summary_en: { $regex: query, $options: "i" } }
        );
      }

      return searchConditions.length > 0 ? { $or: searchConditions } : {};
    };

    const buildCommonFilters = () => {
      const filters: any = {};

      if (category_id) {
        filters["category.details._id"] = category_id;
      }

      if (tags.length > 0) {
        filters["tags.details.name"] = { $in: tags };
      }

      if (level) {
        filters.level = level;
      }

      if (featured_only) {
        filters.featured = true;
      }

      if (min_price !== undefined || max_price !== undefined || is_free !== undefined) {
        if (is_free === true) {
          filters.$or = [
            { is_free: true },
            { price: 0 },
            { discounted_price: 0 }
          ];
        } else if (is_free === false) {
          filters.is_free = { $ne: true };
          filters.price = { $gt: 0 };
        }

        if (min_price !== undefined || max_price !== undefined) {
          const priceFilter: any = {};
          if (min_price !== undefined) priceFilter.$gte = min_price;
          if (max_price !== undefined) priceFilter.$lte = max_price;
          filters.price = priceFilter;
        }
      }

      if (date_from || date_to) {
        const dateFilter: any = {};
        if (date_from) dateFilter.$gte = new Date(date_from);
        if (date_to) dateFilter.$lte = new Date(date_to);
        filters.$or = [
          { start_date: dateFilter },
          { published_at: dateFilter },
          { created_at: dateFilter }
        ];
      }

      if (duration_min !== undefined || duration_max !== undefined) {
        const durationFilter: any = {};
        if (duration_min !== undefined) durationFilter.$gte = duration_min;
        if (duration_max !== undefined) durationFilter.$lte = duration_max;
        filters.duration_hours = durationFilter;
      }

      if (min_rating !== undefined) {
        filters.average_rating = { $gte: min_rating };
      }

      if (instructor_id) {
        filters["instructor.details._id"] = instructor_id;
      }

      if (author_id) {
        filters["author.details._id"] = author_id;
      }

      return filters;
    };

    const buildSortStage = () => {
      switch (sort_by) {
        case "created_at":
          return { created_at: -1 };
        case "updated_at":
          return { updated_at: -1 };
        case "price_asc":
          return { price: 1 };
        case "price_desc":
          return { price: -1 };
        case "rating":
          return { average_rating: -1, rating_count: -1 };
        case "popularity":
          return { enrollment_count: -1, view_count: -1 };
        case "alphabetical":
          return language === "en" ? { name_en: 1 } : { name: 1 };
        case "view_count":
          return { view_count: -1 };
        case "relevance":
        default:
          if (query.trim()) {
            return { score: { $meta: "textScore" } };
          }
          return { created_at: -1 };
      }
    };

    // Search Courses
    if (content_types.includes("Course")) {
      const courseFilters = {
        ...buildTextSearchStage(),
        ...buildCommonFilters(),
        status: "Active",
      };

      const coursePipeline = [
        { $match: courseFilters },
        {
          $lookup: {
            from: "category",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $lookup: {
            from: "tag",
            localField: "tags",
            foreignField: "_id",
            as: "tags"
          }
        },
        {
          $lookup: {
            from: "user",
            localField: "instructor",
            foreignField: "_id",
            as: "instructor"
          }
        },
        {
          $lookup: {
            from: "file",
            localField: "featured_image",
            foreignField: "_id",
            as: "featured_image"
          }
        },
        {
          $addFields: {
            content_type: "Course",
            relevance_score: query.trim() ? { $meta: "textScore" } : 1
          }
        },
        { $sort: buildSortStage() }
      ];

      const courses = await coreApp.deps.lesan.features.mongoDB.db
        .collection("course")
        .aggregate([
          ...coursePipeline,
          { $skip: skip },
          { $limit: limit }
        ])
        .toArray();

      const courseCount = await coreApp.deps.lesan.features.mongoDB.db
        .collection("course")
        .countDocuments(courseFilters);

      results.push(...courses);
      totalCount += courseCount;

      if (include_facets) {
        facets.content_types["Course"] = courseCount;
      }
    }

    // Search Articles
    if (content_types.includes("Article")) {
      const articleFilters = {
        ...buildTextSearchStage(),
        ...buildCommonFilters(),
        status: "Published",
      };

      const articlePipeline = [
        { $match: articleFilters },
        {
          $lookup: {
            from: "category",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $lookup: {
            from: "tag",
            localField: "tags",
            foreignField: "_id",
            as: "tags"
          }
        },
        {
          $lookup: {
            from: "user",
            localField: "author",
            foreignField: "_id",
            as: "author"
          }
        },
        {
          $lookup: {
            from: "file",
            localField: "featured_image",
            foreignField: "_id",
            as: "featured_image"
          }
        },
        {
          $addFields: {
            content_type: "Article",
            relevance_score: query.trim() ? { $meta: "textScore" } : 1
          }
        },
        { $sort: buildSortStage() }
      ];

      const articles = await coreApp.deps.lesan.features.mongoDB.db
        .collection("article")
        .aggregate([
          ...articlePipeline,
          { $skip: skip },
          { $limit: limit }
        ])
        .toArray();

      const articleCount = await coreApp.deps.lesan.features.mongoDB.db
        .collection("article")
        .countDocuments(articleFilters);

      results.push(...articles);
      totalCount += articleCount;

      if (include_facets) {
        facets.content_types["Article"] = articleCount;
      }
    }

    // Search Workshops
    if (content_types.includes("Workshop")) {
      const workshopFilters = {
        ...buildTextSearchStage(),
        ...buildCommonFilters(),
        status: "Active",
        type: "Workshop",
      };

      const workshopPipeline = [
        { $match: workshopFilters },
        {
          $lookup: {
            from: "category",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $lookup: {
            from: "tag",
            localField: "tags",
            foreignField: "_id",
            as: "tags"
          }
        },
        {
          $lookup: {
            from: "user",
            localField: "instructor",
            foreignField: "_id",
            as: "instructor"
          }
        },
        {
          $lookup: {
            from: "file",
            localField: "featured_image",
            foreignField: "_id",
            as: "featured_image"
          }
        },
        {
          $addFields: {
            content_type: "Workshop",
            relevance_score: query.trim() ? { $meta: "textScore" } : 1
          }
        },
        { $sort: buildSortStage() }
      ];

      const workshops = await coreApp.deps.lesan.features.mongoDB.db
        .collection("course")
        .aggregate([
          ...workshopPipeline,
          { $skip: skip },
          { $limit: limit }
        ])
        .toArray();

      const workshopCount = await coreApp.deps.lesan.features.mongoDB.db
        .collection("course")
        .countDocuments(workshopFilters);

      results.push(...workshops);
      totalCount += workshopCount;

      if (include_facets) {
        facets.content_types["Workshop"] = workshopCount;
      }
    }

    // Search Products
    if (content_types.includes("Product")) {
      const productFilters = {
        ...buildTextSearchStage(),
        ...buildCommonFilters(),
        status: "Active",
      };

      const productPipeline = [
        { $match: productFilters },
        {
          $lookup: {
            from: "category",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $lookup: {
            from: "tag",
            localField: "tags",
            foreignField: "_id",
            as: "tags"
          }
        },
        {
          $lookup: {
            from: "file",
            localField: "featured_image",
            foreignField: "_id",
            as: "featured_image"
          }
        },
        {
          $addFields: {
            content_type: "Product",
            relevance_score: query.trim() ? { $meta: "textScore" } : 1
          }
        },
        { $sort: buildSortStage() }
      ];

      const products = await coreApp.deps.lesan.features.mongoDB.db
        .collection("product")
        .aggregate([
          ...productPipeline,
          { $skip: skip },
          { $limit: limit }
        ])
        .toArray();

      const productCount = await coreApp.deps.lesan.features.mongoDB.db
        .collection("product")
        .countDocuments(productFilters);

      results.push(...products);
      totalCount += productCount;

      if (include_facets) {
        facets.content_types["Product"] = productCount;
      }
    }

    // Sort combined results if needed
    if (content_types.length > 1) {
      results.sort((a, b) => {
        if (sort_by === "relevance" && query.trim()) {
          return b.relevance_score - a.relevance_score;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    // Paginate combined results
    const paginatedResults = results.slice(skip, skip + limit);

    // Build additional facets if requested
    if (include_facets) {
      // Get category facets
      const categoryFacets = await coreApp.deps.lesan.features.mongoDB.db
        .collection("category")
        .find({ status: "Active" })
        .toArray();

      facets.categories = categoryFacets.reduce((acc: any, cat: any) => {
        acc[cat._id] = {
          name: cat.name,
          name_en: cat.name_en,
          count: 0 // Would need separate aggregation to get actual counts
        };
        return acc;
      }, {});

      // Price range facets
      facets.price_ranges = {
        free: 0,
        under_1m: 0,
        "1m_3m": 0,
        "3m_5m": 0,
        "5m_plus": 0,
      };

      facets.levels = {
        Beginner: 0,
        Intermediate: 0,
        Advanced: 0,
      };
    }

    const pagination = {
      current_page: page,
      total_pages: Math.ceil(totalCount / limit),
      total_items: totalCount,
      items_per_page: limit,
      has_next: page < Math.ceil(totalCount / limit),
      has_previous: page > 1,
    };

    return {
      success: true,
      data: {
        results: paginatedResults,
        pagination,
        facets: include_facets ? facets : undefined,
        query_info: {
          query: query.trim(),
          content_types,
          filters_applied: {
            category: !!category_id,
            tags: tags.length > 0,
            level: !!level,
            price_range: !!(min_price || max_price || is_free !== undefined),
            date_range: !!(date_from || date_to),
            duration: !!(duration_min || duration_max),
            rating: !!min_rating,
            instructor: !!instructor_id,
            author: !!author_id,
            featured_only: !!featured_only,
          },
        },
      },
    };

  } catch (error) {
    console.error("Search content error:", error);
    return {
      success: false,
      message: "خطا در جستجو محتوا",
      message_en: "Error searching content",
    };
  }
};

export default searchContentHandler;
