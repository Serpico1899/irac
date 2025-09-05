import { ActFn, ObjectId } from "@deps";
import { courses } from "@model";

export interface GetCoursesInput {
  // Pagination
  page?: number;
  limit?: number;

  // Filtering
  status?: "Draft" | "Active" | "Archived" | "Sold_Out";
  level?: "Beginner" | "Intermediate" | "Advanced";
  type?: "Course" | "Workshop" | "Bootcamp" | "Seminar";
  category_id?: string;
  tag_ids?: string[];

  // Price filtering
  min_price?: number;
  max_price?: number;
  is_free?: boolean;

  // Search
  search?: string;

  // Special filters
  featured?: boolean;
  is_workshop?: boolean;
  is_online?: boolean;

  // Sorting
  sort_by?: "created_at" | "updated_at" | "price" | "name" | "start_date" | "average_rating";
  sort_order?: "asc" | "desc";

  // Relations to populate
  populate?: string[];
}

export interface GetCoursesOutput {
  courses: any[];
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
    price_range: {
      min: number;
      max: number;
    };
  };
}

const getCoursesHandler: ActFn = async (body) => {
  const {
    page = 1,
    limit = 12,
    status = "Active",
    level,
    type,
    category_id,
    tag_ids,
    min_price,
    max_price,
    is_free,
    search,
    featured,
    is_workshop,
    is_online,
    sort_by = "created_at",
    sort_order = "desc",
    populate = ["category", "tags", "featured_image", "instructor"]
  }: GetCoursesInput = body.details;

  try {
    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage - build filters
    const matchFilters: any = {};

    // Status filter (always applied for public API)
    if (status) {
      matchFilters.status = status;
    }

    // Level filter
    if (level) {
      matchFilters.level = level;
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

    // Price filters
    if (is_free === true) {
      matchFilters.is_free = true;
    } else if (is_free === false) {
      matchFilters.is_free = false;

      if (min_price !== undefined || max_price !== undefined) {
        matchFilters.price = {};
        if (min_price !== undefined) {
          matchFilters.price.$gte = min_price;
        }
        if (max_price !== undefined) {
          matchFilters.price.$lte = max_price;
        }
      }
    }

    // Featured filter
    if (featured !== undefined) {
      matchFilters.featured = featured;
    }

    // Workshop filter
    if (is_workshop !== undefined) {
      matchFilters.is_workshop = is_workshop;
    }

    // Online filter
    if (is_online !== undefined) {
      matchFilters.is_online = is_online;
    }

    // Search filter
    if (search) {
      matchFilters.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { name_en: { $regex: search, $options: "i" } },
        { description_en: { $regex: search, $options: "i" } },
        { instructor_name: { $regex: search, $options: "i" } }
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

    if (populate.includes("instructor")) {
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "instructor._id",
          foreignField: "_id",
          as: "instructor_details"
        }
      });
      pipeline.push({
        $addFields: {
          "instructor.details": { $arrayElemAt: ["$instructor_details", 0] }
        }
      });
    }

    // Sorting
    const sortStage: any = {};
    if (sort_by === "created_at") {
      sortStage.created_at = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "updated_at") {
      sortStage.updated_at = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "price") {
      sortStage.price = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "name") {
      sortStage.name = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "start_date") {
      sortStage.start_date = sort_order === "desc" ? -1 : 1;
    } else if (sort_by === "average_rating") {
      sortStage.average_rating = sort_order === "desc" ? -1 : 1;
    }

    // Add featured courses first, then sort by specified field
    pipeline.push({
      $sort: {
        featured: -1,
        sort_order: 1,
        ...sortStage
      }
    });

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });

    const [countResult] = await courses().aggregation().pipeline(countPipeline);
    const totalItems = countResult?.total || 0;

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // Execute the main query
    const coursesResult = await courses().aggregation().pipeline(pipeline);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Get available categories for filters
    const availableCategories = await courses().aggregation().pipeline([
      { $match: matchFilters },
      { $group: { _id: "$category._id", name: { $first: "$category.name" } } },
      { $sort: { name: 1 } }
    ]);

    // Get price range for filters
    const priceRangeResult = await courses().aggregation().pipeline([
      { $match: { status: "Active", is_free: false } },
      {
        $group: {
          _id: null,
          min_price: { $min: "$price" },
          max_price: { $max: "$price" }
        }
      }
    ]);

    const priceRange = priceRangeResult[0] || { min_price: 0, max_price: 0 };

    const result: GetCoursesOutput = {
      courses: coursesResult,
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
          level,
          type,
          category_id,
          tag_ids,
          min_price,
          max_price,
          is_free,
          search,
          featured,
          is_workshop,
          is_online
        },
        available_categories: availableCategories,
        price_range: {
          min: priceRange.min_price || 0,
          max: priceRange.max_price || 0
        }
      }
    };

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error("Error in getCourses:", error);
    return {
      success: false,
      message: "خطا در دریافت دوره‌ها / Error fetching courses",
      error: error.message
    };
  }
};

export default getCoursesHandler;
