import {
  array,
  boolean,
  object,
  optional,
  string,
} from "https://deno.land/x/valibot@v0.36.0/mod.ts";

export const markAsReadValidator = {
  details: {
    summary: "Mark notification(s) as read",
    description: "Mark one or multiple notifications as read for a user",
    tags: ["Notification"]
  },

  set: object({
    // User identification (required for security)
    user_id: string(),

    // Notification identification (either single ID or array of IDs)
    notification_id: optional(string()),
    notification_ids: optional(array(string())),

    // Bulk operations
    mark_all_as_read: optional(boolean()),
    mark_all_by_category: optional(string()), // Category to mark as read
    mark_all_by_type: optional(string()), // Type to mark as read

    // Optional read timestamp (defaults to current time)
    read_at: optional(string()), // ISO date string

    // Filtering options for bulk operations
    filters: optional(object({
      category: optional(string()),
      type: optional(string()),
      priority: optional(string()),
      created_before: optional(string()), // ISO date string
      created_after: optional(string()), // ISO date string
      only_unread: optional(boolean())
    })),

    // Metadata
    read_from_device: optional(string()), // "web", "mobile", "email", etc.
    read_location: optional(string()), // Page or screen where it was read
    batch_operation: optional(boolean()) // Whether this is part of a batch operation
  })
};

export type MarkAsReadInput = {
  user_id: string;
  notification_id?: string;
  notification_ids?: string[];
  mark_all_as_read?: boolean;
  mark_all_by_category?: string;
  mark_all_by_type?: string;
  read_at?: string;
  filters?: {
    category?: string;
    type?: string;
    priority?: string;
    created_before?: string;
    created_after?: string;
    only_unread?: boolean;
  };
  read_from_device?: string;
  read_location?: string;
  batch_operation?: boolean;
};
