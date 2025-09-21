import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "../../../mod.ts";
import { getCertificateTemplatesFn } from "./getCertificateTemplates.fn.ts";
import { getCertificateTemplatesValidator } from "./getCertificateTemplates.val.ts";

export const getCertificateTemplatesSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "getCertificateTemplates",
    validationRunType: "get",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Admin", "Manager", "Instructor"],
      }),
    ],
    validator: getCertificateTemplatesValidator(),
    fn: getCertificateTemplatesFn,
  });

export const getCertificateTemplates = "getCertificateTemplates";
export { getCertificateTemplatesValidator };
