import { CURRENCY, DISPLAY_TIMEZONE, LOCALE } from "@assistpro/config"
import type { Cents, ISODateTime } from "@assistpro/types"

/** Converte centavos para moeda: 468000 -> "R$ 4.680,00". */
export function formatCurrency(cents: Cents) {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY }).format(cents / 100)
}

/** Extrai "HH:mm" de uma data UTC, convertendo para o fuso de exibição. */
export function formatTime(iso: ISODateTime) {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DISPLAY_TIMEZONE,
  }).format(new Date(iso))
}

/** Formata "22 de Maio". */
export function formatDayMonth(iso: ISODateTime) {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    timeZone: DISPLAY_TIMEZONE,
  }).format(new Date(iso))
}

/**
 * Formata "21/05/2024".
 * Datas sem hora (YYYY-MM-DD) são tratadas como data civil, sem conversão de fuso,
 * para que um aniversário não "volte um dia" ao ser exibido.
 */
export function formatDate(iso: string) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso)

  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: dateOnly ? "UTC" : DISPLAY_TIMEZONE,
  }).format(new Date(dateOnly ? `${iso}T00:00:00.000Z` : iso))
}

/** Tempo relativo: "Agora", "10 min atrás", "Ontem". */
export function formatRelative(iso: ISODateTime, now: Date = new Date()) {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)

  if (minutes < 1) return "Agora"
  if (minutes < 60) return `${minutes} min atrás`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "hora" : "horas"} atrás`

  const days = Math.round(hours / 24)
  if (days === 1) return "Ontem"
  if (days < 30) return `${days} dias atrás`

  return formatDate(iso)
}

/** Máscara de telefone: "11999991111" -> "(11) 99999-1111". */
export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return raw
}
