import { AppApi } from "@/services/api";

// Types for unified payment requests and responses
export interface UnifiedPaymentRequest {
  amount: number;
  purpose: PaymentPurpose;
  description: string;
  order_id?: string;
  invoice_id?: string;
  currency?: string;
  mobile?: string;
  email?: string;
  national_code?: string;
  metadata?: Record<string, any>;
  options?: PaymentRequestOptions;
}

export interface PaymentRequestOptions {
  gateway_id?: string;
  gateway_type?: PaymentGatewayType;
  allow_fallback?: boolean;
  max_retries?: number;
  priority_gateways?: PaymentGatewayType[];
  exclude_gateways?: PaymentGatewayType[];
  user_preferences?: {
    preferred_gateway?: PaymentGatewayType;
    avoid_gateways?: PaymentGatewayType[];
  };
}

export interface UnifiedPaymentResponse {
  success: boolean;
  transaction_id: string;
  gateway_type: PaymentGatewayType;
  gateway_id: string;
  payment_url?: string;
  authority?: string;
  reference_id?: string;
  amount: number;
  final_amount: number;
  gateway_fee: number;
  expires_at?: string;
  message?: string;
  error?: string;
  fallback_used?: boolean;
  retry_count?: number;
}

export interface UnifiedVerificationRequest {
  transaction_id: string;
  authority?: string;
  reference_id?: string;
  callback_params?: Record<string, any>;
}

export interface UnifiedVerificationResponse {
  success: boolean;
  transaction_id: string;
  gateway_type: PaymentGatewayType;
  amount: number;
  reference_id?: string;
  tracking_code?: string;
  card_info?: {
    masked_pan?: string;
    hash?: string;
    bank_name?: string;
  };
  wallet_info?: {
    transaction_id?: string;
    new_balance?: number;
  };
  message?: string;
  error?: string;
}

export interface PaymentGatewayInfo {
  type: PaymentGatewayType;
  name: string;
  name_en: string;
  display_name: string;
  description: string;
  icon_url?: string;
  logo_url?: string;
  color: string;
  min_amount: number;
  max_amount: number;
  gateway_fee: number;
  is_available: boolean;
  is_healthy: boolean;
  features: {
    supports_refund: boolean;
    supports_partial_refund: boolean;
    supports_recurring: boolean;
    supports_installment: boolean;
    supports_wallet_charge: boolean;
    supports_direct_payment: boolean;
    requires_verification: boolean;
    instant_confirmation: boolean;
  };
}

export interface WalletBalanceResponse {
  success: boolean;
  balance: number;
  currency: string;
  last_updated: string;
  is_sufficient: boolean;
  required_amount?: number;
  error?: string;
}

export interface PaymentStatistics {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  total_amount: number;
  success_rate: number;
  average_response_time: number;
  gateway_breakdown: Record<string, {
    transactions: number;
    amount: number;
    success_rate: number;
  }>;
}

// Payment gateway types
export type PaymentGatewayType = 'zarinpal' | 'mellat_bank' | 'saman_bank' | 'wallet' | 'bank_transfer' | 'crypto';

// Payment purposes
export type PaymentPurpose =
  | 'wallet_charge'
  | 'course_purchase'
  | 'workshop_booking'
  | 'product_purchase'
  | 'space_booking'
  | 'subscription'
  | 'service_fee'
  | 'penalty'
  | 'refund'
  | 'bonus'
  | 'other';

// Payment status types
export interface PaymentStatus {
  isPending: boolean;
  isProcessing: boolean;
  isSuccess: boolean;
  isFailed: boolean;
  isCancelled: boolean;
  isExpired: boolean;
  isLoading: boolean;
  message?: string;
  errorCode?: string;
}

class UnifiedPaymentApiService {
  private getToken(): string | undefined {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token") || undefined;
    }
    return undefined;
  }

  /**
   * Get available payment gateways
   */
  async getAvailableGateways(amount?: number): Promise<{
    success: boolean;
    gateways: PaymentGatewayInfo[];
    error?: string;
  }> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "payment",
          act: "getAvailableGateways",
          details: {
            set: {
              amount: amount || 0,
            },
            get: {
              success: 1,
              gateways: 1,
              message: 1,
            },
          },
        },
        { token },
      );

      if (!result.success) {
        throw new Error(result.message || "خطا در دریافت درگاه‌های پرداخت");
      }

      return {
        success: true,
        gateways: result.gateways || [],
      };
    } catch (error) {
      console.error("Get available gateways error:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "خطا در دریافت درگاه‌های پرداخت";

      return {
        success: false,
        gateways: [],
        error: errorMessage,
      };
    }
  }

  /**
   * Create unified payment request
   */
  async createPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "payment",
          act: "createUnifiedPayment",
          details: {
            set: {
              amount: request.amount,
              purpose: request.purpose,
              description: request.description,
              order_id: request.order_id,
              invoice_id: request.invoice_id,
              currency: request.currency || "IRR",
              mobile: request.mobile,
              email: request.email,
              national_code: request.national_code,
              metadata: request.metadata || {},
              options: request.options || {},
            },
            get: {
              success: 1,
              transaction_id: 1,
              gateway_type: 1,
              gateway_id: 1,
              payment_url: 1,
              authority: 1,
              reference_id: 1,
              amount: 1,
              final_amount: 1,
              gateway_fee: 1,
              expires_at: 1,
              message: 1,
              error: 1,
              fallback_used: 1,
              retry_count: 1,
            },
          },
        },
        { token },
      );

      if (!result.success) {
        throw new Error(result.error || result.message || "خطا در ایجاد درخواست پرداخت");
      }

      return {
        success: true,
        transaction_id: result.transaction_id,
        gateway_type: result.gateway_type,
        gateway_id: result.gateway_id,
        payment_url: result.payment_url,
        authority: result.authority,
        reference_id: result.reference_id,
        amount: result.amount,
        final_amount: result.final_amount,
        gateway_fee: result.gateway_fee || 0,
        expires_at: result.expires_at,
        message: result.message || "درخواست پرداخت با موفقیت ایجاد شد",
        fallback_used: result.fallback_used || false,
        retry_count: result.retry_count || 0,
      };
    } catch (error) {
      console.error("Unified payment creation error:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "خطا در ایجاد درخواست پرداخت";

      return {
        success: false,
        transaction_id: "",
        gateway_type: "zarinpal", // fallback
        gateway_id: "",
        amount: request.amount,
        final_amount: request.amount,
        gateway_fee: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Verify unified payment
   */
  async verifyPayment(request: UnifiedVerificationRequest): Promise<UnifiedVerificationResponse> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "payment",
          act: "verifyUnifiedPayment",
          details: {
            set: {
              transaction_id: request.transaction_id,
              authority: request.authority,
              reference_id: request.reference_id,
              callback_params: request.callback_params || {},
            },
            get: {
              success: 1,
              transaction_id: 1,
              gateway_type: 1,
              amount: 1,
              reference_id: 1,
              tracking_code: 1,
              card_info: 1,
              wallet_info: 1,
              message: 1,
              error: 1,
            },
          },
        },
        { token },
      );

      return {
        success: result.success,
        transaction_id: result.transaction_id,
        gateway_type: result.gateway_type,
        amount: result.amount,
        reference_id: result.reference_id,
        tracking_code: result.tracking_code,
        card_info: result.card_info,
        wallet_info: result.wallet_info,
        message: result.message || (result.success ? "پرداخت با موفقیت تأیید شد" : "تأیید پرداخت ناموفق بود"),
        error: result.error,
      };
    } catch (error) {
      console.error("Unified payment verification error:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "خطا در تأیید پرداخت";

      return {
        success: false,
        transaction_id: request.transaction_id,
        gateway_type: "zarinpal", // fallback
        amount: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Check wallet balance
   */
  async getWalletBalance(requiredAmount?: number): Promise<WalletBalanceResponse> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "wallet",
          act: "getBalance",
          details: {
            set: {
              required_amount: requiredAmount || 0,
            },
            get: {
              success: 1,
              balance: 1,
              currency: 1,
              last_updated: 1,
              is_sufficient: 1,
            },
          },
        },
        { token },
      );

      return {
        success: result.success,
        balance: result.balance || 0,
        currency: result.currency || "IRR",
        last_updated: result.last_updated || new Date().toISOString(),
        is_sufficient: result.is_sufficient || false,
        required_amount: requiredAmount,
        error: result.error,
      };
    } catch (error) {
      console.error("Wallet balance check error:", error);

      return {
        success: false,
        balance: 0,
        currency: "IRR",
        last_updated: new Date().toISOString(),
        is_sufficient: false,
        required_amount: requiredAmount,
        error: error instanceof Error ? error.message : "خطا در دریافت موجودی کیف پول",
      };
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(transactionId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "payment",
          act: "cancelPayment",
          details: {
            set: {
              transaction_id: transactionId,
            },
            get: {
              success: 1,
              message: 1,
              error: 1,
            },
          },
        },
        { token },
      );

      return {
        success: result.success,
        message: result.message || "پرداخت با موفقیت لغو شد",
        error: result.error,
      };
    } catch (error) {
      console.error("Payment cancellation error:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "خطا در لغو پرداخت",
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<{
    success: boolean;
    refund_id?: string;
    message?: string;
    error?: string;
  }> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "payment",
          act: "refundPayment",
          details: {
            set: {
              transaction_id: transactionId,
              amount: amount,
              reason: reason || "درخواست کاربر",
            },
            get: {
              success: 1,
              refund_id: 1,
              message: 1,
              error: 1,
            },
          },
        },
        { token },
      );

      return {
        success: result.success,
        refund_id: result.refund_id,
        message: result.message || "برگشت وجه با موفقیت انجام شد",
        error: result.error,
      };
    } catch (error) {
      console.error("Payment refund error:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "خطا در برگشت وجه",
      };
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(period?: { from: string; to: string }): Promise<{
    success: boolean;
    data?: PaymentStatistics;
    error?: string;
  }> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "payment",
          act: "getPaymentStatistics",
          details: {
            set: {
              period: period || null,
            },
            get: {
              success: 1,
              data: 1,
              error: 1,
            },
          },
        },
        { token },
      );

      return {
        success: result.success,
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      console.error("Payment statistics error:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "خطا در دریافت آمار پرداخت",
      };
    }
  }

  /**
   * Redirect user to payment gateway
   */
  redirectToPayment(paymentUrl: string, gatewayType: PaymentGatewayType): void {
    if (typeof window !== "undefined") {
      // Store payment data for recovery
      this.storePaymentData({
        payment_url: paymentUrl,
        gateway_type: gatewayType,
        timestamp: new Date().toISOString(),
      });

      // For mobile devices, use location.href for better compatibility
      if (this.isMobileDevice()) {
        window.location.href = paymentUrl;
      } else {
        // For desktop, open in same tab for better UX
        window.location.href = paymentUrl;
      }
    }
  }

  /**
   * Parse callback URL parameters for different gateways
   */
  parseCallbackParams(url?: string): {
    gateway_type?: PaymentGatewayType;
    authority?: string;
    status?: string;
    reference_id?: string;
    amount?: number;
    [key: string]: any;
  } | null {
    try {
      const urlToParse = url || (typeof window !== "undefined" ? window.location.href : "");
      const urlObj = new URL(urlToParse);
      const params = urlObj.searchParams;

      // Detect gateway type based on callback parameters
      let gatewayType: PaymentGatewayType | undefined;
      let authority: string | undefined;
      let status: string | undefined;
      let referenceId: string | undefined;

      // ZarinPal parameters
      if (params.has('Authority') && params.has('Status')) {
        gatewayType = 'zarinpal';
        authority = params.get('Authority') || undefined;
        status = params.get('Status') || undefined;
      }

      // Mellat Bank parameters
      else if (params.has('ResCode') && params.has('SaleReferenceId')) {
        gatewayType = 'mellat_bank';
        referenceId = params.get('SaleReferenceId') || undefined;
        status = params.get('ResCode') === '0' ? 'OK' : 'NOK';
      }

      // Saman Bank parameters
      else if (params.has('State') && params.has('RefNum')) {
        gatewayType = 'saman_bank';
        referenceId = params.get('RefNum') || undefined;
        status = params.get('State') || undefined;
      }

      if (!gatewayType) {
        return null;
      }

      // Create callback params object with all parameters
      const callbackParams: any = {
        gateway_type: gatewayType,
        authority,
        status,
        reference_id: referenceId,
      };

      // Add all URL parameters
      params.forEach((value, key) => {
        callbackParams[key] = value;
      });

      return callbackParams;
    } catch (error) {
      console.error("Error parsing callback params:", error);
      return null;
    }
  }

  /**
   * Get payment status from callback parameters
   */
  getPaymentStatusFromCallback(url?: string): PaymentStatus {
    const params = this.parseCallbackParams(url);

    if (!params) {
      return {
        isPending: false,
        isProcessing: false,
        isSuccess: false,
        isFailed: true,
        isCancelled: false,
        isExpired: false,
        isLoading: false,
        message: "پارامترهای بازگشت از درگاه نامعتبر است",
        errorCode: "INVALID_CALLBACK",
      };
    }

    const { gateway_type, status } = params;

    switch (gateway_type) {
      case 'zarinpal':
        if (status === 'OK') {
          return {
            isPending: true,
            isProcessing: true,
            isSuccess: false,
            isFailed: false,
            isCancelled: false,
            isExpired: false,
            isLoading: true,
            message: "در حال تأیید پرداخت...",
          };
        } else if (status === 'NOK') {
          return {
            isPending: false,
            isProcessing: false,
            isSuccess: false,
            isFailed: true,
            isCancelled: true,
            isExpired: false,
            isLoading: false,
            message: "پرداخت توسط کاربر لغو شد",
            errorCode: "PAYMENT_CANCELLED",
          };
        }
        break;

      case 'mellat_bank':
        if (status === 'OK') {
          return {
            isPending: true,
            isProcessing: true,
            isSuccess: false,
            isFailed: false,
            isCancelled: false,
            isExpired: false,
            isLoading: true,
            message: "در حال تأیید پرداخت...",
          };
        } else {
          return {
            isPending: false,
            isProcessing: false,
            isSuccess: false,
            isFailed: true,
            isCancelled: false,
            isExpired: false,
            isLoading: false,
            message: "پرداخت ناموفق بود",
            errorCode: "PAYMENT_FAILED",
          };
        }
        break;

      case 'saman_bank':
        if (status === 'OK') {
          return {
            isPending: true,
            isProcessing: true,
            isSuccess: false,
            isFailed: false,
            isCancelled: false,
            isExpired: false,
            isLoading: true,
            message: "در حال تأیید پرداخت...",
          };
        } else {
          return {
            isPending: false,
            isProcessing: false,
            isSuccess: false,
            isFailed: true,
            isCancelled: status === 'CanceledByUser',
            isExpired: false,
            isLoading: false,
            message: status === 'CanceledByUser' ? 'پرداخت توسط کاربر لغو شد' : 'پرداخت ناموفق بود',
            errorCode: status === 'CanceledByUser' ? 'PAYMENT_CANCELLED' : 'PAYMENT_FAILED',
          };
        }
        break;
    }

    return {
      isPending: true,
      isProcessing: false,
      isSuccess: false,
      isFailed: false,
      isCancelled: false,
      isExpired: false,
      isLoading: true,
      message: "در حال بررسی وضعیت پرداخت...",
    };
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number, currency: string = "IRR"): string {
    if (currency === "IRR" || currency === "تومان") {
      return `${amount.toLocaleString("fa-IR")} تومان`;
    }
    return `${amount.toLocaleString("fa-IR")} ${currency}`;
  }

  /**
   * Get payment method display name
   */
  static getGatewayDisplayName(gatewayType: PaymentGatewayType): string {
    const displayNames: Record<PaymentGatewayType, string> = {
      zarinpal: "زرین‌پال",
      mellat_bank: "بانک ملت",
      saman_bank: "بانک سامان",
      wallet: "کیف پول",
      bank_transfer: "حواله بانکی",
      crypto: "ارز دیجیتال",
    };

    return displayNames[gatewayType] || gatewayType;
  }

  /**
   * Get payment purpose display name
   */
  static getPurposeDisplayName(purpose: PaymentPurpose): string {
    const displayNames: Record<PaymentPurpose, string> = {
      wallet_charge: "شارژ کیف پول",
      course_purchase: "خرید دوره",
      workshop_booking: "ثبت‌نام در کارگاه",
      product_purchase: "خرید محصول",
      space_booking: "رزرو فضای کاری",
      subscription: "اشتراک",
      service_fee: "هزینه خدمات",
      penalty: "جریمه",
      refund: "برگشت وجه",
      bonus: "جایزه",
      other: "سایر",
    };

    return displayNames[purpose] || purpose;
  }

  /**
   * Validate Iranian mobile number
   */
  static validateMobile(mobile: string): boolean {
    const mobilePattern = /^(\+98|0)?9[0-9]{9}$/;
    return mobilePattern.test(mobile.replace(/\s/g, ""));
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Check if amount is valid for payment
   */
  static isValidAmount(amount: number): boolean {
    return amount >= 1000 && amount <= 1000000000; // 100 Toman to 100M Toman
  }

  /**
   * Get minimum payment amount
   */
  static getMinimumAmount(): number {
    return 1000; // 1000 IRR (100 Toman)
  }

  /**
   * Check if current device is mobile
   */
  private isMobileDevice(): boolean {
    if (typeof window === "undefined") return false;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent
    ) || window.innerWidth <= 768;
  }

  /**
   * Store payment data in localStorage for recovery
   */
  private storePaymentData(data: {
    payment_url: string;
    gateway_type: PaymentGatewayType;
    timestamp: string;
  }): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("unified_payment_data", JSON.stringify(data));
      } catch (error) {
        console.warn("Could not store payment data:", error);
      }
    }
  }

  /**
   * Retrieve stored payment data
   */
  static getStoredPaymentData(): {
    payment_url: string;
    gateway_type: PaymentGatewayType;
    timestamp: string;
  } | null {
    if (typeof window !== "undefined") {
      try {
        const data = localStorage.getItem("unified_payment_data");
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn("Could not retrieve payment data:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear stored payment data
   */
  static clearStoredPaymentData(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("unified_payment_data");
      } catch (error) {
        console.warn("Could not clear payment data:", error);
      }
    }
  }

  /**
   * Get callback URL for current environment
   */
  static getCallbackUrl(basePath: string = "/payment/callback"): string {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${basePath}`;
    }

    // Fallback for SSR
    return `${process.env.NEXTAUTH_URL || "http://localhost:3000"}${basePath}`;
  }

  /**
   * Create payment metadata with device and session info
   */
  static createPaymentMetadata(additionalData?: Record<string, any>): Record<string, any> {
    const metadata: Record<string, any> = {
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    if (typeof window !== "undefined") {
      metadata.user_agent = window.navigator.userAgent;
      metadata.screen_resolution = `${window.screen.width}x${window.screen.height}`;
      metadata.viewport_size = `${window.innerWidth}x${window.innerHeight}`;
      metadata.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      metadata.language = window.navigator.language;
      metadata.referrer = document.referrer;
      metadata.url = window.location.href;
    }

    return metadata;
  }

  /**
   * Get gateway icon URL
   */
  static getGatewayIconUrl(gatewayType: PaymentGatewayType): string {
    const iconUrls: Record<PaymentGatewayType, string> = {
      zarinpal: "/images/gateways/zarinpal.svg",
      mellat_bank: "/images/gateways/mellat.svg",
      saman_bank: "/images/gateways/saman.svg",
      wallet: "/images/gateways/wallet.svg",
      bank_transfer: "/images/gateways/bank.svg",
      crypto: "/images/gateways/crypto.svg",
    };

    return iconUrls[gatewayType] || "/images/gateways/default.svg";
  }

  /**
   * Get gateway color scheme
   */
  static getGatewayColor(gatewayType: PaymentGatewayType): string {
    const colors: Record<PaymentGatewayType, string> = {
      zarinpal: "#ffd900",
      mellat_bank: "#e31e24",
      saman_bank: "#1e3d59",
      wallet: "#168c95",
      bank_transfer: "#6b7280",
      crypto: "#f7931a",
    };

    return colors[gatewayType] || "#168c95";
  }
}

export const unifiedPaymentApi = new UnifiedPaymentApiService();
export default unifiedPaymentApi;
