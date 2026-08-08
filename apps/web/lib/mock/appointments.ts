import type { Appointment, AppointmentMode, AppointmentStatus, GroupParticipant } from "@assistpro/types"

const now = "2024-05-22T12:00:00.000Z"
const base = { createdAt: now, updatedAt: now, deletedAt: null }

const defaultReminders = {
  sendConfirmationNow: true,
  remind24hBefore: true,
  remind30minBefore: true,
}

/**
 * Datas persistidas em UTC (ver seção 4). O fuso de exibição é America/Sao_Paulo (UTC-3),
 * então 08:00 local corresponde a 11:00 UTC.
 */
function slot(
  id: string,
  isoLocalDate: string,
  localTime: string,
  durationMinutes: number,
  customerId: string,
  customerName: string,
  serviceId: string,
  serviceName: string,
  status: AppointmentStatus,
  mode: AppointmentMode = "PRESENCIAL",
  groupParticipants: GroupParticipant[] | null = null,
): Appointment {
  const [hour, minute] = localTime.split(":").map(Number)
  const start = new Date(`${isoLocalDate}T${localTime}:00.000-03:00`)
  const end = new Date(start.getTime() + durationMinutes * 60000)
  void hour
  void minute

  const isGroup = groupParticipants !== null && groupParticipants.length > 0
  // Token fictício — em produção seria gerado no servidor
  const rescheduleToken = `rsc-${id}`

  return {
    ...base,
    id,
    customerId,
    customerName,
    serviceId,
    serviceName,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    status,
    mode,
    meetingUrl: mode === "ONLINE" ? "https://meet.google.com/abc-defg-hij" : null,
    notes: null,
    reminders: defaultReminders,
    sessionType: isGroup ? "GRUPO" : "INDIVIDUAL",
    groupParticipants: isGroup ? groupParticipants : null,
    rescheduleToken,
    clientPackageId: null,
    wasExtraSession: false,
  }
}

/** Semana de 19 a 25 de maio de 2024, espelhando a grade da agenda. */
export const appointments: Appointment[] = [
  // Segunda 20
  slot("apt-1", "2024-05-20", "08:00", 60, "cus-4", "Ana Paula Lima", "svc-1", "Aula de Tênis", "CONFIRMADO"),
  slot("apt-2", "2024-05-20", "10:00", 60, "cus-7", "Mariana Costa", "svc-2", "Personal", "CANCELADO"),
  // Terça 21
  slot("apt-3", "2024-05-21", "08:00", 60, "cus-1", "João Silva", "svc-2", "Personal", "CONFIRMADO"),
  slot("apt-4", "2024-05-21", "13:00", 60, "cus-6", "Juliana Prado", "svc-3", "Fisioterapia", "AGUARDANDO"),
  // Quarta 22
  slot("apt-5", "2024-05-22", "08:00", 50, "cus-6", "Carla Mendes", "svc-3", "Fisioterapia", "AGUARDANDO"),
  // Aula de Tênis em grupo (4 alunos) — sem cobrança ativa, vai gerar aviso na assistente
  slot(
    "apt-6",
    "2024-05-22",
    "10:00",
    60,
    "cus-2",
    "Pedro Alves",
    "svc-1",
    "Aula de Tênis",
    "CONFIRMADO",
    "PRESENCIAL",
    [
      { customerId: "cus-2", customerName: "Pedro Alves" },
      { customerId: "cus-4", customerName: "Ana Paula Lima" },
      { customerId: "cus-5", customerName: "Bruno Rodrigues" },
      { customerId: "cus-1", customerName: "João Silva" },
    ],
  ),
  // Quinta 23
  slot("apt-7", "2024-05-23", "14:00", 60, "cus-7", "Fernanda Souza", "svc-2", "Personal", "AGUARDANDO"),
  // Sexta 24
  // Aula de Tênis em grupo (2 alunos, ainda com 4 vagas livres)
  slot(
    "apt-8",
    "2024-05-24",
    "09:00",
    60,
    "cus-5",
    "Bruno Rodrigues",
    "svc-1",
    "Aula de Tênis",
    "CONFIRMADO",
    "PRESENCIAL",
    [
      { customerId: "cus-5", customerName: "Bruno Rodrigues" },
      { customerId: "cus-7", customerName: "Mariana Costa" },
    ],
  ),
  slot("apt-9", "2024-05-24", "15:00", 60, "cus-5", "Rafael Lima", "svc-1", "Aula de Tênis", "CONFIRMADO"),
  // Sábado 25
  slot("apt-10", "2024-05-25", "08:00", 60, "cus-5", "Bruno Lima", "svc-1", "Aula de Tênis", "CONFIRMADO"),
  slot("apt-11", "2024-05-25", "16:00", 50, "cus-6", "Camila Rocha", "svc-3", "Fisioterapia", "AGUARDANDO"),
]

/** Atendimentos de hoje (22/05), na ordem exibida no dashboard. */
export const todayAppointments: Appointment[] = [
  slot("today-1", "2024-05-22", "08:00", 60, "cus-4", "Ana Paula", "svc-1", "Aula de Tênis", "CONFIRMADO"),
  slot("today-2", "2024-05-22", "09:00", 60, "cus-1", "João Silva", "svc-2", "Personal", "CONFIRMADO"),
  slot("today-3", "2024-05-22", "10:00", 50, "cus-6", "Carla Mendes", "svc-3", "Fisioterapia", "AGUARDANDO"),
  slot(
    "today-4",
    "2024-05-22",
    "11:00",
    60,
    "cus-5",
    "Bruno Rodrigues",
    "svc-1",
    "Aula de Tênis",
    "CONFIRMADO",
    "PRESENCIAL",
    [
      { customerId: "cus-5", customerName: "Bruno Rodrigues" },
      { customerId: "cus-2", customerName: "Pedro Alves" },
      { customerId: "cus-4", customerName: "Ana Paula Lima" },
    ],
  ),
  slot("today-5", "2024-05-22", "14:00", 60, "cus-7", "Mariana Costa", "svc-2", "Personal", "CANCELADO"),
]

/** Horário livre exibido no fim da lista do dashboard. */
export const freeSlotToday = {
  id: "free-1",
  startsAt: new Date("2024-05-22T15:00:00.000-03:00").toISOString(),
  endsAt: new Date("2024-05-22T16:00:00.000-03:00").toISOString(),
  status: "LIVRE" as const,
  customerName: null,
  serviceName: null,
}

export function appointmentsByCustomer(customerId: string) {
  return appointments.filter((appointment) => appointment.customerId === customerId)
}
