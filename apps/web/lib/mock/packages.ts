import type { ClientPackage, PackageSessionLog, PackageTemplate } from "@assistpro/types"

const now = "2024-05-22T12:00:00.000Z"
const base = { createdAt: now, updatedAt: now, deletedAt: null }

// ── Templates cadastrados pelo profissional em Serviços ─────────────────────

export const packageTemplates: PackageTemplate[] = [
  {
    ...base,
    id: "pkg-tpl-1",
    name: "10 aulas de Tênis",
    kind: "PACOTE",
    serviceId: "svc-1",
    serviceName: "Aula de Tênis",
    sessionsPerCycle: 10,
    price: 108000,
    validityDays: 90,
    extraSessionPrice: 13000,
    active: true,
  },
  {
    ...base,
    id: "pkg-tpl-2",
    name: "Mensalidade Personal — 8 sessões/mês",
    kind: "MENSALIDADE",
    serviceId: "svc-2",
    serviceName: "Personal",
    sessionsPerCycle: 8,
    price: 144000,
    validityDays: null,
    extraSessionPrice: 22000,
    active: true,
  },
  {
    ...base,
    id: "pkg-tpl-3",
    name: "5 sessões de Fisioterapia",
    kind: "PACOTE",
    serviceId: "svc-3",
    serviceName: "Fisioterapia",
    sessionsPerCycle: 5,
    price: 85000,
    validityDays: 60,
    extraSessionPrice: null, // cai no preço avulso do serviço (svc-3 = R$ 180)
    active: true,
  },
]

export function packageTemplateById(id: string) {
  return packageTemplates.find((template) => template.id === id) ?? null
}

// ── Pacotes/mensalidades vendidos a clientes ────────────────────────────────

export const clientPackages: ClientPackage[] = [
  // Bruno — pacote de tênis quase esgotado (8 de 10 usadas)
  {
    ...base,
    id: "cpkg-1",
    customerId: "cus-5",
    customerName: "Bruno Rodrigues",
    templateId: "pkg-tpl-1",
    templateName: "10 aulas de Tênis",
    kind: "PACOTE",
    sessionsTotal: 10,
    sessionsUsed: 8,
    price: 108000,
    extraSessionPrice: 13000,
    purchasedAt: "2024-04-10T12:00:00.000Z",
    expiresAt: "2024-07-09T12:00:00.000Z",
    status: "ATIVO",
    renewsMonthly: false,
  },
  // João — mensalidade de personal, dentro do ciclo (3 de 8 usadas)
  {
    ...base,
    id: "cpkg-2",
    customerId: "cus-1",
    customerName: "João Silva",
    templateId: "pkg-tpl-2",
    templateName: "Mensalidade Personal — 8 sessões/mês",
    kind: "MENSALIDADE",
    sessionsTotal: 8,
    sessionsUsed: 3,
    price: 144000,
    extraSessionPrice: 22000,
    purchasedAt: "2024-05-01T12:00:00.000Z",
    expiresAt: "2024-06-01T12:00:00.000Z",
    status: "ATIVO",
    renewsMonthly: true,
  },
  // Carla — pacote de fisioterapia esgotado, já gerou sessão extra
  {
    ...base,
    id: "cpkg-3",
    customerId: "cus-6",
    customerName: "Carla Mendes",
    templateId: "pkg-tpl-3",
    templateName: "5 sessões de Fisioterapia",
    kind: "PACOTE",
    sessionsTotal: 5,
    sessionsUsed: 5,
    price: 85000,
    extraSessionPrice: null,
    purchasedAt: "2024-03-15T12:00:00.000Z",
    expiresAt: "2024-05-14T12:00:00.000Z",
    status: "ESGOTADO",
    renewsMonthly: false,
  },
  // Lucas — pacote de tênis expirado (não usado há tempo)
  {
    ...base,
    id: "cpkg-4",
    customerId: "cus-8",
    customerName: "Lucas Ferreira",
    templateId: "pkg-tpl-1",
    templateName: "10 aulas de Tênis",
    kind: "PACOTE",
    sessionsTotal: 10,
    sessionsUsed: 4,
    price: 108000,
    extraSessionPrice: 13000,
    purchasedAt: "2024-01-20T12:00:00.000Z",
    expiresAt: "2024-04-19T12:00:00.000Z",
    status: "EXPIRADO",
    renewsMonthly: false,
  },
]

export function clientPackagesByCustomer(customerId: string) {
  return clientPackages.filter((pkg) => pkg.customerId === customerId)
}

/** Retorna o pacote ativo e não expirado do cliente compatível com o serviço, se houver. */
export function activePackageForService(customerId: string, serviceId: string) {
  const template = packageTemplates.find((t) => t.serviceId === serviceId)
  if (!template) return null
  return (
    clientPackages.find(
      (pkg) =>
        pkg.customerId === customerId &&
        pkg.templateId === template.id &&
        pkg.status === "ATIVO",
    ) ?? null
  )
}

// ── Histórico de consumo ────────────────────────────────────────────────────

export const packageSessionLogs: PackageSessionLog[] = [
  {
    id: "psl-1",
    clientPackageId: "cpkg-1",
    appointmentId: "apt-9",
    consumedAt: "2024-05-15T14:00:00.000Z",
    wasExtra: false,
    extraChargeId: null,
  },
  {
    id: "psl-2",
    clientPackageId: "cpkg-3",
    appointmentId: "apt-5",
    consumedAt: "2024-05-15T11:00:00.000Z",
    wasExtra: true,
    extraChargeId: "chg-extra-1",
  },
]

export function sessionLogsByPackage(clientPackageId: string) {
  return packageSessionLogs.filter((log) => log.clientPackageId === clientPackageId)
}
