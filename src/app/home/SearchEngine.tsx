"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { ModalRequisicao } from '@/src/components/components/ModalRequisicao';
import { CatalogoVisual } from '@/src/components/components/CatalogoVisual';
import { MotorInfo, VeiculoJDM } from '@/src/components/types/engine';
import { s } from '../../components/styles/searchEngine';

// Importação das tuas URLs a partir do ficheiro centralizado
import { API_BASE_URL } from '@/src/api/api';

// Configuração local dos sufixos para bater certinho com as tuas rotas de backend
const API_ENGINE_URL = `${API_BASE_URL}/engine`;
const API_CATALOGO_URL = `${API_BASE_URL}/catalogo`;

const ROLES_PERMITIDOS = ['cliente', 'caixa', 'admin', 'gerente'];

interface AcessorioSolicitado {
  nome: string;
  quantidade: number;
}

interface PecaCatalogo {
  id: number;
  nome: string;
  categoria: string;
  sub_categoria?: string;
  status_ativo: boolean;
}

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [vinInput, setVinInput] = useState('');
  const [motorDados, setMotorDados] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [manualChassis, setManualChassis] = useState('');
  const [manualMarca, setManualMarca] = useState('');
  const [manualModelo, setManualModelo] = useState('');
  const [manualAno, setManualAno] = useState('');

  const [modalRequisicaoAberto, setModalRequisicaoAberto] = useState(false);
  const [itensSolicitados, setItensSolicitados] = useState<AcessorioSolicitado[]>([]);

  // Estado dinâmico para carregar as peças vindas da Base de Dados
  const [pecasBD, setPecasBD] = useState<string[]>([]);
  const [pecaTexto, setPecaTexto] = useState('');
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [sugestaoFoco, setSugestaoFoco] = useState(-1);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const [exibirAjudaVin, setExibirAjudaVin] = useState(false);
  const [avisoAuth, setAvisoAuth] = useState(false);

  const dadosEmpresa = {
    nome: "EngineMoz Limitada",
    nuit: "400555666",
    email: "geral@enginemoz.co.mz",
    contacto: "+258 84 123 4567 / +258 82 987 6543",
    localizacao: "Av. Moçambique, n° 4500, Bairro do Jardim, Maputo, Moçambique"
  };

  // 1. Efeito para carregar as peças do Banco de Dados ao montar o componente
  useEffect(() => {
    const buscarPecasDoCatalogo = async () => {
      try {
        const response = await fetch(`${API_CATALOGO_URL}/`);
        if (response.ok) {
          const dados: PecaCatalogo[] = await response.json();
          // Mapeia apenas o campo 'nome' das peças ativas recebidas
          const nomesPecas = dados.map(p => p.nome);
          setPecasBD(nomesPecas);
        }
      } catch (err) {
        console.error("Erro ao carregar o catálogo de peças:", err);
      }
    };

    buscarPecasDoCatalogo();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setMostrarSugestoes(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Função auxiliar para remover acentuações e caracteres especiais para busca justa
  const removerAcentos = (texto: string) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // ─── Autocomplete Melhores (Sem acentuações e dinâmico) ─────────────────────

  const handlePecaTextoChange = (value: string) => {
    setPecaTexto(value);
    setSugestaoFoco(-1);
    
    if (value.trim().length === 0) {
      setSugestoes([]);
      setMostrarSugestoes(false);
      return;
    }
    
    // Tratamento sem acentos
    const termoNormalizado = removerAcentos(value);
    
    const filtradas = pecasBD.filter(p =>
      removerAcentos(p).includes(termoNormalizado)
    ).slice(0, 8);
    
    setSugestoes(filtradas);
    setMostrarSugestoes(filtradas.length > 0);
  };

  const handlePecaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarSugestoes) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSugestaoFoco(prev => Math.min(prev + 1, Array.from(sugestoes).length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSugestaoFoco(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sugestaoFoco >= 0) {
        selecionarSugestao(sugestoes[sugestaoFoco]);
      } else if (pecaTexto.trim()) {
        adicionarAcessorio(pecaTexto.trim());
      }
    } else if (e.key === 'Escape') {
      setMostrarSugestoes(false);
    }
  };

  const selecionarSugestao = (nome: string) => {
    setPecaTexto(nome);
    setMostrarSugestoes(false);
    setSugestoes([]);
    setSugestaoFoco(-1);
  };

  const adicionarAcessorio = (nome?: string) => {
    const nomeFinal = nome || pecaTexto.trim();
    if (!nomeFinal) return;
    const itemExistente = itensSolicitados.find(item => item.nome === nomeFinal);
    if (itemExistente) {
      setItensSolicitados(itensSolicitados.map(item =>
        item.nome === nomeFinal
          ? { ...item, ...{ quantidade: item.quantidade + quantidadeSelecionada } }
          : item
      ));
    } else {
      setItensSolicitados([...itensSolicitados, { nome: nomeFinal, quantidade: quantidadeSelecionada }]);
    }
    setPecaTexto('');
    setQuantidadeSelecionada(1);
    setSugestoes([]);
    setMostrarSugestoes(false);
  };

  const removerAcessorio = (nomeItem: string) => {
    setItensSolicitados(itensSolicitados.filter(item => item.nome !== nomeItem));
  };

  // ─── API ───────────────────────────────────────────────────────────────────

  const handlePesquisaVin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVin = vinInput.trim().toUpperCase();
    if (!cleanVin) return;

    setLoading(true); setErro(null); setMotorDados(null);
    setManualChassis(cleanVin);

    try {
      const responseNhtsa = await fetch(`${API_ENGINE_URL}/${cleanVin}`);
      if (!responseNhtsa.ok) throw new Error("Falha na API inicial.");
      const dataNhtsa = await responseNhtsa.json();
      if (!dataNhtsa.marca && !dataNhtsa.Make) throw new Error("Dados vazios.");
      setMotorDados({ ...dataNhtsa, ...{ inseridoPeloCliente: false } });
    } catch (err) {
      try {
        const responseJdm = await fetch(`${API_ENGINE_URL}/jdm/${cleanVin}`);
        if (!responseJdm.ok) throw new Error("Nenhum veículo localizado.");
        const dataJdm = await responseJdm.json();
        setMotorDados({ ...dataJdm, ...{ inseridoPeloCliente: false } });
      } catch (fallbackErr: any) {
        setErro("Registo de chassi não localizado nas bases de dados automáticas.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvancarFormularioManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMarca || !manualModelo) {
      alert("Por favor, introduza pelo menos a Marca e o Modelo do veículo.");
      return;
    }
    setMotorDados({
      marca: manualMarca,
      modelo: manualModelo,
      ano: manualAno,
      vin: manualChassis,
      multiplos_registros: false,
      inseridoPeloCliente: true
    });
    setErro(null);
  };

  const selecionarCarroMultiploJdm = (carro: VeiculoJDM) => {
    setMotorDados({
      marca: carro.marca, modelo: carro.modelo, ano: carro.ano,
      cilindrada: carro.cilindrada, tecnologia: carro.tecnologia,
      combustivel: carro.combustivel, multiplos_registros: false,
      inseridoPeloCliente: false
    });
  };

  // ─── AUTH GUARD ────────────────────────────────────────────────────────────

  const handleAbrirModal = () => {
    if (authLoading) return;

    // Bloqueia caso o cliente clique sem ter peças na lista (Garantia Extra)
    if (itensSolicitados.length === 0) return;

    if (!user) {
      setAvisoAuth(true);
      setTimeout(() => router.push('/login'), 1800);
      return;
    }

    if (!ROLES_PERMITIDOS.includes(user.funcao)) {
      setAvisoAuth(true);
      return;
    }

    setAvisoAuth(false);
    setModalRequisicaoAberto(true);
  };

  return (
    <div style={s.page}>

      {/* BANNER */}
      <div style={s.banner}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <span style={s.badge}>SISTEMA DE COTAÇÃO AUTOMÁTICA</span>
          <h1 style={s.h1}>Peça a sua Cotação de Motores</h1>
          <p style={s.subtitle}>
            Insira o número do chassi (VIN) do veículo para efectuar uma busca directa nos manifestos alfandegários e catálogos internacionais.
          </p>
        </div>
      </div>

      {/* MAIN */}
      <main style={s.main}>
        <div style={s.card}>

          {/* PESQUISA VIN */}
          <form onSubmit={handlePesquisaVin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <label style={s.fieldLabel}>Número do VIN / Chassi (17 caracteres)</label>
              <div style={s.inputRow}>
                <input
                  type="text"
                  value={vinInput}
                  onChange={(e) => setVinInput(e.target.value)}
                  placeholder="EX: JTDKB20UXXXXXXXXX"
                  style={s.vinInput}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...s.searchBtn, ...{ cursor: loading ? 'not-allowed' : 'pointer' } }}
                >
                  {loading ? '⏳' : '🔍'}
                </button>
              </div>
              <button type="button" onClick={() => setExibirAjudaVin(!exibirAjudaVin)} style={s.helpLink}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#eff6ff', fontSize: '10px', fontWeight: 700 }}>?</span>
                Como localizar o número do VIN / Chassi?
              </button>
            </div>
          </form>

          {/* AJUDA VIN */}
          {exibirAjudaVin && (
            <div style={s.helpPanel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '13px' }}>📍 Onde encontrar o número do VIN / Chassi:</strong>
                <button type="button" onClick={() => setExibirAjudaVin(false)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
              </div>
              <div style={s.helpGrid}>
                <div style={s.helpBlock}>
                  <span style={{ ...s.helpBlockTitle, ...{ color: '#2563eb' } }}>📄 No Livrete / Documentação</span>
                  <p style={{ fontSize: '12.5px', color: '#475569', marginBottom: '8px', lineHeight: 1.5 }}>No documento físico do veículo, o VIN tem 17 caracteres:</p>
                  <div style={s.mono}>
                    <strong>Livrete (INATRO):</strong> Campo "N° do Quadro"<br />
                    <strong>Título de Propriedade:</strong> Linha "N° de Quadro"<br />
                    <strong>Nota de Desalfandegamento:</strong> Campo "Chassis/VIN"
                  </div>
                </div>
                <div style={s.helpBlock}>
                  <span style={{ ...s.helpBlockTitle, ...{ color: '#16a34a' } }}>🚗 No Próprio Veículo</span>
                  <ul style={{ paddingLeft: '16px', fontSize: '12.5px', color: '#475569', lineHeight: '1.6' }}>
                    <li><strong>Para-brisas:</strong> Canto inferior esquerdo (visível pelo exterior).</li>
                    <li><strong>Porta do Condutor:</strong> Etiqueta na coluna da porta.</li>
                    <li><strong>Compartimento do Motor:</strong> Gravado na parede de fogo.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div style={s.loading}>
              🔄 A consultar bases aduaneiras e stock local...
            </div>
          )}

          {/* FORMULÁRIO MANUAL */}
          {erro && (
            <div style={{ marginTop: '16px' }}>
              <div style={s.errorBanner}>⚠️ {erro} Por favor, preencha os dados abaixo para continuar.</div>
              <form onSubmit={handleAvancarFormularioManual} style={s.manualForm}>
                <div style={s.manualGrid}>
                  <div style={s.mField}>
                    <label style={s.mLabel}>N° de Chassis (VIN)</label>
                    <input type="text" value={manualChassis} onChange={(e) => setManualChassis(e.target.value.toUpperCase())} placeholder="Ex: JTDKB20U..." style={s.mInput} />
                  </div>
                  <div style={s.mField}>
                    <label style={s.mLabel}>Marca *</label>
                    <input type="text" required value={manualMarca} onChange={(e) => setManualMarca(e.target.value)} placeholder="Ex: Toyota" style={s.mInput} />
                  </div>
                  <div style={s.mField}>
                    <label style={s.mLabel}>Modelo *</label>
                    <input type="text" required value={manualModelo} onChange={(e) => setManualModelo(e.target.value)} placeholder="Ex: Hilux" style={s.mInput} />
                  </div>
                  <div style={s.mField}>
                    <label style={s.mLabel}>Ano de Fabrico</label>
                    <input type="text" value={manualAno} onChange={(e) => setManualAno(e.target.value)} placeholder="Ex: 2018" style={s.mInput} />
                  </div>
                </div>
                <div style={s.manualFooter}>
                  <span style={s.manualNote}>ℹ️ <strong>Nota:</strong> Esta ficha será registada como <em>"Introduzida manualmente pelo cliente"</em>.</span>
                  <button type="submit" style={s.btnAdvance}>Avançar para a Cotação →</button>
                </div>
              </form>
            </div>
          )}

          {/* MÚLTIPLOS REGISTOS JDM */}
          {motorDados && motorDados.multiplos_registros && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '20px', textAlign: 'left' }}>
              <h4 style={s.multipleTitle}>⚠️ Múltiplas Configurações Encontradas</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {motorDados.veiculos?.map((carro: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => selecionarCarroMultiploJdm(carro)}
                    style={s.multipleItem}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <div>
                      <strong style={{ color: '#1e3a8a', fontSize: '14px' }}>{carro.marca} {carro.modelo}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>Ano: {carro.ano} | Tecnologia: {carro.tecnologia}</div>
                    </div>
                    <button style={s.multipleItemBtn}>Selecionar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULTADOS */}
          {motorDados && !motorDados.multiplos_registros && !loading && (
            <div style={{ textAlign: 'left' }}>
              <div style={s.divider} />

              <div style={s.fichaTitleRow}>
                <h3 style={s.fichaTitle}>
                  <span>{motorDados.inseridoPeloCliente ? '📝' : '✨'}</span>
                  {motorDados.inseridoPeloCliente ? 'Dados do Veículo (Introdução Manual)' : 'Ficha Técnica do Veículo Localizada'}
                </h3>
                {motorDados.inseridoPeloCliente && (
                  <span style={s.manualBadge}>✍️ Especificação do Cliente</span>
                )}
              </div>

              <div style={s.fichaGrid}>
                <div style={s.fichaCell}>
                  <small style={{ color: '#64748b', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marca / Construtor</small>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 700, fontSize: '15px' }}>{motorDados.marca || motorDados.Make || 'N/A'}</p>
                </div>
                <div style={s.fichaCell}>
                  <small style={{ color: '#64748b', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modelo Comercial</small>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 700, fontSize: '15px' }}>{motorDados.modelo || motorDados.Model || 'N/A'}</p>
                </div>
                <div style={s.fichaCell}>
                  <small style={{ color: '#64748b', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ano de Fabricação</small>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 700, fontSize: '15px' }}>{motorDados.ano || motorDados.ModelYear || 'N/A'}</p>
                </div>
              </div>

              {/* CONFIGURADOR DE PEÇAS */}
              <div style={s.configBox}>
                <p style={s.configTitle}>🔧 Peças / Componentes a Cotar</p>

                <div style={s.addRow} ref={autocompleteRef}>
                  <div style={s.autocompleteWrap}>
                    <input
                      type="text"
                      value={pecaTexto}
                      onChange={(e) => handlePecaTextoChange(e.target.value)}
                      onKeyDown={handlePecaKeyDown}
                      onFocus={() => {
                        if (sugestoes.length > 0) setMostrarSugestoes(true);
                        else if (pecaTexto.trim().length === 0 && pecasBD.length > 0) {
                          setSugestoes(pecasBD.slice(0, 8));
                          setMostrarSugestoes(true);
                        }
                      }}
                      placeholder="Comece a digitar (ex: Bloco do Motor...)"
                      style={s.pecaInput}
                      autoComplete="off"
                    />
                    {mostrarSugestoes && sugestoes.length > 0 && (
                      <div style={s.dropdown}>
                        {sugestoes.map((sug, idx) => (
                          <div
                            key={idx}
                            style={{
                              ...s.dropdownItem,
                              ...(idx === sugestaoFoco ? s.dropdownItemHover : {}),
                              ...{ borderBottom: idx === sugestoes.length - 1 ? 'none' : '1px solid #f1f5f9' }
                            }}
                            onMouseEnter={() => setSugestaoFoco(idx)}
                            onMouseLeave={() => setSugestaoFoco(-1)}
                            onMouseDown={(e) => { e.preventDefault(); selecionarSugestao(sug); }}
                          >
                            {sug}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={s.qtyBox}>
                    <span style={s.qtyLabel}>Qtd:</span>
                    <input
                      type="number"
                      min={1}
                      value={quantidadeSelecionada}
                      onChange={(e) => setQuantidadeSelecionada(Math.max(1, parseInt(e.target.value) || 1))}
                      style={s.qtyInput}
                    />
                  </div>

                  <button type="button" onClick={() => adicionarAcessorio()} style={s.addBtn}>＋ Adicionar</button>
                </div>

                {itensSolicitados.length > 0 && (
                  <div style={s.tagList}>
                    {itensSolicitados.map((item, idx) => (
                      <span key={idx} style={s.tag}>
                        <span>{item.nome}</span>
                        <strong style={s.tagQty}>x{item.quantidade}</strong>
                        <button type="button" onClick={() => removerAcessorio(item.nome)} style={s.tagRemove}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AVISO DE AUTENTICAÇÃO */}
              {avisoAuth && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '10px',
                  marginBottom: '14px',
                  fontSize: '13px',
                  color: '#92400e',
                  fontWeight: 600,
                }}>
                  <span style={{ fontSize: '18px' }}>🔐</span>
                  <div>
                    {!user
                      ? <>Precisa de estar autenticado para continuar. A redirecionar para o <strong>login</strong>...</>
                      : <>A sua conta <strong>({user.funcao})</strong> não tem permissão para efectuar cotações. Contacte o administrador.</>
                    }
                  </div>
                </div>
              )}

              {/* ACÇÕES (Alterado para incentivar o fluxo correto) */}
              <div style={{ ...s.actionRow, marginTop: '32px' }}> 
                <button
                  type="button"
                  onClick={() => {
                    setMotorDados(null);
                    setVinInput('');
                    setManualMarca(''); setManualModelo(''); setManualAno('');
                    setItensSolicitados([]);
                    setPecaTexto('');
                    setAvisoAuth(false);
                  }}
                  style={s.btnCancel}
                >
                  Cancelar
                </button>

                {/* BOTÃO SEGUINTE — Desativado se itensSolicitados estiver vazio */}
                <button
                  type="button"
                  onClick={handleAbrirModal}
                  disabled={authLoading || itensSolicitados.length === 0}
                  style={{
                    ...s.btnPrimary,
                    opacity: (authLoading || itensSolicitados.length === 0) ? 0.4 : 1,
                    cursor: (authLoading || itensSolicitados.length === 0) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {authLoading
                    ? <><span>⏳</span> A verificar sessão...</>
                    : !user
                    ? <><span>🔐</span> Entrar para Continuar</>
                    : <><span>🛒</span> Seguinte</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {modalRequisicaoAberto && (
        <ModalRequisicao
          onClose={() => setModalRequisicaoAberto(false)}
          isMotorCompleto={itensSolicitados.length === 0 || (itensSolicitados.length === 1 && itensSolicitados[0].nome === 'Motor Completo')}
          itensSolicitados={itensSolicitados}
          dadosEmpresa={dadosEmpresa}
          dadosIniciais={{
            marca: motorDados?.marca || motorDados?.Make || '',
            modelo: motorDados?.modelo || motorDados?.Model || '',
            ano: motorDados?.ano || motorDados?.ModelYear || '',
            vin: motorDados?.vin || vinInput,
            notaOrigem: motorDados?.inseridoPeloCliente ? "Inserido pelo Cliente" : "Detectado Automático"
          }}
        />
      )}

      <CatalogoVisual />
    </div>
  );
}