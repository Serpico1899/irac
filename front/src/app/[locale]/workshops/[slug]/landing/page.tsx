import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import WorkshopLandingPage from "@/components/template/WorkshopLandingPage";

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

// Mock workshop data - In production, this would come from your API/database
const getWorkshopData = async (slug: string) => {
  // This is mock data - replace with actual API call
  const workshops = {
    "architectural-sketching": {
      id: "1",
      slug: "architectural-sketching",
      title: "Advanced Architectural Sketching Workshop",
      description: "Master the art of architectural sketching with professional techniques used by renowned architects worldwide. Learn to communicate your design ideas effectively through powerful visual sketches that capture both technical precision and artistic expression.",
      short_description: "Learn professional architectural sketching techniques from industry experts in this hands-on workshop.",
      price: {
        current: 2500000,
        original: 3000000,
        currency: "تومان"
      },
      instructor: {
        id: "inst_1",
        name: "استاد محمد حسینی",
        title: "معماری ارشد و مدرس دانشگاه",
        bio: "استاد محمد حسینی با بیش از 20 سال تجربه در زمینه معماری و طراحی، یکی از برجسته‌ترین مدرسان کشور در حوزه طراحی معماری است. وی فارغ‌التحصیل دانشگاه تهران و دارای مدرک دکترای معماری از دانشگاه شهید بهشتی می‌باشد.",
        image: "/images/instructors/hosseini.jpg",
        credentials: [
          "دکترای معماری از دانشگاه شهید بهشتی",
          "عضو نظام مهندسی ساختمان",
          "مدرس دانشگاه‌های تهران و شهید بهشتی",
          "طراح بیش از 100 پروژه معماری"
        ],
        experience_years: 20,
        specializations: ["طراحی معماری", "اسکیس و طراحی", "معماری اسلامی"],
        rating: {
          score: 4.9,
          count: 156
        },
        total_students: 2340,
        total_courses: 15,
        social_links: {
          linkedin: "https://linkedin.com/in/hosseini-architect",
          email: "hosseini@irac.ir"
        },
        achievements: [
          "جایزه بهترین مدرس سال 1401",
          "نویسنده کتاب 'اصول طراحی معماری'",
          "برنده مسابقه معماری آسیا 2019"
        ],
        languages: ["فارسی", "انگلیسی"]
      },
      features: [
        "آموزش تکنیک‌های حرفه‌ای اسکیس",
        "کارگاه عملی و تعاملی",
        "ارائه گواهی معتبر",
        "پشتیبانی مادام‌العمر"
      ],
      rating: {
        score: 4.8,
        count: 89
      },
      students_enrolled: 245,
      duration: "8 ساعت (2 روز)",
      level: "Intermediate" as const,
      language: "فارسی",
      location: "مرکز آموزش ایراک، تهران",
      capacity: 25,
      schedule: {
        start_date: "2024-02-15T09:00:00Z",
        end_date: "2024-02-16T17:00:00Z",
        sessions: [
          {
            id: "session_1",
            title: "مبانی اسکیس معماری",
            description: "آشنایی با ابزارها، تکنیک‌های پایه و اصول ترسیم",
            duration: "4 ساعت",
            learning_objectives: [
              "آشنایی با ابزارهای اسکیس",
              "تسلط بر تکنیک‌های خطی",
              "درک اصول تناسب و مقیاس"
            ]
          },
          {
            id: "session_2",
            title: "تکنیک‌های پیشرفته",
            description: "سایه‌زنی، بافت‌دهی و جزئیات معماری",
            duration: "4 ساعت",
            learning_objectives: [
              "تسلط بر سایه‌زنی حرفه‌ای",
              "ایجاد بافت در نقاشی",
              "ترسیم جزئیات معماری"
            ]
          }
        ]
      },
      what_you_learn: [
        "تکنیک‌های حرفه‌ای اسکیس با مداد و راپید",
        "اصول سایه‌زنی و ایجاد عمق در طراحی",
        "نحوه ترسیم جزئیات معماری با دقت",
        "روش‌های سریع طراحی ایده‌های معماری",
        "استفاده از رنگ در اسکیس‌های معماری",
        "ترکیب تکنیک‌های سنتی و مدرن"
      ],
      prerequisites: [
        "علاقه‌مندی به طراحی و هنر",
        "آشنایی اولیه با اصول طراحی (مقدماتی)",
        "آوردن ابزار شخصی طراحی"
      ],
      materials_included: [
        "کیت کامل ابزار اسکیس",
        "کتابچه تمرینات عملی",
        "نمونه طراحی‌های استاد",
        "گواهی شرکت در کارگاه",
        "دسترسی به ویدیوهای آموزشی تکمیلی",
        "عضویت در گروه تلگرام پشتیبانی"
      ],
      background_image: "/images/workshops/sketching-bg.jpg",
      gallery_images: [
        "/images/workshops/sketching-1.jpg",
        "/images/workshops/sketching-2.jpg",
        "/images/workshops/sketching-3.jpg"
      ],
      testimonials: [
        {
          id: "test_1",
          name: "سارا احمدی",
          title: "دانشجوی معماری",
          company: "دانشگاه علم و صنعت",
          content: "این کارگاه واقعاً چشم‌اندازم را نسبت به اسکیس تغییر داد. روش‌های آموزشی استاد بسیار عملی و کاربردی بود.",
          rating: 5,
          date: "2024-01-15",
          verified: true,
          workshop_name: "کارگاه اسکیس معماری"
        },
        {
          id: "test_2",
          name: "علی رضایی",
          title: "معماری",
          company: "استودیو طراحی نوین",
          content: "تکنیک‌هایی که در این کارگاه یاد گرفتم، کیفیت طراحی‌هایم را به شدت بهبود داد. پیشنهاد می‌کنم.",
          rating: 5,
          date: "2024-01-20",
          verified: true,
          workshop_name: "کارگاه اسکیس معماری"
        },
        {
          id: "test_3",
          name: "مریم کریمی",
          title: "طراح داخلی",
          content: "استاد بسیار مسلط و صبور بود. همه نکات عملی را به خوبی آموزش داد.",
          rating: 4,
          date: "2024-01-10",
          verified: true,
          workshop_name: "کارگاه اسکیس معماری"
        }
      ],
      faqs: [
        {
          id: "faq_1",
          question: "آیا نیاز به تجربه قبلی در طراحی دارم؟",
          answer: "خیر، این کارگاه برای افراد با سطوح مختلف طراحی شده است. تنها نیاز به علاقه‌مندی و انگیزه برای یادگیری دارید.",
          category: "شرایط شرکت",
          priority: 10
        },
        {
          id: "faq_2",
          question: "ابزار طراحی در کارگاه ارائه می‌شود؟",
          answer: "بله، تمام ابزارهای مورد نیاز شامل مداد، کاغذ، راپید و سایر لوازم در کیت کارگاه گنجانده شده است.",
          category: "امکانات",
          priority: 9
        },
        {
          id: "faq_3",
          question: "آیا گواهی دریافت می‌کنم؟",
          answer: "بله، پس از شرکت موفق در کارگاه، گواهی معتبری از مرکز ایراک دریافت خواهید کرد.",
          category: "گواهی",
          priority: 8
        },
        {
          id: "faq_4",
          question: "امکان لغو ثبت‌نام وجود دارد؟",
          answer: "تا 48 ساعت قبل از شروع کارگاه می‌توانید ثبت‌نام را لغو کرده و 100% وجه را دریافت کنید.",
          category: "قوانین",
          priority: 7
        }
      ],
      certificates: ["گواهی شرکت در کارگاه", "گواهی تکمیل دوره"],
      guarantee: "ضمانت بازگشت وجه 100% در صورت عدم رضایت",
      support_info: "پشتیبانی 24/7 از طریق تلگرام و ایمیل"
    },
    // Add more mock workshops as needed
  };

  return workshops[slug as keyof typeof workshops] || null;
};

export async function generateMetadata({
  params: { locale, slug },
}: PageProps): Promise<Metadata> {
  const workshop = await getWorkshopData(slug);

  if (!workshop) {
    return {
      title: "Workshop Not Found",
      description: "The requested workshop could not be found.",
    };
  }

  const t = await getTranslations({ locale, namespace: "workshopLanding" });

  return {
    title: `${workshop.title} | ${t("meta.title")}`,
    description: workshop.short_description,
    keywords: [
      workshop.title,
      "کارگاه",
      "workshop",
      "معماری",
      "architecture",
      "آموزش",
      "training",
      "ایراک",
      "IRAC",
      ...workshop.features,
      ...workshop.instructor.specializations
    ].join(", "),
    authors: [{ name: workshop.instructor.name }],
    openGraph: {
      title: workshop.title,
      description: workshop.short_description,
      type: "website",
      locale: locale,
      siteName: "IRAC - Islamic Revolution Architecture Center",
      images: workshop.background_image ? [
        {
          url: workshop.background_image,
          width: 1200,
          height: 630,
          alt: workshop.title,
        }
      ] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: workshop.title,
      description: workshop.short_description,
      images: workshop.background_image ? [workshop.background_image] : undefined,
    },
    alternates: {
      canonical: `/${locale}/workshops/${slug}/landing`,
      languages: {
        fa: `/fa/workshops/${slug}/landing`,
        en: `/en/workshops/${slug}/landing`,
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
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  };
}

export default async function WorkshopLandingPageRoute({
  params: { locale, slug }
}: PageProps) {
  // Validate locale
  if (!["fa", "en"].includes(locale)) {
    notFound();
  }

  // Get workshop data
  const workshop = await getWorkshopData(slug);

  if (!workshop) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <WorkshopLandingPage
        workshop={workshop}
        locale={locale}
        isPreview={false}
      />
    </div>
  );
}

// Generate static params for known workshops
export async function generateStaticParams() {
  // In production, this would fetch from your API/database
  const workshopSlugs = [
    "architectural-sketching",
    "islamic-architecture",
    "3d-modeling",
    "interior-design",
    "landscape-architecture",
  ];

  const locales = ["fa", "en"];

  return workshopSlugs.flatMap((slug) =>
    locales.map((locale) => ({
      locale,
      slug,
    }))
  );
}
