"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any;
  login: (userData: any, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔥 INIT SESSION
  useEffect(() => {
    console.log("🧠 AUTH INIT");

    const saved = localStorage.getItem("enginemoz_user");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log("👤 RESTORED USER:", parsed);
        setUser(parsed);
      } catch (e) {
        console.error("❌ INVALID USER STORAGE");
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  // 🔐 LOGIN (ONLY SOURCE OF TRUTH)
  const login = (userData: any, token: string) => {
    console.log("🔐 LOGIN IN CONTEXT");
    console.log("👤 user:", userData);
    console.log("🔑 token:", token);

    localStorage.setItem("enginemoz_token", token);
    localStorage.setItem("enginemoz_user", JSON.stringify(userData));

    setUser(userData);

    const role = userData?.funcao;

    const route =
      role === "admin"
        ? "/admin"
        : role === "caixa"
        ? "/caixa"
        : role === "gerente"
        ? "/gerente"
        :role === "cliente"
        ? "/"
        : "/";

    console.log("🚀 AUTO REDIRECT TO:", route);

    // 🔥 IMPORTANT FIX: delay ensures state propagation first
    setTimeout(() => {
      console.log("🧭 EXECUTING router.push:", route);

      router.replace(route); // 👈 IMPORTANT: replace > push (avoids stuck state)

      setTimeout(() => {
        console.log("📍 AFTER NAV:", window.location.pathname);
      }, 500);
    }, 50);
  };

  // 🚪 LOGOUT
  const logout = () => {
    console.log("🚪 LOGOUT");

    localStorage.clear();
    setUser(null);

    router.replace("/");
  };

  console.log("🔁 CONTEXT STATE:", { user, loading });

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used within AuthProvider");

  return ctx;
};