import { type ActFn } from "@deps";
import { coreApp } from "../../../mod.ts";

export const revokeCertificateFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const { certificate_number, enrollment_id, reason } = set;

  try {
    if (!certificate_number && !enrollment_id) {
      throw new Error("Either certificate_number or enrollment_id is required");
    }

    // Build query to find the enrollment
    let query: any = {};
    if (enrollment_id) {
      query._id = enrollment_id;
    } else if (certificate_number) {
      query.certificate_id = certificate_number.trim().toUpperCase();
    }

    // Add certificate issued filter
    query.certificate_issued = true;

    // Find the enrollment with certificate
    const enrollment = await coreApp.odm.main.enrollment.findOne(query, {
      projection: {
        _id: 1,
        certificate_issued: 1,
        certificate_issue_date: 1,
        certificate_id: 1,
        certificate_hash: 1,
        certificate_revoked: 1,
        certificate_revoked_date: 1,
        certificate_revoked_reason: 1,
        status: 1,
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
        },
      },
    });

    if (!enrollment) {
      throw new Error("Certificate not found");
    }

    // Check if certificate is already revoked
    if (enrollment.certificate_revoked) {
      throw new Error("Certificate is already revoked");
    }

    // Prepare revocation data
    const revocation_date = new Date();
    const revoked_by = user._id;

    // Update enrollment to revoke certificate
    const updateResult = await coreApp.odm.main.enrollment.updateOne(
      { _id: enrollment._id },
      {
        $set: {
          certificate_revoked: true,
          certificate_revoked_date: revocation_date,
          certificate_revoked_reason: reason,
          certificate_revoked_by: revoked_by,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to revoke certificate");
    }

    // Log the revocation action for audit trail
    try {
      await coreApp.odm.main.auditLog?.insertOne({
        action: "certificate_revoked",
        resource_type: "certificate",
        resource_id: enrollment.certificate_id,
        user_id: revoked_by,
        details: {
          certificate_number: enrollment.certificate_id,
          enrollment_id: enrollment._id,
          student_id: enrollment.user._id,
          course_id: enrollment.course._id,
          reason: reason,
          revoked_date: revocation_date,
          revoked_by_name: user.details?.name || user.details?.first_name + " " + user.details?.last_name,
        },
        timestamp: revocation_date,
        ip_address: null, // TODO: Add IP address if available
        user_agent: null, // TODO: Add user agent if available
      });
    } catch (auditError) {
      console.warn("Failed to log certificate revocation to audit trail:", auditError);
      // Don't fail the revocation if audit logging fails
    }

    // Update course statistics
    try {
      await coreApp.odm.main.course.updateOne(
        { _id: enrollment.course._id },
        {
          $inc: {
            total_certificates_revoked: 1,
          },
          $set: {
            updatedAt: new Date(),
          },
        }
      );
    } catch (statsError) {
      console.warn("Failed to update course revocation statistics:", statsError);
    }

    // Format student name for response
    const student_name = enrollment.user.details?.name ||
      `${enrollment.user.details?.first_name} ${enrollment.user.details?.last_name}` ||
      "Student";

    return {
      success: true,
      data: {
        certificate_number: enrollment.certificate_id,
        student_name,
        course_name: enrollment.course.name,
        revocation_date,
        reason,
        revoked_by: user.details?.name || user.details?.first_name + " " + user.details?.last_name,
        status: "revoked",
      },
      message: "Certificate revoked successfully",
    };

  } catch (error: any) {
    console.error("Certificate revocation error:", error);
    return {
      success: false,
      error: error.message || "Failed to revoke certificate",
    };
  }
}
