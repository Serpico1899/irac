"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Metadata } from "next";
import LandingHero from "@/components/organisms/LandingPage/LandingHero";
import InstructorProfile from "@/components/organisms/LandingPage/InstructorProfile";
import LandingTestimonials from "@/components/organisms/LandingPage/LandingTestimonials";
import LandingCurriculum from "@/components/organisms/LandingPage/LandingCurriculum";
import LandingFAQ from "@/components/organisms/LandingPage/LandingFAQ";
import LandingCTA from "@/components/organisms/LandingPage/LandingCTA";

interface CourseData {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  price: {
    current: number;
    original?: number;
    currency: string;
  };
  instructor: {
    id: string;
    name: string;
    title: string;
    bio: string;
    image?: string;
    credentials?: string[];
    experience_years?: number;
    specializations?: string[];
    rating?: {
      score: number;
      count: number;
    };
    total_students?: number;
    total_courses?: number;
    social_links?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
      email?: string;
    };
    achievements?: string[];
    languages?: string[];
  };
  features: string[];
  rating: {
    score: number;
    count: number;
  };
  students_enrolled: number;
  duration_weeks: number;
  duration_hours: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  delivery_format: "online" | "offline" | "hybrid";
  schedule_type: "self_paced" | "instructor_led" | "cohort_based";
  modules: Array<{
    id: string;
    title: string;
    description: string;
    duration?: string;
    lessons: Array<{
      id: string;
      title: string;
      duration?: string;
      type: "video" | "text" | "quiz" | "assignment" | "live";
      free_preview?: boolean;
    }>;
    learning_objectives: string[];
    resources?: Array<{
      name: string;
      type: "pdf" | "video" | "audio" | "link";
      size?: string;
    }>;
  }>;
  what_you_learn: string[];
  prerequisites: string[];
  tools_required: string[];
  career_paths: string[];
  background_image?: string;
  gallery_images?: string[];
  testimonials: Array<{
    id: string;
    name: string;
    title?: string;
    company?: string;
    content: string;
    rating: number;
    avatar?: string;
    date?: string;
    verified?: boolean;
    course_name?: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    category?: string;
    priority?: number;
    keywords?: string[];
  }>;
  certificates: string[];
  guarantee: string;
  support_info: string;
  access_duration: string; // e.g., "Lifetime", "1 Year", "6 Months"
  completion_certificate: boolean;
  downloadable_resources: boolean;
  mobile_access: boolean;
  community_access: boolean;
  start_date?: string;
  enrollment_deadline?: string;
}

interface CourseLandingPageProps {
  course: CourseData;
  locale: string;
  isPreview?: boolean;
}

export default function CourseLandingPage({
  course,
  locale,
  isPreview = false,
}: CourseLandingPageProps) {
  const t = useTranslations("courseLanding");
  const [mounted, setMounted] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  const isRtl = locale === "fa";

  // Handle mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle sticky CTA visibility
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      setStickyVisible(scrollPosition > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate total lessons
  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  // Generate structured data for SEO
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description,
      "provider": {
        "@type": "Organization",
        "name": "IRAC - Islamic Revolution Architecture Center",
        "url": "https://irac.ir",
      },
      "instructor": {
        "@type": "Person",
        "name": course.instructor.name,
        "description": course.instructor.bio,
        "image": course.instructor.image,
      },
      "image": course.background_image || course.gallery_images?.[0],
      "educationalLevel": course.level,
      "inLanguage": course.language,
      "courseMode": course.delivery_format,
      "timeRequired": `PT${course.duration_hours}H`,
      "numberOfCredits": course.duration_weeks,
      "offers": {
        "@type": "Offer",
        "url": `/courses/${course.slug}/enroll`,
        "price": course.price.current,
        "priceCurrency": course.price.currency === "تومان" ? "IRR" : "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString(),
        "validThrough": course.enrollment_deadline || undefined,
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": course.rating.score,
        "reviewCount": course.rating.count,
      },
      "hasCourseInstance": course.start_date ? {
        "@type": "CourseInstance",
        "startDate": course.start_date,
        "endDate": course.enrollment_deadline,
        "courseMode": course.delivery_format,
        "instructor": {
          "@type": "Person",
          "name": course.instructor.name,
        },
      } : undefined,
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    );
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      {generateStructuredData()}

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <LandingHero
          type="course"
          title={course.title}
          description={course.short_description}
          slug={course.slug}
          instructor={{
            name: course.instructor.name,
            image: course.instructor.image,
            credentials: course.instructor.title,
          }}
          features={course.features.slice(0, 4)}
          price={course.price}
          rating={course.rating}
          students={course.students_enrolled}
          backgroundImage={course.background_image}
          ctaText={t("enrollNow")}
          ctaSecondaryText={t("learnMore")}
          locale={locale}
        />

        {/* Course Overview */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Overview */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                    {t("overview.title")}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                    {course.description}
                  </p>
                </div>

                {/* What You'll Learn */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                    {t("whatYoullLearn")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {course.what_you_learn.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <svg
                          className={`w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 ${isRtl ? "ml-2" : "mr-2"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Paths */}
                {course.career_paths.length > 0 && (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                      {t("careerPaths")}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {course.career_paths.map((path, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg"
                        >
                          <svg
                            className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {path}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools Required */}
                {course.tools_required.length > 0 && (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                      {t("toolsRequired")}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {course.tools_required.map((tool, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <svg
                            className="w-5 h-5 text-gray-500 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-700 truncate">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Info Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  {/* Course Details Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("courseDetails")}
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("duration")}:</span>
                        <span className="font-medium">
                          {course.duration_weeks} {t("weeks")} ({course.duration_hours}h)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("lessons")}:</span>
                        <span className="font-medium">{totalLessons} {t("lessons")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("level")}:</span>
                        <span className="font-medium">{t(`levels.${course.level.toLowerCase()}`)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("language")}:</span>
                        <span className="font-medium">{course.language}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("format")}:</span>
                        <span className="font-medium">{t(`formats.${course.delivery_format}`)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("schedule")}:</span>
                        <span className="font-medium">{t(`schedules.${course.schedule_type}`)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("access")}:</span>
                        <span className="font-medium text-green-600">{course.access_duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Course Features */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("courseIncludes")}
                    </h3>
                    <div className="space-y-3">
                      {course.completion_certificate && (
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{t("features.certificate")}</span>
                        </div>
                      )}
                      {course.downloadable_resources && (
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{t("features.resources")}</span>
                        </div>
                      )}
                      {course.mobile_access && (
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{t("features.mobileAccess")}</span>
                        </div>
                      )}
                      {course.community_access && (
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                          <span className="text-sm text-gray-700">{t("features.community")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  {course.prerequisites.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t("prerequisites")}
                      </h3>
                      <ul className="space-y-2">
                        {course.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Guarantee */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <svg className="w-8 h-8 text-green-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("guarantee.title")}
                    </h3>
                    <p className="text-sm text-gray-600">{course.guarantee}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instructor Profile */}
        <InstructorProfile
          instructor={course.instructor}
          locale={locale}
          variant="full"
          showContact={true}
          showStats={true}
        />

        {/* Curriculum/Modules */}
        <LandingCurriculum
          modules={course.modules}
          title={t("curriculum.title")}
          subtitle={t("curriculum.subtitle")}
          totalDuration={`${course.duration_hours} ${t("hours")}`}
          totalLessons={totalLessons}
          locale={locale}
          variant="accordion"
          showPreview={true}
          backgroundColor="gray"
        />

        {/* Testimonials */}
        {course.testimonials.length > 0 && (
          <LandingTestimonials
            testimonials={course.testimonials}
            title={t("testimonials.title")}
            subtitle={t("testimonials.subtitle")}
            locale={locale}
            variant="slider"
            autoPlay={true}
            showRatings={true}
            showVerifiedBadge={true}
            maxVisible={6}
            backgroundColor="white"
          />
        )}

        {/* FAQ Section */}
        {course.faqs.length > 0 && (
          <LandingFAQ
            faqs={course.faqs}
            title={t("faq.title")}
            subtitle={t("faq.subtitle")}
            locale={locale}
            variant="accordion"
            showSearch={true}
            showCategories={true}
            maxVisible={12}
            backgroundColor="gray"
            structuredData={true}
          />
        )}

        {/* Final CTA */}
        <LandingCTA
          title={t("finalCta.title")}
          subtitle={t("finalCta.subtitle")}
          description={t("finalCta.description")}
          buttons={[
            {
              text: t("enrollNow"),
              href: `/courses/${course.slug}/enroll`,
              variant: "primary",
              icon: "cart",
            },
            {
              text: t("downloadSyllabus"),
              href: `/courses/${course.slug}/syllabus`,
              variant: "secondary",
              icon: "download",
            },
            {
              text: t("contactUs"),
              href: "/contact",
              variant: "outline",
              icon: "phone",
            },
          ]}
          locale={locale}
          variant="section"
          urgency={course.enrollment_deadline ? {
            text: t("urgency.enrollmentDeadline"),
            countdown: {
              endDate: new Date(course.enrollment_deadline),
              labels: {
                days: t("countdown.days"),
                hours: t("countdown.hours"),
                minutes: t("countdown.minutes"),
                seconds: t("countdown.seconds"),
              },
            },
          } : undefined}
          trustIndicators={[
            { icon: "guarantee", text: course.guarantee },
            { icon: "secure", text: t("securePayment") },
            { icon: "support", text: course.support_info },
            { icon: "certificate", text: course.certificates.join(", ") },
          ]}
          socialProof={{
            text: t("socialProof.enrolledStudents"),
            count: course.students_enrolled,
          }}
          backgroundColor="gradient"
          showPattern={true}
          centered={true}
          animation={true}
        />

        {/* Sticky CTA (Mobile) */}
        {stickyVisible && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg sm:hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {course.title}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-blue-600">
                    {course.price.current.toLocaleString()} {course.price.currency}
                  </span>
                  {course.price.original && (
                    <span className="text-gray-500 line-through text-xs">
                      {course.price.original.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={`/courses/${course.slug}/enroll`}
                className="flex-shrink-0 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 touch-manipulation"
              >
                {t("enroll")}
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
