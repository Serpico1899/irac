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
  final_grade?: number;
  template_id?: string;
}

interface CertificateTemplateProps {
  certificate: CertificateData;
  template: "standard" | "premium" | "workshop" | "multilingual";
  locale?: string;
  preview?: boolean;
  className?: string;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  certificate,
  template,
  locale = "fa",
  preview = false,
  className = "",
}) => {
  const t = useTranslations("Certificate");
  const isRTL = locale === "fa";

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

  const renderStandardTemplate = () => (
    <div className="bg-background border-4 border-primary rounded-lg p-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="flex flex-wrap justify-center items-center h-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-24 h-24 border border-primary rounded-full m-6 flex items-center justify-center"
            >
              <div className="w-16 h-16 border border-primary rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[700px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-background text-xl font-bold">IRAC</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-primary">
                مرکز معماری ایران
              </h1>
              <p className="text-sm text-text-secondary">
                Iranian Architecture Center
              </p>
            </div>
          </div>
          <div className="text-xs text-text-light font-mono">
            {certificate.certificate_number}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4 font-vazir">
            گواهینامه تکمیل دوره
          </h2>
          <h3 className="text-2xl font-semibold text-text-secondary">
            Certificate of Completion
          </h3>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-accent rounded-full"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center text-center mb-auto">
          <p className="text-xl text-text mb-6 font-vazir">
            اینجانب به تایید می‌رسد که
          </p>

          <div className="bg-background-primary rounded-lg p-6 mb-8">
            <h4 className="text-3xl font-bold text-primary mb-2 font-vazir">
              {certificate.student_name}
            </h4>
            {certificate.student_name_en && (
              <p className="text-lg text-text-secondary">
                {certificate.student_name_en}
              </p>
            )}
          </div>

          <p className="text-xl text-text mb-4 font-vazir">دوره</p>
          <div className="bg-gradient-to-r from-primary to-accent text-background rounded-lg p-4 mb-8 max-w-md">
            <h5 className="text-xl font-bold font-vazir">
              {certificate.course_name}
            </h5>
            {certificate.course_name_en && (
              <p className="text-sm opacity-90">{certificate.course_name_en}</p>
            )}
          </div>
          <p className="text-xl text-text font-vazir">
            را با موفقیت به پایان رسانده است
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pt-8 border-t border-background-secondary">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-text-secondary">
              تاریخ تکمیل: {formatDate(certificate.completion_date)}
            </div>
            <div className="text-sm text-text-secondary">
              تاریخ صدور: {formatDate(certificate.issue_date)}
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-16 border-b-2 border-text-light mb-2"></div>
            <p className="font-semibold text-text font-vazir">
              {certificate.instructor_name}
            </p>
            <p className="text-sm text-text-secondary">مدرس دوره</p>
          </div>
        </div>
      </div>

      {/* Preview Watermark */}
      {preview && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-45 text-6xl font-bold text-text-lightest opacity-10">
            پیش‌نمایش
          </div>
        </div>
      )}
    </div>
  );

  const renderPremiumTemplate = () => (
    <div className="bg-gradient-to-br from-background to-background-primary border-4 border-accent-primary rounded-xl p-12 relative overflow-hidden shadow-2xl">
      {/* Premium Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="flex flex-wrap justify-center items-center h-full">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-32 h-32 border-2 border-accent-primary rounded-lg m-4 flex items-center justify-center transform rotate-45"
            >
              <div className="w-20 h-20 border border-accent rounded-lg transform -rotate-45"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[700px]">
        {/* Premium Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-primary to-accent rounded-full flex items-center justify-center mb-4">
            <span className="text-background text-2xl font-bold">🏛️</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            مرکز معماری ایران
          </h1>
          <p className="text-accent-primary font-semibold">
            Iranian Architecture Center
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent mt-2"></div>
        </div>

        {/* Premium Title */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="bg-gradient-to-r from-accent-primary to-accent text-background rounded-full px-6 py-2 mb-4">
            <span className="font-bold">گواهینامه ویژه</span>
          </div>
          <h2 className="text-4xl font-bold text-primary mb-2 font-vazir">
            گواهینامه تکمیل دوره پیشرفته
          </h2>
          <h3 className="text-2xl font-semibold text-accent">
            Premium Certificate of Advanced Completion
          </h3>
        </div>

        {/* Premium Content */}
        <div className="flex flex-col items-center text-center mb-auto">
          <div className="bg-gradient-to-r from-primary to-accent text-background rounded-xl p-8 mb-8 max-w-lg">
            <p className="text-lg mb-4 opacity-90">
              This prestigious certificate is awarded to
            </p>
            <p className="text-lg mb-4 font-vazir opacity-90">
              این گواهینامه ارزشمند به
            </p>
            <h4 className="text-3xl font-bold mb-4">
              {certificate.student_name}
            </h4>
            {certificate.student_name_en && (
              <p className="text-lg opacity-90">
                {certificate.student_name_en}
              </p>
            )}
          </div>

          <div className="bg-background-primary rounded-xl p-6 border-l-4 border-accent-primary mb-8">
            <p className="text-lg text-text mb-2">
              in recognition of outstanding completion of
            </p>
            <p className="text-lg text-text mb-4 font-vazir">
              به پاس تکمیل برجسته دوره
            </p>
            <h5 className="text-2xl font-bold text-primary font-vazir">
              {certificate.course_name}
            </h5>
            {certificate.course_name_en && (
              <p className="text-lg text-text-secondary mt-2">
                {certificate.course_name_en}
              </p>
            )}
            {certificate.final_grade && (
              <div className="mt-4 bg-accent-primary text-background rounded-full px-4 py-2 inline-block">
                <span className="font-bold">
                  Grade: {certificate.final_grade}/100
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Premium Footer */}
        <div className="flex items-end justify-between pt-8 border-t-2 border-accent-primary">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-text">
              <span className="font-semibold">Completion:</span>{" "}
              {formatDate(certificate.completion_date)}
            </div>
            <div className="text-sm text-text">
              <span className="font-semibold">Issued:</span>{" "}
              {formatDate(certificate.issue_date)}
            </div>
            <div className="text-xs text-text-light font-mono mt-2">
              {certificate.certificate_number}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-40 h-20 border-b-3 border-accent-primary mb-2 flex items-end justify-center">
              <div className="w-8 h-8 bg-accent-primary rounded-full mb-2"></div>
            </div>
            <p className="font-bold text-text">{certificate.instructor_name}</p>
            <p className="text-sm text-accent-primary">
              Premium Course Instructor
            </p>
          </div>
        </div>
      </div>

      {/* Preview Watermark */}
      {preview && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-45 text-6xl font-bold text-accent opacity-10">
            PREMIUM
          </div>
        </div>
      )}
    </div>
  );

  const renderWorkshopTemplate = () => (
    <div className="bg-background border-3 border-accent rounded-xl p-10 relative overflow-hidden">
      {/* Workshop Background */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-accent rounded-full opacity-10"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-primary rounded-full opacity-10"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[650px]">
        {/* Workshop Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-background text-xl">🔧</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-accent">
                کارگاه مرکز معماری
              </h1>
              <p className="text-sm text-text-secondary">
                Architecture Workshop
              </p>
            </div>
          </div>
          <div className="bg-accent text-background px-3 py-1 rounded-full text-xs font-bold">
            WORKSHOP
          </div>
        </div>

        {/* Workshop Title */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-accent text-background rounded-lg px-6 py-2 mb-4">
            <span className="font-bold">گواهینامه کارگاه</span>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2 font-vazir">
            گواهینامه تکمیل کارگاه
          </h2>
          <h3 className="text-xl font-semibold text-accent">
            Workshop Completion Certificate
          </h3>
        </div>

        {/* Workshop Content */}
        <div className="flex flex-col items-center text-center mb-auto">
          <div className="bg-background-primary rounded-lg p-6 border border-accent mb-6">
            <p className="text-lg text-text mb-2">شرکت‌کننده</p>
            <p className="text-sm text-text-secondary mb-4">Participant</p>
            <h4 className="text-2xl font-bold text-primary font-vazir">
              {certificate.student_name}
            </h4>
            {certificate.student_name_en && (
              <p className="text-text-secondary mt-2">
                {certificate.student_name_en}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-1 bg-accent rounded-full"></div>
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-background rounded-full"></div>
            </div>
            <div className="w-12 h-1 bg-accent rounded-full"></div>
          </div>

          <div className="bg-accent bg-opacity-10 rounded-lg p-6 border-l-4 border-accent">
            <p className="text-lg text-text mb-2 font-vazir">کارگاه</p>
            <p className="text-sm text-text-secondary mb-4">Workshop</p>
            <h5 className="text-xl font-bold text-accent font-vazir">
              {certificate.course_name}
            </h5>
            {certificate.course_name_en && (
              <p className="text-text-secondary mt-2">
                {certificate.course_name_en}
              </p>
            )}
          </div>
        </div>

        {/* Workshop Footer */}
        <div className="flex items-end justify-between pt-6 border-t border-accent">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-text-secondary">
              تاریخ تکمیل: {formatDate(certificate.completion_date)}
            </div>
            <div className="text-sm text-text-secondary">
              تاریخ صدور: {formatDate(certificate.issue_date)}
            </div>
            <div className="text-xs text-text-light font-mono">
              {certificate.certificate_number}
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-12 border-b-2 border-accent mb-2"></div>
            <p className="font-semibold text-text">
              {certificate.instructor_name}
            </p>
            <p className="text-xs text-accent">Workshop Leader</p>
            <p className="text-xs text-text-secondary">مسئول کارگاه</p>
          </div>
        </div>
      </div>

      {/* Preview Watermark */}
      {preview && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-45 text-5xl font-bold text-accent opacity-10">
            WORKSHOP
          </div>
        </div>
      )}
    </div>
  );

  const renderMultilingualTemplate = () => (
    <div className="bg-background border-4 border-primary rounded-lg p-10 relative overflow-hidden">
      {/* Multilingual Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-6xl text-primary transform rotate-12">🇮🇷</div>
          <div className="text-6xl text-primary transform -rotate-12">🌍</div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[700px]">
        {/* Bilingual Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-3">
              <span className="text-background text-lg font-bold">IRAC</span>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-primary">
                مرکز معماری ایران
              </h1>
              <div className="w-20 h-0.5 bg-primary my-1"></div>
              <p className="text-sm text-text-secondary">
                Iranian Architecture Center
              </p>
            </div>
          </div>
        </div>

        {/* Bilingual Title */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-primary text-background rounded-lg px-6 py-2 mb-4">
            <div className="flex items-center gap-3">
              <span className="font-bold font-vazir">گواهینامه</span>
              <div className="w-px h-4 bg-background opacity-50"></div>
              <span className="font-bold">Certificate</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2 font-vazir">
            گواهینامه تکمیل دوره
          </h2>
          <h3 className="text-2xl font-semibold text-text-secondary">
            Certificate of Completion
          </h3>
        </div>

        {/* Dual-Language Content */}
        <div className="flex flex-col mb-auto">
          {/* Student Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-1 bg-background-primary rounded-lg p-6 border-r-4 border-primary">
              <p className="text-lg text-text mb-3 font-vazir">
                اینجانب به تایید می‌رسد که
              </p>
              <h4 className="text-2xl font-bold text-primary font-vazir mb-2">
                {certificate.student_name}
              </h4>
              <p className="text-lg text-text font-vazir">
                دوره زیر را با موفقیت به پایان رسانده است
              </p>
            </div>
            <div className="flex-1 bg-background-primary rounded-lg p-6 border-l-4 border-primary">
              <p className="text-lg text-text mb-3">This is to certify that</p>
              <h4 className="text-2xl font-bold text-primary mb-2">
                {certificate.student_name_en || certificate.student_name}
              </h4>
              <p className="text-lg text-text">
                has successfully completed the course
              </p>
            </div>
          </div>

          {/* Course Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-1 text-center">
              <div className="bg-gradient-to-r from-primary to-accent text-background rounded-lg p-6">
                <h5 className="text-xl font-bold font-vazir mb-2">
                  {certificate.course_name}
                </h5>
                <p className="text-sm opacity-90">دوره</p>
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="bg-gradient-to-r from-accent to-primary text-background rounded-lg p-6">
                <h5 className="text-xl font-bold mb-2">
                  {certificate.course_name_en || certificate.course_name}
                </h5>
                <p className="text-sm opacity-90">Course</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bilingual Footer */}
        <div className="flex flex-col md:flex-row gap-8 pt-8 border-t-2 border-primary">
          <div className="flex-1">
            <div className="text-sm text-text-secondary mb-4">
              <div>تاریخ تکمیل: {formatDate(certificate.completion_date)}</div>
              <div>تاریخ صدور: {formatDate(certificate.issue_date)}</div>
              <div className="font-mono text-xs mt-2">
                {certificate.certificate_number}
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="w-32 h-12 border-b-2 border-text-light mb-2"></div>
              <p className="font-semibold text-text font-vazir">
                {certificate.instructor_name}
              </p>
              <p className="text-xs text-text-secondary">مدرس دوره</p>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-text-secondary mb-4">
              <div>Completion: {formatDate(certificate.completion_date)}</div>
              <div>Issue Date: {formatDate(certificate.issue_date)}</div>
            </div>
            <div className="flex flex-col items-start">
              <div className="w-32 h-12 border-b-2 border-text-light mb-2"></div>
              <p className="font-semibold text-text">
                {certificate.instructor_name}
              </p>
              <p className="text-xs text-text-secondary">Course Instructor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Watermark */}
      {preview && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-45 text-5xl font-bold text-primary opacity-10">
            BILINGUAL
          </div>
        </div>
      )}
    </div>
  );

  const templates = {
    standard: renderStandardTemplate,
    premium: renderPremiumTemplate,
    workshop: renderWorkshopTemplate,
    multilingual: renderMultilingualTemplate,
  };

  const renderTemplate = templates[template] || templates.standard;

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div
        className="bg-background shadow-2xl print:shadow-none"
        style={{
          aspectRatio: "210/297", // A4 aspect ratio
          minHeight: "800px",
        }}
      >
        {renderTemplate()}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
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

export default CertificateTemplate;
