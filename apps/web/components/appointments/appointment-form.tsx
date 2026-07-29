"use client"

import { availableTimesForDate, isDateInPastOrToday } from "@/lib/agenda"
import { appointments } from "@/lib/mock/appointments"
import { blockedSlots } from "@/lib/mock/blocked-slots"
import { customers } from "@/lib/mock/customers"
import { services } from "@/lib/mock/services"
import { businessHours } from "@/lib/mock/services"
import type { AppointmentMode, AppointmentRecurrence } from "@assistpro/types"
import { Card, CardBody, CardHeader, cn, Field, Input, RadioCard, Select, Textarea } from "@assistpro/ui"
import { CalendarCheck, Home, MapPin, Pencil, Plus, RefreshCcw, Video, X } from "lucide-react"
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

  const [customerId, setCustomerId] = useState(customers[0].id)
  const [serviceId, setServiceId] = useState(services.filter((s) => s.durationMinutes > 0)[0].id)
  const [mode, setMode] = useState<AppointmentMode>("PRESENCIAL")
  const [useDefaultLink, setUseDefaultLink] = useState(true)
  const [meetingUrl, setMeetingUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [sendConfirmationNow, setSendConfirmationNow] = useState(true)
  const [remind24h, setRemind24h] = useState(true)
  const [remind30min, setRemind30min] = useState(true)

  // Múltiplos dias
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [dateInputValue, setDateInputValue] = useState("")

  // Horário — calculado a partir do primeiro dia selecionado
  const [startTime, setStartTime] = useState("")

  // Recorrência
  const [recurring, setRecurring] = useState(false)
  const [recurrence, setRecurrence] = useState<AppointmentRecurrence>("SEMANAL")

  const service = services.find((s) => s.id === serviceId)
  const durationMins = service?.durationMinutes ?? 60

  /** Horários disponíveis para o primeiro dia selecionado. */
  const availableTimes = useMemo(() => {
    const date = selectedDates[0]
    if (!date) return []
    return availableTimesForDate(date, appointments, blockedSlots, businessHours, durationMins, NOW_ISO)
  }, [selectedDates, durationMins])

  /** Datas não disponíveis (passado ou hoje). */
  function isUnavailableDate(date: string) {
    return isDateInPastOrToday(date, TODAY)
  }

  function handleAddDate() {
    const value = dateInputValue.trim()
    if (!value) return
    if (isUnavailableDate(value)) return // impede data passada
    if (selectedDates.includes(value)) return
    const newDates = [...selectedDates, value].sort()
    setSelectedDates(newDates)
    setDateInputValue("")
    // Ao adicionar o primeiro dia, limpa o horário selecionado
    if (selectedDates.length === 0) setStartTime("")
  }

  function removeDate(date: string) {
    setSelectedDates((prev) => {
      const next = prev.filter((d) => d !== date)
      if (next.length === 0) setStartTime("")
      return next
    })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    // Em produção: POST /api/appointments com os dados abaixo
    router.push("/agenda")
  }

  const canSubmit = selectedDates.length > 0 && startTime !== "" && availableTimes.includes(startTime)

  function formatDateLabel(isoDate: string) {
    const [year, month, day] = isoDate.split("-").map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(date)
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      {/* Detalhes */}
      <Card>
        <CardHeader title="Detalhes" />
        <CardBody className="flex flex-col gap-4">
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

          <Field label="Serviço" htmlFor="service">
            <Select
              id="service"
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value)
                setStartTime("")
              }}
            >
              {services
                .filter((s) => s.durationMinutes > 0)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.durationMinutes} min
                  </option>
                ))}
            </Select>
          </Field>
        </CardBody>
      </Card>

      {/* Datas e horário */}
      <Card>
        <CardHeader
          title="Datas e horário"
          description="Selecione uma ou mais datas futuras. O horário é filtrado conforme a disponibilidade."
        />
        <CardBody className="flex flex-col gap-4">
          {/* Seletor de data */}
          <Field label="Adicionar data" htmlFor="date-input">
            <div className="flex items-center gap-2">
              <Input
                id="date-input"
                type="date"
                value={dateInputValue}
                min={
                  // min = amanhã
                  (() => {
                    const [y, mo, d] = TODAY.split("-").map(Number)
                    const tomorrow = new Date(Date.UTC(y, mo - 1, d + 1))
                    return tomorrow.toISOString().slice(0, 10)
                  })()
                }
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
                disabled={!dateInputValue || isUnavailableDate(dateInputValue) || selectedDates.includes(dateInputValue)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-4" aria-hidden="true" />
                Adicionar
              </button>
            </div>
          </Field>

          {/* Chips das datas selecionadas */}
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

          {/* Horário disponível */}
          {selectedDates.length > 0 ? (
            <Field label={`Horário disponível para ${formatDateLabel(selectedDates[0])}`} htmlFor="start-time">
              {availableTimes.length === 0 ? (
                <p className="rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground">
                  Nenhum horário livre nesta data.
                </p>
              ) : (
                <Select
                  id="start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  <option value="">Selecionar horário</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Select>
              )}
            </Field>
          ) : null}
        </CardBody>
      </Card>

      {/* Recorrência */}
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

      {/* Tipo de atendimento */}
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
                  <span className={cn("flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2.5", !useDefaultLink && "opacity-50")}>
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{DEFAULT_MEETING_URL}</span>
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

      {/* Lembretes */}
      <Card>
        <CardHeader
          title="Lembretes e confirmações"
          description="Sempre que um horário é salvo, o WhatsApp é enviado automaticamente com opção de confirmar, cancelar ou reagendar."
        />
        <CardBody className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={sendConfirmationNow} onChange={(e) => setSendConfirmationNow(e.target.checked)} className="size-4 rounded accent-primary" />
            <span className="text-sm text-foreground">Enviar confirmação agora por WhatsApp</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={remind24h} onChange={(e) => setRemind24h(e.target.checked)} className="size-4 rounded accent-primary" />
            <span className="text-sm text-foreground">Lembrete 24 horas antes</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={remind30min} onChange={(e) => setRemind30min(e.target.checked)} className="size-4 rounded accent-primary" />
            <span className="text-sm text-foreground">Lembrete 30 minutos antes</span>
          </label>
        </CardBody>
      </Card>

      {/* Observações */}
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
          disabled={!canSubmit}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selectedDates.length > 1
            ? `Salvar ${selectedDates.length} atendimentos`
            : "Salvar atendimento"}
        </button>
      </div>
    </form>
  )
}
