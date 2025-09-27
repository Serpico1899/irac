import { type ActFn } from "@deps";
import {  coreApp  } from "@app";
import { crypto } from "@deps";
import { CertificatePDFGenerator, PDFUtils } from "../utils/pdfGenerator.ts";

// PDF Generation - In a real implementation, you would use a PDF library like:
// import jsPDF from 'jspdf';
// import PDFDocument from 'pdfkit';
// For now, we'll simulate PDF generation

interface CertificateData {
  id: string;
  certificate_number: string;
  student_name: string;
  student_name_en?: string;
  course_name: string;
  course_name_en?: string;
  completion_date: Date;
  issue_date: Date;
  instructor_name: string;
  verification_hash: string;
  template_id: string;
  status: 'active' | 'revoked';
}

export const generateCertificateFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const { enrollment_id, template_id = "standard", force_generate = false } = set;

  try {
    // Get enrollment with related course and user data
    const enrollment = await coreApp.odm.main.enrollment.findOne({
      _id: enrollment_id,
    }, {
      projection: {
        progress_percentage: 1,
        status: 1,
        certificate_issued: 1,
        certificate_issue_date: 1,
        enrollment_date: 1,
        completed_date: 1,
        user: {
          details: {
            name: 1,
            name_en: 1,
            first_name: 1,
            last_name: 1,
          },
          _id: 1,
        },
        course: {
          name: 1,
          name_en: 1,
          slug: 1,
          instructor_name: 1,
          _id: 1,
        },
      },
    });

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Check if certificate already issued and not forcing regeneration
    if (enrollment.certificate_issued && !force_generate) {
      throw new Error("Certificate already issued for this enrollment");
    }

    // Validate course completion
    if (enrollment.progress_percentage < 100) {
      throw new Error("Course not completed. Progress: " + enrollment.progress_percentage + "%");
    }

    if (enrollment.status !== "Completed" && enrollment.status !== "Active") {
      throw new Error("Invalid enrollment status for certificate generation");
    }

    // Generate unique certificate number
    const currentYear = new Date().getFullYear();
    const courseCode = enrollment.course.slug?.toUpperCase().substring(0, 6) ||
      enrollment.course._id.toString().substring(0, 6);
    const studentId = enrollment.user._id.toString().substring(0, 8);
    const certificate_number = `IRAC-${currentYear}-${courseCode}-${studentId}`;

    // Generate verification hash
    const hashData = `${certificate_number}${enrollment_id}${enrollment.user._id}${enrollment.course._id}${Date.now()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashData);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const verification_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Prepare certificate data
    const student_name = enrollment.user.details?.name ||
      `${enrollment.user.details?.first_name} ${enrollment.user.details?.last_name}` ||
      "Student";

    const student_name_en = enrollment.user.details?.name_en || "";
    const course_name = enrollment.course.name;
    const course_name_en = enrollment.course.name_en || "";
    const instructor_name = enrollment.course.instructor_name || "Instructor";
    const completion_date = enrollment.completed_date || new Date();
    const issue_date = new Date();

    const certificateData: CertificateData = {
      id: enrollment_id,
      certificate_number,
      student_name,
      student_name_en,
      course_name,
      course_name_en,
      completion_date,
      issue_date,
      instructor_name,
      verification_hash,
      template_id,
      status: 'active',
    };

    // Generate certificate PDF
    const pdfBuffer = await generateCertificatePDF(certificateData);

    // Create certificate file record with actual size
    const certificateFile = await coreApp.odm.main.file.insertOne({
      name: `certificate-${certificate_number}.pdf`,
      type: "application/pdf",
      size: pdfBuffer.length,
      path: `/certificates/${certificate_number}.pdf`,
      url: `/api/certificate/download/${certificate_number}`,
      uploader: enrollment.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // In a production environment, save the PDF buffer to file storage
    // await saveCertificateToDisk(pdfBuffer, `/certificates/${certificate_number}.pdf`);
    // Or save to cloud storage (AWS S3, Google Cloud, etc.)

    // Update enrollment with certificate information
    await coreApp.odm.main.enrollment.updateOne(
      { _id: enrollment_id },
      {
        $set: {
          certificate_issued: true,
          certificate_issue_date: issue_date,
          certificate_id: certificate_number,
          certificate_hash: verification_hash,
          certificate: certificateFile.insertedId,
          updatedAt: new Date(),
        },
      }
    );

    // Store certificate metadata for verification
    await coreApp.odm.main.course.updateOne(
      { _id: enrollment.course._id },
      {
        $inc: {
          total_certificates_issued: 1,
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    return {
      success: true,
      data: {
        certificate_number,
        verification_hash,
        issue_date,
        download_url: `/api/certificate/download/${certificate_number}`,
        verify_url: `/verify-certificate?id=${certificate_number}`,
        certificate_data: certificateData,
      },
      message: "Certificate generated successfully",
    };

  } catch (error: any) {
    console.error("Certificate generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate certificate",
    };
  }
}

// Helper function to generate PDF certificate
async function generateCertificatePDF(certificateData: CertificateData): Promise<Uint8Array> {
  try {
    // Validate certificate data
    const errors = CertificatePDFGenerator.validateCertificateData(certificateData);
    if (errors.length > 0) {
      throw new Error(`Certificate data validation failed: ${errors.join(', ')}`);
    }

    // Initialize PDF generator with high quality settings
    const pdfGenerator = new CertificatePDFGenerator({
      format: 'A4',
      orientation: certificateData.template_id === 'premium' ? 'landscape' : 'portrait',
      quality: 'high',
      watermark: certificateData.status === 'revoked',
      include_qr: true
    });

    // Generate the PDF certificate
    const pdfBuffer = await pdfGenerator.generateCertificate(certificateData);

    console.log(`Certificate PDF generated successfully: ${certificateData.certificate_number}`);
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate certificate PDF: ${error.message}`);
  }
}

// Helper function to get QR code data for certificate verification
function generateQRCodeData(certificateNumber: string, verificationHash: string): string {
  return PDFUtils.createQRCodeData(certificateNumber, verificationHash);
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
