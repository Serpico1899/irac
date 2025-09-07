import { coreApp } from "../../../mod.ts";
import { getProductValidator } from "./getProduct.val.ts";
import { getProductFn } from "./getProduct.fn.ts";

export const getProductSetup = () =>
  coreApp.acts.setAct({
    schema: "product",
    actName: "getProduct",
    validator: getProductValidator(),
    fn: getProductFn,
  });
