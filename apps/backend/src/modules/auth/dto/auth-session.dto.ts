/** Contrato normativo: components/schemas/AuthSession y UsuarioSesion. */
export interface UsuarioSesion {
  id: string;
  email: string;
  rol: 'comprador' | 'bodega' | 'administrador';
  idioma: string;
  estado: string;
}

export interface AuthSession {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  expires_at: string;
  usuario: UsuarioSesion;
}
