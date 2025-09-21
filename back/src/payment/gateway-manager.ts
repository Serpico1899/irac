import { ZarinPalService, ZarinPalConfig } from "./zarinpal.ts";
import { MellatBankService, MellatBankConfig } from "./mellat.ts";
import { SamanBankService, SamanBankConfig } from "./saman.ts";
import { WalletService } from "../wallet/service.ts";
import type {
  PaymentGateway,
  PaymentGatewayType,
  PaymentGatewayStatus,
  validateAmountForGateway,
  calculateGatewayFees
} from "../../models/payment_gateway.ts";
import type {
  PaymentTransaction,
  PaymentPurpose,
  PaymentMethod,
  generateTransactionId,
  createDefaultTransaction,
  updateTransactionStatus
} from "../../models/payment_transaction.ts";

export interface PaymentGatewayManagerConfig {
  zarinpal?: ZarinPalConfig;
  mellat_bank?: MellatBankConfig;
  saman_bank?: SamanBankConfig;
  default_gateway?: PaymentGatewayType;
  fallback_enabled?: boolean;
  max_retry_attempts?: number;
  health_check_interval?: number;
  load_balancing_enabled?: boolean;
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

export interface UnifiedPaymentRequest {
  user_id: string;
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
  user_id?: string;
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

export interface GatewayHealthStatus {
  gateway_type: PaymentGatewayType;
  is_healthy: boolean;
  response_time: number;
  success_rate: number;
  last_check: string;
  error_count: number;
  consecutive_failures: number;
}

export class PaymentGatewayManager {
  private config: PaymentGatewayManagerConfig;
  private gateways: Map<PaymentGatewayType, any> = new Map();
  private gatewayConfigs: Map<string, PaymentGateway> = new Map();
  private healthStatus: Map<PaymentGatewayType, GatewayHealthStatus> = new Map();
  private activeTransactions: Map<string, PaymentTransaction> = new Map();

  constructor(config: PaymentGatewayManagerConfig) {
    this.config = {
      fallback_enabled: true,
      max_retry_attempts: 3,
      health_check_interval: 300000, // 5 minutes
      load_balancing_enabled: true,
      ...config,
    };

    this.initializeGateways();
    this.startHealthMonitoring();
  }

  /**
   * Initialize payment gateways based on configuration
   */
  private initializeGateways(): void {
    try {
      // Initialize ZarinPal
      if (this.config.zarinpal) {
        this.gateways.set("zarinpal", new ZarinPalService(this.config.zarinpal));
        this.initializeGatewayHealth("zarinpal");
      }

      // Initialize Mellat Bank
      if (this.config.mellat_bank) {
        this.gateways.set("mellat_bank", new MellatBankService(this.config.mellat_bank));
        this.initializeGatewayHealth("mellat_bank");
      }

      // Initialize Saman Bank
      if (this.config.saman_bank) {
        this.gateways.set("saman_bank", new SamanBankService(this.config.saman_bank));
        this.initializeGatewayHealth("saman_bank");
      }

      // Wallet is always available (no external config needed)
      this.initializeGatewayHealth("wallet");

      console.log(`Initialized ${this.gateways.size} payment gateways`);
    } catch (error) {
      console.error("Error initializing payment gateways:", error);
    }
  }

  /**
   * Initialize health status for a gateway
   */
  private initializeGatewayHealth(gatewayType: PaymentGatewayType): void {
    this.healthStatus.set(gatewayType, {
      gateway_type: gatewayType,
      is_healthy: true,
      response_time: 0,
      success_rate: 100,
      last_check: new Date().toISOString(),
      error_count: 0,
      consecutive_failures: 0,
    });
  }

  /**
   * Start health monitoring for all gateways
   */
  private startHealthMonitoring(): void {
    if (this.config.health_check_interval && this.config.health_check_interval > 0) {
      setInterval(() => {
        this.performHealthChecks();
      }, this.config.health_check_interval);
    }
  }

  /**
   * Perform health checks on all gateways
   */
  private async performHealthChecks(): Promise<void> {
    const healthPromises = Array.from(this.gateways.keys()).map(async (gatewayType) => {
      try {
        const startTime = Date.now();
        const isHealthy = await this.checkGatewayHealth(gatewayType);
        const responseTime = Date.now() - startTime;

        const currentStatus = this.healthStatus.get(gatewayType);
        if (currentStatus) {
          this.healthStatus.set(gatewayType, {
            ...currentStatus,
            is_healthy: isHealthy,
            response_time: responseTime,
            last_check: new Date().toISOString(),
            consecutive_failures: isHealthy ? 0 : currentStatus.consecutive_failures + 1,
          });
        }
      } catch (error) {
        console.error(`Health check failed for ${gatewayType}:`, error);
        const currentStatus = this.healthStatus.get(gatewayType);
        if (currentStatus) {
          this.healthStatus.set(gatewayType, {
            ...currentStatus,
            is_healthy: false,
            last_check: new Date().toISOString(),
            error_count: currentStatus.error_count + 1,
            consecutive_failures: currentStatus.consecutive_failures + 1,
          });
        }
      }
    });

    await Promise.all(healthPromises);
  }

  /**
   * Check if a specific gateway is healthy
   */
  private async checkGatewayHealth(gatewayType: PaymentGatewayType): Promise<boolean> {
    try {
      switch (gatewayType) {
        case "zarinpal":
          // For ZarinPal, we can check unverified transactions as a health check
          const zarinpalService = this.gateways.get("zarinpal");
          if (zarinpalService) {
            const result = await zarinpalService.getUnverifiedTransactions();
            return result.success !== false;
          }
          return false;

        case "mellat_bank":
        case "saman_bank":
          // For bank gateways, we assume they're healthy if initialized
          // In a real implementation, you might want to make a test call
          return this.gateways.has(gatewayType);

        case "wallet":
          // Wallet is always healthy as it's internal
          return true;

        default:
          return false;
      }
    } catch (error) {
      console.error(`Health check error for ${gatewayType}:`, error);
      return false;
    }
  }

  /**
   * Get available healthy gateways
   */
  public getHealthyGateways(): PaymentGatewayType[] {
    const healthyGateways: PaymentGatewayType[] = [];

    for (const [gatewayType, status] of this.healthStatus.entries()) {
      if (status.is_healthy && this.gateways.has(gatewayType)) {
        healthyGateways.push(gatewayType);
      }
    }

    return healthyGateways;
  }

  /**
   * Select optimal gateway based on various factors
   */
  private selectOptimalGateway(
    request: UnifiedPaymentRequest,
    availableGateways: PaymentGatewayType[]
  ): PaymentGatewayType | null {
    const { options } = request;

    // Filter by user exclusions
    let candidateGateways = availableGateways.filter(
      gateway => !options?.exclude_gateways?.includes(gateway)
    );

    // Apply user preferences
    if (options?.user_preferences?.preferred_gateway) {
      const preferred = options.user_preferences.preferred_gateway;
      if (candidateGateways.includes(preferred)) {
        return preferred;
      }
    }

    // Apply priority gateways
    if (options?.priority_gateways) {
      for (const priority of options.priority_gateways) {
        if (candidateGateways.includes(priority)) {
          return priority;
        }
      }
    }

    // Apply specific gateway type request
    if (options?.gateway_type && candidateGateways.includes(options.gateway_type)) {
      return options.gateway_type;
    }

    // Load balancing logic
    if (this.config.load_balancing_enabled && candidateGateways.length > 1) {
      return this.selectGatewayByLoadBalancing(candidateGateways, request);
    }

    // Default selection (highest priority healthy gateway)
    const defaultGateway = this.config.default_gateway;
    if (defaultGateway && candidateGateways.includes(defaultGateway)) {
      return defaultGateway;
    }

    // Return first available gateway
    return candidateGateways[0] || null;
  }

  /**
   * Select gateway using load balancing algorithm
   */
  private selectGatewayByLoadBalancing(
    gateways: PaymentGatewayType[],
    request: UnifiedPaymentRequest
  ): PaymentGatewayType {
    // Sort by success rate and response time
    const sortedGateways = gateways
      .map(gateway => ({
        gateway,
        status: this.healthStatus.get(gateway)!,
      }))
      .sort((a, b) => {
        // Prioritize success rate, then response time
        const successRateDiff = b.status.success_rate - a.status.success_rate;
        if (Math.abs(successRateDiff) > 5) { // 5% difference threshold
          return successRateDiff;
        }
        return a.status.response_time - b.status.response_time;
      });

    return sortedGateways[0].gateway;
  }

  /**
   * Create unified payment request
   */
  public async createPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    const startTime = Date.now();
    let lastError: string | undefined;
    let retryCount = 0;
    const maxRetries = request.options?.max_retries ?? this.config.max_retry_attempts ?? 3;

    // Get healthy gateways
    const healthyGateways = this.getHealthyGateways();

    if (healthyGateways.length === 0) {
      return {
        success: false,
        transaction_id: generateTransactionId(),
        gateway_type: "zarinpal", // fallback
        gateway_id: "",
        amount: request.amount,
        final_amount: request.amount,
        gateway_fee: 0,
        error: "هیچ درگاه پرداخت فعالی در دسترس نیست",
      };
    }

    // Handle wallet payments separately
    if (request.options?.gateway_type === "wallet") {
      return await this.createWalletPayment(request);
    }

    while (retryCount <= maxRetries) {
      try {
        // Select optimal gateway
        const selectedGateway = this.selectOptimalGateway(request, healthyGateways);

        if (!selectedGateway) {
          return {
            success: false,
            transaction_id: generateTransactionId(),
            gateway_type: "zarinpal", // fallback
            gateway_id: "",
            amount: request.amount,
            final_amount: request.amount,
            gateway_fee: 0,
            error: "هیچ درگاه پرداخت مناسبی یافت نشد",
          };
        }

        // Create payment with selected gateway
        const result = await this.createGatewayPayment(request, selectedGateway);

        if (result.success) {
          // Update gateway success metrics
          this.updateGatewayMetrics(selectedGateway, true, Date.now() - startTime);

          return {
            ...result,
            fallback_used: retryCount > 0,
            retry_count: retryCount,
          };
        }

        // Update gateway failure metrics
        this.updateGatewayMetrics(selectedGateway, false, Date.now() - startTime);
        lastError = result.error;

        // Check if we should retry with fallback
        if (request.options?.allow_fallback !== false && this.config.fallback_enabled) {
          // Remove failed gateway from healthy list for next iteration
          const gatewayIndex = healthyGateways.indexOf(selectedGateway);
          if (gatewayIndex > -1) {
            healthyGateways.splice(gatewayIndex, 1);
          }

          retryCount++;

          if (healthyGateways.length === 0) {
            break; // No more gateways to try
          }
        } else {
          break; // Fallback disabled
        }

      } catch (error) {
        console.error("Payment creation error:", error);
        lastError = "خطای سیستمی در ایجاد پرداخت";
        retryCount++;
      }
    }

    // All attempts failed
    return {
      success: false,
      transaction_id: generateTransactionId(),
      gateway_type: healthyGateways[0] || "zarinpal",
      gateway_id: "",
      amount: request.amount,
      final_amount: request.amount,
      gateway_fee: 0,
      error: lastError || "تمام تلاش‌ها برای ایجاد پرداخت ناموفق بود",
      fallback_used: retryCount > 1,
      retry_count: retryCount,
    };
  }

  /**
   * Create wallet payment
   */
  private async createWalletPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    try {
      const transactionId = generateTransactionId();

      // Check wallet balance
      const balance = await WalletService.getBalance(request.user_id);

      if (balance < request.amount) {
        return {
          success: false,
          transaction_id: transactionId,
          gateway_type: "wallet",
          gateway_id: "wallet",
          amount: request.amount,
          final_amount: request.amount,
          gateway_fee: 0,
          error: "موجودی کیف پول کافی نیست",
        };
      }

      // Create transaction record
      const transaction = createDefaultTransaction(
        request.user_id,
        request.amount,
        request.purpose,
        "wallet",
        request.description
      );

      transaction.transaction_id = transactionId;
      transaction.order_id = request.order_id;
      transaction.invoice_id = request.invoice_id;
      transaction.metadata = request.metadata || {};

      // Process wallet payment
      const result = await WalletService.withdraw(
        request.user_id,
        request.amount,
        request.description,
        transactionId
      );

      if (result.success) {
        return {
          success: true,
          transaction_id: transactionId,
          gateway_type: "wallet",
          gateway_id: "wallet",
          amount: request.amount,
          final_amount: request.amount,
          gateway_fee: 0,
          message: "پرداخت با موفقیت از کیف پول انجام شد",
        };
      } else {
        return {
          success: false,
          transaction_id: transactionId,
          gateway_type: "wallet",
          gateway_id: "wallet",
          amount: request.amount,
          final_amount: request.amount,
          gateway_fee: 0,
          error: result.error || "خطا در پرداخت با کیف پول",
        };
      }

    } catch (error) {
      console.error("Wallet payment error:", error);
      return {
        success: false,
        transaction_id: generateTransactionId(),
        gateway_type: "wallet",
        gateway_id: "wallet",
        amount: request.amount,
        final_amount: request.amount,
        gateway_fee: 0,
        error: "خطای سیستمی در پرداخت با کیف پول",
      };
    }
  }

  /**
   * Create payment with specific gateway
   */
  private async createGatewayPayment(
    request: UnifiedPaymentRequest,
    gatewayType: PaymentGatewayType
  ): Promise<UnifiedPaymentResponse> {
    const transactionId = generateTransactionId();
    const gateway = this.gateways.get(gatewayType);

    if (!gateway) {
      return {
        success: false,
        transaction_id: transactionId,
        gateway_type: gatewayType,
        gateway_id: gatewayType,
        amount: request.amount,
        final_amount: request.amount,
        gateway_fee: 0,
        error: `درگاه پرداخت ${gatewayType} در دسترس نیست`,
      };
    }

    try {
      let result: any;

      switch (gatewayType) {
        case "zarinpal":
          result = await gateway.createPaymentRequest(request.user_id, {
            amount: request.amount,
            description: request.description,
            mobile: request.mobile,
            email: request.email,
            order_id: request.order_id || transactionId,
            metadata: request.metadata,
          });
          break;

        case "mellat_bank":
          result = await gateway.createPaymentRequest(request.user_id, {
            amount: request.amount,
            orderId: request.order_id || transactionId,
            localDate: MellatBankService.getCurrentDate(),
            localTime: MellatBankService.getCurrentTime(),
            additionalData: request.description,
            payerId: request.user_id,
          });
          break;

        case "saman_bank":
          result = await gateway.createPaymentRequest(request.user_id, {
            amount: request.amount,
            orderId: request.order_id || transactionId,
            description: request.description,
            mobile: request.mobile,
            email: request.email,
            nationalCode: request.national_code,
          });
          break;

        default:
          throw new Error(`Unsupported gateway type: ${gatewayType}`);
      }

      if (result.success && result.data) {
        // Store transaction for future reference
        const transaction = createDefaultTransaction(
          request.user_id,
          request.amount,
          request.purpose,
          gatewayType,
          request.description
        );

        transaction.transaction_id = transactionId;
        transaction.authority = result.data.authority || result.data.refId || result.data.token;
        transaction.order_id = request.order_id;
        transaction.invoice_id = request.invoice_id;
        transaction.metadata = request.metadata || {};

        this.activeTransactions.set(transactionId, transaction as PaymentTransaction);

        return {
          success: true,
          transaction_id: transactionId,
          gateway_type: gatewayType,
          gateway_id: gatewayType,
          payment_url: result.data.payment_url,
          authority: result.data.authority || result.data.refId || result.data.token,
          reference_id: result.data.authority || result.data.refId || result.data.token,
          amount: request.amount,
          final_amount: request.amount + (result.data.fee || 0),
          gateway_fee: result.data.fee || 0,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
          message: result.message || "درخواست پرداخت با موفقیت ایجاد شد",
        };
      } else {
        return {
          success: false,
          transaction_id: transactionId,
          gateway_type: gatewayType,
          gateway_id: gatewayType,
          amount: request.amount,
          final_amount: request.amount,
          gateway_fee: 0,
          error: result.error || "خطا در ایجاد درخواست پرداخت",
        };
      }

    } catch (error) {
      console.error(`Payment creation error for ${gatewayType}:`, error);
      return {
        success: false,
        transaction_id: transactionId,
        gateway_type: gatewayType,
        gateway_id: gatewayType,
        amount: request.amount,
        final_amount: request.amount,
        gateway_fee: 0,
        error: `خطا در ایجاد پرداخت با ${gatewayType}`,
      };
    }
  }

  /**
   * Verify unified payment
   */
  public async verifyPayment(request: UnifiedVerificationRequest): Promise<UnifiedVerificationResponse> {
    const transaction = this.activeTransactions.get(request.transaction_id);

    if (!transaction) {
      return {
        success: false,
        transaction_id: request.transaction_id,
        gateway_type: "zarinpal", // fallback
        amount: 0,
        error: "تراکنش یافت نشد",
      };
    }

    const gatewayType = transaction.payment_method;
    const gateway = this.gateways.get(gatewayType);

    if (!gateway) {
      return {
        success: false,
        transaction_id: request.transaction_id,
        gateway_type: gatewayType,
        amount: transaction.amount,
        error: `درگاه پرداخت ${gatewayType} در دسترس نیست`,
      };
    }

    try {
      let result: any;

      switch (gatewayType) {
        case "zarinpal":
          result = await gateway.verifyPayment(
            transaction.user_id,
            request.authority || transaction.authority!,
            transaction.amount
          );
          break;

        case "mellat_bank":
          const mellatParams = request.callback_params;
          result = await gateway.verifyPayment(transaction.user_id, {
            orderId: transaction.order_id!,
            saleOrderId: mellatParams?.saleOrderId || 0,
            saleReferenceId: mellatParams?.saleReferenceId || 0,
          });
          break;

        case "saman_bank":
          result = await gateway.verifyPayment(
            transaction.user_id,
            request.reference_id || transaction.authority!,
            transaction.amount
          );
          break;

        case "wallet":
          // Wallet payments are instant, no verification needed
          return {
            success: true,
            transaction_id: request.transaction_id,
            gateway_type: "wallet",
            amount: transaction.amount,
            message: "پرداخت با کیف پول تأیید شده است",
          };

        default:
          throw new Error(`Unsupported gateway type: ${gatewayType}`);
      }

      if (result.success) {
        // Update transaction status
        updateTransactionStatus(transaction, "completed");

        const response: UnifiedVerificationResponse = {
          success: true,
          transaction_id: request.transaction_id,
          gateway_type: gatewayType,
          amount: transaction.amount,
          reference_id: result.data?.ref_id?.toString() || result.data?.refNum,
          tracking_code: result.data?.ref_id?.toString() || result.data?.rrn,
          message: "پرداخت با موفقیت تأیید شد",
        };

        // Add card info if available
        if (result.data?.card_hash || result.data?.card_pan || result.data?.hashedCardPan) {
          response.card_info = {
            masked_pan: result.data.card_pan || result.data.hashedCardPan,
            hash: result.data.card_hash,
            bank_name: this.getBankNameFromPAN(result.data.card_pan),
          };
        }

        // Add wallet info if available
        if (result.data?.wallet_transaction_id) {
          response.wallet_info = {
            transaction_id: result.data.wallet_transaction_id,
            new_balance: result.data.new_balance,
          };
        }

        // Update gateway success metrics
        this.updateGatewayMetrics(gatewayType, true, 0);

        return response;
      } else {
        // Update transaction status
        updateTransactionStatus(transaction, "failed", { error: result.error });

        // Update gateway failure metrics
        this.updateGatewayMetrics(gatewayType, false, 0);

        return {
          success: false,
          transaction_id: request.transaction_id,
          gateway_type: gatewayType,
          amount: transaction.amount,
          error: result.error || "تأیید پرداخت ناموفق بود",
        };
      }

    } catch (error) {
      console.error(`Payment verification error for ${gatewayType}:`, error);

      // Update transaction status
      updateTransactionStatus(transaction, "failed", { error: error.message });

      return {
        success: false,
        transaction_id: request.transaction_id,
        gateway_type: gatewayType,
        amount: transaction.amount,
        error: "خطا در تأیید پرداخت",
      };
    }
  }

  /**
   * Update gateway performance metrics
   */
  private updateGatewayMetrics(
    gatewayType: PaymentGatewayType,
    success: boolean,
    responseTime: number
  ): void {
    const status = this.healthStatus.get(gatewayType);
    if (!status) return;

    const newErrorCount = success ? status.error_count : status.error_count + 1;
    const totalTransactions = status.success_rate > 0 ?
      Math.round((status.success_rate * 100) / status.success_rate) : 1;

    const successfulTransactions = Math.round((status.success_rate * totalTransactions) / 100);
    const newSuccessCount = success ? successfulTransactions + 1 : successfulTransactions;
    const newTotalTransactions = totalTransactions + 1;
    const newSuccessRate = (newSuccessCount / newTotalTransactions) * 100;

    // Update weighted average response time
    const newResponseTime = status.response_time === 0
      ? responseTime
      : (status.response_time * 0.7) + (responseTime * 0.3);

    this.healthStatus.set(gatewayType, {
      ...status,
      success_rate: Math.round(newSuccessRate * 100) / 100,
      response_time: Math.round(newResponseTime),
      error_count: newErrorCount,
      consecutive_failures: success ? 0 : status.consecutive_failures + 1,
      is_healthy: status.consecutive_failures < 3, // Mark unhealthy after 3 consecutive failures
    });
  }

  /**
   * Get bank name from PAN (first 6 digits)
   */
  private getBankNameFromPAN(pan?: string): string | undefined {
    if (!pan || pan.length < 6) return undefined;

    const bin = pan.substring(0, 6);
    const bankBins: Record<string, string> = {
      "627760": "پست بانک ایران",
      "622106": "بانک پارسیان",
      "627884": "بانک کارآفرین",
      "627381": "بانک انصار",
      "505785": "بانک ایران زمین",
      "627412": "بانک اقتصاد نوین",
      "622106": "بانک پارسیان",
      "627488": "بانک کارآفرین",
      "627648": "بانک توسعه تعاون",
      "627912": "بانک قوامین",
      "627381": "بانک انصار",
      // Add more BINs as needed
    };

    return bankBins[bin];
  }

  /**
   * Get gateway health status
   */
  public getGatewayHealthStatus(gatewayType?: PaymentGatewayType): GatewayHealthStatus | GatewayHealthStatus[] {
    if (gatewayType) {
      return this.healthStatus.get(gatewayType) || {
        gateway_type: gatewayType,
        is_healthy: false,
        response_time: 0,
        success_rate: 0,
        last_check: new Date().toISOString(),
        error_count: 0,
        consecutive_failures: 0,
      };
    }

    return Array.from(this.healthStatus.values());
  }

  /**
   * Get transaction status
   */
  public getTransaction(transactionId: string): PaymentTransaction | undefined {
    return this.activeTransactions.get(transactionId);
  }

  /**
   * Cancel payment
   */
  public async cancelPayment(transactionId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const transaction = this.activeTransactions.get(transactionId);

    if (!transaction) {
      return {
        success: false,
        error: "تراکنش یافت نشد",
      };
    }

    try {
      updateTransactionStatus(transaction, "cancelled");
      this.activeTransactions.delete(transactionId);

      return {
        success: true,
        message: "پرداخت با موفقیت لغو شد",
      };
    } catch (error) {
      console.error("Payment cancellation error:", error);
      return {
        success: false,
        error: "خطا در لغو پرداخت",
      };
    }
  }

  /**
   * Refund payment
   */
  public async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<{
    success: boolean;
    refund_id?: string;
    message?: string;
    error?: string;
  }> {
    const transaction = this.activeTransactions.get(transactionId);

    if (!transaction) {
      return {
        success: false,
        error: "تراکنش یافت نشد",
      };
    }

    if (transaction.status !== "completed") {
      return {
        success: false,
        error: "فقط پرداخت‌های موفق قابل برگشت هستند",
      };
    }

    const refundAmount = amount || transaction.final_amount;

    if (refundAmount > transaction.final_amount - transaction.refunded_amount) {
      return {
        success: false,
        error: "مبلغ برگشت از مبلغ قابل برگشت بیشتر است",
      };
    }

    const gatewayType = transaction.payment_method;
    const gateway = this.gateways.get(gatewayType);

    if (!gateway) {
      return {
        success: false,
        error: `درگاه پرداخت ${gatewayType} در دسترس نیست`,
      };
    }

    try {
      let result: any;

      switch (gatewayType) {
        case "zarinpal":
          result = await gateway.refundPayment(
            transaction.authority!,
            refundAmount,
            reason || "درخواست کاربر"
          );
          break;

        case "mellat_bank":
          result = await gateway.refundPayment({
            orderId: transaction.order_id!,
            saleOrderId: parseInt(transaction.gateway_data.mellat_sale_order_id || "0"),
            saleReferenceId: parseInt(transaction.gateway_data.mellat_sale_reference_id || "0"),
            amount: refundAmount,
          }, reason);
          break;

        case "saman_bank":
          result = await gateway.reversePayment({
            refNum: transaction.reference_id!,
            merchantId: this.config.saman_bank?.merchantId!,
            mid: this.config.saman_bank?.merchantId!,
            tid: this.config.saman_bank?.terminalId!,
            orderId: transaction.order_id!,
          });
          break;

        case "wallet":
          // For wallet, we can directly refund
          const walletResult = await WalletService.deposit(
            transaction.user_id,
            refundAmount,
            "wallet",
            `برگشت وجه تراکنش ${transactionId}`,
            `refund_${transactionId}`
          );

          result = {
            success: walletResult.success,
            data: walletResult,
            error: walletResult.error,
          };
          break;

        default:
          throw new Error(`Unsupported gateway type for refund: ${gatewayType}`);
      }

      if (result.success) {
        // Update transaction
        transaction.refunded_amount += refundAmount;

        if (transaction.refunded_amount >= transaction.final_amount) {
          updateTransactionStatus(transaction, "refunded");
        } else {
          updateTransactionStatus(transaction, "partially_refunded");
        }

        const refundId = generateTransactionId();

        return {
          success: true,
          refund_id: refundId,
          message: `مبلغ ${refundAmount.toLocaleString('fa-IR')} تومان با موفقیت برگشت داده شد`,
        };
      } else {
        return {
          success: false,
          error: result.error || "خطا در برگشت وجه",
        };
      }

    } catch (error) {
      console.error(`Refund error for ${gatewayType}:`, error);
      return {
        success: false,
        error: "خطای سیستمی در برگشت وجه",
      };
    }
  }

  /**
   * Get payment statistics
   */
  public getPaymentStatistics(period?: { from: string; to: string }): {
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
  } {
    // This is a simplified implementation
    // In a real system, you'd query your transaction database
    const transactions = Array.from(this.activeTransactions.values());

    const stats = {
      total_transactions: transactions.length,
      successful_transactions: transactions.filter(t => t.status === "completed").length,
      failed_transactions: transactions.filter(t => ["failed", "cancelled", "expired"].includes(t.status)).length,
      total_amount: transactions.reduce((sum, t) => sum + t.final_amount, 0),
      success_rate: 0,
      average_response_time: 0,
      gateway_breakdown: {} as Record<string, any>,
    };

    stats.success_rate = stats.total_transactions > 0
      ? (stats.successful_transactions / stats.total_transactions) * 100
      : 0;

    // Calculate gateway breakdown
    const gatewayStats = new Map<string, { transactions: number; amount: number; successful: number }>();

    transactions.forEach(t => {
      const gateway = t.payment_method;
      const existing = gatewayStats.get(gateway) || { transactions: 0, amount: 0, successful: 0 };

      existing.transactions++;
      existing.amount += t.final_amount;
      if (t.status === "completed") existing.successful++;

      gatewayStats.set(gateway, existing);
    });

    gatewayStats.forEach((data, gateway) => {
      stats.gateway_breakdown[gateway] = {
        transactions: data.transactions,
        amount: data.amount,
        success_rate: data.transactions > 0 ? (data.successful / data.transactions) * 100 : 0,
      };
    });

    // Average response time from health status
    const healthStatuses = Array.from(this.healthStatus.values());
    stats.average_response_time = healthStatuses.length > 0
      ? healthStatuses.reduce((sum, h) => sum + h.response_time, 0) / healthStatuses.length
      : 0;

    return stats;
  }

  /**
   * Cleanup expired transactions
   */
  public cleanupExpiredTransactions(): number {
    const now = Date.now();
    const expiredTransactions: string[] = [];

    this.activeTransactions.forEach((transaction, transactionId) => {
      const createdAt = new Date(transaction.created_at).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (now - createdAt > maxAge && ["pending", "processing"].includes(transaction.status)) {
        updateTransactionStatus(transaction, "expired");
        expiredTransactions.push(transactionId);
      }
    });

    // Remove expired transactions from active list
    expiredTransactions.forEach(id => {
      this.activeTransactions.delete(id);
    });

    if (expiredTransactions.length > 0) {
      console.log(`Cleaned up ${expiredTransactions.length} expired transactions`);
    }

    return expiredTransactions.length;
  }

  /**
   * Shutdown gateway manager
   */
  public shutdown(): void {
    // Clear health monitoring
    if (this.config.health_check_interval) {
      // In a real implementation, you'd clear the interval
      console.log("Shutting down payment gateway manager");
    }

    // Clear active transactions
    this.activeTransactions.clear();
    this.healthStatus.clear();
    this.gateways.clear();
  }
}

// Export factory function
export const createPaymentGatewayManager = (config: PaymentGatewayManagerConfig) => {
  return new PaymentGatewayManager(config);
};

// Export helper functions
export { generateTransactionId, updateTransactionStatus };
