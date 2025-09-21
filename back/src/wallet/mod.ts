import { getWalletSetup } from "./getWallet/mod.ts";
import { getBalanceSetup } from "./getBalance/mod.ts";
import { depositSetup } from "./deposit/mod.ts";
import { purchaseSetup } from "./purchase/mod.ts";
import { getTransactionsSetup } from "./getTransactions/mod.ts";
import { adminDepositSetup } from "./adminDeposit/mod.ts";
import { adminWithdrawSetup } from "./adminWithdraw/mod.ts";
import { adjustBalanceSetup } from "./adjustBalance/mod.ts";
import { freezeWalletSetup } from "./freezeWallet/mod.ts";
import { unfreezeWalletSetup } from "./unfreezeWallet/mod.ts";
import { getWalletStatsSetup } from "./getWalletStats/mod.ts";
import { getAllWalletsSetup } from "./getAllWallets/mod.ts";
import { getFinancialReportSetup } from "./getFinancialReport/mod.ts";
import { auditWalletSetup } from "./auditWallet/mod.ts";
import { handleDisputeSetup } from "./handleDispute/mod.ts";

export const walletSetup = () => {
  getWalletSetup();
  getBalanceSetup();
  depositSetup();
  purchaseSetup();
  getTransactionsSetup();
  adminDepositSetup();
  adminWithdrawSetup();
  adjustBalanceSetup();
  freezeWalletSetup();
  unfreezeWalletSetup();
  getWalletStatsSetup();
  getAllWalletsSetup();
  getFinancialReportSetup();
  auditWalletSetup();
  handleDisputeSetup();
};

export * from "./service.ts";
