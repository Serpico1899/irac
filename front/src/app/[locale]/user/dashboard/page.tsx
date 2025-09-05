"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/currency";

// Types
interface EnrolledCourse {
  _id: string;
  name: string;
  name_en?: string;
  slug: string;
  featured_image?: {
    url: string;
    alt?: string;
  };
  instructor: string;
  instructor_en?: string;
  progress_percentage: number;
  enrollment_date: string;
  completion_date?: string;
  certificate_issued?: boolean;
  last_accessed?: string;
}

interface Order {
  _id: string;
  order_number: string;
  items: {
    course_name: string;
    course_name_en?: string;
    price: number;
  }[];
  total_amount: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  created_at: string;
  payment_method?: string;
}

interface UserStats {
  total_courses: number;
  completed_courses: number;
  certificates_earned: number;
  total_hours: number;
  current_streak: number;
}

export default function UserDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const router = useRouter();
  const { cart } = useCart();

  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_courses: 0,
    completed_courses: 0,
    certificates_earned: 0,
    total_hours: 0,
    current_streak: 0,
  });

  const isRTL = locale === "fa";

  // Mock data - In real implementation, this would come from API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        setEnrolledCourses([
          {
            _id: "1",
            name: "معماری ایرانی کلاسیک",
            name_en: "Classical Iranian Architecture",
            slug: "classical-iranian-architecture",
            featured_image: {
              url: "/images/course-placeholder.jpg",
              alt: "Classical Iranian Architecture",
            },
            instructor: "دکتر احمد محمدی",
            instructor_en: "Dr. Ahmad Mohammadi",
            progress_percentage: 65,
            enrollment_date: "2024-01-15",
            last_accessed: "2024-01-20",
          },
          {
            _id: "2",
            name: "طراحی مساجد معاصر",
            name_en: "Contemporary Mosque Design",
            slug: "contemporary-mosque-design",
            featured_image: {
              url: "/images/course-placeholder.jpg",
              alt: "Contemporary Mosque Design",
            },
            instructor: "استاد مریم رضایی",
            instructor_en: "Prof. Maryam Rezaei",
            progress_percentage: 100,
            enrollment_date: "2024-01-01",
            completion_date: "2024-01-18",
            certificate_issued: true,
            last_accessed: "2024-01-18",
          },
        ]);

        setRecentOrders([
          {
            _id: "1",
            order_number: "ORD-2024-001",
            items: [
              {
                course_name: "معماری ایرانی کلاسیک",
                course_name_en: "Classical Iranian Architecture",
                price: 2500000,
              },
            ],
            total_amount: 2500000,
            status: "completed",
            created_at: "2024-01-15",
            payment_method: "credit_card",
          },
        ]);

        setUserStats({
          total_courses: 2,
          completed_courses: 1,
          certificates_earned: 1,
          total_hours: 24,
          current_streak: 5,
        });

        setLoading(false);
      }, 1000);
    };

    fetchUserData();
  }, []);

  // Helper functions
  const getLocalizedText = (fa: string, en?: string) => {
    return locale === "fa" ? fa : en || fa;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return locale === "fa"
      ? date.toLocaleDateString("fa-IR")
      : date.toLocaleDateString("en-US");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "refunded":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    if (locale === "fa") {
      switch (status) {
        case "completed":
          return "تکمیل شده";
        case "pending":
          return "در انتظار پرداخت";
        case "cancelled":
          return "لغو شده";
        case "refunded":
          return "بازگردانده شده";
        default:
          return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {locale === "fa" ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-background-primary border-b border-background-darkest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">
                {locale === "fa" ? "داشبورد کاربری" : "User Dashboard"}
              </h1>
              <p className="text-text-secondary mt-1">
                {locale === "fa"
                  ? "مدیریت دوره‌ها و پیشرفت تحصیلی خود"
                  : "Manage your courses and learning progress"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link
                href={`/${locale}/courses`}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                {locale === "fa" ? "مرور دوره‌ها" : "Browse Courses"}
              </Link>

              {cart.itemCount > 0 && (
                <div className="text-sm text-text-secondary">
                  {locale === "fa" ? "سبد خرید: " : "Cart: "}
                  <span className="font-semibold text-primary">
                    {cart.itemCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6 sticky top-8">
              <nav className="space-y-2">
                {[
                  {
                    id: "overview",
                    icon: "📊",
                    label: locale === "fa" ? "نمای کلی" : "Overview",
                  },
                  {
                    id: "courses",
                    icon: "📚",
                    label: locale === "fa" ? "دوره‌های من" : "My Courses",
                  },
                  {
                    id: "scoring",
                    icon: "🏆",
                    label: locale === "fa" ? "امتیازات" : "Points",
                    href: `/${locale}/user/scoring`,
                  },
                  {
                    id: "orders",
                    icon: "🛒",
                    label: locale === "fa" ? "سفارشات" : "Orders",
                  },
                  {
                    id: "certificates",
                    icon: "🏆",
                    label: locale === "fa" ? "گواهینامه‌ها" : "Certificates",
                  },
                  {
                    id: "settings",
                    icon: "⚙️",
                    label: locale === "fa" ? "تنظیمات" : "Settings",
                  },
                ].map((tab) => {
                  if (tab.href) {
                    return (
                      <Link
                        key={tab.id}
                        href={tab.href}
                        className="w-full text-right px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 rtl:space-x-reverse text-text-secondary hover:bg-background-primary hover:text-text"
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </Link>
                    );
                  } else {
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-right px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 rtl:space-x-reverse ${
                          activeTab === tab.id
                            ? "bg-primary text-white"
                            : "text-text-secondary hover:bg-background-primary hover:text-text"
                        }`}
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  }
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📚</div>
                      <div className="text-2xl font-bold text-text">
                        {userStats.total_courses}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {locale === "fa" ? "دوره ثبت‌نامی" : "Enrolled Courses"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <div className="text-2xl font-bold text-green-600">
                        {userStats.completed_courses}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {locale === "fa" ? "دوره تکمیل شده" : "Completed"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="text-2xl font-bold text-accent">
                        {userStats.certificates_earned}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {locale === "fa" ? "گواهینامه" : "Certificates"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                    <Link
                      href={`/${locale}/user/scoring`}
                      className="block hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">⭐</div>
                        <div className="text-2xl font-bold text-blue-600">
                          2,750
                        </div>
                        <div className="text-sm text-text-secondary">
                          {locale === "fa" ? "امتیاز" : "Points"}
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">⏱️</div>
                      <div className="text-2xl font-bold text-text">
                        {userStats.total_hours}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {locale === "fa" ? "ساعت یادگیری" : "Learning Hours"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Courses Progress */}
                <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                  <h2 className="text-xl font-semibold text-text mb-4">
                    {locale === "fa"
                      ? "دوره‌های در حال گذراندن"
                      : "Courses in Progress"}
                  </h2>

                  {enrolledCourses.filter(
                    (course) => course.progress_percentage < 100,
                  ).length > 0 ? (
                    <div className="space-y-4">
                      {enrolledCourses
                        .filter((course) => course.progress_percentage < 100)
                        .map((course) => (
                          <div
                            key={course._id}
                            className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-background-darkest rounded-lg"
                          >
                            <div className="flex-shrink-0">
                              {course.featured_image?.url ? (
                                <Image
                                  src={course.featured_image.url}
                                  alt={course.featured_image.alt || course.name}
                                  width={60}
                                  height={60}
                                  className="w-15 h-15 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-15 h-15 bg-background-secondary rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">📚</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-text">
                                {getLocalizedText(course.name, course.name_en)}
                              </h3>
                              <p className="text-sm text-text-secondary">
                                {getLocalizedText(
                                  course.instructor,
                                  course.instructor_en,
                                )}
                              </p>

                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-text-secondary">
                                    {locale === "fa" ? "پیشرفت" : "Progress"}
                                  </span>
                                  <span className="font-medium text-text">
                                    {course.progress_percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-background-secondary rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${course.progress_percentage}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <Link
                                href={`/${locale}/courses/${course.slug}`}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                              >
                                {locale === "fa" ? "ادامه" : "Continue"}
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-text-secondary">
                        {locale === "fa"
                          ? "هیچ دوره‌ای در حال گذراندن ندارید"
                          : "No courses in progress"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "courses" && (
              <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  {locale === "fa" ? "همه دوره‌های من" : "All My Courses"}
                </h2>

                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course._id}
                      className="border border-background-darkest rounded-lg p-6"
                    >
                      <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        <div className="flex-shrink-0">
                          {course.featured_image?.url ? (
                            <Image
                              src={course.featured_image.url}
                              alt={course.featured_image.alt || course.name}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-background-secondary rounded-lg flex items-center justify-center">
                              <span className="text-3xl">📚</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-text">
                                {getLocalizedText(course.name, course.name_en)}
                              </h3>
                              <p className="text-text-secondary">
                                {getLocalizedText(
                                  course.instructor,
                                  course.instructor_en,
                                )}
                              </p>
                              <p className="text-sm text-text-light mt-1">
                                {locale === "fa"
                                  ? "تاریخ ثبت‌نام: "
                                  : "Enrolled: "}
                                {formatDate(course.enrollment_date)}
                              </p>
                            </div>

                            <div className="text-right">
                              {course.completion_date ? (
                                <div className="mb-2">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                    ✅{" "}
                                    {locale === "fa"
                                      ? "تکمیل شده"
                                      : "Completed"}
                                  </span>
                                  {course.certificate_issued && (
                                    <div className="mt-2">
                                      <button className="text-sm text-primary hover:text-primary-dark">
                                        {locale === "fa"
                                          ? "دانلود گواهینامه"
                                          : "Download Certificate"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-right">
                                  <div className="text-sm text-text-secondary mb-1">
                                    {course.progress_percentage}%{" "}
                                    {locale === "fa" ? "تکمیل" : "Complete"}
                                  </div>
                                  <div className="w-32 bg-background-secondary rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full"
                                      style={{
                                        width: `${course.progress_percentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-text-light">
                              {course.last_accessed && (
                                <>
                                  {locale === "fa"
                                    ? "آخرین دسترسی: "
                                    : "Last accessed: "}
                                  {formatDate(course.last_accessed)}
                                </>
                              )}
                            </div>

                            <Link
                              href={`/${locale}/courses/${course.slug}`}
                              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                            >
                              {course.progress_percentage === 100
                                ? locale === "fa"
                                  ? "مرور"
                                  : "Review"
                                : locale === "fa"
                                  ? "ادامه"
                                  : "Continue"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  {locale === "fa" ? "تاریخچه سفارشات" : "Order History"}
                </h2>

                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-background-darkest rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-text">
                            {locale === "fa" ? "سفارش " : "Order "}#
                            {order.order_number}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {formatDate(order.created_at)}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-text">
                              {getLocalizedText(
                                item.course_name,
                                item.course_name_en,
                              )}
                            </span>
                            <span className="font-semibold text-text">
                              {formatPrice(item.price, locale)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-background-darkest pt-4 flex justify-between items-center">
                        <span className="font-semibold text-text">
                          {locale === "fa" ? "مجموع:" : "Total:"}
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(order.total_amount, locale)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  {locale === "fa" ? "گواهینامه‌های من" : "My Certificates"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses
                    .filter((course) => course.certificate_issued)
                    .map((course) => (
                      <div
                        key={course._id}
                        className="border border-background-darkest rounded-lg p-6 text-center"
                      >
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="font-semibold text-text mb-2">
                          {getLocalizedText(course.name, course.name_en)}
                        </h3>
                        <p className="text-sm text-text-secondary mb-4">
                          {locale === "fa" ? "تاریخ تکمیل: " : "Completed on: "}
                          {course.completion_date &&
                            formatDate(course.completion_date)}
                        </p>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                          {locale === "fa"
                            ? "دانلود گواهینامه"
                            : "Download Certificate"}
                        </button>
                      </div>
                    ))}
                </div>

                {enrolledCourses.filter((course) => course.certificate_issued)
                  .length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <p className="text-text-secondary">
                      {locale === "fa"
                        ? "هنوز گواهینامه‌ای دریافت نکرده‌اید"
                        : "No certificates earned yet"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  {locale === "fa" ? "تنظیمات حساب" : "Account Settings"}
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-text mb-4">
                      {locale === "fa"
                        ? "اطلاعات شخصی"
                        : "Personal Information"}
                    </h3>
                    <Link
                      href={`/${locale}/user/profile`}
                      className="block p-4 border border-background-darkest rounded-lg hover:bg-background-primary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-text">
                            {locale === "fa"
                              ? "ویرایش پروفایل"
                              : "Edit Profile"}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {locale === "fa"
                              ? "نام، ایمیل و اطلاعات تماس"
                              : "Name, email, and contact information"}
                          </p>
                        </div>
                        <span className="text-text-secondary">→</span>
                      </div>
                    </Link>
                  </div>

                  <div>
                    <h3 className="font-semibold text-text mb-4">
                      {locale === "fa" ? "تنظیمات حساب" : "Account Settings"}
                    </h3>
                    <div className="space-y-2">
                      <Link
                        href={`/${locale}/user/change-password`}
                        className="block p-4 border border-background-darkest rounded-lg hover:bg-background-primary transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-text">
                            {locale === "fa"
                              ? "تغییر رمز عبور"
                              : "Change Password"}
                          </p>
                          <span className="text-text-secondary">→</span>
                        </div>
                      </Link>

                      <Link
                        href={`/${locale}/user/notifications`}
                        className="block p-4 border border-background-darkest rounded-lg hover:bg-background-primary transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-text">
                            {locale === "fa"
                              ? "تنظیمات اطلاع‌رسانی"
                              : "Notification Settings"}
                          </p>
                          <span className="text-text-secondary">→</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
