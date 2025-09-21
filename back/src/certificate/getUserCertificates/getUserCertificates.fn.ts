import { type ActFn } from "@deps";
import { coreApp } from "../../../mod.ts";
import type { MyContext } from "@lib";

export const getUserCertificatesFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const { user_id, status, limit = 20, offset = 0 } = set;

  try {
    // Get user context
    const { user }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

    // Determine target user ID
    let targetUserId = user_id || user._id;

    // Check authorization
    const isOwnCertificates = targetUserId === user._id;
    const isAdmin = user.level === "Admin";
    const isInstructor = user.level === "Instructor";

    if (!isOwnCertificates && !isAdmin && !isInstructor) {
      throw new Error("Access denied");
    }

    // Build query for enrollments with certificates
    let query: any = {
      "user._id": targetUserId,
      certificate_issued: true,
    };

    // Add status filter if provided
    if (status) {
      // For now, we'll assume all issued certificates are active
      // TODO: Add revoked status handling when certificate revocation is implemented
      if (status === "revoked") {
        query.certificate_revoked = true;
      }
    }

    // Get certificates (enrollments with certificates issued)
    const enrollments = await coreApp.odm.main.enrollment.find(
      query,
      {
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
          final_grade: 1,
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
            level: 1,
            featured_image: {
              url: 1,
            },
          },
          certificate: {
            _id: 1,
            name: 1,
            url: 1,
            path: 1,
          },
        },
        sort: { certificate_issue_date: -1 },
        limit,
        skip: offset,
      }
    );

    // Get total count for pagination
    const totalCount = await coreApp.odm.main.enrollment.countDocuments(query);

    // Format certificates data
    const certificates = enrollments.map((enrollment: any) => {
      const student_name = enrollment.user.details?.name ||
        `${enrollment.user.details?.first_name} ${enrollment.user.details?.last_name}` ||
        "Student";

      return {
        id: enrollment._id,
        certificate_number: enrollment.certificate_id,
        student_name,
        student_name_en: enrollment.user.details?.name_en || "",
        course: {
          id: enrollment.course._id,
          name: enrollment.course.name,
          name_en: enrollment.course.name_en || "",
          slug: enrollment.course.slug,
          type: enrollment.course.type || "Course",
          level: enrollment.course.level,
          featured_image_url: enrollment.course.featured_image?.url || null,
        },
        instructor_name: enrollment.course.instructor_name || "Instructor",
        issue_date: enrollment.certificate_issue_date,
        completion_date: enrollment.completed_date || enrollment.certificate_issue_date,
        enrollment_date: enrollment.enrollment_date,
        final_grade: enrollment.final_grade,
        verification_hash: enrollment.certificate_hash,
        status: "active", // TODO: Add proper status handling
        download_url: enrollment.certificate?.url || `/api/certificate/download/${enrollment.certificate_id}`,
        verify_url: `/verify-certificate?id=${enrollment.certificate_id}`,
        share_url: `/certificate/${enrollment.certificate_id}`,
      };
    });

    // Get courses in progress (for certificate eligibility)
    const coursesInProgress = await coreApp.odm.main.enrollment.find(
      {
        "user._id": targetUserId,
        status: "Active",
        progress_percentage: { $lt: 100 },
        certificate_issued: false,
      },
      {
        projection: {
          _id: 1,
          progress_percentage: 1,
          enrollment_date: 1,
          course: {
            _id: 1,
            name: 1,
            name_en: 1,
            slug: 1,
            type: 1,
            level: 1,
            featured_image: {
              url: 1,
            },
          },
        },
        sort: { enrollment_date: -1 },
        limit: 10,
      }
    );

    const progressData = coursesInProgress.map((enrollment: any) => ({
      enrollment_id: enrollment._id,
      course: {
        id: enrollment.course._id,
        name: enrollment.course.name,
        name_en: enrollment.course.name_en || "",
        slug: enrollment.course.slug,
        type: enrollment.course.type || "Course",
        level: enrollment.course.level,
        featured_image_url: enrollment.course.featured_image?.url || null,
      },
      progress_percentage: enrollment.progress_percentage,
      enrollment_date: enrollment.enrollment_date,
      certificate_eligible: enrollment.progress_percentage >= 100,
    }));

    return {
      success: true,
      data: {
        certificates,
        courses_in_progress: progressData,
        pagination: {
          total: totalCount,
          limit,
          offset,
          has_more: offset + limit < totalCount,
        },
      },
      message: "Certificates retrieved successfully",
    };

  } catch (error: any) {
    console.error("Get user certificates error:", error);
    return {
      success: false,
      error: error.message || "Failed to retrieve certificates",
    };
  }
}
