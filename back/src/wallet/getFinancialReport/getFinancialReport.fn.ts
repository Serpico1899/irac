import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const getFinancialReportFn: ActFn = async (body) => {
  const {
    set: {
      report_type,
      start_date,
      end_date,
      breakdown_by,
      include_refunds,
      include_failed,
      export_format,
      currency
    },
  } = body.details;

  // Validate custom date range
  if (report_type === "custom" && (!start_date || !end_date)) {
    return {
      success: false,
      message: "Start date and end date are required for custom reports",
    };
  }

  try {
    // Generate financial report
    const result = await WalletService.getFinancialReport({
      report_type,
      start_date,
      end_date,
      breakdown_by,
      include_refunds,
      include_failed,
      export_format,
      currency,
    });

    return {
      success: true,
      data: result,
      message: `Generated ${report_type} financial report`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to generate financial report",
    };
  }
};
