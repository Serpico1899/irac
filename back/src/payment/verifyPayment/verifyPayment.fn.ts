import { ActFn, ObjectId } from "@deps";
import { createZarinPalService } from "../zarinpal.ts";
import {  coreApp  } from "@app";

export interface VerifyPaymentDetails {
  authority: string;
  amount: number;
  status?: string;
}

export const verifyPaymentFn: ActFn = async (body) => {
  const {
    authority,
    amount,
    status,
  } = body.details.set as VerifyPaymentDetails;

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

    // Check if payment was cancelled by user
    if (status === "NOK" || status === "cancel") {
      return {
        success: false,
        data: null,
        message: "پرداخت توسط کاربر لغو شد",
        error_code: "PAYMENT_CANCELLED",
      };
    }

    // Validate authority format
    if (!authority || authority.length !== 36) {
      throw new Error("کد پیگیری پرداخت نامعتبر است");
    }

    // Validate amount
    if (amount < 1000) {
      throw new Error("مبلغ پرداخت نامعتبر است");
    }

    // Verify payment with ZarinPal
    const verificationResult = await zarinPalService.verifyPayment(
      userId,
      authority,
      amount
    );

    if (!verificationResult.success) {
    // Log failed verification
    console.error(`Payment verification failed for user ${userId}:`, {
      authority,
      amount,
      error: verificationResult.error,
    });

    return {
      success: false,
      data: {
        authority,
        amount,
        code: verificationResult.data?.code,
      },
      message: verificationResult.error || "تأیید پرداخت ناموفق بود",
      error_code: "VERIFICATION_FAILED",
    };
  }

    // Payment verified successfully
    const verificationData = verificationResult.data;

  // Log successful payment
  console.log(`Payment verified successfully for user ${userId}:`, {
    authority,
    amount,
    ref_id: verificationData?.ref_id,
    card_pan: verificationData?.card_pan,
  });

  return {
    success: true,
    data: {
      authority,
      amount,
      ref_id: verificationData?.ref_id,
      card_hash: verificationData?.card_hash,
      card_pan: verificationData?.card_pan,
      fee: verificationData?.fee,
      fee_type: verificationData?.fee_type,
      wallet_transaction_id: (verificationData as any)?.wallet_transaction_id,
      new_balance: (verificationData as any)?.new_balance,
    },
    message: "پرداخت با موفقیت تأیید شد و به کیف پول شما اضافه گردید",
  };
} catch (error) {
  console.error("Verify payment error:", error);

  // Return user-friendly error message
  const errorMessage = error instanceof Error ? error.message : "خطا در تأیید پرداخت";

  return {
    success: false,
    data: {
      authority,
      amount,
    },
    message: errorMessage,
    error_code: "VERIFICATION_ERROR",
  };
}
};
