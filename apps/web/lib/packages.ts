import type { Appointment, Charge, ClientPackage, ClientPackageStatus } from "@assistpro/types"
import { charges } from "@/lib/mock/finance"
import { activePackageForService, packageSessionLogs, packageTemplateById } from "@/lib/mock/packages"
import { serviceById } from "@/lib/mock/services"

/**
 * Recalcula o status de exibição do pacote levando em conta validade e saldo.
 * O campo `status` do mock é o ponto de partida, mas consumo em runtime
 * (sessionsUsed subindo) precisa refletir na tela sem esperar um "job".
 */
export function packageStatusNow(pkg: ClientPackage): ClientPackageStatus {
  if (pkg.status === "CANCELADO") return "CANCELADO"
  if (pkg.expiresAt && new Date(pkg.expiresAt) < new Date() && !pkg.renewsMonthly) return "EXPIRADO"
  if (!pkg.renewsMonthly && pkg.sessionsUsed >= pkg.sessionsTotal) return "ESGOTADO"
  return "ATIVO"
}

export interface ConsumeResult {
  kind: "no-package" | "consumed" | "extra"
  /** Saldo restante após o consumo (só quando kind === "consumed"). */
  remaining?: number
  /** Valor cobrado como sessão extra, em centavos (só quando kind === "extra"). */
  extraAmount?: number
  /** Cobrança criada para a sessão extra. */
  extraCharge?: Charge
}

/**
 * Consome 1 sessão do pacote/mensalidade ativo do cliente para o serviço do
 * atendimento, chamado quando o status do agendamento muda para CONCLUIDO.
 *
 * Regra: se não houver saldo, a sessão NUNCA fica sem cobrança — gera uma
 * Charge avulsa automaticamente (sessão extra) em vez de bloquear.
 */
export function consumeSessionForAppointment(appointment: Appointment): ConsumeResult {
  const pkg = activePackageForService(appointment.customerId, appointment.serviceId)

  if (!pkg || packageStatusNow(pkg) !== "ATIVO") {
    return { kind: "no-package" }
  }

  const hasBalance = pkg.sessionsUsed < pkg.sessionsTotal

  if (hasBalance) {
    pkg.sessionsUsed += 1
    pkg.updatedAt = new Date().toISOString()

    packageSessionLogs.push({
      id: `psl-${crypto.randomUUID()}`,
      clientPackageId: pkg.id,
      appointmentId: appointment.id,
      consumedAt: new Date().toISOString(),
      wasExtra: false,
      extraChargeId: null,
    })

    return { kind: "consumed", remaining: pkg.sessionsTotal - pkg.sessionsUsed }
  }

  // Saldo esgotado: gera cobrança extra automática, nunca deixa a sessão sem cobrança.
  const template = packageTemplateById(pkg.templateId)
  const fallbackPrice = serviceById(appointment.serviceId)?.price ?? 0
  const extraAmount = pkg.extraSessionPrice ?? template?.extraSessionPrice ?? fallbackPrice

  const extraCharge: Charge = {
    id: `chg-extra-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    customerId: appointment.customerId,
    customerName: appointment.customerName,
    description: `${appointment.serviceName} — sessão extra (pacote esgotado)`,
    dueDate: new Date().toISOString().slice(0, 10),
    amount: extraAmount,
    status: "PENDENTE",
    method: null,
    paidAt: null,
    billingType: "PIX",
    origin: "ATENDIMENTO",
    invoiceUrl: null,
    gatewayId: null,
    appointmentId: appointment.id,
  }

  charges.push(extraCharge)

  packageSessionLogs.push({
    id: `psl-${crypto.randomUUID()}`,
    clientPackageId: pkg.id,
    appointmentId: appointment.id,
    consumedAt: new Date().toISOString(),
    wasExtra: true,
    extraChargeId: extraCharge.id,
  })

  return { kind: "extra", extraAmount, extraCharge }
}
