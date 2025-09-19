import { type ActFn, ObjectId } from "@deps";
import { courses } from "@model";

const deleteCourseFn: ActFn = async (body) => {
  const { filter, get } = body.details;

  const courseId = filter._id;

  // Get the course before deletion for cleanup and return
  const courseToDelete = await courses().findOne({
    filter: { _id: new ObjectId(courseId) },
    projection: get,
  });

  if (!courseToDelete) {
    throw new Error("دوره مورد نظر یافت نشد");
  }

  // Clean up related collections and reverse relationships

  // 1. Remove course from users' enrolled_courses and taught_courses
  if (courseToDelete.details.enrolled_users?.length > 0) {
    await coreApp.odm.db.collection("users").updateMany(
      { _id: { $in: courseToDelete.details.enrolled_users.map((u: any) => u._id) } },
      { $pull: { enrolled_courses: new ObjectId(courseId) } }
    );
  }

  if (courseToDelete.details.instructor?._id) {
    await coreApp.odm.db.collection("users").updateOne(
      { _id: new ObjectId(courseToDelete.details.instructor._id) },
      { $pull: { taught_courses: new ObjectId(courseId) } }
    );
  }

  if (courseToDelete.details.creator?._id) {
    await coreApp.odm.db.collection("users").updateOne(
      { _id: new ObjectId(courseToDelete.details.creator._id) },
      { $pull: { created_courses: new ObjectId(courseId) } }
    );
  }

  // 2. Remove course from categories
  if (courseToDelete.details.category?._id) {
    await coreApp.odm.db.collection("categories").updateOne(
      { _id: new ObjectId(courseToDelete.details.category._id) },
      { $pull: { courses: new ObjectId(courseId) } }
    );
  }

  // 3. Remove course from tags
  if (courseToDelete.details.tags?.length > 0) {
    await coreApp.odm.db.collection("tags").updateMany(
      { _id: { $in: courseToDelete.details.tags.map((t: any) => t._id) } },
      { $pull: { courses: new ObjectId(courseId) } }
    );
  }

  // 4. Remove course from related courses (bidirectional cleanup)
  if (courseToDelete.details.related_courses?.length > 0) {
    await coreApp.odm.db.collection("courses").updateMany(
      { _id: { $in: courseToDelete.details.related_courses.map((c: any) => c._id) } },
      { $pull: { related_courses: new ObjectId(courseId) } }
    );
  }

  // 5. Remove course from other courses' prerequisite lists
  await coreApp.odm.db.collection("courses").updateMany(
    { prerequisite_courses: new ObjectId(courseId) },
    { $pull: { prerequisite_courses: new ObjectId(courseId) } }
  );

  // 6. Remove course from other courses' related courses lists
  await coreApp.odm.db.collection("courses").updateMany(
    { related_courses: new ObjectId(courseId) },
    { $pull: { related_courses: new ObjectId(courseId) } }
  );

  // 7. Delete any cancelled enrollments for this course
  await coreApp.odm.db.collection("enrollments").deleteMany({
    course: new ObjectId(courseId),
    status: { $in: ["Cancelled", "Rejected"] }
  });

  // 8. Update articles that reference this course
  await coreApp.odm.db.collection("articles").updateMany(
    { related_courses: new ObjectId(courseId) },
    { $pull: { related_courses: new ObjectId(courseId) } }
  );

  // 9. Handle bookings if any (workshop locations, etc.)
  await coreApp.odm.db.collection("bookings").updateMany(
    { related_course: new ObjectId(courseId) },
    { $unset: { related_course: "" } }
  );

  // 10. Finally delete the course document
  const deletedCourse = await courses().deleteOne({
    filter: { _id: new ObjectId(courseId) },
    hardCascade: false, // We handled cascading manually above
  });

  // Log the deletion
  console.log(`Course deleted successfully: ${courseToDelete.details.name} (ID: ${courseId})`);
  console.log(`Course type: ${courseToDelete.details.type}, Status: ${courseToDelete.details.status}`);

  return {
    success: true,
    deletedCourse: courseToDelete,
    message: "دوره با موفقیت حذف شد",
    deletedAt: new Date(),
  };
};

export default deleteCourseFn;
