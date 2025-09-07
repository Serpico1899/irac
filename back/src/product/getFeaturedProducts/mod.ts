import { coreApp } from "../../../mod.ts";
import { getFeaturedProductsValidator } from "./getFeaturedProducts.val.ts";
import { getFeaturedProductsFn } from "./getFeaturedProducts.fn.ts";

export const getFeaturedProductsSetup = () =>
  coreApp.acts.setAct({
    schema: "product",
    actName: "getFeaturedProducts",
    validator: getFeaturedProductsValidator(),
    fn: getFeaturedProductsFn,
  });
