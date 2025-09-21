import { WalletService } from "../wallet/service.ts";

export interface SamanBankConfig {
  merchantId: string;
  terminalId: string;
  sandbox?: boolean;
  callbackUrl: string;
  username?: string;
  password?: string;
}

export interface SamanPaymentRequest {
  amount: number;
  orderId: string;
  description?: string;
  mobile?: string;
  email?: string;
  nationalCode?: string;
  additionalData?: string;
}

export interface SamanPaymentResponse {
  success: boolean;
  token?: string;
  errorCode?: string;
  errorDesc?: string;
}

export interface SamanVerificationRequest {
  refNum: string;
  merchantId: string;
}

export interface SamanVerificationResponse {
  success: boolean;
  amount?: number;
  refNum?: string;
  rrn?: string;
  cardNumber?: string;
  hashCardNumber?: string;
  errorCode?: string;
  errorDesc?: string;
}

export interface SamanReverseRequest {
  refNum: string;
  merchantId: string;
  mid: string;
  tid: string;
  orderId: string;
}

export class SamanBankService {
  private config: SamanBankConfig;
  private paymentUrl: string;
  private verifyUrl: string;
  private reverseUrl: string;

  constructor(config: SamanBankConfig) {
    this.config = config;

    if (config.sandbox) {
      this.paymentUrl = "https://sep.shaparak.ir/payment.aspx";
      this.verifyUrl = "https://sep.shaparak.ir/payments/referencepayment.asmx/verifyTransaction";
      this.reverseUrl = "https://sep.shaparak.ir/payments/referencepayment.asmx/reverseTransaction";
    } else {
      this.paymentUrl = "https://sep.shaparak.ir/payment.aspx";
      this.verifyUrl = "https://sep.shaparak.ir/payments/referencepayment.asmx/verifyTransaction";
      this.reverseUrl = "https://sep.shaparak.ir/payments/referencepayment.asmx/reverseTransaction";
    }
  }

  /**
   * Create payment request
   */
  async createPaymentRequest(
    userId: string,
    request: SamanPaymentRequest
  ): Promise<{
    success: boolean;
    data?: SamanPaymentResponse & { payment_url?: string };
    error?: string;
  }> {
    try {
      // Validate amount (minimum 1000 IRR for Saman)
      if (request.amount < 1000) {
        return {
          success: false,
          error: "حداقل مبلغ قابل پرداخت 1000 تومان می‌باشد",
        };
      }

      // Validate amount (maximum check)
      if (request.amount > 100000000) {
        return {
          success: false,
          error: "حداکثر مبلغ قابل پرداخت 10,000,000 تومان می‌باشد",
        };
      }

      // Get payment token from Saman
      const tokenResult = await this.getPaymentToken(request);

      if (!tokenResult.success || !tokenResult.token) {
        return {
          success: false,
          error: tokenResult.errorDesc || "خطا در دریافت توکن پرداخت",
        };
      }

      // Create payment URL with token
      const paymentUrl = `${this.paymentUrl}?token=${tokenResult.token}`;

      return {
        success: true,
        data: {
          ...tokenResult,
          payment_url: paymentUrl,
        },
      };
    } catch (error) {
      console.error("Saman payment request error:", error);
      return {
        success: false,
        error: "خطا در اتصال به درگاه پرداخت بانک سامان",
      };
    }
  }

  /**
   * Get payment token from Saman
   */
  private async getPaymentToken(
    request: SamanPaymentRequest
  ): Promise<SamanPaymentResponse> {
    try {
      const tokenUrl = this.config.sandbox
        ? "https://sep.shaparak.ir/payments/referencepayment.asmx/RequestToken"
        : "https://sep.shaparak.ir/payments/referencepayment.asmx/RequestToken";

      const formData = new FormData();
      formData.append("TerminalId", this.config.terminalId);
      formData.append("MerchantId", this.config.merchantId);
      formData.append("Amount", request.amount.toString());
      formData.append("RedirectURL", this.config.callbackUrl);
      formData.append("ResNum", request.orderId);
      formData.append("CellNumber", request.mobile || "");
      formData.append("Wage", "0"); // Service charge

      const response = await fetch(tokenUrl, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      // Parse XML response
      const tokenMatch = responseText.match(/<string[^>]*>(.*?)<\/string>/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1].trim();

        // Check if token is valid (not an error code)
        if (token && !token.startsWith("-") && token.length > 10) {
          return {
            success: true,
            token: token,
          };
        } else {
          return {
            success: false,
            errorCode: token,
            errorDesc: this.getTokenErrorMessage(token),
          };
        }
      }

      return {
        success: false,
        errorCode: "-1",
        errorDesc: "پاسخ نامعتبر از سرور",
      };
    } catch (error) {
      console.error("Saman token request error:", error);
      return {
        success: false,
        errorCode: "-1",
        errorDesc: "خطا در ارتباط با سرور",
      };
    }
  }

  /**
   * Verify payment after callback
   */
  async verifyPayment(
    userId: string,
    refNum: string,
    amount?: number
  ): Promise<{
    success: boolean;
    data?: SamanVerificationResponse & {
      wallet_transaction_id?: string;
      new_balance?: number;
    };
    error?: string;
  }> {
    try {
      // Step 1: Verify payment with Saman
      const verifyResult = await this.verifyTransaction({
        refNum: refNum,
        merchantId: this.config.merchantId,
      });

      if (!verifyResult.success) {
        return {
          success: false,
          error: verifyResult.errorDesc || this.getVerifyErrorMessage(verifyResult.errorCode || "-1"),
        };
      }

      // Step 2: Add funds to wallet
      try {
        const paymentAmount = verifyResult.amount || amount || 0;

        if (paymentAmount <= 0) {
          return {
            success: false,
            error: "مبلغ پرداخت نامعتبر است",
          };
        }

        const depositResult = await WalletService.deposit(
          userId,
          paymentAmount,
          "saman_bank",
          `شارژ کیف پول از طریق بانک سامان - کد پیگیری: ${refNum}`,
          refNum
        );

        return {
          success: true,
          data: {
            ...verifyResult,
            wallet_transaction_id: depositResult.transactionId,
            new_balance: depositResult.newBalance,
          },
        };
      } catch (walletError) {
        console.error("Wallet deposit error:", walletError);
        return {
          success: false,
          error: "پرداخت موفق بود اما خطا در شارژ کیف پول رخ داد. با پشتیبانی تماس بگیرید.",
        };
      }
    } catch (error) {
      console.error("Saman payment verification error:", error);
      return {
        success: false,
        error: "خطا در تأیید پرداخت",
      };
    }
  }

  /**
   * Verify transaction with Saman
   */
  private async verifyTransaction(
    request: SamanVerificationRequest
  ): Promise<SamanVerificationResponse> {
    try {
      const formData = new FormData();
      formData.append("RefNum", request.refNum);
      formData.append("MerchantId", request.merchantId);

      const response = await fetch(this.verifyUrl, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      // Parse XML response
      const resultMatch = responseText.match(/<string[^>]*>(.*?)<\/string>/);
      if (resultMatch && resultMatch[1]) {
        const result = resultMatch[1].trim();

        // Check if result is positive (successful verification)
        const amount = parseFloat(result);
        if (amount > 0) {
          return {
            success: true,
            amount: amount,
            refNum: request.refNum,
          };
        } else {
          return {
            success: false,
            errorCode: result,
            errorDesc: this.getVerifyErrorMessage(result),
          };
        }
      }

      return {
        success: false,
        errorCode: "-1",
        errorDesc: "پاسخ نامعتبر از سرور",
      };
    } catch (error) {
      console.error("Saman verify transaction error:", error);
      return {
        success: false,
        errorCode: "-1",
        errorDesc: "خطا در ارتباط با سرور",
      };
    }
  }

  /**
   * Reverse payment
   */
  async reversePayment(
    request: SamanReverseRequest
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append("RefNum", request.refNum);
      formData.append("MerchantId", request.merchantId);
      formData.append("Mid", request.mid);
      formData.append("Tid", request.tid);
      formData.append("OrginalAmount", request.orderId); // Note: Saman uses this field for order ID

      const response = await fetch(this.reverseUrl, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      // Parse XML response
      const resultMatch = responseText.match(/<string[^>]*>(.*?)<\/string>/);
      if (resultMatch && resultMatch[1]) {
        const result = resultMatch[1].trim();

        if (result === "1") {
          return {
            success: true,
            data: { result: "1", message: "برگشت تراکنش با موفقیت انجام شد" },
          };
        } else {
          return {
            success: false,
            error: this.getReverseErrorMessage(result),
          };
        }
      }

      return {
        success: false,
        error: "پاسخ نامعتبر از سرور",
      };
    } catch (error) {
      console.error("Saman reverse payment error:", error);
      return {
        success: false,
        error: "خطا در برگشت تراکنش",
      };
    }
  }

  /**
   * Get token request error message
   */
  private getTokenErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      "-1": "خطای سیستم",
      "-3": "ترمینال غیرفعال می‌باشد",
      "-4": "مبلغ تراکنش از حد مجاز بیشتر است",
      "-5": "تاریخ تراکنش نامعتبر است",
      "-6": "شماره تراکنش تکراری است",
      "-7": "مرجع تراکنش نامعتبر است",
      "-8": "طول رشته‌های ورودی بیشتر از حد مجاز است",
      "-9": "وجود کاراکترهای غیرمجاز در رشته‌های ورودی",
      "-10": "رشته عبور ترمینال پوز صحیح نمی‌باشد",
      "-11": "درخواست تکراری",
      "-12": "اطلاعات پذیرنده صحیح نمی‌باشد",
      "-13": "مبلغ کمتر از حداقل مجاز",
      "-14": "شماره تراکنش نامعتبر است",
      "-15": "مبلغ تراکنش نامعتبر است",
      "-16": "اطلاعات اولیه پذیرنده ناقص است",
      "-17": "شناسه پرداخت نامعتبر است",
      "-18": "IP آدرس پذیرنده نامعتبر است",
    };

    return errorMessages[code] || `خطای نامشخص: ${code}`;
  }

  /**
   * Get verify error message
   */
  private getVerifyErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      "-1": "خطای سیستم",
      "-2": "تراکنش قبلاً Reverse شده است",
      "-3": "مجموع مبلغ Reverse ها بیشتر از مبلغ تراکنش اصلی است",
      "-4": "تعداد دفعات Reverse بیشتر از حد مجاز است",
      "-5": "مهلت زمانی Reverse گذشته است",
      "-6": "تراکنش Reverse نشده است",
      "-7": "رسید دیجیتالی تهی است",
      "-8": "رسید دیجیتالی به صورت Base64 نیست",
      "-9": "طول رسید دیجیتالی بیش از حد مجاز است",
      "0": "تراکنش یافت نشد",
    };

    return errorMessages[code] || `خطای تأیید پرداخت: ${code}`;
  }

  /**
   * Get reverse error message
   */
  private getReverseErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      "-1": "خطای سیستم",
      "-2": "تراکنش قبلاً Reverse شده است",
      "-3": "مجموع مبلغ Reverse ها بیشتر از مبلغ تراکنش اصلی است",
      "-4": "تعداد دفعات Reverse بیشتر از حد مجاز است",
      "-5": "مهلت زمانی Reverse گذشته است",
      "0": "تراکنش یافت نشد",
    };

    return errorMessages[code] || `خطای برگشت تراکنش: ${code}`;
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number): string {
    return amount.toLocaleString("fa-IR");
  }

  /**
   * Generate order ID for Saman
   */
  static generateOrderId(): string {
    return Date.now().toString();
  }

  /**
   * Validate Saman merchant ID
   */
  static validateMerchantId(merchantId: string): boolean {
    return /^\d{10,15}$/.test(merchantId);
  }

  /**
   * Validate Saman terminal ID
   */
  static validateTerminalId(terminalId: string): boolean {
    return /^\d{8}$/.test(terminalId);
  }

  /**
   * Parse callback parameters from Saman
   */
  static parseCallbackParams(params: URLSearchParams): {
    state?: string;
    status?: string;
    rrn?: string;
    refNum?: string;
    resNum?: string;
    mid?: string;
    wage?: string;
    traceNo?: string;
    securePan?: string;
    hashedCardPan?: string;
  } | null {
    try {
      const state = params.get('State');
      const status = params.get('Status');
      const rrn = params.get('RRN');
      const refNum = params.get('RefNum');
      const resNum = params.get('ResNum');
      const mid = params.get('MID');
      const wage = params.get('Wage');
      const traceNo = params.get('TraceNo');
      const securePan = params.get('SecurePan');
      const hashedCardPan = params.get('HashedCardPan');

      return {
        state: state || undefined,
        status: status || undefined,
        rrn: rrn || undefined,
        refNum: refNum || undefined,
        resNum: resNum || undefined,
        mid: mid || undefined,
        wage: wage || undefined,
        traceNo: traceNo || undefined,
        securePan: securePan || undefined,
        hashedCardPan: hashedCardPan || undefined,
      };
    } catch (error) {
      console.error("Error parsing Saman callback params:", error);
      return null;
    }
  }

  /**
   * Check if callback indicates success
   */
  static isCallbackSuccessful(params: URLSearchParams): boolean {
    const state = params.get('State');
    const refNum = params.get('RefNum');

    // Successful callback should have State="OK" and RefNum should exist
    return state === 'OK' && refNum && refNum.length > 0;
  }

  /**
   * Get callback error message
   */
  static getCallbackErrorMessage(params: URLSearchParams): string | null {
    const state = params.get('State');

    if (state === 'OK') {
      return null;
    }

    const stateMessages: Record<string, string> = {
      'CanceledByUser': 'تراکنش توسط کاربر لغو شد',
      'InvalidParameters': 'پارامترهای ارسالی نامعتبر است',
      'OrderIdNotFound': 'سفارش یافت نشد',
      'InvalidAmount': 'مبلغ نامعتبر است',
      'DuplicateOrderId': 'شماره سفارش تکراری است',
      'Failed': 'تراکنش ناموفق',
    };

    return stateMessages[state || ''] || `خطای نامشخص: ${state}`;
  }

  /**
   * Create payment metadata with Saman specific data
   */
  static createPaymentMetadata(additionalData?: Record<string, any>): Record<string, any> {
    const metadata: Record<string, any> = {
      gateway: 'saman_bank',
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
   * Validate Iranian mobile number for Saman
   */
  static validateMobile(mobile: string): boolean {
    const mobilePattern = /^(\+98|0)?9[0-9]{9}$/;
    return mobilePattern.test(mobile.replace(/\s/g, ""));
  }

  /**
   * Format Iranian mobile number for Saman API
   */
  static formatMobile(mobile: string): string {
    const cleaned = mobile.replace(/\D/g, "");

    if (cleaned.startsWith("98") && cleaned.length === 12) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith("0") && cleaned.length === 11) {
      return cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith("9")) {
      return `0${cleaned}`;
    }

    return mobile;
  }

  /**
   * Get payment status message in Persian
   */
  static getPaymentStatusMessage(isSuccessful: boolean, errorCode?: string): string {
    if (isSuccessful) {
      return "پرداخت با موفقیت انجام شد و مبلغ به کیف پول شما اضافه گردید";
    }

    if (errorCode) {
      const errorMessages: Record<string, string> = {
        'CanceledByUser': 'پرداخت توسط کاربر لغو شد',
        'InvalidParameters': 'پارامترهای پرداخت نامعتبر است',
        'OrderIdNotFound': 'سفارش یافت نشد',
        'InvalidAmount': 'مبلغ پرداخت نامعتبر است',
        'DuplicateOrderId': 'شماره سفارش تکراری است',
        'Failed': 'پرداخت ناموفق بود',
        'VERIFICATION_FAILED': 'تأیید پرداخت ناموفق بود',
        'NETWORK_ERROR': 'خطا در اتصال به شبکه',
        'GATEWAY_ERROR': 'خطا در درگاه پرداخت',
      };

      return errorMessages[errorCode] || 'خطای نامشخص در پرداخت';
    }

    return 'خطا در پرداخت';
  }

  /**
   * Check if amount is valid for Saman Bank
   */
  static isValidAmount(amount: number): boolean {
    return amount >= 1000 && amount <= 100000000; // 100 Toman to 10M Toman
  }

  /**
   * Get minimum payment amount for Saman Bank
   */
  static getMinimumAmount(): number {
    return 1000; // 1000 IRR (100 Toman)
  }

  /**
   * Get maximum payment amount for Saman Bank
   */
  static getMaximumAmount(): number {
    return 100000000; // 100M IRR (10M Toman)
  }
}

// Export default instance factory
export const createSamanBankService = (config: SamanBankConfig) => {
  return new SamanBankService(config);
};
