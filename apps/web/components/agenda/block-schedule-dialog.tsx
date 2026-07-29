"use client"

import { Dialog, dialogButtonClass } from "@/components/ui/dialog"
import type { BlockedSlot, CreateBlockedSlotInput } from "@assistpro/types"
import { Field, Input, Textarea } from "@assistpro/ui"
import { Ban } from "lucide-react"
import { useState } from "react"

const TODAY = new Date().toISOString().slice(0, 10)

type BlockType = "horario" | "dia" | "mes"

const blockTypes: { value: BlockType; label: string; description: string }[] = [
  { value: "horario", label: "Horário específico", description: "Bloqueia um intervalo de horas em um dia." },
  { value: "dia", label: "Dia inteiro", description: "Nenhum atendimento pode ser marcado neste dia." },
  { value: "mes", label: "Mês inteiro", description: "Bloqueia todo o mês selecionado." },
]

function tomorrowDate() {
  const [y, mo, d] = TODAY.split("-").map(Number)
  return new Date(Date.UTC(y, mo - 1, d + 1)).toISOString().slice(0, 10)
}

export function BlockScheduleDialog({
  open,
  onOpenChange,
  onBlock,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Chamado quando o bloqueio é confirmado. */
  onBlock: (input: CreateBlockedSlotInput) => void
}) {
  const [blockType, setBlockType] = useState<BlockType>("dia")
  const [date, setDate] = useState("")
  const [monthValue, setMonthValue] = useState("")
  const [startTime, setStartTime] = useState("07:00")
  const [endTime, setEndTime] = useState("08:00")
  const [reason, setReason] = useState("")

  function buildInput(): CreateBlockedSlotInput | null {
    if (blockType === "mes") {
      if (!monthValue) return null
      const [year, month] = monthValue.split("-").map(Number)
      const firstDay = `${monthValue}-01`
      const lastDay = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10) // dia 0 do mês seguinte = último do mês atual
      return {
        startsAt: new Date(`${firstDay}T00:00:00.000-03:00`).toISOString(),
        endsAt: new Date(`${lastDay}T23:59:59.000-03:00`).toISOString(),
        allDay: true,
        reason: reason.trim() || null,
      }
    }

    if (!date) return null

    if (blockType === "dia") {
      return {
        startsAt: new Date(`${date}T00:00:00.000-03:00`).toISOString(),
        endsAt: new Date(`${date}T23:59:59.000-03:00`).toISOString(),
        allDay: true,
        reason: reason.trim() || null,
      }
    }

    // horario
    if (!startTime || !endTime || startTime >= endTime) return null
    return {
      startsAt: new Date(`${date}T${startTime}:00.000-03:00`).toISOString(),
      endsAt: new Date(`${date}T${endTime}:00.000-03:00`).toISOString(),
      allDay: false,
      reason: reason.trim() || null,
    }
  }

  const input = buildInput()

  function handleConfirm() {
    if (!input) return
    onBlock(input)
    onOpenChange(false)
    // Reset
    setDate("")
    setMonthValue("")
    setStartTime("07:00")
    setEndTime("08:00")
    setReason("")
  }

  const minDate = tomorrowDate()

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Bloquear agenda"
      description="O período bloqueado não aparece como disponível para novos atendimentos."
      footer={
        <>
          <button type="button" onClick={() => onOpenChange(false)} className={dialogButtonClass.secondary}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!input}
            className={dialogButtonClass.danger}
          >
            <Ban className="size-4" aria-hidden="true" />
            Bloquear
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Tipo de bloqueio */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">Tipo de bloqueio</legend>
          <div className="flex flex-col gap-2">
            {blockTypes.map((item) => (
              <label key={item.value} className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="radio"
                  name="blockType"
                  value={item.value}
                  checked={blockType === item.value}
                  onChange={() => setBlockType(item.value)}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Mês */}
        {blockType === "mes" ? (
          <Field label="Mês" htmlFor="block-month">
            <Input
              id="block-month"
              type="month"
              value={monthValue}
              min={TODAY.slice(0, 7)}
              onChange={(e) => setMonthValue(e.target.value)}
            />
          </Field>
        ) : (
          <Field label="Data" htmlFor="block-date">
            <Input
              id="block-date"
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        )}

        {/* Intervalo de horas (só para horário específico) */}
        {blockType === "horario" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Das" htmlFor="block-start">
              <Input
                id="block-start"
                type="time"
                value={startTime}
                min="07:00"
                max="18:00"
                step={1800}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Field>
            <Field label="Até" htmlFor="block-end">
              <Input
                id="block-end"
                type="time"
                value={endTime}
                min={startTime}
                max="18:00"
                step={1800}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Field>
          </div>
        ) : null}

        {/* Motivo */}
        <Field label="Motivo (opcional)" htmlFor="block-reason">
          <Textarea
            id="block-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: Reunião administrativa, folga, viagem..."
          />
        </Field>
      </div>
    </Dialog>
  )
}
