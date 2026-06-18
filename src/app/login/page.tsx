"use client";

import React, { useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { API_BASE_URL } from "@/src/api/api";

const API_AUTH_URL = `${API_BASE_URL}/auth`;

export default function AuthPage() {
  const { login } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<"login" | "registo">("login");
  const [passo, setPasso] = useState<1 | 2>(1);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tokenEmail, setTokenEmail] = useState("");

  const alternarAba = (aba: "login" | "registo") => {
    setAbaAtiva(aba);
    setPasso(1);
    setErro(null);
    setSucesso(null);
    setDebugToken(null);
  };

  // =========================
  // REGISTO (PASSO 1)
  // =========================
  const avancarParaToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErro(null);
    setDebugToken(null);

    if (password !== confirmPassword) {
      setErro("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);

    try {
      console.group("🟡 REGISTO");

      const payload = {
        nome,
        email,
        contacto: telefone,
        senha: password,
        confirmar_senha: confirmPassword,
      };

      console.log("Payload:", payload);

      const response = await fetch(`${API_AUTH_URL}/registar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Response:", data);
      console.groupEnd();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao registar.");
      }

      // Mostra o token no ecrã se o email não foi enviado
      if (data.debug_token) {
        setDebugToken(data.debug_token);
        setSucesso(
          data.email_enviado
            ? "Código enviado para o email."
            : "Email não disponível. Use o código abaixo para ativar a conta."
        );
      } else {
        setSucesso("Código enviado para o email.");
      }

      setPasso(2);
    } catch (err: any) {
      console.error("❌ REGISTO ERROR:", err.message);
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN (SÓ AUTH)
  // =========================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErro(null);

    try {
      console.group("🔐 LOGIN");

      const payload = {
        email,
        senha: password,
      };

      console.log("Request:", payload);

      const response = await fetch(`${API_AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Response:", data);
      console.log("User:", data.user);
      console.log("Role:", data.user?.funcao);
      console.log("Token:", data.token);

      console.groupEnd();

      if (!response.ok) {
        throw new Error(data.detail || "Login falhou.");
      }

      login(data.user, data.token);

    } catch (err: any) {
      console.error("❌ LOGIN ERROR:", err.message);
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY REGISTER
  // =========================
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErro(null);

    try {
      console.group("🟢 VERIFY");

      const payload = {
        email,
        token: tokenEmail,
      };

      console.log("Request:", payload);

      const response = await fetch(`${API_AUTH_URL}/verify-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Response:", data);
      console.groupEnd();

      if (!response.ok) {
        throw new Error(data.detail || "Código inválido.");
      }

      setSucesso("Conta ativada com sucesso!");
      setDebugToken(null);

      setTimeout(() => {
        setAbaAtiva("login");
        setPasso(1);
        setSucesso(null);
      }, 1500);
    } catch (err: any) {
      console.error("❌ VERIFY ERROR:", err.message);
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <button className="text-sm text-gray-500 mb-4 hover:underline">
          ← Voltar
        </button>

        <p className="text-gray-600 mb-6 text-sm">Insira os dados solicitados para continuar.</p>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => alternarAba("login")}
            className={`flex-1 p-2 rounded-lg font-bold ${abaAtiva === "login" ? "bg-white" : ""}`}
          >
            Login
          </button>
          <button
            onClick={() => alternarAba("registo")}
            className={`flex-1 p-2 rounded-lg font-bold ${abaAtiva === "registo" ? "bg-white" : ""}`}
          >
            Registo
          </button>
        </div>

        {erro && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-3 text-sm border border-green-200">
            <p className="font-bold">Sucesso!</p>
            <p>{sucesso}</p>
            <p className="mt-2 text-xs italic">
              Nota: Se não encontrar o código na sua caixa de entrada, verifique a pasta de <strong>SPAM</strong> ou Lixo Eletrónico.
            </p>
          </div>
        )}

        {/* Caixa do debug token — visível apenas quando email falha */}
        {debugToken && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded mb-3 text-sm">
            <p className="font-bold mb-1">⚠️ Modo de teste</p>
            <p>Use este código para ativar a conta:</p>
            <p className="text-2xl font-mono font-bold tracking-widest text-center mt-2">
              {debugToken}
            </p>
          </div>
        )}

        {/* LOGIN */}
        {abaAtiva === "login" ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
            <div className="text-right text-sm">
              <button type="button" className="text-blue-600 hover:underline">Esqueceu a senha?</button>
            </div>
            <button disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold">
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

        ) : passo === 1 ? (
          <form onSubmit={avancarParaToken} className="space-y-3">
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="password"
              placeholder="Confirmar Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
            <button disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold">
              {loading ? "A processar..." : "Seguinte"}
            </button>
            <div className="text-center text-sm mt-2">
              <button type="button" onClick={() => alternarAba("login")} className="text-blue-600 hover:underline">
                Já estou cadastrado
              </button>
            </div>
          </form>

        ) : (
          <form onSubmit={handleVerify} className="space-y-3">
            <input
              placeholder="Código de verificação"
              value={tokenEmail}
              onChange={(e) => setTokenEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
            <button disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold">
              {loading ? "A validar..." : "Ativar conta"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}