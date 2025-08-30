import { MongoClient } from "../deps.ts";

const MONGO_URI = Deno.env.get("MONGO_URI") || "mongodb://127.0.0.1:27017/";
const DB_NAME = "nejat";

interface Course {
  title: { en: string; fa: string };
  description: { en: string; fa: string };
  instructorName: string;
  price: number;
  duration: string;
  imageUrl?: string;
  isFeatured?: boolean;
}

interface Article {
  title: { en: string; fa: string };
  authorName: string;
  imageUrl?: string;
}

interface Product {
  title: { en: string; fa: string };
  price: number;
  imageUrl?: string;
}

async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const content = await Deno.readTextFile(filePath);
    return JSON.parse(content) as T[];
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${error.message}`);
  }
}

async function seedCollection<T extends Record<string, any>>(
  collection: any,
  collectionName: string,
  data: T[]
): Promise<void> {
  console.log(`🗑️  Clearing ${collectionName} collection...`);
  await collection.deleteMany({});

  console.log(`🌱 Seeding ${collectionName} with ${data.length} documents...`);

  // Add timestamps to each document
  const documentsWithTimestamps = data.map(doc => ({
    ...doc,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await collection.insertMany(documentsWithTimestamps);
  console.log(`✅ Successfully seeded ${data.length} ${collectionName}`);
}

async function main() {
  let client: MongoClient | null = null;

  try {
    console.log("🚀 Starting database seeding process...");
    console.log(`📡 Connecting to MongoDB at: ${MONGO_URI}`);

    // Connect to MongoDB
    client = new MongoClient();
    await client.connect(MONGO_URI);
    const db = client.database(DB_NAME);

    console.log(`✅ Connected to database: ${DB_NAME}`);

    // Get collections
    const coursesCollection = db.collection("courses");
    const articlesCollection = db.collection("articles");
    const productsCollection = db.collection("products");

    // Read data files
    console.log("\n📖 Reading data files...");
    const coursesData = await readJsonFile<Course>("./seeds/courses.json");
    const articlesData = await readJsonFile<Article>("./seeds/articles.json");
    const productsData = await readJsonFile<Product>("./seeds/products.json");

    console.log(`📚 Loaded ${coursesData.length} courses`);
    console.log(`📰 Loaded ${articlesData.length} articles`);
    console.log(`🛍️  Loaded ${productsData.length} products`);

    // Seed each collection
    console.log("\n🌱 Beginning seeding process...");

    await seedCollection(coursesCollection, "courses", coursesData);
    await seedCollection(articlesCollection, "articles", articlesData);
    await seedCollection(productsCollection, "products", productsData);

    console.log("\n🎉 Database seeded successfully!");
    console.log(`📊 Total documents inserted: ${coursesData.length + articlesData.length + productsData.length}`);

  } catch (error) {
    console.error("❌ Error during seeding process:");
    console.error(error.message);
    Deno.exit(1);
  } finally {
    // Close database connection
    if (client) {
      console.log("\n🔌 Closing database connection...");
      await client.close();
      console.log("✅ Database connection closed");
    }
  }
}

// Run the seeding script
if (import.meta.main) {
  main().catch(console.error);
}
