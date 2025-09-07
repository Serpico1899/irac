import { coreApp } from "../../../mod.ts";
import { purchaseProductValidator } from "./purchaseProduct.val.ts";
import { purchaseProductFn } from "./purchaseProduct.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const purchaseProductSetup = () =>
  coreApp.acts.setAct({
    schema: "product",
    actName: "purchaseProduct",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: purchaseProductValidator(),
    fn: purchaseProductFn,
  });
