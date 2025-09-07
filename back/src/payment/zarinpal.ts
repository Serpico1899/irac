import { WalletService } from "../wallet/service.ts";

export interface ZarinPalConfig {
  merchantId: string;
  sandbox?: boolean;
  callbackUrl: string;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  mobile?: string;
  email?: string;
  order_id?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRequestResponse {
  code: number;
  message: string;
  authority?: string;
  fee_type?: string;
  fee?: number;
}

export interface PaymentVerificationRequest {
  authority: string;
  amount: number;
}

export interface PaymentVerificationResponse {
  code: number;
  message: string;
  card_hash?: string;
  card_pan?: string;
  ref_id?: number;
  fee_type?: string;
  fee?: number;
}

export class ZarinPalService {
  private config: ZarinPalConfig;
  private baseUrl: string;

  constructor(config: ZarinPalConfig) {
    this.config = config;
    this.baseUrl = config.sandbox
      ? "https://sandbox.zarinpal.com/pg/rest/WebGate/"
      : "https://api.zarinpal.com/pg/rest/WebGate/";
  }

  /**
   * Create payment request
   */
  async createPaymentRequest(
    userId: string,
    request: PaymentRequest
  ): Promise<{
    success: boolean;
    data?: PaymentRequestResponse & { payment_url?: string };
    error?: string;
  }> {
    try {
      // Validate amount (minimum 1000 IRR for ZarinPal)
      if (request.amount < 1000) {
        return {
          success: false,
          error: "حداقل مبلغ قابل پرداخت 1000 تومان می‌باشد",
        };
      }

      const requestBody = {
        merchant_id: this.config.merchantId,
        amount: request.amount,
        description: request.description,
        callback_url: this.config.callbackUrl,
        metadata: {
          mobile: request.mobile,
          email: request.email,
          order_id: request.order_id,
          user_id: userId,
          ...request.metadata,
        },
      };

      const response = await fetch(`${this.baseUrl}PaymentRequest.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result: PaymentRequestResponse = await response.json();

      if (result.code === 100 && result.authority) {
        // Success - create payment URL
        const paymentUrl = this.config.sandbox
          ? `https://sandbox.zarinpal.com/pg/StartPay/${result.authority}`
          : `https://www.zarinpal.com/pg/StartPay/${result.authority}`;

        return {
          success: true,
          data: {
            ...result,
            payment_url: paymentUrl,
          },
        };
      } else {
        return {
          success: false,
          error: this.getErrorMessage(result.code),
        };
      }
    } catch (error) {
      console.error("ZarinPal payment request error:", error);
      return {
        success: false,
        error: "خطا در اتصال به درگاه پرداخت",
      };
    }
  }

  /**
   * Verify payment after callback
   */
  async verifyPayment(
    userId: string,
    authority: string,
    amount: number
  ): Promise<{
    success: boolean;
    data?: PaymentVerificationResponse;
    error?: string;
  }> {
    try {
      const requestBody = {
        merchant_id: this.config.merchantId,
        authority: authority,
        amount: amount,
      };

      const response = await fetch(`${this.baseUrl}PaymentVerification.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result: PaymentVerificationResponse = await response.json();

      if (result.code === 100 || result.code === 101) {
        // Success - add funds to wallet
        try {
          const depositResult = await WalletService.deposit(
            userId,
            amount,
            "zarinpal",
            `شارژ کیف پول از طریق زرین‌پال - کد پیگیری: ${result.ref_id}`,
            result.ref_id?.toString()
          );

          return {
            success: true,
            data: {
              ...result,
              wallet_transaction_id: depositResult.transactionId,
              new_balance: depositResult.newBalance,
            } as any,
          };
        } catch (walletError) {
          console.error("Wallet deposit error:", walletError);
          return {
            success: false,
            error: "پرداخت موفق بود اما خطا در شارژ کیف پول رخ داد. با پشتیبانی تماس بگیرید.",
          };
        }
      } else {
        return {
          success: false,
          error: this.getErrorMessage(result.code),
        };
      }
    } catch (error) {
      console.error("ZarinPal payment verification error:", error);
      return {
        success: false,
        error: "خطا در تأیید پرداخت",
      };
    }
  }

  /**
   * Get unverified transactions
   */
  async getUnverifiedTransactions(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const requestBody = {
        merchant_id: this.config.merchantId,
      };

      const response = await fetch(`${this.baseUrl}UnverifiedTransactions.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      return {
        success: result.code === 100,
        data: result.authorities || [],
        error: result.code !== 100 ? this.getErrorMessage(result.code) : undefined,
      };
    } catch (error) {
      console.error("ZarinPal unverified transactions error:", error);
      return {
        success: false,
        error: "خطا در دریافت تراکنش‌های تأیید نشده",
      };
    }
  }

  /**
   * Refund payment (if supported by merchant)
   */
  async refundPayment(
    authority: string,
    amount: number,
    reason?: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const requestBody = {
        merchant_id: this.config.merchantId,
        authority: authority,
        amount: amount,
        reason: reason || "درخواست مشتری",
      };

      const response = await fetch(`${this.baseUrl}RefundRequest.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      return {
        success: result.code === 100,
        data: result,
        error: result.code !== 100 ? this.getErrorMessage(result.code) : undefined,
      };
    } catch (error) {
      console.error("ZarinPal refund error:", error);
      return {
        success: false,
        error: "خطا در برگشت وجه",
      };
    }
  }

  /**
   * Get error message for ZarinPal error codes
   */
  private getErrorMessage(code: number): string {
    const errorMessages: Record<number, string> = {
      // Success codes
      100: "تراکنش با موفقیت انجام شد",
      101: "تراکنش قبلاً تأیید شده است",

      // Error codes
      "-1": "اطلاعات ارسالی ناقص است",
      "-2": "IP یا مرچنت کد پذیرنده صحیح نیست",
      "-3": "مبلغ باید بیش از 1000 ریال باشد",
      "-4": "سطح پذیرنده پایین‌تر از نقره‌ای است",
      "-11": "درخواست مورد نظر یافت نشد",
      "-12": "امکان ویرایش درخواست وجود ندارد",
      "-21": "هیچ نوع عملیات مالی برای این تراکنش یافت نشد",
      "-22": "تراکنش ناموفق می‌باشد",
      "-33": "رقم تراکنش با رقم پرداخت شده مطابقت ندارد",
      "-34": "سقف تقسیم تراکنش از لحاظ تعداد یا مبلغ عبور کرده است",
      "-40": "اجازه دسترسی به متد مربوطه وجود ندارد",
      "-41": "اطلاعات ارسالی مربوط به AdditionalData غیر معتبر است",
      "-42": "مدت زمان معتبر طول عمر شناسه پرداخت بین 30 دقیقه تا 45 روز می‌باشد",
      "-54": "درخواست مورد نظر آرشیو شده است",
    };

    return errorMessages[code] || `خطای ناشناخته: ${code}`;
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number): string {
    return amount.toLocaleString("fa-IR");
  }

  /**
   * Convert Rial to Toman
   */
  static rialToToman(rial: number): number {
    return rial / 10;
  }

  /**
   * Convert Toman to Rial
   */
  static tomanToRial(toman: number): number {
    return toman * 10;
  }

  /**
   * Validate Iranian mobile number
   */
  static validateMobile(mobile: string): boolean {
    const mobilePattern = /^(\+98|0)?9[0-9]{9}$/;
    return mobilePattern.test(mobile);
  }

  /**
   * Format Iranian mobile number
   */
  static formatMobile(mobile: string): string {
    // Remove any non-digit characters
    const cleaned = mobile.replace(/\D/g, "");

    // Handle different formats
    if (cleaned.startsWith("98") && cleaned.length === 12) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith("0") && cleaned.length === 11) {
      return `+98${cleaned.substring(1)}`;
    } else if (cleaned.length === 10 && cleaned.startsWith("9")) {
      return `+98${cleaned}`;
    }

    return mobile; // Return original if can't format
  }

  /**
   * Check if merchant ID is valid format
   */
  static validateMerchantId(merchantId: string): boolean {
    // ZarinPal merchant ID is typically 36 characters (UUID format)
    const merchantPattern = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    return merchantPattern.test(merchantId);
  }

  /**
   * Generate callback URL with parameters
   */
  static generateCallbackUrl(baseUrl: string, orderId?: string, userId?: string): string {
    const url = new URL(baseUrl);
    if (orderId) url.searchParams.set("order_id", orderId);
    if (userId) url.searchParams.set("user_id", userId);
    return url.toString();
  }
}

// Export default instance factory
export const createZarinPalService = (config: ZarinPalConfig) => {
  return new ZarinPalService(config);
};
