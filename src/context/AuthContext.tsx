/* eslint-disable */
// @ts-nocheck
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SESSION_DURATION_MS =
  parseFloat(process.env.NEXT_PUBLIC_SESSION_DURATION_MINUTES || "120") *
  60 *
  1000;

const IDLE_TIMEOUT_MS =
  parseFloat(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES || "30") *
  60 *
  1000;

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: number;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  open: boolean;
  screen: "login" | "signup" | "otp";
  setScreen: (screen: "login" | "signup" | "otp") => void;
  openAuth: (screen?: "login" | "signup") => void;
  closeAuth: () => void;
  loginUser: (user: User, token: string) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<"login" | "signup" | "otp">("login");
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

  const openAuth = (screenType: "login" | "signup" = "login") => {
    setScreen(screenType);
    setOpen(true);
  };

  const closeAuth = () => setOpen(false);

  const loginUser = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("roadshow_user", JSON.stringify(user));
    localStorage.setItem("roadshow_token", token);
    localStorage.setItem(
      "roadshow_session_expiry",
      String(Date.now() + SESSION_DURATION_MS)
    );
    setOpen(false);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("roadshow_user");
    localStorage.removeItem("roadshow_token");
    localStorage.removeItem("roadshow_session_expiry");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        open,
        screen,
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