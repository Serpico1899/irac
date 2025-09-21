import { type ActFn } from "@deps";
import { coreApp } from "../../../mod.ts";
import type { MyContext } from "@lib";

export const getCertificateFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const { enrollment_id, certificate_number } = set;

  try {
    // Get user context
    const { user }: MyContext = coreApp.contextFns.getContextModel() as MyContext;
    if (!enrollment_id && !certificate_number) {
      throw new Error("Either enrollment_id or certificate_number is required");
    }

    // Build query
    let query: any = {};
    if (enrollment_id) {
      query._id = enrollment_id;
    } else if (certificate_number) {
      query.certificate_id = certificate_number;
    }

    // Get enrollment with certificate data
    const enrollment = await coreApp.odm.main.enrollment.findOne(query, {
      projection: {
        _id: 1,
        certificate_issued: 1,
        certificate_issue_date: 1,
        certificate_id: 1,
        certificate_hash: 1,
        status: 1,
        progress_percentage: 1,
        completed_date: 1,
        enrollment_date: 1,
        user: {
          _id: 1,
          details: {
            name: 1,
            name_en: 1,
            first_name: 1,
            last_name: 1,
          },
        },
        course: {
          _id: 1,
          name: 1,
          name_en: 1,
          slug: 1,
          instructor_name: 1,
          type: 1,
        },
        certificate: {
          _id: 1,
          name: 1,
          url: 1,
          path: 1,
        },
      },
    });

    if (!enrollment) {
      throw new Error("Certificate not found");
    }

    // Check authorization - users can only access their own certificates
    // unless they are admin or instructor
    const isOwner = enrollment.user._id.toString() === user._id.toString();
    const isAdmin = user.level === "Admin";
    const isInstructor = user.level === "Instructor";

    if (!isOwner && !isAdmin && !isInstructor) {
      throw new Error("Access denied");
    }

    // Check if certificate is issued
    if (!enrollment.certificate_issued) {
      throw new Error("Certificate has not been issued for this enrollment");
    }

    // Format student name
    const student_name = enrollment.user.details?.name ||
      `${enrollment.user.details?.first_name} ${enrollment.user.details?.last_name}` ||
      "Student";

    // Prepare certificate data
    const certificateData = {
      id: enrollment._id,
      certificate_number: enrollment.certificate_id,
      student_name,
      student_name_en: enrollment.user.details?.name_en || "",
      course_name: enrollment.course.name,
      course_name_en: enrollment.course.name_en || "",
      course_type: enrollment.course.type || "Course",
      instructor_name: enrollment.course.instructor_name || "Instructor",
      issue_date: enrollment.certificate_issue_date,
      completion_date: enrollment.completed_date || enrollment.certificate_issue_date,
      enrollment_date: enrollment.enrollment_date,
      verification_hash: enrollment.certificate_hash,
      status: "active", // TODO: Add revoked status handling
      progress_percentage: enrollment.progress_percentage,
      download_url: enrollment.certificate?.url || `/api/certificate/download/${enrollment.certificate_id}`,
      verify_url: `/verify-certificate?id=${enrollment.certificate_id}`,
      template_id: "standard", // TODO: Add template_id to enrollment model
    };

    return {
      success: true,
      data: certificateData,
      message: "Certificate retrieved successfully",
    };

  } catch (error: any) {
    console.error("Get certificate error:", error);
    return {
      success: false,
      error: error.message || "Failed to retrieve certificate",
    };
  }
}
