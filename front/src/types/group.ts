// Group Types for IRAC Frontend

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  email?: string;
}

export interface GroupInfo {
  _id: string;
  name: string;
  description?: string;
  type: 'Regular' | 'Corporate';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Completed';
  group_code: string;

  // Member management
  current_member_count: number;
  max_members: number;
  min_members_for_discount: number;

  // Discount information
  discount_tier?: 'Tier1' | 'Tier2' | 'Tier3' | 'Tier4';
  current_discount_percentage: number;
  total_savings: number;

  // Corporate fields
  company_name?: string;
  company_registration_number?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  billing_contact_name?: string;
  billing_contact_email?: string;
  centralized_billing: boolean;

  // Enrollment configuration
  auto_approve_members: boolean;
  allow_member_self_enroll: boolean;
  require_leader_approval: boolean;

  // Statistics
  total_enrollments: number;
  completed_courses: number;
  certificates_issued: number;

  // Relations
  leader: User;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Administrative
  notes?: string;
}

export interface GroupMember {
  _id: string;
  user: User;
  status: 'Active' | 'Pending' | 'Removed' | 'Suspended';
  role: 'Member' | 'CoLeader' | 'Admin';

  // Dates
  join_date: string;
  approved_date?: string;
  removed_date?: string;

  // Permissions
  can_invite_others: boolean;
  can_approve_members: boolean;

  // Statistics
  enrollments_count: number;
  completed_courses: number;
  total_savings: number;

  // Relations
  approved_by?: User;

  notes?: string;
}

export interface GroupStatistics {
  active_members: number;
  pending_members: number;
  total_group_savings: number;
  average_savings_per_member: number;
  most_active_member?: {
    user: User;
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

export interface DiscountTier {
  tier: 'Tier1' | 'Tier2' | 'Tier3' | 'Tier4' | 'None';
  name: string;
  percentage: number;
  minMembers: number;
  maxMembers: number;
  color: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  instructor: string;
  image?: string;
  is_active: boolean;
  category?: string;
  level?: string;
  language?: string;
}

export interface EnrollmentResult {
  user_id: string;
  user_name: string;
  status: 'success' | 'failed';
  enrollment_id?: string;
  error_message?: string;
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

export interface RecentEnrollment {
  _id: string;
  user: User;
  course: Course;
  enrollment_date: string;
  status: string;
  progress_percentage: number;
  group_savings: number;
}

// Form Data Types
export interface CreateGroupFormData {
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

export interface AddMemberFormData {
  group_id: string;
  user_id?: string;
  user_mobile?: string;
  user_email?: string;
  role: 'Member' | 'CoLeader' | 'Admin';
  can_invite_others: boolean;
  can_approve_members: boolean;
  auto_approve: boolean;
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

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  body?: T;
  error?: string;
}

export interface CreateGroupResponse {
  success: boolean;
  message: string;
  group: GroupInfo;
}

export interface AddMemberResponse {
  success: boolean;
  message: string;
  member?: GroupMember;
}

export interface CalculateDiscountResponse {
  success: boolean;
  discount_info: DiscountInfo;
}

export interface ProcessEnrollmentResponse {
  success: boolean;
  message: string;
  enrollment_summary: EnrollmentSummary;
  enrollments: EnrollmentResult[];
}

export interface GetGroupStatsResponse {
  success: boolean;
  group_info: GroupInfo;
  members?: GroupMember[];
  recent_enrollments?: RecentEnrollment[];
  statistics: GroupStatistics;
}

export interface GetUserGroupsResponse {
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
}

// UI State Types
export interface GroupDashboardState {
  groupInfo: GroupInfo | null;
  members: GroupMember[];
  statistics: GroupStatistics | null;
  isLoading: boolean;
  error: string | null;
}

export interface GroupEnrollmentState {
  selectedMembers: string[];
  discountInfo: DiscountInfo | null;
  isProcessing: boolean;
  enrollmentResults: EnrollmentResult[];
  currentStep: 'selection' | 'confirmation' | 'processing' | 'results';
}

export interface CreateGroupState {
  formData: CreateGroupFormData;
  isSubmitting: boolean;
  errors: Partial<CreateGroupFormData>;
  showSuccess: boolean;
}

// Constants
export const GROUP_DISCOUNT_TIERS: Record<string, DiscountTier> = {
  TIER1: {
    tier: 'Tier1',
    name: 'برنزی',
    percentage: 10,
    minMembers: 3,
    maxMembers: 5,
    color: 'text-orange-600',
  },
  TIER2: {
    tier: 'Tier2',
    name: 'نقره‌ای',
    percentage: 15,
    minMembers: 6,
    maxMembers: 10,
    color: 'text-gray-500',
  },
  TIER3: {
    tier: 'Tier3',
    name: 'طلایی',
    percentage: 20,
    minMembers: 11,
    maxMembers: 20,
    color: 'text-yellow-600',
  },
  TIER4: {
    tier: 'Tier4',
    name: 'پلاتین',
    percentage: 25,
    minMembers: 21,
    maxMembers: Infinity,
    color: 'text-purple-600',
  },
};

export const GROUP_TYPES = {
  REGULAR: 'Regular' as const,
  CORPORATE: 'Corporate' as const,
};

export const GROUP_STATUS = {
  ACTIVE: 'Active' as const,
  INACTIVE: 'Inactive' as const,
  SUSPENDED: 'Suspended' as const,
  COMPLETED: 'Completed' as const,
};

export const MEMBER_ROLES = {
  MEMBER: 'Member' as const,
  CO_LEADER: 'CoLeader' as const,
  ADMIN: 'Admin' as const,
};

export const MEMBER_STATUS = {
  ACTIVE: 'Active' as const,
  PENDING: 'Pending' as const,
  REMOVED: 'Removed' as const,
  SUSPENDED: 'Suspended' as const,
};

// Utility Types
export type GroupType = typeof GROUP_TYPES[keyof typeof GROUP_TYPES];
export type GroupStatus = typeof GROUP_STATUS[keyof typeof GROUP_STATUS];
export type MemberRole = typeof MEMBER_ROLES[keyof typeof MEMBER_ROLES];
export type MemberStatus = typeof MEMBER_STATUS[keyof typeof MEMBER_STATUS];
export type DiscountTierType = 'Tier1' | 'Tier2' | 'Tier3' | 'Tier4' | 'None';

// Search and Filter Types
export interface GroupSearchFilters {
  query?: string;
  type?: GroupType;
  status?: GroupStatus;
  minMembers?: number;
  maxMembers?: number;
  hasDiscount?: boolean;
  sortBy?: 'name' | 'created_at' | 'member_count' | 'total_savings';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MemberSearchFilters {
  query?: string;
  status?: MemberStatus;
  role?: MemberRole;
  sortBy?: 'join_date' | 'name' | 'enrollments_count';
  sortOrder?: 'asc' | 'desc';
}

// Event Types for Group Management
export interface GroupEvent {
  type: 'member_joined' | 'member_left' | 'enrollment_completed' | 'discount_tier_changed';
  groupId: string;
  userId?: string;
  data?: any;
  timestamp: string;
}

export interface GroupNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  groupId?: string;
  actionable?: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  read: boolean;
}

// Permission Types
export interface GroupPermissions {
  canViewStats: boolean;
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateMembers: boolean;
  canProcessEnrollments: boolean;
  canManageSettings: boolean;
  canDeleteGroup: boolean;
  canInviteMembers: boolean;
  canApproveMembers: boolean;
}
