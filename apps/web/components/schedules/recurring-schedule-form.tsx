"use client"

import { services } from "@/lib/mock/services"
import type { RecurringSchedule, Weekday } from "@assistpro/types"
import { cn, Field, Input, Select, Switch } from "@assistpro/ui"
import { MapPin, Pencil, Video } from "lucide-react"
import { useState } from "react"

type ScheduleMode = "PRESENCIAL" | "ONLINE"

const DEFAULT_ADDRESS = "Rua das Flores, 123 — São Paulo, SP"
const DEFAULT_MEETING_URL = "https://meet.google.com/abc-defg-hij"

const weekdays: { value: Weekday; label: string; short: string }[] = [
  { value: "SEG", label: "Segunda",  short: "Seg" },
  { value: "TER", label: "Terça",    short: "Ter" },
  { value: "QUA", label: "Quarta",   short: "Qua" },
  { value: "QUI", label: "Quinta",   short: "Qui" },
  { value: "SEX", label: "Sexta",    short: "Sex" },
  { value: "SAB", label: "Sábado",   short: "Sáb" },
  { value: "DOM", label: "Domingo",  short: "Dom" },
]

interface Props {
  initial?: RecurringSchedule
  onSave: (data: Omit<RecurringSchedule, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function RecurringScheduleForm({ initial, onSave, onCancel }: Props) {
  const groupServices = services.filter((s) => s.durationMinutes > 0)

  const [serviceId, setServiceId]         = useState(initial?.serviceId ?? groupServices[0]?.id ?? "")
  const [selectedDays, setSelectedDays]   = useState<Weekday[]>(initial?.weekdays ?? [])
  const [startTime, setStartTime]         = useState(initial?.startTime ?? "07:00")
  const [endTime, setEndTime]             = useState(initial?.endTime ?? "08:00")
  const [maxParticipants, setMaxParticipants] = useState(String(initial?.maxParticipants ?? 6))
  const [active, setActive]               = useState(initial?.active ?? true)
  const [scheduleMode, setScheduleMode]   = useState<ScheduleMode>("PRESENCIAL")
  const [useDefaultAddress, setUseDefaultAddress] = useState(true)
  const [customAddress, setCustomAddress] = useState("")
  const [useDefaultLink, setUseDefaultLink] = useState(true)
  const [meetingUrl, setMeetingUrl]       = useState("")

  const service = groupServices.find((s) => s.id === serviceId)
  const maxAllowed = service?.maxGroupSize ?? 50

  function toggleDay(day: Weekday) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedDays.length === 0) return
    const svc = groupServices.find((s) => s.id === serviceId)
    onSave({
      serviceId,
      serviceName: svc?.name ?? "",
      weekdays:     selectedDays,
      startTime,
      endTime,
      maxParticipants: Math.min(Number(maxParticipants) || 1, maxAllowed),
      active,
    })
  }

  const canSubmit = serviceId && selectedDays.length > 0 && startTime && endTime && Number(maxParticipants) >= 1

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Serviço */}
      <Field label="Serviço" htmlFor="rs-service">
        <Select
          id="rs-service"
          value={serviceId}
          onChange={(e) => {
            setServiceId(e.target.value)
            const svc = groupServices.find((s) => s.id === e.target.value)
            if (svc?.maxGroupSize && Number(maxParticipants) > svc.maxGroupSize) {
              setMaxParticipants(String(svc.maxGroupSize))
            }
          }}
        >
          {groupServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.maxGroupSize ? ` (grupo, até ${s.maxGroupSize})` : " (individual)"}
            </option>
          ))}
        </Select>
      </Field>

      {/* Dias da semana */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">Dias da semana</legend>
        <div className="flex flex-wrap gap-2">
          {weekdays.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDay(d.value)}
              aria-pressed={selectedDays.includes(d.value)}
              className={cn(
                "min-w-[3rem] rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                selectedDays.includes(d.value)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              {d.short}
            </button>
          ))}
        </div>
        {selectedDays.length === 0 && (
          <p className="mt-1.5 text-xs text-danger-strong">Selecione ao menos um dia.</p>
        )}
      </fieldset>

      {/* Horários */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Início" htmlFor="rs-start">
          <Input
            id="rs-start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </Field>
        <Field label="Fim" htmlFor="rs-end">
          <Input
            id="rs-end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Field>
      </div>

      {/* Vagas */}
      <Field
        label="Vagas por sessão"
        htmlFor="rs-max"
        hint={maxAllowed < 50 ? `Máximo configurado no serviço: ${maxAllowed}` : undefined}
      >
        <Input
          id="rs-max"
          type="number"
          min={1}
          max={maxAllowed}
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
        />
      </Field>

      {/* Modo: Presencial ou Online */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">Modalidade</legend>

        <div className="grid grid-cols-2 gap-2">
          {(["PRESENCIAL", "ONLINE"] as ScheduleMode[]).map((m) => {
            const Icon = m === "ONLINE" ? Video : MapPin
            const label = m === "ONLINE" ? "Online" : "Presencial"
            return (
              <button
                key={m}
                type="button"
                onClick={() => setScheduleMode(m)}
                aria-pressed={scheduleMode === m}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                  scheduleMode === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </div>

        {scheduleMode === "PRESENCIAL" ? (
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="radio"
                name="rs-addressOption"
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
                name="rs-addressOption"
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
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="radio"
                name="rs-linkOption"
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
                name="rs-linkOption"
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
          </div>
        )}
      </fieldset>

      {/* Status da grade (só visível ao editar) */}
      {initial ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">Grade ativa</span>
            <span className="text-xs text-muted-foreground">
              {active
                ? "Aparece na vitrine e aceita inscrições."
                : "Oculta da vitrine. Nenhuma nova inscrição será aceita."}
            </span>
          </div>
          <Switch
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            label="Ativar grade"
            hideLabel
          />
        </div>
      ) : null}

      {/* Ações */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {initial ? "Salvar alterações" : "Criar grade"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
