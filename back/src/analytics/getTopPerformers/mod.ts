import { setAct } from "../../../mod.ts";
import { getTopPerformersValidator } from "./getTopPerformers.val.ts";
import { getTopPerformersFn } from "./getTopPerformers.fn.ts";

export const getTopPerformersSetup = () => {
  setAct({
    schema: {
      details: getTopPerformersValidator.schema.details,
    },
    validator: getTopPerformersValidator,
    fn: getTopPerformersFn,
  });
};
