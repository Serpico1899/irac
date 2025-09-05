import {
  Wallet,
  WalletBalance,
  WalletStats,
  WalletTransaction,
  TransactionHistoryResponse,
  DepositRequest,
  WithdrawRequest,
  PurchaseRequest,
  BonusRequest,
  RefundRequest,
  WalletStatusRequest,
  TransactionQuery,
  WalletApiResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1405';

class WalletApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<WalletApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.error || error.message || 'An error occurred');
    }

    const data = await response.json();
    return data;
  }

  // Get user wallet
  async getWallet(userId?: string): Promise<WalletApiResponse<Wallet>> {
    const url = new URL(`${API_BASE_URL}/wallet`);
    if (userId) {
      url.searchParams.append('user_id', userId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Wallet>(response);
  }

  // Get wallet balance
  async getBalance(): Promise<WalletApiResponse<WalletBalance>> {
    const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<WalletBalance>(response);
  }

  // Deposit funds to wallet
  async deposit(request: DepositRequest): Promise<WalletApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/wallet/deposit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  // Withdraw funds from wallet
  async withdraw(request: WithdrawRequest): Promise<WalletApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  // Make a purchase using wallet balance
  async makePurchase(request: PurchaseRequest): Promise<WalletApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/wallet/purchase`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  // Get transaction history
  async getTransactionHistory(
    query: TransactionQuery = {}
  ): Promise<WalletApiResponse<TransactionHistoryResponse>> {
    const url = new URL(`${API_BASE_URL}/wallet/transactions`);

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<TransactionHistoryResponse>(response);
  }

  // Get wallet statistics
  async getWalletStats(): Promise<WalletApiResponse<WalletStats>> {
    const response = await fetch(`${API_BASE_URL}/wallet/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<WalletStats>(response);
  }

  // Check if user has sufficient balance
  async checkBalance(amount: number): Promise<WalletApiResponse<{ has_sufficient_balance: boolean; requested_amount: number }>> {
    const response = await fetch(`${API_BASE_URL}/wallet/check-balance/${amount}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Admin: Add bonus to user wallet
  async addBonus(request: BonusRequest): Promise<WalletApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/wallet/bonus`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  // Admin: Process refund
  async processRefund(request: RefundRequest): Promise<WalletApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/wallet/refund`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  // Admin: Update wallet status
  async updateWalletStatus(request: WalletStatusRequest): Promise<WalletApiResponse<Wallet>> {
    const response = await fetch(`${API_BASE_URL}/wallet/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<Wallet>(response);
  }

  // Charge wallet via payment gateway (ZarinPal integration)
  async initiateCharge(amount: number, description?: string): Promise<WalletApiResponse<{ payment_url: string; authority: string }>> {
    const response = await fetch(`${API_BASE_URL}/wallet/charge/initiate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        amount,
        description: description || `شارژ کیف پول به مبلغ ${amount.toLocaleString('fa-IR')} تومان`,
        callback_url: `${window.location.origin}/wallet/charge/callback`,
      }),
    });

    return this.handleResponse(response);
  }

  // Verify payment callback
  async verifyCharge(authority: string, status: string): Promise<WalletApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/wallet/charge/verify`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ authority, status }),
    });

    return this.handleResponse(response);
  }

  // Format currency for display
  static formatCurrency(amount: number, currency: string = 'IRR'): string {
    if (currency === 'IRR') {
      return `${amount.toLocaleString('fa-IR')} تومان`;
    } else if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US')}`;
    } else if (currency === 'EUR') {
      return `€${amount.toLocaleString('en-US')}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  }

  // Get transaction type label in Persian
  static getTransactionTypeLabel(type: string, locale: string = 'fa'): string {
    const labels: Record<string, Record<string, string>> = {
      fa: {
        deposit: 'واریز',
        withdrawal: 'برداشت',
        purchase: 'خرید',
        refund: 'بازگشت وجه',
        transfer_in: 'انتقال ورودی',
        transfer_out: 'انتقال خروجی',
        bonus: 'پاداش',
        penalty: 'جریمه',
        commission: 'کمیسیون',
      },
      en: {
        deposit: 'Deposit',
        withdrawal: 'Withdrawal',
        purchase: 'Purchase',
        refund: 'Refund',
        transfer_in: 'Transfer In',
        transfer_out: 'Transfer Out',
        bonus: 'Bonus',
        penalty: 'Penalty',
        commission: 'Commission',
      },
    };

    return labels[locale]?.[type] || type;
  }

  // Get transaction status label in Persian
  static getTransactionStatusLabel(status: string, locale: string = 'fa'): string {
    const labels: Record<string, Record<string, string>> = {
      fa: {
        pending: 'در انتظار',
        processing: 'در حال پردازش',
        completed: 'تکمیل شده',
        failed: 'ناموفق',
        cancelled: 'لغو شده',
        refunded: 'بازگشت داده شده',
      },
      en: {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        failed: 'Failed',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
      },
    };

    return labels[locale]?.[status] || status;
  }

  // Get status color for UI
  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-50',
      processing: 'text-blue-600 bg-blue-50',
      completed: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50',
      cancelled: 'text-gray-600 bg-gray-50',
      refunded: 'text-purple-600 bg-purple-50',
    };

    return colors[status] || 'text-gray-600 bg-gray-50';
  }

  // Get transaction type icon
  static getTransactionIcon(type: string): string {
    const icons: Record<string, string> = {
      deposit: '↗️',
      withdrawal: '↙️',
      purchase: '🛒',
      refund: '↩️',
      transfer_in: '📥',
      transfer_out: '📤',
      bonus: '🎁',
      penalty: '⚠️',
      commission: '💼',
    };

    return icons[type] || '💰';
  }
}

export const walletApi = new WalletApiService();
export default walletApi;
