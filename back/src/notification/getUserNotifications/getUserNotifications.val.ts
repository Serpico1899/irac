import {
  boolean,
  enums,
  number,
  object,
  optional,
  string,
} from "https://deno.land/x/valibot@v0.36.0/mod.ts";

// Sort order enums
const sort_order_array = ["asc", "desc"] as const;
const sort_order_enums = enums(sort_order_array);

// Sort field enums
const sort_field_array = [
  "created_at",
  "updated_at",
  "scheduled_at",
  "priority",
  "type",
  "category",
  "read_at"
] as const;
const sort_field_enums = enums(sort_field_array);

// Read status filter enums
const read_status_array = ["all", "read", "unread"] as const;
const read_status_enums = enums(read_status_array);

// Priority filter enums
const priority_array = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
const priority_enums = enums(priority_array);

// Category filter enums
const category_array = [
  "COURSE",
  "PAYMENT",
  "BOOKING",
  "CERTIFICATE",
  "SYSTEM",
  "MARKETING",
  "SECURITY"
] as const;
const category_enums = enums(category_array);

// Language preference enums
const language_array = ["fa", "en", "both"] as const;
const language_enums = enums(language_array);

export const getUserNotificationsValidator = {
  details: {
    summary: "Get user notifications",
    description: "Retrieve notifications for a user with filtering, sorting, and pagination options",
    tags: ["Notification"]
  },

  set: object({
    // User identification (required)
    user_id: string(),

    // Pagination
    limit: optional(number()),
    offset: optional(number()),
    page: optional(number()),

    // Filtering options
    read_status: optional(read_status_enums),
    category: optional(category_enums),
    categories: optional(string()), // Comma-separated list
    type: optional(string()),
    types: optional(string()), // Comma-separated list
    priority: optional(priority_enums),
    priorities: optional(string()), // Comma-separated list

    // Date range filtering
    created_after: optional(string()), // ISO date string
    created_before: optional(string()), // ISO date string
    updated_after: optional(string()), // ISO date string
    updated_before: optional(string()), // ISO date string
    scheduled_after: optional(string()), // ISO date string
    scheduled_before: optional(string()), // ISO date string

    // Sorting options
    sort_by: optional(sort_field_enums),
    sort_order: optional(sort_order_enums),
    secondary_sort: optional(sort_field_enums),

    // Content options
    language_preference: optional(language_enums),
    include_expired: optional(boolean()),
    include_scheduled: optional(boolean()),
    include_delivery_status: optional(boolean()),
    include_metadata: optional(boolean()),

    // Search options
    search_query: optional(string()), // Search in title/message
    search_in_content: optional(boolean()), // Whether to search in message content

    // Response format options
    minimal_response: optional(boolean()), // Return only essential fields
    group_by_category: optional(boolean()),
    group_by_date: optional(boolean()),
    include_summary: optional(boolean()) // Include count summaries
  })
};

export type GetUserNotificationsInput = {
  user_id: string;
  limit?: number;
  offset?: number;
  page?: number;
  read_status?: typeof read_status_array[number];
  category?: typeof category_array[number];
  categories?: string;
  type?: string;
  types?: string;
  priority?: typeof priority_array[number];
  priorities?: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  scheduled_after?: string;
  scheduled_before?: string;
  sort_by?: typeof sort_field_array[number];
  sort_order?: typeof sort_order_array[number];
  secondary_sort?: typeof sort_field_array[number];
  language_preference?: typeof language_array[number];
  include_expired?: boolean;
  include_scheduled?: boolean;
  include_delivery_status?: boolean;
  include_metadata?: boolean;
  search_query?: string;
  search_in_content?: boolean;
  minimal_response?: boolean;
  group_by_category?: boolean;
  group_by_date?: boolean;
  include_summary?: boolean;
};
