"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Product, ProductCartItem } from "@/types";
import { productApi } from "@/services/product/productApi";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Star,
  ShoppingCart,
  Eye,
  Download,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  showQuickActions?: boolean;
  className?: string;
  locale?: string;
}

export function ProductCard({
  product,
  viewMode = "grid",
  showQuickActions = true,
  className = "",
  locale = "fa",
}: ProductCardProps) {
  const t = useTranslations();
  const { addToCart } = useCart();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isRTL = locale === "fa";
  const title = isRTL ? product.title : (product.title_en || product.title);
  const description = isRTL ? product.description : (product.description_en || product.description);
  const author = isRTL ? product.author : (product.author_en || product.author);
  const artist = isRTL ? product.artist : (product.artist_en || product.artist);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productApi.isProductAvailable(product)) {
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItem: Omit<ProductCartItem, "quantity" | "addedAt"> = {
        id: product._id,
        type: "product",
        product_type: product.type,
        name: title,
        name_en: product.title_en,
        slug: product.slug,
        price: product.discounted_price || product.price,
        discounted_price: product.discounted_price,
        featured_image: product.featured_image,
        instructor: author || artist,
        instructor_en: product.author_en || product.artist_en,
        is_digital: product.is_digital,
        file_url: product.file_url,
        specifications: product.specifications,
      };

      addToCart(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const renderStars = (rating: number) => {
    const stars = productApi.getProductStars(rating);
    return (
      <div className="flex items-center gap-0.5">
        {stars.map((star, index) => (
          <Star
            key={index}
            className={`h-3 w-3 xs:h-4 xs:w-4 ${
              star === "full"
                ? "fill-yellow-400 text-yellow-400"
                : star === "half"
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderPrice = () => {
    const hasDiscount = product.discounted_price && product.discounted_price < product.price;

    return (
      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
        <span className="text-lg xs:text-xl font-bold text-primary">
          {productApi.formatPrice(product.discounted_price || product.price)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-sm text-gray-500 line-through">
              {productApi.formatPrice(product.price)}
            </span>
            <Badge variant="destructive" className="text-xs py-0.5 px-1.5">
              {productApi.getDiscountPercentage(product.price, product.discounted_price!)}% تخفیف
            </Badge>
          </>
        )}
      </div>
    );
  };

  const renderStatusBadges = () => (
    <div className="flex flex-wrap gap-1.5">
      {product.is_new && (
        <Badge variant="success" className="text-xs py-0.5 px-2">
          جدید
        </Badge>
      )}
      {product.is_bestseller && (
        <Badge variant="warning" className="text-xs py-0.5 px-2">
          پرفروش
        </Badge>
      )}
      {product.is_featured && (
        <Badge variant="info" className="text-xs py-0.5 px-2">
          ویژه
        </Badge>
      )}
      {product.is_digital && (
        <Badge variant="secondary" className="text-xs py-0.5 px-2 flex items-center gap-1">
          <Download className="h-3 w-3" />
          دیجیتال
        </Badge>
      )}
    </div>
  );

  const renderAvailabilityStatus = () => {
    const isAvailable = productApi.isProductAvailable(product);

    if (!isAvailable) {
      return (
        <div className="flex items-center gap-1.5 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">ناموجود</span>
        </div>
      );
    }

    if (product.stock_quantity !== undefined && product.stock_quantity <= 5 && product.stock_quantity > 0) {
      return (
        <div className="flex items-center gap-1.5 text-orange-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm">تنها {product.stock_quantity} عدد باقی مانده</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">موجود</span>
      </div>
    );
  };

  if (viewMode === "list") {
    return (
      <Card className={`w-full hover:shadow-md transition-shadow ${className}`}>
        <Link href={`/products/${product.slug}`} className="block">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Image */}
              <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {product.featured_image && !imageError ? (
                  <Image
                    src={product.featured_image.url}
                    alt={product.featured_image.alt || title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="h-8 w-8" />
                  </div>
                )}

                {/* Status badges overlay */}
                <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
                  {renderStatusBadges()}
                </div>

                {/* Wishlist button */}
                {showQuickActions && (
                  <button
                    onClick={handleWishlistToggle}
                    className="absolute top-2 right-2 rtl:right-auto rtl:left-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Type and Category */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{productApi.getProductTypeLabel(product.type, locale)}</span>
                  <span>•</span>
                  <span>{productApi.getProductCategoryLabel(product.category, locale)}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2">
                  {title}
                </h3>

                {/* Author/Artist */}
                {(author || artist) && (
                  <p className="text-sm text-gray-600">
                    {isRTL ? "نویسنده: " : "Author: "}
                    <span className="font-medium">{author || artist}</span>
                  </p>
                )}

                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {description}
                </p>

                {/* Rating and Reviews */}
                {product.rating.count > 0 && (
                  <div className="flex items-center gap-2">
                    {renderStars(product.rating.average)}
                    <span className="text-sm text-gray-600">
                      ({product.rating.count} نظر)
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  {/* Price */}
                  {renderPrice()}

                  {/* Availability */}
                  {renderAvailabilityStatus()}
                </div>
              </div>

              {/* Actions */}
              {showQuickActions && (
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!productApi.isProductAvailable(product) || isAddingToCart}
                    className="flex-1 sm:flex-none h-10 px-4"
                    size="sm"
                  >
                    {isAddingToCart ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 ml-2" />
                        افزودن به سبد
                      </>
                    )}
                  </Button>

                  <Button variant="outline" size="sm" className="h-10 px-3">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className={`w-full hover:shadow-md transition-shadow group ${className}`}>
      <Link href={`/products/${product.slug}`} className="block">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative w-full h-48 xs:h-56 rounded-t-lg overflow-hidden bg-gray-100">
            {product.featured_image && !imageError ? (
              <Image
                src={product.featured_image.url}
                alt={product.featured_image.alt || title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="h-12 w-12" />
              </div>
            )}

            {/* Status badges overlay */}
            <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
              {renderStatusBadges()}
            </div>

            {/* Wishlist and Quick view buttons */}
            {showQuickActions && (
              <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleWishlistToggle}
                  className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>
                <button className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors">
                  <Eye className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Type and Category */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{productApi.getProductTypeLabel(product.type, locale)}</span>
              <span>•</span>
              <span>{productApi.getProductCategoryLabel(product.category, locale)}</span>
            </div>

            {/* Title */}
            <h3 className="text-base xs:text-lg font-semibold text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem] xs:min-h-[3rem]">
              {title}
            </h3>

            {/* Author/Artist */}
            {(author || artist) && (
              <p className="text-sm text-gray-600 leading-relaxed truncate">
                {isRTL ? "نویسنده: " : "Author: "}
                <span className="font-medium">{author || artist}</span>
              </p>
            )}

            {/* Rating */}
            {product.rating.count > 0 && (
              <div className="flex items-center gap-2">
                {renderStars(product.rating.average)}
                <span className="text-xs text-gray-600">
                  ({product.rating.count})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="min-h-[2rem]">
              {renderPrice()}
            </div>

            {/* Availability */}
            <div className="text-xs">
              {renderAvailabilityStatus()}
            </div>

            {/* Add to Cart Button */}
            {showQuickActions && (
              <Button
                onClick={handleAddToCart}
                disabled={!productApi.isProductAvailable(product) || isAddingToCart}
                className="w-full h-10 text-sm"
                size="sm"
              >
                {isAddingToCart ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 ml-2" />
                    افزودن به سبد
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export default ProductCard;
