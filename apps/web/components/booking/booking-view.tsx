"use client"

import { addParticipant, countParticipants, generateClassSlots, type ClassSlot } from "@/lib/booking"
import { recurringSchedules } from "@/lib/mock/recurring-schedules"
import { cn, Field, Input } from "@assistpro/ui"
import { CalendarX, CheckCircle2, Clock, Users } from "lucide-react"
import { useMemo, useState } from "react"

interface Props {
  scheduleId: string
}

type Step = "list" | { slot: ClassSlot } | "success"

export function BookingView({ scheduleId }: Props) {
  const schedule = recurringSchedules.find((rs) => rs.id === scheduleId)

  // Participantes em memória — refrescados em cada render após inscrição
  const [version, setVersion] = useState(0)

  const slots = useMemo(() => {
    if (!schedule) return []
    return generateClassSlots(schedule, 4)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, version])

  const [step, setStep]     = useState<Step>("list")
  const [name, setName]     = useState("")
  const [phone, setPhone]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState("")

  if (!schedule) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 py-16 text-center">
        <CalendarX className="size-12 text-muted-foreground/40" aria-hidden="true" />
        <h1 className="text-xl font-bold text-foreground">Link inválido</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Este link de agendamento não foi encontrado ou expirou.
        </p>
      </main>
    )
  }

  if (step === "success") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-success-soft">
          <CheckCircle2 className="size-8 text-success-strong" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">Inscrição confirmada!</h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Você está inscrito em <strong>{schedule.serviceName}</strong>. Até lá!
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setStep("list"); setVersion((v) => v + 1) }}
          className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Ver outras turmas
        </button>
      </main>
    )
  }

  if (typeof step === "object") {
    const taken = countParticipants(step.slot.id)
    const remaining = step.slot.maxParticipants - taken
    const canSubmit = name.trim().length >= 2 && phone.trim().length >= 8 && !loading

    function handleConfirm(e: React.FormEvent) {
      e.preventDefault()
      if (typeof step !== "object") return
      setError("")
      const taken = countParticipants(step.slot.id)
      if (taken >= step.slot.maxParticipants) {
        setError("Não há mais vagas nesta turma.")
        return
      }
      setLoading(true)
      // Simula latência de rede
      setTimeout(() => {
        addParticipant(step.slot.id, { name: name.trim(), phone: phone.trim() })
        setLoading(false)
        setStep("success")
      }, 600)
    }

    return (
      <main className="flex min-h-screen flex-col bg-background">
        {/* Cabeçalho da turma selecionada */}
        <header className="border-b border-border bg-card px-4 py-5">
          <button
            type="button"
            onClick={() => setStep("list")}
            className="mb-3 text-xs font-semibold text-primary transition-opacity hover:opacity-70"
          >
            ← Voltar às turmas
          </button>
          <h1 className="text-lg font-bold text-foreground">{schedule.serviceName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{step.slot.dateLabel}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {step.slot.startTime} – {step.slot.endTime}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 font-semibold",
                remaining <= 1 ? "text-danger-strong" : "text-success-strong",
              )}
            >
              <Users className="size-3.5" aria-hidden="true" />
              {remaining} vaga{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}
            </span>
          </div>
        </header>

        {/* Formulário de inscrição */}
        <div className="flex flex-1 flex-col gap-6 px-4 py-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-foreground">Seus dados</h2>
            <p className="text-sm text-muted-foreground">
              Preencha para confirmar sua vaga nesta turma.
            </p>
          </div>

          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <Field label="Seu nome" htmlFor="bk-name">
              <Input
                id="bk-name"
                placeholder="Ex: Maria Oliveira"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </Field>

            <Field label="Celular" htmlFor="bk-phone" hint="Usado para lembrete da aula.">
              <Input
                id="bk-phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                inputMode="tel"
              />
            </Field>

            {error ? (
              <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-strong">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              {loading ? "Confirmando…" : "Confirmar inscrição"}
            </button>
          </form>
        </div>
      </main>
    )
  }

  // ── Listagem de turmas ────────────────────────────────────────────────────
  const availableSlots = slots.filter(
    (s) => countParticipants(s.id) < s.maxParticipants,
  )
  const fullSlots = slots.filter(
    (s) => countParticipants(s.id) >= s.maxParticipants,
  )

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Cabeçalho */}
      <header className="border-b border-border bg-card px-4 py-5">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Agendamento
        </p>
        <h1 className="text-xl font-bold text-foreground">{schedule.serviceName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha uma turma disponível e garanta sua vaga.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-2 px-4 py-5">
        {slots.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <CalendarX className="size-10 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Nenhuma turma disponível nas próximas semanas.
            </p>
          </div>
        ) : (
          <>
            {availableSlots.length > 0 ? (
              <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Turmas com vagas
                </h2>
                {availableSlots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    taken={countParticipants(slot.id)}
                    onSelect={() => setStep({ slot })}
                  />
                ))}
              </section>
            ) : null}

            {fullSlots.length > 0 ? (
              <section className="mt-2 flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Turmas esgotadas
                </h2>
                {fullSlots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    taken={countParticipants(slot.id)}
                    full
                  />
                ))}
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}

// ── Componente de card de turma ──────────────────────────────────────────────

interface SlotCardProps {
  slot: ClassSlot
  taken: number
  full?: boolean
  onSelect?: () => void
}

function SlotCard({ slot, taken, full = false, onSelect }: SlotCardProps) {
  const remaining = slot.maxParticipants - taken
  const isAlmostFull = remaining <= 2 && !full

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 transition-colors",
        full
          ? "border-border bg-card opacity-50"
          : "border-border bg-card hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground">{slot.dateLabel}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" aria-hidden="true" />
            {slot.startTime} – {slot.endTime}
          </span>
        </div>

        {/* Indicador de vagas */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold",
            full
              ? "bg-secondary text-muted-foreground"
              : isAlmostFull
              ? "bg-warning-soft text-warning-strong"
              : "bg-success-soft text-success-strong",
          )}
          aria-label={full ? "Esgotado" : `${remaining} vagas restantes`}
        >
          <Users className="size-3" aria-hidden="true" />
          {full ? "Esgotado" : `${remaining} / ${slot.maxParticipants}`}
        </div>
      </div>

      {/* Barra de ocupação */}
      <div
        role="progressbar"
        aria-valuenow={taken}
        aria-valuemin={0}
        aria-valuemax={slot.maxParticipants}
        aria-label={`${taken} de ${slot.maxParticipants} vagas preenchidas`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            full ? "bg-muted-foreground/30" : isAlmostFull ? "bg-warning" : "bg-success",
          )}
          style={{ width: `${Math.min((taken / slot.maxParticipants) * 100, 100)}%` }}
        />
      </div>

      {!full ? (
        <button
          type="button"
          onClick={onSelect}
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Quero participar
        </button>
      ) : (
        <p className="text-center text-xs text-muted-foreground">Esta turma está lotada.</p>
      )}
    </article>
  )
}
