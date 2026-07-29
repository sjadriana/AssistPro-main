import type { Auditable, ISODate, ISODateTime, SoftDeletable, TimeString, UUID } from "./common"

export type Weekday = "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB" | "DOM"

export type CustomerStatus = "ATIVO" | "INATIVO" | "PENDENTE"

export interface CustomerPreferences {
  preferredServiceId: UUID | null
  preferredServiceName: string | null
  preferredPeriod: "MANHA" | "TARDE" | "NOITE" | null
  availableDays: Weekday[]
}

/**
 * Campos personalizados (ver seção 9): o profissional cria os próprios campos
 * — "Nível de saque", "Escala de dor" — sem precisar de tela específica.
 */
export interface CustomFieldValue {
  key: string
  label: string
  value: string
}

export interface Customer extends Auditable, SoftDeletable {
  id: UUID
  name: string
  phone: string
  email: string | null
  birthDate: ISODate | null
  address: string | null
  avatarUrl: string | null
  status: CustomerStatus
  notes: string | null
  preferences: CustomerPreferences
  customFields: CustomFieldValue[]
  lastAppointmentAt: ISODateTime | null
}

export interface CustomerSummary {
  id: UUID
  name: string
  phone: string
  avatarUrl: string | null
  status: CustomerStatus
  lastAppointmentAt: ISODateTime | null
}

export interface CustomerAvailability {
  weekday: Weekday
  from: TimeString
  to: TimeString
}
