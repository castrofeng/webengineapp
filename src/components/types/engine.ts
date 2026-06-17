export interface VeiculoJDM {
  marca: string;
  modelo: string;
  ano: string;
  cilindrada: string;
  combustivel: string;
  tecnologia: string;
}

export interface MotorInfo {
  Make?: string;
  Model?: string;
  ModelYear?: string;
  DisplacementL?: string;
  FuelTypePrimary?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  cilindrada?: string;
  tecnologia?: string;
  statusErro?: string;
  multiplos_registros?: boolean;
  veiculos?: VeiculoJDM[];
}

export interface MarcaFipe {
  nome: string;
  codigo: string;
}

export interface ModeloFipe {
  nome: string;
  codigo: string;
}

export interface GuiaPDFProps {
  cliente: {
    nome: string;
    bi: string;
    contacto: string;
    email: string;
    provincia: string;
    endereco: string;
  };
  veiculo: {
    marca: string;
    modelo: string;
    ano: string;
    vin: string;
  };
  encomenda: {
    motorCompleto: boolean;
    itens: string[];
  };
  empresa: {
    nome: string;
    nuit: string;
    email: string;
    contacto: string;
    localizacao: string;
  };
}