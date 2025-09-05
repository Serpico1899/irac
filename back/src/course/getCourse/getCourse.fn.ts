import { ActFn, ObjectId } from "@deps";
import { courses, enrollments } from "@model";

export interface GetCourseInput {
  // Course identifier (either id or slug)
  course_id?: string;
  slug?: string;

  // User context for enrollment status
  user_id?: string;

  // Relations to populate
  populate?: string[];
}

export interface GetCourseOutput {
  course: any;
  enrollment_status?: {
    is_enrolled: boolean;
    enrollment_date?: Date;
    progress_percentage?: number;
    status?: string;
  };
  related_courses?: any[];
  instructor_courses?: any[];
}

const getCourseHandler: ActFn = async (body) => {
  const {
    course_id,
    slug,
    user_id,
    populate = [
      "category",
      "tags",
      "featured_image",
      "gallery",
      "instructor",
      "related_courses"
    ]
  }: GetCourseInput = body.details;

  try {
    // Validate input - must have either course_id or slug
    if (!course_id && !slug) {
      return {
        success: false,
        message: "شناسه دوره یا اسلاگ الزامی است / Course ID or slug is required"
      };
    }

    // Build aggregation pipeline for course lookup
    const pipeline: any[] = [];

    // Match stage - find course by ID or slug
    const matchFilter: any = {};
    if (course_id) {
      matchFilter._id = new ObjectId(course_id);
    } else if (slug) {
      matchFilter.slug = slug;
    }

    pipeline.push({ $match: matchFilter });

    // Add lookup stages for populated fields
    if (populate.includes("category")) {
      pipeline.push({
        $lookup: {
          from: "categories",
          localField: "category._id",
          foreignField: "_id",
          as: "category_details"
        }
      });
      pipeline.push({
        $addFields: {
          "category.details": { $arrayElemAt: ["$category_details", 0] }
        }
      });
    }

    if (populate.includes("tags")) {
      pipeline.push({
        $lookup: {
          from: "tags",
          localField: "tags._id",
          foreignField: "_id",
          as: "tags_details"
        }
      });
      pipeline.push({
        $addFields: {
          "tags.details": "$tags_details"
        }
      });
    }

    if (populate.includes("featured_image")) {
      pipeline.push({
        $lookup: {
          from: "files",
          localField: "featured_image._id",
          foreignField: "_id",
          as: "featured_image_details"
        }
      });
      pipeline.push({
        $addFields: {
          "featured_image.details": { $arrayElemAt: ["$featured_image_details", 0] }
        }
      });
    }

    if (populate.includes("gallery")) {
      pipeline.push({
        $lookup: {
          from: "files",
          localField: "gallery._id",
          foreignField: "_id",
          as: "gallery_details"
        }
      });
      pipeline.push({
        $addFields: {
          "gallery.details": "$gallery_details"
        }
      });
    }

    if (populate.includes("instructor")) {
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "instructor._id",
          foreignField: "_id",
          as: "instructor_details",
          pipeline: [
            {
              $project: {
                first_name: 1,
                last_name: 1,
                summary: 1,
                avatar: 1,
                level: 1
              }
            }
          ]
        }
      });
      pipeline.push({
        $addFields: {
          "instructor.details": { $arrayElemAt: ["$instructor_details", 0] }
        }
      });
    }

    if (populate.includes("related_courses")) {
      pipeline.push({
        $lookup: {
          from: "courses",
          localField: "related_courses._id",
          foreignField: "_id",
          as: "related_courses_details",
          pipeline: [
            { $match: { status: "Active" } },
            {
              $project: {
                name: 1,
                name_en: 1,
                short_description: 1,
                short_description_en: 1,
                price: 1,
                level: 1,
                featured_image: 1,
                slug: 1,
                average_rating: 1,
                total_students: 1
              }
            },
            { $limit: 6 }
          ]
        }
      });
    }

    // Execute the main query
    const [course] = await courses().aggregation().pipeline(pipeline);

    if (!course) {
      return {
        success: false,
        message: "دوره مورد نظر یافت نشد / Course not found"
      };
    }

    // Check if course is accessible (published or user has access)
    if (course.status !== "Active" && !user_id) {
      return {
        success: false,
        message: "دسترسی به این دوره مجاز نیست / Access to this course is not allowed"
      };
    }

    const result: GetCourseOutput = {
      course: course
    };

    // Check user enrollment status if user_id is provided
    if (user_id) {
      const userEnrollment = await enrollments().findOne({
        "user._id": new ObjectId(user_id),
        "course._id": course._id
      });

      if (userEnrollment) {
        result.enrollment_status = {
          is_enrolled: true,
          enrollment_date: userEnrollment.enrollment_date,
          progress_percentage: userEnrollment.progress_percentage,
          status: userEnrollment.status
        };
      } else {
        result.enrollment_status = {
          is_enrolled: false
        };
      }
    }

    // Get additional courses by the same instructor
    if (course.instructor?._id && populate.includes("instructor")) {
      const instructorCourses = await courses().aggregation().pipeline([
        {
          $match: {
            "instructor._id": course.instructor._id,
            _id: { $ne: course._id },
            status: "Active"
          }
        },
        {
          $project: {
            name: 1,
            name_en: 1,
            short_description: 1,
            short_description_en: 1,
            price: 1,
            level: 1,
            featured_image: 1,
            slug: 1,
            average_rating: 1,
            total_students: 1
          }
        },
        { $limit: 4 }
      ]);

      if (instructorCourses.length > 0) {
        result.instructor_courses = instructorCourses;
      }
    }

    // Add related courses to result if populated
    if (populate.includes("related_courses") && course.related_courses_details) {
      result.related_courses = course.related_courses_details;
    }

    // Increment view count (fire and forget)
    courses().updateOne(
      { _id: course._id },
      { $inc: { view_count: 1 } }
    ).catch(err => console.log("Error incrementing view count:", err));

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error("Error in getCourse:", error);
    return {
      success: false,
      message: "خطا در دریافت اطلاعات دوره / Error fetching course details",
      error: error.message
    };
  }
};

export default getCourseHandler;
