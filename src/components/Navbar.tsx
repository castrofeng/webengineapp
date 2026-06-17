"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLogged, setIsLogged] = useState(false);
  const [funcao, setFuncao] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      const parsed = JSON.parse(user);

      setFuncao(parsed.funcao);
      setIsLogged(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLogged(false);

    router.push("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "#1e293b",
        color: "white",
      }}
    >
      <h2>Sistema</h2>

      {!isLogged ? (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <Link href="/">Sobre Nós</Link>

          <Link href="/quem-somos">
            Quem Somos
          </Link>

          <Link href="/servicos">
            Serviços
          </Link>

          <button
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <Link href="/perfil">Perfil</Link>

          <Link href="/historico">
            Histórico
          </Link>

          <span>
            Logado como: {funcao}
          </span>

          <button onClick={handleLogout}>
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}