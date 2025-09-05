"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  ScoringContextType,
  UserScore,
  UserScoreStats,
  UserAchievement,
  ScoreReward,
  EarnPointsRequest,
  SpendPointsRequest,
  ScoreQuery,
  ScoreHistoryResponse,
  ScoreTransaction,
} from "@/types";
import { ScoringApiService } from "@/services/scoring/scoringApi";
import { useAuth } from "./AuthContext";
import Cookies from "js-cookie";

// Scoring state interface
interface ScoringState {
  userScore: UserScore | null;
  scoreStats: UserScoreStats | null;
  achievements: UserAchievement[];
  availableRewards: ScoreReward[];
  isLoading: boolean;
  error: string | null;
  lastRefresh: number | null;
}

// Action types for the reducer
type ScoringAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER_SCORE"; payload: UserScore }
  | { type: "SET_SCORE_STATS"; payload: UserScoreStats }
  | { type: "SET_ACHIEVEMENTS"; payload: UserAchievement[] }
  | { type: "ADD_ACHIEVEMENT"; payload: UserAchievement }
  | { type: "SET_AVAILABLE_REWARDS"; payload: ScoreReward[] }
  | { type: "UPDATE_POINTS"; payload: { available: number; used: number } }
  | { type: "RESET_STATE" }
  | { type: "SET_LAST_REFRESH"; payload: number };

// Initial state
const initialState: ScoringState = {
  userScore: null,
  scoreStats: null,
  achievements: [],
  availableRewards: [],
  isLoading: false,
  error: null,
  lastRefresh: null,
};

// Reducer function
const scoringReducer = (
  state: ScoringState,
  action: ScoringAction,
): ScoringState => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error, // Clear error when starting to load
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "SET_USER_SCORE":
      return {
        ...state,
        userScore: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_SCORE_STATS":
      return {
        ...state,
        scoreStats: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_ACHIEVEMENTS":
      return {
        ...state,
        achievements: action.payload,
      };

    case "ADD_ACHIEVEMENT":
      return {
        ...state,
        achievements: [...state.achievements, action.payload],
      };

    case "SET_AVAILABLE_REWARDS":
      return {
        ...state,
        availableRewards: action.payload,
      };

    case "UPDATE_POINTS":
      if (!state.userScore) return state;
      return {
        ...state,
        userScore: {
          ...state.userScore,
          available_points: action.payload.available,
          used_points: action.payload.used,
          updated_at: new Date().toISOString(),
        },
      };

    case "RESET_STATE":
      return initialState;

    case "SET_LAST_REFRESH":
      return {
        ...state,
        lastRefresh: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const ScoringContext = createContext<ScoringContextType | null>(null);

// Context provider props
interface ScoringProviderProps {
  children: ReactNode;
}

// Context provider component
export const ScoringProvider: React.FC<ScoringProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(scoringReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Get user national number from cookies
  const getUserNationalNumber = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return Cookies.get("national_number") || null;
  }, []);

  // Check if data needs refresh
  const needsRefresh = useCallback(() => {
    if (!state.lastRefresh) return true;
    return Date.now() - state.lastRefresh > CACHE_DURATION;
  }, [state.lastRefresh]);

  // Refresh user score and stats
  const refreshScore = useCallback(async (): Promise<void> => {
    const nationalNumber = getUserNationalNumber();
    if (!isAuthenticated || !nationalNumber) {
      dispatch({ type: "RESET_STATE" });
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Parallel fetch for better performance
      const [
        scoreResponse,
        statsResponse,
        achievementsResponse,
        rewardsResponse,
      ] = await Promise.all([
        ScoringApiService.getUserScore(nationalNumber),
        ScoringApiService.getUserScoreStats(nationalNumber),
        ScoringApiService.getUserAchievements(nationalNumber),
        ScoringApiService.getAvailableRewards(),
      ]);

      if (scoreResponse.success && scoreResponse.data) {
        dispatch({ type: "SET_USER_SCORE", payload: scoreResponse.data });
      }

      if (statsResponse.success && statsResponse.data) {
        dispatch({ type: "SET_SCORE_STATS", payload: statsResponse.data });
      }

      if (achievementsResponse.success && achievementsResponse.data) {
        dispatch({
          type: "SET_ACHIEVEMENTS",
          payload: achievementsResponse.data,
        });
      }

      if (rewardsResponse.success && rewardsResponse.data) {
        dispatch({
          type: "SET_AVAILABLE_REWARDS",
          payload: rewardsResponse.data,
        });
      }

      dispatch({ type: "SET_LAST_REFRESH", payload: Date.now() });

      // Handle any errors
      const errors = [
        scoreResponse,
        statsResponse,
        achievementsResponse,
        rewardsResponse,
      ]
        .filter((response) => !response.success)
        .map((response) => response.error)
        .filter(Boolean);

      if (errors.length > 0) {
        dispatch({ type: "SET_ERROR", payload: errors.join(", ") });
      }
    } catch (error) {
      console.error("Error refreshing score:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to refresh score",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [isAuthenticated, getUserNationalNumber]);

  // Earn points
  const earnPoints = useCallback(
    async (request: EarnPointsRequest): Promise<boolean> => {
      const nationalNumber = getUserNationalNumber();
      if (!isAuthenticated || !nationalNumber) {
        dispatch({ type: "SET_ERROR", payload: "User not authenticated" });
        return false;
      }

      try {
        const response = await ScoringApiService.earnPoints(
          nationalNumber,
          request,
        );

        if (response.success && response.data) {
          // Refresh score after earning points
          await refreshScore();
          return true;
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: response.error || "Failed to earn points",
          });
          return false;
        }
      } catch (error) {
        console.error("Error earning points:", error);
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error ? error.message : "Failed to earn points",
        });
        return false;
      }
    },
    [isAuthenticated, getUserNationalNumber, refreshScore],
  );

  // Spend points
  const spendPoints = useCallback(
    async (request: SpendPointsRequest): Promise<boolean> => {
      const nationalNumber = getUserNationalNumber();
      if (!isAuthenticated || !nationalNumber) {
        dispatch({ type: "SET_ERROR", payload: "User not authenticated" });
        return false;
      }

      if (
        !state.userScore ||
        state.userScore.available_points < request.points
      ) {
        dispatch({ type: "SET_ERROR", payload: "Insufficient points" });
        return false;
      }

      try {
        const response = await ScoringApiService.spendPoints(
          nationalNumber,
          request,
        );

        if (response.success && response.data) {
          // Update points immediately for better UX
          const newAvailable =
            state.userScore.available_points - request.points;
          const newUsed = state.userScore.used_points + request.points;

          dispatch({
            type: "UPDATE_POINTS",
            payload: { available: newAvailable, used: newUsed },
          });

          return true;
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: response.error || "Failed to spend points",
          });
          return false;
        }
      } catch (error) {
        console.error("Error spending points:", error);
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error ? error.message : "Failed to spend points",
        });
        return false;
      }
    },
    [isAuthenticated, getUserNationalNumber, state.userScore],
  );

  // Get score history
  const getScoreHistory = useCallback(
    async (query: ScoreQuery = {}): Promise<ScoreHistoryResponse | null> => {
      const nationalNumber = getUserNationalNumber();
      if (!isAuthenticated || !nationalNumber) {
        dispatch({ type: "SET_ERROR", payload: "User not authenticated" });
        return null;
      }

      try {
        const response = await ScoringApiService.getScoreHistory(
          nationalNumber,
          query,
        );

        if (response.success && response.data) {
          return response.data;
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: response.error || "Failed to get score history",
          });
          return null;
        }
      } catch (error) {
        console.error("Error getting score history:", error);
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error.message
              : "Failed to get score history",
        });
        return null;
      }
    },
    [isAuthenticated, getUserNationalNumber],
  );

  // Claim reward
  const claimReward = useCallback(
    async (rewardId: string): Promise<boolean> => {
      const nationalNumber = getUserNationalNumber();
      if (!isAuthenticated || !nationalNumber) {
        dispatch({ type: "SET_ERROR", payload: "User not authenticated" });
        return false;
      }

      const reward = state.availableRewards.find((r) => r._id === rewardId);
      if (!reward) {
        dispatch({ type: "SET_ERROR", payload: "Reward not found" });
        return false;
      }

      if (
        !state.userScore ||
        state.userScore.available_points < reward.points_cost
      ) {
        dispatch({ type: "SET_ERROR", payload: "Insufficient points" });
        return false;
      }

      try {
        const response = await ScoringApiService.claimReward(
          nationalNumber,
          rewardId,
        );

        if (response.success && response.data) {
          // Update points after claiming reward
          const newAvailable =
            state.userScore.available_points - reward.points_cost;
          const newUsed = state.userScore.used_points + reward.points_cost;

          dispatch({
            type: "UPDATE_POINTS",
            payload: { available: newAvailable, used: newUsed },
          });

          return true;
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: response.error || "Failed to claim reward",
          });
          return false;
        }
      } catch (error) {
        console.error("Error claiming reward:", error);
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error ? error.message : "Failed to claim reward",
        });
        return false;
      }
    },
    [
      isAuthenticated,
      getUserNationalNumber,
      state.availableRewards,
      state.userScore,
    ],
  );

  // Check for new achievements
  const checkAchievements = useCallback(async (): Promise<void> => {
    const nationalNumber = getUserNationalNumber();
    if (!isAuthenticated || !nationalNumber) {
      return;
    }

    try {
      const response =
        await ScoringApiService.checkAchievements(nationalNumber);

      if (response.success && response.data) {
        // Add new achievements to the list
        response.data.forEach((achievement) => {
          const existingAchievement = state.achievements.find(
            (a) => a._id === achievement._id,
          );
          if (!existingAchievement) {
            dispatch({ type: "ADD_ACHIEVEMENT", payload: achievement });
          }
        });
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
      // Don't set error for this as it's a background operation
    }
  }, [isAuthenticated, getUserNationalNumber, state.achievements]);

  // Auto-refresh on authentication change
  useEffect(() => {
    const nationalNumber = getUserNationalNumber();
    if (isAuthenticated && nationalNumber && needsRefresh()) {
      refreshScore();
    } else if (!isAuthenticated) {
      dispatch({ type: "RESET_STATE" });
    }
  }, [isAuthenticated, getUserNationalNumber, needsRefresh, refreshScore]);

  // Auto-check achievements periodically
  useEffect(() => {
    const nationalNumber = getUserNationalNumber();
    if (!isAuthenticated || !nationalNumber) return;

    const intervalId = setInterval(
      () => {
        checkAchievements();
      },
      10 * 60 * 1000,
    ); // Check every 10 minutes

    return () => clearInterval(intervalId);
  }, [isAuthenticated, getUserNationalNumber, checkAchievements]);

  // Memoized context value
  const contextValue: ScoringContextType = {
    userScore: state.userScore,
    scoreStats: state.scoreStats,
    achievements: state.achievements,
    availableRewards: state.availableRewards,
    isLoading: state.isLoading,
    error: state.error,
    refreshScore,
    earnPoints,
    spendPoints,
    getScoreHistory,
    claimReward,
    checkAchievements,
  };

  return (
    <ScoringContext.Provider value={contextValue}>
      {children}
    </ScoringContext.Provider>
  );
};

// Custom hook to use scoring context
export const useScoring = (): ScoringContextType => {
  const context = useContext(ScoringContext);

  if (!context) {
    throw new Error("useScoring must be used within a ScoringProvider");
  }

  return context;
};

// Export context for direct access if needed
export { ScoringContext };
export default ScoringProvider;
