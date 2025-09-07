import { ActFn } from "@deps";
import { productService } from "../productService.ts";

export const createProductFn: ActFn = async (body) => {
  try {
    const {
      title,
      title_en,
      description,
      description_en,
      type,
      category,
      price,
      discounted_price,
      stock_quantity,
      is_digital,
      featured_image,
      gallery,
      tags,
      specifications,
      author,
      author_en,
      isbn,
      publisher,
      publisher_en,
      publication_date,
      language,
      page_count,
      file_url,
      file_size,
      file_format,
      dimensions,
      weight,
      materials,
      artist,
      artist_en,
      artwork_year,
      artwork_style,
      is_featured,
      is_bestseller,
      is_new,
      meta_title,
      meta_description,
      seo_keywords,
      created_by,
    } = body.details.set;

    // Get user ID from request context if available
    const userId = body.user?._id || created_by;

    // Validate digital product requirements
    if (is_digital) {
      if (!file_url || !file_format) {
        return {
          success: false,
          message: "Digital products require file_url and file_format",
          details: {
            missing_fields: {
              file_url: !file_url,
              file_format: !file_format,
            },
          },
        };
      }
    }

    // Validate physical product requirements
    if (!is_digital && stock_quantity === undefined) {
      return {
        success: false,
        message: "Physical products require stock_quantity",
        details: {
          missing_fields: {
            stock_quantity: true,
          },
        },
      };
    }

    // Validate discounted price
    if (discounted_price !== undefined && discounted_price >= price) {
      return {
        success: false,
        message: "Discounted price must be less than regular price",
        details: {
          price,
          discounted_price,
        },
      };
    }

    // Build product input
    const productInput = {
      title,
      title_en,
      description,
      description_en,
      type,
      category,
      price,
      discounted_price,
      stock_quantity,
      is_digital,
      featured_image,
      gallery,
      tags,
      specifications,
      author,
      author_en,
      isbn,
      publisher,
      publisher_en,
      publication_date: publication_date?.toISOString(),
      language: language || "fa",
      page_count,
      file_url,
      file_size,
      file_format,
      dimensions,
      weight,
      materials,
      artist,
      artist_en,
      artwork_year,
      artwork_style,
      is_featured: is_featured || false,
      is_bestseller: is_bestseller || false,
      is_new: is_new !== undefined ? is_new : true, // New products are new by default
      meta_title,
      meta_description,
      seo_keywords,
      created_by: userId,
    };

    // Create product using service
    const result = await productService.createProduct(productInput, userId);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to create product",
        details: result.details || {},
      };
    }

    return {
      success: true,
      body: {
        product: result.data,
        message: result.message,
        meta: {
          created_at: new Date().toISOString(),
          created_by: userId,
          is_digital,
          category,
          type,
        },
      },
    };
  } catch (error) {
    console.error("Error in createProduct function:", error);
    return {
      success: false,
      message: "Internal server error while creating product",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
      },
    };
  }
};
