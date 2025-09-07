import { AppApi } from "@/services/api";

// Types for ZarinPal payment requests and responses
export interface ZarinPalPaymentRequest {
  amount: number;
  description: string;
  mobile?: string;
  email?: string;
  order_id?: string;
  metadata?: Record<string, any>;
}

export interface ZarinPalPaymentResponse {
  success: boolean;
  data: {
    authority: string;
    payment_url: string;
    amount: number;
    description: string;
    fee?: number;
    fee_type?: string;
  };
  message: string;
}

export interface ZarinPalVerifyRequest {
  authority: string;
  amount: number;
  status?: string;
}

export interface ZarinPalVerifyResponse {
  success: boolean;
  data: {
    authority: string;
    amount: number;
    ref_id?: number;
    card_hash?: string;
    card_pan?: string;
    fee?: number;
    fee_type?: string;
    wallet_transaction_id?: string;
    new_balance?: number;
  } | null;
  message: string;
  error_code?: string;
}

export interface PaymentStatus {
  isPending: boolean;
  isSuccess: boolean;
  isFailed: boolean;
  isLoading: boolean;
  message?: string;
  errorCode?: string;
}

class ZarinPalApiService {
  private getToken(): string | undefined {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token") || undefined;
    }
    return undefined;
  }

  /**
   * Create ZarinPal payment request
   */
  async createPayment(request: ZarinPalPaymentRequest): Promise<ZarinPalPaymentResponse> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "payment",
          act: "createPayment",
          details: {
            set: {
              amount: request.amount,
              description: request.description,
              mobile: request.mobile,
              email: request.email,
              order_id: request.order_id,
              metadata: request.metadata,
            },
            get: {
              success: 1,
              data: 1,
              message: 1,
            },
          },
        },
        { token },
      );

      if (!result.success) {
        throw new Error(result.message || "خطا در ایجاد درخواست پرداخت");
      }

      return {
        success: true,
        data: result.data,
        message: result.message || "درخواست پرداخت با موفقیت ایجاد شد",
      };
    } catch (error) {
      console.error("ZarinPal create payment error:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "خطا در ایجاد درخواست پرداخت";

      return {
        success: false,
        data: {
          authority: "",
          payment_url: "",
          amount: request.amount,
          description: request.description,
        },
        message: errorMessage,
      };
    }
  }

  /**
   * Verify ZarinPal payment
   */
  async verifyPayment(request: ZarinPalVerifyRequest): Promise<ZarinPalVerifyResponse> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "payment",
          act: "verifyPayment",
          details: {
            set: {
              authority: request.authority,
              amount: request.amount,
              status: request.status,
            },
            get: {
              success: 1,
              data: 1,
              message: 1,
              error_code: 1,
            },
          },
        },
        { token },
      );

      return {
        success: result.success,
        data: result.data,
        message: result.message || (result.success ? "پرداخت با موفقیت تأیید شد" : "تأیید پرداخت ناموفق بود"),
        error_code: result.error_code,
      };
    } catch (error) {
      console.error("ZarinPal verify payment error:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "خطا در تأیید پرداخت";

      return {
        success: false,
        data: {
          authority: request.authority,
          amount: request.amount,
        },
        message: errorMessage,
        error_code: "VERIFICATION_ERROR",
      };
    }
  }

  /**
   * Redirect user to ZarinPal payment page
   * This is mobile-optimized and works well on all devices
   */
  redirectToPayment(paymentUrl: string): void {
    if (typeof window !== "undefined") {
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
   * Parse callback URL parameters
   * Used when user returns from ZarinPal
   */
  parseCallbackParams(url?: string): {
    authority?: string;
    status?: string;
    amount?: number;
  } | null {
    try {
      const urlToParse = url || (typeof window !== "undefined" ? window.location.href : "");
      const urlObj = new URL(urlToParse);
      const params = urlObj.searchParams;

      const authority = params.get("Authority");
      const status = params.get("Status");

      if (!authority) {
        return null;
      }

      return {
        authority,
        status: status || undefined,
      };
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
        isSuccess: false,
        isFailed: true,
        isLoading: false,
        message: "پارامترهای بازگشت از درگاه نامعتبر است",
        errorCode: "INVALID_CALLBACK",
      };
    }

    if (params.status === "OK") {
      return {
        isPending: true,
        isSuccess: false,
        isFailed: false,
        isLoading: true,
        message: "در حال تأیید پرداخت...",
      };
    } else if (params.status === "NOK") {
      return {
        isPending: false,
        isSuccess: false,
        isFailed: true,
        isLoading: false,
        message: "پرداخت توسط کاربر لغو شد",
        errorCode: "PAYMENT_CANCELLED",
      };
    }

    return {
      isPending: true,
      isSuccess: false,
      isFailed: false,
      isLoading: true,
      message: "در حال بررسی وضعیت پرداخت...",
    };
  }

  /**
   * Format amount for ZarinPal (in IRR/Toman)
   */
  static formatAmount(amount: number, currency: string = "IRR"): string {
    if (currency === "IRR" || currency === "تومان") {
      return `${amount.toLocaleString("fa-IR")} تومان`;
    }
    return `${amount.toLocaleString("fa-IR")} ${currency}`;
  }

  /**
   * Validate Iranian mobile number
   */
  static validateMobile(mobile: string): boolean {
    const mobilePattern = /^(\+98|0)?9[0-9]{9}$/;
    return mobilePattern.test(mobile.replace(/\s/g, ""));
  }

  /**
   * Format Iranian mobile number for display
   */
  static formatMobile(mobile: string): string {
    const cleaned = mobile.replace(/\D/g, "");

    if (cleaned.length === 11 && cleaned.startsWith("09")) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    } else if (cleaned.length === 10 && cleaned.startsWith("9")) {
      return `0${cleaned}`.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    }

    return mobile;
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Get minimum payment amount for ZarinPal
   */
  static getMinimumAmount(): number {
    return 1000; // 1000 IRR (100 Toman)
  }

  /**
   * Check if amount is valid for payment
   */
  static isValidAmount(amount: number): boolean {
    return amount >= this.getMinimumAmount() && amount <= 50000000; // Max 5M Toman
  }

  /**
   * Get payment error message in Persian
   */
  static getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      PAYMENT_CANCELLED: "پرداخت توسط کاربر لغو شد",
      VERIFICATION_FAILED: "تأیید پرداخت ناموفق بود",
      VERIFICATION_ERROR: "خطا در فرآیند تأیید پرداخت",
      INVALID_AMOUNT: "مبلغ وارد شده نامعتبر است",
      INVALID_MOBILE: "شماره موبایل وارد شده نامعتبر است",
      INVALID_EMAIL: "آدرس ایمیل وارد شده نامعتبر است",
      INVALID_CALLBACK: "بازگشت از درگاه پرداخت نامعتبر است",
      NETWORK_ERROR: "خطا در اتصال به شبکه",
      GATEWAY_ERROR: "خطا در درگاه پرداخت",
      INSUFFICIENT_BALANCE: "موجودی کافی نیست",
      MERCHANT_ERROR: "خطا در تنظیمات فروشنده",
    };

    return errorMessages[errorCode] || "خطای نامشخص در پرداخت";
  }

  /**
   * Get payment success message
   */
  static getSuccessMessage(): string {
    return "پرداخت با موفقیت انجام شد و مبلغ به کیف پول شما اضافه گردید";
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
   * Create payment metadata with device info
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
    }

    return metadata;
  }

  /**
   * Store payment data in localStorage for recovery
   */
  static storePaymentData(data: {
    authority: string;
    amount: number;
    description: string;
    timestamp: string;
  }): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("zarinpal_payment_data", JSON.stringify(data));
      } catch (error) {
        console.warn("Could not store payment data:", error);
      }
    }
  }

  /**
   * Retrieve stored payment data
   */
  static getStoredPaymentData(): {
    authority: string;
    amount: number;
    description: string;
    timestamp: string;
  } | null {
    if (typeof window !== "undefined") {
      try {
        const data = localStorage.getItem("zarinpal_payment_data");
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
        localStorage.removeItem("zarinpal_payment_data");
      } catch (error) {
        console.warn("Could not clear payment data:", error);
      }
    }
  }
}

export const zarinpalApi = new ZarinPalApiService();
export default zarinpalApi;
