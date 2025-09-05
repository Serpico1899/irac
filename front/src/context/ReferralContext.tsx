"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { referralApi } from "@/services/referral/referralApi";
import type {
  ReferralContextType,
  UserReferralStats,
  ReferralCode,
  GroupDiscount,
  GroupDiscountApplication,
  ReferralLeaderboard,
  SendInvitationRequest,
  CreateGroupDiscountRequest,
  JoinGroupRequest,
  ReferralQuery,
  ReferralHistoryResponse,
  GroupDiscountQuery,
} from "@/types";

// State interface
interface ReferralState {
  userStats: UserReferralStats | null;
  referralCode: ReferralCode | null;
  groupDiscounts: GroupDiscount[];
  myGroups: GroupDiscountApplication[];
  leaderboard: ReferralLeaderboard | null;
  isLoading: boolean;
  error: string | null;
}

// Action types
type ReferralAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER_STATS"; payload: UserReferralStats | null }
  | { type: "SET_REFERRAL_CODE"; payload: ReferralCode | null }
  | { type: "SET_GROUP_DISCOUNTS"; payload: GroupDiscount[] }
  | { type: "SET_MY_GROUPS"; payload: GroupDiscountApplication[] }
  | { type: "SET_LEADERBOARD"; payload: ReferralLeaderboard | null }
  | { type: "UPDATE_GROUP"; payload: GroupDiscountApplication }
  | { type: "ADD_GROUP"; payload: GroupDiscountApplication }
  | { type: "RESET_STATE" };

// Initial state
const initialState: ReferralState = {
  userStats: null,
  referralCode: null,
  groupDiscounts: [],
  myGroups: [],
  leaderboard: null,
  isLoading: false,
  error: null,
};

// Reducer
const referralReducer = (
  state: ReferralState,
  action: ReferralAction,
): ReferralState => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "SET_USER_STATS":
      return {
        ...state,
        userStats: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_REFERRAL_CODE":
      return {
        ...state,
        referralCode: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_GROUP_DISCOUNTS":
      return {
        ...state,
        groupDiscounts: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_MY_GROUPS":
      return {
        ...state,
        myGroups: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_LEADERBOARD":
      return {
        ...state,
        leaderboard: action.payload,
        isLoading: false,
        error: null,
      };

    case "UPDATE_GROUP":
      return {
        ...state,
        myGroups: state.myGroups.map((group) =>
          group._id === action.payload._id ? action.payload : group,
        ),
      };

    case "ADD_GROUP":
      return {
        ...state,
        myGroups: [action.payload, ...state.myGroups],
      };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
};

// Context
const ReferralContext = createContext<ReferralContextType | null>(null);

// Provider component
interface ReferralProviderProps {
  children: React.ReactNode;
}

export const ReferralProvider: React.FC<ReferralProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(referralReducer, initialState);

  // Helper function to handle API errors
  const handleApiError = useCallback((error: string, fallbackMessage: string) => {
    const errorMessage = error || fallbackMessage;
    dispatch({ type: "SET_ERROR", payload: errorMessage });
    console.error("Referral API Error:", errorMessage);
  }, []);

  // Get current user ID (in real app, this would come from auth context)
  const getCurrentUserId = useCallback(() => {
    // TODO: Get from AuthContext
    return "user_1";
  }, []);

  // Refresh user stats
  const refreshStats = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const userId = getCurrentUserId();
      const response = await referralApi.getUserStats(userId);

      if (response.success && response.data) {
        dispatch({ type: "SET_USER_STATS", payload: response.data });
      } else {
        handleApiError(response.error || "", "Failed to refresh user stats");
      }
    } catch (error) {
      handleApiError("", "Failed to refresh user stats");
    }
  }, [getCurrentUserId, handleApiError]);

  // Generate or get referral code
  const generateReferralCode = useCallback(async (): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const userId = getCurrentUserId();
      const response = await referralApi.getReferralCode(userId);

      if (response.success && response.data) {
        dispatch({ type: "SET_REFERRAL_CODE", payload: response.data });
        return true;
      } else {
        handleApiError(response.error || "", "Failed to generate referral code");
        return false;
      }
    } catch (error) {
      handleApiError("", "Failed to generate referral code");
      return false;
    }
  }, [getCurrentUserId, handleApiError]);

  // Send invitations
  const sendInvitations = useCallback(async (request: SendInvitationRequest): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await referralApi.sendInvitations(request);

      if (response.success) {
        // Refresh stats to get updated invitation count
        await refreshStats();
        return true;
      } else {
        handleApiError(response.error || "", "Failed to send invitations");
        return false;
      }
    } catch (error) {
      handleApiError("", "Failed to send invitations");
      return false;
    }
  }, [refreshStats, handleApiError]);

  // Create group discount
  const createGroupDiscount = useCallback(async (request: CreateGroupDiscountRequest): Promise<string | null> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await referralApi.createGroupDiscount(request);

      if (response.success && response.data) {
        // Refresh my groups to include the new group
        const userId = getCurrentUserId();
        const groupsResponse = await referralApi.getMyGroups(userId);

        if (groupsResponse.success && groupsResponse.data) {
          dispatch({ type: "SET_MY_GROUPS", payload: groupsResponse.data });
        }

        dispatch({ type: "SET_LOADING", payload: false });
        return response.data.group_id;
      } else {
        handleApiError(response.error || "", "Failed to create group discount");
        return null;
      }
    } catch (error) {
      handleApiError("", "Failed to create group discount");
      return null;
    }
  }, [getCurrentUserId, handleApiError]);

  // Join group
  const joinGroup = useCallback(async (request: JoinGroupRequest): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await referralApi.joinGroup(request);

      if (response.success) {
        // Refresh my groups to get updated group data
        const userId = getCurrentUserId();
        const groupsResponse = await referralApi.getMyGroups(userId);

        if (groupsResponse.success && groupsResponse.data) {
          dispatch({ type: "SET_MY_GROUPS", payload: groupsResponse.data });
        }

        dispatch({ type: "SET_LOADING", payload: false });
        return true;
      } else {
        handleApiError(response.error || "", "Failed to join group");
        return false;
      }
    } catch (error) {
      handleApiError("", "Failed to join group");
      return false;
    }
  }, [getCurrentUserId, handleApiError]);

  // Get referral history
  const getReferralHistory = useCallback(async (query?: ReferralQuery): Promise<ReferralHistoryResponse | null> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await referralApi.getReferralHistory(query);

      if (response.success && response.data) {
        dispatch({ type: "SET_LOADING", payload: false });
        return response.data;
      } else {
        handleApiError(response.error || "", "Failed to get referral history");
        return null;
      }
    } catch (error) {
      handleApiError("", "Failed to get referral history");
      return null;
    }
  }, [handleApiError]);

  // Get group discounts
  const getGroupDiscounts = useCallback(async (query?: GroupDiscountQuery): Promise<GroupDiscountApplication[]> => {
    try {
      const response = await referralApi.getGroupDiscounts(query);

      if (response.success && response.data) {
        dispatch({ type: "SET_GROUP_DISCOUNTS", payload: response.data });
        return [];
      } else {
        handleApiError(response.error || "", "Failed to get group discounts");
        return [];
      }
    } catch (error) {
      handleApiError("", "Failed to get group discounts");
      return [];
    }
  }, [handleApiError]);

  // Get leaderboard
  const getLeaderboard = useCallback(async (period?: "daily" | "weekly" | "monthly" | "yearly" | "all_time"): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await referralApi.getLeaderboard(period || "monthly");

      if (response.success && response.data) {
        dispatch({ type: "SET_LEADERBOARD", payload: response.data });
      } else {
        handleApiError(response.error || "", "Failed to get leaderboard");
      }
    } catch (error) {
      handleApiError("", "Failed to get leaderboard");
    }
  }, [handleApiError]);

  // Share referral code
  const shareReferralCode = useCallback(async (method: "whatsapp" | "telegram" | "email" | "copy"): Promise<boolean> => {
    try {
      if (!state.referralCode) {
        handleApiError("", "No referral code available");
        return false;
      }

      const response = await referralApi.shareReferralCode(
        method,
        state.referralCode.code
      );

      if (response.success) {
        return true;
      } else {
        handleApiError(response.error || "", "Failed to share referral code");
        return false;
      }
    } catch (error) {
      handleApiError("", "Failed to share referral code");
      return false;
    }
  }, [state.referralCode, handleApiError]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await refreshStats();
      await generateReferralCode();

      // Load group discounts
      const groupDiscountsResponse = await referralApi.getGroupDiscounts();
      if (groupDiscountsResponse.success && groupDiscountsResponse.data) {
        dispatch({ type: "SET_GROUP_DISCOUNTS", payload: groupDiscountsResponse.data });
      }

      // Load my groups
      const userId = getCurrentUserId();
      const myGroupsResponse = await referralApi.getMyGroups(userId);
      if (myGroupsResponse.success && myGroupsResponse.data) {
        dispatch({ type: "SET_MY_GROUPS", payload: myGroupsResponse.data });
      }

      // Load leaderboard
      await getLeaderboard();
    };

    initializeData();
  }, [refreshStats, generateReferralCode, getCurrentUserId, getLeaderboard]);

  // Context value
  const contextValue: ReferralContextType = {
    userStats: state.userStats,
    referralCode: state.referralCode,
    groupDiscounts: state.groupDiscounts,
    myGroups: state.myGroups,
    leaderboard: state.leaderboard,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    refreshStats,
    generateReferralCode,
    sendInvitations,
    createGroupDiscount,
    joinGroup,
    getReferralHistory,
    getGroupDiscounts,
    getLeaderboard,
    shareReferralCode,
  };

  return (
    <ReferralContext.Provider value={contextValue}>
      {children}
    </ReferralContext.Provider>
  );
};

// Hook to use referral context
export const useReferral = (): ReferralContextType => {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error("useReferral must be used within a ReferralProvider");
  }
  return context;
};

// Export context for testing
export { ReferralContext };
