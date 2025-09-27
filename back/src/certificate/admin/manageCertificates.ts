import {  coreApp  } from "@app";
import { automaticCertificateService, processPendingCertificates } from "../integrations/automaticGeneration.ts";
import { CertificatePDFGenerator, PDFUtils } from "../utils/pdfGenerator.ts";
import { crypto } from "@deps";

interface AdminCertificateFilters {
  status?: 'active' | 'revoked' | 'all';
  template_id?: string;
  course_id?: string;
  user_id?: string;
  date_from?: Date;
  date_to?: Date;
  search_term?: string;
}

interface CertificateExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  include_user_data: boolean;
  include_course_data: boolean;
  date_range?: {
    from: Date;
    to: Date;
  };
}

/**
 * Get all certificates with admin filtering and pagination
 */
export async function getAdminCertificatesAct(body: {
  set: {
    filters?: AdminCertificateFilters;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  };
  user: any;
}) {
  const { filters = {}, limit = 20, offset = 0, sort_by = 'certificate_issue_date', sort_order = 'desc' } = body.set;
  const { user } = body;

  try {
    // Check admin authorization
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Access denied. Admin privileges required.'
      };
    }

    // Build MongoDB filter
    const mongoFilter: any = {
      certificate_issued: true
    };

    // Apply status filter
    if (filters.status === 'active') {
      mongoFilter.certificate_revoked = { $ne: true };
    } else if (filters.status === 'revoked') {
      mongoFilter.certificate_revoked = true;
    }

    // Apply template filter
    if (filters.template_id) {
      mongoFilter.certificate_template_id = filters.template_id;
    }

    // Apply course filter
    if (filters.course_id) {
      mongoFilter.course = { _id: filters.course_id };
    }

    // Apply user filter
    if (filters.user_id) {
      mongoFilter.user = { _id: filters.user_id };
    }

    // Apply date range filter
    if (filters.date_from || filters.date_to) {
      mongoFilter.certificate_issue_date = {};
      if (filters.date_from) {
        mongoFilter.certificate_issue_date.$gte = filters.date_from;
      }
      if (filters.date_to) {
        mongoFilter.certificate_issue_date.$lte = filters.date_to;
      }
    }

    // Apply search filter
    if (filters.search_term) {
      const searchRegex = new RegExp(filters.search_term, 'i');
      mongoFilter.$or = [
        { certificate_id: searchRegex },
        { 'user.details.name': searchRegex },
        { 'user.details.email': searchRegex },
        { 'course.name': searchRegex }
      ];
    }

    // Build sort object
    const sortObject: any = {};
    sortObject[sort_by] = sort_order === 'asc' ? 1 : -1;

    // Get certificates
    const certificates = await coreApp.odm.main.enrollment.find(
      mongoFilter,
      {
        projection: {
          _id: 1,
          certificate_id: 1,
          certificate_issue_date: 1,
          certificate_revoked: 1,
          certificate_revoked_date: 1,
          certificate_revoked_reason: 1,
          certificate_revoked_by: 1,
          certificate_template_id: 1,
          certificate_hash: 1,
          final_grade: 1,
          completed_date: 1,
          user: {
            _id: 1,
            details: {
              name: 1,
              name_en: 1,
              email: 1,
              phone: 1
            }
          },
          course: {
            _id: 1,
            name: 1,
            name_en: 1,
            type: 1,
            instructor_name: 1
          }
        },
        sort: sortObject,
        skip: offset,
        limit: limit
      }
    );

    // Get total count
    const totalCount = await coreApp.odm.main.enrollment.countDocuments(mongoFilter);

    // Transform certificates for admin view
    const transformedCertificates = certificates.map(cert => ({
      id: cert._id.toString(),
      certificate_number: cert.certificate_id,
      issue_date: cert.certificate_issue_date,
      status: cert.certificate_revoked ? 'revoked' : 'active',
      template_id: cert.certificate_template_id || 'standard',
      verification_hash: cert.certificate_hash,
      final_grade: cert.final_grade,
      completed_date: cert.completed_date,
      student: {
        id: cert.user._id.toString(),
        name: cert.user.details?.name,
        name_en: cert.user.details?.name_en,
        email: cert.user.details?.email,
        phone: cert.user.details?.phone
      },
      course: {
        id: cert.course._id.toString(),
        name: cert.course.name,
        name_en: cert.course.name_en,
        type: cert.course.type,
        instructor_name: cert.course.instructor_name
      },
      revocation: cert.certificate_revoked ? {
        date: cert.certificate_revoked_date,
        reason: cert.certificate_revoked_reason,
        revoked_by: cert.certificate_revoked_by
      } : null,
      download_url: `/api/certificate/download/${cert.certificate_id}`,
      verify_url: `/verify-certificate?id=${cert.certificate_id}`
    }));

    return {
      success: true,
      data: {
        certificates: transformedCertificates,
        pagination: {
          total: totalCount,
          limit,
          offset,
          has_more: offset + limit < totalCount
        },
        filters_applied: filters,
        sort: { by: sort_by, order: sort_order }
      },
      message: 'Admin certificates retrieved successfully'
    };

  } catch (error: any) {
    console.error('Admin get certificates error:', error);
    return {
      success: false,
      error: error.message || 'Failed to retrieve certificates'
    };
  }
}

/**
 * Get certificate statistics for admin dashboard
 */
export async function getCertificateStatsAct(body: {
  set: {
    period?: 'week' | 'month' | 'quarter' | 'year';
  };
  user: any;
}) {
  const { period = 'month' } = body.set;
  const { user } = body;

  try {
    // Check admin authorization
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Access denied. Admin privileges required.'
      };
    }

    // Calculate date range based on period
    const now = new Date();
    const periodStart = new Date();

    switch (period) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        periodStart.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get overall statistics
    const [
      totalCertificates,
      activeCertificates,
      revokedCertificates,
      certificatesThisPeriod,
      pendingGeneration
    ] = await Promise.all([
      coreApp.odm.main.enrollment.countDocuments({ certificate_issued: true }),
      coreApp.odm.main.enrollment.countDocuments({
        certificate_issued: true,
        certificate_revoked: { $ne: true }
      }),
      coreApp.odm.main.enrollment.countDocuments({ certificate_revoked: true }),
      coreApp.odm.main.enrollment.countDocuments({
        certificate_issued: true,
        certificate_issue_date: { $gte: periodStart }
      }),
      coreApp.odm.main.enrollment.countDocuments({
        progress_percentage: { $gte: 100 },
        status: "Completed",
        certificate_issued: { $ne: true }
      })
    ]);

    // Get certificate distribution by template
    const templateDistribution = await coreApp.odm.main.enrollment.aggregate([
      { $match: { certificate_issued: true } },
      {
        $group: {
          _id: { $ifNull: ["$certificate_template_id", "standard"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get certificate distribution by course type
    const courseTypeDistribution = await coreApp.odm.main.enrollment.aggregate([
      { $match: { certificate_issued: true } },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course_info"
        }
      },
      { $unwind: "$course_info" },
      {
        $group: {
          _id: "$course_info.type",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get monthly certificate generation trend
    const monthlyTrend = await coreApp.odm.main.enrollment.aggregate([
      {
        $match: {
          certificate_issued: true,
          certificate_issue_date: { $gte: new Date(now.getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$certificate_issue_date" },
            month: { $month: "$certificate_issue_date" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get automatic generation statistics
    const autoGenerationStats = await automaticCertificateService.getGenerationStats();

    return {
      success: true,
      data: {
        overview: {
          total_certificates: totalCertificates,
          active_certificates: activeCertificates,
          revoked_certificates: revokedCertificates,
          certificates_this_period: certificatesThisPeriod,
          pending_generation: pendingGeneration,
          revocation_rate: totalCertificates > 0 ? (revokedCertificates / totalCertificates * 100).toFixed(2) : 0
        },
        distributions: {
          by_template: templateDistribution.map(item => ({
            template_id: item._id,
            count: item.count,
            percentage: totalCertificates > 0 ? (item.count / totalCertificates * 100).toFixed(2) : 0
          })),
          by_course_type: courseTypeDistribution.map(item => ({
            course_type: item._id,
            count: item.count,
            percentage: totalCertificates > 0 ? (item.count / totalCertificates * 100).toFixed(2) : 0
          }))
        },
        trends: {
          monthly_generation: monthlyTrend.map(item => ({
            year: item._id.year,
            month: item._id.month,
            count: item.count
          }))
        },
        automation: {
          enabled: autoGenerationStats.total_generated > 0,
          pending_count: autoGenerationStats.pending_count,
          recent_generations: autoGenerationStats.recent_generations
        },
        period_info: {
          period,
          start_date: periodStart,
          end_date: now
        }
      },
      message: 'Certificate statistics retrieved successfully'
    };

  } catch (error: any) {
    console.error('Get certificate stats error:', error);
    return {
      success: false,
      error: error.message || 'Failed to retrieve certificate statistics'
    };
  }
}

/**
 * Bulk certificate operations (generate, revoke, etc.)
 */
export async function bulkCertificateOperationsAct(body: {
  set: {
    operation: 'generate' | 'revoke' | 'reactivate';
    enrollment_ids: string[];
    reason?: string; // For revocation
    template_id?: string; // For generation
    force?: boolean;
  };
  user: any;
}) {
  const { operation, enrollment_ids, reason, template_id, force = false } = body.set;
  const { user } = body;

  try {
    // Check admin authorization
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Access denied. Admin privileges required.'
      };
    }

    if (!enrollment_ids || enrollment_ids.length === 0) {
      return {
        success: false,
        error: 'No enrollment IDs provided'
      };
    }

    if (enrollment_ids.length > 100) {
      return {
        success: false,
        error: 'Maximum 100 enrollments can be processed at once'
      };
    }

    const results: Array<{
      enrollment_id: string;
      success: boolean;
      message: string;
      certificate_number?: string;
    }> = [];
    let successCount = 0;
    let failureCount = 0;

    for (const enrollmentId of enrollment_ids) {
      try {
        let result;

        switch (operation) {
          case 'generate':
            const { generateCertificateFn } = await import("../generateCertificate/generateCertificate.fn.ts");
            result = await generateCertificateFn({
              details: {
                set: {
                  enrollment_id: enrollmentId,
                  template_id: template_id || 'standard',
                  force_generate: force
                }
              }
            });
            break;

          case 'revoke':
            if (!reason) {
              throw new Error('Revocation reason is required');
            }
            const { revokeCertificateFn } = await import("../revokeCertificate/revokeCertificate.fn.ts");
            result = await revokeCertificateFn({
              details: {
                set: {
                  enrollment_id: enrollmentId,
                  reason
                }
              }
            });
            break;

          case 'reactivate':
            // Reactivate revoked certificate
            await coreApp.odm.main.enrollment.updateOne(
              { _id: enrollmentId },
              {
                $set: {
                  certificate_revoked: false,
                  certificate_revoked_date: null,
                  certificate_revoked_reason: null,
                  certificate_revoked_by: null,
                  updatedAt: new Date()
                }
              }
            );
            result = { success: true, message: 'Certificate reactivated' };
            break;

          default:
            throw new Error('Invalid operation');
        }

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }

        results.push({
          enrollment_id: enrollmentId,
          success: result.success,
          message: result.message || result.error,
          certificate_number: result.data?.certificate_number
        });

      } catch (error: any) {
        failureCount++;
        results.push({
          enrollment_id: enrollmentId,
          success: false,
          message: error.message
        });
      }

      // Add small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return {
      success: true,
      data: {
        operation,
        total_processed: enrollment_ids.length,
        successful: successCount,
        failed: failureCount,
        results
      },
      message: `Bulk ${operation} operation completed. ${successCount} successful, ${failureCount} failed.`
    };

  } catch (error: any) {
    console.error('Bulk certificate operations error:', error);
    return {
      success: false,
      error: error.message || 'Bulk operation failed'
    };
  }
}

/**
 * Process all pending certificate generations
 */
export async function processPendingCertificatesAct(body: {
  set: {
    limit?: number;
  };
  user: any;
}) {
  const { limit = 50 } = body.set;
  const { user } = body;

  try {
    // Check admin authorization
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Access denied. Admin privileges required.'
      };
    }

    const result = await processPendingCertificates();

    return {
      success: true,
      data: result,
      message: `Processed ${result.processed} pending certificates. ${result.successful} successful, ${result.failed} failed.`
    };

  } catch (error: any) {
    console.error('Process pending certificates error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process pending certificates'
    };
  }
}

/**
 * Export certificate data
 */
export async function exportCertificatesAct(body: {
  set: {
    filters?: AdminCertificateFilters;
    export_options: CertificateExportOptions;
  };
  user: any;
}) {
  const { filters = {}, export_options } = body.set;
  const { user } = body;

  try {
    // Check admin authorization
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Access denied. Admin privileges required.'
      };
    }

    // Build filter (reuse logic from getAdminCertificatesAct)
    const mongoFilter: any = { certificate_issued: true };

    if (filters.status === 'active') {
      mongoFilter.certificate_revoked = { $ne: true };
    } else if (filters.status === 'revoked') {
      mongoFilter.certificate_revoked = true;
    }

    if (export_options.date_range) {
      mongoFilter.certificate_issue_date = {
        $gte: export_options.date_range.from,
        $lte: export_options.date_range.to
      };
    }

    // Get certificates for export
    const certificates = await coreApp.odm.main.enrollment.find(
      mongoFilter,
      {
        projection: {
          certificate_id: 1,
          certificate_issue_date: 1,
          certificate_revoked: 1,
          certificate_template_id: 1,
          final_grade: 1,
          completed_date: 1,
          ...(export_options.include_user_data && {
            user: {
              details: {
                name: 1,
                email: 1,
                phone: 1
              }
            }
          }),
          ...(export_options.include_course_data && {
            course: {
              name: 1,
              type: 1,
              instructor_name: 1
            }
          })
        },
        sort: { certificate_issue_date: -1 }
      }
    );

    // Transform data based on export format
    let exportData;
    let filename;
    let contentType;

    switch (export_options.format) {
      case 'json':
        exportData = JSON.stringify(certificates, null, 2);
        filename = `certificates_export_${new Date().toISOString().split('T')[0]}.json`;
        contentType = 'application/json';
        break;

      case 'csv':
        // Convert to CSV format
        const csvHeaders = [
          'Certificate Number',
          'Issue Date',
          'Status',
          'Template',
          'Final Grade',
          'Completion Date'
        ];

        if (export_options.include_user_data) {
          csvHeaders.push('Student Name', 'Student Email', 'Student Phone');
        }

        if (export_options.include_course_data) {
          csvHeaders.push('Course Name', 'Course Type', 'Instructor');
        }

        const csvRows = [csvHeaders.join(',')];

        certificates.forEach(cert => {
          const row = [
            cert.certificate_id,
            cert.certificate_issue_date?.toISOString().split('T')[0] || '',
            cert.certificate_revoked ? 'Revoked' : 'Active',
            cert.certificate_template_id || 'standard',
            cert.final_grade || '',
            cert.completed_date?.toISOString().split('T')[0] || ''
          ];

          if (export_options.include_user_data) {
            row.push(
              cert.user?.details?.name || '',
              cert.user?.details?.email || '',
              cert.user?.details?.phone || ''
            );
          }

          if (export_options.include_course_data) {
            row.push(
              cert.course?.name || '',
              cert.course?.type || '',
              cert.course?.instructor_name || ''
            );
          }

          csvRows.push(row.join(','));
        });

        exportData = csvRows.join('\n');
        filename = `certificates_export_${new Date().toISOString().split('T')[0]}.csv`;
        contentType = 'text/csv';
        break;

      default:
        throw new Error('Unsupported export format');
    }

    // In a real implementation, you might save this to a file storage service
    // and return a download URL. For now, we'll return the data directly.

    return {
      success: true,
      data: {
        export_data: exportData,
        filename,
        content_type: contentType,
        record_count: certificates.length,
        export_date: new Date().toISOString(),
        filters_applied: filters,
        export_options
      },
      message: `Exported ${certificates.length} certificate records`
    };

  } catch (error: any) {
    console.error('Export certificates error:', error);
    return {
      success: false,
      error: error.message || 'Failed to export certificates'
    };
  }
}

/**
 * Update certificate system configuration
 */
export async function updateCertificateConfigAct(body: {
  set: {
    auto_generation_enabled: boolean;
    require_minimum_grade: boolean;
    minimum_grade_threshold: number;
    send_email_notifications: boolean;
    allowed_course_types: string[];
    default_template_id: string;
  };
  user: any;
}) {
  const {
    auto_generation_enabled,
    require_minimum_grade,
    minimum_grade_threshold,
    send_email_notifications,
    allowed_course_types,
    default_template_id
  } = body.set;
  const { user } = body;

  try {
    // Check admin authorization
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Access denied. Admin privileges required.'
      };
    }

    // Update automatic generation configuration
    automaticCertificateService.updateConfig({
      enabled: auto_generation_enabled,
      auto_generate_on_completion: auto_generation_enabled,
      require_minimum_grade,
      minimum_grade_threshold,
      send_email_notification: send_email_notifications,
      generate_for_course_types: allowed_course_types
    });

    // In a real implementation, save configuration to database
    // await coreApp.odm.main.certificate_config.updateOne(
    //   { _id: 'global' },
    //   { $set: { ...body.set, updated_at: new Date(), updated_by: user._id } },
    //   { upsert: true }
    // );

    return {
      success: true,
      data: {
        config: automaticCertificateService.getConfig(),
        updated_at: new Date(),
        updated_by: user._id
      },
      message: 'Certificate system configuration updated successfully'
    };

  } catch (error: any) {
    console.error('Update certificate config error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update certificate configuration'
    };
  }
}

/**
 * Get certificate audit log
 */
export async function getCertificateAuditLogAct(body: {
  set: {
    certificate_number?: string;
    user_id?: string;
    action?: string;
    limit?: number;
    offset?: number;
  };
  user: any;
}) {
  const { certificate_number, user_id, action, limit = 50, offset = 0 } = body.set;
  const { user } = body;

  try {
    // Check admin authorization
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Access denied. Admin privileges required.'
      };
    }

    // In a real implementation, this would query an audit log table
    // For now, we'll return a mock audit log structure

    const mockAuditLog = [
      {
        id: '1',
        timestamp: new Date(),
        action: 'certificate_generated',
        certificate_number: 'IRAC-2024-ARCH-12345',
        user_id: 'user123',
        admin_user_id: 'admin456',
        details: {
          template_id: 'standard',
          automatic: true
        }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 86400000),
        action: 'certificate_revoked',
        certificate_number: 'IRAC-2024-ARCH-12346',
        user_id: 'user124',
        admin_user_id: user._id,
        details: {
          reason: 'Course requirements not met'
        }
      }
    ];

    // Apply filters
    let filteredLog = mockAuditLog;

    if (certificate_number) {
      filteredLog = filteredLog.filter(entry => entry.certificate_number === certificate_number);
    }

    if (user_id) {
      filteredLog = filteredLog.filter(entry => entry.user_id === user_id);
    }

    if (action) {
      filteredLog = filteredLog.filter(entry => entry.action === action);
    }

    // Apply pagination
    const paginatedLog = filteredLog.slice(offset, offset + limit);

    return {
      success: true,
      data: {
        audit_entries: paginatedLog,
        pagination: {
          total: filteredLog.length,
          limit,
          offset,
          has_more: offset + limit < filteredLog.length
        }
      },
      message: 'Certificate audit log retrieved successfully'
    };

  } catch (error: any) {
    console.error('Get certificate audit log error:', error);
    return {
      success: false,
      error: error.message || 'Failed to retrieve audit log'
    };
  }
}
