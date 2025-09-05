import { coreApp } from "../../mod.ts";
import { WalletService } from "./service.ts";
import { boolean, number, optional, string, object, enums } from "@deps";

// Define validation schemas
const depositSchema = object({
  amount: number(),
  payment_method: optional(string()),
  description: optional(string()),
  reference_id: optional(string()),
});

const withdrawSchema = object({
  amount: number(),
  description: optional(string()),
  reference_id: optional(string()),
});

const purchaseSchema = object({
  amount: number(),
  order_id: string(),
  description: optional(string()),
});

const bonusSchema = object({
  user_id: string(),
  amount: number(),
  description: string(),
});

const refundSchema = object({
  transaction_id: string(),
  refund_amount: optional(number()),
  reason: optional(string()),
});

const transactionQuerySchema = object({
  page: optional(number()),
  limit: optional(number()),
  type: optional(string()),
  status: optional(string()),
});

const walletStatusSchema = object({
  user_id: string(),
  status: enums(["active", "suspended", "blocked"]),
  reason: optional(string()),
});

// GET /wallet - Get user wallet info
coreApp.http.router.get("/wallet", {
  authentication: true,
  transform: {
    query: object({
      user_id: optional(string()),
    }),
  },
}, async (ctx) => {
  try {
    const userId = ctx.query?.user_id || ctx.token?.payload?.user_id;

    if (!userId) {
      return ctx.json({ error: "User ID is required" }, 400);
    }

    // Check if requesting own wallet or has admin privileges
    if (ctx.query?.user_id && ctx.query.user_id !== ctx.token?.payload?.user_id) {
      const userLevel = ctx.token?.payload?.level;
      if (userLevel !== "Manager" && userLevel !== "Editor") {
        return ctx.json({ error: "Unauthorized access" }, 403);
      }
    }

    const wallet = await WalletService.getUserWallet(userId);
    return ctx.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// GET /wallet/balance - Get wallet balance
coreApp.http.router.get("/wallet/balance", {
  authentication: true,
}, async (ctx) => {
  try {
    const userId = ctx.token?.payload?.user_id;

    if (!userId) {
      return ctx.json({ error: "User ID is required" }, 400);
    }

    const balance = await WalletService.getBalance(userId);
    return ctx.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// POST /wallet/deposit - Deposit funds to wallet
coreApp.http.router.post("/wallet/deposit", {
  authentication: true,
  transform: {
    body: depositSchema,
  },
}, async (ctx) => {
  try {
    const userId = ctx.token?.payload?.user_id;
    const adminLevel = ctx.token?.payload?.level;

    if (!userId) {
      return ctx.json({ error: "User ID is required" }, 400);
    }

    const { amount, payment_method, description, reference_id } = ctx.body;

    // Only managers can manually deposit funds
    if (!payment_method || payment_method === "manual") {
      if (adminLevel !== "Manager") {
        return ctx.json({ error: "Only managers can manually deposit funds" }, 403);
      }
    }

    const result = await WalletService.deposit(
      userId,
      amount,
      payment_method,
      description,
      reference_id,
      adminLevel === "Manager" ? userId : undefined
    );

    return ctx.json({
      success: true,
      data: result,
      message: `Successfully deposited ${amount} to wallet`,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 400);
  }
});

// POST /wallet/withdraw - Withdraw funds from wallet
coreApp.http.router.post("/wallet/withdraw", {
  authentication: true,
  transform: {
    body: withdrawSchema,
  },
}, async (ctx) => {
  try {
    const userId = ctx.token?.payload?.user_id;

    if (!userId) {
      return ctx.json({ error: "User ID is required" }, 400);
    }

    const { amount, description, reference_id } = ctx.body;

    const result = await WalletService.withdraw(
      userId,
      amount,
      description,
      undefined,
      reference_id
    );

    return ctx.json({
      success: true,
      data: result,
      message: `Successfully withdrew ${amount} from wallet`,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 400);
  }
});

// POST /wallet/purchase - Use wallet for purchase
coreApp.http.router.post("/wallet/purchase", {
  authentication: true,
  transform: {
    body: purchaseSchema,
  },
}, async (ctx) => {
  try {
    const userId = ctx.token?.payload?.user_id;

    if (!userId) {
      return ctx.json({ error: "User ID is required" }, 400);
    }

    const { amount, order_id, description } = ctx.body;

    // Check sufficient balance first
    const hasSufficientBalance = await WalletService.hasSufficientBalance(userId, amount);

    if (!hasSufficientBalance) {
      return ctx.json({
        success: false,
        error: "Insufficient wallet balance",
      }, 400);
    }

    const result = await WalletService.processPurchase(
      userId,
      amount,
      order_id,
      description
    );

    return ctx.json({
      success: true,
      data: result,
      message: `Successfully processed purchase of ${amount}`,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 400);
  }
});

// GET /wallet/transactions - Get transaction history
coreApp.http.router.get("/wallet/transactions", {
  authentication: true,
  transform: {
    query: transactionQuerySchema,
  },
}, async (ctx) => {
  try {
    const userId = ctx.token?.payload?.user_id;

    if (!userId) {
      return ctx.json({ error: "User ID is required" }, 400);
    }

    const { page = 1, limit = 20, type, status } = ctx.query || {};

    const result = await WalletService.getTransactionHistory(
      userId,
      page,
      limit,
      type,
      status
    );

    return ctx.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// GET /wallet/stats - Get wallet statistics
coreApp.http.router.get("/wallet/stats", {
  authentication: true,
}, async (ctx) => {
  try {
    const userId = ctx.token?.payload?.user_id;

    if (!userId) {
      return ctx.json({ error: "User ID is required" }, 400);
    }

    const stats = await WalletService.getWalletStats(userId);

    return ctx.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// POST /wallet/bonus - Add bonus to user wallet (Admin only)
coreApp.http.router.post("/wallet/bonus", {
  authentication: true,
  transform: {
    body: bonusSchema,
  },
}, async (ctx) => {
  try {
    const adminUserId = ctx.token?.payload?.user_id;
    const adminLevel = ctx.token?.payload?.level;

    if (adminLevel !== "Manager") {
      return ctx.json({ error: "Only managers can add bonuses" }, 403);
    }

    const { user_id, amount, description } = ctx.body;

    const result = await WalletService.addBonus(
      user_id,
      amount,
      description,
      adminUserId
    );

    return ctx.json({
      success: true,
      data: result,
      message: `Successfully added bonus of ${amount} to user wallet`,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 400);
  }
});

// POST /wallet/refund - Refund a transaction (Admin only)
coreApp.http.router.post("/wallet/refund", {
  authentication: true,
  transform: {
    body: refundSchema,
  },
}, async (ctx) => {
  try {
    const adminUserId = ctx.token?.payload?.user_id;
    const adminLevel = ctx.token?.payload?.level;

    if (adminLevel !== "Manager" && adminLevel !== "Editor") {
      return ctx.json({ error: "Only managers and editors can process refunds" }, 403);
    }

    const { transaction_id, refund_amount, reason } = ctx.body;

    const result = await WalletService.refund(
      transaction_id,
      refund_amount,
      reason,
      adminUserId
    );

    return ctx.json({
      success: true,
      data: result,
      message: "Refund processed successfully",
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 400);
  }
});

// PUT /wallet/status - Update wallet status (Admin only)
coreApp.http.router.put("/wallet/status", {
  authentication: true,
  transform: {
    body: walletStatusSchema,
  },
}, async (ctx) => {
  try {
    const adminUserId = ctx.token?.payload?.user_id;
    const adminLevel = ctx.token?.payload?.level;

    if (adminLevel !== "Manager") {
      return ctx.json({ error: "Only managers can update wallet status" }, 403);
    }

    const { user_id, status, reason } = ctx.body;

    const result = await WalletService.updateWalletStatus(
      user_id,
      status,
      adminUserId,
      reason
    );

    return ctx.json({
      success: true,
      data: result,
      message: `Wallet status updated to ${status}`,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 400);
  }
});

// GET /wallet/check-balance/:amount - Check if user has sufficient balance
coreApp.http.router.get("/wallet/check-balance/:amount", {
  authentication: true,
}, async (ctx) => {
  try {
    const userId = ctx.token?.payload?.user_id;
    const amount = parseFloat(ctx.params?.amount || "0");

    if (!userId) {
      return ctx.json({ error: "User ID is required" }, 400);
    }

    if (isNaN(amount) || amount <= 0) {
      return ctx.json({ error: "Valid amount is required" }, 400);
    }

    const hasSufficient = await WalletService.hasSufficientBalance(userId, amount);

    return ctx.json({
      success: true,
      data: {
        has_sufficient_balance: hasSufficient,
        requested_amount: amount,
      },
    });
  } catch (error) {
    return ctx.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

export * from "./service.ts";
