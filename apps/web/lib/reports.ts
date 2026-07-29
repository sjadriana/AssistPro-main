import type { Appointment, Cents, Charge, ISODate } from "@assistpro/types"
import { REFERENCE_TODAY } from "./finance"

/** Uma barra do relatório: rótulo, valor bruto e proporção contra o maior valor. */
export interface ReportBar {
  key: string
  label: string
  value: number
  /** 0 a 1, usado direto na largura da barra. */
  ratio: number
}

const monthLabels = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

function withRatio(items: { key: string; label: string; value: number }[]): ReportBar[] {
  const max = Math.max(...items.map((item) => item.value), 0)
  return items.map((item) => ({ ...item, ratio: max === 0 ? 0 : item.value / max }))
}

/** Recebido mês a mês, contando a data de pagamento e não o vencimento. */
export function receivedByMonth(charges: Charge[], months = 6, today: ISODate = REFERENCE_TODAY): ReportBar[] {
  const reference = new Date(`${today}T00:00:00.000Z`)

  const buckets = Array.from({ length: months }, (_, index) => {
    const date = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - (months - 1 - index), 1))
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
    return { key, label: monthLabels[date.getUTCMonth()], value: 0 }
  })

  for (const charge of charges) {
    if (charge.status !== "PAGO" || !charge.paidAt) continue
    const bucket = buckets.find((item) => charge.paidAt?.startsWith(item.key))
    if (bucket) bucket.value += charge.amount
  }

  return withRatio(buckets)
}

/** Receita paga agrupada por origem da cobrança. */
export function receivedByOrigin(charges: Charge[]): ReportBar[] {
  const labels: Record<Charge["origin"], string> = {
    ATENDIMENTO: "Atendimentos",
    AVULSA: "Cobranças avulsas",
  }

  const totals = new Map<string, number>()

  for (const charge of charges) {
    if (charge.status !== "PAGO") continue
    totals.set(charge.origin, (totals.get(charge.origin) ?? 0) + charge.amount)
  }

  return withRatio(
    [...totals.entries()]
      .map(([origin, value]) => ({ key: origin, label: labels[origin as Charge["origin"]], value }))
      .sort((a, b) => b.value - a.value),
  )
}

/** Clientes que mais pagaram, limitado aos primeiros da lista. */
export function topCustomers(charges: Charge[], limit = 5): ReportBar[] {
  const totals = new Map<string, { label: string; value: number }>()

  for (const charge of charges) {
    if (charge.status !== "PAGO") continue
    const current = totals.get(charge.customerId)
    totals.set(charge.customerId, {
      label: charge.customerName,
      value: (current?.value ?? 0) + charge.amount,
    })
  }

  return withRatio(
    [...totals.entries()]
      .map(([customerId, item]) => ({ key: customerId, ...item }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit),
  )
}

/** Volume de atendimentos por serviço, ignorando os cancelados. */
export function appointmentsByService(appointments: Appointment[]): ReportBar[] {
  const totals = new Map<string, { label: string; value: number }>()

  for (const appointment of appointments) {
    if (appointment.status === "CANCELADO" || appointment.status === "LIVRE") continue
    const current = totals.get(appointment.serviceId)
    totals.set(appointment.serviceId, {
      label: appointment.serviceName,
      value: (current?.value ?? 0) + 1,
    })
  }

  return withRatio(
    [...totals.entries()]
      .map(([serviceId, item]) => ({ key: serviceId, ...item }))
      .sort((a, b) => b.value - a.value),
  )
}

export interface AttendanceStats {
  total: number
  completed: number
  cancelled: number
  scheduled: number
  /** Percentual de comparecimento entre os atendimentos já encerrados. */
  completionRate: number
  /** Percentual de cancelamento sobre tudo que foi marcado. */
  cancellationRate: number
}

/** Indicadores de comparecimento — base para cobrar faltas no futuro. */
export function attendanceStats(appointments: Appointment[]): AttendanceStats {
  const relevant = appointments.filter((appointment) => appointment.status !== "LIVRE")
  const completed = relevant.filter((appointment) => appointment.status === "CONCLUIDO").length
  const cancelled = relevant.filter((appointment) => appointment.status === "CANCELADO").length
  const closed = completed + cancelled

  return {
    total: relevant.length,
    completed,
    cancelled,
    scheduled: relevant.length - closed,
    completionRate: closed === 0 ? 0 : Math.round((completed / closed) * 100),
    cancellationRate: relevant.length === 0 ? 0 : Math.round((cancelled / relevant.length) * 100),
  }
}

/** Ticket médio das cobranças pagas. */
export function averageTicket(charges: Charge[]): Cents {
  const paid = charges.filter((charge) => charge.status === "PAGO")
  if (paid.length === 0) return 0
  return Math.round(paid.reduce((total, charge) => total + charge.amount, 0) / paid.length)
}
