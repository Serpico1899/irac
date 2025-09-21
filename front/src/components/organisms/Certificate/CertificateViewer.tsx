"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

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
}

interface CertificateViewerProps {
  certificate: CertificateData;
  locale?: string;
  showWatermark?: boolean;
  printMode?: boolean;
  className?: string;
}

const CertificateViewer: React.FC<CertificateViewerProps> = ({
  certificate,
  locale = "fa",
  showWatermark = false,
  printMode = false,
  className = "",
}) => {
  const t = useTranslations("Certificate");
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

  return (
    <div
      className={`relative bg-background border-4 border-primary rounded-lg mx-auto ${
        printMode ? "print:shadow-none" : "shadow-2xl"
      } ${className}`}
      style={{
        maxWidth: "210mm", // A4 width
        minHeight: "297mm", // A4 height
        aspectRatio: "210/297",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full flex flex-wrap items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-32 h-32 border border-primary rounded-full m-8 flex items-center justify-center"
            >
              <div className="w-20 h-20 border border-primary rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full opacity-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-background text-3xl font-bold">IRAC</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-primary">
                {locale === "fa"
                  ? "مرکز معماری ایران"
                  : t("iranianArchitectureCenter")}
              </h1>
              <p className="text-sm text-text-secondary">
                {locale === "fa"
                  ? t("iranianArchitectureCenter")
                  : "Iranian Architecture Center"}
              </p>
            </div>
          </div>

          <div className="flex flex-col text-right">
            <div className="w-16 h-16 border-2 border-accent rounded-lg flex items-center justify-center mb-2">
              <span className="text-2xl">🏛️</span>
            </div>
            <div className="text-xs text-text-light">
              {certificate.certificate_number}
            </div>
          </div>
        </div>

        {/* Decorative Border */}
        <div className="flex items-center mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          <div className="px-4">
            <div className="w-8 h-8 border-2 border-accent rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-accent rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
        </div>

        {/* Certificate Title */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4 font-vazir">
            {locale === "fa"
              ? `${t("certificateOf")} ${t("completion")}`
              : `${t("certificateOf")} ${t("completion")}`}
          </h2>
          <h3 className="text-2xl font-semibold text-text-secondary">
            {locale === "fa"
              ? "Certificate of Completion"
              : `Certificate of ${t("completion")}`}
          </h3>

          {/* Decorative element */}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-4 h-4 border-2 border-accent rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-accent rounded-full"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center text-center mb-12 flex-1 justify-center">
          <p className="text-xl font-medium text-text mb-6 font-vazir">
            {locale === "fa" ? t("viewer.certificateOf") : ""}
          </p>
          <p className="text-lg text-text-secondary mb-4">
            {locale === "fa"
              ? "This is to certify that"
              : t("viewer.certificateOf")}
          </p>

          <div className="bg-background-primary rounded-lg p-6 mb-8 border-l-4 border-primary">
            <h4 className="text-4xl font-bold text-primary mb-2 font-vazir">
              {certificate.student_name}
            </h4>
            {certificate.student_name_en && (
              <p className="text-xl text-text-secondary">
                {certificate.student_name_en}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center mb-8">
            <p className="text-xl font-medium text-text mb-4 font-vazir">
              {locale === "fa"
                ? `دوره ${certificate.course_type || "آموزشی"} به نام`
                : ""}
            </p>
            <p className="text-lg text-text-secondary mb-6">
              {locale === "fa"
                ? "has successfully completed the course"
                : t("viewer.hasSuccessfullyCompleted")}
            </p>

            <div className="bg-gradient-to-r from-primary to-accent text-background rounded-lg p-6 max-w-md">
              <h5 className="text-2xl font-bold mb-2 font-vazir text-center">
                {certificate.course_name}
              </h5>
              {certificate.course_name_en && (
                <p className="text-lg text-center opacity-90">
                  {certificate.course_name_en}
                </p>
              )}
            </div>
          </div>

          <p className="text-xl font-medium text-text font-vazir">
            {locale === "fa" ? t("viewer.hasSuccessfullyCompleted") : ""}
          </p>

          {certificate.final_grade && (
            <div className="mt-6 bg-accent-primary text-background rounded-full px-6 py-2">
              <span className="font-bold">
                {locale === "fa"
                  ? `${t("finalGrade")}: ${certificate.final_grade}/100`
                  : `${t("finalGrade")}: ${certificate.final_grade}/100`}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pt-8 border-t border-background-secondary">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-text-secondary">
              <span className="font-medium">{t("completionDate")}:</span>{" "}
              {formatDate(certificate.completion_date)}
            </div>
            <div className="text-sm text-text-secondary">
              <span className="font-medium">{t("issueDate")}:</span>{" "}
              {formatDate(certificate.issue_date)}
            </div>
            <div className="text-xs text-text-light mt-2">
              {t("certificateNumber")}: {certificate.certificate_number}
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 border-b-2 border-text-light mb-2 flex items-end justify-center pb-1">
              <div className="text-xs text-text-light">
                {locale === "fa" ? t("viewer.signature") : "Signature"}
              </div>
            </div>
            <p className="font-semibold text-text font-vazir">
              {certificate.instructor_name}
            </p>
            <p className="text-sm text-text-secondary">
              {locale === "fa" ? t("courseInstructor") : "Course Instructor"}
            </p>
            <p className="text-xs text-text-light mt-1">
              {locale === "fa" ? "Course Instructor" : t("courseInstructor")}
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 border-b-2 border-text-light mb-2 flex items-end justify-center pb-1">
              <div className="text-xs text-text-light">
                {locale === "fa"
                  ? `${t("viewer.officialSeal")} و ${t("viewer.signature")}`
                  : "Official Seal & Signature"}
              </div>
            </div>
            <p className="font-semibold text-text font-vazir">
              {locale === "fa"
                ? "مرکز معماری ایران"
                : t("iranianArchitectureCenter")}
            </p>
            <p className="text-sm text-text-secondary">
              {locale === "fa" ? t("educationDirector") : "Education Director"}
            </p>
            <p className="text-xs text-text-light mt-1">
              {locale === "fa" ? "Education Director" : t("educationDirector")}
            </p>
          </div>
        </div>

        {/* Verification QR Code Area */}
        <div className="flex items-center justify-center mt-8 pt-4 border-t border-background-darkest">
          <div className="flex items-center gap-4 text-xs text-text-light">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-2 border-text-lighter rounded-lg flex items-center justify-center mb-1">
                <span className="text-lg">🔍</span>
              </div>
              <span>{locale === "fa" ? "کد تایید" : "Verification"}</span>
            </div>
            <div className="flex flex-col">
              <span>
                {locale === "fa"
                  ? t("viewer.verifyAtUrl")
                  : t("viewer.verifyAtUrl")}
              </span>
              <span className="text-primary font-medium">
                irac.ir/verify/{certificate.certificate_number}
              </span>
            </div>
          </div>
        </div>

        {/* Watermark for preview */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="transform rotate-45 text-6xl font-bold text-text-lightest opacity-10">
              {locale === "fa" ? t("viewer.watermarkPreview") : "PREVIEW"}
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          .print\\:shadow-none {
            box-shadow: none;
          }
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateViewer;
