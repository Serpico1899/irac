// Direct database queries to work around model registration issues
import { coreApp } from "@app";

export class DirectQueryService {
  static async getUserScore(userId: string) {
    try {
      const collection = coreApp.odm.db.collection("user_level");
      const userLevel = await collection.findOne({
        "user._id": coreApp.odm.ObjectId(userId)
      });

      if (!userLevel) {
        // Create initial user level
        const initialData = {
          _id: coreApp.odm.ObjectId(),
          user: { _id: coreApp.odm.ObjectId(userId) },
          current_points: 0,
          total_lifetime_points: 0,
          level: 1,
          status: "active",
          achievements: [],
          achievement_count: 0,
          points_to_next_level: 500,
          level_progress_percentage: 0,
          created_at: new Date(),
          updated_at: new Date()
        };

        await collection.insertOne(initialData);
        return { success: true, data: initialData };
      }

      return { success: true, data: userLevel };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getUserReferrals(userId: string) {
    try {
      const collection = coreApp.odm.db.collection("referral");
      const referrals = await collection.find({
        "referrer._id": coreApp.odm.ObjectId(userId)
      }).limit(10).toArray();

      return { success: true, data: referrals };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getUserBookings(userId: string) {
    try {
      const collection = coreApp.odm.db.collection("booking");
      const bookings = await collection.find({
        "user._id": coreApp.odm.ObjectId(userId)
      }).limit(10).toArray();

      return { success: true, data: bookings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getCourses(limit = 10, skip = 0) {
    try {
      const collection = coreApp.odm.db.collection("course");
      const courses = await collection.find({
        status: "Active"
      })
        .limit(limit)
        .skip(skip)
        .toArray();

      const totalCourses = await collection.countDocuments({ status: "Active" });

      return {
        success: true,
        data: {
          courses,
          total: totalCourses,
          hasMore: (skip + limit) < totalCourses
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getArticles(limit = 10, skip = 0) {
    try {
      const collection = coreApp.odm.db.collection("article");
      const articles = await collection.find({
        status: "Published"
      })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();

      const totalArticles = await collection.countDocuments({ status: "Published" });

      return {
        success: true,
        data: {
          articles,
          total: totalArticles,
          hasMore: (skip + limit) < totalArticles
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getCourse(courseId: string) {
    try {
      const collection = coreApp.odm.db.collection("course");
      const course = await collection.findOne({
        _id: coreApp.odm.ObjectId(courseId)
      });

      return { success: true, data: course };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getArticle(articleId: string) {
    try {
      const collection = coreApp.odm.db.collection("article");
      const article = await collection.findOne({
        _id: coreApp.odm.ObjectId(articleId)
      });

      return { success: true, data: article };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getSystemStats() {
    try {
      const collections = {
        users: await coreApp.odm.db.collection("user").countDocuments(),
        courses: await coreApp.odm.db.collection("course").countDocuments(),
        articles: await coreApp.odm.db.collection("article").countDocuments(),
        products: await coreApp.odm.db.collection("product").countDocuments(),
        orders: await coreApp.odm.db.collection("order").countDocuments(),
        bookings: await coreApp.odm.db.collection("booking").countDocuments(),
        user_levels: await coreApp.odm.db.collection("user_level").countDocuments(),
        referrals: await coreApp.odm.db.collection("referral").countDocuments()
      };

      return { success: true, data: collections };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
