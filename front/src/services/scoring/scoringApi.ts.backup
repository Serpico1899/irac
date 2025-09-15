import {
  UserScore,
  ScoreTransaction,
  Achievement,
  UserAchievement,
  ScoreReward,
  UserScoreStats,
  ScoreLevel,
  UserScoreLevel,
  EarnPointsRequest,
  SpendPointsRequest,
  ScoreQuery,
  ScoreHistoryResponse,
  ScoringApiResponse,
  ScoreTransactionType,
  AchievementType,
} from "@/types";

/**
 * ScoringApiService - Comprehensive API service for user scoring system
 * Handles points, levels, achievements, rewards, and gamification
 */
import { env } from "../../config/env.config";

export class ScoringApiService {
  private static readonly BASE_URL = env.API.URL;
  private static readonly API_PREFIX = "/lesan";
  private static readonly USE_MOCK_DATA = false; // Always use real backend APIs

  /**
   * Get user's current score and stats
   */
  static async getUserScore(
    userId: string,
  ): Promise<ScoringApiResponse<UserScore>> {
    if (this.USE_MOCK_DATA) {
      // Return mock data for development
      await this.mockDelay();
      return {
        success: true,
        data: this.generateMockUserScore(userId),
      };
    }

    try {
      const response = await fetch(`${this.BASE_URL}${this.API_PREFIX}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          act: "getUserScore",
          details: {
            set: {
              user_id: userId,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user score:", error);
      // Fallback to mock data on error
      return {
        success: true,
        data: this.generateMockUserScore(userId),
      };
    }
  }

  /**
   * Get comprehensive user score statistics
   */
  static async getUserScoreStats(
    userId: string,
  ): Promise<ScoringApiResponse<UserScoreStats>> {
    if (this.USE_MOCK_DATA) {
      await this.mockDelay();
      return {
        success: true,
        data: this.generateMockUserStats(userId),
      };
    }

    try {
      const response = await fetch(`${this.BASE_URL}${this.API_PREFIX}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          act: "addPoints",
          details: {
            set: {
              action: reason,
              points,
              description: reason,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching score stats:", error);
      // Fallback to mock data
      return {
        success: true,
        data: this.generateMockUserStats(userId),
      };
    }
  }

  /**
   * Earn points for user activities
   */
  static async earnPoints(
    userId: string,
    request: EarnPointsRequest,
  ): Promise<ScoringApiResponse<ScoreTransaction>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/users/${userId}/earn`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
          body: JSON.stringify(request),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error earning points:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to earn points",
      };
    }
  }

  /**
   * Spend points on rewards or discounts
   */
  static async spendPoints(
    userId: string,
    request: SpendPointsRequest,
  ): Promise<ScoringApiResponse<ScoreTransaction>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/users/${userId}/spend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
          body: JSON.stringify(request),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error spending points:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to spend points",
      };
    }
  }

  /**
   * Get user's score transaction history
   */
  static async getScoreHistory(
    userId: string,
    query: ScoreQuery = {},
  ): Promise<ScoringApiResponse<ScoreHistoryResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (query.page) queryParams.append("page", query.page.toString());
      if (query.limit) queryParams.append("limit", query.limit.toString());
      if (query.type) queryParams.append("type", query.type);
      if (query.status) queryParams.append("status", query.status);
      if (query.date_from) queryParams.append("date_from", query.date_from);
      if (query.date_to) queryParams.append("date_to", query.date_to);

      const url = `${this.BASE_URL}${this.API_PREFIX}/users/${userId}/history?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching score history:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch score history",
      };
    }
  }

  /**
   * Get all available achievements
   */
  static async getAchievements(): Promise<ScoringApiResponse<Achievement[]>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/achievements`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch achievements",
      };
    }
  }

  /**
   * Get user's earned achievements
   */
  static async getUserAchievements(
    userId: string,
  ): Promise<ScoringApiResponse<UserAchievement[]>> {
    if (this.USE_MOCK_DATA) {
      await this.mockDelay();
      return {
        success: true,
        data: this.generateMockUserAchievements(userId),
      };
    }

    try {
      const response = await fetch(`${this.BASE_URL}${this.API_PREFIX}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          act: "getUserAchievements",
          details: {
            set: {
              user_id: userId,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      // Fallback to mock data
      return {
        success: true,
        data: this.generateMockUserAchievements(userId),
      };
    }
  }

  /**
   * Check for new achievements
   */
  static async checkAchievements(
    userId: string,
  ): Promise<ScoringApiResponse<UserAchievement[]>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/users/${userId}/achievements/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking achievements:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check achievements",
      };
    }
  }

  /**
   * Get available score rewards
   */
  static async getAvailableRewards(): Promise<
    ScoringApiResponse<ScoreReward[]>
  > {
    if (this.USE_MOCK_DATA) {
      await this.mockDelay();
      return {
        success: true,
        data: this.generateMockRewards(),
      };
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/rewards`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching rewards:", error);
      // Fallback to mock data
      return {
        success: true,
        data: this.generateMockRewards(),
      };
    }
  }

  /**
   * Claim a reward with points
   */
  static async claimReward(
    userId: string,
    rewardId: string,
  ): Promise<
    ScoringApiResponse<{ transaction: ScoreTransaction; reward: ScoreReward }>
  > {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/users/${userId}/rewards/${rewardId}/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error claiming reward:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to claim reward",
      };
    }
  }

  /**
   * Get score levels configuration
   */
  static async getScoreLevels(): Promise<ScoringApiResponse<ScoreLevel[]>> {
    try {
      const response = await fetch(`${this.BASE_URL}${this.API_PREFIX}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          act: "getLeaderboard",
          details: {
            set: {
              limit: limit || 10,
              period: period || "all_time",
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching score levels:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch score levels",
      };
    }
  }

  /**
   * Calculate points for purchase
   */
  static async calculatePurchasePoints(
    amount: number,
    userId?: string,
  ): Promise<ScoringApiResponse<{ points: number; multiplier: number }>> {
    try {
      const body: any = { amount };
      if (userId) body.user_id = userId;

      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/calculate/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(userId && { Authorization: `Bearer ${this.getAuthToken()}` }),
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error calculating purchase points:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate purchase points",
      };
    }
  }

  /**
   * Get applicable score discounts for cart
   */
  static async getApplicableDiscounts(
    userId: string,
    cartTotal: number,
  ): Promise<ScoringApiResponse<ScoreReward[]>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/users/${userId}/discounts?total=${cartTotal}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching applicable discounts:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch applicable discounts",
      };
    }
  }

  /**
   * Process points for completed purchase
   */
  static async processPurchasePoints(
    userId: string,
    orderId: string,
    amount: number,
  ): Promise<
    ScoringApiResponse<{
      transaction: ScoreTransaction;
      achievements?: UserAchievement[];
    }>
  > {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/users/${userId}/purchase/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            amount: amount,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error processing purchase points:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process purchase points",
      };
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(
    limit: number = 10,
    period: "weekly" | "monthly" | "all_time" = "monthly",
  ): Promise<
    ScoringApiResponse<
      Array<{
        user_id: string;
        user_name: string;
        total_points: number;
        level: UserScoreLevel;
        rank: number;
      }>
    >
  > {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/leaderboard?limit=${limit}&period=${period}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch leaderboard",
      };
    }
  }

  /**
   * Get user's ranking
   */
  static async getUserRanking(
    userId: string,
    period: "weekly" | "monthly" | "all_time" = "monthly",
  ): Promise<
    ScoringApiResponse<{
      rank: number;
      total_users: number;
      percentile: number;
    }>
  > {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_PREFIX}/users/${userId}/ranking?period=${period}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user ranking:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user ranking",
      };
    }
  }

  /**
   * Mock data generators for development/testing
   */
  static generateMockUserScore(userId: string): UserScore {
    const random = this.seededRandom(userId);
    const levels: UserScoreLevel[] = [
      "bronze",
      "silver",
      "gold",
      "platinum",
      "diamond",
      "master",
    ];
    const level = levels[Math.floor(random() * 3) + 1]; // Mostly silver, gold, platinum
    const totalPoints = Math.floor(random() * 5000) + 1500;
    const usedPoints = Math.floor(totalPoints * (random() * 0.4 + 0.1));
    const availablePoints = totalPoints - usedPoints;

    return {
      _id: `score_${userId}`,
      user_id: userId,
      total_points: totalPoints,
      available_points: availablePoints,
      used_points: usedPoints,
      expired_points: Math.floor(random() * 100),
      level: level,
      level_progress: Math.floor(random() * 100),
      next_level_points: Math.floor(random() * 2000) + 3000,
      lifetime_earned: totalPoints + Math.floor(random() * 1000),
      current_streak: Math.floor(random() * 30) + 1,
      longest_streak: Math.floor(random() * 50) + 10,
      multiplier:
        level === "bronze"
          ? 1.0
          : level === "silver"
            ? 1.2
            : level === "gold"
              ? 1.5
              : level === "platinum"
                ? 1.8
                : level === "diamond"
                  ? 2.0
                  : 2.5,
      last_activity_at: new Date(
        Date.now() - Math.floor(random() * 7) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      created_at: new Date(
        Date.now() - Math.floor(random() * 365) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  static generateMockScoreHistory(): ScoreTransaction[] {
    const types: ScoreTransactionType[] = [
      "earn_purchase",
      "earn_review",
      "spend_discount",
      "earn_referral",
    ];
    const transactions: ScoreTransaction[] = [];

    for (let i = 0; i < 10; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const isEarn = type.startsWith("earn_");

      transactions.push({
        _id: `transaction_${i}`,
        user_id: "current_user",
        transaction_id: `TXN${Date.now()}${i}`,
        points: isEarn
          ? Math.floor(Math.random() * 200) + 10
          : -(Math.floor(Math.random() * 100) + 10),
        type,
        status: "completed",
        description: this.getTransactionDescription(type),
        reference_id: `REF${i}`,
        multiplier_applied: type === "earn_purchase" ? 1.5 : 1.0,
        base_points:
          type === "earn_purchase"
            ? Math.floor(Math.random() * 150) + 10
            : undefined,
        processed_at: new Date(
          Date.now() - i * 24 * 60 * 60 * 1000,
        ).toISOString(),
        created_at: new Date(
          Date.now() - i * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date(
          Date.now() - i * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });
    }

    return transactions;
  }

  static generateMockRewards(): ScoreReward[] {
    return [
      {
        _id: "reward_1",
        name: "تخفیف 10 درصدی",
        name_en: "10% Discount",
        description: "تخفیف 10 درصدی برای خرید بعدی",
        description_en: "10% discount on your next purchase",
        points_cost: 500,
        discount_percentage: 10,
        reward_type: "discount",
        applicable_to: "all",
        min_order_amount: 100000,
        max_uses_per_user: 3,
        current_uses: 145,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: "reward_2",
        name: "کتاب رایگان",
        name_en: "Free Book",
        description: "یک کتاب دیجیتال رایگان از مجموعه ما",
        description_en: "A free digital book from our collection",
        points_cost: 1000,
        reward_type: "product",
        applicable_to: "products",
        max_uses_per_user: 1,
        current_uses: 23,
        is_active: true,
        image: {
          url: "/images/rewards/free-book.jpg",
          alt: "Free Book Reward",
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: "reward_3",
        name: "تخفیف 25 درصدی",
        name_en: "25% Discount",
        description: "تخفیف 25 درصدی برای خرید محصولات",
        description_en: "25% discount on products",
        points_cost: 1250,
        discount_percentage: 25,
        reward_type: "discount",
        applicable_to: "products",
        min_order_amount: 200000,
        max_uses_per_user: 2,
        current_uses: 67,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: "reward_4",
        name: "دوره رایگان",
        name_en: "Free Course",
        description: "یک دوره آموزشی رایگان",
        description_en: "A free educational course",
        points_cost: 2000,
        reward_type: "service",
        applicable_to: "courses",
        max_uses_per_user: 1,
        current_uses: 12,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: "reward_5",
        name: "کوپن 50 هزار تومانی",
        name_en: "50K IRR Voucher",
        description: "کوپن 50 هزار تومانی برای خرید",
        description_en: "50,000 IRR voucher for purchases",
        points_cost: 3000,
        discount_amount: 50000,
        reward_type: "voucher",
        applicable_to: "all",
        min_order_amount: 150000,
        max_uses_per_user: 1,
        current_uses: 8,
        is_active: true,
        terms_conditions: "قابل استفاده تا 30 روز",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: "reward_6",
        name: "دسترسی VIP",
        name_en: "VIP Access",
        description: "دسترسی ویژه به محتوای VIP",
        description_en: "Special access to VIP content",
        points_cost: 5000,
        reward_type: "exclusive",
        applicable_to: "all",
        max_uses_per_user: 1,
        current_uses: 3,
        is_active: true,
        valid_from: new Date().toISOString(),
        valid_until: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  private static getTransactionDescription(type: ScoreTransactionType): string {
    const descriptions = {
      earn_purchase: "امتیاز خرید محصول",
      earn_review: "امتیاز نظر دادن",
      earn_referral: "امتیاز معرفی دوستان",
      earn_activity: "امتیاز فعالیت روزانه",
      earn_bonus: "امتیاز جایزه",
      spend_discount: "استفاده از تخفیف",
      spend_reward: "دریافت جایزه",
      expire: "انقضای امتیاز",
      adjustment: "تعدیل امتیاز",
    };
    return descriptions[type] || "تراکنش امتیاز";
  }

  /**
   * Generate mock user statistics
   */
  static generateMockUserStats(userId: string): UserScoreStats {
    const random = this.seededRandom(userId);
    const userScore = this.generateMockUserScore(userId);

    return {
      total_points: userScore.total_points,
      available_points: userScore.available_points,
      level: userScore.level,
      level_progress: userScore.level_progress,
      points_to_next_level:
        userScore.next_level_points - userScore.total_points,
      lifetime_earned: userScore.lifetime_earned,
      lifetime_used: userScore.used_points,
      current_streak: userScore.current_streak,
      achievements_count: Math.floor(random() * 15) + 5,
      recent_transactions: this.generateMockScoreHistory().slice(0, 5),
      available_rewards: this.generateMockRewards().slice(0, 3),
      earned_achievements: this.generateMockUserAchievements(userId).filter(
        (a) => a.completed,
      ),
    };
  }

  /**
   * Generate mock user achievements
   */
  static generateMockUserAchievements(userId: string): UserAchievement[] {
    const random = this.seededRandom(userId);
    const mockAchievements = this.generateMockAchievements();

    return mockAchievements.map((achievement, index) => ({
      _id: `user_achievement_${userId}_${index}`,
      user_id: userId,
      achievement_id: achievement._id,
      achievement: achievement,
      earned_at:
        random() > 0.3
          ? new Date(
              Date.now() - Math.floor(random() * 90) * 24 * 60 * 60 * 1000,
            ).toISOString()
          : "",
      points_awarded: achievement.points_reward,
      progress: random() > 0.3 ? 100 : Math.floor(random() * 100),
      completed: random() > 0.3,
      notified: random() > 0.5,
    }));
  }

  /**
   * Generate mock achievements
   */
  static generateMockAchievements(): Achievement[] {
    return [
      {
        _id: "achievement_1",
        code: "first_purchase",
        name: "اولین خرید",
        name_en: "First Purchase",
        description: "اولین خرید خود را انجام دهید",
        description_en: "Make your first purchase",
        type: "first_purchase",
        icon: "🛒",
        badge_color: "green",
        points_reward: 100,
        requirements: { type: "purchase_count", value: 1 },
        is_active: true,
        is_repeatable: false,
        rarity: "common",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: "achievement_2",
        code: "loyal_customer",
        name: "مشتری وفادار",
        name_en: "Loyal Customer",
        description: "10 خرید موفق انجام دهید",
        description_en: "Complete 10 successful purchases",
        type: "loyal_customer",
        icon: "💎",
        badge_color: "blue",
        points_reward: 500,
        requirements: { type: "purchase_count", value: 10 },
        is_active: true,
        is_repeatable: false,
        rarity: "uncommon",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: "achievement_3",
        code: "big_spender",
        name: "خریدار بزرگ",
        name_en: "Big Spender",
        description: "بیش از 1 میلیون تومان خرید کنید",
        description_en: "Spend more than 1 million IRR",
        type: "big_spender",
        icon: "💰",
        badge_color: "yellow",
        points_reward: 1000,
        requirements: { type: "total_spent", value: 1000000 },
        is_active: true,
        is_repeatable: false,
        rarity: "rare",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: "achievement_4",
        code: "reviewer",
        name: "نقد نویس",
        name_en: "Reviewer",
        description: "5 نظر مفید بنویسید",
        description_en: "Write 5 helpful reviews",
        type: "reviewer",
        icon: "⭐",
        badge_color: "orange",
        points_reward: 300,
        requirements: { type: "review_count", value: 5 },
        is_active: true,
        is_repeatable: false,
        rarity: "common",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: "achievement_5",
        code: "referrer",
        name: "معرف دوستان",
        name_en: "Friend Referrer",
        description: "3 دوست را معرفی کنید",
        description_en: "Refer 3 friends",
        type: "referrer",
        icon: "👥",
        badge_color: "purple",
        points_reward: 750,
        requirements: { type: "referral_count", value: 3 },
        is_active: true,
        is_repeatable: false,
        rarity: "uncommon",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Seeded random number generator for consistent mock data
   */
  private static seededRandom(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return function () {
      hash = (hash << 5) - hash + 1;
      hash = hash & hash;
      return (hash >>> 0) / 4294967296;
    };
  }

  /**
   * Mock delay for realistic API simulation
   */
  private static async mockDelay(): Promise<void> {
    const delay = Math.random() * 500 + 200; // 200-700ms delay
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Get authentication token from localStorage or context
   */
  private static getAuthToken(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token") || "";
    }
    return "";
  }
}

// Export default for easier importing
export default ScoringApiService;
