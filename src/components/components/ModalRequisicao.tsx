"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { modalStyles } from '@/src/components/styles/modalrequisicao';
import { pdf } from '@react-pdf/renderer'; 
import { GuiaRequisicaoPDF } from './GuiaRequisicaoPDF'; 

// Importação da URL base a partir do ficheiro centralizado
import { API_BASE_URL } from '@/src/api/api';

// Configuração do sufixo /requisicoes mantendo a integridade com as rotas do backend
const API_REQUISICOES_URL = `${API_BASE_URL}/requisicoes`;

interface ModalRequisicaoProps {
  onClose: () => void;
  dadosIniciais: { marca: string; modelo: string; ano: string; vin: string };
  isMotorCompleto: boolean;
  itensSolicitados: any[];
  dadosEmpresa: any;
}

export const ModalRequisicao = ({
  onClose,
  dadosIniciais,
  isMotorCompleto,
  itensSolicitados,
  dadosEmpresa,
}: ModalRequisicaoProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [passoAtual, setPassoAtual] = useState<1 | 2>(1);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados dos campos existentes
  const [formNome, setFormNome] = useState(user?.nome || '');
  const [formContacto, setFormContacto] = useState(user?.contacto || '');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [formMarca, setFormMarca] = useState(dadosIniciais.marca);
  const [formModelo, setFormModelo] = useState(dadosIniciais.modelo);
  const [formVIN, setFormVIN] = useState(dadosIniciais.vin);

  // Campos necessários vindos da árvore do PDF
  const [formProvincia, setFormProvincia] = useState('Maputo');
  const [formEndereco, setFormEndereco] = useState('');

  useEffect(() => { setIsClient(true); }, []);

  // ✉️ Função para enviar o PDF gerado diretamente para a API de Email
  const enviarEmailComPDF = async (pdfBlob: Blob, numeroRequisicao: string, token: string) => {
    try {
      const formData = new FormData();
      formData.append("pdf", pdfBlob, `cotacao-${numeroRequisicao}.pdf`);
      formData.append("email_cliente", formEmail);
      formData.append("nome_cliente", formNome);
      formData.append("numero_requisicao", numeroRequisicao);

      const emailResponse = await fetch(`${API_REQUISICOES_URL}/enviar-cotacao-email`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.detail || "Falha ao disparar o servidor de email.");
      }

      console.log("✉️ Email enviado com sucesso para o cliente.");
    } catch (err: any) {
      console.error("Erro ao enviar email:", err);
      alert(`⚠️ Requisição salva e baixada, mas o envio do email falhou: ${err.message}`);
    }
  };

  // Função para gerar o PDF, forçar o download no browser e coordenar o envio do email
  const baixarGuiaPDF = async (numeroRequisicao: string, token: string) => {
    try {
      const doc = (
        <GuiaRequisicaoPDF
          cliente={{
            nome: formNome,
            bi: "N/Aplicavel",
            contacto: formContacto,
            email: formEmail,
            provincia: formProvincia,
            endereco: formEndereco,
          }}
          veiculo={{
            marca: formMarca,
            modelo: formModelo,
            ano: dadosIniciais.ano,
            vin: formVIN,
          }}
          encomenda={{
            motorCompleto: isMotorCompleto,
            itens: itensSolicitados.map((item: any) => typeof item === 'string' ? item : item.nome),
          }}
          empresa={{
            nome: dadosEmpresa?.nome || "EngineMoz, Lda",
            nuit: dadosEmpresa?.nuit || "400XXXXXX",
            localizacao: dadosEmpresa?.localizacao || "Av. Moçambique, Maputo",
            contacto: dadosEmpresa?.contacto || "+258 84 000 0000",
            email: dadosEmpresa?.email || "info@enginemoz.co.mz",
          }}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Guia_Requisicao_${numeroRequisicao}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await enviarEmailComPDF(blob, numeroRequisicao, token);

    } catch (err) {
      console.error("Erro ao gerar fluxo de ficheiros/email:", err);
      alert("Requisição submetida com sucesso, mas houve um erro técnico ao gerar ou enviar o PDF.");
    }
  };

  const handleFinalizarRequisicao = async () => {
    const token = localStorage.getItem("enginemoz_token");
    if (!token) {
      alert("Sessão expirada. Por favor, faça login novamente.");
      return;
    }

    setIsLoading(true);

    const payload = {
      nome_cliente: formNome,
      email_cliente: formEmail,
      contacto_cliente: formContacto,
      vin: formVIN,
      marca: formMarca,
      modelo: formModelo,
      ano: parseInt(dadosIniciais.ano) || 0,
      is_manual: true,
      bi_cliente: "N/Aplicavel",
      provincia_cliente: formProvincia,
      endereco_cliente: formEndereco,
      itens: itensSolicitados.map((item: any) => ({
        nome_peca: typeof item === 'string' ? item : item.nome,
        quantidade: 1
      }))
    };

    try {
      const response = await fetch(`${API_REQUISICOES_URL}/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao salvar");
      }

      const data = await response.json();
      
      alert(`✅ Requisição enviada com sucesso!\n\nNúmero: ${data.numero_requisicao}\n✉️ Um e-mail com os detalhes e o guia PDF da requisição foi enviado para: ${formEmail}`);
      
      await baixarGuiaPDF(data.numero_requisicao || "Nova", token);
      onClose();

      router.push('/');
      window.location.reload();

    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) return null;

  const passos = ['Dados', 'Confirmação'];

  return (
    <>
      <style>{modalStyles}</style>

      <div className="modal-overlay">
        <div className="modal-card" style={{ maxWidth: '750px', width: '100%', maxHeight: 'none', overflow: 'visible' }}>

          {/* Header */}
          <div className="modal-header">
            <div className="modal-header-top">
              <div>
                <p className="modal-title">Nova Requisição</p>
                <p className="modal-subtitle">
                  {formMarca} {formModelo} {dadosIniciais.ano ? ` · ${dadosIniciais.ano}` : ''}
                </p>
              </div>
              <button className="modal-close-btn" onClick={onClose}>×</button>
            </div>

            {/* Steps */}
            <div className="steps-row">
              {passos.map((label, i) => {
                const num = i + 1;
                const state = passoAtual > num ? 'done' : passoAtual === num ? 'active' : 'pending';
                return (
                  <React.Fragment key={label}>
                    <div className={`step-item ${state}`}>
                      <div className={`step-dot ${state}`}>
                        {state === 'done' ? '✓' : num}
                      </div>
                      <span className={`step-label ${state}`}>{label}</span>
                    </div>
                    {i < passos.length - 1 && (
                      <div style={{
                        flex: 1,
                        height: '2px',
                        background: passoAtual > num ? '#2563eb' : '#e2e8f0',
                        margin: '0 8px',
                        borderRadius: '1px',
                        transition: 'background 0.3s'
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="modal-body" style={{ overflowY: 'visible', padding: '16px 24px' }}>

            {/* Passo 1 */}
            {passoAtual === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Coluna Esquerda: Contacto & Identificação */}
                <div>
                  <p className="section-label" style={{ marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Contacto & Identificação</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="field-wrap">
                      <label className="field-label">Nome completo</label>
                      <input
                        className="field-input"
                        value={formNome}
                        onChange={(e) => setFormNome(e.target.value)}
                        placeholder="Ex: João Silva"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="field-wrap">
                        <label className="field-label">Contacto</label>
                        <input
                          className="field-input"
                          value={formContacto}
                          onChange={(e) => setFormContacto(e.target.value)}
                          placeholder="+258 8X XXX XXXX"
                        />
                      </div>
                      <div className="field-wrap">
                        <label className="field-label">Email</label>
                        <input
                          className="field-input"
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <div className="field-wrap">
                        <label className="field-label">Província</label>
                        <select 
                          className="field-input" 
                          value={formProvincia} 
                          onChange={(e) => setFormProvincia(e.target.value)}
                        >
                          <option value="Maputo">Maputo</option>
                          <option value="Gaza">Gaza</option>
                          <option value="Inhambane">Inhambane</option>
                          <option value="Sofala">Sofala</option>
                          <option value="Tete">Tete</option>
                          <option value="Manica">Manica</option>
                          <option value="Zambézia">Zambézia</option>
                          <option value="Nampula">Nampula</option>
                          <option value="Cabo Delgado">Cabo Delgado</option>
                          <option value="Niassa">Niassa</option>
                        </select>
                      </div>
                      <div className="field-wrap">
                        <label className="field-label">Endereço Residencial</label>
                        <input
                          className="field-input"
                          value={formEndereco}
                          onChange={(e) => setFormEndereco(e.target.value)}
                          placeholder="Ex: Bairro Central, Av. Karl Marx"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Viatura */}
                <div>
                  <p className="section-label" style={{ marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Viatura</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="field-wrap">
                      <label className="field-label">Chassi (VIN)</label>
                      <input
                        className="field-input"
                        value={formVIN}
                        onChange={(e) => setFormVIN(e.target.value)}
                        placeholder="Ex: JN1CV6AP8EM800000"
                        style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                      />
                    </div>
                    
                    <div className="field-wrap">
                      <label className="field-label">Marca</label>
                      <input
                        className="field-input"
                        value={formMarca}
                        onChange={(e) => setFormMarca(e.target.value)}
                      />
                    </div>
                    
                    <div className="field-wrap">
                      <label className="field-label">Modelo</label>
                      <input
                        className="field-input"
                        value={formModelo}
                        onChange={(e) => setFormModelo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Passo 2 */}
            {passoAtual === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div className="review-block" style={{ marginBottom: '12px' }}>
                    <p className="review-block-title">Requerente</p>
                    <div className="review-row">
                      <span className="review-row-key">Nome</span>
                      <span className="review-row-val">{formNome || '—'}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-row-key">Contacto / Email</span>
                      <span className="review-row-val" style={{ fontSize: '11px' }}>{formContacto || '—'} | {formEmail || '—'}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-row-key">Localização</span>
                      <span className="review-row-val">{formProvincia} - {formEndereco || '—'}</span>
                    </div>
                  </div>

                  <div className="review-block" style={{ marginBottom: '0' }}>
                    <p className="review-block-title">Viatura</p>
                    <div className="review-row">
                      <span className="review-row-key">Marca / Modelo</span>
                      <span className="review-row-val">{formMarca} {formModelo} ({dadosIniciais.ano || '—'})</span>
                    </div>
                    <div className="review-row">
                      <span className="review-row-key">VIN</span>
                      <span className="review-row-val" style={{ fontFamily: 'monospace', fontSize: '10px' }}>
                        {formVIN || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="review-block" style={{ marginBottom: '0' }}>
                  <p className="review-block-title">Material Solicitado</p>
                  <div className="items-list" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                    {isMotorCompleto ? (
                      <div className="item-pill" style={{ color: '#16a34a', fontWeight: 'bold' }}>
                        <span className="item-pill-dot" style={{ background: '#16a34a' }} />
                        📦 MOTOR COMPLETO OEM
                      </div>
                    ) : (
                      itensSolicitados.map((item, i) => (
                        <div key={i} className="item-pill">
                          <span className="item-pill-dot" />
                          {typeof item === 'string' ? item : item.nome}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            {passoAtual === 1 ? (
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            ) : (
              <button className="btn btn-secondary" onClick={() => setPassoAtual(1)}>← Voltar</button>
            )}

            {passoAtual === 1 ? (
              <button className="btn btn-primary" onClick={() => setPassoAtual(2)}>Rever pedido →</button>
            ) : (
              <button
                className={`btn btn-success ${isLoading ? 'btn-loading' : ''}`}
                disabled={isLoading}
                onClick={handleFinalizarRequisicao}
              >
                {isLoading ? 'A processar...' : 'Confirmar e enviar'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};