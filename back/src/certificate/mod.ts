import { generateCertificateSetup } from "./generateCertificate/mod.ts";
import { getCertificateSetup } from "./getCertificate/mod.ts";
import { getUserCertificatesSetup } from "./getUserCertificates/mod.ts";
import { verifyCertificateSetup } from "./verifyCertificate/mod.ts";
import { revokeCertificateSetup } from "./revokeCertificate/mod.ts";
import { downloadCertificateSetup } from "./downloadCertificate/mod.ts";
import { getCertificateTemplatesSetup } from "./getCertificateTemplates/mod.ts";
import { certificateAdminSetup } from "./admin/mod.ts";

export const certificateSetup = () => {
  // Certificate Generation API
  generateCertificateSetup();

  // Get Certificate API
  getCertificateSetup();

  // Get User Certificates API
  getUserCertificatesSetup();

  // Verify Certificate API (Public)
  verifyCertificateSetup();

  // Revoke Certificate API
  revokeCertificateSetup();

  // Download Certificate API
  downloadCertificateSetup();

  // Get Certificate Templates API
  getCertificateTemplatesSetup();

  // Certificate Admin Management APIs
  certificateAdminSetup();
};

export {
  generateCertificateSetup,
  getCertificateSetup,
  getUserCertificatesSetup,
  verifyCertificateSetup,
  revokeCertificateSetup,
  downloadCertificateSetup,
  getCertificateTemplatesSetup,
  certificateAdminSetup,
};
