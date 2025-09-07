import { getWalletSetup } from "./getWallet/mod.ts";
import { getBalanceSetup } from "./getBalance/mod.ts";
import { depositSetup } from "./deposit/mod.ts";
import { purchaseSetup } from "./purchase/mod.ts";
import { getTransactionsSetup } from "./getTransactions/mod.ts";

export const walletSetup = () => {
  getWalletSetup();
  getBalanceSetup();
  depositSetup();
  purchaseSetup();
  getTransactionsSetup();
};

export * from "./service.ts";
