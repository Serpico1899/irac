import { lesan } from "@deps";
import createGroupFn from "./createGroup/mod.ts";
import addGroupMemberFn from "./addGroupMember/mod.ts";
import calculateGroupDiscountFn from "./calculateGroupDiscount/mod.ts";
import processGroupEnrollmentFn from "./processGroupEnrollment/mod.ts";
import getGroupStatsFn from "./getGroupStats/mod.ts";

export const groupSetup = () => {
  // Group Management
  lesan.addAct({
    schema: "group",
    actName: "createGroup",
    fn: createGroupFn,
  });

  lesan.addAct({
    schema: "group",
    actName: "addGroupMember",
    fn: addGroupMemberFn,
  });

  lesan.addAct({
    schema: "group",
    actName: "calculateGroupDiscount",
    fn: calculateGroupDiscountFn,
  });

  lesan.addAct({
    schema: "group",
    actName: "processGroupEnrollment",
    fn: processGroupEnrollmentFn,
  });

  lesan.addAct({
    schema: "group",
    actName: "getGroupStats",
    fn: getGroupStatsFn,
  });

  return "Group Functions Loaded";
};
