import type { Auditable, ISODate, ISODateTime, UUID } from "./common"

/** Modelos de mensagem que o profissional pode editar em Comunicações. */
export type WhatsAppTemplateId =
  | "COBRANCA"
  | "COBRANCA_ATRASO"
  | "HORARIOS_LIVRES"
  | "CONFIRMACAO"
  | "LEMBRETE_24H"
  | "RETORNO"

export interface WhatsAppTemplate {
  id: WhatsAppTemplateId
  label: string
  description: string
  /** Corpo com variáveis no formato {{nome}}. */
  body: string
  /** Variáveis aceitas por este modelo, oferecidas como atalho na edição. */
  variables: string[]
}

export type MessageStatus = "AGENDADO" | "ENVIADO" | "ENTREGUE" | "LIDO" | "FALHOU"

export interface WhatsAppMessage {
  id: UUID
  customerId: UUID
  customerName: string
  phone: string
  templateId: WhatsAppTemplateId
  /** Texto final, já com as variáveis substituídas. */
  body: string
  status: MessageStatus
  sentAt: ISODateTime
  chargeId: UUID | null
  appointmentId: UUID | null
  /** Motivo da falha, quando status é FALHOU. */
  failureReason: string | null
}

export type AutomationTrigger =
  | "COBRANCA_DIA_30"
  | "COBRANCA_ATRASO"
  | "LEMBRETE_24H"
  | "LEMBRETE_30MIN"
  | "CLIENTE_INATIVO"
  | "ANIVERSARIO"

export interface Automation {
  id: UUID
  trigger: AutomationTrigger
  label: string
  description: string
  enabled: boolean
  templateId: WhatsAppTemplateId
  /** Descrição legível do agendamento, ex.: "Todo dia 30, às 09:00". */
  scheduleLabel: string
  nextRunAt: ISODate | null
}

/** Destinatário previsto de uma execução de automação de cobrança. */
export interface BillingRunRecipient {
  customerId: UUID
  customerName: string
  phone: string
  amount: number
  dueDate: ISODate
  chargeIds: UUID[]
}

export interface SendMessageInput {
  customerId: UUID
  templateId: WhatsAppTemplateId
  body: string
  chargeId?: UUID | null
  appointmentId?: UUID | null
}

/** Configuração da régua de cobrança automática. */
export interface BillingAutomationSettings extends Auditable {
  /** Dia do mês em que a mensagem é disparada. */
  dayOfMonth: number
  /** Hora local do disparo, formato HH:mm. */
  sendAt: string
  enabled: boolean
}
