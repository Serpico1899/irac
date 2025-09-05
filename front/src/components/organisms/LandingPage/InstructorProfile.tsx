"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface InstructorProfileProps {
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
  locale: string;
  variant?: "full" | "compact" | "card";
  showContact?: boolean;
  showStats?: boolean;
}

export default function InstructorProfile({
  instructor,
  locale,
  variant = "full",
  showContact = true,
  showStats = true,
}: InstructorProfileProps) {
  const t = useTranslations("instructorProfile");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  const isRtl = locale === "fa";

  // Truncate bio for compact view
  const displayBio = variant === "compact" && instructor.bio.length > 200 && !showFullBio
    ? instructor.bio.substring(0, 200) + "..."
    : instructor.bio;

  const containerClasses = {
    full: "bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8",
    compact: "bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6",
    card: "bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-gray-200"
  };

  return (
    <section className={containerClasses[variant]}>
      <div className={`flex flex-col ${variant === "full" ? "lg:flex-row" : ""} gap-6`}>
        {/* Instructor Image and Basic Info */}
        <div className={`flex-shrink-0 ${variant === "full" ? "lg:w-80" : "w-full"}`}>
          <div className={`flex ${variant === "card" ? "flex-col items-center text-center" : "flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center"} gap-4`}>
            {/* Profile Image */}
            <div className={`relative ${variant === "full" ? "w-32 h-32 sm:w-40 sm:h-40" : "w-24 h-24 sm:w-28 sm:h-28"} rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-4 border-white shadow-lg`}>
              {instructor.image ? (
                <Image
                  src={instructor.image}
                  alt={instructor.name}
                  fill
                  className={`object-cover transition-opacity duration-500 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className={`text-white font-bold ${variant === "full" ? "text-2xl sm:text-3xl" : "text-xl"}`}>
                    {instructor.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h2 className={`font-bold text-gray-900 mb-1 ${variant === "full" ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}>
                {instructor.name}
              </h2>
              <p className={`text-blue-600 font-medium mb-2 ${variant === "full" ? "text-base" : "text-sm"}`}>
                {instructor.title}
              </p>

              {/* Experience Badge */}
              {instructor.experience_years && (
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-3">
                  <svg className={`w-4 h-4 ${isRtl ? "ml-1" : "mr-1"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {instructor.experience_years} {t("yearsExperience")}
                </div>
              )}

              {/* Rating */}
              {instructor.rating && showStats && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(instructor.rating!.score) ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold">{instructor.rating.score}</span>
                    <span className={`${isRtl ? "mr-1" : "ml-1"}`}>
                      ({instructor.rating.count} {t("reviews")})
                    </span>
                  </span>
                </div>
              )}

              {/* Stats */}
              {showStats && (instructor.total_students || instructor.total_courses) && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {instructor.total_students && (
                    <div className="flex items-center">
                      <svg className={`w-4 h-4 text-blue-500 ${isRtl ? "ml-1" : "mr-1"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                      <span>
                        <span className="font-semibold">{instructor.total_students.toLocaleString()}</span>{" "}
                        {t("students")}
                      </span>
                    </div>
                  )}
                  {instructor.total_courses && (
                    <div className="flex items-center">
                      <svg className={`w-4 h-4 text-green-500 ${isRtl ? "ml-1" : "mr-1"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <span>
                        <span className="font-semibold">{instructor.total_courses}</span>{" "}
                        {t("courses")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="flex-1 space-y-6">
          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("about")}</h3>
            <p className="text-gray-700 leading-relaxed">
              {displayBio}
            </p>
            {variant === "compact" && instructor.bio.length > 200 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 transition-colors duration-200"
              >
                {showFullBio ? t("showLess") : t("showMore")}
              </button>
            )}
          </div>

          {/* Specializations */}
          {instructor.specializations && instructor.specializations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("specializations")}</h3>
              <div className="flex flex-wrap gap-2">
                {instructor.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Credentials */}
          {instructor.credentials && instructor.credentials.length > 0 && variant === "full" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("credentials")}</h3>
              <ul className="space-y-2">
                {instructor.credentials.map((credential, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 ${isRtl ? "ml-3" : "mr-3"}`} />
                    <span className="text-gray-700 text-sm">{credential}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {instructor.languages && instructor.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("languages")}</h3>
              <div className="flex flex-wrap gap-2">
                {instructor.languages.map((language, index) => (
                  <div key={index} className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    <svg className={`w-4 h-4 ${isRtl ? "ml-1" : "mr-1"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.723 1.447a1 1 0 11-1.79-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 12.236 11.618 14z" clipRule="evenodd" />
                    </svg>
                    {language}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links and Contact */}
          {showContact && instructor.social_links && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("connect")}</h3>
              <div className="flex flex-wrap gap-3">
                {instructor.social_links.linkedin && (
                  <Link
                    href={instructor.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm touch-manipulation"
                  >
                    <svg className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                    LinkedIn
                  </Link>
                )}

                {instructor.social_links.website && (
                  <Link
                    href={instructor.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm touch-manipulation"
                  >
                    <svg className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                    </svg>
                    {t("website")}
                  </Link>
                )}

                {instructor.social_links.email && (
                  <Link
                    href={`mailto:${instructor.social_links.email}`}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm touch-manipulation"
                  >
                    <svg className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t("email")}
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Achievements */}
          {instructor.achievements && instructor.achievements.length > 0 && variant === "full" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("achievements")}</h3>
              <ul className="space-y-2">
                {instructor.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <svg className={`w-5 h-5 text-yellow-500 ${isRtl ? "ml-3" : "mr-3"} flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-700 text-sm">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
