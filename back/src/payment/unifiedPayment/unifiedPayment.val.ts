import { object, string, number, enums, optional, array, boolean, defaulted } from "https://deno.land/x/lesan@v0.1.8/mod.ts";

// Payment gateway types
export const paymentGatewayTypeValidator = enums([
  "zarinpal",
  "mellat_bank",
  "saman_bank",
  "wallet",
  "bank_transfer",
  "crypto"
] as const);

// Payment purposes
export const paymentPurposeValidator = enums([
  "wallet_charge",
  "course_purchase",
  "workshop_booking",
  "product_purchase",
  "space_booking",
  "subscription",
  "service_fee",
  "penalty",
  "refund",
  "bonus",
  "other"
] as const);

// Currency types
export const currencyValidator = enums([
  "IRR",
  "USD",
  "EUR"
] as const);

// Get Available Gateways Validation
export const getAvailableGatewaysValidator = {
  set: object({
    amount: defaulted(number(), 0),
  }),
  get: object({
    success: number(),
    gateways: number(),
    message: number(),
    error: number(),
  }),
};

// Create Unified Payment Validation
export const createUnifiedPaymentValidator = {
  set: object({
    // Required fields
    amount: number(),
    purpose: paymentPurposeValidator,
    description: string(),

    // Optional identifiers
    order_id: optional(string()),
    invoice_id: optional(string()),

    // Payment details
    currency: defaulted(currencyValidator, "IRR"),
    mobile: optional(string()),
    email: optional(string()),
    national_code: optional(string()),

    // Metadata
    metadata: defaulted(object({}), {}),

    // Payment options
    options: defaulted(object({
      gateway_id: optional(string()),
      gateway_type: optional(paymentGatewayTypeValidator),
      allow_fallback: defaulted(boolean(), true),
      max_retries: defaulted(number(), 3),
      priority_gateways: defaulted(array(paymentGatewayTypeValidator), []),
      exclude_gateways: defaulted(array(paymentGatewayTypeValidator), []),
      user_preferences: defaulted(object({
        preferred_gateway: optional(paymentGatewayTypeValidator),
        avoid_gateways: defaulted(array(paymentGatewayTypeValidator), []),
      }), {}),
    }), {}),
  }),
  get: object({
    success: number(),
    transaction_id: number(),
    gateway_type: number(),
    gateway_id: number(),
    payment_url: number(),
    authority: number(),
    reference_id: number(),
    amount: number(),
    final_amount: number(),
    gateway_fee: number(),
    expires_at: number(),
    message: number(),
    error: number(),
    fallback_used: number(),
    retry_count: number(),
  }),
};

// Verify Unified Payment Validation
export const verifyUnifiedPaymentValidator = {
  set: object({
    transaction_id: string(),
    authority: optional(string()),
    reference_id: optional(string()),
    callback_params: defaulted(object({}), {}),
  }),
  get: object({
    success: number(),
    transaction_id: number(),
    gateway_type: number(),
    amount: number(),
    reference_id: number(),
    tracking_code: number(),
    card_info: number(),
    wallet_info: number(),
    message: number(),
    error: number(),
  }),
};

// Cancel Payment Validation
export const cancelPaymentValidator = {
  set: object({
    transaction_id: string(),
  }),
  get: object({
    success: number(),
    message: number(),
    error: number(),
  }),
};

// Refund Payment Validation
export const refundPaymentValidator = {
  set: object({
    transaction_id: string(),
    amount: optional(number()),
    reason: defaulted(string(), "درخواست ادمین"),
  }),
  get: object({
    success: number(),
    refund_id: number(),
    message: number(),
    error: number(),
  }),
};

// Get Payment Statistics Validation
export const getPaymentStatisticsValidator = {
  set: object({
    period: optional(object({
      from: string(),
      to: string(),
    })),
  }),
  get: object({
    success: number(),
    data: number(),
    error: number(),
  }),
};

// Get Gateway Health Status Validation
export const getGatewayHealthStatusValidator = {
  set: object({
    gateway_type: optional(paymentGatewayTypeValidator),
  }),
  get: object({
    success: number(),
    data: number(),
    error: number(),
  }),
};

// Get Transaction Details Validation
export const getTransactionDetailsValidator = {
  set: object({
    transaction_id: string(),
  }),
  get: object({
    success: number(),
    data: number(),
    error: number(),
  }),
};

// Cleanup Expired Transactions Validation
export const cleanupExpiredTransactionsValidator = {
  set: object({}),
  get: object({
    success: number(),
    message: number(),
    cleaned_count: number(),
    error: number(),
  }),
};

// Gateway callback validation (for different gateways)
export const gatewayCallbackValidator = {
  set: object({
    // ZarinPal
    Authority: optional(string()),
    Status: optional(string()),

    // Mellat Bank
    ResCode: optional(string()),
    SaleOrderId: optional(string()),
    SaleReferenceId: optional(string()),
    RefId: optional(string()),
    CardHolderPan: optional(string()),

    // Saman Bank
    State: optional(string()),
    RefNum: optional(string()),
    ResNum: optional(string()),
    MID: optional(string()),
    Wage: optional(string()),
    TraceNo: optional(string()),
    SecurePan: optional(string()),
    HashedCardPan: optional(string()),

    // Common fields
    transaction_id: optional(string()),
    user_id: optional(string()),
    order_id: optional(string()),
    amount: optional(number()),
  }),
  get: object({
    success: number(),
    data: number(),
    message: number(),
    error: number(),
  }),
};

// Payment amount validation helper
export const validatePaymentAmount = (amount: number): { valid: boolean; error?: string } => {
  if (!amount || typeof amount !== 'number') {
    return { valid: false, error: "مبلغ باید عددی باشد" };
  }

  if (amount < 1000) {
    return { valid: false, error: "حداقل مبلغ پرداخت 1000 تومان می‌باشد" };
  }

  if (amount > 1000000000) { // 100M Toman
    return { valid: false, error: "حداکثر مبلغ پرداخت 100,000,000 تومان می‌باشد" };
  }

  if (!Number.isInteger(amount)) {
    return { valid: false, error: "مبلغ پرداخت باید عدد صحیح باشد" };
  }

  return { valid: true };
};

// Iranian mobile number validation
export const validateIranianMobile = (mobile: string): { valid: boolean; error?: string } => {
  if (!mobile) {
    return { valid: true }; // Optional field
  }

  const mobilePattern = /^(\+98|0)?9[0-9]{9}$/;
  if (!mobilePattern.test(mobile.replace(/\s/g, ""))) {
    return { valid: false, error: "شماره موبایل نامعتبر است" };
  }

  return { valid: true };
};

// Email validation
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: true }; // Optional field
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { valid: false, error: "آدرس ایمیل نامعتبر است" };
  }

  return { valid: true };
};

// Iranian national code validation
export const validateIranianNationalCode = (nationalCode: string): { valid: boolean; error?: string } => {
  if (!nationalCode) {
    return { valid: true }; // Optional field
  }

  // Remove any non-digit characters
  const code = nationalCode.replace(/\D/g, '');

  // Check length
  if (code.length !== 10) {
    return { valid: false, error: "کد ملی باید 10 رقم باشد" };
  }

  // Check for repeated digits
  if (/^(\d)\1{9}$/.test(code)) {
    return { valid: false, error: "کد ملی نامعتبر است" };
  }

  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(code[i]) * (10 - i);
  }

  const checkDigit = sum % 11;
  const lastDigit = parseInt(code[9]);

  if (checkDigit < 2) {
    if (lastDigit !== checkDigit) {
      return { valid: false, error: "کد ملی نامعتبر است" };
    }
  } else {
    if (lastDigit !== 11 - checkDigit) {
      return { valid: false, error: "کد ملی نامعتبر است" };
    }
  }

  return { valid: true };
};

// Transaction ID validation
export const validateTransactionId = (transactionId: string): { valid: boolean; error?: string } => {
  if (!transactionId || typeof transactionId !== 'string') {
    return { valid: false, error: "شناسه تراکنش الزامی است" };
  }

  // Check format (should be like TXN_1234567890_ABC123)
  if (!/^TXN_\d+_[A-Z0-9]+$/i.test(transactionId)) {
    return { valid: false, error: "فرمت شناسه تراکنش نامعتبر است" };
  }

  return { valid: true };
};

// Gateway type validation
export const validateGatewayType = (gatewayType: string): { valid: boolean; error?: string } => {
  const validGateways = ["zarinpal", "mellat_bank", "saman_bank", "wallet", "bank_transfer", "crypto"];

  if (!validGateways.includes(gatewayType)) {
    return { valid: false, error: "نوع درگاه پرداخت نامعتبر است" };
  }

  return { valid: true };
};

// Date range validation for statistics
export const validateDateRange = (from?: string, to?: string): { valid: boolean; error?: string } => {
  if (!from && !to) {
    return { valid: true }; // No date range specified
  }

  if (!from || !to) {
    return { valid: false, error: "هر دو تاریخ شروع و پایان الزامی است" };
  }

  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return { valid: false, error: "فرمت تاریخ نامعتبر است" };
    }

    if (fromDate >= toDate) {
      return { valid: false, error: "تاریخ شروع باید قبل از تاریخ پایان باشد" };
    }

    // Check if range is not too large (max 1 year)
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (toDate.getTime() - fromDate.getTime() > oneYear) {
      return { valid: false, error: "بازه زمانی نمی‌تواند بیش از یک سال باشد" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "خطا در اعتبارسنجی تاریخ" };
  }
};

// Custom validation function that can be used in the act functions
export const validatePaymentRequest = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Amount validation
  const amountResult = validatePaymentAmount(data.amount);
  if (!amountResult.valid) {
    errors.push(amountResult.error!);
  }

  // Mobile validation
  if (data.mobile) {
    const mobileResult = validateIranianMobile(data.mobile);
    if (!mobileResult.valid) {
      errors.push(mobileResult.error!);
    }
  }

  // Email validation
  if (data.email) {
    const emailResult = validateEmail(data.email);
    if (!emailResult.valid) {
      errors.push(emailResult.error!);
    }
  }

  // National code validation
  if (data.national_code) {
    const nationalCodeResult = validateIranianNationalCode(data.national_code);
    if (!nationalCodeResult.valid) {
      errors.push(nationalCodeResult.error!);
    }
  }

  // Gateway type validation
  if (data.options?.gateway_type) {
    const gatewayResult = validateGatewayType(data.options.gateway_type);
    if (!gatewayResult.valid) {
      errors.push(gatewayResult.error!);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
