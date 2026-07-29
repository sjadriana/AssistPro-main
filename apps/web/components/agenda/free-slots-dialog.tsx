"use client"

import { Dialog, dialogButtonClass } from "@/components/ui/dialog"
import { buildWeek, formatSlotLabel, freeSlotsForRange, groupSlotsByDate } from "@/lib/agenda"
import { appointments } from "@/lib/mock/appointments"
import { customers } from "@/lib/mock/customers"
import { businessHours } from "@/lib/mock/services"
import { renderTemplate, slotsVars } from "@/lib/whatsapp"
import { templateById } from "@/lib/mock/messaging"
import type { FreeSlot } from "@assistpro/types"
import { Badge, Checkbox, cn, Field, Select } from "@assistpro/ui"
import { CalendarCheck, CircleSlash } from "lucide-react"
import { useMemo, useState } from "react"
import type { WhatsAppTarget } from "../messaging/send-whatsapp-dialog"

const TODAY = new Date().toISOString().slice(0, 10)
const NOW_ISO = new Date().toISOString()
/** Segunda-feira da semana atual. */
const _wk = new Date()
_wk.setUTCDate(_wk.getUTCDate() - ((_wk.getUTCDay() + 6) % 7))
const WEEK_START = _wk.toISOString().slice(0, 10)
/** Segunda-feira da semana seguinte. */
const _nwk = new Date(_wk)
_nwk.setUTCDate(_nwk.getUTCDate() + 7)
const NEXT_WEEK_START = _nwk.toISOString().slice(0, 10)

const ranges = [
  { id: "semana", label: "Esta semana" },
  { id: "proxima", label: "Próxima semana" },
] as const

type RangeId = (typeof ranges)[number]["id"]

/**
 * Seleciona horários livres da agenda e monta a mensagem para o cliente escolher.
 * O envio em si é delegado ao modal de WhatsApp, via `onContinue`.
 */
export function FreeSlotsDialog({
  open,
  onOpenChange,
  onContinue,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: (target: WhatsAppTarget) => void
}) {
  const [customerId, setCustomerId] = useState(customers[0].id)
  const [range, setRange] = useState<RangeId>("semana")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const slots = useMemo(() => {
    const dates = buildWeek(range === "semana" ? WEEK_START : NEXT_WEEK_START, TODAY).map((day) => day.date)
    return freeSlotsForRange(appointments, businessHours, dates, undefined, NOW_ISO)
  }, [range])

  const groups = useMemo(() => groupSlotsByDate(slots), [slots])

  const selectedSlots = slots.filter((slot) => selected.has(slot.id))

  function toggle(slotId: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(slotId)) next.delete(slotId)
      else next.add(slotId)
      return next
    })
  }

  function toggleDay(daySlots: FreeSlot[]) {
    const allSelected = daySlots.every((slot) => selected.has(slot.id))

    setSelected((current) => {
      const next = new Set(current)
      for (const slot of daySlots) {
        if (allSelected) next.delete(slot.id)
        else next.add(slot.id)
      }
      return next
    })
  }

  /** `useAll` ignora a seleção e manda a agenda livre inteira do período. */
  function handleContinue(useAll: boolean) {
    const chosen = useAll ? slots : selectedSlots
    if (chosen.length === 0) return

    const customer = customers.find((item) => item.id === customerId)
    if (!customer) return

    const template = templateById("HORARIOS_LIVRES")

    onContinue({
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      templateId: template.id,
      body: renderTemplate(template.body, slotsVars(customer.name, chosen)),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Enviar horários livres"
      description="O cliente responde qual prefere e você confirma na agenda"
      footer={
        <>
          <button type="button" onClick={() => onOpenChange(false)} className={dialogButtonClass.secondary}>
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => handleContinue(true)}
            disabled={slots.length === 0}
            className={dialogButtonClass.secondary}
          >
            Enviar todos ({slots.length})
          </button>

          <button
            type="button"
            onClick={() => handleContinue(false)}
            disabled={selectedSlots.length === 0}
            className={dialogButtonClass.primary}
          >
            Enviar selecionados ({selectedSlots.length})
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Cliente" htmlFor="slots-customer">
          <Select id="slots-customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">Período</legend>
          <div className="grid grid-cols-2 gap-2">
            {ranges.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setRange(item.id)
                  // Trocar de semana invalida os ids selecionados.
                  setSelected(new Set())
                }}
                aria-pressed={range === item.id}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  range === item.id
                    ? "border-primary bg-primary-soft text-accent-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        {slots.length === 0 ? (
          <p className="flex items-start gap-2 rounded-xl bg-secondary px-3 py-3 text-xs leading-relaxed text-muted-foreground">
            <CircleSlash className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Nenhum horário livre neste período. A agenda está cheia ou fora do horário de atendimento.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((group) => {
              const allSelected = group.slots.every((slot) => selected.has(slot.id))

              return (
                <div key={group.date} className="flex flex-col gap-2 rounded-xl border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">{group.label}</span>

                    <button
                      type="button"
                      onClick={() => toggleDay(group.slots)}
                      className="text-xs font-semibold text-primary transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                    >
                      {allSelected ? "Limpar dia" : "Selecionar dia"}
                      <span className="sr-only"> {group.label}</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {group.slots.map((slot) => (
                      <Checkbox
                        key={slot.id}
                        label={formatSlotLabel(slot).split(" · ")[1]}
                        checked={selected.has(slot.id)}
                        onChange={() => toggle(slot.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {selectedSlots.length > 0 ? (
          <Badge tone="primary" icon={<CalendarCheck className="size-3" aria-hidden="true" />}>
            {selectedSlots.length === 1 ? "1 horário selecionado" : `${selectedSlots.length} horários selecionados`}
          </Badge>
        ) : null}
      </div>
    </Dialog>
  )
}
