import { type ActFn, ObjectId } from "@deps";
import { article, coreApp } from "../../../mod.ts";

export const archiveArticleFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const { _id, current_article, ...updateData } = set;

  try {
    // Prepare update object
    const updateFields = {
      status: "Archived",
      archive_date: updateData.archive_date,
      last_modified_by_name: updateData.last_modified_by_name,
      updated_at: new Date(),

      // Clear featured flags when archiving
      featured: false,
      pinned: false,
      featured_on_homepage: false,

      // Clear scheduled publishing if set
      scheduled_at: null,
    };

    // Update the article
    const archivedArticle = await article.updateOne({
      filter: { _id: new ObjectId(_id) },
      update: {
        $set: updateFields,
      },
      projection: get,
    });

    if (!archivedArticle) {
      return {
        success: false,
        message: "خطا در آرشیو کردن مقاله / Error archiving article",
        error: "ARCHIVE_FAILED"
      };
    }

    // Optional: Update counters and perform cleanup
    try {
      const updatePromises = [];

      // If article was published before, decrement published article counts
      if (current_article.status === "Published") {
        // Decrement author's published article count
        updatePromises.push(
          coreApp.odm.db.collection("users").updateOne(
            {
              _id: current_article.author._id,
              published_articles_count: { $gt: 0 }
            },
            { $inc: { published_articles_count: -1 } }
          )
        );

        // Decrement category article count if article has category
        if (current_article.category?._id) {
          updatePromises.push(
            coreApp.odm.db.collection("categories").updateOne(
              {
                _id: current_article.category._id,
                articles_count: { $gt: 0 }
              },
              { $inc: { articles_count: -1 } }
            )
          );
        }
      }

      // Remove article from any featured lists or homepage features
      updatePromises.push(
        // Remove from any user's favorite/recommended lists if needed
        coreApp.odm.db.collection("users").updateMany(
          { "favorite_articles._id": new ObjectId(_id) },
          { $pull: { "favorite_articles": { _id: new ObjectId(_id) } } }
        )
      );

      await Promise.all(updatePromises);
    } catch (cleanupError) {
      // Don't fail the archive if cleanup fails
      console.warn("Post-archive cleanup failed:", cleanupError);
    }

    return {
      success: true,
      data: archivedArticle,
      message: "مقاله با موفقیت آرشیو شد / Article archived successfully"
    };

  } catch (error) {
    console.error("Error in archiveArticle:", error);
    return {
      success: false,
      message: "خطا در آرشیو کردن مقاله / Error archiving article",
      error: error.message
    };
  }
};
