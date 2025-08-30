import type { ActFn } from "../../../../deps.ts";
import { course } from "../../../mod.ts";

export const getHomePageDataFn: ActFn = async (body) => {
  const { get } = body.details;

  try {
    // Query featured courses (5 most recent where isFeatured is true)
    let featuredCourses = [];
    try {
      const coursesPipeline = [
        { $match: { isFeatured: { $eq: true } } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 }
      ];

      featuredCourses = await course
        .aggregation({
          pipeline: coursesPipeline,
          projection: get?.courses || {
            title: 1,
            description: 1,
            instructorName: 1,
            price: 1,
            duration: 1,
            imageUrl: 1,
            createdAt: 1,
            isFeatured: 1,
          },
        })
        .toArray();
    } catch (error) {
      console.warn("Error fetching featured courses:", error);
      // If isFeatured field doesn't exist, fallback to most recent courses
      const fallbackPipeline = [
        { $sort: { createdAt: -1 } },
        { $limit: 5 }
      ];

      try {
        featuredCourses = await course
          .aggregation({
            pipeline: fallbackPipeline,
            projection: get?.courses || {
              title: 1,
              description: 1,
              instructorName: 1,
              price: 1,
              duration: 1,
              imageUrl: 1,
              createdAt: 1,
            },
          })
          .toArray();
      } catch (fallbackError) {
        console.error("Error in fallback courses query:", fallbackError);
        featuredCourses = [];
      }
    }

    // Query latest articles (5 most recent, sorted by createdAt)
    let latestArticles = [];
    try {
      // Note: article model doesn't exist yet, so we return empty array
      // When article model is implemented, uncomment and modify this code:
      /*
      const articlesPipeline = [
        { $sort: { createdAt: -1 } },
        { $limit: 5 }
      ];

      latestArticles = await article
        .aggregation({
          pipeline: articlesPipeline,
          projection: get?.articles || {
            title: 1,
            description: 1,
            author: 1,
            createdAt: 1,
            imageUrl: 1,
            slug: 1,
          },
        })
        .toArray();
      */
    } catch (error) {
      console.warn("Articles collection not available:", error);
      latestArticles = [];
    }

    // Query latest products (5 most recent, sorted by createdAt)
    let latestProducts = [];
    try {
      // Note: product model doesn't exist yet, so we return empty array
      // When product model is implemented, uncomment and modify this code:
      /*
      const productsPipeline = [
        { $sort: { createdAt: -1 } },
        { $limit: 5 }
      ];

      latestProducts = await product
        .aggregation({
          pipeline: productsPipeline,
          projection: get?.products || {
            title: 1,
            description: 1,
            price: 1,
            imageUrl: 1,
            createdAt: 1,
            category: 1,
          },
        })
        .toArray();
      */
    } catch (error) {
      console.warn("Products collection not available:", error);
      latestProducts = [];
    }

    // Return unified homepage data structure
    return {
      featuredCourses,
      latestArticles,
      latestProducts,
      meta: {
        timestamp: new Date().toISOString(),
        totalCourses: featuredCourses.length,
        totalArticles: latestArticles.length,
        totalProducts: latestProducts.length,
      }
    };

  } catch (error) {
    console.error("Error in getHomePageData:", error);

    // Return empty structure on error
    return {
      featuredCourses: [],
      latestArticles: [],
      latestProducts: [],
      meta: {
        timestamp: new Date().toISOString(),
        totalCourses: 0,
        totalArticles: 0,
        totalProducts: 0,
        error: "Failed to fetch homepage data"
      }
    };
  }
};
