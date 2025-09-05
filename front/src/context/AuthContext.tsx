"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

type UserLevel = "Ghost" | "Manager" | "Editor" | "Normal" | null;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  nationalNumber?: string;
  phone?: string;
  role?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userLevel: UserLevel;
  user: AuthUser | null;
  isLoading: boolean;
  login: (
    token: string,
    level: UserLevel,
    nationalNumber: string,
    userData?: AuthUser,
  ) => void;
  logout: () => void;
  setInitialAuthState: (
    isAuth: boolean,
    level: UserLevel,
    userData?: AuthUser,
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userLevel, setUserLevel] = useState<UserLevel>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on initial load
    const token = Cookies.get("token");
    const userCookie = Cookies.get("user");

    if (token && userCookie) {
      try {
        // Handle different formats of the user cookie
        let level: UserLevel = null;

        // First try to parse as JSON
        try {
          const userData = JSON.parse(userCookie);
          level = userData.level || null;
        } catch (parseError) {
          // If it's not valid JSON, the server might have set it in a different format
          // Just use the default level
          console.warn(
            "Could not parse user cookie as JSON, using default level " +
              parseError,
          );
        }

        setIsAuthenticated(true);
        setUserLevel(level);
      } catch (error) {
        console.error("Error processing user cookie:", error);
        setIsAuthenticated(false);
        setUserLevel(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserLevel(null);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  const setInitialAuthState = (
    isAuth: boolean,
    level: UserLevel,
    userData?: AuthUser,
  ) => {
    setIsAuthenticated(isAuth);
    setUserLevel(level);
    setUser(userData || null);
  };

  const login = (token: string, level: UserLevel, nationalNumber: string) => {
    // Set cookies
    Cookies.set("token", token, { path: "/" });
    Cookies.set("national_number", nationalNumber, { path: "/" });
    Cookies.set("user", JSON.stringify({ level }), { path: "/" });

    // Update state
    setIsAuthenticated(true);
    setUserLevel(level);
  };

  const logout = () => {
    // Remove cookies
    Cookies.remove("token", { path: "/" });
    Cookies.remove("national_number", { path: "/" });
    Cookies.remove("user", { path: "/" });

    setIsAuthenticated(false);
    setUserLevel(null);
    setUser(null);

    // Redirect to home page
    router.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userLevel,
        user,
        isLoading,
        login,
        logout,
        setInitialAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
