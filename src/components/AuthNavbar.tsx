"use client";

import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  LayoutDashboard,
  History,
  User,
  LogOut,
} from "lucide-react";

export default function AuthNavbar() {
  const { user, logout, loading } = useAuth();

  // 🔥 fallback seguro
  const role = user?.funcao;

  const baseRoute =
    role === "admin"
      ? "/admin"
      : role === "caixa"
      ? "/caixa"
      : role === "gerente"
      ? "/gerente"
      : "/cliente";

  if (loading) {
    return (
      <nav className="fixed w-full z-50 bg-white border-b h-16 flex items-center px-6">
        <span className="text-sm text-slate-500">A carregar sessão...</span>
      </nav>
    );
  }

  return (
    <nav className="fixed w-full z-50 bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between">
      
      {/* LOGO */}
      <div className="font-black text-slate-900 tracking-widest text-lg">
        ENGINE<span className="text-orange-500">MOZ</span>
      </div>

      {/* MENU */}
      <div className="flex items-center gap-6">

        <div className="flex items-center gap-6 text-sm font-semibold text-slate-600">

          <Link
            href={baseRoute}
            className="flex items-center gap-2 hover:text-orange-600"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href={`${baseRoute}/historico`}
            className="flex items-center gap-2 hover:text-orange-600"
          >
            <History className="h-4 w-4" />
            Histórico
          </Link>

          <Link
            href={`${baseRoute}/perfil`}
            className="flex items-center gap-2 hover:text-orange-600"
          >
            <User className="h-4 w-4" />
            Perfil
          </Link>

        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* USER INFO (opcional mas útil) */}
        <div className="text-xs text-slate-500 hidden md:block">
          {user?.email}
        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>

      </div>
    </nav>
  );
}