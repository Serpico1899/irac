import {  setAct  } from "@app";
import {
  getAvailableGateways,
  createUnifiedPayment,
  verifyUnifiedPayment,
  cancelPayment,
  refundPayment,
  getPaymentStatistics,
  getGatewayHealthStatus,
  getTransactionDetails,
  cleanupExpiredTransactions,
} from "./unifiedPayment.fn.ts";
import {
  getAvailableGatewaysValidator,
  createUnifiedPaymentValidator,
  verifyUnifiedPaymentValidator,
  cancelPaymentValidator,
  refundPaymentValidator,
  getPaymentStatisticsValidator,
  getGatewayHealthStatusValidator,
  getTransactionDetailsValidator,
  cleanupExpiredTransactionsValidator,
} from "./unifiedPayment.val.ts";

export const unifiedPaymentSetup = () => {
  // Get available payment gateways
  setAct({
    schema: "main",
    fn: getAvailableGateways,
    validator: getAvailableGatewaysValidator,
  });

  // Create unified payment request
  setAct({
    schema: "main",
    fn: createUnifiedPayment,
    validator: createUnifiedPaymentValidator,
  });

  // Verify unified payment
  setAct({
    schema: "main",
    fn: verifyUnifiedPayment,
    validator: verifyUnifiedPaymentValidator,
  });

  // Cancel payment
  setAct({
    schema: "main",
    fn: cancelPayment,
    validator: cancelPaymentValidator,
  });

  // Refund payment (admin only)
  setAct({
    schema: "main",
    fn: refundPayment,
    validator: refundPaymentValidator,
  });

  // Get payment statistics (admin only)
  setAct({
    schema: "main",
    fn: getPaymentStatistics,
    validator: getPaymentStatisticsValidator,
  });

  // Get gateway health status (admin only)
  setAct({
    schema: "main",
    fn: getGatewayHealthStatus,
    validator: getGatewayHealthStatusValidator,
  });

  // Get transaction details
  setAct({
    schema: "main",
    fn: getTransactionDetails,
    validator: getTransactionDetailsValidator,
  });

  // Cleanup expired transactions (admin only)
  setAct({
    schema: "main",
    fn: cleanupExpiredTransactions,
    validator: cleanupExpiredTransactionsValidator,
  });

  console.log("✅ Unified payment module initialized with multiple gateway support");
};

// Export all validators for external use
export {
  getAvailableGatewaysValidator,
  createUnifiedPaymentValidator,
  verifyUnifiedPaymentValidator,
  cancelPaymentValidator,
  refundPaymentValidator,
  getPaymentStatisticsValidator,
  getGatewayHealthStatusValidator,
  getTransactionDetailsValidator,
  cleanupExpiredTransactionsValidator,
};

// Export all functions for external use
export {
  getAvailableGateways,
  createUnifiedPayment,
  verifyUnifiedPayment,
  cancelPayment,
  refundPayment,
  getPaymentStatistics,
  getGatewayHealthStatus,
  getTransactionDetails,
  cleanupExpiredTransactions,
};
