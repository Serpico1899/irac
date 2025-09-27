import { ActFn, ObjectId } from "https://deno.land/x/lesan@v0.1.8/mod.ts";
import {
  PaymentGatewayManager,
  createPaymentGatewayManager,
  type UnifiedPaymentRequest,
  type UnifiedVerificationRequest,
  type PaymentGatewayManagerConfig
} from "../gateway-manager.ts";
import { user, order, invoice, wallet } from "@app";
import { DEFAULT_GATEWAYS } from "@model";
import { getServerSession } from "../../auth/mod.ts";

// Initialize Payment Gateway Manager
const gatewayManagerConfig: PaymentGatewayManagerConfig = {
  zarinpal: {
    merchantId: Deno.env.get("ZARINPAL_MERCHANT_ID") || "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    sandbox: Deno.env.get("ZARINPAL_SANDBOX") === "true" || true,
    callbackUrl: Deno.env.get("PAYMENT_CALLBACK_URL") || "http://localhost:3000/payment/callback",
  },
  mellat_bank: Deno.env.get("MELLAT_TERMINAL_ID") ? {
    terminalId: Deno.env.get("MELLAT_TERMINAL_ID")!,
    username: Deno.env.get("MELLAT_USERNAME")!,
    password: Deno.env.get("MELLAT_PASSWORD")!,
    sandbox: Deno.env.get("MELLAT_SANDBOX") === "true" || true,
    callbackUrl: Deno.env.get("PAYMENT_CALLBACK_URL") || "http://localhost:3000/payment/callback",
  } : undefined,
  saman_bank: Deno.env.get("SAMAN_MERCHANT_ID") ? {
    merchantId: Deno.env.get("SAMAN_MERCHANT_ID")!,
    terminalId: Deno.env.get("SAMAN_TERMINAL_ID")!,
    sandbox: Deno.env.get("SAMAN_SANDBOX") === "true" || true,
    callbackUrl: Deno.env.get("PAYMENT_CALLBACK_URL") || "http://localhost:3000/payment/callback",
  } : undefined,
  default_gateway: (Deno.env.get("DEFAULT_PAYMENT_GATEWAY") as any) || "zarinpal",
  fallback_enabled: Deno.env.get("ENABLE_PAYMENT_FALLBACK") !== "false",
  max_retry_attempts: parseInt(Deno.env.get("PAYMENT_MAX_RETRIES") || "3"),
  health_check_interval: parseInt(Deno.env.get("PAYMENT_HEALTH_CHECK_INTERVAL") || "300000"),
  load_balancing_enabled: Deno.env.get("ENABLE_PAYMENT_LOAD_BALANCING") !== "false",
};

const gatewayManager = createPaymentGatewayManager(gatewayManagerConfig);

/**
 * Get available payment gateways
 */
export const getAvailableGateways: ActFn = async (body) => {
  try {
    const { amount = 0 } = body.details.set;

    // Get healthy gateways from manager
    const healthyGateways = gatewayManager.getHealthyGateways();

    // Get gateway configurations (in a real app, this would come from database)
    const availableGateways = healthyGateways.map(gatewayType => {
      const defaultConfig = DEFAULT_GATEWAYS[gatewayType];
      if (!defaultConfig) return null;

      // Check amount limits
      const isAmountValid = amount === 0 || (amount >= defaultConfig.min_amount && amount <= defaultConfig.max_amount);

      return {
        type: gatewayType,
        name: defaultConfig.name,
        name_en: defaultConfig.name_en,
        display_name: defaultConfig.display_name,
        description: defaultConfig.description,
        color: defaultConfig.color,
        min_amount: defaultConfig.min_amount,
        max_amount: defaultConfig.max_amount,
        gateway_fee: 0, // Would be calculated based on config
        is_available: isAmountValid,
        is_healthy: true,
        features: defaultConfig.features,
      };
    }).filter(Boolean);

    return {
      success: true,
      gateways: availableGateways,
      message: `${availableGateways.length} درگاه پرداخت در دسترس است`,
    };
  } catch (error) {
    console.error("Get available gateways error:", error);
    return {
      success: false,
      gateways: [],
      error: "خطا در دریافت درگاه‌های پرداخت",
    };
  }
};

/**
 * Create unified payment request
 */
export const createUnifiedPayment: ActFn = async (body) => {
  try {
    // Get user from session
    const session = await getServerSession(body.details.token);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "کاربر وارد سیستم نشده است",
      };
    }

    const userId = session.user.id;
    const {
      amount,
      purpose,
      description,
      order_id,
      invoice_id,
      currency = "IRR",
      mobile,
      email,
      national_code,
      metadata = {},
      options = {},
    } = body.details.set;

    // Validate required fields
    if (!amount || amount < 1000) {
      return {
        success: false,
        error: "مبلغ پرداخت باید حداقل 1000 تومان باشد",
      };
    }

    if (!purpose || !description) {
      return {
        success: false,
        error: "هدف و توضیحات پرداخت الزامی است",
      };
    }

    // Verify user exists
    const userDoc = await user.findOne({ _id: new ObjectId(userId) });
    if (!userDoc) {
      return {
        success: false,
        error: "کاربر یافت نشد",
      };
    }

    // Create unified payment request
    const paymentRequest: UnifiedPaymentRequest = {
      user_id: userId,
      amount,
      purpose,
      description,
      order_id,
      invoice_id,
      currency,
      mobile: mobile || userDoc.mobile,
      email: email || userDoc.email,
      national_code: national_code || userDoc.national_code,
      metadata: {
        ...metadata,
        user_agent: body.details.headers?.["user-agent"],
        ip_address: body.details.ip,
        created_at: new Date().toISOString(),
      },
      options,
    };

    // Create payment using gateway manager
    const result = await gatewayManager.createPayment(paymentRequest);

    if (result.success) {
      // Store transaction in database (you might want to implement this)
      // TODO: Implement paymentTransaction model export in mod.ts
      // await paymentTransaction.insertOne(transactionData);

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
        gateway_fee: result.gateway_fee,
        expires_at: result.expires_at,
        message: result.message,
        fallback_used: result.fallback_used,
        retry_count: result.retry_count,
      };
    } else {
      return {
        success: false,
        transaction_id: result.transaction_id,
        gateway_type: result.gateway_type,
        gateway_id: result.gateway_id,
        amount: result.amount,
        final_amount: result.final_amount,
        gateway_fee: result.gateway_fee,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Create unified payment error:", error);
    return {
      success: false,
      error: "خطای سیستمی در ایجاد پرداخت",
    };
  }
};

/**
 * Verify unified payment
 */
export const verifyUnifiedPayment: ActFn = async (body) => {
  try {
    // Get user from session
    const session = await getServerSession(body.details.token);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "کاربر وارد سیستم نشده است",
      };
    }

    const {
      transaction_id,
      authority,
      reference_id,
      callback_params = {},
    } = body.details.set;

    if (!transaction_id) {
      return {
        success: false,
        error: "شناسه تراکنش الزامی است",
      };
    }

    // Create verification request
    const verificationRequest: UnifiedVerificationRequest = {
      transaction_id,
      authority,
      reference_id,
      callback_params,
      user_id: session.user.id,
    };

    // Verify payment using gateway manager
    const result = await gatewayManager.verifyPayment(verificationRequest);

    if (result.success) {
      // Update order status if order_id exists
      if (callback_params.order_id) {
        try {
          await order.updateOne(
            { _id: new ObjectId(callback_params.order_id) },
            {
              $set: {
                payment_status: "paid",
                status: "confirmed",
                updated_at: new Date().toISOString(),
              },
            }
          );
        } catch (orderError) {
          console.error("Order update error:", orderError);
        }
      }

      // Update invoice status if invoice_id exists
      if (callback_params.invoice_id) {
        try {
          await invoice.updateOne(
            { _id: new ObjectId(callback_params.invoice_id) },
            {
              $set: {
                payment_status: "paid",
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            }
          );
        } catch (invoiceError) {
          console.error("Invoice update error:", invoiceError);
        }
      }

      return {
        success: true,
        transaction_id: result.transaction_id,
        gateway_type: result.gateway_type,
        amount: result.amount,
        reference_id: result.reference_id,
        tracking_code: result.tracking_code,
        card_info: result.card_info,
        wallet_info: result.wallet_info,
        message: result.message,
      };
    } else {
      return {
        success: false,
        transaction_id: result.transaction_id,
        gateway_type: result.gateway_type,
        amount: result.amount,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Verify unified payment error:", error);
    return {
      success: false,
      error: "خطای سیستمی در تأیید پرداخت",
    };
  }
};

/**
 * Cancel payment
 */
export const cancelPayment: ActFn = async (body) => {
  try {
    // Get user from session
    const session = await getServerSession(body.details.token);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "کاربر وارد سیستم نشده است",
      };
    }

    const { transaction_id } = body.details.set;

    if (!transaction_id) {
      return {
        success: false,
        error: "شناسه تراکنش الزامی است",
      };
    }

    // Cancel payment using gateway manager
    const result = await gatewayManager.cancelPayment(transaction_id);

    return result;
  } catch (error) {
    console.error("Cancel payment error:", error);
    return {
      success: false,
      error: "خطای سیستمی در لغو پرداخت",
    };
  }
};

/**
 * Refund payment
 */
export const refundPayment: ActFn = async (body) => {
  try {
    // Get user from session (admin required for refunds)
    const session = await getServerSession(body.details.token);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "کاربر وارد سیستم نشده است",
      };
    }

    // Check if user is admin
    const userDoc = await user.findOne({ _id: new ObjectId(session.user.id) });
    if (!userDoc || userDoc.level !== "admin") {
      return {
        success: false,
        error: "دسترسی غیرمجاز - فقط ادمین‌ها می‌توانند برگشت وجه انجام دهند",
      };
    }

    const {
      transaction_id,
      amount,
      reason = "درخواست ادمین"
    } = body.details.set;

    if (!transaction_id) {
      return {
        success: false,
        error: "شناسه تراکنش الزامی است",
      };
    }

    // Refund payment using gateway manager
    const result = await gatewayManager.refundPayment(transaction_id, amount, reason);

    return result;
  } catch (error) {
    console.error("Refund payment error:", error);
    return {
      success: false,
      error: "خطای سیستمی در برگشت وجه",
    };
  }
};

/**
 * Get payment statistics
 */
export const getPaymentStatistics: ActFn = async (body) => {
  try {
    // Get user from session (admin required for statistics)
    const session = await getServerSession(body.details.token);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "کاربر وارد سیستم نشده است",
      };
    }

    // Check if user is admin
    const userDoc = await user.findOne({ _id: new ObjectId(session.user.id) });
    if (!userDoc || userDoc.level !== "admin") {
      return {
        success: false,
        error: "دسترسی غیرمجاز - فقط ادمین‌ها می‌توانند آمار را مشاهده کنند",
      };
    }

    const { period } = body.details.set;

    // Get statistics from gateway manager
    const stats = gatewayManager.getPaymentStatistics(period);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Get payment statistics error:", error);
    return {
      success: false,
      error: "خطای سیستمی در دریافت آمار پرداخت",
    };
  }
};

/**
 * Get gateway health status
 */
export const getGatewayHealthStatus: ActFn = async (body) => {
  try {
    // Get user from session (admin required for health status)
    const session = await getServerSession(body.details.token);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "کاربر وارد سیستم نشده است",
      };
    }

    // Check if user is admin
    const userDoc = await user.findOne({ _id: new ObjectId(session.user.id) });
    if (!userDoc || userDoc.level !== "admin") {
      return {
        success: false,
        error: "دسترسی غیرمجاز - فقط ادمین‌ها می‌توانند وضعیت درگاه‌ها را مشاهده کنند",
      };
    }

    const { gateway_type } = body.details.set;

    // Get health status from gateway manager
    const healthStatus = gatewayManager.getGatewayHealthStatus(gateway_type);

    return {
      success: true,
      data: healthStatus,
    };
  } catch (error) {
    console.error("Get gateway health status error:", error);
    return {
      success: false,
      error: "خطای سیستمی در دریافت وضعیت درگاه‌ها",
    };
  }
};

/**
 * Get transaction details
 */
export const getTransactionDetails: ActFn = async (body) => {
  try {
    // Get user from session
    const session = await getServerSession(body.details.token);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "کاربر وارد سیستم نشده است",
      };
    }

    const { transaction_id } = body.details.set;

    if (!transaction_id) {
      return {
        success: false,
        error: "شناسه تراکنش الزامی است",
      };
    }

    // Get transaction from gateway manager
    const transaction = gatewayManager.getTransaction(transaction_id);

    if (!transaction) {
      return {
        success: false,
        error: "تراکنش یافت نشد",
      };
    }

    // Check if user owns this transaction or is admin
    const userDoc = await user.findOne({ _id: new ObjectId(session.user.id) });
    if (transaction.user_id !== session.user.id && userDoc?.level !== "admin") {
      return {
        success: false,
        error: "دسترسی غیرمجاز",
      };
    }

    return {
      success: true,
      data: {
        transaction_id: transaction.transaction_id,
        status: transaction.status,
        type: transaction.type,
        purpose: transaction.purpose,
        payment_method: transaction.payment_method,
        amount: transaction.amount,
        final_amount: transaction.final_amount,
        gateway_fee: transaction.gateway_fee,
        currency: transaction.currency,
        description: transaction.description,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        completed_at: transaction.completed_at,
        gateway_data: transaction.gateway_data,
        events: transaction.events,
      },
    };
  } catch (error) {
    console.error("Get transaction details error:", error);
    return {
      success: false,
      error: "خطای سیستمی در دریافت جزئیات تراکنش",
    };
  }
};

/**
 * Cleanup expired transactions (for admin/cron)
 */
export const cleanupExpiredTransactions: ActFn = async (body) => {
  try {
    // Get user from session (admin required)
    const session = await getServerSession(body.details.token);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "کاربر وارد سیستم نشده است",
      };
    }

    // Check if user is admin
    const userDoc = await user.findOne({ _id: new ObjectId(session.user.id) });
    if (!userDoc || userDoc.level !== "admin") {
      return {
        success: false,
        error: "دسترسی غیرمجاز - فقط ادمین‌ها می‌توانند پاکسازی انجام دهند",
      };
    }

    // Cleanup expired transactions
    const cleanedCount = gatewayManager.cleanupExpiredTransactions();

    return {
      success: true,
      message: `${cleanedCount} تراکنش منقضی پاکسازی شد`,
      cleaned_count: cleanedCount,
    };
  } catch (error) {
    console.error("Cleanup expired transactions error:", error);
    return {
      success: false,
      error: "خطای سیستمی در پاکسازی تراکنش‌های منقضی",
    };
  }
};
