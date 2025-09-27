export { groupSetup } from "./setup.ts";

// Re-export handlers for direct use if needed
export { default as createGroupHandler } from "./createGroup/mod.ts";
export { default as addGroupMemberHandler } from "./addGroupMember/mod.ts";
export { default as calculateGroupDiscountHandler } from "./calculateGroupDiscount/mod.ts";
export { default as processGroupEnrollmentHandler } from "./processGroupEnrollment/mod.ts";
export { default as getGroupStatsHandler } from "./getGroupStats/mod.ts";

// Re-export types
export type { CreateGroupInput, CreateGroupOutput } from "./createGroup/mod.ts";
export type { AddGroupMemberInput, AddGroupMemberOutput } from "./addGroupMember/mod.ts";
export type { CalculateGroupDiscountInput, CalculateGroupDiscountOutput } from "./calculateGroupDiscount/mod.ts";
export type { ProcessGroupEnrollmentInput, ProcessGroupEnrollmentOutput } from "./processGroupEnrollment/mod.ts";
export type { GetGroupStatsInput, GetGroupStatsOutput } from "./getGroupStats/mod.ts";
