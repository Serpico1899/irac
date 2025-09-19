import { type ActFn, ObjectId } from "@deps";
import { courses } from "@model";

const activateCourseFn: ActFn = async (body) => {
  const { filter, get, set } = body.details;

  const courseId = filter._id;

  // Update the course to Active status
  const activatedCourse = await courses().updateOne({
    filter: { _id: new ObjectId(courseId) },
    doc: {
      status: "Active",
      activated_at: new Date(),
      ...set, // Include any additional fields set in preAct
    },
    projection: get,
  });

  if (!activatedCourse) {
    throw new Error("خطا در فعال‌سازی دوره");
  }

  // Log the activation
  console.log(`Course activated successfully: ${activatedCourse.details.name} (ID: ${courseId})`);
  console.log(`Course type: ${activatedCourse.details.type}, New status: Active`);

  return {
    success: true,
    course: activatedCourse,
    message: "دوره با موفقیت فعال شد",
    activatedAt: new Date(),
  };
};

export default activateCourseFn;
