"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils/currency";

// Types
interface OrderItem {
  id: string;
  type: "course" | "workshop";
  name: string;
  name_en?: string;
  slug: string;
  price: number;
  discounted_price?: number;
  featured_image?: {
    url: string;
    alt?: string;
  };
  instructor?: string;
  instructor_en?: string;
  quantity: number;
}

interface OrderDetails {
  id: string;
  status: "pending" | "confirmed" | "processing" | "completed";
  items: OrderItem[];
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  payment_method: string;
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
  estimated_delivery?: string;
}

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = use(params);
  const isRTL = locale === "fa";

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock order data - In real implementation, this would come from API
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock order data
        const mockOrder: OrderDetails = {
          id: orderId,
          status: "confirmed",
          items: [
            {
              id: "1",
              type: "course",
              name: "مبانی معماری اسلامی",
              name_en: "Fundamentals of Islamic Architecture",
              slug: "fundamentals-islamic-architecture",
              price: 2500000,
              discounted_price: 2000000,
              instructor: "دکتر احمد محمدی",
              instructor_en: "Dr. Ahmad Mohammadi",
              quantity: 1,
              featured_image: {
                url: "/images/courses/islamic-architecture.jpg",
                alt: "Islamic Architecture Course",
              },
            },
            {
              id: "2",
              type: "workshop",
              name: "کارگاه تزئینات معماری",
              name_en: "Architectural Decoration Workshop",
              slug: "architectural-decoration-workshop",
              price: 1200000,
              instructor: "استاد مریم رضایی",
              instructor_en: "Prof. Maryam Rezaei",
              quantity: 1,
              featured_image: {
                url: "/images/workshops/decoration.jpg",
                alt: "Decoration Workshop",
              },
            },
          ],
          billing: {
            first_name: "علی",
            last_name: "محمدی",
            email: "ali.mohammadi@example.com",
            phone: "09123456789",
            address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
            city: "تهران",
            postal_code: "1234567890",
            country: "ایران",
          },
          payment_method: "zarinpal",
          subtotal: 3200000,
          tax: 288000,
          total: 3488000,
          created_at: new Date().toISOString(),
          estimated_delivery: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        };

        setOrder(mockOrder);
      } catch (err) {
        setError(
          isRTL
            ? "خطا در بارگیری اطلاعات سفارش"
            : "Error loading order details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isRTL]);

  // Payment method display names
  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, { fa: string; en: string }> = {
      zarinpal: { fa: "زرین‌پال", en: "ZarinPal" },
      bank_transfer: { fa: "انتقال بانکی", en: "Bank Transfer" },
      wallet: { fa: "کیف پول دیجیتال", en: "Digital Wallet" },
    };
    return isRTL
      ? methods[method]?.fa || method
      : methods[method]?.en || method;
  };

  // Status display
  const getStatusDisplay = (status: string) => {
    const statuses: Record<string, { fa: string; en: string; color: string }> =
      {
        pending: {
          fa: "در انتظار",
          en: "Pending",
          color: "bg-yellow-100 text-yellow-800",
        },
        confirmed: {
          fa: "تایید شده",
          en: "Confirmed",
          color: "bg-green-100 text-green-800",
        },
        processing: {
          fa: "در حال پردازش",
          en: "Processing",
          color: "bg-blue-100 text-blue-800",
        },
        completed: {
          fa: "تکمیل شده",
          en: "Completed",
          color: "bg-green-100 text-green-800",
        },
      };
    return (
      statuses[status] || {
        fa: status,
        en: status,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#168c95] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isRTL ? "در حال بارگیری..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <div className="mb-8">
            <svg
              className="w-24 h-24 text-red-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {isRTL ? "سفارش یافت نشد" : "Order Not Found"}
          </h1>
          <p className="text-gray-600 mb-8">
            {error ||
              (isRTL
                ? "سفارش مورد نظر شما یافت نشد"
                : "The order you're looking for could not be found")}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center px-6 py-3 bg-[#168c95] text-white rounded-lg font-medium hover:bg-[#147a82] transition-colors"
          >
            {isRTL ? "بازگشت به صفحه اصلی" : "Return to Homepage"}
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(order.status);

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isRTL ? "سفارش شما ثبت شد!" : "Order Confirmed!"}
          </h1>
          <p className="text-xl text-white/90 mb-6">
            {isRTL ? "متشکریم از خرید شما" : "Thank you for your purchase"}
          </p>
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
            <span className="text-white/80 me-2">
              {isRTL ? "شماره سفارش:" : "Order Number:"}
            </span>
            <span className="font-mono font-bold text-white">#{order.id}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {isRTL ? "وضعیت سفارش" : "Order Status"}
                </h2>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}
                >
                  {isRTL ? statusInfo.fa : statusInfo.en}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {isRTL ? "تاریخ ثبت سفارش" : "Order Date"}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(order.created_at).toLocaleDateString(
                      locale === "fa" ? "fa-IR" : "en-US",
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {isRTL ? "روش پرداخت" : "Payment Method"}
                  </h3>
                  <p className="text-gray-600">
                    {getPaymentMethodName(order.payment_method)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {isRTL ? "موارد سفارش" : "Order Items"}
              </h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                      {item.featured_image?.url ? (
                        <Image
                          src={item.featured_image.url}
                          alt={item.featured_image.alt || item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {isRTL ? item.name : item.name_en || item.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {isRTL
                          ? item.instructor
                          : item.instructor_en || item.instructor}
                      </p>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 me-2">
                          {isRTL ? "نوع:" : "Type:"}
                        </span>
                        <span className="text-sm font-medium text-[#168c95]">
                          {isRTL
                            ? item.type === "course"
                              ? "دوره"
                              : "کارگاه"
                            : item.type === "course"
                              ? "Course"
                              : "Workshop"}
                        </span>
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="font-semibold text-gray-800">
                        {formatPrice(
                          item.discounted_price || item.price,
                          locale,
                        )}
                      </div>
                      {item.discounted_price &&
                        item.discounted_price < item.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(item.price, locale)}
                          </div>
                        )}
                      <div className="text-sm text-gray-600 mt-1">
                        {isRTL ? "تعداد:" : "Qty:"} {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {isRTL ? "اطلاعات صورتحساب" : "Billing Information"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {isRTL ? "نام کامل" : "Full Name"}
                  </h3>
                  <p className="text-gray-600">
                    {order.billing.first_name} {order.billing.last_name}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {isRTL ? "ایمیل" : "Email"}
                  </h3>
                  <p className="text-gray-600">{order.billing.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {isRTL ? "تلفن" : "Phone"}
                  </h3>
                  <p className="text-gray-600">{order.billing.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {isRTL ? "شهر" : "City"}
                  </h3>
                  <p className="text-gray-600">{order.billing.city}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {isRTL ? "آدرس" : "Address"}
                  </h3>
                  <p className="text-gray-600">{order.billing.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Next Steps */}
          <div className="lg:col-span-1 space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {isRTL ? "خلاصه سفارش" : "Order Summary"}
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "جمع کل:" : "Subtotal:"}</span>
                  <span>{formatPrice(order.subtotal, locale)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "مالیات:" : "Tax:"}</span>
                  <span>{formatPrice(order.tax, locale)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>{isRTL ? "مجموع:" : "Total:"}</span>
                    <span className="text-[#168c95]">
                      {formatPrice(order.total, locale)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {isRTL ? "مراحل بعدی" : "Next Steps"}
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-[#168c95] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {isRTL ? "تایید ایمیل" : "Email Confirmation"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {isRTL
                        ? "ایمیل تایید سفارش به آدرس شما ارسال شده است"
                        : "Order confirmation email has been sent to your address"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-[#168c95] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {isRTL ? "دسترسی به دوره‌ها" : "Course Access"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {isRTL
                        ? "ظرف ۲۴ ساعت دسترسی به دوره‌ها فعال خواهد شد"
                        : "Course access will be activated within 24 hours"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-[#168c95] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {isRTL ? "شروع یادگیری" : "Start Learning"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {isRTL
                        ? "از طریق داشبورد کاربری دوره‌ها را مطالعه کنید"
                        : "Access your courses through the user dashboard"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                href={`/${locale}/user/dashboard`}
                className="w-full bg-[#168c95] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#147a82] transition-colors text-center block"
              >
                {isRTL ? "مشاهده داشبورد" : "View Dashboard"}
              </Link>

              <Link
                href={`/${locale}/courses`}
                className="w-full border-2 border-[#168c95] text-[#168c95] py-3 px-6 rounded-lg font-medium hover:bg-[#168c95] hover:text-white transition-colors text-center block"
              >
                {isRTL ? "ادامه خرید" : "Continue Shopping"}
              </Link>

              <Link
                href={`/${locale}/contact`}
                className="w-full text-gray-600 hover:text-[#168c95] py-3 px-6 rounded-lg font-medium transition-colors text-center block border border-gray-300 hover:border-[#168c95]"
              >
                {isRTL ? "تماس با پشتیبانی" : "Contact Support"}
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {isRTL ? "اطلاعات مهم" : "Important Information"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 text-[#cea87a] me-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {isRTL ? "دسترسی به دوره‌ها" : "Course Access"}
              </h3>
              <p className="text-gray-600 text-sm">
                {isRTL
                  ? "پس از تایید پرداخت، لینک دسترسی به دوره‌ها به ایمیل شما ارسال خواهد شد. همچنین می‌توانید از طریق داشبورد کاربری به آنها دسترسی پیدا کنید."
                  : "After payment confirmation, course access links will be sent to your email. You can also access them through your user dashboard."}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 text-[#cea87a] me-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
                {isRTL ? "پشتیبانی" : "Support"}
              </h3>
              <p className="text-gray-600 text-sm">
                {isRTL
                  ? "در صورت بروز هر گونه مشکل یا سوال، می‌توانید با تیم پشتیبانی ما تماس بگیرید. ما آماده کمک به شما هستیم."
                  : "If you encounter any issues or have questions, please contact our support team. We're here to help you."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
