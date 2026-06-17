export interface User {
  id: number;
  nome: string;
  funcao: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}