import { ActFn } from "@deps";
import { productService } from "../productService.ts";

export const getProductFn: ActFn = async (body) => {
  try {
    const { identifier } = body.details.set;

    // Get product from service
    const result = await productService.getProduct(identifier);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Product not found",
        details: result.details || {},
      };
    }

    // Track product view (fire and forget - don't wait for result)
    productService.trackProductView(result.data._id).catch((error) => {
      console.error("Error tracking product view:", error);
      // Don't fail the request if view tracking fails
    });

    return {
      success: true,
      body: {
        product: result.data,
        meta: {
          viewed_at: new Date().toISOString(),
          view_tracked: true,
        },
      },
    };
  } catch (error) {
    console.error("Error in getProduct function:", error);
    return {
      success: false,
      message: "Internal server error while getting product",
      details: error.message || "Unknown error",
    };
  }
};
