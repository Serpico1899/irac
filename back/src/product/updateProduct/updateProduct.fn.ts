import { ActFn } from "@deps";
import { productService } from "../productService.ts";

export const updateProductFn: ActFn = async (body) => {
  try {
    const {
      id,
      title,
      title_en,
      description,
      description_en,
      type,
      category,
      status,
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
      updated_by,
    } = body.details.set;

    // Get user ID from request context if available
    const userId = body.user?._id || updated_by;

    // Validate business logic constraints
    if (price !== undefined && discounted_price !== undefined && discounted_price >= price) {
      return {
        success: false,
        message: "Discounted price must be less than regular price",
        details: {
          price,
          discounted_price,
        },
      };
    }

    // Get current product to validate digital/physical constraints
    const currentProductResult = await productService.getProduct(id);
    if (!currentProductResult.success) {
      return {
        success: false,
        message: "Product not found",
        details: { product_id: id },
      };
    }

    const currentProduct = currentProductResult.data;

    // Validate digital product requirements if switching to digital or already digital
    const willBeDigital = is_digital !== undefined ? is_digital : currentProduct.is_digital;
    if (willBeDigital) {
      const finalFileUrl = file_url || currentProduct.file_url;
      const finalFileFormat = file_format || currentProduct.file_format;

      if (!finalFileUrl || !finalFileFormat) {
        return {
          success: false,
          message: "Digital products require file_url and file_format",
          details: {
            current_file_url: currentProduct.file_url,
            current_file_format: currentProduct.file_format,
            provided_file_url: file_url,
            provided_file_format: file_format,
          },
        };
      }
    }

    // Validate physical product requirements if switching to physical or already physical
    const willBePhysical = is_digital !== undefined ? !is_digital : !currentProduct.is_digital;
    if (willBePhysical) {
      const finalStockQuantity = stock_quantity !== undefined ? stock_quantity : currentProduct.stock_quantity;

      if (finalStockQuantity === undefined || finalStockQuantity === null) {
        return {
          success: false,
          message: "Physical products require stock_quantity",
          details: {
            current_stock_quantity: currentProduct.stock_quantity,
            provided_stock_quantity: stock_quantity,
          },
        };
      }
    }

    // Build update input (only include defined values)
    const updateInput: any = {
      updated_by: userId,
    };

    // Add fields only if they are defined (not undefined)
    if (title !== undefined) updateInput.title = title;
    if (title_en !== undefined) updateInput.title_en = title_en;
    if (description !== undefined) updateInput.description = description;
    if (description_en !== undefined) updateInput.description_en = description_en;
    if (type !== undefined) updateInput.type = type;
    if (category !== undefined) updateInput.category = category;
    if (status !== undefined) updateInput.status = status;
    if (price !== undefined) updateInput.price = price;
    if (discounted_price !== undefined) updateInput.discounted_price = discounted_price;
    if (stock_quantity !== undefined) updateInput.stock_quantity = stock_quantity;
    if (is_digital !== undefined) updateInput.is_digital = is_digital;
    if (featured_image !== undefined) updateInput.featured_image = featured_image;
    if (gallery !== undefined) updateInput.gallery = gallery;
    if (tags !== undefined) updateInput.tags = tags;
    if (specifications !== undefined) updateInput.specifications = specifications;
    if (author !== undefined) updateInput.author = author;
    if (author_en !== undefined) updateInput.author_en = author_en;
    if (isbn !== undefined) updateInput.isbn = isbn;
    if (publisher !== undefined) updateInput.publisher = publisher;
    if (publisher_en !== undefined) updateInput.publisher_en = publisher_en;
    if (publication_date !== undefined) updateInput.publication_date = publication_date.toISOString();
    if (language !== undefined) updateInput.language = language;
    if (page_count !== undefined) updateInput.page_count = page_count;
    if (file_url !== undefined) updateInput.file_url = file_url;
    if (file_size !== undefined) updateInput.file_size = file_size;
    if (file_format !== undefined) updateInput.file_format = file_format;
    if (dimensions !== undefined) updateInput.dimensions = dimensions;
    if (weight !== undefined) updateInput.weight = weight;
    if (materials !== undefined) updateInput.materials = materials;
    if (artist !== undefined) updateInput.artist = artist;
    if (artist_en !== undefined) updateInput.artist_en = artist_en;
    if (artwork_year !== undefined) updateInput.artwork_year = artwork_year;
    if (artwork_style !== undefined) updateInput.artwork_style = artwork_style;
    if (is_featured !== undefined) updateInput.is_featured = is_featured;
    if (is_bestseller !== undefined) updateInput.is_bestseller = is_bestseller;
    if (is_new !== undefined) updateInput.is_new = is_new;
    if (meta_title !== undefined) updateInput.meta_title = meta_title;
    if (meta_description !== undefined) updateInput.meta_description = meta_description;
    if (seo_keywords !== undefined) updateInput.seo_keywords = seo_keywords;

    // Check if there are any changes to make
    if (Object.keys(updateInput).length === 1) { // Only updated_by field
      return {
        success: false,
        message: "No fields provided for update",
        details: {
          product_id: id,
          available_fields: [
            "title", "title_en", "description", "description_en", "type", "category",
            "status", "price", "discounted_price", "stock_quantity", "is_digital",
            "featured_image", "gallery", "tags", "specifications", "author", "author_en",
            "isbn", "publisher", "publisher_en", "publication_date", "language",
            "page_count", "file_url", "file_size", "file_format", "dimensions",
            "weight", "materials", "artist", "artist_en", "artwork_year",
            "artwork_style", "is_featured", "is_bestseller", "is_new",
            "meta_title", "meta_description", "seo_keywords"
          ],
        },
      };
    }

    // Update product using service
    const result = await productService.updateProduct(id, updateInput, userId);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to update product",
        details: result.details || {},
      };
    }

    return {
      success: true,
      body: {
        product: result.data,
        message: result.message,
        meta: {
          updated_at: new Date().toISOString(),
          updated_by: userId,
          fields_updated: Object.keys(updateInput).filter(key => key !== 'updated_by'),
          product_id: id,
        },
      },
    };
  } catch (error) {
    console.error("Error in updateProduct function:", error);
    return {
      success: false,
      message: "Internal server error while updating product",
      details: {
        product_id: body.details.set.id,
        error: error.message || "Unknown error",
        stack: error.stack,
      },
    };
  }
};
