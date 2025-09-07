import { coreApp } from "../../../mod.ts";
import { updateProductValidator } from "./updateProduct.val.ts";
import { updateProductFn } from "./updateProduct.fn.ts";

export const updateProductSetup = () =>
  coreApp.acts.setAct({
    schema: "product",
    actName: "updateProduct",
    validator: updateProductValidator(),
    fn: updateProductFn,
  });
