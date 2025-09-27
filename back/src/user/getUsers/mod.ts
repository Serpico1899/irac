import { grantAccess, setTokens, setUser } from "@lib";
import {  coreApp  } from "@app";
import { getUsersFn } from "./getUsers.fn.ts";
import { getUsersValidator } from "./getUsers.val.ts";

export const getUsersSetup = () =>
  coreApp.acts.setAct({
    schema: "user",
    fn: getUsersFn,
    actName: "getUsers",
    preValidation: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor"],
      }),
    ],
    validator: getUsersValidator(),
  });
