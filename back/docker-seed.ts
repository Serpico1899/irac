#!/usr/bin/env deno run --allow-all
import { MongoClient, ObjectId } from "@deps";

// --- CONFIG ---
const MONGO_URI = Deno.env.get("MONGO_URI") || "mongodb://mongo:27017/";
const DB_NAME = Deno.env.get("DB_NAME") || "nejat";

const client = new MongoClient(MONGO_URI);
await client.connect();
const db = client.db(DB_NAME);

// --- UTILS ---
function oid() {
  return new ObjectId();
}
function now() {
  return new Date();
}

// --- CLEAR ---
if (Deno.args.includes("--clear")) {
  for (const col of [
    "user", "user_level", "category", "tag",
    "course", "workshop", "article", "booking"
  ]) {
    await db.collection(col).deleteMany({});
  }
  console.log("✨ Cleared old data");
}

// --- SEED USER LEVELS ---
const userLevels = [
  { _id: oid(), name: "Manager" },
  { _id: oid(), name: "Editor" },
  { _id: oid(), name: "Ordinary" },
];
await db.collection("user_level").insertMany(userLevels);

// --- SEED USERS ---
const users = [
  {
    _id: oid(),
    first_name: "علی",
    last_name: "احمدی",
    father_name: "محمد",
    mobile: "09121234567",
    gender: "Male",
    national_number: "1234567890",
    address: "تهران، خیابان ولیعصر، پلاک 123",
    level: userLevels[0]._id, // Manager
    is_verified: true,
    summary: "مدیر کل مرکز معماری ایرانی",
    birth_date: new Date("1980-01-01"),
    createdAt: now(),
    updatedAt: now(),
  },
  {
    _id: oid(),
    first_name: "سارا",
    last_name: "محمدی",
    father_name: "حسین",
    mobile: "09127654321",
    gender: "Female",
    national_number: "1234567891",
    address: "تهران، خیابان انقلاب، پلاک 456",
    level: userLevels[1]._id, // Editor
    is_verified: true,
    summary: "مدیر برنامه‌های آموزشی",
    birth_date: new Date("1985-03-15"),
    createdAt: now(),
    updatedAt: now(),
  }
];
await db.collection("user").insertMany(users);

// --- SEED CATEGORIES & TAGS ---
const categories = [
  { _id: oid(), name: "معماری اسلامی", description: "معماری سنتی ایران", createdAt: now(), updatedAt: now() },
  { _id: oid(), name: "معماری معاصر", description: "معماری مدرن", createdAt: now(), updatedAt: now() },
];
await db.collection("category").insertMany(categories);

const tags = [
  { _id: oid(), name: "گنبد", description: "المان‌های گنبدی", createdAt: now(), updatedAt: now() },
  { _id: oid(), name: "BIM", description: "مدل‌سازی اطلاعات ساختمان", createdAt: now(), updatedAt: now() },
];
await db.collection("tag").insertMany(tags);

// --- SEED COURSES ---
const courses = [
  {
    _id: oid(),
    name: "مقدمه‌ای بر معماری اسلامی",
    name_en: "Intro to Islamic Architecture",
    description: "دوره جامع آشنایی با اصول و مبانی معماری اسلامی",
    status: "Active",
    type: "Course",
    price: 2500000,
    is_free: false,
    instructor: users[0]._id,
    category: categories[0]._id,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    _id: oid(),
    name: "معماری پایدار",
    name_en: "Sustainable Architecture",
    description: "اصول ساخت‌وساز سبز و پایدار",
    status: "Active",
    type: "Course",
    price: 3000000,
    is_free: false,
    instructor: users[1]._id,
    category: categories[1]._id,
    createdAt: now(),
    updatedAt: now(),
  }
];
await db.collection("course").insertMany(courses);

// --- SEED WORKSHOPS ---
const workshops = [
  {
    _id: oid(),
    name: "کارگاه AutoCAD",
    name_en: "AutoCAD Workshop",
    description: "کارگاه عملی طراحی با AutoCAD",
    status: "Active",
    type: "Workshop",
    price: 1800000,
    is_free: false,
    instructor: users[1]._id,
    category: categories[1]._id,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    _id: oid(),
    name: "کارگاه مرمت بنا",
    name_en: "Restoration Workshop",
    description: "مرمت عملی بناهای تاریخی",
    status: "Active",
    type: "Workshop",
    price: 2200000,
    is_free: false,
    instructor: users[0]._id,
    category: categories[0]._id,
    createdAt: now(),
    updatedAt: now(),
  }
];
await db.collection("workshop").insertMany(workshops);

// --- SEED ARTICLES ---
const articles = [
  {
    _id: oid(),
    name: "معماری اسلامی در ایران",
    description: "تحلیل معماری اسلامی ایرانی",
    slug: "iran-islamic-architecture",
    author_name: "دکتر علی احمدی",
    is_published: true,
    views_count: 150,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    _id: oid(),
    name: "تکنولوژی BIM",
    description: "کاربرد BIM در معماری",
    slug: "bim-technology",
    author_name: "مهندس محمدی",
    is_published: true,
    views_count: 200,
    createdAt: now(),
    updatedAt: now(),
  }
];
await db.collection("article").insertMany(articles);

// --- SEED BOOKINGS ---
const bookings = [
  {
    _id: oid(),
    booking_number: "BK001",
    space_type: "private_office",
    space_name: "دفتر خصوصی 1",
    booking_date: now(),
    start_time: "09:00",
    end_time: "17:00",
    status: "confirmed",
    user: users[0]._id,
    createdAt: now(),
    updatedAt: now(),
  }
];
await db.collection("booking").insertMany(bookings);

console.log("✅ Seeding completed successfully!");
await client.close();
