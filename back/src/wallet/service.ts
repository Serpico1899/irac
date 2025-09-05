import { coreApp, wallet, wallet_transaction, order } from "../../mod.ts";
import { createUpdateAt } from "@lib";
import { v4 } from "https://deno.land/std@0.208.0/uuid/mod.ts";

export class WalletService {
  // Create a new wallet for a user
  static async createWallet(userId: string, currency: string = "IRR") {
    const existingWallet = await wallet.findOne({
      "user._id": userId,
    });

    if (existingWallet) {
      return existingWallet;
    }

    const newWallet = await wallet.insertOne({
      user: { _id: userId },
      balance: 0,
      currency,
      status: "active",
      is_active: true,
      ...createUpdateAt,
    });

    return newWallet;
  }

  // Get user's wallet
  static async getUserWallet(userId: string) {
    let userWallet = await wallet.findOne({
      "user._id": userId,
    });

    if (!userWallet) {
      userWallet = await this.createWallet(userId);
    }

    return userWallet;
  }

  // Get wallet balance
  static async getBalance(userId: string) {
    const userWallet = await this.getUserWallet(userId);
    return {
      balance: userWallet.balance,
      currency: userWallet.currency,
      status: userWallet.status,
      is_active: userWallet.is_active,
    };
  }

  // Add funds to wallet (deposit)
  static async deposit(
    userId: string,
    amount: number,
    paymentMethod: string = "manual",
    description?: string,
    referenceId?: string,
    adminUserId?: string
  ) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const userWallet = await this.getUserWallet(userId);

    if (!userWallet.is_active || userWallet.status !== "active") {
      throw new Error("Wallet is not active");
    }

    const transactionId = v4.generate();
    const balanceBefore = userWallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Create transaction record
    const transaction = await wallet_transaction.insertOne({
      transaction_id: transactionId,
      wallet: { _id: userWallet._id },
      user: { _id: userId },
      amount,
      currency: userWallet.currency,
      type: "deposit",
      status: "completed",
      payment_method: paymentMethod,
      description: description || `Wallet deposit of ${amount} ${wallet.currency}`,
      reference_id: referenceId,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      processed_by: adminUserId,
      processed_at: new Date().toISOString(),
      ...createUpdateAt,
    });

    // Update wallet balance
    await wallet.updateOne(
      { _id: userWallet._id },
      {
        balance: balanceAfter,
        last_transaction_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    return {
      transaction,
      newBalance: balanceAfter,
      transactionId,
    };
  }

  // Withdraw funds from wallet
  static async withdraw(
    userId: string,
    amount: number,
    description?: string,
    orderId?: string,
    referenceId?: string
  ) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const userWallet = await this.getUserWallet(userId);

    if (!userWallet.is_active || userWallet.status !== "active") {
      throw new Error("Wallet is not active");
    }

    if (userWallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    const transactionId = v4.generate();
    const balanceBefore = userWallet.balance;
    const balanceAfter = balanceBefore - amount;

    // Create transaction record
    const transaction = await wallet_transaction.insertOne({
      transaction_id: transactionId,
      wallet: { _id: userWallet._id },
      user: { _id: userId },
      order: orderId ? { _id: orderId } : undefined,
      amount,
      currency: userWallet.currency,
      type: "withdrawal",
      status: "completed",
      payment_method: "wallet_balance",
      description: description || `Wallet withdrawal of ${amount} ${wallet.currency}`,
      reference_id: referenceId,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      processed_at: new Date().toISOString(),
      ...createUpdateAt,
    });

    // Update wallet balance
    await wallet.updateOne(
      { _id: userWallet._id },
      {
        balance: balanceAfter,
        last_transaction_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    return {
      transaction,
      newBalance: balanceAfter,
      transactionId,
    };
  }

  // Process a purchase using wallet balance
  static async processPurchase(
    userId: string,
    amount: number,
    orderId: string,
    description?: string
  ) {
    return await this.withdraw(
      userId,
      amount,
      description || "Purchase payment",
      orderId,
      `order_${orderId}`
    );
  }

  // Add bonus/reward to wallet
  static async addBonus(
    userId: string,
    amount: number,
    description: string,
    adminUserId?: string
  ) {
    if (amount <= 0) {
      throw new Error("Bonus amount must be positive");
    }

    const userWallet = await this.getUserWallet(userId);
    const transactionId = v4.generate();
    const balanceBefore = userWallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Create transaction record
    const transaction = await wallet_transaction.insertOne({
      transaction_id: transactionId,
      wallet: { _id: userWallet._id },
      user: { _id: userId },
      amount,
      currency: userWallet.currency,
      type: "bonus",
      status: "completed",
      payment_method: "manual",
      description,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      processed_by: adminUserId,
      processed_at: new Date().toISOString(),
      ...createUpdateAt,
    });

    // Update wallet balance
    await wallet.updateOne(
      { _id: userWallet._id },
      {
        balance: balanceAfter,
        last_transaction_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    return {
      transaction,
      newBalance: balanceAfter,
      transactionId,
    };
  }

  // Get transaction history
  static async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    type?: string,
    status?: string
  ) {
    const skip = (page - 1) * limit;

    const filter: any = {
      "user._id": userId,
    };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    const transactions = await wallet_transaction
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await wallet_transaction.countDocuments(filter);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Refund a transaction
  static async refund(
    originalTransactionId: string,
    refundAmount?: number,
    reason?: string,
    adminUserId?: string
  ) {
    const originalTransaction = await wallet_transaction.findOne({
      transaction_id: originalTransactionId,
    });

    if (!originalTransaction) {
      throw new Error("Original transaction not found");
    }

    if (originalTransaction.type === "refund") {
      throw new Error("Cannot refund a refund transaction");
    }

    const amount = refundAmount || originalTransaction.amount;

    if (originalTransaction.type === "deposit") {
      // For deposits, we need to withdraw the refunded amount
      return await this.withdraw(
        originalTransaction.user._id,
        amount,
        `Refund for transaction ${originalTransactionId}: ${reason || "No reason provided"}`,
        undefined,
        `refund_${originalTransactionId}`
      );
    } else if (originalTransaction.type === "withdrawal" || originalTransaction.type === "purchase") {
      // For withdrawals/purchases, we need to deposit back the refunded amount
      return await this.deposit(
        originalTransaction.user._id,
        amount,
        "refund",
        `Refund for transaction ${originalTransactionId}: ${reason || "No reason provided"}`,
        `refund_${originalTransactionId}`,
        adminUserId
      );
    } else {
      throw new Error("Cannot refund this transaction type");
    }
  }

  // Check if user has sufficient balance
  static async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const userWallet = await this.getUserWallet(userId);
    return userWallet.balance >= amount && userWallet.is_active && userWallet.status === "active";
  }

  // Get wallet statistics
  static async getWalletStats(userId: string) {
    const userWallet = await this.getUserWallet(userId);

    const totalDeposits = await wallet_transaction.aggregate([
      { $match: { "user._id": userId, type: "deposit", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]).toArray();

    const totalWithdrawals = await wallet_transaction.aggregate([
      { $match: { "user._id": userId, type: { $in: ["withdrawal", "purchase"] }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]).toArray();

    const recentTransactions = await wallet_transaction
      .find({ "user._id": userId })
      .sort({ created_at: -1 })
      .limit(5)
      .toArray();

    return {
      balance: userWallet.balance,
      currency: userWallet.currency,
      status: userWallet.status,
      totalDeposits: totalDeposits[0] || { total: 0, count: 0 },
      totalWithdrawals: totalWithdrawals[0] || { total: 0, count: 0 },
      recentTransactions,
    };
  }

  // Admin: Update wallet status
  static async updateWalletStatus(
    userId: string,
    status: "active" | "suspended" | "blocked",
    adminUserId?: string,
    reason?: string
  ) {
    const userWallet = await this.getUserWallet(userId);

    await wallet.updateOne(
      { _id: userWallet._id },
      {
        status,
        is_active: status === "active",
        updated_at: new Date().toISOString(),
      }
    );

    // Log status change as a transaction
    if (reason) {
      await wallet_transaction.insertOne({
        transaction_id: v4.generate(),
        wallet: { _id: userWallet._id },
        user: { _id: userId },
        amount: 0,
        currency: userWallet.currency,
        type: status === "blocked" ? "penalty" : "bonus",
        status: "completed",
        payment_method: "manual",
        description: `Wallet status changed to ${status}: ${reason}`,
        balance_before: userWallet.balance,
        balance_after: userWallet.balance,
        processed_by: adminUserId,
        processed_at: new Date().toISOString(),
        ...createUpdateAt,
      });
    }

    return await this.getUserWallet(userId);
  }
}
