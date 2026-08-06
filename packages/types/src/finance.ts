import type { Auditable, Cents, ISODate, ISODateTime, SoftDeletable, UUID } from "./common"

export type PaymentStatus = "PAGO" | "PENDENTE" | "ATRASADO" | "CANCELADO"

export type PaymentMethod = "PIX" | "BOLETO" | "DINHEIRO" | "CARTAO" | "TRANSFERENCIA"

/** Forma de cobrança solicitada ao gateway — espelha o billingType do Asaas. */
export type BillingType = "PIX" | "BOLETO" | "CARTAO_CREDITO"

/** De onde a cobrança nasceu, exibido como etiqueta na lista. */
export type ChargeOrigin = "AVULSA" | "ATENDIMENTO"

export interface Charge extends Auditable, SoftDeletable {
  id: UUID
  customerId: UUID
  customerName: string
  description: string
  dueDate: ISODate
  amount: Cents
  status: PaymentStatus
  method: PaymentMethod | null
  paidAt: ISODate | null
  /** Forma de cobrança pedida ao gateway. Null em lançamentos manuais antigos. */
  billingType: BillingType | null
  origin: ChargeOrigin
  /** Link de pagamento enviado ao cliente. */
  invoiceUrl: string | null
  /** Identificador da cobrança no gateway. */
  gatewayId: string | null
  appointmentId: UUID | null
}

export interface FinanceSummary {
  /** Receita prevista do período. */
  expected: Cents
  /** Total já recebido. */
  received: Cents
  /** Total pendente. */
  pending: Cents
  /** Variação percentual da receita contra o período anterior. */
  changeVsPreviousPeriod: number
}

/** Períodos oferecidos no filtro da tela Financeiro. */
export type FinancePeriod = "ESTE_MES" | "MES_PASSADO" | "ULTIMOS_7_DIAS"

export interface FinanceFilters {
  period: FinancePeriod
  status: PaymentStatus | "TODOS"
}

/** Dados informados pelo profissional ao registrar um pagamento manualmente. */
export interface RegisterPaymentInput {
  chargeId: UUID
  method: PaymentMethod
  paidAt: ISODate
}

/** Cobrança PIX simulada — o MVP ainda não integra um PSP real. */
export interface PixChargeInfo {
  chargeId: UUID
  /** Chave copia-e-cola fictícia, não é um BR Code válido. */
  payload: string
  amount: Cents
  expiresAt: ISODateTime
}

/** Dados do formulário de nova cobrança. */
export interface CreateChargeInput {
  customerId: UUID
  description: string
  amount: Cents
  dueDate: ISODate
  billingType: BillingType
  appointmentId?: UUID | null
  /** Quando verdadeiro, cria uma recorrência mensal (sempre no mesmo dia). */
  recurring?: boolean
  sendWhatsAppNow: boolean
}

/** Agregado por cliente usado no painel de inadimplência. */
export interface OpenCustomerBalance {
  customerId: UUID
  customerName: string
  phone: string
  totalOpen: Cents
  charges: Charge[]
  oldestDueDate: ISODate
  /** Dias de atraso da cobrança mais antiga. Zero quando nada venceu ainda. */
  daysLate: number
  hasOverdue: boolean
}

// ── Despesas (gastos do próprio negócio) ────────────────────────────────────

export type ExpenseCategory =
  | "ALUGUEL"
  | "EQUIPAMENTO"
  | "PLATAFORMA"
  | "MARKETING"
  | "CONTABILIDADE"
  | "IMPOSTOS"
  | "SALARIO"
  | "MANUTENCAO"
  | "OUTRO"

export type ExpenseStatus = "PAGO" | "PENDENTE" | "ATRASADO"

export interface ExpenseAttachment {
  id: UUID
  name: string
  /** Tipo MIME ou extensão simplificada: "pdf", "jpg", "png", "doc", "xls" */
  type: string
  /** URL para download/preview (Blob URL em produção). */
  url: string
  /** Categoria do documento. */
  kind: "COMPROVANTE" | "NOTA_FISCAL" | "RECIBO" | "CONTRATO" | "OUTRO"
  uploadedAt: ISODateTime
}

export interface Expense extends Auditable, SoftDeletable {
  id: UUID
  description: string
  category: ExpenseCategory
  amount: Cents
  dueDate: ISODate
  paidAt: ISODate | null
  status: ExpenseStatus
  method: PaymentMethod | null
  /** Recorrência mensal. */
  recurring: boolean
  notes: string | null
  attachments: ExpenseAttachment[]
}

export interface CreateExpenseInput {
  description: string
  category: ExpenseCategory
  amount: Cents
  dueDate: ISODate
  method?: PaymentMethod | null
  recurring?: boolean
  notes?: string | null
}

/**
 * Respostas do gateway. A forma espelha a API do Asaas para que a troca
 * do mock pela integração real não exija mudança na interface.
 */
export interface AsaasChargeResponse {
  id: string
  status: string
  dueDate: ISODate
  value: number
  invoiceUrl: string
  bankSlipUrl: string | null
  pixPayload: string | null
  /** Indica que a resposta veio do mock, para a interface avisar o usuário. */
  mocked: boolean
}
