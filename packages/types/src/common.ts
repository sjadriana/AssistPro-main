/**
 * Convenções (ver Documento de Arquitetura, seção 4):
 * - IDs: UUID v7
 * - Datas: sempre UTC em ISO 8601, conversão só na interface
 * - Soft delete: deletedAt
 */
export type UUID = string

/** Data/hora em UTC, formato ISO 8601. */
export type ISODateTime = string

/** Data sem hora, formato YYYY-MM-DD. */
export type ISODate = string

/** Hora local do profissional, formato HH:mm. */
export type TimeString = string

export interface Auditable {
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface SoftDeletable {
  deletedAt: ISODateTime | null
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Valores monetários trafegam em centavos para evitar erro de ponto flutuante. */
export type Cents = number
