// Import payment act setup functions
import { createPaymentSetup } from "./createPayment/mod.ts";
import { verifyPaymentSetup } from "./verifyPayment/mod.ts";

// Export payment services and utilities
export { ZarinPalService, createZarinPalService } from "./zarinpal.ts";
export type {
  ZarinPalConfig,
  PaymentRequest,
  PaymentRequestResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
} from "./zarinpal.ts";

// Payment module setup function
export const paymentSetup = () => {
  createPaymentSetup();
  verifyPaymentSetup();
  console.log("Payment module initialized with ZarinPal integration");
};
