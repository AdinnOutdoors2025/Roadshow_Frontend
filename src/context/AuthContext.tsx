/* eslint-disable */
// @ts-nocheck
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { mergeGuestCartInto } from "@/lib/roadshowCart";

const SESSION_DURATION_MS =
  parseFloat(process.env.NEXT_PUBLIC_SESSION_DURATION_MINUTES || "120") *
  60 *
  1000;

const IDLE_TIMEOUT_MS =
  parseFloat(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES || "30") *
  60 *
  1000;

/** Business snapshot copied from the GST record at signup — see src/lib/gst.ts */
interface ClientBusiness {
  gst_number: string;
  business_name: string;
  business_pan?: string;
  business_address?: string;
  business_entity_type?: string;
  business_registration_type?: string;
  business_registration_date?: string;
  business_department_code?: string;
  nature_of_business?: string;
  status?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: number;
  status: string;
  /** "agency" users are GST-verified and book on behalf of clients. */
  accountType?: "individual" | "agency";
  gstDetailId?: string;
  business?: ClientBusiness | null;
}

/**
 * Signup is a two-step funnel for agencies: pick the account type, then either
 * the plain form ("signup") or the GST-verified one ("signupAgency").
 */
type AuthScreen = "login" | "accountType" | "signup" | "signupAgency" | "otp";

interface AuthContextType {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  open: boolean;
  screen: AuthScreen;
  /** True when the signed-in customer is a verified agency. */
  isAgency: boolean;
  setScreen: (screen: AuthScreen) => void;
  openAuth: (screen?: AuthScreen) => void;
  closeAuth: () => void;
  loginUser: (user: User, token: string) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("roadshow_user");
    const storedToken = localStorage.getItem("roadshow_token");
    const storedExpiry = localStorage.getItem("roadshow_session_expiry");

    if (!storedUser || !storedToken || !storedExpiry) {
      setAuthLoading(false);
      return;
    }

    if (Date.now() > Number(storedExpiry)) {
      localStorage.removeItem("roadshow_user");
      localStorage.removeItem("roadshow_token");
      localStorage.removeItem("roadshow_session_expiry");
      toast.error("Your session has expired. Please login again.");
      setAuthLoading(false);
      return;
    }

    setUser(JSON.parse(storedUser));
    setToken(storedToken);
    setAuthLoading(false);
  }, []);

  /* Auto-logout after IDLE_TIMEOUT_MS of no mouse/keyboard/scroll activity */
  useEffect(() => {
    if (!user) return;

    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        logoutUser();
        toast.error("You've been logged out due to inactivity.");
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetIdleTimer)
    );

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
    };
  }, [user]);

  const openAuth = useCallback((screenType: AuthScreen = "login") => {
    setScreen(screenType);
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => setOpen(false), []);

  const loginUser = useCallback((user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("roadshow_user", JSON.stringify(user));
    localStorage.setItem("roadshow_token", token);
    localStorage.setItem(
      "roadshow_session_expiry",
      String(Date.now() + SESSION_DURATION_MS)
    );

    /* Vehicles picked before signing in follow the customer into their cart */
    mergeGuestCartInto(user?._id);

    setOpen(false);
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("roadshow_user");
    localStorage.removeItem("roadshow_token");
    localStorage.removeItem("roadshow_session_expiry");
    toast.success("You have been signed out successfully.");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        open,
        screen,
        isAgency: user?.accountType === "agency",
        setScreen,
        openAuth,
        closeAuth,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};