"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import CertificateViewer from "./CertificateViewer";

interface CertificateData {
  certificate_number: string;
  student_name: string;
  student_name_en?: string;
  course_name: string;
  course_name_en?: string;
  course_type?: string;
  instructor_name: string;
  issue_date: Date | string;
  completion_date: Date | string;
  verification_hash: string;
  template_id?: string;
  final_grade?: number;
  verify_url?: string;
  download_url?: string;
}

interface CertificateDownloadProps {
  certificate: CertificateData;
  locale?: string;
  className?: string;
}

const CertificateDownload: React.FC<CertificateDownloadProps> = ({
  certificate,
  locale = "fa",
  className = "",
}) => {
  const t = useTranslations("Certificate");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const isRTL = locale === "fa";

  const handleDownloadPDF = async () => {
    setIsDownloading("pdf");
    try {
      // In a real implementation, this would call the backend API to generate PDF
      const response = await fetch(
        `/api/certificate/download/${certificate.certificate_number}?format=pdf`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/pdf",
          },
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `certificate-${certificate.certificate_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Failed to download PDF");
      }
    } catch (error) {
      console.error("PDF download failed:", error);
      // TODO: Show error toast/notification
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPNG = async () => {
    setIsDownloading("png");
    try {
      // This would use html2canvas or similar library to convert certificate to image
      if (certificateRef.current) {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });

        const link = document.createElement("a");
        link.download = `certificate-${certificate.certificate_number}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } catch (error) {
      console.error("PNG download failed:", error);
      // TODO: Show error toast/notification
    } finally {
      setIsDownloading(null);
    }
  };

  const handlePrint = () => {
    setIsDownloading("print");
    try {
      // Create a new window with just the certificate for printing
      const printWindow = window.open("", "_blank");
      if (printWindow && certificateRef.current) {
        const certificateHTML = certificateRef.current.innerHTML;
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Certificate - ${certificate.certificate_number}</title>
              <style>
                @import url('/fonts/vazirmatn/vazirmatn.css');
                body {
                  margin: 0;
                  font-family: 'Vazirmatn', sans-serif;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                @page {
                  size: A4;
                  margin: 0;
                }
              </style>
              <link rel="stylesheet" href="/globals.css">
            </head>
            <body>
              ${certificateHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    } catch (error) {
      console.error("Print failed:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleCopyVerifyLink = async () => {
    const verifyUrl =
      certificate.verify_url ||
      `${window.location.origin}/verify-certificate?id=${certificate.certificate_number}`;

    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleShare = (platform: string) => {
    const verifyUrl =
      certificate.verify_url ||
      `${window.location.origin}/verify-certificate?id=${certificate.certificate_number}`;

    const shareText = isRTL
      ? `گواهینامه تکمیل دوره ${certificate.course_name} - مرکز معماری ایران`
      : `Certificate of Completion: ${certificate.course_name_en || certificate.course_name} - IRAC`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(verifyUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(verifyUrl)}&text=${encodeURIComponent(shareText)}`,
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(
        shareUrls[platform as keyof typeof shareUrls],
        "_blank",
        "width=600,height=400",
      );
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Download Actions */}
      <div className="flex flex-col gap-4 p-6 bg-background-primary rounded-xl border border-background-secondary">
        <h3 className="text-xl font-bold text-text mb-2">
          {t("download.title")}
        </h3>

        <div className="flex flex-wrap gap-3">
          {/* PDF Download */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading === "pdf"}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            {isDownloading === "pdf" ? (
              <span>{t("download.downloading")}</span>
            ) : (
              <span>{t("download.formatPDF")}</span>
            )}
          </button>

          {/* PNG Download */}
          <button
            onClick={handleDownloadPNG}
            disabled={isDownloading === "png"}
            className="flex items-center gap-2 px-4 py-3 bg-accent text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19C20.1,21 21,20.1 21,19Z" />
            </svg>
            {isDownloading === "png" ? (
              <span>{t("download.downloading")}</span>
            ) : (
              <span>{t("download.formatPNG")}</span>
            )}
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            disabled={isDownloading === "print"}
            className="flex items-center gap-2 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" />
            </svg>
            <span>{t("actions.print")}</span>
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-3 bg-background-secondary text-text rounded-lg hover:bg-background-darkest transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
            </svg>
            <span>
              {showPreview
                ? locale === "fa"
                  ? "مخفی کردن"
                  : "Hide Preview"
                : t("viewer.preview")}
            </span>
          </button>
        </div>
      </div>

      {/* Sharing Options */}
      <div className="flex flex-col gap-4 p-6 bg-background-primary rounded-xl border border-background-secondary">
        <h3 className="text-xl font-bold text-text mb-2">
          {isRTL ? "اشتراک‌گذاری" : "Share Certificate"}
        </h3>

        <div className="flex flex-wrap gap-3">
          {/* Copy Verification Link */}
          <button
            onClick={handleCopyVerifyLink}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              copied
                ? "bg-green-500 text-background"
                : "bg-background-secondary text-text hover:bg-background-darkest"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
            </svg>
            <span>
              {copied ? t("sharing.linkCopied") : t("sharing.verificationLink")}
            </span>
          </button>

          {/* Social Media Sharing */}
          <button
            onClick={() => handleShare("linkedin")}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-background rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19S5.19 5.95 5.19 6.88A1.69 1.69 0 0 0 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" />
            </svg>
            <span>LinkedIn</span>
          </button>

          <button
            onClick={() => handleShare("twitter")}
            className="flex items-center gap-2 px-4 py-3 bg-blue-400 text-background rounded-lg hover:bg-blue-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
            </svg>
            <span>Twitter</span>
          </button>

          <button
            onClick={() => handleShare("telegram")}
            className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-background rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <span>Telegram</span>
          </button>
        </div>
      </div>

      {/* Certificate Preview */}
      {showPreview && (
        <div className="mt-6">
          <div ref={certificateRef} className="max-w-2xl mx-auto">
            <CertificateViewer
              certificate={certificate}
              locale={locale}
              showWatermark={true}
              className="scale-75 origin-top"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateDownload;
