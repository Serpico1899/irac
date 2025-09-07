import { coreApp } from "../../mod.ts";
import { product_models } from "@model";

export interface SeedProductData {
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  type: string;
  category: string;
  price: number;
  discounted_price?: number;
  stock_quantity?: number;
  is_digital: boolean;
  featured_image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  gallery?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  tags: string[];
  specifications?: Record<string, any>;
  author?: string;
  author_en?: string;
  isbn?: string;
  publisher?: string;
  publisher_en?: string;
  publication_date?: Date;
  language: string;
  page_count?: number;
  file_url?: string;
  file_size?: number;
  file_format?: string;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: "cm" | "mm" | "inch";
  };
  weight?: {
    value: number;
    unit: "g" | "kg" | "lb";
  };
  materials?: string[];
  artist?: string;
  artist_en?: string;
  artwork_year?: number;
  artwork_style?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
}

// Sample product data
export const sampleProducts: SeedProductData[] = [
  // Persian Books
  {
    title: "شاهنامه فردوسی",
    title_en: "Shahnameh by Ferdowsi",
    description: "حماسه‌ی ملی ایران، یکی از بزرگترین آثار ادب فارسی که داستان شاهان و پهلوانان ایران باستان را روایت می‌کند.",
    description_en: "The national epic of Iran, one of the greatest works of Persian literature narrating the stories of ancient Persian kings and heroes.",
    type: "book",
    category: "books",
    price: 450000,
    discounted_price: 380000,
    stock_quantity: 25,
    is_digital: false,
    featured_image: {
      url: "https://example.com/images/shahnameh-cover.jpg",
      alt: "جلد کتاب شاهنامه فردوسی",
      width: 600,
      height: 800,
    },
    tags: ["ادبیات فارسی", "حماسه", "فردوسی", "کلاسیک", "ایران باستان"],
    specifications: {
      binding: "گالینگور",
      paper_quality: "کاغذ کرم",
      print_quality: "چاپ رنگی",
    },
    author: "ابوالقاسم فردوسی",
    author_en: "Abolqasem Ferdowsi",
    publisher: "انتشارات امیرکبیر",
    publisher_en: "Amir Kabir Publications",
    publication_date: new Date("2023-01-15"),
    language: "fa",
    page_count: 1200,
    dimensions: {
      width: 17,
      height: 24,
      depth: 6,
      unit: "cm",
    },
    weight: {
      value: 1.8,
      unit: "kg",
    },
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    meta_title: "شاهنامه فردوسی - خرید آنلاین کتاب",
    meta_description: "خرید کتاب شاهنامه فردوسی با بهترین قیمت و کیفیت چاپ. ارسال رایگان در سراسر کشور.",
    seo_keywords: ["شاهنامه", "فردوسی", "ادبیات فارسی", "حماسه ملی"],
  },

  {
    title: "گلستان سعدی",
    title_en: "Gulistan by Saadi",
    description: "مجموعه حکایات اخلاقی و تربیتی سعدی شیرازی که از شاهکارهای ادب فارسی محسوب می‌شود.",
    description_en: "A collection of moral and educational stories by Saadi Shirazi, considered one of the masterpieces of Persian literature.",
    type: "book",
    category: "books",
    price: 180000,
    stock_quantity: 40,
    is_digital: false,
    featured_image: {
      url: "https://example.com/images/golestan-cover.jpg",
      alt: "جلد کتاب گلستان سعدی",
    },
    tags: ["ادبیات فارسی", "سعدی", "اخلاق", "حکمت", "کلاسیک"],
    author: "مصلح‌الدین سعدی",
    author_en: "Saadi Shirazi",
    publisher: "انتشارات صفی علیشاه",
    publication_date: new Date("2023-03-10"),
    language: "fa",
    page_count: 320,
    is_featured: false,
    is_bestseller: true,
    is_new: false,
  },

  // Digital Books
  {
    title: "آموزش برنامه‌نویسی مدرن",
    title_en: "Modern Programming Tutorial",
    description: "کتاب جامع آموزش برنامه‌نویسی با زبان‌های مدرن و تکنولوژی‌های روز دنیا",
    description_en: "Comprehensive guide to programming with modern languages and cutting-edge technologies",
    type: "book",
    category: "digital_books",
    price: 120000,
    discounted_price: 99000,
    stock_quantity: undefined,
    is_digital: true,
    featured_image: {
      url: "https://example.com/images/programming-book.jpg",
      alt: "جلد کتاب آموزش برنامه‌نویسی",
    },
    tags: ["برنامه‌نویسی", "آموزش", "تکنولوژی", "کامپیوتر"],
    author: "علی احمدی",
    author_en: "Ali Ahmadi",
    publisher: "انتشارات فناوری",
    publication_date: new Date("2023-06-01"),
    language: "fa",
    page_count: 450,
    file_url: "https://example.com/files/programming-tutorial.pdf",
    file_size: 15728640, // 15MB
    file_format: "pdf",
    is_featured: true,
    is_bestseller: false,
    is_new: true,
  },

  // English Books
  {
    title: "Persian Poetry Collection",
    title_en: "Persian Poetry Collection",
    description: "A curated collection of classical and contemporary Persian poetry translated into English",
    description_en: "A curated collection of classical and contemporary Persian poetry translated into English",
    type: "book",
    category: "books",
    price: 350000,
    stock_quantity: 15,
    is_digital: false,
    featured_image: {
      url: "https://example.com/images/persian-poetry.jpg",
      alt: "Persian Poetry Collection Cover",
    },
    tags: ["poetry", "persian literature", "translation", "english"],
    author: "Various Authors",
    author_en: "Various Authors",
    publisher: "International Persian Literature Press",
    publisher_en: "International Persian Literature Press",
    publication_date: new Date("2023-04-20"),
    language: "en",
    page_count: 280,
    is_featured: false,
    is_bestseller: false,
    is_new: true,
  },

  // Artworks - Paintings
  {
    title: "منظره کوهستانی",
    title_en: "Mountain Landscape",
    description: "نقاشی رنگ روغن روی بوم با موضوع منظره طبیعی کوهستان البرز",
    description_en: "Oil painting on canvas featuring the natural landscape of Alborz mountains",
    type: "artwork",
    category: "paintings",
    price: 2500000,
    discounted_price: 2200000,
    stock_quantity: 1,
    is_digital: false,
    featured_image: {
      url: "https://example.com/images/mountain-landscape.jpg",
      alt: "نقاشی منظره کوهستانی",
      width: 800,
      height: 600,
    },
    gallery: [
      {
        url: "https://example.com/images/mountain-detail-1.jpg",
        alt: "جزئیات نقاشی منظره کوهستانی",
      },
      {
        url: "https://example.com/images/mountain-detail-2.jpg",
        alt: "زاویه دیگر نقاشی",
      },
    ],
    tags: ["نقاشی", "منظره", "کوهستان", "رنگ روغن", "طبیعت"],
    specifications: {
      technique: "رنگ روغن روی بوم",
      style: "رئالیسم",
      year: 2023,
    },
    artist: "مریم حسینی",
    artist_en: "Maryam Hosseini",
    artwork_year: 2023,
    artwork_style: "رئالیسم",
    dimensions: {
      width: 70,
      height: 50,
      unit: "cm",
    },
    weight: {
      value: 2.5,
      unit: "kg",
    },
    materials: ["رنگ روغن", "بوم", "قاب چوبی"],
    language: "fa",
    is_featured: true,
    is_bestseller: false,
    is_new: true,
    meta_title: "نقاشی منظره کوهستانی - اثر مریم حسینی",
    meta_description: "خرید نقاشی اورجینال منظره کوهستانی با تکنیک رنگ روغن. اثر هنرمند مریم حسینی.",
    seo_keywords: ["نقاشی", "منظره", "هنر ایرانی", "رنگ روغن"],
  },

  {
    title: "پرتره مدرن",
    title_en: "Modern Portrait",
    description: "پرتره مدرن با تکنیک آکریلیک، نمایانگر چهره‌ای از هنر معاصر ایران",
    description_en: "Modern portrait using acrylic technique, representing contemporary Iranian art",
    type: "artwork",
    category: "paintings",
    price: 1800000,
    stock_quantity: 1,
    is_digital: false,
    featured_image: {
      url: "https://example.com/images/modern-portrait.jpg",
      alt: "پرتره مدرن",
    },
    tags: ["پرتره", "مدرن", "آکریلیک", "هنر معاصر"],
    artist: "رضا کریمی",
    artist_en: "Reza Karimi",
    artwork_year: 2023,
    artwork_style: "مدرن",
    dimensions: {
      width: 60,
      height: 80,
      unit: "cm",
    },
    materials: ["رنگ آکریلیک", "بوم"],
    language: "fa",
    is_featured: false,
    is_bestseller: true,
    is_new: false,
  },

  // Digital Art
  {
    title: "طراحی دیجیتال خوشنویسی",
    title_en: "Digital Calligraphy Design",
    description: "اثر هنری دیجیتال با موضوع خوشنویسی ایرانی، قابل چاپ با کیفیت بالا",
    description_en: "Digital artwork featuring Iranian calligraphy, available for high-quality printing",
    type: "artwork",
    category: "digital_art",
    price: 150000,
    stock_quantity: undefined,
    is_digital: true,
    featured_image: {
      url: "https://example.com/images/digital-calligraphy.jpg",
      alt: "طراحی دیجیتال خوشنویسی",
    },
    tags: ["دیجیتال آرت", "خوشنویسی", "طراحی", "گرافیک"],
    artist: "سارا رضایی",
    artist_en: "Sara Rezaei",
    artwork_year: 2023,
    artwork_style: "دیجیتال",
    file_url: "https://example.com/files/digital-calligraphy.png",
    file_size: 52428800, // 50MB
    file_format: "png",
    specifications: {
      resolution: "300 DPI",
      dimensions: "4000x3000 pixels",
      format: "PNG",
    },
    language: "fa",
    is_featured: false,
    is_bestseller: false,
    is_new: true,
  },

  // Articles
  {
    title: "بررسی تأثیر هوش مصنوعی در هنر معاصر",
    title_en: "Examining the Impact of AI on Contemporary Art",
    description: "مقاله پژوهشی درباره تأثیر تکنولوژی هوش مصنوعی بر هنر معاصر و آینده خلاقیت",
    description_en: "Research article on the impact of AI technology on contemporary art and the future of creativity",
    type: "article",
    category: "articles",
    price: 45000,
    stock_quantity: undefined,
    is_digital: true,
    featured_image: {
      url: "https://example.com/images/ai-art-article.jpg",
      alt: "مقاله هوش مصنوعی و هنر",
    },
    tags: ["هوش مصنوعی", "هنر معاصر", "تکنولوژی", "پژوهش"],
    author: "دکتر فاطمه محمدی",
    author_en: "Dr. Fatemeh Mohammadi",
    publisher: "مجله هنر و تکنولوژی",
    publication_date: new Date("2023-05-15"),
    language: "fa",
    page_count: 25,
    file_url: "https://example.com/files/ai-art-research.pdf",
    file_size: 2097152, // 2MB
    file_format: "pdf",
    is_featured: false,
    is_bestseller: false,
    is_new: true,
  },

  // Cultural Items
  {
    title: "فرش دستباف کاشان",
    title_en: "Handwoven Kashan Carpet",
    description: "فرش دستباف اصیل کاشان با نقوش سنتی و کیفیت عالی، ساخت استادکاران کاشانی",
    description_en: "Authentic handwoven Kashan carpet with traditional patterns and excellent quality, made by Kashan master craftsmen",
    type: "cultural",
    category: "handicrafts",
    price: 15000000,
    discounted_price: 13500000,
    stock_quantity: 3,
    is_digital: false,
    featured_image: {
      url: "https://example.com/images/kashan-carpet.jpg",
      alt: "فرش دستباف کاشان",
      width: 800,
      height: 600,
    },
    gallery: [
      {
        url: "https://example.com/images/carpet-detail-1.jpg",
        alt: "جزئیات نقوش فرش",
      },
      {
        url: "https://example.com/images/carpet-detail-2.jpg",
        alt: "بافت و کیفیت فرش",
      },
    ],
    tags: ["فرش", "دستباف", "کاشان", "صنایع دستی", "سنتی"],
    specifications: {
      knot_density: "700 گره در اینچ مربع",
      material: "پشم و ابریشم",
      weaving_technique: "دستباف سنتی",
      origin: "کاشان، ایران",
    },
    dimensions: {
      width: 200,
      height: 300,
      unit: "cm",
    },
    weight: {
      value: 25,
      unit: "kg",
    },
    materials: ["پشم", "ابریشم", "رنگ طبیعی"],
    language: "fa",
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    meta_title: "فرش دستباف کاشان - خرید فرش اصیل ایرانی",
    meta_description: "خرید فرش دستباف اصیل کاشان با نقوش سنتی. کیفیت عالی، ضمانت اصالت و ارسال رایگان.",
    seo_keywords: ["فرش کاشان", "دستباف", "صنایع دستی", "فرش ایرانی"],
  },

  // Educational Books
  {
    title: "تاریخ هنر ایران",
    title_en: "History of Iranian Art",
    description: "بررسی جامع تاریخ هنر ایران از دوران باستان تا معاصر، مناسب برای دانشجویان و علاقه‌مندان",
    description_en: "Comprehensive review of Iranian art history from ancient times to contemporary, suitable for students and enthusiasts",
    type: "book",
    category: "educational",
    price: 280000,
    stock_quantity: 30,
    is_digital: false,
    featured_image: {
      url: "https://example.com/images/iranian-art-history.jpg",
      alt: "کتاب تاریخ هنر ایران",
    },
    tags: ["تاریخ هنر", "ایران", "آموزشی", "دانشگاهی"],
    author: "دکتر احمد نصیری",
    author_en: "Dr. Ahmad Nasiri",
    publisher: "انتشارات دانشگاه تهران",
    publication_date: new Date("2023-02-01"),
    language: "fa",
    page_count: 520,
    is_featured: false,
    is_bestseller: false,
    is_new: true,
  },

  // More Digital Books
  {
    title: "راهنمای کامل عکاسی هنری",
    title_en: "Complete Guide to Artistic Photography",
    description: "آموزش کامل تکنیک‌های عکاسی هنری، ترکیب‌بندی، نورپردازی و ویرایش عکس",
    description_en: "Complete tutorial on artistic photography techniques, composition, lighting, and photo editing",
    type: "book",
    category: "digital_books",
    price: 95000,
    stock_quantity: undefined,
    is_digital: true,
    tags: ["عکاسی", "آموزش", "هنری", "تکنیک"],
    author: "مهدی رستمی",
    publication_date: new Date("2023-07-10"),
    language: "fa",
    page_count: 180,
    file_url: "https://example.com/files/photography-guide.pdf",
    file_size: 25165824, // 24MB
    file_format: "pdf",
    is_featured: false,
    is_bestseller: true,
    is_new: true,
  },
];

// Seeding function
export class ProductSeeder {
  private _productModel?: any;

  private get productModel() {
    if (!this._productModel) {
      this._productModel = product_models();
    }
    return this._productModel;
  }

  async seedProducts(clearExisting: boolean = false): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      // Clear existing products if requested
      if (clearExisting) {
        await this.productModel.deleteMany({});
        console.log("Cleared existing products");
      }

      const results = [];
      const errors = [];

      for (const productData of sampleProducts) {
        try {
          // Generate slug from title
          const slug = this.generateSlug(productData.title);

          // Check if product with same slug already exists
          const existingProduct = await this.productModel.findOne({ slug });
          if (existingProduct) {
            console.log(`Product with slug "${slug}" already exists, skipping...`);
            continue;
          }

          // Prepare product for insertion
          const productForInsertion = {
            ...productData,
            slug,
            specifications: productData.specifications ? JSON.stringify(productData.specifications) : undefined,
            created_at: new Date(),
            updated_at: new Date(),
            view_count: Math.floor(Math.random() * 1000),
            purchase_count: Math.floor(Math.random() * 50),
            rating: {
              average: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Random rating between 3-5
              count: Math.floor(Math.random() * 20),
            },
          };

          const result = await this.productModel.insertOne(productForInsertion);
          results.push({
            title: productData.title,
            id: result.insertedId,
            slug,
          });

          console.log(`✅ Created product: ${productData.title}`);
        } catch (error) {
          errors.push({
            title: productData.title,
            error: error.message,
          });
          console.error(`❌ Failed to create product "${productData.title}":`, error.message);
        }
      }

      return {
        success: true,
        message: `Product seeding completed. Created ${results.length} products.`,
        details: {
          created: results,
          errors,
          total_processed: sampleProducts.length,
          success_count: results.length,
          error_count: errors.length,
        },
      };
    } catch (error) {
      console.error("Error in product seeding:", error);
      return {
        success: false,
        message: "Failed to seed products",
        details: {
          error: error.message,
          stack: error.stack,
        },
      };
    }
  }

  async seedFeaturedProducts(): Promise<any> {
    try {
      // Update random products to be featured
      const products = await this.productModel.find({ status: "active" }).limit(5).toArray();

      for (const product of products) {
        await this.productModel.updateOne(
          { _id: product._id },
          { $set: { is_featured: true } }
        );
      }

      return {
        success: true,
        message: `Set ${products.length} products as featured`,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to set featured products",
        details: error.message,
      };
    }
  }

  async seedBestsellerProducts(): Promise<any> {
    try {
      // Update products with high purchase count to be bestsellers
      await this.productModel.updateMany(
        { purchase_count: { $gte: 30 } },
        { $set: { is_bestseller: true } }
      );

      return {
        success: true,
        message: "Updated bestseller products based on purchase count",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to set bestseller products",
        details: error.message,
      };
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  }

  async getStats(): Promise<any> {
    try {
      const total = await this.productModel.countDocuments({});
      const active = await this.productModel.countDocuments({ status: "active" });
      const featured = await this.productModel.countDocuments({ is_featured: true });
      const bestsellers = await this.productModel.countDocuments({ is_bestseller: true });
      const digital = await this.productModel.countDocuments({ is_digital: true });
      const physical = await this.productModel.countDocuments({ is_digital: false });

      // Get category counts
      const categoryStats = await this.productModel.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();

      // Get type counts
      const typeStats = await this.productModel.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();

      return {
        success: true,
        data: {
          totals: {
            total,
            active,
            featured,
            bestsellers,
            digital,
            physical,
          },
          categories: categoryStats,
          types: typeStats,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get product statistics",
        details: error.message,
      };
    }
  }
}

export const productSeeder = new ProductSeeder();
