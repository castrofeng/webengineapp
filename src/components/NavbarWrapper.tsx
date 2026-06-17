// components/NavbarWrapper.tsx
"use client";

import { useAuth } from "@/src/contexts/AuthContext";
import PublicNavbar from "./PublicNavbar";
import AuthNavbar from "./AuthNavbar";

export default function NavbarWrapper() {
  const { user, loading } = useAuth();

  if (loading) return null; // ou um skeleton/placeholder

  return user ? <AuthNavbar /> : <PublicNavbar />;
}