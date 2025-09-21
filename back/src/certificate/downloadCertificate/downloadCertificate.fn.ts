import { type ActFn } from "@deps";
import { coreApp } from "../../../mod.ts";
import { CertificatePDFGenerator, PDFUtils } from "../utils/pdfGenerator.ts";

interface DownloadResponse {
  success: boolean;
  data?: {
    file_buffer: Uint8Array;
    content_type: string;
    filename: string;
    headers: Record<string, string>;
  };
  error?: string;
}

export const downloadCertificateFn: ActFn = async (body): Promise<DownloadResponse> => {
  const { set, get } = body.details;
  const { certificate_number, format = "pdf" } = set;

  try {
    // Clean and validate certificate number
    const cleanCertNumber = certificate_number.trim().toUpperCase();

    // Find enrollment with this certificate
    const enrollment = await coreApp.odm.main.enrollment.findOne(
      {
        certificate_id: cleanCertNumber,
        certificate_issued: true,
      },
      {
        projection: {
          _id: 1,
          certificate_id: 1,
          certificate_issued: 1,
          certificate_revoked: 1,
          certificate_template_id: 1,
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
            path: 1,
            url: 1,
            size: 1,
          },
          completed_date: 1,
          certificate_issue_date: 1,
          final_grade: 1,
        },
      }
    );

    if (!enrollment) {
      return {
        success: false,
        error: "Certificate not found",
      };
    }

    // Check if certificate is revoked
    if (enrollment.certificate_revoked) {
      return {
        success: false,
        error: "Certificate has been revoked and is no longer valid",
      };
    }

    // Authorization check
    const isOwner = user && enrollment.user._id.toString() === user._id.toString();
    const isAdmin = user && user.role === "ADMIN";
    const isInstructor = user && user.role === "INSTRUCTOR";

    // For now, allow public downloads - can be restricted later
    const hasAccess = !user || isOwner || isAdmin || isInstructor;

    if (!hasAccess) {
      return {
        success: false,
        error: "Access denied. You don't have permission to download this certificate.",
      };
    }

    // Prepare certificate data for regeneration if needed
    const certificateData = {
      id: enrollment._id.toString(),
      certificate_number: enrollment.certificate_id,
      student_name: enrollment.user.details?.name ||
        `${enrollment.user.details?.first_name} ${enrollment.user.details?.last_name}` ||
        "Student",
      student_name_en: enrollment.user.details?.name_en || "",
      course_name: enrollment.course.name,
      course_name_en: enrollment.course.name_en || "",
      course_type: enrollment.course.type || "Course",
      instructor_name: enrollment.course.instructor_name || "Instructor",
      completion_date: enrollment.completed_date || enrollment.certificate_issue_date,
      issue_date: enrollment.certificate_issue_date,
      verification_hash: "", // Would be retrieved from enrollment if stored
      template_id: enrollment.certificate_template_id || "standard",
      final_grade: enrollment.final_grade,
      status: enrollment.certificate_revoked ? "revoked" : "active",
    };

    let fileBuffer: Uint8Array;
    let contentType: string;
    let filename: string;

    if (format === "pdf") {
      // Generate or retrieve PDF
      try {
        fileBuffer = await generateCertificatePDF(certificateData);
        contentType = "application/pdf";
        filename = `certificate-${cleanCertNumber}.pdf`;
      } catch (error: any) {
        console.error("PDF generation error:", error);
        return {
          success: false,
          error: "Failed to generate certificate PDF",
        };
      }
    } else if (format === "png") {
      // Generate PNG image
      try {
        fileBuffer = await generateCertificatePNG(certificateData);
        contentType = "image/png";
        filename = `certificate-${cleanCertNumber}.png`;
      } catch (error: any) {
        console.error("PNG generation error:", error);
        return {
          success: false,
          error: "Failed to generate certificate image",
        };
      }
    } else {
      return {
        success: false,
        error: "Unsupported format. Use 'pdf' or 'png'",
      };
    }

    // Prepare download headers
    const headers = {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": fileBuffer.length.toString(),
      "Cache-Control": "private, max-age=3600", // Cache for 1 hour
      "X-Certificate-Number": cleanCertNumber,
      "X-Certificate-Status": certificateData.status,
    };

    return {
      success: true,
      data: {
        file_buffer: fileBuffer,
        content_type: contentType,
        filename,
        headers,
      },
    };

  } catch (error: any) {
    console.error("Certificate download error:", error);
    return {
      success: false,
      error: error.message || "Failed to download certificate",
    };
  }
}

// Helper function to generate PDF certificate
async function generateCertificatePDF(certificateData: any): Promise<Uint8Array> {
  try {
    // Validate certificate data
    const errors = CertificatePDFGenerator.validateCertificateData(certificateData);
    if (errors.length > 0) {
      throw new Error(`Certificate data validation failed: ${errors.join(', ')}`);
    }

    // Initialize PDF generator with appropriate settings
    const pdfGenerator = new CertificatePDFGenerator({
      format: 'A4',
      orientation: certificateData.template_id === 'premium' ? 'landscape' : 'portrait',
      quality: 'high',
      watermark: certificateData.status === 'revoked',
      include_qr: true
    });

    // Generate the PDF certificate
    const pdfBuffer = await pdfGenerator.generateCertificate(certificateData);

    console.log(`Certificate PDF downloaded: ${certificateData.certificate_number}`);
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(`Certificate PDF generation failed: ${error.message}`);
  }
}

// Helper function to generate PNG certificate
async function generateCertificatePNG(certificateData: any): Promise<Uint8Array> {
  try {
    // Initialize PDF generator for image generation
    const pdfGenerator = new CertificatePDFGenerator({
      format: 'A4',
      orientation: certificateData.template_id === 'premium' ? 'landscape' : 'portrait',
      quality: 'high',
      watermark: certificateData.status === 'revoked',
      include_qr: true
    });

    // Generate PNG image
    const imageBuffer = await pdfGenerator.generateCertificateImage(certificateData);

    console.log(`Certificate PNG downloaded: ${certificateData.certificate_number}`);
    return imageBuffer;
  } catch (error) {
    console.error('PNG generation failed:', error);
    throw new Error(`Certificate PNG generation failed: ${error.message}`);
  }
}

// Helper function to get certificate template information
async function getCertificateTemplateInfo(templateId: string) {
  const template = CertificatePDFGenerator.getTemplate(templateId);
  if (!template) {
    console.warn(`Template ${templateId} not found, using standard template`);
    return CertificatePDFGenerator.getTemplate('standard');
  }
  return template;
}

// Helper function to generate QR code data for certificate verification
function generateQRCodeData(certificateNumber: string, verificationHash: string): string {
  return PDFUtils.createQRCodeData(certificateNumber, verificationHash);
}
