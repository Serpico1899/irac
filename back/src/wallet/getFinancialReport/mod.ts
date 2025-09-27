import {  coreApp  } from "@app";
import { getFinancialReportFn } from "./getFinancialReport.fn.ts";
import { getFinancialReportValidator } from "./getFinancialReport.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getFinancialReportSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "getFinancialReport",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: getFinancialReportValidator(),
    fn: getFinancialReportFn,
  });
