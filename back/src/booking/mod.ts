import { checkAvailabilitySetup } from "./checkAvailability/mod.ts";
import { createBookingSetup } from "./createBooking/mod.ts";
import { getUserBookingsSetup } from "./getUserBookings/mod.ts";

export const bookingSetup = () => {
  checkAvailabilitySetup();
  createBookingSetup();
  getUserBookingsSetup();
};
