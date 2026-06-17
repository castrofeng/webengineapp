"use client";

import { useEffect, useMemo, useState } from "react";
import NavbarWrapper from "@/src/components/NavbarWrapper";

// 🔥 PDF
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { CotacaoPDF } from "@/src/components/pdf/cotacao";

// URL importada centralizadamente
import { API_BASE_URL } from "@/src/api/api";

export default function PainelGerente() {
  const [requisicoes, setRequisicoes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [section, setSection] = useState<
    "requisicoes" | "clientes" | "definicoes"
  >("requisicoes");

  const [tipoLista, setTipoLista] = useState<"pendentes" | "cotadas">(
    "pendentes"
  );

  // ===============================
  // FETCH
  // ===============================
  const fetchRequisicoes = async (tipo: "pendentes" | "cotadas") => {
    try {
      const token = localStorage.getItem("enginemoz_token");

      const url =
        tipo === "cotadas"
          ? `${API_BASE_URL}/requisicoes/cotadas`
          : `${API_BASE_URL}/requisicoes/pendentes`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setRequisicoes(data);
        setSelected(data.length > 0 ? data[0] : null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRequisicoes(tipoLista);
  }, [tipoLista]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return requisicoes.slice(start, start + pageSize);
  }, [requisicoes, page]);

  const totalPages = Math.max(1, Math.ceil(requisicoes.length / pageSize));

  const badgeColor = (estado: string) => {
    switch (estado) {
      case "pendente":
        return "bg-yellow-100 text-yellow-700";
      case "cotada":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const formatMoney = (value: any) => {
    const num =
      typeof value === "string"
        ? parseFloat(value.replace(",", "."))
        : Number(value);

    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  // ===============================
  // CHECK
  // ===============================
  const allItemsQuoted = (req: any) => {
    const itens = req?.itens ?? [];
    return itens.length > 0 && itens.every((i: any) => i.status_item === "cotado");
  };

  // ===============================
  // HELPER: build PDF doc
  // ===============================
  const buildPdfDoc = (req: any) => {
    const itens = req?.itens ?? [];

    const cliente = {
      nome: req?.nome_cliente ?? "",
      email: req?.email_cliente ?? "",
      contacto: req?.contacto_cliente ?? "",
    };

    const veiculo = {
      marca: req?.marca ?? "",
      modelo: req?.modelo ?? "",
      ano: req?.ano ?? "",
      vin: req?.vin ?? "",
    };

    const empresa = {
      nome: "EngineMoz",
      nuit: "123456789",
      contacto: "+258 84 000 000",
      email: "info@enginemoz.co.mz",
      localizacao: "Maputo, Mozambique",
    };

    const requisicaoPDF = {
      itens: itens.map((i: any) => ({
        nome_peca: i?.nome_peca ?? "N/D",
        quantidade: Number(i?.quantidade ?? 0),
        preco_unitario: Number(i?.preco_unitario ?? 0),
      })),
    };

    return (
      <CotacaoPDF
        cliente={cliente}
        veiculo={veiculo}
        empresa={empresa}
        requisicao={requisicaoPDF}
      />
    );
  };

  // ===============================
  // PDF DOWNLOAD
  // ===============================
  const gerarPDF = async () => {
    if (!selected) return;
    const blob = await pdf(buildPdfDoc(selected)).toBlob();
    saveAs(blob, `cotacao-${selected?.numero_requisicao ?? "doc"}.pdf`);
  };

  // ===============================
  // ENVIAR PDF POR EMAIL
  // ===============================
  const enviarCotacaoPorEmail = async () => {
    if (!selected) return;

    setSendingEmail(true);

    try {
      // 1. Gerar PDF em memória
      const blob = await pdf(buildPdfDoc(selected)).toBlob();

      // 2. Montar FormData
      const formData = new FormData();
      formData.append("pdf", blob, `cotacao-${selected.numero_requisicao}.pdf`);
      formData.append("email_cliente", selected.email_cliente ?? "");
      formData.append("nome_cliente", selected.nome_cliente ?? "");
      formData.append("numero_requisicao", selected.numero_requisicao ?? "");

      // 3. Enviar para o backend
      const token = localStorage.getItem("enginemoz_token");
      const res = await fetch(`${API_BASE_URL}/requisicoes/enviar-cotacao-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert(`✅ Cotação enviada para ${selected.email_cliente}`);
      } else {
        const err = await res.json();
        alert("Erro ao enviar: " + (err.detail ?? "Erro desconhecido"));
      }
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setSendingEmail(false);
    }
  };

  // ===============================
  // UPDATE PREÇO
  // ===============================
  const updatePreco = async (itemId: number, value: string) => {
    const token = localStorage.getItem("enginemoz_token");

    const num = parseFloat(value.replace(",", "."));
    if (isNaN(num)) return;

    await fetch(
      `${API_BASE_URL}/requisicoes/itens/${itemId}/preco`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preco_unitario: num,
          status_item: "cotado",
        }),
      }
    );

    setRequisicoes((prev) =>
      prev.map((r) => {
        if (r.id !== selected?.id) return r;
        return {
          ...r,
          itens: r.itens.map((i: any) =>
            i.id === itemId
              ? { ...i, preco_unitario: num, status_item: "cotado" }
              : i
          ),
        };
      })
    );

    setSelected((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        itens: prev.itens.map((i: any) =>
          i.id === itemId
            ? { ...i, preco_unitario: num, status_item: "cotado" }
            : i
        ),
      };
    });
  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <>
        <NavbarWrapper />
        <div className="p-3 text-xs">A carregar...</div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavbarWrapper />

      <div className="flex flex-1 pt-16 overflow-hidden">

        {/* SIDEBAR */}
        <aside
          className={`bg-white border-r transition-all duration-300 ${
            collapsed ? "w-14" : "w-56"
          } shrink-0 hidden md:block`}
        >
          <div className="p-2 flex justify-between border-b">
            {!collapsed && <div className="font-bold text-xs">EngineMoz</div>}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs border px-2 py-1 rounded"
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>

          <nav className="text-xs p-2 space-y-1">

            <button
              onClick={() => {
                setSection("requisicoes");
                setTipoLista("pendentes");
                setPage(1);
              }}
              className={`w-full text-left p-2 rounded ${
                tipoLista === "pendentes"
                  ? "bg-slate-100 font-medium"
                  : "hover:bg-slate-100"
              }`}
            >
              {collapsed ? "P" : "Pendentes"}
            </button>

            <button
              onClick={() => {
                setSection("requisicoes");
                setTipoLista("cotadas");
                setPage(1);
              }}
              className={`w-full text-left p-2 rounded ${
                tipoLista === "cotadas"
                  ? "bg-slate-100 font-medium"
                  : "hover:bg-slate-100"
              }`}
            >
              {collapsed ? "C" : "Cotadas"}
            </button>

            <hr className="my-2" />

            <button
              onClick={() => setSection("clientes")}
              className={`w-full text-left p-2 rounded ${
                section === "clientes"
                  ? "bg-slate-100 font-medium"
                  : "hover:bg-slate-100"
              }`}
            >
              {collapsed ? "CL" : "Clientes"}
            </button>

            <button
              onClick={() => setSection("definicoes")}
              className={`w-full text-left p-2 rounded ${
                section === "definicoes"
                  ? "bg-slate-100 font-medium"
                  : "hover:bg-slate-100"
              }`}
            >
              {collapsed ? "D" : "Definições"}
            </button>

          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">

          {section === "requisicoes" && (
            <>
              {/* CARDS */}
              <div className="space-y-2">

                <div className="flex gap-2 overflow-x-auto">
                  {paginated.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => setSelected(req)}
                      className={`min-w-[210px] bg-white border rounded-md p-2 text-left text-xs ${
                        selected?.id === req.id ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <div className="font-semibold truncate">
                        {req.numero_requisicao}
                      </div>

                      <div className="text-slate-600 truncate">
                        {req.nome_cliente}
                      </div>

                      <div className="text-[10px] font-mono">
                        VIN {req.vin}
                      </div>

                      <div className="text-[10px]">
                        {req.marca} {req.modelo}
                      </div>

                      <div className="mt-1">
                        <span className={`text-[10px] px-2 rounded ${badgeColor(req.estado)}`}>
                          {req.estado}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* PAGINAÇÃO */}
                <div className="flex justify-between text-[11px]">
                  <div>Página {page} / {totalPages}</div>

                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 border rounded">←</button>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 border rounded">→</button>
                  </div>
                </div>

              </div>

              {/* DETALHES */}
              {selected && (
                <div className="bg-white border rounded-md p-3 flex-1 overflow-auto">

                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm">
                        {selected.numero_requisicao}
                      </div>
                      <div className="text-xs text-slate-600">
                        {selected.nome_cliente}
                      </div>
                    </div>

                    <div className="text-right text-[11px]">
                      <div className="font-mono">{selected.vin}</div>
                      <div>{selected.marca} {selected.modelo}</div>
                    </div>
                  </div>

                  {/* ITENS */}
                  <div className="space-y-1">
                    {selected.itens?.map((item: any) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 text-[11px] border rounded p-2 items-center"
                      >
                        <div className="col-span-6 truncate">
                          {item.nome_peca}
                        </div>

                        <div className="col-span-2 text-center">
                          {item.quantidade}
                        </div>

                        <div className="col-span-2">
                          <input
                            type="text"
                            defaultValue={formatMoney(item.preco_unitario ?? 0)}
                            className="w-full border rounded px-1 py-[2px] text-right"
                            onBlur={(e) => updatePreco(item.id, e.target.value)}
                          />
                        </div>

                        <div className="col-span-2 text-center">
                          <span className="bg-slate-100 px-1 rounded text-[10px]">
                            {item.status_item}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── ACÇÕES ── */}
                  {allItemsQuoted(selected) && (
                    <div className="flex justify-end gap-2 mt-3">

                      {/* Download PDF */}
                      <button
                        onClick={gerarPDF}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors"
                      >
                        ⬇ Exportar PDF
                      </button>

                      {/* Enviar por Email */}
                      <button
                        onClick={enviarCotacaoPorEmail}
                        disabled={sendingEmail}
                        className={`flex items-center gap-1 px-3 py-1.5 text-white text-xs font-semibold rounded transition-colors ${
                          sendingEmail
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {sendingEmail ? "A enviar..." : "✉ Enviar por Email"}
                      </button>

                    </div>
                  )}

                </div>
              )}
            </>
          )}

          {section === "clientes" && (
            <div className="bg-white border rounded-md p-4 text-xs">
              👤 Clientes — módulo em desenvolvimento
            </div>
          )}

          {section === "definicoes" && (
            <div className="bg-white border rounded-md p-4 text-xs">
              ⚙️ Definições — módulo em desenvolvimento
            </div>
          )}

        </main>
      </div>
    </div>
  );
}