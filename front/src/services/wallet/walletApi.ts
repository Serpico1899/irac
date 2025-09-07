import { AppApi } from "@/services/api";
import { ReqType } from "@/types/declarations/selectInp";

// Types for wallet API responses
export interface WalletBalance {
  balance: number;
  currency: string;
  status: string;
  is_active: boolean;
}

export interface WalletTransaction {
  _id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  payment_method?: string;
  description?: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
  processed_at?: string;
}

export interface TransactionHistoryResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Wallet {
  _id: string;
  user: { _id: string };
  balance: number;
  currency: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletStats {
  balance: number;
  currency: string;
  status: string;
  totalDeposits: { total: number; count: number };
  totalWithdrawals: { total: number; count: number };
  recentTransactions: WalletTransaction[];
}

export interface WalletApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Request interfaces
export interface DepositRequest {
  amount: number;
  payment_method?: string;
  description?: string;
  reference_id?: string;
}

export interface PurchaseRequest {
  amount: number;
  order_id: string;
  description?: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

class WalletApiService {
  private getToken(): string | undefined {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token") || undefined;
    }
    return undefined;
  }

  // Get user wallet
  async getWallet(userId: string): Promise<WalletApiResponse<Wallet>> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "wallet",
          act: "getWallet",
          details: {
            set: {
              user_id: userId,
            },
            get: {
              _id: 1,
              user: 1,
              balance: 1,
              currency: 1,
              status: 1,
              is_active: 1,
              created_at: 1,
              updated_at: 1,
            },
          },
        },
        { token },
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Wallet,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  }

  // Get wallet balance
  async getBalance(userId: string): Promise<WalletApiResponse<WalletBalance>> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "wallet",
          act: "getBalance",
          details: {
            set: {
              user_id: userId,
            },
            get: {
              balance: 1,
              currency: 1,
              status: 1,
              is_active: 1,
            },
          },
        },
        { token },
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        data: {} as WalletBalance,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  }

  // Deposit funds to wallet
  async deposit(
    userId: string,
    request: DepositRequest,
  ): Promise<WalletApiResponse<any>> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "wallet",
          act: "deposit",
          details: {
            set: {
              user_id: userId,
              amount: request.amount,
              payment_method: request.payment_method,
              description: request.description,
              reference_id: request.reference_id,
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

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  }

  // Make a purchase using wallet balance
  async makePurchase(
    userId: string,
    request: PurchaseRequest,
  ): Promise<WalletApiResponse<any>> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "wallet",
          act: "purchase",
          details: {
            set: {
              user_id: userId,
              amount: request.amount,
              order_id: request.order_id,
              description: request.description,
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

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  }

  // Get transaction history
  async getTransactionHistory(
    userId: string,
    query: TransactionQuery = {},
  ): Promise<WalletApiResponse<TransactionHistoryResponse>> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "wallet",
          act: "getTransactions",
          details: {
            set: {
              user_id: userId,
              page: query.page,
              limit: query.limit,
              type: query.type,
              status: query.status,
            },
            get: {
              success: 1,
              data: 1,
            },
          },
        },
        { token },
      );

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        data: {} as TransactionHistoryResponse,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  }

  // Check if user has sufficient balance (helper method)
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    try {
      const balanceResult = await this.getBalance(userId);
      if (balanceResult.success) {
        return (
          balanceResult.data.balance >= amount &&
          balanceResult.data.is_active &&
          balanceResult.data.status === "active"
        );
      }
      return false;
    } catch (error) {
      console.error("Error checking balance:", error);
      return false;
    }
  }

  // Format currency for display
  static formatCurrency(amount: number, currency: string = "IRR"): string {
    if (currency === "IRR") {
      return `${amount.toLocaleString("fa-IR")} تومان`;
    } else if (currency === "USD") {
      return `$${amount.toLocaleString("en-US")}`;
    } else if (currency === "EUR") {
      return `€${amount.toLocaleString("en-US")}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  }

  // Get transaction type label in Persian
  static getTransactionTypeLabel(type: string, locale: string = "fa"): string {
    const labels: Record<string, Record<string, string>> = {
      fa: {
        deposit: "واریز",
        withdrawal: "برداشت",
        purchase: "خرید",
        refund: "بازگشت وجه",
        transfer_in: "انتقال ورودی",
        transfer_out: "انتقال خروجی",
        bonus: "پاداش",
        penalty: "جریمه",
        commission: "کمیسیون",
      },
      en: {
        deposit: "Deposit",
        withdrawal: "Withdrawal",
        purchase: "Purchase",
        refund: "Refund",
        transfer_in: "Transfer In",
        transfer_out: "Transfer Out",
        bonus: "Bonus",
        penalty: "Penalty",
        commission: "Commission",
      },
    };

    return labels[locale]?.[type] || type;
  }

  // Get transaction status label in Persian
  static getTransactionStatusLabel(
    status: string,
    locale: string = "fa",
  ): string {
    const labels: Record<string, Record<string, string>> = {
      fa: {
        pending: "در انتظار",
        processing: "در حال پردازش",
        completed: "تکمیل شده",
        failed: "ناموفق",
        cancelled: "لغو شده",
        refunded: "بازگشت داده شده",
      },
      en: {
        pending: "Pending",
        processing: "Processing",
        completed: "Completed",
        failed: "Failed",
        cancelled: "Cancelled",
        refunded: "Refunded",
      },
    };

    return labels[locale]?.[status] || status;
  }

  // Get status color for UI
  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "text-yellow-600 bg-yellow-50",
      processing: "text-blue-600 bg-blue-50",
      completed: "text-green-600 bg-green-50",
      failed: "text-red-600 bg-red-50",
      cancelled: "text-gray-600 bg-gray-50",
      refunded: "text-purple-600 bg-purple-50",
    };

    return colors[status] || "text-gray-600 bg-gray-50";
  }

  // Get transaction type icon
  static getTransactionIcon(type: string): string {
    const icons: Record<string, string> = {
      deposit: "↗️",
      withdrawal: "↙️",
      purchase: "🛒",
      refund: "↩️",
      transfer_in: "📥",
      transfer_out: "📤",
      bonus: "🎁",
      penalty: "⚠️",
      commission: "💼",
    };

    return icons[type] || "💰";
  }
}

export const walletApi = new WalletApiService();
export default walletApi;
