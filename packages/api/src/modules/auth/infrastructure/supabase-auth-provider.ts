import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from 'jose'
import type { AuthPrincipal, AuthProvider } from '@api/modules/auth/application/ports/auth-provider'

type SupabaseAuthProviderOptions = {
  jwtSecret: string
  jwtIssuer: string | null
  jwksUrl: string | null
}

export class SupabaseAuthProvider implements AuthProvider {
  private readonly jwtSecret: Uint8Array
  private readonly jwtIssuer: string | null
  private readonly jwksUrl: string | null
  private remoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null

  constructor(options: SupabaseAuthProviderOptions) {
    this.jwtSecret = new TextEncoder().encode(options.jwtSecret)
    this.jwtIssuer = options.jwtIssuer
    this.jwksUrl = options.jwksUrl
  }

  private getResolvedJwksUrl() {
    if (this.jwksUrl && this.jwksUrl.length > 0) {
      return this.jwksUrl
    }

    if (!this.jwtIssuer) {
      return null
    }

    return `${this.jwtIssuer.replace(/\/$/, '')}/.well-known/jwks.json`
  }

  private getRemoteJwks() {
    if (this.remoteJwks) {
      return this.remoteJwks
    }

    const jwksUrl = this.getResolvedJwksUrl()
    if (!jwksUrl) {
      throw new Error('JWKS URL is required for non-HS tokens')
    }

    this.remoteJwks = createRemoteJWKSet(new URL(jwksUrl))
    return this.remoteJwks
  }

  private verifyWithSecret(token: string) {
    return jwtVerify(token, this.jwtSecret, this.jwtIssuer ? { issuer: this.jwtIssuer } : undefined)
  }

  private verifyWithJwks(token: string) {
    return jwtVerify(
      token,
      this.getRemoteJwks(),
      this.jwtIssuer ? { issuer: this.jwtIssuer } : undefined,
    )
  }

  async verifyBearerToken(token: string): Promise<AuthPrincipal> {
    const { alg } = decodeProtectedHeader(token)
    if (!alg) {
      throw new Error('Token algorithm is missing')
    }

    const isHmac = alg.toUpperCase().startsWith('HS')
    const { payload } = isHmac
      ? await this.verifyWithSecret(token)
      : await this.verifyWithJwks(token)

    const userId = typeof payload.sub === 'string' ? payload.sub : null
    const role = typeof payload.role === 'string' ? payload.role : null

    if (!userId) {
      throw new Error('Token subject is missing')
    }

    if (role !== 'authenticated') {
      throw new Error('Token role is invalid')
    }

    return {
      userId,
      role: 'authenticated',
      token,
    }
  }
}
