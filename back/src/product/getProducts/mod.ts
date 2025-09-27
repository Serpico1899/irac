import {  coreApp  } from "@app";
import { getProductsValidator } from "./getProducts.val.ts";
import { getProductsFn } from "./getProducts.fn.ts";

export const getProductsSetup = () =>
  coreApp.acts.setAct({
    schema: "product",
    actName: "getProducts",
    validator: getProductsValidator(),
    fn: getProductsFn,
  });
