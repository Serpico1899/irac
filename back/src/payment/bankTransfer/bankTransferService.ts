import { WalletService } from "../../wallet/service.ts";
import { createUpdateAt } from "@lib";
import { v4 } from "https://deno.land/std@0.208.0/uuid/mod.ts";

export interface BankAccount {
  bank_name: string;
  account_number: string;
  account_holder: string;
  iban: string;
  card_number?: string;
}

export interface BankTransferRequest {
  user_id: string;
  amount: number;
  transfer_date: string;
  from_bank: string;
  from_account?: string;
  transaction_id?: string;
  receipt_file_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface BankTransferVerification {
  transfer_id: string;
  admin_user_id: string;
  verification_status: "approved" | "rejected" | "needs_review";
  verification_note?: string;
  verified_amount?: number;
}

export class BankTransferService {
  // Default IRAC bank accounts for deposits
  private static readonly BANK_ACCOUNTS: BankAccount[] = [
    {
      bank_name: "بانک ملی",
      account_number: "1234567890",
      account_holder: "مرکز معماری ایرانی",
      iban: "IR123456789012345678901234",
      card_number: "6037-9919-1234-5678",
    },
    {
      bank_name: "بانک صادرات",
      account_number: "0987654321",
      account_holder: "مرکز معماری ایرانی",
      iban: "IR987654321098765432109876",
      card_number: "6274-1291-1234-5678",
    },
    {
      bank_name: "بانک پاسارگاد",
      account_number: "5555666677",
      account_holder: "مرکز معماری ایرانی",
      iban: "IR555566667777888899990000",
      card_number: "5022-2910-1234-5678",
    },
  ];

  /**
   * Get available bank accounts for deposits
   */
  static getBankAccounts(): BankAccount[] {
    return this.BANK_ACCOUNTS;
  }

  /**
   * Create a bank transfer request
   */
  static async createTransferRequest(request: BankTransferRequest): Promise<{
    success: boolean;
    transfer_id?: string;
    data?: any;
    error?: string;
  }> {
    try {
      // Validate amount
      if (request.amount <= 0) {
        return {
          success: false,
          error: "مبلغ باید بیشتر از صفر باشد",
        };
      }

      if (request.amount < 10000) {
        return {
          success: false,
          error: "حداقل مبلغ واریز 10,000 تومان می‌باشد",
        };
      }

      // Validate transfer date
      const transferDate = new Date(request.transfer_date);
      const now = new Date();
      const maxDate = new Date();
      maxDate.setDate(now.getDate() + 1); // Allow next day for timezone differences

      if (transferDate > maxDate) {
        return {
          success: false,
          error: "تاریخ انتقال نمی‌تواند در آینده باشد",
        };
      }

      const minDate = new Date();
      minDate.setDate(now.getDate() - 30); // Allow up to 30 days ago

      if (transferDate < minDate) {
        return {
          success: false,
          error: "تاریخ انتقال نمی‌تواند بیش از 30 روز گذشته باشد",
        };
      }

      const transferId = v4.generate();

      // Create bank transfer record (this would go to a bank_transfers collection)
      const bankTransfer = {
        _id: transferId,
        transfer_id: transferId,
        user: { _id: request.user_id },
        amount: request.amount,
        currency: "IRR",
        transfer_date: request.transfer_date,
        from_bank: request.from_bank,
        from_account: request.from_account,
        transaction_id: request.transaction_id,
        receipt_file: request.receipt_file_id ? { _id: request.receipt_file_id } : undefined,
        description: request.description || `واریز بانکی ${request.amount} تومان`,
        status: "pending_review",
        verification_status: "pending",
        metadata: {
          ...request.metadata,
          created_at: new Date().toISOString(),
          ip_address: request.metadata?.ip_address,
          user_agent: request.metadata?.user_agent,
        },
        ...createUpdateAt,
      };

      // In a real implementation, this would be saved to database
      console.log("Bank transfer request created:", bankTransfer);

      return {
        success: true,
        transfer_id: transferId,
        data: {
          transfer_id: transferId,
          amount: request.amount,
          status: "pending_review",
          estimated_processing_time: "24-48 ساعت",
          next_steps: [
            "رسید واریز را آپلود کنید",
            "منتظر بررسی توسط کارشناس باشید",
            "در صورت تأیید، مبلغ به کیف پول شما اضافه می‌شود",
          ],
        },
      };
    } catch (error) {
      console.error("Create bank transfer request error:", error);
      return {
        success: false,
        error: "خطا در ایجاد درخواست واریز بانکی",
      };
    }
  }

  /**
   * Upload receipt file for bank transfer
   */
  static async uploadReceipt(
    transferId: string,
    fileId: string,
    userId: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // In a real implementation, this would update the bank_transfers collection
      console.log(`Receipt uploaded for transfer ${transferId}: file ${fileId}`);

      return {
        success: true,
        data: {
          transfer_id: transferId,
          receipt_file_id: fileId,
          status: "pending_review",
          message: "رسید با موفقیت آپلود شد و در انتظار بررسی است",
        },
      };
    } catch (error) {
      console.error("Upload receipt error:", error);
      return {
        success: false,
        error: "خطا در آپلود رسید",
      };
    }
  }

  /**
   * Admin: Verify and approve/reject bank transfer
   */
  static async verifyTransfer(verification: BankTransferVerification): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const { transfer_id, admin_user_id, verification_status, verification_note, verified_amount } = verification;

      // In a real implementation, fetch the transfer record from database
      // For now, we'll simulate the process

      if (verification_status === "approved") {
        // Get the original transfer request (simulated)
        const originalAmount = verified_amount || 0; // This would come from database
        const userId = "user_id_from_transfer_record"; // This would come from database

        if (originalAmount <= 0) {
          return {
            success: false,
            error: "مبلغ تأیید شده نامعتبر است",
          };
        }

        // Add funds to user's wallet
        try {
          const depositResult = await WalletService.deposit(
            userId,
            originalAmount,
            "bank_transfer",
            `واریز بانکی تأیید شده - کد پیگیری: ${transfer_id}`,
            transfer_id,
            admin_user_id
          );

          // Update transfer status (in real implementation)
          console.log(`Bank transfer ${transfer_id} approved and deposited:`, depositResult);

          return {
            success: true,
            data: {
              transfer_id,
              verification_status: "approved",
              wallet_transaction_id: depositResult.transactionId,
              new_balance: depositResult.newBalance,
              processed_by: admin_user_id,
              processed_at: new Date().toISOString(),
              verification_note,
            },
          };
        } catch (walletError) {
          console.error("Wallet deposit error during verification:", walletError);
          return {
            success: false,
            error: "خطا در واریز به کیف پول کاربر",
          };
        }
      } else if (verification_status === "rejected") {
        // Update transfer status to rejected (in real implementation)
        console.log(`Bank transfer ${transfer_id} rejected:`, verification_note);

        return {
          success: true,
          data: {
            transfer_id,
            verification_status: "rejected",
            processed_by: admin_user_id,
            processed_at: new Date().toISOString(),
            verification_note,
          },
        };
      } else if (verification_status === "needs_review") {
        // Mark for additional review (in real implementation)
        console.log(`Bank transfer ${transfer_id} needs additional review:`, verification_note);

        return {
          success: true,
          data: {
            transfer_id,
            verification_status: "needs_review",
            processed_by: admin_user_id,
            processed_at: new Date().toISOString(),
            verification_note,
          },
        };
      }

      return {
        success: false,
        error: "وضعیت تأیید نامعتبر است",
      };
    } catch (error) {
      console.error("Verify transfer error:", error);
      return {
        success: false,
        error: "خطا در تأیید واریز بانکی",
      };
    }
  }

  /**
   * Get transfer status
   */
  static async getTransferStatus(transferId: string, userId?: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // In a real implementation, fetch from database
      // For now, return a mock response
      return {
        success: true,
        data: {
          transfer_id: transferId,
          amount: 100000,
          currency: "IRR",
          status: "pending_review",
          verification_status: "pending",
          transfer_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          estimated_processing_time: "24-48 ساعت",
        },
      };
    } catch (error) {
      console.error("Get transfer status error:", error);
      return {
        success: false,
        error: "خطا در دریافت وضعیت واریز",
      };
    }
  }

  /**
   * Get pending transfers for admin review
   */
  static async getPendingTransfers(page: number = 1, limit: number = 20): Promise<{
    success: boolean;
    data?: {
      transfers: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
    error?: string;
  }> {
    try {
      // In a real implementation, fetch from database with filters
      // For now, return mock data
      const mockTransfers = [
        {
          _id: "transfer_1",
          transfer_id: "transfer_1",
          user: { _id: "user_1", name: "کاربر نمونه ۱" },
          amount: 500000,
          currency: "IRR",
          transfer_date: new Date().toISOString(),
          from_bank: "بانک ملی",
          status: "pending_review",
          verification_status: "pending",
          created_at: new Date().toISOString(),
        },
      ];

      return {
        success: true,
        data: {
          transfers: mockTransfers,
          pagination: {
            page,
            limit,
            total: mockTransfers.length,
            pages: Math.ceil(mockTransfers.length / limit),
          },
        },
      };
    } catch (error) {
      console.error("Get pending transfers error:", error);
      return {
        success: false,
        error: "خطا در دریافت لیست واریزهای در انتظار",
      };
    }
  }

  /**
   * Validate Iranian bank account number
   */
  static validateBankAccount(accountNumber: string): boolean {
    // Remove spaces and dashes
    const cleaned = accountNumber.replace(/[\s-]/g, "");

    // Check if it's numeric and has appropriate length
    return /^\d{10,20}$/.test(cleaned);
  }

  /**
   * Validate Iranian IBAN
   */
  static validateIBAN(iban: string): boolean {
    // Remove spaces and convert to uppercase
    const cleaned = iban.replace(/\s/g, "").toUpperCase();

    // Check Iranian IBAN format (IR + 24 digits)
    return /^IR\d{24}$/.test(cleaned);
  }

  /**
   * Format bank account number for display
   */
  static formatBankAccount(accountNumber: string): string {
    const cleaned = accountNumber.replace(/\D/g, "");

    if (cleaned.length <= 4) {
      return cleaned;
    }

    // Format as groups of 4 digits
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1-");
  }

  /**
   * Format IBAN for display
   */
  static formatIBAN(iban: string): string {
    const cleaned = iban.replace(/\s/g, "").toUpperCase();

    if (cleaned.length <= 4) {
      return cleaned;
    }

    // Format as IR## #### #### #### #### #### ##
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  }

  /**
   * Get bank name from account number (basic detection)
   */
  static detectBankFromAccount(accountNumber: string): string | null {
    const cleaned = accountNumber.replace(/\D/g, "");

    // Basic bank detection based on account number patterns
    const bankPatterns: Record<string, string> = {
      "603770": "بانک صادرات",
      "627381": "بانک انصار",
      "627412": "بانک اقتصاد نوین",
      "627488": "بانک کارآفرین",
      "627648": "بانک توسعه تعاون",
      "627760": "پست بانک",
      "627884": "بانک پارسیان",
      "639607": "بانک صنعت و معدن",
      "627593": "بانک ایران زمین",
      "627648": "بانک توسعه تعاون",
      "505785": "بانک ایران زمین",
    };

    for (const [pattern, bankName] of Object.entries(bankPatterns)) {
      if (cleaned.startsWith(pattern)) {
        return bankName;
      }
    }

    return null;
  }

  /**
   * Generate receipt reference number
   */
  static generateReceiptReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `RCP${timestamp.slice(-8)}${random.toUpperCase()}`;
  }

  /**
   * Calculate estimated processing time
   */
  static getEstimatedProcessingTime(): {
    hours: number;
    message: string;
  } {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Weekend (Friday = 5, Saturday = 6 in Iran)
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return {
        hours: 72,
        message: "به دلیل آخر هفته، پردازش ممکن است تا 72 ساعت طول بکشد",
      };
    }

    // Outside business hours (8 AM to 6 PM)
    if (hour < 8 || hour > 18) {
      return {
        hours: 24,
        message: "خارج از ساعات کاری، پردازش تا 24 ساعت طول می‌کشد",
      };
    }

    // Business hours
    return {
      hours: 4,
      message: "در ساعات کاری، پردازش معمولاً تا 4 ساعت طول می‌کشد",
    };
  }
}
