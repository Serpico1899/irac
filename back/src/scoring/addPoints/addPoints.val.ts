import {
  number,
  object,
  optional,
  string,
  record,
  enums,
} from "@deps";
import { scoring_action_enums } from "@model";

export const addPointsValidator = () => {
  return {
    set: object({
      action: scoring_action_enums,
      points: number(),
      description: string(),
      metadata: optional(record(string(), string())),
      reference_id: optional(string()),
      reference_type: optional(enums(["order", "course", "referral", "booking", "review", "other"])),
      order_id: optional(string()),
      course_id: optional(string()),
    }),
    get: object({}),
  };
};
