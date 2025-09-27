import { type ActFn, ObjectId } from "@deps";
import {  article, coreApp  } from "@app";

export const publishArticleFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const { _id, current_article, ...updateData } = set;

  try {
    // Prepare update object
    const updateFields = {
      status: "Published",
      published_at: updateData.published_at,
      last_modified_by_name: updateData.last_modified_by_name,
      scheduled_at: null, // Clear any scheduled date
      updated_at: new Date(),

      // Initialize engagement metrics if not already set
      view_count: current_article.view_count || 0,
      like_count: current_article.like_count || 0,
      comment_count: current_article.comment_count || 0,
      share_count: current_article.share_count || 0,
    };

    // If article was previously archived, clear archive date
    if (current_article.status === "Archived") {
      updateFields.archive_date = null;
    }

    // Calculate estimated reading time if not set
    if (!current_article.estimated_reading_time && current_article.content) {
      const wordCount = current_article.content.split(/\s+/).length;
      const averageWPM = 200; // Average words per minute reading speed
      updateFields.estimated_reading_time = Math.ceil(wordCount / averageWPM);
    }

    // Update the article
    const publishedArticle = await article.updateOne({
      filter: { _id: new ObjectId(_id) },
      update: {
        $set: updateFields,
      },
      projection: get,
    });

    if (!publishedArticle) {
      return {
        success: false,
        message: "خطا در انتشار مقاله / Error publishing article",
        error: "PUBLISH_FAILED"
      };
    }

    // Optional: Trigger any post-publish actions
    try {
      // Could trigger notifications, search index updates, etc.
      // For now, we'll just log success
      console.log(`Article published successfully: ${_id}`);

      // Could also update author's article count or other metrics
      await Promise.all([
        // Update author's published article count
        coreApp.odm.db.collection("users").updateOne(
          { _id: current_article.author._id },
          { $inc: { published_articles_count: 1 } }
        ),

        // Update category article count if article has category
        ...(current_article.category?._id ? [
          coreApp.odm.db.collection("categories").updateOne(
            { _id: current_article.category._id },
            { $inc: { articles_count: 1 } }
          )
        ] : []),
      ]);
    } catch (postPublishError) {
      // Don't fail the publish if post-actions fail
      console.warn("Post-publish actions failed:", postPublishError);
    }

    return {
      success: true,
      data: publishedArticle,
      message: "مقاله با موفقیت منتشر شد / Article published successfully"
    };

  } catch (error) {
    console.error("Error in publishArticle:", error);
    return {
      success: false,
      message: "خطا در انتشار مقاله / Error publishing article",
      error: error.message
    };
  }
};
