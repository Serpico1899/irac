// Footer translation types
export interface FooterTranslations {
  copyright: string;
  allRightsReserved: string;
  aboutUs: string;
  contact: string;
  privacy: string;
  terms: string;
  followUs: string;
  newsletter: string;
  subscribe: string;
  emailPlaceholder: string;
}

// Common option type for dropdowns and selects
export interface Option {
  label: string;
  value: string;
}

// User level types
export type UserLevel = "Ghost" | "Manager" | "Editor" | "Normal" | null;

// Authentication context types
export interface AuthUser {
  token: string;
  level: UserLevel;
  nationalNumber: string;
}

// Cart item type for shopping cart
export interface CartItem {
  id: string;
  type: "course" | "workshop" | "product";
  name: string;
  name_en?: string;
  slug: string;
  price: number;
  discounted_price?: number;
  featured_image?: {
    url: string;
    alt?: string;
  };
  instructor?: string;
  instructor_en?: string;
  duration?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
  quantity: number;
  addedAt: Date;
  // Product-specific fields (optional)
  product_type?: ProductType;
  is_digital?: boolean;
  file_url?: string;
  specifications?: Record<string, any>;
}

// Shopping cart state
export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
}

// Cart context methods
export interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, "quantity" | "addedAt">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
}

// Wallet types
export type WalletStatus = "active" | "suspended" | "blocked";
export type WalletCurrency = "IRR" | "USD" | "EUR";

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "purchase"
  | "refund"
  | "transfer_in"
  | "transfer_out"
  | "bonus"
  | "penalty"
  | "commission";

export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentMethod =
  | "zarinpal"
  | "bank_transfer"
  | "manual"
  | "wallet_balance"
  | "credit_card"
  | "other";

export interface Wallet {
  _id: string;
  balance: number;
  currency: WalletCurrency;
  status: WalletStatus;
  is_active: boolean;
  last_transaction_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  _id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  payment_method?: PaymentMethod;
  description?: string;
  reference_id?: string;
  gateway_response?: string;
  balance_before: number;
  balance_after: number;
  ip_address?: string;
  user_agent?: string;
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletStats {
  balance: number;
  currency: string;
  status: WalletStatus;
  totalDeposits: {
    total: number;
    count: number;
  };
  totalWithdrawals: {
    total: number;
    count: number;
  };
  recentTransactions: WalletTransaction[];
}

export interface WalletBalance {
  balance: number;
  currency: string;
  status: WalletStatus;
  is_active: boolean;
}

// Wallet API request/response types
export interface DepositRequest {
  amount: number;
  payment_method?: string;
  description?: string;
  reference_id?: string;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
  reference_id?: string;
}

export interface PurchaseRequest {
  amount: number;
  order_id: string;
  description?: string;
}

export interface BonusRequest {
  user_id: string;
  amount: number;
  description: string;
}

export interface RefundRequest {
  transaction_id: string;
  refund_amount?: number;
  reason?: string;
}

export interface WalletStatusRequest {
  user_id: string;
  status: WalletStatus;
  reason?: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
}

export interface TransactionHistoryResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface WalletApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Product Store types
export type ProductType = "book" | "artwork" | "article" | "cultural" | "other";
export type ProductStatus = "active" | "draft" | "archived" | "out_of_stock";
export type ProductCategory =
  | "books"
  | "digital_books"
  | "physical_books"
  | "artworks"
  | "paintings"
  | "sculptures"
  | "digital_art"
  | "articles"
  | "cultural_items"
  | "handicrafts"
  | "educational"
  | "research"
  | "other";

export interface Product {
  _id: string;
  title: string;
  title_en?: string;
  slug: string;
  description: string;
  description_en?: string;
  type: ProductType;
  category: ProductCategory;
  status: ProductStatus;
  price: number;
  discounted_price?: number;
  stock_quantity?: number;
  is_digital: boolean;
  featured_image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  gallery?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  tags: string[];
  specifications?: Record<string, any>;
  author?: string;
  author_en?: string;
  isbn?: string;
  publisher?: string;
  publisher_en?: string;
  publication_date?: string;
  language: string;
  page_count?: number;
  file_url?: string;
  file_size?: number;
  file_format?: string;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: "cm" | "mm" | "inch";
  };
  weight?: {
    value: number;
    unit: "g" | "kg" | "lb";
  };
  materials?: string[];
  artist?: string;
  artist_en?: string;
  artwork_year?: number;
  artwork_style?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  view_count: number;
  purchase_count: number;
  rating: {
    average: number;
    count: number;
  };
  reviews?: ProductReview[];
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProductReview {
  _id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilter {
  category?: ProductCategory[];
  type?: ProductType[];
  status?: ProductStatus[];
  price_min?: number;
  price_max?: number;
  is_digital?: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new?: boolean;
  in_stock?: boolean;
  tags?: string[];
  author?: string;
  artist?: string;
  language?: string;
  search?: string;
}

export interface ProductQuery extends ProductFilter {
  page?: number;
  limit?: number;
  sort_by?:
    | "created_at"
    | "updated_at"
    | "title"
    | "price"
    | "rating"
    | "popularity";
  sort_order?: "asc" | "desc";
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: Array<{ category: ProductCategory; count: number }>;
    types: Array<{ type: ProductType; count: number }>;
    price_range: { min: number; max: number };
    tags: Array<{ tag: string; count: number }>;
  };
}

export interface ProductApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Product Cart Item (extends CartItem for products)

// Product Order types
export interface ProductOrderItem {
  product_id: string;
  title: string;
  type: ProductType;
  is_digital: boolean;
  price: number;
  discounted_price?: number;
  quantity: number;
  total: number;
  file_url?: string;
  download_expires_at?: string;
}

export interface ProductOrder {
  _id: string;
  order_number: string;
  user_id: string;
  items: ProductOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: PaymentMethod;
  shipping_address?: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Scoring System types
export type ScoreTransactionType =
  | "earn_purchase"
  | "earn_review"
  | "earn_referral"
  | "earn_activity"
  | "earn_bonus"
  | "spend_discount"
  | "spend_reward"
  | "expire"
  | "adjustment";

export type ScoreTransactionStatus =
  | "pending"
  | "completed"
  | "cancelled"
  | "expired";

export type UserScoreLevel =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master";

export type AchievementType =
  | "first_purchase"
  | "loyal_customer"
  | "big_spender"
  | "reviewer"
  | "referrer"
  | "milestone"
  | "seasonal"
  | "special";

export interface UserScore {
  _id: string;
  user_id: string;
  total_points: number;
  available_points: number;
  used_points: number;
  expired_points: number;
  level: UserScoreLevel;
  level_progress: number; // 0-100 percentage to next level
  next_level_points: number;
  lifetime_earned: number;
  current_streak: number;
  longest_streak: number;
  multiplier: number; // Level-based multiplier (1.0, 1.2, 1.5, etc.)
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreTransaction {
  _id: string;
  user_id: string;
  transaction_id: string;
  points: number;
  type: ScoreTransactionType;
  status: ScoreTransactionStatus;
  description: string;
  description_en?: string;
  reference_id?: string; // Order ID, Review ID, etc.
  reference_type?: "order" | "review" | "referral" | "activity";
  multiplier_applied?: number;
  base_points?: number; // Points before multiplier
  expires_at?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreLevel {
  level: UserScoreLevel;
  name: string;
  name_en?: string;
  min_points: number;
  max_points?: number;
  multiplier: number;
  color: string;
  icon: string;
  benefits: string[];
  benefits_en?: string[];
}

export interface Achievement {
  _id: string;
  code: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  type: AchievementType;
  icon: string;
  badge_color: string;
  points_reward: number;
  requirements: {
    type: string;
    value: number;
    timeframe?: string;
  };
  is_active: boolean;
  is_repeatable: boolean;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  _id: string;
  user_id: string;
  achievement_id: string;
  achievement: Achievement;
  earned_at: string;
  points_awarded: number;
  progress?: number; // For achievements with progress tracking
  completed: boolean;
  notified: boolean;
}

export interface ScoreReward {
  _id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  points_cost: number;
  discount_amount?: number;
  discount_percentage?: number;
  reward_type: "discount" | "product" | "service" | "voucher" | "exclusive";
  applicable_to?: "courses" | "workshops" | "products" | "all";
  min_order_amount?: number;
  max_uses_per_user?: number;
  max_total_uses?: number;
  current_uses: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  terms_conditions?: string;
  terms_conditions_en?: string;
  image?: {
    url: string;
    alt?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UserScoreStats {
  total_points: number;
  available_points: number;
  level: UserScoreLevel;
  level_progress: number;
  points_to_next_level: number;
  lifetime_earned: number;
  lifetime_used: number;
  current_streak: number;
  achievements_count: number;
  recent_transactions: ScoreTransaction[];
  available_rewards: ScoreReward[];
  earned_achievements: UserAchievement[];
}

// Scoring API request/response types
export interface EarnPointsRequest {
  points: number;
  type: ScoreTransactionType;
  description: string;
  reference_id?: string;
  reference_type?: string;
}

export interface SpendPointsRequest {
  points: number;
  reward_id?: string;
  order_id?: string;
  description: string;
}

export interface ScoreQuery {
  page?: number;
  limit?: number;
  type?: ScoreTransactionType;
  status?: ScoreTransactionStatus;
  date_from?: string;
  date_to?: string;
}

export interface ScoreHistoryResponse {
  transactions: ScoreTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    total_earned: number;
    total_spent: number;
    total_expired: number;
  };
}

export interface ScoringApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Scoring Context types
export interface ScoringContextType {
  userScore: UserScore | null;
  scoreStats: UserScoreStats | null;
  achievements: UserAchievement[];
  availableRewards: ScoreReward[];
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshScore: () => Promise<void>;
  earnPoints: (request: EarnPointsRequest) => Promise<boolean>;
  spendPoints: (request: SpendPointsRequest) => Promise<boolean>;
  getScoreHistory: (query?: ScoreQuery) => Promise<ScoreHistoryResponse | null>;
  claimReward: (rewardId: string) => Promise<boolean>;
  checkAchievements: () => Promise<void>;
}

// Integration types for existing systems
export interface CartWithScoring extends Cart {
  availableDiscount?: {
    points_cost: number;
    discount_amount: number;
    max_applicable: number;
  };
  appliedScoreDiscount?: {
    points_used: number;
    discount_amount: number;
    reward_id?: string;
  };
}

export interface OrderWithScoring {
  points_earned?: number;
  points_used?: number;
  score_discount_amount?: number;
  achievements_unlocked?: string[];
}

// Referral System types
export type ReferralStatus =
  | "pending"
  | "active"
  | "completed"
  | "expired"
  | "cancelled";
export type GroupDiscountTier =
  | "tier_1"
  | "tier_2"
  | "tier_3"
  | "tier_4"
  | "tier_5";
export type ReferralRewardType =
  | "points"
  | "discount"
  | "cash"
  | "product"
  | "commission";

export interface ReferralCode {
  _id: string;
  user_id: string;
  code: string;
  is_active: boolean;
  max_uses?: number;
  current_uses: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralInvitation {
  _id: string;
  referrer_id: string;
  referee_email?: string;
  referee_phone?: string;
  referral_code: string;
  status: ReferralStatus;
  invited_at: string;
  registered_at?: string;
  first_purchase_at?: string;
  completed_at?: string;
  reward_given: boolean;
  reward_amount?: number;
  commission_rate?: number;
  notes?: string;
}

export interface GroupDiscount {
  _id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  tier: GroupDiscountTier;
  min_participants: number;
  max_participants?: number;
  discount_percentage: number;
  discount_amount?: number;
  applicable_to: "courses" | "workshops" | "products" | "all";
  min_order_amount?: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupDiscountApplication {
  _id: string;
  group_id: string;
  organizer_id: string;
  discount_id: string;
  participants: Array<{
    user_id?: string;
    email?: string;
    phone?: string;
    name: string;
    joined_at: string;
    purchase_completed: boolean;
    order_id?: string;
  }>;
  status: "forming" | "active" | "completed" | "expired" | "cancelled";
  current_participants: number;
  discount_applied: number;
  total_savings: number;
  expires_at?: string;
  activated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralReward {
  _id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  reward_type: ReferralRewardType;
  points_reward?: number;
  discount_percentage?: number;
  discount_amount?: number;
  cash_amount?: number;
  commission_percentage?: number;
  product_id?: string;
  conditions: {
    min_referrals?: number;
    min_purchase_amount?: number;
    timeframe_days?: number;
    user_level?: UserScoreLevel[];
  };
  max_rewards_per_user?: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  image?: {
    url: string;
    alt?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UserReferralStats {
  _id: string;
  user_id: string;
  referral_code: string;
  total_invitations: number;
  successful_referrals: number;
  pending_referrals: number;
  total_rewards_earned: number;
  total_commission_earned: number;
  total_points_earned: number;
  conversion_rate: number; // successful / total * 100
  best_month: {
    month: string;
    referrals: number;
    rewards: number;
  };
  recent_referrals: ReferralInvitation[];
  earned_rewards: Array<{
    reward_id: string;
    reward_name: string;
    earned_at: string;
    amount: number;
    type: ReferralRewardType;
  }>;
  current_streak: number;
  longest_streak: number;
  rank: number; // Among all users
  next_reward?: {
    reward_id: string;
    reward_name: string;
    referrals_needed: number;
    progress: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ReferralLeaderboard {
  period: "daily" | "weekly" | "monthly" | "yearly" | "all_time";
  top_referrers: Array<{
    rank: number;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    referrals_count: number;
    rewards_earned: number;
    points_earned: number;
    is_current_user: boolean;
  }>;
  user_rank?: {
    rank: number;
    referrals_count: number;
    rewards_earned: number;
  };
  total_participants: number;
  updated_at: string;
}

// Referral API request/response types
export interface SendInvitationRequest {
  emails?: string[];
  phones?: string[];
  message?: string;
  share_method: "email" | "sms" | "whatsapp" | "telegram" | "manual";
}

export interface CreateGroupDiscountRequest {
  discount_id: string;
  participant_emails?: string[];
  participant_phones?: string[];
  message?: string;
  expires_in_hours?: number;
}

export interface JoinGroupRequest {
  group_id: string;
  user_info: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface ReferralQuery {
  page?: number;
  limit?: number;
  status?: ReferralStatus;
  date_from?: string;
  date_to?: string;
  sort_by?: "created_at" | "completed_at" | "reward_amount";
  sort_order?: "asc" | "desc";
}

export interface ReferralHistoryResponse {
  referrals: ReferralInvitation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    total_sent: number;
    total_successful: number;
    total_rewards: number;
    conversion_rate: number;
  };
}

export interface GroupDiscountQuery {
  page?: number;
  limit?: number;
  status?: "forming" | "active" | "completed" | "expired";
  tier?: GroupDiscountTier;
  applicable_to?: "courses" | "workshops" | "products" | "all";
}

export interface ReferralApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Referral Context types
export interface ReferralContextType {
  userStats: UserReferralStats | null;
  referralCode: ReferralCode | null;
  groupDiscounts: GroupDiscount[];
  myGroups: GroupDiscountApplication[];
  leaderboard: ReferralLeaderboard | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshStats: () => Promise<void>;
  generateReferralCode: () => Promise<boolean>;
  sendInvitations: (request: SendInvitationRequest) => Promise<boolean>;
  createGroupDiscount: (
    request: CreateGroupDiscountRequest,
  ) => Promise<string | null>;
  joinGroup: (request: JoinGroupRequest) => Promise<boolean>;
  getReferralHistory: (
    query?: ReferralQuery,
  ) => Promise<ReferralHistoryResponse | null>;
  getGroupDiscounts: (
    query?: GroupDiscountQuery,
  ) => Promise<GroupDiscountApplication[]>;
  getLeaderboard: (
    period?: "daily" | "weekly" | "monthly" | "yearly" | "all_time",
  ) => Promise<void>;
  shareReferralCode: (
    method: "whatsapp" | "telegram" | "email" | "copy",
  ) => Promise<boolean>;
}

// Integration types for existing systems
export interface CartWithReferral extends CartWithScoring {
  appliedGroupDiscount?: {
    group_id: string;
    discount_id: string;
    discount_percentage: number;
    discount_amount: number;
    participants_count: number;
    min_participants: number;
  };
  availableGroupDiscounts?: GroupDiscount[];
}

export interface OrderWithReferral extends OrderWithScoring {
  referral_code_used?: string;
  group_discount_id?: string;
  group_savings?: number;
  referral_points_earned?: number;
}

// Workshop Reservation System types
export type WorkshopStatus =
  | "draft"
  | "published"
  | "active"
  | "completed"
  | "cancelled";
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "waitlisted"
  | "cancelled"
  | "completed"
  | "no_show";
export type WorkshopLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "all_levels";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export interface WorkshopInstructor {
  _id: string;
  name: string;
  name_en?: string;
  bio: string;
  bio_en?: string;
  avatar?: {
    url: string;
    alt?: string;
  };
  specialties: string[];
  experience_years: number;
  rating: {
    average: number;
    count: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkshopSchedule {
  _id: string;
  workshop_id: string;
  instructor_id: string;
  start_date: string;
  end_date: string;
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  duration_minutes: number;
  max_participants: number;
  min_participants?: number;
  current_reservations: number;
  waitlist_count: number;
  price: number;
  discounted_price?: number;
  location?: {
    type: "online" | "physical" | "hybrid";
    address?: string;
    room?: string;
    meeting_link?: string;
    meeting_password?: string;
  };
  recurrence?: {
    type: RecurrenceType;
    interval: number; // every N days/weeks/months
    end_date?: string;
    days_of_week?: number[]; // 0=Sunday, 1=Monday, etc.
  };
  prerequisites?: string[];
  materials_needed?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workshop {
  _id: string;
  title: string;
  title_en?: string;
  slug: string;
  description: string;
  description_en?: string;
  short_description: string;
  short_description_en?: string;
  status: WorkshopStatus;
  level: WorkshopLevel;
  category: string;
  tags: string[];
  featured_image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  gallery?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  instructor: WorkshopInstructor;
  schedules: WorkshopSchedule[];
  base_price: number;
  currency: string;
  what_you_learn: string[];
  what_you_learn_en?: string[];
  requirements?: string[];
  requirements_en?: string[];
  materials_included?: string[];
  materials_included_en?: string[];
  certificate_provided: boolean;
  rating: {
    average: number;
    count: number;
  };
  total_participants: number;
  is_featured: boolean;
  is_popular: boolean;
  view_count: number;
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface WorkshopReservation {
  _id: string;
  reservation_number: string;
  user_id: string;
  workshop_id: string;
  schedule_id: string;
  workshop: Workshop;
  schedule: WorkshopSchedule;
  status: ReservationStatus;
  participant_info: {
    name: string;
    email: string;
    phone?: string;
    dietary_restrictions?: string;
    accessibility_needs?: string;
    emergency_contact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  payment_info: {
    amount_paid: number;
    payment_method: PaymentMethod;
    payment_status:
      | "pending"
      | "paid"
      | "failed"
      | "refunded"
      | "partial_refund";
    transaction_id?: string;
    discount_applied?: number;
    coupon_code?: string;
    group_discount?: {
      group_id: string;
      discount_percentage: number;
    };
  };
  booking_notes?: string;
  admin_notes?: string;
  confirmation_sent_at?: string;
  reminder_sent_at?: string;
  check_in_time?: string;
  completion_certificate?: {
    issued: boolean;
    issued_at?: string;
    certificate_url?: string;
  };
  feedback?: {
    rating: number;
    comment?: string;
    submitted_at: string;
  };
  waitlist_position?: number;
  reserved_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkshopAvailability {
  schedule_id: string;
  date: string;
  available_spots: number;
  is_available: boolean;
  is_waitlist_available: boolean;
  price: number;
  discounted_price?: number;
}

export interface WorkshopCalendarSlot {
  date: string;
  start_time: string;
  end_time: string;
  schedule_id: string;
  workshop_id: string;
  workshop_title: string;
  instructor_name: string;
  available_spots: number;
  total_spots: number;
  price: number;
  discounted_price?: number;
  is_available: boolean;
  is_waitlisted: boolean;
}

// Workshop API request/response types
export interface CreateReservationRequest {
  schedule_id: string;
  participant_info: {
    name: string;
    email: string;
    phone?: string;
    dietary_restrictions?: string;
    accessibility_needs?: string;
    emergency_contact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  payment_method?: PaymentMethod;
  amount?: number;
  coupon_code?: string;
  use_wallet_balance?: boolean;
  wallet_amount_used?: number;
  use_score_discount?: boolean;
  score_points_used?: number;
  booking_notes?: string;
}

export interface UpdateReservationRequest {
  participant_info?: Partial<WorkshopReservation["participant_info"]>;
  booking_notes?: string;
}

export interface CancelReservationRequest {
  reason?: string;
  request_refund?: boolean;
}

export interface WorkshopQuery {
  page?: number;
  limit?: number;
  category?: string;
  level?: WorkshopLevel;
  instructor_id?: string;
  date_from?: string;
  date_to?: string;
  price_min?: number;
  price_max?: number;
  location_type?: "online" | "physical" | "hybrid";
  available_only?: boolean;
  featured_only?: boolean;
  search?: string;
  sort_by?: "created_at" | "start_date" | "price" | "rating" | "popularity";
  sort_order?: "asc" | "desc";
}

export interface WorkshopListResponse {
  workshops: Workshop[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: Array<{ category: string; count: number }>;
    levels: Array<{ level: WorkshopLevel; count: number }>;
    instructors: Array<{ instructor_id: string; name: string; count: number }>;
    price_range: { min: number; max: number };
    location_types: Array<{ type: string; count: number }>;
  };
}

export interface ReservationQuery {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  workshop_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: "reserved_at" | "start_date" | "status";
  sort_order?: "asc" | "desc";
}

export interface ReservationHistoryResponse {
  reservations: WorkshopReservation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    total_reservations: number;
    completed: number;
    cancelled: number;
    total_spent: number;
  };
}

export interface AvailabilityQuery {
  workshop_id?: string;
  instructor_id?: string;
  date_from: string;
  date_to: string;
  location_type?: "online" | "physical" | "hybrid";
}

export interface WorkshopApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Workshop Context types
export interface WorkshopContextType {
  workshops: Workshop[];
  myReservations: WorkshopReservation[];
  availability: WorkshopAvailability[];
  isLoading: boolean;
  error: string | null;

  // Actions
  getWorkshops: (query?: WorkshopQuery) => Promise<WorkshopListResponse | null>;
  getWorkshop: (id: string) => Promise<Workshop | null>;
  getWorkshopBySlug: (slug: string) => Promise<Workshop | null>;
  getWorkshopSchedules: (
    workshopId: string,
    dateFrom?: string,
    dateTo?: string,
  ) => Promise<WorkshopSchedule[]>;
  getAvailability: (
    query: AvailabilityQuery,
  ) => Promise<WorkshopAvailability[]>;
  createReservation: (
    request: CreateReservationRequest,
  ) => Promise<string | null>;
  updateReservation: (
    reservationId: string,
    request: UpdateReservationRequest,
  ) => Promise<boolean>;
  cancelReservation: (
    reservationId: string,
    request?: CancelReservationRequest,
  ) => Promise<boolean>;
  getMyReservations: (
    query?: ReservationQuery,
  ) => Promise<ReservationHistoryResponse | null>;
  checkInReservation: (reservationId: string) => Promise<boolean>;
  submitFeedback: (
    reservationId: string,
    rating: number,
    comment?: string,
  ) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

// Integration types for existing systems
export interface CartWithWorkshop extends CartWithReferral {
  workshop_discounts?: {
    group_discount?: {
      group_id: string;
      discount_percentage: number;
    };
    early_bird_discount?: {
      discount_percentage: number;
      expires_at: string;
    };
  };
}

export interface OrderWithWorkshop extends OrderWithReferral {
  workshop_reservation_ids?: string[];
  workshop_total?: number;
  workshop_certificates_earned?: number;
}

// ================================
// SMS Authentication Types
// ================================

// SMS verification request
export interface SMSVerificationRequest {
  phone_number: string;
  purpose?: "login" | "register" | "password_reset" | "2fa";
  locale?: string;
}

// SMS verification response
export interface SMSVerificationResponse {
  verification_id: string;
  phone_number: string;
  expires_in: number; // seconds
  message: string;
  can_resend_after: number; // seconds
}

// SMS code verification request
export interface SMSCodeVerifyRequest {
  verification_id: string;
  code: string;
}

// SMS code verification response
export interface SMSCodeVerifyResponse {
  verified: boolean;
  phone_number: string;
  purpose: "login" | "register" | "password_reset" | "2fa";
  user_exists: boolean;
  user_id: string | null;
  token: string | null;
  message: string;
}

// SMS password reset request
export interface SMSPasswordResetRequest {
  phone_number: string;
  verification_id: string;
  new_password: string;
}

// SMS password reset response
export interface SMSPasswordResetResponse {
  user_id: string;
  phone_number: string;
  reset_completed: boolean;
  message: string;
}

// SMS guest login request
export interface SMSGuestLoginRequest {
  phone_number: string;
  verification_id: string;
  name?: string;
  email?: string;
}

// SMS guest login response
export interface SMSGuestLoginResponse {
  user: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    verified: boolean;
  };
  token: string;
  is_new_user: boolean;
  expires_in: number;
  message: string;
}

// SMS 2FA request
export interface SMS2FARequest {
  phone_number: string;
  action: "enable" | "disable";
  verification_id?: string; // Required for enable
}

// SMS 2FA response
export interface SMS2FAResponse {
  user_id: string;
  phone_number: string;
  two_factor_enabled: boolean;
  backup_codes?: string[];
  message: string;
}

// SMS verification status
export interface SMSVerificationStatus {
  verification_id: string;
  phone_number: string;
  verified: boolean;
  expired: boolean;
  attempts_remaining: number;
  time_left: number; // seconds
  can_resend: boolean;
  purpose: "login" | "register" | "password_reset" | "2fa";
}

// SMS API response wrapper
export interface SMSApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ================================
// Manual Payment System Types
// ================================

export type ManualPaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ManualPayment {
  _id: string;
  user_id: string;
  admin_id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: ManualPaymentStatus;
  payment_deadline?: string;
  related_order_id?: string;
  related_workshop_id?: string;
  related_product_id?: string;
  payment_instructions?: string;
  admin_notes?: string;
  user_notes?: string;
  proof_of_payment?: {
    file_url: string;
    file_name: string;
    uploaded_at: string;
  };
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateManualPaymentRequest {
  user_id: string;
  title: string;
  description: string;
  amount: number;
  payment_deadline?: string;
  related_order_id?: string;
  related_workshop_id?: string;
  related_product_id?: string;
  payment_instructions?: string;
}

export interface UpdateManualPaymentRequest {
  status?: ManualPaymentStatus;
  admin_notes?: string;
  payment_instructions?: string;
  rejection_reason?: string;
}

export interface ManualPaymentQuery {
  user_id?: string;
  admin_id?: string;
  status?: ManualPaymentStatus;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  page?: number;
  limit?: number;
}

export interface ManualPaymentHistoryResponse {
  payments: ManualPayment[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  total_amount: number;
  status_counts: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
}

export interface ManualPaymentApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Re-export other types if needed
export * from "./option";
