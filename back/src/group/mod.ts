import { lesan } from "@deps";
import createGroupFn from "./createGroup/mod.ts";
import addGroupMemberFn from "./addGroupMember/mod.ts";
import calculateGroupDiscountFn from "./calculateGroupDiscount/mod.ts";
import processGroupEnrollmentFn from "./processGroupEnrollment/mod.ts";
import getGroupStatsFn from "./getGroupStats/mod.ts";

// Group Management Functions
export const createGroup = lesan.Fn(createGroupFn);
export const addGroupMember = lesan.Fn(addGroupMemberFn);
export const calculateGroupDiscount = lesan.Fn(calculateGroupDiscountFn);
export const processGroupEnrollment = lesan.Fn(processGroupEnrollmentFn);
export const getGroupStats = lesan.Fn(getGroupStatsFn);

// Export utility functions
export {
  getGroupDiscountPercentage,
  calculateBulkDiscount
} from "./calculateGroupDiscount/mod.ts";

// Group-related constants
export const GROUP_DISCOUNT_TIERS = {
  TIER1: { min: 3, max: 5, percentage: 10, name: "برنزی" },
  TIER2: { min: 6, max: 10, percentage: 15, name: "نقره‌ای" },
  TIER3: { min: 11, max: 20, percentage: 20, name: "طلایی" },
  TIER4: { min: 21, max: Infinity, percentage: 25, name: "پلاتین" },
};

export const GROUP_TYPES = {
  REGULAR: "Regular",
  CORPORATE: "Corporate",
};

export const GROUP_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
  COMPLETED: "Completed",
};

export const MEMBER_ROLES = {
  MEMBER: "Member",
  CO_LEADER: "CoLeader",
  ADMIN: "Admin",
};

export const MEMBER_STATUS = {
  ACTIVE: "Active",
  PENDING: "Pending",
  REMOVED: "Removed",
  SUSPENDED: "Suspended",
};
