// Import payment act setup functions
import { createPaymentSetup } from "./createPayment/mod.ts";
import { verifyPaymentSetup } from "./verifyPayment/mod.ts";
import { unifiedPaymentSetup } from "./unifiedPayment/mod.ts";

// Export payment services and utilities
export { ZarinPalService, createZarinPalService } from "./zarinpal.ts";
export type {
  ZarinPalConfig,
  PaymentRequest,
  PaymentRequestResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
} from "./zarinpal.ts";

// Export Mellat Bank service
export { MellatBankService, createMellatBankService } from "./mellat.ts";
export type {
  MellatBankConfig,
  MellatPaymentRequest,
  MellatPaymentResponse,
  MellatVerificationRequest,
  MellatVerificationResponse,
  MellatSettleRequest,
  MellatRefundRequest,
} from "./mellat.ts";

// Export Saman Bank service
export { SamanBankService, createSamanBankService } from "./saman.ts";
export type {
  SamanBankConfig,
  SamanPaymentRequest,
  SamanPaymentResponse,
  SamanVerificationRequest,
  SamanVerificationResponse,
  SamanReverseRequest,
} from "./saman.ts";

// Export Payment Gateway Manager
export { PaymentGatewayManager, createPaymentGatewayManager, generateTransactionId, updateTransactionStatus } from "./gateway-manager.ts";
export type {
  PaymentGatewayManagerConfig,
  PaymentRequestOptions,
  UnifiedPaymentRequest,
  UnifiedPaymentResponse,
  UnifiedVerificationRequest,
  UnifiedVerificationResponse,
  GatewayHealthStatus,
} from "./gateway-manager.ts";

// Export payment gateway models
export type {
  PaymentGateway,
  PaymentGatewayType,
  PaymentGatewayStatus,
  PaymentGatewayEnvironment,
  PaymentGatewayConfig,
  CurrencyCode,
} from "@model";
export {
  paymentGatewayType,
  paymentGatewayStatus,
  paymentGatewayEnvironment,
  currencyCode,
  paymentGateway,
  paymentGatewayConfig,
  DEFAULT_GATEWAYS,
  validateGatewayConfig,
  gatewaySupportsFeature,
  validateAmountForGateway,
  calculateGatewayFees,
} from "@model";

// Export payment transaction models
export type {
  PaymentTransaction,
  PaymentTransactionStatus,
  PaymentTransactionType,
  PaymentMethod,
  PaymentPurpose,
  CurrencyType,
} from "@model";
export {
  paymentTransactionStatus,
  paymentTransactionType,
  paymentMethod,
  paymentPurpose,
  currencyType,
  paymentTransaction,
  isTransactionCompleted,
  isTransactionPending,
  isTransactionFailed,
  isTransactionRefundable,
  canRetryTransaction,
  calculateRefundableAmount,
  addTransactionEvent,
  createDefaultTransaction,
} from "@model";

// Payment module setup function
export const paymentSetup = () => {
  createPaymentSetup();
  verifyPaymentSetup();
  unifiedPaymentSetup();
  console.log("Payment module initialized with multiple gateway support (ZarinPal, Mellat Bank, Saman Bank, Wallet)");
};
