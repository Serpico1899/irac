"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ContentCard from "@/components/organisms/ContentCard";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { getCourse } from "@/app/actions/course/getCourse";
import { formatPrice } from "@/utils/currency";
import { useCart } from "@/context/CartContext";

export const dynamic = "force-dynamic";

interface CourseDetails {
  _id: string;
  slug?: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  short_description?: string;
  short_description_en?: string;
  price: number;
  original_price?: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  type: "Course" | "Workshop" | "Bootcamp" | "Seminar";
  average_rating: number;
  total_students: number;
  total_reviews: number;
  duration_weeks?: number;
  duration_hours?: number;
  max_students?: number;
  start_date?: string;
  end_date?: string;
  registration_deadline?: string;
  curriculum?: string;
  prerequisites?: string;
  learning_outcomes?: string;
  instructor_name?: string;
  instructor_bio?: string;
  instructor_bio_en?: string;
  is_free: boolean;
  is_workshop: boolean;
  is_online: boolean;
  meeting_link?: string;
  workshop_location?: string;
  featured_image?: {
    details?: {
      url: string;
      alt?: string;
    };
  };
  gallery?: {
    details?: Array<{
      _id: string;
      url: string;
      alt?: string;
    }>;
  };
  category?: {
    details?: {
      _id: string;
      name: string;
    };
  };
  tags?: {
    details?: Array<{
      _id: string;
      name: string;
    }>;
  };
  instructor?: {
    _id: string;
    first_name: string;
    last_name: string;
    summary?: string;
    avatar?: {
      url: string;
    };
  };
}

interface EnrollmentStatus {
  is_enrolled: boolean;
  enrollment_date?: string;
  progress_percentage?: number;
  status?: string;
}

interface CoursePageResponse {
  course: CourseDetails;
  enrollment_status?: EnrollmentStatus;
  related_courses?: CourseDetails[];
  instructor_courses?: CourseDetails[];
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = use(params);
  const router = useRouter();

  // State management
  const [mounted, setMounted] = useState(false);
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] =
    useState<EnrollmentStatus | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<CourseDetails[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<CourseDetails[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Cart functionality
  const { addToCart } = useCart();

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Only call server action in client environment
        const response =
          typeof window !== "undefined"
            ? await getCourse({
                slug,
                populate: [
                  "category",
                  "tags",
                  "featured_image",
                  "gallery",
                  "instructor",
                  "related_courses",
                ],
              })
            : { success: false, data: null, message: "Course not found" };

        if (response.success && response.data) {
          const data = response.data as CoursePageResponse;
          setCourse(data.course);
          setEnrollmentStatus(data.enrollment_status || null);
          setRelatedCourses(data.related_courses || []);
          setInstructorCourses(data.instructor_courses || []);
        } else {
          setError(response.message || "خطا در دریافت اطلاعات دوره");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("خطا در برقراری ارتباط با سرور");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [slug]);

  // Handle enrollment
  const handleEnrollment = async () => {
    if (!course || enrolling) return;

    setEnrolling(true);
    try {
      if (course.is_free) {
        // For free courses, redirect to login/enrollment
        router.push(
          `/${locale}/login?redirect=${encodeURIComponent(`/courses/${slug}`)}`,
        );
      } else {
        // For paid courses, add to cart
        handleAddToCart();
      }
    } catch (err) {
      console.error("Error during enrollment:", err);
    } finally {
      setEnrolling(false);
    }
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    if (!course) return;

    const { title } = getLocalizedContent(course);
    const instructor = course.instructor
      ? `${course.instructor.first_name} ${course.instructor.last_name}`
      : "Unknown";
    const instructorEn = instructor;

    addToCart({
      id: course._id,
      type: course.type === "Course" ? "course" : "workshop",
      name: course.name,
      name_en: course.name_en,
      slug: course.slug || course._id,
      price: course.price,
      discounted_price:
        course.original_price && course.original_price > course.price
          ? course.price
          : undefined,
      featured_image: course.featured_image?.details,
      instructor: instructor,
      instructor_en: instructorEn,
      duration: course.duration_hours,
      level: course.level,
    });

    // Show success message or notification
    // You could add a toast notification here
  };

  // Get localized content
  const getLocalizedContent = (course: CourseDetails) => {
    const title = locale === "fa" ? course.name : course.name_en || course.name;
    const description =
      locale === "fa"
        ? course.description
        : course.description_en || course.description;
    const shortDescription =
      locale === "fa"
        ? course.short_description || course.description
        : course.short_description_en ||
          course.description_en ||
          course.short_description ||
          course.description;
    const instructorBio =
      locale === "fa"
        ? course.instructor_bio || course.instructor?.summary
        : course.instructor_bio_en ||
          course.instructor_bio ||
          course.instructor?.summary;

    return { title, description, shortDescription, instructorBio };
  };

  // Get level display text
  const getLevelText = (level: string) => {
    if (locale === "fa") {
      switch (level) {
        case "Beginner":
          return "مقدماتی";
        case "Intermediate":
          return "متوسط";
        case "Advanced":
          return "پیشرفته";
        default:
          return level;
      }
    }
    return level;
  };

  // Get type display text
  const getTypeText = (type: string) => {
    if (locale === "fa") {
      switch (type) {
        case "Course":
          return "دوره";
        case "Workshop":
          return "کارگاه";
        case "Bootcamp":
          return "بوتکمپ";
        case "Seminar":
          return "سمینار";
        default:
          return type;
      }
    }
    return type;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return locale === "fa"
      ? date.toLocaleDateString("fa-IR")
      : date.toLocaleDateString("en-US");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-text-secondary">
            {locale === "fa" ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-text mb-4">
            {locale === "fa" ? "دوره یافت نشد" : "Course Not Found"}
          </h1>
          <p className="text-text-secondary mb-6">
            {error ||
              (locale === "fa"
                ? "دوره مورد نظر یافت نشد یا ممکن است حذف شده باشد"
                : "The course you're looking for doesn't exist or may have been removed")}
          </p>
          <Link
            href={`/${locale}/courses`}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {locale === "fa" ? "بازگشت به دوره‌ها" : "Back to Courses"}
          </Link>
        </div>
      </div>
    );
  }

  const { title, description, shortDescription, instructorBio } =
    getLocalizedContent(course);
  const images = course.gallery?.details || [];
  const mainImage = course.featured_image?.details || images[0];

  return (
    <div
      className="min-h-screen bg-background"
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      {/* Hero Section */}
      <div className="bg-background-primary border-b border-background-darkest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">
            {/* Course Image */}
            <div className="mb-8 lg:mb-0">
              <div className="relative">
                <div className="aspect-video bg-background-secondary rounded-[25px] overflow-hidden">
                  {mainImage ? (
                    <Image
                      src={mainImage.url}
                      alt={mainImage.alt || title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-light">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📚</div>
                        <p>{locale === "fa" ? "تصویر دوره" : "Course Image"}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gallery Thumbnails */}
                {images.length > 1 && (
                  <div className="flex space-x-2 mt-4 overflow-x-auto">
                    {images.slice(0, 5).map((image, index) => (
                      <button
                        key={image._id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index
                            ? "border-primary"
                            : "border-background-darkest hover:border-primary/50"
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || `${title} ${index + 1}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div>
              {/* Course Type & Category */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {getTypeText(course.type)}
                </span>
                {course.category?.details && (
                  <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">
                    {course.category.details.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
                {title}
              </h1>

              {/* Short Description */}
              <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                {shortDescription}
              </p>

              {/* Course Meta */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="block text-sm text-text-light">
                    {locale === "fa" ? "سطح" : "Level"}
                  </span>
                  <span className="text-text font-semibold">
                    {getLevelText(course.level)}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-text-light">
                    {locale === "fa" ? "مدت دوره" : "Duration"}
                  </span>
                  <span className="text-text font-semibold">
                    {course.duration_weeks
                      ? `${course.duration_weeks} ${locale === "fa" ? "هفته" : "weeks"}`
                      : course.duration_hours
                        ? `${course.duration_hours} ${locale === "fa" ? "ساعت" : "hours"}`
                        : locale === "fa"
                          ? "متغیر"
                          : "Variable"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-text-light">
                    {locale === "fa" ? "دانشجویان" : "Students"}
                  </span>
                  <span className="text-text font-semibold">
                    {course.total_students.toLocaleString(
                      locale === "fa" ? "fa-IR" : "en-US",
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-text-light">
                    {locale === "fa" ? "امتیاز" : "Rating"}
                  </span>
                  <div className="flex items-center">
                    <span className="text-text font-semibold mr-1">
                      {course.average_rating.toFixed(1)}
                    </span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.floor(course.average_rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-text-light text-sm mr-1">
                      ({course.total_reviews})
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                {course.is_free ? (
                  <div className="text-3xl font-bold text-green-600">
                    {locale === "fa" ? "رایگان" : "Free"}
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <div className="text-3xl font-bold text-text">
                      {formatPrice(course.price, locale)}
                    </div>
                    {course.original_price &&
                      course.original_price > course.price && (
                        <div className="text-lg text-text-light line-through mr-3">
                          {formatPrice(course.original_price, locale)}
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Enrollment Button */}
              <div className="space-y-4">
                {enrollmentStatus?.is_enrolled ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-green-600 text-xl mr-3">✓</div>
                      <div>
                        <p className="text-green-800 font-semibold">
                          {locale === "fa"
                            ? "شما در این دوره ثبت‌نام کرده‌اید"
                            : "You are enrolled in this course"}
                        </p>
                        {enrollmentStatus.progress_percentage !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-sm text-green-700 mb-1">
                              <span>
                                {locale === "fa"
                                  ? "پیشرفت دوره"
                                  : "Course Progress"}
                              </span>
                              <span>
                                {enrollmentStatus.progress_percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${enrollmentStatus.progress_percentage}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.is_free ? (
                      <button
                        onClick={handleEnrollment}
                        disabled={enrolling}
                        className="w-full py-4 px-6 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {enrolling ? (
                          <>
                            <LoadingSpinner />
                            <span className="mr-2">
                              {locale === "fa"
                                ? "در حال پردازش..."
                                : "Processing..."}
                            </span>
                          </>
                        ) : locale === "fa" ? (
                          "ثبت‌نام رایگان"
                        ) : (
                          "Enroll for Free"
                        )}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleAddToCart}
                          disabled={enrolling}
                          className="w-full py-4 px-6 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {enrolling ? (
                            <>
                              <LoadingSpinner />
                              <span className="mr-2">
                                {locale === "fa"
                                  ? "در حال اضافه کردن..."
                                  : "Adding..."}
                              </span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                                />
                              </svg>
                              {locale === "fa"
                                ? "افزودن به سبد خرید"
                                : "Add to Cart"}
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleEnrollment}
                          disabled={enrolling}
                          className="w-full py-3 px-6 border-2 border-primary text-primary text-lg font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {locale === "fa" ? "خرید فوری" : "Buy Now"}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Additional Course Info */}
                <div className="text-sm text-text-light space-y-1">
                  {course.registration_deadline && (
                    <p>
                      {locale === "fa"
                        ? "آخرین مهلت ثبت‌نام: "
                        : "Registration deadline: "}
                      {formatDate(course.registration_deadline)}
                    </p>
                  )}
                  {course.start_date && (
                    <p>
                      {locale === "fa" ? "تاریخ شروع: " : "Start date: "}
                      {formatDate(course.start_date)}
                    </p>
                  )}
                  {course.max_students && (
                    <p>
                      {locale === "fa"
                        ? "حداکثر ظرفیت: "
                        : "Maximum capacity: "}
                      {course.max_students.toLocaleString(
                        locale === "fa" ? "fa-IR" : "en-US",
                      )}
                      {locale === "fa" ? " نفر" : " students"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Course Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-text mb-4">
                {locale === "fa" ? "توضیحات دوره" : "Course Description"}
              </h2>
              <div className="prose prose-lg max-w-none">
                <div
                  className={`text-text-secondary leading-relaxed ${
                    !showFullDescription ? "line-clamp-6" : ""
                  }`}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                {description.length > 500 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-4 text-primary hover:text-primary-dark font-medium"
                  >
                    {showFullDescription
                      ? locale === "fa"
                        ? "کمتر نمایش بده"
                        : "Show less"
                      : locale === "fa"
                        ? "بیشتر نمایش بده"
                        : "Show more"}
                  </button>
                )}
              </div>
            </section>

            {/* Curriculum */}
            {course.curriculum && (
              <section>
                <h2 className="text-2xl font-bold text-text mb-4">
                  {locale === "fa" ? "سرفصل دوره" : "Course Curriculum"}
                </h2>
                <div
                  className="prose prose-lg max-w-none text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: course.curriculum }}
                />
              </section>
            )}

            {/* Learning Outcomes */}
            {course.learning_outcomes && (
              <section>
                <h2 className="text-2xl font-bold text-text mb-4">
                  {locale === "fa" ? "اهداف یادگیری" : "Learning Outcomes"}
                </h2>
                <div
                  className="prose prose-lg max-w-none text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: course.learning_outcomes }}
                />
              </section>
            )}

            {/* Prerequisites */}
            {course.prerequisites && (
              <section>
                <h2 className="text-2xl font-bold text-text mb-4">
                  {locale === "fa" ? "پیش‌نیازها" : "Prerequisites"}
                </h2>
                <div
                  className="prose prose-lg max-w-none text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: course.prerequisites }}
                />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="mt-12 lg:mt-0 space-y-8">
            {/* Instructor Info */}
            {course.instructor && (
              <section className="bg-white rounded-[25px] shadow-sm border border-background-darkest p-6">
                <h3 className="text-xl font-bold text-text mb-4">
                  {locale === "fa" ? "مدرس دوره" : "Course Instructor"}
                </h3>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {course.instructor.avatar ? (
                      <Image
                        src={course.instructor.avatar.url}
                        alt={`${course.instructor.first_name} ${course.instructor.last_name}`}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text">
                      {course.instructor.first_name}{" "}
                      {course.instructor.last_name}
                    </h4>
                    {instructorBio && (
                      <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                        {instructorBio}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Course Tags */}
            {course.tags?.details && course.tags.details.length > 0 && (
              <section className="bg-white rounded-[25px] shadow-sm border border-background-darkest p-6">
                <h3 className="text-xl font-bold text-text mb-4">
                  {locale === "fa" ? "موضوعات" : "Topics"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.details.map((tag) => (
                    <span
                      key={tag._id}
                      className="px-3 py-1 bg-background-primary text-text-secondary text-sm rounded-full"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Instructor's Other Courses */}
        {instructorCourses.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-text mb-8">
              {locale === "fa"
                ? "سایر دوره‌های مدرس"
                : "Other Courses by Instructor"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {instructorCourses.map((relatedCourse) => {
                const { title: relatedTitle } =
                  getLocalizedContent(relatedCourse);
                return (
                  <ContentCard
                    key={relatedCourse._id}
                    href={`/${locale}/courses/${relatedCourse.slug || relatedCourse._id}`}
                    title={relatedTitle}
                    imageUrl={relatedCourse.featured_image?.details?.url}
                    price={relatedCourse.price.toString()}
                    level={getLevelText(relatedCourse.level)}
                    rating={relatedCourse.average_rating}
                    reviews={relatedCourse.total_reviews}
                    locale={locale}
                    variant="light"
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-text mb-8">
              {locale === "fa" ? "دوره‌های مرتبط" : "Related Courses"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCourses.map((relatedCourse) => {
                const { title: relatedTitle } =
                  getLocalizedContent(relatedCourse);
                return (
                  <ContentCard
                    key={relatedCourse._id}
                    href={`/${locale}/courses/${relatedCourse.slug || relatedCourse._id}`}
                    title={relatedTitle}
                    imageUrl={relatedCourse.featured_image?.details?.url}
                    price={relatedCourse.price.toString()}
                    level={getLevelText(relatedCourse.level)}
                    rating={relatedCourse.average_rating}
                    reviews={relatedCourse.total_reviews}
                    locale={locale}
                    variant="light"
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
