import {
  array,
  boolean,
  enums,
  number,
  object,
  optional,
  refine,
  string,
} from "@deps";

// Validate positive numbers
const positive_number = refine(
  number(),
  "positive_number",
  (value: number) => {
    return value > 0;
  },
);

// Validate quantity (must be at least 1)
const quantity_validation = refine(
  number(),
  "quantity_validation",
  (value: number) => {
    return value >= 1 && value <= 100; // Max 100 items of same product
  },
);

// Validate ObjectId format
const object_id_validation = refine(
  string(),
  "object_id_validation",
  (value: string) => {
    return /^[0-9a-fA-F]{24}$/.test(value);
  },
);

// Validate email format
const email_validation = refine(
  string(),
  "email_validation",
  (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
);

// Validate Iranian mobile number
const mobile_validation = refine(
  string(),
  "mobile_validation",
  (value: string) => {
    return /^09[0-9]{9}$/.test(value);
  },
);

// Validate postal code (Iranian format)
const postal_code_validation = refine(
  string(),
  "postal_code_validation",
  (value: string) => {
    return /^[0-9]{10}$/.test(value.replace(/\s/g, ""));
  },
);

// Cart item structure
const cart_item_struct = object({
  product_id: object_id_validation,
  quantity: quantity_validation,
  // Optional: client can send expected price for verification
  expected_price: optional(positive_number),
});

// Address structure
const address_struct = object({
  full_address: string(),
  city: string(),
  state: optional(string()),
  postal_code: postal_code_validation,
  country: optional(string()),
});

// Payment method options
const payment_method_array = ["wallet", "zarinpal", "bank_transfer"];
const payment_method_enums = enums(payment_method_array);

export const purchaseProductValidator = () => {
  return object({
    set: object({
      // Cart items (required)
      items: array(cart_item_struct),

      // Payment method (required)
      payment_method: payment_method_enums,

      // Customer information
      customer_name: string(),
      customer_email: optional(email_validation),
      customer_phone: optional(mobile_validation),

      // Shipping information (required for physical products)
      shipping_address: optional(address_struct),

      // Billing information (optional, defaults to shipping)
      billing_address: optional(address_struct),

      // Use different billing address
      use_different_billing: optional(boolean()),

      // Order preferences
      notes: optional(string()),

      // Promotional codes
      discount_code: optional(string()),
      referral_code: optional(string()),

      // Delivery preferences
      express_delivery: optional(boolean()),
      delivery_notes: optional(string()),

      // Verification flags
      terms_accepted: boolean(),
      newsletter_subscribe: optional(boolean()),

      // Internal tracking
      order_source: optional(string()), // web, mobile, admin
      client_ip: optional(string()),
      user_agent: optional(string()),
    }),
  });
};
