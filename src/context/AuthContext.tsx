/* eslint-disable */
// @ts-nocheck
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

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
    setOpen(false);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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