import { article, course, product, coreApp } from "../mod.ts";

async function verifyModels() {
  console.log("🔍 Verifying all models are properly loaded...");

  try {
    // Check if models exist
    if (!course) {
      throw new Error("Course model not found");
    }
    console.log("✅ Course model loaded successfully");

    if (!article) {
      throw new Error("Article model not found");
    }
    console.log("✅ Article model loaded successfully");

    if (!product) {
      throw new Error("Product model not found");
    }
    console.log("✅ Product model loaded successfully");

    // Check if ODM is properly initialized
    if (!coreApp.odm) {
      throw new Error("ODM not initialized");
    }
    console.log("✅ ODM initialized successfully");

    // List all registered models
    const schemas = coreApp.schemas.getSchemas();
    console.log("\n📋 Registered models:");
    Object.keys(schemas).forEach(modelName => {
      console.log(`   - ${modelName}`);
    });

    console.log("\n🎉 All models verified successfully!");
    console.log("✅ Database models are ready for seeding");

  } catch (error) {
    console.error("❌ Model verification failed:");
    console.error(error.message);
    Deno.exit(1);
  }
}

// Run verification
if (import.meta.main) {
  await verifyModels();
}
