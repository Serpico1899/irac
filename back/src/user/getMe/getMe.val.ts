import { object } from "@deps";
import {  selectStruct  } from "@app";

export const getMeValidator = () => {
  return object({
    set: object({}),
    get: selectStruct("user", 2),
  });
};
