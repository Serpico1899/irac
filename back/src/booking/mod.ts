import { checkAvailabilitySetup } from "./checkAvailability/mod.ts";
import { createBookingSetup } from "./createBooking/mod.ts";
import { getUserBookingsSetup } from "./getUserBookings/mod.ts";
import { updateBookingSetup } from "./updateBooking/mod.ts";
import { deleteBookingSetup } from "./deleteBooking/mod.ts";
import { getAllBookingsSetup } from "./getAllBookings/mod.ts";
import { approveBookingSetup } from "./approveBooking/mod.ts";
import { rejectBookingSetup } from "./rejectBooking/mod.ts";
import { checkInUserSetup } from "./checkInUser/mod.ts";
import { checkOutUserSetup } from "./checkOutUser/mod.ts";
import { getBookingStatsSetup } from "./getBookingStats/mod.ts";
import { cancelBookingSetup } from "./cancelBooking/mod.ts";
import { getSpaceUtilizationSetup } from "./getSpaceUtilization/mod.ts";

export const bookingSetup = () => {
  // User-facing booking APIs
  checkAvailabilitySetup();
  createBookingSetup();
  getUserBookingsSetup();

  // Admin booking management APIs
  updateBookingSetup();
  deleteBookingSetup();
  getAllBookingsSetup();

  // Booking workflow management APIs
  approveBookingSetup();
  rejectBookingSetup();
  checkInUserSetup();
  checkOutUserSetup();
  cancelBookingSetup();

  // Analytics and reporting APIs
  getBookingStatsSetup();
  getSpaceUtilizationSetup();
};
