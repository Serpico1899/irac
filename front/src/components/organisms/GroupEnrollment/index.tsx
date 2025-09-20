'use client';

import { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  UserGroupIcon,
  GiftIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  instructor: string;
  image?: string;
}

interface GroupMember {
  _id: string;
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    mobile: string;
  };
  status: 'Active' | 'Pending' | 'Removed' | 'Suspended';
  role: 'Member' | 'CoLeader' | 'Admin';
  enrollments_count: number;
  completed_courses: number;
}

interface DiscountInfo {
  original_price: number;
  discount_percentage: number;
  discount_amount: number;
  final_price: number;
  discount_tier: string;
  member_count: number;
  savings_per_member: number;
}

interface EnrollmentResult {
  user_id: string;
  user_name: string;
  status: 'success' | 'failed';
  enrollment_id?: string;
  error_message?: string;
}

interface GroupEnrollmentProps {
  groupId: string;
  course: Course;
  members: GroupMember[];
  onClose: () => void;
  onEnrollmentComplete?: (results: EnrollmentResult[]) => void;
}

export default function GroupEnrollment({
  groupId,
  course,
  members,
  onClose,
  onEnrollmentComplete,
}: GroupEnrollmentProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollmentResults, setEnrollmentResults] = useState<EnrollmentResult[]>([]);
  const [currentStep, setCurrentStep] = useState<'selection' | 'confirmation' | 'processing' | 'results'>('selection');

  // Filter active members only
  const activeMembers = members.filter(member => member.status === 'Active');

  // Calculate discount when selected members change
  useEffect(() => {
    if (selectedMembers.length > 0) {
      calculateDiscount();
    } else {
      setDiscountInfo(null);
    }
  }, [selectedMembers, course.price]);

  const calculateDiscount = () => {
    const memberCount = selectedMembers.length;
    let discountPercentage = 0;
    let discountTier = 'None';

    // Discount tiers based on requirements
    if (memberCount >= 21) {
      discountPercentage = 25;
      discountTier = 'Tier4';
    } else if (memberCount >= 11) {
      discountPercentage = 20;
      discountTier = 'Tier3';
    } else if (memberCount >= 6) {
      discountPercentage = 15;
      discountTier = 'Tier2';
    } else if (memberCount >= 3) {
      discountPercentage = 10;
      discountTier = 'Tier1';
    }

    const originalPrice = course.price;
    const discountAmount = Math.round((originalPrice * discountPercentage) / 100);
    const finalPrice = originalPrice - discountAmount;
    const savingsPerMember = Math.round(discountAmount / memberCount) || 0;

    setDiscountInfo({
      original_price: originalPrice,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount,
      final_price: finalPrice,
      discount_tier: discountTier,
      member_count: memberCount,
      savings_per_member: savingsPerMember,
    });
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === activeMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(activeMembers.map(member => member._id));
    }
  };

  const handleProceedToConfirmation = () => {
    if (selectedMembers.length === 0) return;
    setCurrentStep('confirmation');
  };

  const handleProcessEnrollment = async () => {
    setCurrentStep('processing');
    setIsProcessing(true);

    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock results - in real implementation, this would come from the API
      const results: EnrollmentResult[] = selectedMembers.map(memberId => {
        const member = activeMembers.find(m => m._id === memberId);
        const isSuccess = Math.random() > 0.1; // 90% success rate for demo

        return {
          user_id: memberId,
          user_name: member ? `${member.user.first_name} ${member.user.last_name}` : 'نامشخص',
          status: isSuccess ? 'success' : 'failed',
          enrollment_id: isSuccess ? `enr_${Date.now()}_${memberId}` : undefined,
          error_message: !isSuccess ? 'خطا در پردازش ثبت‌نام' : undefined,
        };
      });

      setEnrollmentResults(results);
      setCurrentStep('results');

      if (onEnrollmentComplete) {
        onEnrollmentComplete(results);
      }

    } catch (error) {
      console.error('Error processing group enrollment:', error);
      // Handle error appropriately
    } finally {
      setIsProcessing(false);
    }
  };

  const getDiscountTierName = (tier: string) => {
    switch (tier) {
      case 'Tier4': return 'پلاتین';
      case 'Tier3': return 'طلایی';
      case 'Tier2': return 'نقره‌ای';
      case 'Tier1': return 'برنزی';
      default: return 'بدون تخفیف';
    }
  };

  const getDiscountTierColor = (tier: string) => {
    switch (tier) {
      case 'Tier4': return 'text-purple-600';
      case 'Tier3': return 'text-yellow-600';
      case 'Tier2': return 'text-gray-500';
      case 'Tier1': return 'text-orange-600';
      default: return 'text-gray-400';
    }
  };

  const renderSelectionStep = () => (
    <div className="flex flex-col">
      {/* Course Information */}
      <div className="flex items-center gap-4 p-4 bg-background-secondary rounded-lg mb-6">
        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
          <AcademicCapIcon className="w-8 h-8 text-white" />
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="text-lg font-bold text-text-primary">{course.title}</h3>
          <p className="text-text-secondary text-sm">{course.instructor}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-text-primary font-bold">
              {course.price.toLocaleString()} تومان
            </span>
            <span className="text-text-light text-sm">
              {course.duration} ساعت
            </span>
          </div>
        </div>
      </div>

      {/* Member Selection */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">انتخاب اعضا</h3>
          <button
            onClick={handleSelectAll}
            className="text-primary hover:text-primary-dark text-sm font-medium"
          >
            {selectedMembers.length === activeMembers.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {activeMembers.map((member) => (
            <div
              key={member._id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedMembers.includes(member._id)
                  ? 'border-primary bg-blue-50'
                  : 'border-background-darkest hover:border-primary hover:bg-background-secondary'
              }`}
              onClick={() => handleMemberToggle(member._id)}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member._id)}
                  onChange={() => handleMemberToggle(member._id)}
                  className="w-4 h-4 text-primary bg-white border-background-darkest rounded focus:ring-primary"
                />
                {selectedMembers.includes(member._id) && (
                  <CheckIcon className="w-4 h-4 text-primary absolute top-0 left-0 pointer-events-none" />
                )}
              </div>

              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {member.user.first_name.charAt(0)}
              </div>

              <div className="flex flex-col flex-1">
                <h4 className="font-medium text-text-primary">
                  {member.user.first_name} {member.user.last_name}
                </h4>
                <p className="text-text-light text-sm">
                  {member.enrollments_count} ثبت‌نام • {member.completed_courses} تکمیل شده
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount Information */}
      {discountInfo && (
        <div className="flex flex-col mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <GiftIcon className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-text-primary">تخفیف گروهی</h4>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary">تعداد اعضا منتخب:</span>
            <span className="font-bold text-text-primary">{discountInfo.member_count} نفر</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary">درصد تخفیف:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-600">{discountInfo.discount_percentage}%</span>
              <span className={`text-xs ${getDiscountTierColor(discountInfo.discount_tier)}`}>
                ({getDiscountTierName(discountInfo.discount_tier)})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary">قیمت اصلی هر نفر:</span>
            <span className="text-text-primary line-through">
              {discountInfo.original_price.toLocaleString()} تومان
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary">قیمت نهایی هر نفر:</span>
            <span className="font-bold text-green-600">
              {discountInfo.final_price.toLocaleString()} تومان
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-green-200">
            <span className="font-bold text-text-primary">جمع کل:</span>
            <div className="flex flex-col items-end">
              <span className="font-bold text-green-600 text-lg">
                {(discountInfo.final_price * discountInfo.member_count).toLocaleString()} تومان
              </span>
              <span className="text-green-600 text-sm">
                صرفه‌جویی: {(discountInfo.discount_amount * discountInfo.member_count).toLocaleString()} تومان
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleProceedToConfirmation}
          disabled={selectedMembers.length === 0}
          className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
        >
          ادامه ({selectedMembers.length} نفر انتخاب شده)
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-background-secondary text-text-primary rounded-lg hover:bg-background-darkest transition-colors"
        >
          انصراف
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircleIcon className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-bold text-text-primary">تأیید ثبت‌نام گروهی</h3>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-4 p-4 bg-background-secondary rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">دوره:</span>
          <span className="font-bold text-text-primary">{course.title}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary">تعداد اعضا:</span>
          <span className="font-bold text-text-primary">{selectedMembers.length} نفر</span>
        </div>

        {discountInfo && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">تخفیف گروهی:</span>
              <span className="font-bold text-green-600">{discountInfo.discount_percentage}%</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-background-darkest">
              <span className="font-bold text-text-primary">مبلغ نهایی:</span>
              <span className="font-bold text-primary text-lg">
                {(discountInfo.final_price * discountInfo.member_count).toLocaleString()} تومان
              </span>
            </div>
          </>
        )}
      </div>

      {/* Selected Members List */}
      <div className="flex flex-col mb-6">
        <h4 className="font-bold text-text-primary mb-3">اعضای انتخاب شده:</h4>
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
          {selectedMembers.map(memberId => {
            const member = activeMembers.find(m => m._id === memberId);
            if (!member) return null;

            return (
              <div key={memberId} className="flex items-center gap-3 p-2 bg-background-primary rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {member.user.first_name.charAt(0)}
                </div>
                <span className="text-text-primary">
                  {member.user.first_name} {member.user.last_name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleProcessEnrollment}
          className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark font-bold transition-colors"
        >
          تأیید و پردازش ثبت‌نام
        </button>
        <button
          onClick={() => setCurrentStep('selection')}
          className="px-6 py-3 bg-background-secondary text-text-primary rounded-lg hover:bg-background-darkest transition-colors"
        >
          بازگشت
        </button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="loader mb-4"></div>
      <h3 className="text-lg font-bold text-text-primary mb-2">در حال پردازش ثبت‌نام‌ها...</h3>
      <p className="text-text-secondary text-center">
        لطفاً منتظر بمانید. این فرآیند ممکن است چند لحظه طول بکشد.
      </p>
    </div>
  );

  const renderResultsStep = () => {
    const successCount = enrollmentResults.filter(r => r.status === 'success').length;
    const failureCount = enrollmentResults.filter(r => r.status === 'failed').length;

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircleIcon className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-bold text-text-primary">نتیجه ثبت‌نام گروهی</h3>
        </div>

        {/* Summary */}
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col flex-1 p-4 bg-green-50 rounded-lg text-center">
            <span className="text-2xl font-bold text-green-600">{successCount}</span>
            <span className="text-text-secondary text-sm">ثبت‌نام موفق</span>
          </div>

          {failureCount > 0 && (
            <div className="flex flex-col flex-1 p-4 bg-red-50 rounded-lg text-center">
              <span className="text-2xl font-bold text-red-600">{failureCount}</span>
              <span className="text-text-secondary text-sm">ثبت‌نام ناموفق</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex flex-col gap-2 mb-6 max-h-60 overflow-y-auto">
          {enrollmentResults.map((result, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              {result.status === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              ) : (
                <XMarkIcon className="w-5 h-5 text-red-600" />
              )}

              <div className="flex flex-col flex-1">
                <span className="font-medium text-text-primary">{result.user_name}</span>
                {result.status === 'success' && result.enrollment_id && (
                  <span className="text-green-600 text-sm">شناسه ثبت‌نام: {result.enrollment_id}</span>
                )}
                {result.status === 'failed' && result.error_message && (
                  <span className="text-red-600 text-sm">{result.error_message}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark font-bold transition-colors"
        >
          بستن
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto dir-rtl">
        <div className="flex items-center justify-between p-6 border-b border-background-secondary">
          <h2 className="text-xl font-bold text-text-primary">ثبت‌نام گروهی</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6">
          {currentStep === 'selection' && renderSelectionStep()}
          {currentStep === 'confirmation' && renderConfirmationStep()}
          {currentStep === 'processing' && renderProcessingStep()}
          {currentStep === 'results' && renderResultsStep()}
        </div>
      </div>
    </div>
  );
}
