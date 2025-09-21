import { type ActFn } from "@deps";
import { coreApp } from "../../../mod.ts";

export const verifyCertificateFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const { certificate_number } = set;

  try {
    // Validate certificate number format
    if (!certificate_number || certificate_number.trim() === "") {
      throw new Error("Certificate number is required");
    }

    // Clean certificate number (remove spaces, convert to uppercase)
    const cleanCertificateNumber = certificate_number.trim().toUpperCase();

    // Find enrollment with this certificate
    const enrollment = await coreApp.odm.main.enrollment.findOne(
      {
        certificate_id: cleanCertificateNumber,
        certificate_issued: true,
      },
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
            duration_hours: 1,
            featured_image: {
              url: 1,
            },
          },
        },
      }
    );

    if (!enrollment) {
      return {
        success: false,
        verified: false,
        error: "Certificate not found or invalid certificate number",
      };
    }

    // Check if certificate is still valid
    if (!enrollment.certificate_issued) {
      return {
        success: false,
        verified: false,
        error: "Certificate has been revoked or is no longer valid",
      };
    }

    // TODO: Add expiration date checking when implemented
    // TODO: Add revocation status checking when implemented

    // Format student name for public display (partial privacy)
    const fullStudentName = enrollment.user.details?.name ||
      `${enrollment.user.details?.first_name} ${enrollment.user.details?.last_name}` ||
      "Student";

    // Create partially hidden name for privacy (show first name + first letter of last name)
    const nameParts = fullStudentName.split(" ");
    let displayName = fullStudentName;
    if (nameParts.length > 1) {
      const firstName = nameParts[0];
      const lastNameInitial = nameParts[nameParts.length - 1].charAt(0);
      displayName = `${firstName} ${lastNameInitial}.`;
    }

    // Prepare public certificate verification data
    const verificationData = {
      certificate_number: enrollment.certificate_id,
      verified: true,
      valid: true,
      status: "active", // TODO: Add proper status handling

      // Student information (limited for privacy)
      student: {
        name: displayName,
        name_en: enrollment.user.details?.name_en ?
          enrollment.user.details.name_en.split(" ")[0] + " " +
          enrollment.user.details.name_en.split(" ").slice(-1)[0].charAt(0) + "."
          : "",
      },

      // Course information
      course: {
        name: enrollment.course.name,
        name_en: enrollment.course.name_en || "",
        type: enrollment.course.type || "Course",
        level: enrollment.course.level,
        duration_hours: enrollment.course.duration_hours,
        featured_image_url: enrollment.course.featured_image?.url || null,
      },

      // Certificate details
      instructor_name: enrollment.course.instructor_name || "Instructor",
      issue_date: enrollment.certificate_issue_date,
      completion_date: enrollment.completed_date || enrollment.certificate_issue_date,
      final_grade: enrollment.final_grade,

      // Verification metadata
      verification_hash: enrollment.certificate_hash,
      verified_at: new Date(),

      // Institution information
      institution: {
        name: "Iranian Architecture Center",
        name_en: "Iranian Architecture Center",
        name_fa: "مرکز معماری ایران",
        code: "IRAC",
      },
    };

    return {
      success: true,
      verified: true,
      data: verificationData,
      message: "Certificate is valid and verified",
    };

  } catch (error: any) {
    console.error("Certificate verification error:", error);
    return {
      success: false,
      verified: false,
      error: error.message || "Failed to verify certificate",
    };
  }
}
