import { v4 } from "https://deno.land/std@0.208.0/uuid/mod.ts";

export interface SMSConfig {
  provider: "kavenegar" | "sms_ir" | "mock";
  api_key: string;
  sender?: string;
  base_url?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
  template_id?: string;
  params?: Record<string, string>;
}

export interface SMSResponse {
  success: boolean;
  message_id?: string;
  status?: string;
  cost?: number;
  error?: string;
  provider_response?: any;
}

export interface PaymentSMSData {
  user_name?: string;
  amount: number;
  transaction_id: string;
  ref_id?: string;
  status: "success" | "failed" | "pending";
  balance?: number;
}

export class SMSService {
  private config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  /**
   * Send SMS message
   */
  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    try {
      // Validate mobile number
      if (!this.validateIranianMobile(message.to)) {
        return {
          success: false,
          error: "شماره موبایل نامعتبر است",
        };
      }

      // Format mobile number
      const formattedMobile = this.formatMobile(message.to);

      switch (this.config.provider) {
        case "kavenegar":
          return await this.sendKavenegarSMS(formattedMobile, message);
        case "sms_ir":
          return await this.sendSMSIrSMS(formattedMobile, message);
        case "mock":
          return await this.sendMockSMS(formattedMobile, message);
        default:
          return {
            success: false,
            error: "ارائه‌دهنده SMS پشتیبانی نمی‌شود",
          };
      }
    } catch (error) {
      console.error("SMS send error:", error);
      return {
        success: false,
        error: "خطا در ارسال پیامک",
      };
    }
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmation(
    mobile: string,
    paymentData: PaymentSMSData
  ): Promise<SMSResponse> {
    const message = this.generatePaymentMessage(paymentData);

    return await this.sendSMS({
      to: mobile,
      message,
      template_id: "payment_confirmation",
      params: {
        amount: paymentData.amount.toLocaleString("fa-IR"),
        transaction_id: paymentData.transaction_id,
        ref_id: paymentData.ref_id || "",
        status: paymentData.status,
      },
    });
  }

  /**
   * Send payment verification code SMS
   */
  async sendPaymentVerificationCode(
    mobile: string,
    code: string,
    amount: number
  ): Promise<SMSResponse> {
    const message = `کد تأیید پرداخت ${amount.toLocaleString("fa-IR")} تومان: ${code}
این کد تا 5 دقیقه معتبر است.
مرکز معماری ایرانی`;

    return await this.sendSMS({
      to: mobile,
      message,
      template_id: "payment_verification",
      params: {
        code,
        amount: amount.toLocaleString("fa-IR"),
      },
    });
  }

  /**
   * Send wallet charge notification SMS
   */
  async sendWalletChargeNotification(
    mobile: string,
    amount: number,
    newBalance: number,
    transactionId: string
  ): Promise<SMSResponse> {
    const message = `کیف پول شما ${amount.toLocaleString("fa-IR")} تومان شارژ شد.
موجودی جدید: ${newBalance.toLocaleString("fa-IR")} تومان
کد تراکنش: ${transactionId}
مرکز معماری ایرانی`;

    return await this.sendSMS({
      to: mobile,
      message,
      template_id: "wallet_charge",
      params: {
        amount: amount.toLocaleString("fa-IR"),
        balance: newBalance.toLocaleString("fa-IR"),
        transaction_id: transactionId,
      },
    });
  }

  /**
   * Send Kavenegar SMS
   */
  private async sendKavenegarSMS(
    mobile: string,
    message: SMSMessage
  ): Promise<SMSResponse> {
    try {
      const url = `https://api.kavenegar.com/v1/${this.config.api_key}/sms/send.json`;

      const formData = new FormData();
      formData.append("receptor", mobile);
      formData.append("message", message.message);

      if (this.config.sender) {
        formData.append("sender", this.config.sender);
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.return?.status === 200) {
        return {
          success: true,
          message_id: result.entries?.[0]?.messageid?.toString(),
          status: result.entries?.[0]?.status?.toString(),
          cost: result.entries?.[0]?.cost,
          provider_response: result,
        };
      } else {
        return {
          success: false,
          error: this.getKavenegarError(result.return?.status) || "خطا در ارسال پیامک",
          provider_response: result,
        };
      }
    } catch (error) {
      console.error("Kavenegar SMS error:", error);
      return {
        success: false,
        error: "خطا در اتصال به سرویس پیامک",
      };
    }
  }

  /**
   * Send SMS.ir SMS
   */
  private async sendSMSIrSMS(
    mobile: string,
    message: SMSMessage
  ): Promise<SMSResponse> {
    try {
      const url = "https://ws.sms.ir/api/MessageSend";

      const requestBody = {
        Messages: [message.message],
        MobileNumbers: [mobile],
        LineNumber: this.config.sender,
        SendDateTime: "",
        CanContinueInCaseOfError: true,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sms-ir-secure-token": this.config.api_key,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.IsSuccessful) {
        return {
          success: true,
          message_id: result.MessageIds?.[0]?.toString(),
          provider_response: result,
        };
      } else {
        return {
          success: false,
          error: result.Message || "خطا در ارسال پیامک",
          provider_response: result,
        };
      }
    } catch (error) {
      console.error("SMS.ir SMS error:", error);
      return {
        success: false,
        error: "خطا در اتصال به سرویس پیامک",
      };
    }
  }

  /**
   * Send mock SMS (for development/testing)
   */
  private async sendMockSMS(
    mobile: string,
    message: SMSMessage
  ): Promise<SMSResponse> {
    console.log("=== MOCK SMS ===");
    console.log(`To: ${mobile}`);
    console.log(`Message: ${message.message}`);
    console.log("================");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message_id: `mock_${v4.generate()}`,
      status: "sent",
      cost: 0,
    };
  }

  /**
   * Generate payment message based on status
   */
  private generatePaymentMessage(data: PaymentSMSData): string {
    const { user_name, amount, transaction_id, ref_id, status, balance } = data;
    const formattedAmount = amount.toLocaleString("fa-IR");
    const greeting = user_name ? ` ${user_name} عزیز` : "";

    switch (status) {
      case "success":
        return `${greeting}
پرداخت ${formattedAmount} تومان با موفقیت انجام شد.
${ref_id ? `کد پیگیری: ${ref_id}` : `شناسه تراکنش: ${transaction_id}`}
${balance ? `موجودی جدید: ${balance.toLocaleString("fa-IR")} تومان` : ""}
مرکز معماری ایرانی`;

      case "failed":
        return `${greeting}
پرداخت ${formattedAmount} تومان ناموفق بود.
شناسه تراکنش: ${transaction_id}
لطفاً مجدد تلاش کنید یا با پشتیبانی تماس بگیرید.
مرکز معماری ایرانی`;

      case "pending":
        return `${greeting}
پرداخت ${formattedAmount} تومان در حال بررسی است.
شناسه تراکنش: ${transaction_id}
نتیجه تا چند دقیقه دیگر اعلام خواهد شد.
مرکز معماری ایرانی`;

      default:
        return `${greeting}
وضعیت پرداخت ${formattedAmount} تومان به‌روزرسانی شد.
شناسه تراکنش: ${transaction_id}
مرکز معماری ایرانی`;
    }
  }

  /**
   * Validate Iranian mobile number
   */
  private validateIranianMobile(mobile: string): boolean {
    const mobilePattern = /^(\+98|0)?9[0-9]{9}$/;
    return mobilePattern.test(mobile.replace(/\s/g, ""));
  }

  /**
   * Format Iranian mobile number
   */
  private formatMobile(mobile: string): string {
    // Remove non-numeric characters
    const cleaned = mobile.replace(/\D/g, "");

    // Handle different formats
    if (cleaned.startsWith("98") && cleaned.length === 12) {
      return cleaned; // Already in international format without +
    } else if (cleaned.startsWith("0") && cleaned.length === 11) {
      return `98${cleaned.substring(1)}`;
    } else if (cleaned.length === 10 && cleaned.startsWith("9")) {
      return `98${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Get Kavenegar error message
   */
  private getKavenegarError(code: number): string {
    const errorMessages: Record<number, string> = {
      200: "پیام با موفقیت ارسال شد",
      400: "پارامترهای ارسالی کامل نیست",
      401: "کلید API نامعتبر است",
      402: "اعتبار حساب کافی نیست",
      403: "دسترسی به API محدود شده",
      404: "متد درخواستی وجود ندارد",
      405: "متد درخواستی مجاز نیست",
      406: "پارامتر ارسالی نامعتبر است",
      407: "شماره فرستنده نامعتبر است",
      409: "سرور قادر به پاسخ‌گویی نیست",
      411: "شماره موبایل نامعتبر است",
      412: "پیام خالی است",
      413: "لیست گیرندگان خالی است",
      414: "پیام طولانی‌تر از حد مجاز است",
      415: "شماره فرستنده در لیست سیاه است",
      416: "نرخ ارسال بالا است",
      417: "ارسال در این ساعت مجاز نیست",
      418: "پیام در لیست فیلتر است",
      422: "ساختار JSON نامعتبر است",
      429: "تعداد درخواست‌ها بیش از حد مجاز است",
    };

    return errorMessages[code] || `خطای ناشناخته: ${code}`;
  }

  /**
   * Generate verification code
   */
  static generateVerificationCode(length: number = 6): string {
    const digits = "0123456789";
    let code = "";

    for (let i = 0; i < length; i++) {
      code += digits[Math.floor(Math.random() * digits.length)];
    }

    return code;
  }

  /**
   * Format Iranian mobile for display
   */
  static formatMobileForDisplay(mobile: string): string {
    const cleaned = mobile.replace(/\D/g, "");

    if (cleaned.length === 11 && cleaned.startsWith("09")) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    } else if (cleaned.length === 12 && cleaned.startsWith("98")) {
      const domestic = "0" + cleaned.substring(2);
      return domestic.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    }

    return mobile;
  }

  /**
   * Check if mobile number is valid format
   */
  static isValidIranianMobile(mobile: string): boolean {
    const mobilePattern = /^(\+?98|0)?9[0-9]{9}$/;
    return mobilePattern.test(mobile.replace(/\s/g, ""));
  }

  /**
   * Get SMS cost estimation (in Iranian Rial)
   */
  static estimateSmsCost(messageLength: number, recipientCount: number = 1): number {
    // Base cost per SMS in Iranian Rial
    const baseCostPerSMS = 500; // 50 Toman = 500 Rial

    // Calculate number of SMS parts (70 chars per SMS for Persian)
    const smsCount = Math.ceil(messageLength / 70);

    return smsCount * recipientCount * baseCostPerSMS;
  }

  /**
   * Create SMS service instance from environment variables
   */
  static createFromEnv(): SMSService {
    const provider = (Deno.env.get("SMS_PROVIDER") || "mock") as SMSConfig["provider"];
    const apiKey = Deno.env.get("SMS_API_KEY") || "";
    const sender = Deno.env.get("SMS_SENDER");
    const baseUrl = Deno.env.get("SMS_BASE_URL");

    return new SMSService({
      provider,
      api_key: apiKey,
      sender,
      base_url: baseUrl,
    });
  }
}

// Export default instance
export const smsService = SMSService.createFromEnv();
