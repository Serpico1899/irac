import { ActFn, ObjectId } from "@deps";
import { createZarinPalService } from "../zarinpal.ts";
import { coreApp } from "../../../mod.ts";

export interface CreatePaymentDetails {
  amount: number;
  description: string;
  mobile?: string;
  email?: string;
  order_id?: string;
  metadata?: Record<string, any>;
}

export const createPaymentFn: ActFn = async (body) => {
  const {
    amount,
    description,
    mobile,
    email,
    order_id,
    metadata,
  } = body.details.set as CreatePaymentDetails;

  const context = body.context;

  // Check authentication
  if (!context?.user?._id) {
    throw new Error("کاربر احراز هویت نشده است");
  }

  const userId = context.user._id;

  try {
    // Initialize ZarinPal service with environment variables
    const merchantId = Deno.env.get("ZARINPAL_MERCHANT_ID");
    const isSandbox = Deno.env.get("ZARINPAL_SANDBOX") === "true";
    const callbackUrl = Deno.env.get("ZARINPAL_CALLBACK_URL") ||
      `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/payment/callback`;

    if (!merchantId) {
      throw new Error("تنظیمات درگاه پرداخت ناقص است");
    }

    const zarinPalService = createZarinPalService({
      merchantId,
      sandbox: isSandbox,
      callbackUrl,
    });

    // Validate amount
    if (amount < 1000) {
      throw new Error("حداقل مبلغ قابل پرداخت 1000 تومان می‌باشد");
    }

    // Create payment request
    const paymentResult = await zarinPalService.createPaymentRequest(userId, {
      amount,
      description,
      mobile,
      email,
      order_id,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
        user_ip: context?.ip || "unknown",
      },
    });

    if (!paymentResult.success) {
      throw new Error(paymentResult.error || "خطا در ایجاد درخواست پرداخت");
    }

    // Log the payment request for tracking
    console.log(`Payment request created for user ${userId}:`, {
      authority: paymentResult.data?.authority,
      amount,
      description,
    });

    return {
      success: true,
      data: {
        authority: paymentResult.data?.authority,
        payment_url: paymentResult.data?.payment_url,
        amount,
        description,
        fee: paymentResult.data?.fee,
        fee_type: paymentResult.data?.fee_type,
      },
      message: "درخواست پرداخت با موفقیت ایجاد شد",
    };
  } catch (error) {
    console.error("Create payment error:", error);

    // Return user-friendly error message
    const errorMessage = error instanceof Error ? error.message : "خطا در ایجاد درخواست پرداخت";

    throw new Error(errorMessage);
  }
};
