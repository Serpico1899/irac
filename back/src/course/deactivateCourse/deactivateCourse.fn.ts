import { type ActFn, ObjectId } from "@deps";
import { courses } from "@model";

const deactivateCourseFn: ActFn = async (body) => {
  const { filter, get, set } = body.details;

  const courseId = filter._id;

  // Update the course with new status and deactivation info
  const deactivatedCourse = await courses().updateOne({
    filter: { _id: new ObjectId(courseId) },
    doc: {
      ...set, // Includes status, deactivated_at, and other fields set in preAct
    },
    projection: get,
  });

  if (!deactivatedCourse) {
    throw new Error("خطا در غیرفعال‌سازی دوره");
  }

  // Log the deactivation
  console.log(`Course deactivated successfully: ${deactivatedCourse.details.name} (ID: ${courseId})`);
  console.log(`Course type: ${deactivatedCourse.details.type}, New status: ${deactivatedCourse.details.status}`);
  console.log(`Deactivated at: ${set.deactivated_at}`);

  return {
    success: true,
    course: deactivatedCourse,
    message: `دوره با موفقیت غیرفعال شد (${deactivatedCourse.details.status})`,
    deactivatedAt: set.deactivated_at,
    enrollmentAction: body.details.set?.enrollment_action || "notify",
  };
};

export default deactivateCourseFn;
