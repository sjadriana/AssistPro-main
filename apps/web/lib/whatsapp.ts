import { formatCurrency, formatDate } from "@assistpro/ui"
import type {
  BillingRunRecipient,
  Charge,
  Customer,
  FreeSlot,
  ISODate,
  SendMessageInput,
  WhatsAppMessage,
} from "@assistpro/types"
import { formatSlotLabel } from "./agenda"
import { daysLate, isOpen, REFERENCE_TODAY } from "./finance"

/**
 * Envio de WhatsApp — HOJE SIMULADO.
 *
 * `sendMessage` só registra a mensagem localmente. O envio de verdade acontece
 * pelo `waMeLink`, que abre o WhatsApp do profissional com o texto pronto: dá
 * para usar em produção desde já, sem depender de API oficial.
 *
 * PARA LIGAR A API OFICIAL (Cloud API da Meta ou provedor):
 *   1. Criar uma Route Handler que receba `SendMessageInput`.
 *   2. Guardar `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` no servidor.
 *   3. Trocar o corpo de `sendMessage` por um `fetch` para essa rota.
 *   4. Atualizar `status` a partir dos webhooks de entrega e leitura.
 */
const WHATSAPP_MOCK = true

export const whatsappIsMocked = WHATSAPP_MOCK

/** Substitui as variáveis no formato {{chave}} pelo valor correspondente. */
export function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (match, key: string) => vars[key] ?? match)
}

/** Variáveis disponíveis para uma mensagem de cobrança. */
export function chargeVars(charge: Charge, customerName: string): Record<string, string> {
  const firstName = customerName.split(" ")[0]

  return {
    nome: firstName,
    nome_completo: customerName,
    valor: formatCurrency(charge.amount),
    vencimento: formatDate(charge.dueDate),
    descricao: charge.description,
    link: charge.invoiceUrl ?? "(link será gerado ao emitir a cobrança)",
    dias_atraso: String(daysLate(charge.dueDate)),
  }
}

/** Variáveis de uma cobrança consolidada (várias parcelas do mesmo cliente). */
export function balanceVars(
  customerName: string,
  totalOpen: number,
  oldestDueDate: ISODate,
  link: string | null,
): Record<string, string> {
  return {
    nome: customerName.split(" ")[0],
    nome_completo: customerName,
    valor: formatCurrency(totalOpen),
    vencimento: formatDate(oldestDueDate),
    descricao: "pagamentos em aberto",
    link: link ?? "(link será gerado ao emitir a cobrança)",
    dias_atraso: String(daysLate(oldestDueDate)),
  }
}

/** Variáveis da mensagem de horários livres. */
export function slotsVars(customerName: string, slots: FreeSlot[]): Record<string, string> {
  return {
    nome: customerName.split(" ")[0],
    nome_completo: customerName,
    horarios: slots.map((slot) => `• ${formatSlotLabel(slot)}`).join("\n"),
    quantidade: String(slots.length),
  }
}

/** Mantém só os dígitos e garante o código do país. */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("55")) return digits
  return `55${digits}`
}

/**
 * Link universal do WhatsApp com o texto pré-preenchido. É o caminho de envio
 * real disponível hoje — o profissional confirma e dispara do próprio aparelho.
 */
export function waMeLink(phone: string, body: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(body)}`
}

export async function sendMessage(
  input: SendMessageInput,
  customer: Pick<Customer, "id" | "name" | "phone">,
  today: ISODate = REFERENCE_TODAY,
): Promise<WhatsAppMessage> {
  if (WHATSAPP_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 320))

    return {
      id: `msg-${Math.random().toString(36).slice(2, 10)}`,
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      templateId: input.templateId,
      body: input.body,
      status: "ENVIADO",
      sentAt: new Date(`${today}T12:00:00.000Z`).toISOString(),
      chargeId: input.chargeId ?? null,
      appointmentId: input.appointmentId ?? null,
      failureReason: null,
    }
  }

  throw new Error("Integração real de WhatsApp ainda não configurada.")
}

/**
 * Quem receberia a mensagem na próxima execução da régua de cobrança.
 * Agrupa por cliente para não disparar três mensagens para a mesma pessoa.
 */
export function buildBillingRunPreview(charges: Charge[], customers: Customer[]): BillingRunRecipient[] {
  const phoneById = new Map(customers.map((customer) => [customer.id, customer.phone]))
  const groups = new Map<string, BillingRunRecipient>()

  for (const charge of charges) {
    if (!isOpen(charge)) continue

    const existing = groups.get(charge.customerId)

    if (existing) {
      existing.amount += charge.amount
      existing.chargeIds.push(charge.id)
      if (charge.dueDate < existing.dueDate) existing.dueDate = charge.dueDate
      continue
    }

    groups.set(charge.customerId, {
      customerId: charge.customerId,
      customerName: charge.customerName,
      phone: phoneById.get(charge.customerId) ?? "",
      amount: charge.amount,
      dueDate: charge.dueDate,
      chargeIds: [charge.id],
    })
  }

  return [...groups.values()].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}
