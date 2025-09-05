"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter, notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { Product, CartItem } from "@/types";
import { productApi, ProductApiService } from "@/services/product/productApi";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ProductCard from "@/components/organisms/Product/ProductCard";
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
  Share2,
  BookOpen,
  Palette,
  FileText,
  User,
  Calendar,
  Tag,
  Truck,
  Shield,
  RefreshCw,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Minus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  Info,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const { addToCart } = useCart();
  const { state, fetchProduct, fetchRelatedProducts } = useProduct();

  const slug = params.slug as string;
  const locale = params.locale as string;
  const isRTL = locale === "fa";

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch product when slug changes
  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetchProduct(slug).catch((error) => {
        console.error("Error loading product:", error);
        setLoading(false);
        notFound();
      });
    }
  }, [slug, fetchProduct]);

  // Handle product state changes from context
  useEffect(() => {
    if (state.selectedProduct && loading) {
      setProduct(state.selectedProduct);

      // Fetch related products
      fetchRelatedProducts(state.selectedProduct._id, 8);
      setLoading(false);
    } else if (state.productError && loading) {
      setLoading(false);
      notFound();
    }
  }, [
    state.selectedProduct,
    state.productError,
    loading,
    fetchRelatedProducts,
  ]);

  // Handle related products state changes
  useEffect(() => {
    if (state.relatedProducts.length > 0) {
      setRelatedProducts(state.relatedProducts.slice(0, 8));
    }
  }, [state.relatedProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <div className="h-96 bg-gray-300 rounded-lg"></div>
              </div>
              <div className="lg:w-1/2 space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
                <div className="h-12 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const title = isRTL ? product.title : product.title_en || product.title;
  const description = isRTL
    ? product.description
    : product.description_en || product.description;
  const author = isRTL ? product.author : product.author_en || product.author;
  const artist = isRTL ? product.artist : product.artist_en || product.artist;

  const handleAddToCart = async () => {
    if (!ProductApiService.isProductAvailable(product)) {
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItem: Omit<CartItem, "quantity" | "addedAt"> = {
        id: product._id,
        type: "product",
        name: title,
        name_en: product.title_en,
        slug: product.slug,
        price: product.discounted_price || product.price,
        discounted_price: product.discounted_price,
        featured_image: product.featured_image,
        instructor: author || artist,
        instructor_en: product.author_en || product.artist_en,
        product_type: product.type,
        is_digital: product.is_digital,
        file_url: product.file_url,
        specifications: product.specifications,
      };

      for (let i = 0; i < quantity; i++) {
        addToCart(cartItem);
      }

      // Show success message
      alert(isRTL ? "محصول به سبد خرید اضافه شد" : "Product added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(
        isRTL ? "خطا در افزودن محصول به سبد" : "Error adding product to cart",
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(
      1,
      Math.min(quantity + change, product.stock_quantity || 99),
    );
    setQuantity(newQuantity);
  };

  const renderStars = (
    rating: number,
    size = "sm",
    interactive = false,
    onRatingChange?: (rating: number) => void,
  ) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    const sizeClass =
      size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";

    return (
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <button
            key={star}
            onClick={interactive ? () => onRatingChange?.(star) : undefined}
            disabled={!interactive}
            className={
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }
          >
            <Star
              className={`${sizeClass} ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderPrice = () => {
    const hasDiscount =
      product.discounted_price && product.discounted_price < product.price;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl xs:text-3xl font-bold text-primary">
            {ProductApiService.formatPrice(
              product.discounted_price || product.price,
            )}
          </span>
          {hasDiscount && (
            <Badge variant="destructive" className="text-sm py-1 px-2">
              {ProductApiService.getDiscountPercentage(
                product.price,
                product.discounted_price!,
              )}
              % تخفیف
            </Badge>
          )}
        </div>
        {hasDiscount && (
          <div className="flex items-center gap-2">
            <span className="text-lg text-gray-500 line-through">
              {ProductApiService.formatPrice(product.price)}
            </span>
            <span className="text-sm text-green-600 font-medium">
              شما{" "}
              {ProductApiService.formatPrice(
                product.price - product.discounted_price!,
              )}{" "}
              صرفه‌جویی می‌کنید
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderProductImages = () => {
    const images =
      product.gallery && product.gallery.length > 0
        ? [product.featured_image, ...product.gallery].filter(Boolean)
        : product.featured_image
          ? [product.featured_image]
          : [];

    if (images.length === 0) {
      return (
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <Package className="h-16 w-16 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative w-full h-96 xs:h-[28rem] bg-gray-100 rounded-lg overflow-hidden">
          {!imageError && images[selectedImageIndex] ? (
            <Image
              src={images[selectedImageIndex].url}
              alt={images[selectedImageIndex].alt || title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="h-16 w-16" />
            </div>
          )}

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))
                }
                disabled={selectedImageIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    Math.min(images.length - 1, selectedImageIndex + 1),
                  )
                }
                disabled={selectedImageIndex === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Status badges */}
          <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex flex-wrap gap-2">
            {product.is_new && (
              <Badge variant="success" className="text-xs py-1 px-2">
                جدید
              </Badge>
            )}
            {product.is_bestseller && (
              <Badge variant="warning" className="text-xs py-1 px-2">
                پرفروش
              </Badge>
            )}
            {product.is_featured && (
              <Badge variant="info" className="text-xs py-1 px-2">
                ویژه
              </Badge>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 xs:w-20 xs:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === index
                    ? "border-primary"
                    : "border-gray-200"
                }`}
              >
                <Image
                  src={image?.url || ""}
                  alt={image?.alt || `${title} - تصویر ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const submitReview = async () => {
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      alert("لطفاً عنوان و متن نظر را وارد کنید");
      return;
    }

    setIsSubmittingReview(true);
    try {
      // TODO: Implement review submission API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      alert("نظر شما با موفقیت ثبت شد و پس از بررسی نمایش داده خواهد شد");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("خطا در ثبت نظر");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              بازگشت
            </button>
            <span>/</span>
            <span>محصولات</span>
            <span>/</span>
            <span>
              {ProductApiService.getProductCategoryLabel(
                product.category,
                locale,
              )}
            </span>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-32 xs:max-w-48">
              {title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Product Details */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Images */}
          <div className="lg:w-1/2">{renderProductImages()}</div>

          {/* Product Info */}
          <div className="lg:w-1/2 space-y-6">
            {/* Type and Category */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {ProductApiService.getProductTypeLabel(product.type, locale)}
              </span>
              <span>•</span>
              <span>
                {ProductApiService.getProductCategoryLabel(
                  product.category,
                  locale,
                )}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">
                {title}
              </h1>
              {(author || artist) && (
                <p className="text-lg text-gray-700">
                  {isRTL
                    ? product.type === "book"
                      ? "نویسنده: "
                      : "هنرمند: "
                    : "By: "}
                  <span className="font-medium text-primary">
                    {author || artist}
                  </span>
                </p>
              )}
            </div>

            {/* Rating and Reviews */}
            {product.rating.count > 0 && (
              <div className="flex flex-col xs:flex-row xs:items-center gap-3">
                <div className="flex items-center gap-2">
                  {renderStars(product.rating.average, "md")}
                  <span className="text-lg font-medium text-gray-900">
                    {product.rating.average.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-600">
                  ({product.rating.count} نظر مشتری)
                </span>
              </div>
            )}

            {/* Price */}
            {renderPrice()}

            {/* Availability Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {ProductApiService.isProductAvailable(product) ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700">موجود</p>
                    {product.stock_quantity !== undefined &&
                      product.stock_quantity <= 10 && (
                        <p className="text-sm text-orange-600">
                          تنها {product.stock_quantity} عدد در انبار باقی مانده
                        </p>
                      )}
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-700">ناموجود</p>
                    <p className="text-sm text-gray-600">
                      از طریق اعلان موجودی مطلع شوید
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Special Features */}
            {(product.is_digital || product.specifications?.features) && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">ویژگی‌های خاص:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.is_digital && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      <Download className="h-4 w-4" />
                      دانلود فوری
                    </div>
                  )}
                  {product.specifications?.features?.map(
                    (feature: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm"
                      >
                        <Zap className="h-4 w-4" />
                        {feature}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              {ProductApiService.isProductAvailable(product) &&
                !product.is_digital && (
                  <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-900">تعداد:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={
                          product.stock_quantity
                            ? quantity >= product.stock_quantity
                            : false
                        }
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

              <div className="flex flex-col xs:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={
                    !ProductApiService.isProductAvailable(product) ||
                    isAddingToCart
                  }
                  className="flex-1 h-12 text-base font-medium"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 ml-2" />
                      {product.is_digital
                        ? "خرید و دانلود"
                        : "افزودن به سبد خرید"}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className="h-12 px-4"
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>

                <Button variant="outline" className="h-12 px-4">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-600" />
                <span>ارسال رایگان</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <span>ضمانت اصالت</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-gray-600" />
                <span>۷ روز ضمانت بازگشت</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-600" />
                <span>کیفیت تضمینی</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="description" className="flex-shrink-0">
                توضیحات
              </TabsTrigger>
              <TabsTrigger value="specifications" className="flex-shrink-0">
                مشخصات
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-shrink-0">
                نظرات ({product.rating.count})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    {description ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: description.replace(/\n/g, "<br />"),
                        }}
                      />
                    ) : (
                      <p>توضیحات محصول در دسترس نیست.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {product.specifications ? (
                    <div className="space-y-6">
                      {product.specifications.dimensions && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">
                            ابعاد و اندازه
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            {product.specifications.dimensions.width && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">عرض:</span>
                                <span>
                                  {product.specifications.dimensions.width}
                                </span>
                              </div>
                            )}
                            {product.specifications.dimensions.height && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">ارتفاع:</span>
                                <span>
                                  {product.specifications.dimensions.height}
                                </span>
                              </div>
                            )}
                            {product.specifications.dimensions.depth && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">عمق:</span>
                                <span>
                                  {product.specifications.dimensions.depth}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {product.specifications.weight && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">
                            وزن
                          </h3>
                          <p className="text-gray-700">
                            {product.specifications.weight}
                          </p>
                        </div>
                      )}

                      {product.specifications.material && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">
                            مواد
                          </h3>
                          <p className="text-gray-700">
                            {product.specifications.material}
                          </p>
                        </div>
                      )}

                      {product.specifications.features &&
                        product.specifications.features.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">
                              ویژگی‌ها
                            </h3>
                            <ul className="space-y-2">
                              {product.specifications.features.map(
                                (feature: string, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2 text-gray-700"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    {feature}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                      {product.specifications.colors &&
                        product.specifications.colors.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">
                              رنگ‌های موجود
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {product.specifications.colors.map(
                                (color: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                  >
                                    {color}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Book-specific specifications */}
                      {product.type === "book" && (
                        <div className="space-y-4">
                          {product.isbn && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">شابک:</span>
                              <span>{product.isbn}</span>
                            </div>
                          )}
                          {product.publisher && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">ناشر:</span>
                              <span>
                                {isRTL
                                  ? product.publisher
                                  : product.publisher_en || product.publisher}
                              </span>
                            </div>
                          )}
                          {product.publication_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">سال انتشار:</span>
                              <span>
                                {new Date(
                                  product.publication_date,
                                ).getFullYear()}
                              </span>
                            </div>
                          )}
                          {product.language && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">زبان:</span>
                              <span>{product.language}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-600">
                      <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>مشخصات تفصیلی در دسترس نیست</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Reviews Summary */}
                {product.rating.count > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-1/3 text-center">
                          <div className="text-4xl font-bold text-gray-900 mb-2">
                            {product.rating.average.toFixed(1)}
                          </div>
                          {renderStars(product.rating.average, "lg")}
                          <p className="text-gray-600 mt-2">
                            از {product.rating.count} نظر
                          </p>
                        </div>
                        <div className="lg:w-2/3 space-y-3">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = Math.floor(Math.random() * 20); // Mock data
                            const percentage =
                              product.rating.count > 0
                                ? (count / product.rating.count) * 100
                                : 0;

                            return (
                              <div
                                key={star}
                                className="flex items-center gap-3"
                              >
                                <span className="text-sm w-8">
                                  {star} ستاره
                                </span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-yellow-400 transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-8">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Write Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>نظر شما درباره این محصول</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        امتیاز شما:
                      </label>
                      {renderStars(reviewRating, "md", true, setReviewRating)}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عنوان نظر:
                      </label>
                      <Input
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="عنوان نظر خود را وارد کنید..."
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        متن نظر:
                      </label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="نظر خود را در مورد این محصول بنویسید..."
                        rows={4}
                        className="w-full"
                      />
                    </div>

                    <Button
                      onClick={submitReview}
                      disabled={
                        isSubmittingReview ||
                        !reviewTitle.trim() ||
                        !reviewComment.trim()
                      }
                      className="w-full xs:w-auto"
                    >
                      {isSubmittingReview ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4 ml-2" />
                          ثبت نظر
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                <Card>
                  <CardHeader>
                    <CardTitle>نظرات مشتریان</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {product.rating.count > 0 ? (
                      <div className="space-y-6">
                        {/* Mock reviews */}
                        {Array.from({ length: showAllReviews ? 10 : 3 }).map(
                          (_, index) => (
                            <div
                              key={index}
                              className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                            >
                              <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      کاربر{" "}
                                      {(index + 1).toLocaleString("fa-IR")}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      {renderStars(5 - (index % 3))}
                                      <span className="text-xs text-gray-500">
                                        {new Date(
                                          Date.now() -
                                            index * 24 * 60 * 60 * 1000,
                                        ).toLocaleDateString("fa-IR")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900">
                                  محصول بسیار عالی و کیفیت مناسب
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  این محصول واقعاً کیفیت فوق‌العاده‌ای دارد و من
                                  کاملاً راضی از خرید خودم هستم. پیشنهاد می‌کنم
                                  حتماً تهیه کنید. ارسال هم سریع بود.
                                </p>
                              </div>

                              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                                  <ThumbsUp className="h-4 w-4" />
                                  مفید ({Math.floor(Math.random() * 10) + 1})
                                </button>
                                <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                                  <ThumbsDown className="h-4 w-4" />
                                  غیر مفید ({Math.floor(Math.random() * 3)})
                                </button>
                              </div>
                            </div>
                          ),
                        )}

                        {product.rating.count > 3 && (
                          <div className="text-center">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllReviews(!showAllReviews)}
                            >
                              {showAllReviews
                                ? "نمایش کمتر"
                                : `مشاهده ${product.rating.count - 3} نظر دیگر`}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>هنوز نظری ثبت نشده است</p>
                        <p className="text-sm">
                          اولین نفری باشید که نظر می‌دهید
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-6 w-6 text-primary" />
                  محصولات مرتبط
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {relatedProducts.slice(0, 8).map((relatedProduct) => (
                    <ProductCard
                      key={relatedProduct._id}
                      product={relatedProduct}
                      viewMode="grid"
                      locale={locale}
                    />
                  ))}
                </div>

                {relatedProducts.length > 8 && (
                  <div className="text-center mt-6">
                    <Button variant="outline">مشاهده محصولات بیشتر</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recently Viewed (Mock) */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-primary" />
                اخیراً مشاهده شده
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex overflow-x-auto gap-4 pb-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-32 xs:w-40">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      محصول شماره {(index + 1).toLocaleString("fa-IR")}
                    </h4>
                    <p className="text-xs xs:text-sm text-gray-600">
                      {ProductApiService.formatPrice(
                        Math.floor(Math.random() * 100000) + 50000,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
