import { coreApp } from "@app";
import {
  product_models,
  product_type_array,
  product_category_array,
  product_status_array,
} from "@model";

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string[];
  category?: string[];
  status?: string[];
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new?: boolean;
  is_digital?: boolean;
  tags?: string[];
  language?: string;
  sort_by?: "created_at" | "price" | "title" | "rating" | "popularity";
  sort_order?: "asc" | "desc";
}

export interface ProductCreateInput {
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  type: string;
  category: string;
  price: number;
  discounted_price?: number;
  stock_quantity?: number;
  is_digital: boolean;
  featured_image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  gallery?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  tags?: string[];
  specifications?: Record<string, any>;
  author?: string;
  author_en?: string;
  isbn?: string;
  publisher?: string;
  publisher_en?: string;
  publication_date?: string;
  language?: string;
  page_count?: number;
  file_url?: string;
  file_size?: number;
  file_format?: string;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: "cm" | "mm" | "inch";
  };
  weight?: {
    value: number;
    unit: "g" | "kg" | "lb";
  };
  materials?: string[];
  artist?: string;
  artist_en?: string;
  artwork_year?: number;
  artwork_style?: string;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new?: boolean;
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
  created_by?: string;
}

export interface ProductUpdateInput {
  title?: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  type?: string;
  category?: string;
  status?: string;
  price?: number;
  discounted_price?: number;
  stock_quantity?: number;
  is_digital?: boolean;
  featured_image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  gallery?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  tags?: string[];
  specifications?: Record<string, any>;
  author?: string;
  author_en?: string;
  isbn?: string;
  publisher?: string;
  publisher_en?: string;
  publication_date?: string;
  language?: string;
  page_count?: number;
  file_url?: string;
  file_size?: number;
  file_format?: string;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: "cm" | "mm" | "inch";
  };
  weight?: {
    value: number;
    unit: "g" | "kg" | "lb";
  };
  materials?: string[];
  artist?: string;
  artist_en?: string;
  artwork_year?: number;
  artwork_style?: string;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new?: boolean;
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
  updated_by?: string;
}

class ProductService {
  private _productModel?: any;

  private get productModel() {
    if (!this._productModel) {
      this._productModel = product_models();
    }
    return this._productModel;
  }

  /**
   * Generate unique slug from title
   */
  private async generateSlug(title: string, exclude_id?: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const filter = exclude_id
        ? { slug, _id: { $ne: coreApp.odm.ObjectId(exclude_id) } }
        : { slug };

      const existing = await this.productModel.findOne(filter);
      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Create new product
   */
  async createProduct(input: ProductCreateInput, userId?: string): Promise<any> {
    try {
      // Generate slug from title
      const slug = await this.generateSlug(input.title);

      // Prepare product data
      const productData = {
        ...input,
        slug,
        specifications: input.specifications ? JSON.stringify(input.specifications) : undefined,
        created_by: userId || input.created_by,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Create product
      const product = await this.productModel.insertOne(productData);

      return {
        success: true,
        data: product,
        message: "Product created successfully",
      };
    } catch (error) {
      console.error("Error creating product:", error);
      return {
        success: false,
        error: "Failed to create product",
        details: error.message,
      };
    }
  }

  /**
   * Get products with filtering and pagination
   */
  async getProducts(query: ProductQuery = {}): Promise<any> {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        type,
        category,
        status = ["active"],
        min_price,
        max_price,
        is_featured,
        is_bestseller,
        is_new,
        is_digital,
        tags,
        language,
        sort_by = "created_at",
        sort_order = "desc",
      } = query;

      // Build MongoDB filter
      const filter: any = {};

      // Status filter (default to active only)
      if (status.length > 0) {
        filter.status = { $in: status };
      }

      // Search filter
      if (search) {
        filter.$text = { $search: search };
      }

      // Type filter
      if (type && type.length > 0) {
        filter.type = { $in: type };
      }

      // Category filter
      if (category && category.length > 0) {
        filter.category = { $in: category };
      }

      // Price range filter
      if (min_price !== undefined || max_price !== undefined) {
        filter.price = {};
        if (min_price !== undefined) filter.price.$gte = min_price;
        if (max_price !== undefined) filter.price.$lte = max_price;
      }

      // Boolean filters
      if (is_featured !== undefined) filter.is_featured = is_featured;
      if (is_bestseller !== undefined) filter.is_bestseller = is_bestseller;
      if (is_new !== undefined) filter.is_new = is_new;
      if (is_digital !== undefined) filter.is_digital = is_digital;

      // Tags filter
      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      // Language filter
      if (language) {
        filter.language = language;
      }

      // Build sort object
      const sort: any = {};
      if (sort_by === "popularity") {
        sort.view_count = sort_order === "asc" ? 1 : -1;
        sort.purchase_count = sort_order === "asc" ? 1 : -1;
        sort.view_count = sort_order === "asc" ? 1 : -1;
      } else if (sort_by === "rating") {
        sort["rating.average"] = sort_order === "asc" ? 1 : -1;
      } else {
        sort[sort_by] = sort_order === "asc" ? 1 : -1;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get products
      const products = await this.productModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get total count
      const total = await this.productModel.countDocuments(filter);

      // Parse specifications back to objects
      const processedProducts = products.map((product: any) => ({
        ...product,
        specifications: product.specifications
          ? JSON.parse(product.specifications)
          : undefined,
      }));

      return {
        success: true,
        data: {
          products: processedProducts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            has_prev: page > 1,
            has_next: page < Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error getting products:", error);
      return {
        success: false,
        error: "Failed to get products",
        details: error.message,
      };
    }
  }

  /**
   * Get single product by ID or slug
   */
  async getProduct(identifier: string): Promise<any> {
    try {
      let filter: any;

      // Check if identifier is ObjectId
      if (coreApp.odm.ObjectId.isValid(identifier)) {
        filter = { _id: coreApp.odm.ObjectId(identifier) };
      } else {
        filter = { slug: identifier };
      }

      const product = await this.productModel.findOne(filter);

      if (!product) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      // Parse specifications back to object
      const processedProduct = {
        ...product,
        specifications: product.specifications
          ? JSON.parse(product.specifications)
          : undefined,
      };

      return {
        success: true,
        data: processedProduct,
      };
    } catch (error) {
      console.error("Error getting product:", error);
      return {
        success: false,
        error: "Failed to get product",
        details: error.message,
      };
    }
  }

  /**
   * Update product
   */
  async updateProduct(id: string, input: ProductUpdateInput, userId?: string): Promise<any> {
    try {
      if (!coreApp.odm.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid product ID",
        };
      }

      // Check if product exists
      const existingProduct = await this.productModel.findOne({
        _id: coreApp.odm.ObjectId(id)
      });

      if (!existingProduct) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      // Generate new slug if title changed
      let slug = existingProduct.slug;
      if (input.title && input.title !== existingProduct.title) {
        slug = await this.generateSlug(input.title, id);
      }

      // Prepare update data
      const updateData = {
        ...input,
        slug,
        specifications: input.specifications ? JSON.stringify(input.specifications) : undefined,
        updated_by: userId || input.updated_by,
        updated_at: new Date(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Update product
      const result = await this.productModel.updateOne(
        { _id: coreApp.odm.ObjectId(id) },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        return {
          success: false,
          error: "No changes made to product",
        };
      }

      // Get updated product
      const updatedProduct = await this.getProduct(id);

      return {
        success: true,
        data: updatedProduct.data,
        message: "Product updated successfully",
      };
    } catch (error) {
      console.error("Error updating product:", error);
      return {
        success: false,
        error: "Failed to update product",
        details: error.message,
      };
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<any> {
    try {
      if (!coreApp.odm.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid product ID",
        };
      }

      const result = await this.productModel.deleteOne({
        _id: coreApp.odm.ObjectId(id)
      });

      if (result.deletedCount === 0) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      return {
        success: false,
        error: "Failed to delete product",
        details: error.message,
      };
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<any> {
    return this.getProducts({
      is_featured: true,
      limit,
      sort_by: "created_at",
      sort_order: "desc",
    });
  }

  /**
   * Get bestseller products
   */
  async getBestsellerProducts(limit: number = 8): Promise<any> {
    return this.getProducts({
      is_bestseller: true,
      limit,
      sort_by: "popularity",
      sort_order: "desc",
    });
  }

  /**
   * Get new products
   */
  async getNewProducts(limit: number = 8): Promise<any> {
    return this.getProducts({
      is_new: true,
      limit,
      sort_by: "created_at",
      sort_order: "desc",
    });
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, query: ProductQuery = {}): Promise<any> {
    return this.getProducts({
      ...query,
      category: [category],
    });
  }

  /**
   * Get products by type
   */
  async getProductsByType(type: string, query: ProductQuery = {}): Promise<any> {
    return this.getProducts({
      ...query,
      type: [type],
    });
  }

  /**
   * Search products
   */
  async searchProducts(searchTerm: string, query: ProductQuery = {}): Promise<any> {
    return this.getProducts({
      ...query,
      search: searchTerm,
    });
  }

  /**
   * Get related products based on category and tags
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<any> {
    try {
      if (!coreApp.odm.ObjectId.isValid(productId)) {
        return {
          success: false,
          error: "Invalid product ID",
        };
      }

      // Get the current product
      const currentProduct = await this.productModel.findOne({
        _id: coreApp.odm.ObjectId(productId)
      });

      if (!currentProduct) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      // Build filter for related products
      const filter: any = {
        _id: { $ne: coreApp.odm.ObjectId(productId) },
        status: "active",
        $or: [
          { category: currentProduct.category },
          { type: currentProduct.type },
          { tags: { $in: currentProduct.tags || [] } },
        ],
      };

      const relatedProducts = await this.productModel
        .find(filter)
        .limit(limit)
        .toArray();

      // Parse specifications
      const processedProducts = relatedProducts.map((product: any) => ({
        ...product,
        specifications: product.specifications
          ? JSON.parse(product.specifications)
          : undefined,
      }));

      return {
        success: true,
        data: processedProducts,
      };
    } catch (error) {
      console.error("Error getting related products:", error);
      return {
        success: false,
        error: "Failed to get related products",
        details: error.message,
      };
    }
  }

  /**
   * Track product view
   */
  async trackProductView(productId: string): Promise<any> {
    try {
      if (!coreApp.odm.ObjectId.isValid(productId)) {
        return {
          success: false,
          error: "Invalid product ID",
        };
      }

      const result = await this.productModel.updateOne(
        { _id: coreApp.odm.ObjectId(productId) },
        { $inc: { view_count: 1 } }
      );

      if (result.modifiedCount === 0) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      return {
        success: true,
        message: "Product view tracked successfully",
      };
    } catch (error) {
      console.error("Error tracking product view:", error);
      return {
        success: false,
        error: "Failed to track product view",
        details: error.message,
      };
    }
  }

  /**
   * Check product availability
   */
  async checkProductAvailability(productId: string): Promise<any> {
    try {
      const product = await this.getProduct(productId);

      if (!product.success) {
        return product;
      }

      const isAvailable = product.data.status === "active" &&
        (product.data.is_digital ||
          product.data.stock_quantity === undefined ||
          product.data.stock_quantity > 0);

      return {
        success: true,
        data: {
          available: isAvailable,
          stock_quantity: product.data.stock_quantity,
          is_digital: product.data.is_digital,
          status: product.data.status,
          message: isAvailable
            ? "Product is available"
            : product.data.status !== "active"
              ? "Product is not active"
              : "Product is out of stock",
        },
      };
    } catch (error) {
      console.error("Error checking product availability:", error);
      return {
        success: false,
        error: "Failed to check product availability",
        details: error.message,
      };
    }
  }

  /**
   * Update product inventory (decrease stock after purchase)
   */
  async updateInventory(productId: string, quantity: number): Promise<any> {
    try {
      if (!coreApp.odm.ObjectId.isValid(productId)) {
        return {
          success: false,
          error: "Invalid product ID",
        };
      }

      // Check current stock
      const product = await this.productModel.findOne({
        _id: coreApp.odm.ObjectId(productId)
      });

      if (!product) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      // For digital products, no inventory update needed
      if (product.is_digital) {
        return {
          success: true,
          message: "Digital product - no inventory update needed",
        };
      }

      // Check if enough stock available
      if (product.stock_quantity !== undefined && product.stock_quantity < quantity) {
        return {
          success: false,
          error: "Insufficient stock",
          data: {
            available_stock: product.stock_quantity,
            requested: quantity,
          },
        };
      }

      // Update stock
      const result = await this.productModel.updateOne(
        { _id: coreApp.odm.ObjectId(productId) },
        {
          $inc: {
            stock_quantity: -quantity,
            purchase_count: quantity,
          },
          $set: { updated_at: new Date() }
        }
      );

      if (result.modifiedCount === 0) {
        return {
          success: false,
          error: "Failed to update inventory",
        };
      }

      // Check if product is now out of stock
      const updatedProduct = await this.productModel.findOne({
        _id: coreApp.odm.ObjectId(productId)
      });

      if (updatedProduct.stock_quantity === 0) {
        await this.productModel.updateOne(
          { _id: coreApp.odm.ObjectId(productId) },
          { $set: { status: "out_of_stock" } }
        );
      }

      return {
        success: true,
        message: "Inventory updated successfully",
        data: {
          new_stock: updatedProduct.stock_quantity,
          status: updatedProduct.stock_quantity === 0 ? "out_of_stock" : updatedProduct.status,
        },
      };
    } catch (error) {
      console.error("Error updating inventory:", error);
      return {
        success: false,
        error: "Failed to update inventory",
        details: error.message,
      };
    }
  }

  /**
   * Get product categories with counts
   */
  async getProductCategories(): Promise<any> {
    try {
      const pipeline = [
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ];

      const categories = await this.productModel.aggregate(pipeline).toArray();

      const categoriesWithNames = categories.map((cat: any) => ({
        category: cat._id,
        count: cat.count,
        name: this.getCategoryName(cat._id),
      }));

      return {
        success: true,
        data: categoriesWithNames,
      };
    } catch (error) {
      console.error("Error getting product categories:", error);
      return {
        success: false,
        error: "Failed to get product categories",
        details: error.message,
      };
    }
  }

  /**
   * Get product filters data
   */
  async getProductFilters(): Promise<any> {
    try {
      // Get categories with counts
      const categoriesResult = await this.getProductCategories();

      // Get types with counts
      const typePipeline = [
        { $match: { status: "active" } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ];

      const types = await this.productModel.aggregate(typePipeline).toArray();

      // Get price range
      const priceRange = await this.productModel.aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: null,
            min: { $min: "$price" },
            max: { $max: "$price" }
          }
        },
      ]).toArray();

      // Get tags with counts
      const tagsPipeline = [
        { $match: { status: "active" } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ];

      const tags = await this.productModel.aggregate(tagsPipeline).toArray();

      return {
        success: true,
        data: {
          categories: categoriesResult.success ? categoriesResult.data : [],
          types: types.map((type: any) => ({
            type: type._id,
            count: type.count,
            name: this.getTypeName(type._id),
          })),
          price_range: priceRange.length > 0
            ? { min: priceRange[0].min || 0, max: priceRange[0].max || 1000000 }
            : { min: 0, max: 1000000 },
          tags: tags.map((tag: any) => ({
            tag: tag._id,
            count: tag.count,
          })),
        },
      };
    } catch (error) {
      console.error("Error getting product filters:", error);
      return {
        success: false,
        error: "Failed to get product filters",
        details: error.message,
      };
    }
  }

  /**
   * Helper: Get category name in Persian
   */
  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      books: "کتاب‌ها",
      digital_books: "کتاب‌های دیجیتال",
      physical_books: "کتاب‌های فیزیکی",
      artworks: "آثار هنری",
      paintings: "نقاشی‌ها",
      sculptures: "مجسمه‌ها",
      digital_art: "هنر دیجیتال",
      articles: "مقالات",
      cultural_items: "اقلام فرهنگی",
      handicrafts: "صنایع دستی",
      educational: "آموزشی",
      research: "پژوهشی",
      other: "سایر",
    };

    return names[category] || category;
  }

  /**
   * Helper: Get type name in Persian
   */
  private getTypeName(type: string): string {
    const names: Record<string, string> = {
      book: "کتاب",
      artwork: "اثر هنری",
      article: "مقاله",
      cultural: "فرهنگی",
      other: "سایر",
    };

    return names[type] || type;
  }
}

export const productService = new ProductService();
export default productService;
