import {
  Product,
  ProductQuery,
  ProductFilter,
  ProductListResponse,
  ProductReview,
  ProductApiResponse,
  ProductType,
  ProductCategory,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1405";

class ProductApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(
    response: Response,
  ): Promise<ProductApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.error || error.message || "An error occurred");
    }

    const data = await response.json();
    return data;
  }

  // Get products with filtering and pagination
  async getProducts(
    query: ProductQuery = {},
  ): Promise<ProductApiResponse<ProductListResponse>> {
    const url = new URL(`${API_BASE_URL}/products`);

    // Add query parameters
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, v.toString()));
        } else {
          url.searchParams.append(key, value.toString());
        }
      }
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ProductListResponse>(response);
  }

  // Get single product by ID or slug
  async getProduct(identifier: string): Promise<ProductApiResponse<Product>> {
    const response = await fetch(`${API_BASE_URL}/products/${identifier}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Product>(response);
  }

  // Get featured products
  async getFeaturedProducts(
    limit: number = 8,
  ): Promise<ProductApiResponse<Product[]>> {
    const response = await fetch(
      `${API_BASE_URL}/products/featured?limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      },
    );

    return this.handleResponse<Product[]>(response);
  }

  // Get bestseller products
  async getBestsellerProducts(
    limit: number = 8,
  ): Promise<ProductApiResponse<Product[]>> {
    const response = await fetch(
      `${API_BASE_URL}/products/bestsellers?limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      },
    );

    return this.handleResponse<Product[]>(response);
  }

  // Get new products
  async getNewProducts(
    limit: number = 8,
  ): Promise<ProductApiResponse<Product[]>> {
    const response = await fetch(
      `${API_BASE_URL}/products/new?limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      },
    );

    return this.handleResponse<Product[]>(response);
  }

  // Get products by category
  async getProductsByCategory(
    category: ProductCategory,
    query: ProductQuery = {},
  ): Promise<ProductApiResponse<ProductListResponse>> {
    return this.getProducts({ ...query, category: [category] });
  }

  // Get products by type
  async getProductsByType(
    type: ProductType,
    query: ProductQuery = {},
  ): Promise<ProductApiResponse<ProductListResponse>> {
    return this.getProducts({ ...query, type: [type] });
  }

  // Search products
  async searchProducts(
    searchTerm: string,
    query: ProductQuery = {},
  ): Promise<ProductApiResponse<ProductListResponse>> {
    return this.getProducts({ ...query, search: searchTerm });
  }

  // Get related products
  async getRelatedProducts(
    productId: string,
    limit: number = 4,
  ): Promise<ProductApiResponse<Product[]>> {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/related?limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      },
    );

    return this.handleResponse<Product[]>(response);
  }

  // Get product reviews
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<
    ProductApiResponse<{ reviews: ProductReview[]; pagination: any }>
  > {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/reviews?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      },
    );

    return this.handleResponse(response);
  }

  // Add product review
  async addProductReview(
    productId: string,
    review: {
      rating: number;
      title?: string;
      comment: string;
    },
  ): Promise<ProductApiResponse<ProductReview>> {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/reviews`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(review),
      },
    );

    return this.handleResponse<ProductReview>(response);
  }

  // Get product categories with counts
  async getProductCategories(): Promise<
    ProductApiResponse<
      Array<{ category: ProductCategory; count: number; name: string }>
    >
  > {
    const response = await fetch(`${API_BASE_URL}/products/categories`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Get product filters (for filter sidebar)
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
    const response = await fetch(`${API_BASE_URL}/products/filters`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Track product view
  async trackProductView(productId: string): Promise<ProductApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/view`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Check product availability
  async checkProductAvailability(productId: string): Promise<
    ProductApiResponse<{
      available: boolean;
      stock_quantity?: number;
      message?: string;
    }>
  > {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/availability`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      },
    );

    return this.handleResponse(response);
  }

  // Format price for display
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

  // Calculate discount percentage
  static getDiscountPercentage(
    originalPrice: number,
    discountedPrice: number,
  ): number {
    if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
    return Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
  }

  // Get product type label in Persian
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

  // Get product category label in Persian
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

  // Get product status label in Persian
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

  // Get status color for UI
  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: "text-green-600 bg-green-50",
      draft: "text-yellow-600 bg-yellow-50",
      archived: "text-gray-600 bg-gray-50",
      out_of_stock: "text-red-600 bg-red-50",
    };

    return colors[status] || "text-gray-600 bg-gray-50";
  }

  // Check if product is available
  static isProductAvailable(product: Product): boolean {
    return (
      product.status === "active" &&
      (product.stock_quantity === undefined || product.stock_quantity > 0)
    );
  }

  // Get product rating stars (returns array of star states)
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

export const productApi = new ProductApiService();
export { ProductApiService };
export default productApi;
