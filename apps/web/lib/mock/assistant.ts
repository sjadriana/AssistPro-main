import type { AssistantEvent, DashboardMetrics, User } from "@assistpro/types"

/**
 * Referência temporal dos dados de demonstração (22/05/2024, 09:00 em São Paulo).
 * Mantém os tempos relativos estáveis entre servidor e cliente.
 */
export const mockNow = new Date("2024-05-22T12:00:00.000Z")

export const currentUser: User = {
  id: "usr-1",
  name: "Adriana Silva",
  email: "adriana@email.com",
  avatarUrl: null,
  role: "OWNER",
  plan: "PROFISSIONAL",
  segment: "TENIS",
  createdAt: "2024-01-10T12:00:00.000Z",
  updatedAt: "2024-05-22T12:00:00.000Z",
}

export const dashboardMetrics: DashboardMetrics = {
  appointmentsToday: 8,
  awaitingConfirmation: 2,
  pendingPayments: 1,
  freeSlots: 3,
  revenueThisMonth: 468000,
}

/** "Sua Assistente informa" — eventos que a IA reporta ao profissional. */
export const assistantEvents: AssistantEvent[] = [
  {
    id: "evt-1",
    kind: "CONFIRMACAO_RECEBIDA",
    message: "João confirmou a aula de hoje às 10:00.",
    detail: "Aula de Tênis",
    createdAt: "2024-05-22T12:00:00.000Z",
    customerId: "cus-1",
    suggestedAction: null,
  },
  {
    id: "evt-2",
    kind: "CANCELAMENTO",
    message: "Maria cancelou o atendimento de amanhã às 14:00.",
    detail: "Personal",
    createdAt: "2024-05-22T11:50:00.000Z",
    customerId: "cus-2",
    suggestedAction: { label: "Oferecer horário", href: "/agenda" },
  },
  {
    id: "evt-3",
    kind: "PAGAMENTO_PENDENTE",
    message: "Carlos ainda não realizou o pagamento da mensalidade.",
    detail: "R$ 240,00",
    createdAt: "2024-05-22T11:00:00.000Z",
    customerId: "cus-3",
    suggestedAction: { label: "Enviar cobrança", href: "/financeiro" },
  },
  {
    id: "evt-4",
    kind: "REAGENDAMENTO_SOLICITADO",
    message: "Fernanda precisa remarcar o atendimento.",
    detail: "Fisioterapia",
    createdAt: "2024-05-22T10:00:00.000Z",
    customerId: "cus-7",
    suggestedAction: { label: "Ver agenda", href: "/agenda" },
  },
  {
    id: "evt-5",
    kind: "CLIENTE_INATIVO",
    message: "Lucas não agenda há 40 dias.",
    detail: "Último atendimento: 15/04",
    createdAt: "2024-05-21T12:00:00.000Z",
    customerId: "cus-8",
    suggestedAction: { label: "Enviar mensagem", href: "/clientes/cus-8" },
  },
]
