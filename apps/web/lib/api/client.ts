/**
 * Cliente HTTP base para a API NestJS.
 *
 * Enquanto NEXT_PUBLIC_API_URL não estiver configurada, todas as chamadas
 * retornam os dados dos mocks locais (fallback automático).
 * Quando o backend estiver pronto, basta adicionar a variável de ambiente
 * e os mocks são ignorados sem nenhuma mudança nos componentes.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export const IS_MOCK = API_URL === ""

// ── Token store (client-side apenas) ───────────────────────────────────────
// O token é armazenado em memória — o refresh token fica em cookie httpOnly
// gerenciado pelo servidor, nunca exposto ao JS.
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// ── Tipos base ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ── Fetch wrapper ───────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  /** Passa para o cache do Next.js (RSC). Ignorado no cliente. */
  next?: NextFetchRequestConfig
  /** Headers adicionais. */
  headers?: Record<string, string>
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, next, headers: extraHeaders = {} } = options

  const url = `${API_URL}${path}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next,
  })

  if (!res.ok) {
    let code = "UNKNOWN_ERROR"
    let message = `HTTP ${res.status}`
    try {
      const json = await res.json()
      code = json.code ?? code
      message = json.message ?? message
    } catch {
      // ignora erros de parsing
    }
    throw new ApiError(res.status, code, message)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}
