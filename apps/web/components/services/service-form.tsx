"use client"

import { services as initialServices } from "@/lib/mock/services"
import type { Service, ServiceColor } from "@assistpro/types"
import { Card, CardBody, CardHeader, cn, Field, Input, Select } from "@assistpro/ui"
import { Clock, Save, Users, User, X } from "lucide-react"
import { useState } from "react"

const colorOptions: { value: ServiceColor; label: string; class: string }[] = [
  { value: "emerald", label: "Verde",   class: "bg-emerald-500" },
  { value: "violet",  label: "Roxo",    class: "bg-violet-500"  },
  { value: "amber",   label: "Amarelo", class: "bg-amber-500"   },
  { value: "rose",    label: "Rosa",    class: "bg-rose-500"    },
  { value: "sky",     label: "Azul",    class: "bg-sky-500"     },
]

const durationPresets = [30, 45, 60, 90, 120]

interface Props {
  /** Serviço a editar; undefined = novo serviço */
  service?: Service
  onSave: (data: Omit<Service, "id" | "createdAt" | "updatedAt" | "deletedAt" | "price" | "active">) => void
  onCancel: () => void
}

export function ServiceForm({ service, onSave, onCancel }: Props) {
  const [name, setName] = useState(service?.name ?? "")
  const [sessionType, setSessionType] = useState<"INDIVIDUAL" | "GRUPO">(
    service?.maxGroupSize ? "GRUPO" : "INDIVIDUAL",
  )
  const [maxGroupSize, setMaxGroupSize] = useState<string>(
    service?.maxGroupSize ? String(service.maxGroupSize) : "2",
  )
  const [durationMinutes, setDurationMinutes] = useState<string>(
    service?.durationMinutes ? String(service.durationMinutes) : "60",
  )
  const [color, setColor] = useState<ServiceColor>(service?.color ?? "emerald")

  const parsedDuration = Number(durationMinutes)
  const parsedGroupSize = Number(maxGroupSize)

  const isValid =
    name.trim().length > 0 &&
    parsedDuration > 0 &&
    (sessionType === "INDIVIDUAL" || (parsedGroupSize >= 2 && parsedGroupSize <= 50))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onSave({
      name: name.trim(),
      durationMinutes: parsedDuration,
      color,
      maxGroupSize: sessionType === "GRUPO" ? parsedGroupSize : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title={service ? "Editar serviço" : "Novo serviço"}
          description="Preencha o essencial para o serviço aparecer nos agendamentos."
        />

        <CardBody className="flex flex-col gap-5">
          {/* Nome */}
          <Field label="Nome do serviço" htmlFor="svc-name" hint='Ex: Violão, Personal, Pilates'>
            <Input
              id="svc-name"
              placeholder="Nome do serviço"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </Field>

          {/* Tipo */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">Tipo de sessão</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSessionType("INDIVIDUAL")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                  sessionType === "INDIVIDUAL"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                <User className="size-4" aria-hidden="true" />
                Individual
              </button>

              <button
                type="button"
                onClick={() => setSessionType("GRUPO")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                  sessionType === "GRUPO"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                <Users className="size-4" aria-hidden="true" />
                Grupo
              </button>
            </div>
          </fieldset>

          {/* Vagas */}
          <Field
            label="Vagas por sessão"
            htmlFor="svc-slots"
            hint={
              sessionType === "INDIVIDUAL"
                ? "Sessões individuais sempre têm 1 vaga."
                : "Número máximo de participantes por sessão em grupo (mín. 2)."
            }
          >
            <Input
              id="svc-slots"
              type="number"
              inputMode="numeric"
              min={sessionType === "INDIVIDUAL" ? 1 : 2}
              max={50}
              value={sessionType === "INDIVIDUAL" ? "1" : maxGroupSize}
              disabled={sessionType === "INDIVIDUAL"}
              onChange={(e) => setMaxGroupSize(e.target.value)}
              className={cn(sessionType === "INDIVIDUAL" && "opacity-50")}
            />
          </Field>

          {/* Duração */}
          <Field
            label="Duração da sessão"
            htmlFor="svc-duration"
            hint="Tempo reservado na agenda por atendimento."
          >
            <div className="flex flex-col gap-2">
              {/* Atalhos rápidos */}
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Durações rápidas">
                {durationPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDurationMinutes(String(preset))}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
                      String(preset) === durationMinutes
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    <Clock className="size-3" aria-hidden="true" />
                    {preset >= 60 ? `${preset / 60}h` : `${preset}min`}
                  </button>
                ))}
              </div>

              {/* Ou digita */}
              <div className="flex items-center gap-2">
                <Input
                  id="svc-duration"
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={480}
                  step={5}
                  placeholder="Ou digite em minutos"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="flex-1"
                />
                <span className="shrink-0 text-sm text-muted-foreground">min</span>
              </div>
            </div>
          </Field>

          {/* Cor */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Cor na agenda</span>
            <div className="flex gap-2" role="radiogroup" aria-label="Cor do serviço">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={color === opt.value}
                  aria-label={opt.label}
                  onClick={() => setColor(opt.value)}
                  className={cn(
                    "size-7 rounded-full transition-all",
                    opt.class,
                    color === opt.value ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "opacity-60 hover:opacity-100",
                  )}
                />
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Ações */}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!isValid}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save className="size-4" aria-hidden="true" />
          {service ? "Salvar alterações" : "Criar serviço"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
        >
          <X className="size-4" aria-hidden="true" />
          Cancelar
        </button>
      </div>
    </form>
  )
}
