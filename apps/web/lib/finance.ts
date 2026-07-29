import type {
  AsaasChargeResponse,
  Cents,
  Charge,
  CreateChargeInput,
  Customer,
  FinanceFilters,
  FinancePeriod,
  FinanceSummary,
  ISODate,
  OpenCustomerBalance,
  PixChargeInfo,
  RegisterPaymentInput,
} from "@assistpro/types"

/** Data de hoje no formato YYYY-MM-DD, calculada em tempo real. */
export const REFERENCE_TODAY: ISODate = new Date().toISOString().slice(0, 10)

function toISODate(date: Date): ISODate {
  return date.toISOString().slice(0, 10)
}

/** Intervalo fechado [from, to] correspondente ao período escolhido. */
export function periodRange(period: FinancePeriod, today: ISODate = REFERENCE_TODAY) {
  const reference = new Date(`${today}T00:00:00.000Z`)
  const year = reference.getUTCFullYear()
  const month = reference.getUTCMonth()

  if (period === "MES_PASSADO") {
    return {
      from: toISODate(new Date(Date.UTC(year, month - 1, 1))),
      // Dia 0 do mês atual é o último dia do mês anterior.
      to: toISODate(new Date(Date.UTC(year, month, 0))),
    }
  }

  if (period === "ULTIMOS_7_DIAS") {
    return {
      from: toISODate(new Date(reference.getTime() - 6 * 86_400_000)),
      to: today,
    }
  }

  return {
    from: toISODate(new Date(Date.UTC(year, month, 1))),
    to: toISODate(new Date(Date.UTC(year, month + 1, 0))),
  }
}

/**
 * Recorta as cobranças pelo vencimento. `dueDate` é sempre YYYY-MM-DD, então a
 * comparação lexicográfica equivale à cronológica — sem custo de parsing.
 */
export function filterByPeriod(charges: Charge[], period: FinancePeriod, today: ISODate = REFERENCE_TODAY) {
  const { from, to } = periodRange(period, today)

  return charges.filter((charge) => charge.dueDate >= from && charge.dueDate <= to)
}

/** Aplica período e status. Usada na lista; o resumo usa apenas o período. */
export function filterCharges(charges: Charge[], filters: FinanceFilters, today: ISODate = REFERENCE_TODAY) {
  return filterByPeriod(charges, filters.period, today).filter(
    (charge) => filters.status === "TODOS" || charge.status === filters.status,
  )
}

/**
 * Deriva os totais a partir das cobranças, em vez de manter um resumo paralelo.
 * Assim os cards nunca divergem da lista quando um pagamento é registrado.
 */
export function recalculateSummary(charges: Charge[], changeVsPreviousPeriod = 0): FinanceSummary {
  let expected = 0
  let received = 0
  let pending = 0

  for (const charge of charges) {
    // Cobrança cancelada não entra em nenhum total.
    if (charge.status === "CANCELADO") continue

    expected += charge.amount

    if (charge.status === "PAGO") received += charge.amount
    else pending += charge.amount
  }

  return { expected, received, pending, changeVsPreviousPeriod }
}

/** Marca a cobrança como paga, preservando a imutabilidade do array original. */
export function markAsPaid(charges: Charge[], input: RegisterPaymentInput): Charge[] {
  return charges.map((charge) =>
    charge.id === input.chargeId
      ? {
          ...charge,
          status: "PAGO" as const,
          method: input.method,
          paidAt: input.paidAt,
          updatedAt: new Date(`${input.paidAt}T12:00:00.000Z`).toISOString(),
        }
      : charge,
  )
}

/**
 * Monta uma cobrança PIX simulada. O payload imita o formato de um BR Code para
 * validar o fluxo de interface, mas **não é escaneável** e não gera cobrança real —
 * a integração com um PSP fica para uma fase posterior.
 */
export function buildPixPayload(charge: Charge, pixKey: string, today: ISODate = REFERENCE_TODAY): PixChargeInfo {
  const amount = (charge.amount / 100).toFixed(2)
  const expiresAt = new Date(new Date(`${today}T12:00:00.000Z`).getTime() + 30 * 60_000).toISOString()

  return {
    chargeId: charge.id,
    payload: `00020126580014BR.GOV.BCB.PIX0136${pixKey}52040000530398654${amount.length}${amount}5802BR5909ASSISTPRO6009SAO PAULO62${charge.id}6304SIMU`,
    amount: charge.amount,
    expiresAt,
  }
}

/**
 * Converte o texto digitado em centavos. Aceita "120", "120,50" e "R$ 1.200,00".
 * A vírgula é tratada como separador decimal e o ponto como separador de milhar,
 * que é o que o usuário brasileiro digita.
 */
export function parseAmountToCents(text: string): Cents {
  const cleaned = text.replace(/[^\d,.-]/g, "")
  if (!cleaned) return 0

  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned

  const value = Number.parseFloat(normalized)
  if (!Number.isFinite(value) || value < 0) return 0

  return Math.round(value * 100)
}

/** Formata centavos no formato que o input de valor espera ("1200,50"). */
export function centsToAmountInput(amount: Cents): string {
  return (amount / 100).toFixed(2).replace(".", ",")
}

/**
 * Monta a cobrança do lançamento a partir do que o gateway devolveu. A origem
 * é "ATENDIMENTO" quando o lançamento nasceu de um horário da agenda e "AVULSA"
 * quando o profissional criou a cobrança na mão.
 */
export function createCharge(
  input: CreateChargeInput,
  customerName: string,
  response: AsaasChargeResponse,
  today: ISODate = REFERENCE_TODAY,
): Charge {
  const timestamp = new Date(`${today}T12:00:00.000Z`).toISOString()

  return {
    id: `chg-${Math.random().toString(36).slice(2, 10)}`,
    customerId: input.customerId,
    customerName,
    description: input.description,
    dueDate: input.dueDate,
    amount: input.amount,
    status: "PENDENTE",
    method: null,
    paidAt: null,
    billingType: input.billingType,
    origin: input.appointmentId ? "ATENDIMENTO" : "AVULSA",
    invoiceUrl: response.invoiceUrl,
    gatewayId: response.id,
    appointmentId: input.appointmentId ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  }
}

/** Cobrança que ainda gera dinheiro a receber. */
export function isOpen(charge: Charge): boolean {
  return charge.status === "PENDENTE" || charge.status === "ATRASADO"
}

/** Dias corridos de atraso. Zero quando ainda não venceu. */
export function daysLate(dueDate: ISODate, today: ISODate = REFERENCE_TODAY): number {
  const due = new Date(`${dueDate}T00:00:00.000Z`).getTime()
  const reference = new Date(`${today}T00:00:00.000Z`).getTime()
  if (due >= reference) return 0

  return Math.floor((reference - due) / 86_400_000)
}

/**
 * Agrupa tudo que está em aberto por cliente.
 *
 * Recebe a lista COMPLETA de cobranças de propósito: uma dívida de março precisa
 * aparecer mesmo quando o filtro da tela está em "este mês", senão o atraso mais
 * grave é justamente o que fica invisível.
 */
export function openBalancesByCustomer(
  charges: Charge[],
  customers: Customer[],
  today: ISODate = REFERENCE_TODAY,
): OpenCustomerBalance[] {
  const phoneById = new Map(customers.map((customer) => [customer.id, customer.phone]))
  const groups = new Map<string, Charge[]>()

  for (const charge of charges) {
    if (!isOpen(charge)) continue
    const existing = groups.get(charge.customerId)
    if (existing) existing.push(charge)
    else groups.set(charge.customerId, [charge])
  }

  const balances: OpenCustomerBalance[] = []

  for (const [customerId, group] of groups) {
    const sorted = [...group].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    const oldestDueDate = sorted[0].dueDate

    balances.push({
      customerId,
      customerName: sorted[0].customerName,
      phone: phoneById.get(customerId) ?? "",
      totalOpen: sorted.reduce((sum, charge) => sum + charge.amount, 0),
      charges: sorted,
      oldestDueDate,
      daysLate: daysLate(oldestDueDate, today),
      hasOverdue: sorted.some((charge) => charge.status === "ATRASADO" || daysLate(charge.dueDate, today) > 0),
    })
  }

  // Quem deve há mais tempo primeiro; empate resolve pelo maior valor.
  return balances.sort((a, b) => b.daysLate - a.daysLate || b.totalOpen - a.totalOpen)
}

/**
 * Próxima data de disparo da cobrança automática. Em meses sem o dia escolhido
 * (fevereiro com regra "dia 30"), cai no último dia do mês.
 */
export function nextBillingDay(today: ISODate = REFERENCE_TODAY, dayOfMonth = 30): ISODate {
  const reference = new Date(`${today}T00:00:00.000Z`)
  const year = reference.getUTCFullYear()
  const month = reference.getUTCMonth()
  const currentDay = reference.getUTCDate()

  const resolve = (targetYear: number, targetMonth: number) => {
    const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()
    return new Date(Date.UTC(targetYear, targetMonth, Math.min(dayOfMonth, lastDay)))
  }

  const thisMonth = resolve(year, month)
  if (thisMonth.getUTCDate() >= currentDay) return toISODate(thisMonth)

  return toISODate(resolve(year, month + 1))
}

/** Etiqueta curta da origem da cobrança, usada na lista. */
export function chargeOriginLabel(charge: Charge): string {
  return charge.origin === "ATENDIMENTO" ? "Atendimento" : "Avulsa"
}
