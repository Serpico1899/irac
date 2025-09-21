import { WalletService } from "../wallet/service.ts";

export interface MellatBankConfig {
  terminalId: string;
  username: string;
  password: string;
  sandbox?: boolean;
  callbackUrl: string;
}

export interface MellatPaymentRequest {
  amount: number;
  orderId: string;
  localDate: string;
  localTime: string;
  additionalData?: string;
  callBackUrl?: string;
  payerId?: string;
}

export interface MellatPaymentResponse {
  resCode: string;
  refId?: string;
}

export interface MellatVerificationRequest {
  orderId: string;
  saleOrderId: number;
  saleReferenceId: number;
}

export interface MellatVerificationResponse {
  resCode: string;
  refId?: string;
  saleReferenceId?: number;
  cardHolderInfo?: string;
  cardHolderPan?: string;
}

export interface MellatSettleRequest {
  orderId: string;
  saleOrderId: number;
  saleReferenceId: number;
}

export interface MellatRefundRequest {
  orderId: string;
  saleOrderId: number;
  saleReferenceId: number;
  amount: number;
}

export class MellatBankService {
  private config: MellatBankConfig;
  private baseUrl: string;

  constructor(config: MellatBankConfig) {
    this.config = config;
    this.baseUrl = config.sandbox
      ? "https://bpm.shaparak.ir/pgwchannel/services/pgwtest"
      : "https://bpm.shaparak.ir/pgwchannel/services/pgw";
  }

  /**
   * Create payment request
   */
  async createPaymentRequest(
    userId: string,
    request: MellatPaymentRequest
  ): Promise<{
    success: boolean;
    data?: MellatPaymentResponse & { payment_url?: string };
    error?: string;
  }> {
    try {
      // Validate amount (minimum 1000 IRR for Mellat)
      if (request.amount < 1000) {
        return {
          success: false,
          error: "حداقل مبلغ قابل پرداخت 1000 تومان می‌باشد",
        };
      }

      // Prepare SOAP request
      const soapBody = this.createPaymentRequestSoap({
        terminalId: parseInt(this.config.terminalId),
        userName: this.config.username,
        userPassword: this.config.password,
        orderId: parseInt(request.orderId),
        amount: request.amount,
        localDate: request.localDate,
        localTime: request.localTime,
        additionalData: request.additionalData || "",
        callBackUrl: request.callBackUrl || this.config.callbackUrl,
        payerId: parseInt(request.payerId || "0"),
      });

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "",
        },
        body: soapBody,
      });

      const responseText = await response.text();
      const result = this.parsePaymentResponse(responseText);

      if (result.resCode === "0" && result.refId) {
        // Success - create payment URL
        const paymentUrl = this.config.sandbox
          ? `https://bpm.shaparak.ir/pgwchannel/startpay.mellat?RefId=${result.refId}`
          : `https://bpm.shaparak.ir/pgwchannel/startpay.mellat?RefId=${result.refId}`;

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
          error: this.getErrorMessage(result.resCode),
        };
      }
    } catch (error) {
      console.error("Mellat payment request error:", error);
      return {
        success: false,
        error: "خطا در اتصال به درگاه پرداخت بانک ملت",
      };
    }
  }

  /**
   * Verify payment after callback
   */
  async verifyPayment(
    userId: string,
    request: MellatVerificationRequest
  ): Promise<{
    success: boolean;
    data?: MellatVerificationResponse & {
      wallet_transaction_id?: string;
      new_balance?: number;
    };
    error?: string;
  }> {
    try {
      // Step 1: Verify payment
      const verifyResult = await this.verifyTransaction(request);

      if (verifyResult.resCode !== "0") {
        return {
          success: false,
          error: this.getErrorMessage(verifyResult.resCode),
        };
      }

      // Step 2: Settle payment (required for Mellat Bank)
      const settleResult = await this.settlePayment({
        orderId: request.orderId,
        saleOrderId: request.saleOrderId,
        saleReferenceId: request.saleReferenceId,
      });

      if (settleResult.resCode !== "0") {
        // Try to reverse the transaction
        await this.reversePayment({
          orderId: request.orderId,
          saleOrderId: request.saleOrderId,
          saleReferenceId: request.saleReferenceId,
        });

        return {
          success: false,
          error: this.getErrorMessage(settleResult.resCode),
        };
      }

      // Step 3: Add funds to wallet
      try {
        // Extract amount from order ID (you might need to adjust this based on your order system)
        const orderAmount = await this.getOrderAmount(request.orderId);

        const depositResult = await WalletService.deposit(
          userId,
          orderAmount,
          "mellat_bank",
          `شارژ کیف پول از طریق بانک ملت - کد پیگیری: ${request.saleReferenceId}`,
          request.saleReferenceId.toString()
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
      console.error("Mellat payment verification error:", error);
      return {
        success: false,
        error: "خطا در تأیید پرداخت",
      };
    }
  }

  /**
   * Verify transaction (first step)
   */
  private async verifyTransaction(
    request: MellatVerificationRequest
  ): Promise<MellatVerificationResponse> {
    const soapBody = this.createVerifyRequestSoap({
      terminalId: parseInt(this.config.terminalId),
      userName: this.config.username,
      userPassword: this.config.password,
      orderId: parseInt(request.orderId),
      saleOrderId: request.saleOrderId,
      saleReferenceId: request.saleReferenceId,
    });

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "",
      },
      body: soapBody,
    });

    const responseText = await response.text();
    return this.parseVerifyResponse(responseText);
  }

  /**
   * Settle payment (second step - required)
   */
  private async settlePayment(
    request: MellatSettleRequest
  ): Promise<{ resCode: string }> {
    const soapBody = this.createSettleRequestSoap({
      terminalId: parseInt(this.config.terminalId),
      userName: this.config.username,
      userPassword: this.config.password,
      orderId: parseInt(request.orderId),
      saleOrderId: request.saleOrderId,
      saleReferenceId: request.saleReferenceId,
    });

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "",
      },
      body: soapBody,
    });

    const responseText = await response.text();
    return this.parseSettleResponse(responseText);
  }

  /**
   * Reverse payment (in case of settle failure)
   */
  private async reversePayment(
    request: MellatSettleRequest
  ): Promise<{ resCode: string }> {
    const soapBody = this.createReverseRequestSoap({
      terminalId: parseInt(this.config.terminalId),
      userName: this.config.username,
      userPassword: this.config.password,
      orderId: parseInt(request.orderId),
      saleOrderId: request.saleOrderId,
      saleReferenceId: request.saleReferenceId,
    });

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "",
        },
        body: soapBody,
      });

      const responseText = await response.text();
      return this.parseReverseResponse(responseText);
    } catch (error) {
      console.error("Mellat reverse payment error:", error);
      return { resCode: "-1" };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(
    request: MellatRefundRequest,
    reason?: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const soapBody = this.createRefundRequestSoap({
        terminalId: parseInt(this.config.terminalId),
        userName: this.config.username,
        userPassword: this.config.password,
        orderId: parseInt(request.orderId),
        saleOrderId: request.saleOrderId,
        saleReferenceId: request.saleReferenceId,
        amount: request.amount,
      });

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "",
        },
        body: soapBody,
      });

      const responseText = await response.text();
      const result = this.parseRefundResponse(responseText);

      return {
        success: result.resCode === "0",
        data: result,
        error: result.resCode !== "0" ? this.getErrorMessage(result.resCode) : undefined,
      };
    } catch (error) {
      console.error("Mellat refund error:", error);
      return {
        success: false,
        error: "خطا در برگشت وجه",
      };
    }
  }

  /**
   * Create SOAP request for payment
   */
  private createPaymentRequestSoap(params: {
    terminalId: number;
    userName: string;
    userPassword: string;
    orderId: number;
    amount: number;
    localDate: string;
    localTime: string;
    additionalData: string;
    callBackUrl: string;
    payerId: number;
  }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://interfaces.core.sw.bps.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <int:bpPayRequest>
         <terminalId>${params.terminalId}</terminalId>
         <userName>${params.userName}</userName>
         <userPassword>${params.userPassword}</userPassword>
         <orderId>${params.orderId}</orderId>
         <amount>${params.amount}</amount>
         <localDate>${params.localDate}</localDate>
         <localTime>${params.localTime}</localTime>
         <additionalData>${params.additionalData}</additionalData>
         <callBackUrl>${params.callBackUrl}</callBackUrl>
         <payerId>${params.payerId}</payerId>
      </int:bpPayRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Create SOAP request for verification
   */
  private createVerifyRequestSoap(params: {
    terminalId: number;
    userName: string;
    userPassword: string;
    orderId: number;
    saleOrderId: number;
    saleReferenceId: number;
  }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://interfaces.core.sw.bps.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <int:bpVerifyRequest>
         <terminalId>${params.terminalId}</terminalId>
         <userName>${params.userName}</userName>
         <userPassword>${params.userPassword}</userPassword>
         <orderId>${params.orderId}</orderId>
         <saleOrderId>${params.saleOrderId}</saleOrderId>
         <saleReferenceId>${params.saleReferenceId}</saleReferenceId>
      </int:bpVerifyRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Create SOAP request for settlement
   */
  private createSettleRequestSoap(params: {
    terminalId: number;
    userName: string;
    userPassword: string;
    orderId: number;
    saleOrderId: number;
    saleReferenceId: number;
  }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://interfaces.core.sw.bps.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <int:bpSettleRequest>
         <terminalId>${params.terminalId}</terminalId>
         <userName>${params.userName}</userName>
         <userPassword>${params.userPassword}</userPassword>
         <orderId>${params.orderId}</orderId>
         <saleOrderId>${params.saleOrderId}</saleOrderId>
         <saleReferenceId>${params.saleReferenceId}</saleReferenceId>
      </int:bpSettleRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Create SOAP request for reverse
   */
  private createReverseRequestSoap(params: {
    terminalId: number;
    userName: string;
    userPassword: string;
    orderId: number;
    saleOrderId: number;
    saleReferenceId: number;
  }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://interfaces.core.sw.bps.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <int:bpReversalRequest>
         <terminalId>${params.terminalId}</terminalId>
         <userName>${params.userName}</userName>
         <userPassword>${params.userPassword}</userPassword>
         <orderId>${params.orderId}</orderId>
         <saleOrderId>${params.saleOrderId}</saleOrderId>
         <saleReferenceId>${params.saleReferenceId}</saleReferenceId>
      </int:bpReversalRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Create SOAP request for refund
   */
  private createRefundRequestSoap(params: {
    terminalId: number;
    userName: string;
    userPassword: string;
    orderId: number;
    saleOrderId: number;
    saleReferenceId: number;
    amount: number;
  }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://interfaces.core.sw.bps.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <int:bpRefundRequest>
         <terminalId>${params.terminalId}</terminalId>
         <userName>${params.userName}</userName>
         <userPassword>${params.userPassword}</userPassword>
         <orderId>${params.orderId}</orderId>
         <saleOrderId>${params.saleOrderId}</saleOrderId>
         <saleReferenceId>${params.saleReferenceId}</saleReferenceId>
         <amount>${params.amount}</amount>
      </int:bpRefundRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Parse payment response
   */
  private parsePaymentResponse(xml: string): MellatPaymentResponse {
    try {
      // Extract response from SOAP XML
      const responseMatch = xml.match(/<return>(.*?)<\/return>/);
      if (responseMatch && responseMatch[1]) {
        const responseData = responseMatch[1].trim();

        if (responseData.includes(',')) {
          const [resCode, refId] = responseData.split(',');
          return { resCode: resCode.trim(), refId: refId.trim() };
        } else {
          return { resCode: responseData };
        }
      }

      return { resCode: "-1" };
    } catch (error) {
      console.error("Error parsing payment response:", error);
      return { resCode: "-1" };
    }
  }

  /**
   * Parse verify response
   */
  private parseVerifyResponse(xml: string): MellatVerificationResponse {
    try {
      const responseMatch = xml.match(/<return>(.*?)<\/return>/);
      if (responseMatch && responseMatch[1]) {
        const responseData = responseMatch[1].trim();
        return { resCode: responseData };
      }

      return { resCode: "-1" };
    } catch (error) {
      console.error("Error parsing verify response:", error);
      return { resCode: "-1" };
    }
  }

  /**
   * Parse settle response
   */
  private parseSettleResponse(xml: string): { resCode: string } {
    try {
      const responseMatch = xml.match(/<return>(.*?)<\/return>/);
      if (responseMatch && responseMatch[1]) {
        return { resCode: responseMatch[1].trim() };
      }

      return { resCode: "-1" };
    } catch (error) {
      console.error("Error parsing settle response:", error);
      return { resCode: "-1" };
    }
  }

  /**
   * Parse reverse response
   */
  private parseReverseResponse(xml: string): { resCode: string } {
    try {
      const responseMatch = xml.match(/<return>(.*?)<\/return>/);
      if (responseMatch && responseMatch[1]) {
        return { resCode: responseMatch[1].trim() };
      }

      return { resCode: "-1" };
    } catch (error) {
      console.error("Error parsing reverse response:", error);
      return { resCode: "-1" };
    }
  }

  /**
   * Parse refund response
   */
  private parseRefundResponse(xml: string): { resCode: string } {
    try {
      const responseMatch = xml.match(/<return>(.*?)<\/return>/);
      if (responseMatch && responseMatch[1]) {
        return { resCode: responseMatch[1].trim() };
      }

      return { resCode: "-1" };
    } catch (error) {
      console.error("Error parsing refund response:", error);
      return { resCode: "-1" };
    }
  }

  /**
   * Get order amount from order ID (placeholder - implement based on your order system)
   */
  private async getOrderAmount(orderId: string): Promise<number> {
    // This should query your order system to get the amount
    // For now, returning a default amount - you'll need to implement this
    return 10000; // placeholder
  }

  /**
   * Get error message for Mellat error codes
   */
  private getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      "0": "تراکنش با موفقیت انجام شد",
      "11": "شماره کارت نامعتبر است",
      "12": "موجودی کافی نیست",
      "13": "رمز نادرست است",
      "14": "تعداد دفعات وارد کردن رمز بیش از حد مجاز است",
      "15": "کارت نامعتبر است",
      "16": "دفعات برداشت وجه بیش از حد مجاز است",
      "17": "کاربر از انجام تراکنش منصرف شده است",
      "18": "تاریخ انقضای کارت گذشته است",
      "19": "مبلغ برداشت وجه بیش از حد مجاز است",
      "111": "صادر کننده کارت نامعتبر است",
      "112": "خطای سوییچ صادر کننده کارت",
      "113": "پاسخی از صادر کننده کارت دریافت نشد",
      "114": "دارنده کارت مجاز به انجام این تراکنش نیست",
      "21": "پذیرنده نامعتبر است",
      "23": "خطای امنیتی رخ داده است",
      "24": "اطلاعات کاربری پذیرنده نامعتبر است",
      "25": "مبلغ نامعتبر است",
      "31": "پاسخ نامعتبر است",
      "32": "فرمت اطلاعات وارد شده صحیح نمی‌باشد",
      "33": "حساب نامعتبر است",
      "34": "خطای سیستمی",
      "35": "تاریخ نامعتبر است",
      "41": "شماره درخواست تکراری است",
      "42": "تراکنش Sale یافت نشد",
      "43": "قبلاً درخواست Verify داده شده است",
      "44": "درخواست Verify یافت نشد",
      "45": "تراکنش Settle شده است",
      "46": "تراکنش Settle نشده است",
      "47": "تراکنش Settle یافت نشد",
      "48": "تراکنش Reverse شده است",
      "49": "تراکنش Refund یافت نشد",
      "412": "شناسه قبض نادرست است",
      "413": "شناسه پرداخت نادرست است",
      "414": "سازمان صادر کننده قبض نامعتبر است",
      "415": "زمان جلسه کاری به پایان رسیده است",
      "416": "خطا در ثبت اطلاعات",
      "417": "شناسه پرداخت کننده نامعتبر است",
      "418": "اشکال در تعریف اطلاعات مشتری",
      "419": "تعداد دفعات ورود اطلاعات از حد مجاز گذشته است",
      "421": "IP نامعتبر است",
      "51": "تراکنش تکراری است",
      "54": "تراکنش مرجع موجود نیست",
      "55": "تراکنش نامعتبر است",
      "61": "خطا در واریز",
    };

    return errorMessages[code] || `خطای نامشخص: ${code}`;
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number): string {
    return amount.toLocaleString("fa-IR");
  }

  /**
   * Generate order ID for Mellat (must be numeric)
   */
  static generateOrderId(): string {
    return Date.now().toString();
  }

  /**
   * Get current date in Mellat format (YYYYMMDD)
   */
  static getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Get current time in Mellat format (HHMMSS)
   */
  static getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
  }

  /**
   * Validate Mellat terminal ID
   */
  static validateTerminalId(terminalId: string): boolean {
    return /^\d{1,8}$/.test(terminalId);
  }

  /**
   * Parse callback parameters from Mellat
   */
  static parseCallbackParams(params: URLSearchParams): {
    resCode?: string;
    saleOrderId?: number;
    saleReferenceId?: number;
    refId?: string;
    cardHolderPan?: string;
  } | null {
    try {
      const resCode = params.get('ResCode');
      const saleOrderId = params.get('SaleOrderId');
      const saleReferenceId = params.get('SaleReferenceId');
      const refId = params.get('RefId');
      const cardHolderPan = params.get('CardHolderPan');

      if (!resCode || !saleOrderId || !saleReferenceId) {
        return null;
      }

      return {
        resCode,
        saleOrderId: parseInt(saleOrderId),
        saleReferenceId: parseInt(saleReferenceId),
        refId: refId || undefined,
        cardHolderPan: cardHolderPan || undefined,
      };
    } catch (error) {
      console.error("Error parsing Mellat callback params:", error);
      return null;
    }
  }
}

// Export default instance factory
export const createMellatBankService = (config: MellatBankConfig) => {
  return new MellatBankService(config);
};
