#!/usr/bin/env node

/**
 * IRAC Platform - Docker Data Seeding Script
 *
 * Seeds comprehensive data into running Docker containers
 * Works with the live backend API to populate the database
 *
 * Usage: node seed-docker-data.js
 */

const fetch = globalThis.fetch;

// Configuration
const BASE_URL = process.env.API_URL || "http://localhost:1405";
const LESAN_ENDPOINT = `${BASE_URL}/lesan`;

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Helper functions
function log(message, color = colors.green) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function printBanner() {
  console.clear();
  console.log(
    colors.magenta +
      `
██╗██████╗  █████╗  ██████╗    ██████╗  ██████╗  ██████╗██╗  ██╗███████╗██████╗
██║██╔══██╗██╔══██╗██╔════╝    ██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
██║██████╔╝███████║██║         ██║  ██║██║   ██║██║     █████╔╝ █████╗  ██████╔╝
██║██╔══██╗██╔══██║██║         ██║  ██║██║   ██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
██║██║  ██║██║  ██║╚██████╗    ██████╔╝╚██████╔╝╚██████╗██║  ██╗███████╗██║  ██║
╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═════╝  ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

███████╗███████╗███████╗██████╗ ███████╗██████╗
██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗
███████╗█████╗  █████╗  ██║  ██║█████╗  ██████╔╝
╚════██║██╔══╝  ██╔══╝  ██║  ██║██╔══╝  ██╔══██╗
███████║███████╗███████╗██████╔╝███████╗██║  ██║
╚══════╝╚══════╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝
` +
      colors.reset,
  );

  console.log(colors.cyan + "IRAC Docker Data Seeder" + colors.reset);
  console.log(
    colors.cyan +
      "Comprehensive data seeding for running Docker containers" +
      colors.reset,
  );
  console.log("");
}

class DockerDataSeeder {
  constructor() {
    this.adminToken = null;
    this.adminUser = null;
    this.createdEntities = {
      users: [],
      categories: [],
      tags: [],
      courses: [],
      articles: [],
      products: [],
    };
  }

  async makeRequest(model, act, details = { set: {}, get: {} }, token = null) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["token"] = token;
    }

    try {
      const response = await fetch(LESAN_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          act,
          details,
        }),
      });

      const result = await response.json();

      return {
        success: result.success || false,
        data: result.body || result,
        status: response.status,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        status: 0,
      };
    }
  }

  async checkBackendHealth() {
    info("Checking backend health...");

    try {
      const response = await fetch(BASE_URL);
      if (response.status === 501) {
        success("Backend is responding correctly");
        return true;
      } else {
        warning(`Backend responding with status: ${response.status}`);
        return true; // Still accessible
      }
    } catch (err) {
      error(`Backend not accessible: ${err.message}`);
      return false;
    }
  }

  generateValidNationalNumber() {
    // Generate 9 random digits
    let code = "";
    for (let i = 0; i < 9; i++) {
      code += Math.floor(Math.random() * 10);
    }

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += +code[i] * (10 - i);
    }

    const remainder = sum % 11;
    const lastDigit = remainder < 2 ? remainder : 11 - remainder;

    return code + lastDigit;
  }

  async createAdminUser() {
    info("Creating additional admin user for seeding...");

    const timestamp = Date.now();
    const nationalNumber = this.generateValidNationalNumber();
    const mobile = `0912${Math.floor(Math.random() * 9000000) + 1000000}`;

    const adminData = {
      mobile,
      national_number: nationalNumber,
      first_name: "Data",
      last_name: "Seeder",
      username: `seeder_${timestamp}`,
      email: `seeder_${timestamp}@irac.local`,
    };

    const registerResult = await this.makeRequest("user", "registerUser", {
      set: {
        mobile: adminData.mobile,
        national_number: adminData.national_number,
      },
      get: {
        _id: 1,
        mobile: 1,
        national_number: 1,
        first_name: 1,
      },
    });

    if (registerResult.success) {
      success("Seeder admin user created");
      this.adminUser = registerResult.data;

      // Update to manager level (this might require existing admin privileges)
      const updateResult = await this.makeRequest("user", "updateUser", {
        set: {
          first_name: adminData.first_name,
          last_name: adminData.last_name,
          level: "Manager",
        },
        get: {
          _id: 1,
          level: 1,
        },
      });

      return true;
    } else {
      warning("Could not create seeder admin, will try with existing data");
      return false;
    }
  }

  async createCategories() {
    info("Creating categories...");

    const categories = [
      {
        title: "معماری اسلامی",
        title_en: "Islamic Architecture",
        description: "مبانی و اصول معماری اسلامی",
        description_en: "Principles and foundations of Islamic architecture",
        slug: "islamic-architecture",
        is_featured: true,
      },
      {
        title: "معماری مدرن",
        title_en: "Modern Architecture",
        description: "روش‌های طراحی معاصر",
        description_en: "Contemporary design methodologies",
        slug: "modern-architecture",
        is_featured: true,
      },
      {
        title: "معماری پایدار",
        title_en: "Sustainable Architecture",
        description: "طراحی سازگار با محیط زیست",
        description_en: "Environmentally conscious design",
        slug: "sustainable-architecture",
        is_featured: false,
      },
      {
        title: "تاریخ معماری",
        title_en: "Architectural History",
        description: "تحولات تاریخی معماری",
        description_en: "Historical evolution of architecture",
        slug: "architectural-history",
        is_featured: false,
      },
      {
        title: "فناوری ساخت",
        title_en: "Construction Technology",
        description: "تکنولوژی‌های نوین ساختمان‌سازی",
        description_en: "Modern building technologies",
        slug: "construction-technology",
        is_featured: false,
      },
      {
        title: "طراحی شهری",
        title_en: "Urban Design",
        description: "برنامه‌ریزی و طراحی فضاهای شهری",
        description_en: "Urban space planning and design",
        slug: "urban-design",
        is_featured: false,
      },
    ];

    let created = 0;
    for (const category of categories) {
      const result = await this.makeRequest(
        "category",
        "addCategory",
        {
          set: category,
          get: {
            _id: 1,
            title: 1,
            slug: 1,
          },
        },
        this.adminToken,
      );

      if (result.success) {
        this.createdEntities.categories.push(result.data);
        created++;
        console.log(`  ✓ Created category: ${category.title}`);
      } else {
        console.log(
          `  ✗ Failed to create category: ${category.title} - ${result.data?.message || result.error}`,
        );
      }
    }

    success(`Created ${created} categories`);
    return created;
  }

  async createTags() {
    info("Creating tags...");

    const tags = [
      { title: "آموزشی", title_en: "Educational", slug: "educational" },
      { title: "پیشرفته", title_en: "Advanced", slug: "advanced" },
      { title: "مبتدی", title_en: "Beginner", slug: "beginner" },
      { title: "عملی", title_en: "Practical", slug: "practical" },
      { title: "تئوری", title_en: "Theoretical", slug: "theoretical" },
      { title: "بین‌المللی", title_en: "International", slug: "international" },
      { title: "محلی", title_en: "Local", slug: "local" },
      { title: "نوآورانه", title_en: "Innovative", slug: "innovative" },
      { title: "سنتی", title_en: "Traditional", slug: "traditional" },
      { title: "دیجیتال", title_en: "Digital", slug: "digital" },
    ];

    let created = 0;
    for (const tag of tags) {
      const result = await this.makeRequest(
        "tag",
        "addTag",
        {
          set: tag,
          get: {
            _id: 1,
            title: 1,
            slug: 1,
          },
        },
        this.adminToken,
      );

      if (result.success) {
        this.createdEntities.tags.push(result.data);
        created++;
        console.log(`  ✓ Created tag: ${tag.title}`);
      } else {
        console.log(
          `  ✗ Failed to create tag: ${tag.title} - ${result.data?.message || result.error}`,
        );
      }
    }

    success(`Created ${created} tags`);
    return created;
  }

  async createCourses() {
    info("Creating courses...");

    if (this.createdEntities.categories.length === 0) {
      warning(
        "No categories available, creating courses without category relationships",
      );
    }

    const courses = [
      {
        title: "مبانی معماری اسلامی",
        title_en: "Islamic Architecture Fundamentals",
        description:
          "آشنایی با اصول و مبانی معماری اسلامی، مطالعه انواع بناهای مذهبی و کاربرد هندسه مقدس در طراحی",
        description_en:
          "Introduction to Islamic architecture principles, study of religious buildings and sacred geometry applications",
        price: 2500000,
        discounted_price: 2000000,
        duration_hours: 40,
        level: "Beginner",
        max_students: 30,
        is_featured: true,
        is_published: true,
        language: "Persian",
        syllabus: JSON.stringify([
          { title: "تاریخچه معماری اسلامی", duration: "4 hours" },
          { title: "عناصر اساسی", duration: "6 hours" },
          { title: "هندسه مقدس", duration: "8 hours" },
          { title: "مطالعات موردی", duration: "12 hours" },
          { title: "پروژه نهایی", duration: "10 hours" },
        ]),
      },
      {
        title: "طراحی معماری مدرن",
        title_en: "Modern Architectural Design",
        description:
          "یادگیری تکنیک‌های طراحی معاصر، آشنایی با نرم‌افزارهای طراحی و پیاده‌سازی پروژه‌های مدرن",
        description_en:
          "Learning contemporary design techniques, CAD software introduction, and modern project implementation",
        price: 3000000,
        discounted_price: 2700000,
        duration_hours: 50,
        level: "Intermediate",
        max_students: 25,
        is_featured: true,
        is_published: true,
        language: "Persian",
        syllabus: JSON.stringify([
          { title: "اصول طراحی مدرن", duration: "8 hours" },
          { title: "نرم‌افزارهای طراحی", duration: "12 hours" },
          { title: "مواد و تکنولوژی", duration: "10 hours" },
          { title: "پایداری در طراحی", duration: "10 hours" },
          { title: "ارائه و نمایش", duration: "10 hours" },
        ]),
      },
      {
        title: "BIM و مدل‌سازی اطلاعات ساختمان",
        title_en: "BIM and Building Information Modeling",
        description:
          "آموزش جامع BIM، کار با نرم‌افزارهای تخصصی و مدیریت اطلاعات پروژه‌های ساختمانی",
        description_en:
          "Comprehensive BIM training, specialized software usage, and construction project information management",
        price: 3500000,
        discounted_price: 3200000,
        duration_hours: 45,
        level: "Advanced",
        max_students: 20,
        is_featured: true,
        is_published: true,
        language: "Persian",
        syllabus: JSON.stringify([
          { title: "مقدمه‌ای بر BIM", duration: "6 hours" },
          { title: "نرم‌افزار Revit", duration: "15 hours" },
          { title: "مدیریت اطلاعات", duration: "8 hours" },
          { title: "همکاری تیمی", duration: "8 hours" },
          { title: "پروژه کاربردی", duration: "8 hours" },
        ]),
      },
      {
        title: "تاریخ معماری ایران",
        title_en: "History of Persian Architecture",
        description:
          "مطالعه تحولات معماری ایران از دوران باستان تا معاصر، بررسی سبک‌ها و تأثیرات فرهنگی",
        description_en:
          "Study of Iranian architectural evolution from ancient to contemporary times, styles and cultural influences",
        price: 2000000,
        discounted_price: 1800000,
        duration_hours: 35,
        level: "Beginner",
        max_students: 40,
        is_featured: false,
        is_published: true,
        language: "Persian",
        syllabus: JSON.stringify([
          { title: "معماری پیش از اسلام", duration: "8 hours" },
          { title: "دوران اسلامی", duration: "10 hours" },
          { title: "معماری صفوی", duration: "8 hours" },
          { title: "دوران قاجار و پهلوی", duration: "6 hours" },
          { title: "معماری معاصر", duration: "3 hours" },
        ]),
      },
      {
        title: "International Architecture Program",
        title_en: "International Architecture Program",
        description:
          "Comprehensive English-taught program covering global architectural practices, international standards, and cross-cultural design principles",
        description_en:
          "Comprehensive English-taught program covering global architectural practices, international standards, and cross-cultural design principles",
        price: 5000000,
        discounted_price: 4500000,
        duration_hours: 60,
        level: "Advanced",
        max_students: 15,
        is_featured: true,
        is_published: true,
        language: "English",
        syllabus: JSON.stringify([
          { title: "Global Architecture Overview", duration: "10 hours" },
          { title: "International Standards", duration: "12 hours" },
          { title: "Cross-Cultural Design", duration: "12 hours" },
          { title: "Sustainability Practices", duration: "12 hours" },
          { title: "Portfolio Development", duration: "14 hours" },
        ]),
      },
    ];

    let created = 0;
    for (const course of courses) {
      // Add category if available
      if (this.createdEntities.categories.length > 0) {
        const randomCategory =
          this.createdEntities.categories[
            Math.floor(Math.random() * this.createdEntities.categories.length)
          ];
        course.category = randomCategory._id;
      }

      const result = await this.makeRequest(
        "course",
        "addCourse",
        {
          set: course,
          get: {
            _id: 1,
            title: 1,
            price: 1,
            is_featured: 1,
          },
        },
        this.adminToken,
      );

      if (result.success) {
        this.createdEntities.courses.push(result.data);
        created++;
        console.log(`  ✓ Created course: ${course.title}`);
      } else {
        console.log(
          `  ✗ Failed to create course: ${course.title} - ${result.data?.message || result.error}`,
        );
      }
    }

    success(`Created ${created} courses`);
    return created;
  }

  async createUsers() {
    info("Creating additional users...");

    const users = [
      {
        mobile: "09123456789",
        national_number: this.generateValidNationalNumber(),
        first_name: "محمد",
        last_name: "کریمی",
        email: "mohammad.karimi@example.com",
        bio: "دانشجوی معماری و علاقه‌مند به معماری سنتی ایران",
      },
      {
        mobile: "09134567890",
        national_number: this.generateValidNationalNumber(),
        first_name: "فاطمه",
        last_name: "محمودی",
        email: "fateme.mahmoudi@example.com",
        bio: "معمار و پژوهشگر در زمینه معماری پایدار",
      },
      {
        mobile: "09145678901",
        national_number: this.generateValidNationalNumber(),
        first_name: "David",
        last_name: "Chen",
        email: "david.chen@example.com",
        bio: "Architect specializing in cross-cultural design",
      },
      {
        mobile: "09156789012",
        national_number: this.generateValidNationalNumber(),
        first_name: "آیدا",
        last_name: "نوری",
        email: "aida.nouri@example.com",
        bio: "دانشجوی دکترای معماری و تاریخ هنر اسلامی",
      },
    ];

    let created = 0;
    for (const userData of users) {
      const registerResult = await this.makeRequest("user", "registerUser", {
        set: {
          mobile: userData.mobile,
          national_number: userData.national_number,
        },
        get: {
          _id: 1,
          mobile: 1,
          national_number: 1,
        },
      });

      if (registerResult.success) {
        // Update user profile
        const updateResult = await this.makeRequest("user", "updateUser", {
          set: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            bio: userData.bio,
            level: "Ordinary",
          },
          get: {
            _id: 1,
            first_name: 1,
            last_name: 1,
          },
        });

        if (updateResult.success) {
          this.createdEntities.users.push(updateResult.data);
          created++;
          console.log(
            `  ✓ Created user: ${userData.first_name} ${userData.last_name}`,
          );
        }
      } else {
        console.log(
          `  ✗ Failed to create user: ${userData.first_name} - ${registerResult.data?.message || registerResult.error}`,
        );
      }
    }

    success(`Created ${created} additional users`);
    return created;
  }

  async createProducts() {
    info("Creating products...");

    const products = [
      {
        title: "شاهنامه فردوسی",
        title_en: "Shahnameh by Ferdowsi",
        description: "حماسه‌ی ملی ایران، یکی از بزرگترین آثار ادب فارسی",
        description_en:
          "The national epic of Iran, one of the greatest works of Persian literature",
        price: 450000,
        discounted_price: 380000,
        stock_quantity: 50,
        is_digital: false,
        type: "book",
        is_featured: true,
        is_published: true,
      },
      {
        title: "معماری اسلامی - مجموعه تصاویر دیجیتال",
        title_en: "Islamic Architecture - Digital Image Collection",
        description: "مجموعه‌ای از تصاویر با کیفیت بالا از بناهای اسلامی",
        description_en:
          "High-quality image collection of Islamic architectural monuments",
        price: 200000,
        discounted_price: 150000,
        stock_quantity: 999,
        is_digital: true,
        type: "digital_content",
        is_featured: true,
        is_published: true,
      },
      {
        title: "کتاب طراحی معماری مدرن",
        title_en: "Modern Architectural Design Book",
        description: "راهنمای جامع طراحی معماری مدرن با مثال‌های عملی",
        description_en:
          "Comprehensive guide to modern architectural design with practical examples",
        price: 320000,
        discounted_price: 280000,
        stock_quantity: 30,
        is_digital: false,
        type: "book",
        is_featured: false,
        is_published: true,
      },
    ];

    let created = 0;
    for (const product of products) {
      const result = await this.makeRequest(
        "product",
        "addProduct",
        {
          set: product,
          get: {
            _id: 1,
            title: 1,
            price: 1,
          },
        },
        this.adminToken,
      );

      if (result.success) {
        this.createdEntities.products.push(result.data);
        created++;
        console.log(`  ✓ Created product: ${product.title}`);
      } else {
        console.log(
          `  ✗ Failed to create product: ${product.title} - ${result.data?.message || result.error}`,
        );
      }
    }

    success(`Created ${created} products`);
    return created;
  }

  async generateSummaryReport() {
    console.log("\n" + "=".repeat(80));
    console.log(
      colors.bright + "📊 DOCKER SEEDING SUMMARY REPORT" + colors.reset,
    );
    console.log("=".repeat(80));

    const totalEntities = Object.values(this.createdEntities).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );

    console.log("\n" + colors.cyan + "🎯 ENTITIES CREATED:" + colors.reset);
    console.log(`   👥 Users: ${this.createdEntities.users.length}`);
    console.log(`   🏷️  Categories: ${this.createdEntities.categories.length}`);
    console.log(`   🔖 Tags: ${this.createdEntities.tags.length}`);
    console.log(`   📚 Courses: ${this.createdEntities.courses.length}`);
    console.log(`   📰 Articles: ${this.createdEntities.articles.length}`);
    console.log(`   🛒 Products: ${this.createdEntities.products.length}`);
    console.log(`   📊 Total: ${totalEntities} entities`);

    console.log("\n" + colors.cyan + "🔑 FEATURED COURSES:" + colors.reset);
    this.createdEntities.courses.forEach((course) => {
      if (course.is_featured) {
        console.log(
          `   📚 ${course.title} - ${course.price?.toLocaleString()} تومان`,
        );
      }
    });

    console.log("\n" + colors.cyan + "🚀 PLATFORM STATUS:" + colors.reset);
    if (this.createdEntities.courses.length > 0) {
      success("Course catalog ready");
    }
    if (this.createdEntities.categories.length > 0) {
      success("Content organization system ready");
    }
    if (this.createdEntities.users.length > 0) {
      success("Multi-user system ready");
    }

    console.log("\n" + colors.cyan + "📱 ACCESS INFORMATION:" + colors.reset);
    console.log("   🌐 Frontend: http://localhost:3000");
    console.log("   🔗 Backend API: http://localhost:1405");
    console.log("   🎮 API Playground: http://localhost:1405/playground");

    console.log("\n" + colors.cyan + "✅ VERIFICATION:" + colors.reset);
    console.log("   The courses page should now display the seeded courses");
    console.log("   Categories and filtering should work properly");
    console.log("   User registration and login should be functional");

    console.log("\n" + "=".repeat(80));
  }

  async run() {
    printBanner();

    console.log(`Target Backend: ${BASE_URL}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log("");

    // Step 1: Check backend health
    if (!(await this.checkBackendHealth())) {
      error("Backend not accessible. Make sure Docker containers are running.");
      process.exit(1);
    }

    // Step 2: Create seeder admin (optional)
    info("Setting up seeding environment...");
    await this.createAdminUser();

    // Step 3: Create categories
    console.log("");
    await this.createCategories();

    // Step 4: Create tags
    console.log("");
    await this.createTags();

    // Step 5: Create courses
    console.log("");
    await this.createCourses();

    // Step 6: Create users
    console.log("");
    await this.createUsers();

    // Step 7: Create products
    console.log("");
    await this.createProducts();

    // Generate final report
    await this.generateSummaryReport();

    success("🎉 Docker data seeding completed successfully!");
    console.log("");
    console.log("Your IRAC Platform is now fully loaded with sample data.");
    console.log(
      "Visit http://localhost:3000 to see the courses and other content.",
    );
  }
}

// Handle interruption (Ctrl+C)
process.on("SIGINT", () => {
  console.log("\n");
  warning("Seeding interrupted by user");
  process.exit(0);
});

// Main execution
async function main() {
  const seeder = new DockerDataSeeder();

  try {
    await seeder.run();
    process.exit(0);
  } catch (err) {
    error(`Critical error during seeding: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

// Check if backend is accessible first
async function checkBackendAccessibility() {
  try {
    const response = await fetch(BASE_URL);
    return true;
  } catch (err) {
    error("Backend not accessible at: " + BASE_URL);
    error("Please ensure Docker containers are running:");
    error("  docker compose up -d");
    return false;
  }
}

// Run the script if called directly
if (require.main === module) {
  checkBackendAccessibility().then((accessible) => {
    if (accessible) {
      main();
    } else {
      process.exit(1);
    }
  });
}

module.exports = { DockerDataSeeder };
