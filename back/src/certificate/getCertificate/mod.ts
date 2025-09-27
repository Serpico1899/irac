import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser } from "@lib";
import {  coreApp  } from "@app";
import { getCertificateFn } from "./getCertificate.fn.ts";
import { getCertificateValidator } from "./getCertificate.val.ts";

export const getCertificateSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "getCertificate",
    validationRunType: "get",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["User", "Admin", "Manager", "Instructor"],
      }),
    ],
    validator: getCertificateValidator(),
    fn: getCertificateFn,
  });

export const getCertificate = "getCertificate";
export { getCertificateValidator };
