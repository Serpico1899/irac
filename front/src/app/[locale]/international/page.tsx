import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { InternationalCourseCard } from "@/components/organisms/InternationalCourseCard";
import { GlobeIcon } from "@/components/atoms/Icons";
import {
  Clock,
  Users,
  Award,
  BookOpen,
  Star,
  MapPin,
  Phone,
  Mail,
  Check,
  ArrowRight,
  Play,
  Calendar,
  Languages,
  CreditCard,
  Shield,
  Headphones,
  UserCheck,
} from "lucide-react";

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
      siteName: "IRAC - Iranian Architecture Center",
      images: [
        {
          url: "/images/international/hero-architecture.jpg",
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

  // Mock data for international courses
  const internationalCourses = [
    {
      id: "1",
      title: "Islamic Architecture History & Theory",
      title_en: "Islamic Architecture History & Theory",
      description:
        "Comprehensive study of Islamic architectural development through history, covering major periods and regional variations.",
      description_en:
        "Comprehensive study of Islamic architectural development through history, covering major periods and regional variations.",
      instructor: "Dr. Sarah Ahmed",
      instructor_en: "Dr. Sarah Ahmed",
      duration: "12 weeks",
      level: "intermediate" as const,
      languages: ["English", "Arabic"],
      certification: "International Certificate",
      price: "299",
      originalPrice: "399",
      currency: "USD" as const,
      image: "/images/courses/islamic-architecture-history.jpg",
      rating: 4.8,
      studentsCount: 1250,
      lessonsCount: 24,
      isNew: false,
      isFeatured: true,
      category: "Architecture History",
      slug: "islamic-architecture-history-theory",
    },
    {
      id: "2",
      title: "Islamic Geometric Patterns Masterclass",
      title_en: "Islamic Geometric Patterns Masterclass",
      description:
        "Learn to create and understand the mathematical principles behind traditional Islamic geometric patterns.",
      description_en:
        "Learn to create and understand the mathematical principles behind traditional Islamic geometric patterns.",
      instructor: "Prof. Hassan Al-Rawi",
      instructor_en: "Prof. Hassan Al-Rawi",
      duration: "8 weeks",
      level: "advanced" as const,
      languages: ["English", "Arabic", "Persian"],
      certification: "Specialist Certificate",
      price: "249",
      currency: "USD" as const,
      image: "/images/courses/geometric-patterns.jpg",
      rating: 4.9,
      studentsCount: 890,
      lessonsCount: 16,
      isNew: true,
      isFeatured: true,
      category: "Traditional Arts",
      slug: "islamic-geometric-patterns-masterclass",
    },
    {
      id: "3",
      title: "Persian Calligraphy Basics",
      title_en: "Persian Calligraphy Basics",
      description:
        "Introduction to Persian calligraphy techniques with bilingual instruction and cultural context.",
      description_en:
        "Introduction to Persian calligraphy techniques with bilingual instruction and cultural context.",
      instructor: "Master Reza Hosseini",
      instructor_en: "Master Reza Hosseini",
      duration: "6 weeks",
      level: "beginner" as const,
      languages: ["English", "Persian"],
      certification: "Foundation Certificate",
      price: "199",
      currency: "USD" as const,
      image: "/images/courses/persian-calligraphy.jpg",
      rating: 4.7,
      studentsCount: 2100,
      lessonsCount: 18,
      isNew: false,
      isFeatured: false,
      category: "Calligraphy",
      slug: "persian-calligraphy-basics",
    },
    {
      id: "4",
      title: "Islamic Garden Design Principles",
      title_en: "Islamic Garden Design Principles",
      description:
        "Explore the philosophy and practical aspects of traditional Islamic garden design from an international perspective.",
      description_en:
        "Explore the philosophy and practical aspects of traditional Islamic garden design from an international perspective.",
      instructor: "Dr. Amina Rahman",
      instructor_en: "Dr. Amina Rahman",
      duration: "10 weeks",
      level: "intermediate" as const,
      languages: ["English", "Arabic"],
      certification: "Design Certificate",
      price: "349",
      originalPrice: "449",
      currency: "USD" as const,
      image: "/images/courses/islamic-garden-design.jpg",
      rating: 4.6,
      studentsCount: 750,
      lessonsCount: 20,
      isNew: false,
      isFeatured: true,
      category: "Landscape Design",
      slug: "islamic-garden-design-principles",
    },
    {
      id: "5",
      title: "Traditional Islamic Crafts Workshop",
      title_en: "Traditional Islamic Crafts Workshop",
      description:
        "Hands-on workshop covering various traditional Islamic crafts including metalwork, ceramics, and textiles.",
      description_en:
        "Hands-on workshop covering various traditional Islamic crafts including metalwork, ceramics, and textiles.",
      instructor: "Fatima Al-Zahra",
      instructor_en: "Fatima Al-Zahra",
      duration: "14 weeks",
      level: "beginner" as const,
      languages: ["English", "Arabic", "Persian"],
      certification: "Workshop Certificate",
      price: "399",
      currency: "USD" as const,
      image: "/images/courses/traditional-crafts.jpg",
      rating: 4.8,
      studentsCount: 650,
      lessonsCount: 28,
      isNew: true,
      isFeatured: false,
      category: "Traditional Crafts",
      slug: "traditional-islamic-crafts-workshop",
    },
    {
      id: "6",
      title: "Heritage Restoration Techniques",
      title_en: "Heritage Restoration Techniques",
      description:
        "Professional course on Islamic heritage preservation and restoration using modern and traditional methods.",
      description_en:
        "Professional course on Islamic heritage preservation and restoration using modern and traditional methods.",
      instructor: "Dr. Omar Khalil",
      instructor_en: "Dr. Omar Khalil",
      duration: "16 weeks",
      level: "advanced" as const,
      languages: ["English"],
      certification: "Professional Certificate",
      price: "599",
      originalPrice: "799",
      currency: "USD" as const,
      image: "/images/courses/heritage-restoration.jpg",
      rating: 4.9,
      studentsCount: 320,
      lessonsCount: 32,
      isNew: false,
      isFeatured: true,
      category: "Conservation",
      slug: "heritage-restoration-techniques",
    },
  ];

  // Mock data for global features
  const globalFeatures = [
    {
      icon: GlobeIcon,
      title: t("features.global.title"),
      description: t("features.global.description"),
    },
    {
      icon: UserCheck,
      title: t("features.expert.title"),
      description: t("features.expert.description"),
    },
    {
      icon: Award,
      title: t("features.certificate.title"),
      description: t("features.certificate.description"),
    },
    {
      icon: Users,
      title: t("features.community.title"),
      description: t("features.community.description"),
    },
    {
      icon: Clock,
      title: t("features.flexible.title"),
      description: t("features.flexible.description"),
    },
    {
      icon: Headphones,
      title: t("features.support.title"),
      description: t("features.support.description"),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex items-center min-h-screen bg-gradient-to-r from-primary to-primary-dark relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse" />
          <div
            className="absolute top-32 right-16 w-32 h-32 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="flex flex-col lg:flex-row items-center max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col flex-1 text-white text-center lg:text-left mb-8 lg:mb-0">
            {/* Globe Icon */}
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <GlobeIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")}
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center justify-center bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/90 transition-colors"
              >
                <BookOpen className={`w-5 h-5 ${isRtl ? "ml-2" : "mr-2"}`} />
                {t("hero.cta.programs")}
              </Link>
              <button className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
                <Play className={`w-5 h-5 ${isRtl ? "ml-2" : "mr-2"}`} />
                Watch Intro
              </button>
            </div>

            {/* Global Statistics */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8">
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-bold text-accent-primary mb-1">
                  {stats.countries}+
                </div>
                <div className="text-sm text-white/80">
                  {t("stats.countries")}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-bold text-accent-primary mb-1">
                  {stats.students.toLocaleString()}+
                </div>
                <div className="text-sm text-white/80">
                  {t("stats.students")}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-bold text-accent-primary mb-1">
                  {stats.partnerships}
                </div>
                <div className="text-sm text-white/80">
                  {t("stats.partnerships")}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-bold text-accent-primary mb-1">
                  {stats.languages}
                </div>
                <div className="text-sm text-white/80">
                  {t("stats.languages")}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-lg lg:max-w-none">
            <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/international/hero-architecture.jpg"
                alt="Islamic Architecture"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose IRAC Section */}
      <section className="flex flex-col py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Why Choose IRAC?
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl">
              Join thousands of students worldwide who have transformed their
              understanding of Islamic architecture and culture
            </p>
          </div>

          <div className="flex flex-wrap gap-6 lg:gap-8">
            {globalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col flex-1 min-w-80 text-center p-6 lg:p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* International Courses Section */}
      <section className="flex flex-col py-16 lg:py-20 bg-background-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t("courses.title")}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mb-8">
              {t("courses.subtitle")}
            </p>

            {/* Course Categories */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {Object.entries(t.raw("courses.categories")).map(
                ([key, value]) => (
                  <span
                    key={key}
                    className="px-4 py-2 bg-white rounded-full text-sm font-medium text-text-primary border border-background-secondary hover:border-primary transition-colors cursor-pointer"
                  >
                    {value as string}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 lg:gap-8">
            {internationalCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <InternationalCourseCard course={course} locale={locale} />
              </div>
            ))}
          </div>

          {/* View All Courses Button */}
          <div className="flex justify-center mt-12">
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              View All Courses
              <ArrowRight className={`w-5 h-5 ${isRtl ? "mr-2" : "ml-2"}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* Global Contact Section */}
      <section className="flex flex-col py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Contact Information */}
            <div className="flex flex-col flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
                {t("contact.title")}
              </h2>
              <p className="text-lg text-text-secondary mb-8">
                {t("contact.subtitle")}
              </p>

              <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">Email</h4>
                    <p className="text-text-secondary">
                      {t("contact.info.email")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">Phone</h4>
                    <p className="text-text-secondary">
                      {t("contact.info.phone")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">
                      Availability
                    </h4>
                    <p className="text-text-secondary">
                      {t("contact.info.hours")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Multi-currency Info */}
              <div className="p-6 bg-background-primary rounded-xl border border-background-secondary">
                <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Multi-Currency Support
                </h4>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
                    USD
                  </span>
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
                    EUR
                  </span>
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
                    GBP
                  </span>
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
                    IRR
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="flex flex-col flex-1">
              <form className="flex flex-col gap-6 p-8 bg-background-primary rounded-xl border border-background-secondary">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-text-primary mb-2">
                      {t("contact.form.name")}
                    </label>
                    <input
                      type="text"
                      className="px-4 py-3 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-text-primary mb-2">
                      {t("contact.form.email")}
                    </label>
                    <input
                      type="email"
                      className="px-4 py-3 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-text-primary mb-2">
                      {t("contact.form.country")}
                    </label>
                    <select className="px-4 py-3 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option>Select Country</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Germany</option>
                      <option>France</option>
                    </select>
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-text-primary mb-2">
                      {t("contact.form.timezone")}
                    </label>
                    <select className="px-4 py-3 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option>UTC-8 (PST)</option>
                      <option>UTC-5 (EST)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+1 (CET)</option>
                      <option>UTC+3:30 (Iran)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-text-primary mb-2">
                    {t("contact.form.program")}
                  </label>
                  <select className="px-4 py-3 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Select Program</option>
                    <option>Islamic Architecture History & Theory</option>
                    <option>Islamic Geometric Patterns</option>
                    <option>Persian Calligraphy</option>
                    <option>Garden Design</option>
                    <option>Traditional Crafts</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-text-primary mb-2">
                    {t("contact.form.message")}
                  </label>
                  <textarea
                    rows={4}
                    className="px-4 py-3 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Tell us about your interests and goals..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  {t("contact.form.submit")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="flex flex-col py-12 bg-background-primary border-t border-background-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            <div className="flex items-center gap-3 text-text-secondary">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Award className="w-6 h-6 text-primary" />
              <span className="font-medium">Internationally Recognized</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Users className="w-6 h-6 text-primary" />
              <span className="font-medium">12,500+ Global Students</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Headphones className="w-6 h-6 text-primary" />
              <span className="font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
