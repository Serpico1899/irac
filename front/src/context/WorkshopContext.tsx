"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { workshopApi } from "@/services/workshop/workshopApi";
import type {
  WorkshopContextType,
  Workshop,
  WorkshopSchedule,
  WorkshopReservation,
  WorkshopAvailability,
  CreateReservationRequest,
  UpdateReservationRequest,
  CancelReservationRequest,
  WorkshopQuery,
  WorkshopListResponse,
  ReservationQuery,
  ReservationHistoryResponse,
  AvailabilityQuery,
} from "@/types";

// State interface
interface WorkshopState {
  workshops: Workshop[];
  myReservations: WorkshopReservation[];
  availability: WorkshopAvailability[];
  isLoading: boolean;
  error: string | null;
}

// Action types
type WorkshopAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_WORKSHOPS"; payload: Workshop[] }
  | { type: "SET_MY_RESERVATIONS"; payload: WorkshopReservation[] }
  | { type: "SET_AVAILABILITY"; payload: WorkshopAvailability[] }
  | { type: "UPDATE_WORKSHOP"; payload: Workshop }
  | { type: "ADD_RESERVATION"; payload: WorkshopReservation }
  | { type: "UPDATE_RESERVATION"; payload: WorkshopReservation }
  | { type: "REMOVE_RESERVATION"; payload: string }
  | { type: "RESET_STATE" };

// Initial state
const initialState: WorkshopState = {
  workshops: [],
  myReservations: [],
  availability: [],
  isLoading: false,
  error: null,
};

// Reducer
const workshopReducer = (
  state: WorkshopState,
  action: WorkshopAction,
): WorkshopState => {
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

    case "SET_WORKSHOPS":
      return {
        ...state,
        workshops: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_MY_RESERVATIONS":
      return {
        ...state,
        myReservations: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_AVAILABILITY":
      return {
        ...state,
        availability: action.payload,
        isLoading: false,
        error: null,
      };

    case "UPDATE_WORKSHOP":
      return {
        ...state,
        workshops: state.workshops.map((workshop) =>
          workshop._id === action.payload._id ? action.payload : workshop,
        ),
      };

    case "ADD_RESERVATION":
      return {
        ...state,
        myReservations: [action.payload, ...state.myReservations],
      };

    case "UPDATE_RESERVATION":
      return {
        ...state,
        myReservations: state.myReservations.map((reservation) =>
          reservation._id === action.payload._id ? action.payload : reservation,
        ),
      };

    case "REMOVE_RESERVATION":
      return {
        ...state,
        myReservations: state.myReservations.filter(
          (reservation) => reservation._id !== action.payload,
        ),
      };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
};

// Context
const WorkshopContext = createContext<WorkshopContextType | null>(null);

// Provider component
interface WorkshopProviderProps {
  children: React.ReactNode;
}

export const WorkshopProvider: React.FC<WorkshopProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(workshopReducer, initialState);

  // Helper function to handle API errors
  const handleApiError = useCallback(
    (error: string, fallbackMessage: string) => {
      const errorMessage = error || fallbackMessage;
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      console.error("Workshop API Error:", errorMessage);
    },
    [],
  );

  // Get current user ID (in real app, this would come from auth context)
  const getCurrentUserId = useCallback(() => {
    // TODO: Get from AuthContext
    return "user_1";
  }, []);

  // Get workshops
  const getWorkshops = useCallback(
    async (query?: WorkshopQuery): Promise<WorkshopListResponse | null> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await workshopApi.getWorkshops(query);

        if (response.success && response.data) {
          dispatch({ type: "SET_WORKSHOPS", payload: response.data.workshops });
          return response.data;
        } else {
          handleApiError(response.error || "", "Failed to get workshops");
          return null;
        }
      } catch (error) {
        handleApiError("", "Failed to get workshops");
        return null;
      }
    },
    [handleApiError],
  );

  // Get single workshop
  const getWorkshop = useCallback(
    async (id: string): Promise<Workshop | null> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await workshopApi.getWorkshop(id);

        if (response.success && response.data) {
          dispatch({ type: "UPDATE_WORKSHOP", payload: response.data });
          dispatch({ type: "SET_LOADING", payload: false });
          return response.data;
        } else {
          handleApiError(
            response.error || "",
            "Failed to get workshop details",
          );
          return null;
        }
      } catch (error) {
        handleApiError("", "Failed to get workshop details");
        return null;
      }
    },
    [handleApiError],
  );

  // Get workshop by slug
  const getWorkshopBySlug = useCallback(
    async (slug: string): Promise<Workshop | null> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        // Find workshop by slug in existing workshops first
        const existingWorkshop = state.workshops.find((w) => w.slug === slug);
        if (existingWorkshop) {
          dispatch({ type: "SET_LOADING", payload: false });
          return existingWorkshop;
        }

        // If not found locally, fetch from API
        const response = await workshopApi.getWorkshopBySlug(slug);

        if (response.success && response.data) {
          dispatch({ type: "UPDATE_WORKSHOP", payload: response.data });
          dispatch({ type: "SET_LOADING", payload: false });
          return response.data;
        } else {
          handleApiError(
            response.error || "",
            "Failed to get workshop details",
          );
          return null;
        }
      } catch (error) {
        handleApiError("", "Failed to get workshop details");
        return null;
      }
    },
    [handleApiError, state.workshops],
  );

  // Get workshop schedules
  const getWorkshopSchedules = useCallback(
    async (
      workshopId: string,
      dateFrom?: string,
      dateTo?: string,
    ): Promise<WorkshopSchedule[]> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await workshopApi.getWorkshopSchedules(
          workshopId,
          dateFrom,
          dateTo,
        );

        if (response.success && response.data) {
          dispatch({ type: "SET_LOADING", payload: false });
          return response.data;
        } else {
          handleApiError(response.error || "", "Failed to get schedules");
          return [];
        }
      } catch (error) {
        handleApiError("", "Failed to get schedules");
        return [];
      }
    },
    [handleApiError],
  );

  // Get availability
  const getAvailability = useCallback(
    async (query: AvailabilityQuery): Promise<WorkshopAvailability[]> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await workshopApi.getAvailability(query);

        if (response.success && response.data) {
          dispatch({ type: "SET_AVAILABILITY", payload: response.data });
          return response.data;
        } else {
          handleApiError(response.error || "", "Failed to get availability");
          return [];
        }
      } catch (error) {
        handleApiError("", "Failed to get availability");
        return [];
      }
    },
    [handleApiError],
  );

  // Create reservation
  const createReservation = useCallback(
    async (request: CreateReservationRequest): Promise<string | null> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await workshopApi.createReservation(request);

        if (response.success && response.data) {
          // Refresh my reservations to include the new one
          const userId = getCurrentUserId();
          const reservationsResponse =
            await workshopApi.getMyReservations(userId);

          if (reservationsResponse.success && reservationsResponse.data) {
            dispatch({
              type: "SET_MY_RESERVATIONS",
              payload: reservationsResponse.data.reservations,
            });
          }

          dispatch({ type: "SET_LOADING", payload: false });
          return response.data.reservation_id;
        } else {
          handleApiError(response.error || "", "Failed to create reservation");
          return null;
        }
      } catch (error) {
        handleApiError("", "Failed to create reservation");
        return null;
      }
    },
    [getCurrentUserId, handleApiError],
  );

  // Update reservation
  const updateReservation = useCallback(
    async (
      reservationId: string,
      request: UpdateReservationRequest,
    ): Promise<boolean> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await workshopApi.updateReservation(
          reservationId,
          request,
        );

        if (response.success) {
          // Refresh reservations to get updated data
          const userId = getCurrentUserId();
          const reservationsResponse =
            await workshopApi.getMyReservations(userId);

          if (reservationsResponse.success && reservationsResponse.data) {
            dispatch({
              type: "SET_MY_RESERVATIONS",
              payload: reservationsResponse.data.reservations,
            });
          }

          dispatch({ type: "SET_LOADING", payload: false });
          return true;
        } else {
          handleApiError(response.error || "", "Failed to update reservation");
          return false;
        }
      } catch (error) {
        handleApiError("", "Failed to update reservation");
        return false;
      }
    },
    [getCurrentUserId, handleApiError],
  );

  // Cancel reservation
  const cancelReservation = useCallback(
    async (
      reservationId: string,
      request?: CancelReservationRequest,
    ): Promise<boolean> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await workshopApi.cancelReservation(
          reservationId,
          request,
        );

        if (response.success) {
          // Refresh reservations to get updated data
          const userId = getCurrentUserId();
          const reservationsResponse =
            await workshopApi.getMyReservations(userId);

          if (reservationsResponse.success && reservationsResponse.data) {
            dispatch({
              type: "SET_MY_RESERVATIONS",
              payload: reservationsResponse.data.reservations,
            });
          }

          dispatch({ type: "SET_LOADING", payload: false });
          return true;
        } else {
          handleApiError(response.error || "", "Failed to cancel reservation");
          return false;
        }
      } catch (error) {
        handleApiError("", "Failed to cancel reservation");
        return false;
      }
    },
    [getCurrentUserId, handleApiError],
  );

  // Get my reservations
  const getMyReservations = useCallback(
    async (
      query?: ReservationQuery,
    ): Promise<ReservationHistoryResponse | null> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const userId = getCurrentUserId();
        const response = await workshopApi.getMyReservations(userId, query);

        if (response.success && response.data) {
          dispatch({
            type: "SET_MY_RESERVATIONS",
            payload: response.data.reservations,
          });
          return response.data;
        } else {
          handleApiError(response.error || "", "Failed to get reservations");
          return null;
        }
      } catch (error) {
        handleApiError("", "Failed to get reservations");
        return null;
      }
    },
    [getCurrentUserId, handleApiError],
  );

  // Check in reservation
  const checkInReservation = useCallback(
    async (reservationId: string): Promise<boolean> => {
      try {
        const response = await workshopApi.checkInReservation(reservationId);

        if (response.success) {
          // Update the specific reservation in state
          const updatedReservations = state.myReservations.map(
            (reservation) => {
              if (reservation._id === reservationId) {
                return {
                  ...reservation,
                  check_in_time: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
              }
              return reservation;
            },
          );

          dispatch({
            type: "SET_MY_RESERVATIONS",
            payload: updatedReservations,
          });

          return true;
        } else {
          handleApiError(response.error || "", "Failed to check in");
          return false;
        }
      } catch (error) {
        handleApiError("", "Failed to check in");
        return false;
      }
    },
    [state.myReservations, handleApiError],
  );

  // Submit feedback
  const submitFeedback = useCallback(
    async (
      reservationId: string,
      rating: number,
      comment?: string,
    ): Promise<boolean> => {
      try {
        const response = await workshopApi.submitFeedback(
          reservationId,
          rating,
          comment,
        );

        if (response.success) {
          // Update the specific reservation in state
          const updatedReservations = state.myReservations.map(
            (reservation) => {
              if (reservation._id === reservationId) {
                return {
                  ...reservation,
                  feedback: {
                    rating,
                    comment,
                    submitted_at: new Date().toISOString(),
                  },
                  updated_at: new Date().toISOString(),
                };
              }
              return reservation;
            },
          );

          dispatch({
            type: "SET_MY_RESERVATIONS",
            payload: updatedReservations,
          });

          return true;
        } else {
          handleApiError(response.error || "", "Failed to submit feedback");
          return false;
        }
      } catch (error) {
        handleApiError("", "Failed to submit feedback");
        return false;
      }
    },
    [state.myReservations, handleApiError],
  );

  // Refresh all data
  const refreshData = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // Load workshops
      const workshopsResponse = await workshopApi.getWorkshops({ limit: 20 });
      if (workshopsResponse.success && workshopsResponse.data) {
        dispatch({
          type: "SET_WORKSHOPS",
          payload: workshopsResponse.data.workshops,
        });
      }

      // Load my reservations
      const userId = getCurrentUserId();
      const reservationsResponse = await workshopApi.getMyReservations(userId);
      if (reservationsResponse.success && reservationsResponse.data) {
        dispatch({
          type: "SET_MY_RESERVATIONS",
          payload: reservationsResponse.data.reservations,
        });
      }

      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      handleApiError("", "Failed to refresh data");
    }
  }, [getCurrentUserId, handleApiError]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await refreshData();
    };

    initializeData();
  }, [refreshData]);

  // Context value
  const contextValue: WorkshopContextType = {
    workshops: state.workshops,
    myReservations: state.myReservations,
    availability: state.availability,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    getWorkshops,
    getWorkshop,
    getWorkshopBySlug,
    getWorkshopSchedules,
    getAvailability,
    createReservation,
    updateReservation,
    cancelReservation,
    getMyReservations,
    checkInReservation,
    submitFeedback,
    refreshData,
  };

  return (
    <WorkshopContext.Provider value={contextValue}>
      {children}
    </WorkshopContext.Provider>
  );
};

// Hook to use workshop context
export const useWorkshop = (): WorkshopContextType => {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error("useWorkshop must be used within a WorkshopProvider");
  }
  return context;
};

// Export context for testing
export { WorkshopContext };
