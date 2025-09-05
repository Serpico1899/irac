"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Product } from "@/types";
import { productApi, ProductApiService } from "@/services/product/productApi";
import { useFeaturedCollections } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/organisms/Product/ProductCard";
import {
  Star,
  TrendingUp,
  Sparkles,
  Zap,
  Award,
  Eye,
  ArrowRight,
  ArrowLeft,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Package,
  Clock,
  Heart,
  ShoppingCart,
} from "lucide-react";

interface FeaturedProductsProps {
  className?: string;
  locale?: string;
  showTitle?: boolean;
  maxProducts?: {
    featured?: number;
    bestseller?: number;
    new?: number;
  };
  layout?: "grid" | "carousel" | "mixed";
  showViewToggle?: boolean;
  showLoadMore?: boolean;
}

export function FeaturedProducts({
  className = "",
  locale = "fa",
  showTitle = true,
  maxProducts = {
    featured: 8,
    bestseller: 6,
    new: 6,
  },
  layout = "mixed",
  showViewToggle = false,
  showLoadMore = true,
}: FeaturedProductsProps) {
  const t = useTranslations();
  const { featuredProducts, bestsellerProducts, newProducts, isLoading } =
    useFeaturedCollections();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedSections, setExpandedSections] = useState({
    featured: true,
    bestseller: false,
    new: false,
  });
  const [visibleProducts, setVisibleProducts] = useState({
    featured: maxProducts.featured || 4,
    bestseller: maxProducts.bestseller || 4,
    new: maxProducts.new || 4,
  });

  const isRTL = locale === "fa";

  const sections = [
    {
      key: "featured",
      title: "محصولات ویژه",
      titleEn: "Featured Products",
      products: featuredProducts,
      icon: <Sparkles className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      badgeColor: "info",
    },
    {
      key: "bestseller",
      title: "پرفروش‌ترین‌ها",
      titleEn: "Bestsellers",
      products: bestsellerProducts,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      badgeColor: "warning",
    },
    {
      key: "new",
      title: "جدیدترین‌ها",
      titleEn: "New Products",
      products: newProducts,
      icon: <Zap className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      badgeColor: "success",
    },
  ];

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const loadMoreProducts = (sectionKey: string) => {
    setVisibleProducts((prev: any) => ({
      ...prev,
      [sectionKey]: prev[sectionKey] + 4,
    }));
  };

  const renderProductsGrid = (products: Product[], sectionKey: string) => {
    const visibleCount = visibleProducts[sectionKey];
    const displayProducts = products.slice(0, visibleCount);

    if (layout === "carousel") {
      return (
        <div className="relative">
          <div className="flex gap-4 xs:gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {displayProducts.map((product) => (
              <div key={product._id} className="flex-shrink-0 w-64 xs:w-72">
                <ProductCard
                  product={product}
                  viewMode="grid"
                  locale={locale}
                />
              </div>
            ))}
          </div>

          {/* Show remaining count */}
          {products.length > visibleCount && showLoadMore && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => loadMoreProducts(sectionKey)}
                className="text-sm"
              >
                مشاهده {products.length - visibleCount} محصول دیگر
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div
          className={`grid grid-cols-1 ${
            viewMode === "grid"
              ? "xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6"
              : "gap-4"
          }`}
        >
          {displayProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              viewMode={viewMode}
              locale={locale}
            />
          ))}
        </div>

        {products.length > visibleCount && showLoadMore && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => loadMoreProducts(sectionKey)}
              className="text-sm"
            >
              مشاهده {products.length - visibleCount} محصول دیگر
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderCompactList = (products: Product[], maxItems = 3) => {
    return (
      <div className="space-y-3">
        {products.slice(0, maxItems).map((product, index) => {
          const title = isRTL
            ? product.title
            : product.title_en || product.title;
          const author = isRTL
            ? product.author
            : product.author_en || product.author;
          const artist = isRTL
            ? product.artist
            : product.artist_en || product.artist;

          return (
            <div
              key={product._id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              {/* Ranking Number */}
              <div className="flex-shrink-0">
                <Badge
                  variant="secondary"
                  className="w-8 h-8 rounded-full flex items-center justify-center p-0 text-sm font-bold"
                >
                  {(index + 1).toLocaleString("fa-IR")}
                </Badge>
              </div>

              {/* Product Image */}
              <div className="relative w-12 h-12 xs:w-16 xs:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {product.featured_image ? (
                  <Image
                    src={product.featured_image.url}
                    alt={product.featured_image.alt || title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate text-sm xs:text-base">
                  {title}
                </h4>
                {(author || artist) && (
                  <p className="text-xs xs:text-sm text-gray-600 truncate">
                    {author || artist}
                  </p>
                )}

                {/* Rating */}
                {product.rating.count > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex items-center gap-0.5">
                      {ProductApiService.getProductStars(product.rating.average)
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
                    <span className="text-xs text-gray-500">
                      ({product.rating.count})
                    </span>
                  </div>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-sm xs:text-base font-bold text-primary">
                  {ProductApiService.formatPrice(
                    product.discounted_price || product.price,
                  )}
                </span>

                <div className="flex items-center gap-1 xs:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="p-1 h-8 w-8">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`space-y-8 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-48 bg-gray-300 rounded-lg"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Filter sections that have products
  const activeSections = sections.filter(
    (section) => section.products.length > 0,
  );

  if (activeSections.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">محصولات ویژه‌ای یافت نشد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      {showTitle && (
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4">
          <div>
            <h2 className="text-xl xs:text-2xl font-bold text-gray-900 mb-2">
              مجموعه محصولات ویژه
            </h2>
            <p className="text-gray-600 text-sm xs:text-base">
              بهترین و محبوب‌ترین محصولات را کشف کنید
            </p>
          </div>

          {showViewToggle && (
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="p-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Featured Collections */}
      {layout === "mixed" ? (
        <div className="space-y-8">
          {/* Hero Featured Products */}
          {featuredProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg xs:text-xl">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  محصولات ویژه
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderProductsGrid(featuredProducts, "featured")}
              </CardContent>
            </Card>
          )}

          {/* Side by Side: Bestsellers & New Products */}
          {(bestsellerProducts.length > 0 || newProducts.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bestsellers */}
              {bestsellerProducts.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      پرفروش‌ترین‌ها
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderCompactList(bestsellerProducts, 5)}
                    {bestsellerProducts.length > 5 && (
                      <div className="text-center mt-4">
                        <Button variant="outline" size="sm">
                          مشاهده همه
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* New Products */}
              {newProducts.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                      جدیدترین‌ها
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderCompactList(newProducts, 5)}
                    {newProducts.length > 5 && (
                      <div className="text-center mt-4">
                        <Button variant="outline" size="sm">
                          مشاهده همه
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        // Standard layout
        activeSections.map((section) => (
          <Card key={section.key}>
            <CardHeader
              className="cursor-pointer"
              onClick={() =>
                layout !== "carousel" && toggleSection(section.key)
              }
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg xs:text-xl">
                  <span className={section.color}>{section.icon}</span>
                  {isRTL ? section.title : section.titleEn}
                  <Badge variant={section.badgeColor as any} className="ml-2">
                    {section.products.length}
                  </Badge>
                </CardTitle>

                {layout !== "carousel" && (
                  <Button variant="ghost" size="sm" className="p-2">
                    {expandedSections[section.key] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>

            {((expandedSections as any)[section.key] ||
              layout === "carousel") && (
              <CardContent>
                {renderProductsGrid(section.products, section.key)}
              </CardContent>
            )}
          </Card>
        ))
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 xs:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-1">
              <div className="text-xl xs:text-2xl font-bold text-blue-600">
                {featuredProducts.length}
              </div>
              <p className="text-xs xs:text-sm text-gray-600">محصولات ویژه</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-1">
              <div className="text-xl xs:text-2xl font-bold text-orange-600">
                {bestsellerProducts.length}
              </div>
              <p className="text-xs xs:text-sm text-gray-600">پرفروش</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-1">
              <div className="text-xl xs:text-2xl font-bold text-green-600">
                {newProducts.length}
              </div>
              <p className="text-xs xs:text-sm text-gray-600">جدید</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-1">
              <div className="text-xl xs:text-2xl font-bold text-primary">
                {activeSections.reduce(
                  (total, section) => total + section.products.length,
                  0,
                )}
              </div>
              <p className="text-xs xs:text-sm text-gray-600">کل محصولات</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FeaturedProducts;
