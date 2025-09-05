"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useReferral } from "@/context/ReferralContext";
import {
  Mail,
  Phone,
  Plus,
  X,
  Send,
  Copy,
  Check,
  AlertCircle,
  Users,
  Share2,
} from "lucide-react";
import {
  WhatsAppIcon,
  TelegramIcon,
  EmailIcon,
} from "@/components/atoms/SocialIcons";

interface InviteFriendsProps {
  locale: string;
  onClose?: () => void;
}

const InviteFriends: React.FC<InviteFriendsProps> = ({ locale, onClose }) => {
  const t = useTranslations("referral.invite");
  const {
    referralCode,
    sendInvitations,
    shareReferralCode,
    isLoading,
    error,
  } = useReferral();

  const [emails, setEmails] = useState<string[]>([""]);
  const [phones, setPhones] = useState<string[]>([""]);
  const [customMessage, setCustomMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"email" | "phone" | "share">("email");
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const isRTL = locale === "fa";

  // Add new email field
  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  // Remove email field
  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  // Update email field
  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // Add new phone field
  const addPhoneField = () => {
    setPhones([...phones, ""]);
  };

  // Remove phone field
  const removePhoneField = (index: number) => {
    if (phones.length > 1) {
      setPhones(phones.filter((_, i) => i !== index));
    }
  };

  // Update phone field
  const updatePhone = (index: number, value: string) => {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
  };

  // Validate email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  // Handle send invitations
  const handleSendInvitations = async () => {
    setSendLoading(true);
    setSuccessCount(null);

    try {
      const validEmails = emails.filter(email => email.trim() && isValidEmail(email.trim()));
      const validPhones = phones.filter(phone => phone.trim() && isValidPhone(phone.trim()));

      if (validEmails.length === 0 && validPhones.length === 0) {
        return;
      }

      const success = await sendInvitations({
        emails: validEmails.length > 0 ? validEmails : undefined,
        phones: validPhones.length > 0 ? validPhones : undefined,
        message: customMessage.trim() || undefined,
        share_method: "email",
      });

      if (success) {
        setSuccessCount(validEmails.length + validPhones.length);
        // Reset form
        setEmails([""]);
        setPhones([""]);
        setCustomMessage("");
      }
    } catch (error) {
      console.error("Failed to send invitations:", error);
    } finally {
      setSendLoading(false);
    }
  };

  // Handle share referral code
  const handleShare = async (method: "whatsapp" | "telegram" | "email" | "copy") => {
    setShareLoading(method);

    try {
      const success = await shareReferralCode(method);
      if (success && method === "copy") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setShareLoading(null);
    }
  };

  // Get valid invitations count
  const getValidCount = () => {
    const validEmails = emails.filter(email => email.trim() && isValidEmail(email.trim()));
    const validPhones = phones.filter(phone => phone.trim() && isValidPhone(phone.trim()));
    return validEmails.length + validPhones.length;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("title")}
            </h2>
            <p className="text-sm text-gray-600">{t("subtitle")}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {successCount && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              {t("success", { count: successCount })}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("email")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "email"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t("tabs.email")}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("phone")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "phone"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t("tabs.phone")}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("share")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "share"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              {t("tabs.share")}
            </div>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Email Tab */}
        {activeTab === "email" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("email.label")}
              </label>
              <div className="space-y-3">
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        placeholder={t("email.placeholder")}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          email.trim() && !isValidEmail(email.trim())
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                      {email.trim() && !isValidEmail(email.trim()) && (
                        <p className="text-xs text-red-600 mt-1">
                          {t("email.invalid")}
                        </p>
                      )}
                    </div>
                    {emails.length > 1 && (
                      <button
                        onClick={() => removeEmailField(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addEmailField}
                className="mt-3 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("email.addMore")}
              </button>
            </div>
          </div>
        )}

        {/* Phone Tab */}
        {activeTab === "phone" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("phone.label")}
              </label>
              <div className="space-y-3">
                {phones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => updatePhone(index, e.target.value)}
                        placeholder={t("phone.placeholder")}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          phone.trim() && !isValidPhone(phone.trim())
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        dir="ltr"
                      />
                      {phone.trim() && !isValidPhone(phone.trim()) && (
                        <p className="text-xs text-red-600 mt-1">
                          {t("phone.invalid")}
                        </p>
                      )}
                    </div>
                    {phones.length > 1 && (
                      <button
                        onClick={() => removePhoneField(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addPhoneField}
                className="mt-3 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("phone.addMore")}
              </button>
            </div>
          </div>
        )}

        {/* Share Tab */}
        {activeTab === "share" && (
          <div className="space-y-6">
            {/* Referral Code Display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("share.yourCode")}
                </label>
                <button
                  onClick={() => handleShare("copy")}
                  disabled={!referralCode || shareLoading === "copy"}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t("share.copied") : t("share.copy")}
                </button>
              </div>
              <p className="text-xl font-bold text-primary-600 font-mono text-center">
                {referralCode?.code || "Loading..."}
              </p>
            </div>

            {/* Share Buttons */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {t("share.methods")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleShare("whatsapp")}
                  disabled={!referralCode || shareLoading === "whatsapp"}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex-1"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span className="font-medium">{t("share.whatsapp")}</span>
                </button>

                <button
                  onClick={() => handleShare("telegram")}
                  disabled={!referralCode || shareLoading === "telegram"}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex-1"
                >
                  <TelegramIcon className="w-5 h-5" />
                  <span className="font-medium">{t("share.telegram")}</span>
                </button>

                <button
                  onClick={() => handleShare("email")}
                  disabled={!referralCode || shareLoading === "email"}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors flex-1"
                >
                  <EmailIcon className="w-5 h-5" />
                  <span className="font-medium">{t("share.email")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Message (for email/phone tabs) */}
        {(activeTab === "email" || activeTab === "phone") && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("message.label")}
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={t("message.placeholder")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                dir={isRTL ? "rtl" : "ltr"}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("message.hint")}
              </p>
            </div>

            {/* Send Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {t("sendSummary", { count: getValidCount() })}
                </p>
              </div>
              <button
                onClick={handleSendInvitations}
                disabled={sendLoading || getValidCount() === 0}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors min-w-[120px]"
              >
                {sendLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sendLoading ? t("sending") : t("send")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteFriends;
