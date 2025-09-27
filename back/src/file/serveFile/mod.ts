import {  coreApp  } from "@app";
import { setTokens, setUser } from "@lib";
import { serveFileFn } from "./serveFile.fn.ts";
import { serveFileValidator } from "./serveFile.val.ts";

export const serveFileSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "serveFile",
    validationRunType: "get",
    validator: serveFileValidator(),
    preAct: [
      setTokens,
      setUser,
    ],
    fn: serveFileFn,
  });
