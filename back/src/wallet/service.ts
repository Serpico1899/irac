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

  // Get user wallet statistics
  static async getUserWalletStats(userId: string) {
    const userWallet = await this.getUserWallet(userId);

    const totalDeposits = await wallet_transaction.aggregate([
      { $match: { "user._id": userId, type: "deposit", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ] as any[]).toArray();

    const totalWithdrawals = await wallet_transaction.aggregate([
      { $match: { "user._id": userId, type: { $in: ["withdrawal", "purchase"] }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ] as any[]).toArray();

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

  // Admin: Manual deposit to user wallet
  static async adminDeposit(
    userId: string,
    amount: number,
    reason: string,
    adminUserId: string,
    notes?: string
  ) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const userWallet = await this.getUserWallet(userId);
    const transactionId = v4.generate();
    const balanceBefore = userWallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Create admin deposit transaction
    const transaction = await wallet_transaction.insertOne({
      transaction_id: transactionId,
      wallet: { _id: userWallet._id },
      user: { _id: userId },
      amount,
      currency: userWallet.currency,
      type: "admin_deposit",
      status: "completed",
      payment_method: "manual",
      description: `Admin deposit: ${reason}`,
      admin_notes: notes,
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

  // Admin: Manual withdrawal from user wallet
  static async adminWithdraw(
    userId: string,
    amount: number,
    reason: string,
    adminUserId: string,
    notes?: string
  ) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const userWallet = await this.getUserWallet(userId);

    if (userWallet.balance < amount) {
      throw new Error("Insufficient wallet balance for withdrawal");
    }

    const transactionId = v4.generate();
    const balanceBefore = userWallet.balance;
    const balanceAfter = balanceBefore - amount;

    // Create admin withdrawal transaction
    const transaction = await wallet_transaction.insertOne({
      transaction_id: transactionId,
      wallet: { _id: userWallet._id },
      user: { _id: userId },
      amount,
      currency: userWallet.currency,
      type: "admin_withdrawal",
      status: "completed",
      payment_method: "manual",
      description: `Admin withdrawal: ${reason}`,
      admin_notes: notes,
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

  // Admin: Adjust wallet balance to specific amount
  static async adjustBalance(
    userId: string,
    newBalance: number,
    reason: string,
    adminUserId: string,
    notes?: string
  ) {
    if (newBalance < 0) {
      throw new Error("New balance cannot be negative");
    }

    const userWallet = await this.getUserWallet(userId);
    const balanceBefore = userWallet.balance;
    const adjustment = newBalance - balanceBefore;

    if (adjustment === 0) {
      throw new Error("No adjustment needed - balance is already at target amount");
    }

    const transactionId = v4.generate();

    // Create balance adjustment transaction
    const transaction = await wallet_transaction.insertOne({
      transaction_id: transactionId,
      wallet: { _id: userWallet._id },
      user: { _id: userId },
      amount: Math.abs(adjustment),
      currency: userWallet.currency,
      type: "admin_adjustment",
      status: "completed",
      payment_method: "manual",
      description: `Balance adjustment: ${reason} (${adjustment > 0 ? '+' : ''}${adjustment})`,
      admin_notes: `${notes || ''} | Previous balance: ${balanceBefore}, New balance: ${newBalance}`,
      balance_before: balanceBefore,
      balance_after: newBalance,
      processed_by: adminUserId,
      processed_at: new Date().toISOString(),
      ...createUpdateAt,
    });

    // Update wallet balance
    await wallet.updateOne(
      { _id: userWallet._id },
      {
        balance: newBalance,
        last_transaction_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    return {
      transaction,
      oldBalance: balanceBefore,
      newBalance,
      adjustment,
      transactionId,
    };
  }

  // Admin: Freeze/suspend wallet
  static async freezeWallet(
    userId: string,
    reason: string,
    adminUserId: string,
    notes?: string
  ) {
    const userWallet = await this.getUserWallet(userId);

    if (userWallet.status === "suspended") {
      throw new Error("Wallet is already suspended");
    }

    // Update wallet status
    await wallet.updateOne(
      { _id: userWallet._id },
      {
        status: "suspended",
        is_active: false,
        updated_at: new Date().toISOString(),
      }
    );

    // Log freeze action
    const transactionId = v4.generate();
    await wallet_transaction.insertOne({
      transaction_id: transactionId,
      wallet: { _id: userWallet._id },
      user: { _id: userId },
      amount: 0,
      currency: userWallet.currency,
      type: "freeze_penalty",
      status: "completed",
      payment_method: "manual",
      description: `Wallet frozen: ${reason}`,
      admin_notes: notes,
      balance_before: userWallet.balance,
      balance_after: userWallet.balance,
      processed_by: adminUserId,
      processed_at: new Date().toISOString(),
      ...createUpdateAt,
    });

    return await this.getUserWallet(userId);
  }

  // Admin: Unfreeze/reactivate wallet
  static async unfreezeWallet(
    userId: string,
    reason: string,
    adminUserId: string,
    notes?: string
  ) {
    const userWallet = await this.getUserWallet(userId);

    if (userWallet.status === "active") {
      throw new Error("Wallet is already active");
    }

    // Update wallet status
    await wallet.updateOne(
      { _id: userWallet._id },
      {
        status: "active",
        is_active: true,
        updated_at: new Date().toISOString(),
      }
    );

    // Log unfreeze action
    const transactionId = v4.generate();
    await wallet_transaction.insertOne({
      transaction_id: transactionId,
      wallet: { _id: userWallet._id },
      user: { _id: userId },
      amount: 0,
      currency: userWallet.currency,
      type: "unfreeze_bonus",
      status: "completed",
      payment_method: "manual",
      description: `Wallet unfrozen: ${reason}`,
      admin_notes: notes,
      balance_before: userWallet.balance,
      balance_after: userWallet.balance,
      processed_by: adminUserId,
      processed_at: new Date().toISOString(),
      ...createUpdateAt,
    });

    return await this.getUserWallet(userId);
  }

  // Admin: Get all wallets with filtering
  static async getAllWallets(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    sort_by: string;
    sort_order: string;
    min_balance?: number;
    max_balance?: number;
  }) {
    const {
      page,
      limit,
      status,
      search,
      sort_by,
      sort_order,
      min_balance,
      max_balance
    } = params;

    const skip = (page - 1) * limit;
    const filter: any = {};

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by balance range
    if (min_balance !== undefined || max_balance !== undefined) {
      filter.balance = {};
      if (min_balance !== undefined) filter.balance.$gte = min_balance;
      if (max_balance !== undefined) filter.balance.$lte = max_balance;
    }

    // Get wallets with user information
    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: "user",
          localField: "user._id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
    ];

    // Add search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "userInfo.first_name": { $regex: search, $options: "i" } },
            { "userInfo.last_name": { $regex: search, $options: "i" } },
            { "userInfo.email": { $regex: search, $options: "i" } },
          ]
        }
      });
    }

    // Add sorting
    const sortObj: any = {};
    sortObj[sort_by] = sort_order === "asc" ? 1 : -1;
    pipeline.push({ $sort: sortObj });

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const wallets = await wallet.aggregate(pipeline).toArray();

    // Get total count
    const countPipeline: any[] = [...pipeline];
    countPipeline.splice(-2); // Remove skip and limit
    countPipeline.push({ $count: "total" });
    const countResult = await wallet.aggregate(countPipeline).toArray();
    const total = countResult[0]?.total || 0;

    return {
      wallets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Comprehensive wallet statistics
  static async getWalletStats(params: {
    period: string;
    start_date?: string;
    end_date?: string;
    include_dormant: boolean;
  }) {
    const { period, start_date, end_date, include_dormant } = params;

    // Calculate date range based on period
    let dateFilter: any = {};
    const now = new Date();

    if (period !== "all") {
      if (period === "custom" && start_date && end_date) {
        dateFilter.created_at = {
          $gte: start_date,
          $lte: end_date
        };
      } else if (period === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter.created_at = { $gte: today.toISOString() };
      } else if (period === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter.created_at = { $gte: weekAgo.toISOString() };
      } else if (period === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter.created_at = { $gte: monthAgo.toISOString() };
      } else if (period === "year") {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter.created_at = { $gte: yearAgo.toISOString() };
      }
    }

    // Overall wallet statistics
    const totalWallets = await wallet.countDocuments();
    const activeWallets = await wallet.countDocuments({ status: "active" });
    const suspendedWallets = await wallet.countDocuments({ status: "suspended" });
    const blockedWallets = await wallet.countDocuments({ status: "blocked" });

    // Balance statistics
    const balanceStats = await wallet.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
          avgBalance: { $avg: "$balance" },
          maxBalance: { $max: "$balance" },
          minBalance: { $min: "$balance" }
        }
      }
    ] as any[]).toArray();

    // Transaction volume statistics
    const transactionStats = await wallet_transaction.aggregate([
      { $match: { ...dateFilter, status: "completed" } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" }
        }
      }
    ] as any[]).toArray();

    // Most active users
    const activeUsers = await wallet_transaction.aggregate([
      { $match: { ...dateFilter, status: "completed" } },
      {
        $group: {
          _id: "$user._id",
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { transactionCount: -1 } },
      { $limit: 10 }
    ] as any[]).toArray();

    // Dormant wallets (no activity in 90 days)
    let dormantWallets = 0;
    if (include_dormant) {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dormantWallets = await wallet.countDocuments({
        $or: [
          { last_transaction_at: { $lt: ninetyDaysAgo.toISOString() } },
          { last_transaction_at: { $exists: false } }
        ]
      });
    }

    return {
      period,
      dateRange: { start_date, end_date },
      overview: {
        totalWallets,
        activeWallets,
        suspendedWallets,
        blockedWallets,
        dormantWallets: include_dormant ? dormantWallets : null,
      },
      balanceStats: balanceStats[0] || { totalBalance: 0, avgBalance: 0, maxBalance: 0, minBalance: 0 },
      transactionStats,
      activeUsers,
      generatedAt: new Date().toISOString(),
    };
  }

  // Admin: Generate financial reports
  static async getFinancialReport(params: {
    report_type: string;
    start_date?: string;
    end_date?: string;
    breakdown_by: string;
    include_refunds: boolean;
    include_failed: boolean;
    export_format: string;
    currency: string;
  }) {
    const {
      report_type,
      start_date,
      end_date,
      breakdown_by,
      include_refunds,
      include_failed,
      export_format,
      currency
    } = params;

    // Calculate date range
    let dateFilter: any = {};
    const now = new Date();

    if (report_type === "custom" && start_date && end_date) {
      dateFilter.created_at = { $gte: start_date, $lte: end_date };
    } else if (report_type === "monthly") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter.created_at = { $gte: monthStart.toISOString() };
    } else if (report_type === "quarterly") {
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      dateFilter.created_at = { $gte: quarterStart.toISOString() };
    } else if (report_type === "yearly") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      dateFilter.created_at = { $gte: yearStart.toISOString() };
    }

    // Status filter
    const statusFilter: any[] = ["completed"];
    if (include_refunds) statusFilter.push("refunded");
    if (include_failed) statusFilter.push("failed");

    // Base match criteria
    const matchCriteria: any = {
      ...dateFilter,
      status: { $in: statusFilter },
      currency: currency
    };

    // Revenue by breakdown
    const breakdownPipeline: any[] = [
      { $match: matchCriteria },
      {
        $group: {
          _id: breakdown_by === "source" ? "$type" :
            breakdown_by === "payment_method" ? "$payment_method" : "$type",
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ];

    const breakdownResults = await wallet_transaction.aggregate(breakdownPipeline).toArray();

    // Overall summary
    const summaryResults = await wallet_transaction.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          avgTransactionAmount: { $avg: "$amount" },
          maxTransactionAmount: { $max: "$amount" },
          minTransactionAmount: { $min: "$amount" }
        }
      }
    ] as any[]).toArray();

    // Success/failure rates
    const statusStats = await wallet_transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ] as any[]).toArray();

    const report = {
      reportType: report_type,
      dateRange: { start_date, end_date },
      currency,
      summary: summaryResults[0] || { totalRevenue: 0, totalTransactions: 0 },
      breakdown: breakdownResults,
      statusBreakdown: statusStats,
      generatedAt: new Date().toISOString(),
      parameters: {
        breakdown_by,
        include_refunds,
        include_failed,
        export_format
      }
    };

    // Convert to CSV if requested
    if (export_format === "csv") {
      // Simple CSV conversion for breakdown data
      const csvData = breakdownResults.map(item =>
        `${item._id},${item.totalAmount},${item.transactionCount},${item.avgAmount}`
      ).join('\n');

      return {
        ...report,
        csvData: `Category,Total Amount,Transaction Count,Average Amount\n${csvData}`
      };
    }

    return report;
  }

  // Admin: Audit specific wallet
  static async auditWallet(params: {
    user_id: string;
    start_date?: string;
    end_date?: string;
    transaction_types?: string[];
    include_suspicious: boolean;
    detailed: boolean;
    verify_balance: boolean;
  }) {
    const {
      user_id,
      start_date,
      end_date,
      transaction_types,
      include_suspicious,
      detailed,
      verify_balance
    } = params;

    const userWallet = await this.getUserWallet(user_id);

    // Build date filter
    const dateFilter: any = {};
    if (start_date || end_date) {
      dateFilter.created_at = {};
      if (start_date) dateFilter.created_at.$gte = start_date;
      if (end_date) dateFilter.created_at.$lte = end_date;
    }

    // Build transaction filter
    const transactionFilter: any = {
      "user._id": user_id,
      ...dateFilter
    };

    if (transaction_types && transaction_types.length > 0) {
      transactionFilter.type = { $in: transaction_types };
    }

    // Get all transactions
    const transactions = await wallet_transaction
      .find(transactionFilter)
      .sort({ created_at: -1 })
      .toArray();

    // Balance verification
    let balanceVerification: any = null;
    if (verify_balance) {
      const calculatedBalance = transactions.reduce((sum, tx) => {
        if (tx.type === "deposit" || tx.type === "admin_deposit" || tx.type === "refund" || tx.type === "bonus") {
          return sum + tx.amount;
        } else if (tx.type === "withdrawal" || tx.type === "admin_withdrawal" || tx.type === "purchase" || tx.type === "penalty") {
          return sum - tx.amount;
        }
        return sum;
      }, 0);

      balanceVerification = {
        currentBalance: userWallet.balance,
        calculatedBalance,
        isValid: Math.abs(userWallet.balance - calculatedBalance) < 0.01,
        discrepancy: userWallet.balance - calculatedBalance
      };
    }

    // Suspicious activity detection
    let suspiciousActivity: any[] = [];
    if (include_suspicious) {
      // Large transactions (>100000 IRR)
      const largeTransactions = transactions.filter(tx => tx.amount > 100000);

      // Multiple failed transactions
      const failedTransactions = transactions.filter(tx => tx.status === "failed");
      const rapidFailures = failedTransactions.filter((tx, index) => {
        if (index === 0) return false;
        const prevTx = failedTransactions[index - 1];
        const timeDiff = new Date(tx.created_at).getTime() - new Date(prevTx.created_at).getTime();
        return timeDiff < 60000; // Within 1 minute
      });

      // Admin actions
      const adminActions = transactions.filter(tx =>
        tx.type.startsWith("admin_") || tx.processed_by
      );

      suspiciousActivity = [
        ...largeTransactions.map(tx => ({ type: "large_transaction", transaction: tx })),
        ...rapidFailures.map(tx => ({ type: "rapid_failure", transaction: tx })),
        ...adminActions.map(tx => ({ type: "admin_action", transaction: tx }))
      ];
    }

    // Transaction summary
    const summary = {
      totalTransactions: transactions.length,
      successfulTransactions: transactions.filter(tx => tx.status === "completed").length,
      failedTransactions: transactions.filter(tx => tx.status === "failed").length,
      totalDeposits: transactions.filter(tx =>
        tx.type === "deposit" || tx.type === "admin_deposit"
      ).reduce((sum, tx) => sum + tx.amount, 0),
      totalWithdrawals: transactions.filter(tx =>
        tx.type === "withdrawal" || tx.type === "admin_withdrawal" || tx.type === "purchase"
      ).reduce((sum, tx) => sum + tx.amount, 0),
      adminInterventions: transactions.filter(tx => tx.processed_by).length
    };

    return {
      wallet: userWallet,
      auditPeriod: { start_date, end_date },
      summary,
      balanceVerification,
      suspiciousActivity: include_suspicious ? suspiciousActivity : null,
      transactions: detailed ? transactions : transactions.slice(0, 10), // Limit if not detailed
      auditedAt: new Date().toISOString(),
    };
  }

  // Admin: Handle dispute resolution
  static async handleDispute(params: {
    transaction_id: string;
    dispute_action: string;
    refund_amount?: number;
    resolution_notes: string;
    internal_notes?: string;
    notify_user: boolean;
    escalate: boolean;
    admin_user_id: string;
  }) {
    const {
      transaction_id,
      dispute_action,
      refund_amount,
      resolution_notes,
      internal_notes,
      notify_user,
      escalate,
      admin_user_id
    } = params;

    // Find the original transaction
    const originalTransaction = await wallet_transaction.findOne({
      transaction_id: transaction_id
    });

    if (!originalTransaction) {
      throw new Error("Original transaction not found");
    }

    if (originalTransaction.status === "disputed") {
      throw new Error("Transaction is already under dispute");
    }

    let result: any = {
      originalTransaction,
      dispute_action,
      resolution_notes,
      processed_at: new Date().toISOString(),
      admin_user_id
    };

    // Process based on dispute action
    switch (dispute_action) {
      case "refund":
        // Full refund
        result.refund = await this.refund(
          transaction_id,
          originalTransaction.amount,
          `Dispute resolution: ${resolution_notes}`,
          admin_user_id
        );
        break;

      case "partial_refund":
        if (!refund_amount || refund_amount <= 0) {
          throw new Error("Refund amount is required for partial refund");
        }
        // Partial refund
        result.refund = await this.refund(
          transaction_id,
          refund_amount,
          `Dispute resolution (partial): ${resolution_notes}`,
          admin_user_id
        );
        break;

      case "reject":
        // Reject dispute - no financial action
        result.action = "dispute_rejected";
        break;

      case "investigate":
        // Mark for further investigation
        result.action = "under_investigation";
        if (escalate) {
          result.escalated = true;
        }
        break;

      default:
        throw new Error("Invalid dispute action");
    }

    // Update original transaction status
    await wallet_transaction.updateOne(
      { transaction_id: transaction_id },
      {
        status: dispute_action === "investigate" ? "disputed" : "resolved",
        admin_notes: `${originalTransaction.admin_notes || ''}\nDispute: ${resolution_notes}`,
        updated_at: new Date().toISOString()
      }
    );

    // Create dispute resolution record
    const disputeTransactionId = v4.generate();
    await wallet_transaction.insertOne({
      transaction_id: disputeTransactionId,
      wallet: originalTransaction.wallet,
      user: originalTransaction.user,
      amount: 0,
      currency: originalTransaction.currency,
      type: "dispute_resolution",
      status: "completed",
      payment_method: "manual",
      description: `Dispute resolution for ${transaction_id}: ${dispute_action}`,
      admin_notes: internal_notes,
      reference_id: transaction_id,
      balance_before: result.refund?.newBalance || 0,
      balance_after: result.refund?.newBalance || 0,
      processed_by: admin_user_id,
      processed_at: new Date().toISOString(),
      ...createUpdateAt,
    });

    return result;
  }
}
