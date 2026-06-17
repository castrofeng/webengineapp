"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthNavbar from "@/src/components/AuthNavbar";

export default function CaixaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🧠 CAIXA PAGE CHECK");

    const saved = localStorage.getItem("enginemoz_user");

    console.log("💾 raw user:", saved);

    if (!saved) {
      console.log("❌ NO USER -> redirect /");
      router.replace("/");
      return;
    }

    const user = JSON.parse(saved);

    console.log("👤 parsed user:", user);

    if (user?.funcao !== "caixa") {
      console.log("🚫 WRONG ROLE -> redirect /");
      router.replace("/");
      return;
    }

    console.log("✅ AUTH OK -> CAIXA ACCESS GRANTED");

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        A validar sessão...
      </div>
    );
  }

  return (
    <>
      <AuthNavbar />

      <main>
        <h1>Bem-vindo Caixa</h1>
      </main>
    </>
  );
}