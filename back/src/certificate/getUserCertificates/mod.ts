import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "../../../mod.ts";
import { getUserCertificatesFn } from "./getUserCertificates.fn.ts";
import { getUserCertificatesValidator } from "./getUserCertificates.val.ts";

export const getUserCertificatesSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "getUserCertificates",
    validationRunType: "get",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["User", "Admin", "Manager", "Instructor"],
      }),
    ],
    validator: getUserCertificatesValidator(),
    fn: getUserCertificatesFn,
  });

export const getUserCertificates = "getUserCertificates";
export { getUserCertificatesValidator };
