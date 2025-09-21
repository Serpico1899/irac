import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "../../../mod.ts";
import { downloadCertificateFn } from "./downloadCertificate.fn.ts";
import { downloadCertificateValidator } from "./downloadCertificate.val.ts";

export const downloadCertificateSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "downloadCertificate",
    validationRunType: "get",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["User", "Admin", "Manager", "Instructor"],
      }),
    ],
    validator: downloadCertificateValidator(),
    fn: downloadCertificateFn,
  });

export const downloadCertificate = "downloadCertificate";
export { downloadCertificateValidator };
