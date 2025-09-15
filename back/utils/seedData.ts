import {
  coreApp,
  user,
  category,
  tag,
  course,
  product,
  article,
  order,
  scoring_transaction,
  user_level,
  referral,
  booking,
  wallet,
  wallet_transaction,
} from "../mod.ts";

// Master Data Seeding System for IRAC
// This file provides comprehensive seed data for all major entities

interface SeedResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface TransactionData {
  orders: any[];
  walletTransactions: any[];
}

interface ScoringData {
  scoringTransactions: any[];
  userLevels: any[];
}

interface CategoryTagData {
  categories: any[];
  tags: any[];
}

interface SeedingSummary {
  success_count: number;
  error_count: number;
  total_entities: number;
  duration_ms: number;
  operations_completed: string[];
  errors: string[];
}

interface MasterSeedResults {
  success: boolean;
  data?: {
    summary: SeedingSummary;
    users?: SeedResult<any[]>;
    categories?: SeedResult<CategoryTagData>;
    courses?: SeedResult<any[]>;
    articles?: SeedResult<any[]>;
    products?: SeedResult<any>;
    transactions?: SeedResult<TransactionData>;
    scoring?: SeedResult<ScoringData>;
    referrals?: SeedResult<any[]>;
    bookings?: SeedResult<any[]>;
  };
  error?: string;
}

export class MasterDataSeeder {

  // User data seeding
  static async seedUsers(clearExisting = false): Promise<SeedResult<any[]>> {
    try {
      console.log("🫂 Seeding users...");

      if (clearExisting) {
        await user.deleteMany({});
        console.log("  Cleared existing users");
      }

      const users = [
        // Admin users
        {
          firstname: "علی",
          lastname: "احمدی",
          email: "admin@irac.ir",
          phone: "09121234567",
          level: "Manager",
          is_verified: true,
          bio: "مدیر کل مرکز معماری ایرانی",
          expertise: ["معماری اسلامی", "مدیریت"],
          profile_image: "/images/profiles/admin1.jpg"
        },
        {
          firstname: "Sara",
          lastname: "Johnson",
          email: "sarah.admin@irac.ir",
          phone: "09127654321",
          level: "Editor",
          is_verified: true,
          bio: "International Programs Manager",
          expertise: ["International Education", "Program Management"],
          profile_image: "/images/profiles/admin2.jpg"
        },

        // Regular users with diverse backgrounds
        {
          firstname: "محمد",
          lastname: "کریمی",
          email: "mohammad.karimi@example.com",
          phone: "09123456789",
          level: "Ordinary",
          is_verified: true,
          bio: "دانشجوی معماری و علاقه‌مند به معماری سنتی ایران",
          expertise: ["معماری", "طراحی"],
          profile_image: "/images/profiles/user1.jpg"
        },
        {
          firstname: "فاطمه",
          lastname: "محمودی",
          email: "fateme.mahmoudi@example.com",
          phone: "09134567890",
          level: "Ordinary",
          is_verified: true,
          bio: "معمار و پژوهشگر در زمینه معماری پایدار",
          expertise: ["معماری پایدار", "طراحی شهری"],
          profile_image: "/images/profiles/user2.jpg"
        },
        {
          firstname: "David",
          lastname: "Chen",
          email: "david.chen@example.com",
          phone: "09145678901",
          level: "Ordinary",
          is_verified: true,
          bio: "Architect specializing in cross-cultural design",
          expertise: ["Cross-cultural Architecture", "Sustainable Design"],
          profile_image: "/images/profiles/user3.jpg"
        },
        {
          firstname: "آیدا",
          lastname: "نوری",
          email: "aida.nouri@example.com",
          phone: "09156789012",
          level: "Ordinary",
          is_verified: true,
          bio: "دانشجوی دکترای معماری و تاریخ هنر اسلامی",
          expertise: ["تاریخ معماری", "هنر اسلامی"],
          profile_image: "/images/profiles/user4.jpg"
        },
        {
          firstname: "James",
          lastname: "Wilson",
          email: "james.wilson@example.com",
          phone: "09167890123",
          level: "Ordinary",
          is_verified: true,
          bio: "International student of Islamic Architecture",
          expertise: ["Islamic Architecture", "Cultural Studies"],
          profile_image: "/images/profiles/user5.jpg"
        }
      ];

      const createdUsers: any[] = [];
      for (const userData of users) {
        try {
          const newUser = await user.insertOne({
            doc: {
              ...userData,
              created_at: new Date(),
              updated_at: new Date(),
            }
          });
          createdUsers.push(newUser as any);
        } catch (error) {
          console.error(`Failed to create user ${userData.email}:`, error);
        }
      }

      console.log(`  ✅ Created ${createdUsers.length} users`);
      return { success: true, data: createdUsers };
    } catch (error) {
      console.error("Error seeding users:", error);
      return { success: false, error: error.message };
    }
  }

  // Category and Tag seeding
  static async seedCategoriesAndTags(clearExisting = false): Promise<SeedResult<CategoryTagData>> {
    try {
      console.log("🏷️ Seeding categories and tags...");

      if (clearExisting) {
        await category.deleteMany({});
        await tag.deleteMany({});
        console.log("  Cleared existing categories and tags");
      }

      // Categories
      const categories = [
        {
          name: "معماری اسلامی",
          name_en: "Islamic Architecture",
          description: "دوره‌های آموزشی و محتوای مربوط به معماری اسلامی",
          description_en: "Courses and content related to Islamic Architecture",
          slug: "islamic-architecture",
          type: "course",
          is_active: true
        },
        {
          name: "معماری مدرن",
          name_en: "Modern Architecture",
          description: "معماری معاصر و مدرن",
          description_en: "Contemporary and Modern Architecture",
          slug: "modern-architecture",
          type: "course",
          is_active: true
        },
        {
          name: "کتب معماری",
          name_en: "Architecture Books",
          description: "کتب تخصصی در زمینه معماری",
          description_en: "Specialized architecture books",
          slug: "architecture-books",
          type: "product",
          is_active: true
        },
        {
          name: "آثار هنری",
          name_en: "Artworks",
          description: "آثار هنری و دست‌سازه‌های معماری",
          description_en: "Artworks and architectural handicrafts",
          slug: "artworks",
          type: "product",
          is_active: true
        },
        {
          name: "محتوای دیجیتال",
          name_en: "Digital Content",
          description: "فایل‌های دیجیتال و منابع آموزشی",
          description_en: "Digital files and educational resources",
          slug: "digital-content",
          type: "product",
          is_active: true
        },
        {
          name: "کارگاه‌ها",
          name_en: "Workshops",
          description: "کارگاه‌های عملی و تخصصی",
          description_en: "Practical and specialized workshops",
          slug: "workshops",
          type: "workshop",
          is_active: true
        }
      ];

      const createdCategories: any[] = [];
      for (const catData of categories) {
        try {
          const newCat = await category.insertOne({
            doc: {
              ...catData,
              created_at: new Date(),
              updated_at: new Date(),
            }
          });
          createdCategories.push(newCat as any);
        } catch (error) {
          console.error(`Failed to create category ${catData.name}:`, error);
        }
      }

      // Tags
      const tags = [
        { name: "هندسه اسلامی", name_en: "Islamic Geometry", color: "#3B82F6" },
        { name: "خوشنویسی", name_en: "Calligraphy", color: "#EF4444" },
        { name: "طراحی پایدار", name_en: "Sustainable Design", color: "#10B981" },
        { name: "تاریخ معماری", name_en: "Architecture History", color: "#F59E0B" },
        { name: "شهرسازی", name_en: "Urban Planning", color: "#8B5CF6" },
        { name: "مرمت", name_en: "Restoration", color: "#F97316" },
        { name: "فناوری در معماری", name_en: "Technology in Architecture", color: "#06B6D4" },
        { name: "معماری ایرانی", name_en: "Persian Architecture", color: "#EC4899" },
        { name: "طراحی داخلی", name_en: "Interior Design", color: "#84CC16" },
        { name: "BIM", name_en: "Building Information Modeling", color: "#6366F1" }
      ];

      const createdTags: any[] = [];
      for (const tagData of tags) {
        try {
          const newTag = await tag.insertOne({
            doc: {
              ...tagData,
              created_at: new Date(),
              updated_at: new Date(),
            }
          });
          createdTags.push(newTag as any);
        } catch (error) {
          console.error(`Failed to create tag ${tagData.name}:`, error);
        }
      }

      console.log(`  ✅ Created ${createdCategories.length} categories and ${createdTags.length} tags`);
      return {
        success: true,
        data: {
          categories: createdCategories,
          tags: createdTags
        }
      };
    } catch (error) {
      console.error("Error seeding categories and tags:", error);
      return { success: false, error: error.message };
    }
  }

  // Course seeding
  static async seedCourses(clearExisting = false): Promise<SeedResult<any[]>> {
    try {
      console.log("🎓 Seeding courses...");

      if (clearExisting) {
        await course.deleteMany({});
        console.log("  Cleared existing courses");
      }

      const courses = [
        {
          title: "مبانی معماری اسلامی",
          title_en: "Islamic Architecture Fundamentals",
          slug: "islamic-architecture-fundamentals",
          description: "دوره جامع آموزش مبانی و اصول معماری اسلامی شامل هندسه، نمادشناسی و عناصر تزیینی",
          description_en: "Comprehensive course on Islamic architecture fundamentals including geometry, symbolism and decorative elements",
          price: 2500000,
          discounted_price: 2000000,
          currency: "IRR",
          duration_weeks: 8,
          level: "beginner",
          language: "fa",
          format: "online",
          is_featured: true,
          is_published: true,
          instructor_name: "دکتر علی احمدی",
          instructor_name_en: "Dr. Ali Ahmadi",
          thumbnail: "/images/courses/islamic-fundamentals.jpg",
          rating: 4.8,
          students_count: 234,
          syllabus: [
            "مقدمه‌ای بر معماری اسلامی",
            "اصول هندسه اسلامی",
            "عناصر تزیینی و نمادها",
            "مواد و تکنیک‌های ساخت",
            "مطالعه موردی: مساجد تاریخی"
          ]
        },
        {
          title: "طراحی معماری مدرن",
          title_en: "Modern Architectural Design",
          slug: "modern-architectural-design",
          description: "آموزش اصول و تکنیک‌های طراحی معماری مدرن با تمرکز بر نوآوری و پایداری",
          description_en: "Learn modern architectural design principles and techniques with focus on innovation and sustainability",
          price: 3000000,
          discounted_price: 2500000,
          currency: "IRR",
          duration_weeks: 10,
          level: "intermediate",
          language: "fa",
          format: "hybrid",
          is_featured: true,
          is_published: true,
          instructor_name: "سارا جانسون",
          instructor_name_en: "Sarah Johnson",
          thumbnail: "/images/courses/modern-design.jpg",
          rating: 4.7,
          students_count: 189,
          syllabus: [
            "مبانی طراحی مدرن",
            "استفاده از تکنولوژی در طراحی",
            "اصول پایداری",
            "طراحی فضایی و عملکردی",
            "پروژه نهایی"
          ]
        },
        {
          title: "BIM و مدل‌سازی اطلاعات ساختمان",
          title_en: "BIM and Building Information Modeling",
          slug: "bim-building-information-modeling",
          description: "آموزش کاربردی نرم‌افزارهای BIM برای مدل‌سازی و مدیریت پروژه‌های معماری",
          description_en: "Practical training on BIM software for architectural project modeling and management",
          price: 3500000,
          discounted_price: 3000000,
          currency: "IRR",
          duration_weeks: 12,
          level: "advanced",
          language: "fa",
          format: "online",
          is_featured: false,
          is_published: true,
          instructor_name: "محمد کریمی",
          instructor_name_en: "Mohammad Karimi",
          thumbnail: "/images/courses/bim-course.jpg",
          rating: 4.6,
          students_count: 156,
          syllabus: [
            "مقدمه‌ای بر BIM",
            "آموزش Revit پایه",
            "مدل‌سازی سه‌بعدی",
            "مدیریت پروژه با BIM",
            "تجزیه و تحلیل و خروجی‌گیری"
          ]
        },
        {
          title: "تاریخ معماری ایران",
          title_en: "History of Persian Architecture",
          slug: "history-persian-architecture",
          description: "بررسی تحول معماری ایران از دوران باستان تا معاصر",
          description_en: "Survey of Persian architectural evolution from ancient times to contemporary",
          price: 2000000,
          discounted_price: 1500000,
          currency: "IRR",
          duration_weeks: 6,
          level: "beginner",
          language: "fa",
          format: "online",
          is_featured: false,
          is_published: true,
          instructor_name: "آیدا نوری",
          instructor_name_en: "Aida Nouri",
          thumbnail: "/images/courses/persian-history.jpg",
          rating: 4.9,
          students_count: 298,
          syllabus: [
            "معماری دوران هخامنشی",
            "معماری دوران اشکانی و ساسانی",
            "معماری اسلامی اولیه",
            "معماری دوران صفویه",
            "معماری معاصر ایران"
          ]
        },
        {
          title: "International Architecture Program",
          title_en: "International Architecture Program",
          slug: "international-architecture-program",
          description: "Comprehensive program for international students covering Persian and Islamic architecture",
          description_en: "Comprehensive program for international students covering Persian and Islamic architecture",
          price: 5000000,
          discounted_price: 4500000,
          currency: "IRR",
          duration_weeks: 16,
          level: "intermediate",
          language: "en",
          format: "hybrid",
          is_featured: true,
          is_published: true,
          instructor_name: "Sarah Johnson",
          instructor_name_en: "Sarah Johnson",
          thumbnail: "/images/courses/international-program.jpg",
          rating: 4.8,
          students_count: 87,
          syllabus: [
            "Introduction to Persian Architecture",
            "Islamic Architectural Principles",
            "Contemporary Iranian Architecture",
            "Cross-cultural Design Methods",
            "Final Capstone Project"
          ]
        }
      ];

      const createdCourses: any[] = [];
      for (const courseData of courses) {
        try {
          const newCourse = await course.insertOne({
            doc: {
              ...courseData,
              created_at: new Date(),
              updated_at: new Date(),
            }
          });
          createdCourses.push(newCourse as any);
        } catch (error) {
          console.error(`Failed to create course ${courseData.title}:`, error);
        }
      }

      console.log(`  ✅ Created ${createdCourses.length} courses`);
      return { success: true, data: createdCourses };
    } catch (error) {
      console.error("Error seeding courses:", error);
      return { success: false, error: error.message };
    }
  }

  // Article seeding
  static async seedArticles(clearExisting = false): Promise<SeedResult<any[]>> {
    try {
      console.log("📰 Seeding articles...");

      if (clearExisting) {
        await article.deleteMany({});
        console.log("  Cleared existing articles");
      }

      const articles = [
        {
          title: "نقش هندسه در معماری اسلامی",
          title_en: "The Role of Geometry in Islamic Architecture",
          slug: "geometry-islamic-architecture",
          content: "هندسه یکی از مهم‌ترین عناصر معماری اسلامی است که نه تنها جنبه زیبایی‌شناختی دارد بلکه حامل مفاهیم عمیق فلسفی و عرفانی نیز می‌باشد. در این مقاله به بررسی نقش هندسه در معماری اسلامی خواهیم پرداخت...",
          content_en: "Geometry is one of the most important elements of Islamic architecture that not only has aesthetic aspects but also carries deep philosophical and mystical concepts...",
          excerpt: "بررسی نقش و اهمیت هندسه در آثار معماری اسلامی",
          excerpt_en: "Exploring the role and importance of geometry in Islamic architectural works",
          author_name: "دکتر علی احمدی",
          author_name_en: "Dr. Ali Ahmadi",
          featured_image: "/images/articles/geometry-islamic.jpg",
          is_published: true,
          is_featured: true,
          reading_time: 8,
          views_count: 1250,
          language: "fa"
        },
        {
          title: "معماری پایدار در اقلیم گرم و خشک",
          title_en: "Sustainable Architecture in Hot-Dry Climate",
          slug: "sustainable-architecture-hot-dry-climate",
          content: "با توجه به چالش‌های اقلیمی و محیط زیستی، معماری پایدار در مناطق گرم و خشک اهمیت ویژه‌ای یافته است. در این مقاله راهکارهای سنتی و مدرن را بررسی می‌کنیم...",
          content_en: "Given the climatic and environmental challenges, sustainable architecture in hot and dry regions has gained special importance...",
          excerpt: "راهکارهای معماری پایدار برای اقلیم گرم و خشک",
          excerpt_en: "Sustainable architectural solutions for hot and dry climates",
          author_name: "فاطمه محمودی",
          author_name_en: "Fateme Mahmoudi",
          featured_image: "/images/articles/sustainable-design.jpg",
          is_published: true,
          is_featured: false,
          reading_time: 12,
          views_count: 890,
          language: "fa"
        },
        {
          title: "Digital Tools in Modern Architecture",
          title_en: "Digital Tools in Modern Architecture",
          slug: "digital-tools-modern-architecture",
          content: "The integration of digital tools in architectural practice has revolutionized the way architects design, visualize, and construct buildings. From BIM software to AI-assisted design...",
          content_en: "The integration of digital tools in architectural practice has revolutionized the way architects design, visualize, and construct buildings...",
          excerpt: "How digital technology is transforming architectural practice",
          excerpt_en: "How digital technology is transforming architectural practice",
          author_name: "David Chen",
          author_name_en: "David Chen",
          featured_image: "/images/articles/digital-tools.jpg",
          is_published: true,
          is_featured: true,
          reading_time: 10,
          views_count: 1540,
          language: "en"
        },
        {
          title: "احیای معماری سنتی ایران",
          title_en: "Revival of Traditional Persian Architecture",
          slug: "revival-traditional-persian-architecture",
          content: "در دهه‌های اخیر، احیای معماری سنتی ایران به عنوان راهکاری برای حفظ هویت فرهنگی و ایجاد معماری متناسب با اقلیم و فرهنگ محلی مطرح شده است...",
          content_en: "In recent decades, the revival of traditional Persian architecture has emerged as a solution for preserving cultural identity...",
          excerpt: "بررسی روند احیای معماری سنتی در ایران معاصر",
          excerpt_en: "Examining the revival of traditional architecture in contemporary Iran",
          author_name: "آیدا نوری",
          author_name_en: "Aida Nouri",
          featured_image: "/images/articles/traditional-revival.jpg",
          is_published: true,
          is_featured: false,
          reading_time: 15,
          views_count: 2100,
          language: "fa"
        },
        {
          title: "Cross-Cultural Architecture Education",
          title_en: "Cross-Cultural Architecture Education",
          slug: "cross-cultural-architecture-education",
          content: "Architecture education in a globalized world requires understanding different cultural approaches to space, form, and function. This article explores methodologies for cross-cultural architectural learning...",
          content_en: "Architecture education in a globalized world requires understanding different cultural approaches to space, form, and function...",
          excerpt: "Exploring methodologies for international architectural education",
          excerpt_en: "Exploring methodologies for international architectural education",
          author_name: "James Wilson",
          author_name_en: "James Wilson",
          featured_image: "/images/articles/cross-cultural.jpg",
          is_published: true,
          is_featured: false,
          reading_time: 9,
          views_count: 670,
          language: "en"
        }
      ];

      const createdArticles: any[] = [];
      for (const articleData of articles) {
        try {
          const newArticle = await article.insertOne({
            doc: {
              ...articleData,
              created_at: new Date(),
              updated_at: new Date(),
            }
          });
          createdArticles.push(newArticle as any);
        } catch (error) {
          console.error(`Failed to create article ${articleData.title}:`, error);
        }
      }

      console.log(`  ✅ Created ${createdArticles.length} articles`);
      return { success: true, data: createdArticles };
    } catch (error) {
      console.error("Error seeding articles:", error);
      return { success: false, error: error.message };
    }
  }

  // Sample order and transaction seeding
  static async seedTransactions(clearExisting: boolean, users: any[], courses: any[], products: any[]): Promise<SeedResult<TransactionData>> {
    try {
      console.log("💰 Seeding orders and transactions...");

      if (clearExisting) {
        await order.deleteMany({});
        await wallet_transaction.deleteMany({});
        console.log("  Cleared existing orders and wallet transactions");
      }

      const orders: any[] = [];
      const walletTransactions: any[] = [];

      // Create sample orders for different users
      for (let i = 0; i < Math.min(users.length - 2, 5); i++) { // Skip admin users
        const user = users[i + 2];
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        const randomProduct = products && products.length > 0 ? products[Math.floor(Math.random() * products.length)] : null;

        // Create course order
        if (randomCourse) {
          const courseOrder = await order.insertOne({
            doc: {
              user: user._id,
              type: "course",
              status: "completed",
              payment_method: "zarinpal",
              payment_status: "paid",
              items: [{
                course: randomCourse._id,
                title: randomCourse.title,
                price: randomCourse.price || 2000000,
                quantity: 1,
                total_price: randomCourse.price || 2000000
              }],
              subtotal: randomCourse.price || 2000000,
              total_amount: randomCourse.price || 2000000,
              currency: "IRR",
              payment_reference: `PAY_${Date.now()}_${i}`,
              created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              updated_at: new Date()
            }
          });
          orders.push(courseOrder as any);
        }

        // Create product order
        if (randomProduct) {
          const productOrder = await order.insertOne({
            doc: {
              user: user._id,
              type: "product",
              status: "completed",
              payment_method: "wallet",
              payment_status: "paid",
              items: [{
                product: randomProduct._id,
                title: randomProduct.title,
                price: randomProduct.price || 500000,
                quantity: 1,
                total_price: randomProduct.price || 500000
              }],
              subtotal: randomProduct.price || 500000,
              total_amount: randomProduct.price || 500000,
              currency: "IRR",
              created_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
              updated_at: new Date()
            }
          });
          orders.push(productOrder as any);

          // Create corresponding wallet transaction
          const walletTx = await wallet_transaction.insertOne({
            doc: {
              user: user._id,
              type: "withdraw",
              amount: randomProduct.price || 500000,
              description: `خرید ${randomProduct.title}`,
              reference_type: "order",
              reference_id: productOrder._id.toString(),
              status: "completed",
              created_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
              updated_at: new Date()
            }
          });
          walletTransactions.push(walletTx as any);
        }
      }

      console.log(`  ✅ Created ${orders.length} orders and ${walletTransactions.length} wallet transactions`);
      return { success: true, data: { orders, walletTransactions } };
    } catch (error) {
      console.error("Error seeding transactions:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Scoring and achievement seeding
  static async seedScoringData(clearExisting: boolean, users: any[], orders: any[]): Promise<SeedResult<ScoringData>> {
    try {
      console.log("🏆 Seeding scoring data and achievements...");

      if (clearExisting) {
        await scoring_transaction.deleteMany({});
        await user_level.deleteMany({});
        console.log("  Cleared existing scoring transactions and user levels");
      }

      const scoringTransactions: any[] = [];
      const userLevels: any[] = [];

      // Create scoring data for regular users (skip admin users)
      for (let i = 2; i < users.length; i++) {
        const user = users[i];
        let totalPoints = 0;

        // Award points for purchases
        const userOrders = orders.filter(order => order.user.toString() === user._id.toString());
        for (const order of userOrders) {
          const points = Math.floor((order.total_amount || 0) / 10000); // 1 point per 10,000 IRR
          const scoring = await scoring_transaction.insertOne({
            doc: {
              user: user._id,
              points: points,
              action: "purchase",
              description: `Points for purchasing ${order.items?.[0]?.title || 'item'}`,
              reference_type: "order",
              reference_id: order._id.toString(),
              status: "completed",
              created_at: order.created_at,
              updated_at: new Date()
            }
          });
          scoringTransactions.push(scoring as any);
          totalPoints += points;
        }

        // Award bonus points for profile completion
        const profileBonus = 50;
        const profileScoring = await scoring_transaction.insertOne({
          doc: {
            user: user._id,
            points: profileBonus,
            action: "profile_complete",
            description: "Profile completion bonus",
            status: "completed",
            created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
            updated_at: new Date()
          }
        });
        scoringTransactions.push(profileScoring as any);
        totalPoints += profileBonus;

        // Award daily login points (random past logins)
        const loginDays = Math.floor(Math.random() * 10) + 1;
        for (let day = 0; day < loginDays; day++) {
          const loginPoints = 5;
          const loginScoring = await scoring_transaction.insertOne({
            doc: {
              user: user._id,
              points: loginPoints,
              action: "daily_login",
              description: `Daily login bonus`,
              status: "completed",
              created_at: new Date(Date.now() - day * 24 * 60 * 60 * 1000),
              updated_at: new Date()
            }
          });
          scoringTransactions.push(loginScoring as any);
          totalPoints += loginPoints;
        }

        // Calculate level and achievements
        const level = Math.floor(totalPoints / 500) + 1;
        const achievements: string[] = [];

        if (userOrders.length > 0) achievements.push("first_purchase");
        if (totalPoints >= 100) achievements.push("level_up_5");
        if (loginDays >= 7) achievements.push("daily_login_streak_7");
        if (level >= 5) achievements.push("level_up_5");

        // Create user level record
        const userLevel = await user_level.insertOne({
          doc: {
            user: user._id,
            current_points: totalPoints,
            total_lifetime_points: totalPoints,
            level: level,
            achievements: achievements,
            achievement_count: achievements.length,
            points_to_next_level: 500 - (totalPoints % 500),
            level_progress_percentage: Math.round(((totalPoints % 500) / 500) * 100),
            last_points_earned_at: new Date(),
            total_purchases: userOrders.length,
            total_logins: loginDays,
            daily_login_streak: loginDays,
            max_daily_login_streak: loginDays,
            points_from_purchases: totalPoints - profileBonus - (loginDays * 5),
            points_from_activities: profileBonus + (loginDays * 5),
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        userLevels.push(userLevel as any);
      }

      console.log(`  ✅ Created ${scoringTransactions.length} scoring transactions and ${userLevels.length} user levels`);
      return { success: true, data: { scoringTransactions, userLevels } };
    } catch (error) {
      console.error("Error seeding scoring data:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Referral seeding
  static async seedReferrals(users: any[] = []): Promise<SeedResult<any[]>> {
    try {
      console.log("🔗 Seeding referrals...");

      const referrals: any[] = [];

      // Create some referral relationships
      for (let i = 2; i < Math.min(users.length - 1, 5); i++) {
        const referrer = users[i];
        const referee = users[i + 1];

        if (referrer && referee) {
          const referralCode = `ARCH-${referrer._id.toString().slice(-6)}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;

          const newReferral = await referral.insertOne({
            doc: {
              referrer: referrer._id,
              referee: referee._id,
              referral_code: referralCode,
              status: "completed",
              commission_rate: 20,
              commission_earned: 100000,
              commission_status: "paid",
              first_purchase_amount: 500000,
              total_purchase_amount: 500000,
              purchase_count: 1,
              registered_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              first_purchase_at: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
              completed_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
              rewarded_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
              group_size: 1,
              is_verified: true,
              fraud_check_status: "passed",
              click_count: Math.floor(Math.random() * 50) + 5,
              conversion_rate: 20,
              created_at: new Date(Date.now() - Math.random() * 35 * 24 * 60 * 60 * 1000),
              updated_at: new Date()
            }
          });
          referrals.push(newReferral as any);
        }
      }

      console.log(`  ✅ Created ${referrals.length} referral records`);
      return { success: true, data: referrals };
    } catch (error) {
      console.error("Error seeding referrals:", error);
      return { success: false, error: error.message };
    }
  }

  // Sample bookings seeding
  static async seedBookings(users: any[] = []): Promise<SeedResult<any[]>> {
    try {
      console.log("📅 Seeding bookings...");

      const bookings: any[] = [];
      const spaceTypes = ["private_office", "shared_desk", "meeting_room", "workshop_space"];

      for (let i = 2; i < Math.min(users.length, 6); i++) {
        const user = users[i];
        const spaceType = spaceTypes[Math.floor(Math.random() * spaceTypes.length)];
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30) + 1);

        const pricing = {
          private_office: 500000,
          shared_desk: 200000,
          meeting_room: 300000,
          workshop_space: 400000
        };

        const newBooking = await booking.insertOne({
          doc: {
            booking_number: `BK${Date.now().toString().slice(-6)}${i}`,
            booking_id: `booking_${user._id}_${Date.now()}`,
            space_type: spaceType,
            space_name: `${spaceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} #${i}`,
            booking_date: bookingDate,
            start_time: "09:00",
            end_time: "17:00",
            duration_hours: 8,
            capacity_requested: Math.floor(Math.random() * 5) + 1,
            status: ["confirmed", "completed", "pending"][Math.floor(Math.random() * 3)],
            payment_status: ["paid", "pending"][Math.floor(Math.random() * 2)],
            hourly_rate: pricing[spaceType] / 8,
            total_hours: 8,
            base_price: pricing[spaceType],
            total_price: pricing[spaceType],
            currency: "IRR",
            customer_name: `${user.firstname} ${user.lastname}`,
            customer_email: user.email,
            customer_phone: user.phone,
            purpose: ["Meeting", "Workshop", "Training", "Presentation"][Math.floor(Math.random() * 4)],
            user: user._id,
            created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
            updated_at: new Date()
          }
        });
        bookings.push(newBooking as any);
      }

      console.log(`  ✅ Created ${bookings.length} bookings`);
      return { success: true, data: bookings };
    } catch (error) {
      console.error("Error seeding bookings:", error);
      return { success: false, error: error.message };
    }
  }

  // Master seeding function
  static async seedAll(options: {
    clearExisting?: boolean,
    includeTransactions?: boolean,
    includeScoring?: boolean,
    includeReferrals?: boolean,
    includeBookings?: boolean
  } = {}): Promise<MasterSeedResults> {
    try {
      console.log("🚀 Starting master data seeding...");
      const startTime = Date.now();

      const {
        clearExisting = false,
        includeTransactions = true,
        includeScoring = true,
        includeReferrals = true,
        includeBookings = true
      } = options;

      const resultData = {
        users: undefined as SeedResult<any[]> | undefined,
        categories: undefined as SeedResult<CategoryTagData> | undefined,
        courses: undefined as SeedResult<any[]> | undefined,
        articles: undefined as SeedResult<any[]> | undefined,
        products: undefined as SeedResult<any> | undefined,
        transactions: undefined as SeedResult<TransactionData> | undefined,
        scoring: undefined as SeedResult<ScoringData> | undefined,
        referrals: undefined as SeedResult<any[]> | undefined,
        bookings: undefined as SeedResult<any[]> | undefined,
        summary: {
          success_count: 0,
          error_count: 0,
          total_entities: 0,
          duration_ms: 0,
          operations_completed: [],
          errors: []
        }
      };

      // Step 1: Seed users (foundation for all other data)
      console.log("\n=== PHASE 1: Foundation Data ===");
      resultData.users = await this.seedUsers(clearExisting);
      if (resultData.users && resultData.users.success) {
        resultData.summary.success_count++;
        resultData.summary.total_entities += resultData.users.data?.length || 0;
      } else {
        resultData.summary.error_count++;
      }

      // Step 2: Seed categories and tags
      resultData.categories = await this.seedCategoriesAndTags(clearExisting);
      if (resultData.categories && resultData.categories.success) {
        resultData.summary.success_count++;
        resultData.summary.total_entities += (resultData.categories.data?.categories?.length || 0) + (resultData.categories.data?.tags?.length || 0);
      } else {
        resultData.summary.error_count++;
      }

      // Step 3: Seed content (courses, articles)
      console.log("\n=== PHASE 2: Content Data ===");
      resultData.courses = await this.seedCourses(clearExisting);
      if (resultData.courses && resultData.courses.success) {
        resultData.summary.success_count++;
        resultData.summary.total_entities += resultData.courses.data?.length || 0;
      } else {
        resultData.summary.error_count++;
      }

      resultData.articles = await this.seedArticles(clearExisting);
      if (resultData.articles && resultData.articles.success) {
        resultData.summary.success_count++;
        resultData.summary.total_entities += resultData.articles.data?.length || 0;
      } else {
        resultData.summary.error_count++;
      }

      // Step 4: Seed products (if exists)
      console.log("\n=== PHASE 3: E-commerce Data ===");
      try {
        const { productSeeder } = await import("../src/product/seedProducts.ts");
        resultData.products = await productSeeder.seedProducts(clearExisting);
        if (resultData.products && resultData.products.success) {
          resultData.summary.success_count++;
          resultData.summary.total_entities += (resultData.products.data?.success_count || resultData.products.data?.length || 0);
        } else {
          resultData.summary.error_count++;
        }
      } catch (error) {
        console.log("  ⚠️  Product seeder not available or failed");
        resultData.summary.error_count++;
      }

      // Step 5: Seed transactional data
      if (includeTransactions && resultData.users && resultData.users.success) {
        console.log("\n=== PHASE 4: Transactional Data ===");
        resultData.transactions = await this.seedTransactions(
          clearExisting,
          resultData.users?.data || [],
          resultData.courses?.data || [],
          resultData.products?.data || []
        );
        if (resultData.transactions && resultData.transactions.success) {
          resultData.summary.success_count++;
          resultData.summary.total_entities += (resultData.transactions.data?.orders?.length || 0) + (resultData.transactions.data?.walletTransactions?.length || 0);
        } else {
          resultData.summary.error_count++;
        }

        // Step 6: Seed scoring and achievements
        if (includeScoring) {
          const transactions = resultData.transactions?.data?.orders || [];
          resultData.scoring = await this.seedScoringData(
            clearExisting,
            resultData.users?.data || [],
            transactions
          );
          if (resultData.scoring && resultData.scoring.success) {
            resultData.summary.success_count++;
            resultData.summary.total_entities += (resultData.scoring.data?.scoringTransactions?.length || 0) + (resultData.scoring.data?.userLevels?.length || 0);
          } else {
            resultData.summary.error_count++;
          }
        }

        // Step 7: Seed referrals
        if (includeReferrals) {
          console.log("\n=== PHASE 5: User Engagement Data ===");
          resultData.referrals = await this.seedReferrals(resultData.users?.data || []);
          if (resultData.referrals && resultData.referrals.success) {
            resultData.summary.success_count++;
            resultData.summary.total_entities += resultData.referrals.data?.length || 0;
          } else {
            resultData.summary.error_count++;
          }
        }

        // Step 8: Seed bookings
        if (includeBookings) {
          resultData.bookings = await this.seedBookings(resultData.users?.data || []);
          if (resultData.bookings && resultData.bookings.success) {
            resultData.summary.success_count++;
            resultData.summary.total_entities += resultData.bookings.data?.length || 0;
          } else {
            resultData.summary.error_count++;
          }
        }
      }

      // Calculate final summary
      const endTime = Date.now();
      resultData.summary.duration_ms = endTime - startTime;

      console.log("\n🎉 =========================");
      console.log("   SEEDING COMPLETED!");
      console.log("🎉 =========================");
      console.log(`📊 Total entities created: ${resultData.summary.total_entities}`);
      console.log(`✅ Successful operations: ${resultData.summary.success_count}`);
      console.log(`❌ Failed operations: ${resultData.summary.error_count}`);
      console.log(`⏱️  Total duration: ${Math.round(resultData.summary.duration_ms / 1000)}s`);
      console.log("=========================\n");

      return {
        success: resultData.summary.error_count < resultData.summary.success_count,
        data: resultData
      };

    } catch (error) {
      console.error("Error in master seeding:", error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}

// Export the seeder
export const masterSeeder = MasterDataSeeder;
