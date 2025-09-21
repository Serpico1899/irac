import { coreApp } from "../../mod.ts";
import { ObjectId } from "npm:mongodb";
import type { GetUserNotificationsInput } from "./getUserNotifications.val.ts";

export const getUserNotificationsFn = async (body: GetUserNotificationsInput) => {
  const {
    user_id,
    limit = 20,
    offset = 0,
    page,
    read_status = "all",
    category,
    categories,
    type,
    types,
    priority,
    priorities,
    created_after,
    created_before,
    updated_after,
    updated_before,
    scheduled_after,
    scheduled_before,
    sort_by = "created_at",
    sort_order = "desc",
    secondary_sort,
    language_preference = "both",
    include_expired = true,
    include_scheduled = true,
    include_delivery_status = false,
    include_metadata = false,
    search_query,
    search_in_content = false,
    minimal_response = false,
    group_by_category = false,
    group_by_date = false,
    include_summary = false
  } = body;

  // Validate user exists
  const user = await coreApp.odm.db.collection("users").findOne({
    _id: new ObjectId(user_id)
  });

  if (!user) {
    throw new Error(`User with ID ${user_id} not found`);
  }

  // Calculate pagination
  const actualOffset = page ? (page - 1) * limit : offset;
  const actualLimit = Math.min(limit, 100); // Max 100 per request

  // Build base query filter
  let queryFilter: any = {
    user_id: new ObjectId(user_id)
  };

  // Apply read status filter
  if (read_status === "read") {
    queryFilter.is_read = true;
  } else if (read_status === "unread") {
    queryFilter.is_read = false;
  }

  // Apply category filters
  if (category) {
    queryFilter.category = category;
  } else if (categories) {
    const categoryList = categories.split(",").map(c => c.trim());
    queryFilter.category = { $in: categoryList };
  }

  // Apply type filters
  if (type) {
    queryFilter.type = type;
  } else if (types) {
    const typeList = types.split(",").map(t => t.trim());
    queryFilter.type = { $in: typeList };
  }

  // Apply priority filters
  if (priority) {
    queryFilter.priority = priority;
  } else if (priorities) {
    const priorityList = priorities.split(",").map(p => p.trim());
    queryFilter.priority = { $in: priorityList };
  }

  // Apply date range filters
  if (created_after || created_before) {
    queryFilter.created_at = {};
    if (created_after) queryFilter.created_at.$gte = new Date(created_after);
    if (created_before) queryFilter.created_at.$lte = new Date(created_before);
  }

  if (updated_after || updated_before) {
    queryFilter.updated_at = {};
    if (updated_after) queryFilter.updated_at.$gte = new Date(updated_after);
    if (updated_before) queryFilter.updated_at.$lte = new Date(updated_before);
  }

  if (scheduled_after || scheduled_before) {
    queryFilter.scheduled_at = {};
    if (scheduled_after) queryFilter.scheduled_at.$gte = new Date(scheduled_after);
    if (scheduled_before) queryFilter.scheduled_at.$lte = new Date(scheduled_before);
  }

  // Apply expiration filter
  if (!include_expired) {
    queryFilter.$or = [
      { expires_at: { $exists: false } },
      { expires_at: null },
      { expires_at: { $gte: new Date() } }
    ];
  }

  // Apply scheduled filter
  if (!include_scheduled) {
    queryFilter.scheduled_at = { $lte: new Date() };
  }

  // Apply search filter
  if (search_query) {
    const searchRegex = new RegExp(search_query, 'i');
    const searchFields = [
      { title_fa: searchRegex },
      { title_en: searchRegex }
    ];

    if (search_in_content) {
      searchFields.push(
        { message_fa: searchRegex },
        { message_en: searchRegex }
      );
    }

    queryFilter.$or = searchFields;
  }

  // Build sort options
  let sortOptions: any = {};
  const sortDirection = sort_order === "asc" ? 1 : -1;
  sortOptions[sort_by] = sortDirection;

  if (secondary_sort && secondary_sort !== sort_by) {
    sortOptions[secondary_sort] = sortDirection;
  }

  // Build projection (fields to return)
  let projection: any = {};
  if (minimal_response) {
    projection = {
      _id: 1,
      type: 1,
      category: 1,
      title_fa: 1,
      title_en: 1,
      is_read: 1,
      priority: 1,
      created_at: 1,
      action_url: 1
    };
  } else {
    projection = {
      password: 0, // Exclude sensitive fields that shouldn't be there anyway
      template_data: include_metadata ? 1 : 0,
      metadata: include_metadata ? 1 : 0,
      delivery_status: include_delivery_status ? 1 : 0
    };
  }

  // Execute main query
  const notificationsQuery = coreApp.odm.db.collection("notifications")
    .find(queryFilter, { projection })
    .sort(sortOptions)
    .skip(actualOffset)
    .limit(actualLimit);

  const notifications = await notificationsQuery.toArray();

  // Get total count for pagination
  const totalCount = await coreApp.odm.db.collection("notifications").countDocuments(queryFilter);

  // Process notifications based on language preference
  const processedNotifications = notifications.map(notification => {
    const processed = { ...notification };

    // Handle language preference
    if (language_preference === "fa") {
      processed.title = processed.title_fa || processed.title_en || "";
      processed.message = processed.message_fa || processed.message_en || "";
      processed.action_label = processed.action_label_fa || processed.action_label_en || "";
    } else if (language_preference === "en") {
      processed.title = processed.title_en || processed.title_fa || "";
      processed.message = processed.message_en || processed.message_fa || "";
      processed.action_label = processed.action_label_en || processed.action_label_fa || "";
    }
    // If "both", keep both language versions

    // Convert ObjectIds to strings for frontend
    processed.id = processed._id.toHexString();
    processed.user_id = processed.user_id.toHexString();

    // Format dates
    processed.created_at = processed.created_at.toISOString();
    processed.updated_at = processed.updated_at?.toISOString();
    processed.scheduled_at = processed.scheduled_at?.toISOString();
    processed.expires_at = processed.expires_at?.toISOString();
    processed.read_at = processed.read_at?.toISOString();

    return processed;
  });

  // Prepare response
  let response: any = {
    success: true,
    notifications: processedNotifications,
    pagination: {
      total_count: totalCount,
      limit: actualLimit,
      offset: actualOffset,
      page: page || Math.floor(actualOffset / actualLimit) + 1,
      total_pages: Math.ceil(totalCount / actualLimit),
      has_more: actualOffset + actualLimit < totalCount
    }
  };

  // Add grouping if requested
  if (group_by_category) {
    response.grouped_by_category = groupNotificationsByCategory(processedNotifications);
  }

  if (group_by_date) {
    response.grouped_by_date = groupNotificationsByDate(processedNotifications);
  }

  // Add summary if requested
  if (include_summary) {
    response.summary = await buildNotificationSummary(user_id, queryFilter);
  }

  return response;
};

// Helper function to group notifications by category
function groupNotificationsByCategory(notifications: any[]): Record<string, any[]> {
  return notifications.reduce((groups, notification) => {
    const category = notification.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(notification);
    return groups;
  }, {});
}

// Helper function to group notifications by date
function groupNotificationsByDate(notifications: any[]): Record<string, any[]> {
  return notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});
}

// Helper function to build notification summary
async function buildNotificationSummary(user_id: string, baseFilter: any): Promise<any> {
  const userId = new ObjectId(user_id);

  // Remove user_id from base filter for aggregation
  const { user_id: _, ...filterWithoutUserId } = baseFilter;
  const aggregationMatch = { user_id: userId, ...filterWithoutUserId };

  const summaryData = await coreApp.odm.db.collection("notifications").aggregate([
    { $match: aggregationMatch },
    {
      $group: {
        _id: null,
        total_count: { $sum: 1 },
        unread_count: { $sum: { $cond: [{ $eq: ["$is_read", false] }, 1, 0] } },
        read_count: { $sum: { $cond: [{ $eq: ["$is_read", true] }, 1, 0] } },
        categories: { $addToSet: "$category" },
        types: { $addToSet: "$type" },
        priorities: { $addToSet: "$priority" },
        latest_notification: { $max: "$created_at" },
        oldest_notification: { $min: "$created_at" }
      }
    }
  ]).toArray();

  const summary = summaryData[0] || {
    total_count: 0,
    unread_count: 0,
    read_count: 0,
    categories: [],
    types: [],
    priorities: [],
    latest_notification: null,
    oldest_notification: null
  };

  // Get category breakdown
  const categoryBreakdown = await coreApp.odm.db.collection("notifications").aggregate([
    { $match: aggregationMatch },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        unread_count: { $sum: { $cond: [{ $eq: ["$is_read", false] }, 1, 0] } }
      }
    }
  ]).toArray();

  // Get type breakdown
  const typeBreakdown = await coreApp.odm.db.collection("notifications").aggregate([
    { $match: aggregationMatch },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        unread_count: { $sum: { $cond: [{ $eq: ["$is_read", false] }, 1, 0] } }
      }
    }
  ]).toArray();

  return {
    ...summary,
    breakdown: {
      by_category: categoryBreakdown.reduce((acc, item) => {
        acc[item._id] = { total: item.count, unread: item.unread_count };
        return acc;
      }, {}),
      by_type: typeBreakdown.reduce((acc, item) => {
        acc[item._id] = { total: item.count, unread: item.unread_count };
        return acc;
      }, {})
    }
  };
}
