import type { Auditable, Cents, ISODateTime, SoftDeletable, UUID } from "./common"

/** "PACOTE" = crédito com validade. "MENSALIDADE" = assinatura recorrente mensal. */
export type PackageKind = "PACOTE" | "MENSALIDADE"

/**
 * Modelo reutilizável cadastrado pelo profissional em Serviços.
 * Ex: "10 aulas de tênis" (PACOTE) ou "Mensalidade Personal — 8 sessões/mês" (MENSALIDADE).
 */
export interface PackageTemplate extends Auditable, SoftDeletable {
  id: UUID
  name: string
  kind: PackageKind
  /** Serviço associado — usado como padrão de preço da sessão extra quando não definido. */
  serviceId: UUID | null
  serviceName: string | null
  /** Nº de sessões do pacote inteiro, ou por ciclo mensal na mensalidade. */
  sessionsPerCycle: number
  /** Preço total do pacote, ou valor cobrado por mês na mensalidade. */
  price: Cents
  /** Validade em dias a partir da compra. Só se aplica a PACOTE. */
  validityDays: number | null
  /**
   * Preço cobrado quando o cliente agenda além do saldo disponível.
   * Se null, usa o preço avulso do serviço associado.
   */
  extraSessionPrice: Cents | null
  active: boolean
}

export type ClientPackageStatus = "ATIVO" | "EXPIRADO" | "ESGOTADO" | "CANCELADO"

/** Pacote ou mensalidade efetivamente vendido a um cliente. */
export interface ClientPackage extends Auditable, SoftDeletable {
  id: UUID
  customerId: UUID
  customerName: string
  templateId: UUID
  templateName: string
  kind: PackageKind
  /** Limite de sessões do ciclo atual. */
  sessionsTotal: number
  sessionsUsed: number
  price: Cents
  extraSessionPrice: Cents | null
  purchasedAt: ISODateTime
  /** Pacote: data de expiração do crédito. Mensalidade: fim do ciclo atual (renova). */
  expiresAt: ISODateTime | null
  status: ClientPackageStatus
  /** true = mensalidade (sessionsUsed volta a 0 a cada renovação). */
  renewsMonthly: boolean
}

export interface CreateClientPackageInput {
  customerId: UUID
  templateId: UUID
}

/** Registro de cada sessão consumida (ou cobrada como extra) de um pacote. */
export interface PackageSessionLog {
  id: UUID
  clientPackageId: UUID
  appointmentId: UUID
  consumedAt: ISODateTime
  /** true = saldo já estava zerado; sessão foi cobrada avulsa fora do pacote. */
  wasExtra: boolean
  /** Cobrança gerada quando wasExtra é true. */
  extraChargeId: UUID | null
}
