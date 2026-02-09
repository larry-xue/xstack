export type AuthPrincipal = {
  userId: string
  role: 'authenticated'
  token: string
}

export interface AuthProvider {
  verifyBearerToken(token: string): Promise<AuthPrincipal>
}
