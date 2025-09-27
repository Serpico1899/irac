import { coreApp } from "@app";
import { string, object, array, number, optional, boolean, enums } from "@deps";
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

// Validators
const createInvoiceValidator = {
  set: {
    order_id: optional(string()),
    customer: object({
      name: string(),
      company_name: optional(string()),
      email: optional(string()),
      phone: optional(string()),
      national_id: optional(string()),
      address: optional(string()),
      city: optional(string()),
      postal_code: optional(string()),
    }),
    line_items: array(object({
      item_id: string(),
      item_type: enums(["course", "workshop", "product", "service"]),
      name: string(),
      name_en: optional(string()),
      description: optional(string()),
      unit_price: number(),
      quantity: number(),
      discount_amount: optional(number()),
      discount_percentage: optional(number()),
    })),
    subtotal: number(),
    tax_amount: optional(number()),
    discount_amount: optional(number()),
    total_amount: number(),
    currency: optional(enums(["IRR", "USD", "EUR"])),
    due_date: optional(string()),
    notes: optional(string()),
  },
  get: object({
    success: boolean(),
    message: string(),
    invoice: object({
      _id: string(),
      invoice_number: string(),
      customer: object({}),
      line_items: array(object({})),
      subtotal: number(),
      total_amount: number(),
      status: string(),
      created_at: string(),
    }),
  }),
};

const getInvoiceValidator = {
  set: {
    invoice_id: string(),
  },
  get: object({
    success: boolean(),
    invoice: object({
      _id: string(),
      invoice_number: string(),
      customer: object({}),
      line_items: array(object({})),
      subtotal: number(),
      total_amount: number(),
      status: string(),
      created_at: string(),
      updated_at: string(),
    }),
  }),
};

const getInvoicesValidator = {
  set: {
    customer_id: optional(string()),
    status: optional(enums(["Draft", "Sent", "Paid", "Overdue", "Cancelled"])),
    page: optional(number()),
    limit: optional(number()),
    date_from: optional(string()),
    date_to: optional(string()),
  },
  get: object({
    success: boolean(),
    invoices: array(object({
      _id: string(),
      invoice_number: string(),
      customer: object({}),
      total_amount: number(),
      status: string(),
      created_at: string(),
    })),
    pagination: object({
      current_page: number(),
      total_pages: number(),
      total_items: number(),
    }),
  }),
};

const updateInvoiceValidator = {
  set: {
    invoice_id: string(),
    line_items: optional(array(object({
      item_id: string(),
      item_type: enums(["course", "workshop", "product", "service"]),
      name: string(),
      description: optional(string()),
      unit_price: number(),
      quantity: number(),
      discount_amount: optional(number()),
    }))),
    subtotal: optional(number()),
    tax_amount: optional(number()),
    discount_amount: optional(number()),
    total_amount: optional(number()),
    status: optional(enums(["Draft", "Sent", "Paid", "Overdue", "Cancelled"])),
    due_date: optional(string()),
    notes: optional(string()),
  },
  get: object({
    success: boolean(),
    message: string(),
    invoice: object({
      _id: string(),
      invoice_number: string(),
      total_amount: number(),
      status: string(),
      updated_at: string(),
    }),
  }),
};

const addInvoicePaymentValidator = {
  set: {
    invoice_id: string(),
    amount: number(),
    payment_method: string(),
    transaction_id: optional(string()),
    notes: optional(string()),
  },
  get: object({
    success: boolean(),
    message: string(),
    payment: object({
      _id: string(),
      amount: number(),
      payment_date: string(),
      payment_method: string(),
    }),
  }),
};

const generateInvoiceFromOrderValidator = {
  set: {
    order_id: string(),
    include_shipping: optional(boolean()),
    apply_discounts: optional(boolean()),
    notes: optional(string()),
  },
  get: object({
    success: boolean(),
    message: string(),
    invoice: object({
      _id: string(),
      invoice_number: string(),
      order: object({}),
      total_amount: number(),
      status: string(),
      created_at: string(),
    }),
  }),
};

const markInvoiceAsSentValidator = {
  set: {
    invoice_id: string(),
    sent_date: optional(string()),
    sent_method: optional(enums(["Email", "SMS", "Manual"])),
    recipient_email: optional(string()),
    notes: optional(string()),
  },
  get: object({
    success: boolean(),
    message: string(),
    invoice: object({
      _id: string(),
      invoice_number: string(),
      status: string(),
      sent_date: string(),
    }),
  }),
};

const getInvoiceStatsValidator = {
  set: {
    period: optional(enums(["daily", "weekly", "monthly", "yearly"])),
    date_from: optional(string()),
    date_to: optional(string()),
    customer_id: optional(string()),
  },
  get: object({
    success: boolean(),
    stats: object({
      total_invoices: number(),
      paid_invoices: number(),
      pending_invoices: number(),
      overdue_invoices: number(),
      total_revenue: number(),
      average_invoice_amount: number(),
      payment_rate: number(),
    }),
  }),
};

export const invoiceSetup = () => {
  // Create a new invoice
  coreApp.acts.setAct({
    schema: "invoice",
    actName: "createInvoice",
    validator: createInvoiceValidator,
    fn: createInvoice,
  });

  // Get invoice by ID
  coreApp.acts.setAct({
    schema: "invoice",
    actName: "getInvoice",
    validator: getInvoiceValidator,
    fn: getInvoice,
  });

  // Get invoices with filters
  coreApp.acts.setAct({
    schema: "invoice",
    actName: "getInvoices",
    validator: getInvoicesValidator,
    fn: getInvoices,
  });

  // Update invoice
  coreApp.acts.setAct({
    schema: "invoice",
    actName: "updateInvoice",
    validator: updateInvoiceValidator,
    fn: updateInvoice,
  });

  // Add payment to invoice
  coreApp.acts.setAct({
    schema: "invoice",
    actName: "addInvoicePayment",
    validator: addInvoicePaymentValidator,
    fn: addInvoicePayment,
  });

  // Generate invoice from order
  coreApp.acts.setAct({
    schema: "invoice",
    actName: "generateInvoiceFromOrder",
    validator: generateInvoiceFromOrderValidator,
    fn: generateInvoiceFromOrder,
  });

  // Mark invoice as sent
  coreApp.acts.setAct({
    schema: "invoice",
    actName: "markInvoiceAsSent",
    validator: markInvoiceAsSentValidator,
    fn: markInvoiceAsSent,
  });

  // Get invoice statistics
  coreApp.acts.setAct({
    schema: "invoice",
    actName: "getInvoiceStats",
    validator: getInvoiceStatsValidator,
    fn: getInvoiceStats,
  });

  return "Invoice Functions Loaded";
};
