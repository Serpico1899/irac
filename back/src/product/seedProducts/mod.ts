import { coreApp } from "../../../mod.ts";
import { seedProductsValidator } from "./seedProducts.val.ts";
import { seedProductsFn } from "./seedProducts.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const seedProductsSetup = () =>
  coreApp.acts.setAct({
    schema: "product",
    actName: "seedProducts",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"], // Only managers can seed products
      }),
    ],
    validator: seedProductsValidator(),
    fn: seedProductsFn,
  });
