#!/usr/bin/env node

/**
 * IRAC Platform - Direct MongoDB Seeding Script
 *
 * Seeds data directly into Docker MongoDB bypassing API limitations
 * Works with the running Docker MongoDB container
 *
 * Usage: npm install mongodb && node direct-mongo-seed.js
 */

const { MongoClient, ObjectId } = require("mongodb");

// Configuration
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "nejat";

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
██╗██████╗  █████╗  ██████╗    ██████╗ ██╗██████╗ ███████╗ ██████╗████████╗
██║██╔══██╗██╔══██╗██╔════╝    ██╔══██╗██║██╔══██╗██╔════╝██╔════╝╚══██╔══╝
██║██████╔╝███████║██║         ██║  ██║██║██████╔╝█████╗  ██║        ██║
██║██╔══██╗██╔══██║██║         ██║  ██║██║██╔══██╗██╔══╝  ██║        ██║
██║██║  ██║██║  ██║╚██████╗    ██████╔╝██║██║  ██║███████╗╚██████╗   ██║
╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═╝

███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗  ██████╗     ███████╗███████╗███████╗██████╗
████╗ ████║██╔═══██╗████╗  ██║██╔════╝ ██╔═══██╗    ██╔════╝██╔════╝██╔════╝██╔══██╗
██╔████╔██║██║   ██║██╔██╗ ██║██║  ███╗██║   ██║    ███████╗█████╗  █████╗  ██║  ██║
██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║██║   ██║    ╚════██║██╔══╝  ██╔══╝  ██║  ██║
██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝╚██████╔╝    ███████║███████╗███████╗██████╔╝
╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝     ╚══════╝╚══════╝╚══════╝╚═════╝
` +
      colors.reset,
  );

  console.log(colors.cyan + "IRAC Direct MongoDB Seeder" + colors.reset);
  console.log(
    colors.cyan +
      "Direct database seeding for Docker MongoDB container" +
      colors.reset,
  );
  console.log("");
}

class DirectMongoSeeder {
  constructor() {
    this.client = null;
    this.db = null;
    this.createdEntities = {
      categories: [],
      tags: [],
      courses: [],
      users: [],
      products: [],
    };
  }

  async connect() {
    try {
      info("Connecting to MongoDB...");
      this.client = new MongoClient(MONGO_URI);
      await this.client.connect();
      await this.client.db(DB_NAME).admin().ping();
      this.db = this.client.db(DB_NAME);
      success(`Connected to database: ${DB_NAME}`);
      return true;
    } catch (err) {
      error(`Database connection failed: ${err.message}`);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      info("Database connection closed");
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

  async seedCategories() {
    info("Seeding categories...");

    const categories = [
      {
        _id: new ObjectId(),
        title: "معماری اسلامی",
        title_en: "Islamic Architecture",
        description: "مبانی و اصول معماری اسلامی",
        description_en: "Principles and foundations of Islamic architecture",
        slug: "islamic-architecture",
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "معماری مدرن",
        title_en: "Modern Architecture",
        description: "روش‌های طراحی معاصر",
        description_en: "Contemporary design methodologies",
        slug: "modern-architecture",
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "معماری پایدار",
        title_en: "Sustainable Architecture",
        description: "طراحی سازگار با محیط زیست",
        description_en: "Environmentally conscious design",
        slug: "sustainable-architecture",
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "تاریخ معماری",
        title_en: "Architectural History",
        description: "تحولات تاریخی معماری",
        description_en: "Historical evolution of architecture",
        slug: "architectural-history",
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "فناوری ساخت",
        title_en: "Construction Technology",
        description: "تکنولوژی‌های نوین ساختمان‌سازی",
        description_en: "Modern building technologies",
        slug: "construction-technology",
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "طراحی شهری",
        title_en: "Urban Design",
        description: "برنامه‌ریزی و طراحی فضاهای شهری",
        description_en: "Urban space planning and design",
        slug: "urban-design",
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    try {
      const result = await this.db
        .collection("category")
        .insertMany(categories);
      this.createdEntities.categories = categories;
      success(`Created ${result.insertedCount} categories`);

      categories.forEach((cat) => {
        console.log(`  ✓ ${cat.title} (${cat.title_en})`);
      });

      return result.insertedCount;
    } catch (err) {
      error(`Failed to create categories: ${err.message}`);
      return 0;
    }
  }

  async seedTags() {
    info("Seeding tags...");

    const tags = [
      {
        _id: new ObjectId(),
        title: "آموزشی",
        title_en: "Educational",
        slug: "educational",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "پیشرفته",
        title_en: "Advanced",
        slug: "advanced",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "مبتدی",
        title_en: "Beginner",
        slug: "beginner",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "عملی",
        title_en: "Practical",
        slug: "practical",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "تئوری",
        title_en: "Theoretical",
        slug: "theoretical",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "بین‌المللی",
        title_en: "International",
        slug: "international",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "محلی",
        title_en: "Local",
        slug: "local",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "نوآورانه",
        title_en: "Innovative",
        slug: "innovative",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "سنتی",
        title_en: "Traditional",
        slug: "traditional",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "دیجیتال",
        title_en: "Digital",
        slug: "digital",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    try {
      const result = await this.db.collection("tag").insertMany(tags);
      this.createdEntities.tags = tags;
      success(`Created ${result.insertedCount} tags`);

      tags.forEach((tag) => {
        console.log(`  ✓ ${tag.title} (${tag.title_en})`);
      });

      return result.insertedCount;
    } catch (err) {
      error(`Failed to create tags: ${err.message}`);
      return 0;
    }
  }

  async seedCourses() {
    info("Seeding courses...");

    // Get random categories for course assignment
    const islamicArchCategory = this.createdEntities.categories.find(
      (cat) => cat.slug === "islamic-architecture",
    );
    const modernArchCategory = this.createdEntities.categories.find(
      (cat) => cat.slug === "modern-architecture",
    );
    const historyCategory = this.createdEntities.categories.find(
      (cat) => cat.slug === "architectural-history",
    );

    const courses = [
      {
        _id: new ObjectId(),
        name: "مبانی معماری اسلامی",
        name_en: "Islamic Architecture Fundamentals",
        description:
          "آشنایی با اصول و مبانی معماری اسلامی، مطالعه انواع بناهای مذهبی و کاربرد هندسه مقدس در طراحی. این دوره شامل بررسی تاریخچه، عناصر اساسی، و تکنیک‌های طراحی در معماری اسلامی است.",
        description_en:
          "Introduction to Islamic architecture principles, study of religious buildings and sacred geometry applications in design. This course covers history, basic elements, and design techniques in Islamic architecture.",
        short_description: "آموزش جامع اصول معماری اسلامی",
        short_description_en: "Comprehensive Islamic architecture principles",
        level: "Beginner",
        type: "Course",
        status: "Active",
        price: 2500000,
        original_price: 3000000,
        is_free: false,
        duration_weeks: 10,
        duration_hours: 40,
        max_students: 30,
        min_students: 5,
        category: islamicArchCategory ? islamicArchCategory._id : null,
        tags: this.createdEntities.tags
          .filter((tag) =>
            ["educational", "beginner", "traditional"].includes(tag.slug),
          )
          .map((tag) => tag._id),
        is_featured: true,
        is_published: true,
        language: "Persian",
        syllabus: [
          { title: "تاریخچه معماری اسلامی", duration: "4 hours", order: 1 },
          { title: "عناصر اساسی", duration: "6 hours", order: 2 },
          { title: "هندسه مقدس", duration: "8 hours", order: 3 },
          { title: "مطالعات موردی", duration: "12 hours", order: 4 },
          { title: "پروژه نهایی", duration: "10 hours", order: 5 },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "طراحی معماری مدرن",
        name_en: "Modern Architectural Design",
        description:
          "یادگیری تکنیک‌های طراحی معاصر، آشنایی با نرم‌افزارهای طراحی و پیاده‌سازی پروژه‌های مدرن. این دوره شامل اصول طراحی، استفاده از تکنولوژی و ارائه پروژه است.",
        description_en:
          "Learning contemporary design techniques, CAD software introduction, and modern project implementation. This course covers design principles, technology usage, and project presentation.",
        short_description: "آموزش طراحی معماری معاصر",
        short_description_en: "Contemporary architectural design training",
        level: "Intermediate",
        type: "Course",
        status: "Active",
        price: 3000000,
        original_price: 3500000,
        is_free: false,
        duration_weeks: 12,
        duration_hours: 50,
        max_students: 25,
        min_students: 5,
        category: modernArchCategory ? modernArchCategory._id : null,
        tags: this.createdEntities.tags
          .filter((tag) =>
            ["educational", "practical", "innovative"].includes(tag.slug),
          )
          .map((tag) => tag._id),
        is_featured: true,
        is_published: true,
        language: "Persian",
        syllabus: [
          { title: "اصول طراحی مدرن", duration: "8 hours", order: 1 },
          { title: "نرم‌افزارهای طراحی", duration: "12 hours", order: 2 },
          { title: "مواد و تکنولوژی", duration: "10 hours", order: 3 },
          { title: "پایداری در طراحی", duration: "10 hours", order: 4 },
          { title: "ارائه و نمایش", duration: "10 hours", order: 5 },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "BIM و مدل‌سازی اطلاعات ساختمان",
        name_en: "BIM and Building Information Modeling",
        description:
          "آموزش جامع BIM، کار با نرم‌افزارهای تخصصی و مدیریت اطلاعات پروژه‌های ساختمانی. شامل آموزش نرم‌افزار Revit، ArchiCAD و تکنیک‌های همکاری تیمی.",
        description_en:
          "Comprehensive BIM training, specialized software usage, and construction project information management. Includes Revit, ArchiCAD software training and teamwork techniques.",
        short_description: "آموزش کامل سیستم‌های BIM",
        short_description_en: "Complete BIM systems training",
        level: "Advanced",
        type: "Course",
        status: "Active",
        price: 3500000,
        original_price: 4000000,
        is_free: false,
        duration_weeks: 11,
        duration_hours: 45,
        max_students: 20,
        min_students: 3,
        category: modernArchCategory ? modernArchCategory._id : null,
        tags: this.createdEntities.tags
          .filter((tag) =>
            ["educational", "advanced", "digital"].includes(tag.slug),
          )
          .map((tag) => tag._id),
        is_featured: true,
        is_published: true,
        language: "Persian",
        syllabus: [
          { title: "مقدمه‌ای بر BIM", duration: "6 hours", order: 1 },
          { title: "نرم‌افزار Revit", duration: "15 hours", order: 2 },
          { title: "مدیریت اطلاعات", duration: "8 hours", order: 3 },
          { title: "همکاری تیمی", duration: "8 hours", order: 4 },
          { title: "پروژه کاربردی", duration: "8 hours", order: 5 },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "تاریخ معماری ایران",
        name_en: "History of Persian Architecture",
        description:
          "مطالعه تحولات معماری ایران از دوران باستان تا معاصر، بررسی سبک‌ها و تأثیرات فرهنگی. شامل بررسی معماری پیش از اسلام، دوران اسلامی و معاصر.",
        description_en:
          "Study of Iranian architectural evolution from ancient to contemporary times, examining styles and cultural influences. Includes pre-Islamic, Islamic, and contemporary architecture.",
        short_description: "سیر تحولات معماری ایران",
        short_description_en: "Evolution of Iranian architecture",
        level: "Beginner",
        type: "Course",
        status: "Active",
        price: 2000000,
        original_price: 2300000,
        is_free: false,
        duration_weeks: 9,
        duration_hours: 35,
        max_students: 40,
        min_students: 8,
        category: historyCategory ? historyCategory._id : null,
        tags: this.createdEntities.tags
          .filter((tag) =>
            ["educational", "theoretical", "traditional"].includes(tag.slug),
          )
          .map((tag) => tag._id),
        is_featured: false,
        is_published: true,
        language: "Persian",
        syllabus: [
          { title: "معماری پیش از اسلام", duration: "8 hours", order: 1 },
          { title: "دوران اسلامی", duration: "10 hours", order: 2 },
          { title: "معماری صفوی", duration: "8 hours", order: 3 },
          { title: "دوران قاجار و پهلوی", duration: "6 hours", order: 4 },
          { title: "معماری معاصر", duration: "3 hours", order: 5 },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "International Architecture Program",
        name_en: "International Architecture Program",
        description:
          "Comprehensive English-taught program covering global architectural practices, international standards, and cross-cultural design principles. This advanced program is designed for international students and professionals.",
        description_en:
          "Comprehensive English-taught program covering global architectural practices, international standards, and cross-cultural design principles. This advanced program is designed for international students and professionals.",
        short_description: "برنامه بین‌المللی معماری",
        short_description_en: "International architecture program",
        level: "Advanced",
        type: "Course",
        status: "Active",
        price: 5000000,
        original_price: 6000000,
        is_free: false,
        duration_weeks: 15,
        duration_hours: 60,
        max_students: 15,
        min_students: 3,
        category: modernArchCategory ? modernArchCategory._id : null,
        tags: this.createdEntities.tags
          .filter((tag) =>
            ["educational", "advanced", "international"].includes(tag.slug),
          )
          .map((tag) => tag._id),
        is_featured: true,
        is_published: true,
        language: "English",
        syllabus: [
          {
            title: "Global Architecture Overview",
            duration: "10 hours",
            order: 1,
          },
          { title: "International Standards", duration: "12 hours", order: 2 },
          { title: "Cross-Cultural Design", duration: "12 hours", order: 3 },
          { title: "Sustainability Practices", duration: "12 hours", order: 4 },
          { title: "Portfolio Development", duration: "14 hours", order: 5 },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    try {
      const result = await this.db.collection("course").insertMany(courses);
      this.createdEntities.courses = courses;
      success(`Created ${result.insertedCount} courses`);

      courses.forEach((course) => {
        const priceDisplay = course.price
          ? `${(course.price / 1000).toLocaleString()}K تومان`
          : "Free";
        console.log(`  ✓ ${course.name} (${course.name_en}) - ${priceDisplay}`);
      });

      return result.insertedCount;
    } catch (err) {
      error(`Failed to create courses: ${err.message}`);
      return 0;
    }
  }

  async seedUsers() {
    info("Seeding additional users...");

    const users = [
      {
        _id: new ObjectId(),
        mobile: "09123456789",
        national_number: this.generateValidNationalNumber(),
        first_name: "محمد",
        last_name: "کریمی",
        firstname: "محمد", // Alternative field name
        lastname: "کریمی", // Alternative field name
        email: "mohammad.karimi@example.com",
        level: "Ordinary",
        bio: "دانشجوی معماری و علاقه‌مند به معماری سنتی ایران",
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        mobile: "09134567890",
        national_number: this.generateValidNationalNumber(),
        first_name: "فاطمه",
        last_name: "محمودی",
        firstname: "فاطمه",
        lastname: "محمودی",
        email: "fateme.mahmoudi@example.com",
        level: "Ordinary",
        bio: "معمار و پژوهشگر در زمینه معماری پایدار",
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        mobile: "09145678901",
        national_number: this.generateValidNationalNumber(),
        first_name: "David",
        last_name: "Chen",
        firstname: "David",
        lastname: "Chen",
        email: "david.chen@example.com",
        level: "Ordinary",
        bio: "Architect specializing in cross-cultural design",
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        mobile: "09156789012",
        national_number: this.generateValidNationalNumber(),
        first_name: "آیدا",
        last_name: "نوری",
        firstname: "آیدا",
        lastname: "نوری",
        email: "aida.nouri@example.com",
        level: "Ordinary",
        bio: "دانشجوی دکترای معماری و تاریخ هنر اسلامی",
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        mobile: "09167890123",
        national_number: this.generateValidNationalNumber(),
        first_name: "Sarah",
        last_name: "Williams",
        firstname: "Sarah",
        lastname: "Williams",
        email: "sarah.williams@example.com",
        level: "Editor",
        bio: "International architecture educator and researcher",
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    try {
      const result = await this.db.collection("user").insertMany(users);
      this.createdEntities.users = users;
      success(`Created ${result.insertedCount} additional users`);

      users.forEach((user) => {
        console.log(`  ✓ ${user.first_name} ${user.last_name} (${user.level})`);
      });

      return result.insertedCount;
    } catch (err) {
      error(`Failed to create users: ${err.message}`);
      return 0;
    }
  }

  async seedProducts() {
    info("Seeding products...");

    const products = [
      {
        _id: new ObjectId(),
        title: "شاهنامه فردوسی",
        title_en: "Shahnameh by Ferdowsi",
        description:
          "حماسه‌ی ملی ایران، یکی از بزرگترین آثار ادب فارسی که داستان شاهان و پهلوانان ایران باستان را روایت می‌کند.",
        description_en:
          "The national epic of Iran, one of the greatest works of Persian literature narrating the stories of ancient Persian kings and heroes.",
        price: 450000,
        discounted_price: 380000,
        stock_quantity: 50,
        is_digital: false,
        type: "book",
        is_featured: true,
        is_published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "معماری اسلامی - مجموعه تصاویر دیجیتال",
        title_en: "Islamic Architecture - Digital Image Collection",
        description:
          "مجموعه‌ای جامع از تصاویر با کیفیت بالا از بناهای اسلامی سراسر جهان شامل مساجد، مدارس، و بناهای تاریخی.",
        description_en:
          "A comprehensive collection of high-quality images of Islamic architectural monuments worldwide including mosques, madrasas, and historical buildings.",
        price: 200000,
        discounted_price: 150000,
        stock_quantity: 999,
        is_digital: true,
        type: "digital_content",
        is_featured: true,
        is_published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new ObjectId(),
        title: "کتاب طراحی معماری مدرن",
        title_en: "Modern Architectural Design Book",
        description:
          "راهنمای جامع طراحی معماری مدرن با مثال‌های عملی، تکنیک‌های نوین و رویکردهای خلاقانه در طراحی.",
        description_en:
          "Comprehensive guide to modern architectural design with practical examples, innovative techniques and creative approaches in design.",
        price: 320000,
        discounted_price: 280000,
        stock_quantity: 30,
        is_digital: false,
        type: "book",
        is_featured: false,
        is_published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    try {
      const result = await this.db.collection("product").insertMany(products);
      this.createdEntities.products = products;
      success(`Created ${result.insertedCount} products`);

      products.forEach((product) => {
        const priceDisplay = product.discounted_price
          ? `${product.discounted_price.toLocaleString()} تومان (${product.price.toLocaleString()})`
          : `${product.price.toLocaleString()} تومان`;
        console.log(`  ✓ ${product.title} - ${priceDisplay}`);
      });

      return result.insertedCount;
    } catch (err) {
      error(`Failed to create products: ${err.message}`);
      return 0;
    }
  }

  async getCurrentStatus() {
    info("Checking current database status...");

    const stats = {
      users: await this.db.collection("user").countDocuments(),
      categories: await this.db.collection("category").countDocuments(),
      tags: await this.db.collection("tag").countDocuments(),
      courses: await this.db.collection("course").countDocuments(),
      products: await this.db.collection("product").countDocuments(),
      articles: await this.db.collection("article").countDocuments(),
    };

    console.log("Current database contents:");
    Object.entries(stats).forEach(([collection, count]) => {
      console.log(`  ${collection}: ${count}`);
    });

    return stats;
  }

  async generateSummaryReport() {
    console.log("\n" + "=".repeat(80));
    console.log(
      colors.bright + "📊 DIRECT MONGODB SEEDING SUMMARY REPORT" + colors.reset,
    );
    console.log("=".repeat(80));

    const totalEntities = Object.values(this.createdEntities).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );

    console.log("\n" + colors.cyan + "🎯 ENTITIES CREATED:" + colors.reset);
    console.log(`   🏷️  Categories: ${this.createdEntities.categories.length}`);
    console.log(`   🔖 Tags: ${this.createdEntities.tags.length}`);
    console.log(`   📚 Courses: ${this.createdEntities.courses.length}`);
    console.log(`   👥 Users: ${this.createdEntities.users.length}`);
    console.log(`   🛒 Products: ${this.createdEntities.products.length}`);
    console.log(`   📊 Total: ${totalEntities} entities`);

    console.log("\n" + colors.cyan + "🔑 FEATURED COURSES:" + colors.reset);
    this.createdEntities.courses.forEach((course) => {
      if (course.is_featured) {
        const priceDisplay = course.price
          ? `${(course.price / 1000).toLocaleString()}K تومان`
          : "Free";
        console.log(`   📚 ${course.name} - ${priceDisplay}`);
      }
    });

    console.log("\n" + colors.cyan + "🚀 PLATFORM STATUS:" + colors.reset);
    success("Course catalog ready with featured courses");
    success("Content organization system ready");
    success("Multi-user system ready");
    success("Product catalog ready");

    console.log("\n" + colors.cyan + "📱 ACCESS INFORMATION:" + colors.reset);
    console.log("   🌐 Frontend: http://localhost:3000");
    console.log("   🔗 Backend API: http://localhost:1405");
    console.log("   🎮 API Playground: http://localhost:1405/playground");

    console.log("\n" + colors.cyan + "✅ VERIFICATION STEPS:" + colors.reset);
    console.log("   1. Visit http://localhost:3000/courses");
    console.log("   2. Verify courses are displayed properly");
    console.log("   3. Check category filtering works");
    console.log("   4. Test course detail pages");
    console.log("   5. Verify user registration works");

    console.log("\n" + "=".repeat(80));
  }

  async run() {
    printBanner();

    console.log(`Target MongoDB: ${MONGO_URI}`);
    console.log(`Database: ${DB_NAME}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log("");

    // Step 1: Connect to database
    if (!(await this.connect())) {
      error("Cannot proceed without database connection");
      process.exit(1);
    }

    // Step 2: Check current status
    console.log("");
    await this.getCurrentStatus();

    // Step 3: Seed categories
    console.log("");
    const categoriesCreated = await this.seedCategories();

    // Step 4: Seed tags
    console.log("");
    const tagsCreated = await this.seedTags();

    // Step 5: Seed courses
    console.log("");
    const coursesCreated = await this.seedCourses();

    // Step 6: Seed users
    console.log("");
    const usersCreated = await this.seedUsers();

    // Step 7: Seed products
    console.log("");
    const productsCreated = await this.seedProducts();

    // Generate final report
    await this.generateSummaryReport();

    // Close connection
    await this.disconnect();

    const totalCreated =
      categoriesCreated +
      tagsCreated +
      coursesCreated +
      usersCreated +
      productsCreated;

    if (totalCreated > 0) {
      success("🎉 Direct MongoDB seeding completed successfully!");
      console.log("");
      console.log(
        "Your IRAC Platform is now fully populated with sample data.",
      );
      console.log("The 'خطا در دریافت دوره‌ها' error should be resolved.");
      console.log("Visit http://localhost:3000/courses to see the courses!");
    } else {
      warning(
        "No new entities were created. Database may already contain data.",
      );
    }
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
  const seeder = new DirectMongoSeeder();

  try {
    await seeder.run();
    process.exit(0);
  } catch (err) {
    error(`Critical error during seeding: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

// Check if MongoDB is accessible first
async function checkMongoAccessibility() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    await client.db(DB_NAME).admin().ping();
    await client.close();
    return true;
  } catch (err) {
    error("MongoDB not accessible at: " + MONGO_URI);
    error("Please ensure Docker containers are running:");
    error("  docker compose up -d");
    return false;
  }
}

// Run the script if called directly
if (require.main === module) {
  checkMongoAccessibility().then((accessible) => {
    if (accessible) {
      main();
    } else {
      process.exit(1);
    }
  });
}

module.exports = { DirectMongoSeeder };
