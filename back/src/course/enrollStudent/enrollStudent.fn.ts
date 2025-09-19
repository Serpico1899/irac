import { type ActFn, ObjectId, type TInsertRelations } from "@deps";
import { enrollments, courses, users } from "@model";
import type { enrollment_relations } from "@model";

const enrollStudentFn: ActFn = async (body) => {
  const { set, get } = body.details;

  const {
    course_id,
    user_id,
    enrolled_by,
    ...rest
  } = set;

  const relations: TInsertRelations<typeof enrollment_relations> = {};

  // Required relations
  if (course_id) {
    relations.course = {
      _ids: new ObjectId(course_id as string),
    };
  }

  if (user_id) {
    relations.user = {
      _ids: new ObjectId(user_id as string),
    };
  }

  if (enrolled_by) {
    relations.enrolled_by = {
      _ids: new ObjectId(enrolled_by as string),
    };
  }

  // Convert date strings to Date objects if they exist
  if (rest.enrollment_date && typeof rest.enrollment_date === 'string') {
    rest.enrollment_date = new Date(rest.enrollment_date);
  }

  if (rest.completion_date && typeof rest.completion_date === 'string') {
    rest.completion_date = new Date(rest.completion_date);
  }

  if (rest.payment_date && typeof rest.payment_date === 'string') {
    rest.payment_date = new Date(rest.payment_date);
  }

  // Create the enrollment
  const createdEnrollment = await enrollments().insertOne({
    doc: {
      ...rest,
    },
    relations,
    projection: get,
  });

  if (!createdEnrollment) {
    throw new Error("خطا در ایجاد ثبت‌نام");
  }

  // Update course relationships and statistics
  try {
    // Add user to course's enrolled_users
    await courses().updateOne({
      filter: { _id: new ObjectId(course_id as string) },
      doc: {},
      relations: {
        enrolled_users: {
          _ids: new ObjectId(user_id as string),
        }
      }
    });

    // Update course total_students count
    const courseEnrollmentCount = await coreApp.odm.db
      .collection("enrollments")
      .countDocuments({
        course: new ObjectId(course_id as string),
        status: { $in: ["Active", "Completed"] }
      });

    await courses().updateOne({
      filter: { _id: new ObjectId(course_id as string) },
      doc: {
        total_students: courseEnrollmentCount,
      }
    });

    // Add course to user's enrolled_courses
    await users().updateOne({
      filter: { _id: new ObjectId(user_id as string) },
      doc: {},
      relations: {
        enrolled_courses: {
          _ids: new ObjectId(course_id as string),
        }
      }
    });

    // Log the successful enrollment
    console.log(`Student enrolled successfully: User ${user_id} enrolled in course ${course_id}`);
    console.log(`Enrollment status: ${rest.enrollment_status}, Payment status: ${rest.payment_status}`);
    console.log(`Course now has ${courseEnrollmentCount} total students`);

  } catch (error) {
    console.error("Error updating course/user relationships:", error);
    // Note: The enrollment was created successfully, but relationship updates failed
    // In a production system, you might want to implement a rollback mechanism
  }

  return {
    success: true,
    enrollment: createdEnrollment,
    message: "دانشجو با موفقیت در دوره ثبت‌نام شد",
    enrollmentId: createdEnrollment.pure._id,
    enrolledAt: rest.enrollment_date,
  };
};

export default enrollStudentFn;
