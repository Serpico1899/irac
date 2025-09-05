"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import WalletBalance from "@/components/organisms/Wallet/WalletBalance";
import TransactionHistory from "@/components/organisms/Wallet/TransactionHistory";
import ChargeWallet from "@/components/organisms/Wallet/ChargeWallet";
import WalletStats from "@/components/organisms/Wallet/WalletStats";
import {
  Wallet,
  CreditCard,
  BarChart3,
  History,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Calendar,
  PlusCircle,
  Settings,
} from "lucide-react";

export default function WalletPage() {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, userLevel } = useAuth();
  const { state, refreshWalletData } = useWallet();

  const [activeTab, setActiveTab] = useState("overview");
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await refreshWalletData();
    setIsRefreshing(false);
  };

  const handleChargeSuccess = (amount: number) => {
    setShowChargeForm(false);
    // Optionally show success message or redirect
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (showChargeForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChargeForm(false)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">شارژ کیف پول</h1>
          </div>

          <ChargeWallet
            onSuccess={handleChargeSuccess}
            onCancel={() => setShowChargeForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg xs:text-xl font-bold text-gray-900">
                کیف پول
              </h1>
              {isAuthenticated && (
                <p className="text-xs text-gray-600">
                  کاربر {userLevel || "عادی"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="p-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Quick Balance Card - Always visible */}
          <WalletBalance showActions={false} className="mb-6" />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              onClick={() => setShowChargeForm(true)}
              className="h-14 flex-col gap-2"
              disabled={state.balance?.status !== "active"}
            >
              <PlusCircle className="h-5 w-5" />
              <span className="text-xs xs:text-sm">شارژ کیف پول</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setActiveTab("history")}
              className="h-14 flex-col gap-2"
            >
              <History className="h-5 w-5" />
              <span className="text-xs xs:text-sm">تاریخچه تراکنش</span>
            </Button>
          </div>

          {/* Status Alert */}
          {state.balance && state.balance.status !== "active" && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-yellow-800 mb-1">
                      کیف پول غیرفعال
                    </h3>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                      {state.balance.status === "suspended"
                        ? "کیف پول شما موقتاً تعلیق شده است. برای فعال‌سازی مجدد با پشتیبانی تماس بگیرید."
                        : state.balance.status === "blocked"
                          ? "کیف پول شما مسدود شده است. لطفاً با پشتیبانی تماس بگیرید."
                          : "کیف پول شما غیرفعال است."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 text-xs xs:text-sm py-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden xs:inline">آمارها</span>
                <span className="xs:hidden">آمار</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center gap-2 text-xs xs:text-sm py-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden xs:inline">تاریخچه</span>
                <span className="xs:hidden">سابقه</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2 text-xs xs:text-sm py-2"
              >
                <Settings className="h-4 w-4" />
                <span>تنظیمات</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              <WalletStats showRecentTransactions={true} />
            </TabsContent>

            {/* Transaction History Tab */}
            <TabsContent value="history" className="space-y-6 mt-0">
              <TransactionHistory
                showFilters={true}
                showExport={false}
                limit={10}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-0">
              <Card>
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <span className="text-lg xs:text-xl">تنظیمات کیف پول</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                  <div className="space-y-3">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          اعلان‌های تراکنش
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          دریافت اطلاع‌رسانی برای تراکنش‌های کیف پول
                        </p>
                      </div>
                      <div className="self-end xs:self-auto">
                        <Badge variant="secondary">فعال</Badge>
                      </div>
                    </div>

                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          محدودیت روزانه
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          حداکثر مبلغ برداشت روزانه
                        </p>
                      </div>
                      <div className="self-end xs:self-auto">
                        <Badge variant="outline">۵,۰۰۰,۰۰۰ تومان</Badge>
                      </div>
                    </div>

                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          تأیید دو مرحله‌ای
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          امنیت بیشتر برای تراکنش‌های بالا
                        </p>
                      </div>
                      <div className="self-end xs:self-auto">
                        <Badge variant="secondary">غیرفعال</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full h-12 text-base">
                      مشاهده تنظیمات کامل
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      نیاز به کمک دارید؟
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      برای سوالات مربوط به کیف پول با تیم پشتیبانی ما تماس
                      بگیرید
                    </p>
                    <Button variant="outline" className="w-full xs:w-auto">
                      تماس با پشتیبانی
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 xs:hidden">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => setActiveTab("overview")}
            className="h-12 flex-col gap-1"
            size="sm"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">آمار</span>
          </Button>

          <Button
            onClick={() => setShowChargeForm(true)}
            className="h-12 flex-col gap-1 bg-primary hover:bg-primary/90"
            size="sm"
            disabled={state.balance?.status !== "active"}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="text-xs">شارژ</span>
          </Button>

          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
            className="h-12 flex-col gap-1"
            size="sm"
          >
            <History className="h-4 w-4" />
            <span className="text-xs">سابقه</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
