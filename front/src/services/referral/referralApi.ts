import type {
  ReferralCode,
  ReferralInvitation,
  UserReferralStats,
  GroupDiscount,
  GroupDiscountApplication,
  ReferralLeaderboard,
  ReferralReward,
  SendInvitationRequest,
  CreateGroupDiscountRequest,
  JoinGroupRequest,
  ReferralQuery,
  ReferralHistoryResponse,
  GroupDiscountQuery,
  ReferralApiResponse,
  ReferralStatus,
  GroupDiscountTier,
  UserScoreLevel,
} from "@/types";

// Mock data for development
const mockReferralCodes: ReferralCode[] = [
  {
    _id: "ref_1",
    user_id: "user_1",
    code: "SARA2024",
    is_active: true,
    max_uses: 50,
    current_uses: 12,
    expires_at: "2024-12-31T23:59:59.000Z",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-15T10:30:00.000Z",
  },
];

const mockReferralInvitations: ReferralInvitation[] = [
  {
    _id: "inv_1",
    referrer_id: "user_1",
    referee_email: "friend1@example.com",
    referral_code: "SARA2024",
    status: "completed",
    invited_at: "2024-01-10T09:00:00.000Z",
    registered_at: "2024-01-12T14:30:00.000Z",
    first_purchase_at: "2024-01-15T16:45:00.000Z",
    completed_at: "2024-01-15T16:45:00.000Z",
    reward_given: true,
    reward_amount: 50000,
    commission_rate: 10,
    notes: "Successfully converted - first purchase completed",
  },
  {
    _id: "inv_2",
    referrer_id: "user_1",
    referee_email: "friend2@example.com",
    referral_code: "SARA2024",
    status: "active",
    invited_at: "2024-01-20T11:00:00.000Z",
    registered_at: "2024-01-22T15:30:00.000Z",
    reward_given: false,
  },
  {
    _id: "inv_3",
    referrer_id: "user_1",
    referee_phone: "+989123456789",
    referral_code: "SARA2024",
    status: "pending",
    invited_at: "2024-01-25T13:15:00.000Z",
    reward_given: false,
  },
  {
    _id: "inv_4",
    referrer_id: "user_1",
    referee_email: "colleague@example.com",
    referral_code: "SARA2024",
    status: "expired",
    invited_at: "2024-01-05T08:30:00.000Z",
    reward_given: false,
  },
];

const mockGroupDiscounts: GroupDiscount[] = [
  {
    _id: "group_1",
    name: "تخفیف گروهی ۳ نفری",
    name_en: "3-Person Group Discount",
    description: "با دعوت ۲ نفر از دوستان‌تان، ۱۵٪ تخفیف بگیرید",
    description_en: "Invite 2 friends and get 15% discount",
    tier: "tier_1",
    min_participants: 3,
    max_participants: 5,
    discount_percentage: 15,
    applicable_to: "courses",
    min_order_amount: 100000,
    is_active: true,
    valid_from: "2024-01-01T00:00:00.000Z",
    valid_until: "2024-12-31T23:59:59.000Z",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "group_2",
    name: "تخفیف گروهی ۵ نفری",
    name_en: "5-Person Group Discount",
    description: "با دعوت ۴ نفر از دوستان‌تان، ۲۵٪ تخفیف بگیرید",
    description_en: "Invite 4 friends and get 25% discount",
    tier: "tier_2",
    min_participants: 5,
    max_participants: 8,
    discount_percentage: 25,
    applicable_to: "workshops",
    min_order_amount: 200000,
    is_active: true,
    valid_from: "2024-01-01T00:00:00.000Z",
    valid_until: "2024-12-31T23:59:59.000Z",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "group_3",
    name: "تخفیف گروهی ۱۰ نفری",
    name_en: "10-Person Group Discount",
    description: "با دعوت ۹ نفر از دوستان‌تان، ۳۵٪ تخفیف بگیرید",
    description_en: "Invite 9 friends and get 35% discount",
    tier: "tier_3",
    min_participants: 10,
    max_participants: 15,
    discount_percentage: 35,
    applicable_to: "all",
    min_order_amount: 500000,
    is_active: true,
    valid_from: "2024-01-01T00:00:00.000Z",
    valid_until: "2024-12-31T23:59:59.000Z",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
];

const mockGroupApplications: GroupDiscountApplication[] = [
  {
    _id: "app_1",
    group_id: "group_app_1",
    organizer_id: "user_1",
    discount_id: "group_1",
    participants: [
      {
        user_id: "user_1",
        email: "organizer@example.com",
        name: "سارا محمدی",
        joined_at: "2024-01-15T10:00:00.000Z",
        purchase_completed: true,
        order_id: "order_1",
      },
      {
        email: "participant1@example.com",
        name: "علی احمدی",
        joined_at: "2024-01-16T14:30:00.000Z",
        purchase_completed: true,
        order_id: "order_2",
      },
      {
        email: "participant2@example.com",
        name: "مریم رضایی",
        joined_at: "2024-01-17T09:15:00.000Z",
        purchase_completed: false,
      },
    ],
    status: "active",
    current_participants: 3,
    discount_applied: 15,
    total_savings: 75000,
    expires_at: "2024-02-15T10:00:00.000Z",
    activated_at: "2024-01-17T09:15:00.000Z",
    created_at: "2024-01-15T10:00:00.000Z",
    updated_at: "2024-01-17T09:15:00.000Z",
  },
  {
    _id: "app_2",
    group_id: "group_app_2",
    organizer_id: "user_1",
    discount_id: "group_2",
    participants: [
      {
        user_id: "user_1",
        email: "organizer@example.com",
        name: "سارا محمدی",
        joined_at: "2024-01-20T10:00:00.000Z",
        purchase_completed: false,
      },
      {
        email: "workshop1@example.com",
        name: "احمد کریمی",
        joined_at: "2024-01-21T11:30:00.000Z",
        purchase_completed: false,
      },
    ],
    status: "forming",
    current_participants: 2,
    discount_applied: 0,
    total_savings: 0,
    expires_at: "2024-02-20T10:00:00.000Z",
    created_at: "2024-01-20T10:00:00.000Z",
    updated_at: "2024-01-21T11:30:00.000Z",
  },
];

const mockUserStats: UserReferralStats = {
  _id: "stats_1",
  user_id: "user_1",
  referral_code: "SARA2024",
  total_invitations: 15,
  successful_referrals: 8,
  pending_referrals: 3,
  total_rewards_earned: 400000,
  total_commission_earned: 120000,
  total_points_earned: 800,
  conversion_rate: 53.3,
  best_month: {
    month: "2024-01",
    referrals: 5,
    rewards: 250000,
  },
  recent_referrals: mockReferralInvitations.slice(0, 3),
  earned_rewards: [
    {
      reward_id: "reward_1",
      reward_name: "پاداش ارجاع موفق",
      earned_at: "2024-01-15T16:45:00.000Z",
      amount: 50000,
      type: "cash",
    },
    {
      reward_id: "reward_2",
      reward_name: "امتیاز ارجاع",
      earned_at: "2024-01-15T16:45:00.000Z",
      amount: 100,
      type: "points",
    },
  ],
  current_streak: 3,
  longest_streak: 5,
  rank: 5,
  next_reward: {
    reward_id: "reward_3",
    reward_name: "پاداش ۱۰ ارجاع موفق",
    referrals_needed: 2,
    progress: 80,
  },
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-25T15:30:00.000Z",
};

const mockLeaderboard: ReferralLeaderboard = {
  period: "monthly",
  top_referrers: [
    {
      rank: 1,
      user_id: "user_top1",
      user_name: "احمد محمدی",
      user_avatar: "/images/avatars/user1.jpg",
      referrals_count: 25,
      rewards_earned: 1250000,
      points_earned: 2500,
      is_current_user: false,
    },
    {
      rank: 2,
      user_id: "user_top2",
      user_name: "فاطمه احمدی",
      user_avatar: "/images/avatars/user2.jpg",
      referrals_count: 18,
      rewards_earned: 900000,
      points_earned: 1800,
      is_current_user: false,
    },
    {
      rank: 3,
      user_id: "user_top3",
      user_name: "علی رضایی",
      user_avatar: "/images/avatars/user3.jpg",
      referrals_count: 15,
      rewards_earned: 750000,
      points_earned: 1500,
      is_current_user: false,
    },
    {
      rank: 4,
      user_id: "user_top4",
      user_name: "مریم کریمی",
      user_avatar: "/images/avatars/user4.jpg",
      referrals_count: 12,
      rewards_earned: 600000,
      points_earned: 1200,
      is_current_user: false,
    },
    {
      rank: 5,
      user_id: "user_1",
      user_name: "سارا محمدی",
      user_avatar: "/images/avatars/current-user.jpg",
      referrals_count: 8,
      rewards_earned: 400000,
      points_earned: 800,
      is_current_user: true,
    },
  ],
  user_rank: {
    rank: 5,
    referrals_count: 8,
    rewards_earned: 400000,
  },
  total_participants: 147,
  updated_at: "2024-01-25T15:30:00.000Z",
};

const mockReferralRewards: ReferralReward[] = [
  {
    _id: "reward_1",
    name: "پاداش ارجاع اولیه",
    name_en: "First Referral Reward",
    description: "پاداش نقدی برای اولین ارجاع موفق",
    description_en: "Cash reward for first successful referral",
    reward_type: "cash",
    cash_amount: 25000,
    conditions: {
      min_referrals: 1,
      min_purchase_amount: 100000,
    },
    is_active: true,
    image: {
      url: "/images/rewards/first-referral.jpg",
      alt: "First Referral Reward",
    },
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "reward_2",
    name: "امتیاز ارجاع",
    name_en: "Referral Points",
    description: "امتیاز اضافی برای هر ارجاع موفق",
    description_en: "Bonus points for each successful referral",
    reward_type: "points",
    points_reward: 100,
    conditions: {
      min_referrals: 1,
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
];

// Utility functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateReferralCode = (userName: string): string => {
  const baseCode = userName.substring(0, 4).toUpperCase();
  const randomNum = Math.floor(Math.random() * 9999) + 1000;
  return `${baseCode}${randomNum}`;
};

// API functions
export const referralApi = {
  // Get user referral statistics
  async getUserStats(
    userId: string,
  ): Promise<ReferralApiResponse<UserReferralStats>> {
    await delay(800);

    try {
      // In real implementation, make API call
      // const response = await fetch(`/api/referrals/stats/${userId}`);

      return {
        success: true,
        data: mockUserStats,
        message: "User referral stats retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        success: false,
        error: "Failed to get user statistics",
      };
    }
  },

  // Generate or get referral code
  async getReferralCode(
    userId: string,
  ): Promise<ReferralApiResponse<ReferralCode>> {
    await delay(500);

    try {
      // Check if user already has a code
      let userCode = mockReferralCodes.find((code) => code.user_id === userId);

      if (!userCode) {
        // Generate new code
        userCode = {
          _id: `ref_${Date.now()}`,
          user_id: userId,
          code: generateReferralCode("USER"),
          is_active: true,
          max_uses: 100,
          current_uses: 0,
          expires_at: "2024-12-31T23:59:59.000Z",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockReferralCodes.push(userCode);
      }

      return {
        success: true,
        data: userCode,
        message: "Referral code retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting referral code:", error);
      return {
        success: false,
        error: "Failed to get referral code",
      };
    }
  },

  // Send invitations
  async sendInvitations(
    request: SendInvitationRequest,
  ): Promise<ReferralApiResponse<{ sent: number }>> {
    await delay(1200);

    try {
      // Validate request
      if (!request.emails?.length && !request.phones?.length) {
        return {
          success: false,
          error: "At least one email or phone number is required",
        };
      }

      const totalRecipients =
        (request.emails?.length || 0) + (request.phones?.length || 0);

      // In real implementation, send actual invitations
      // const response = await fetch('/api/referrals/invite', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(request)
      // });

      // Simulate adding invitations to mock data
      const now = new Date().toISOString();
      request.emails?.forEach((email) => {
        mockReferralInvitations.push({
          _id: `inv_${Date.now()}_${Math.random()}`,
          referrer_id: "user_1",
          referee_email: email,
          referral_code: "SARA2024",
          status: "pending",
          invited_at: now,
          reward_given: false,
        });
      });

      request.phones?.forEach((phone) => {
        mockReferralInvitations.push({
          _id: `inv_${Date.now()}_${Math.random()}`,
          referrer_id: "user_1",
          referee_phone: phone,
          referral_code: "SARA2024",
          status: "pending",
          invited_at: now,
          reward_given: false,
        });
      });

      return {
        success: true,
        data: { sent: totalRecipients },
        message: `${totalRecipients} invitations sent successfully`,
      };
    } catch (error) {
      console.error("Error sending invitations:", error);
      return {
        success: false,
        error: "Failed to send invitations",
      };
    }
  },

  // Create group discount
  async createGroupDiscount(
    request: CreateGroupDiscountRequest,
  ): Promise<ReferralApiResponse<{ group_id: string }>> {
    await delay(1000);

    try {
      const discount = mockGroupDiscounts.find(
        (d) => d._id === request.discount_id,
      );
      if (!discount) {
        return {
          success: false,
          error: "Group discount not found",
        };
      }

      const groupId = `group_app_${Date.now()}`;
      const now = new Date().toISOString();
      const expiresAt = new Date(
        Date.now() + (request.expires_in_hours || 72) * 60 * 60 * 1000,
      ).toISOString();

      const participants: Array<{
        user_id?: string;
        email?: string;
        phone?: string;
        name: string;
        joined_at: string;
        purchase_completed: boolean;
        order_id?: string;
      }> = [
        {
          user_id: "user_1",
          email: "organizer@example.com",
          name: "سازمان‌دهنده گروه",
          joined_at: now,
          purchase_completed: false,
        },
      ];

      // Add invited participants
      request.participant_emails?.forEach((email) => {
        participants.push({
          email,
          name: email.split("@")[0],
          joined_at: now,
          purchase_completed: false,
        });
      });

      const newGroup: GroupDiscountApplication = {
        _id: `app_${Date.now()}`,
        group_id: groupId,
        organizer_id: "user_1",
        discount_id: request.discount_id,
        participants,
        status: "forming",
        current_participants: participants.length,
        discount_applied: 0,
        total_savings: 0,
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      };

      mockGroupApplications.push(newGroup);

      return {
        success: true,
        data: { group_id: groupId },
        message: "Group discount created successfully",
      };
    } catch (error) {
      console.error("Error creating group discount:", error);
      return {
        success: false,
        error: "Failed to create group discount",
      };
    }
  },

  // Join group
  async joinGroup(
    request: JoinGroupRequest,
  ): Promise<ReferralApiResponse<{ success: boolean }>> {
    await delay(800);

    try {
      const group = mockGroupApplications.find(
        (g) => g.group_id === request.group_id,
      );
      if (!group) {
        return {
          success: false,
          error: "Group not found",
        };
      }

      if (group.status !== "forming") {
        return {
          success: false,
          error: "Group is no longer accepting participants",
        };
      }

      // Check if user already joined
      const existingParticipant = group.participants.find(
        (p) =>
          p.email === request.user_info.email ||
          p.phone === request.user_info.phone,
      );

      if (existingParticipant) {
        return {
          success: false,
          error: "You have already joined this group",
        };
      }

      // Add participant
      group.participants.push({
        ...request.user_info,
        joined_at: new Date().toISOString(),
        purchase_completed: false,
      });

      group.current_participants = group.participants.length;
      group.updated_at = new Date().toISOString();

      // Check if group is ready to activate
      const discount = mockGroupDiscounts.find(
        (d) => d._id === group.discount_id,
      );
      if (discount && group.current_participants >= discount.min_participants) {
        group.status = "active";
        group.activated_at = new Date().toISOString();
        group.discount_applied = discount.discount_percentage;
      }

      return {
        success: true,
        data: { success: true },
        message: "Successfully joined the group",
      };
    } catch (error) {
      console.error("Error joining group:", error);
      return {
        success: false,
        error: "Failed to join group",
      };
    }
  },

  // Get referral history
  async getReferralHistory(
    query: ReferralQuery = {},
  ): Promise<ReferralApiResponse<ReferralHistoryResponse>> {
    await delay(600);

    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      let filteredReferrals = [...mockReferralInvitations];

      // Apply filters
      if (query.status) {
        filteredReferrals = filteredReferrals.filter(
          (r) => r.status === query.status,
        );
      }

      if (query.date_from) {
        filteredReferrals = filteredReferrals.filter(
          (r) => r.invited_at >= query.date_from!,
        );
      }

      if (query.date_to) {
        filteredReferrals = filteredReferrals.filter(
          (r) => r.invited_at <= query.date_to!,
        );
      }

      // Apply sorting
      filteredReferrals.sort((a, b) => {
        const sortBy = query.sort_by || "created_at";
        const order = query.sort_order === "asc" ? 1 : -1;

        let aValue, bValue;
        switch (sortBy) {
          case "completed_at":
            aValue = a.completed_at || "";
            bValue = b.completed_at || "";
            break;
          case "reward_amount":
            aValue = a.reward_amount || 0;
            bValue = b.reward_amount || 0;
            break;
          default:
            aValue = a.invited_at;
            bValue = b.invited_at;
        }

        if (aValue < bValue) return -1 * order;
        if (aValue > bValue) return 1 * order;
        return 0;
      });

      const paginatedReferrals = filteredReferrals.slice(startIndex, endIndex);
      const successful = filteredReferrals.filter(
        (r) => r.status === "completed",
      );
      const totalRewards = successful.reduce(
        (sum, r) => sum + (r.reward_amount || 0),
        0,
      );

      return {
        success: true,
        data: {
          referrals: paginatedReferrals,
          pagination: {
            page,
            limit,
            total: filteredReferrals.length,
            pages: Math.ceil(filteredReferrals.length / limit),
          },
          stats: {
            total_sent: filteredReferrals.length,
            total_successful: successful.length,
            total_rewards: totalRewards,
            conversion_rate:
              filteredReferrals.length > 0
                ? (successful.length / filteredReferrals.length) * 100
                : 0,
          },
        },
      };
    } catch (error) {
      console.error("Error getting referral history:", error);
      return {
        success: false,
        error: "Failed to get referral history",
      };
    }
  },

  // Get group discounts
  async getGroupDiscounts(
    query: GroupDiscountQuery = {},
  ): Promise<ReferralApiResponse<GroupDiscount[]>> {
    await delay(500);

    try {
      let filteredDiscounts = [...mockGroupDiscounts];

      // Apply filters
      if (query.tier) {
        filteredDiscounts = filteredDiscounts.filter(
          (d) => d.tier === query.tier,
        );
      }

      if (query.applicable_to) {
        filteredDiscounts = filteredDiscounts.filter(
          (d) =>
            d.applicable_to === query.applicable_to ||
            d.applicable_to === "all",
        );
      }

      // Only return active discounts by default
      filteredDiscounts = filteredDiscounts.filter((d) => d.is_active);

      return {
        success: true,
        data: filteredDiscounts,
        message: "Group discounts retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting group discounts:", error);
      return {
        success: false,
        error: "Failed to get group discounts",
      };
    }
  },

  // Get my group applications
  async getMyGroups(
    userId: string,
  ): Promise<ReferralApiResponse<GroupDiscountApplication[]>> {
    await delay(600);

    try {
      const userGroups = mockGroupApplications.filter(
        (g) =>
          g.organizer_id === userId ||
          g.participants.some((p) => p.user_id === userId),
      );

      return {
        success: true,
        data: userGroups,
        message: "User groups retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting user groups:", error);
      return {
        success: false,
        error: "Failed to get user groups",
      };
    }
  },

  // Get leaderboard
  async getLeaderboard(
    period: string = "monthly",
  ): Promise<ReferralApiResponse<ReferralLeaderboard>> {
    await delay(800);

    try {
      // In real implementation, period would affect the data
      const leaderboard = {
        ...mockLeaderboard,
        period: period as any,
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: leaderboard,
        message: "Leaderboard retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return {
        success: false,
        error: "Failed to get leaderboard",
      };
    }
  },

  // Share referral code
  async shareReferralCode(
    method: string,
    referralCode: string,
    message?: string,
  ): Promise<ReferralApiResponse<{ success: boolean }>> {
    await delay(300);

    try {
      const shareUrl = `https://irac.ir/register?ref=${referralCode}`;
      const shareText =
        message ||
        `به آی‌راک بپیوندید و با کد معرف ${referralCode} تخفیف ویژه دریافت کنید: ${shareUrl}`;

      switch (method) {
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            "_blank",
          );
          break;
        case "telegram":
          window.open(
            `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            "_blank",
          );
          break;
        case "email":
          window.location.href = `mailto:?subject=${encodeURIComponent("دعوت به آی‌راک")}&body=${encodeURIComponent(shareText)}`;
          break;
        case "copy":
          await navigator.clipboard.writeText(shareText);
          break;
        default:
          return {
            success: false,
            error: "Unsupported share method",
          };
      }

      return {
        success: true,
        data: { success: true },
        message: "Referral code shared successfully",
      };
    } catch (error) {
      console.error("Error sharing referral code:", error);
      return {
        success: false,
        error: "Failed to share referral code",
      };
    }
  },

  // Get available rewards
  async getAvailableRewards(): Promise<ReferralApiResponse<ReferralReward[]>> {
    await delay(400);

    try {
      return {
        success: true,
        data: mockReferralRewards.filter((r) => r.is_active),
        message: "Available rewards retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting available rewards:", error);
      return {
        success: false,
        error: "Failed to get available rewards",
      };
    }
  },
};
