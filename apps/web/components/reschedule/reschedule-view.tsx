"use client"

import { displayParts } from "@/lib/agenda"
import { appointments } from "@/lib/mock/appointments"
import { businessHours, services } from "@/lib/mock/services"
import type { Appointment } from "@assistpro/types"
import { CalendarCheck, CalendarClock, CheckCircle2, Users, User } from "lucide-react"
import { useMemo, useState } from "react"

/** Referência "hoje" do protótipo. */
const DEMO_NOW = "2024-05-22T12:00:00.000Z"
/** Quantos dias à frente exibir. */
const LOOKAHEAD_DAYS = 14

/**
 * Resolve o agendamento original a partir do token fictício.
 * Em produção: busca na API com o token JWT opaco.
 */
function resolveAppointment(token: string): Appointment | null {
  // token = "rsc-apt-{id}" — padrão definido no mock
  const id = token.replace("rsc-", "")
  return appointments.find((a) => a.id === id) ?? null
}

/**
 * Retorna horários de grupo (do mesmo serviço) que ainda têm vagas disponíveis
 * nos próximos LOOKAHEAD_DAYS dias a partir de DEMO_NOW.
 * O cliente só pode entrar em sessões do mesmo serviço que ele tinha.
 */
function groupSlotsWithVacancy(serviceId: string, excludeAppointmentId: string) {
  const service = services.find((s) => s.id === serviceId)
  if (!service || !service.maxGroupSize) return []

  const nowDate = DEMO_NOW.slice(0, 10)
  const [y, mo, d] = nowDate.split("-").map(Number)

  // Gera próximas LOOKAHEAD_DAYS datas
  const futureDates = Array.from({ length: LOOKAHEAD_DAYS }, (_, i) => {
    const dt = new Date(Date.UTC(y, mo - 1, d + i + 1))
    return dt.toISOString().slice(0, 10)
  })

  // Sessões de grupo deste serviço que estão em datas futuras
  return appointments
    .filter(
      (a) =>
        a.id !== excludeAppointmentId &&
        a.serviceId === serviceId &&
        a.sessionType === "GRUPO" &&
        a.status !== "CANCELADO" &&
        futureDates.includes(displayParts(a.startsAt).date),
    )
    .filter((a) => {
      const current = (a.groupParticipants ?? []).length
      return current < service.maxGroupSize!
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

/**
 * Retorna horários individuais futuros disponíveis do mesmo serviço
 * (apenas se o serviço não for exclusivamente em grupo).
 */
function individualSlotsAvailable(serviceId: string, excludeAppointmentId: string) {
  const service = services.find((s) => s.id === serviceId)
  if (!service) return []

  const nowDate = DEMO_NOW.slice(0, 10)
  const [y, mo, d] = nowDate.split("-").map(Number)

  const futureDates = Array.from({ length: LOOKAHEAD_DAYS }, (_, i) => {
    const dt = new Date(Date.UTC(y, mo - 1, d + i + 1))
    return dt.toISOString().slice(0, 10)
  })

  // Para simplicidade do protótipo, exibimos horários futuros livres que não
  // estejam bloqueados por outro atendimento no mesmo horário
  const busyTimes = appointments
    .filter((a) => a.id !== excludeAppointmentId && a.status !== "CANCELADO")
    .map((a) => a.startsAt)

  const { weekday: _weekday, ..._ } = businessHours[0]
  void _weekday
  void _

  // Gera slots de hora em hora baseados no horário comercial
  const available: { date: string; startsAt: string; endsAt: string }[] = []

  for (const date of futureDates.slice(0, 7)) {
    const [dy, dm, dd] = date.split("-").map(Number)
    const dow = new Date(Date.UTC(dy, dm - 1, dd)).getUTCDay()
    const dowKeys = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"] as const
    const bh = businessHours.find((h) => h.weekday === dowKeys[dow])
    if (!bh?.enabled) continue

    const [fromH] = bh.from.split(":").map(Number)
    const [toH] = bh.to.split(":").map(Number)

    for (let hour = fromH; hour < toH; hour++) {
      const startsAt = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00.000-03:00`).toISOString()
      const endsAt = new Date(`${date}T${String(hour + 1).padStart(2, "0")}:00:00.000-03:00`).toISOString()
      if (!busyTimes.includes(startsAt)) {
        available.push({ date, startsAt, endsAt })
      }
    }
  }

  return available
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso))
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

interface Props {
  token: string
}

type Step = "escolher" | "confirmado"

export function RescheduleView({ token }: Props) {
  const appointment = useMemo(() => resolveAppointment(token), [token])

  const groupSlots = useMemo(
    () => (appointment ? groupSlotsWithVacancy(appointment.serviceId, appointment.id) : []),
    [appointment],
  )

  const individualSlots = useMemo(
    () => (appointment ? individualSlotsAvailable(appointment.serviceId, appointment.id) : []),
    [appointment],
  )

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedIndividual, setSelectedIndividual] = useState<string | null>(null)
  const [step, setStep] = useState<Step>("escolher")

  const service = appointment ? services.find((s) => s.id === appointment.serviceId) : null

  function handleConfirm() {
    if (!selectedGroupId && !selectedIndividual) return
    setStep("confirmado")
  }

  // ── Token inválido ────────────────────────────────────────────────────────
  if (!appointment) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-danger-soft">
            <CalendarClock className="size-7 text-danger-strong" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold text-foreground">Link inválido ou expirado</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Este link de reagendamento não foi encontrado. Solicite um novo link pelo WhatsApp.
          </p>
        </div>
      </main>
    )
  }

  // ── Confirmado ────────────────────────────────────────────────────────────
  if (step === "confirmado") {
    const chosenGroup = groupSlots.find((a) => a.id === selectedGroupId)
    const chosenTime = selectedIndividual

    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="flex max-w-md w-full flex-col items-center gap-6 text-center">
          <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-success-soft">
            <CheckCircle2 className="size-8 text-success-strong" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-foreground">Reagendamento confirmado!</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Você receberá uma confirmação pelo WhatsApp em breve.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-border bg-card p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Novo horário
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {chosenGroup ? (
                  <Users className="size-4 shrink-0 text-primary" aria-hidden="true" />
                ) : (
                  <User className="size-4 shrink-0 text-primary" aria-hidden="true" />
                )}
                <span className="text-sm font-semibold text-card-foreground">
                  {chosenGroup
                    ? formatDateTime(chosenGroup.startsAt)
                    : chosenTime
                      ? chosenTime
                      : "—"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground pl-6">{service?.name}</span>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Escolher novo horário ─────────────────────────────────────────────────
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Reagendamento
        </p>
        <h1 className="text-2xl font-bold text-foreground">Escolha um novo horário</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Olá, {appointment.customerName}! Selecione abaixo quando prefere remarcar{" "}
          <strong className="text-foreground">{service?.name}</strong>.
        </p>
      </div>

      {/* Horário atual */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Horário atual
        </p>
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm text-card-foreground first-letter:uppercase">
            {formatDateTime(appointment.startsAt)}
          </span>
        </div>
      </div>

      {/* Sessões de grupo com vagas disponíveis */}
      {groupSlots.length > 0 ? (
        <section aria-label="Sessões em grupo disponíveis">
          <div className="mb-3 flex items-center gap-2">
            <Users className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">Sessões em grupo com vagas</h2>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Entre em uma sessão coletiva do mesmo serviço que já tem outros participantes.
          </p>

          <ul className="flex flex-col gap-2">
            {groupSlots.map((slot) => {
              const participantCount = (slot.groupParticipants ?? []).length
              const maxSize = service?.maxGroupSize ?? 1
              const vacancies = maxSize - participantCount
              const isSelected = selectedGroupId === slot.id

              return (
                <li key={slot.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroupId(isSelected ? null : slot.id)
                      setSelectedIndividual(null)
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-card-foreground first-letter:uppercase">
                          {formatDate(slot.startsAt)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success-strong">
                          <Users className="size-3" aria-hidden="true" />
                          {participantCount}/{maxSize}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {vacancies} {vacancies === 1 ? "vaga" : "vagas"}
                        </span>
                      </div>
                    </div>

                    {/* Participantes atuais */}
                    {slot.groupParticipants && slot.groupParticipants.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {slot.groupParticipants.map((p) => (
                          <span
                            key={p.customerId}
                            className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            <User className="size-3" aria-hidden="true" />
                            {p.customerName.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <div className="rounded-2xl border border-border bg-secondary px-4 py-5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <Users className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-semibold text-foreground">Sem sessões em grupo disponíveis</span>
          </div>
          <p className="text-xs">
            Não há sessões coletivas de {service?.name} com vagas nos próximos {LOOKAHEAD_DAYS} dias.
            {individualSlots.length > 0
              ? " Você pode agendar um horário individual abaixo."
              : " Entre em contato para verificar disponibilidade."}
          </p>
        </div>
      )}

      {/* Separador */}
      {groupSlots.length > 0 && individualSlots.length > 0 ? (
        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou horário individual</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      ) : null}

      {/* Horários individuais disponíveis */}
      {individualSlots.length > 0 ? (
        <section aria-label="Horários individuais disponíveis">
          <div className="mb-3 flex items-center gap-2">
            <User className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">Horários individuais</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {individualSlots.slice(0, 12).map((slot) => {
              const label = `${formatDate(slot.startsAt)} · ${formatTime(slot.startsAt)}`
              const isSelected = selectedIndividual === label

              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => {
                    setSelectedIndividual(isSelected ? null : label)
                    setSelectedGroupId(null)
                  }}
                  aria-pressed={isSelected}
                  className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-card-foreground hover:border-primary/40 hover:bg-secondary"
                  }`}
                >
                  {formatDate(slot.startsAt)} · {formatTime(slot.startsAt)}
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Botão de confirmar */}
      <div className="sticky bottom-4">
        <button
          type="button"
          disabled={!selectedGroupId && !selectedIndividual}
          onClick={handleConfirm}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CalendarCheck className="size-4" aria-hidden="true" />
          Confirmar reagendamento
        </button>
      </div>
    </main>
  )
}
