import { apiRequest } from '@/lib/api';

export interface CreateGroupData {
  name: string;
  description?: string;
  type: 'Regular' | 'Corporate';
  max_members?: number;
  min_members_for_discount?: number;

  // Corporate fields
  company_name?: string;
  company_registration_number?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  billing_contact_name?: string;
  billing_contact_email?: string;
  centralized_billing?: boolean;

  // Group configuration
  auto_approve_members?: boolean;
  allow_member_self_enroll?: boolean;
  require_leader_approval?: boolean;

  notes?: string;
}

export interface AddGroupMemberData {
  group_id: string;
  user_id?: string;
  user_mobile?: string;
  user_email?: string;
  role?: 'Member' | 'CoLeader' | 'Admin';
  can_invite_others?: boolean;
  can_approve_members?: boolean;
  auto_approve?: boolean;
  notes?: string;
}

export interface GroupEnrollmentData {
  group_id: string;
  course_id: string;
  member_ids: string[];
  payment_method?: string;
  use_centralized_billing?: boolean;
  apply_group_discount?: boolean;
  notes?: string;
}

export interface DiscountCalculationData {
  group_id: string;
  course_price: number;
  member_count?: number;
}

export interface GroupStatsQuery {
  group_id: string;
  include_members?: boolean;
  include_enrollments?: boolean;
  limit?: number;
  offset?: number;
}

export interface GroupInfo {
  _id: string;
  name: string;
  type: string;
  status: string;
  group_code: string;
  current_member_count: number;
  max_members: number;
  discount_percentage: number;
  total_savings: number;
  total_enrollments: number;
  completed_courses: number;
  certificates_issued: number;
  leader: {
    _id: string;
    first_name: string;
    last_name: string;
    mobile: string;
  };
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  _id: string;
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    mobile: string;
  };
  status: 'Active' | 'Pending' | 'Removed' | 'Suspended';
  role: 'Member' | 'CoLeader' | 'Admin';
  join_date: string;
  enrollments_count: number;
  completed_courses: number;
  total_savings: number;
}

export interface GroupStatistics {
  active_members: number;
  pending_members: number;
  total_group_savings: number;
  average_savings_per_member: number;
  most_active_member?: {
    user: {
      _id: string;
      first_name: string;
      last_name: string;
    };
    enrollments_count: number;
    completed_courses: number;
  };
  completion_rate: number;
}

export interface DiscountInfo {
  original_price: number;
  discount_percentage: number;
  discount_amount: number;
  final_price: number;
  discount_tier: string;
  member_count: number;
  savings_per_member: number;
}

export interface EnrollmentSummary {
  total_enrolled: number;
  successful_enrollments: number;
  failed_enrollments: number;
  total_original_price: number;
  total_discount_amount: number;
  total_final_price: number;
  discount_percentage: number;
}

export interface EnrollmentResult {
  user_id: string;
  user_name: string;
  status: 'success' | 'failed';
  enrollment_id?: string;
  error_message?: string;
}

class GroupService {
  /**
   * Create a new group
   */
  async createGroup(data: CreateGroupData): Promise<{
    success: boolean;
    message: string;
    group: GroupInfo;
  }> {
    try {
      const response = await apiRequest('/api/group/createGroup', {
        method: 'POST',
        body: JSON.stringify({ details: { set: data } }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در ایجاد گروه');
      }

      return response.body;
    } catch (error) {
      console.error('Error creating group:', error);
      throw new Error('خطا در ایجاد گروه. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Add a member to a group
   */
  async addGroupMember(data: AddGroupMemberData): Promise<{
    success: boolean;
    message: string;
    member?: GroupMember;
  }> {
    try {
      const response = await apiRequest('/api/group/addGroupMember', {
        method: 'POST',
        body: JSON.stringify({ details: { set: data } }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در افزودن عضو');
      }

      return response.body;
    } catch (error) {
      console.error('Error adding group member:', error);
      throw new Error('خطا در افزودن عضو. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Calculate group discount for a course
   */
  async calculateGroupDiscount(data: DiscountCalculationData): Promise<{
    success: boolean;
    discount_info: DiscountInfo;
  }> {
    try {
      const response = await apiRequest('/api/group/calculateGroupDiscount', {
        method: 'POST',
        body: JSON.stringify({ details: { set: data } }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در محاسبه تخفیف');
      }

      return response.body;
    } catch (error) {
      console.error('Error calculating group discount:', error);
      throw new Error('خطا در محاسبه تخفیف. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Process group enrollment for a course
   */
  async processGroupEnrollment(data: GroupEnrollmentData): Promise<{
    success: boolean;
    message: string;
    enrollment_summary: EnrollmentSummary;
    enrollments: EnrollmentResult[];
  }> {
    try {
      const response = await apiRequest('/api/group/processGroupEnrollment', {
        method: 'POST',
        body: JSON.stringify({ details: { set: data } }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در پردازش ثبت‌نام گروهی');
      }

      return response.body;
    } catch (error) {
      console.error('Error processing group enrollment:', error);
      throw new Error('خطا در پردازش ثبت‌نام گروهی. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Get group statistics and information
   */
  async getGroupStats(query: GroupStatsQuery): Promise<{
    success: boolean;
    group_info: GroupInfo;
    members?: GroupMember[];
    recent_enrollments?: any[];
    statistics: GroupStatistics;
  }> {
    try {
      const response = await apiRequest('/api/group/getGroupStats', {
        method: 'POST',
        body: JSON.stringify({ details: { set: query } }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در دریافت آمار گروه');
      }

      return response.body;
    } catch (error) {
      console.error('Error getting group stats:', error);
      throw new Error('خطا در دریافت آمار گروه. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Join a group using group code
   */
  async joinGroup(groupCode: string): Promise<{
    success: boolean;
    message: string;
    group?: GroupInfo;
  }> {
    try {
      const response = await apiRequest('/api/group/joinGroup', {
        method: 'POST',
        body: JSON.stringify({
          details: {
            set: {
              group_code: groupCode,
            },
          },
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در پیوستن به گروه');
      }

      return response.body;
    } catch (error) {
      console.error('Error joining group:', error);
      throw new Error('خطا در پیوستن به گروه. لطفاً کد گروه را بررسی کنید.');
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiRequest('/api/group/leaveGroup', {
        method: 'POST',
        body: JSON.stringify({
          details: {
            set: {
              group_id: groupId,
            },
          },
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در خروج از گروه');
      }

      return response.body;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw new Error('خطا در خروج از گروه. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Update group member role or permissions
   */
  async updateGroupMember(data: {
    group_id: string;
    member_id: string;
    role?: 'Member' | 'CoLeader' | 'Admin';
    can_invite_others?: boolean;
    can_approve_members?: boolean;
    status?: 'Active' | 'Pending' | 'Removed' | 'Suspended';
  }): Promise<{
    success: boolean;
    message: string;
    member?: GroupMember;
  }> {
    try {
      const response = await apiRequest('/api/group/updateGroupMember', {
        method: 'POST',
        body: JSON.stringify({ details: { set: data } }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در به‌روزرسانی عضو');
      }

      return response.body;
    } catch (error) {
      console.error('Error updating group member:', error);
      throw new Error('خطا در به‌روزرسانی عضو. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Remove a member from a group
   */
  async removeGroupMember(data: {
    group_id: string;
    member_id: string;
    reason?: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiRequest('/api/group/removeGroupMember', {
        method: 'POST',
        body: JSON.stringify({ details: { set: data } }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در حذف عضو');
      }

      return response.body;
    } catch (error) {
      console.error('Error removing group member:', error);
      throw new Error('خطا در حذف عضو. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Get user's groups
   */
  async getUserGroups(): Promise<{
    success: boolean;
    groups: GroupInfo[];
    membership_info: {
      [groupId: string]: {
        role: string;
        status: string;
        join_date: string;
        is_leader: boolean;
      };
    };
  }> {
    try {
      const response = await apiRequest('/api/group/getUserGroups', {
        method: 'GET',
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در دریافت گروه‌ها');
      }

      return response.body;
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw new Error('خطا در دریافت گروه‌ها. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Get available courses for group enrollment
   */
  async getAvailableCoursesForGroup(groupId: string): Promise<{
    success: boolean;
    courses: any[];
    group_info: GroupInfo;
  }> {
    try {
      const response = await apiRequest('/api/group/getAvailableCourses', {
        method: 'POST',
        body: JSON.stringify({
          details: {
            set: {
              group_id: groupId,
            },
          },
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در دریافت دوره‌ها');
      }

      return response.body;
    } catch (error) {
      console.error('Error getting available courses:', error);
      throw new Error('خطا در دریافت دوره‌ها. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Generate group invite link
   */
  async generateInviteLink(groupId: string): Promise<{
    success: boolean;
    invite_link: string;
    invite_code: string;
    expires_at: string;
  }> {
    try {
      const response = await apiRequest('/api/group/generateInviteLink', {
        method: 'POST',
        body: JSON.stringify({
          details: {
            set: {
              group_id: groupId,
            },
          },
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'خطا در ایجاد لینک دعوت');
      }

      return response.body;
    } catch (error) {
      console.error('Error generating invite link:', error);
      throw new Error('خطا در ایجاد لینک دعوت. لطفاً مجدداً تلاش کنید.');
    }
  }

  /**
   * Utility function to get discount tier information
   */
  getDiscountTierInfo(memberCount: number): {
    percentage: number;
    tier: string;
    tierName: string;
    nextTierMembers?: number;
    nextTierPercentage?: number;
  } {
    let percentage = 0;
    let tier = 'None';
    let tierName = 'بدون تخفیف';
    let nextTierMembers: number | undefined;
    let nextTierPercentage: number | undefined;

    if (memberCount >= 21) {
      percentage = 25;
      tier = 'Tier4';
      tierName = 'پلاتین';
    } else if (memberCount >= 11) {
      percentage = 20;
      tier = 'Tier3';
      tierName = 'طلایی';
      nextTierMembers = 21;
      nextTierPercentage = 25;
    } else if (memberCount >= 6) {
      percentage = 15;
      tier = 'Tier2';
      tierName = 'نقره‌ای';
      nextTierMembers = 11;
      nextTierPercentage = 20;
    } else if (memberCount >= 3) {
      percentage = 10;
      tier = 'Tier1';
      tierName = 'برنزی';
      nextTierMembers = 6;
      nextTierPercentage = 15;
    } else {
      nextTierMembers = 3;
      nextTierPercentage = 10;
    }

    return {
      percentage,
      tier,
      tierName,
      nextTierMembers,
      nextTierPercentage,
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fa-IR').format(amount);
  }

  /**
   * Calculate potential savings for different member counts
   */
  calculatePotentialSavings(coursePrice: number, currentMembers: number): {
    [memberCount: number]: {
      discount: number;
      savings: number;
      pricePerMember: number;
    };
  } {
    const potentialSavings: any = {};

    [3, 6, 11, 21].forEach(targetMembers => {
      if (targetMembers > currentMembers) {
        const tierInfo = this.getDiscountTierInfo(targetMembers);
        const discountAmount = Math.round((coursePrice * tierInfo.percentage) / 100);
        const pricePerMember = coursePrice - discountAmount;

        potentialSavings[targetMembers] = {
          discount: tierInfo.percentage,
          savings: discountAmount,
          pricePerMember,
        };
      }
    });

    return potentialSavings;
  }
}

export const groupService = new GroupService();
export default groupService;
