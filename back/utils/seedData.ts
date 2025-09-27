import { 
  coreApp,
  user,
  category,
  tag,
  course,
  article,
  booking,
  wallet,
  wallet_transaction,
  order,
  invoice,
  coupon,
  file,
  enrollment,
 } from "@app";

// Interfaces for seed results
interface SeedResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  created: number;
  errors: number;
}

interface CategoryTagData {
  categories: any[];
  tags: any[];
}

export class MasterDataSeeder {
  // Utility functions for generating realistic data
  private static getRandomPersianName() {
    const firstNames = [
      "علی", "محمد", "حسین", "احمد", "مهدی", "رضا", "حسن", "عباس", "جواد", "امیر",
      "فاطمه", "زهرا", "مریم", "خدیجه", "عایشه", "زینب", "سکینه", "معصومه", "طاهره", "نرگس"
    ];
    const lastNames = [
      "احمدی", "محمدی", "حسینی", "رضایی", "کریمی", "نوری", "صادقی", "طاهری", "موسوی", "هاشمی",
      "علوی", "فاطمی", "قاسمی", "یوسفی", "ابراهیمی", "اسماعیلی", "جعفری", "باقری", "تقوی", "شریفی"
    ];

    return {
      first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
      last_name: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
  }

  private static getRandomMobile() {
    const prefixes = ["0912", "0913", "0914", "0915", "0916", "0917", "0918", "0919"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return prefix + suffix;
  }

  private static getRandomNationalNumber() {
    return (Math.floor(Math.random() * 9000000000) + 1000000000).toString();
  }

  private static getRandomAddress() {
    const cities = ["تهران", "اصفهان", "شیراز", "مشهد", "کرج", "تبریز"];
    const streets = ["خیابان ولیعصر", "خیابان انقلاب", "خیابان آزادی", "خیابان فردوسی"];

    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 500) + 1;

    return `${city}، ${street}، پلاک ${number}`;
  }

  // Seed Users
  static async seedUsers(): Promise<SeedResult<any[]>> {
    try {
      console.log("👥 Seeding users...");

      const usersData = [
        // Admin Users
        {
          first_name: "علی",
          last_name: "احمدی",
          father_name: "محمد",
          mobile: "09121234567",
          gender: "Male",
          national_number: "1234567890",
          address: "تهران، خیابان ولیعصر، پلاک 123",
          level: "Manager",
          is_verified: true,
          summary: "مدیر کل مرکز معماری ایرانی",
          birth_date: new Date("1980-01-01"),
        },
        {
          first_name: "سارا",
          last_name: "محمدی",
          father_name: "حسین",
          mobile: "09127654321",
          gender: "Female",
          national_number: "1234567891",
          address: "تهران، خیابان انقلاب، پلاک 456",
          level: "Editor",
          is_verified: true,
          summary: "مدیر برنامه‌های آموزشی",
          birth_date: new Date("1985-03-15"),
        },
        {
          first_name: "محمد",
          last_name: "کریمی",
          father_name: "رضا",
          mobile: "09123456789",
          gender: "Male",
          national_number: "1234567892",
          address: "اصفهان، خیابان چهارباغ، پلاک 789",
          level: "Editor",
          is_verified: true,
          summary: "معمار و مدرس دانشگاه",
          birth_date: new Date("1982-07-22"),
        }
      ];

      // Add 20+ regular users
      for (let i = 0; i < 22; i++) {
        const name = this.getRandomPersianName();
        const fatherNames = ["احمد", "محمد", "علی", "حسن", "حسین", "رضا"];

        usersData.push({
          first_name: name.first_name,
          last_name: name.last_name,
          father_name: fatherNames[Math.floor(Math.random() * fatherNames.length)],
          mobile: this.getRandomMobile(),
          gender: Math.random() > 0.5 ? "Male" : "Female",
          national_number: (parseInt(this.getRandomNationalNumber()) + i).toString(),
          address: this.getRandomAddress(),
          level: "Ordinary",
          is_verified: Math.random() > 0.3,
          summary: "علاقه‌مند به معماری و طراحی",
          birth_date: new Date(1970 + Math.floor(Math.random() * 35), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        });
      }

      const createdUsers = [];
      let errorCount = 0;

      for (const userData of usersData) {
        try {
          const createdUser = await user.addOne({ set: userData, get: {} });
          createdUsers.push(createdUser);
          console.log(`  ✅ Created user: ${userData.first_name} ${userData.last_name} (${userData.level})`);
        } catch (error) {
          console.error(`  ❌ Failed to create user ${userData.first_name} ${userData.last_name}:`, error.message);
          errorCount++;
        }
      }

      console.log(`  🎉 Users seeded: ${createdUsers.length} created, ${errorCount} errors`);
      return {
        success: true,
        data: createdUsers,
        created: createdUsers.length,
        errors: errorCount,
        message: `Successfully created ${createdUsers.length} users`
      };

    } catch (error) {
      console.error("❌ Error seeding users:", error);
      return {
        success: false,
        error: error.message,
        created: 0,
        errors: 1
      };
    }
  }

  // Seed Categories and Tags
  static async seedCategoriesAndTags(): Promise<SeedResult<CategoryTagData>> {
    try {
      console.log("🏷️ Seeding categories and tags...");

      const categoriesData = [
        {
          name: "معماری اسلامی",
          description: "دوره‌ها و مطالب مرتبط با معماری اسلامی و سنتی ایران"
        },
        {
          name: "معماری معاصر",
          description: "معماری مدرن و معاصر با رویکرد نوین"
        },
        {
          name: "طراحی شهری",
          description: "برنامه‌ریزی و طراحی فضاهای شهری"
        },
        {
          name: "معماری پایدار",
          description: "ساخت و ساز سبز و معماری با رویکرد زیست محیطی"
        },
        {
          name: "مرمت و احیا",
          description: "مرمت بناهای تاریخی و احیای میراث معماری"
        },
        {
          name: "معماری داخلی",
          description: "طراحی فضاهای داخلی و دکوراسیون"
        },
        {
          name: "معماری منظر",
          description: "طراحی فضاهای سبز و محوطه‌سازی"
        },
        {
          name: "تکنولوژی ساخت",
          description: "تکنیک‌ها و تکنولوژی‌های نوین در ساخت و ساز"
        }
      ];

      const tagsData = [
        { name: "گنبد", description: "المان‌های گنبدی در معماری" },
        { name: "ایوان", description: "ایوان‌ها در معماری سنتی" },
        { name: "کاشی‌کاری", description: "هنر کاشی‌کاری در معماری" },
        { name: "پایداری", description: "رویکردهای پایدار در معماری" },
        { name: "BIM", description: "مدل‌سازی اطلاعات ساختمان" },
        { name: "AutoCAD", description: "نرم‌افزار طراحی معماری" },
        { name: "3D Modeling", description: "مدل‌سازی سه‌بعدی" },
        { name: "فضای سبز", description: "طراحی فضاهای سبز شهری" },
        { name: "نور طبیعی", description: "استفاده از نور طبیعی در طراحی" },
        { name: "مصالح بومی", description: "استفاده از مصالح محلی" },
        { name: "اقلیم گرم", description: "معماری مناسب اقلیم گرم" },
        { name: "حیاط مرکزی", description: "طراحی با حیاط مرکزی" },
        { name: "هندسه اسلامی", description: "کاربرد هندسه در معماری اسلامی" },
        { name: "مینیمالیسم", description: "سبک مینیمالیستی در طراحی" }
      ];

      const createdCategories = [];
      const createdTags = [];
      let errorCount = 0;

      // Create categories
      for (const categoryData of categoriesData) {
        try {
          const createdCategory = await category.addOne({ set: categoryData, get: {} });
          createdCategories.push(createdCategory);
          console.log(`  ✅ Created category: ${categoryData.name}`);
        } catch (error) {
          console.error(`  ❌ Failed to create category ${categoryData.name}:`, error.message);
          errorCount++;
        }
      }

      // Create tags
      for (const tagData of tagsData) {
        try {
          const createdTag = await tag.addOne({ set: tagData, get: {} });
          createdTags.push(createdTag);
          console.log(`  ✅ Created tag: ${tagData.name}`);
        } catch (error) {
          console.error(`  ❌ Failed to create tag ${tagData.name}:`, error.message);
          errorCount++;
        }
      }

      console.log(`  🎉 Categories & Tags seeded: ${createdCategories.length} categories, ${createdTags.length} tags`);
      return {
        success: true,
        data: {
          categories: createdCategories,
          tags: createdTags
        },
        created: createdCategories.length + createdTags.length,
        errors: errorCount,
        message: `Successfully created ${createdCategories.length} categories and ${createdTags.length} tags`
      };

    } catch (error) {
      console.error("❌ Error seeding categories and tags:", error);
      return {
        success: false,
        error: error.message,
        created: 0,
        errors: 1
      };
    }
  }

  // Seed Courses
  static async seedCourses(): Promise<SeedResult<any[]>> {
    try {
      console.log("📚 Seeding courses...");

      // Get existing users for relationships
      const existingUsers = await user.getMany({ get: {}, filter: {} });
      const instructors = existingUsers.filter((u: any) => u.level === "Manager" || u.level === "Editor");

      if (instructors.length === 0) {
        throw new Error("No instructor-level users found. Please seed users first.");
      }

      const coursesData = [
        {
          name: "مقدمه‌ای بر معماری اسلامی",
          name_en: "Introduction to Islamic Architecture",
          description: "دوره جامع آشنایی با اصول و مبانی معماری اسلامی شامل تاریخچه، سبک‌ها، و ویژگی‌های منحصر به فرد",
          description_en: "Comprehensive course on principles and foundations of Islamic architecture",
          short_description: "آشنایی با اصول معماری اسلامی",
          level: "Beginner",
          type: "Course",
          status: "Active",
          price: 2500000,
          original_price: 3000000,
          is_free: false,
          duration_weeks: 12,
          duration_hours: 48,
          max_students: 30,
          min_students: 5,
          start_date: new Date("2024-02-01"),
          end_date: new Date("2024-04-26"),
          registration_deadline: new Date("2024-01-25"),
          curriculum: JSON.stringify({
            modules: [
              { title: "تاریخچه معماری اسلامی", duration: 6 },
              { title: "عناصر معماری اسلامی", duration: 8 },
              { title: "سبک‌های مختلف", duration: 10 },
              { title: "مطالعه موردی", duration: 24 }
            ]
          }),
          prerequisites: "آشنایی اولیه با تاریخ هنر",
          learning_outcomes: "درک عمیق از اصول معماری اسلامی",
          instructor_name: "دکتر علی احمدی",
          instructor_bio: "استاد دانشگاه و متخصص معماری اسلامی با ۲۰ سال تجربه",
          average_rating: 4.7,
          total_reviews: 15,
          total_students: 0,
          slug: "intro-islamic-architecture",
          is_workshop: false,
          is_online: true,
          featured: true,
          sort_order: 1,
          completion_points: 100,
          certificate_enabled: true,
          total_certificates_issued: 0,
          total_certificates_revoked: 0
        },
        {
          name: "کارگاه طراحی با AutoCAD",
          name_en: "AutoCAD Design Workshop",
          description: "کارگاه عملی آموزش نرم‌افزار AutoCAD برای معماران و طراحان",
          short_description: "آموزش عملی AutoCAD",
          level: "Beginner",
          type: "Workshop",
          status: "Active",
          price: 1800000,
          original_price: 2200000,
          is_free: false,
          duration_weeks: 6,
          duration_hours: 30,
          max_students: 20,
          min_students: 8,
          start_date: new Date("2024-01-15"),
          end_date: new Date("2024-02-26"),
          registration_deadline: new Date("2024-01-10"),
          curriculum: JSON.stringify({
            modules: [
              { title: "آشنایی با محیط AutoCAD", duration: 6 },
              { title: "ابزارهای طراحی", duration: 8 },
              { title: "طراحی نقشه معماری", duration: 16 }
            ]
          }),
          prerequisites: "آشنایی اولیه با کامپیوتر",
          learning_outcomes: "تسلط بر طراحی نقشه‌های معماری با AutoCAD",
          instructor_name: "مهندس محمد کریمی",
          instructor_bio: "معمار با 15 سال تجربه در طراحی و آموزش",
          average_rating: 4.5,
          total_reviews: 8,
          total_students: 0,
          slug: "autocad-design-workshop",
          is_workshop: true,
          workshop_location: "سالن کامپیوتر مرکز IRAC",
          is_online: false,
          featured: true,
          sort_order: 2,
          completion_points: 80,
          certificate_enabled: true,
          total_certificates_issued: 0,
          total_certificates_revoked: 0
        },
        {
          name: "معماری پایدار و سبز",
          name_en: "Sustainable and Green Architecture",
          description: "دوره تخصصی معماری پایدار با تمرکز بر تکنولوژی‌های سبز",
          short_description: "اصول معماری پایدار",
          level: "Intermediate",
          type: "Course",
          status: "Active",
          price: 3200000,
          original_price: 4000000,
          is_free: false,
          duration_weeks: 16,
          duration_hours: 64,
          max_students: 25,
          min_students: 10,
          start_date: new Date("2024-03-01"),
          end_date: new Date("2024-06-21"),
          registration_deadline: new Date("2024-02-20"),
          curriculum: JSON.stringify({
            modules: [
              { title: "مبانی معماری پایدار", duration: 12 },
              { title: "انرژی‌های تجدیدپذیر", duration: 16 },
              { title: "مصالح سبز", duration: 12 },
              { title: "طراحی اقلیمی", duration: 24 }
            ]
          }),
          prerequisites: "دانش پایه معماری",
          learning_outcomes: "طراحی ساختمان‌های با کارایی انرژی بالا",
          instructor_name: "دکتر سارا محمدی",
          instructor_bio: "متخصص معماری پایدار",
          average_rating: 4.9,
          total_reviews: 22,
          total_students: 0,
          slug: "sustainable-green-architecture",
          is_workshop: false,
          is_online: true,
          featured: true,
          sort_order: 3,
          completion_points: 150,
          certificate_enabled: true,
          total_certificates_issued: 0,
          total_certificates_revoked: 0
        }
      ];

      const createdCourses = [];
      let errorCount = 0;

      for (const courseData of coursesData) {
        try {
          // Assign random instructor
          const randomInstructor = instructors[Math.floor(Math.random() * instructors.length)];
          const courseWithInstructor = {
            ...courseData,
            instructor: randomInstructor._id
          };

          const createdCourse = await course.addOne({
            set: courseWithInstructor,
            get: {}
          });

          createdCourses.push(createdCourse);
          console.log(`  ✅ Created course: ${courseData.name}`);
        } catch (error) {
          console.error(`  ❌ Failed to create course ${courseData.name}:`, error.message);
          errorCount++;
        }
      }

      console.log(`  🎉 Courses seeded: ${createdCourses.length} created, ${errorCount} errors`);
      return {
        success: true,
        data: createdCourses,
        created: createdCourses.length,
        errors: errorCount,
        message: `Successfully created ${createdCourses.length} courses`
      };

    } catch (error) {
      console.error("❌ Error seeding courses:", error);
      return {
        success: false,
        error: error.message,
        created: 0,
        errors: 1
      };
    }
  }

  // Seed Articles
  static async seedArticles(): Promise<SeedResult<any[]>> {
    try {
      console.log("📰 Seeding articles...");

      const articlesData = [
        {
          name: "نقش هندسه در معماری اسلامی",
          name_en: "The Role of Geometry in Islamic Architecture",
          description: "هندسه یکی از مهم‌ترین عناصر معماری اسلامی است که نه تنها جنبه زیبایی‌شناختی دارد بلکه حامل مفاهیم عمیق فلسفی و عرفانی نیز می‌باشد. در این مقاله به بررسی نقش هندسه در معماری اسلامی خواهیم پرداخت...",
          slug: "geometry-islamic-architecture",
          summary: "بررسی نقش و اهمیت هندسه در آثار معماری اسلامی",
          content: "محتوای کامل مقاله درباره هندسه در معماری اسلامی...",
          author_name: "دکتر علی احمدی",
          is_published: true,
          is_featured: true,
          reading_time_minutes: 8,
          views_count: 1250,
          likes_count: 45,
          average_rating: 4.8,
          total_reviews: 12
        },
        {
          name: "معماری پایدار در اقلیم گرم و خشک",
          name_en: "Sustainable Architecture in Hot-Dry Climate",
          description: "با توجه به چالش‌های اقلیمی و محیط زیستی، معماری پایدار در مناطق گرم و خشک اهمیت ویژه‌ای یافته است...",
          slug: "sustainable-architecture-hot-dry-climate",
          summary: "راهکارهای معماری پایدار برای اقلیم گرم و خشک",
          content: "محتوای کامل مقاله درباره معماری پایدار...",
          author_name: "دکتر سارا محمدی",
          is_published: true,
          is_featured: false,
          reading_time_minutes: 12,
          views_count: 890,
          likes_count: 32,
          average_rating: 4.6,
          total_reviews: 8
        },
        {
          name: "احیای معماری سنتی ایران",
          name_en: "Revival of Traditional Persian Architecture",
          description: "در دهه‌های اخیر، احیای معماری سنتی ایران به عنوان راهکاری برای حفظ هویت فرهنگی مطرح شده است...",
          slug: "revival-traditional-persian-architecture",
          summary: "بررسی روند احیای معماری سنتی در ایران معاصر",
          content: "محتوای کامل مقاله درباره احیای معماری سنتی...",
          author_name: "مهندس محمد کریمی",
          is_published: true,
          is_featured: false,
          reading_time_minutes: 15,
          views_count: 2100,
          likes_count: 78,
          average_rating: 4.9,
          total_reviews: 20
        }
      ];

      const createdArticles = [];
      let errorCount = 0;

      for (const articleData of articlesData) {
        try {
          const createdArticle = await article.addOne({ set: articleData, get: {} });
          createdArticles.push(createdArticle);
          console.log(`  ✅ Created article: ${articleData.name}`);
        } catch (error) {
          console.error(`  ❌ Failed to create article ${articleData.name}:`, error.message);
          errorCount++;
        }
      }

      console.log(`  🎉 Articles seeded: ${createdArticles.length} created, ${errorCount} errors`);
      return {
        success: true,
        data: createdArticles,
        created: createdArticles.length,
        errors: errorCount,
        message: `Successfully created ${createdArticles.length} articles`
      };

    } catch (error) {
      console.error("❌ Error seeding articles:", error);
      return {
        success: false,
        error: error.message,
        created: 0,
        errors: 1
      };
    }
  }

  // Seed Wallet Transactions
  static async seedTransactions(): Promise<SeedResult<any[]>> {
    try {
      console.log("💰 Seeding wallet transactions...");

      // Get existing users
      const existingUsers = await user.getMany({ get: {}, filter: {} });
      const regularUsers = existingUsers.filter((u: any) => u.level === "Ordinary");

      if (regularUsers.length === 0) {
        console.log("  ⚠️  No regular users found, skipping transactions");
        return {
          success: true,
          data: [],
          created: 0,
          errors: 0,
          message: "No users available for transactions"
        };
      }

      const createdTransactions = [];
      let errorCount = 0;

      // Create wallet transactions for random users
      for (let i = 0; i < Math.min(10, regularUsers.length); i++) {
        const randomUser = regularUsers[i];

        // Create charge transaction
        try {
          const chargeTransaction = await wallet_transaction.addOne({
            set: {
              user_id: randomUser._id,
              type: "deposit",
              amount: Math.floor(Math.random() * 5000000) + 1000000,
              status: "completed",
              description: "شارژ حساب کاربری",
              reference_id: `CHG_${Date.now()}_${i}`,
              gateway: "zarinpal",
              transaction_fee: 5000,
              net_amount: Math.floor(Math.random() * 5000000) + 995000,
              processed_at: new Date(),
              currency: "IRR"
            },
            get: {}
          });
          createdTransactions.push(chargeTransaction);
          console.log(`  ✅ Created charge transaction for user ${randomUser.first_name}`);
        } catch (error) {
          console.error(`  ❌ Failed to create transaction:`, error.message);
          errorCount++;
        }

        // Create withdrawal transaction
        if (Math.random() > 0.5) {
          try {
            const withdrawTransaction = await wallet_transaction.addOne({
              set: {
                user_id: randomUser._id,
                type: "withdrawal",
                amount: Math.floor(Math.random() * 2000000) + 500000,
                status: "completed",
                description: "خرید دوره آموزشی",
                reference_id: `WTH_${Date.now()}_${i}`,
                gateway: "wallet",
                transaction_fee: 0,
                net_amount: Math.floor(Math.random() * 2000000) + 500000,
                processed_at: new Date(),
                currency: "IRR"
              },
              get: {}
            });
            createdTransactions.push(withdrawTransaction);
            console.log(`  ✅ Created withdrawal transaction for user ${randomUser.first_name}`);
          } catch (error) {
            console.error(`  ❌ Failed to create withdrawal transaction:`, error.message);
            errorCount++;
          }
        }
      }

      console.log(`  🎉 Transactions seeded: ${createdTransactions.length} created, ${errorCount} errors`);
      return {
        success: true,
        data: createdTransactions,
        created: createdTransactions.length,
        errors: errorCount,
        message: `Successfully created ${createdTransactions.length} transactions`
      };

    } catch (error) {
      console.error("❌ Error seeding transactions:", error);
      return {
        success: false,
        error: error.message,
        created: 0,
        errors: 1
      };
    }
  }

  // Seed Scoring Data - placeholder for when model is available
  static async seedScoringData(): Promise<SeedResult<any[]>> {
    try {
      console.log("🏆 Seeding scoring data...");
      console.log("  ⚠️  Scoring model not yet implemented, skipping...");

      return {
        success: true,
        data: [],
        created: 0,
        errors: 0,
        message: "Scoring data seeding not implemented yet"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        created: 0,
        errors: 1
      };
    }
  }

  // Seed Referrals - placeholder for when model is available
  static async seedReferrals(): Promise<SeedResult<any[]>> {
    try {
      console.log("🤝 Seeding referrals...");
      console.log("  ⚠️  Referral model not yet implemented, skipping...");

      return {
        success: true,
        data: [],
        created: 0,
        errors: 0,
        message: "Referral data seeding not implemented yet"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        created: 0,
        errors: 1
      };
    }
  }

  // Seed Bookings
  static async seedBookings(): Promise<SeedResult<any[]>> {
    try {
      console.log("📅 Seeding bookings...");

      // Get existing users
      const existingUsers = await user.getMany({ get: {}, filter: {} });
      const regularUsers = existingUsers.filter((u: any) => u.level === "Ordinary");

      if (regularUsers.length === 0) {
        console.log("  ⚠️  No regular users found, skipping bookings");
        return {
          success: true,
          data: [],
          created: 0,
          errors: 0,
          message: "No users available for bookings"
        };
      }

      const spaceTypes = ["private_office", "shared_desk", "meeting_room", "workshop_space"];
      const timeSlots = ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"];

      const createdBookings = [];
      let errorCount = 0;

      // Create sample bookings
      for (let i = 0; i < Math.min(8, regularUsers.length); i++) {
        const randomUser = regularUsers[i];
        const spaceType = spaceTypes[Math.floor(Math.random() * spaceTypes.length)];
        const startTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const duration = Math.floor(Math.random() * 6) + 2; // 2-8 hours

        // Calculate booking date (1-30 days from now)
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30) + 1);

        const pricing = {
          private_office: 400000,
          shared_desk: 150000,
          meeting_room: 250000,
          workshop_space: 350000
        };

        const hourlyRate = pricing[spaceType] / 8;
        const totalPrice = hourlyRate * duration;

        try {
          const bookingData = {
            booking_number: `BK${Date.now().toString().slice(-6)}${i}`,
            booking_id: `booking_${randomUser._id}_${Date.now()}_${i}`,
            space_type: spaceType,
            space_name: `${spaceType.replace('_', ' ')} #${i + 1}`,
            space_location: `طبقه ${Math.floor(i / 2) + 1}، اتاق ${i + 1}`,
            booking_date: bookingDate,
            start_time: startTime,
            end_time: `${parseInt(startTime.split(':')[0]) + duration}:00`,
            duration_hours: duration,
            capacity_requested: Math.floor(Math.random() * 8) + 2,
            capacity_available: Math.floor(Math.random() * 5) + 10,
            attendee_count: Math.floor(Math.random() * 5) + 1,
            status: ["confirmed", "pending", "completed"][Math.floor(Math.random() * 3)],
            payment_status: ["paid", "pending"][Math.floor(Math.random() * 2)],
            hourly_rate: hourlyRate,
            total_hours: duration,
            base_price: totalPrice,
            additional_services_cost: Math.floor(Math.random() * 100000),
            discount_amount: 0,
            total_price: totalPrice + Math.floor(Math.random() * 100000),
            currency: "IRR",
            customer_name: `${randomUser.first_name} ${randomUser.last_name}`,
            customer_phone: randomUser.mobile,
            company_name: Math.random() > 0.5 ? "شرکت معماری نوین" : "",
            purpose: ["جلسه کاری", "کارگاه آموزشی", "ارائه پروژه", "جلسه مشتری"][Math.floor(Math.random() * 4)],
            special_requirements: Math.random() > 0.7 ? "نیاز به پروژکتور و وایت برد" : "",
            equipment_needed: Math.random() > 0.6 ? "لپ تاپ، پروژکتور" : "",
            catering_required: Math.random() > 0.8,
            is_workshop_booking: spaceType === "workshop_space",
            payment_method: ["wallet", "zarinpal", "bank_transfer"][Math.floor(Math.random() * 3)],
            admin_notes: Math.random() > 0.8 ? "مشتری ویژه" : "",
            is_recurring: false
          };

          const createdBooking = await booking.addOne({
            set: { ...bookingData, user: randomUser._id },
            get: {}
          });

          createdBookings.push(createdBooking);
          console.log(`  ✅ Created booking: ${bookingData.space_name} for ${randomUser.first_name}`);
        } catch (error) {
          console.error(`  ❌ Failed to create booking:`, error.message);
          errorCount++;
        }
      }

      console.log(`  🎉 Bookings seeded: ${createdBookings.length} created, ${errorCount} errors`);
      return {
        success: true,
        data: createdBookings,
        created: createdBookings.length,
        errors: errorCount,
        message: `Successfully created ${createdBookings.length} bookings`
      };

    } catch (error) {
      console.error("❌ Error seeding bookings:", error);
      return {
        success: false,
        error: error.message,
        created: 0,
        errors: 1
      };
    }
  }

  // Master Seeding Function
  static async seedAll(): Promise<SeedResult<any>> {
    try {
      console.log("🚀 Starting comprehensive database seeding...");
      const startTime = Date.now();

      const results = {
        users: { created: 0, errors: 0 },
        categories: { created: 0, errors: 0 },
        courses: { created: 0, errors: 0 },
        articles: { created: 0, errors: 0 },
        transactions: { created: 0, errors: 0 },
        scoring: { created: 0, errors: 0 },
        referrals: { created: 0, errors: 0 },
        bookings: { created: 0, errors: 0 }
      };

      console.log("\n=== PHASE 1: Foundation Data ===");

      // Seed Users
      const userResult = await this.seedUsers();
      results.users = { created: userResult.created, errors: userResult.errors };

      // Seed Categories and Tags
      const categoryResult = await this.seedCategoriesAndTags();
      results.categories = { created: categoryResult.created, errors: categoryResult.errors };

      console.log("\n=== PHASE 2: Content Data ===");

      // Seed Courses
      const courseResult = await this.seedCourses();
      results.courses = { created: courseResult.created, errors: courseResult.errors };

      // Seed Articles
      const articleResult = await this.seedArticles();
      results.articles = { created: articleResult.created, errors: articleResult.errors };

      console.log("\n=== PHASE 3: Transactional Data ===");

      // Seed Transactions
      const transactionResult = await this.seedTransactions();
      results.transactions = { created: transactionResult.created, errors: transactionResult.errors };

      // Seed Scoring Data (placeholder)
      const scoringResult = await this.seedScoringData();
      results.scoring = { created: scoringResult.created, errors: scoringResult.errors };

      console.log("\n=== PHASE 4: User Engagement Data ===");

      // Seed Referrals (placeholder)
      const referralResult = await this.seedReferrals();
      results.referrals = { created: referralResult.created, errors: referralResult.errors };

      // Seed Bookings
      const bookingResult = await this.seedBookings();
      results.bookings = { created: bookingResult.created, errors: bookingResult.errors };

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      const totalCreated = Object.values(results).reduce((sum, result) => sum + result.created, 0);
      const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errors, 0);

      console.log("\n🎉 =========================");
      console.log("   SEEDING COMPLETED!");
      console.log("🎉 =========================");
      console.log(`📊 Total entities created: ${totalCreated}`);
      console.log(`✅ Total successful operations: ${totalCreated}`);
      console.log(`❌ Total errors: ${totalErrors}`);
      console.log(`⏱️  Total duration: ${duration.toFixed(2)}s`);
      console.log("\n📋 BREAKDOWN:");
      console.log(`👥 Users: ${results.users.created} created, ${results.users.errors} errors`);
      console.log(`🏷️  Categories & Tags: ${results.categories.created} created, ${results.categories.errors} errors`);
      console.log(`📚 Courses: ${results.courses.created} created, ${results.courses.errors} errors`);
      console.log(`📰 Articles: ${results.articles.created} created, ${results.articles.errors} errors`);
      console.log(`💰 Transactions: ${results.transactions.created} created, ${results.transactions.errors} errors`);
      console.log(`🏆 Scoring: ${results.scoring.created} created, ${results.scoring.errors} errors`);
      console.log(`🤝 Referrals: ${results.referrals.created} created, ${results.referrals.errors} errors`);
      console.log(`📅 Bookings: ${results.bookings.created} created, ${results.bookings.errors} errors`);
      console.log("=========================\n");

      return {
        success: totalErrors < totalCreated,
        data: results,
        created: totalCreated,
        errors: totalErrors,
        message: `Seeding completed: ${totalCreated} entities created with ${totalErrors} errors`
      };

    } catch (error) {
      console.error("❌ Master seeding failed:", error);
      return {
        success: false,
        error: error.message,
        created: 0,
        errors: 1
      };
    }
  }
}

// Export for use in seed script
export const masterSeeder = MasterDataSeeder;
