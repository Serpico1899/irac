import { ActFn, ObjectId } from "@deps";
import { articles } from "@model";

export interface GetArticlesInput {
  // Pagination
  page?: number;
  limit?: number;

  // Filtering
  status?: "Draft" | "Published" | "Archived" | "Scheduled";
  type?: "Article" | "News" | "Research" | "Tutorial" | "Interview";
  category_id?: string;
  tag_ids?: string[];
  author_id?: string;

  // Search
  search?: string;

  // Special filters
  featured?: boolean;
  pinned?: boolean;
  featured_on_homepage?: boolean;
  allow_comments?: boolean;

  // Date filtering
  published_after?: string;
  published_before?: string;

  // Sorting
  sort_by?: "published_at" | "created_at" | "updated_at" | "view_count" | "like_count" | "title";
  sort_order?: "asc" | "desc";

  // Relations to populate
  populate?: string[];
}

export interface GetArticlesOutput {
  articles: any[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
  filters: {
    applied_filters: any;
    available_categories: any[];
    available_authors: any[];
    available_types: string[];
  };
}

const getArticlesHandler: ActFn = async (body) => {
  const {
    page = 1,
    limit = 12,
    status = "Published",
    type,
    category_id,
    tag_ids,
    author_id,
    search,
    featured,
    pinned,
    featured_on_homepage,
    allow_comments,
    published_after,
    published_before,
    sort_by = "published_at",
    sort_order = "desc",
    populate = ["category", "tags", "featured_image", "author"]
  }: GetArticlesInput = body.details;

  try {
    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage - build filters
    const matchFilters: any = {};

    // Status filter (always applied for public API)
    if (status) {
      matchFilters.status = status;
    }

    // For published articles, ensure they're actually published
    if (status === "Published") {
      matchFilters.published_at = { $lte: new Date() };
    }

    // Type filter
    if (type) {
      matchFilters.type = type;
    }

    // Category filter
    if (category_id) {
      matchFilters["category._id"] = new ObjectId(category_id);
    }

    // Tags filter
    if (tag_ids && tag_ids.length > 0) {
      matchFilters["tags._id"] = {
        $in: tag_ids.map(id => new ObjectId(id))
      };
    }

    // Author filter
    if (author_id) {
      matchFilters["author._id"] = new ObjectId(author_id);
    }

    // Featured filter
    if (featured !== undefined) {
      matchFilters.featured = featured;
    }

    // Pinned filter
    if (pinned !== undefined) {
      matchFilters.pinned = pinned;
    }

    // Featured on homepage filter
    if (featured_on_homepage !== undefined) {
      matchFilters.featured_on_homepage = featured_on_homepage;
    }

    // Comments filter
    if (allow_comments !== undefined) {
      matchFilters.allow_comments = allow_comments;
    }

    // Date range filters
    if (published_after || published_before) {
      matchFilters.published_at = {};
      if (published_after) {
        matchFilters.published_at.$gte = new Date(published_after);
      }
      if (published_before) {
        matchFilters.published_at.$lte = new Date(published_before);
      }
    }

    // Search filter
    if (search) {
      matchFilters.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { title_en: { $regex: search, $options: "i" } },
        { content_en: { $regex: search, $options: "i" } },
        { excerpt_en: { $regex: search, $options: "i" } }
      ];
    }

    // Add match stage if we have filters
    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({ $match: matchFilters });
    }

    // Add lookup stages for populated fields
    if (populate.includes("category")) {
      pipeline.push({
        $lookup: {
          from: "categories",
          localField: "category._id",
          foreignField: "_id",
          as: "category_details"
        }
      });
      pipeline.push({
        $addFields: {
          "category.details": { $arrayElemAt: ["$category_details", 0] }
        }
      });
    }

    if (populate.includes("tags")) {
      pipeline.push({
        $lookup: {
          from: "tags",
          localField: "tags._id",
          foreignField: "_id",
          as: "tags_details"
        }
      });
      pipeline.push({
        $addFields: {
          "tags.details": "$tags_details"
        }
      });
    }

    if (populate.includes("featured_image")) {
      pipeline.push({
        $lookup: {
          from: "files",
          localField: "featured_image._id",
          foreignField: "_id",
          as: "featured_image_details"
        }
      });
      pipeline.push({
        $addFields: {
          "featured_image.details": { $arrayElemAt: ["$featured_image_details", 0] }
        }
      });
    }

    if (populate.includes("author")) {
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "author._id",
          foreignField: "_id",
          as: "author_details",
          pipeline: [
            {
              $project: {
                first_name: 1,
                last_name: 1,
                summary: 1,
                avatar: 1,
                level: 1
              }
            }
          ]
        }
      });
      pipeline.push({
        $addFields: {
          "author.details": { $arrayElemAt: ["$author_details", 0] }
        }
      });
    }

    if (populate.includes("gallery")) {
      pipeline.push({
        $lookup: {
          from: "files",
          localField: "gallery._id",
          foreignField: "_id",
          as: "gallery_details"
        }
      });
      pipeline.push({
        $addFields: {
          "gallery.details": "$gallery_details"
        }
      });
    }

    // Sorting
    const sortStage: any = {};
    if (sort_by === "published_at") {
      sortStage.published_at = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "created_at") {
      sortStage.created_at = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "updated_at") {
      sortStage.updated_at = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "view_count") {
      sortStage.view_count = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "like_count") {
      sortStage.like_count = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "title") {
      sortStage.title = sort_order === "desc" ? -1 : 1;
    }

    // Add featured and pinned articles first, then sort by specified field
    pipeline.push({
      $sort: {
        pinned: -1,
        featured: -1,
        sort_order: 1,
        ...sortStage
      }
    });

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });

    const [countResult] = await articles().aggregation().pipeline(countPipeline);
    const totalItems = countResult?.total || 0;

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // Execute the main query
    const articlesResult = await articles().aggregation().pipeline(pipeline);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Get available categories for filters
    const availableCategories = await articles().aggregation().pipeline([
      { $match: { status: "Published" } },
      { $group: { _id: "$category._id", name: { $first: "$category.name" } } },
      { $sort: { name: 1 } }
    ]);

    // Get available authors for filters
    const availableAuthors = await articles().aggregation().pipeline([
      { $match: { status: "Published" } },
      {
        $lookup: {
          from: "users",
          localField: "author._id",
          foreignField: "_id",
          as: "author_info"
        }
      },
      {
        $group: {
          _id: "$author._id",
          first_name: { $first: { $arrayElemAt: ["$author_info.first_name", 0] } },
          last_name: { $first: { $arrayElemAt: ["$author_info.last_name", 0] } },
          article_count: { $sum: 1 }
        }
      },
      { $sort: { first_name: 1, last_name: 1 } },
      { $limit: 20 }
    ]);

    // Get available article types
    const availableTypes = await articles().aggregation().pipeline([
      { $match: { status: "Published" } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const result: GetArticlesOutput = {
      articles: articlesResult,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit,
        has_next: hasNext,
        has_previous: hasPrevious
      },
      filters: {
        applied_filters: {
          status,
          type,
          category_id,
          tag_ids,
          author_id,
          search,
          featured,
          pinned,
          featured_on_homepage,
          allow_comments,
          published_after,
          published_before
        },
        available_categories: availableCategories,
        available_authors: availableAuthors,
        available_types: availableTypes.map(t => t._id)
      }
    };

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error("Error in getArticles:", error);
    return {
      success: false,
      message: "خطا در دریافت مقالات / Error fetching articles",
      error: error.message
    };
  }
};

export default getArticlesHandler;
