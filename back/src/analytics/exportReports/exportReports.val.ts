import { object, string, optional, union, literal, boolean, array } from "@deps";

const exportReportsStruct = {
  set: {
    reportType: union([
      literal("revenue_dashboard"),
      literal("user_engagement"),
      literal("course_performance"),
      literal("booking_analytics"),
      literal("top_performers"),
      literal("comprehensive"),
      literal("custom")
    ]),
    exportFormat: union([
      literal("pdf"),
      literal("excel"),
      literal("csv"),
      literal("json")
    ]),
    dateFrom: optional(string()),
    dateTo: optional(string()),
    period: optional(union([
      literal("7d"),
      literal("30d"),
      literal("90d"),
      literal("1y"),
      literal("all")
    ])),
    includeCharts: optional(boolean()),
    includeRawData: optional(boolean()),
    language: optional(union([
      literal("fa"),
      literal("en")
    ])),
    emailReport: optional(boolean()),
    emailRecipients: optional(array(string())),
    scheduledReport: optional(boolean()),
    scheduleFrequency: optional(union([
      literal("daily"),
      literal("weekly"),
      literal("monthly"),
      literal("quarterly")
    ])),
    customFilters: optional(object({
      categoryId: optional(string()),
      instructorId: optional(string()),
      userId: optional(string()),
      spaceId: optional(string()),
      status: optional(string()),
      minRevenue: optional(string()),
      maxRevenue: optional(string())
    })),
    reportSections: optional(array(union([
      literal("overview"),
      literal("metrics"),
      literal("trends"),
      literal("comparisons"),
      literal("recommendations"),
      literal("detailed_data")
    ]))),
    companyLogo: optional(boolean()),
    customTitle: optional(string()),
    customDescription: optional(string()),
    watermark: optional(string()),
    confidential: optional(boolean()),
  },
  get: {
    _id: false,
    success: true,
    downloadUrl: true,
    fileName: true,
    fileSize: true,
    reportMetadata: true,
    emailStatus: true,
    scheduleId: true,
    expiresAt: true,
    generatedAt: true,
    reportSummary: true,
    errorMessage: true,
  },
};

export const exportReportsValidator = object(exportReportsStruct);

export const schema = {
  details: {
    set: exportReportsStruct.set,
    get: exportReportsStruct.get,
  },
};
