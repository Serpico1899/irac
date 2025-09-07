"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  Wallet,
  WalletBalance,
  WalletStats,
  WalletTransaction,
  TransactionHistoryResponse,
  DepositRequest,
  WithdrawRequest,
  PurchaseRequest,
  TransactionQuery,
} from "@/types";
import { walletApi } from "@/services/wallet/walletApi";
import { useAuth } from "./AuthContext";

// Wallet state interface
interface WalletState {
  wallet: Wallet | null;
  balance: WalletBalance | null;
  stats: WalletStats | null;
  transactions: WalletTransaction[];
  transactionHistory: TransactionHistoryResponse | null;
  isLoading: boolean;
  isTransactionLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Action types
type WalletAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TRANSACTION_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_WALLET"; payload: Wallet }
  | { type: "SET_BALANCE"; payload: WalletBalance }
  | { type: "SET_STATS"; payload: WalletStats }
  | { type: "SET_TRANSACTIONS"; payload: WalletTransaction[] }
  | { type: "SET_TRANSACTION_HISTORY"; payload: TransactionHistoryResponse }
  | { type: "ADD_TRANSACTION"; payload: WalletTransaction }
  | { type: "UPDATE_BALANCE"; payload: number }
  | { type: "CLEAR_WALLET" }
  | { type: "SET_LAST_UPDATED"; payload: Date };

// Initial state
const initialState: WalletState = {
  wallet: null,
  balance: null,
  stats: null,
  transactions: [],
  transactionHistory: null,
  isLoading: false,
  isTransactionLoading: false,
  error: null,
  lastUpdated: null,
};

// Reducer
function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_TRANSACTION_LOADING":
      return { ...state, isTransactionLoading: action.payload };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isTransactionLoading: false,
      };
    case "SET_WALLET":
      return { ...state, wallet: action.payload, error: null };
    case "SET_BALANCE":
      return { ...state, balance: action.payload, error: null };
    case "SET_STATS":
      return { ...state, stats: action.payload, error: null };
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload, error: null };
    case "SET_TRANSACTION_HISTORY":
      return { ...state, transactionHistory: action.payload, error: null };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        error: null,
      };
    case "UPDATE_BALANCE":
      return {
        ...state,
        balance: state.balance
          ? { ...state.balance, balance: action.payload }
          : null,
        wallet: state.wallet
          ? { ...state.wallet, balance: action.payload }
          : null,
        error: null,
      };
    case "CLEAR_WALLET":
      return initialState;
    case "SET_LAST_UPDATED":
      return { ...state, lastUpdated: action.payload };
    default:
      return state;
  }
}

// Context interface
interface WalletContextType {
  state: WalletState;

  // Convenience properties
  balance: number;
  walletBalance: WalletBalance | null;
  walletStats: WalletStats | null;

  // Data fetching methods
  fetchWallet: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchTransactionHistory: (query?: TransactionQuery) => Promise<void>;

  // Transaction methods
  deposit: (request: DepositRequest) => Promise<boolean>;
  withdraw: (request: WithdrawRequest) => Promise<boolean>;
  makePurchase: (request: PurchaseRequest) => Promise<boolean>;

  // Utility methods
  checkSufficientBalance: (amount: number) => Promise<boolean>;
  refreshWalletData: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  clearError: () => void;

  // Charge wallet methods
  initiateCharge: (
    amount: number,
    description?: string,
  ) => Promise<string | null>;
  verifyCharge: (authority: string, status: string) => Promise<boolean>;
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const userId = user?._id;

  // Auto-fetch wallet data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchBalance();
      fetchTransactionHistory({ page: 1, limit: 10 });
    } else {
      dispatch({ type: "CLEAR_WALLET" });
    }
  }, [isAuthenticated, userId]);

  // Auto-refresh wallet data every 5 minutes
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const interval = setInterval(
      () => {
        fetchBalance();
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, userId]);

  const handleApiError = (error: any) => {
    const errorMessage = error.message || "خطای غیرمنتظره رخ داده است";
    dispatch({ type: "SET_ERROR", payload: errorMessage });
    console.error("Wallet API Error:", error);
  };

  const fetchWallet = async () => {
    if (!isAuthenticated || !userId) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await walletApi.getWallet(userId);

      if (response.success && response.data) {
        dispatch({ type: "SET_WALLET", payload: response.data });
        dispatch({ type: "SET_LAST_UPDATED", payload: new Date() });
      } else {
        throw new Error(response.error || "Failed to fetch wallet");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const fetchBalance = async () => {
    if (!isAuthenticated || !userId) return;

    try {
      const response = await walletApi.getBalance(userId);

      if (response.success && response.data) {
        dispatch({ type: "SET_BALANCE", payload: response.data });
        dispatch({ type: "SET_LAST_UPDATED", payload: new Date() });
      } else {
        throw new Error(response.error || "Failed to fetch balance");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchStats = async () => {
    if (!isAuthenticated || !userId) return;

    try {
      // For now, we'll create basic stats from balance data
      const balanceResponse = await walletApi.getBalance(userId);
      const transactionResponse = await walletApi.getTransactionHistory(
        userId,
        { page: 1, limit: 5 },
      );

      if (balanceResponse.success && balanceResponse.data) {
        const mockStats: WalletStats = {
          balance: balanceResponse.data.balance,
          currency: balanceResponse.data.currency,
          status: balanceResponse.data.status,
          totalDeposits: { total: 0, count: 0 },
          totalWithdrawals: { total: 0, count: 0 },
          recentTransactions: transactionResponse.success
            ? transactionResponse.data.transactions
            : [],
        };
        dispatch({ type: "SET_STATS", payload: mockStats });
      } else {
        throw new Error(balanceResponse.error || "Failed to fetch stats");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchTransactionHistory = async (query: TransactionQuery = {}) => {
    if (!isAuthenticated || !userId) return;

    try {
      dispatch({ type: "SET_TRANSACTION_LOADING", payload: true });
      const response = await walletApi.getTransactionHistory(userId, query);

      if (response.success && response.data) {
        dispatch({ type: "SET_TRANSACTION_HISTORY", payload: response.data });
        dispatch({
          type: "SET_TRANSACTIONS",
          payload: response.data.transactions,
        });
      } else {
        throw new Error(response.error || "Failed to fetch transactions");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      dispatch({ type: "SET_TRANSACTION_LOADING", payload: false });
    }
  };

  const deposit = async (request: DepositRequest): Promise<boolean> => {
    if (!isAuthenticated || !userId) return false;

    try {
      dispatch({ type: "SET_TRANSACTION_LOADING", payload: true });
      const response = await walletApi.deposit(userId, request);

      if (response.success) {
        // Refresh balance after successful deposit
        await fetchBalance();
        await fetchTransactionHistory({ page: 1, limit: 10 });
        return true;
      } else {
        throw new Error(response.error || "Deposit failed");
      }
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      dispatch({ type: "SET_TRANSACTION_LOADING", payload: false });
    }
  };

  const withdraw = async (request: WithdrawRequest): Promise<boolean> => {
    if (!isAuthenticated || !userId) return false;

    try {
      dispatch({ type: "SET_TRANSACTION_LOADING", payload: true });
      // For now, we'll implement withdrawal as a negative purchase transaction
      // This can be enhanced later with a proper withdrawal API
      const purchaseRequest = {
        amount: request.amount,
        order_id: `withdrawal_${Date.now()}`,
        description: request.description || "Manual withdrawal",
      };
      const response = await walletApi.makePurchase(userId, purchaseRequest);

      if (response.success) {
        // Refresh balance after successful withdrawal
        await fetchBalance();
        await fetchTransactionHistory({ page: 1, limit: 10 });
        return true;
      } else {
        throw new Error(response.error || "Withdrawal failed");
      }
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      dispatch({ type: "SET_TRANSACTION_LOADING", payload: false });
    }
  };

  const makePurchase = async (request: PurchaseRequest): Promise<boolean> => {
    if (!isAuthenticated || !userId) return false;

    try {
      dispatch({ type: "SET_TRANSACTION_LOADING", payload: true });
      const response = await walletApi.makePurchase(userId, request);

      if (response.success) {
        // Refresh balance after successful purchase
        await fetchBalance();
        await fetchTransactionHistory({ page: 1, limit: 10 });
        return true;
      } else {
        throw new Error(response.error || "Purchase failed");
      }
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      dispatch({ type: "SET_TRANSACTION_LOADING", payload: false });
    }
  };

  const checkSufficientBalance = async (amount: number): Promise<boolean> => {
    if (!isAuthenticated || !userId) return false;

    try {
      return await walletApi.hasSufficientBalance(userId, amount);
    } catch (error) {
      console.error("Error checking balance:", error);
      return false;
    }
  };

  const refreshWalletData = async () => {
    await Promise.all([
      fetchBalance(),
      fetchStats(),
      fetchTransactionHistory({ page: 1, limit: 10 }),
    ]);
  };

  const refreshWallet = async () => {
    await fetchBalance();
  };

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  const initiateCharge = async (
    amount: number,
    description?: string,
  ): Promise<string | null> => {
    if (!isAuthenticated || !userId) return null;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      // For now, return null as payment gateway integration is not yet implemented
      // This will be implemented in later phases
      console.log("Payment gateway integration not yet implemented");
      return null;
    } catch (error) {
      handleApiError(error);
      return null;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const verifyCharge = async (
    authority: string,
    status: string,
  ): Promise<boolean> => {
    if (!isAuthenticated || !userId) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      // For now, return false as payment gateway integration is not yet implemented
      // This will be implemented in later phases
      console.log("Payment verification not yet implemented");
      return false;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const value: WalletContextType = {
    state,
    // Convenience properties
    balance: state.balance?.balance || 0,
    walletBalance: state.balance,
    walletStats: state.stats,
    fetchWallet,
    fetchBalance,
    fetchStats,
    fetchTransactionHistory,
    deposit,
    withdraw,
    makePurchase,
    checkSufficientBalance,
    refreshWalletData,
    refreshWallet,
    clearError,
    initiateCharge,
    verifyCharge,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// Hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

// Hook for wallet balance with automatic refresh
export function useWalletBalance() {
  const { state, fetchBalance } = useWallet();

  useEffect(() => {
    if (!state.balance) {
      fetchBalance();
    }
  }, []);

  return {
    balance: state.balance,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchBalance,
  };
}

// Hook for checking sufficient balance
export function useBalanceCheck(amount?: number) {
  const { state, checkSufficientBalance } = useWallet();

  const checkBalance = async (checkAmount?: number) => {
    const amountToCheck = checkAmount || amount;
    if (!amountToCheck) return false;

    return await checkSufficientBalance(amountToCheck);
  };

  const hasSufficientBalance = state.balance
    ? state.balance.balance >= (amount || 0)
    : false;

  return {
    hasSufficientBalance,
    checkBalance,
    balance: state.balance,
  };
}
