"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  role: string;
  children: React.ReactNode;
}

export default function ProtectedRoute({
  role,
  children,
}: Props) {

  const router = useRouter();

  useEffect(() => {

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (user.funcao !== role) {
      router.push("/");
    }

  }, []);

  return <>{children}</>;
}