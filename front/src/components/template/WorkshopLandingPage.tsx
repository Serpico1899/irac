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

interface WorkshopData {
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
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  location: string;
  capacity: number;
  schedule: {
    start_date: string;
    end_date?: string;
    sessions: {
      id: string;
      title: string;
      description: string;
      duration: string;
      learning_objectives: string[];
    }[];
  };
  what_you_learn: string[];
  prerequisites: string[];
  materials_included: string[];
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
    workshop_name?: string;
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
}

interface WorkshopLandingPageProps {
  workshop: WorkshopData;
  locale: string;
  isPreview?: boolean;
}

export default function WorkshopLandingPage({
  workshop,
  locale,
  isPreview = false,
}: WorkshopLandingPageProps) {
  const t = useTranslations("workshopLanding");
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

  // Generate structured data for SEO
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": workshop.title,
      "description": workshop.description,
      "startDate": workshop.schedule.start_date,
      "endDate": workshop.schedule.end_date,
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": {
        "@type": "Place",
        "name": workshop.location,
      },
      "image": workshop.background_image || workshop.gallery_images?.[0],
      "offers": {
        "@type": "Offer",
        "url": `/workshops/${workshop.slug}/reserve`,
        "price": workshop.price.current,
        "priceCurrency": workshop.price.currency === "تومان" ? "IRR" : "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString(),
      },
      "performer": {
        "@type": "Person",
        "name": workshop.instructor.name,
        "description": workshop.instructor.bio,
        "image": workshop.instructor.image,
      },
      "organizer": {
        "@type": "Organization",
        "name": "IRAC - Islamic Revolution Architecture Center",
        "url": "https://irac.ir",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": workshop.rating.score,
        "reviewCount": workshop.rating.count,
      },
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

  // Convert workshop sessions to curriculum modules
  const curriculumModules = workshop.schedule.sessions.map((session, index) => ({
    id: session.id,
    title: session.title,
    description: session.description,
    duration: session.duration,
    learning_objectives: session.learning_objectives,
    lessons: [
      {
        id: `${session.id}-main`,
        title: session.title,
        duration: session.duration,
        type: "live" as const,
      },
    ],
  }));

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      {generateStructuredData()}

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <LandingHero
          type="workshop"
          title={workshop.title}
          description={workshop.short_description}
          slug={workshop.slug}
          instructor={{
            name: workshop.instructor.name,
            image: workshop.instructor.image,
            credentials: workshop.instructor.title,
          }}
          features={workshop.features.slice(0, 4)}
          price={workshop.price}
          rating={workshop.rating}
          students={workshop.students_enrolled}
          backgroundImage={workshop.background_image}
          ctaText={t("reserveSpot")}
          ctaSecondaryText={t("learnMore")}
          locale={locale}
        />

        {/* Workshop Overview */}
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
                    {workshop.description}
                  </p>
                </div>

                {/* What You'll Learn */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                    {t("whatYoullLearn")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {workshop.what_you_learn.map((item, index) => (
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

                {/* Materials Included */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                    {t("materialsIncluded")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {workshop.materials_included.map((material, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <svg
                          className="w-5 h-5 text-blue-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        <span className="text-gray-700 text-sm">{material}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Info Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  {/* Workshop Details Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("workshopDetails")}
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("duration")}:</span>
                        <span className="font-medium">{workshop.duration}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("level")}:</span>
                        <span className="font-medium">{t(`levels.${workshop.level.toLowerCase()}`)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("language")}:</span>
                        <span className="font-medium">{workshop.language}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("location")}:</span>
                        <span className="font-medium">{workshop.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("capacity")}:</span>
                        <span className="font-medium">
                          {workshop.capacity} {t("people")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("enrolled")}:</span>
                        <span className="font-medium text-blue-600">
                          {workshop.students_enrolled} {t("students")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prerequisites */}
                  {workshop.prerequisites.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t("prerequisites")}
                      </h3>
                      <ul className="space-y-2">
                        {workshop.prerequisites.map((prereq, index) => (
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
                    <p className="text-sm text-gray-600">{workshop.guarantee}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instructor Profile */}
        <InstructorProfile
          instructor={workshop.instructor}
          locale={locale}
          variant="full"
          showContact={true}
          showStats={true}
        />

        {/* Curriculum/Sessions */}
        <LandingCurriculum
          modules={curriculumModules}
          title={t("curriculum.title")}
          subtitle={t("curriculum.subtitle")}
          totalDuration={workshop.duration}
          totalLessons={workshop.schedule.sessions.length}
          locale={locale}
          variant="accordion"
          showPreview={false}
          backgroundColor="gray"
        />

        {/* Testimonials */}
        {workshop.testimonials.length > 0 && (
          <LandingTestimonials
            testimonials={workshop.testimonials}
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
        {workshop.faqs.length > 0 && (
          <LandingFAQ
            faqs={workshop.faqs}
            title={t("faq.title")}
            subtitle={t("faq.subtitle")}
            locale={locale}
            variant="accordion"
            showSearch={true}
            showCategories={false}
            maxVisible={10}
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
              text: t("reserveSpotNow"),
              href: `/workshops/${workshop.slug}/reserve`,
              variant: "primary",
              icon: "cart",
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
          urgency={{
            text: t("urgency.limitedSpots"),
          }}
          trustIndicators={[
            { icon: "guarantee", text: workshop.guarantee },
            { icon: "secure", text: t("securePayment") },
            { icon: "support", text: workshop.support_info },
            { icon: "certificate", text: workshop.certificates.join(", ") },
          ]}
          socialProof={{
            text: t("socialProof.joinedStudents"),
            count: workshop.students_enrolled,
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
                  {workshop.title}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-blue-600">
                    {workshop.price.current.toLocaleString()} {workshop.price.currency}
                  </span>
                  {workshop.price.original && (
                    <span className="text-gray-500 line-through text-xs">
                      {workshop.price.original.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={`/workshops/${workshop.slug}/reserve`}
                className="flex-shrink-0 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 touch-manipulation"
              >
                {t("reserve")}
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
