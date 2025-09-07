import { ActFn } from "@deps";
import { productService } from "../productService.ts";

export const getProductFiltersFn: ActFn = async (body) => {
  try {
    // Get product filters from service
    const result = await productService.getProductFilters();

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to get product filters",
        details: result.details || {},
      };
    }

    const filtersData = result.data;

    return {
      success: true,
      body: {
        filters: {
          categories: filtersData.categories,
          types: filtersData.types,
          price_range: filtersData.price_range,
          tags: filtersData.tags,
        },
        meta: {
          categories_count: filtersData.categories.length,
          types_count: filtersData.types.length,
          tags_count: filtersData.tags.length,
          price_range: filtersData.price_range,
          generated_at: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    console.error("Error in getProductFilters function:", error);
    return {
      success: false,
      message: "Internal server error while getting product filters",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
      },
    };
  }
};
