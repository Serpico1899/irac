import {
  boolean,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";
import { booking_status_enums } from "@model";

export const getUserBookingsValidator = () => {
  return {
    set: object({
      user_id: optional(string()), // Optional - defaults to authenticated user
      status: optional(booking_status_enums),
      limit: optional(number()),
      skip: optional(number()),
      include_history: optional(boolean()),
      date_from: optional(string()), // Filter bookings from this date
      date_to: optional(string()), // Filter bookings until this date
      space_type: optional(string()), // Filter by space type
    }),
    get: object({}),
  };
};
