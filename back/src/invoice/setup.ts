import { coreApp } from "../../mod.ts";
import {
  createInvoice,
  getInvoice,
  getInvoices,
  updateInvoice,
  addInvoicePayment,
  generateInvoiceFromOrder,
  markInvoiceAsSent,
  getInvoiceStats,
} from "./invoiceService.ts";

export const invoiceSetup = () => {
  // Create a new invoice
  coreApp.act({
    schema: "invoice",
    fn: createInvoice,
    validator: "create",
  });

  // Get invoice by ID
  coreApp.act({
    schema: "invoice",
    fn: getInvoice,
    validator: "get",
  });

  // Get invoices list with pagination and filters
  coreApp.act({
    schema: "invoice",
    fn: getInvoices,
    validator: "getList",
  });

  // Update invoice
  coreApp.act({
    schema: "invoice",
    fn: updateInvoice,
    validator: "update",
  });

  // Add payment to invoice
  coreApp.act({
    schema: "invoice",
    fn: addInvoicePayment,
    validator: "addPayment",
  });

  // Generate invoice from order
  coreApp.act({
    schema: "invoice",
    fn: generateInvoiceFromOrder,
    validator: "generateFromOrder",
  });

  // Mark invoice as sent (and send email)
  coreApp.act({
    schema: "invoice",
    fn: markInvoiceAsSent,
    validator: "markAsSent",
  });

  // Get invoice statistics
  coreApp.act({
    schema: "invoice",
    fn: getInvoiceStats,
    validator: "getStats",
  });
};
