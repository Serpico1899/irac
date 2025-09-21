import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "../../../mod.ts";
import { revokeCertificateFn } from "./revokeCertificate.fn.ts";
import { revokeCertificateValidator } from "./revokeCertificate.val.ts";

export const revokeCertificateSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "revokeCertificate",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Admin", "Manager"],
      }),
    ],
    validator: revokeCertificateValidator(),
    fn: revokeCertificateFn,
  });

export const revokeCertificate = "revokeCertificate";
export { revokeCertificateValidator };
