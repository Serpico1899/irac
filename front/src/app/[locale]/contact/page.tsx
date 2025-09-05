"use client";

import React, { useState, use } from "react";
import Link from "next/link";

// Types
interface ContactForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category: string;
}

interface FormErrors {
  [key: string]: string;
}

interface OfficeInfo {
  title: string;
  title_en: string;
  address: string;
  address_en: string;
  phone: string;
  email: string;
  hours: string;
  hours_en: string;
}

export default function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const isRTL = locale === "fa";

  // Form state
  const [formData, setFormData] = useState<ContactForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Office information
  const officeInfo: OfficeInfo[] = [
    {
      title: "دفتر مرکزی",
      title_en: "Main Office",
      address: "تهران، خیابان ولیعصر، کوچه دانشگاه، پلاک ۱۲",
      address_en: "Tehran, Vali-e Asr Street, University Alley, No. 12",
      phone: "+98 21 8888 9999",
      email: "info@irac.ir",
      hours: "شنبه تا چهارشنبه: ۸:۰۰ - ۱۶:۰۰",
      hours_en: "Saturday to Wednesday: 8:00 - 16:00",
    },
    {
      title: "دفتر اصفهان",
      title_en: "Isfahan Office",
      address: "اصفهان، خیابان چهارباغ عباسی، کوچه هنر، پلاک ۵",
      address_en: "Isfahan, Chaharbagh Abbasi Street, Art Alley, No. 5",
      phone: "+98 31 7777 8888",
      email: "isfahan@irac.ir",
      hours: "شنبه تا چهارشنبه: ۹:۰۰ - ۱۷:۰۰",
      hours_en: "Saturday to Wednesday: 9:00 - 17:00",
    },
  ];

  // Form categories
  const categories = [
    { value: "general", label: "سوال عمومی", label_en: "General Inquiry" },
    {
      value: "courses",
      label: "دوره‌ها و کارگاه‌ها",
      label_en: "Courses & Workshops",
    },
    {
      value: "research",
      label: "همکاری پژوهشی",
      label_en: "Research Collaboration",
    },
    { value: "media", label: "رسانه و مطبوعات", label_en: "Media & Press" },
    { value: "support", label: "پشتیبانی فنی", label_en: "Technical Support" },
  ];

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = isRTL
        ? "نام الزامی است"
        : "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = isRTL
        ? "نام خانوادگی الزامی است"
        : "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = isRTL ? "ایمیل الزامی است" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = isRTL ? "فرمت ایمیل صحیح نیست" : "Invalid email format";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = isRTL ? "موضوع الزامی است" : "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = isRTL ? "پیام الزامی است" : "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = isRTL
        ? "پیام باید حداقل ۱۰ کاراکتر باشد"
        : "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real implementation, send to API
      console.log("Contact form submitted:", formData);

      setSubmitStatus("success");
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        category: "general",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#168c95] to-[#cea87a] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {isRTL ? "تماس با ما" : "Contact Us"}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            {isRTL
              ? "ما اینجا هستیم تا به سوالات شما پاسخ دهیم و در مسیر یادگیری معماری اسلامی همراه شما باشیم"
              : "We're here to answer your questions and support your journey in learning Islamic architecture"}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {isRTL ? "ارسال پیام" : "Send Message"}
              </h2>
              <p className="text-gray-600">
                {isRTL
                  ? "فرم زیر را تکمیل کنید تا در اسرع وقت با شما تماس بگیریم"
                  : "Fill out the form below and we'll get back to you as soon as possible"}
              </p>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 me-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-green-800">
                    {isRTL
                      ? "پیام شما با موفقیت ارسال شد"
                      : "Message sent successfully!"}
                  </span>
                </div>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-600 me-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-800">
                    {isRTL
                      ? "خطا در ارسال پیام. لطفا مجدد تلاش کنید"
                      : "Error sending message. Please try again."}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "نام" : "First Name"} *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                      errors.first_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={
                      isRTL ? "نام خود را وارد کنید" : "Enter your first name"
                    }
                  />
                  {errors.first_name && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "نام خانوادگی" : "Last Name"} *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                      errors.last_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={
                      isRTL
                        ? "نام خانوادگی خود را وارد کنید"
                        : "Enter your last name"
                    }
                  />
                  {errors.last_name && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "ایمیل" : "Email"} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={
                      isRTL ? "example@email.com" : "example@email.com"
                    }
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "تلفن" : "Phone"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors"
                    placeholder={isRTL ? "۰۹۱۲۳۴۵۶۷۸۹" : "+98 912 345 6789"}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "دسته‌بندی" : "Category"}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {isRTL ? category.label : category.label_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "موضوع" : "Subject"} *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                    errors.subject ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={
                    isRTL
                      ? "موضوع پیام خود را وارد کنید"
                      : "Enter message subject"
                  }
                />
                {errors.subject && (
                  <p className="text-red-600 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "پیام" : "Message"} *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors resize-vertical ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={
                    isRTL
                      ? "پیام خود را اینجا بنویسید..."
                      : "Write your message here..."
                  }
                />
                {errors.message && (
                  <p className="text-red-600 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#168c95] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#147a82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {isRTL ? "در حال ارسال..." : "Sending..."}
                  </>
                ) : isRTL ? (
                  "ارسال پیام"
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Office Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {isRTL ? "اطلاعات تماس" : "Contact Information"}
              </h2>

              {officeInfo.map((office, index) => (
                <div
                  key={index}
                  className={`${index > 0 ? "border-t pt-6 mt-6" : ""}`}
                >
                  <h3 className="text-xl font-semibold text-[#168c95] mb-4">
                    {isRTL ? office.title : office.title_en}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-[#cea87a] mt-1 me-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-600">
                        {isRTL ? office.address : office.address_en}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#cea87a] me-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <a
                        href={`tel:${office.phone}`}
                        className="text-gray-600 hover:text-[#168c95] transition-colors"
                      >
                        {office.phone}
                      </a>
                    </div>

                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#cea87a] me-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <a
                        href={`mailto:${office.email}`}
                        className="text-gray-600 hover:text-[#168c95] transition-colors"
                      >
                        {office.email}
                      </a>
                    </div>

                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#cea87a] me-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-600">
                        {isRTL ? office.hours : office.hours_en}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {isRTL ? "شبکه‌های اجتماعی" : "Follow Us"}
              </h3>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <a
                  href="#"
                  className="w-12 h-12 bg-[#168c95] text-white rounded-lg flex items-center justify-center hover:bg-[#147a82] transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zm5.568 16.586c0 1.4-1.137 2.537-2.537 2.537H8.972c-1.4 0-2.537-1.137-2.537-2.537V8.97c0-1.4 1.137-2.537 2.537-2.537h6.076c1.4 0 2.537 1.137 2.537 2.537v7.616z" />
                  </svg>
                </a>

                <a
                  href="#"
                  className="w-12 h-12 bg-[#168c95] text-white rounded-lg flex items-center justify-center hover:bg-[#147a82] transition-colors"
                  aria-label="Telegram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>

                <a
                  href="#"
                  className="w-12 h-12 bg-[#168c95] text-white rounded-lg flex items-center justify-center hover:bg-[#147a82] transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {isRTL ? "دسترسی سریع" : "Quick Links"}
              </h3>

              <div className="space-y-3">
                <Link
                  href={`/${locale}/about`}
                  className="flex items-center text-gray-600 hover:text-[#168c95] transition-colors"
                >
                  <svg
                    className="w-4 h-4 me-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isRTL ? "درباره ما" : "About Us"}
                </Link>

                <Link
                  href={`/${locale}/courses`}
                  className="flex items-center text-gray-600 hover:text-[#168c95] transition-colors"
                >
                  <svg
                    className="w-4 h-4 me-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isRTL ? "دوره‌ها" : "Courses"}
                </Link>

                <Link
                  href={`/${locale}/workshops`}
                  className="flex items-center text-gray-600 hover:text-[#168c95] transition-colors"
                >
                  <svg
                    className="w-4 h-4 me-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isRTL ? "کارگاه‌ها" : "Workshops"}
                </Link>

                <Link
                  href={`/${locale}/articles`}
                  className="flex items-center text-gray-600 hover:text-[#168c95] transition-colors"
                >
                  <svg
                    className="w-4 h-4 me-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isRTL ? "مقالات" : "Articles"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8 pb-0">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {isRTL ? "موقعیت مکانی" : "Location"}
              </h2>
              <p className="text-gray-600 mb-6">
                {isRTL
                  ? "دفتر مرکزی ما در قلب تهران واقع شده است"
                  : "Our main office is located in the heart of Tehran"}
              </p>
            </div>

            {/* Map Placeholder */}
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-500">
                  {isRTL
                    ? "نقشه اینجا نمایش داده می‌شود"
                    : "Map will be displayed here"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {isRTL
                    ? "(Google Maps یا نقشه مناسب)"
                    : "(Google Maps or suitable map integration)"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              {isRTL ? "سوالات متداول" : "Frequently Asked Questions"}
            </h2>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {isRTL
                    ? "چگونه می‌توانم در دوره‌ها ثبت‌نام کنم؟"
                    : "How can I register for courses?"}
                </h3>
                <p className="text-gray-600">
                  {isRTL
                    ? "می‌توانید از طریق وب‌سایت، تماس تلفنی یا مراجعه حضوری به دفتر ما در دوره‌های مختلف ثبت‌نام کنید."
                    : "You can register through our website, phone call, or by visiting our office in person."}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {isRTL
                    ? "آیا دوره‌های آنلاین ارائه می‌دهید؟"
                    : "Do you offer online courses?"}
                </h3>
                <p className="text-gray-600">
                  {isRTL
                    ? "بله، ما دوره‌های آنلاین و ترکیبی (حضوری و مجازی) در زمینه معماری اسلامی ارائه می‌دهیم."
                    : "Yes, we offer online and hybrid courses in Islamic architecture."}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {isRTL
                    ? "مدت زمان پاسخ‌گویی به پیام‌ها چقدر است؟"
                    : "How long does it take to respond to messages?"}
                </h3>
                <p className="text-gray-600">
                  {isRTL
                    ? "معمولاً در عرض ۲۴ ساعت به پیام‌های شما پاسخ می‌دهیم."
                    : "We typically respond to messages within 24 hours."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {isRTL
                    ? "آیا امکان بازدید از کلاس‌ها وجود دارد؟"
                    : "Can I visit classes before enrolling?"}
                </h3>
                <p className="text-gray-600">
                  {isRTL
                    ? "بله، می‌توانید با هماهنگی قبلی از کلاس‌ها و محیط آموزشی بازدید کنید."
                    : "Yes, you can visit our classes and facilities with prior arrangement."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
