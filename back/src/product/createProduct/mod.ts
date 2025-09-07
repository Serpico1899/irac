import { coreApp } from "../../../mod.ts";
import { createProductValidator } from "./createProduct.val.ts";
import { createProductFn } from "./createProduct.fn.ts";

export const createProductSetup = () =>
  coreApp.acts.setAct({
    schema: "product",
    actName: "createProduct",
    validator: createProductValidator(),
    fn: createProductFn,
  });
