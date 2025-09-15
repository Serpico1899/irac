import { setAct } from "../../../mod.ts";
import { validateAccessValidator } from "./validateAccess.val.ts";
import { validateAccessFn } from "./validateAccess.fn.ts";

export const validateAccessSetup = () => {
  setAct({
    schema: {
      details: validateAccessValidator.schema.details,
    },
    validator: validateAccessValidator,
    fn: validateAccessFn,
  });
};
