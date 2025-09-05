import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import CourseLandingPage from "@/components/template/CourseLandingPage";

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

// Mock course data - In production, this would come from your API/database
const getCourseData = async (slug: string) => {
  // This is mock data - replace with actual API call
  const courses = {
    "islamic-architecture-fundamentals": {
      id: "1",
      slug: "islamic-architecture-fundamentals",
      title: "مبانی معماری اسلامی",
      description: "دوره جامع آموزش مبانی معماری اسلامی که شامل تاریخ، اصول طراحی، فلسفه معماری اسلامی و کاربرد آن در دنیای مدرن می‌باشد. این دوره برای تمام علاقه‌مندان به معماری و طراحی شهری طراحی شده است.",
      short_description: "آموزش کامل مبانی و اصول معماری اسلامی برای معماران و طراحان",
      price: {
        current: 4500000,
        original: 6000000,
        currency: "تومان"
      },
      instructor: {
        id: "inst_2",
        name: "دکتر فاطمه زهرایی",
        title: "دکترای معماری اسلامی، استاد دانشگاه هنر",
        bio: "دکتر فاطمه زهرایی متخصص برجسته در زمینه معماری اسلامی با بیش از 25 سال تجربه تدریس و پژوهش است. وی نویسنده چندین کتاب معتبر در زمینه معماری اسلامی و مشاور پروژه‌های بازسازی بناهای تاریخی می‌باشد.",
        image: "/images/instructors/zohraei.jpg",
        credentials: [
          "دکترای معماری اسلامی از دانشگاه هنر اسلامی",
          "استاد تمام دانشگاه هنر تهران",
          "مشاور وزارت میراث فرهنگی",
          "نویسنده 15 کتاب در زمینه معماری اسلامی"
        ],
        experience_years: 25,
        specializations: ["معماری اسلامی", "بناهای تاریخی", "فلسفه معماری"],
        rating: {
          score: 4.95,
          count: 342
        },
        total_students: 5240,
        total_courses: 8,
        social_links: {
          linkedin: "https://linkedin.com/in/zohraei-architect",
          website: "https://zohraei-architecture.com",
          email: "zohraei@irac.ir"
        },
        achievements: [
          "جایزه بهترین پژوهشگر معماری اسلامی 1400",
          "مدال افتخار UNESCO برای حفاظت از میراث",
          "رئیس انجمن معماری اسلامی ایران"
        ],
        languages: ["فارسی", "انگلیسی", "عربی"]
      },
      features: [
        "آموزش کامل تئوری و عمل",
        "پروژه‌های عملی کاربردی",
        "گواهینامه معتبر بین‌المللی",
        "دسترسی مادام‌العمر به مطالب"
      ],
      rating: {
        score: 4.9,
        count: 234
      },
      students_enrolled: 1456,
      duration_weeks: 12,
      duration_hours: 48,
      level: "Intermediate" as const,
      language: "فارسی",
      delivery_format: "online" as const,
      schedule_type: "instructor_led" as const,
      modules: [
        {
          id: "module_1",
          title: "تاریخ معماری اسلامی",
          description: "بررسی تکامل معماری اسلامی از آغاز تا دوران معاصر",
          duration: "8 ساعت",
          lessons: [
            {
              id: "lesson_1_1",
              title: "آغاز معماری اسلامی",
              duration: "45 دقیقه",
              type: "video",
              free_preview: true
            },
            {
              id: "lesson_1_2",
              title: "دوران امویان و عباسیان",
              duration: "60 دقیقه",
              type: "video"
            },
            {
              id: "lesson_1_3",
              title: "معماری ایران در دوران اسلامی",
              duration: "75 دقیقه",
              type: "video"
            },
            {
              id: "lesson_1_4",
              title: "تمرین و بررسی نمونه‌ها",
              duration: "30 دقیقه",
              type: "assignment"
            }
          ],
          learning_objectives: [
            "درک تاریخچه و سیر تحول معماری اسلامی",
            "شناخت سبک‌های مختلف معماری اسلامی",
            "آنالیز بناهای مهم در دوران‌های مختلف"
          ],
          resources: [
            {
              name: "کتاب تاریخ معماری اسلامی",
              type: "pdf",
              size: "25 MB"
            },
            {
              name: "نقشه‌های تاریخی",
              type: "pdf",
              size: "15 MB"
            }
          ]
        },
        {
          id: "module_2",
          title: "اصول طراحی در معماری اسلامی",
          description: "یادگیری اصول بنیادین طراحی و ترکیب‌بندی",
          duration: "10 ساعت",
          lessons: [
            {
              id: "lesson_2_1",
              title: "هندسه مقدس در معماری",
              duration: "90 دقیقه",
              type: "video"
            },
            {
              id: "lesson_2_2",
              title: "تناسبات و ریتم",
              duration: "75 دقیقه",
              type: "video"
            },
            {
              id: "lesson_2_3",
              title: "فضا و نور در معماری اسلامی",
              duration: "80 دقیقه",
              type: "video"
            },
            {
              id: "lesson_2_4",
              title: "پروژه طراحی عملی",
              duration: "90 دقیقه",
              type: "assignment"
            }
          ],
          learning_objectives: [
            "تسلط بر اصول هندسی معماری اسلامی",
            "درک مفهوم فضای معنوی",
            "کاربرد اصول در طراحی‌های معاصر"
          ]
        },
        {
          id: "module_3",
          title: "عناصر تزیینی و هنری",
          description: "مطالعه کاشی‌کاری، خوشنویسی و دیگر عناصر تزیینی",
          duration: "12 ساعت",
          lessons: [
            {
              id: "lesson_3_1",
              title: "هنر کاشی‌کاری اسلامی",
              duration: "90 دقیقه",
              type: "video"
            },
            {
              id: "lesson_3_2",
              title: "خوشنویسی در معماری",
              duration: "75 دقیقه",
              type: "video"
            },
            {
              id: "lesson_3_3",
              title: "نقوش هندسی و گیاهی",
              duration: "85 دقیقه",
              type: "video"
            },
            {
              id: "lesson_3_4",
              title: "مینیاتور و نگارگری",
              duration: "60 دقیقه",
              type: "video"
            },
            {
              id: "lesson_3_5",
              title: "پروژه نهایی",
              duration: "120 دقیقه",
              type: "assignment"
            }
          ],
          learning_objectives: [
            "آشنایی با انواع هنرهای تزیینی",
            "درک کاربرد هنر در معماری",
            "طراحی عناصر تزیینی مناسب"
          ]
        },
        {
          id: "module_4",
          title: "معماری اسلامی معاصر",
          description: "بررسی تطبیق اصول سنتی با نیازهای مدرن",
          duration: "18 ساعت",
          lessons: [
            {
              id: "lesson_4_1",
              title: "چالش‌های معماری معاصر",
              duration: "60 دقیقه",
              type: "video"
            },
            {
              id: "lesson_4_2",
              title: "نمونه‌های موفق جهانی",
              duration: "90 دقیقه",
              type: "video"
            },
            {
              id: "lesson_4_3",
              title: "تکنولوژی و معماری اسلامی",
              duration: "75 دقیقه",
              type: "video"
            },
            {
              id: "lesson_4_4",
              title: "پایداری در معماری اسلامی",
              duration: "80 دقیقه",
              type: "video"
            },
            {
              id: "lesson_4_5",
              title: "وبینار زنده با استاد",
              duration: "90 دقیقه",
              type: "live"
            },
            {
              id: "lesson_4_6",
              title: "پروژه کاپستون",
              duration: "180 دقیقه",
              type: "assignment"
            }
          ],
          learning_objectives: [
            "درک چالش‌های معماری معاصر",
            "یادگیری روش‌های تطبیق سنت و مدرنیته",
            "ارائه راه‌حل‌های خلاقانه"
          ]
        }
      ],
      what_you_learn: [
        "تاریخچه کامل معماری اسلامی از آغاز تا کنون",
        "اصول هندسی و فلسفی طراحی اسلامی",
        "تکنیک‌های سنتی ساخت و تزیین",
        "کاربرد اصول اسلامی در معماری معاصر",
        "تحلیل و نقد آثار معماری اسلامی",
        "طراحی پروژه‌های الهام‌گرفته از سنت"
      ],
      prerequisites: [
        "آشنایی پایه با تاریخ هنر و معماری",
        "علاقه‌مندی به فرهنگ و تمدن اسلامی",
        "مهارت پایه در استفاده از کامپیوتر"
      ],
      tools_required: [
        "کامپیوتر یا تبلت",
        "نرم‌افزار AutoCAD (اختیاری)",
        "SketchBook یا Photoshop",
        "دسترسی پایدار به اینترنت"
      ],
      career_paths: [
        "معماری تخصصی اسلامی",
        "مشاوره پروژه‌های فرهنگی",
        "پژوهشگری معماری",
        "طراحی بناهای مذهبی",
        "مرمت بناهای تاریخی",
        "تدریس دانشگاهی"
      ],
      background_image: "/images/courses/islamic-architecture-bg.jpg",
      gallery_images: [
        "/images/courses/islamic-arch-1.jpg",
        "/images/courses/islamic-arch-2.jpg",
        "/images/courses/islamic-arch-3.jpg",
        "/images/courses/islamic-arch-4.jpg"
      ],
      testimonials: [
        {
          id: "test_c1",
          name: "احمد موسوی",
          title: "معماری",
          company: "استودیو معماری ایرانی",
          content: "این دوره دیدگاه من را نسبت به معماری کاملاً تغییر داد. اکنون با اعتماد بیشتری پروژه‌های اسلامی طراحی می‌کنم.",
          rating: 5,
          date: "2024-01-25",
          verified: true,
          course_name: "مبانی معماری اسلامی"
        },
        {
          id: "test_c2",
          name: "زهرا حسینی",
          title: "دانشجوی دکترای معماری",
          company: "دانشگاه تهران",
          content: "محتوای بسیار غنی و استاد فوق‌العاده مسلط. برای پایان‌نامه‌ام بسیار مفید بود.",
          rating: 5,
          date: "2024-01-20",
          verified: true,
          course_name: "مبانی معماری اسلامی"
        },
        {
          id: "test_c3",
          name: "محمد کریمی",
          title: "مهندس معماری",
          content: "ترکیب عالی تئوری و عمل. پروژه‌های عملی واقعاً به درک بهتر مطالب کمک کرد.",
          rating: 4,
          date: "2024-01-18",
          verified: true,
          course_name: "مبانی معماری اسلامی"
        },
        {
          id: "test_c4",
          name: "فاطمه اکبری",
          title: "طراح داخلی",
          company: "استودیو طراحی سنتی",
          content: "حتی به عنوان طراح داخلی، این دوره برایم بسیار آموزنده بود. اصول یاد گرفته شده را در پروژه‌هایم به کار می‌برم.",
          rating: 5,
          date: "2024-01-15",
          verified: true,
          course_name: "مبانی معماری اسلامی"
        }
      ],
      faqs: [
        {
          id: "faq_c1",
          question: "آیا این دوره برای مبتدیان مناسب است؟",
          answer: "بله، دوره از مبانی شروع می‌شود و به تدریج پیشرفته می‌گردد. هیچ دانش تخصصی قبلی لازم نیست.",
          category: "سطح دوره",
          priority: 10,
          keywords: ["مبتدی", "پیش‌نیاز", "سطح"]
        },
        {
          id: "faq_c2",
          question: "آیا گواهینامه دریافت می‌کنم؟",
          answer: "بله، پس از تکمیل موفقیت‌آمیز تمام ماژول‌ها و پروژه‌ها، گواهینامه معتبری از ایراک دریافت خواهید کرد.",
          category: "گواهینامه",
          priority: 9,
          keywords: ["گواهی", "مدرک", "certificate"]
        },
        {
          id: "faq_c3",
          question: "چه مدت زمان برای تکمیل دوره نیاز است؟",
          answer: "دوره 12 هفته طول می‌کشد که هر هفته 4 ساعت زمان نیاز دارد. البته می‌توانید در زمان خود پیش بروید.",
          category: "زمان‌بندی",
          priority: 8,
          keywords: ["مدت", "زمان", "هفته"]
        },
        {
          id: "faq_c4",
          question: "آیا بعد از پایان دوره همچنان به مطالب دسترسی دارم؟",
          answer: "بله، دسترسی به تمام مطالب دوره مادام‌العمر خواهد بود و آپدیت‌های جدید نیز اضافه می‌شود.",
          category: "دسترسی",
          priority: 7,
          keywords: ["دسترسی", "مادام‌العمر", "آپدیت"]
        },
        {
          id: "faq_c5",
          question: "آیا امکان تعامل با استاد وجود دارد؟",
          answer: "بله، جلسات زنده ماهانه، فروم سؤال و جواب، و امکان ارسال پیام مستقیم به استاد فراهم است.",
          category: "پشتیبانی",
          priority: 6,
          keywords: ["استاد", "سؤال", "تعامل"]
        }
      ],
      certificates: ["گواهینامه تکمیل دوره", "گواهی تخصصی معماری اسلامی"],
      guarantee: "ضمانت بازگشت وجه تا 30 روز پس از شروع دوره",
      support_info: "پشتیبانی آنلاین 24/7 و دسترسی به انجمن دانشجویان",
      access_duration: "مادام‌العمر",
      completion_certificate: true,
      downloadable_resources: true,
      mobile_access: true,
      community_access: true,
      start_date: "2024-02-20T08:00:00Z",
      enrollment_deadline: "2024-02-15T23:59:59Z"
    },
    // Add more mock courses as needed
    "modern-architectural-design": {
      id: "2",
      slug: "modern-architectural-design",
      title: "Modern Architectural Design Principles",
      description: "Comprehensive course on contemporary architectural design principles, sustainable architecture, and digital design tools. Learn to create innovative, functional, and aesthetically pleasing architectural solutions for modern challenges.",
      short_description: "Master contemporary architectural design with cutting-edge techniques and sustainable practices.",
      price: {
        current: 5500000,
        original: 7500000,
        currency: "تومان"
      },
      instructor: {
        id: "inst_3",
        name: "Dr. Sarah Johnson",
        title: "PhD in Architecture, Sustainability Expert",
        bio: "Dr. Sarah Johnson is an internationally renowned architect and sustainability consultant with over 15 years of experience in modern architectural design and green building practices.",
        image: "/images/instructors/johnson.jpg",
        credentials: [
          "PhD in Architecture from MIT",
          "LEED AP BD+C Certified",
          "Principal Architect at Green Design Studio",
          "Author of 'Sustainable Architecture for the Future'"
        ],
        experience_years: 15,
        specializations: ["Sustainable Design", "Modern Architecture", "Digital Design Tools"],
        rating: {
          score: 4.85,
          count: 189
        },
        total_students: 3240,
        total_courses: 6,
        social_links: {
          linkedin: "https://linkedin.com/in/sarah-johnson-architect",
          website: "https://greendesignstudio.com",
          email: "johnson@irac.ir"
        },
        achievements: [
          "Winner of Green Building Design Award 2022",
          "Featured in Architectural Digest",
          "TEDx Speaker on Sustainable Architecture"
        ],
        languages: ["English", "Persian"]
      },
      features: [
        "Latest design software training",
        "Sustainable architecture focus",
        "International case studies",
        "Industry mentorship program"
      ],
      rating: {
        score: 4.8,
        count: 156
      },
      students_enrolled: 892,
      duration_weeks: 16,
      duration_hours: 64,
      level: "Advanced" as const,
      language: "English",
      delivery_format: "hybrid" as const,
      schedule_type: "cohort_based" as const,
      modules: [
        {
          id: "module_m1",
          title: "Foundations of Modern Architecture",
          description: "Understanding contemporary architectural movements and principles",
          duration: "12 hours",
          lessons: [
            {
              id: "lesson_m1_1",
              title: "Introduction to Modern Architecture",
              duration: "90 minutes",
              type: "video",
              free_preview: true
            },
            {
              id: "lesson_m1_2",
              title: "Bauhaus and Modernism",
              duration: "75 minutes",
              type: "video"
            },
            {
              id: "lesson_m1_3",
              title: "Contemporary Movements",
              duration: "80 minutes",
              type: "video"
            },
            {
              id: "lesson_m1_4",
              title: "Analysis Assignment",
              duration: "60 minutes",
              type: "assignment"
            }
          ],
          learning_objectives: [
            "Understand key principles of modern architecture",
            "Analyze contemporary architectural movements",
            "Identify influential architects and their works"
          ]
        }
        // Additional modules would be added here
      ],
      what_you_learn: [
        "Contemporary architectural design principles",
        "Sustainable building practices and green design",
        "Digital design tools (AutoCAD, Revit, SketchUp)",
        "Building Information Modeling (BIM)",
        "Project management in architecture",
        "Client presentation and communication skills"
      ],
      prerequisites: [
        "Basic knowledge of architectural principles",
        "Familiarity with computer-aided design",
        "Bachelor's degree in Architecture or related field (preferred)"
      ],
      tools_required: [
        "AutoCAD 2024",
        "Revit Architecture",
        "SketchUp Pro",
        "Adobe Creative Suite",
        "High-performance computer"
      ],
      career_paths: [
        "Senior Architectural Designer",
        "Sustainability Consultant",
        "BIM Manager",
        "Design Director",
        "Green Building Specialist",
        "Architectural Visualization Expert"
      ],
      background_image: "/images/courses/modern-design-bg.jpg",
      testimonials: [],
      faqs: [],
      certificates: ["Advanced Modern Architecture Certificate", "Sustainable Design Specialist"],
      guarantee: "30-day money-back guarantee",
      support_info: "24/7 technical support and weekly office hours",
      access_duration: "2 Years",
      completion_certificate: true,
      downloadable_resources: true,
      mobile_access: true,
      community_access: true,
      start_date: "2024-03-01T09:00:00Z",
      enrollment_deadline: "2024-02-25T23:59:59Z"
    }
  };

  return courses[slug as keyof typeof courses] || null;
};

export async function generateMetadata({
  params: { locale, slug },
}: PageProps): Promise<Metadata> {
  const course = await getCourseData(slug);

  if (!course) {
    return {
      title: "Course Not Found",
      description: "The requested course could not be found.",
    };
  }

  const t = await getTranslations({ locale, namespace: "courseLanding" });

  return {
    title: `${course.title} | ${t("meta.title")}`,
    description: course.short_description,
    keywords: [
      course.title,
      "دوره",
      "course",
      "معماری",
      "architecture",
      "آموزش",
      "education",
      "ایراک",
      "IRAC",
      ...course.features,
      ...course.instructor.specializations,
      ...course.career_paths
    ].join(", "),
    authors: [{ name: course.instructor.name }],
    openGraph: {
      title: course.title,
      description: course.short_description,
      type: "website",
      locale: locale,
      siteName: "IRAC - Islamic Revolution Architecture Center",
      images: course.background_image ? [
        {
          url: course.background_image,
          width: 1200,
          height: 630,
          alt: course.title,
        }
      ] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.short_description,
      images: course.background_image ? [course.background_image] : undefined,
    },
    alternates: {
      canonical: `/${locale}/courses/${slug}/landing`,
      languages: {
        fa: `/fa/courses/${slug}/landing`,
        en: `/en/courses/${slug}/landing`,
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

export default async function CourseLandingPageRoute({
  params: { locale, slug }
}: PageProps) {
  // Validate locale
  if (!["fa", "en"].includes(locale)) {
    notFound();
  }

  // Get course data
  const course = await getCourseData(slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <CourseLandingPage
        course={course}
        locale={locale}
        isPreview={false}
      />
    </div>
  );
}

// Generate static params for known courses
export async function generateStaticParams() {
  // In production, this would fetch from your API/database
  const courseSlugs = [
    "islamic-architecture-fundamentals",
    "modern-architectural-design",
    "interior-design-mastery",
    "landscape-architecture",
    "sustainable-design",
  ];

  const locales = ["fa", "en"];

  return courseSlugs.flatMap((slug) =>
    locales.map((locale) => ({
      locale,
      slug,
    }))
  );
}
