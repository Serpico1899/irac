import { coreApp } from "../../mod.ts";
import {
  ActFn,
  ObjectId,
  throwError,
  getUser,
  number,
  object,
  string,
  optional,
  array,
  boolean,
  enums,
  coerce,
  date,
} from "@deps";
import {
  invoice_models,
  invoice_status_enums,
  invoice_type_enums,
  order_models,
  user_models,
} from "@models";
import { generateInvoiceNumber } from "./invoiceNumbering.ts";
import { calculateInvoiceTaxes } from "./invoiceTaxCalculator.ts";
import { sendInvoiceEmail } from "./invoiceEmailService.ts";

// Input validation schemas
const createInvoiceSchema = object({
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
  due_date: optional(coerce(date(), string(), (value) => new Date(value))),
  payment_terms: optional(string()),
  notes: optional(string()),
  locale: optional(string()),
});

const updateInvoiceSchema = object({
  _id: string(),
  status: optional(invoice_status_enums),
  customer: optional(object({
    name: optional(string()),
    company_name: optional(string()),
    email: optional(string()),
    phone: optional(string()),
    national_id: optional(string()),
    address: optional(string()),
    city: optional(string()),
    postal_code: optional(string()),
  })),
  due_date: optional(coerce(date(), string(), (value) => new Date(value))),
  payment_terms: optional(string()),
  notes: optional(string()),
  admin_notes: optional(string()),
});

const addPaymentSchema = object({
  invoice_id: string(),
  amount: number(),
  payment_method: string(),
  transaction_reference: optional(string()),
  payment_date: optional(coerce(date(), string(), (value) => new Date(value))),
  notes: optional(string()),
});

const invoiceQuerySchema = object({
  page: optional(number()),
  limit: optional(number()),
  status: optional(invoice_status_enums),
  customer_email: optional(string()),
  date_from: optional(coerce(date(), string(), (value) => new Date(value))),
  date_to: optional(coerce(date(), string(), (value) => new Date(value))),
  overdue_only: optional(boolean()),
});

// Helper function to get company information
const getCompanyInfo = () => ({
  name: "آکادمی آیراک",
  name_en: "IRAC Academy",
  address: "تهران، ایران",
  city: "تهران",
  country: "Iran",
  email: "info@irac.ir",
  website: "https://irac.ir",
  phone: "+98 21 1234 5678",
  tax_id: "123456789",
});

// Create a new invoice
export const createInvoice: ActFn = async (body) => {
  const {
    order_id,
    customer,
    line_items,
    due_date,
    payment_terms,
    notes,
    locale = "fa"
  } = createInvoiceSchema.parse(body);

  const user = await getUser();
  if (!user) {
    return throwError("کاربر وارد نشده است");
  }

  try {
    // Generate sequential invoice number
    const invoiceNumber = await generateInvoiceNumber();
    const currentYear = new Date().getFullYear();

    // Calculate totals and taxes
    const processedItems = [];
    let subtotal = 0;

    for (const item of line_items) {
      const itemTotal = item.unit_price * item.quantity;
      const discountAmount = item.discount_amount ||
        (item.discount_percentage ? (itemTotal * item.discount_percentage / 100) : 0);
      const discountedTotal = itemTotal - discountAmount;

      // Calculate Iranian VAT (9%)
      const taxRate = 9;
      const taxAmount = discountedTotal * (taxRate / 100);
      const lineTotal = discountedTotal + taxAmount;

      processedItems.push({
        ...item,
        discount_amount: discountAmount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        line_total: lineTotal,
      });

      subtotal += itemTotal;
    }

    // Calculate total taxes and discounts
    const totalDiscount = processedItems.reduce((sum, item) => sum + item.discount_amount, 0);
    const totalTax = processedItems.reduce((sum, item) => sum + item.tax_amount, 0);
    const totalAmount = processedItems.reduce((sum, item) => sum + item.line_total, 0);

    // Prepare tax breakdown
    const taxes = totalTax > 0 ? [{
      tax_id: new ObjectId().toString(),
      name: "مالیات بر ارزش افزوده",
      name_en: "Value Added Tax",
      rate: 9,
      amount: totalTax,
      tax_type: "vat",
      is_inclusive: false,
    }] : [];

    // Create invoice data
    const invoiceData = {
      invoice_number: invoiceNumber.number,
      invoice_id: new ObjectId().toString(),
      issue_date: new Date(),
      due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      company: getCompanyInfo(),
      customer: {
        ...customer,
        country: customer.country || "Iran",
      },
      line_items: processedItems,
      subtotal,
      total_discount: totalDiscount,
      total_tax: totalTax,
      total_amount: totalAmount,
      balance_due: totalAmount,
      currency: "IRR",
      taxes,
      discounts: [],
      payments: [],
      locale,
      fiscal_year: currentYear,
      sequence_number: invoiceNumber.sequence,
      payment_terms: payment_terms || "30 روز پس از صدور فاکتور",
      notes,
    };

    // Create invoice
    const invoice = await invoice_models().create({
      doc: invoiceData,
      relations: {
        user: { _id: new ObjectId(user._id) },
        ...(order_id && { order: { _id: new ObjectId(order_id) } }),
      },
    });

    return {
      success: true,
      invoice: {
        ...invoice.doc,
        _id: invoice.doc._id.toString(),
      },
    };
  } catch (error) {
    console.error("خطا در ایجاد فاکتور:", error);
    return throwError("خطا در ایجاد فاکتور");
  }
};

// Get invoice by ID
export const getInvoice: ActFn = async (body) => {
  const { _id } = object({ _id: string() }).parse(body);

  try {
    const invoice = await invoice_models().findOne({
      filter: { _id: new ObjectId(_id) },
      relations: {
        user: { name: 1, email: 1 },
        order: { order_number: 1, status: 1 },
      },
    });

    if (!invoice) {
      return throwError("فاکتور یافت نشد");
    }

    return {
      success: true,
      invoice: {
        ...invoice.doc,
        _id: invoice.doc._id.toString(),
        user: invoice.relations?.user || null,
        order: invoice.relations?.order || null,
      },
    };
  } catch (error) {
    console.error("خطا در دریافت فاکتور:", error);
    return throwError("خطا در دریافت فاکتور");
  }
};

// Get invoices list with pagination and filters
export const getInvoices: ActFn = async (body) => {
  const {
    page = 1,
    limit = 20,
    status,
    customer_email,
    date_from,
    date_to,
    overdue_only = false,
  } = invoiceQuerySchema.parse(body);

  const user = await getUser();
  if (!user) {
    return throwError("کاربر وارد نشده است");
  }

  try {
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (customer_email) {
      filter["customer.email"] = { $regex: customer_email, $options: "i" };
    }

    if (date_from || date_to) {
      filter.issue_date = {};
      if (date_from) filter.issue_date.$gte = date_from;
      if (date_to) filter.issue_date.$lte = date_to;
    }

    if (overdue_only) {
      filter.due_date = { $lt: new Date() };
      filter.status = { $in: ["sent", "viewed", "partially_paid"] };
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      invoice_models().find({
        filter,
        sort: { created_at: -1 },
        limit,
        skip,
        relations: {
          user: { name: 1, email: 1 },
          order: { order_number: 1 },
        },
      }),
      invoice_models().countDocuments({ filter }),
    ]);

    return {
      success: true,
      invoices: invoices.map(invoice => ({
        ...invoice.doc,
        _id: invoice.doc._id.toString(),
        user: invoice.relations?.user || null,
        order: invoice.relations?.order || null,
      })),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        per_page: limit,
      },
    };
  } catch (error) {
    console.error("خطا در دریافت لیست فاکتورها:", error);
    return throwError("خطا در دریافت لیست فاکتورها");
  }
};

// Update invoice
export const updateInvoice: ActFn = async (body) => {
  const updateData = updateInvoiceSchema.parse(body);
  const { _id, ...updates } = updateData;

  const user = await getUser();
  if (!user) {
    return throwError("کاربر وارد نشده است");
  }

  try {
    const invoice = await invoice_models().findOneAndUpdate({
      filter: { _id: new ObjectId(_id) },
      update: {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      },
    });

    if (!invoice) {
      return throwError("فاکتور یافت نشد");
    }

    return {
      success: true,
      invoice: {
        ...invoice.doc,
        _id: invoice.doc._id.toString(),
      },
    };
  } catch (error) {
    console.error("خطا در بروزرسانی فاکتور:", error);
    return throwError("خطا در بروزرسانی فاکتور");
  }
};

// Add payment to invoice
export const addInvoicePayment: ActFn = async (body) => {
  const {
    invoice_id,
    amount,
    payment_method,
    transaction_reference,
    payment_date = new Date(),
    notes,
  } = addPaymentSchema.parse(body);

  const user = await getUser();
  if (!user) {
    return throwError("کاربر وارد نشده است");
  }

  try {
    const invoice = await invoice_models().findOne({
      filter: { _id: new ObjectId(invoice_id) },
    });

    if (!invoice) {
      return throwError("فاکتور یافت نشد");
    }

    const payment = {
      payment_id: new ObjectId().toString(),
      payment_date,
      amount,
      payment_method,
      transaction_reference,
      notes,
    };

    const newPaidAmount = invoice.doc.paid_amount + amount;
    const newBalanceDue = invoice.doc.total_amount - newPaidAmount;

    let newStatus = invoice.doc.status;
    if (newBalanceDue <= 0) {
      newStatus = "paid";
    } else if (newPaidAmount > 0) {
      newStatus = "partially_paid";
    }

    const updatedInvoice = await invoice_models().findOneAndUpdate({
      filter: { _id: new ObjectId(invoice_id) },
      update: {
        $push: { payments: payment },
        $set: {
          paid_amount: newPaidAmount,
          balance_due: Math.max(0, newBalanceDue),
          status: newStatus,
          payment_date: newBalanceDue <= 0 ? new Date() : invoice.doc.payment_date,
          updated_at: new Date(),
        },
      },
    });

    return {
      success: true,
      invoice: {
        ...updatedInvoice.doc,
        _id: updatedInvoice.doc._id.toString(),
      },
      payment,
    };
  } catch (error) {
    console.error("خطا در ثبت پرداخت:", error);
    return throwError("خطا در ثبت پرداخت");
  }
};

// Generate invoice from order
export const generateInvoiceFromOrder: ActFn = async (body) => {
  const { order_id } = object({ order_id: string() }).parse(body);

  const user = await getUser();
  if (!user) {
    return throwError("کاربر وارد نشده است");
  }

  try {
    const order = await order_models().findOne({
      filter: { _id: new ObjectId(order_id) },
      relations: {
        user: { name: 1, email: 1, phone: 1 },
      },
    });

    if (!order) {
      return throwError("سفارش یافت نشد");
    }

    // Check if invoice already exists for this order
    const existingInvoice = await invoice_models().findOne({
      filter: {},
      relations: {
        order: { _id: new ObjectId(order_id) },
      },
    });

    if (existingInvoice) {
      return throwError("فاکتور برای این سفارش قبلاً ایجاد شده است");
    }

    // Convert order items to invoice line items
    const lineItems = order.doc.items.map((item: any) => ({
      item_id: item.item_id,
      item_type: item.item_type,
      name: item.name,
      name_en: item.name_en,
      description: `${item.item_type} - ${item.name}`,
      unit_price: item.price,
      quantity: item.quantity,
      discount_amount: item.discounted_price ? (item.price - item.discounted_price) * item.quantity : 0,
    }));

    // Create invoice data
    const invoiceData = {
      order_id: order_id,
      customer: {
        name: order.doc.customer_name,
        email: order.doc.customer_email,
        phone: order.doc.customer_phone,
        address: order.doc.billing_address,
        city: order.doc.billing_city,
        postal_code: order.doc.billing_postal_code,
      },
      line_items: lineItems,
      payment_terms: "طبق شرایط سفارش",
      notes: `فاکتور مربوط به سفارش شماره: ${order.doc.order_number}`,
      locale: "fa",
    };

    return await createInvoice(invoiceData);
  } catch (error) {
    console.error("خطا در تولید فاکتور از سفارش:", error);
    return throwError("خطا در تولید فاکتور از سفارش");
  }
};

// Mark invoice as sent
export const markInvoiceAsSent: ActFn = async (body) => {
  const { _id } = object({ _id: string() }).parse(body);

  try {
    const invoice = await invoice_models().findOneAndUpdate({
      filter: { _id: new ObjectId(_id) },
      update: {
        $set: {
          status: "sent",
          email_sent: true,
          email_sent_at: new Date(),
          updated_at: new Date(),
        },
      },
    });

    if (!invoice) {
      return throwError("فاکتور یافت نشد");
    }

    // Send email if customer has email
    if (invoice.doc.customer.email) {
      try {
        await sendInvoiceEmail(invoice.doc);
      } catch (emailError) {
        console.error("خطا در ارسال ایمیل:", emailError);
        // Don't fail the whole operation if email fails
      }
    }

    return {
      success: true,
      message: "فاکتور با موفقیت ارسال شد",
    };
  } catch (error) {
    console.error("خطا در ارسال فاکتور:", error);
    return throwError("خطا در ارسال فاکتور");
  }
};

// Get invoice statistics
export const getInvoiceStats: ActFn = async () => {
  const user = await getUser();
  if (!user) {
    return throwError("کاربر وارد نشده است");
  }

  try {
    const [
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      draftInvoices,
      totalRevenue,
      pendingRevenue,
    ] = await Promise.all([
      invoice_models().countDocuments({}),
      invoice_models().countDocuments({ filter: { status: "paid" } }),
      invoice_models().countDocuments({
        filter: {
          due_date: { $lt: new Date() },
          status: { $in: ["sent", "viewed", "partially_paid"] },
        },
      }),
      invoice_models().countDocuments({ filter: { status: "draft" } }),
      invoice_models().aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } },
      ]),
      invoice_models().aggregate([
        { $match: { status: { $in: ["sent", "viewed", "partially_paid"] } } },
        { $group: { _id: null, total: { $sum: "$balance_due" } } },
      ]),
    ]);

    return {
      success: true,
      stats: {
        total_invoices: totalInvoices,
        paid_invoices: paidInvoices,
        overdue_invoices: overdueInvoices,
        draft_invoices: draftInvoices,
        total_revenue: totalRevenue[0]?.total || 0,
        pending_revenue: pendingRevenue[0]?.total || 0,
        payment_rate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
      },
    };
  } catch (error) {
    console.error("خطا در دریافت آمار فاکتورها:", error);
    return throwError("خطا در دریافت آمار فاکتورها");
  }
};
