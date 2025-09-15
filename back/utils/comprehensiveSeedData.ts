// Comprehensive Seed Data Service for IRAC
import { coreApp } from "../mod.ts";

export class ComprehensiveSeedService {
  static async seedUsers() {
    console.log("👥 Seeding Users...");

    const userCollection = coreApp.odm.db.collection("user");

    const sampleUsers = [
      {
        _id: coreApp.odm.ObjectId(),
        name: "علی احمدی",
        email: "ali.ahmadi@example.com",
        phone: "+98912345678",
        profile: {
          firstName: "علی",
          lastName: "احمدی",
          bio: "معماری با تجربه",
          avatar: "/images/avatars/ali.jpg"
        },
        preferences: {
          language: "fa",
          theme: "light",
          notifications: true
        },
        status: "active",
        level: "Editor",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: coreApp.odm.ObjectId(),
        name: "Sara Mohammadi",
        email: "sara.mohammadi@example.com",
        phone: "+98912345679",
        profile: {
          firstName: "Sara",
          lastName: "Mohammadi",
          bio: "Interior Designer",
          avatar: "/images/avatars/sara.jpg"
        },
        preferences: {
          language: "en",
          theme: "dark",
          notifications: true
        },
        status: "active",
        level: "Ordinary",
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    try {
      for (const user of sampleUsers) {
        await userCollection.insertOne(user);
      }
      console.log(`✅ Seeded ${sampleUsers.length} users`);
      return { success: true, count: sampleUsers.length };
    } catch (error) {
      console.log(`❌ User seeding error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  static async seedProducts() {
    console.log("🛍️ Seeding Products...");

    const productCollection = coreApp.odm.db.collection("product");

    const sampleProducts = [
      {
        _id: coreApp.odm.ObjectId(),
        name: "کتاب معماری معاصر ایران",
        name_en: "Contemporary Iranian Architecture Book",
        description: "مجموعه‌ای جامع از آثار معماری معاصر ایران",
        description_en: "Comprehensive collection of contemporary Iranian architecture",
        type: "book",
        category: "architecture",
        price: 250000,
        discount_price: 200000,
        inventory: 50,
        images: ["/images/products/book1.jpg"],
        specifications: {
          pages: 320,
          publisher: "نشر معمار",
          language: "Persian",
          isbn: "978-600-123-456-7"
        },
        tags: ["معماری", "کتاب", "ایران"],
        status: "active",
        featured: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: coreApp.odm.ObjectId(),
        name: "دوره آنلاین طراحی داخلی",
        name_en: "Online Interior Design Course",
        description: "دوره جامع طراحی داخلی از مبتدی تا پیشرفته",
        description_en: "Comprehensive interior design course from beginner to advanced",
        type: "course",
        category: "education",
        price: 1500000,
        discount_price: 1200000,
        inventory: 100,
        images: ["/images/products/course1.jpg"],
        specifications: {
          duration: "40 hours",
          lessons: 25,
          certificate: true,
          instructor: "استاد محمدی"
        },
        tags: ["آموزش", "طراحی داخلی", "آنلاین"],
        status: "active",
        featured: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    try {
      for (const product of sampleProducts) {
        await productCollection.insertOne(product);
      }
      console.log(`✅ Seeded ${sampleProducts.length}
