import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "../../../mod.ts";
import { generateCertificateFn } from "./generateCertificate.fn.ts";
import { generateCertificateValidator } from "./generateCertificate.val.ts";

export const generateCertificateSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "generateCertificate",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Admin", "Manager", "Instructor"],
      }),
    ],
    validator: generateCertificateValidator(),
    fn: generateCertificateFn,
  });

export const generateCertificate = "generateCertificate";
export { generateCertificateValidator };
