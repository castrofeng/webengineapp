import React from 'react';

const PRODUTOS_DESTAQUE = [
  {
    nome: "Motor Mercedes OM 654",
    codigo: "OM 654.920",
    compatibilidade: "Classe C W205",
    preco: "2.759,00 MZM",
    img: "⚙️",
    estado: "Recondicionado",
    estadoCor: "#16a34a",
    estadoBg: "#f0fdf4",
  },
  {
    nome: "Motor Mercedes OM 626",
    codigo: "OM 626.951",
    compatibilidade: "Classe C W205",
    preco: "1.639,00 MZM",
    img: "⚙️",
    estado: "Em Stock",
    estadoCor: "#2563eb",
    estadoBg: "#eff6ff",
  },
  {
    nome: "Motor Jeep/Fiat 1.0",
    codigo: "552 82 151",
    compatibilidade: "Renegade / 500X",
    preco: "1.899,00 MZM",
    img: "⚙️",
    estado: "Em Stock",
    estadoCor: "#2563eb",
    estadoBg: "#eff6ff",
  },
  {
    nome: "Motor BMW N57",
    codigo: "N57 D30 A",
    compatibilidade: "Série 3 / X5 / X6",
    preco: "1.999,00 MZM",
    img: "⚙️",
    estado: "Última unidade",
    estadoCor: "#b45309",
    estadoBg: "#fffbeb",
  },
];

export const CatalogoVisual = () => {
  return (
    <section style={{
      padding: 'clamp(32px, 5vw, 56px) clamp(16px, 4vw, 32px)',
      backgroundColor: '#f8fafc',
    }}>
      {/* Cabeçalho da secção */}
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#2563eb',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '8px',
          }}>
            SELECÇÃO DO MÊS
          </span>
          <h2 style={{
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Motores em Destaque
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            marginTop: '8px',
            maxWidth: '480px',
            margin: '8px auto 0',
            lineHeight: 1.5,
          }}>
            Todos com origem verificada em manifesto aduaneiro e garantia incluída.
          </p>
        </div>

        {/* Grid de produtos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
          gap: '16px',
        }}>
          {PRODUTOS_DESTAQUE.map((prod, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#93c5fd';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px -4px rgba(37,99,235,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              {/* Imagem / ícone */}
              <div style={{
                backgroundColor: '#f1f5f9',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '52px',
                position: 'relative',
              }}>
                {prod.img}
                {/* Badge de estado */}
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: prod.estadoBg,
                  color: prod.estadoCor,
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${prod.estadoCor}22`,
                }}>
                  {prod.estado}
                </span>
              </div>

              {/* Corpo do card */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: 800,
                  margin: '0 0 4px 0',
                  letterSpacing: '0.03em',
                }}>
                  {prod.codigo}
                </p>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: '0 0 4px 0',
                  lineHeight: 1.3,
                }}>
                  {prod.nome}
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: '0 0 12px 0',
                }}>
                  {prod.compatibilidade}
                </p>

                {/* Preço + contexto */}
                <div style={{ marginTop: 'auto' }}>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: '0 0 2px 0',
                  }}>
                    {prod.preco}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    margin: '0 0 12px 0',
                    fontWeight: 400,
                  }}>
                    IVA incluído · Envio 3–5 dias úteis
                  </p>

                  {/* CTA */}
                  <button
                    style={{
                      width: '100%',
                      padding: '9px 0',
                      backgroundColor: '#1e40af',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '9px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e3a8a')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e40af')}
                    onClick={() => {
                      // Navegar para página de detalhe do produto
                      // router.push(`/loja/${prod.codigo}`)
                    }}
                  >
                    Ver detalhes →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Link para o catálogo completo */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button style={{
            background: 'none',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '10px 28px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#475569',
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#2563eb';
              (e.currentTarget as HTMLButtonElement).style.color = '#2563eb';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#cbd5e1';
              (e.currentTarget as HTMLButtonElement).style.color = '#475569';
            }}
            onClick={() => {
              // router.push('/loja')
            }}
          >
            Ver catálogo completo →
          </button>
        </div>
      </div>
    </section>
  );
};
