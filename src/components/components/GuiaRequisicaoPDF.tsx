import React from 'react';
import { Page, Text, View, Document } from '@react-pdf/renderer';
import { GuiaPDFProps } from '../types/engine';
import { pdfStyles } from '../styles/pdfStyles';

export const GuiaRequisicaoPDF = ({ cliente, veiculo, encomenda, empresa }: GuiaPDFProps) => {
  const dataAtual = new Date().toLocaleDateString('pt-MZ', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.topSection}>
          <View style={pdfStyles.empresaBloco}>
            <Text style={pdfStyles.empresaNome}>ENGINE<Text style={{ color: '#2563eb' }}>MOZ</Text></Text>
            <Text style={pdfStyles.empresaNuit}>NUIT: {empresa.nuit} | Soluções em Motores OEM</Text>
          </View>
          <View style={pdfStyles.clienteTopoBloco}>
            <Text style={pdfStyles.docTitulo}>GUIA DE REQUISIÇÃO</Text>
            <Text style={pdfStyles.clienteTextoPequeno}>Requerente: {cliente.nome || "N/D"}</Text>
            <Text style={pdfStyles.clienteTextoPequeno}>B.I.: {cliente.bi || "N/D"} | Tel: {cliente.contacto || "N/D"}</Text>
            <Text style={pdfStyles.clienteTextoPequeno}>Email: {cliente.email || "N/D"}</Text>
            <Text style={pdfStyles.clienteTextoPequeno}>Loc: {cliente.provincia} - {cliente.endereco || "N/D"}</Text>
          </View>
        </View>

        <Text style={pdfStyles.seccaoTitulo}>1. Specification da Viatura de Destino</Text>
        <View style={pdfStyles.viaturaBarra}>
          <Text style={pdfStyles.viaturaTexto}>
            <Text style={{ fontWeight: 'bold' }}>Viatura:</Text> {veiculo.marca.toUpperCase()} {veiculo.modelo.toUpperCase()} ({veiculo.ano})
          </Text>
          <Text style={pdfStyles.viaturaTexto}>
            <Text style={{ fontWeight: 'bold' }}>N° de Chassi (VIN):</Text> <Text style={pdfStyles.vinDestaque}>{veiculo.vin.toUpperCase()}</Text>
          </Text>
        </View>

        <Text style={pdfStyles.seccaoTitulo}>2. Detalhe do Material Solicitado para Importação</Text>
        <View style={pdfStyles.materialContainer}>
          {encomenda.motorCompleto ? (
            <Text style={{ fontSize: 8.5, color: '#16a34a', fontWeight: 'bold' }}>
              📦 MOTOR COMPLETO OEM (Bloco Fechado com Acessórios Standard de Fábrica)
            </Text>
          ) : (
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 8, color: '#475569', marginBottom: 2 }}>Componentes Avulsos Seleccionados:</Text>
              <View style={pdfStyles.listaItensGrid}>
                {encomenda.itens.length === 0 ? (
                  <Text style={{ color: '#dc2626', fontSize: 8 }}>Nenhum componente específico adicionado.</Text>
                ) : (
                  encomenda.itens.map((item, index) => (
                    <Text key={index} style={pdfStyles.badgeItem}>• {item}</Text>
                  ))
                )}
              </View>
            </View>
          )}
        </View>

        <View style={pdfStyles.termosSeccao}>
          <Text style={[pdfStyles.seccaoTitulo, { fontSize: 7.5, backgroundColor: 'transparent', paddingHorizontal: 0, marginBottom: 3 }]}>3. Termos, Condições e Declaração de Honra</Text>
          <Text style={pdfStyles.termosTexto}>
            Cláusula 1ª (Objecto): A EngineMoz compromete-se a iniciar o processo de localização, validação mecânica e transporte aduaneiro dos materiais acima referenciados após a recepção desta guia assinada e do sinal acordado.
          </Text>
          <Text style={pdfStyles.termosTexto}>
            Cláusula 2ª (Declaração de Honra): Eu, abaixo assinado, declaro sob compromisso de honra que os dados do veículo e especificações das peças solicitadas extraídos do livrete original emitido pelo INATRO são verdadeiros, isentando a EngineMoz de qualquer erro por incompatibilidade de chassi.
          </Text>
        </View>

        <View style={pdfStyles.assinaturaContainer}>
          <View style={pdfStyles.assinaturaBloco}>
            <View style={pdfStyles.linhaAssinatura}>
              <Text>O Requerente: {cliente.nome || "___________________________"}</Text>
            </View>
            <Text style={pdfStyles.dataLocal}>Maputo, {dataAtual}</Text>
            <Text style={{ fontSize: 6.5, color: '#94a3b8' }}>(Assinatura igual ao Documento de Identificação)</Text>
          </View>
        </View>

        <View style={pdfStyles.footerEmpresa} fixed>
          <Text style={pdfStyles.footerLinhaTexto}>Documento Processado por Computador para fins Aduaneiros Alfandegários.</Text>
          <Text style={[pdfStyles.footerLinhaTexto, { fontWeight: 'bold', color: '#1e3a8a' }]}>
            {empresa.nome} | {empresa.localizacao}
          </Text>
          <Text style={pdfStyles.footerLinhaTexto}>Contactos: {empresa.contacto} | Email: {empresa.email}</Text>
        </View>
      </Page>
    </Document>
  );
};