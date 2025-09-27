import {  coreApp  } from "@app";
import { verifyCertificateFn } from "./verifyCertificate.fn.ts";
import { verifyCertificateValidator } from "./verifyCertificate.val.ts";

export const verifyCertificateSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "verifyCertificate",
    validationRunType: "get",
    preAct: [],
    validator: verifyCertificateValidator(),
    fn: verifyCertificateFn,
  });

export const verifyCertificate = "verifyCertificate";
export { verifyCertificateValidator };
