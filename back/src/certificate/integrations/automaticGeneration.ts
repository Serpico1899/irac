import {  coreApp  } from "@app";
import { CertificatePDFGenerator } from "../utils/pdfGenerator.ts";
import { smsService } from "../../sms/smsService.ts";
import { emailService } from "../../email/emailService.ts";
import { crypto } from "@deps";

interface AutoCertificateConfig {
  enabled: boolean;
  auto_generate_on_completion: boolean;
  require_minimum_grade: boolean;
  minimum_grade_threshold: number;
  send_email_notification: boolean;
  generate_for_course_types: string[];
  delay_generation_hours: number;
}

interface CourseCompletionEvent {
  enrollment_id: string;
  user_id: string;
  course_id: string;
  completion_date: Date;
  final_grade?: number;
  progress_percentage: number;
  completion_type: 'automatic' | 'manual' | 'admin_override';
}

interface CertificateGenerationResult {
  success: boolean;
  certificate_number?: string;
  error?: string;
  enrollment_id: string;
  generation_time: Date;
  notification_sent: boolean;
}

/**
 * Automatic Certificate Generation Service
 * Handles automatic certificate generation when students complete courses
 */
export class AutomaticCertificateService {
  private config: AutoCertificateConfig;
  private generationQueue: Map<string, CourseCompletionEvent> = new Map();
  private processingLock: Set<string> = new Set();

  constructor(config: Partial<AutoCertificateConfig> = {}) {
    this.config = {
      enabled: true,
      auto_generate_on_completion: true,
      require_minimum_grade: false,
      minimum_grade_threshold: 60,
      send_email_notification: true,
      generate_for_course_types: ['Course', 'Bootcamp', 'Workshop', 'Seminar'],
      delay_generation_hours: 0,
      ...config
    };
  }

  /**
   * Process course completion event - main entry point
   */
  async processCourseCompletion(event: CourseCompletionEvent): Promise<CertificateGenerationResult> {
    const result: CertificateGenerationResult = {
      success: false,
      enrollment_id: event.enrollment_id,
      generation_time: new Date(),
      notification_sent: false
    };

    try {
      console.log(`Processing course completion for enrollment: ${event.enrollment_id}`);

      // Check if automatic generation is enabled
      if (!this.config.enabled || !this.config.auto_generate_on_completion) {
        console.log('Automatic certificate generation is disabled');
        result.error = 'Automatic generation disabled';
        return result;
      }

      // Prevent duplicate processing
      if (this.processingLock.has(event.enrollment_id)) {
        console.log(`Already processing enrollment: ${event.enrollment_id}`);
        result.error = 'Already processing';
        return result;
      }

      this.processingLock.add(event.enrollment_id);

      try {
        // Validate completion event
        const validationResult = await this.validateCompletionEvent(event);
        if (!validationResult.isValid) {
          result.error = validationResult.reason;
          return result;
        }

        // Get enrollment and course details
        const enrollmentDetails = await this.getEnrollmentDetails(event.enrollment_id);
        if (!enrollmentDetails) {
          result.error = 'Enrollment not found';
          return result;
        }

        // Check if certificate already exists
        if (enrollmentDetails.certificate_issued) {
          console.log(`Certificate already exists for enrollment: ${event.enrollment_id}`);
          result.success = true;
          result.certificate_number = enrollmentDetails.certificate_id;
          return result;
        }

        // Apply generation delay if configured
        if (this.config.delay_generation_hours > 0) {
          await this.scheduleDelayedGeneration(event);
          result.success = true;
          result.error = `Scheduled for generation in ${this.config.delay_generation_hours} hours`;
          return result;
        }

        // Generate certificate
        const certificateResult = await this.generateCertificate(enrollmentDetails, event);
        if (certificateResult.success) {
          result.success = true;
          result.certificate_number = certificateResult.certificate_number;

          // Send notification if configured
          if (this.config.send_email_notification) {
            try {
              await this.sendCertificateNotification(enrollmentDetails, certificateResult.certificate_number!);
              result.notification_sent = true;
            } catch (notificationError) {
              console.error('Failed to send notification:', notificationError);
              // Don't fail the whole process if notification fails
            }
          }

          // Log successful generation
          await this.logCertificateGeneration(enrollmentDetails, result);

          console.log(`Certificate generated successfully: ${result.certificate_number}`);
        } else {
          result.error = certificateResult.error;
        }

        return result;

      } finally {
        this.processingLock.delete(event.enrollment_id);
      }

    } catch (error: any) {
      console.error('Error in automatic certificate generation:', error);
      result.error = error.message || 'Unknown error occurred';
      return result;
    }
  }

  /**
   * Validate if the completion event should trigger certificate generation
   */
  private async validateCompletionEvent(event: CourseCompletionEvent): Promise<{ isValid: boolean, reason?: string }> {
    // Check progress percentage
    if (event.progress_percentage < 100) {
      return {
        isValid: false,
        reason: `Course not fully completed. Progress: ${event.progress_percentage}%`
      };
    }

    // Get course details to check type and requirements
    const course = await coreApp.odm.main.course.findOne(
      { _id: event.course_id },
      {
        projection: {
          type: 1,
          certificate_enabled: 1,
          certificate_template_id: 1,
          name: 1,
          requirements: 1
        }
      }
    );

    if (!course) {
      return { isValid: false, reason: 'Course not found' };
    }

    // Check if certificates are enabled for this course
    if (course.certificate_enabled === false) {
      return { isValid: false, reason: 'Certificates disabled for this course' };
    }

    // Check if course type is in allowed list
    if (!this.config.generate_for_course_types.includes(course.type)) {
      return {
        isValid: false,
        reason: `Course type '${course.type}' not configured for automatic certificates`
      };
    }

    // Check minimum grade requirement
    if (this.config.require_minimum_grade && event.final_grade) {
      if (event.final_grade < this.config.minimum_grade_threshold) {
        return {
          isValid: false,
          reason: `Grade ${event.final_grade} below minimum threshold ${this.config.minimum_grade_threshold}`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Get detailed enrollment information
   */
  private async getEnrollmentDetails(enrollmentId: string) {
    return await coreApp.odm.main.enrollment.findOne(
      { _id: enrollmentId },
      {
        projection: {
          _id: 1,
          user: {
            _id: 1,
            details: {
              name: 1,
              name_en: 1,
              first_name: 1,
              last_name: 1,
              email: 1
            }
          },
          course: {
            _id: 1,
            name: 1,
            name_en: 1,
            slug: 1,
            instructor_name: 1,
            type: 1,
            certificate_template_id: 1,
            certificate_enabled: 1
          },
          progress_percentage: 1,
          status: 1,
          certificate_issued: 1,
          certificate_id: 1,
          certificate_issue_date: 1,
          enrollment_date: 1,
          completed_date: 1,
          final_grade: 1,
          updatedAt: 1
        }
      }
    );
  }

  /**
   * Generate certificate using existing generation system
   */
  private async generateCertificate(enrollmentDetails: any, event: CourseCompletionEvent) {
    try {
      // Use the existing certificate generation function
      const { generateCertificateFn } = await import("../generateCertificate/generateCertificate.fn.ts");

      const templateId = enrollmentDetails.course.certificate_template_id || 'standard';

      const result = await generateCertificateFn({
        details: {
          set: {
            enrollment_id: event.enrollment_id,
            template_id: templateId,
            force_generate: false
          }
        }
      });

      return {
        success: result.success,
        certificate_number: result.data?.certificate_number,
        error: result.error
      };

    } catch (error: any) {
      console.error('Certificate generation failed:', error);
      return {
        success: false,
        error: error.message || 'Certificate generation failed'
      };
    }
  }

  /**
   * Schedule delayed certificate generation
   */
  private async scheduleDelayedGeneration(event: CourseCompletionEvent): Promise<void> {
    // In a production system, this would use a job queue like Bull, Agenda, or similar
    // For now, we'll use a simple setTimeout (not recommended for production)

    const delayMs = this.config.delay_generation_hours * 60 * 60 * 1000;

    setTimeout(async () => {
      console.log(`Processing delayed certificate generation for: ${event.enrollment_id}`);
      try {
        // Re-process the event after delay
        const delayedEvent = { ...event, completion_type: 'automatic' as const };
        await this.processCourseCompletion(delayedEvent);
      } catch (error) {
        console.error('Delayed certificate generation failed:', error);
      }
    }, delayMs);

    console.log(`Scheduled certificate generation for ${event.enrollment_id} in ${this.config.delay_generation_hours} hours`);
  }

  /**
   * Send certificate notification via SMS and Email
   */
  private async sendCertificateNotification(enrollmentDetails: any, certificateNumber: string): Promise<void> {
    const student = enrollmentDetails.user;
    const course = enrollmentDetails.course;
    const phone = student.details?.phone;
    const email = student.details?.email;

    const baseUrl = Deno.env.get("FRONTEND_URL") || "https://irac.ir";
    const certificateUrl = `${baseUrl}/user/certificates`;
    const verificationUrl = `${baseUrl}/verify-certificate?id=${certificateNumber}`;

    let smsNotificationSent = false;
    let emailNotificationSent = false;

    // Send SMS notification if phone number is available
    if (phone) {
      try {
        const smsResult = await smsService.sendSMS({
          to: phone,
          message: this.buildCertificateNotificationMessage({
            studentName: student.details?.name || `${student.details?.first_name || ''} ${student.details?.last_name || ''}`.trim(),
            courseName: course.name,
            courseNameEn: course.name_en,
            certificateNumber,
            certificateUrl,
            verificationUrl
          })
        });

        if (smsResult.success) {
          console.log(`Certificate notification SMS sent successfully to: ${phone}`);
          smsNotificationSent = true;
        } else {
          console.error(`Failed to send SMS notification: ${smsResult.error}`);
        }
      } catch (smsError) {
        console.error('Error sending SMS notification:', smsError);
      }
    }

    // Send email notification if email address is available
    if (email) {
      try {
        const emailResult = await emailService.sendCertificateNotification({
          student_name: student.details?.name || `${student.details?.first_name || ''} ${student.details?.last_name || ''}`.trim(),
          student_name_en: student.details?.name_en || `${student.details?.first_name_en || ''} ${student.details?.last_name_en || ''}`.trim(),
          student_email: email,
          course_name: course.name,
          course_name_en: course.name_en,
          certificate_number: certificateNumber,
          certificate_issue_date: new Date().toISOString(),
          download_url: certificateUrl,
          verification_url: verificationUrl,
          instructor_name: course.instructor?.details?.name,
          instructor_name_en: course.instructor?.details?.name_en,
          completion_date: enrollmentDetails.completed_date?.toISOString(),
          final_grade: enrollmentDetails.final_grade,
          locale: student.details?.preferred_language || 'fa'
        });

        if (emailResult.success) {
          console.log(`Certificate notification email sent successfully to: ${email}`);
          emailNotificationSent = true;
        } else {
          console.error(`Failed to send email notification: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }

    // Log notification summary
    console.log(`Certificate notification summary:`, {
      phone: phone || 'N/A',
      email: email || 'N/A',
      sms_sent: smsNotificationSent,
      email_sent: emailNotificationSent,
      student_name: student.details?.name,
      certificate_number: certificateNumber,
      course_name: course.name
    });

    // Warn if no notifications were sent
    if (!smsNotificationSent && !emailNotificationSent) {
      console.warn('No certificate notifications were sent successfully:', {
        phone_available: !!phone,
        email_available: !!email,
        certificate_number: certificateNumber
      });
    }
  }

  /**
   * Build SMS message for certificate notification
   */
  private buildCertificateNotificationMessage(data: {
    studentName: string;
    courseName: string;
    courseNameEn?: string;
    certificateNumber: string;
    certificateUrl: string;
    verificationUrl: string;
  }): string {
    const { studentName, courseName, certificateNumber, certificateUrl, verificationUrl } = data;
    return `${studentName} عزیز

🎉 تبریک! گواهینامه شما آماده است

📚 دوره: ${courseName}
📜 شماره گواهینامه: ${certificateNumber}
📥 دانلود: ${certificateUrl}
🔍 تایید: ${verificationUrl}

گواهینامه معتبر و قابل تایید است.
مرکز معماری ایرانی - IRAC`;
  }

  /**
   * Log certificate generation for audit trail
   */
  private async logCertificateGeneration(enrollmentDetails: any, result: CertificateGenerationResult): Promise<void> {
    try {
      // In a production system, this would go to an audit log table
      console.log('Certificate Generation Audit Log:', {
        timestamp: new Date().toISOString(),
        enrollment_id: result.enrollment_id,
        user_id: enrollmentDetails.user._id,
        course_id: enrollmentDetails.course._id,
        certificate_number: result.certificate_number,
        success: result.success,
        notification_sent: result.notification_sent,
        error: result.error,
        generation_type: 'automatic'
      });

      // TODO: Store in audit log table
      // await coreApp.odm.main.certificate_audit_log.insertOne({
      //   enrollment_id: result.enrollment_id,
      //   user_id: enrollmentDetails.user._id,
      //   course_id: enrollmentDetails.course._id,
      //   certificate_number: result.certificate_number,
      //   action: 'generated',
      //   success: result.success,
      //   error: result.error,
      //   generation_type: 'automatic',
      //   notification_sent: result.notification_sent,
      //   created_at: new Date(),
      //   metadata: {
      //     course_name: enrollmentDetails.course.name,
      //     student_name: enrollmentDetails.user.details?.name
      //   }
      // });

    } catch (error) {
      console.error('Failed to log certificate generation:', error);
    }
  }

  /**
   * Check pending certificate generations
   */
  async processPendingGenerations(): Promise<CertificateGenerationResult[]> {
    const results: CertificateGenerationResult[] = [];

    try {
      // Find enrollments that are completed but don't have certificates
      const pendingEnrollments = await coreApp.odm.main.enrollment.find(
        {
          progress_percentage: { $gte: 100 },
          status: "Completed",
          certificate_issued: { $ne: true }
        },
        {
          projection: {
            _id: 1,
            user: { _id: 1 },
            course: { _id: 1 },
            completed_date: 1,
            final_grade: 1,
            progress_percentage: 1
          },
          limit: 50 // Process in batches
        }
      );

      for (const enrollment of pendingEnrollments) {
        const event: CourseCompletionEvent = {
          enrollment_id: enrollment._id.toString(),
          user_id: enrollment.user._id.toString(),
          course_id: enrollment.course._id.toString(),
          completion_date: enrollment.completed_date || new Date(),
          final_grade: enrollment.final_grade,
          progress_percentage: enrollment.progress_percentage,
          completion_type: 'automatic'
        };

        const result = await this.processCourseCompletion(event);
        results.push(result);

        // Add small delay between generations to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error('Error processing pending certificate generations:', error);
    }

    return results;
  }

  /**
   * Get automatic generation statistics
   */
  async getGenerationStats(): Promise<{
    total_generated: number;
    pending_count: number;
    failed_count: number;
    recent_generations: any[];
  }> {
    try {
      // Get counts from database
      const totalGenerated = await coreApp.odm.main.enrollment.countDocuments({
        certificate_issued: true
      });

      const pendingCount = await coreApp.odm.main.enrollment.countDocuments({
        progress_percentage: { $gte: 100 },
        status: "Completed",
        certificate_issued: { $ne: true }
      });

      // In a real implementation, failed count would come from audit logs
      const failedCount = 0;

      // Get recent generations
      const recentGenerations = await coreApp.odm.main.enrollment.find(
        { certificate_issued: true },
        {
          projection: {
            certificate_id: 1,
            certificate_issue_date: 1,
            user: { details: { name: 1 } },
            course: { name: 1 }
          },
          sort: { certificate_issue_date: -1 },
          limit: 10
        }
      );

      return {
        total_generated: totalGenerated,
        pending_count: pendingCount,
        failed_count: failedCount,
        recent_generations: recentGenerations
      };

    } catch (error) {
      console.error('Error getting generation stats:', error);
      return {
        total_generated: 0,
        pending_count: 0,
        failed_count: 0,
        recent_generations: []
      };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AutoCertificateConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Automatic certificate generation config updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoCertificateConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const automaticCertificateService = new AutomaticCertificateService();

/**
 * Integration function to be called from enrollment completion handlers
 */
export async function triggerAutomaticCertificateGeneration(
  enrollmentId: string,
  userId: string,
  courseId: string,
  completionData: {
    completion_date: Date;
    final_grade?: number;
    progress_percentage: number;
  }
): Promise<CertificateGenerationResult> {
  const event: CourseCompletionEvent = {
    enrollment_id: enrollmentId,
    user_id: userId,
    course_id: courseId,
    completion_date: completionData.completion_date,
    final_grade: completionData.final_grade,
    progress_percentage: completionData.progress_percentage,
    completion_type: 'automatic'
  };

  return await automaticCertificateService.processCourseCompletion(event);
}

/**
 * Batch process pending certificates - can be called from cron jobs
 */
export async function processPendingCertificates(): Promise<{
  processed: number;
  successful: number;
  failed: number;
  results: CertificateGenerationResult[];
}> {
  const results = await automaticCertificateService.processPendingGenerations();

  const summary = {
    processed: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };

  console.log('Batch certificate processing completed:', summary);
  return summary;
}

/**
 * Utility function to configure automatic certificate generation
 */
export function configureAutomaticCertificates(config: Partial<AutoCertificateConfig>): void {
  automaticCertificateService.updateConfig(config);
}
