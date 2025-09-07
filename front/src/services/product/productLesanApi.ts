import {
  Product,
  ProductQuery,
  ProductListResponse,
  ProductApiResponse,
  ProductType,
  ProductCategory,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1405";

interface LesanRequest {
  act: string;
  details: {
    set: any;
    get?: any;
  };
}

interface LesanResponse<T = any> {
  success: boolean;
  body?: T;
  message?: string;
  details?: any;
}

class ProductLesanApiService {
  private getAuthHeaders(): HeadersInit {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async makeRequest<T>(
    act: string,
    setData: any = {},
    getData?: any,
  ): Promise<ProductApiResponse<T>> {
    try {
      const requestBody: LesanRequest = {
        act,
        details: {
          set: setData,
          ...(getData && { get: getData }),
        },
      };

      const response = await fetch(`${API_BASE_URL}/api`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: LesanResponse<T> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Request failed");
      }

      return {
        success: true,
        data: data.body as T,
        message: data.message,
      };
    } catch (error: any) {
      console.error(`API Error [${act}]:`, error);
      return {
        success: false,
        error: error.message || "An error occurred",
        data: null as T,
      };
    }
  }

  // Get products with filtering and pagination
  async getProducts(
    query: ProductQuery = {},
  ): Promise<ProductApiResponse<ProductListResponse>> {
    const setData = {
      page: query.page || 1,
      limit: query.limit || 12,
      ...(query.search && { search: query.search }),
      ...(query.type && { type: query.type }),
      ...(query.category && { category: query.category }),
      ...(query.status && { status: query.status }),
      ...(query.price_min !== undefined && { min_price: query.price_min }),
      ...(query.price_max !== undefined && { max_price: query.price_max }),
      ...(query.is_featured !== undefined && {
        is_featured: query.is_featured,
      }),
      ...(query.is_bestseller !== undefined && {
        is_bestseller: query.is_bestseller,
      }),
      ...(query.is_new !== undefined && { is_new: query.is_new }),
      ...(query.is_digital !== undefined && { is_digital: query.is_digital }),
      ...(query.tags && { tags: query.tags }),
      ...(query.language && { language: query.language }),
      ...(query.sort_by && { sort_by: query.sort_by }),
      ...(query.sort_order && { sort_order: query.sort_order }),
    };

    return this.makeRequest<ProductListResponse>(
      "product/getProducts",
      setData,
    );
  }

  // Get single product by ID or slug
  async getProduct(identifier: string): Promise<ProductApiResponse<Product>> {
    return this.makeRequest<Product>("product/getProduct", { identifier });
  }

  // Create new product (admin only)
  async createProduct(productData: any): Promise<ProductApiResponse<Product>> {
    return this.makeRequest<Product>("product/createProduct", productData);
  }

  // Update product (admin only)
  async updateProduct(
    id: string,
    productData: any,
  ): Promise<ProductApiResponse<Product>> {
    return this.makeRequest<Product>("product/updateProduct", {
      id,
      ...productData,
    });
  }

  // Get featured products
  async getFeaturedProducts(
    limit: number = 8,
  ): Promise<ProductApiResponse<Product[]>> {
    const result = await this.makeRequest<{ products: Product[] }>(
      "product/getFeaturedProducts",
      { limit },
    );

    if (result.success && result.data) {
      return {
        ...result,
        data: result.data.products,
      };
    }

    return result as ProductApiResponse<Product[]>;
  }

  // Get bestseller products
  async getBestsellerProducts(
    limit: number = 8,
  ): Promise<ProductApiResponse<Product[]>> {
    return this.getProducts({
      is_bestseller: true,
      limit,
      sort_by: "popularity",
      sort_order: "desc",
    }).then((result) => {
      if (result.success && result.data) {
        return {
          ...result,
          data: result.data.products,
        };
      }
      return result as ProductApiResponse<Product[]>;
    });
  }

  // Get new products
  async getNewProducts(
    limit: number = 8,
  ): Promise<ProductApiResponse<Product[]>> {
    return this.getProducts({
      is_new: true,
      limit,
      sort_by: "created_at",
      sort_order: "desc",
    }).then((result) => {
      if (result.success && result.data) {
        return {
          ...result,
          data: result.data.products,
        };
      }
      return result as ProductApiResponse<Product[]>;
    });
  }

  // Get products by category
  async getProductsByCategory(
    category: ProductCategory,
    query: ProductQuery = {},
  ): Promise<ProductApiResponse<ProductListResponse>> {
    return this.getProducts({
      ...query,
      category: [category],
    });
  }

  // Get products by type
  async getProductsByType(
    type: ProductType,
    query: ProductQuery = {},
  ): Promise<ProductApiResponse<ProductListResponse>> {
    return this.getProducts({
      ...query,
      type: [type],
    });
  }

  // Search products
  async searchProducts(
    searchTerm: string,
    query: ProductQuery = {},
  ): Promise<ProductApiResponse<ProductListResponse>> {
    return this.getProducts({
      ...query,
      search: searchTerm,
    });
  }

  // Get related products
  async getRelatedProducts(
    productId: string,
    limit: number = 4,
  ): Promise<ProductApiResponse<Product[]>> {
    // For related products, we'll use the getProducts with similar criteria
    // This is a simplified version - the backend could have a specific endpoint
    const product = await this.getProduct(productId);
    if (product.success && product.data) {
      const relatedQuery: ProductQuery = {
        category: [product.data.category],
        limit,
      };

      const result = await this.getProducts(relatedQuery);
      if (result.success && result.data) {
        // Filter out the current product
        const filtered = result.data.products.filter(
          (p) => p._id !== productId,
        );
        return {
          ...result,
          data: filtered.slice(0, limit),
        };
      }
    }

    return {
      success: false,
      error: "Failed to get related products",
      data: [],
    };
  }

  // Get product filters
  async getProductFilters(): Promise<
    ProductApiResponse<{
      categories: Array<{
        category: ProductCategory;
        count: number;
        name: string;
      }>;
      types: Array<{ type: ProductType; count: number; name: string }>;
      price_range: { min: number; max: number };
      tags: Array<{ tag: string; count: number }>;
    }>
  > {
    const result = await this.makeRequest<{
      filters: {
        categories: Array<{
          category: ProductCategory;
          count: number;
          name: string;
        }>;
        types: Array<{ type: ProductType; count: number; name: string }>;
        price_range: { min: number; max: number };
        tags: Array<{ tag: string; count: number }>;
      };
    }>("product/getProductFilters");

    if (result.success && result.data) {
      return {
        ...result,
        data: result.data.filters,
      };
    }

    return result as any;
  }

  // Purchase product
  async purchaseProduct(purchaseData: {
    items: Array<{
      product_id: string;
      quantity: number;
      expected_price?: number;
    }>;
    payment_method: "wallet" | "zarinpal" | "bank_transfer";
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    shipping_address?: {
      full_address: string;
      city: string;
      state?: string;
      postal_code: string;
      country?: string;
    };
    billing_address?: {
      full_address: string;
      city: string;
      state?: string;
      postal_code: string;
      country?: string;
    };
    use_different_billing?: boolean;
    notes?: string;
    terms_accepted: boolean;
    newsletter_subscribe?: boolean;
  }): Promise<
    ProductApiResponse<{
      order: any;
      payment: any;
      summary: any;
      next_steps: any;
    }>
  > {
    return this.makeRequest("product/purchaseProduct", {
      ...purchaseData,
      order_source: "web",
      client_ip:
        typeof window !== "undefined" ? window.location.hostname : undefined,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    });
  }

  // Track product view (fire and forget)
  async trackProductView(productId: string): Promise<void> {
    try {
      // This is fire and forget - don't wait for response
      fetch(`${API_BASE_URL}/api`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          act: "product/trackProductView",
          details: {
            set: { product_id: productId },
          },
        }),
      }).catch(() => {
        // Silently fail - view tracking is not critical
      });
    } catch {
      // Silently fail - view tracking is not critical
    }
  }

  // Check product availability
  async checkProductAvailability(productId: string): Promise<
    ProductApiResponse<{
      available: boolean;
      stock_quantity?: number;
      is_digital: boolean;
      status: string;
      message?: string;
    }>
  > {
    // This would call a backend endpoint if available, for now we'll get the product
    const result = await this.getProduct(productId);
    if (result.success && result.data) {
      const product = result.data;
      const isAvailable =
        product.status === "active" &&
        (product.is_digital ||
          product.stock_quantity === undefined ||
          product.stock_quantity > 0);

      return {
        success: true,
        data: {
          available: isAvailable,
          stock_quantity: product.stock_quantity,
          is_digital: product.is_digital,
          status: product.status,
          message: isAvailable
            ? "Product is available"
            : product.status !== "active"
              ? "Product is not active"
              : "Product is out of stock",
        },
      };
    }

    return {
      success: false,
      error: "Product not found",
      data: {
        available: false,
        stock_quantity: 0,
        is_digital: false,
        status: "not_found",
        message: "Product not found",
      },
    };
  }

  // Utility functions
  static formatPrice(price: number, currency: string = "IRR"): string {
    if (currency === "IRR") {
      return `${price.toLocaleString("fa-IR")} تومان`;
    } else if (currency === "USD") {
      return `$${price.toLocaleString("en-US")}`;
    } else if (currency === "EUR") {
      return `€${price.toLocaleString("en-US")}`;
    }
    return `${price.toLocaleString()} ${currency}`;
  }

  static getDiscountPercentage(
    originalPrice: number,
    discountedPrice: number,
  ): number {
    if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
    return Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
  }

  static getProductTypeLabel(type: ProductType, locale: string = "fa"): string {
    const labels: Record<string, Record<string, string>> = {
      fa: {
        book: "کتاب",
        artwork: "اثر هنری",
        article: "مقاله",
        cultural: "فرهنگی",
        other: "سایر",
      },
      en: {
        book: "Book",
        artwork: "Artwork",
        article: "Article",
        cultural: "Cultural",
        other: "Other",
      },
    };

    return labels[locale]?.[type] || type;
  }

  static getProductCategoryLabel(
    category: ProductCategory,
    locale: string = "fa",
  ): string {
    const labels: Record<string, Record<string, string>> = {
      fa: {
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
      },
      en: {
        books: "Books",
        digital_books: "Digital Books",
        physical_books: "Physical Books",
        artworks: "Artworks",
        paintings: "Paintings",
        sculptures: "Sculptures",
        digital_art: "Digital Art",
        articles: "Articles",
        cultural_items: "Cultural Items",
        handicrafts: "Handicrafts",
        educational: "Educational",
        research: "Research",
        other: "Other",
      },
    };

    return labels[locale]?.[category] || category;
  }

  static getProductStatusLabel(status: string, locale: string = "fa"): string {
    const labels: Record<string, Record<string, string>> = {
      fa: {
        active: "فعال",
        draft: "پیش‌نویس",
        archived: "آرشیو شده",
        out_of_stock: "ناموجود",
      },
      en: {
        active: "Active",
        draft: "Draft",
        archived: "Archived",
        out_of_stock: "Out of Stock",
      },
    };

    return labels[locale]?.[status] || status;
  }

  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: "text-green-600 bg-green-50",
      draft: "text-yellow-600 bg-yellow-50",
      archived: "text-gray-600 bg-gray-50",
      out_of_stock: "text-red-600 bg-red-50",
    };

    return colors[status] || "text-gray-600 bg-gray-50";
  }

  static isProductAvailable(product: Product): boolean {
    return (
      product.status === "active" &&
      (product.stock_quantity === undefined || product.stock_quantity > 0)
    );
  }

  static getProductStars(rating: number): Array<"full" | "half" | "empty"> {
    const stars: Array<"full" | "half" | "empty"> = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push("full");
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push("half");
    }

    // Fill remaining with empty stars
    while (stars.length < 5) {
      stars.push("empty");
    }

    return stars;
  }
}

export const productLesanApi = new ProductLesanApiService();
export { ProductLesanApiService };
export default productLesanApi;
