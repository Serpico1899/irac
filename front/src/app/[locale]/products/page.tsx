"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useProduct, useFeaturedCollections } from "@/context/ProductContext";
import ProductGrid from "@/components/organisms/Product/ProductGrid";
import ProductCard from "@/components/organisms/Product/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Palette,
  FileText,
  Package,
  Star,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  Grid,
  List,
  ArrowRight,
  Eye,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { ProductType, ProductCategory } from "@/types";
import { productApi, ProductApiService } from "@/services/product/productApi";

export default function ProductsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "fa";

  const { state, fetchProductCategories } = useProduct();
  const {
    featuredProducts,
    bestsellerProducts,
    newProducts,
    isLoading: featuredLoading,
  } = useFeaturedCollections();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAllFeatured, setShowAllFeatured] = useState(false);

  useEffect(() => {
    if (state.categories.length === 0) {
      fetchProductCategories();
    }
  }, []);

  const productTypes: Array<{
    value: ProductType | "all";
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      value: "all",
      label: "همه محصولات",
      icon: <Package className="h-4 w-4" />,
    },
    { value: "book", label: "کتاب‌ها", icon: <BookOpen className="h-4 w-4" /> },
    {
      value: "artwork",
      label: "آثار هنری",
      icon: <Palette className="h-4 w-4" />,
    },
    {
      value: "article",
      label: "مقالات",
      icon: <FileText className="h-4 w-4" />,
    },
    { value: "cultural", label: "فرهنگی", icon: <Star className="h-4 w-4" /> },
  ];

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    // This will be handled by ProductGrid component
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    // This will be handled by ProductGrid component
  };

  const getInitialQuery = () => {
    const query: any = { page: 1, limit: 12 };

    if (selectedCategory !== "all") {
      query.category = [selectedCategory];
    }

    if (selectedType !== "all") {
      query.type = [selectedType];
    }

    return query;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900">
              فروشگاه محصولات
            </h1>
            <p className="text-sm xs:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              مجموعه‌ای غنی از کتاب‌ها، آثار هنری، مقالات و محصولات فرهنگی را
              کشف کنید
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Product Type Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-primary" />
              دسته‌بندی محصولات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-3">
              {productTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeFilter(type.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-center hover:shadow-md ${
                    selectedType === type.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {type.icon}
                    <span className="text-xs xs:text-sm font-medium">
                      {type.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Featured Collections */}
        {!featuredLoading &&
          (featuredProducts.length > 0 ||
            bestsellerProducts.length > 0 ||
            newProducts.length > 0) && (
            <div className="space-y-6">
              {/* Featured Products */}
              {featuredProducts.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                      <CardTitle className="flex items-center gap-2 text-lg xs:text-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                        محصولات ویژه
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllFeatured(!showAllFeatured)}
                        className="self-end xs:self-auto"
                      >
                        {showAllFeatured ? "نمایش کمتر" : "مشاهده همه"}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
                      {(showAllFeatured
                        ? featuredProducts
                        : featuredProducts.slice(0, 4)
                      ).map((product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                          viewMode="grid"
                          locale={locale}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bestsellers */}
                {bestsellerProducts.length > 0 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        پرفروش‌ترین‌ها
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {bestsellerProducts
                          .slice(0, 3)
                          .map((product, index) => (
                            <div
                              key={product._id}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-shrink-0">
                                <Badge
                                  variant="warning"
                                  className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                                >
                                  {(index + 1).toLocaleString("fa-IR")}
                                </Badge>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {isRTL
                                    ? product.title
                                    : product.title_en || product.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1">
                                    {ProductApiService.getProductStars(
                                      product.rating.average,
                                    )
                                      .slice(0, 5)
                                      .map((star: any, idx: number) => (
                                        <Star
                                          key={idx}
                                          className={`h-3 w-3 ${
                                            star === "full"
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "fill-gray-200 text-gray-200"
                                          }`}
                                        />
                                      ))}
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    ({product.rating.count})
                                  </span>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="text-sm font-medium text-primary">
                                  {ProductApiService.formatPrice(
                                    product.discounted_price || product.price,
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* New Products */}
                {newProducts.length > 0 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-green-500" />
                        جدیدترین‌ها
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {newProducts.slice(0, 3).map((product) => (
                          <div
                            key={product._id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-shrink-0">
                              <Badge
                                variant="success"
                                className="text-xs py-1 px-2"
                              >
                                جدید
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {isRTL
                                  ? product.title
                                  : product.title_en || product.title}
                              </h4>
                              <p className="text-xs text-gray-600 truncate">
                                {ProductApiService.getProductTypeLabel(
                                  product.type,
                                  locale,
                                )}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className="text-sm font-medium text-primary">
                                {ProductApiService.formatPrice(
                                  product.discounted_price || product.price,
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

        {/* Main Product Grid */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg xs:text-xl">
              <Grid className="h-5 w-5 text-primary" />
              همه محصولات
              {selectedType !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {productTypes.find((t) => t.value === selectedType)?.label}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 xs:p-6">
              <ProductGrid
                initialQuery={getInitialQuery()}
                showSearch={true}
                showFilters={true}
                showSorting={true}
                showViewToggle={true}
                showPagination={true}
                locale={locale}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories List */}
        {state.categories.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                مرور بر اساس دسته‌بندی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {state.categories.map((category) => (
                  <button
                    key={category.category}
                    onClick={() => handleCategoryFilter(category.category)}
                    className="p-4 text-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {ProductApiService.getProductCategoryLabel(
                            category.category,
                            locale,
                          )}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {category.count.toLocaleString("fa-IR")} محصول
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl xs:text-3xl font-bold text-primary">
                  {state.productList?.pagination.total.toLocaleString(
                    "fa-IR",
                  ) || "---"}
                </div>
                <p className="text-xs xs:text-sm text-gray-600">کل محصولات</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl xs:text-3xl font-bold text-green-600">
                  {state.categories.length.toLocaleString("fa-IR")}
                </div>
                <p className="text-xs xs:text-sm text-gray-600">دسته‌بندی</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl xs:text-3xl font-bold text-orange-600">
                  {bestsellerProducts.length.toLocaleString("fa-IR")}
                </div>
                <p className="text-xs xs:text-sm text-gray-600">پرفروش</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl xs:text-3xl font-bold text-blue-600">
                  {featuredProducts.length.toLocaleString("fa-IR")}
                </div>
                <p className="text-xs xs:text-sm text-gray-600">ویژه</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
