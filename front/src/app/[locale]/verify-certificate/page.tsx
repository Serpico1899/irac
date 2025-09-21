"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import CertificateVerification from "@/components/organisms/Certificate/CertificateVerification";
import { Loader } from "@/components/organisms/Loader";

interface VerifyPageProps {
  params: {
    locale: string;
  };
}

// Separate component to handle search params
const VerificationContent: React.FC<{ locale: string }> = ({ locale }) => {
  const t = useTranslations("Certificate");
  const searchParams = useSearchParams();
  const [initialCertNumber, setInitialCertNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const isRTL = locale === "fa";

  useEffect(() => {
    // Get certificate number from URL parameter
    const certId =
      searchParams.get("id") || searchParams.get("certificate") || "";
    if (certId) {
      setInitialCertNumber(certId);
    }
  }, [searchParams]);

  const handleVerificationResult = (result: any) => {
    setVerificationResult(result);

    // Update page title based on result
    if (result) {
      document.title = isRTL
        ? `${t("verification.title")} ${result.certificate_number} - ${t("iranianArchitectureCenter")}`
        : `Certificate ${result.certificate_number} Verified - IRAC`;
    } else {
      document.title = isRTL
        ? `${t("verification.title")} - ${t("iranianArchitectureCenter")}`
        : `${t("verification.title")} - IRAC`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO and Meta Information */}
      <div className="sr-only">
        <h1>
          {t("verification.title")} - {t("iranianArchitectureCenter")}
        </h1>
        <p>{t("verification.subtitle")}</p>
        <p>
          {locale === "fa"
            ? "سیستم آنلاین تایید اعتبار گواهینامه‌های صادر شده توسط مرکز معماری ایران. با وارد کردن شماره گواهینامه، اعتبار آن را بررسی کنید."
            : "Online verification system for certificates issued by Iranian Architecture Center. Enter certificate number to verify authenticity."}
        </p>
      </div>

      <div className="flex flex-col min-h-screen">
        {/* Header Navigation */}
        <div className="bg-background border-b border-background-secondary">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a
                  href={`/${locale}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-background font-bold text-sm">
                      IRAC
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text">
                      {t("iranianArchitectureCenter")}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {t("verification.title")}
                    </span>
                  </div>
                </a>
              </div>

              <div className="flex items-center gap-4">
                {/* Language Toggle */}
                <div className="flex bg-background-secondary rounded-lg p-1">
                  <a
                    href={`/fa/verify-certificate${
                      initialCertNumber ? `?id=${initialCertNumber}` : ""
                    }`}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      locale === "fa"
                        ? "bg-primary text-background"
                        : "text-text-secondary hover:text-text"
                    }`}
                  >
                    فارسی
                  </a>
                  <a
                    href={`/en/verify-certificate${
                      initialCertNumber ? `?id=${initialCertNumber}` : ""
                    }`}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      locale === "en"
                        ? "bg-primary text-background"
                        : "text-text-secondary hover:text-text"
                    }`}
                  >
                    English
                  </a>
                </div>

                {/* Back to Main Site */}
                <a
                  href={`/${locale}`}
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary hover:text-background transition-colors rounded-lg border border-primary"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
                  </svg>
                  <span>
                    {locale === "fa"
                      ? "بازگشت به سایت اصلی"
                      : "Back to Main Site"}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <CertificateVerification
            locale={locale}
            initialCertificateNumber={initialCertNumber}
            onVerificationResult={handleVerificationResult}
            className="w-full max-w-4xl"
          />
        </div>

        {/* Footer */}
        <div className="bg-background border-t border-background-secondary">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-4">
                <p>
                  © {new Date().getFullYear()} {t("iranianArchitectureCenter")}
                </p>
                <span className="hidden md:inline">|</span>
                <p>
                  {locale === "fa"
                    ? "تمامی حقوق محفوظ است"
                    : "All rights reserved"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href={`/${locale}/contact`}
                  className="hover:text-text transition-colors"
                >
                  {locale === "fa" ? "تماس با ما" : "Contact Us"}
                </a>
                <span>|</span>
                <a
                  href={`/${locale}/privacy`}
                  className="hover:text-text transition-colors"
                >
                  {locale === "fa" ? "حریم خصوصی" : "Privacy Policy"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VerifyCertificatePage: React.FC<VerifyPageProps> = ({ params }) => {
  const { locale } = params;

  return (
    <Suspense fallback={<Loader />}>
      <VerificationContent locale={locale} />
    </Suspense>
  );
};

export default VerifyCertificatePage;
