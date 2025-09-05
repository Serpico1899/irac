"use client";
import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Login = ({}) => {
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);

  // Prevent SSR issues by only running after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-9rem)] p-6 bg-gray-300">
      <div className="h-[calc(100vh-9rem)] bg-gray-100 flex items-center justify-center">
        <div className="bg-background p-6 rounded-lg shadow-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-700">
            {step === 1 ? "ورود به سیستم" : "تایید کد"}
          </h1>
          <div className="space-y-4">
            {step === 1 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="09123456789"
                />
                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                  ارسال کد
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کد تایید
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="کد 4 رقمی را وارد کنید"
                />
                <button
                  onClick={() => alert("ورود موفق")}
                  className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                  تایید
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full mt-2 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  بازگشت
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
