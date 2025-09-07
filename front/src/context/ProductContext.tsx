"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  Product,
  ProductQuery,
  ProductFilter,
  ProductListResponse,
  ProductReview,
  ProductType,
  ProductCategory,
} from "@/types";
import { productLesanApi } from "@/services/product/productLesanApi";

// Product state interface
interface ProductState {
  // Products list
  products: Product[];
  productList: ProductListResponse | null;

  // Single product
  selectedProduct: Product | null;
  relatedProducts: Product[];
  productReviews: ProductReview[];

  // Featured collections
  featuredProducts: Product[];
  bestsellerProducts: Product[];
  newProducts: Product[];

  // Categories and filters
  categories: Array<{ category: ProductCategory; count: number; name: string }>;
  availableFilters: {
    categories: Array<{
      category: ProductCategory;
      count: number;
      name: string;
    }>;
    types: Array<{ type: ProductType; count: number; name: string }>;
    price_range: { min: number; max: number };
    tags: Array<{ tag: string; count: number }>;
  } | null;

  // Current filters and search
  currentQuery: ProductQuery;
  searchTerm: string;

  // Loading states
  isLoading: boolean;
  isProductLoading: boolean;
  isFeaturedLoading: boolean;
  isReviewsLoading: boolean;

  // Error states
  error: string | null;
  productError: string | null;

  // UI state
  viewMode: "grid" | "list";
  sortBy: string;

  // Last updated
  lastUpdated: Date | null;
}

// Action types
type ProductAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PRODUCT_LOADING"; payload: boolean }
  | { type: "SET_FEATURED_LOADING"; payload: boolean }
  | { type: "SET_REVIEWS_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PRODUCT_ERROR"; payload: string | null }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_PRODUCT_LIST"; payload: ProductListResponse }
  | { type: "SET_SELECTED_PRODUCT"; payload: Product | null }
  | { type: "SET_RELATED_PRODUCTS"; payload: Product[] }
  | { type: "SET_PRODUCT_REVIEWS"; payload: ProductReview[] }
  | { type: "SET_FEATURED_PRODUCTS"; payload: Product[] }
  | { type: "SET_BESTSELLER_PRODUCTS"; payload: Product[] }
  | { type: "SET_NEW_PRODUCTS"; payload: Product[] }
  | {
      type: "SET_CATEGORIES";
      payload: Array<{
        category: ProductCategory;
        count: number;
        name: string;
      }>;
    }
  | { type: "SET_AVAILABLE_FILTERS"; payload: any }
  | { type: "SET_CURRENT_QUERY"; payload: ProductQuery }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "SET_SORT_BY"; payload: string }
  | { type: "ADD_REVIEW"; payload: ProductReview }
  | { type: "CLEAR_PRODUCTS" }
  | { type: "SET_LAST_UPDATED"; payload: Date };

// Initial state
const initialState: ProductState = {
  products: [],
  productList: null,
  selectedProduct: null,
  relatedProducts: [],
  productReviews: [],
  featuredProducts: [],
  bestsellerProducts: [],
  newProducts: [],
  categories: [],
  availableFilters: null,
  currentQuery: { page: 1, limit: 12 },
  searchTerm: "",
  isLoading: false,
  isProductLoading: false,
  isFeaturedLoading: false,
  isReviewsLoading: false,
  error: null,
  productError: null,
  viewMode: "grid",
  sortBy: "created_at",
  lastUpdated: null,
};

// Reducer
function productReducer(
  state: ProductState,
  action: ProductAction,
): ProductState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_PRODUCT_LOADING":
      return { ...state, isProductLoading: action.payload };
    case "SET_FEATURED_LOADING":
      return { ...state, isFeaturedLoading: action.payload };
    case "SET_REVIEWS_LOADING":
      return { ...state, isReviewsLoading: action.payload };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isFeaturedLoading: false,
      };
    case "SET_PRODUCT_ERROR":
      return {
        ...state,
        productError: action.payload,
        isProductLoading: false,
      };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload, error: null };
    case "SET_PRODUCT_LIST":
      return { ...state, productList: action.payload, error: null };
    case "SET_SELECTED_PRODUCT":
      return { ...state, selectedProduct: action.payload, productError: null };
    case "SET_RELATED_PRODUCTS":
      return { ...state, relatedProducts: action.payload };
    case "SET_PRODUCT_REVIEWS":
      return { ...state, productReviews: action.payload };
    case "SET_FEATURED_PRODUCTS":
      return { ...state, featuredProducts: action.payload };
    case "SET_BESTSELLER_PRODUCTS":
      return { ...state, bestsellerProducts: action.payload };
    case "SET_NEW_PRODUCTS":
      return { ...state, newProducts: action.payload };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "SET_AVAILABLE_FILTERS":
      return { ...state, availableFilters: action.payload };
    case "SET_CURRENT_QUERY":
      return { ...state, currentQuery: action.payload };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };
    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload };
    case "ADD_REVIEW":
      return {
        ...state,
        productReviews: [action.payload, ...state.productReviews],
      };
    case "CLEAR_PRODUCTS":
      return { ...initialState };
    case "SET_LAST_UPDATED":
      return { ...state, lastUpdated: action.payload };
    default:
      return state;
  }
}

// Context interface
interface ProductContextType {
  state: ProductState;

  // Data fetching methods
  fetchProducts: (query?: ProductQuery) => Promise<void>;
  fetchProduct: (identifier: string) => Promise<void>;
  fetchFeaturedProducts: (limit?: number) => Promise<void>;
  fetchBestsellerProducts: (limit?: number) => Promise<void>;
  fetchNewProducts: (limit?: number) => Promise<void>;
  fetchProductsByCategory: (
    category: ProductCategory,
    query?: ProductQuery,
  ) => Promise<void>;
  fetchProductsByType: (
    type: ProductType,
    query?: ProductQuery,
  ) => Promise<void>;
  fetchRelatedProducts: (productId: string, limit?: number) => Promise<void>;
  fetchProductReviews: (
    productId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchProductCategories: () => Promise<void>;
  fetchProductFilters: () => Promise<void>;

  // Search and filter methods
  searchProducts: (searchTerm: string, query?: ProductQuery) => Promise<void>;
  applyFilters: (filters: ProductFilter) => Promise<void>;
  clearFilters: () => void;
  setQuery: (query: ProductQuery) => void;
  setSearchTerm: (term: string) => void;

  // UI methods
  setViewMode: (mode: "grid" | "list") => void;
  setSortBy: (sortBy: string) => void;

  // Product actions
  trackProductView: (productId: string) => Promise<void>;
  addProductReview: (
    productId: string,
    review: {
      rating: number;
      title?: string;
      comment: string;
    },
  ) => Promise<boolean>;

  // Utility methods
  refreshData: () => Promise<void>;
  clearError: () => void;
  clearProductError: () => void;
}

// Create context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Provider component
interface ProductProviderProps {
  children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Auto-fetch initial data
  useEffect(() => {
    fetchProductCategories();
    fetchProductFilters();
    fetchFeaturedProducts();
  }, []);

  const handleApiError = (error: any, isProductError: boolean = false) => {
    const errorMessage = error.message || "خطای غیرمنتظره رخ داده است";
    if (isProductError) {
      dispatch({ type: "SET_PRODUCT_ERROR", payload: errorMessage });
    } else {
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
    console.error("Product API Error:", error);
  };

  const fetchProducts = async (query: ProductQuery = state.currentQuery) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_CURRENT_QUERY", payload: query });

      const response = await productLesanApi.getProducts(query);

      if (response.success && response.data) {
        dispatch({ type: "SET_PRODUCT_LIST", payload: response.data });
        dispatch({ type: "SET_PRODUCTS", payload: response.data.products });
        dispatch({ type: "SET_LAST_UPDATED", payload: new Date() });
      } else {
        throw new Error(response.error || "Failed to fetch products");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const fetchProduct = async (identifier: string) => {
    try {
      dispatch({ type: "SET_PRODUCT_LOADING", payload: true });
      const response = await productLesanApi.getProduct(identifier);

      if (response.success && response.data) {
        dispatch({ type: "SET_SELECTED_PRODUCT", payload: response.data });

        // Also fetch related products
        if (response.data._id) {
          fetchRelatedProducts(response.data._id);
        }

        // Track product view
        trackProductView(response.data._id);
      } else {
        throw new Error(response.error || "Failed to fetch product");
      }
    } catch (error) {
      handleApiError(error, true);
    } finally {
      dispatch({ type: "SET_PRODUCT_LOADING", payload: false });
    }
  };

  const fetchFeaturedProducts = async (limit: number = 8) => {
    try {
      dispatch({ type: "SET_FEATURED_LOADING", payload: true });
      const response = await productLesanApi.getFeaturedProducts(limit);

      if (response.success && response.data) {
        dispatch({ type: "SET_FEATURED_PRODUCTS", payload: response.data });
      } else {
        throw new Error(response.error || "Failed to fetch featured products");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      dispatch({ type: "SET_FEATURED_LOADING", payload: false });
    }
  };

  const fetchBestsellerProducts = async (limit: number = 8) => {
    try {
      const response = await productLesanApi.getBestsellerProducts(limit);

      if (response.success && response.data) {
        dispatch({ type: "SET_BESTSELLER_PRODUCTS", payload: response.data });
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchNewProducts = async (limit: number = 8) => {
    try {
      const response = await productLesanApi.getNewProducts(limit);

      if (response.success && response.data) {
        dispatch({ type: "SET_NEW_PRODUCTS", payload: response.data });
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchProductsByCategory = async (
    category: ProductCategory,
    query: ProductQuery = {},
  ) => {
    return fetchProducts({ ...query, category: [category] });
  };

  const fetchProductsByType = async (
    type: ProductType,
    query: ProductQuery = {},
  ) => {
    return fetchProducts({ ...query, type: [type] });
  };

  const fetchRelatedProducts = async (productId: string, limit: number = 4) => {
    try {
      const response = await productLesanApi.getRelatedProducts(
        productId,
        limit,
      );

      if (response.success && response.data) {
        dispatch({ type: "SET_RELATED_PRODUCTS", payload: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch related products:", error);
    }
  };

  const fetchProductReviews = async (
    productId: string,
    page: number = 1,
    limit: number = 10,
  ) => {
    try {
      dispatch({ type: "SET_REVIEWS_LOADING", payload: true });
      const response = await productApi.getProductReviews(
        productId,
        page,
        limit,
      );

      if (response.success && response.data) {
        dispatch({
          type: "SET_PRODUCT_REVIEWS",
          payload: response.data.reviews,
        });
      }
    } catch (error) {
      console.error("Failed to fetch product reviews:", error);
    } finally {
      dispatch({ type: "SET_REVIEWS_LOADING", payload: false });
    }
  };

  const fetchProductCategories = async () => {
    try {
      const response = await productLesanApi.getProductFilters();
      if (response.success && response.data) {
        dispatch({ type: "SET_CATEGORIES", payload: response.data.categories });
      } else {
        throw new Error(response.error || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Failed to fetch product categories:", error);
    }
  };

  const fetchProductFilters = async () => {
    try {
      const response = await productLesanApi.getProductFilters();

      if (response.success && response.data) {
        dispatch({ type: "SET_AVAILABLE_FILTERS", payload: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch product filters:", error);
    }
  };

  const searchProducts = async (
    searchTerm: string,
    query: ProductQuery = {},
  ) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: searchTerm });
    return fetchProducts({ ...query, search: searchTerm, page: 1 });
  };

  const applyFilters = async (filters: ProductFilter) => {
    const newQuery = { ...state.currentQuery, ...filters, page: 1 };
    return fetchProducts(newQuery);
  };

  const clearFilters = () => {
    const newQuery = { page: 1, limit: state.currentQuery.limit };
    dispatch({ type: "SET_CURRENT_QUERY", payload: newQuery });
    dispatch({ type: "SET_SEARCH_TERM", payload: "" });
    fetchProducts(newQuery);
  };

  const setQuery = (query: ProductQuery) => {
    dispatch({ type: "SET_CURRENT_QUERY", payload: query });
    fetchProducts(query);
  };

  const setSearchTerm = (term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  };

  const setViewMode = (mode: "grid" | "list") => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  };

  const setSortBy = (sortBy: string) => {
    dispatch({ type: "SET_SORT_BY", payload: sortBy });
    const newQuery = { ...state.currentQuery, sort_by: sortBy as any, page: 1 };
    setQuery(newQuery);
  };

  const trackProductView = async (productId: string) => {
    try {
      productLesanApi.trackProductView(productId);
    } catch (error) {
      console.error("Failed to track product view:", error);
    }
  };

  const addProductReview = async (
    productId: string,
    review: {
      rating: number;
      title?: string;
      comment: string;
    },
  ): Promise<boolean> => {
    try {
      const response = await productApi.addProductReview(productId, review);

      if (response.success && response.data) {
        dispatch({ type: "ADD_REVIEW", payload: response.data });
        return true;
      } else {
        throw new Error(response.error || "Failed to add review");
      }
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchProducts(state.currentQuery),
      fetchFeaturedProducts(),
      fetchProductCategories(),
      fetchProductFilters(),
    ]);
  };

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  const clearProductError = () => {
    dispatch({ type: "SET_PRODUCT_ERROR", payload: null });
  };

  const value: ProductContextType = {
    state,
    fetchProducts,
    fetchProduct,
    fetchFeaturedProducts,
    fetchBestsellerProducts,
    fetchNewProducts,
    fetchProductsByCategory,
    fetchProductsByType,
    fetchRelatedProducts,
    fetchProductReviews,
    fetchProductCategories,
    fetchProductFilters,
    searchProducts,
    applyFilters,
    clearFilters,
    setQuery,
    setSearchTerm,
    setViewMode,
    setSortBy,
    trackProductView,
    addProductReview,
    refreshData,
    clearError,
    clearProductError,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

// Hook to use product context
export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}

// Hook for product list with pagination
export function useProductList(initialQuery: ProductQuery = {}) {
  const { state, fetchProducts, setQuery } = useProduct();

  useEffect(() => {
    if (Object.keys(initialQuery).length > 0) {
      fetchProducts(initialQuery);
    }
  }, []);

  return {
    products: state.products,
    productList: state.productList,
    isLoading: state.isLoading,
    error: state.error,
    currentQuery: state.currentQuery,
    setQuery,
    refresh: () => fetchProducts(state.currentQuery),
  };
}

// Hook for single product
export function useProductDetail(productId?: string) {
  const { state, fetchProduct, fetchProductReviews } = useProduct();

  useEffect(() => {
    if (productId && productId !== state.selectedProduct?._id) {
      fetchProduct(productId);
    }
  }, [productId]);

  return {
    product: state.selectedProduct,
    relatedProducts: state.relatedProducts,
    reviews: state.productReviews,
    isLoading: state.isProductLoading,
    isReviewsLoading: state.isReviewsLoading,
    error: state.productError,
    refresh: () => productId && fetchProduct(productId),
    loadReviews: (page?: number) =>
      productId && fetchProductReviews(productId, page),
  };
}

// Hook for featured collections
export function useFeaturedCollections() {
  const {
    state,
    fetchFeaturedProducts,
    fetchBestsellerProducts,
    fetchNewProducts,
  } = useProduct();

  useEffect(() => {
    if (state.featuredProducts.length === 0) {
      fetchFeaturedProducts();
    }
    if (state.bestsellerProducts.length === 0) {
      fetchBestsellerProducts();
    }
    if (state.newProducts.length === 0) {
      fetchNewProducts();
    }
  }, []);

  return {
    featuredProducts: state.featuredProducts,
    bestsellerProducts: state.bestsellerProducts,
    newProducts: state.newProducts,
    isLoading: state.isFeaturedLoading,
    refresh: () =>
      Promise.all([
        fetchFeaturedProducts(),
        fetchBestsellerProducts(),
        fetchNewProducts(),
      ]),
  };
}
