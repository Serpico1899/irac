"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

interface VerificationResult {
  certificate_number: string;
  verified: boolean;
  valid: boolean;
  status: "active" | "revoked";
  student: {
    name: string;
    name_en?: string;
  };
  course: {
    name: string;
    name_en?: string;
    type: string;
    level?: string;
    duration_hours?: number;
    featured_image_url?: string;
  };
  instructor_name: string;
  issue_date: Date | string;
  completion_date: Date | string;
  final_grade?: number;
  verification_hash: string;
  verified_at: Date;
  institution: {
    name: string;
    name_en: string;
    name_fa: string;
    code: string;
  };
}

interface CertificateVerificationProps {
  locale?: string;
  className?: string;
  initialCertificateNumber?: string;
  onVerificationResult?: (result: VerificationResult | null) => void;
}

const CertificateVerification: React.FC<CertificateVerificationProps> = ({
  locale = "fa",
  className = "",
  initialCertificateNumber = "",
  onVerificationResult,
}) => {
  const t = useTranslations("Certificate");
  const [certificateNumber, setCertificateNumber] = useState(
    initialCertificateNumber,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const isRTL = locale === "fa";

  // Auto-verify if initial certificate number is provided
  React.useEffect(() => {
    if (initialCertificateNumber && initialCertificateNumber.trim()) {
      handleVerify();
    }
  }, [initialCertificateNumber]);

  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (locale === "fa") {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  };

  const handleVerify = async () => {
    if (!certificateNumber.trim()) {
      setError(t("verification.enterCertificateNumber"));
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await fetch("/api/verifyCertificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          set: {
            certificate_number: certificateNumber.trim(),
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.verified) {
        setVerificationResult(data.data);
        onVerificationResult?.(data.data);
      } else {
        setError(data.error || t("verification.notFound"));
        onVerificationResult?.(null);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(t("verification.verificationFailed"));
      onVerificationResult?.(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const resetVerification = () => {
    setCertificateNumber("");
    setVerificationResult(null);
    setError(null);
  };

  return (
    <div className={`flex flex-col max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-background"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2 font-vazir">
          {t("verification.title")}
        </h1>
        <p className="text-text-secondary max-w-2xl">
          {t("verification.subtitle")}
        </p>
      </div>

      {/* Main Verification Card */}
      <div className="bg-background rounded-2xl shadow-lg border border-background-secondary p-8 mb-8">
        {!verificationResult ? (
          <div className="flex flex-col gap-6">
            {/* Certificate Number Input */}
            <div className="flex flex-col gap-3">
              <label className="text-lg font-semibold text-text">
                {t("certificateNumber")}
              </label>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("verification.certificateNumberPlaceholder")}
                  className="flex-1 px-4 py-4 border-2 border-background-secondary rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 text-lg font-mono"
                  disabled={isVerifying}
                />
                <button
                  onClick={handleVerify}
                  disabled={isVerifying || !certificateNumber.trim()}
                  className="px-8 py-4 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold whitespace-nowrap"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("verification.verifying")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                      </svg>
                      <span>{t("verification.verifyButton")}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* QR Scanner Section */}
            <div className="flex flex-col items-center gap-4 pt-6 border-t border-background-secondary">
              <p className="text-text-secondary text-center">
                {t("verification.scanQR")}
              </p>
              <button
                onClick={() => setShowQRScanner(!showQRScanner)}
                className="flex items-center gap-2 px-6 py-3 border-2 border-accent text-accent rounded-lg hover:bg-accent hover:text-background transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,11H21V13H19V11M5,3H9V7H5V3M11,3H13V5H11V3M19,3H21V5H19V3M5,15H7V17H5V15M3,19H5V21H3V19M5,19H9V21H5V19M11,19H13V21H11V19M15,19H17V21H15V19M19,15H21V19H19V15Z" />
                </svg>
                <span>
                  {showQRScanner
                    ? t("actions.close")
                    : t("verification.scanQR")}
                </span>
              </button>

              {/* QR Scanner Placeholder */}
              {showQRScanner && (
                <div className="w-full max-w-sm bg-background-secondary rounded-lg p-6 text-center">
                  <div className="w-full h-48 bg-background-darkest rounded-lg flex items-center justify-center mb-4">
                    <div className="flex flex-col items-center gap-2 text-text-light">
                      <svg
                        className="w-12 h-12"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4,4H10V10H4V4M20,4V10H14V4H20M14,15H16V13H14V11H16V13H18V11H20V13H18V15H20V18H18V20H16V18H13V20H11V16H14V15M16,15V18H18V15H16M4,20V14H10V20H4M6,6V8H8V6H6M16,6V8H18V6H16M6,16V18H8V16H6M4,11H6V13H4V11M9,11H13V15H9V11M11,6H13V10H11V6M2,2V6H0V0H6V2H2M22,0V6H20V2H16V0H22M2,16H0V22H6V20H2V16M22,20H20V22H16V20H22V22Z" />
                      </svg>
                      <span className="text-sm">
                        {isRTL
                          ? "قابلیت اسکن QR به زودی..."
                          : "QR scanning coming soon..."}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {isRTL
                      ? "فعلاً از ورود دستی شماره گواهینامه استفاده کنید"
                      : "Please use manual certificate number entry for now"}
                  </p>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>
        ) : (
          /* Verification Results */
          <div className="flex flex-col gap-6">
            {/* Success Header */}
            <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.41,10.09L6,11.5L11,16.5Z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-green-800 mb-1">
                  {t("verification.verified")}
                </h2>
                <p className="text-green-700">
                  {locale === "fa"
                    ? "این گواهینامه به صورت رسمی توسط مرکز معماری ایران صادر شده است"
                    : `This certificate has been officially issued by ${t("iranianArchitectureCenter")}`}
                </p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="flex flex-col gap-6">
              {/* Student Information */}
              <div className="bg-background-primary rounded-xl p-6">
                <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                  </svg>
                  {t("verification.studentName")}
                </h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-text-secondary text-sm">
                      {t("verification.studentName")}:
                    </span>
                    <p className="font-semibold text-text text-xl">
                      {verificationResult.student.name}
                    </p>
                    {verificationResult.student.name_en && (
                      <p className="text-text-secondary">
                        {verificationResult.student.name_en}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div className="bg-background-primary rounded-xl p-6">
                <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                  </svg>
                  {t("verification.courseName")}
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="font-bold text-xl text-text mb-1">
                      {verificationResult.course.name}
                    </p>
                    {verificationResult.course.name_en && (
                      <p className="text-text-secondary">
                        {verificationResult.course.name_en}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary">
                        {t("verification.courseType")}:
                      </span>
                      <span className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full font-medium">
                        {verificationResult.course.type}
                      </span>
                    </div>

                    {verificationResult.course.level && (
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary">
                          {locale === "fa" ? "سطح:" : "Level:"}
                        </span>
                        <span className="px-3 py-1 bg-accent bg-opacity-20 text-accent rounded-full font-medium">
                          {verificationResult.course.level}
                        </span>
                      </div>
                    )}

                    {verificationResult.course.duration_hours && (
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary">
                          {locale === "fa" ? "مدت:" : "Duration:"}
                        </span>
                        <span className="font-medium text-text">
                          {verificationResult.course.duration_hours}{" "}
                          {locale === "fa" ? "ساعت" : "hours"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-text-secondary"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                    </svg>
                    <span className="text-text-secondary text-sm">
                      {t("instructor")}:
                    </span>
                    <span className="font-medium text-text">
                      {verificationResult.instructor_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="bg-background-primary rounded-xl p-6">
                <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
                  </svg>
                  {locale === "fa" ? "جزئیات گواهینامه" : "Certificate Details"}
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <span className="text-text-secondary text-sm">
                        {t("certificateNumber")}:
                      </span>
                      <p className="font-mono font-bold text-text text-lg">
                        {verificationResult.certificate_number}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          verificationResult.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {verificationResult.status === "active"
                          ? t("active")
                          : t("revoked")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <span className="text-text-secondary text-sm">
                        {t("completionDate")}:
                      </span>
                      <p className="font-medium text-text">
                        {formatDate(verificationResult.completion_date)}
                      </p>
                    </div>
                    <div className="flex-1">
                      <span className="text-text-secondary text-sm">
                        {t("issueDate")}:
                      </span>
                      <p className="font-medium text-text">
                        {formatDate(verificationResult.issue_date)}
                      </p>
                    </div>
                  </div>

                  {verificationResult.final_grade && (
                    <div>
                      <span className="text-text-secondary text-sm">
                        {t("finalGrade")}:
                      </span>
                      <p className="font-bold text-accent-primary text-xl">
                        {verificationResult.final_grade}/100
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Institution Information */}
              <div className="bg-gradient-to-r from-primary to-accent text-background rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                  </svg>
                  {t("verification.institutionName")}
                </h3>
                <div className="flex flex-col gap-2">
                  <p className="text-xl font-bold">
                    {verificationResult.institution.name_fa}
                  </p>
                  <p className="text-lg opacity-90">
                    {verificationResult.institution.name_en}
                  </p>
                  <p className="text-sm opacity-75">
                    {locale === "fa" ? "کد مؤسسه:" : "Institution Code:"}{" "}
                    {verificationResult.institution.code}
                  </p>
                </div>
              </div>

              {/* Verification Timestamp */}
              <div className="text-center text-sm text-text-light">
                {locale === "fa"
                  ? `${t("verification.verificationDate")}: ${formatDate(verificationResult.verified_at)}`
                  : `${t("verification.verificationDate")}: ${formatDate(verificationResult.verified_at)}`}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-background-secondary">
              <button
                onClick={resetVerification}
                className="flex-1 px-6 py-3 bg-background-secondary text-text rounded-lg hover:bg-background-darkest transition-colors font-medium"
              >
                {locale === "fa"
                  ? "تایید گواهینامه جدید"
                  : "Verify Another Certificate"}
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-background transition-colors font-medium"
              >
                {t("actions.print")} {locale === "fa" ? "نتیجه" : "Result"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Information */}
      <div className="bg-background-primary rounded-xl border border-background-secondary p-6">
        <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
          </svg>
          {t("verification.securityFeatures")}
        </h3>
        <div className="flex flex-col gap-3 text-sm text-text-secondary">
          <p>
            {locale === "fa"
              ? `• همه گواهینامه‌های صادر شده توسط ${t("iranianArchitectureCenter")} دارای شماره منحصر به فرد و کد تایید امنیتی هستند`
              : `• All certificates issued by ${t("iranianArchitectureCenter")} have unique numbers and security verification codes`}
          </p>
          <p>
            {locale === "fa"
              ? "• گواهینامه‌های معتبر در پایگاه داده مرکز ثبت و قابل تایید هستند"
              : "• Valid certificates are registered in our database and can be verified"}
          </p>
          <p>
            {isRTL
              ? "• در صورت شک در اعتبار گواهینامه، با مرکز معماری ایران تماس بگیرید"
              : "• If you have doubts about certificate authenticity, contact Iranian Architecture Center"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;
