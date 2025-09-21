import {
  array,
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";

// Enum definitions
const certificate_status_array = ["active", "revoked", "all"];
const certificate_status_enums = enums(certificate_status_array);

const sort_order_array = ["asc", "desc"];
const sort_order_enums = enums(sort_order_array);

const bulk_operation_array = ["generate", "revoke", "reactivate"];
const bulk_operation_enums = enums(bulk_operation_array);

const period_array = ["week", "month", "quarter", "year"];
const period_enums = enums(period_array);

const export_format_array = ["csv", "json", "xlsx"];
const export_format_enums = enums(export_format_array);

const sort_by_array = ["certificate_issue_date", "certificate_id", "student_name", "course_name", "status"];
const sort_by_enums = enums(sort_by_array);

// Get Admin Certificates Validator
export const getAdminCertificatesValidator = () => {
  return {
    set: object({
      filters: optional(object({
        status: optional(certificate_status_enums),
        template_id: optional(string()),
        course_id: optional(string()),
        user_id: optional(string()),
        date_from: optional(coerce(date(), string(), (value) => new Date(value))),
        date_to: optional(coerce(date(), string(), (value) => new Date(value))),
        search_term: optional(string()),
      })),
      limit: optional(defaulted(number(), 20)),
      offset: optional(defaulted(number(), 0)),
      sort_by: optional(defaulted(sort_by_enums, "certificate_issue_date")),
      sort_order: optional(defaulted(sort_order_enums, "desc")),
    }),
    get: object({
      certificates: optional(boolean()),
      pagination: optional(boolean()),
      stats: optional(boolean()),
    }),
  };
};

// Get Certificate Stats Validator
export const getCertificateStatsValidator = () => {
  return {
    set: object({
      period: optional(defaulted(period_enums, "month")),
    }),
    get: object({
      stats: optional(boolean()),
      charts: optional(boolean()),
      summary: optional(boolean()),
    }),
  };
};

// Bulk Certificate Operations Validator
export const bulkCertificateOperationsValidator = () => {
  return {
    set: object({
      operation: bulk_operation_enums,
      enrollment_ids: array(string()),
      reason: optional(string()), // Required for revocation
      template_id: optional(string()), // For generation
      force: optional(defaulted(boolean(), false)),
    }),
    get: object({
      results: optional(boolean()),
      summary: optional(boolean()),
    }),
  };
};

// Process Pending Certificates Validator
export const processPendingCertificatesValidator = () => {
  return {
    set: object({
      limit: optional(defaulted(number(), 50)),
    }),
    get: object({
      processed: optional(boolean()),
      summary: optional(boolean()),
    }),
  };
};

// Export Certificates Validator
export const exportCertificatesValidator = () => {
  return {
    set: object({
      filters: optional(object({
        status: optional(certificate_status_enums),
        template_id: optional(string()),
        course_id: optional(string()),
        user_id: optional(string()),
        date_from: optional(coerce(date(), string(), (value) => new Date(value))),
        date_to: optional(coerce(date(), string(), (value) => new Date(value))),
        search_term: optional(string()),
      })),
      export_options: object({
        format: export_format_enums,
        include_user_data: defaulted(boolean(), true),
        include_course_data: defaulted(boolean(), true),
        date_range: optional(object({
          from: coerce(date(), string(), (value) => new Date(value)),
          to: coerce(date(), string(), (value) => new Date(value)),
        })),
      }),
    }),
    get: object({
      export_data: optional(boolean()),
      metadata: optional(boolean()),
    }),
  };
};

// Update Certificate Config Validator
export const updateCertificateConfigValidator = () => {
  return {
    set: object({
      auto_generation_enabled: boolean(),
      require_minimum_grade: boolean(),
      minimum_grade_threshold: number(),
      send_email_notifications: boolean(),
      allowed_course_types: array(string()),
      default_template_id: string(),
    }),
    get: object({
      config: optional(boolean()),
      status: optional(boolean()),
    }),
  };
};

// Get Certificate Audit Log Validator
export const getCertificateAuditLogValidator = () => {
  return {
    set: object({
      certificate_number: optional(string()),
      user_id: optional(string()),
      action: optional(string()),
      limit: optional(defaulted(number(), 50)),
      offset: optional(defaulted(number(), 0)),
      date_from: optional(coerce(date(), string(), (value) => new Date(value))),
      date_to: optional(coerce(date(), string(), (value) => new Date(value))),
    }),
    get: object({
      logs: optional(boolean()),
      pagination: optional(boolean()),
      summary: optional(boolean()),
    }),
  };
};
