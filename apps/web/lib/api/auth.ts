import type { AuthSession, User } from "@assistpro/types"
import { apiFetch, IS_MOCK, setAccessToken } from "./client"

// ── Mock fallbacks ──────────────────────────────────────────────────────────
const MOCK_SESSION: AuthSession = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  user: {
    id: "usr-1",
    name: "Rafael Mendes",
    email: "rafael@assistpro.app",
    avatarUrl: null,
    role: "OWNER",
    plan: "PROFISSIONAL",
    segment: "TENIS",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
}

// ── API ─────────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string
  password: string
}

/** Autentica o profissional e armazena o accessToken em memória. */
export async function login(input: LoginInput): Promise<AuthSession> {
  if (IS_MOCK) {
    setAccessToken(MOCK_SESSION.accessToken)
    return MOCK_SESSION
  }
  const session = await apiFetch<AuthSession>("/auth/login", {
    method: "POST",
    body: input,
  })
  setAccessToken(session.accessToken)
  return session
}

/**
 * Troca o refreshToken (cookie httpOnly) por um novo accessToken.
 * Chamado automaticamente pelo interceptor quando o servidor retorna 401.
 */
export async function refreshToken(): Promise<AuthSession> {
  if (IS_MOCK) return MOCK_SESSION
  const session = await apiFetch<AuthSession>("/auth/refresh", { method: "POST" })
  setAccessToken(session.accessToken)
  return session
}

/** Desloga o profissional e invalida o refreshToken no servidor. */
export async function logout(): Promise<void> {
  setAccessToken(null)
  if (IS_MOCK) return
  return apiFetch<void>("/auth/logout", { method: "POST" })
}

/** Retorna o perfil do usuário autenticado. */
export async function getMe(): Promise<User> {
  if (IS_MOCK) return MOCK_SESSION.user
  return apiFetch<User>("/auth/me")
}
