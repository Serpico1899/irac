'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface GroupFormData {
  name: string;
  description: string;
  type: 'Regular' | 'Corporate';
  max_members: number;
  min_members_for_discount: number;

  // Corporate fields
  company_name: string;
  company_registration_number: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  billing_contact_name: string;
  billing_contact_email: string;
  centralized_billing: boolean;

  // Group configuration
  auto_approve_members: boolean;
  allow_member_self_enroll: boolean;
  require_leader_approval: boolean;

  notes: string;
}

const initialFormData: GroupFormData = {
  name: '',
  description: '',
  type: 'Regular',
  max_members: 50,
  min_members_for_discount: 3,

  // Corporate fields
  company_name: '',
  company_registration_number: '',
  company_address: '',
  company_phone: '',
  company_email: '',
  billing_contact_name: '',
  billing_contact_email: '',
  centralized_billing: false,

  // Group configuration
  auto_approve_members: true,
  allow_member_self_enroll: true,
  require_leader_approval: false,

  notes: '',
};

export default function CreateGroup() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<GroupFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<GroupFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<GroupFormData> = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'نام گروه الزامی است';
    }

    if (formData.max_members < 3) {
      newErrors.max_members = 'حداقل ظرفیت گروه 3 نفر است';
    }

    if (formData.min_members_for_discount < 3) {
      newErrors.min_members_for_discount = 'حداقل تعداد اعضا برای تخفیف 3 نفر است';
    }

    // Corporate validation
    if (formData.type === 'Corporate') {
      if (!formData.company_name.trim()) {
        newErrors.company_name = 'نام شرکت الزامی است';
      }

      if (formData.centralized_billing) {
        if (!formData.billing_contact_name.trim()) {
          newErrors.billing_contact_name = 'نام مسئول مالی الزامی است';
        }

        if (!formData.billing_contact_email.trim()) {
          newErrors.billing_contact_email = 'ایمیل مسئول مالی الزامی است';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? parseInt(value) || 0 :
              value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof GroupFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Creating group with data:', formData);

      setShowSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push('/groups');
      }, 2000);

    } catch (error) {
      console.error('Error creating group:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (newType: 'Regular' | 'Corporate') => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      // Reset corporate fields when switching to Regular
      ...(newType === 'Regular' ? {
        company_name: '',
        company_registration_number: '',
        company_address: '',
        company_phone: '',
        company_email: '',
        billing_contact_name: '',
        billing_contact_email: '',
        centralized_billing: false,
      } : {})
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <CheckCircleIcon className="w-16 h-16 text-green-600 mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">گروه با موفقیت ایجاد شد!</h1>
        <p className="text-text-secondary">در حال انتقال به داشبورد گروه...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-6 dir-rtl">
      {/* Header */}
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">ایجاد گروه جدید</h1>
        <p className="text-text-secondary">
          برای استفاده از تخفیف‌های گروهی و مدیریت متمرکز ثبت‌نام‌ها، گروه خود را ایجاد کنید
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Group Type Selection */}
        <div className="flex flex-col bg-background-primary rounded-lg p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">نوع گروه</h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleTypeChange('Regular')}
              className={`flex flex-col items-center p-6 rounded-lg border-2 transition-colors flex-1 ${
                formData.type === 'Regular'
                  ? 'border-primary bg-blue-50'
                  : 'border-background-darkest hover:border-primary'
              }`}
            >
              <UserGroupIcon className="w-12 h-12 text-primary mb-2" />
              <h3 className="font-bold text-text-primary mb-1">گروه معمولی</h3>
              <p className="text-sm text-text-secondary text-center">
                برای افراد، دوستان، و گروه‌های کوچک
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('Corporate')}
              className={`flex flex-col items-center p-6 rounded-lg border-2 transition-colors flex-1 ${
                formData.type === 'Corporate'
                  ? 'border-primary bg-blue-50'
                  : 'border-background-darkest hover:border-primary'
              }`}
            >
              <BuildingOfficeIcon className="w-12 h-12 text-primary mb-2" />
              <h3 className="font-bold text-text-primary mb-1">گروه سازمانی</h3>
              <p className="text-sm text-text-secondary text-center">
                برای شرکت‌ها و سازمان‌ها با صورتحساب متمرکز
              </p>
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="flex flex-col bg-background-primary rounded-lg p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">اطلاعات پایه</h2>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                نام گروه *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? 'border-red-500' : 'border-background-darkest'
                }`}
                placeholder="مثال: گروه معماری پایدار"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                توضیحات
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="توضیح مختصری درباره گروه و اهداف آن..."
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  حداکثر تعداد اعضا
                </label>
                <input
                  type="number"
                  name="max_members"
                  value={formData.max_members}
                  onChange={handleInputChange}
                  min="3"
                  max="200"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.max_members ? 'border-red-500' : 'border-background-darkest'
                  }`}
                />
                {errors.max_members && (
                  <p className="text-red-500 text-sm mt-1">{errors.max_members}</p>
                )}
              </div>

              <div className="flex flex-col flex-1">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  حداقل اعضا برای تخفیف
                </label>
                <input
                  type="number"
                  name="min_members_for_discount"
                  value={formData.min_members_for_discount}
                  onChange={handleInputChange}
                  min="3"
                  max="10"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.min_members_for_discount ? 'border-red-500' : 'border-background-darkest'
                  }`}
                />
                {errors.min_members_for_discount && (
                  <p className="text-red-500 text-sm mt-1">{errors.min_members_for_discount}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Information */}
        {formData.type === 'Corporate' && (
          <div className="flex flex-col bg-background-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">اطلاعات سازمانی</h2>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    نام شرکت *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.company_name ? 'border-red-500' : 'border-background-darkest'
                    }`}
                    placeholder="نام رسمی شرکت"
                  />
                  {errors.company_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
                  )}
                </div>

                <div className="flex flex-col flex-1">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    شماره ثبت شرکت
                  </label>
                  <input
                    type="text"
                    name="company_registration_number"
                    value={formData.company_registration_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="شماره ثبت در اداره ثبت شرکت‌ها"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  آدرس شرکت
                </label>
                <textarea
                  name="company_address"
                  value={formData.company_address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="آدرس کامل شرکت"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    تلفن شرکت
                  </label>
                  <input
                    type="text"
                    name="company_phone"
                    value={formData.company_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="021-12345678"
                    dir="ltr"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    ایمیل شرکت
                  </label>
                  <input
                    type="email"
                    name="company_email"
                    value={formData.company_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="info@company.com"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Centralized Billing */}
              <div className="flex items-center gap-3 p-4 bg-background-secondary rounded-lg">
                <input
                  type="checkbox"
                  id="centralized_billing"
                  name="centralized_billing"
                  checked={formData.centralized_billing}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-white border-background-darkest rounded focus:ring-primary"
                />
                <label htmlFor="centralized_billing" className="text-text-primary font-medium">
                  فعال‌سازی صورتحساب متمرکز
                </label>
              </div>

              {/* Billing Contact Information */}
              {formData.centralized_billing && (
                <div className="flex flex-col gap-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-text-primary">اطلاعات مسئول مالی</h3>

                  <div className="flex gap-4">
                    <div className="flex flex-col flex-1">
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        نام مسئول مالی *
                      </label>
                      <input
                        type="text"
                        name="billing_contact_name"
                        value={formData.billing_contact_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.billing_contact_name ? 'border-red-500' : 'border-background-darkest'
                        }`}
                        placeholder="نام و نام خانوادگی مسئول مالی"
                      />
                      {errors.billing_contact_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.billing_contact_name}</p>
                      )}
                    </div>

                    <div className="flex flex-col flex-1">
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        ایمیل مسئول مالی *
                      </label>
                      <input
                        type="email"
                        name="billing_contact_email"
                        value={formData.billing_contact_email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.billing_contact_email ? 'border-red-500' : 'border-background-darkest'
                        }`}
                        placeholder="accounting@company.com"
                        dir="ltr"
                      />
                      {errors.billing_contact_email && (
                        <p className="text-red-500 text-sm mt-1">{errors.billing_contact_email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Group Settings */}
        <div className="flex flex-col bg-background-primary rounded-lg p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">تنظیمات گروه</h2>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_approve_members"
                name="auto_approve_members"
                checked={formData.auto_approve_members}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-white border-background-darkest rounded focus:ring-primary"
              />
              <label htmlFor="auto_approve_members" className="text-text-primary">
                تأیید خودکار اعضای جدید
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allow_member_self_enroll"
                name="allow_member_self_enroll"
                checked={formData.allow_member_self_enroll}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-white border-background-darkest rounded focus:ring-primary"
              />
              <label htmlFor="allow_member_self_enroll" className="text-text-primary">
                اجازه ثبت‌نام مستقل اعضا در دوره‌ها
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="require_leader_approval"
                name="require_leader_approval"
                checked={formData.require_leader_approval}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-white border-background-darkest rounded focus:ring-primary"
              />
              <label htmlFor="require_leader_approval" className="text-text-primary">
                نیاز به تأیید رهبر برای ثبت‌نام‌ها
              </label>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="flex flex-col bg-background-primary rounded-lg p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">یادداشت‌های اضافی</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="یادداشت‌هایی برای مدیریت داخلی گروه..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
          >
            {isSubmitting ? 'در حال ایجاد گروه...' : 'ایجاد گروه'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-background-secondary text-text-primary rounded-lg hover:bg-background-darkest transition-colors"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}
