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
}

/** Cores usadas nos blocos da agenda. */
export type ServiceColor = "violet" | "emerald" | "amber" | "rose" | "sky"

export interface BusinessHours {
  weekday: Weekday
  enabled: boolean
  from: TimeString
  to: TimeString
}
