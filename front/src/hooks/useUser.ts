"use client";

import { useState, useEffect, useCallback } from "react";

interface UserDetails {
  name?: string;
  name_en?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  bio_en?: string;
}

interface User {
  _id: string;
  details: UserDetails;
  role: "USER" | "ADMIN" | "INSTRUCTOR";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserDetails>) => Promise<boolean>;
}

export const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = user !== null;

  // Fetch user data from API
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/getMe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      const data = await response.json();

      if (data.success && data.data) {
        setUser(data.data);
      } else if (response.status === 401) {
        // User not authenticated
        setUser(null);
        setError(null); // Don't treat this as an error
      } else {
        setUser(null);
        setError(data.error || "Failed to fetch user data");
      }
    } catch (err: any) {
      console.error("Error fetching user:", err);
      setUser(null);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user data
  const updateUser = useCallback(async (updates: Partial<UserDetails>): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch("/api/updateProfile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          set: updates,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local user state
        setUser(prev => prev ? {
          ...prev,
          details: { ...prev.details, ...updates },
          updated_at: new Date().toISOString(),
        } : null);
        return true;
      } else {
        setError(data.error || "Failed to update user");
        return false;
      }
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError("Network error occurred");
      return false;
    }
  }, [user]);

  // Logout user
  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Clear user state regardless of response
      setUser(null);
      setError(null);

      // Redirect to login page or home
      window.location.href = "/";
    } catch (err: any) {
      console.error("Error during logout:", err);
      // Still clear user state even if logout request fails
      setUser(null);
      setError(null);
    }
  }, []);

  // Refetch user data
  const refetch = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // Auto-fetch user on mount and when authentication state might change
  useEffect(() => {
    fetchUser();

    // Listen for storage events (for cross-tab logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user-logout") {
        setUser(null);
        setError(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchUser]);

  // Listen for authentication events from other parts of the app
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      if (event.detail?.type === "login") {
        fetchUser();
      } else if (event.detail?.type === "logout") {
        setUser(null);
        setError(null);
      }
    };

    window.addEventListener("auth-change" as any, handleAuthChange);

    return () => {
      window.removeEventListener("auth-change" as any, handleAuthChange);
    };
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    refetch,
    logout,
    updateUser,
  };
};

// Helper function to dispatch auth events
export const dispatchAuthEvent = (type: "login" | "logout", data?: any) => {
  const event = new CustomEvent("auth-change", {
    detail: { type, data },
  });
  window.dispatchEvent(event);
};

// Helper function for cross-tab logout
export const triggerCrossTabLogout = () => {
  localStorage.setItem("user-logout", Date.now().toString());
  localStorage.removeItem("user-logout");
};

// Default export for convenience
export default useUser;
