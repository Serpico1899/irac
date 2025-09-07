"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import WalletDeposit from "@/components/organisms/Wallet/WalletDeposit";
import {
  WalletIcon,
  CreditCardIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  BanknotesIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
}

const WalletPage: React.FC = () => {
  const t = useTranslations("wallet");
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { balance, state, refreshWallet, fetchTransactionHistory } =
    useWallet();

  const [activeSection, setActiveSection] = useState<
    "overview" | "deposit" | "history"
  >("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshWallet();
      await fetchTransactionHistory({ page: 1, limit: 5 });
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      handleRefresh();
    }
  }, [isAuthenticated, user]);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: "deposit",
      title: "شارژ کیف پول",
      description: "از طریق درگاه امن",
      icon: PlusIcon,
      action: () => setActiveSection("deposit"),
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      id: "history",
      title: "تاریخچه تراکنش",
      description: "مشاهده تمام تراکنش‌ها",
      icon: ClockIcon,
      action: () => setActiveSection("history"),
      color: "bg-green-50 text-green-600 border-green-200",
    },
  ];

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <ArrowPathIcon className="h-6 w-6 animate-spin" />
          در حال بارگیری...
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-lg border border-gray-200 max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            دسترسی محدود
          </h2>
          <p className="text-gray-600 mb-4">
            برای مشاهده کیف پول باید وارد شوید
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ورود به سیستم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/user/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowRightIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <WalletIcon className="h-6 w-6 text-blue-600" />
                  کیف پول دیجیتال
                </h1>
                <p className="text-sm text-gray-600">
                  {user.name || user.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`h-5 w-5 text-gray-600 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="h-6 w-6" />
              <span className="font-medium">موجودی کیف پول</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-100">به‌روزرسانی:</p>
              <p className="text-xs text-blue-100">
                {new Date().toLocaleString("fa-IR")}
              </p>
            </div>
          </div>

          <div className="text-center py-4">
            <div className="text-3xl sm:text-4xl font-bold mb-2">
              {balance.toLocaleString("fa-IR")}
            </div>
            <div className="text-blue-100">تومان</div>
          </div>

          {/* Wallet Status */}
          <div className="flex items-center justify-center pt-4 border-t border-blue-500/30">
            <div className="flex items-center gap-2 text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">کیف پول فعال</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                activeSection ===
                action.id
                  .replace("deposit", "deposit")
                  .replace("history", "history")
                  ? action.color
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    activeSection ===
                    action.id
                      .replace("deposit", "deposit")
                      .replace("history", "history")
                      ? "bg-white/20"
                      : "bg-gray-100"
                  }`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Recent Transactions */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5" />
                    آخرین تراکنش‌ها
                  </h3>
                </div>
                <div className="p-4">
                  {state.transactions?.length > 0 ? (
                    <div className="space-y-4">
                      {state.transactions
                        .slice(0, 5)
                        .map((transaction: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  transaction.type === "deposit"
                                    ? "bg-green-100"
                                    : "bg-red-100"
                                }`}
                              >
                                <BanknotesIcon
                                  className={`h-4 w-4 ${
                                    transaction.type === "deposit"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {transaction.description || transaction.type}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(
                                    transaction.created_at,
                                  ).toLocaleDateString("fa-IR")}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`font-medium ${
                                transaction.type === "deposit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "deposit" ? "+" : "-"}
                              {transaction.amount.toLocaleString("fa-IR")} تومان
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>هیچ تراکنشی ثبت نشده است</p>
                      <button
                        onClick={() => setActiveSection("deposit")}
                        className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        اولین شارژ خود را انجام دهید
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <h4 className="font-medium mb-2">
                      راهنمای کیف پول دیجیتال
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • کیف پول شما برای پرداخت دوره‌ها و خرید محصولات استفاده
                        می‌شود
                      </li>
                      <li>• امکان شارژ از طریق درگاه امن زرین‌پال</li>
                      <li>• تمام تراکنش‌ها ایمن و قابل پیگیری هستند</li>
                      <li>• موجودی شما هیچ‌گاه منقضی نمی‌شود</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deposit Section */}
          {activeSection === "deposit" && (
            <div>
              <WalletDeposit />

              <div className="mt-6">
                <button
                  onClick={() => setActiveSection("overview")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                  بازگشت به نمای کلی
                </button>
              </div>
            </div>
          )}

          {/* History Section */}
          {activeSection === "history" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">
                    تاریخچه کامل تراکنش‌ها
                  </h3>
                </div>
                <div className="p-4">
                  {state.transactions?.length > 0 ? (
                    <div className="space-y-4">
                      {state.transactions.map(
                        (transaction: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-3 rounded-lg ${
                                  transaction.type === "deposit"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                <BanknotesIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {transaction.description ||
                                    (transaction.type === "deposit"
                                      ? "واریز به کیف پول"
                                      : "برداشت از کیف پول")}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(
                                    transaction.created_at,
                                  ).toLocaleDateString("fa-IR")}{" "}
                                  -
                                  {new Date(
                                    transaction.created_at,
                                  ).toLocaleTimeString("fa-IR")}
                                </p>
                                {transaction.reference_id && (
                                  <p className="text-xs text-gray-500 font-mono">
                                    کد پیگیری: {transaction.reference_id}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-left">
                              <div
                                className={`font-bold text-lg ${
                                  transaction.type === "deposit"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.type === "deposit" ? "+" : "-"}
                                {transaction.amount.toLocaleString("fa-IR")}
                              </div>
                              <div className="text-xs text-gray-500">تومان</div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <ClockIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">
                        تاریخچه تراکنش موجود نیست
                      </p>
                      <p className="text-sm">
                        پس از اولین تراکنش، تاریخچه در اینجا نمایش داده می‌شود
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setActiveSection("overview")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                  بازگشت به نمای کلی
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
