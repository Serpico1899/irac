import { ActFn } from "@deps";
import { productService } from "../productService.ts";

export const getProductsFn: ActFn = async (body) => {
  try {
    const {
      page,
      limit,
      search,
      type,
      category,
      status,
      min_price,
      max_price,
      is_featured,
      is_bestseller,
      is_new,
      is_digital,
      tags,
      language,
      sort_by,
      sort_order,
    } = body.details.set;

    // Build query object
    const query = {
      page: page || 1,
      limit: limit || 12,
      ...(search && { search }),
      ...(type && { type }),
      ...(category && { category }),
      ...(status && { status }),
      ...(min_price !== undefined && { min_price }),
      ...(max_price !== undefined && { max_price }),
      ...(is_featured !== undefined && { is_featured }),
      ...(is_bestseller !== undefined && { is_bestseller }),
      ...(is_new !== undefined && { is_new }),
      ...(is_digital !== undefined && { is_digital }),
      ...(tags && { tags }),
      ...(language && { language }),
      ...(sort_by && { sort_by }),
      ...(sort_order && { sort_order }),
    };

    // Get products from service
    const result = await productService.getProducts(query);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to get products",
        details: result.details || {},
      };
    }

    return {
      success: true,
      body: {
        products: result.data.products,
        pagination: result.data.pagination,
        filters: {
          applied: {
            search,
            type,
            category,
            status,
            min_price,
            max_price,
            is_featured,
            is_bestseller,
            is_new,
            is_digital,
            tags,
            language,
          },
          sort: {
            sort_by: sort_by || "created_at",
            sort_order: sort_order || "desc",
          },
        },
      },
    };
  } catch (error) {
    console.error("Error in getProducts function:", error);
    return {
      success: false,
      message: "Internal server error while getting products",
      details: error.message || "Unknown error",
    };
  }
};
