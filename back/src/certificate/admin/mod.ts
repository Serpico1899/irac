import { coreApp } from "../../../mod.ts";
import {
  getAdminCertificatesAct,
  getCertificateStatsAct,
  bulkCertificateOperationsAct,
  processPendingCertificatesAct,
  exportCertificatesAct,
  updateCertificateConfigAct,
  getCertificateAuditLogAct
} from "./manageCertificates.ts";
import {
  getAdminCertificatesValidator,
  getCertificateStatsValidator,
  bulkCertificateOperationsValidator,
  processPendingCertificatesValidator,
  exportCertificatesValidator,
  updateCertificateConfigValidator,
  getCertificateAuditLogValidator
} from "./manageCertificates.val.ts";

// Admin Certificate Management Functions
export const getAdminCertificatesSetup = () => {
  return coreApp.acts.setAct({
    schema: "getAdminCertificates",
    actName: "getAdminCertificates",
    validator: getAdminCertificatesValidator(),
    fn: getAdminCertificatesAct,
  });
};

export const getCertificateStatsSetup = () => {
  return coreApp.acts.setAct({
    schema: "getCertificateStats",
    actName: "getCertificateStats",
    validator: getCertificateStatsValidator(),
    fn: getCertificateStatsAct,
  });
};

export const bulkCertificateOperationsSetup = () => {
  return coreApp.acts.setAct({
    schema: "bulkCertificateOperations",
    actName: "bulkCertificateOperations",
    validator: bulkCertificateOperationsValidator(),
    fn: bulkCertificateOperationsAct,
  });
};

export const processPendingCertificatesSetup = () => {
  return coreApp.acts.setAct({
    schema: "processPendingCertificates",
    actName: "processPendingCertificates",
    validator: processPendingCertificatesValidator(),
    fn: processPendingCertificatesAct,
  });
};

export const exportCertificatesSetup = () => {
  return coreApp.acts.setAct({
    schema: "exportCertificates",
    actName: "exportCertificates",
    validator: exportCertificatesValidator(),
    fn: exportCertificatesAct,
  });
};

export const updateCertificateConfigSetup = () => {
  return coreApp.acts.setAct({
    schema: "updateCertificateConfig",
    actName: "updateCertificateConfig",
    validator: updateCertificateConfigValidator(),
    fn: updateCertificateConfigAct,
  });
};

export const getCertificateAuditLogSetup = () => {
  return coreApp.acts.setAct({
    schema: "getCertificateAuditLog",
    actName: "getCertificateAuditLog",
    validator: getCertificateAuditLogValidator(),
    fn: getCertificateAuditLogAct,
  });
};

// Main admin setup function
export const certificateAdminSetup = () => {
  getAdminCertificatesSetup();
  getCertificateStatsSetup();
  bulkCertificateOperationsSetup();
  processPendingCertificatesSetup();
  exportCertificatesSetup();
  updateCertificateConfigSetup();
  getCertificateAuditLogSetup();
};
