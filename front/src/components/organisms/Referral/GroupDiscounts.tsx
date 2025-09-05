"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useReferral } from "@/context/ReferralContext";
import {
  Users,
  Plus,
  Clock,
  Percent,
  Mail,
  Phone,
  X,
  Check,
  AlertCircle,
  Crown,
  Star,
  Copy,
  Share2,
  ChevronRight,
} from "lucide-react";
import type { GroupDiscount, GroupDiscountApplication } from "@/types";

interface GroupDiscountsProps {
  locale: string;
}

const GroupDiscounts: React.FC<GroupDiscountsProps> = ({ locale }) => {
  const t = useTranslations("referral.groups");
  const {
    groupDiscounts,
    myGroups,
    createGroupDiscount,
    joinGroup,
    isLoading,
    error,
    refreshStats,
  } = useReferral();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<GroupDiscount | null>(null);
  const [participantEmails, setParticipantEmails] = useState<string[]>([""]);
  const [participantPhones, setParticipantPhones] = useState<string[]>([""]);
  const [inviteMode, setInviteMode] = useState<"email" | "phone">("email");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isRTL = locale === "fa";

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: "IRR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "tier_1":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "tier_2":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "tier_3":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "tier_4":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "tier_5":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "forming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Add participant field
  const addParticipantField = (mode: "email" | "phone") => {
    if (mode === "email") {
      setParticipantEmails([...participantEmails, ""]);
    } else {
      setParticipantPhones([...participantPhones, ""]);
    }
  };

  // Remove participant field
  const removeParticipantField = (mode: "email" | "phone", index: number) => {
    if (mode === "email" && participantEmails.length > 1) {
      setParticipantEmails(participantEmails.filter((_, i) => i !== index));
    } else if (mode === "phone" && participantPhones.length > 1) {
      setParticipantPhones(participantPhones.filter((_, i) => i !== index));
    }
  };

  // Update participant field
  const updateParticipantField = (mode: "email" | "phone", index: number, value: string) => {
    if (mode === "email") {
      const newEmails = [...participantEmails];
      newEmails[index] = value;
      setParticipantEmails(newEmails);
    } else {
      const newPhones = [...participantPhones];
      newPhones[index] = value;
      setParticipantPhones(newPhones);
    }
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

  // Handle create group
  const handleCreateGroup = async () => {
    if (!selectedDiscount) return;

    setCreateLoading(true);
    try {
      const validEmails = participantEmails.filter(email =>
        email.trim() && isValidEmail(email.trim())
      );
      const validPhones = participantPhones.filter(phone =>
        phone.trim() && isValidPhone(phone.trim())
      );

      const groupId = await createGroupDiscount({
        discount_id: selectedDiscount._id,
        participant_emails: validEmails.length > 0 ? validEmails : undefined,
        participant_phones: validPhones.length > 0 ? validPhones : undefined,
        expires_in_hours: 72,
      });

      if (groupId) {
        setSuccessMessage(t("createSuccess"));
        setShowCreateModal(false);
        resetForm();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedDiscount(null);
    setParticipantEmails([""]);
    setParticipantPhones([""]);
    setInviteMode("email");
  };

  // Handle join group
  const handleJoinGroup = async (groupId: string) => {
    setJoinLoading(groupId);
    try {
      const success = await joinGroup({
        group_id: groupId,
        user_info: {
          name: "Current User", // In real app, get from auth context
          email: "user@example.com",
        },
      });

      if (success) {
        setSuccessMessage(t("joinSuccess"));
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error("Failed to join group:", error);
    } finally {
      setJoinLoading(null);
    }
  };

  // Copy group link
  const copyGroupLink = async (groupId: string) => {
    const link = `${window.location.origin}/${locale}/join-group/${groupId}`;
    try {
      await navigator.clipboard.writeText(link);
      setSuccessMessage(t("linkCopied"));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("create")}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* My Active Groups */}
      {myGroups && myGroups.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("myGroups")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group) => (
              <div
                key={group._id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(group.discount_id)}`}>
                    {t(`tiers.${group.discount_id}`)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                    {t(`statuses.${group.status}`)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t("participants")}</span>
                    <span className="font-medium">{group.current_participants}</span>
                  </div>
                  {group.discount_applied > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t("discount")}</span>
                      <span className="font-medium text-green-600">{group.discount_applied}%</span>
                    </div>
                  )}
                  {group.total_savings > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t("totalSavings")}</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(group.total_savings)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyGroupLink(group.group_id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex-1 justify-center"
                  >
                    <Copy className="w-3 h-3" />
                    {t("copyLink")}
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                  </button>
                </div>

                {group.expires_at && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t("expires")}: {new Date(group.expires_at).toLocaleDateString(locale)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Group Discounts */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("availableDiscounts")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupDiscounts.map((discount) => (
            <div
              key={discount._id}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                setSelectedDiscount(discount);
                setShowCreateModal(true);
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTierColor(discount.tier)}`}>
                  {discount.name}
                </span>
                <div className="flex items-center gap-1">
                  <Percent className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">{discount.discount_percentage}%</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {discount.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{t("minParticipants")}</span>
                  <span className="font-medium">{discount.min_participants}</span>
                </div>
                {discount.max_participants && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{t("maxParticipants")}</span>
                    <span className="font-medium">{discount.max_participants}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{t("applicableTo")}</span>
                  <span className="font-medium">{t(`categories.${discount.applicable_to}`)}</span>
                </div>
                {discount.min_order_amount && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{t("minOrder")}</span>
                    <span className="font-medium">{formatCurrency(discount.min_order_amount)}</span>
                  </div>
                )}
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                <Users className="w-4 h-4" />
                {t("createGroup")}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("modal.title")}
                </h3>
                {selectedDiscount && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedDiscount.name} - {selectedDiscount.discount_percentage}% {t("discount")}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Invite Mode Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setInviteMode("email")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    inviteMode === "email"
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t("modal.email")}
                  </div>
                </button>

                <button
                  onClick={() => setInviteMode("phone")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    inviteMode === "phone"
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t("modal.phone")}
                  </div>
                </button>
              </div>

              {/* Participant Fields */}
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  {inviteMode === "email" ? t("modal.emailLabel") : t("modal.phoneLabel")}
                </label>
                <div className="space-y-3">
                  {(inviteMode === "email" ? participantEmails : participantPhones).map((value, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type={inviteMode === "email" ? "email" : "tel"}
                          value={value}
                          onChange={(e) => updateParticipantField(inviteMode, index, e.target.value)}
                          placeholder={
                            inviteMode === "email"
                              ? t("modal.emailPlaceholder")
                              : t("modal.phonePlaceholder")
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            value.trim() && (inviteMode === "email" ? !isValidEmail(value.trim()) : !isValidPhone(value.trim()))
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          dir={inviteMode === "email" && isRTL ? "rtl" : "ltr"}
                        />
                        {value.trim() && (inviteMode === "email" ? !isValidEmail(value.trim()) : !isValidPhone(value.trim())) && (
                          <p className="text-xs text-red-600 mt-1">
                            {inviteMode === "email" ? t("modal.emailInvalid") : t("modal.phoneInvalid")}
                          </p>
                        )}
                      </div>
                      {(inviteMode === "email" ? participantEmails.length : participantPhones.length) > 1 && (
                        <button
                          onClick={() => removeParticipantField(inviteMode, index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addParticipantField(inviteMode)}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {inviteMode === "email" ? t("modal.addEmail") : t("modal.addPhone")}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("modal.cancel")}
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={createLoading || !selectedDiscount}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex-1"
                >
                  {createLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  {createLoading ? t("modal.creating") : t("modal.createGroup")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDiscounts;
