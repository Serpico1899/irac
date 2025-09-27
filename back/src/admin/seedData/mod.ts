import {  coreApp  } from "@app";
import { seedDataValidator } from "./seedData.val.ts";
import { seedDataFn } from "./seedData.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const seedDataSetup = () =>
  coreApp.acts.setAct({
    schema: "admin",
    actName: "seedData",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: seedDataValidator(),
    fn: seedDataFn,
  });
