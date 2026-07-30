import type { Auditable, ISODate, ISODateTime, SoftDeletable, UUID } from "./common"

export type AppointmentStatus = "CONFIRMADO" | "AGUARDANDO" | "CANCELADO" | "CONCLUIDO" | "LIVRE"

export type AppointmentMode = "PRESENCIAL" | "ONLINE" | "DOMICILIAR"

export type AppointmentRecurrence = "SEMANAL" | "QUINZENAL" | "MENSAL"

export interface ReminderConfig {
  /** Dispara a confirmação por WhatsApp no momento do salvamento. */
  sendConfirmationNow: boolean
  /** Lembrete 24 horas antes do atendimento. */
  remind24hBefore: boolean
  /** Lembrete 30 minutos antes do atendimento. */
  remind30minBefore: boolean
}

/**
 * Intervalo bloqueado na agenda — impede novos agendamentos no período.
 * Pode representar um horário isolado, um dia inteiro ou um mês inteiro.
 */
export interface BlockedSlot extends Auditable, SoftDeletable {
  id: UUID
  /** Início do bloqueio em UTC. */
  startsAt: ISODateTime
  /** Fim do bloqueio em UTC. */
  endsAt: ISODateTime
  /** Se true, o bloqueio cobre o dia inteiro. */
  allDay: boolean
  /** Descrição opcional visível somente para o profissional. */
  reason: string | null
}

/** Participante de um agendamento em grupo. */
export interface GroupParticipant {
  customerId: UUID
  customerName: string
}

export interface Appointment extends Auditable, SoftDeletable {
  id: UUID
  /**
   * Individual: id do cliente único.
   * Grupo: id do "responsável" / primeiro participante adicionado.
   */
  customerId: UUID
  customerName: string
  serviceId: UUID
  serviceName: string
  /** Início em UTC. */
  startsAt: ISODateTime
  /** Fim em UTC. */
  endsAt: ISODateTime
  status: AppointmentStatus
  mode: AppointmentMode
  meetingUrl: string | null
  notes: string | null
  reminders: ReminderConfig
  /**
   * "INDIVIDUAL" (padrão) ou "GRUPO".
   */
  sessionType: "INDIVIDUAL" | "GRUPO"
  /**
   * Lista de participantes quando sessionType === "GRUPO".
   * Inclui o cliente principal (customerId).
   */
  groupParticipants: GroupParticipant[] | null
  /**
   * Token opaco usado para gerar o link de reagendamento enviado ao cliente.
   * Formato: apt-{id}-{timestamp base64url} — gerado no servidor.
   */
  rescheduleToken: string | null
}

export interface CreateAppointmentInput {
  customerId: UUID
  serviceId: UUID
  /**
   * Lista de datas (YYYY-MM-DD) selecionadas. Sempre datas futuras.
   * Quando recorrência está ativa, cada data gera um atendimento.
   */
  dates: ISODate[]
  /** Horário de início no formato HH:MM (fuso local do profissional). */
  startTime: string
  mode: AppointmentMode
  recurrence: AppointmentRecurrence | null
  meetingUrl?: string | null
  notes?: string | null
  reminders: ReminderConfig
}

export interface CreateBlockedSlotInput {
  startsAt: ISODateTime
  endsAt: ISODateTime
  allDay: boolean
  reason?: string | null
}

export interface AppointmentFilters {
  query: string
  status: AppointmentStatus | "TODOS"
}

/** Slot renderizado na grade da agenda — pode ser um atendimento ou um horário livre. */
export interface AgendaSlot {
  id: string
  startsAt: ISODateTime
  endsAt: ISODateTime
  status: AppointmentStatus
  customerName: string | null
  serviceName: string | null
}

/** Janela disponível para agendamento, oferecida ao cliente por WhatsApp. */
export interface FreeSlot {
  id: string
  /** Data local do slot, formato YYYY-MM-DD. */
  date: string
  startsAt: ISODateTime
  endsAt: ISODateTime
}

export interface ShareSlotsInput {
  customerId: UUID
  slotIds: string[]
}
