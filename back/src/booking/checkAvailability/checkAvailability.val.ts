import {
  number,
  object,
  optional,
  string,
  coerce,
  date,
} from "@deps";
import { booking_space_type_enums, booking_time_slot_enums } from "@model";

export const checkAvailabilityValidator = () => {
  return {
    set: object({
      space_type: booking_space_type_enums,
      date: string(), // Will be converted to Date in function
      start_time: booking_time_slot_enums,
      end_time: booking_time_slot_enums,
      capacity_needed: optional(number()),
    }),
    get: object({}),
  };
};
