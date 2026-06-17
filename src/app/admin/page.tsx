"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthNavbar from "@/src/components/AuthNavbar";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (user.funcao !== "admin") {
      router.push("/");
    }
  }, [router]);

  return (
    <>
      <AuthNavbar />

      <main>
        <h1>Bem-vindo Administrador</h1>
      </main>
    </>
  );
}