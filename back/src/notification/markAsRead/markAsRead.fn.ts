import {  coreApp  } from "@app";
import { ObjectId } from "npm:mongodb";
import type { MarkAsReadInput } from "./markAsRead.val.ts";

export const markAsReadFn = async (body: MarkAsReadInput) => {
  const {
    user_id,
    notification_id,
    notification_ids,
    mark_all_as_read = false,
    mark_all_by_category,
    mark_all_by_type,
    read_at,
    filters,
    read_from_device = "web",
    read_location,
    batch_operation = false
  } = body;

  // Validate user exists
  const user = await coreApp.odm.db.collection("users").findOne({
    _id: new ObjectId(user_id)
  });

  if (!user) {
    throw new Error(`User with ID ${user_id} not found`);
  }

  const readTimestamp = read_at ? new Date(read_at) : new Date();
  let updateFilter: any = {
    user_id: new ObjectId(user_id),
    is_read: false // Only update unread notifications
  };

  let operationType = "SINGLE";
  let notificationsToUpdate: string[] = [];

  // Build query based on operation type
  if (mark_all_as_read) {
    operationType = "MARK_ALL";
    // Apply additional filters if provided
    if (filters) {
      if (filters.category) updateFilter.category = filters.category;
      if (filters.type) updateFilter.type = filters.type;
      if (filters.priority) updateFilter.priority = filters.priority;
      if (filters.created_before) {
        updateFilter.created_at = { ...updateFilter.created_at, $lte: new Date(filters.created_before) };
      }
      if (filters.created_after) {
        updateFilter.created_at = { ...updateFilter.created_at, $gte: new Date(filters.created_after) };
      }
    }
  } else if (mark_all_by_category) {
    operationType = "MARK_BY_CATEGORY";
    updateFilter.category = mark_all_by_category;
  } else if (mark_all_by_type) {
    operationType = "MARK_BY_TYPE";
    updateFilter.type = mark_all_by_type;
  } else if (notification_ids && notification_ids.length > 0) {
    operationType = "MULTIPLE";
    updateFilter._id = { $in: notification_ids.map(id => new ObjectId(id)) };
    notificationsToUpdate = notification_ids;
  } else if (notification_id) {
    operationType = "SINGLE";
    updateFilter._id = new ObjectId(notification_id);
    notificationsToUpdate = [notification_id];
  } else {
    throw new Error("Must specify notification_id, notification_ids, or use bulk operation flags");
  }

  // Get notifications that will be updated (for counting and logging)
  const notificationsToMark = await coreApp.odm.db.collection("notifications")
    .find(updateFilter)
    .toArray();

  if (notificationsToMark.length === 0) {
    return {
      success: true,
      marked_count: 0,
      message: "No unread notifications found matching criteria"
    };
  }

  // Update notifications as read
  const updateResult = await coreApp.odm.db.collection("notifications").updateMany(
    updateFilter,
    {
      $set: {
        is_read: true,
        read_at: readTimestamp,
        read_metadata: {
          read_from_device,
          read_location,
          batch_operation,
          operation_type: operationType
        },
        updated_at: readTimestamp
      }
    }
  );

  if (updateResult.matchedCount === 0) {
    throw new Error("No notifications found matching criteria");
  }

  // Update user's unread notification count
  const unreadCount = await coreApp.odm.db.collection("notifications").countDocuments({
    user_id: new ObjectId(user_id),
    is_read: false
  });

  await coreApp.odm.db.collection("users").updateOne(
    { _id: new ObjectId(user_id) },
    {
      $set: {
        unread_notifications_count: unreadCount,
        last_read_notifications_at: readTimestamp
      }
    }
  );

  // Log the read operations for analytics
  const logPromises = notificationsToMark.map(notification =>
    logNotificationEvent({
      notification_id: notification._id,
      user_id: new ObjectId(user_id),
      event_type: "MARKED_AS_READ",
      event_data: {
        operation_type: operationType,
        read_from_device,
        read_location,
        batch_operation,
        notification_type: notification.type,
        notification_category: notification.category,
        time_to_read: readTimestamp.getTime() - new Date(notification.created_at).getTime()
      }
    })
  );

  await Promise.allSettled(logPromises);

  // Handle auto-delete if specified
  const autoDeletePromises = notificationsToMark
    .filter(notification => notification.auto_delete_after)
    .map(async (notification) => {
      const deleteAt = new Date(readTimestamp.getTime() + (notification.auto_delete_after * 1000));

      // In a real system, you'd schedule this deletion
      // For now, we'll just log it
      await logNotificationEvent({
        notification_id: notification._id,
        user_id: notification.user_id,
        event_type: "SCHEDULED_FOR_DELETION",
        event_data: {
          delete_at: deleteAt,
          auto_delete_after: notification.auto_delete_after
        }
      });
    });

  await Promise.allSettled(autoDeletePromises);

  // Prepare response with details
  const categoryBreakdown = notificationsToMark.reduce((acc, notification) => {
    acc[notification.category] = (acc[notification.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeBreakdown = notificationsToMark.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    success: true,
    marked_count: updateResult.modifiedCount,
    operation_type: operationType,
    remaining_unread_count: unreadCount,
    breakdown: {
      by_category: categoryBreakdown,
      by_type: typeBreakdown
    },
    read_at: readTimestamp,
    message: `Successfully marked ${updateResult.modifiedCount} notification${updateResult.modifiedCount === 1 ? '' : 's'} as read`
  };
};

// Helper function to log notification events
async function logNotificationEvent(eventData: any) {
  try {
    await coreApp.odm.db.collection("notification_logs").insertOne({
      ...eventData,
      created_at: new Date()
    });
  } catch (error) {
    console.error("Failed to log notification event:", error);
    // Don't throw error as logging is not critical
  }
}
