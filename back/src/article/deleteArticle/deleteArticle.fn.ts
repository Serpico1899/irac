import { type ActFn, ObjectId } from "@deps";
import { article, coreApp } from "../../../mod.ts";

export const deleteArticleFn: ActFn = async (body) => {
  const { set: { _id }, get } = body.details;

  try {
    // Delete the article
    const deletedArticle = await article.deleteOne({
      filter: { _id: new ObjectId(_id) },
      projection: get,
    });

    if (!deletedArticle) {
      return {
        success: false,
        message: "مقاله یافت نشد یا قبلاً حذف شده است / Article not found or already deleted",
        error: "ARTICLE_NOT_FOUND"
      };
    }

    // Optional: Clean up related references in other collections
    try {
      // Remove article from users' liked_articles, bookmarked_articles
      await Promise.all([
        // Remove from users' liked articles
        coreApp.odm.db.collection("users").updateMany(
          { "liked_articles._id": new ObjectId(_id) },
          { $pull: { "liked_articles": { _id: new ObjectId(_id) } } }
        ),

        // Remove from users' bookmarked articles
        coreApp.odm.db.collection("users").updateMany(
          { "bookmarked_articles._id": new ObjectId(_id) },
          { $pull: { "bookmarked_articles": { _id: new ObjectId(_id) } } }
        ),

        // Remove from other articles' related_articles
        coreApp.odm.db.collection("articles").updateMany(
          { "related_articles._id": new ObjectId(_id) },
          { $pull: { "related_articles": { _id: new ObjectId(_id) } } }
        ),

        // Remove from courses' related_articles
        coreApp.odm.db.collection("courses").updateMany(
          { "related_articles._id": new ObjectId(_id) },
          { $pull: { "related_articles": { _id: new ObjectId(_id) } } }
        )
      ]);
    } catch (cleanupError) {
      // Log cleanup errors but don't fail the deletion
      console.warn("Article deletion cleanup failed:", cleanupError);
    }

    return {
      success: true,
      data: deletedArticle,
      message: "مقاله با موفقیت حذف شد / Article deleted successfully"
    };

  } catch (error) {
    console.error("Error in deleteArticle:", error);
    return {
      success: false,
      message: "خطا در حذف مقاله / Error deleting article",
      error: error.message
    };
  }
};
