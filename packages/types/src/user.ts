import type { Auditable, UUID } from "./common"

/** RBAC — ver seção 2 (Autenticação) do Documento de Arquitetura. */
export type Role = "OWNER" | "PROFESSIONAL" | "ASSISTANT"

export type PlanTier = "ESSENCIAL" | "PROFISSIONAL" | "PREMIUM"

export interface User extends Auditable {
  id: UUID
  name: string
  email: string
  avatarUrl: string | null
  role: Role
  plan: PlanTier
  /** Segmento do profissional, define os módulos específicos habilitados. */
  segment: Segment
}

export type Segment = "TENIS" | "PERSONAL" | "AULA_PARTICULAR" | "SALAO" | "CLINICA" | "PET_SHOP"

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: User
}
