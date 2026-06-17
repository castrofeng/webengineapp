import React from "react";
import { Page, Text, View, Document } from "@react-pdf/renderer";
import { pdfStyles } from "../styles/pdfStyles";

type CotacaoPDFProps = {
  cliente: any;
  veiculo: any;
  empresa: any;
  requisicao: any;
};

export const CotacaoPDF = (props: CotacaoPDFProps) => {
  const requisicao = props?.requisicao;

  // ===============================
  // 🔐 PROTEÇÃO TOTAL
  // ===============================
  if (!requisicao) {
    return (
      <Document>
        <Page size="A4">
          <View>
            <Text>Requisição inválida para gerar PDF</Text>
          </View>
        </Page>
      </Document>
    );
  }

  const cliente = props?.cliente ?? {};
  const veiculo = props?.veiculo ?? {};
  const empresa = props?.empresa ?? {};

  const dataAtual = new Date().toLocaleDateString("pt-MZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ===============================
  // 🔐 ITENS SEGUROS
  // ===============================
  const itens = Array.isArray(requisicao?.itens)
    ? requisicao.itens
    : [];

  // ===============================
  // 💰 CÁLCULO SEGURO
  // ===============================
  const total = itens.reduce((acc: number, item: any) => {
    const preco = Number(item?.preco_unitario || 0);
    const qtd = Number(item?.quantidade || 1);
    return acc + preco * qtd;
  }, 0);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>

        {/* HEADER */}
        <View style={pdfStyles.topSection}>
          <View style={pdfStyles.empresaBloco}>
            <Text style={pdfStyles.empresaNome}>
              ENGINE<Text style={{ color: "#2563eb" }}>MOZ</Text>
            </Text>

            <Text style={pdfStyles.empresaNuit}>
              NUIT: {empresa?.nuit || "N/D"} | Cotação Oficial de Peças OEM
            </Text>
          </View>

          <View style={pdfStyles.clienteTopoBloco}>
            <Text style={pdfStyles.docTitulo}>
              COTAÇÃO / PROFORMA
            </Text>

            <Text style={pdfStyles.clienteTextoPequeno}>
              Cliente: {cliente?.nome || "N/D"}
            </Text>

            <Text style={pdfStyles.clienteTextoPequeno}>
              Tel: {cliente?.contacto || "N/D"}
            </Text>

            <Text style={pdfStyles.clienteTextoPequeno}>
              Email: {cliente?.email || "N/D"}
            </Text>
          </View>
        </View>

        {/* VEÍCULO */}
        <Text style={pdfStyles.seccaoTitulo}>
          1. Dados da Viatura
        </Text>

        <View style={pdfStyles.viaturaBarra}>
          <Text style={pdfStyles.viaturaTexto}>
            {veiculo?.marca || "N/D"} {veiculo?.modelo || ""} ({veiculo?.ano || ""})
          </Text>

          <Text style={pdfStyles.viaturaTexto}>
            VIN:{" "}
            <Text style={pdfStyles.vinDestaque}>
              {veiculo?.vin || "N/D"}
            </Text>
          </Text>
        </View>

        {/* ITENS */}
        <Text style={pdfStyles.seccaoTitulo}>
          2. Itens Cotados
        </Text>

        <View style={pdfStyles.materialContainer}>

          {itens.length === 0 ? (
            <Text style={{ fontSize: 8, color: "#dc2626" }}>
              Nenhum item disponível para cotação
            </Text>
          ) : (
            itens.map((item: any, index: number) => {
              const preco = Number(item?.preco_unitario || 0);
              const qtd = Number(item?.quantidade || 1);
              const subtotal = preco * qtd;

              return (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 3,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#e2e8f0",
                  }}
                >
                  <Text style={{ fontSize: 8, width: "55%" }}>
                    {item?.nome_peca || "Peça"}
                  </Text>

                  <Text style={{ fontSize: 8, width: "15%", textAlign: "center" }}>
                    {qtd}
                  </Text>

                  <Text style={{ fontSize: 8, width: "15%", textAlign: "right" }}>
                    {preco.toFixed(2)} MZN
                  </Text>

                  <Text style={{ fontSize: 8, width: "15%", textAlign: "right" }}>
                    {subtotal.toFixed(2)} MZN
                  </Text>
                </View>
              );
            })
          )}

        </View>

        {/* TOTAL */}
        <View style={{ marginTop: 10, textAlign: "right" }}>
          <Text style={{ fontSize: 9, fontWeight: "bold" }}>
            TOTAL: {total.toFixed(2)} MZN
          </Text>
        </View>

        {/* TERMOS */}
        <View style={pdfStyles.termosSeccao}>
          <Text style={{ fontSize: 7, marginBottom: 2 }}>
            Validade da cotação: 7 dias úteis
          </Text>

          <Text style={{ fontSize: 7 }}>
            Os preços podem variar conforme disponibilidade e câmbio.
            Após aprovação será emitida confirmação de encomenda.
          </Text>
        </View>

        {/* ASSINATURA */}
        <View style={pdfStyles.assinaturaContainer}>
          <View style={pdfStyles.assinaturaBloco}>
            <View style={pdfStyles.linhaAssinatura}>
              <Text>Assinatura Cliente</Text>
            </View>

            <Text style={pdfStyles.dataLocal}>
              Maputo, {dataAtual}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={pdfStyles.footerEmpresa} fixed>
          <Text style={pdfStyles.footerLinhaTexto}>
            Documento gerado automaticamente pela plataforma EngineMoz
          </Text>

          <Text style={pdfStyles.footerLinhaTexto}>
            {empresa?.nome || "EngineMoz"} | {empresa?.localizacao || ""}
          </Text>

          <Text style={pdfStyles.footerLinhaTexto}>
            Contactos: {empresa?.contacto || ""} | Email: {empresa?.email || ""}
          </Text>
        </View>

      </Page>
    </Document>
  );
};