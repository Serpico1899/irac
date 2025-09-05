import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "international" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
      locale: locale,
      siteName: "IRAC - Islamic Revolution Architecture Center",
      images: [
        {
          url: "/images/international/global-architecture.jpg",
          width: 1200,
          height: 630,
          alt: t("meta.title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
    },
    alternates: {
      canonical: `/${locale}/international`,
      languages: {
        fa: "/fa/international",
        en: "/en/international",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function InternationalPage({
  params: { locale },
}: PageProps) {
  // Validate locale
  if (!["fa", "en"].includes(locale)) {
    notFound();
  }

  const t = await getTranslations("international");
  const isRtl = locale === "fa";

  // Mock data for international statistics
  const stats = {
    countries: 45,
    students: 12500,
    partnerships: 28,
    languages: 12,
  };

  // Mock data for global partners
  const partners = [
    {
      id: "1",
      name: "MIT Architecture",
      country: "USA",
      logo: "/images/partners/mit.png",
      type: "Academic",
    },
    {
      id: "2",
      name: "Cambridge University",
      country: "UK",
      logo: "/images/partners/cambridge.png",
      type: "Academic",
    },
    {
      id: "3",
      name: "Tokyo Institute of Technology",
      country: "Japan",
      logo: "/images/partners/tokyo-tech.png",
      type: "Academic",
    },
    {
      id: "4",
      name: "UNESCO",
      country: "France",
      logo: "/images/partners/unesco.png",
      type: "International Organization",
    },
  ];

  // Mock data for international programs
  const programs = [
    {
      id: "1",
      title: t("programs.masterclass.title"),
      description: t("programs.masterclass.description"),
      duration: "6 months",
      languages: ["English", "Arabic", "Persian"],
      certification: "International Certificate",
      price: "$2,500",
      image: "/images/programs/masterclass.jpg",
    },
    {
      id: "2",
      title: t("programs.exchange.title"),
      description: t("programs.exchange.description"),
      duration: "1 semester",
      languages: ["English", "Persian"],
      certification: "Exchange Certificate",
      price: "$5,000",
      image: "/images/programs/exchange.jpg",
    },
    {
      id: "3",
      title: t("programs.research.title"),
      description: t("programs.research.description"),
      duration: "1-2 years",
      languages: ["English", "Arabic", "Persian"],
      certification: "Research Fellowship",
      price: "Funded",
      image: "/images/programs/research.jpg",
    },
  ];

  // Mock data for success stories
  const successStories = [
    {
      id: "1",
      name: "Ahmed Al-Rashid",
      country: "Saudi Arabia",
      program: "Islamic Architecture Masterclass",
      achievement: "Led design of King Abdulaziz Mosque renovation",
      image: "/images/students/ahmed.jpg",
      flag: "/images/flags/sa.svg",
    },
    {
      id: "2",
      name: "Fatima El-Zahra",
      country: "Morocco",
      program: "Traditional Crafts Program",
      achievement: "Opened international Islamic art gallery",
      image: "/images/students/fatima.jpg",
      flag: "/images/flags/ma.svg",
    },
    {
      id: "3",
      name: "Muhammad Hassan",
      country: "Indonesia",
      program: "Research Fellowship",
      achievement: "Published 'Islamic Architecture in Southeast Asia'",
      image: "/images/students/hassan.jpg",
      flag: "/images/flags/id.svg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 text-white py-16 sm:py-20 lg:py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse" />
          <div className="absolute top-32 right-16 w-32 h-32 bg-white rounded-full animate-pulse animation-delay-1000" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Globe Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full mb-6 sm:mb-8">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-8 sm:mb-10 max-w-4xl mx-auto">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 touch-manipulation"
              >
                <svg
                  className={`w-5 h-5 ${isRtl ? "ml-2" : "mr-2"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {t("hero.cta.contact")}
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 touch-manipulation"
              >
                {t("hero.cta.programs")}
              </Link>
            </div>

            {/* Global Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1">
                  {stats.countries}+
                </div>
                <div className="text-sm sm:text-base text-gray-300">
                  {t("stats.countries")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-1">
                  {stats.students.toLocaleString()}+
                </div>
                <div className="text-sm sm:text-base text-gray-300">
                  {t("stats.students")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400 mb-1">
                  {stats.partnerships}
                </div>
                <div className="text-sm sm:text-base text-gray-300">
                  {t("stats.partnerships")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-400 mb-1">
                  {stats.languages}
                </div>
                <div className="text-sm sm:text-base text-gray-300">
                  {t("stats.languages")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t("globalReach.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t("globalReach.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Multi-timezone Support */}
            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg mb-4">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("globalReach.features.timezone.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("globalReach.features.timezone.description")}
              </p>
            </div>

            {/* Multi-currency */}
            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-lg mb-4">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("globalReach.features.currency.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("globalReach.features.currency.description")}
              </p>
            </div>

            {/* Multi-language Support */}
            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-lg mb-4">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.723 1.447a1 1 0 11-1.79-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 12.236 11.618 14z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("globalReach.features.language.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("globalReach.features.language.description")}
              </p>
            </div>

            {/* Global Certification */}
            <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-600 text-white rounded-lg mb-4">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("globalReach.features.certification.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("globalReach.features.certification.description")}
              </p>
            </div>

            {/* International Partnerships */}
            <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-lg mb-4">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("globalReach.features.partnerships.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("globalReach.features.partnerships.description")}
              </p>
            </div>

            {/* Cross-cultural Learning */}
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-lg mb-4">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("globalReach.features.crossCultural.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("globalReach.features.crossCultural.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* International Programs */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t("programs.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t("programs.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {program.title}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {program.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {t("programs.duration")}:
                      </span>
                      <span className="font-medium">{program.duration}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {t("programs.languages")}:
                      </span>
                      <span className="font-medium">
                        {program.languages.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {t("programs.certification")}:
                      </span>
                      <span className="font-medium">
                        {program.certification}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {t("programs.price")}:
                      </span>
                      <span className="font-medium text-blue-600">
                        {program.price}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 touch-manipulation"
                  >
                    {t("programs.apply")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Partners */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t("partners.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t("partners.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner) => (
              <div key={partner.id} className="text-center group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors duration-200">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {partner.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  {partner.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  {partner.country}
                </p>
                <p className="text-xs text-blue-600">{partner.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t("success.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t("success.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {story.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {story.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-3 bg-gray-300 rounded-sm"></div>
                      <span>{story.country}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    {story.program}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {story.achievement}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  {t("success.graduate")} • {story.program}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-lg sm:text-xl text-gray-200 mb-8 sm:mb-10">
            {t("cta.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 touch-manipulation"
            >
              <svg
                className={`w-5 h-5 ${isRtl ? "ml-2" : "mr-2"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {t("cta.contact")}
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 touch-manipulation"
            >
              <svg
                className={`w-5 h-5 ${isRtl ? "ml-2" : "mr-2"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              {t("cta.programs")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
