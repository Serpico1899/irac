"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import ContentCard from "@/components/organisms/ContentCard";
import { formatPrice } from "@/utils/currency";

interface CourseData {
  course: {
    _id: string;
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
    duration_hours?: number;
    duration_weeks?: number;
    featured_image?: {
      details?: {
        url: string;
        alt?: string;
      };
    };
    gallery?: {
      details?: Array<{
        url: string;
        alt?: string;
      }>;
    };
    category?: {
      details?: {
        _id: string;
        name: string;
        name_en?: string;
      };
    };
    tags?: {
      details?: Array<{
        _id: string;
        name: string;
        name_en?: string;
      }>;
    };
    instructor?: {
      details?: {
        _id: string;
        first_name: string;
        last_name: string;
        bio?: string;
        bio_en?: string;
        profile_image?: {
          details?: {
            url: string;
            alt?: string;
          };
        };
      };
    };
    slug?: string;
    is_free: boolean;
    is_online: boolean;
    start_date?: string;
    end_date?: string;
    enrollment_deadline?: string;
    max_students?: number;
    current_students?: number;
    syllabus?: Array<{
      title: string;
      title_en?: string;
      description?: string;
      description_en?: string;
      duration?: number;
    }>;
    requirements?: Array<{
      title: string;
      title_en?: string;
    }>;
    what_you_learn?: Array<{
      title: string;
      title_en?: string;
    }>;
    instructor_name?: string;
    status: string;
  };
  related_courses?: Array<{
    _id: string;
    name: string;
    name_en?: string;
    slug?: string;
    price: number;
    featured_image?: {
      details?: {
        url: string;
        alt?: string;
      };
    };
    average_rating: number;
    total_students: number;
  }>;
  reviews?: Array<{
    _id: string;
    rating: number;
    comment?: string;
    user_name: string;
    created_at: string;
  }>;
}

interface CourseDetailPageClientProps {
  locale: string;
  initialData: CourseData;
}

export default function CourseDetailPageClient({
  locale,
  initialData,
}: CourseDetailPageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { course, related_courses, reviews } = initialData;
  const isRTL = locale === 'fa';

  // Handle enrollment
  const handleEnrollment = async () => {
    setEnrollmentLoading(true);
    try {
      // Add enrollment logic here
      console.log('Enrolling in course:', course._id);
      // Redirect to checkout or payment
      router.push(`/${locale}/checkout?course=${course._id}`);
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Get localized content
  const getLocalizedText = (text: string, textEn?: string) => {
    return isRTL ? text : textEn || text;
  };

  // Format duration
  const formatDuration = () => {
    if (course.duration_weeks) {
      return isRTL
        ? `${course.duration_weeks} هفته`
        : `${course.duration_weeks} weeks`;
    }
    if (course.duration_hours) {
      return isRTL
        ? `${course.duration_hours} ساعت`
        : `${course.duration_hours} hours`;
    }
    return isRTL ? 'نامشخص' : 'Not specified';
  };

  // Check if enrollment is available
  const isEnrollmentAvailable = () => {
    if (course.status !== 'active') return false;
    if (course.enrollment_deadline && new Date(course.enrollment_deadline) < new Date()) return false;
    if (course.max_students && course.current_students && course.current_students >= course.max_students) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Course Info */}
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <div className="mb-4">
                <span className="inline-block bg-primary px-3 py-1 rounded-full text-sm font-medium">
                  {course.type}
                </span>
                {course.category?.details && (
                  <span className={`inline-block bg-gray-700 px-3 py-1 rounded-full text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}>
                    {getLocalizedText(course.category.details.name, course.category.details.name_en)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {getLocalizedText(course.name, course.name_en)}
              </h1>

              <p className="text-xl text-gray-300 mb-6">
                {getLocalizedText(
                  course.short_description || course.description,
                  course.short_description_en || course.description_en
                )}
              </p>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 mb-6 text-sm">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">⭐</span>
                  <span>{course.average_rating.toFixed(1)}</span>
                  <span className="text-gray-400 ml-1">
                    ({course.total_reviews} {isRTL ? 'نظر' : 'reviews'})
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-400 mr-1">👥</span>
                  <span>{course.total_students} {isRTL ? 'دانشجو' : 'students'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-1">⏱️</span>
                  <span>{formatDuration()}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-purple-400 mr-1">📊</span>
                  <span>{isRTL ? course.level : course.level}</span>
                </div>
              </div>

              {/* Price and Enrollment */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  {course.is_free ? (
                    <span className="text-2xl font-bold text-green-400">
                      {isRTL ? 'رایگان' : 'Free'}
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">
                        {formatPrice(course.price, locale)}
                      </span>
                      {course.original_price && course.original_price > course.price && (
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(course.original_price, locale)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {isEnrollmentAvailable() && (
                  <button
                    onClick={handleEnrollment}
                    disabled={enrollmentLoading}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {enrollmentLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        {isRTL ? 'ثبت‌نام در دوره' : 'Enroll Now'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Course Image */}
            <div className="lg:order-2">
              {course.featured_image?.details ? (
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={course.featured_image.details.url}
                    alt={course.featured_image.details.alt || course.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">🎓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: isRTL ? 'بررسی کلی' : 'Overview' },
                  { id: 'curriculum', label: isRTL ? 'سرفصل‌ها' : 'Curriculum' },
                  { id: 'instructor', label: isRTL ? 'مدرس' : 'Instructor' },
                  { id: 'reviews', label: isRTL ? 'نظرات' : 'Reviews' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    {isRTL ? 'درباره این دوره' : 'About this course'}
                  </h2>
                  <div className={`prose max-w-none ${isRTL ? 'prose-rtl' : ''}`}>
                    <p>
                      {showFullDescription
                        ? getLocalizedText(course.description, course.description_en)
                        : getLocalizedText(course.description, course.description_en).substring(0, 300) + '...'
                      }
                    </p>
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary hover:underline"
                    >
                      {showFullDescription
                        ? (isRTL ? 'کمتر نشان بده' : 'Show less')
                        : (isRTL ? 'بیشتر نشان بده' : 'Show more')
                      }
                    </button>
                  </div>

                  {course.what_you_learn && course.what_you_learn.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4">
                        {isRTL ? 'آنچه خواهید آموخت' : 'What you\'ll learn'}
                      </h3>
                      <ul className="space-y-2">
                        {course.what_you_learn.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{getLocalizedText(item.title, item.title_en)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.requirements && course.requirements.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4">
                        {isRTL ? 'پیش‌نیازها' : 'Requirements'}
                      </h3>
                      <ul className="space-y-2">
                        {course.requirements.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{getLocalizedText(item.title, item.title_en)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    {isRTL ? 'سرفصل دوره' : 'Course Curriculum'}
                  </h2>
                  {course.syllabus && course.syllabus.length > 0 ? (
                    <div className="space-y-4">
                      {course.syllabus.map((module, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">
                              {isRTL ? `فصل ${index + 1}: ` : `Module ${index + 1}: `}
                              {getLocalizedText(module.title, module.title_en)}
                            </h3>
                            {module.duration && (
                              <span className="text-sm text-gray-500">
                                {module.duration} {isRTL ? 'دقیقه' : 'minutes'}
                              </span>
                            )}
                          </div>
                          {module.description && (
                            <p className="text-gray-600">
                              {getLocalizedText(module.description, module.description_en)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {isRTL ? 'سرفصل در دسترس نیست' : 'Curriculum not available'}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'instructor' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    {isRTL ? 'مدرس دوره' : 'Course Instructor'}
                  </h2>
                  {course.instructor?.details ? (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {course.instructor.details.profile_image?.details ? (
                          <div className="w-16 h-16 relative rounded-full overflow-hidden">
                            <Image
                              src={course.instructor.details.profile_image.details.url}
                              alt={course.instructor.details.profile_image.details.alt || 'Instructor'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👨‍🏫</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {course.instructor.details.first_name} {course.instructor.details.last_name}
                        </h3>
                        <p className="text-gray-600">
                          {getLocalizedText(
                            course.instructor.details.bio || '',
                            course.instructor.details.bio_en
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {isRTL ? 'اطلاعات مدرس در دسترس نیست' : 'Instructor information not available'}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    {isRTL ? 'نظرات دانشجویان' : 'Student Reviews'}
                  </h2>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{review.user_name}</span>
                                <div className="flex text-yellow-400">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i}>
                                      {i < review.rating ? '⭐' : '☆'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-600">{review.comment}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString(locale)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {isRTL ? 'هنوز نظری ثبت نشده است' : 'No reviews yet'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">
                {isRTL ? 'جزئیات دوره' : 'Course Details'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{isRTL ? 'سطح:' : 'Level:'}</span>
                  <span>{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{isRTL ? 'مدت زمان:' : 'Duration:'}</span>
                  <span>{formatDuration()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{isRTL ? 'دانشجویان:' : 'Students:'}</span>
                  <span>{course.total_students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{isRTL ? 'نوع:' : 'Type:'}</span>
                  <span>{course.is_online ? (isRTL ? 'آنلاین' : 'Online') : (isRTL ? 'حضوری' : 'In-person')}</span>
                </div>
              </div>

              {course.tags?.details && course.tags.details.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">
                    {isRTL ? 'برچسب‌ها:' : 'Tags:'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.details.map((tag) => (
                      <span
                        key={tag._id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {getLocalizedText(tag.name, tag.name_en)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Courses */}
        {related_courses && related_courses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              {isRTL ? 'دوره‌های مرتبط' : 'Related Courses'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {related_courses.map((relatedCourse) => (
                <Link
                  key={relatedCourse._id}
                  href={`/${locale}/courses/${relatedCourse.slug || relatedCourse._id}`}
                >
                  <ContentCard
                    id={relatedCourse._id}
                    title={getLocalizedText(relatedCourse.name, relatedCourse.name_en)}
                    imageUrl={relatedCourse.featured_image?.details?.url}
                    imageAlt={relatedCourse.featured_image?.details?.alt}
                    price={relatedCourse.price}
                    rating={relatedCourse.average_rating}
                    studentCount={relatedCourse.total_students}
                    locale={locale}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
