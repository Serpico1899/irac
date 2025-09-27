import {  coreApp  } from "@app";
import { changeMobileFn } from "./changeMobile.fn.ts";
import { changeMobileValidator } from "./changeMobile.val.ts";

export const changeMobileSetup = () =>
  coreApp.acts.setAct({
    schema: "user",
    actName: "changeMobile",
    fn: changeMobileFn,
    validator: changeMobileValidator(),
  });
