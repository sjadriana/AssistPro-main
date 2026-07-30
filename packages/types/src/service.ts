import type { Auditable, Cents, SoftDeletable, TimeString, UUID } from "./common"
import type { Weekday } from "./customer"

export interface Service extends Auditable, SoftDeletable {
  id: UUID
  name: string
  /** Duração padrão em minutos. */
  durationMinutes: number
  price: Cents
  color: ServiceColor
  active: boolean
  /**
   * Quando definido (> 1), o serviço admite agendamento em grupo
   * com no máximo este número de participantes.
   * null = apenas individual.
   */
  maxGroupSize: number | null
}

/** Cores usadas nos blocos da agenda. */
export type ServiceColor = "violet" | "emerald" | "amber" | "rose" | "sky"

export interface BusinessHours {
  weekday: Weekday
  enabled: boolean
  from: TimeString
  to: TimeString
}

/**
 * Grade fixa recorrente. Define um serviço que acontece
 * nos mesmos dias e horário toda semana.
 */
export interface RecurringSchedule extends Auditable {
  id: UUID
  serviceId: UUID
  serviceName: string
  /** Dias da semana em que a aula acontece. */
  weekdays: Weekday[]
  /** Horário de início (ex: "07:00"). */
  startTime: TimeString
  /** Horário de fim (ex: "08:00"). */
  endTime: TimeString
  /** Capacidade máxima de participantes. Sempre >= 1. */
  maxParticipants: number
  active: boolean
}
