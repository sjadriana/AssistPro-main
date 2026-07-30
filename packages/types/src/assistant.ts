import type { Cents, ISODateTime, UUID } from "./common"

/**
 * Eventos que a assistente reporta ao profissional (ver seção 8).
 * A IA automatiza tarefas repetitivas — nunca é apenas um chat.
 */
export type AssistantEventKind =
  | "CONFIRMACAO_RECEBIDA"
  | "CANCELAMENTO"
  | "PAGAMENTO_PENDENTE"
  | "REAGENDAMENTO_SOLICITADO"
  | "CLIENTE_INATIVO"
  | "RETORNO_SUGERIDO"
  /** Agendamento sem cobrança ativa — alerta para o profissional criar a cobrança. */
  | "COBRANCA_PENDENTE"

export interface AssistantEvent {
  id: UUID
  kind: AssistantEventKind
  /** Mensagem já pronta para exibição, gerada pela assistente. */
  message: string
  /** Linha de apoio: serviço, valor ou última interação. */
  detail: string | null
  createdAt: ISODateTime
  customerId: UUID | null
  /** Ação sugerida que o profissional pode executar em um clique. */
  suggestedAction: AssistantAction | null
}

export interface AssistantAction {
  label: string
  href: string
}

export interface DashboardMetrics {
  appointmentsToday: number
  awaitingConfirmation: number
  pendingPayments: number
  freeSlots: number
  revenueThisMonth: Cents
}
