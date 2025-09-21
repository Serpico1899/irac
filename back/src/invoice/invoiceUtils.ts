import { ObjectId } from "@deps";
import {
  invoice_status_array,
  invoice_type_array,
  tax_type_array
} from "@models";

// Validation utilities
export const validateInvoiceData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  if (!data.customer?.name) {
    errors.push("Customer name is required");
  }

  if (!data.line_items || !Array.isArray(data.line_items) || data.line_items.length === 0) {
    errors.push("At least one line item is required");
  }

  // Validate line items
  data.line_items?.forEach((item: any, index: number) => {
    if (!item.name) {
      errors.push(`Line item ${index + 1}: Name is required`);
    }
    if (typeof item.unit_price !== 'number' || item.unit_price < 0) {
      errors.push(`Line item ${index + 1}: Valid unit price is required`);
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push(`Line item ${index + 1}: Valid quantity is required`);
    }
  });

  // Validate amounts
  if (typeof data.total_amount !== 'number' || data.total_amount < 0) {
    errors.push("Valid total amount is required");
  }

  // Validate dates
  if (data.due_date && isNaN(new Date(data.due_date).getTime())) {
    errors.push("Invalid due date");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateInvoiceStatus = (status: string): boolean => {
  return invoice_status_array.includes(status);
};

export const validateInvoiceType = (type: string): boolean => {
  return invoice_type_array.includes(type);
};

export const validateTaxType = (taxType: string): boolean => {
  return tax_type_array.includes(taxType);
};

// Business logic utilities
export const calculateInvoiceAge = (issueDate: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - issueDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isInvoiceOverdue = (dueDate?: Date): boolean => {
  if (!dueDate) return false;
  return new Date() > dueDate;
};

export const getDaysUntilDue = (dueDate?: Date): number | null => {
  if (!dueDate) return null;
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculatePaymentProgress = (totalAmount: number, paidAmount: number): {
  percentage: number;
  remaining: number;
  isFullyPaid: boolean;
  isPartiallyPaid: boolean;
} => {
  const percentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  const remaining = Math.max(0, totalAmount - paidAmount);

  return {
    percentage: Math.round(percentage * 100) / 100,
    remaining,
    isFullyPaid: remaining <= 0.01, // Account for floating point precision
    isPartiallyPaid: paidAmount > 0 && remaining > 0.01
  };
};

// Status management utilities
export const determineInvoiceStatus = (
  currentStatus: string,
  totalAmount: number,
  paidAmount: number,
  dueDate?: Date
): string => {
  const { isFullyPaid, isPartiallyPaid } = calculatePaymentProgress(totalAmount, paidAmount);

  if (isFullyPaid) {
    return "paid";
  }

  if (isPartiallyPaid) {
    return "partially_paid";
  }

  if (dueDate && isInvoiceOverdue(dueDate) && currentStatus !== "draft") {
    return "overdue";
  }

  return currentStatus;
};

export const getNextValidStatuses = (currentStatus: string): string[] => {
  const statusTransitions: Record<string, string[]> = {
    draft: ["sent", "cancelled"],
    sent: ["viewed", "paid", "partially_paid", "overdue", "cancelled"],
    viewed: ["paid", "partially_paid", "overdue", "cancelled"],
    paid: ["refunded"],
    partially_paid: ["paid", "overdue", "cancelled"],
    overdue: ["paid", "partially_paid", "cancelled"],
    cancelled: [],
    refunded: []
  };

  return statusTransitions[currentStatus] || [];
};

export const canTransitionToStatus = (currentStatus: string, newStatus: string): boolean => {
  const validTransitions = getNextValidStatuses(currentStatus);
  return validTransitions.includes(newStatus);
};

// Formatting utilities
export const formatInvoiceNumber = (fiscalYear: number, sequence: number, prefix: string = "INV"): string => {
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `${prefix}-${fiscalYear}-${paddedSequence}`;
};

export const parseInvoiceNumber = (invoiceNumber: string): {
  prefix: string;
  fiscalYear: number;
  sequence: number;
} | null => {
  const pattern = /^([A-Z]{2,5})-(\d{4})-(\d{4})$/;
  const match = invoiceNumber.match(pattern);

  if (!match) return null;

  return {
    prefix: match[1],
    fiscalYear: parseInt(match[2], 10),
    sequence: parseInt(match[3], 10)
  };
};

export const formatCurrency = (
  amount: number,
  currency: string = "IRR",
  locale: string = "fa"
): string => {
  try {
    if (locale === "fa") {
      return new Intl.NumberFormat('fa-IR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' ریال';
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  } catch (error) {
    return `${amount} ${currency}`;
  }
};

export const formatDate = (date: Date, locale: string = "fa", options?: Intl.DateTimeFormatOptions): string => {
  try {
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    };

    if (locale === "fa") {
      return new Intl.DateTimeFormat('fa-IR', formatOptions).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
    }
  } catch (error) {
    return date.toLocaleDateString();
  }
};

export const formatNumber = (num: number, locale: string = "fa"): string => {
  try {
    if (locale === "fa") {
      return new Intl.NumberFormat('fa-IR').format(num);
    } else {
      return new Intl.NumberFormat('en-US').format(num);
    }
  } catch (error) {
    return num.toString();
  }
};

// Date utilities for Persian/Iranian context
export const getIranianFiscalYear = (date: Date = new Date()): number => {
  // Iranian fiscal year typically starts March 21 (Persian New Year)
  // For simplicity, using calendar year, but this can be customized
  return date.getFullYear();
};

export const getDefaultDueDate = (issueDate: Date, paymentTermsDays: number = 30): Date => {
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + paymentTermsDays);
  return dueDate;
};

export const isBusinessDay = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  // 0 = Sunday, 6 = Saturday
  // In Iran, Friday is typically a day off, sometimes Thursday too
  return dayOfWeek !== 5; // Friday is day off
};

export const addBusinessDays = (startDate: Date, businessDays: number): Date => {
  let currentDate = new Date(startDate);
  let remainingDays = businessDays;

  while (remainingDays > 0) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (isBusinessDay(currentDate)) {
      remainingDays--;
    }
  }

  return currentDate;
};

// Collection and reminder utilities
export const shouldSendReminder = (
  dueDate: Date,
  lastReminderSent?: Date,
  reminderDaysBefore: number = 3,
  reminderInterval: number = 7
): boolean => {
  const now = new Date();
  const daysUntilDue = getDaysUntilDue(dueDate);

  // Don't send reminders for invoices that are far from due date
  if (daysUntilDue !== null && daysUntilDue > reminderDaysBefore) {
    return false;
  }

  // If never sent a reminder and due date is approaching or passed
  if (!lastReminderSent) {
    return daysUntilDue !== null && daysUntilDue <= reminderDaysBefore;
  }

  // Check if enough time has passed since last reminder
  const daysSinceLastReminder = Math.ceil(
    (now.getTime() - lastReminderSent.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastReminder >= reminderInterval;
};

export const calculateLateFee = (
  balanceAmount: number,
  daysOverdue: number,
  lateFeeRate: number = 0.02, // 2% per month default
  maxLateFee?: number
): number => {
  if (daysOverdue <= 0) return 0;

  const monthsOverdue = daysOverdue / 30;
  let lateFee = balanceAmount * lateFeeRate * monthsOverdue;

  if (maxLateFee && lateFee > maxLateFee) {
    lateFee = maxLateFee;
  }

  return Math.round(lateFee * 100) / 100;
};

// Search and filter utilities
export const createInvoiceSearchFilter = (searchParams: {
  query?: string;
  status?: string;
  customer_name?: string;
  customer_email?: string;
  date_from?: Date;
  date_to?: Date;
  amount_min?: number;
  amount_max?: number;
  overdue_only?: boolean;
  unpaid_only?: boolean;
}): any => {
  const filter: any = {};

  if (searchParams.query) {
    filter.$or = [
      { invoice_number: { $regex: searchParams.query, $options: 'i' } },
      { "customer.name": { $regex: searchParams.query, $options: 'i' } },
      { "customer.email": { $regex: searchParams.query, $options: 'i' } }
    ];
  }

  if (searchParams.status) {
    filter.status = searchParams.status;
  }

  if (searchParams.customer_name) {
    filter["customer.name"] = { $regex: searchParams.customer_name, $options: 'i' };
  }

  if (searchParams.customer_email) {
    filter["customer.email"] = { $regex: searchParams.customer_email, $options: 'i' };
  }

  if (searchParams.date_from || searchParams.date_to) {
    filter.issue_date = {};
    if (searchParams.date_from) {
      filter.issue_date.$gte = searchParams.date_from;
    }
    if (searchParams.date_to) {
      const endDate = new Date(searchParams.date_to);
      endDate.setHours(23, 59, 59, 999);
      filter.issue_date.$lte = endDate;
    }
  }

  if (searchParams.amount_min !== undefined || searchParams.amount_max !== undefined) {
    filter.total_amount = {};
    if (searchParams.amount_min !== undefined) {
      filter.total_amount.$gte = searchParams.amount_min;
    }
    if (searchParams.amount_max !== undefined) {
      filter.total_amount.$lte = searchParams.amount_max;
    }
  }

  if (searchParams.overdue_only) {
    filter.due_date = { $lt: new Date() };
    filter.status = { $in: ["sent", "viewed", "partially_paid"] };
  }

  if (searchParams.unpaid_only) {
    filter.status = { $in: ["sent", "viewed", "partially_paid", "overdue"] };
  }

  return filter;
};

// Error handling utilities
export class InvoiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'InvoiceError';
  }
}

export const createInvoiceError = (code: string, message: string, details?: any): InvoiceError => {
  const errorMap: Record<string, { message: string; statusCode: number }> = {
    INVOICE_NOT_FOUND: { message: "Invoice not found", statusCode: 404 },
    INVALID_STATUS_TRANSITION: { message: "Invalid status transition", statusCode: 400 },
    PAYMENT_EXCEEDS_BALANCE: { message: "Payment amount exceeds balance due", statusCode: 400 },
    INVOICE_ALREADY_PAID: { message: "Invoice is already fully paid", statusCode: 400 },
    INVALID_INVOICE_DATA: { message: "Invalid invoice data", statusCode: 400 },
    DUPLICATE_INVOICE_NUMBER: { message: "Invoice number already exists", statusCode: 409 },
    PDF_GENERATION_FAILED: { message: "Failed to generate PDF", statusCode: 500 },
    EMAIL_SEND_FAILED: { message: "Failed to send email", statusCode: 500 },
  };

  const errorInfo = errorMap[code] || { message, statusCode: 400 };
  return new InvoiceError(message || errorInfo.message, code, errorInfo.statusCode, details);
};

// Audit and logging utilities
export const createInvoiceAuditLog = (
  invoiceId: string,
  action: string,
  userId?: string,
  details?: any
): {
  invoice_id: string;
  action: string;
  user_id?: string;
  timestamp: Date;
  details?: any;
} => {
  return {
    invoice_id: invoiceId,
    action,
    user_id: userId,
    timestamp: new Date(),
    details
  };
};

// Helper function to generate ObjectId
export const generateObjectId = (): string => {
  return new ObjectId().toString();
};

// Helper function to validate ObjectId
export const isValidObjectId = (id: string): boolean => {
  return ObjectId.isValid(id);
};

// Round to specific decimal places (useful for currency calculations)
export const roundToDecimal = (value: number, decimals: number = 2): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return roundToDecimal((value / total) * 100);
};

// Sanitize string for file names
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

// Generate invoice file name
export const generateInvoiceFileName = (invoiceNumber: string, extension: string = 'pdf'): string => {
  const sanitized = sanitizeFileName(invoiceNumber);
  return `invoice_${sanitized}.${extension}`;
};
