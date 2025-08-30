"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import LoginStepOne from "@/components/organisms/login/LoginStepOne";
import LoginStepTwo from "@/components/organisms/login/LoginStepTwo";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";

const Login = () => {
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const t = useTranslations("Login");

  // Ensure this only renders on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCodeEntered = (
    token: string,
    level: string,
    nationalNumber: string,
  ) => {
    // Convert level to our UserLevel type
    const userLevel = level as "Ghost" | "Manager" | "Editor" | "Normal" | null;

    // Call login from auth context
    login(token, userLevel, nationalNumber);
  };

  // Return loading state during server-side rendering and hydration
  if (!mounted) {
    return (
      <div className="w-full min-h-[calc(100vh-9rem)] p-6 bg-gray-300">
        <div className="h-[calc(100vh-9rem)] bg-gray-100 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
              <p className="mt-4 text-gray-700">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-9rem)] p-6 bg-gray-300">
      <div className="h-[calc(100vh-9rem)] bg-gray-100 flex items-center justify-center">
        <div className="bg-background p-6 rounded-lg shadow-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-700">
            {step === 1 ? t("stepOneTitle") : t("stepTwoTitle")}
          </h1>
          {step === 1 ? (
            <LoginStepOne setStep={setStep} setPhone={setPhone} phone={phone} />
          ) : (
            <LoginStepTwo
              setStep={setStep}
              phone={phone}
              onCodeEntered={handleCodeEntered}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
