import { ActFn } from "@deps";
import { productService } from "../productService.ts";

export const getFeaturedProductsFn: ActFn = async (body) => {
  try {
    const { limit } = body.details.set;

    // Use default limit of 8 if not provided
    const productLimit = limit || 8;

    // Get featured products from service
    const result = await productService.getFeaturedProducts(productLimit);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to get featured products",
        details: result.details || {},
      };
    }

    return {
      success: true,
      body: {
        products: result.data.products,
        pagination: result.data.pagination,
        meta: {
          type: "featured",
          limit: productLimit,
          total_featured: result.data.pagination.total,
          fetched_at: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    console.error("Error in getFeaturedProducts function:", error);
    return {
      success: false,
      message: "Internal server error while getting featured products",
      details: {
        error: error.message || "Unknown error",
        limit: body.details.set.limit,
      },
    };
  }
};
