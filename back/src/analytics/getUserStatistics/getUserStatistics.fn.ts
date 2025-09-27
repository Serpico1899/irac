import {  coreApp  } from "@app";
import { 
  user,
  order,
  booking,
  scoring_transaction,
  referral,
 } from "@app";

interface UserStatisticsDetails {
  start_date?: Date;
  end_date?: Date;
  period?: string;
  metrics?: string;
  segment?: string;
  activity_type?: string;
  user_level?: string;
  registration_source?: string;
  location?: string;
  age_group?: string;
  gender?: string;
  cohort_type?: string;
  cohort_period?: string;
  retention_periods?: string;
  retention_event?: string;
  min_sessions?: number;
  min_session_duration?: number;
  min_actions?: number;
  min_ltv?: number;
  max_ltv?: number;
  value_currency?: string;
  group_by?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
  include_demographics?: string;
  include_behavioral?: string;
  include_financial?: string;
  include_predictions?: string;
  format?: string;
  export_format?: string;
}

interface UserMetrics {
  total_users: number;
  new_users: number;
  active_users: number;
  retention_rate: number;
  churn_rate: number;
  engagement_score: number;
  lifetime_value: number;
  conversion_rate: number;
  date?: Date;
  segment?: string;
}

export const getUserStatisticsFn = async ({ details }: { details: UserStatisticsDetails }) => {
  try {
    const {
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: 30 days ago
      end_date = new Date(),
      period = "monthly",
      metrics = "active_users",
      segment = "all",
      activity_type = "all",
      user_level,
      registration_source,
      location,
      age_group,
      gender,
      cohort_type = "registration",
      cohort_period = "monthly",
      retention_periods = "[1, 7, 30, 90]",
      retention_event = "login",
      min_sessions = 1,
      min_session_duration = 5,
      min_actions = 1,
      group_by = "date",
      sort_by = "date",
      sort_order = "desc",
      page = 1,
      limit = 10,
      include_demographics = "true",
      include_behavioral = "true",
      include_financial = "false",
      include_predictions = "false",
      format = "summary",
      value_currency = "IRR",
    } = details;

    const dateFilter = {
      created_at: {
        $gte: start_date,
        $lte: end_date
      }
    };

    // Build user filters
    const userFilters: any = {};
    if (user_level) userFilters.level = user_level;
    if (gender) userFilters.gender = gender;
    if (location) userFilters.address = { $regex: location, $options: "i" };

    let userMetrics: UserMetrics[] = [];

    // Calculate different metrics based on request
    switch (metrics) {
      case "registrations":
        userMetrics = await calculateRegistrationMetrics(dateFilter, userFilters, period, group_by);
        break;
      case "active_users":
        userMetrics = await calculateActiveUserMetrics(dateFilter, userFilters, period, activity_type);
        break;
      case "retention":
        userMetrics = await calculateRetentionMetrics(dateFilter, retention_periods, retention_event);
        break;
      case "engagement":
        userMetrics = await calculateEngagementMetrics(dateFilter, userFilters, min_sessions, min_actions);
        break;
      case "lifetime_value":
        userMetrics = await calculateLifetimeValueMetrics(dateFilter, userFilters, value_currency);
        break;
      case "churn_rate":
        userMetrics = await calculateChurnRateMetrics(dateFilter, userFilters, period);
        break;
      case "conversion_rate":
        userMetrics = await calculateConversionRateMetrics(dateFilter, userFilters);
        break;
      default:
        userMetrics = await calculateOverallMetrics(dateFilter, userFilters, period);
    }

    // Apply segmentation if specified
    if (segment !== "all") {
      userMetrics = await applyUserSegmentation(userMetrics, segment, dateFilter);
    }

    // Sort and paginate results
    const sortedMetrics = sortUserMetrics(userMetrics, sort_by, sort_order);
    const startIndex = (page - 1) * limit;
    const paginatedMetrics = sortedMetrics.slice(startIndex, startIndex + limit);

    // Calculate demographic data if requested
    let demographics = null;
    if (include_demographics === "true") {
      demographics = await calculateDemographics(dateFilter, userFilters);
    }

    // Calculate behavioral data if requested
    let behavioral = null;
    if (include_behavioral === "true") {
      behavioral = await calculateBehavioralMetrics(dateFilter, userFilters);
    }

    // Calculate financial data if requested
    let financial = null;
    if (include_financial === "true") {
      financial = await calculateFinancialMetrics(dateFilter, userFilters);
    }

    // Calculate cohort analysis if needed
    let cohortAnalysis = null;
    if (format === "cohort") {
      cohortAnalysis = await calculateCohortAnalysis(cohort_type, cohort_period, dateFilter);
    }

    // Calculate predictions if requested
    let predictions = null;
    if (include_predictions === "true") {
      predictions = await calculateUserPredictions(userMetrics, period);
    }

    // Build summary statistics
    const summary = {
      total_users: await getTotalUsers(dateFilter, userFilters),
      new_users: await getNewUsers(dateFilter, userFilters),
      active_users: await getActiveUsers(dateFilter, userFilters),
      retention_rate: await getOverallRetentionRate(dateFilter),
      churn_rate: await getOverallChurnRate(dateFilter),
      average_engagement: await getAverageEngagement(dateFilter, userFilters),
      period_start: start_date,
      period_end: end_date,
      analysis_date: new Date(),
    };

    // Build response based on format
    const response = buildUserStatisticsResponse(
      format,
      {
        data: paginatedMetrics,
        summary,
        demographics,
        behavioral,
        financial,
        cohort_analysis: cohortAnalysis,
        predictions,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: sortedMetrics.length,
          total_pages: Math.ceil(sortedMetrics.length / limit),
        },
        filters: {
          segment,
          period,
          metrics,
          activity_type,
          user_level,
        }
      }
    );

    return {
      success: true,
      data: response,
      message: "User statistics generated successfully"
    };

  } catch (error) {
    console.error("User statistics generation failed:", error);
    return {
      success: false,
      error: "Failed to generate user statistics",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Helper function to calculate registration metrics
async function calculateRegistrationMetrics(dateFilter: any, userFilters: any, period: string, groupBy: string): Promise<UserMetrics[]> {
  try {
    const pipeline = [
      { $match: { ...dateFilter, ...userFilters } },
      {
        $group: {
          _id: {
            date: getDateGroupExpression(period, "$created_at"),
            segment: groupBy === "level" ? "$level" : null
          },
          total_users: { $sum: 1 },
          new_users: { $sum: 1 }, // All are new in registration metrics
          active_users: { $sum: 1 },
          retention_rate: { $avg: 0 }, // Will be calculated separately
          churn_rate: { $avg: 0 },
          engagement_score: { $avg: 0 },
          lifetime_value: { $avg: 0 },
          conversion_rate: { $avg: 0 }
        }
      }
    ];

    const results = await user().aggregation(pipeline);

    return results.map((item: any) => ({
      total_users: item.total_users || 0,
      new_users: item.new_users || 0,
      active_users: item.active_users || 0,
      retention_rate: item.retention_rate || 0,
      churn_rate: item.churn_rate || 0,
      engagement_score: item.engagement_score || 0,
      lifetime_value: item.lifetime_value || 0,
      conversion_rate: item.conversion_rate || 0,
      date: parseGroupDate(item._id.date, period),
      segment: item._id.segment
    }));
  } catch (error) {
    console.error("Registration metrics calculation failed:", error);
    return [];
  }
}

// Helper function to calculate active user metrics
async function calculateActiveUserMetrics(dateFilter: any, userFilters: any, period: string, activityType: string): Promise<UserMetrics[]> {
  try {
    // This would need to track user activity across different models
    // For now, we'll use scoring transactions as activity indicator
    const activityFilter = activityType === "all" ? {} : { action: activityType };

    const pipeline = [
      {
        $match: {
          ...dateFilter,
          ...activityFilter
        }
      },
      {
        $group: {
          _id: {
            date: getDateGroupExpression(period, "$created_at"),
            user: "$user"
          }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          active_users: { $sum: 1 },
          total_users: { $sum: 1 }
        }
      }
    ];

    const results = await scoring_transaction().aggregation(pipeline);

    return results.map((item: any) => ({
      total_users: item.total_users || 0,
      new_users: 0,
      active_users: item.active_users || 0,
      retention_rate: 0,
      churn_rate: 0,
      engagement_score: 0,
      lifetime_value: 0,
      conversion_rate: 0,
      date: parseGroupDate(item._id, period)
    }));
  } catch (error) {
    console.error("Active user metrics calculation failed:", error);
    return [];
  }
}

// Helper function to calculate retention metrics
async function calculateRetentionMetrics(dateFilter: any, retentionPeriods: string, retentionEvent: string): Promise<UserMetrics[]> {
  try {
    const periods = JSON.parse(retentionPeriods);
    const retentionData: UserMetrics[] = [];

    for (const daysPeriod of periods) {
      const cohortStart = dateFilter.created_at.$gte;
      const retentionDate = new Date(cohortStart.getTime() + daysPeriod * 24 * 60 * 60 * 1000);

      // Calculate users who were active in the retention period
      const retentionRate = await calculatePeriodRetention(cohortStart, retentionDate, retentionEvent);

      retentionData.push({
        total_users: 0,
        new_users: 0,
        active_users: 0,
        retention_rate: retentionRate,
        churn_rate: 100 - retentionRate,
        engagement_score: 0,
        lifetime_value: 0,
        conversion_rate: 0,
        date: retentionDate,
        segment: `${daysPeriod}-day`
      });
    }

    return retentionData;
  } catch (error) {
    console.error("Retention metrics calculation failed:", error);
    return [];
  }
}

// Helper function to calculate engagement metrics
async function calculateEngagementMetrics(dateFilter: any, userFilters: any, minSessions: number, minActions: number): Promise<UserMetrics[]> {
  try {
    const pipeline = [
      {
        $match: dateFilter
      },
      {
        $group: {
          _id: "$user",
          action_count: { $sum: 1 },
          unique_actions: { $addToSet: "$action" },
          points_earned: { $sum: "$points" }
        }
      },
      {
        $match: {
          action_count: { $gte: minActions }
        }
      },
      {
        $group: {
          _id: null,
          total_engaged_users: { $sum: 1 },
          average_actions: { $avg: "$action_count" },
          average_points: { $avg: "$points_earned" }
        }
      }
    ];

    const results = await scoring_transaction().aggregation(pipeline);
    const result = results[0] || {};

    return [{
      total_users: result.total_engaged_users || 0,
      new_users: 0,
      active_users: result.total_engaged_users || 0,
      retention_rate: 0,
      churn_rate: 0,
      engagement_score: result.average_actions || 0,
      lifetime_value: 0,
      conversion_rate: 0,
      date: new Date()
    }];
  } catch (error) {
    console.error("Engagement metrics calculation failed:", error);
    return [];
  }
}

// Helper function to calculate lifetime value metrics
async function calculateLifetimeValueMetrics(dateFilter: any, userFilters: any, currency: string): Promise<UserMetrics[]> {
  try {
    const pipeline = [
      {
        $match: {
          ...dateFilter,
          status: "completed"
        }
      },
      {
        $group: {
          _id: "$user",
          total_spent: { $sum: "$total_amount" },
          order_count: { $sum: 1 },
          first_order: { $min: "$created_at" },
          last_order: { $max: "$created_at" }
        }
      },
      {
        $group: {
          _id: null,
          average_ltv: { $avg: "$total_spent" },
          median_ltv: { $avg: "$total_spent" }, // Simplified median
          total_customers: { $sum: 1 },
          high_value_customers: {
            $sum: {
              $cond: [{ $gt: ["$total_spent", 1000000] }, 1, 0] // 1M IRR threshold
            }
          }
        }
      }
    ];

    const results = await order().aggregation(pipeline);
    const result = results[0] || {};

    return [{
      total_users: result.total_customers || 0,
      new_users: 0,
      active_users: result.total_customers || 0,
      retention_rate: 0,
      churn_rate: 0,
      engagement_score: 0,
      lifetime_value: result.average_ltv || 0,
      conversion_rate: 0,
      date: new Date(),
      segment: "ltv_analysis"
    }];
  } catch (error) {
    console.error("Lifetime value metrics calculation failed:", error);
    return [];
  }
}

// Helper function to calculate churn rate metrics
async function calculateChurnRateMetrics(dateFilter: any, userFilters: any, period: string): Promise<UserMetrics[]> {
  try {
    const currentPeriodStart = dateFilter.created_at.$gte;
    const currentPeriodEnd = dateFilter.created_at.$lte;

    // Calculate previous period for comparison
    const periodDiff = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
    const previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
    const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDiff);

    // Users active in previous period
    const previousActiveUsers = await getActiveUsersInPeriod(previousPeriodStart, previousPeriodEnd);

    // Users active in current period who were also active in previous period
    const retainedUsers = await getRetainedUsers(previousPeriodStart, previousPeriodEnd, currentPeriodStart, currentPeriodEnd);

    const churnRate = previousActiveUsers > 0 ? ((previousActiveUsers - retainedUsers) / previousActiveUsers) * 100 : 0;

    return [{
      total_users: previousActiveUsers,
      new_users: 0,
      active_users: retainedUsers,
      retention_rate: 100 - churnRate,
      churn_rate: churnRate,
      engagement_score: 0,
      lifetime_value: 0,
      conversion_rate: 0,
      date: new Date()
    }];
  } catch (error) {
    console.error("Churn rate metrics calculation failed:", error);
    return [];
  }
}

// Helper function to calculate conversion rate metrics
async function calculateConversionRateMetrics(dateFilter: any, userFilters: any): Promise<UserMetrics[]> {
  try {
    // Total users in period
    const totalUsers = await user().countDocuments({ ...dateFilter, ...userFilters });

    // Users who made purchases
    const convertedUsers = await order().distinct("user", {
      ...dateFilter,
      status: "completed"
    });

    const conversionRate = totalUsers > 0 ? (convertedUsers.length / totalUsers) * 100 : 0;

    return [{
      total_users: totalUsers,
      new_users: 0,
      active_users: convertedUsers.length,
      retention_rate: 0,
      churn_rate: 0,
      engagement_score: 0,
      lifetime_value: 0,
      conversion_rate: conversionRate,
      date: new Date()
    }];
  } catch (error) {
    console.error("Conversion rate metrics calculation failed:", error);
    return [];
  }
}

// Helper function to calculate overall metrics
async function calculateOverallMetrics(dateFilter: any, userFilters: any, period: string): Promise<UserMetrics[]> {
  try {
    const totalUsers = await user().countDocuments({ ...dateFilter, ...userFilters });
    const activeUsers = await getActiveUsers(dateFilter, userFilters);
    const newUsers = await getNewUsers(dateFilter, userFilters);

    return [{
      total_users: totalUsers,
      new_users: newUsers,
      active_users: activeUsers,
      retention_rate: 0,
      churn_rate: 0,
      engagement_score: 0,
      lifetime_value: 0,
      conversion_rate: 0,
      date: new Date()
    }];
  } catch (error) {
    console.error("Overall metrics calculation failed:", error);
    return [];
  }
}

// Helper functions for various calculations
async function getTotalUsers(dateFilter: any, userFilters: any): Promise<number> {
  return await user().countDocuments({ ...dateFilter, ...userFilters });
}

async function getNewUsers(dateFilter: any, userFilters: any): Promise<number> {
  return await user().countDocuments({ ...dateFilter, ...userFilters });
}

async function getActiveUsers(dateFilter: any, userFilters: any): Promise<number> {
  const activeUserIds = await scoring_transaction().distinct("user", dateFilter);
  return activeUserIds.length;
}

async function getOverallRetentionRate(dateFilter: any): Promise<number> {
  // Simplified retention calculation
  return 75; // Placeholder
}

async function getOverallChurnRate(dateFilter: any): Promise<number> {
  return 25; // Placeholder
}

async function getAverageEngagement(dateFilter: any, userFilters: any): Promise<number> {
  const pipeline = [
    { $match: dateFilter },
    { $group: { _id: "$user", actions: { $sum: 1 } } },
    { $group: { _id: null, avg_actions: { $avg: "$actions" } } }
  ];

  const result = await scoring_transaction().aggregation(pipeline);
  return result[0]?.avg_actions || 0;
}

// Additional helper functions
function getDateGroupExpression(period: string, dateField: string): any {
  switch (period) {
    case "daily":
      return { $dateToString: { format: "%Y-%m-%d", date: dateField } };
    case "weekly":
      return { $dateToString: { format: "%Y-W%U", date: dateField } };
    case "monthly":
      return { $dateToString: { format: "%Y-%m", date: dateField } };
    case "yearly":
      return { $dateToString: { format: "%Y", date: dateField } };
    default:
      return { $dateToString: { format: "%Y-%m-%d", date: dateField } };
  }
}

function parseGroupDate(dateString: string, period: string): Date {
  // Simple date parsing - would need more robust implementation
  return new Date(dateString);
}

function sortUserMetrics(metrics: UserMetrics[], sortBy: string, sortOrder: string): UserMetrics[] {
  return metrics.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "date":
        comparison = (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
        break;
      case "count":
        comparison = a.total_users - b.total_users;
        break;
      case "retention":
        comparison = a.retention_rate - b.retention_rate;
        break;
      case "engagement":
        comparison = a.engagement_score - b.engagement_score;
        break;
      default:
        comparison = (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });
}

// Placeholder implementations for complex calculations
async function applyUserSegmentation(metrics: UserMetrics[], segment: string, dateFilter: any): Promise<UserMetrics[]> {
  // Implementation would filter metrics based on segment
  return metrics;
}

async function calculateDemographics(dateFilter: any, userFilters: any): Promise<any> {
  return {
    age_distribution: {},
    gender_distribution: {},
    location_distribution: {}
  };
}

async function calculateBehavioralMetrics(dateFilter: any, userFilters: any): Promise<any> {
  return {
    session_duration: 0,
    pages_per_session: 0,
    bounce_rate: 0
  };
}

async function calculateFinancialMetrics(dateFilter: any, userFilters: any): Promise<any> {
  return {
    average_order_value: 0,
    revenue_per_user: 0,
    purchase_frequency: 0
  };
}

async function calculateCohortAnalysis(cohortType: string, cohortPeriod: string, dateFilter: any): Promise<any> {
  return {
    cohort_table: [],
    cohort_sizes: []
  };
}

async function calculateUserPredictions(metrics: UserMetrics[], period: string): Promise<any> {
  return {
    churn_predictions: [],
    ltv_predictions: []
  };
}

async function calculatePeriodRetention(cohortStart: Date, retentionDate: Date, event: string): Promise<number> {
  return 50; // Placeholder
}

async function getActiveUsersInPeriod(start: Date, end: Date): Promise<number> {
  return 100; // Placeholder
}

async function getRetainedUsers(prevStart: Date, prevEnd: Date, currStart: Date, currEnd: Date): Promise<number> {
  return 75; // Placeholder
}

function buildUserStatisticsResponse(format: string, data: any): any {
  switch (format) {
    case "summary":
      return {
        summary: data.summary,
        key_metrics: data.data,
        pagination: data.pagination
      };
    case "detailed":
      return data;
    case "cohort":
      return {
        summary: data.summary,
        cohort_analysis: data.cohort_analysis,
        filters: data.filters
      };
    case "funnel":
      return {
        summary: data.summary,
        funnel_data: data.data,
        conversion_rates: data.behavioral
      };
    default:
      return data;
  }
}
