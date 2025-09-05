"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Types
interface UserProfile {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar?: {
    url: string;
    alt?: string;
  };
  bio?: string;
  bio_en?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  city?: string;
  country?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  profession?: string;
  organization?: string;
  education_level?: string;
  interests?: string[];
  language_preference: string;
  email_notifications: boolean;
  marketing_notifications: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData extends Partial<UserProfile> {
  confirm_email?: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function UserProfile({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const router = useRouter();

  // State management
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const isRTL = locale === "fa";

  // Prevent SSR issues
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

  // Mock data - In real implementation, this would come from API
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        const mockProfile: UserProfile = {
          _id: "user-123",
          first_name: "احمد",
          last_name: "محمدی",
          email: "ahmad.mohammadi@example.com",
          phone: "+98 912 345 6789",
          bio: "متخصص معماری ایرانی-اسلامی با بیش از ۱۰ سال تجربه",
          bio_en:
            "Iranian-Islamic architecture specialist with over 10 years of experience",
          date_of_birth: "1985-05-15",
          gender: "male",
          city: "تهران",
          country: "ایران",
          profession: "معمار",
          organization: "دانشگاه تهران",
          education_level: "master",
          interests: ["معماری کلاسیک", "طراحی مساجد", "هنر اسلامی"],
          language_preference: "fa",
          email_notifications: true,
          marketing_notifications: false,
          created_at: "2024-01-01",
          updated_at: "2024-01-20",
        };

        setProfile(mockProfile);
        setFormData(mockProfile);
        setLoading(false);
      }, 1000);
    };

    fetchProfile();
  }, []);

  // Helper functions
  const getLocalizedText = (fa: string, en?: string) => {
    return locale === "fa" ? fa : en || fa;
  };

  // Form validation
  const validateForm = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.first_name?.trim()) {
      newErrors.first_name =
        locale === "fa" ? "نام الزامی است" : "First name is required";
    }

    if (!data.last_name?.trim()) {
      newErrors.last_name =
        locale === "fa" ? "نام خانوادگی الزامی است" : "Last name is required";
    }

    if (!data.email?.trim()) {
      newErrors.email =
        locale === "fa" ? "ایمیل الزامی است" : "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email =
        locale === "fa" ? "ایمیل معتبر نیست" : "Email is invalid";
    }

    if (
      data.phone &&
      !/^(\+98|0)?9\d{9}$/.test(data.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone =
        locale === "fa" ? "شماره تلفن معتبر نیست" : "Phone number is invalid";
    }

    return newErrors;
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setProfile(formData as UserProfile);
      setSuccessMessage(
        locale === "fa"
          ? "پروفایل با موفقیت بروزرسانی شد"
          : "Profile updated successfully",
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({
        general:
          locale === "fa"
            ? "خطا در بروزرسانی پروفایل"
            : "Error updating profile",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {locale === "fa" ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <p className="text-text-secondary">
            {locale === "fa"
              ? "خطا در بارگذاری پروفایل"
              : "Error loading profile"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-background-primary border-b border-background-darkest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">
                {locale === "fa" ? "ویرایش پروفایل" : "Edit Profile"}
              </h1>
              <p className="text-text-secondary mt-1">
                {locale === "fa"
                  ? "مدیریت اطلاعات شخصی و تنظیمات حساب کاربری"
                  : "Manage your personal information and account settings"}
              </p>
            </div>

            <Link
              href={`/${locale}/user/dashboard`}
              className="text-text-secondary hover:text-text transition-colors"
            >
              {locale === "fa" ? "← بازگشت به داشبورد" : "← Back to Dashboard"}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6 sticky top-8">
              <nav className="space-y-2">
                {[
                  {
                    id: "personal",
                    icon: "👤",
                    label: locale === "fa" ? "اطلاعات شخصی" : "Personal Info",
                  },
                  {
                    id: "contact",
                    icon: "📞",
                    label: locale === "fa" ? "اطلاعات تماس" : "Contact Info",
                  },
                  {
                    id: "professional",
                    icon: "💼",
                    label: locale === "fa" ? "اطلاعات شغلی" : "Professional",
                  },
                  {
                    id: "preferences",
                    icon: "⚙️",
                    label: locale === "fa" ? "تنظیمات" : "Preferences",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-right px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 rtl:space-x-reverse ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:bg-background-primary hover:text-text"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  {successMessage}
                </div>
              )}

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {errors.general}
                </div>
              )}

              {/* Personal Information Tab */}
              {activeTab === "personal" && (
                <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                  <h2 className="text-xl font-semibold text-text mb-6">
                    {locale === "fa" ? "اطلاعات شخصی" : "Personal Information"}
                  </h2>

                  {/* Avatar Section */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-text mb-4">
                      {locale === "fa" ? "تصویر پروفایل" : "Profile Picture"}
                    </label>
                    <div className="flex items-center space-x-6 rtl:space-x-reverse">
                      <div className="relative">
                        {avatarPreview || profile.avatar?.url ? (
                          <Image
                            src={avatarPreview || profile.avatar!.url}
                            alt="Profile"
                            width={100}
                            height={100}
                            className="w-25 h-25 rounded-full object-cover border-4 border-background-darkest"
                          />
                        ) : (
                          <div className="w-25 h-25 rounded-full bg-background-secondary flex items-center justify-center border-4 border-background-darkest">
                            <span className="text-4xl">👤</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
                        >
                          {locale === "fa" ? "تغییر تصویر" : "Change Picture"}
                        </label>
                        <p className="text-sm text-text-secondary mt-2">
                          {locale === "fa"
                            ? "فرمت‌های مجاز: JPG, PNG, GIF (حداکثر ۲ مگابایت)"
                            : "Allowed formats: JPG, PNG, GIF (max 2MB)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa" ? "نام" : "First Name"} *
                      </label>
                      <input
                        type="text"
                        value={formData.first_name || ""}
                        onChange={(e) =>
                          handleInputChange("first_name", e.target.value)
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.first_name
                            ? "border-red-400"
                            : "border-background-darkest"
                        }`}
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.first_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa" ? "نام خانوادگی" : "Last Name"} *
                      </label>
                      <input
                        type="text"
                        value={formData.last_name || ""}
                        onChange={(e) =>
                          handleInputChange("last_name", e.target.value)
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.last_name
                            ? "border-red-400"
                            : "border-background-darkest"
                        }`}
                      />
                      {errors.last_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.last_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-text mb-2">
                      {locale === "fa" ? "ایمیل" : "Email"} *
                    </label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.email
                          ? "border-red-400"
                          : "border-background-darkest"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-text mb-2">
                      {locale === "fa" ? "درباره من" : "Bio"}
                    </label>
                    <textarea
                      rows={4}
                      value={
                        locale === "fa"
                          ? formData.bio || ""
                          : formData.bio_en || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          locale === "fa" ? "bio" : "bio_en",
                          e.target.value,
                        )
                      }
                      placeholder={
                        locale === "fa"
                          ? "کمی درباره خودتان بنویسید..."
                          : "Tell us about yourself..."
                      }
                      className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Personal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa" ? "تاریخ تولد" : "Date of Birth"}
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth || ""}
                        onChange={(e) =>
                          handleInputChange("date_of_birth", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa" ? "جنسیت" : "Gender"}
                      </label>
                      <select
                        value={formData.gender || ""}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">
                          {locale === "fa" ? "انتخاب کنید" : "Select"}
                        </option>
                        <option value="male">
                          {locale === "fa" ? "مرد" : "Male"}
                        </option>
                        <option value="female">
                          {locale === "fa" ? "زن" : "Female"}
                        </option>
                        <option value="other">
                          {locale === "fa" ? "سایر" : "Other"}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information Tab */}
              {activeTab === "contact" && (
                <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                  <h2 className="text-xl font-semibold text-text mb-6">
                    {locale === "fa" ? "اطلاعات تماس" : "Contact Information"}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa" ? "شماره تلفن" : "Phone Number"}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder={
                          locale === "fa" ? "۰۹۱۲ ۳۴۵ ۶۷۸۹" : "+98 912 345 6789"
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.phone
                            ? "border-red-400"
                            : "border-background-darkest"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          {locale === "fa" ? "شهر" : "City"}
                        </label>
                        <input
                          type="text"
                          value={formData.city || ""}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          {locale === "fa" ? "کشور" : "Country"}
                        </label>
                        <input
                          type="text"
                          value={formData.country || ""}
                          onChange={(e) =>
                            handleInputChange("country", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa" ? "وبسایت" : "Website"}
                      </label>
                      <input
                        type="url"
                        value={formData.website || ""}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                        placeholder="https://"
                        className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={formData.linkedin || ""}
                          onChange={(e) =>
                            handleInputChange("linkedin", e.target.value)
                          }
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Twitter
                        </label>
                        <input
                          type="url"
                          value={formData.twitter || ""}
                          onChange={(e) =>
                            handleInputChange("twitter", e.target.value)
                          }
                          placeholder="https://twitter.com/..."
                          className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information Tab */}
              {activeTab === "professional" && (
                <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                  <h2 className="text-xl font-semibold text-text mb-6">
                    {locale === "fa"
                      ? "اطلاعات شغلی و تحصیلی"
                      : "Professional & Educational Information"}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa" ? "شغل" : "Profession"}
                      </label>
                      <input
                        type="text"
                        value={formData.profession || ""}
                        onChange={(e) =>
                          handleInputChange("profession", e.target.value)
                        }
                        placeholder={
                          locale === "fa"
                            ? "معمار، طراح، ..."
                            : "Architect, Designer, ..."
                        }
                        className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa"
                          ? "سازمان/دانشگاه"
                          : "Organization/University"}
                      </label>
                      <input
                        type="text"
                        value={formData.organization || ""}
                        onChange={(e) =>
                          handleInputChange("organization", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa" ? "سطح تحصیلات" : "Education Level"}
                      </label>
                      <select
                        value={formData.education_level || ""}
                        onChange={(e) =>
                          handleInputChange("education_level", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">
                          {locale === "fa" ? "انتخاب کنید" : "Select"}
                        </option>
                        <option value="high_school">
                          {locale === "fa" ? "دیپلم" : "High School"}
                        </option>
                        <option value="bachelor">
                          {locale === "fa" ? "کارشناسی" : "Bachelor's Degree"}
                        </option>
                        <option value="master">
                          {locale === "fa"
                            ? "کارشناسی ارشد"
                            : "Master's Degree"}
                        </option>
                        <option value="phd">
                          {locale === "fa" ? "دکتری" : "PhD"}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa"
                          ? "علایق و تخصص‌ها"
                          : "Interests & Specializations"}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.interests?.join(", ") || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "interests",
                            e.target.value.split(", ").filter((i) => i.trim()),
                          )
                        }
                        placeholder={
                          locale === "fa"
                            ? "معماری کلاسیک، طراحی مساجد، هنر اسلامی"
                            : "Classical Architecture, Mosque Design, Islamic Art"
                        }
                        className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <p className="text-sm text-text-secondary mt-1">
                        {locale === "fa"
                          ? "موضوعات را با کاما جدا کنید"
                          : "Separate topics with commas"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="bg-white rounded-lg shadow-sm border border-background-darkest p-6">
                  <h2 className="text-xl font-semibold text-text mb-6">
                    {locale === "fa"
                      ? "تنظیمات و ترجیحات"
                      : "Settings & Preferences"}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        {locale === "fa" ? "زبان ترجیحی" : "Preferred Language"}
                      </label>
                      <select
                        value={formData.language_preference || "fa"}
                        onChange={(e) =>
                          handleInputChange(
                            "language_preference",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2 border border-background-darkest rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="fa">فارسی</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-text">
                        {locale === "fa"
                          ? "تنظیمات اطلاع‌رسانی"
                          : "Notification Settings"}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-text">
                            {locale === "fa"
                              ? "اطلاع‌رسانی ایمیل"
                              : "Email Notifications"}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {locale === "fa"
                              ? "اطلاع از دوره‌های جدید، پیشرفت تحصیلی و بروزرسانی‌ها"
                              : "New courses, learning progress, and updates"}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.email_notifications || false}
                          onChange={(e) =>
                            handleInputChange(
                              "email_notifications",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-text">
                            {locale === "fa"
                              ? "اطلاع‌رسانی بازاریابی"
                              : "Marketing Notifications"}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {locale === "fa"
                              ? "اطلاع از تخفیف‌ها، رویدادها و اخبار مرکز"
                              : "Discounts, events, and center news"}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.marketing_notifications || false}
                          onChange={(e) =>
                            handleInputChange(
                              "marketing_notifications",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-background-darkest">
                      <h3 className="font-semibold text-text mb-4">
                        {locale === "fa" ? "حریم خصوصی" : "Privacy Settings"}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {locale === "fa"
                          ? "برای مدیریت حریم خصوصی و امنیت حساب خود، به بخش تنظیمات حساب مراجعه کنید."
                          : "For privacy and security settings, visit account settings."}
                      </p>
                      <Link
                        href={`/${locale}/user/privacy`}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        {locale === "fa"
                          ? "مشاهده تنظیمات حریم خصوصی"
                          : "View Privacy Settings"}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6">
                <Link
                  href={`/${locale}/user/dashboard`}
                  className="text-text-secondary hover:text-text transition-colors"
                >
                  {locale === "fa" ? "انصراف" : "Cancel"}
                </Link>

                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(profile);
                      setErrors({});
                      setSuccessMessage("");
                    }}
                    className="px-6 py-2 border border-background-darkest text-text-secondary hover:text-text hover:bg-background-primary rounded-lg transition-colors"
                  >
                    {locale === "fa" ? "بازنشانی" : "Reset"}
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-white px-8 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    {saving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>
                      {saving
                        ? locale === "fa"
                          ? "در حال ذخیره..."
                          : "Saving..."
                        : locale === "fa"
                          ? "ذخیره تغییرات"
                          : "Save Changes"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
