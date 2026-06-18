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
  const [progresso, setProgresso] = useState(0);
  const [mensagemProgresso, setMensagemProgresso] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tokenEmail, setTokenEmail] = useState("");

  // =========================
  // PROGRESSO SIMULADO
  // =========================
  const iniciarProgresso = (mensagens: string[]) => {
    setProgresso(0);
    setMensagemProgresso(mensagens[0]);

    let etapa = 0;
    const incremento = 90 / mensagens.length;

    const intervalo = setInterval(() => {
      etapa++;
      if (etapa < mensagens.length) {
        setMensagemProgresso(mensagens[etapa]);
        setProgresso(Math.round(incremento * (etapa + 1)));
      } else {
        clearInterval(intervalo);
      }
    }, 800);

    return intervalo;
  };

  const finalizarProgresso = (intervalo: ReturnType<typeof setInterval>) => {
    clearInterval(intervalo);
    setProgresso(100);
    setMensagemProgresso("Concluído!");
    setTimeout(() => {
      setProgresso(0);
      setMensagemProgresso("");
    }, 600);
  };

  // =========================
  // UI CONTROL
  // =========================
  const alternarAba = (aba: "login" | "registo") => {
    setAbaAtiva(aba);
    setPasso(1);
    setErro(null);
    setSucesso(null);
    setDebugToken(null);
    setProgresso(0);
    setMensagemProgresso("");
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
    const intervalo = iniciarProgresso([
      "A validar os dados...",
      "A criar a conta...",
      "A enviar o código de verificação...",
    ]);

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

      finalizarProgresso(intervalo);

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
      finalizarProgresso(intervalo);
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
    const intervalo = iniciarProgresso([
      "A verificar as credenciais...",
      "A autenticar...",
      "A carregar o perfil...",
    ]);

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

      finalizarProgresso(intervalo);
      login(data.user, data.token);

    } catch (err: any) {
      console.error("❌ LOGIN ERROR:", err.message);
      finalizarProgresso(intervalo);
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
    const intervalo = iniciarProgresso([
      "A validar o código...",
      "A ativar a conta...",
    ]);

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

      finalizarProgresso(intervalo);
      setSucesso("Conta ativada com sucesso!");
      setDebugToken(null);

      setTimeout(() => {
        setAbaAtiva("login");
        setPasso(1);
        setSucesso(null);
      }, 1500);
    } catch (err: any) {
      console.error("❌ VERIFY ERROR:", err.message);
      finalizarProgresso(intervalo);
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

        {/* Barra de progresso — visível durante loading */}
        {loading && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{mensagemProgresso}</span>
              <span>{progresso}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-slate-900 h-2 rounded-full transition-all duration-700"
                style={{ width: `${progresso}%` }}
              />
            </div>
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
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
              disabled={loading}
            />
            <div className="text-right text-sm">
              <button type="button" className="text-blue-600 hover:underline" disabled={loading}>
                Esqueceu a senha?
              </button>
            </div>
            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? mensagemProgresso || "A processar..." : "Entrar"}
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
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
              disabled={loading}
            />
            <input
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirmar Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
              disabled={loading}
            />
            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? mensagemProgresso || "A processar..." : "Seguinte"}
            </button>
            <div className="text-center text-sm mt-2">
              <button
                type="button"
                onClick={() => alternarAba("login")}
                className="text-blue-600 hover:underline"
                disabled={loading}
              >
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
              disabled={loading}
            />
            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? mensagemProgresso || "A processar..." : "Ativar conta"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}