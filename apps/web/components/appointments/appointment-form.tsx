"use client"

import { availableTimesForDate, isDateInPastOrToday } from "@/lib/agenda"
import { appointments } from "@/lib/mock/appointments"
import { blockedSlots } from "@/lib/mock/blocked-slots"
import { customers } from "@/lib/mock/customers"
import { businessHours, services } from "@/lib/mock/services"
import type { AppointmentMode, AppointmentRecurrence, GroupParticipant } from "@assistpro/types"
import { Card, CardBody, CardHeader, cn, Field, Input, RadioCard, Select, Textarea } from "@assistpro/ui"
import { CalendarCheck, Home, MapPin, Pencil, Plus, RefreshCcw, Users, User, Video, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

/** Data de referência "hoje" para este protótipo. */
const TODAY = new Date().toISOString().slice(0, 10)
const NOW_ISO = new Date().toISOString()
const DEFAULT_MEETING_URL = "https://meet.google.com/abc-defg-hij"

const modes: { value: AppointmentMode; label: string; icon: typeof Video }[] = [
  { value: "PRESENCIAL", label: "Presencial", icon: MapPin },
  { value: "ONLINE", label: "Online", icon: Video },
  { value: "DOMICILIAR", label: "Domiciliar", icon: Home },
]

const recurrenceOptions: { value: AppointmentRecurrence; label: string }[] = [
  { value: "SEMANAL", label: "Toda semana" },
  { value: "QUINZENAL", label: "A cada 15 dias" },
  { value: "MENSAL", label: "Todo mês" },
]

export function AppointmentForm() {
  const router = useRouter()

  // ── Modo de sessão ──────────────────────────────────────────────────────────
  const [sessionType, setSessionType] = useState<"INDIVIDUAL" | "GRUPO">("INDIVIDUAL")

  // ── Individual ──────────────────────────────────────────────────────────────
  const [customerId, setCustomerId] = useState(customers[0].id)

  // ── Grupo ───────────────────────────────────────────────────────────────────
  const [groupParticipants, setGroupParticipants] = useState<GroupParticipant[]>([])
  const [participantSelectValue, setParticipantSelectValue] = useState("")

  // ── Serviço ─────────────────────────────────────────────────────────────────
  const [serviceId, setServiceId] = useState(services.filter((s) => s.durationMinutes > 0)[0].id)

  const service = services.find((s) => s.id === serviceId)
  const durationMins = service?.durationMinutes ?? 60
  const maxGroupSize = service?.maxGroupSize ?? null
  // O tipo de sessão é definido pelo serviço: se tem maxGroupSize é grupo, senão individual
  const serviceSessionType: "INDIVIDUAL" | "GRUPO" = maxGroupSize ? "GRUPO" : "INDIVIDUAL"

  // ── Modo de atendimento ─────────────────────────────────────────────────────
  const [mode, setMode] = useState<AppointmentMode>("PRESENCIAL")
  const [useDefaultLink, setUseDefaultLink] = useState(true)
  const [meetingUrl, setMeetingUrl] = useState("")
  const DEFAULT_ADDRESS = "Rua das Flores, 123 — São Paulo, SP"
  const [useDefaultAddress, setUseDefaultAddress] = useState(true)
  const [customAddress, setCustomAddress] = useState("")

  // ── Observações ─────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState("")

  // ── Lembretes ───────────────────────────────────────────────────────────────
  const [sendConfirmationNow, setSendConfirmationNow] = useState(true)
  const [remind24h, setRemind24h] = useState(true)
  const [remind30min, setRemind30min] = useState(true)

  // ── Datas ───────────────────────────────────────────────────────────────────
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [dateInputValue, setDateInputValue] = useState("")
  const [startTime, setStartTime] = useState("")

  // ── Recorrência ─────────────────────────────────────────────────────────────
  const [recurring, setRecurring] = useState(false)
  const [recurrence, setRecurrence] = useState<AppointmentRecurrence>("SEMANAL")

  // ── Horários disponíveis ────────────────────────────────────────────────────
  const availableTimes = useMemo(() => {
    const date = selectedDates[0]
    if (!date) return []
    return availableTimesForDate(date, appointments, blockedSlots, businessHours, durationMins, NOW_ISO)
  }, [selectedDates, durationMins])

  // ── Helpers: datas ──────────────────────────────────────────────────────────
  function isUnavailableDate(date: string) {
    return isDateInPastOrToday(date, TODAY)
  }

  function handleAddDate() {
    const value = dateInputValue.trim()
    if (!value) return
    if (isUnavailableDate(value)) return
    if (selectedDates.includes(value)) return
    const newDates = [...selectedDates, value].sort()
    setSelectedDates(newDates)
    setDateInputValue("")
    if (selectedDates.length === 0) setStartTime("")
    // Limpa o erro de data ao adicionar a primeira
    if (errors.date) setErrors((prev) => { const n = { ...prev }; delete n.date; return n })
  }

  function removeDate(date: string) {
    setSelectedDates((prev) => {
      const next = prev.filter((d) => d !== date)
      if (next.length === 0) setStartTime("")
      return next
    })
  }

  // ── Helpers: participantes ──────────────────────────────────────────────────
  function addParticipant(cId: string) {
    if (!cId) return
    if (groupParticipants.some((p) => p.customerId === cId)) return
    if (maxGroupSize !== null && groupParticipants.length >= maxGroupSize) return
    const customer = customers.find((c) => c.id === cId)
    if (!customer) return
    setGroupParticipants((prev) => [...prev, { customerId: cId, customerName: customer.name }])
    setParticipantSelectValue("")
    if (errors.participants) setErrors((prev) => { const n = { ...prev }; delete n.participants; return n })
  }

  function removeParticipant(cId: string) {
    setGroupParticipants((prev) => prev.filter((p) => p.customerId !== cId))
  }

  // Clientes ainda não adicionados ao grupo
  const availableCustomers = customers.filter(
    (c) => !groupParticipants.some((p) => p.customerId === c.id),
  )

  const groupIsFull = maxGroupSize !== null && groupParticipants.length >= maxGroupSize

  // ── Erros de validação ──────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Submit ──────────────────────────────────────────────────────────────────
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const nextErrors: Record<string, string> = {}

    if (serviceSessionType === "GRUPO" && groupParticipants.length < 2) {
      nextErrors.participants = "Adicione pelo menos 2 participantes para salvar."
    }
    if (selectedDates.length === 0) {
      nextErrors.date = "Selecione pelo menos uma data."
    }
    if (selectedDates.length > 0 && startTime === "") {
      nextErrors.time = "Selecione um horário disponível."
    }
    if (selectedDates.length > 0 && startTime !== "" && !availableTimes.includes(startTime)) {
      nextErrors.time = "Este horário não está mais disponível. Escolha outro."
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      // Rolar até o primeiro campo com erro
      const firstKey = Object.keys(nextErrors)[0]
      const el = document.getElementById(`error-${firstKey}`)
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    router.push("/agenda")
  }

  function formatDateLabel(isoDate: string) {
    const [year, month, day] = isoDate.split("-").map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
    }).format(date)
  }

  // Todos os serviços com duração aparecem; o tipo de sessão é derivado do serviço escolhido
  const availableServices = services.filter((s) => s.durationMinutes > 0)

  // Ao trocar de serviço, resetar participantes e horário pois o tipo pode mudar
  function handleServiceChange(nextServiceId: string) {
    const nextService = services.find((s) => s.id === nextServiceId)
    const nextIsGroup = !!nextService?.maxGroupSize
    setServiceId(nextServiceId)
    setStartTime("")
    if (!nextIsGroup) {
      setGroupParticipants([])
      setParticipantSelectValue("")
    }
    // Sincroniza sessionType interno para compatibilidade com submit
    setSessionType(nextIsGroup ? "GRUPO" : "INDIVIDUAL")
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      {/* ── Tipo de sessão (derivado do serviço) ───────────────────────────── */}
      {/* Exibido apenas como leitura; quem define o tipo é o serviço configurado */}

      {/* ── Detalhes ───────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Detalhes" />
        <CardBody className="flex flex-col gap-4">
          {/* Serviço */}
          <Field label="Serviço" htmlFor="service">
            <div className="flex flex-col gap-2">
              <Select
                id="service"
                value={serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
              >
                {availableServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.maxGroupSize
                      ? ` · Grupo (até ${s.maxGroupSize})`
                      : " · Individual"}
                    {" · "}{s.durationMinutes < 60 ? `${s.durationMinutes}min` : `${s.durationMinutes / 60}h`}
                  </option>
                ))}
              </Select>
              {/* Indicador visual do tipo de sessão derivado */}
              <div
                className={cn(
                  "inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
                  serviceSessionType === "GRUPO"
                    ? "bg-primary-soft text-accent-foreground"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {serviceSessionType === "GRUPO" ? (
                  <>
                    <Users className="size-3" aria-hidden="true" />
                    Sessão em grupo · até {maxGroupSize} participantes
                  </>
                ) : (
                  <>
                    <User className="size-3" aria-hidden="true" />
                    Sessão individual
                  </>
                )}
              </div>
            </div>
          </Field>

          {/* ── Individual: seleciona um cliente ─────────────────────────── */}
          {serviceSessionType === "INDIVIDUAL" ? (
            <Field label="Cliente" htmlFor="customer">
              <div className="flex items-center gap-2">
                <Select
                  id="customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="flex-1"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                <Link
                  href="/clientes/novo"
                  className="inline-flex size-10.5 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  <span className="sr-only">Cadastrar novo cliente</span>
                </Link>
              </div>
            </Field>
          ) : null}

          {/* ── Grupo: adiciona múltiplos clientes ───────────────────────── */}
          {serviceSessionType === "GRUPO" ? (
            <div className="flex flex-col gap-3">
              {/* Contador de vagas */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Participantes</span>
                {maxGroupSize !== null ? (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      groupIsFull
                        ? "bg-danger-soft text-danger-strong"
                        : "bg-primary-soft text-accent-foreground",
                    )}
                  >
                    {groupParticipants.length}/{maxGroupSize}
                  </span>
                ) : null}
              </div>

              {/* Chips dos participantes */}
              {groupParticipants.length > 0 ? (
                <div className="flex flex-wrap gap-2" role="list" aria-label="Participantes do grupo">
                  {groupParticipants.map((p) => (
                    <span
                      key={p.customerId}
                      role="listitem"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-soft px-2.5 py-1 text-xs font-semibold text-accent-foreground"
                    >
                      <User className="size-3 shrink-0" aria-hidden="true" />
                      {p.customerName}
                      <button
                        type="button"
                        onClick={() => removeParticipant(p.customerId)}
                        className="ml-0.5 rounded-sm text-accent-foreground/60 hover:text-accent-foreground"
                        aria-label={`Remover ${p.customerName}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhum participante adicionado ainda.</p>
              )}

              {/* Adicionar participante */}
              {!groupIsFull ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={participantSelectValue}
                    onChange={(e) => setParticipantSelectValue(e.target.value)}
                    className="flex-1"
                    aria-label="Selecionar participante"
                  >
                    <option value="">Selecionar cliente...</option>
                    {availableCustomers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                  <button
                    type="button"
                    onClick={() => addParticipant(participantSelectValue)}
                    disabled={!participantSelectValue}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Adicionar
                  </button>
                </div>
              ) : (
                <p className="rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground">
                  Grupo completo ({maxGroupSize} participantes).
                </p>
              )}

              {errors.participants ? (
                <p id="error-participants" role="alert" className="text-xs font-medium text-danger-strong">
                  {errors.participants}
                </p>
              ) : null}
            </div>
          ) : null}
        </CardBody>
      </Card>

      {/* ── Datas e horário ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Datas e horário"
          description="Selecione uma ou mais datas futuras. O horário é filtrado conforme a disponibilidade."
        />
        <CardBody className="flex flex-col gap-4">
          <Field label="Adicionar data" htmlFor="date-input">
            <div className="flex items-center gap-2">
              <Input
                id="date-input"
                type="date"
                value={dateInputValue}
                min={(() => {
                  const [y, mo, d] = TODAY.split("-").map(Number)
                  const tomorrow = new Date(Date.UTC(y, mo - 1, d + 1))
                  return tomorrow.toISOString().slice(0, 10)
                })()}
                onChange={(e) => setDateInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    handleAddDate()
                  }
                }}
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleAddDate}
                disabled={
                  !dateInputValue ||
                  isUnavailableDate(dateInputValue) ||
                  selectedDates.includes(dateInputValue)
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-4" aria-hidden="true" />
                Adicionar
              </button>
            </div>
          </Field>

          {errors.date ? (
            <p id="error-date" role="alert" className="text-xs font-medium text-danger-strong">
              {errors.date}
            </p>
          ) : null}

          {selectedDates.length > 0 ? (
            <div className="flex flex-wrap gap-2" role="list" aria-label="Datas selecionadas">
              {selectedDates.map((date) => (
                <span
                  key={date}
                  role="listitem"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-soft px-2.5 py-1 text-xs font-semibold text-accent-foreground"
                >
                  <CalendarCheck className="size-3 shrink-0" aria-hidden="true" />
                  {formatDateLabel(date)}
                  <button
                    type="button"
                    onClick={() => removeDate(date)}
                    className="ml-0.5 rounded-sm text-accent-foreground/60 hover:text-accent-foreground"
                    aria-label={`Remover ${date}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhuma data selecionada ainda.</p>
          )}

          {selectedDates.length > 0 ? (
            <Field
              label={`Horário disponível para ${formatDateLabel(selectedDates[0])}`}
              htmlFor="start-time"
            >
              {availableTimes.length === 0 ? (
                <p className="rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground">
                  Nenhum horário livre nesta data.
                </p>
              ) : (
                <>
                  <Select
                    id="start-time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value)
                      if (errors.time) setErrors((prev) => { const n = { ...prev }; delete n.time; return n })
                    }}
                    aria-describedby={errors.time ? "error-time" : undefined}
                    className={errors.time ? "border-danger-strong" : ""}
                  >
                    <option value="">Selecionar horário</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </Select>
                  {errors.time ? (
                    <p id="error-time" role="alert" className="text-xs font-medium text-danger-strong">
                      {errors.time}
                    </p>
                  ) : null}
                </>
              )}
            </Field>
          ) : null}
        </CardBody>
      </Card>

      {/* ── Recorrência ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Recorrência" description="Repete este atendimento automaticamente." />
        <CardBody className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <RefreshCcw className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Ativar recorrência
            </span>
          </label>

          {recurring ? (
            <Field label="Frequência" htmlFor="recurrence">
              <Select
                id="recurrence"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as AppointmentRecurrence)}
              >
                {recurrenceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </Field>
          ) : null}
        </CardBody>
      </Card>

      {/* ── Tipo de atendimento ────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Tipo de atendimento" />
        <CardBody className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Tipo de atendimento</legend>
            <div className="grid grid-cols-3 gap-2">
              {modes.map((item) => {
                const Icon = item.icon
                return (
                  <RadioCard
                    key={item.value}
                    name="mode"
                    value={item.value}
                    label={item.label}
                    checked={mode === item.value}
                    onChange={() => setMode(item.value)}
                    icon={<Icon className="size-4" aria-hidden="true" />}
                  />
                )
              })}
            </div>
          </fieldset>

          {(mode === "PRESENCIAL" || mode === "DOMICILIAR") ? (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-medium text-foreground">
                {mode === "PRESENCIAL" ? "Endereço do atendimento" : "Endereço do domicílio"}
              </legend>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="radio"
                  name="addressOption"
                  checked={useDefaultAddress}
                  onChange={() => setUseDefaultAddress(true)}
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
                <span className="flex flex-1 flex-col gap-2">
                  <span className="text-sm text-foreground">Usar endereço padrão</span>
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2.5",
                      !useDefaultAddress && "opacity-50",
                    )}
                  >
                    <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {DEFAULT_ADDRESS}
                    </span>
                    <Pencil className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="radio"
                  name="addressOption"
                  checked={!useDefaultAddress}
                  onChange={() => setUseDefaultAddress(false)}
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
                <span className="flex flex-1 flex-col gap-2">
                  <span className="text-sm text-foreground">Inserir outro endereço</span>
                  <Input
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="Digite o endereço completo"
                    disabled={useDefaultAddress}
                    aria-label="Endereço do atendimento"
                  />
                </span>
              </label>
            </fieldset>
          ) : null}

          {mode === "ONLINE" ? (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-medium text-foreground">Link da reunião</legend>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="radio"
                  name="linkOption"
                  checked={useDefaultLink}
                  onChange={() => setUseDefaultLink(true)}
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
                <span className="flex flex-1 flex-col gap-2">
                  <span className="text-sm text-foreground">Usar link padrão</span>
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2.5",
                      !useDefaultLink && "opacity-50",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {DEFAULT_MEETING_URL}
                    </span>
                    <Pencil className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="radio"
                  name="linkOption"
                  checked={!useDefaultLink}
                  onChange={() => setUseDefaultLink(false)}
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
                <span className="flex flex-1 flex-col gap-2">
                  <span className="text-sm text-foreground">Inserir outro link</span>
                  <Input
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="Cole o link da reunião"
                    disabled={useDefaultLink}
                    aria-label="Link da reunião"
                  />
                </span>
              </label>
            </fieldset>
          ) : null}
        </CardBody>
      </Card>

      {/* ── Lembretes ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Lembretes e confirmações"
          description="Sempre que um horário é salvo, o WhatsApp é enviado automaticamente com opção de confirmar, cancelar ou reagendar."
        />
        <CardBody className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={sendConfirmationNow}
              onChange={(e) => setSendConfirmationNow(e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            <span className="text-sm text-foreground">Enviar confirmação agora por WhatsApp</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={remind24h}
              onChange={(e) => setRemind24h(e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            <span className="text-sm text-foreground">Lembrete 24 horas antes</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={remind30min}
              onChange={(e) => setRemind30min(e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            <span className="text-sm text-foreground">Lembrete 30 minutos antes</span>
          </label>
        </CardBody>
      </Card>

      {/* ── Observações ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Observações" />
        <CardBody>
          <Field label="Observação (opcional)" htmlFor="notes">
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação sobre o atendimento..."
            />
          </Field>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/agenda"
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {selectedDates.length > 1
            ? `Salvar ${selectedDates.length} atendimentos`
            : "Salvar atendimento"}
        </button>
      </div>
    </form>
  )
}
