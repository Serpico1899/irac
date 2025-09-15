import {
  boolean,
  number,
  object,
  optional,
  record,
  string,
} from "@deps";
import { booking_space_type_enums, booking_time_slot_enums } from "@model";

export const createBookingValidator = () => {
  return {
    set: object({
      space_type: booking_space_type_enums,
      date: string(), // Will be converted to Date in function
      start_time: booking_time_slot_enums,
      end_time: booking_time_slot_enums,
      capacity_needed: number(),
      customer_name: string(),
      customer_email: optional(string()),
      customer_phone: optional(string()),
      company_name: optional(string()),
      purpose: optional(string()),
      special_requirements: optional(string()),
      equipment_needed: optional(string()),
      catering_required: optional(boolean()),
      workshop_session_id: optional(string()),
      metadata: optional(record(string(), string())),
    }),
    get: object({}),
  };
};
