"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface TeamMember {
  id: string;
  name: string;
  name_en?: string;
  title: string;
  title_en?: string;
  bio: string;
  bio_en?: string;
  image?: string;
  specialties: string[];
  specialties_en?: string[];
}

interface Achievement {
  id: string;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  icon: string;
  number?: string;
}

export default function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<string>("fa");
  const isRTL = locale === "fa";

  // Prevent SSR issues and handle params after mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const resolvedParams = await params;
        setLocale(resolvedParams.locale);
        setMounted(true);
      } catch (error) {
        console.warn("Error resolving params:", error);
        setLocale("fa"); // fallback
        setMounted(true);
      }
    };

    initializeComponent();
  }, [params]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mock team data - In real implementation, this would come from API
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "دکتر احمد محمدی",
      name_en: "Dr. Ahmad Mohammadi",
      title: "مدیر مرکز و استاد معماری اسلامی",
      title_en: "Center Director & Professor of Islamic Architecture",
      bio: "متخصص معماری ایرانی-اسلامی با بیش از ۲۰ سال تجربه در تدریس و پژوهش",
      bio_en:
        "Iranian-Islamic architecture specialist with over 20 years of teaching and research experience",
      specialties: ["معماری کلاسیک ایران", "طراحی مساجد", "بازسازی میراث"],
      specialties_en: [
        "Classical Iranian Architecture",
        "Mosque Design",
        "Heritage Restoration",
      ],
    },
    {
      id: "2",
      name: "استاد مریم رضایی",
      name_en: "Prof. Maryam Rezaei",
      title: "متخصص هنر و تزئینات اسلامی",
      title_en: "Islamic Art and Decoration Specialist",
      bio: "کارشناس هنر اسلامی و تزئینات معماری با تمرکز بر هنر صفویه و قاجار",
      bio_en:
        "Islamic art and architectural decoration expert focusing on Safavid and Qajar art",
      specialties: ["هنر اسلامی", "تزئینات معماری", "کاشی‌کاری"],
      specialties_en: ["Islamic Art", "Architectural Decoration", "Tile Work"],
    },
    {
      id: "3",
      name: "دکتر رضا احمدی",
      name_en: "Dr. Reza Ahmadi",
      title: "مدرس طراحی و برنامه‌ریزی شهری",
      title_en: "Urban Design and Planning Instructor",
      bio: "متخصص طراحی شهری اسلامی و برنامه‌ریزی فضای شهری با رویکرد میراث فرهنگی",
      bio_en:
        "Islamic urban design and spatial planning specialist with cultural heritage approach",
      specialties: ["طراحی شهری", "میراث شهری", "فضای عمومی"],
      specialties_en: ["Urban Design", "Urban Heritage", "Public Space"],
    },
  ];

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "دانشجوی فارغ‌التحصیل",
      title_en: "Graduates",
      description: "در طول ۱۵ سال فعالیت",
      description_en: "Over 15 years of activity",
      icon: "🎓",
      number: "2500+",
    },
    {
      id: "2",
      title: "دوره تخصصی",
      title_en: "Specialized Courses",
      description: "در زمینه معماری و شهرسازی",
      description_en: "In architecture and urban planning",
      icon: "📚",
      number: "150+",
    },
    {
      id: "3",
      title: "پروژه پژوهشی",
      title_en: "Research Projects",
      description: "با همکاری دانشگاه‌ها و مراکز تحقیقاتی",
      description_en: "In collaboration with universities and research centers",
      icon: "🔬",
      number: "80+",
    },
    {
      id: "4",
      title: "کارگاه عملی",
      title_en: "Practical Workshops",
      description: "برای تقویت مهارت‌های عملی دانشجویان",
      description_en: "To enhance students' practical skills",
      icon: "🛠️",
      number: "300+",
    },
  ];

  const getLocalizedText = (fa: string, en?: string) => {
    return locale === "fa" ? fa : en || fa;
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {locale === "fa"
                ? "درباره مرکز معماری اسلامی"
                : "About Islamic Architecture Center"}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90">
              {locale === "fa"
                ? "مرکزی برای آموزش، پژوهش و ترویج معماری و هنر ایرانی-اسلامی در جهان معاصر"
                : "A center for education, research, and promotion of Iranian-Islamic architecture and art in the contemporary world"}
            </p>
          </div>
        </div>

        {/* Decorative Pattern */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-background"
          style={{
            clipPath: isRTL
              ? "polygon(0 100%, 100% 100%, 100% 0)"
              : "polygon(0 0, 100% 100%, 0 100%)",
          }}
        ></div>
      </div>

      {/* Mission & Vision Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text mb-8">
                {locale === "fa" ? "مأموریت ما" : "Our Mission"}
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-text-secondary leading-relaxed">
                  {locale === "fa"
                    ? "مرکز معماری اسلامی با هدف حفظ، توسعه و انتقال دانش معماری ایرانی-اسلامی به نسل‌های آینده تأسیس شده است. ما معتقدیم که معماری اسلامی نه تنها یک هنر زیبا، بلکه نمایانگر فرهنگ غنی و عمیق جهان اسلام است."
                    : "The Islamic Architecture Center was established with the goal of preserving, developing, and transmitting Iranian-Islamic architectural knowledge to future generations. We believe that Islamic architecture is not only a beautiful art but also represents the rich and profound culture of the Islamic world."}
                </p>
                <p className="text-lg text-text-secondary leading-relaxed">
                  {locale === "fa"
                    ? "از طریق دوره‌های آموزشی تخصصی، کارگاه‌های عملی و پروژه‌های پژوهشی، ما تلاش می‌کنیم تا معماران، طراحان و علاقه‌مندان را با اصول و تکنیک‌های معماری اسلامی آشنا کنیم."
                    : "Through specialized educational courses, practical workshops, and research projects, we strive to introduce architects, designers, and enthusiasts to the principles and techniques of Islamic architecture."}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                <div className="text-8xl opacity-20">🕌</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-background-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-square bg-gradient-to-br from-accent/10 to-primary/10 rounded-full flex items-center justify-center">
                <div className="text-8xl opacity-20">🎯</div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-text mb-8">
                {locale === "fa" ? "چشم‌انداز ما" : "Our Vision"}
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-text-secondary leading-relaxed">
                  {locale === "fa"
                    ? "تبدیل شدن به مرجع اصلی آموزش معماری اسلامی در خاورمیانه و جهان اسلام، و ایجاد پل ارتباطی میان معماری سنتی و نیازهای معاصر."
                    : "To become the leading center for Islamic architecture education in the Middle East and the Islamic world, creating a bridge between traditional architecture and contemporary needs."}
                </p>
                <p className="text-lg text-text-secondary leading-relaxed">
                  {locale === "fa"
                    ? "ما در تلاشیم تا معماری اسلامی را نه به عنوان یک میراث گذشته، بلکه به مثابه زبانی زنده و قابل تطبیق با نیازهای امروز معرفی کنیم."
                    : "We strive to introduce Islamic architecture not as a past heritage, but as a living language adaptable to today's needs."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics/Achievements Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text mb-4">
              {locale === "fa" ? "دستاوردهای ما" : "Our Achievements"}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {locale === "fa"
                ? "نگاهی به آمار و دستاوردهای مرکز در طول سال‌های فعالیت"
                : "A look at the center's statistics and achievements over the years"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="text-center p-6 bg-white rounded-lg shadow-sm border border-background-darkest"
              >
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {achievement.number}
                </div>
                <h3 className="font-semibold text-text mb-1">
                  {getLocalizedText(achievement.title, achievement.title_en)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {getLocalizedText(
                    achievement.description,
                    achievement.description_en,
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text mb-4">
              {locale === "fa" ? "تیم ما" : "Our Team"}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {locale === "fa"
                ? "اساتید و مدرسان مجرب در زمینه معماری و هنر اسلامی"
                : "Experienced professors and instructors in Islamic architecture and art"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-sm border border-background-darkest p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👨‍🏫</span>
                  </div>
                  <h3 className="text-xl font-bold text-text mb-1">
                    {getLocalizedText(member.name, member.name_en)}
                  </h3>
                  <p className="text-primary font-medium">
                    {getLocalizedText(member.title, member.title_en)}
                  </p>
                </div>

                <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                  {getLocalizedText(member.bio, member.bio_en)}
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-text">
                    {locale === "fa" ? "تخصص‌ها:" : "Specialties:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(locale === "fa"
                      ? member.specialties
                      : member.specialties_en || member.specialties
                    ).map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text mb-8">
                {locale === "fa" ? "تاریخچه مرکز" : "Our History"}
              </h2>
              <div className="space-y-6">
                <div className="border-r-4 border-primary pr-6 rtl:border-r-0 rtl:border-l-4 rtl:pr-0 rtl:pl-6">
                  <h3 className="text-xl font-semibold text-text mb-2">
                    {locale === "fa" ? "۲۰۰۸ - تأسیس" : "2008 - Establishment"}
                  </h3>
                  <p className="text-text-secondary">
                    {locale === "fa"
                      ? "مرکز معماری اسلامی با هدف ارتقای سطح دانش معماری ایرانی-اسلامی تأسیس شد."
                      : "The Islamic Architecture Center was established to enhance Iranian-Islamic architectural knowledge."}
                  </p>
                </div>

                <div className="border-r-4 border-accent pr-6 rtl:border-r-0 rtl:border-l-4 rtl:pr-0 rtl:pl-6">
                  <h3 className="text-xl font-semibold text-text mb-2">
                    {locale === "fa"
                      ? "۲۰۱۲ - گسترش فعالیت‌ها"
                      : "2012 - Expansion"}
                  </h3>
                  <p className="text-text-secondary">
                    {locale === "fa"
                      ? "افزایش دوره‌های آموزشی و شروع همکاری با دانشگاه‌های معتبر داخلی و خارجی."
                      : "Increased educational courses and began collaboration with reputable domestic and international universities."}
                  </p>
                </div>

                <div className="border-r-4 border-primary pr-6 rtl:border-r-0 rtl:border-l-4 rtl:pr-0 rtl:pl-6">
                  <h3 className="text-xl font-semibold text-text mb-2">
                    {locale === "fa"
                      ? "۲۰۱۸ - عصر دیجیتال"
                      : "2018 - Digital Era"}
                  </h3>
                  <p className="text-text-secondary">
                    {locale === "fa"
                      ? "راه‌اندازی پلتفرم آموزش آنلاین و ارائه دوره‌های مجازی به دانشجویان سراسر جهان."
                      : "Launch of online education platform and offering virtual courses to students worldwide."}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center">
                <div className="text-9xl opacity-20">🏛️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              {locale === "fa" ? "در تماس باشید" : "Get In Touch"}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {locale === "fa"
                ? "برای کسب اطلاعات بیشتر درباره دوره‌ها و برنامه‌های آموزشی با ما تماس بگیرید"
                : "Contact us for more information about courses and educational programs"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-background-darkest">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-semibold text-text mb-2">
                {locale === "fa" ? "ایمیل" : "Email"}
              </h3>
              <p className="text-text-secondary">info@irac.ac.ir</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-background-darkest">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-semibold text-text mb-2">
                {locale === "fa" ? "تلفن" : "Phone"}
              </h3>
              <p className="text-text-secondary">+98 21 1234 5678</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-background-darkest">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-semibold text-text mb-2">
                {locale === "fa" ? "آدرس" : "Address"}
              </h3>
              <p className="text-text-secondary">
                {locale === "fa"
                  ? "تهران، خیابان انقلاب"
                  : "Tehran, Enghelab Street"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`/${locale}/contact`}
              className="inline-block bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              {locale === "fa" ? "تماس با ما" : "Contact Us"}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">
            {locale === "fa"
              ? "آماده شروع یادگیری هستید؟"
              : "Ready to Start Learning?"}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {locale === "fa"
              ? "با ما در سفر شناخت و یادگیری معماری زیبای اسلامی همراه شوید"
              : "Join us on a journey to discover and learn beautiful Islamic architecture"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/courses`}
              className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              {locale === "fa" ? "مشاهده دوره‌ها" : "View Courses"}
            </Link>
            <Link
              href={`/${locale}/workshops`}
              className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold"
            >
              {locale === "fa" ? "کارگاه‌ها" : "Workshops"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
